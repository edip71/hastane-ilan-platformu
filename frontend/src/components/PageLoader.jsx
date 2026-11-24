import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sayfa değişimlerinde kısa ve zarif bir açılış/yükleme animasyonu tetikle
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 420); // 420ms: Gözü yormayan, premium ve hızlı bir geçiş süresi

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Ortadaki Logo & Parlama Efekti */}
        <div style={styles.logoWrapper}>
          <img 
            src="/logo.png" 
            alt="Şifahane İlan Platformu" 
            style={styles.logo} 
          />
          <div style={styles.pulseRing}></div>
        </div>

        {/* Kurumsal Progress Bar (Mavi - Turkuaz Gradient) */}
        <div style={styles.progressBarTrack}>
          <div style={styles.progressBarFill}></div>
        </div>

        {/* Durum Yazısı */}
        <span style={styles.text}>Şifahane Platformu Yükleniyor...</span>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(244, 246, 249, 0.88)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    animation: 'fadeInOverlay 0.2s ease-out forwards',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 32px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 79, 140, 0.12), 0 8px 10px -6px rgba(0, 79, 140, 0.08)',
    border: '1px solid #e2e8f0',
    animation: 'scaleInCard 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  logoWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
  },
  logo: {
    height: '52px',
    objectFit: 'contain',
    zIndex: 2,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
  },
  pulseRing: {
    position: 'absolute',
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    animation: 'pulseAnimation 1.4s ease-out infinite',
    zIndex: 1,
  },
  progressBarTrack: {
    width: '160px',
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '10px',
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #004f8c 0%, #00a884 100%)',
    borderRadius: '2px',
    animation: 'progressAnim 0.42s ease-in-out forwards',
  },
  text: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#004f8c',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
};
