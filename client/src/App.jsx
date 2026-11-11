import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
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
    // Hata olan alanı temizle
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    const errors = {};

    // PDF Görev 02 Doğrulamaları
    if (!formData.firstName.trim()) errors.firstName = 'Ad alanı zorunludur.';
    if (!formData.lastName.trim()) errors.lastName = 'Soyad alanı zorunludur.';
    if (!formData.email.trim()) errors.email = 'Kurumsal e-posta alanı zorunludur.';
    if (!formData.password) errors.password = 'Şifre alanı zorunludur.';
    else if (formData.password.length < 6) errors.password = 'Şifre en az 6 karakter olmalıdır.';

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı uyuşmuyor.';
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'Kullanım koşullarını ve aydınlatma metnini onaylamalısınız.';
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
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          termsAccepted: false,
        });
      }
    } catch (err) {
      setGeneralError('Sunucuya bağlanılamadı. Backend servisinin açık olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <ShieldCheck size={32} color="#0284c7" />
          </div>
          <h1 style={styles.title}>Hastane İlan Platformu</h1>
          <p style={styles.subtitle}>Çalışan Kayıt Formu</p>
        </div>

        {generalError && (
          <div style={styles.errorAlert}>
            <AlertCircle size={20} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        {successMessage ? (
          <div style={styles.successBox}>
            <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: 12 }} />
            <h3 style={{ color: '#16a34a', margin: '0 0 8px 0', fontSize: 18 }}>Başvuru Alındı!</h3>
            <p style={{ color: '#374151', margin: 0, fontSize: 14, textAlign: 'center' }}>
              {successMessage}
            </p>
            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>
              Hesabınız hastane yöneticisi tarafından incelendikten sonra giriş yapabileceksiniz.
            </p>
            <button
              onClick={() => setSuccessMessage('')}
              style={{ ...styles.button, marginTop: 16, width: 'auto', padding: '8px 24px' }}
            >
              Yeni Kayıt Yap
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Ad</label>
                <div style={styles.inputWrapper}>
                  <User size={18} color="#9ca3af" style={styles.inputIcon} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Adınız"
                    style={fieldErrors.firstName ? { ...styles.input, ...styles.inputError } : styles.input}
                  />
                </div>
                {fieldErrors.firstName && <span style={styles.errorText}>{fieldErrors.firstName}</span>}
              </div>

              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Soyad</label>
                <div style={styles.inputWrapper}>
                  <User size={18} color="#9ca3af" style={styles.inputIcon} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Soyadınız"
                    style={fieldErrors.lastName ? { ...styles.input, ...styles.inputError } : styles.input}
                  />
                </div>
                {fieldErrors.lastName && <span style={styles.errorText}>{fieldErrors.lastName}</span>}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Kurumsal E-posta</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#9ca3af" style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@hastane.gov.tr"
                  style={fieldErrors.email ? { ...styles.input, ...styles.inputError } : styles.input}
                />
              </div>
              {fieldErrors.email && <span style={styles.errorText}>{fieldErrors.email}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Şifre</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={fieldErrors.password ? { ...styles.input, ...styles.inputError } : styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </button>
              </div>
              {fieldErrors.password && <span style={styles.errorText}>{fieldErrors.password}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Şifre Tekrarı</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={fieldErrors.confirmPassword ? { ...styles.input, ...styles.inputError } : styles.input}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <span style={styles.errorText}>{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="termsAccepted"
                id="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                style={{ cursor: 'pointer', marginTop: 3 }}
              />
              <label htmlFor="termsAccepted" style={styles.checkboxLabel}>
                Hastane kurumsal ilan platformu kullanım koşullarını ve KVKK aydınlatma metnini okudum, kabul ediyorum.
              </label>
            </div>
            {fieldErrors.termsAccepted && (
              <span style={{ ...styles.errorText, marginTop: -8 }}>{fieldErrors.termsAccepted}</span>
            )}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Zaten bir hesabınız var mı?{' '}
            <span style={styles.linkText}>Giriş Yap</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '480px',
    padding: '32px 28px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    backgroundColor: '#e0f2fe',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
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
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginTop: '4px',
  },
  checkboxLabel: {
    fontSize: '12px',
    color: '#4b5563',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  button: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '16px',
  },
  footerText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  linkText: {
    color: '#0284c7',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
