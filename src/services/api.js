// src/services/api.js - UPDATED: Job Titles endpoint-ləri əlavə edilib
import axios from "axios";

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
  
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },
  
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    }
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },
  
  redirectToLogin: () => {
    TokenManager.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = "/login";
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
    
    // CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRFTOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const newAccessToken = refreshResponse.data.access;
        TokenManager.setTokens(newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        TokenManager.redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // Error handling for different response types
    if (error.response?.status >= 500) {
      let errorData = error.response?.data;
      
      if (errorData instanceof Blob) {
        try {
          const text = await errorData.text();
          errorData = text ? JSON.parse(text) : { message: 'Server error' };
        } catch (blobError) {
          errorData = { message: 'Server error - unable to parse response' };
        }
      }
      
      console.error('Server error:', errorData);
    }

    // Serializable error for Redux
    const serializableError = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    };

    if (error.response?.data) {
      const responseData = error.response.data;
      
      if (responseData instanceof Blob) {
        try {
          const text = await responseData.text();
          serializableError.data = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch (blobError) {
          serializableError.data = { message: 'Error parsing response' };
        }
      } else {
        serializableError.data = responseData;
      }
    }

    return Promise.reject(serializableError);
  }
);


const buildQueryParams = (params = {}) => {

  
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (key === 'ordering' || key === 'sort') {
          if (value.length > 0) {
            const sortString = value.map(sortObj => {
              if (typeof sortObj === 'object' && sortObj.field && sortObj.direction) {
                return sortObj.direction === 'desc' ? `-${sortObj.field}` : sortObj.field;
              }
              return sortObj;
            }).join(',');
            searchParams.append('ordering', sortString);
          }
        } else {
          searchParams.append(key, value.join(','));
        }
      } else if (typeof value === 'object') {
        if (value.from && value.to) {
          searchParams.append(`${key}_from`, value.from);
          searchParams.append(`${key}_to`, value.to);
        } else if (value.min !== null && value.max !== null) {
          searchParams.append(`${key}_min`, value.min);
          searchParams.append(`${key}_max`, value.max);
        } else {
          searchParams.append(key, JSON.stringify(value));
        }
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  const result = searchParams.toString();

  
  return result;
};

// File download helper
const handleFileDownload = async (response, filename) => {
  try {
    if (!response || response.status !== 200) {
      throw new Error('Failed to download file');
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('File download failed:', error);
    throw new Error(`Download failed: ${error.message}`);
  }
};

// API Service
export const apiService = {
  // ========================================
  // AUTH ENDPOINTS
  // ========================================
  login: (credentials) => api.post("/auth/login/", credentials),
  logout: () => api.post("/auth/logout/"),
  refreshToken: (refreshToken) => api.post("/auth/refresh/", { refresh: refreshToken }),

  // ========================================
// Companys
// ========================================
getBusinessFunctions: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/business-functions/?${queryString}`);
},
getBusinessFunction: (id) => api.get(`/business-functions/${id}/`),
createBusinessFunction: (data) => api.post("/business-functions/", data),
updateBusinessFunction: (id, data) => api.put(`/business-functions/${id}/`, data),
deleteBusinessFunction: (id) => api.delete(`/business-functions/${id}/`),

// ========================================
// DEPARTMENTS
// ========================================
getDepartments: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/departments/?${queryString}`);
},
getDepartment: (id) => api.get(`/departments/${id}/`),
createDepartment: (data) => api.post("/departments/", data),
updateDepartment: (id, data) => api.put(`/departments/${id}/`, data),
deleteDepartment: (id) => api.delete(`/departments/${id}/`),
getEmployeeDocuments: (employeeId) => {
  return api.get(`/employees/get-documents/`, {
    params: { employee_id: employeeId }
  });
},

