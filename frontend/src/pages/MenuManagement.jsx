import React, { useState, useEffect } from 'react';
import { menuService } from '../api/services';
import { useLanguage } from '../contexts/LanguageContext';

function MenuManagement() {
  const { t } = useLanguage();
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    available: true,
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await menuService.getAll();
      const items = response.data || [];
      setMenuItems(items);
      
      // Auto-fix product "123" after loading
      await autoFixProduct123(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  // Auto-fix product "123" to "Sữa chua" with image
  const autoFixProduct123 = async (items) => {
    try {
      console.log('🔍 Đang kiểm tra sản phẩm "123"...');
      console.log('📦 Tổng số sản phẩm:', items.length);
      
      const product123 = items.find(item => item.name === '123');
      console.log('🔎 Kết quả tìm kiếm:', product123 ? 'Tìm thấy' : 'Không tìm thấy');
      
      if (product123) {
        const itemId = product123._id || product123.id;
        console.log('🆔 ID sản phẩm:', itemId);
        console.log('📝 Tên hiện tại:', product123.name);
        console.log('🖼️ ImageUrl hiện tại:', product123.imageUrl);
        
        // Only update if name is still "123" or imageUrl is missing
        const needsUpdate = product123.name === '123' || !product123.imageUrl || product123.imageUrl.trim() === '';
        console.log('🔄 Cần cập nhật?', needsUpdate);
        
        if (needsUpdate) {
          console.log('⏳ Đang cập nhật sản phẩm...');
          const updateData = {
            name: 'Sữa chua',
            imageUrl: '/images/anhsuachua.jpg',
            description: product123.description || 'Sữa chua thơm ngon, bổ dưỡng',
            price: product123.price,
            category: product123.category || 'Sữa',
            available: product123.available !== undefined ? product123.available : true
          };
          console.log('📤 Dữ liệu cập nhật:', updateData);
          
          const response = await menuService.update(itemId, updateData);
          console.log('✅ Đã tự động cập nhật sản phẩm "123" thành "Sữa chua"');
          console.log('📥 Phản hồi từ server:', response.data);
          
          // Reload menu items after update
          setTimeout(() => {
            loadMenuItems();
          }, 500);
        } else {
          console.log('ℹ️ Sản phẩm đã được cập nhật rồi, không cần cập nhật lại');
        }
      } else {
        console.log('ℹ️ Không tìm thấy sản phẩm có tên "123"');
      }
    } catch (error) {
      console.error('❌ Lỗi khi tự động cập nhật sản phẩm 123:', error);
      console.error('📋 Chi tiết lỗi:', error.response?.data || error.message);
        alert(t('menu.saveError') + ': ' + (error.response?.data?.message || error.message));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const itemId = editingItem._id || editingItem.id;
        if (!itemId) {
          alert('Lỗi: Không tìm thấy ID của món. Vui lòng thử lại.');
          return;
        }
        await menuService.update(itemId, formData);
        alert(`✅ ${t('menu.updateSuccess')}`);
      } else {
        await menuService.create(formData);
        alert(`✅ ${t('menu.saveSuccess')}`);
      }
      setShowModal(false);
      resetForm();
      loadMenuItems();
    } catch (error) {
      alert(t('menu.saveError') + ': ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Lỗi: Không tìm thấy ID của món. Vui lòng thử lại.');
      return;
    }
    
    if (window.confirm(t('menu.deleteConfirm'))) {
      try {
        await menuService.delete(id);
        alert(`✅ ${t('menu.deleteSuccess')}`);
        loadMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert(t('menu.deleteError') + ': ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      available: true,
    });
    setEditingItem(null);
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('menu.menuManagement')}</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + {t('menu.addNewItem')}
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('menu.itemName')}</th>
                <th>{t('common.description')}</th>
                <th>{t('common.price')}</th>
                <th>{t('common.category')}</th>
                <th>{t('menu.reviews')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => {
                const itemId = item._id || item.id;
                return (
                  <tr key={itemId}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.price?.toLocaleString('vi-VN')} ₫</td>
                    <td>{item.category}</td>
                    <td>
                      {item.averageRating > 0 || item.totalReviews > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#ffc107', fontSize: '1rem' }}>
                            {'★'.repeat(Math.round(item.averageRating || 0))}
                            {'☆'.repeat(5 - Math.round(item.averageRating || 0))}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#666' }}>
                            {item.averageRating?.toFixed(1) || '0.0'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#999' }}>
                            ({item.totalReviews || 0})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.875rem' }}>{t('menu.noReviews')}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.available ? 'badge-available' : 'badge-cancelled'}`}>
                        {item.available ? t('common.inStock') : t('common.outOfStock')}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleEdit(item)} style={{ marginRight: '0.5rem' }}>
                        {t('common.edit')}
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(itemId)}>
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingItem ? t('menu.editItem') : t('menu.addNewItem')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('menu.itemName')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('common.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>{t('common.price')} *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('common.category')}</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="VD: Cà phê, Trà, Sinh tố"
                />
              </div>
              <div className="form-group">
                <label>{t('menu.imageUrl')}</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/anhsuachua.jpg"
                />
                {formData.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={
                        formData.imageUrl.startsWith('http://') || formData.imageUrl.startsWith('https://')
                          ? formData.imageUrl
                          : formData.imageUrl.startsWith('/')
                          ? formData.imageUrl
                          : `/images/${formData.imageUrl}`
                      }
                      alt="Preview"
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.error('Error loading image:', formData.imageUrl);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', formData.imageUrl);
                      }}
                    />
                  </div>
                )}
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  <strong>{t('menu.availableImages')}:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {['anhsuachua.jpg', 'anhbacxiu.jpg', 'anhbanhflan.jpg', 'anhbanhsungbocroissants.jpg', 'anhbanhtiramisu.jpg', 'anhcafedaxay.jpg', 'anhsinhtobo.jpg', 'anhsinhtodau.jpg', 'anhsinhtoxoai.jpg', 'anhtradao.jpg', 'anhtrachanh.jpg', 'anhtrasuatranchau.jpg', 'anhtraxanhkhongdo.jpg'].map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: `/images/${img}` })}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          background: formData.imageUrl === `/images/${img}` ? '#6f4e37' : '#f0f0f0',
                          color: formData.imageUrl === `/images/${img}` ? '#fff' : '#333',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {img.replace('.jpg', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  />
                  {' '}{t('common.inStock')}
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuManagement;

