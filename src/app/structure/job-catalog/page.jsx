// src/app/structure/job-catalog/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { referenceDataAPI } from '@/store/api/referenceDataAPI';
import { employeeAPI } from '@/store/api/employeeAPI';
import { useToast } from '@/components/common/Toast';
import { LoadingSpinner, ErrorDisplay } from '@/components/common/LoadingSpinner';
import { setPositionGroups } from '@/components/jobCatalog/HierarchyColors';

// Components
import NavigationTabs from '@/components/jobCatalog/NavigationTabs';
import OverviewView from '@/components/jobCatalog/OverviewView';
import HierarchicalTableView from '@/components/jobCatalog/HierarchicalTableView';
import SimpleTableView from '@/components/jobCatalog/SimpleTableView';
import ReferenceDataView from '@/components/jobCatalog/ReferenceDataView';
import MatrixView from '@/components/jobCatalog/MatrixView';
import JobDetailModal from '@/components/jobCatalog/JobDetailModal';
import CrudModal from '@/components/jobCatalog/CrudModal';

export default function JobCatalogPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  // ==================== STATE MANAGEMENT ====================
  
  // View States
  const [activeView, setActiveView] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('jobCatalog_activeView') || 'overview' : 'overview'
  );
  const [viewMode, setViewMode] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('jobCatalog_viewMode') || 'grid' : 'grid'
  );
  const [matrixView, setMatrixView] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('jobCatalog_matrixView') || 'department' : 'department'
  );
  const [showFilters, setShowFilters] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('jobCatalog_showFilters') === 'true' : false
  );
  
  // Modal States
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [crudModalType, setCrudModalType] = useState('');
  const [crudModalMode, setCrudModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [businessFunctions, setBusinessFunctions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [jobFunctions, setJobFunctions] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [positionGroupsState, setPositionGroupsState] = useState([]);
  const [hierarchyData, setHierarchyData] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
    position_group: ''
  });
  
  // Loading States
  const [loading, setLoading] = useState({
    initial: true,
    employees: false,
    statistics: false,
    referenceData: false,
    hierarchy: false,
    crud: false
  });
  
  // Error States
  const [errors, setErrors] = useState({});
  
  // Form Data
  const [formData, setFormData] = useState({});

  // ==================== LOCALSTORAGE PERSISTENCE ====================
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_activeView', activeView);
    }
  }, [activeView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_viewMode', viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_matrixView', matrixView);
    }
  }, [matrixView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_showFilters', showFilters.toString());
    }
  }, [showFilters]);

  // ==================== DATA LOADING ====================
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(prev => ({ ...prev, initial: true, referenceData: true, statistics: true }));
    setErrors({});
    
    try {
      const [
        businessFunctionsRes,
        departmentsRes,
        unitsRes,
        jobFunctionsRes,
        jobTitlesRes,
        positionGroupsRes,
        statisticsRes
      ] = await Promise.all([
        referenceDataAPI.getBusinessFunctionDropdown(),
        referenceDataAPI.getDepartmentDropdown(),
        referenceDataAPI.getUnitDropdown(),
        referenceDataAPI.getJobFunctionDropdown(),
        referenceDataAPI.getJobTitleDropdown(),
        referenceDataAPI.getPositionGroupDropdown(),
        employeeAPI.getStatistics()
      ]);

      const positionGroupsData = positionGroupsRes.data || [];
      
      setBusinessFunctions(businessFunctionsRes.data || []);
      setDepartments(departmentsRes.data?.results || departmentsRes.data || []);
      setUnits(unitsRes.data || []);
      setJobFunctions(jobFunctionsRes.data || []);
      setJobTitles(jobTitlesRes.data || []);
      setPositionGroupsState(positionGroupsData);
      setStatistics(statisticsRes.data || statisticsRes);

      setPositionGroups(positionGroupsData);
      await loadEmployees();
      
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to load initial data';
      setErrors(prev => ({ ...prev, initial: errorMsg }));
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(prev => ({ ...prev, initial: false, referenceData: false, statistics: false }));
    }
  };

  const loadEmployees = async (additionalParams = {}) => {
    setLoading(prev => ({ ...prev, employees: true }));
    
    try {
      const params = { search: searchTerm, ...selectedFilters, ...additionalParams };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await employeeAPI.getAll(params);
      const employeeData = response.data?.results || response.results || [];
      setEmployees(employeeData);
      
    } catch (error) {
      setErrors(prev => ({ ...prev, employees: 'Failed to load employees' }));
      console.error('Error loading employees:', error);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const loadHierarchyData = async () => {
    setLoading(prev => ({ ...prev, hierarchy: true }));
    
    try {
      const response = await employeeAPI.getAll({ page_size: 1000 });
      setHierarchyData(response.data || response);
    } catch (error) {
      setErrors(prev => ({ ...prev, hierarchy: 'Failed to load hierarchy data' }));
      console.error('Error loading hierarchy data:', error);
    } finally {
      setLoading(prev => ({ ...prev, hierarchy: false }));
    }
  };

  useEffect(() => {
    if (activeView === 'matrix' && !hierarchyData) {
      loadHierarchyData();
    }
  }, [activeView, hierarchyData]);

  useEffect(() => {
    if (!loading.initial) {
      const timer = setTimeout(() => loadEmployees(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedFilters]);

  // ==================== CRUD OPERATIONS ====================
  
  const openCrudModal = (type, mode = 'create', item = null) => {
    console.log('openCrudModal called:', { type, mode, item }); // DEBUG
    
    setCrudModalType(type);
    setCrudModalMode(mode);
    setSelectedItem(item);
    
    if (mode === 'edit' && item) {
      const formDataInit = {};
      
      if (item.name || item.label) formDataInit.name = item.name || item.label;
      if (item.code) formDataInit.code = item.code;
      if (item.description) formDataInit.description = item.description;
      if (item.is_active !== undefined) formDataInit.is_active = item.is_active;
      
      if (type === 'departments') {
        // Edit mode üçün business_function ID-ni düzgün şəkildə təyin et
        const bfId = item.business_function_id || 
                     item.business_function?.id || 
                     item.business_function?.value ||
                     item.business_function ||
                     item.value; // Bu əlavə et
        
        console.log('Department edit - bfId:', bfId, 'item:', item); // DEBUG
        
        if (bfId) {
          formDataInit.business_function = bfId;
        }
      }
      
      if (type === 'units') {
        // Edit mode üçün department ID-ni düzgün şəkildə təyin et
        const deptId = item.department_id || 
                       item.department?.id || 
                       item.department?.value ||
                       item.department ||
                       item.value; // Bu əlavə et
        
        console.log('Unit edit - deptId:', deptId, 'item:', item); // DEBUG
        
        if (deptId) {
          formDataInit.department = deptId;
        }
      }
      
      if (type === 'position_groups' && item.hierarchy_level) {
        formDataInit.hierarchy_level = item.hierarchy_level;
      }
      
      console.log('formDataInit:', formDataInit); // DEBUG
      setFormData(formDataInit);
    } else {
      const cleanFormData = { name: '', is_active: true };
      
      if (type === 'business_functions') cleanFormData.code = '';
      if (type === 'departments') {
        cleanFormData.business_function_ids = [];
        cleanFormData.business_function = null;
      }
      if (type === 'units') {
        cleanFormData.department_ids = [];
        cleanFormData.department = null;
      }
      if (type === 'job_titles') cleanFormData.description = '';
      if (type === 'position_groups') cleanFormData.hierarchy_level = 1;
      
      setFormData(cleanFormData);
    }
    
    setShowCrudModal(true);
    setErrors(prev => ({ ...prev, crud: null }));
  };

  const handleCrudSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, crud: true }));
    setErrors(prev => ({ ...prev, crud: null }));

    try {
      const submitData = { is_active: formData.is_active !== false };
      
      if (formData.name) submitData.name = formData.name.trim();
      if (formData.code !== undefined) submitData.code = formData.code.trim();
      if (formData.description !== undefined) submitData.description = formData.description.trim();
      
      if (crudModalType === 'departments') {
        if (crudModalMode === 'create') {
          const bfIds = formData.business_function_ids || formData.business_function_id || [];
          submitData.business_function_ids = Array.isArray(bfIds) ? bfIds : [bfIds]; // ✅ Changed to business_function_ids (plural)
        } else {
          submitData.business_function_ids = [formData.business_function]; // ✅ Changed to plural
        }
      }
      
      if (crudModalType === 'units') {
        if (crudModalMode === 'create') {
          const deptIds = formData.department_ids || formData.department_id || [];
          submitData.department_ids = Array.isArray(deptIds) ? deptIds : [deptIds]; // ✅ Changed to department_ids (plural)
        } else {
          submitData.department_ids = [formData.department]; // ✅ Changed to plural
        }
      }
      
      if (crudModalType === 'position_groups' && formData.hierarchy_level) {
        submitData.hierarchy_level = parseInt(formData.hierarchy_level);
      }
      
      delete submitData.id;
      delete submitData.value;
      delete submitData.pk;
      delete submitData.uuid;
      
      // 🐛 DEBUG: Log what we're sending
      console.log('Submitting data:', submitData);
      
      let response;
      const itemId = selectedItem?.value || selectedItem?.id;
      
      if (crudModalMode === 'edit' && !itemId) {
        throw new Error('Item ID is missing for update operation');
      }
      
      const apiMap = {
        business_functions: {
          create: referenceDataAPI.createBusinessFunction,
          update: referenceDataAPI.updateBusinessFunction
        },
        departments: {
          create: referenceDataAPI.createDepartment,
          update: referenceDataAPI.updateDepartment
        },
        units: {
          create: referenceDataAPI.createUnit,
          update: referenceDataAPI.updateUnit
        },
        job_functions: {
          create: referenceDataAPI.createJobFunction,
          update: referenceDataAPI.updateJobFunction
        },
        job_titles: {
          create: referenceDataAPI.createJobTitle,
          update: referenceDataAPI.updateJobTitle
        },
        position_groups: {
          create: referenceDataAPI.createPositionGroup,
          update: referenceDataAPI.updatePositionGroup
        }
      };

      if (!apiMap[crudModalType]) {
        throw new Error(`Unknown CRUD type: ${crudModalType}`);
      }

      if (crudModalMode === 'create') {
        response = await apiMap[crudModalType].create(submitData);
      } else {
        response = await apiMap[crudModalType].update(itemId, submitData);
      }

      await loadInitialData();
      
      const entityName = crudModalType.replace(/_/g, ' ');
      showSuccess(`Successfully ${crudModalMode === 'create' ? 'created' : 'updated'} ${entityName}`);
      
      closeCrudModal();
      
    } catch (error) {
      let errorMsg = 'An error occurred';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE html>')) {
          errorMsg = 'Server error occurred. Please check server logs.';
          const titleMatch = errorData.match(/<title>(.*?)<\/title>/);
          if (titleMatch && titleMatch[1]) {
            errorMsg = titleMatch[1].replace(/\s+at\s+\/.*$/, '').trim();
          }
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else {
          const fieldErrors = Object.entries(errorData)
            .filter(([key]) => !['message', 'detail', 'status'].includes(key))
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
              return `${field}: ${errorText}`;
            })
            .join('; ');
          
          if (fieldErrors) {
            errorMsg = fieldErrors;
          } else {
            errorMsg = `Failed to ${crudModalMode} ${crudModalType.replace(/_/g, ' ')}`;
          }
        }
      } else if (error?.message) {
        errorMsg = error.message;
      } else {
        errorMsg = `Failed to ${crudModalMode} ${crudModalType.replace(/_/g, ' ')}`;
      }
      
      setErrors(prev => ({ ...prev, crud: errorMsg }));
      showError(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, crud: false }));
    }
  };

  const closeCrudModal = () => {
    setShowCrudModal(false);
    setCrudModalType('');
    setCrudModalMode('create');
    setSelectedItem(null);
    setFormData({});
    setErrors(prev => ({ ...prev, crud: null }));
  };

  const handleDelete = async (type, item) => {
    setLoading(prev => ({ ...prev, crud: true }));

    try {
      const id = item.id || item.value;
      
      const deleteMap = {
        business_functions: referenceDataAPI.deleteBusinessFunction,
        departments: referenceDataAPI.deleteDepartment,
        units: referenceDataAPI.deleteUnit,
        job_functions: referenceDataAPI.deleteJobFunction,
        job_titles: referenceDataAPI.deleteJobTitle,
        position_groups: referenceDataAPI.deletePositionGroup
      };

      if (!deleteMap[type]) {
        throw new Error(`Unknown delete type: ${type}`);
      }

      await deleteMap[type](id);
      await loadInitialData();
      showSuccess(`Successfully deleted ${type.replace('_', ' ')}`);
      
    } catch (error) {
      const errorMsg = error?.response?.data?.message || `Failed to delete ${type.replace('_', ' ')}`;
      setErrors(prev => ({ ...prev, crud: errorMsg }));
      showError(errorMsg);
      console.error('Delete error:', error);
    } finally {
      setLoading(prev => ({ ...prev, crud: false }));
    }
  };

  // ==================== COMPUTED VALUES ====================
  
  const jobCatalogData = useMemo(() => {
    const jobMap = new Map();
    
    employees.forEach(employee => {
      const key = `${employee.business_function_name}-${employee.department_name}-${employee.job_function_name}-${employee.position_group_name}-${employee.job_title}-${employee.unit_name}`;
      
      if (jobMap.has(key)) {
        jobMap.get(key).currentEmployees += 1;
        jobMap.get(key).employees.push(employee);
      } else {
        jobMap.set(key, {
          id: key,
          businessFunction: employee.business_function_name || 'N/A',
          unit: employee.unit_name || 'N/A',
          department: employee.department_name || 'N/A',
          jobFunction: employee.job_function_name || 'N/A',
          hierarchy: employee.position_group_name || 'N/A',
          title: employee.job_title || 'N/A',
          currentEmployees: 1,
          employees: [employee],
          description: `${employee.position_group_name} position in ${employee.department_name}`,
        });
      }
    });
    
    return Array.from(jobMap.values());
  }, [employees]);

  const filterOptions = useMemo(() => ({
    businessFunctions: businessFunctions || [],
    departments: departments || [],
    units: units || [],
    jobFunctions: jobFunctions || [],
    jobTitles: jobTitles || [],
    positionGroups: positionGroupsState || []
  }), [businessFunctions, departments, units, jobFunctions, jobTitles, positionGroupsState]);

  const filteredJobs = useMemo(() => {
    return jobCatalogData.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.businessFunction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobFunction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.hierarchy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBusinessFunction = !selectedFilters.business_function || 
        job.businessFunction === selectedFilters.business_function ||
        businessFunctions.find(bf => 
          (bf.value === selectedFilters.business_function || bf.id === selectedFilters.business_function) && 
          (bf.label === job.businessFunction || bf.name === job.businessFunction)
        );

      const matchesDepartment = !selectedFilters.department || 
        job.department === selectedFilters.department ||
        departments.find(d => 
          (d.value === selectedFilters.department || d.id === selectedFilters.department) && 
          (d.label === job.department || d.name === job.department)
        );

      const matchesUnit = !selectedFilters.unit || 
        job.unit === selectedFilters.unit ||
        units.find(u => 
          (u.value === selectedFilters.unit || u.id === selectedFilters.unit) && 
          (u.label === job.unit || u.name === job.unit)
        );

      const matchesJobFunction = !selectedFilters.job_function || 
        job.jobFunction === selectedFilters.job_function ||
        jobFunctions.find(jf => 
          (jf.value === selectedFilters.job_function || jf.id === selectedFilters.job_function) && 
          (jf.label === job.jobFunction || jf.name === job.jobFunction)
        );

      const matchesPositionGroup = !selectedFilters.position_group || 
        job.hierarchy === selectedFilters.position_group ||
        positionGroupsState.find(pg => 
          (pg.value === selectedFilters.position_group || pg.id === selectedFilters.position_group) && 
          (pg.label === job.hierarchy || pg.name === job.hierarchy)
        );

      return matchesSearch && matchesBusinessFunction && matchesDepartment && 
             matchesUnit && matchesJobFunction && matchesPositionGroup;
    });
  }, [jobCatalogData, searchTerm, selectedFilters, businessFunctions, departments, units, jobFunctions, positionGroupsState]);

  const stats = useMemo(() => {
    if (!statistics) return { totalJobs: 0, totalEmployees: 0 };
    
    return {
      totalJobs: jobCatalogData.length,
      totalEmployees: statistics.total_employees || 0,
    };
  }, [statistics, jobCatalogData]);

  const matrixData = useMemo(() => {
    if (!hierarchyData) return {};
    
    const matrix = {};
    
    const columns = matrixView === 'department' 
      ? departments.map(d => d.label || d.name)
      : matrixView === 'function' 
      ? jobFunctions.map(jf => jf.label || jf.name)
      : businessFunctions.map(bf => bf.label || bf.name);
    
    positionGroupsState.forEach(pg => {
      const hierarchyName = pg.label || pg.name;
      matrix[hierarchyName] = {};
      
      columns.forEach(col => {
        const jobs = jobCatalogData.filter(job => {
          if (matrixView === 'department') {
            return job.hierarchy === hierarchyName && job.department === col;
          }
          if (matrixView === 'function') {
            return job.hierarchy === hierarchyName && job.jobFunction === col;
          }
          return job.hierarchy === hierarchyName && job.businessFunction === col;
        });
        matrix[hierarchyName][col] = jobs;
      });
    });
    
    return matrix;
  }, [hierarchyData, matrixView, jobCatalogData, departments, jobFunctions, businessFunctions, positionGroupsState]);

  const clearFilters = () => {
    setSelectedFilters({
      business_function: '',
      department: '',
      unit: '',
      job_function: '',
      position_group: ''
    });
    setSearchTerm('');
  };

  const navigateToEmployee = (employeeId) => {
    router.push(`/structure/employee/${employeeId}/`);
  };

  // ==================== CONTEXT VALUE ====================
  
  const contextValue = {
    // View states
    activeView, setActiveView,
    viewMode, setViewMode,
    matrixView, setMatrixView,
    showFilters, setShowFilters,
    selectedJob, setSelectedJob,
    showCrudModal, setShowCrudModal,
    crudModalType, setCrudModalType,
    crudModalMode, setCrudModalMode,
    selectedItem, setSelectedItem,
    
    // Data
    employees, 
    statistics, 
    businessFunctions, 
    departments, 
    units, 
    jobFunctions, 
    jobTitles,
    positionGroups: positionGroupsState, 
    hierarchyData,
    
    // Filters
    searchTerm, setSearchTerm,
    selectedFilters, setSelectedFilters,
    
    // Loading and errors
    loading, 
    errors,
    
    // Form data
    formData, setFormData,
    
    // Computed data
    jobCatalogData, 
    filteredJobs, 
    stats, 
    matrixData, 
    filterOptions,
    
    // Functions
    openCrudModal, 
    closeCrudModal, 
    handleCrudSubmit, 
    handleDelete,
    navigateToEmployee, 
    clearFilters, 
    loadInitialData
  };

  // ==================== RENDER ====================
  
  if (loading.initial) {
    return <LoadingSpinner message="Loading Job Catalog..." />;
  }

  if (errors.initial) {
    return <ErrorDisplay error={errors.initial} onRetry={loadInitialData} />;
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 bg-almet-mystic dark:bg-gray-900 min-h-screen">
        
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Job Catalog
          </h1>
          <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
            Comprehensive job catalog with reference data management
          </p>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />

        {/* Content Views */}
        {activeView === 'overview' && <OverviewView context={contextValue} />}
        {activeView === 'hierarchical' && <HierarchicalTableView context={{ 
          ...contextValue, 
          employees: employees
        }} />}
        {activeView === 'simple' && <SimpleTableView context={contextValue} />}
        {activeView === 'structure' && <ReferenceDataView context={contextValue} />}
        {activeView === 'matrix' && <MatrixView context={contextValue} />}

        {/* Modals */}
        <CrudModal context={contextValue} darkMode={darkMode} />
        <JobDetailModal context={contextValue} />
        
      </div>
    </DashboardLayout>
  );
}