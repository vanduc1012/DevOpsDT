import api from './axios';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'ADMIN';
  },
};

export const menuService = {
  getAll: () => api.get('/api/menu'),
  getAvailable: () => api.get('/api/menu/available'),
  getById: (id) => api.get(`/api/menu/${id}`),
  create: (data) => api.post('/api/menu', data),
  update: (id, data) => api.put(`/api/menu/${id}`, data),
  delete: (id) => api.delete(`/api/menu/${id}`),
};

export const tableService = {
  getAll: () => api.get('/api/tables'),
  getAvailable: () => api.get('/api/tables/available'),
  getById: (id) => api.get(`/api/tables/${id}`),
  create: (data) => api.post('/api/tables', data),
  update: (id, data) => api.put(`/api/tables/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/tables/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/tables/${id}`),
};

export const orderService = {
  getAll: () => api.get('/api/orders'),
  getMyOrders: () => api.get('/api/orders/my-orders'),
  getByTable: (tableId) => api.get(`/api/orders/table/${tableId}`),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders', data),
  createOnline: (data) => api.post('/api/orders/online', data),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  transferTable: (id, newTableId) => api.patch(`/api/orders/${id}/transfer-table`, { newTableId }),
  processPayment: (orderId, paymentData) => api.post(`/api/orders/${orderId}/process-payment`, paymentData),
  getQRPayment: (orderId) => api.get(`/api/orders/${orderId}/qr-payment`),
  checkPaymentStatus: (orderId) => api.get(`/api/orders/${orderId}/payment-status`),
};

export const reportService = {
  getDailyReport: (date, includeOrders = true) => {
    const params = date ? { date, includeOrders } : { includeOrders };
    return api.get('/api/reports/daily', { params });
  },
  getTodayReport: () => api.get('/api/reports/today'),
  getMonthlyReport: (year, month, includeOrders = true) => {
    return api.get('/api/reports/monthly', { params: { year, month, includeOrders } });
  },
};

export const inventoryService = {
  getAll: () => api.get('/api/inventory'),
  getLowStock: () => api.get('/api/inventory/low-stock'),
  getById: (id) => api.get(`/api/inventory/${id}`),
  create: (data) => api.post('/api/inventory', data),
  update: (id, data) => api.put(`/api/inventory/${id}`, data),
  delete: (id) => api.delete(`/api/inventory/${id}`),
  importStock: (id, data) => api.post(`/api/inventory/${id}/import`, data),
  exportStock: (id, data) => api.post(`/api/inventory/${id}/export`, data),
  adjustStock: (id, data) => api.post(`/api/inventory/${id}/adjust`, data),
  getTransactions: () => api.get('/api/inventory/transactions'),
  getTransactionsByIngredient: (id) => api.get(`/api/inventory/${id}/transactions`),
};

export const reviewService = {
  getByMenuItem: (menuItemId, status = 'APPROVED') => {
    return api.get(`/api/reviews/menu/${menuItemId}`, { params: { status } });
  },
  getStats: (menuItemId) => {
    return api.get(`/api/reviews/menu/${menuItemId}/stats`);
  },
  getAll: (params = {}) => {
    return api.get('/api/reviews', { params });
  },
  create: (data) => api.post('/api/reviews', data),
  update: (id, data) => api.put(`/api/reviews/${id}`, data),
  delete: (id) => api.delete(`/api/reviews/${id}`),
  updateStatus: (id, status) => api.patch(`/api/reviews/${id}/status`, { status }),
};

export const priceService = {
  updatePrice: (menuItemId, data) => {
    console.log('Updating price for menu item:', menuItemId, 'with data:', data);
    return api.put(`/api/prices/menu/${menuItemId}`, data);
  },
  getHistory: () => api.get('/api/prices/history'),
  getHistoryByMenuItem: (id) => api.get(`/api/prices/history/menu/${id}`),
  test: () => api.get('/api/prices/test'),
};

export const promotionService = {
  getAll: () => api.get('/api/promotions'),
  getActive: () => api.get('/api/promotions/active'),
  getById: (id) => api.get(`/api/promotions/${id}`),
  create: (data) => api.post('/api/promotions', data),
  update: (id, data) => api.put(`/api/promotions/${id}`, data),
  delete: (id) => api.delete(`/api/promotions/${id}`),
  toggle: (id) => api.post(`/api/promotions/${id}/toggle`),
};

export const paymentConfigService = {
  getAll: () => api.get('/api/payment-config'),
  getActive: () => api.get('/api/payment-config/active'),
  getById: (id) => api.get(`/api/payment-config/${id}`),
  create: (formData) => api.post('/api/payment-config', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  update: (id, formData) => api.put(`/api/payment-config/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  delete: (id) => api.delete(`/api/payment-config/${id}`),
  toggle: (id) => api.post(`/api/payment-config/${id}/toggle`),
};

export const userService = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  getMe: () => api.get('/api/users/me'),
  updateRole: (id, role) => api.patch(`/api/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/api/users/${id}`),
};