'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Target, Search, Eye, Edit, Trash2, 
  Download, AlertCircle, CheckCircle,
  Loader2, X, Save, User, Building,
  TrendingUp, TrendingDown, Minus, Info, Send, RotateCcw,Users 

} from 'lucide-react';
import { assessmentApi } from '@/services/assessmentApi';
import { competencyApi } from '@/services/competencyApi';
import { useToast } from '@/components/common/Toast';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import CollapsibleGroup from './CollapsibleGroup';
import CoreAssessmentCharts  from './charts/CoreAssessmentCharts';
const GapIndicator = ({ gap }) => {
  if (gap > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <TrendingUp size={12} />
        +{gap}
      </span>
    );
  } else if (gap < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <TrendingDown size={12} />
        {gap}
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Minus size={12} />
        0
      </span>
    );
  }
};

const CompletionIndicator = ({ percentage }) => {
  const numPercentage = parseFloat(percentage) || 0;
  let colorClass = 'bg-red-50 text-red-700 border-red-200';
  
  if (numPercentage >= 100) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (numPercentage >= 80) {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (numPercentage >= 60) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}>
      {numPercentage.toFixed(0)}%
    </span>
  );
};

const CoreEmployeeCalculation = () => {
  const { showSuccess, showError } = useToast();
  
  // Tab state with sessionStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('coreAssessmentTab') || 'employee';
    }
    return 'employee';
  });
  const toTitleCase = (str) => {
    if (!str) return '-';
    return str
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  // Basic states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showEditPositionModal, setShowEditPositionModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCoreScalesInfo, setShowCoreScalesInfo] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [templateError, setTemplateError] = useState(null);
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default'
  });
  const [userPermissions, setUserPermissions] = useState(null);

// ✅ Fetch permissions on mount
useEffect(() => {
  const fetchPermissions = async () => {
    try {
      const perms = await assessmentApi.employeeCore.getUserPermissions();
      setUserPermissions(perms);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  };
  fetchPermissions();
}, []);

// ✅ Helper function
const isEmployeeOnlyAccess = () => {
  return userPermissions && !userPermissions.is_admin && !userPermissions.is_manager;
};
  // Group collapse states
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedCreateGroups, setExpandedCreateGroups] = useState({});
  const [expandedEditGroups, setExpandedEditGroups] = useState({});
  
  // Data states
  const [positionAssessments, setPositionAssessments] = useState([]);
  const [employeeAssessments, setEmployeeAssessments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [coreScales, setCoreScales] = useState([]);
  const [skillGroups, setSkillGroups] = useState([]);
  const [uniqueJobTitles, setUniqueJobTitles] = useState([]);
  
  // Form states
  const [positionFormData, setPositionFormData] = useState({
    position_group: '',
    job_title: '',
    competency_ratings: []
  });

  const [editPositionFormData, setEditPositionFormData] = useState({
    id: '',
    position_group: '',
    job_title: '',
    competency_ratings: []
  });
  
  const [employeeFormData, setEmployeeFormData] = useState({
    employee: '',
    position_assessment: '',
    notes: '',
    competency_ratings: []
  });

  const [editFormData, setEditFormData] = useState({
    employee: '',
    position_assessment: '',
    notes: '',
    competency_ratings: []
  });

  // Position-Job Title Relationship States
  const [filteredJobTitles, setFilteredJobTitles] = useState([]);
  const [editFilteredJobTitles, setEditFilteredJobTitles] = useState([]);

  // Save tab state to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('coreAssessmentTab', activeTab);
    }
  }, [activeTab]);

  // Helper function to filter job titles based on position group
  const getJobTitlesForPositionGroup = (positionGroupId) => {
  if (!positionGroupId) return uniqueJobTitles;
  
  // ✅ Filter employees by position group
  const employeesInGroup = employees.filter(emp => emp.position_group_level === positionGroupId);
  
  // ✅ Get unique job titles and sort
  const jobTitlesInGroup = [...new Set(employeesInGroup.map(emp => emp.job_title).filter(Boolean))]
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'az')); // ✅ Düzgün sort
  
  // ✅ Map to dropdown format with title case
  return jobTitlesInGroup.map((title, index) => ({ 
    value: title,
    name: toTitleCase(title),
    uniqueId: `${positionGroupId}-${title}-${index}`
  }));
};

  // Update filtered job titles when position group changes in create modal
  useEffect(() => {
    const filtered = getJobTitlesForPositionGroup(positionFormData.position_group);
    setFilteredJobTitles(filtered);
    
    if (positionFormData.job_title && !filtered.find(jt => jt.value === positionFormData.job_title)) {
      setPositionFormData(prev => ({ ...prev, job_title: '' }));
    }
  }, [positionFormData.position_group, employees, uniqueJobTitles]);

  // Update filtered job titles when position group changes in edit modal
  useEffect(() => {
    const filtered = getJobTitlesForPositionGroup(editPositionFormData.position_group);
    setEditFilteredJobTitles(filtered);
    
    if (editPositionFormData.job_title && !filtered.find(jt => jt.value === editPositionFormData.job_title)) {
      setEditPositionFormData(prev => ({ ...prev, job_title: '' }));
    }
  }, [editPositionFormData.position_group, employees, uniqueJobTitles]);

  // Data fetching
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [
        positionAssessmentsRes, 
        employeeAssessmentsRes, 
        employeesRes, 
        positionGroupsRes,
        coreScalesRes,
        skillGroupsRes
      ] = await Promise.all([
        assessmentApi.positionCore.getAll(),
        assessmentApi.employeeCore.getAll(),
        assessmentApi.employees.getAll(),
        assessmentApi.positionGroups.getAll(),
        assessmentApi.coreScales.getAll(),
        competencyApi.skillGroups.getAll()
      ]);
      
      setPositionAssessments(positionAssessmentsRes.results || []);
      setEmployeeAssessments(employeeAssessmentsRes.results || []);
      const employeesList = employeesRes.results || [];
      setEmployees(employeesList);
      setPositionGroups(positionGroupsRes.results || []);
      setCoreScales(coreScalesRes.results || []);
      
      // Extract unique job titles from employees
      const jobTitles = [...new Set(employeesList.map(emp => emp.job_title).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'az')); // ✅ Azərbaycan əlifbası ilə sort

