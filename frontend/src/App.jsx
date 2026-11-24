import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminUsersPage from './pages/AdminUsersPage';
import CreateListingPage from './pages/CreateListingPage';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Token değiştiğinde kullanıcı durumunu backend'den doğrula
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Geçersiz oturum');
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        })
        .catch(() => {
          // Token geçersizse temizle
          handleLogout();
        });
    }
  }, [token]);

  // Giriş Başarılı Olduğunda
  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Çıkış Yap (Kesin ve Temiz Çıkış Mekanizması)
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/giris';
  };

  return (
    <Router>
      <Routes>
        {/* Ana Sayfa - Yalnızca Giriş Yapmış Kullanıcılara Açık */}
        <Route 
          path="/" 
          element={
            user ? (
              <HomePage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/giris" replace />
            )
          } 
        />

        {/* Görev 02: Kayıt Ol */}
        <Route 
          path="/kayit" 
          element={
            user ? <Navigate to="/" replace /> : <RegisterPage user={user} onLogout={handleLogout} />
          } 
        />

        {/* Görev 03: Giriş Yap */}
        <Route 
          path="/giris" 
          element={
            user ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} user={user} onLogout={handleLogout} />
          } 
        />

        {/* Görev 04: Yönetim Paneli (Sadece Admin) */}
        <Route 
          path="/admin" 
          element={
            user && user.role === 'admin' ? (
              <AdminUsersPage user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/giris" replace />
            )
          } 
        />

        {/* Görev 07: Yeni İlan Oluştur (İlan Ver) */}
        <Route 
          path="/ilan/olustur" 
          element={
            user ? (
              <CreateListingPage user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/giris" replace />
            )
          } 
        />

        {/* Tanımsız Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
