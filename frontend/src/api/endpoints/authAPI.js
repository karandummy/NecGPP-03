import axiosInstance from '../axiosConfig';

export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  // Change Password (Protected)
  changePassword: async (passwords) => {
    const response = await axiosInstance.patch('/auth/change-password', passwords);
    return response.data;
  },

  // Forgot Password - Send OTP
  sendForgotPasswordOTP: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password with OTP
  resetPassword: async (resetData) => {
    const response = await axiosInstance.post('/auth/reset-password', resetData);
    return response.data;
  }
};