import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api/services';
import Footer from '../components/Footer';

function Home() {
  const isAdmin = authService.isAdmin();

  const userShortcuts = [
    { to: '/menu', icon: '📋', title: 'Xem Menu', desc: 'Khám phá món mới nhất' },
    { to: '/book-table', icon: '🍽️', title: 'Đặt Bàn', desc: 'Chọn bàn yêu thích' },
    { to: '/order-online', icon: '🛒', title: 'Đặt Món Online', desc: 'Giao/nhận tại quầy' },
    { to: '/my-orders', icon: '📦', title: 'Đơn Hàng', desc: 'Theo dõi đơn đã đặt' },
  ];

  const adminShortcuts = [
    { to: '/admin/menu', icon: '📋', title: 'Quản Lý Menu', desc: 'Cập nhật món & hình ảnh' },
    { to: '/admin/tables', icon: '🪑', title: 'Quản Lý Bàn', desc: 'Theo dõi tình trạng bàn' },
    { to: '/admin/orders', icon: '📦', title: 'Quản Lý Order', desc: 'Kiểm soát tiến độ phục vụ' },
    { to: '/admin/prices', icon: '💰', title: 'Quản Lý Giá', desc: 'Điều chỉnh giá bán linh hoạt' },
    { to: '/admin/promotions', icon: '🎁', title: 'Khuyến Mãi', desc: 'Tạo combo & mã giảm giá' },
    { to: '/admin/inventory', icon: '📦', title: 'Quản Lý Kho', desc: 'Cảnh báo tồn kho thấp' },
    { to: '/admin/payment', icon: '💳', title: 'Thanh Toán', desc: 'Cấu hình QR & cổng thanh toán' },
    { to: '/admin/users', icon: '👥', title: 'Quản Lý User', desc: 'Phân quyền user/admin' },
    { to: '/admin/reports', icon: '📊', title: 'Báo Cáo', desc: 'Phân tích doanh thu' },
  ];

  const shortcuts = isAdmin ? adminShortcuts : userShortcuts;

  return (
    <>
      <div className="container home-layout">
        <section className="home-hero card">
          <div>
            <span className="home-hero__badge">{isAdmin ? 'Admin Dashboard' : 'Khách hàng thân thiết'}</span>
            <h1>☕ Quản Lý Quán Cafe</h1>
            <p>
              {isAdmin
                ? 'Theo dõi hoạt động, tối ưu quy trình phục vụ và đưa ra quyết định nhanh chóng.'
                : 'Đặt bàn, chọn món và thanh toán online chỉ với vài thao tác đơn giản.'}
            </p>
            <div className="home-hero__actions">
              <Link to={isAdmin ? '/admin/orders' : '/order-online'}>Bắt đầu ngay</Link>
              <Link to={isAdmin ? '/admin/reports' : '/menu'} className="secondary">
                {isAdmin ? 'Xem báo cáo' : 'Khám phá menu'}
              </Link>
            </div>
          </div>
          <div className="home-hero__stats">
            <div>
              <strong>{isAdmin ? '24+' : '200+'}</strong>
              <span>{isAdmin ? 'Báo cáo/Tháng' : 'Món được yêu thích'}</span>
            </div>
            <div>
              <strong>{isAdmin ? '8' : '4'}</strong>
              <span>{isAdmin ? 'Module chính' : 'Bước đặt món'}</span>
            </div>
            <div>
              <strong>{isAdmin ? '100%' : '5⭐'}</strong>
              <span>{isAdmin ? 'Kiểm soát real-time' : 'Trải nghiệm tiện lợi'}</span>
            </div>
          </div>
        </section>

        <section className="home-shortcuts">
          <div className="home-section-header">
            <div>
              <p>{isAdmin ? 'Danh mục quản trị' : 'Trải nghiệm khách hàng'}</p>
              <h2>{isAdmin ? 'Tất cả công cụ trong một nơi' : 'Chọn chức năng bạn cần'}</h2>
            </div>
            <span>{shortcuts.length} tính năng</span>
          </div>

          <div className="grid home-grid">
            {shortcuts.map((item) => (
              <Link key={item.to} to={item.to} className="card home-card">
                <div className="home-card__icon">{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Home;
