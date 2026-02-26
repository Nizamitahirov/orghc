// services/handoverService.js - COMPLETE
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Token management
const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("accessToken");
    }
    return null;
  },
  
  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", token);
    }
  },
  
  removeAccessToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
    }
  }
};

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeAccessToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const handoverService = {
  
  // HANDOVER TYPES
  getHandoverTypes: async () => {
    try {
      const response = await api.get('/handovers/types/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching handover types:', error);
      throw error;
    }
  },
  
  createHandoverType: async (data) => {
    try {
      const response = await api.post('/handovers/types/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating handover type:', error);
      throw error;
    }
  },
  
  // HANDOVER REQUESTS
  getAllHandovers: async () => {
    try {
      const response = await api.get('/handovers/requests/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching all handovers:', error);
      throw error;
    }
  },
  
  getMyHandovers: async () => {
    try {
      const response = await api.get('/handovers/requests/my_handovers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my handovers:', error);
      throw error;
    }
  },
  
  getTeamHandovers: async () => {
    try {
      const response = await api.get('/handovers/requests/team_handovers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team handovers:', error);
      return [];
    }
  },
  
  getPendingApprovals: async () => {
    try {
      const response = await api.get('/handovers/requests/pending_approval/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  },
  
  getStatistics: async () => {
    try {
      const response = await api.get('/handovers/requests/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },
  
  getHandoverDetail: async (id) => {
    try {
      const response = await api.get(`/handovers/requests/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching handover detail:', error);
      throw error;
    }
  },
  
  createHandover: async (data) => {
    try {
      const response = await api.post('/handovers/requests/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating handover:', error);
      throw error;
    }
  },
  
  updateHandover: async (id, data) => {
    try {
      const response = await api.patch(`/handovers/requests/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating handover:', error);
      throw error;
    }
  },
  
  deleteHandover: async (id) => {
    try {
      const response = await api.delete(`/handovers/requests/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting handover:', error);
      throw error;
    }
  },
  
  getActivityLog: async (id) => {
    try {
      const response = await api.get(`/handovers/requests/${id}/activity_log/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
  },
  
  // HANDOVER ACTIONS
  signAsHandingOver: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/sign_ho/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error signing as HO:', error);
      throw error;
    }
  },
  
  signAsTakingOver: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/sign_to/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error signing as TO:', error);
      throw error;
    }
  },
  
  approveAsLineManager: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/approve_lm/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error approving as LM:', error);
      throw error;
    }
  },
  
  rejectAsLineManager: async (id, reason) => {
    try {
      const response = await api.post(`/handovers/requests/${id}/reject_lm/`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting as LM:', error);
      throw error;
    }
  },
  
  requestClarification: async (id, clarification_comment) => {
    try {
      const response = await api.post(`/handovers/requests/${id}/request_clarification/`, { 
        clarification_comment 
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting clarification:', error);
      throw error;
    }
  },
  
  resubmit: async (id, response_comment) => {
    try {
      const response = await api.post(`/handovers/requests/${id}/resubmit/`, { 
        response_comment 
      });
      return response.data;
    } catch (error) {
      console.error('Error resubmitting:', error);
      throw error;
    }
  },
  
  takeover: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/takeover/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error taking over:', error);
      throw error;
    }
  },
  
  takeback: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/takeback/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error taking back:', error);
      throw error;
    }
  },
  
  // HANDOVER TASKS
  getTasks: async () => {
    try {
      const response = await api.get('/handovers/tasks/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  createTask: async (data) => {
    try {
      const response = await api.post('/handovers/tasks/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  updateTask: async (id, data) => {
    try {
      const response = await api.patch(`/handovers/tasks/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  updateTaskStatus: async (id, status, comment = '') => {
    try {
      const response = await api.post(`/handovers/tasks/${id}/update_status/`, {
        status,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },
  
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/handovers/tasks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  // HANDOVER ATTACHMENTS
  getAttachments: async () => {
    try {
      const response = await api.get('/handovers/attachments/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  },
  
  uploadAttachment: async (handoverId, file) => {
    try {
      const formData = new FormData();
      formData.append('handover', handoverId);
      formData.append('file', file);
      
      const response = await api.post('/handovers/attachments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },
  
  deleteAttachment: async (id) => {
    try {
      const response = await api.delete(`/handovers/attachments/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },
  
  // EMPLOYEE LOOKUP
  getEmployees: async () => {
    try {
      const response = await api.get('/employees/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/job-descriptions/my_access_info/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  getUser: async () => {
    try {
      const response = await api.get('/me/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
};

export default handoverService;
export { TokenManager };