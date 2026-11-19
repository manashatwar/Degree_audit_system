import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats').then(r => r.data.data),
  getUsers: () => api.get('/admin/users').then(r => r.data.data),
  createUser: (payload) => api.post('/admin/users', payload).then(r => r.data),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload).then(r => r.data),
  toggleStatus: (id, accountStatus) => api.put(`/admin/users/${id}/status`, { accountStatus }).then(r => r.data),
  resetPassword: (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword }).then(r => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(r => r.data),
  getConfig: () => api.get('/admin/config').then(r => r.data.data),
  updateConfig: (payload) => api.put('/admin/config', payload).then(r => r.data),
  getLogs: (params) => api.get('/admin/logs', { params }).then(r => r.data.data),
  bulkImport: (payload) => api.post('/admin/bulk-import', payload).then(r => r.data)
};
