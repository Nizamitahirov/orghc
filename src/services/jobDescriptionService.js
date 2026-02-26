// services/jobDescriptionService.js - COMPLETE API Integration with Multi-Assignment Support
import axios from 'axios';

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

// Response interceptor for error handling
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

/**
 * Job Description Service - Complete API Integration with Multi-Assignment
 */
class JobDescriptionService {
  
  // ========================================
  // VALIDATION METHODS
  // ========================================
  
  validateJobDescriptionData(data) {
    const errors = [];
    
    if (!data.job_title?.trim()) {
      errors.push('job_title is required');
    }
    if (!data.job_purpose?.trim()) {
      errors.push('job_purpose is required');
    }
    
    if (!data.business_function) {
      errors.push('business_function is required');
    }
    if (!data.department) {
      errors.push('department is required');
    }
    if (!data.job_function) {
      errors.push('job_function is required');
    }
    if (!data.position_group) {
      errors.push('position_group is required');
    }
    
    if (data.unit && !data.department) {
      errors.push('department is required when unit is specified');
    }
    
    if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
      errors.push('At least one section is required');
    } else {
      data.sections.forEach((section, index) => {
        if (!section.section_type) {
          errors.push(`Section ${index + 1}: section_type is required`);
        }
        if (!section.title) {
          errors.push(`Section ${index + 1}: title is required`);
        }
        if (!section.content?.trim()) {
          errors.push(`Section ${index + 1}: content is required`);
        }
        if (typeof section.order !== 'number') {
          errors.push(`Section ${index + 1}: order must be a number`);
        }
      });
    }
    
    if (data.required_skills_data && Array.isArray(data.required_skills_data)) {
      data.required_skills_data.forEach((skill, index) => {
        if (!skill.skill_id) {
          errors.push(`Required skill ${index + 1}: skill_id is required`);
        }
      });
    }
    
    if (data.behavioral_competencies_data && Array.isArray(data.behavioral_competencies_data)) {
      data.behavioral_competencies_data.forEach((comp, index) => {
        if (!comp.competency_id) {
          errors.push(`Behavioral competency ${index + 1}: competency_id is required`);
        }
      });
    }
    
