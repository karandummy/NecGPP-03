// src/api/endpoints/practiceAPI.js
import axiosInstance from '../axiosConfig';

export const practiceAPI = {
  // Get practice questions
  getSetQuestions: async (subjectId, topicId, setId) => {
    const response = await axiosInstance.get(
      `/subjects/${subjectId}/topics/${topicId}/sets/${setId}/practice/questions`
    );
    return response.data;
  },

  // Submit practice attempt
  submitAttempt: async (subjectId, topicId, setId, userAnswers) => {
    const response = await axiosInstance.post(
      `/subjects/${subjectId}/topics/${topicId}/sets/${setId}/practice/submit`,
      { user_answers: userAnswers }
    );
    return response.data;
  },

  // Get practice history (student only)
  getPracticeHistory: async (subjectId, topicId, setId) => {
    const response = await axiosInstance.get(
      `/subjects/${subjectId}/topics/${topicId}/sets/${setId}/practice/history`
    );
    return response.data;
  }
};