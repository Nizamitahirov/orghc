// services/trainingService.js

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TRAINING_BASE = `${API_BASE_URL}/trainings`;

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

// ✅ Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000,
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
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
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

// ============================================
// 📚 TRAININGS
// ============================================

export const trainingAPI = {
  // Get all trainings (with filters)
  getAll: async (params = {}) => {
    try {
      const response = await api.get(`${TRAINING_BASE}/trainings/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching trainings:', error);
      throw error;
    }
  },

  // Get single training
  getById: async (id) => {
    try {
      const response = await api.get(`${TRAINING_BASE}/trainings/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching training:', error);
      throw error;
    }
  },

  // Create training
  create: async (data) => {
    try {
      const config = {};
      
      if (data instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      }
      
      const response = await api.post(`${TRAINING_BASE}/trainings/`, data, config);
      return response.data;
    } catch (error) {
      console.error('Error creating training:', error);
      throw error;
    }
  },

  // Update training
  update: async (id, data) => {
    try {
      const config = {};
      
      if (data instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      }
      
      const response = await api.put(`${TRAINING_BASE}/trainings/${id}/`, data, config);
      return response.data;
    } catch (error) {
      console.error('Error updating training:', error);
      throw error;
    }
  },




  // Delete training
  delete: async (id) => {
    try {
      const response = await api.delete(`${TRAINING_BASE}/trainings/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting training:', error);
      throw error;
    }
  },

  // ✅ Get training statistics
  getStatistics: async () => {
    try {
      const response = await api.get(`${TRAINING_BASE}/trainings/statistics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // ✅ Bulk assign trainings to employees
  bulkAssign: async (data) => {
    try {
      const response = await api.post(
        `${TRAINING_BASE}/trainings/bulk_assign/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk assigning trainings:', error);
      throw error;
    }
  }
};

// ============================================
// 📋 TRAINING ASSIGNMENTS
// ============================================

export const trainingAssignmentAPI = {
  // Get all assignments (with filters)
  getAll: async (params = {}) => {
    try {
      const response = await api.get(`${TRAINING_BASE}/assignments/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  // Get single assignment
  getById: async (id) => {
    try {
      const response = await api.get(`${TRAINING_BASE}/assignments/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  },

  // Create assignment
  create: async (data) => {
    try {
      const response = await api.post(`${TRAINING_BASE}/assignments/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  // Update assignment
  update: async (id, data) => {
    try {
      const response = await api.put(`${TRAINING_BASE}/assignments/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },



  // Delete assignment
  delete: async (id) => {
    try {
      const response = await api.delete(`${TRAINING_BASE}/assignments/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  // ✅ Get my trainings
  getMyTrainings: async (params = {}) => {
    try {
      const response = await api.get(`${TRAINING_BASE}/assignments/my_trainings/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my trainings:', error);
      throw error;
    }
  },

  // ✅ Complete material
  completeMaterial: async (assignmentId, materialId) => {
    try {
      const response = await api.post(
        `${TRAINING_BASE}/assignments/${assignmentId}/complete_material/`,
        { material_id: materialId }
      );
      return response.data;
    } catch (error) {
      console.error('Error completing material:', error);
      throw error;
    }
  },

  // ✅ Get overdue assignments
  getOverdue: async () => {
    try {
      const response = await api.get(`${TRAINING_BASE}/assignments/overdue/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue assignments:', error);
      throw error;
    }
  }
};

// ============================================
// 📄 TRAINING MATERIALS
// ============================================

export const trainingMaterialAPI = {
  // Get all materials (with filters)
  getAll: async (params = {}) => {
    try {
      const response = await api.get(`${TRAINING_BASE}/materials/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  },

  // Get single material
  getById: async (id) => {
    try {
      const response = await api.get(`${TRAINING_BASE}/materials/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material:', error);
      throw error;
    }
  },

  // Create material
  create: async (data) => {
    try {
      const response = await api.post(`${TRAINING_BASE}/materials/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },

  // Update material
  update: async (id, data) => {
    try {
      const response = await api.put(`${TRAINING_BASE}/materials/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  },



  // Delete material
  delete: async (id) => {
    try {
      const response = await api.delete(`${TRAINING_BASE}/materials/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
};

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

export const trainingHelpers = {
  // Format duration
  formatDuration: (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  },

  // Calculate days until due
  getDaysUntilDue: (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Get status badge color
  getStatusColor: (status) => {
    const colors = {
      'ASSIGNED': 'blue',
      'IN_PROGRESS': 'yellow',
      'COMPLETED': 'green',
      'OVERDUE': 'red',
      'CANCELLED': 'gray'
    };
    return colors[status] || 'gray';
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  // Get status label
  getStatusLabel: (status) => {
    const labels = {
      'ASSIGNED': 'Assigned',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'OVERDUE': 'Overdue',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  },

  // Calculate completion percentage
  calculateCompletionPercentage: (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  // Check if overdue
  isOverdue: (dueDate, status) => {
    if (!dueDate || status === 'COMPLETED' || status === 'CANCELLED') return false;
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  },

  // Format date
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format datetime
  formatDateTime: (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Export default object with all APIs
export default {
  trainings: trainingAPI,
  assignments: trainingAssignmentAPI,
  materials: trainingMaterialAPI,
  helpers: trainingHelpers
};