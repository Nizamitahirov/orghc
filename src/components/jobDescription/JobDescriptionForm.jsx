// components/jobDescription/JobDescriptionForm.jsx - COMPLETE with Auto-Select Fix
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Briefcase, 
  Save, 
  X, 
  AlertCircle,
  UserCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Users,
  Target
} from 'lucide-react';
import PositionInformationTab from './PositionInformationTab';
import JobResponsibilitiesTab from './JobResponsibilitiesTab';
import WorkConditionsTab from './WorkConditionsTab';
import EmployeeSelectionModal from './EmployeeSelectionModal';
import jobDescriptionService from '@/services/jobDescriptionService';

const JobDescriptionForm = ({
  formData = {},
  editingJob = null,
  dropdownData = {},
  selectedSkillGroup = '',
  selectedBehavioralGroup = '',
  availableSkills = [],
  availableCompetencies = [],
  selectedPositionGroup = '',
  matchingEmployees = [],
  actionLoading = false,
  onFormDataChange = () => {},
  onSkillGroupChange = () => {},
  onBehavioralGroupChange = () => {},
  onPositionGroupChange = () => {},
  onSubmit = () => {},
  onCancel = () => {},
  onUpdate = () => {},
  darkMode = false
}) => {
  const [activeTab, setActiveTab] = useState('position');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Employee selection and assignment state
  const [showEmployeeSelectionModal, setShowEmployeeSelectionModal] = useState(false);
  const [assignmentPreview, setAssignmentPreview] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [jobCriteria, setJobCriteria] = useState({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track if editing job was in pending/approved state
  const [wasInApprovalProcess, setWasInApprovalProcess] = useState(false);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-gray-50";

  const tabs = [
    {
      id: 'position',
      name: 'Basic Info',
      icon: User,
      description: 'Job title, department, employee matching'
    },
    {
      id: 'responsibilities',
      name: 'Responsibilities',
      icon: Briefcase,
      description: 'Duties, KPIs, skills, competencies'
    },
    {
      id: 'conditions',
      name: 'Resources',
      icon: Building,
      description: 'Resources, access rights, benefits'
    }
  ];

  // Check if editing job was in approval process
  useEffect(() => {
    if (editingJob) {
      const approvalStatuses = ['PENDING_LINE_MANAGER', 'PENDING_EMPLOYEE', 'APPROVED'];
      setWasInApprovalProcess(approvalStatuses.includes(editingJob.status));
    }
  }, [editingJob]);

  const handleAssignmentPreviewUpdate = (previewData) => {
    setAssignmentPreview(previewData);
    
    // Don't reset in edit mode
    if (editingJob) {

      return;
    }
    
    if (!previewData || previewData.strategy !== 'manual_selection_required') {
      setSelectedEmployeeIds([]);
      setEligibleEmployees([]);
      setJobCriteria({});
    }
    
    if (previewData && previewData.strategy === 'auto_assign_single') {
      const records = previewData.records || previewData.employees || [];
      
      if (records.length === 1) {
        const record = records[0];
        const recordId = record.id;
        
        setSelectedEmployeeIds([recordId]);
        setEligibleEmployees(records);
        setJobCriteria(previewData.criteria || {});
      }
    }
    
    // 🔥 AUTO-SELECT ALL for manual_selection_required
    if (previewData && previewData.strategy === 'manual_selection_required') {
      const records = previewData.records || previewData.employees || [];
      const criteria = previewData.criteria || {};
      
      setEligibleEmployees(records);
      setJobCriteria(criteria);
      
      // Auto-select all matching records
      const allRecordIds = records.map(record => record.id);
      setSelectedEmployeeIds(allRecordIds);
      

    }
  };
useEffect(() => {
  if (editingJob) {
    console.log('📝 [EDIT MODE] Current form data:', {
      skills: formData.required_skills_data,
      behavioral: formData.behavioral_competencies_data,
      leadership: formData.leadership_competencies_data,
      resources: formData.business_resources_ids,
      access: formData.access_rights_ids,
      benefits: formData.company_benefits_ids
    });
  }
}, [formData, editingJob]);
  const handleEmployeeSelection = (employeeIds, employeeData) => {
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      console.warn('⚠️ Invalid employee/vacancy selection data');
      return;
    }
    
    setSelectedEmployeeIds(employeeIds);
    setShowEmployeeSelectionModal(false);
  };

  const getCurrentTabIndex = () => {
    return tabs.findIndex(tab => tab.id === activeTab);
  };

  const canNavigateToNext = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex === -1) return false;
    
    switch (activeTab) {
      case 'position':
        return isTabCompleted('position');
      case 'responsibilities':
        return isTabCompleted('responsibilities');
      case 'conditions':
        return true;
      default:
        return false;
    }
  };

  const goToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1 && canNavigateToNext()) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const isLastTab = () => {
    return getCurrentTabIndex() === tabs.length - 1;
  };

  const isFirstTab = () => {
    return getCurrentTabIndex() === 0;
  };

  const handleTabChange = (targetTabId) => {
    const currentIndex = getCurrentTabIndex();
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId);
    
    if (targetIndex > currentIndex) {
      if (validateCurrentTab()) {
        setActiveTab(targetTabId);
      } else {
        const errorMessage = Object.values(validationErrors).join('\n');
        alert('Please fix the following errors before proceeding:\n\n' + errorMessage);
      }
    } else {
      setActiveTab(targetTabId);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.job_title?.trim()) {
      errors.job_title = 'Job Title is required';
    }
    if (!formData.job_purpose?.trim()) {
      errors.job_purpose = 'Job Purpose is required';
    }
    if (!formData.business_function) {
      errors.business_function = 'Company is required';
    }
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.job_function) {
      errors.job_function = 'Job Function is required';
    }
    if (!formData.position_group) {
      errors.position_group = 'Hierarchy is required';
    }
    
    const requiredSections = ['criticalDuties', 'positionMainKpis', 'jobDuties', 'requirements'];
    requiredSections.forEach(sectionName => {
      const sectionValid = formData[sectionName] && 
        formData[sectionName].some(item => item && item.trim() !== '');
      if (!sectionValid) {
        errors[sectionName] = `At least one ${sectionName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCurrentTab = () => {
    const errors = {};
    
    switch (activeTab) {
      case 'position':
        if (!formData.job_title?.trim()) {
          errors.job_title = 'Job Title is required';
        }
        if (!formData.job_purpose?.trim()) {
          errors.job_purpose = 'Job Purpose is required';
        }
        if (!formData.business_function) {
          errors.business_function = 'Company is required';
        }
        if (!formData.department) {
          errors.department = 'Department is required';
        }
        if (!formData.job_function) {
          errors.job_function = 'Job Function is required';
        }
        if (!formData.position_group) {
          errors.position_group = 'Hierarchy is required';
        }
        break;
        
      case 'responsibilities':
        const requiredSections = ['criticalDuties', 'positionMainKpis', 'jobDuties', 'requirements'];
        requiredSections.forEach(sectionName => {
          const sectionValid = formData[sectionName] && 
            formData[sectionName].some(item => item && item.trim() !== '');
          if (!sectionValid) {
            errors[sectionName] = `At least one ${sectionName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
          }
        });
        break;
        
      case 'conditions':
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };



// Helper for case-insensitive string comparison
const matchesIgnoreCase = (str1, str2) => {
  if (!str1 || !str2) return false;
  return str1.toLowerCase().trim() === str2.toLowerCase().trim();
};

// Helper to extract ID safely
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

// 🔥 CASE-INSENSITIVE: Business Function ID
const getBusinessFunctionId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
  const employee = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.business_function_name, name)
  );
  
  if (employee) {
    const id = extractId(employee, 'business_function_id', 'business_function');
    if (id) {
      console.log(`✅ [Submit] Business Function "${name}" → ID: ${id}`);
      return id;
    }
  }

  return null;
};

// 🔥 CASE-INSENSITIVE: Department ID
const getDepartmentId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
  // Try with business function constraint first
  if (formData.business_function) {
    const employee = dropdownData.employees.find(emp => 
      matchesIgnoreCase(emp.business_function_name, formData.business_function) &&
      matchesIgnoreCase(emp.department_name, name)
    );
    
    if (employee) {
      const id = extractId(employee, 'department_id', 'department');
      if (id) {
        console.log(`✅ [Submit] Department "${name}" → ID: ${id}`);
        return id;
      }
    }
  }
  
  // Fallback: any employee with this department
  const anyMatch = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.department_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'department_id', 'department');
    if (id) {
      console.log(`✅ [Submit] Department "${name}" → ID: ${id} (any match)`);
      return id;
    }
  }
  

  return null;
};

