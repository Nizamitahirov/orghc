// src/services/taskService.js

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

//  Token Manager
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

//  Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

//  Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

//  Response Interceptor
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

// ===========================================
// TASK MANAGEMENT SERVICE
// ===========================================

const taskService = {
  // ========================================
  // EMPLOYEES
  // ========================================
  
  getAllEmployees: async (searchQuery = '') => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const response = await api.get('/task-management/employees/all/', { params });
      return { success: true, data: response.data.employees, total: response.data.total_count };
    } catch (error) {
      console.error('Get all employees failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch employees' };
    }
  },

  // ========================================
  // TEAMS
  // ========================================
  
  getTeams: async () => {
    try {
      const response = await api.get('/task-management/teams/');
      return { success: true, data: response.data.teams, accessInfo: response.data.access_info };
    } catch (error) {
      console.error('Get teams failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch teams' };
    }
  },

  getTeam: async (teamId) => {
    try {
      const response = await api.get(`/task-management/teams/${teamId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get team failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch team' };
    }
  },

  /**
   * Get team members - team detail-dən members çıxarır
   */
  getTeamMembers: async (teamId) => {
    try {
      const response = await api.get(`/task-management/teams/${teamId}/`);
      // TeamDetailSerializer members qaytarır
      const members = (response.data.members || []).map(m => ({
        id: m.employee?.id,
        full_name: m.employee?.full_name || m.employee?.name,
        name: m.employee?.full_name || m.employee?.name,
        profile_image_url: m.employee?.profile_image_url,
        job_title: m.employee?.job_title,
        department: m.employee?.department,
        role: m.role,
      }));
      return { success: true, data: members };
    } catch (error) {
      console.error('Get team members failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch team members' };
    }
  },

  createTeam: async (teamData) => {
    try {
      const response = await api.post('/task-management/teams/', teamData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create team failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to create team' };
    }
  },

  updateTeam: async (teamId, teamData) => {
    try {
      const response = await api.patch(`/task-management/teams/${teamId}/`, teamData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update team failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to update team' };
    }
  },

  deleteTeam: async (teamId) => {
    try {
      await api.delete(`/task-management/teams/${teamId}/`);
      return { success: true };
    } catch (error) {
      console.error('Delete team failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to delete team' };
    }
  },

  addTeamMember: async (teamId, employeeId, role = 'MEMBER') => {
    try {
      const response = await api.post(`/task-management/teams/${teamId}/add_member/`, { employee_id: employeeId, role });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Add team member failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to add team member' };
    }
  },

  removeTeamMember: async (teamId, employeeId) => {
    try {
      const response = await api.post(`/task-management/teams/${teamId}/remove_member/`, { employee_id: employeeId });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Remove team member failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to remove team member' };
    }
  },

  // ========================================
  // FOLDERS
  // ========================================
  
  /**
   * Get folders - həm object həm string qəbul edir
   */
  getFolders: async (filters = {}) => {
    try {
      const params = {};
      if (typeof filters === 'string') {
        params.team = filters;
      } else if (filters && typeof filters === 'object') {
        if (filters.team) params.team = filters.team;
      }
      const response = await api.get('/task-management/folders/', { params });
      return { success: true, data: response.data.folders, total: response.data.total_count };
    } catch (error) {
      console.error('Get folders failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch folders' };
    }
  },

  createFolder: async (folderData) => {
    try {
      const response = await api.post('/task-management/folders/', folderData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create folder failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to create folder' };
    }
  },

  updateFolder: async (folderId, folderData) => {
    try {
      const response = await api.patch(`/task-management/folders/${folderId}/`, folderData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update folder failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to update folder' };
    }
  },

  deleteFolder: async (folderId) => {
    try {
      await api.delete(`/task-management/folders/${folderId}/`);
      return { success: true };
    } catch (error) {
      console.error('Delete folder failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to delete folder' };
    }
  },

  // ========================================
  // TASKS
  // ========================================
  
  getTasks: async (filters = {}) => {
    try {
      const response = await api.get('/task-management/tasks/', { params: filters });
      return {
        success: true,
        data: response.data.tasks,
        statistics: response.data.statistics,
        filters: response.data.filters_applied
      };
    } catch (error) {
      console.error('Get tasks failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch tasks' };
    }
  },

  getTask: async (taskId) => {
    try {
      const response = await api.get(`/task-management/tasks/${taskId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get task failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch task' };
    }
  },

  createTask: async (taskData) => {
    try {
      // assigned_to -> assigned_to_ids formatına çevir (serializer gözləyir)
      const payload = { ...taskData };
      if (payload.assigned_to) {
        payload.assigned_to_ids = payload.assigned_to;
        delete payload.assigned_to;
      }
      const response = await api.post('/task-management/tasks/', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create task failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to create task' };
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      // assigned_to -> assigned_to_ids formatına çevir
      const payload = { ...taskData };
      if (payload.assigned_to) {
        payload.assigned_to_ids = payload.assigned_to;
        delete payload.assigned_to;
      }
      const response = await api.patch(`/task-management/tasks/${taskId}/`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update task failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to update task' };
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/task-management/tasks/${taskId}/`);
      return { success: true };
    } catch (error) {
      console.error('Delete task failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to delete task' };
    }
  },

  /**
   * Add comment - həm object həm string qəbul edir
   */
  addTaskComment: async (taskId, contentOrObj) => {
    try {
      const content = typeof contentOrObj === 'string' ? contentOrObj : contentOrObj?.content;
      const response = await api.post(`/task-management/tasks/${taskId}/add_comment/`, { content });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Add comment failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to add comment' };
    }
  },

  /**
   * Get task comments - task detail-dən comments çıxarır
   */
  getTaskComments: async (taskId) => {
    try {
      const response = await api.get(`/task-management/tasks/${taskId}/`);
      // TaskDetailSerializer comments qaytarır
      const comments = (response.data.comments || []).map(c => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        updated_at: c.updated_at,
        user: {
          id: c.author_id,
          full_name: c.author_name,
          name: c.author_name,
        }
      }));
      return { success: true, data: comments };
    } catch (error) {
      console.error('Get comments failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch comments' };
    }
  },

  getTaskActivities: async (taskId) => {
    try {
      const response = await api.get(`/task-management/tasks/${taskId}/activities/`);
      return { success: true, data: response.data.activities, total: response.data.total };
    } catch (error) {
      console.error('Get activities failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch activities' };
    }
  },

  getMyTasks: async () => {
    try {
      const response = await api.get('/task-management/tasks/my_tasks/');
      return {
        success: true,
        assignedToMe: response.data.assigned_to_me,
        createdByMe: response.data.created_by_me,
        stats: response.data.stats
      };
    } catch (error) {
      console.error('Get my tasks failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch tasks' };
    }
  }
};

export default taskService;