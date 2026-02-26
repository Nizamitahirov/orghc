// src/components/headcount/AdvancedFilterPanel.jsx - UPDATED with common components
import { useState, useEffect, useMemo, useCallback  } from "react";
import { X, Search, AlertCircle, Filter, Check, ChevronDown, RefreshCw } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import SearchableDropdown from "../common/SearchableDropdown"; // Import common component
import MultiSelect from "../common/MultiSelect"; // Import common component
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";


const AdvancedFilterPanel = ({ 
  onApply, 
  onClose, 
  initialFilters = {}
}) => {
  const { darkMode } = useTheme();

  // ========================================
  // HOOKS FOR DATA
  // ========================================
  const {
    businessFunctionsDropdown = [],
    departmentsDropdown = [],
    unitsDropdown = [],
    jobFunctionsDropdown = [],
    positionGroupsDropdown = [],
    employeeStatusesDropdown = [],
    employeeTagsDropdown = [],
    contractConfigsDropdown = [],
    loading = {},
    error = {},
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups,
    fetchEmployeeStatuses,
    fetchEmployeeTags,
    fetchContractConfigs,
    loadDepartmentsForBusinessFunction,
    loadUnitsForDepartment
  } = useReferenceData();

  const {
    formattedEmployees = [],
    loading: employeesLoading = {},
    fetchEmployees,
    statistics = {}
  } = useEmployees();

  // ========================================
  // SAFE STRING UTILITY FUNCTIONS
  // ========================================
  
  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };

  const safeLocaleCompare = (a, b, field = 'label') => {
    const aValue = safeString(a[field]);
    const bValue = safeString(b[field]);
    return aValue.localeCompare(bValue);
  };

  // ========================================
  // LOCAL FILTER STATE
  // ========================================
  const [filters, setFilters] = useState({
    // Search fields
    search: initialFilters.search || "",
    employee_search: initialFilters.employee_search || "",
    job_title_search: initialFilters.job_title_search || "",
    
    // Multi-select arrays
    business_function: Array.isArray(initialFilters.business_function) ? initialFilters.business_function : [],
    department: Array.isArray(initialFilters.department) ? initialFilters.department : [],
    unit: Array.isArray(initialFilters.unit) ? initialFilters.unit : [],
    job_function: Array.isArray(initialFilters.job_function) ? initialFilters.job_function : [],
    position_group: Array.isArray(initialFilters.position_group) ? initialFilters.position_group : [],
    status: Array.isArray(initialFilters.status) ? initialFilters.status : [],
    grading_level: Array.isArray(initialFilters.grading_level) ? initialFilters.grading_level : [],
    contract_duration: Array.isArray(initialFilters.contract_duration) ? initialFilters.contract_duration : [],
    line_manager: Array.isArray(initialFilters.line_manager) ? initialFilters.line_manager : [],
    tags: Array.isArray(initialFilters.tags) ? initialFilters.tags : [],
    gender: Array.isArray(initialFilters.gender) ? initialFilters.gender : [],
    
    // Date fields
    start_date_from: initialFilters.start_date_from || "",
    start_date_to: initialFilters.start_date_to || "",
    contract_end_date_from: initialFilters.contract_end_date_from || "",
    contract_end_date_to: initialFilters.contract_end_date_to || "",
    
    // Numeric fields
    years_of_service_min: initialFilters.years_of_service_min || "",
    years_of_service_max: initialFilters.years_of_service_max || "",
    contract_expiring_days: initialFilters.contract_expiring_days || "",
    
    // Boolean fields
    is_active: initialFilters.is_active || "",
    is_visible_in_org_chart: initialFilters.is_visible_in_org_chart || "",
    status_needs_update: initialFilters.status_needs_update || ""
  });

  // ========================================
  // THEME CLASSES
  // ========================================
  const bgPanel = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";

  // ========================================
  // INITIALIZE REFERENCE DATA
  // ========================================
  const initializeReferenceData = useCallback(async () => {

    
    const promises = [
      fetchBusinessFunctions?.(),
      fetchDepartments?.(),
      fetchUnits?.(),
      fetchJobFunctions?.(),
      fetchPositionGroups?.(),
      fetchEmployeeStatuses?.(),
      fetchEmployeeTags?.(),
      fetchContractConfigs?.(),
      fetchEmployees?.({ limit: 5000 })
    ].filter(Boolean);
    
    try {
      await Promise.allSettled(promises);
     
    } catch (error) {
      console.error('❌ ADVANCED FILTER: Reference data initialization failed:', error);
    }
  }, [
    fetchBusinessFunctions, fetchDepartments, fetchUnits, fetchJobFunctions,
    fetchPositionGroups, fetchEmployeeStatuses, fetchEmployeeTags, 
    fetchContractConfigs, fetchEmployees
  ]);

  useEffect(() => {
    initializeReferenceData();
  }, [initializeReferenceData]);

  // ========================================
  // STABLE APPLY FILTERS FUNCTION
  // ========================================
  const applyFilters = useCallback((filtersToApply) => {
    const targetFilters = filtersToApply || filters;
   
    
    const cleanedFilters = {};
    
    Object.entries(targetFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (key === 'department') {
            const expandedValues = [];
            value.forEach(dept => {
              if (dept.includes(',')) {
                expandedValues.push(...dept.split(','));
              } else {
                expandedValues.push(dept);
              }
            });
            const cleanValues = expandedValues.filter(v => v !== null && v !== undefined && v !== '');
            if (cleanValues.length > 0) {
              cleanedFilters[key] = cleanValues;
            }
          } else {
            const cleanValues = value.filter(v => v !== null && v !== undefined && v !== '');
            if (cleanValues.length > 0) {
              cleanedFilters[key] = cleanValues;
            }
          }
        }
      } else if (value && value.toString().trim() !== "") {
        cleanedFilters[key] = value.toString().trim();
      }
    });

   
    onApply(cleanedFilters);
  }, [onApply]);

  // ========================================
  // PREPARE OPTIONS FOR COMMON COMPONENTS
  // ========================================

  // Format options for MultiSelect component (expects {id, name} format)
  const formatOptionsForMultiSelect = (options, valueField = 'value', labelField = 'label') => {
    return options.map(option => ({
      id: option[valueField] || option.id,
      name: option[labelField] || option.label || option.name,
      ...option // preserve other properties
    }));
  };

  // Employee options for MultiSelect
  const employeeOptionsForMultiSelect = useMemo(() => {
    if (!Array.isArray(formattedEmployees)) return [];

    return formattedEmployees
      .filter(emp => emp && emp.is_active !== false)
      .map(emp => ({
        id: emp.id || emp.employee_id || '',
        name: safeString(emp.fullName || emp.displayName || emp.name) || 'Unknown Employee',
        label: safeString(emp.fullName || emp.displayName || emp.name) || 'Unknown Employee'
      }))
      .filter(emp => emp.name !== 'Unknown Employee')
      .sort((a, b) => safeLocaleCompare(a, b, 'name'));
  }, [formattedEmployees]);

  // Company options
  const businessFunctionOptionsForMultiSelect = useMemo(() => {
    if (!Array.isArray(businessFunctionsDropdown)) return [];

    return formatOptionsForMultiSelect(
      businessFunctionsDropdown.filter(bf => bf && bf.is_active !== false)
    );
  }, [businessFunctionsDropdown]);

  // Department options
  const departmentOptionsForMultiSelect = useMemo(() => {
    if (!Array.isArray(departmentsDropdown)) return [];

    const departmentGroups = {};
    
    departmentsDropdown
      .filter(dept => dept && dept.is_active !== false)
      .forEach(dept => {
        const deptName = safeString(dept.label || dept.name || dept.display_name);
        if (!deptName) return;
        
        if (!departmentGroups[deptName]) {
          departmentGroups[deptName] = {
            id: dept.value || dept.id || '',
            name: deptName,
            values: [],
            business_functions: []
          };
        }
        
        const deptValue = dept.value || dept.id || '';
        if (deptValue && !departmentGroups[deptName].values.includes(deptValue)) {
          departmentGroups[deptName].values.push(deptValue);
        }
      });

    return Object.values(departmentGroups).map(group => ({
      id: group.values.join(','),
      name: group.name,
      label: group.name
    }));
  }, [departmentsDropdown]);

  // Other options using the same pattern
  const unitOptionsForMultiSelect = useMemo(() => {
    if (!Array.isArray(unitsDropdown)) return [];
    
    let filteredUnits = unitsDropdown.filter(unit => unit && unit.is_active !== false);
    
    if (filters.department.length > 0) {
      const allDeptValues = [];
      filters.department.forEach(selectedDept => {
        if (selectedDept.includes(',')) {
          allDeptValues.push(...selectedDept.split(','));
        } else {
          allDeptValues.push(selectedDept);
        }
      });
      
      filteredUnits = filteredUnits.filter(unit => 
        allDeptValues.includes(unit.department?.toString())
      );
    }
    
    return formatOptionsForMultiSelect(filteredUnits);
  }, [unitsDropdown, filters.department]);

  const jobFunctionOptionsForMultiSelect = useMemo(() => {
    return formatOptionsForMultiSelect(
      jobFunctionsDropdown.filter(jf => jf && jf.is_active !== false)
    );
  }, [jobFunctionsDropdown]);

  const positionGroupOptionsForMultiSelect = useMemo(() => {
    return formatOptionsForMultiSelect(
      positionGroupsDropdown.filter(pg => pg && pg.is_active !== false)
    );
  }, [positionGroupsDropdown]);

  const statusOptionsForMultiSelect = useMemo(() => {
    return formatOptionsForMultiSelect(
      employeeStatusesDropdown.filter(status => status && status.is_active !== false)
    );
  }, [employeeStatusesDropdown]);

  const tagOptionsForMultiSelect = useMemo(() => {
    return formatOptionsForMultiSelect(
      employeeTagsDropdown.filter(tag => tag && tag.is_active !== false)
    );
  }, [employeeTagsDropdown]);

  const contractDurationOptionsForMultiSelect = useMemo(() => {
    return formatOptionsForMultiSelect(
      contractConfigsDropdown.filter(contract => contract && contract.is_active !== false)
    );
  }, [contractConfigsDropdown]);

  const lineManagerOptionsForMultiSelect = useMemo(() => {
    return formattedEmployees
      .filter(emp => emp && emp.is_active !== false && emp.direct_reports_count > 0)
      .map(mgr => ({
        id: mgr.id || mgr.employee_id || '',
        name: safeString(mgr.fullName || mgr.displayName || mgr.name) || 'Unknown Manager',
        label: safeString(mgr.fullName || mgr.displayName || mgr.name) || 'Unknown Manager'
      }))
      .filter(mgr => mgr.name !== 'Unknown Manager')
      .sort((a, b) => safeLocaleCompare(a, b, 'name'));
  }, [formattedEmployees]);

  const allGradingLevelsOptionsForMultiSelect = useMemo(() => {
    if (!Array.isArray(formattedEmployees)) return [];

    const uniqueGradingLevels = new Set();
    
    formattedEmployees.forEach(emp => {
      if (emp && emp.grading_level) {
        const grade = safeString(emp.grading_level).trim();
        if (grade && grade !== '' && grade !== 'null' && grade !== 'undefined') {
          uniqueGradingLevels.add(grade);
        }
      }
    });
    
    return Array.from(uniqueGradingLevels).map(code => {
      let display = code;
      let full_name = code;
      
      switch(code) {
        case '_LD':
          display = '-LD';
          full_name = 'Lower Decile';
          break;
        case '_LQ':
          display = '-LQ';
          full_name = 'Lower Quartile';
          break;
        case '_M':
        case 'M':
          display = code === '_M' ? '-M' : 'M';
          full_name = 'Median';
          break;
        case '_UQ':
          display = '-UQ';
          full_name = 'Upper Quartile';
          break;
        case '_UD':
          display = '-UD';
          full_name = 'Upper Decile';
          break;
        default:
          display = code;
          full_name = `Grade ${code}`;
      }
      
      return {
        id: code,
        name: `${display} - ${full_name}`,
        label: `${display} - ${full_name}`
      };
    }).sort((a, b) => {
      const order = ['_LD', '_LQ', '_M', 'M', '_UQ', '_UD'];
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [formattedEmployees]);

  // Static options for dropdowns
  const genderOptionsForSearchable = [
    { value: '', label: 'All' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  const booleanOptionsForSearchable = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  // ========================================
  // FILTER CHANGE HANDLERS
  // ========================================
  
  const handleInputChange = useCallback((name, value) => {
    
    
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [name]: value
      };
      
      if (name !== 'employee_search') {
        setTimeout(() => {
          applyFilters(newFilters);
        }, 0);
      }
      
      return newFilters;
    });
    
    // Load dependent data for hierarchical filters
    if (name === 'business_function' && Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(bfId => {
          if (bfId && loadDepartmentsForBusinessFunction) {
            loadDepartmentsForBusinessFunction(bfId);
          }
        });
      }
    }
    
    if (name === 'department' && Array.isArray(value)) {
      if (value.length > 0) {
        const allDeptValues = [];
        value.forEach(selectedDept => {
          if (selectedDept.includes(',')) {
            allDeptValues.push(...selectedDept.split(','));
          } else {
            allDeptValues.push(selectedDept);
          }
        });
        
        allDeptValues.forEach(deptId => {
          if (deptId && loadUnitsForDepartment) {
            loadUnitsForDepartment(deptId);
          }
        });
      }
    }
  }, [applyFilters, loadDepartmentsForBusinessFunction, loadUnitsForDepartment]);

  // Handle MultiSelect component changes (expects fieldName, value format)
  const handleMultiSelectChangeAdapter = useCallback((fieldName, value) => {
 
    
    setFilters(prevFilters => {
      // Get current selected values
      const currentValues = Array.isArray(prevFilters[fieldName]) ? prevFilters[fieldName] : [];
      
      // Toggle the value (add if not present, remove if present)
      let newValues;
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      
      const newFilters = {
        ...prevFilters,
        [fieldName]: newValues
      };
      
      // Apply filters automatically except for employee_search
      if (fieldName !== 'employee_search') {
        setTimeout(() => {
          applyFilters(newFilters);
        }, 50);
      }
      
      return newFilters;
    });
  }, [applyFilters]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    
    
    const clearedFilters = {
      search: "",
      employee_search: "",
      job_title_search: "",
      business_function: [],
      department: [],
      unit: [],
      job_function: [],
      position_group: [],
      status: [],
      grading_level: [],
      contract_duration: [],
      line_manager: [],
      tags: [],
      gender: [],
      start_date_from: "",
      start_date_to: "",
      contract_end_date_from: "",
      contract_end_date_to: "",
      years_of_service_min: "",
      years_of_service_max: "",
      contract_expiring_days: "",
      is_active: "",
      is_visible_in_org_chart: "",
      status_needs_update: ""
    };
    
    setFilters(clearedFilters);
    onApply({});
  }, [onApply]);

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className={`${bgPanel} rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between py-4 px-6 border-b ${borderColor}`}>
          <div>
            <h2 className={`text-lg font-semibold ${textPrimary}`}>Advanced Filters</h2>
            <p className={`text-xs ${textMuted} mt-1`}>
              Apply detailed filters to refine your employee search
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error State */}
          {Object.values(error).some(err => err) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  Some data failed to load. Please try refreshing.
                </span>
                <button
                  onClick={initializeReferenceData}
                  className="ml-4 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex items-center"
                >
                  <RefreshCw size={12} className="mr-1" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Filter Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Search & Organizational */}
            <div className="space-y-4">
             

              {/* Employee Search using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Select Specific Employee
                  {employeeOptionsForMultiSelect.length > 0 && (
                    <span className={`ml-2 text-xs ${textMuted}`}>
                      ({employeeOptionsForMultiSelect.length} employees)
                    </span>
                  )}
                </label>
                <MultiSelect
                  options={employeeOptionsForMultiSelect}
                  selected={filters.employee_search}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Search and select employees..."
                  fieldName="employee_search"
                  darkMode={darkMode}
                />
                {filters.employee_search && filters.employee_search.length > 0 && (
                  <div className={`mt-2 text-xs ${textMuted}`}>
                    ⚠️ {filters.employee_search.length} employee(s) selected. Click "Apply Filters" to search.
                  </div>
                )}
              </div>

              {/* Company using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Company
                </label>
                <MultiSelect
                  options={businessFunctionOptionsForMultiSelect}
                  selected={filters.business_function}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select Companys..."
                  fieldName="business_function"
                  darkMode={darkMode}
                />
              </div>

              {/* Department using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Department
                </label>
                <MultiSelect
                  options={departmentOptionsForMultiSelect}
                  selected={filters.department}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select departments..."
                  fieldName="department"
                  darkMode={darkMode}
                />
              </div>

              {/* Unit using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Unit
                </label>
                <MultiSelect
                  options={unitOptionsForMultiSelect}
                  selected={filters.unit}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder={unitOptionsForMultiSelect.length > 0 ? "Select units..." : "Select department first..."}
                  fieldName="unit"
                  darkMode={darkMode}
                />
              </div>

              {/* Job Function using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Job Function
                </label>
                <MultiSelect
                  options={jobFunctionOptionsForMultiSelect}
                  selected={filters.job_function}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select job functions..."
                  fieldName="job_function"
                  darkMode={darkMode}
                />
              </div>

            </div>

            {/* Middle Column - Employment Details */}
            <div className="space-y-4">
          

              {/* Grading Level using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Grading Level
                </label>
                <MultiSelect
                  options={allGradingLevelsOptionsForMultiSelect}
                  selected={filters.grading_level}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select grading levels..."
                  fieldName="grading_level"
                  darkMode={darkMode}
                />
              </div>

              {/* Contract Duration using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Contract Duration
                </label>
                <MultiSelect
                  options={contractDurationOptionsForMultiSelect}
                  selected={filters.contract_duration}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select contract types..."
                  fieldName="contract_duration"
                  darkMode={darkMode}
                />
              </div>

              {/* Gender using SearchableDropdown */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Gender
                </label>
                <SearchableDropdown
                  options={genderOptionsForSearchable}
                  value={filters.gender}
                  onChange={(value) => handleInputChange('gender', value)}
                  placeholder="Select gender..."
                  darkMode={darkMode}
                       allowUncheck={true}
                />
              </div>

              {/* Employment Status using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Employment Status
                </label>
                <MultiSelect
                  options={statusOptionsForMultiSelect}
                  selected={filters.status}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select statuses..."
                  fieldName="status"
                  darkMode={darkMode}
                />
              </div>

              {/* Job Title Search */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Job Title Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={filters.job_title_search}
                    onChange={(e) => handleInputChange('job_title_search', e.target.value)}
                    className={`w-full p-2 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  {filters.job_title_search && (
                    <button
                      onClick={() => handleInputChange('job_title_search', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Management & Additional */}
            <div className="space-y-4">
            
              {/* Hierarchy using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Hierarchy
                </label>
                <MultiSelect
                  options={positionGroupOptionsForMultiSelect}
                  selected={filters.position_group}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select Hierarchys..."
                  fieldName="position_group"
                  darkMode={darkMode}
                />
              </div>

              {/* Line Manager using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Line Manager
                  {lineManagerOptionsForMultiSelect.length > 0 && (
                    <span className={`ml-2 text-xs ${textMuted}`}>
                      ({lineManagerOptionsForMultiSelect.length} managers)
                    </span>
                  )}
                </label>
                <MultiSelect
                  options={lineManagerOptionsForMultiSelect}
                  selected={filters.line_manager}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder={lineManagerOptionsForMultiSelect.length > 0 ? 
                    "Search and select line managers..." : "Loading managers..."}
                  fieldName="line_manager"
                  darkMode={darkMode}
                />
              </div>

              {/* Tags using MultiSelect */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Tags
                </label>
                <MultiSelect
                  options={tagOptionsForMultiSelect}
                  selected={filters.tags}
                  onChange={handleMultiSelectChangeAdapter}
                  placeholder="Select tags..."
                  fieldName="tags"
                  darkMode={darkMode}
                />
              </div>

             

              {/* Visible in Org Chart using SearchableDropdown */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Visible in Org Chart
                </label>
                <SearchableDropdown
                  options={booleanOptionsForSearchable}
                  value={filters.is_visible_in_org_chart}
                  onChange={(value) => handleInputChange('is_visible_in_org_chart', value)}
                  placeholder="Select visibility..."
                  darkMode={darkMode}
                       allowUncheck={true}
                />
              </div>

              

              {/* Contract Expiring Days */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Contract Expiring Within (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  placeholder="e.g., 30"
                  value={filters.contract_expiring_days}
                  onChange={(e) => handleInputChange('contract_expiring_days', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
            </div>
          </div>

          {/* Date Filters Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className={`font-medium ${textPrimary} mb-4 text-xs`}>
              Date Ranges
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Date Range */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Start Date From
                </label>
                <input
                  type="date"
                  value={filters.start_date_from}
                  onChange={(e) => handleInputChange('start_date_from', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
              
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Start Date To
                </label>
                <input
                  type="date"
                  value={filters.start_date_to}
                  onChange={(e) => handleInputChange('start_date_to', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>

              {/* Contract End Date Range */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Contract End From
                </label>
                <input
                  type="date"
                  value={filters.contract_end_date_from}
                  onChange={(e) => handleInputChange('contract_end_date_from', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
              
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Contract End To
                </label>
                <input
                  type="date"
                  value={filters.contract_end_date_to}
                  onChange={(e) => handleInputChange('contract_end_date_to', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
            </div>

            {/* Years of Service Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Years of Service (Min)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 1"
                  value={filters.years_of_service_min}
                  onChange={(e) => handleInputChange('years_of_service_min', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
              
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Years of Service (Max)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 10"
                  value={filters.years_of_service_max}
                  onChange={(e) => handleInputChange('years_of_service_max', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-xs focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${borderColor} bg-gray-50 dark:bg-gray-900`}>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
          
          <div className="flex items-center space-x-3">
            {/* Show apply needed indicator */}
            {filters.employee_search && filters.employee_search.length > 0 && (
              <span className={`text-xs ${textMuted} italic`}>
                Employee selection pending...
              </span>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => applyFilters()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                filters.employee_search && filters.employee_search.length > 0
                  ? 'bg-orange-500 hover:bg-orange-600 animate-pulse'
                  : 'bg-almet-sapphire hover:bg-almet-astral'
              }`}
            >
              Apply Filters
              {filters.employee_search && filters.employee_search.length > 0 && (
                <span className="ml-1">({filters.employee_search.length})</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;