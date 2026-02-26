// components/jobDescription/PositionInformationTab.jsx - FIXED Preview
import React, { useState, useRef, useEffect } from 'react';
import { 
  UserCheck,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Loader,
  UserX
} from 'lucide-react';
import SearchableDropdown from '../common/SearchableDropdown';
import MultiSelect from '../common/MultiSelect';
import jobDescriptionService from '@/services/jobDescriptionService';

const PositionInformationTab = ({
  formData,
  dropdownData,
  selectedPositionGroup,
  matchingEmployees,
  validationErrors,
  onFormDataChange,
  onPositionGroupChange,
  onAssignmentPreviewUpdate,
  darkMode
}) => {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [assignmentPreview, setAssignmentPreview] = useState({
    strategy: null,
    employeeCount: 0,
    vacancyCount: 0,
    totalCount: 0,
    requiresSelection: false,
    previewMessage: '',
    records: [],
    employees: [],
    criteria: {}
  });
  const [previewError, setPreviewError] = useState(null);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Helper functions
  const getFilteredEmployees = (excludeField = null) => {
    if (!dropdownData.employees) return [];
    
    let filtered = dropdownData.employees;
    
    if (excludeField !== 'business_function' && formData.business_function) {
      filtered = filtered.filter(emp => emp.business_function_name === formData.business_function);
    }
    
    if (excludeField !== 'department' && formData.department) {
      filtered = filtered.filter(emp => emp.department_name === formData.department);
    }
    
    if (excludeField !== 'unit' && formData.unit) {
      filtered = filtered.filter(emp => emp.unit_name === formData.unit);
    }
    
    if (excludeField !== 'job_function' && formData.job_function) {
      filtered = filtered.filter(emp => emp.job_function_name === formData.job_function);
    }
    
    if (excludeField !== 'position_group' && formData.position_group) {
      filtered = filtered.filter(emp => emp.position_group_name === formData.position_group);
    }
    
    if (excludeField !== 'grading_level' && formData.grading_level) {
      filtered = filtered.filter(emp => emp.grading_level === formData.grading_level);
    }
    
    if (excludeField !== 'job_title' && formData.job_title) {
      filtered = filtered.filter(emp => 
        emp.job_title && emp.job_title.toLowerCase().includes(formData.job_title.toLowerCase())
      );
    }
    
    return filtered;
  };

  // components/jobDescription/PositionInformationTab.jsx - FIXED for Edit Mode
// Bu faylda yalnız getUniqueJobTitles, getUniqueBusinessFunctions və s. funksiyaları əvəz edin

// 🔥 FIXED: Edit mode üçün əlavə fallback
const getUniqueJobTitles = () => {
  const filtered = getFilteredEmployees('job_title');
  const titles = [...new Set(
    filtered
      .map(emp => emp.job_title)
      .filter(title => title && title.trim() !== '')
  )];
  
  // 🔥 Əgər formData-da job_title var amma options-da yoxdursa, əlavə et
  if (formData.job_title && formData.job_title.trim() && 
      !titles.includes(formData.job_title)) {
    titles.unshift(formData.job_title);
  }
  
  return titles.map(title => ({
    value: title,
    label: title
  }));
};

const getUniqueBusinessFunctions = () => {
  const filtered = getFilteredEmployees('business_function');
  const functions = [...new Set(
    filtered
      .map(emp => emp.business_function_name)
      .filter(func => func && func.trim() !== '')
  )];
  
  // 🔥 Əgər formData-da business_function var amma options-da yoxdursa, əlavə et
  if (formData.business_function && formData.business_function.trim() && 
      !functions.includes(formData.business_function)) {
    functions.unshift(formData.business_function);
  }
  
  return functions.map(func => ({
    value: func,
    label: func
  }));
};

const getFilteredDepartments = () => {
  const filtered = getFilteredEmployees('department');
  const departments = [...new Set(
    filtered
      .map(emp => emp.department_name)
      .filter(dept => dept && dept.trim() !== '')
  )];
  
  // 🔥 Əgər formData-da department var amma options-da yoxdursa, əlavə et
  if (formData.department && formData.department.trim() && 
      !departments.includes(formData.department)) {
    departments.unshift(formData.department);
  }
  
  return departments.map(dept => ({
    value: dept,
    label: dept
  }));
};

const getFilteredUnits = () => {
  const filtered = getFilteredEmployees('unit');
  const units = [...new Set(
    filtered
      .map(emp => emp.unit_name)
      .filter(unit => unit && unit.trim() !== '')
  )];
  
  // 🔥 Əgər formData-da unit var amma options-da yoxdursa, əlavə et
  if (formData.unit && formData.unit.trim() && 
      !units.includes(formData.unit)) {
    units.unshift(formData.unit);
  }
  
  return units.map(unit => ({
    value: unit,
    label: unit
  }));
};

const getFilteredJobFunctions = () => {
  const filtered = getFilteredEmployees('job_function');
  const jobFunctions = [...new Set(
    filtered
      .map(emp => emp.job_function_name)
      .filter(func => func && func.trim() !== '')
  )];
  
  // 🔥 Əgər formData-da job_function var amma options-da yoxdursa, əlavə et
  if (formData.job_function && formData.job_function.trim() && 
      !jobFunctions.includes(formData.job_function)) {
    jobFunctions.unshift(formData.job_function);
  }
  
  return jobFunctions.map(func => ({
    value: func,
    label: func
  }));
};

const getFilteredPositionGroups = () => {
  const filtered = getFilteredEmployees('position_group');
  const positionGroups = [...new Set(
    filtered
      .map(emp => emp.position_group_name)
      .filter(group => group && group.trim() !== '')
  )];
  
  // 🔥 Əgər formData-da position_group var amma options-da yoxdursa, əlavə et
  if (formData.position_group && formData.position_group.trim() && 
      !positionGroups.includes(formData.position_group)) {
    positionGroups.unshift(formData.position_group);
  }
  
  return positionGroups.map(group => ({
    value: group,
    label: group
  }));
};

const getFilteredGradingLevels = () => {
  const filtered = getFilteredEmployees('grading_level');
  const gradingLevels = [...new Set(
    filtered
      .map(emp => emp.grading_level)
      .filter(level => level && level.trim() !== '')
  )];
  
  // 🔥 Əgər formData-da grading_levels var amma options-da yoxdursa, əlavə et
  if (formData.grading_levels && Array.isArray(formData.grading_levels)) {
    formData.grading_levels.forEach(level => {
      if (level && level.trim() && !gradingLevels.includes(level)) {
        gradingLevels.push(level);
      }
    });
  } else if (formData.grading_level && formData.grading_level.trim() && 
             !gradingLevels.includes(formData.grading_level)) {
    gradingLevels.push(formData.grading_level);
  }
  
  return gradingLevels.map(level => ({
    id: level,
    value: level,
    name: level,
    label: level
  }));
};

  const findExactConstraintMatch = (requiredCriteria, debugLabel = '') => {
    if (!dropdownData.employees || dropdownData.employees.length === 0) return null;
    
    const exactMatches = dropdownData.employees.filter(emp => {
      let matches = true;
      
      for (const [field, value] of Object.entries(requiredCriteria)) {
        if (emp[field] !== value) {
          matches = false;
          break;
        }
      }
      
      return matches;
    });
    
    if (exactMatches.length === 0) return null;
    
    const vacantMatches = exactMatches.filter(emp => 
      emp.is_vacancy || emp.record_type === 'vacancy' || emp.name === 'VACANT'
    );
    
    const chosen = vacantMatches.length > 0 ? vacantMatches[0] : exactMatches[0];
    
    return chosen;
  };

// PositionInformationTab.jsx - CASE-INSENSITIVE ID Mapping Fix

// 🔥 Helper function to safely extract and convert ID
const extractId = (employee, ...possibleFields) => {
  for (const field of possibleFields) {
    const value = employee[field];
    if (value !== null && value !== undefined && value !== '') {
      const parsed = parseInt(value);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
};

// 🔥 Helper for case-insensitive string comparison
const matchesIgnoreCase = (str1, str2) => {
  if (!str1 || !str2) return false;
  return str1.toLowerCase().trim() === str2.toLowerCase().trim();
};

// 🔥 CASE-INSENSITIVE: Business Function ID lookup
const getBusinessFunctionId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
  // Strategy 1: Find exact match (case-insensitive)
  const employee = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.business_function_name, name)
  );
  
  if (employee) {
    const id = extractId(employee, 'business_function_id', 'business_function');
    if (id) {
 
      return id;
    }
  }
  
  // Strategy 2: Try employeeMap with original case
  const mapEntry = dropdownData.employeeMap?.get(`bf_${name}`);
  if (mapEntry) {
    const id = extractId(mapEntry, 'business_function_id', 'business_function');
    if (id) {
 
      return id;
    }
  }
  

  return null;
};

