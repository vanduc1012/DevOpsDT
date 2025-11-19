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
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  transferTable: (id, newTableId) => api.patch(`/api/orders/${id}/transfer-table`, { newTableId }),
};

export const reportService = {
  getDailyReport: (date) => {
    const params = date ? { date } : {};
    return api.get('/api/reports/daily', { params });
  },
  getTodayReport: () => api.get('/api/reports/today'),
  getMonthlyReport: (year, month) => {
    return api.get('/api/reports/monthly', { params: { year, month } });
  },
};
