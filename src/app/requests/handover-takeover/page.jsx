// app/handovers/page.jsx - COMPLETE FULL FILE WITH SEPARATE HO/TO TABS
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Users, CheckCircle, AlertCircle, 
  Clock, TrendingUp, Plus, Search, Eye, X, ArrowRight,
  UserCheck, UserX, ClipboardCheck, Filter, RefreshCw,
  Shield, UsersIcon, Building
} from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import handoverService from '@/services/handoverService';
import { useToast } from '@/components/common/Toast';
import Pagination from '@/components/common/Pagination';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import HandoverDetailModal from '@/components/handovers/HandoverDetailModal';
import CreateHandoverModal from '@/components/handovers/CreateHandoverModal';

const HandoversDashboard = () => {
  const { theme } = useTheme();
  
  // State Management
  const [activeTab, setActiveTab] = useState('submission');
  const [myHandingOverRequests, setMyHandingOverRequests] = useState([]); // ⭐ NEW - Mənim verəcəyim handoverlər
  const [myTakingOverRequests, setMyTakingOverRequests] = useState([]); // ⭐ NEW - Mənim alacağım handoverlər
  const [teamHandovers, setTeamHandovers] = useState([]);
  const [allHandovers, setAllHandovers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [statistics, setStatistics] = useState({
    pending: 0,
    active: 0,
    completed: 0,
    team_active: 0,
    team_pending: 0
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [handoverTypes, setHandoverTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // ⭐ NEW - Sub-tab state for My Handovers
  const [myHandoverSubTab, setMyHandoverSubTab] = useState('handing-over'); // 'handing-over' or 'taking-over'

  const { showSuccess, showError, showInfo } = useToast();

  // Check user role
  const isAdmin = currentUser?.is_admin;
  const isManager = currentUser?.is_manager;

  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all required data
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [
        statsData, 
        myHandoversData, 
        teamHandoversData, 
        pendingData, 
        userData,
        employeeData, 
        typesData, 
        allHandoversData
      ] = await Promise.all([
        handoverService.getStatistics(),
        handoverService.getMyHandovers(),
        handoverService.getTeamHandovers(),
        handoverService.getPendingApprovals(),
        handoverService.getCurrentUser(),
        handoverService.getUser(),
        handoverService.getHandoverTypes(),
        handoverService.getAllHandovers()
      ]);
      
      setStatistics(statsData || { pending: 0, active: 0, completed: 0, team_active: 0, team_pending: 0 });
      
      // ⭐ NEW - Separate Handing Over and Taking Over
      if (Array.isArray(myHandoversData) && employeeData?.employee?.id) {
        const employeeId = employeeData.employee.id;
        
        // Handing Over (mən verənlərim)
        const handingOver = myHandoversData.filter(h => h.handing_over_employee === employeeId);
        setMyHandingOverRequests(handingOver);
        
        // Taking Over (mən alanlarım)
        const takingOver = myHandoversData.filter(h => h.taking_over_employee === employeeId);
        setMyTakingOverRequests(takingOver);
      } else {
        setMyHandingOverRequests([]);
        setMyTakingOverRequests([]);
      }
      
      setTeamHandovers(Array.isArray(teamHandoversData) ? teamHandoversData : []);
      setAllHandovers(Array.isArray(allHandoversData) ? allHandoversData : []);
      setPendingApprovals(Array.isArray(pendingData) ? pendingData : []);
      
      if (userData) {
        const processedUser = {
          ...userData
        };
        setCurrentUser(processedUser);
      } else {
        showError('User data structure is invalid');
      }
      
      if (employeeData) {
        const processedEmployee = {
          ...employeeData.user,
          employee: employeeData.employee
        };
        setUser(processedEmployee);
      } else {
        showError('User data structure is invalid');
      }
      
      setHandoverTypes(Array.isArray(typesData) ? typesData : []);
    } catch (error) {
      showError('Error loading data');
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchInitialData();
    } catch (error) {
      showError('Error refreshing data');
    } finally {
      setRefreshing(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'CREATED': { 
        label: 'Created', 
        class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: <FileText className="w-3 h-3" />
      },
      'SIGNED_BY_HANDING_OVER': { 
        label: 'Signed by HO', 
        class: 'bg-almet-steel-blue/10 text-almet-steel-blue dark:bg-almet-steel-blue/20',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'SIGNED_BY_TAKING_OVER': { 
        label: 'Signed by TO', 
        class: 'bg-almet-astral/10 text-almet-astral dark:bg-almet-astral/20',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'APPROVED_BY_LINE_MANAGER': { 
        label: 'Approved', 
        class: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'REJECTED': { 
        label: 'Rejected', 
        class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <X className="w-3 h-3" />
      },
      'NEED_CLARIFICATION': { 
        label: 'Need Clarification', 
        class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <AlertCircle className="w-3 h-3" />
      },
      'RESUBMITTED': { 
        label: 'Resubmitted', 
        class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <FileText className="w-3 h-3" />
      },
      'TAKEN_OVER': { 
        label: 'Taken Over', 
        class: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'TAKEN_BACK': { 
        label: 'Taken Back', 
        class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      icon: <Clock className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Filter handovers
  const filterHandovers = (handoversList) => {
    let filtered = handoversList;

    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.handing_over_employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.taking_over_employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.handover_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(h => h.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(h => h.handover_type === typeFilter);
    }

    return filtered;
  };

  // Get paginated data
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Handle view details
  const handleViewDetails = async (handoverId) => {
    try {
      const detail = await handoverService.getHandoverDetail(handoverId);
      setSelectedHandover(detail);
      setShowDetailModal(true);
    } catch (error) {
      showError('Error loading details');
    }
  };

  // Handle create new handover
  const handleCreateHandover = () => {
    setShowCreateModal(true);
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refreshData();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setTypeFilter(null);
    setCurrentPage(1);
  };

  // Status options for filter
  const statusOptions = [
    { value: 'CREATED', label: 'Created' },
    { value: 'SIGNED_BY_HANDING_OVER', label: 'Signed by HO' },
    { value: 'SIGNED_BY_TAKING_OVER', label: 'Signed by TO' },
    { value: 'APPROVED_BY_LINE_MANAGER', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'NEED_CLARIFICATION', label: 'Need Clarification' },
    { value: 'RESUBMITTED', label: 'Resubmitted' },
    { value: 'TAKEN_OVER', label: 'Taken Over' },
    { value: 'TAKEN_BACK', label: 'Taken Back' },
  ];

  // ⭐ NEW - Statistics Cards with HO/TO separation
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Pending Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
          </div>
          <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
            Action needed
          </span>
        </div>
        <div className='flex items-center gap-4'>
          <p className="text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">Pending</p>
          <p className="text-base font-bold text-almet-cloud-burst dark:text-white">{statistics.pending}</p>
        </div>
      </div>

      {/* ⭐ NEW - Handing Over (Verəcəklərim) Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-almet-steel-blue shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 bg-almet-steel-blue/10 dark:bg-almet-steel-blue/20 rounded-lg flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-almet-steel-blue" />
          </div>
          <span className="px-2 py-0.5 bg-almet-steel-blue/10 dark:bg-almet-steel-blue/20 text-almet-steel-blue rounded text-xs font-medium">
            Giving
          </span>
        </div>
        <div className='flex items-center gap-4'>
          <p className="text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">Handing Over</p>
          <p className="text-base font-bold text-almet-cloud-burst dark:text-white">{myHandingOverRequests.length}</p>
        </div>
      </div>

      {/* ⭐ NEW - Taking Over (Alacaqlarım) Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
            <UserX className="w-4 h-4 text-teal-600 dark:text-teal-500" />
          </div>
          <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded text-xs font-medium">
            Receiving
          </span>
        </div>
        <div className='flex items-center gap-4'>
          <p className="text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">Taking Over</p>
          <p className="text-base font-bold text-almet-cloud-burst dark:text-white">{myTakingOverRequests.length}</p>
        </div>
      </div>

      {/* Team Active Card (for managers) */}
      {(isManager || isAdmin) && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-almet-astral shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-almet-astral/10 dark:bg-almet-astral/20 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-almet-astral" />
            </div>
            <span className="px-2 py-0.5 bg-almet-astral/10 dark:bg-almet-astral/20 text-almet-astral rounded text-xs font-medium">
              Team
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <p className="text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">Team Active</p>
            <p className="text-base font-bold text-almet-cloud-burst dark:text-white">{statistics.team_active}</p>
          </div>
        </div>
      )}

      {/* Team Pending Card (for managers) */}
      {(isManager || isAdmin) && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-orange-600 dark:text-orange-500" />
            </div>
            <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
              Awaiting
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <p className="text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">Team Pending</p>
            <p className="text-base font-bold text-almet-cloud-burst dark:text-white">{statistics.team_pending}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Render Tabs
  const Tabs = () => {
    const tabs = [
      { id: 'submission', label: 'New Handover', icon: FileText },
      { 
        id: 'my-requests', 
        label: 'My Handovers', 
        icon: ClipboardCheck,
        badge: myHandingOverRequests.length + myTakingOverRequests.length > 0 
          ? myHandingOverRequests.length + myTakingOverRequests.length 
          : null
      },
      { id: 'approval', label: 'Approval Center', icon: CheckCircle },
    ];

    // Add team tab for managers
    if (isManager || isAdmin) {
      tabs.splice(2, 0, { 
        id: 'team', 
        label: 'Team Handovers', 
        icon: UsersIcon,
        badge: statistics.team_pending > 0 ? statistics.team_pending : null
      });
    }

    // Add all handovers tab for admins
    if (isAdmin) {
      tabs.push({ 
        id: 'all', 
        label: 'All Handovers', 
        icon: Shield 
      });
    }

    return (
      <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-900 rounded-lg p-1.5 shadow-sm mb-5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                resetFilters();
              }}
              className={`relative flex-1 min-w-[120px] py-2.5 px-3 rounded-md font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-almet-sapphire text-white shadow-sm'
                  : 'text-almet-waterloo dark:text-gray-400 hover:bg-almet-mystic dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // ⭐ NEW - Sub-tabs for My Handovers (Handing Over / Taking Over)
  const MyHandoverSubTabs = () => (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => {
          setMyHandoverSubTab('handing-over');
          setCurrentPage(1);
        }}
        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
          myHandoverSubTab === 'handing-over'
            ? 'bg-almet-steel-blue text-white shadow-sm'
            : 'bg-almet-mystic dark:bg-gray-800 text-almet-waterloo dark:text-gray-400 hover:bg-almet-bali-hai/20 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <UserCheck className="w-4 h-4" />
          <span>Handing Over</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            myHandoverSubTab === 'handing-over'
              ? 'bg-white/20'
              : 'bg-almet-steel-blue/20 text-almet-steel-blue'
          }`}>
            {myHandingOverRequests.length}
          </span>
        </div>
      </button>

      <button
        onClick={() => {
          setMyHandoverSubTab('taking-over');
          setCurrentPage(1);
        }}
        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
          myHandoverSubTab === 'taking-over'
            ? 'bg-teal-600 text-white shadow-sm'
            : 'bg-almet-mystic dark:bg-gray-800 text-almet-waterloo dark:text-gray-400 hover:bg-almet-bali-hai/20 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <UserX className="w-4 h-4" />
          <span>Taking Over</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            myHandoverSubTab === 'taking-over'
              ? 'bg-white/20'
              : 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
          }`}>
            {myTakingOverRequests.length}
          </span>
        </div>
      </button>
    </div>
  );

  // Render Handover Table
  const HandoverTable = ({ handovers }) => {
    const filteredHandovers = filterHandovers(handovers);
    const paginatedHandovers = getPaginatedData(filteredHandovers);
    const totalPages = Math.ceil(filteredHandovers.length / itemsPerPage);

    if (filteredHandovers.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="w-14 h-14 text-almet-bali-hai dark:text-gray-600 mx-auto mb-3" />
          <p className="text-almet-waterloo dark:text-gray-400">No handovers found</p>
          {(searchTerm || statusFilter || typeFilter) && (
            <button
              onClick={resetFilters}
              className="mt-3 text-almet-sapphire hover:text-almet-cloud-burst text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/50 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-almet-cloud-burst dark:text-gray-300 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-almet-cloud-burst dark:text-gray-300 uppercase tracking-wide">
                  Handing Over
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-almet-cloud-burst dark:text-gray-300 uppercase tracking-wide">
                  Taking Over
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-almet-cloud-burst dark:text-gray-300 uppercase tracking-wide">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-almet-cloud-burst dark:text-gray-300 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-almet-cloud-burst dark:text-gray-300 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-almet-mystic dark:divide-gray-800">
              {paginatedHandovers.map((handover) => (
                <tr key={handover.id} className="hover:bg-almet-mystic/30 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-almet-waterloo dark:text-gray-400">
                    {handover.handover_type_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-7 w-7 bg-almet-steel-blue/10 dark:bg-almet-steel-blue/20 rounded-full flex items-center justify-center">
                        <UserCheck className="w-3.5 h-3.5 text-almet-steel-blue" />
                      </div>
                      <div className="ml-2.5">
                        <p className="text-sm font-medium text-almet-cloud-burst dark:text-gray-100">
                          {handover.handing_over_employee_name}
                        </p>
                        <p className="text-xs text-almet-waterloo dark:text-gray-400">
                          {handover.handing_over_position}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-7 w-7 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                        <UserX className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="ml-2.5">
                        <p className="text-sm font-medium text-almet-cloud-burst dark:text-gray-100">
                          {handover.taking_over_employee_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-almet-waterloo dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-almet-bali-hai" />
                      <span className="text-xs">
                        {new Date(handover.start_date).toLocaleDateString()} - {new Date(handover.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(handover.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(handover.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire text-white text-sm rounded-md hover:bg-almet-cloud-burst transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredHandovers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
        </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto mb-4"></div>
            <p className="text-almet-waterloo dark:text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-5 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-almet-cloud-burst dark:text-white">
                  Handover & Takeover System
                </h1>
                {(isAdmin || isManager) && (
                  <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                    {isAdmin ? 'Admin' : 'Manager'}
                  </span>
                )}
              </div>
              <p className="text-almet-waterloo dark:text-gray-400 text-sm mt-1">
                Manage work handovers efficiently
              </p>
            </div>
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 hover:bg-almet-mystic dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-almet-waterloo ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Tabs */}
        <Tabs />

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-almet-mystic dark:border-gray-800">
          {/* Submission Tab */}
          {activeTab === 'submission' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                  Create New Handover
                </h2>
                <button
                  onClick={handleCreateHandover}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-almet-sapphire text-white text-sm rounded-lg hover:bg-almet-cloud-burst transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Handover
                </button>
              </div>

              {/* Recent Handovers Preview */}
              <div className="mt-6">
                <h3 className="text-base font-medium text-almet-cloud-burst dark:text-white mb-3">
                  Recent Handovers
                </h3>
                {[...myHandingOverRequests, ...myTakingOverRequests]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .slice(0, 5).length > 0 ? (
                  <div className="space-y-2.5">
                    {[...myHandingOverRequests, ...myTakingOverRequests]
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .slice(0, 5)
                      .map((handover) => (
                        <div
                          key={handover.id}
                          className="flex items-center justify-between p-3.5 bg-almet-mystic/30 dark:bg-gray-800/50 rounded-lg hover:bg-almet-mystic/50 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-almet-bali-hai dark:hover:border-gray-700"
                          onClick={() => handleViewDetails(handover.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                              {handover.handing_over_employee === user?.employee?.id ? (
                                <UserCheck className="w-5 h-5 text-almet-steel-blue" />
                              ) : (
                                <UserX className="w-5 h-5 text-teal-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-almet-cloud-burst dark:text-white">
                                {handover.request_id}
                              </p>
                              <p className="text-xs text-almet-waterloo dark:text-gray-400">
                                {handover.handing_over_employee_name} → {handover.taking_over_employee_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            {getStatusBadge(handover.status)}
                            <ArrowRight className="w-4 h-4 text-almet-bali-hai" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-almet-waterloo dark:text-gray-400">
                    <FileText className="w-12 h-12 text-almet-bali-hai dark:text-gray-600 mx-auto mb-2.5" />
                    <p className="text-sm">No recent handovers</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ⭐ NEW - My Requests Tab with Sub-tabs */}
          {activeTab === 'my-requests' && (
            <div className="p-5">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-5">
                <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                  My Handovers
                </h2>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 lg:flex-initial">
                    <Search className="w-4 h-4 text-almet-bali-hai absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search handovers..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9 pr-3 py-2 outline-0 border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent w-full lg:w-56 bg-white dark:bg-gray-800 text-sm text-almet-cloud-burst dark:text-white placeholder:text-almet-bali-hai"
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-almet-bali-hai dark:border-gray-700 rounded-lg hover:bg-almet-mystic/50 dark:hover:bg-gray-800 transition-colors text-almet-cloud-burst dark:text-gray-300 text-sm"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {(statusFilter || typeFilter) && (
                      <span className="ml-1 px-1.5 py-0.5 bg-almet-sapphire text-white rounded-full text-xs">
                        {[statusFilter, typeFilter].filter(Boolean).length}
                      </span>
                    )}
                  </button>

                  {/* Reset Filters */}
                  {(searchTerm || statusFilter || typeFilter) && (
                    <button
                      onClick={resetFilters}
                      className="px-3 py-2 text-sm text-almet-waterloo dark:text-gray-400 hover:text-almet-cloud-burst dark:hover:text-white hover:bg-almet-mystic/50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mb-5 p-4 bg-almet-mystic/30 dark:bg-gray-800/50 rounded-lg border border-almet-bali-hai dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-300 mb-1.5">
                        Filter by Status
                      </label>
                      <SearchableDropdown
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(value) => {
                          setStatusFilter(value);
                          setCurrentPage(1);
                        }}
                        placeholder="Select status..."
                        searchPlaceholder="Search status..."
                        allowUncheck={true}
                      />
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-300 mb-1.5">
                        Filter by Type
                      </label>
                      <SearchableDropdown
                        options={handoverTypes.map(type => ({
                          value: type.id,
                          label: type.name
                        }))}
                        value={typeFilter}
                        onChange={(value) => {
                          setTypeFilter(value);
                          setCurrentPage(1);
                        }}
                        placeholder="Select type..."
                        searchPlaceholder="Search type..."
                        allowUncheck={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ⭐ NEW - Sub-tabs for Handing Over / Taking Over */}
              <MyHandoverSubTabs />

              {/* ⭐ NEW - Show appropriate table based on sub-tab */}
              {myHandoverSubTab === 'handing-over' && (
                <>
                  {myHandingOverRequests.length === 0 ? (
                    <div className="text-center py-12 bg-almet-mystic/30 dark:bg-gray-800/50 rounded-lg">
                      <UserCheck className="w-14 h-14 text-almet-steel-blue mx-auto mb-3 opacity-50" />
                      <p className="text-almet-waterloo dark:text-gray-400 font-medium mb-1">
                        No Handing Over Requests
                      </p>
                      <p className="text-xs text-almet-waterloo dark:text-gray-500">
                        You are not handing over any responsibilities currently
                      </p>
                    </div>
                  ) : (
                    <HandoverTable handovers={myHandingOverRequests} />
                  )}
                </>
              )}

              {myHandoverSubTab === 'taking-over' && (
                <>
                  {myTakingOverRequests.length === 0 ? (
                    <div className="text-center py-12 bg-almet-mystic/30 dark:bg-gray-800/50 rounded-lg">
                      <UserX className="w-14 h-14 text-teal-600 dark:text-teal-500 mx-auto mb-3 opacity-50" />
                      <p className="text-almet-waterloo dark:text-gray-400 font-medium mb-1">
                        No Taking Over Requests
                      </p>
                      <p className="text-xs text-almet-waterloo dark:text-gray-500">
                        You are not taking over any responsibilities currently
                      </p>
                    </div>
                  ) : (
                    <HandoverTable handovers={myTakingOverRequests} />
                  )}
                </>
              )}
            </div>
          )}

          {/* Team Tab (for managers) */}
          {activeTab === 'team' && (isManager || isAdmin) && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                  Team Handovers
                </h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800">
                  <UsersIcon className="w-4 h-4" />
                  <span className="font-medium text-sm">{teamHandovers.length} Team Handovers</span>
                </div>
              </div>

              {teamHandovers.length === 0 ? (
                <div className="text-center py-12 bg-almet-mystic/30 dark:bg-gray-800/50 rounded-lg">
                  <UsersIcon className="w-14 h-14 text-almet-bali-hai dark:text-gray-600 mx-auto mb-3 opacity-50" />
                  <p className="text-almet-waterloo dark:text-gray-400 font-medium mb-1">
                    No Team Handovers
                  </p>
                  <p className="text-xs text-almet-waterloo dark:text-gray-500">
                    Your team members have no active handovers
                  </p>
                </div>
              ) : (
                <HandoverTable handovers={teamHandovers} />
              )}
            </div>
          )}

          {/* Approval Tab */}
          {activeTab === 'approval' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                  Pending Approvals
                </h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-sm">{pendingApprovals.length} Pending</span>
                </div>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12 bg-almet-mystic/30 dark:bg-gray-800/50 rounded-lg">
                  <CheckCircle className="w-14 h-14 text-teal-600 dark:text-teal-500 mx-auto mb-3 opacity-50" />
                  <p className="text-almet-waterloo dark:text-gray-400 font-medium mb-1">
                    No Pending Approvals
                  </p>
                  <p className="text-xs text-almet-waterloo dark:text-gray-500">
                    All handovers requiring your action have been processed
                  </p>
                </div>
              ) : (
                <HandoverTable handovers={pendingApprovals} />
              )}
            </div>
          )}

          {/* All Handovers Tab (for admins) */}
          {activeTab === 'all' && isAdmin && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                  All Handovers
                </h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-almet-steel-blue/10 dark:bg-almet-steel-blue/20 text-almet-steel-blue rounded-lg border border-almet-steel-blue/30">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium text-sm">{allHandovers.length} Total</span>
                </div>
              </div>

              {allHandovers.length === 0 ? (
                <div className="text-center py-12 bg-almet-mystic/30 dark:bg-gray-800/50 rounded-lg">
                  <Shield className="w-14 h-14 text-almet-bali-hai dark:text-gray-600 mx-auto mb-3 opacity-50" />
                  <p className="text-almet-waterloo dark:text-gray-400 font-medium mb-1">
                    No Handovers in System
                  </p>
                  <p className="text-xs text-almet-waterloo dark:text-gray-500">
                    No handover requests have been created yet
                  </p>
                </div>
              ) : (
                <HandoverTable handovers={allHandovers} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedHandover && (
        <HandoverDetailModal
          handover={selectedHandover}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedHandover(null);
          }}
          onUpdate={refreshData}
          currentUser={currentUser}
          user={user}
        />
      )}

      {showCreateModal && (
        <CreateHandoverModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          user={user}
        />
      )}
    </DashboardLayout>
  );
};

export default HandoversDashboard;