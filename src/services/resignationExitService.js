
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
};

/**
 * Exit Interview Services
 */
export const exitInterviewService = {
  // Get all exit interview questions
  // Get all exit interview questions
getQuestions: async (section = null) => {
  const params = section ? { section } : {};
  const response = await api.get('/exit-interview-questions/', { params });
  
  // ✅ Handle both direct array and paginated response
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  } else {
    return [];
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
      console.log('✅ Exit Interview Created:', response.data); // ✅ Debug
      return response.data;
    } catch (error) {
      console.error('❌ Error creating exit interview:', error);
      throw error;
    }
  },

  // Employee: Submit exit interview responses
  submitResponses: async (id, responses) => {
    console.log('📤 Submitting responses for interview ID:', id); // ✅ Debug
    
    if (!id || id === 'undefined') {
      throw new Error('Invalid interview ID');
    }
    
    try {
      const response = await api.post(`/exit-interviews/${id}/submit_responses/`, {
        responses
      });
      console.log('✅ Responses submitted:', response.data); // ✅ Debug
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting responses:', error);
      throw error;
    }},
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
};

/**
 * Probation Review Services
 */
export const probationReviewService = {

getQuestions: async (reviewType = null) => {
  const params = reviewType ? { review_type: reviewType } : {};
  const response = await api.get('/probation-review-questions/', { params });
  
  // ✅ Handle both direct array and paginated response
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  } else {
    return [];
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
      'PENDING_MANAGER': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'PENDING_HR': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'MANAGER_APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'HR_APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'COMPLETED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'MANAGER_REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'HR_REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'PENDING': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  },

  // Get status display text
  getStatusText: (status) => {
    const texts = {
      'PENDING_MANAGER': 'Pending Manager',
      'PENDING_HR': 'Pending HR',
      'MANAGER_APPROVED': 'Manager Approved',
      'HR_APPROVED': 'HR Approved',
      'COMPLETED': 'Completed',
      'MANAGER_REJECTED': 'Rejected',
      'HR_REJECTED': 'Rejected',
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
    };
    return texts[status] || status;
  },

  // Get urgency color for days remaining
  getUrgencyColor: (days) => {
    if (days <= 3) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (days <= 7) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  },
};

export default {
  resignation: resignationService,
  exitInterview: exitInterviewService,
  contractRenewal: contractRenewalService,
  probationReview: probationReviewService,
  helpers,
  getCurrentUser,
  getUser,
};