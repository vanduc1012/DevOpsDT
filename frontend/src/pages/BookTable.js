import React, { useState, useEffect } from 'react';
import { tableService, menuService, orderService } from '../api/services';

function BookTable() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTables();
    loadMenu();
  }, []);

  const loadTables = async () => {
    try {
      const response = await tableService.getAll();
      setTables(response.data);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadMenu = async () => {
    try {
      const response = await menuService.getAvailable();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const handleSelectTable = (table) => {
    if (table.status !== 'AVAILABLE') {
      alert('Bàn này không khả dụng');
      return;
    }
    setSelectedTable(table);
    setShowModal(true);
  };

  const handleAddItem = (menuItem) => {
    const existing = selectedItems.find((item) => item.menuItemId === menuItem.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { menuItemId: menuItem.id, quantity: 1, name: menuItem.name, price: menuItem.price },
      ]);
    }
  };

  const handleRemoveItem = (menuItemId) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId, quantity) => {
    if (quantity < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một món');
      return;
    }

    try {
      const orderData = {
        tableId: selectedTable.id,
        items: selectedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: '',
        })),
      };
      await orderService.create(orderData);
      alert('Đặt bàn thành công!');
      setShowModal(false);
      setSelectedTable(null);
      setSelectedItems([]);
      loadTables();
    } catch (error) {
      alert('Lỗi khi đặt bàn: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTotalAmount = () => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      AVAILABLE: 'badge-available',
      OCCUPIED: 'badge-occupied',
      PAID: 'badge-paid',
    };
    const labels = {
      AVAILABLE: 'Trống',
      OCCUPIED: 'Đã đặt',
      PAID: 'Đã thanh toán',
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Đặt Bàn</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>Chọn bàn trống để đặt</p>

        <div className="grid">
          {tables.map((table) => (
            <div
              key={table.id}
              className="card"
              style={{
                cursor: table.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                opacity: table.status === 'AVAILABLE' ? 1 : 0.6,
                border: table.status === 'AVAILABLE' ? '2px solid #6f4e37' : '1px solid #ddd',
              }}
              onClick={() => handleSelectTable(table)}
            >
              <h3>Bàn {table.tableNumber}</h3>
              <p>Sức chứa: {table.capacity} người</p>
              {getStatusBadge(table.status)}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <h2>Đặt Bàn {selectedTable.tableNumber}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3>Menu</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {menuItems.map((item) => {
                    const itemId = item._id || item.id;
                    return (
                      <div
                        key={itemId}
                        style={{
                          padding: '1rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleAddItem(item)}
                      >
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ color: '#666', fontSize: '0.875rem' }}>{item.description}</div>
                        <div style={{ color: '#6f4e37', fontWeight: 'bold', marginTop: '0.5rem' }}>
                          {item.price?.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3>Order của bạn</h3>
                {selectedItems.length === 0 ? (
                  <p style={{ color: '#666' }}>Chưa có món nào</p>
                ) : (
                  <>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {selectedItems.map((item) => (
                        <div
                          key={item.menuItemId}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                            <div style={{ color: '#666' }}>{item.price?.toLocaleString('vi-VN')} ₫</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              +
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleRemoveItem(item.menuItemId)}
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem' }}>
                        <span>Tổng cộng:</span>
                        <span style={{ color: '#6f4e37' }}>{getTotalAmount().toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTable(null);
                  setSelectedItems([]);
                }}
              >
                Hủy
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmitOrder}>
                Đặt bàn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookTable;
