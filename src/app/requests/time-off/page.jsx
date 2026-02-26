'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Calendar,Download , Upload , Edit,FilterIcon ,Search , CheckCircle,TrendingUp ,TrendingDown , XCircle, AlertCircle, Plus, Eye, X, Check, Ban, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import timeOffService from '@/services/timeOffService';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { LoadingSpinner, ErrorDisplay } from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { useRef } from 'react';
const TimeOffPage = () => {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
    const [teamBalances, setTeamBalances] = useState([]);
  const [balanceStats, setBalanceStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  const [error, setError] = useState(null);
  
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', requestId: null });

  const [filteredTeamBalances, setFilteredTeamBalances] = useState([]); // ✅ NEW

  const [showUpdateBalanceModal, setShowUpdateBalanceModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [updateBalanceForm, setUpdateBalanceForm] = useState({
    new_balance: ''
  });
  const [updateBalanceErrors, setUpdateBalanceErrors] = useState({});
  const [updatingBalance, setUpdatingBalance] = useState(false);
  
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);
  // ✅ NEW: Filter state
  const [balanceFilters, setBalanceFilters] = useState({
    search: '',

    balanceStatus: 'all' // all, high, medium, low, empty
  });

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  const toast = useToast();
 
   const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('employee_id');
    setEmployeeId(id);
  }, []);


  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading && accessInfo) {
      loadTabData();
    }
  }, [activeTab, accessInfo]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, accessInfoRes] = await Promise.all([
        timeOffService.getMyBalance(),
        timeOffService.getMyAccessInfo()
      ]);

      setBalance(balanceRes.data);
      setAccessInfo(accessInfoRes.data);
  
    } catch (err) {
      console.error('❌ Load error:', err);
      setError(err.response?.data?.error || 'Failed to load data');
      toast.showError('Failed to load time off data');
    } finally {
      setLoading(false);
    }
  };

  
    const loadTabData = async () => {
    try {
      if (activeTab === 'my-requests') {
        const res = await timeOffService.getMyRequests();
        setMyRequests(res.data.requests || []);
      } else if (activeTab === 'all-requests' && accessInfo?.can_view_all) {
        const res = await timeOffService.getAllRequests();
        setAllRequests(res.data.results || []);
      } else if (activeTab === 'approvals' && accessInfo?.is_manager) {
        const res = await timeOffService.getPendingApprovals();
        setPendingApprovals(res.data.requests || []);
      } else if (activeTab === 'calendar') {
        const res = await timeOffService.getMyRequests();
        setMyRequests(res.data.requests || []);
      } else if (activeTab === 'team-balances' && (accessInfo?.is_manager || accessInfo?.can_view_all)) {
        const res = await timeOffService.getTeamBalances();
        setTeamBalances(res.data.balances || []);
        setFilteredTeamBalances(res.data.balances || []); // ✅ Initialize filtered data
        setBalanceStats(res.data.statistics || null);
      }
    } catch (err) {
      console.error('❌ Load tab data error:', err);
      toast.showError('Failed to load requests');
    }
  };

  const formatTimeInput = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    const hours = numbers.slice(0, 2);
    const minutes = numbers.slice(2, 4);
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (field, value) => {
    const formatted = formatTimeInput(value);
    setFormData({...formData, [field]: formatted});
  };

  const validateTimeFormat = (time) => {
    if (!time) return false;
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.date) {
      errors.date = 'Date is required';
    } else if (formData.date < today) {
      errors.date = 'Cannot request time off for past dates';
    }

    if (!formData.start_time) {
      errors.start_time = 'Start time is required';
    } else if (!validateTimeFormat(formData.start_time)) {
      errors.start_time = 'Invalid time format. Use HH:MM (00:00 - 23:59)';
    }

    if (!formData.end_time) {
      errors.end_time = 'End time is required';
    } else if (!validateTimeFormat(formData.end_time)) {
      errors.end_time = 'Invalid time format. Use HH:MM (00:00 - 23:59)';
    }

    if (formData.start_time && formData.end_time && validateTimeFormat(formData.start_time) && validateTimeFormat(formData.end_time)) {
      if (formData.start_time >= formData.end_time) {
        errors.end_time = 'End time must be after start time';
      }

      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const duration = (end - start) / (1000 * 60 * 60);
      
      if (duration > 8) {
        errors.end_time = 'Maximum 8 hours per request';
      }
      
      if (balance && duration > parseFloat(balance.current_balance_hours)) {
        errors.duration = `Insufficient balance. Available: ${balance.current_balance_hours}h`;
      }
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.showWarning('Please fix form errors');
      return;
    }

    setSubmitting(true);
    try {
      await timeOffService.createRequest({
        employee: employeeId,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        reason: formData.reason
      });

      toast.showSuccess('Time off request submitted successfully');
      setShowNewRequestModal(false);
      setFormData({ date: '', start_time: '', end_time: '', reason: '' });
      setFormErrors({});
      loadInitialData();
      loadTabData();
    } catch (err) {
      console.error('❌ Submit error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit request';
      toast.showError(errorMsg);
      
      if (err.response?.data) {
        setFormErrors(err.response.data);
      }
    } finally {
      setSubmitting(false);
    }
  };
