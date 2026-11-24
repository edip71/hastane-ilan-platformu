import React, { useState } from 'react';
import { User, Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = 'Ad alanı zorunludur.';
    if (!formData.lastName.trim()) errors.lastName = 'Soyad alanı zorunludur.';
    if (!formData.email.trim()) errors.email = 'Kurumsal e-posta alanı zorunludur.';
    if (!formData.password) errors.password = 'Şifre alanı zorunludur.';
    else if (formData.password.length < 6) errors.password = 'Şifre en az 6 karakter olmalıdır.';

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı uyuşmuyor.';
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'Kullanım koşullarını ve KVKK metnini onaylamalısınız.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.error || 'Kayıt sırasında bir hata oluştu.');
      } else {
        setSuccessMessage(data.message || 'Başvurunuz başarıyla alındı! Yönetici onayı bekleniyor.');
      }
    } catch (err) {
      setGeneralError('Sunucuya bağlanılamadı. Lütfen sunucunun açık olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <AuthNavbar />

      <main style={styles.mainArea}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Birlikte daha iyiye.</h1>
            <p style={styles.subtitle}>
              Kurumsal hesabınızı oluşturun, <span style={{ color: '#0369a1', fontWeight: '600' }}>Şifahane</span> ailesine katılın.
            </p>
          </div>

          {generalError && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
              <span>{generalError}</span>
            </div>
          )}

          {successMessage ? (
            <div style={styles.successBox}>
              <CheckCircle2 size={54} color="#16a34a" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#16a34a', margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700' }}>
                Kayıt Başvurunuz Alındı
              </h3>
              <p style={{ color: '#334155', margin: '0 0 8px 0', fontSize: '14px', textAlign: 'center', lineHeight: '1.5' }}>
                {successMessage}
              </p>
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: '0 0 20px 0' }}>
                Hastane yönetimi (Başhekimlik) başvurunuzu onayladığında kurumsal e-postanız ve şifrenizle giriş yapabileceksiniz.
              </p>
              <Link to="/giris" style={styles.returnBtn}>
                Giriş Ekranına Git
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Ad & Soyad - Yan Yana 2 Sütun */}
              <div style={styles.twoColRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ad</label>
                  <div style={styles.inputWrapper}>
                    <User size={18} color="#94a3b8" style={styles.inputIcon} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Adınız"
                      className="auth-input"
                      style={fieldErrors.firstName ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                  </div>
                  {fieldErrors.firstName && <span style={styles.errorText}>{fieldErrors.firstName}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Soyad</label>
                  <div style={styles.inputWrapper}>
                    <User size={18} color="#94a3b8" style={styles.inputIcon} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Soyadınız"
                      className="auth-input"
                      style={fieldErrors.lastName ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                  </div>
                  {fieldErrors.lastName && <span style={styles.errorText}>{fieldErrors.lastName}</span>}
                </div>
              </div>

              {/* Kurumsal E-posta */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Kurumsal E-posta</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ad.soyad@hastane.com"
                    className="auth-input"
                    style={fieldErrors.email ? { ...styles.input, ...styles.inputError } : styles.input}
                  />
                </div>
                {fieldErrors.email && <span style={styles.errorText}>{fieldErrors.email}</span>}
              </div>

              {/* Şifre */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Şifre</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Şifrenizi oluşturun"
                    className="auth-input"
                    style={fieldErrors.password ? { ...styles.input, ...styles.inputError } : styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    aria-label="Şifreyi Göster/Gizle"
                  >
                    {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                  </button>
                </div>
                <span style={styles.hintText}>
                  En az 6 karakter, bir büyük harf ve bir rakam kullanın.
                </span>
                {fieldErrors.password && <span style={styles.errorText}>{fieldErrors.password}</span>}
              </div>

              {/* Şifre Doğrulama */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Şifre Doğrulama</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Şifrenizi tekrar girin"
                    className="auth-input"
                    style={fieldErrors.confirmPassword ? { ...styles.input, ...styles.inputError } : styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    aria-label="Şifreyi Göster/Gizle"
                  >
                    {showConfirmPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <span style={styles.errorText}>{fieldErrors.confirmPassword}</span>
                )}
              </div>

              {/* KVKK ve Şartlar Onay Kutusu */}
              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <label htmlFor="termsAccepted" style={styles.checkboxLabel}>
                  <span style={styles.linkInline}>Kullanım Koşulları</span>'nı ve{' '}
                  <span style={styles.linkInline}>KVKK Aydınlatma Metni</span>'ni okudum, kabul ediyorum. <span style={{ color: '#dc2626' }}>*</span>
                </label>
              </div>
              {fieldErrors.termsAccepted && (
                <span style={{ ...styles.errorText, marginTop: '-6px' }}>{fieldErrors.termsAccepted}</span>
              )}

              {/* Kayıt Ol Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="auth-button"
                style={styles.submitBtn}
              >
                <span>{loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* Alt Bilgi */}
          <div style={styles.footer}>
            <span style={styles.footerText}>Zaten bir hesabınız var mı? </span>
            <Link to="/giris" style={styles.loginLink}>
              Giriş yap
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#edf4fa',
    display: 'flex',
    flexDirection: 'column',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 16px',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.06)',
    width: '100%',
    maxWidth: '520px',
    padding: '36px 36px',
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '26px',
    textAlign: 'left',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0a2540',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#627d98',
    margin: 0,
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  twoColRow: {
    display: 'flex',
    gap: '14px',
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334e68',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  hintText: {
    fontSize: '11px',
    color: '#829ab1',
    marginTop: '2px',
  },
  errorText: {
    fontSize: '12px',
    color: '#dc2626',
    fontWeight: '500',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '4px',
  },
  checkbox: {
    marginTop: '3px',
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    accentColor: '#0284c7',
  },
  checkboxLabel: {
    fontSize: '12.5px',
    color: '#486581',
    lineHeight: '1.45',
    cursor: 'pointer',
  },
  linkInline: {
    color: '#0284c7',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  submitBtn: {
    width: '100%',
    padding: '13px 20px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '6px',
    transition: 'background-color 0.15s ease',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
  },
  footerText: {
    color: '#627d98',
  },
  loginLink: {
    color: '#0284c7',
    fontWeight: '700',
    textDecoration: 'none',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontSize: '13px',
    marginBottom: '16px',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
  },
  returnBtn: {
    padding: '11px 24px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.15s',
  },
};
