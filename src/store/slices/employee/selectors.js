import { createSelector } from '@reduxjs/toolkit';

// ── Base selectors ───────────────────────────────────────────────────────────
export const selectProfilePhotoLoading = (state) => state.employees.loading.profilePhoto;
export const selectProfilePhotoError   = (state) => state.employees.error.profilePhoto;
export const selectProfilePhotoSuccess = (state) => state.employees.success.profilePhoto;
export const selectEmployees           = (state) => state.employees.employees;
export const selectCurrentEmployee     = (state) => state.employees.currentEmployee;
export const selectEmployeeLoading     = (state) => state.employees.loading;
export const selectEmployeeError       = (state) => state.employees.error;
export const selectSelectedEmployees   = (state) => state.employees.selectedEmployees;
export const selectCurrentFilters      = (state) => state.employees.currentFilters;
export const selectAppliedFilters      = (state) => state.employees.appliedFilters;
export const selectAdvancedFilters     = (state) => state.employees.advancedFilters;
export const selectFilterMode          = (state) => state.employees.filterMode;
export const selectStatistics          = (state) => state.employees.statistics;
export const selectPagination          = (state) => state.employees.pagination;
export const selectSorting             = (state) => state.employees.sorting;
export const selectSortingMode         = (state) => state.employees.sortingMode;
export const selectGradingData         = (state) => state.employees.gradingData;
export const selectGradingStatistics   = (state) => state.employees.gradingStatistics;
export const selectAllGradingLevels    = (state) => state.employees.allGradingLevels;
export const selectActivities          = (state) => state.employees.activities;
export const selectDirectReports       = (state) => state.employees.directReports;
export const selectViewMode            = (state) => state.employees.viewMode;
export const selectShowAdvancedFilters = (state) => state.employees.showAdvancedFilters;
export const selectShowGradingPanel    = (state) => state.employees.showGradingPanel;
export const selectGradingMode         = (state) => state.employees.gradingMode;
export const selectSearchResults       = (state) => state.employees.searchResults;
export const selectLastSearchParams    = (state) => state.employees.lastSearchParams;
export const selectSearchPagination    = (state) => state.employees.searchPagination;

// ── Memoized selectors ───────────────────────────────────────────────────────
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
      affects_headcount: employee.status_affects_headcount,
    },
    contractInfo: {
      duration: employee.contract_duration_display || employee.contract_duration,
      startDate: employee.contract_start_date || employee.start_date,
      endDate: employee.contract_end_date || employee.end_date,
    },
    serviceInfo: {
      yearsOfService: employee.years_of_service || 0,
      startDate: employee.start_date,
      isNewHire: (employee.years_of_service || 0) < 0.25,
      isVeteran: (employee.years_of_service || 0) >= 5,
    },
    managementInfo: {
      hasLineManager: !!employee.line_manager,
      lineManagerName: employee.line_manager_name,
      lineManagerEmployeeId: employee.line_manager_hc_number,
      directReportsCount: employee.direct_reports_count || 0,
      isLineManager: (employee.direct_reports_count || 0) > 0,
    },
    gradingInfo: {
      level: employee.grading_level,
      hasGrade: !!employee.grading_level,
      isOptimistic: employee._isOptimistic === true,
    },
    orgChartInfo: {
      isVisible: employee.is_visible_in_org_chart,
      isOptimistic: employee._isOptimisticOrgChart === true,
    },
    tagInfo: {
      tags: employee.tags || [],
      tagNames: employee.tag_names || [],
      tagCount: (employee.tags || []).length,
    },
    statusInfo: {
      isActive: employee.status_name === 'ACTIVE' || employee.status_name === 'Active',
      isOnLeave: employee.status_name === 'ON_LEAVE',
      isOnboarding: employee.status_name === 'ONBOARDING',
      isProbation: employee.status_name === 'PROBATION',
      isInactive: employee.status_name === 'INACTIVE',
    },
  }))
);

export const selectSortingForBackend = createSelector(
  [selectSorting],
  (sorting) => {
    if (!sorting.length) return '';
    return sorting.map(s => `${s.direction === 'desc' ? '-' : ''}${s.field}`).join(',');
  }
);

