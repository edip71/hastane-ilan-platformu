import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <ShieldCheck size={32} color="#0284c7" />
          </div>
          <h1 style={styles.title}>Hastane İlan Platformu</h1>
          <p style={styles.subtitle}>Yeni Şifre Belirleme</p>
        </div>

        {verifying ? (
          <div style={styles.centerBox}>
            <RefreshCw size={36} color="#0284c7" className="spin-animate" style={{ marginBottom: 12 }} />
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Sıfırlama bağlantısı güvenliği doğrulanıyor...
            </p>
          </div>
        ) : !tokenValid ? (
          <div style={styles.errorBox}>
            <AlertCircle size={48} color="#dc2626" style={{ marginBottom: 12 }} />
            <h4 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '17px' }}>
              Bağlantı Geçersiz veya Süresi Dolmuş
            </h4>
            <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              {tokenError} Güvenliğiniz için sıfırlama bağlantıları yalnızca 15 dakika geçerlidir ve tek kullanımlıktır.
            </p>
            <Link to="/sifremi-unuttum" style={styles.buttonLink}>
              Yeni Sıfırlama Bağlantısı İste
            </Link>
            <div style={{ marginTop: 12 }}>
              <Link to="/giris" style={styles.linkText}>
                Giriş Ekranına Dön
              </Link>
            </div>
          </div>
        ) : resetSuccess ? (
          <div style={styles.successBox}>
            <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: 12 }} />
            <h4 style={{ margin: '0 0 8px 0', color: '#16a34a', fontSize: '18px' }}>
              Şifreniz Başarıyla Güncellendi!
            </h4>
            <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              Artık yeni belirlediğiniz güvenli şifreniz ile kurumsal platforma giriş yapabilirsiniz.
            </p>
            <button onClick={() => navigate('/giris')} style={{ ...styles.button, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Giriş Ekranına Git
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.infoBanner}>
              <span style={{ fontSize: '12px', color: '#0369a1' }}>
                Sayın <strong>{userInfo.firstName}</strong> ({userInfo.email}), lütfen hesabınız için yeni bir şifre belirleyin.
              </span>
            </div>

            {formError && (
              <div style={styles.errorAlert}>
                <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Yeni Şifre</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Yeni Şifre Tekrarı</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setNewPassword ? setConfirmPassword(e.target.value) : null}
                  placeholder="Şifreyi tekrar yazın"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} style={styles.button}>
              {submitting ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle ve Kaydet'}
            </button>

            <div style={styles.footer}>
              <Link to="/giris" style={styles.linkText}>
                Vazgeç ve Giriş Ekranına Dön
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '440px',
    padding: '32px 28px',
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
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
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoBanner: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '10px 12px',
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
    color: '#334155',
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
    padding: '10px 40px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonLink: {
    display: 'inline-block',
    textAlign: 'center',
    width: '100%',
    padding: '12px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  footer: {
    textAlign: 'center',
    marginTop: '6px',
  },
  linkText: {
    color: '#0284c7',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: '500',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '13px',
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 0',
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
