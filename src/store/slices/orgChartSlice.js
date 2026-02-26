// src/store/slices/orgChartSlice.js - FIXED version to prevent circular references
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { orgChartAPI } from '../../services/orgChartAPI';

// FIXED: Clean employee data utility to prevent circular references in Redux
const cleanEmployeeForRedux = (employee) => {
    if (!employee) return null;
    
    // Create a clean copy with only serializable data
    const cleanEmployee = {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        title: employee.title,
        department: employee.department,
        unit: employee.unit,
        business_function: employee.business_function,
        position_group: employee.position_group,
        direct_reports: employee.direct_reports || 0,
        line_manager_id: employee.line_manager_id,
        manager_id: employee.manager_id,
        parent_id: employee.parent_id,
        level_to_ceo: employee.level_to_ceo,
        email: employee.email,
        phone: employee.phone,
        profile_image_url: employee.profile_image_url,
        avatar: employee.avatar,
        status: employee.status,
        status_color: employee.status_color,
        grading_level: employee.grading_level,
        job_function: employee.job_function,
        gender: employee.gender,
        colleagues_in_unit: employee.colleagues_in_unit,
        colleagues_in_business_function: employee.colleagues_in_business_function,
        total_subordinates: employee.total_subordinates,
        
        // Clean nested objects
        employee_details: employee.employee_details ? {
            grading_display: employee.employee_details.grading_display,
            tags: Array.isArray(employee.employee_details.tags) 
                ? employee.employee_details.tags.map(tag => ({
                    name: tag.name,
                    color: tag.color
                }))
                : []
        } : null,
        
        // Manager info as simple reference (no circular refs)
        manager_info: employee.manager_info ? {
            employee_id: employee.manager_info.employee_id,
            name: employee.manager_info.name,
            title: employee.manager_info.title,
            department: employee.manager_info.department
        } : null,
        
        // Direct reports as simple array of IDs (no circular refs)
        direct_reports_ids: Array.isArray(employee.direct_reports_details) 
            ? employee.direct_reports_details.map(report => report.employee_id || report.id)
            : []
    };
    
    return cleanEmployee;
};

// FIXED: Clean array of employees
const cleanEmployeeArray = (employees) => {
    if (!Array.isArray(employees)) return [];
    return employees.map(cleanEmployeeForRedux).filter(Boolean);
};

// ========================================
// ASYNC THUNKS (updated with data cleaning)
// ========================================

