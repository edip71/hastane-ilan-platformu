import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Search, Plus, Tag, DollarSign, User, Calendar,
  ChevronRight, Loader2, AlertCircle, FileX, ChevronDown,
  Stethoscope, Package, Home, Car, BookOpen, MoreHorizontal, ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  { value: '',                      label: 'Tümü',                    icon: null,         color: '#64748b', bg: '#f1f5f9' },
  { value: 'nobet-degisimi',        label: 'Nöbet Değişimi',          icon: Stethoscope,  color: '#0369a1', bg: '#dbeafe' },
  { value: 'ikinci-el-esya',        label: 'İkinci El Eşya',          icon: Package,      color: '#7c3aed', bg: '#ede9fe' },
  { value: 'ev-arkadasligi',        label: 'Ev Arkadaşlığı',          icon: Home,         color: '#059669', bg: '#d1fae5' },
  { value: 'kiralik-ev',            label: 'Kiralık Ev',              icon: Home,         color: '#d97706', bg: '#fef3c7' },
  { value: 'ulasim-yol-arkadasligi',label: 'Ulaşım / Yol Arkadaşlığı',icon: Car,         color: '#dc2626', bg: '#fee2e2' },
  { value: 'kitap-ders-materyali',  label: 'Kitap & Ders Materyali',  icon: BookOpen,     color: '#0891b2', bg: '#cffafe' },
  { value: 'diger',                 label: 'Diğer',                   icon: MoreHorizontal,color:'#6b7280', bg: '#f3f4f6' },
];

const getCatMeta = (val) => CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatPrice = (price, isFree) => {
  if (isFree) return { label: 'Ücretsiz', color: '#059669', bg: '#d1fae5' };
  if (price === null || price === undefined) return { label: 'Fiyat Sorulur', color: '#94a3b8', bg: '#f1f5f9' };
  return { label: `₺${Number(price).toLocaleString('tr-TR')}`, color: '#0369a1', bg: '#dbeafe' };
};

export default function HomePage({ token, user }) {
  const navigate  = useNavigate();
  const [listings, setListings]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState('');
  const [category, setCategory]   = useState('');
  const [search,   setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page,     setPage]       = useState(1);
  const [hasMore,  setHasMore]    = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 12;

  const fetchListings = useCallback(async (cat, q, pg, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (cat) params.set('category', cat);
      if (q)   params.set('search', q);
      const res  = await fetch(`http://localhost:5000/api/listings?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'İlanlar yüklenemedi.');
      const list = data.listings || data.data || data || [];
      const total = data.total || list.length;
      if (append) {
        setListings(prev => [...prev, ...list]);
      } else {
        setListings(list);
      }
      setHasMore(pg * LIMIT < total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchListings(category, search, 1, false);
  }, [category, search, fetchListings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(category, search, nextPage, true);
  };

  /* ---- styles ---- */
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #edf4fa 0%, #f4f8fd 60%, #e8f0f9 100%)',
  };
  const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 20px 64px',
  };
  const heroStyle = {
    background: 'linear-gradient(135deg, #004f8c 0%, #0369a1 100%)',
    borderRadius: 20,
    padding: '36px 40px',
    marginBottom: 32,
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
    boxShadow: '0 8px 32px rgba(3,105,161,0.25)',
  };

  return (
    <div style={pageStyle} className="page-enter">
      <Navbar token={token} user={user} />
      <div style={containerStyle}>

        {/* Hero */}
        <div style={heroStyle}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
              Hastane İlan Platformu
            </h1>
            <p style={{ marginTop: 8, opacity: 0.85, fontSize: 15, maxWidth: 460 }}>
              Nöbet değişimi, ikinci el eşya, ev arkadaşlığı ve daha fazlası için kurumsal ilan panosuna hoş geldiniz.
            </p>
          </div>
          <button
            onClick={() => navigate('/ilan/olustur')}
            style={{
              padding: '13px 26px',
              background: '#fff',
              color: '#004f8c',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={18} /> İlan Ver
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: 24, display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="İlan ara..."
              style={{
                width: '100%', padding: '12px 14px 12px 42px',
                border: '1.5px solid #e2e8f0', borderRadius: 12,
                fontSize: 14, color: '#1e293b', background: '#fff',
                outline: 'none', boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '12px 22px', background: '#004f8c', color: '#fff',
              border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Ara
          </button>
        </form>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28,
        }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.value;
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  padding: '8px 16px',
                  border: `1.5px solid ${active ? cat.color : '#e2e8f0'}`,
                  borderRadius: 24,
                  background: active ? cat.bg : '#fff',
                  color: active ? cat.color : '#475569',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                  boxShadow: active ? `0 2px 10px ${cat.bg}` : 'none',
                }}
              >
                {Icon && <Icon size={13} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#627d98' }}>
            <Loader2 size={36} className="spin-animate" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 15 }}>İlanlar yükleniyor...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14,
            padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14,
            color: '#dc2626', fontSize: 14,
          }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <FileX size={56} style={{ margin: '0 auto 20px', display: 'block', opacity: 0.5 }} />
            <p style={{ fontSize: 17, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              Henüz ilan bulunamadı
            </p>
            <p style={{ fontSize: 14, marginBottom: 24 }}>
              {search ? `"${search}" için sonuç yok.` : 'Bu kategoride ilan bulunmuyor.'}
            </p>
            <button
              onClick={() => navigate('/ilan/olustur')}
              style={{
                padding: '12px 24px', background: '#004f8c', color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <Plus size={16} /> İlk İlanı Sen Ver
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && listings.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
              marginBottom: 32,
            }}>
              {listings.map((item, i) => {
                const catMeta  = getCatMeta(item.category);
                const price    = formatPrice(item.price, item.is_free);
                const CatIcon  = catMeta.icon;
                return (
                  <div
                    key={item.id}
                    className="card-enter"
                    style={{
                      background: '#fff',
                      borderRadius: 16,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 12px rgba(3,105,161,0.07)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      animationDelay: `${i * 0.04}s`,
                    }}
                    onClick={() => navigate(`/ilan/${item.id}`)}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 28px rgba(3,105,161,0.14)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(3,105,161,0.07)';
                    }}
                  >
                    {/* Card header strip */}
                    <div style={{
                      height: 4,
                      background: `linear-gradient(90deg, ${catMeta.color}, ${catMeta.color}88)`,
                    }} />

                    <div style={{ padding: '20px 20px 16px' }}>
                      {/* Category + price badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 20,
                          background: catMeta.bg, color: catMeta.color,
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
                        }}>
                          {CatIcon && <CatIcon size={11} />} {catMeta.label}
                        </span>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20,
                          background: price.bg, color: price.color,
                          fontSize: 12, fontWeight: 700,
                        }}>
                          {price.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontSize: 15, fontWeight: 700, color: '#0a2540',
                        margin: '0 0 8px', lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p style={{
                        fontSize: 13, color: '#627d98', lineHeight: 1.5,
                        margin: 0, display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div style={{
                      marginTop: 'auto',
                      padding: '12px 20px 16px',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #004f8c, #0369a1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 11, fontWeight: 700,
                        }}>
                          {(item.author_name || item.user_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                            {item.author_name || item.user_name || 'Çalışan'}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                      <span style={{ color: '#0369a1', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                        Detay <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '13px 36px',
                    background: loadingMore ? '#94a3b8' : '#fff',
                    color: loadingMore ? '#fff' : '#004f8c',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {loadingMore
                    ? <><Loader2 size={16} className="spin-animate" /> Yükleniyor...</>
                    : <><ChevronDown size={16} /> Daha Fazla Yükle</>
                  }
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
