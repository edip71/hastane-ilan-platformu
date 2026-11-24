import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import crypto from 'crypto';

dotenv.config();

const app = express();

// YARDIMCI FONKSİYON: Türkçe karakter duyarlı isim büyük harf standardizasyonu
// "osman yılmaz" → "Osman Yılmaz" | "İ/ı" ve "i" Türkçe kurallarına göre işlenir
function capitalizeTurkish(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\s+/g, ' ') // çoklu boşlukları tek boşluğa indir
    .split(' ')
    .map(word => {
      if (!word) return '';
      const firstChar = word[0];
      // Türkçe özel büyük harf kuralları: i→İ, ı→I
      let upperFirst;
      if (firstChar === 'i') upperFirst = 'İ';
      else if (firstChar === 'ı') upperFirst = 'I';
      else upperFirst = firstChar.toLocaleUpperCase('tr-TR');
      // Geri kalan harfler küçük (tr-TR kuralıyla: İ→i, I→ı)
      return upperFirst + word.slice(1).toLocaleLowerCase('tr-TR');
    })
    .join(' ');
}
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hastane_varsayilan_yedek_gizli_anahtar';

// Güvenlik: HTTP Header Zırhı (Helmet) - XSS, clickjacking ve MIME sniffing engeli
app.use(helmet());

// Güvenlik: Giriş denemeleri için sıkı Kaba Kuvvet (Brute-Force) sınırlaması (15 dakikada maks 10 deneme)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Çok fazla hatalı giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Güvenlik: Kayıt için Spam Koruması (15 dakikada maks 20 istek)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Güvenlik: Şifre Sıfırlama İstekleri için Kötüye Kullanım / Spam Engeli (15 dakikada maks 5 istek)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Çok fazla şifre sıfırlama talebinde bulundunuz. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware'ler
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Güvenlik: Aşırı büyük gövde saldırılarını engellemek için sınır

// PostgreSQL Bağlantı Havuzu (Connection Pool)
const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'hastane_ilan_db',
});

// Veritabanı bağlantı testi ve users tablosunun otomatik kontrolü
async function initDb() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL veritabanına başarıyla bağlandı!');

    // Tablo henüz pgAdmin'de açılmadıysa bile otomatik oluşturalım:
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee' NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        performed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ "users", "audit_logs" ve "password_resets" tabloları hazır!');
    client.release();
  } catch (err) {
    console.error('❌ Veritabanı bağlantı hatası:', err.message);
  }
}

initDb();

// Test endpoint'i
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hastane İlan API çalışıyor.' });
});

