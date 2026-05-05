'use client';
import { useState, useEffect } from 'react';
import { assessmentApi } from '@/services/assessmentApi';
import { competencyApi } from '@/services/competencyApi';
import { useToast } from '@/components/common/Toast';
import referenceDataAPI from '@/store/api/referenceDataAPI';
import { useAssessmentPermissions } from '@/hooks/useAssessmentPermissions';

const useBehavioralAssessment = () => {
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
  const [behavioralGroups, setBehavioralGroups] = useState([]);
  const { permissions: userPermissions, isEmployeeOnly: isEmployeeOnlyAccess } = useAssessmentPermissions();

  // Grade Level and Job Title States
  const [gradeLevels, setGradeLevels] = useState([]);
  const [editGradeLevels, setEditGradeLevels] = useState([]);
  const [selectedGradeLevels, setSelectedGradeLevels] = useState([]);
  const [editSelectedGradeLevels, setEditSelectedGradeLevels] = useState([]);

  // Form States
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

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  // Fetch companies (Business Functions)
  useEffect(() => {
    if (userPermissions?.is_admin) {
      fetchCompanies();
    }
  }, [userPermissions]);

  const fetchCompanies = async () => {
    try {
      const response = await referenceDataAPI.getBusinessFunctionDropdown();
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      showError('Failed to load companies');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
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
        console.log('⚠️ Behavioral - No company filter');
      }

      const [
        positionAssessmentsRes,
        employeeAssessmentsRes,
        employeesRes,
        positionGroupsRes,
        behavioralScalesRes,
        letterGradesRes,
        behavioralGroupsRes
      ] = await Promise.all([
        assessmentApi.positionBehavioral.getAll(),
        assessmentApi.employeeBehavioral.getAll(employeeParams),
        assessmentApi.employees.getAll(),
        assessmentApi.positionGroups.getAll(),
        assessmentApi.behavioralScales.getAll(),
        assessmentApi.letterGrades.getAll(),
        competencyApi.behavioralGroups.getAll()
      ]);

      setPositionAssessments(positionAssessmentsRes.results || []);
      setEmployeeAssessments(employeeAssessmentsRes.results || []);
      setEmployees(employeesRes.results || []);
      setPositionGroups(positionGroupsRes.results || []);
      setBehavioralScales(behavioralScalesRes.results || []);
      setLetterGrades(letterGradesRes.results || []);

      const behavioralGroupsList = behavioralGroupsRes.results || [];
      const groupsWithCompetencies = await Promise.all(
        behavioralGroupsList.map(async (group) => {
          try {
            const groupDetails = await competencyApi.behavioralGroups.getById(group.id);
            return {
              ...group,
              competencies: groupDetails.competencies || []
            };
          } catch (err) {
            console.error(`Error fetching competencies for group ${group.id}:`, err);
            return { ...group, competencies: [] };
          }
        })
      );
      setBehavioralGroups(groupsWithCompetencies);

    } catch (err) {
      showError('Failed to load assessment data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompany]);

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
      const response = await assessmentApi.positionBehavioral.getGradeLevels(positionGroupId);
      const levels = response.grade_levels.map(level => ({
        id: level,
        name: `Grade ${level}`,
        value: level
      }));
      setGradeLevels(levels);

      const allLevels = response.grade_levels;
      setSelectedGradeLevels(allLevels);
      setPositionFormData(prev => ({ ...prev, grade_levels: allLevels }));

    } catch (err) {
      console.error('Failed to fetch grade levels:', err);
      showError('Failed to load grade levels');
      setGradeLevels([]);
    }
  };

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
      const response = await assessmentApi.positionBehavioral.getGradeLevels(positionGroupId);
      const levels = response.grade_levels.map(level => ({
        id: level,
        name: `Grade ${level}`,
        value: level
      }));
      setEditGradeLevels(levels);
    } catch (err) {
      console.error('Failed to fetch grade levels:', err);
      showError('Failed to load grade levels');
      setEditGradeLevels([]);
    }
  };

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

  const handleEditPositionAssessment = async (assessment) => {
    try {
      const detailedAssessment = await assessmentApi.positionBehavioral.getById(assessment.id);

      setEditPositionFormData({
        id: assessment.id,
        position_group: assessment.position_group,
        grade_levels: detailedAssessment.grade_levels || [],
        competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
          behavioral_competency_id: rating.behavioral_competency,
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
      console.error('❌ Error loading position assessment:', err);
      showError('Failed to load position assessment for editing');
    }
  };

  const handleUpdatePositionAssessment = async () => {
    if (!editPositionFormData.position_group) {
      showError('Please select Hierarchy');
      return;
    }

    const gradeLevelsToSend = editSelectedGradeLevels.length > 0
      ? editSelectedGradeLevels
      : editPositionFormData.grade_levels;

    if (!gradeLevelsToSend || gradeLevelsToSend.length === 0) {
      showError('Please select at least one grade level');
      return;
    }

    if (editPositionFormData.competency_ratings.length === 0) {
      showError('Please rate at least one competency');
      return;
    }

    setIsSubmitting(true);
    try {
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
        grade_levels: cleanedGradeLevels,
        competency_ratings: editPositionFormData.competency_ratings.map(r => ({
          behavioral_competency_id: parseInt(r.behavioral_competency_id),
          required_level: parseInt(r.required_level)
        }))
      };

      await assessmentApi.positionBehavioral.update(editPositionFormData.id, updateData);

      setShowEditPositionModal(false);
      setEditPositionFormData({ id: '', position_group: '', grade_levels: [], competency_ratings: [] });
      setEditGradeLevels([]);
      setEditSelectedGradeLevels([]);

      showSuccess('Position assessment template updated successfully');
      await fetchData();
    } catch (err) {
      console.error('❌ Error:', err.response?.data);

      if (err.response?.data?.grade_levels) {
        showError(`Grade levels: ${err.response.data.grade_levels[0]}`);
      } else {
        showError('Failed to update position assessment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePositionAssessment = async () => {
    if (!positionFormData.position_group || positionFormData.grade_levels.length === 0) {
      showError('Please select Hierarchy and at least one grade level');
      return;
    }

    if (positionFormData.competency_ratings.length === 0) {
      showError('Please rate at least one competency');
      return;
    }

    setIsSubmitting(true);
    setPositionDuplicateError(null);

    try {
      await assessmentApi.positionBehavioral.create(positionFormData);
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
        showError(err.response?.data?.error || 'Failed to create position assessment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
        message: `${selectedEmployee.name} already has a behavioral assessment. Each employee can only have one assessment.`,
        employee: selectedEmployee
      });
      setEmployeeFormData(prev => ({ ...prev, employee: employeeId, position_assessment: '' }));
      return;
    }

    setEmployeeFormData(prev => ({ ...prev, employee: employeeId }));

    try {
      const response = await assessmentApi.positionBehavioral.getForEmployee(employeeId);

      if (response.assessment_template) {
        setEmployeeFormData(prev => ({
          ...prev,
          employee: employeeId,
          position_assessment: response.assessment_template.id,
          competency_ratings: response.assessment_template.competency_ratings?.map(rating => ({
            behavioral_competency_id: rating.behavioral_competency,
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

  const handleEditAssessment = async (assessment) => {
    try {
      const detailedAssessment = await assessmentApi.employeeBehavioral.getById(assessment.id);

      setEditFormData({
        id: assessment.id,
        employee: assessment.employee,
        position_assessment: assessment.position_assessment,
        assessment_date: assessment.assessment_date,
        competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
          behavioral_competency_id: rating.behavioral_competency,
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

  const handleCreateEmployeeAssessment = async (isDraft = true) => {
    if (!employeeFormData.employee || !employeeFormData.position_assessment) {
      showError('Please select employee and ensure position template is loaded');
      return;
    }

    setIsSubmitting(true);
    try {
      const competencyRatings = employeeFormData.competency_ratings.map(rating => ({
        behavioral_competency_id: parseInt(rating.behavioral_competency_id),
        actual_level: parseInt(rating.actual_level) || 0,
        notes: rating.notes || ''
      }));

      const data = {
        employee: employeeFormData.employee,
        position_assessment: employeeFormData.position_assessment,
        assessment_date: employeeFormData.assessment_date,
        competency_ratings: competencyRatings,
        action_type: isDraft ? 'save_draft' : 'submit'
      };

      await assessmentApi.employeeBehavioral.create(data);

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
      console.error('❌ Error creating behavioral assessment:', err);
      console.error('Response:', err.response?.data);
      showError(err.response?.data?.competency_ratings?.[0] || 'Failed to create employee assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployeeAssessment = async (isDraft = true) => {
    if (!editFormData.id) return;

    setIsSubmitting(true);
    try {
      const competencyRatings = editFormData.competency_ratings.map(rating => ({
        behavioral_competency_id: parseInt(rating.behavioral_competency_id),
        actual_level: parseInt(rating.actual_level) || 0,
        notes: rating.notes || ''
      }));

      const data = {
        employee: editFormData.employee,
        position_assessment: editFormData.position_assessment,
        assessment_date: editFormData.assessment_date,
        competency_ratings: competencyRatings,
        action_type: isDraft ? 'save_draft' : 'submit'
      };

      await assessmentApi.employeeBehavioral.update(editFormData.id, data);

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
      console.error('❌ Error updating behavioral assessment:', err);
      console.error('Response:', err.response?.data);
      showError(err.response?.data?.competency_ratings?.[0] || 'Failed to update employee assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (id) => {
    try {
      await assessmentApi.employeeBehavioral.exportDocument(id);
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
          await assessmentApi.employeeBehavioral.submit(id, { status: 'COMPLETED' });
          showSuccess('Assessment submitted successfully');
          await fetchData();
        } catch (err) {
          showError('Failed to submit assessment');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
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
          await assessmentApi.employeeBehavioral.reopen(id, { status: 'DRAFT' });
          showSuccess('Assessment reopened for editing');
          await fetchData();
        } catch (err) {
          showError('Failed to reopen assessment');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
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
            await assessmentApi.positionBehavioral.delete(id);
          } else {
            await assessmentApi.employeeBehavioral.delete(id);
          }
          showSuccess('Assessment deleted successfully');
          await fetchData();
        } catch (err) {
          showError('Failed to delete assessment');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Filter data
  const filteredPositionAssessments = positionAssessments.filter(assessment =>
    assessment.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.position_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeAssessments = employeeAssessments.filter(assessment =>
    (assessment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assessment.position_assessment_title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === '' || assessment.status === selectedStatus)
  );

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return {
    // Basic state
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    selectedStatus, setSelectedStatus,
    isLoading,
    isSubmitting,
    // Modal state
    showCreatePositionModal, setShowCreatePositionModal,
    showEditPositionModal, setShowEditPositionModal,
    showCreateEmployeeModal, setShowCreateEmployeeModal,
    showEditEmployeeModal, setShowEditEmployeeModal,
    showViewModal, setShowViewModal,
    selectedAssessment, setSelectedAssessment,
    showScalesInfo, setShowScalesInfo,
    templateError, setTemplateError,
    selectedEmployeeInfo, setSelectedEmployeeInfo,
    positionDuplicateError, setPositionDuplicateError,
    // Confirmation modal
    confirmModal, setConfirmModal,
    // Collapsible
    expandedGroups,
    toggleGroup,
    // Data
    positionAssessments,
    employeeAssessments,
    employees,
    positionGroups,
    behavioralScales,
    letterGrades,
    behavioralGroups,
    userPermissions,
    isEmployeeOnlyAccess,
    // Grade level
    gradeLevels, setGradeLevels,
    editGradeLevels,
    selectedGradeLevels, setSelectedGradeLevels,
    editSelectedGradeLevels, setEditSelectedGradeLevels,
    // Form data
    positionFormData, setPositionFormData,
    editPositionFormData, setEditPositionFormData,
    employeeFormData, setEmployeeFormData,
    editFormData, setEditFormData,
    // Company filter
    companies,
    selectedCompany, setSelectedCompany,
    // Handlers
    handlePositionGroupChange,
    handleGradeLevelMultiSelectChange,
    handleEditPositionGroupChange,
    handleEditGradeLevelMultiSelectChange,
    handleEditPositionAssessment,
    handleUpdatePositionAssessment,
    handleCreatePositionAssessment,
    handleEmployeeChange,
    handleEditAssessment,
    handleCreateEmployeeAssessment,
    handleUpdateEmployeeAssessment,
    handleExport,
    handleSubmitAssessment,
    handleReopenAssessment,
    handleDelete,
    // Filtered data
    filteredPositionAssessments,
    filteredEmployeeAssessments,
    // Fetch
    fetchData,
  };
};

export default useBehavioralAssessment;
