import React, { useState, useEffect } from 'react';
import { menuService, orderService, promotionService } from '../api/services';
import { useNavigate } from 'react-router-dom';

function OrderOnline() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderType, setOrderType] = useState('PICKUP'); // PICKUP or DELIVERY
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    loadMenu();
    loadPromotions();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await menuService.getAvailable();
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
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

  const handleAddItem = (menuItem) => {
    const menuItemId = menuItem._id || menuItem.id;
    if (!menuItemId) return;
    
    const priceInfo = calculatePriceWithPromotion(menuItem);
    const finalPrice = priceInfo.finalPrice;
    
    const existing = selectedItems.find((item) => item.menuItemId === menuItemId);
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1, price: finalPrice, originalPrice: priceInfo.originalPrice }
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { 
          menuItemId: menuItemId, 
          quantity: 1, 
          name: menuItem.name, 
          price: finalPrice,
          originalPrice: priceInfo.originalPrice,
          promotion: priceInfo.promotion
        },
      ]);
    }
  };

  const handleRemoveItem = (menuItemId) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId, quantity) => {
    if (quantity < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return selectedItems.reduce((sum, item) => {
      const itemPrice = item.price || 0;
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const getTotalDiscount = () => {
    return selectedItems.reduce((sum, item) => {
      if (item.originalPrice && item.price) {
        const discountPerItem = item.originalPrice - item.price;
        return sum + discountPerItem * item.quantity;
      }
      return sum;
    }, 0);
  };

  const getDeliveryFee = () => {
    return orderType === 'DELIVERY' ? 20000 : 0; // 20k phí giao hàng
  };

  const getFinalTotal = () => {
    return getTotalAmount() + getDeliveryFee();
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một món');
      return;
    }

    if (orderType === 'DELIVERY') {
      if (!deliveryAddress.trim()) {
        alert('Vui lòng nhập địa chỉ giao hàng');
        return;
      }
      if (!deliveryPhone.trim()) {
        alert('Vui lòng nhập số điện thoại');
        return;
      }
    }

    try {
      const orderData = {
        orderType: orderType,
        items: selectedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: '',
        })),
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
        deliveryPhone: orderType === 'DELIVERY' ? deliveryPhone : undefined,
        deliveryFee: getDeliveryFee(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'PENDING'
      };

      const response = await orderService.createOnline(orderData);
      
      if (paymentMethod === 'ONLINE') {
        // Redirect to payment page
        navigate(`/payment/${response.data._id || response.data.id}`);
      } else {
        alert('Đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.');
        setSelectedItems([]);
        setShowCheckout(false);
        navigate('/my-orders');
      }
    } catch (error) {
      alert('Lỗi khi đặt hàng: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>🛒 Đặt Món Online</h2>

        {/* Order Type Selection */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${orderType === 'PICKUP' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setOrderType('PICKUP');
              setDeliveryAddress('');
              setDeliveryPhone('');
            }}
          >
            📦 Đặt mang đi (Pickup)
          </button>
          <button
            className={`btn ${orderType === 'DELIVERY' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setOrderType('DELIVERY')}
          >
            🚚 Giao hàng (Delivery)
          </button>
        </div>

        {/* Delivery Info */}
        {orderType === 'DELIVERY' && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
            <h3>Thông tin giao hàng</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>Địa chỉ giao hàng *</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Nhập địa chỉ giao hàng"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
            </div>
            <div>
              <label>Số điện thoại *</label>
              <input
                type="tel"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Menu Items */}
          <div>
            <h3>Menu</h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {menuItems.map((item) => {
                const itemId = item._id || item.id;
                const priceInfo = calculatePriceWithPromotion(item);
                const hasPromotion = priceInfo.promotion !== null;

                return (
                  <div
                    key={itemId}
                    style={{
                      padding: '1rem',
                      border: hasPromotion ? '2px solid #ffc107' : '1px solid #ddd',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      background: hasPromotion ? '#fff9e6' : 'white',
                    }}
                    onClick={() => handleAddItem(item)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ color: '#666', fontSize: '0.875rem' }}>{item.description}</div>
                        {hasPromotion && (
                          <div style={{ fontSize: '0.75rem', color: '#856404', marginTop: '0.25rem', fontWeight: 'bold' }}>
                            🎉 Khuyến mãi
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {hasPromotion ? (
                          <>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.875rem' }}>
                              {priceInfo.originalPrice?.toLocaleString('vi-VN')} ₫
                            </div>
                            <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                              {priceInfo.finalPrice?.toLocaleString('vi-VN')} ₫
                            </div>
                          </>
                        ) : (
                          <div style={{ color: '#6f4e37', fontWeight: 'bold' }}>
                            {priceInfo.originalPrice?.toLocaleString('vi-VN')} ₫
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div>
            <h3>Giỏ hàng ({selectedItems.length})</h3>
            {selectedItems.length === 0 ? (
              <p style={{ color: '#666' }}>Chưa có món nào</p>
            ) : (
              <>
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {selectedItems.map((item) => (
                    <div
                      key={item.menuItemId}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      {item.originalPrice && item.originalPrice !== item.price && (
                        <div style={{ fontSize: '0.875rem', color: '#999' }}>
                          Giá gốc: {item.originalPrice?.toLocaleString('vi-VN')} ₫
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            +
                          </button>
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>
                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </div>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleRemoveItem(item.menuItemId)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', marginBottom: '1rem' }}>
                  {getTotalDiscount() > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#666' }}>
                        <span>Tổng tiền gốc:</span>
                        <span style={{ textDecoration: 'line-through' }}>
                          {(getTotalAmount() + getTotalDiscount()).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#d32f2f', fontWeight: 'bold' }}>
                        <span>Tiết kiệm:</span>
                        <span>-{getTotalDiscount().toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Tạm tính:</span>
                    <span>{getTotalAmount().toLocaleString('vi-VN')} ₫</span>
                  </div>
                  {orderType === 'DELIVERY' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Phí giao hàng:</span>
                      <span>{getDeliveryFee().toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                    <span>Tổng cộng:</span>
                    <span style={{ color: '#6f4e37' }}>{getFinalTotal().toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCheckout(true)}
                    style={{ width: '100%' }}
                  >
                    Thanh toán
                  </button>
                ) : (
                  <div>
                    <h4>Phương thức thanh toán</h4>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="ONLINE">Thanh toán online</option>
                      <option value="CARD">Thẻ</option>
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowCheckout(false)}
                        style={{ flex: 1 }}
                      >
                        Hủy
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleCheckout}
                        style={{ flex: 1 }}
                      >
                        Xác nhận đặt hàng
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderOnline;

