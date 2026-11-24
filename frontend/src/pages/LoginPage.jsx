import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Clock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorCode('');

    if (!email.trim() || !password) {
      setError('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Giriş yapılamadı.');
        if (data.statusCode) setErrorCode(data.statusCode);
      } else {
        onLoginSuccess(data.user, data.token);
        if (data.user.role === 'admin' || data.user.role === 'moderator') {
          navigate('/yonetim/kullanicilar');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Sunucuya erişilemiyor. Lütfen sunucunun açık olduğundan emin olun.');
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
            <h1 style={styles.title}>Tekrar hoş geldiniz.</h1>
            <p style={styles.subtitle}>
              <span style={{ color: '#0369a1', fontWeight: '600' }}>Şifahane</span> kurumsal hesabınızla güvenli giriş yapın.
            </p>
          </div>

          {error && (
            <div style={errorCode === 'ACCOUNT_PENDING' ? styles.warningAlert : styles.errorAlert}>
              {errorCode === 'ACCOUNT_PENDING' ? (
                <Clock size={20} style={{ marginRight: 8, flexShrink: 0 }} />
              ) : (
                <AlertCircle size={20} style={{ marginRight: 8, flexShrink: 0 }} />
              )}
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Kurumsal E-posta */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Kurumsal E-posta</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ad.soyad@hastane.com"
                  className="auth-input"
                  style={styles.input}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Şifre & Şifremi Unuttum */}
            <div style={styles.formGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Şifre</label>
                <Link to="/sifremi-unuttum" style={styles.forgotLink}>
                  Şifremi unuttum?
                </Link>
              </div>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  style={styles.input}
                  autoComplete="current-password"
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
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="auth-button"
              style={styles.submitBtn}
            >
              <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Alt Bilgi */}
          <div style={styles.footer}>
            <span style={styles.footerText}>Henüz bir hesabınız yok mu? </span>
            <Link to="/kayit" style={styles.registerLink}>
              Kayıt olun
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
    maxWidth: '460px',
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
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334e68',
  },
  forgotLink: {
    fontSize: '12.5px',
    color: '#0284c7',
    textDecoration: 'none',
    fontWeight: '600',
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
  registerLink: {
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
  warningAlert: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    color: '#b45309',
    fontSize: '13px',
    marginBottom: '16px',
  },
};
