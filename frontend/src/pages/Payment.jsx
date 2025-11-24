import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { orderService, paymentConfigService } from '../api/services';

function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, QR, or EXTERNAL
  const [qrData, setQrData] = useState(null);
  const [paymentConfigs, setPaymentConfigs] = useState([]);
  const [selectedPaymentConfig, setSelectedPaymentConfig] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    // Check for payment callback
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'true') {
      alert('Thanh toán thành công!');
      navigate('/my-orders');
      return;
    }
    
    if (error) {
      alert(`Lỗi thanh toán: ${error}`);
    }
    
    loadOrder();
    loadPaymentConfigs();
    return () => {
      // Cleanup polling on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [orderId, searchParams, navigate]);

  useEffect(() => {
    if (paymentMethod === 'QR' && order && !qrData) {
      loadQRData();
    }
  }, [paymentMethod, order]);

  useEffect(() => {
    if (polling && orderId) {
      // Start polling for payment status
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await orderService.checkPaymentStatus(orderId);
          if (response.data.paymentStatus === 'PAID') {
            setPolling(false);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            alert('Thanh toán thành công!');
            navigate('/my-orders');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 3000); // Check every 3 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [polling, orderId, navigate]);

  const loadOrder = async () => {
    try {
      const response = await orderService.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Không tìm thấy đơn hàng');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentConfigs = async () => {
    try {
      const response = await paymentConfigService.getActive();
      setPaymentConfigs(response.data);
    } catch (error) {
      console.error('Error loading payment configs:', error);
    }
  };

  const loadQRData = async () => {
    try {
      const response = await orderService.getQRPayment(orderId);
      const data = response.data;
      setQrData(data);
      
      // If QR code is an image from database, start polling
      if (data.type === 'IMAGE' || data.qrCodeImage) {
        setPolling(true);
      }
    } catch (error) {
      console.error('Error loading QR data:', error);
      alert('Lỗi khi tạo mã QR. Vui lòng thử lại.');
    }
  };

  const handleExternalPayment = async (configId) => {
    try {
      setProcessing(true);
      const response = await orderService.processPayment(orderId, { paymentConfigId: configId });
      
      if (response.data.paymentUrl) {
        // Redirect to external payment gateway
        window.location.href = response.data.paymentUrl;
      } else {
        alert('Không thể tạo link thanh toán. Vui lòng thử lại.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error processing external payment:', error);
      alert(error.response?.data?.message || 'Lỗi khi xử lý thanh toán');
      setProcessing(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentData = {
        paymentMethod: 'ONLINE',
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardName: cardName,
        expiryDate: expiryDate,
        cvv: cvv
      };

      await orderService.processPayment(orderId, paymentData);
      alert('Thanh toán thành công!');
      navigate('/my-orders');
    } catch (error) {
      alert('Thanh toán thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Generate QR code string for display
  const generateQRString = () => {
    if (!qrData) return '';
    
    // Prefer simple QR string (more compatible with banking apps)
    if (qrData.simpleQRString) {
      return qrData.simpleQRString;
    }
    
    // Use VietQR string from backend
    if (qrData.qrString) {
      return qrData.qrString;
    }
    
    // Fallback: Create simple QR with bank transfer info
    const totalAmount = order.totalAmount + (order.deliveryFee || 0);
    return JSON.stringify({
      type: 'bank_transfer',
      account: qrData.accountNumber,
      name: qrData.accountName,
      bank: qrData.bankName || qrData.bankCode,
      amount: totalAmount,
      content: qrData.description
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const totalAmount = order.totalAmount + (order.deliveryFee || 0);

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>💳 Thanh Toán Online</h2>

        <div style={{ marginBottom: '2rem' }}>
          <h3>Thông tin đơn hàng</h3>
          <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
            <p><strong>Mã đơn:</strong> #{order._id?.toString().slice(-6) || order.id?.toString().slice(-6)}</p>
            <p><strong>Loại đơn:</strong> {order.orderType === 'DELIVERY' ? 'Giao hàng' : order.orderType === 'PICKUP' ? 'Mang đi' : 'Tại quán'}</p>
            {order.deliveryAddress && (
              <p><strong>Địa chỉ:</strong> {order.deliveryAddress}</p>
            )}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Tạm tính:</span>
                <span>{order.totalAmount?.toLocaleString('vi-VN')} ₫</span>
              </div>
              {order.deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Phí giao hàng:</span>
                  <span>{order.deliveryFee?.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#6f4e37', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                <span>Tổng thanh toán:</span>
                <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Chọn phương thức thanh toán</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPaymentMethod('CARD')}
              style={{ flex: '1 1 150px' }}
            >
              💳 Thẻ
            </button>
            <button
              type="button"
              className={`btn ${paymentMethod === 'QR' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPaymentMethod('QR')}
              style={{ flex: '1 1 150px' }}
            >
              📱 QR Code
            </button>
          </div>
          
          {/* External Payment Gateways */}
          {paymentConfigs.filter(c => c.type === 'VNPAY' || c.type === 'MOMO' || c.type === 'ZALOPAY').length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Thanh toán qua cổng thanh toán:</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {paymentConfigs
                  .filter(c => c.type === 'VNPAY' || c.type === 'MOMO' || c.type === 'ZALOPAY')
                  .map(config => (
                    <button
                      key={config._id}
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleExternalPayment(config._id)}
                      disabled={processing}
                      style={{
                        flex: '1 1 150px',
                        backgroundColor: config.type === 'VNPAY' ? '#1ba0e2' : config.type === 'MOMO' ? '#a50064' : '#0068ff',
                        opacity: processing ? 0.6 : 1
                      }}
                    >
                      {config.type === 'VNPAY' ? '💳 VNPay' : config.type === 'MOMO' ? '💜 MoMo' : '💙 ZaloPay'}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* QR Code Payment */}
        {paymentMethod === 'QR' && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {qrData ? (
              <>
                {qrData.type === 'IMAGE' && qrData.qrCodeImage ? (
                  // Display uploaded QR code image
                  <div style={{ 
                    padding: '2rem', 
                    background: 'white', 
                    borderRadius: '8px',
                    border: '2px solid #6f4e37',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>
                    <img
                      src={`http://localhost:8080${qrData.qrCodeImage}`}
                      alt="QR Code"
                      style={{ maxWidth: '256px', maxHeight: '256px' }}
                    />
                  </div>
                ) : (
                  // Generate QR code dynamically
                  <div style={{ 
                    padding: '2rem', 
                    background: 'white', 
                    borderRadius: '8px',
                    border: '2px solid #6f4e37',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>
                    <QRCodeSVG 
                      value={generateQRString()}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                )}
                {(qrData.accountNumber || qrData.accountName || qrData.bankName) && (
                  <div style={{ 
                    padding: '1rem', 
                    background: '#e7f3ff', 
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    textAlign: 'left'
                  }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Thông tin chuyển khoản:</h4>
                    {qrData.accountNumber && <p><strong>Số tài khoản:</strong> {qrData.accountNumber}</p>}
                    {qrData.accountName && <p><strong>Chủ tài khoản:</strong> {qrData.accountName}</p>}
                    {(qrData.bankName || qrData.bankCode) && (
                      <p><strong>Ngân hàng:</strong> {qrData.bankName || (qrData.bankCode === 'VCB' ? 'Vietcombank' : qrData.bankCode)}</p>
                    )}
                    <p><strong>Số tiền:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '1.25rem' }}>{totalAmount.toLocaleString('vi-VN')} ₫</span></p>
                    {qrData.description && <p><strong>Nội dung:</strong> {qrData.description}</p>}
                  </div>
                )}
                <div style={{ 
                  padding: '1rem', 
                  background: '#fff3cd', 
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#856404'
                }}>
                  <p style={{ marginBottom: '0.5rem' }}>📱 <strong>Hướng dẫn:</strong></p>
                  <ol style={{ textAlign: 'left', marginLeft: '1.5rem' }}>
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Chọn chức năng "Quét QR" hoặc "Chuyển khoản"</li>
                    <li>Quét mã QR ở trên</li>
                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                    <li>Hệ thống sẽ tự động cập nhật trạng thái thanh toán</li>
                  </ol>
                </div>
                {polling && (
                  <div style={{ 
                    padding: '1rem', 
                    background: '#d4edda', 
                    borderRadius: '4px',
                    color: '#155724',
                    marginBottom: '1rem'
                  }}>
                    <p>⏳ Đang chờ thanh toán... Hệ thống sẽ tự động cập nhật khi nhận được thanh toán.</p>
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/my-orders')}
                  style={{ width: '100%' }}
                >
                  Hủy
                </button>
              </>
            ) : (
              <div>
                <p>Đang tạo mã QR...</p>
              </div>
            )}
          </div>
        )}

        {/* Card Payment */}
        {paymentMethod === 'CARD' && (
          <form onSubmit={handlePayment}>
            <h3>Thông tin thẻ</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Số thẻ *</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Tên chủ thẻ *</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN A"
                required
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Ngày hết hạn *</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setExpiryDate(value);
                  }}
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                />
              </div>
              <div>
                <label>CVV *</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                  placeholder="123"
                  maxLength="3"
                  required
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: '#fff3cd', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#856404'
            }}>
              ⚠️ Đây là môi trường demo. Thanh toán sẽ được mô phỏng và luôn thành công.
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/my-orders')}
                style={{ flex: 1 }}
                disabled={processing}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={processing}
              >
                {processing ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Payment;
