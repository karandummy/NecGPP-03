// src/api/endpoints/setAPI.js
import axiosInstance from '../axiosConfig';

export const setAPI = {
  // Get levels by topic
  getLevelsByTopic: async (subjectId, topicId) => {
    const response = await axiosInstance.get(`/subjects/${subjectId}/topics/${topicId}/sets`);
    return response.data;
  },

  // Get sets by level
  getSetsByLevel: async (subjectId, topicId, level) => {
    const response = await axiosInstance.get(`/subjects/${subjectId}/topics/${topicId}/sets/${level}`);
    return response.data;
  },

  // Parse Excel questions (bulk upload)
  parseExcelQuestions: async (subjectId, topicId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(
      `/subjects/${subjectId}/topics/${topicId}/sets/parse-bulk`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  },

  // Create set with questions
  createSet: async (subjectId, topicId, data) => {
    const response = await axiosInstance.post(
      `/subjects/${subjectId}/topics/${topicId}/sets/new-set`,
      data
    );
    return response.data;
  },

  // Update question
  updateQuestion: async (subjectId, topicId, setId, questionData) => {
    const response = await axiosInstance.patch(
      `/subjects/${subjectId}/topics/${topicId}/sets/${setId}/questions`,
      questionData
    );
    return response.data;
  },

  // Export set
  exportSet: async (subjectId, topicId, setId, export_type = 'content') => {
    console.log(subjectId,export_type,topicId,setId)
    const response = await axiosInstance.get(
      `/subjects/${subjectId}/topics/${topicId}/sets/${setId}/export`,
      {
        params: { export_type },
        responseType: 'blob'
      }
    );
    return response.data;
  },

  // Delete set
  deleteSet: async (subjectId, topicId, setId) => {
    const response = await axiosInstance.delete(
      `/subjects/${subjectId}/topics/${topicId}/sets/${setId}/delete-with-backup`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};