// 🔥 CASE-INSENSITIVE: Department ID lookup
const getDepartmentId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
  // Strategy 1: Match with business function constraint (case-insensitive)
  if (formData.business_function) {
    const employee = dropdownData.employees.find(emp => 
      matchesIgnoreCase(emp.business_function_name, formData.business_function) &&
      matchesIgnoreCase(emp.department_name, name)
    );
    
    if (employee) {
      const id = extractId(employee, 'department_id', 'department');
      if (id) {

        return id;
      }
    }
  }
  
  // Strategy 2: Find ANY employee with this department (case-insensitive, less strict)
  const anyMatch = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.department_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'department_id', 'department');
    if (id) {
  
      return id;
    }
  }
  
  // Strategy 3: Try employeeMap
  const mapEntry = dropdownData.employeeMap?.get(`dept_${name}`);
  if (mapEntry) {
    const id = extractId(mapEntry, 'department_id', 'department');
    if (id) {
  
      return id;
    }
  }
  
  // Debug output - show what's available
  const availableDepts = [...new Set(dropdownData.employees.map(e => e.department_name).filter(Boolean))];


  
  return null;
};

// 🔥 CASE-INSENSITIVE: Unit ID lookup
const getUnitId = (name) => {
  if (!name) return null;
  
  // Strategy 1: Match with full constraint (case-insensitive)
  if (formData.business_function && formData.department) {
    const employee = dropdownData.employees.find(emp =>
      matchesIgnoreCase(emp.business_function_name, formData.business_function) &&
      matchesIgnoreCase(emp.department_name, formData.department) &&
      matchesIgnoreCase(emp.unit_name, name)
    );
    
    if (employee) {
      const id = extractId(employee, 'unit_id', 'unit');
      if (id) {
    
        return id;
      }
    }
  }
  
  // Strategy 2: Find ANY employee with this unit (case-insensitive)
  const anyMatch = dropdownData.employees?.find(emp => 
    matchesIgnoreCase(emp.unit_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'unit_id', 'unit');
    if (id) {
  
      return id;
    }
  }
  

  return null;
};

