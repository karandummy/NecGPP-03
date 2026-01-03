// src/api/endpoints/departmentsAPI.js
import axiosInstance from '../axiosConfig';

export const departmentsAPI = {
  // Get all departments (for dropdowns in create subject, manage members)
  getDepartments: async () => {
    const response = await axiosInstance.get('/users/departments');
    return response.data;
  }
};