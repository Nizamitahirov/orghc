// src/components/headcount/ArchiveEmployeesTable.jsx - Complete Enhanced Component
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { 
  Archive,
  Search,
  Filter,
  RotateCcw,
  Trash2,
  Pencil,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  X,
  Briefcase,
  
} from "lucide-react";

// API Services
import { archiveEmployeesService, referenceDataService } from "../../services/vacantPositionsService";

// Components
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";
import SearchableDropdown from "../common/SearchableDropdown";
import ConfirmationModal from "../common/ConfirmationModal";
import { useToast } from "../common/Toast";
import CustomCheckbox from "../common/CustomCheckbox";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorDisplay } from "../common/LoadingSpinner";




const ArchiveEmployeesTable = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  
  // Data states
  const [archivedEmployees, setArchivedEmployees] = useState([]);
  const [archiveStats, setArchiveStats] = useState(null);
  const [selectedArchivedEmployees, setSelectedArchivedEmployees] = useState([]);
  
  // Reference data states
  const [departments, setDepartments] = useState([]);
  const [businessFunctions, setBusinessFunctions] = useState([]);
  
  // Loading & Error states
  const [loading, setLoading] = useState({
    archivedEmployees: false,
    statistics: false,
    bulkOperations: false,
    referenceData: false
  });
  
  const [errors, setErrors] = useState({
    archivedEmployees: null,
    statistics: null,
    referenceData: null
  });
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  // Edit archive modal state
  const [editModal, setEditModal] = useState({ isOpen: false, employee: null });
  const [editForm, setEditForm] = useState({ termination_date: '', exit_type: '' });
  const [editSaving, setEditSaving] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    deletion_type: [],
    employee_still_exists: "",
    department: [],
    business_function: [],
    deleted_after: "",
    deleted_before: ""
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Pagination states
  const [archivePagination, setArchivePagination] = useState({
    page: 1,
    pageSize: 25,
    totalPages: 1,
    count: 0
  });

  // Refs for preventing infinite loops
  const initialized = useRef(false);
  const debounceRef = useRef(null);
  const lastApiParamsRef = useRef(null);

  // Theme styles
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const bgSection = darkMode ? "bg-gray-700/30" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Modal helpers
  const showConfirmModal = useCallback((config) => {
    setConfirmModal({
      isOpen: true,
      type: config.type || 'default',
      title: config.title || 'Confirm Action',
      message: config.message || 'Are you sure?',
      onConfirm: config.onConfirm,
      loading: false
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      type: 'default',
      title: '',
      message: '',
      onConfirm: null,
      loading: false
    });
  }, []);

  const handleModalConfirm = useCallback(async () => {
    if (confirmModal.onConfirm) {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      try {
        await confirmModal.onConfirm();
        closeConfirmModal();
      } catch (error) {
        setConfirmModal(prev => ({ ...prev, loading: false }));
        showError(`Operation failed: ${error.message}`);
      }
    }
  }, [confirmModal.onConfirm, closeConfirmModal, showError]);

  // Filter options
  const deletionTypeOptions = [
    { value: 'soft', label: 'Soft Delete', color: 'orange' },
    { value: 'hard', label: 'Hard Delete', color: 'red' }
  ];

  const restorabilityOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Restorable' },
    { value: 'false', label: 'Permanent' }
  ];

  // Dropdown options for SearchableDropdown
  const departmentOptions = useMemo(() => {
    return departments
      .filter(dept => dept && dept.id != null && dept.name)
      .map(dept => ({
        value: dept.id.toString(),
        label: dept.name
      }));
  }, [departments]);

  const businessFunctionOptions = useMemo(() => {
    return businessFunctions
      .filter(bf => bf && bf.id != null && bf.name && bf.code)
      .map(bf => ({
        value: bf.id.toString(),
        label: `${bf.name} (${bf.code})`
      }));
  }, [businessFunctions]);

  // Utility functions
  const updateLoading = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateError = useCallback((key, error) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({
      archivedEmployees: null,
      statistics: null,
      referenceData: null
    });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDeletionTypeIcon = (type) => {
    switch (type) {
      case 'hard_delete':
        return <Trash2 className="w-3.5 h-3.5 text-red-600" />;
      case 'soft_delete':
        return <Archive className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <Archive className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  const getDeletionTypeColor = (type) => {
    switch (type) {
      case 'hard_delete':
        return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'soft_delete':
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
      default:
        return 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
  };

  // Fetch reference data
  const fetchReferenceData = useCallback(async () => {
    updateLoading('referenceData', true);
    updateError('referenceData', null);

    try {
      const result = await referenceDataService.getAllReferenceData();
      
      if (result.success) {
        setBusinessFunctions(result.data.businessFunctions || []);
        setDepartments(result.data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
      updateError('referenceData', error);
    } finally {
      updateLoading('referenceData', false);
    }
  }, [updateLoading, updateError]);

  // Fetch archived employees
  const fetchArchivedEmployees = useCallback(async (params = {}) => {
    updateLoading('archivedEmployees', true);
    updateError('archivedEmployees', null);

    try {
      const result = await archiveEmployeesService.getArchivedEmployees(params);
      
      if (result.success) {
        setArchivedEmployees(result.results || []);
        setArchivePagination(result.pagination || {
          page: params.page || 1,
          pageSize: params.page_size || 25,
          totalPages: 1,
          count: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch archived employees:', error);
      updateError('archivedEmployees', error);
      setArchivedEmployees([]);
    } finally {
      updateLoading('archivedEmployees', false);
    }
  }, [updateLoading, updateError]);

  // Fetch archive statistics
  const fetchArchiveStatistics = useCallback(async () => {
    updateLoading('statistics', true);
    updateError('statistics', null);

    try {
      const result = await archiveEmployeesService.getArchivedEmployees({ page_size: 1000 });
      
      if (result.success) {
        const employees = result.results || [];
        
        const stats = {
          total_archived: employees.length,
          restorable_count: employees.filter(emp => emp.can_be_restored === true).length,
          recent_deletions: employees.filter(emp => {
            if (!emp.deleted_at) return false;
            const deletedDate = new Date(emp.deleted_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return deletedDate >= thirtyDaysAgo;
          }).length
        };

        setArchiveStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch archive statistics:', error);
      updateError('statistics', error);
    } finally {
      updateLoading('statistics', false);
    }
  }, [updateLoading, updateError]);

  // Bulk restore employees
  // archiveRecords: array of archive employee objects (with original_employee_pk and original_employee_id)
  const bulkRestoreEmployees = useCallback(async (archiveRecords, restoreToActive = false) => {
    // Separate PKs (numeric) from string fallbacks
    const pkIds = [];
    const strIds = [];
    const trackedStrIds = new Set();

    archiveRecords.forEach(rec => {
      const pk = rec.original_employee_pk;
      const strId = rec.original_employee_id;
      if (pk != null && pk !== "") {
        pkIds.push(Number(pk));
      } else if (strId) {
        if (!trackedStrIds.has(strId)) {
          strIds.push(strId);
          trackedStrIds.add(strId);
        }
      }
    });

    if (pkIds.length === 0 && strIds.length === 0) {
      throw new Error('No valid employee IDs to restore. The selected employees may not have a restorable record.');
    }

    updateLoading('bulkOperations', true);
    try {
      const response = await archiveEmployeesService.bulkRestoreEmployees(pkIds, restoreToActive, strIds);

      if (response.success) {
        // Remove restored employees from local state — match by both pk and string ID
        const pkSet = new Set(pkIds.map(String));
        const strSet = new Set(strIds);
        setArchivedEmployees(prev =>
          prev.filter(emp =>
            !pkSet.has(String(emp.original_employee_pk)) &&
            !strSet.has(emp.original_employee_id)
          )
        );
        setSelectedArchivedEmployees([]);
        await fetchArchiveStatistics();
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Failed to restore employees:', error);
      throw error;
    } finally {
      updateLoading('bulkOperations', false);
    }
  }, [updateLoading, fetchArchiveStatistics]);

  // API params builder
  const buildApiParams = useMemo(() => {
    const params = {
      page: archivePagination.page || 1,
      page_size: archivePagination.pageSize || 25
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm.trim();
    }

    if (filters.deletion_type && filters.deletion_type.length > 0) {
      if (filters.deletion_type.length === 1) {
        params.deletion_type = filters.deletion_type[0];
      }
    }

    if (filters.employee_still_exists && filters.employee_still_exists !== "") {
      params.employee_still_exists = filters.employee_still_exists;
    }
    
    if (filters.department && filters.department.length > 0) {
      params.department = filters.department.join(',');
    }
    
    if (filters.business_function && filters.business_function.length > 0) {
      params.business_function = filters.business_function.join(',');
    }

    if (filters.deleted_after) {
      params.deleted_after = filters.deleted_after;
    }
    
    if (filters.deleted_before) {
      params.deleted_before = filters.deleted_before;
    }

    return params;
  }, [searchTerm, filters, archivePagination.page, archivePagination.pageSize]);

  // Debounced data fetching
  const debouncedFetchEmployees = useCallback((params, immediate = false) => {
    const paramsString = JSON.stringify(params);
    const lastParamsString = JSON.stringify(lastApiParamsRef.current);
    
    if (paramsString === lastParamsString && !immediate) {
      return;
    }

    const delay = immediate ? 0 : 500;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      lastApiParamsRef.current = { ...params };
      fetchArchivedEmployees(params);
    }, delay);
  }, [fetchArchivedEmployees]);

  // Initialization
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) return;
      
      try {
        initialized.current = true;
        clearErrors();
        lastApiParamsRef.current = { ...buildApiParams };
        
        await Promise.all([
          fetchReferenceData(),
          fetchArchiveStatistics(),
          fetchArchivedEmployees(buildApiParams)
        ]);
        
      } catch (error) {
        console.error('Failed to initialize ArchiveEmployeesTable:', error);
        initialized.current = false;
      }
    };

    initializeData();
  }, []);

  // Data fetching on param changes
  useEffect(() => {
    if (initialized.current) {
      debouncedFetchEmployees(buildApiParams);
    }
  }, [buildApiParams, debouncedFetchEmployees]);

  // Event handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setArchivePagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((filterKey, values) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterKey === 'deletion_type') {
        newFilters[filterKey] = values;
        if (values.length > 0) {
          newFilters.employee_still_exists = "";
        }
      } else if (filterKey === 'employee_still_exists') {
        newFilters[filterKey] = values;
        if (values !== "") {
          newFilters.deletion_type = [];
        }
      } else {
        newFilters[filterKey] = values;
      }
      
      return newFilters;
    });
    setArchivePagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      deletion_type: [],
      employee_still_exists: "",
      department: [],
      business_function: [],
      deleted_after: "",
      deleted_before: ""
    });
    setSearchTerm("");
    setArchivePagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilter = useCallback((filterKey) => {
    if (filterKey === 'search') {
      setSearchTerm("");
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        if (Array.isArray(prev[filterKey])) {
          newFilters[filterKey] = [];
        } else {
          newFilters[filterKey] = "";
        }
        return newFilters;
      });
    }
    setArchivePagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Selection handlers
  const handleToggleSelection = useCallback((employeeId) => {
    const employee = archivedEmployees.find(emp => emp.id === employeeId);
    
    if (!employee || !employee.can_be_restored) {
      return;
    }

    setSelectedArchivedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  }, [archivedEmployees]);

  const handleSelectAll = useCallback(() => {
    const restorableEmployees = archivedEmployees.filter(emp => emp.can_be_restored);
    const restorableIds = restorableEmployees.map(emp => emp.id);
    
    const allRestorableSelected = restorableIds.every(id => selectedArchivedEmployees.includes(id));
    
    if (allRestorableSelected && restorableIds.length > 0) {
      setSelectedArchivedEmployees([]);
    } else {
      setSelectedArchivedEmployees(restorableIds);
    }
  }, [selectedArchivedEmployees, archivedEmployees]);

  const clearSelection = useCallback(() => {
    setSelectedArchivedEmployees([]);
  }, []);

  // Pagination handlers
  const setArchivePage = useCallback((page) => {
    setArchivePagination(prev => ({ ...prev, page }));
  }, []);

  const setArchivePageSize = useCallback((pageSize) => {
    setArchivePagination(prev => ({ 
      ...prev, 
      pageSize, 
      page: 1
    }));
  }, []);

  // Bulk action handlers
  const handleBulkRestore = useCallback(async () => {
    if (!selectedArchivedEmployees || selectedArchivedEmployees.length === 0) {
      showWarning("Please select employees to restore.");
      return;
    }

    const restorableEmployees = archivedEmployees.filter(emp => 
      selectedArchivedEmployees.includes(emp.id) && emp.can_be_restored === true
    );

    if (restorableEmployees.length === 0) {
      showWarning("None of the selected employees can be restored.");
      return;
    }

    showConfirmModal({
      type: 'info',
      title: 'Restore Employees',
      message: `Are you sure you want to restore ${restorableEmployees.length} employee${restorableEmployees.length !== 1 ? 's' : ''}? This action will move them back to the active employee list.`,
      onConfirm: async () => {
        try {
          await bulkRestoreEmployees(restorableEmployees, false);

          await Promise.all([
            fetchArchivedEmployees(buildApiParams),
            fetchArchiveStatistics()
          ]);

          showSuccess(`Successfully restored ${restorableEmployees.length} employee${restorableEmployees.length !== 1 ? 's' : ''}!`);
        } catch (error) {
          throw new Error(error.message || 'Failed to restore employees');
        }
      }
    });
  }, [selectedArchivedEmployees, archivedEmployees, bulkRestoreEmployees, fetchArchivedEmployees, buildApiParams, fetchArchiveStatistics, showWarning, showSuccess, showConfirmModal]);

  const handleIndividualRestore = useCallback(async (employee) => {
    if (!employee.can_be_restored) {
      showWarning("This employee cannot be restored as they were permanently deleted.");
      return;
    }

    showConfirmModal({
      type: 'info',
      title: 'Restore Employee',
      message: `Are you sure you want to restore ${employee.full_name}? This will move them back to the active employee list.`,
      onConfirm: async () => {
        try {
          await bulkRestoreEmployees([employee], false);
          showSuccess(`Successfully restored ${employee.full_name}!`);
        } catch (error) {
          throw new Error(error.message || 'Failed to restore employee');
        }
      }
    });
  }, [bulkRestoreEmployees, showWarning, showSuccess, showConfirmModal]);

  // Edit archive record handlers
  const openEditModal = useCallback((employee) => {
    setEditForm({
      termination_date: employee.termination_date || '',
      exit_type: employee.exit_type || '',
    });
    setEditModal({ isOpen: true, employee });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal({ isOpen: false, employee: null });
    setEditForm({ termination_date: '', exit_type: '' });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editModal.employee) return;
    setEditSaving(true);
    try {
      const result = await archiveEmployeesService.updateArchiveRecord(editModal.employee.id, {
        termination_date: editForm.termination_date || null,
        exit_type: editForm.exit_type || null,
      });
      if (result.success) {
        setArchivedEmployees(prev => prev.map(emp =>
          emp.id === editModal.employee.id
            ? { ...emp, termination_date: result.data.termination_date, exit_type: result.data.exit_type, exit_type_display: result.data.exit_type_display }
            : emp
        ));
        showSuccess('Archive record updated successfully!');
        closeEditModal();
      }
    } catch (error) {
      showError(error.message || 'Failed to update archive record');
    } finally {
      setEditSaving(false);
    }
  }, [editModal, editForm, showSuccess, showError, closeEditModal]);

  // Active filters calculation
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (searchTerm) {
      active.push({ key: "search", label: `Search: ${searchTerm}` });
    }
    
    if (filters.deletion_type && filters.deletion_type.length > 0) {
      const labels = filters.deletion_type.map(value => {
        const option = deletionTypeOptions.find(opt => opt.value === value);
        return option ? option.label : value;
      });
      active.push({ 
        key: 'deletion_type', 
        label: `Type: ${labels.join(', ')}`
      });
    }

    if (filters.employee_still_exists && filters.employee_still_exists !== "") {
      const label = filters.employee_still_exists === 'true' ? 'Restorable' : 'Permanent';
      active.push({ 
        key: 'employee_still_exists', 
        label: `Status: ${label}`
      });
    }

    if (filters.department && filters.department.length > 0) {
      const labels = filters.department.map(value => {
        const dept = departments?.find(d => d && d.id === parseInt(value));
        return dept ? dept.name : value;
      }).filter(label => label);
      if (labels.length > 0) {
        active.push({ 
          key: 'department', 
          label: `Department: ${labels.join(', ')}`
        });
      }
    }

    if (filters.business_function && filters.business_function.length > 0) {
      const labels = filters.business_function.map(value => {
        const bf = businessFunctions?.find(b => b && b.id === parseInt(value));
        return bf ? `${bf.name}` : value;
      }).filter(label => label);
      if (labels.length > 0) {
        active.push({ 
          key: 'business_function', 
          label: `Function: ${labels.join(', ')}`
        });
      }
    }

    if (filters.deleted_after) {
      active.push({ 
        key: 'deleted_after', 
        label: `After: ${filters.deleted_after}`
      });
    }

    if (filters.deleted_before) {
      active.push({ 
        key: 'deleted_before', 
        label: `Before: ${filters.deleted_before}`
      });
    }
    
    return active;
  }, [searchTerm, filters, deletionTypeOptions, departments, businessFunctions]);

  // Render helpers
  const renderHeader = () => (
    <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm mb-6`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-xl mr-3">
              <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${textPrimary}`}>
                Employee Archive
              </h1>
              <p className={`text-xs ${textSecondary} mt-1`}>
                {archiveStats?.total_archived || 0} archived employees
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center px-3 py-2 text-xs border rounded-lg transition-all ${
                activeFilters.length > 0 
                  ? 'bg-almet-sapphire/10 border-almet-sapphire/30 text-almet-sapphire'
                  : `${borderColor} ${textSecondary} ${hoverBg}`
              }`}
            >
              <Filter size={14} className="mr-1.5" />
              Filters
              {activeFilters.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-almet-sapphire text-white text-xs rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {selectedArchivedEmployees.length > 0 && (
              <button
                onClick={handleBulkRestore}
                className="flex items-center px-3 py-2 text-xs rounded-lg transition-all font-medium bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md"
                disabled={confirmModal.loading}
              >
                {confirmModal.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1.5"></div>
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} className="mr-1.5" />
                    Restore ({selectedArchivedEmployees.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-2 ${bgSection} flex gap-4 items-center justify-center rounded-lg`}>
            <div className={`text-xs font-medium ${textMuted} `}>Total Archived</div>
            <div className={`text-sm font-bold ${textPrimary}`}>
              {archiveStats?.total_archived || 0}
            </div>
          </div>
          <div className={`p-2 ${bgSection} flex gap-4 items-center justify-center rounded-lg`}>
            <div className={`text-xs font-medium ${textMuted} `}>Restorable</div>
            <div className="text-sm font-bold text-orange-600">
              {archiveStats?.restorable_count || 0}
            </div>
          </div>
          <div className={`p-2 ${bgSection} flex gap-4 items-center justify-center rounded-lg`}>
            <div className={`text-xs font-medium ${textMuted} `}>Permanent</div>
            <div className="text-sm font-bold text-red-600">
              {(archiveStats?.total_archived || 0) - (archiveStats?.restorable_count || 0)}
            </div>
          </div>
          <div className={`p-2 ${bgSection} flex gap-4 items-center justify-center rounded-lg`}>
            <div className={`text-xs font-medium ${textMuted} `}>Recent (30d)</div>
            <div className={`text-sm font-bold ${textPrimary}`}>
              {archiveStats?.recent_deletions || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    isFiltersOpen && (
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm mb-6 overflow-hidden`}>
        <div className="bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-almet-sapphire" />
              <h3 className={`font-medium text-sm ${textPrimary}`}>Filters</h3>
            </div>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className={`p-1 rounded-md ${hoverBg} transition-colors`}
            >
              <X size={16} className={textMuted} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Quick Filter Buttons */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {/* Deletion Type Quick Filters */}
              <div className="flex flex-wrap gap-1.5">
                {deletionTypeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newValues = filters.deletion_type.includes(option.value)
                        ? filters.deletion_type.filter(v => v !== option.value)
                        : [...filters.deletion_type, option.value];
                      handleFilterChange('deletion_type', newValues);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      filters.deletion_type.includes(option.value)
                        ? option.color === 'orange' 
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : `${borderColor} ${textSecondary} ${hoverBg}`
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Restorability Quick Filters */}
              <div className="flex gap-1.5">
                {restorabilityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('employee_still_exists', option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      filters.employee_still_exists === option.value
                        ? option.value === 'true'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                          : option.value === 'false'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                          : 'bg-almet-sapphire/10 text-almet-sapphire border-almet-sapphire/30'
                        : `${borderColor} ${textSecondary} ${hoverBg}`
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Department Filter */}
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-2`}>
                Department
              </label>
              <SearchableDropdown
                options={departmentOptions}
                value={filters.department}
                onChange={(values) => handleFilterChange('department', values)}
                placeholder="Select departments..."
                searchPlaceholder="Search departments..."
                darkMode={darkMode}
        
                     allowUncheck={true}
                icon={<Building size={14} />}
              />
            </div>

            {/* Company Filter */}
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-2`}>
                Company
              </label>
              <SearchableDropdown
                options={businessFunctionOptions}
                value={filters.business_function}
                onChange={(values) => handleFilterChange('business_function', values)}
                placeholder="Select Companies..."
                searchPlaceholder="Search Companies..."
                darkMode={darkMode}
           
                     allowUncheck={true}
                icon={<Briefcase size={14} />}
              />
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className={`text-xs font-medium ${textPrimary} mb-3`}>Date Range</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs ${textSecondary} mb-1.5`}>
                  After
                </label>
                <input
                  type="date"
                  value={filters.deleted_after}
                  onChange={(e) => handleFilterChange('deleted_after', e.target.value)}
                  className={`w-full p-2 border outline-0 rounded-lg ${bgInput} ${textPrimary} text-xs transition-all ${borderColor} focus:ring-1 focus:ring-almet-sapphire/30 focus:border-almet-sapphire`}
                />
              </div>
              <div>
                <label className={`block text-xs ${textSecondary} mb-1.5`}>
                  Before
                </label>
                <input
                  type="date"
                  value={filters.deleted_before}
                  onChange={(e) => handleFilterChange('deleted_before', e.target.value)}
                  className={`w-full p-2 border outline-0 rounded-lg ${bgInput} ${textPrimary} text-xs transition-all ${borderColor} focus:ring-1 focus:ring-almet-sapphire/30 focus:border-almet-sapphire`}
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-medium ${textPrimary} flex items-center`}>
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-almet-sapphire" />
                    Active:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFilters.map(filter => (
                      <span
                        key={filter.key}
                        className="group inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/30 hover:bg-almet-sapphire/20 transition-all"
                      >
                        <span className="max-w-24 truncate">{filter.label}</span>
                        <button
                          onClick={() => handleClearFilter(filter.key)}
                          className="ml-1.5 p-0.5 rounded-full hover:bg-almet-sapphire/20 transition-colors"
                          title={`Remove ${filter.label} filter`}
                        >
                          <X size={10} className="text-almet-sapphire" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:from-almet-astral hover:to-almet-steel-blue transition-all shadow-md"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeFilters.length === 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textSecondary}`}>
                  Showing all {archiveStats?.total_archived || 0} archived employees
                </span>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:from-almet-astral hover:to-almet-steel-blue transition-all shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );

  const renderEmployeeRow = (employee) => {
    const isRestorable = employee.can_be_restored === true;
    const isSelected = selectedArchivedEmployees.includes(employee.id);

    return (
      <tr key={employee.id} className={`${hoverBg} border-b ${borderColor} transition-colors`}>
        <td className="px-3 py-3">
          <CustomCheckbox
            checked={isSelected}
            onChange={() => handleToggleSelection(employee.id)}
            disabled={!isRestorable}
            className={!isRestorable ? 'opacity-50' : ''}
          />
        </td>

        <td className="px-3 py-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className={`font-medium text-sm ${textPrimary} ${!isRestorable ? 'opacity-75' : ''}`}>
                {employee.full_name}
              </p>
              <p className={`text-xs ${textSecondary}`}>
                ID: {employee.original_employee_id}
              </p>
              {employee.email && (
                <p className={`text-xs ${textMuted}`}>{employee.email}</p>
              )}
            </div>
          </div>
        </td>

        <td className="px-3 py-3">
          <p className={`text-xs ${textPrimary} ${!isRestorable ? 'opacity-75' : ''}`}>
            {employee.job_title || 'N/A'}
          </p>
          <p className={`text-xs ${textMuted}`}>
            {employee.department_name} • {employee.business_function_name}
          </p>
        </td>

        <td className="px-3 py-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getDeletionTypeColor(employee.deletion_type)}`}>
            {getDeletionTypeIcon(employee.deletion_type)}
            <span className="ml-1.5">{employee.deletion_type_display}</span>
          </span>
        </td>

        <td className="px-3 py-3">
          <div className="flex items-center text-xs">
            <Calendar className={`w-3.5 h-3.5 ${textMuted} mr-1.5`} />
            <span className={textSecondary}>{formatDate(employee.deleted_at)}</span>
          </div>
          {employee.days_since_deletion !== undefined && (
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {employee.days_since_deletion} days ago
            </p>
          )}
        </td>

         <td className="px-3 py-3">
          {employee.termination_date && (
            <p className="text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {formatDate(employee.termination_date)}
            </p>
          )}
        </td>

        <td className="px-3 py-3">
          {employee.exit_type ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
              employee.exit_type === 'voluntary_resignation'
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700'
                : employee.exit_type === 'termination'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                : employee.exit_type === 'end_of_internship'
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                : employee.exit_type === 'probation_period_failed'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                : 'bg-gray-50 dark:bg-gray-700/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
            }`}>
              {(employee.exit_type_display || employee.exit_type.replace(/_/g, ' ')).replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          ) : (
            <span className={`text-xs ${textMuted}`}>—</span>
          )}
        </td>

        <td className="px-3 py-3">
          <div className="flex items-center space-x-1.5">
            {isRestorable ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-800/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                <CheckCircle size={10} className="mr-1" />
                Restorable
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 dark:bg-red-800/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">
                <XCircle size={10} className="mr-1" />
                Permanent
              </span>
            )}
          </div>
        </td>

        <td className="px-3 py-3">
          <div className="flex items-center space-x-1.5">
            {isRestorable ? (
              <button
                onClick={() => handleIndividualRestore(employee)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                title="Restore Employee"
                disabled={confirmModal.loading}
              >
                <RotateCcw size={14} />
              </button>
            ) : (
              <span
                className="text-gray-400 dark:text-gray-600 p-1.5"
                title="Cannot restore permanently deleted employee"
              >
                <XCircle size={14} />
              </span>
            )}
            <button
              onClick={() => openEditModal(employee)}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              title="Edit termination date & exit type"
            >
              <Pencil size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderTable = () => {
    const restorableEmployees = archivedEmployees.filter(emp => emp.can_be_restored);
    const allRestorableSelected = restorableEmployees.length > 0 && 
      restorableEmployees.every(emp => selectedArchivedEmployees.includes(emp.id));
    const someRestorableSelected = restorableEmployees.some(emp => selectedArchivedEmployees.includes(emp.id));

    return (
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${bgSection}`}>
              <tr>
                <th className="px-3 py-3 text-left">
                  <CustomCheckbox
                    checked={allRestorableSelected}
                    indeterminate={someRestorableSelected && !allRestorableSelected}
                    onChange={handleSelectAll}
                    disabled={restorableEmployees.length === 0}
                  />
                </th>
                <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                  Employee
                </th>
                <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                  Position
                </th>
                <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                  Type
                </th>
                
                <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                  Deleted
                </th>
               <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                 Termination
                </th>
                <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                  Exit Type
                </th>
                <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-3 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {archivedEmployees.map(renderEmployeeRow)}
            </tbody>
          </table>
        </div>
        
        {selectedArchivedEmployees.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-almet-sapphire/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-medium ${textPrimary}`}>
                  {selectedArchivedEmployees.length} employee{selectedArchivedEmployees.length !== 1 ? 's' : ''} selected
                </span>
                {(() => {
                  const restorableCount = archivedEmployees.filter(emp => 
                    selectedArchivedEmployees.includes(emp.id) && emp.can_be_restored
                  ).length;
                  
                  return (
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {restorableCount} restorable
                      </span>
                    </div>
                  );
                })()}
              </div>
              <button
                onClick={clearSelection}
                className="text-xs text-almet-sapphire hover:text-almet-astral font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className={`${bgCard} rounded-xl border ${borderColor} p-10 text-center`}>
      <Archive className={`w-12 h-12 ${textMuted} mx-auto mb-3`} />
      <h3 className={`text-base font-semibold ${textPrimary} mb-2`}>
        No Archived Employees Found
      </h3>
      <p className={`text-sm ${textSecondary} mb-5 max-w-md mx-auto`}>
        {activeFilters.length > 0 
          ? "No employees match your current search criteria. Try adjusting your filters."
          : "There are no archived employees at the moment."}
      </p>
      {activeFilters.length > 0 && (
        <button
          onClick={handleClearFilters}
          className="px-4 py-2.5 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:from-almet-astral hover:to-almet-steel-blue transition-all shadow-md text-sm"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Error handling with retry functionality
  const handleRetry = useCallback(() => {
    initialized.current = false;
    lastApiParamsRef.current = null;
    clearErrors();
    
    // Re-initialize
    const initializeData = async () => {
      try {
        initialized.current = true;
        lastApiParamsRef.current = { ...buildApiParams };
        
        await Promise.all([
          fetchReferenceData(),
          fetchArchiveStatistics(),
          fetchArchivedEmployees(buildApiParams)
        ]);
        
      } catch (error) {
        console.error('Failed to initialize ArchiveEmployeesTable:', error);
        initialized.current = false;
      }
    };

    initializeData();
  }, [buildApiParams, fetchReferenceData, fetchArchiveStatistics, fetchArchivedEmployees, clearErrors]);

  // Main render
  return (
    <div className="container mx-auto pt-3 max-w-full">
      {renderHeader()}

      <div className="mb-5">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search archived employees by name, email, or employee ID..."
        />
      </div>

      {renderFilters()}

      {/* Main Content */}
      {loading.archivedEmployees && !initialized.current ? (
        <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm`}>
          <LoadingSpinner message="Loading archived employees..." />
        </div>
      ) : errors.archivedEmployees ? (
        <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm`}>
          <ErrorDisplay 
            error={errors.archivedEmployees.message || 'Failed to load archived employees'} 
            onRetry={handleRetry}
          />
        </div>
      ) : archivedEmployees.length === 0 ? (
        renderEmptyState()
      ) : (
        renderTable()
      )}

      {archivedEmployees.length > 0 && (
        <div className="mt-5">
          <Pagination
            currentPage={archivePagination.page}
            totalPages={archivePagination.totalPages}
            totalItems={archivePagination.count}
            pageSize={archivePagination.pageSize}
            onPageChange={setArchivePage}
            onPageSizeChange={setArchivePageSize}
            loading={loading.archivedEmployees}
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
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleModalConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={confirmModal.loading}
        darkMode={darkMode}
        confirmText="Restore"
        cancelText="Cancel"
      />

      {/* Edit Archive Record Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Edit Archive Record
              </h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                <X size={16} />
              </button>
            </div>
            <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {editModal.employee?.full_name}
            </p>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Termination Date
                </label>
                <input
                  type="date"
                  value={editForm.termination_date}
                  onChange={e => setEditForm(f => ({ ...f, termination_date: e.target.value }))}
                  className={`w-full text-xs px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Exit Type
                </label>
                <select
                  value={editForm.exit_type}
                  onChange={e => setEditForm(f => ({ ...f, exit_type: e.target.value }))}
                  className={`w-full text-xs px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">— Not specified —</option>
                  <option value="VOLUNTARY_RESIGNATION">Voluntary Resignation</option>
                  <option value="TERMINATION">Termination</option>
                  <option value="END_OF_INTERNSHIP">End of Internship</option>
                  <option value="PROBATION_PERIOD_FAILED">Probation Period Failed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={closeEditModal}
                className={`flex-1 text-xs py-2 rounded-lg border ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                } transition`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="flex-1 text-xs py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveEmployeesTable;