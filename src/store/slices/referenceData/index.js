import { createSlice, createSelector } from '@reduxjs/toolkit';
import {
  fetchBusinessFunctions, fetchDepartments, fetchUnits, fetchJobFunctions, fetchJobTitles,
  fetchPositionGroups, fetchEmployeeStatuses, fetchEmployeeTags, fetchContractConfigs,
  fetchPositionGroupGradingLevels,
  createBusinessFunction, updateBusinessFunction, deleteBusinessFunction,
  createDepartment, updateDepartment, deleteDepartment,
  createUnit, updateUnit, deleteUnit,
  createJobFunction, updateJobFunction, deleteJobFunction,
  createJobTitle, updateJobTitle, deleteJobTitle,
  createPositionGroup, updatePositionGroup, deletePositionGroup,
  createEmployeeStatus, updateEmployeeStatus, deleteEmployeeStatus,
  createEmployeeTag, updateEmployeeTag, deleteEmployeeTag,
  createContractConfig, updateContractConfig, deleteContractConfig,
} from './thunks';

// Re-export thunks
export * from './thunks';

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  businessFunctions: [],
  departments: [],
  units: [],
  jobFunctions: [],
  jobTitles: [],
  positionGroups: [],
  employeeStatuses: [],
  employeeTags: [],
  contractConfigs: [],
  gradingLevels: {},
  selectedBusinessFunction: null,
  selectedDepartment: null,
  loading: {
    businessFunctions: false,
    departments: false,
    units: false,
    jobFunctions: false,
    jobTitles: false,
    positionGroups: false,
    employeeStatuses: false,
    employeeTags: false,
    contractConfigs: false,
    gradingLevels: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    jobTitles: null,
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
    contractConfigs: null,
    gradingLevels: null,
    create: null,
    update: null,
    delete: null,
  },
  lastUpdated: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    jobTitles: null,
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
    contractConfigs: null,
  },
  cacheExpiry: 5 * 60 * 1000,
  entityCounts: {
    businessFunctions: 0,
    departments: 0,
    units: 0,
    jobFunctions: 0,
    jobTitles: 0,
    positionGroups: 0,
    employeeStatuses: 0,
    employeeTags: 0,
    contractConfigs: 0,
  },
  ui: {
    showInactive: false,
    filterText: '',
    sortBy: 'name',
    sortDirection: 'asc',
    selectedEntityType: 'businessFunctions',
    isManagementMode: false,
  },
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const referenceDataSlice = createSlice({
  name: 'referenceData',
  initialState,
  reducers: {
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
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => { state.error[key] = null; });
    },
    clearError: (state, action) => {
      if (state.error[action.payload] !== undefined) state.error[action.payload] = null;
    },
    setError: (state, action) => {
      const { key, message } = action.payload;
      state.error[key] = message;
    },
    invalidateCache: (state, action) => {
      const dataType = action.payload;
      if (dataType && state.lastUpdated[dataType]) {
        state.lastUpdated[dataType] = null;
      } else {
        Object.keys(state.lastUpdated).forEach(key => { state.lastUpdated[key] = null; });
      }
    },
    updateCacheTimestamp: (state, action) => {
      const { dataType, timestamp } = action.payload;
      state.lastUpdated[dataType] = timestamp || Date.now();
    },
    resetReferenceData: (state) => ({ ...initialState, ui: state.ui }),
    resetEntityData: (state, action) => {
      const entityType = action.payload;
      if (state[entityType]) {
        state[entityType] = [];
        state.lastUpdated[entityType] = null;
        state.entityCounts[entityType] = 0;
        state.error[entityType] = null;
      }
    },
    optimisticAddItem: (state, action) => {
      const { type, item } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        state[type].unshift({ ...item, id: `temp_${Date.now()}`, _isOptimistic: true, is_active: true });
        state.entityCounts[type] = (state.entityCounts[type] || 0) + 1;
      }
    },
    optimisticUpdateItem: (state, action) => {
      const { type, id, updates } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const index = state[type].findIndex(item => (item.id || item.value) === id);
        if (index !== -1) state[type][index] = { ...state[type][index], ...updates, _isOptimistic: true };
      }
    },
    optimisticRemoveItem: (state, action) => {
      const { type, id } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const initialLength = state[type].length;
        state[type] = state[type].filter(item => (item.id || item.value) !== id);
        if (state[type].length < initialLength) {
          state.entityCounts[type] = Math.max(0, (state.entityCounts[type] || 0) - 1);
        }
      }
    },
    removeOptimisticFlags: (state, action) => {
      const entityType = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        state[entityType].forEach(item => { if (item._isOptimistic) delete item._isOptimistic; });
      }
    },
    setShowInactive: (state, action) => { state.ui.showInactive = action.payload; },
    setFilterText: (state, action) => { state.ui.filterText = action.payload; },
    setSorting: (state, action) => {
      const { sortBy, sortDirection } = action.payload;
      state.ui.sortBy = sortBy;
      state.ui.sortDirection = sortDirection;
    },
    setSelectedEntityType: (state, action) => { state.ui.selectedEntityType = action.payload; },
    setManagementMode: (state, action) => { state.ui.isManagementMode = action.payload; },
    bulkUpdateActiveStatus: (state, action) => {
      const { entityType, ids, isActive } = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        state[entityType].forEach(item => {
          if (ids.includes(item.id || item.value)) { item.is_active = isActive; item._isOptimistic = true; }
        });
      }
    },
    bulkDeleteItems: (state, action) => {
      const { entityType, ids } = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        const initialLength = state[entityType].length;
        state[entityType] = state[entityType].filter(item => !ids.includes(item.id || item.value));
        const deletedCount = initialLength - state[entityType].length;
        state.entityCounts[entityType] = Math.max(0, (state.entityCounts[entityType] || 0) - deletedCount);
      }
    },
    updateEntityCounts: (state, action) => { state.entityCounts = { ...state.entityCounts, ...action.payload }; },
    incrementEntityCount: (state, action) => {
      state.entityCounts[action.payload] = (state.entityCounts[action.payload] || 0) + 1;
    },
    decrementEntityCount: (state, action) => {
      state.entityCounts[action.payload] = Math.max(0, (state.entityCounts[action.payload] || 0) - 1);
    },
  },

  extraReducers: (builder) => {
    // ── Fetch handlers ──────────────────────────────────────────────────────
    const fetchMap = [
      [fetchBusinessFunctions, 'businessFunctions'],
      [fetchDepartments,       'departments'],
      [fetchUnits,             'units'],
      [fetchJobFunctions,      'jobFunctions'],
      [fetchJobTitles,         'jobTitles'],
      [fetchPositionGroups,    'positionGroups'],
      [fetchEmployeeStatuses,  'employeeStatuses'],
      [fetchEmployeeTags,      'employeeTags'],
      [fetchContractConfigs,   'contractConfigs'],
    ];

    fetchMap.forEach(([thunk, key]) => {
      builder
        .addCase(thunk.pending, (state) => { state.loading[key] = true; state.error[key] = null; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading[key] = false;
          state[key] = Array.isArray(action.payload) ? action.payload : [];
          state.lastUpdated[key] = Date.now();
          state.entityCounts[key] = state[key].length;
          state[key].forEach(item => { if (item._isOptimistic) delete item._isOptimistic; });
        })
        .addCase(thunk.rejected, (state, action) => { state.loading[key] = false; state.error[key] = action.payload; });
    });

    // Position group grading levels
    builder
      .addCase(fetchPositionGroupGradingLevels.pending, (state) => { state.loading.gradingLevels = true; state.error.gradingLevels = null; })
      .addCase(fetchPositionGroupGradingLevels.fulfilled, (state, action) => {
        state.loading.gradingLevels = false;
        const { positionGroupId, levels } = action.payload;
        state.gradingLevels[positionGroupId] = Array.isArray(levels) ? levels : [];
      })
      .addCase(fetchPositionGroupGradingLevels.rejected, (state, action) => { state.loading.gradingLevels = false; state.error.gradingLevels = action.payload; });

    // ── CRUD handlers ───────────────────────────────────────────────────────
    const createCases = [createBusinessFunction, createDepartment, createUnit, createJobFunction, createJobTitle, createPositionGroup, createEmployeeStatus, createEmployeeTag, createContractConfig];
    const updateCases = [updateBusinessFunction, updateDepartment, updateUnit, updateJobFunction, updateJobTitle, updatePositionGroup, updateEmployeeStatus, updateEmployeeTag, updateContractConfig];
    const deleteCases = [deleteBusinessFunction, deleteDepartment, deleteUnit, deleteJobFunction, deleteJobTitle, deletePositionGroup, deleteEmployeeStatus, deleteEmployeeTag, deleteContractConfig];

    createCases.forEach(thunk => {
      builder
        .addCase(thunk.pending,   (state) => { state.loading.creating = true; state.error.create = null; })
        .addCase(thunk.fulfilled, (state) => { state.loading.creating = false; })
        .addCase(thunk.rejected,  (state, action) => { state.loading.creating = false; state.error.create = action.payload; });
    });

    updateCases.forEach(thunk => {
      builder
        .addCase(thunk.pending,   (state) => { state.loading.updating = true; state.error.update = null; })
        .addCase(thunk.fulfilled, (state) => { state.loading.updating = false; })
        .addCase(thunk.rejected,  (state, action) => { state.loading.updating = false; state.error.update = action.payload; });
    });

    deleteCases.forEach(thunk => {
      builder
        .addCase(thunk.pending,   (state) => { state.loading.deleting = true; state.error.delete = null; })
        .addCase(thunk.fulfilled, (state) => { state.loading.deleting = false; })
        .addCase(thunk.rejected,  (state, action) => { state.loading.deleting = false; state.error.delete = action.payload; });
    });
  },
});

// ── Actions export ────────────────────────────────────────────────────────────
export const {
  clearDepartments, clearUnits, clearHierarchicalData,
  setSelectedBusinessFunction, setSelectedDepartment,
  clearErrors, clearError, setError,
  invalidateCache, updateCacheTimestamp,
  resetReferenceData, resetEntityData,
  optimisticAddItem, optimisticUpdateItem, optimisticRemoveItem, removeOptimisticFlags,
  setShowInactive, setFilterText, setSorting, setSelectedEntityType, setManagementMode,
  bulkUpdateActiveStatus, bulkDeleteItems,
  updateEntityCounts, incrementEntityCount, decrementEntityCount,
} = referenceDataSlice.actions;

export default referenceDataSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
const selectReferenceDataState = (state) => state.referenceData;

export const selectBusinessFunctions        = (state) => state.referenceData.businessFunctions;
export const selectDepartments              = (state) => state.referenceData.departments;
export const selectUnits                    = (state) => state.referenceData.units;
export const selectJobFunctions             = (state) => state.referenceData.jobFunctions;
export const selectJobTitles                = (state) => state.referenceData.jobTitles;
export const selectPositionGroups           = (state) => state.referenceData.positionGroups;
export const selectEmployeeStatuses         = (state) => state.referenceData.employeeStatuses;
export const selectEmployeeTags             = (state) => state.referenceData.employeeTags;
export const selectContractConfigs          = (state) => state.referenceData.contractConfigs;
export const selectGradingLevels            = (state) => state.referenceData.gradingLevels;
export const selectSelectedBusinessFunction = (state) => state.referenceData.selectedBusinessFunction;
export const selectSelectedDepartment       = (state) => state.referenceData.selectedDepartment;
export const selectReferenceDataLoading     = (state) => state.referenceData.loading;
export const selectReferenceDataError       = (state) => state.referenceData.error;
export const selectReferenceDataUI          = (state) => state.referenceData.ui;
export const selectEntityCounts             = (state) => state.referenceData.entityCounts;

