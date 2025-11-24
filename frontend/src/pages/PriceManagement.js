import React, { useState, useEffect } from 'react';
import { menuService, priceService } from '../api/services';
import { authService } from '../api/services';
import { debugAuth } from '../utils/authDebug';

function PriceManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [priceForm, setPriceForm] = useState({
    newPrice: '',
    reason: '',
  });

  useEffect(() => {
    // Kiểm tra authentication
    const user = authService.getCurrentUser();
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      window.location.href = '/login';
      return;
    }
    
    if (!authService.isAdmin()) {
      alert('Bạn không có quyền truy cập trang này.');
      window.location.href = '/';
      return;
    }
    
    console.log('User authenticated:', user);
    console.log('Token exists:', !!token);
    
    // Debug authentication
    debugAuth();
    
    loadMenuItems();
    loadPriceHistory();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await menuService.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const loadPriceHistory = async () => {
    try {
      const response = await priceService.getHistory();
      console.log('Price history loaded:', response.data);
      setPriceHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading price history:', error);
      console.error('Error details:', error.response?.data);
      setPriceHistory([]); // Set empty array on error
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        authService.logout();
        window.location.href = '/login';
      } else if (error.response?.status === 500) {
        console.warn('Server error loading price history, continuing with empty list');
      }
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    try {
      const newPrice = parseFloat(priceForm.newPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        alert('Vui lòng nhập giá hợp lệ (số dương)');
        return;
      }
      
      // Ensure we have the correct ID
      const menuItemId = selectedItem._id || selectedItem.id;
      if (!menuItemId) {
        alert('Lỗi: Không tìm thấy ID của món. Vui lòng thử lại.');
        return;
      }
      
      console.log('Updating price:', {
        menuItemId: menuItemId,
        newPrice: newPrice,
        reason: priceForm.reason,
        selectedItem: selectedItem
      });
      
      const response = await priceService.updatePrice(menuItemId, {
        newPrice: newPrice,
        reason: priceForm.reason,
      });
      
      console.log('Price update response:', response);
      
      setShowPriceModal(false);
      setPriceForm({ newPrice: '', reason: '' });
      loadMenuItems();
      loadPriceHistory();
      alert('Cập nhật giá thành công!');
    } catch (error) {
      console.error('Error updating price:', error);
      
      // Xử lý lỗi 401 - Unauthorized
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        authService.logout();
        window.location.href = '/login';
        return;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Không thể cập nhật giá. Vui lòng thử lại.';
      alert('Lỗi khi cập nhật giá: ' + errorMessage);
    }
  };

  const openPriceModal = (item) => {
    console.log('Opening price modal for item:', item);
    // Ensure we have the correct ID field (_id from MongoDB or id)
    const itemId = item._id || item.id;
    if (!itemId) {
      console.error('Item ID is missing:', item);
      alert('Lỗi: Không tìm thấy ID của món. Vui lòng thử lại.');
      return;
    }
    
    setSelectedItem({ ...item, id: itemId });
    setPriceForm({
      newPrice: item.price || '',
      reason: '',
    });
    setShowPriceModal(true);
  };

  const openHistoryModal = async (item) => {
    console.log('Opening history modal for item:', item);
    // Ensure we have the correct ID field (_id from MongoDB or id)
    const itemId = item._id || item.id;
    if (!itemId) {
      console.error('Item ID is missing:', item);
      alert('Lỗi: Không tìm thấy ID của món. Vui lòng thử lại.');
      return;
    }
    
    setSelectedItem({ ...item, id: itemId });
    try {
      const response = await priceService.getHistoryByMenuItem(itemId);
      setPriceHistory(response.data);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
    setShowHistoryModal(true);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Quản Lý Giá Bán</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên món</th>
                <th>Danh mục</th>
                <th>Giá hiện tại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => {
                const itemId = item._id || item.id;
                return (
                  <tr key={itemId}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td><strong>{item.price?.toLocaleString('vi-VN')} ₫</strong></td>
                    <td>
                      <span className={`badge ${item.available ? 'badge-available' : 'badge-cancelled'}`}>
                        {item.available ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary" onClick={() => openPriceModal(item)} style={{ marginRight: '0.5rem' }}>
                        Cập nhật giá
                      </button>
                      <button className="btn btn-secondary" onClick={() => openHistoryModal(item)}>
                        Lịch sử giá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Lịch Sử Thay Đổi Giá (Tất Cả)</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ngày thay đổi</th>
                <th>Món ăn</th>
                <th>Giá cũ</th>
                <th>Giá mới</th>
                <th>Thay đổi</th>
                <th>Người thay đổi</th>
                <th>Lý do</th>
              </tr>
            </thead>
            <tbody>
              {priceHistory.map((history) => {
                const change = history.newPrice - history.oldPrice;
                const changePercent = ((change / history.oldPrice) * 100).toFixed(1);
                return (
                  <tr key={history.id}>
                    <td>{new Date(history.changeDate).toLocaleString('vi-VN')}</td>
                    <td>{history.menuItemName}</td>
                    <td>{history.oldPrice?.toLocaleString('vi-VN')} ₫</td>
                    <td><strong>{history.newPrice?.toLocaleString('vi-VN')} ₫</strong></td>
                    <td>
                      <span style={{ color: change >= 0 ? '#28a745' : '#dc3545' }}>
                        {change >= 0 ? '+' : ''}{change.toLocaleString('vi-VN')} ₫ ({changePercent}%)
                      </span>
                    </td>
                    <td>{history.changedBy}</td>
                    <td>{history.reason || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPriceModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Cập Nhật Giá - {selectedItem.name}</h2>
            <form onSubmit={handleUpdatePrice}>
              <div className="form-group">
                <label>Giá hiện tại</label>
                <input
                  type="text"
                  value={selectedItem.price?.toLocaleString('vi-VN') + ' ₫'}
                  disabled
                  style={{ background: '#f5f5f5' }}
                />
              </div>
              <div className="form-group">
                <label>Giá mới *</label>
                <input
                  type="number"
                  value={priceForm.newPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, newPrice: e.target.value })}
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label>Lý do thay đổi</label>
                <textarea
                  value={priceForm.reason}
                  onChange={(e) => setPriceForm({ ...priceForm, reason: e.target.value })}
                  rows="3"
                  placeholder="VD: Điều chỉnh theo giá thị trường, Khuyến mãi..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPriceModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Lịch Sử Giá - {selectedItem.name}</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ngày thay đổi</th>
                    <th>Giá cũ</th>
                    <th>Giá mới</th>
                    <th>Thay đổi</th>
                    <th>Người thay đổi</th>
                    <th>Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.filter(h => {
                    const historyItemId = h.menuItemId?._id || h.menuItemId;
                    const selectedItemId = selectedItem._id || selectedItem.id;
                    return historyItemId === selectedItemId || historyItemId?.toString() === selectedItemId?.toString();
                  }).map((history) => {
                    const change = history.newPrice - history.oldPrice;
                    const changePercent = ((change / history.oldPrice) * 100).toFixed(1);
                    return (
                      <tr key={history.id}>
                        <td>{new Date(history.changeDate).toLocaleString('vi-VN')}</td>
                        <td>{history.oldPrice?.toLocaleString('vi-VN')} ₫</td>
                        <td><strong>{history.newPrice?.toLocaleString('vi-VN')} ₫</strong></td>
                        <td>
                          <span style={{ color: change >= 0 ? '#28a745' : '#dc3545' }}>
                            {change >= 0 ? '+' : ''}{change.toLocaleString('vi-VN')} ₫ ({changePercent}%)
                          </span>
                        </td>
                        <td>{history.changedBy}</td>
                        <td>{history.reason || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => {
                setShowHistoryModal(false);
                setSelectedItem(null);
                loadPriceHistory();
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

export default PriceManagement;

