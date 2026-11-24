import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalar
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminUsersPage from './pages/AdminUsersPage';
import HomePage from './pages/HomePage';
import CreateListingPage from './pages/CreateListingPage';
import ListingDetailPage from './pages/ListingDetailPage';

// Şifahane Splash Screen (Açılış Animasyonu)
function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.12)" />
          <path d="M24 10V38" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M10 24H38" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M24 18C28 14 34 14 36 16C38 18 38 24 34 28C30 32 24 30 24 30" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="splash-title">Şifahane</span>
        <span className="splash-subtitle">Hastane İlan Platformu</span>
        <div className="splash-pulse">
          <div className="splash-pulse-bar" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen: 2.4 saniye sonra kaldır
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  // Oturum doğrulama (sayfa yenilendiğinde)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Oturum geçersiz');
        })
        .then((data) => {
          setCurrentUser(data.user);
          setToken(savedToken);
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
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
  };

  return (
    <>
      {showSplash && <SplashScreen />}
      {!loading && (
        <BrowserRouter>
          <Routes>
            {/* Herkese Açık Auth Rotaları */}
            <Route
              path="/giris"
              element={
                currentUser ? (
                  currentUser.role === 'admin' || currentUser.role === 'moderator' ? (
                    <Navigate to="/yonetim/kullanicilar" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
                ) : (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            <Route
              path="/kayit"
              element={currentUser ? <Navigate to="/" replace /> : <RegisterPage />}
            />
            <Route
              path="/sifremi-unuttum"
              element={currentUser ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
            />
            <Route
              path="/sifremi-sifirla/:token"
              element={currentUser ? <Navigate to="/" replace /> : <ResetPasswordPage />}
            />

            {/* Korumalı Çalışan Rotaları */}
            <Route
              path="/"
              element={
                currentUser ? (
                  <HomePage user={currentUser} token={token} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/giris" replace />
                )
              }
            />
            <Route
              path="/ilan/olustur"
              element={
                currentUser ? (
                  <CreateListingPage user={currentUser} token={token} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/giris" replace />
                )
              }
            />
            <Route
              path="/ilan/:id"
              element={
                currentUser ? (
                  <ListingDetailPage user={currentUser} token={token} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/giris" replace />
                )
              }
            />

            {/* Korumalı Yönetici Paneli */}
            <Route
              path="/yonetim/kullanicilar"
              element={
                currentUser ? (
                  currentUser.role === 'admin' || currentUser.role === 'moderator' ? (
                    <AdminUsersPage user={currentUser} token={token} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                ) : (
                  <Navigate to="/giris" replace />
                )
              }
            />

            {/* Bilinmeyen rotaları yönlendir */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}
