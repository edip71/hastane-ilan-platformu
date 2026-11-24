import React from 'react';
import Navbar from '../components/Navbar';
import { 
  Laptop, Tv, Sofa, Shirt, BookOpen, 
  HelpCircle, ChevronRight, ShoppingBag, ShieldCheck, Tag 
} from 'lucide-react';

export default function HomePage({ user, onLogout }) {

  const categories = [
    { id: 'elektronik', name: 'Elektronik', icon: Laptop, count: 'Telefon, Bilgisayar, Tablet' },
    { id: 'beyaz-esya', name: 'Beyaz Eşya & Küçük Ev Aletleri', icon: Tv, count: 'Buzdolabı, Çamaşır Makinesi, Ütü' },
    { id: 'ev-yasam', name: 'Ev & Yaşam / Mobilya', icon: Sofa, count: 'Masa, Sandalye, Dolap, Yatak' },
    { id: 'giyim', name: 'Giyim & Aksesuar', icon: Shirt, count: 'Kıyafet, Çanta, Saat, Ayakkabı' },
    { id: 'kitap-hobi', name: 'Kitap & Hobi', icon: BookOpen, count: 'Ders Kitapları, Romanlar, Hobi' },
    { id: 'diger', name: 'Diğer Her Şey', icon: HelpCircle, count: 'Çeşitli İkinci El Eşyalar' },
  ];

  return (
    <div style={styles.page}>
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.main}>
        <div style={styles.container}>
          
          <div style={styles.layout}>
            
            {/* SOL SIDEBAR: Sahibinden Tarzı Kategori Ağacı */}
            <aside style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <ShoppingBag size={18} color="#004f8c" />
                <h2 style={styles.sidebarTitle}>İkinci El Alışveriş</h2>
              </div>
              <ul style={styles.categoryList}>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <li key={cat.id} style={styles.categoryItem}>
                      <button 
                        style={styles.categoryBtn}
                        onClick={() => alert(`"${cat.name}" ilanları listeleme görevinde açılacaktır.`)}
                      >
                        <div style={styles.categoryLeft}>
                          <Icon size={16} color="#64748b" />
                          <span style={styles.categoryName}>{cat.name}</span>
                        </div>
                        <ChevronRight size={14} color="#94a3b8" />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Kurumsal Güvenlik Notu */}
              <div style={styles.infoCard}>
                <ShieldCheck size={20} color="#16a34a" />
                <div>
                  <h4 style={styles.infoTitle}>Güvenli Kurum İçi Alışveriş</h4>
                  <p style={styles.infoText}>
                    Platformda yalnızca kurum personelleri ilan verebilir ve alışveriş yapabilir.
                  </p>
                </div>
              </div>
            </aside>

            {/* SAĞ ALAN: Vitrin & İlan Önizleme Alanı */}
            <section style={styles.content}>
              
              {/* Hoş Geldiniz Banner */}
              <div style={styles.banner}>
                <div style={styles.bannerText}>
                  <h1 style={styles.bannerTitle}>Şifahane İlan Platformu</h1>
                  <p style={styles.bannerSubtitle}>
                    İhtiyacınız olan ikinci el elektronik, mobilya ve ev eşyalarını güvenle bulun veya kendi eşyalarınızı listeleyin.
                  </p>
                </div>
              </div>

              {/* Vitrin Başlığı */}
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleWrapper}>
                  <Tag size={18} color="#004f8c" />
                  <h2 style={styles.sectionTitle}>Günün Vitrin İlanları</h2>
                </div>
                <span style={styles.sectionBadge}>Sahibinden Tarzı Görünüm</span>
              </div>

              {/* Örnek Vitrin İlan Kartları */}
              <div style={styles.grid}>
                
                <div style={styles.adCard}>
                  <div style={styles.adImgPlaceholder}>
                    <span>Elektronik</span>
                  </div>
                  <div style={styles.adBody}>
                    <div style={styles.adPrice}>4.500 TL</div>
                    <div style={styles.adTitle}>Çalışma Masası ve Ergonomik Koltuk Takımı</div>
                    <div style={styles.adMeta}>Kategori: Ev & Yaşam</div>
                    <div style={styles.adFooter}>
                      <span>Bugün</span>
                    </div>
                  </div>
                </div>

                <div style={styles.adCard}>
                  <div style={styles.adImgPlaceholder}>
                    <span>Beyaz Eşya</span>
                  </div>
                  <div style={styles.adBody}>
                    <div style={styles.adPrice}>7.800 TL</div>
                    <div style={styles.adTitle}>Tertemiz Mini Buzdolabı (Garantisi Devam Ediyor)</div>
                    <div style={styles.adMeta}>Kategori: Beyaz Eşya</div>
                    <div style={styles.adFooter}>
                      <span>Dün</span>
                    </div>
                  </div>
                </div>

                <div style={styles.adCard}>
                  <div style={styles.adImgPlaceholder}>
                    <span>Kitap & Hobi</span>
                  </div>
                  <div style={styles.adBody}>
                    <div style={styles.adPrice}>550 TL</div>
                    <div style={styles.adTitle}>Tıbbi Terminoloji ve Anatomi Atlası Seti</div>
                    <div style={styles.adMeta}>Kategori: Kitap & Hobi</div>
                    <div style={styles.adFooter}>
                      <span>22 Kasım</span>
                    </div>
                  </div>
                </div>

                <div style={styles.adCard}>
                  <div style={styles.adImgPlaceholder}>
                    <span>Elektronik</span>
                  </div>
                  <div style={styles.adBody}>
                    <div style={styles.adPrice}>2.200 TL</div>
                    <div style={styles.adTitle}>24 inç IPS Monitör (HDMI/DisplayPort)</div>
                    <div style={styles.adMeta}>Kategori: Elektronik</div>
                    <div style={styles.adFooter}>
                      <span>20 Kasım</span>
                    </div>
                  </div>
                </div>

              </div>

            </section>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerLeft}>
            <img src="/logo.png" alt="Şifahane" style={{ height: '30px', filter: 'grayscale(100%)', opacity: 0.7 }} />
            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px' }}>
              © 2026 Şifahane İlan Platformu. Tüm hakları saklıdır.
            </span>
          </div>
          <div style={styles.footerLinks}>
            <span style={styles.footerLink}>Kullanım Koşulları</span>
            <span style={styles.footerLink}>KVKK Bildirimi</span>
            <span style={styles.footerLink}>Yardım</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    padding: '20px 16px 40px',
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
  },
  layout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '12px',
    borderBottom: '2px solid #004f8c',
    marginBottom: '12px',
  },
  sidebarTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  categoryList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  categoryItem: {
    marginBottom: '4px',
  },
  categoryBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 6px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
  },
  categoryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  categoryName: {
    fontSize: '13px',
    color: '#334155',
    fontWeight: '500',
  },
  infoCard: {
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#166534',
    margin: '0 0 2px 0',
  },
  infoText: {
    fontSize: '11px',
    color: '#15803d',
    margin: 0,
    lineHeight: '1.4',
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '24px 28px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    borderLeft: '4px solid #004f8c',
  },
  bannerTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  bannerSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '10px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  sectionTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  sectionBadge: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '16px',
  },
  adCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
  },
  adImgPlaceholder: {
    height: '140px',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
  },
  adBody: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  adPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#004f8c',
    marginBottom: '4px',
  },
  adTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.4',
    marginBottom: '8px',
    minHeight: '36px',
  },
  adMeta: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: 'auto',
  },
  adFooter: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '11px',
    color: '#94a3b8',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '20px 16px',
    marginTop: 'auto',
  },
  footerContainer: {
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerLink: {
    fontSize: '12px',
    color: '#64748b',
    cursor: 'pointer',
  },
};
