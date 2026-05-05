// services/celebrationService.js

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TokenManager = {
  getAccessToken: () => typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null,
  getRefreshToken: () => typeof window !== 'undefined' ? localStorage.getItem("refreshToken") : null,
  setAccessToken: (token) => typeof window !== 'undefined' && localStorage.setItem("accessToken", token),
  setRefreshToken: (token) => typeof window !== 'undefined' && localStorage.setItem("refreshToken", token),
  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// CELEBRATION SERVICE
// ========================================

const celebrationService = {

  // ── Celebrations ──────────────────────────────────────────

  getAllCelebrations: async () => {
    const response = await api.get('/celebrations/all_celebrations/');
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/celebrations/statistics/');
    return response.data;
  },

  createCelebration: async (celebrationData) => {
    const formData = new FormData();
    formData.append('type',    celebrationData.type);
    formData.append('title',   celebrationData.title);
    formData.append('date',    celebrationData.date);
    formData.append('message', celebrationData.message);
    if (celebrationData.department) formData.append('department', celebrationData.department);
    (celebrationData.images || []).forEach(img => formData.append('uploaded_images', img));

    const response = await api.post('/celebrations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateCelebration: async (id, celebrationData) => {
    const formData = new FormData();
    if (celebrationData.type)       formData.append('type',       celebrationData.type);
    if (celebrationData.title)      formData.append('title',      celebrationData.title);
    if (celebrationData.date)       formData.append('date',       celebrationData.date);
    if (celebrationData.message)    formData.append('message',    celebrationData.message);
    if (celebrationData.department) formData.append('department', celebrationData.department);
    (celebrationData.images || []).forEach(img => formData.append('uploaded_images', img));

    const response = await api.patch(`/celebrations/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteCelebration: async (id) => {
    const response = await api.delete(`/celebrations/${id}/`);
    return response.data;
  },

  removeImage: async (celebrationId, imageId) => {
    const response = await api.delete(`/celebrations/${celebrationId}/remove_image/`, {
      data: { image_id: imageId },
    });
    return response.data;
  },

  getCelebrationById: async (id) => {
    const response = await api.get(`/celebrations/${id}/`);
    return response.data;
  },

  // ── Wishes ────────────────────────────────────────────────

  addWish: async (celebrationId, message) => {
    const response = await api.post(`/celebrations/${celebrationId}/add_wish/`, { message });
    return response.data;
  },

  addAutoWish: async (employeeId, celebrationType, message) => {
    const response = await api.post('/celebrations/add_auto_wish/', {
      employee_id:      employeeId,
      celebration_type: celebrationType,
      message,
    });
    return response.data;
  },

  getCelebrationWishes: async (celebrationId) => {
    const response = await api.get(`/celebrations/${celebrationId}/`);
    return response.data.wishes || [];
  },

  getAutoCelebrationWishes: async (employeeId, celebrationType) => {
    const response = await api.get('/celebrations/get_auto_wishes/', {
      params: { employee_id: employeeId, celebration_type: celebrationType },
    });
    return response.data;
  },

  // ── Settings ──────────────────────────────────────────────

  getSettings: async () => {
    const response = await api.get('/celebrations/settings/');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.put('/celebrations/settings/', settingsData);
    return response.data;
  },
};

export default celebrationService;