// 🔥 CASE-INSENSITIVE: Unit ID
const getUnitId = (name) => {
  if (!name) return null;
  
  if (formData.business_function && formData.department) {
    const employee = dropdownData.employees.find(emp =>
      matchesIgnoreCase(emp.business_function_name, formData.business_function) &&
      matchesIgnoreCase(emp.department_name, formData.department) &&
      matchesIgnoreCase(emp.unit_name, name)
    );
    
    if (employee) {
      const id = extractId(employee, 'unit_id', 'unit');
      if (id) {
        console.log(`✅ [Submit] Unit "${name}" → ID: ${id}`);
        return id;
      }
    }
  }
  
  const anyMatch = dropdownData.employees?.find(emp => 
    matchesIgnoreCase(emp.unit_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'unit_id', 'unit');
    if (id) {
      console.log(`✅ [Submit] Unit "${name}" → ID: ${id} (any match)`);
      return id;
    }
  }
  
  console.warn(`⚠️ [Submit] Unit "${name}" → ID not found`);
  return null;
};

// 🔥 CASE-INSENSITIVE: Job Function ID
const getJobFunctionId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
  if (formData.business_function && formData.department) {
    const employee = dropdownData.employees.find(emp =>
      matchesIgnoreCase(emp.business_function_name, formData.business_function) &&
      matchesIgnoreCase(emp.department_name, formData.department) &&
      matchesIgnoreCase(emp.job_function_name, name)
    );
    
    if (employee) {
      const id = extractId(employee, 'job_function_id', 'job_function');
      if (id) {
        console.log(`✅ [Submit] Job Function "${name}" → ID: ${id}`);
        return id;
      }
    }
  }
  
  const anyMatch = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.job_function_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'job_function_id', 'job_function');
    if (id) {
      console.log(`✅ [Submit] Job Function "${name}" → ID: ${id} (any match)`);
      return id;
    }
  }
  
  console.warn(`⚠️ [Submit] Job Function "${name}" → ID not found`);
  return null;
};

