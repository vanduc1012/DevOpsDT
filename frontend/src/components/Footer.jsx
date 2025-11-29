import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-column">
            <h3 className="footer-heading">GIỚI THIỆU</h3>
            <ul className="footer-links">
              <li><Link to="/">Về Chúng Tôi</Link></li>
              <li><Link to="/menu">Sản phẩm</Link></li>
              <li><Link to="/admin/promotions">Khuyến mãi</Link></li>
              <li><Link to="/">Chuyện cà phê</Link></li>
              <li><Link to="/">Cửa Hàng</Link></li>
              <li><Link to="/">Tuyển dụng</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">ĐIỀU KHOẢN</h3>
            <ul className="footer-links">
              <li><Link to="/">Điều khoản sử dụng</Link></li>
              <li><Link to="/">Chính sách bảo mật thông tin</Link></li>
              <li><Link to="/">Hướng dẫn xuất hóa đơn GTGT</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <p className="footer-copyright">© 2025 QUẢN LÝ QUÁN CAFE</p>
            <p className="footer-info">
              VPGG: Tầng 6, Toà nhà Toyota, Số 315 Trường Chinh, P. Khương Mai, Q. Thanh Xuân, TP Hà Nội, Việt Nam
            </p>
            <p className="footer-info">Đặt hàng: 1800 6936</p>
            <p className="footer-info">Email: support@quancafe.vn</p>
          </div>

          <div className="footer-column footer-brand">
            <h2 className="footer-brand-name">QUẢN LÝ QUÁN CAFE</h2>
            <div className="footer-app-section">
              <p className="footer-app-label">DOWNLOAD APP</p>
              <p className="footer-app-name">QUẢN LÝ QUÁN CAFE APP</p>
              <div className="footer-qr-code">
                <div className="qr-placeholder">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="120" fill="white"/>
                    <rect x="10" y="10" width="20" height="20" fill="black"/>
                    <rect x="40" y="10" width="10" height="10" fill="black"/>
                    <rect x="60" y="10" width="10" height="10" fill="black"/>
                    <rect x="80" y="10" width="10" height="10" fill="black"/>
                    <rect x="90" y="10" width="20" height="20" fill="black"/>
                    <rect x="10" y="40" width="10" height="10" fill="black"/>
                    <rect x="30" y="40" width="10" height="10" fill="black"/>
                    <rect x="50" y="40" width="10" height="10" fill="black"/>
                    <rect x="70" y="40" width="10" height="10" fill="black"/>
                    <rect x="90" y="40" width="10" height="10" fill="black"/>
                    <rect x="10" y="60" width="10" height="10" fill="black"/>
                    <rect x="30" y="60" width="10" height="10" fill="black"/>
                    <rect x="50" y="60" width="10" height="10" fill="black"/>
                    <rect x="70" y="60" width="10" height="10" fill="black"/>
                    <rect x="90" y="60" width="10" height="10" fill="black"/>
                    <rect x="10" y="80" width="10" height="10" fill="black"/>
                    <rect x="30" y="80" width="10" height="10" fill="black"/>
                    <rect x="50" y="80" width="10" height="10" fill="black"/>
                    <rect x="70" y="80" width="10" height="10" fill="black"/>
                    <rect x="90" y="80" width="10" height="10" fill="black"/>
                    <rect x="10" y="90" width="20" height="20" fill="black"/>
                    <rect x="40" y="90" width="10" height="10" fill="black"/>
                    <rect x="60" y="90" width="10" height="10" fill="black"/>
                    <rect x="80" y="90" width="10" height="10" fill="black"/>
                    <rect x="90" y="90" width="20" height="20" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="footer-social-section">
              <p className="footer-social-label">FOLLOW US</p>
              <div className="footer-social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.013 3.693 9.153 8.505 9.876v-6.988H7.337V12h3.168V9.846c0-3.13 1.893-4.854 4.659-4.854 1.353 0 2.767.24 2.767.24v3.148h-1.558c-1.534 0-2.011.952-2.011 1.93V12h3.317l-.53 3.888h-2.787v6.988C18.307 21.153 22 17.013 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>Công ty cổ phần thương mại dịch vụ Trà Cà Phê VN</p>
          <p>Mã số DN: 0312867172 do sở kế hoạch và đầu tư tp. HCM cấp ngày 23/07/2014. Người đại diện: NGÔ NGUYÊN KHA</p>
          <p>Địa chỉ: 86-88 Cao Thắng, phường 04, quận 3, tp Hồ Chí Minh Điện thoại: (028) 7107 8079 Email: hi@thecoffeehouse.vn</p>
          <p>© 2014-2025 Công ty cổ phần thương mại dịch vụ Trà Cà Phê VN mọi quyền bảo lưu</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

