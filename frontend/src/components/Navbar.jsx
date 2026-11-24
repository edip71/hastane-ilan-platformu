import React, { useState } from 'react';
import { LogOut, AlertTriangle, Plus, LayoutDashboard, FileText } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout, token }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user.role === 'admin' || user.role === 'moderator';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      onLogout();
    }, 700);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header style={styles.navbar}>
        <div style={styles.container}>
          {/* Sol: Logo ve Marka */}
          <div
            style={styles.brand}
            onClick={() => navigate(isAdmin ? '/yonetim/kullanicilar' : '/')}
          >
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="10" fill="#eff8ff" />
              <path d="M24 10V38" stroke="#0077b6" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M10 24H38" stroke="#0077b6" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M24 18C28 14 34 14 36 16C38 18 38 24 34 28C30 32 24 30 24 30" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={styles.brandText}>
              <span style={styles.brandName}>Şifahane</span>
              <span style={styles.brandSub}>Hastane İlan Platformu</span>
            </div>
          </div>

          {/* Orta: Navigasyon (Çalışan için) */}
          {!isAdmin && (
            <nav style={styles.navLinks}>
              <Link
                to="/"
                style={isActive('/') ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
              >
                <FileText size={15} />
                <span>İlanlar</span>
              </Link>
              <Link
                to="/ilan/olustur"
                style={isActive('/ilan/olustur') ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
              >
                <Plus size={15} />
                <span>İlan Ver</span>
              </Link>
            </nav>
          )}

          {/* Admin için orta navigasyon */}
          {isAdmin && (
            <nav style={styles.navLinks}>
              <Link
                to="/yonetim/kullanicilar"
                style={isActive('/yonetim/kullanicilar') ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
              >
                <LayoutDashboard size={15} />
                <span>Yönetim Paneli</span>
              </Link>
            </nav>
          )}

          {/* Sağ: Kullanıcı Profili */}
          <div style={styles.rightSection}>
            <div style={styles.userCard}>
              <div style={styles.avatar}>
                {user.firstName?.[0]?.toLocaleUpperCase('tr-TR') ?? 'U'}
                {user.lastName?.[0]?.toLocaleUpperCase('tr-TR') ?? ''}
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.firstName} {user.lastName}</span>
                <span
                  style={{
                    ...styles.userRole,
                    backgroundColor: isAdmin ? '#fef3c7' : '#e0f2fe',
                    color: isAdmin ? '#92400e' : '#0369a1',
                  }}
                >
                  {isAdmin ? 'Yönetici' : 'Çalışan'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              style={styles.logoutBtn}
              title="Oturumu Kapat"
            >
              <LogOut size={16} />
              <span style={styles.logoutText}>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Çıkış Onay Modalı */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.warningCircle}>
                <AlertTriangle size={22} color="#dc2626" />
              </div>
              <div>
                <h3 style={styles.modalTitle}>Oturumu Kapatmak İstiyor musunuz?</h3>
                <p style={styles.modalSubtitle}>Mevcut oturumunuz güvenli bir şekilde sonlandırılacaktır.</p>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                style={styles.btnCancel}
              >
                Vazgeç
              </button>
              <button
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                style={styles.btnConfirmLogout}
              >
                {isLoggingOut ? 'Çıkış Yapılıyor...' : 'Evet, Çıkış Yap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    boxSizing: 'border-box',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: '-0.3px',
    lineHeight: '1.1',
  },
  brandSub: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '400',
    letterSpacing: '0.3px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#475569',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  navLinkActive: {
    backgroundColor: '#eff8ff',
    color: '#0284c7',
    fontWeight: '600',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
    letterSpacing: '0.5px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: '1.1',
  },
  userRole: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '1px 6px',
    borderRadius: '4px',
    display: 'inline-block',
    letterSpacing: '0.3px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 14px',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s ease',
  },
  logoutText: {
    display: 'inline',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '24px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
  },
  warningCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    margin: 0,
    fontSize: '12.5px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnCancel: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  btnConfirmLogout: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