export const fetchOrgChart = createAsyncThunk(
  'orgChart/fetchOrgChart',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getFullTreeWithVacancies(params);
      
      // FIXED: Clean the data before storing in Redux
      let orgChartData = [];
      if (response.data?.org_chart && Array.isArray(response.data.org_chart)) {
        orgChartData = cleanEmployeeArray(response.data.org_chart);
      } else if (Array.isArray(response.data)) {
        orgChartData = cleanEmployeeArray(response.data);
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        orgChartData = cleanEmployeeArray(response.data.results);
      }
      
      return {
        ...response.data,
        org_chart: orgChartData
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrgChartEmployee = createAsyncThunk(
  'orgChart/fetchOrgChartEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getOrgChartEmployee(employeeId);
      // FIXED: Clean employee data
      return cleanEmployeeForRedux(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFullTreeWithVacancies = createAsyncThunk(
  'orgChart/fetchFullTreeWithVacancies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getFullTreeWithVacancies(params);
      
      // FIXED: Clean the data
      let treeData = [];
      if (response.data?.org_chart && Array.isArray(response.data.org_chart)) {
        treeData = cleanEmployeeArray(response.data.org_chart);
      } else if (Array.isArray(response.data)) {
        treeData = cleanEmployeeArray(response.data);
      }
      
      return {
        ...response.data,
        org_chart: treeData
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const searchOrgChart = createAsyncThunk(
  'orgChart/searchOrgChart',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.searchOrgChart(searchParams);
      
      // FIXED: Clean search results
      let searchData = [];
      if (response.data?.org_chart && Array.isArray(response.data.org_chart)) {
        searchData = cleanEmployeeArray(response.data.org_chart);
      } else if (Array.isArray(response.data)) {
        searchData = cleanEmployeeArray(response.data);
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        searchData = cleanEmployeeArray(response.data.results);
      }
      
      return {
        ...response.data,
        org_chart: searchData
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchManagerTeam = createAsyncThunk(
  'orgChart/fetchManagerTeam',
  async ({ managerId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getManagerTeam(managerId, params);
      
      // FIXED: Clean manager team data
      let teamData = [];
      if (response.data?.org_chart && Array.isArray(response.data.org_chart)) {
        teamData = cleanEmployeeArray(response.data.org_chart);
      } else if (Array.isArray(response.data)) {
        teamData = cleanEmployeeArray(response.data);
      }
      
      return { 
        managerId, 
        data: {
          ...response.data,
          org_chart: teamData
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Main org chart data - FIXED: No circular references
  orgChart: [],
  fullTree: [],
  statistics: null,
  selectedEmployee: null,
  managerTeams: {},
  
  // FIXED: Simple hierarchy structure without circular refs
  hierarchy: {
    roots: [],
    employeeMap: {} // Simple key-value mapping
  },
  
  // Loading states
  loading: {
    orgChart: false,
    employee: false,
    fullTree: false,
    statistics: false,
    search: false,
    managerTeam: false
  },
  
  // Error states
  error: {
    orgChart: null,
    employee: null,
    fullTree: null,
    statistics: null,
    search: null,
    managerTeam: null
  },
  
  // Filter state
  filters: {
    search: '',
    employee_search: '',
    job_title_search: '',
    department_search: '',
    business_function: [],
    department: [],
    unit: [],
    job_function: [],
    position_group: [],
    line_manager: [],
    status: [],
    grading_level: [],
    gender: [],
    show_top_level_only: false,
    managers_only: false,
    manager_team: null
  },
  
  // UI state - FIXED: Simple serializable structure
  ui: {
    viewMode: 'tree',
    showFilters: false,
    showLegend: false,
    isFullscreen: false,
    expandedNodes: [], // Array of employee IDs
    selectedEmployeeModal: false,
    layoutDirection: 'TB'
  },
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 50,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  },
  
  // Cache management
  lastUpdated: null,
  cacheExpiry: 5 * 60 * 1000
};

// ========================================
// SLICE DEFINITION
// ========================================

const orgChartSlice = createSlice({
  name: 'orgChart',
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        ...initialState.filters,
        show_top_level_only: state.filters.show_top_level_only,
        managers_only: state.filters.managers_only
      };
    },
    
    resetAllFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    
    // UI state management
    setViewMode: (state, action) => {
      state.ui.viewMode = action.payload;
    },
    
    setShowFilters: (state, action) => {
      state.ui.showFilters = action.payload;
    },
    
    setShowLegend: (state, action) => {
      state.ui.showLegend = action.payload;
    },
    
    setIsFullscreen: (state, action) => {
      state.ui.isFullscreen = action.payload;
    },
    
    setLayoutDirection: (state, action) => {
      state.ui.layoutDirection = action.payload;
    },
    
    // FIXED: Safe expanded nodes management
    toggleExpandedNode: (state, action) => {
      const nodeId = action.payload;
      const expandedNodes = [...state.ui.expandedNodes];
      const index = expandedNodes.findIndex(id => id === nodeId);
      
      if (index !== -1) {
        expandedNodes.splice(index, 1);
      } else {
        expandedNodes.push(nodeId);
      }
      
      state.ui.expandedNodes = expandedNodes;
    },
    
    setExpandedNodes: (state, action) => {
      // FIXED: Ensure it's always an array of primitive values
      const nodes = Array.isArray(action.payload) ? action.payload : [];
      state.ui.expandedNodes = nodes.filter(id => 
        typeof id === 'string' || typeof id === 'number'
      );
    },
    
    // FIXED: Safe selected employee management
    setSelectedEmployee: (state, action) => {
      // Clean the employee data before storing
      state.selectedEmployee = cleanEmployeeForRedux(action.payload);
      state.ui.selectedEmployeeModal = !!action.payload;
    },
    
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.ui.selectedEmployeeModal = false;
    },
    
    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    
    // Error management
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    },
    
    clearError: (state, action) => {
      const errorKey = action.payload;
      if (state.error[errorKey] !== undefined) {
        state.error[errorKey] = null;
      }
    },
    
    // Cache management
    invalidateCache: (state) => {
      state.lastUpdated = null;
    },
    
    // FIXED: Safe bulk operations for expanded nodes
    expandAllNodes: (state) => {
      const allManagerIds = state.orgChart
        .filter(emp => emp.direct_reports && emp.direct_reports > 0)
        .map(emp => emp.employee_id)
        .filter(id => typeof id === 'string' || typeof id === 'number');
      
      state.ui.expandedNodes = allManagerIds;
    },
    
    collapseAllNodes: (state) => {
      state.ui.expandedNodes = [];
    },
    
    // Manager team management
    setManagerTeam: (state, action) => {
      const { managerId, data } = action.payload;
      state.managerTeams[managerId] = data;
    },
    
    clearManagerTeam: (state, action) => {
      const managerId = action.payload;
      if (state.managerTeams[managerId]) {
        delete state.managerTeams[managerId];
      }
    },
    
    // FIXED: Safe hierarchy management
    updateHierarchy: (state, action) => {
      const { roots, employeeMap } = action.payload;
      state.hierarchy = {
        roots: Array.isArray(roots) ? roots : [],
        employeeMap: employeeMap && typeof employeeMap === 'object' ? employeeMap : {}
      };
    },
    
    // Data refresh
    refreshData: (state) => {
      state.lastUpdated = null;
      state.orgChart = [];
      state.fullTree = [];
      state.statistics = null;
      state.managerTeams = {};
      state.selectedEmployee = null;
      state.ui.expandedNodes = [];
    }
  },
  
  extraReducers: (builder) => {
    // Fetch org chart
    builder
      .addCase(fetchOrgChart.pending, (state) => {
        state.loading.orgChart = true;
        state.error.orgChart = null;
      })
      .addCase(fetchOrgChart.fulfilled, (state, action) => {
        state.loading.orgChart = false;
        
        // FIXED: Use cleaned data from thunk
        const orgChartData = action.payload.org_chart || [];
    
        state.orgChart = orgChartData;
        
        // Update pagination if present
        if (action.payload?.count !== undefined) {
          state.pagination.totalCount = action.payload.count;
          state.pagination.hasNext = !!action.payload.next;
          state.pagination.hasPrev = !!action.payload.previous;
        }
        
        // FIXED: Build simple hierarchy without circular references
        const employeeMap = {};
        const roots = [];
        
        orgChartData.forEach(emp => {
          employeeMap[emp.employee_id] = {
            ...emp,
            childrenIds: [] // Store only IDs, not full objects
          };
        });
        
        orgChartData.forEach(emp => {
          if (emp.line_manager_id && employeeMap[emp.line_manager_id]) {
            employeeMap[emp.line_manager_id].childrenIds.push(emp.employee_id);
          } else {
            roots.push(emp.employee_id);
          }
        });
        
     
        
        state.hierarchy = { 
          roots: roots, 
          employeeMap: employeeMap 
        };
        state.lastUpdated = Date.now();
        
        // FIXED: Set initial expanded nodes more safely
        if (roots.length > 0 && state.ui.expandedNodes.length === 0) {
          // Find top-level managers with most reports
          const topManagers = orgChartData
            .filter(emp => emp.direct_reports > 0)
            .filter(emp => (emp.level_to_ceo || 999) <= 2) // Top 2-3 levels
            .sort((a, b) => (b.direct_reports || 0) - (a.direct_reports || 0))
            .slice(0, 5) // Limit to avoid performance issues
            .map(emp => emp.employee_id);
          
          const initialExpanded = [...roots, ...topManagers].filter(id => 
            typeof id === 'string' || typeof id === 'number'
          );
          
          // Remove duplicates
          state.ui.expandedNodes = [...new Set(initialExpanded)];
        
        }
      })
      .addCase(fetchOrgChart.rejected, (state, action) => {
        state.loading.orgChart = false;
        state.error.orgChart = action.payload;
      });

    // Fetch specific employee
    builder
      .addCase(fetchOrgChartEmployee.pending, (state) => {
        state.loading.employee = true;
        state.error.employee = null;
      })
      .addCase(fetchOrgChartEmployee.fulfilled, (state, action) => {
        state.loading.employee = false;
        // FIXED: Already cleaned data from thunk
        state.selectedEmployee = action.payload;
        state.ui.selectedEmployeeModal = true;
      })
      .addCase(fetchOrgChartEmployee.rejected, (state, action) => {
        state.loading.employee = false;
        state.error.employee = action.payload;
      });

    // Fetch full tree with vacancies
    builder
      .addCase(fetchFullTreeWithVacancies.pending, (state) => {
        state.loading.fullTree = true;
        state.error.fullTree = null;
      })
      .addCase(fetchFullTreeWithVacancies.fulfilled, (state, action) => {
        state.loading.fullTree = false;
        
        // FIXED: Use cleaned data from thunk
        const treeData = action.payload.org_chart || [];
        state.fullTree = treeData;
        
        if (state.orgChart.length === 0) {
          state.orgChart = treeData;
          
          // Build simple hierarchy
          const employeeMap = {};
          const roots = [];
          
          treeData.forEach(emp => {
            employeeMap[emp.employee_id] = {
              ...emp,
              childrenIds: []
            };
          });
          
          treeData.forEach(emp => {
            if (emp.line_manager_id && employeeMap[emp.line_manager_id]) {
              employeeMap[emp.line_manager_id].childrenIds.push(emp.employee_id);
            } else {
              roots.push(emp.employee_id);
            }
          });
          
          state.hierarchy = { roots, employeeMap };
        }
      })
      .addCase(fetchFullTreeWithVacancies.rejected, (state, action) => {
        state.loading.fullTree = false;
        state.error.fullTree = action.payload;
      });


    // Search org chart
    builder
      .addCase(searchOrgChart.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchOrgChart.fulfilled, (state, action) => {
        state.loading.search = false;
        
        // FIXED: Use cleaned data from thunk
        const searchData = action.payload.org_chart || [];
        state.orgChart = searchData;
        
        if (action.payload.count !== undefined) {
          state.pagination.totalCount = action.payload.count;
          state.pagination.hasNext = !!action.payload.next;
          state.pagination.hasPrev = !!action.payload.previous;
        }
        
        // Build simple hierarchy for search results
        const employeeMap = {};
        const roots = [];
        
        searchData.forEach(emp => {
          employeeMap[emp.employee_id] = {
            ...emp,
            childrenIds: []
          };
        });
        
        searchData.forEach(emp => {
          if (emp.line_manager_id && employeeMap[emp.line_manager_id]) {
            employeeMap[emp.line_manager_id].childrenIds.push(emp.employee_id);
          } else {
            roots.push(emp.employee_id);
          }
        });
        
        state.hierarchy = { roots, employeeMap };
      })
      .addCase(searchOrgChart.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.payload;
      });

    // Fetch manager team
    builder
      .addCase(fetchManagerTeam.pending, (state) => {
        state.loading.managerTeam = true;
        state.error.managerTeam = null;
      })
      .addCase(fetchManagerTeam.fulfilled, (state, action) => {
        state.loading.managerTeam = false;
        const { managerId, data } = action.payload;
        
        // FIXED: Use cleaned data from thunk
        const teamData = data.org_chart || [];
        state.managerTeams[managerId] = teamData;
      })
      .addCase(fetchManagerTeam.rejected, (state, action) => {
        state.loading.managerTeam = false;
        state.error.managerTeam = action.payload;
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  resetAllFilters,
  updateFilter,
  setViewMode,
  setShowFilters,
  setShowLegend,
  setIsFullscreen,
  setLayoutDirection,
  toggleExpandedNode,
  setExpandedNodes,
  setSelectedEmployee,
  clearSelectedEmployee,
  setPagination,
  setPage,
  setPageSize,
  clearErrors,
  clearError,
  invalidateCache,
  expandAllNodes,
  collapseAllNodes,
  setManagerTeam,
  clearManagerTeam,
  updateHierarchy,
  refreshData
} = orgChartSlice.actions;

export default orgChartSlice.reducer;

// ========================================
// SELECTORS - FIXED to prevent circular references
// ========================================

// Base selectors
const selectOrgChartState = (state) => state.orgChart || {};

// FIXED: Main data selectors with safe transformations
export const selectOrgChart = createSelector(
  [selectOrgChartState],
  (orgChartState) => {
    const orgChart = orgChartState.orgChart || [];
    // Ensure we return clean data
    return Array.isArray(orgChart) ? orgChart : [];
  }
);

export const selectFullTree = createSelector(
  [selectOrgChartState],
  (orgChartState) => {
    const fullTree = orgChartState.fullTree || [];
    return Array.isArray(fullTree) ? fullTree : [];
  }
);

export const selectStatistics = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.statistics || null
);

export const selectSelectedEmployee = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.selectedEmployee || null
);

export const selectHierarchy = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.hierarchy || { roots: [], employeeMap: {} }
);

export const selectManagerTeams = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.managerTeams || {}
);

// Filter selectors
export const selectFilters = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.filters || initialState.filters
);

export const selectActiveFilters = createSelector(
  [selectFilters],
  (filters) => {
    const activeFilters = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : value !== false)) {
        activeFilters[key] = value;
      }
    });
    
    return activeFilters;
  }
);

