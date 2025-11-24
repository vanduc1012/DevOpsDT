import React, { useState, useEffect } from 'react';
import { tableService } from '../api/services';

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const response = await tableService.getAll();
      setTables(response.data);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        const tableId = editingTable._id || editingTable.id;
        if (!tableId) {
          alert('Lỗi: Không tìm thấy ID của bàn. Vui lòng thử lại.');
          return;
        }
        await tableService.update(tableId, formData);
      } else {
        await tableService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadTables();
    } catch (error) {
      alert('Lỗi khi lưu bàn: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData(table);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Lỗi: Không tìm thấy ID của bàn. Vui lòng thử lại.');
      return;
    }
    
    if (window.confirm('Bạn có chắc muốn xóa bàn này?')) {
      try {
        await tableService.delete(id);
        loadTables();
      } catch (error) {
        console.error('Error deleting table:', error);
        alert('Lỗi khi xóa bàn: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!id) {
      alert('Lỗi: Không tìm thấy ID của bàn. Vui lòng thử lại.');
      return;
    }
    
    try {
      await tableService.updateStatus(id, status);
      loadTables();
    } catch (error) {
      console.error('Error updating table status:', error);
      alert('Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      capacity: '',
      status: 'AVAILABLE',
    });
    setEditingTable(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      AVAILABLE: 'badge-available',
      OCCUPIED: 'badge-occupied',
      PAID: 'badge-paid',
    };
    const labels = {
      AVAILABLE: 'Chưa có khách',
      OCCUPIED: 'Đã có khách',
      PAID: 'Đã thanh toán',
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản Lý Bàn</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Thêm Bàn Mới
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Số bàn</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => {
                const tableId = table._id || table.id;
                return (
                  <tr key={tableId}>
                    <td>Bàn {table.tableNumber}</td>
                    <td>{table.capacity} người</td>
                    <td>{getStatusBadge(table.status)}</td>
                    <td>
                      <select
                        value={table.status}
                        onChange={(e) => handleUpdateStatus(tableId, e.target.value)}
                        style={{ marginRight: '0.5rem', padding: '0.25rem' }}
                      >
                        <option value="AVAILABLE">Chưa có khách</option>
                        <option value="OCCUPIED">Đã có khách</option>
                        <option value="PAID">Đã thanh toán</option>
                      </select>
                      <button className="btn btn-secondary" onClick={() => handleEdit(table)} style={{ marginRight: '0.5rem' }}>
                        Sửa
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(tableId)}>
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
            <h2>{editingTable ? 'Sửa Bàn' : 'Thêm Bàn Mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Số bàn *</label>
                <input
                  type="number"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Sức chứa (người)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="AVAILABLE">Chưa có khách</option>
                  <option value="OCCUPIED">Đã có khách</option>
                  <option value="PAID">Đã thanh toán</option>
                </select>
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

export default TableManagement;
