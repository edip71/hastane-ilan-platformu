import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, MapPin, Calendar, User, Phone, Tag, 
  ChevronRight, AlertCircle, ShieldCheck, Image as ImageIcon,
  CheckCircle, Clock, Building2
} from 'lucide-react';

// Türkçe ilk harfleri büyütme yardımcısı
function capitalizeWords(str) {
  if (!str) return '';
  return str
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}

export default function ListingDetailPage({ user, token, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/giris');
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/listings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'İlan bilgileri getirilemedi.');
        }
        setListing(data.listing);
        // İlk görseli aktif görsel yap
        if (data.listing.images && Array.isArray(data.listing.images) && data.listing.images.length > 0) {
          setSelectedImage(data.listing.cover_image || data.listing.images[0]);
        } else if (data.listing.cover_image) {
          setSelectedImage(data.listing.cover_image);
        }
      })
      .catch((err) => {
        setError(err.message || 'Bir hata oluştu.');
      })
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  return (
    <div style={styles.page} className="page-fade">
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.main}>
        <div style={styles.container}>
          
          {/* Breadcrumb & Geri Dön */}
          <div style={styles.topBar}>
            <button onClick={() => navigate('/')} style={styles.btnBack}>
              <ArrowLeft size={16} />
              <span>İlanlara Dön</span>
            </button>
            {listing && (
              <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadcrumbLink}>Ana Sayfa</Link>
                <ChevronRight size={14} color="#94a3b8" />
                <span style={styles.breadcrumbItem}>{listing.category_name}</span>
                <ChevronRight size={14} color="#94a3b8" />
                <span style={styles.breadcrumbCurrent}>{capitalizeWords(listing.title)}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div style={styles.loadingBox}>
              <p style={{ color: '#64748b', fontSize: '14px' }}>İlan detayları yükleniyor...</p>
            </div>
          ) : error ? (
            <div style={styles.errorBox}>
              <AlertCircle size={36} color="#dc2626" style={{ marginBottom: '10px' }} />
              <h3 style={{ margin: '0 0 6px 0', color: '#991b1b' }}>İlan Görüntülenemedi</h3>
              <p style={{ margin: '0 0 16px 0', color: '#b91c1c', fontSize: '13px' }}>{error}</p>
              <button onClick={() => navigate('/')} style={styles.btnPrimary}>
                Ana Sayfaya Dön
              </button>
            </div>
          ) : listing ? (
            <div style={styles.contentLayout}>
              
              {/* SOL SÜTUN: Görsel Galerisi & Açıklama */}
              <div style={styles.leftCol}>
                
                {/* Ana Görsel ve Galeri */}
                <div style={styles.card}>
                  <div style={styles.mainImageBox}>
                    {selectedImage ? (
                      <img src={selectedImage} alt={listing.title} style={styles.mainImage} />
                    ) : (
                      <div style={styles.noImageBox}>
                        <ImageIcon size={48} color="#94a3b8" />
                        <span style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>Fotoğraf Eklenmemiş</span>
                      </div>
                    )}
                  </div>

                  {/* Küçük Önizlemeler */}
                  {listing.images && Array.isArray(listing.images) && listing.images.length > 1 && (
                    <div style={styles.thumbnailRow}>
                      {listing.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          style={{
                            ...styles.thumbnailBtn,
                            borderColor: selectedImage === img ? '#004f8c' : '#e2e8f0'
                          }}
                        >
                          <img src={img} alt={`Önizleme ${idx + 1}`} style={styles.thumbnailImg} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Açıklama Kutusu */}
                <div style={{ ...styles.card, marginTop: '20px' }}>
                  <h3 style={styles.sectionHeading}>İlan Açıklaması</h3>
                  <div style={styles.descriptionText}>
                    {listing.description}
                  </div>
                </div>

                {/* Kategoriye Özel Dinamik Özellikler Tablosu */}
                {listing.custom_values && Object.keys(listing.custom_values).length > 0 && (
                  <div style={{ ...styles.card, marginTop: '20px' }}>
                    <h3 style={styles.sectionHeading}>Ürün / Eşya Özellikleri</h3>
                    <div style={styles.customGrid}>
                      {Object.entries(listing.custom_values).map(([key, val]) => (
                        <div key={key} style={styles.customRow}>
                          <span style={styles.customKey}>{key}:</span>
                          <span style={styles.customValue}>{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* SAĞ SÜTUN: Fiyat, Konum, İlan Sahibi Bilgileri */}
              <div style={styles.rightCol}>
                
                {/* Fiyat & Başlık Kartı */}
                <div style={styles.card}>
                  <div style={styles.priceTag}>
                    {listing.is_free ? (
                      <span style={{ color: '#16a34a', fontWeight: '800' }}>ÜCRETSİZ PAYLAŞIM</span>
                    ) : (
                      <span>{listing.price ? `${Number(listing.price).toLocaleString('tr-TR')} TL` : 'Fiyat Belirtilmedi'}</span>
                    )}
                  </div>

                  <h1 style={styles.listingTitle}>
                    {capitalizeWords(listing.title)}
                  </h1>

                  <div style={styles.metaList}>
                    <div style={styles.metaItem}>
                      <Calendar size={15} color="#64748b" />
                      <span style={styles.metaLabel}>İlan Tarihi:</span>
                      <span style={styles.metaVal}>{new Date(listing.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <Tag size={15} color="#64748b" />
                      <span style={styles.metaLabel}>Kategori:</span>
                      <span style={styles.metaVal}>{listing.category_name}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <MapPin size={15} color="#64748b" />
                      <span style={styles.metaLabel}>Konum / Birim:</span>
                      <span style={styles.metaVal}>{listing.location || 'Kurum İçi'}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <Clock size={15} color="#64748b" />
                      <span style={styles.metaLabel}>Durum:</span>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: listing.status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: listing.status === 'active' ? '#166534' : '#92400e'
                      }}>
                        {listing.status === 'active' ? 'Yayında' : listing.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* İlan Sahibi / İletişim Kartı */}
                <div style={{ ...styles.card, marginTop: '20px' }}>
                  <h3 style={styles.sectionHeading}>İlan Sahibi</h3>
                  
                  <div style={styles.ownerBox}>
                    <div style={styles.ownerAvatar}>
                      <User size={24} color="#004f8c" />
                    </div>
                    <div style={styles.ownerInfo}>
                      <h4 style={styles.ownerName}>
                        {capitalizeWords(`${listing.author_first_name} ${listing.author_last_name}`)}
                      </h4>
                      <p style={styles.ownerRole}>Kurum Personeli</p>
                    </div>
                  </div>

                  <div style={styles.contactSection}>
                    <div style={styles.contactItem}>
                      <Phone size={16} color="#004f8c" />
                      <div>
                        <div style={styles.contactLabel}>Dahili / Telefon:</div>
                        <div style={styles.contactVal}>{listing.contact_info || 'Belirtilmedi'}</div>
                      </div>
                    </div>

                    <div style={styles.contactItem}>
                      <Building2 size={16} color="#004f8c" />
                      <div>
                        <div style={styles.contactLabel}>Çalışma Birimi:</div>
                        <div style={styles.contactVal}>{listing.location || 'Belirtilmedi'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.securityNotice}>
                    <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '11px', color: '#166534', lineHeight: 1.4 }}>
                      Bu ilan Şifahane Hastanesi personelleri arası güvenli paylaşım içindir. Teslimatı kurum içinde gerçekleştiriniz.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          ) : null}

        </div>
      </main>
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
    padding: '24px 16px 48px',
  },
  container: {
    maxWidth: '1140px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  btnBack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#004f8c',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '6px 0',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
  },
  breadcrumbLink: {
    color: '#004f8c',
    textDecoration: 'none',
    fontWeight: '600',
  },
  breadcrumbItem: {
    color: '#475569',
  },
  breadcrumbCurrent: {
    color: '#0f172a',
    fontWeight: '600',
    maxWidth: '240px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '60px 20px',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    padding: '40px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  contentLayout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 600px',
    minWidth: '300px',
  },
  rightCol: {
    width: '360px',
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  mainImageBox: {
    width: '100%',
    height: '380px',
    backgroundColor: '#f8fafc',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    backgroundColor: '#0f172a',
  },
  noImageBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  thumbnailRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  thumbnailBtn: {
    width: '64px',
    height: '64px',
    borderRadius: '4px',
    border: '2px solid transparent',
    padding: 0,
    background: 'none',
    cursor: 'pointer',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sectionHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 12px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid #f1f5f9',
  },
  descriptionText: {
    fontSize: '14px',
    color: '#334155',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  customGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
  },
  customRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '4px',
    fontSize: '13px',
    border: '1px solid #f1f5f9',
  },
  customKey: {
    color: '#64748b',
    fontWeight: '600',
  },
  customValue: {
    color: '#0f172a',
    fontWeight: '600',
  },
  priceTag: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#004f8c',
    marginBottom: '8px',
  },
  listingTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.3',
    margin: '0 0 16px 0',
  },
  metaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  metaLabel: {
    color: '#64748b',
    width: '100px',
    flexShrink: 0,
  },
  metaVal: {
    color: '#1e293b',
    fontWeight: '600',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
  },
  ownerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  ownerAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 2px 0',
  },
  ownerRole: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  contactSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  contactItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  contactLabel: {
    fontSize: '11px',
    color: '#64748b',
  },
  contactVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#004f8c',
  },
  securityNotice: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '10px',
    borderRadius: '4px',
  },
};