// GÖREV 02: KAYIT OL (REGISTER) ENDPOINT'İ
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // 1. Boş alan kontrolü
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
    }

    // Karakter uzunluğu güvenlik kontrolleri (Buffer overflow / DB şişirme engeli)
    if (firstName.length > 50 || lastName.length > 50) {
      return res.status(400).json({ error: 'Ad veya soyad 50 karakterden uzun olamaz.' });
    }

    if (password.length > 100) {
      return res.status(400).json({ error: 'Şifre en fazla 100 karakter olabilir.' });
    }

    // 2. Şifre eşleşme kontrolü
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Girdiğiniz şifreler birbiriyle uyuşmuyor.' });
    }

    // 3. Şifre uzunluğu
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifreniz en az 6 karakter olmalıdır.' });
    }

    // 4. Kurumsal e-posta veya e-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz.' });
    }

    // 5. E-posta daha önce kullanılmış mı?
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten var.' });
    }

    // 6. Şifreyi hash'leme (bcrypt ile güvenli saklama)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 7. Görev 02 Kuralı: Dışarıdan admin/moderator gönderilse bile HESAP HER ZAMAN 'employee' ve 'pending' olacak!
    // İsimler Türkçe karakter duyarlı büyük harf standardizasyonundan geçirilir ("osman" → "Osman")
    const cleanFirstName = capitalizeTurkish(firstName);
    const cleanLastName = capitalizeTurkish(lastName);

    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'employee', 'pending')
       RETURNING id, first_name, last_name, email, role, status, created_at`,
      [cleanFirstName, cleanLastName, email.toLowerCase().trim(), passwordHash]
    );

    // 8. Başarı yanıtı
    res.status(201).json({
      success: true,
      message: 'Kaydınız başarıyla alındı. Yönetici onayı bekleniyor.',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Sunucuda bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// GÖREV 03: GİRİŞ YAP (LOGIN) ENDPOINT'İ
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Boş alan kontrolü
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre alanları zorunludur.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Kullanıcıyı bul
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash, role, status FROM users WHERE email = $1',
      [cleanEmail]
    );

    // Güvenlik İlkesi: Kullanıcı bulunamazsa şifre kontrolü yapılmadan çıkılır,
    // ancak saldırganın e-postanın kayıtlı olup olmadığını anlamaması için genel mesaj verilir.
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre girdiniz.' });
    }

    const user = userResult.rows[0];

    // 3. Şifre doğrulama (bcrypt karşılaştırması)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre girdiniz.' });
    }

    // 4. PDF Kuralı: Hesap Onay Durumu Kontrolleri
    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Hesabınız henüz yönetici tarafından onaylanmamıştır. Lütfen onay sürecini bekleyin.',
        statusCode: 'ACCOUNT_PENDING',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Hesabınız askıya alınmıştır. Kurum yönetimi ile iletişime geçiniz.',
        statusCode: 'ACCOUNT_SUSPENDED',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Hesabınız aktif durumda değildir.',
        statusCode: 'ACCOUNT_INACTIVE',
      });
    }

    // 5. Güvenli JWT (JSON Web Token) Oturum Anahtarı Üretimi
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 6. Başarılı Giriş Yanıtı (Şifre hash'i asla geri dönülmez!)
    res.json({
      success: true,
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Sunucuda bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// GÖREV 05: ŞİFREMİ UNUTTUM & SIFIRLAMA ENDPOINT'LERİ

// 1. Şifre Sıfırlama Talebi Gönder
app.post('/api/auth/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi girin.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // KVKK & Güvenlik Kuralı (Anti-Enumeration):
    // Kullanıcı varsa veya yoksa aynı başarı mesajı döner. Böylece saldırganlar hastane maillerini tarayamaz.
    const genericSuccessResponse = {
      success: true,
      message: 'Eğer bu kurumsal e-posta adresi sistemimizde kayıtlı ise, şifre sıfırlama bağlantısı gönderilmiştir.',
    };

    const userResult = await pool.query('SELECT id, email, status FROM users WHERE email = $1', [cleanEmail]);

    if (userResult.rows.length === 0) {
      return res.json(genericSuccessResponse);
    }

    const targetUser = userResult.rows[0];

    // Hesap onaylanmamış veya askıdaysa şifre sıfırlama linki oluşturulmaz
    if (targetUser.status !== 'active') {
      return res.json(genericSuccessResponse);
    }

    // Kriptografik rastgele ve güvenli tek kullanımlık token üretimi (64 karakter hex)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Geçerlilik süresi: Tam 15 dakika (900.000 ms)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Varsa bu kullanıcının daha önceki kullanılmamış eski tokenlarını geçersiz kıl
    await pool.query('UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE', [targetUser.id]);

    // Yeni token kaydı
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at, used)
       VALUES ($1, $2, $3, FALSE)`,
      [targetUser.id, resetToken, expiresAt]
    );

    const resetLink = `http://localhost:5173/sifremi-sifirla/${resetToken}`;
    console.log(`\n🔑 [ŞİFRE SIFIRLAMA TALEBİ] E-posta: ${cleanEmail}`);
    console.log(`🔗 Sıfırlama Bağlantısı: ${resetLink}`);
    console.log(`⏳ Geçerlilik Süresi: 15 dakika\n`);

    // Geliştirme ortamında kolay test edilebilmesi için devToken da yanıta eklenir
    return res.json({
      ...genericSuccessResponse,
      devToken: resetToken,
      resetLink,
    });
  } catch (error) {
    console.error('Şifre sıfırlama talebi hatası:', error);
    res.status(500).json({ error: 'Sunucuda bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// 2. Sıfırlama Token'ının Geçerliliğini Doğrula
app.get('/api/auth/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({ valid: false, error: 'Geçersiz veya bozuk sıfırlama bağlantısı.' });
    }

    const tokenResult = await pool.query(
      `SELECT pr.id, pr.user_id, pr.expires_at, pr.used, u.email, u.first_name, u.last_name
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'Sıfırlama bağlantısı bulunamadı veya geçersiz.' });
    }

    const record = tokenResult.rows[0];

    if (record.used) {
      return res.status(400).json({ valid: false, error: 'Bu sıfırlama bağlantısı daha önce kullanılmış.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ valid: false, error: 'Sıfırlama bağlantısının süresi dolmuş (15 dakika sınırı).' });
    }

    return res.json({
      valid: true,
      message: 'Bağlantı geçerli.',
      email: record.email,
      firstName: record.first_name,
    });
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(500).json({ valid: false, error: 'Sunucu hatası oluştu.' });
  }
});

// 3. Yeni Şifreyi Kaydet ve Token'ı İptal Et
app.post('/api/auth/reset-password', async (req, res) => {
  const client = await pool.connect();
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Girdiğiniz yeni şifreler birbiriyle uyuşmuyor.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifreniz en az 6 karakter olmalıdır.' });
    }

    // Token kontrolü
    const tokenResult = await client.query(
      `SELECT pr.id, pr.user_id, pr.expires_at, pr.used
       FROM password_resets pr
       WHERE pr.token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Geçersiz veya bulunamayan sıfırlama bağlantısı.' });
    }

    const record = tokenResult.rows[0];

    if (record.used) {
      return res.status(400).json({ error: 'Bu bağlantı daha önce kullanılmış. Lütfen yeni talepte bulunun.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: 'Bu bağlantının süresi dolmuştur (15 dakika). Lütfen yeni talepte bulunun.' });
    }

    // Şifreyi bcrypt ile güvenli hash'le
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atomik Transaction: Şifreyi güncelle ve token'ı used=true yap
    await client.query('BEGIN');

    await client.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newPasswordHash, record.user_id]
    );

    await client.query(
      `UPDATE password_resets SET used = TRUE WHERE id = $1`,
      [record.id]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi! Yeni şifrenizle kurumsal giriş yapabilirsiniz.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Şifre güncelleme hatası:', error);
    res.status(500).json({ error: 'Şifre güncellenirken sunucuda bir hata oluştu.' });
  } finally {
    client.release();
  }
});

// Güvenlik Middleware'i: Token ve Oturum Doğrulama
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Oturum bilgisi bulunamadı. Lütfen giriş yapın.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Oturum süreniz dolmuş veya geçersiz. Lütfen tekrar giriş yapın.' });
    }
    req.user = decoded;
    next();
  });
}

