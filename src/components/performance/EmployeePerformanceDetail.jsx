"use client";
import { useState, useEffect, memo, useMemo } from 'react';
import {
  ArrowLeft, Download, Star, Award, Target, FileText, BookOpen,
  CheckCircle, Clock, AlertCircle, TrendingUp, Zap
} from 'lucide-react';
import ObjectivesSection from './ObjectivesSection';
import CompetenciesSection from './CompetenciesSection';
import PerformanceReviews from './PerformanceReviews';
import DevelopmentNeeds from './DevelopmentNeeds';
import ClarificationComments from './ClarificationComments';
import { usePersistentState } from '@/hooks/usePersistentState';

/* ── Score progress bar ─────────────────────────────────────────────── */
const ScoreBar = memo(({ label, pct, grade, color }) => {
  const barColor = {
    blue:   'bg-almet-sapphire',
    purple: 'bg-purple-500',
    green:  'bg-emerald-500',
  }[color] || 'bg-almet-sapphire';

  const textColor = {
    blue:   'text-almet-sapphire',
    purple: 'text-purple-500',
    green:  'text-emerald-500',
  }[color] || 'text-almet-sapphire';

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <div className="flex items-center gap-1.5">
          {grade && grade !== 'N/A' && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${textColor} bg-current/10`} style={{backgroundColor: 'transparent'}}>
              <span className={textColor}>{grade}</span>
            </span>
          )}
          <span className={`text-sm font-bold ${textColor}`}>{pct > 0 ? `${pct.toFixed(1)}%` : '—'}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
});
ScoreBar.displayName = 'ScoreBar';

/* ── Tab button ─────────────────────────────────────────────────────── */
const TabButton = memo(({ tab, isActive, onClick, darkMode }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-semibold flex-1 justify-center ${
        isActive
          ? 'bg-almet-sapphire text-white shadow-sm'
          : darkMode
            ? 'text-almet-bali-hai hover:text-white hover:bg-almet-san-juan/60'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline truncate">{tab.label}</span>
      <span className={`text-xs font-bold rounded-md px-1.5 py-0.5 ml-auto flex-shrink-0 ${
        isActive
          ? 'bg-white/20 text-white'
          : darkMode ? 'bg-almet-comet/40 text-almet-bali-hai' : 'bg-gray-200 text-gray-600'
      }`}>
        {tab.badge}
      </span>
      {tab.status === 'completed' && (
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
      )}
      {tab.status === 'inprogress' && (
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
      )}
    </button>
  );
});
TabButton.displayName = 'TabButton';

/* ── Main component ─────────────────────────────────────────────────── */
export default function EmployeePerformanceDetail({
  employee,
  performanceData,
  settings,
  onSaveEndYearObjectivesDraft,
  onSubmitEndYearObjectives,
  currentPeriod,
  activeYear,
  permissions,
  onAddObjectiveComment,
  onDeleteObjectiveComment,
  loading,
  darkMode,
  onBack,
  onCancelObjective,
  onExport,
  onUpdateObjective,
  onAddObjective,
  onDeleteObjective,
  onSaveObjectivesDraft,
  onSubmitObjectives,
  onUpdateCompetency,
  onSaveCompetenciesDraft,
  onSubmitCompetencies,
  onSubmitMidYearEmployee,
  onSubmitMidYearManager,
  onUpdateDevelopmentNeed,
  onAddDevelopmentNeed,
  onDeleteDevelopmentNeed,
  onSaveDevelopmentNeedsDraft,
  onSubmitEndYearEmployee,
  onSubmitEndYearManager,
  onTakePMSurvey,
  onCompleteEndYear,
}) {
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';
  const [activeTab, setActiveTab] = usePersistentState('perf_detail_tab', 'objectives');
  useEffect(() => { localStorage.setItem('performance_detail_tab', activeTab); }, [activeTab]);

  const canEdit = permissions.is_admin ||
    (permissions.employee && employee.line_manager === permissions.employee.name);

  const fmt = (v, d = 2) => { const n = parseFloat(v); return isNaN(n) ? '0.00' : n.toFixed(d); };

  const getGrade = (pct) => {
    if (!settings.evaluationScale?.length) return 'N/A';
    const n = parseFloat(pct) || 0;
    const s = settings.evaluationScale.find(x => n >= parseFloat(x.range_min) && n <= parseFloat(x.range_max));
    return s ? s.name : 'N/A';
  };

  const objPct   = parseFloat(performanceData.objectives_percentage)         || 0;
  const compPct  = parseFloat(performanceData.competencies_percentage)        || 0;
  const overall  = parseFloat(performanceData.overall_weighted_percentage)    || 0;
  const objGrade = performanceData.objectives_letter_grade  || getGrade(objPct);
  const compGrade= performanceData.competencies_letter_grade|| getGrade(compPct);
  const finalRating = performanceData.final_rating          || getGrade(overall);
  const totalWeight  = (performanceData.objectives || []).reduce((s, o) => s + (parseFloat(o.weight) || 0), 0);
  const isCompleted  = objPct > 0 && compPct > 0;
  const isEndYearDone = !!performanceData.end_year_completed;

  const tabs = useMemo(() => [
    {
      id: 'objectives', label: 'Objectives', icon: Target,
      badge: performanceData.objectives?.length || 0,
      status: performanceData.objectives_manager_approved ? 'completed' : 'pending',
    },
    {
      id: 'competencies', label: 'Competencies', icon: Award,
      badge: performanceData.competency_ratings?.length || 0,
      status: performanceData.competencies_submitted ? 'completed' : 'pending',
    },
    {
      id: 'reviews', label: 'Reviews', icon: FileText,
      badge: [performanceData.mid_year_completed, performanceData.end_year_completed].filter(Boolean).length,
      status: performanceData.end_year_completed ? 'completed' : performanceData.mid_year_completed ? 'inprogress' : 'pending',
    },
    {
      id: 'development', label: 'Development', icon: BookOpen,
      badge: performanceData.development_needs?.length || 0,
      status: performanceData.development_needs_submitted ? 'completed' : 'pending',
    },
  ], [performanceData]);

  /* overall color */
  const overallColor = overall >= 70 ? 'text-emerald-500' : overall >= 50 ? 'text-amber-500' : overall > 0 ? 'text-red-500' : 'text-gray-400';
  const overallBg    = overall >= 70 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30' :
                       overall >= 50 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30' :
                       overall > 0   ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30' :
                                       'bg-almet-sapphire/5 border-almet-sapphire/20';

  return (
    <div className="space-y-3">

      {/* ── Employee header card ────────────────────────────────────── */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
        {/* Color accent */}
        <div className={`h-1 ${isEndYearDone ? 'bg-emerald-500' : isCompleted ? 'bg-almet-sapphire' : 'bg-amber-500'}`} />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* Left: back + avatar + info */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className={`p-2 rounded-xl flex-shrink-0 transition-colors ${darkMode ? 'hover:bg-almet-san-juan' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>

              <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center text-base font-bold flex-shrink-0 shadow-sm ${
                isEndYearDone
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-almet-sapphire to-almet-astral'
              }`}>
                {(employee.name || '?').charAt(0)}
              </div>

              <div className="min-w-0">
                <h2 className={`text-base font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{employee.name}</h2>
                <p className={`text-xs truncate ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                  {[employee.job_title, employee.position, employee.employee_id].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {/* Right: overall score + export */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isCompleted ? (
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${overallBg}`}>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Overall</p>
                    <p className={`text-xl font-bold leading-none ${overallColor}`}>{fmt(overall, 1)}%</p>
                  </div>
                  {finalRating && finalRating !== 'N/A' && (
                    <div className={`text-2xl font-black ${overallColor}`}>{finalRating}</div>
                  )}
                </div>
              ) : (
                <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
                  darkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-200'
                }`}>
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">In Progress</p>
                    <p className="text-[10px] text-amber-500">{objPct === 0 ? 'Add objectives' : 'Add competencies'}</p>
                  </div>
                </div>
              )}

              {canEdit && isCompleted && (
                <button
                  onClick={onExport}
                  disabled={loading}
                  className="h-9 px-3 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              )}
            </div>
          </div>

          {/* Score bars */}
          {(objPct > 0 || compPct > 0) && (
            <div className={`flex items-end gap-4 mt-4 pt-4 border-t ${darkMode ? 'border-almet-comet/30' : 'border-gray-100'}`}>
              <ScoreBar label="Objectives"   pct={objPct}  grade={objGrade}  color="blue" />
              <ScoreBar label="Competencies" pct={compPct} grade={compGrade} color="purple" />
              {overall > 0 && (
                <ScoreBar label="Overall" pct={overall} grade={finalRating} color="green" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Complete end-year banner ────────────────────────────────── */}
      {canEdit && isEndYearPeriod && !isEndYearDone && (
        <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${
          darkMode ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Ready to Complete</p>
              <p className={`text-xs ${darkMode ? 'text-emerald-400/80' : 'text-emerald-600'}`}>
                All reviews submitted. Finalize this performance cycle.
              </p>
            </div>
          </div>
          <button
            onClick={() => onCompleteEndYear(performanceData.id)}
            disabled={loading}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm flex-shrink-0"
          >
            <CheckCircle className="w-4 h-4" />
            Complete
          </button>
        </div>
      )}

      {/* ── Metric cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          icon={Target} title="Objectives"
          value={fmt(performanceData.total_objectives_score || 0)}
          subtitle={`${fmt(objPct, 1)}% · ${objGrade}`}
          color="blue" darkMode={darkMode}
        />
        <MetricCard
          icon={Award} title="Competencies"
          value={`${performanceData.total_competencies_actual_score || 0}/${performanceData.total_competencies_required_score || 0}`}
          subtitle={`${fmt(compPct, 1)}% · ${compGrade}`}
          color="purple" darkMode={darkMode}
        />
        <MetricCard
          icon={Zap} title="Weight Split"
          value={`${performanceData.objectives_weight || 0}% / ${performanceData.competencies_weight || 0}%`}
          subtitle="Objectives / Competencies"
          color="amber" darkMode={darkMode}
        />
      </div>

      {/* ── Evaluation scale ────────────────────────────────────────── */}
      <EvaluationScaleReference scales={settings.evaluationScale} darkMode={darkMode} />

      {/* ── Clarification comments ──────────────────────────────────── */}
      {performanceData.clarification_comments?.length > 0 && (
        <ClarificationComments comments={performanceData.clarification_comments} darkMode={darkMode} />
      )}

      {/* ── Tab navigation ──────────────────────────────────────────── */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-1.5`}>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={setActiveTab}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div className="min-h-[500px]">
        {activeTab === 'objectives' && (
          <ObjectivesSection
            objectives={performanceData.objectives || []}
            settings={settings}
            currentPeriod={currentPeriod}
            activeYear={activeYear}
            canEdit={canEdit}
            loading={loading}
            darkMode={darkMode}
            onAddObjectiveComment={onAddObjectiveComment}
            onDeleteObjectiveComment={onDeleteObjectiveComment}
            onSaveEndYearObjectivesDraft={onSaveEndYearObjectivesDraft}
            onSubmitEndYearObjectives={onSubmitEndYearObjectives}
            totalWeight={totalWeight}
            totalScore={performanceData.total_objectives_score}
            percentage={performanceData.objectives_percentage}
            targetScore={settings.evaluationTargets?.objective_score_target}
            performanceData={performanceData}
            onUpdate={onUpdateObjective}
            onAdd={onAddObjective}
            onDelete={onDeleteObjective}
            onSaveDraft={onSaveObjectivesDraft}
            onSubmit={onSubmitObjectives}
            onCancelObjective={onCancelObjective}
          />
        )}

        {activeTab === 'competencies' && (
          <CompetenciesSection
            competencies={performanceData.competency_ratings || []}
            groupScores={performanceData.group_competency_scores}
            settings={settings}
            currentPeriod={currentPeriod}
            canEdit={canEdit}
            loading={loading}
            performanceData={performanceData}
            darkMode={darkMode}
            totalRequired={performanceData.total_competencies_required_score}
            totalActual={performanceData.total_competencies_actual_score}
            percentage={performanceData.competencies_percentage}
            letterGrade={performanceData.competencies_letter_grade}
            onUpdate={onUpdateCompetency}
            onSaveDraft={onSaveCompetenciesDraft}
            onSubmit={onSubmitCompetencies}
            isLeadershipAssessment={performanceData.is_leadership_assessment || false}
          />
        )}

        {activeTab === 'reviews' && (
          <PerformanceReviews
            midYearEmployee={performanceData.mid_year_employee_comment}
            midYearManager={performanceData.mid_year_manager_comment}
            endYearEmployee={performanceData.end_year_employee_comment}
            endYearManager={performanceData.end_year_manager_comment}
            currentPeriod={currentPeriod}
            performanceData={{
              ...performanceData,
              employee_data: {
                line_manager_hc: employee.line_manager_hc || null,
                line_manager_name: employee.line_manager || null,
              },
            }}
            permissions={permissions}
            onSubmitMidYearEmployee={onSubmitMidYearEmployee}
            onSubmitMidYearManager={onSubmitMidYearManager}
            onSubmitEndYearEmployee={onSubmitEndYearEmployee}
            onSubmitEndYearManager={onSubmitEndYearManager}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'development' && (
          <DevelopmentNeeds
            developmentNeeds={performanceData.development_needs || []}
            competencies={performanceData.competency_ratings || []}
            canEdit={canEdit}
            loading={loading}
            darkMode={darkMode}
            onUpdate={onUpdateDevelopmentNeed}
            onAdd={onAddDevelopmentNeed}
            onDelete={onDeleteDevelopmentNeed}
            onSaveDraft={onSaveDevelopmentNeedsDraft}
          />
        )}
      </div>
    </div>
  );
}

/* ── MetricCard ─────────────────────────────────────────────────────── */
const MetricCard = memo(({ icon: Icon, title, value, subtitle, color, darkMode }) => {
  const gradients = {
    blue:   'from-almet-sapphire to-almet-astral',
    purple: 'from-purple-500 to-purple-700',
    amber:  'from-amber-500 to-orange-600',
  };
  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-3 hover:shadow-sm transition-shadow`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradients[color] || gradients.blue} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className={`text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>{title}</span>
      </div>
      <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'} leading-tight mb-0.5`}>{value}</p>
      <p className={`text-xs ${darkMode ? 'text-almet-bali-hai/70' : 'text-gray-400'}`}>{subtitle}</p>
    </div>
  );
});
MetricCard.displayName = 'MetricCard';

