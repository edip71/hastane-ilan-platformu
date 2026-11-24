import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Check, X, PauseCircle, PlayCircle, History, 
  AlertCircle, CheckCircle2, ArrowLeft, LogOut, Shield,
  Users, FolderTree, Tag
} from 'lucide-react';
import AdminCategoriesTab from '../components/AdminCategoriesTab';
import AdminListingsTab from '../components/AdminListingsTab';

export default function AdminUsersPage({ user, token, onLogout }) {
  const navigate = useNavigate();

  // Ana Panel Sekmesi: 'USERS' (Kullanıcılar) | 'CATEGORIES' (Kategoriler - Görev 06)
  const [activeTab, setActiveTab] = useState('USERS');

  // Kullanıcılar Sekmesi Durumları
  const [usersList, setUsersList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modallar
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [userLogs, setUserLogs] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/giris');
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setActionError('');
    try {
      const url = `http://localhost:5000/api/admin/users?status=${filterStatus}&search=${encodeURIComponent(
        searchQuery
      )}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList(data.users || []);
      } else {
        setActionError(data.error || 'Kullanıcı listesi alınamadı.');
      }
    } catch {
      setActionError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'USERS') {
      fetchUsers();
    }
  }, [filterStatus, activeTab]);

  const handleStatusAction = async (targetUserId, action, reason = null) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${targetUserId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'İşlem başarısız.');
      } else {
        setActionSuccess(data.message || 'İşlem tamamlandı.');
        closeModal();
        fetchUsers();
      }
    } catch {
      setActionError('Sunucuya bağlanılamadı.');
    }
  };

  const handleViewLogs = async (userItem) => {
    setSelectedUser(userItem);
    setModalType('LOGS');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userItem.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUserLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setRejectReason('');
    setUserLogs([]);
  };

  return (
    <div style={styles.page}>
      
      {/* Özel Admin Header */}
      <header style={styles.adminNav}>
        <div style={styles.adminNavContainer}>
          <div style={styles.adminNavLeft}>
            <img src="/logo.png" alt="Şifahane" style={{ height: '36px' }} />
            <div style={styles.adminBadge}>
              <Shield size={14} />
              <span>Yönetim Paneli</span>
            </div>

            {/* Panel Sekmeleri: Kullanıcılar & Kategoriler (Görev 06) */}
            <div style={styles.mainNavTabs}>
              <button
                onClick={() => setActiveTab('USERS')}
                style={activeTab === 'USERS' ? styles.mainNavTabActive : styles.mainNavTab}
              >
                <Users size={15} />
                <span>Kullanıcı Yönetimi</span>
              </button>
              <button
                onClick={() => setActiveTab('CATEGORIES')}
                style={activeTab === 'CATEGORIES' ? styles.mainNavTabActive : styles.mainNavTab}
              >
                <FolderTree size={15} />
                <span>Kategori Yönetimi</span>
              </button>
              <button
                onClick={() => setActiveTab('LISTINGS')}
                style={activeTab === 'LISTINGS' ? styles.mainNavTabActive : styles.mainNavTab}
              >
                <Tag size={15} />
                <span>İlan Yönetimi (Moderatör)</span>
              </button>
            </div>
          </div>

          <div style={styles.adminNavRight}>
            <button onClick={() => navigate('/')} style={styles.btnSiteReturn}>
              <ArrowLeft size={16} />
              <span>Siteye Dön</span>
            </button>
            <button onClick={onLogout} style={styles.btnLogout}>
              <LogOut size={16} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main style={styles.main}>
        <div style={styles.container}>
          
          {/* SEKME 1: KULLANICILAR (GÖREV 04) */}
          {activeTab === 'USERS' && (
            <div>
              <div style={styles.pageHeader}>
                <div>
                  <h1 style={styles.pageTitle}>Kullanıcı Yönetimi ve Onay Kuyruğu</h1>
                  <p style={styles.pageSubtitle}>
                    Kayıt başvurularını inceleyin, hesapları onaylayın, reddedin veya askıya alın.
                  </p>
                </div>

                <div style={styles.filterSection}>
                  <div style={styles.searchBox}>
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Ad, soyad veya e-posta ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                      style={styles.searchInput}
                    />
                    <button onClick={fetchUsers} style={styles.searchBtn}>Ara</button>
                  </div>

                  <div style={styles.tabs}>
                    <button
                      onClick={() => setFilterStatus('pending')}
                      style={filterStatus === 'pending' ? styles.tabActive : styles.tab}
                    >
                      Onay Bekleyenler
                    </button>
                    <button
                      onClick={() => setFilterStatus('active')}
                      style={filterStatus === 'active' ? styles.tabActive : styles.tab}
                    >
                      Aktifler
                    </button>
                    <button
                      onClick={() => setFilterStatus('suspended')}
                      style={filterStatus === 'suspended' ? styles.tabActive : styles.tab}
                    >
                      Askıdakiler
                    </button>
                    <button
                      onClick={() => setFilterStatus('all')}
                      style={filterStatus === 'all' ? styles.tabActive : styles.tab}
                    >
                      Tümü
                    </button>
                  </div>
                </div>
              </div>

              {actionSuccess && (
                <div style={styles.successAlert}>
                  <CheckCircle2 size={18} />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div style={styles.errorAlert}>
                  <AlertCircle size={18} />
                  <span>{actionError}</span>
                </div>
              )}

              <div style={styles.tableCard}>
                {loading ? (
                  <div style={styles.emptyState}>Yükleniyor...</div>
                ) : usersList.length === 0 ? (
                  <div style={styles.emptyState}>Bu filtreye uygun kullanıcı kaydı bulunamadı.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.thRow}>
                          <th style={styles.th}>Personel</th>
                          <th style={styles.th}>Rol</th>
                          <th style={styles.th}>Durum</th>
                          <th style={styles.th}>Kayıt Tarihi</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((item) => (
                          <tr key={item.id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: '600', color: '#0f172a' }}>
                                {item.first_name} {item.last_name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{item.email}</div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.roleBadge}>
                                {item.role === 'admin' ? 'Yönetici' : 'Çalışan'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor:
                                    item.status === 'active'
                                      ? '#dcfce7'
                                      : item.status === 'pending'
                                      ? '#fef3c7'
                                      : item.status === 'suspended'
                                      ? '#fee2e2'
                                      : '#f1f5f9',
                                  color:
                                    item.status === 'active'
                                      ? '#166534'
                                      : item.status === 'pending'
                                      ? '#92400e'
                                      : item.status === 'suspended'
                                      ? '#991b1b'
                                      : '#475569',
                                }}
                              >
                                {item.status === 'active' && 'Aktif'}
                                {item.status === 'pending' && 'Onay Bekliyor'}
                                {item.status === 'suspended' && 'Askıda'}
                                {item.status === 'rejected' && 'Reddedildi'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {new Date(item.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                              <div style={styles.actionsGroup}>
                                {item.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusAction(item.id, 'APPROVE')}
                                      style={styles.btnApprove}
                                      title="Hesabı Onayla"
                                    >
                                      <Check size={14} />
                                      <span>Onayla</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedUser(item);
                                        setModalType('REJECT');
                                      }}
                                      style={styles.btnReject}
                                      title="Gerekçeyle Reddet"
                                    >
                                      <X size={14} />
                                      <span>Reddet</span>
                                    </button>
                                  </>
                                )}

                                {item.status === 'active' && item.id !== user.id && (
                                  <button
                                    onClick={() => {
                                      setSelectedUser(item);
                                      setModalType('SUSPEND');
                                    }}
                                    style={styles.btnSuspend}
                                    title="Hesabı Askıya Al"
                                  >
                                    <PauseCircle size={14} />
                                    <span>Askıya Al</span>
                                  </button>
                                )}

                                {item.status === 'suspended' && (
                                  <button
                                    onClick={() => handleStatusAction(item.id, 'ACTIVATE')}
                                    style={styles.btnActivate}
                                    title="Tekrar Etkinleştir"
                                  >
                                    <PlayCircle size={14} />
                                    <span>Etkinleştir</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleViewLogs(item)}
                                  style={styles.btnLogs}
                                  title="İşlem Geçmişi"
                                >
                                  <History size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEKME 2: KATEGORİ YÖNETİMİ (GÖREV 06) */}
          {activeTab === 'CATEGORIES' && (
            <AdminCategoriesTab token={token} />
          )}

          {/* SEKME 3: İLAN YÖNETİMİ & MODERATÖR DÜZENLEME (GÖREV 08) */}
          {activeTab === 'LISTINGS' && (
            <AdminListingsTab token={token} />
          )}

        </div>
      </main>

      {/* Ret Modal */}
      {modalType === 'REJECT' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '18px' }}>Başvuruyu Reddet</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
              <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> isimli personelin başvurusunu reddetmek üzeresiniz. Lütfen bir gerekçe belirtin.
            </p>
            <textarea
              rows={3}
              placeholder="Örn: Kurum personeli olduğu doğrulanamadı."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.btnModalCancel}>Vazgeç</button>
              <button
                onClick={() => handleStatusAction(selectedUser.id, 'REJECT', rejectReason)}
                disabled={rejectReason.trim().length < 5}
                style={styles.btnModalDanger}
              >
                Gerekçeyle Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Askıya Al Modal */}
      {modalType === 'SUSPEND' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 8px 0', color: '#b45309', fontSize: '18px' }}>Hesabı Askıya Al</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> isimli personelin hesabı dondurulacak ve oturumu sonlandırılacaktır.
            </p>
            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.btnModalCancel}>Vazgeç</button>
              <button
                onClick={() => handleStatusAction(selectedUser.id, 'SUSPEND')}
                style={styles.btnModalWarning}
              >
                Hesabı Askıya Al
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Denetim Logları Modal */}
      {modalType === 'LOGS' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '16px' }}>
              İşlem Geçmişi: {selectedUser.first_name} {selectedUser.last_name}
            </h3>
            {userLogs.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b' }}>Bu hesap üzerinde henüz bir işlem yapılmamış.</p>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {userLogs.map((log) => (
                  <div key={log.id} style={styles.logCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '12px', color: '#0f172a' }}>
                        {log.action === 'APPROVE_USER' && '✅ Onaylandı'}
                        {log.action === 'REJECT_USER' && '❌ Reddedildi'}
                        {log.action === 'SUSPEND_USER' && '⏸️ Askıya Alındı'}
                        {log.action === 'ACTIVATE_USER' && '▶️ Etkinleştirildi'}
                        {log.action === 'REGISTER_APPLICATION' && '📝 Kayıt Başvurusu'}
                        {log.action === 'CREATE_CATEGORY' && '📁 Kategori Oluşturuldu'}
                        {log.action === 'UPDATE_CATEGORY' && '⚙️ Kategori Güncellendi'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    {log.performed_by_first_name && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        İşlemi Yapan: {log.performed_by_first_name} {log.performed_by_last_name}
                      </div>
                    )}
                    {log.reason && (
                      <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                        Gerekçe: "{log.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ ...styles.modalActions, marginTop: '16px' }}>
              <button onClick={closeModal} style={styles.btnModalCancel}>Kapat</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
  },
  adminNav: {
    backgroundColor: '#002b4d',
    borderBottom: '1px solid #001f38',
    padding: '10px 16px',
    color: '#ffffff',
  },
  adminNavContainer: {
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  adminNavLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  mainNavTabs: {
    display: 'flex',
    gap: '6px',
    marginLeft: '10px',
  },
  mainNavTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mainNavTabActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  adminNavRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btnSiteReturn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    padding: '24px 16px',
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '2px 8px',
    flex: 1,
    minWidth: '240px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '8px',
    fontSize: '13px',
    width: '100%',
  },
  searchBtn: {
    backgroundColor: '#004f8c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#e2e8f0',
    padding: '3px',
    borderRadius: '6px',
  },
  tab: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  tabActive: {
    border: 'none',
    backgroundColor: '#ffffff',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#004f8c',
    cursor: 'pointer',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#334155',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  actionsGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '6px',
  },
  btnApprove: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnReject: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSuspend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#d97706',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnActivate: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnLogs: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '5px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '12px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  emptyState: {
    padding: '36px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
  textarea: {
    width: '100%',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    padding: '8px 10px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  btnModalCancel: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  btnModalDanger: {
    backgroundColor: '#dc2626',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
  },
  btnModalWarning: {
    backgroundColor: '#d97706',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
  },
  logCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: '8px 12px',
    marginBottom: '8px',
  },
};
