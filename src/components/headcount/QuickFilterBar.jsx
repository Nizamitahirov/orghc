// COPY this entire file to: src/components/headcount/QuickFilterBar.jsx

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, X, Check, Filter, AlertCircle, RefreshCw, Users, Search } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";

const QuickFilterBar = ({
  onStatusChange,
  onDepartmentChange,
  onBusinessFunctionChange,
  onPositionGroupChange,
  statusFilter = [],
  departmentFilter = [],
  businessFunctionFilter = [],
  positionGroupFilter = [],
  activeFilters = [],
  onClearFilter,
  onClearAllFilters,
  statistics = {},
  showCounts = true,
  compactMode = false
}) => {
  const { darkMode } = useTheme();
  const [retryAttempts, setRetryAttempts] = useState({});

  const {
    employeeStatuses = [],
    departments = [],
    businessFunctions = [],
    positionGroups = [],
    loading = {},
    error = {},
    getFormattedEmployeeStatuses,
    getFormattedPositionGroups,
    hasEmployeeStatuses,
    hasDepartments,
    hasBusinessFunctions,
    hasPositionGroups,
    fetchEmployeeStatuses,
    fetchDepartments,
    fetchBusinessFunctions,
    fetchPositionGroups
  } = useReferenceData();

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      const tasks = [];
      
      if (!hasEmployeeStatuses() && !loading.employeeStatuses && !error.employeeStatuses) {
        tasks.push({ name: 'employeeStatuses', action: () => fetchEmployeeStatuses?.() });
      }
      if (!hasDepartments() && !loading.departments && !error.departments) {
        tasks.push({ name: 'departments', action: () => fetchDepartments?.() });
      }
      if (!hasBusinessFunctions() && !loading.businessFunctions && !error.businessFunctions) {
        tasks.push({ name: 'businessFunctions', action: () => fetchBusinessFunctions?.() });
      }
      if (!hasPositionGroups() && !loading.positionGroups && !error.positionGroups) {
        tasks.push({ name: 'positionGroups', action: () => fetchPositionGroups?.() });
      }
      
      for (const task of tasks) {
        try {
          await task.action();
        } catch (error) {
          console.error(`Failed to initialize ${task.name}:`, error);
        }
      }
    };
    
    initializeData();
  }, [
    hasEmployeeStatuses, hasDepartments, hasBusinessFunctions, hasPositionGroups,
    loading.employeeStatuses, loading.departments, loading.businessFunctions, loading.positionGroups,
    error.employeeStatuses, error.departments, error.businessFunctions, error.positionGroups,
    fetchEmployeeStatuses, fetchDepartments, fetchBusinessFunctions, fetchPositionGroups
  ]);

  // Status options
  const statusOptions = useMemo(() => {
    return getFormattedEmployeeStatuses() || [];
  }, [employeeStatuses, getFormattedEmployeeStatuses]);

  // Department options (grouped)
  const departmentOptions = useMemo(() => {
    if (!Array.isArray(departments)) return [];

    const departmentGroups = departments.reduce((acc, dept) => {
      if (!dept || typeof dept !== 'object' || dept.is_active === false) return acc;

      const deptName = dept.name || dept.label || dept.display_name || '';
      if (!deptName) return acc;

      if (!acc[deptName]) {
        acc[deptName] = {
          name: deptName,
          businessFunctions: [],
          totalEmployees: 0,
          departments: []
        };
      }

      acc[deptName].businessFunctions.push(dept.business_function_name || dept.business_function_code || '');
      acc[deptName].totalEmployees += dept.employee_count || 0;
      acc[deptName].departments.push(dept);

      return acc;
    }, {});

    return Object.values(departmentGroups)
      .map(group => ({
        value: group.name,
        label: group.name,
        allBusinessFunctions: [...new Set(group.businessFunctions.filter(Boolean))],
        employee_count: group.totalEmployees,
        departments: group.departments
      }))
      .filter(dept => dept.label)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [departments]);

  // ✅ Company options - USE ID AS VALUE
  const businessFunctionOptions = useMemo(() => {
    if (!Array.isArray(businessFunctions)) return [];
    
    
    
    return businessFunctions
      .filter(bf => bf && bf.is_active !== false)
      .map(bf => {
        const option = {
          value: bf.id || bf.value, // ✅ ID for selection
          label: bf.name || bf.label,
          name: bf.name || bf.label, // Keep name for backend
          code: bf.code,
          employee_count: bf.employee_count || 0
        };
  
        return option;
      })
      .sort((a, b) => (a.label || '').localeCompare(b.label || ''));
  }, [businessFunctions]);

  // Position Group options
  const positionGroupOptions = useMemo(() => {
    return getFormattedPositionGroups() || [];
  }, [positionGroups, getFormattedPositionGroups]);

  // Department selection handler
  const getSelectedDepartmentNames = useMemo(() => {
    if (!Array.isArray(departmentFilter) || departmentFilter.length === 0) return [];
    
    const selectedNames = new Set();
    departmentFilter.forEach(deptId => {
      const dept = departments.find(d => (d.id || d.value) === deptId);
      if (dept) {
        selectedNames.add(dept.name || dept.label || dept.display_name);
      }
    });
    
    return Array.from(selectedNames);
  }, [departmentFilter, departments]);

  const handleDepartmentChange = useCallback((selectedDepartmentNames) => {
    if (!Array.isArray(selectedDepartmentNames)) {
      onDepartmentChange?.([]);
      return;
    }

    const allDepartmentIds = [];
    selectedDepartmentNames.forEach(deptName => {
      const matchingDepartments = departments.filter(dept => 
        (dept.name || dept.label || dept.display_name) === deptName && 
        dept.is_active !== false
      );
      
      matchingDepartments.forEach(dept => {
        if (dept.id || dept.value) {
          allDepartmentIds.push(dept.id || dept.value);
        }
      });
    });

    onDepartmentChange?.(allDepartmentIds);
  }, [departments, onDepartmentChange]);

  // Retry handlers
  const handleRetryStatus = useCallback(async () => {
    const retryCount = retryAttempts.status || 0;
    if (retryCount >= 3) return;
    setRetryAttempts(prev => ({ ...prev, status: retryCount + 1 }));
    try {
      await fetchEmployeeStatuses?.();
      setRetryAttempts(prev => ({ ...prev, status: 0 }));
    } catch (error) {
      console.error('Status retry failed:', error);
    }
  }, [fetchEmployeeStatuses, retryAttempts.status]);

  const handleRetryDepartments = useCallback(async () => {
    const retryCount = retryAttempts.departments || 0;
    if (retryCount >= 3) return;
    setRetryAttempts(prev => ({ ...prev, departments: retryCount + 1 }));
    try {
      await fetchDepartments?.();
      setRetryAttempts(prev => ({ ...prev, departments: 0 }));
    } catch (error) {
      console.error('Departments retry failed:', error);
    }
  }, [fetchDepartments, retryAttempts.departments]);

  const handleRetryBusinessFunctions = useCallback(async () => {
    const retryCount = retryAttempts.businessFunctions || 0;
    if (retryCount >= 3) return;
    setRetryAttempts(prev => ({ ...prev, businessFunctions: retryCount + 1 }));
    try {
      await fetchBusinessFunctions?.();
      setRetryAttempts(prev => ({ ...prev, businessFunctions: 0 }));
    } catch (error) {
      console.error('Companys retry failed:', error);
    }
  }, [fetchBusinessFunctions, retryAttempts.businessFunctions]);

  const handleRetryPositionGroups = useCallback(async () => {
    const retryCount = retryAttempts.positionGroups || 0;
    if (retryCount >= 3) return;
    setRetryAttempts(prev => ({ ...prev, positionGroups: retryCount + 1 }));
    try {
      await fetchPositionGroups?.();
      setRetryAttempts(prev => ({ ...prev, positionGroups: 0 }));
    } catch (error) {
      console.error('Position groups retry failed:', error);
    }
  }, [fetchPositionGroups, retryAttempts.positionGroups]);

  const handleClearAll = useCallback(() => {
    onStatusChange?.([]);
    onDepartmentChange?.([]);
    onBusinessFunctionChange?.([]);
    onPositionGroupChange?.([]);
    
    if (onClearAllFilters && typeof onClearAllFilters === 'function') {
      onClearAllFilters();
    }
  }, [onStatusChange, onDepartmentChange, onBusinessFunctionChange, onPositionGroupChange, onClearAllFilters]);



  return (
    <div className="flex items-center gap-3 flex-wrap">
      <MultiSelectDropdown
        label="Status"
        options={statusOptions}
        selectedValues={statusFilter}
        onChange={onStatusChange}
        dropdownKey="status"
        placeholder="All Statuses"
        isLoading={loading.employeeStatuses}
        hasError={!!error.employeeStatuses}
        showColors={true}
        icon={Users}
        onRetry={handleRetryStatus}
        darkMode={darkMode}
        compactMode={compactMode}
      />

      <MultiSelectDropdown
        label="Department"
        options={departmentOptions}
        selectedValues={getSelectedDepartmentNames}
        onChange={handleDepartmentChange}
        dropdownKey="department"
        placeholder="All Departments"
        isLoading={loading.departments}
        hasError={!!error.departments}
        icon={Filter}
        onRetry={handleRetryDepartments}
        darkMode={darkMode}
        compactMode={compactMode}
        showEmployeeCount={true}
      />

      {!compactMode && (
        <MultiSelectDropdown
          label="Company"
          options={businessFunctionOptions}
          selectedValues={businessFunctionFilter}
          onChange={onBusinessFunctionChange}
          dropdownKey="businessFunction"
          placeholder="All Companys"
          isLoading={loading.businessFunctions}
          hasError={!!error.businessFunctions}
          showCodes={true}
          icon={Filter}
          onRetry={handleRetryBusinessFunctions}
          darkMode={darkMode}
          compactMode={compactMode}
        />
      )}

      {!compactMode && (
        <MultiSelectDropdown
          label="Position Group"
          options={positionGroupOptions}
          selectedValues={positionGroupFilter}
          onChange={onPositionGroupChange}
          dropdownKey="positionGroup"
          placeholder="All Positions"
          isLoading={loading.positionGroups}
          hasError={!!error.positionGroups}
          icon={Users}
          onRetry={handleRetryPositionGroups}
          darkMode={darkMode}
          compactMode={compactMode}
        />
      )}

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-almet-sapphire/10 border border-almet-sapphire/20 text-almet-sapphire flex items-center">
            <Filter size={12} className="mr-1" />
            {activeFilters.length} active
          </div>
          
          <button
            onClick={handleClearAll}
            className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center transition-colors"
            title="Clear all filters"
          >
            <X size={12} className="mr-1" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

// MultiSelectDropdown Component
const MultiSelectDropdown = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  dropdownKey,
  placeholder = "Select options",
  isLoading = false,
  hasError = false,
  showColors = false,
  showCodes = false,
  icon: IconComponent = null,
  onRetry = null,
  compactMode = false,
  darkMode = false,
  showEmployeeCount = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const dropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selectedValues) ? selectedValues : [];
  const selectedCount = safeSelected.length;
  const disabled = isLoading || hasError;

 

  const filteredOptions = safeOptions.filter(option => {
    if (!option || !searchTerm) return true;
    const label = (option.label || option.name || '').toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getButtonText = () => {
    if (isLoading) return `Loading...`;
    if (hasError) return `Error`;
    if (selectedCount === 0) return placeholder;
    if (selectedCount === 1) {
      const selected = safeOptions.find(opt => 
        safeSelected.includes(opt.value) || 
        safeSelected.includes(String(opt.value)) ||
        safeSelected.includes(Number(opt.value))
      );
      return selected?.label || `1 selected`;
    }
    return `${selectedCount} selected`;
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleOptionToggle = (value) => {
   
    
    // ✅ Check if selected (handle different types)
    const isCurrentlySelected = safeSelected.some(v => 
      v === value || 
      String(v) === String(value) || 
      Number(v) === Number(value)
    );
    
    let newSelection;
    if (isCurrentlySelected) {
      newSelection = safeSelected.filter(v => 
        v !== value && 
        String(v) !== String(value) && 
        Number(v) !== Number(value)
      );
    } else {
      newSelection = [...safeSelected, value];
    }
    
   
    
    if (onChange) {
      onChange(newSelection);
    }
  };

  const handleSelectAll = () => {
    if (safeSelected.length === filteredOptions.length) {
      onChange?.([]);
    } else {
      onChange?.(filteredOptions.map(opt => opt.value));
    }
  };

  const handleClear = () => {
    onChange?.([]);
  };

  const handleRetry = () => {
    if (retryCount < 3 && onRetry) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  };

  // ✅ FIXED: Check if item is selected
  const isItemSelected = (value) => {
    const selected = safeSelected.some(v => 
      v === value || 
      String(v) === String(value) || 
      Number(v) === Number(value)
    );
  
    return selected;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          ${bgCard} border ${hasError ? 'border-red-400' : borderColor}
          px-3 py-2 rounded-lg text-sm
          flex items-center gap-2
          ${compactMode ? 'min-w-[130px]' : 'min-w-[160px]'}
          ${textPrimary}
          transition-all duration-150
          ${isOpen ? 'border-almet-sapphire shadow-sm' : ''}
          ${!disabled ? 'hover:border-almet-sapphire/50 hover:shadow-sm' : 'opacity-60 cursor-not-allowed'}
        `}
      >
        {IconComponent && (
          <IconComponent size={16} className={selectedCount > 0 ? 'text-almet-sapphire' : textMuted} />
        )}
        <span className="flex-1 truncate font-medium text-left">
          {getButtonText()}
        </span>
        <ChevronDown 
          size={14} 
          className={`flex-shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''} ${textMuted}`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`
            fixed z-[9999]
            ${bgCard} border ${borderColor} 
            rounded-lg shadow-xl
            min-w-[260px] max-w-[400px]
          `}
          style={{
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 4 : 0,
            left: dropdownRef.current ? Math.max(8, Math.min(
              dropdownRef.current.getBoundingClientRect().left,
              window.innerWidth - 268
            )) : 0
          }}
        >
          <div className={`px-3 py-2.5 border-b ${borderColor} flex items-center justify-between`}>
            <span className={`text-sm font-semibold ${textPrimary}`}>{label}</span>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Clear
                </button>
              )}
              {filteredOptions.length > 1 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-almet-sapphire hover:text-almet-astral font-medium transition-colors"
                >
                  {safeSelected.length === filteredOptions.length ? 'Deselect' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          {safeOptions.length > 5 && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-8 pr-2 py-1.5 border ${borderColor} rounded-md ${bgCard} ${textPrimary} text-xs placeholder-gray-400 outline-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire/20`}
                />
              </div>
            </div>
          )}

          <div className="max-h-[280px] overflow-y-auto overscroll-contain">
            {hasError ? (
              <div className="p-4 text-center">
                <AlertCircle className={`w-6 h-6 mx-auto mb-2 text-red-400`} />
                <p className={`text-xs ${textMuted} mb-2`}>Failed to load</p>
                {retryCount < 3 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center text-xs text-almet-sapphire hover:text-almet-astral transition-colors"
                  >
                    <RefreshCw size={12} className="mr-1" />
                    Retry ({retryCount + 1}/3)
                  </button>
                )}
              </div>
            ) : filteredOptions.length > 0 ? (
              <div className="py-1">
                {filteredOptions.map((option, index) => {
                  const value = option.value;
                  const label = option.label || option.name;
                  const isSelected = isItemSelected(value);

                  return (
                    <button
                      key={`${dropdownKey}-${value}-${index}`}
                      type="button"
                      onClick={() => handleOptionToggle(value)}
                      className={`
                        w-full px-3 py-2 text-left text-sm
                        ${hoverBg}
                        flex items-center gap-2.5
                        transition-colors
                        ${isSelected ? 'bg-almet-sapphire/5' : ''}
                      `}
                    >
                      <div className={`
                        w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0
                        transition-all duration-150
                        ${isSelected 
                          ? 'bg-almet-sapphire border-almet-sapphire' 
                          : `border-gray-300 ${darkMode ? 'dark:border-gray-500' : ''}`
                        }
                      `}>
                        {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                      
                      {showColors && option.color && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-200"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`${textPrimary} text-sm truncate ${isSelected ? 'font-medium' : ''}`}>
                            {label}
                          </span>
                          {showCodes && option.code && (
                            <span className={`text-xs ${textMuted} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-1.5 py-0.5 rounded`}>
                              {option.code}
                            </span>
                          )}
                        </div>
                        
                        {/* {showEmployeeCount && option.employee_count !== undefined && (
                          <span className={`text-xs ${textMuted}`}>
                            {option.employee_count} {option.employee_count === 1 ? 'employee' : 'employees'}
                          </span>
                        )} */}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 text-center ${textMuted}`}>
                <p className="text-sm">
                  {searchTerm ? `No results for "${searchTerm}"` : 'No options available'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFilterBar;