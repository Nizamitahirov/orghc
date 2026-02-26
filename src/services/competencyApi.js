// services/competencyApi.js
import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Token management utility
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

  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Skill Groups API
export const skillGroupsApi = {
  // Get all skill groups
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/skill-groups/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching skill groups:', error);
      throw error;
    }
  },

  // Get single skill group with skills
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/skill-groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill group:', error);
      throw error;
    }
  },

  // Create new skill group
  create: async (data) => {
    try {
      const response = await api.post('/competency/skill-groups/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating skill group:', error);
      throw error;
    }
  },

  // Update skill group
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/skill-groups/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating skill group:', error);
      throw error;
    }
  },

  // Delete skill group
  delete: async (id) => {
    try {
      await api.delete(`/competency/skill-groups/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting skill group:', error);
      throw error;
    }
  },

  // Get skills for a specific group
  getSkills: async (id) => {
    try {
      const response = await api.get(`/competency/skill-groups/${id}/skills/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group skills:', error);
      throw error;
    }
  }
};

// Skills API
export const skillsApi = {
  // Get all skills
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/skills/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },

  // Get single skill
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/skills/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill:', error);
      throw error;
    }
  },

  // Create new skill
  create: async (data) => {
    try {
      const response = await api.post('/competency/skills/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },

  // Update skill
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/skills/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  },

  // Delete skill
  delete: async (id) => {
    try {
      await api.delete(`/competency/skills/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }
};

// Behavioral Groups API
export const behavioralGroupsApi = {
  // Get all behavioral groups
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/behavioral-groups/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral groups:', error);
      throw error;
    }
  },

  // Get single behavioral group with competencies
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/behavioral-groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral group:', error);
      throw error;
    }
  },

  // Create new behavioral group
  create: async (data) => {
    try {
      const response = await api.post('/competency/behavioral-groups/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating behavioral group:', error);
      throw error;
    }
  },

  // Update behavioral group
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/behavioral-groups/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating behavioral group:', error);
      throw error;
    }
  },

  // Delete behavioral group
  delete: async (id) => {
    try {
      await api.delete(`/competency/behavioral-groups/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting behavioral group:', error);
      throw error;
    }
  },

  // Get competencies for a specific group
  getCompetencies: async (id) => {
    try {
      const response = await api.get(`/competency/behavioral-groups/${id}/competencies/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group competencies:', error);
      throw error;
    }
  }
};

// Behavioral Competencies API
export const behavioralCompetenciesApi = {
  // Get all behavioral competencies
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/behavioral-competencies/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral competencies:', error);
      throw error;
    }
  },

  // Get single behavioral competency
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/behavioral-competencies/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral competency:', error);
      throw error;
    }
  },

  // Create new behavioral competency
  create: async (data) => {
    try {
      const response = await api.post('/competency/behavioral-competencies/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating behavioral competency:', error);
      throw error;
    }
  },

  // Update behavioral competency
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/behavioral-competencies/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating behavioral competency:', error);
      throw error;
    }
  },

  // Delete behavioral competency
  delete: async (id) => {
    try {
      await api.delete(`/competency/behavioral-competencies/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting behavioral competency:', error);
      throw error;
    }
  }
};
// Leadership Main Groups API
export const leadershipMainGroupsApi = {
  // Get all leadership main groups
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/leadership-main-groups/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership main groups:', error);
      throw error;
    }
  },

  // Get single leadership main group with child groups
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/leadership-main-groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership main group:', error);
      throw error;
    }
  },

  // Create new leadership main group
  create: async (data) => {
    try {
      const response = await api.post('/competency/leadership-main-groups/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating leadership main group:', error);
      throw error;
    }
  },

  // Update leadership main group
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/leadership-main-groups/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating leadership main group:', error);
      throw error;
    }
  },

  // Delete leadership main group
  delete: async (id) => {
    try {
      await api.delete(`/competency/leadership-main-groups/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting leadership main group:', error);
      throw error;
    }
  },

  // Get child groups for a specific main group
  getChildGroups: async (id) => {
    try {
      const response = await api.get(`/competency/leadership-main-groups/${id}/child_groups/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching main group child groups:', error);
      throw error;
    }
  }
};

// Leadership Child Groups API
export const leadershipChildGroupsApi = {
  // Get all leadership child groups
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/leadership-child-groups/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership child groups:', error);
      throw error;
    }
  },

  // Get single leadership child group with items
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/leadership-child-groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership child group:', error);
      throw error;
    }
  },

  // Create new leadership child group
  create: async (data) => {
    try {
      const response = await api.post('/competency/leadership-child-groups/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating leadership child group:', error);
      throw error;
    }
  },

  // Update leadership child group
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/leadership-child-groups/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating leadership child group:', error);
      throw error;
    }
  },

  // Delete leadership child group
  delete: async (id) => {
    try {
      await api.delete(`/competency/leadership-child-groups/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting leadership child group:', error);
      throw error;
    }
  },

  // Get items for a specific child group
  getItems: async (id) => {
    try {
      const response = await api.get(`/competency/leadership-child-groups/${id}/items/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child group items:', error);
      throw error;
    }
  }
};

// Leadership Items API
export const leadershipItemsApi = {
  // Get all leadership items
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/leadership-items/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership items:', error);
      throw error;
    }
  },

  // Get single leadership item
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/leadership-items/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership item:', error);
      throw error;
    }
  },

  // Create new leadership item
  create: async (data) => {
    try {
      const response = await api.post('/competency/leadership-items/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating leadership item:', error);
      throw error;
    }
  },

  // Update leadership item
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/leadership-items/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating leadership item:', error);
      throw error;
    }
  },

  // Delete leadership item
  delete: async (id) => {
    try {
      await api.delete(`/competency/leadership-items/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting leadership item:', error);
      throw error;
    }
  }
};

// Combined API service
export const competencyApi = {
  skillGroups: skillGroupsApi,
  skills: skillsApi,
  behavioralGroups: behavioralGroupsApi,
  behavioralCompetencies: behavioralCompetenciesApi,
  leadershipMainGroups: leadershipMainGroupsApi,
  leadershipChildGroups: leadershipChildGroupsApi,
  leadershipItems: leadershipItemsApi
};

export default competencyApi;