// UI selectors
export const selectUIState = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.ui || initialState.ui
);

export const selectViewMode = createSelector(
  [selectUIState],
  (uiState) => uiState.viewMode || 'tree'
);

export const selectShowFilters = createSelector(
  [selectUIState],
  (uiState) => Boolean(uiState.showFilters)
);

export const selectShowLegend = createSelector(
  [selectUIState],
  (uiState) => Boolean(uiState.showLegend)
);

export const selectIsFullscreen = createSelector(
  [selectUIState],
  (uiState) => Boolean(uiState.isFullscreen)
);

// FIXED: Safe expanded nodes selector
export const selectExpandedNodes = createSelector(
  [selectUIState],
  (uiState) => {
    const expandedNodes = uiState.expandedNodes;
    if (Array.isArray(expandedNodes)) {
      // Ensure all values are primitive (string/number)
      return expandedNodes.filter(id => 
        typeof id === 'string' || typeof id === 'number'
      );
    }
    return [];
  }
);

export const selectLayoutDirection = createSelector(
  [selectUIState],
  (uiState) => uiState.layoutDirection || 'TB'
);

// Loading and error selectors
export const selectOrgChartLoading = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.loading || initialState.loading
);

export const selectIsLoading = createSelector(
  [selectOrgChartLoading],
  (loading) => Object.values(loading).some(isLoading => Boolean(isLoading))
);

export const selectOrgChartErrors = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.error || initialState.error
);

export const selectHasErrors = createSelector(
  [selectOrgChartErrors],
  (errors) => Object.values(errors).some(error => error !== null)
);

// Pagination selectors
export const selectPagination = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.pagination || initialState.pagination
);


export const selectFilteredOrgChart = createSelector(
  [selectOrgChart, selectActiveFilters],
  (orgChart, activeFilters) => {
 
    
    if (!Array.isArray(orgChart) || orgChart.length === 0) {
      console.log('❌ No orgChart data to filter');
      return [];
    }
    
    if (!activeFilters || Object.keys(activeFilters).length === 0) {
   
      return orgChart;
    }
    
    const filtered = orgChart.filter(employee => {
      if (!employee || typeof employee !== 'object') {
        console.log('⚠️ Invalid employee object:', employee);
        return false;
      }
      
      // Text search filters - Case insensitive search
      if (activeFilters.search) {
        const searchTerm = String(activeFilters.search).toLowerCase().trim();
        if (!searchTerm) return true; // Empty search, skip filter
        
        const searchableFields = [
          employee.name,
          employee.employee_id,
          employee.email,
          employee.title,
          employee.department,
          employee.unit,
          employee.business_function
        ].filter(Boolean).map(field => String(field).toLowerCase());
        
        const matchesSearch = searchableFields.some(field => 
          field.includes(searchTerm)
        );
        
        if (!matchesSearch) {
          console.log('❌ Search filter failed for:', employee.name, 'with term:', searchTerm);
          return false;
        }
      }
      
      // Employee specific search
      if (activeFilters.employee_search) {
        const searchTerm = String(activeFilters.employee_search).toLowerCase().trim();
        if (!searchTerm) return true;
        
        const employeeFields = [
          employee.name,
          employee.employee_id,
          employee.email
        ].filter(Boolean).map(field => String(field).toLowerCase());
        
        const matchesEmployeeSearch = employeeFields.some(field =>
          field.includes(searchTerm)
        );
        
        if (!matchesEmployeeSearch) {
          console.log('❌ Employee search failed for:', employee.name);
          return false;
        }
      }
      
      // Job title search
      if (activeFilters.job_title_search) {
        const searchTerm = String(activeFilters.job_title_search).toLowerCase().trim();
        if (!searchTerm) return true;
        
        if (!employee.title || !String(employee.title).toLowerCase().includes(searchTerm)) {
          console.log('❌ Job title search failed for:', employee.name);
          return false;
        }
      }
      
      // Department search
      if (activeFilters.department_search) {
        const searchTerm = String(activeFilters.department_search).toLowerCase().trim();
        if (!searchTerm) return true;
        
        if (!employee.department || !String(employee.department).toLowerCase().includes(searchTerm)) {
          console.log('❌ Department search failed for:', employee.name);
          return false;
        }
      }
      
      // Multi-select filters - FIXED: Handle both string and array values
      if (activeFilters.business_function) {
        const filterValues = Array.isArray(activeFilters.business_function) 
          ? activeFilters.business_function 
          : [activeFilters.business_function];
        
        if (filterValues.length > 0) {
          if (!employee.business_function) {
            console.log('❌ No business_function for:', employee.name);
            return false;
          }
          
          const matches = filterValues.some(filterValue => {
            // Handle both ID and name matching
            return String(employee.business_function).toLowerCase() === String(filterValue).toLowerCase() ||
                   (employee.business_function_id && String(employee.business_function_id) === String(filterValue));
          });
          
          if (!matches) {
            console.log('❌ Business function filter failed for:', employee.name, employee.business_function);
            return false;
          }
        }
      }
      
      if (activeFilters.department) {
        const filterValues = Array.isArray(activeFilters.department) 
          ? activeFilters.department 
          : [activeFilters.department];
        
        if (filterValues.length > 0) {
          if (!employee.department) {
            console.log('❌ No department for:', employee.name);
            return false;
          }
          
          const matches = filterValues.some(filterValue => {
            return String(employee.department).toLowerCase() === String(filterValue).toLowerCase() ||
                   (employee.department_id && String(employee.department_id) === String(filterValue));
          });
          
          if (!matches) {
            console.log('❌ Department filter failed for:', employee.name, employee.department);
            return false;
          }
        }
      }
      
      if (activeFilters.unit) {
        const filterValues = Array.isArray(activeFilters.unit) 
          ? activeFilters.unit 
          : [activeFilters.unit];
        
        if (filterValues.length > 0) {
          if (!employee.unit) {
            console.log('❌ No unit for:', employee.name);
            return false;
          }
          
          const matches = filterValues.some(filterValue => {
            return String(employee.unit).toLowerCase() === String(filterValue).toLowerCase() ||
                   (employee.unit_id && String(employee.unit_id) === String(filterValue));
          });
          
          if (!matches) {
            console.log('❌ Unit filter failed for:', employee.name, employee.unit);
            return false;
          }
        }
      }
      
      if (activeFilters.position_group) {
        const filterValues = Array.isArray(activeFilters.position_group) 
          ? activeFilters.position_group 
          : [activeFilters.position_group];
        
        if (filterValues.length > 0) {
          if (!employee.position_group) {
            console.log('❌ No position_group for:', employee.name);
            return false;
          }
          
          const matches = filterValues.some(filterValue => {
            return String(employee.position_group).toLowerCase() === String(filterValue).toLowerCase() ||
                   (employee.position_group_id && String(employee.position_group_id) === String(filterValue));
          });
          
          if (!matches) {
            console.log('❌ Position group filter failed for:', employee.name, employee.position_group);
            return false;
          }
        }
      }
      
      if (activeFilters.line_manager) {
        const filterValues = Array.isArray(activeFilters.line_manager) 
          ? activeFilters.line_manager 
          : [activeFilters.line_manager];
        
        if (filterValues.length > 0) {
          if (!employee.line_manager_id) {
            console.log('❌ No line_manager_id for:', employee.name);
            return false;
          }
          
          const matches = filterValues.some(filterValue => {
            return String(employee.line_manager_id) === String(filterValue);
          });
          
          if (!matches) {
            console.log('❌ Line manager filter failed for:', employee.name, employee.line_manager_id);
            return false;
          }
        }
      }
      
      if (activeFilters.status) {
        const filterValues = Array.isArray(activeFilters.status) 
          ? activeFilters.status 
          : [activeFilters.status];
        
        if (filterValues.length > 0) {
          if (!employee.status) return false;
          
          const matches = filterValues.some(filterValue => {
            return String(employee.status).toLowerCase() === String(filterValue).toLowerCase();
          });
          
          if (!matches) return false;
        }
      }
      
      if (activeFilters.grading_level) {
        const filterValues = Array.isArray(activeFilters.grading_level) 
          ? activeFilters.grading_level 
          : [activeFilters.grading_level];
        
        if (filterValues.length > 0) {
          if (!employee.grading_level) return false;
          
          const matches = filterValues.some(filterValue => {
            return String(employee.grading_level).toLowerCase() === String(filterValue).toLowerCase();
          });
          
          if (!matches) return false;
        }
      }
      
      if (activeFilters.gender) {
        const filterValues = Array.isArray(activeFilters.gender) 
          ? activeFilters.gender 
          : [activeFilters.gender];
        
        if (filterValues.length > 0) {
          if (!employee.gender) return false;
          
          const matches = filterValues.some(filterValue => {
            return String(employee.gender).toLowerCase() === String(filterValue).toLowerCase();
          });
          
          if (!matches) return false;
        }
      }
      
      // Boolean filters
      if (activeFilters.show_top_level_only) {
        if (employee.line_manager_id) {
          console.log('❌ Top level filter failed for:', employee.name, '- has manager:', employee.line_manager_id);
          return false;
        }
      }
      
      if (activeFilters.managers_only) {
        if (!employee.direct_reports || employee.direct_reports === 0) {
          console.log('❌ Managers only filter failed for:', employee.name, '- reports:', employee.direct_reports);
          return false;
        }
      }
      
      // Manager team filter
      if (activeFilters.manager_team) {
        if (String(employee.line_manager_id) !== String(activeFilters.manager_team)) {
          console.log('❌ Manager team filter failed for:', employee.name);
          return false;
        }
      }
      
  
      return true;
    });

   
    
    return filtered;
  }
);

