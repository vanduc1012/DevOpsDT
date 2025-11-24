import React, { useState, useEffect } from 'react';
import { userService, authService } from '../api/services';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('USER');

  useEffect(() => {
    if (!authService.isAdmin()) {
      alert('Bạn không có quyền truy cập trang này.');
      window.location.href = '/';
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateRole(userId, newRole);
      alert('Cập nhật quyền thành công!');
      loadUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error.response?.data?.message || 'Lỗi khi cập nhật quyền');
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
      return;
    }

    try {
      await userService.delete(userId);
      alert('Xóa người dùng thành công!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  const currentUser = authService.getCurrentUser();
  const isRootAccount = (user) => user.username === 'root';

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>👥 Quản Lý Người Dùng</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Quản lý quyền truy cập của người dùng trong hệ thống
        </p>

        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
          <strong>⚠️ Lưu ý:</strong> Tài khoản <strong>root</strong> được bảo vệ và không thể thay đổi quyền hoặc xóa.
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Quyền</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const isProtected = isRootAccount(user);
                  const isCurrentUser = currentUser && user._id === currentUser._id;

                  return (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>
                        {user.username}
                        {isProtected && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            padding: '0.25rem 0.5rem', 
                            background: '#ff9800', 
                            color: 'white', 
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}>
                            🔒 Protected
                          </span>
                        )}
                      </td>
                      <td>{user.fullName}</td>
                      <td>{user.email || '-'}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        {editingUser === user._id ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            style={{ padding: '0.25rem', marginRight: '0.5rem' }}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              backgroundColor: user.role === 'ADMIN' ? '#4caf50' : '#2196F3',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        {editingUser === user._id ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleRoleChange(user._id, newRole)}
                              style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              ✓ Lưu
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setNewRole('USER');
                              }}
                              style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: '#9e9e9e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              ✗ Hủy
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {!isProtected && (
                              <button
                                onClick={() => {
                                  setEditingUser(user._id);
                                  setNewRole(user.role);
                                }}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  backgroundColor: '#2196F3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                ✏️ Đổi quyền
                              </button>
                            )}
                            {!isProtected && !isCurrentUser && (
                              <button
                                onClick={() => handleDelete(user._id, user.username)}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                🗑️ Xóa
                              </button>
                            )}
                            {isProtected && (
                              <span style={{ color: '#999', fontSize: '0.875rem' }}>
                                Không thể thay đổi
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;

