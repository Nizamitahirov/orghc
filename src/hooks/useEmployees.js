// src/hooks/useEmployees.js 
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  fetchStatistics,
  addEmployeeTag,
  removeEmployeeTag,
  bulkAddTags,
  bulkRemoveTags,
  assignLineManager,
  bulkAssignLineManager,
  fetchEmployeeGrading,
  exportEmployees,
  downloadEmployeeTemplate,
  bulkUploadEmployees,
  fetchEmployeeActivities,
  fetchEmployeeDirectReports,
  toggleOrgChartVisibility,
  bulkToggleOrgChartVisibility,
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
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  toggleSort,
  reorderSorts,
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
  optimisticUpdateEmployee,
  selectEmployees,
  selectCurrentEmployee,
  selectEmployeeLoading,
  selectEmployeeError,
  selectSelectedEmployees,
  selectCurrentFilters,
  selectAppliedFilters,
  selectStatistics,
  selectPagination,
  selectSorting,
  selectGradingData,
  selectGradingStatistics,
  selectAllGradingLevels,
  selectActivities,
  selectDirectReports,
  selectViewMode,
  selectShowAdvancedFilters,
  selectShowGradingPanel,
  selectGradingMode,
  selectFormattedEmployees,
  selectSortingForBackend,
  selectFilteredEmployeesCount,
  selectGetSortDirection,
  selectIsSorted,
  selectGetSortIndex,
  selectApiParams,
  selectSelectionInfo,
  selectEmployeesByGradeLevel,
  selectEmployeesByPositionGroup,
  selectGradingDistribution,
  selectEmployeesByStatus,
  selectEmployeesByDepartment,
  selectNewHires,
  selectIsAnyLoading,
  selectHasAnyError,
  selectDashboardSummary,
  selectEmployeeMetrics,
  uploadEmployeeProfilePhoto,
  deleteEmployeeProfilePhoto,
  clearProfilePhotoError,
  clearProfilePhotoSuccess,
  setProfilePhotoLoading,
  selectProfilePhotoLoading,
  selectProfilePhotoError,
  selectProfilePhotoSuccess,
} from '../store/slices/employeeSlice';

