import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Token management utility
const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("accessToken");
    }
    return null;
  },
};

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// PERMISSIONS API
// ============================================

export const permissionsAPI = {
  /**
   * Get all permissions with pagination
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/permissions/', { params });
    return response.data;
  },

  /**
   * Get permissions grouped by category
   */
  getByCategory: async (params = {}) => {
    const response = await apiClient.get('/permissions/by_category/', { params });
    return response.data;
  },
};

// ============================================
// ROLES API
// ============================================

export const rolesAPI = {
  /**
   * Get all roles with pagination
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/roles/', { params });
    return response.data;
  },

  /**
   * Get single role by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/roles/${id}/`);
    return response.data;
  },

  /**
   * Create new role
   */
  create: async (data) => {
    const response = await apiClient.post('/roles/', data);
    return response.data;
  },

  /**
   * Update role
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/roles/${id}/`, data);
    return response.data;
  },

  /**
   * Delete role
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/roles/${id}/`);
    return response.data;
  },

  /**
   * Bulk assign permissions to roles
   */
  bulkAssignPermissions: async (data) => {
    const response = await apiClient.post('/roles/bulk_assign_permissions/', data);
    return response.data;
  },

  /**
   * Remove single permission from role
   */
  removePermission: async (roleId, permissionId) => {
    const response = await apiClient.delete(`/roles/${roleId}/remove_permission/`, {
      params: { permission_id: permissionId }
    });
    return response.data;
  },

  /**
   * Get all permissions for a role
   */
  getPermissions: async (roleId) => {
    const response = await apiClient.get(`/roles/${roleId}/permissions/`);
    return response.data;
  },

  /**
   * Get all employees with a role
   */
  getEmployees: async (roleId) => {
    const response = await apiClient.get(`/roles/${roleId}/employees/`);
    return response.data;
  },
};

// ============================================
// EMPLOYEE ROLES API
// ============================================

export const employeeRolesAPI = {
  /**
   * Get all employee role assignments with pagination
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/employee-roles/', { params });
    return response.data;
  },

  /**
   * Get single employee role assignment by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/employee-roles/${id}/`);
    return response.data;
  },

  /**
   * Create employee role assignment
   */
  create: async (data) => {
    const response = await apiClient.post('/employee-roles/', data);
    return response.data;
  },

  /**
   * Update employee role assignment
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/employee-roles/${id}/`, data);
    return response.data;
  },

  /**
   * Delete employee role assignment
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/employee-roles/${id}/`);
    return response.data;
  },

  /**
   * Bulk assign roles to employees
   */
  bulkAssignRoles: async (data) => {
    const response = await apiClient.post('/employee-roles/bulk_assign_roles/', data);
    return response.data;
  },

  /**
   * Revoke role from employee
   */
  revokeRole: async (employeeId, roleId) => {
    const response = await apiClient.delete('/employee-roles/revoke_role/', {
      params: { employee_id: employeeId, role_id: roleId }
    });
    return response.data;
  },
};

// Export all APIs
export default {
  permissions: permissionsAPI,
  roles: rolesAPI,
  employeeRoles: employeeRolesAPI,
};