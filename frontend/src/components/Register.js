import React, { useState } from 'react';
import { authService } from '../api/services';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authService.register(formData);
      // Reload trang để axios config được cập nhật
      window.location.href = '/';
    } catch (err) {
      console.error('Register error:', err);
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        // Network error - cannot connect to backend
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.';
      } else {
        // Other error
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đăng Ký</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label>Tên đăng nhập *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="form-group">
          <label>Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>
        <button type="submit" className="btn btn-primary">Đăng Ký</button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
