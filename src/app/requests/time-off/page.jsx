'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Calendar, Edit, FilterIcon, Search,
  CheckCircle, XCircle, AlertCircle, Plus, Eye, X, Check,
  Ban, Users, ChevronLeft, ChevronRight
} from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import timeOffService from '@/services/timeOffService';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { LoadingSpinner, ErrorDisplay } from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';

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

  const [filteredTeamBalances, setFilteredTeamBalances] = useState([]);

  const [showUpdateBalanceModal, setShowUpdateBalanceModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [updateBalanceForm, setUpdateBalanceForm] = useState({ new_balance: '' });
  const [updateBalanceErrors, setUpdateBalanceErrors] = useState({});
  const [updatingBalance, setUpdatingBalance] = useState(false);

  const [balanceFilters, setBalanceFilters] = useState({
    search: '',
    balanceStatus: 'all'
  });

  const [formData, setFormData] = useState({
    date: '', start_time: '', end_time: '', reason: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    if (activeTab === 'team-balances') {
      applyBalanceFilters();
    }
  }, [balanceFilters, teamBalances]);

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
        const res = await timeOffService.getAllRequests();
        setMyRequests(res.data.requests || []);
      } else if (activeTab === 'team-balances' && (accessInfo?.is_manager || accessInfo?.can_view_all)) {
        const res = await timeOffService.getTeamBalances();
        setTeamBalances(res.data.balances || []);
        setFilteredTeamBalances(res.data.balances || []);
        setBalanceStats(res.data.statistics || null);
      }
    } catch (err) {
      toast.showError('Failed to load requests');
    }
  };

  // ==================== FORM HELPERS ====================

  const formatTimeInput = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
  };

  const handleTimeChange = (field, value) => {
    setFormData({ ...formData, [field]: formatTimeInput(value) });
  };

  const validateTimeFormat = (time) => {
    if (!time) return false;
    return /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(time);
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
      errors.start_time = 'Invalid time format. Use HH:MM';
    }

    if (!formData.end_time) {
      errors.end_time = 'End time is required';
    } else if (!validateTimeFormat(formData.end_time)) {
      errors.end_time = 'Invalid time format. Use HH:MM';
    }

    if (formData.start_time && formData.end_time &&
        validateTimeFormat(formData.start_time) && validateTimeFormat(formData.end_time)) {
      if (formData.start_time >= formData.end_time) {
        errors.end_time = 'End time must be after start time';
      }

      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const duration = (end - start) / (1000 * 60 * 60);

      if (duration > 8) errors.end_time = 'Maximum 8 hours per request';
      if (balance && duration > parseFloat(balance.current_balance_hours)) {
        errors.duration = `Insufficient balance. Available: ${balance.current_balance_hours}h`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.showWarning('Please fix form errors'); return; }

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
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit request';
      toast.showError(errorMsg);
      if (err.response?.data) setFormErrors(err.response.data);
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
    if (Object.keys(errors).length > 0) { toast.showWarning('Please fix form errors'); return; }

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
      loadTabData();
    } catch (err) {
      toast.showError(err.response?.data?.error || 'Failed to update balance');
    } finally {
      setUpdatingBalance(false);
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
      toast.showError(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  const applyBalanceFilters = () => {
    let filtered = [...teamBalances];

    if (balanceFilters.search.trim()) {
      const searchLower = balanceFilters.search.toLowerCase();
      filtered = filtered.filter(b =>
        b.employee_name.toLowerCase().includes(searchLower) ||
        b.employee_id.toLowerCase().includes(searchLower)
      );
    }

    if (balanceFilters.balanceStatus !== 'all') {
      filtered = filtered.filter(b => {
        const bal = parseFloat(b.current_balance_hours);
        switch (balanceFilters.balanceStatus) {
          case 'high': return bal > 3;
          case 'medium': return bal > 1 && bal <= 3;
          case 'low': return bal > 0 && bal <= 1;
          case 'empty': return bal === 0;
          default: return true;
        }
      });
    }

    setFilteredTeamBalances(filtered);
  };

  const resetBalanceFilters = () => {
    setBalanceFilters({ search: '', balanceStatus: 'all' });
  };

  // ==================== DISPLAY HELPERS ====================

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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (timeStr) => timeStr.substring(0, 5);
  const calculateDuration = (start, end) => {
    if (!start || !end || !validateTimeFormat(start) || !validateTimeFormat(end)) return '0.0';
    const s = new Date(`2000-01-01T${start}`);
    const e = new Date(`2000-01-01T${end}`);
    return ((e - s) / (1000 * 60 * 60)).toFixed(1);
  };

  const getCurrentPageData = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  // ==================== CALENDAR HELPERS ====================

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      startingDayOfWeek: new Date(year, month, 1).getDay()
    };
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
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">{balance.monthly_allowance_hours}h</p>
                    </div>
                    <Calendar className="w-8 h-8 text-almet-sapphire" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Used This Month</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">{balance.used_hours_this_month}h</p>
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
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
                { key: 'my-requests', label: 'My Requests' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-almet-sapphire text-almet-sapphire'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}

              {accessInfo?.can_view_all && (
                <button
                  onClick={() => { setActiveTab('all-requests'); setCurrentPage(1); }}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'all-requests'
                      ? 'border-almet-sapphire text-almet-sapphire'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Users size={16} />
                  All Requests
                </button>
              )}

              {accessInfo?.is_manager && (
                <button
                  onClick={() => { setActiveTab('approvals'); setCurrentPage(1); }}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'approvals'
                      ? 'border-almet-sapphire text-almet-sapphire'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                  onClick={() => { setActiveTab('team-balances'); setCurrentPage(1); }}
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
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myRequests.slice(0, 5).map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
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
                      <span className="text-base font-semibold text-green-600">{myRequests.filter(r => r.status === 'APPROVED').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                      <span className="text-base font-semibold text-yellow-600">{myRequests.filter(r => r.status === 'PENDING').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                      <span className="text-base font-semibold text-red-600">{myRequests.filter(r => r.status === 'REJECTED').length}</span>
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
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Today
                      </button>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide py-2">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const requests = getRequestsForDay(day);
                      const isTodayDate = isToday(day);
                      return (
                        <div
                          key={day}
                          className={`aspect-square border rounded-lg p-2 transition-all relative ${
                            isTodayDate
                              ? 'border-almet-sapphire bg-almet-sapphire/5'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          } ${requests.length > 0 ? 'cursor-pointer' : ''}`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          <div className={`text-sm font-medium ${isTodayDate ? 'text-almet-sapphire' : 'text-gray-900 dark:text-white'}`}>{day}</div>
                          <div className="mt-1 space-y-0.5">
                            {requests.slice(0, 3).map(req => (
                              <div
                                key={req.id}
                                onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                                className={`text-xs px-1.5 py-0.5 rounded truncate ${
                                  req.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' :
                                  req.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' :
                                  req.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700' :
                                  'bg-gray-100 dark:bg-gray-900/30 text-gray-700'
                                }`}
                              >
                                {req.duration_hours}h
                              </div>
                            ))}
                          </div>
                          {hoveredDay === day && requests.length > 0 && (
                            <div className="absolute z-10 bottom-full mb-2 left-0 bg-gray-900 dark:bg-gray-700 text-white p-3 rounded-lg shadow-lg min-w-[200px]">
                              <div className="text-xs font-semibold mb-2">{requests.length} request{requests.length > 1 ? 's' : ''}</div>
                              {requests.map(req => (
                                <div key={req.id} className="text-xs">
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${req.status === 'APPROVED' ? 'bg-green-400' : req.status === 'PENDING' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                                    <span>{formatTime(req.start_time)} - {formatTime(req.end_time)}</span>
                                  </div>
                                  <div className="text-gray-300 ml-3">{req.duration_hours}h • {req.status}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-xs">
                    {['Approved', 'Pending', 'Rejected', 'Cancelled'].map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded border ${
                          s === 'Approved' ? 'bg-green-100 border-green-300' :
                          s === 'Pending' ? 'bg-yellow-100 border-yellow-300' :
                          s === 'Rejected' ? 'bg-red-100 border-red-300' :
                          'bg-gray-100 border-gray-300'
                        }`} />
                        <span className="text-gray-600 dark:text-gray-400">{s}</span>
                      </div>
                    ))}
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
                          {['Date', 'Time', 'Duration', 'Reason', 'Status', 'Actions'].map(h => (
                            <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {getCurrentPageData(myRequests).map(req => (
                          <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatDate(req.date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatTime(req.start_time)} - {formatTime(req.end_time)}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{req.duration_hours}h</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }} className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"><Eye size={16} /></button>
                                {req.can_cancel && req.status !== 'CANCELLED' && (
                                  <button onClick={() => setConfirmModal({ isOpen: true, type: 'cancel', requestId: req.id })} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><X size={16} /></button>
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
                  <Pagination currentPage={currentPage} totalPages={Math.ceil(myRequests.length / itemsPerPage)} totalItems={myRequests.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} darkMode={darkMode} />
                )}
              </div>
            )}

            {/* ALL REQUESTS TAB */}
            {activeTab === 'all-requests' && accessInfo?.can_view_all && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {['Employee', 'Date', 'Time', 'Duration', 'Reason', 'Status', 'Actions'].map(h => (
                            <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {getCurrentPageData(allRequests).map(req => (
                          <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                              <p className="font-medium">{req.employee_name}</p>
                              <p className="text-gray-500 text-xs">{req.employee_id}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatDate(req.date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatTime(req.start_time)} - {formatTime(req.end_time)}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{req.duration_hours}h</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }} className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"><Eye size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {allRequests.length > itemsPerPage && (
                  <Pagination currentPage={currentPage} totalPages={Math.ceil(allRequests.length / itemsPerPage)} totalItems={allRequests.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} darkMode={darkMode} />
                )}
              </div>
            )}

            {/* PENDING APPROVALS TAB */}
            {activeTab === 'approvals' && accessInfo?.is_manager && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {['Employee', 'Date', 'Time', 'Duration', 'Reason', 'Actions'].map(h => (
                            <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {getCurrentPageData(pendingApprovals).map(req => (
                          <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{req.employee_name}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatDate(req.date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatTime(req.start_time)} - {formatTime(req.end_time)}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{req.duration_hours}h</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setConfirmModal({ isOpen: true, type: 'approve', requestId: req.id })} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"><Check size={16} /></button>
                                <button onClick={() => setConfirmModal({ isOpen: true, type: 'reject', requestId: req.id })} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><X size={16} /></button>
                                <button onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }} className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"><Eye size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {pendingApprovals.length > itemsPerPage && (
                  <Pagination currentPage={currentPage} totalPages={Math.ceil(pendingApprovals.length / itemsPerPage)} totalItems={pendingApprovals.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} darkMode={darkMode} />
                )}
              </div>
            )}

            {/* TEAM BALANCES TAB */}
            {activeTab === 'team-balances' && (accessInfo?.is_manager || accessInfo?.can_view_all) && (
              <div className="space-y-6">

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FilterIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
                    {(balanceFilters.search || balanceFilters.balanceStatus !== 'all') && (
                      <button onClick={resetBalanceFilters} className="ml-auto text-xs text-almet-sapphire hover:text-almet-astral font-medium">
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Search Employee</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={balanceFilters.search}
                          onChange={(e) => setBalanceFilters({ ...balanceFilters, search: e.target.value })}
                          placeholder="Name or Employee ID..."
                          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Balance Status</label>
                      <select
                        value={balanceFilters.balanceStatus}
                        onChange={(e) => setBalanceFilters({ ...balanceFilters, balanceStatus: e.target.value })}
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
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTeamBalances.length}</span> of {teamBalances.length} employees
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  {filteredTeamBalances.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No employees found</p>
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
                            {accessInfo?.is_admin && (
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                          {getCurrentPageData(filteredTeamBalances).map(bal => (
                            <tr key={bal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                <p className="font-medium">{bal.employee_name}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">{bal.employee_id}</p>
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold ${
                                    parseFloat(bal.current_balance_hours) > 3 ? 'text-green-600 dark:text-green-500' :
                                    parseFloat(bal.current_balance_hours) > 1 ? 'text-yellow-600 dark:text-yellow-500' :
                                    parseFloat(bal.current_balance_hours) > 0 ? 'text-orange-600 dark:text-orange-500' :
                                    'text-red-600 dark:text-red-500'
                                  }`}>
                                    {bal.current_balance_hours}h
                                  </span>
                                  {parseFloat(bal.current_balance_hours) === 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">Empty</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{bal.monthly_allowance_hours}h</td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 dark:text-white font-medium">{bal.used_hours_this_month}h</span>
                                  {parseFloat(bal.used_hours_this_month) > 0 && (
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-[60px]">
                                      <div
                                        className="bg-almet-sapphire h-1.5 rounded-full"
                                        style={{ width: `${Math.min((parseFloat(bal.used_hours_this_month) / parseFloat(bal.monthly_allowance_hours)) * 100, 100)}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(bal.last_reset_date)}</td>
                              {accessInfo?.is_admin && (
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedBalance(bal);
                                      setUpdateBalanceForm({ new_balance: bal.current_balance_hours });
                                      setShowUpdateBalanceModal(true);
                                    }}
                                    className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded transition-colors"
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
                  <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredTeamBalances.length / itemsPerPage)} totalItems={filteredTeamBalances.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} darkMode={darkMode} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* UPDATE BALANCE MODAL */}
        {showUpdateBalanceModal && selectedBalance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Balance</h3>
                <button onClick={() => { setShowUpdateBalanceModal(false); setSelectedBalance(null); setUpdateBalanceForm({ new_balance: '' }); setUpdateBalanceErrors({}); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateBalance} className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employee</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{selectedBalance.employee_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedBalance.employee_id}</p>
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
                    onChange={(e) => setUpdateBalanceForm({ ...updateBalanceForm, new_balance: e.target.value })}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${updateBalanceErrors.new_balance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Enter new balance..."
                  />
                  {updateBalanceErrors.new_balance && <p className="mt-1.5 text-xs text-red-500">{updateBalanceErrors.new_balance}</p>}
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => { setShowUpdateBalanceModal(false); setSelectedBalance(null); setUpdateBalanceForm({ new_balance: '' }); setUpdateBalanceErrors({}); }} className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={updatingBalance} className="px-6 py-2.5 text-sm bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
                    {updatingBalance ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</> : 'Update Balance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NEW REQUEST MODAL */}
        {showNewRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Time Off Request</h3>
                <button onClick={() => { setShowNewRequestModal(false); setFormErrors({}); setFormData({ date: '', start_time: '', end_time: '', reason: '' }); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitRequest} className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {formErrors.date && <p className="mt-1.5 text-xs text-red-500">{formErrors.date}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['start_time', 'end_time'].map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field === 'start_time' ? 'Start Time' : 'End Time'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => handleTimeChange(field, e.target.value)}
                        placeholder="HH:MM"
                        maxLength={5}
                        className={`w-full px-4 py-2.5 text-sm border outline-0 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${formErrors[field] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                      {formErrors[field] && <p className="mt-1.5 text-xs text-red-500">{formErrors[field]}</p>}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: {field === 'start_time' ? '09:00' : '18:00'}</p>
                    </div>
                  ))}
                </div>
                {formData.start_time && formData.end_time && validateTimeFormat(formData.start_time) && validateTimeFormat(formData.end_time) && formData.start_time < formData.end_time && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Duration: {calculateDuration(formData.start_time, formData.end_time)} hours</p>
                  </div>
                )}
                {formErrors.duration && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">{formErrors.duration}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                    maxLength={200}
                    placeholder="Please provide a detailed reason..."
                    className={`w-full px-4 py-3 outline-0 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${formErrors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {formErrors.reason && <p className="text-xs text-red-500">{formErrors.reason}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{formData.reason.length}/200</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Current Balance:</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{balance?.current_balance_hours}h</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => { setShowNewRequestModal(false); setFormErrors({}); setFormData({ date: '', start_time: '', end_time: '', reason: '' }); }} className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 text-sm bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center shadow-sm">
                    {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</> : 'Submit Request'}
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
              <div className="sticky top-0 px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
                <button onClick={() => { setShowDetailModal(false); setSelectedRequest(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Employee</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Status</p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedRequest.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Duration</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.duration_hours} hours</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatTime(selectedRequest.start_time)} - {formatTime(selectedRequest.end_time)}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Reason</p>
                  <p className="text-sm text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">{selectedRequest.reason}</p>
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
                      <span className="font-medium">Approved by {selectedRequest.approved_by_name}</span><br />
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
                <button onClick={() => { setShowDetailModal(false); setSelectedRequest(null); }} className="px-5 py-2.5 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium">Close</button>
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
          message="Are you sure you want to reject this time off request?"
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