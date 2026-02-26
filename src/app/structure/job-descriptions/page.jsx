// pages/structure/job-descriptions/page.jsx - HIERARCHICAL NAVIGATION
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, FileText, Clock,
  CheckCircle, Settings,  X, Users,
  Building, ChevronRight, ArrowLeft, Filter, Search
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { ToastProvider, useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Pagination from '@/components/common/Pagination';

import jobDescriptionService from '@/services/jobDescriptionService';
import competencyApi from '@/services/competencyApi';

import JobDescriptionList from '@/components/jobDescription/JobDescriptionList';
import JobDescriptionForm from '@/components/jobDescription/JobDescriptionForm';
import JobViewModal from '@/components/jobDescription/JobViewModal';
import SubmissionModal from '@/components/jobDescription/SubmissionModal';
import AssignmentsModal from '@/components/jobDescription/AssignmentsModal';
import StatCard from '@/components/jobDescription/StatCard';

const JobDescriptionPageContent = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const bgApp = darkMode ? "bg-gray-900" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  // 🔥 NEW: View Mode State
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'details', 'create'
  const [selectedBusinessFunction, setSelectedBusinessFunction] = useState(null);

  // State management
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [selectedJobForAssignments, setSelectedJobForAssignments] = useState(null);
  const [assignmentsData, setAssignmentsData] = useState(null);
  
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionComments, setSubmissionComments] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [createdJobsData, setCreatedJobsData] = useState(null);
  const [isExistingJobSubmission, setIsExistingJobSubmission] = useState(false);
  
  const [selectedSkillGroup, setSelectedSkillGroup] = useState('');
  const [selectedBehavioralGroup, setSelectedBehavioralGroup] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  const [userAccess, setUserAccess] = useState(null);
const [accessLoading, setAccessLoading] = useState(true);
  // ðŸ"¥ State-ə əlavə edin
const [businessFunctionJobs, setBusinessFunctionJobs] = useState([]);
const [totalBusinessFunctionJobs, setTotalBusinessFunctionJobs] = useState(0);
// Add useEffect to fetch access info
useEffect(() => {
  fetchUserAccess();
}, []);

