// src/api/endpoints/subjectAPI.js
import axiosInstance from '../axiosConfig';

export const subjectAPI = {
  // Get all subjects (mySubjects + otherSubjects for Dept Head)
  getSubjects: async () => {
    const response = await axiosInstance.get('/subjects');
    console.log('Fetched subjects:', response.data);
    return response.data;
  },

  // Create subject
  createSubject: async (data) => {
    const response = await axiosInstance.post('/subjects', data);
    return response.data;
  },

  // Update subject name
  updateSubjectName: async (subjectId, subjectName) => {
    const response = await axiosInstance.patch(`/subjects/${subjectId}/name`, {
      subject_name: subjectName
    });
    return response.data;
  },

  // Toggle subject lock
  toggleSubjectLock: async (subjectId, options = {}) => {
    const response = await axiosInstance.patch(`/subjects/${subjectId}/toggle-lock`, options);
    return response.data;
  },

  // Toggle dept subject lock (Dept Head only)
  toggleDeptSubjectLock: async (subjectId, options = {}) => {
    const response = await axiosInstance.patch(`/subjects/${subjectId}/dept-toggle-lock`, options);
    return response.data;
  },

  // Export subject
  exportSubject: async (subjectId, export_type = 'content') => {
    const response = await axiosInstance.get(`/subjects/${subjectId}/export`, {
      params: { export_type },
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete subject with backup
  deleteSubject: async (subjectId) => {
    const response = await axiosInstance.delete(`/subjects/${subjectId}/delete-with-backup`, {
      responseType: 'blob'
    });
    return response.data;
  }
};