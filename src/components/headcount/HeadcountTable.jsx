
// src/components/headcount/HeadcountTable.jsx - COMPLETE FIXED VERSION
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useToast } from "../common/Toast";
import { useEmployees } from "../../hooks/useEmployees";
import { useVacantPositions } from "../../hooks/useVacantPositions";
import { useReferenceData } from "../../hooks/useReferenceData";

// Import tab content components
import VacantPositionsTable from "./VacantPositionsTable";
import ArchiveEmployeesTable from "./ArchiveEmployeesTable";
import { archiveEmployeesService } from '../../services/vacantPositionsService';
import { initializeColorSystem, getEmployeeColorGroup, getCurrentColorMode } from "./utils/themeStyles";
import HeadcountHeader from "./HeadcountHeader";
import SearchBar from "./SearchBar";
import QuickFilterBar from "./QuickFilterBar";
import AdvancedFilterPanel from "./AdvancedFilterPanel";
import EmployeeTable from "./EmployeeTable";
import Pagination from "./Pagination";
import ActionMenu from "./ActionMenu";
import ColorSelector from "./ColorModeSelector";
import ExportModal from "./ExportModal";
import BulkUploadForm from "./BulkUploadForm";
import { AdvancedMultipleSortingSystem } from "./MultipleSortingSystem";
import LineManagerModal from "./LineManagerAssignModal";
import TagManagementModal from "./TagManagementModalsingle";

