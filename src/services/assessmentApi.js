import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
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

// Build query parameters helper
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else if (typeof value === 'object') {
        if (value.from && value.to) {
          searchParams.append(`${key}_from`, value.from);
          searchParams.append(`${key}_to`, value.to);
        } else {
          searchParams.append(key, JSON.stringify(value));
        }
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

// ========================================
// DASHBOARD API
// ========================================
export const dashboardApi = {
  getEmployeeOverview: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/dashboard/employee_overview/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee overview:', error);
      throw error;
    }
  },

  getScaleLevels: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/dashboard/scale_levels/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scale levels:', error);
      throw error;
    }
  },

  getSummary: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/dashboard/summary/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }
};

// ========================================
// BEHAVIORAL SCALES API
// ========================================
export const behavioralScalesApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/behavioral-scales/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral scales:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/behavioral-scales/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral scale:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/behavioral-scales/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating behavioral scale:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/behavioral-scales/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating behavioral scale:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/behavioral-scales/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting behavioral scale:', error);
      throw error;
    }
  }
};

// ========================================
// CORE SCALES API
// ========================================
export const coreScalesApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/core-scales/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching core scales:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/core-scales/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching core scale:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/core-scales/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating core scale:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/core-scales/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating core scale:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/core-scales/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting core scale:', error);
      throw error;
    }
  }
};

// ========================================
// LETTER GRADES API
// ========================================
export const letterGradesApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/letter-grades/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching letter grades:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/letter-grades/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching letter grade:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/letter-grades/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating letter grade:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/letter-grades/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating letter grade:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/letter-grades/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting letter grade:', error);
      throw error;
    }
  },

  getGradeForPercentage: async (percentage) => {
    try {
      const response = await api.get(`/assessments/letter-grades/get_grade_for_percentage/?percentage=${percentage}`);
      return response.data;
    } catch (error) {
      console.error('Error getting grade for percentage:', error);
      throw error;
    }
  }
};

// ========================================
// POSITION BEHAVIORAL API
// ========================================
export const positionBehavioralApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/position-behavioral/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position behavioral assessments:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/position-behavioral/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position behavioral assessment:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/position-behavioral/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating position behavioral assessment:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/position-behavioral/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating position behavioral assessment:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/position-behavioral/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting position behavioral assessment:', error);
      throw error;
    }
  },


   // YENİ: Get grade levels for position group
  getGradeLevels: async (positionGroupId) => {
    try {
      const response = await api.get(
        `/assessments/position-behavioral/get_grade_levels/?position_group_id=${positionGroupId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grade levels:', error);
      throw error;
    }
  },


  getForEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/assessments/position-behavioral/get_for_employee/?employee_id=${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral assessment for employee:', error);
      throw error;
    }
  }
};

// ========================================
// POSITION CORE API
// ========================================
export const positionCoreApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/position-core/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position core assessments:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/position-core/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position core assessment:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/position-core/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating position core assessment:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/position-core/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating position core assessment:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/position-core/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting position core assessment:', error);
      throw error;
    }
  },



  getForEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/assessments/position-core/get_for_employee/?employee_id=${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position assessment for employee:', error);
      throw error;
    }
  }
};

// ========================================
// EMPLOYEE BEHAVIORAL API
// ========================================
export const employeeBehavioralApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/employee-behavioral/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee behavioral assessments:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/employee-behavioral/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee behavioral assessment:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/employee-behavioral/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating employee behavioral assessment:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/employee-behavioral/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating employee behavioral assessment:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/employee-behavioral/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting employee behavioral assessment:', error);
      throw error;
    }
  },

  submit: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-behavioral/${id}/submit/`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting employee behavioral assessment:', error);
      throw error;
    }
  },

  reopen: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-behavioral/${id}/reopen/`, data);
      return response.data;
    } catch (error) {
      console.error('Error reopening employee behavioral assessment:', error);
      throw error;
    }
  },

  recalculateScores: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-behavioral/${id}/recalculate_scores/`, data);
      return response.data;
    } catch (error) {
      console.error('Error recalculating behavioral scores:', error);
      throw error;
    }
  },

  exportDocument: async (id) => {
    try {
      const response = await api.get(`/assessments/employee-behavioral/${id}/export_document/`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `behavioral-assessment-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting behavioral document:', error);
      throw error;
    }
  }
};

// ========================================
// EMPLOYEE CORE API
// ========================================
export const employeeCoreApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/employee-core/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee core assessments:', error);
      throw error;
    }
  },
getUserPermissions: async () => {
  const response = await api.get('/assessments/employee-core/get_user_assessment_permissions/');
  return response.data;
},
  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/employee-core/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee core assessment:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/employee-core/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating employee core assessment:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/employee-core/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating employee core assessment:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/employee-core/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting employee core assessment:', error);
      throw error;
    }
  },

  submit: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-core/${id}/submit/`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting employee core assessment:', error);
      throw error;
    }
  },

  reopen: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-core/${id}/reopen/`, data);
      return response.data;
    } catch (error) {
      console.error('Error reopening employee core assessment:', error);
      throw error;
    }
  },

  recalculateScores: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-core/${id}/recalculate_scores/`, data);
      return response.data;
    } catch (error) {
      console.error('Error recalculating scores:', error);
      throw error;
    }
  },

  exportDocument: async (id) => {
    try {
      const response = await api.get(`/assessments/employee-core/${id}/export_document/`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `core-assessment-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting core document:', error);
      throw error;
    }
  }
};

// ========================================
// EMPLOYEES API
// ========================================
export const employeesApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/employees/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }
};

// ========================================
// POSITION GROUPS API
// ========================================
export const positionGroupsApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/position-groups/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position groups:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/position-groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position group:', error);
      throw error;
    }
  }
};
export const positionLeadershipApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/position-leadership/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position leadership assessments:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/position-leadership/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position leadership assessment:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/position-leadership/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating position leadership assessment:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/position-leadership/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating position leadership assessment:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/position-leadership/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting position leadership assessment:', error);
      throw error;
    }
  },



  // ✅ DÜZƏLDILDI: position_group_id parametri əlavə edildi
  getGradeLevels: async (positionGroupId) => {
    try {
      const response = await api.get(
        `/assessments/position-leadership/get_grade_levels/?position_group_id=${positionGroupId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grade levels:', error);
      throw error;
    }
  },



  getLeadershipPositions: async () => {
    try {
      const response = await api.get('/assessments/position-leadership/get_leadership_positions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership positions:', error);
      throw error;
    }
  },

  getForEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/assessments/position-leadership/get_for_employee/?employee_id=${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leadership assessment for employee:', error);
      throw error;
    }
  }
};

