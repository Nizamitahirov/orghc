import { Settings, RefreshCw, Calendar } from 'lucide-react';

export default function PerformanceHeader({ 
  selectedYear, 
  setSelectedYear, 
  performanceYears, 
  currentPeriod, 
  loading, 
  onRefresh,
  onSettings,
  darkMode,
  permissions
}) {
  const getPeriodLabel = (period) => {
    const labels = {
      'GOAL_SETTING': 'Goal Setting',
      'MID_YEAR_REVIEW': 'Mid-Year Review',
      'END_YEAR_REVIEW': 'End-Year Review',
      'CLOSED': 'Closed'
    };
    return labels[period] || 'Unknown';
  };

  const getPeriodColor = (period) => {
    const colors = {
      'GOAL_SETTING': 'bg-almet-sapphire',
      'MID_YEAR_REVIEW': 'bg-orange-500',
      'END_YEAR_REVIEW': 'bg-purple-500',
      'CLOSED': 'bg-gray-500'
    };
    return colors[period] || 'bg-gray-500';
  };

  // ✅ SIMPLIFIED: Just check is_admin
  const hasSettingsAccess = permissions?.is_admin || false;

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-almet-comet' : 'border-gray-200'} p-4 mb-4`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left - Title */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getPeriodColor(currentPeriod)}`}>
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              Performance Management {selectedYear}
            </h1>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
              {getPeriodLabel(currentPeriod)} Period
            </p>
          </div>
        </div>
        
        {/* Right - Controls */}
        <div className="flex items-center gap-2">
          {/* Year Selector */}
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className={`px-3 h-9 text-sm rounded-lg border ${
              darkMode 
                ? 'bg-almet-san-juan border-almet-comet text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
          >
            {performanceYears.map(year => (
              <option key={year.id} value={year.year}>
                {year.year}
              </option>
            ))}
          </select>
          
          {/* Settings Button - Admin Only */}
          {hasSettingsAccess ? (
            <button
              onClick={onSettings}
              className={`px-3 h-9 rounded-lg border flex items-center gap-2 text-sm ${
                darkMode 
                  ? 'bg-almet-sapphire border-almet-sapphire text-white hover:bg-almet-astral' 
                  : 'bg-almet-sapphire border-almet-sapphire text-white hover:bg-almet-astral'
              } transition-colors`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          ) : (
            <div 
              className={`px-3 h-9 rounded-lg border flex items-center gap-2 text-xs ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-gray-400' 
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              } cursor-not-allowed`}
              title="Settings access restricted to admins"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}