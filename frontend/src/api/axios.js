import axios from 'axios';

// Trong Docker, gọi API qua nginx proxy
// Ngoài Docker, gọi trực tiếp backend
// Force localhost for development - OVERRIDE any env variable
const API_URL = 'http://localhost:8080';

// Log để đảm bảo dùng đúng URL
console.log('%c🔧 API URL:', 'color: blue; font-weight: bold; font-size: 14px', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API URL for debugging
console.log('API Base URL:', API_URL);
console.log('%c⚠️ Note: "runtime.lastError" warnings are from browser extensions, not our code. You can ignore them.', 'color: orange; font-weight: bold');

// Test API connection on startup
api.get('/api/health')
  .then(response => {
    console.log('✅ Backend connection successful:', response.data);
  })
  .catch(error => {
    console.error('❌ Backend connection failed:', error.message);
    if (error.request) {
      console.error('⚠️ Cannot connect to backend. Please check:');
      console.error('   1. Backend is running on', API_URL);
      console.error('   2. Open', API_URL + '/api/health', 'in browser to verify');
      console.error('   3. Check CORS configuration if frontend is on different origin');
      console.error('   4. Check firewall/network settings');
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        request: error.request
      });
    } else if (error.response) {
      console.error('Backend responded with error:', error.response.status, error.response.data);
    }
  });

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token found, adding to request header');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    // Log request for debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log('API Response:', {
      status: response.status,
      url: response.config?.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error for debugging
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Network Error:', {
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.',
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }

    // Handle authorization errors
    if (error.response) {
      const status = error.response.status;
      const isAuthEndpoint = error.config?.url?.includes('/api/auth');

      if (status === 401 && !isAuthEndpoint) {
        console.warn('⚠️ Authentication error (401). Redirecting to login.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      } else if (status === 403 && !isAuthEndpoint) {
        console.warn('⚠️ Permission denied (403). Staying on current page.');
        // Không logout, chỉ thông báo
      }
    }
    return Promise.reject(error);
  }
);

export default api;
