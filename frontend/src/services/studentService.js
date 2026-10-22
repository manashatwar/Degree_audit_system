import api from './api';

export const studentService = {
  getAudit: async (studentId) => {
    const response = await api.get(`/students/${studentId}/audit`);
    return response.data.data;
  },

  getTranscript: async (studentId) => {
    const response = await api.get(`/students/${studentId}/transcript`);
    return response.data.data;
  },

  getProgress: async (studentId) => {
    const response = await api.get(`/students/${studentId}/progress`);
    return response.data.data;
  }
};
