"use client";
import { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle, FileText,CalendarIcon , Users, TrendingUp, Settings, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Layout & Common
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import PlanningVacationTab from '@/components/vacation/PlanningVacationTab';

import { VacationService, VacationHelpers } from '@/services/vacationService';
import { referenceDataService } from "@/services/vacantPositionsService";

// Modals
import { ApprovalModal } from '@/components/business-trip/ApprovalModal';
import { RejectionModal } from '@/components/business-trip/RejectionModal';
import { AttachmentsModal } from '@/components/vacation/AttachmentsModal';
import { RequestDetailModal } from '@/components/vacation/RequestDetailModal';
import { ConflictErrorModal } from '@/components/vacation/ConflictErrorModal';
import { ScheduleDetailModal } from '@/components/vacation/ScheduleDetailModal';
import VacationCalendar from '@/components/vacation/VacationCalendar';
import BalancesTabContent from '@/components/vacation/BalancesTabContent';

// Components
import VacationStats from '@/components/vacation/VacationStats';
import VacationRequestForm from '@/components/vacation/VacationRequestForm';

import ApprovalSection from '@/components/vacation/ApprovalSection';
import MyRecordsTable from '@/components/vacation/MyRecordsTable';
import AllRecordsTable from '@/components/vacation/AllRecordsTable';
import EditScheduleModal from '@/components/vacation/EditScheduleModal';
import jobDescriptionService from '@/services/jobDescriptionService';
import MySchedulesTab from '@/components/vacation/MySchedulesTab';

export default function VacationRequestsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('request');
  const [activeSection, setActiveSection] = useState('immediate');
  const [requester, setRequester] = useState('for_me');
  const [schedulesTab, setSchedulesTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  
  // User Access State - Similar to Job Description
  const [userAccess, setUserAccess] = useState({
    can_view_all: false,
    is_manager: false,
    is_admin: false,
    is_employee: true,
    access_level: '',
    accessible_count: 0,
    employee_id: null,
    employee_name: ''
  });
  
  // Data states
  const [balances, setBalances] = useState(null);
  const [vacationTypes, setVacationTypes] = useState([]);
  const [hrRepresentatives, setHrRepresentatives] = useState([]);
  const [scheduleTabs, setScheduleTabs] = useState({ upcoming: [], peers: [], all: [] });
  const [pendingRequests, setPendingRequests] = useState({ line_manager_requests: [], hr_requests: [] });
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [myAllRecords, setMyAllRecords] = useState([]);
  const [allVacationRecords, setAllVacationRecords] = useState([]);
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [businessFunctions, setBusinessFunctions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [vacationSettings, setVacationSettings] = useState({
    allow_negative_balance: false,
    max_schedule_edits: 3,
    notification_days_before: 7,
    notification_frequency: 2
  });
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showScheduleDetailModal, setShowScheduleDetailModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [conflictData, setConflictData] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isUKEmployee, setIsUKEmployee] = useState(false);
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState('');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    vacation_type_id: '',
    department_id: '',
    business_function_id: '',
    start_date: '',
    end_date: '',
    employee_name: '',
    year: ''
  });

  // Form states
  const [formErrors, setFormErrors] = useState({
    start_date: '',
    end_date: ''
  });
  
  const [formData, setFormData] = useState({
    requester_type: 'for_me',
    employeeName: '',
    businessFunction: '',
    department: '',
    unit: '',
    jobFunction: '',
    phoneNumber: '',
    vacation_type_id: '',
    start_date: '',
    end_date: '',
    dateOfReturn: '',
    numberOfDays: 0,
    comment: '',
    employee_id: null,
    employee_manual: null,
    hr_representative_id: null,
    line_manager: '',
    // ✅ Half day fields
    is_half_day: false,
    half_day_start_time: '',
    half_day_end_time: ''
  });

  // Fetch User Access Info - Similar to Job Description
  const fetchUserAccess = async () => {
    try {
      setAccessLoading(true);
      const accessInfo = await jobDescriptionService.getMyAccessInfo();
      setUserAccess(accessInfo);
    } catch (error) {
      console.error('Error fetching user access:', error);
      showError('Failed to load access information');
    } finally {
      setAccessLoading(false);
    }
  };
  


  // Initialize data
  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserAccess(),
        fetchDashboard(),
        fetchVacationTypes(),
        fetchHRRepresentatives(),
        fetchVacationSettings(),
        fetchReferenceData()
      ]);
    } catch (error) {
      console.error('Initialization error:', error);
      showError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = useCallback(async () => {
    try {
      const result = await referenceDataService.getAllReferenceData();
      if (result.success) {
        setBusinessFunctions(result.data.businessFunctions || []);
        setDepartments(result.data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
    }
  }, []);

  const fetchVacationSettings = async () => {
    try {
      const data = await VacationService.getGeneralSettings();
      setVacationSettings(data);
    } catch (error) {
      console.error('Settings fetch error:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await VacationService.getDashboard();
      setBalances(data.balance);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const fetchVacationTypes = async () => {
    try {
      const data = await VacationService.getVacationTypesFiltered();
      setVacationTypes(data.types || []);
      setIsUKEmployee(data.is_uk_employee || false);
      
      if (data.types?.length > 0) {
        setFormData(prev => ({ ...prev, vacation_type_id: data.types[0].id }));
      }
    } catch (error) {
      console.error('Vacation types fetch error:', error);
    }
  };

  const fetchHRRepresentatives = async () => {
    try {
      const data = await VacationService.getHRRepresentatives();
      setHrRepresentatives(data.hr_representatives || []);
      if (data.current_default) {
        setFormData(prev => ({ ...prev, hr_representative_id: data.current_default.id }));
      }
    } catch (error) {
      console.error('HR representatives fetch error:', error);
    }
  };

  // VacationRequestsPage.jsx-də fetchScheduleTabs funksiyasını tapın və dəyişin:

const fetchScheduleTabs = async () => {
 
  try {
    const data = await VacationService.getScheduleTabs();

    setScheduleTabs(data);
  } catch (error) {
    console.error('Schedule tabs fetch error:', error);
  }
};

  const fetchPendingRequests = async () => {
    try {
      const data = await VacationService.getPendingRequests();
      setPendingRequests(data);
    } catch (error) {
      console.error('Pending requests fetch error:', error);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const data = await VacationService.getApprovalHistory();
      setApprovalHistory(data.history || []);
    } catch (error) {
      console.error('Approval history fetch error:', error);
    }
  };

  const fetchMyAllRecords = async () => {
    try {
      const data = await VacationService.getMyAllVacations();
      const mappedRecords = data.records?.map(record => ({
        ...record,
        attachments_count: record.attachments?.length || 0
      })) || [];
      setMyAllRecords(mappedRecords);
    } catch (error) {
      console.error('My records fetch error:', error);
    }
  };

  const fetchAllVacationRecords = async () => {
    try {
      const data = await VacationService.getAllVacationRecords(filters);
      setAllVacationRecords(data.records || []);
    } catch (error) {
      console.error('All records fetch error:', error);
    }
  };

  const handleEmployeeSearch = async () => {
    try {
      const data = await VacationService.searchEmployees();
      setEmployeeSearchResults(data.results || []);
    } catch (error) {
      console.error('Employee search error:', error);
    }
  };

  // Date handlers
  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate < today) {
      setFormErrors(prev => ({
        ...prev,
        start_date: 'Start date cannot be in the past'
      }));
      return;
    }
    
    setFormErrors(prev => ({ ...prev, start_date: '' }));
    
    if (formData.end_date && selectedDate > formData.end_date) {
      setFormErrors(prev => ({
        ...prev,
        end_date: 'End date must be after start date'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, end_date: '' }));
    }
    
    setFormData(prev => ({ ...prev, start_date: selectedDate }));
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (formData.start_date && selectedDate < formData.start_date) {
      setFormErrors(prev => ({
        ...prev,
        end_date: 'End date must be after start date'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, end_date: '' }));
    }
    
    setFormData(prev => ({ ...prev, end_date: selectedDate }));
  };

  const calculateWorkingDays = async (startDate, endDate, businessFunctionCode = null) => {
    if (!startDate || !endDate) return 0;
    
    try {
      const data = await VacationService.calculateWorkingDays({ 
        start_date: startDate, 
        end_date: endDate,
        business_function_code: businessFunctionCode // ✅ NEW
      });
      return data.working_days || 0;
    } catch (error) {
      console.error('Working days calculation error:', error);
      return 0;
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formErrors.start_date || formErrors.end_date) {
    showError('Please fix the date errors before submitting');
    return;
  }

  // ✅ Half day validation with time format check
  if (formData.is_half_day) {
    // Check if times are provided
    if (!formData.half_day_start_time || !formData.half_day_end_time) {
      showError('Half day requests require start and end time');
      return;
    }
    
    // ✅ Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    
    if (!timeRegex.test(formData.half_day_start_time)) {
      showError('Invalid start time format. Use HH:MM (e.g., 09:00)');
      return;
    }
    
    if (!timeRegex.test(formData.half_day_end_time)) {
      showError('Invalid end time format. Use HH:MM (e.g., 13:00)');
      return;
    }
    
    // ✅ Check if start time < end time
    const [startHour, startMin] = formData.half_day_start_time.split(':').map(Number);
    const [endHour, endMin] = formData.half_day_end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      showError('Start time must be before end time');
      return;
    }
    
    // ✅ Check minimum duration (optional - at least 2 hours)
    const durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 120) {
      showError('Half day must be at least 2 hours duration');
      return;
    }
    
    // ✅ CRITICAL: Set end_date same as start_date for half day
    if (formData.start_date !== formData.end_date) {
      setFormData(prev => ({
        ...prev,
        end_date: prev.start_date
      }));
    }
  }

  // ✅ Balance check with half day support
  if (!vacationSettings.allow_negative_balance && balances) {
    const requestDays = formData.is_half_day ? 0.5 : formData.numberOfDays;
    if (requestDays > balances.remaining_balance) {
      showError(`Insufficient balance. You have ${balances.remaining_balance} days remaining.`);
      return;
    }
  }

  setLoading(true);
  try {
    let requestData = {
      requester_type: formData.requester_type,
      vacation_type_id: parseInt(formData.vacation_type_id),
      start_date: formData.start_date,
      end_date: formData.is_half_day ? formData.start_date : formData.end_date,
      comment: formData.comment,
      // ✅ Half day fields - send as HH:MM format
      is_half_day: formData.is_half_day || false,
      half_day_start_time: formData.is_half_day ? formData.half_day_start_time : null,
      half_day_end_time: formData.is_half_day ? formData.half_day_end_time : null
    };

      if (formData.requester_type === 'for_my_employee') {
        if (formData.employee_id) {
          requestData.employee_id = formData.employee_id;
        } else {
          requestData.employee_manual = {
            name: formData.employeeName,
            phone: formData.phoneNumber,
            department: formData.department,
            business_function: formData.businessFunction,
            unit: formData.unit,
            job_function: formData.jobFunction
          };
        }
      }

      let response;
      
      if (activeSection === 'immediate') {
        if (formData.hr_representative_id) {
          requestData.hr_representative_id = formData.hr_representative_id;
        }
        response = await VacationService.createImmediateRequest(requestData, selectedFiles);
        showSuccess('Request submitted successfully');
        setSelectedFiles([]);
      } else {
        response = await VacationService.createSchedule(requestData);
        showSuccess('Schedule saved successfully');
        fetchScheduleTabs();
      }

      if (response.balance) {
        setBalances(response.balance);
      } else {
        await fetchDashboard();
      }

      // ✅ Reset form including half day fields
      setFormData(prev => ({ 
        ...prev, 
        start_date: '', 
        end_date: '', 
        dateOfReturn: '', 
        numberOfDays: 0, 
        comment: '',
        is_half_day: false,
        half_day_start_time: '',
        half_day_end_time: ''
      }));
      setFileErrors('');
    } catch (error) {
      console.error('Submit error:', error);
      
      if (error.response?.data?.conflicts && error.response?.data?.conflicts.length > 0) {
        setConflictData(error.response.data.conflicts);
        setShowConflictModal(true);
      } else {
        const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to submit';
        showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
 // VacationRequestsPage.jsx

const handleSaveEdit = async () => {
  if (!editingSchedule) return;

  if (editingSchedule.edit_count >= vacationSettings.max_schedule_edits) {
    showError(`Maximum edit limit (${vacationSettings.max_schedule_edits}) reached`);
    return;
  }

  // ✅ Validate dates
  if (!editingSchedule.start_date || !editingSchedule.end_date) {
    showError('Start date and end date are required');
    return;
  }

  if (editingSchedule.end_date < editingSchedule.start_date) {
    showError('End date must be after start date');
    return;
  }

  setLoading(true);
  try {
    const editData = {
      vacation_type_id: parseInt(editingSchedule.vacation_type_id),
      start_date: editingSchedule.start_date, // Already in YYYY-MM-DD format from input[type="date"]
      end_date: editingSchedule.end_date,
      comment: editingSchedule.comment || ''
    };
    
 
    
    const response = await VacationService.editSchedule(editingSchedule.id, editData);
  
    
    showSuccess('Schedule updated successfully');
    setEditModalOpen(false);
    setEditingSchedule(null);
    fetchScheduleTabs();
    fetchMyAllRecords();
  } catch (error) {
    console.error('❌ Edit error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Full error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.conflicts && error.response?.data?.conflicts.length > 0) {
      setConflictData(error.response.data.conflicts);
      setShowConflictModal(true);
      setEditModalOpen(false);
    } else {
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to update';
      showError(errorMsg);
    }
  } finally {
    setLoading(false);
  }
};

  const handleEditSchedule = (schedule) => {
    setEditingSchedule({
      id: schedule.id,
      vacation_type_id: schedule.vacation_type_id || vacationTypes[0]?.id,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      comment: schedule.comment || '',
      numberOfDays: schedule.number_of_days,
      edit_count: schedule.edit_count
    });
    setEditModalOpen(true);
  };

  // Only admin can register schedules
  const handleRegisterSchedule = async (scheduleId) => {
    if (!userAccess.is_admin) {
      showError('Only admin can register schedules');
      return;
    }

    try {
      await VacationService.registerSchedule(scheduleId);
      showSuccess('Schedule registered successfully');
      fetchScheduleTabs();
      fetchDashboard();
      fetchMyAllRecords();
    } catch (error) {
      console.error('Register error:', error);
      showError('Failed to register schedule');
    }
  };

  // Only admin can delete schedules (even after registration)
  const handleDeleteSchedule = async (scheduleId) => {
    if (!userAccess.is_admin) {
      showError('Only admin can delete schedules');
      return;
    }

    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await VacationService.deleteSchedule(scheduleId);
      showSuccess('Schedule deleted successfully');
      fetchScheduleTabs();
      fetchDashboard();
      fetchMyAllRecords();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete schedule');
    }
  };

  const canEditSchedule = (schedule) => {
    // if (schedule.status !== 'SCHEDULED') return false;
    if (schedule.edit_count >= vacationSettings.max_schedule_edits) return false;
    return true;
  };

  // Approval handlers - Manager can only approve Line Manager requests
  const handleOpenApprovalModal = (request) => {
    setSelectedRequest(request);
    setApprovalComment('');
    setShowApprovalModal(true);
  };

  const handleOpenRejectionModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await VacationService.approveRejectRequest(selectedRequest.id, { 
        action: 'approve',
        comment: approvalComment || 'Approved'
      });
      showSuccess('Request approved successfully');
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalComment('');
      fetchPendingRequests();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Approval error:', error);
      showError(error.response?.data?.error || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      showError('Rejection reason is required');
      return;
    }
    
    setLoading(true);
    try {
      await VacationService.approveRejectRequest(selectedRequest.id, { 
        action: 'reject',
        reason: rejectionReason
      });
      showSuccess('Request rejected successfully');
      setShowRejectionModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchPendingRequests();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Rejection error:', error);
      showError(error.response?.data?.error || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  // View handlers
  const handleViewDetails = (requestId) => {
    setSelectedRequestId(requestId);
    setShowDetailModal(true);
  };

  const handleViewAttachments = (requestId, requestNumber) => {
    setSelectedRequestId(requestId);
    setSelectedRequestNumber(requestNumber);
    setShowAttachmentsModal(true);
  };

  const handleViewScheduleDetail = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setShowScheduleDetailModal(true);
  };

  // Export handlers - Based on access level
  const handleExportAllRecords = async () => {
    try {
      const blob = await VacationService.exportAllVacationRecords(filters);
      const filename = userAccess.can_view_all 
        ? 'all_vacation_records.xlsx' 
        : 'team_vacation_records.xlsx';
      VacationHelpers.downloadBlobFile(blob, filename);
      showSuccess('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const handleExportMyVacations = async () => {
    try {
      const blob = await VacationService.exportMyVacations();
      VacationHelpers.downloadBlobFile(blob, 'my_vacations.xlsx');
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const handleExportSchedules = async () => {
    try {
      const blob = await VacationService.exportAllVacationRecords();
      VacationHelpers.downloadBlobFile(blob, 'schedules.xlsx');
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  // Effects
  useEffect(() => {
    initializeData();
    handleEmployeeSearch();
  }, []);

 // VacationRequestsPage.jsx-də bu useEffect-i tapın və düzəldin:

useEffect(() => {

  
  if (activeTab === 'approval' && (userAccess.is_manager || userAccess.is_admin)) {
    fetchPendingRequests();
    fetchApprovalHistory();
  } else if (activeTab === 'all') {
    fetchMyAllRecords();
  } else if (activeTab === 'records' && (userAccess.can_view_all || userAccess.is_manager)) {
    fetchAllVacationRecords();
  } else if (activeTab === 'schedules') {

    fetchScheduleTabs();
  } else if (activeSection === 'scheduling') {
    fetchScheduleTabs();
  }
}, [activeTab, activeSection, userAccess]);

  useEffect(() => {
    const updateWorkingDays = async () => {
      if (formData.start_date && formData.end_date) {
        // ✅ For half day, set to 0.5 directly
        if (formData.is_half_day) {
          const endDate = new Date(formData.start_date);
          endDate.setDate(endDate.getDate() + 1);
          setFormData(prev => ({ 
            ...prev, 
            numberOfDays: 0.5, 
            dateOfReturn: endDate.toISOString().split('T')[0] 
          }));
        } else {
          // ✅ Calculate with business function code
          let businessFunctionCode = null;
          if (formData.businessFunction) {
            businessFunctionCode = formData.businessFunction.toUpperCase().includes('UK') ? 'UK' : null;
          }
          
          const days = await calculateWorkingDays(
            formData.start_date, 
            formData.end_date,
            businessFunctionCode
          );
          
          const endDate = new Date(formData.end_date);
          endDate.setDate(endDate.getDate() + 1);
          
          setFormData(prev => ({ 
            ...prev, 
            numberOfDays: days, 
            dateOfReturn: endDate.toISOString().split('T')[0] 
          }));
        }
      }
    };
    updateWorkingDays();
  }, [formData.start_date, formData.end_date, formData.is_half_day, formData.businessFunction]);

  useEffect(() => {
    const loadCurrentUserData = async () => {
      if (requester === 'for_me') {
        const userEmail = VacationService.getCurrentUserEmail();
        
        if (userEmail && employeeSearchResults.length > 0) {
          const currentEmployee = employeeSearchResults.find(emp => 
            emp.email?.toLowerCase() === userEmail.toLowerCase()
          );
          
          if (currentEmployee) {
            setFormData(prev => ({ 
              ...prev, 
              requester_type: 'for_me',
              employee_id: null,
              employee_manual: null,
              employeeName: currentEmployee.name || '',
              businessFunction: currentEmployee.business_function_name || '',
              department: currentEmployee.department_name || '',
              unit: currentEmployee.unit_name || '',
              jobFunction: currentEmployee.job_function_name || '',
              phoneNumber: currentEmployee.phone || '',
              line_manager: currentEmployee.line_manager_name || ''
            }));
          }
        }
      } else {
        setFormData(prev => ({ 
          ...prev, 
          requester_type: 'for_my_employee', 
          employeeName: '', 
          businessFunction: '', 
          department: '', 
          unit: '', 
          jobFunction: '', 
          phoneNumber: '', 
          line_manager: '' 
        }));
      }
    };
    
    loadCurrentUserData();
  }, [requester, employeeSearchResults]);

  if (accessLoading || (loading && !balances)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-almet-sapphire border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getAvailableTabs = () => {
  const tabs = [
    { key: 'request', label: 'Request', icon: FileText },
  ];
  
  tabs.push({ key: 'planning', label: 'Planning Vacation', icon: Calendar });
  // Approval tab only for managers and admins
  if (userAccess.is_manager || userAccess.is_admin) {
    tabs.push({ key: 'approval', label: 'Approval', icon: CheckCircle });
  }

  // ✅ NEW: My Schedules - hər kəs görür
  tabs.push({ key: 'schedules', label: 'My Schedules', icon: Calendar });

  // My Records - Everyone
  tabs.push({ key: 'all', label: 'My Records', icon: FileText });

  // All Records - Managers see team, Admins see all
  if (userAccess.can_view_all || userAccess.is_manager) {
    tabs.push({ 
      key: 'records', 
      label: userAccess.is_admin ? 'All Records' : 'Team Records', 
      icon: Users 
    });
  }

  // Calendar - Everyone
  tabs.push({ key: 'calendar', label: 'Calendar', icon: Calendar });

  // Balances - Everyone
  tabs.push({ key: 'balances', label: 'Balances', icon: TrendingUp });

  // ✅ Planning Vacation - Everyone

  return tabs;
};

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Vacation Management</h1>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Manage requests and schedules</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {userAccess.is_admin && (
              <button
                onClick={() => router.push('/requests/vacation/vacation-settings')}
                className="flex items-center gap-1.5 bg-almet-sapphire hover:bg-almet-cloud-burst text-white px-3 py-1.5 rounded-md transition-all shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Settings</span>
              </button>
            )}
            
            {/* Access Level Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border ${
              userAccess.is_admin 
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/50'
                : userAccess.is_manager
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50'
            }`}>
              <Shield className={`w-3 h-3 ${
                userAccess.is_admin 
                  ? 'text-purple-600 dark:text-purple-400'
                  : userAccess.is_manager
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-green-600 dark:text-green-400'
              }`} />
              <span className={`text-xs font-medium ${
                userAccess.is_admin 
                  ? 'text-purple-600 dark:text-purple-400'
                  : userAccess.is_manager
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {userAccess.access_level}
              </span>
            </div>
            
            <div className="bg-almet-mystic dark:bg-almet-comet/20 border border-almet-bali-hai/30 dark:border-almet-comet px-2.5 py-1.5 rounded-md">
              <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                <Settings className="w-3 h-3" />
                <span>Max Edits: {vacationSettings.max_schedule_edits}</span>
                <span className="mx-0.5">•</span>
                <span>{vacationSettings.allow_negative_balance ? 'Negative OK' : 'No Negative'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 border-b border-almet-mystic dark:border-almet-comet">
          <div className="flex space-x-8">
            {getAvailableTabs().map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)} 
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.key 
                    ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral' 
                    : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'request' && balances && (
  <div className="space-y-5">
    <VacationStats 
      balances={balances} 
      allowNegativeBalance={vacationSettings.allow_negative_balance}
    />



    {/* ✅ Yalnız request form */}
    <VacationRequestForm
      formData={formData}
      setFormData={setFormData}
      formErrors={formErrors}
      requester={requester}
      setRequester={setRequester}
      employeeSearchResults={employeeSearchResults}
      vacationTypes={vacationTypes}
      hrRepresentatives={hrRepresentatives}
      darkMode={darkMode}
      handleStartDateChange={handleStartDateChange}
      handleEndDateChange={handleEndDateChange}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
      fileErrors={fileErrors}
      handleSubmit={handleSubmit}
      loading={loading}
    />
  </div>
)}

{activeTab === 'schedules' && (
  <MySchedulesTab
    userAccess={userAccess}
    scheduleTabs={scheduleTabs}
    handleExportSchedules={handleExportSchedules}
    handleEditSchedule={handleEditSchedule}
    handleDeleteSchedule={handleDeleteSchedule}
    handleRegisterSchedule={handleRegisterSchedule}
    canEditSchedule={canEditSchedule}
    maxScheduleEdits={vacationSettings.max_schedule_edits}
    handleViewScheduleDetail={handleViewScheduleDetail}
    showSuccess={showSuccess} // ✅ ADD
    showError={showError}     // ✅ ADD
  />
)}

        {activeTab === 'approval' && (userAccess.is_manager || userAccess.is_admin) && (
          <ApprovalSection
            userAccess={userAccess}
            pendingRequests={pendingRequests}
            approvalHistory={approvalHistory}
            handleOpenApprovalModal={handleOpenApprovalModal}
            handleOpenRejectionModal={handleOpenRejectionModal}
            handleViewDetails={handleViewDetails}
          />
        )}

        {activeTab === 'all' && (
          <MyRecordsTable
            myAllRecords={myAllRecords}
            handleExportMyVacations={handleExportMyVacations}
            handleViewDetails={handleViewDetails}
            handleViewAttachments={handleViewAttachments}
            handleViewScheduleDetail={handleViewScheduleDetail}
            handleEditSchedule={handleEditSchedule}
            handleRegisterSchedule={handleRegisterSchedule}
            userAccess={userAccess}
          />
        )}
{activeTab === 'planning' && (
  <PlanningVacationTab
    darkMode={darkMode}
    userAccess={userAccess}
    vacationTypes={vacationTypes}
    employeeSearchResults={employeeSearchResults}
    balances={balances}
    showSuccess={showSuccess}
    showError={showError}
  />
)}
        {activeTab === 'records' && (userAccess.can_view_all || userAccess.is_manager) && (
          <AllRecordsTable
            allVacationRecords={allVacationRecords}
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            businessFunctions={businessFunctions}
            departments={departments}
            darkMode={darkMode}
            handleExportAllRecords={handleExportAllRecords}
            fetchAllVacationRecords={fetchAllVacationRecords}
            handleViewDetails={handleViewDetails}
            handleViewAttachments={handleViewAttachments}
            handleViewScheduleDetail={handleViewScheduleDetail}
            handleEditSchedule={handleEditSchedule}
            handleRegisterSchedule={handleRegisterSchedule}
            userAccess={userAccess}
          />
        )}

        {activeTab === 'calendar' && (
          <VacationCalendar
            darkMode={darkMode}
            showSuccess={showSuccess}
            showError={showError}
            userAccess={userAccess}
          />
        )}

        {activeTab === 'balances' && (
          <BalancesTabContent 
            userAccess={userAccess}
            darkMode={darkMode}
            showSuccess={showSuccess}
            showError={showError}
          />
        )}
      </div>

      {/* Modals */}
      <EditScheduleModal
        show={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingSchedule(null);
        }}
        editingSchedule={editingSchedule}
        setEditingSchedule={setEditingSchedule}
        vacationTypes={vacationTypes}
        maxScheduleEdits={vacationSettings.max_schedule_edits}
        darkMode={darkMode}
        handleSaveEdit={handleSaveEdit}
        loading={loading}
      />

      <ApprovalModal
        show={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedRequest(null);
          setApprovalComment('');
        }}
        selectedRequest={selectedRequest}
        approvalAmount=""
        setApprovalAmount={() => {}}
        approvalNote={approvalComment}
        setApprovalNote={setApprovalComment}
        onApprove={handleConfirmApproval}
        loading={loading}
      />

      <RejectionModal
        show={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          setSelectedRequest(null);
          setRejectionReason('');
        }}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onReject={handleConfirmRejection}
        loading={loading}
      />

      <AttachmentsModal
        show={showAttachmentsModal}
        onClose={() => {
          setShowAttachmentsModal(false);
          setSelectedRequestId(null);
          setSelectedRequestNumber(null);
        }}
        requestId={selectedRequestNumber}
        requestNumber={selectedRequestNumber}
        canUpload={false}
        canDelete={false}
        onUpdate={() => {
          if (activeTab === 'all') {
            fetchMyAllRecords();
          }
        }}
      />

      <RequestDetailModal
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRequestId(null);
        }}
        requestId={selectedRequestId}
        onAttachmentsClick={(requestId, requestNumber) => {
          setShowDetailModal(false);
          handleViewAttachments(requestId, requestNumber);
        }}
      />

      <ConflictErrorModal
        show={showConflictModal}
        onClose={() => {
          setShowConflictModal(false);
          setConflictData([]);
        }}
        conflicts={conflictData}
      />

      <ScheduleDetailModal
        show={showScheduleDetailModal}
        onClose={() => {
          setShowScheduleDetailModal(false);
          setSelectedScheduleId(null);
        }}
        scheduleId={selectedScheduleId}
      />
    </DashboardLayout>
  );
}