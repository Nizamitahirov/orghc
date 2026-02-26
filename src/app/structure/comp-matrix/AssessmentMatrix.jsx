'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Target, ArrowRight, Loader2, AlertCircle, Settings,
  RefreshCw, ChevronRight, Home, BarChart3, 
  TrendingUp, Crown, ArrowLeft, Wrench, Shield, Lock,User, Info
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import BehavioralAssessmentCalculation from '@/components/assessment/BehavioralAssessmentCalculation';
import CoreEmployeeCalculation from '@/components/assessment/CoreEmployeeCalculation';
import LeadershipAssessmentCalculation from '@/components/assessment/LeadershipAssessmentCalculation';
import AssessmentSettings from '@/components/assessment/AssessmentSettings';
import { assessmentApi } from '@/services/assessmentApi';
import { ToastProvider, useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';

const AssessmentMatrixInner = ({ onNavigateToManagement }) => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const isEmployeeOnlyAccess = () => {
  return userPermissions && 
         !userPermissions.is_admin && 
         !userPermissions.is_manager;
};
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('assessmentMatrixView') || 'dashboard';
    }
    return 'dashboard';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    behavioralAssessments: 0,
    coreAssessments: 0,
    leadershipAssessments: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    draftAssessments: 0,
    completionRate: 0
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('assessmentMatrixView', activeView);
    }
  }, [activeView]);

  // ✅ Fetch user permissions on mount
  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Real API call
      const permissionsResponse = await assessmentApi.employeeCore.getUserPermissions();
      setUserPermissions(permissionsResponse);
      
      // Permissions yüklənəndən sonra dashboard data fetch et
      await fetchDashboardData();
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err);
      showError('Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // ✅ Real API calls - Backend already filters based on permissions
      const [behavioralRes, coreRes, leadershipRes] = await Promise.all([
        assessmentApi.employeeBehavioral.getAll(),
        assessmentApi.employeeCore.getAll(),
        assessmentApi.employeeLeadership.getAll()
      ]);

      const behavioralAssessments = behavioralRes.results || [];
      const coreAssessments = coreRes.results || [];
      const leadershipAssessments = leadershipRes.results || [];
      const allAssessments = [...behavioralAssessments, ...coreAssessments, ...leadershipAssessments];
      const completed = allAssessments.filter(a => a.status === 'COMPLETED').length;
      const draft = allAssessments.filter(a => a.status === 'DRAFT').length;
      const completionRate = allAssessments.length > 0 ? ((completed / allAssessments.length) * 100) : 0;

      setDashboardData({
        behavioralAssessments: behavioralAssessments.length,
        coreAssessments: coreAssessments.length,
        leadershipAssessments: leadershipAssessments.length,
        totalAssessments: allAssessments.length,
        completedAssessments: completed,
        draftAssessments: draft,
        completionRate: completionRate
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
      showError('Failed to load dashboard data');
    }
  };

  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const textPrimary = darkMode ? 'text-almet-bali-hai' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-almet-bali-hai/30';

  // ✅ Permission check helper functions
  const canAccessManagement = () => {
    return userPermissions?.is_admin === true;
  };

  const canAccessSettings = () => {
    return userPermissions?.is_admin === true;
  };

  useEffect(() => {
    if (activeView === 'dashboard' && userPermissions) {
      fetchDashboardData();
    }
  }, [activeView]);

  const getRoleBadge = () => {
    if (!userPermissions) return null;
    
    if (userPermissions.is_admin) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-xs font-semibold shadow-sm">
          <Shield size={12} />
          <span>Admin Access</span>
        </div>
      );
    }
    
    if (userPermissions.is_manager) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full text-xs font-semibold shadow-sm">
          <Users size={12} />
          <span>Manager Access</span>
        </div>
      );
    }
    
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full text-xs font-semibold shadow-sm">
        <Lock size={12} />
        <span>Employee Access</span>
      </div>
    );
  };

  const ActionButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    variant = 'primary', 
    loading = false, 
    disabled = false, 
    size = 'sm',
    showPermissionLock = false,
    ...props
  }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white shadow-sm hover:shadow-md',
      secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white shadow-sm hover:shadow-md',
      outline: 'border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire/10 bg-transparent',
      ghost: 'text-almet-sapphire hover:bg-almet-sapphire/5 hover:text-almet-cloud-burst border border-transparent'
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          flex items-center justify-center gap-2 rounded-lg font-medium 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50
          ${variants[variant]} ${sizes[size]} 
          ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="animate-spin" />
        ) : showPermissionLock ? (
          <Lock size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
        ) : (
          <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
        )}
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const NavigationCard = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    isActive, 
    onClick, 
    color, 
    count
  }) => (
    <div
      className={`
        relative rounded-xl text-left transition-all duration-300 group cursor-pointer
        transform hover:scale-[1.02] active:scale-[0.98]
        ${isActive
          ? `bg-gradient-to-br ${color} text-white shadow-xl ring-2 ring-white/20`
          : `${bgCard} border ${borderColor} ${textPrimary} hover:border-almet-sapphire/50 hover:shadow-lg`
        }
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`
            p-3 rounded-xl transition-all duration-200
            ${isActive 
              ? 'bg-white/20 backdrop-blur-sm' 
              : 'bg-almet-mystic group-hover:bg-almet-sapphire/10'
            }
          `}>
            <Icon className={`w-5 h-5 ${
              isActive ? 'text-white' : 'text-almet-sapphire'
            }`} />
          </div>
          <div className="flex items-center gap-2">
            {count !== undefined && (
              <span className={`
                px-3 py-1 rounded-full text-base font-bold transition-all duration-200
                ${isActive 
                  ? 'bg-white/20 text-white backdrop-blur-sm' 
                  : 'bg-almet-mystic text-almet-sapphire group-hover:bg-almet-sapphire/10'
                }
              `}>
                {count}
              </span>
            )}
            <ArrowRight className={`
              w-4 h-4 transition-all duration-200
              ${isActive ? 'rotate-0' : 'group-hover:translate-x-1 group-hover:text-almet-sapphire'}
            `} />
          </div>
        </div>
        
        <h3 className="font-bold text-base mb-2">{title}</h3>
        <p className={`text-xs leading-relaxed ${
          isActive ? 'text-white/90' : textSecondary
        }`}>
          {subtitle}
        </p>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colors = {
      blue: 'bg-slate-50 border-slate-200 text-almet-cloud-burst',
      green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      purple: 'bg-violet-50 border-violet-200 text-violet-700',
      orange: 'bg-amber-50 border-amber-200 text-amber-700',
      almet: 'bg-blue-50 border-blue-200 text-almet-cloud-burst'
    };

    const iconColors = {
      blue: 'bg-slate-100 text-almet-sapphire',
      green: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-violet-100 text-violet-600',
      orange: 'bg-amber-100 text-amber-600',
      almet: 'bg-blue-100 text-almet-sapphire'
    };

    return (
      <div className={`
        ${colors[color]} border rounded-xl p-4 shadow-sm 
        transition-all duration-200 hover:shadow-md hover:scale-[1.01]
      `}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xs font-medium uppercase tracking-wide opacity-70">{title}</h3>
            <div className="text-xl font-bold mt-1 mb-1">{value}</div>
            {subtitle && (
              <p className="text-xs leading-tight opacity-80">{subtitle}</p>
            )}
          </div>
          <div className={`${iconColors[color]} p-2 rounded-lg`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'behavioral': return 'Behavioral Competency Assessment';
      case 'core': return 'Core Competency Assessment';
      case 'leadership': return 'Leadership Assessment';
      case 'dashboard': return 'Assessment Matrix';
      default: return 'Assessment Matrix';
    }
  };


const PageHeader = () => (
    <div className={`${bgCard} border ${borderColor} rounded-xl shadow-sm`}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          {/* Left side - Title and breadcrumb */}
          <div className="flex items-center gap-3">
            {activeView !== 'dashboard' && !showSettings && (
              <button
                onClick={() => {
                  if (showSettings) {
                    setShowSettings(false);
                  } else {
                    setActiveView('dashboard');
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-almet-comet' : 'hover:bg-almet-mystic'
                }`}
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} className={textPrimary} />
              </button>
            )}
            
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-almet-comet' : 'bg-almet-mystic'}`}>
              <BarChart3 className="w-5 h-5 text-almet-sapphire" />
            </div>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`text-xl font-bold ${textPrimary}`}>
                  {showSettings ? 'Assessment Settings' : getViewTitle()}
                </h1>
                {getRoleBadge()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`text-xs ${textSecondary} hover:text-almet-sapphire transition-colors`}
                >
                  Assessment Matrix
                </button>
                {activeView !== 'dashboard' && !showSettings && (
                  <>
                    <ChevronRight size={12} className={textSecondary} />
                    <span className={`text-xs font-semibold ${textPrimary}`}>
                      {getViewTitle()}
                    </span>
                  </>
                )}
                {showSettings && (
                  <>
                    <ChevronRight size={12} className={textSecondary} />
                    <span className={`text-xs font-semibold ${textPrimary}`}>
                      Settings
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Permission-based Actions */}
          <div className="flex items-center gap-2">
            {activeView === 'dashboard' && !showSettings && (
              <>
               <ActionButton
                      onClick={() => setShowSettings(true)}
                      icon={Settings}
                      label="Matrix Settings"
                      variant="outline"
                      size="sm"
                    />
                {/* ✅ Admin-only buttons */}
                {canAccessManagement() ? (
                  <>
                    <ActionButton
                      onClick={() => onNavigateToManagement && onNavigateToManagement()}
                      icon={Wrench}
                      label="Manage Competencies"
                      variant="outline"
                      size="sm"
                    />
                   
                  </>
                ) : (
                  /* ✅ Show locked button for non-admins with tooltip */
                  <div className="relative group">
                    <ActionButton
                      onClick={() => {}}
                      icon={Wrench}
                      label="Admin Only"
                      variant="outline"
                      size="sm"
                      disabled={true}
                      showPermissionLock={true}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                      <div className="text-center">
                        <p className="font-semibold">Admin Access Required</p>
                        <p className="text-gray-300 mt-0.5">Contact your administrator</p>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {activeView !== 'dashboard' && !showSettings && (
              <ActionButton
                onClick={() => setActiveView('dashboard')}
                icon={Home}
                label="Dashboard"
                variant="outline"
                size="sm"
              />
            )}

            {showSettings && canAccessSettings() && (
              <ActionButton
                onClick={() => setShowSettings(false)}
                icon={ArrowLeft}
                label="Back"
                variant="outline"
                size="sm"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );



const EmployeeDashboardView = () => {
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const textPrimary = darkMode ? 'text-almet-bali-hai' : 'text-almet-cloud-burst';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-almet-bali-hai/30';

  // ✅ Determine which assessment types the employee has
  const hasLeadership = dashboardData.leadershipAssessments > 0;
  const hasBehavioral = dashboardData.behavioralAssessments > 0;
  const hasCore = dashboardData.coreAssessments > 0;
  const hasAnyAssessment = hasLeadership || hasBehavioral || hasCore;

  // ✅ If no assessments at all, show empty state
  if (!hasAnyAssessment) {
    return (
      <div className="space-y-5">
        {/* Welcome Message */}
        <div className={`${bgCard} border ${borderColor} rounded-xl p-6 shadow-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-almet-mystic">
              <User className="w-6 h-6 text-almet-sapphire" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>My Assessments</h2>
              <p className={`text-sm ${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'}`}>
                View and track your personal assessments
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className={`${bgCard} border ${borderColor} rounded-xl p-12 shadow-sm text-center`}>
          <div className="max-w-md mx-auto">
            <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={`text-lg font-bold ${textPrimary} mb-2`}>No Assessments Yet</h3>
            <p className={`text-sm ${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'} mb-4`}>
              You don't have any assessments assigned yet. Your manager or HR department will assign assessments to you when needed.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-sky-900 mb-1">About Assessments</h3>
              <p className="text-xs text-sky-700 leading-relaxed">
                Once assessments are assigned to you, they will appear here. If you have questions about your assessments, 
                please contact your manager or HR department.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Welcome Message */}
      <div className={`${bgCard} border ${borderColor} rounded-xl p-6 shadow-sm`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-almet-mystic">
            <User className="w-6 h-6 text-almet-sapphire" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>My Assessments</h2>
            <p className={`text-sm ${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'}`}>
              View and track your personal assessments
            </p>
          </div>
        </div>
        
        {/* ✅ Summary Cards - Only show available types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Leadership or Behavioral */}
          {hasLeadership && (
            <StatCard
              icon={Crown}
              title="Leadership"
              value={dashboardData.leadershipAssessments}
              subtitle="Senior position assessment"
              color="blue"
            />
          )}
          
          {hasBehavioral && !hasLeadership && (
            <StatCard
              icon={Users}
              title="Behavioral"
              value={dashboardData.behavioralAssessments}
              subtitle="Soft skills assessment"
              color="purple"
            />
          )}
          
          {/* Core - if exists */}
          {hasCore && (
            <StatCard
              icon={Target}
              title="Core Competency"
              value={dashboardData.coreAssessments}
              subtitle="Technical skills assessment"
              color="orange"
            />
          )}
          
          {/* Completed */}
          <StatCard
            icon={TrendingUp}
            title="Completed"
            value={dashboardData.completedAssessments}
            subtitle={`${dashboardData.completionRate.toFixed(1)}% completion rate`}
            color="green"
          />
        </div>
      </div>

      {/* ✅ My Assessments Cards - Show only what employee has */}
      <div className={`grid grid-cols-1 ${(hasLeadership && hasCore) || (hasBehavioral && hasCore) ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-5`}>
        {/* ✅ Leadership OR Behavioral (never both) */}
        {hasLeadership && (
          <NavigationCard
            icon={Crown}
            title="My Leadership Assessment"
            subtitle="View your leadership evaluation and performance results"
            color="from-amber-100 via-amber-200 to-amber-300"
            count={dashboardData.leadershipAssessments}
            isActive={false}
            onClick={() => setActiveView('leadership')}
          />
        )}
        
        {hasBehavioral && !hasLeadership && (
          <NavigationCard
            icon={Users}
            title="My Behavioral Assessment"
            subtitle="Review your soft skills and interpersonal competencies"
            color="from-violet-100 via-violet-200 to-violet-300"
            count={dashboardData.behavioralAssessments}
            isActive={false}
            onClick={() => setActiveView('behavioral')}
          />
        )}
        
        {/* ✅ Core - if exists */}
        {hasCore && (
          <NavigationCard
            icon={Target}
            title="My Core Competency Assessment"
            subtitle="Check your technical skills and job-specific requirements"
            color="from-blue-100 via-blue-200 to-blue-300"
            count={dashboardData.coreAssessments}
            isActive={false}
            onClick={() => setActiveView('core')}
          />
        )}
      </div>

      {/* ✅ Info Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-sky-900 mb-1">About Your Assessments</h3>
            <p className="text-xs text-sky-700 leading-relaxed">
              You can view your personal assessments here. If you need to make changes or have questions 
              about your assessments, please contact your manager or HR department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

  if (loading && activeView === 'dashboard') {
    return (
      <div className="space-y-4">
        <PageHeader />
        
        <div className={`
          min-h-96 flex items-center justify-center ${bgCard} border ${borderColor} 
          rounded-xl p-12 shadow-sm
        `}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-almet-sapphire" />
            <p className={`${textPrimary} font-semibold text-sm`}>Loading assessment data...</p>
            <p className={`${textSecondary} text-xs mt-1`}>Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error && activeView === 'dashboard') {
    return (
      <div className="space-y-4">
        <PageHeader />
        
        <div className={`${bgCard} border border-red-200 rounded-xl p-5 shadow-sm`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20}/>
            <div className="flex-1">
              <h3 className="text-red-700 font-bold text-sm">Error Loading Data</h3>
              <p className="text-xs text-red-600 mt-1 leading-relaxed">
                {error?.message || 'Failed to load assessment data.'}
              </p>
            </div>
            <ActionButton 
              icon={RefreshCw} 
              label="Try Again" 
              onClick={fetchUserPermissions}
              variant="outline"
              size="xs"
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ Settings view - Admin only
  if (showSettings) {
    if (!canAccessSettings()) {
      return (
        <div className="space-y-4">
          <PageHeader />
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 shadow-sm text-center">
            <Lock className="w-12 h-12 mx-auto mb-3 text-amber-600" />
            <h3 className="text-amber-900 font-bold text-lg mb-2">Access Restricted</h3>
            <p className="text-amber-700 text-sm">
              Settings are only accessible to administrators.
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <PageHeader />
        <AssessmentSettings onBack={() => setShowSettings(false)} canAccessManagement={canAccessManagement} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader />

      {/* Content */}
      {activeView === 'dashboard' && (
        <>
        {isEmployeeOnlyAccess() ? (
          <EmployeeDashboardView />
        ) : (
        <div className="space-y-5">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={BarChart3}
              title="Total Assessments"
              value={dashboardData.totalAssessments}
              subtitle="All assessments"
              color="almet"
            />
            <StatCard
              icon={TrendingUp}
              title="Completed"
              value={dashboardData.completedAssessments}
              subtitle={`${dashboardData.completionRate.toFixed(1)}% completion rate`}
              color="green"
            />
            <StatCard
              icon={Users}
              title="Behavioral"
              value={dashboardData.behavioralAssessments}
              subtitle="Soft skills assessments"
              color="purple"
            />
            <StatCard
              icon={Target}
              title="Core Competency"
              value={dashboardData.coreAssessments}
              subtitle="Technical skills assessments"
              color="orange"
            />
            <StatCard
              icon={Crown}
              title="Leadership"
              value={dashboardData.leadershipAssessments}
              subtitle="Senior position assessments"
              color="blue"
            />
          </div>

          {/* Assessment Types Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <NavigationCard
              icon={Crown}
              title="Leadership Assessment"
              subtitle="Comprehensive leadership evaluation for senior positions including Manager, Vice Chairman, Director, Vice President, and HOD"
              color="from-amber-100 via-amber-200 to-amber-300"
              count={dashboardData.leadershipAssessments}
              isActive={false}
              onClick={() => setActiveView('leadership')}
            />
            <NavigationCard
              icon={Users}
              title="Behavioral Competency Assessment"
              subtitle="Evaluate employee behavioral competencies, soft skills, and interpersonal abilities through structured assessments"
              color="from-violet-100 via-violet-200 to-violet-300"
              count={dashboardData.behavioralAssessments}
              isActive={false}
              onClick={() => setActiveView('behavioral')}
            />
            
            <NavigationCard
              icon={Target}
              title="Core Competency Assessment"
              subtitle="Assess technical skills, core competencies, and job-specific requirements for comprehensive employee evaluation"
              color="from-blue-100 via-blue-200 to-blue-300"
              count={dashboardData.coreAssessments}
              isActive={false}
              onClick={() => setActiveView('core')}
            />
          </div>
        </div>
        )}
      </>
    )}

      {/* ✅ Assessment views with Real Components */}
      {activeView === 'leadership' && (
        <div className="space-y-4">
          <LeadershipAssessmentCalculation />
        </div>
      )}

      {activeView === 'behavioral' && (
        <div className="space-y-4">
          <BehavioralAssessmentCalculation />
        </div>
      )}

      {activeView === 'core' && (
        <div className="space-y-4">
          <CoreEmployeeCalculation />
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmModal.type}
        darkMode={darkMode}
      />
    </div>
  );
};

const AssessmentMatrix = ({ onNavigateToManagement }) => {
  return (
    <ToastProvider>
      <AssessmentMatrixInner onNavigateToManagement={onNavigateToManagement} />
    </ToastProvider>
  );
};

export default AssessmentMatrix;