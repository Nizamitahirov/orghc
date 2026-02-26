// src/store/slices/referenceDataSlice.js - Job Titles əlavə edilib
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { referenceDataAPI } from '../api/referenceDataAPI';

// ========================================
// ASYNC THUNKS - FETCH OPERATIONS
// ========================================

export const fetchBusinessFunctions = createAsyncThunk(
  'referenceData/fetchBusinessFunctions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getBusinessFunctionDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'referenceData/fetchDepartments',
  async (businessFunctionId, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getDepartmentDropdown(businessFunctionId);
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchUnits = createAsyncThunk(
  'referenceData/fetchUnits',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getUnitDropdown(departmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchJobFunctions = createAsyncThunk(
  'referenceData/fetchJobFunctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getJobFunctionDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// NEW: Job Titles fetch
export const fetchJobTitles = createAsyncThunk(
  'referenceData/fetchJobTitles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getJobTitleDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchPositionGroups = createAsyncThunk(
  'referenceData/fetchPositionGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getPositionGroupDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployeeStatuses = createAsyncThunk(
  'referenceData/fetchEmployeeStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getEmployeeStatusDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployeeTags = createAsyncThunk(
  'referenceData/fetchEmployeeTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getEmployeeTagDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchContractConfigs = createAsyncThunk(
  'referenceData/fetchContractConfigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getContractConfigDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchPositionGroupGradingLevels = createAsyncThunk(
  'referenceData/fetchPositionGroupGradingLevels',
  async (positionGroupId, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getPositionGroupGradingLevels(positionGroupId);
      return { positionGroupId, levels: response.data.levels || [] };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - JOB TITLES CRUD (NEW)
// ========================================

export const createJobTitle = createAsyncThunk(
  'referenceData/createJobTitle',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createJobTitle(data);
      dispatch(fetchJobTitles());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateJobTitle = createAsyncThunk(
  'referenceData/updateJobTitle',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateJobTitle(id, data);
      dispatch(fetchJobTitles());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteJobTitle = createAsyncThunk(
  'referenceData/deleteJobTitle',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteJobTitle(id);
      dispatch(fetchJobTitles());
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - Companys CRUD
// ========================================

export const createBusinessFunction = createAsyncThunk(
  'referenceData/createBusinessFunction',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createBusinessFunction(data);
      dispatch(fetchBusinessFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateBusinessFunction = createAsyncThunk(
  'referenceData/updateBusinessFunction',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateBusinessFunction(id, data);
      dispatch(fetchBusinessFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteBusinessFunction = createAsyncThunk(
  'referenceData/deleteBusinessFunction',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteBusinessFunction(id);
      dispatch(fetchBusinessFunctions());
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - DEPARTMENTS CRUD
// ========================================

export const createDepartment = createAsyncThunk(
  'referenceData/createDepartment',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createDepartment(data);
      if (data.business_function) {
        dispatch(fetchDepartments(data.business_function));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'referenceData/updateDepartment',
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await referenceDataAPI.updateDepartment(id, data);
      const state = getState();
      const currentDepartment = state.referenceData.departments.find(d => d.id === id || d.value === id);
      if (currentDepartment) {
        dispatch(fetchDepartments(currentDepartment.business_function));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'referenceData/deleteDepartment',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const department = state.referenceData.departments.find(d => d.id === id || d.value === id);
      await referenceDataAPI.deleteDepartment(id);
      if (department) {
        dispatch(fetchDepartments(department.business_function));
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - UNITS CRUD
// ========================================

export const createUnit = createAsyncThunk(
  'referenceData/createUnit',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createUnit(data);
      if (data.department) {
        dispatch(fetchUnits(data.department));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateUnit = createAsyncThunk(
  'referenceData/updateUnit',
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await referenceDataAPI.updateUnit(id, data);
      const state = getState();
      const currentUnit = state.referenceData.units.find(u => u.id === id || u.value === id);
      if (currentUnit) {
        dispatch(fetchUnits(currentUnit.department));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteUnit = createAsyncThunk(
  'referenceData/deleteUnit',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const unit = state.referenceData.units.find(u => u.id === id || u.value === id);
      await referenceDataAPI.deleteUnit(id);
      if (unit) {
        dispatch(fetchUnits(unit.department));
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - JOB FUNCTIONS CRUD
// ========================================

export const createJobFunction = createAsyncThunk(
  'referenceData/createJobFunction',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createJobFunction(data);
      dispatch(fetchJobFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateJobFunction = createAsyncThunk(
  'referenceData/updateJobFunction',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateJobFunction(id, data);
      dispatch(fetchJobFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteJobFunction = createAsyncThunk(
  'referenceData/deleteJobFunction',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteJobFunction(id);
      dispatch(fetchJobFunctions());
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - POSITION GROUPS CRUD
// ========================================

export const createPositionGroup = createAsyncThunk(
  'referenceData/createPositionGroup',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createPositionGroup(data);
      dispatch(fetchPositionGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updatePositionGroup = createAsyncThunk(
  'referenceData/updatePositionGroup',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updatePositionGroup(id, data);
      dispatch(fetchPositionGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deletePositionGroup = createAsyncThunk(
  'referenceData/deletePositionGroup',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deletePositionGroup(id);
      dispatch(fetchPositionGroups());
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - EMPLOYEE STATUSES CRUD
// ========================================

export const createEmployeeStatus = createAsyncThunk(
  'referenceData/createEmployeeStatus',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createEmployeeStatus(data);
      dispatch(fetchEmployeeStatuses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateEmployeeStatus = createAsyncThunk(
  'referenceData/updateEmployeeStatus',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateEmployeeStatus(id, data);
      dispatch(fetchEmployeeStatuses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteEmployeeStatus = createAsyncThunk(
  'referenceData/deleteEmployeeStatus',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteEmployeeStatus(id);
      dispatch(fetchEmployeeStatuses());
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - EMPLOYEE TAGS CRUD
// ========================================

export const createEmployeeTag = createAsyncThunk(
  'referenceData/createEmployeeTag',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createEmployeeTag(data);
      dispatch(fetchEmployeeTags());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateEmployeeTag = createAsyncThunk(
  'referenceData/updateEmployeeTag',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateEmployeeTag(id, data);
      dispatch(fetchEmployeeTags());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteEmployeeTag = createAsyncThunk(
  'referenceData/deleteEmployeeTag',
  async ({ id, tagType }, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteEmployeeTag(id);
      dispatch(fetchEmployeeTags());
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - CONTRACT CONFIGS CRUD
// ========================================

export const createContractConfig = createAsyncThunk(
  'referenceData/createContractConfig',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createContractConfig(data);
      dispatch(fetchContractConfigs());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateContractConfig = createAsyncThunk(
  'referenceData/updateContractConfig',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateContractConfig(id, data);
      dispatch(fetchContractConfigs());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteContractConfig = createAsyncThunk(
  'referenceData/deleteContractConfig',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteContractConfig(id);
      dispatch(fetchContractConfigs());
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Main data collections
  businessFunctions: [],
  departments: [],
  units: [],
  jobFunctions: [],
  jobTitles: [], // NEW
  positionGroups: [],
  employeeStatuses: [],
  employeeTags: [],
  contractConfigs: [],
  
  // Grading levels by position group
  gradingLevels: {},
  
  // Hierarchical selection state
  selectedBusinessFunction: null,
  selectedDepartment: null,
  
  // Loading states
  loading: {
    businessFunctions: false,
    departments: false,
    units: false,
    jobFunctions: false,
    jobTitles: false, // NEW
    positionGroups: false,
    employeeStatuses: false,
    employeeTags: false,
    contractConfigs: false,
    gradingLevels: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  
  // Error states
  error: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    jobTitles: null, // NEW
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
    contractConfigs: null,
    gradingLevels: null,
    create: null,
    update: null,
    delete: null,
  },
  
  // Cache management
  lastUpdated: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    jobTitles: null, // NEW
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
    contractConfigs: null,
  },
  
  cacheExpiry: 5 * 60 * 1000,
  
  // Metadata and statistics
  entityCounts: {
    businessFunctions: 0,
    departments: 0,
    units: 0,
    jobFunctions: 0,
    jobTitles: 0, // NEW
    positionGroups: 0,
    employeeStatuses: 0,
    employeeTags: 0,
    contractConfigs: 0,
  },
  
  // UI state
  ui: {
    showInactive: false,
    filterText: '',
    sortBy: 'name',
    sortDirection: 'asc',
    selectedEntityType: 'businessFunctions',
    isManagementMode: false,
  }
};

// ========================================
// SLICE DEFINITION
// ========================================

const referenceDataSlice = createSlice({
  name: 'referenceData',
  initialState,
  reducers: {
    // Hierarchical data management
    clearDepartments: (state) => {
      state.departments = [];
      state.selectedDepartment = null;
      state.lastUpdated.departments = null;
      state.entityCounts.departments = 0;
    },
    
    clearUnits: (state) => {
      state.units = [];
      state.lastUpdated.units = null;
      state.entityCounts.units = 0;
    },
    
    clearHierarchicalData: (state) => {
      state.departments = [];
      state.units = [];
      state.selectedBusinessFunction = null;
      state.selectedDepartment = null;
      state.lastUpdated.departments = null;
      state.lastUpdated.units = null;
      state.entityCounts.departments = 0;
      state.entityCounts.units = 0;
    },
    
    // Hierarchical selection management
    setSelectedBusinessFunction: (state, action) => {
      state.selectedBusinessFunction = action.payload;
      if (!action.payload) {
        state.departments = [];
        state.units = [];
        state.selectedDepartment = null;
        state.entityCounts.departments = 0;
        state.entityCounts.units = 0;
      }
    },
    
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
      if (!action.payload) {
        state.units = [];
        state.entityCounts.units = 0;
      }
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
    
    setError: (state, action) => {
      const { key, message } = action.payload;
      state.error[key] = message;
    },
    
    // Cache management
    invalidateCache: (state, action) => {
      const dataType = action.payload;
      if (dataType && state.lastUpdated[dataType]) {
        state.lastUpdated[dataType] = null;
      } else {
        Object.keys(state.lastUpdated).forEach(key => {
          state.lastUpdated[key] = null;
        });
      }
    },
    
    updateCacheTimestamp: (state, action) => {
      const { dataType, timestamp } = action.payload;
      state.lastUpdated[dataType] = timestamp || Date.now();
    },
    
    // Data reset
    resetReferenceData: (state) => {
      return {
        ...initialState,
        ui: state.ui,
      };
    },
    
    resetEntityData: (state, action) => {
      const entityType = action.payload;
      if (state[entityType]) {
        state[entityType] = [];
        state.lastUpdated[entityType] = null;
        state.entityCounts[entityType] = 0;
        state.error[entityType] = null;
      }
    },
    
    // Optimistic updates
    optimisticAddItem: (state, action) => {
      const { type, item } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const newItem = { 
          ...item, 
          id: `temp_${Date.now()}`, 
          _isOptimistic: true,
          is_active: true
        };
        state[type].unshift(newItem);
        state.entityCounts[type] = (state.entityCounts[type] || 0) + 1;
      }
    },
    
    optimisticUpdateItem: (state, action) => {
      const { type, id, updates } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const index = state[type].findIndex(item => 
          (item.id || item.value) === id
        );
        if (index !== -1) {
          state[type][index] = { 
            ...state[type][index], 
            ...updates, 
            _isOptimistic: true 
          };
        }
      }
    },
    
    optimisticRemoveItem: (state, action) => {
      const { type, id } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const initialLength = state[type].length;
        state[type] = state[type].filter(item => 
          (item.id || item.value) !== id
        );
        if (state[type].length < initialLength) {
          state.entityCounts[type] = Math.max(0, (state.entityCounts[type] || 0) - 1);
        }
      }
    },
    
    removeOptimisticFlags: (state, action) => {
      const entityType = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        state[entityType].forEach(item => {
          if (item._isOptimistic) {
            delete item._isOptimistic;
          }
        });
      }
    },
    
    // UI state management
    setShowInactive: (state, action) => {
      state.ui.showInactive = action.payload;
    },
    
    setFilterText: (state, action) => {
      state.ui.filterText = action.payload;
    },
    
    setSorting: (state, action) => {
      const { sortBy, sortDirection } = action.payload;
      state.ui.sortBy = sortBy;
      state.ui.sortDirection = sortDirection;
    },
    
    setSelectedEntityType: (state, action) => {
      state.ui.selectedEntityType = action.payload;
    },
    
    setManagementMode: (state, action) => {
      state.ui.isManagementMode = action.payload;
    },
    
    // Bulk operations
    bulkUpdateActiveStatus: (state, action) => {
      const { entityType, ids, isActive } = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        state[entityType].forEach(item => {
          if (ids.includes(item.id || item.value)) {
            item.is_active = isActive;
            item._isOptimistic = true;
          }
        });
      }
    },
    
    bulkDeleteItems: (state, action) => {
      const { entityType, ids } = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        const initialLength = state[entityType].length;
        state[entityType] = state[entityType].filter(item => 
          !ids.includes(item.id || item.value)
        );
        const deletedCount = initialLength - state[entityType].length;
        state.entityCounts[entityType] = Math.max(0, (state.entityCounts[entityType] || 0) - deletedCount);
      }
    },
    
    // Statistics updates
    updateEntityCounts: (state, action) => {
      const counts = action.payload;
      state.entityCounts = { ...state.entityCounts, ...counts };
    },
    
    incrementEntityCount: (state, action) => {
      const entityType = action.payload;
      state.entityCounts[entityType] = (state.entityCounts[entityType] || 0) + 1;
    },
    
    decrementEntityCount: (state, action) => {
      const entityType = action.payload;
      state.entityCounts[entityType] = Math.max(0, (state.entityCounts[entityType] || 0) - 1);
    },
  },
  
  extraReducers: (builder) => {
    // Companys
    builder
      .addCase(fetchBusinessFunctions.pending, (state) => {
        state.loading.businessFunctions = true;
        state.error.businessFunctions = null;
      })
      .addCase(fetchBusinessFunctions.fulfilled, (state, action) => {
        state.loading.businessFunctions = false;
        state.businessFunctions = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.businessFunctions = Date.now();
        state.entityCounts.businessFunctions = state.businessFunctions.length;
        state.businessFunctions.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchBusinessFunctions.rejected, (state, action) => {
        state.loading.businessFunctions = false;
        state.error.businessFunctions = action.payload;
      });

    // Departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading.departments = true;
        state.error.departments = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading.departments = false;
        state.departments = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.departments = Date.now();
        state.entityCounts.departments = state.departments.length;
        state.departments.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading.departments = false;
        state.error.departments = action.payload;
      });

    // Units
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading.units = true;
        state.error.units = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading.units = false;
        state.units = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.units = Date.now();
        state.entityCounts.units = state.units.length;
        state.units.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading.units = false;
        state.error.units = action.payload;
      });

    // Job functions
    builder
      .addCase(fetchJobFunctions.pending, (state) => {
        state.loading.jobFunctions = true;
        state.error.jobFunctions = null;
      })
      .addCase(fetchJobFunctions.fulfilled, (state, action) => {
        state.loading.jobFunctions = false;
        state.jobFunctions = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.jobFunctions = Date.now();
        state.entityCounts.jobFunctions = state.jobFunctions.length;
        state.jobFunctions.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchJobFunctions.rejected, (state, action) => {
        state.loading.jobFunctions = false;
        state.error.jobFunctions = action.payload;
      });

    // Job titles (NEW)
    builder
      .addCase(fetchJobTitles.pending, (state) => {
        state.loading.jobTitles = true;
        state.error.jobTitles = null;
      })
      .addCase(fetchJobTitles.fulfilled, (state, action) => {
        state.loading.jobTitles = false;
        state.jobTitles = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.jobTitles = Date.now();
        state.entityCounts.jobTitles = state.jobTitles.length;
        state.jobTitles.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchJobTitles.rejected, (state, action) => {
        state.loading.jobTitles = false;
        state.error.jobTitles = action.payload;
      });

    // Position groups
    builder
      .addCase(fetchPositionGroups.pending, (state) => {
        state.loading.positionGroups = true;
        state.error.positionGroups = null;
      })
      .addCase(fetchPositionGroups.fulfilled, (state, action) => {
        state.loading.positionGroups = false;
        state.positionGroups = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.positionGroups = Date.now();
        state.entityCounts.positionGroups = state.positionGroups.length;
        state.positionGroups.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchPositionGroups.rejected, (state, action) => {
        state.loading.positionGroups = false;
        state.error.positionGroups = action.payload;
      });

    // Employee statuses
    builder
      .addCase(fetchEmployeeStatuses.pending, (state) => {
        state.loading.employeeStatuses = true;
        state.error.employeeStatuses = null;
      })
      .addCase(fetchEmployeeStatuses.fulfilled, (state, action) => {
        state.loading.employeeStatuses = false;
        state.employeeStatuses = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.employeeStatuses = Date.now();
        state.entityCounts.employeeStatuses = state.employeeStatuses.length;
        state.employeeStatuses.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchEmployeeStatuses.rejected, (state, action) => {
        state.loading.employeeStatuses = false;
        state.error.employeeStatuses = action.payload;
      });

    // Employee tags
    builder
      .addCase(fetchEmployeeTags.pending, (state) => {
        state.loading.employeeTags = true;
        state.error.employeeTags = null;
      })
      .addCase(fetchEmployeeTags.fulfilled, (state, action) => {
        state.loading.employeeTags = false;
        state.employeeTags = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.employeeTags = Date.now();
        state.entityCounts.employeeTags = state.employeeTags.length;
        state.employeeTags.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchEmployeeTags.rejected, (state, action) => {
        state.loading.employeeTags = false;
        state.error.employeeTags = action.payload;
      });

    // Contract configs
    builder
      .addCase(fetchContractConfigs.pending, (state) => {
        state.loading.contractConfigs = true;
        state.error.contractConfigs = null;
      })
      .addCase(fetchContractConfigs.fulfilled, (state, action) => {
        state.loading.contractConfigs = false;
        state.contractConfigs = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.contractConfigs = Date.now();
        state.entityCounts.contractConfigs = state.contractConfigs.length;
        state.contractConfigs.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchContractConfigs.rejected, (state, action) => {
        state.loading.contractConfigs = false;
        state.error.contractConfigs = action.payload;
      });

    // Position group grading levels
    builder
      .addCase(fetchPositionGroupGradingLevels.pending, (state) => {
        state.loading.gradingLevels = true;
        state.error.gradingLevels = null;
      })
      .addCase(fetchPositionGroupGradingLevels.fulfilled, (state, action) => {
        state.loading.gradingLevels = false;
        const { positionGroupId, levels } = action.payload;
        state.gradingLevels[positionGroupId] = Array.isArray(levels) ? levels : [];
      })
      .addCase(fetchPositionGroupGradingLevels.rejected, (state, action) => {
        state.loading.gradingLevels = false;
        state.error.gradingLevels = action.payload;
      });

    // CRUD operations - CREATE
    const createCases = [
      createBusinessFunction,
      createDepartment,
      createUnit,
      createJobFunction,
      createJobTitle, // NEW
      createPositionGroup,
      createEmployeeStatus,
      createEmployeeTag,
      createContractConfig
    ];

    createCases.forEach(createAction => {
      builder
        .addCase(createAction.pending, (state) => {
          state.loading.creating = true;
          state.error.create = null;
        })
        .addCase(createAction.fulfilled, (state, action) => {
          state.loading.creating = false;
        })
        .addCase(createAction.rejected, (state, action) => {
          state.loading.creating = false;
          state.error.create = action.payload;
        });
    });

    // CRUD operations - UPDATE
    const updateCases = [
      updateBusinessFunction,
      updateDepartment,
      updateUnit,
      updateJobFunction,
      updateJobTitle, // NEW
      updatePositionGroup,
      updateEmployeeStatus,
      updateEmployeeTag,
      updateContractConfig
    ];

    updateCases.forEach(updateAction => {
      builder
        .addCase(updateAction.pending, (state) => {
          state.loading.updating = true;
          state.error.update = null;
        })
        .addCase(updateAction.fulfilled, (state, action) => {
          state.loading.updating = false;
        })
        .addCase(updateAction.rejected, (state, action) => {
          state.loading.updating = false;
          state.error.update = action.payload;
        });
    });

    // CRUD operations - DELETE
    const deleteCases = [
      deleteBusinessFunction,
      deleteDepartment,
      deleteUnit,
      deleteJobFunction,
      deleteJobTitle, // NEW
      deletePositionGroup,
      deleteEmployeeStatus,
      deleteEmployeeTag,
      deleteContractConfig
    ];

    deleteCases.forEach(deleteAction => {
      builder
        .addCase(deleteAction.pending, (state) => {
          state.loading.deleting = true;
          state.error.delete = null;
        })
        .addCase(deleteAction.fulfilled, (state, action) => {
          state.loading.deleting = false;
        })
        .addCase(deleteAction.rejected, (state, action) => {
          state.loading.deleting = false;
          state.error.delete = action.payload;
        });
    });
  },
});

// Actions export
export const {
  clearDepartments,
  clearUnits,
  clearHierarchicalData,
  setSelectedBusinessFunction,
  setSelectedDepartment,
  clearErrors,
  clearError,
  setError,
  invalidateCache,
  updateCacheTimestamp,
  resetReferenceData,
  resetEntityData,
  optimisticAddItem,
  optimisticUpdateItem,
  optimisticRemoveItem,
  removeOptimisticFlags,
  setShowInactive,
  setFilterText,
  setSorting,
  setSelectedEntityType,
  setManagementMode,
  bulkUpdateActiveStatus,
  bulkDeleteItems,
  updateEntityCounts,
  incrementEntityCount,
  decrementEntityCount,
} = referenceDataSlice.actions;

export default referenceDataSlice.reducer;

// Base selectors
const selectReferenceDataState = (state) => state.referenceData;

// Raw data selectors
export const selectBusinessFunctions = (state) => state.referenceData.businessFunctions;
export const selectDepartments = (state) => state.referenceData.departments;
export const selectUnits = (state) => state.referenceData.units;
export const selectJobFunctions = (state) => state.referenceData.jobFunctions;
export const selectJobTitles = (state) => state.referenceData.jobTitles; // NEW
export const selectPositionGroups = (state) => state.referenceData.positionGroups;
export const selectEmployeeStatuses = (state) => state.referenceData.employeeStatuses;
export const selectEmployeeTags = (state) => state.referenceData.employeeTags;
export const selectContractConfigs = (state) => state.referenceData.contractConfigs;
export const selectGradingLevels = (state) => state.referenceData.gradingLevels;

// Selection state selectors
export const selectSelectedBusinessFunction = (state) => state.referenceData.selectedBusinessFunction;
export const selectSelectedDepartment = (state) => state.referenceData.selectedDepartment;

// Loading and error selectors
export const selectReferenceDataLoading = (state) => state.referenceData.loading;
export const selectReferenceDataError = (state) => state.referenceData.error;

// UI state selectors
export const selectReferenceDataUI = (state) => state.referenceData.ui;
export const selectEntityCounts = (state) => state.referenceData.entityCounts;

// Memoized selectors
export const selectIsAnyReferenceDataLoading = createSelector(
  [selectReferenceDataLoading],
  (loading) => Object.values(loading).some(isLoading => isLoading)
);

export const selectHasAnyReferenceDataError = createSelector(
  [selectReferenceDataError],
  (errors) => Object.values(errors).some(error => error !== null)
);

// Formatted dropdown selectors
export const selectBusinessFunctionsForDropdown = createSelector(
  [selectBusinessFunctions, selectReferenceDataUI],
  (businessFunctions, ui) => {
    if (!Array.isArray(businessFunctions)) return [];
    
    let filtered = businessFunctions;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(bf => bf.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(bf => 
        (bf.name || '').toLowerCase().includes(searchTerm) ||
        (bf.code || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(bf => ({
      value: bf.id || bf.value,
      label: bf.name || bf.label,
      code: bf.code,
      employee_count: bf.employee_count || 0,
      is_active: bf.is_active !== false,
      _isOptimistic: bf._isOptimistic || false
    }));
  }
);

export const selectDepartmentsForDropdown = createSelector(
  [selectDepartments, selectReferenceDataUI],
  (departments, ui) => {
    if (!Array.isArray(departments)) return [];
    
    let filtered = departments;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(dept => dept.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(dept => 
        (dept.name || '').toLowerCase().includes(searchTerm) ||
        (dept.business_function_name || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(dept => ({
      value: dept.id || dept.value,
      label: dept.name || dept.label,
      business_function: dept.business_function,
      business_function_name: dept.business_function_name,
      business_function_code: dept.business_function_code,
      employee_count: dept.employee_count || 0,
      unit_count: dept.unit_count || 0,
      is_active: dept.is_active !== false,
      _isOptimistic: dept._isOptimistic || false
    }));
  }
);

export const selectUnitsForDropdown = createSelector(
  [selectUnits, selectReferenceDataUI],
  (units, ui) => {
    if (!Array.isArray(units)) return [];
    
    let filtered = units;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(unit => unit.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(unit => 
        (unit.name || '').toLowerCase().includes(searchTerm) ||
        (unit.department_name || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(unit => ({
      value: unit.id || unit.value,
      label: unit.name || unit.label,
      department: unit.department,
      department_name: unit.department_name,
      business_function_name: unit.business_function_name,
      employee_count: unit.employee_count || 0,
      is_active: unit.is_active !== false,
      _isOptimistic: unit._isOptimistic || false
    }));
  }
);

export const selectJobFunctionsForDropdown = createSelector(
  [selectJobFunctions, selectReferenceDataUI],
  (jobFunctions, ui) => {
    if (!Array.isArray(jobFunctions)) return [];
    
    let filtered = jobFunctions;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(jf => jf.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(jf => 
        (jf.name || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(jf => ({
      value: jf.id || jf.value,
      label: jf.name || jf.label,
      employee_count: jf.employee_count || 0,
      is_active: jf.is_active !== false,
      _isOptimistic: jf._isOptimistic || false
    }));
  }
);

// NEW: Job Titles selector
export const selectJobTitlesForDropdown = createSelector(
  [selectJobTitles, selectReferenceDataUI],
  (jobTitles, ui) => {
    if (!Array.isArray(jobTitles)) return [];
    
    let filtered = jobTitles;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(jt => jt.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(jt => 
        (jt.name || '').toLowerCase().includes(searchTerm) ||
        (jt.description || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(jt => ({
      value: jt.id || jt.value,
      label: jt.name || jt.label,
      description: jt.description,
      employee_count: jt.employee_count || 0,
      is_active: jt.is_active !== false,
      created_at: jt.created_at,
      updated_at: jt.updated_at,
      _isOptimistic: jt._isOptimistic || false
    }));
  }
);

export const selectPositionGroupsForDropdown = createSelector(
  [selectPositionGroups, selectReferenceDataUI],
  (positionGroups, ui) => {
    if (!Array.isArray(positionGroups)) return [];
    
    let filtered = positionGroups;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(pg => pg.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(pg => 
        (pg.name || '').toLowerCase().includes(searchTerm) ||
        (pg.display_name || pg.label || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      if (ui.sortBy === 'hierarchy_level') {
        return ui.sortDirection === 'desc' 
          ? (b.hierarchy_level || 0) - (a.hierarchy_level || 0)
          : (a.hierarchy_level || 0) - (b.hierarchy_level || 0);
      } else {
        const aVal = a[ui.sortBy] || '';
        const bVal = b[ui.sortBy] || '';
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return ui.sortDirection === 'desc' ? -comparison : comparison;
      }
    });
    
    return filtered.map(pg => ({
      value: pg.id || pg.value,
      label: pg.display_name || pg.label || pg.name,
      name: pg.name,
      hierarchy_level: pg.hierarchy_level || 0,
      grading_shorthand: pg.grading_shorthand,
      grading_levels: pg.grading_levels || [],
      employee_count: pg.employee_count || 0,
      is_active: pg.is_active !== false,
      _isOptimistic: pg._isOptimistic || false
    }));
  }
);

export const selectEmployeeStatusesForDropdown = createSelector(
  [selectEmployeeStatuses, selectReferenceDataUI],
  (statuses, ui) => {
    if (!Array.isArray(statuses)) return [];
    
    let filtered = statuses;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(status => status.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(status => 
        (status.name || '').toLowerCase().includes(searchTerm) ||
        (status.status_type || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      if (ui.sortBy === 'order' || !ui.sortBy) {
        return (a.order || 0) - (b.order || 0);
      } else {
        const aVal = a[ui.sortBy] || '';
        const bVal = b[ui.sortBy] || '';
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return ui.sortDirection === 'desc' ? -comparison : comparison;
      }
    });
    
    return filtered.map(status => ({
      value: status.id || status.value,
      label: status.name || status.label,
      status_type: status.status_type,
      color: status.color,
      affects_headcount: status.affects_headcount,
      allows_org_chart: status.allows_org_chart,
      auto_transition_enabled: status.auto_transition_enabled,
      auto_transition_days: status.auto_transition_days,
      auto_transition_to: status.auto_transition_to,
      is_transitional: status.is_transitional,
      transition_priority: status.transition_priority,
      send_notifications: status.send_notifications,
      notification_template: status.notification_template,
      is_system_status: status.is_system_status,
      is_default_for_new_employees: status.is_default_for_new_employees,
      employee_count: status.employee_count || 0,
      is_active: status.is_active !== false,
      order: status.order || 0,
      _isOptimistic: status._isOptimistic || false
    }));
  }
);

export const selectEmployeeTagsForDropdown = createSelector(
  [selectEmployeeTags, selectReferenceDataUI],
  (tags, ui) => {
    if (!Array.isArray(tags)) return [];
    
    let filtered = tags;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(tag => tag.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(tag => 
        (tag.name || '').toLowerCase().includes(searchTerm) ||
        (tag.tag_type || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(tag => ({
      value: tag.id || tag.value,
      label: tag.name || tag.label,
      tag_type: tag.tag_type,
      color: tag.color,
      employee_count: tag.employee_count || 0,
      is_active: tag.is_active !== false,
      _isOptimistic: tag._isOptimistic || false
    }));
  }
);

export const selectContractConfigsForDropdown = createSelector(
  [selectContractConfigs, selectReferenceDataUI],
  (configs, ui) => {
    if (!Array.isArray(configs)) return [];
    
    let filtered = configs;
    
    if (!ui.showInactive) {
      filtered = filtered.filter(config => config.is_active !== false);
    }
    
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(config => 
        (config.display_name || config.label || '').toLowerCase().includes(searchTerm) ||
        (config.contract_type || '').toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(config => ({
      value: config.contract_type || config.value,
      label: config.display_name || config.label,
      contract_type: config.contract_type,
  
      probation_days: config.probation_days || 0,
      total_days_until_active: config.total_days_until_active || 0,
      enable_auto_transitions: config.enable_auto_transitions,
      transition_to_inactive_on_end: config.transition_to_inactive_on_end,
      notify_days_before_end: config.notify_days_before_end || 0,
      employee_count: config.employee_count || 0,
      is_active: config.is_active !== false,
      _isOptimistic: config._isOptimistic || false
    }));
  }
);

// Combined data selectors
export const selectReferenceDataForEmployeeForm = createSelector(
  [
    selectBusinessFunctionsForDropdown,
    selectDepartmentsForDropdown,
    selectUnitsForDropdown,
    selectJobFunctionsForDropdown,
    selectJobTitlesForDropdown, // NEW
    selectPositionGroupsForDropdown,
    selectEmployeeStatusesForDropdown,
    selectEmployeeTagsForDropdown,
    selectContractConfigsForDropdown
  ],
   (businessFunctions, departments, units, jobFunctions, jobTitles, positionGroups, statuses, tags, contractConfigs) => ({
    businessFunctions,
    departments,
    units,
    jobFunctions,
    jobTitles, // NEW
    positionGroups,
    statuses,
    tags,
    contractConfigs
  })
);

// Filtered data selectors
export const selectDepartmentsByBusinessFunction = createSelector(
  [selectDepartments, (state, businessFunctionId) => businessFunctionId],
  (departments, businessFunctionId) => {
    if (!businessFunctionId) return [];
    const numericId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
    return departments.filter(dept => dept.business_function === numericId);
  }
);

export const selectUnitsByDepartment = createSelector(
  [selectUnits, (state, departmentId) => departmentId],
  (units, departmentId) => {
    if (!departmentId) return [];
    const numericId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
    return units.filter(unit => unit.department === numericId);
  }
);

export const selectTagsByType = createSelector(
  [selectEmployeeTags, (state, tagType) => tagType],
  (tags, tagType) => {
    if (!tagType) return tags;
    return tags.filter(tag => tag.tag_type === tagType);
  }
);

export const selectPositionGroupGradingLevels = createSelector(
  [selectGradingLevels, (state, positionGroupId) => positionGroupId],
  (gradingLevels, positionGroupId) => {
    return gradingLevels[positionGroupId] || [];
  }
);

// Cache management selectors
export const selectIsDataStale = createSelector(
  [selectReferenceDataState, (state, dataType) => dataType],
  (referenceData, dataType) => {
    const lastUpdated = referenceData.lastUpdated[dataType];
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > referenceData.cacheExpiry;
  }
);

// Validation selectors
export const selectIsValidBusinessFunction = createSelector(
  [selectBusinessFunctions, (state, id) => id],
  (businessFunctions, id) => {
    if (!id) return false;
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return businessFunctions.some(bf => 
      (bf.id || bf.value) === numericId && bf.is_active !== false
    );
  }
);

export const selectIsValidDepartment = createSelector(
  [selectDepartments, (state, id) => id, (state, id, businessFunctionId) => businessFunctionId],
  (departments, id, businessFunctionId) => {
    if (!id) return false;
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const department = departments.find(dept => (dept.id || dept.value) === numericId);
    
    if (!department || department.is_active === false) return false;
    
    if (businessFunctionId) {
      const numericBfId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
      return department.business_function === numericBfId;
    }
    
    return true;
  }
);

export const selectIsValidUnit = createSelector(
  [selectUnits, (state, id) => id, (state, id, departmentId) => departmentId],
  (units, id, departmentId) => {
    if (!id) return false;
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const unit = units.find(u => (u.id || u.value) === numericId);
    
    if (!unit || unit.is_active === false) return false;
    
    if (departmentId) {
      const numericDeptId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
      return unit.department === numericDeptId;
    }
    
    return true;
  }
);

  