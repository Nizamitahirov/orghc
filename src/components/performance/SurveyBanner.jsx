import { ClipboardList, CheckCircle } from 'lucide-react';

/**
 * SurveyBanner
 *
 * Visibility rules (all must be true to show):
 *   • permissions.employee exists  (logged-in user is an employee, not manager-only)
 *   • currentPeriod === 'END_YEAR_REVIEW'
 *   • surveyStatus !== null  (survey has been initialised — page.jsx loads it)
 *
 * When surveyStatus === 'SUBMITTED' → shows read-only "View" variant
 * When surveyStatus === 'DRAFT'     → shows "Start / Continue" CTA
 */
export default function SurveyBanner({
  surveyStatus,   // 'DRAFT' | 'SUBMITTED' | null
  currentPeriod,  // string from activeYear
  permissions,    // compatiblePermissions
  onOpen,         // opens survey (read-only if submitted)
  darkMode,
}) {
  const hasEmployee  = Boolean(permissions?.employee);
  const isEndYear    = currentPeriod === 'END_YEAR_REVIEW';
  const hasSurvey    = surveyStatus !== null && surveyStatus !== undefined;

  // Don't render outside END_YEAR period or for manager-only accounts
  if (!hasEmployee || !isEndYear || !hasSurvey) return null;

  const isSubmitted = surveyStatus === 'SUBMITTED';

  return (
    <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${
      isSubmitted
        ? darkMode
          ? 'bg-emerald-900/20 border-emerald-700/40'
          : 'bg-emerald-50 border-emerald-200'
        : darkMode
          ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/50'
          : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
    }`}>

      {/* Icon */}
      <div className={`p-3 rounded-xl flex-shrink-0 ${
        isSubmitted
          ? darkMode ? 'bg-emerald-700/30' : 'bg-emerald-100'
          : darkMode ? 'bg-purple-700/40'  : 'bg-purple-100'
      }`}>
        {isSubmitted
          ? <CheckCircle  className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          : <ClipboardList className={`w-6 h-6 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${
          isSubmitted
            ? darkMode ? 'text-emerald-300' : 'text-emerald-800'
            : darkMode ? 'text-purple-200'  : 'text-purple-800'
        }`}>
          {isSubmitted ? 'Survey Submitted — Thank You!' : 'Your Annual Survey is Waiting'}
        </p>
        <p className={`text-xs mt-0.5 ${
          isSubmitted
            ? darkMode ? 'text-emerald-500' : 'text-emerald-600'
            : darkMode ? 'text-purple-400'  : 'text-purple-600'
        }`}>
          {isSubmitted
            ? 'Your feedback has been recorded. You can review your responses below.'
            : 'Takes only 2–3 minutes · Your feedback shapes a better workplace'}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onOpen}
        className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm text-white ${
          isSubmitted
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
        style={{
          boxShadow: isSubmitted
            ? '0 4px 12px rgba(16,185,129,0.3)'
            : '0 4px 12px rgba(124,58,237,0.35)',
        }}
      >
        {isSubmitted ? 'View Responses' : 'Start Now →'}
      </button>
    </div>
  );
}