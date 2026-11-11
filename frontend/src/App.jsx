import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalar
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminUsersPage from './pages/AdminUsersPage';
import HomePage from './pages/HomePage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Herkese Açık Auth Rotaları */}
        <Route
          path="/giris"
          element={
            currentUser ? (
              currentUser.role === 'admin' ? (
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

        {/* Korumalı Çalışan Ana Sayfası */}
        <Route
          path="/"
          element={
            currentUser ? (
              <HomePage user={currentUser} onLogout={handleLogout} />
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
  );
}
