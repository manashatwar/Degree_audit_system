import api from './api';

export const registrarService = {
  previewImport: async (records) => {
    const response = await api.post('/registrar/import/preview', { records });
    return response.data.data;
  },

  confirmImport: async (validRecords) => {
    const response = await api.post('/registrar/import/confirm', { 
      importId: Date.now().toString(),
      validRecords 
    });
    return response.data.data;
  },

  getImportStatus: async (importId) => {
    const response = await api.get(`/registrar/import/${importId}/status`);
    return response.data.data;
  }
};