// Güvenlik Middleware'i: Sadece Yetkili Roller (Admin / Moderator) Erişebilir
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Bu işlem için yetkiniz bulunmamaktadır. Yalnızca yetkili yöneticiler erişebilir.',
        statusCode: 'FORBIDDEN_ROLE',
      });
    }
    next();
  };
}

// ---------------- GÖREV 04: YÖNETİM › KULLANICILAR API'LERİ ----------------

// 1. Kullanıcıları Listele (Arama, Durum Filtresi)
app.get('/api/admin/users', authenticateToken, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { status, search } = req.query;

    let queryText = `
      SELECT id, first_name, last_name, email, role, status, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const queryParams = [];

    // Durum filtresi (pending, active, suspended)
    if (status && status !== 'all') {
      queryParams.push(status);
      queryText += ` AND status = $${queryParams.length}`;
    }

    // Arama (Ad, Soyad veya E-posta) - SQL Injection korumalı parametreli sorgu
    if (search && search.trim() !== '') {
      queryParams.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(first_name) LIKE $${queryParams.length} OR LOWER(last_name) LIKE $${queryParams.length} OR LOWER(email) LIKE $${queryParams.length})`;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await pool.query(queryText, queryParams);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı listesi alınırken sunucu hatası oluştu.' });
  }
});