const handleUpdateBalance = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!updateBalanceForm.new_balance) {
      errors.new_balance = 'New balance is required';
    } else if (parseFloat(updateBalanceForm.new_balance) < 0) {
      errors.new_balance = 'Balance cannot be negative';
    }
    

    
    setUpdateBalanceErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.showWarning('Please fix form errors');
      return;
    }
    
    setUpdatingBalance(true);
    try {
      const res = await timeOffService.updateBalance(selectedBalance.id, {
        new_balance: updateBalanceForm.new_balance,
    
      });
      
      toast.showSuccess(`Balance updated: ${res.data.old_balance}h → ${res.data.new_balance}h`);
      setShowUpdateBalanceModal(false);
      setSelectedBalance(null);
      setUpdateBalanceForm({ new_balance: '' });
      setUpdateBalanceErrors({});
      loadTabData(); // Refresh data
    } catch (err) {
      console.error('❌ Update balance error:', err);
      toast.showError(err.response?.data?.error || 'Failed to update balance');
    } finally {
      setUpdatingBalance(false);
    }
  };

  // ✅ Handle Bulk Upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
        toast.showError('Invalid file type. Please upload Excel or CSV file');
        return;
      }
      
      setUploadFile(file);
      setUploadResults(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      toast.showWarning('Please select a file');
      return;
    }
    
    setUploading(true);
    try {
      const res = await timeOffService.bulkUploadBalances(uploadFile);
      
      setUploadResults(res.data);
      
      if (res.data.failed_count === 0) {
        toast.showSuccess(`✅ All ${res.data.success_count} balances updated successfully!`);
      } else {
        toast.showWarning(`⚠️ ${res.data.success_count} succeeded, ${res.data.failed_count} failed`);
      }
      
      loadTabData(); // Refresh data
    } catch (err) {
      console.error('❌ Bulk upload error:', err);
      toast.showError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await timeOffService.downloadBalanceTemplate();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'timeoff_balances_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.showSuccess('Template downloaded successfully');
    } catch (err) {
      console.error('❌ Download template error:', err);
      toast.showError('Failed to download template');
    }
  };

  const resetUploadModal = () => {
    setShowBulkUploadModal(false);
    setUploadFile(null);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleApproveRequest = async (requestId) => {
    setConfirmModal({ isOpen: false, type: '', requestId: null });
    try {
      await timeOffService.approveRequest(requestId);
      toast.showSuccess('Request approved successfully');
      loadInitialData();
      loadTabData();
    } catch (err) {
      console.error('❌ Approve error:', err);
      toast.showError(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    setConfirmModal({ isOpen: false, type: '', requestId: null });
    try {
      await timeOffService.rejectRequest(requestId, { rejection_reason: reason || 'No reason provided' });
      toast.showSuccess('Request rejected');
      loadInitialData();
      loadTabData();
    } catch (err) {
      console.error('❌ Reject error:', err);
      toast.showError(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    setConfirmModal({ isOpen: false, type: '', requestId: null });
    try {
      await timeOffService.cancelRequest(requestId);
      toast.showSuccess('Request cancelled successfully');
      loadInitialData();
      loadTabData();
    } catch (err) {
      console.error('❌ Cancel error:', err);
      toast.showError(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: AlertCircle },
      APPROVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: XCircle },
      CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400', icon: Ban }
    };
    
    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end || !validateTimeFormat(start) || !validateTimeFormat(end)) return '0.0';
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    return ((endDate - startDate) / (1000 * 60 * 60)).toFixed(1);
  };

  const getCurrentPageData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getRequestsForDay = (day) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString().split('T')[0];
    return myRequests.filter(req => req.date === dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };
 useEffect(() => {
    if (activeTab === 'team-balances') {
      applyBalanceFilters();
    }
  }, [balanceFilters, teamBalances]);

  const applyBalanceFilters = () => {
    let filtered = [...teamBalances];

    // Search filter (name or employee ID)
    if (balanceFilters.search.trim()) {
      const searchLower = balanceFilters.search.toLowerCase();
      filtered = filtered.filter(b => 
        b.employee_name.toLowerCase().includes(searchLower) ||
        b.employee_id.toLowerCase().includes(searchLower)
      );
    }


    // Balance status filter
    if (balanceFilters.balanceStatus !== 'all') {
      filtered = filtered.filter(b => {
        const balance = parseFloat(b.current_balance_hours);
        switch (balanceFilters.balanceStatus) {
          case 'high': return balance > 3;
          case 'medium': return balance > 1 && balance <= 3;
          case 'low': return balance > 0 && balance <= 1;
          case 'empty': return balance === 0;
          default: return true;
        }
      });
    }

    setFilteredTeamBalances(filtered);
  };

  if (loading) return <LoadingSpinner message="Loading time off system..." />;
  if (error) return <ErrorDisplay error={error} onRetry={loadInitialData} />;

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Time Off Management</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage your monthly leave hours
                  {accessInfo && (
                    <span className="ml-2 text-xs font-medium text-almet-sapphire">
                      • {accessInfo.access_level}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </div>

            {/* Balance Cards */}
            {balance && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl p-4 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80 font-medium uppercase tracking-wide">Current Balance</p>
                      <p className="text-xl font-bold mt-2">{balance.current_balance_hours}h</p>
                    </div>
                    <Clock className="w-8 h-8 opacity-70" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Monthly Limit</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                        {balance.monthly_allowance_hours}h
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-almet-sapphire" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Used This Month</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                        {balance.used_hours_this_month}h
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-0">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8 overflow-x-auto">
              <button
                onClick={() => {setActiveTab('overview'); setCurrentPage(1);}}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {setActiveTab('calendar'); setCurrentPage(1);}}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'calendar'
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Calendar size={16} />
                Calendar
              </button>
              <button
                onClick={() => {setActiveTab('my-requests'); setCurrentPage(1);}}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'my-requests'
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                My Requests
              </button>
              {accessInfo?.can_view_all && (
                <button
                  onClick={() => {setActiveTab('all-requests'); setCurrentPage(1);}}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'all-requests'
                      ? 'border-almet-sapphire text-almet-sapphire'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Users size={16} />
                  All Requests
                </button>
              )}
              {accessInfo?.is_manager && (
                <button
                  onClick={() => {setActiveTab('approvals'); setCurrentPage(1);}}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'approvals'
                      ? 'border-almet-sapphire text-almet-sapphire'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Pending Approvals
                  {pendingApprovals.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-semibold">
                      {pendingApprovals.length}
                    </span>
                  )}
                </button>
              )}
              {(accessInfo?.is_manager || accessInfo?.can_view_all) && (
                <button
                  onClick={() => {setActiveTab('team-balances'); setCurrentPage(1);}}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'team-balances'
                      ? 'border-almet-sapphire text-almet-sapphire'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Clock size={16} />
                  Team Balances
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6 pb-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  {myRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No requests yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your time off history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myRequests.slice(0, 5).map((req) => (
                        <div 
                          key={req.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(req.date)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {formatTime(req.start_time)} - {formatTime(req.end_time)} • {req.duration_hours}h
                            </p>
                          </div>
                          {getStatusBadge(req.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">{myRequests.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                      <span className="text-base font-semibold text-green-600 dark:text-green-500">
                        {myRequests.filter(r => r.status === 'APPROVED').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                      <span className="text-base font-semibold text-yellow-600 dark:text-yellow-500">
                        {myRequests.filter(r => r.status === 'PENDING').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                      <span className="text-base font-semibold text-red-600 dark:text-red-500">
                        {myRequests.filter(r => r.status === 'REJECTED').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{monthName}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={previousMonth}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const requests = getRequestsForDay(day);
                      const isTodayDate = isToday(day);
                      
                      return (
                        <div
                          key={day}
                          className={`aspect-square border rounded-lg p-2 transition-all relative ${
                            isTodayDate
                              ? 'border-almet-sapphire bg-almet-sapphire/5 dark:bg-almet-sapphire/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          } ${requests.length > 0 ? 'cursor-pointer' : ''}`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          <div className={`text-sm font-medium ${
                            isTodayDate
                              ? 'text-almet-sapphire dark:text-almet-sapphire'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {day}
                          </div>

                          <div className="mt-1 space-y-0.5">
                            {requests.slice(0, 3).map((req) => (
                              <div
                                key={req.id}
                                onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                                className={`text-xs px-1.5 py-0.5 rounded truncate ${
                                  req.status === 'APPROVED'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : req.status === 'PENDING'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                    : req.status === 'REJECTED'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                                }`}
                                title={`${req.duration_hours}h - ${req.status}`}
                              >
                                {req.duration_hours}h
                              </div>
                            ))}
                            {requests.length > 3 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 px-1.5">
                                +{requests.length - 3} more
                              </div>
                            )}
                          </div>

                          {hoveredDay === day && requests.length > 0 && (
                            <div className="absolute z-10 bottom-full mb-2 left-0 bg-gray-900 dark:bg-gray-700 text-white p-3 rounded-lg shadow-lg min-w-[200px]">
                              <div className="text-xs font-semibold mb-2">
                                {requests.length} request{requests.length > 1 ? 's' : ''} on this day
                              </div>
                              <div className="space-y-1">
                                {requests.map(req => (
                                  <div key={req.id} className="text-xs">
                                    <div className="flex items-center gap-1">
                                      <span className={`w-2 h-2 rounded-full ${
                                        req.status === 'APPROVED' ? 'bg-green-400' :
                                        req.status === 'PENDING' ? 'bg-yellow-400' :
                                        req.status === 'REJECTED' ? 'bg-red-400' : 'bg-gray-400'
                                      }`} />
                                      <span>{formatTime(req.start_time)} - {formatTime(req.end_time)}</span>
                                    </div>
                                    <div className="text-gray-300 ml-3">{req.duration_hours}h • {req.status}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"></span>
                        <span className="text-gray-600 dark:text-gray-400">Approved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"></span>
                        <span className="text-gray-600 dark:text-gray-400">Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"></span>
                        <span className="text-gray-600 dark:text-gray-400">Rejected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700"></span>
                        <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MY REQUESTS TAB */}
            {activeTab === 'my-requests' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {getCurrentPageData(myRequests).map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{formatDate(req.date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatTime(req.start_time)} - {formatTime(req.end_time)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{req.duration_hours}h</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                                  className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                {req.can_cancel && req.status !== 'CANCELLED' && (
                                  <button
                                    onClick={() => setConfirmModal({ isOpen: true, type: 'cancel', requestId: req.id })}
                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Cancel Request"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {myRequests.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(myRequests.length / itemsPerPage)}
                    totalItems={myRequests.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    darkMode={darkMode}
                  />
                )}
              </div>
            )}

            {/* ALL REQUESTS TAB (Admin Only) */}
            {activeTab === 'all-requests' && accessInfo?.can_view_all && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {getCurrentPageData(allRequests).map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                              <div>
                                <p className="font-medium">{req.employee_name}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">{req.employee_id}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{formatDate(req.date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatTime(req.start_time)} - {formatTime(req.end_time)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{req.duration_hours}h</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                                className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {allRequests.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(allRequests.length / itemsPerPage)}
                    totalItems={allRequests.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    darkMode={darkMode}
                  />
                )}
              </div>
            )}

            {/* PENDING APPROVALS TAB (Manager Only) */}
            {activeTab === 'approvals' && accessInfo?.is_manager && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {getCurrentPageData(pendingApprovals).map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{req.employee_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{formatDate(req.date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatTime(req.start_time)} - {formatTime(req.end_time)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{req.duration_hours}h</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setConfirmModal({ isOpen: true, type: 'approve', requestId: req.id })}
                                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({ isOpen: true, type: 'reject', requestId: req.id })}
                                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                                <button
                                  onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                                  className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {pendingApprovals.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(pendingApprovals.length / itemsPerPage)}
                    totalItems={pendingApprovals.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    darkMode={darkMode}
                  />
                )}
              </div>
            )}

             {activeTab === 'team-balances' && (accessInfo?.is_manager || accessInfo?.can_view_all) && (
            <div className="space-y-6">
              {/* Statistics Cards - remains same */}
              {balanceStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Total Employees</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                          {balanceStats.employee_count}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-almet-sapphire" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Total Balance</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                          {balanceStats.total_balance_hours}h
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Total Used</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                          {balanceStats.total_used_hours}h
                        </p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Average Balance</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                          {balanceStats.average_balance_hours}h
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-almet-sapphire" />
                    </div>
                  </div>
                </div>
              )}
 {accessInfo?.is_admin && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </button>
              </div>
            )}
              {/* ✅ NEW: Filters Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FilterIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
                  {(balanceFilters.search || balanceFilters.balanceStatus !== 'all') && (
                    <button
                      onClick={resetBalanceFilters}
                      className="ml-auto text-xs text-almet-sapphire hover:text-almet-astral font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Employee
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={balanceFilters.search}
                        onChange={(e) => setBalanceFilters({...balanceFilters, search: e.target.value})}
                        placeholder="Name or Employee ID..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-0"
                      />
                    </div>
                  </div>

              

                  {/* Balance Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Balance Status
                    </label>
                    <select
                      value={balanceFilters.balanceStatus}
                      onChange={(e) => setBalanceFilters({...balanceFilters, balanceStatus: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-0"
                    >
                      <option value="all">All Balances</option>
                      <option value="high">High (&gt; 3h)</option>
                      <option value="medium">Medium (1-3h)</option>
                      <option value="low">Low (0-1h)</option>
                      <option value="empty">Empty (0h)</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTeamBalances.length}</span> of {teamBalances.length} employees
                    {balanceFilters.search && (
                      <span className="ml-2">
                        • Searching for "<span className="font-medium text-almet-sapphire">{balanceFilters.search}</span>"
                      </span>
                    )}
                  </p>
                </div>
              </div>

             <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              {filteredTeamBalances.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No employees found</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                       
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Current Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Monthly Allowance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Used This Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Last Reset</th>
                        {/* ✅ NEW: Actions Column */}
                        {accessInfo?.is_admin && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {getCurrentPageData(filteredTeamBalances).map((balance) => (
                        <tr key={balance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          {/* ... existing columns ... */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            <div>
                              <p className="font-medium">{balance.employee_name}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">{balance.employee_id}</p>
                            </div>
                          </td>
                         
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${
                                parseFloat(balance.current_balance_hours) > 3 
                                  ? 'text-green-600 dark:text-green-500' 
                                  : parseFloat(balance.current_balance_hours) > 1
                                  ? 'text-yellow-600 dark:text-yellow-500'
                                  : parseFloat(balance.current_balance_hours) > 0
                                  ? 'text-orange-600 dark:text-orange-500'
                                  : 'text-red-600 dark:text-red-500'
                              }`}>
                                {balance.current_balance_hours}h
                              </span>
                              {parseFloat(balance.current_balance_hours) === 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                  Empty
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {balance.monthly_allowance_hours}h
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {balance.used_hours_this_month}h
                              </span>
                              {parseFloat(balance.used_hours_this_month) > 0 && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-[60px]">
                                  <div 
                                    className="bg-almet-sapphire h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min((parseFloat(balance.used_hours_this_month) / parseFloat(balance.monthly_allowance_hours)) * 100, 100)}%`
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(balance.last_reset_date)}
                          </td>
                          {/* ✅ NEW: Update Button (Admin Only) */}
                          {accessInfo?.is_admin && (
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => {
                                  setSelectedBalance(balance);
                                  setUpdateBalanceForm({
                                    new_balance: balance.current_balance_hours,
                            
                                  });
                                  setShowUpdateBalanceModal(true);
                                }}
                                className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"
                                title="Update Balance"
                              >
                                <Edit size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

              {filteredTeamBalances.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredTeamBalances.length / itemsPerPage)}
                  totalItems={filteredTeamBalances.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}
          </div>
        </div>
 {showUpdateBalanceModal && selectedBalance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Balance</h3>
                  <button
                    onClick={() => {
                      setShowUpdateBalanceModal(false);
                      setSelectedBalance(null);
                      setUpdateBalanceForm({ new_balance: '', reason: '' });
                      setUpdateBalanceErrors({});
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateBalance} className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employee</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                    {selectedBalance.employee_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedBalance.employee_id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Balance: <span className="text-almet-sapphire font-semibold">{selectedBalance.current_balance_hours}h</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Balance (hours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={updateBalanceForm.new_balance}
                    onChange={(e) => setUpdateBalanceForm({...updateBalanceForm, new_balance: e.target.value})}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${
                      updateBalanceErrors.new_balance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter new balance..."
                  />
                  {updateBalanceErrors.new_balance && (
                    <p className="mt-1.5 text-xs text-red-500">{updateBalanceErrors.new_balance}</p>
                  )}
                </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowUpdateBalanceModal(false);
                  setSelectedBalance(null);
                  setUpdateBalanceForm({ new_balance: '', reason: '' });
                  setUpdateBalanceErrors({});
                }}
                className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingBalance}
                className="px-6 py-2.5 text-sm bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {updatingBalance ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Balance'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
     {/* ✅ NEW: BULK UPLOAD MODAL */}
    {showBulkUploadModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Upload Balances</h3>
              <button
                onClick={resetUploadModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Instructions</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Download the Excel template</li>
                <li>Fill in employee_id, new_balance, and reason (optional)</li>
                <li>Upload the completed file</li>
                <li>Review the results</li>
              </ol>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-almet-sapphire file:text-white hover:file:bg-almet-astral cursor-pointer"
              />
              {uploadFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: <span className="font-medium text-gray-900 dark:text-white">{uploadFile.name}</span>
                </p>
              )}
            </div>

            {/* Upload Results */}
            {uploadResults && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Upload Results</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-500">{uploadResults.success_count}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Success</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-500">{uploadResults.failed_count}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Failed</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{uploadResults.total_rows}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</p>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  {uploadResults.results && uploadResults.results.length > 0 && (
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Employee</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {uploadResults.results.map((result, index) => (
                            <tr key={index} className={result.status === 'success' ? 'bg-white dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/10'}>
                              <td className="px-3 py-2 text-gray-900 dark:text-white">{result.row}</td>
                              <td className="px-3 py-2">
                                <div>
                                  <p className="text-gray-900 dark:text-white font-medium">{result.employee_name || result.employee_id}</p>
                                  {result.status === 'success' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {result.old_balance}h → {result.new_balance}h
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {result.status === 'success' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                    <CheckCircle size={12} />
                                    Success
                                  </span>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                      <XCircle size={12} />
                                      Failed
                                    </span>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{result.error}</p>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={resetUploadModal}
                className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={!uploadFile || uploading}
                className="px-6 py-2.5 text-sm bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

        {/* NEW REQUEST MODAL */}
        {showNewRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Time Off Request</h3>
                  <button
                    onClick={() => {
                      setShowNewRequestModal(false); 
                      setFormErrors({}); 
                      setFormData({ date: '', start_time: '', end_time: '', reason: '' });
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent transition-all ${
                      formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.date && <p className="mt-1.5 text-xs text-red-500">{formErrors.date}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.start_time}
                      onChange={(e) => handleTimeChange('start_time', e.target.value)}
                      placeholder="HH:MM"
                      maxLength={5}
                      className={`w-full px-4 py-2.5 text-sm border outline-0 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-almet-sapphire focus:border-transparent transition-all ${
                        formErrors.start_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.start_time && <p className="mt-1.5 text-xs text-red-500">{formErrors.start_time}</p>}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: 09:00</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.end_time}
                      onChange={(e) => handleTimeChange('end_time', e.target.value)}
                      placeholder="HH:MM"
                      maxLength={5}
                      className={`w-full px-4 py-2.5 text-sm outline-0 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-almet-sapphire focus:border-transparent transition-all ${
                        formErrors.end_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.end_time && <p className="mt-1.5 text-xs text-red-500">{formErrors.end_time}</p>}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: 18:00</p>
                  </div>
                </div>

                {formData.start_time && formData.end_time && validateTimeFormat(formData.start_time) && validateTimeFormat(formData.end_time) && formData.start_time < formData.end_time && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Duration: {calculateDuration(formData.start_time, formData.end_time)} hours
                    </p>
                  </div>
                )}

                {formErrors.duration && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">{formErrors.duration}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    rows={4}
                    maxLength={200}
                    placeholder="Please provide a detailed reason for your time off request..."
                    className={`w-full px-4 py-3 outline-0 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent transition-all ${
                      formErrors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {formErrors.reason && <p className="text-xs text-red-500">{formErrors.reason}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {formData.reason.length}/200
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Current Balance:</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{balance?.current_balance_hours}h</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewRequestModal(false); 
                      setFormErrors({}); 
                      setFormData({ date: '', start_time: '', end_time: '', reason: '' });
                    }}
                    className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-sm bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
                  <button
                    onClick={() => {setShowDetailModal(false); setSelectedRequest(null);}}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Employee</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Status</p>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedRequest.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Duration</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.duration_hours} hours</p>
                    </div>
                    </div>

              <div className="mt-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Time</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatTime(selectedRequest.start_time)} - {formatTime(selectedRequest.end_time)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Reason</p>
              <p className="text-sm text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                {selectedRequest.reason}
              </p>
            </div>

            {selectedRequest.line_manager_name && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Line Manager</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.line_manager_name}</p>
              </div>
            )}

            {selectedRequest.status === 'APPROVED' && selectedRequest.approved_by_name && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <span className="font-medium">Approved by {selectedRequest.approved_by_name}</span>
                  <br />
                  <span className="text-xs">on {formatDate(selectedRequest.approved_at)}</span>
                </p>
              </div>
            )}

            {selectedRequest.status === 'REJECTED' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium uppercase tracking-wide mb-2">Rejection Reason</p>
                <p className="text-sm text-red-700 dark:text-red-300">{selectedRequest.rejection_reason || 'No reason provided'}</p>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Clock size={12} className="mr-1.5" />
              Created on {formatDate(selectedRequest.created_at)}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
            <button
              onClick={() => {setShowDetailModal(false); setSelectedRequest(null);}}
              className="px-5 py-2.5 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* CONFIRMATION MODALS */}
    <ConfirmationModal
      isOpen={confirmModal.isOpen && confirmModal.type === 'approve'}
      onClose={() => setConfirmModal({ isOpen: false, type: '', requestId: null })}
      onConfirm={() => handleApproveRequest(confirmModal.requestId)}
      title="Approve Request"
      message="Are you sure you want to approve this time off request? The hours will be deducted from the employee's balance."
      confirmText="Approve"
      cancelText="Cancel"
      type="success"
      darkMode={darkMode}
    />

    <ConfirmationModal
      isOpen={confirmModal.isOpen && confirmModal.type === 'reject'}
      onClose={() => setConfirmModal({ isOpen: false, type: '', requestId: null })}
      onConfirm={() => {
        const reason = prompt('Please provide a rejection reason:');
        if (reason) handleRejectRequest(confirmModal.requestId, reason);
      }}
      title="Reject Request"
      message="Are you sure you want to reject this time off request? Please provide a reason when you click confirm."
      confirmText="Reject"
      cancelText="Cancel"
      type="danger"
      darkMode={darkMode}
    />

    <ConfirmationModal
      isOpen={confirmModal.isOpen && confirmModal.type === 'cancel'}
      onClose={() => setConfirmModal({ isOpen: false, type: '', requestId: null })}
      onConfirm={() => handleCancelRequest(confirmModal.requestId)}
      title="Cancel Request"
      message="Are you sure you want to cancel this request? If it was approved, the hours will be refunded to your balance."
      confirmText="Yes, Cancel"
      cancelText="No, Keep"
      type="danger"
      darkMode={darkMode}
    />
  </div>
</DashboardLayout>
);
};
export default TimeOffPage;
