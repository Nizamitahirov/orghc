"use client";
import { useState, useEffect, memo, useMemo } from 'react';
import {
  User, Users, Target, BarChart3, Calendar, Award, Lock,
  CheckCircle, Clock, AlertTriangle, TrendingUp, ChevronRight,
  Star, Zap, Activity
} from 'lucide-react';
import TeamMembersWithSearch from './TeamMembersWithSearch';
import FixedStatCards from './FixedStatCards';
import FixedAnalyticsDashboard from './PerformanceAnalyticsDashboard';
import SurveyBanner from './SurveyBanner';
import { usePersistentState } from '@/hooks/usePersistentState';

/* ── Period timeline item ──────────────────────────────────────────── */
const TimelineItem = memo(({ label, data, color, dotColor, isActive, isLast, darkMode }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full ring-4 transition-all ${dotColor} ${
        isActive
          ? darkMode ? 'ring-almet-sapphire/30' : 'ring-almet-sapphire/20'
          : darkMode ? 'ring-almet-cloud-burst' : 'ring-white'
      }`} />
      {!isLast && <div className={`w-0.5 flex-1 mt-1 ${darkMode ? 'bg-almet-comet/40' : 'bg-gray-200'}`} />}
    </div>
    <div className="flex-1 pb-5">
      <div className="flex items-center gap-2 mb-1">
        <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{label}</h4>
        {isActive && (
          <span className="px-2 py-0.5 bg-almet-sapphire text-white text-[10px] font-bold rounded-full animate-pulse">
            Active
          </span>
        )}
      </div>
      <div className={`rounded-lg p-2.5 ${darkMode ? 'bg-almet-san-juan/50' : 'bg-gray-50'} border ${darkMode ? 'border-almet-comet/30' : 'border-gray-100'}`}>
        <p className={`text-xs font-medium ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'} mb-1`}>Period</p>
        <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {data?.start} → {data?.end}
        </p>
      </div>
    </div>
  </div>
));
TimelineItem.displayName = 'TimelineItem';

