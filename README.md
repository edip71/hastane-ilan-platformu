# 🏥 Hastane İçi İlan Platformu

Hastane personeline özel; güvenli ilan paylaşımı, moderasyon, anlık mesajlaşma ve bildirim süreçlerini barındıran modern web ve mobil uyumlu kurumsal ilan yönetim platformu.

---

## 📌 Proje Hakkında

Bu proje, kurum içi çalışanların ikinci el eşya, devir, taşıt veya genel ihtiyaç duyurularını kurum içinde güvenle paylaşabilmesi amacıyla geliştirilmektedir. Platform; güvenli oturum yönetimi, yönetici moderasyon onayı, ilan yaşam döngüsü ve kurum içi mesajlaşma standartlarını esas alır.

### ✨ Temel Özellikler
- **Kurumsal Doğrulama & Onay:** Kaydolan tüm personeller doğrudan sisteme giremez; yönetici inceleme kuyruğuna (`pending`) düşer ve yönetici onayından sonra platforma erişebilir.
- **Uçtan Uca Güvenlik:** Şifreler `bcrypt` ile tuzlanarak (salt) tek yönlü hash olarak saklanır. Dışarıdan rol manipülasyonu engellenmiştir.
- **Saldırı Koruması (Rate Limiting):** Kaba kuvvet (brute-force) ve spam saldırılarına karşı IP bazlı istek sınırlaması ve gövde (payload) boyutu kısıtlaması mevcuttur.
- **İlişkisel Veri Mimarisi:** PostgreSQL üzerinde connection pooling (bağlantı havuzu) ile yüksek performanslı veri yönetimi.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Frontend** | React 19, Vite, Lucide Icons | Hızlı, reaktif ve modern kullanıcı arayüzü |
| **Backend** | Node.js, Express.js (ES Modules) | RESTful API mimarisi, doğrulama ve iş kuralları |
| **Veritabanı** | PostgreSQL 18 | ACID uyumlu ilişkisel veritabanı |
| **Güvenlik** | bcryptjs, express-rate-limit | Şifreleme ve kaba kuvvet saldırı engelleme |
| **Sürüm Kontrolü** | Git & GitHub | Modüler commit geçmişi ve versiyonlama |

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda ayağa kaldırmak için aşağıdaki adımları izleyin:

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/edip71/hastane-ilan-platformu.git
cd hastane-ilan-platformu
```

### 2. Veritabanı Hazırlığı
PostgreSQL üzerinde `hastane_ilan_db` adında bir veritabanı oluşturun.

### 3. Sunucu (Backend) Kurulumu
`server` klasörüne geçip bağımlılıkları yükleyin ve `.env` dosyasını yapılandırın:

```bash
cd server
npm install
```

`server/.env` dosyanızı oluşturup veritabanı bilgilerinizi girin:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hastane_ilan_db
DB_USER=postgres
DB_PASSWORD=veritabani_sifreniz
```

Backend sunucusunu başlatın:
```bash
npm run dev
# Sunucu http://localhost:5000 portunda çalışır
```

### 4. İstemci (Frontend) Kurulumu
Yeni bir terminalde `client` klasörüne geçip bağımlılıkları yükleyin ve başlatın:

```bash
cd client
npm install
npm run dev
# Web arayüzü http://localhost:3000 veya http://localhost:5173 adresinde açılır
```

---

## 📂 Proje Dizin Yapısı

```text
hastane-ilan-platformu/
├── client/                     # React + Vite Arayüz Uygulaması
│   ├── src/
│   │   ├── App.jsx             # Ana Uygulama ve Form Ekranları
│   │   └── main.jsx            # React Giriş Noktası
│   └── package.json
├── server/                     # Node.js + Express REST API
│   ├── index.js                # API Rotaları, DB Bağlantısı ve Güvenlik Katmanı
│   └── package.json
├── Hastane_Ilan_Platformu_Mimari_Kararlari.md # Sistem Tasarımı ve Mimari Kararlar
├── staj_program.pdf            # Stajyer Uygulama Kılavuzu & Fonksiyonel Akış
└── README.md
```

---

## 👤 Geliştirici
- **Edip Pehlivanlı** - [GitHub Profili](https://github.com/edip71)
