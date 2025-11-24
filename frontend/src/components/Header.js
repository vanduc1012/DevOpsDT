import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/services';

function Header() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1>☕ Quản Lý Quán Cafe</h1>
        <nav className="header-nav">
          <Link to="/">Trang chủ</Link>
          {isAdmin && (
            <>
              <Link to="/admin/menu">Quản lý Menu</Link>
              <Link to="/admin/tables">Quản lý Bàn</Link>
              <Link to="/admin/orders">Quản lý Order</Link>
              <Link to="/admin/prices">Quản lý Giá</Link>
              <Link to="/admin/promotions">Khuyến Mãi</Link>
              <Link to="/admin/inventory">Quản lý Kho</Link>
              <Link to="/admin/reports">Báo cáo</Link>
            </>
          )}
          {!isAdmin && (
            <>
              <Link to="/book-table">Đặt bàn</Link>
              <Link to="/my-orders">Đơn hàng của tôi</Link>
            </>
          )}
          <span style={{ color: '#fff' }}>{user.fullName}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            Đăng xuất
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
