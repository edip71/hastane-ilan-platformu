import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, RefreshCw, ArrowLeft } from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Durumlar
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userInfo, setUserInfo] = useState({ email: '', firstName: '' });

  // Form alanları
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Token doğrulama
  useEffect(() => {
    const verifyToken = async () => {
      setVerifying(true);
      setTokenError('');
      try {
        const res = await fetch(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          setUserInfo({ email: data.email, firstName: data.firstName });
        } else {
          setTokenValid(false);
          setTokenError(data.error || 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı.');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError('Sunucuya bağlanılamadı. Lütfen sunucunun çalıştığından emin olun.');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('Sıfırlama token kodu bulunamadı.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newPassword || !confirmPassword) {
      setFormError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Yeni şifreler birbiriyle uyuşmuyor.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Şifre güncellenemedi.');
      } else {
        setResetSuccess(true);
      }
    } catch (err) {
      setFormError('Sunucu bağlantı hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <AuthNavbar />

      <main style={styles.mainArea}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Yeni şifre belirleyin.</h1>
            <p style={styles.subtitle}>
              Hesabınızın güvenliği için güçlü ve daha önce kullanmadığınız bir şifre seçin.
            </p>
          </div>

          {verifying ? (
            <div style={styles.centerBox}>
              <RefreshCw size={36} color="#0284c7" className="spin-animate" style={{ marginBottom: 12 }} />
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Sıfırlama bağlantısının güvenliği doğrulanıyor...
              </p>
            </div>
          ) : !tokenValid ? (
            <div style={styles.errorBox}>
              <AlertCircle size={48} color="#dc2626" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '18px', fontWeight: '700' }}>
                Bağlantı Geçersiz veya Süresi Dolmuş
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                {tokenError} Güvenliğiniz için sıfırlama bağlantıları 15 dakika ile sınırlıdır ve tek kullanımlıktır.
              </p>
              <Link to="/sifremi-unuttum" style={styles.submitBtn}>
                Yeni Sıfırlama Bağlantısı İste
              </Link>
              <div style={{ marginTop: 16 }}>
                <Link to="/giris" style={styles.backLink}>
                  <ArrowLeft size={14} style={{ marginRight: 4 }} />
                  Giriş Ekranına Dön
                </Link>
              </div>
            </div>
          ) : resetSuccess ? (
            <div style={styles.successBox}>
              <CheckCircle2 size={54} color="#16a34a" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#16a34a', fontSize: '20px', fontWeight: '700' }}>
                Şifreniz Başarıyla Güncellendi!
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                Yeni belirlediğiniz şifreniz aktifleşti. Artık Şifahane kurumsal hesabınıza yeni şifrenizle giriş yapabilirsiniz.
              </p>
              <button
                onClick={() => navigate('/giris')}
                className="auth-button"
                style={styles.submitBtn}
              >
                <span>Giriş Ekranına Git</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.infoBanner}>
                <span style={{ fontSize: '12.5px', color: '#0369a1', lineHeight: '1.4' }}>
                  Sayın <strong>{userInfo.firstName}</strong> ({userInfo.email}), lütfen hesabınız için yeni şifrenizi tanımlayın.
                </span>
              </div>

              {formError && (
                <div style={styles.errorAlert}>
                  <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Yeni Şifre */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Yeni Şifre</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni şifreniz"
                    className="auth-input"
                    style={styles.input}
                    required
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
                  En az 6 karakter olmalı ve eski şifrenizle aynı olmamalıdır.
                </span>
              </div>

              {/* Yeni Şifre Tekrarı */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Yeni Şifre Tekrarı</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifreyi tekrar yazın"
                    className="auth-input"
                    style={styles.input}
                    required
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
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="auth-button"
                style={styles.submitBtn}
              >
                <span>{submitting ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle ve Kaydet'}</span>
                {!submitting && <ArrowRight size={18} />}
              </button>

              <div style={styles.footer}>
                <Link to="/giris" style={styles.backLink}>
                  <ArrowLeft size={14} style={{ marginRight: 4 }} />
                  Vazgeç ve Giriş Ekranına Dön
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
    maxWidth: '460px',
    padding: '36px 36px',
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'left',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0a2540',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#627d98',
    margin: 0,
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  infoBanner: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '10px 14px',
    boxSizing: 'border-box',
  },
  formGroup: {
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
    padding: '11px 40px 11px 38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box',
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
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
    boxSizing: 'border-box',
  },
  footer: {
    textAlign: 'center',
    marginTop: '12px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#0284c7',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: '600',
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
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '36px 0',
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
  },
};
