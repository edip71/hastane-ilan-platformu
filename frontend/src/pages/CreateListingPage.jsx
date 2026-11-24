import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  FileText, Tag, DollarSign, Phone, CheckCircle,
  AlertCircle, Loader2, ArrowLeft, Send
} from 'lucide-react';

const CATEGORIES = [
  { value: 'nobet-degisimi',        label: 'Nöbet Değişimi' },
  { value: 'ikinci-el-esya',        label: 'İkinci El Eşya' },
  { value: 'ev-arkadasligi',        label: 'Ev Arkadaşlığı' },
  { value: 'kiralik-ev',            label: 'Kiralık Ev' },
  { value: 'ulasim-yol-arkadasligi',label: 'Ulaşım / Yol Arkadaşlığı' },
  { value: 'kitap-ders-materyali',  label: 'Kitap & Ders Materyali' },
  { value: 'diger',                 label: 'Diğer' },
];

export default function CreateListingPage({ token, user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    isFree: false,
    contactInfo: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  /* ---- validation ---- */
  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title = 'Başlık zorunludur.';
    else if (form.title.length > 150) e.title = 'Başlık en fazla 150 karakter olabilir.';
    if (!form.description.trim()) e.description = 'Açıklama zorunludur.';
    else if (form.description.length > 2000) e.description = 'Açıklama en fazla 2000 karakter olabilir.';
    if (!form.category)           e.category = 'Kategori seçiniz.';
    if (!form.isFree) {
      if (form.price === '' || form.price === null) {
        // price is optional if not free — allow empty
      } else if (isNaN(Number(form.price)) || Number(form.price) < 0) {
        e.price = 'Geçerli bir fiyat giriniz.';
      }
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isFree' && checked ? { price: '' } : {}),
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const body = {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        is_free:     form.isFree,
        price:       form.isFree ? null : (form.price !== '' ? Number(form.price) : null),
        contact_info: form.contactInfo.trim() || null,
      };
      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'İlan oluşturulamadı.');
      setSuccess(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---- styles ---- */
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #edf4fa 0%, #f0f5fb 100%)',
  };
  const containerStyle = {
    maxWidth: 680,
    margin: '0 auto',
    padding: '32px 16px 64px',
  };
  const cardStyle = {
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(3,105,161,0.08)',
    padding: '40px 40px',
    border: '1px solid #e2e8f0',
  };
  const headerStyle = {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid #e2e8f0',
  };
  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    letterSpacing: '0.01em',
  };
  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '10px 14px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    borderRadius: 10,
    fontSize: 14,
    color: '#1e293b',
    background: '#f8fafc',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });
  const errorTextStyle = {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };
  const fieldGroupStyle = { marginBottom: 20 };

  /* ---- success screen ---- */
  if (success) {
    return (
      <div style={pageStyle}>
        <Navbar token={token} user={user} />
        <div style={containerStyle}>
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 40px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0a2540', marginBottom: 10 }}>
              İlan Yayına Alındı!
            </h2>
            <p style={{ color: '#627d98', fontSize: 15, marginBottom: 32 }}>
              İlanınız başarıyla oluşturuldu ve diğer çalışanlarla paylaşıldı.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 28px', background: '#004f8c', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <ArrowLeft size={16} /> İlanlara Dön
              </button>
              <button
                onClick={() => { setSuccess(false); setForm({ title:'',description:'',category:'',price:'',isFree:false,contactInfo:'' }); }}
                style={{
                  padding: '12px 28px', background: 'transparent', color: '#004f8c',
                  border: '1.5px solid #004f8c', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Yeni İlan Ver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="page-enter">
      <Navbar token={token} user={user} />
      <div style={containerStyle}>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: '#627d98',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            marginBottom: 20, padding: '4px 0',
          }}
        >
          <ArrowLeft size={16} /> İlanlara Dön
        </button>

        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0a2540', marginBottom: 6 }}>
              Yeni İlan Oluştur
            </h1>
            <p style={{ color: '#627d98', fontSize: 14 }}>
              Hastane çalışanlarıyla paylaşmak istediğiniz ilanı doldurun.
            </p>
          </div>

          {/* API error */}
          {apiError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
              color: '#dc2626', fontSize: 14,
            }}>
              <AlertCircle size={18} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Başlık */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <FileText size={14} color="#0369a1" /> Başlık <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                placeholder="Örn: Cuma nöbetimi devrediyorum"
                style={inputStyle(!!errors.title)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.title
                  ? <span style={errorTextStyle}><AlertCircle size={12} />{errors.title}</span>
                  : <span />
                }
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{form.title.length}/150</span>
              </div>
            </div>

            {/* Kategori */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Tag size={14} color="#0369a1" /> Kategori <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ ...inputStyle(!!errors.category), cursor: 'pointer' }}
              >
                <option value="">— Kategori Seçin —</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <span style={errorTextStyle}><AlertCircle size={12} />{errors.category}</span>}
            </div>

            {/* Açıklama */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <FileText size={14} color="#0369a1" /> Açıklama <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={2000}
                rows={5}
                placeholder="İlanınızı detaylıca açıklayın..."
                style={{ ...inputStyle(!!errors.description), resize: 'vertical', minHeight: 110, fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.description
                  ? <span style={errorTextStyle}><AlertCircle size={12} />{errors.description}</span>
                  : <span />
                }
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{form.description.length}/2000</span>
              </div>
            </div>

            {/* Fiyat */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <DollarSign size={14} color="#0369a1" /> Fiyat
                </span>
              </label>

              {/* Ücretsiz checkbox */}
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                marginBottom: 10, cursor: 'pointer', userSelect: 'none',
              }}>
                <input
                  type="checkbox"
                  name="isFree"
                  checked={form.isFree}
                  onChange={handleChange}
                  style={{ width: 16, height: 16, accentColor: '#004f8c' }}
                />
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Ücretsiz olarak paylaşıyorum</span>
              </label>

              {!form.isFree && (
                <div style={{ position: 'relative' }}>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    style={{ ...inputStyle(!!errors.price), paddingLeft: 36 }}
                  />
                  <span style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14,
                  }}>₺</span>
                  {errors.price && <span style={errorTextStyle}><AlertCircle size={12} />{errors.price}</span>}
                </div>
              )}
            </div>

            {/* İletişim */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Phone size={14} color="#0369a1" /> İletişim Bilgisi <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(isteğe bağlı)</span>
                </span>
              </label>
              <input
                name="contactInfo"
                value={form.contactInfo}
                onChange={handleChange}
                maxLength={200}
                placeholder="Dahili numara, e-posta veya mesai saatleri"
                style={inputStyle(false)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #004f8c, #0369a1)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 8,
                letterSpacing: '0.02em',
                transition: 'opacity 0.2s',
              }}
            >
              {loading
                ? <><Loader2 size={18} className="spin-animate" /> İlan Yayınlanıyor...</>
                : <><Send size={18} /> İlanı Yayınla</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
