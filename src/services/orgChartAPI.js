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

  getOrgChartEmployee: (id) => {
    return orgChartApi.get(`/org-chart/detail/${id}/`);
  },

  getFullTreeWithVacancies: (params = {}) => {
    const queryString = buildQueryParams(params);
    return orgChartApi.get(`/org-chart/tree/${queryString ? `?${queryString}` : ''}`);
  },


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


};

export default orgChartAPI;