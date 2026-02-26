// src/store/api/referenceDataAPI.js - Job Titles əlavə edilib
import { apiService } from '../../services/api';

export const referenceDataAPI = {
  // ========================================
  // Companys
  // ========================================
  getBusinessFunctions: () => apiService.getBusinessFunctions(),
  getBusinessFunction: (id) => apiService.getBusinessFunction(id),
  getBusinessFunctionDropdown: () => {
    return apiService.getBusinessFunctions().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          code: item.code,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createBusinessFunction: (data) => apiService.createBusinessFunction(data),
  updateBusinessFunction: (id, data) => apiService.updateBusinessFunction(id, data),
  deleteBusinessFunction: (id) => apiService.deleteBusinessFunction(id),

  // ========================================
  // DEPARTMENTS
  // ========================================
  getDepartments: (businessFunctionId) => {
    const params = businessFunctionId ? { business_function: businessFunctionId } : {};
    return apiService.getDepartments(params);
  },
  getDepartment: (id) => apiService.getDepartment(id),
  getDepartmentDropdown: (businessFunctionId) => {
    const params = businessFunctionId ? { business_function: businessFunctionId } : {};
    return apiService.getDepartments(params).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: {
          results: data.map(item => ({
            value: item.id,
            label: item.name,
            business_function: item.business_function,
             business_function_id: item.business_function_id || item.business_function,
            business_function_name: item.business_function_name,
            business_function_code: item.business_function_code,
            employee_count: item.employee_count,
            unit_count: item.unit_count,
            is_active: item.is_active
          }))
        }
      };
    });
  },
  createDepartment: (data) => apiService.createDepartment(data),
  updateDepartment: (id, data) => apiService.updateDepartment(id, data),
  deleteDepartment: (id) => apiService.deleteDepartment(id),

  // ========================================
  // UNITS
  // ========================================
  getUnits: (departmentId) => {
    const params = departmentId ? { department: departmentId } : {};
    return apiService.getUnits(params);
  },
  getUnit: (id) => apiService.getUnit(id),
  getUnitDropdown: (departmentId) => {
    const params = departmentId ? { department: departmentId } : {};
    return apiService.getUnits(params).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          department: item.department,
          department_id: item.department_id || item.department,
          department_name: item.department_name,
          business_function_name: item.business_function_name,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createUnit: (data) => apiService.createUnit(data),
  updateUnit: (id, data) => apiService.updateUnit(id, data),
  deleteUnit: (id) => apiService.deleteUnit(id),

  // ========================================
  // JOB FUNCTIONS
  // ========================================
    getJobFunctions: () => apiService.getJobFunctions(),
  getJobFunction: (id) => apiService.getJobFunction(id),
  getJobFunctionDropdown: () => {
    return apiService.getJobFunctions({ page_size: 1000 }).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createJobFunction: (data) => apiService.createJobFunction(data),
  updateJobFunction: (id, data) => apiService.updateJobFunction(id, data),
  deleteJobFunction: (id) => apiService.deleteJobFunction(id),



// ========================================
// JOB TITLES - ✅ FINAL FIX
// ========================================
getJobTitles: (params = {}) => {

  const defaultParams = { page_size: 1000, ...params };

  const queryString = buildQueryParams(defaultParams);
 

  return api.get(`/job-titles/?${queryString}`);
},

getJobTitle: (id) => apiService.getJobTitle(id),

getJobTitleDropdown: () => {
  return apiService.getJobTitles({ page_size: 1000 }).then(response => {

    let dataArray;
    
    if (response.data.results) {
      // ✅ Pagination formatında (DRF default)
      dataArray = response.data.results;

    } else if (Array.isArray(response.data)) {
      // ✅ Direct array formatında
      dataArray = response.data;

    } else {
   
      dataArray = [];
    }
    
    return {
      ...response,
      data: dataArray.map(item => ({
        value: item.id,
        label: item.name,
        description: item.description,
        employee_count: item.employee_count,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
    };
  });
},

createJobTitle: (data) => apiService.createJobTitle(data),
updateJobTitle: (id, data) => apiService.updateJobTitle(id, data),
deleteJobTitle: (id) => apiService.deleteJobTitle(id),

  // ========================================
  // POSITION GROUPS
  // ========================================
  getPositionGroups: () => apiService.getPositionGroups(),
  getPositionGroup: (id) => apiService.getPositionGroup(id),
  getPositionGroupsByHierarchy: () => {
    return apiService.getPositionGroups({ ordering: 'hierarchy_level' });
  },
  getPositionGroupDropdown: () => {
    return apiService.getPositionGroups({ page_size: 1000 }).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.display_name || item.name,
          name: item.name,
          hierarchy_level: item.hierarchy_level,
          grading_shorthand: item.grading_shorthand,
          grading_levels: item.grading_levels,
          employee_count: item.employee_count,
          is_active: item.is_active
        })).sort((a, b) => a.hierarchy_level - b.hierarchy_level)
      };
    });
  },
  getPositionGroupGradingLevels: (id) => apiService.getPositionGroupGradingLevels(id),
  createPositionGroup: (data) => apiService.createPositionGroup(data),
  updatePositionGroup: (id, data) => apiService.updatePositionGroup(id, data),
  deletePositionGroup: (id) => apiService.deletePositionGroup(id),

  // ========================================
  // EMPLOYEE STATUSES
  // ========================================
  getEmployeeStatuses: () => apiService.getEmployeeStatuses(),
  getEmployeeStatus: (id) => apiService.getEmployeeStatus(id),
  getEmployeeStatusDropdown: () => {
    return apiService.getEmployeeStatuses().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          status_type: item.status_type,
          color: item.color,
          affects_headcount: item.affects_headcount,
          allows_org_chart: item.allows_org_chart,
          auto_transition_enabled: item.auto_transition_enabled,
          auto_transition_days: item.auto_transition_days,
          auto_transition_to: item.auto_transition_to,
          is_transitional: item.is_transitional,
          transition_priority: item.transition_priority,
          send_notifications: item.send_notifications,
          notification_template: item.notification_template,
          is_system_status: item.is_system_status,
          is_default_for_new_employees: item.is_default_for_new_employees,
          employee_count: item.employee_count,
          is_active: item.is_active,
          order: item.order
        })).sort((a, b) => (a.order || 0) - (b.order || 0))
      };
    });
  },
  createEmployeeStatus: (data) => apiService.createEmployeeStatus(data),
  updateEmployeeStatus: (id, data) => apiService.updateEmployeeStatus(id, data),
  deleteEmployeeStatus: (id) => apiService.deleteEmployeeStatus(id),

  // ========================================
  // EMPLOYEE TAGS
  // ========================================
  getEmployeeTags: (tagType) => {
    const params = tagType ? { tag_type: tagType } : {};
    return apiService.getEmployeeTags(params);
  },
  getEmployeeTag: (id) => apiService.getEmployeeTag(id),
  getEmployeeTagDropdown: (tagType) => {
    const params = tagType ? { tag_type: tagType } : {};
    return apiService.getEmployeeTags(params).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          tag_type: item.tag_type,
          color: item.color,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createEmployeeTag: (data) => apiService.createEmployeeTag(data),
  updateEmployeeTag: (id, data) => apiService.updateEmployeeTag(id, data),
  deleteEmployeeTag: (id) => apiService.deleteEmployeeTag(id),

  // ========================================
  // CONTRACT CONFIGS
  // ========================================
  getContractConfigs: () => apiService.getContractConfigs(),
  getContractConfig: (id) => apiService.getContractConfig(id),
  getContractConfigDropdown: () => {
    return apiService.getContractConfigs().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.contract_type,
          label: item.display_name,
          contract_type: item.contract_type,
  
          probation_days: item.probation_days,
          total_days_until_active: item.total_days_until_active,
          enable_auto_transitions: item.enable_auto_transitions,
          transition_to_inactive_on_end: item.transition_to_inactive_on_end,
          notify_days_before_end: item.notify_days_before_end,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createContractConfig: (data) => apiService.createContractConfig(data),
  updateContractConfig: (id, data) => apiService.updateContractConfig(id, data),
  deleteContractConfig: (id) => apiService.deleteContractConfig(id),


  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  
  // Get all reference data at once for forms
  getAllReferenceData: async () => {
    try {
      const [
        businessFunctions,
        jobFunctions,
        jobTitles,
        positionGroups,
        employeeStatuses,
        employeeTags,
        contractConfigs
      ] = await Promise.all([
        referenceDataAPI.getBusinessFunctionDropdown(),
        referenceDataAPI.getJobFunctionDropdown(),
        referenceDataAPI.getJobTitleDropdown(),
        referenceDataAPI.getPositionGroupDropdown(),
        referenceDataAPI.getEmployeeStatusDropdown(),
        referenceDataAPI.getEmployeeTagDropdown(),
        referenceDataAPI.getContractConfigDropdown()
      ]);

      return {
        businessFunctions: businessFunctions.data,
        jobFunctions: jobFunctions.data,
        jobTitles: jobTitles.data,
        positionGroups: positionGroups.data,
        employeeStatuses: employeeStatuses.data,
        employeeTags: employeeTags.data,
        contractConfigs: contractConfigs.data
      };
    } catch (error) {
      throw new Error('Failed to fetch reference data: ' + error.message);
    }
  },

  // Get hierarchical data
  getHierarchicalData: async (businessFunctionId, departmentId) => {
    try {
      const promises = [referenceDataAPI.getBusinessFunctionDropdown()];
      
      if (businessFunctionId) {
        promises.push(referenceDataAPI.getDepartmentDropdown(businessFunctionId));
        
        if (departmentId) {
          promises.push(referenceDataAPI.getUnitDropdown(departmentId));
        }
      }

      const results = await Promise.all(promises);
      
      return {
        businessFunctions: results[0].data,
        departments: results[1]?.data.results || [],
        units: results[2]?.data || []
      };
    } catch (error) {
      throw new Error('Failed to fetch hierarchical data: ' + error.message);
    }
  },

  // Validate hierarchical relationships
  validateHierarchy: async (businessFunctionId, departmentId, unitId) => {
    try {
      const validations = {};

      if (businessFunctionId) {
        const bf = await referenceDataAPI.getBusinessFunction(businessFunctionId);
        validations.businessFunction = bf.data.is_active;
      }

      if (departmentId) {
        const dept = await referenceDataAPI.getDepartment(departmentId);
        validations.department = dept.data.is_active && 
          (!businessFunctionId || dept.data.business_function === parseInt(businessFunctionId));
      }

      if (unitId) {
        const unit = await referenceDataAPI.getUnit(unitId);
        validations.unit = unit.data.is_active && 
          (!departmentId || unit.data.department === parseInt(departmentId));
      }

      return validations;
    } catch (error) {
      throw new Error('Failed to validate hierarchy: ' + error.message);
    }
  },

  // Get entity counts for statistics
  getEntityCounts: async () => {
    try {
      const [
        businessFunctions,
        departments,
        units,
        jobFunctions,
        jobTitles,
        positionGroups,
        employeeStatuses,
        employeeTags,
        contractConfigs
      ] = await Promise.all([
        referenceDataAPI.getBusinessFunctions(),
        referenceDataAPI.getDepartments(),
        referenceDataAPI.getUnits(),
        referenceDataAPI.getJobFunctions(),
        referenceDataAPI.getJobTitles(),
        referenceDataAPI.getPositionGroups(),
        referenceDataAPI.getEmployeeStatuses(),
        referenceDataAPI.getEmployeeTags(),
        referenceDataAPI.getContractConfigs()
      ]);

      return {
        businessFunctions: businessFunctions.data.count || businessFunctions.data.length || 0,
        departments: departments.data.count || departments.data.length || 0,
        units: units.data.count || units.data.length || 0,
        jobFunctions: jobFunctions.data.count || jobFunctions.data.length || 0,
        jobTitles: jobTitles.data.count || jobTitles.data.length || 0,
        positionGroups: positionGroups.data.count || positionGroups.data.length || 0,
        employeeStatuses: employeeStatuses.data.count || employeeStatuses.data.length || 0,
        employeeTags: employeeTags.data.count || employeeTags.data.length || 0,
        contractConfigs: contractConfigs.data.count || contractConfigs.data.length || 0
      };
    } catch (error) {
      throw new Error('Failed to fetch entity counts: ' + error.message);
    }
  },

  // Search across all reference data
  searchReferenceData: async (searchTerm, types = []) => {
    try {
      const searchPromises = [];
      const searchTypes = types.length > 0 ? types : [
        'businessFunctions', 'departments', 'units', 'jobFunctions', 'jobTitles',
        'positionGroups', 'employeeStatuses', 'employeeTags', 'contractConfigs'
      ];

      if (searchTypes.includes('businessFunctions')) {
        searchPromises.push(
          referenceDataAPI.getBusinessFunctions({ search: searchTerm })
            .then(res => ({ type: 'businessFunctions', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('departments')) {
        searchPromises.push(
          referenceDataAPI.getDepartments({ search: searchTerm })
            .then(res => ({ type: 'departments', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('units')) {
        searchPromises.push(
          referenceDataAPI.getUnits({ search: searchTerm })
            .then(res => ({ type: 'units', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('jobFunctions')) {
        searchPromises.push(
          referenceDataAPI.getJobFunctions({ search: searchTerm })
            .then(res => ({ type: 'jobFunctions', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('jobTitles')) {
        searchPromises.push(
          referenceDataAPI.getJobTitles({ search: searchTerm })
            .then(res => ({ type: 'jobTitles', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('positionGroups')) {
        searchPromises.push(
          referenceDataAPI.getPositionGroups({ search: searchTerm })
            .then(res => ({ type: 'positionGroups', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('employeeStatuses')) {
        searchPromises.push(
          referenceDataAPI.getEmployeeStatuses({ search: searchTerm })
            .then(res => ({ type: 'employeeStatuses', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('employeeTags')) {
        searchPromises.push(
          referenceDataAPI.getEmployeeTags({ search: searchTerm })
            .then(res => ({ type: 'employeeTags', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('contractConfigs')) {
        searchPromises.push(
          referenceDataAPI.getContractConfigs({ search: searchTerm })
            .then(res => ({ type: 'contractConfigs', data: res.data.results || res.data }))
        );
      }

      const results = await Promise.all(searchPromises);
      
      return results.reduce((acc, result) => {
        acc[result.type] = result.data;
        return acc;
      }, {});
    } catch (error) {
      throw new Error('Failed to search reference data: ' + error.message);
    }
  },

  // Get filtered data by active status
  getActiveOnly: async (entityType) => {
    try {
      let response;
      
      switch (entityType) {
        case 'businessFunctions':
          response = await referenceDataAPI.getBusinessFunctions({ is_active: true });
          break;
        case 'departments':
          response = await referenceDataAPI.getDepartments({ is_active: true });
          break;
        case 'units':
          response = await referenceDataAPI.getUnits({ is_active: true });
          break;
        case 'jobFunctions':
          response = await referenceDataAPI.getJobFunctions({ is_active: true });
          break;
        case 'jobTitles':
          response = await referenceDataAPI.getJobTitles({ is_active: true });
          break;
        case 'positionGroups':
          response = await referenceDataAPI.getPositionGroups({ is_active: true });
          break;
        case 'employeeStatuses':
          response = await referenceDataAPI.getEmployeeStatuses({ is_active: true });
          break;
        case 'employeeTags':
          response = await referenceDataAPI.getEmployeeTags({ is_active: true });
          break;
        case 'contractConfigs':
          response = await referenceDataAPI.getContractConfigs({ is_active: true });
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      
      return response.data.results || response.data;
    } catch (error) {
      throw new Error(`Failed to fetch active ${entityType}: ` + error.message);
    }
  }
};

export default referenceDataAPI;