import {
  fetchBusinessFunctions,
  fetchJobFunctions,
  fetchPositionGroups,
  fetchEmployeeStatuses,
  fetchEmployeeTags
} from '../store/slices/referenceDataSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  
  // Refs to prevent infinite loops
  const isInitialized = useRef(false);
  const lastFetchParams = useRef(null);
  
  // Main data selectors
  const employees = useSelector(selectEmployees);
  const formattedEmployees = useSelector(selectFormattedEmployees);
  const currentEmployee = useSelector(selectCurrentEmployee);
  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);
  const selectedEmployees = useSelector(selectSelectedEmployees);
  const currentFilters = useSelector(selectCurrentFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const statistics = useSelector(selectStatistics);
  const pagination = useSelector(selectPagination);
  const sorting = useSelector(selectSorting);
  const activities = useSelector(selectActivities);
  const directReports = useSelector(selectDirectReports);
  const viewMode = useSelector(selectViewMode);
  const showAdvancedFilters = useSelector(selectShowAdvancedFilters);
  
  // Grading data selectors
  const gradingData = useSelector(selectGradingData);
  const gradingStatistics = useSelector(selectGradingStatistics);
  const allGradingLevels = useSelector(selectAllGradingLevels);
  const showGradingPanel = useSelector(selectShowGradingPanel);
  const gradingMode = useSelector(selectGradingMode);
  const employeesByGradeLevel = useSelector(selectEmployeesByGradeLevel);
  const employeesByPositionGroup = useSelector(selectEmployeesByPositionGroup);
  const gradingDistribution = useSelector(selectGradingDistribution);
  const employeesByStatus = useSelector(selectEmployeesByStatus);
  const employeesByDepartment = useSelector(selectEmployeesByDepartment);
  const newHires = useSelector(selectNewHires);
  const dashboardSummary = useSelector(selectDashboardSummary);
  const employeeMetrics = useSelector(selectEmployeeMetrics);
  
  // Computed selectors
  const filteredEmployeesCount = useSelector(selectFilteredEmployeesCount);
  const sortingForBackend = useSelector(selectSortingForBackend);
  const apiParams = useSelector(selectApiParams);
  const selectionInfo = useSelector(selectSelectionInfo);
  const isAnyLoading = useSelector(selectIsAnyLoading);
  const hasAnyError = useSelector(selectHasAnyError);
  const profilePhotoLoading = useSelector(selectProfilePhotoLoading);
  const profilePhotoError = useSelector(selectProfilePhotoError);
  const profilePhotoSuccess = useSelector(selectProfilePhotoSuccess);

  // Helper functions
  const getSortDirection = useSelector(selectGetSortDirection);
  const isSorted = useSelector(selectIsSorted);
  const getSortIndex = useSelector(selectGetSortIndex);

  // Individual action callbacks - hər biri ayrı-ayrı tanımlanır
  const fetchEmployeesAction = useCallback((params) => dispatch(fetchEmployees(params)), [dispatch]);
  const fetchEmployeeAction = useCallback((id) => dispatch(fetchEmployee(id)), [dispatch]);
  const createEmployeeAction = useCallback((data) => dispatch(createEmployee(data)), [dispatch]);
  const updateEmployeeAction = useCallback((id, data) => dispatch(updateEmployee({ id, data })), [dispatch]);
  const fetchStatisticsAction = useCallback(() => dispatch(fetchStatistics()), [dispatch]);
  
  
  // Org chart visibility - YENİ FUNKSİYALAR
  const toggleOrgChartVisibilityAction = useCallback((employeeId) => 
    dispatch(toggleOrgChartVisibility(employeeId)), [dispatch]);
  const bulkToggleOrgChartVisibilityAction = useCallback((employeeIds, setVisible) => 
    dispatch(bulkToggleOrgChartVisibility({ employeeIds, setVisible })), [dispatch]);
  
  const showInOrgChartAction = useCallback((employeeIds) => {
    const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
    return dispatch(bulkToggleOrgChartVisibility({ employeeIds: ids, setVisible: true }));
  }, [dispatch]);
  
  const hideFromOrgChartAction = useCallback((employeeIds) => {
    const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
    return dispatch(bulkToggleOrgChartVisibility({ employeeIds: ids, setVisible: false }));
  }, [dispatch]);
  
  // Tag management
  const addEmployeeTagAction = useCallback((employee_id, tag_id) => 
    dispatch(addEmployeeTag({ employee_id, tag_id })), [dispatch]);
  const removeEmployeeTagAction = useCallback((employee_id, tag_id) => 
    dispatch(removeEmployeeTag({ employee_id, tag_id })), [dispatch]);
  const bulkAddTagsAction = useCallback((employee_ids, tag_id) => 
    dispatch(bulkAddTags({ employee_ids, tag_id })), [dispatch]);
  const bulkRemoveTagsAction = useCallback((employee_ids, tag_id) => 
    dispatch(bulkRemoveTags({ employee_ids, tag_id })), [dispatch]);
  const assignLineManagerAction = useCallback((employee_id, line_manager_id) => 
    dispatch(assignLineManager({ employee_id, line_manager_id })), [dispatch]);
  const bulkAssignLineManagerAction = useCallback((employee_ids, line_manager_id) => 
    dispatch(bulkAssignLineManager({ employee_ids, line_manager_id })), [dispatch]);

  const fetchEmployeeGradingAction = useCallback(() => dispatch(fetchEmployeeGrading()), [dispatch]);
  const exportEmployeesAction = useCallback((format, params) => dispatch(exportEmployees({ format, params })), [dispatch]);
  const downloadEmployeeTemplateAction = useCallback(() => dispatch(downloadEmployeeTemplate()), [dispatch]);
  const bulkUploadEmployeesAction = useCallback((file) => dispatch(bulkUploadEmployees(file)), [dispatch]);
  const fetchEmployeeActivitiesAction = useCallback((employeeId) => dispatch(fetchEmployeeActivities(employeeId)), [dispatch]);
  const fetchEmployeeDirectReportsAction = useCallback((employeeId) => dispatch(fetchEmployeeDirectReports(employeeId)), [dispatch]);
  const setSelectedEmployeesAction = useCallback((employees) => dispatch(setSelectedEmployees(employees)), [dispatch]);
  const toggleEmployeeSelectionAction = useCallback((employeeId) => dispatch(toggleEmployeeSelection(employeeId)), [dispatch]);
  const selectAllEmployeesAction = useCallback(() => dispatch(selectAllEmployees()), [dispatch]);
  const selectAllVisibleAction = useCallback(() => dispatch(selectAllVisible()), [dispatch]);
  const clearSelectionAction = useCallback(() => dispatch(clearSelection()), [dispatch]);
  
  // Filter management
  const setCurrentFiltersAction = useCallback((filters) => dispatch(setCurrentFilters(filters)), [dispatch]);
  const addFilterAction = useCallback((filter) => dispatch(addFilter(filter)), [dispatch]);
  const removeFilterAction = useCallback((key) => dispatch(removeFilter(key)), [dispatch]);
  const clearFiltersAction = useCallback(() => dispatch(clearFilters()), [dispatch]);
  const updateFilterAction = useCallback((key, value) => dispatch(updateFilter({ key, value })), [dispatch]);
  
  // Sorting management
  const setSortingAction = useCallback((params) => dispatch(setSorting(params)), [dispatch]);
  const addSortAction = useCallback((field, direction) => dispatch(addSort({ field, direction })), [dispatch]);
  const removeSortAction = useCallback((field) => dispatch(removeSort(field)), [dispatch]);
  const clearSortingAction = useCallback(() => dispatch(clearSorting()), [dispatch]);
  const toggleSortAction = useCallback((field) => dispatch(toggleSort(field)), [dispatch]);
  const reorderSortsAction = useCallback((oldIndex, newIndex) => dispatch(reorderSorts({ oldIndex, newIndex })), [dispatch]);
  
  // Pagination
  const setPageSizeAction = useCallback((size) => dispatch(setPageSize(size)), [dispatch]);
  const setCurrentPageAction = useCallback((page) => dispatch(setCurrentPage(page)), [dispatch]);
  const goToNextPageAction = useCallback(() => dispatch(goToNextPage()), [dispatch]);
  const goToPreviousPageAction = useCallback(() => dispatch(goToPreviousPage()), [dispatch]);
  
  // UI state
  const toggleAdvancedFiltersAction = useCallback(() => dispatch(toggleAdvancedFilters()), [dispatch]);
  const setShowAdvancedFiltersAction = useCallback((show) => dispatch(setShowAdvancedFilters(show)), [dispatch]);
  const setViewModeAction = useCallback((mode) => dispatch(setViewMode(mode)), [dispatch]);
  const setShowGradingPanelAction = useCallback((show) => dispatch(setShowGradingPanel(show)), [dispatch]);
  const toggleGradingPanelAction = useCallback(() => dispatch(toggleGradingPanel()), [dispatch]);
  const setGradingModeAction = useCallback((mode) => dispatch(setGradingMode(mode)), [dispatch]);
  
  // Error management
  const clearErrorsAction = useCallback(() => dispatch(clearErrors()), [dispatch]);
  const clearErrorAction = useCallback((key) => dispatch(clearError(key)), [dispatch]);
  const setErrorAction = useCallback((key, message) => dispatch(setError({ key, message })), [dispatch]);
  const clearCurrentEmployeeAction = useCallback(() => dispatch(clearCurrentEmployee()), [dispatch]);
  


  const uploadProfilePhotoAction = useCallback((employeeId, file) => 
    dispatch(uploadEmployeeProfilePhoto({ employeeId, file })), [dispatch]);
  
  const deleteProfilePhotoAction = useCallback((employeeId) => 
    dispatch(deleteEmployeeProfilePhoto(employeeId)), [dispatch]);
  
  const clearProfilePhotoErrorAction = useCallback(() => 
    dispatch(clearProfilePhotoError()), [dispatch]);
  
  const clearProfilePhotoSuccessAction = useCallback(() => 
    dispatch(clearProfilePhotoSuccess()), [dispatch]);
  
  const setProfilePhotoLoadingAction = useCallback((loading) => 
    dispatch(setProfilePhotoLoading(loading)), [dispatch]);

  const setQuickFilterAction = useCallback((type, value) => dispatch(setQuickFilter({ type, value })), [dispatch]);
  const optimisticUpdateEmployeeAction = useCallback((id, updates) => dispatch(optimisticUpdateEmployee({ id, updates })), [dispatch]);

  const fetchFilterOptionsAction = useCallback(() => {
    if (isInitialized.current) {
  
      return Promise.resolve();
    }
    
    isInitialized.current = true;
    
    return Promise.all([
      dispatch(fetchBusinessFunctions()),
      dispatch(fetchJobFunctions()),
      dispatch(fetchPositionGroups()),
      dispatch(fetchEmployeeStatuses()),
      dispatch(fetchEmployeeTags())
    ]).catch(error => {
      isInitialized.current = false;
      throw error;
    });
  }, [dispatch]);


  const searchEmployeesAdvancedAction = useCallback((searchParams) => {
    const enhancedParams = {
      ...apiParams,
      ...searchParams,
    
      search: searchParams.generalSearch || searchParams.search,
      employee_search: searchParams.employeeSearch,
      line_manager_search: searchParams.managerSearch,
      job_title_search: searchParams.jobTitleSearch
    };
    
    return dispatch(fetchEmployees(enhancedParams));
  }, [dispatch, apiParams]);

  const setDateRangeFilterAction = useCallback((filterType, dateRange) => {
    const filterKey = `${filterType}_range`;
    dispatch(updateFilter({ key: filterKey, value: dateRange }));
  }, [dispatch]);
  
  const setNumericRangeFilterAction = useCallback((filterType, numericRange) => {
    const filterKey = `${filterType}_range`;
    dispatch(updateFilter({ key: filterKey, value: numericRange }));
  }, [dispatch]);
  
  const setMultiSelectFilterAction = useCallback((filterKey, selectedValues) => {
    dispatch(updateFilter({ key: filterKey, value: selectedValues }));
  }, [dispatch]);
  
  const setBooleanFilterAction = useCallback((filterKey, booleanValue) => {
    dispatch(updateFilter({ key: filterKey, value: booleanValue }));
  }, [dispatch]);

  const applyFilterPresetAction = useCallback((presetName, additionalFilters = {}) => {
    const presets = {
      'active': { status: ['ACTIVE'], is_active: true },
      'onboarding': { status: ['ONBOARDING'] },
      'onLeave': { status: ['ON_LEAVE'] },
      'probation': { status: ['PROBATION'] },
      'noManager': { line_manager: null },
      'needsGrading': { grading_level: [] },
      'newHires': { years_of_service_range: { min: 0, max: 0.25 } },
      'managers': { direct_reports_count_min: 1 },
      'orgChartVisible': { is_visible_in_org_chart: true },
      'orgChartHidden': { is_visible_in_org_chart: false },
     
    };
    
    const presetFilters = presets[presetName];
    if (presetFilters) {
      const combinedFilters = { ...presetFilters, ...additionalFilters };
      dispatch(setCurrentFilters(combinedFilters));
    }
  }, [dispatch]);

  const clearFilterTypeAction = useCallback((filterType) => {
    const filterTypeMappings = {
      'search': ['search', 'employee_search', 'line_manager_search', 'job_title_search'],
      'status': ['status', 'is_active'],
      'organizational': ['business_function', 'department', 'unit', 'job_function', 'position_group'],
      'personal': ['gender', 'tags'],
      'contract': ['contract_duration', 'contract_expiring_days'],
      'performance': ['grading_level', 'line_manager'],
      'dates': ['start_date_range', 'contract_end_date_range'],
      'numeric': ['years_of_service_range'],
      'visibility': ['is_visible_in_org_chart', 'is_deleted']
    };
    
    const filtersToRemove = filterTypeMappings[filterType] || [filterType];
    filtersToRemove.forEach(key => {
      dispatch(removeFilter(key));
    });
  }, [dispatch]);

  const setMultipleSortingAction = useCallback((sortingArray) => {
    const formattedSorting = sortingArray.map(sort => ({
      field: sort.field,
      direction: sort.direction || 'asc'
    }));
    
    dispatch(setSorting({ multiple: formattedSorting }));
  }, [dispatch]);
  
  const addSortToMultipleAction = useCallback((field, direction = 'asc') => {
    dispatch(addSort({ field, direction }));
  }, [dispatch]);

  const applySortPresetAction = useCallback((presetName) => {
    const sortPresets = {
      'alphabetical': [{ field: 'full_name', direction: 'asc' }],
      'newest': [{ field: 'created_at', direction: 'desc' }],
      'seniority': [{ field: 'start_date', direction: 'asc' }],
      'department_alpha': [
        { field: 'department_name', direction: 'asc' },
        { field: 'full_name', direction: 'asc' }
      ],
      'hierarchy': [
        { field: 'position_group_level', direction: 'asc' },
        { field: 'department_name', direction: 'asc' },
        { field: 'full_name', direction: 'asc' }
      ],
      'status_priority': [
     
        { field: 'status_name', direction: 'asc' },
        { field: 'full_name', direction: 'asc' }
      ]
    };
    
    const preset = sortPresets[presetName];
    if (preset) {
      setMultipleSortingAction(preset);
    }
  }, [setMultipleSortingAction]);

  const actions = {
    fetchEmployees: fetchEmployeesAction,
    fetchEmployee: fetchEmployeeAction,
    fetchFilterOptions: fetchFilterOptionsAction, 
    createEmployee: createEmployeeAction,
    updateEmployee: updateEmployeeAction,
    fetchStatistics: fetchStatisticsAction,
    uploadProfilePhoto: uploadProfilePhotoAction,
    deleteProfilePhoto: deleteProfilePhotoAction,
    clearProfilePhotoError: clearProfilePhotoErrorAction,
    clearProfilePhotoSuccess: clearProfilePhotoSuccessAction,
    setProfilePhotoLoading: setProfilePhotoLoadingAction,
    toggleOrgChartVisibility: toggleOrgChartVisibilityAction,
    bulkToggleOrgChartVisibility: bulkToggleOrgChartVisibilityAction,
    showInOrgChart: showInOrgChartAction,
    hideFromOrgChart: hideFromOrgChartAction,
    addEmployeeTag: addEmployeeTagAction,
    removeEmployeeTag: removeEmployeeTagAction,
    bulkAddTags: bulkAddTagsAction,
    bulkRemoveTags: bulkRemoveTagsAction,
    assignLineManager: assignLineManagerAction,
    bulkAssignLineManager: bulkAssignLineManagerAction,
    fetchEmployeeGrading: fetchEmployeeGradingAction,
    exportEmployees: exportEmployeesAction,
    downloadEmployeeTemplate: downloadEmployeeTemplateAction,
    bulkUploadEmployees: bulkUploadEmployeesAction,
    fetchEmployeeActivities: fetchEmployeeActivitiesAction,
    fetchEmployeeDirectReports: fetchEmployeeDirectReportsAction,
    setSelectedEmployees: setSelectedEmployeesAction,
    toggleEmployeeSelection: toggleEmployeeSelectionAction,
    selectAllEmployees: selectAllEmployeesAction,
    selectAllVisible: selectAllVisibleAction,
    clearSelection: clearSelectionAction,
    setCurrentFilters: setCurrentFiltersAction,
    addFilter: addFilterAction,
    removeFilter: removeFilterAction,
    clearFilters: clearFiltersAction,
    updateFilter: updateFilterAction,
    searchEmployeesAdvanced: searchEmployeesAdvancedAction,
    setDateRangeFilter: setDateRangeFilterAction,
    setNumericRangeFilter: setNumericRangeFilterAction,
    setMultiSelectFilter: setMultiSelectFilterAction,
    setBooleanFilter: setBooleanFilterAction,
    applyFilterPreset: applyFilterPresetAction,
    clearFilterType: clearFilterTypeAction,
    setSorting: setSortingAction,
    addSort: addSortAction,
    removeSort: removeSortAction,
    clearSorting: clearSortingAction,
    toggleSort: toggleSortAction,
    setMultipleSorting: setMultipleSortingAction,
    addSortToMultiple: addSortToMultipleAction,
    reorderSorts: reorderSortsAction,
    applySortPreset: applySortPresetAction,
    setPageSize: setPageSizeAction,
    setCurrentPage: setCurrentPageAction,
    goToNextPage: goToNextPageAction,
    goToPreviousPage: goToPreviousPageAction,
    toggleAdvancedFilters: toggleAdvancedFiltersAction,
    setShowAdvancedFilters: setShowAdvancedFiltersAction,
    setViewMode: setViewModeAction,
    setShowGradingPanel: setShowGradingPanelAction,
    toggleGradingPanel: toggleGradingPanelAction,
    setGradingMode: setGradingModeAction,
    

    clearErrors: clearErrorsAction,
    clearError: clearErrorAction,
    setError: setErrorAction,
    clearCurrentEmployee: clearCurrentEmployeeAction,
    setQuickFilter: setQuickFilterAction,
    optimisticUpdateEmployee: optimisticUpdateEmployeeAction,
 

  };

  const computed = {
    isLoading: loading.employees || loading.creating || loading.updating || loading.deleting,
    isCreating: loading.creating,
    isUpdating: loading.updating,
    isDeleting: loading.deleting,
    isExporting: loading.exporting,
    isLoadingTemplate: loading.template,
    isLoadingGrading: loading.grading,
    isLoadingUpload: loading.upload,
    isLoadingOrgChart: loading.orgChart || false,
    isUploadingProfilePhoto: profilePhotoLoading,
    hasProfilePhotoError: !!profilePhotoError,
    hasProfilePhotoSuccess: profilePhotoSuccess,

    hasSelection: selectedEmployees.length > 0,
    selectionCount: selectedEmployees.length,
    isAllSelected: selectionInfo.isAllSelected,
    isPartialSelection: selectionInfo.isPartialSelection,
    
    hasActiveFilters: Object.keys(currentFilters).length > 0 || appliedFilters.length > 0,
    activeFilterCount: Object.keys(currentFilters).length + appliedFilters.length,
    hasSearchFilters: !!(currentFilters.search || currentFilters.employee_search || 
                         currentFilters.line_manager_search || currentFilters.job_title_search),
    hasDateFilters: !!(currentFilters.start_date_range || currentFilters.contract_end_date_range),
    hasNumericFilters: !!(currentFilters.years_of_service_range),
    hasBooleanFilters: !!(currentFilters.is_active !== undefined || 
                         currentFilters.is_visible_in_org_chart !== undefined),
    
    hasSorting: sorting.length > 0,
    sortingCount: sorting.length,
    hasMultipleSorts: sorting.length > 1,
    primarySort: sorting.length > 0 ? sorting[0] : null,
    
    hasNextPage: pagination.hasNext,
    hasPreviousPage: pagination.hasPrevious,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    
    isEmpty: formattedEmployees.length === 0,
    filteredCount: filteredEmployeesCount,
    totalEmployees: employees.length,

    gradedEmployeesCount: gradingStatistics.gradedEmployees,
    
    activeEmployeesCount: statistics.active_employees,
    newHiresCount: statistics.recent_hires_30_days,
    onLeaveCount: employeesByStatus['ON_LEAVE'] || 0,
    onboardingCount: employeesByStatus['ONBOARDING'] || 0,
    probationCount: employeesByStatus['PROBATION'] || 0,

    orgChartVisibleCount: employees.filter(emp => emp.is_visible_in_org_chart).length,
    orgChartHiddenCount: employees.filter(emp => !emp.is_visible_in_org_chart).length,
    managersCount: employees.filter(emp => (emp.direct_reports_count || 0) > 0).length,

  };

  const helpers = {
    refreshEmployees: useCallback(() => {
      const currentParams = JSON.stringify(apiParams);
      if (lastFetchParams.current !== currentParams) {
        lastFetchParams.current = currentParams;
        dispatch(fetchEmployees(apiParams));
      }
    }, [dispatch, apiParams]),
    
    refreshStatistics: useCallback(() => {
      dispatch(fetchStatistics());
    }, [dispatch]),
    
    refreshGradingData: useCallback(() => {
      dispatch(fetchEmployeeGrading());
    }, [dispatch]),
    

    
    refreshAll: useCallback(() => {
      const currentParams = JSON.stringify(apiParams);
      if (lastFetchParams.current !== currentParams) {
        lastFetchParams.current = currentParams;
        dispatch(fetchEmployees(apiParams));
      }
      dispatch(fetchStatistics());
      dispatch(fetchEmployeeGrading());
     
    }, [dispatch, apiParams]),
    
    buildQueryParams: useCallback(() => apiParams, [apiParams]),
    
    hasActiveFilters: useCallback(() => {
      return Object.keys(currentFilters).length > 0 || appliedFilters.length > 0;
    }, [currentFilters, appliedFilters]),
    
    performAdvancedSearch: useCallback((searchCriteria) => {
      const searchParams = {
        search: searchCriteria.generalSearch,
        employee_search: searchCriteria.employeeSearch,
        line_manager_search: searchCriteria.managerSearch,
        job_title_search: searchCriteria.jobTitleSearch,
        
        business_function: searchCriteria.businessFunctions,
        department: searchCriteria.departments,
        unit: searchCriteria.units,
        job_function: searchCriteria.jobFunctions,
        position_group: searchCriteria.positionGroups,
        status: searchCriteria.statuses,
        grading_level: searchCriteria.gradingLevels,
        contract_duration: searchCriteria.contractDurations,
        line_manager: searchCriteria.lineManagers,
        tags: searchCriteria.tags,
        gender: searchCriteria.genders,
        
        start_date_range: searchCriteria.startDateRange,
        contract_end_date_range: searchCriteria.contractEndDateRange,
        
        years_of_service_range: searchCriteria.serviceYearsRange,
        
        is_active: searchCriteria.isActive,
        is_visible_in_org_chart: searchCriteria.isOrgChartVisible,
        is_deleted: searchCriteria.includeDeleted,
        
       
      };
      
      // Remove undefined values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === undefined || searchParams[key] === null || 
            (Array.isArray(searchParams[key]) && searchParams[key].length === 0)) {
          delete searchParams[key];
        }
      });
      
      return actions.searchEmployeesAdvanced(searchParams);
    }, [actions]),
    
    applyQuickFilter: useCallback((filterType, value) => {
      actions.applyFilterPreset(filterType, { [filterType]: value });
    }, [actions]),
    
    searchEmployees: useCallback((searchTerm) => {
      dispatch(updateFilter({ key: 'search', value: searchTerm }));
    }, [dispatch]),
    
    // ENHANCED FILTERING HELPERS
    validateFilters: useCallback((filters) => {
      const errors = {};
      const warnings = [];
      
      // Date range validation
      if (filters.start_date_range) {
        const { from, to } = filters.start_date_range;
        if (from && to && new Date(from) > new Date(to)) {
          errors.start_date_range = 'Start date "from" cannot be after "to" date';
        }
      }
      
      if (filters.contract_end_date_range) {
        const { from, to } = filters.contract_end_date_range;
        if (from && to && new Date(from) > new Date(to)) {
          errors.contract_end_date_range = 'Contract end date "from" cannot be after "to" date';
        }
      }
      
      // Numeric range validation
      if (filters.years_of_service_range) {
        const { min, max } = filters.years_of_service_range;
        if (min !== null && max !== null && min > max) {
          errors.years_of_service_range = 'Minimum years cannot be greater than maximum';
        }
      }
      
      return { isValid: Object.keys(errors).length === 0, errors, warnings };
    }, []),
    
    // Get available filter options
    getFilterOptions: useCallback(() => ({
      statuses: statistics.by_status || {},
      businessFunctions: statistics.by_business_function || {},
      positionGroups: statistics.by_position_group || {},
      contractDurations: statistics.by_contract_duration || {},
      departments: employeesByDepartment,
      gradingLevels: allGradingLevels
    }), [statistics, employeesByDepartment, allGradingLevels]),
    
    // Filter suggestions based on current data
    getFilterSuggestions: useCallback((filterType) => {
      const suggestions = {
        'departments': [...new Set(employees.map(emp => emp.department_name).filter(Boolean))],
        'jobTitles': [...new Set(employees.map(emp => emp.job_title).filter(Boolean))],
        'managers': [...new Set(employees.map(emp => emp.line_manager_name).filter(Boolean))],
        'tags': [...new Set(employees.flatMap(emp => emp.tag_names || []).filter(Boolean))]
      };
      
      return suggestions[filterType] || [];
    }, [employees]),
    
    // Sorting helpers - Enhanced
    getSortDirection: useCallback((field) => getSortDirection(field), [getSortDirection]),
    isSorted: useCallback((field) => isSorted(field), [isSorted]),
    getSortIndex: useCallback((field) => getSortIndex(field), [getSortIndex]),
    
    // Get current sorting configuration
    getCurrentSorting: useCallback(() => {
      return sorting.map((sort, index) => ({
        ...sort,
        index: index + 1,
        isPrimary: index === 0
      }));
    }, [sorting]),
    
    // Validate sorting configuration
    validateSorting: useCallback((sortingArray) => {
      const validFields = [
        'full_name', 'employee_id', 'email', 'phone', 'job_title',
        'business_function_name', 'department_name', 'position_group_name',
        'grading_level', 'line_manager_name', 'start_date', 'status_name',
        'years_of_service', 'created_at', 'updated_at'
      ];
      
      const errors = [];
      const validSorts = [];
      
      sortingArray.forEach((sort, index) => {
        if (!sort.field || !validFields.includes(sort.field)) {
          errors.push(`Invalid sort field at index ${index}: ${sort.field}`);
        } else if (!['asc', 'desc'].includes(sort.direction)) {
          errors.push(`Invalid sort direction at index ${index}: ${sort.direction}`);
        } else {
          validSorts.push(sort);
        }
      });
      
      return { isValid: errors.length === 0, errors, validSorts };
    }, []),
    
 
    isSelected: useCallback((employeeId) => selectedEmployees.includes(employeeId), [selectedEmployees]),
    
    selectByFilter: useCallback((filterCriteria) => {
      const matchingEmployees = employees.filter(emp => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          switch (key) {
            case 'status':
              return emp.status_name === value;
            case 'department':
              return emp.department_name === value;
            case 'position_group':
              return emp.position_group_name === value;
            case 'needs_grading':
              return value ? !emp.grading_level : !!emp.grading_level;
            case 'no_line_manager':
              return value ? !emp.line_manager : !!emp.line_manager;
            case 'is_visible_in_org_chart':
              return emp.is_visible_in_org_chart === value;
            case 'contract_ending':
              if (!emp.contract_end_date) return false;
              const endDate = new Date(emp.contract_end_date);
              const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              return value ? endDate <= thirtyDaysFromNow : endDate > thirtyDaysFromNow;
            default:
              return true;
          }
        });
      });
      
      dispatch(setSelectedEmployees(matchingEmployees.map(emp => emp.id)));
    }, [employees, dispatch]),
    
    // Advanced selection helpers
    selectByStatus: useCallback((statusNames) => {
      const statuses = Array.isArray(statusNames) ? statusNames : [statusNames];
      helpers.selectByFilter({ status: statuses[0] }); // For single status
    }, []),
    
    selectByDepartment: useCallback((departmentNames) => {
      const departments = Array.isArray(departmentNames) ? departmentNames : [departmentNames];
      helpers.selectByFilter({ department: departments[0] }); // For single department
    }, []),
    
  
    // Export helpers - Enhanced
    exportWithCurrentFilters: useCallback((format = 'excel', options = {}) => {
      const exportParams = {
        ...apiParams,
        format,
        ...options
      };
      return dispatch(exportEmployees({ format, params: exportParams }));
    }, [dispatch, apiParams]),
    
    exportSelected: useCallback((format = 'excel', options = {}) => {
      if (selectedEmployees.length === 0) {
        throw new Error('No employees selected for export');
      }
      
      const params = { 
        employee_ids: selectedEmployees,
        format: format,
        ...options
      };
      return dispatch(exportEmployees({ format, params }));
    }, [dispatch, selectedEmployees]),
    
    exportByFilter: useCallback((filterCriteria, format = 'excel', options = {}) => {
      const params = {
        ...filterCriteria,
        format,
        ...options
      };
      return dispatch(exportEmployees({ format, params }));
    }, [dispatch]),
    
    exportAll: useCallback((format = 'excel', options = {}) => {
      return dispatch(exportEmployees({ format, params: { all: true, ...options } }));
    }, [dispatch]),
    
    // BULK OPERATIONS - Enhanced
    performBulkOperation: useCallback(async (operation, employeeIds, operationData = {}) => {
      if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        throw new Error('No employees selected for bulk operation');
      }
      
      // Validate operation
      const validOperations = [
        'delete', 'restore', 'add_tag', 'remove_tag', 'assign_manager',
       'update_grades', 'show_in_org_chart', 'hide_from_org_chart'
      ];
      
      if (!validOperations.includes(operation)) {
        throw new Error(`Invalid bulk operation: ${operation}`);
      }
      
      // Perform operation
      switch (operation) {
  
        case 'add_tag':
          return dispatch(bulkAddTags({ employee_ids: employeeIds, tag_id: operationData.tagId }));
        case 'remove_tag':
          return dispatch(bulkRemoveTags({ employee_ids: employeeIds, tag_id: operationData.tagId }));
        case 'assign_manager':
          return dispatch(bulkAssignLineManager({ employee_ids: employeeIds, line_manager_id: operationData.managerId }));

        case 'show_in_org_chart':
          return dispatch(bulkToggleOrgChartVisibility({ employeeIds, setVisible: true }));
        case 'hide_from_org_chart':
          return dispatch(bulkToggleOrgChartVisibility({ employeeIds, setVisible: false }));
        default:
          throw new Error(`Unhandled bulk operation: ${operation}`);
      }
    }, [dispatch]),
    
    // Validation helpers - Enhanced
    validateEmployee: useCallback((employeeData) => {
      const errors = {};
      
      // Basic validation
      if (!employeeData.first_name?.trim()) {
        errors.first_name = 'First name is required';
      }
      if (!employeeData.last_name?.trim()) {
        errors.last_name = 'Last name is required';
      }
      if (!employeeData.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
        errors.email = 'Invalid email format';
      }
      if (!employeeData.employee_id?.trim()) {
        errors.employee_id = 'Employee ID is required';
      }
      
      // Business logic validation
      if (!employeeData.business_function) {
        errors.business_function = 'Company is required';
      }
      if (!employeeData.job_title?.trim()) {
        errors.job_title = 'Job title is required';
      }
      if (!employeeData.start_date) {
        errors.start_date = 'Start date is required';
      }
      
      // Date validation
      if (employeeData.start_date && employeeData.end_date) {
        const startDate = new Date(employeeData.start_date);
        const endDate = new Date(employeeData.end_date);
        if (endDate <= startDate) {
          errors.end_date = 'End date must be after start date';
        }
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }, []),
    
    
    getEmployeeStatusInfo: useCallback((employee) => {
      const status = employee.status_name || employee.status || 'Unknown';
      const color = employee.status_color || '#gray';
      const affectsHeadcount = employee.status_affects_headcount !== false;
      
      return {
        status,
        color,
        affectsHeadcount,
        isActive: status === 'ACTIVE' || status === 'Active',
        isOnLeave: status === 'ON_LEAVE',
        isOnboarding: status === 'ONBOARDING',
        isProbation: status === 'PROBATION',
        isInactive: status === 'INACTIVE',
        displayName: status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      };
    }, []),
    
    getContractInfo: useCallback((employee) => {
      const duration = employee.contract_duration || 'UNKNOWN';
      const startDate = employee.contract_start_date || employee.start_date;
      const endDate = employee.contract_end_date || employee.end_date;
    
      return {
        duration,
        startDate,
        endDate,
      };
    }, []),
    
    getGradingInfo: useCallback((employee) => {
      const level = employee.grading_level;
      const hasGrade = !!level;
      
      // Find full grading level info
      const gradingLevelInfo = allGradingLevels.find(gl => gl.code === level) || {
        code: level,
        display: display,
        full_name: display
      };
      
      return {
        level,
        display,
        hasGrade,
        needsGrade: !hasGrade,
        levelInfo: gradingLevelInfo,
        isOptimistic: employee._isOptimistic === true
      };
    }, [allGradingLevels]),
    
  
    getOrganizationalInfo: useCallback((employee) => {
      return {
        businessFunction: {
          id: employee.business_function,
          name: employee.business_function_name,
          code: employee.business_function_code
        },
        department: {
          id: employee.department,
          name: employee.department_name
        },
        unit: {
          id: employee.unit,
          name: employee.unit_name
        },
        jobFunction: {
          id: employee.job_function,
          name: employee.job_function_name
        },
        positionGroup: {
          id: employee.position_group,
          name: employee.position_group_name,
          level: employee.position_group_level
        },
        lineManager: {
          id: employee.line_manager,
          name: employee.line_manager_name,
          employeeId: employee.line_manager_hc_number
        },
        directReports: {
          count: employee.direct_reports_count || 0,
          hasReports: (employee.direct_reports_count || 0) > 0
        },
        hierarchyPath: [
          employee.business_function_name,
          employee.department_name,
          employee.unit_name
        ].filter(Boolean).join(' > ')
      };
    }, []),

  };

  // Add circular reference fix for helpers
  helpers.selectByStatus = useCallback((statusNames) => {
    const statuses = Array.isArray(statusNames) ? statusNames : [statusNames];
    helpers.selectByFilter({ status: statuses[0] });
  }, [helpers.selectByFilter]);

  helpers.selectByDepartment = useCallback((departmentNames) => {
    const departments = Array.isArray(departmentNames) ? departmentNames : [departmentNames];
    helpers.selectByFilter({ department: departments[0] });
  }, [helpers.selectByFilter]);

  // Initialization - controlled to prevent loops
  useEffect(() => {
    if (!isInitialized.current) {

      actions.fetchFilterOptions().catch(error => {
        console.error('❌ Failed to initialize useEmployees:', error);
      });
    }
  }, [actions.fetchFilterOptions]);

  // Controlled fetching with parameter comparison
  // useEffect(() => {
  //   if (isInitialized.current) {
  //     const currentParams = JSON.stringify(apiParams);
  //     if (lastFetchParams.current !== currentParams) {

  //       lastFetchParams.current = currentParams;
  //       dispatch(fetchEmployees(apiParams));
  //     }
  //   }
  // }, [apiParams, dispatch]);


  useEffect(() => {
    if (isInitialized.current && statistics.total_employees === 0) {
    
      dispatch(fetchStatistics());
      dispatch(fetchEmployeeGrading());
     
    }
  }, [isInitialized.current, statistics.total_employees, dispatch]);


  return {
    // Data
    employees,
    formattedEmployees,
    currentEmployee,
    selectedEmployees,
    currentFilters,
    appliedFilters,
    statistics,
    pagination,
    sorting,
    activities,
    directReports,
 
    viewMode,
    showAdvancedFilters,
    profilePhotoLoading,
    profilePhotoError,
    profilePhotoSuccess,
    gradingData,
    gradingStatistics,
    allGradingLevels,
    showGradingPanel,
    gradingMode,
    employeesByGradeLevel,
    employeesByPositionGroup,
   
    gradingDistribution,
    employeesByStatus,
    employeesByDepartment,
    newHires,

    dashboardSummary,
    employeeMetrics,

    loading,
    error,
    isAnyLoading,
    hasAnyError,

    ...computed,

    ...actions,

    ...helpers,
    
    getSortDirection,
    isSorted,
    getSortIndex,
    sortingForBackend,
    apiParams,
    selectionInfo,
    filteredEmployeesCount
  };
};

