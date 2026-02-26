import { Settings, Users, FileText, Calendar } from 'lucide-react';

const PERIOD_FRIENDLY = {
  GOAL_SETTING:    { label: 'Goal Setting',    color: 'bg-almet-sapphire' },
  MID_YEAR_REVIEW: { label: 'Mid-Year Review', color: 'bg-orange-500'     },
  END_YEAR_REVIEW: { label: 'End-Year Review', color: 'bg-purple-500'     },
  CLOSED:          { label: 'Closed',          color: 'bg-gray-500'       },
};

export default function PerformanceHeader({
  selectedYear,
  setSelectedYear,
  performanceYears,
  currentPeriod,
  onViewTeamSurveys,
  onViewMySurvey,
  onSettings,
  darkMode,
  permissions,
}) {
  const period   = PERIOD_FRIENDLY[currentPeriod] || { label: currentPeriod, color: 'bg-gray-500' };
  const isAdmin  = permissions?.is_admin   || false;


  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-4 mb-4`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* Left — title + period */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${period.color}`}>
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              Performance Management {selectedYear}
            </h1>
            <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
              Current period: <span className="font-semibold">{period.label}</span>
            </p>
          </div>
        </div>

        {/* Right — controls */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Year selector */}
          <select
            value={selectedYear || ''}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className={`px-3 h-9 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
              darkMode
                ? 'bg-almet-san-juan border-almet-comet text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {performanceYears.map(y => (
              <option key={y.id} value={y.year}>{y.year}</option>
            ))}
          </select>


          {/* Team Surveys — only admins */}
          { isAdmin && onViewTeamSurveys && (
            <button
              onClick={onViewTeamSurveys}
              className="h-9 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              Team Surveys
            </button>
          )}

          {/* Settings — admin only, disabled otherwise */}
          {isAdmin ? (
            <button
              onClick={onSettings}
              className="h-9 px-4 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          ) : (
            <div
              title="Only admins can access settings"
              className={`h-9 px-4 rounded-xl text-sm flex items-center gap-2 cursor-not-allowed border ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600 text-gray-500'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}