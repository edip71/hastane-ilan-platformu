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
  Search,
  Filter,
  Check,
  X,
  PauseCircle,
  PlayCircle,
  History,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

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

  // Oturum açılmışsa ana alan gösterilir
  if (currentUser) {
    return <DashboardView user={currentUser} token={token} onLogout={handleLogout} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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

// ---------------- GİRİŞ FORMU ----------------
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
        if (data.statusCode) setErrorCode(data.statusCode);
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

// ---------------- KAYIT FORMU ----------------
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

// ---------------- ŞİFREMİ UNUTTUM ----------------
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

// ---------------- GÖREV 04: YÖNETİM › KULLANICILAR VE ÇALIŞMA ALANI ----------------
function DashboardView({ user, token, onLogout }) {
  const isAdmin = user.role === 'admin' || user.role === 'moderator';
  const [usersList, setUsersList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // Varsayılan: Onay bekleyenler
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Karar Penceresi (Modal) Durumları
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'REJECT', 'SUSPEND', 'LOGS'
  const [rejectReason, setRejectReason] = useState('');
  const [userLogs, setUserLogs] = useState([]);

  // Kullanıcı listesini çek
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setActionError('');
    try {
      const url = `http://localhost:5000/api/admin/users?status=${filterStatus}&search=${encodeURIComponent(
        searchQuery
      )}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList(data.users || []);
      } else {
        setActionError(data.error || 'Kullanıcı listesi alınamadı.');
      }
    } catch (err) {
      setActionError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [filterStatus, isAdmin]);

  // Durum Değiştirme Aksiyonu (Onayla, Askıya Al, Etkinleştir, Reddet)
  const handleStatusAction = async (targetUserId, action, reason = null) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${targetUserId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'İşlem başarısız.');
      } else {
        setActionSuccess(data.message || 'İşlem tamamlandı.');
        closeModal();
        fetchUsers();
      }
    } catch (err) {
      setActionError('Sunucuya bağlanılamadı.');
    }
  };

  // İşlem Geçmişini (Audit Log) Çek
  const handleViewLogs = async (userItem) => {
    setSelectedUser(userItem);
    setModalType('LOGS');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userItem.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUserLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setRejectReason('');
    setUserLogs([]);
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Navbar */}
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

      {/* Ana İçerik */}
      <main style={styles.mainContent}>
        {!isAdmin ? (
          <div style={styles.welcomeBanner}>
            <Home size={40} color="#0284c7" style={{ marginBottom: 12 }} />
            <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Çalışan Ana Sayfası</h2>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px', maxWidth: '600px', textAlign: 'center' }}>
              Hoş geldiniz Sayın {user.firstName} {user.lastName}. Hesabınız aktiftir. İlan listeleme ve arama modülleri sonraki görevlerde eklenecektir.
            </p>
          </div>
        ) : (
          <div style={styles.adminSection}>
            <div style={styles.adminHeader}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '20px' }}>
                  Kullanıcı Yönetimi ve Onay Kuyruğu
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                  Hastane personeli kayıt başvurularını inceleyin, onaylayın veya hesapları yönetin.
                </p>
              </div>

              {/* Filtre ve Arama Çubuğu */}
              <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Ad, soyad veya e-posta ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    style={styles.searchInput}
                  />
                  <button onClick={fetchUsers} style={styles.searchBtn}>
                    Ara
                  </button>
                </div>

                <div style={styles.statusTabs}>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    style={filterStatus === 'pending' ? styles.tabActive : styles.tab}
                  >
                    Onay Bekleyenler
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    style={filterStatus === 'active' ? styles.tabActive : styles.tab}
                  >
                    Aktifler
                  </button>
                  <button
                    onClick={() => setFilterStatus('suspended')}
                    style={filterStatus === 'suspended' ? styles.tabActive : styles.tab}
                  >
                    Askıdakiler
                  </button>
                  <button
                    onClick={() => setFilterStatus('all')}
                    style={filterStatus === 'all' ? styles.tabActive : styles.tab}
                  >
                    Tümü
                  </button>
                </div>
              </div>
            </div>

            {actionSuccess && (
              <div style={styles.successAlert}>
                <CheckCircle2 size={18} style={{ marginRight: 8 }} />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div style={styles.errorAlert}>
                <AlertCircle size={18} style={{ marginRight: 8 }} />
                <span>{actionError}</span>
              </div>
            )}

            {/* Kullanıcı Tablosu - Responsive Wrapper */}
            <div style={styles.tableCard}>
              <div className="responsive-table-wrapper">
                {loading ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    Yükleniyor...
                  </div>
                ) : usersList.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    Bu filtreye uygun kullanıcı kaydı bulunamadı.
                  </div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Personel Bilgisi</th>
                        <th style={styles.th}>Rol</th>
                        <th style={styles.th}>Durum</th>
                        <th style={styles.th}>Kayıt Tarihi</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((item) => (
                        <tr key={item.id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {item.first_name} {item.last_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{item.email}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.roleBadge}>
                              {item.role === 'admin' ? 'Yönetici' : 'Çalışan'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor:
                                  item.status === 'active'
                                    ? '#dcfce7'
                                    : item.status === 'pending'
                                    ? '#fef3c7'
                                    : item.status === 'suspended'
                                    ? '#fee2e2'
                                    : '#f1f5f9',
                                color:
                                  item.status === 'active'
                                    ? '#166534'
                                    : item.status === 'pending'
                                    ? '#92400e'
                                    : item.status === 'suspended'
                                    ? '#991b1b'
                                    : '#475569',
                              }}
                            >
                              {item.status === 'active' && 'Aktif'}
                              {item.status === 'pending' && 'Onay Bekliyor'}
                              {item.status === 'suspended' && 'Askıda'}
                              {item.status === 'rejected' && 'Reddedildi'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              {new Date(item.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={styles.actionButtonGroup}>
                              {/* Onay Bekleyen İşlemleri */}
                              {item.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusAction(item.id, 'APPROVE')}
                                    style={styles.btnApprove}
                                    title="Hesabı Onayla"
                                  >
                                    <Check size={14} style={{ marginRight: 4 }} />
                                    Onayla
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(item);
                                      setModalType('REJECT');
                                    }}
                                    style={styles.btnReject}
                                    title="Gerekçeyle Reddet"
                                  >
                                    <X size={14} style={{ marginRight: 4 }} />
                                    Reddet
                                  </button>
                                </>
                              )}

                              {/* Aktif Hesap İşlemleri */}
                              {item.status === 'active' && item.id !== user.id && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(item);
                                    setModalType('SUSPEND');
                                  }}
                                  style={styles.btnSuspend}
                                  title="Hesabı Askıya Al"
                                >
                                  <PauseCircle size={14} style={{ marginRight: 4 }} />
                                  Askıya Al
                                </button>
                              )}

                              {/* Askıdaki Hesap İşlemleri */}
                              {item.status === 'suspended' && (
                                <button
                                  onClick={() => handleStatusAction(item.id, 'ACTIVATE')}
                                  style={styles.btnActivate}
                                  title="Tekrar Etkinleştir"
                                >
                                  <PlayCircle size={14} style={{ marginRight: 4 }} />
                                  Etkinleştir
                                </button>
                              )}

                              {/* İşlem Geçmişi */}
                              <button
                                onClick={() => handleViewLogs(item)}
                                style={styles.btnHistory}
                                title="İşlem Geçmişi"
                              >
                                <History size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* KARAR PENCERELERİ (MODAL) */}
      {modalType === 'REJECT' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 12px 0', color: '#991b1b' }}>Başvuruyu Reddet</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> isimli personelin başvurusunu reddetmek üzeresiniz. Lütfen PDF kuralları gereği geçerli bir ret gerekçesi belirtin.
            </p>
            <textarea
              rows={3}
              placeholder="Ör: Kurum personeli olduğu doğrulanamadı."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.btnCancel}>
                Vazgeç
              </button>
              <button
                onClick={() => handleStatusAction(selectedUser.id, 'REJECT', rejectReason)}
                disabled={rejectReason.trim().length < 5}
                style={styles.btnConfirmDanger}
              >
                Gerekçeyle Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'SUSPEND' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 12px 0', color: '#b45309' }}>Hesabı Askıya Al</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> isimli personelin hesabı dondurulacak. Personel açık oturumu varsa sistemden düşecek ve yeni işlem yapamayacaktır.
            </p>
            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.btnCancel}>
                Vazgeç
              </button>
              <button
                onClick={() => handleStatusAction(selectedUser.id, 'SUSPEND')}
                style={styles.btnConfirmWarning}
              >
                Hesabı Askıya Al
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'LOGS' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '540px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>
              İşlem Geçmişi: {selectedUser.first_name} {selectedUser.last_name}
            </h3>
            {userLogs.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b' }}>Bu hesap üzerinde henüz bir yönetim işlemi yapılmamış.</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {userLogs.map((log) => (
                  <div key={log.id} style={styles.logItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>
                        {log.action === 'APPROVE' && '✅ Onaylandı'}
                        {log.action === 'REJECT' && '❌ Reddedildi'}
                        {log.action === 'SUSPEND' && '⏸️ Askıya Alındı'}
                        {log.action === 'ACTIVATE' && '▶️ Etkinleştirildi'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      İşlemi Yapan: {log.performed_by_first_name} {log.performed_by_last_name}
                    </div>
                    {log.reason && (
                      <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px', fontStyle: 'italic' }}>
                        Gerekçe: "{log.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ ...styles.modalActions, marginTop: '16px' }}>
              <button onClick={closeModal} style={styles.btnCancel}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
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
    marginBottom: '16px',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
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

  // Dashboard & Admin
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
  },
  mainContent: {
    flex: 1,
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  welcomeBanner: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  adminSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  adminHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '4px 10px',
    flex: '1',
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '6px 8px',
    fontSize: '13px',
    width: '100%',
  },
  searchBtn: {
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  statusTabs: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#e2e8f0',
    padding: '4px',
    borderRadius: '10px',
  },
  tab: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0284c7',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#334155',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  actionButtonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '6px',
  },
  btnApprove: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnReject: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSuspend: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#d97706',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnActivate: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnHistory: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '5px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  },

  // Modallar
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  textarea: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '10px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnCancel: {
    backgroundColor: '#f1f5f9',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  btnConfirmDanger: {
    backgroundColor: '#dc2626',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
  },
  btnConfirmWarning: {
    backgroundColor: '#d97706',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
  },
  logItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '8px',
  },
};
