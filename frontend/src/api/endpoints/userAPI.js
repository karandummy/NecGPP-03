import axiosInstance from '../axiosConfig';

export const userAPI = {
  // Get basic profile (for dashboard)
  getBasicProfile: async () => {
    const response = await axiosInstance.get('/users/me/basic');
    return response.data;
  },

  // Get complete profile
  getCompleteProfile: async () => {
    const response = await axiosInstance.get('/users/me/complete');
    return response.data;
  },

  getDepartments: async () => {
    const response = await axiosInstance.get('/users/departments');
    return response.data;
  }
};