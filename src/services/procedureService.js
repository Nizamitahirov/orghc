// services/procedureService.js

import axios from 'axios';

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
  (error) => {
    return Promise.reject(error);
  }
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

// ==================== PROCEDURE CRUD ====================

export const getAllProcedures = async (params = {}) => {
  try {
    const response = await api.get('/procedures/procedures/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProcedureDetail = async (id) => {
  try {
    const response = await api.get(`/procedures/procedures/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createProcedure = async (procedureData) => {
  try {
    const formData = new FormData();
    
    Object.keys(procedureData).forEach((key) => {
      if (procedureData[key] !== null && procedureData[key] !== undefined) {
        formData.append(key, procedureData[key]);
      }
    });
    
    const response = await api.post('/procedures/procedures/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProcedure = async (id, procedureData) => {
  try {
    const formData = new FormData();
    
    Object.keys(procedureData).forEach((key) => {
      if (procedureData[key] !== null && procedureData[key] !== undefined) {
        formData.append(key, procedureData[key]);
      }
    });
    
    const response = await api.put(`/procedures/procedures/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const partialUpdateProcedure = async (id, procedureData) => {
  try {
    const formData = new FormData();
    
    Object.keys(procedureData).forEach((key) => {
      if (procedureData[key] !== null && procedureData[key] !== undefined) {
        formData.append(key, procedureData[key]);
      }
    });
    
    const response = await api.patch(`/procedures/procedures/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteProcedure = async (id) => {
  try {
    const response = await api.delete(`/procedures/procedures/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== PROCEDURE FOLDERS ====================

export const getAllFolders = async (params = {}) => {
  try {
    const response = await api.get('/procedures/procedure-folders/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getFolderDetail = async (id) => {
  try {
    const response = await api.get(`/procedures/procedure-folders/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createFolder = async (folderData) => {
  try {
    const response = await api.post('/procedures/procedure-folders/', folderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateFolder = async (id, folderData) => {
  try {
    const response = await api.put(`/procedures/procedure-folders/${id}/`, folderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteFolder = async (id) => {
  try {
    const response = await api.delete(`/procedures/procedure-folders/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getFoldersByCompany = async (companyType, companyId) => {
  try {
    const response = await api.get(
      `/procedures/procedure-folders/by-company/${companyType}/${companyId}/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProceduresInFolder = async (folderId) => {
  try {
    const response = await api.get(`/procedures/procedure-folders/${folderId}/procedures/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== PROCEDURE ACTIONS ====================

export const getProceduresByFolder = async (folderId) => {
  try {
    const response = await api.get(`/procedures/procedures/by-folder/${folderId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const trackProcedureView = async (procedureId) => {
  try {
    const response = await api.post(`/procedures/procedures/${procedureId}/view/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const trackProcedureDownload = async (procedureId) => {
  try {
    const response = await api.post(`/procedures/procedures/${procedureId}/download/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== PROCEDURE COMPANIES ====================

export const getAllProcedureCompanies = async (params = {}) => {
  try {
    const response = await api.get('/procedures/procedure-companies/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProcedureCompanyDetail = async (id) => {
  try {
    const response = await api.get(`/procedures/procedure-companies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createProcedureCompany = async (companyData) => {
  try {
    const response = await api.post('/procedures/procedure-companies/', companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProcedureCompany = async (id, companyData) => {
  try {
    const response = await api.patch(`/procedures/procedure-companies/${id}/`, companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteProcedureCompany = async (id) => {
  try {
    const response = await api.delete(`/procedures/procedure-companies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ALL COMPANIES (Combined BF + Manual) ====================

export const getAllCompanies = async () => {
  try {
    const response = await api.get('/procedures/all-companies/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== STATISTICS ====================

export const getProcedureStatisticsOverview = async () => {
  try {
    const response = await api.get('/procedures/procedure-statistics/overview/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const downloadProcedureFile = (fileUrl, filename) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const validatePDFFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
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
  getAllProcedures,
  getProcedureDetail,
  createProcedure,
  updateProcedure,
  partialUpdateProcedure,
  deleteProcedure,
  
  getAllFolders,
  getFolderDetail,
  createFolder,
  updateFolder,
  deleteFolder,
  getFoldersByCompany,
  getProceduresInFolder,
  
  getProceduresByFolder,
  trackProcedureView,
  trackProcedureDownload,
  
  getAllProcedureCompanies,
  getProcedureCompanyDetail,
  createProcedureCompany,
  updateProcedureCompany,
  deleteProcedureCompany,
  
  getAllCompanies,
  
  getProcedureStatisticsOverview,
  
  downloadProcedureFile,
  formatFileSize,
  validatePDFFile,
};