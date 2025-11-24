import React, { useState, useEffect } from 'react';
import { paymentConfigService } from '../api/services';
import { authService } from '../api/services';

function PaymentManagement() {
  const [configs, setConfigs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'QR_CODE',
    accountNumber: '',
    accountName: '',
    bankCode: '',
    bankName: '',
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    apiUrl: '',
    callbackUrl: '',
    returnUrl: '',
    description: '',
    active: true
  });
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAdmin()) {
      alert('Bạn không có quyền truy cập trang này.');
      window.location.href = '/';
      return;
    }
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await paymentConfigService.getAll();
      setConfigs(response.data);
    } catch (error) {
      console.error('Error loading payment configs:', error);
      alert('Lỗi khi tải danh sách cấu hình thanh toán');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      if (qrCodeImage) {
        submitData.append('qrCodeImage', qrCodeImage);
      }

      if (editingConfig) {
        await paymentConfigService.update(editingConfig._id, submitData);
      } else {
        await paymentConfigService.create(submitData);
      }

      setShowModal(false);
      resetForm();
      loadConfigs();
      alert(editingConfig ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
    } catch (error) {
      console.error('Error saving payment config:', error);
      alert(error.response?.data?.message || 'Lỗi khi lưu cấu hình thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name || '',
      type: config.type || 'QR_CODE',
      accountNumber: config.accountNumber || '',
      accountName: config.accountName || '',
      bankCode: config.bankCode || '',
      bankName: config.bankName || '',
      apiKey: config.apiKey || '',
      apiSecret: config.apiSecret || '',
      merchantId: config.merchantId || '',
      apiUrl: config.apiUrl || '',
      callbackUrl: config.callbackUrl || '',
      returnUrl: config.returnUrl || '',
      description: config.description || '',
      active: config.active !== undefined ? config.active : true
    });
    setImagePreview(config.qrCodeImage ? `http://localhost:8080${config.qrCodeImage}` : null);
    setQrCodeImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) {
      return;
    }

    try {
      await paymentConfigService.delete(id);
      loadConfigs();
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting payment config:', error);
      alert('Lỗi khi xóa cấu hình thanh toán');
    }
  };

  const handleToggle = async (id) => {
    try {
      await paymentConfigService.toggle(id);
      loadConfigs();
    } catch (error) {
      console.error('Error toggling payment config:', error);
      alert('Lỗi khi thay đổi trạng thái');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'QR_CODE',
      accountNumber: '',
      accountName: '',
      bankCode: '',
      bankName: '',
      apiKey: '',
      apiSecret: '',
      merchantId: '',
      apiUrl: '',
      callbackUrl: '',
      returnUrl: '',
      description: '',
      active: true
    });
    setQrCodeImage(null);
    setImagePreview(null);
    setEditingConfig(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Quản lý Thanh toán</h1>
        <button
          onClick={openModal}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#8B4513',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          + Thêm cấu hình thanh toán
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {configs.map(config => (
          <div
            key={config._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: config.active ? '#fff' : '#f5f5f5',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{config.name}</h3>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  backgroundColor: config.active ? '#4caf50' : '#9e9e9e',
                  color: 'white'
                }}
              >
                {config.active ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>

            <p style={{ margin: '0.5rem 0', color: '#666' }}>
              <strong>Loại:</strong> {
                config.type === 'QR_CODE' ? 'QR Code' :
                config.type === 'VNPAY' ? 'VNPay' :
                config.type === 'MOMO' ? 'MoMo' :
                config.type === 'ZALOPAY' ? 'ZaloPay' :
                config.type === 'BANK_TRANSFER' ? 'Chuyển khoản' : config.type
              }
            </p>

            {config.qrCodeImage && (
              <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                <img
                  src={`http://localhost:8080${config.qrCodeImage}`}
                  alt="QR Code"
                  style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            )}

            {config.accountNumber && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>STK:</strong> {config.accountNumber}
              </p>
            )}

            {config.bankName && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Ngân hàng:</strong> {config.bankName}
              </p>
            )}

            {config.description && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
                {config.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => handleEdit(config)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sửa
              </button>
              <button
                onClick={() => handleToggle(config._id)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: config.active ? '#FF9800' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {config.active ? 'Tắt' : 'Bật'}
              </button>
              <button
                onClick={() => handleDelete(config._id)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingConfig ? 'Sửa cấu hình thanh toán' : 'Thêm cấu hình thanh toán'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Tên cấu hình *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Loại thanh toán *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value="QR_CODE">QR Code (Hình ảnh)</option>
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                  <option value="VNPAY">VNPay</option>
                  <option value="MOMO">MoMo</option>
                  <option value="ZALOPAY">ZaloPay</option>
                </select>
              </div>

              {(formData.type === 'QR_CODE' || formData.type === 'BANK_TRANSFER') && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Hình ảnh QR Code</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '200px', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Số tài khoản</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Tên chủ tài khoản</label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Mã ngân hàng</label>
                    <input
                      type="text"
                      name="bankCode"
                      value={formData.bankCode}
                      onChange={handleInputChange}
                      placeholder="VD: VCB, TCB, VPB..."
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Tên ngân hàng</label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </>
              )}

              {(formData.type === 'VNPAY' || formData.type === 'MOMO' || formData.type === 'ZALOPAY') && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Merchant ID / Partner Code</label>
                    <input
                      type="text"
                      name="merchantId"
                      value={formData.merchantId}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>API Key</label>
                    <input
                      type="text"
                      name="apiKey"
                      value={formData.apiKey}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>API Secret / Hash Secret</label>
                    <input
                      type="password"
                      name="apiSecret"
                      value={formData.apiSecret}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>API URL</label>
                    <input
                      type="text"
                      name="apiUrl"
                      value={formData.apiUrl}
                      onChange={handleInputChange}
                      placeholder="https://sandbox.vnpayment.vn/..."
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Callback URL (Webhook)</label>
                    <input
                      type="text"
                      name="callbackUrl"
                      value={formData.callbackUrl}
                      onChange={handleInputChange}
                      placeholder="http://localhost:8080/api/orders/:id/payment-webhook"
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Return URL</label>
                    <input
                      type="text"
                      name="returnUrl"
                      value={formData.returnUrl}
                      onChange={handleInputChange}
                      placeholder="http://localhost:3000/payment/:id/callback"
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Kích hoạt
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#8B4513',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Đang lưu...' : (editingConfig ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentManagement;

