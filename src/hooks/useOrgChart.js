// src/hooks/useOrgChart.js - FIXED version with proper memory management
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import { useReferenceData } from './useReferenceData';
import {
  fetchOrgChart,
  fetchOrgChartEmployee,
  fetchFullTreeWithVacancies,
  
  searchOrgChart,
  fetchManagerTeam,
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
  refreshData,
  selectOrgChart,
  selectFullTree,
  selectStatistics,
  selectSelectedEmployee,
  selectHierarchy,
  selectFilters,
  selectActiveFilters,
  selectUIState,
  selectViewMode,
  selectShowFilters,
  selectShowLegend,
  selectIsFullscreen,
  selectExpandedNodes,
  selectLayoutDirection,
  selectOrgChartLoading,
  selectIsLoading,
  selectOrgChartErrors,
  selectHasErrors,
  selectPagination,
  selectFilteredOrgChart,
  selectOrgChartForReactFlow,

  selectOrgChartSummary
} from '../store/slices/orgChartSlice';

// FIXED: Clean employee data utility
const cleanEmployeeData = (employee) => {
  if (!employee) return null;
  
  return {
    employee_id: employee.employee_id,
    name: employee.name,
    title: employee.title,
    department: employee.department,
    unit: employee.unit,
    business_function: employee.business_function,
    position_group: employee.position_group,
    direct_reports: employee.direct_reports || 0,
    line_manager_id: employee.line_manager_id,
    level_to_ceo: employee.level_to_ceo,
    email: employee.email,
    phone: employee.phone,
    profile_image_url: employee.profile_image_url,
    avatar: employee.avatar,
    status_color: employee.status_color,
    employee_details: employee.employee_details ? {
      grading_display: employee.employee_details.grading_display,
      tags: employee.employee_details.tags
    } : null
  };
};

