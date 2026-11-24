import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Laptop, Tv, Sofa, Shirt, BookOpen, 
  HelpCircle, ChevronRight, ShoppingBag, ShieldCheck, Tag, PlusCircle, Inbox,
  MapPin, Calendar, Image as ImageIcon
} from 'lucide-react';

export default function HomePage({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('');

  // Kategorileri Çek
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        const flat = data.flat || [];
        setCategories(flat.filter(c => c.parent_id !== null)); // Alt kategoriler
      })
      .catch(() => {});
  }, []);

  // İlanları Çek
  const fetchListings = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const url = selectedCat 
      ? `http://localhost:5000/api/listings?category=${encodeURIComponent(selectedCat)}`
      : 'http://localhost:5000/api/listings';

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setListings(data.listings || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCat]);

  return (
    <div style={styles.page} className="page-fade">
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.main}>
        <div style={styles.container}>
          
          <div style={styles.layout}>
            
            {/* SOL SIDEBAR: Kategori Ağacı */}
            <aside style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <ShoppingBag size={18} color="#004f8c" />
                <h2 style={styles.sidebarTitle}>Kategoriler</h2>
              </div>
              <ul style={styles.categoryList}>
                <li style={styles.categoryItem}>
                  <button 
                    style={{
                      ...styles.categoryBtn,
                      backgroundColor: selectedCat === '' ? '#e0f2fe' : 'transparent',
                      color: selectedCat === '' ? '#004f8c' : '#334155',
                      fontWeight: selectedCat === '' ? '700' : '500',
                    }}
                    onClick={() => setSelectedCat('')}
                  >
                    <span>Tüm İlanlar</span>
                    <ChevronRight size={14} color="#94a3b8" />
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id} style={styles.categoryItem}>
                    <button 
                      style={{
                        ...styles.categoryBtn,
                        backgroundColor: selectedCat === cat.slug ? '#e0f2fe' : 'transparent',
                        color: selectedCat === cat.slug ? '#004f8c' : '#334155',
                        fontWeight: selectedCat === cat.slug ? '700' : '500',
                      }}
                      onClick={() => setSelectedCat(cat.slug)}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>
                  </li>
                ))}
              </ul>

              <div style={styles.infoCard}>
                <ShieldCheck size={20} color="#16a34a" />
                <div>
                  <h4 style={styles.infoTitle}>Güvenli Kurum İçi İlan</h4>
                  <p style={styles.infoText}>
                    Yalnızca kurum çalışanları ilan verebilir ve alışveriş yapabilir.
                  </p>
                </div>
              </div>
            </aside>

            {/* SAĞ ALAN: Vitrin Alanı */}
            <section style={styles.content}>
              
              <div style={styles.banner}>
                <div style={styles.bannerText}>
                  <h1 style={styles.bannerTitle}>Şifahane İlan Platformu</h1>
                  <p style={styles.bannerSubtitle}>
                    İhtiyacınız olan ikinci el eşyaları güvenle bulun veya kendi eşyalarınızı kolayca listeleyin.
                  </p>
                </div>
              </div>

              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleWrapper}>
                  <Tag size={18} color="#004f8c" />
                  <h2 style={styles.sectionTitle}>
                    {selectedCat ? `${categories.find(c => c.slug === selectedCat)?.name || 'Kategori'} İlanları` : 'Vitrin İlanları'}
                  </h2>
                </div>
                <span style={styles.sectionBadge}>
                  {listings.length} ilan yayında
                </span>
              </div>

              {loading ? (
                <div style={styles.emptyContainer}>
                  <p style={{ color: '#64748b' }}>İlanlar yükleniyor...</p>
                </div>
              ) : listings.length === 0 ? (
                <div style={styles.emptyContainer}>
                  <Inbox size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <h3 style={styles.emptyTitle}>Bu Kategoride Yayında İlan Bulunmuyor</h3>
                  <p style={styles.emptyText}>
                    İlk ilanı veren siz olun! Yönetici onayının ardından ilanınız burada vitrinde sergilenecektir.
                  </p>
                </div>
              ) : (
                <div style={styles.grid}>
                  {listings.map((item) => (
                    <div key={item.id} style={styles.adCard}>
                      <div style={styles.adImgPlaceholder}>
                        {item.cover_image ? (
                          <img src={item.cover_image} alt={item.title} style={styles.adCoverImg} />
                        ) : (
                          <ImageIcon size={32} color="#94a3b8" />
                        )}
                        <span style={styles.categoryBadge}>{item.category_name}</span>
                      </div>
                      <div style={styles.adBody}>
                        <div style={styles.adPrice}>
                          {item.is_free ? 'ÜCRETSİZ' : (item.price ? `${Number(item.price).toLocaleString('tr-TR')} TL` : 'Fiyat Belirtilmedi')}
                        </div>
                        <div style={styles.adTitle} title={item.title}>{item.title}</div>
                        
                        <div style={styles.adMeta}>
                          {item.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={11} color="#64748b" />
                              <span>{item.location}</span>
                            </span>
                          )}
                        </div>

                        <div style={styles.adFooter}>
                          <span>{item.author_first_name} {item.author_last_name}</span>
                          <span>{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
    flexWrap: 'wrap',
  },
  sidebar: {
    width: '260px',
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
    marginBottom: '2px',
  },
  categoryBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 8px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '13px',
  },
  infoCard: {
    marginTop: '20px',
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
    minWidth: '280px',
  },
  banner: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    borderLeft: '4px solid #004f8c',
  },
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  bannerSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '8px',
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
    fontSize: '15px',
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
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  adImgPlaceholder: {
    height: '140px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  adCoverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: '6px',
    left: '6px',
    backgroundColor: 'rgba(0, 79, 140, 0.85)',
    color: '#ffffff',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '3px',
    fontWeight: '600',
  },
  adBody: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  adPrice: {
    fontSize: '15px',
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
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  adMeta: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: 'auto',
    marginBottom: '8px',
  },
  adFooter: {
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '11px',
    color: '#94a3b8',
    display: 'flex',
    justifyContent: 'space-between',
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
