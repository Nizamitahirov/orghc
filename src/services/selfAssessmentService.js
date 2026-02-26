// services/selfAssessmentService.js - Updated with Access Info
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
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
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const selfAssessmentService = {
  // ==================== Assessment Periods ====================
  
  getAssessmentPeriods: async () => {
    try {
      const response = await api.get('/self-assessments-periods/');
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment periods:', error);
      throw error;
    }
  },

  getActivePeriod: async () => {
    try {
      const response = await api.get('/self-assessments-periods/active/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active period:', error);
      throw error;
    }
  },

  createAssessmentPeriod: async (periodData) => {
    try {
      const response = await api.post('/self-assessments-periods/', periodData);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment period:', error);
      throw error;
    }
  },

  activatePeriod: async (periodId) => {
    try {
      const response = await api.post(`/self-assessments-periods/${periodId}/activate/`);
      return response.data;
    } catch (error) {
      console.error('Error activating period:', error);
      throw error;
    }
  },

  updateAssessmentPeriod: async (periodId, periodData) => {
    try {
      const response = await api.patch(`/self-assessments-periods/${periodId}/`, periodData);
      return response.data;
    } catch (error) {
      console.error('Error updating assessment period:', error);
      throw error;
    }
  },

  deleteAssessmentPeriod: async (periodId) => {
    try {
      const response = await api.delete(`/self-assessments-periods/${periodId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assessment period:', error);
      throw error;
    }
  },

  // ==================== Self Assessments ====================
  
  getMyAssessments: async () => {
    try {
      const response = await api.get('/self-assessments/my_assessments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my assessments:', error);
      throw error;
    }
  },

  getTeamAssessments: async () => {
    try {
      const response = await api.get('/self-assessments/team_assessments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team assessments:', error);
      throw error;
    }
  },

  getAssessment: async (assessmentId) => {
    try {
      const response = await api.get(`/self-assessments/${assessmentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment:', error);
      throw error;
    }
  },

  startAssessment: async () => {
    try {
      const response = await api.post('/self-assessments/start_assessment/');
      return response.data;
    } catch (error) {
      console.error('Error starting assessment:', error);
      throw error;
    }
  },

  submitAssessment: async (assessmentId) => {
    try {
      const response = await api.post(`/self-assessments/${assessmentId}/submit/`);
      return response.data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  },

  managerReview: async (assessmentId, reviewData) => {
    try {
      const response = await api.post(`/self-assessments/${assessmentId}/manager_review/`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error submitting manager review:', error);
      throw error;
    }
  },

  getAssessmentActivities: async (assessmentId) => {
    try {
      const response = await api.get(`/self-assessments/${assessmentId}/activities/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment activities:', error);
      throw error;
    }
  },

  // ==================== Rating Operations ====================
  
  addRating: async (assessmentId, ratingData) => {
    try {
      const response = await api.post(
        `/self-assessments/${assessmentId}/add_rating/`, 
        ratingData
      );
      return response.data;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error;
    }
  },

  bulkAddRatings: async (assessmentId, ratingsData) => {
    try {
      const response = await api.post(
        `/self-assessments/${assessmentId}/bulk_add_ratings/`, 
        { ratings: ratingsData }
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk adding ratings:', error);
      throw error;
    }
  },

  // ==================== Statistics ====================
  
  getAssessmentStats: async () => {
    try {
      const response = await api.get('/self-assessments-stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment stats:', error);
      throw error;
    }
  },


  // ==================== Helper Functions ====================
  
  calculateCategoryAverage: (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return (total / ratings.length).toFixed(2);
  },

  getStatusColor: (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'REVIEWED': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  getRatingColor: (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  },

  getRatingLevel: (rating) => {
    const levels = {
      1: 'Basic',
      2: 'Limited',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return levels[rating] || 'Unknown';
  },

  formatRatingsForSubmit: (ratings) => {
    return Object.entries(ratings).map(([skillId, data]) => ({
      skill: parseInt(skillId),
      rating: data.rating,
      self_comment: data.comment || ''
    }));
  }
};

export default selfAssessmentService;