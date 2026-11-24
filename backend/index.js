import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hastane_ilan_super_gizli_jwt_anahtari_2026_staj_guvenlik_kodu_!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Güvenlik & JSON ayrıştırma
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Veritabanı Havuzu
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hastane_ilan_db',
  password: process.env.DB_PASSWORD || '123',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Türkçe karakter duyarlı isim büyütme
function capitalizeTurkish(str) {
  if (!str) return '';
  return str
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}

// Güçlü şifre denetimi (En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter)
function isStrongPassword(password) {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-ZÇĞİÖŞÜ]/.test(password);
  const hasLowerCase = /[a-zçğıöşü]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// Veritabanı İlk Başlatma (Görev 01-04 Kapsamı)
async function initDb() {
  try {
    // 1. Users Tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee' NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Audit Logs Tablosu (Denetim Kayıtları)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Varsayılan Admin Hesabı Kontrolü
    const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@hastane.gov.tr']);
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedAdminPassword = await bcrypt.hash('Admin123!', salt);
      await pool.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['Sistem', 'Yöneticisi', 'admin@hastane.gov.tr', hashedAdminPassword, 'admin', 'active']);
      console.log('👑 Varsayılan Admin hesabı oluşturuldu (admin@hastane.gov.tr / Admin123!)');
    }

    // Varsayılan Çalışan Hesabı Kontrolü
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['doktor@hastane.gov.tr']);
    if (userCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedUserPassword = await bcrypt.hash('Sifre123!', salt);
      await pool.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['Ahmet', 'Yılmaz', 'doktor@hastane.gov.tr', hashedUserPassword, 'employee', 'active']);
      console.log('🩺 Varsayılan Çalışan hesabı oluşturuldu (doktor@hastane.gov.tr / Sifre123!)');
    }

    console.log('✅ Veritabanı tabloları ("users", "audit_logs") hazır ve güncel!');
  } catch (err) {
    console.error('❌ Veritabanı başlatma hatası:', err);
  }
}

initDb();

// Rate Limiter'lar
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Çok fazla hatalı giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { error: 'Çok fazla kayıt denemesi yapıldı. Lütfen daha sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT Doğrulama Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor. Yetki tokenı bulunamadı.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın.' });
    }
    req.user = decodedUser;
    next();
  });
}

// Admin Yetki Kontrol Middleware
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Erişim reddedildi. Bu işlem için yönetici yetkisi gereklidir.' });
  }
  next();
}

