// src/api/endpoints/subjectMemberAPI.js
import axiosInstance from '../axiosConfig';

export const subjectMemberAPI = {
  // Get subject members (departments with access)
  getSubjectMembers: async (subjectId) => {
    const response = await axiosInstance.get(`/subjects/${subjectId}/members`);
    return response.data;
  },

  // Request access to subject (Dept Head only)
  requestAccess: async (subjectId) => {
    const response = await axiosInstance.post(`/subjects/${subjectId}/members/request-access`);
    return response.data;
  },

  // Add department to subject
  addMember: async (subjectId, deptId, options = {}) => {
    const response = await axiosInstance.post(`/subjects/${subjectId}/members/${deptId}`, options);
    return response.data;
  },

  // Remove department from subject
  removeMember: async (subjectId, deptId, options = {}) => {
    const response = await axiosInstance.delete(`/subjects/${subjectId}/members/${deptId}`, {
      data: options
    });
    return response.data;
  },

  // Leave subject (Dept Head only)
  leaveSubject: async (subjectId) => {
    const response = await axiosInstance.post(`/subjects/${subjectId}/members/leave`);
    return response.data;
  }
};