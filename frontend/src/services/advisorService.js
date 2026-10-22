import api from './api';

export const advisorService = {
  getAdvisees: async (advisorId) => {
    const response = await api.get(`/advisors/${advisorId}/advisees`);
    return response.data.data;
  },

  getAtRiskStudents: async (advisorId) => {
    const response = await api.get(`/advisors/${advisorId}/at-risk`);
    return response.data.data;
  },

  getStudentAudit: async (advisorId, studentId) => {
    const response = await api.get(`/advisors/${advisorId}/students/${studentId}/audit`);
    return response.data.data;
  }
};
