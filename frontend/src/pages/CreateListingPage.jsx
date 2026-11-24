import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  PlusCircle, Upload, X, CheckCircle2, AlertCircle, 
  ArrowLeft, Eye, Save, Send, Image as ImageIcon, Loader2, Info
} from 'lucide-react';

export default function CreateListingPage({ user, token, onLogout }) {
  const navigate = useNavigate();

  // Oturum Kontrolü (Yalnızca giriş yapmış personeller ilan verebilir)
  useEffect(() => {
    if (!token) {
      navigate('/giris');
    }
  }, [token, navigate]);

  // Kategoriler Listesi (Görev 06 API'sinden gelir)
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form Verileri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [customValues, setCustomValues] = useState({});

  // Fotoğraflar (Base64 data URL)
  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  // Durumlar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Kategorileri Çek
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        // Yalnızca alt kategorileri veya alt kategorisi olmayan ana kategorileri seçilebilir kıl
        const flat = data.flat || [];
        setCategories(flat);
      })
      .catch(() => setError('Kategoriler yüklenemedi.'));
  }, []);

  // Kategori Değiştiğinde
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategoryId(catId);
    const cat = categories.find(c => c.id === parseInt(catId, 10));
    setSelectedCategory(cat || null);
    // Dinamik alan değerlerini sıfırla
    setCustomValues({});
  };

  // Dinamik Alan Değişimi
  const handleCustomValueChange = (fieldName, val) => {
    setCustomValues(prev => ({ ...prev, [fieldName]: val }));
  };

  // Fotoğraf Yükleme (Maksimum 5 Adet, 2MB Sınırı)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError('En fazla 5 adet fotoğraf yükleyebilirsiniz.');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Lütfen yalnızca geçerli bir resim dosyası seçiniz.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Her bir fotoğraf boyutu en fazla 2MB olabilir.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => {
          if (prev.length >= 5) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (coverIndex >= images.length - 1) {
      setCoverIndex(0);
    }
  };

  // Gönderim Fonksiyonu (Taslak veya Onaya Gönder)
  const handleSubmit = async (isDraft = false) => {
    setError('');
    setSuccess('');

    // Taslak değilse ön doğrulamalar
    if (!isDraft) {
      if (!selectedCategoryId) {
        setError('Lütfen bir kategori seçiniz.');
        return;
      }
      if (!title.trim() || title.trim().length < 5) {
        setError('Başlık en az 5 karakter olmalıdır.');
        return;
      }
      if (!description.trim() || description.trim().length < 10) {
        setError('Açıklama en az 10 karakter olmalıdır.');
        return;
      }
      if (!isFree && (!price || isNaN(Number(price)) || Number(price) < 0)) {
        setError('Lütfen geçerli bir fiyat giriniz veya ücretsiz seçeneğini işaretleyiniz.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        categoryId: selectedCategoryId,
        title: title.trim(),
        description: description.trim(),
        price: isFree ? null : (price ? Number(price) : null),
        isFree: Boolean(isFree),
        contactInfo: contactInfo.trim(),
        location: location.trim(),
        customValues,
        images,
        coverImage: images[coverIndex] || null,
        isDraft: Boolean(isDraft)
      };

      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'İlan kaydedilemedi.');
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="page-fade">
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.main}>
        <div style={styles.container}>
          
          {/* Üst Başlık & Geri Dön Butonu */}
          <div style={styles.pageHeader}>
            <button onClick={() => navigate('/')} style={styles.btnBack}>
              <ArrowLeft size={16} />
              <span>İlanlara Dön</span>
            </button>
            <h1 style={styles.pageTitle}>Ücretsiz İlan Ver</h1>
            <p style={styles.pageSubtitle}>
              İkinci el veya ihtiyaç fazlası eşyalarınızı kurum personelleriyle güvenle paylaşın.
            </p>
          </div>

          {/* Bildirimler */}
          {success ? (
            <div style={styles.successBox}>
              <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: '12px' }} />
              <h2 style={styles.successTitle}>Tebrikler!</h2>
              <p style={styles.successText}>{success}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => navigate('/')} style={styles.btnPrimary}>
                  Ana Sayfaya Dön
                </button>
                <button 
                  onClick={() => {
                    setSuccess('');
                    setTitle('');
                    setDescription('');
                    setPrice('');
                    setImages([]);
                    setCustomValues({});
                  }} 
                  style={styles.btnSecondary}
                >
                  Yeni İlan Ver
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.layout}>
              
              {/* SOL FORM ALANI */}
              <div style={styles.formCard}>
                
                {error && (
                  <div style={styles.errorAlert}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Kategori Seçimi */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kategori Seçiniz *</label>
                  <select 
                    value={selectedCategoryId} 
                    onChange={handleCategoryChange}
                    style={styles.select}
                  >
                    <option value="">-- Kategori Seçin --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.parent_id ? `— ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kategoriye Ait Dinamik Özel Alanlar */}
                {selectedCategory && Array.isArray(selectedCategory.custom_fields) && selectedCategory.custom_fields.length > 0 && (
                  <div style={styles.customFieldsBox}>
                    <div style={styles.customFieldsHeader}>
                      <Info size={16} color="#004f8c" />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#004f8c' }}>
                        {selectedCategory.name} Kategorisi Özellikleri
                      </span>
                    </div>

                    <div style={styles.customFieldsGrid}>
                      {selectedCategory.custom_fields.map((f, i) => (
                        <div key={i} style={styles.customFieldItem}>
                          <label style={styles.label}>
                            {f.name} {f.required && <span style={{ color: '#dc2626' }}>*</span>}
                          </label>
                          {f.type === 'select' ? (
                            <select
                              value={customValues[f.name] || ''}
                              onChange={(e) => handleCustomValueChange(f.name, e.target.value)}
                              style={styles.select}
                            >
                              <option value="">Seçiniz</option>
                              {(f.options || []).map((opt, oi) => (
                                <option key={oi} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={f.type === 'number' ? 'number' : 'text'}
                              value={customValues[f.name] || ''}
                              onChange={(e) => handleCustomValueChange(f.name, e.target.value)}
                              placeholder={f.name}
                              style={styles.input}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. İlan Başlığı */}
                <div style={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={styles.label}>İlan Başlığı *</label>
                    <span style={styles.charCount}>{title.length}/150</span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={150}
                    placeholder="Örn: Tertemiz 24 inç Bilgisayar Monitörü"
                    style={styles.input}
                  />
                </div>

                {/* 3. Açıklama */}
                <div style={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={styles.label}>Detaylı Açıklama *</label>
                    <span style={styles.charCount}>{description.length}/2000</span>
                  </div>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2000}
                    placeholder="Ürünün durumunu, varsa garantisini ve teslim koşullarını belirtin..."
                    style={styles.textarea}
                  />
                </div>

                {/* 4. Fiyat ve Ücretsiz Seçeneği */}
                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Fiyat (TL) {!isFree && '*'}</label>
                    <input
                      type="number"
                      disabled={isFree}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      style={{
                        ...styles.input,
                        backgroundColor: isFree ? '#f1f5f9' : '#ffffff',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => {
                          setIsFree(e.target.checked);
                          if (e.target.checked) setPrice('');
                        }}
                      />
                      <span>Ücretsiz Paylaşım</span>
                    </label>
                  </div>
                </div>

                {/* 5. Konum ve İletişim */}
                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Kurum İçi Konum / Birim</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Örn: A Blok 3. Kat / Kardiyoloji"
                      style={styles.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>İletişim / Dahili No</label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Örn: Dahili 4210"
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* 6. Fotoğraf Yükleme Bölümü */}
                <div style={styles.photoSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={styles.label}>Fotoğraflar (En fazla 5 adet, max 2MB)</label>
                    <span style={styles.charCount}>{images.length}/5</span>
                  </div>

                  <div style={styles.photoGrid}>
                    {images.map((img, i) => (
                      <div key={i} style={styles.photoThumb}>
                        <img src={img} alt="Yüklenen" style={styles.thumbImg} />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(i)}
                          style={styles.btnRemovePhoto}
                        >
                          <X size={12} />
                        </button>
                        {coverIndex === i ? (
                          <span style={styles.coverBadge}>Kapak</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCoverIndex(i)}
                            style={styles.btnMakeCover}
                          >
                            Kapak Yap
                          </button>
                        )}
                      </div>
                    ))}

                    {images.length < 5 && (
                      <label style={styles.uploadBox}>
                        <Upload size={22} color="#004f8c" />
                        <span style={styles.uploadText}>Fotoğraf Ekle</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Buton Aksiyonları: Önizleme / Taslak / Onaya Gönder */}
                <div style={styles.actionsBar}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    style={styles.btnActionSecondary}
                  >
                    <Eye size={16} />
                    <span>{previewMode ? 'Önizlemeyi Gizle' : 'Önizle'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmit(true)}
                    style={styles.btnActionSecondary}
                  >
                    <Save size={16} />
                    <span>Taslak Kaydet</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmit(false)}
                    style={styles.btnActionPrimary}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin-animate" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Onaya Gönder</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* SAĞ CANLI ÖNİZLEME (PREVIEW ALANI) */}
              {previewMode && (
                <div style={styles.previewCard}>
                  <div style={styles.previewHeader}>
                    <Eye size={16} color="#004f8c" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                      Canlı İlan Önizlemesi
                    </span>
                  </div>

                  <div style={styles.previewImgBox}>
                    {images.length > 0 ? (
                      <img src={images[coverIndex] || images[0]} alt="Kapak" style={styles.previewCover} />
                    ) : (
                      <div style={styles.noImgBox}>
                        <ImageIcon size={36} color="#cbd5e1" />
                        <span>Fotoğraf Eklenmedi</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.previewBody}>
                    <div style={styles.previewPrice}>
                      {isFree ? 'ÜCRETSİZ' : (price ? `${Number(price).toLocaleString('tr-TR')} TL` : 'Fiyat Belirtilmedi')}
                    </div>
                    <h3 style={styles.previewTitle}>
                      {title || 'İlan Başlığı Burada Görünecek'}
                    </h3>
                    <p style={styles.previewDesc}>
                      {description || 'İlan açıklaması burada yer alacaktır.'}
                    </p>

                    {/* Dinamik Alan Önizlemesi */}
                    {Object.keys(customValues).length > 0 && (
                      <div style={styles.previewCustomValues}>
                        {Object.entries(customValues).map(([k, v]) => (
                          <div key={k} style={styles.previewFieldItem}>
                            <strong>{k}:</strong> {v}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={styles.previewMeta}>
                      <span>{location || 'Konum belirtilmedi'}</span>
                      <span>{contactInfo ? `İletişim: ${contactInfo}` : ''}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

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
  pageHeader: {
    marginBottom: '20px',
  },
  btnBack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '8px',
    padding: 0,
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  layout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  charCount: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    alignItems: 'flex-start',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#334155',
    fontWeight: '500',
    cursor: 'pointer',
  },
  customFieldsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '14px',
    marginBottom: '18px',
  },
  customFieldsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
  },
  customFieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  customFieldItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  photoSection: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
    marginBottom: '20px',
  },
  photoGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  photoThumb: {
    width: '90px',
    height: '90px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  btnRemovePhoto: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  coverBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    fontSize: '10px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '700',
  },
  btnMakeCover: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    fontSize: '9px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#ffffff',
    border: 'none',
    padding: '2px 4px',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  uploadBox: {
    width: '90px',
    height: '90px',
    borderRadius: '6px',
    border: '2px dashed #004f8c',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    backgroundColor: '#f0f9ff',
  },
  uploadText: {
    fontSize: '11px',
    color: '#004f8c',
    fontWeight: '600',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '18px',
  },
  btnActionSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  btnActionPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 20px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  previewCard: {
    width: '320px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: '80px',
  },
  previewHeader: {
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  previewImgBox: {
    height: '180px',
    backgroundColor: '#e2e8f0',
  },
  previewCover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImgBox: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '12px',
    gap: '6px',
  },
  previewBody: {
    padding: '14px',
  },
  previewPrice: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#004f8c',
    marginBottom: '6px',
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  previewDesc: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.4',
    marginBottom: '10px',
    maxHeight: '60px',
    overflow: 'hidden',
  },
  previewCustomValues: {
    backgroundColor: '#f8fafc',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#334155',
    marginBottom: '10px',
  },
  previewFieldItem: {
    marginBottom: '2px',
  },
  previewMeta: {
    fontSize: '11px',
    color: '#94a3b8',
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '8px',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  successBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '48px 24px',
    textAlign: 'center',
    maxWidth: '560px',
    margin: '0 auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#15803d',
    margin: '0 0 8px 0',
  },
  successText: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  btnPrimary: {
    padding: '10px 20px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
