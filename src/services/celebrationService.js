// services/celebrationService.js

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ✅ Token Manager
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

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ✅ Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor (401 xətası üçün)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// CELEBRATION SERVICE FUNCTIONS
// ========================================

const celebrationService = {
  
  // ✅ Get all celebrations (manual + auto generated)
  getAllCelebrations: async () => {
    try {
      const response = await api.get('/celebrations/all_celebrations/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all celebrations:', error);
      throw error;
    }
  },

  // ✅ Get celebration statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/celebrations/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // ✅ Create new celebration (manual only - company events, achievements, other)
  createCelebration: async (celebrationData) => {
    try {
      const formData = new FormData();
      
      formData.append('type', celebrationData.type);
      formData.append('title', celebrationData.title);
      formData.append('department', celebrationData.department || '');
      formData.append('date', celebrationData.date);
      formData.append('message', celebrationData.message);
      
      // Add images if exists
      if (celebrationData.images && celebrationData.images.length > 0) {
        celebrationData.images.forEach((image) => {
          formData.append('uploaded_images', image);
        });
      }

      const response = await api.post('/celebrations/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating celebration:', error);
      throw error;
    }
  },

  // ✅ Update celebration
  updateCelebration: async (id, celebrationData) => {
    try {
      const formData = new FormData();
      
      if (celebrationData.type) formData.append('type', celebrationData.type);
      if (celebrationData.title) formData.append('title', celebrationData.title);
      if (celebrationData.department) formData.append('department', celebrationData.department);
      if (celebrationData.date) formData.append('date', celebrationData.date);
      if (celebrationData.message) formData.append('message', celebrationData.message);
      
      // Add new images if exists
      if (celebrationData.images && celebrationData.images.length > 0) {
        celebrationData.images.forEach((image) => {
          formData.append('uploaded_images', image);
        });
      }

      const response = await api.patch(`/celebrations/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating celebration:', error);
      throw error;
    }
  },

  // ✅ Delete celebration
  deleteCelebration: async (id) => {
    try {
      const response = await api.delete(`/celebrations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting celebration:', error);
      throw error;
    }
  },

  // ✅ Remove image from celebration
  removeImage: async (celebrationId, imageId) => {
    try {
      const response = await api.delete(`/celebrations/${celebrationId}/remove_image/`, {
        data: { image_id: imageId }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing image:', error);
      throw error;
    }
  },

  // ✅ Add wish to manual celebration
  addWish: async (celebrationId, message) => {
    try {
      const response = await api.post(`/celebrations/${celebrationId}/add_wish/`, {
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error adding wish:', error);
      throw error;
    }
  },

  // ✅ Add wish to auto celebration (birthday or work anniversary)
  addAutoWish: async (employeeId, celebrationType, message) => {
    try {
      const response = await api.post('/celebrations/add_auto_wish/', {
        employee_id: employeeId,
        celebration_type: celebrationType, // 'birthday' or 'work_anniversary'
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error adding auto wish:', error);
      throw error;
    }
  },

  // ✅ Get specific celebration details
  getCelebrationById: async (id) => {
    try {
      const response = await api.get(`/celebrations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching celebration:', error);
      throw error;
    }
  },

  // ✅ Get wishes for a celebration
  getCelebrationWishes: async (celebrationId) => {
    try {
      const response = await api.get(`/celebrations/${celebrationId}/`);
      return response.data.wishes || [];
    } catch (error) {
      console.error('Error fetching wishes:', error);
      throw error;
    }
  },

  // ✅ Get wishes for auto celebration (birthday or work anniversary)
  getAutoCelebrationWishes: async (employeeId, celebrationType) => {
    try {
      const response = await api.get('/celebrations/get_auto_wishes/', {
        params: {
          employee_id: employeeId,
          celebration_type: celebrationType
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching auto wishes:', error);
      throw error;
    }
  },

};

export default celebrationService;