uploadEmployeeDocument: (data) => {
  const formData = new FormData();
  formData.append('employee_id', data.employee_id);
  formData.append('document', data.document_file);
  formData.append('document_name', data.document_name);
  formData.append('document_type', data.document_type);
  
  if (data.description) {
    formData.append('description', data.description);
  }
  if (data.expiry_date) {
    formData.append('expiry_date', data.expiry_date);
  }
  if (data.is_confidential !== undefined) {
    formData.append('is_confidential', data.is_confidential);
  }
  
  return api.post("/employees/upload-document/", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
},

deleteEmployeeDocument: (documentId) => {
  return api.delete(`/employees/delete-document/`, {
    params: { document_id: documentId }
  });
},

downloadEmployeeDocument: async (documentUrl, filename) => {
  try {
    const response = await api.get(documentUrl, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf, application/octet-stream, */*'
      }
    });
    
    // Get content type from response
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Create blob with correct content type
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Ensure filename has correct extension
    let finalFilename = filename;
    if (contentType.includes('pdf') && !filename.toLowerCase().endsWith('.pdf')) {
      finalFilename = `${filename}.pdf`;
    }
    
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Document download failed:', error);
    throw error;
  }
},
// ========================================
// UNITS
// ========================================
getUnits: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/units/?${queryString}`);
},
getUnit: (id) => api.get(`/units/${id}/`),
createUnit: (data) => api.post("/units/", data),
updateUnit: (id, data) => api.put(`/units/${id}/`, data),
deleteUnit: (id) => api.delete(`/units/${id}/`),

// ========================================
// JOB FUNCTIONS
// ========================================
getJobFunctions: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/job-functions/?${queryString}`);
},
getJobFunction: (id) => api.get(`/job-functions/${id}/`),
createJobFunction: (data) => api.post("/job-functions/", data),
updateJobFunction: (id, data) => api.put(`/job-functions/${id}/`, data),
deleteJobFunction: (id) => api.delete(`/job-functions/${id}/`),

// ========================================
// JOB TITLES (NEW)
// ========================================
getJobTitles: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/job-titles/?${queryString}`);
},
getJobTitle: (id) => api.get(`/job-titles/${id}/`),
createJobTitle: (data) => api.post("/job-titles/", data),
updateJobTitle: (id, data) => api.put(`/job-titles/${id}/`, data),
deleteJobTitle: (id) => api.delete(`/job-titles/${id}/`),

// ========================================
// POSITION GROUPS
// ========================================
getPositionGroups: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/position-groups/?${queryString}`);
},
getPositionGroup: (id) => api.get(`/position-groups/${id}/`),
getPositionGroupGradingLevels: (id) => api.get(`/position-groups/${id}/grading_levels/`),
createPositionGroup: (data) => api.post("/position-groups/", data),
updatePositionGroup: (id, data) => api.put(`/position-groups/${id}/`, data),
deletePositionGroup: (id) => api.delete(`/position-groups/${id}/`),

// ========================================
// EMPLOYEE STATUSES
// ========================================
getEmployeeStatuses: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/employee-statuses/?${queryString}`);
},
getEmployeeStatus: (id) => api.get(`/employee-statuses/${id}/`),
createEmployeeStatus: (data) => api.post("/employee-statuses/", data),
updateEmployeeStatus: (id, data) => api.put(`/employee-statuses/${id}/`, data),
deleteEmployeeStatus: (id) => api.delete(`/employee-statuses/${id}/`),

// ========================================
// EMPLOYEE TAGS
// ========================================
getEmployeeTags: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/employee-tags/?${queryString}`);
},
getEmployeeTag: (id) => api.get(`/employee-tags/${id}/`),
createEmployeeTag: (data) => api.post("/employee-tags/", data),
updateEmployeeTag: (id, data) => api.put(`/employee-tags/${id}/`, data),
deleteEmployeeTag: (id) => api.delete(`/employee-tags/${id}/`),

// ========================================
// CONTRACT CONFIGS
// ========================================
getContractConfigs: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params }; //  Add default page_size
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/contract-configs/?${queryString}`);
},
getContractConfig: (id) => api.get(`/contract-configs/${id}/`),
createContractConfig: (data) => api.post("/contract-configs/", data),
updateContractConfig: (id, data) => api.put(`/contract-configs/${id}/`, data),
deleteContractConfig: (id) => api.delete(`/contract-configs/${id}/`),
  // ========================================
  // EMPLOYEES
  // ========================================
  getEmployees: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/?${queryString}`);
  },
  
  getEmployee: (id) => api.get(`/employees/${id}/`),
  
  createEmployee: (data) => {
    if (data instanceof FormData) {
      return api.post("/employees/", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post("/employees/", data);
  },
  
  updateEmployee: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/employees/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/employees/${id}/`, data);
  },

  getEmployeeActivities: (employeeId) => {
    return api.get(`/employees/${employeeId}/`).then(response => ({
      data: response.data.activities || []
    }));
  },

  getEmployeeDirectReports: (employeeId) => api.get(`/employees/${employeeId}/direct_reports/`),

  getEmployeeStatistics: () => api.get("/employees/statistics/"),

  // ========================================
  // ORG CHART VISIBILITY
  // ========================================
  toggleOrgChartVisibility: (employeeId) => api.post("/employees/toggle-org-chart-visibility/", {
    employee_id: employeeId
  }),
  
  bulkToggleOrgChartVisibility: (employeeIds, setVisible) => api.post("/employees/bulk-toggle-org-chart-visibility/", {
    employee_ids: employeeIds,
    set_visible: setVisible
  }),

  // ========================================
  // TAG MANAGEMENT
  // ========================================
  addEmployeeTag: (data) => api.post("/employees/add-tag/", data),
  removeEmployeeTag: (data) => api.post("/employees/remove-tag/", data),
  bulkAddTags: (employeeIds, tagId) => api.post("/employees/bulk-add-tag/", { 
    employee_ids: employeeIds, 
    tag_id: tagId 
  }),
  bulkRemoveTags: (employeeIds, tagId) => api.post("/employees/bulk-remove-tag/", { 
    employee_ids: employeeIds, 
    tag_id: tagId 
  }),

  // ========================================
  // LINE MANAGER MANAGEMENT
  // ========================================
  assignLineManager: (data) => api.post("/employees/assign-line-manager/", data),
  bulkAssignLineManager: (data) => api.post("/employees/bulk-assign-line-manager/", data),



exportEmployees: async (format = 'excel', params = {}) => {
  try {

    //  Build POST body payload
    const payload = {
      export_format: format === 'csv' ? 'csv' : 'excel'
    };
    
    //  Handle employee_ids
    if (params.employee_ids && Array.isArray(params.employee_ids) && params.employee_ids.length > 0) {
      const validIds = params.employee_ids
        .map(id => {
          if (typeof id === 'string') return parseInt(id, 10);
          if (typeof id === 'number') return id;
          return null;
        })
        .filter(id => id !== null && id > 0);
      
      if (validIds.length > 0) {
        payload.employee_ids = validIds;
      }
    }
    
    //  Handle include_fields
    if (params.include_fields && Array.isArray(params.include_fields) && params.include_fields.length > 0) {
      const validFields = params.include_fields
        .filter(field => field && typeof field === 'string' && field.trim())
        .map(field => field.trim());
      
      if (validFields.length > 0) {
        payload.include_fields = validFields;
      }
    }
    
    //  Build query params from _filterParams OR directly spread filter keys
    let queryParams = {};

    // Keys that are not filter params (handled separately)
    const SPECIAL_KEYS = new Set([
      'export_format', 'employee_ids', 'include_fields',
      '_filterParams', '_queryParams',
      'page', 'page_size', 'use_pagination'
    ]);

    const processFilterParams = (filterObj) => {
      Object.entries(filterObj).forEach(([key, value]) => {
        if (SPECIAL_KEYS.has(key)) return;
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            const cleanValues = value.filter(v => v !== null && v !== undefined && v !== '');
            if (cleanValues.length > 0) {
              queryParams[key] = cleanValues.join(',');
            }
          } else {
            queryParams[key] = value;
          }
        }
      });
    };

    if (params._filterParams && typeof params._filterParams === 'object') {
      // Explicit _filterParams object
      processFilterParams(params._filterParams);
    } else {
      // Filter params spread directly into params (from employeeAPI.export via _queryParams spread)
      processFilterParams(params);
    }
    
    //  Build query string
    const queryString = buildQueryParams(queryParams);
    const endpoint = `/employees/export_selected/${queryString ? `?${queryString}` : ''}`;
    

    
    //  Make API call
    const response = await api.post(endpoint, payload, {
      responseType: 'blob',
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    //  Handle file download
    if (response && response.data && response.data.size > 0) {
      const blob = new Blob([response.data], { 
        type: format === 'csv' 
          ? 'text/csv' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      let filename = `employees_export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      
      // Try to get filename from response headers
      const contentDisposition = response.headers?.['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
   
      
      return {
        success: true,
        filename: filename,
        format: format,
        employeeCount: payload.employee_ids?.length || 'filtered/all',
        fieldsCount: payload.include_fields?.length || 'default',
        filtersApplied: Object.keys(queryParams).length
      };
    } else {
      throw new Error('No data received from server');
    }
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    
    let errorMessage = 'Export failed. Please try again.';
    
    // Handle blob error response
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch (e) {
        console.error('Could not parse blob error:', e);
      }
    } else if (error.response?.data) {
      if (typeof error.response.data === 'object') {
        errorMessage = error.response.data.error || error.response.data.detail || errorMessage;
      }
    }
    
    // Status code specific messages
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          if (!errorMessage.includes('Invalid') && !errorMessage.includes('field')) {
            errorMessage = 'Bad Request: Please check your selection and try again.';
          }
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to export employees.';
          break;
        case 404:
          errorMessage = 'Export endpoint not found.';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later.';
          break;
      }
    }
    
    throw new Error(errorMessage);
  }
},

  downloadEmployeeTemplate: async () => {
    try {
      const response = await api.get("/bulk-upload/download_template/", {
        responseType: 'blob'
      });
      
      const filename = 'employee_template.xlsx';
      await handleFileDownload(response, filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Template download failed:', error);
      throw error;
    }
  },

  // ========================================
  // BULK UPLOAD
  // ========================================
  bulkUploadEmployees: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      return await api.post("/bulk-upload/", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Bulk upload failed:', error);
      throw error;
    }
  },



  // ========================================
  // PROFILE IMAGES
  // ========================================
  uploadProfileImage: (employeeId, file) => {
    const formData = new FormData();
    formData.append('employee_id', employeeId);
    formData.append('profile_image', file);
    
    return api.post("/profile-images/upload/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteProfileImage: (employeeId) => api.post("/profile-images/delete/", { employee_id: employeeId }),

// ========================================
// EMPLOYMENT TYPES
// ========================================
getEmploymentTypes: (params = {}) => {
  const defaultParams = { page_size: 1000, ...params };
  const queryString = buildQueryParams(defaultParams);
  return api.get(`/employment-types/?${queryString}`);
},
getEmploymentType: (id) => api.get(`/employment-types/${id}/`),
createEmploymentType: (data) => api.post('/employment-types/', data),
updateEmploymentType: (id, data) => api.put(`/employment-types/${id}/`, data),
deleteEmploymentType: (id) => api.delete(`/employment-types/${id}/`),

  // ========================================
  // ADVANCED SEARCH & FILTERING
  // ========================================
  searchEmployeesAdvanced: (searchParams = {}) => {
    const processedParams = {
      search: searchParams.search,
      employee_search: searchParams.employee_search,
      line_manager_search: searchParams.line_manager_search,
      job_title_search: searchParams.job_title_search,
      business_function: searchParams.business_function,
      department: searchParams.department,
      unit: searchParams.unit,
      job_function: searchParams.job_function,
      position_group: searchParams.position_group,
      status: searchParams.status,
      grading_level: searchParams.grading_level,
      contract_duration: searchParams.contract_duration,
      line_manager: searchParams.line_manager,
      tags: searchParams.tags,
      gender: searchParams.gender,
      start_date_from: searchParams.start_date_range?.from,
      start_date_to: searchParams.start_date_range?.to,
      contract_end_date_from: searchParams.contract_end_date_range?.from,
      contract_end_date_to: searchParams.contract_end_date_range?.to,
      years_of_service_min: searchParams.years_of_service_range?.min,
      years_of_service_max: searchParams.years_of_service_range?.max,
      is_active: searchParams.is_active,
      is_visible_in_org_chart: searchParams.is_visible_in_org_chart,
      is_deleted: searchParams.is_deleted,
    
   
      ordering: searchParams.sorting || searchParams.ordering,
      page: searchParams.page,
      page_size: searchParams.page_size
    };

    return apiService.getEmployees(processedParams);
  },

  buildSortingParams: (sortingArray) => {
    if (!Array.isArray(sortingArray) || sortingArray.length === 0) {
      return '';
    }
    
    return sortingArray.map(sort => {
      if (typeof sort === 'object' && sort.field && sort.direction) {
        return sort.direction === 'desc' ? `-${sort.field}` : sort.field;
      } else if (typeof sort === 'string') {
        return sort;
      }
      return '';
    }).filter(Boolean).join(',');
  },

  applyFilterPreset: (presetName, additionalParams = {}) => {
    const presets = {
      'active_employees': { status: ['ACTIVE'], is_active: true },
      'new_hires': { years_of_service_range: { min: 0, max: 0.25 } },
      'probation_employees': { status: ['PROBATION'] },
      'onboarding_employees': { status: ['ONBOARDING'] },
      'on_leave': { status: ['ON_LEAVE'] },
      'no_line_manager': { line_manager: null },
      'needs_grading': { grading_level: [] },
      'org_chart_visible': { is_visible_in_org_chart: true },
      'org_chart_hidden': { is_visible_in_org_chart: false }
    };

    const presetParams = presets[presetName] || {};
    return apiService.searchEmployeesAdvanced({ ...presetParams, ...additionalParams });
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  get: (endpoint, params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  },

  post: (endpoint, data, options = {}) => {
    return api.post(endpoint, data, options);
  },

  put: (endpoint, data, options = {}) => {
    return api.put(endpoint, data, options);
  },

  delete: (endpoint, options = {}) => {
    return api.delete(endpoint, options);
  },

  uploadFile: (endpoint, file, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

// DÜZƏLDİLMİŞ
signEmployeeDocument: (documentId, { signature_base64, signature_method, signed_at, normalised, signature_position }) => {
  return api.post('/employees/sign-document/', {
    document_id:        documentId,
    signature_base64,
    signature_method,
    signed_at,
    normalised,           // ← əlavə et
    signature_position,   // ← əlavə et
  });
},

downloadSignedDocument: async (documentId, filename, opts = {}) => {
  const params = new URLSearchParams({ document_id: documentId });
  if (opts.page       !== undefined) params.set("page",       opts.page);
  if (opts.pdf_width  !== undefined) params.set("pdf_width",  opts.pdf_width);
  if (opts.pdf_height !== undefined) params.set("pdf_height", opts.pdf_height);

  const response = await api.get(
    `/employees/download-signed-document/?${params}`,
    { responseType: "blob" }
  );

  const mime = response.headers["content-type"] || "application/octet-stream";
  const blob = new Blob([response.data], { type: mime });
  const url  = window.URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), {
    href: url, download: filename || "document.pdf"
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return { success: true };
},


  downloadFile: async (endpoint, filename, params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`, {
        responseType: 'blob'
      });
      
      await handleFileDownload(response, filename);
      return response;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  // ========================================
  // BATCH OPERATIONS
  // ========================================
  batchOperation: async (operation, employeeIds, data = {}) => {
    const operations = {
      'delete': () => apiService.softDeleteEmployees(employeeIds),
      'add_tag': (tagId) => apiService.bulkAddTags(employeeIds, tagId),
      'remove_tag': (tagId) => apiService.bulkRemoveTags(employeeIds, tagId),
      'assign_manager': (managerId) => apiService.bulkAssignLineManager({
        employee_ids: employeeIds,
        line_manager_id: managerId
      }),
   
      'show_in_org_chart': () => apiService.bulkToggleOrgChartVisibility(employeeIds, true),
      'hide_from_org_chart': () => apiService.bulkToggleOrgChartVisibility(employeeIds, false),
     
    };

    const operationFn = operations[operation];
    if (!operationFn) {
      throw new Error(`Unknown batch operation: ${operation}`);
    }

    if (operation === 'add_tag' || operation === 'remove_tag') {
      return operationFn(data.tagId);
    } else if (operation === 'assign_manager') {
      return operationFn(data.managerId);
    } else if (operation === 'update_grades') {
      return operationFn(data.updates);
    } else {
      return operationFn();
    }
  }
};

export default api;
export { TokenManager };