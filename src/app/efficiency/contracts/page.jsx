'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Clock, UserCheck, Calendar, AlertTriangle, TrendingUp, 
  Building2, RefreshCw, Settings, ChevronRight, Eye, CheckCircle, XCircle, Shield
} from 'lucide-react';
import { employeeService } from '@/services/newsService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiService } from '@/services/api';
import resignationExitService from '@/services/resignationExitService';
import ContractRenewalModal from '@/components/resignation/ContractRenewalModal';
import ContractRenewalHRModal from '@/components/resignation/ContractRenewalHRModal';
import ProbationReviewModal from '@/components/resignation/ProbationReviewModal';

export default function ContractProbationManagementPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [probationEmployees, setProbationEmployees] = useState([]);
  const [probationFilter, setProbationFilter] = useState('all');
  const [contractConfigs, setContractConfigs] = useState({});
  
  const [contractRenewals, setContractRenewals] = useState([]);
  const [contractFilter, setContractFilter] = useState('all');
  
  const [probationReviews, setProbationReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  
  const [showContractModal, setShowContractModal] = useState(false);
  const [showHRModal, setShowHRModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [respondentType, setRespondentType] = useState('EMPLOYEE');
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const userInfo = await resignationExitService.getCurrentUser();
      setUserRole(userInfo);
      
      const isUserAdmin = userInfo.is_admin;
      setIsAdmin(isUserAdmin);
      
      const contractResponse = await apiService.getContractConfigs();
      const contracts = contractResponse.data.results || contractResponse.data || [];
      const configMap = {};
      contracts.forEach(config => {
        configMap[config.contract_type] = {
          probation_days: config.probation_days || 0,
          total_days_until_active: config.total_days_until_active || 0,
          display_name: config.display_name || config.contract_type
        };
      });
      setContractConfigs(configMap);
      
      if (isUserAdmin) {
        await loadProbationTracking(configMap);
      }
      
      await loadContractRenewals();
      await loadProbationReviews();
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProbationTracking = async (configMap) => {
    try {
      const statusesResponse = await apiService.getEmployeeStatuses();
      const statuses = statusesResponse.data.results || statusesResponse.data || [];
      
      const probationStatus = statuses.find(s => 
        s.status_type === 'PROBATION' || 
        s.name?.toUpperCase().includes('PROBATION')
      );
      
      if (!probationStatus) {
        const response = await employeeService.getEmployees({ page_size: 1000 });
        const employees = response.results || [];
        
        const enrichedEmployees = employees
          .filter(emp => emp.status_name?.toUpperCase().includes('PROBATION'))
          .map(emp => ({
            ...emp,
            ...calculateProbationInfo(emp, configMap)
          }));
        
        enrichedEmployees.sort((a, b) => a.daysRemaining - b.daysRemaining);
        setProbationEmployees(enrichedEmployees);
        return;
      }

      const response = await employeeService.getEmployees({ 
        page_size: 1000,
        status: probationStatus.id
      });
      
      const employees = response.results || [];
      const enrichedEmployees = employees.map(emp => ({
        ...emp,
        ...calculateProbationInfo(emp, configMap)
      }));
      
      enrichedEmployees.sort((a, b) => a.daysRemaining - b.daysRemaining);
      setProbationEmployees(enrichedEmployees);
      
    } catch (error) {
      console.error('Error loading probation tracking:', error);
    }
  };

  const loadContractRenewals = async () => {
    try {
      const response = await resignationExitService.contractRenewal.getContractRenewals();
      setContractRenewals(response.results || []);
    } catch (error) {
      console.error('Error loading contract renewals:', error);
    }
  };

  const loadProbationReviews = async () => {
    try {
      const response = await resignationExitService.probationReview.getProbationReviews();
      setProbationReviews(response.results || []);
    } catch (error) {
      console.error('Error loading probation reviews:', error);
    }
  };

  const calculateProbationInfo = (employee, configMap) => {
    if (!employee.start_date || !employee.contract_duration) {
      return {
        probationEndDate: null,
        daysRemaining: null,
        daysCompleted: null,
        totalProbationDays: null,
        progressPercent: 0,
        urgencyLevel: 'unknown'
      };
    }

    const contractConfig = configMap[employee.contract_duration];
    const totalProbationDays = contractConfig?.probation_days || 90;
    
    const startDate = new Date(employee.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const probationEndDate = new Date(startDate);
    probationEndDate.setDate(probationEndDate.getDate() + totalProbationDays);
    
    const daysCompleted = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((probationEndDate - today) / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(100, Math.round((daysCompleted / totalProbationDays) * 100));
    
    let urgencyLevel = 'normal';
    if (daysRemaining <= 7) urgencyLevel = 'critical';
    else if (daysRemaining <= 14) urgencyLevel = 'warning';
    else if (daysRemaining <= 30) urgencyLevel = 'attention';
    
    return {
      probationEndDate: probationEndDate.toISOString().split('T')[0],
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      daysCompleted,
      totalProbationDays,
      progressPercent,
      urgencyLevel,
      contractType: employee.contract_duration
    };
  };

  const getUrgencyBadgeColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'warning': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      'attention': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      'normal': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      'unknown': 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
    };
    return colors[urgencyLevel] || colors.normal;
  };

  const getProgressBarColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-500',
      'warning': 'bg-amber-500',
      'attention': 'bg-orange-500',
      'normal': 'bg-almet-sapphire',
      'unknown': 'bg-gray-400'
    };
    return colors[urgencyLevel] || colors.normal;
  };

  const getContractDisplayName = (contractType) => {
    if (contractConfigs[contractType]?.display_name) {
      return contractConfigs[contractType].display_name;
    }
    const names = {
      'PERMANENT': 'Permanent',
      '1_YEAR': '1 Year',
      '6_MONTHS': '6 Months',
      '3_MONTHS': '3 Months'
    };
    return names[contractType] || contractType;
  };

  const handleContractClick = (contract) => {
    setSelectedContract(contract);
    
    if (isAdmin && contract.status === 'PENDING_HR') {
      setShowHRModal(true);
    } else {
      setShowContractModal(true);
    }
  };

  const handleReviewClick = (review, type = 'EMPLOYEE', isViewMode = false) => {
    setSelectedReview(review);
    setRespondentType(type);
    setViewMode(isViewMode);
    setShowReviewModal(true);
  };

  if (loading) return <LoadingSpinner message="Loading Contract & Probation Management..." />;

  if (!isAdmin && contractRenewals.length === 0 && probationReviews.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/resignation-exit'}
              className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const critical = probationEmployees.filter(e => e.urgencyLevel === 'critical').length;
  const warning = probationEmployees.filter(e => e.urgencyLevel === 'warning').length;
  const total = probationEmployees.length;

  const urgentContracts = contractRenewals.filter(c => c.days_until_expiry <= 14).length;
  const pendingHRContracts = contractRenewals.filter(c => c.status === 'PENDING_HR').length;
  
  const pendingEmployeeReviews = probationReviews.filter(r => 
    !r.employee_responses || r.employee_responses.length === 0
  ).length;
  
  const pendingManagerReviews = probationReviews.filter(r => 
    !r.manager_responses || r.manager_responses.length === 0
  ).length;
  
  const completedReviews = probationReviews.filter(r => 
    r.employee_responses?.length > 0 && r.manager_responses?.length > 0
  ).length;

  const filteredProbationEmployees = probationEmployees.filter(e => {
    if (probationFilter === 'critical') return e.urgencyLevel === 'critical';
    if (probationFilter === 'warning') return e.urgencyLevel === 'warning';
    return true;
  });

  const filteredContracts = contractRenewals.filter(c => {
    if (contractFilter === 'urgent') return c.days_until_expiry <= 14;
    if (contractFilter === 'pending') return c.status === 'PENDING_MANAGER';
    if (contractFilter === 'pending_hr') return c.status === 'PENDING_HR';
    return true;
  });

  const filteredReviews = probationReviews.filter(r => {
    if (reviewFilter === 'pending') {
      return !r.employee_responses || r.employee_responses.length === 0 || 
             !r.manager_responses || r.manager_responses.length === 0;
    }
    if (reviewFilter === 'completed') {
      return r.employee_responses?.length > 0 && r.manager_responses?.length > 0;
    }
    if (reviewFilter === 'employee_pending') {
      return !r.employee_responses || r.employee_responses.length === 0;
    }
    if (reviewFilter === 'manager_pending') {
      return !r.manager_responses || r.manager_responses.length === 0;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-3 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold">Contract & Probation Management</h1>
              <p className="text-xs text-white/80 mt-0.5">Monitor probation periods, contract renewals, and reviews</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => window.location.href = '/resignation-exit/question-management'}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Settings size={12} />
                Manage Questions
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 flex gap-1 shadow-sm">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('probation')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'probation'
                  ? 'bg-almet-sapphire text-white shadow-sm'
                  : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/20'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Shield size={12} />
                Probation Tracking
                {critical > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                    {critical}
                  </span>
                )}
              </div>
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'contracts'
                ? 'bg-almet-sapphire text-white shadow-sm'
                : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/20'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <RefreshCw size={12} />
              Contract Renewals
              {(urgentContracts > 0 || pendingHRContracts > 0) && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-bold">
                  {urgentContracts + pendingHRContracts}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'reviews'
                ? 'bg-almet-sapphire text-white shadow-sm'
                : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/20'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle size={12} />
              Probation Reviews
              {(pendingEmployeeReviews > 0 || pendingManagerReviews > 0) && (
                <span className="px-1.5 py-0.5 bg-almet-steel-blue text-white rounded-full text-[9px] font-bold">
                  {pendingEmployeeReviews + pendingManagerReviews}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Probation Tracking Tab */}
        {activeTab === 'probation' && isAdmin && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-1">Total Probation</p>
                    <p className="text-xl font-bold text-almet-cloud-burst dark:text-white">{total}</p>
                  </div>
                  <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
                    <UserCheck size={16} className="text-almet-sapphire" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-1">Critical (≤7d)</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{critical}</p>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-1">Warning (≤14d)</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{warning}</p>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-1">Action Required</p>
                    <p className="text-xl font-bold text-almet-cloud-burst dark:text-white">{Math.round((critical + warning) / total * 100 || 0)}%</p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setProbationFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    probationFilter === 'all' 
                      ? 'bg-almet-sapphire text-white shadow-sm' 
                      : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-sapphire/10'
                  }`}
                >
                  All ({total})
                </button>
                <button
                  onClick={() => setProbationFilter('critical')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    probationFilter === 'critical' 
                      ? 'bg-red-600 text-white shadow-sm' 
                      : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  Critical ({critical})
                </button>
                <button
                  onClick={() => setProbationFilter('warning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    probationFilter === 'warning' 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-amber-50 dark:hover:bg-amber-900/20'
                  }`}
                >
                  Warning ({warning})
                </button>
              </div>
            </div>

            {/* Employee List */}
            <div className="space-y-2">
              {filteredProbationEmployees.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
                  <UserCheck size={40} className="mx-auto text-almet-waterloo mb-2" />
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {total === 0 ? 'No employees in probation period' : 'No employees found for this filter'}
                  </p>
                </div>
              ) : (
                filteredProbationEmployees.map(employee => (
                  <div 
                    key={employee.id} 
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md hover:border-almet-sapphire dark:hover:border-almet-sapphire transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
                          <UserCheck size={14} className="text-almet-sapphire" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
                            {employee.name}
                          </h3>
                          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                            {employee.employee_id} • {employee.job_title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Building2 size={10} className="text-almet-waterloo" />
                            <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
                              {employee.department_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getUrgencyBadgeColor(employee.urgencyLevel)}`}>
                        {employee.daysRemaining}d left
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 p-2 bg-almet-mystic/50 dark:bg-almet-cloud-burst/10 rounded-lg">
                      <div>
                        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Start Date</p>
                        <p className="text-[10px] font-medium text-almet-cloud-burst dark:text-white">
                          {new Date(employee.start_date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">End Date</p>
                        <p className="text-[10px] font-medium text-almet-cloud-burst dark:text-white">
                          {employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString('en-GB') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Contract</p>
                        <p className="text-[10px] font-medium text-almet-cloud-burst dark:text-white">
                          {getContractDisplayName(employee.contract_duration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Manager</p>
                        <p className="text-[10px] font-medium text-almet-cloud-burst dark:text-white truncate">
                          {employee.line_manager_name || '-'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-almet-waterloo dark:text-almet-bali-hai">
                          Progress: {employee.daysCompleted} / {employee.totalProbationDays} days
                        </span>
                        <span className="text-[10px] font-semibold text-almet-cloud-burst dark:text-white">
                          {employee.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${getProgressBarColor(employee.urgencyLevel)}`}
                          style={{ width: `${employee.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {employee.urgencyLevel === 'critical' && (
                      <div className="mt-2 flex items-start gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertTriangle size={12} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-red-700 dark:text-red-300">
                         


    <span className="font-semibold">Urgent:</span> Review must be completed within {employee.daysRemaining} days
</p>
</div>
)}
</div>
))
)}
</div>
</>
)}

{/* Contract Renewals Tab */}
    {activeTab === 'contracts' && (
      <>
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setContractFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                contractFilter === 'all' 
                  ? 'bg-almet-sapphire text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-sapphire/10'
              }`}
            >
              All ({contractRenewals.length})
            </button>
            <button
              onClick={() => setContractFilter('urgent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                contractFilter === 'urgent' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-amber-50 dark:hover:bg-amber-900/20'
              }`}
            >
              Urgent ≤14d ({urgentContracts})
            </button>
            <button
              onClick={() => setContractFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                contractFilter === 'pending' 
                  ? 'bg-almet-steel-blue text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-steel-blue/10'
              }`}
            >
              Manager Pending
            </button>
            {isAdmin && (
              <button
                onClick={() => setContractFilter('pending_hr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  contractFilter === 'pending_hr' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                HR Pending ({pendingHRContracts})
              </button>
            )}
          </div>
        </div>

        {/* Contract List */}
        <div className="space-y-2">
          {filteredContracts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
              <RefreshCw size={40} className="mx-auto text-almet-waterloo mb-2" />
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">No contract renewals found</p>
            </div>
          ) : (
            filteredContracts.map(contract => (
              <button
                key={contract.id}
                onClick={() => handleContractClick(contract)}
                className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md hover:border-almet-sapphire dark:hover:border-almet-sapphire transition-all text-left group"
              >
                <div className="flex items-start gap-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-almet-sapphire transition-colors">
                    <RefreshCw size={14} className="text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h4 className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{contract.employee_name}</h4>
                        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                          {contract.employee_id} • {contract.position}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${resignationExitService.helpers.getStatusColor(contract.status)}`}>
                        {resignationExitService.helpers.getStatusText(contract.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
                      <div className="flex items-center gap-0.5">
                        <Building2 size={10} />
                        <span>{contract.department}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Calendar size={10} />
                        <span>Expires: {resignationExitService.helpers.formatDate(contract.current_contract_end_date)}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Clock size={10} />
                        <span className={`font-medium ${
                          contract.days_until_expiry <= 7 ? 'text-red-600 dark:text-red-400' : 
                          contract.days_until_expiry <= 14 ? 'text-amber-600 dark:text-amber-400' : ''
                        }`}>
                          {contract.days_until_expiry}d left
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-0.5 text-almet-sapphire text-[10px] font-medium group-hover:text-almet-astral">
                      <span>View details</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </>
    )}

    {/* Probation Reviews Tab */}
    {activeTab === 'reviews' && (
      <>
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                reviewFilter === 'all' 
                  ? 'bg-almet-sapphire text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-sapphire/10'
              }`}
            >
              All ({probationReviews.length})
            </button>
            <button
              onClick={() => setReviewFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                reviewFilter === 'pending' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-amber-50 dark:hover:bg-amber-900/20'
              }`}
            >
              Any Pending ({pendingEmployeeReviews + pendingManagerReviews})
            </button>
            <button
              onClick={() => setReviewFilter('employee_pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                reviewFilter === 'employee_pending' 
                  ? 'bg-almet-steel-blue text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-steel-blue/10'
              }`}
            >
              Employee ({pendingEmployeeReviews})
            </button>
            <button
              onClick={() => setReviewFilter('manager_pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                reviewFilter === 'manager_pending' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              Manager ({pendingManagerReviews})
            </button>
            <button
              onClick={() => setReviewFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                reviewFilter === 'completed' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-waterloo dark:text-almet-bali-hai hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              Completed ({completedReviews})
            </button>
          </div>
        </div>

        {/* Review List */}
        <div className="space-y-2">
          {filteredReviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
              <CheckCircle size={40} className="mx-auto text-almet-waterloo mb-2" />
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">No probation reviews found</p>
            </div>
          ) : (
            filteredReviews.map(review => {
              const hasEmployeeResponse = review.employee_responses && review.employee_responses.length > 0;
              const hasManagerResponse = review.manager_responses && review.manager_responses.length > 0;
              const isFullyCompleted = hasEmployeeResponse && hasManagerResponse;
              
              return (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md hover:border-almet-sapphire dark:hover:border-almet-sapphire transition-all"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${
                      isFullyCompleted 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'bg-amber-50 dark:bg-amber-900/20'
                    }`}>
                      {isFullyCompleted ? (
                        <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <h4 className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{review.employee_name}</h4>
                          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                            {review.employee_id} • {review.position}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          isFullyCompleted
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                        }`}>
                          {isFullyCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
                        <div className="flex items-center gap-0.5">
                          <Building2 size={10} />
                          <span>{review.department}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Calendar size={10} />
                          <span>{review.review_period.replace('_', '-')} Review</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-2 text-[10px]">
                        <div className={`flex items-center gap-0.5 ${hasEmployeeResponse ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                          {hasEmployeeResponse ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span>Employee</span>
                        </div>
                        <div className={`flex items-center gap-0.5 ${hasManagerResponse ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                          {hasManagerResponse ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span>Manager</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
  {/* Employee Button */}
  {hasEmployeeResponse ? (
    <button
      onClick={() => handleReviewClick(review, 'EMPLOYEE', true)}
      className="flex-1 px-2 py-1.5 bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-cloud-burst dark:text-almet-mystic border border-almet-sapphire/30 dark:border-almet-sapphire/40 rounded-lg hover:bg-almet-sapphire/10 dark:hover:bg-almet-sapphire/20 transition-colors text-[10px] font-medium flex items-center justify-center gap-1"
    >
      <Eye size={10} />
      Employee
    </button>
  ) : review.employee === userRole?.employee_id ? (
    <button
      onClick={() => handleReviewClick(review, 'EMPLOYEE', false)}
      className="flex-1 px-2 py-1.5 bg-almet-sapphire text-white border border-almet-sapphire rounded-lg hover:bg-almet-astral transition-colors text-[10px] font-medium flex items-center justify-center gap-1"
    >
      <CheckCircle size={10} />
      Submit Review
    </button>
  ) : (
    <div className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-900/20 text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1">
      <XCircle size={10} />
      No Response
    </div>
  )}

  {/* Manager Button */}
  {hasManagerResponse ? (
    <button
      onClick={() => handleReviewClick(review, 'MANAGER', true)}
      className="flex-1 px-2 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-[10px] font-medium flex items-center justify-center gap-1"
    >
      <Eye size={10} />
      Manager
    </button>
  ) : (userRole?.is_manager || isAdmin) ? (
    <button
      onClick={() => handleReviewClick(review, 'MANAGER', false)}
      className="flex-1 px-2 py-1.5 bg-purple-600 text-white border border-purple-700 rounded-lg hover:bg-purple-700 transition-colors text-[10px] font-medium flex items-center justify-center gap-1"
    >
      <CheckCircle size={10} />
      Submit Review
    </button>
  ) : (
    <div className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-900/20 text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1">
      <XCircle size={10} />
      No Response
    </div>
  )}
</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </>
    )}

    {/* Modals */}
    {showContractModal && selectedContract && (
      <ContractRenewalModal
        contract={selectedContract}
        onClose={() => {
          setShowContractModal(false);
          setSelectedContract(null);
        }}
        onSuccess={() => {
          setShowContractModal(false);
          setSelectedContract(null);
          loadContractRenewals();
        }}
        userRole={userRole}
      />
    )}

    {showHRModal && selectedContract && (
      <ContractRenewalHRModal
        contract={selectedContract}
        onClose={() => {
          setShowHRModal(false);
          setSelectedContract(null);
        }}
        onSuccess={() => {
          setShowHRModal(false);
          setSelectedContract(null);
          loadContractRenewals();
        }}
      />
    )}

    {showReviewModal && selectedReview && (
      <ProbationReviewModal
        review={selectedReview}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedReview(null);
          setViewMode(false);
        }}
        onSuccess={() => {
          setShowReviewModal(false);
          setSelectedReview(null);
          setViewMode(false);
          loadProbationReviews();
        }}
        respondentType={respondentType}
        viewMode={viewMode}
      />
    )}
  </div>
</DashboardLayout>)}