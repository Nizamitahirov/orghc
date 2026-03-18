import { useState, useEffect } from 'react';
import { User, Users, Target, BarChart3, Calendar, Award, Lock } from 'lucide-react';
import TeamMembersWithSearch from './TeamMembersWithSearch';
import FixedStatCards from './FixedStatCards';
import FixedAnalyticsDashboard from './PerformanceAnalyticsDashboard';
import SurveyBanner from './SurveyBanner';

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
  darkMode,
  surveyStatus,
  currentPeriod,
  onViewMySurvey,
  endYearCompleted,
}) {
  const getSavedTab = () => {
    if (typeof window === 'undefined') return 'overview';
    return localStorage.getItem('performance_active_tab') || 'overview';
  };
  const [activeTab, setActiveTab] = useState(getSavedTab);
  useEffect(() => {
    localStorage.setItem('performance_active_tab', activeTab);
  }, [activeTab]);

  const isManager = permissions?.is_manager  || false;
  const isAdmin   = permissions?.is_admin    || false;
  const canSeeAll = permissions?.can_view_all || false;

  const visibleEmployees = employees || [];
  const teamMembers = visibleEmployees.filter(e => e.id !== permissions?.employee?.id);
  const selfOnly    = visibleEmployees.filter(e => e.id === permissions?.employee?.id);

  const accessBanner = (() => {
    if (canSeeAll || isAdmin)
      return { type: 'success', icon: Award, title: 'Admin Access', msg: `Viewing all ${visibleEmployees.length} employees` };
    if (isManager)
      return { type: 'info', icon: Users, title: 'Manager View', msg: `Your performance + ${teamMembers.length} direct report(s)` };
    return { type: 'warning', icon: Lock, title: 'Personal View', msg: 'You can only view your own performance' };
  })();

  const bannerColors = {
    success: darkMode ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info:    darkMode ? 'bg-sky-900/20 border-sky-800/30 text-sky-300'             : 'bg-sky-50 border-sky-200 text-sky-800',
    warning: darkMode ? 'bg-amber-900/20 border-amber-800/30 text-amber-300'       : 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    ...(isManager || isAdmin ? [
      { id: 'my-performance', label: 'My Performance', icon: User  },
      { id: 'team',           label: 'My Team',        icon: Users },
      { id: 'analytics',      label: 'Analytics',      icon: BarChart3 },
    ] : [
      { id: 'team', label: 'My Performance', icon: User },
    ]),
  ];

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
        <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
          <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Period</div>
          <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            {data.start} → {data.end}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Access banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bannerColors[accessBanner.type]}`}>
        <accessBanner.icon className="w-4 h-4 flex-shrink-0" />
        <div>
          <span className="text-xs font-bold">{accessBanner.title}: </span>
          <span className="text-xs">{accessBanner.msg}</span>
        </div>
      </div>

      <SurveyBanner
        surveyStatus={surveyStatus}
        currentPeriod={currentPeriod}
        permissions={permissions}
        onOpen={onViewMySurvey}
        darkMode={darkMode}
        endYearCompleted={endYearCompleted}
      />

      {/* Tab bar */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-3`}>
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all flex-1 justify-center text-sm font-semibold ${
                  isActive
                    ? 'bg-almet-sapphire text-white shadow-md'
                    : darkMode
                      ? 'bg-almet-san-juan/30 text-almet-bali-hai hover:bg-almet-san-juan/50'
                      : 'bg-almet-mystic text-almet-waterloo hover:bg-almet-mystic/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[600px]">

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {(isManager || isAdmin || canSeeAll) && (
              <FixedStatCards employees={visibleEmployees} darkMode={darkMode} />
            )}

            {!isManager && !isAdmin && !canSeeAll && (
              <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-8 text-center`}>
                <User className="w-12 h-12 mx-auto mb-3 text-almet-sapphire/40" />
                <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Welcome to Performance Management
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                  Track your goals, reviews, and development all in one place.
                </p>
                <button
                  onClick={() => setActiveTab('team')}
                  className="px-5 py-2.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                  View My Performance
                </button>
              </div>
            )}

            {dashboardStats?.timeline && (
              <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-sky-500/10 dark:bg-sky-500/20">
                    <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
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
                  <TimelineItem label="Goal Setting"    data={dashboardStats.timeline.goal_setting} color="bg-almet-sapphire" isLast={false} />
                  <TimelineItem label="Mid-Year Review" data={dashboardStats.timeline.mid_year}     color="bg-orange-500"    isLast={false} />
                  <TimelineItem label="End-Year Review" data={dashboardStats.timeline.end_year}     color="bg-purple-500"    isLast={true}  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-performance' && (
          <TeamMembersWithSearch
            employees={selfOnly}
            currentUserId={permissions?.employee?.id}
            canViewEmployee={canViewEmployee}
            onSelectEmployee={onSelectEmployee}
            onInitializeEmployee={onInitializeEmployee}
            performanceYearId={performanceYearId}
            canInitialize={canInitialize}
            darkMode={darkMode}
            isPersonalView={true}
          />
        )}

        {activeTab === 'team' && (
          <TeamMembersWithSearch
            employees={isManager || isAdmin ? teamMembers : selfOnly}
            currentUserId={permissions?.employee?.id}
            canViewEmployee={canViewEmployee}
            onSelectEmployee={onSelectEmployee}
            onInitializeEmployee={onInitializeEmployee}
            performanceYearId={performanceYearId}
            canInitialize={canInitialize}
            darkMode={darkMode}
            isPersonalView={!isManager && !isAdmin}
          />
        )}

        {activeTab === 'analytics' && (
          <FixedAnalyticsDashboard
            employees={visibleEmployees}
            settings={settings}
            darkMode={darkMode}
            onLoadEmployeePerformance={onLoadEmployeePerformance}
            selectedYear={selectedYear}
            isManager={isManager}
            canViewAll={canSeeAll}
          />
        )}
      </div>
    </div>
  );
}