import axiosInstance from './axiosConfig';
import { storage } from '@utils/localStorage';
import { parseError } from '@utils/errorHandler';

// Request interceptor - Attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const parsedError = parseError(error);

    // Auto-logout on auth errors
    if (parsedError.shouldLogout) {
      storage.clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;