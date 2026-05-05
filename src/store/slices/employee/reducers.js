import { initialState } from './initialState';

// All synchronous reducers for the employee slice
export const reducers = {
  // ── Selection ────────────────────────────────────────────────────
  setSelectedEmployees: (state, action) => {
    state.selectedEmployees = action.payload;
  },
  toggleEmployeeSelection: (state, action) => {
    const id = action.payload;
    const idx = state.selectedEmployees.indexOf(id);
    if (idx === -1) state.selectedEmployees.push(id);
    else state.selectedEmployees.splice(idx, 1);
  },
  selectAllEmployees: (state) => {
    state.selectedEmployees = state.employees.map(emp => emp.id);
  },
  selectAllVisible: (state) => {
    state.selectedEmployees = [
      ...new Set([...state.selectedEmployees, ...state.employees.map(emp => emp.id)]),
    ];
  },
  clearSelection: (state) => {
    state.selectedEmployees = [];
  },

  // ── Profile photo ────────────────────────────────────────────────
  clearProfilePhotoError: (state) => { state.error.profilePhoto = null; },
  clearProfilePhotoSuccess: (state) => { state.success.profilePhoto = false; },
  setProfilePhotoLoading: (state, action) => { state.loading.profilePhoto = action.payload; },

  // ── Filters ──────────────────────────────────────────────────────
  setCurrentFilters: (state, action) => { state.currentFilters = action.payload; },
  addFilter: (state, action) => {
    const { key, value, label } = action.payload;
    state.currentFilters[key] = value;
    const idx = state.appliedFilters.findIndex(f => f.key === key);
    if (idx !== -1) state.appliedFilters[idx] = { key, value, label };
    else state.appliedFilters.push({ key, value, label });
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
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete state.currentFilters[key];
      state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);
    } else {
      state.currentFilters[key] = value;
    }
    state.pagination.page = 1;
  },

  // ── Advanced filters ─────────────────────────────────────────────
  setAdvancedFilters: (state, action) => {
    state.advancedFilters = { ...state.advancedFilters, ...action.payload };
  },
  updateAdvancedFilter: (state, action) => {
    const { category, key, value } = action.payload;
    if (state.advancedFilters[category]) state.advancedFilters[category][key] = value;
  },
  clearAdvancedFilters: (state) => {
    state.advancedFilters = initialState.advancedFilters;
  },
  setFilterMode: (state, action) => { state.filterMode = action.payload; },

  // ── Sorting ──────────────────────────────────────────────────────
  setSorting: (state, action) => {
    const { field, direction, multiple } = action.payload;
    if (multiple) {
      state.sorting = multiple;
    } else if (state.sortingMode === 'single') {
      state.sorting = [{ field, direction }];
    } else {
      const idx = state.sorting.findIndex(s => s.field === field);
      if (idx !== -1) state.sorting[idx].direction = direction;
      else state.sorting.push({ field, direction });
    }
  },
  addSort: (state, action) => {
    const { field, direction } = action.payload;
    const idx = state.sorting.findIndex(s => s.field === field);
    if (idx !== -1) state.sorting[idx].direction = direction;
    else state.sorting.push({ field, direction });
  },
  removeSort: (state, action) => {
    state.sorting = state.sorting.filter(s => s.field !== action.payload);
  },
  clearSorting: (state) => { state.sorting = []; },
  toggleSort: (state, action) => {
    const field = action.payload;
    const existing = state.sorting.find(s => s.field === field);
    if (!existing) {
      if (state.sortingMode === 'single') state.sorting = [{ field, direction: 'asc' }];
      else state.sorting.push({ field, direction: 'asc' });
    } else if (existing.direction === 'asc') {
      existing.direction = 'desc';
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
      state.sorting = [state.sorting[0]];
    }
  },

  // ── Pagination ───────────────────────────────────────────────────
  setCurrentPage: (state, action) => { state.pagination.page = action.payload; },
  setPageSize: (state, action) => {
    state.pagination.pageSize = action.payload;
    state.pagination.page = 1;
  },
  goToNextPage: (state) => {
    if (state.pagination.hasNext) state.pagination.page += 1;
  },
  goToPreviousPage: (state) => {
    if (state.pagination.hasPrevious) state.pagination.page -= 1;
  },

  // ── UI ───────────────────────────────────────────────────────────
  toggleAdvancedFilters: (state) => { state.showAdvancedFilters = !state.showAdvancedFilters; },
  setShowAdvancedFilters: (state, action) => { state.showAdvancedFilters = action.payload; },
  setViewMode: (state, action) => { state.viewMode = action.payload; },
  setShowGradingPanel: (state, action) => { state.showGradingPanel = action.payload; },
  toggleGradingPanel: (state) => { state.showGradingPanel = !state.showGradingPanel; },
  setGradingMode: (state, action) => { state.gradingMode = action.payload; },

  // ── Error management ─────────────────────────────────────────────
  clearErrors: (state) => { Object.keys(state.error).forEach(k => { state.error[k] = null; }); },
  clearError: (state, action) => { state.error[action.payload] = null; },
  setError: (state, action) => { state.error[action.payload.key] = action.payload.message; },
  clearCurrentEmployee: (state) => { state.currentEmployee = null; },

  // ── Quick filter ─────────────────────────────────────────────────
  setQuickFilter: (state, action) => {
    const quickFilters = {
      active:          { status: ['ACTIVE'], is_active: true },
      onboarding:      { status: ['ONBOARDING'] },
      onLeave:         { status: ['ON_LEAVE'] },
      probation:       { status: ['PROBATION'] },
      noManager:       { line_manager: null },
      needsGrading:    { grading_level: [] },
      newHires:        { years_of_service_range: { min: 0, max: 0.25 } },
      orgChartVisible: { is_visible_in_org_chart: true },
      orgChartHidden:  { is_visible_in_org_chart: false },
    };
    if (quickFilters[action.payload.type]) {
      state.currentFilters = { ...state.currentFilters, ...quickFilters[action.payload.type] };
    }
  },

  // ── Search ───────────────────────────────────────────────────────
  setLastSearchParams: (state, action) => { state.lastSearchParams = action.payload; },
  clearSearchResults: (state) => {
    state.searchResults = [];
    state.searchPagination = {};
    state.lastSearchParams = null;
  },

  // ── Optimistic updates ───────────────────────────────────────────
  optimisticUpdateEmployee: (state, action) => {
    const { id, updates } = action.payload;
    const idx = state.employees.findIndex(emp => emp.id === id);
    if (idx !== -1) state.employees[idx] = { ...state.employees[idx], ...updates };
    if (state.currentEmployee?.id === id) state.currentEmployee = { ...state.currentEmployee, ...updates };
  },
  optimisticToggleOrgChartVisibility: (state, action) => {
    const { employeeId, setVisible } = action.payload;
    const emp = state.employees.find(e => e.id === employeeId);
    if (emp) {
      emp.is_visible_in_org_chart = setVisible !== undefined ? setVisible : !emp.is_visible_in_org_chart;
      emp._isOptimisticOrgChart = true;
    }
  },
  optimisticBulkToggleOrgChartVisibility: (state, action) => {
    const { employeeIds, setVisible } = action.payload;
    employeeIds.forEach(id => {
      const emp = state.employees.find(e => e.id === id);
      if (emp) { emp.is_visible_in_org_chart = setVisible; emp._isOptimisticOrgChart = true; }
    });
  },
};
