import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Güvenlik: Kayıt ve Giriş için Brute-Force (Kaba Kuvvet) ve Spam Koruması (Rate Limiting)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20, // 15 dakikada aynı IP'den en fazla 20 istek
  message: { error: 'Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' },
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
    `);
    console.log('✅ "users" tablosu hazır!');
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
app.post('/api/auth/register', authLimiter, async (req, res) => {
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
    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'employee', 'pending')
       RETURNING id, first_name, last_name, email, role, status, created_at`,
      [firstName.trim(), lastName.trim(), email.toLowerCase().trim(), passwordHash]
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

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} portunda yayında!`);
});
