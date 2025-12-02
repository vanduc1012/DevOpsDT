import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/services';
import { useLanguage } from '../contexts/LanguageContext';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const { language, changeLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const navItems = isAdmin
    ? [
        { to: '/', labelKey: 'navigation.home' },
        { to: '/admin/menu', labelKey: 'navigation.menuManagement' },
        { to: '/admin/tables', labelKey: 'navigation.tableManagement' },
        { to: '/admin/orders', labelKey: 'navigation.orderManagement' },
        { to: '/admin/prices', labelKey: 'navigation.priceManagement' },
        { to: '/admin/promotions', labelKey: 'navigation.promotionManagement' },
        { to: '/admin/inventory', labelKey: 'navigation.inventoryManagement' },
        { to: '/admin/payment', labelKey: 'navigation.paymentManagement' },
        { to: '/admin/users', labelKey: 'navigation.userManagement' },
        { to: '/admin/reports', labelKey: 'navigation.reports' },
        { to: '/admin/reviews', labelKey: 'navigation.reviewManagement' },
        { to: '/profile', labelKey: 'navigation.profile' },
      ]
    : [
        { to: '/', labelKey: 'navigation.home' },
        { to: '/menu', labelKey: 'navigation.viewMenu' },
        { to: '/book-table', labelKey: 'navigation.bookTable' },
        { to: '/order-online', labelKey: 'navigation.orderOnline' },
        { to: '/my-orders', labelKey: 'navigation.myOrders' },
        { to: '/profile', labelKey: 'navigation.profile' },
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
            <h1>{t('header.title')}</h1>
            <p>{isAdmin ? t('header.adminDashboard') : t('header.customerExperience')}</p>
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`header-link ${isActive(item.to) ? 'active' : ''}`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {/* Language Selector */}
          <div style={{ position: 'relative', marginRight: '1rem' }}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              title={t('header.language')}
            >
              {language === 'vi-VN' ? '🇻🇳 VI' : '🇺🇸 EN'}
            </button>
            {showLanguageMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  minWidth: '120px'
                }}
              >
                <button
                  onClick={() => {
                    changeLanguage('vi-VN');
                    setShowLanguageMenu(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: language === 'vi-VN' ? '#f0f0f0' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  onClick={() => {
                    changeLanguage('en-US');
                    setShowLanguageMenu(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: language === 'en-US' ? '#f0f0f0' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    borderTop: '1px solid #eee'
                  }}
                >
                  🇺🇸 English
                </button>
              </div>
            )}
          </div>
          <div className="header-user">
            <span className="header-role">{isAdmin ? t('header.admin') : t('header.user')}</span>
            <span className="header-name">{user.fullName}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary header-logout">
            {t('common.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