export const selectFilteredEmployeesCount = createSelector(
  [selectEmployees, selectCurrentFilters],
  (employees, filters) => {
    if (!Object.keys(filters).length) return employees.length;
    return employees.filter(employee =>
      Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all' || value === '') return true;
        switch (key) {
          case 'search': {
            const term = value.toLowerCase();
            return (
              employee.name?.toLowerCase().includes(term) ||
              employee.email?.toLowerCase().includes(term) ||
              employee.employee_id?.toLowerCase().includes(term) ||
              employee.job_title?.toLowerCase().includes(term)
            );
          }
          case 'employee_search': {
            const term = value.toLowerCase();
            return (
              employee.name?.toLowerCase().includes(term) ||
              employee.employee_id?.toLowerCase().includes(term) ||
              employee.first_name?.toLowerCase().includes(term) ||
              employee.last_name?.toLowerCase().includes(term)
            );
          }
          case 'line_manager_search':
            return employee.line_manager_name?.toLowerCase().includes(value.toLowerCase());
          case 'job_title_search':
            return employee.job_title?.toLowerCase().includes(value.toLowerCase());
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
      })
    ).length;
  }
);

export const selectGetSortDirection = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    const sort = sorting.find(s => s.field === field);
    return sort ? sort.direction : null;
  }
);

export const selectIsSorted = createSelector(
  [selectSorting],
  (sorting) => (field) => sorting.some(s => s.field === field)
);

export const selectGetSortIndex = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    const idx = sorting.findIndex(s => s.field === field);
    return idx !== -1 ? idx + 1 : null;
  }
);

export const selectApiParams = createSelector(
  [selectCurrentFilters, selectAdvancedFilters, selectSortingForBackend, selectPagination],
  (filters, advancedFilters, ordering, pagination) => {
    const combined = { ...filters };

    if (advancedFilters.searchFilters) {
      Object.entries(advancedFilters.searchFilters).forEach(([k, v]) => { if (v) combined[k] = v; });
    }
    if (advancedFilters.multiSelectFilters) {
      Object.entries(advancedFilters.multiSelectFilters).forEach(([k, v]) => {
        if (Array.isArray(v) && v.length > 0) combined[k] = v;
      });
    }
    if (advancedFilters.dateRangeFilters) {
      Object.entries(advancedFilters.dateRangeFilters).forEach(([k, v]) => {
        if (v?.from) combined[`${k}_from`] = v.from;
        if (v?.to)   combined[`${k}_to`]   = v.to;
      });
    }
    if (advancedFilters.numericRangeFilters) {
      Object.entries(advancedFilters.numericRangeFilters).forEach(([k, v]) => {
        if (v?.min !== null) combined[`${k}_min`] = v.min;
        if (v?.max !== null) combined[`${k}_max`] = v.max;
      });
    }
    if (advancedFilters.booleanFilters) {
      Object.entries(advancedFilters.booleanFilters).forEach(([k, v]) => {
        if (v !== null && v !== undefined) combined[k] = v;
      });
    }
    if (advancedFilters.specialFilters) {
      Object.entries(advancedFilters.specialFilters).forEach(([k, v]) => {
        if (v !== null && v !== undefined) combined[k] = v;
      });
    }

    return { ...combined, ordering, page: pagination.page, page_size: pagination.pageSize };
  }
);

export const selectSelectionInfo = createSelector(
  [selectSelectedEmployees, selectEmployees],
  (selected, employees) => ({
    selectedCount: selected.length,
    totalCount: employees.length,
    hasSelection: selected.length > 0,
    isAllSelected: selected.length === employees.length && employees.length > 0,
    isPartialSelection: selected.length > 0 && selected.length < employees.length,
    selectionPercentage: employees.length > 0 ? (selected.length / employees.length) * 100 : 0,
  })
);

export const selectEmployeesByGradeLevel = createSelector(
  [selectGradingData],
  (gradingData) => {
    const byGrade = {};
    (gradingData.employees || []).forEach(emp => {
      const grade = emp.grading_level || 'No Grade';
      if (!byGrade[grade]) byGrade[grade] = [];
      byGrade[grade].push(emp);
    });
    return byGrade;
  }
);

export const selectEmployeesByPositionGroup = createSelector(
  [selectGradingData],
  (gradingData) => {
    const byPG = {};
    (gradingData.employees || []).forEach(emp => {
      const pg = emp.position_group_name || 'Unknown';
      if (!byPG[pg]) byPG[pg] = [];
      byPG[pg].push(emp);
    });
    return byPG;
  }
);

export const selectGradingDistribution = createSelector(
  [selectEmployeesByGradeLevel, selectAllGradingLevels],
  (byGrade, allLevels) => {
    const dist = allLevels.map(level => ({
      ...level,
      count: byGrade[level.code]?.length || 0,
      employees: byGrade[level.code] || [],
    }));
    dist.push({
      code: 'NO_GRADE', display: 'No Grade', full_name: 'No Grade Assigned',
      count: byGrade['No Grade']?.length || 0, employees: byGrade['No Grade'] || [],
    });
    return dist;
  }
);