// ========================================
// EMPLOYEE LEADERSHIP API
// ========================================
export const employeeLeadershipApi = {
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`/assessments/employee-leadership/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee leadership assessments:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/assessments/employee-leadership/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee leadership assessment:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/assessments/employee-leadership/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating employee leadership assessment:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/assessments/employee-leadership/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating employee leadership assessment:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/assessments/employee-leadership/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting employee leadership assessment:', error);
      throw error;
    }
  },

  submit: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-leadership/${id}/submit/`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting employee leadership assessment:', error);
      throw error;
    }
  },

  reopen: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-leadership/${id}/reopen/`, data);
      return response.data;
    } catch (error) {
      console.error('Error reopening employee leadership assessment:', error);
      throw error;
    }
  },

  recalculateScores: async (id, data) => {
    try {
      const response = await api.post(`/assessments/employee-leadership/${id}/recalculate_scores/`, data);
      return response.data;
    } catch (error) {
      console.error('Error recalculating leadership scores:', error);
      throw error;
    }
  },

  exportDocument: async (id) => {
    try {
      const response = await api.get(`/assessments/employee-leadership/${id}/export_document/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leadership-assessment-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting leadership document:', error);
      throw error;
    }
  }
};


// ========================================
// COMBINED ASSESSMENT API SERVICE
// ========================================
export const assessmentApi = {
  // Dashboard
  dashboard: dashboardApi,
  
  // Scales
  behavioralScales: behavioralScalesApi,
  coreScales: coreScalesApi,
  letterGrades: letterGradesApi,
  
  // Position Assessments
  positionCore: positionCoreApi,
  positionBehavioral: positionBehavioralApi,
  
  // Employee Assessments
  employeeCore: employeeCoreApi,
  employeeBehavioral: employeeBehavioralApi,
   positionLeadership: positionLeadershipApi,
  employeeLeadership: employeeLeadershipApi,
  // Supporting APIs
  employees: employeesApi,
  positionGroups: positionGroupsApi
};

export default assessmentApi;