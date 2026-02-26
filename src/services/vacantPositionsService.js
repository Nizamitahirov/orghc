// src/services/vacantPositionsService.js - Updated with Archive and Restore APIs
import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Axios instance for vacant positions
const vacantApi = axios.create({
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
vacantApi.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
vacantApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// REFERENCE DATA SERVICE
// ========================================

class ReferenceDataService {
  
  /**
   * Get all Companys
   */
  async getBusinessFunctions(params = {}) {
    try {
      const response = await vacantApi.get('/business-functions/', { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Failed to fetch Companys:', error);
      throw this.handleError(error, 'Failed to fetch Companys');
    }
  }

  /**
   * Get all departments
   */
  async getDepartments(params = {}) {
    try {
      const response = await vacantApi.get('/departments/', { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      throw this.handleError(error, 'Failed to fetch departments');
    }
  }

  /**
   * Get departments by Company
   */
  async getDepartmentsByBusinessFunction(businessFunctionId) {
    try {
      const response = await vacantApi.get('/departments/', {
        params: { business_function: businessFunctionId }
      });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Failed to fetch departments by Company:', error);
      throw this.handleError(error, 'Failed to fetch departments');
    }
  }

  /**
   * Get all units
   */
  async getUnits(params = {}) {
    try {
      const response = await vacantApi.get('/units/', { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Failed to fetch units:', error);
      throw this.handleError(error, 'Failed to fetch units');
    }
  }

  /**
   * Get units by department
   */
  async getUnitsByDepartment(departmentId) {
    try {
      const response = await vacantApi.get('/units/', {
        params: { department: departmentId }
      });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Failed to fetch units by department:', error);
      throw this.handleError(error, 'Failed to fetch units');
    }
  }

  /**
   * Get all job functions
   */
  async getJobFunctions(params = {}) {
    try {
      const response = await vacantApi.get('/job-functions/', { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Failed to fetch job functions:', error);
      throw this.handleError(error, 'Failed to fetch job functions');
    }
  }

  /**
   * Get all position groups
   */
  async getPositionGroups(params = {}) {
    try {
      const response = await vacantApi.get('/position-groups/', { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Failed to fetch position groups:', error);
      throw this.handleError(error, 'Failed to fetch position groups');
    }
  }

  /**
   * Get grading levels for a specific position group
   */
  async getGradingLevelsForPositionGroup(positionGroupId) {
    try {
      const response = await vacantApi.get(`/position-groups/${positionGroupId}/grading_levels/`);
      return {
        success: true,
        data: response.data.levels || [],
        positionGroup: response.data.position_group,
        shorthand: response.data.shorthand
      };
    } catch (error) {
      console.error(`Failed to fetch grading levels for position group ${positionGroupId}:`, error);
      throw this.handleError(error, 'Failed to fetch grading levels');
    }
  }

  /**
   * Get all active employees for reporting_to dropdown
   */
  async getEmployees(params = {}) {
    try {
      // Only get active employees by default
      const searchParams = {
        page_size: 1000, // Get all active employees
        ...params
      };
      
      const response = await vacantApi.get('/employees/', { params: searchParams });
     
      return {
        success: true,
        data: response.data.results || response.data
      };

    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw this.handleError(error, 'Failed to fetch employees');
    }
  }

  /**
   * Get all reference data at once (excluding grading levels as they're position group specific)
   */
  async getAllReferenceData() {
    try {
      const [
        businessFunctions,
        departments,
        units,
        jobFunctions,
        positionGroups,
        employees
      ] = await Promise.allSettled([
        this.getBusinessFunctions(),
        this.getDepartments(),
        this.getUnits(),
        this.getJobFunctions(),
        this.getPositionGroups(),
        this.getEmployees()
      ]);

      return {
        success: true,
        data: {
          businessFunctions: businessFunctions.status === 'fulfilled' ? businessFunctions.value.data : [],
          departments: departments.status === 'fulfilled' ? departments.value.data : [],
          units: units.status === 'fulfilled' ? units.value.data : [],
          jobFunctions: jobFunctions.status === 'fulfilled' ? jobFunctions.value.data : [],
          positionGroups: positionGroups.status === 'fulfilled' ? positionGroups.value.data : [],
          employees: employees.status === 'fulfilled' ? employees.value.data : []
        },
        errors: {
          businessFunctions: businessFunctions.status === 'rejected' ? businessFunctions.reason : null,
          departments: departments.status === 'rejected' ? departments.reason : null,
          units: units.status === 'rejected' ? units.reason : null,
          jobFunctions: jobFunctions.status === 'rejected' ? jobFunctions.reason : null,
          positionGroups: positionGroups.status === 'rejected' ? positionGroups.reason : null,
          employees: employees.status === 'rejected' ? employees.reason : null
        }
      };
    } catch (error) {
      console.error('Failed to fetch all reference data:', error);
      throw this.handleError(error, 'Failed to fetch reference data');
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, defaultMessage) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        error.message || 
                        defaultMessage;
    
    const errorCode = error.response?.status || 500;
    
    const formattedError = new Error(errorMessage);
    formattedError.status = errorCode;
    formattedError.originalError = error;
    
    return formattedError;
  }
}

// ========================================
// VACANT POSITIONS SERVICE
// ========================================

class VacantPositionsService {
  
  /**
   * Get all vacant positions with filtering and pagination
   */
  async getVacantPositions(params = {}) {
    try {
      const response = await vacantApi.get('/vacant-positions/', { params });
      return {
        success: true,
        data: response.data,
        count: response.data.count,
        results: response.data.results,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: params.page || 1,
          pageSize: params.page_size || 25,
          totalPages: Math.ceil(response.data.count / (params.page_size || 25))
        }
      };
    } catch (error) {
      console.error('Failed to fetch vacant positions:', error);
      throw this.handleError(error, 'Failed to fetch vacant positions');
    }
  }

  /**
   * Get a single vacant position by ID
   */
  async getVacantPositionById(id) {
    try {
      const response = await vacantApi.get(`/vacant-positions/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Failed to fetch vacant position ${id}:`, error);
      throw this.handleError(error, 'Failed to fetch vacant position details');
    }
  }

  /**
   * Create a new vacant position
   */
  async createVacantPosition(vacantPositionData) {
    try {
      const response = await vacantApi.post('/vacant-positions/', vacantPositionData);
      return {
        success: true,
        data: response.data,
        message: 'Vacant position created successfully'
      };
    } catch (error) {
      console.error('Failed to create vacant position:', error);
      throw this.handleError(error, 'Failed to create vacant position');
    }
  }

  /**
   * Update a vacant position
   */
  async updateVacantPosition(id, updateData) {
    try {
      const response = await vacantApi.put(`/vacant-positions/${id}/`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Vacant position updated successfully'
      };
    } catch (error) {
      console.error(`Failed to update vacant position ${id}:`, error);
      throw this.handleError(error, 'Failed to update vacant position');
    }
  }

  /**
   * Delete a vacant position
   */
  async deleteVacantPosition(id) {
    try {
      await vacantApi.delete(`/vacant-positions/${id}/`);
      return {
        success: true,
        message: 'Vacant position deleted successfully'
      };
    } catch (error) {
      console.error(`Failed to delete vacant position ${id}:`, error);
      throw this.handleError(error, 'Failed to delete vacant position');
    }
  }

  /**
   * Convert vacant position to employee
   */
  async convertToEmployee(id, employeeData, document = null, profilePhoto = null) {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add required employee data
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] !== null && employeeData[key] !== undefined && employeeData[key] !== '') {
          formData.append(key, employeeData[key]);
        }
      });

      // Add optional files
      if (document) {
        formData.append('document', document);
      }
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      const response = await vacantApi.post(
        `/vacant-positions/${id}/convert_to_employee/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        employee: response.data.employee,
        message: response.data.message || 'Vacant position converted to employee successfully'
      };
    } catch (error) {
      console.error(`Failed to convert vacant position ${id} to employee:`, error);
      throw this.handleError(error, 'Failed to convert vacant position to employee');
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, defaultMessage) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        error.message || 
                        defaultMessage;
    
    const errorCode = error.response?.status || 500;
    
    const formattedError = new Error(errorMessage);
    formattedError.status = errorCode;
    formattedError.originalError = error;
    
    return formattedError;
  }
}

// ========================================
// ARCHIVE EMPLOYEES SERVICE
// ========================================

class ArchiveEmployeesService {
  
  /**
   * Get archived employees with filtering and pagination
   */
  async getArchivedEmployees(params = {}) {
    try {
      const response = await vacantApi.get('/employees/archived-employees/', { params });
      return {
        success: true,
        data: response.data,
        count: response.data.count,
        results: response.data.results,
        pagination: {
          count: response.data.count,
          page: response.data.page,
          pageSize: response.data.page_size,
          totalPages: response.data.total_pages
        }
      };
    } catch (error) {
      console.error('Failed to fetch archived employees:', error);
      throw this.handleError(error, 'Failed to fetch archived employees');
    }
  }

  /**
   * Bulk restore soft-deleted employees
   */
  async bulkRestoreEmployees(employeeIds, restoreToActive = false) {
    try {
      const requestData = {
        employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds],
        restore_to_active: restoreToActive
      };

      const response = await vacantApi.post('/employees/bulk-restore-employees/', requestData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || `Successfully restored ${employeeIds.length} employee(s)`
      };
    } catch (error) {
      console.error('Failed to restore employees:', error);
      throw this.handleError(error, 'Failed to restore employees');
    }
  }

  /**
   * Bulk soft delete employees with vacancy creation
   */
  async bulkSoftDeleteEmployees(employeeIds, reason = null) {
    try {
      const requestData = {
        employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds]
      };

      if (reason) {
        requestData.reason = reason;
      }

      const response = await vacantApi.post('/employees/bulk-soft-delete-with-vacancies/', requestData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || `Successfully soft deleted ${employeeIds.length} employee(s)`
      };
    } catch (error) {
      console.error('Failed to soft delete employees:', error);
      throw this.handleError(error, 'Failed to soft delete employees');
    }
  }

  /**
   * Bulk hard delete employees with archives (NO VACANCY CREATION)
   */
  async bulkHardDeleteEmployees(employeeIds, notes = null, confirmHardDelete = true) {
    try {
      const requestData = {
        employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds],
        confirm_hard_delete: confirmHardDelete
      };

      if (notes) {
        requestData.notes = notes;
      }

      const response = await vacantApi.post('/employees/bulk-hard-delete-with-archives/', requestData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || `Successfully hard deleted ${employeeIds.length} employee(s)`
      };
    } catch (error) {
      console.error('Failed to hard delete employees:', error);
      throw this.handleError(error, 'Failed to hard delete employees');
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, defaultMessage) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        error.message || 
                        defaultMessage;
    
    const errorCode = error.response?.status || 500;
    
    const formattedError = new Error(errorMessage);
    formattedError.status = errorCode;
    formattedError.originalError = error;
    
    return formattedError;
  }
}

// Create service instances
export const referenceDataService = new ReferenceDataService();
export const vacantPositionsService = new VacantPositionsService();
export const archiveEmployeesService = new ArchiveEmployeesService();

// Export individual services
export { ReferenceDataService, VacantPositionsService, ArchiveEmployeesService };

// Default export
export default {
  referenceData: referenceDataService,
  vacantPositions: vacantPositionsService,
  archive: archiveEmployeesService
};