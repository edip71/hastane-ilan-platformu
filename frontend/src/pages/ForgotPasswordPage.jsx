import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleForgot = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setDevLink('');

    if (!email.trim()) {
      setErrorMessage('Lütfen kurumsal e-posta adresinizi girin.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Şifre sıfırlama talebi gönderilemedi.');
      } else {
        setSubmitted(true);
        if (data.devToken) {
          setDevLink(`/sifremi-sifirla/${data.devToken}`);
        }
      }
    } catch (err) {
      setErrorMessage('Sunucuya bağlanılamadı. Lütfen sunucunun açık olduğundan emin olun.');
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
            <h1 style={styles.title}>Şifrenizi mi unuttunuz?</h1>
            <p style={styles.subtitle}>
              Kurumsal e-posta adresinizi girin, size 15 dakika geçerli tek kullanımlık sıfırlama bağlantınızı oluşturalım.
            </p>
          </div>

          {errorMessage && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div style={styles.successBox}>
              <CheckCircle2 size={52} color="#16a34a" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#16a34a', fontSize: '20px', fontWeight: '700' }}>
                Talep Başarıyla İletildi
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', textAlign: 'center', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Eğer bu kurumsal e-posta adresi sistemimizde kayıtlı ve aktif ise, şifre sıfırlama talimatları hazırlanmıştır.
              </p>

              {devLink && (
                <div style={styles.devBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <ExternalLink size={16} color="#0369a1" />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1' }}>
                      Staj & Test Kolaylığı (Doğrudan Sıfırlama Bağlantısı):
                    </span>
                  </div>
                  <Link to={devLink} style={styles.devLinkBtn}>
                    <span>Şifremi Sıfırla Ekranına Git</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <Link to="/giris" style={styles.backBtn}>
                <ArrowLeft size={16} />
                <span>Giriş Ekranına Dön</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleForgot} style={styles.form}>
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
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
                style={styles.submitBtn}
              >
                <span>{loading ? 'Bağlantı Hazırlanıyor...' : 'Sıfırlama Bağlantısı Oluştur'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>

              <div style={styles.footer}>
                <Link to="/giris" style={styles.backLink}>
                  <ArrowLeft size={14} style={{ marginRight: 4 }} />
                  Giriş ekranına geri dön
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
    marginBottom: '16px',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
  },
  devBox: {
    width: '100%',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '14px',
    boxSizing: 'border-box',
    marginBottom: '16px',
  },
  devLinkBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    color: '#334e68',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    marginTop: '4px',
  },
};
