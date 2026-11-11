import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin' || user.role === 'moderator';

  return (
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

        <button onClick={onLogout} style={styles.logoutBtn} title="Oturumu Kapat">
          <LogOut size={16} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </header>
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
};
