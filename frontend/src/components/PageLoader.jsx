import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader() {
  const location = useLocation();

  // İlk site açılış splash ekranı mı? (sessionStorage ile oturum boyunca yalnızca 1 kez gösterilir)
  const [showInitialSplash, setShowInitialSplash] = useState(() => {
    return !sessionStorage.getItem('hasSeenSplash');
  });

  // Sayfa geçişleri için YouTube/GitHub tarzı zarif üst ilerleme çubuğu
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const isFirstRender = useRef(true);

  // 1. İLK GİRİŞ SPLASH EKRANI (Daha yavaş, prestijli, kurumsal tam ekran açılış)
  useEffect(() => {
    if (showInitialSplash) {
      sessionStorage.setItem('hasSeenSplash', 'true');
      const timer = setTimeout(() => {
        setShowInitialSplash(false);
      }, 1400); // 1.4 saniye: Logo ve animasyon net görünür, aceleye gelmez
      return () => clearTimeout(timer);
    }
  }, [showInitialSplash]);

  // 2. SAYFALAR ARASI GEÇİŞ (Sayfa yenilendiğinde değil, yalnızca menü/sayfa değiştiğinde)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setPageTransitioning(true);
    const timer = setTimeout(() => {
      setPageTransitioning(false);
    }, 600); // Sayfa geçişlerinde akıcı 0.6 sn

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* İLK AÇILIŞ: Kurumsal Tam Ekran Prestij Splash Ekranı */}
      {showInitialSplash && (
        <div style={styles.splashOverlay}>
          <div style={styles.splashContent}>
            
            {/* Orijinal Logo */}
            <div style={styles.logoContainer}>
              <img 
                src="/logo.png" 
                alt="Şifahane İlan Platformu" 
                style={styles.splashLogo} 
              />
            </div>

            <div style={styles.platformName}>
              ŞİFAHANE İLAN PLATFORMU
            </div>
            <div style={styles.platformSub}>
              Kurum İçi Güvenli Paylaşım Sistemi
            </div>

            {/* İlerleme Çubuğu */}
            <div style={styles.splashProgressTrack}>
              <div style={styles.splashProgressFill}></div>
            </div>

          </div>
        </div>
      )}

      {/* SAYFALAR ARASI GEÇİŞ: YouTube / GitHub Tarzı Üst İlerleme Barı (Ekranı kapatmaz, profesyoneldir) */}
      {pageTransitioning && !showInitialSplash && (
        <div style={styles.topProgressTrack}>
          <div style={styles.topProgressFill}></div>
        </div>
      )}
    </>
  );
}

const styles = {
  // Tam Ekran İlk Açılış
  splashOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#00223d', // Koyu kurumsal lacivert (Hastane teması)
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    animation: 'splashFadeOut 0.4s ease-in 1.1s forwards',
  },
  splashContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '30px',
    animation: 'splashContentIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  logoContainer: {
    backgroundColor: '#ffffff',
    padding: '16px 28px',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    height: '68px',
    objectFit: 'contain',
  },
  platformName: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    marginBottom: '6px',
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  },
  platformSub: {
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '28px',
  },
  splashProgressTrack: {
    width: '240px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  splashProgressFill: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #00a884 0%, #38bdf8 100%)',
    borderRadius: '4px',
    animation: 'splashProgressAnimation 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  },

  // Sayfa Geçiş Üst Barı
  topProgressTrack: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '3px',
    zIndex: 999998,
    pointerEvents: 'none',
  },
  topProgressFill: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #004f8c 0%, #00a884 70%, #38bdf8 100%)',
    boxShadow: '0 0 10px rgba(0, 168, 132, 0.7)',
    animation: 'topProgressAnim 0.6s ease-in-out forwards',
  },
};
