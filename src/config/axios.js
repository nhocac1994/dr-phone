import axios from 'axios';

// Log API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Tạo instance axios với URL cơ sở
const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Chỉ log request quan trọng
    if (config.url !== '/api/orders' || config.method !== 'get') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Tự động điều chỉnh Content-Type cho FormData
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // Chỉ log response quan trọng
    if (response.config.url !== '/api/orders' || response.config.method !== 'get') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    
    // Trả về dữ liệu thực tế
    return response.data;
  },
  (error) => {
    // Log error
    console.error('[API Response Error]', error.response?.status, error.response?.data || error.message);
    
    if (error.response) {
      // Nếu token hết hạn hoặc không hợp lệ
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message || 'Network error');
  }
);

export default instance; 