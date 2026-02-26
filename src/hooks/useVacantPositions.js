// src/hooks/useVacantPositions.js - Updated with position group grading levels
import { useState, useCallback, useRef } from 'react';
import { 
  vacantPositionsService, 
  referenceDataService,
  archiveEmployeesService 
} from '../services/vacantPositionsService';

export const useVacantPositions = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Data states
  const [vacantPositions, setVacantPositions] = useState([]);
  const [vacantPositionsStats, setVacantPositionsStats] = useState(null);
  const [archivedEmployees, setArchivedEmployees] = useState([]);

  // Reference data states
  const [businessFunctions, setBusinessFunctions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [jobFunctions, setJobFunctions] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Position group specific grading levels
  const [gradingLevelsCache, setGradingLevelsCache] = useState({});
  const [currentGradingLevels, setCurrentGradingLevels] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    vacantPositions: false,
    statistics: false,
    creating: false,
    updating: false,
    deleting: false,
    converting: false,
    referenceData: false,
    archivedEmployees: false,
    gradingLevels: false
  });

  // Error states
  const [errors, setErrors] = useState({
    vacantPositions: null,
    statistics: null,
    creating: null,
    updating: null,
    deleting: null,
    converting: null,
    referenceData: null,
    archivedEmployees: null,
    gradingLevels: null
  });

  // Pagination states
  const [vacantPagination, setVacantPagination] = useState({
    page: 1,
    pageSize: 25,
    totalPages: 1,
    count: 0
  });

  const [archivePagination, setArchivePagination] = useState({
    page: 1,
    pageSize: 25,
    totalPages: 1,
    count: 0
  });

  // Cache ref for preventing duplicate API calls
  const cacheRef = useRef({
    referenceDataLoaded: false,
    lastReferenceDataFetch: null
  });

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const updateLoading = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateError = useCallback((key, error) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({
      vacantPositions: null,
      statistics: null,
      creating: null,
      updating: null,
      deleting: null,
      converting: null,
      referenceData: null,
      archivedEmployees: null,
      gradingLevels: null
    });
  }, []);

  // ========================================
  // REFERENCE DATA OPERATIONS
  // ========================================

  /**
   * Fetch all reference data needed for dropdowns
   */
  const fetchReferenceData = useCallback(async (forceRefresh = false) => {
    // Check cache to prevent duplicate calls
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    if (!forceRefresh && 
        cacheRef.current.referenceDataLoaded && 
        cacheRef.current.lastReferenceDataFetch &&
        (now - cacheRef.current.lastReferenceDataFetch) < cacheExpiry) {
      return;
    }

    updateLoading('referenceData', true);
    updateError('referenceData', null);

    try {
      const result = await referenceDataService.getAllReferenceData();
      
      if (result.success) {
        setBusinessFunctions(result.data.businessFunctions || []);
        setDepartments(result.data.departments || []);
        setUnits(result.data.units || []);
        setJobFunctions(result.data.jobFunctions || []);
        setPositionGroups(result.data.positionGroups || []);
        setEmployees(result.data.employees || []);

        cacheRef.current.referenceDataLoaded = true;
        cacheRef.current.lastReferenceDataFetch = now;
      }

      // Log any individual errors but don't fail the whole operation
      if (result.errors) {
        const errorMessages = Object.entries(result.errors)
          .filter(([, error]) => error !== null)
          .map(([key, error]) => `${key}: ${error.message}`)
          .join(', ');
        
        if (errorMessages) {
          console.warn('Some reference data failed to load:', errorMessages);
        }
      }

    } catch (error) {
      console.error('Failed to fetch reference data:', error);
      updateError('referenceData', error);
    } finally {
      updateLoading('referenceData', false);
    }
  }, [updateLoading, updateError]);

  /**
   * Fetch grading levels for a specific position group
   */
  const fetchGradingLevelsForPositionGroup = useCallback(async (positionGroupId) => {
    if (!positionGroupId) {
      setCurrentGradingLevels([]);
      return [];
    }

    // Check cache first
    if (gradingLevelsCache[positionGroupId]) {
      const cachedLevels = gradingLevelsCache[positionGroupId];
      setCurrentGradingLevels(cachedLevels);
      return cachedLevels;
    }

    updateLoading('gradingLevels', true);
    updateError('gradingLevels', null);

    try {
      const result = await referenceDataService.getGradingLevelsForPositionGroup(positionGroupId);
      
      if (result.success) {
        const levels = result.data || [];
        
        // Cache the results
        setGradingLevelsCache(prev => ({
          ...prev,
          [positionGroupId]: levels
        }));
        
        setCurrentGradingLevels(levels);
        return levels;
      }

    } catch (error) {
      console.error('Failed to fetch grading levels for position group:', error);
      updateError('gradingLevels', error);
      setCurrentGradingLevels([]);
      return [];
    } finally {
      updateLoading('gradingLevels', false);
    }
  }, [gradingLevelsCache, updateLoading, updateError]);

  /**
   * Get all unique grading levels across all position groups (for filters)
   */
  const getAllGradingLevels = useCallback(async () => {
    if (!positionGroups || positionGroups.length === 0) {
      return [];
    }

    try {
      // Fetch grading levels for all position groups
      const gradingLevelsPromises = positionGroups.map(pg => 
        referenceDataService.getGradingLevelsForPositionGroup(pg.id)
      );
      
      const results = await Promise.allSettled(gradingLevelsPromises);
      
      // Collect all unique grading levels
      const allLevels = new Map();
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const positionGroupId = positionGroups[index].id;
          const levels = result.value.data || [];
          
          // Cache the results
          setGradingLevelsCache(prev => ({
            ...prev,
            [positionGroupId]: levels
          }));
          
          // Add unique levels to our collection
          levels.forEach(level => {
            if (!allLevels.has(level.code)) {
              allLevels.set(level.code, {
                code: level.code,
                display: level.display,
                full_name: level.full_name
              });
            }
          });
        }
      });
      
      return Array.from(allLevels.values());
    } catch (error) {
      console.error('Failed to fetch all grading levels:', error);
      return [];
    }
  }, [positionGroups]);

  /**
   * Fetch departments by Company
   */
  const fetchDepartmentsByBusinessFunction = useCallback(async (businessFunctionId) => {
    if (!businessFunctionId) {
      return [];
    }

    try {
      const result = await referenceDataService.getDepartmentsByBusinessFunction(businessFunctionId);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to fetch departments by Company:', error);
      return [];
    }
  }, []);

  /**
   * Fetch units by department
   */
  const fetchUnitsByDepartment = useCallback(async (departmentId) => {
    if (!departmentId) {
      return [];
    }

    try {
      const result = await referenceDataService.getUnitsByDepartment(departmentId);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to fetch units by department:', error);
      return [];
    }
  }, []);

  // ========================================
  // VACANT POSITIONS OPERATIONS
  // ========================================

  /**
   * Fetch vacant positions with filtering and pagination
   */
  const fetchVacantPositions = useCallback(async (params = {}) => {
    updateLoading('vacantPositions', true);
    updateError('vacantPositions', null);

    try {
      const result = await vacantPositionsService.getVacantPositions(params);
      
      if (result.success) {
        setVacantPositions(result.results || []);
        setVacantPagination(result.pagination);
      }

    } catch (error) {
      console.error('Failed to fetch vacant positions:', error);
      updateError('vacantPositions', error);
      setVacantPositions([]);
    } finally {
      updateLoading('vacantPositions', false);
    }
  }, [updateLoading, updateError]);

  /**
   * Create new vacant position
   */
  const createVacantPosition = useCallback(async (positionData) => {
    updateLoading('creating', true);
    updateError('creating', null);

    try {
      const result = await vacantPositionsService.createVacantPosition(positionData);
      
      if (result.success) {
        // Refresh the list after creation
        await fetchVacantPositions({
          page: vacantPagination.page,
          page_size: vacantPagination.pageSize
        });
        
        return result;
      }

    } catch (error) {
      console.error('Failed to create vacant position:', error);
      updateError('creating', error);
      throw error;
    } finally {
      updateLoading('creating', false);
    }
  }, [fetchVacantPositions, vacantPagination, updateLoading, updateError]);

  /**
   * Update vacant position
   */
  const updateVacantPosition = useCallback(async (id, updateData) => {
    updateLoading('updating', true);
    updateError('updating', null);

    try {
      const result = await vacantPositionsService.updateVacantPosition(id, updateData);
      
      if (result.success) {
        // Update the position in local state
        setVacantPositions(prev => 
          prev.map(position => 
            position.id === id ? { ...position, ...result.data } : position
          )
        );
        
        return result;
      }

    } catch (error) {
      console.error('Failed to update vacant position:', error);
      updateError('updating', error);
      throw error;
    } finally {
      updateLoading('updating', false);
    }
  }, [updateLoading, updateError]);

  /**
   * Delete vacant position
   */
  const deleteVacantPosition = useCallback(async (id) => {
    updateLoading('deleting', true);
    updateError('deleting', null);

    try {
      const result = await vacantPositionsService.deleteVacantPosition(id);
      
      if (result.success) {
        // Remove from local state
        setVacantPositions(prev => prev.filter(position => position.id !== id));
        
        return result;
      }

    } catch (error) {
      console.error('Failed to delete vacant position:', error);
      updateError('deleting', error);
      throw error;
    } finally {
      updateLoading('deleting', false);
    }
  }, [updateLoading, updateError]);

  /**
   * Convert vacant position to employee
   */
  const convertToEmployee = useCallback(async (id, employeeData, document = null, profilePhoto = null) => {
    updateLoading('converting', true);
    updateError('converting', null);

    try {
      const result = await vacantPositionsService.convertToEmployee(id, employeeData, document, profilePhoto);
      
      if (result.success) {
        // Remove the converted position from vacant positions list
        setVacantPositions(prev => prev.filter(position => position.id !== id));
        
        // Refresh employees list for future dropdowns
        await fetchReferenceData(true);
        
        return result;
      }

    } catch (error) {
      console.error('Failed to convert vacant position to employee:', error);
      updateError('converting', error);
      throw error;
    } finally {
      updateLoading('converting', false);
    }
  }, [fetchReferenceData, updateLoading, updateError]);

  /**
   * Fetch vacant positions statistics
   */
  const fetchVacantPositionsStatistics = useCallback(async () => {
    updateLoading('statistics', true);
    updateError('statistics', null);

    try {
      const result = await vacantPositionsService.getVacantPositions({ page_size: 1000 });
      
      if (result.success) {
        const positions = result.results || [];
        
        // Calculate statistics
        const stats = {
          total_vacant_positions: positions.length,
          by_department: {},
          by_business_function: {},
          by_position_group: {},
          by_grading_level: {},
          recent_vacancies: positions.filter(vp => {
            const createdDate = new Date(vp.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate >= thirtyDaysAgo;
          }).length
        };

        // Group by various categories
        positions.forEach(vp => {
          // By department
          const dept = vp.department_name || 'Unknown';
          stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

          // By Company
          const bf = vp.business_function_name || 'Unknown';
          stats.by_business_function[bf] = (stats.by_business_function[bf] || 0) + 1;

          // By position group
          const pg = vp.position_group_name || 'Unknown';
          stats.by_position_group[pg] = (stats.by_position_group[pg] || 0) + 1;

          // By grading level
          const gl = vp.grading_level || 'Unknown';
          stats.by_grading_level[gl] = (stats.by_grading_level[gl] || 0) + 1;
        });

        setVacantPositionsStats(stats);
      }

    } catch (error) {
      console.error('Failed to fetch vacant positions statistics:', error);
      updateError('statistics', error);
    } finally {
      updateLoading('statistics', false);
    }
  }, [updateLoading, updateError]);

  // ========================================
  // ARCHIVED EMPLOYEES OPERATIONS
  // ========================================

  /**
   * Fetch archived employees
   */
  const fetchArchivedEmployees = useCallback(async (params = {}) => {
    updateLoading('archivedEmployees', true);
    updateError('archivedEmployees', null);

    try {
      const result = await archiveEmployeesService.getArchivedEmployees(params);
      
      if (result.success) {
        setArchivedEmployees(result.results || []);
        setArchivePagination(result.pagination);
      }

    } catch (error) {
      console.error('Failed to fetch archived employees:', error);
      updateError('archivedEmployees', error);
      setArchivedEmployees([]);
    } finally {
      updateLoading('archivedEmployees', false);
    }
  }, [updateLoading, updateError]);

  // ========================================
  // PAGINATION HELPERS
  // ========================================

  /**
   * Set vacant positions page
   */
  const setVacantPositionsPage = useCallback((page) => {
    setVacantPagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * Set vacant positions page size
   */
  const setVacantPositionsPageSize = useCallback((pageSize) => {
    setVacantPagination(prev => ({ 
      ...prev, 
      pageSize, 
      page: 1 // Reset to first page when changing page size
    }));
  }, []);

  /**
   * Set archived employees page
   */
  const setArchivedEmployeesPage = useCallback((page) => {
    setArchivePagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * Set archived employees page size
   */
  const setArchivedEmployeesPageSize = useCallback((pageSize) => {
    setArchivePagination(prev => ({ 
      ...prev, 
      pageSize, 
      page: 1 // Reset to first page when changing page size
    }));
  }, []);

  // ========================================
  // SEARCH AND FILTER UTILITIES
  // ========================================

  /**
   * Search vacant positions by various criteria
   */
  const searchVacantPositions = useCallback(async (searchParams) => {
    const params = {
      search: searchParams.search || '',
      business_function: searchParams.businessFunction,
      department: searchParams.department,
      position_group: searchParams.positionGroup,
      job_function: searchParams.jobFunction,
      grading_level: searchParams.gradingLevel,
      reporting_to: searchParams.reportingTo,
      is_filled: searchParams.isFilled,
      include_in_headcount: searchParams.includeInHeadcount,
      page: searchParams.page || 1,
      page_size: searchParams.pageSize || 25,
      ordering: searchParams.ordering || '-created_at'
    };

    return fetchVacantPositions(params);
  }, [fetchVacantPositions]);

  // ========================================
  // RETURN HOOK INTERFACE
  // ========================================

  return {
    // Data
    vacantPositions,
    vacantPositionsStats,
    archivedEmployees,
    
    // Reference Data
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    employees,
    
    // Grading Levels (position group specific)
    currentGradingLevels,
    gradingLevelsCache,
    
    // Loading & Errors
    loading,
    errors,
    
    // Pagination
    vacantPagination,
    archivePagination,
    
    // Reference Data Functions
    fetchReferenceData,
    fetchDepartmentsByBusinessFunction,
    fetchUnitsByDepartment,
    
    // Grading Levels Functions
    fetchGradingLevelsForPositionGroup,
    getAllGradingLevels,
    
    // Vacant Positions API Functions
    fetchVacantPositions,
    createVacantPosition,
    updateVacantPosition,
    deleteVacantPosition,
    convertToEmployee,
    fetchVacantPositionsStatistics,
    searchVacantPositions,
    
    // Archived Employees Functions
    fetchArchivedEmployees,
    
    // Pagination Helpers
    setVacantPositionsPage,
    setVacantPositionsPageSize,
    setArchivedEmployeesPage,
    setArchivedEmployeesPageSize,
    
    // Utility
    clearErrors
  };
};