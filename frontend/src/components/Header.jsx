import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/services';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const navItems = isAdmin
    ? [
        { to: '/', label: 'Trang chủ' },
        { to: '/admin/menu', label: 'Quản lý Menu' },
        { to: '/admin/tables', label: 'Quản lý Bàn' },
        { to: '/admin/orders', label: 'Quản lý Order' },
        { to: '/admin/prices', label: 'Quản lý Giá' },
        { to: '/admin/promotions', label: 'Khuyến Mãi' },
        { to: '/admin/inventory', label: 'Quản lý Kho' },
        { to: '/admin/payment', label: 'Thanh toán' },
        { to: '/admin/users', label: 'Quản lý User' },
        { to: '/admin/reports', label: 'Báo cáo' },
        { to: '/profile', label: 'Thông tin cá nhân' },
      ]
    : [
        { to: '/', label: 'Trang chủ' },
        { to: '/menu', label: 'Xem Menu' },
        { to: '/book-table', label: 'Đặt bàn' },
        { to: '/order-online', label: 'Đặt món online' },
        { to: '/my-orders', label: 'Đơn hàng của tôi' },
        { to: '/profile', label: 'Thông tin cá nhân' },
      ];

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <div className="header-logo">☕</div>
          <div>
            <h1>Quản Lý Quán Cafe</h1>
            <p>{isAdmin ? 'Bảng điều khiển quản trị' : 'Trải nghiệm khách hàng'}</p>
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`header-link ${isActive(item.to) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="header-user">
            <span className="header-role">{isAdmin ? 'ADMIN' : 'USER'}</span>
            <span className="header-name">{user.fullName}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary header-logout">
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