// FIXED: Safe React Flow selector without circular references
export const selectOrgChartForReactFlow = createSelector(
  [selectFilteredOrgChart, selectExpandedNodes],
  (filteredChart, expandedNodes) => {
  
    
    if (!Array.isArray(filteredChart) || filteredChart.length === 0) {
     
      return { nodes: [], edges: [] };
    }
    
    // Create a Set for faster lookup
    const expandedSet = new Set(expandedNodes || []);
    
    // Find root employees
    const rootEmployees = filteredChart.filter(emp => !emp.line_manager_id);

    
    // If no expanded nodes and we have roots, expand them
    if (expandedNodes?.length === 0 && rootEmployees.length > 0) {
      rootEmployees.forEach(root => expandedSet.add(root.employee_id));
    }
    
    // Simple visibility calculation without circular references
    const visibleEmployees = [];
    const employeeMap = new Map();
    
    // Build employee map
    filteredChart.forEach(emp => {
      employeeMap.set(emp.employee_id, emp);
    });
    
    // Add root employees
    rootEmployees.forEach(root => {
      if (!visibleEmployees.find(emp => emp.employee_id === root.employee_id)) {
        visibleEmployees.push(root);
      }
    });
    
    // Add children of expanded nodes
    expandedSet.forEach(nodeId => {
      const children = filteredChart.filter(emp => emp.line_manager_id === nodeId);
      children.forEach(child => {
        if (!visibleEmployees.find(emp => emp.employee_id === child.employee_id)) {
          visibleEmployees.push(child);
        }
      });
    });
    
  
    
    // Create React Flow nodes
    const nodes = visibleEmployees.map(emp => ({
      id: emp.employee_id.toString(),
      type: 'employee',
      position: { x: 0, y: 0 },
      data: {
        employee: emp, // Already cleaned data
        isExpanded: expandedSet.has(emp.employee_id),
        onToggleExpanded: (nodeId) => ({ type: 'orgChart/toggleExpandedNode', payload: nodeId }),
        onSelectEmployee: (employee) => ({ type: 'orgChart/setSelectedEmployee', payload: employee })
      }
    }));
    
    // Create React Flow edges - only between visible employees
    const visibleEmployeeIds = new Set(visibleEmployees.map(emp => emp.employee_id));
    const edges = visibleEmployees
      .filter(emp => 
        emp.line_manager_id && 
        visibleEmployeeIds.has(emp.line_manager_id)
      )
      .map(emp => ({
        id: `edge-${emp.line_manager_id}-${emp.employee_id}`,
        source: emp.line_manager_id.toString(),
        target: emp.employee_id.toString(),
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: '#64748b', 
          strokeWidth: 2,
          opacity: 0.8 
        }
      }));
    
    const result = { nodes, edges };
   
    
    return result;
  }
);

