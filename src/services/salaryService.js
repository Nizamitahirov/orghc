// services/salaryService.js
import api from './api';

const BASE = '/salary';

export const salaryService = {
  list: (params = {}) =>
    api.get(`${BASE}/`, { params }),

  get: (id) =>
    api.get(`${BASE}/${id}/`),

  update: (data) =>
    api.post(`${BASE}/update/`, data),

  bulkUpdate: (data) =>
    api.post(`${BASE}/bulk-update/`, data),

  excelImport: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`${BASE}/excel-import/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  excelTemplate: () =>
    api.get(`${BASE}/excel-template/`, { responseType: 'blob' }),
};