const HeadcountTable = ({ businessFunctionFilter = null }) => {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const [activeTab, setActiveTab] = useState('employees');
  
  const {
    formattedEmployees,
    loading,
    error,
    statistics,
    pagination,
    sorting,
    selectedEmployees,
    fetchEmployees,
    fetchStatistics,
    refreshAll,
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    setSelectedEmployees,
    clearFilters,
    setSorting,
    addSort,
    removeSort,
    clearSorting,
    setCurrentPage,
    setPageSize,
    bulkAddTags,
    bulkRemoveTags,
    bulkAssignLineManager,
    bulkExtendContracts,
    exportEmployees,
    downloadEmployeeTemplate,
    showInOrgChart,
    hideFromOrgChart,
    getSortDirection,
    isSorted,
    getSortIndex,
    clearErrors,
  } = useEmployees();

  const { 
    vacantPositionsStats, 
    archiveStats, 
    loading: vacantLoading,
    fetchVacantPositionsStatistics,
  } = useVacantPositions();

  const {
    employeeStatuses,
    departments,
    businessFunctions,
    positionGroups,
    employeeTags,
    units,
    jobFunctions,
    contractConfigs,
    loading: refLoading,
    error: refError
  } = useReferenceData();

  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});
  const [isAdvancedSortingOpen, setIsAdvancedSortingOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showLineManagerModal, setShowLineManagerModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentModalEmployee, setCurrentModalEmployee] = useState(null);
  const [allEmployeesForModal, setAllEmployeesForModal] = useState(null);
  const [fetchingAllEmployees, setFetchingAllEmployees] = useState(false);
  
  const [colorSystemInitialized, setColorSystemInitialized] = useState(false);
  const [currentColorMode, setCurrentColorMode] = useState('null');
  const [defaultSortingApplied, setDefaultSortingApplied] = useState(false);
  const [isWrapperFilterApplied, setIsWrapperFilterApplied] = useState(false);

  useEffect(() => {
    if (loading.exporting !== undefined) {
      setIsExporting(loading.exporting);
    }
  }, [loading.exporting]);

  // ✅ CRITICAL: Local filters store IDs (not names)
  const [localFilters, setLocalFilters] = useState({
    search: "",
    employee_search: [],
    line_manager_search: "",
    job_title_search: "",
    status: [],
    department: [],
    business_function: [], // ✅ Stores IDs like [1, 2, 3]
    position_group: [],
    tags: [],
    grading_level: [],
    contract_duration: [],
    line_manager: [],
    gender: [],
    start_date_from: "",
    start_date_to: "",
    contract_end_date_from: "",
    contract_end_date_to: "",
    years_of_service_min: "",
    years_of_service_max: "",
    is_active: "",
    is_visible_in_org_chart: "",
    status_needs_update: "",
    contract_expiring_days: ""
  });

  const initialized = useRef(false);
  const lastFetchTime = useRef(0);
  const debounceRef = useRef(null);
  const lastApiParamsRef = useRef(null);
  const colorSystemInitRef = useRef(false);

  // Color system initialization
  useEffect(() => {
    if (colorSystemInitRef.current || colorSystemInitialized) return;
    
    const isRefLoading = typeof refLoading === 'object' 
      ? Object.values(refLoading || {}).some(loading => loading === true)
      : refLoading;
    
    if (isRefLoading) return;
    
    const hasReferenceData = (
      (positionGroups && positionGroups.length > 0) ||
      (departments && departments.length > 0) ||
      (businessFunctions && businessFunctions.length > 0) ||
      (units && units.length > 0) ||
      (jobFunctions && jobFunctions.length > 0)
    );
    
    if (!hasReferenceData) return;
    
    try {
      colorSystemInitRef.current = true;
      setColorSystemInitialized(true);
      
      const referenceData = {
        positionGroups: positionGroups || [],
        departments: departments || [],
        businessFunctions: businessFunctions || [],
        units: units || [],
        jobFunctions: jobFunctions || [],
        employeeTags: employeeTags || []
      };

      initializeColorSystem(referenceData);
      const initialMode = getCurrentColorMode();
      setCurrentColorMode(initialMode);
      
    } catch (error) {
      showError('Failed to initialize color system');
      colorSystemInitRef.current = false;
      setColorSystemInitialized(false);
    }
    
  }, [
    refLoading,
    positionGroups,
    departments, 
    businessFunctions,
    units,
    jobFunctions,
    employeeTags,
    colorSystemInitialized,
    showError
  ]);

  // Employees with color grouping
  const employeesWithColorGrouping = useMemo(() => {
    if (!formattedEmployees || formattedEmployees.length === 0) {
      return [];
    }
    
    return formattedEmployees.map(employee => ({
      ...employee,
      colorGroup: getEmployeeColorGroup(employee)
    }));
  }, [formattedEmployees, currentColorMode]);

  // Default sorting
  useEffect(() => {
    if (
      colorSystemInitialized && 
      employeesWithColorGrouping.length > 0 && 
      (!sorting || sorting.length === 0) && 
      !defaultSortingApplied
    ) {
      let sortField = '';
      switch (currentColorMode) {
        case 'HIERARCHY': sortField = 'position_group_name'; break;
        case 'DEPARTMENT': sortField = 'department_name'; break;
        case 'BUSINESS_FUNCTION': sortField = 'business_function_name'; break;
        case 'UNIT': sortField = 'unit_name'; break;
        case 'JOB_FUNCTION': sortField = 'job_function_name'; break;
        case 'GRADE': sortField = 'grading_level'; break;
        default: sortField = 'position_group_name';
      }
      
      if(currentColorMode){
        setSorting({ 
          multiple: [{ field: sortField, direction: 'asc' }]
        });
      }
      
      setDefaultSortingApplied(true);
    }
  }, [
    colorSystemInitialized, 
    employeesWithColorGrouping.length, 
    sorting, 
    defaultSortingApplied, 
    currentColorMode,
    setSorting
  ]);

  const handleColorModeChange = useCallback((newMode) => {
  if (newMode === currentColorMode) return;
  
  // ✅ CRITICAL: Save wrapper filter BEFORE clearing anything
  const preservedBFFilter = isWrapperFilterApplied 
    ? [...localFilters.business_function] 
    : [];
  
  console.log('🎨 Color mode changing, preserving filter:', preservedBFFilter);
  
  setCurrentColorMode(newMode);
  setDefaultSortingApplied(false);
  clearSorting();
  
  // ✅ IMMEDIATELY restore the filter
  if (preservedBFFilter.length > 0) {
    setLocalFilters(prev => ({
      ...prev,
      business_function: preservedBFFilter
    }));
  }
  
  setCurrentPage(1);
}, [
  currentColorMode, 
  clearSorting, 
  setCurrentPage, 
  isWrapperFilterApplied, 
  localFilters.business_function
]);

  useEffect(() => {
    const initializeAllStats = async () => {
      try {
        if (activeTab === 'employees') {
          await fetchStatistics();
        }
        await Promise.all([
          fetchVacantPositionsStatistics(),
        ]);
      } catch (error) {
        console.error('Failed to initialize tab statistics:', error);
        showError('Failed to load statistics');
      }
    };

    if (!initialized.current) {
      initializeAllStats();
    }
  }, [activeTab, fetchStatistics, fetchVacantPositionsStatistics, showError]);

  // ========================================
  // 🎯 BUILD API PARAMS - Convert to backend format
  // ========================================
  const buildApiParams = useCallback(() => {
    const params = {
      page: pagination.page || 1,
      page_size: pagination.pageSize || 25
    };

    if (localFilters.search?.trim()) {
      params.search = localFilters.search.trim();
    }

    if (sorting && sorting.length > 0) {
      const orderingFields = sorting.map(sort => 
        sort.direction === 'desc' ? `-${sort.field}` : sort.field
      );
      params.ordering = orderingFields.join(',');
    }
if (isWrapperFilterApplied && localFilters.business_function.length > 0) {
    params.business_function = localFilters.business_function.join(',');
    console.log('🔒 Wrapper filter enforced in buildApiParams:', params.business_function);
  }
    const multiSelectFilters = [
      'business_function', 'department', 'unit', 'job_function', 'position_group',
      'status', 'grading_level', 'contract_duration', 'line_manager', 'tags', 'gender', 'employee_search'
    ];

    multiSelectFilters.forEach(filterKey => {
      if (localFilters[filterKey]) {
        if (Array.isArray(localFilters[filterKey])) {
          const cleanValues = localFilters[filterKey].filter(val => 
            val !== null && val !== undefined && val !== ''
          );
          if (cleanValues.length > 0) {
            // ✅ CRITICAL: Convert to comma-separated string
            params[filterKey] = cleanValues.join(',');
          }
        } else if (typeof localFilters[filterKey] === 'string') {
          const trimmed = localFilters[filterKey].trim();
          if (trimmed) {
            params[filterKey] = trimmed;
          }
        }
      }
    });

    if (localFilters.line_manager_search?.trim()) {
      params.line_manager_search = localFilters.line_manager_search.trim();
    }
    if (localFilters.job_title_search?.trim()) {
      params.job_title_search = localFilters.job_title_search.trim();
    }
    
    if (localFilters.start_date_from) params.start_date_from = localFilters.start_date_from;
    if (localFilters.start_date_to) params.start_date_to = localFilters.start_date_to;
    if (localFilters.contract_end_date_from) params.contract_end_date_from = localFilters.contract_end_date_from;
    if (localFilters.contract_end_date_to) params.contract_end_date_to = localFilters.contract_end_date_to;
    if (localFilters.years_of_service_min) params.years_of_service_min = localFilters.years_of_service_min;
    if (localFilters.years_of_service_max) params.years_of_service_max = localFilters.years_of_service_max;

    if (localFilters.is_active && localFilters.is_active !== "") {
      params.is_active = localFilters.is_active === "true";
    }
    if (localFilters.is_visible_in_org_chart && localFilters.is_visible_in_org_chart !== "") {
      params.is_visible_in_org_chart = localFilters.is_visible_in_org_chart === "true";
    }
    if (localFilters.status_needs_update && localFilters.status_needs_update !== "") {
      params.status_needs_update = localFilters.status_needs_update === "true";
    }

    if (localFilters.contract_expiring_days) {
      params.contract_expiring_days = parseInt(localFilters.contract_expiring_days);
    }

    
    
    return params;
  }, [localFilters, pagination.page, pagination.pageSize, sorting]);

  const apiParamsChanged = useMemo(() => {
    if (!lastApiParamsRef.current) {
      return true;
    }
    
    const currentParams = buildApiParams();
    const lastParams = lastApiParamsRef.current;
    
    const currentStr = JSON.stringify(currentParams);
    const lastStr = JSON.stringify(lastParams);
    
    const changed = currentStr !== lastStr;
    
  
    
    return changed;
  }, [buildApiParams]);

  const debouncedFetchEmployees = useCallback((params, immediate = false) => {
    const paramsStr = JSON.stringify(params);
    const lastParamsStr = lastApiParamsRef.current ? JSON.stringify(lastApiParamsRef.current) : null;
    
    if (paramsStr === lastParamsStr && !immediate) {
    
      return;
    }

    const delay = immediate ? 0 : 500;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const now = Date.now();
      if (now - lastFetchTime.current > 100) {
    
        lastFetchTime.current = now;
        lastApiParamsRef.current = params;
        fetchEmployees(params);
      } 
    }, delay);
  }, [fetchEmployees]);

  // ✅ WRAPPER FILTER EFFECT - Set business_function ID
  useEffect(() => {
    if (!businessFunctions || businessFunctions.length === 0) {
      return;
    }

    if (businessFunctionFilter) {
      const bf = businessFunctions.find(b => b.code === businessFunctionFilter);
      
      if (bf) {
        // ✅ CRITICAL: Get ID as NUMBER
        const bfId = Number(bf.id || bf.value);
        
        setLocalFilters(prev => {
          const currentIds = prev.business_function.map(id => Number(id));
          
          if (currentIds.length === 1 && currentIds[0] === bfId) {
          
            return prev;
          }
          
          
          return {
            ...prev,
            business_function: [bfId] // ✅ Array with single NUMBER ID
          };
        });
        
        setIsWrapperFilterApplied(true);
      } else {
        console.warn('⚠️ Business function not found for code:', businessFunctionFilter);
      }
    } else {
      setLocalFilters(prev => {
        if (prev.business_function.length === 0) {
          return prev;
        }
        
      
        return {
          ...prev,
          business_function: []
        };
      });
      
      setIsWrapperFilterApplied(false);
    }
  }, [businessFunctionFilter, businessFunctions]);

  // ✅ INITIALIZATION EFFECT
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) {
        return;
      }
      
      // ✅ Wait for businessFunctions to load
      if (!businessFunctions || businessFunctions.length === 0) {
     
        return;
      }
      
      // ✅ CRITICAL: If wrapper filter exists, wait for it to be applied
      if (businessFunctionFilter) {
        if (localFilters.business_function.length === 0) {

          return;
        }
     
      }
      
      try {
       
        initialized.current = true;
        clearErrors();
        
        // Fetch statistics first
        await fetchStatistics();
        
        // Build params and fetch employees
        const params = buildApiParams();
     
        
        lastApiParamsRef.current = params;
        await fetchEmployees(params);
        
    
        
      } catch (error) {
        console.error('❌ Initialize failed:', error);
        showError('Failed to initialize data');
        initialized.current = false;
      }
    };

    initializeData();
  }, [
    businessFunctionFilter, 
    businessFunctions, 
    localFilters.business_function,
    buildApiParams,
    fetchEmployees,
    fetchStatistics, 
    clearErrors, 
    showError
  ]);

  // ✅ DATA FETCHING EFFECT - Only after initialization
  // ✅ DATA FETCHING EFFECT - Only after initialization
