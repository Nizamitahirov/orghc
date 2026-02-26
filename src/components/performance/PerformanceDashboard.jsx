import { useState, useEffect } from 'react';
import { Users, Target, FileText, Award, Lock, ChevronRight, Calendar,  BarChart3, Search, X, AlertCircle, User } from 'lucide-react';

// Import components
import TeamMembersWithSearch from './TeamMembersWithSearch';
import FixedStatCards from './FixedStatCards';
import FixedAnalyticsDashboard from './PerformanceAnalyticsDashboard';

export default function PerformanceDashboard({ 
  dashboardStats, 
  employees, 
  permissions,
  settings,
  selectedYear,
  onSelectEmployee,
  canViewEmployee,
  onLoadEmployeePerformance,
  onInitializeEmployee,
  performanceYearId,
  canInitialize,
  darkMode 
}) {
  const getSavedTab = () => {
    if (typeof window === 'undefined') return 'overview';
    const saved = localStorage.getItem('performance_active_tab');
    return saved || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getSavedTab);

  useEffect(() => {
    localStorage.setItem('performance_active_tab', activeTab);
  }, [activeTab]);

  // ✅ SIMPLIFIED: Backend already filtered employees
  const visibleEmployees = employees || [];
  
  const teamMembers = visibleEmployees.filter(emp => emp.id !== permissions.employee?.id);
  const selfOnly = visibleEmployees.filter(emp => emp.id === permissions.employee?.id);
  const totalEmployees = visibleEmployees.length;

  // ✅ SIMPLIFIED: Access level message
  const getAccessLevelMessage = () => {
    if (permissions.can_view_all) {
      return {
        type: 'success',
        icon: Award,
        title: 'Full Access',
        message: `Viewing all ${totalEmployees} employees in the system`
      };
    }
    
    if (permissions.is_manager) {
      return {
        type: 'info',
        icon: Users,
        title: 'Manager View',
        message: `Viewing your performance + ${teamMembers.length} direct reports`
      };
    }
    
    return {
      type: 'warning',
      icon: Lock,
      title: 'Personal View',
      message: 'Viewing only your own performance'
    };
  };

  const accessLevel = getAccessLevelMessage();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target, badge: null },
    ...(permissions.is_manager ? [
      { 
        id: 'my-performance', 
        label: 'My Performance', 
        icon: User, 
        badge: 1
      }
    ] : []),
    { 
      id: 'team', 
      label: permissions.is_manager ? 'Team Members' : 'My Performance', 
      icon: Users, 
      badge: permissions.is_manager ? teamMembers.length : 1
    },
    { 
      id: 'analytics', 
      label: 'Team Analytics', 
      icon: BarChart3, 
      badge: null,
      hidden: !permissions.is_manager && !permissions.can_view_all
    }
  ].filter(tab => !tab.hidden);

  const TimelineItem = ({ label, data, color, isLast }) => (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${color} ring-4 ${darkMode ? 'ring-almet-cloud-burst' : 'ring-white'}`} />
        {!isLast && <div className={`w-0.5 h-full ${darkMode ? 'bg-almet-comet' : 'bg-gray-200'} mt-1`} />}
      </div>
      
      <div className="flex-1 pb-6">
        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
          {label}
        </h4>
        
        {data.employee_start ? (
          <div className="grid grid-cols-2 gap-2">
            <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Employee Period</div>
              <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {data.employee_start} → {data.employee_end}
              </div>
            </div>
            <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Manager Period</div>
              <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {data.manager_start} → {data.manager_end}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
            <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Period</div>
            <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              {data.start} → {data.end}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Access Level Notice */}
      <div className={`${
        accessLevel.type === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30' :
        accessLevel.type === 'info' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30' :
        'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30'
      } border rounded-xl p-3`}>
        <div className="flex gap-2">
          <accessLevel.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
            accessLevel.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
            accessLevel.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
            'text-amber-600 dark:text-amber-400'
          }`} />
          <div>
            <h3 className={`text-xs font-semibold mb-0.5 ${
              accessLevel.type === 'success' ? 'text-emerald-900 dark:text-emerald-300' :
              accessLevel.type === 'info' ? 'text-blue-900 dark:text-blue-300' :
              'text-amber-900 dark:text-amber-300'
            }`}>
              {accessLevel.title}
            </h3>
            <p className={`text-xs ${
              accessLevel.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' :
              accessLevel.type === 'info' ? 'text-blue-700 dark:text-blue-400' :
              'text-amber-700 dark:text-amber-400'
            }`}>
              {accessLevel.message}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-3`}>
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all flex-1 ${
                  isActive 
                    ? 'bg-almet-sapphire text-white shadow-lg' 
                    : darkMode
                      ? 'bg-almet-san-juan/30 text-almet-bali-hai hover:bg-almet-san-juan/50'
                      : 'bg-almet-mystic text-almet-waterloo hover:bg-almet-mystic/80'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span className="font-semibold text-sm">{tab.label}</span>
                
                {tab.badge !== null && (
                  <span className={`ml-auto px-2 py-0.5 rounded-lg text-xs font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : darkMode
                        ? 'bg-almet-comet/30 text-almet-bali-hai'
                        : 'bg-white text-almet-waterloo'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {(permissions.is_manager || permissions.can_view_all) && (
              <FixedStatCards employees={visibleEmployees} darkMode={darkMode} />
            )}

            {!permissions.is_manager && !permissions.can_view_all && (
              <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-6 text-center`}>
                <User className="w-12 h-12 mx-auto mb-4 text-almet-sapphire/30" />
                <h3 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Welcome to Performance Management
                </h3>
                <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-4`}>
                  View and manage your performance goals, reviews, and development needs
                </p>
                <button
                  onClick={() => setActiveTab('team')}
                  className="px-6 py-3 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-xs font-medium transition-all shadow-sm"
                >
                  View My Performance
                </button>
              </div>
            )}

            {dashboardStats?.timeline && (
              <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                      Performance Timeline
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                      Key dates and periods
                    </p>
                  </div>
                </div>
                
                <div>
                  <TimelineItem
                    label="Goal Setting"
                    data={dashboardStats.timeline.goal_setting}
                    color="bg-almet-sapphire"
                    isLast={false}
                  />
                  <TimelineItem
                    label="Mid-Year Review"
                    data={dashboardStats.timeline.mid_year}
                    color="bg-orange-500"
                    isLast={false}
                  />
                  <TimelineItem
                    label="End-Year Review"
                    data={dashboardStats.timeline.end_year}
                    color="bg-purple-500"
                    isLast={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        
  {activeTab === 'my-performance' && (
    <TeamMembersWithSearch
      employees={selfOnly}
      currentUserId={permissions.employee?.id}
      canViewEmployee={canViewEmployee}
      onSelectEmployee={onSelectEmployee}
      // ✅ NEW:
      onInitializeEmployee={onInitializeEmployee}
   
      performanceYearId={performanceYearId}
      canInitialize={canInitialize}
      darkMode={darkMode}
      isPersonalView={true}
    />
  )}

  {activeTab === 'team' && (
    <TeamMembersWithSearch
      employees={permissions.is_manager ? teamMembers : selfOnly}
      currentUserId={permissions.employee?.id}
      canViewEmployee={canViewEmployee}
      onSelectEmployee={onSelectEmployee}
      // ✅ NEW:
      onInitializeEmployee={onInitializeEmployee}
  
      performanceYearId={performanceYearId}
      canInitialize={canInitialize}
      darkMode={darkMode}
      isPersonalView={!permissions.is_manager}
    />
  )}

        {activeTab === 'analytics' && (
          <FixedAnalyticsDashboard
            employees={visibleEmployees}
            settings={settings}
            darkMode={darkMode}
            onLoadEmployeePerformance={onLoadEmployeePerformance}
            selectedYear={selectedYear}
            isManager={permissions.is_manager}
            canViewAll={permissions.can_view_all}
          />
        )}
      </div>
    </div>
  );
}