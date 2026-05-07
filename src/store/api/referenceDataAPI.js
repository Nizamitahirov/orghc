import { apiService } from '../../services/api';

export const referenceDataAPI = {
  // ── Business Functions ─────────────────────────────────────────────────────
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
          is_active: item.is_active,
        })),
      };
    });
  },
  createBusinessFunction: (data) => apiService.post('/api/business-functions', data),
  updateBusinessFunction: (id, data) => apiService.put(`/api/business-functions/${id}`, data),
  deleteBusinessFunction: (id) => apiService.delete(`/api/business-functions/${id}`),

  // ── Departments ────────────────────────────────────────────────────────────
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
            is_active: item.is_active,
          })),
        },
      };
    });
  },
  createDepartment: (data) => apiService.createDepartment(data),
  updateDepartment: (id, data) => apiService.updateDepartment(id, data),
  deleteDepartment: (id) => apiService.deleteDepartment(id),

  // ── Units (stubs — no unit data in mock) ──────────────────────────────────
  getUnits: () => apiService.getUnits(),
  getUnit: (id) => ({ data: {} }),
  getUnitDropdown: () => {
    return apiService.getUnits().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          department: item.department,
          department_name: item.department_name,
          business_function_name: item.business_function_name,
          employee_count: item.employee_count,
          is_active: item.is_active,
        })),
      };
    });
  },
  createUnit: (data) => ({ data: { ...data, id: Date.now() } }),
  updateUnit: (id, data) => ({ data: { id, ...data } }),
  deleteUnit: (id) => ({ data: { success: true } }),

  // ── Job Functions ──────────────────────────────────────────────────────────
  getJobFunctions: () => apiService.getJobFunctions(),
  getJobFunction: (id) => ({ data: {} }),
  getJobFunctionDropdown: () => {
    return apiService.getJobFunctions().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          employee_count: item.employee_count,
          is_active: item.is_active,
        })),
      };
    });
  },
  createJobFunction: (data) => ({ data: { ...data, id: Date.now() } }),
  updateJobFunction: (id, data) => ({ data: { id, ...data } }),
  deleteJobFunction: (id) => ({ data: { success: true } }),

  // ── Employment Types ───────────────────────────────────────────────────────
  getEmploymentTypes: () => apiService.getEmploymentTypes(),
  getEmploymentType: (id) => ({ data: {} }),
  getEmploymentTypeDropdown: () => {
    return apiService.getEmploymentTypes().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: (Array.isArray(data) ? data : []).map(item => ({
          value: item.id,
          label: item.name || item.code,
          name: item.name,
          code: item.code,
          is_active: item.is_active,
        })),
      };
    });
  },
  createEmploymentType: (data) => ({ data: { ...data, id: Date.now() } }),
  updateEmploymentType: (id, data) => ({ data: { id, ...data } }),
  deleteEmploymentType: (id) => ({ data: { success: true } }),

  // ── Job Titles ─────────────────────────────────────────────────────────────
  getJobTitles: () => apiService.getJobTitles(),
  getJobTitle: (id) => ({ data: {} }),
  getJobTitleDropdown: () => {
    return apiService.getJobTitles().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: (Array.isArray(data) ? data : []).map(item => ({
          value: item.id,
          label: item.name,
          is_active: item.is_active,
        })),
      };
    });
  },
  createJobTitle: (data) => ({ data: { ...data, id: Date.now() } }),
  updateJobTitle: (id, data) => ({ data: { id, ...data } }),
  deleteJobTitle: (id) => ({ data: { success: true } }),

  // ── Position Groups ────────────────────────────────────────────────────────
  getPositionGroups: () => apiService.getPositionGroups(),
  getPositionGroup: (id) => ({ data: {} }),
  getPositionGroupsByHierarchy: () => apiService.getPositionGroups(),
  getPositionGroupDropdown: () => {
    return apiService.getPositionGroups().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: (Array.isArray(data) ? data : []).map(item => ({
          value: item.id,
          label: item.display_name || item.name,
          name: item.name,
          hierarchy_level: item.hierarchy_level || 0,
          grading_shorthand: item.grading_shorthand,
          grading_levels: item.grading_levels || [],
          employee_count: item.employee_count,
          is_active: item.is_active,
        })).sort((a, b) => a.hierarchy_level - b.hierarchy_level),
      };
    });
  },
  getPositionGroupGradingLevels: () => ({ data: [] }),
  createPositionGroup: (data) => ({ data: { ...data, id: Date.now() } }),
  updatePositionGroup: (id, data) => ({ data: { id, ...data } }),
  deletePositionGroup: (id) => ({ data: { success: true } }),

  // ── Employee Statuses ──────────────────────────────────────────────────────
  getEmployeeStatuses: () => apiService.getEmployeeStatuses(),
  getEmployeeStatus: (id) => ({ data: {} }),
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
          is_active: item.is_active,
          order: item.order || 0,
        })).sort((a, b) => (a.order || 0) - (b.order || 0)),
      };
    });
  },
  createEmployeeStatus: (data) => ({ data: { ...data, id: Date.now() } }),
  updateEmployeeStatus: (id, data) => ({ data: { id, ...data } }),
  deleteEmployeeStatus: (id) => ({ data: { success: true } }),

  // ── Employee Tags ──────────────────────────────────────────────────────────
  getEmployeeTags: (tagType) => apiService.getEmployeeTags(),
  getEmployeeTag: (id) => ({ data: {} }),
  getEmployeeTagDropdown: () => {
    return apiService.getEmployeeTags().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          tag_type: item.tag_type,
          color: item.color,
          is_active: item.is_active,
        })),
      };
    });
  },
  createEmployeeTag: (data) => ({ data: { ...data, id: Date.now() } }),
  updateEmployeeTag: (id, data) => ({ data: { id, ...data } }),
  deleteEmployeeTag: (id) => ({ data: { success: true } }),

  // ── Contract Configs ───────────────────────────────────────────────────────
  getContractConfigs: () => apiService.getContractConfigs(),
  getContractConfig: (id) => ({ data: {} }),
  getContractConfigDropdown: () => {
    return apiService.getContractConfigs().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.contract_type || item.id,
          label: item.display_name || item.name,
          contract_type: item.contract_type,
          is_active: item.is_active,
        })),
      };
    });
  },
  createContractConfig: (data) => ({ data: { ...data, id: Date.now() } }),
  updateContractConfig: (id, data) => ({ data: { id, ...data } }),
  deleteContractConfig: (id) => ({ data: { success: true } }),

  // ── Helpers ────────────────────────────────────────────────────────────────
  getAllReferenceData: async () => {
    try {
      const [
        businessFunctions,
        jobFunctions,
        jobTitles,
        positionGroups,
        employeeStatuses,
        employeeTags,
        contractConfigs,
      ] = await Promise.all([
        referenceDataAPI.getBusinessFunctionDropdown(),
        referenceDataAPI.getJobFunctionDropdown(),
        referenceDataAPI.getJobTitleDropdown(),
        referenceDataAPI.getPositionGroupDropdown(),
        referenceDataAPI.getEmployeeStatusDropdown(),
        referenceDataAPI.getEmployeeTagDropdown(),
        referenceDataAPI.getContractConfigDropdown(),
      ]);
      return {
        businessFunctions: businessFunctions.data,
        jobFunctions: jobFunctions.data,
        jobTitles: jobTitles.data,
        positionGroups: positionGroups.data,
        employeeStatuses: employeeStatuses.data,
        employeeTags: employeeTags.data,
        contractConfigs: contractConfigs.data,
      };
    } catch (error) {
      throw new Error('Failed to fetch reference data: ' + error.message);
    }
  },

  validateHierarchy: async (businessFunctionId, departmentId) => {
    return { businessFunction: true, department: true };
  },
};

export default referenceDataAPI;
