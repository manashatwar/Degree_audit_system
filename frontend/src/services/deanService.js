import api from './api';

export const deanService = {
  getAnalytics: () => api.get('/dean/analytics').then(r => r.data.data),
  getExceptions: () => api.get('/dean/exceptions').then(r => r.data.data),
  approveException: (id, reviewNotes) =>
    api.post(`/dean/exceptions/${id}/approve`, { reviewNotes }).then(r => r.data),
  rejectException: (id, reviewNotes) =>
    api.post(`/dean/exceptions/${id}/reject`, { reviewNotes }).then(r => r.data),
  submitException: (payload) =>
    api.post('/dean/exceptions', payload).then(r => r.data),
};
