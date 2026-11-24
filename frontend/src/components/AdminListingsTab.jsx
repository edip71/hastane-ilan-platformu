import React, { useState, useEffect } from 'react';
import { 
  Check, X, Edit2, AlertCircle, Clock, CheckCircle2, 
  XCircle, Loader2, Save, Eye, MapPin, Tag, Building2, User
} from 'lucide-react';

export default function AdminListingsTab({ token }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ret Modalı
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Satır İçi Düzenleme (Technopat Moderatör Stili)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    contactInfo: '',
    location: ''
  });

  const fetchListings = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/admin/listings?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setListings(data.listings || []);
      })
      .catch(() => setError('İlanlar getirilemedi.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  // Durum Güncelle (Onayla / Reddet)
  const handleStatusChange = async (listingId, action, reason = null) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, reason })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'İşlem başarısız.');
      } else {
        setSuccess(data.message);
        fetchListings();
        if (rejectModalOpen) {
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedListing(null);
        }
      }
    } catch {
      setError('Sunucu bağlantı hatası.');
    } finally {
      setSubmitting(false);
    }
  };

  // Düzenleme Başlat
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      price: item.price !== null ? item.price : '',
      contactInfo: item.contact_info || '',
      location: item.location || ''
    });
  };

  // Düzenleme Kaydet
  const saveInlineEdit = async (listingId) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Düzenleme kaydedilemedi.');
      } else {
        setSuccess('İlan içeriği moderatör tarafından güncellendi.');
        setEditingId(null);
        fetchListings();
      }
    } catch {
      setError('Düzenleme kaydedilirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Üst Filtre Barı */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Durum Filtresi:</span>
          {['all', 'pending', 'active', 'rejected', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                ...styles.filterBtn,
                backgroundColor: statusFilter === st ? '#004f8c' : '#ffffff',
                color: statusFilter === st ? '#ffffff' : '#475569',
                borderColor: statusFilter === st ? '#004f8c' : '#cbd5e1'
              }}
            >
              {st === 'all' && 'Tümü'}
              {st === 'pending' && 'Onay Bekleyenler'}
              {st === 'active' && 'Yayındakiler'}
              {st === 'rejected' && 'Reddedilenler'}
              {st === 'draft' && 'Taslaklar'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successAlert}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{success}</span>
        </div>
      )}

      {/* İlan Tablosu */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            <Loader2 size={24} className="spin-animate" color="#004f8c" />
            <span style={{ marginLeft: '8px', color: '#64748b' }}>İlanlar yükleniyor...</span>
          </div>
        ) : listings.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ margin: 0, color: '#64748b' }}>Seçili filtreye uygun ilan bulunamadı.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>İlan Detayı / Başlık</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Fiyat</th>
                  <th style={styles.th}>İlan Sahibi & Konum</th>
                  <th style={styles.th}>Durum</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Moderatör İşlemleri</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} style={styles.tr}>
                      {/* Başlık & Açıklama / Düzenleme Alanı */}
                      <td style={{ ...styles.td, maxWidth: '340px' }}>
                        {isEditing ? (
                          <div style={styles.editBox}>
                            <label style={styles.editLabel}>Başlık:</label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              style={styles.editInput}
                            />
                            <label style={styles.editLabel}>Açıklama:</label>
                            <textarea
                              rows={3}
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              style={styles.editTextarea}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              <button
                                onClick={() => saveInlineEdit(item.id)}
                                disabled={submitting}
                                style={styles.btnSaveInline}
                              >
                                <Save size={13} />
                                <span>Kaydet</span>
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                style={styles.btnCancelInline}
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={styles.listingTitleRow}>
                              <span style={styles.listingTitle}>{item.title}</span>
                              <button
                                onClick={() => startEditing(item)}
                                title="İlanı Hızlıca Düzelt (Moderatör İzni)"
                                style={styles.btnEditPencil}
                              >
                                <Edit2 size={13} color="#004f8c" />
                              </button>
                            </div>
                            <p style={styles.listingDescSnippet}>
                              {item.description ? item.description.slice(0, 90) + '...' : ''}
                            </p>
                            <div style={styles.dateMeta}>
                              {new Date(item.created_at).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Kategori */}
                      <td style={styles.td}>
                        <span style={styles.catBadge}>{item.category_name}</span>
                      </td>

                      {/* Fiyat */}
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            placeholder="Fiyat"
                            style={{ ...styles.editInput, width: '100px' }}
                          />
                        ) : (
                          <span style={styles.priceText}>
                            {item.is_free ? 'Ücretsiz' : (item.price ? `${Number(item.price).toLocaleString('tr-TR')} TL` : '-')}
                          </span>
                        )}
                      </td>

                      {/* İlan Sahibi & Konum */}
                      <td style={styles.td}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {item.author_first_name} {item.author_last_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {item.location || 'Konum belirtilmedi'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#004f8c' }}>
                          {item.contact_info || ''}
                        </div>
                      </td>

                      {/* Durum Rozeti */}
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusTag,
                          backgroundColor: 
                            item.status === 'active' ? '#dcfce7' :
                            item.status === 'pending' ? '#fef3c7' :
                            item.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                          color: 
                            item.status === 'active' ? '#166534' :
                            item.status === 'pending' ? '#92400e' :
                            item.status === 'rejected' ? '#991b1b' : '#475569',
                        }}>
                          {item.status === 'active' && 'Yayında'}
                          {item.status === 'pending' && 'Onay Bekliyor'}
                          {item.status === 'rejected' && 'Reddedildi'}
                          {item.status === 'draft' && 'Taslak'}
                          {item.status === 'passive' && 'Pasif'}
                        </span>
                        {item.status === 'rejected' && item.rejection_reason && (
                          <div style={styles.rejectionNotice} title={item.rejection_reason}>
                            Neden: {item.rejection_reason}
                          </div>
                        )}
                      </td>

                      {/* Aksiyon Butonları */}
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(item.id, 'APPROVE')}
                                disabled={submitting}
                                style={styles.btnApprove}
                                title="İlanı Onayla ve Yayına Al"
                              >
                                <Check size={14} />
                                <span>Onayla</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedListing(item);
                                  setRejectModalOpen(true);
                                }}
                                disabled={submitting}
                                style={styles.btnReject}
                                title="İlanı Reddet"
                              >
                                <X size={14} />
                                <span>Reddet</span>
                              </button>
                            </>
                          )}

                          {item.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'PASSIVE')}
                              disabled={submitting}
                              style={styles.btnPassive}
                              title="İlanı Pasife Al"
                            >
                              Pasife Al
                            </button>
                          )}

                          {item.status === 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'APPROVE')}
                              disabled={submitting}
                              style={styles.btnApprove}
                              title="Yeniden Onayla"
                            >
                              Tekrar Onayla
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ret Gerekçesi Modalı */}
      {rejectModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>İlanı Reddet</h3>
            <p style={styles.modalSub}>
              "{selectedListing?.title}" başlıklı ilanı reddetmek üzeresiniz. Lütfen personele iletilecek gerekçeyi yazınız:
            </p>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Örn: İlan içeriği hastane kurallarına veya kurum içi satış standartlarına uygun değildir."
              style={styles.modalTextarea}
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason('');
                  setSelectedListing(null);
                }}
                style={styles.btnModalCancel}
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={submitting || rejectReason.trim().length < 5}
                onClick={() => handleStatusChange(selectedListing.id, 'REJECT', rejectReason)}
                style={styles.btnModalConfirm}
              >
                {submitting ? 'İşleniyor...' : 'Reddetmeyi Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  filterBar: {
    marginBottom: '16px',
    backgroundColor: '#ffffff',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    marginRight: '6px',
  },
  filterBtn: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  loadingBox: {
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
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
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    verticalAlign: 'middle',
  },
  listingTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  listingTitle: {
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.3,
  },
  btnEditPencil: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    opacity: 0.8,
  },
  listingDescSnippet: {
    margin: '4px 0 2px 0',
    fontSize: '12px',
    color: '#64748b',
    lineHeight: 1.4,
  },
  dateMeta: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  editBox: {
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
  },
  editLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    display: 'block',
    marginBottom: '2px',
  },
  editInput: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    marginBottom: '6px',
    boxSizing: 'border-box',
  },
  editTextarea: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  btnSaveInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCancelInline: {
    backgroundColor: '#e2e8f0',
    color: '#475569',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  catBadge: {
    backgroundColor: '#e0f2fe',
    color: '#004f8c',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  priceText: {
    fontWeight: '700',
    color: '#004f8c',
    fontSize: '13px',
  },
  statusTag: {
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
  },
  rejectionNotice: {
    fontSize: '11px',
    color: '#dc2626',
    marginTop: '4px',
    maxWidth: '160px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  btnApprove: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnReject: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnPassive: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
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
    zIndex: 9999,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    width: '440px',
    maxWidth: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px 0',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    fontSize: '13px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnModalCancel: {
    backgroundColor: '#e2e8f0',
    color: '#475569',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnModalConfirm: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
