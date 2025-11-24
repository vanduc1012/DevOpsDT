import React, { useState, useEffect } from 'react';
import { promotionService, menuService } from '../api/services';

function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    startDate: '',
    endDate: '',
    active: true,
    menuItemId: '',
  });

  useEffect(() => {
    loadPromotions();
    loadMenuItems();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await promotionService.getAll();
      setPromotions(response.data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await menuService.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discountValue: parseFloat(formData.discountValue) || 0,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        menuItemId: formData.menuItemId || null,
      };
      
      if (editingPromotion) {
        const promotionId = editingPromotion._id || editingPromotion.id;
        if (!promotionId) {
          alert('Lỗi: Không tìm thấy ID của chương trình khuyến mãi. Vui lòng thử lại.');
          return;
        }
        await promotionService.update(promotionId, data);
      } else {
        await promotionService.create(data);
      }
      setShowModal(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      alert('Lỗi khi lưu khuyến mãi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name || '',
      description: promotion.description || '',
      type: promotion.type || 'PERCENTAGE',
      discountValue: promotion.discountValue || '',
      minOrderAmount: promotion.minOrderAmount || '',
      startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
      endDate: promotion.endDate ? promotion.endDate.split('T')[0] : '',
      active: promotion.active !== undefined ? promotion.active : true,
      menuItemId: promotion.menuItemId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Lỗi: Không tìm thấy ID của chương trình khuyến mãi. Vui lòng thử lại.');
      return;
    }
    
    if (window.confirm('Bạn có chắc muốn xóa chương trình khuyến mãi này?')) {
      try {
        await promotionService.delete(id);
        loadPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        alert('Lỗi khi xóa khuyến mãi: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleToggle = async (id) => {
    if (!id) {
      alert('Lỗi: Không tìm thấy ID của chương trình khuyến mãi. Vui lòng thử lại.');
      return;
    }
    
    try {
      await promotionService.toggle(id);
      loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      alert('Lỗi khi thay đổi trạng thái: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      startDate: '',
      endDate: '',
      active: true,
      menuItemId: '',
    });
    setEditingPromotion(null);
  };

  const getPromotionTypeLabel = (type) => {
    const labels = {
      PERCENTAGE: 'Giảm %',
      FIXED_AMOUNT: 'Giảm số tiền',
      BUY_ONE_GET_ONE: 'Mua 1 tặng 1',
      FREE_ITEM: 'Tặng món',
    };
    return labels[type] || type;
  };

  const isActive = (promotion) => {
    if (!promotion.active) return false;
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return now >= start && now <= end;
  };

  const formatDiscount = (promotion) => {
    if (promotion.type === 'PERCENTAGE') {
      return `Giảm ${promotion.discountValue}%`;
    } else if (promotion.type === 'FIXED_AMOUNT') {
      return `Giảm ${promotion.discountValue?.toLocaleString('vi-VN')} ₫`;
    } else {
      return getPromotionTypeLabel(promotion.type);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản Lý Khuyến Mãi</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Thêm Khuyến Mãi
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên chương trình</th>
                <th>Mô tả</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => {
                const active = isActive(promotion);
                const promotionId = promotion._id || promotion.id;
                return (
                  <tr key={promotionId}>
                    <td><strong>{promotion.name}</strong></td>
                    <td>{promotion.description}</td>
                    <td>{getPromotionTypeLabel(promotion.type)}</td>
                    <td>{formatDiscount(promotion)}</td>
                    <td>{promotion.minOrderAmount ? promotion.minOrderAmount.toLocaleString('vi-VN') + ' ₫' : '-'}</td>
                    <td>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</td>
                    <td>{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`badge ${active ? 'badge-available' : 'badge-cancelled'}`}>
                        {active ? 'Đang hoạt động' : promotion.active ? 'Chưa bắt đầu / Đã kết thúc' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleEdit(promotion)} style={{ marginRight: '0.5rem' }}>
                        Sửa
                      </button>
                      <button 
                        className={`btn ${promotion.active ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggle(promotionId)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        {promotion.active ? 'Tạm dừng' : 'Kích hoạt'}
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(promotionId)}>
                        Xóa
                      </button>
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
            <h2>{editingPromotion ? 'Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên chương trình *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Loại khuyến mãi *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="PERCENTAGE">Giảm theo phần trăm</option>
                  <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
                  <option value="BUY_ONE_GET_ONE">Mua 1 tặng 1</option>
                  <option value="FREE_ITEM">Tặng món</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giá trị khuyến mãi *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                  placeholder={formData.type === 'PERCENTAGE' ? 'VD: 10 (10%)' : 'VD: 50000 (50,000 ₫)'}
                />
              </div>
              <div className="form-group">
                <label>Đơn hàng tối thiểu (₫)</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="Để trống nếu không yêu cầu"
                />
              </div>
              <div className="form-group">
                <label>Áp dụng cho món cụ thể</label>
                <select
                  value={formData.menuItemId}
                  onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
                >
                  <option value="">Tất cả món</option>
                  {menuItems.map((item) => {
                    const itemId = item._id || item.id;
                    return (
                      <option key={itemId} value={itemId}>{item.name}</option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  {' '}Kích hoạt ngay
                </label>
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
    </div>
  );
}

export default PromotionManagement;