// 2. Kullanıcı Durumunu Güncelle (Onayla, Reddet, Askıya Al, Etkinleştir)
app.patch('/api/admin/users/:id/status', authenticateToken, requireRole('admin', 'moderator'), async (req, res) => {
  const client = await pool.connect();
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { action, reason } = req.body; // 'APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE'

    if (!targetUserId || isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı kimliği.' });
    }

    // Hedef kullanıcıyı bul
    const userCheck = await client.query('SELECT id, role, status, email FROM users WHERE id = $1', [targetUserId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const targetUser = userCheck.rows[0];

    // Güvenlik Kuralı: Son kalan adminin durumu düşürülemez veya askıya alınamaz
    if (targetUser.role === 'admin' && (action === 'SUSPEND' || action === 'REJECT')) {
      const adminCountResult = await client.query("SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active'");
      if (parseInt(adminCountResult.rows[0].count, 10) <= 1) {
        return res.status(400).json({ error: 'Sistemde en az bir aktif yönetici bulunmalıdır. Bu yönetici askıya alınamaz.' });
      }
    }

    // PDF Kuralı: Ret gerekçesi zorunludur
    if (action === 'REJECT' && (!reason || reason.trim().length < 5)) {
      return res.status(400).json({ error: 'Başvuruyu reddederken en az 5 karakterlik geçerli bir gerekçe belirtmelisiniz.' });
    }

    let newStatus = '';
    if (action === 'APPROVE' || action === 'ACTIVATE') newStatus = 'active';
    else if (action === 'SUSPEND') newStatus = 'suspended';
    else if (action === 'REJECT') newStatus = 'rejected';
    else {
      return res.status(400).json({ error: 'Geçersiz durum eylemi.' });
    }

    // Transaction Başlat: Kullanıcı durumu ile Audit Log aynı anda güvenle yazılır
    await client.query('BEGIN');

    await client.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, targetUserId]
    );

    await client.query(
      `INSERT INTO audit_logs (performed_by_id, target_user_id, action, reason)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, targetUserId, action, reason ? reason.trim() : null]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Kullanıcı durumu başarıyla güncellendi: ${newStatus}`,
      user: { id: targetUserId, status: newStatus },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Kullanıcı durum güncelleme hatası:', error);
    res.status(500).json({ error: 'İşlem gerçekleştirilemedi. Veritabanı geri alındı.' });
  } finally {
    client.release();
  }
});

// 3. Kullanıcı İşlem Geçmişi (Audit Logs)
app.get('/api/admin/users/:id/logs', authenticateToken, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const result = await pool.query(
      `SELECT a.id, a.action, a.reason, a.created_at,
              u.first_name as performed_by_first_name, u.last_name as performed_by_last_name
       FROM audit_logs a
       LEFT JOIN users u ON a.performed_by_id = u.id
       WHERE a.target_user_id = $1
       ORDER BY a.created_at DESC`,
      [targetUserId]
    );
    res.json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'İşlem geçmişi alınamadı.' });
  }
});
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, role, status FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const user = userResult.rows[0];

    // Oturum anında hesap askıya alınmışsa hemen engelle (PDF Görev 03 kuralı)
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Hesabınız aktif değildir.' });
    }

    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} portunda yayında!`);
});
