import React from 'react';
import { Home } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function HomePage({ user, onLogout }) {
  return (
    <div style={styles.pageContainer}>
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.mainContent}>
        <div style={styles.welcomeBanner}>
          <Home size={44} color="#0284c7" style={{ marginBottom: 16 }} />
          <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '24px' }}>
            Çalışan Ana Sayfası
          </h2>
          <p style={{ margin: 0, color: '#475569', fontSize: '15px', maxWidth: '580px', textAlign: 'center', lineHeight: '1.6' }}>
            Hoş geldiniz Sayın <strong>{user.firstName} {user.lastName}</strong>. Hesabınız aktif durumdadır. İlan verme, ilan arama ve kurum içi anlık mesajlaşma bölümleri yol haritamıza göre sonraki görevlerde buraya eklenecektir.
          </p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    padding: '32px 16px',
    maxWidth: '960px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  welcomeBanner: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    width: '100%',
  },
};