    return errors;
  }
  
  cleanJobDescriptionData(data) {
    const cleaned = {
      job_title: data.job_title?.trim() || '',
      job_purpose: data.job_purpose?.trim() || '',
      
      business_function: parseInt(data.business_function) || null,
      department: parseInt(data.department) || null,
      job_function: parseInt(data.job_function) || null,
      position_group: parseInt(data.position_group) || null,
      
      ...(data.grading_levels && Array.isArray(data.grading_levels) && data.grading_levels.length > 0 && {
        grading_levels: data.grading_levels
          .map(level => level?.trim())
          .filter(level => level && level.length > 0)
      }),
      
      ...((!data.grading_levels || data.grading_levels.length === 0) && 
          data.grading_level && data.grading_level.trim() && {
        grading_levels: [data.grading_level.trim()]
      }),
      
      selected_employee_ids: Array.isArray(data.selected_employee_ids) 
        ? data.selected_employee_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
        : [],
      
      sections: Array.isArray(data.sections) ? data.sections : [],
      required_skills_data: Array.isArray(data.required_skills_data) ? data.required_skills_data : [],
      behavioral_competencies_data: Array.isArray(data.behavioral_competencies_data) ? data.behavioral_competencies_data : []
    };
    
    if (data.unit && parseInt(data.unit)) {
      cleaned.unit = parseInt(data.unit);
    }
    
    cleaned.sections = cleaned.sections.map((section, index) => ({
      section_type: section.section_type?.trim() || '',
      title: section.title?.trim() || '',
      content: section.content?.trim() || '',
      order: typeof section.order === 'number' ? section.order : index + 1
    })).filter(section => section.section_type && section.title && section.content);
    
    cleaned.required_skills_data = cleaned.required_skills_data.map(skill => ({
      skill_id: parseInt(skill.skill_id),
    })).filter(skill => skill.skill_id && !isNaN(skill.skill_id));
    
    cleaned.behavioral_competencies_data = cleaned.behavioral_competencies_data.map(comp => ({
      competency_id: parseInt(comp.competency_id),
    })).filter(comp => comp.competency_id && !isNaN(comp.competency_id));
    
    if (data.business_resources_with_items && Array.isArray(data.business_resources_with_items)) {
      cleaned.business_resources_with_items = data.business_resources_with_items.map(item => ({
        resource_id: parseInt(item.resource_id),
        item_ids: Array.isArray(item.item_ids) 
          ? item.item_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
          : []
      })).filter(item => !isNaN(item.resource_id));
    } else if (data.business_resources_ids && Array.isArray(data.business_resources_ids)) {
      cleaned.business_resources_ids = data.business_resources_ids
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
    }
    
    if (data.access_rights_with_items && Array.isArray(data.access_rights_with_items)) {
      cleaned.access_rights_with_items = data.access_rights_with_items.map(item => ({
        access_matrix_id: parseInt(item.access_matrix_id),
        item_ids: Array.isArray(item.item_ids) 
          ? item.item_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
          : []
      })).filter(item => !isNaN(item.access_matrix_id));
    } else if (data.access_rights_ids && Array.isArray(data.access_rights_ids)) {
      cleaned.access_rights_ids = data.access_rights_ids
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
    }
    
    if (data.company_benefits_with_items && Array.isArray(data.company_benefits_with_items)) {
      cleaned.company_benefits_with_items = data.company_benefits_with_items.map(item => ({
        benefit_id: parseInt(item.benefit_id),
        item_ids: Array.isArray(item.item_ids) 
          ? item.item_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
          : []
      })).filter(item => !isNaN(item.benefit_id));
    } else if (data.company_benefits_ids && Array.isArray(data.company_benefits_ids)) {
      cleaned.company_benefits_ids = data.company_benefits_ids
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
    }
    
    return cleaned;
  }

  // ========================================
  // JOB DESCRIPTIONS MAIN ENDPOINTS
  // ========================================
  
  async getJobDescriptions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.ordering) queryParams.append('ordering', params.ordering);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-descriptions/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
      throw error;
    }
  }

  async getJobDescription(id) {
    try {
      const response = await api.get(`/job-descriptions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job description:', error);
      throw error;
    }
  }
async getMyAccessInfo() {
  try {
    const response = await api.get('/job-descriptions/my_access_info/');
    return response.data;
  } catch (error) {
    console.error('Error fetching access info:', error);
    throw error;
  }
}
  async previewEligibleEmployees(criteria) {
    try {
      if (!criteria.job_title || !criteria.business_function || !criteria.department || 
          !criteria.job_function || !criteria.position_group) {
        throw new Error('Missing required criteria fields');
      }

      const cleanedCriteria = {
        job_title: criteria.job_title?.trim(),
        business_function: parseInt(criteria.business_function),
        department: parseInt(criteria.department),
        job_function: parseInt(criteria.job_function),
        position_group: parseInt(criteria.position_group),
        
        ...(criteria.grading_levels && Array.isArray(criteria.grading_levels) && criteria.grading_levels.length > 0 && {
          grading_levels: criteria.grading_levels.map(level => level?.trim()).filter(Boolean)
        }),
        
        ...((!criteria.grading_levels || criteria.grading_levels.length === 0) && 
            criteria.grading_level && criteria.grading_level.trim() && {
          grading_levels: [criteria.grading_level.trim()]
        }),
        
        max_preview: criteria.max_preview || 50,
        include_vacancies: true
      };

      if (criteria.unit && parseInt(criteria.unit)) {
        cleanedCriteria.unit = parseInt(criteria.unit);
      } else {
        cleanedCriteria.unit = null;
      }

      Object.keys(cleanedCriteria).forEach(key => {
        if (cleanedCriteria[key] === null || cleanedCriteria[key] === undefined || 
            cleanedCriteria[key] === '' || (typeof cleanedCriteria[key] === 'number' && isNaN(cleanedCriteria[key]))) {
          delete cleanedCriteria[key];
        }
      });

 
      
      const response = await api.post('/job-descriptions/preview_eligible_employees/', cleanedCriteria);
      
   
      return response.data;
    } catch (error) {
      console.error('❌ Error previewing eligible employees:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = 'Invalid request parameters';
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.join(', ');
        } else if (typeof errorData === 'object') {
          const fieldErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors.push(`${field}: ${errorData[field].join(', ')}`);
            } else {
              fieldErrors.push(`${field}: ${errorData[field]}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
        
        throw new Error(`Preview request failed: ${errorMessage}`);
      }
      
      throw error;
    }
  }

  async createJobDescription(data) {
    try {
      const validationErrors = this.validateJobDescriptionData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const cleanedData = this.cleanJobDescriptionData(data);

      
      const response = await api.post('/job-descriptions/', cleanedData);
      

      return response.data;
    } catch (error) {
      if (error.response?.status === 422 && error.response.data?.requires_employee_selection) {
        throw {
          requiresEmployeeSelection: true,
          eligibleEmployees: error.response.data.eligible_employees,
          message: error.response.data.message,
          eligibleCount: error.response.data.eligible_count,
          originalData: data
        };
      }
      
      if (error.response) {
      
        console.error('❌ Response data:', error.response.data);
      }
      
      throw error;
    }
  }

  async updateJobDescription(id, data) {
    try {
      const validationErrors = this.validateJobDescriptionData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      const cleanedData = this.cleanJobDescriptionData(data);
 
      
      const response = await api.put(`/job-descriptions/${id}/`, cleanedData);
      
   
      return response.data;
    } catch (error) {
      console.error('Error updating job description:', error);
      if (error.response) {
        console.error('API Error Details:', error.response.data);
      }
      throw error;
    }
  }

  async deleteJobDescription(id) {
    try {
      const response = await api.delete(`/job-descriptions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job description:', error);
      throw error;
    }
  }

  // ========================================
  // 🔥 MULTI-ASSIGNMENT ENDPOINTS
  // ========================================

  async getJobDescriptionAssignments(jobId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      
      const response = await api.get(`/job-descriptions/${jobId}/assignments/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  async addAssignments(jobId, data) {
    try {
      const cleanData = {
        employee_ids: Array.isArray(data.employee_ids) 
          ? data.employee_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
          : [],
        vacancy_ids: Array.isArray(data.vacancy_ids)
          ? data.vacancy_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
          : []
      };
      
      const response = await api.post(`/job-descriptions/${jobId}/add_assignments/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error adding assignments:', error);
      throw error;
    }
  }

  async removeAssignment(jobId, assignmentId) {
    try {
      const response = await api.post(`/job-descriptions/${jobId}/remove_assignment/`, {
        assignment_id: assignmentId
      });
      return response.data;
    } catch (error) {
      console.error('Error removing assignment:', error);
      throw error;
    }
  }

  async reassignEmployee(jobId, data) {
    try {
      const cleanData = {
        assignment_id: data.assignment_id,
        employee_id: parseInt(data.employee_id)
      };
      
      const response = await api.post(`/job-descriptions/${jobId}/reassign_employee/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error reassigning employee:', error);
      throw error;
    }
  }

  async submitAssignmentForApproval(jobId, assignmentId, data = {}) {
    try {
      const response = await api.post(`/job-descriptions/${jobId}/submit_assignment_for_approval/`, {
        assignment_id: assignmentId,
        comments: data.comments || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  async submitAllAssignmentsForApproval(jobId) {
    try {
      const response = await api.post(`/job-descriptions/${jobId}/submit_all_for_approval/`);
      return response.data;
    } catch (error) {
      console.error('Error submitting all assignments:', error);
      throw error;
    }
  }

  async approveAssignmentByLineManager(jobId, assignmentId, data = {}) {
    try {
      const response = await api.post(`/job-descriptions/${jobId}/approve_assignment_by_line_manager/`, {
        assignment_id: assignmentId,
        comments: data.comments || '',
        signature: data.signature || null
      });
      return response.data;
    } catch (error) {
      console.error('Error approving assignment (LM):', error);
      throw error;
    }
  }

  async approveAssignmentAsEmployee(jobId, assignmentId, data = {}) {
    try {
      const response = await api.post(`/job-descriptions/${jobId}/approve_assignment_as_employee/`, {
        assignment_id: assignmentId,
        comments: data.comments || '',
        signature: data.signature || null
      });
      return response.data;
    } catch (error) {
      console.error('Error approving assignment (Employee):', error);
      throw error;
    }
  }

  async rejectAssignment(jobId, assignmentId, data = {}) {
    try {
      const response = await api.post(`/job-descriptions/${jobId}/reject_assignment/`, {
        assignment_id: assignmentId,
        reason: data.reason || data.comments || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      throw error;
    }
  }

  async requestAssignmentRevision(jobId, assignmentId, data = {}) {
    try {
      const response = await api.post(`/job-descriptions/${jobId}/request_assignment_revision/`, {
        assignment_id: assignmentId,
        reason: data.reason || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting revision:', error);
      throw error;
    }
  }

  async getPendingApprovals() {
    try {
      const response = await api.get('/job-descriptions/pending_approvals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  // ========================================
  // LEGACY WORKFLOW ENDPOINTS
  // ========================================

  async submitForApproval(id, data) {
    try {

      const response = await api.post(`/job-descriptions/${id}/submit_for_approval/`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting for approval:', error);
      throw error;
    }
  }

  async approveByLineManager(id, data = {}) {
    try {
  
      const response = await api.post(`/job-descriptions/${id}/approve_by_line_manager/`, {
        comments: data.comments?.trim() || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error approving as line manager:', error);
      throw error;
    }
  }

  async approveAsEmployee(id, data = {}) {
    try {
    
      const response = await api.post(`/job-descriptions/${id}/approve_as_employee/`, {
        comments: data.comments?.trim() || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error approving as employee:', error);
      throw error;
    }
  }

  async rejectJobDescription(id, data = {}) {
    try {
      
      const response = await api.post(`/job-descriptions/${id}/reject/`, {
        reason: data.reason?.trim() || data.comments?.trim() || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting job description:', error);
      throw error;
    }
  }

  async requestRevision(id, data) {
    try {

      const response = await api.post(`/job-descriptions/${id}/request_revision/`, data);
      return response.data;
    } catch (error) {
      console.error('Error requesting revision:', error);
      throw error;
    }
  }

  // ========================================
  // EMPLOYEE RELATED JOB DESCRIPTIONS
  // ========================================

  async getEmployeeJobDescriptions(employeeId) {
    try {
      const response = await api.get(`/employees/${employeeId}/job_descriptions/`);
      return response.data.job_descriptions || [];
    } catch (error) {
      console.error('Error fetching employee job descriptions:', error);
      throw error;
    }
  }
// Add this method in the "EMPLOYEE RELATED JOB DESCRIPTIONS" section or 
// in the "MULTI-ASSIGNMENT ENDPOINTS" section

/**
 * Get detailed information about a specific job description assignment
 * @param {number} assignmentId - The assignment ID
 * @returns {Promise} Assignment detail with full job description data
 */
async getAssignmentDetail(assignmentId) {
  try {
    const response = await api.get(`/job-descriptions/${assignmentId}/assignments/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment detail:', error);
    throw error;
  }
}
  async getTeamJobDescriptions(managerId) {
    try {
      const response = await api.get(`/employees/${managerId}/team_job_descriptions/`);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.team_job_descriptions) {
        return response.data.team_job_descriptions;
      } else if (response.data.results) {
        return response.data.results;
      } else {
        const teamJobs = Object.values(response.data).find(value => Array.isArray(value)) || [];
        return teamJobs;
      }
    } catch (error) {
      console.error('Error fetching team job descriptions:', error);
      throw error;
    }
  }

  // ========================================
  // PDF EXPORT FUNCTIONALITY
  // ========================================

  async downloadJobDescriptionPDF(id) {
    try {
      const response = await api.get(`/job-descriptions/${id}/download_pdf/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `job-description-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error downloading job description PDF:', error);
      throw error;
    }
  }

  // ========================================
  // ACCESS MATRIX - PARENT
  // ========================================

  async getAccessMatrix(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/access-matrix/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access matrix:', error);
      throw error;
    }
  }

  async getAccessMatrixById(id) {
    try {
      const response = await api.get(`/job-description/access-matrix/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access matrix:', error);
      throw error;
    }
  }

  async createAccessMatrix(data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/access-matrix/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error creating access matrix:', error);
      throw error;
    }
  }

  async updateAccessMatrix(id, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/access-matrix/${id}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating access matrix:', error);
      throw error;
    }
  }

  async deleteAccessMatrix(id) {
    try {
      const response = await api.delete(`/job-description/access-matrix/${id}/`);
      return response;
    } catch (error) {
      console.error('Error deleting access matrix:', error);
      throw error;
    }
  }

  // ========================================
  // ACCESS MATRIX ITEMS - CHILD (Nested Structure via Parent)
  // ========================================

  async getAccessMatrixItems(accessMatrixId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      // Use nested endpoint: /access-matrix/{id}/items/
      const response = await api.get(`/job-description/access-matrix/${accessMatrixId}/items/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access matrix items:', error);
      throw error;
    }
  }

  async getAccessMatrixItemById(accessMatrixId, itemId) {
    try {
      // If you need specific item, fetch all and filter, or use flat structure
      const response = await api.get(`/job-description/access-matrix/${accessMatrixId}/items/`);
      const items = response.data.items || response.data;
      return items.find(item => item.id === itemId);
    } catch (error) {
      console.error('Error fetching access matrix item:', error);
      throw error;
    }
  }

  async addAccessMatrixItem(accessMatrixId, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      // Use nested endpoint: /access-matrix/{id}/add_item/
      const response = await api.post(`/job-description/access-matrix/${accessMatrixId}/add_item/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error adding access matrix item:', error);
      throw error;
    }
  }

  async updateAccessMatrixItem(accessMatrixId, itemId, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      

      
      // Alternative: if backend supports it
      const response = await api.put(`/job-description/access-matrix/${accessMatrixId}/items/${itemId}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating access matrix item:', error);
      throw error;
    }
  }

  async deleteAccessMatrixItem(accessMatrixId, itemId) {
    try {
      // Use nested endpoint: /access-matrix/{id}/delete_item/
      const response = await api.delete(`/job-description/access-matrix/${accessMatrixId}/delete_item/`, {
        data: { item_id: itemId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting access matrix item:', error);
      throw error;
    }
  }

  // ========================================
  // BUSINESS RESOURCES - PARENT
  // ========================================

  async getBusinessResources(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/business-resources/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resources:', error);
      throw error;
    }
  }

  async getBusinessResourceById(id) {
    try {
      const response = await api.get(`/job-description/business-resources/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resource:', error);
      throw error;
    }
  }

  async createBusinessResource(data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/business-resources/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error creating business resource:', error);
      throw error;
    }
  }

  async updateBusinessResource(id, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/business-resources/${id}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating business resource:', error);
      throw error;
    }
  }

  async deleteBusinessResource(id) {
    try {
      const response = await api.delete(`/job-description/business-resources/${id}/`);
      return response;
    } catch (error) {
      console.error('Error deleting business resource:', error);
      throw error;
    }
  }

  // ========================================
  // BUSINESS RESOURCE ITEMS - CHILD (Flat Structure)
  // ========================================

  async getBusinessResourceItems(businessResourceId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('resource', businessResourceId);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/business-resource-items/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resource items:', error);
      throw error;
    }
  }

  async getBusinessResourceItemById(itemId) {
    try {
      const response = await api.get(`/job-description/business-resource-items/${itemId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resource item:', error);
      throw error;
    }
  }

  async addBusinessResourceItem(businessResourceId, data) {
    try {
      const cleanData = {
        resource: parseInt(businessResourceId),
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/business-resource-items/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error adding business resource item:', error);
      throw error;
    }
  }

  async updateBusinessResourceItem(itemId, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/business-resource-items/${itemId}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating business resource item:', error);
      throw error;
    }
  }

  async deleteBusinessResourceItem(itemId) {
    try {
      const response = await api.delete(`/job-description/business-resource-items/${itemId}/`);
      return response;
    } catch (error) {
      console.error('Error deleting business resource item:', error);
      throw error;
    }
  }

  // ========================================
  // COMPANY BENEFITS - PARENT
  // ========================================

  async getCompanyBenefits(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/company-benefits/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefits:', error);
      throw error;
    }
  }

  async getCompanyBenefitById(id) {
    try {
      const response = await api.get(`/job-description/company-benefits/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefit:', error);
      throw error;
    }
  }

  async createCompanyBenefit(data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/company-benefits/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error creating company benefit:', error);
      throw error;
    }
  }

  async updateCompanyBenefit(id, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/company-benefits/${id}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating company benefit:', error);
      throw error;
    }
  }

  async deleteCompanyBenefit(id) {
    try {
      const response = await api.delete(`/job-description/company-benefits/${id}/`);
      return response;
    } catch (error) {
      console.error('Error deleting company benefit:', error);
      throw error;
    }
  }

  // ========================================
  // COMPANY BENEFIT ITEMS - CHILD (Flat Structure)
  // ========================================

  async getCompanyBenefitItems(companyBenefitId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('benefit', companyBenefitId);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/company-benefit-items/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefit items:', error);
      throw error;
    }
  }

  async getCompanyBenefitItemById(itemId) {
    try {
      const response = await api.get(`/job-description/company-benefit-items/${itemId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefit item:', error);
      throw error;
    }
  }

  async addCompanyBenefitItem(companyBenefitId, data) {
    try {
      const cleanData = {
        benefit: parseInt(companyBenefitId),
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/company-benefit-items/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error adding company benefit item:', error);
      throw error;
    }
  }

  async updateCompanyBenefitItem(itemId, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/company-benefit-items/${itemId}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating company benefit item:', error);
      throw error;
    }
  }

  async deleteCompanyBenefitItem(itemId) {
    try {
      const response = await api.delete(`/job-description/company-benefit-items/${itemId}/`);
      return response;
    } catch (error) {
      console.error('Error deleting company benefit item:', error);
      throw error;
    }
  }

  // ========================================
  // JOB DESCRIPTION STATISTICS
  // ========================================

  async getJobDescriptionStats() {
    try {
      const response = await api.get('/job-description/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching job description stats:', error);
      throw error;
    }
  }

  // ========================================
  // HELPER METHODS FOR EMPLOYEE DETAIL VIEW
  // ========================================

  canApproveAsLineManager(job) {
    return job.status === 'PENDING_LINE_MANAGER' || job.status === 'PENDING_APPROVAL';
  }

  canApproveAsEmployee(job) {
    return job.status === 'PENDING_EMPLOYEE';
  }

  isVacantPosition(job) {
    return job.is_vacant || job.is_vacancy || 
           job.employee_name === 'VACANT' || 
           job.full_name === 'VACANT' ||
           (job.employee_name && job.employee_name.includes('VACANT'));
  }

  getEmployeeDisplayName(job) {
    if (this.isVacantPosition(job)) {
      return job.employee_id || job.position_id || 'VACANT';
    }
    return job.employee_name || job.full_name || job.name || 'N/A';
  }

  getNextAction(job) {
    const status = job.status;
    
    if (status === 'DRAFT') {
      return 'Job description needs to be submitted for approval.';
    }
    if (status === 'PENDING_LINE_MANAGER' || status === 'PENDING_APPROVAL') {
      return 'Waiting for line manager approval.';
    }
    if (status === 'PENDING_EMPLOYEE') {
      return 'Waiting for employee approval.';
    }
    if (status === 'APPROVED' || status === 'ACTIVE') {
      return 'Job description is fully approved and active.';
    }
    if (status === 'REJECTED') {
      return 'Job description has been rejected and needs revision.';
    }
    if (status === 'REVISION_REQUIRED') {
      return 'Job description requires revision before resubmission.';
    }
    
    return 'Status unknown.';
  }

  // ========================================
  // FILTERING & SORTING FOR JOB DESCRIPTIONS
  // ========================================

  filterJobDescriptions(jobs, filters) {
    let filtered = [...jobs];
    
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        (job.job_title && job.job_title.toLowerCase().includes(searchLower)) ||
        (job.employee_name && job.employee_name.toLowerCase().includes(searchLower)) ||
        (job.full_name && job.full_name.toLowerCase().includes(searchLower)) ||
        (job.department_name && job.department_name.toLowerCase().includes(searchLower)) ||
        (job.business_function_name && job.business_function_name.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }
    
    if (filters.department) {
      filtered = filtered.filter(job => 
        job.department === filters.department || 
        job.department_name === filters.department
      );
    }
    
    if (filters.businessFunction) {
      filtered = filtered.filter(job => 
        job.business_function === filters.businessFunction || 
        job.business_function_name === filters.businessFunction
      );
    }
    
    if (filters.vacantOnly) {
      filtered = filtered.filter(job => this.isVacantPosition(job));
    }
    
    if (filters.pendingOnly) {
      filtered = filtered.filter(job => 
        job.status === 'PENDING_LINE_MANAGER' || 
        job.status === 'PENDING_EMPLOYEE' ||
        job.status === 'PENDING_APPROVAL'
      );
    }
    
    return filtered;
  }

  // 🔥 FILTER ASSIGNMENTS - For assignment-based data structure
  filterAssignments(assignments, filters) {
    let filtered = [...assignments];
    
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(assignment => 
        (assignment.job_title && assignment.job_title.toLowerCase().includes(searchLower)) ||
        (assignment.employee_name && assignment.employee_name.toLowerCase().includes(searchLower)) ||
        (assignment.department && assignment.department.toLowerCase().includes(searchLower)) ||
        (assignment.business_function && assignment.business_function.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(assignment => assignment.status === filters.status);
    }
    
    if (filters.department) {
      filtered = filtered.filter(assignment => 
        assignment.department === filters.department
      );
    }
    
    if (filters.businessFunction) {
      filtered = filtered.filter(assignment => 
        assignment.business_function === filters.businessFunction
      );
    }
    
    if (filters.vacantOnly) {
      filtered = filtered.filter(assignment => assignment.is_vacancy === true);
    }
    
    if (filters.pendingOnly) {
      filtered = filtered.filter(assignment => 
        assignment.status === 'PENDING_LINE_MANAGER' || 
        assignment.status === 'PENDING_EMPLOYEE' ||
        assignment.status === 'PENDING_APPROVAL'
      );
    }
    
    return filtered;
  }

  sortJobDescriptions(jobs, field, order = 'desc') {
    const sorted = [...jobs];
    
    sorted.sort((a, b) => {
      let aVal, bVal;
      
      switch (field) {
        case 'job_title':
          aVal = (a.job_title || '').toLowerCase();
          bVal = (b.job_title || '').toLowerCase();
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0);
          bVal = new Date(b.created_at || 0);
          break;
        case 'employee_name':
          aVal = (a.employee_name || a.full_name || '').toLowerCase();
          bVal = (b.employee_name || b.full_name || '').toLowerCase();
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }

  // 🔥 SORT ASSIGNMENTS
  sortAssignments(assignments, field, order = 'desc') {
    const sorted = [...assignments];
    
    sorted.sort((a, b) => {
      let aVal, bVal;
      
      switch (field) {
        case 'job_title':
          aVal = (a.job_title || '').toLowerCase();
          bVal = (b.job_title || '').toLowerCase();
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0);
          bVal = new Date(b.created_at || 0);
          break;
        case 'employee_name':
          aVal = (a.employee_name || '').toLowerCase();
          bVal = (b.employee_name || '').toLowerCase();
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }

  paginateJobDescriptions(jobs, currentPage, itemsPerPage) {
    const totalItems = jobs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = jobs.slice(startIndex, endIndex);
    
    return {
      items,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }

  // 🔥 PAGINATE ASSIGNMENTS
  paginateAssignments(assignments, currentPage, itemsPerPage) {
    const totalItems = assignments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = assignments.slice(startIndex, endIndex);
    
    return {
      items,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }

  getUniqueFilterValues(jobs, field) {
    const values = new Set();
    
    jobs.forEach(job => {
      let value;
      switch (field) {
        case 'status':
          value = job.status;
          break;
        case 'department':
          value = job.department_name || job.department;
          break;
        case 'business_function':
          value = job.business_function_name || job.business_function;
          break;
        default:
          value = job[field];
      }
      
      if (value && value !== '') {
        values.add(value);
      }
    });
    
    return Array.from(values).sort();
  }

  getStatusInfo(status) {
    const statusMap = {
      'DRAFT': {
        label: 'Draft',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        darkBgColor: '#374151',
        description: 'Job description is being prepared'
      },
      'PENDING_LINE_MANAGER': {
        label: 'Pending Line Manager Approval',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        darkBgColor: '#92400E',
        description: 'Waiting for line manager approval'
      },
      'PENDING_EMPLOYEE': {
        label: 'Pending Employee Approval',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        darkBgColor: '#1E40AF',
        description: 'Waiting for employee approval'
      },
      'APPROVED': {
        label: 'Approved',
        color: '#10B981',
        bgColor: '#D1FAE5',
        darkBgColor: '#047857',
        description: 'Job description is fully approved'
      },
      'REJECTED': {
        label: 'Rejected',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        darkBgColor: '#DC2626',
        description: 'Job description has been rejected'
      },
      'REVISION_REQUIRED': {
        label: 'Revision Required',
        color: '#F97316',
        bgColor: '#FED7AA',
        darkBgColor: '#EA580C',
        description: 'Job description needs revision'
      }
    };

    return statusMap[status] || statusMap['DRAFT'];
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  }

  formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Invalid Date";
    }
  }
}

// Create and export singleton instance
const jobDescriptionService = new JobDescriptionService();
export default jobDescriptionService;