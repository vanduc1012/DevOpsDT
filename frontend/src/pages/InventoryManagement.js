import React, { useState, useEffect } from 'react';
import { inventoryService } from '../api/services';

function InventoryManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState('import');
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
    category: '',
    supplier: '',
    notes: '',
  });
  const [transactionData, setTransactionData] = useState({
    quantity: '',
    unitPrice: '',
    supplier: '',
    notes: '',
    newStock: '',
    reason: '',
  });

  useEffect(() => {
    loadIngredients();
    loadLowStock();
  }, []);

  const loadIngredients = async () => {
    try {
      const response = await inventoryService.getAll();
      setIngredients(response.data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const loadLowStock = async () => {
    try {
      const response = await inventoryService.getLowStock();
      setLowStockItems(response.data);
    } catch (error) {
      console.error('Error loading low stock:', error);
    }
  };

  const loadTransactions = async (ingredientId) => {
    try {
      const response = await inventoryService.getTransactionsByIngredient(ingredientId);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const itemId = editingItem._id || editingItem.id;
        if (!itemId) {
          alert('Lỗi: Không tìm thấy ID của nguyên liệu. Vui lòng thử lại.');
          return;
        }
        await inventoryService.update(itemId, formData);
      } else {
        await inventoryService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadIngredients();
      loadLowStock();
    } catch (error) {
      alert('Lỗi khi lưu nguyên liệu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      const ingredientId = selectedIngredient?._id || selectedIngredient?.id;
      if (!ingredientId) {
        alert('Lỗi: Không tìm thấy ID của nguyên liệu. Vui lòng thử lại.');
        return;
      }
      
      if (transactionType === 'import') {
        await inventoryService.importStock(ingredientId, {
          quantity: parseFloat(transactionData.quantity),
          unitPrice: parseFloat(transactionData.unitPrice),
          supplier: transactionData.supplier,
          notes: transactionData.notes,
        });
      } else if (transactionType === 'export') {
        await inventoryService.exportStock(ingredientId, {
          quantity: parseFloat(transactionData.quantity),
          notes: transactionData.notes,
        });
      } else if (transactionType === 'adjust') {
        await inventoryService.adjustStock(ingredientId, {
          newStock: parseFloat(transactionData.newStock),
          reason: transactionData.reason,
        });
      }
      setShowTransactionModal(false);
      resetTransactionForm();
      loadIngredients();
      loadLowStock();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      unit: item.unit || '',
      currentStock: item.currentStock || 0,
      minStock: item.minStock || 0,
      maxStock: item.maxStock || 0,
      unitPrice: item.unitPrice || 0,
      category: item.category || '',
      supplier: item.supplier || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Lỗi: Không tìm thấy ID của nguyên liệu. Vui lòng thử lại.');
      return;
    }
    
    if (window.confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
      try {
        await inventoryService.delete(id);
        loadIngredients();
        loadLowStock();
      } catch (error) {
        console.error('Error deleting ingredient:', error);
        alert('Lỗi khi xóa nguyên liệu: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const openTransactionModal = (item, type) => {
    setSelectedIngredient(item);
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const openHistoryModal = async (item) => {
    const itemId = item._id || item.id;
    if (!itemId) {
      alert('Lỗi: Không tìm thấy ID của nguyên liệu. Vui lòng thử lại.');
      return;
    }
    setSelectedIngredient(item);
    await loadTransactions(itemId);
    setShowHistoryModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitPrice: 0,
      category: '',
      supplier: '',
      notes: '',
    });
    setEditingItem(null);
  };

  const resetTransactionForm = () => {
    setTransactionData({
      quantity: '',
      unitPrice: '',
      supplier: '',
      notes: '',
      newStock: '',
      reason: '',
    });
    setSelectedIngredient(null);
  };

  const getStockStatus = (ingredient) => {
    if (ingredient.currentStock <= ingredient.minStock) {
      return { status: 'low', label: 'Sắp hết', className: 'badge-cancelled' };
    } else if (ingredient.currentStock >= ingredient.maxStock * 0.9) {
      return { status: 'high', label: 'Đầy', className: 'badge-available' };
    }
    return { status: 'normal', label: 'Bình thường', className: 'badge-paid' };
  };

  return (
    <div className="container">
      {lowStockItems.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', background: '#fff3cd', border: '2px solid #ffc107' }}>
          <h3 style={{ color: '#856404', marginBottom: '0.5rem' }}>⚠️ Cảnh Báo: Nguyên Liệu Sắp Hết</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {lowStockItems.map((item) => {
              const itemId = item._id || item.id;
              return (
                <span key={itemId} className="badge badge-cancelled" style={{ fontSize: '0.9rem' }}>
                  {item.name}: {item.currentStock} {item.unit} (Tối thiểu: {item.minStock} {item.unit})
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản Lý Kho</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Thêm Nguyên Liệu
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên nguyên liệu</th>
                <th>Đơn vị</th>
                <th>Tồn kho</th>
                <th>Min/Max</th>
                <th>Giá đơn vị</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((item) => {
                const stockStatus = getStockStatus(item);
                const itemId = item._id || item.id;
                return (
                  <tr key={itemId}>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td><strong>{item.currentStock}</strong></td>
                    <td>{item.minStock} / {item.maxStock}</td>
                    <td>{item.unitPrice?.toLocaleString('vi-VN')} ₫</td>
                    <td>{item.category}</td>
                    <td>
                      <span className={`badge ${stockStatus.className}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-success" onClick={() => openTransactionModal(item, 'import')} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                          Nhập
                        </button>
                        <button className="btn btn-secondary" onClick={() => openTransactionModal(item, 'export')} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                          Xuất
                        </button>
                        <button className="btn btn-secondary" onClick={() => openTransactionModal(item, 'adjust')} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                          Điều chỉnh
                        </button>
                        <button className="btn btn-secondary" onClick={() => openHistoryModal(item)} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                          Lịch sử
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleEdit(item)} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                          Sửa
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(itemId)} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingItem ? 'Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên nguyên liệu *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Đơn vị *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="VD: kg, lít, gói, cái"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tồn kho hiện tại</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Tồn kho tối thiểu (cảnh báo) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tồn kho tối đa</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Giá đơn vị (₫)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Cà phê">Cà phê</option>
                  <option value="Sữa">Sữa</option>
                  <option value="Bánh">Bánh</option>
                  <option value="Đường">Đường</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nhà cung cấp</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransactionModal && selectedIngredient && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {transactionType === 'import' && 'Nhập Kho'}
              {transactionType === 'export' && 'Xuất Kho'}
              {transactionType === 'adjust' && 'Điều Chỉnh Kho'}
              {' - '}{selectedIngredient.name}
            </h2>
            <form onSubmit={handleTransaction}>
              {transactionType === 'import' && (
                <>
                  <div className="form-group">
                    <label>Số lượng *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionData.quantity}
                      onChange={(e) => setTransactionData({ ...transactionData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá đơn vị (₫) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionData.unitPrice}
                      onChange={(e) => setTransactionData({ ...transactionData, unitPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nhà cung cấp</label>
                    <input
                      type="text"
                      value={transactionData.supplier}
                      onChange={(e) => setTransactionData({ ...transactionData, supplier: e.target.value })}
                    />
                  </div>
                </>
              )}
              {transactionType === 'export' && (
                <div className="form-group">
                  <label>Số lượng *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionData.quantity}
                    onChange={(e) => setTransactionData({ ...transactionData, quantity: e.target.value })}
                    required
                    max={selectedIngredient.currentStock}
                  />
                  <small>Tồn kho hiện tại: {selectedIngredient.currentStock} {selectedIngredient.unit}</small>
                </div>
              )}
              {transactionType === 'adjust' && (
                <div className="form-group">
                  <label>Tồn kho mới *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionData.newStock}
                    onChange={(e) => setTransactionData({ ...transactionData, newStock: e.target.value })}
                    required
                  />
                  <small>Tồn kho hiện tại: {selectedIngredient.currentStock} {selectedIngredient.unit}</small>
                </div>
              )}
              <div className="form-group">
                <label>Ghi chú / Lý do</label>
                <textarea
                  value={transactionData.notes || transactionData.reason}
                  onChange={(e) => {
                    if (transactionType === 'adjust') {
                      setTransactionData({ ...transactionData, reason: e.target.value });
                    } else {
                      setTransactionData({ ...transactionData, notes: e.target.value });
                    }
                  }}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowTransactionModal(false);
                  resetTransactionForm();
                }}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedIngredient && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Lịch Sử Giao Dịch - {selectedIngredient.name}</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Loại</th>
                    <th>Số lượng</th>
                    <th>Giá đơn vị</th>
                    <th>Tổng tiền</th>
                    <th>Tồn trước</th>
                    <th>Tồn sau</th>
                    <th>Người thực hiện</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.transactionDate).toLocaleString('vi-VN')}</td>
                      <td>
                        <span className={`badge ${
                          tx.type === 'IMPORT' ? 'badge-available' :
                          tx.type === 'EXPORT' ? 'badge-cancelled' : 'badge-paid'
                        }`}>
                          {tx.type === 'IMPORT' ? 'Nhập' : tx.type === 'EXPORT' ? 'Xuất' : 'Điều chỉnh'}
                        </span>
                      </td>
                      <td>{tx.quantity}</td>
                      <td>{tx.unitPrice?.toLocaleString('vi-VN')} ₫</td>
                      <td>{tx.totalAmount?.toLocaleString('vi-VN')} ₫</td>
                      <td>{tx.stockBefore}</td>
                      <td><strong>{tx.stockAfter}</strong></td>
                      <td>{tx.performedBy}</td>
                      <td>{tx.notes || tx.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => {
                setShowHistoryModal(false);
                setSelectedIngredient(null);
              }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;