setUniqueJobTitles(jobTitles.map(title => ({ 
  name: toTitleCase(title), 
  value: title 
})));
      
      const skillGroupsList = skillGroupsRes.results || [];
      const skillGroupsDetails = await Promise.all(
        skillGroupsList.map(group => competencyApi.skillGroups.getById(group.id))
      );
      setSkillGroups(skillGroupsDetails);

      // Initialize all groups as expanded by default
      const groupsExpanded = {};
      skillGroupsDetails.forEach(group => {
        groupsExpanded[group.id] = true;
      });
      setExpandedGroups(groupsExpanded);
      setExpandedCreateGroups(groupsExpanded);
      setExpandedEditGroups(groupsExpanded);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      showError('Failed to load assessment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Position Group change handler for create modal
  const handlePositionGroupChange = (positionGroupId) => {
    setPositionFormData(prev => ({
      ...prev,
      position_group: positionGroupId,
      job_title: ''
    }));
  };

  // Position Group change handler for edit modal
  const handleEditPositionGroupChange = (positionGroupId) => {
    setEditPositionFormData(prev => ({
      ...prev,
      position_group: positionGroupId,
      job_title: ''
    }));
  };

  // Employee selection handler
  // ✅ DÜZGÜN VERSİYA
const handleEmployeeChange = async (employeeId) => {
  setTemplateError(null);
  const selectedEmployee = employees.find(e => e.id === employeeId);
  
  if (!selectedEmployee) {
    console.error('Employee not found:', employeeId);
    return;
  }

  console.log('Selected employee:', selectedEmployee); // ✅ Debug log
  setSelectedEmployeeInfo(selectedEmployee);
  
  // ✅ ƏVVƏLCƏ API-dən template yoxla
  setEmployeeFormData(prev => ({ ...prev, employee: employeeId }));
  
  try {
    console.log('Fetching template for employee:', employeeId); // ✅ Debug log
    
    const response = await assessmentApi.positionCore.getForEmployee(employeeId);
    
    console.log('API Response:', response); // ✅ Debug log
    
    if (response.assessment_template) {
      // ✅ SONRA duplicate yoxla
      const existingAssessment = employeeAssessments.find(
        assessment => assessment.employee === employeeId
      );
      
      if (existingAssessment) {
        setTemplateError({
          type: 'duplicate',
          message: `${selectedEmployee.name} already has a core assessment. Each employee can only have one assessment.`,
          employee: selectedEmployee
        });
        setEmployeeFormData(prev => ({ 
          ...prev, 
          employee: employeeId, 
          position_assessment: '',
          competency_ratings: []
        }));
        return;
      }

      // ✅ Template var və duplicate yoxdur - davam et
      setEmployeeFormData(prev => ({
        ...prev, 
        employee: employeeId,
        position_assessment: response.assessment_template.id,
        competency_ratings: response.assessment_template.competency_ratings?.map(rating => ({
          skill_id: rating.skill,
          actual_level: 0,
          notes: ''
        })) || []
      }));
      setTemplateError(null);
    }
  } catch (err) {
    console.error('Error fetching employee position template:', err);
    console.error('Error response:', err.response?.data); // ✅ Debug log
    
    if (err.response?.data?.error) {
      setTemplateError({
        type: 'no_template',
        message: err.response.data.error,
        employee: selectedEmployee
      });
    } else {
      setTemplateError({
        type: 'api_error',
        message: 'Failed to load position template for this employee',
        employee: selectedEmployee,
        details: err.message // ✅ Əlavə detail
      });
    }
    
    setEmployeeFormData(prev => ({
      ...prev, 
      employee: employeeId,
      position_assessment: '',
      competency_ratings: []
    }));
  }
};

  // Show confirmation modal
  const showConfirmation = (title, message, onConfirm, type = 'default') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      type
    });
  };

  // Handle edit position assessment
  const handleEditPositionAssessment = async (assessment) => {
    try {
      const detailedAssessment = await assessmentApi.positionCore.getById(assessment.id);
      
      setEditPositionFormData({
        id: assessment.id,
        position_group: assessment.position_group,
        job_title: assessment.job_title,
        competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
          skill_id: rating.skill,
          required_level: rating.required_level
        })) || []
      });
      
      setShowEditPositionModal(true);
    } catch (err) {
      console.error('Error loading position assessment for edit:', err);
      showError('Failed to load assessment details');
    }
  };

  // Handle edit employee assessment
  const handleEditAssessment = async (assessment) => {
    try {
      const detailedAssessment = await assessmentApi.employeeCore.getById(assessment.id);
      
      const employeeInfo = employees.find(e => e.id === detailedAssessment.employee);
      setSelectedEmployeeInfo(employeeInfo);
      
      setEditFormData({
        id: assessment.id,
        employee: detailedAssessment.employee,
        position_assessment: detailedAssessment.position_assessment,
        notes: detailedAssessment.notes || '',
        competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
          skill_id: rating.skill,
          actual_level: rating.actual_level || 0,
          notes: rating.notes || ''
        })) || []
      });
      
      setShowEditEmployeeModal(true);
    } catch (err) {
      console.error('Error loading assessment for edit:', err);
      showError('Failed to load assessment for editing');
    }
  };

  // Handle position assessment creation
  const handleCreatePositionAssessment = async () => {
    if (!positionFormData.position_group || !positionFormData.job_title) {
      showError('Please fill all required fields');
      return;
    }

    if (positionFormData.competency_ratings.length === 0) {
      showError('Please rate at least one competency');
      return;
    }

    setIsSubmitting(true);
    try {
      await assessmentApi.positionCore.create(positionFormData);
      setShowCreatePositionModal(false);
      setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
      showSuccess('Position assessment template created successfully');
      // Refresh data immediately without full reload
      await fetchData();
    } catch (err) {
      console.error('Error creating position assessment:', err);
      showError('Failed to create position assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle position assessment update
  const handleUpdatePositionAssessment = async () => {
    if (!editPositionFormData.position_group || !editPositionFormData.job_title) {
      showError('Please fill all required fields');
      return;
    }

    if (editPositionFormData.competency_ratings.length === 0) {
      showError('Please rate at least one competency');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        position_group: editPositionFormData.position_group,
        job_title: editPositionFormData.job_title,
        competency_ratings: editPositionFormData.competency_ratings
      };
      
      await assessmentApi.positionCore.update(editPositionFormData.id, updateData);
      setShowEditPositionModal(false);
      setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
      showSuccess('Position assessment template updated successfully');
      await fetchData();
    } catch (err) {
      console.error('Error updating position assessment:', err);
      showError('Failed to update position assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle employee assessment creation
  const handleCreateEmployeeAssessment = async (isDraft = true) => {
    if (!employeeFormData.employee || !employeeFormData.position_assessment) {
      showError('Please select employee and ensure position template is loaded');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...employeeFormData,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      await assessmentApi.employeeCore.create(data);
      setShowCreateEmployeeModal(false);
      setEmployeeFormData({
        employee: '',
        position_assessment: '',
        notes: '',
        competency_ratings: []
      });
      setTemplateError(null);
      setSelectedEmployeeInfo(null);
      showSuccess(isDraft ? 'Employee assessment saved as draft' : 'Employee assessment submitted successfully');
      await fetchData();
    } catch (err) {
      console.error('Error creating employee assessment:', err);
      showError('Failed to create employee assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle employee assessment update
  const handleUpdateEmployeeAssessment = async (isDraft = true) => {
    if (!editFormData.id) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...editFormData,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      await assessmentApi.employeeCore.update(editFormData.id, data);
      setShowEditEmployeeModal(false);
      setEditFormData({
        employee: '',
        position_assessment: '',
        notes: '',
        competency_ratings: []
      });
      setSelectedEmployeeInfo(null);
      showSuccess(isDraft ? 'Assessment updated successfully' : 'Assessment submitted successfully');
      await fetchData();
    } catch (err) {
      console.error('Error updating employee assessment:', err);
      showError('Failed to update assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Other action handlers
  const handleSubmitAssessment = (id) => {
    showConfirmation(
      'Submit Assessment',
      'Are you sure you want to submit this assessment? It will be finalized and cannot be edited.',
      async () => {
        try {
          await assessmentApi.employeeCore.submit(id, {});
          showSuccess('Assessment submitted successfully');
          await fetchData();
        } catch (err) {
          console.error('Submit error:', err);
          showError('Failed to submit assessment');
        }
      },
      'warning'
    );
  };

  const handleReopenAssessment = (id) => {
    showConfirmation(
      'Reopen Assessment',
      'Are you sure you want to reopen this assessment for editing?',
      async () => {
        try {
          await assessmentApi.employeeCore.reopen(id, {});
          showSuccess('Assessment reopened for editing');
          await fetchData();
        } catch (err) {
          console.error('Reopen error:', err);
          showError('Failed to reopen assessment');
        }
      },
      'info'
    );
  };

  const handleExport = async (id, type) => {
    try {
      if (type === 'employee') {
        await assessmentApi.employeeCore.exportDocument(id);
        showSuccess('Assessment exported successfully');
      }
    } catch (err) {
      console.error('Export error:', err);
      showError('Failed to export assessment');
    }
  };

  const handleDelete = (id, type) => {
    showConfirmation(
      'Delete Assessment',
      'Are you sure you want to delete this assessment? This action cannot be undone.',
      async () => {
        try {
          if (type === 'position') {
            await assessmentApi.positionCore.delete(id);
          } else {
            await assessmentApi.employeeCore.delete(id);
          }
          showSuccess('Assessment deleted successfully');
          await fetchData();
        } catch (err) {
          console.error('Delete error:', err);
          showError('Failed to delete assessment');
        }
      },
      'danger'
    );
  };

  // Data filtering
  const filteredPositionAssessments = positionAssessments.filter(assessment => 
    assessment.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.position_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeAssessments = employeeAssessments.filter(assessment => 
    (assessment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assessment.position_assessment_title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === '' || assessment.status === selectedStatus)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-almet-sapphire" />
        <p className="text-gray-600 text-sm">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
            {!isEmployeeOnlyAccess() && (
  <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
    <div className="flex gap-1">
      <button
        onClick={() => setActiveTab('position')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'position'
            ? 'bg-almet-sapphire text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Building size={16} />
        <span>Position Templates</span>
      </button>
      
      <button
        onClick={() => setActiveTab('employee')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'employee'
            ? 'bg-almet-sapphire text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Users size={16} />
        <span>Employee Assessments</span>
      </button>
    </div>
  </div>
)}

{/* ✅ 5. Update Filters section (around line 585) */}
<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
    <div className="flex flex-col sm:flex-row gap-2 flex-1">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder={isEmployeeOnlyAccess() ? "Search my assessments..." : `Search ${activeTab === 'position' ? 'positions' : 'employees'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border outline-0 border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
        />
      </div>
      
      {!isEmployeeOnlyAccess() && activeTab === 'employee' && (
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none min-w-[140px]"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="COMPLETED">Completed</option>
        </select>
      )}
    </div>
    
    {!isEmployeeOnlyAccess() && (
      <ActionButton
        onClick={() => activeTab === 'position' ? setShowCreatePositionModal(true) : setShowCreateEmployeeModal(true)}
        icon={Plus}
        label={`New ${activeTab === 'position' ? 'Template' : 'Assessment'}`}
        variant="primary"
        size="md"
      />
    )}
  </div>
</div>

      {/* Main Content */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  {!isEmployeeOnlyAccess() && activeTab === 'position' ? (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Hierarchy</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Job Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Skills</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredPositionAssessments.length > 0 ? (
            filteredPositionAssessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{assessment.position_group_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{toTitleCase(assessment.job_title)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{assessment.competency_ratings?.length || 0} skills</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <ActionButton
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowViewModal(true);
                      }}
                      icon={Eye}
                      label=""
                      variant="outline"
                      size="xs"
                    />
                    <ActionButton
                      onClick={() => handleEditPositionAssessment(assessment)}
                      icon={Edit}
                      label=""
                      variant="info"
                      size="xs"
                    />
                    <ActionButton
                      onClick={() => handleDelete(assessment.id, 'position')}
                      icon={Trash2}
                      label=""
                      variant="danger"
                      size="xs"
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-12">
                <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">No position templates found</p>
                <p className="text-gray-400 text-xs mt-1">Create your first position assessment template</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {!isEmployeeOnlyAccess() && (
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Employee</th>
            )}
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Job Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Gap Score</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Progress</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredEmployeeAssessments.length > 0 ? (
            filteredEmployeeAssessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                {!isEmployeeOnlyAccess() && (
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{assessment.employee_name}</div>
                    <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-gray-700">{toTitleCase(assessment.position_assessment_title)}</td>
                <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                <td className="px-4 py-3"><GapIndicator gap={assessment.gap_score || 0} /></td>
                <td className="px-4 py-3"><CompletionIndicator percentage={assessment.completion_percentage} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    <ActionButton
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowViewModal(true);
                      }}
                      icon={Eye}
                      label=""
                      variant="outline"
                      size="xs"
                    />
                    
                    {!isEmployeeOnlyAccess() && (
                      <>
                        {assessment.status === 'DRAFT' && (
                          <>
                            <ActionButton
                              onClick={() => handleEditAssessment(assessment)}
                              icon={Edit}
                              label=""
                              variant="info"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleSubmitAssessment(assessment.id)}
                              icon={Send}
                              label=""
                              variant="success"
                              size="xs"
                            />
                          </>
                        )}
                        {assessment.status === 'COMPLETED' && (
                          <ActionButton
                            onClick={() => handleReopenAssessment(assessment.id)}
                            icon={RotateCcw}
                            label=""
                            variant="warning"
                            size="xs"
                          />
                        )}
                        <ActionButton
                          onClick={() => handleExport(assessment.id, 'employee')}
                          icon={Download}
                          label=""
                          variant="secondary"
                          size="xs"
                        />
                        <ActionButton
                          onClick={() => handleDelete(assessment.id, 'employee')}
                          icon={Trash2}
                          label=""
                          variant="danger"
                          size="xs"
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isEmployeeOnlyAccess() ? "6" : "7"} className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">
                  {isEmployeeOnlyAccess() ? "No assessments found" : "No employee assessments found"}
                </p>
                {!isEmployeeOnlyAccess() && (
                  <p className="text-gray-400 text-xs mt-1">Create your first employee assessment</p>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* Create Position Assessment Modal */}
      {showCreatePositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-almet-sapphire" />
                Create Position Template
              </h3>
              <button
                onClick={() => {
                  setShowCreatePositionModal(false);
                  setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                   Hierarchy  <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={positionGroups.map(group => ({
                      value: group.id,
                      label: group.name
                    }))}
                     portal={true}
                  zIndex="z-[60]"
                    value={positionFormData.position_group}
                    onChange={handlePositionGroupChange}
                    placeholder="Select Hierarchy"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={filteredJobTitles.map(title => ({
                      value: title.value,
                      label: toTitleCase(title.name)
                    }))}
                     portal={true}
                  zIndex="z-[60]"
                    value={positionFormData.job_title}
                    onChange={(value) => setPositionFormData({...positionFormData, job_title: value})}
                    placeholder={positionFormData.position_group ? "Select or type job title" : "Select Hierarchy first"}
                    disabled={!positionFormData.position_group}
                  />
                </div>
              </div>

              {/* Core Scales Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Assessment Scales</h4>
                  <ActionButton
                    onClick={() => setShowCoreScalesInfo(!showCoreScalesInfo)}
                    icon={Info}
                    label={showCoreScalesInfo ? "Hide" : "Show"}
                    variant="info"
                    size="sm"
                  />
                </div>
                
                {showCoreScalesInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {coreScales.map(scale => (
                        <div key={scale.id} className="bg-white p-2 rounded-md border border-blue-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-almet-sapphire text-white px-1.5 py-0.5 rounded text-xs font-medium">
                              {scale.scale}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{scale.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Assessment Matrix */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Required Skill Levels</h4>
                
                {skillGroups.length > 0 ? (
                  skillGroups.map(group => (
                    <CollapsibleGroup
                      key={group.id}
                      title={group.name}
                      isOpen={expandedCreateGroups[group.id] || false}
                      onToggle={() => setExpandedCreateGroups(prev => ({
                        ...prev,
                        [group.id]: !prev[group.id]
                      }))}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-32">Required Level</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {group.skills && group.skills.length > 0 ? (
                              group.skills.map(skill => (
                                <tr key={skill.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2">
                                    <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                                    {skill.description && (
                                      <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <select
                                      value={positionFormData.competency_ratings.find(r => r.skill_id === skill.id)?.required_level || ''}
                                      onChange={(e) => {
                                        const newRatings = [...positionFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(r => r.skill_id === skill.id);
                                        
                                        if (existingIndex >= 0) {
                                          if (e.target.value) {
                                            newRatings[existingIndex].required_level = parseInt(e.target.value);
                                          } else {
                                            newRatings.splice(existingIndex, 1);
                                          }
                                        } else if (e.target.value) {
                                          newRatings.push({
                                            skill_id: skill.id,
                                            required_level: parseInt(e.target.value)
                                          });
                                        }
                                        
                                        setPositionFormData({...positionFormData, competency_ratings: newRatings});
                                      }}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                    >
                                      <option value="">-</option>
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="2" className="px-3 py-4 text-center text-sm text-gray-500">
                                  No skills found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CollapsibleGroup>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No skill groups found</p>
                  </div>
                )}
              </div>
              
              {/* Rating Summary */}
              {positionFormData.competency_ratings.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    ✓ {positionFormData.competency_ratings.length} skills rated
                  </p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton
                onClick={() => {
                  setShowCreatePositionModal(false);
                  setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={handleCreatePositionAssessment}
                icon={Save}
                label="Create Template"
                disabled={!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0}
                loading={isSubmitting}
                variant="primary"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Assessment Modal */}
      {showEditPositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-almet-sapphire" />
                Edit Position Template
              </h3>
              <button
                onClick={() => {
                  setShowEditPositionModal(false);
                  setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                   Hierarchy  <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={positionGroups.map(group => ({
                      value: group.id,
                      label: group.name
                    }))}
                     portal={true}
                  zIndex="z-[60]"
                    value={editPositionFormData.position_group}
                    onChange={handleEditPositionGroupChange}
                    placeholder="Select Hierarchy"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={editFilteredJobTitles.map(title => ({
                      value: title.value,
                      label: toTitleCase(title.name)
                    }))}
                     portal={true}
                  zIndex="z-[60]"
                    value={editPositionFormData.job_title}
                    onChange={(value) => setEditPositionFormData({...editPositionFormData, job_title: value})}
                    placeholder={editPositionFormData.position_group ? "Select or type job title" : "Select Hierarchy first"}
                    disabled={!editPositionFormData.position_group}
                  />
                </div>
              </div>

              {/* Core Scales Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Assessment Scales</h4>
                  <ActionButton
                    onClick={() => setShowCoreScalesInfo(!showCoreScalesInfo)}
                    icon={Info}
                    label={showCoreScalesInfo ? "Hide" : "Show"}
                    variant="info"
                    size="sm"
                  />
                </div>
                
                {showCoreScalesInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {coreScales.map(scale => (
                        <div key={scale.id} className="bg-white p-2 rounded-md border border-blue-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-almet-sapphire text-white px-1.5 py-0.5 rounded text-xs font-medium">
                              {scale.scale}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{scale.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Assessment Matrix */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Update Required Skill Levels</h4>
                
                {skillGroups.length > 0 ? (
                  skillGroups.map(group => (
                    <CollapsibleGroup
                      key={group.id}
                      title={group.name}
                      isOpen={expandedEditGroups[group.id] || false}
                      onToggle={() => setExpandedEditGroups(prev => ({
                        ...prev,
                        [group.id]: !prev[group.id]
                      }))}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-32">Required Level</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {group.skills && group.skills.length > 0 ? (
                              group.skills.map(skill => (
                                <tr key={skill.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2">
                                    <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                                    {skill.description && (
                                      <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <select
                                      value={editPositionFormData.competency_ratings.find(r => r.skill_id === skill.id)?.required_level || ''}
                                      onChange={(e) => {
                                        const newRatings = [...editPositionFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(r => r.skill_id === skill.id);
                                        
                                        if (existingIndex >= 0) {
                                          if (e.target.value) {
                                            newRatings[existingIndex].required_level = parseInt(e.target.value);
                                          } else {
                                            newRatings.splice(existingIndex, 1);
                                          }
                                        } else if (e.target.value) {
                                          newRatings.push({
                                            skill_id: skill.id,
                                            required_level: parseInt(e.target.value)
                                          });
                                        }
                                        
                                        setEditPositionFormData({...editPositionFormData, competency_ratings: newRatings});
                                      }}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                    >
                                      <option value="">-</option>
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="2" className="px-3 py-4 text-center text-sm text-gray-500">
                                  No skills found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CollapsibleGroup>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No skill groups found</p>
                  </div>
                )}
              </div>
              
              {/* Rating Summary */}
              {editPositionFormData.competency_ratings.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    ✓ {editPositionFormData.competency_ratings.length} skills rated
                  </p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton
                onClick={() => {
                  setShowEditPositionModal(false);
                  setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={handleUpdatePositionAssessment}
                icon={Save}
                label="Update Template"
                disabled={!editPositionFormData.position_group || !editPositionFormData.job_title || editPositionFormData.competency_ratings.length === 0}
                loading={isSubmitting}
                variant="primary"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Assessment Modal */}
      {showCreateEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-almet-sapphire" />
                Create Employee Assessment
              </h3>
              <button
                onClick={() => {
                  setShowCreateEmployeeModal(false);
                  setEmployeeFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                  setTemplateError(null);
                  setSelectedEmployeeInfo(null);
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Employee Selection */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={employees.map(emp => ({
                      value: emp.id,
                      label: emp.name
                    }))}
                    value={employeeFormData.employee}
                    onChange={handleEmployeeChange}
                    placeholder="Select Employee"
                      portal={true}
                  zIndex="z-[60]"
                  />
                </div>

                {/* Employee Info Display */}
                {selectedEmployeeInfo && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-xs font-medium text-blue-700">Employee:</span>
                        <p className="text-sm text-blue-900">{selectedEmployeeInfo.name}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-700">Job Title:</span>
                        <p className="text-sm text-blue-900">{toTitleCase(selectedEmployeeInfo.job_title)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-700">Hierarchy:</span>
                        <p className="text-sm text-blue-900">{selectedEmployeeInfo.position_group_name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Template Error Display */}
                {templateError && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    templateError.type === 'duplicate' 
                      ? 'bg-amber-50 border-amber-300' 
                      : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        templateError.type === 'duplicate' 
                          ? 'text-amber-600' 
                          : 'text-red-600'
                      }`} />
                      <div>
                        <h4 className={`font-medium text-sm ${
                          templateError.type === 'duplicate' 
                            ? 'text-amber-800' 
                            : 'text-red-800'
                        }`}>
                          {templateError.type === 'duplicate' 
                            ? 'Duplicate Assessment' 
                            : 'Template Not Found'}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          templateError.type === 'duplicate' 
                            ? 'text-amber-700' 
                            : 'text-red-700'
                        }`}>
                          {templateError.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Core Scales Info for Employee Assessment */}
              {employeeFormData.position_assessment && !templateError && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Assessment Scales</h4>
                    <ActionButton
                      onClick={() => setShowCoreScalesInfo(!showCoreScalesInfo)}
                      icon={Info}
                      label={showCoreScalesInfo ? "Hide" : "Show"}
                      variant="info"
                      size="sm"
                    />
                  </div>
                  
                  {showCoreScalesInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {coreScales.map(scale => (
                          <div key={scale.id} className="bg-white p-2 rounded-md border border-blue-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="bg-almet-sapphire text-white px-1.5 py-0.5 rounded text-xs font-medium">
                                {scale.scale}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{scale.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assessment Matrix Table */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Employee Assessment Matrix</h4>
                  
                  {(() => {
                    const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                    if (!selectedPosition) return null;

                    const groupedCompetencies = {};
                    selectedPosition.competency_ratings?.forEach(rating => {
                      const groupName = rating.skill_group_name || 'Other';
                      if (!groupedCompetencies[groupName]) {
                        groupedCompetencies[groupName] = [];
                      }
                      groupedCompetencies[groupName].push(rating);
                    });

                    return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                      <CollapsibleGroup
                        key={groupName}
                        title={groupName}
                        isOpen={expandedGroups[groupName] !== false}
                        onToggle={() => setExpandedGroups(prev => ({
                          ...prev,
                          [groupName]: prev[groupName] === false
                        }))}
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {competencies.map(competency => {
                                const employeeRating = employeeFormData.competency_ratings.find(
                                  r => r.skill_id === competency.skill
                                );
                                
                                const actualLevel = employeeRating?.actual_level || 0;
                                const gap = actualLevel - competency.required_level;
                                
                                return (
                                  <tr key={competency.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-900">{competency.skill_name}</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                        {competency.required_level}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <select
                                        value={actualLevel}
                                        onChange={(e) => {
                                          const newRatings = [...employeeFormData.competency_ratings];
                                          const existingIndex = newRatings.findIndex(
                                            r => r.skill_id === competency.skill
                                          );
                                          
                                          if (existingIndex >= 0) {
                                            newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                          } else {
                                            newRatings.push({
                                              skill_id: competency.skill,
                                              actual_level: parseInt(e.target.value),
                                              notes: ''
                                            });
                                          }
                                          
                                          setEmployeeFormData({
                                            ...employeeFormData, 
                                            competency_ratings: newRatings
                                          });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                      >
                                        <option value={0}>-</option>
                                        {coreScales.map(scale => (
                                          <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <GapIndicator gap={gap} />
                                    </td>
                                    <td className="px-3 py-2">
                                      <textarea
                                        value={employeeRating?.notes || ''}
                                        onChange={(e) => {
                                          const newRatings = [...employeeFormData.competency_ratings];
                                          const existingIndex = newRatings.findIndex(
                                            r => r.skill_id === competency.skill
                                          );
                                          
                                          if (existingIndex >= 0) {
                                            newRatings[existingIndex].notes = e.target.value;
                                          } else {
                                            newRatings.push({
                                              skill_id: competency.skill,
                                              actual_level: 0,
                                              notes: e.target.value
                                            });
                                          }
                                          
                                          setEmployeeFormData({
                                            ...employeeFormData, 
                                            competency_ratings: newRatings
                                          });
                                        }}
                                        placeholder="Add notes..."
                                        rows="2"
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CollapsibleGroup>
                    ));
                  })()}
                </div>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton
                onClick={() => {
                  setShowCreateEmployeeModal(false);
                  setEmployeeFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                  setTemplateError(null);
                  setSelectedEmployeeInfo(null);
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              {employeeFormData.position_assessment && !templateError && (
                <>
                  <ActionButton
                    onClick={() => handleCreateEmployeeAssessment(true)}
                    icon={Save}
                    label="Save as Draft"
                    disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                    loading={isSubmitting}
                    variant="secondary"
                    size="md"
                  />
                  <ActionButton
                    onClick={() => handleCreateEmployeeAssessment(false)}
                    icon={CheckCircle}
                    label="Save & Submit"
                    disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                    loading={isSubmitting}
                    variant="success"
                    size="md"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Assessment Modal */}
      {showEditEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-almet-sapphire" />
                Edit Employee Assessment
              </h3>
              <button
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                  setSelectedEmployeeInfo(null);
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Employee Info Display */}
              {selectedEmployeeInfo && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs font-medium text-blue-700">Employee:</span>
                      <p className="text-sm text-blue-900">{selectedEmployeeInfo.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">Job Title:</span>
                      <p className="text-sm text-blue-900">{toTitleCase(selectedEmployeeInfo.job_title)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">Hierarchy:</span>
                      <p className="text-sm text-blue-900">{selectedEmployeeInfo.position_group_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Matrix Table */}
              {editFormData.position_assessment && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Update Assessment</h4>
                  
                  {(() => {
                    const selectedPosition = positionAssessments.find(p => p.id === editFormData.position_assessment);
                    if (!selectedPosition) return null;

                    const groupedCompetencies = {};
                    selectedPosition.competency_ratings?.forEach(rating => {
                      const groupName = rating.skill_group_name || 'Other';
                      if (!groupedCompetencies[groupName]) {
                        groupedCompetencies[groupName] = [];
                      }
                      groupedCompetencies[groupName].push(rating);
                    });

                    return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                      <CollapsibleGroup
                        key={groupName}
                        title={groupName}
                        isOpen={expandedGroups[groupName] !== false}
                        onToggle={() => setExpandedGroups(prev => ({
                          ...prev,
                          [groupName]: prev[groupName] === false
                        }))}
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {competencies.map(competency => {
                                const employeeRating = editFormData.competency_ratings.find(
                                  r => r.skill_id === competency.skill
                                );
                                
                                const actualLevel = employeeRating?.actual_level || 0;
                                const gap = actualLevel - competency.required_level;
                                
                                return (
                                  <tr key={competency.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-900">{competency.skill_name}</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                        {competency.required_level}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <select
                                        value={actualLevel}
                                        onChange={(e) => {
                                          const newRatings = [...editFormData.competency_ratings];
                                          const existingIndex = newRatings.findIndex(
                                            r => r.skill_id === competency.skill
                                          );
                                          
                                          if (existingIndex >= 0) {
                                            newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                          } else {
                                            newRatings.push({
                                              skill_id: competency.skill,
                                              actual_level: parseInt(e.target.value),
                                              notes: ''
                                            });
                                          }
                                          
                                          setEditFormData({
                                            ...editFormData, 
                                            competency_ratings: newRatings
                                          });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                      >
                                        <option value={0}>-</option>
                                        {coreScales.map(scale => (
                                          <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <GapIndicator gap={gap} />
                                    </td>
                                    <td className="px-3 py-2">
                                      <textarea
                                        value={employeeRating?.notes || ''}
                                        onChange={(e) => {
                                          const newRatings = [...editFormData.competency_ratings];
                                          const existingIndex = newRatings.findIndex(
                                            r => r.skill_id === competency.skill
                                          );
                                          
                                          if (existingIndex >= 0) {
                                            newRatings[existingIndex].notes = e.target.value;
                                          } else {
                                            newRatings.push({
                                              skill_id: competency.skill,
                                              actual_level: 0,
                                              notes: e.target.value
                                            });
                                          }
                                          
                                          setEditFormData({
                                            ...editFormData, 
                                            competency_ratings: newRatings
                                          });
                                        }}
                                        placeholder="Add notes..."
                                        rows="2"
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CollapsibleGroup>
                    ));
                  })()}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                  setSelectedEmployeeInfo(null);
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={() => handleUpdateEmployeeAssessment(true)}
                icon={Save}
                label="Update Draft"
                disabled={!editFormData.id}
                loading={isSubmitting}
                variant="secondary"
                size="md"
              />
              <ActionButton
                onClick={() => handleUpdateEmployeeAssessment(false)}
                icon={CheckCircle}
                label="Update & Submit"
                disabled={!editFormData.id}
                loading={isSubmitting}
                variant="success"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* View Assessment Modal */}
      {showViewModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-almet-sapphire" />
                {activeTab === 'position' ? 'Position Template Details' : 'Assessment Details'}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssessment(null);
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {activeTab === 'position' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hierarchy</label>
                      <p className="text-sm font-medium text-gray-900">{selectedAssessment.position_group_name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
                      <p className="text-sm font-medium text-gray-900">{toTitleCase(selectedAssessment.job_title)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Created By</label>
                      <p className="text-sm text-gray-700">{selectedAssessment.created_by_name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Created Date</label>
                      <p className="text-sm text-gray-700">{new Date(selectedAssessment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900">Required Skill Levels</h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill Group</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedAssessment.competency_ratings?.length > 0 ? (
                            selectedAssessment.competency_ratings.map((rating, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm text-gray-600">{rating.skill_group_name}</td>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.skill_name}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                    {rating.required_level}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-3 py-6 text-center text-sm text-gray-500">
                                No skills defined
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                 

                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs font-medium text-gray-600">Employee</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{selectedAssessment.employee_name}</div>
                <div className="text-xs text-gray-500">ID: {selectedAssessment.employee_id}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600">Job Title</div>
                <div className="text-sm text-gray-700 mt-1">{toTitleCase(selectedAssessment.position_assessment_title)}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600">Status</div>
                <div className="mt-1"><StatusBadge status={selectedAssessment.status} /></div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600">Gap Score</div>
                <div className="mt-1"><GapIndicator gap={selectedAssessment.gap_score || 0} /></div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600">Progress</div>
                <div className="mt-1"><CompletionIndicator percentage={selectedAssessment.completion_percentage} /></div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600">Total Scores</div>
                <div className="text-sm text-gray-700 mt-1">
                  {selectedAssessment.total_employee_score} / {selectedAssessment.total_position_score}
                </div>
              </div>
            </div>

            {/* ✅ NEW: Skill Group Performance Summary */}
            {selectedAssessment.group_scores && Object.keys(selectedAssessment.group_scores).length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 border-b border-gray-200">
                  <h5 className="text-sm font-semibold text-white">Skill Group Performance Summary</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill Group</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Gap</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Completion</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Skills</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(selectedAssessment.group_scores).map(([groupName, scores]) => {
                        const gapColor = scores.gap > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        scores.gap < 0 ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200';
                        
                        const completionColor = scores.completion_percentage >= 100 ? 'bg-emerald-50 text-emerald-700' :
                                               scores.completion_percentage >= 80 ? 'bg-blue-50 text-blue-700' :
                                               scores.completion_percentage >= 60 ? 'bg-amber-50 text-amber-700' :
                                               'bg-red-50 text-red-700';

                        return (
                          <tr key={groupName} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{groupName}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">
                                {scores.position_total}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-gray-500 text-white rounded-md text-xs font-medium">
                                {scores.employee_total}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${gapColor}`}>
                                {scores.gap > 0 ? `+${scores.gap}` : scores.gap}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${completionColor}`}>
                                {scores.completion_percentage.toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-xs text-gray-600">
                              {scores.skills_count} skills
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
  {selectedAssessment.group_scores && Object.keys(selectedAssessment.group_scores).length > 0 && (
              
                <CoreAssessmentCharts assessment={selectedAssessment} />
          
            )}

                  {selectedAssessment.notes && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-sm text-gray-900">{selectedAssessment.notes}</p>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900">Assessment Results</h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill Group</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Gap</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedAssessment.competency_ratings?.length > 0 ? (
                            selectedAssessment.competency_ratings.map((rating, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-600">{rating.skill_group_name}</td>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.skill_name}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                    {rating.required_level}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-500 text-white">
                                    {rating.actual_level}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <GapIndicator gap={rating.gap} />
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600">
                                  {rating.notes || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-3 py-6 text-center text-sm text-gray-500">
                                No assessment data
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              {activeTab === 'employee' && selectedAssessment.status === 'COMPLETED' && (
                <ActionButton
                  onClick={() => handleExport(selectedAssessment.id, 'employee')}
                  icon={Download}
                  label="Export"
                  variant="secondary"
                  size="md"
                />
              )}
              <ActionButton
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssessment(null);
                }}
                icon={X}
                label="Close"
                variant="outline"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmModal.type}
        loading={isSubmitting}
      />
    </div>
  );
};

export default CoreEmployeeCalculation;