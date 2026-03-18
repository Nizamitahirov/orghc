import { ClipboardList, CheckCircle } from 'lucide-react';

export default function SurveyBanner({
  surveyStatus,
  currentPeriod,
  permissions,
  onOpen,
  darkMode,
  endYearCompleted,
}) {
  const hasEmployee = Boolean(permissions?.employee);
  const isEndYear   = currentPeriod === 'END_YEAR_REVIEW';
  const hasSurvey   = surveyStatus !== null && surveyStatus !== undefined;

  if (!hasEmployee || !isEndYear || !hasSurvey || !endYearCompleted) return null;

  const isSubmitted  = surveyStatus === 'SUBMITTED';
  const isDraft      = surveyStatus === 'DRAFT';

  const config = (() => {
    if (isSubmitted) return {
      wrap:    darkMode ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200',
      icon:    darkMode ? 'bg-emerald-700/30' : 'bg-emerald-100',
      iconEl:  <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />,
      title:   darkMode ? 'text-emerald-300' : 'text-emerald-800',
      sub:     darkMode ? 'text-emerald-500' : 'text-emerald-600',
      btn:     'bg-emerald-600 hover:bg-emerald-700',
      shadow:  'rgba(16,185,129,0.3)',
      heading: 'Survey Submitted — Thank You!',
      subtext: 'Your feedback has been recorded. You can review your responses below.',
      cta:     'View Responses',
    };

    if (isDraft) return {
      wrap:    darkMode ? 'bg-gradient-to-r from-orange-900/40 to-amber-900/40 border-orange-700/50' : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200',
      icon:    darkMode ? 'bg-orange-700/40' : 'bg-orange-100',
      iconEl:  <ClipboardList className={`w-6 h-6 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`} />,
      title:   darkMode ? 'text-orange-200' : 'text-orange-800',
      sub:     darkMode ? 'text-orange-400' : 'text-orange-600',
      btn:     'bg-orange-500 hover:bg-orange-600',
      shadow:  'rgba(249,115,22,0.35)',
      heading: 'Your Survey is In Progress',
      subtext: 'You have unsaved responses — continue where you left off.',
      cta:     'Continue →',
    };

    // NOT_STARTED
    return {
      wrap:    darkMode ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/50' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200',
      icon:    darkMode ? 'bg-purple-700/40' : 'bg-purple-100',
      iconEl:  <ClipboardList className={`w-6 h-6 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />,
      title:   darkMode ? 'text-purple-200' : 'text-purple-800',
      sub:     darkMode ? 'text-purple-400' : 'text-purple-600',
      btn:     'bg-purple-600 hover:bg-purple-700',
      shadow:  'rgba(124,58,237,0.35)',
      heading: 'Your Annual Survey is Waiting',
      subtext: 'Takes only 2–3 minutes · Your feedback shapes a better workplace',
      cta:     'Start Now →',
    };
  })();

  return (
    <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${config.wrap}`}>
      <div className={`p-3 rounded-xl flex-shrink-0 ${config.icon}`}>
        {config.iconEl}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${config.title}`}>{config.heading}</p>
        <p className={`text-xs mt-0.5 ${config.sub}`}>{config.subtext}</p>
      </div>
      <button
        onClick={onOpen}
        className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm text-white ${config.btn}`}
        style={{ boxShadow: `0 4px 12px ${config.shadow}` }}
      >
        {config.cta}
      </button>
    </div>
  );
}