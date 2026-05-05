export const initialState = {
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
    status_update_analysis: {
      employees_needing_updates: 0,
      status_transitions: {},
    },
  },
  orgChart: [],
  activities: {},
  directReports: {},

  // Grading data
  gradingData: { count: 0, employees: [] },
  allGradingLevels: [
    { code: '_LD', display: '-LD', full_name: 'Lower Decile' },
    { code: '_LQ', display: '-LQ', full_name: 'Lower Quartile' },
    { code: '_M',  display: '-M',  full_name: 'Median' },
    { code: '_UQ', display: '-UQ', full_name: 'Upper Quartile' },
    { code: '_UD', display: '-UD', full_name: 'Upper Decile' },
  ],
  gradingStatistics: {
    totalEmployees: 0,
    gradedEmployees: 0,
    ungradedEmployees: 0,
    byPositionGroup: {},
    byGradingLevel: {},
    recentlyUpdated: [],
  },

  // UI state
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
    hasPrevious: false,
  },

  // Advanced filtering state
  advancedFilters: {
    searchFilters: {
      generalSearch: '',
      employeeSearch: '',
      managerSearch: '',
      jobTitleSearch: '',
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
      genders: [],
    },
    dateRangeFilters: {
      startDateRange: { from: null, to: null },
      contractEndDateRange: { from: null, to: null },
    },
    numericRangeFilters: {
      serviceYearsRange: { min: null, max: null },
    },
    booleanFilters: {
      isActive: null,
      isOrgChartVisible: null,
      includeDeleted: false,
    },
  },

  // Search state
  lastSearchParams: null,
  searchResults: [],
  searchPagination: {},

  // Loading states
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
    profilePhoto: false,
    exporting: false,
    statusUpdate: false,
    tagUpdate: false,
    lineManagerUpdate: false,
    template: false,
    upload: false,
    orgChart: false,
    advancedSearch: false,
  },

  // Error states
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
    export: null,
    statusUpdate: null,
    tagUpdate: null,
    lineManagerUpdate: null,
    template: null,
    upload: null,
    orgChart: null,
    advancedSearch: null,
  },

  success: {
    profilePhoto: false,
  },

  // Feature flags & settings
  showAdvancedFilters: false,
  viewMode: 'table',
  showGradingPanel: false,
  gradingMode: 'individual',
  filterMode: 'basic',
  sortingMode: 'single',
};
