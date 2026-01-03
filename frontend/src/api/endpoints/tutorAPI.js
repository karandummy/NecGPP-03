// src/api/endpoints/tutorAPI.js
import axiosInstance from '../axiosConfig';

export const tutorAPI = {
  // Get all students assigned to current tutor
  getMyStudents: async () => {
    const response = await axiosInstance.get('/tutor/my-students');
    return response.data;
  },

  // Get unassigned students by batch and department
  getUnassignedStudents: async (batchYear, deptId) => {
    const response = await axiosInstance.get('/tutor/unassigned', {
      params: { batchYear, deptId }
    });
    return response.data;
  },

  // Assign single student to tutor
  assignStudent: async (studentId) => {
    const response = await axiosInstance.post(`/tutor/assign/${studentId}`);
    return response.data;
  },

  // Bulk assign students to tutor
  bulkAssignStudents: async (studentIds) => {
    const response = await axiosInstance.post('/tutor/assign/bulk', { studentIds });
    return response.data;
  },

  // Remove student from tutor
  removeStudent: async (studentId) => {
    const response = await axiosInstance.delete(`/tutor/remove/${studentId}`);
    return response.data;
  }
};