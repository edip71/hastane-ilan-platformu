import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <ShieldCheck size={32} color="#0284c7" />
          </div>
          <h1 style={styles.title}>Hastane İlan Platformu</h1>
          <p style={styles.subtitle}>Şifre Sıfırlama Talebi</p>
        </div>

        {errorMessage && (
          <div style={styles.errorAlert}>
            <AlertCircle size={20} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div style={styles.successBox}>
            <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: 12 }} />
            <h4 style={{ margin: '0 0 6px 0', color: '#16a34a', fontSize: '18px' }}>Talep İletildi</h4>
            <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Eğer bu kurumsal e-posta adresi sistemimizde kayıtlı ve aktif ise, şifre sıfırlama talimatları gönderilmiştir.
            </p>

            {devLink && (
              <div style={styles.devBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <ExternalLink size={16} color="#0369a1" />
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1' }}>
                    Staj / Test Simülasyonu (Doğrudan Sıfırlama Bağlantısı):
                  </span>
                </div>
                <Link to={devLink} style={styles.devLinkBtn}>
                  Şifremi Sıfırla Ekranına Git
                </Link>
              </div>
            )}

            <Link to="/giris" style={{ ...styles.button, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <ArrowLeft size={16} />
              Giriş Ekranına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleForgot} style={styles.form}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Hesabınıza ait kurumsal e-posta adresinizi girin. Size 15 dakika geçerli tek kullanımlık güvenli bir sıfırlama bağlantısı oluşturalım.
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Kurumsal E-posta</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#9ca3af" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@hastane.gov.tr"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'İletiliyor...' : 'Sıfırlama Bağlantısı Oluştur'}
            </button>

            <div style={styles.footer}>
              <Link to="/giris" style={styles.linkText}>
                ← Giriş Ekranına Geri Dön
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
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
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
  footer: {
    textAlign: 'center',
    marginTop: '8px',
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
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
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
    border: '1px dashed #0284c7',
    borderRadius: '8px',
    padding: '12px',
    boxSizing: 'border-box',
    marginBottom: '12px',
  },
  devLinkBtn: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    marginTop: '6px',
  },
};
