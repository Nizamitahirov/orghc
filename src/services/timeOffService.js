// src/services/timeOffService.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Token Management
const TokenManager = {
  getAccessToken: () => typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null,
  setAccessToken: (token) => typeof window !== 'undefined' && localStorage.setItem("accessToken", token),
  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

// Request Interceptor
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

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Time Off Service
const timeOffService = {
  // Balance endpoints
  getMyBalance: () => api.get('/timeoff/balances/my_balance/'),
  getAllBalances: (params) => api.get('/timeoff/balances/', { params }),
  getBalanceById: (id) => api.get(`/timeoff/balances/${id}/`),
  getTeamBalances: () => api.get('/timeoff/balances/team_balances/'), 
  bulkUploadBalances: (file) => { // ✅ NEW
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/timeoff/balances/bulk_upload_balances/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadBalanceTemplate: () => api.get('/timeoff/balances/download_template/', { // ✅ NEW
    responseType: 'blob'
  }),
  updateBalance: (id, data) => api.post(`/timeoff/balances/${id}/update_balance/`, data),
  resetMonthlyBalances: () => api.post('/timeoff/balances/reset_monthly_balances/'),

  // Request endpoints
  getMyRequests: (params) => api.get('/timeoff/requests/my_requests/', { params }),
  getAllRequests: (params) => api.get('/timeoff/requests/', { params }),
  getRequestById: (id) => api.get(`/timeoff/requests/${id}/`),
  createRequest: (data) => api.post('/timeoff/requests/', data),
  updateRequest: (id, data) => api.put(`/timeoff/requests/${id}/`, data),
  deleteRequest: (id) => api.delete(`/timeoff/requests/${id}/`),
  approveRequest: (id) => api.post(`/timeoff/requests/${id}/approve/`),
  rejectRequest: (id, data) => api.post(`/timeoff/requests/${id}/reject/`, data),
  cancelRequest: (id) => api.post(`/timeoff/requests/${id}/cancel/`),
  getPendingApprovals: (params) => api.get('/timeoff/requests/pending_approvals/', { params }),

  // Activity endpoints
  getMyActivities: (params) => api.get('/timeoff/activities/my_activities/', { params }),
  getAllActivities: (params) => api.get('/timeoff/activities/', { params }),
  getActivityById: (id) => api.get(`/timeoff/activities/${id}/`),
  getActivitiesByRequest: (requestId) => api.get('/timeoff/activities/by_request/', { params: { request_id: requestId } }),

  // Dashboard endpoints
  getDashboardOverview: () => api.get('/timeoff/dashboard/overview/'),
  getTeamOverview: () => api.get('/timeoff/dashboard/team_overview/'),
  getMyAccessInfo: () => api.get('/timeoff/dashboard/my_access_info/'), // ✅ NEW

  // Settings endpoints
  getCurrentSettings: () => api.get('/timeoff/settings/current/'),
  getAllSettings: (params) => api.get('/timeoff/settings/', { params }),
  getSettingsById: (id) => api.get(`/timeoff/settings/${id}/`),
  updateSettings: (id, data) => api.put(`/timeoff/settings/${id}/`, data),
  updateHREmails: (id, data) => api.post(`/timeoff/settings/${id}/update_hr_emails/`, data),
};

export default timeOffService;