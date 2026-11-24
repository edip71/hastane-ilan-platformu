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

// Güçlü şifre denetimi
function isStrongPassword(password) {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-ZÇĞİÖŞÜ]/.test(password);
  const hasLowerCase = /[a-zçğıöşü]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// Veritabanı İlk Başlatma (Görev 01-04 ve Görev 06 Kapsamı)
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

    // 2. Audit Logs Tablosu
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

    // 3. Categories Tablosu (Görev 06 Kapsamı)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0 NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        custom_fields JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Varsayılan Admin Hesabı
    const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@hastane.gov.tr']);
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedAdminPassword = await bcrypt.hash('Admin123!', salt);
      await pool.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, 'admin', 'active')
      `, ['Sistem', 'Yöneticisi', 'admin@hastane.gov.tr', hashedAdminPassword]);
      console.log('👑 Varsayılan Admin hesabı oluşturuldu (admin@hastane.gov.tr / Admin123!)');
    }

    // Varsayılan Çalışan Hesabı
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['doktor@hastane.gov.tr']);
    if (userCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedUserPassword = await bcrypt.hash('Sifre123!', salt);
      await pool.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, 'employee', 'active')
      `, ['Ahmet', 'Yılmaz', 'doktor@hastane.gov.tr', hashedUserPassword]);
      console.log('🩺 Varsayılan Çalışan hesabı oluşturuldu (doktor@hastane.gov.tr / Sifre123!)');
    }

    // Varsayılan İkinci El Kategorileri Tohumlama (Seed)
    const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      // Ana Kategori: İkinci El ve Sıfır Alışveriş
      const mainCat = await pool.query(`
        INSERT INTO categories (name, slug, parent_id, display_order, is_active)
        VALUES ('İkinci El ve Sıfır Alışveriş', 'ikinci-el-alisveris', NULL, 1, TRUE)
        RETURNING id
      `);
      const mainId = mainCat.rows[0].id;

      // Alt Kategoriler ve Dinamik Özel Alanlar
      const subCats = [
        {
          name: 'Elektronik',
          slug: 'elektronik',
          order: 1,
          fields: [
            { name: 'Cihaz Durumu', type: 'select', required: true, options: ['Sıfır', 'İkinci El - Çok İyi', 'İkinci El - İyi', 'Tamir Görmüş'] },
            { name: 'Garanti Durumu', type: 'select', required: false, options: ['Var', 'Yok'] }
          ]
        },
        {
          name: 'Beyaz Eşya & Küçük Ev Aletleri',
          slug: 'beyaz-esya',
          order: 2,
          fields: [
            { name: 'Ürün Durumu', type: 'select', required: true, options: ['Sıfır', 'Az Kullanılmış', 'Kullanılmış'] },
            { name: 'Enerji Sınıfı', type: 'text', required: false }
          ]
        },
        {
          name: 'Ev & Yaşam / Mobilya',
          slug: 'ev-yasam-mobilya',
          order: 3,
          fields: [
            { name: 'Malzeme Türü', type: 'text', required: false },
            { name: 'Demonte Edilebilir mi?', type: 'select', required: false, options: ['Evet', 'Hayır'] }
          ]
        },
        {
          name: 'Giyim & Aksesuar',
          slug: 'giyim-aksesuar',
          order: 4,
          fields: [
            { name: 'Beden / Numara', type: 'text', required: true },
            { name: 'Cinsiyet', type: 'select', required: false, options: ['Erkek', 'Kadın', 'Unisex', 'Çocuk'] }
          ]
        },
        {
          name: 'Kitap & Hobi',
          slug: 'kitap-hobi',
          order: 5,
          fields: [
            { name: 'Basım Yılı', type: 'number', required: false },
            { name: 'Sayfa Sayısı', type: 'number', required: false }
          ]
        },
        {
          name: 'Diğer Her Şey',
          slug: 'diger',
          order: 6,
          fields: []
        }
      ];

      for (const sub of subCats) {
        await pool.query(`
          INSERT INTO categories (name, slug, parent_id, display_order, is_active, custom_fields)
          VALUES ($1, $2, $3, $4, TRUE, $5)
        `, [sub.name, sub.slug, mainId, sub.order, JSON.stringify(sub.fields)]);
      }
      console.log('📦 Varsayılan 2. El Kategorileri ve özel alanları oluşturuldu!');
    }

    console.log('✅ Veritabanı tabloları ("users", "audit_logs", "categories") hazır ve güncel!');
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

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (trimmedFirst.length < 2 || trimmedLast.length < 2) {
      return res.status(400).json({ error: 'Ad ve soyad en az 2 karakter olmalıdır.' });
    }

    const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;
    if (!nameRegex.test(trimmedFirst) || !nameRegex.test(trimmedLast)) {
      return res.status(400).json({ error: 'Ad ve soyad yalnızca harflerden oluşmalıdır.' });
    }

    if (kvkkApproved !== true) {
      return res.status(400).json({ error: 'Kayıt olabilmek için KVKK Aydınlatma Metnini onaylamanız gerekmektedir.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi girin.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Şifreniz en az 8 karakter olmalı; en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.'
      });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten bulunmaktadır.' });
    }

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

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

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

