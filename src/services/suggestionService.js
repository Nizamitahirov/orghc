// src/services/suggestionService.js - COMPLETE & FIXED

import axios from '@/lib/axiosShim';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token Manager
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

// ============================================================================
// MY VOICE SUGGESTION API
// ============================================================================

export const suggestionService = {
  // Get all suggestions (with filters & pagination)
  getSuggestions: async (params = {}) => {
    try {
      const response = await api.get('/suggestions-mng/suggestions/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },

  // Get trending suggestions
  getTrending: async () => {
    try {
      const response = await api.get('/suggestions-mng/suggestions/trending/');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending:', error);
      throw error;
    }
  },

  // Get my suggestions
  getMySuggestions: async () => {
    try {
      const response = await api.get('/suggestions-mng/suggestions/my_suggestions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my suggestions:', error);
      throw error;
    }
  },

  // Get suggestion by ID
  getSuggestionById: async (id) => {
    try {
      const response = await api.get(`/suggestions-mng/suggestions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      throw error;
    }
  },

  // Create suggestion
  createSuggestion: async (data) => {
    try {
      const response = await api.post('/suggestions-mng/suggestions/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating suggestion:', error);
      throw error;
    }
  },

  // Update suggestion
  updateSuggestion: async (id, data) => {
    try {
      const response = await api.patch(`/suggestions-mng/suggestions/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating suggestion:', error);
      throw error;
    }
  },

  // Delete suggestion
  deleteSuggestion: async (id) => {
    try {
      const response = await api.delete(`/suggestions-mng/suggestions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      throw error;
    }
  },

  // Vote on suggestion
  vote: async (id, voteType) => {
    try {
      const response = await api.post(`/suggestions-mng/suggestions/${id}/vote/`, {
        vote_type: voteType // 'UP' or 'DOWN'
      });
      return response.data;
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  },

  // Remove vote
  removeVote: async (id) => {
    try {
      const response = await api.delete(`/suggestions-mng/suggestions/${id}/vote/`);
      return response.data;
    } catch (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
  },

  // Add comment
  addComment: async (id, content, parentId = null) => {
    try {
      const response = await api.post(`/suggestions-mng/suggestions/${id}/comment/`, {
        content,
        parent: parentId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Admin respond to suggestion
  respondToSuggestion: async (id, data) => {
    try {
      const response = await api.patch(`/suggestions-mng/suggestions/${id}/admin_respond/`, data);
      return response.data;
    } catch (error) {
      console.error('Error responding to suggestion:', error);
      throw error;
    }
  },

  // Get statistics (Admin/HR only)
  getStatistics: async () => {
    try {
      const response = await api.get('/suggestions-mng/suggestions/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
};

// ============================================================================
// SUGGESTION COMMENTS API
// ============================================================================

export const commentService = {
  // Get comments for suggestion
  getComments: async (suggestionId, topLevelOnly = false) => {
    try {
      const params = { 
        suggestion_id: suggestionId,
        ...(topLevelOnly && { top_level: 'true' })
      };
      const response = await api.get('/suggestions-mng/suggestion-comments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Create comment
  createComment: async (data) => {
    try {
      const response = await api.post('/suggestions-mng/suggestion-comments/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (id, content) => {
    try {
      const response = await api.patch(`/suggestions-mng/suggestion-comments/${id}/`, { content });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (id) => {
    try {
      const response = await api.delete(`/suggestions-mng/suggestion-comments/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

// ============================================================================
// BOARD LETTER API
// ============================================================================

export const boardLetterService = {
  // Create board letter
  createLetter: async (data) => {
    try {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('content', data.content);
      formData.append('is_anonymous', data.is_anonymous);
      
      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }

      const response = await api.post('/suggestions-mng/board-letters/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating letter:', error);
      throw error;
    }
  },

  // Track letter by tracking number
  trackLetter: async (trackingNumber) => {
    try {
      const response = await api.post('/suggestions-mng/board-letters/track/', {
        tracking_number: trackingNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking letter:', error);
      throw error;
    }
  },

  // Get all letters (Admin/Board/HR only)
  getAllLetters: async (params = {}) => {
    try {
      const response = await api.get('/suggestions-mng/board-letters/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching letters:', error);
      throw error;
    }
  },

  // Get letter by ID (Admin/Board only)
  getLetterById: async (id) => {
    try {
      const response = await api.get(`/suggestions-mng/board-letters/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching letter:', error);
      throw error;
    }
  },

  // Add response to letter (Board/Admin only)
  respondToLetter: async (id, responseContent) => {
    try {
      const response = await api.patch(`/suggestions-mng/board-letters/${id}/respond/`, {
        response: responseContent
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to letter:', error);
      throw error;
    }
  },

  // Mark letter as read (Board/Admin only)
  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/suggestions-mng/board-letters/${id}/mark_read/`);
      return response.data;
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  // Update letter status (Board/Admin only)
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/suggestions-mng/board-letters/${id}/update_status/`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // Get statistics (Board/Admin/HR only)
  getStatistics: async () => {
    try {
      const response = await api.get('/suggestions-mng/board-letters/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
};