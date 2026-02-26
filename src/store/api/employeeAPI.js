// src/store/api/employeeAPI.js - COMPLETE FIXED VERSION: Proper array handling for all filters
import { apiService } from '../../services/api';

export const employeeAPI = { 
  getAll: (params = {}) => {
   
    const backendParams = {};

    if (params.page) backendParams.page = params.page;
    if (params.page_size) backendParams.page_size = params.page_size;
    if (params.search) backendParams.search = params.search;
    if (params.employee_search) backendParams.employee_search = params.employee_search;
    if (params.line_manager_search) backendParams.line_manager_search = params.line_manager_search;
    if (params.job_title_search) backendParams.job_title_search = params.job_title_search;
    
    // Multiple Sorting - Enhanced support
    if (params.ordering) {
      if (Array.isArray(params.ordering)) {
   
        backendParams.ordering = params.ordering.map(sort => {
          if (typeof sort === 'object' && sort.field && sort.direction) {
            return sort.direction === 'desc' ? `-${sort.field}` : sort.field;
          }
          return sort;
        }).join(',');
      } else {
        backendParams.ordering = params.ordering;
      }
    }
    if (params.sort) {
      backendParams.ordering = apiService.buildSortingParams(params.sort);
    }
    

    
    // Helper function to process filter values
    const processFilterValue = (value, filterName) => {
      if (!value) return null;
      
      if (Array.isArray(value)) {
    
        const cleanValues = value
          .filter(val => val !== null && val !== undefined && val !== '')
          .map(val => String(val).trim())
          .filter(val => val.length > 0);
        
   
        return cleanValues.length > 0 ? cleanValues : null;
      } else if (typeof value === 'string') {
       
        if (value.includes(',')) {
          const splitValues = value.split(',')
            .map(val => val.trim())
            .filter(val => val.length > 0);
     
          return splitValues.length > 0 ? splitValues : null;
        } else {
          const trimmed = value.trim();
     
          return trimmed ? [trimmed] : null;
        }
      }
      
      return null;
    };

    // Company Filter
    if (params.business_function) {
      const processedValues = processFilterValue(params.business_function, 'business_function');
      if (processedValues) {
        backendParams.business_function = processedValues.join(',');
      }
    }

    // Department Filter  
    if (params.department) {
      const processedValues = processFilterValue(params.department, 'department');
      if (processedValues) {
        backendParams.department = processedValues.join(',');
      }
    }

    // Unit Filter
    if (params.unit) {
      const processedValues = processFilterValue(params.unit, 'unit');
      if (processedValues) {
        backendParams.unit = processedValues.join(',');
      }
    }

    // Job Function Filter
    if (params.job_function) {
      const processedValues = processFilterValue(params.job_function, 'job_function');
      if (processedValues) {
        backendParams.job_function = processedValues.join(',');
      }
    }

    // Position Group Filter
    if (params.position_group) {
      const processedValues = processFilterValue(params.position_group, 'position_group');
      if (processedValues) {
        backendParams.position_group = processedValues.join(',');
      }
    }

    // Status Filter - Special handling (backend expects status names, not IDs)
    if (params.status) {
      const processedValues = processFilterValue(params.status, 'status');
      if (processedValues) {
        backendParams.status = processedValues.join(',');
      }
    }

    // Grading Level Filter
    if (params.grading_level) {
      const processedValues = processFilterValue(params.grading_level, 'grading_level');
      if (processedValues) {
        backendParams.grading_level = processedValues.join(',');
      }
    }

    // Contract Duration Filter
    if (params.contract_duration) {
      const processedValues = processFilterValue(params.contract_duration, 'contract_duration');
      if (processedValues) {
        backendParams.contract_duration = processedValues.join(',');
      }
    }

    // Line Manager Filter
    if (params.line_manager) {
      const processedValues = processFilterValue(params.line_manager, 'line_manager');
      if (processedValues) {
        backendParams.line_manager = processedValues.join(',');
      }
    }

    // Tags Filter
    if (params.tags) {
      const processedValues = processFilterValue(params.tags, 'tags');
      if (processedValues) {
        backendParams.tags = processedValues.join(',');
      }
    }

    // Gender Filter
    if (params.gender) {
      const processedValues = processFilterValue(params.gender, 'gender');
      if (processedValues) {
        backendParams.gender = processedValues.join(',');
      }
    }
    
    // Date Range Filters - Enhanced
    if (params.start_date_from) backendParams.start_date_from = params.start_date_from;
    if (params.start_date_to) backendParams.start_date_to = params.start_date_to;
    if (params.contract_end_date_from) backendParams.contract_end_date_from = params.contract_end_date_from;
    if (params.contract_end_date_to) backendParams.contract_end_date_to = params.contract_end_date_to;
    
    // Date Range Objects
    if (params.start_date_range) {
      if (params.start_date_range.from) backendParams.start_date_from = params.start_date_range.from;
      if (params.start_date_range.to) backendParams.start_date_to = params.start_date_range.to;
    }
    if (params.contract_end_date_range) {
      if (params.contract_end_date_range.from) backendParams.contract_end_date_from = params.contract_end_date_range.from;
      if (params.contract_end_date_range.to) backendParams.contract_end_date_to = params.contract_end_date_range.to;
    }
    
    // Numeric Range Filters - Enhanced
    if (params.years_of_service_min) backendParams.years_of_service_min = params.years_of_service_min;
    if (params.years_of_service_max) backendParams.years_of_service_max = params.years_of_service_max;
    if (params.years_of_service_range) {
      if (params.years_of_service_range.min !== null && params.years_of_service_range.min !== undefined) {
        backendParams.years_of_service_min = params.years_of_service_range.min;
      }
      if (params.years_of_service_range.max !== null && params.years_of_service_range.max !== undefined) {
        backendParams.years_of_service_max = params.years_of_service_range.max;
      }
    }
    
    // Boolean Filters - Enhanced
    if (params.is_active !== undefined && params.is_active !== null && params.is_active !== '') {
      backendParams.is_active = params.is_active === true || params.is_active === 'true';
    }
    if (params.is_visible_in_org_chart !== undefined && params.is_visible_in_org_chart !== null && params.is_visible_in_org_chart !== '') {
      backendParams.is_visible_in_org_chart = params.is_visible_in_org_chart === true || params.is_visible_in_org_chart === 'true';
    }
    if (params.is_deleted !== undefined && params.is_deleted !== null && params.is_deleted !== '') {
      backendParams.is_deleted = params.is_deleted === true || params.is_deleted === 'true';
    }

  
    
    // Legacy parameters support
    if (params.job_title) backendParams.job_title = params.job_title;
    if (params.active_only !== undefined) backendParams.active_only = params.active_only;
    if (params.org_chart_visible !== undefined) backendParams.org_chart_visible = params.org_chart_visible;
    

    return apiService.getEmployees(backendParams);
  },

  getById: (id) => apiService.getEmployee(id),
  
  create: (data) => {
    // Frontend form data-nı backend format-na map edilir
    const formData = new FormData();
    
    // Basic Information
    if (data.employeeId || data.employee_id) {
      formData.append('employee_id', data.employeeId || data.employee_id);
    }
    if (data.firstName || data.first_name) {
      formData.append('first_name', data.firstName || data.first_name);
    }
    if (data.lastName || data.last_name) {
      formData.append('last_name', data.lastName || data.last_name);
    }
    if (data.email) {
      formData.append('email', data.email);
    }
    if (data.phone) {
      formData.append('phone', data.phone);
    }
    if (data.gender) {
      formData.append('gender', data.gender);
    }
    if (data.dateOfBirth || data.date_of_birth) {
      formData.append('date_of_birth', data.dateOfBirth || data.date_of_birth);
    }
    if (data.fatherName || data.father_name) {
      formData.append('father_name', data.fatherName || data.father_name);
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    if (data.emergencyContact || data.emergency_contact) {
      formData.append('emergency_contact', data.emergencyContact || data.emergency_contact);
    }
    
    // Job Information
    if (data.jobTitle || data.job_title) {
      formData.append('job_title', data.jobTitle || data.job_title);
    }
    if (data.businessFunction || data.business_function) {
      formData.append('business_function', data.businessFunction || data.business_function);
    }
    if (data.department) {
      formData.append('department', data.department);
    }
    if (data.unit) {
      formData.append('unit', data.unit);
    }
    if (data.jobFunction || data.job_function) {
      formData.append('job_function', data.jobFunction || data.job_function);
    }
    if (data.positionGroup || data.position_group) {
      formData.append('position_group', data.positionGroup || data.position_group);
    }
    if (data.gradingLevel || data.grading_level) {
      formData.append('grading_level', data.gradingLevel || data.grading_level);
    }
    
    // Management
    if (data.lineManager || data.line_manager) {
      formData.append('line_manager', data.lineManager || data.line_manager);
    }
    
    // Contract Information
    if (data.startDate || data.start_date) {
      formData.append('start_date', data.startDate || data.start_date);
    }
    if (data.endDate || data.end_date) {
      formData.append('end_date', data.endDate || data.end_date);
    }
    if (data.contractDuration || data.contract_duration) {
      formData.append('contract_duration', data.contractDuration || data.contract_duration);
    }
    if (data.contractStartDate || data.contract_start_date) {
      formData.append('contract_start_date', data.contractStartDate || data.contract_start_date);
    }
    
    // Visibility
    if (data.isVisibleInOrgChart !== undefined) {
      formData.append('is_visible_in_org_chart', data.isVisibleInOrgChart);
    }
    
    // Notes
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    // Tags
    if (data.tags || data.tagIds) {
      const tagIds = data.tags || data.tagIds || [];
      tagIds.forEach(tagId => {
        formData.append('tag_ids', tagId);
      });
    }
    
    // Files
    if (data.profilePhoto || data.profile_photo) {
      formData.append('profile_photo', data.profilePhoto || data.profile_photo);
    }
    if (data.document) {
      formData.append('document', data.document);
      if (data.documentType || data.document_type) {
        formData.append('document_type', data.documentType || data.document_type);
      }
      if (data.documentName || data.document_name) {
        formData.append('document_name', data.documentName || data.document_name);
      }
    }
    
    return apiService.createEmployee(formData);
  },
  
  update: (id, data) => {
    // Update üçün oxşar FormData mapping
    const formData = new FormData();
    
    // Basic Information
    if (data.employeeId || data.employee_id) {
      formData.append('employee_id', data.employeeId || data.employee_id);
    }
    if (data.firstName || data.first_name) {
      formData.append('first_name', data.firstName || data.first_name);
    }
    if (data.lastName || data.last_name) {
      formData.append('last_name', data.lastName || data.last_name);
    }
    if (data.email) {
      formData.append('email', data.email);
    }
    if (data.phone) {
      formData.append('phone', data.phone);
    }
    if (data.gender) {
      formData.append('gender', data.gender);
    }
    if (data.dateOfBirth || data.date_of_birth) {
      formData.append('date_of_birth', data.dateOfBirth || data.date_of_birth);
    }
    if (data.fatherName || data.father_name) {
      formData.append('father_name', data.fatherName || data.father_name);
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    if (data.emergencyContact || data.emergency_contact) {
      formData.append('emergency_contact', data.emergencyContact || data.emergency_contact);
    }
    
    // Job Information
    if (data.jobTitle || data.job_title) {
      formData.append('job_title', data.jobTitle || data.job_title);
    }
    if (data.businessFunction || data.business_function) {
      formData.append('business_function', data.businessFunction || data.business_function);
    }
    if (data.department) {
      formData.append('department', data.department);
    }
    if (data.unit) {
      formData.append('unit', data.unit);
    }
    if (data.jobFunction || data.job_function) {
      formData.append('job_function', data.jobFunction || data.job_function);
    }
    if (data.positionGroup || data.position_group) {
      formData.append('position_group', data.positionGroup || data.position_group);
    }
    if (data.gradingLevel || data.grading_level) {
      formData.append('grading_level', data.gradingLevel || data.grading_level);
    }
    
    // Management
    if (data.lineManager || data.line_manager) {
      formData.append('line_manager', data.lineManager || data.line_manager);
    }
    
    // Contract Information
    if (data.startDate || data.start_date) {
      formData.append('start_date', data.startDate || data.start_date);
    }
    if (data.endDate || data.end_date) {
      formData.append('end_date', data.endDate || data.end_date);
    }
    if (data.contractDuration || data.contract_duration) {
      formData.append('contract_duration', data.contractDuration || data.contract_duration);
    }
    if (data.contractStartDate || data.contract_start_date) {
      formData.append('contract_start_date', data.contractStartDate || data.contract_start_date);
    }
    
    // Visibility
    if (data.isVisibleInOrgChart !== undefined) {
      formData.append('is_visible_in_org_chart', data.isVisibleInOrgChart);
    }
    
    // Notes
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    // Tags
    if (data.tags || data.tagIds) {
      const tagIds = data.tags || data.tagIds || [];
      tagIds.forEach(tagId => {
        formData.append('tag_ids', tagId);
      });
    }
    
    // Files
    if (data.profilePhoto || data.profile_photo) {
      formData.append('profile_photo', data.profilePhoto || data.profile_photo);
    }
    if (data.document) {
      formData.append('document', data.document);
      if (data.documentType || data.document_type) {
        formData.append('document_type', data.documentType || data.document_type);
      }
      if (data.documentName || data.document_name) {
        formData.append('document_name', data.documentName || data.document_name);
      }
    }
    
    return apiService.updateEmployee(id, formData);
  },

  getActivities: (employeeId) => apiService.getEmployeeActivities(employeeId),
  getDirectReports: (employeeId) => apiService.getEmployeeDirectReports(employeeId),

  getStatistics: () => apiService.getEmployeeStatistics(),
  
  bulkUpload: (file) => apiService.bulkUploadEmployees(file),
  
  // ========================================
  // ORG CHART VISIBILITY - YENİ
  // ========================================
  toggleOrgChartVisibility: (employeeId) => apiService.toggleOrgChartVisibility(employeeId),
  bulkToggleOrgChartVisibility: (employeeIds, setVisible) => 
    apiService.bulkToggleOrgChartVisibility(employeeIds, setVisible),
  
  showInOrgChart: (employeeIds) => {
    const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
    return apiService.bulkToggleOrgChartVisibility(ids, true);
  },
  
  hideFromOrgChart: (employeeIds) => {
    const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
    return apiService.bulkToggleOrgChartVisibility(ids, false);
  },
  
  // ========================================
  // TAG MANAGEMENT
  // ========================================
  addTag: (data) => apiService.addEmployeeTag(data),
  removeTag: (data) => apiService.removeEmployeeTag(data),
  bulkAddTags: (employeeIds, tagId) => apiService.bulkAddTags(employeeIds, tagId),
  bulkRemoveTags: (employeeIds, tagId) => apiService.bulkRemoveTags(employeeIds, tagId),
  
  // ========================================
  // LINE MANAGER MANAGEMENT
  // ========================================
  assignLineManager: (data) => apiService.assignLineManager(data),
  bulkAssignLineManager: (data) => apiService.bulkAssignLineManager(data),
  


export: (params = {}) => {

  const filterParams = params._queryParams || {};
  
  const exportPayload = {
    export_format: params.format || 'excel',
    employee_ids: params.employee_ids || [],
    include_fields: params.include_fields || 'all',
    ...filterParams 
  };
  
  // ✅ Call apiService
  return apiService.exportEmployees(
    exportPayload.export_format,
    exportPayload
  );
},
downloadTemplate: () => apiService.downloadEmployeeTemplate(),
  

  getEmployeeGrading: () => apiService.getEmployeeGrading(),
 
  
  
  
  // ========================================
  // PROFILE IMAGES
  // ========================================
  uploadProfileImage: (employeeId, file) => apiService.uploadProfileImage(employeeId, file),
  deleteProfileImage: (employeeId) => apiService.deleteProfileImage(employeeId),
  
  // ========================================
  // ADVANCED SEARCH HELPERS - Enhanced
  // ========================================
  searchEmployees: (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    return employeeAPI.getAll(params);
  },
  
  // Advanced search with comprehensive filtering
  searchAdvanced: (searchParams) => {
    return employeeAPI.getAll(searchParams);
  },
  
  // Filter presets
  getActiveEmployees: (additionalFilters = {}) => {
    return employeeAPI.getAll({
      status: ['ACTIVE'],
      is_active: true,
      ...additionalFilters
    });
  },
  
  getEmployeesByStatus: (statusIds, additionalFilters = {}) => {
    return employeeAPI.getAll({
      status: Array.isArray(statusIds) ? statusIds : [statusIds],
      ...additionalFilters
    });
  },
  
  getEmployeesByDepartment: (departmentIds, additionalFilters = {}) => {
    return employeeAPI.getAll({
      department: Array.isArray(departmentIds) ? departmentIds : [departmentIds],
      ...additionalFilters
    });
  },
  
  getEmployeesByBusinessFunction: (businessFunctionIds, additionalFilters = {}) => {
    return employeeAPI.getAll({
      business_function: Array.isArray(businessFunctionIds) ? businessFunctionIds : [businessFunctionIds],
      ...additionalFilters
    });
  },

  getOrgChartEmployees: (visible = true, additionalFilters = {}) => {
    return employeeAPI.getAll({
      is_visible_in_org_chart: visible,
      ...additionalFilters
    });
  },

  batchAssignManager: (employeeIds, managerId) => {
    return employeeAPI.bulkAssignLineManager({
      employee_ids: employeeIds,
      line_manager_id: managerId
    });
  },
  
  batchAddTags: (employeeIds, tagIds) => {
    if (Array.isArray(tagIds)) {
      return Promise.all(tagIds.map(tagId => 
        employeeAPI.bulkAddTags(employeeIds, tagId)
      ));
    } else {
      return employeeAPI.bulkAddTags(employeeIds, tagIds);
    }
  },
  
  batchRemoveTags: (employeeIds, tagIds) => {
    if (Array.isArray(tagIds)) {
      return Promise.all(tagIds.map(tagId => 
        employeeAPI.bulkRemoveTags(employeeIds, tagId)
      ));
    } else {
      return employeeAPI.bulkRemoveTags(employeeIds, tagIds);
    }
  },
  
  // Comprehensive batch operation method
  batchOperation: (operation, employeeIds, data = {}) => {
    return apiService.batchOperation(operation, employeeIds, data);
  },
  
  // ========================================
  // SORTING & FILTERING HELPERS - Enhanced
  // ========================================
  
  // Multiple sorting support
  getEmployeesWithSorting: (sortingArray, additionalParams = {}) => {
    return employeeAPI.getAll({
      ordering: sortingArray,
      ...additionalParams
    });
  },
  
  // Advanced filtering with comprehensive options
  getEmployeesWithAdvancedFilters: (filters) => {
    const processedFilters = {
      // Text searches
      search: filters.generalSearch,
      employee_search: filters.employeeSearch,
      line_manager_search: filters.managerSearch,
      job_title_search: filters.jobTitleSearch,
      
      // Multi-select filters
      business_function: filters.businessFunctions,
      department: filters.departments,
      unit: filters.units,
      job_function: filters.jobFunctions,
      position_group: filters.positionGroups,
      status: filters.statuses,
      grading_level: filters.gradingLevels,
      contract_duration: filters.contractDurations,
      line_manager: filters.lineManagers,
      tags: filters.tags,
      gender: filters.genders,
      
      // Date ranges
      start_date_range: filters.startDateRange,
      contract_end_date_range: filters.contractEndDateRange,
      
      // Numeric ranges
      years_of_service_range: filters.serviceYearsRange,
      
      // Boolean filters
      is_active: filters.isActive,
      is_visible_in_org_chart: filters.isOrgChartVisible,
      is_deleted: filters.includeDeleted,

      
      // Sorting
      ordering: filters.sorting,
      
      // Pagination
      page: filters.page,
      page_size: filters.pageSize
    };
    
    // Remove undefined/null values
    Object.keys(processedFilters).forEach(key => {
      if (processedFilters[key] === undefined || processedFilters[key] === null) {
        delete processedFilters[key];
      }
    });
    
    return employeeAPI.getAll(processedFilters);
  },
  
  // ========================================
  // VALIDATION HELPERS - Enhanced
  // ========================================
  validateEmployeeData: (data) => {
    const errors = {};
    
    // Required fields validation
    if (!data.employee_id?.trim()) {
      errors.employee_id = 'Employee ID is required';
    }
    if (!data.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!data.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }
    if (!data.job_title?.trim()) {
      errors.job_title = 'Job title is required';
    }
    if (!data.business_function) {
      errors.business_function = 'Company is required';
    }
    if (!data.department) {
      errors.department = 'Department is required';
    }
    if (!data.job_function) {
      errors.job_function = 'Job function is required';
    }
    if (!data.position_group) {
      errors.position_group = 'Position group is required';
    }
    if (!data.start_date) {
      errors.start_date = 'Start date is required';
    }
    if (!data.contract_duration) {
      errors.contract_duration = 'Contract duration is required';
    }
    
    // Date validation
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    // Contract validation
    if (data.contract_start_date && data.start_date) {
      const contractStart = new Date(data.contract_start_date);
      const employeeStart = new Date(data.start_date);
      if (contractStart < employeeStart) {
        errors.contract_start_date = 'Contract start date cannot be before employee start date';
      }
    }
    
    // Phone validation
    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  // Validate filter parameters
  validateFilterParams: (params) => {
    const errors = {};
    const warnings = [];
    
    // Date range validation
    if (params.start_date_range) {
      const { from, to } = params.start_date_range;
      if (from && to && new Date(from) > new Date(to)) {
        errors.start_date_range = 'Start date "from" cannot be after "to" date';
      }
    }
    
    if (params.contract_end_date_range) {
      const { from, to } = params.contract_end_date_range;
      if (from && to && new Date(from) > new Date(to)) {
        errors.contract_end_date_range = 'Contract end date "from" cannot be after "to" date';
      }
    }
    
    // Numeric range validation
    if (params.years_of_service_range) {
      const { min, max } = params.years_of_service_range;
      if (min !== null && max !== null && min > max) {
        errors.years_of_service_range = 'Minimum years of service cannot be greater than maximum';
      }
      if (min < 0 || max < 0) {
        errors.years_of_service_range = 'Years of service cannot be negative';
      }
    }
    
    // Array validation
    const arrayFields = [
      'business_function', 'department', 'unit', 'job_function', 
      'position_group', 'status', 'grading_level', 'contract_duration',
      'line_manager', 'tags', 'gender'
    ];
    
    arrayFields.forEach(field => {
      if (params[field] && Array.isArray(params[field]) && params[field].length === 0) {
        warnings.push(`${field} filter is empty and will be ignored`);
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  },
  
  // ========================================
  // DATA TRANSFORMATION HELPERS - Enhanced
  // ========================================
  transformEmployeeData: (rawData) => {
    return {
      id: rawData.id,
      employeeId: rawData.employee_id,
      firstName: rawData.first_name,
      lastName: rawData.last_name,
      fullName: rawData.name || `${rawData.first_name} ${rawData.last_name}`,
      displayName: rawData.name || `${rawData.first_name || ''} ${rawData.last_name || ''}`.trim(),
      email: rawData.email,
      phone: rawData.phone,
      gender: rawData.gender,
      dateOfBirth: rawData.date_of_birth,
      fatherName: rawData.father_name,
      address: rawData.address,
      emergencyContact: rawData.emergency_contact,
      jobTitle: rawData.job_title,
      businessFunction: rawData.business_function,
      businessFunctionName: rawData.business_function_name,
      businessFunctionCode: rawData.business_function_code,
      department: rawData.department,
      departmentName: rawData.department_name,
      unit: rawData.unit,
      unitName: rawData.unit_name,
      jobFunction: rawData.job_function,
      jobFunctionName: rawData.job_function_name,
      positionGroup: rawData.position_group,
      positionGroupName: rawData.position_group_name,
      positionGroupLevel: rawData.position_group_level,
      gradingLevel: rawData.grading_level,
      lineManager: rawData.line_manager,
      lineManagerName: rawData.line_manager_name,
      lineManagerHcNumber: rawData.line_manager_hc_number,
      startDate: rawData.start_date,
      endDate: rawData.end_date,
      contractDuration: rawData.contract_duration,
      contractStartDate: rawData.contract_start_date,
      contractEndDate: rawData.contract_end_date,


      yearsOfService: rawData.years_of_service,
      status: rawData.status_name || rawData.current_status_display,
      statusColor: rawData.status_color,
      tags: rawData.tag_names || [],
      tagNames: rawData.tag_names || [],
      isVisibleInOrgChart: rawData.is_visible_in_org_chart,
      directReportsCount: rawData.direct_reports_count || 0,
   
      profileImageUrl: rawData.profile_image_url,
      createdAt: rawData.created_at,
      updatedAt: rawData.updated_at,
      isDeleted: rawData.is_deleted || false,
      deletedAt: rawData.deleted_at,
      
      // Computed properties
      isActive: rawData.status_name === 'ACTIVE' || rawData.status_name === 'Active',
      isOnLeave: rawData.status_name === 'ON_LEAVE',
      isOnboarding: rawData.status_name === 'ONBOARDING',
      isProbation: rawData.status_name === 'PROBATION',
      isNewHire: (rawData.years_of_service || 0) < 0.25,
      hasLineManager: !!rawData.line_manager,
      isLineManager: (rawData.direct_reports_count || 0) > 0,
      hasGrade: !!rawData.grading_level,
      hasTags: (rawData.tag_names || []).length > 0,
    
    };
  },
  
  // Transform multiple employees
  transformEmployeeList: (employeeList) => {
    if (!Array.isArray(employeeList)) {
      return [];
    }
    return employeeList.map(emp => employeeAPI.transformEmployeeData(emp));
  },

  
  // ========================================
  // ADVANCED FILTERING PRESETS - Enhanced
  // ========================================
  
  // Predefined filter combinations
  filterPresets: {
    // Status-based presets
    activeEmployees: () => ({ status: ['ACTIVE'], is_active: true }),
    inactiveEmployees: () => ({ is_active: false }),
    onboardingEmployees: () => ({ status: ['ONBOARDING'] }),
    probationEmployees: () => ({ status: ['PROBATION'] }),
    onLeaveEmployees: () => ({ status: ['ON_LEAVE'] }),
    
    // Performance-based presets
    needsGrading: () => ({ grading_level: [] }),
    highPerformers: () => ({ grading_level: ['_UQ', '_UD'] }),
    newHires: () => ({ years_of_service_range: { min: 0, max: 0.25 } }),

    
    // Management-based presets
    noLineManager: () => ({ line_manager: null }),
    managers: () => ({ direct_reports_count_min: 1 }),
    topLevel: () => ({ position_group_level: 1 }),
    

    
    // Visibility presets
    orgChartVisible: () => ({ is_visible_in_org_chart: true }),
    orgChartHidden: () => ({ is_visible_in_org_chart: false }),
    
   
  },
  
  // Apply preset filter
  applyFilterPreset: (presetName, additionalFilters = {}) => {
    const preset = employeeAPI.filterPresets[presetName];
    if (!preset) {
      throw new Error(`Unknown filter preset: ${presetName}`);
    }
    
    const presetFilters = preset();
    return employeeAPI.getAll({ ...presetFilters, ...additionalFilters });
  },
  
  // Get all available presets
  getAvailablePresets: () => {
    return Object.keys(employeeAPI.filterPresets).map(key => ({
      key,
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      description: `Filter employees by ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`
    }));
  },
  
  // ========================================
  // BULK EXPORT HELPERS - Enhanced
  // ========================================
  
  // Export with current filters
  exportWithFilters: async (filters, format = 'excel', options = {}) => {
    const exportParams = {
      ...filters,
      format: format,
      include_headers: options.includeHeaders !== false,
      include_images: options.includeImages || false,
      include_documents: options.includeDocuments || false,
      fields: options.fields || 'all'
    };
    
    return await apiService.exportEmployees(exportParams);
  },
  
  // Export selected employees with custom fields
  exportSelected: async (employeeIds, options = {}) => {
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      throw new Error('No employees selected for export');
    }
    
    const exportParams = {
      employee_ids: employeeIds,
      format: options.format || 'excel',
      fields: options.fields || 'all',
      include_headers: options.includeHeaders !== false,
      include_images: options.includeImages || false,
      include_documents: options.includeDocuments || false
    };
    
    return await apiService.exportEmployees(exportParams);
  },
  
  // Export by preset filter
  exportByPreset: async (presetName, format = 'excel', options = {}) => {
    const preset = employeeAPI.filterPresets[presetName];
    if (!preset) {
      throw new Error(`Unknown filter preset: ${presetName}`);
    }
    
    const presetFilters = preset();
    return await employeeAPI.exportWithFilters(presetFilters, format, options);
  }
};



export { employeeAPI as default };