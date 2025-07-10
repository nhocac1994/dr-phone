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
    // Log request
    console.log('Request:', config.method.toUpperCase(), config.url, config.data);
    
    // Tự động điều chỉnh Content-Type cho FormData
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      console.log('Detected FormData, setting Content-Type to multipart/form-data');
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    // Log response
    console.log('Response:', response.status, response.data);
    
    // Kiểm tra dữ liệu trả về
    if (Array.isArray(response.data)) {
      console.log('Response data is array with length:', response.data.length);
    } else if (response.data && typeof response.data === 'object') {
      console.log('Response data is object with keys:', Object.keys(response.data));
    } else {
      console.log('Response data type:', typeof response.data);
    }
    
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    console.log('[API Response Data]', response.data);
    
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
    return Promise.reject(error);
  }
);

export default instance; 