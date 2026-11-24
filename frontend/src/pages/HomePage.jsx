import React from 'react';
import Navbar from '../components/Navbar';
import { 
  Laptop, Tv, Sofa, Shirt, BookOpen, 
  HelpCircle, ChevronRight, ShoppingBag, ShieldCheck, Tag, PlusCircle, Inbox
} from 'lucide-react';

export default function HomePage({ user, onLogout }) {

  const categories = [
    { id: 'elektronik', name: 'Elektronik', icon: Laptop },
    { id: 'beyaz-esya', name: 'Beyaz Eşya & Küçük Ev Aletleri', icon: Tv },
    { id: 'ev-yasam', name: 'Ev & Yaşam / Mobilya', icon: Sofa },
    { id: 'giyim', name: 'Giyim & Aksesuar', icon: Shirt },
    { id: 'kitap-hobi', name: 'Kitap & Hobi', icon: BookOpen },
    { id: 'diger', name: 'Diğer Her Şey', icon: HelpCircle },
  ];

  return (
    <div style={styles.page} className="page-fade">
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
                  <h4 style={styles.infoTitle}>Güvenli Kurum İçi İlan</h4>
                  <p style={styles.infoText}>
                    Platformda yalnızca onaylanmış personeller ilan verebilir ve alışveriş yapabilir.
                  </p>
                </div>
              </div>
            </aside>

            {/* SAĞ ALAN: Vitrin Alanı */}
            <section style={styles.content}>
              
              {/* Hoş Geldiniz Banner */}
              <div style={styles.banner}>
                <div style={styles.bannerText}>
                  <h1 style={styles.bannerTitle}>Şifahane İlan Platformu</h1>
                  <p style={styles.bannerSubtitle}>
                    İhtiyacınız olan ikinci el eşyaları güvenle bulun veya kendi eşyalarınızı kolayca listeleyin.
                  </p>
                </div>
              </div>

              {/* Vitrin Başlığı */}
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleWrapper}>
                  <Tag size={18} color="#004f8c" />
                  <h2 style={styles.sectionTitle}>Vitrin İlanları</h2>
                </div>
                <span style={styles.sectionBadge}>Henüz yayında ilan yok</span>
              </div>

              {/* Örnek ilanlar kaldırıldı - Temiz boş durum (Empty State) */}
              <div style={styles.emptyContainer}>
                <Inbox size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h3 style={styles.emptyTitle}>Henüz Yayında Bir İlan Bulunmuyor</h3>
                <p style={styles.emptyText}>
                  İlan oluşturma görevi tamamlandığında kendi ilanlarınızı burada vitrinde sergileyebilirsiniz.
                </p>
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
    padding: '8px 8px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
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
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#334155',
    margin: '0 0 6px 0',
  },
  emptyText: {
    fontSize: '13px',
    color: '#64748b',
    maxWidth: '400px',
    margin: 0,
    lineHeight: '1.5',
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