useEffect(() => {
  if (!initialized.current) {
    return;
  }

  if (!apiParamsChanged) {
    return;
  }

  const params = buildApiParams();
  
  // ✅ CRITICAL: Preserve wrapper filter during pagination
  if (isWrapperFilterApplied && localFilters.business_function.length > 0) {
    // Ensure business_function is always included in params
    params.business_function = localFilters.business_function.join(',');
    console.log('🔒 Preserving wrapper filter in API call:', params.business_function);
  }

  debouncedFetchEmployees(params);
}, [apiParamsChanged, buildApiParams, debouncedFetchEmployees, isWrapperFilterApplied, localFilters.business_function]);

  const refreshAllData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        lastApiParamsRef.current = null;
      }
      
      await Promise.all([
        fetchStatistics(),
        fetchEmployees(buildApiParams())
      ]);
      
      lastApiParamsRef.current = { ...buildApiParams() };
     
    } catch (error) {
      console.error('Data refresh failed:', error);
      showError('Failed to refresh data');
    }
  }, [fetchStatistics, fetchEmployees, buildApiParams, showInfo, showSuccess, showError]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setIsAdvancedFilterOpen(false);
    setIsActionMenuOpen(false);
    setIsAdvancedSortingOpen(false);
    setIsExportModalOpen(false);
    setIsBulkUploadOpen(false);
    clearSelection();
  }, [clearSelection, showInfo]);

  const combinedStatistics = useMemo(() => ({
    ...statistics,
    total_employees: statistics?.total_employees || 0,
  }), [statistics]);

  const handleToggleAdvancedSorting = useCallback(() => {
    setIsAdvancedSortingOpen(prev => !prev);
  }, []);

  const handleSortingChange = useCallback((newSorting) => {
    if (newSorting.length === 0) {
      clearSorting();
    } else if (newSorting.length === 1) {
      setSorting({ field: newSorting[0].field, direction: newSorting[0].direction });
    } else {
      setSorting({ multiple: newSorting });
    }
    setCurrentPage(1);
    showInfo(`Sorting updated: ${newSorting.length} level(s)`);
  }, [setSorting, clearSorting, setCurrentPage, showInfo]);

  const handleClearAllSorting = useCallback(() => {
    clearSorting();
    setCurrentPage(1);
    showInfo('All sorting cleared');
  }, [clearSorting, setCurrentPage, showInfo]);

  // ========================================
  // 🎯 FILTER HANDLERS
  // ========================================
  const handleSearchChange = useCallback((value) => {
  setLocalFilters(prev => {
    // ✅ Preserve business_function filter
    return {
      ...prev,
      search: value,
      business_function: isWrapperFilterApplied ? prev.business_function : []
    };
  });
  setCurrentPage(1);
}, [setCurrentPage, isWrapperFilterApplied]);

const handleStatusChange = useCallback((selectedStatuses) => {
  setLocalFilters(prev => ({
    ...prev,
    status: Array.isArray(selectedStatuses) ? selectedStatuses : [],
    business_function: isWrapperFilterApplied ? prev.business_function : [] // ✅ Preserve
  }));
  setCurrentPage(1);
}, [setCurrentPage, isWrapperFilterApplied]);

