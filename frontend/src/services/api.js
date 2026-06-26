import axios from 'axios';

// Khởi tạo instance Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động đính kèm JWT Token vào Header trước khi gửi request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor tự động xử lý khi Token hết hạn hoặc không hợp lệ (401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Bỏ qua các endpoint xác thực (login, register, v.v.) để Auth.jsx tự xử lý lỗi hiển thị
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/');
      
      if (!isAuthEndpoint) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('opticontent_auth');
        sessionStorage.removeItem('opticontent_profile');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
