"use client";
import { memo } from 'react';
import { Settings, Users, Calendar, ChevronDown, Target, FileText, Award } from 'lucide-react';

const PERIOD_CONFIG = {
  GOAL_SETTING:    { label: 'Goal Setting',    color: 'bg-almet-sapphire', light: 'bg-almet-sapphire/10 text-almet-sapphire border-almet-sapphire/20', step: 1 },
  MID_YEAR_REVIEW: { label: 'Mid-Year Review', color: 'bg-orange-500',     light: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30', step: 2 },
  END_YEAR_REVIEW: { label: 'End-Year Review', color: 'bg-purple-500',     light: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30', step: 3 },
  CLOSED:          { label: 'Closed',          color: 'bg-gray-500',       light: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', step: 0 },
};

const STEPS = [
  { key: 'GOAL_SETTING',    icon: Target,   label: 'Goals'   },
  { key: 'MID_YEAR_REVIEW', icon: FileText, label: 'Mid-Year'},
  { key: 'END_YEAR_REVIEW', icon: Award,    label: 'End-Year'},
];

export default memo(function PerformanceHeader({
  selectedYear,
  setSelectedYear,
  performanceYears,
  currentPeriod,
  onViewTeamSurveys,
  onSettings,
  darkMode,
  permissions,
}) {
  const period  = PERIOD_CONFIG[currentPeriod] || { label: currentPeriod || 'Unknown', color: 'bg-gray-500', light: 'bg-gray-100 text-gray-600 border-gray-200', step: 0 };
  const isAdmin = permissions?.is_admin || false;

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm mb-4 overflow-hidden`}>
      {/* Top active period accent */}
      <div className={`h-1 ${period.color}`} />

      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* Left: title + period badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl ${period.color} shadow-sm flex-shrink-0`}>
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className={`text-base font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Performance Management
              </h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${period.light}`}>
                  {period.label}
                </span>
                {currentPeriod && currentPeriod !== 'CLOSED' && (
                  <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                    currently active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Year selector */}
            <div className="relative">
              <select
                value={selectedYear || ''}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className={`pl-3 pr-8 h-9 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 appearance-none cursor-pointer font-semibold ${
                  darkMode
                    ? 'bg-almet-san-juan border-almet-comet text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                {(performanceYears || []).map(y => (
                  <option key={y.id} value={y.year}>{y.year}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`} />
            </div>

            {/* Team Surveys — admin only */}
            {isAdmin && onViewTeamSurveys && (
              <button
                onClick={onViewTeamSurveys}
                className="h-9 px-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Team Surveys</span>
              </button>
            )}

            {/* Settings */}
            {isAdmin ? (
              <button
                onClick={onSettings}
                className="h-9 px-3.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            ) : (
              <div
                title="Only admins can access settings"
                className={`h-9 px-3.5 rounded-lg text-sm flex items-center gap-2 cursor-not-allowed border opacity-50 ${
                  darkMode
                    ? 'bg-gray-700/50 border-gray-600 text-gray-500'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </div>
            )}
          </div>
        </div>

  
      </div>
    </div>
  );
});
