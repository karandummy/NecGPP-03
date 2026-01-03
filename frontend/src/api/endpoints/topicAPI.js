// src/api/endpoints/topicAPI.js
import axiosInstance from '../axiosConfig';

export const topicAPI = {
  // Get topics by subject
  getTopicsBySubject: async (subjectId) => {
    const response = await axiosInstance.get(`/subjects/${subjectId}/topics`);
    return response.data;
  },

  // Create topic
  createTopic: async (subjectId, data) => {
    const response = await axiosInstance.post(`/subjects/${subjectId}/topics`, data);
    return response.data;
  },

  // Update topic name
  updateTopicName: async (subjectId, topicId, topicName) => {
    const response = await axiosInstance.patch(`/subjects/${subjectId}/topics/${topicId}/name`, {
      topic_name: topicName
    });
    return response.data;
  },

  // Reorder topics
  reorderTopics: async (subjectId, orderedTopicIds) => {
    const response = await axiosInstance.patch(`/subjects/${subjectId}/topics/reorder`, {
      ordered_topic_ids: orderedTopicIds
    });
    return response.data;
  },

  // Export topic
  exportTopic: async (subjectId, topicId, export_type = 'content') => {
    const response = await axiosInstance.get(`/subjects/${subjectId}/topics/${topicId}/export`, {
      params: { export_type },
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete topic with backup
  deleteTopic: async (subjectId, topicId) => {
    const response = await axiosInstance.delete(`/subjects/${subjectId}/topics/${topicId}/delete-with-backup`, {
      responseType: 'blob'
    });
    return response.data;
  }
};