// -------------------------------------------------------------
// GÖREV 02: KAYIT OL (REGISTER)
// -------------------------------------------------------------
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, kvkkApproved } = req.body;

    // 1. Alan Zorunluluk Kontrolleri
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    // 2. Ad ve Soyad Kontrolü (Minimum 2 karakter, tek harf veya boşluk kabul edilmez)
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (trimmedFirst.length < 2 || trimmedLast.length < 2) {
      return res.status(400).json({ error: 'Ad ve soyad en az 2 karakter olmalıdır.' });
    }

    const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;
    if (!nameRegex.test(trimmedFirst) || !nameRegex.test(trimmedLast)) {
      return res.status(400).json({ error: 'Ad ve soyad yalnızca harflerden oluşmalıdır.' });
    }

    // 3. KVKK Aydınlatma Metni Kontrolü
    if (kvkkApproved !== true) {
      return res.status(400).json({ error: 'Kayıt olabilmek için KVKK Aydınlatma Metnini onaylamanız gerekmektedir.' });
    }

    // 4. E-posta Format Kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi girin.' });
    }

    // 5. Şifre Gücü ve Eşleşme Kontrolü
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Şifreniz en az 8 karakter olmalı; en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.'
      });
    }

    // 6. E-posta Benzersizlik Kontrolü
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten bulunmaktadır.' });
    }

    // 7. Parola Hashleme & Veritabanına Kayıt (Daima 'employee' ve 'pending' durumunda)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const formattedFirstName = capitalizeTurkish(trimmedFirst);
    const formattedLastName = capitalizeTurkish(trimmedLast);

    const insertResult = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'employee', 'pending')
       RETURNING id, first_name, last_name, email, role, status, created_at`,
      [formattedFirstName, formattedLastName, cleanEmail, passwordHash]
    );

    const newUser = insertResult.rows[0];

    // Denetim Günlüğü Kaydı
    await pool.query(
      `INSERT INTO audit_logs (action, target_user_id, reason, details)
       VALUES ($1, $2, $3, $4)`,
      ['REGISTER_APPLICATION', newUser.id, 'Yeni personel kayıt başvurusu oluşturuldu.', { email: cleanEmail }]
    );

    return res.status(201).json({
      message: 'Kayıt başvurunuz başarıyla alındı. Yönetici onayının ardından sisteme giriş yapabilirsiniz.',
      user: {
        id: newUser.id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        status: newUser.status,
      }
    });

  } catch (err) {
    console.error('Kayıt Hatası:', err);
    return res.status(500).json({ error: 'Sunucu hatası nedeniyle kayıt yapılamadı.' });
  }
});

// -------------------------------------------------------------
// GÖREV 03: GİRİŞ YAP (LOGIN) & KULLANICI BİLGİSİ
// -------------------------------------------------------------
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre alanları zorunludur.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const user = userResult.rows[0];

    // Şifre Doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    // Hesap Durumu Kontrolü (Başarı kontrol listesi: Bekleyen ve askıdaki hesaplar engellenmeli)
    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Hesabınız henüz yönetici tarafından onaylanmamıştır. Lütfen onay bekleyin.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Hesabınız askıya alınmıştır. Detaylı bilgi için kurum yöneticisiyle iletişime geçin.'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        error: 'Kayıt başvurunuz reddedilmiştir.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Hesabınız aktif durumda değildir.'
      });
    }

    // JWT Token Üretimi
    const tokenPayload = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      message: 'Giriş başarılı.',
      token,
      user: tokenPayload
    });

  } catch (err) {
    console.error('Giriş Hatası:', err);
    return res.status(500).json({ error: 'Sunucu hatası nedeniyle giriş yapılamadı.' });
  }
});

// Oturum Doğrulama Endpoint'i (Frontend token kontrolü için)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, role, status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const user = userResult.rows[0];

    // Hesap askıya alınmışsa oturumu sonlandır
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Hesabınız aktif değildir.' });
    }

    return res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Me Endpoint Hatası:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// -------------------------------------------------------------
// GÖREV 04: YÖNETİM › KULLANICILAR (ADMIN USERS)
// -------------------------------------------------------------

// Kullanıcıları Listeleme & Filtreleme (Yalnızca Admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let queryText = 'SELECT id, first_name, last_name, email, role, status, created_at, updated_at FROM users';
    const queryParams = [];
    const whereClauses = [];

    if (status && status !== 'all') {
      queryParams.push(status);
      whereClauses.push(`status = $${queryParams.length}`);
    }

    if (search && search.trim() !== '') {
      queryParams.push(`%${search.trim().toLowerCase()}%`);
      whereClauses.push(`(LOWER(first_name) LIKE $${queryParams.length} OR LOWER(last_name) LIKE $${queryParams.length} OR LOWER(email) LIKE $${queryParams.length})`);
    }

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await pool.query(queryText, queryParams);
    return res.json({ users: result.rows });
  } catch (err) {
    console.error('Admin Kullanıcı Listeleme Hatası:', err);
    return res.status(500).json({ error: 'Kullanıcılar getirilemedi.' });
  }
});

// Kullanıcı Durumunu Güncelleme (Onayla, Reddet, Askıya Al, Etkinleştir)
app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { action, reason } = req.body; // 'APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE'

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı kimliği.' });
    }

    // Hedef kullanıcıyı bul
    const userCheck = await client.query('SELECT * FROM users WHERE id = $1', [targetUserId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    const targetUser = userCheck.rows[0];

    // Admin kendi kendini askıya alamaz veya reddedemez
    if (targetUser.id === req.user.id && (action === 'SUSPEND' || action === 'REJECT')) {
      return res.status(400).json({ error: 'Yönetici kendi hesabını askıya alamaz veya reddedemez.' });
    }

    let newStatus = '';
    let auditAction = '';

    if (action === 'APPROVE') {
      newStatus = 'active';
      auditAction = 'APPROVE_USER';
    } else if (action === 'REJECT') {
      if (!reason || reason.trim().length < 5) {
        return res.status(400).json({ error: 'Ret işlemi için en az 5 karakterlik geçerli bir gerekçe belirtilmelidir.' });
      }
      newStatus = 'rejected';
      auditAction = 'REJECT_USER';
    } else if (action === 'SUSPEND') {
      newStatus = 'suspended';
      auditAction = 'SUSPEND_USER';
    } else if (action === 'ACTIVATE') {
      newStatus = 'active';
      auditAction = 'ACTIVATE_USER';
    } else {
      return res.status(400).json({ error: 'Geçersiz işlem türü.' });
    }

    // Atomik Transaction Başlat
    await client.query('BEGIN');

    // 1. Durumu güncelle
    await client.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, targetUserId]
    );

    // 2. Denetim günlüğüne kaydet (Audit Log)
    await client.query(
      `INSERT INTO audit_logs (action, target_user_id, performed_by, reason, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        auditAction,
        targetUserId,
        req.user.id,
        reason || null,
        { previousStatus: targetUser.status, newStatus, performedByEmail: req.user.email }
      ]
    );

    await client.query('COMMIT');

    return res.json({
      message: `Kullanıcı durumu başarıyla güncellendi: ${newStatus}`,
      user: { id: targetUserId, status: newStatus }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Kullanıcı durum güncelleme hatası:', err);
    return res.status(500).json({ error: 'Durum güncellenirken bir hata oluştu.' });
  } finally {
    client.release();
  }
});

// Bir Kullanıcının Denetim Geçmişini Getirme (Audit Logs)
app.get('/api/admin/users/:id/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const result = await pool.query(
      `SELECT al.*, u.first_name as performed_by_first_name, u.last_name as performed_by_last_name
       FROM audit_logs al
       LEFT JOIN users u ON al.performed_by = u.id
       WHERE al.target_user_id = $1
       ORDER BY al.created_at DESC`,
      [targetUserId]
    );
    return res.json({ logs: result.rows });
  } catch (err) {
    console.error('Log getirme hatası:', err);
    return res.status(500).json({ error: 'Denetim kayıtları alınamadı.' });
  }
});

// Sunucuyu Dinleme
app.listen(PORT, () => {
  console.log(`🚀 Sunucu port ${PORT} üzerinde çalışıyor.`);
});