export const useEmployeeForm = (initialData = null) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMode, setValidationMode] = useState('onSubmit');
  
  const { validateEmployee } = useEmployees();
  
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    if (validationMode === 'onChange') {
      const validation = validateEmployee({ ...formData, [field]: value });
      if (validation.errors[field]) {
        setErrors(prev => ({ ...prev, [field]: validation.errors[field] }));
      }
    }
  }, [errors, formData, validateEmployee, validationMode]);
  
  const updateMultipleFields = useCallback((fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
    setIsDirty(true);
    
    const updatedFieldNames = Object.keys(fields);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFieldNames.forEach(field => {
        if (newErrors[field]) {
          delete newErrors[field];
        }
      });
      return newErrors;
    });
  }, []);
  
  const validateForm = useCallback(() => {
    const validation = validateEmployee(formData);
    setErrors(validation.errors);
    return validation;
  }, [formData, validateEmployee]);
  
  const validateField = useCallback((fieldName) => {
    const validation = validateEmployee(formData);
    const fieldError = validation.errors[fieldName];
    
    if (fieldError) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldError }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    return !fieldError;
  }, [formData, validateEmployee]);
  
  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialData]);
  
  const resetField = useCallback((fieldName) => {
    const initialValue = initialData?.[fieldName];
    setFormData(prev => ({ ...prev, [fieldName]: initialValue }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, [initialData]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const setSubmitting = useCallback((submitting) => {
    setIsSubmitting(submitting);
  }, []);
  
  const setValidationModeCallback = useCallback((mode) => {
    setValidationMode(mode);
  }, []);
  
  // Auto-save functionality
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  
  const enableAutoSave = useCallback((onAutoSave, delay = 2000) => {
    setAutoSaveEnabled(true);
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    if (isDirty) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        const validation = validateEmployee(formData);
        if (validation.isValid) {
          onAutoSave(formData);
          setLastAutoSave(new Date());
          setIsDirty(false);
        }
      }, delay);
    }
  }, [isDirty, formData, validateEmployee]);
  
  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false);
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // Form data
    formData,
    errors,
    isDirty,
    isSubmitting,
    validationMode,
    
    // Auto-save
    autoSaveEnabled,
    lastAutoSave,
    
    // Actions
    updateField,
    updateMultipleFields,
    validateForm,
    validateField,
    resetForm,
    resetField,
    clearErrors,
    setFormData,
    setSubmitting,
    setValidationMode: setValidationModeCallback,
    enableAutoSave,
    disableAutoSave,
    
    // Computed properties
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0,
    canSubmit: Object.keys(errors).length === 0 && isDirty && !isSubmitting,
    fieldCount: Object.keys(formData).length,
    errorCount: Object.keys(errors).length
  };
};

export const useEmployeeGrading = () => {
  const dispatch = useDispatch();
  const gradingData = useSelector(selectGradingData);
  const gradingStatistics = useSelector(selectGradingStatistics);
  const allGradingLevels = useSelector(selectAllGradingLevels);

  const employeesByGradeLevel = useSelector(selectEmployeesByGradeLevel);

  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);

  const refreshGradingData = useCallback(() => {
    dispatch(fetchEmployeeGrading());
  }, [dispatch]);


  useEffect(() => {
    if (!gradingData.employees || gradingData.employees.length === 0) {
      refreshGradingData();
    }
  }, [gradingData.employees, refreshGradingData]);

  return {
    gradingData,
    gradingStatistics,
    allGradingLevels,
    employeesByGradeLevel,
    loading: loading.grading,
    error: error.grading,
    refreshGradingData,
    totalEmployeesCount: gradingStatistics.totalEmployees,
    gradedEmployeesCount: gradingStatistics.gradedEmployees
  };
};

export default useEmployees;