// Apply same pattern to all filter handlers...
  const handleDepartmentChange = useCallback((selectedDepartments) => {
    setLocalFilters(prev => ({ ...prev, department: Array.isArray(selectedDepartments) ? selectedDepartments : [] }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleBusinessFunctionChange = useCallback((selectedBFs) => {
    if (isWrapperFilterApplied) {
      showWarning('Company is filtered by company selection');
      return;
    }
    
    setLocalFilters(prev => ({ ...prev, business_function: Array.isArray(selectedBFs) ? selectedBFs : [] }));
    setCurrentPage(1);
  }, [isWrapperFilterApplied, showWarning, setCurrentPage]);

  const handlePositionGroupChange = useCallback((selectedPGs) => {
    setLocalFilters(prev => ({ ...prev, position_group: Array.isArray(selectedPGs) ? selectedPGs : [] }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleApplyAdvancedFilters = useCallback((filters) => {
    const processedFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        processedFilters[key] = value;
      } else if (typeof value === 'string' && value.includes(',')) {
        processedFilters[key] = value.split(',').map(v => v.trim()).filter(v => v);
      } else {
        processedFilters[key] = value;
      }
    });
    
    setLocalFilters(prev => ({ ...prev, ...processedFilters }));
    setCurrentPage(1);
    showInfo('Advanced filters applied');
  }, [setCurrentPage, showInfo]);

  const handleClearFilter = useCallback((key) => {
    if (key === 'business_function' && isWrapperFilterApplied) {
      showWarning('Company is filtered by company selection');
      return;
    }
    
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      if (Array.isArray(prev[key])) {
        newFilters[key] = [];
      } else {
        newFilters[key] = "";
      }
      
      return newFilters;
    });
    
    setCurrentPage(1);
    showInfo(`${key} filter cleared`);
  }, [isWrapperFilterApplied, showWarning, setCurrentPage, showInfo]);

  const handleClearAllFilters = useCallback(() => {
    const clearedFilters = {
      search: "",
      employee_search: [],
      line_manager_search: "",
      job_title_search: "",
      status: [],
      department: [],
      business_function: isWrapperFilterApplied ? localFilters.business_function : [],
      position_group: [],
      tags: [],
      grading_level: [],
      contract_duration: [],
      line_manager: [],
      gender: [],
      start_date_from: "",
      start_date_to: "",
      contract_end_date_from: "",
      contract_end_date_to: "",
      years_of_service_min: "",
      years_of_service_max: "",
      is_active: "",
      is_visible_in_org_chart: "",
      status_needs_update: "",
      contract_expiring_days: ""
    };
    
    setLocalFilters(clearedFilters);
    clearFilters();
    setCurrentPage(1);
    showSuccess('All filters cleared');
  }, [isWrapperFilterApplied, localFilters.business_function, clearFilters, setCurrentPage, showSuccess]);

  // Selection handlers
  const handleEmployeeToggle = useCallback((employeeId) => {
    toggleEmployeeSelection(employeeId);
  }, [toggleEmployeeSelection]);

  const handleSelectAll = useCallback(() => {
    if (selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0) {
      clearSelection();  
    } else {
      const allIds = formattedEmployees.map(emp => emp.id);
      setSelectedEmployees(allIds);      
    }
  }, [selectedEmployees.length, formattedEmployees, clearSelection, setSelectedEmployees, showInfo]);

  const handleVisibilityChange = useCallback(async (employeeId, newVisibility) => {
    try {
      setEmployeeVisibility(prev => ({
        ...prev,
        [employeeId]: newVisibility
      }));

      if (newVisibility) {
        await showInOrgChart([employeeId]);
        showSuccess('Employee made visible in org chart');
      } else {
        await hideFromOrgChart([employeeId]);
        showSuccess('Employee hidden from org chart');
      }
      
    } catch (error) {
      setEmployeeVisibility(prev => ({
        ...prev,
        [employeeId]: !newVisibility
      }));
      
      showError(`Failed to update visibility: ${error.message}`);
    }
  }, [showInOrgChart, hideFromOrgChart, showSuccess, showError]);
  
  const handleSort = useCallback((field, ctrlKey = false) => {
    if (ctrlKey) {
      const currentDirection = getSortDirection(field);
      let newDirection;
      
      if (!currentDirection) {
        newDirection = 'asc';
      } else if (currentDirection === 'asc') {
        newDirection = 'desc';
      } else {
        removeSort(field);
        return;
      }
      
      addSort(field, newDirection);
    } else {
      const currentDirection = getSortDirection(field);
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSorting({ field, direction: newDirection });
    }
  }, [getSortDirection, addSort, removeSort, setSorting]);

  const handleBulkAction = useCallback(async (action, options = {}) => {
    setIsActionMenuOpen(false);

    if (selectedEmployees.length === 0 && !['export', 'downloadTemplate', 'bulkImport', 'refresh'].includes(action)) {
      showWarning("Please select employees first!");
      return;
    }

    try {
      let result;
      
      switch (action) {
        case "refresh":
          await refreshAllData(true);
          break;

        case "export":
          setIsExportModalOpen(true);
          break;

        case "bulkImport":
          setIsBulkUploadOpen(true);
          break;

        case "downloadTemplate":
          try {
            result = await downloadEmployeeTemplate();
            showSuccess('Template downloaded successfully!');
          } catch (error) {
            console.error('Template download failed:', error);
            showError('Template download failed: ' + error.message);
          }
          break;

        case "softDelete":
          const softDeleteMessage = `Are you sure you want to soft delete ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}?\n\nThis will:\n- Mark employees as inactive\n- Create vacant positions for their roles\n- Allow future restoration`;
          
          if (confirm(softDeleteMessage)) {
            try {
              result = await archiveEmployeesService.bulkSoftDeleteEmployees(selectedEmployees);
              clearSelection();
              await refreshAllData(true);
              showSuccess(`${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} soft deleted successfully`);
            } catch (error) {
              console.error('Soft delete failed:', error);
              showError(`Soft delete failed: ${error.message}`);
            }
          }
          break;

        case "hardDelete":
          const hardDeleteMessage = `⚠️ WARNING: PERMANENT DELETION\n\nAre you sure you want to permanently delete ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}?\n\nThis will:\n- Permanently remove employees from the system\n- Create archive records for audit purposes\n- CANNOT be undone\n\nType "DELETE" to confirm this permanent action.`;
          
          const confirmation = prompt(hardDeleteMessage);
          
          if (confirmation === "DELETE") {
            try {
              const notes = "hard delete";
              showWarning('Processing permanent deletion...');
              
              result = await archiveEmployeesService.bulkHardDeleteEmployees(
                selectedEmployees, 
                notes, 
                true
              );
              
              clearSelection();
              await refreshAllData(true);
              showSuccess(`${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} permanently deleted`);
              
            } catch (error) {
              console.error('Hard delete failed:', error);
              showError(`Hard delete failed: ${error.message}`);
            }
          } else if (confirmation !== null) {
            showWarning('Hard delete cancelled. You must type "DELETE" exactly to confirm permanent deletion.');
          }
          break;

        case "showInOrgChart":
          try {
            await showInOrgChart(selectedEmployees);
            clearSelection();
            await refreshAllData(true);
            showSuccess(`${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} now visible in org chart!`);
          } catch (error) {
            console.error('Show in org chart failed:', error);
            showError('Show in org chart failed: ' + error.message);
          }
          break;

        case "hideFromOrgChart":
          try {
            await hideFromOrgChart(selectedEmployees);
            clearSelection();
            await refreshAllData(true);
            showSuccess(`${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} hidden from org chart!`);
          } catch (error) {
            console.error('Hide from org chart failed:', error);
            showError('Hide from org chart failed: ' + error.message);
          }
          break;

        case "bulkAddTags":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              tag_id: options.tag_id
            };
            
            showInfo('Adding tags...');
            result = await bulkAddTags(payload.employee_ids, payload.tag_id);
            clearSelection();
            await refreshAllData(true);
            showSuccess(`Tags added to ${payload.employee_ids.length} employee${payload.employee_ids.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('Tag addition failed:', error);
            showError('Tag addition failed: ' + error.message);
          }
          break;

        case "bulkRemoveTags":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              tag_id: options.tag_id
            };
            
            result = await bulkRemoveTags(payload.employee_ids, payload.tag_id);
            clearSelection();
            await refreshAllData(true);
            showSuccess(`Tags removed from ${payload.employee_ids.length} employee${payload.employee_ids.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            showError('Tag removal failed: ' + error.message);
          }
          break;

        case "bulkAssignLineManager":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              line_manager_id: options.line_manager_id
            };

            result = await bulkAssignLineManager(payload.employee_ids, payload.line_manager_id);
            clearSelection();
            await refreshAllData(true);
            
            const managerName = result?.line_manager_info?.name || 'Line Manager';
            showSuccess(`Line manager assigned to ${payload.employee_ids.length} employees!`);
          } catch (error) {
            console.error('Line manager assignment failed:', error);
            showError('Line manager assignment failed: ' + error.message);
          }
          break;

        case "bulkExtendContracts":
          try {
            result = await bulkExtendContracts({
              employee_ids: selectedEmployees,
              new_contract_type: options.new_contract_type,
              new_start_date: options.new_start_date,
              reason: options.reason
            });
            
            clearSelection();
            await refreshAllData(true);
            showSuccess(`Contracts extended for ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
          
            showError('Contract extension failed: ' + error.message);
          }
          break;

        default:
          console.warn('Unknown bulk action:', action);
     
      }
    } catch (error) {
      console.error(`Bulk action ${action} failed:`, error);
      showError(`${action} failed. Error: ${error.message}`);
    }
  }, [
    selectedEmployees,
    clearSelection,
    refreshAllData,
    bulkAddTags,
    bulkRemoveTags,
    bulkAssignLineManager,
    bulkExtendContracts,
    downloadEmployeeTemplate,
    showInOrgChart,
    hideFromOrgChart,
    showInfo,
    showSuccess,
    showError,
    showWarning
  ]);

  const handleToggleActionMenu = useCallback(() => {
    setIsActionMenuOpen(prev => !prev);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setIsActionMenuOpen(false);
  }, []);

  const handleExport = useCallback(async (exportOptions) => {
    try {
      setIsExporting(true);

      let apiEndpoint;
      let apiPayload;
      let queryParams = {};

      switch (exportOptions.type) {
        case "selected":
          if (!selectedEmployees || selectedEmployees.length === 0) {
            throw new Error("No employees selected for export!");
          }
          
          apiEndpoint = 'export_selected';
          apiPayload = {
            employee_ids: selectedEmployees,
            export_format: exportOptions.format || 'excel'
          };
          
          if (exportOptions.include_fields && Array.isArray(exportOptions.include_fields) && exportOptions.include_fields.length > 0) {
            apiPayload.include_fields = exportOptions.include_fields;
          }
          break;

        case "filtered":
          apiEndpoint = 'export_selected';
          
          const filterParams = { ...buildApiParams() };
          delete filterParams.page;
          delete filterParams.page_size;
          
          apiPayload = {
            export_format: exportOptions.format || 'excel'
          };
          
          if (exportOptions.include_fields && Array.isArray(exportOptions.include_fields) && exportOptions.include_fields.length > 0) {
            apiPayload.include_fields = exportOptions.include_fields;
          }
          
          queryParams = filterParams;
          break;

        case "all":
          apiEndpoint = 'export_selected';
          apiPayload = {
            export_format: exportOptions.format || 'excel'
          };
          
          if (exportOptions.include_fields && Array.isArray(exportOptions.include_fields) && exportOptions.include_fields.length > 0) {
            apiPayload.include_fields = exportOptions.include_fields;
          }
          break;

        default:
          throw new Error(`Unknown export type: ${exportOptions.type}`);
      }

      const result = await exportEmployees(exportOptions.format || 'excel', {
        ...apiPayload,
        _queryParams: queryParams
      });
      
      const exportTypeLabel = exportOptions.type === "selected" 
        ? `${selectedEmployees?.length || 0} selected` 
        : exportOptions.type === "filtered" 
        ? "filtered"
        : "all";
      
      const fieldsCount = exportOptions.include_fields?.length || 'default';
      showSuccess(`Export completed! ${exportTypeLabel} employees exported with ${fieldsCount} fields.`);
      
      return result;

    } catch (error) {
      console.error('Export error:', error);
      
      let userFriendlyMessage = error.message || "Export failed. Please try again.";
      
      if (error.message?.includes('No employees selected')) {
        userFriendlyMessage = "Please select at least one employee to export.";
      } else if (error.message?.includes('Invalid fields')) {
        userFriendlyMessage = "Some selected fields are not available. Please check your field selection.";
      } else if (error.message?.includes('No data received')) {
        userFriendlyMessage = "Export failed - no data returned from server. Please check your selection.";
      }
      
      showError(`Export failed: ${userFriendlyMessage}`);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [selectedEmployees, buildApiParams, exportEmployees, showInfo, showSuccess, showError]);

  const handleQuickExport = useCallback(async (exportOptions) => {
    try {
      setIsExporting(true);
      await handleExport(exportOptions);
    } catch (error) {
      showError(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  }, [handleExport, showError]);

  const handleBulkImportComplete = useCallback(async (result) => {
    try {
      await refreshAllData(true);
      setIsBulkUploadOpen(false);
      
      if (result?.imported_count) {
        showSuccess(`Successfully imported ${result.imported_count} employees!`);
      } else {
        showSuccess('Bulk import completed successfully!');
      }
    } catch (error) {
      setIsBulkUploadOpen(false);
      showError('Import completed but failed to refresh data');
    }
  }, [refreshAllData, showSuccess, showError]);

  const handleToggleExportModal = useCallback(() => {
    setIsExportModalOpen(prev => !prev);
  }, []);

  const fetchAllEmployeesForModal = useCallback(async (options = {}) => {
    const shouldSkipCache = options?.skipCache;
    
    if (allEmployeesForModal && !shouldSkipCache && Array.isArray(allEmployeesForModal) && allEmployeesForModal.length > 0) {
      return Promise.resolve(allEmployeesForModal);
    }
    
    try {
      setFetchingAllEmployees(true);

      if (shouldSkipCache) {
        setAllEmployeesForModal(null);
      }
      
      const params = {
        page: 1,
        page_size: 10000
      };
      
      const response = await fetchEmployees(params);
      
      let employees = [];
      
      if (response) {
        if (Array.isArray(response)) {
          employees = response;
        }
        else if (response.data && Array.isArray(response.data)) {
          employees = response.data;
        }
        else if (response.results && Array.isArray(response.results)) {
          employees = response.results;
        }
        else if (response.data && response.data.results && Array.isArray(response.data.results)) {
          employees = response.data.results;
        }
        else if (response.payload && Array.isArray(response.payload)) {
          employees = response.payload;
        }
        else if (response.payload && response.payload.data && Array.isArray(response.payload.data)) {
          employees = response.payload.data;
        }
      }
      
      if (employees.length === 0) {
        console.warn('No employees extracted from response');
        return [];
      }
      
      const validEmployees = employees.filter(emp => {
        if (!emp) return false;
        const hasId = emp.id || emp.employee_id;
        if (!hasId) return false;
        const hasName = emp.name || emp.employee_name || emp.first_name || emp.last_name;
        if (!hasName) return false;
        return true;
      });

      setAllEmployeesForModal(validEmployees);
      return validEmployees;
      
    } catch (error) {
      console.error('Error fetching employees for modal:', error);
      showError('Failed to fetch employees for modal');
      
      if (!allEmployeesForModal && formattedEmployees && formattedEmployees.length > 0) {
        setAllEmployeesForModal(formattedEmployees);
        return formattedEmployees;
      }
      
      setAllEmployeesForModal([]);
      throw error;
      
    } finally {
      setFetchingAllEmployees(false);
    }
  }, [allEmployeesForModal, fetchEmployees, formattedEmployees, showError]);

  const handleEmployeeAction = useCallback(async (employeeId, action) => {
    const employee = formattedEmployees.find(emp => emp.id === employeeId);
    
    try {
      switch (action) {
        case "changeManager":
          setCurrentModalEmployee(employee);
          setShowLineManagerModal(true);
          
          if (!allEmployeesForModal) {
            fetchAllEmployeesForModal().catch(error => {
              console.warn('Pre-fetch failed, will try again when modal opens:', error);
            });
          }
          break;

        case "manageTag":
          setCurrentModalEmployee(employee);
          setShowTagModal(true);
          break;

        case "toggleVisibility":
          const currentVisibility = employee?.is_visible_in_org_chart !== false;
          const newVisibility = !currentVisibility;
          
          await handleVisibilityChange(employeeId, newVisibility);
          break;

        case "softDelete":
          const employeeName = employee?.name || employee?.employee_name || `Employee ${employeeId}`;
          
          if (confirm(`Soft delete ${employeeName}?\n\nThis will create a vacant position and allow future restoration.`)) {
            try {
              const reason = prompt("Please provide a reason for soft deletion (optional):");
              
              await archiveEmployeesService.bulkSoftDeleteEmployees([employeeId], reason);
              await refreshAllData(true);
              showSuccess(`${employeeName} soft deleted successfully`);
              
            } catch (error) {
              console.error('Individual soft delete failed:', error);
              showError(`Failed to soft delete ${employeeName}: ${error.message}`);
            }
          }
          break;

        case "delete":
        case "hardDelete":
          const empName = employee?.name || employee?.employee_name || `Employee ${employeeId}`;
          const confirmation = prompt(`⚠️ WARNING: PERMANENT DELETION\n\nType "DELETE" to permanently delete ${empName}:`);
          
          if (confirmation === "DELETE") {
            try {
              const notes = prompt("Please provide notes for this deletion (optional but recommended):");
              showWarning('Processing permanent deletion...');
              
              await archiveEmployeesService.bulkHardDeleteEmployees([employeeId], notes, true);
              await refreshAllData(true);
              showSuccess(`${empName} permanently deleted`);
              
            } catch (error) {
              showError(`Failed to delete ${empName}: ${error.message}`);
            }
          } else if (confirmation !== null) {
            showWarning('Deletion cancelled. You must type "DELETE" exactly to confirm.');
          }
          break;

        case "viewTeam":
          showInfo(`Team view for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        case "edit":
          break;

        case "viewJobDescription":
          showInfo(`Job Description for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        case "competencyMatrix":
          showInfo(`Competency Matrix for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        case "performanceManagement":
          showInfo(`Performance Management for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        default:
          showWarning(`Action "${action}" is not implemented yet`);
      }
    } catch (error) {
      showError(`Failed to ${action}: ${error.message}`);
    }
  }, [
    formattedEmployees, 
    refreshAllData, 
    handleVisibilityChange,
    allEmployeesForModal, 
    fetchAllEmployeesForModal,
    showInfo,
    showSuccess,
    showError,
    showWarning
  ]);

  const handleLineManagerAssign = useCallback(async (managerId) => {
    try {
      if (!currentModalEmployee) {
        throw new Error('No employee selected for line manager assignment');
      }
      
      await bulkAssignLineManager([currentModalEmployee.id], managerId);
      
      setShowLineManagerModal(false);
      setCurrentModalEmployee(null);
      
      await refreshAllData();
      
      const manager = allEmployeesForModal?.find(emp => emp.id === managerId);
      const managerName = manager?.name || manager?.employee_name || 'Selected manager';
      
      showSuccess(`${managerName} assigned as line manager successfully!`);
      
    } catch (error) {
      console.error('Line manager assignment failed:', error);
      showError(`Failed to assign line manager: ${error.message}`);
    }
  }, [currentModalEmployee, bulkAssignLineManager, refreshAllData, allEmployeesForModal, showInfo, showSuccess, showError]);

  const handleTagOperation = useCallback(async (operation, tagId) => {
    try {
      if (!currentModalEmployee) {
        throw new Error('No employee selected for tag operation');
      }
      

      if (operation === 'add') {
        await bulkAddTags([currentModalEmployee.id], tagId);
      } else if (operation === 'remove') {
        await bulkRemoveTags([currentModalEmployee.id], tagId);
      } else {
        throw new Error(`Unknown tag operation: ${operation}`);
      }
      
      setShowTagModal(false);
      setCurrentModalEmployee(null);
      
      await refreshAllData();
      
    
    
    } catch (error) {
      console.error(`Tag ${operation} failed:`, error);
      showError(`Failed to ${operation} tag: ${error.message}`);
    }
  }, [currentModalEmployee, bulkAddTags, bulkRemoveTags, refreshAllData, showInfo, showSuccess, showError]);

  const handleLineManagerModalClose = useCallback(() => {
    setShowLineManagerModal(false);
    setCurrentModalEmployee(null);
  }, []);

  const handleTagModalClose = useCallback(() => {
    setShowTagModal(false);
    setCurrentModalEmployee(null);
  }, []);

  // Active filters
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (localFilters.search) {
      filters.push({ key: "search", label: `Search: ${localFilters.search}` });
    }
    if (localFilters.employee_search?.length > 0) {
      filters.push({ 
        key: "employee_search", 
        label: localFilters.employee_search.length === 1 
          ? `Employee: 1 selected` 
          : `Employees: ${localFilters.employee_search.length} selected`
      });
    }
    if (localFilters.status?.length > 0) {
      filters.push({ 
        key: "status", 
        label: localFilters.status.length === 1 
          ? `Status: ${localFilters.status[0]}` 
          : `Status: ${localFilters.status.length} selected`
      });
    }
    if (localFilters.department?.length > 0) {
      filters.push({ 
        key: "department", 
        label: `Department: ${localFilters.department.length} selected`
      });
    }
    if (localFilters.business_function?.length > 0) {
      filters.push({ 
        key: "business_function", 
        label: `Company: ${localFilters.business_function.length} selected`,
        isWrapperFilter: isWrapperFilterApplied
      });
    }
    if (localFilters.position_group?.length > 0) {
      filters.push({ 
        key: "position_group", 
        label: `Hierarchy: ${localFilters.position_group.length} selected`
      });
    }
    if (localFilters.tags?.length > 0) {
      filters.push({ 
        key: "tags", 
        label: `Tags: ${localFilters.tags.length} selected`
      });
    }
    if (localFilters.grading_level?.length > 0) {
      filters.push({ 
        key: "grading_level", 
        label: `Grades: ${localFilters.grading_level.length} selected`
      });
    }
    if (localFilters.line_manager?.length > 0) {
      filters.push({ 
        key: "line_manager", 
        label: `Line Manager: ${localFilters.line_manager.length} selected`
      });
    }
    if (localFilters.contract_duration?.length > 0) {
      filters.push({ 
        key: "contract_duration", 
        label: `Contract: ${localFilters.contract_duration.length} selected`
      });
    }
    if (localFilters.gender?.length > 0) {
      filters.push({ 
        key: "gender", 
        label: `Gender: ${localFilters.gender.length} selected`
      });
    }
    if (localFilters.line_manager_search) {
      filters.push({ 
        key: "line_manager_search", 
        label: `Manager Search: ${localFilters.line_manager_search}`
      });
    }
    if (localFilters.job_title_search) {
      filters.push({ 
        key: "job_title_search", 
        label: `Job Title: ${localFilters.job_title_search}`
      });
    }
    if (localFilters.start_date_from || localFilters.start_date_to) {
      filters.push({ 
        key: "start_date", 
        label: "Start Date Range"
      });
    }
    if (localFilters.contract_end_date_from || localFilters.contract_end_date_to) {
      filters.push({ 
        key: "contract_end_date", 
        label: "Contract End Date Range"
      });
    }
    if (localFilters.years_of_service_min || localFilters.years_of_service_max) {
      filters.push({ 
        key: "years_of_service", 
        label: "Years of Service Range"
      });
    }
    if (localFilters.is_active && localFilters.is_active !== "") {
      filters.push({ 
        key: "is_active", 
        label: `Active: ${localFilters.is_active === "true" ? "Yes" : "No"}`
      });
    }
    if (localFilters.is_visible_in_org_chart && localFilters.is_visible_in_org_chart !== "") {
      filters.push({ 
        key: "is_visible_in_org_chart", 
        label: `Org Chart: ${localFilters.is_visible_in_org_chart === "true" ? "Visible" : "Hidden"}`
      });
    }
    if (localFilters.status_needs_update && localFilters.status_needs_update !== "") {
      filters.push({ 
        key: "status_needs_update", 
        label: `Status Update: ${localFilters.status_needs_update === "true" ? "Needed" : "Not Needed"}`
      });
    }
    if (localFilters.contract_expiring_days) {
      filters.push({ 
        key: "contract_expiring_days", 
        label: `Contract expiring in ${localFilters.contract_expiring_days} days`
      });
    }
    
    return filters;
  }, [localFilters, isWrapperFilterApplied]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  const availableFieldsForSorting = useMemo(() => [
    { value: 'name', label: 'Full Name', description: 'Employee full name' },
    { value: 'employee_name', label: 'Employee Name', description: 'Employee display name' },
    { value: 'employee_id', label: 'Employee ID', description: 'Unique employee identifier' },
    { value: 'email', label: 'Email Address', description: 'Work email address' },
    { value: 'phone', label: 'Phone Number', description: 'Contact phone number' },
    { value: 'father_name', label: 'Father Name', description: 'Father\'s name' },
    { value: 'job_title', label: 'Job Title', description: 'Current position title' },
    { value: 'business_function_name', label: 'Company', description: 'Main business area' },
    { value: 'business_function_code', label: 'Function Code', description: 'Company code' },
    { value: 'department_name', label: 'Department', description: 'Department name' },
    { value: 'unit_name', label: 'Unit', description: 'Organizational unit' },
    { value: 'job_function_name', label: 'Job Function', description: 'Specific job function' },
    { value: 'position_group_name', label: 'Hierarchy', description: 'Hierarchy category' },
    { value: 'position_group_level', label: 'Position Level', description: 'Hierarchy level in Hierarchy' },
    { value: 'grading_level', label: 'Grade Level', description: 'Employee grade level' },
    { value: 'line_manager_name', label: 'Line Manager', description: 'Direct supervisor' },
    { value: 'line_manager_hc_number', label: 'Manager ID', description: 'Manager employee ID' },
    { value: 'start_date', label: 'Start Date', description: 'Employment start date' },
    { value: 'end_date', label: 'End Date', description: 'Employment end date' },
    { value: 'contract_start_date', label: 'Contract Start', description: 'Current contract start date' },
    { value: 'contract_end_date', label: 'Contract End', description: 'Current contract end date' },
    { value: 'contract_duration', label: 'Contract Duration', description: 'Contract length in months' },
    { value: 'contract_duration_display', label: 'Contract Display', description: 'Formatted contract duration' },
    { value: 'status_name', label: 'Employment Status', description: 'Current employment status' },
    { value: 'status_color', label: 'Status Color', description: 'Status indicator color' },
    { value: 'current_status_display', label: 'Status Display', description: 'Formatted status display' },
    { value: 'date_of_birth', label: 'Date of Birth', description: 'Employee birth date' },
    { value: 'gender', label: 'Gender', description: 'Employee gender' },
    { value: 'years_of_service', label: 'Years of Service', description: 'Total years with company' },
    { value: 'direct_reports_count', label: 'Direct Reports', description: 'Number of direct subordinates' },
    { value: 'created_at', label: 'Created Date', description: 'Record creation date' },
    { value: 'updated_at', label: 'Last Updated', description: 'Last modification date' },
    { value: 'is_visible_in_org_chart', label: 'Visible in Org Chart', description: 'Show in organizational chart' },
    { value: 'is_deleted', label: 'Deleted Status', description: 'Soft deletion status' }
  ], []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vacant':
        return <VacantPositionsTable />;
      case 'archive':
        return <ArchiveEmployeesTable />;
      case 'employees':
      default:
        return (
          <>
            <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-3 mt-3">
              <SearchBar
                searchTerm={localFilters.search}
                onSearchChange={handleSearchChange}
                placeholder="Search by name, email, employee ID, or job title..."
              />
              
              <div className="flex-shrink-0">
                <QuickFilterBar
                  onStatusChange={handleStatusChange}
                  onDepartmentChange={handleDepartmentChange}
                  onBusinessFunctionChange={handleBusinessFunctionChange}
                  onPositionGroupChange={handlePositionGroupChange}
                  statusFilter={Array.isArray(localFilters.status) ? localFilters.status : []}
                  departmentFilter={Array.isArray(localFilters.department) ? localFilters.department : []}
                  businessFunctionFilter={Array.isArray(localFilters.business_function) ? localFilters.business_function : []}
                  positionGroupFilter={Array.isArray(localFilters.position_group) ? localFilters.position_group : []}
                  activeFilters={activeFilters}
                  onClearFilter={handleClearFilter}
                  onClearAllFilters={handleClearAllFilters}
                  statistics={statistics}
                  showCounts={true}
                />
              </div>
            </div>

            {colorSystemInitialized && (
              <div className="flex justify-between items-center mb-3">
                <ColorSelector onChange={handleColorModeChange} />
              </div>
            )}

            {isAdvancedFilterOpen && (
              <AdvancedFilterPanel
                onApply={handleApplyAdvancedFilters}
                onClose={() => setIsAdvancedFilterOpen(false)}
                initialFilters={localFilters}
              />
            )}

            {isAdvancedSortingOpen && (
              <div className="mb-4 relative z-40">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
                  <AdvancedMultipleSortingSystem
                    currentSorting={sorting || []}
                    onSortingChange={handleSortingChange}
                    availableFields={availableFieldsForSorting}
                    darkMode={darkMode}
                    maxSortLevels={10}
                  />
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsAdvancedSortingOpen(false)}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Close Advanced Sorting
                    </button>
                  </div>
                </div>
              </div>
            )}
{/* 
            {activeFilters.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active
                      {isWrapperFilterApplied && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">
                          Company Filter Active
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    Clear All{isWrapperFilterApplied ? ' (except company)' : ''}
                  </button>
                </div>
              </div>
            )} */}

                {/* Filter Summary */}
            {/* {activeFilters.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Multi-level sorting active:
                    </span>
                    <div className="ml-2 flex items-center space-x-2">
                      {sorting.map((sort, index) => (
                        <span 
                          key={sort.field}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                        >
                          {index + 1}. {sort.field} {sort.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleAdvancedSorting}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      Configure
                    </button>
                    <button
                      onClick={handleClearAllSorting}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )} */}

            {loading.employees && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-300">
                    Loading employees...
                  </span>
                </div>
              </div>
            )}

            <EmployeeTable
              employees={employeesWithColorGrouping}
              loading={loading.employees}
              selectedEmployees={selectedEmployees}
              selectAll={selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0}
              onToggleSelectAll={handleSelectAll}
              onToggleEmployeeSelection={handleEmployeeToggle}
              onSort={handleSort}
              getSortDirection={getSortDirection}
              isSorted={isSorted}
              getSortIndex={getSortIndex}
              hasFilters={activeFilters.length > 0}
              onClearFilters={handleClearAllFilters}
              employeeVisibility={employeeVisibility}
              onVisibilityChange={handleVisibilityChange}
              onEmployeeAction={handleEmployeeAction}
              darkMode={darkMode}
            />

            <div className="mt-6">
              <Pagination
                currentPage={pagination.page || pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.count || pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={loading.employees}
                darkMode={darkMode}
                showQuickJump={true}
                showPageSizeSelector={true}
                showItemsInfo={true}
                showFirstLast={true}
                compactMode={false}
                allowCustomPageSize={true}
                maxDisplayPages={7}
                pageSizeOptions={[10, 25, 50, 100, 250, 500]}
              />
            </div>
          </>
        );
    }
  };

  const headerProps = useMemo(() => ({
    activeTab,
    onTabChange: handleTabChange,
    statistics: combinedStatistics,
    vacantPositionsStats: vacantPositionsStats || {},
    archiveStats: archiveStats || {},
    onToggleAdvancedFilter: () => setIsAdvancedFilterOpen(!isAdvancedFilterOpen),
    onToggleActionMenu: handleToggleActionMenu,
    isActionMenuOpen,
    selectedEmployees: activeTab === 'employees' ? selectedEmployees : [],
    onBulkImportComplete: handleBulkImportComplete,
    onBulkImport: () => setIsBulkUploadOpen(true),
    onToggleAdvancedSorting: handleToggleAdvancedSorting,
    isAdvancedSortingOpen,
    currentSorting: sorting || [],
    onClearAllSorting: handleClearAllSorting,
    onQuickExport: handleQuickExport,
    onToggleExportModal: handleToggleExportModal,
    isExporting: loading.exporting || false,
    hasActiveFilters: activeFilters.length > 0,
    filteredCount: formattedEmployees.length,
    totalEmployees: statistics.total_employees || 0,
    darkMode
  }), [
    activeTab,
    handleTabChange,
    combinedStatistics,
    vacantPositionsStats,
    archiveStats,
    isAdvancedFilterOpen,
    handleToggleActionMenu,
    isActionMenuOpen,
    selectedEmployees,
    handleBulkImportComplete,
    handleToggleAdvancedSorting,
    isAdvancedSortingOpen,
    sorting,
    handleClearAllSorting,
    handleQuickExport,
    handleToggleExportModal,
    loading.exporting,
    activeFilters.length,
    formattedEmployees.length,
    statistics.total_employees,
    darkMode
  ]);

  if (error?.employees && activeTab === 'employees') {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-sm mb-4">
              {error?.employees?.message || 'Failed to load employee data'}
            </p>
            <button 
              onClick={() => {
                initialized.current = false;
                lastApiParamsRef.current = null;
                showInfo('Reloading application...');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-3 max-w-full">
      <div className="relative">
        <HeadcountHeader {...headerProps} />

        {isActionMenuOpen && activeTab === 'employees' && (
          <div className="absolute right-6 top-20 z-50">
            <ActionMenu 
              isOpen={isActionMenuOpen}
              onClose={handleActionMenuClose}
              onAction={handleBulkAction}
              selectedCount={selectedEmployees.length}
              selectedEmployees={selectedEmployees}
              selectedEmployeeData={formattedEmployees.filter(emp => selectedEmployees.includes(emp.id))}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        {renderTabContent()}
      </div>

      {activeTab === 'employees' && (
        <>
          {isExportModalOpen && (
            <ExportModal
              isOpen={isExportModalOpen}
              onClose={() => setIsExportModalOpen(false)}
              onExport={handleExport}
              totalEmployees={statistics.total_employees}
              filteredCount={formattedEmployees.length}
              selectedEmployees={selectedEmployees}
              darkMode={darkMode}
            />
          )}

          {isBulkUploadOpen && (
            <BulkUploadForm
              onClose={() => setIsBulkUploadOpen(false)}
              onImportComplete={handleBulkImportComplete}
              darkMode={darkMode}
            />
          )}

          {showLineManagerModal && currentModalEmployee && (
            <LineManagerModal
              isOpen={showLineManagerModal}
              onClose={handleLineManagerModalClose}
              employee={currentModalEmployee}
              onAssign={handleLineManagerAssign}
              loading={loading.bulkAssignLineManager}
              darkMode={darkMode}
              onFetchAllEmployees={fetchAllEmployeesForModal}
              allEmployeesData={allEmployeesForModal}
              fetchingEmployees={fetchingAllEmployees}
            />
          )}

          {showTagModal && currentModalEmployee && (
            <TagManagementModal
              isOpen={showTagModal}
              onClose={handleTagModalClose}
              employee={currentModalEmployee}
              availableTags={employeeTags || []}
              onTagOperation={handleTagOperation}
              loading={{
                add: loading.bulkAddTags,
                remove: loading.bulkRemoveTags
              }}
              darkMode={darkMode}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HeadcountTable;