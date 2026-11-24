import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage({ user, onLogout }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    kvkkApproved: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // İstemci Doğrulamaları (Client-side Validation)
  const validateForm = () => {
    const errors = {};

    // 1. Ad Kontrolü
    if (!formData.firstName.trim()) {
      errors.firstName = 'Ad alanı zorunludur.';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'Ad en az 2 karakter olmalıdır.';
    }

    // 2. Soyad Kontrolü
    if (!formData.lastName.trim()) {
      errors.lastName = 'Soyad alanı zorunludur.';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Soyad en az 2 karakter olmalıdır.';
    }

    // 3. E-posta Kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'E-posta adresi zorunludur.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Geçerli bir e-posta formatı giriniz (Örn: isim@kurum.com).';
    }

    // 4. Şifre Gücü Kontrolü
    if (!formData.password) {
      errors.password = 'Şifre alanı zorunludur.';
    } else {
      const pass = formData.password;
      const isLength = pass.length >= 8;
      const hasUpper = /[A-ZÇĞİÖŞÜ]/.test(pass);
      const hasLower = /[a-zçğıöşü]/.test(pass);
      const hasNum = /[0-9]/.test(pass);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/]/.test(pass);

      if (!isLength || !hasUpper || !hasLower || !hasNum || !hasSpecial) {
        errors.password = 'Şifreniz en az 8 karakter olmalı; büyük harf, küçük harf, rakam ve özel karakter içermelidir.';
      }
    }

    // 5. Şifre Tekrarı Eşleşmesi
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı zorunludur.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifreler birbiriyle eşleşmiyor.';
    }

    // 6. KVKK Onayı
    if (!formData.kvkkApproved) {
      errors.kvkkApproved = 'Kayıt olabilmek için aydınlatma metnini onaylamanız zorunludur.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Alan değiştikçe o alana ait hatayı temizle
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          kvkkApproved: formData.kvkkApproved,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || 'Kayıt sırasında bir hata oluştu.');
      } else {
        setSuccessMessage(data.message || 'Kayıt başvurunuz başarıyla alındı. Yönetici onayı bekleniyor.');
      }
    } catch (err) {
      setApiError('Sunucuya bağlanılamadı. Lütfen sunucunun açık olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.main}>
        <div style={styles.card}>
          
          <div style={styles.header}>
            <h1 style={styles.title}>Yeni Hesap Oluştur</h1>
            <p style={styles.subtitle}>
              İlan vermek ve ilanları takip etmek için personel hesabınızı oluşturun.
            </p>
          </div>

          {/* Başarı Mesajı (Yönetici Onayı Bekleniyor) */}
          {successMessage ? (
            <div style={styles.successBox}>
              <CheckCircle2 size={40} color="#16a34a" style={{ marginBottom: '12px' }} />
              <h2 style={styles.successTitle}>Başvurunuz Alındı!</h2>
              <p style={styles.successText}>{successMessage}</p>
              <button 
                onClick={() => navigate('/giris')} 
                style={styles.btnPrimary}
              >
                Giriş Sayfasına Git
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Sunucu Hatası */}
              {apiError && (
                <div style={styles.errorAlert}>
                  <AlertCircle size={18} />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Ad & Soyad */}
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Adınız *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Adınız"
                    style={{
                      ...styles.input,
                      borderColor: formErrors.firstName ? '#dc2626' : '#cbd5e1',
                    }}
                  />
                  {formErrors.firstName && (
                    <span style={styles.fieldError}>{formErrors.firstName}</span>
                  )}
                </div>

                <div style={styles.col}>
                  <label style={styles.label}>Soyadınız *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Soyadınız"
                    style={{
                      ...styles.input,
                      borderColor: formErrors.lastName ? '#dc2626' : '#cbd5e1',
                    }}
                  />
                  {formErrors.lastName && (
                    <span style={styles.fieldError}>{formErrors.lastName}</span>
                  )}
                </div>
              </div>

              {/* E-posta */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Kurumsal E-posta Adresi *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@hastane.gov.tr"
                  style={{
                    ...styles.input,
                    borderColor: formErrors.email ? '#dc2626' : '#cbd5e1',
                  }}
                />
                {formErrors.email && (
                  <span style={styles.fieldError}>{formErrors.email}</span>
                )}
              </div>

              {/* Şifre */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Şifre *</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="En az 8 karakter (Büyük, küçük harf, rakam, özel karakter)"
                    style={{
                      ...styles.input,
                      borderColor: formErrors.password ? '#dc2626' : '#cbd5e1',
                      paddingRight: '40px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                  </button>
                </div>
                {formErrors.password && (
                  <span style={styles.fieldError}>{formErrors.password}</span>
                )}
              </div>

              {/* Şifre Tekrar */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Şifre Tekrarı *</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Şifrenizi tekrar girin"
                    style={{
                      ...styles.input,
                      borderColor: formErrors.confirmPassword ? '#dc2626' : '#cbd5e1',
                      paddingRight: '40px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span style={styles.fieldError}>{formErrors.confirmPassword}</span>
                )}
              </div>

              {/* KVKK Onay Kutusu */}
              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="kvkk"
                  name="kvkkApproved"
                  checked={formData.kvkkApproved}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <label htmlFor="kvkk" style={styles.checkboxLabel}>
                  <span>
                    Kullanıcı Sözleşmesi ve <strong>KVKK Aydınlatma Metni</strong>'ni okudum, kişisel verilerimin işlenmesini kabul ediyorum. *
                  </span>
                </label>
              </div>
              {formErrors.kvkkApproved && (
                <div style={{ ...styles.fieldError, marginTop: '-10px', marginBottom: '14px' }}>
                  {formErrors.kvkkApproved}
                </div>
              )}

              {/* Kayıt Butonu */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.btnSubmit,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Kaydınız Yapılıyor...</span>
                  </>
                ) : (
                  <span>Hesap Oluştur</span>
                )}
              </button>

              {/* Giriş Yap Yönlendirmesi */}
              <div style={styles.footerLink}>
                Zaten hesabınız var mı?{' '}
                <Link to="/giris" style={styles.linkBold}>
                  Giriş Yap
                </Link>
              </div>

            </form>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '32px 28px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  col: {
    flex: 1,
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
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldError: {
    display: 'block',
    fontSize: '12px',
    color: '#dc2626',
    marginTop: '4px',
    fontWeight: '500',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px 14px',
    color: '#b91c1c',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '18px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '16px',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: '3px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '12px',
    color: '#475569',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  btnSubmit: {
    width: '100%',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  footerLink: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
    color: '#64748b',
  },
  linkBold: {
    color: '#004f8c',
    fontWeight: '700',
  },
  successBox: {
    textAlign: 'center',
    padding: '20px 0',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#15803d',
    marginBottom: '8px',
  },
  successText: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  btnPrimary: {
    padding: '10px 24px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