/* ── EvaluationScaleReference ───────────────────────────────────────── */
function EvaluationScaleReference({ scales, darkMode }) {
  const [selected, setSelected] = useState(null);
  if (!scales?.length) return null;

  return (
    <details className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden group`}>
      <summary className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${darkMode ? 'hover:bg-almet-san-juan/30' : 'hover:bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-almet-sapphire" />
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Evaluation Scale Reference
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-almet-comet/50 text-almet-bali-hai' : 'bg-gray-100 text-gray-500'}`}>
            {scales.length} grades
          </span>
        </div>
        <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className={`p-4 border-t ${darkMode ? 'border-almet-comet/30' : 'border-gray-100'}`}>
        <div className="grid grid-cols-5 gap-2">
          {scales.map(scale => {
            const isSel = selected?.id === scale.id;
            return (
              <button
                key={scale.id}
                onClick={() => setSelected(isSel ? null : scale)}
                className={`rounded-xl p-2.5 text-center transition-all ${
                  isSel
                    ? 'ring-2 ring-almet-sapphire bg-almet-sapphire/10'
                    : darkMode ? 'bg-almet-san-juan/50 hover:bg-almet-san-juan' : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <div className="text-sm font-black text-almet-sapphire">{scale.name}</div>
                <div className={`text-xs font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {scale.value}
                </div>
                <div className={`text-[10px] mt-0.5 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`}>
                  {scale.range_min}–{scale.range_max}%
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className={`mt-3 p-3 rounded-xl border ${
            darkMode ? 'bg-almet-sapphire/10 border-almet-sapphire/30' : 'bg-almet-sapphire/5 border-almet-sapphire/20'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-almet-sapphire">{selected.name}</span>
              <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                ({selected.range_min}–{selected.range_max}%)
              </span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
              {selected.description || 'No description available.'}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}
