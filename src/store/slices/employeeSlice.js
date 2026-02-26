// src/store/slices/employeeSlice.js - UPDATED: Yeni endpointlər və genişləndirilmiş funksionallıq
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { employeeAPI } from '../api/employeeAPI';

// ========================================
// ASYNC THUNKS - EMPLOYEE OPERATIONS - Enhanced
// ========================================

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getAll(params);
      return {
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          current_page: response.data.current_page || params.page || 1,
          total_pages: response.data.total_pages || Math.ceil((response.data.count || 0) / (params.page_size || 25)),
          page_size: response.data.page_size || params.page_size || 25
        }
      };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  'employees/fetchEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.create(employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);



// ========================================
// STATISTICS & ANALYTICS
// ========================================

export const fetchStatistics = createAsyncThunk(
  'employees/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);



// ========================================
// ORG CHART VISIBILITY - YENİ ASYNC THUNKS
// ========================================

export const toggleOrgChartVisibility = createAsyncThunk(
  'employees/toggleOrgChartVisibility',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.toggleOrgChartVisibility(employeeId);
      return { employeeId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkToggleOrgChartVisibility = createAsyncThunk(
  'employees/bulkToggleOrgChartVisibility',
  async ({ employeeIds, setVisible }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkToggleOrgChartVisibility(employeeIds, setVisible);
      return { employeeIds, setVisible, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// TAG MANAGEMENT
// ========================================

export const addEmployeeTag = createAsyncThunk(
  'employees/addEmployeeTag',
  async ({ employee_id, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.addTag({ employee_id, tag_id });
      return { employee_id, tag: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const removeEmployeeTag = createAsyncThunk(
  'employees/removeEmployeeTag',
  async ({ employee_id, tag_id }, { rejectWithValue }) => {
    try {
      await employeeAPI.removeTag({ employee_id, tag_id });
      return { employee_id, tag_id };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkAddTags = createAsyncThunk(
  'employees/bulkAddTags',
  async ({ employee_ids, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkAddTags(employee_ids, tag_id);
      return { employee_ids, tag_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkRemoveTags = createAsyncThunk(
  'employees/bulkRemoveTags',
  async ({ employee_ids, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkRemoveTags(employee_ids, tag_id);
      return { employee_ids, tag_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// LINE MANAGER MANAGEMENT
// ========================================

export const assignLineManager = createAsyncThunk(
  'employees/assignLineManager',
  async ({ employee_id, line_manager_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.assignLineManager({ employee_id, line_manager_id });
      return { employee_id, line_manager_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkAssignLineManager = createAsyncThunk(
  'employees/bulkAssignLineManager',
  async ({ employee_ids, line_manager_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkAssignLineManager({ employee_ids, line_manager_id });
      return { employee_ids, line_manager_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// CONTRACT MANAGEMENT
// ========================================

export const extendEmployeeContract = createAsyncThunk(
  'employees/extendEmployeeContract',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.extendContract(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkExtendContracts = createAsyncThunk(
  'employees/bulkExtendContracts',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkExtendContracts(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);




export const uploadEmployeeProfilePhoto = createAsyncThunk(
  'employees/uploadProfilePhoto',
  async ({ employeeId, file }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.uploadProfileImage(employeeId, file);
      return {
        employeeId,
        data: response.data
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { 
          message: 'Failed to upload profile photo' 
        }
      );
    }
  }
);

export const deleteEmployeeProfilePhoto = createAsyncThunk(
  'employees/deleteProfilePhoto',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.deleteProfileImage(employeeId);
      return {
        employeeId,
        data: response.data
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { 
          message: 'Failed to delete profile photo' 
        }
      );
    }
  }
);

// ========================================
// GRADING MANAGEMENT
// ========================================

export const fetchEmployeeGrading = createAsyncThunk(
  'employees/fetchEmployeeGrading',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployeeGrading();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);




// ========================================
// EXPORT & TEMPLATES
// ========================================

export const exportEmployees = createAsyncThunk(
  'employees/exportEmployees',
  async ({ format = 'excel', params = {} }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.export({ format, ...params });
      return { format, recordCount: params.employee_ids?.length || 'all' };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const downloadEmployeeTemplate = createAsyncThunk(
  'employees/downloadEmployeeTemplate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.downloadTemplate();
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkUploadEmployees = createAsyncThunk(
  'employees/bulkUploadEmployees',
  async (file, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpload(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ACTIVITIES
// ========================================

export const fetchEmployeeActivities = createAsyncThunk(
  'employees/fetchEmployeeActivities',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getActivities(employeeId);
      return { employeeId, activities: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployeeDirectReports = createAsyncThunk(
  'employees/fetchEmployeeDirectReports',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getDirectReports(employeeId);
      return { employeeId, directReports: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployeeStatusPreview = createAsyncThunk(
  'employees/fetchEmployeeStatusPreview',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatusPreview(employeeId);
      return { employeeId, statusPreview: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);



// ========================================
// ADVANCED SEARCH - YENİ ASYNC THUNKS
// ========================================

export const searchEmployeesAdvanced = createAsyncThunk(
  'employees/searchEmployeesAdvanced',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.searchAdvanced(searchParams);
      return {
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          current_page: response.data.current_page || searchParams.page || 1,
          total_pages: response.data.total_pages || Math.ceil((response.data.count || 0) / (searchParams.page_size || 25)),
          page_size: response.data.page_size || searchParams.page_size || 25
        },
        searchParams
      };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// INITIAL STATE - Enhanced
// ========================================

const initialState = {
  // Data
  employees: [],
  currentEmployee: null,
  statistics: {
    total_employees: 0,
    active_employees: 0,
    inactive_employees: 0,
    by_status: {},
    by_business_function: {},
    by_position_group: {},
    by_contract_duration: {},
    recent_hires_30_days: 0,
    upcoming_contract_endings_30_days: 0,
    status_update_analysis: {
      employees_needing_updates: 0,
      status_transitions: {}
    }
  },
  orgChart: [],
  activities: {},
  directReports: {},
  statusPreviews: {},
  contractExpiryAlerts: {
    success: false,
    days_ahead: 30,
    total_expiring: 0,
    urgent_employees: [],
    all_employees: [],
    urgency_breakdown: {},
    department_breakdown: {},
    line_manager_breakdown: {},
    notification_recommendations: {
      critical_contracts: [],
      renewal_decisions_needed: [],
      manager_notifications: []
    }
  },
  contractsExpiringSoon: {
    days: 30,
    count: 0,
    employees: []
  },

  // Grading data
  gradingData: {
    count: 0,
    employees: []
  },
  allGradingLevels: [
    { code: '_LD', display: '-LD', full_name: 'Lower Decile' },
    { code: '_LQ', display: '-LQ', full_name: 'Lower Quartile' },
    { code: '_M', display: '-M', full_name: 'Median' },
    { code: '_UQ', display: '-UQ', full_name: 'Upper Quartile' },
    { code: '_UD', display: '-UD', full_name: 'Upper Decile' }
  ],
  gradingStatistics: {
    totalEmployees: 0,
    gradedEmployees: 0,
    ungradedEmployees: 0,
    byPositionGroup: {},
    byGradingLevel: {},
    recentlyUpdated: []
  },

  // UI state - Enhanced
  selectedEmployees: [],
  currentFilters: {},
  appliedFilters: [],
  sorting: [],
  pagination: {
    page: 1,
    pageSize: 25,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  },
  
  // Advanced filtering state
  advancedFilters: {
    searchFilters: {
      generalSearch: '',
      employeeSearch: '',
      managerSearch: '',
      jobTitleSearch: ''
    },
    multiSelectFilters: {
      businessFunctions: [],
      departments: [],
      units: [],
      jobFunctions: [],
      positionGroups: [],
      statuses: [],
      gradingLevels: [],
      contractDurations: [],
      lineManagers: [],
      tags: [],
      genders: []
    },
    dateRangeFilters: {
      startDateRange: { from: null, to: null },
      contractEndDateRange: { from: null, to: null }
    },
    numericRangeFilters: {
      serviceYearsRange: { min: null, max: null }
    },
    booleanFilters: {
      isActive: null,
      isOrgChartVisible: null,
      includeDeleted: false
    },
    specialFilters: {
      needsStatusUpdate: null,
      contractExpiringDays: null
    }
  },
  
  // Search state
  lastSearchParams: null,
  searchResults: [],
  searchPagination: {},
  
  // Loading states - Enhanced
  loading: {
    employees: false,
    employee: false,
    creating: false,
    updating: false,
    deleting: false,
    bulkOperations: false,
    statistics: false,
    grading: false,
    activities: false,
    directReports: false,
    statusPreview: false,
    profilePhoto: false,
    exporting: false,
    statusUpdate: false,
    tagUpdate: false,
    lineManagerUpdate: false,
    contractUpdate: false,
    template: false,
    upload: false,
    contractAlerts: false,
    orgChart: false,
    advancedSearch: false
  },
  
  // Error states - Enhanced
  error: {
    employees: null,
    employee: null,
    create: null,
    update: null,
    delete: null,
    bulkOperations: null,
    statistics: null,
    grading: null,
    activities: null,
    directReports: null,
    profilePhoto: null,
    statusPreview: null,
    export: null,
    statusUpdate: null,
    tagUpdate: null,
    lineManagerUpdate: null,
    contractUpdate: null,
    template: null,
    upload: null,
    contractAlerts: null,
    orgChart: null,
    advancedSearch: null
  },
  success: {
  // ... mövcud states
  profilePhoto: false, // YENİ
},
  // Feature flags & settings - Enhanced
  showAdvancedFilters: false,
  viewMode: 'table',
  showGradingPanel: false,
  gradingMode: 'individual',
  filterMode: 'basic', // 'basic', 'advanced', 'custom'
  sortingMode: 'single', // 'single', 'multiple'
};

// ========================================
// SLICE DEFINITION - Enhanced
// ========================================

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // Selection management
    setSelectedEmployees: (state, action) => {
      state.selectedEmployees = action.payload;
    },
    
    toggleEmployeeSelection: (state, action) => {
      const employeeId = action.payload;
      const index = state.selectedEmployees.indexOf(employeeId);
      
      if (index === -1) {
        state.selectedEmployees.push(employeeId);
      } else {
        state.selectedEmployees.splice(index, 1);
      }
    },
    clearProfilePhotoError: (state) => {
      state.error.profilePhoto = null;
    },
    clearProfilePhotoSuccess: (state) => {
      state.success.profilePhoto = false;
    },
    setProfilePhotoLoading: (state, action) => {
      state.loading.profilePhoto = action.payload;
    },
    selectAllEmployees: (state) => {
      state.selectedEmployees = state.employees.map(emp => emp.id);
    },
    
    selectAllVisible: (state) => {
      state.selectedEmployees = [...new Set([
        ...state.selectedEmployees,
        ...state.employees.map(emp => emp.id)
      ])];
    },
    
    clearSelection: (state) => {
      state.selectedEmployees = [];
    },
    
    // Filter management - Enhanced
    setCurrentFilters: (state, action) => {
      state.currentFilters = action.payload;
    },
    
    addFilter: (state, action) => {
      const { key, value, label } = action.payload;
      state.currentFilters[key] = value;
      
      const existingFilterIndex = state.appliedFilters.findIndex(f => f.key === key);
      if (existingFilterIndex !== -1) {
        state.appliedFilters[existingFilterIndex] = { key, value, label };
      } else {
        state.appliedFilters.push({ key, value, label });
      }
    },
    
    removeFilter: (state, action) => {
      const key = action.payload;
      delete state.currentFilters[key];
      state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);
    },
    
    clearFilters: (state) => {
      state.currentFilters = {};
      state.appliedFilters = [];
      state.advancedFilters = initialState.advancedFilters;
    },
    
    updateFilter: (state, action) => {
  const { key, value } = action.payload;
  

  
  if (value === null || value === undefined || value === '' || 
      (Array.isArray(value) && value.length === 0)) {
    delete state.currentFilters[key];
    state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);

  } else {
    state.currentFilters[key] = value;
  
  }
  
  // ✅ Reset pagination when filter changes
  state.pagination.page = 1;

},
    
    // ========================================
    // ADVANCED FILTERING - YENİ REDUCER-LƏR
    // ========================================
    
    setAdvancedFilters: (state, action) => {
      state.advancedFilters = { ...state.advancedFilters, ...action.payload };
    },
    
    updateAdvancedFilter: (state, action) => {
      const { category, key, value } = action.payload;
      if (state.advancedFilters[category]) {
        state.advancedFilters[category][key] = value;
      }
    },
    
    clearAdvancedFilters: (state) => {
      state.advancedFilters = initialState.advancedFilters;
    },
    
    setFilterMode: (state, action) => {
      state.filterMode = action.payload;
    },
    
    // Sorting management - Enhanced Multiple Sorting
    setSorting: (state, action) => {
      const { field, direction, multiple } = action.payload;
      
      if (multiple) {
        // Set multiple sorting from array
        state.sorting = multiple;
      } else {
        // Single sort
        if (state.sortingMode === 'single') {
          state.sorting = [{ field, direction }];
        } else {
          // Multiple sorting mode - add or update
          const existingIndex = state.sorting.findIndex(s => s.field === field);
          if (existingIndex !== -1) {
            state.sorting[existingIndex].direction = direction;
          } else {
            state.sorting.push({ field, direction });
          }
        }
      }
    },
    
    addSort: (state, action) => {
      const { field, direction } = action.payload;
      const existingIndex = state.sorting.findIndex(s => s.field === field);
      
      if (existingIndex !== -1) {
        state.sorting[existingIndex].direction = direction;
      } else {
        state.sorting.push({ field, direction });
      }
    },
    
    removeSort: (state, action) => {
      const field = action.payload;
      state.sorting = state.sorting.filter(s => s.field !== field);
    },
    
    clearSorting: (state) => {
      state.sorting = [];
    },
    
    toggleSort: (state, action) => {
      const field = action.payload;
      const existingSort = state.sorting.find(s => s.field === field);
      
      if (!existingSort) {
        if (state.sortingMode === 'single') {
          state.sorting = [{ field, direction: 'asc' }];
        } else {
          state.sorting.push({ field, direction: 'asc' });
        }
      } else if (existingSort.direction === 'asc') {
        existingSort.direction = 'desc';
      } else {
        state.sorting = state.sorting.filter(s => s.field !== field);
      }
    },
    
    reorderSorts: (state, action) => {
      const { oldIndex, newIndex } = action.payload;
      const [removed] = state.sorting.splice(oldIndex, 1);
      state.sorting.splice(newIndex, 0, removed);
    },
    
    setSortingMode: (state, action) => {
      state.sortingMode = action.payload;
      if (action.payload === 'single' && state.sorting.length > 1) {
        state.sorting = [state.sorting[0]]; // Keep only first sort
      }
    },
    
    // Pagination
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    
    goToNextPage: (state) => {
      if (state.pagination.hasNext) {
        state.pagination.page += 1;
      }
    },
    
    goToPreviousPage: (state) => {
      if (state.pagination.hasPrevious) {
        state.pagination.page -= 1;
      }
    },
    
    // UI state - Enhanced
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    
    setShowAdvancedFilters: (state, action) => {
      state.showAdvancedFilters = action.payload;
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    // Grading UI state
    setShowGradingPanel: (state, action) => {
      state.showGradingPanel = action.payload;
    },
    
    toggleGradingPanel: (state) => {
      state.showGradingPanel = !state.showGradingPanel;
    },
    
    setGradingMode: (state, action) => {
      state.gradingMode = action.payload;
    },
    
    // Error management
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    },
    
    clearError: (state, action) => {
      const errorKey = action.payload;
      state.error[errorKey] = null;
    },
    
    setError: (state, action) => {
      const { key, message } = action.payload;
      state.error[key] = message;
    },
    
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    
    // Quick actions - Enhanced
    setQuickFilter: (state, action) => {
      const { type, value } = action.payload;
      const quickFilters = {
        active: { status: ['ACTIVE'], is_active: true },
        onboarding: { status: ['ONBOARDING'] },
        onLeave: { status: ['ON_LEAVE'] },
        probation: { status: ['PROBATION'] },
        noManager: { line_manager: null },
        needsGrading: { grading_level: [] },
        newHires: { years_of_service_range: { min: 0, max: 0.25 } },
        contractEnding: { contract_expiring_days: 30 },
        orgChartVisible: { is_visible_in_org_chart: true },
        orgChartHidden: { is_visible_in_org_chart: false }
      };
      
      if (quickFilters[type]) {
        state.currentFilters = { ...state.currentFilters, ...quickFilters[type] };
      }
    },
    
    // Search management
    setLastSearchParams: (state, action) => {
      state.lastSearchParams = action.payload;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = {};
      state.lastSearchParams = null;
    },
    
    // Optimistic updates
    optimisticUpdateEmployee: (state, action) => {
      const { id, updates } = action.payload;
      const employeeIndex = state.employees.findIndex(emp => emp.id === id);
      if (employeeIndex !== -1) {
        state.employees[employeeIndex] = { ...state.employees[employeeIndex], ...updates };
      }
      if (state.currentEmployee?.id === id) {
        state.currentEmployee = { ...state.currentEmployee, ...updates };
      }
    },


  
    // ========================================
    // ORG CHART VISIBILITY - YENİ REDUCER-LƏR
    // ========================================
    
    optimisticToggleOrgChartVisibility: (state, action) => {
      const { employeeId, setVisible } = action.payload;
      const employee = state.employees.find(emp => emp.id === employeeId);
      if (employee) {
        employee.is_visible_in_org_chart = setVisible !== undefined ? setVisible : !employee.is_visible_in_org_chart;
        employee._isOptimisticOrgChart = true;
      }
    },
    
    optimisticBulkToggleOrgChartVisibility: (state, action) => {
      const { employeeIds, setVisible } = action.payload;
      employeeIds.forEach(employeeId => {
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee) {
          employee.is_visible_in_org_chart = setVisible;
          employee._isOptimisticOrgChart = true;
        }
      });
    }
  },
  
  extraReducers: (builder) => {
    // Fetch employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading.employees = true;
        state.error.employees = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading.employees = false;
        state.employees = action.payload.data;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
          hasNext: !!action.payload.pagination.next,
          hasPrevious: !!action.payload.pagination.previous
        };
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading.employees = false;
        state.error.employees = action.payload;
      });


    builder
      .addCase(uploadEmployeeProfilePhoto.pending, (state) => {
        state.loading.profilePhoto = true;
        state.error.profilePhoto = null;
        state.success.profilePhoto = false;
      })
      .addCase(uploadEmployeeProfilePhoto.fulfilled, (state, action) => {
        state.loading.profilePhoto = false;
        state.success.profilePhoto = true;
        
        const { employeeId, data } = action.payload;
        
        // Update current employee if it matches
        if (state.currentEmployee && state.currentEmployee.id == employeeId) {
          state.currentEmployee.profile_image = data.profile_image_url || data.profile_image;
          state.currentEmployee.profile_image_url = data.profile_image_url || data.profile_image;
        }
        
        // Update employee in list if it exists
        const employeeIndex = state.employees.findIndex(emp => emp.id == employeeId);
        if (employeeIndex !== -1) {
          state.employees[employeeIndex].profile_image = data.profile_image_url || data.profile_image;
          state.employees[employeeIndex].profile_image_url = data.profile_image_url || data.profile_image;
        }
      })
      .addCase(uploadEmployeeProfilePhoto.rejected, (state, action) => {
        state.loading.profilePhoto = false;
        state.error.profilePhoto = action.payload?.message || 'Failed to upload profile photo';
      });

    // Profile Photo Delete - YENİ
    builder
      .addCase(deleteEmployeeProfilePhoto.pending, (state) => {
        state.loading.profilePhoto = true;
        state.error.profilePhoto = null;
        state.success.profilePhoto = false;
      })
      .addCase(deleteEmployeeProfilePhoto.fulfilled, (state, action) => {
        state.loading.profilePhoto = false;
        state.success.profilePhoto = true;
        
        const { employeeId } = action.payload;
        
        // Update current employee if it matches
        if (state.currentEmployee && state.currentEmployee.id == employeeId) {
          state.currentEmployee.profile_image = null;
          state.currentEmployee.profile_image_url = null;
        }
        
        // Update employee in list if it exists
        const employeeIndex = state.employees.findIndex(emp => emp.id == employeeId);
        if (employeeIndex !== -1) {
          state.employees[employeeIndex].profile_image = null;
          state.employees[employeeIndex].profile_image_url = null;
        }
      })
      .addCase(deleteEmployeeProfilePhoto.rejected, (state, action) => {
        state.loading.profilePhoto = false;
        state.error.profilePhoto = action.payload?.message || 'Failed to delete profile photo';
      });
      
      
    // Advanced search
    builder
      .addCase(searchEmployeesAdvanced.pending, (state) => {
        state.loading.advancedSearch = true;
        state.error.advancedSearch = null;
      })
      .addCase(searchEmployeesAdvanced.fulfilled, (state, action) => {
        state.loading.advancedSearch = false;
        state.employees = action.payload.data;
        state.searchResults = action.payload.data;
        state.searchPagination = action.payload.pagination;
        state.lastSearchParams = action.payload.searchParams;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
          hasNext: !!action.payload.pagination.next,
          hasPrevious: !!action.payload.pagination.previous
        };
      })
      .addCase(searchEmployeesAdvanced.rejected, (state, action) => {
        state.loading.advancedSearch = false;
        state.error.advancedSearch = action.payload;
      });

    // Fetch single employee
    builder
      .addCase(fetchEmployee.pending, (state) => {
        state.loading.employee = true;
        state.error.employee = null;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.loading.employee = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.loading.employee = false;
        state.error.employee = action.payload;
      });

    // Create employee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.loading.creating = true;
        state.error.create = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.employees.unshift(action.payload);
        state.statistics.total_employees += 1;
        state.statistics.active_employees += 1;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.create = action.payload;
      });

    // Update employee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading.updating = true;
        state.error.update = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updatedEmployee = action.payload;
        const index = state.employees.findIndex(emp => emp.id === updatedEmployee.id);
        if (index !== -1) {
          state.employees[index] = updatedEmployee;
        }
        if (state.currentEmployee?.id === updatedEmployee.id) {
          state.currentEmployee = updatedEmployee;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.update = action.payload;
      });



    // Statistics
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.error.statistics = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.error.statistics = action.payload;
      });

  
    // ORG CHART VISIBILITY - YENİ REDUCER-LƏR
    // ========================================
    
    builder
      .addCase(toggleOrgChartVisibility.pending, (state) => {
        state.loading.orgChart = true;
        state.error.orgChart = null;
      })
      .addCase(toggleOrgChartVisibility.fulfilled, (state, action) => {
        state.loading.orgChart = false;
        const { employeeId, result } = action.payload;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee && result.employee) {
          employee.is_visible_in_org_chart = result.employee.is_visible_in_org_chart;
          employee._isOptimisticOrgChart = false;
        }
      })
      .addCase(toggleOrgChartVisibility.rejected, (state, action) => {
        state.loading.orgChart = false;
        state.error.orgChart = action.payload;
        // Revert optimistic update on error
        state.employees.forEach(emp => {
          if (emp._isOptimisticOrgChart) {
            emp.is_visible_in_org_chart = !emp.is_visible_in_org_chart;
            emp._isOptimisticOrgChart = false;
          }
        });
      });

    builder
      .addCase(bulkToggleOrgChartVisibility.pending, (state) => {
        state.loading.bulkOperations = true;
        state.error.bulkOperations = null;
      })
      .addCase(bulkToggleOrgChartVisibility.fulfilled, (state, action) => {
        state.loading.bulkOperations = false;
        const { employeeIds, setVisible, result } = action.payload;
        
        if (result.updated_employees) {
          result.updated_employees.forEach(updatedEmployee => {
            const employee = state.employees.find(emp => emp.id === updatedEmployee.id);
            if (employee) {
              employee.is_visible_in_org_chart = updatedEmployee.is_visible_in_org_chart;
              employee._isOptimisticOrgChart = false;
            }
          });
        } else {
          // Fallback if backend doesn't return updated employees
          employeeIds.forEach(employeeId => {
            const employee = state.employees.find(emp => emp.id === employeeId);
            if (employee) {
              employee.is_visible_in_org_chart = setVisible;
              employee._isOptimisticOrgChart = false;
            }
          });
        }
        
        state.selectedEmployees = [];
      })
      .addCase(bulkToggleOrgChartVisibility.rejected, (state, action) => {
        state.loading.bulkOperations = false;
        state.error.bulkOperations = action.payload;
        // Revert optimistic updates on error
        state.employees.forEach(emp => {
          if (emp._isOptimisticOrgChart) {
            emp.is_visible_in_org_chart = !emp.is_visible_in_org_chart;
            emp._isOptimisticOrgChart = false;
          }
        });
      });

    // Tag management
    builder
      .addCase(addEmployeeTag.pending, (state) => {
        state.loading.tagUpdate = true;
        state.error.tagUpdate = null;
      })
      .addCase(addEmployeeTag.fulfilled, (state, action) => {
        state.loading.tagUpdate = false;
        const { employee_id, tag } = action.payload;
        const employee = state.employees.find(emp => emp.id === employee_id);
        if (employee) {
          if (!employee.tag_names) employee.tag_names = [];
          employee.tag_names.push(tag);
        }
      })
      .addCase(addEmployeeTag.rejected, (state, action) => {
        state.loading.tagUpdate = false;
        state.error.tagUpdate = action.payload;
      });

    builder
      .addCase(removeEmployeeTag.fulfilled, (state, action) => {
        const { employee_id, tag_id } = action.payload;
        const employee = state.employees.find(emp => emp.id === employee_id);
        if (employee && employee.tag_names) {
          employee.tag_names = employee.tag_names.filter(tag => tag.id !== tag_id);
        }
      });

    builder
      .addCase(bulkAddTags.fulfilled, (state, action) => {
        const { employee_ids, tag_id, result } = action.payload;
        if (result.tag_info) {
          employee_ids.forEach(emp_id => {
            const employee = state.employees.find(emp => emp.id === emp_id);
            if (employee) {
              if (!employee.tag_names) employee.tag_names = [];
              employee.tag_names.push(result.tag_info);
            }
          });
        }
        state.selectedEmployees = [];
      });

    builder
      .addCase(bulkRemoveTags.fulfilled, (state, action) => {
        const { employee_ids, tag_id } = action.payload;
        employee_ids.forEach(emp_id => {
          const employee = state.employees.find(emp => emp.id === emp_id);
          if (employee && employee.tag_names) {
            employee.tag_names = employee.tag_names.filter(tag => tag.id !== tag_id);
          }
        });
        state.selectedEmployees = [];
      });

    // Line manager management
    builder
      .addCase(assignLineManager.pending, (state) => {
        state.loading.lineManagerUpdate = true;
        state.error.lineManagerUpdate = null;
      })
      .addCase(assignLineManager.fulfilled, (state, action) => {
        state.loading.lineManagerUpdate = false;
        const { employee_id, line_manager_id, result } = action.payload;
        const employee = state.employees.find(emp => emp.id === employee_id);
        if (employee && result.line_manager_info) {
          employee.line_manager = line_manager_id;
          employee.line_manager_name = result.line_manager_info.name;
          employee.line_manager_hc_number = result.line_manager_info.employee_id;
        }
      })
      .addCase(assignLineManager.rejected, (state, action) => {
        state.loading.lineManagerUpdate = false;
        state.error.lineManagerUpdate = action.payload;
      });

    builder
      .addCase(bulkAssignLineManager.fulfilled, (state, action) => {
        const { employee_ids, line_manager_id, result } = action.payload;
        if (result.line_manager_info) {
          employee_ids.forEach(emp_id => {
            const employee = state.employees.find(emp => emp.id === emp_id);
            if (employee) {
              employee.line_manager = line_manager_id;
              employee.line_manager_name = result.line_manager_info.name;
              employee.line_manager_hc_number = result.line_manager_info.employee_id;
            }
          });
        }
        state.selectedEmployees = [];
      });

    // Contract management
    builder
      .addCase(extendEmployeeContract.pending, (state) => {
        state.loading.contractUpdate = true;
        state.error.contractUpdate = null;
      })
      .addCase(extendEmployeeContract.fulfilled, (state, action) => {
        state.loading.contractUpdate = false;
        const result = action.payload;
        if (result.updated_employee) {
          const employee = state.employees.find(emp => emp.id === result.updated_employee.employee_id);
          if (employee) {
            Object.assign(employee, result.updated_employee);
          }
        }
      })
      .addCase(extendEmployeeContract.rejected, (state, action) => {
        state.loading.contractUpdate = false;
        state.error.contractUpdate = action.payload;
      });

    builder
      .addCase(bulkExtendContracts.fulfilled, (state, action) => {
        const result = action.payload;
        if (result.updated_employees) {
          result.updated_employees.forEach(update => {
            const employee = state.employees.find(emp => emp.id === update.employee_id);
            if (employee) {
              Object.assign(employee, update);
            }
          });
        }
        state.selectedEmployees = [];
      });

  

 

    // Grading operations
    builder
      .addCase(fetchEmployeeGrading.pending, (state) => {
        state.loading.grading = true;
        state.error.grading = null;
      })
      .addCase(fetchEmployeeGrading.fulfilled, (state, action) => {
        state.loading.grading = false;
        state.gradingData = action.payload;
        
        const employees = action.payload.employees || [];
        const total = employees.length;
        const graded = employees.filter(emp => emp.grading_level && emp.grading_level !== '').length;
        
        state.gradingStatistics = {
          ...state.gradingStatistics,
          totalEmployees: total,
          gradedEmployees: graded,
          ungradedEmployees: total - graded
        };
      })
      .addCase(fetchEmployeeGrading.rejected, (state, action) => {
        state.loading.grading = false;
        state.error.grading = action.payload;
      });



  

    // Export & template
    builder
      .addCase(exportEmployees.pending, (state) => {
        state.loading.exporting = true;
        state.error.export = null;
      })
      .addCase(exportEmployees.fulfilled, (state) => {
        state.loading.exporting = false;
      })
      .addCase(exportEmployees.rejected, (state, action) => {
        state.loading.exporting = false;
        state.error.export = action.payload;
      });

    builder
      .addCase(downloadEmployeeTemplate.pending, (state) => {
        state.loading.template = true;
        state.error.template = null;
      })
      .addCase(downloadEmployeeTemplate.fulfilled, (state) => {
        state.loading.template = false;
      })
      .addCase(downloadEmployeeTemplate.rejected, (state, action) => {
        state.loading.template = false;
        state.error.template = action.payload;
      });

    builder
      .addCase(bulkUploadEmployees.pending, (state) => {
        state.loading.upload = true;
        state.error.upload = null;
      })
      .addCase(bulkUploadEmployees.fulfilled, (state, action) => {
        state.loading.upload = false;
        const result = action.payload;
        
        if (result.created_employees && result.created_employees.length > 0) {
          state.employees.unshift(...result.created_employees);
          state.statistics.total_employees += result.successful || 0;
        }
      })
      .addCase(bulkUploadEmployees.rejected, (state, action) => {
        state.loading.upload = false;
        state.error.upload = action.payload;
      });

    

    // Activities
    builder
      .addCase(fetchEmployeeActivities.pending, (state) => {
        state.loading.activities = true;
        state.error.activities = null;
      })
      .addCase(fetchEmployeeActivities.fulfilled, (state, action) => {
        state.loading.activities = false;
        const { employeeId, activities } = action.payload;
        state.activities[employeeId] = activities;
      })
      .addCase(fetchEmployeeActivities.rejected, (state, action) => {
        state.loading.activities = false;
        state.error.activities = action.payload;
      });

    builder
      .addCase(fetchEmployeeDirectReports.pending, (state) => {
        state.loading.directReports = true;
        state.error.directReports = null;
      })
      .addCase(fetchEmployeeDirectReports.fulfilled, (state, action) => {
        state.loading.directReports = false;
        const { employeeId, directReports } = action.payload;
        state.directReports[employeeId] = directReports;
      })
      .addCase(fetchEmployeeDirectReports.rejected, (state, action) => {
        state.loading.directReports = false;
        state.error.directReports = action.payload;
      });

    builder
      .addCase(fetchEmployeeStatusPreview.pending, (state) => {
        state.loading.statusPreview = true;
        state.error.statusPreview = null;
      })
      .addCase(fetchEmployeeStatusPreview.fulfilled, (state, action) => {
        state.loading.statusPreview = false;
        const { employeeId, statusPreview } = action.payload;
        state.statusPreviews[employeeId] = statusPreview;
      })
      .addCase(fetchEmployeeStatusPreview.rejected, (state, action) => {
        state.loading.statusPreview = false;
        state.error.statusPreview = action.payload;
      });
  },
});

// Actions export - Enhanced
export const {
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  selectAllVisible,
  clearSelection,
  setCurrentFilters,
  addFilter,
  removeFilter,
  clearFilters,
  updateFilter,
  setAdvancedFilters,
  updateAdvancedFilter,
  clearAdvancedFilters,
  setFilterMode,
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  toggleSort,
  reorderSorts,
  setSortingMode,
  setCurrentPage,
  setPageSize,
  goToNextPage,
  goToPreviousPage,
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  setViewMode,
  setShowGradingPanel,
  toggleGradingPanel,
  setGradingMode,
  clearErrors,
  clearError,
  setError,
  clearCurrentEmployee,
  setQuickFilter,
  setLastSearchParams,
  clearSearchResults,
  optimisticUpdateEmployee,
  optimisticDeleteEmployee,

  optimisticToggleOrgChartVisibility,
  optimisticBulkToggleOrgChartVisibility,

   clearProfilePhotoError,
  clearProfilePhotoSuccess,
  setProfilePhotoLoading,
} = employeeSlice.actions;

// Basic selectors - Enhanced
export const selectProfilePhotoLoading = (state) => state.employees.loading.profilePhoto;
export const selectProfilePhotoError = (state) => state.employees.error.profilePhoto;
export const selectProfilePhotoSuccess = (state) => state.employees.success.profilePhoto;
export const selectEmployees = (state) => state.employees.employees;
export const selectCurrentEmployee = (state) => state.employees.currentEmployee;
export const selectEmployeeLoading = (state) => state.employees.loading;
export const selectEmployeeError = (state) => state.employees.error;
export const selectSelectedEmployees = (state) => state.employees.selectedEmployees;
export const selectCurrentFilters = (state) => state.employees.currentFilters;
export const selectAppliedFilters = (state) => state.employees.appliedFilters;
export const selectAdvancedFilters = (state) => state.employees.advancedFilters;
export const selectFilterMode = (state) => state.employees.filterMode;
export const selectStatistics = (state) => state.employees.statistics;
export const selectPagination = (state) => state.employees.pagination;
export const selectSorting = (state) => state.employees.sorting;
export const selectSortingMode = (state) => state.employees.sortingMode;
export const selectGradingData = (state) => state.employees.gradingData;
export const selectGradingStatistics = (state) => state.employees.gradingStatistics;
export const selectAllGradingLevels = (state) => state.employees.allGradingLevels;
export const selectActivities = (state) => state.employees.activities;
export const selectDirectReports = (state) => state.employees.directReports;
export const selectStatusPreviews = (state) => state.employees.statusPreviews;
export const selectViewMode = (state) => state.employees.viewMode;
export const selectShowAdvancedFilters = (state) => state.employees.showAdvancedFilters;
export const selectShowGradingPanel = (state) => state.employees.showGradingPanel;
export const selectGradingMode = (state) => state.employees.gradingMode;
export const selectContractExpiryAlerts = (state) => state.employees.contractExpiryAlerts;
export const selectContractsExpiringSoon = (state) => state.employees.contractsExpiringSoon;
export const selectSearchResults = (state) => state.employees.searchResults;
export const selectLastSearchParams = (state) => state.employees.lastSearchParams;
export const selectSearchPagination = (state) => state.employees.searchPagination;

// Enhanced memoized selectors
export const selectFormattedEmployees = createSelector(
  [selectEmployees],
  (employees) => employees.map(employee => ({
    ...employee,
    fullName: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.name || '',
    displayName: employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
    positionInfo: `${employee.job_title || ''} - ${employee.position_group_name || ''}`,
    departmentInfo: `${employee.business_function_name || ''} / ${employee.department_name || ''}`,
    statusBadge: {
      text: employee.status_name || employee.current_status_display || 'Unknown',
      color: employee.status_color || '#gray',
      affects_headcount: employee.status_affects_headcount
    },
    contractInfo: {
      duration: employee.contract_duration_display || employee.contract_duration,
      startDate: employee.contract_start_date || employee.start_date,
      endDate: employee.contract_end_date || employee.end_date,
      isTemporary: employee.contract_duration !== 'PERMANENT',
      extensions: employee.contract_extensions || 0,
      lastExtension: employee.last_extension_date
    },
    serviceInfo: {
      yearsOfService: employee.years_of_service || 0,
      startDate: employee.start_date,
      isNewHire: (employee.years_of_service || 0) < 0.25,
      isVeteran: (employee.years_of_service || 0) >= 5
    },
    managementInfo: {
      hasLineManager: !!employee.line_manager,
      lineManagerName: employee.line_manager_name,
      lineManagerEmployeeId: employee.line_manager_hc_number,
      directReportsCount: employee.direct_reports_count || 0,
      isLineManager: (employee.direct_reports_count || 0) > 0
    },
    gradingInfo: {
      level: employee.grading_level,
      display: employee.grading_display || (employee.grading_level ? employee.grading_level : 'No Grade'),
      hasGrade: !!employee.grading_level,
      isOptimistic: employee._isOptimistic === true
    },
    orgChartInfo: {
      isVisible: employee.is_visible_in_org_chart,
      isOptimistic: employee._isOptimisticOrgChart === true
    },
    tagInfo: {
      tags: employee.tags || [],
      tagNames: employee.tag_names || [],
     
      tagCount: (employee.tags || []).length
    },
    statusInfo: {
      needsUpdate: employee.status_needs_update === true,
      isActive: employee.status_name === 'ACTIVE' || employee.status_name === 'Active',
      isOnLeave: employee.status_name === 'ON_LEAVE',
      isOnboarding: employee.status_name === 'ONBOARDING',
      isProbation: employee.status_name === 'PROBATION',
      isInactive: employee.status_name === 'INACTIVE'
    }
  }))
);

export const selectSortingForBackend = createSelector(
  [selectSorting],
  (sorting) => {
    if (!sorting.length) return '';
    
    return sorting.map(sort => {
      const prefix = sort.direction === 'desc' ? '-' : '';
      return `${prefix}${sort.field}`;
    }).join(',');
  }
);

export const selectFilteredEmployeesCount = createSelector(
  [selectEmployees, selectCurrentFilters],
  (employees, filters) => {
    if (!Object.keys(filters).length) return employees.length;
    
    return employees.filter(employee => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all' || value === '') return true;
        
        switch (key) {
          case 'search':
            const searchTerm = value.toLowerCase();
            return (
              employee.name?.toLowerCase().includes(searchTerm) ||
              employee.email?.toLowerCase().includes(searchTerm) ||
              employee.employee_id?.toLowerCase().includes(searchTerm) ||
              employee.job_title?.toLowerCase().includes(searchTerm)
            );
          case 'employee_search':
            const empSearchTerm = value.toLowerCase();
            return (
              employee.name?.toLowerCase().includes(empSearchTerm) ||
              employee.employee_id?.toLowerCase().includes(empSearchTerm) ||
              employee.first_name?.toLowerCase().includes(empSearchTerm) ||
              employee.last_name?.toLowerCase().includes(empSearchTerm)
            );
          case 'line_manager_search':
            const managerSearchTerm = value.toLowerCase();
            return employee.line_manager_name?.toLowerCase().includes(managerSearchTerm);
          case 'job_title_search':
            const jobSearchTerm = value.toLowerCase();
            return employee.job_title?.toLowerCase().includes(jobSearchTerm);
          case 'status':
            return Array.isArray(value) 
              ? value.includes(employee.status_name || employee.status)
              : (employee.status_name || employee.status) === value;
          case 'business_function':
            return Array.isArray(value)
              ? value.includes(employee.business_function)
              : employee.business_function === parseInt(value);
          case 'department':
            return Array.isArray(value)
              ? value.includes(employee.department)
              : employee.department === parseInt(value);
          case 'position_group':
            return Array.isArray(value)
              ? value.includes(employee.position_group)
              : employee.position_group === parseInt(value);
          case 'tags':
            if (!employee.tags) return false;
            return Array.isArray(value)
              ? value.some(tagId => employee.tags.some(tag => tag.id === tagId))
              : employee.tags.some(tag => tag.id === value);
          case 'is_visible_in_org_chart':
            return employee.is_visible_in_org_chart === value;
          case 'is_active':
            return value ? employee.status_name === 'ACTIVE' : employee.status_name !== 'ACTIVE';
          default:
            return true;
        }
      });
    }).length;
  }
);

// Helper selectors for sorting - Enhanced
export const selectGetSortDirection = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    const sort = sorting.find(s => s.field === field);
    return sort ? sort.direction : null;
  }
);

export const selectIsSorted = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    return sorting.some(s => s.field === field);
  }
);

export const selectGetSortIndex = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    const index = sorting.findIndex(s => s.field === field);
    return index !== -1 ? index + 1 : null;
  }
);

// Helper selector for API params - Enhanced
export const selectApiParams = createSelector(
  [selectCurrentFilters, selectAdvancedFilters, selectSortingForBackend, selectPagination],
  (filters, advancedFilters, ordering, pagination) => {
    // Combine current filters with advanced filters
    const combinedFilters = { ...filters };
    
    // Add advanced search filters
    if (advancedFilters.searchFilters) {
      Object.entries(advancedFilters.searchFilters).forEach(([key, value]) => {
        if (value) {
          combinedFilters[key] = value;
        }
      });
    }
    
    // Add multi-select filters
    if (advancedFilters.multiSelectFilters) {
      Object.entries(advancedFilters.multiSelectFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          combinedFilters[key] = value;
        }
      });
    }
    
    // Add date range filters
    if (advancedFilters.dateRangeFilters) {
      Object.entries(advancedFilters.dateRangeFilters).forEach(([key, value]) => {
        if (value && (value.from || value.to)) {
          if (value.from) combinedFilters[`${key}_from`] = value.from;
          if (value.to) combinedFilters[`${key}_to`] = value.to;
        }
      });
    }
    
    // Add numeric range filters
    if (advancedFilters.numericRangeFilters) {
      Object.entries(advancedFilters.numericRangeFilters).forEach(([key, value]) => {
        if (value && (value.min !== null || value.max !== null)) {
          if (value.min !== null) combinedFilters[`${key}_min`] = value.min;
          if (value.max !== null) combinedFilters[`${key}_max`] = value.max;
        }
      });
    }
    
    // Add boolean filters
    if (advancedFilters.booleanFilters) {
      Object.entries(advancedFilters.booleanFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          combinedFilters[key] = value;
        }
      });
    }
    
    // Add special filters
    if (advancedFilters.specialFilters) {
      Object.entries(advancedFilters.specialFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          combinedFilters[key] = value;
        }
      });
    }
    
    return {
      ...combinedFilters,
      ordering,
      page: pagination.page,
      page_size: pagination.pageSize
    };
  }
);

// Selection helpers - Enhanced
export const selectSelectionInfo = createSelector(
  [selectSelectedEmployees, selectEmployees],
  (selectedEmployees, employees) => ({
    selectedCount: selectedEmployees.length,
    totalCount: employees.length,
    hasSelection: selectedEmployees.length > 0,
    isAllSelected: selectedEmployees.length === employees.length && employees.length > 0,
    isPartialSelection: selectedEmployees.length > 0 && selectedEmployees.length < employees.length,
    selectionPercentage: employees.length > 0 ? (selectedEmployees.length / employees.length) * 100 : 0
  })
);

// Grading selectors - Enhanced
export const selectEmployeesNeedingGrades = createSelector(
  [selectGradingData],
  (gradingData) => {
    const employees = gradingData.employees || [];
    return employees.filter(emp => !emp.grading_level || emp.grading_level === '');
  }
);

export const selectEmployeesByGradeLevel = createSelector(
  [selectGradingData],
  (gradingData) => {
    const byGrade = {};
    const employees = gradingData.employees || [];
    
    employees.forEach(emp => {
      const grade = emp.grading_level || 'No Grade';
      if (!byGrade[grade]) {
        byGrade[grade] = [];
      }
      byGrade[grade].push(emp);
    });
    
    return byGrade;
  }
);

export const selectEmployeesByPositionGroup = createSelector(
  [selectGradingData],
  (gradingData) => {
    const byPositionGroup = {};
    const employees = gradingData.employees || [];
    
    employees.forEach(emp => {
      const positionGroup = emp.position_group_name || 'Unknown';
      if (!byPositionGroup[positionGroup]) {
        byPositionGroup[positionGroup] = [];
      }
      byPositionGroup[positionGroup].push(emp);
    });
    
    return byPositionGroup;
  }
);

export const selectGradingProgress = createSelector(
  [selectGradingStatistics],
  (statistics) => {
    const { totalEmployees, gradedEmployees } = statistics;
    
    if (totalEmployees === 0) return 0;
    
    return Math.round((gradedEmployees / totalEmployees) * 100);
  }
);

export const selectGradingDistribution = createSelector(
  [selectEmployeesByGradeLevel, selectAllGradingLevels],
  (employeesByGrade, allLevels) => {
    const distribution = allLevels.map(level => ({
      ...level,
      count: employeesByGrade[level.code]?.length || 0,
      employees: employeesByGrade[level.code] || []
    }));
    
    distribution.push({
      code: 'NO_GRADE',
      display: 'No Grade',
      full_name: 'No Grade Assigned',
      count: employeesByGrade['No Grade']?.length || 0,
      employees: employeesByGrade['No Grade'] || []
    });
    
    return distribution;
  }
);

// Statistics selectors - Enhanced
export const selectEmployeesByStatus = createSelector(
  [selectEmployees],
  (employees) => {
    const byStatus = {};
    employees.forEach(emp => {
      const status = emp.status_name || emp.status || 'Unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });
    return byStatus;
  }
);

export const selectEmployeesByDepartment = createSelector(
  [selectEmployees],
  (employees) => {
    const byDepartment = {};
    employees.forEach(emp => {
      const dept = emp.department_name || 'Unknown';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    });
    return byDepartment;
  }
);

export const selectNewHires = createSelector(
  [selectEmployees],
  (employees) => employees.filter(emp => (emp.years_of_service || 0) < 0.25)
);

export const selectEmployeesNeedingAttention = createSelector(
  [selectEmployees],
  (employees) => ({
    noLineManager: employees.filter(emp => !emp.line_manager),
    noGrading: employees.filter(emp => !emp.grading_level),
    contractEnding: employees.filter(emp => {
      if (!emp.contract_end_date) return false;
      const endDate = new Date(emp.contract_end_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return endDate <= thirtyDaysFromNow;
    }),
    onLeave: employees.filter(emp => (emp.status_name || emp.status) === 'ON_LEAVE'),
    statusUpdate: employees.filter(emp => emp.status_needs_update === true),
    orgChartHidden: employees.filter(emp => !emp.is_visible_in_org_chart),
    onboarding: employees.filter(emp => (emp.status_name || emp.status) === 'ONBOARDING'),
    probation: employees.filter(emp => (emp.status_name || emp.status) === 'PROBATION')
  })
);

// Loading & error state selectors - Enhanced
export const selectIsAnyLoading = createSelector(
  [selectEmployeeLoading],
  (loading) => Object.values(loading).some(Boolean)
);

export const selectHasAnyError = createSelector(
  [selectEmployeeError],
  (errors) => Object.values(errors).some(error => error !== null)
);

// Dashboard summary selectors - Enhanced
export const selectDashboardSummary = createSelector(
  [selectStatistics, selectEmployeesNeedingAttention, selectGradingProgress, selectContractExpiryAlerts],
  (statistics, needingAttention, gradingProgress, contractAlerts) => ({
    totalEmployees: statistics.total_employees,
    activeEmployees: statistics.active_employees,
    newHires: statistics.recent_hires_30_days,
    upcomingEndContracts: statistics.upcoming_contract_endings_30_days,
    employeesNeedingAttention: {
      noLineManager: needingAttention.noLineManager.length,
      noGrading: needingAttention.noGrading.length,
      onLeave: needingAttention.onLeave.length,
      contractEnding: needingAttention.contractEnding.length,
      statusUpdate: needingAttention.statusUpdate.length,
      orgChartHidden: needingAttention.orgChartHidden.length,
      onboarding: needingAttention.onboarding.length,
      probation: needingAttention.probation.length
    },
    gradingProgress,
    contractAlerts: {
      totalExpiring: contractAlerts.total_expiring,
      urgentContracts: contractAlerts.urgent_employees?.length || 0
    },
    trends: {
      newHiresTrend: statistics.recent_hires_30_days > statistics.recent_hires_30_days * 0.8 ? 'up' : 'down',
      contractRiskTrend: contractAlerts.total_expiring > 0 ? 'up' : 'stable'
    }
  })
);

export const selectEmployeeMetrics = createSelector(
  [selectEmployees, selectStatistics, selectGradingData],
  (employees, statistics, gradingData) => ({
    headcount: {
      total: employees.length,
      active: employees.filter(emp => emp.status_name === 'ACTIVE').length,
      onLeave: employees.filter(emp => emp.status_name === 'ON_LEAVE').length,
      onboarding: employees.filter(emp => emp.status_name === 'ONBOARDING').length,
      probation: employees.filter(emp => emp.status_name === 'PROBATION').length,
      inactive: employees.filter(emp => emp.status_name === 'INACTIVE').length
    },
    diversity: {
      genderDistribution: employees.reduce((acc, emp) => {
        const gender = emp.gender || 'Not Specified';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {}),
      averageAge: employees.reduce((sum, emp) => {
        if (emp.date_of_birth) {
          const age = new Date().getFullYear() - new Date(emp.date_of_birth).getFullYear();
          return sum + age;
        }
        return sum;
      }, 0) / employees.filter(emp => emp.date_of_birth).length || 0
    },
    performance: {
      gradingProgress: gradingData.employees?.length > 0 ? 
        (gradingData.employees.filter(emp => emp.grading_level).length / gradingData.employees.length) * 100 : 0,
      averageServiceYears: employees.reduce((sum, emp) => sum + (emp.years_of_service || 0), 0) / employees.length || 0,
      managementCoverage: employees.length > 0 ? 
        (employees.filter(emp => emp.line_manager).length / employees.length) * 100 : 0
    },
    orgChart: {
      visibleEmployees: employees.filter(emp => emp.is_visible_in_org_chart).length,
      hiddenEmployees: employees.filter(emp => !emp.is_visible_in_org_chart).length,
      managers: employees.filter(emp => (emp.direct_reports_count || 0) > 0).length,
      participation: employees.length > 0 ? 
        (employees.filter(emp => emp.is_visible_in_org_chart).length / employees.length) * 100 : 0
    },
    retention: {
      newHiresThisMonth: employees.filter(emp => {
        if (!emp.start_date) return false;
        const startDate = new Date(emp.start_date);
        const thisMonth = new Date();
        return startDate.getMonth() === thisMonth.getMonth() && 
               startDate.getFullYear() === thisMonth.getFullYear();
      }).length,
      upcomingContractEnds: employees.filter(emp => {
        if (!emp.contract_end_date) return false;
        const endDate = new Date(emp.contract_end_date);
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return endDate <= thirtyDaysFromNow;
      }).length,
      veteranEmployees: employees.filter(emp => (emp.years_of_service || 0) >= 5).length
    },
    risks: {
      contractRisk: employees.length > 0 ? 
        (employees.filter(emp => {
          if (!emp.contract_end_date) return false;
          const endDate = new Date(emp.contract_end_date);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return endDate <= thirtyDaysFromNow;
        }).length / employees.length) * 100 : 0,
      statusRisk: employees.length > 0 ? 
        (employees.filter(emp => emp.status_needs_update).length / employees.length) * 100 : 0,
      managementGap: employees.length > 0 ? 
        (employees.filter(emp => !emp.line_manager).length / employees.length) * 100 : 0
    }
  })
);

// Advanced filter selectors
export const selectHasActiveAdvancedFilters = createSelector(
  [selectAdvancedFilters],
  (advancedFilters) => {
    const hasSearchFilters = Object.values(advancedFilters.searchFilters || {}).some(value => 
      value && value.trim() !== ''
    );
    
    const hasMultiSelectFilters = Object.values(advancedFilters.multiSelectFilters || {}).some(value => 
      Array.isArray(value) && value.length > 0
    );
    
    const hasDateRangeFilters = Object.values(advancedFilters.dateRangeFilters || {}).some(value => 
      value && (value.from || value.to)
    );
    
    const hasNumericRangeFilters = Object.values(advancedFilters.numericRangeFilters || {}).some(value => 
      value && (value.min !== null || value.max !== null)
    );
    
    const hasBooleanFilters = Object.values(advancedFilters.booleanFilters || {}).some(value => 
      value !== null && value !== undefined
    );
    
    const hasSpecialFilters = Object.values(advancedFilters.specialFilters || {}).some(value => 
      value !== null && value !== undefined
    );
    
    return hasSearchFilters || hasMultiSelectFilters || hasDateRangeFilters || 
           hasNumericRangeFilters || hasBooleanFilters || hasSpecialFilters;
  }
);

// Sorting selectors - Enhanced
export const selectSortingConfig = createSelector(
  [selectSorting, selectSortingMode],
  (sorting, sortingMode) => ({
    sorts: sorting,
    mode: sortingMode,
    count: sorting.length,
    hasMultipleSorts: sorting.length > 1,
    primarySort: sorting.length > 0 ? sorting[0] : null,
    canAddMore: sortingMode === 'multiple'
  })
);

// Search selectors
export const selectSearchConfig = createSelector(
  [selectSearchResults, selectLastSearchParams, selectSearchPagination],
  (searchResults, lastSearchParams, searchPagination) => ({
    results: searchResults,
    lastParams: lastSearchParams,
    pagination: searchPagination,
    hasResults: searchResults.length > 0,
    hasSearched: lastSearchParams !== null
  })
);

export default employeeSlice.reducer;