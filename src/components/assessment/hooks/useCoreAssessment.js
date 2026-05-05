'use client';
import { useState, useEffect } from 'react';
import { assessmentApi } from '@/services/assessmentApi';
import { useAssessmentPermissions } from '@/hooks/useAssessmentPermissions';
import { competencyApi } from '@/services/competencyApi';
import { useToast } from '@/components/common/Toast';
import referenceDataAPI from '@/store/api/referenceDataAPI';

export const toTitleCase = (str) => {
  if (!str) return '-';
  return str
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const useCoreAssessment = () => {
  const { showSuccess, showError } = useToast();

  // Tab state with sessionStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('coreAssessmentTab') || 'employee';
    }
    return 'employee';
  });

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

  const { permissions: userPermissions, isEmployeeOnly } = useAssessmentPermissions();
  const isEmployeeOnlyAccess = isEmployeeOnly;

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

    const employeesInGroup = employees.filter(emp => emp.position_group_level === positionGroupId);

    const jobTitlesInGroup = [...new Set(employeesInGroup.map(emp => emp.job_title).filter(Boolean))]
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'az'));

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

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  const fetchCompanies = async () => {
    try {
      const response = await referenceDataAPI.getBusinessFunctionDropdown();
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      showError('Failed to load companies');
    }
  };

  useEffect(() => {
    if (userPermissions?.is_admin) {
      fetchCompanies();
    }
  }, [userPermissions]);

  useEffect(() => {
    fetchData();
  }, [selectedCompany]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const employeeParams = {};

      if (selectedCompany && selectedCompany !== '') {
        const companyId = parseInt(selectedCompany, 10);

        if (isNaN(companyId)) {
          console.error('❌ Invalid company ID:', selectedCompany);
        } else {
          employeeParams.company = companyId;
        }
      } else {
        console.log('⚠️ No company filter - showing all');
      }

      const [
        positionAssessmentsRes,
        employeeAssessmentsRes,
        employeesRes,
        positionGroupsRes,
        coreScalesRes,
        skillGroupsRes
      ] = await Promise.all([
        assessmentApi.positionCore.getAll(),
        assessmentApi.employeeCore.getAll(employeeParams),
        assessmentApi.employees.getAll(),
        assessmentApi.positionGroups.getAll(),
        assessmentApi.coreScales.getAll(),
        competencyApi.skillGroups.getAll()
      ]);

      setPositionAssessments(positionAssessmentsRes.results || []);
      setEmployeeAssessments(employeeAssessmentsRes.results || []);
      setEmployees(employeesRes.results || []);
      setPositionGroups(positionGroupsRes.results || []);
      setCoreScales(coreScalesRes.results || []);

      const employeesList = employeesRes.results || [];
      setEmployees(employeesList);

      const jobTitles = [...new Set(employeesList.map(emp => emp.job_title).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'az'));

      setUniqueJobTitles(jobTitles.map(title => ({
        name: toTitleCase(title),
        value: title
      })));

      const skillGroupsList = skillGroupsRes.results || [];
      const skillGroupsDetails = await Promise.all(
        skillGroupsList.map(group => competencyApi.skillGroups.getById(group.id))
      );
      setSkillGroups(skillGroupsDetails);

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

  const handleEmployeeChange = async (employeeId) => {
    setTemplateError(null);
    const selectedEmployee = employees.find(e => e.id === employeeId);

    if (!selectedEmployee) {
      console.error('Employee not found:', employeeId);
      return;
    }

    setSelectedEmployeeInfo(selectedEmployee);

    setEmployeeFormData(prev => ({ ...prev, employee: employeeId }));

    try {
      const response = await assessmentApi.positionCore.getForEmployee(employeeId);

      if (response.assessment_template) {
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
      console.error('Error response:', err.response?.data);

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
          details: err.message
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

  const filteredPositionAssessments = positionAssessments.filter(assessment =>
    assessment.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.position_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeAssessments = employeeAssessments.filter(assessment =>
    (assessment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assessment.position_assessment_title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === '' || assessment.status === selectedStatus)
  );

  return {
    // State
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    error,
    isSubmitting,
    // Modal states
    showCreatePositionModal,
    setShowCreatePositionModal,
    showEditPositionModal,
    setShowEditPositionModal,
    showCreateEmployeeModal,
    setShowCreateEmployeeModal,
    showEditEmployeeModal,
    setShowEditEmployeeModal,
    showViewModal,
    setShowViewModal,
    showCoreScalesInfo,
    setShowCoreScalesInfo,
    selectedAssessment,
    setSelectedAssessment,
    templateError,
    setTemplateError,
    selectedEmployeeInfo,
    setSelectedEmployeeInfo,
    // Confirmation modal
    confirmModal,
    setConfirmModal,
    // Permissions
    userPermissions,
    isEmployeeOnlyAccess,
    // Group collapse states
    expandedGroups,
    setExpandedGroups,
    expandedCreateGroups,
    setExpandedCreateGroups,
    expandedEditGroups,
    setExpandedEditGroups,
    // Data
    positionAssessments,
    employeeAssessments,
    employees,
    positionGroups,
    coreScales,
    skillGroups,
    uniqueJobTitles,
    // Form data
    positionFormData,
    setPositionFormData,
    editPositionFormData,
    setEditPositionFormData,
    employeeFormData,
    setEmployeeFormData,
    editFormData,
    setEditFormData,
    // Job title filtering
    filteredJobTitles,
    editFilteredJobTitles,
    // Companies
    companies,
    selectedCompany,
    setSelectedCompany,
    // Handlers
    handlePositionGroupChange,
    handleEditPositionGroupChange,
    handleEmployeeChange,
    handleEditPositionAssessment,
    handleEditAssessment,
    handleCreatePositionAssessment,
    handleUpdatePositionAssessment,
    handleCreateEmployeeAssessment,
    handleUpdateEmployeeAssessment,
    handleSubmitAssessment,
    handleReopenAssessment,
    handleExport,
    handleDelete,
    // Filtered data
    filteredPositionAssessments,
    filteredEmployeeAssessments,
  };
};

export default useCoreAssessment;
