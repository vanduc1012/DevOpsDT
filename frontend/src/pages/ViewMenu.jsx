import React, { useState, useEffect } from 'react';
import { menuService, promotionService } from '../api/services';
import ReviewSection from '../components/ReviewSection';

function ViewMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadMenu();
    loadPromotions();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await menuService.getAvailable();
      const items = response.data || [];
      setMenuItems(items);
      if (items.length === 0) {
        console.warn('No menu items found. Make sure menu items are created and marked as available.');
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      alert('Lỗi khi tải menu. Vui lòng thử lại.');
    }
  };

  const loadPromotions = async () => {
    try {
      const response = await promotionService.getActive();
      setPromotions(response.data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  // Tính giá sau khi áp dụng promotion
  const calculatePriceWithPromotion = (menuItem) => {
    const menuItemId = menuItem._id || menuItem.id;
    const originalPrice = menuItem.price || 0;
    
    const applicablePromotion = promotions.find(promo => {
      if (!promo.active) return false;
      const now = new Date();
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      if (now < startDate || now > endDate) return false;
      
      if (promo.menuItemId) {
        let promoMenuItemId = promo.menuItemId;
        if (typeof promoMenuItemId === 'object') {
          promoMenuItemId = promoMenuItemId._id || promoMenuItemId.id || promoMenuItemId;
        }
        const promoIdStr = promoMenuItemId?.toString() || '';
        const menuIdStr = menuItemId?.toString() || '';
        return promoIdStr === menuIdStr;
      }
      return true;
    });

    if (!applicablePromotion) {
      return { originalPrice, finalPrice: originalPrice, discount: 0, promotion: null };
    }

    let finalPrice = originalPrice;
    let discount = 0;

    switch (applicablePromotion.type) {
      case 'PERCENTAGE':
        discount = (originalPrice * applicablePromotion.discountValue) / 100;
        finalPrice = originalPrice - discount;
        break;
      case 'FIXED_AMOUNT':
        discount = applicablePromotion.discountValue;
        finalPrice = Math.max(0, originalPrice - discount);
        break;
      case 'BUY_ONE_GET_ONE':
        discount = originalPrice * 0.5;
        finalPrice = originalPrice - discount;
        break;
      default:
        finalPrice = originalPrice;
    }

    return { originalPrice, finalPrice, discount, promotion: applicablePromotion };
  };

  const formatPromotionText = (promotion) => {
    if (!promotion) return '';
    switch (promotion.type) {
      case 'PERCENTAGE':
        return `Giảm ${promotion.discountValue}%`;
      case 'FIXED_AMOUNT':
        return `Giảm ${promotion.discountValue?.toLocaleString('vi-VN')} ₫`;
      case 'BUY_ONE_GET_ONE':
        return 'Mua 1 tặng 1';
      default:
        return 'Khuyến mãi';
    }
  };

  // Normalize Vietnamese text (remove diacritics) for better search
  const normalizeVietnamese = (str) => {
    if (!str) return '';
    try {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
    } catch (e) {
      // Fallback if normalize fails
      return str.toLowerCase().trim();
    }
  };

  const filteredItems = menuItems.filter(item => {
    // Filter by category
    const matchesFilter = filter === 'all' || (item.category && item.category === filter);
    
    // Filter by search term (only if searchTerm is not empty)
    if (!searchTerm || searchTerm.trim() === '') {
      return matchesFilter;
    }
    
    const searchNormalized = normalizeVietnamese(searchTerm);
    const nameNormalized = normalizeVietnamese(item.name || '');
    const descNormalized = normalizeVietnamese(item.description || '');
    const categoryNormalized = normalizeVietnamese(item.category || '');
    
    const nameMatch = nameNormalized.includes(searchNormalized);
    const descMatch = descNormalized.includes(searchNormalized);
    const categoryMatch = categoryNormalized.includes(searchNormalized);
    
    const matchesSearch = nameMatch || descMatch || categoryMatch;
    
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category).filter(Boolean))];

  return (
    <div className="container">
      <div className="card">
        <h2>📋 Menu Quán Cafe</h2>

        {/* Promotions Banner */}
        {promotions.length > 0 && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)', 
            borderRadius: '8px',
            color: 'white'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🎉 Khuyến mãi đang diễn ra:</h3>
            {promotions.map((promo) => {
              const promoId = promo._id || promo.id;
              return (
                <div key={promoId} style={{ marginBottom: '0.25rem' }}>
                  • <strong>{promo.name}</strong>: {promo.description || formatPromotionText(promo)}
                </div>
              );
            })}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm món (tên, mô tả, danh mục)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: searchTerm ? '2.5rem' : '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: '#999',
                    padding: '0.25rem'
                  }}
                  title="Xóa tìm kiếm"
                >
                  ×
                </button>
              )}
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '200px'
              }}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.filter(cat => cat !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {(searchTerm || filter !== 'all') && (
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              Tìm thấy <strong>{filteredItems.length}</strong> món
              {searchTerm && ` cho "${searchTerm}"`}
              {filter !== 'all' && ` trong danh mục "${filter}"`}
            </div>
          )}
        </div>

        {/* Menu Items Grid */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredItems.map((item) => {
            const itemId = item._id || item.id;
            const priceInfo = calculatePriceWithPromotion(item);
            const hasPromotion = priceInfo.promotion !== null;

            return (
              <div
                key={itemId}
                style={{
                  padding: '1.5rem',
                  border: hasPromotion ? '2px solid #ffc107' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: hasPromotion ? '#fff9e6' : 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={() => setSelectedItem(item)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem', color: '#6f4e37' }}>
                  {item.name}
                </div>
                {item.category && (
                  <div style={{ fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                    📁 {item.category}
                  </div>
                )}
                {(item.averageRating > 0 || item.totalReviews > 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: '#ffc107' }}>
                      {'★'.repeat(Math.round(item.averageRating || 0))}
                      {'☆'.repeat(5 - Math.round(item.averageRating || 0))}
                    </span>
                    <span style={{ color: '#666' }}>
                      {item.averageRating?.toFixed(1) || '0.0'} ({item.totalReviews || 0})
                    </span>
                  </div>
                )}
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '40px' }}>
                  {item.description || 'Không có mô tả'}
                </div>
                {hasPromotion && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#856404', 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    padding: '0.25rem 0.5rem',
                    background: '#ffc107',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    🎉 {formatPromotionText(priceInfo.promotion)}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {hasPromotion ? (
                    <div>
                      <div style={{ 
                        textDecoration: 'line-through', 
                        color: '#999', 
                        fontSize: '0.875rem' 
                      }}>
                        {priceInfo.originalPrice?.toLocaleString('vi-VN')} ₫
                      </div>
                      <div style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '1.25rem' }}>
                        {priceInfo.finalPrice?.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#6f4e37', fontWeight: 'bold', fontSize: '1.25rem' }}>
                      {priceInfo.originalPrice?.toLocaleString('vi-VN')} ₫
                    </div>
                  )}
                  {item.available !== false && (
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      background: '#28a745', 
                      color: 'white', 
                      borderRadius: '12px',
                      fontSize: '0.875rem'
                    }}>
                      Còn hàng
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>Không tìm thấy món nào phù hợp</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#6f4e37' }}>{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.25rem 0.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              {selectedItem.category && (
                <div style={{ fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                  📁 {selectedItem.category}
                </div>
              )}
              <div style={{ color: '#666', marginBottom: '1rem' }}>
                {selectedItem.description || 'Không có mô tả'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6f4e37' }}>
                {selectedItem.price?.toLocaleString('vi-VN')} ₫
              </div>
            </div>

            <ReviewSection menuItemId={selectedItem._id || selectedItem.id} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewMenu;