export const selectEmployeesByStatus = createSelector(
  [selectEmployees],
  (employees) => {
    const byStatus = {};
    employees.forEach(emp => {
      const s = emp.status_name || emp.status || 'Unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    return byStatus;
  }
);

export const selectEmployeesByDepartment = createSelector(
  [selectEmployees],
  (employees) => {
    const byDept = {};
    employees.forEach(emp => {
      const d = emp.department_name || 'Unknown';
      byDept[d] = (byDept[d] || 0) + 1;
    });
    return byDept;
  }
);

export const selectNewHires = createSelector(
  [selectEmployees],
  (employees) => employees.filter(emp => (emp.years_of_service || 0) < 0.25)
);

export const selectIsAnyLoading = createSelector(
  [selectEmployeeLoading],
  (loading) => Object.values(loading).some(Boolean)
);

export const selectHasAnyError = createSelector(
  [selectEmployeeError],
  (errors) => Object.values(errors).some(err => err !== null)
);

export const selectDashboardSummary = createSelector(
  [selectStatistics],
  (statistics) => ({
    totalEmployees: statistics.total_employees,
    activeEmployees: statistics.active_employees,
    newHires: statistics.recent_hires_30_days,
    trends: {
      newHiresTrend: statistics.recent_hires_30_days > statistics.recent_hires_30_days * 0.8 ? 'up' : 'down',
    },
  })
);

export const selectEmployeeMetrics = createSelector(
  [selectEmployees],
  (employees) => ({
    headcount: {
      total: employees.length,
      active:     employees.filter(e => e.status_name === 'ACTIVE').length,
      onLeave:    employees.filter(e => e.status_name === 'ON_LEAVE').length,
      onboarding: employees.filter(e => e.status_name === 'ONBOARDING').length,
      probation:  employees.filter(e => e.status_name === 'PROBATION').length,
      inactive:   employees.filter(e => e.status_name === 'INACTIVE').length,
    },
    performance: {
      averageServiceYears:
        employees.reduce((sum, e) => sum + (e.years_of_service || 0), 0) / employees.length || 0,
      managementCoverage:
        employees.length > 0
          ? (employees.filter(e => e.line_manager).length / employees.length) * 100
          : 0,
    },
    orgChart: {
      visibleEmployees: employees.filter(e => e.is_visible_in_org_chart).length,
      hiddenEmployees:  employees.filter(e => !e.is_visible_in_org_chart).length,
      managers:         employees.filter(e => (e.direct_reports_count || 0) > 0).length,
      participation:
        employees.length > 0
          ? (employees.filter(e => e.is_visible_in_org_chart).length / employees.length) * 100
          : 0,
    },
    retention: {
      newHiresThisMonth: employees.filter(e => {
        if (!e.start_date) return false;
        const d = new Date(e.start_date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      veteranEmployees: employees.filter(e => (e.years_of_service || 0) >= 5).length,
    },
  })
);

export const selectHasActiveAdvancedFilters = createSelector(
  [selectAdvancedFilters],
  (af) =>
    Object.values(af.searchFilters || {}).some(v => v && v.trim() !== '') ||
    Object.values(af.multiSelectFilters || {}).some(v => Array.isArray(v) && v.length > 0) ||
    Object.values(af.dateRangeFilters || {}).some(v => v && (v.from || v.to)) ||
    Object.values(af.numericRangeFilters || {}).some(v => v && (v.min !== null || v.max !== null)) ||
    Object.values(af.booleanFilters || {}).some(v => v !== null && v !== undefined) ||
    Object.values(af.specialFilters || {}).some(v => v !== null && v !== undefined)
);

export const selectSortingConfig = createSelector(
  [selectSorting, selectSortingMode],
  (sorting, mode) => ({
    sorts: sorting,
    mode,
    count: sorting.length,
    hasMultipleSorts: sorting.length > 1,
    primarySort: sorting.length > 0 ? sorting[0] : null,
    canAddMore: mode === 'multiple',
  })
);

export const selectSearchConfig = createSelector(
  [selectSearchResults, selectLastSearchParams, selectSearchPagination],
  (results, lastParams, pagination) => ({
    results,
    lastParams,
    pagination,
    hasResults: results.length > 0,
    hasSearched: lastParams !== null,
  })
);