export const selectIsAnyReferenceDataLoading = createSelector(
  [selectReferenceDataLoading],
  (loading) => Object.values(loading).some(Boolean)
);

export const selectHasAnyReferenceDataError = createSelector(
  [selectReferenceDataError],
  (errors) => Object.values(errors).some(e => e !== null)
);

const makeDropdownSelector = (selectData, extraMap = null) =>
  createSelector([selectData, selectReferenceDataUI], (data, ui) => {
    if (!Array.isArray(data)) return [];
    let filtered = ui.showInactive ? data : data.filter(item => item.is_active !== false);
    if (ui.filterText) {
      const term = ui.filterText.toLowerCase();
      filtered = filtered.filter(item =>
        (item.name || item.label || '').toLowerCase().includes(term) ||
        (item.code || '').toLowerCase().includes(term)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const cmp = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -cmp : cmp;
    });
    return filtered.map(item => ({
      value: item.id || item.value,
      label: item.name || item.label,
      is_active: item.is_active !== false,
      employee_count: item.employee_count || 0,
      _isOptimistic: item._isOptimistic || false,
      ...(extraMap ? extraMap(item) : {}),
    }));
  });

export const selectBusinessFunctionsForDropdown = makeDropdownSelector(selectBusinessFunctions, item => ({ code: item.code }));
export const selectDepartmentsForDropdown = makeDropdownSelector(selectDepartments, item => ({
  business_function: item.business_function,
  business_function_name: item.business_function_name,
  business_function_code: item.business_function_code,
  unit_count: item.unit_count || 0,
}));
export const selectUnitsForDropdown = makeDropdownSelector(selectUnits, item => ({
  department: item.department,
  department_name: item.department_name,
  business_function_name: item.business_function_name,
}));
export const selectJobFunctionsForDropdown = makeDropdownSelector(selectJobFunctions);
export const selectJobTitlesForDropdown = makeDropdownSelector(selectJobTitles, item => ({
  description: item.description,
  created_at: item.created_at,
  updated_at: item.updated_at,
}));

