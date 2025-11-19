import React, { useState } from 'react';
import { authService } from '../api/services';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Attempting login with username:', username);
    try {
      const result = await authService.login(username, password);
      console.log('Login successful:', result);
      // Reload trang để axios config được cập nhật
      window.location.href = '/';
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      
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
        <h2>Đăng Nhập</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Đăng Nhập</button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