// Summary selector
export const selectOrgChartSummary = createSelector(
  [selectOrgChart, selectStatistics],
  (orgChart, statistics) => {
    if (!Array.isArray(orgChart)) {
      return {
        totalEmployees: 0,
        totalManagers: 0,
        totalDepartments: 0,
        totalBusinessFunctions: 0,
        ...statistics?.overview
      };
    }
    
    const totalEmployees = orgChart.length;
    const totalManagers = orgChart.filter(emp => emp.direct_reports && emp.direct_reports > 0).length;
    const departments = new Set(orgChart.map(emp => emp.department).filter(Boolean));
    const businessFunctions = new Set(orgChart.map(emp => emp.business_function).filter(Boolean));
    
    return {
      totalEmployees,
      totalManagers,
      totalDepartments: departments.size,
      totalBusinessFunctions: businessFunctions.size,
      ...statistics?.overview
    };
  }
);

// Other utility selectors
export const selectManagerTeam = createSelector(
  [selectManagerTeams, (state, managerId) => managerId],
  (managerTeams, managerId) => managerTeams[managerId] || []
);

export const selectEmployeeById = createSelector(
  [selectOrgChart, (state, employeeId) => employeeId],
  (orgChart, employeeId) => orgChart.find(emp => emp.employee_id === employeeId) || null
);

export const selectEmployeeChildren = createSelector(
  [selectOrgChart, (state, employeeId) => employeeId],
  (orgChart, employeeId) => orgChart.filter(emp => emp.line_manager_id === employeeId)
);

export const selectRootEmployees = createSelector(
  [selectOrgChart],
  (orgChart) => orgChart.filter(emp => !emp.line_manager_id)
);

export const selectManagersOnly = createSelector(
  [selectOrgChart],
  (orgChart) => orgChart.filter(emp => emp.direct_reports && emp.direct_reports > 0)
);