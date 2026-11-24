import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, user, onLogout }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Lütfen e-posta adresinizi ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
      } else {
        // Oturum bilgilerini kaydet
        onLoginSuccess(data.token, data.user);
        
        // Rol bazlı yönlendirme (Görev 03 kuralı)
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.');
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
            <h1 style={styles.title}>Giriş Yap</h1>
            <p style={styles.subtitle}>
              Personel hesabınızla giriş yaparak ilanları yönetebilirsiniz.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Hata Mesajı (Hatalı şifre, onay bekliyor, askıda vb.) */}
            {error && (
              <div style={styles.errorAlert}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* E-posta */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Kurumsal E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ad.soyad@hastane.gov.tr"
                style={styles.input}
              />
            </div>

            {/* Şifre */}
            <div style={styles.formGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Şifre</label>
              </div>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifreniz"
                  style={{ ...styles.input, paddingRight: '40px' }}
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
            </div>

            {/* Giriş Butonu */}
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
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>

            {/* Kayıt Ol Bağlantısı */}
            <div style={styles.footerLink}>
              Henüz hesabınız yok mu?{' '}
              <Link to="/kayit" style={styles.linkBold}>
                Hesap Oluştur
              </Link>
            </div>

          </form>

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
    maxWidth: '440px',
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
  formGroup: {
    marginBottom: '18px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: '10px',
  },
  footerLink: {
    textAlign: 'center',
    marginTop: '22px',
    fontSize: '13px',
    color: '#64748b',
  },
  linkBold: {
    color: '#004f8c',
    fontWeight: '700',
  },
};
