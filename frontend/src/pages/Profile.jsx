import React, { useEffect, useState } from 'react';
import { userService } from '../api/services';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getMe();
        setProfile(response.data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#d32f2f' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1>👤 Thông Tin Cá Nhân</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Dữ liệu tài khoản của bạn được bảo mật và chỉ bạn mới xem được thông tin này.
        </p>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: '#f5ebe0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#7a4b2c',
                fontWeight: 'bold',
              }}
            >
              {profile.fullName?.charAt(0) || profile.username?.charAt(0)}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{profile.fullName}</h2>
              <p style={{ margin: '0.2rem 0', color: '#666' }}>Tên đăng nhập: {profile.username}</p>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '0.2rem 0.8rem',
                  borderRadius: '999px',
                  background: profile.role === 'ADMIN' ? '#d1fae5' : '#e0f2fe',
                  color: profile.role === 'ADMIN' ? '#047857' : '#0369a1',
                  fontWeight: 600,
                }}
              >
                {profile.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="profile-field">
              <p className="profile-label">Email</p>
              <p className="profile-value">{profile.email || 'Chưa cập nhật'}</p>
            </div>
            <div className="profile-field">
              <p className="profile-label">Số điện thoại</p>
              <p className="profile-value">{profile.phone || 'Chưa cập nhật'}</p>
            </div>
            <div className="profile-field">
              <p className="profile-label">Ngày tạo</p>
              <p className="profile-value">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleString('vi-VN') : '-'}
              </p>
            </div>
            <div className="profile-field">
              <p className="profile-label">Lần cập nhật cuối</p>
              <p className="profile-value">
              {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString('vi-VN') : '-'}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: '#fff8e1',
              color: '#8a6d3b',
              fontSize: '0.95rem',
            }}
          >
            <strong>🔒 Bảo mật:</strong> Nếu bạn muốn thay đổi thông tin cá nhân hoặc mật khẩu, vui lòng liên hệ quản
            trị viên hoặc bộ phận hỗ trợ.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