app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { action, reason } = req.body;

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı kimliği.' });
    }

    const userCheck = await client.query('SELECT * FROM users WHERE id = $1', [targetUserId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    const targetUser = userCheck.rows[0];

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

    await client.query('BEGIN');

    await client.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, targetUserId]
    );

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

// -------------------------------------------------------------
// GÖREV 06: YÖNETİM › KATEGORİLER (CATEGORIES API)
// -------------------------------------------------------------

// 1. Genel Kategori Listesi (Herkese Açık - Yalnızca Aktif Kategoriler)
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, slug, parent_id, display_order, custom_fields 
      FROM categories 
      WHERE is_active = TRUE 
      ORDER BY display_order ASC, name ASC
    `);

    // Hiyerarşik ağaç oluştur (Ana kategoriler altında alt kategoriler)
    const all = result.rows;
    const rootCategories = all.filter(c => !c.parent_id);
    const tree = rootCategories.map(root => ({
      ...root,
      subcategories: all.filter(sub => sub.parent_id === root.id)
    }));

    return res.json({ categories: tree, flat: all });
  } catch (err) {
    console.error('Kategoriler Getirilemedi:', err);
    return res.status(500).json({ error: 'Kategoriler listelenirken bir hata oluştu.' });
  }
});

// 2. Yönetici Kategori Listesi (Yalnızca Admin - Aktif ve Pasif Tüm Kategoriler)
app.get('/api/admin/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY c.parent_id NULLS FIRST, c.display_order ASC, c.name ASC
    `);
    return res.json({ categories: result.rows });
  } catch (err) {
    console.error('Admin Kategori Listesi Hatası:', err);
    return res.status(500).json({ error: 'Kategoriler alınamadı.' });
  }
});

// 3. Yeni Kategori / Alt Kategori Ekleme (Yalnızca Admin)
app.post('/api/admin/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, parentId, displayOrder, customFields } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Kategori adı en az 2 karakter olmalıdır.' });
    }

    // Basit ve güvenli slug üretimi
    const slug = name
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);

    const validParentId = parentId && !isNaN(parseInt(parentId, 10)) ? parseInt(parentId, 10) : null;
    const order = displayOrder && !isNaN(parseInt(displayOrder, 10)) ? parseInt(displayOrder, 10) : 0;
    const fields = Array.isArray(customFields) ? JSON.stringify(customFields) : '[]';

    const insertResult = await pool.query(`
      INSERT INTO categories (name, slug, parent_id, display_order, is_active, custom_fields)
      VALUES ($1, $2, $3, $4, TRUE, $5)
      RETURNING *
    `, [name.trim(), slug, validParentId, order, fields]);

    const newCategory = insertResult.rows[0];

    // Denetim kaydı oluştur
    await pool.query(`
      INSERT INTO audit_logs (action, performed_by, reason, details)
      VALUES ($1, $2, $3, $4)
    `, ['CREATE_CATEGORY', req.user.id, 'Yeni kategori oluşturuldu.', { categoryId: newCategory.id, name: newCategory.name }]);

    return res.status(201).json({
      message: 'Kategori başarıyla oluşturuldu.',
      category: newCategory
    });
  } catch (err) {
    console.error('Kategori Ekleme Hatası:', err);
    return res.status(500).json({ error: 'Kategori oluşturulamadı.' });
  }
});

// 4. Kategori Durumu / Pasife Alma & Güncelleme (Yalnızca Admin)
app.patch('/api/admin/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const catId = parseInt(req.params.id, 10);
    const { name, displayOrder, isActive, customFields } = req.body;

    if (isNaN(catId)) {
      return res.status(400).json({ error: 'Geçersiz kategori kimliği.' });
    }

    const check = await pool.query('SELECT * FROM categories WHERE id = $1', [catId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }
    const currentCat = check.rows[0];

    const updatedName = name && name.trim().length >= 2 ? name.trim() : currentCat.name;
    const updatedOrder = displayOrder !== undefined ? parseInt(displayOrder, 10) : currentCat.display_order;
    const updatedActive = typeof isActive === 'boolean' ? isActive : currentCat.is_active;
    const updatedFields = customFields ? JSON.stringify(customFields) : JSON.stringify(currentCat.custom_fields);

    const updateRes = await pool.query(`
      UPDATE categories
      SET name = $1, display_order = $2, is_active = $3, custom_fields = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [updatedName, updatedOrder, updatedActive, updatedFields, catId]);

    // Denetim kaydı
    await pool.query(`
      INSERT INTO audit_logs (action, performed_by, reason, details)
      VALUES ($1, $2, $3, $4)
    `, ['UPDATE_CATEGORY', req.user.id, 'Kategori güncellendi/durumu değiştirildi.', { categoryId: catId, isActive: updatedActive }]);

    return res.json({
      message: 'Kategori başarıyla güncellendi.',
      category: updateRes.rows[0]
    });
  } catch (err) {
    console.error('Kategori Güncelleme Hatası:', err);
    return res.status(500).json({ error: 'Kategori güncellenirken bir hata oluştu.' });
  }
});

// Sunucuyu Dinleme
app.listen(PORT, () => {
  console.log(`🚀 Sunucu port ${PORT} üzerinde çalışıyor.`);
});
