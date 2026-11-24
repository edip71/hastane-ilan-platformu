import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, Shield, User, PlusCircle } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        
        {/* SOL: Orijinal Şifahane Logosu */}
        <Link to="/" style={styles.logoLink}>
          <img 
            src="/logo.png" 
            alt="Şifahane İlan Platformu" 
            style={styles.logoImg} 
          />
        </Link>

        {/* ORTA: Sahibinden Tarzı Gerçek Arama Kutusu */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <input 
              type="text" 
              placeholder="Kelime, ilan no veya ürün ara..." 
              style={styles.searchInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Arama aksiyonu (Sonraki arama görevinde bağlanacak)
                }
              }}
            />
            <button style={styles.searchBtn} title="Ara">
              <Search size={18} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* SAĞ: Oturum Durumuna Göre Aksiyonlar */}
        <div style={styles.navActions}>
          {user ? (
            // GİRİŞ YAPMIŞ KULLANICI
            <div style={styles.userSection}>
              {/* Admin ise Yönetim Paneli Butonu */}
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.adminLink}>
                  <Shield size={16} />
                  <span>Yönetim</span>
                </Link>
              )}

              {/* Kullanıcı Rozeti */}
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={styles.userName}>
                  {user.firstName} {user.lastName}
                </span>
              </div>

              {/* Çıkış Yap Butonu */}
              <button 
                onClick={onLogout} 
                style={styles.logoutBtn}
                title="Güvenli Çıkış"
              >
                <LogOut size={16} />
                <span>Çıkış Yap</span>
              </button>

              {/* İlan Ver Butonu (Sahibinden tarzı sarı/yeşil vurgu) */}
              <button 
                onClick={() => navigate('/ilan/olustur')} 
                style={styles.postAdBtn}
              >
                <PlusCircle size={16} />
                <span>Ücretsiz İlan Ver</span>
              </button>
            </div>
          ) : (
            // GİRİŞ YAPMAMIŞ ZİYARETÇİ
            <div style={styles.guestSection}>
              <Link to="/giris" style={styles.loginBtn}>
                <User size={16} />
                <span>Giriş Yap</span>
              </Link>
              <Link to="/kayit" style={styles.registerBtn}>
                <span>Kayıt Ol</span>
              </Link>
              <button 
                onClick={() => navigate('/giris')} 
                style={styles.postAdBtn}
              >
                <PlusCircle size={16} />
                <span>Ücretsiz İlan Ver</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
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
    gap: '20px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  logoImg: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '560px',
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
    padding: '8px 14px',
    fontSize: '14px',
    color: '#1e293b',
  },
  searchBtn: {
    backgroundColor: '#004f8c',
    border: 'none',
    padding: '0 16px',
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
    gap: '12px',
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
    padding: '6px 12px',
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
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    color: '#004f8c',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
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
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
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
    padding: '7px 14px',
    backgroundColor: '#00a884',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
};