export const selectPositionGroupsForDropdown = createSelector(
  [selectPositionGroups, selectReferenceDataUI],
  (positionGroups, ui) => {
    if (!Array.isArray(positionGroups)) return [];
    let filtered = ui.showInactive ? positionGroups : positionGroups.filter(pg => pg.is_active !== false);
    if (ui.filterText) {
      const term = ui.filterText.toLowerCase();
      filtered = filtered.filter(pg =>
        (pg.name || '').toLowerCase().includes(term) ||
        (pg.display_name || pg.label || '').toLowerCase().includes(term)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      if (ui.sortBy === 'hierarchy_level') {
        const diff = (a.hierarchy_level || 0) - (b.hierarchy_level || 0);
        return ui.sortDirection === 'desc' ? -diff : diff;
      }
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const cmp = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -cmp : cmp;
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
      _isOptimistic: pg._isOptimistic || false,
    }));
  }
);

export const selectEmployeeStatusesForDropdown = createSelector(
  [selectEmployeeStatuses, selectReferenceDataUI],
  (statuses, ui) => {
    if (!Array.isArray(statuses)) return [];
    let filtered = ui.showInactive ? statuses : statuses.filter(s => s.is_active !== false);
    if (ui.filterText) {
      const term = ui.filterText.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name || '').toLowerCase().includes(term) ||
        (s.status_type || '').toLowerCase().includes(term)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      if (!ui.sortBy || ui.sortBy === 'order') return (a.order || 0) - (b.order || 0);
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const cmp = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -cmp : cmp;
    });
    return filtered.map(s => ({
      value: s.id || s.value,
      label: s.name || s.label,
      status_type: s.status_type,
      color: s.color,
      affects_headcount: s.affects_headcount,
      allows_org_chart: s.allows_org_chart,
      auto_transition_enabled: s.auto_transition_enabled,
      auto_transition_days: s.auto_transition_days,
      auto_transition_to: s.auto_transition_to,
      is_transitional: s.is_transitional,
      transition_priority: s.transition_priority,
      send_notifications: s.send_notifications,
      notification_template: s.notification_template,
      is_system_status: s.is_system_status,
      is_default_for_new_employees: s.is_default_for_new_employees,
      employee_count: s.employee_count || 0,
      is_active: s.is_active !== false,
      order: s.order || 0,
      _isOptimistic: s._isOptimistic || false,
    }));
  }
);

export const selectEmployeeTagsForDropdown = makeDropdownSelector(selectEmployeeTags, item => ({
  tag_type: item.tag_type,
  color: item.color,
}));

export const selectContractConfigsForDropdown = createSelector(
  [selectContractConfigs, selectReferenceDataUI],
  (configs, ui) => {
    if (!Array.isArray(configs)) return [];
    let filtered = ui.showInactive ? configs : configs.filter(c => c.is_active !== false);
    if (ui.filterText) {
      const term = ui.filterText.toLowerCase();
      filtered = filtered.filter(c =>
        (c.display_name || c.label || '').toLowerCase().includes(term) ||
        (c.contract_type || '').toLowerCase().includes(term)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const cmp = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -cmp : cmp;
    });
    return filtered.map(c => ({
      value: c.contract_type || c.value,
      label: c.display_name || c.label,
      contract_type: c.contract_type,
      probation_days: c.probation_days || 0,
      total_days_until_active: c.total_days_until_active || 0,
      enable_auto_transitions: c.enable_auto_transitions,
      transition_to_inactive_on_end: c.transition_to_inactive_on_end,
      notify_days_before_end: c.notify_days_before_end || 0,
      employee_count: c.employee_count || 0,
      is_active: c.is_active !== false,
      _isOptimistic: c._isOptimistic || false,
    }));
  }
);

export const selectReferenceDataForEmployeeForm = createSelector(
  [
    selectBusinessFunctionsForDropdown, selectDepartmentsForDropdown, selectUnitsForDropdown,
    selectJobFunctionsForDropdown, selectJobTitlesForDropdown, selectPositionGroupsForDropdown,
    selectEmployeeStatusesForDropdown, selectEmployeeTagsForDropdown, selectContractConfigsForDropdown,
  ],
  (businessFunctions, departments, units, jobFunctions, jobTitles, positionGroups, statuses, tags, contractConfigs) => ({
    businessFunctions, departments, units, jobFunctions, jobTitles, positionGroups, statuses, tags, contractConfigs,
  })
);

export const selectPositionGroupGradingLevels = createSelector(
  [selectGradingLevels, (_, positionGroupId) => positionGroupId],
  (gradingLevels, positionGroupId) => gradingLevels[positionGroupId] || []
);

export const selectIsDataStale = createSelector(
  [selectReferenceDataState, (_, dataType) => dataType],
  (referenceData, dataType) => {
    const lastUpdated = referenceData.lastUpdated[dataType];
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > referenceData.cacheExpiry;
  }
);