// 🔥 CASE-INSENSITIVE: Position Group ID
const getPositionGroupId = (name) => {
  if (!name || !dropdownData.employees) return null;
  
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
        console.log(`✅ [Submit] Position Group "${name}" → ID: ${id}`);
        return id;
      }
    }
  }
  
  const anyMatch = dropdownData.employees.find(emp => 
    matchesIgnoreCase(emp.position_group_name, name)
  );
  
  if (anyMatch) {
    const id = extractId(anyMatch, 'position_group_id', 'position_group');
    if (id) {
      console.log(`✅ [Submit] Position Group "${name}" → ID: ${id} (any match)`);
      return id;
    }
  }
  

  return null;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!validateForm()) {
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.some(key => ['job_title', 'job_purpose', 'business_function', 'department', 'job_function', 'position_group'].includes(key))) {
      setActiveTab('position');
    } else if (errorKeys.some(key => ['criticalDuties', 'positionMainKpis', 'jobDuties', 'requirements'].includes(key))) {
      setActiveTab('responsibilities');
    } else {
      setActiveTab('conditions');
    }
    
    const errorMessage = Object.values(validationErrors).join('\n');
    alert('Please fix the following errors:\n\n' + errorMessage);
    return;
  }

  try {
    setIsSubmitting(true);

    // 🔥 Get IDs with case-insensitive lookup
    const businessFunctionId = getBusinessFunctionId(formData.business_function);
    const departmentId = getDepartmentId(formData.department);
    const jobFunctionId = getJobFunctionId(formData.job_function);
    const positionGroupId = getPositionGroupId(formData.position_group);
    const unitId = formData.unit ? getUnitId(formData.unit) : null;

    // 🔥 Validate all IDs
    const missingIds = [];
    if (!businessFunctionId || isNaN(businessFunctionId)) {
      missingIds.push(`Company "${formData.business_function}"`);
    }
    if (!departmentId || isNaN(departmentId)) {
      missingIds.push(`Department "${formData.department}"`);
    }
    if (!jobFunctionId || isNaN(jobFunctionId)) {
      missingIds.push(`Job Function "${formData.job_function}"`);
    }
    if (!positionGroupId || isNaN(positionGroupId)) {
      missingIds.push(`Hierarchy "${formData.position_group}"`);
    }

    if (missingIds.length > 0) {
      const errorMessage = `Cannot find valid IDs for: ${missingIds.join(', ')}.\n\n` +
        `This usually means no employees exist with these exact organizational values.`;
      
      console.error('❌ [Submit] Missing IDs:', missingIds);
      alert(errorMessage);
      return;
    }

    // Build API payload
    const apiData = {
      job_title: formData.job_title.trim(),
      job_purpose: formData.job_purpose.trim(),
      business_function: parseInt(businessFunctionId),
      department: parseInt(departmentId),
      job_function: parseInt(jobFunctionId),
      position_group: parseInt(positionGroupId),
      
      // Grading levels
      ...(formData.grading_levels && Array.isArray(formData.grading_levels) && formData.grading_levels.length > 0 && {
        grading_levels: formData.grading_levels.map(level => level.trim()).filter(Boolean)
      }),
      
      // Unit (optional)
      ...(unitId && !isNaN(unitId) && { unit: parseInt(unitId) }),
      
      sections: [],
      
      // 🔥 TECHNICAL SKILLS - FIXED
      required_skills_data: (formData.required_skills_data || [])
        .filter(skillId => skillId && String(skillId).trim() !== '')
        .map(skillId => {
          // Remove any prefix (like "skill_" or group info)
          const cleanId = String(skillId).split('_').pop();
          const numericId = parseInt(cleanId);
          
          if (isNaN(numericId)) {
            console.warn('⚠️ Invalid skill ID:', skillId);
            return null;
          }
          
          return {
            skill_id: numericId,
            proficiency_level: "INTERMEDIATE",
            is_mandatory: true
          };
        })
        .filter(Boolean), // Remove nulls
      
      // 🔥 BEHAVIORAL COMPETENCIES - FIXED (for non-leadership)
      behavioral_competencies_data: (formData.behavioral_competencies_data || [])
        .filter(compId => compId && String(compId).trim() !== '')
        .map(compId => {
          // Remove any prefix
          const cleanId = String(compId).split('_').pop();
          const numericId = parseInt(cleanId);
          
          if (isNaN(numericId)) {
            console.warn('⚠️ Invalid behavioral competency ID:', compId);
            return null;
          }
          
          return {
            competency_id: numericId,
            proficiency_level: "INTERMEDIATE",
            is_mandatory: true
          };
        })
        .filter(Boolean),
      
      // 🔥 LEADERSHIP COMPETENCIES - NEW (for leadership positions)
      leadership_competencies_data: (formData.leadership_competencies_data || [])
        .filter(itemId => itemId && String(itemId).trim() !== '')
        .map(itemId => {
          // Remove any prefix
          const cleanId = String(itemId).split('_').pop();
          const numericId = parseInt(cleanId);
          
          if (isNaN(numericId)) {
            console.warn('⚠️ Invalid leadership competency ID:', itemId);
            return null;
          }
          
          return {
            leadership_item_id: numericId,
            proficiency_level: "INTERMEDIATE",
            is_mandatory: true
          };
        })
        .filter(Boolean),
      
      ...(!editingJob && selectedEmployeeIds.length > 0 && { 
        selected_employee_ids: selectedEmployeeIds
          .map(id => parseInt(id))
          .filter(id => !isNaN(id))
      })
    };

    // 🔥 DEBUG: Log what we're sending
    console.log('📤 [Submit] Sending to API:', {
      skills_count: apiData.required_skills_data.length,
      skills: apiData.required_skills_data,
      behavioral_count: apiData.behavioral_competencies_data.length,
      behavioral: apiData.behavioral_competencies_data,
      leadership_count: apiData.leadership_competencies_data.length,
      leadership: apiData.leadership_competencies_data
    });

    // Add resources
    const resourcesPayload = buildResourcesPayload(
      formData.business_resources_ids, 
      'business_resources', 
      dropdownData
    );
    
    const accessPayload = buildResourcesPayload(
      formData.access_rights_ids, 
      'access_rights', 
      dropdownData
    );
    
    const benefitsPayload = buildResourcesPayload(
      formData.company_benefits_ids, 
      'company_benefits', 
      dropdownData
    );

    Object.assign(apiData, resourcesPayload, accessPayload, benefitsPayload);

    // Add sections
    const sectionTypes = [
      { 
        type: 'CRITICAL_DUTIES', 
        title: 'Critical Duties and Responsibilities', 
        content: formData.criticalDuties || [],
        order: 1
      },
      { 
        type: 'MAIN_KPIS', 
        title: 'Key Performance Indicators', 
        content: formData.positionMainKpis || [],
        order: 2 
      },
      { 
        type: 'JOB_DUTIES', 
        title: 'Job Duties', 
        content: formData.jobDuties || [],
        order: 3
      },
      { 
        type: 'REQUIREMENTS', 
        title: 'Requirements and Qualifications', 
        content: formData.requirements || [],
        order: 4
      }
    ];

    sectionTypes.forEach((section) => {
      if (section.content && Array.isArray(section.content) && section.content.length > 0) {
        const validContent = section.content.filter(item => item && item.trim() !== '');
        if (validContent.length > 0) {
          const formattedContent = validContent
            .map((item, index) => `${index + 1}. ${item.trim()}`)
            .join('\n');
            
          apiData.sections.push({
            section_type: section.type,
            title: section.title,
            content: formattedContent,
            order: section.order
          });
        }
      }
    });

    // Submit to API
    if (editingJob) {
      if (wasInApprovalProcess) {
        apiData.reset_approval_status = true;
      }
      
      await jobDescriptionService.updateJobDescription(editingJob.id, apiData);
      
      if (wasInApprovalProcess) {
        alert('Job description updated successfully! Approval process has been reset to DRAFT status.');
      } else {
        alert('Job description updated successfully!');
      }
      
      onUpdate();
    } else {
      const createdJob = await jobDescriptionService.createJobDescription(apiData);
      console.log('✅ [Submit] Job created successfully:', createdJob);
      onSubmit(createdJob);
    }
  } catch (error) {
    console.error('❌ [Submit] Error:', error);
    
    if (error.response?.status === 422 && error.response?.data?.requires_employee_selection) {
      const serverEmployees = error.response.data.eligible_employees || [];
      const serverCriteria = error.response.data.criteria || {};
      
      if (serverEmployees.length > 0) {
        setEligibleEmployees(serverEmployees);
        setJobCriteria(serverCriteria);
        setShowEmployeeSelectionModal(true);
        return;
      }
    }
    
    let errorMessage = 'Error saving job description: ';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage += error.response.data;
      } else if (typeof error.response.data === 'object') {
        const errorDetails = [];
        Object.keys(error.response.data).forEach(field => {
          const fieldErrors = Array.isArray(error.response.data[field]) 
            ? error.response.data[field].join(', ')
            : error.response.data[field];
          errorDetails.push(`${field}: ${fieldErrors}`);
        });
        errorMessage += errorDetails.join('\n');
      }
    } else {
      errorMessage += error.message || 'Please try again.';
    }
    
    alert(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCancel = () => {
    const hasFormData = formData.job_title?.trim() || 
                       formData.job_purpose?.trim() || 
                       formData.criticalDuties?.some(d => d?.trim()) ||
                       formData.positionMainKpis?.some(d => d?.trim()) ||
                       formData.jobDuties?.some(d => d?.trim()) ||
                       formData.requirements?.some(d => d?.trim()) ||
                       formData.required_skills_data?.length > 0 ||
                       formData.behavioral_competencies_data?.length > 0 ||
                       formData.business_resources_ids?.length > 0 ||
                       formData.access_rights_ids?.length > 0 ||
                       formData.company_benefits_ids?.length > 0;

    if (hasFormData && !editingJob) {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel? All unsaved changes will be lost.'
      );
      
      if (!confirmCancel) {
        return;
      }
    }
    
    onCancel();
  };

  const buildResourcesPayload = (selectedIds, resourceType, dropdownData) => {
    if (!selectedIds || selectedIds.length === 0) {
      return {};
    }

    let dataSource = [];
    let parentIdField = '';
    let prefix = '';
    
    if (resourceType === 'business_resources') {
      dataSource = dropdownData.businessResources || [];
      parentIdField = 'resource_id';
      prefix = 'res';
    } else if (resourceType === 'access_rights') {
      dataSource = dropdownData.accessMatrix || [];
      parentIdField = 'access_matrix_id';
      prefix = 'acc';
    } else {
      dataSource = dropdownData.companyBenefits || [];
      parentIdField = 'benefit_id';
      prefix = 'ben';
    }

    // 🔥 Parse unique IDs (format: prefix_parentId_childId or prefix_parentId)
    const parseUniqueId = (uniqueId) => {
      const str = String(uniqueId);
      const parts = str.split('_');
      
      if (parts[0] === prefix) {
        // New format: prefix_parentId_childId or prefix_parentId
        if (parts.length === 3) {
          return { parentId: parseInt(parts[1]), childId: parseInt(parts[2]) };
        } else if (parts.length === 2) {
          return { parentId: parseInt(parts[1]), childId: null };
        }
      }
      
      // Fallback: try to parse as raw number
      const rawId = parseInt(str);
      if (!isNaN(rawId)) {
        return { parentId: null, childId: null, rawId: rawId };
      }
      
      return null;
    };
    
    const parentIds = new Set();
    const childIdsByParent = {};
    const explicitlySelectedParents = new Set();
    
    selectedIds.forEach(uniqueId => {
      const parsed = parseUniqueId(uniqueId);
      if (!parsed) return;
      
      if (parsed.childId !== null) {
        // This is a child selection
        parentIds.add(parsed.parentId);
        if (!childIdsByParent[parsed.parentId]) {
          childIdsByParent[parsed.parentId] = [];
        }
        childIdsByParent[parsed.parentId].push(parsed.childId);
      } else if (parsed.parentId !== null) {
        // This is a parent selection (no children)
        parentIds.add(parsed.parentId);
        explicitlySelectedParents.add(parsed.parentId);
        if (!childIdsByParent[parsed.parentId]) {
          childIdsByParent[parsed.parentId] = [];
        }
      } else if (parsed.rawId !== null) {
        // Fallback: old format, try to find in data
        let foundAsChild = false;
        
        for (const parentItem of dataSource) {
          if (parentItem.items && Array.isArray(parentItem.items)) {
            const childItem = parentItem.items.find(item => item.id === parsed.rawId);
            if (childItem) {
              parentIds.add(parentItem.id);
              if (!childIdsByParent[parentItem.id]) {
                childIdsByParent[parentItem.id] = [];
              }
              childIdsByParent[parentItem.id].push(parsed.rawId);
              foundAsChild = true;
              break;
            }
          }
        }
        
        if (!foundAsChild) {
          const parent = dataSource.find(p => p.id === parsed.rawId);
          if (parent) {
            parentIds.add(parsed.rawId);
            explicitlySelectedParents.add(parsed.rawId);
            if (!childIdsByParent[parsed.rawId]) {
              childIdsByParent[parsed.rawId] = [];
            }
          }
        }
      }
    });

    const withItems = Array.from(parentIds).map(parentId => {
      const children = childIdsByParent[parentId] || [];
      const wasExplicitlySelected = explicitlySelectedParents.has(parentId);
      
      if (children.length > 0) {
        return {
          [parentIdField]: parentId,
          item_ids: children
        };
      } else if (wasExplicitlySelected) {
        return {
          [parentIdField]: parentId,
          item_ids: []
        };
      }
      
      return null;
    }).filter(Boolean);

    

    if (resourceType === 'business_resources') {
      return { business_resources_with_items: withItems };
    } else if (resourceType === 'access_rights') {
      return { access_rights_with_items: withItems };
    } else {
      return { company_benefits_with_items: withItems };
    }
  };



  const handleExplicitSave = async () => {
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    
    await handleSubmit(syntheticEvent);
  };

  const handleNext = () => {
    if (validateCurrentTab()) {
      goToNextTab();
    } else {
      const errorMessage = Object.values(validationErrors).join('\n');
      alert('Please fix the following errors before proceeding:\n\n' + errorMessage);
    }
  };

  const isTabCompleted = (tabId) => {
    switch (tabId) {
      case 'position':
        return formData.job_title && formData.job_purpose && formData.business_function && 
               formData.department && formData.job_function && formData.position_group;
      case 'responsibilities':
        return formData.criticalDuties?.some(item => item?.trim()) &&
               formData.positionMainKpis?.some(item => item?.trim()) &&
               formData.jobDuties?.some(item => item?.trim()) &&
               formData.requirements?.some(item => item?.trim());
      case 'conditions':
        return true;
      default:
        return false;
    }
  };

  const getSubmissionInfo = () => {
    if (editingJob) {
      if (wasInApprovalProcess) {
        return {
          title: 'Update Job Description (Approval Reset)',
          description: 'Updating this job will reset its approval status to DRAFT. It will need to be resubmitted for approval.',
          employeeCount: 0,
          type: 'edit',
          needsSelection: false,
          warning: true
        };
      }
      
      return {
        title: 'Ready to Update Job Description',
        description: 'Click "Update Job Description" to save your changes.',
        employeeCount: 0,
        type: 'edit',
        needsSelection: false
      };
    }
    
    if (!assignmentPreview) {
      return {
        title: 'Ready to Create Job Description',
        description: 'Click "Save & Continue" to create the job description.',
        employeeCount: 0,
        type: 'single'
      };
    }

    switch (assignmentPreview.strategy) {
      case 'auto_assign_single':
        const record = assignmentPreview.employees?.[0];
        const isVacancy = record?.is_vacancy || record?.record_type === 'vacancy';
        const displayName = isVacancy ? 
          `Vacant Position (${record.employee_id})` : 
          (record?.full_name || record?.name);
        
        return {
          title: isVacancy ? 'Ready to Create & Assign to Vacancy' : 'Ready to Create & Auto-Assign',
          description: `Job will be automatically assigned to ${displayName}.`,
          employeeCount: 1,
          type: isVacancy ? 'auto_vacancy' : 'auto_single',
          employee: record,
          isVacancy: isVacancy,
          needsSelection: false
        };
      
      case 'manual_selection_required':
        const selectedCount = selectedEmployeeIds.length;
        return {
          title: selectedCount > 0 
            ? `Ready to Create ${selectedCount} Job Description${selectedCount > 1 ? 's' : ''}` 
            : 'Record Selection Required',
          description: selectedCount > 0 
            ? `Will create job descriptions for ${selectedCount} selected record${selectedCount > 1 ? 's' : ''}.`
            : `${assignmentPreview.employeeCount} records match your criteria. Please review the selection.`,
          employeeCount: selectedCount,
          totalAvailable: assignmentPreview.employeeCount,
          type: 'manual_multiple',
          needsSelection: false,
          allowReview: true
        };
      
      case 'no_employees_found':
        return {
          title: 'Ready to Create Unassigned Position',
          description: 'Job will be created without assignment to any employee or vacancy.',
          employeeCount: 0,
          type: 'unassigned',
          needsSelection: false
        };
      
      default:
        return {
          title: 'Ready to Create Job Description',
          description: 'Click "Save & Continue" to create the job description.',
          employeeCount: 0,
          type: 'unknown',
          needsSelection: false
        };
    }
  };

  const submissionInfo = getSubmissionInfo();

  return (
    <>
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm`}>
        
        {/* Form Header */}
        <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary} mb-1`}>
                {editingJob ? 'Edit Job Description' : 'Create New Job Description'}
              </h2>
              <p className={`${textSecondary} text-xs`}>
                Step {getCurrentTabIndex() + 1} of {tabs.length}: {tabs[getCurrentTabIndex()]?.description}
              </p>
              {editingJob && wasInApprovalProcess && (
                <div className="mt-2 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                  <AlertCircle size={12} />
                  <span className="font-medium">
                    Warning: Editing will reset approval status to DRAFT
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className={`px-4 py-3 ${bgAccent} border-b border-gray-200 dark:border-almet-comet`}>
          <div className="flex items-center justify-between text-xs">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => handleTabChange(tab.id)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50
                    ${activeTab === tab.id ? 'bg-almet-sapphire text-white shadow-sm' : 
                      isTabCompleted(tab.id) ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' :
                      index < getCurrentTabIndex() ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600' :
                      'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {isTabCompleted(tab.id) && activeTab !== tab.id ? (
                    <CheckCircle size={14} />
                  ) : (
                    <tab.icon size={14} />
                  )}
                  <span className="font-medium">{tab.name}</span>
                </button>
                {index < tabs.length - 1 && (
                  <ArrowRight size={12} className="mx-2 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div onSubmit={(e) => e.preventDefault()}>
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'position' && (
              <PositionInformationTab
                formData={formData}
                dropdownData={dropdownData}
                selectedPositionGroup={selectedPositionGroup}
                matchingEmployees={matchingEmployees}
                validationErrors={validationErrors}
                onFormDataChange={onFormDataChange}
                onPositionGroupChange={onPositionGroupChange}
                onAssignmentPreviewUpdate={handleAssignmentPreviewUpdate}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'responsibilities' && (
              <JobResponsibilitiesTab
                formData={formData}
                selectedSkillGroup={selectedSkillGroup}
                selectedBehavioralGroup={selectedBehavioralGroup}
                availableSkills={availableSkills}
                availableCompetencies={availableCompetencies}
                dropdownData={dropdownData}
                validationErrors={validationErrors}
                onFormDataChange={onFormDataChange}
                onSkillGroupChange={onSkillGroupChange}
                onBehavioralGroupChange={onBehavioralGroupChange}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'conditions' && (
              <WorkConditionsTab
                formData={formData}
                dropdownData={dropdownData}
                onFormDataChange={onFormDataChange}
                darkMode={darkMode}
              />
            )}
          </div>

          <div className="p-4">
            {/* Last Tab Instructions */}
            {isLastTab() && !editingJob && (
              <div className="p-3 bg-almet-mystic dark:bg-almet-cloud-burst/20 border border-almet-bali-hai/30 dark:border-almet-comet rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={12} className="text-almet-sapphire flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white mb-1">
                      {submissionInfo.title}
                    </p>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                      {submissionInfo.description}
                    </p>
                  </div>
                </div>
                
                {submissionInfo.type === 'manual_multiple' && (
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => setShowEmployeeSelectionModal(true)}
                      disabled={isSubmitting}
                      className="px-2 py-1 bg-almet-sapphire hover:bg-almet-astral text-white rounded text-xs 
                        flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <Users size={10} />
                      {selectedEmployeeIds.length > 0 
                        ? `Review Selection (${selectedEmployeeIds.length}/${submissionInfo.totalAvailable})`
                        : `Select from ${submissionInfo.totalAvailable} Employees`
                      }
                    </button>
                    
                    {selectedEmployeeIds.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle size={10} className="text-green-600 flex-shrink-0" />
                        <span className="text-almet-cloud-burst dark:text-almet-bali-hai">
                          {selectedEmployeeIds.length} record{selectedEmployeeIds.length > 1 ? 's' : ''} selected
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {submissionInfo.type === 'auto_single' && submissionInfo.employee && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <UserCheck size={10} className="text-green-600 flex-shrink-0" />
                    <span className="text-almet-cloud-burst dark:text-almet-bali-hai">
                      Auto-assign: {submissionInfo.employee.full_name}
                    </span>
                  </div>
                )}

                {submissionInfo.type === 'auto_vacancy' && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <Target size={10} className="text-almet-waterloo flex-shrink-0" />
                    <span className="text-almet-cloud-burst dark:text-almet-bali-hai">
                      Creating vacant position
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {isLastTab() && editingJob && submissionInfo.warning && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mb-1">
                      {submissionInfo.title}
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      {submissionInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Navigation */}
          <div className="p-4 border-t border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-comet">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle size={12} />
                <span>All fields marked with * are required</span>
              </div>
              
              <div className="flex gap-3">
                {!isFirstTab() && (
                  <button
                    type="button"
                    onClick={goToPreviousTab}
                    disabled={isSubmitting}
                    className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm 
                      border border-gray-300 dark:border-almet-comet rounded-lg flex items-center gap-2`}
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm 
                    border border-gray-300 dark:border-almet-comet rounded-lg`}
                >
                  Cancel
                </button>

                {!isLastTab() ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || !canNavigateToNext()}
                    className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                      transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                  >
                    Next
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExplicitSave}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                      transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                  >
                    {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <Save size={14} />
                    {editingJob ? 'Update Job Description' : 'Save & Continue'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Selection Modal */}
      <EmployeeSelectionModal
        isOpen={showEmployeeSelectionModal}
        onClose={() => setShowEmployeeSelectionModal(false)}
        eligibleEmployees={eligibleEmployees}
        jobCriteria={jobCriteria}
        onEmployeeSelect={handleEmployeeSelection}
        loading={false}
        darkMode={darkMode}
        preSelectedEmployeeIds={selectedEmployeeIds}
      />
    </>
  );
};

export default JobDescriptionForm;