/* ── Quick stats for overview tab ──────────────────────────────────── */
const QuickMetric = memo(({ icon: Icon, label, value, sub, color, darkMode }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border ${
    darkMode ? 'bg-almet-san-juan/30 border-almet-comet/30' : 'bg-gray-50 border-gray-100'
  }`}>
    <div className={`p-2 rounded-xl ${color}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="min-w-0">
      <p className={`text-lg font-bold leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>{label}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-almet-bali-hai/60' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  </div>
));
QuickMetric.displayName = 'QuickMetric';

/* ── Main component ─────────────────────────────────────────────────── */
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
  const [activeTab, setActiveTab] = usePersistentState('perf_dashboard_tab', 'overview');
  useEffect(() => { localStorage.setItem('performance_active_tab', activeTab); }, [activeTab]);

  const isManager = permissions?.is_manager  || false;
  const isAdmin   = permissions?.is_admin    || false;
  const canSeeAll = permissions?.can_view_all || false;

  const visibleEmployees = employees || [];
  const teamMembers = visibleEmployees.filter(e => e.id !== permissions?.employee?.id);
  const selfOnly    = visibleEmployees.filter(e => e.id === permissions?.employee?.id);

  const accessBanner = useMemo(() => {
    if (canSeeAll || isAdmin) return {
      type: 'success',
      icon: Award,
      title: 'Admin Access',
      msg: `Viewing all ${visibleEmployees.length} employees`,
      bg: darkMode ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-200',
      text: darkMode ? 'text-emerald-300' : 'text-emerald-800',
    };
    if (isManager) return {
      type: 'info',
      icon: Users,
      title: 'Manager View',
      msg: `Your performance + ${teamMembers.length} direct report(s)`,
      bg: darkMode ? 'bg-sky-900/20 border-sky-800/30' : 'bg-sky-50 border-sky-200',
      text: darkMode ? 'text-sky-300' : 'text-sky-800',
    };
    return {
      type: 'warning',
      icon: Lock,
      title: 'Personal View',
      msg: 'You can only view your own performance',
      bg: darkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-200',
      text: darkMode ? 'text-amber-300' : 'text-amber-800',
    };
  }, [canSeeAll, isAdmin, isManager, teamMembers.length, visibleEmployees.length, darkMode]);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Activity },
    ...(isManager || isAdmin ? [
      { id: 'my-performance', label: 'My Performance', icon: User   },
      { id: 'team',           label: 'My Team',        icon: Users  },
      { id: 'analytics',      label: 'Analytics',      icon: BarChart3 },
    ] : [
      { id: 'team', label: 'My Performance', icon: User },
    ]),
  ], [isManager, isAdmin]);

  /* quick metrics for overview */
  const qMetrics = useMemo(() => {
    const total    = visibleEmployees.length;
    const approved = visibleEmployees.filter(e => e.objectives_employee_approved).length;
    const mid      = visibleEmployees.filter(e => e.mid_year_completed).length;
    const done     = visibleEmployees.filter(e => e.end_year_completed || e.approval_status === 'COMPLETED').length;
    const action   = visibleEmployees.filter(e => ['PENDING_EMPLOYEE_APPROVAL','NEED_CLARIFICATION'].includes(e.approval_status)).length;
    return { total, approved, mid, done, action };
  }, [visibleEmployees]);

  const periodTimeline = useMemo(() => {
    if (!dashboardStats?.timeline) return null;
    return [
      { key: 'GOAL_SETTING',    label: 'Goal Setting',    data: dashboardStats.timeline.goal_setting, dotColor: 'bg-almet-sapphire' },
      { key: 'MID_YEAR_REVIEW', label: 'Mid-Year Review', data: dashboardStats.timeline.mid_year,     dotColor: 'bg-orange-500' },
      { key: 'END_YEAR_REVIEW', label: 'End-Year Review', data: dashboardStats.timeline.end_year,     dotColor: 'bg-purple-500' },
    ];
  }, [dashboardStats]);

  return (
    <div className="space-y-3">
      {/* Access banner */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${accessBanner.bg}`}>
        <accessBanner.icon className={`w-4 h-4 flex-shrink-0 ${accessBanner.text}`} />
        <div className={accessBanner.text}>
          <span className="text-xs font-bold">{accessBanner.title}: </span>
          <span className="text-xs">{accessBanner.msg}</span>
        </div>
      </div>

      {/* Survey banner */}
      <SurveyBanner
        surveyStatus={surveyStatus}
        currentPeriod={currentPeriod}
        permissions={permissions}
        onOpen={onViewMySurvey}
        darkMode={darkMode}
        endYearCompleted={endYearCompleted}
      />

      {/* Tab bar */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-1.5`}>
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center text-sm font-semibold ${
                  isActive
                    ? 'bg-almet-sapphire text-white shadow-sm'
                    : darkMode
                      ? 'text-almet-bali-hai hover:text-white hover:bg-almet-san-juan/50'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
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
      <div>
        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats for admin/manager */}
            {(isManager || isAdmin || canSeeAll) && (
              <>
                <FixedStatCards employees={visibleEmployees} darkMode={darkMode} />

            
              </>
            )}

            {/* Personal welcome for regular employees */}
            {!isManager && !isAdmin && !canSeeAll && (
              <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-6 text-center`}>
                <div className="w-14 h-14 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-base font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome to Performance Management
                </h3>
                <p className={`text-sm mb-5 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                  Track your goals, reviews, and development progress all in one place.
                </p>
                <button
                  onClick={() => setActiveTab('team')}
                  className="px-5 py-2.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-semibold transition-all shadow-sm inline-flex items-center gap-2"
                >
                  View My Performance <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Timeline */}
            {periodTimeline && (
              <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}>
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-almet-comet/50' : 'border-gray-100'} flex items-center gap-3`}>
                  <div className="p-2 rounded-xl bg-sky-500/10">
                    <Calendar className="w-4 h-4 text-sky-500" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Performance Timeline</h3>
                    <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>Key dates and review periods</p>
                  </div>
                </div>
                <div className="p-4">
                  {periodTimeline.map((item, i) => (
                    <TimelineItem
                      key={item.key}
                      label={item.label}
                      data={item.data}
                      dotColor={item.dotColor}
                      isActive={currentPeriod === item.key}
                      isLast={i === periodTimeline.length - 1}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── My Performance ── */}
        {activeTab === 'my-performance' && (
          <TeamMembersWithSearch
            employees={selfOnly}
            currentUserId={permissions?.employee?.id}
            currentPeriod={currentPeriod}
            canViewEmployee={canViewEmployee}
            onSelectEmployee={onSelectEmployee}
            onInitializeEmployee={onInitializeEmployee}
            performanceYearId={performanceYearId}
            canInitialize={canInitialize}
            darkMode={darkMode}
            isPersonalView={true}
          />
        )}

        {/* ── Team ── */}
        {activeTab === 'team' && (
          <TeamMembersWithSearch
            employees={isManager || isAdmin ? teamMembers : selfOnly}
            currentUserId={permissions?.employee?.id}
            currentPeriod={currentPeriod}
            canViewEmployee={canViewEmployee}
            onSelectEmployee={onSelectEmployee}
            onInitializeEmployee={onInitializeEmployee}
            performanceYearId={performanceYearId}
            canInitialize={canInitialize}
            darkMode={darkMode}
            isPersonalView={!isManager && !isAdmin}
          />
        )}

        {/* ── Analytics ── */}
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
