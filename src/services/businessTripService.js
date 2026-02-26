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

// Axios instance for business trip API
const businessTripApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
businessTripApi.interceptors.request.use(
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
businessTripApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Business Trip Services
export const BusinessTripService = {
  // === PERMISSIONS ===
  getMyPermissions: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/permissions/my/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === DASHBOARD ===
  getDashboard: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/dashboard/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === CONFIGURATION OPTIONS ===
  getAllOptions: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/options/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === TRAVEL TYPES ===
  getTravelTypes: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/travel-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTravelType: async (data) => {
    try {
      const response = await businessTripApi.post('/business-trips/travel-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTravelType: async (id) => {
    try {
      const response = await businessTripApi.get(`/business-trips/travel-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTravelType: async (id, data) => {
    try {
      const response = await businessTripApi.put(`/business-trips/travel-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  partialUpdateTravelType: async (id, data) => {
    try {
      const response = await businessTripApi.patch(`/business-trips/travel-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTravelType: async (id) => {
    try {
      const response = await businessTripApi.delete(`/business-trips/travel-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === TRANSPORT TYPES ===
  getTransportTypes: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/transport-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTransportType: async (data) => {
    try {
      const response = await businessTripApi.post('/business-trips/transport-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTransportType: async (id) => {
    try {
      const response = await businessTripApi.get(`/business-trips/transport-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTransportType: async (id, data) => {
    try {
      const response = await businessTripApi.put(`/business-trips/transport-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  partialUpdateTransportType: async (id, data) => {
    try {
      const response = await businessTripApi.patch(`/business-trips/transport-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTransportType: async (id) => {
    try {
      const response = await businessTripApi.delete(`/business-trips/transport-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === TRIP PURPOSES ===
  getTripPurposes: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/purposes/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTripPurpose: async (data) => {
    try {
      const response = await businessTripApi.post('/business-trips/purposes/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTripPurpose: async (id) => {
    try {
      const response = await businessTripApi.get(`/business-trips/purposes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTripPurpose: async (id, data) => {
    try {
      const response = await businessTripApi.put(`/business-trips/purposes/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  partialUpdateTripPurpose: async (id, data) => {
    try {
      const response = await businessTripApi.patch(`/business-trips/purposes/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTripPurpose: async (id) => {
    try {
      const response = await businessTripApi.delete(`/business-trips/purposes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS - HR REPRESENTATIVE ===
  getHRRepresentatives: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/settings/hr-representatives/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateHRRepresentative: async (data) => {
    try {
      const response = await businessTripApi.put('/business-trips/settings/hr-representative/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS - FINANCE APPROVER ===
  getFinanceApprovers: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/settings/finance-approvers/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateFinanceApprover: async (data) => {
    try {
      const response = await businessTripApi.put('/business-trips/settings/finance-approver/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS - GENERAL ===
  getGeneralSettings: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/settings/general/get/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateGeneralSettings: async (data) => {
    try {
      const response = await businessTripApi.put('/business-trips/settings/general/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === REQUESTS ===
  // === ATTACHMENTS === (REQUESTS section-dan sonra əlavə edin)
getRequestAttachments: async (requestId) => {
  try {
    const response = await businessTripApi.get(`/business-trips/requests/${requestId}/attachments/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

bulkUploadAttachments: async (requestId, files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await businessTripApi.post(
      `/business-trips/requests/${requestId}/attachments/bulk-upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

getAttachmentDetails: async (attachmentId) => {
  try {
    const response = await businessTripApi.get(`/business-trips/attachments/${attachmentId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteAttachment: async (attachmentId) => {
  try {
    const response = await businessTripApi.delete(`/business-trips/attachments/${attachmentId}/delete/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},
getTripRequestDetail: async (requestId) => {
  try {
    const response = await businessTripApi.get(`/business-trips/requests/${requestId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

createTripRequestWithFiles: async (formData) => {
  try {
    const response = await businessTripApi.post('/business-trips/requests/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

  getMyTripRequests: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/my/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllTripRequests: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/all/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exportMyTrips: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/export/', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exportAllTrips: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/export-all/', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelTrip: async (id) => {
    try {
      const response = await businessTripApi.post(`/business-trips/requests/${id}/cancel/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === APPROVAL ===
  getPendingApprovals: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/approval/pending/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveRejectRequest: async (id, data) => {
    try {
      const response = await businessTripApi.post(`/business-trips/approval/${id}/action/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getApprovalHistory: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/approval/history/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === EMPLOYEES ===
  searchEmployees: async () => {
    try {
      const response = await businessTripApi.get('/employees/', { 
        params: { 
          page_size: 100
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUserEmail: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("user_email");
    }
    return null;
  },
};

// Helper functions
export const BusinessTripHelpers = {
  // Format trip request with files
formatTripRequestWithFiles: (data, files) => {
  const formData = new FormData();
  
  formData.append('requester_type', data.requester_type);
  
  if (data.employee_id) {
    formData.append('employee_id', data.employee_id);
  }
  
  formData.append('travel_type_id', data.travel_type_id);
  formData.append('transport_type_id', data.transport_type_id);
  formData.append('purpose_id', data.purpose_id);
  formData.append('start_date', data.start_date);
  formData.append('end_date', data.end_date);
  
  if (data.comment) {
    formData.append('comment', data.comment);
  }
  
  formData.append('schedules', JSON.stringify(data.schedules || []));
  
  if (data.hotels && data.hotels.length > 0) {
    formData.append('hotels', JSON.stringify(data.hotels));
  }
  
  if (data.finance_approver_id) {
    formData.append('finance_approver_id', data.finance_approver_id);
  }
  
  if (data.hr_representative_id) {
    formData.append('hr_representative_id', data.hr_representative_id);
  }
  
  if (data.employee_manual) {
    Object.keys(data.employee_manual).forEach(key => {
      formData.append(`employee_manual[${key}]`, data.employee_manual[key]);
    });
  }
  
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }
  
  return formData;
},

// Validate file
validateFile: (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: `File ${file.name} exceeds 10MB limit` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File ${file.name} has unsupported format` };
  }

  return { valid: true };
},

// Format file size
formatFileSize: (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
},

// Get file icon
getFileIcon: (fileType) => {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('word') || fileType.includes('document')) return 'doc';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'xls';
  return 'file';
},

  // Download blob file
  downloadBlobFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Format date for API
  formatDate: (date) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  },

  // Parse trip status
  parseTripStatus: (status) => {
    const statusMap = {
      'SUBMITTED': 'Submitted',
      'PENDING_LINE_MANAGER': 'Pending Line Manager',
      'PENDING_FINANCE': 'Pending Finance',
      'PENDING_HR': 'Pending HR',
      'APPROVED': 'Approved',
      'REJECTED_LINE_MANAGER': 'Rejected by Line Manager',
      'REJECTED_FINANCE': 'Rejected by Finance',
      'REJECTED_HR': 'Rejected by HR',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  },

  // Check permissions
  hasPermission: (userPermissions, permissionKey) => {
    if (userPermissions?.is_admin) return true;
    return userPermissions?.permissions?.includes(permissionKey) || false;
  },

  // Check if user can view settings
  canViewSettings: (userPermissions) => {
    return BusinessTripHelpers.hasPermission(userPermissions, 'business_trips.settings.view');
  },

  // Check if user can export all trips
  canExportAll: (userPermissions) => {
    return BusinessTripHelpers.hasPermission(userPermissions, 'business_trips.export_all');
  },

  // Check if user can approve
  canApprove: (userPermissions) => {
    return BusinessTripHelpers.hasPermission(userPermissions, 'business_trips.request.approve');
  },

  // Check if user can cancel trip
  canCancelTrip: (trip, userPermissions, currentUserId) => {
    if (userPermissions?.is_admin) return true;
    if (trip.status !== 'APPROVED') return false;
    if (trip.employee_id === currentUserId) return true;
    
    return BusinessTripHelpers.hasPermission(userPermissions, 'business_trips.request.cancel');
  },

  // Calculate trip duration
  calculateTripDuration: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  },

  // Validate schedule dates
  validateScheduleDates: (schedules) => {
    const errors = [];
    schedules.forEach((schedule, index) => {
      if (!schedule.date || !schedule.from_location || !schedule.to_location) {
        errors.push(`Schedule ${index + 1}: All fields are required`);
      }
    });
    return errors;
  },

  // Validate hotel dates
  validateHotelDates: (hotels) => {
    const errors = [];
    hotels.forEach((hotel, index) => {
      if (!hotel.hotel_name || !hotel.check_in_date || !hotel.check_out_date) {
        errors.push(`Hotel ${index + 1}: All required fields must be filled`);
      }
      if (hotel.check_in_date && hotel.check_out_date) {
        const checkIn = new Date(hotel.check_in_date);
        const checkOut = new Date(hotel.check_out_date);
        if (checkOut <= checkIn) {
          errors.push(`Hotel ${index + 1}: Check-out must be after check-in`);
        }
      }
    });
    return errors;
  }
};

export default BusinessTripService;