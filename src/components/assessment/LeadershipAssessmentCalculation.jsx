'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Crown, Search, Eye, Edit, Trash2, 
  Download, AlertCircle, CheckCircle, Loader2, X, Save, 
  User, Building, RefreshCw, Info,ChevronRight ,ChevronDown 
} from 'lucide-react';
import { assessmentApi } from '@/services/assessmentApi';
import { competencyApi } from '@/services/competencyApi';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import MultiSelect from '@/components/common/MultiSelect';
import CollapsibleGroup from './CollapsibleGroup';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import LeadershipAssessmentCharts from './charts/LeadershipAssessmentCharts';
const LeadershipAssessmentCalculation = () => {
  const { showSuccess, showError } = useToast();

  // Basic States
  const [activeTab, setActiveTab] = useState('employee');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal States
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showEditPositionModal, setShowEditPositionModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showScalesInfo, setShowScalesInfo] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);
  const [positionDuplicateError, setPositionDuplicateError] = useState(null);
  const [expandedChildGroups, setExpandedChildGroups] = useState({});
  // Confirmation Modal States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });
  
  // Collapsible states
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Data States
  const [positionAssessments, setPositionAssessments] = useState([]);
  const [employeeAssessments, setEmployeeAssessments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [behavioralScales, setBehavioralScales] = useState([]);
  const [letterGrades, setLetterGrades] = useState([]);
  const [leadershipMainGroups, setLeadershipMainGroups] = useState([]);
  
  // ✅ Grade Level States - jobTitles SİLİNDİ
  const [gradeLevels, setGradeLevels] = useState([]);
  const [editGradeLevels, setEditGradeLevels] = useState([]);
  const [selectedGradeLevels, setSelectedGradeLevels] = useState([]);
  const [editSelectedGradeLevels, setEditSelectedGradeLevels] = useState([]);
  
  // ✅ Form States - job_title SİLİNDİ
  const [positionFormData, setPositionFormData] = useState({
    position_group: '',
    grade_levels: [],
    competency_ratings: []
  });

  const [editPositionFormData, setEditPositionFormData] = useState({
    id: '',
    position_group: '',
    grade_levels: [],
    competency_ratings: []
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
  const [employeeFormData, setEmployeeFormData] = useState({
    employee: '',
    position_assessment: '',
    assessment_date: new Date().toISOString().split('T')[0],
    competency_ratings: [],
    action_type: 'save_draft'
  });

  const [editFormData, setEditFormData] = useState({
    employee: '',
    position_assessment: '',
    assessment_date: '',
    competency_ratings: [],
    action_type: 'save_draft'
  });

  // Grade Badge Component
  const GradeBadge = ({ grade, percentage }) => {
    const getGradeColor = (grade) => {
      switch (grade) {
        case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'B': return 'bg-sky-50 text-sky-700 border-sky-200';
        case 'C': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'D': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'E': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'F': return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    if (!grade || !percentage) {
      return <span className="text-xs text-gray-500">Not graded</span>;
    }

    return (
      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getGradeColor(grade)}`}>
        {grade} ({percentage}%)
      </span>
    );
  };


  const handlePositionGroupChange = async (positionGroupId) => {
    if (!positionGroupId) {
      setGradeLevels([]);
      setSelectedGradeLevels([]);
      setPositionFormData(prev => ({ 
        ...prev, 
        position_group: '', 
        grade_levels: []
      }));
      return;
    }

    setPositionFormData(prev => ({ 
      ...prev, 
      position_group: positionGroupId, 
      grade_levels: []
    }));
    setSelectedGradeLevels([]);

    try {
      const response = await assessmentApi.positionLeadership.getGradeLevels(positionGroupId);
      
      const levels = response.grade_levels?.map(level => ({ 
        id: level, 
        name: `Grade ${level}`, 
        value: level 
      })) || [];
      setGradeLevels(levels);
      
      // ✅ Auto-select all grade levels
      const allLevels = response.grade_levels || [];
      setSelectedGradeLevels(allLevels);
      setPositionFormData(prev => ({ ...prev, grade_levels: allLevels }));
      
    } catch (err) {
      console.error('Failed to fetch grade levels:', err);
      showError('Failed to load grade levels');
      setGradeLevels([]);
    }
  };

  // ✅ Handle MultiSelect - SADƏLƏŞDI
  const handleGradeLevelMultiSelectChange = (fieldName, value) => {
    setSelectedGradeLevels(prev => {
      const newSelection = prev.includes(value)
        ? prev.filter(g => g !== value)
        : [...prev, value];
      
      setPositionFormData(prevForm => ({
        ...prevForm,
        grade_levels: newSelection
      }));
      
      return newSelection;
    });
  };


  const handleEditPositionGroupChange = async (positionGroupId) => {
    if (!positionGroupId) {
      setEditGradeLevels([]);
      setEditSelectedGradeLevels([]);
      setEditPositionFormData(prev => ({ 
        ...prev, 
        position_group: '', 
        grade_levels: []
      }));
      return;
    }

    setEditPositionFormData(prev => ({ 
      ...prev, 
      position_group: positionGroupId, 
      grade_levels: []
    }));
    setEditSelectedGradeLevels([]);

    try {
      const response = await assessmentApi.positionLeadership.getGradeLevels(positionGroupId);
      const levels = response.grade_levels?.map(level => ({ 
        id: level, 
        name: `Grade ${level}`, 
        value: level 
      })) || [];
      setEditGradeLevels(levels);
    } catch (err) {
      console.error('Failed to fetch grade levels:', err);
      showError('Failed to load grade levels');
      setEditGradeLevels([]);
    }
  };

  // ✅ Edit MultiSelect - SADƏLƏŞDI
  const handleEditGradeLevelMultiSelectChange = (fieldName, value) => {
    setEditSelectedGradeLevels(prev => {
      const newSelection = prev.includes(value)
        ? prev.filter(g => g !== value)
        : [...prev, value];
      
      setEditPositionFormData(prevForm => ({
        ...prevForm,
        grade_levels: newSelection
      }));
      
      return newSelection;
    });
  };

  // Auto-select position assessment for employee
  const handleEmployeeChange = async (employeeId) => {
    setTemplateError(null);
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (!selectedEmployee) return;

    setSelectedEmployeeInfo(selectedEmployee);
    
    const existingAssessment = employeeAssessments.find(
      assessment => assessment.employee === employeeId
    );
    
    if (existingAssessment) {
      setTemplateError({
        type: 'duplicate',
        message: `${selectedEmployee.name} already has a leadership assessment. Each employee can only have one assessment.`,
        employee: selectedEmployee
      });
      setEmployeeFormData(prev => ({ ...prev, employee: employeeId, position_assessment: '' }));
      return;
    }

    setEmployeeFormData(prev => ({ ...prev, employee: employeeId }));
    
    try {
      const response = await assessmentApi.positionLeadership.getForEmployee(employeeId);
      
      if (response.assessment_template) {
        setEmployeeFormData(prev => ({
          ...prev, 
          employee: employeeId,
          position_assessment: response.assessment_template.id,
          competency_ratings: response.assessment_template.competency_ratings?.map(rating => ({
            leadership_item_id: rating.leadership_item,
            actual_level: 0,
            notes: ''
          })) || []
        }));
        setTemplateError(null);
      }
    } catch (err) {
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
          employee: selectedEmployee
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

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      const [
        positionAssessmentsRes, 
        employeeAssessmentsRes, 
        employeesRes,
        positionGroupsRes,
        behavioralScalesRes,
        letterGradesRes,
        leadershipMainGroupsRes
      ] = await Promise.all([
        assessmentApi.positionLeadership.getAll(),
        assessmentApi.employeeLeadership.getAll(),
        assessmentApi.employees.getAll(),
        assessmentApi.positionGroups.getAll(),
        assessmentApi.behavioralScales.getAll(),
        assessmentApi.letterGrades.getAll(),
        competencyApi.leadershipMainGroups.getAll()
      ]);
      
      setPositionAssessments(positionAssessmentsRes.results || []);
      setEmployeeAssessments(employeeAssessmentsRes.results || []);
      setEmployees(employeesRes.results || []);
      setBehavioralScales(behavioralScalesRes.results || []);
      setLetterGrades(letterGradesRes.results || []);

      const allPositionGroups = positionGroupsRes.results || [];
      const leadershipKeywords = ['manager', 'vice chairman', 'director', 'vice', 'hod'];
      const filteredLeadershipPositions = allPositionGroups.filter(pg => 
        leadershipKeywords.some(keyword => pg.name?.toLowerCase().includes(keyword))
      );
      setPositionGroups(filteredLeadershipPositions);

      const mainGroupsList = leadershipMainGroupsRes.results || [];
    const groupsWithDetails = await Promise.all(
      mainGroupsList.map(async (group) => {
        try {
          const groupDetails = await competencyApi.leadershipMainGroups.getById(group.id);
          const childGroupsWithItems = await Promise.all(
            (groupDetails.child_groups || []).map(async (cg) => {
              try {
                const cgDetail = await competencyApi.leadershipChildGroups.getById(cg.id);
                return {
                  id: cg.id,
                  name: cg.name,
                  items: cgDetail.items || []
                };
              } catch (err) {
                console.error(`Error fetching child group ${cg.id}:`, err);
                return { id: cg.id, name: cg.name, items: [] };
              }
            })
          );
          
          return {
            id: group.id,
            name: group.name,
            child_groups: childGroupsWithItems
          };
        } catch (err) {
          console.error(`Error fetching details for group ${group.id}:`, err);
          return { id: group.id, name: group.name, child_groups: [] };
        }
      })
    );
    setLeadershipMainGroups(groupsWithDetails);
    
    // ✅ Initialize child group expanded states
    const childGroupStates = {};
    groupsWithDetails.forEach(mainGroup => {
      mainGroup.child_groups?.forEach(childGroup => {
        childGroupStates[childGroup.id] = true; // Default expanded
      });
    });
    setExpandedChildGroups(childGroupStates);
    
  } catch (err) {
    showError('Failed to load assessment data');
    console.error('Error fetching data:', err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);


const handleEditPositionAssessment = async (assessment) => {
  try {
    const detailedAssessment = await assessmentApi.positionLeadership.getById(assessment.id);
    
   
    
    setEditPositionFormData({
      id: assessment.id,
      position_group: assessment.position_group,
      grade_levels: detailedAssessment.grade_levels || [],  // ✅ From detailed
      competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
        leadership_item_id: rating.leadership_item,
        required_level: rating.required_level
      })) || []
    });
    
    setEditSelectedGradeLevels(detailedAssessment.grade_levels || []);
    
    if (assessment.position_group) {
      await handleEditPositionGroupChange(assessment.position_group);
      
      if (detailedAssessment.grade_levels && detailedAssessment.grade_levels.length > 0) {
        setEditSelectedGradeLevels(detailedAssessment.grade_levels);
      }
    }
    
    setShowEditPositionModal(true);
  } catch (err) {
    console.error('❌ Error loading leadership assessment:', err);
    showError('Failed to load position assessment for editing');
  }
};

const handleUpdatePositionAssessment = async () => {
  // Validation
  if (!editPositionFormData.position_group) {
    showError('Please select Hierarchy');
    return;
  }

  // ✅ DÜZƏLIŞLIK: Grade levels yoxlaması
  const gradeLevelsToSend = editSelectedGradeLevels.length > 0 
    ? editSelectedGradeLevels 
    : editPositionFormData.grade_levels;



  if (!gradeLevelsToSend || gradeLevelsToSend.length === 0) {
    showError('Please select at least one grade level');
    return;
  }

  if (editPositionFormData.competency_ratings.length === 0) {
    showError('Please rate at least one leadership competency');
    return;
  }

  setIsSubmitting(true);
  try {
    // ✅ DÜZƏLIŞLIK: Clean və validate et
    const cleanedGradeLevels = gradeLevelsToSend
      .filter(g => g !== null && g !== undefined && g !== '')
      .map(g => String(g).trim());

    if (cleanedGradeLevels.length === 0) {
      showError('Please select at least one valid grade level');
      setIsSubmitting(false);
      return;
    }

    const updateData = {
      position_group: editPositionFormData.position_group,
      grade_levels: cleanedGradeLevels, // ✅ Təmizlənmiş data
      competency_ratings: editPositionFormData.competency_ratings.map(r => ({
        leadership_item_id: parseInt(r.leadership_item_id),
        required_level: parseInt(r.required_level)
      }))
    };
    

    
    await assessmentApi.positionLeadership.update(editPositionFormData.id, updateData);
    
    // Reset states
    setShowEditPositionModal(false);
    setEditPositionFormData({ id: '', position_group: '', grade_levels: [], competency_ratings: [] });
    setEditGradeLevels([]);
    setEditSelectedGradeLevels([]);
    
    showSuccess('Position assessment template updated successfully');
    await fetchData();
  } catch (err) {
    console.error('❌ Error:', err);
    console.error('❌ Response:', err.response?.data);
    
    if (err.response?.data?.grade_levels) {
      showError(`Grade levels error: ${err.response.data.grade_levels[0]}`);
    } else if (err.response?.data?.non_field_errors) {
      showError(err.response.data.non_field_errors[0]);
    } else {
      showError('Failed to update position assessment');
    }
  } finally {
    setIsSubmitting(false);
  }
};


  const handleEditAssessment = async (assessment) => {
    try {
      const detailedAssessment = await assessmentApi.employeeLeadership.getById(assessment.id);
      
      setEditFormData({
        id: assessment.id,
        employee: assessment.employee,
        position_assessment: assessment.position_assessment,
        assessment_date: assessment.assessment_date,
        competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
          leadership_item_id: rating.leadership_item,
          actual_level: rating.actual_level || 0,
          notes: rating.notes || ''
        })) || [],
        action_type: 'save_draft'
      });
      
      const employee = employees.find(e => e.id === assessment.employee);
      setSelectedEmployeeInfo(employee);
      setShowEditEmployeeModal(true);
    } catch (err) {
      showError('Failed to load assessment for editing');
    }
  };

  // ✅ Create Position - job_title YOXDUR
  const handleCreatePositionAssessment = async () => {
    if (!positionFormData.position_group || positionFormData.grade_levels.length === 0) {
      showError('Please select Hierarchy and at least one grade level');
      return;
    }

    if (positionFormData.competency_ratings.length === 0) {
      showError('Please rate at least one leadership competency');
      return;
    }

    setIsSubmitting(true);
    setPositionDuplicateError(null);
    
    try {
      const competencyRatings = positionFormData.competency_ratings.map(rating => ({
        leadership_item_id: rating.leadership_item_id,
        required_level: rating.required_level
      }));

      await assessmentApi.positionLeadership.create({
        position_group: positionFormData.position_group,
        grade_levels: positionFormData.grade_levels,
        competency_ratings: competencyRatings
      });
      
      setShowCreatePositionModal(false);
      setPositionFormData({ position_group: '', grade_levels: [], competency_ratings: [] });
      setGradeLevels([]);
      setSelectedGradeLevels([]);
      setPositionDuplicateError(null);
      showSuccess('Position assessment template created successfully');
      await fetchData();
    } catch (err) {
      console.error('Error creating position assessment:', err);
      
      if (err.response?.data?.non_field_errors) {
        const selectedPosition = positionGroups.find(pg => pg.id === positionFormData.position_group);
        setPositionDuplicateError({
          message: 'A template for this Hierarchy already exists. Please edit the existing template.',
          positionGroup: selectedPosition?.name,
          gradeLevels: positionFormData.grade_levels.join(', ')
        });
      } else {
        showError(err.response?.data?.position_group?.[0] || err.response?.data?.competency_ratings?.[0] || 'Failed to create position assessment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleCreateEmployeeAssessment = async (isDraft = true) => {
    if (!employeeFormData.employee || !employeeFormData.position_assessment) {
      showError('Please select employee and ensure position template is loaded');
      return;
    }

    setIsSubmitting(true);
    try {
      const competencyRatings = employeeFormData.competency_ratings.map(rating => ({
        leadership_item_id: rating.leadership_item_id,
        actual_level: rating.actual_level || 0,
        notes: rating.notes || ''
      }));

      const data = {
        employee: employeeFormData.employee,
        position_assessment: employeeFormData.position_assessment,
        assessment_date: employeeFormData.assessment_date,
        competency_ratings: competencyRatings,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      await assessmentApi.employeeLeadership.create(data);
      setShowCreateEmployeeModal(false);
      setEmployeeFormData({
        employee: '',
        position_assessment: '',
        assessment_date: new Date().toISOString().split('T')[0],
        competency_ratings: [],
        action_type: 'save_draft'
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

  const handleUpdateEmployeeAssessment = async (isDraft = true) => {
    if (!editFormData.id) return;

    setIsSubmitting(true);
    try {
      const competencyRatings = editFormData.competency_ratings.map(rating => ({
        leadership_item_id: rating.leadership_item_id,
        actual_level: rating.actual_level || 0,
        notes: rating.notes || ''
      }));

      const data = {
        employee: editFormData.employee,
        position_assessment: editFormData.position_assessment,
        assessment_date: editFormData.assessment_date,
        competency_ratings: competencyRatings,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      await assessmentApi.employeeLeadership.update(editFormData.id, data);
      setShowEditEmployeeModal(false);
      setEditFormData({
        employee: '',
        position_assessment: '',
        assessment_date: '',
        competency_ratings: [],
        action_type: 'save_draft'
      });
      setSelectedEmployeeInfo(null);
      showSuccess(isDraft ? 'Assessment updated successfully' : 'Assessment submitted successfully');
      await fetchData();
    } catch (err) {
      console.error('Error updating employee assessment:', err);
      showError('Failed to update employee assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (id) => {
    try {
      await assessmentApi.employeeLeadership.exportDocument(id);
      showSuccess('Assessment exported successfully');
    } catch (err) {
      showError('Failed to export assessment');
    }
  };

  const handleSubmitAssessment = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Submit Assessment',
      message: 'Are you sure you want to submit this assessment? It will be finalized and cannot be edited.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await assessmentApi.employeeLeadership.submit(id, { status: 'COMPLETED' });
          showSuccess('Assessment submitted successfully');
          await fetchData();
        } catch (err) {
          showError('Failed to submit assessment');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleReopenAssessment = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Reopen Assessment',
      message: 'Are you sure you want to reopen this assessment for editing?',
      type: 'info',
      onConfirm: async () => {
        try {
          await assessmentApi.employeeLeadership.reopen(id, { status: 'DRAFT' });
          showSuccess('Assessment reopened for editing');
          await fetchData();
        } catch (err) {
          showError('Failed to reopen assessment');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleDelete = async (id, type) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Assessment',
      message: 'Are you sure you want to delete this assessment? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          if (type === 'position') {
            await assessmentApi.positionLeadership.delete(id);
          } else {
            await assessmentApi.employeeLeadership.delete(id);
          }
          showSuccess('Assessment deleted successfully');
          await fetchData();
        } catch (err) {
          showError('Failed to delete assessment');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  // Filter data
  const filteredPositionAssessments = positionAssessments.filter(assessment => 
    assessment.position_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeAssessments = employeeAssessments.filter(assessment => 
    (assessment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === '' || assessment.status === selectedStatus)
  );

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
const toggleChildGroup = (groupId) => {
  setExpandedChildGroups(prev => ({
    ...prev,
    [groupId]: !prev[groupId]
  }));
};
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-almet-sapphire" />
        <p className="text-gray-600 text-sm">Loading leadership assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       {/* ✅ Tab Navigation - Hide for employees */}
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
            <Crown size={16} />
            <span>Employee Assessments</span>
          </button>
        </div>
      </div>
    )}

      {/* Filters and Actions */}
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
        
        {/* ✅ Hide New Assessment button for employees */}
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


    
     
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  {/* ✅ Position Templates Tab - Only for Admin/Manager */}
  {!isEmployeeOnlyAccess() && activeTab === 'position' && (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Hierarchy</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Grade Levels</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Competencies</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredPositionAssessments.length > 0 ? (
            filteredPositionAssessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{assessment.position_group_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {assessment.grade_levels && assessment.grade_levels.length > 0 ? (
                      assessment.grade_levels.map((level, idx) => (
                        <span key={idx} className="inline-flex px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md text-xs font-medium">
                          {level}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No grades</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{assessment.competency_ratings?.length || 0} competencies</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <ActionButton onClick={() => { setSelectedAssessment(assessment); setShowViewModal(true); }} icon={Eye} label="" variant="outline" size="xs" />
                    <ActionButton onClick={() => handleEditPositionAssessment(assessment)} icon={Edit} label="" variant="info" size="xs" />
                    <ActionButton onClick={() => handleDelete(assessment.id, 'position')} icon={Trash2} label="" variant="danger" size="xs" />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-12">
                <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">No position templates found</p>
                <p className="text-gray-400 text-xs mt-1">Create your first leadership position template</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}

  {/* ✅ Employee Assessments Tab - For Everyone (with different permissions) */}
  {(isEmployeeOnlyAccess() || activeTab === 'employee') && (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {/* ✅ Hide Employee column for employee-only users */}
            {!isEmployeeOnlyAccess() && (
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Employee</th>
            )}
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Position</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Overall Grade</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredEmployeeAssessments.length > 0 ? (
            filteredEmployeeAssessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                {/* ✅ Show employee name only for admin/manager */}
                {!isEmployeeOnlyAccess() && (
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{assessment.employee_name}</div>
                    <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-gray-700">{assessment.position_assessment_info?.position_group || 'N/A'}</td>
                <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                <td className="px-4 py-3">
                  <GradeBadge grade={assessment.overall_letter_grade} percentage={parseFloat(assessment.overall_percentage || 0).toFixed(0)} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {/* ✅ VIEW button - Available for everyone */}
                    <ActionButton 
                      onClick={() => { setSelectedAssessment(assessment); setShowViewModal(true); }} 
                      icon={Eye} 
                      label="" 
                      variant="outline" 
                      size="xs" 
                    />
                    
                    {/* ✅ DOWNLOAD button - Available for everyone if completed */}
                    {assessment.status === 'COMPLETED' && (
                      <ActionButton 
                        onClick={() => handleExport(assessment.id)} 
                        icon={Download} 
                        label="" 
                        variant="secondary" 
                        size="xs" 
                      />
                    )}
                    
                    {/* ✅ Admin/Manager only actions */}
                    {!isEmployeeOnlyAccess() && (
                      <>
                        {/* EDIT - Only for drafts */}
                        {assessment.status === 'DRAFT' && (
                          <ActionButton 
                            onClick={() => handleEditAssessment(assessment)} 
                            icon={Edit} 
                            label="" 
                            variant="info" 
                            size="xs" 
                          />
                        )}
                        
                        {/* SUBMIT - Only for drafts */}
                        {assessment.status === 'DRAFT' && (
                          <ActionButton 
                            onClick={() => handleSubmitAssessment(assessment.id)} 
                            icon={CheckCircle} 
                            label="" 
                            variant="success" 
                            size="xs" 
                          />
                        )}
                        
                        {/* REOPEN - Only for completed */}
                        {assessment.status === 'COMPLETED' && (
                          <ActionButton 
                            onClick={() => handleReopenAssessment(assessment.id)} 
                            icon={RefreshCw} 
                            label="" 
                            variant="warning" 
                            size="xs" 
                          />
                        )}
                        
                        {/* DELETE - Always available for admin/manager */}
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
              <td colSpan={isEmployeeOnlyAccess() ? "5" : "6"} className="text-center py-12">
                <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">
                  {isEmployeeOnlyAccess() ? "No assessments found" : "No employee assessments found"}
                </p>
                {!isEmployeeOnlyAccess() && (
                  <p className="text-gray-400 text-xs mt-1">Create your first leadership assessment</p>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* ✅ Create Position Modal - 2 COLUMN GRID */}
      {showCreatePositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-almet-sapphire" />
                Create Leadership Position Template
              </h3>
              <button onClick={() => { 
                setShowCreatePositionModal(false); 
                setPositionDuplicateError(null); 
                setGradeLevels([]); 
                setSelectedGradeLevels([]);
                setPositionFormData({ position_group: '', grade_levels: [], competency_ratings: [] });
              }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Hierarchy <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown 
                    options={positionGroups} 
                    value={positionFormData.position_group} 
                    onChange={handlePositionGroupChange}
                    placeholder="Select Hierarchy"
                    portal={true}
                    allowUncheck={true}
                    zIndex="z-[60]" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Grade Levels <span className="text-red-500">*</span>
                  </label>
                  {!positionFormData.position_group ? (
                    <div className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-400 bg-gray-50">
                      Select Hierarchy first
                    </div>
                  ) : gradeLevels.length === 0 ? (
                    <div className="px-3 py-2 border border-amber-300 rounded-md text-sm text-amber-600 bg-amber-50">
                      No grade levels found
                    </div>
                  ) : (
                    <MultiSelect
                      options={gradeLevels}
                      selected={selectedGradeLevels}
                      onChange={handleGradeLevelMultiSelectChange}
                      placeholder="Select Grade Levels"
                      fieldName="grade_levels"
                    />
                  )}
                  {selectedGradeLevels.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ✓ {selectedGradeLevels.length} grade{selectedGradeLevels.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
    
              {positionDuplicateError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Duplicate Template</h4>
                      <p className="text-xs text-red-700 mt-1">{positionDuplicateError.message}</p>
                      <div className="mt-2 text-xs text-red-600">
                        <strong>Hierarchy:</strong> {positionDuplicateError.positionGroup}<br />
                        <strong>Grade Levels:</strong> {positionDuplicateError.gradeLevels}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {positionFormData.position_group && selectedGradeLevels.length > 0 && (
                <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 mt-0.5 text-sky-600 flex-shrink-0" />
                    <div className="space-y-0.5 text-xs flex items-center justify-center gap-6 text-sky-800">
                      <div>• Position: {positionGroups.find(pg => pg.id === positionFormData.position_group)?.name}</div>
                      <div>• Grade Levels: {selectedGradeLevels.sort().join(', ')}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Leadership Competency Ratings</h4>
                <button onClick={() => setShowScalesInfo(!showScalesInfo)} className="text-xs text-almet-sapphire hover:text-almet-astral flex items-center gap-1">
                  <Info size={14} />
                  {showScalesInfo ? 'Hide' : 'Show'} Scale Info
                </button>
              </div>

              {showScalesInfo && (
                <div className="mb-4 bg-sky-50 border border-sky-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-sky-900 mb-2">Leadership Assessment Scales:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {behavioralScales.map(scale => (
                      <div key={scale.id} className="bg-white p-2 rounded-md border border-sky-100">
                        <div className="text-xs font-semibold text-sky-900 mb-1">Level {scale.scale}</div>
                        <div className="text-xs text-sky-700">{scale.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
  {leadershipMainGroups.map(mainGroup => {
    const totalItems = mainGroup.child_groups?.reduce((acc, cg) => acc + (cg.items?.length || 0), 0) || 0;
    
    return (
      <CollapsibleGroup 
        key={mainGroup.id} 
        title={`${mainGroup.name} (${totalItems} items)`} 
        isOpen={expandedGroups[mainGroup.id]} 
        onToggle={() => toggleGroup(mainGroup.id)}
      >
        <div className="space-y-2">
          {mainGroup.child_groups && mainGroup.child_groups.length > 0 ? (
            mainGroup.child_groups.map(childGroup => (
              <div key={childGroup.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* ✅ CHILD GROUP HEADER - Collapsible */}
                <button
                  onClick={() => toggleChildGroup(childGroup.id)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-almet-sapphire" />
                    <h5 className="text-xs font-semibold text-gray-700">{childGroup.name}</h5>
                    <span className="ml-auto text-xs text-gray-500">({childGroup.items?.length || 0} items)</span>
                  </div>
                  {expandedChildGroups[childGroup.id] ? (
                    <ChevronDown size={16} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600" />
                  )}
                </button>
                
                {/* ✅ CHILD GROUP CONTENT - Collapsible */}
                {expandedChildGroups[childGroup.id] && (
                  <div className="divide-y divide-gray-100">
                    {childGroup.items && childGroup.items.length > 0 ? (
                      childGroup.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="flex-1 pr-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                          <select 
                            value={positionFormData.competency_ratings.find(r => r.leadership_item_id === item.id)?.required_level || ''} 
                            onChange={(e) => {
                              const newRatings = [...positionFormData.competency_ratings].filter(r => r.leadership_item_id !== item.id);
                              if (e.target.value) newRatings.push({ leadership_item_id: item.id, required_level: parseInt(e.target.value) });
                              setPositionFormData({...positionFormData, competency_ratings: newRatings});
                            }} 
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                          >
                            <option value="">-</option>
                            {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                          </select>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-xs text-gray-400">
                        No items in this group
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">
              No child groups in this main group
            </div>
          )}
        </div>
      </CollapsibleGroup>
    );
  })}
</div>

              {positionFormData.competency_ratings.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">✓ {positionFormData.competency_ratings.length} competencies rated</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton 
                onClick={() => { 
                  setShowCreatePositionModal(false); 
                  setPositionDuplicateError(null); 
                  setGradeLevels([]); 
                  setSelectedGradeLevels([]);
                  setPositionFormData({ position_group: '', grade_levels: [], competency_ratings: [] });
                }} 
                icon={X} 
                label="Cancel" 
                variant="outline" 
                size="md" 
              />
              <ActionButton 
                onClick={handleCreatePositionAssessment} 
                icon={Save} 
                label="Create Template" 
                variant="primary" 
                size="md" 
                loading={isSubmitting} 
                disabled={!positionFormData.position_group || selectedGradeLevels.length === 0 || positionFormData.competency_ratings.length === 0} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Position Modal - 2 COLUMN GRID */}
      {showEditPositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-almet-sapphire" />
                Edit Leadership Position Template
              </h3>
              <button onClick={() => { 
                setShowEditPositionModal(false);
                setEditGradeLevels([]);
                setEditSelectedGradeLevels([]);
                setEditPositionFormData({ id: '', position_group: '', grade_levels: [], competency_ratings: [] });
              }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* ✅ 2 COLUMN GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Hierarchy <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown 
                    options={positionGroups} 
                    value={editPositionFormData.position_group} 
                    onChange={handleEditPositionGroupChange}
                    placeholder="Select Hierarchy"
                    portal={true}
                    allowUncheck={true}
                    zIndex="z-[60]" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Grade Levels <span className="text-red-500">*</span>
                  </label>
                  {!editPositionFormData.position_group ? (
                    <div className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-400 bg-gray-50">
                      Select Hierarchy first
                    </div>
                  ) : editGradeLevels.length === 0 ? (
                    <div className="px-3 py-2 border border-amber-300 rounded-md text-sm text-amber-600 bg-amber-50">
                      No grade levels found
                    </div>
                  ) : (
                    <MultiSelect
                      options={editGradeLevels}
                      selected={editSelectedGradeLevels}
                      onChange={handleEditGradeLevelMultiSelectChange}
                      placeholder="Select Grade Levels"
                      fieldName="grade_levels"
                    />
                  )}
                  {editSelectedGradeLevels.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ✓ {editSelectedGradeLevels.length} grade{editSelectedGradeLevels.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Leadership Competency Ratings</h4>
                <button onClick={() => setShowScalesInfo(!showScalesInfo)} className="text-xs text-almet-sapphire hover:text-almet-astral flex items-center gap-1">
                  <Info size={14} />
                  {showScalesInfo ? 'Hide' : 'Show'} Scale Info
                </button>
              </div>

              {showScalesInfo && (
                <div className="mb-4 bg-sky-50 border border-sky-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-sky-900 mb-2">Leadership Assessment Scales:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {behavioralScales.map(scale => (
                      <div key={scale.id} className="bg-white p-2 rounded-md border border-sky-100">
                        <div className="text-xs font-semibold text-sky-900 mb-1">Level {scale.scale}</div>
                        <div className="text-xs text-sky-700">{scale.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

          
<div className="space-y-2">
  {leadershipMainGroups.map(mainGroup => {
    const totalItems = mainGroup.child_groups?.reduce((acc, cg) => acc + (cg.items?.length || 0), 0) || 0;
    
    return (
      <CollapsibleGroup 
        key={mainGroup.id} 
        title={`${mainGroup.name} (${totalItems} items)`} 
        isOpen={expandedGroups[mainGroup.id]} 
        onToggle={() => toggleGroup(mainGroup.id)}
      >
        <div className="space-y-2">
          {mainGroup.child_groups && mainGroup.child_groups.length > 0 ? (
            mainGroup.child_groups.map(childGroup => (
              <div key={childGroup.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleChildGroup(childGroup.id)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-almet-sapphire" />
                    <h5 className="text-xs font-semibold text-gray-700">{childGroup.name}</h5>
                    <span className="ml-auto text-xs text-gray-500">({childGroup.items?.length || 0} items)</span>
                  </div>
                  {expandedChildGroups[childGroup.id] ? (
                    <ChevronDown size={16} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600" />
                  )}
                </button>
                
                {expandedChildGroups[childGroup.id] && (
                  <div className="divide-y divide-gray-100">
                    {childGroup.items && childGroup.items.length > 0 ? (
                      childGroup.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="flex-1 pr-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                          <select 
                            value={editPositionFormData.competency_ratings.find(r => r.leadership_item_id === item.id)?.required_level || ''} 
                            onChange={(e) => {
                              const newRatings = [...editPositionFormData.competency_ratings].filter(r => r.leadership_item_id !== item.id);
                              if (e.target.value) newRatings.push({ leadership_item_id: item.id, required_level: parseInt(e.target.value) });
                              setEditPositionFormData({...editPositionFormData, competency_ratings: newRatings});
                            }} 
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                          >
                            <option value="">-</option>
                            {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                          </select>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-xs text-gray-400">
                        No items in this group
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">
              No child groups in this main group
            </div>
          )}
        </div>
      </CollapsibleGroup>
    );
  })}
</div>

              {editPositionFormData.competency_ratings.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">✓ {editPositionFormData.competency_ratings.length} competencies rated</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton 
                onClick={() => { 
                  setShowEditPositionModal(false);
                  setEditGradeLevels([]);
                  setEditSelectedGradeLevels([]);
                  setEditPositionFormData({ id: '', position_group: '', grade_levels: [], competency_ratings: [] });
                }} 
                icon={X} 
                label="Cancel" 
                variant="outline" 
                size="md" 
              />
              <ActionButton 
                onClick={handleUpdatePositionAssessment} 
                icon={Save} 
                label="Update Template" 
                variant="primary" 
                size="md" 
                loading={isSubmitting} 
                disabled={!editPositionFormData.position_group || editSelectedGradeLevels.length === 0 || editPositionFormData.competency_ratings.length === 0} 
              />
            </div>
          </div>
        </div>
      )}
 {/* Create Employee Assessment Modal - ✅ TABLE FORMAT */}
      {showCreateEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-almet-sapphire" />
                Create Employee Leadership Assessment
              </h3>
              <button onClick={() => { 
                setShowCreateEmployeeModal(false); 
                setTemplateError(null); 
                setSelectedEmployeeInfo(null);
                setEmployeeFormData({
                  employee: '',
                  position_assessment: '',
                  assessment_date: new Date().toISOString().split('T')[0],
                  competency_ratings: [],
                  action_type: 'save_draft'
                });
              }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Employee <span className="text-red-500">*</span></label>
                <SearchableDropdown 
                  options={employees} 
                  portal={true} 
                  zIndex="z-[60]" 
                  value={employeeFormData.employee} 
                  onChange={handleEmployeeChange} 
                  placeholder="Select Employee" 
                  allowUncheck={true} 
                />
              </div>

              {selectedEmployeeInfo && (
                <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <div className="text-xs font-medium text-sky-700">Employee</div>
                      <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-sky-700">Job Title</div>
                      <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.job_title}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-sky-700">Grade Level</div>
                      <div className="text-sm font-semibold text-sky-900">Grade {selectedEmployeeInfo.grading_level}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-sky-700">Hierarchy</div>
                      <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.position_group_name}</div>
                    </div>
                  </div>
                </div>
              )}

              {templateError && (
                <div className={`mb-4 p-3 rounded-lg border ${templateError.type === 'duplicate' ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${templateError.type === 'duplicate' ? 'text-amber-600' : 'text-red-600'}`} />
                    <div>
                      <h4 className={`text-sm font-medium ${templateError.type === 'duplicate' ? 'text-amber-800' : 'text-red-800'}`}>
                        {templateError.type === 'duplicate' ? 'Duplicate Assessment' : 'Template Not Found'}
                      </h4>
                      <p className={`text-xs mt-1 ${templateError.type === 'duplicate' ? 'text-amber-700' : 'text-red-700'}`}>{templateError.message}</p>
                    </div>
                  </div>
                </div>
              )}

         

{employeeFormData.position_assessment && !templateError && (
  <>
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-medium text-gray-900">Leadership Competency Assessment</h4>
      <button onClick={() => setShowScalesInfo(!showScalesInfo)} className="text-xs text-almet-sapphire hover:text-almet-astral flex items-center gap-1">
        <Info size={14} />
        {showScalesInfo ? 'Hide' : 'Show'} Scale Info
      </button>
    </div>

    {showScalesInfo && (
      <div className="mb-4 bg-sky-50 border border-sky-200 rounded-lg p-3">
        <h5 className="text-xs font-medium text-sky-900 mb-2">Leadership Assessment Scales:</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {behavioralScales.map(scale => (
            <div key={scale.id} className="bg-white p-2 rounded-md border border-sky-100">
              <div className="text-xs font-semibold text-sky-900 mb-1">Level {scale.scale}</div>
              <div className="text-xs text-sky-700">{scale.description}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ✅ TABLE FORMAT with Collapsible Child Groups */}
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(() => {
              const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
              if (!selectedPosition) return null;

              // Group by main group and child group
              const groupedCompetencies = {};
              selectedPosition.competency_ratings?.forEach(rating => {
                const mainGroupName = rating.main_group_name || 'Other';
                const childGroupName = rating.child_group_name || 'Other';
                
                if (!groupedCompetencies[mainGroupName]) {
                  groupedCompetencies[mainGroupName] = {};
                }
                if (!groupedCompetencies[mainGroupName][childGroupName]) {
                  groupedCompetencies[mainGroupName][childGroupName] = [];
                }
                groupedCompetencies[mainGroupName][childGroupName].push(rating);
              });

              return Object.entries(groupedCompetencies).map(([mainGroupName, childGroups]) => (
                <React.Fragment key={mainGroupName}>
                  {/* Main Group Header */}
                  <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
                    <td colSpan="5" className="px-3 py-2">
                      <button
                        onClick={() => toggleGroup(mainGroupName)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold text-white uppercase">{mainGroupName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white opacity-80">
                            {Object.keys(childGroups).length} child groups
                          </span>
                          {expandedGroups[mainGroupName] ? (
                            <ChevronDown size={16} className="text-white" />
                          ) : (
                            <ChevronRight size={16} className="text-white" />
                          )}
                        </div>
                      </button>
                    </td>
                  </tr>
                  
                  {/* Child Groups - Only show if main group is expanded */}
                  {expandedGroups[mainGroupName] && Object.entries(childGroups).map(([childGroupName, competencies]) => (
                    <React.Fragment key={childGroupName}>
                      {/* ✅ Child Group Header - Collapsible */}
                      <tr className="bg-gray-100">
                        <td colSpan="5" className="px-3 py-2">
                          <button
                            onClick={() => toggleChildGroup(`${mainGroupName}-${childGroupName}`)}
                            className="w-full flex items-center justify-between text-left hover:bg-gray-200 transition-colors rounded px-2 py-1"
                          >
                            <div className="flex items-center gap-2">
                              <Building size={14} className="text-almet-sapphire" />
                              <span className="text-xs font-semibold text-gray-700">{childGroupName}</span>
                              <span className="text-xs text-gray-500">({competencies.length} items)</span>
                            </div>
                            {expandedChildGroups[`${mainGroupName}-${childGroupName}`] ? (
                              <ChevronDown size={14} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={14} className="text-gray-600" />
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* ✅ Competency Items - Only show if child group is expanded */}
                      {expandedChildGroups[`${mainGroupName}-${childGroupName}`] && competencies.map(competency => {
                        const employeeRating = employeeFormData.competency_ratings.find(r => r.leadership_item_id === competency.leadership_item);
                        const actualLevel = employeeRating?.actual_level || 0;
                        const gap = actualLevel - competency.required_level;
                        
                        return (
                          <tr key={competency.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 pl-10 text-sm text-gray-900">{competency.item_name}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">
                                {competency.required_level}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <select 
                                value={actualLevel} 
                                onChange={(e) => {
                                  const newRatings = [...employeeFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                  newRatings.push({ 
                                    leadership_item_id: competency.leadership_item, 
                                    actual_level: parseInt(e.target.value), 
                                    notes: employeeRating?.notes || '' 
                                  });
                                  setEmployeeFormData({...employeeFormData, competency_ratings: newRatings});
                                }} 
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                              >
                                <option value={0}>-</option>
                                {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                                gap > 0 ? 'bg-emerald-50 text-emerald-700' : 
                                gap < 0 ? 'bg-red-50 text-red-700' : 
                                'bg-sky-50 text-sky-700'
                              }`}>
                                {gap > 0 ? `+${gap}` : gap}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <textarea 
                                value={employeeRating?.notes || ''} 
                                onChange={(e) => {
                                  const newRatings = [...employeeFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                  newRatings.push({ 
                                    leadership_item_id: competency.leadership_item, 
                                    actual_level: actualLevel, 
                                    notes: e.target.value 
                                  });
                                  setEmployeeFormData({...employeeFormData, competency_ratings: newRatings});
                                }} 
                                placeholder="Assessment notes..." 
                                rows="2" 
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none" 
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  </>
)}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton 
                onClick={() => { 
                  setShowCreateEmployeeModal(false); 
                  setTemplateError(null); 
                  setSelectedEmployeeInfo(null);
                  setEmployeeFormData({
                    employee: '',
                    position_assessment: '',
                    assessment_date: new Date().toISOString().split('T')[0],
                    competency_ratings: [],
                    action_type: 'save_draft'
                  });
                }} 
                icon={X} 
                label="Cancel" 
                variant="outline" 
                size="md" 
              />
              {employeeFormData.position_assessment && !templateError && (
                <>
                  <ActionButton 
                    onClick={() => handleCreateEmployeeAssessment(true)} 
                    icon={Save} 
                    label="Save Draft" 
                    variant="secondary" 
                    size="md" 
                    loading={isSubmitting} 
                  />
                  <ActionButton 
                    onClick={() => handleCreateEmployeeAssessment(false)} 
                    icon={CheckCircle} 
                    label="Submit" 
                    variant="success" 
                    size="md" 
                    loading={isSubmitting} 
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

{showEditEmployeeModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Edit className="w-5 h-5 text-almet-sapphire" />
          Edit Employee Leadership Assessment
        </h3>
        <button onClick={() => { 
          setShowEditEmployeeModal(false);
          setSelectedEmployeeInfo(null);
          setEditFormData({
            employee: '',
            position_assessment: '',
            assessment_date: '',
            competency_ratings: [],
            action_type: 'save_draft'
          });
        }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
        {selectedEmployeeInfo && (
          <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <div className="text-xs font-medium text-sky-700">Employee</div>
                <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.name}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-sky-700">Job Title</div>
                <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.job_title}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-sky-700">Grade Level</div>
                <div className="text-sm font-semibold text-sky-900">Grade {selectedEmployeeInfo.grading_level}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-sky-700">Hierarchy</div>
                <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.position_group_name}</div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ TABLE with Collapsible Child Groups */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  const selectedPosition = positionAssessments.find(p => p.id === editFormData.position_assessment);
                  if (!selectedPosition) return null;

                  const groupedCompetencies = {};
                  selectedPosition.competency_ratings?.forEach(rating => {
                    const mainGroupName = rating.main_group_name || 'Other';
                    const childGroupName = rating.child_group_name || 'Other';
                    
                    if (!groupedCompetencies[mainGroupName]) {
                      groupedCompetencies[mainGroupName] = {};
                    }
                    if (!groupedCompetencies[mainGroupName][childGroupName]) {
                      groupedCompetencies[mainGroupName][childGroupName] = [];
                    }
                    groupedCompetencies[mainGroupName][childGroupName].push(rating);
                  });

                  return Object.entries(groupedCompetencies).map(([mainGroupName, childGroups]) => (
                    <React.Fragment key={mainGroupName}>
                      {/* Main Group Header */}
                      <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
                        <td colSpan="5" className="px-3 py-2">
                          <button
                            onClick={() => toggleGroup(mainGroupName)}
                            className="w-full flex items-center justify-between text-left"
                          >
                            <span className="text-xs font-bold text-white uppercase">{mainGroupName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white opacity-80">
                                {Object.keys(childGroups).length} child groups
                              </span>
                              {expandedGroups[mainGroupName] ? (
                                <ChevronDown size={16} className="text-white" />
                              ) : (
                                <ChevronRight size={16} className="text-white" />
                              )}
                            </div>
                          </button>
                        </td>
                      </tr>
                      
                      {/* Child Groups */}
                      {expandedGroups[mainGroupName] && Object.entries(childGroups).map(([childGroupName, competencies]) => (
                        <React.Fragment key={childGroupName}>
                          {/* Child Group Header - Collapsible */}
                          <tr className="bg-gray-100">
                            <td colSpan="5" className="px-3 py-2">
                              <button
                                onClick={() => toggleChildGroup(`${mainGroupName}-${childGroupName}`)}
                                className="w-full flex items-center justify-between text-left hover:bg-gray-200 transition-colors rounded px-2 py-1"
                              >
                                <div className="flex items-center gap-2">
                                  <Building size={14} className="text-almet-sapphire" />
                                  <span className="text-xs font-semibold text-gray-700">{childGroupName}</span>
                                  <span className="text-xs text-gray-500">({competencies.length} items)</span>
                                </div>
                                {expandedChildGroups[`${mainGroupName}-${childGroupName}`] ? (
                                  <ChevronDown size={14} className="text-gray-600" />
                                ) : (
                                  <ChevronRight size={14} className="text-gray-600" />
                                )}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Competency Items */}
                          {expandedChildGroups[`${mainGroupName}-${childGroupName}`] && competencies.map(competency => {
                            const employeeRating = editFormData.competency_ratings.find(r => r.leadership_item_id === competency.leadership_item);
                            const actualLevel = employeeRating?.actual_level || 0;
                            const gap = actualLevel - competency.required_level;
                            
                            return (
                              <tr key={competency.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 pl-10 text-sm text-gray-900">{competency.item_name}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">
                                    {competency.required_level}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <select 
                                    value={actualLevel} 
                                    onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                      newRatings.push({ 
                                        leadership_item_id: competency.leadership_item, 
                                        actual_level: parseInt(e.target.value), 
                                        notes: employeeRating?.notes || '' 
                                      });
                                      setEditFormData({...editFormData, competency_ratings: newRatings});
                                    }} 
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                  >
                                    <option value={0}>-</option>
                                    {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                  </select>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                                    gap > 0 ? 'bg-emerald-50 text-emerald-700' : 
                                    gap < 0 ? 'bg-red-50 text-red-700' : 
                                    'bg-sky-50 text-sky-700'
                                  }`}>
                                    {gap > 0 ? `+${gap}` : gap}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <textarea 
                                    value={employeeRating?.notes || ''} 
                                    onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                      newRatings.push({ 
                                        leadership_item_id: competency.leadership_item, 
                                        actual_level: actualLevel, 
                                        notes: e.target.value 
                                      });
                                      setEditFormData({...editFormData, competency_ratings: newRatings});
                                    }} 
                                    placeholder="Assessment notes..." 
                                    rows="2" 
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none" 
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
        <ActionButton 
          onClick={() => { 
            setShowEditEmployeeModal(false);
            setSelectedEmployeeInfo(null);
            setEditFormData({
              employee: '',
              position_assessment: '',
              assessment_date: '',
              competency_ratings: [],
              action_type: 'save_draft'
            });
          }} 
          icon={X} 
          label="Cancel" 
          variant="outline" 
          size="md" 
        />
        <ActionButton 
          onClick={() => handleUpdateEmployeeAssessment(true)} 
          icon={Save} 
          label="Update Draft" 
          variant="secondary" 
          size="md" 
          loading={isSubmitting} 
        />
        <ActionButton 
          onClick={() => handleUpdateEmployeeAssessment(false)} 
          icon={CheckCircle} 
          label="Submit" 
          variant="success" 
          size="md" 
          loading={isSubmitting} 
        />
      </div>
    </div>
  </div>
)}


{showViewModal && selectedAssessment && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-almet-sapphire" />
          {activeTab === 'position' ? 'Position Template Details' : 'Assessment Details'}
        </h3>
        <button onClick={() => { setShowViewModal(false); setSelectedAssessment(null); }} 
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
        {activeTab === 'position' ? (
          // ✅ POSITION TEMPLATE VIEW - SIMPLIFIED
          <div className="space-y-4">
            {/* Position Info - Compact Grid */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1">Hierarchy</div>
                <div className="text-sm font-semibold text-gray-900">{selectedAssessment.position_group_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Grade Levels</div>
                <div className="flex flex-wrap gap-1">
                  {selectedAssessment.grade_levels && selectedAssessment.grade_levels.length > 0 ? (
                    selectedAssessment.grade_levels.map((level, idx) => (
                      <span key={idx} className="inline-flex px-2 py-0.5 bg-sky-500 text-white rounded text-xs font-medium">
                        {level}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No grades</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Total Competencies</div>
                <div className="text-sm font-semibold text-gray-900">
                  {selectedAssessment.competency_ratings?.length || 0} items
                </div>
              </div>
            </div>

            {/* Grouped Competencies - Collapsible */}
            {selectedAssessment.grouped_competencies && Object.keys(selectedAssessment.grouped_competencies).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(selectedAssessment.grouped_competencies).map(([mainGroupName, childGroups]) => {
                  const totalItems = Object.values(childGroups).reduce((acc, items) => acc + items.length, 0);
                  
                  return (
                    <div key={mainGroupName} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Main Group Header - Collapsible */}
                      <button
                        onClick={() => toggleGroup(mainGroupName)}
                        className="w-full bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 flex items-center justify-between hover:opacity-90 transition-opacity"
                      >
                        <span className="text-sm font-semibold text-white">{mainGroupName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/80">{totalItems} items</span>
                          {expandedGroups[mainGroupName] ? (
                            <ChevronDown size={16} className="text-white" />
                          ) : (
                            <ChevronRight size={16} className="text-white" />
                          )}
                        </div>
                      </button>
                      
                      {/* Child Groups */}
                      {expandedGroups[mainGroupName] && (
                        <div className="bg-white">
                          {Object.entries(childGroups).map(([childGroupName, items]) => (
                            <div key={childGroupName} className="border-t border-gray-100">
                              {/* Child Group Header - Collapsible */}
                              <button
                                onClick={() => toggleChildGroup(`view-${mainGroupName}-${childGroupName}`)}
                                className="w-full bg-gray-50 px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Building size={14} className="text-almet-sapphire" />
                                  <span className="text-xs font-semibold text-gray-700">{childGroupName}</span>
                                  <span className="text-xs text-gray-500">({items.length})</span>
                                </div>
                                {expandedChildGroups[`view-${mainGroupName}-${childGroupName}`] ? (
                                  <ChevronDown size={14} className="text-gray-600" />
                                ) : (
                                  <ChevronRight size={14} className="text-gray-600" />
                                )}
                              </button>
                              
                              {/* Items */}
                              {expandedChildGroups[`view-${mainGroupName}-${childGroupName}`] && (
                                <div className="divide-y divide-gray-100">
                                  {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 pl-8 hover:bg-gray-50">
                                      <div className="text-sm text-gray-900">{item.item_name}</div>
                                      <span className="inline-flex px-2.5 py-1 bg-almet-sapphire text-white rounded text-xs font-medium">
                                        {item.required_level}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">No competency ratings found</p>
              </div>
            )}
          </div>
        ) : (
          // ✅ EMPLOYEE LEADERSHIP ASSESSMENT VIEW - SIMPLIFIED & COLLAPSIBLE
          <div className="space-y-4">
            {/* Employee Info - Compact */}
            <div className="grid grid-cols-4 gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1">Employee</div>
                <div className="text-sm font-semibold text-gray-900">{selectedAssessment.employee_name}</div>
                <div className="text-xs text-gray-500">ID: {selectedAssessment.employee_id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Position</div>
                <div className="text-sm text-gray-700">
                  {selectedAssessment.position_assessment_info?.position_group || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <StatusBadge status={selectedAssessment.status} />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Date</div>
                <div className="text-sm text-gray-700">
                  {new Date(selectedAssessment.assessment_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Overall Performance - Compact */}
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Grade</div>
                  <div className="text-4xl font-bold text-emerald-600">
                    {selectedAssessment.overall_letter_grade}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Score</div>
                  <div className="text-4xl font-bold text-sky-600">
                    {parseFloat(selectedAssessment.overall_percentage || 0).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
{selectedAssessment.main_group_scores_display && Object.keys(selectedAssessment.main_group_scores_display).length > 0 && (
 
      <LeadershipAssessmentCharts assessment={selectedAssessment} />
   
  )}

            {/* Main Group Scores - Compact Table */}
            {selectedAssessment.main_group_scores_display && Object.keys(selectedAssessment.main_group_scores_display).length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral px-3 py-2">
                  <h5 className="text-xs font-semibold text-white">Main Group Performance</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Score</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(selectedAssessment.main_group_scores_display).map(([groupName, scores]) => {
                        const getColor = (pct) => {
                          if (pct >= 90) return 'bg-emerald-500 text-white';
                          if (pct >= 80) return 'bg-blue-500 text-white';
                          if (pct >= 70) return 'bg-amber-500 text-white';
                          return 'bg-red-500 text-white';
                        };

                        return (
                          <tr key={groupName} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{groupName}</td>
                            <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.position_total}</td>
                            <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.employee_total}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                {scores.percentage}%
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                {scores.letter_grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Child Group Scores - Compact Table */}
            {selectedAssessment.child_group_scores_display && Object.keys(selectedAssessment.child_group_scores_display).length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2">
                  <h5 className="text-xs font-semibold text-white">Child Group Performance</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Score</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(selectedAssessment.child_group_scores_display).map(([groupName, scores]) => {
                        const getColor = (pct) => {
                          if (pct >= 90) return 'bg-emerald-500 text-white';
                          if (pct >= 80) return 'bg-blue-500 text-white';
                          if (pct >= 70) return 'bg-amber-500 text-white';
                          return 'bg-red-500 text-white';
                        };

                        return (
                          <tr key={groupName} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{groupName}</td>
                            <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.position_total}</td>
                            <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.employee_total}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                {scores.percentage}%
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                {scores.letter_grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Competency Ratings - Collapsible Groups */}
            {selectedAssessment.grouped_competencies && Object.keys(selectedAssessment.grouped_competencies).length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Detailed Assessment Results</h4>
                {Object.entries(selectedAssessment.grouped_competencies).map(([mainGroupName, childGroups]) => {
                  const totalItems = Object.values(childGroups).reduce((acc, items) => acc + items.length, 0);
                  
                  return (
                    <div key={mainGroupName} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Main Group Header */}
                      <button
                        onClick={() => toggleGroup(`view-${mainGroupName}`)}
                        className="w-full bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 flex items-center justify-between hover:opacity-90 transition-opacity"
                      >
                        <span className="text-sm font-semibold text-white">{mainGroupName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/80">{totalItems} items</span>
                          {expandedGroups[`view-${mainGroupName}`] ? (
                            <ChevronDown size={16} className="text-white" />
                          ) : (
                            <ChevronRight size={16} className="text-white" />
                          )}
                        </div>
                      </button>
                      
                      {/* Child Groups */}
                      {expandedGroups[`view-${mainGroupName}`] && (
                        <div className="bg-white">
                          {Object.entries(childGroups).map(([childGroupName, items]) => (
                            <div key={childGroupName} className="border-t border-gray-100">
                              {/* Child Group Header */}
                              <button
                                onClick={() => toggleChildGroup(`view-detail-${mainGroupName}-${childGroupName}`)}
                                className="w-full bg-gray-50 px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Building size={14} className="text-almet-sapphire" />
                                  <span className="text-xs font-semibold text-gray-700">{childGroupName}</span>
                                  <span className="text-xs text-gray-500">({items.length})</span>
                                </div>
                                {expandedChildGroups[`view-detail-${mainGroupName}-${childGroupName}`] ? (
                                  <ChevronDown size={14} className="text-gray-600" />
                                ) : (
                                  <ChevronRight size={14} className="text-gray-600" />
                                )}
                              </button>
                              
                              {/* Items Table */}
                              {expandedChildGroups[`view-detail-${mainGroupName}-${childGroupName}`] && (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Required</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Actual</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-16">Gap</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {items.map((item, idx) => {
                                        const gap = item.gap || (item.actual_level - item.required_level);
                                        const gapColor = gap > 0 ? 'bg-emerald-500 text-white' :
                                                        gap < 0 ? 'bg-red-500 text-white' :
                                                        'bg-sky-500 text-white';
                                        
                                        return (
                                          <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-sm text-gray-900">{item.item_name}</td>
                                            <td className="px-3 py-2 text-center">
                                              <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded text-xs font-medium">
                                                {item.required_level}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              <span className="inline-flex px-2 py-0.5 bg-gray-500 text-white rounded text-xs font-medium">
                                                {item.actual_level}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${gapColor}`}>
                                                {gap > 0 ? `+${gap}` : gap}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-600">{item.notes || '-'}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">No competency ratings found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
        {activeTab === 'employee' && selectedAssessment.status === 'COMPLETED' && (
          <ActionButton onClick={() => handleExport(selectedAssessment.id)} 
                       icon={Download} label="Export PDF" variant="secondary" size="md" />
        )}
        <ActionButton onClick={() => { setShowViewModal(false); setSelectedAssessment(null); }} 
                     icon={X} label="Close" variant="outline" size="md" />
      </div>
    </div>
  </div>
)}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmModal.type}
      />
    </div>
  );
};

export default LeadershipAssessmentCalculation;