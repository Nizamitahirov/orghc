// src/services/assetService.js - COMPLETE WITH ALL ENDPOINTS
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ==================== TOKEN MANAGER ====================
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

// ==================== INTERCEPTORS ====================
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

// ==================== CATEGORY SERVICE ====================
export const categoryService = {
  getCategories: async (params = {}) => {
    const response = await api.get('/assets/categories/', { params });
    return response.data;
  },
  getCategory: async (id) => {
    const response = await api.get(`/assets/categories/${id}/`);
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/assets/categories/', categoryData);
    return response.data;
  },
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/assets/categories/${id}/`, categoryData);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/assets/categories/${id}/`);
    return response.data;
  },
  getCategoryStatistics: async (id) => {
    const response = await api.get(`/assets/categories/${id}/statistics/`);
    return response.data;
  }
};

// ==================== BATCH SERVICE ====================
export const batchService = {
  getBatches: async (params = {}) => {
    const response = await api.get('/assets/batches/', { params });
    return response.data;
  },
  getBatch: async (id) => {
    const response = await api.get(`/assets/batches/${id}/`);
    return response.data;
  },
  createBatch: async (batchData) => {
    const response = await api.post('/assets/batches/', batchData);
    return response.data;
  },
  updateBatch: async (id, batchData) => {
    const response = await api.put(`/assets/batches/${id}/`, batchData);
    return response.data;
  },
  deleteBatch: async (id) => {
    const response = await api.delete(`/assets/batches/${id}/`);
    return response.data;
  },
  createAssetsFromBatch: async (batchId, data) => {
    const response = await api.post(`/assets/batches/${batchId}/create-assets/`, data);
    return response.data;
  },
  getBatchAssets: async (batchId) => {
    const response = await api.get(`/assets/batches/${batchId}/assets/`);
    return response.data;
  },
  getBatchStatistics: async () => {
    const response = await api.get('/assets/batches/statistics/');
    return response.data;
  }
};

// ==================== ASSET SERVICE ====================
export const assetService = {
  getAssets: async (params = {}) => {
    const response = await api.get('/assets/assets/', { params });
    return response.data;
  },
  
  getAsset: async (id) => {
    const response = await api.get(`/assets/assets/${id}/`);
    return response.data;
  },
  
  // 🎯 Asset yaratma - batch_id tələb olunur
  createAsset: async (assetData) => {
    const payload = {
      batch_id: assetData.batch_id || assetData.batch,
      serial_number: assetData.serial_number
    };
    
    console.log('🎯 Creating asset with payload:', payload);
    const response = await api.post('/assets/assets/', payload);
    return response.data;
  },
  
  updateAsset: async (id, assetData) => {
    const response = await api.put(`/assets/assets/${id}/`, assetData);
    return response.data;
  },
  
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/assets/${id}/`);
    return response.data;
  },
  
  // 🎯 Assign asset - backend endpoint-inə uyğun
  assignToEmployee: async (assignmentData) => {
    const payload = {
      asset_ids: Array.isArray(assignmentData.asset_ids) 
        ? assignmentData.asset_ids 
        : [assignmentData.asset],
      employee_id: assignmentData.employee_id || assignmentData.employee,
      check_out_date: assignmentData.check_out_date,
      check_out_notes: assignmentData.check_out_notes || '',
      condition_on_checkout: assignmentData.condition_on_checkout || 'GOOD'
    };
    
    console.log('🎯 Assignment payload:', payload);
    const response = await api.post('/assets/assets/assign-to-employee/', payload);
    return response.data;
  },
  
  // Alias method - köhnə kodla uyğunluq üçün
  assignAsset: async (assetId, assignmentData) => {
    return await assetService.assignToEmployee({
      ...assignmentData,
      asset: assetId
    });
  },
  
  // 🎯 Employee actions
  acceptAsset: async (data) => {
    const response = await api.post('/assets/assets/accept-assignment/', data);
    return response.data;
  },
  
  requestClarification: async (data) => {
    const response = await api.post('/assets/assets/request-clarification/', data);
    return response.data;
  },
  
  provideClarification: async (data) => {
    const response = await api.post('/assets/assets/provide-clarification/', data);
    return response.data;
  },
  
  // 🎯 Assignment history
  getAssignments: async (params = {}) => {
    const response = await api.get('/assets/assets/assignments/', { params });
    return response.data;
  },
  
  getAssignmentHistory: async (id) => {
    const response = await api.get(`/assets/assets/${id}/assignment-history/`);
    return response.data;
  },
  
  // 🎯 Activities
  getAssetActivities: async (id) => {
    const response = await api.get(`/assets/assets/${id}/activities/`);
    return response.data;
  },
  
  getMyAssets: async () => {
    const response = await api.get('/assets/assets/my-assets/');
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get('/assets/assets/statistics/');
    return response.data;
  },
  
  getAccessInfo: async () => {
    const response = await api.get('/assets/assets/access-info/');
    return response.data;
  },
  
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/assets/assets/bulk-upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  exportAssets: async (exportData) => {
    const response = await api.post('/assets/assets/export/', exportData, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // 🎯 Export assignments
  exportAssignments: async (params = {}) => {
    const response = await api.post('/assets/assets/assignments/export/', params, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// ==================== OFFBOARDING SERVICE - UPDATED ====================
export const offboardingService = {
  getOffboardings: async (params = {}) => {
    const response = await api.get('/assets/offboarding/', { params });
    return response.data;
  },
  
  getOffboarding: async (id) => {
    const response = await api.get(`/assets/offboarding/${id}/`);
    return response.data;
  },
  
  // 🆕 UPDATED: Offboarding with type
  initiateOffboarding: async (data) => {
    const payload = {
      employee_id: data.employee_id,
      last_working_day: data.last_working_day,
      offboarding_type: data.offboarding_type || 'RETURN', // TRANSFER or RETURN
      notes: data.notes || ''
    };
    
    const response = await api.post('/assets/offboarding/initiate/', payload);
    return response.data;
  },
  
  getOffboardingAssets: async (offboardingId) => {
    const response = await api.get(`/assets/offboarding/${offboardingId}/assets/`);
    return response.data;
  },
  
  // 🆕 NEW: Complete handover (IT only)
  completeHandover: async (offboardingId) => {
    const response = await api.post(`/assets/offboarding/${offboardingId}/complete-handover/`);
    return response.data;
  },
  
  // Alias for backward compatibility
  completeOffboarding: async (offboardingId) => {
    return await offboardingService.completeHandover(offboardingId);
  },
  
  cancelOffboarding: async (offboardingId, reason) => {
    const response = await api.post(`/assets/offboarding/${offboardingId}/cancel/`, { reason });
    return response.data;
  }
};

// ==================== TRANSFER SERVICE - UPDATED ====================
export const transferService = {
  getTransfers: async (params = {}) => {
    const response = await api.get('/assets/transfers/', { params });
    return response.data;
  },
  
  getTransfer: async (id) => {
    const response = await api.get(`/assets/transfers/${id}/`);
    return response.data;
  },
  
  // 🆕 UPDATED: Create transfer (Admin/IT only)
  createTransfer: async (data) => {
    const payload = {
      asset_id: data.asset_id,
      to_employee_id: data.to_employee_id,
      transfer_notes: data.transfer_notes || ''
    };
    
    const response = await api.post('/assets/transfers/create/', payload);
    return response.data;
  },
  
  employeeApproveTransfer: async (transferId, data) => {
    const payload = {
      approved: data.approved,
      comments: data.comments || ''
    };
    
    const response = await api.post(`/assets/transfers/${transferId}/employee-approve/`, payload);
    return response.data;
  },
  
  // 🆕 NEW: Get my pending transfers
  getMyPendingTransfers: async () => {
    const response = await api.get('/assets/transfers/my-pending/');
    return response.data;
  },
  
  getOffboardingTransfers: async (offboardingId) => {
    const response = await api.get('/assets/transfers/', {
      params: { offboarding_id: offboardingId }
    });
    return response.data;
  },
  
  // Deprecated - use employeeApproveTransfer instead
  approveTransfer: async (transferId, data) => {
    console.warn('⚠️ approveTransfer is deprecated, use employeeApproveTransfer instead');
    return await transferService.employeeApproveTransfer(transferId, data);
  }
};

// ==================== EMPLOYEE SERVICE - UPDATED ====================
export const employeeService = {
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees/', { params });
    return response.data;
  },
  
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}/`);
    return response.data;
  },
  
  searchEmployees: async (searchTerm) => {
    const response = await api.get('/employees/', { 
      params: { search: searchTerm, page_size: 50 } 
    });
    return response.data;
  },
  
  // 🎯 UPDATED: Enhanced employee assets endpoint
  getEmployeeAssets: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/assets/`);
    return response.data;
  },
  
  // 🆕 NEW: Employee accept asset
  acceptAsset: async (employeeId, data) => {
    const payload = {
      asset_id: data.asset_id,
      comments: data.comments || ''
    };
    
    const response = await api.post(`/employees/${employeeId}/accept-asset/`, payload);
    return response.data;
  },
  
  // 🆕 NEW: Employee request clarification
  requestAssetClarification: async (employeeId, data) => {
    const payload = {
      asset_id: data.asset_id,
      clarification_reason: data.clarification_reason
    };
    
    const response = await api.post(`/employees/${employeeId}/request-asset-clarification/`, payload);
    return response.data;
  }
};

// ==================== EMPLOYEE ASSET SERVICE - UPDATED ====================
export const employeeAssetService = {
  // 🎯 Admin/Manager actions
  provideClarification: async (employeeId, data) => {
    const payload = {
      asset_id: data.asset_id,
      clarification_response: data.clarification_response
    };
    
    const response = await api.post(`/employees/${employeeId}/provide-clarification/`, payload);
    return response.data;
  },
  
  cancelAssignment: async (employeeId, data) => {
    const payload = {
      asset_id: data.asset_id,
      cancellation_reason: data.cancellation_reason || ''
    };
    
    const response = await api.post(`/employees/${employeeId}/cancel-assignment/`, payload);
    return response.data;
  }
};

// ==================== HELPER FUNCTIONS ====================
export const getAssetStatusColor = (status) => {
  const colors = {
    'IN_STOCK': '#6B7280',
    'ASSIGNED': '#F59E0B',
    'IN_USE': '#10B981',
    'NEED_CLARIFICATION': '#8B5CF6',
    'IN_REPAIR': '#EF4444',
    'OUT_OF_STOCK': '#DC2626',
    'ARCHIVED': '#7F1D1D',
  };
  return colors[status] || '#6B7280';
};

export const getAssetStatusDisplay = (status) => {
  const displays = {
    'IN_STOCK': 'Anbarda',
    'ASSIGNED': 'Təyin edilib (Təsdiq gözlənilir)',
    'IN_USE': 'İstifadədə',
    'NEED_CLARIFICATION': 'Aydınlaşdırma lazımdır',
    'IN_REPAIR': 'Təmirdə',
    'OUT_OF_STOCK': 'Xarab/İtirilmiş',
    'ARCHIVED': 'Arxivləşdirilmiş',
  };
  return displays[status] || status;
};

export const getBatchStatusColor = (status) => {
  const colors = {
    'ACTIVE': '#10B981',
    'OUT_OF_STOCK': '#DC2626',
    'ARCHIVED': '#6B7280',
  };
  return colors[status] || '#6B7280';
};

export const getOffboardingTypeDisplay = (type) => {
  const displays = {
    'TRANSFER': 'Transfer to Another Employee',
    'RETURN': 'Return to IT'
  };
  return displays[type] || type;
};

export const formatQuantitySummary = (quantitySummary) => {
  if (!quantitySummary) return null;
  
  return {
    total: quantitySummary.initial,
    available: quantitySummary.available,
    assigned: quantitySummary.assigned,
    outOfStock: quantitySummary.out_of_stock,
    usageRate: quantitySummary.percentage_available,
    displayText: `${quantitySummary.available}/${quantitySummary.initial} mövcuddur`
  };
};

// 🆕 NEW: Format clarification info
export const formatClarificationInfo = (clarificationInfo) => {
  if (!clarificationInfo || !clarificationInfo.has_clarification) {
    return null;
  }
  
  return {
    hasClarification: clarificationInfo.has_clarification,
    isPending: clarificationInfo.is_pending,
    status: clarificationInfo.status,
    request: {
      reason: clarificationInfo.requested_reason,
      requestedAt: clarificationInfo.requested_at,
      requestedBy: clarificationInfo.requested_by
    },
    response: clarificationInfo.response ? {
      text: clarificationInfo.response,
      providedAt: clarificationInfo.provided_at,
      providedBy: clarificationInfo.provided_by
    } : null
  };
};

// 🆕 NEW: Check if user can perform action
export const canPerformAction = (action, accessInfo) => {
  if (!accessInfo) return false;
  
  const actionPermissions = {
    'create_batch': accessInfo.can_create_batches,
    'manage_asset': accessInfo.can_manage_all_assets,
    'approve_transfer': accessInfo.can_approve_transfers,
    'create_transfer': accessInfo.can_create_transfers,
    'complete_handover': accessInfo.can_complete_handover,
    'view_all': accessInfo.can_view_all_assets
  };
  
  return actionPermissions[action] || false;
};

export default {
  categoryService,
  batchService,
  assetService,
  offboardingService,
  transferService,
  employeeService,
  employeeAssetService,
  getAssetStatusColor,
  getAssetStatusDisplay,
  getBatchStatusColor,
  getOffboardingTypeDisplay,
  formatQuantitySummary,
  formatClarificationInfo,
  canPerformAction,
};