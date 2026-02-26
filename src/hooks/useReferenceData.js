// src/hooks/useReferenceData.js - Backend endpointlərinə uyğun yenilənilib
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  fetchBusinessFunctions,
  fetchDepartments,
  fetchUnits,
  fetchJobFunctions,
  fetchPositionGroups,
  fetchEmployeeStatuses,
  fetchEmployeeTags,
  fetchPositionGroupGradingLevels,
  fetchContractConfigs,
  createBusinessFunction,
  updateBusinessFunction,
  deleteBusinessFunction,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createUnit,
  updateUnit,
  deleteUnit,
  createJobFunction,
  updateJobFunction,
  deleteJobFunction,
  createPositionGroup,
  updatePositionGroup,
  deletePositionGroup,
  createEmployeeStatus,
  updateEmployeeStatus,
  deleteEmployeeStatus,
  createEmployeeTag,
  updateEmployeeTag,
  deleteEmployeeTag,
  createContractConfig,
  updateContractConfig,
  deleteContractConfig,
  clearDepartments,
  clearUnits,
  clearHierarchicalData,
  setSelectedBusinessFunction,
  setSelectedDepartment,
  clearErrors,
  clearError,
  invalidateCache,
  resetReferenceData,
  optimisticAddItem,
  optimisticUpdateItem,
  optimisticRemoveItem,
  selectBusinessFunctions,
  selectDepartments,
  selectUnits,
  selectJobFunctions,
  selectPositionGroups,
  selectEmployeeStatuses,
  selectEmployeeTags,
  selectContractConfigs,
  selectGradingLevels,
  selectSelectedBusinessFunction,
  selectSelectedDepartment,
  selectReferenceDataLoading,
  selectReferenceDataError,
  selectIsAnyReferenceDataLoading,
  selectHasAnyReferenceDataError,
  selectBusinessFunctionsForDropdown,
  selectDepartmentsForDropdown,
  selectUnitsForDropdown,
  selectJobFunctionsForDropdown,
  selectPositionGroupsForDropdown,
  selectEmployeeStatusesForDropdown,
  selectEmployeeTagsForDropdown,
  selectContractConfigsForDropdown,
  selectReferenceDataForEmployeeForm,
  selectDepartmentsByBusinessFunction,
  selectUnitsByDepartment,
  selectTagsByType,
  selectPositionGroupGradingLevels,
  selectIsDataStale,
  selectIsValidBusinessFunction,
  selectIsValidDepartment,
  selectIsValidUnit
} from '../store/slices/referenceDataSlice';

