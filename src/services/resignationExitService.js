import api from './api';

/**
 * Get current user info including role and permissions
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/job-descriptions/my_access_info/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await api.get('/me/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Resignation Services
 */
export const resignationService = {
  // Get all resignations
  getResignations: async (params = {}) => {
    const response = await api.get('/resignations/', { params });
    return response.data;
  },

  // Get single resignation detail
  getResignation: async (id) => {
    const response = await api.get(`/resignations/${id}/`);
    return response.data;
  },

  // Employee: Create resignation
  createResignation: async (data) => {
    const formData = new FormData();
    formData.append('employee', data.employee);
    formData.append('last_working_day', data.last_working_day);
    if (data.resignation_letter) {
      formData.append('resignation_letter', data.resignation_letter);
    }
    if (data.employee_comments) {
      formData.append('employee_comments', data.employee_comments);
    }

    const response = await api.post('/resignations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Manager/Admin: Approve/Reject resignation
  managerApprove: async (id, action, comments = '') => {
    const response = await api.post(`/resignations/${id}/manager_approve/`, {
      action, 
      comments
    });
    return response.data;
  },

  // HR Admin: Approve/Reject resignation
  hrApprove: async (id, action, comments = '') => {
    const response = await api.post(`/resignations/${id}/hr_approve/`, {
      action, 
      comments
    });
    return response.data;
  },

  //  Admin: Delete resignation
  deleteResignation: async (id) => {
    const response = await api.delete(`/resignations/${id}/`);
    return response.data;
  },
};

/**
 * Exit Interview Services
 */
export const exitInterviewService = {
  // Get all exit interview questions
  getQuestions: async (section = null) => {
    try {
      const params = section ? { section } : {};
      const response = await api.get('/exit-interview-questions/', { params });
      
      //  Handle both direct array and paginated response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching exit interview questions:', error);
      throw error;
    }
  },

  // Admin: Create exit interview question
  createQuestion: async (data) => {
    const response = await api.post('/exit-interview-questions/', data);
    return response.data;
  },

  // Admin: Update exit interview question
  updateQuestion: async (id, data) => {
    const response = await api.put(`/exit-interview-questions/${id}/`, data);
    return response.data;
  },

  // Admin: Delete exit interview question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/exit-interview-questions/${id}/`);
    return response.data;
  },

  // Get all exit interviews
  getExitInterviews: async (params = {}) => {
    const response = await api.get('/exit-interviews/', { params });
    return response.data;
  },

  // Get single exit interview
  getExitInterview: async (id) => {
    const response = await api.get(`/exit-interviews/${id}/`);
    return response.data;
  },

  // Admin: Create exit interview
  createExitInterview: async (data) => {
    try {
      const response = await api.post('/exit-interviews/', data);

      return response.data;
    } catch (error) {
      console.error('❌ Error creating exit interview:', error);
      throw error;
    }
  },

  // Employee: Submit exit interview responses
  submitResponses: async (id, responses) => {

    
    if (!id || id === 'undefined') {
      throw new Error('Invalid interview ID');
    }
    
    try {
      const response = await api.post(`/exit-interviews/${id}/submit_responses/`, {
        responses
      });
 
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting responses:', error);
      throw error;
    }
  },

  //  Admin: Delete exit interview
  deleteExitInterview: async (id) => {
    const response = await api.delete(`/exit-interviews/${id}/`);
    return response.data;
  },
};

/**
 * Contract Renewal Services
 */
export const contractRenewalService = {
  // Get all contract renewals
  getContractRenewals: async (params = {}) => {
    const response = await api.get('/contract-renewals/', { params });
    return response.data;
  },

  // Get single contract renewal
  getContractRenewal: async (id) => {
    const response = await api.get(`/contract-renewals/${id}/`);
    return response.data;
  },

  // Manager: Make renewal decision
  managerDecision: async (id, decisionData) => {
    const response = await api.post(`/contract-renewals/${id}/manager_decision/`, decisionData);
    return response.data;
  },

  // HR: Process renewal
  hrProcess: async (id, comments = '') => {
    const response = await api.post(`/contract-renewals/${id}/hr_process/`, {
      comments
    });
    return response.data;
  },

  //  Admin: Delete contract renewal
  deleteContractRenewal: async (id) => {
    const response = await api.delete(`/contract-renewals/${id}/`);
    return response.data;
  },
};

/**
 * Probation Review Services
 */
export const probationReviewService = {
  // Get all probation review questions
  getQuestions: async (reviewType = null) => {
    try {
      let url = '/probation-review-questions/';
      
      //  Add review_type filter if provided
      if (reviewType) {
        url += `?review_type=${reviewType}`;
      }
      
 
      const response = await api.get(url);
    
      
      //  Handle both direct array and paginated response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching probation questions:', error);
      throw error;
    }
  },

  // Admin: Create probation review question
  createQuestion: async (data) => {
    const response = await api.post('/probation-review-questions/', data);
    return response.data;
  },

  // Admin: Update probation review question
  updateQuestion: async (id, data) => {
    const response = await api.put(`/probation-review-questions/${id}/`, data);
    return response.data;
  },

  // Admin: Delete probation review question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/probation-review-questions/${id}/`);
    return response.data;
  },

  // Get all probation reviews
  getProbationReviews: async (params = {}) => {
    const response = await api.get('/probation-reviews/', { params });
    return response.data;
  },

  // Get single probation review
  getProbationReview: async (id) => {
    const response = await api.get(`/probation-reviews/${id}/`);
    return response.data;
  },

  // Submit probation review responses
  submitResponses: async (id, respondentType, responses) => {
    const response = await api.post(`/probation-reviews/${id}/submit_responses/`, {
      respondent_type: respondentType,
      responses
    });
    return response.data;
  },

  //  Admin: Delete probation review
  deleteProbationReview: async (id) => {
    const response = await api.delete(`/probation-reviews/${id}/`);
    return response.data;
  },
};

/**
 * Helper Functions
 */
export const helpers = {
  // Format date
  formatDate: (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  // Calculate days remaining
  getDaysRemaining: (targetDate) => {
    if (!targetDate) return 0;
    const today = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  },

  // Get status badge color
  getStatusColor: (status) => {
    const colors = {
      'PENDING_MANAGER': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      'PENDING_HR': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      'MANAGER_APPROVED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'HR_APPROVED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'COMPLETED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'MANAGER_REJECTED': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'HR_REJECTED': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      'MANAGER_DECIDED': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      'HR_PROCESSED': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
      'EXPIRED': 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  },

  // Get status display text
  getStatusText: (status) => {
    const texts = {
      'PENDING_MANAGER': 'Pending Manager',
      'PENDING_HR': 'Pending HR',
      'MANAGER_APPROVED': 'Manager Approved',
      'HR_APPROVED': 'HR Approved',
      'COMPLETED': 'Completed',
      'MANAGER_REJECTED': 'Rejected by Manager',
      'HR_REJECTED': 'Rejected by HR',
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'MANAGER_DECIDED': 'Manager Decided',
      'HR_PROCESSED': 'HR Processed',
      'EXPIRED': 'Expired',
    };
    return texts[status] || status.replace(/_/g, ' ');
  },

  // Get urgency color for days remaining
  getUrgencyColor: (days) => {
    if (days <= 3) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    if (days <= 7) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    if (days <= 14) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
  },

  // Get contract type display name
  getContractTypeDisplay: (contractType) => {
    const names = {
      'PERMANENT': 'Permanent',
      '1_YEAR': '1 Year',
      '2_YEARS': '2 Years',
      '6_MONTHS': '6 Months',
      '3_MONTHS': '3 Months',
    };
    return names[contractType] || contractType;
  },

  // Get review period display
  getReviewPeriodDisplay: (reviewPeriod) => {
    const names = {
      '30_DAY': '30-Day Review',
      '60_DAY': '60-Day Review',
      '90_DAY': '90-Day Review',
    };
    return names[reviewPeriod] || reviewPeriod.replace('_', '-');
  },
};

// Default export
export default {
  resignation: resignationService,
  exitInterview: exitInterviewService,
  contractRenewal: contractRenewalService,
  probationReview: probationReviewService,
  helpers,
  getCurrentUser,
  getUser,
};