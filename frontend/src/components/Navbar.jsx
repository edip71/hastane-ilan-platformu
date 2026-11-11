import React, { useState } from 'react';
import { ShieldCheck, LogOut, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin' || user.role === 'moderator';

  // Çıkış Onay Modalı ve Yükleniyor Durumu (UX Prensibi 9)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    // Kullanıcıya hissettiren, sakinleştirici 700ms'lik güvenli çıkış animasyonu
    setTimeout(() => {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      onLogout();
    }, 700);
  };

  return (
    <>
      <header style={styles.navbar}>
        <div style={styles.navLeft} onClick={() => navigate(isAdmin ? '/yonetim/kullanicilar' : '/')}>
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
              {user.firstName ? user.firstName[0] : 'U'}
              {user.lastName ? user.lastName[0] : ''}
            </div>
            <div style={styles.userInfoText}>
              <span style={styles.userName}>
                {user.firstName} {user.lastName}
              </span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
          </div>

          <button onClick={() => setShowLogoutModal(true)} style={styles.logoutBtn} title="Oturumu Kapat">
            <LogOut size={16} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </header>

      {/* Çıkış Yap Onay Penceresi (UX - Kullanıcıyı Bilgisiz Bırakmama) */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.warningCircle}>
                <AlertTriangle size={24} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '17px' }}>
                  Oturumu Kapatmak İstiyor musunuz?
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                  Mevcut oturumunuz güvenli bir şekilde sonlandırılacaktır.
                </p>
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
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
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
    gap: '16px',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '24px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
  },
  warningCircle: {
    width: '44px',
    height: '44px',
    backgroundColor: '#fee2e2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnCancel: {
    backgroundColor: '#f1f5f9',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  btnConfirmLogout: {
    backgroundColor: '#dc2626',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
  },
};
