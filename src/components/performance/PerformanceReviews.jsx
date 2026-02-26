import { useState, useRef, useEffect } from 'react';
import { FileText, User, UserCheck, X, Send, MessageSquare, AlertCircle, Plus, Clock } from 'lucide-react';

export default function PerformanceReviews({
  midYearEmployee,
  midYearManager,
  endYearEmployee,
  endYearManager,
  currentPeriod,
  performanceData,
  permissions,
  onSubmitMidYearEmployee,
  onSubmitMidYearManager,
  onSubmitEndYearEmployee,
  onSubmitEndYearManager,
  darkMode
}) {
  const isMidYearPeriod = currentPeriod === 'MID_YEAR_REVIEW';
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';

  const isCurrentUserEmployee = (() => {
    if (!permissions?.employee?.id || !performanceData?.employee) return false;
    return String(permissions.employee.id) === String(performanceData.employee);
  })();

  const isCurrentUserManager = permissions?.is_manager || false;

  // Both can edit independently — no ordering enforced
  const canEditMidYearEmployee = isCurrentUserEmployee && isMidYearPeriod;
  const canEditMidYearManager  = isCurrentUserManager  && isMidYearPeriod;
  const canEditEndYearEmployee = isCurrentUserEmployee && isEndYearPeriod;
  const canEditEndYearManager  = isCurrentUserManager  && isEndYearPeriod;

  const SECTIONS = [
    {
      key: 'midYear',
      title: 'Mid-Year Review',
      icon: FileText,
      iconColor: 'bg-orange-500',
      active: isMidYearPeriod,
      employee: {
        comment: midYearEmployee,
        canEdit: canEditMidYearEmployee,
        onSubmit: onSubmitMidYearEmployee,
        placeholder: 'Share your self-assessment, achievements, and challenges so far this year...',
      },
      manager: {
        comment: midYearManager,
        canEdit: canEditMidYearManager,
        onSubmit: onSubmitMidYearManager,
        placeholder: 'Provide your assessment of performance, strengths, and areas for improvement...',
      },
    },
    {
      key: 'endYear',
      title: 'End-Year Review',
      icon: FileText,
      iconColor: 'bg-emerald-600',
      active: isEndYearPeriod,
      employee: {
        comment: endYearEmployee,
        canEdit: canEditEndYearEmployee,
        onSubmit: onSubmitEndYearEmployee,
        placeholder: 'Reflect on the full year — achievements, learnings, and goals for next year...',
      },
      manager: {
        comment: endYearManager,
        canEdit: canEditEndYearManager,
        onSubmit: onSubmitEndYearManager,
        placeholder: 'Provide your final evaluation of performance and development recommendations...',
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Period info banner */}
      {(isMidYearPeriod || isEndYearPeriod) && (
        <div className={`flex items-start gap-3 p-3 rounded-xl border ${
          darkMode
            ? 'bg-sky-900/20 border-sky-800/30'
            : 'bg-sky-50 border-sky-200'
        }`}>
          <MessageSquare className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-sky-300' : 'text-sky-800'}`}>
              {isMidYearPeriod ? 'Mid-Year Review is active' : 'End-Year Review is active'}
            </p>
          
          </div>
        </div>
      )}

      {SECTIONS.map(section => (
        <ReviewSection
          key={section.key}
          section={section}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

// ─── Single Review Section (Mid or End Year) ─────────────────────────────────
function ReviewSection({ section, darkMode }) {
  const Icon = section.icon;

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${
      darkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-5 border-b flex items-center gap-3 ${
        darkMode ? 'border-gray-700/50' : 'border-gray-200'
      }`}>
        <div className={`p-2 rounded-xl ${section.iconColor}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {section.title}
          </h3>
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Employee and manager comments are independent
          </p>
        </div>
        {!section.active && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
            darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            Not active
          </div>
        )}
      </div>

      {/* Two columns — Employee left, Manager right */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700/50">
        <CommentPanel
          role="employee"
          label="Employee"
          icon={User}
          iconColor="text-sky-500"
          {...section.employee}
          darkMode={darkMode}
        />
        <CommentPanel
          role="manager"
          label="Manager"
          icon={UserCheck}
          iconColor="text-purple-500"
          {...section.manager}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

// ─── Comment Panel ────────────────────────────────────────────────────────────
function CommentPanel({ role, label, icon: Icon, iconColor, comment, canEdit, onSubmit, placeholder, darkMode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
      setIsEditing(false);
    } catch {
      // parent handles error toasts
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setText('');
    setIsEditing(false);
  };

  return (
    <div className="p-5 space-y-3">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {label}
          </span>
        </div>

        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              role === 'employee'
                ? 'bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/30'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {comment ? 'Add another' : 'Add comment'}
          </button>
        )}
      </div>

      {/* Existing comment */}
      {comment ? (
        <div className={`p-4 rounded-xl border ${
          darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {comment}
          </p>
        </div>
      ) : (
        !isEditing && (
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-gray-700/20 border-gray-700/30' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No comment yet
              </p>
            </div>
          </div>
        )
      )}

      {/* Input area */}
      {isEditing && (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className={`w-full px-4 py-3 text-sm border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all ${
              role === 'employee'
                ? 'focus:ring-sky-500/30'
                : 'focus:ring-purple-500/30'
            } ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className={`flex-1 h-10 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-40 text-white ${
                role === 'employee'
                  ? 'bg-almet-sapphire hover:bg-almet-cloud-burst'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={handleCancel}
              disabled={submitting}
              className={`h-10 px-4 rounded-xl flex items-center justify-center transition-all ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Not active and no comment */}
      {!canEdit && !comment && !isEditing && (
        <p className={`text-xs italic ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Available during the review period
        </p>
      )}
    </div>
  );
}