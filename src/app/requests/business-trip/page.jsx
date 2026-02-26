"use client";
import { useState, useEffect } from 'react';
import { Plane, ChevronDown, ChevronUp, Send, CheckCircle, XCircle, Clock, Calendar, DollarSign, Settings, Lock, Download, FileText, Users, History, Filter, X, Paperclip } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import Pagination from "@/components/common/Pagination";
import { BusinessTripService, BusinessTripHelpers } from '@/services/businessTripService';
import { useRouter } from 'next/navigation';

// Import components
import { StatCard } from '@/components/business-trip/StatCard';
import { EmployeeSection } from '@/components/business-trip/EmployeeSection';
import { TravelSection } from '@/components/business-trip/TravelSection';
import { ScheduleSection } from '@/components/business-trip/ScheduleSection';
import { HotelSection } from '@/components/business-trip/HotelSection';
import { ApprovalModal } from '@/components/business-trip/ApprovalModal';
import { RejectionModal } from '@/components/business-trip/RejectionModal';
import { FileUploadSection } from '@/components/business-trip/FileUploadSection';
import { AttachmentsModal } from '@/components/business-trip/AttachmentsModal';
import { RequestDetailModal } from '@/components/business-trip/RequestDetailModal';
export default function BusinessTripPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('request');
  const [requester, setRequester] = useState('for_me');
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState('employee');
  
  // Pagination states
  const [myRequestsPage, setMyRequestsPage] = useState(1);
  const [allRequestsPage, setAllRequestsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 10;
  
  // User & Permissions
  const [userPermissions, setUserPermissions] = useState({ is_admin: false, permissions: [] });
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  // Request Detail Modal
const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
const [selectedRequestForDetail, setSelectedRequestForDetail] = useState(null);
  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    pending_requests: 0,
    approved_trips: 0,
    total_days_this_year: 0,
    upcoming_trips: 0
  });
  
  // Configuration Options
  const [travelTypes, setTravelTypes] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [tripPurposes, setTripPurposes] = useState([]);
  const [hrRepresentatives, setHrRepresentatives] = useState([]);
  const [financeApprovers, setFinanceApprovers] = useState([]);
  const [userDefaults, setUserDefaults] = useState(null);
  
  // Default Approvers
  const [defaultFinanceApprover, setDefaultFinanceApprover] = useState(null);
  const [defaultHrRepresentative, setDefaultHrRepresentative] = useState(null);
  
  // Trip Requests
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  
  // Pending Approvals
  const [pendingApprovals, setPendingApprovals] = useState({
    line_manager_requests: [],
    finance_requests: [],
    hr_requests: [],
    total_pending: 0
  });

  // Approval History
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  
  // Employee Search
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    employee: '',
    department: '',
    dateFrom: '',
    dateTo: ''
  });

  const [historyFilters, setHistoryFilters] = useState({
    action: '',
    employee: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Form Data
  const [formData, setFormData] = useState({
    requester_type: 'for_me',
    employee_id: null,
    employee_manual: null,
    employeeName: '',
    businessFunction: '',
    department: '',
    unit: '',
    jobFunction: '',
    phoneNumber: '',
    lineManager: '',
    travel_type_id: '',
    transport_type_id: '',
    purpose_id: '',
    start_date: '',
    end_date: '',
    comment: '',
    finance_approver_id: null,
    hr_representative_id: null
  });
  
  const [schedules, setSchedules] = useState([
    { id: 1, date: '', from_location: '', to_location: '', notes: '' }
  ]);
  
  const [hotels, setHotels] = useState([
    { id: 1, hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }
  ]);
  
  // File attachments
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  
  // Approval Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalAmount, setApprovalAmount] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Attachments Modal
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [selectedRequestForAttachments, setSelectedRequestForAttachments] = useState(null);

  // Approver Selection
  const [showApproverSelection, setShowApproverSelection] = useState(false);
  const [selectedFinanceApprover, setSelectedFinanceApprover] = useState(null);
  const [selectedHrRepresentative, setSelectedHrRepresentative] = useState(null);

  // Pagination helpers
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };
const handleOpenRequestDetail = (request) => {
  setSelectedRequestForDetail(request.id);
  setShowRequestDetailModal(true);
};
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      const email = BusinessTripService.getCurrentUserEmail();
      setCurrentUserEmail(email);
      
      await Promise.all([
        fetchUserPermissions(),
        fetchDashboard(),
        fetchAllOptions(),
        fetchEmployees(),
        fetchHRRepresentatives(),
        fetchFinanceApprovers()
      ]);
    } catch (error) {
      console.error('Initialization error:', error);
      showError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const data = await BusinessTripService.getMyPermissions();
      setUserPermissions(data);
    } catch (error) {
      console.error('Permissions fetch error:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await BusinessTripService.getDashboard();
      setDashboardStats(data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const fetchAllOptions = async () => {
    try {
      const data = await BusinessTripService.getAllOptions();
      setTravelTypes(data.travel_types || []);
      setTransportTypes(data.transport_types || []);
      setTripPurposes(data.trip_purposes || []);
      setUserDefaults(data.user_defaults);
      
      if (data.travel_types?.length > 0) {
        setFormData(prev => ({ ...prev, travel_type_id: data.travel_types[0].id }));
      }
      if (data.transport_types?.length > 0) {
        setFormData(prev => ({ ...prev, transport_type_id: data.transport_types[0].id }));
      }
      if (data.trip_purposes?.length > 0) {
        setFormData(prev => ({ ...prev, purpose_id: data.trip_purposes[0].id }));
      }

      if (data.user_defaults?.default_finance_approver?.id) {
        setDefaultFinanceApprover(data.user_defaults.default_finance_approver);
        setSelectedFinanceApprover(data.user_defaults.default_finance_approver.id);
        setFormData(prev => ({ ...prev, finance_approver_id: data.user_defaults.default_finance_approver.id }));
      }
      if (data.user_defaults?.default_hr_representative?.id) {
        setDefaultHrRepresentative(data.user_defaults.default_hr_representative);
        setSelectedHrRepresentative(data.user_defaults.default_hr_representative.id);
        setFormData(prev => ({ ...prev, hr_representative_id: data.user_defaults.default_hr_representative.id }));
      }
    } catch (error) {
      console.error('Options fetch error:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await BusinessTripService.searchEmployees();
      setEmployeeSearchResults(data.results || []);
    } catch (error) {
      console.error('Employee search error:', error);
    }
  };

  const fetchHRRepresentatives = async () => {
    try {
      const data = await BusinessTripService.getHRRepresentatives();
      setHrRepresentatives(data.hr_representatives || []);
      
      if (data.current_default?.id && !defaultHrRepresentative) {
        setDefaultHrRepresentative(data.current_default);
        setSelectedHrRepresentative(data.current_default.id);
        setFormData(prev => ({ ...prev, hr_representative_id: data.current_default.id }));
      }
    } catch (error) {
      console.error('HR representatives fetch error:', error);
    }
  };

  const fetchFinanceApprovers = async () => {
    try {
      const data = await BusinessTripService.getFinanceApprovers();
      setFinanceApprovers(data.finance_approvers || []);
      
      if (data.current_default?.id && !defaultFinanceApprover) {
        setDefaultFinanceApprover(data.current_default);
        setSelectedFinanceApprover(data.current_default.id);
        setFormData(prev => ({ ...prev, finance_approver_id: data.current_default.id }));
      }
    } catch (error) {
      console.error('Finance approvers fetch error:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const data = await BusinessTripService.getMyTripRequests();
      setMyRequests(data.requests || []);
      setMyRequestsPage(1);
    } catch (error) {
      console.error('My requests fetch error:', error);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const data = await BusinessTripService.getAllTripRequests();
      setAllRequests(data.requests || []);
      setFilteredRequests(data.requests || []);
      setAllRequestsPage(1);
    } catch (error) {
      console.error('All requests fetch error:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const data = await BusinessTripService.getPendingApprovals();
      setPendingApprovals(data);
    } catch (error) {
      console.error('Pending approvals fetch error:', error);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const data = await BusinessTripService.getApprovalHistory();
      setApprovalHistory(data.history || []);
      setFilteredHistory(data.history || []);
      setHistoryPage(1);
    } catch (error) {
      console.error('Approval history fetch error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'request') {
      fetchMyRequests();
    } else if (activeTab === 'approval') {
      fetchPendingApprovals();
    } else if (activeTab === 'all') {
      fetchAllRequests();
    } else if (activeTab === 'history') {
      fetchApprovalHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    const loadCurrentUserData = async () => {
      if (requester === 'for_me' && userDefaults) {
        setFormData(prev => ({
          ...prev,
          requester_type: 'for_me',
          employee_id: null,
          employee_manual: null,
          employeeName: userDefaults.employee_name || '',
          businessFunction: userDefaults.business_function || '',
          department: userDefaults.department || '',
          unit: userDefaults.unit || '',
          jobFunction: userDefaults.job_function || '',
          phoneNumber: userDefaults.phone_number || '',
          lineManager: userDefaults.line_manager?.name || ''
        }));
        
        if (defaultFinanceApprover?.id) {
          setSelectedFinanceApprover(defaultFinanceApprover.id);
          setFormData(prev => ({ ...prev, finance_approver_id: defaultFinanceApprover.id }));
        }
        if (defaultHrRepresentative?.id) {
          setSelectedHrRepresentative(defaultHrRepresentative.id);
          setFormData(prev => ({ ...prev, hr_representative_id: defaultHrRepresentative.id }));
        }
      } else if (requester === 'for_my_employee') {
        setFormData(prev => ({
          ...prev,
          requester_type: 'for_my_employee',
          employee_id: null,
          employee_manual: null,
          employeeName: '',
          businessFunction: '',
          department: '',
          unit: '',
          jobFunction: '',
          phoneNumber: '',
          lineManager: ''
        }));
        
        if (defaultFinanceApprover?.id && !selectedFinanceApprover) {
          setSelectedFinanceApprover(defaultFinanceApprover.id);
          setFormData(prev => ({ ...prev, finance_approver_id: defaultFinanceApprover.id }));
        }
        if (defaultHrRepresentative?.id && !selectedHrRepresentative) {
          setSelectedHrRepresentative(defaultHrRepresentative.id);
          setFormData(prev => ({ ...prev, hr_representative_id: defaultHrRepresentative.id }));
        }
      }
    };
    
    loadCurrentUserData();
  }, [requester, userDefaults]);

  useEffect(() => {
    let filtered = [...allRequests];

    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    if (filters.employee) {
      filtered = filtered.filter(req => 
        req.employee_name.toLowerCase().includes(filters.employee.toLowerCase())
      );
    }
    if (filters.department) {
      filtered = filtered.filter(req => 
        req.department_name?.toLowerCase().includes(filters.department.toLowerCase())
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(req => req.start_date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(req => req.end_date <= filters.dateTo);
    }

    setFilteredRequests(filtered);
    setAllRequestsPage(1);
  }, [filters, allRequests]);

  useEffect(() => {
    let filtered = [...approvalHistory];

    if (historyFilters.action) {
      filtered = filtered.filter(item => item.action === historyFilters.action);
    }
    if (historyFilters.employee) {
      filtered = filtered.filter(item => 
        item.employee_name.toLowerCase().includes(historyFilters.employee.toLowerCase())
      );
    }
    if (historyFilters.dateFrom) {
      filtered = filtered.filter(item => item.date >= historyFilters.dateFrom);
    }
    if (historyFilters.dateTo) {
      filtered = filtered.filter(item => item.date <= historyFilters.dateTo);
    }

    setFilteredHistory(filtered);
    setHistoryPage(1);
  }, [historyFilters, approvalHistory]);

  const clearFilters = () => {
    setFilters({
      status: '',
      employee: '',
      department: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const clearHistoryFilters = () => {
    setHistoryFilters({
      action: '',
      employee: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleAddSchedule = () => {
    setSchedules([...schedules, { id: Date.now(), date: '', from_location: '', to_location: '', notes: '' }]);
  };

  const handleRemoveSchedule = (id) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  const handleScheduleChange = (id, field, value) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddHotel = () => {
    setHotels([...hotels, { id: Date.now(), hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }]);
  };

  const handleRemoveHotel = (id) => {
    if (hotels.length > 1) {
      setHotels(hotels.filter(h => h.id !== id));
    }
  };

  const handleHotelChange = (id, field, value) => {
    setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleFileAdd = (newFiles) => {
    setAttachmentFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinanceApproverChange = (value) => {
    setSelectedFinanceApprover(value);
    setFormData(prev => ({ ...prev, finance_approver_id: value }));
  };

  const handleHrRepresentativeChange = (value) => {
    setSelectedHrRepresentative(value);
    setFormData(prev => ({ ...prev, hr_representative_id: value }));
  };

  const handleOpenAttachments = (request) => {
    setSelectedRequestForAttachments(request);
    setShowAttachmentsModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const scheduleErrors = BusinessTripHelpers.validateScheduleDates(schedules);
    if (scheduleErrors.length > 0) {
      showError(scheduleErrors[0]);
      return;
    }

    const hotelErrors = BusinessTripHelpers.validateHotelDates(hotels);
    if (hotelErrors.length > 0) {
      showError(hotelErrors[0]);
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        requester_type: formData.requester_type,
        travel_type_id: parseInt(formData.travel_type_id),
        transport_type_id: parseInt(formData.transport_type_id),
        purpose_id: parseInt(formData.purpose_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        comment: formData.comment || '',
        schedules: schedules.map(({ id, ...rest }) => rest),
        hotels: hotels.filter(h => h.hotel_name).map(({ id, ...rest }) => rest)
      };

      if (formData.requester_type === 'for_my_employee') {
        if (formData.employee_id) {
          requestData.employee_id = formData.employee_id;
        } else if (formData.employeeName) {
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

      if (selectedFinanceApprover) {
        requestData.finance_approver_id = selectedFinanceApprover;
      }
      if (selectedHrRepresentative) {
        requestData.hr_representative_id = selectedHrRepresentative;
      }


        const formDataWithFiles = BusinessTripHelpers.formatTripRequestWithFiles(requestData, attachmentFiles);
        await BusinessTripService.createTripRequestWithFiles(formDataWithFiles);
  
     

      showSuccess('Trip request submitted successfully');
      
      setFormData(prev => ({
        ...prev,
        start_date: '',
        end_date: '',
        comment: ''
      }));
      setSchedules([{ id: 1, date: '', from_location: '', to_location: '', notes: '' }]);
      setHotels([{ id: 1, hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }]);
      setAttachmentFiles([]);
      
      if (defaultFinanceApprover?.id) {
        setSelectedFinanceApprover(defaultFinanceApprover.id);
        setFormData(prev => ({ ...prev, finance_approver_id: defaultFinanceApprover.id }));
      }
      if (defaultHrRepresentative?.id) {
        setSelectedHrRepresentative(defaultHrRepresentative.id);
        setFormData(prev => ({ ...prev, hr_representative_id: defaultHrRepresentative.id }));
      }
      
      setShowApproverSelection(false);
      
      fetchDashboard();
      fetchMyRequests();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to submit request';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    if (selectedRequest.status === 'PENDING_FINANCE' && !approvalAmount) {
      showError('Please enter the trip amount');
      return;
    }

    setLoading(true);
    try {
      const data = {
        action: 'approve',
        comment: approvalNote || undefined,
        amount: approvalAmount ? parseFloat(approvalAmount) : undefined
      };

      await BusinessTripService.approveRejectRequest(selectedRequest.id, data);
      showSuccess('Request approved successfully');
      setShowApprovalModal(false);
      setApprovalAmount('');
      setApprovalNote('');
      setSelectedRequest(null);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Approval error:', error);
      showError(error.response?.data?.error || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await BusinessTripService.approveRejectRequest(selectedRequest.id, {
        action: 'reject',
        reason: rejectionReason
      });
      showSuccess('Request rejected');
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Rejection error:', error);
      showError('Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleExportMyTrips = async () => {
    try {
      const blob = await BusinessTripService.exportMyTrips();
      BusinessTripHelpers.downloadBlobFile(blob, `my_trips_${new Date().toISOString().split('T')[0]}.xlsx`);
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const handleExportAllTrips = async () => {
    try {
      const blob = await BusinessTripService.exportAllTrips();
      BusinessTripHelpers.downloadBlobFile(blob, `all_trips_${new Date().toISOString().split('T')[0]}.xlsx`);
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const canViewSettings = BusinessTripHelpers.canViewSettings(userPermissions);
  const canExportAll = BusinessTripHelpers.canExportAll(userPermissions);
  const canApprove = BusinessTripHelpers.canApprove(userPermissions);

  if (loading && !dashboardStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-almet-sapphire border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Get paginated data
  const paginatedMyRequests = getPaginatedData(myRequests, myRequestsPage);
  const paginatedAllRequests = getPaginatedData(filteredRequests, allRequestsPage);
  const paginatedHistory = getPaginatedData(filteredHistory, historyPage);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Business Trip Management</h1>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Manage business trip requests and approvals</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {canViewSettings && (
              <button
                onClick={() => router.push('/requests/business-trip/settings')}
                className="flex items-center gap-1.5 bg-almet-sapphire hover:bg-almet-cloud-burst text-white px-3 py-2 rounded-lg transition-all shadow-sm text-xs font-medium"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            )}
        
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/30 dark:border-almet-comet/30 p-1 inline-flex shadow-sm">
    {[
      { key: 'request', label: 'New Request', icon: FileText },
      { key: 'my-requests', label: 'My Requests', icon: Calendar },
      { key: 'approval', label: 'Approval', icon: CheckCircle, show: canApprove },
      { key: 'history', label: 'History', icon: History, show: canApprove },
      { key: 'all', label: 'All Requests', icon: Users }
    ].filter(tab => tab.show !== false).map(tab => (
      <button 
        key={tab.key} 
        onClick={() => setActiveTab(tab.key)} 
        className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-2 ${
          activeTab === tab.key 
            ? 'bg-almet-sapphire text-white shadow-sm' 
            : 'text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700/30'
        }`}
      >
        <tab.icon className="w-3.5 h-3.5" />
        {tab.label}
      </button>
    ))}
  </div>
</div>

        {/* Request Submission Tab */}
        {activeTab === 'request' && (
          <div className="space-y-5">
            
            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Pending" value={dashboardStats.pending_requests} icon={Clock} color="text-orange-600" bgColor="bg-orange-50 dark:bg-orange-900/10" />
              <StatCard title="Approved" value={dashboardStats.approved_trips} icon={CheckCircle} color="text-green-600" bgColor="bg-green-50 dark:bg-green-900/10" />
              <StatCard title="Days (Year)" value={dashboardStats.total_days_this_year} icon={Calendar} color="text-almet-sapphire" bgColor="bg-blue-50 dark:bg-blue-900/10" />
              <StatCard title="Upcoming" value={dashboardStats.upcoming_trips} icon={Plane} color="text-almet-astral" bgColor="bg-sky-50 dark:bg-sky-900/10" />
            </div>

            {/* Request Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/30 dark:border-almet-comet/30 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-almet-sapphire/5 to-transparent dark:from-almet-sapphire/10 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30">
                <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">New Trip Request</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                
                {/* Requester Type */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Request Type</label>
                  <select 
                    value={requester} 
                    onChange={(e) => setRequester(e.target.value)} 
                    className="w-full lg:w-auto px-4 py-2.5 outline-0 text-xs font-medium border border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="for_me">For Myself</option>
                    <option value="for_my_employee">For My Employee</option>
                  </select>
                </div>

                {/* Employee Information Section */}
                <EmployeeSection
                  isExpanded={expandedSection === 'employee'}
                  onToggle={() => toggleSection('employee')}
                  requester={requester}
                  formData={formData}
                  setFormData={setFormData}
                  employeeSearchResults={employeeSearchResults}
                  darkMode={darkMode}
                />

                {/* Travel Information Section */}
                <TravelSection
                  isExpanded={expandedSection === 'travel'}
                  onToggle={() => toggleSection('travel')}
                  formData={formData}
                  setFormData={setFormData}
                  travelTypes={travelTypes}
                  transportTypes={transportTypes}
                  tripPurposes={tripPurposes}
                  darkMode={darkMode}
                />

                {/* Schedule Details Section */}
                <ScheduleSection
                  isExpanded={expandedSection === 'schedule'}
                  onToggle={() => toggleSection('schedule')}
                  schedules={schedules}
                  onAdd={handleAddSchedule}
                  onRemove={handleRemoveSchedule}
                  onChange={handleScheduleChange}
                />

                {/* Hotel Details Section */}
                <HotelSection
                  isExpanded={expandedSection === 'hotel'}
                  onToggle={() => toggleSection('hotel')}
                  hotels={hotels}
                  onAdd={handleAddHotel}
                  onRemove={handleRemoveHotel}
                  onChange={handleHotelChange}
                />

                {/* File Upload Section */}
                <FileUploadSection
                  isExpanded={expandedSection === 'attachments'}
                  onToggle={() => toggleSection('attachments')}
                  files={attachmentFiles}
                  onFileAdd={handleFileAdd}
                  onFileRemove={handleFileRemove}
                  darkMode={darkMode}
                />

                {/* Approvers Section */}
                <div className="mb-6 px-4 py-3 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 border border-blue-200/60 dark:border-blue-800/40 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Approvers Selection
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowApproverSelection(!showApproverSelection)}
                      className="text-xs text-almet-sapphire hover:text-almet-cloud-burst font-medium flex items-center gap-1.5"
                    >
                      {showApproverSelection ? 'Hide Details' : 'Show Details'}
                      {showApproverSelection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Default Approvers Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="bg-white flex gap-8 dark:bg-gray-800/50 p-2 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                        Finance Approver :
                      </label>
                      <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
                        {selectedFinanceApprover ? 
                          financeApprovers.find(f => f.id === selectedFinanceApprover)?.name || 'Not selected'
                          : 'Not selected'}
                      </div>
                    </div>

                    <div className="bg-white flex gap-8 dark:bg-gray-800/50 p-2 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                        HR Representative :
                      </label>
                      <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
                        {selectedHrRepresentative ? 
                          hrRepresentatives.find(h => h.id === selectedHrRepresentative)?.name || 'Not selected'
                          : 'Not selected'}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Selection */}
                  {showApproverSelection && (
                    <div className="pt-3 border-t border-blue-200/60 dark:border-blue-800/40 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                          Change Finance Approver (Optional)
                        </label>
                        <SearchableDropdown
                          options={financeApprovers.map(approver => ({ 
                            value: approver.id, 
                            label: `${approver.name}${approver.id === defaultFinanceApprover?.id ? ' (Default)' : ''}` 
                          }))}
                          value={selectedFinanceApprover}
                          onChange={handleFinanceApproverChange}
                          placeholder="Select finance approver"
                          allowUncheck={false}
                          darkMode={darkMode}
                        />
                        {selectedFinanceApprover && selectedFinanceApprover !== defaultFinanceApprover?.id && (
                          <button
                            type="button"
                            onClick={() => {
                              if (defaultFinanceApprover?.id) {
                                handleFinanceApproverChange(defaultFinanceApprover.id);
                              }
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            ← Reset to default
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                          Change HR Representative (Optional)
                        </label>
                        <SearchableDropdown
                          options={hrRepresentatives.map(rep => ({ 
                            value: rep.id, 
                            label: `${rep.name}${rep.id === defaultHrRepresentative?.id ? ' (Default)' : ''}` 
                          }))}
                          value={selectedHrRepresentative}
                          onChange={handleHrRepresentativeChange}
                          placeholder="Select HR representative"
                          allowUncheck={false}
                          darkMode={darkMode}
                        />
                        {selectedHrRepresentative && selectedHrRepresentative !== defaultHrRepresentative?.id && (
                          <button
                            type="button"
                            onClick={() => {
                              if (defaultHrRepresentative?.id) {
                                handleHrRepresentativeChange(defaultHrRepresentative.id);
                              }
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            ← Reset to default
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-5 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, start_date: '', end_date: '', comment: '' }));
                      setSchedules([{ id: 1, date: '', from_location: '', to_location: '', notes: '' }]);
                      setHotels([{ id: 1, hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }]);
                      setAttachmentFiles([]);
                      
                      if (defaultFinanceApprover?.id) {
                        setSelectedFinanceApprover(defaultFinanceApprover.id);
                        setFormData(prev => ({ ...prev, finance_approver_id: defaultFinanceApprover.id }));
                      }
                      if (defaultHrRepresentative?.id) {
                        setSelectedHrRepresentative(defaultHrRepresentative.id);
                        setFormData(prev => ({ ...prev, hr_representative_id: defaultHrRepresentative.id }));
                      }
                      
                      setShowApproverSelection(false);
                    }}
                    className="px-5 py-2.5 text-xs font-medium border border-almet-mystic dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
                  >
                    Clear Form
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !formData.start_date || !formData.end_date || !formData.travel_type_id || !formData.transport_type_id || !formData.purpose_id} 
                    className="px-6 py-2.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          
          </div>
        )}
{activeTab === 'my-requests' && (
  <div className="space-y-5">
    
    {/* Statistics */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Pending" value={dashboardStats.pending_requests} icon={Clock} color="text-orange-600" bgColor="bg-orange-50 dark:bg-orange-900/10" />
      <StatCard title="Approved" value={dashboardStats.approved_trips} icon={CheckCircle} color="text-green-600" bgColor="bg-green-50 dark:bg-green-900/10" />
      <StatCard title="Days (Year)" value={dashboardStats.total_days_this_year} icon={Calendar} color="text-almet-sapphire" bgColor="bg-blue-50 dark:bg-blue-900/10" />
      <StatCard title="Upcoming" value={dashboardStats.upcoming_trips} icon={Plane} color="text-almet-astral" bgColor="bg-sky-50 dark:bg-sky-900/10" />
    </div>

    {/* My Requests List with Pagination */}
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/30 dark:border-almet-comet/30 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-almet-sapphire/5 to-transparent dark:from-almet-sapphire/10 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">My Requests</h2>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">View and track all your business trip requests</p>
        </div>
        <button 
          onClick={handleExportMyTrips} 
          className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm font-medium"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
          <thead className="bg-almet-mystic/30 dark:bg-gray-700/30">
            <tr>
              {['Request ID', 'Type', 'Destination', 'Start', 'End', 'Days', 'Status', 'Files', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/10 dark:divide-almet-comet/10">
            {paginatedMyRequests.map(request => (
              <tr key={request.id} className="hover:bg-almet-mystic/10 dark:hover:bg-gray-700/20 transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-almet-cloud-burst dark:text-white">{request.request_id}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.travel_type_name}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  {request.schedules?.[0]?.to_location || '-'}
                </td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.start_date}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.end_date}</td>
                <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{request.number_of_days}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    request.status.includes('PENDING') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                    request.status.includes('REJECTED') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {request.status_display}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleOpenAttachments(request)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-almet-sapphire hover:bg-almet-sapphire/10 dark:hover:bg-almet-sapphire/20 rounded-lg transition-all"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{request.attachments_count || 0}</span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleOpenRequestDetail(request)}
                    className="text-xs text-almet-sapphire hover:text-almet-cloud-burst font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {paginatedMyRequests.length === 0 && (
              <tr>
                <td colSpan="9" className="px-4 py-12 text-center">
                  <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                  <p className="text-xs font-medium text-almet-waterloo dark:text-almet-bali-hai">No requests yet</p>
                  <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">Your submitted requests will appear here</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination for My Requests */}
      {myRequests.length > itemsPerPage && (
        <div className="p-4 border-t border-almet-mystic/20 dark:border-almet-comet/20">
          <Pagination
            currentPage={myRequestsPage}
            totalPages={getTotalPages(myRequests.length)}
            totalItems={myRequests.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setMyRequestsPage}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  </div>
)}
        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-5">
            {userPermissions.is_admin && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                    <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-purple-900 dark:text-purple-200">Admin Mode Active</h3>
                    <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
                      You can approve/reject requests as Line Manager, Finance, and HR.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/30 dark:border-almet-comet/30 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-almet-sapphire/5 to-transparent dark:from-almet-sapphire/10 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Pending Approvals</h2>
                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
                  {pendingApprovals.total_pending} Pending
                </span>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Line Manager Requests */}
                {pendingApprovals.line_manager_requests?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Line Manager Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingApprovals.line_manager_requests.map(request => (
                        <div key={request.id} className="border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-4 bg-blue-50/30 dark:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-1">{request.employee_name}</h4>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {request.travel_type_name} • {request.transport_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                              {request.comment && (
                                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-2 italic bg-white/50 dark:bg-gray-800/50 p-2 rounded">"{request.comment}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectionModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Finance Requests */}
                {pendingApprovals.finance_requests?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      Finance Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingApprovals.finance_requests.map(request => (
                        <div key={request.id} className="border border-green-200/60 dark:border-green-800/40 rounded-xl p-4 bg-green-50/30 dark:bg-green-900/10 hover:border-green-300 dark:hover:border-green-700 transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                                <span className="text-xs bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded font-medium text-green-700 dark:text-green-300">Finance Review</span>
                              </div>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {request.travel_type_name} • {request.transport_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectionModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HR Requests */}
                {pendingApprovals.hr_requests?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                        <Settings className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      </div>
                      HR Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingApprovals.hr_requests.map(request => (
                        <div key={request.id} className="border border-sky-200/60 dark:border-sky-800/40 rounded-xl p-4 bg-sky-50/30 dark:bg-sky-900/10 hover:border-sky-300 dark:hover:border-sky-700 transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                                <span className="text-xs bg-sky-100 dark:bg-sky-800/50 px-2 py-0.5 rounded font-medium text-sky-700 dark:text-sky-300">HR Review</span>
                              </div>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {request.travel_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectionModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingApprovals.total_pending === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs font-medium text-almet-waterloo dark:text-almet-bali-hai">No pending approval requests</p>
                    <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">All requests have been processed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval History Tab with Pagination */}
        {activeTab === 'history' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/30 dark:border-almet-comet/30 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-almet-sapphire/5 to-transparent dark:from-almet-sapphire/10 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Approval History</h2>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">View your past approval decisions</p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all shadow-sm font-medium"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="px-6 py-4 bg-almet-mystic/10 dark:bg-gray-900/20 border-b border-almet-mystic/30 dark:border-almet-comet/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Action</label>
                      <select
                        value={historyFilters.action}
                        onChange={(e) => setHistoryFilters(prev => ({ ...prev, action: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">All Actions</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Employee</label>
                      <input
                        type="text"
                        value={historyFilters.employee}
                        onChange={(e) => setHistoryFilters(prev => ({ ...prev, employee: e.target.value }))}
                        placeholder="Search employee"
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Date From</label>
                      <input
                        type="date"
                        value={historyFilters.dateFrom}
                        onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Date To</label>
                      <input
                        type="date"
                        value={historyFilters.dateTo}
                        onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={clearHistoryFilters}
                      className="px-3 py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  <thead className="bg-almet-mystic/30 dark:bg-gray-700/30">
                    <tr>
                      {['Request ID', 'Employee', 'Travel Type', 'Dates', 'Status', 'Action', 'Date', 'Comment'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/10 dark:divide-almet-comet/10">
                    {paginatedHistory.map((item, index) => (
                      <tr key={`${item.request_id}-${index}`} className="hover:bg-almet-mystic/10 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-almet-cloud-burst dark:text-white">{item.request_id}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.employee_name}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.travel_type}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.destination}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            item.status.includes('Approved') 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                              : item.status.includes('Rejected')
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            item.action === 'Approved' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {item.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {new Date(item.date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai italic">
                          {item.comment || '-'}
                        </td>
                      </tr>
                    ))}
                    {paginatedHistory.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <History className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">No approval history found</p>
                          <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">Your approval decisions will appear here</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination for History */}
              {filteredHistory.length > itemsPerPage && (
                <div className="p-4 border-t border-almet-mystic/20 dark:border-almet-comet/20">
                  <Pagination
                    currentPage={historyPage}
                    totalPages={getTotalPages(filteredHistory.length)}
                    totalItems={filteredHistory.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setHistoryPage}
                    darkMode={darkMode}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Requests Tab with Pagination */}
        {activeTab === 'all' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/30 dark:border-almet-comet/30 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-almet-sapphire/5 to-transparent dark:from-almet-sapphire/10 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">All Requests</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all shadow-sm font-medium"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </button>
                  {canExportAll && (
                    <button 
                      onClick={handleExportAllTrips} 
                      className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm font-medium"
                    >
                      <Download className="w-3 h-3" />
                      Export All
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="px-6 py-4 bg-almet-mystic/10 dark:bg-gray-900/20 border-b border-almet-mystic/30 dark:border-almet-comet/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">All Status</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="PENDING_LINE_MANAGER">Pending Line Manager</option>
                        <option value="PENDING_FINANCE">Pending Finance</option>
                        <option value="PENDING_HR">Pending HR</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED_LINE_MANAGER">Rejected by Line Manager</option>
                        <option value="REJECTED_FINANCE">Rejected by Finance</option>
                        <option value="REJECTED_HR">Rejected by HR</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Employee</label>
                      <input
                        type="text"
                        value={filters.employee}
                        onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                        placeholder="Search employee"
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Department</label>
                      <input
                        type="text"
                        value={filters.department}
                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Search department"
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Date From</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Date To</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  <thead className="bg-almet-mystic/30 dark:bg-gray-700/30">
                    <tr>
                      {['Request ID', 'Employee', 'Department', 'Type',  'Start', 'End', 'Days', 'Status', 'Amount', 'Files', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/10 dark:divide-almet-comet/10">
                    {paginatedAllRequests.map(request => (
                      <tr key={request.id} className="hover:bg-almet-mystic/10 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-almet-cloud-burst dark:text-white">{request.request_id}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.employee_name}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.department_name}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.travel_type_name}</td>
                      
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.start_date}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.end_date}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{request.number_of_days}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            request.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            request.status.includes('PENDING') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                            request.status.includes('REJECTED') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {request.status_display}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {request.finance_amount ? `${request.finance_amount} AZN` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleOpenAttachments(request)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-almet-sapphire hover:bg-almet-sapphire/10 dark:hover:bg-almet-sapphire/20 rounded-lg transition-all"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{request.attachments_count || 0}</span>
                          </button>
                        </td>
                            <td className="px-4 py-3">
                          {/* <button
                            onClick={() => handleOpenAttachments(request)}
                            className="text-xs text-almet-sapphire hover:text-almet-cloud-burst font-medium"
                          >
                            View
                          </button> */}
                              <button
      onClick={() => handleOpenRequestDetail(request)}
      className="text-xs text-almet-sapphire hover:text-almet-cloud-burst font-medium"
    >
      View Details
    </button>
                        </td>
                      </tr>
                    ))}
                    {paginatedAllRequests.length === 0 && (
                      <tr>
                        <td colSpan="12" className="px-4 py-12 text-center">
                          <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">No requests found</p>
                          <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination for All Requests */}
              {filteredRequests.length > itemsPerPage && (
                <div className="p-4 border-t border-almet-mystic/20 dark:border-almet-comet/20">
                  <Pagination
                    currentPage={allRequestsPage}
                    totalPages={getTotalPages(filteredRequests.length)}
                    totalItems={filteredRequests.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setAllRequestsPage}
                    darkMode={darkMode}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ApprovalModal
        show={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setApprovalAmount('');
          setApprovalNote('');
          setSelectedRequest(null);
        }}
        selectedRequest={selectedRequest}
        approvalAmount={approvalAmount}
        setApprovalAmount={setApprovalAmount}
        approvalNote={approvalNote}
        setApprovalNote={setApprovalNote}
        onApprove={handleApprove}
        loading={loading}
      />

      <RejectionModal
        show={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          setRejectionReason('');
          setSelectedRequest(null);
        }}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onReject={handleReject}
        loading={loading}
      />

      <AttachmentsModal
        show={showAttachmentsModal}
        onClose={() => {
          setShowAttachmentsModal(false);
          setSelectedRequestForAttachments(null);
        }}
        requestId={selectedRequestForAttachments?.request_id}
        requestNumber={selectedRequestForAttachments?.request_id}
        canUpload={selectedRequestForAttachments?.status !== 'APPROVED' && selectedRequestForAttachments?.status !== 'CANCELLED'}
        canDelete={userPermissions.is_admin || selectedRequestForAttachments?.employee_email === currentUserEmail}
        onUpdate={() => {
          fetchMyRequests();
          fetchAllRequests();
        }}
      />

      {/* Request Detail Modal */}
<RequestDetailModal
  show={showRequestDetailModal}
  onClose={() => {
    setShowRequestDetailModal(false);
    setSelectedRequestForDetail(null);
  }}
  requestId={selectedRequestForDetail}
  onOpenAttachments={handleOpenAttachments}
  darkMode={darkMode}
/>
    </DashboardLayout>
  );
}