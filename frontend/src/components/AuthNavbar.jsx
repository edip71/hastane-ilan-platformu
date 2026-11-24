import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AuthNavbar() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/giris';

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Sol: Şifahane Logo & Platform Başlığı */}
        <Link to="/giris" style={styles.brandLink}>
          <div style={styles.logoGroup}>
            {/* Şifahane Özel Sağlık Vektör Logosu */}
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="10" fill="#f0fdf4" />
              {/* Haç ve Sağlık Motifleri */}
              <path d="M24 10V38" stroke="#0077b6" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M10 24H38" stroke="#0077b6" strokeWidth="4.5" strokeLinecap="round" />
              {/* Yeşil Yaprak / Şifa Detayı */}
              <path d="M24 18C28 14 34 14 36 16C38 18 38 24 34 28C30 32 24 30 24 30" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={styles.brandTextGroup}>
              <span style={styles.brandName}>Şifahane</span>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.platformTextGroup}>
            <span style={styles.platformTitle}>Hastane İlan Platformu</span>
            <span style={styles.platformSubtitle}>Personel İçi Paylaşım ve Yardımlaşma Ağı</span>
          </div>
        </Link>

        {/* Sağ: Kurumsal Yardım & Eylem Butonu */}
        <div style={styles.rightNav}>
          <a
            href="#yardim"
            onClick={(e) => {
              e.preventDefault();
              alert('Kurumsal Destek ve Bilgi: Hastane Bilgi İşlem / Başhekimlik İletişim: Dahili 1040');
            }}
            style={styles.helpLink}
          >
            Kurumsal Yardım
          </a>

          {isLoginPage ? (
            <Link to="/kayit" style={styles.actionBtn}>
              Kayıt Ol
            </Link>
          ) : (
            <Link to="/giris" style={styles.actionBtn}>
              Giriş Yap
            </Link>
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
    width: '100%',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: '16px',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandTextGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: '-0.5px',
    lineHeight: '1.1',
  },
  divider: {
    width: '1px',
    height: '28px',
    backgroundColor: '#cbd5e1',
  },
  platformTextGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  platformTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.2',
  },
  platformSubtitle: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '400',
  },
  rightNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  helpLink: {
    fontSize: '13px',
    color: '#475569',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.15s',
  },
  actionBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    border: '1.5px solid #0284c7',
    color: '#0284c7',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
};
