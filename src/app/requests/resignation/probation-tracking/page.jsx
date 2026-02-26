'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Clock, UserCheck, Calendar, AlertTriangle, TrendingUp, ArrowLeft, Building2 } from 'lucide-react';
import { employeeService } from '@/services/newsService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiService } from '@/services/api';

export default function ProbationTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [probationEmployees, setProbationEmployees] = useState([]);
  const [filter, setFilter] = useState('all');
  const [probationStatusId, setProbationStatusId] = useState(null);
  const [contractConfigs, setContractConfigs] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
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

      setProbationStatusId(probationStatus.id);
      
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
      console.error('Error loading probation data:', error);
    } finally {
      setLoading(false);
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
      'normal': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
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

  if (loading) return <LoadingSpinner message="Loading Probation Tracking..." />;

  const critical = probationEmployees.filter(e => e.urgencyLevel === 'critical').length;
  const warning = probationEmployees.filter(e => e.urgencyLevel === 'warning').length;
  const total = probationEmployees.length;

  const filteredEmployees = probationEmployees.filter(e => {
    if (filter === 'critical') return e.urgencyLevel === 'critical';
    if (filter === 'warning') return e.urgencyLevel === 'warning';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Probation Period Tracking</h1>
              <p className="text-blue-100 text-xs mt-0.5">Monitor and manage employee probation periods</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Probation</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              </div>
              <div className="p-3 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
                <UserCheck size={20} className="text-almet-sapphire" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Critical (≤7d)</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{critical}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Warning (≤14d)</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{warning}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Clock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Action Required</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round((critical + warning) / total * 100 || 0)}%</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-almet-sapphire text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Employees ({total})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === 'critical' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Critical ({critical})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === 'warning' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Warning ({warning})
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-3">
          {filteredEmployees.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <UserCheck size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {total === 0 ? 'No employees in probation period' : 'No employees found for this filter'}
              </p>
            </div>
          ) : (
            filteredEmployees.map(employee => (
              <div 
                key={employee.id} 
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
                      <UserCheck size={18} className="text-almet-sapphire" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {employee.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {employee.employee_id} • {employee.job_title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {employee.department_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyBadgeColor(employee.urgencyLevel)}`}>
                    {employee.daysRemaining}d remaining
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {new Date(employee.start_date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString('en-GB') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract Type</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {getContractDisplayName(employee.contract_duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Line Manager</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {employee.line_manager_name || '-'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Progress: {employee.daysCompleted} / {employee.totalProbationDays} days
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {employee.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressBarColor(employee.urgencyLevel)}`}
                      style={{ width: `${employee.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Alert */}
                {employee.urgencyLevel === 'critical' && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                      <span className="font-semibold">Action Required:</span> Probation review must be completed within {employee.daysRemaining} days
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}