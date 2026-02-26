// src/components/headcount/VacantPositionsTable.jsx - Enhanced with Toast & Modal
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useVacantPositions } from "../../hooks/useVacantPositions";
import { Plus, Filter, Search, Briefcase, Users, FileText, X, ChevronDown, ChevronUp } from "lucide-react";

// Components
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";
import VacantPositionCard from "./VacantPositionCard";
import VacantPositionModal from "./VacantPositionModal";
import ConvertToEmployeeModal from "./ConvertToEmployeeModal";
import SearchableDropdown from "../common/SearchableDropdown";
import ConfirmationModal from "../common/ConfirmationModal";
import { useToast } from "../common/Toast";

const VacantPositionsTable = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  
  const {
    vacantPositions,
    vacantPositionsStats,
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    getAllGradingLevels,
    loading,
    errors,
    vacantPagination,
    fetchVacantPositions,
    createVacantPosition,
    updateVacantPosition,
    deleteVacantPosition,
    convertToEmployee,
    fetchVacantPositionsStatistics,
    searchVacantPositions,
    fetchReferenceData,
    setVacantPositionsPage,
    setVacantPositionsPageSize,
    clearErrors
  } = useVacantPositions();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    business_function: [],
    department: [],
    unit: [],
    job_function: [],
    position_group: [],
    grading_level: [],
    include_in_headcount: ''
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [allGradingLevels, setAllGradingLevels] = useState([]);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  const initialized = useRef(false);
  const debounceRef = useRef(null);
  const lastApiParamsRef = useRef(null);

  // Modal helpers
  const showConfirmModal = useCallback((config) => {
    setConfirmModal({
      isOpen: true,
      type: config.type || 'danger',
      title: config.title || 'Confirm Action',
      message: config.message || 'Are you sure?',
      onConfirm: config.onConfirm,
      loading: false
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      type: 'danger',
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

  // Improved theme styles
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgSecondary = darkMode ? "bg-gray-700/30" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-200";
  const borderLight = darkMode ? "border-gray-700" : "border-gray-100";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Dropdown options
  const businessFunctionFilterOptions = businessFunctions?.map(bf => ({
    value: bf.id.toString(),
    label: `${bf.name} (${bf.code})`
  })) || [];

  const departmentFilterOptions = departments?.map(dept => ({
    value: dept.id.toString(),
    label: dept.name,
    subtitle: dept.business_function_name
  })) || [];

  const unitFilterOptions = units?.map(unit => ({
    value: unit.id.toString(),
    label: unit.name,
    subtitle: unit.department_name
  })) || [];

  const jobFunctionFilterOptions = jobFunctions?.map(jf => ({
    value: jf.id.toString(),
    label: jf.name
  })) || [];

  const positionGroupFilterOptions = positionGroups?.map(pg => ({
    value: pg.id.toString(),
    label: `${pg.display_name || pg.name} (Level ${pg.hierarchy_level})`
  })) || [];

  const gradingLevelFilterOptions = allGradingLevels?.map(gl => ({
    value: gl.code,
    label: gl.display,
    description: gl.full_name
  })) || [];

  const booleanOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  // Load all grading levels for filters
  useEffect(() => {
    const loadAllGradingLevels = async () => {
      if (positionGroups && positionGroups.length > 0) {
        try {
          const levels = await getAllGradingLevels();
          setAllGradingLevels(levels);
        } catch (error) {
          console.error('Failed to load all grading levels:', error);
        }
      }
    };
    loadAllGradingLevels();
  }, [positionGroups, getAllGradingLevels]);

  // Build API params
  const buildApiParams = useMemo(() => {
    const params = {
      page: vacantPagination.page || 1,
      page_size: vacantPagination.pageSize || 25
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm.trim();
    }

    Object.keys(filters).forEach(filterKey => {
      if (filters[filterKey] && Array.isArray(filters[filterKey]) && filters[filterKey].length > 0) {
        params[filterKey] = filters[filterKey].join(',');
      } else if (filters[filterKey] && !Array.isArray(filters[filterKey]) && filters[filterKey] !== '') {
        params[filterKey] = filters[filterKey];
      }
    });

    return params;
  }, [searchTerm, filters, vacantPagination.page, vacantPagination.pageSize]);

  const apiParamsChanged = useMemo(() => {
    if (!lastApiParamsRef.current) return true;
    const currentParams = JSON.stringify(buildApiParams);
    const lastParams = JSON.stringify(lastApiParamsRef.current);
    return currentParams !== lastParams;
  }, [buildApiParams]);

  // Debounced data fetching
  const debouncedFetchPositions = useCallback((params, immediate = false) => {
    const paramsString = JSON.stringify(params);
    const lastParamsString = JSON.stringify(lastApiParamsRef.current);
    
    if (paramsString === lastParamsString && !immediate) {
      return;
    }

    const delay = immediate ? 0 : 300;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      lastApiParamsRef.current = { ...params };
      fetchVacantPositions(params);
    }, delay);
  }, [fetchVacantPositions]);

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
          fetchVacantPositionsStatistics(),
          fetchVacantPositions(buildApiParams)
        ]);
        
      } catch (error) {
        console.error('Failed to initialize VacantPositionsTable:', error);
        initialized.current = false;
      }
    };

    initializeData();
  }, []);

  // Data fetching on param changes
  useEffect(() => {
    if (initialized.current && apiParamsChanged) {
      debouncedFetchPositions(buildApiParams);
    }
  }, [apiParamsChanged, buildApiParams, debouncedFetchPositions]);

  // Event handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  const handleFilterChange = useCallback((filterKey, values) => {
    setFilters(prev => ({ ...prev, [filterKey]: values }));
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  const handleSingleFilterChange = useCallback((filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      business_function: [],
      department: [],
      unit: [],
      job_function: [],
      position_group: [],
      grading_level: [],
      include_in_headcount: ''
    });
    setSearchTerm("");
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  const handleClearFilter = useCallback((filterKey) => {
    if (filterKey === 'search') {
      setSearchTerm("");
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [filterKey]: Array.isArray(prev[filterKey]) ? [] : '' 
      }));
    }
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  // Modal handlers
  const handleCreatePosition = useCallback(() => {
    setSelectedPosition(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleEditPosition = useCallback((position) => {
    setSelectedPosition(position);
    
    setIsEditModalOpen(true);
  }, []);

  const handleConvertPosition = useCallback((position) => {
    setSelectedPosition(position);
    setIsConvertModalOpen(true);
  }, []);

  const handleDeletePosition = useCallback(async (positionId) => {
    const position = vacantPositions.find(p => p.id === positionId);
    const positionName = position?.job_title || 'this vacant position';
    
    showConfirmModal({
      type: 'danger',
      title: 'Delete Vacant Position',
      message: `Are you sure you want to delete "${positionName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteVacantPosition(positionId);
          showSuccess('Vacant position deleted successfully!');
        } catch (error) {
          throw new Error(error.message || 'Failed to delete position');
        }
      }
    });
  }, [vacantPositions, showConfirmModal, deleteVacantPosition, showSuccess]);

  // Form submission handlers
  const handleCreateSubmit = useCallback(async (formData) => {
    try {
      await createVacantPosition(formData);
      setIsCreateModalOpen(false);
      showSuccess('Vacant position created successfully!');
    } catch (error) {
      throw error;
    }
  }, [createVacantPosition, showSuccess]);

  const handleEditSubmit = useCallback(async (formData) => {
    try {
      await updateVacantPosition(selectedPosition.id, formData);
      setIsEditModalOpen(false);
      setSelectedPosition(null);
      showSuccess('Vacant position updated successfully!');
    } catch (error) {
      throw error;
    }
  }, [updateVacantPosition, selectedPosition, showSuccess]);

  const handleConvertSubmit = useCallback(async (employeeData, document, profilePhoto) => {
    try {
      const result = await convertToEmployee(selectedPosition.id, employeeData, document, profilePhoto);
      setIsConvertModalOpen(false);
      setSelectedPosition(null);
      showSuccess(result.message || 'Position converted to employee successfully!');
    } catch (error) {
      throw error;
    }
  }, [convertToEmployee, selectedPosition, showSuccess]);

  // Active filters calculation
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (searchTerm) {
      active.push({ key: "search", label: `Search: ${searchTerm}` });
    }
    
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      
      if (Array.isArray(filterValue) && filterValue.length > 0) {
        let label = '';
        switch (key) {
          case 'business_function':
            const bfLabels = filterValue.map(id => {
              const bf = businessFunctions?.find(b => b.id === parseInt(id));
              return bf ? `${bf.name} (${bf.code})` : id;
            });
            label = `Company: ${bfLabels.join(', ')}`;
            break;
          case 'department':
            const deptLabels = filterValue.map(id => {
              const dept = departments?.find(d => d.id === parseInt(id));
              return dept ? dept.name : id;
            });
            label = `Department: ${deptLabels.join(', ')}`;
            break;
          case 'unit':
            const unitLabels = filterValue.map(id => {
              const unit = units?.find(u => u.id === parseInt(id));
              return unit ? unit.name : id;
            });
            label = `Unit: ${unitLabels.join(', ')}`;
            break;
          case 'job_function':
            const jfLabels = filterValue.map(id => {
              const jf = jobFunctions?.find(j => j.id === parseInt(id));
              return jf ? jf.name : id;
            });
            label = `Job Function: ${jfLabels.join(', ')}`;
            break;
          case 'position_group':
            const pgLabels = filterValue.map(id => {
              const pg = positionGroups?.find(p => p.id === parseInt(id));
              return pg ? pg.display_name : id;
            });
            label = `Hierarchy: ${pgLabels.join(', ')}`;
            break;
          case 'grading_level':
            const gradeLabels = filterValue.map(value => {
              const grade = allGradingLevels?.find(g => g.code === value);
              return grade ? grade.display : value;
            });
            label = `Grade: ${gradeLabels.join(', ')}`;
            break;
          default:
            label = `${key.replace('_', ' ')}: ${filterValue.length} selected`;
        }
        active.push({ key, label });
      } else if (!Array.isArray(filterValue) && filterValue !== '') {
        let label = '';
        switch (key) {
          case 'include_in_headcount':
            label = `In Headcount: ${filterValue === 'true' ? 'Yes' : 'No'}`;
            break;
          default:
            label = `${key.replace('_', ' ')}: ${filterValue}`;
        }
        active.push({ key, label });
      }
    });
    
    return active;
  }, [searchTerm, filters, businessFunctions, departments, units, jobFunctions, positionGroups, allGradingLevels]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Error handling
  if (errors.vacantPositions) {
    return (
      <div className="container mx-auto pt-6 px-4 ">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-sm mb-4">
              {errors.vacantPositions.message || 'Failed to load vacant positions'}
            </p>
            <button 
              onClick={() => {
                initialized.current = false;
                lastApiParamsRef.current = null;
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto ">
      {/* Header */}
      <div className={`${bgCard} rounded-xl border ${borderLight} shadow-sm mb-6`}>
        <div className="p-5">
          <div className="flex items-center justify-between ">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-almet-sapphire/10 to-almet-steel-blue/10 rounded-xl border border-almet-sapphire/20 mr-4">
                <Briefcase className="w-5 h-5 text-almet-sapphire" />
              </div>
              <div>
                <h1 className={`text-lg font-semibold ${textPrimary} `}>
                  Vacant Positions Management
                </h1>
                <p className={`text-xs ${textSecondary}`}>
                  {vacantPositionsStats?.total_vacant_positions || 0} vacant positions
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Filters Toggle */}
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 ${
                  activeFilters.length > 0 || isFiltersOpen
                    ? 'bg-almet-sapphire/10 border-almet-sapphire/30 text-almet-sapphire'
                    : `${borderColor} ${textSecondary} ${hoverBg}`
                }`}
              >
                <Filter size={14} className="mr-2" />
                Filters
                {activeFilters.length > 0 && (
                  <span className="ml-2 w-5 h-5 bg-almet-sapphire text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
                {isFiltersOpen ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
              </button>

              {/* Create Position Button */}
              <button
                onClick={handleCreatePosition}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-almet-sapphire to-almet-steel-blue text-white hover:from-almet-sapphire/90 hover:to-almet-steel-blue/90 shadow-sm hover:shadow-md"
              >
                <Plus size={14} className="mr-2" />
                Create Position
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search positions by title, department, or function..."
        />
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className={`${bgCard} rounded-xl border ${borderLight} shadow-sm mb-6 `}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Filter Options</h3>
              {activeFilters.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-almet-sapphire hover:text-almet-sapphire/80 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Company Filter */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Company
                </label>
                <SearchableDropdown
                  options={businessFunctionFilterOptions}
                  value={filters.business_function}
                  onChange={(value) => handleFilterChange('business_function', Array.isArray(value) ? value : [value])}
                  placeholder="All Companys"
                  searchPlaceholder="Search Companys..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  loading={loading.referenceData}
                  allowClear={true}
                />
              </div>

              {/* Department Filter */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Department
                </label>
                <SearchableDropdown
                  options={departmentFilterOptions}
                  value={filters.department}
                  onChange={(value) => handleFilterChange('department', Array.isArray(value) ? value : [value])}
                  placeholder="All Departments"
                  searchPlaceholder="Search departments..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  loading={loading.referenceData}
                  allowClear={true}
                />
              </div>

              {/* Hierarchy Filter */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Hierarchy
                </label>
                <SearchableDropdown
                  options={positionGroupFilterOptions}
                  value={filters.position_group}
                  onChange={(value) => handleFilterChange('position_group', Array.isArray(value) ? value : [value])}
                  placeholder="All Hierarchys"
                  searchPlaceholder="Search Hierarchys..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  loading={loading.referenceData}
                  allowClear={true}
                />
              </div>

              {/* Job Function Filter */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Job Function
                </label>
                <SearchableDropdown
                  options={jobFunctionFilterOptions}
                  value={filters.job_function}
                  onChange={(value) => handleFilterChange('job_function', Array.isArray(value) ? value : [value])}
                  placeholder="All Job Functions"
                  searchPlaceholder="Search job functions..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  loading={loading.referenceData}
                  allowClear={true}
                />
              </div>

              {/* Unit Filter */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Unit
                </label>
                <SearchableDropdown
                  options={unitFilterOptions}
                  value={filters.unit}
                  onChange={(value) => handleFilterChange('unit', Array.isArray(value) ? value : [value])}
                  placeholder="All Units"
                  searchPlaceholder="Search units..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  loading={loading.referenceData}
                  allowClear={true}
                />
              </div>

              {/* Include in Headcount Filter */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Include in Headcount
                </label>
                <SearchableDropdown
                  options={booleanOptions}
                  value={filters.include_in_headcount}
                  onChange={(value) => handleSingleFilterChange('include_in_headcount', value)}
                  placeholder="All Positions"
                  searchPlaceholder="Search headcount..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  allowClear={true}
                />
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className={`pt-4 border-t ${borderLight}`}>
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`text-sm font-medium ${textPrimary} mr-2`}>Active Filters:</span>
                  {activeFilters.map(filter => (
                    <span
                      key={filter.key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/20"
                    >
                      {filter.label}
                      <button
                        onClick={() => handleClearFilter(filter.key)}
                        className="ml-2 text-almet-sapphire hover:text-almet-sapphire/70"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Positions List */}
      <div className="space-y-6">
        {loading.vacantPositions ? (
          <div className={`${bgCard} rounded-xl border ${borderLight} p-12 text-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-almet-sapphire border-t-transparent mx-auto mb-4"></div>
            <p className={textSecondary}>Loading vacant positions...</p>
          </div>
        ) : vacantPositions.length === 0 ? (
          <div className={`${bgCard} rounded-xl border ${borderLight} p-6 text-center`}>
            <Briefcase className={`w-8 h-8 ${textMuted} mx-auto mb-4 opacity-50`} />
            <h3 className={`text-sm font-semibold ${textPrimary} mb-2`}>
              No Vacant Positions Found
            </h3>
            <p className={`${textSecondary} text-xs`}>
              {activeFilters.length > 0 
                ? "No positions match your current filters. Try adjusting your search criteria."
                : "There are no vacant positions at the moment."}
            </p>
            {activeFilters.length > 0 ? (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-gradient-to-r text-xs from-almet-sapphire to-almet-steel-blue text-white rounded-lg hover:from-almet-sapphire/90 hover:to-almet-steel-blue/90 transition-all duration-200  font-medium"
              >
                Clear Filters
              </button>
            ) : (
              ""
            )}
          </div>
        ) : (
          <>
            {/* Positions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vacantPositions.map(position => (
                <VacantPositionCard
                  key={position.id}
                  position={position}
                  onEdit={handleEditPosition}
                  onDelete={handleDeletePosition}
                  onConvert={handleConvertPosition}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {vacantPositions.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={vacantPagination.page}
            totalPages={vacantPagination.totalPages}
            totalItems={vacantPagination.count}
            pageSize={vacantPagination.pageSize}
            onPageChange={setVacantPositionsPage}
            onPageSizeChange={setVacantPositionsPageSize}
            loading={loading.vacantPositions}
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

      {/* Modals */}
      {isCreateModalOpen && (
        <VacantPositionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
          mode="create"
          darkMode={darkMode}
        />
      )}

      {isEditModalOpen && selectedPosition && (
        <VacantPositionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPosition(null);
          }}
          onSubmit={handleEditSubmit}
          mode="edit"
          initialData={selectedPosition}
          darkMode={darkMode}
        />
      )}

      {isConvertModalOpen && selectedPosition && (
        <ConvertToEmployeeModal
          isOpen={isConvertModalOpen}
          onClose={() => {
            setIsConvertModalOpen(false);
            setSelectedPosition(null);
          }}
          onSubmit={handleConvertSubmit}
          position={selectedPosition}
          darkMode={darkMode}
        />
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
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default VacantPositionsTable;