// 🔥 CASE-INSENSITIVE: Job Function ID lookup
const getJobFunctionId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
  // Strategy 1: Match with business function and department (case-insensitive)
  if (formData.business_function && formData.department) {
    const employee = dropdownData.employees.find(emp =>
      matchesIgnoreCase(emp.business_function_name, formData.business_function) &&
      matchesIgnoreCase(emp.department_name, formData.department) &&
      matchesIgnoreCase(emp.job_function_name, name)
    );
    
    if (employee) {
      const id = extractId(employee, 'job_function_id', 'job_function');
      if (id) {
     
        return id;
      }
    }
  }
  
  // Strategy 2: Find ANY employee with this job function (case-insensitive, less strict)
  const anyMatch = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.job_function_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'job_function_id', 'job_function');
    if (id) {
  
      return id;
    }
  }
  
  // Strategy 3: Try employeeMap
  const mapEntry = dropdownData.employeeMap?.get(`jf_${name}`);
  if (mapEntry) {
    const id = extractId(mapEntry, 'job_function_id', 'job_function');
    if (id) {

      return id;
    }
  }
  
  // Debug output
  const availableFuncs = [...new Set(dropdownData.employees.map(e => e.job_function_name).filter(Boolean))];
 

  return null;
};

// 🔥 CASE-INSENSITIVE: Position Group ID lookup
const getPositionGroupId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
  // Strategy 1: Match with full constraint (case-insensitive)
  if (formData.business_function && formData.department && formData.job_function) {
    const employee = dropdownData.employees.find(emp =>
      matchesIgnoreCase(emp.business_function_name, formData.business_function) &&
      matchesIgnoreCase(emp.department_name, formData.department) &&
      matchesIgnoreCase(emp.job_function_name, formData.job_function) &&
      matchesIgnoreCase(emp.position_group_name, name)
    );
    
    if (employee) {
      const id = extractId(employee, 'position_group_id', 'position_group');
      if (id) {
       
        return id;
      }
    }
  }
  
  // Strategy 2: Find ANY employee with this position group (case-insensitive)
  const anyMatch = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.position_group_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'position_group_id', 'position_group');
    if (id) {
     
      return id;
    }
  }
  
  // Strategy 3: Try employeeMap
  const mapEntry = dropdownData.employeeMap?.get(`pg_${name}`);
  if (mapEntry) {
    const id = extractId(mapEntry, 'position_group_id', 'position_group');
    if (id) {
    
      return id;
    }
  }
  

  return null;
};

// 🔥 UPDATED: Better validation in updateAssignmentPreview
const updateAssignmentPreview = async () => {
  if (!areAllRequiredFieldsFilled()) {
    const emptyPreview = {
      strategy: null,
      employeeCount: 0,
      vacancyCount: 0,
      totalCount: 0,
      requiresSelection: false,
      previewMessage: 'Complete all required job information to see assignment preview',
      records: [],
      employees: [],
      criteria: {}
    };
    
    setAssignmentPreview(emptyPreview);
    
    if (onAssignmentPreviewUpdate) {
      onAssignmentPreviewUpdate(null);
    }
    return;
  }

  if (!dropdownData.employees || dropdownData.employees.length === 0) {
    setAssignmentPreview({
      strategy: null,
      employeeCount: 0,
      vacancyCount: 0,
      totalCount: 0,
      requiresSelection: false,
      previewMessage: 'Loading employee data...',
      records: [],
      employees: [],
      criteria: {}
    });
    return;
  }

  try {
    setPreviewLoading(true);
    setPreviewError(null);

    // 🔥 Get IDs with case-insensitive lookup
    const businessFunctionId = getBusinessFunctionId(formData.business_function);
    const departmentId = getDepartmentId(formData.department);
    const jobFunctionId = getJobFunctionId(formData.job_function);
    const positionGroupId = getPositionGroupId(formData.position_group);
    const unitId = formData.unit ? getUnitId(formData.unit) : null;

 

    // 🔥 Enhanced validation with helpful error messages
    if (!businessFunctionId || !departmentId || !jobFunctionId || !positionGroupId) {
      const missingFields = [];
      if (!businessFunctionId) missingFields.push(`Business Function "${formData.business_function}"`);
      if (!departmentId) missingFields.push(`Department "${formData.department}"`);
      if (!jobFunctionId) missingFields.push(`Job Function "${formData.job_function}"`);
      if (!positionGroupId) missingFields.push(`Position Group "${formData.position_group}"`);
      
      const errorMsg = `Cannot find IDs for: ${missingFields.join(', ')}\n\n` +
        `This means no employees currently exist with these exact organizational values.\n\n` +
        `Possible solutions:\n` +
        `1. Check if the organizational structure has changed\n` +
        `2. Update the job's organizational information to match current records\n` +
        `3. Ensure at least one employee exists with this combination`;
      
      throw new Error(errorMsg);
    }

    // Ensure all IDs are integers
    const previewCriteria = {
      job_title: formData.job_title.trim(),
      business_function: parseInt(businessFunctionId),
      department: parseInt(departmentId),
      unit: unitId ? parseInt(unitId) : null,
      job_function: parseInt(jobFunctionId),
      position_group: parseInt(positionGroupId),
      max_preview: 50,
      include_vacancies: true
    };

    // Handle grading_levels
    if (formData.grading_levels && Array.isArray(formData.grading_levels) && formData.grading_levels.length > 0) {
      previewCriteria.grading_levels = formData.grading_levels.map(level => level.trim()).filter(Boolean);
    } else if (formData.grading_level && formData.grading_level.trim()) {
      previewCriteria.grading_levels = [formData.grading_level.trim()];
    }


    const response = await jobDescriptionService.previewEligibleEmployees(previewCriteria);
    


    const employees = Array.isArray(response.employees) ? response.employees : [];
    const vacancies = Array.isArray(response.vacancies) ? response.vacancies : [];
    const unifiedList = Array.isArray(response.unified_list) ? response.unified_list : [];
    
    let allRecords = [];
    if (unifiedList.length > 0) {
      allRecords = unifiedList;
    } else {
      allRecords = [...employees, ...vacancies];
    }

    const newPreview = {
      strategy: response.assignment_strategy || response.strategy || null,
      employeeCount: response.eligible_employees_count || response.employees_count || employees.length || 0,
      vacancyCount: response.eligible_vacancies_count || response.vacancies_count || vacancies.length || 0,
      totalCount: response.total_eligible_count || response.total_eligible || allRecords.length,
      requiresSelection: response.requires_manual_selection || false,
      previewMessage: response.strategy_message || response.message || '',
      records: allRecords,
      employees: allRecords,
      criteria: response.criteria || previewCriteria,
      nextSteps: response.next_steps || {}
    };

 

    setAssignmentPreview(newPreview);

    if (onAssignmentPreviewUpdate) {
      onAssignmentPreviewUpdate({
        ...newPreview,
        employees: allRecords,
        requiresSelection: response.requires_manual_selection || false,
        originalResponse: response
      });
    }

  } catch (error) {
    console.error('❌ Error fetching assignment preview:', error);
    
    let errorMessage = 'Error loading assignment preview';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    setPreviewError(errorMessage);
    const errorPreview = {
      strategy: 'error',
      employeeCount: 0,
      vacancyCount: 0,
      totalCount: 0,
      requiresSelection: false,
      previewMessage: errorMessage,
      records: [],
      employees: [],
      criteria: {}
    };
    
    setAssignmentPreview(errorPreview);

    if (onAssignmentPreviewUpdate) {
      onAssignmentPreviewUpdate(null);
    }
  } finally {
    setPreviewLoading(false);
  }
};

  // PositionInformationTab.jsx - areAllRequiredFieldsFilled funksiyasını bu ilə əvəz edin