export const useOrgChart = () => {
  const dispatch = useDispatch();

  const {
    businessFunctionsDropdown,
    departmentsDropdown,
    unitsDropdown,
    positionGroupsDropdown,
    employeeStatusesDropdown,
    loading: refDataLoading,
    error: refDataError
  } = useReferenceData();

  const orgChart = useSelector(selectOrgChart);
  const fullTree = useSelector(selectFullTree);
  const statistics = useSelector(selectStatistics);
  const selectedEmployee = useSelector(selectSelectedEmployee);
  const hierarchy = useSelector(selectHierarchy);
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);

  const viewMode = useSelector(selectViewMode);
  const showFilters = useSelector(selectShowFilters);
  const showLegend = useSelector(selectShowLegend);
  const isFullscreen = useSelector(selectIsFullscreen);
  const expandedNodes = useSelector(selectExpandedNodes);
  const layoutDirection = useSelector(selectLayoutDirection);

  const loading = useSelector(selectOrgChartLoading);
  const isLoading = useSelector(selectIsLoading);
  const errors = useSelector(selectOrgChartErrors);
  const hasErrors = useSelector(selectHasErrors);

  const pagination = useSelector(selectPagination);
  const filteredOrgChart = useSelector(selectFilteredOrgChart);
  const reactFlowData = useSelector(selectOrgChartForReactFlow);
  const summary = useSelector(selectOrgChartSummary);

  // FIXED: Memoized actions to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    fetchOrgChart: (params = {}) => dispatch(fetchOrgChart(params)),
    fetchEmployee: (employeeId) => dispatch(fetchOrgChartEmployee(employeeId)),
    fetchFullTree: (params = {}) => dispatch(fetchFullTreeWithVacancies(params)),
  
    searchOrgChart: (searchParams) => dispatch(searchOrgChart(searchParams)),
    fetchManagerTeam: (managerId, params = {}) => dispatch(fetchManagerTeam({ managerId, params })),
    setFilters: (newFilters) => dispatch(setFilters(newFilters)),
    clearFilters: () => dispatch(clearFilters()),
    resetAllFilters: () => dispatch(resetAllFilters()),
    updateFilter: (key, value) => dispatch(updateFilter({ key, value })),
    setViewMode: (mode) => dispatch(setViewMode(mode)),
    setShowFilters: (show) => dispatch(setShowFilters(show)),
    setShowLegend: (show) => dispatch(setShowLegend(show)),
    setIsFullscreen: (fullscreen) => dispatch(setIsFullscreen(fullscreen)),
    setLayoutDirection: (direction) => dispatch(setLayoutDirection(direction)),
    toggleExpandedNode: (nodeId) => dispatch(toggleExpandedNode(nodeId)),
    setExpandedNodes: (nodeIds) => dispatch(setExpandedNodes(nodeIds)),
    expandAllNodes: () => dispatch(expandAllNodes()),
    collapseAllNodes: () => dispatch(collapseAllNodes()),
    setSelectedEmployee: (employee) => dispatch(setSelectedEmployee(cleanEmployeeData(employee))),
    clearSelectedEmployee: () => dispatch(clearSelectedEmployee()),
    setPagination: (paginationData) => dispatch(setPagination(paginationData)),
    setPage: (page) => dispatch(setPage(page)),
    setPageSize: (pageSize) => dispatch(setPageSize(pageSize)),
    clearErrors: () => dispatch(clearErrors()),
    clearError: (errorKey) => dispatch(clearError(errorKey)),
    invalidateCache: () => dispatch(invalidateCache()),
    refreshData: () => dispatch(refreshData())
  }), [dispatch]);

  // FIXED: Safe employee lookup
  const getEmployeeById = useCallback((employeeId) => {
    if (!Array.isArray(orgChart)) return null;
    const employee = orgChart.find(emp => emp.employee_id === employeeId);
    return employee ? cleanEmployeeData(employee) : null;
  }, [orgChart]);

  // FIXED: Safe preset filter application
  const applyPresetFilter = useCallback((presetName) => {
    const presets = {
      'all': {},
      'managers_only': { managers_only: true },
      'top_level_only': { show_top_level_only: true },
      'executives': { position_group: ['VC', 'DIRECTOR', 'Vice Chairman'] },
    
      'specialists': { position_group: ['SENIOR_SPECIALIST', 'SPECIALIST', 'JUNIOR_SPECIALIST'] }
    };

    const presetFilters = presets[presetName] || {};
    actions.setFilters(presetFilters);
  }, [actions]);

  // FIXED: Debounced search with cleanup
  const debouncedSearch = useCallback((searchTerm, delay = 300) => {
    const timeoutId = setTimeout(() => {
      actions.updateFilter('search', searchTerm);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [actions]);


  const hasActiveFilters = useCallback(() => {
    return Object.keys(activeFilters || {}).length > 0;
  }, [activeFilters]);



// 2. FIXED: If dropdowns are empty, build from orgChart data directly

const filterOptions = useMemo(() => {
    
    // Build from employee data directly if reference data is missing
    const buildFromEmployeeData = (field) => {
        if (!Array.isArray(orgChart) || orgChart.length === 0) return [];
        
        const uniqueValues = new Map();
        
        orgChart.forEach(emp => {
            if (emp && emp[field]) {
                const value = String(emp[field]);
                if (!uniqueValues.has(value)) {
                    uniqueValues.set(value, 0);
                }
                uniqueValues.set(value, uniqueValues.get(value) + 1);
            }
        });
        
        return Array.from(uniqueValues.entries())
            .map(([value, count]) => ({
                value: value,
                label: value,
                count: count
            }))
            .sort((a, b) => b.count - a.count);
    };

    const options = {
        // Companies
        businessFunctions: businessFunctionsDropdown && businessFunctionsDropdown.length > 0
            ? businessFunctionsDropdown.map(bf => {
                const count = orgChart?.filter(emp => emp.business_function === bf.label).length || 0;
                return {
                    value: bf.label,
                    label: bf.label,
                    count: count
                };
            }).filter(opt => opt.count > 0)
            : buildFromEmployeeData('business_function'),
        
        // Departments
        departments: departmentsDropdown && departmentsDropdown.length > 0
            ? departmentsDropdown.map(dept => {
                const count = orgChart?.filter(emp => emp.department === dept.label).length || 0;
                return {
                    value: dept.label,
                    label: dept.label,
                    count: count
                };
            }).filter(opt => opt.count > 0)
            : buildFromEmployeeData('department'),
        
        // Units
        units: unitsDropdown && unitsDropdown.length > 0
            ? unitsDropdown.map(unit => {
                const count = orgChart?.filter(emp => emp.unit === unit.label).length || 0;
                return {
                    value: unit.label,
                    label: unit.label,
                    count: count
                };
            }).filter(opt => opt.count > 0)
            : buildFromEmployeeData('unit'),
        
        // Position Groups
        positionGroups: positionGroupsDropdown && positionGroupsDropdown.length > 0
            ? positionGroupsDropdown.map(pg => {
                const count = orgChart?.filter(emp => emp.position_group === pg.label).length || 0;
                return {
                    value: pg.label,
                    label: pg.label,
                    count: count
                };
            }).filter(opt => opt.count > 0)
            : buildFromEmployeeData('position_group'),
        
        // Statuses
        statuses: employeeStatusesDropdown && employeeStatusesDropdown.length > 0
            ? employeeStatusesDropdown.map(status => {
                const count = orgChart?.filter(emp => emp.status === status.label).length || 0;
                return {
                    value: status.label,
                    label: status.label,
                    count: count
                };
            }).filter(opt => opt.count > 0)
            : buildFromEmployeeData('status'),
        
        // Job Functions
        jobFunctions: buildFromEmployeeData('job_function'),
        
        // Grading Levels
        gradingLevels: buildFromEmployeeData('grading_level'),
        
        // Genders
        genders: buildFromEmployeeData('gender'),
        
        // Managers
        managers: Array.isArray(orgChart)
            ? orgChart
                .filter(emp => emp && emp.direct_reports && emp.direct_reports > 0)
                .map(manager => ({
                    value: manager.employee_id,
                    label: `${manager.name} (${manager.title || 'No Title'})`,
                    count: manager.direct_reports
                }))
                .sort((a, b) => b.count - a.count)
            : []
    };

  

    return options;
}, [
    orgChart,
    businessFunctionsDropdown,
    departmentsDropdown,
    unitsDropdown,
    positionGroupsDropdown,
    employeeStatusesDropdown
]);




  const exportToPNG = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.querySelector('.react-flow');
      if (!element) throw new Error('Chart not found');

      const canvas = await html2canvas(element, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true
      });

      const link = document.createElement('a');
      link.download = `org-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      // Optionally show user-friendly error message
    }
  }, []);

  
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const element = document.querySelector('.org-chart-container');
        if (element && element.requestFullscreen) {
          await element.requestFullscreen();
          actions.setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          actions.setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      // Fallback to UI state toggle
      actions.setIsFullscreen(!isFullscreen);
    }
  }, [actions, isFullscreen]);

  
  useEffect(() => {
    if (Array.isArray(fullTree) && fullTree.length === 0 && !loading.fullTree && !errors.fullTree) {
        console.log('🚀 Auto-loading FULL tree with vacancies...');
        actions.fetchFullTree();
    }
}, [fullTree, loading.fullTree, errors.fullTree, actions]);


  useEffect(() => {
    if (Array.isArray(orgChart) && orgChart.length > 0 && (!expandedNodes || expandedNodes.length === 0)) {
   
      
      let rootEmployees = [];
      
      // Strategy 1: Find employees without line_manager_id
      rootEmployees = orgChart.filter(emp => 
        emp && !emp.line_manager_id && !emp.manager_id && !emp.parent_id
      );
      
      // Strategy 2: Find by minimum level_to_ceo
      if (rootEmployees.length === 0) {
        const levels = orgChart
          .map(emp => emp && emp.level_to_ceo)
          .filter(level => typeof level === 'number');
        
        if (levels.length > 0) {
          const minLevel = Math.min(...levels);
          rootEmployees = orgChart.filter(emp => emp && emp.level_to_ceo === minLevel);
        }
      }
      
      // Strategy 3: Find by maximum direct_reports
      if (rootEmployees.length === 0) {
        const reports = orgChart
          .map(emp => emp && emp.direct_reports)
          .filter(reports => typeof reports === 'number');
        
        if (reports.length > 0) {
          const maxReports = Math.max(...reports);
          if (maxReports > 0) {
            rootEmployees = orgChart.filter(emp => emp && emp.direct_reports === maxReports);
          }
        }
      }
      
      // Strategy 4: Find by position hierarchy
      if (rootEmployees.length === 0) {
        const topPositions = ['VC', 'CEO', 'CHAIRMAN', 'PRESIDENT', 'DIRECTOR'];
        for (const position of topPositions) {
          rootEmployees = orgChart.filter(emp => 
            emp && (
              emp.position_group?.toUpperCase().includes(position) || 
              emp.title?.toUpperCase().includes(position)
            )
          );
          if (rootEmployees.length > 0) break;
        }
      }
      
      // Strategy 5: Fallback to first few employees
      if (rootEmployees.length === 0) {
        rootEmployees = orgChart.slice(0, Math.min(3, orgChart.length)).filter(Boolean);
      }
      
      // Set initial expanded nodes
      const initialExpanded = rootEmployees
        .map(emp => emp.employee_id)
        .filter(id => typeof id === 'string' || typeof id === 'number');
      
      if (initialExpanded.length > 0) {
        console.log('Setting initial expanded nodes:', initialExpanded);
        actions.setExpandedNodes(initialExpanded);
      }
    }
  }, [orgChart, expandedNodes, actions]);




  return {
    // Data
    orgChart,
    fullTree,
    statistics,
    selectedEmployee,
    hierarchy,
    filteredOrgChart,
    reactFlowData,
    summary,
    orgChart: fullTree.length > 0 ? fullTree : orgChart, // ← Prefer fullTree
    fullTree,
    // Filters
    filters,
    activeFilters,
    filterOptions,
    
    // UI State
    viewMode,
    showFilters,
    showLegend,
    isFullscreen,
    expandedNodes,
    layoutDirection,
    
    // Loading & Errors
    loading,
    isLoading,
    refDataLoading,
    errors,
    hasErrors,
    refDataError,
    pagination,
    
    // Actions
    ...actions,
    
    // Utility functions
    getEmployeeById,
    applyPresetFilter,
    debouncedSearch,
    hasActiveFilters,
    exportToPNG,
    toggleFullscreen
  };
};

// FIXED: Simplified hooks for specific use cases
export const useOrgChartFilters = () => {
  const {
    filters,
    activeFilters,
    filterOptions,
    setFilters,
    clearFilters,
    updateFilter,
    hasActiveFilters
  } = useOrgChart();

  return {
    filters,
    activeFilters,
    filterOptions,
    setFilters,
    clearFilters,
    updateFilter,
    hasActiveFilters
  };
};

export const useOrgChartUI = () => {
  const {
    viewMode,
    showFilters,
    showLegend,
    isFullscreen,
    layoutDirection,
    expandedNodes,
    setViewMode,
    setShowFilters,
    setShowLegend,
    setIsFullscreen,
    setLayoutDirection,
    toggleExpandedNode,
    expandAllNodes,
    collapseAllNodes
  } = useOrgChart();

  return {
    viewMode,
    showFilters,
    showLegend,
    isFullscreen,
    layoutDirection,
    expandedNodes,
    setViewMode,
    setShowFilters,
    setShowLegend,
    setIsFullscreen,
    setLayoutDirection,
    toggleExpandedNode,
    expandAllNodes,
    collapseAllNodes
  };
};

export default useOrgChart;