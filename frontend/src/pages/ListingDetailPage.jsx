import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  ArrowLeft, Tag, DollarSign, User, Calendar, Phone,
  Trash2, Loader2, AlertCircle, FileX, CheckCircle, X
} from 'lucide-react';

const CATEGORIES = {
  'nobet-degisimi':        { label: 'Nöbet Değişimi',           color: '#0369a1', bg: '#dbeafe' },
  'ikinci-el-esya':        { label: 'İkinci El Eşya',           color: '#7c3aed', bg: '#ede9fe' },
  'ev-arkadasligi':        { label: 'Ev Arkadaşlığı',           color: '#059669', bg: '#d1fae5' },
  'kiralik-ev':            { label: 'Kiralık Ev',               color: '#d97706', bg: '#fef3c7' },
  'ulasim-yol-arkadasligi':{ label: 'Ulaşım / Yol Arkadaşlığı', color: '#dc2626', bg: '#fee2e2' },
  'kitap-ders-materyali':  { label: 'Kitap & Ders Materyali',   color: '#0891b2', bg: '#cffafe' },
  'diger':                 { label: 'Diğer',                    color: '#6b7280', bg: '#f3f4f6' },
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ListingDetailPage({ token, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted,  setDeleted]  = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError('');
      try {
        const res  = await fetch(`http://localhost:5000/api/listings/${id}`);
        const data = await res.json();
        if (res.status === 404) throw new Error('İlan bulunamadı veya kaldırılmış.');
        if (!res.ok) throw new Error(data.message || 'İlan yüklenemedi.');
        setListing(data.listing || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'İlan kaldırılamadı.');
      setDeleted(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err.message);
      setShowConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = listing && user && (
    listing.user_id === user.id || user.role === 'admin'
  );

  /* ---- styles ---- */
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #edf4fa 0%, #f4f8fd 60%, #e8f0f9 100%)',
  };
  const containerStyle = {
    maxWidth: 760,
    margin: '0 auto',
    padding: '32px 16px 64px',
  };
  const cardStyle = {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 4px 28px rgba(3,105,161,0.09)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  };

  if (loading) return (
    <div style={pageStyle}>
      <Navbar token={token} user={user} />
      <div style={{ textAlign: 'center', paddingTop: 100, color: '#627d98' }}>
        <Loader2 size={40} className="spin-animate" style={{ margin: '0 auto 16px', display: 'block' }} />
        <p>İlan yükleniyor...</p>
      </div>
    </div>
  );

  if (error || !listing) return (
    <div style={pageStyle}>
      <Navbar token={token} user={user} />
      <div style={containerStyle}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '60px 40px', textAlign: 'center',
          boxShadow: '0 4px 28px rgba(3,105,161,0.09)', border: '1px solid #e2e8f0',
        }}>
          <FileX size={56} color="#94a3b8" style={{ margin: '0 auto 20px', display: 'block' }} />
          <h2 style={{ color: '#374151', fontSize: 20, marginBottom: 8 }}>İlan bulunamadı</h2>
          <p style={{ color: '#627d98', marginBottom: 28 }}>{error || 'Bu ilan kaldırılmış veya mevcut değil.'}</p>
          <button onClick={() => navigate('/')} style={{
            padding: '12px 28px', background: '#004f8c', color: '#fff',
            border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <ArrowLeft size={16} /> İlanlara Dön
          </button>
        </div>
      </div>
    </div>
  );

  if (deleted) return (
    <div style={pageStyle}>
      <Navbar token={token} user={user} />
      <div style={containerStyle}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '60px 40px', textAlign: 'center',
          boxShadow: '0 4px 28px rgba(3,105,161,0.09)', border: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={36} color="#16a34a" />
          </div>
          <h2 style={{ color: '#0a2540', fontSize: 20, marginBottom: 8 }}>İlan Kaldırıldı</h2>
          <p style={{ color: '#627d98', marginBottom: 28 }}>İlan başarıyla kaldırıldı.</p>
          <button onClick={() => navigate('/')} style={{
            padding: '12px 28px', background: '#004f8c', color: '#fff',
            border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <ArrowLeft size={16} /> İlanlara Dön
          </button>
        </div>
      </div>
    </div>
  );

  const catMeta = CATEGORIES[listing.category] || { label: 'Diğer', color: '#6b7280', bg: '#f3f4f6' };
  const priceDisplay = listing.is_free
    ? { label: 'Ücretsiz', color: '#059669', bg: '#d1fae5' }
    : listing.price !== null && listing.price !== undefined
      ? { label: `₺${Number(listing.price).toLocaleString('tr-TR')}`, color: '#0369a1', bg: '#dbeafe' }
      : { label: 'Fiyat Sorulur', color: '#94a3b8', bg: '#f1f5f9' };

  return (
    <div style={pageStyle} className="page-enter">
      <Navbar token={token} user={user} />
      <div style={containerStyle}>
        {/* Back */}
        <button onClick={() => navigate('/')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#627d98',
          fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 20, padding: '4px 0',
        }}>
          <ArrowLeft size={16} /> Tüm İlanlar
        </button>

        <div style={cardStyle}>
          {/* Top color strip */}
          <div style={{ height: 5, background: `linear-gradient(90deg, ${catMeta.color}, ${catMeta.color}66)` }} />

          <div style={{ padding: '32px 36px' }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <span style={{
                padding: '5px 14px', borderRadius: 20,
                background: catMeta.bg, color: catMeta.color,
                fontSize: 12, fontWeight: 700,
              }}>
                {catMeta.label}
              </span>
              <span style={{
                padding: '5px 14px', borderRadius: 20,
                background: priceDisplay.bg, color: priceDisplay.color,
                fontSize: 12, fontWeight: 700,
              }}>
                {priceDisplay.label}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a2540', marginBottom: 20, lineHeight: 1.3 }}>
              {listing.title}
            </h1>

            {/* Meta info */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 20,
              padding: '16px 20px', background: '#f8fafc', borderRadius: 12,
              marginBottom: 24, border: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #004f8c, #0369a1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {(listing.author_name || listing.user_name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Yayınlayan</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {listing.author_name || listing.user_name || 'Çalışan'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="#94a3b8" />
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Yayın Tarihi</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                    {formatDate(listing.created_at)}
                  </p>
                </div>
              </div>
              {listing.contact_info && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} color="#94a3b8" />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>İletişim</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                      {listing.contact_info}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Açıklama</h2>
              <p style={{
                fontSize: 15, color: '#475569', lineHeight: 1.75,
                whiteSpace: 'pre-wrap', margin: 0,
              }}>
                {listing.description}
              </p>
            </div>

            {/* Delete button */}
            {canDelete && (
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setShowConfirm(true)}
                  style={{
                    padding: '11px 24px', background: '#fef2f2',
                    color: '#dc2626', border: '1.5px solid #fecaca',
                    borderRadius: 10, fontWeight: 600, fontSize: 14,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Trash2 size={16} /> İlanı Kaldır
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,37,64,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '36px 36px',
            maxWidth: 440, width: '100%',
            boxShadow: '0 20px 60px rgba(10,37,64,0.25)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Trash2 size={26} color="#dc2626" />
            </div>
            <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#0a2540', marginBottom: 10 }}>
              İlan Kaldırılsın mı?
            </h3>
            <p style={{ textAlign: 'center', color: '#627d98', fontSize: 14, marginBottom: 28 }}>
              Bu ilan kalıcı olarak kaldırılacak ve geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '12px 0', background: '#f8fafc',
                  color: '#475569', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <X size={16} /> Vazgeç
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px 0',
                  background: deleting ? '#94a3b8' : '#dc2626',
                  color: '#fff', border: 'none',
                  borderRadius: 10, fontWeight: 600, fontSize: 14,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {deleting
                  ? <><Loader2 size={16} className="spin-animate" /> Kaldırılıyor...</>
                  : <><Trash2 size={16} /> Evet, Kaldır</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
