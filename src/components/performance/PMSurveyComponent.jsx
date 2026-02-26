import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle, Clock,
  Save, Send, AlertCircle, Loader, MessageSquare,
  Building2, Users, Star, TrendingUp, BookOpen,
  ChevronRight, BarChart2
} from 'lucide-react';

// Icon per section key
const SECTION_ICONS = {
  WORK_ENVIRONMENT: Building2,
  MANAGEMENT:       Users,
  OVERALL:          Star,
  TEAM:             Users,
  DEVELOPMENT:      BookOpen,
  _default:         BarChart2,
};

// Likert label sets
const LIKERT_LABELS = {
  OVERALL:  ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
  _default: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
};

const LIKERT_COLORS = {
  1: { active: '#ef4444', bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  2: { active: '#f97316', bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  3: { active: '#eab308', bg: '#fefce8', border: '#fde68a', text: '#ca8a04' },
  4: { active: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  5: { active: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
};

function getLabels(section) {
  return LIKERT_LABELS[section] || LIKERT_LABELS._default;
}

// ─── Likert Scale ────────────────────────────────────────────────
function LikertScale({ questionId, currentValue, section, disabled, onChange, darkMode }) {
  const labels = getLabels(section);

  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map(v => {
        const selected = currentValue === v;
        const c = LIKERT_COLORS[v];

        return (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(questionId, v)}
            className="flex-1 flex flex-col items-center gap-2 py-2 px-2 rounded-xl border-2 transition-all duration-150"
            style={{
              borderColor: selected ? c.active : (darkMode ? '#374151' : '#e5e7eb'),
              background: selected
                ? (darkMode ? `${c.active}22` : c.bg)
                : (darkMode ? 'transparent' : '#fafafa'),
              cursor: disabled ? 'default' : 'pointer',
              boxShadow: selected ? `0 2px 12px ${c.active}33` : 'none',
            }}
          >
            {/* Number */}
            <span
              className="text-base font-bold"
              style={{ color: selected ? c.active : (darkMode ? '#6b7280' : '#9ca3af') }}
            >
              {v}
            </span>
            {/* Label */}
            <span
              className="text-[10px] font-semibold text-center leading-tight"
              style={{ color: selected ? c.text : (darkMode ? '#4b5563' : '#9ca3af') }}
            >
              {labels[v - 1]}
            </span>
            {/* Selected indicator */}
            {selected && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: c.active }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Question Card ───────────────────────────────────────────────
function QuestionCard({ question, answer, onLikert, onText, disabled, darkMode, idx }) {
  const qId = question.question || question.id;

  return (
    <div className={`rounded-xl border p-6 space-y-5 ${
      darkMode
        ? 'bg-almet-cloud-burst/60 border-almet-comet/30'
        : 'bg-white border-gray-200'
    }`}>
      {/* Question header */}
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
          darkMode
            ? 'bg-almet-sapphire/20 text-almet-sapphire'
            : 'bg-almet-sapphire/10 text-almet-sapphire'
        }`}>
          {idx + 1}
        </div>
        <p className={`text-sm font-semibold leading-relaxed pt-1 ${
          darkMode ? 'text-white' : 'text-almet-cloud-burst'
        }`}>
          {question.question_text}
          {question.is_required && !disabled && (
            <span className="text-red-500 ml-1 font-normal">*</span>
          )}
        </p>
      </div>

      {/* Input */}
      {question.question_type === 'LIKERT_5' ? (
        <LikertScale
          questionId={qId}
          currentValue={answer?.likert_value}
          section={question.section}
          disabled={disabled}
          onChange={onLikert}
          darkMode={darkMode}
        />
      ) : disabled ? (
        <div className={`px-4 py-3 rounded-xl border text-sm leading-relaxed ${
          darkMode
            ? 'bg-almet-san-juan/30 border-almet-comet/30 text-almet-bali-hai'
            : 'bg-gray-50 border-gray-200 text-gray-700'
        }`}>
          {answer?.text_answer || (
            <span className={`italic ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              No answer provided
            </span>
          )}
        </div>
      ) : (
        <textarea
          value={answer?.text_answer || ''}
          onChange={e => onText(qId, e.target.value)}
          rows={4}
          placeholder="Write your response here..."
          className={`w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 ${
            darkMode
              ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
          }`}
        />
      )}
    </div>
  );
}

// ─── Section Sidebar Nav ─────────────────────────────────────────
function SectionNav({ sections, currentStep, answeredPerSection, isSubmitted, darkMode, onJump }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${
      darkMode ? 'bg-almet-cloud-burst border-almet-comet/30' : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 border-b ${
        darkMode ? 'border-almet-comet/30' : 'border-gray-100'
      }`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${
          darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
        }`}>Sections</p>
      </div>
      <div className="p-2 space-y-1">
        {sections.map((sec, i) => {
          const Icon = SECTION_ICONS[sec.section] || SECTION_ICONS._default;
          const isActive = i === currentStep;
          const isDone = isSubmitted || answeredPerSection[i];

          return (
            <button
              key={sec.section}
              type="button"
              onClick={() => onJump(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                isActive
                  ? darkMode
                    ? 'bg-almet-sapphire/20 text-almet-sapphire'
                    : 'bg-almet-sapphire/10 text-almet-sapphire'
                  : darkMode
                    ? 'text-almet-bali-hai hover:bg-almet-san-juan/30'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold flex-1 truncate">{sec.display}</span>
              {isDone && !isActive && (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              )}
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function PMSurveyComponent({
  surveyData,
  questionsData,
  onSaveAnswers,
  onSubmit,
  onBack,
  loading,
  darkMode,
}) {
  const [answers, setAnswers]         = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving]           = useState(false);
  const [hasChanges, setHasChanges]   = useState(false);

  const isSubmitted = surveyData?.status === 'SUBMITTED';

  useEffect(() => {
    if (surveyData?.answers?.length) {
      const init = {};
      surveyData.answers.forEach(a => {
        init[a.question] = {
          likert_value: a.likert_value ?? null,
          text_answer:  a.text_answer  || '',
        };
      });
      setAnswers(init);
    }
  }, [surveyData?.id]);

  const sections = (() => {
    if (questionsData?.length) {
      return questionsData.map(sec => ({
        section:  sec.section,
        display:  sec.section_display,
        questions: sec.questions.map(q => ({ ...q, section: q.section || sec.section })),
      }));
    }
    if (surveyData?.answers?.length) {
      const grouped = {};
      surveyData.answers.forEach(a => {
        if (!grouped[a.section])
          grouped[a.section] = { section: a.section, display: a.section_display, questions: [] };
        grouped[a.section].questions.push(a);
      });
      return Object.values(grouped);
    }
    return [];
  })();

  const totalSteps      = sections.length;
  const currentSection  = sections[currentStep];

  const answeredPerSection = sections.map(sec =>
    sec.questions
      .filter(q => q.question_type === 'LIKERT_5')
      .every(q => answers[q.question || q.id]?.likert_value != null)
  );

  const allRequiredAnswered = sections.every(sec =>
    sec.questions.filter(q => q.is_required).every(q => {
      const a = answers[q.question || q.id];
      return q.question_type === 'LIKERT_5'
        ? a?.likert_value != null
        : (a?.text_answer || '').trim().length > 0;
    })
  );

  const totalLikert   = sections.reduce((s, sec) => s + sec.questions.filter(q => q.question_type === 'LIKERT_5').length, 0);
  const answeredLikert = Object.values(answers).filter(a => a.likert_value != null).length;
  const completionPct  = totalLikert > 0 ? Math.round((answeredLikert / totalLikert) * 100) : 0;

  const handleLikert = (qId, val) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], likert_value: val } }));
    setHasChanges(true);
  };
  const handleText = (qId, val) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], text_answer: val } }));
    setHasChanges(true);
  };

  const buildPayload = () =>
    Object.entries(answers)
      .map(([qId, a]) => ({
        question:      qId,
        likert_value:  a.likert_value ?? null,
        text_answer:   a.text_answer  || '',
      }))
      .filter(a => a.likert_value != null || a.text_answer);

  const handleSave = async () => {
    setSaving(true);
    try { await onSaveAnswers(buildPayload()); setHasChanges(false); }
    finally { setSaving(false); }
  };

  const handleNext = async () => {
    if (hasChanges) await handleSave();
    setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
  };
  const handleStepBack = async () => {
    if (hasChanges) await handleSave();
    setCurrentStep(s => Math.max(s - 1, 0));
  };
  const handleJump = async (i) => {
    if (hasChanges) await handleSave();
    setCurrentStep(i);
  };
  const handleSubmit = async () => {
    const payload = buildPayload();
    if (payload.length) await onSaveAnswers(payload);
    await onSubmit();
  };

  if (!sections.length && !loading) {
    return (
      <div className={`rounded-xl border p-16 text-center ${
        darkMode ? 'bg-almet-cloud-burst border-almet-comet/30' : 'bg-white border-gray-200'
      }`}>
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
          No survey questions available.
        </p>
        <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-almet-sapphire text-white rounded-xl text-sm font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const SectionIcon = currentSection ? (SECTION_ICONS[currentSection.section] || SECTION_ICONS._default) : BarChart2;

  return (
    <div className="space-y-4">

      {/* ── Page header ── */}
      <div className={`rounded-xl border p-4 ${
        darkMode ? 'bg-almet-cloud-burst border-almet-comet/30' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-xl transition-colors ${
                darkMode ? 'hover:bg-almet-san-juan text-almet-bali-hai' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Performance Management Survey
              </h2>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                {surveyData?.employee_name} · {surveyData?.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
              darkMode ? 'bg-almet-san-juan/30' : 'bg-gray-50'
            }`}>
              <div className="w-28 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSubmitted ? 'bg-emerald-500' : 'bg-almet-sapphire'
                  }`}
                  style={{ width: isSubmitted ? '100%' : `${completionPct}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                {isSubmitted ? '100%' : `${completionPct}%`}
              </span>
            </div>

            {/* Status */}
            {isSubmitted ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Submitted</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Draft</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Read-only notice ── */}
      {isSubmitted && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium ${
          darkMode
            ? 'bg-emerald-900/20 border border-emerald-800/30 text-emerald-400'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          You submitted this survey on {surveyData?.submitted_at
            ? new Date(surveyData.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : '—'
          }. Responses are read-only.
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-[220px_1fr] gap-4 items-start">

        {/* Sidebar nav */}
        <SectionNav
          sections={sections}
          currentStep={currentStep}
          answeredPerSection={answeredPerSection}
          isSubmitted={isSubmitted}
          darkMode={darkMode}
          onJump={handleJump}
        />

        {/* Main content */}
        <div className={`rounded-xl border overflow-hidden ${
          darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-gray-200'
        }`}>
          {/* Section header */}
          {currentSection && (
            <>
              <div className={`p-5 border-b ${darkMode ? 'border-almet-comet/30' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    darkMode ? 'bg-almet-sapphire/20' : 'bg-almet-sapphire/10'
                  }`}>
                    <SectionIcon className="w-5 h-5 text-almet-sapphire" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                      {currentSection.display}
                    </h3>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                      Section {currentStep + 1} of {totalSteps} · {currentSection.questions.length} question{currentSection.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className={`p-5 space-y-4 ${darkMode ? 'bg-almet-san-juan/10' : 'bg-gray-50/50'}`}>
                {currentSection.questions.map((q, idx) => {
                  const qId = q.question || q.id;
                  return (
                    <QuestionCard
                      key={qId}
                      question={q}
                      answer={answers[qId]}
                      onLikert={handleLikert}
                      onText={handleText}
                      disabled={isSubmitted}
                      darkMode={darkMode}
                      idx={idx}
                    />
                  );
                })}
              </div>

              {/* Footer nav */}
              <div className={`p-5 border-t flex items-center justify-between ${
                darkMode ? 'border-almet-comet/30' : 'border-gray-100'
              }`}>
                <button
                  type="button"
                  onClick={handleStepBack}
                  disabled={currentStep === 0 || loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 ${
                    darkMode
                      ? 'bg-almet-comet/40 text-almet-bali-hai hover:bg-almet-comet/60'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {!isSubmitted && hasChanges && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || loading}
                      className={`flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium transition-all ${
                        darkMode
                          ? 'bg-almet-comet/40 text-almet-bali-hai hover:bg-almet-comet/60'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Draft
                    </button>
                  )}

                  {currentStep < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="flex items-center gap-2 h-9 px-5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                      Next Section
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : isSubmitted ? (
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex items-center gap-2 h-9 px-5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                      Back to Dashboard
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit Survey
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Required warning */}
      {!isSubmitted && currentStep === totalSteps - 1 && !allRequiredAnswered && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium ${
          darkMode
            ? 'bg-amber-900/20 border border-amber-800/30 text-amber-400'
            : 'bg-amber-50 border border-amber-200 text-amber-700'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Please answer all required questions before submitting.
        </div>
      )}
    </div>
  );
}