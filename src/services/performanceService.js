// services/performanceApi.js - UPDATED VERSION
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

// Interceptors
api.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

// Build Query Params
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

// ===================== DASHBOARD =====================
export const dashboardService = {
  getStatistics: async (year) => {
    const response = await api.get('/performance/performance/dashboard/statistics/', { 
      params: year ? { year } : {} 
    });
    return response.data;
  },
};

// ===================== PERFORMANCE YEARS =====================
export const performanceYearService = {
  list: async () => {
    const response = await api.get('/performance/performance/years/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/years/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/years/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/years/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/years/${id}/`);
    return true;
  },
  getActiveYear: async () => {
    const response = await api.get('/performance/performance/years/active_year/');
    return response.data;
  },
  setActive: async (id) => {
    const response = await api.post(`/performance/performance/years/${id}/set_active/`, {});
    return response.data;
  },
};

// ===================== WEIGHT CONFIGS =====================
export const weightConfigService = {
  list: async () => {
    const response = await api.get('/performance/performance/weight-configs/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/weight-configs/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/weight-configs/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/weight-configs/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/weight-configs/${id}/`);
    return true;
  },
};

// ===================== GOAL LIMITS =====================
export const goalLimitService = {
  list: async () => {
    const response = await api.get('/performance/performance/goal-limits/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/goal-limits/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/goal-limits/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/goal-limits/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/goal-limits/${id}/`);
    return true;
  },
  getActiveConfig: async () => {
    const response = await api.get('/performance/performance/goal-limits/active_config/');
    return response.data;
  },
};

// ===================== DEPARTMENT OBJECTIVES =====================
export const departmentObjectiveService = {
  list: async (params = {}) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(`/performance/performance/department-objectives/?${queryString}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/department-objectives/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/department-objectives/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/department-objectives/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/department-objectives/${id}/`);
    return true;
  },
};

// ===================== EVALUATION SCALES =====================
export const evaluationScaleService = {
  list: async () => {
    const response = await api.get('/performance/performance/evaluation-scales/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/evaluation-scales/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/evaluation-scales/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/evaluation-scales/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/evaluation-scales/${id}/`);
    return true;
  },
};

// ===================== EVALUATION TARGETS =====================
export const evaluationTargetService = {
  list: async () => {
    const response = await api.get('/performance/performance/evaluation-targets/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/evaluation-targets/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/evaluation-targets/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/evaluation-targets/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/evaluation-targets/${id}/`);
    return true;
  },
  getActiveConfig: async () => {
    const response = await api.get('/performance/performance/evaluation-targets/active_config/');
    return response.data;
  },
};

// ===================== OBJECTIVE STATUSES =====================
export const objectiveStatusService = {
  list: async () => {
    const response = await api.get('/performance/performance/objective-statuses/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/objective-statuses/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/objective-statuses/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/objective-statuses/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/objective-statuses/${id}/`);
    return true;
  },
};

// ===================== NOTIFICATION TEMPLATES =====================
export const notificationTemplateService = {
  list: async () => {
    const response = await api.get('/performance/performance/notification-templates/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/notification-templates/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/performance/performance/notification-templates/${id}/`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/notification-templates/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/performance/performance/notification-templates/${id}/`);
    return true;
  },
};

// ===================== EMPLOYEE PERFORMANCES =====================
export const performanceService = {
  // Basic CRUD
  list: async (params = {}) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(`/performance/performance/performances/?${queryString}`);
    return response.data;
  },
  // Objectives Operations
cancelObjective: async (id, objectiveId, reason) => {
  const response = await api.post(
    `/performance/performance/performances/${id}/cancel_objective/`,
    { objective_id: objectiveId, reason }
  );
  return response.data;
},
  getTeamMembersWithStatus: async (year) => {
    const params = year ? { year } : {};
    const queryString = buildQueryParams(params);
    const response = await api.get(
      `/performance/performance/performances/team_members_with_status/?${queryString}`
    );
    return response.data;
  },

  // ✅ NEW: Initialize multiple employees at once
  initializeBulk: async (employeeIds, performanceYearId) => {
    const response = await api.post(
      '/performance/performance/performances/initialize_bulk/',
      {
        employee_ids: employeeIds,
        performance_year: performanceYearId
      }
    );
    return response.data;
  },
// ✅ NEW: End-Year Objectives Rating
  saveEndYearObjectivesDraft: async (id, objectives) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/save_end_year_objectives_draft/`,
      { objectives }
    );
    return response.data;
  },
  
  submitEndYearObjectives: async (id, objectives) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/submit_end_year_objectives/`,
      { objectives }
    );
    return response.data;
  },

    addObjectiveComment: async (performanceId, objectiveId, comment) => {
    const response = await api.post(
      `/performance/performance/performances/${performanceId}/add_objective_comment/`,
      { objective_id: objectiveId, comment }
    );
    return response.data;
  },
  
  deleteObjectiveComment: async (performanceId, commentId) => {
    const response = await api.delete(
      `/performance/performance/performances/${performanceId}/delete_objective_comment/`,
      { data: { comment_id: commentId } }
    );
    return response.data;
  },
  // ✅ NEW: Get available years
  getAvailableYears: async () => {
    const response = await api.get(
      '/performance/performance/performances/available_years/'
    );
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/performance/performance/performances/', data);
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/performance/performance/performances/${id}/`);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/performance/performance/performances/${id}/`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/performance/performance/performances/${id}/`);
    return true;
  },

  // 🆕 MY PERMISSIONS
  getMyAccessInfo: async () => {
    const response = await api.get('/performance/performance/performances/my_access_info/');
    return response.data;
  },

  // Initialize (IMPORTANT!)
  initialize: async (data) => {
    const response = await api.post('/performance/performance/performances/initialize/', data);
    return response.data;
  },

  // Objectives Operations
  saveObjectivesDraft: async (id, objectives) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/save_objectives_draft/`,
      { objectives }
    );
    return response.data;
  },
  
  submitObjectives: async (performanceId, objectives) => {
  const response = await api.post(
    `/performance/performance/performances/${performanceId}/submit_objectives/`,
    { objectives }  // ✅ FIX #1: Include objectives in payload
  );
  return response.data;
},
  
  approveObjectivesEmployee: async (id) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/approve_objectives_employee/`,
      {}
    );
    return response.data;
  },
  

  
  cancelObjective: async (id, objectiveId, reason) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/cancel_objective/`,
      { objective_id: objectiveId, reason }
    );
    return response.data;
  },

  // Competencies Operations
  saveCompetenciesDraft: async (id, competencies) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/save_competencies_draft/`,
      { competencies }
    );
    return response.data;
  },
  
  submitCompetencies: async (id,competencies) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/submit_competencies/`,
      { competencies }  
    );
    return response.data;
  },


  submitMidYearEmployee: async (id, comment, objectives = null) => {
    const payload = { comment };
    if (objectives) payload.objectives = objectives;
    
    const response = await api.post(
      `/performance/performance/performances/${id}/submit_mid_year_employee/`,
      payload
    );
    return response.data;
  },
  
  submitMidYearManager: async (id, comment, objectives = null) => {
    const payload = { comment };
    if (objectives) payload.objectives = objectives;
    
    const response = await api.post(
      `/performance/performance/performances/${id}/submit_mid_year_manager/`,
      payload
    );
    return response.data;
  },
  


  submitEndYearEmployee: async (id, comment) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/submit_end_year_employee/`,
      { comment }
    );
    return response.data;
  },
  submitEndYearManager: async (id, comment) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/submit_end_year_manager/`,
      { comment }
    );
    return response.data;
  },
  
  completeEndYear: async (id, comment) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/complete_end_year/`,
      { comment }
    );
    return response.data;
  },

  // Development Needs Operations
  saveDevelopmentNeedsDraft: async (id, developmentNeeds) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/save_development_needs_draft/`,
      { development_needs: developmentNeeds }
    );
    return response.data;
  },
  

  // Approval Operations
  requestClarification: async (id, comment, commentType) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/request_clarification/`,
      { comment, comment_type: commentType }
    );
    return response.data;
  },
  
  approveFinalEmployee: async (id) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/approve_final_employee/`,
      {}
    );
    return response.data;
  },
  
  approveFinalManager: async (id) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/approve_final_manager/`,
      {}
    );
    return response.data;
  },

  // Utility Operations
  recalculateScores: async (id) => {
    const response = await api.post(
      `/performance/performance/performances/${id}/recalculate_scores/`,
      {}
    );
    return response.data;
  },
  
  exportExcel: async (id) => {
    const response = await api.get(
      `/performance/performance/performances/${id}/export_excel/`,
      { responseType: 'blob' }
    );
    return response;
  },
};

// ===================== DEPARTMENTS API =====================
export const departmentsService = {
  list: async (params = {}) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(`/departments/?${queryString}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/departments/${id}/`);
    return response.data;
  }
};

// ===================== POSITION GROUPS API =====================
export const positionGroupsService = {
  list: async (params = {}) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(`/position-groups/?${queryString}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/position-groups/${id}/`);
    return response.data;
  }
};

// ===================== EMPLOYEES API =====================
export const employeesService = {
  list: async (params = {}) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(`/employees/?${queryString}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/employees/${id}/`);
    return response.data;
  }
};

// ===================== HELPER FUNCTIONS =====================
export const downloadExcel = async (performanceId, filename) => {
  try {
    const response = await performanceService.exportExcel(performanceId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `performance-${performanceId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// ===================== COMBINED EXPORT =====================
const performanceApi = {
  dashboard: dashboardService,
  years: performanceYearService,
  weightConfigs: weightConfigService,
  goalLimits: goalLimitService,
  departmentObjectives: departmentObjectiveService,
  evaluationScales: evaluationScaleService,
  evaluationTargets: evaluationTargetService,
  objectiveStatuses: objectiveStatusService,
  notificationTemplates: notificationTemplateService,
  performances: performanceService,
  departments: departmentsService,
  positionGroups: positionGroupsService,
  employees: employeesService,
  downloadExcel,
};

export default performanceApi;