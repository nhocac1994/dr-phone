import axios from 'axios';

// Log API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
    
    // Chỉ thêm prefix /api nếu URL không bắt đầu bằng http và chưa có /api
    if (!config.url.startsWith('http') && !config.url.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }
    
    // Tự động điều chỉnh Content-Type cho FormData
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      console.log('Detected FormData, setting Content-Type to multipart/form-data');
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // Log response
    console.log('Response:', response.status, response.data);
    return response.data;
  },
  (error) => {
    // Log error
    console.error('Response Error:', error);
    
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