const areAllRequiredFieldsFilled = () => {
  const hasValue = (field) => {
    if (field === null || field === undefined) return false;
    if (typeof field === 'string') return field.trim() !== '';
    if (typeof field === 'number') return true;
    return !!field;
  };

  // 🔥 FIXED: Sadəcə name dəyərlərini yoxla, ID mapping-ə ehtiyac yoxdur
  const basicRequirementsMet = !!(
    hasValue(formData.job_title) &&
    hasValue(formData.job_purpose) &&
    hasValue(formData.business_function) &&
    hasValue(formData.department) &&
    hasValue(formData.job_function) &&
    hasValue(formData.position_group)
  );



  return basicRequirementsMet;
};



  // Watch for changes
  useEffect(() => {
    if (areAllRequiredFieldsFilled()) {
      const timer = setTimeout(() => {
        updateAssignmentPreview();
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      const emptyPreview = {
        strategy: null,
        employeeCount: 0,
        vacancyCount: 0,
        totalCount: 0,
        requiresSelection: false,
        previewMessage: 'Complete all required job information to see assignment preview',
        records: [],
        employees: [],
        criteria: {}
      };
      
      setAssignmentPreview(emptyPreview);
      
      if (onAssignmentPreviewUpdate) {
        onAssignmentPreviewUpdate(null);
      }
    }
  }, [
    formData.job_title,
    formData.job_purpose,
    formData.business_function,
    formData.department,
    formData.job_function,
    formData.position_group,
    dropdownData.employees
  ]);

  useEffect(() => {
    if (areAllRequiredFieldsFilled()) {
      const timer = setTimeout(() => {
        updateAssignmentPreview();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    formData.unit,
    formData.grading_levels
  ]);

  const shouldShowPreview = areAllRequiredFieldsFilled();

  // Handle field changes
  const handleBusinessFunctionChange = (value) => {
    const newFormData = {
      ...formData, 
      business_function: value, 
      department: '', 
      unit: '', 
      job_function: '', 
      position_group: '', 
      grading_level: '',
      grading_levels: []
    };
    
    if (formData.job_title) {
      const filteredEmployees = dropdownData.employees?.filter(emp => 
        emp.business_function_name === value && 
        emp.job_title && 
        emp.job_title.toLowerCase().includes(formData.job_title.toLowerCase())
      );
      
      if (!filteredEmployees || filteredEmployees.length === 0) {
        newFormData.job_title = '';
      }
    }
    
    onFormDataChange(newFormData);
  };

  const handleDepartmentChange = (value) => {
    const newFormData = {
      ...formData, 
      department: value, 
      unit: '', 
      job_function: '', 
      position_group: '', 
      grading_level: '',
      grading_levels: []
    };
    
    if (formData.job_title) {
      const filteredEmployees = dropdownData.employees?.filter(emp => 
        emp.business_function_name === formData.business_function &&
        emp.department_name === value && 
        emp.job_title && 
        emp.job_title.toLowerCase().includes(formData.job_title.toLowerCase())
      );

    
      
      if (!filteredEmployees || filteredEmployees.length === 0) {
        newFormData.job_title = '';
      }
    }
    
    onFormDataChange(newFormData);
  };

  const handleJobFunctionChange = (value) => {
    const newFormData = {
      ...formData, 
      job_function: value, 
      position_group: '', 
      grading_level: '',
      grading_levels: []
    };
    onFormDataChange(newFormData);
  };

  const handlePositionGroupChange = (value) => {
    const newFormData = {
      ...formData, 
      position_group: value, 
      grading_level: '',
      grading_levels: []
    };
    onFormDataChange(newFormData);
    onPositionGroupChange(value);
  };

  const counts = {
    jobTitles: getUniqueJobTitles().length,
    businessFunctions: getUniqueBusinessFunctions().length,
    departments: getFilteredDepartments().length,
    units: getFilteredUnits().length,
    jobFunctions: getFilteredJobFunctions().length,
    positionGroups: getFilteredPositionGroups().length,
    gradingLevels: getFilteredGradingLevels().length
  };

  // 🔥 Get assignment preview display
  const getAssignmentPreviewDisplay = () => {
    if (previewLoading) {
      return {
        icon: Loader,
        color: 'text-sky-600',
        bgColor: 'bg-sky-50 dark:bg-sky-900/20',
        borderColor: 'border-sky-200 dark:border-sky-800',
        title: 'Checking Employee Matches...',
        message: 'Loading assignment preview...',
        showSpinner: true
      };
    }

    if (previewError) {
      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Preview Error',
        message: previewError
      };
    }

    switch (assignmentPreview.strategy) {
      case 'auto_assign_single':
        const records = assignmentPreview.records || assignmentPreview.employees || [];
        const employee = records.length > 0 ? records[0] : null;
        
        if (!employee) {
          return {
            icon: AlertCircle,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50 dark:bg-gray-900/20',
            borderColor: 'border-gray-200 dark:border-gray-800',
            title: 'No Employee Data',
            message: 'Employee information not available'
          };
        }
        
        const isVacancy = employee.is_vacancy || employee.record_type === 'vacancy';
        
        return {
          icon: isVacancy ? UserX : UserCheck,
          color: isVacancy ? 'text-orange-600' : 'text-green-600',
          bgColor: isVacancy ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20',
          borderColor: isVacancy ? 'border-orange-200 dark:border-orange-800' : 'border-green-200 dark:border-green-800',
          title: isVacancy ? 'Single Vacancy Position Match' : 'Single Employee Match',
          message: isVacancy ? 'Will assign to vacant position' : 'Will automatically assign to the matching employee',
          employee: employee,
          isVacancy: isVacancy
        };
      
      case 'manual_selection_required':
        return {
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          title: `${assignmentPreview.totalCount || 0} Matches Found`,
          message: 'Manual selection will be required during job creation',
          showPreviewButton: true
        };
      
      case 'no_employees_found':
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          title: 'No Matching Records',
          message: 'Will create as unassigned position'
        };
      
      default:
        return {
          icon: Info,
          color: 'text-sky-600',
          bgColor: 'bg-sky-50 dark:bg-sky-900/20',
          borderColor: 'border-sky-200 dark:border-sky-800',
          title: 'Employee Assignment Preview',
          message: assignmentPreview.previewMessage || 'Complete all required job information to see assignment preview'
        };
    }
  };

  const assignmentDisplay = getAssignmentPreviewDisplay();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Title */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Job Title <span className="text-red-500">*</span>
            {counts.jobTitles > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.jobTitles} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getUniqueJobTitles()}
            value={formData.job_title}
            onChange={(value) => onFormDataChange({...formData, job_title: value})}
            placeholder={counts.jobTitles > 0 ? "Select job title from records" : "Enter job title"}
            className={validationErrors.job_title ? 'border-red-500' : ''}
            darkMode={darkMode}
            allowUncheck={true}
          />
          {validationErrors.job_title && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.job_title}</p>
          )}
        </div>
        
        {/* Company */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Company <span className="text-red-500">*</span>
            {counts.businessFunctions > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.businessFunctions} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getUniqueBusinessFunctions()}
            value={formData.business_function}
            onChange={handleBusinessFunctionChange}
            placeholder={counts.businessFunctions > 0 ? "Select Company" : "No Companies available"}
            className={validationErrors.business_function ? 'border-red-500' : ''}
            darkMode={darkMode}
            allowUncheck={true}
          />
          {validationErrors.business_function && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.business_function}</p>
          )}
        </div>
        
        {/* Department */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Department <span className="text-red-500">*</span>
            {counts.departments > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.departments} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredDepartments()}
            value={formData.department}
            onChange={handleDepartmentChange}
            placeholder={formData.business_function ? 
              (counts.departments > 0 ? "Select Department" : "No departments available") : 
              "Select Company First"
            }
            className={validationErrors.department ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.department && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
          )}
        </div>
        
        {/* Unit */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Unit
            {counts.units > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.units} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredUnits()}
            value={formData.unit}
            onChange={(value) => onFormDataChange({...formData, unit: value})}
            placeholder={formData.department ? 
              (counts.units > 0 ? "Select Unit" : "No units available") : 
              "Select Department First"
            }
            className={validationErrors.unit ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.unit && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.unit}</p>
          )}
        </div>

        {/* Job Function */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Job Function <span className="text-red-500">*</span>
            {counts.jobFunctions > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.jobFunctions} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredJobFunctions()}
            value={formData.job_function}
            onChange={handleJobFunctionChange}
            placeholder={formData.department ? 
              (counts.jobFunctions > 0 ? "Select Job Function" : "No job functions available") : 
              "Select Department First"
            }
            className={validationErrors.job_function ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.job_function && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.job_function}</p>
          )}
        </div>
        
        {/* Hierarchy */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Hierarchy <span className="text-red-500">*</span>
            {counts.positionGroups > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.positionGroups} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredPositionGroups()}
            value={formData.position_group}
            onChange={handlePositionGroupChange}
            placeholder={formData.job_function ? 
              (counts.positionGroups > 0 ? "Select Hierarchy" : "No Hierarchies available") : 
              "Select Job Function First"
            }
            className={validationErrors.position_group ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.position_group && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.position_group}</p>
          )}
          </div>
        
        {/* Grading Levels - Multi-Select */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Grading Levels
            {counts.gradingLevels > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.gradingLevels} available)</span>
            )}
          </label>
          <MultiSelect
            options={getFilteredGradingLevels()}
            selected={Array.isArray(formData.grading_levels) ? formData.grading_levels : (formData.grading_level ? [formData.grading_level] : [])}
            onChange={(fieldName, value) => {
              const currentSelection = Array.isArray(formData.grading_levels) 
                ? formData.grading_levels 
                : (formData.grading_level ? [formData.grading_level] : []);
              
              const newSelection = currentSelection.includes(value)
                ? currentSelection.filter(level => level !== value)
                : [...currentSelection, value];
              
              onFormDataChange({
                ...formData, 
                grading_levels: newSelection,
                grading_level: newSelection[0] || ''
              });
            }}
            placeholder={formData.position_group ? 
              (counts.gradingLevels > 0 ? "Select one or more grading levels" : "No grading levels available") : 
              "Select Hierarchy First"
            }
            fieldName="grading_levels"
            darkMode={darkMode}
          />
          {formData.grading_levels && formData.grading_levels.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle size={12} />
              <span>
                Will search for employees with grade{formData.grading_levels.length > 1 ? 's' : ''}: {formData.grading_levels.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Job Purpose */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          Job Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.job_purpose}
          onChange={(e) => onFormDataChange({...formData, job_purpose: e.target.value})}
          rows="3"
          className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm ${
            validationErrors.job_purpose ? 'border-red-500' : ''
          }`}
          placeholder="Describe the main purpose of this job..."
        />
        {validationErrors.job_purpose && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.job_purpose}</p>
        )}
      </div>

      {/* Assignment Preview Section */}
      {shouldShowPreview && (
        <div className={`p-4 ${assignmentDisplay.bgColor} rounded-lg border ${assignmentDisplay.borderColor}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {assignmentDisplay.showSpinner ? (
                <Loader size={16} className={`${assignmentDisplay.color} animate-spin`} />
              ) : (
                <assignmentDisplay.icon size={16} className={assignmentDisplay.color} />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${textPrimary} mb-1`}>
                {assignmentDisplay.title}
              </h4>
              <p className={`text-xs ${textSecondary} mb-3`}>
                {assignmentDisplay.message}
              </p>
              
              {/* Single Employee/Vacancy Display */}
              {assignmentDisplay.employee && (
                <div className={`p-3 border ${borderColor} rounded-lg ${bgCard} mb-3`}>
                  <h5 className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider flex items-center gap-2`}>
                    {assignmentDisplay.isVacancy ? (
                      <>
                        <UserX size={12} className="text-orange-600" />
                        Vacancy Assignment Target
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} className="text-green-600" />
                        Auto-Assignment Target
                      </>
                    )}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`font-medium ${textMuted}`}>
                        {assignmentDisplay.isVacancy ? 'Position:' : 'Name:'}
                      </span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.isVacancy ? 
                          `Vacant Position (${assignmentDisplay.employee.employee_id})` : 
                          assignmentDisplay.employee.full_name || assignmentDisplay.employee.name
                        }
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>
                        {assignmentDisplay.isVacancy ? 'Position ID:' : 'Employee ID:'}
                      </span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.employee.employee_id}
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>Current Job:</span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.employee.job_title || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>Manager:</span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.employee.line_manager_name || 'N/A'}
                      </span>
                    </div>
                    {assignmentDisplay.isVacancy && assignmentDisplay.employee.vacancy_details && (
                      <div className="md:col-span-2">
                        <span className={`font-medium ${textMuted}`}>Notes:</span>
                        <span className={`${textPrimary} ml-2 text-xs`}>
                          {assignmentDisplay.employee.vacancy_details.notes || 'No additional notes'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Multiple Records Preview */}
              {assignmentDisplay.showPreviewButton && (() => {
                const employeeList = assignmentPreview.records || assignmentPreview.employees || [];
                return employeeList.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {employeeList.slice(0, 10).map((emp, index) => {
                      if (!emp || typeof emp !== 'object') {
                        return null;
                      }
                      
                      const isVacancy = emp.is_vacancy || emp.record_type === 'vacancy';
                      const employeeId = emp.employee_id || emp.id || `emp-${index}`;
                      const employeeName = emp.full_name || emp.name || 'Unknown';
                      const jobTitle = emp.job_title || 'No title';
                      
                      return (
                        <div key={employeeId} className={`text-xs ${textSecondary} p-2 ${bgAccent} rounded flex items-center justify-between`}>
                          <div className="flex-1">
                            <span className="font-medium">
                              {isVacancy ? `Vacant Position (${employeeId})` : employeeName}
                            </span>
                            <span className={`${textMuted} ml-2`}>({employeeId})</span>
                            <span className={`${textMuted} ml-2`}>- {jobTitle}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            {isVacancy ? (
                              <>
                                <UserX size={10} className="text-orange-600" />
                                <span className="text-orange-600">Vacancy</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={10} className="text-green-600" />
                                <span className="text-green-600">Match</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }).filter(Boolean)}
                    
                    {employeeList.length > 10 && (
                      <div className={`text-center py-2 ${textMuted} text-xs`}>
                        ... and {employeeList.length - 10} more records
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Helpful message when not all fields are filled */}
      {!shouldShowPreview && (
        <div className={`p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800`}>
          <div className="flex items-start gap-3">
            <Info size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className={`text-sm font-semibold ${textPrimary} mb-1`}>
                Complete Required Fields
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Required:</span> Job Title, Company, Department, Job Function, Hierarchy, Job Purpose
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionInformationTab;