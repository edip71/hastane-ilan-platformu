import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Plus, Edit2, EyeOff, Eye, CheckCircle2, 
  AlertCircle, ChevronRight, Layers, Tag, X, Loader2 
} from 'lucide-react';

export default function AdminCategoriesTab({ token }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Yeni Kategori Formu
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState('');
  const [newCatOrder, setNewCatOrder] = useState('0');
  const [customFields, setCustomFields] = useState([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');

  // Düzenleme / Pasife Alma Modalı
  const [selectedCat, setSelectedCat] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'TOGGLE_STATUS'

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Kategoriler alınamadı.');
      }
    } catch {
      setError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.display_order || 0), 0);
    setNewCatOrder(String(maxOrder + 1));
    setNewCatName('');
    setNewCatParentId('');
    setCustomFields([]);
    setError('');
    setShowAddModal(true);
  };

  const handleAddField = () => {
    if (!fieldName.trim()) return;
    const opts = fieldOptions.split(',').map(o => o.trim()).filter(Boolean);
    if (fieldType === 'select' && opts.length === 0) {
      setError('Seçmeli alan için en az 1 seçenek girmelisiniz (Virgülle ayırın).');
      return;
    }
    setError('');
    setCustomFields([
      ...customFields,
      {
        name: fieldName.trim(),
        type: fieldType,
        required: fieldRequired,
        ...(opts.length > 0 ? { options: opts } : {})
      }
    ]);
    setFieldName('');
    setFieldOptions('');
    setFieldRequired(false);
  };

  const handleRemoveField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setError('Kategori adı zorunludur.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCatName.trim(),
          parentId: newCatParentId || null,
          displayOrder: parseInt(newCatOrder, 10) || 0,
          customFields: customFields
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Kategori başarıyla oluşturuldu.');
        setShowAddModal(false);
        setNewCatName('');
        setNewCatParentId('');
        setNewCatOrder('0');
        setCustomFields([]);
        fetchCategories();
      } else {
        setError(data.error || 'Kategori eklenemedi.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/categories/${cat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !cat.is_active
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Kategori başarıyla ${!cat.is_active ? 'etkinleştirildi' : 'pasife alındı'}.`);
        setSelectedCat(null);
        setModalMode(null);
        fetchCategories();
      } else {
        setError(data.error || 'İşlem başarısız.');
      }
    } catch {
      setError('Sunucu hatası.');
    }
  };

  // Ana kategorileri bul (Parent ID'si olmayanlar)
  const rootCategories = categories.filter(c => !c.parent_id);

  return (
    <div>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.tabTitle}>Kategori ve Alt Kategori Yönetimi</h2>
          <p style={styles.tabSubtitle}>
            İlanlarda kullanılan kategorileri düzenleyin, yeni özel alanlar tanımlayın veya pasife alın.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal} 
          style={styles.btnAdd}
        >
          <Plus size={16} />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {success && (
        <div style={styles.successAlert}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Kategori Tablosu */}
      <div style={styles.card}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>Yükleniyor...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>Henüz kayıtlı kategori bulunamadı.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Sıra</th>
                  <th style={styles.th}>Kategori Adı</th>
                  <th style={styles.th}>Türü</th>
                  <th style={styles.th}>Özel Alanlar</th>
                  <th style={styles.th}>Durum</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.orderBadge}>{cat.display_order}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {cat.parent_id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px' }}>
                            <ChevronRight size={14} />
                            <strong>{cat.name}</strong>
                          </div>
                        ) : (
                          <span style={{ fontWeight: '700', color: '#004f8c', fontSize: '14px' }}>
                            {cat.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        {cat.parent_id ? `Alt Kategori (${cat.parent_name || 'Ana'})` : 'Ana Kategori'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {Array.isArray(cat.custom_fields) && cat.custom_fields.length > 0 ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {cat.custom_fields.map((f, i) => (
                            <span key={i} style={styles.fieldTag}>
                              {f.name} ({f.type})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Özel alan yok</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: cat.is_active ? '#dcfce7' : '#fee2e2',
                          color: cat.is_active ? '#166534' : '#991b1b',
                        }}
                      >
                        {cat.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedCat(cat);
                          setModalMode('TOGGLE_STATUS');
                        }}
                        style={{
                          ...styles.btnStatusAction,
                          backgroundColor: cat.is_active ? '#fee2e2' : '#dcfce7',
                          color: cat.is_active ? '#991b1b' : '#166534',
                          borderColor: cat.is_active ? '#fecaca' : '#bbf7d0',
                        }}
                        title={cat.is_active ? 'Pasife Al' : 'Aktifleştir'}
                      >
                        {cat.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{cat.is_active ? 'Pasife Al' : 'Etkinleştir'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* YENİ KATEGORİ EKLE MODAL */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '520px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Yeni Kategori Ekle</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.btnClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Kategori Adı *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Örn: Telefon & Tablet"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Üst Kategori</label>
                  <select
                    value={newCatParentId}
                    onChange={(e) => setNewCatParentId(e.target.value)}
                    style={styles.input}
                  >
                    <option value="">(Ana Kategori Olarak Ekle)</option>
                    {rootCategories.map((rc) => (
                      <option key={rc.id} value={rc.id}>{rc.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '100px' }}>
                  <label style={styles.label}>Sıra No</label>
                  <input
                    type="number"
                    value={newCatOrder}
                    onChange={(e) => setNewCatOrder(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Dinamik Özel Alan Tanımlama Bölümü */}
              <div style={styles.customFieldSection}>
                <h4 style={styles.customFieldTitle}>Dinamik Özel Alan Tanımla (İsteğe Bağlı)</h4>
                <div style={styles.row}>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Alan Adı (Örn: Garanti)"
                    style={{ ...styles.input, flex: 2 }}
                  />
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    style={{ ...styles.input, flex: 1 }}
                  >
                    <option value="text">Metin</option>
                    <option value="number">Sayı</option>
                    <option value="select">Seçenekli</option>
                  </select>
                </div>

                {fieldType === 'select' && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      value={fieldOptions}
                      onChange={(e) => setFieldOptions(e.target.value)}
                      placeholder="Virgülle seçenekleri ayırın: Var, Yok, Belirtilmemiş"
                      style={styles.input}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={fieldRequired}
                      onChange={(e) => setFieldRequired(e.target.checked)}
                    />
                    <span>Zorunlu Alan</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    style={styles.btnAddField}
                  >
                    + Alan Ekle
                  </button>
                </div>

                {/* Eklenen Alanların Listesi */}
                {customFields.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {customFields.map((f, i) => (
                      <span key={i} style={styles.addedFieldTag}>
                        {f.name} ({f.type}){f.required && ' *'}
                        <X 
                          size={12} 
                          style={{ cursor: 'pointer', marginLeft: '4px' }} 
                          onClick={() => handleRemoveField(i)} 
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  style={styles.btnCancel}
                >
                  Vazgeç
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={styles.btnSubmit}
                >
                  {loading ? 'Kaydediliyor...' : 'Kategoriyi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASİFE AL / AKTİF ET ONAY MODAL */}
      {modalMode === 'TOGGLE_STATUS' && selectedCat && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 10px 0', color: selectedCat.is_active ? '#991b1b' : '#166534' }}>
              {selectedCat.is_active ? 'Kategoriyi Pasife Al' : 'Kategoriyi Etkinleştir'}
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
              <strong>"{selectedCat.name}"</strong> kategorisini {selectedCat.is_active ? 'pasife almak üzeresiniz. Pasif kategoriler yeni ilan oluşturulurken seçilemez.' : 'etkinleştirmek üzeresiniz.'}
            </p>
            <div style={styles.modalActions}>
              <button onClick={() => { setSelectedCat(null); setModalMode(null); }} style={styles.btnCancel}>
                Vazgeç
              </button>
              <button
                onClick={() => handleToggleStatus(selectedCat)}
                style={{
                  ...styles.btnSubmit,
                  backgroundColor: selectedCat.is_active ? '#dc2626' : '#16a34a',
                }}
              >
                {selectedCat.is_active ? 'Evet, Pasife Al' : 'Evet, Etkinleştir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tabTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  tabSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
  orderBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '700',
  },
  fieldTag: {
    fontSize: '11px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  btnStatusAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
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
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  btnClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
  },
  formGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    gap: '10px',
    marginBottom: '14px',
  },
  customFieldSection: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
  },
  customFieldTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px 0',
  },
  btnAddField: {
    backgroundColor: '#e2e8f0',
    color: '#334155',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  addedFieldTag: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#004f8c',
    color: '#ffffff',
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
  },
  btnCancel: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  btnSubmit: {
    backgroundColor: '#004f8c',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
