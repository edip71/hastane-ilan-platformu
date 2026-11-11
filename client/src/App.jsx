import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  LayoutDashboard,
  Home,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // Görünüm Durumu: 'login' (Giriş), 'register' (Kayıt), 'forgot' (Şifremi Unuttum)
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Oturum Kontrolü (Sayfa ilk açıldığında veya yenilendiğinde)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Geçersiz oturum');
        })
        .then((data) => {
          setCurrentUser(data.user);
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setCurrentView('login');
  };

  // Eğer kullanıcı oturum açmışsa, rolüne göre yönlendirilen alanı göster (Görev 03 kuralı)
  if (currentUser) {
    return (
      <DashboardView
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Üst Logo ve Başlık */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <ShieldCheck size={32} color="#0284c7" />
          </div>
          <h1 style={styles.title}>Hastane İlan Platformu</h1>
          <p style={styles.subtitle}>
            {currentView === 'login' && 'Kurumsal Giriş Ekranı'}
            {currentView === 'register' && 'Çalışan Kayıt Formu'}
            {currentView === 'forgot' && 'Şifre Sıfırlama Talebi'}
          </p>
        </div>

        {/* Görünümler */}
        {currentView === 'login' && (
          <LoginForm
            onSuccess={handleLoginSuccess}
            goToRegister={() => setCurrentView('register')}
            goToForgot={() => setCurrentView('forgot')}
          />
        )}

        {currentView === 'register' && (
          <RegisterForm goToLogin={() => setCurrentView('login')} />
        )}

        {currentView === 'forgot' && (
          <ForgotPasswordForm goToLogin={() => setCurrentView('login')} />
        )}
      </div>
    </div>
  );
}

// ---------------- GİRİŞ YAP FORMU (GÖREV 03) ----------------
function LoginForm({ onSuccess, goToRegister, goToForgot }) {
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
        if (data.statusCode) {
          setErrorCode(data.statusCode);
        }
      } else {
        onSuccess(data.user, data.token);
      }
    } catch (err) {
      setError('Sunucuya erişilemiyor. Lütfen backend servisinin açık olduğunu kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
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
            autoComplete="username"
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={styles.label}>Şifre</label>
          <span onClick={goToForgot} style={{ ...styles.linkText, fontSize: '12px' }}>
            Şifremi Unuttum
          </span>
        </div>
        <div style={styles.inputWrapper}>
          <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={styles.input}
            autoComplete="current-password"
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

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
      </button>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Henüz hesabınız yok mu?{' '}
          <span onClick={goToRegister} style={styles.linkText}>
            Kayıt Olun
          </span>
        </p>
      </div>
    </form>
  );
}

// ---------------- KAYIT OL FORMU (GÖREV 02) ----------------
function RegisterForm({ goToLogin }) {
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
      errors.termsAccepted = 'Kullanım koşullarını onaylamalısınız.';
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
      setGeneralError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {generalError && (
        <div style={styles.errorAlert}>
          <AlertCircle size={20} style={{ marginRight: 8, flexShrink: 0 }} />
          <span>{generalError}</span>
        </div>
      )}

      {successMessage ? (
        <div style={styles.successBox}>
          <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#16a34a', margin: '0 0 8px 0', fontSize: 18 }}>Başvuru Alındı</h3>
          <p style={{ color: '#374151', margin: 0, fontSize: 14, textAlign: 'center' }}>
            {successMessage}
          </p>
          <button
            onClick={goToLogin}
            style={{ ...styles.button, marginTop: 16, width: 'auto', padding: '8px 24px' }}
          >
            Giriş Ekranına Dön
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
              Hastane kurumsal ilan platformu kullanım koşullarını onaylıyorum.
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
          <span onClick={goToLogin} style={styles.linkText}>
            Giriş Yap
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------- ŞİFREMİ UNUTTUM TASLAĞI (GÖREV 05 BAĞLANTISI) ----------------
function ForgotPasswordForm({ goToLogin }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleForgot = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div>
      {submitted ? (
        <div style={styles.successBox}>
          <CheckCircle2 size={40} color="#16a34a" style={{ marginBottom: 12 }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#16a34a' }}>Bağlantı Gönderildi</h4>
          <p style={{ fontSize: '13px', color: '#4b5563', textAlign: 'center', margin: 0 }}>
            E-posta adresi kayıtlı ise sıfırlama bağlantısı iletilmiştir.
          </p>
          <button
            onClick={goToLogin}
            style={{ ...styles.button, marginTop: 16, width: 'auto', padding: '8px 24px' }}
          >
            Giriş Ekranına Dön
          </button>
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
            <span onClick={goToLogin} style={styles.linkText}>
              Giriş Ekranına Geri Dön
            </span>
          </div>
        </form>
      )}
    </div>
  );
}

// ---------------- GİRİŞ SONRASI ROL BAZLI ÇALIŞMA ALANI İSKELETİ ----------------
function DashboardView({ user, onLogout }) {
  const isAdmin = user.role === 'admin' || user.role === 'moderator';

  return (
    <div style={styles.dashboardContainer}>
      {/* Üst Menü / Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <ShieldCheck size={28} color="#0284c7" />
          <span style={styles.navTitle}>Hastane İlan Platformu</span>
          <span
            style={{
              ...styles.badge,
              backgroundColor: isAdmin ? '#fef3c7' : '#e0f2fe',
              color: isAdmin ? '#92400e' : '#0369a1',
            }}
          >
            {isAdmin ? 'Yönetici' : 'Çalışan'}
          </span>
        </div>

        <div style={styles.navRight}>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div style={styles.userInfoText}>
              <span style={styles.userName}>
                {user.firstName} {user.lastName}
              </span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
          </div>

          <button onClick={onLogout} style={styles.logoutBtn} title="Oturumu Kapat">
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </header>

      {/* Ana Gövde */}
      <main style={styles.mainContent}>
        {isAdmin ? (
          <div style={styles.welcomeBanner}>
            <LayoutDashboard size={40} color="#b45309" style={{ marginBottom: 12 }} />
            <h2 style={{ margin: '0 0 8px 0', color: '#78350f' }}>Yönetim Paneline Hoş Geldiniz</h2>
            <p style={{ margin: 0, color: '#92400e', fontSize: '14px', maxWidth: '600px', textAlign: 'center' }}>
              Sayın {user.firstName} {user.lastName}, çalışan hesap onayları, ilan incelemeleri ve şikâyet yönetimi bu panel üzerinden yürütülecektir.
            </p>
          </div>
        ) : (
          <div style={styles.welcomeBanner}>
            <Home size={40} color="#0284c7" style={{ marginBottom: 12 }} />
            <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Çalışan Ana Sayfası</h2>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px', maxWidth: '600px', textAlign: 'center' }}>
              Hoş geldiniz Sayın {user.firstName} {user.lastName}. İlan arama, yeni ilan oluşturma ve mesajlaşma özellikleri sıradaki görevlerde burada listelenecektir.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------- STİLLER ----------------
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
    maxWidth: '460px',
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
    marginBottom: '8px',
  },
  warningAlert: {
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
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
  // Dashboard Stilleri
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  navbar: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
  },
  userInfoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: '11px',
    color: '#64748b',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fee2e2',
    padding: '7px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  mainContent: {
    flex: 1,
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  welcomeBanner: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '720px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
};
