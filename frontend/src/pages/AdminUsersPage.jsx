import React, { useState, useEffect } from 'react';
import { Search, Check, X, PauseCircle, PlayCircle, History, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AdminUsersPage({ user, token, onLogout }) {
  const [usersList, setUsersList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modal Durumları
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'REJECT', 'SUSPEND', 'LOGS'
  const [rejectReason, setRejectReason] = useState('');
  const [userLogs, setUserLogs] = useState([]);

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
    } catch (err) {
      setActionError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

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
    } catch (err) {
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
    <div style={styles.pageContainer}>
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.mainContent}>
        <div style={styles.adminSection}>
          <div style={styles.adminHeader}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '20px' }}>
                Kullanıcı Yönetimi ve Onay Kuyruğu
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Hastane personeli kayıt başvurularını inceleyin, onaylayın veya hesapları yönetin.
              </p>
            </div>

            <div style={styles.filterBar}>
              <div style={styles.searchBox}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Ad, soyad veya e-posta ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  style={styles.searchInput}
                />
                <button onClick={fetchUsers} style={styles.searchBtn}>
                  Ara
                </button>
              </div>

              <div style={styles.statusTabs}>
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
              <CheckCircle2 size={18} style={{ marginRight: 8 }} />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} style={{ marginRight: 8 }} />
              <span>{actionError}</span>
            </div>
          )}

          <div style={styles.tableCard}>
            <div className="responsive-table-wrapper">
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Yükleniyor...
                </div>
              ) : usersList.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Bu filtreye uygun kullanıcı kaydı bulunamadı.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Personel Bilgisi</th>
                      <th style={styles.th}>Rol</th>
                      <th style={styles.th}>Durum</th>
                      <th style={styles.th}>Kayıt Tarihi</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((item) => (
                      <tr key={item.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>
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
                          <div style={styles.actionButtonGroup}>
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusAction(item.id, 'APPROVE')}
                                  style={styles.btnApprove}
                                  title="Hesabı Onayla"
                                >
                                  <Check size={14} style={{ marginRight: 4 }} />
                                  Onayla
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(item);
                                    setModalType('REJECT');
                                  }}
                                  style={styles.btnReject}
                                  title="Gerekçeyle Reddet"
                                >
                                  <X size={14} style={{ marginRight: 4 }} />
                                  Reddet
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
                                <PauseCircle size={14} style={{ marginRight: 4 }} />
                                Askıya Al
                              </button>
                            )}

                            {item.status === 'suspended' && (
                              <button
                                onClick={() => handleStatusAction(item.id, 'ACTIVATE')}
                                style={styles.btnActivate}
                                title="Tekrar Etkinleştir"
                              >
                                <PlayCircle size={14} style={{ marginRight: 4 }} />
                                Etkinleştir
                              </button>
                            )}

                            <button
                              onClick={() => handleViewLogs(item)}
                              style={styles.btnHistory}
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
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODALLAR */}
      {modalType === 'REJECT' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 12px 0', color: '#991b1b' }}>Başvuruyu Reddet</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> isimli personelin başvurusunu reddetmek üzeresiniz. Lütfen geçerli bir ret gerekçesi belirtin.
            </p>
            <textarea
              rows={3}
              placeholder="Ör: Kurum personeli olduğu doğrulanamadı."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.btnCancel}>
                Vazgeç
              </button>
              <button
                onClick={() => handleStatusAction(selectedUser.id, 'REJECT', rejectReason)}
                disabled={rejectReason.trim().length < 5}
                style={styles.btnConfirmDanger}
              >
                Gerekçeyle Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'SUSPEND' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 12px 0', color: '#b45309' }}>Hesabı Askıya Al</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> isimli personelin hesabı dondurulacak. Personel açık oturumu varsa sistemden düşecektir.
            </p>
            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.btnCancel}>
                Vazgeç
              </button>
              <button
                onClick={() => handleStatusAction(selectedUser.id, 'SUSPEND')}
                style={styles.btnConfirmWarning}
              >
                Hesabı Askıya Al
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'LOGS' && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '540px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>
              İşlem Geçmişi: {selectedUser.first_name} {selectedUser.last_name}
            </h3>
            {userLogs.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b' }}>Bu hesap üzerinde henüz bir yönetim işlemi yapılmamış.</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {userLogs.map((log) => (
                  <div key={log.id} style={styles.logItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>
                        {log.action === 'APPROVE' && '✅ Onaylandı'}
                        {log.action === 'REJECT' && '❌ Reddedildi'}
                        {log.action === 'SUSPEND' && '⏸️ Askıya Alındı'}
                        {log.action === 'ACTIVATE' && '▶️ Etkinleştirildi'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      İşlemi Yapan: {log.performed_by_first_name} {log.performed_by_last_name}
                    </div>
                    {log.reason && (
                      <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px', fontStyle: 'italic' }}>
                        Gerekçe: "{log.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ ...styles.modalActions, marginTop: '16px' }}>
              <button onClick={closeModal} style={styles.btnCancel}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
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
    padding: '24px 16px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  adminSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  adminHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '4px 10px',
    flex: '1',
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '6px 8px',
    fontSize: '13px',
    width: '100%',
  },
  searchBtn: {
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  statusTabs: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#e2e8f0',
    padding: '4px',
    borderRadius: '10px',
  },
  tab: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0284c7',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
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
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  actionButtonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '6px',
  },
  btnApprove: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnReject: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSuspend: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#d97706',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnActivate: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnHistory: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '5px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  textarea: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '10px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnCancel: {
    backgroundColor: '#f1f5f9',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  btnConfirmDanger: {
    backgroundColor: '#dc2626',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
  },
  btnConfirmWarning: {
    backgroundColor: '#d97706',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
  },
  logItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '8px',
  },
};