const fetchUserAccess = async () => {
  try {
    setAccessLoading(true);
    const accessInfo = await jobDescriptionService.getMyAccessInfo();
    setUserAccess(accessInfo);
  } catch (error) {
    console.error('Error fetching user access:', error);
  } finally {
    setAccessLoading(false);
  }
};
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [stats, setStats] = useState({});
  
  const [dropdownData, setDropdownData] = useState({
    employees: [],
    employeeMap: new Map(),
    skillGroups: [],
    behavioralGroups: [],
    leadershipMainGroups: [],
    businessResources: [],
    accessMatrix: [],
    companyBenefits: []
  });

  const [formData, setFormData] = useState({
    job_title: '',
    job_purpose: '',
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
    position_group: '',
    grading_level: '',
    grading_levels: [],
    criticalDuties: [''],
    positionMainKpis: [''],
    jobDuties: [''],
    requirements: [''],
    required_skills_data: [],
    behavioral_competencies_data: [],
    leadership_competencies_data: [],
    business_resources_ids: [],
    access_rights_ids: [],
    company_benefits_ids: []
  });

  const [selectedPositionGroup, setSelectedPositionGroup] = useState('');
  const [matchingEmployees, setMatchingEmployees] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSkillGroup) {
      fetchSkillsForGroup(selectedSkillGroup);
    } else {
      setAvailableSkills([]);
    }
  }, [selectedSkillGroup]);

  useEffect(() => {
    if (selectedBehavioralGroup) {
      fetchCompetenciesForGroup(selectedBehavioralGroup);
    } else {
      setAvailableCompetencies([]);
    }
  }, [selectedBehavioralGroup]);

  useEffect(() => {
    filterMatchingEmployees();
  }, [
    formData.business_function,
    formData.department,
    formData.unit,
    formData.job_function,
    formData.position_group,
    formData.grading_level,
    formData.job_title,
    dropdownData.employees
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedStatus]);

  // 🔥 NEW: Group jobs by business function
  const businessFunctionGroups = useMemo(() => {
    const groups = {};
    
    jobDescriptions.forEach(job => {
      const bf = job.business_function_name || 'Other';
      if (!groups[bf]) {
        groups[bf] = {
          name: bf,
          jobs: [],
          departments: new Set()
        };
      }
      groups[bf].jobs.push(job);
      if (job.department_name) {
        groups[bf].departments.add(job.department_name);
      }
    });
    
    // Calculate stats for each business function
    return Object.values(groups).map(group => ({
      ...group,
      totalJobs: group.jobs.length,
      totalAssignments: group.jobs.reduce((sum, job) => sum + (job.total_assignments || 0), 0),
      approvedCount: group.jobs.reduce((sum, job) => sum + (job.approved_count || 0), 0),
      approvedJobs: group.jobs.filter(job => job.overall_status === 'ALL_APPROVED').length,
      pendingJobs: group.jobs.filter(job => job.overall_status === 'PENDING_APPROVALS').length,
      draftJobs: group.jobs.filter(job => job.overall_status === 'ALL_DRAFT').length,
      departments: Array.from(group.departments).sort()
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [jobDescriptions]);



const fetchBusinessFunctionJobs = async (businessFunctionName, page = 1) => {
  try {
    setActionLoading(true);
    const response = await jobDescriptionService.getJobDescriptions({ 
      business_function: businessFunctionName,
      page: page,
      page_size: itemsPerPage  // 10
    });
    
    setBusinessFunctionJobs(response.results || []);
    setTotalBusinessFunctionJobs(response.count || 0);
  } catch (error) {
    console.error('Error fetching business function jobs:', error);
    showError('Error loading job descriptions');
  } finally {
    setActionLoading(false);
  }
};

// handleBusinessFunctionClick funksiyasını YENİLƏ
const handleBusinessFunctionClick = async (group) => {
  try {
    setActionLoading(true);
    

    
    // 🔥 Option 1: Use cached data from group
    if (group.jobs && group.jobs.length > 0) {
      setSelectedBusinessFunction(group);
      setBusinessFunctionJobs(group.jobs);  // ✅ Use cached data
      setTotalBusinessFunctionJobs(group.jobs.length);
      setViewMode('details');
      setSearchTerm('');
      setSelectedDepartment('');
      setSelectedStatus('');
      setCurrentPage(1);
      
      console.log('✅ Using cached jobs:', group.jobs.length);
    } else {
      // 🔥 Option 2: Try to fetch from API
      const response = await jobDescriptionService.getJobDescriptions({ 
        business_function: group.name,
        page_size: 1000  // Get all jobs
      });
      
      console.log('📡 Fetched from API:', response.results?.length);
      
      if (response.results && response.results.length > 0) {
        const updatedGroup = {
          ...group,
          jobs: response.results
        };
        
        setSelectedBusinessFunction(updatedGroup);
        setBusinessFunctionJobs(response.results);
        setTotalBusinessFunctionJobs(response.results.length);
        setViewMode('details');
        setSearchTerm('');
        setSelectedDepartment('');
        setSelectedStatus('');
        setCurrentPage(1);
      } else {
        showWarning(`You don't have access to job descriptions in ${group.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error loading business function:', error);
    showError('Error loading job descriptions');
  } finally {
    setActionLoading(false);
  }
};
// filteredJobsInBusinessFunction - Client-side pagination
const filteredJobsInBusinessFunction = useMemo(() => {
  if (!selectedBusinessFunction) return [];
  
  console.log('🔍 Filtering jobs:', {
    totalJobs: businessFunctionJobs.length,
    searchTerm,
    selectedDepartment,
    selectedStatus
  });
  
  let filtered = businessFunctionJobs;
  
  if (searchTerm) {
    filtered = filtered.filter(job =>
      job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (selectedDepartment) {
    filtered = filtered.filter(job => job.department_name === selectedDepartment);
  }
  
  if (selectedStatus) {
    filtered = filtered.filter(job => job.overall_status === selectedStatus);
  }
  
  console.log('✅ Filtered results:', filtered.length);
  
  return filtered;
}, [businessFunctionJobs, searchTerm, selectedDepartment, selectedStatus]);

// 🔥 Client-side pagination
const paginatedJobs = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filteredJobsInBusinessFunction.slice(startIndex, endIndex);
  
  console.log('📄 Pagination:', {
    currentPage,
    itemsPerPage,
    startIndex,
    endIndex,
    totalFiltered: filteredJobsInBusinessFunction.length,
    pageResults: paginated.length
  });
  
  return paginated;
}, [filteredJobsInBusinessFunction, currentPage, itemsPerPage]);

// 🔥 Update totalPages
const totalPages = Math.ceil(filteredJobsInBusinessFunction.length / itemsPerPage);






  const filterMatchingEmployees = () => {
    if (!dropdownData.employees || dropdownData.employees.length === 0) {
      setMatchingEmployees([]);
      return;
    }

    const hasBasicCriteria = formData.business_function && formData.department && 
                           formData.job_function && formData.position_group;
    
    if (!hasBasicCriteria) {
      setMatchingEmployees([]);
      return;
    }

    let filtered = dropdownData.employees.filter(employee => {
      if (formData.business_function && 
          employee.business_function_name !== formData.business_function) {
        return false;
      }

      if (formData.department && 
          employee.department_name !== formData.department) {
        return false;
      }

      if (formData.unit && 
          employee.unit_name !== formData.unit) {
        return false;
      }

      if (formData.job_function && employee.job_function_name && 
          employee.job_function_name !== formData.job_function) {
        return false;
      }

      if (formData.position_group && employee.position_group_name && 
          employee.position_group_name !== formData.position_group) {
        return false;
      }

      if (formData.grading_levels && Array.isArray(formData.grading_levels) && formData.grading_levels.length > 0) {
        if (!employee.grading_level || !formData.grading_levels.includes(employee.grading_level)) {
          return false;
        }
      } else if (formData.grading_level && employee.grading_level) {
        if (employee.grading_level !== formData.grading_level) {
          return false;
        }
      }

      if (formData.job_title && employee.job_title && 
          !employee.job_title.toLowerCase().includes(formData.job_title.toLowerCase())) {
        return false;
      }

      return true;
    });

    setMatchingEmployees(filtered);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchJobDescriptions(),
        fetchStats(),
        fetchDropdownData()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showError('Error loading initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDescriptions = async () => {
    try {
      const response = await jobDescriptionService.getJobDescriptions({ page_size: 1000 });
      setJobDescriptions(response.results || []);
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await jobDescriptionService.getJobDescriptionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const fetchOptions = (endpoint) => ({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const [
        employeesRes,
        skillGroupsRes,
        behavioralGroupsRes,
        leadershipMainGroupsRes,
        businessResourcesRes,
        accessMatrixRes,
        companyBenefitsRes
      ] = await Promise.all([
        fetch(`${baseUrl}/employees/?page_size=1000`, fetchOptions()),
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        competencyApi.leadershipMainGroups.getAll(),
        jobDescriptionService.getBusinessResources({ page_size: 1000 }),
        jobDescriptionService.getAccessMatrix({ page_size: 1000 }),
        jobDescriptionService.getCompanyBenefits({ page_size: 1000 })
      ]);

      const employees = employeesRes.ok ? await employeesRes.json() : { results: [] };
      const employeeList = employees.results || [];

      const employeeMap = new Map();
      employeeList.forEach(emp => {
        if (emp.business_function_name) {
          employeeMap.set(`bf_${emp.business_function_name}`, emp);
        }
        if (emp.department_name) {
          employeeMap.set(`dept_${emp.department_name}`, emp);
        }
        if (emp.job_function_name) {
          employeeMap.set(`jf_${emp.job_function_name}`, emp);
        }
        if (emp.position_group_name) {
          employeeMap.set(`pg_${emp.position_group_name}`, emp);
        }
      });

      setDropdownData({
        employees: employeeList,
        employeeMap: employeeMap,
        skillGroups: skillGroupsRes.results || [],
        behavioralGroups: behavioralGroupsRes.results || [],
        leadershipMainGroups: leadershipMainGroupsRes.results || [],
        businessResources: businessResourcesRes.results || [],
        accessMatrix: accessMatrixRes.results || [],
        companyBenefits: companyBenefitsRes.results || []
      });

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      showError('Error loading employee data');
    }
  };

  const fetchSkillsForGroup = async (groupId) => {
    try {
      const response = await competencyApi.skillGroups.getSkills(groupId);
      const skills = Array.isArray(response) ? response : (response.skills || response.results || []);
      setAvailableSkills(skills);
    } catch (error) {
      console.error('Error fetching skills for group:', error);
      setAvailableSkills([]);
    }
  };

  const fetchCompetenciesForGroup = async (groupId) => {
    try {
      const response = await competencyApi.behavioralGroups.getCompetencies(groupId);
      const competencies = Array.isArray(response) ? response : (response.competencies || response.results || []);
      setAvailableCompetencies(competencies);
    } catch (error) {
      console.error('Error fetching competencies for group:', error);
      setAvailableCompetencies([]);
    }
  };



  // 🔥 Back to overview
  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedBusinessFunction(null);
    setBusinessFunctionJobs([]); // 🔥 əlavə edin
    setTotalBusinessFunctionJobs(0); // 🔥 əlavə edin
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Simple page change without API call
const handlePageChange = (page) => {
  console.log('📄 Changing page to:', page);
  setCurrentPage(page);
  // No API call needed - we have all data in businessFunctionJobs
};

  // 🔥 NEW: Handle create new job
  const handleCreateNewJob = () => {
    resetForm();
    setViewMode('create');
  };

  const handleViewAssignments = async (job) => {
    try {
      setActionLoading(true);
      const response = await jobDescriptionService.getJobDescriptionAssignments(job.id);
      setAssignmentsData(response);
      setSelectedJobForAssignments(job);
      setShowAssignmentsModal(true);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showError('Error loading assignments');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitAssignmentForApproval = async (jobId, assignmentId, comments = '') => {
    try {
      setActionLoading(true);
      await jobDescriptionService.submitAssignmentForApproval(jobId, assignmentId, {
        comments: comments
      });
      showSuccess('Assignment submitted for approval');
      
      if (selectedJobForAssignments) {
        const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
        setAssignmentsData(response);
      }
      
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showError(error.response?.data?.error || 'Error submitting for approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAssignment = async (jobId, assignmentId, approverType, comments = '') => {
    try {
      setActionLoading(true);
      
      if (approverType === 'line_manager') {
        await jobDescriptionService.approveAssignmentByLineManager(jobId, assignmentId, {
          comments: comments
        });
        showSuccess('Assignment approved as line manager');
      } else {
        await jobDescriptionService.approveAssignmentAsEmployee(jobId, assignmentId, {
          comments: comments
        });
        showSuccess('Assignment approved as employee');
      }
      
      const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
      setAssignmentsData(response);
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error approving assignment:', error);
      showError(error.response?.data?.error || 'Error approving assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAssignment = async (jobId, assignmentId, reason) => {
    try {
      if (!reason || !reason.trim()) {
        showError('Please provide a reason for rejection');
        return;
      }
      
      setActionLoading(true);
      await jobDescriptionService.rejectAssignment(jobId, assignmentId, {
        reason: reason
      });
      showSuccess('Assignment rejected');
      
      const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
      setAssignmentsData(response);
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      showError(error.response?.data?.error || 'Error rejecting assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitAllAssignments = async (jobId) => {
    try {
      setActionLoading(true);
      const response = await jobDescriptionService.submitAllAssignmentsForApproval(jobId);
      showSuccess(response.message || 'All assignments submitted for approval');
      
      if (selectedJobForAssignments) {
        const assignmentsResponse = await jobDescriptionService.getJobDescriptionAssignments(jobId);
        setAssignmentsData(assignmentsResponse);
      }
      
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error submitting all assignments:', error);
      showError(error.response?.data?.error || 'Error submitting assignments');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAssignment = async (jobId, assignmentId) => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Remove Assignment',
      message: 'Are you sure you want to remove this assignment? The employee will be unassigned from this job description.',
      onConfirm: async () => {
        try {
          setConfirmModal({ ...confirmModal, loading: true });
          await jobDescriptionService.removeAssignment(jobId, assignmentId);
          showSuccess('Assignment removed');
          
          const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
          setAssignmentsData(response);
          await fetchJobDescriptions();
          await fetchStats();
          
          setConfirmModal({ ...confirmModal, isOpen: false, loading: false });
        } catch (error) {
          console.error('Error removing assignment:', error);
          showError('Error removing assignment');
          setConfirmModal({ ...confirmModal, loading: false });
        }
      }
    });
  };

  const handleReassignEmployee = async (assignmentId) => {
    showInfo('Reassignment feature coming soon');
  };

  const handleRefreshAssignments = async () => {
    if (!selectedJobForAssignments) return;
    
    try {
      setActionLoading(true);
      const response = await jobDescriptionService.getJobDescriptionAssignments(selectedJobForAssignments.id);
      setAssignmentsData(response);
    } catch (error) {
      console.error('Error refreshing assignments:', error);
      showError('Error refreshing assignments');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadSinglePDF = async (jobId) => {
    try {
      setActionLoading(true);
      await jobDescriptionService.downloadJobDescriptionPDF(jobId);
      showSuccess('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading job description PDF:', error);
      showError('Error downloading PDF. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectSubmissionForApproval = async (jobId) => {
    setCreatedJobsData({ id: jobId, isExisting: true });
    setIsExistingJobSubmission(true);
    setShowSubmissionModal(true);
  };

  const handleSubmitForApproval = async () => {
    if (!createdJobsData) return;

    try {
      setSubmissionLoading(true);
      
      if (createdJobsData.isExisting) {
        await jobDescriptionService.submitAllAssignmentsForApproval(createdJobsData.id);
        showSuccess('All assignments submitted for approval!');
      } else {
        const jobId = createdJobsData.id || createdJobsData.job_description_id;
        await jobDescriptionService.submitAllAssignmentsForApproval(jobId);
        showSuccess('Job description and assignments submitted for approval!');
      }
      
      await fetchJobDescriptions();
      await fetchStats();
      setShowSubmissionModal(false);
      setSubmissionComments('');
      setCreatedJobsData(null);
      setIsExistingJobSubmission(false);
      resetForm();
      
      setViewMode('overview');
    } catch (error) {
      console.error('Error submitting for approval:', error);
      showError(error.response?.data?.error || 'Error submitting for approval. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleKeepAsDraft = async () => {
    const totalAssignments = createdJobsData?.total_assignments || 
                            createdJobsData?.assignments_created?.length || 1;
    
    const message = totalAssignments > 1 
      ? `Job description with ${totalAssignments} assignments saved as draft!`
      : 'Job description saved as draft!';
    
    showSuccess(message);
    
    await fetchJobDescriptions();
    await fetchStats();

    setShowSubmissionModal(false);
    setSubmissionComments('');
    setCreatedJobsData(null);
    setIsExistingJobSubmission(false);
    resetForm();
    
    setViewMode('overview');
  };

  // pages/structure/job-descriptions/page.jsx - COMPLETE handleEdit with Hierarchical ID Conversion

const handleEdit = async (job) => {
  try {
    setActionLoading(true);
    const fullJob = await jobDescriptionService.getJobDescription(job.id);
    
    // Extract sections
    const criticalDuties = [];
    const positionMainKpis = [];
    const jobDuties = [];
    const requirements = [];
    
    if (fullJob.sections && Array.isArray(fullJob.sections)) {
      fullJob.sections.forEach(section => {
        const content = section.content || '';
        const lines = content.split('\n')
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(line => line);
        
        switch(section.section_type) {
          case 'CRITICAL_DUTIES':
            criticalDuties.push(...lines);
            break;
          case 'MAIN_KPIS':
            positionMainKpis.push(...lines);
            break;
          case 'JOB_DUTIES':
            jobDuties.push(...lines);
            break;
          case 'REQUIREMENTS':
            requirements.push(...lines);
            break;
        }
      });
    }
    
    // 🔥 HELPER: Convert Resources/Access/Benefits IDs to hierarchical format with prefix
    const extractResourceIds = (resourceArray, prefix) => {
      const allIds = [];
      if (!Array.isArray(resourceArray)) return [];
      
      resourceArray.forEach(item => {
        const parentId = item.resource || item.access_matrix || item.benefit || 
                        item.resource_id || item.access_matrix_id || item.benefit_id;
        
        if (item.specific_items_detail && Array.isArray(item.specific_items_detail) && item.specific_items_detail.length > 0) {
          // Has specific child items
          item.specific_items_detail.forEach(childItem => {
            if (childItem.id && parentId) {
              allIds.push(`${prefix}_${parentId}_${childItem.id}`);
            }
          });
        } else if (item.specific_items && Array.isArray(item.specific_items) && item.specific_items.length > 0) {
          // Has specific items (legacy format)
          item.specific_items.forEach(childItem => {
            const childId = typeof childItem === 'object' ? childItem.id : childItem;
            if (childId && parentId) {
              allIds.push(`${prefix}_${parentId}_${childId}`);
            }
          });
        } else {
          // Parent only (no specific items)
          if (parentId) {
            allIds.push(`${prefix}_${parentId}`);
          }
        }
      });
      
      return allIds;
    };
    
    // Extract resource IDs with prefixes
    const businessResourceIds = extractResourceIds(fullJob.business_resources, 'res');
    const accessRightIds = extractResourceIds(fullJob.access_rights, 'acc');
    const companyBenefitIds = extractResourceIds(fullJob.company_benefits, 'ben');
    
    console.log('📦 Extracted Resource IDs:', {
      business: businessResourceIds,
      access: accessRightIds,
      benefits: companyBenefitIds
    });
    
    // 🔥 CONVERT SKILL IDs to hierarchical format
    const convertSkillIds = async (skillIds) => {
      if (!skillIds || skillIds.length === 0) return [];
      
      const hierarchicalIds = [];
      const competencyApi = (await import('@/services/competencyApi')).default;
      
      // Load all skill groups and their skills
      const skillGroups = dropdownData.skillGroups || [];
      
      console.log('🔍 Converting skills:', { skillIds, availableGroups: skillGroups.length });
      
      for (const groupData of skillGroups) {
        try {
          const response = await competencyApi.skillGroups.getSkills(groupData.id);
          const skills = Array.isArray(response) ? response : (response.skills || response.results || []);
          
          skills.forEach(skill => {
            if (skillIds.includes(String(skill.id))) {
              // Format: groupId_skillId
              const hierarchicalId = `${groupData.id}_${skill.id}`;
              hierarchicalIds.push(hierarchicalId);
              console.log(`✅ Matched skill ${skill.id} (${skill.name}) → ${hierarchicalId}`);
            }
          });
        } catch (error) {
          console.error(`❌ Error loading skills for group ${groupData.id}:`, error);
        }
      }
      
      return hierarchicalIds;
    };
    
    // 🔥 CONVERT BEHAVIORAL COMPETENCY IDs to hierarchical format
    const convertBehavioralIds = async (compIds) => {
      if (!compIds || compIds.length === 0) return [];
      
      const hierarchicalIds = [];
      const competencyApi = (await import('@/services/competencyApi')).default;
      
      const behavioralGroups = dropdownData.behavioralGroups || [];
      
      console.log('🔍 Converting behavioral competencies:', { compIds, availableGroups: behavioralGroups.length });
      
      for (const groupData of behavioralGroups) {
        try {
          const response = await competencyApi.behavioralGroups.getCompetencies(groupData.id);
          const competencies = Array.isArray(response) ? response : (response.competencies || response.results || []);
          
          competencies.forEach(comp => {
            if (compIds.includes(String(comp.id))) {
              // Format: groupId_compId
              const hierarchicalId = `${groupData.id}_${comp.id}`;
              hierarchicalIds.push(hierarchicalId);
              console.log(`✅ Matched behavioral competency ${comp.id} (${comp.name}) → ${hierarchicalId}`);
            }
          });
        } catch (error) {
          console.error(`❌ Error loading competencies for group ${groupData.id}:`, error);
        }
      }
      
      return hierarchicalIds;
    };
    
    // 🔥 CONVERT LEADERSHIP COMPETENCY IDs to hierarchical format (3-level)
    const convertLeadershipIds = async (itemIds) => {
      if (!itemIds || itemIds.length === 0) return [];
      
      const hierarchicalIds = [];
      const competencyApi = (await import('@/services/competencyApi')).default;
      
      const leadershipMainGroups = dropdownData.leadershipMainGroups || [];
      
      console.log('🔍 Converting leadership competencies:', { itemIds, availableMainGroups: leadershipMainGroups.length });
      
      for (const mainGroup of leadershipMainGroups) {
        try {
          // Get child groups for this main group
          const childGroupsResponse = await competencyApi.leadershipMainGroups.getChildGroups(mainGroup.id);
          const childGroups = Array.isArray(childGroupsResponse) 
            ? childGroupsResponse 
            : (childGroupsResponse.child_groups || childGroupsResponse.results || []);
          
          console.log(`📂 Main group ${mainGroup.id} (${mainGroup.name}) has ${childGroups.length} child groups`);
          
          for (const childGroup of childGroups) {
            try {
              // Get items in child group
              const itemsResponse = await competencyApi.leadershipChildGroups.getItems(childGroup.id);
              const items = Array.isArray(itemsResponse) 
                ? itemsResponse 
                : (itemsResponse.items || itemsResponse.results || []);
              
              items.forEach(item => {
                if (itemIds.includes(String(item.id))) {
                  // Format: mainGroupId_childGroupId_itemId
                  const hierarchicalId = `${mainGroup.id}_${childGroup.id}_${item.id}`;
                  hierarchicalIds.push(hierarchicalId);
                  console.log(`✅ Matched leadership item ${item.id} (${item.name}) → ${hierarchicalId}`);
                }
              });
            } catch (error) {
              console.error(`❌ Error loading items for child group ${childGroup.id}:`, error);
            }
          }
        } catch (error) {
          console.error(`❌ Error loading child groups for main group ${mainGroup.id}:`, error);
        }
      }
      
      return hierarchicalIds;
    };
    
    // Extract simple IDs from API response
    const skillIds = [];
    if (fullJob.required_skills && Array.isArray(fullJob.required_skills)) {
      fullJob.required_skills.forEach(skill => {
        const id = skill.skill_id || skill.skill || skill.skill_detail?.id;
        if (id) skillIds.push(String(id));
      });
    }
    
    const behavioralCompetencyIds = [];
    if (fullJob.behavioral_competencies && Array.isArray(fullJob.behavioral_competencies)) {
      fullJob.behavioral_competencies.forEach(comp => {
        const id = comp.competency_id || comp.competency || comp.competency_detail?.id;
        if (id) behavioralCompetencyIds.push(String(id));
      });
    }
    
    const leadershipCompetencyIds = [];
    if (fullJob.leadership_competencies && Array.isArray(fullJob.leadership_competencies)) {
      fullJob.leadership_competencies.forEach(item => {
        const id = item.leadership_item_id || item.leadership_item || item.leadership_item_detail?.id || item.id;
        if (id) leadershipCompetencyIds.push(String(id));
      });
    }
    
    console.log('📋 Extracted simple IDs:', {
      skills: skillIds,
      behavioral: behavioralCompetencyIds,
      leadership: leadershipCompetencyIds
    });
    
    // 🔥 CONVERT to hierarchical format
    const [
      hierarchicalSkillIds,
      hierarchicalBehavioralIds,
      hierarchicalLeadershipIds
    ] = await Promise.all([
      convertSkillIds(skillIds),
      convertBehavioralIds(behavioralCompetencyIds),
      convertLeadershipIds(leadershipCompetencyIds)
    ]);
    
    console.log('🔄 Converted to hierarchical IDs:', {
      skills: { 
        original: skillIds, 
        hierarchical: hierarchicalSkillIds,
        count: hierarchicalSkillIds.length 
      },
      behavioral: { 
        original: behavioralCompetencyIds, 
        hierarchical: hierarchicalBehavioralIds,
        count: hierarchicalBehavioralIds.length 
      },
      leadership: { 
        original: leadershipCompetencyIds, 
        hierarchical: hierarchicalLeadershipIds,
        count: hierarchicalLeadershipIds.length 
      }
    });
    
    // Extract grading levels
    let gradingLevels = [];
    if (fullJob.grading_levels && Array.isArray(fullJob.grading_levels) && fullJob.grading_levels.length > 0) {
      gradingLevels = fullJob.grading_levels;
    } else if (fullJob.grading_level) {
      gradingLevels = [fullJob.grading_level];
    }
    
    // Helper to extract field value
    const getFieldValue = (field) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      if (typeof field === 'object') return field.name || field.display_name || '';
      return String(field);
    };
    
    // Build transformed data
    const transformedData = {
      job_title: fullJob.job_title || '',
      job_purpose: fullJob.job_purpose || '',
      business_function: getFieldValue(fullJob.business_function),
      department: getFieldValue(fullJob.department),
      unit: getFieldValue(fullJob.unit),
      job_function: getFieldValue(fullJob.job_function),
      position_group: getFieldValue(fullJob.position_group),
      grading_level: fullJob.grading_level || (gradingLevels.length > 0 ? gradingLevels[0] : ''),
      grading_levels: gradingLevels,
      
      // Sections
      criticalDuties: criticalDuties.length > 0 ? criticalDuties : [''],
      positionMainKpis: positionMainKpis.length > 0 ? positionMainKpis : [''],
      jobDuties: jobDuties.length > 0 ? jobDuties : [''],
      requirements: requirements.length > 0 ? requirements : [''],
      
      // 🔥 USE HIERARCHICAL IDs for skills and competencies
      required_skills_data: hierarchicalSkillIds,
      behavioral_competencies_data: hierarchicalBehavioralIds,
      leadership_competencies_data: hierarchicalLeadershipIds,
      
      // Resources with prefixes
      business_resources_ids: businessResourceIds,
      access_rights_ids: accessRightIds,
      company_benefits_ids: companyBenefitIds
    };
    
    console.log('✅ Final transformed data for edit:', {
      basic: {
        job_title: transformedData.job_title,
        business_function: transformedData.business_function,
        department: transformedData.department,
        position_group: transformedData.position_group
      },
      skills: transformedData.required_skills_data.length,
      behavioral: transformedData.behavioral_competencies_data.length,
      leadership: transformedData.leadership_competencies_data.length,
      resources: transformedData.business_resources_ids.length,
      access: transformedData.access_rights_ids.length,
      benefits: transformedData.company_benefits_ids.length
    });
    
    setFormData(transformedData);
    setEditingJob(fullJob);
    
    if (transformedData.position_group) {
      setSelectedPositionGroup(transformedData.position_group);
    }
    
    setViewMode('create');
    
  } catch (error) {
    console.error('❌ Error loading job for edit:', error);
    showError('Error loading job description. Please try again.');
  } finally {
    setActionLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      job_title: '',
      job_purpose: '',
      business_function: '',
      department: '',
      unit: '',
      job_function: '',
      position_group: '',
      grading_level: '',
      grading_levels: [],
      criticalDuties: [''],
      positionMainKpis: [''],
      jobDuties: [''],
      requirements: [''],
      required_skills_data: [],
      behavioral_competencies_data: [],
      leadership_competencies_data: [],
      business_resources_ids: [],
      access_rights_ids: [],
      company_benefits_ids: []
    });
    
    setEditingJob(null);
    setSelectedSkillGroup('');
    setSelectedBehavioralGroup('');
    setSelectedPositionGroup('');
    setAvailableSkills([]);
    setAvailableCompetencies([]);
    setMatchingEmployees([]);
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Job Description',
      message: 'Are you sure you want to delete this job description? This will remove all assignments. This action cannot be undone.',
      onConfirm: async () => {
        try {
          setConfirmModal({ ...confirmModal, loading: true });
          
          await jobDescriptionService.deleteJobDescription(id);
          await fetchJobDescriptions();
          await fetchStats();
          
          setConfirmModal({ ...confirmModal, isOpen: false, loading: false });
          showSuccess('Job description deleted successfully!');
        } catch (error) {
          console.error('Error deleting job description:', error);
          setConfirmModal({ ...confirmModal, loading: false });
          showError('Error deleting job description. Please try again.');
        }
      }
    });
  };

  const handleViewJob = async (job) => {
    try {
      setActionLoading(true);
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      setSelectedJob(fullJob);
    } catch (error) {
      console.error('Error loading job for view:', error);
      showError('Error loading job description details. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJobSubmit = (createdJob) => {
    setCreatedJobsData(createdJob);
    setIsExistingJobSubmission(false);
    setShowSubmissionModal(true);
  };

  const closeConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ALL_APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING_APPROVALS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ALL_DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'HAS_REJECTIONS':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} transition-colors duration-300`}>
        <div className="mx-auto p-4 lg:p-6">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
              <div className="flex-1">
                {/* Back button if in details or create mode */}
                {(viewMode === 'details' || viewMode === 'create') && (
                  <button
                    onClick={handleBackToOverview}
                    className="flex items-center gap-2 text-almet-sapphire hover:text-almet-astral font-medium mb-4 transition-colors"
                  >
                    <ArrowLeft size={20} />
                    <span>Back to Overview</span>
                  </button>
                )}
                
                <h1 className={`text-xl lg:text-2xl font-bold ${textPrimary} mb-2`}>
                  {viewMode === 'overview' && 'Job Descriptions Overview'}
                  {viewMode === 'details' && selectedBusinessFunction?.name}
                  {viewMode === 'create' && (editingJob ? 'Edit Job Description' : 'Create New Job Description')}
                </h1>
                <p className={`${textSecondary} text-xs lg:text-base leading-relaxed`}>
                  {viewMode === 'overview' && 'Select a business function to view job descriptions'}
                  {viewMode === 'details' && `${filteredJobsInBusinessFunction.length} job descriptions in ${selectedBusinessFunction?.name}`}
                  {viewMode === 'create' && (editingJob ? 'Update job description details' : 'Create and assign job descriptions to employees')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
  {viewMode === 'overview' && userAccess?.is_admin && (
    <button
      onClick={handleCreateNewJob}
      className="flex items-center justify-center gap-2 px-5 py-3 bg-almet-sapphire hover:bg-almet-astral 
        text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
    >
      <Plus size={16} />
      <span>Create New</span>
    </button>
  )}
  {userAccess?.is_admin && (
    <button
      onClick={() => router.push('/structure/job-descriptions/JobDescriptionSettings/')}
      className={`flex items-center justify-center gap-2 px-5 py-3 
        ${darkMode 
          ? 'bg-almet-comet hover:bg-almet-san-juan border-almet-san-juan/50 text-almet-bali-hai hover:text-white' 
          : 'bg-white hover:bg-almet-mystic border-gray-200 text-almet-waterloo hover:text-almet-cloud-burst'
        } 
        border rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md`}
    >
      <Settings size={16} />
      <span className="hidden sm:inline">Settings</span>
    </button>
  )}
</div>
            </div>

            {/* Stats Cards - Only show in overview */}
            {viewMode === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard 
                  title="Total Jobs" 
                  value={stats.total_job_descriptions || 0} 
                  subtitle={`${stats.total_assignments || 0} assignments`}
                  icon={FileText}
                  color="almet-sapphire"
                  darkMode={darkMode}
                />
                <StatCard 
                  title="Pending Approvals" 
                  value={stats.pending_approvals?.total || 0} 
                  subtitle="Requires attention"
                  icon={Clock}
                  color="yellow-600"
                  darkMode={darkMode}
                />
                <StatCard 
                  title="Approved" 
                  value={stats.assignment_status_breakdown?.Approved || 0} 
                  subtitle="Assignments approved"
                  icon={CheckCircle}
                  color="green-600"
                  darkMode={darkMode}
                />
                <StatCard 
                  title="Draft Assignments" 
                  value={stats.assignment_status_breakdown?.Draft || 0} 
                  subtitle="Assignments in draft"
                  icon={Users}
                  color="gray-600"
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            
            {/* 🔥 OVERVIEW MODE - Business Function Cards */}
            {viewMode === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessFunctionGroups.map((group, index) => (
                  <div
                    key={index}
                    onClick={() => handleBusinessFunctionClick(group)}
                    className={`${bgCard} rounded-xl p-6 border ${borderColor} 
                      hover:shadow-lg hover:border-almet-sapphire/30 transition-all duration-200 cursor-pointer group`}
                  >
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-almet-sapphire/10 text-almet-sapphire p-3 rounded-xl group-hover:scale-110 transition-transform">
                          <Building size={24} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${textPrimary} group-hover:text-almet-sapphire transition-colors`}>
                            {group.name}
                          </h3>
                          <p className={`text-sm ${textMuted}`}>
                            {group.departments.length} department{group.departments.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`${textMuted} group-hover:text-almet-sapphire group-hover:translate-x-1 transition-all`} size={20} />
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textSecondary} flex items-center gap-2`}>
                          <FileText size={16} />
                          Total Jobs
                        </span>
                        <span className={`font-bold ${textPrimary}`}>{group.totalJobs}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textSecondary} flex items-center gap-2`}>
                          <Users size={16} />
                          Assignments
                        </span>
                        <span className={`font-bold ${textPrimary}`}>{group.totalAssignments}</span>
                      </div>

                      {/* Approval Progress */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textSecondary} flex items-center gap-2`}>
                          <CheckCircle size={16} />
                          Approved
                        </span>
                        <span className={`font-bold text-green-600`}>
                          {group.approvedCount}/{group.totalAssignments}
                        </span>
                      </div>

                      {/* Status breakdown */}
                      <div className="pt-3 border-t border-gray-200 dark:border-almet-comet">
                        <div className="flex items-center gap-2 flex-wrap">
                          {group.approvedJobs > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                              {group.approvedJobs} Approved
                            </span>
                          )}
                          {group.pendingJobs > 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium">
                              {group.pendingJobs} Pending
                            </span>
                          )}
                          {group.draftJobs > 0 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 rounded-full text-xs font-medium">
                              {group.draftJobs} Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🔥 DETAILS MODE - Filtered Job List */}
            {viewMode === 'details' && selectedBusinessFunction && (
              <div className="space-y-6">
                {userAccess && !userAccess.is_admin && (
      <div className={`${bgCard} rounded-xl p-4 border ${borderColor} shadow-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {userAccess.is_manager ? (
              <Users className="text-blue-600" size={20} />
            ) : (
              <User className="text-gray-600" size={20} />
            )}
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-semibold ${textPrimary} mb-1`}>
              {userAccess.access_level}
            </h4>
            <p className={`text-xs ${textMuted}`}>
              {userAccess.is_manager 
                ? `You can view ${userAccess.accessible_count} job description(s) for your team members` 
                : 'You can only view your own job description'}
            </p>
          </div>
        </div>
      </div>
    )}
                {/* Filter Panel */}
                <div className={`${bgCard} rounded-xl p-6 border ${borderColor} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-almet-sapphire" />
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>Filters</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={16} />
                      <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                          focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textMuted} hover:${textPrimary}`}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Department Filter */}
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className={`px-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                        focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                    >
                      <option value="">All Departments</option>
                      {selectedBusinessFunction.departments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className={`px-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                        focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                    >
                      <option value="">All Statuses</option>
                      <option value="ALL_APPROVED">Approved</option>
                      <option value="PENDING_APPROVALS">Pending</option>
                      <option value="ALL_DRAFT">Draft</option>
                      <option value="HAS_REJECTIONS">Has Rejections</option>
                    </select>
                  </div>

                  {/* Active Filters Display */}
                  {(searchTerm || selectedDepartment || selectedStatus) && (
                    <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm ${textMuted}`}>Active filters:</span>
                        {searchTerm && (
                          <span className="px-3 py-1 bg-almet-sapphire/10 text-almet-sapphire rounded-full text-xs font-medium flex items-center gap-1">
                            Search: {searchTerm}
                            <button onClick={() => setSearchTerm('')} className="hover:text-almet-astral">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        {selectedDepartment && (
                          <span className="px-3 py-1 bg-almet-sapphire/10 text-almet-sapphire rounded-full text-xs font-medium flex items-center gap-1">
                            Dept: {selectedDepartment}
                            <button onClick={() => setSelectedDepartment('')} className="hover:text-almet-astral">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        {selectedStatus && (
                          <span className="px-3 py-1 bg-almet-sapphire/10 text-almet-sapphire rounded-full text-xs font-medium flex items-center gap-1">
                            Status: {selectedStatus.replace('_', ' ')}
                            <button onClick={() => setSelectedStatus('')} className="hover:text-almet-astral">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedDepartment('');
                            setSelectedStatus('');
                          }}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <JobDescriptionList
  filteredJobs={paginatedJobs}  // 🔥 Use paginatedJobs
  searchTerm={searchTerm}
  selectedDepartment={selectedDepartment}
  dropdownData={dropdownData}
  onSearchChange={setSearchTerm}
  onDepartmentChange={setSelectedDepartment}
  onJobSelect={handleViewJob}
  userAccess={userAccess}
  onJobEdit={handleEdit}
  onJobDelete={handleDelete}
  onViewAssignments={handleViewAssignments}
  onDirectSubmission={handleDirectSubmissionForApproval}
  onDownloadPDF={handleDownloadSinglePDF}
  actionLoading={actionLoading}
  darkMode={darkMode}
/>

{totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={filteredJobsInBusinessFunction.length}  // 🔥 Filtered count
    itemsPerPage={itemsPerPage}
    onPageChange={handlePageChange}
    darkMode={darkMode}
  />
)}
              </div>
            )}

            {/* 🔥 CREATE MODE - Job Form */}
            {viewMode === 'create' && (
              <div className="space-y-4">
                <JobDescriptionForm
                  formData={formData}
                  editingJob={editingJob}
                  dropdownData={dropdownData}
                  selectedSkillGroup={selectedSkillGroup}
                  selectedBehavioralGroup={selectedBehavioralGroup}
                  availableSkills={availableSkills}
                  availableCompetencies={availableCompetencies}
                  selectedPositionGroup={selectedPositionGroup}
                  matchingEmployees={matchingEmployees}
                  actionLoading={actionLoading}
                  onFormDataChange={setFormData}
                  onSkillGroupChange={setSelectedSkillGroup}
                  onBehavioralGroupChange={setSelectedBehavioralGroup}
                  onPositionGroupChange={setSelectedPositionGroup}
                  onSubmit={handleJobSubmit}
                  onCancel={() => {
                    resetForm();
                    handleBackToOverview();
                  }}
                  onUpdate={() => {
                    fetchJobDescriptions();
                    fetchStats();
                    resetForm();
                    handleBackToOverview();
                  }}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          {/* Job View Modal */}
          {selectedJob && (
            <JobViewModal
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              onDownloadPDF={() => handleDownloadSinglePDF(selectedJob.id)}
              onViewAssignments={() => {
                setSelectedJob(null);
                handleViewAssignments(selectedJob);
              }}
              darkMode={darkMode}
            />
          )}

          {/* Assignments Modal */}
          {showAssignmentsModal && assignmentsData && selectedJobForAssignments && (
            <AssignmentsModal
              isOpen={showAssignmentsModal}
              onClose={() => {
                setShowAssignmentsModal(false);
                setSelectedJobForAssignments(null);
                setAssignmentsData(null);
              }}
              job={selectedJobForAssignments}
              assignmentsData={assignmentsData}
              onSubmitAssignment={handleSubmitAssignmentForApproval}
              onSubmitAll={handleSubmitAllAssignments}
              onApprove={handleApproveAssignment}
              onReject={handleRejectAssignment}
              onRemoveAssignment={handleRemoveAssignment}
              onReassignEmployee={handleReassignEmployee}
              onRefresh={handleRefreshAssignments}
              currentUser={{ id: 1 }}
              userAccess={userAccess}
              actionLoading={actionLoading}
            />
          )}

          {/* Submission Modal */}
          {showSubmissionModal && (
            <SubmissionModal
              createdJobsData={createdJobsData}
              isExistingJobSubmission={isExistingJobSubmission}
              submissionComments={submissionComments}
              submissionLoading={submissionLoading}
              onCommentsChange={setSubmissionComments}
              onSubmitForApproval={handleSubmitForApproval}
              onKeepAsDraft={handleKeepAsDraft}
              onClose={() => {
                setShowSubmissionModal(false);
                setSubmissionComments('');
                setCreatedJobsData(null);
                setIsExistingJobSubmission(false);
              }}
              darkMode={darkMode}
            />
          )}

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            loading={confirmModal.loading}
            darkMode={darkMode}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

// Wrap with ToastProvider
const JobDescriptionPage = () => {
  return (
    <ToastProvider>
      <JobDescriptionPageContent />
    </ToastProvider>
  );
};

export default JobDescriptionPage;