export const useReferenceData = () => {
  const dispatch = useDispatch();
  
  // Raw data selectors
  const businessFunctions = useSelector(selectBusinessFunctions) || [];
  const departments = useSelector(selectDepartments) || [];
  const units = useSelector(selectUnits) || [];
  const jobFunctions = useSelector(selectJobFunctions) || [];
  const positionGroups = useSelector(selectPositionGroups) || [];
  const employeeStatuses = useSelector(selectEmployeeStatuses) || [];
  const employeeTags = useSelector(selectEmployeeTags) || [];
  const contractConfigs = useSelector(selectContractConfigs) || [];
  const gradingLevels = useSelector(selectGradingLevels) || {};
  const selectedBusinessFunction = useSelector(selectSelectedBusinessFunction);
  const selectedDepartment = useSelector(selectSelectedDepartment);
  
  // Formatted data selectors for dropdowns
  const businessFunctionsDropdown = useSelector(selectBusinessFunctionsForDropdown) || [];
  const departmentsDropdown = useSelector(selectDepartmentsForDropdown) || [];
  const unitsDropdown = useSelector(selectUnitsForDropdown) || [];
  const jobFunctionsDropdown = useSelector(selectJobFunctionsForDropdown) || [];
  const positionGroupsDropdown = useSelector(selectPositionGroupsForDropdown) || [];
  const employeeStatusesDropdown = useSelector(selectEmployeeStatusesForDropdown) || [];
  const employeeTagsDropdown = useSelector(selectEmployeeTagsForDropdown) || [];
  const contractConfigsDropdown = useSelector(selectContractConfigsForDropdown) || [];
  
  // Combined data for forms
  const formData = useSelector(selectReferenceDataForEmployeeForm) || {};
  
  // Loading and error states
  const loading = useSelector(selectReferenceDataLoading) || {};
  const error = useSelector(selectReferenceDataError) || {};
  const isAnyLoading = useSelector(selectIsAnyReferenceDataLoading);
  const hasAnyError = useSelector(selectHasAnyReferenceDataError);

  // Basic CRUD actions
  const actions = {
    // Fetch operations
    fetchBusinessFunctions: useCallback(() => dispatch(fetchBusinessFunctions()), [dispatch]),
    fetchDepartments: useCallback((businessFunctionId) => dispatch(fetchDepartments(businessFunctionId)), [dispatch]),
    fetchUnits: useCallback((departmentId) => dispatch(fetchUnits(departmentId)), [dispatch]),
    fetchJobFunctions: useCallback(() => dispatch(fetchJobFunctions()), [dispatch]),
    fetchPositionGroups: useCallback(() => dispatch(fetchPositionGroups()), [dispatch]),
    fetchEmployeeStatuses: useCallback(() => dispatch(fetchEmployeeStatuses()), [dispatch]),
    fetchEmployeeTags: useCallback(() => dispatch(fetchEmployeeTags()), [dispatch]),
    fetchContractConfigs: useCallback(() => dispatch(fetchContractConfigs()), [dispatch]),
    fetchPositionGroupGradingLevels: useCallback((positionGroupId) => 
      dispatch(fetchPositionGroupGradingLevels(positionGroupId)), [dispatch]),
    
    // Companys CRUD
    createBusinessFunction: useCallback((data) => dispatch(createBusinessFunction(data)), [dispatch]),
    updateBusinessFunction: useCallback((id, data) => dispatch(updateBusinessFunction({ id, data })), [dispatch]),
    deleteBusinessFunction: useCallback((id) => dispatch(deleteBusinessFunction(id)), [dispatch]),
    
    // Departments CRUD
    createDepartment: useCallback((data) => dispatch(createDepartment(data)), [dispatch]),
    updateDepartment: useCallback((id, data) => dispatch(updateDepartment({ id, data })), [dispatch]),
    deleteDepartment: useCallback((id) => dispatch(deleteDepartment(id)), [dispatch]),
    
    // Units CRUD
    createUnit: useCallback((data) => dispatch(createUnit(data)), [dispatch]),
    updateUnit: useCallback((id, data) => dispatch(updateUnit({ id, data })), [dispatch]),
    deleteUnit: useCallback((id) => dispatch(deleteUnit(id)), [dispatch]),
    
    // Job functions CRUD
    createJobFunction: useCallback((data) => dispatch(createJobFunction(data)), [dispatch]),
    updateJobFunction: useCallback((id, data) => dispatch(updateJobFunction({ id, data })), [dispatch]),
    deleteJobFunction: useCallback((id) => dispatch(deleteJobFunction(id)), [dispatch]),
    
    // Position groups CRUD
    createPositionGroup: useCallback((data) => dispatch(createPositionGroup(data)), [dispatch]),
    updatePositionGroup: useCallback((id, data) => dispatch(updatePositionGroup({ id, data })), [dispatch]),
    deletePositionGroup: useCallback((id) => dispatch(deletePositionGroup(id)), [dispatch]),
    
    // Employee statuses CRUD
    createEmployeeStatus: useCallback((data) => dispatch(createEmployeeStatus(data)), [dispatch]),
    updateEmployeeStatus: useCallback((id, data) => dispatch(updateEmployeeStatus({ id, data })), [dispatch]),
    deleteEmployeeStatus: useCallback((id) => dispatch(deleteEmployeeStatus(id)), [dispatch]),
    
    // Employee tags CRUD
    createEmployeeTag: useCallback((data) => dispatch(createEmployeeTag(data)), [dispatch]),
    updateEmployeeTag: useCallback((id, data) => dispatch(updateEmployeeTag({ id, data })), [dispatch]),
    deleteEmployeeTag: useCallback((id) => dispatch(deleteEmployeeTag({ id })), [dispatch]),
    
    // Contract configs CRUD
    createContractConfig: useCallback((data) => dispatch(createContractConfig(data)), [dispatch]),
    updateContractConfig: useCallback((id, data) => dispatch(updateContractConfig({ id, data })), [dispatch]),
    deleteContractConfig: useCallback((id) => dispatch(deleteContractConfig(id)), [dispatch]),
    
    // Hierarchical data management
    clearDepartments: useCallback(() => dispatch(clearDepartments()), [dispatch]),
    clearUnits: useCallback(() => dispatch(clearUnits()), [dispatch]),
    clearHierarchicalData: useCallback(() => dispatch(clearHierarchicalData()), [dispatch]),
    setSelectedBusinessFunction: useCallback((id) => dispatch(setSelectedBusinessFunction(id)), [dispatch]),
    setSelectedDepartment: useCallback((id) => dispatch(setSelectedDepartment(id)), [dispatch]),
    
    // Hierarchical data loading
    loadDepartmentsForBusinessFunction: useCallback((businessFunctionId) => {
      if (businessFunctionId) {
        dispatch(fetchDepartments(businessFunctionId));
        dispatch(setSelectedBusinessFunction(businessFunctionId));
      } else {
        dispatch(clearDepartments());
        dispatch(clearUnits());
        dispatch(setSelectedBusinessFunction(null));
        dispatch(setSelectedDepartment(null));
      }
    }, [dispatch]),
    
    loadUnitsForDepartment: useCallback((departmentId) => {
      if (departmentId) {
        dispatch(fetchUnits(departmentId));
        dispatch(setSelectedDepartment(departmentId));
      } else {
        dispatch(clearUnits());
        dispatch(setSelectedDepartment(null));
      }
    }, [dispatch]),
    
    // Error management
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearError: useCallback((errorKey) => dispatch(clearError(errorKey)), [dispatch]),
    
    // Cache management
    invalidateCache: useCallback((dataType) => dispatch(invalidateCache(dataType)), [dispatch]),
    resetReferenceData: useCallback(() => dispatch(resetReferenceData()), [dispatch]),
    
    // Optimistic updates
    optimisticAdd: useCallback((type, item) => dispatch(optimisticAddItem({ type, item })), [dispatch]),
    optimisticUpdate: useCallback((type, id, updates) => dispatch(optimisticUpdateItem({ type, id, updates })), [dispatch]),
    optimisticRemove: useCallback((type, id) => dispatch(optimisticRemoveItem({ type, id })), [dispatch]),
    
    // Refresh all data
    refreshAllData: useCallback(() => {
      dispatch(fetchBusinessFunctions());
      dispatch(fetchJobFunctions());
      dispatch(fetchPositionGroups());
      dispatch(fetchEmployeeStatuses());
      dispatch(fetchEmployeeTags());
      dispatch(fetchContractConfigs());
    }, [dispatch]),
    
    // Load initial data
    loadInitialData: useCallback(() => {
      if (!businessFunctions.length && !loading.businessFunctions) {
        dispatch(fetchBusinessFunctions());
      }
      if (!jobFunctions.length && !loading.jobFunctions) {
        dispatch(fetchJobFunctions());
      }
      if (!positionGroups.length && !loading.positionGroups) {
        dispatch(fetchPositionGroups());
      }
      if (!employeeStatuses.length && !loading.employeeStatuses) {
        dispatch(fetchEmployeeStatuses());
      }
      if (!employeeTags.length && !loading.employeeTags) {
        dispatch(fetchEmployeeTags());
      }
      if (!contractConfigs.length && !loading.contractConfigs) {
        dispatch(fetchContractConfigs());
      }
    }, [dispatch, businessFunctions.length, jobFunctions.length, positionGroups.length, 
        employeeStatuses.length, employeeTags.length, contractConfigs.length, loading])
  };

  // Helper functions with safe error handling
  const helpers = {
    // Get items by ID with safe null checking
    getBusinessFunctionById: useCallback((id) => {
      if (!id || !Array.isArray(businessFunctions)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return businessFunctions.find(bf => (bf.id || bf.value) === numericId) || null;
    }, [businessFunctions]),
    
    getDepartmentById: useCallback((id) => {
      if (!id || !Array.isArray(departments)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return departments.find(dept => (dept.id || dept.value) === numericId) || null;
    }, [departments]),
    
    getUnitById: useCallback((id) => {
      if (!id || !Array.isArray(units)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return units.find(unit => (unit.id || unit.value) === numericId) || null;
    }, [units]),
    
    getJobFunctionById: useCallback((id) => {
      if (!id || !Array.isArray(jobFunctions)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return jobFunctions.find(jf => (jf.id || jf.value) === numericId) || null;
    }, [jobFunctions]),
    
    getPositionGroupById: useCallback((id) => {
      if (!id || !Array.isArray(positionGroups)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return positionGroups.find(pg => (pg.id || pg.value) === numericId) || null;
    }, [positionGroups]),
    
    getEmployeeStatusById: useCallback((id) => {
      if (!id || !Array.isArray(employeeStatuses)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return employeeStatuses.find(status => (status.id || status.value) === numericId) || null;
    }, [employeeStatuses]),
    
    getEmployeeTagById: useCallback((id) => {
      if (!id || !Array.isArray(employeeTags)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return employeeTags.find(tag => (tag.id || tag.value) === numericId) || null;
    }, [employeeTags]),
    
    getContractConfigById: useCallback((id) => {
      if (!id || !Array.isArray(contractConfigs)) return null;
      return contractConfigs.find(config => config.contract_type === id || config.id === id) || null;
    }, [contractConfigs]),
    
    // Get filtered data
    getDepartmentsByBusinessFunction: useCallback((businessFunctionId) => {
      if (!businessFunctionId || !Array.isArray(departments)) return [];
      const numericId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
      return departments.filter(dept => dept.business_function === numericId);
    }, [departments]),
    
    getUnitsByDepartment: useCallback((departmentId) => {
      if (!departmentId || !Array.isArray(units)) return [];
      const numericId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
      return units.filter(unit => unit.department === numericId);
    }, [units]),
    
    getTagsByType: useCallback(() => {
      if ( !Array.isArray(employeeTags)) return [];
      return employeeTags;
      
    }, [employeeTags]),
    
    getGradingLevelsForPositionGroup: useCallback((positionGroupId) => {
      if (!positionGroupId || !gradingLevels) return [];
      return gradingLevels[positionGroupId] || [];
    }, [gradingLevels]),
    
    // Validation helpers with improved error handling
    isValidBusinessFunction: useCallback((id) => {
      if (!id || !Array.isArray(businessFunctions)) return false;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return businessFunctions.some(bf => (bf.id || bf.value) === numericId && bf.is_active !== false);
    }, [businessFunctions]),
    
    isValidDepartment: useCallback((id, businessFunctionId = null) => {
      if (!id || !Array.isArray(departments)) return false;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      const department = departments.find(dept => (dept.id || dept.value) === numericId);
      if (!department || department.is_active === false) return false;
      
      if (businessFunctionId) {
        const numericBfId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
        return department.business_function === numericBfId;
      }
      
      return true;
    }, [departments]),
    
    isValidUnit: useCallback((id, departmentId = null) => {
      if (!id || !Array.isArray(units)) return false;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      const unit = units.find(u => (u.id || u.value) === numericId);
      if (!unit || unit.is_active === false) return false;
      
      if (departmentId) {
        const numericDeptId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
        return unit.department === numericDeptId;
      }
      
      return true;
    }, [units]),
    
    // Data availability checks
    hasBusinessFunctions: useCallback(() => Array.isArray(businessFunctions) && businessFunctions.length > 0, [businessFunctions]),
    hasDepartments: useCallback(() => Array.isArray(departments) && departments.length > 0, [departments]),
    hasUnits: useCallback(() => Array.isArray(units) && units.length > 0, [units]),
    hasJobFunctions: useCallback(() => Array.isArray(jobFunctions) && jobFunctions.length > 0, [jobFunctions]),
    hasPositionGroups: useCallback(() => Array.isArray(positionGroups) && positionGroups.length > 0, [positionGroups]),
    hasEmployeeStatuses: useCallback(() => Array.isArray(employeeStatuses) && employeeStatuses.length > 0, [employeeStatuses]),
    hasEmployeeTags: useCallback(() => Array.isArray(employeeTags) && employeeTags.length > 0, [employeeTags]),
    hasContractConfigs: useCallback(() => Array.isArray(contractConfigs) && contractConfigs.length > 0, [contractConfigs]),
    
    // Loading state checks
    isLoading: useCallback((loadingKey) => {
      if (!loading || typeof loading !== 'object') return false;
      return Boolean(loading[loadingKey]);
    }, [loading]),
    
    isAnyLoading: useCallback(() => isAnyLoading, [isAnyLoading]),
    hasAnyError: useCallback(() => hasAnyError, [hasAnyError]),

    // Get formatted options for dropdowns with safe transformation
    getFormattedBusinessFunctions: useCallback(() => {
      if (!Array.isArray(businessFunctions)) return [];
      return businessFunctions
        .filter(bf => bf && bf.is_active !== false)
        .map(bf => ({
          value: (bf.id || bf.value)?.toString() || '',
          label: bf.name || bf.label || 'Unknown',
          code: bf.code || '',
          employee_count: bf.employee_count || 0
        }));
    }, [businessFunctions]),

    getFormattedDepartments: useCallback((businessFunctionId = null) => {
      let filteredDepartments = Array.isArray(departments) ? departments : [];
      
      if (businessFunctionId) {
        const numericId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
        filteredDepartments = filteredDepartments.filter(
          dept => dept && dept.business_function === numericId
        );
      }
      
      return filteredDepartments
        .filter(dept => dept && dept.is_active !== false)
        .map(dept => ({
          value: (dept.id || dept.value)?.toString() || '',
          label: dept.name || dept.label || 'Unknown',
          business_function: dept.business_function,
          business_function_name: dept.business_function_name || '',
          business_function_code: dept.business_function_code || ''
        }));
    }, [departments]),

    getFormattedUnits: useCallback((departmentId = null) => {
      let filteredUnits = Array.isArray(units) ? units : [];
      
      if (departmentId) {
        const numericId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
        filteredUnits = filteredUnits.filter(
          unit => unit && unit.department === numericId
        );
      }
      
      return filteredUnits
        .filter(unit => unit && unit.is_active !== false)
        .map(unit => ({
          value: (unit.id || unit.value)?.toString() || '',
          label: unit.name || unit.label || 'Unknown',
          department: unit.department,
          department_name: unit.department_name || '',
          business_function_name: unit.business_function_name || ''
        }));
    }, [units]),

    getFormattedJobFunctions: useCallback(() => {
      if (!Array.isArray(jobFunctions)) return [];
      return jobFunctions
        .filter(jf => jf && jf.is_active !== false)
        .map(jf => ({
          value: (jf.id || jf.value)?.toString() || '',
          label: jf.name || jf.label || 'Unknown',
        
        }));
    }, [jobFunctions]),

    getFormattedPositionGroups: useCallback(() => {
      if (!Array.isArray(positionGroups)) return [];
      return positionGroups
        .filter(pg => pg && pg.is_active !== false)
        .sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0))
        .map(pg => ({
          value: (pg.id || pg.value)?.toString() || '',
          label: pg.display_name || pg.label || pg.name || 'Unknown',
          name: pg.name,
          hierarchy_level: pg.hierarchy_level || 0,
          grading_shorthand: pg.grading_shorthand || '',
          grading_levels: pg.grading_levels || []
        }));
    }, [positionGroups]),

    getFormattedEmployeeStatuses: useCallback(() => {
      if (!Array.isArray(employeeStatuses)) return [];
      return employeeStatuses
        .filter(status => status && status.is_active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(status => ({
          value: (status.id || status.value)?.toString() || '',
          label: status.name || status.label || 'Unknown',
          status_type: status.status_type || '',
          color: status.color || '#gray',
          affects_headcount: status.affects_headcount,
          allows_org_chart: status.allows_org_chart
        }));
    }, [employeeStatuses]),

    getFormattedEmployeeTags: useCallback(() => {
      let filteredTags = Array.isArray(employeeTags) ? employeeTags : [];
      
  
      
      return filteredTags
        .filter(tag => tag && tag.is_active !== false)
        .map(tag => ({
          value: (tag.id || tag.value)?.toString() || '',
          label: tag.name || tag.label || 'Unknown',
         
          color: tag.color || '#gray'
        }));
    }, [employeeTags]),

    getFormattedContractConfigs: useCallback(() => {
      if (!Array.isArray(contractConfigs)) return [];
      return contractConfigs
        .filter(config => config && config.is_active !== false)
        .map(config => ({
          value: config.contract_type || config.value || '',
          label: config.display_name || config.label || 'Unknown',
          contract_type: config.contract_type,
      
          probation_days: config.probation_days || 0,
          total_days_until_active: config.total_days_until_active || 0
        }));
    }, [contractConfigs]),

    // Safe array access helpers
    safeGetArray: useCallback((arrayName) => {
      const arrays = {
        businessFunctions,
        departments,
        units,
        jobFunctions,
        positionGroups,
        employeeStatuses,
        employeeTags,
        contractConfigs
      };
      
      const array = arrays[arrayName];
      return Array.isArray(array) ? array : [];
    }, [businessFunctions, departments, units, jobFunctions, positionGroups, employeeStatuses, employeeTags, contractConfigs]),

    // Error handling helpers
    getErrorMessage: useCallback((errorKey) => {
      if (!error || typeof error !== 'object') return null;
      const errorValue = error[errorKey];
      
      if (typeof errorValue === 'string') return errorValue;
      if (errorValue && typeof errorValue === 'object' && errorValue.message) return errorValue.message;
      if (errorValue && typeof errorValue === 'object' && errorValue.detail) return errorValue.detail;
      
      return null;
    }, [error]),

    hasError: useCallback((errorKey) => {
      const errorMessage = helpers.getErrorMessage(errorKey);
      return errorMessage !== null;
    }, [error]),

    // Hierarchical validation
    validateHierarchy: useCallback((businessFunctionId, departmentId, unitId) => {
      const validation = {
        isValid: true,
        errors: []
      };

      // Validate Company
      if (businessFunctionId && !helpers.isValidBusinessFunction(businessFunctionId)) {
        validation.isValid = false;
        validation.errors.push('Invalid Company selected');
      }

      // Validate department belongs to Company
      if (departmentId && !helpers.isValidDepartment(departmentId, businessFunctionId)) {
        validation.isValid = false;
        validation.errors.push('Department does not belong to selected Company');
      }

      // Validate unit belongs to department
      if (unitId && !helpers.isValidUnit(unitId, departmentId)) {
        validation.isValid = false;
        validation.errors.push('Unit does not belong to selected department');
      }

      return validation;
    }, []),

    // Cache management helpers
    isDataStale: useCallback((dataType) => {
      return useSelector(state => selectIsDataStale(state, dataType));
    }, []),

    refreshIfStale: useCallback((dataType) => {
      const stale = helpers.isDataStale(dataType);
      if (stale) {
        switch (dataType) {
          case 'businessFunctions':
            actions.fetchBusinessFunctions();
            break;
          case 'jobFunctions':
            actions.fetchJobFunctions();
            break;
          case 'positionGroups':
            actions.fetchPositionGroups();
            break;
          case 'employeeStatuses':
            actions.fetchEmployeeStatuses();
            break;
          case 'employeeTags':
            actions.fetchEmployeeTags();
            break;
          case 'contractConfigs':
            actions.fetchContractConfigs();
            break;
          default:
            break;
        }
      }
    }, [actions]),

    // Form helpers
    getFormOptions: useCallback((businessFunctionId = null, departmentId = null) => {
      return {
        businessFunctions: helpers.getFormattedBusinessFunctions(),
        departments: helpers.getFormattedDepartments(businessFunctionId),
        units: helpers.getFormattedUnits(departmentId),
        jobFunctions: helpers.getFormattedJobFunctions(),
        positionGroups: helpers.getFormattedPositionGroups(),
        employeeStatuses: helpers.getFormattedEmployeeStatuses(),
        employeeTags: helpers.getFormattedEmployeeTags(),
        contractConfigs: helpers.getFormattedContractConfigs()
      };
    }, []),

    // Search and filter helpers
    searchInData: useCallback((searchTerm, dataType) => {
      if (!searchTerm) return helpers.safeGetArray(dataType);
      
      const array = helpers.safeGetArray(dataType);
      const term = searchTerm.toLowerCase();
      
      return array.filter(item => {
        const name = (item.name || item.label || '').toLowerCase();
        const code = (item.code || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        
        return name.includes(term) || code.includes(term) || description.includes(term);
      });
    }, []),

    filterActiveOnly: useCallback((dataType) => {
      const array = helpers.safeGetArray(dataType);
      return array.filter(item => item.is_active !== false);
    }, [])
  };

  // Auto-fetch basic reference data on mount
  useEffect(() => {
    actions.loadInitialData();
  }, [actions.loadInitialData]);

  // Return comprehensive interface
  return {
    // Raw data (with safe defaults)
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    employeeStatuses,
    employeeTags,
    contractConfigs,
    gradingLevels,
    selectedBusinessFunction,
    selectedDepartment,
    
    // Formatted data for dropdowns (with safe defaults)
    businessFunctionsDropdown,
    departmentsDropdown,
    unitsDropdown,
    jobFunctionsDropdown,
    positionGroupsDropdown,
    employeeStatusesDropdown,
    employeeTagsDropdown,
    contractConfigsDropdown,
    
    // Combined form data
    formData,
    
    // Loading states (with safe default)
    loading,
    isAnyLoading,
    
    // Error states (with safe default)
    error,
    hasAnyError,
    
    // Actions
    ...actions,
    
    // Helper functions
    ...helpers
  };
};

// Specialized hook for hierarchical selection
export const useHierarchicalReferenceData = () => {
  const dispatch = useDispatch();
  const [selectedBusinessFunction, setSelectedBusinessFunction] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  const businessFunctions = useSelector(selectBusinessFunctionsForDropdown) || [];
  const departments = useSelector(selectDepartmentsForDropdown) || [];
  const units = useSelector(selectUnitsForDropdown) || [];
  const loading = useSelector(selectReferenceDataLoading) || {};
  const error = useSelector(selectReferenceDataError) || {};

  // Auto-load departments when Company changes
  useEffect(() => {
    if (selectedBusinessFunction) {
      dispatch(fetchDepartments(selectedBusinessFunction));
      setSelectedDepartment(null);
    } else {
      dispatch(clearDepartments());
      dispatch(clearUnits());
    }
  }, [selectedBusinessFunction, dispatch]);

  // Auto-load units when department changes
  useEffect(() => {
    if (selectedDepartment) {
      dispatch(fetchUnits(selectedDepartment));
    } else {
      dispatch(clearUnits());
    }
  }, [selectedDepartment, dispatch]);

  // Load Companys on mount
  useEffect(() => {
    if (businessFunctions.length === 0 && !loading.businessFunctions) {
      dispatch(fetchBusinessFunctions());
    }
  }, [dispatch, businessFunctions.length, loading.businessFunctions]);

  return {
    // Data
    businessFunctions,
    departments,
    units,
    
    // Selected values
    selectedBusinessFunction,
    selectedDepartment,
    
    // Setters
    setSelectedBusinessFunction,
    setSelectedDepartment,
    
    // Loading states
    isLoadingBusinessFunctions: loading.businessFunctions || false,
    isLoadingDepartments: loading.departments || false,
    isLoadingUnits: loading.units || false,
    
    // Error states
    businessFunctionsError: error.businessFunctions,
    departmentsError: error.departments,
    unitsError: error.units,
    
    // Helper functions
    resetSelection: useCallback(() => {
      setSelectedBusinessFunction(null);
      setSelectedDepartment(null);
    }, []),
    
    setBusinessFunctionAndDepartment: useCallback((businessFunctionId, departmentId = null) => {
      setSelectedBusinessFunction(businessFunctionId);
      if (departmentId) {
        setSelectedDepartment(departmentId);
      }
    }, []),

    // Validation helpers
    isValidSelection: useCallback(() => {
      return selectedBusinessFunction && 
             businessFunctions.some(bf => bf.value === selectedBusinessFunction);
    }, [selectedBusinessFunction, businessFunctions]),

    getCurrentPath: useCallback(() => {
      const bf = businessFunctions.find(f => f.value === selectedBusinessFunction);
      const dept = departments.find(d => d.value === selectedDepartment);
      
      return {
        businessFunction: bf || null,
        department: dept || null,
        path: [bf?.label, dept?.label].filter(Boolean).join(' > ')
      };
    }, [businessFunctions, departments, selectedBusinessFunction, selectedDepartment])
  };
};

// Hook for position group grading levels
export const usePositionGroupGradingLevels = (positionGroupId) => {
  const dispatch = useDispatch();
  const [gradingLevels, setGradingLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get cached levels from store
  const cachedLevels = useSelector(state => selectPositionGroupGradingLevels(state, positionGroupId));
  
  useEffect(() => {
    if (positionGroupId) {
      // Check if we have cached data first
      if (cachedLevels && cachedLevels.length > 0) {
        setGradingLevels(cachedLevels);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      // Fetch from API
      dispatch(fetchPositionGroupGradingLevels(positionGroupId))
        .unwrap()
        .then(response => {
          const levels = response.levels || [];
          setGradingLevels(Array.isArray(levels) ? levels : []);
        })
        .catch(err => {
          const errorMessage = err.error || err.detail || err.message || 'Failed to fetch grading levels';
          setError(errorMessage);
          setGradingLevels([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setGradingLevels([]);
      setError(null);
      setLoading(false);
    }
  }, [positionGroupId, dispatch, cachedLevels]);
  
  return {
    gradingLevels,
    loading,
    error,
    hasLevels: Array.isArray(gradingLevels) && gradingLevels.length > 0,
    
    // Helper functions
    getLevelByCode: useCallback((code) => {
      return gradingLevels.find(level => level.code === code) || null;
    }, [gradingLevels]),
    
    getLevelOptions: useCallback(() => {
      return gradingLevels.map(level => ({
        value: level.code,
        label: level.display,
        fullName: level.full_name
      }));
    }, [gradingLevels]),
    
    isValidLevel: useCallback((code) => {
      return gradingLevels.some(level => level.code === code);
    }, [gradingLevels])
  };
};

// Hook for managing reference data forms
export const useReferenceDataForm = (entityType, initialData = null) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  const loading = useSelector(selectReferenceDataLoading);
  const error = useSelector(selectReferenceDataError);
  
  const isCreating = loading.creating;
  const isUpdating = loading.updating;
  const isDeleting = loading.deleting;
  const formError = error.create || error.update || error.delete;

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Common validations
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Entity-specific validations
    switch (entityType) {
      case 'businessFunctions':
        if (!formData.code || !formData.code.trim()) {
          newErrors.code = 'Code is required';
        }
        break;
      case 'departments':
        if (!formData.business_function) {
          newErrors.business_function = 'Company is required';
        }
        break;
      case 'units':
        if (!formData.department) {
          newErrors.department = 'Department is required';
        }
        break;
      case 'positionGroups':
        if (!formData.hierarchy_level) {
          newErrors.hierarchy_level = 'Hierarchy level is required';
        }
        break;
      case 'employeeStatuses':
        if (!formData.status_type) {
          newErrors.status_type = 'Status type is required';
        }
        if (!formData.color || !formData.color.trim()) {
          newErrors.color = 'Color is required';
        }
        break;
     
      case 'contractConfigs':
        if (!formData.contract_type) {
          newErrors.contract_type = 'Contract type is required';
        }
        if (!formData.display_name || !formData.display_name.trim()) {
          newErrors.display_name = 'Display name is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, entityType]);

  const submitForm = useCallback(async (isEdit = false) => {
    if (!validateForm()) {
      return { success: false, errors };
    }
    
    try {
      let action;
      
      if (isEdit && formData.id) {
        // Update existing item
        switch (entityType) {
          case 'businessFunctions':
            action = updateBusinessFunction({ id: formData.id, data: formData });
            break;
          case 'departments':
            action = updateDepartment({ id: formData.id, data: formData });
            break;
          case 'units':
            action = updateUnit({ id: formData.id, data: formData });
            break;
          case 'jobFunctions':
            action = updateJobFunction({ id: formData.id, data: formData });
            break;
          case 'positionGroups':
            action = updatePositionGroup({ id: formData.id, data: formData });
            break;
          case 'employeeStatuses':
            action = updateEmployeeStatus({ id: formData.id, data: formData });
            break;
          case 'employeeTags':
            action = updateEmployeeTag({ id: formData.id, data: formData });
            break;
          case 'contractConfigs':
            action = updateContractConfig({ id: formData.id, data: formData });
            break;
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
      } else {
        // Create new item
        switch (entityType) {
          case 'businessFunctions':
            action = createBusinessFunction(formData);
            break;
          case 'departments':
            action = createDepartment(formData);
            break;
          case 'units':
            action = createUnit(formData);
            break;
          case 'jobFunctions':
            action = createJobFunction(formData);
            break;
          case 'positionGroups':
            action = createPositionGroup(formData);
            break;
          case 'employeeStatuses':
            action = createEmployeeStatus(formData);
            break;
          case 'employeeTags':
            action = createEmployeeTag(formData);
            break;
          case 'contractConfigs':
            action = createContractConfig(formData);
            break;
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
      }
      
      const result = await dispatch(action).unwrap();
      
      // Reset form on successful creation
      if (!isEdit) {
        setFormData({});
        setIsDirty(false);
      }
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || err.detail || 'Operation failed';
      return { success: false, error: errorMessage };
    }
  }, [formData, entityType, validateForm, errors, dispatch]);

  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  const deleteItem = useCallback(async () => {
    if (!formData.id) {
      return { success: false, error: 'No item to delete' };
    }
    
    try {
      let action;
      
      switch (entityType) {
        case 'businessFunctions':
          action = deleteBusinessFunction(formData.id);
          break;
        case 'departments':
          action = deleteDepartment(formData.id);
          break;
        case 'units':
          action = deleteUnit(formData.id);
          break;
        case 'jobFunctions':
          action = deleteJobFunction(formData.id);
          break;
        case 'positionGroups':
          action = deletePositionGroup(formData.id);
          break;
        case 'employeeStatuses':
          action = deleteEmployeeStatus(formData.id);
          break;
        case 'employeeTags':
          action = deleteEmployeeTag({ id: formData.id,  });
          break;
        case 'contractConfigs':
          action = deleteContractConfig(formData.id);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      
      await dispatch(action).unwrap();
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || err.detail || 'Delete failed';
      return { success: false, error: errorMessage };
    }
  }, [formData.id, entityType, dispatch]);

  return {
    // Form state
    formData,
    errors,
    isDirty,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating,
    
    // Error state
    formError,
    
    // Form actions
    updateField,
    validateForm,
    submitForm,
    resetForm,
    deleteItem,
    setFormData,
    
    // Computed state
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0 && isDirty,
    canSubmit: Object.keys(errors).length === 0 && isDirty && !isCreating && !isUpdating,
    canDelete: formData.id && !isDeleting
  };
};

export default useReferenceData;