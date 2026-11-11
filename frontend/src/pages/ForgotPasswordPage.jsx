import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleForgot = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
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

        {submitted ? (
          <div style={styles.successBox}>
            <CheckCircle2 size={44} color="#16a34a" style={{ marginBottom: 12 }} />
            <h4 style={{ margin: '0 0 6px 0', color: '#16a34a', fontSize: '17px' }}>Bağlantı Gönderildi</h4>
            <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', margin: 0, lineHeight: '1.5' }}>
              Eğer bu e-posta sistemde kayıtlı ise, şifre sıfırlama bağlantısı iletilmiştir.
            </p>
            <Link to="/giris" style={{ ...styles.button, textDecoration: 'none', display: 'inline-block', marginTop: 18 }}>
              Giriş Ekranına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleForgot} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Kayıtlı Kurumsal E-posta</label>
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
            <button type="submit" style={styles.button}>
              Sıfırlama Bağlantısı Gönder
            </button>
            <div style={styles.footer}>
              <Link to="/giris" style={styles.linkText}>
                Giriş Ekranına Geri Dön
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
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
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
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
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
    marginTop: '6px',
    textAlign: 'center',
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
    marginTop: '20px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
  },
  linkText: {
    color: '#0284c7',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '13px',
  },
};
