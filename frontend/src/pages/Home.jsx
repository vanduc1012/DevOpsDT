import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, blogService } from '../api/services';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from '../components/Footer';
import HeroSlider from '../components/HeroSlider';
import blogPosts from '../data/blogPosts';

function Home() {
  const isAdmin = authService.isAdmin();
  const { t } = useLanguage();
  const [articles, setArticles] = useState(blogPosts);

  useEffect(() => {
    let mounted = true;
    const fetchBlogs = async () => {
      try {
        const res = await blogService.listPublic({ limit: 3 });
        if (mounted && res.data && res.data.length) {
          const mapped = res.data.map((item) => ({
            slug: item.slug,
            icon: '📰',
            title: item.title,
            desc: item.summary || (item.content && item.content[0]) || '',
            coverImage: item.coverImage,
          }));
          setArticles(mapped);
        }
      } catch (error) {
        console.warn('Use fallback blog articles', error?.message || error);
      }
    };
    fetchBlogs();
    return () => { mounted = false; };
  }, []);

  const userShortcuts = [
    { to: '/menu', icon: '📋', titleKey: 'home.viewMenu', descKey: 'home.viewMenuDesc' },
    { to: '/book-table', icon: '🍽️', titleKey: 'home.bookTable', descKey: 'home.bookTableDesc' },
    { to: '/order-online', icon: '🛒', titleKey: 'home.orderOnline', descKey: 'home.orderOnlineDesc' },
    { to: '/my-orders', icon: '📦', titleKey: 'home.myOrders', descKey: 'home.myOrdersDesc' },
  ];

  const adminShortcuts = [
    { to: '/admin/menu', icon: '📋', titleKey: 'home.menuManagement', descKey: 'home.menuManagementDesc' },
    { to: '/admin/tables', icon: '🪑', titleKey: 'home.tableManagement', descKey: 'home.tableManagementDesc' },
    { to: '/admin/orders', icon: '📦', titleKey: 'home.orderManagement', descKey: 'home.orderManagementDesc' },
    { to: '/admin/prices', icon: '💰', titleKey: 'home.priceManagement', descKey: 'home.priceManagementDesc' },
    { to: '/admin/promotions', icon: '🎁', titleKey: 'home.promotionManagement', descKey: 'home.promotionManagementDesc' },
    { to: '/admin/inventory', icon: '📦', titleKey: 'home.inventoryManagement', descKey: 'home.inventoryManagementDesc' },
    { to: '/admin/payment', icon: '💳', titleKey: 'home.paymentManagement', descKey: 'home.paymentManagementDesc' },
    { to: '/admin/users', icon: '👥', titleKey: 'home.userManagement', descKey: 'home.userManagementDesc' },
    { to: '/admin/reports', icon: '📊', titleKey: 'home.reports', descKey: 'home.reportsDesc' },
    { to: '/admin/reviews', icon: '⭐', titleKey: 'home.reviewManagement', descKey: 'home.reviewManagementDesc' },
    { to: '/admin/blogs', icon: '📝', titleKey: 'home.blogManagement', descKey: 'home.blogManagementDesc' },
  ];

  const shortcuts = isAdmin ? adminShortcuts : userShortcuts;

  return (
    <>
    <div className="container home-layout">
        {/* Hero giới thiệu chính ở phía trên */}
      <section className="home-hero card">
        <div>
            <span className="home-hero__badge">{isAdmin ? t('home.adminBadge') : t('home.customerBadge')}</span>
            <h1>{t('home.title')}</h1>
          <p>
              {isAdmin ? t('home.adminDescription') : t('home.customerDescription')}
          </p>
          <div className="home-hero__actions">
              <Link to={isAdmin ? '/admin/orders' : '/order-online'}>{t('home.getStarted')}</Link>
            <Link to={isAdmin ? '/admin/reports' : '/menu'} className="secondary">
                {isAdmin ? t('home.viewReports') : t('home.exploreMenu')}
            </Link>
          </div>
        </div>
        <div className="home-hero__stats">
          <div>
            <strong>{isAdmin ? '24+' : '200+'}</strong>
              <span>{isAdmin ? t('home.adminStats.reportsPerMonth') : t('home.customerStats.favoriteItems')}</span>
          </div>
          <div>
            <strong>{isAdmin ? '8' : '4'}</strong>
              <span>{isAdmin ? t('home.adminStats.mainModules') : t('home.customerStats.orderSteps')}</span>
          </div>
          <div>
            <strong>{isAdmin ? '100%' : '5⭐'}</strong>
              <span>{isAdmin ? t('home.adminStats.realtimeControl') : t('home.customerStats.convenientExperience')}</span>
          </div>
        </div>
      </section>

        {/* Khối chức năng (Xem Menu, Đặt Bàn, ...) nằm dưới hero */}
      <section className="home-shortcuts">
        <div className="home-section-header">
          <div>
              <p>{isAdmin ? t('home.adminCategory') : t('home.customerCategory')}</p>
              <h2>{isAdmin ? t('home.allToolsInOne') : t('home.chooseFunction')}</h2>
          </div>
            <span>{shortcuts.length} {t('home.features')}</span>
        </div>

        <div className="grid home-grid">
          {shortcuts.map((item) => (
            <Link key={item.to} to={item.to} className="card home-card">
              <div className="home-card__icon">{item.icon}</div>
              <div>
                  <h3>{t(item.titleKey)}</h3>
                  <p>{t(item.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

        {/* Hero image/slider now comes after text hero */}
        <HeroSlider />

        {/* Blog / News section */}
        <section className="home-blog card">
          <div className="home-section-header">
            <div>
              <p>{t('home.blogSubtitle')}</p>
              <h2>{t('home.blogTitle')}</h2>
            </div>
          </div>

          <div className="home-blog-grid">
            {articles.map((article) => {
              const title = article.titleKey ? t(article.titleKey) : article.title;
              const desc = article.descKey ? t(article.descKey) : article.desc;
              return (
                <Link key={article.slug} to={`/blog/${article.slug}`} className="card home-blog-card">
                  <div className="home-card__icon" style={{ fontSize: '1.75rem' }}>{article.icon || '📰'}</div>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
    </div>
      <Footer />
    </>
  );
}

export default Home;
