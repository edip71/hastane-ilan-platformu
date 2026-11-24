import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, LogOut, Shield, User, PlusCircle, 
  Menu, X, Home, FolderTree 
} from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          
          {/* SOL: Orijinal Şifahane Logosu & Hamburger Butonu */}
          <div style={styles.leftWrapper}>
            {user && (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                style={styles.hamburgerBtn}
                title="Menü"
              >
                {mobileMenuOpen ? <X size={22} color="#004f8c" /> : <Menu size={22} color="#004f8c" />}
              </button>
            )}

            <Link to="/" style={styles.logoLink}>
              <img 
                src="/logo.png" 
                alt="Şifahane İlan Platformu" 
                style={styles.logoImg} 
              />
            </Link>
          </div>

          {/* ORTA: Arama Çubuğu (Giriş Yapmışsa Aktif) */}
          {user && (
            <div style={styles.searchContainer}>
              <div style={styles.searchWrapper}>
                <input 
                  type="text" 
                  placeholder="Kelime, ilan no veya ürün ara..." 
                  style={styles.searchInput}
                />
                <button style={styles.searchBtn} title="Ara">
                  <Search size={18} color="#ffffff" />
                </button>
              </div>
            </div>
          )}

          {/* SAĞ: Masaüstü Aksiyonları */}
          <div style={styles.navActions}>
            {user ? (
              <div style={styles.userSection}>
                {user.role === 'admin' && (
                  <Link to="/admin" style={styles.adminLink}>
                    <Shield size={16} />
                    <span className="desktop-only">Yönetim</span>
                  </Link>
                )}

                <div style={styles.userInfo} className="desktop-only">
                  <div style={styles.avatar}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </span>
                </div>

                <button 
                  onClick={onLogout} 
                  style={styles.logoutBtn}
                  title="Güvenli Çıkış"
                >
                  <LogOut size={16} />
                  <span className="desktop-only">Çıkış Yap</span>
                </button>

                <button 
                  onClick={() => navigate('/ilan/olustur')} 
                  style={styles.postAdBtn}
                >
                  <PlusCircle size={16} />
                  <span>Ücretsiz İlan Ver</span>
                </button>
              </div>
            ) : (
              <div style={styles.guestSection}>
                <Link to="/giris" style={styles.loginBtn}>
                  <User size={16} />
                  <span>Giriş Yap</span>
                </Link>
                <Link to="/kayit" style={styles.registerBtn}>
                  <span>Kayıt Ol</span>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* MOBİL SLIDE-DOWN MENÜ */}
        {mobileMenuOpen && user && (
          <div style={styles.mobileDrawer} className="hamburger-drawer">
            <div style={styles.mobileUserInfo}>
              <div style={styles.avatarLarge}>
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
              </div>
            </div>

            <div style={styles.mobileLinks}>
              <Link 
                to="/" 
                style={location.pathname === '/' ? styles.mobileLinkActive : styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                <span>Ana Sayfa (İlan Vitrini)</span>
              </Link>

              <Link 
                to="/ilan/olustur" 
                style={location.pathname === '/ilan/olustur' ? styles.mobileLinkActive : styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <PlusCircle size={18} />
                <span>Yeni İlan Oluştur</span>
              </Link>

              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  style={location.pathname.startsWith('/admin') ? styles.mobileLinkActive : styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield size={18} />
                  <span>Yönetim Paneli</span>
                </Link>
              )}

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }} 
                style={styles.mobileLogoutBtn}
              >
                <LogOut size={18} />
                <span>Oturumu Kapat</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MOBİL SABİT ALT NAVİGASYON BARI (Sahibinden Tarzı Bottom Navigation) */}
      {user && (
        <nav style={styles.mobileBottomNav} className="mobile-only">
          <Link to="/" style={location.pathname === '/' ? styles.bottomNavItemActive : styles.bottomNavItem}>
            <Home size={20} />
            <span style={styles.bottomNavText}>İlanlar</span>
          </Link>

          <Link to="/ilan/olustur" style={location.pathname === '/ilan/olustur' ? styles.bottomNavItemActive : styles.bottomNavItem}>
            <PlusCircle size={22} color="#00a884" />
            <span style={{ ...styles.bottomNavText, color: '#00a884', fontWeight: '700' }}>İlan Ver</span>
          </Link>

          {user.role === 'admin' && (
            <Link to="/admin" style={location.pathname.startsWith('/admin') ? styles.bottomNavItemActive : styles.bottomNavItem}>
              <Shield size={20} />
              <span style={styles.bottomNavText}>Yönetim</span>
            </Link>
          )}

          <button onClick={onLogout} style={styles.bottomNavItemBtn}>
            <LogOut size={20} />
            <span style={styles.bottomNavText}>Çıkış</span>
          </button>
        </nav>
      )}
    </>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  leftWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  hamburgerBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  logoImg: {
    height: '38px',
    width: 'auto',
    objectFit: 'contain',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '520px',
  },
  searchWrapper: {
    display: 'flex',
    border: '2px solid #004f8c',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#1e293b',
  },
  searchBtn: {
    backgroundColor: '#004f8c',
    border: 'none',
    padding: '0 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  guestSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  adminLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #cbd5e1',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    color: '#004f8c',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
  },
  avatarLarge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    backgroundColor: '#f8fafc',
    color: '#004f8c',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #cbd5e1',
  },
  registerBtn: {
    padding: '7px 14px',
    backgroundColor: 'transparent',
    color: '#475569',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #cbd5e1',
  },
  postAdBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    backgroundColor: '#00a884',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  mobileDrawer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '16px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '12px',
  },
  mobileLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    color: '#334155',
    fontSize: '14px',
    fontWeight: '600',
  },
  mobileLinkActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    backgroundColor: '#f0f9ff',
    color: '#004f8c',
    fontSize: '14px',
    fontWeight: '700',
  },
  mobileLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    color: '#dc2626',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    marginTop: '6px',
  },
  mobileBottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0 6px',
    zIndex: 99,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
  },
  bottomNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    color: '#64748b',
    textDecoration: 'none',
    flex: 1,
  },
  bottomNavItemActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    color: '#004f8c',
    textDecoration: 'none',
    flex: 1,
  },
  bottomNavItemBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    color: '#dc2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flex: 1,
  },
  bottomNavText: {
    fontSize: '11px',
    fontWeight: '600',
  },
};
