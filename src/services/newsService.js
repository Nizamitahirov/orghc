// src/services/newsService.js - Complete News & Target Groups API Service
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Axios instance
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

// Request interceptor - Add auth token
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

// Response interceptor - Handle errors
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

// ============================================
// NEWS ENDPOINTS
// ============================================

export const newsService = {
  // Get all news with filters
  getNews: async (params = {}) => {
    try {
      const response = await api.get('/news/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single news by ID
  getNewsById: async (id) => {
    try {
      const response = await api.get(`/news/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },


createNews: async (data) => {
  try {
    const isFileUpload = data.image instanceof File;
    
    let payload;
    let config = {};
    
    if (isFileUpload) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt);
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('is_pinned', data.isPinned || false);
      formData.append('is_published', data.isPublished !== undefined ? data.isPublished : true); // ƏLAVƏ ET
      formData.append('published_at', data.publishedAt || new Date().toISOString());
      formData.append('notify_members', data.notifyMembers || false);
      
      if (data.authorDisplayName) {
        formData.append('author_display_name', data.authorDisplayName);
      }
      
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
          formData.append('tags_list', tag);
        });
      }
      
      if (data.targetGroups && data.targetGroups.length > 0) {
        data.targetGroups.forEach(groupId => {
          formData.append('target_group_ids', groupId);
        });
      }
      
      formData.append('image', data.image);
      
      config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      payload = formData;
    } else {
      payload = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        tags_list: data.tags || [],
        image_url_external: data.imagePreview || data.image_url_external,
        is_pinned: data.isPinned || false,
        is_published: data.isPublished !== undefined ? data.isPublished : true, // ƏLAVƏ ET
        published_at: data.publishedAt || new Date().toISOString(),
        author_display_name: data.authorDisplayName || '',
        target_group_ids: data.targetGroups || [],
        notify_members: data.notifyMembers || false
      };
    }
    
    const response = await api.post('/news/', payload, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

// Update news funksiyasında da eyni dəyişikliyi et
updateNews: async (id, data) => {
  try {
    const isFileUpload = data.image instanceof File;
    
    let payload;
    let config = {};
    
    if (isFileUpload) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt);
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('is_pinned', data.isPinned || false);
      formData.append('is_published', data.isPublished !== undefined ? data.isPublished : true); // ƏLAVƏ ET
      formData.append('published_at', data.publishedAt || new Date().toISOString());
      formData.append('notify_members', data.notifyMembers || false);
      
      if (data.authorDisplayName) {
        formData.append('author_display_name', data.authorDisplayName);
      }
      
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
          formData.append('tags_list', tag);
        });
      }
      
      if (data.targetGroups && data.targetGroups.length > 0) {
        data.targetGroups.forEach(groupId => {
          formData.append('target_group_ids', groupId);
        });
      }
      
      formData.append('image', data.image);
      
      config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      payload = formData;
    } else {
      payload = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        tags_list: data.tags || [],
        image_url_external: data.imagePreview || data.image_url_external,
        is_pinned: data.isPinned || false,
        is_published: data.isPublished !== undefined ? data.isPublished : true, // ƏLAVƏ ET
        published_at: data.publishedAt,
        author_display_name: data.authorDisplayName,
        target_group_ids: data.targetGroups || [],
        notify_members: data.notifyMembers || false
      };
    }
    
    const response = await api.put(`/news/${id}/`, payload, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

  // Delete news
  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle pin status
  togglePin: async (id) => {
    try {
      const response = await api.post(`/news/${id}/toggle_pin/`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle publish status
  togglePublish: async (id) => {
    try {
      const response = await api.post(`/news/${id}/toggle_publish/`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get news statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/news/statistics/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  myPermissions: async () => {
    try {
      const response = await api.get('/news/permissions/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ============================================
// CATEGORY ENDPOINTS
// ============================================

export const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/news/categories/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single category
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/news/categories/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create category
  createCategory: async (data) => {
    try {
      const payload = {
        name: data.name,
        is_active: data.isActive !== undefined ? data.isActive : true
      };
      
      const response = await api.post('/news/categories/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update category
  updateCategory: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        is_active: data.isActive !== undefined ? data.isActive : true
      };
      
      const response = await api.put(`/news/categories/${id}/`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/news/categories/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ============================================
// TARGET GROUP ENDPOINTS
// ============================================

export const targetGroupService = {
  // Get all target groups
  getTargetGroups: async (params = {}) => {
    try {
      const response = await api.get('/news/target-groups/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single target group
  getTargetGroupById: async (id) => {
    try {
      const response = await api.get(`/news/target-groups/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create target group
  createTargetGroup: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || '',
        is_active: data.isActive !== undefined ? data.isActive : true,
        member_ids: data.members || []
      };
      
      const response = await api.post('/news/target-groups/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update target group
  updateTargetGroup: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || '',
        is_active: data.isActive !== undefined ? data.isActive : true,
        member_ids: data.members || []
      };
      
      const response = await api.put(`/news/target-groups/${id}/`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete target group
  deleteTargetGroup: async (id) => {
    try {
      const response = await api.delete(`/news/target-groups/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add members to group
  addMembers: async (id, employeeIds) => {
    try {
      const response = await api.post(`/news/target-groups/${id}/add_members/`, {
        employee_ids: employeeIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Remove members from group
  removeMembers: async (id, employeeIds) => {
    try {
      const response = await api.post(`/news/target-groups/${id}/remove_members/`, {
        employee_ids: employeeIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get target group statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/news/target-groups/statistics/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const formatApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.detail) {
    return error.detail;
  }
  
  if (error.message) {
    return error.message;
  }
  
  // Handle field-specific errors
  if (typeof error === 'object') {
    const firstKey = Object.keys(error)[0];
    if (firstKey && Array.isArray(error[firstKey])) {
      return `${firstKey}: ${error[firstKey][0]}`;
    }
  }
  
  return 'An error occurred. Please try again.';
};

// ============================================
// EMPLOYEE ENDPOINTS
// ============================================

export const employeeService = {
  // Get all employees
  getEmployees: async (params = {}) => {
    try {
      const response = await api.get('/employees/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
getMyProfile: async () => {
    try {
      const response = await api.get('/employees/get_my_profile/');
      return response.data;
    } catch (error) {
      console.error('Failed to get my profile:', error);
      throw error;
    }
  },
  // Get single employee
  getEmployee: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default {
  newsService,
  categoryService,
  targetGroupService,
  employeeService,
  TokenManager,
  formatApiError
};