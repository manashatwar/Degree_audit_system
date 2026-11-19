import api from './api';

export const admissionService = {
  getStats: () => api.get('/admission/stats').then(r => r.data.data),
  getStudents: () => api.get('/admission/students').then(r => r.data.data),
  getDeanApprovals: () => api.get('/admission/dean-approvals').then(r => r.data.data),
  getCredits: () => api.get('/admission/credits').then(r => r.data.data),
  recordCredit: (payload) => api.post('/admission/credits', payload).then(r => r.data),
  updateCreditStatus: (id, payload) => api.put(`/admission/credits/${id}/status`, payload).then(r => r.data),
  deleteCredit: (id) => api.delete(`/admission/credits/${id}`).then(r => r.data),
};
