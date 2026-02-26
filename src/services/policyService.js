// services/policyService.js

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ✅ Token Manager (performanceService.js kimi)
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

// ✅ Request Interceptor
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

// ✅ Response Interceptor (401 xətası üçün)
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


// ==================== POLICY CRUD ====================

/**
 * Get all policies with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getAllPolicies = async (params = {}) => {
  try {
    const response = await api.get('/policies/policies/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single policy details
 * @param {number} id - Policy ID
 * @returns {Promise}
 */
export const getPolicyDetail = async (id) => {
  try {
    const response = await api.get(`/policies/policies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new policy with PDF file
 * @param {Object} policyData - Policy data including file
 * @returns {Promise}
 */
export const createPolicy = async (policyData) => {
  try {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(policyData).forEach((key) => {
      if (policyData[key] !== null && policyData[key] !== undefined) {
        formData.append(key, policyData[key]);
      }
    });
    
    const response = await api.post('/policies/policies/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update existing policy
 * @param {number} id - Policy ID
 * @param {Object} policyData - Updated policy data
 * @returns {Promise}
 */
export const updatePolicy = async (id, policyData) => {
  try {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(policyData).forEach((key) => {
      if (policyData[key] !== null && policyData[key] !== undefined) {
        formData.append(key, policyData[key]);
      }
    });
    
    const response = await api.put(`/policies/policies/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Partially update policy
 * @param {number} id - Policy ID
 * @param {Object} policyData - Partial policy data
 * @returns {Promise}
 */
export const partialUpdatePolicy = async (id, policyData) => {
  try {
    const formData = new FormData();
    
    Object.keys(policyData).forEach((key) => {
      if (policyData[key] !== null && policyData[key] !== undefined) {
        formData.append(key, policyData[key]);
      }
    });
    
    const response = await api.patch(`/policies/policies/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete policy
 * @param {number} id - Policy ID
 * @returns {Promise}
 */
export const deletePolicy = async (id) => {
  try {
    const response = await api.delete(`/policies/policies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== POLICY FOLDERS ====================

/**
 * Get all policy folders
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getAllFolders = async (params = {}) => {
  try {
    const response = await api.get('/policies/policy-folders/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get folder details
 * @param {number} id - Folder ID
 * @returns {Promise}
 */
export const getFolderDetail = async (id) => {
  try {
    const response = await api.get(`/policies/policy-folders/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new folder
 * @param {Object} folderData - Folder data
 * @returns {Promise}
 */
export const createFolder = async (folderData) => {
  try {
    const response = await api.post('/policies/policy-folders/', folderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update folder
 * @param {number} id - Folder ID
 * @param {Object} folderData - Updated folder data
 * @returns {Promise}
 */
export const updateFolder = async (id, folderData) => {
  try {
    const response = await api.put(`/policies/policy-folders/${id}/`, folderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete folder
 * @param {number} id - Folder ID
 * @returns {Promise}
 */
export const deleteFolder = async (id) => {
  try {
    const response = await api.delete(`/policies/policy-folders/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get folders by business function
 * @param {number} bfId - Business function ID
 * @returns {Promise}
 */
export const getFoldersByBusinessFunction = async (bfId) => {
  try {
    const response = await api.get(`/policies/policy-folders/by-business-function/${bfId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get policies in folder
 * @param {number} folderId - Folder ID
 * @returns {Promise}
 */
export const getPoliciesInFolder = async (folderId) => {
  try {
    const response = await api.get(`/policies/policy-folders/${folderId}/policies/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get folder statistics
 * @param {number} folderId - Folder ID
 * @returns {Promise}
 */
export const getFolderStatistics = async (folderId) => {
  try {
    const response = await api.get(`/policies/policy-folders/${folderId}/statistics/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== POLICY ACTIONS ====================

/**
 * Get policies by folder
 * @param {number} folderId - Folder ID
 * @returns {Promise}
 */
export const getPoliciesByFolder = async (folderId) => {
  try {
    const response = await api.get(`/policies/policies/by-folder/${folderId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track policy view
 * @param {number} policyId - Policy ID
 * @returns {Promise}
 */
export const trackPolicyView = async (policyId) => {
  try {
    const response = await api.post(`/policies/policies/${policyId}/view/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track policy download
 * @param {number} policyId - Policy ID
 * @returns {Promise}
 */
export const trackPolicyDownload = async (policyId) => {
  try {
    const response = await api.post(`/policies/policies/${policyId}/download/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



/**
 * Acknowledge policy
 * @param {number} policyId - Policy ID
 * @param {string} notes - Optional notes
 * @returns {Promise}
 */
export const acknowledgePolicy = async (policyId, notes = '') => {
  try {
    const response = await api.post(`/policies/policies/${policyId}/acknowledge/`, { notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get policy acknowledgments
 * @param {number} policyId - Policy ID
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getPolicyAcknowledgments = async (policyId, params = {}) => {
  try {
    const response = await api.get(`/policies/policies/${policyId}/acknowledgments/`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};






// ==================== BUSINESS FUNCTIONS ====================

/**
 * Get all business functions with policies
 * @returns {Promise}
 */
export const getBusinessFunctionsWithPolicies = async () => {
  try {
    const response = await api.get('/policies/business-functions-policies/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get business function policies detail
 * @param {number} id - Business function ID
 * @returns {Promise}
 */
export const getBusinessFunctionPoliciesDetail = async (id) => {
  try {
    const response = await api.get(`/policies/business-functions-policies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get business functions with statistics
 * @returns {Promise}
 */
export const getBusinessFunctionsWithStats = async () => {
  try {
    const response = await api.get('/policies/business-functions-policies/with_stats/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== STATISTICS ====================

/**
 * Get policy statistics overview
 * @returns {Promise}
 */
export const getPolicyStatisticsOverview = async () => {
  try {
    const response = await api.get('/policies/policy-statistics/overview/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get statistics by business function
 * @returns {Promise}
 */
export const getStatisticsByBusinessFunction = async () => {
  try {
    const response = await api.get('/policies/policy-statistics/by_business_function/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get most viewed policies
 * @param {number} limit - Number of policies to return
 * @returns {Promise}
 */
export const getMostViewedPolicies = async (limit = 10) => {
  try {
    const response = await api.get('/policies/policy-statistics/most_viewed/', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get most downloaded policies
 * @param {number} limit - Number of policies to return
 * @returns {Promise}
 */
export const getMostDownloadedPolicies = async (limit = 10) => {
  try {
    const response = await api.get('/policies/policy-statistics/most_downloaded/', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get acknowledgment status statistics
 * @returns {Promise}
 */
export const getAcknowledgmentStatus = async () => {
  try {
    const response = await api.get('/policies/policy-statistics/acknowledgment_status/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


/**
 * Get all policy companies
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getAllPolicyCompanies = async (params = {}) => {
  try {
    const response = await api.get('/policies/policy-companies/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get policy company detail
 * @param {number} id - Company ID
 * @returns {Promise}
 */
export const getPolicyCompanyDetail = async (id) => {
  try {
    const response = await api.get(`/policies/policy-companies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new policy company
 * @param {Object} companyData - Company data
 * @returns {Promise}
 */
export const createPolicyCompany = async (companyData) => {
  try {
    const response = await api.post('/policies/policy-companies/', companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update policy company
 * @param {number} id - Company ID
 * @param {Object} companyData - Updated company data
 * @returns {Promise}
 */
export const updatePolicyCompany = async (id, companyData) => {
  try {
    const response = await api.patch(`/policies/policy-companies/${id}/`, companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete policy company
 * @param {number} id - Company ID
 * @returns {Promise}
 */
export const deletePolicyCompany = async (id) => {
  try {
    const response = await api.delete(`/policies/policy-companies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ALL COMPANIES (Combined BF + Manual) ====================

/**
 * Get all companies (Business Functions + Manual Companies)
 * @returns {Promise}
 */
export const getAllCompanies = async () => {
  try {
    const response = await api.get('/policies/all-companies/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get folders by company (supports both types)
 * @param {string} companyType - 'business_function' or 'policy_company'
 * @param {number} companyId - Company ID
 * @returns {Promise}
 */
export const getFoldersByCompany = async (companyType, companyId) => {
  try {
    const response = await api.get(
      `/policies/policy-folders/by-company/${companyType}/${companyId}/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
// ==================== UTILITY FUNCTIONS ====================

/**
 * Download policy file
 * @param {string} fileUrl - Policy file URL
 * @param {string} filename - Desired filename
 */
export const downloadPolicyFile = (fileUrl, filename) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate PDF file
 * @param {File} file - File to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validatePDFFile = (file) => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  // Check file type
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 10MB (current: ${formatFileSize(file.size)})`,
    };
  }
  
  return { valid: true, error: null };
};

export default {
  // CRUD
  getAllPolicies,
  getPolicyDetail,
  createPolicy,
  updatePolicy,
  partialUpdatePolicy,
  deletePolicy,
  
  // Folders
  getAllFolders,
  getFolderDetail,
  createFolder,
  updateFolder,
  deleteFolder,
  getFoldersByBusinessFunction,
  getPoliciesInFolder,
  getFolderStatistics,
  
  // Actions
  getPoliciesByFolder,
  trackPolicyView,
  trackPolicyDownload,

  acknowledgePolicy,
  getPolicyAcknowledgments,

  
  // Business Functions
  getBusinessFunctionsWithPolicies,
  getBusinessFunctionPoliciesDetail,
  getBusinessFunctionsWithStats,
  
  // Statistics
  getPolicyStatisticsOverview,
  getStatisticsByBusinessFunction,
  getMostViewedPolicies,
  getMostDownloadedPolicies,
  getAcknowledgmentStatus,
  
  // Utilities
  downloadPolicyFile,
getAllPolicyCompanies,
  getPolicyCompanyDetail,
  createPolicyCompany,
  updatePolicyCompany,
  deletePolicyCompany,
  
  // Combined Companies
  getAllCompanies,
  getFoldersByCompany,
  formatFileSize,
  validatePDFFile,
};