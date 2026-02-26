// src/services/orgChartAPI.js - Org Chart API endpointləri
import axios from "axios";

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

// Token utility
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// Query parameters helper
const buildQueryParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle arrays - for multiple selections
        searchParams.append(key, value.join(','));
      } else if (typeof value === 'object') {
        // Handle objects (like date ranges)
        if (value.from && value.to) {
          searchParams.append(`${key}_from`, value.from);
          searchParams.append(`${key}_to`, value.to);
        } else {
          searchParams.append(key, JSON.stringify(value));
        }
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

// Create axios instance for org chart
const orgChartApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
orgChartApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
orgChartApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Org Chart API Error:', error);
    return Promise.reject(error);
  }
);

// Org Chart API Service
export const orgChartAPI = {
  // ========================================
  // ORG CHART ENDPOINTS
  // ========================================
  


  /**
   * Get specific employee org chart data
   * @param {string|number} id - Employee ID
   * @returns {Promise} API response
   */
  getOrgChartEmployee: (id) => {
    return orgChartApi.get(`/org-chart/detail/${id}/`);
  },

  /**
   * Get complete organizational chart tree including vacant positions
   * @param {Object} params - Filter parameters
   * @returns {Promise} API response
   */
  getFullTreeWithVacancies: (params = {}) => {
    const queryString = buildQueryParams(params);
    return orgChartApi.get(`/org-chart/tree/${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get organizational chart statistics
   * @param {Object} params - Filter parameters
   * @returns {Promise} API response
   */
  getOrgChartStatistics: (params = {}) => {
    const queryString = buildQueryParams(params);
    return orgChartApi.get(`/org-chart/get_statistics/${queryString ? `?${queryString}` : ''}`);
  },

  // ========================================
  // HELPER METHODS
  // ========================================
  
  /**
   * Search org chart with advanced filters
   * @param {Object} searchParams - Advanced search parameters
   * @returns {Promise} API response
   */
  searchOrgChart: (searchParams = {}) => {
    const processedParams = {
      // Text-based searches
      search: searchParams.search,
      employee_search: searchParams.employee_search,
      job_title_search: searchParams.job_title_search,
      department_search: searchParams.department_search,
      
      // Multi-select filters
      business_function: searchParams.business_function,
      department: searchParams.department,
      unit: searchParams.unit,
      job_function: searchParams.job_function,
      position_group: searchParams.position_group,
      line_manager: searchParams.line_manager,
      status: searchParams.status,
      grading_level: searchParams.grading_level,
      gender: searchParams.gender,
      
      // Boolean filters
      show_top_level_only: searchParams.show_top_level_only,
      managers_only: searchParams.managers_only,
      
      // Specific manager team
      manager_team: searchParams.manager_team,
      
      // Sorting
      ordering: searchParams.ordering,
      
      // Pagination
      page: searchParams.page,
      page_size: searchParams.page_size
    };

    return orgChartAPI.getFullTreeWithVacancies(processedParams);
  },

  /**
   * Get managers only
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  getManagersOnly: (params = {}) => {
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      managers_only: true
    });
  },

  /**
   * Get top level employees only
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  getTopLevelOnly: (params = {}) => {
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      show_top_level_only: true
    });
  },

  /**
   * Get specific manager's team
   * @param {number} managerId - Manager ID
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  getManagerTeam: (managerId, params = {}) => {
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      manager_team: managerId
    });
  },

  /**
   * Filter by Company
   * @param {Array|string} businessFunctionIds - Company IDs
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  filterByBusinessFunction: (businessFunctionIds, params = {}) => {
    const ids = Array.isArray(businessFunctionIds) ? businessFunctionIds : [businessFunctionIds];
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      business_function: ids
    });
  },

  /**
   * Filter by department
   * @param {Array|string} departmentIds - Department IDs
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  filterByDepartment: (departmentIds, params = {}) => {
    const ids = Array.isArray(departmentIds) ? departmentIds : [departmentIds];
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      department: ids
    });
  },

  /**
   * Filter by unit
   * @param {Array|string} unitIds - Unit IDs
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  filterByUnit: (unitIds, params = {}) => {
    const ids = Array.isArray(unitIds) ? unitIds : [unitIds];
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      unit: ids
    });
  },

  /**
   * Filter by position group
   * @param {Array|string} positionGroupIds - Position group IDs
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  filterByPositionGroup: (positionGroupIds, params = {}) => {
    const ids = Array.isArray(positionGroupIds) ? positionGroupIds : [positionGroupIds];
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      position_group: ids
    });
  },

  /**
   * Filter by employment status
   * @param {Array|string} statuses - Employment statuses
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  filterByStatus: (statuses, params = {}) => {
    const statusArray = Array.isArray(statuses) ? statuses : [statuses];
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      status: statusArray
    });
  },

  /**
   * Filter by grading level
   * @param {Array|string} gradingLevels - Grading levels
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} API response
   */
  filterByGradingLevel: (gradingLevels, params = {}) => {
    const levels = Array.isArray(gradingLevels) ? gradingLevels : [gradingLevels];
    return orgChartAPI.getFullTreeWithVacancies({
      ...params,
      grading_level: levels
    });
  },

  // ========================================
  // PRESET FILTERS
  // ========================================
  
  /**
   * Apply predefined filter presets
   * @param {string} presetName - Preset name
   * @param {Object} additionalParams - Additional parameters
   * @returns {Promise} API response
   */
  applyFilterPreset: (presetName, additionalParams = {}) => {
    const presets = {
      'all_employees': {},
      'managers_only': { managers_only: true },
      'top_level_only': { show_top_level_only: true },
      'active_status': { status: ['ACTIVE'] },
      'executives': { position_group: ['VC', 'DIRECTOR'] },
    
      'specialists': { position_group: ['SENIOR_SPECIALIST', 'SPECIALIST', 'JUNIOR_SPECIALIST'] }
    };

    const presetParams = presets[presetName] || {};
    return orgChartAPI.getFullTreeWithVacancies({ ...presetParams, ...additionalParams });
  },

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  /**
   * Build hierarchy from flat org chart data
   * @param {Array} employees - Flat employee array
   * @returns {Object} Hierarchical structure
   */
  buildHierarchy: (employees) => {
    if (!Array.isArray(employees)) return { roots: [], map: {} };
    
    const employeeMap = {};
    const roots = [];
    
    // Create employee map
    employees.forEach(emp => {
      employeeMap[emp.employee_id] = {
        ...emp,
        children: []
      };
    });
    
    // Build hierarchy
    employees.forEach(emp => {
      if (emp.line_manager_id && employeeMap[emp.line_manager_id]) {
        employeeMap[emp.line_manager_id].children.push(employeeMap[emp.employee_id]);
      } else {
        roots.push(employeeMap[emp.employee_id]);
      }
    });
    
    return { roots, map: employeeMap };
  },

  /**
   * Calculate employee metrics
   * @param {Object} employee - Employee data
   * @param {Object} hierarchyMap - Full hierarchy map
   * @returns {Object} Employee with calculated metrics
   */
  calculateEmployeeMetrics: (employee, hierarchyMap) => {
    if (!employee || !hierarchyMap) return employee;
    
    const calculateLevel = (empId, visited = new Set()) => {
      if (visited.has(empId)) return 0; // Prevent infinite loops
      visited.add(empId);
      
      const emp = hierarchyMap[empId];
      if (!emp || !emp.line_manager_id) return 0;
      
      return 1 + calculateLevel(emp.line_manager_id, visited);
    };
    
    const calculateSubordinates = (empId) => {
      const emp = hierarchyMap[empId];
      if (!emp || !emp.children) return 0;
      
      let total = emp.children.length;
      emp.children.forEach(child => {
        total += calculateSubordinates(child.employee_id);
      });
      return total;
    };
    
    return {
      ...employee,
      level_to_ceo: calculateLevel(employee.employee_id),
      total_subordinates: calculateSubordinates(employee.employee_id),
      direct_reports: hierarchyMap[employee.employee_id]?.children?.length || 0
    };
  },

  /**
   * Format org chart data for React Flow
   * @param {Array} employees - Employee data
   * @returns {Object} Formatted nodes and edges
   */
  formatForReactFlow: (employees) => {
    if (!Array.isArray(employees)) return { nodes: [], edges: [] };
    
    const nodes = employees.map(emp => ({
      id: emp.employee_id,
      type: 'employee',
      position: { x: 0, y: 0 },
      data: {
        employee: emp,
        directReports: emp.direct_reports || 0
      }
    }));
    
    const edges = employees
      .filter(emp => emp.line_manager_id)
      .map(emp => ({
        id: `${emp.line_manager_id}-${emp.employee_id}`,
        source: emp.line_manager_id,
        target: emp.employee_id,
        type: 'smoothstep',
        animated: true
      }));
    
    return { nodes, edges };
  }
};

export default orgChartAPI;