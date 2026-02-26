import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Star, TrendingUp, Award, Target, FileText, BookOpen, CheckCircle, Clock } from 'lucide-react';
import ObjectivesSection from './ObjectivesSection';
import CompetenciesSection from './CompetenciesSection';
import PerformanceReviews from './PerformanceReviews';
import DevelopmentNeeds from './DevelopmentNeeds';
import ClarificationComments from './ClarificationComments';
import { useToast } from '@/components/common/Toast';

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
}) {
  const { showInfo } = useToast();
  
  // ✅ Load saved detail tab from localStorage
  const getSavedDetailTab = () => {
    if (typeof window === 'undefined') return 'objectives';
    const saved = localStorage.getItem('performance_detail_tab');
    return saved || 'objectives';
  };

  const [activeTab, setActiveTab] = useState(getSavedDetailTab);

  // ✅ Save tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('performance_detail_tab', activeTab);
  }, [activeTab]);

  const canEdit = permissions.is_admin || 
    (permissions.employee && employee.line_manager === permissions.employee.name);


  const calculateTotalWeight = (objectives) => {
    return objectives?.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0) || 0;
  };

  const totalWeight = calculateTotalWeight(performanceData.objectives);
  
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  const getLetterGradeFromScale = (percentage) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
      return 'N/A';
    }
    
    const numPercentage = parseFloat(percentage) || 0;
    
    const matchingScale = settings.evaluationScale.find(scale => 
      numPercentage >= parseFloat(scale.range_min) && 
      numPercentage <= parseFloat(scale.range_max)
    );
    
    return matchingScale ? matchingScale.name : 'N/A';
  };

  const objectivesPercentage = parseFloat(performanceData.objectives_percentage) || 0;
  const competenciesPercentage = parseFloat(performanceData.competencies_percentage) || 0;
  const overallPercentage = parseFloat(performanceData.overall_weighted_percentage) || 0;
  
  const objectivesGrade = performanceData.objectives_letter_grade || 
                          getLetterGradeFromScale(objectivesPercentage);
  
  const competenciesGrade = performanceData.competencies_letter_grade || 
                            getLetterGradeFromScale(competenciesPercentage);
  
  const finalRating = performanceData.final_rating || 
                      getLetterGradeFromScale(overallPercentage);

  const isCompleted = !isNaN(objectivesPercentage) && objectivesPercentage > 0 && 
                      !isNaN(competenciesPercentage) && competenciesPercentage > 0;

  const tabs = [
    {
      id: 'objectives',
      label: 'Objectives',
      icon: Target,
      badge: performanceData.objectives?.length || 0,
      status: performanceData.objectives_manager_approved ? 'completed' : 'pending'
    },
    {
      id: 'competencies',
      label: 'Competencies',
      icon: Award,
      badge: performanceData.competency_ratings?.length || 0,
      status: performanceData.competencies_submitted ? 'completed' : 'pending'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: FileText,
      badge: [
        performanceData.mid_year_completed,
        performanceData.end_year_completed
      ].filter(Boolean).length,
      status: performanceData.end_year_completed ? 'completed' : 
              performanceData.mid_year_completed ? 'inprogress' : 'pending'
    },
    {
      id: 'development',
      label: 'Development',
      icon: BookOpen,
      badge: performanceData.development_needs?.length || 0,
      status: performanceData.development_needs_submitted ? 'completed' : 'pending'
    }
  ];

  const TabButton = ({ tab }) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;
    
    return (
      <button
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isActive 
            ? darkMode 
              ? 'bg-almet-sapphire text-white shadow-lg' 
              : 'bg-almet-sapphire text-white shadow-lg'
            : darkMode
              ? 'bg-almet-san-juan/30 text-almet-bali-hai hover:bg-almet-san-juan/50'
              : 'bg-almet-mystic text-almet-waterloo hover:bg-almet-mystic/80'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
        <span className="font-semibold text-sm">{tab.label}</span>
        
        <div className={`ml-auto flex items-center gap-2`}>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
            isActive
              ? 'bg-white/20 text-white'
              : darkMode
                ? 'bg-almet-comet/30 text-almet-bali-hai'
                : 'bg-white text-almet-waterloo'
          }`}>
            {tab.badge}
          </span>
          
          {tab.status === 'completed' && (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          )}
          {tab.status === 'inprogress' && (
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Employee Header */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl p-4 shadow-sm border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-almet-san-juan' : 'hover:bg-almet-mystic'}`}
            >
              <ArrowLeft className="w-5 h-5 text-almet-waterloo dark:text-almet-bali-hai" />
            </button>
            
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-base font-bold">
              {employee.name.charAt(0)}
            </div>
            
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {employee.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                <span>{employee.position}</span>
                <span>•</span>
                <span>{employee.department}</span>
                <span>•</span>
                <span className="font-mono">{employee.employee_id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-almet-sapphire/20 border border-almet-sapphire/30' : 'bg-almet-sapphire/10 border border-almet-sapphire/20'}`}>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Overall</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-almet-sapphire">{formatNumber(overallPercentage, 1)}%</span>
                <span className="text-sm font-semibold text-almet-sapphire">{finalRating}</span>
              </div>
            </div>

            {isCompleted ? (
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                darkMode 
                  ? 'bg-emerald-900/30 border border-emerald-800/30' 
                  : 'bg-emerald-50 border border-emerald-200'
              }`}>
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Completed
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-500">
                    Ready for export
                  </div>
                </div>
              </div>
            ) : (
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                darkMode 
                  ? 'bg-amber-900/20 border border-amber-800/30' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    In Progress
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-500">
                    {objectivesPercentage === 0 ? 'Add objectives' : 'Add competencies'}
                  </div>
                </div>
              </div>
            )}
            
            {canEdit && isCompleted && (
              <button
                onClick={onExport}
                disabled={loading}
                className="h-10 px-4 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mini Performance Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          icon={Target}
          title="Objectives"
          value={formatNumber(performanceData.total_objectives_score || 0)}
          subtitle={`${formatNumber(objectivesPercentage, 1)}% • ${objectivesGrade}`}
          color="blue"
          darkMode={darkMode}
        />
        <MetricCard
          icon={Award}
          title="Competencies"
          value={`${performanceData.total_competencies_actual_score || 0}/${performanceData.total_competencies_required_score || 0}`}
          subtitle={`${formatNumber(competenciesPercentage, 1)}% • ${competenciesGrade}`}
          color="purple"
          darkMode={darkMode}
        />
        <MetricCard
          icon={Star}
          title="Weights"
          value={`${performanceData.objectives_weight}% / ${performanceData.competencies_weight}%`}
          subtitle="Obj / Comp"
          color="amber"
          darkMode={darkMode}
        />
      </div>

      {/* Evaluation Scale Reference */}
      <EvaluationScaleReference scales={settings.evaluationScale} darkMode={darkMode} />

      {/* Clarification Comments */}
      {performanceData.clarification_comments && performanceData.clarification_comments.length > 0 && (
        <ClarificationComments 
          comments={performanceData.clarification_comments}
          darkMode={darkMode}
        />
      )}

      {/* Tab Navigation */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border shadow-sm p-3`}>
        <div className="grid grid-cols-4 gap-2">
          {tabs.map(tab => (
            <TabButton key={tab.id} tab={tab} />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
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
        line_manager_name: employee.line_manager || null
      }
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

function MetricCard({ icon: Icon, title, value, subtitle, color, darkMode }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600'
  };

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border p-3`}>
      <div className='flex items-center gap-4'>
<div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-xs font-medium text-almet-waterloo dark:text-almet-bali-hai mb-1">{title}</h3>
      </div>
      
      
      <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} mb-0.5`}>{value}</p>
      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{subtitle}</p>
    </div>
  );
}

function EvaluationScaleReference({ scales, darkMode }) {
  if (!scales || scales.length === 0) {
    return null;
  }

  return (
    <details className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border overflow-hidden group`}>
      <summary className="p-3 cursor-pointer flex items-center justify-between hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-colors">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-almet-sapphire" />
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            Evaluation Scale Reference
          </h3>
        </div>
        <svg className="w-4 h-4 text-almet-waterloo transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      
      <div className={`p-3 border-t ${darkMode ? 'border-almet-comet' : 'border-almet-mystic'}`}>
        <div className="grid grid-cols-5 gap-2">
          {scales.map((scale) => (
            <div key={scale.id} className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2 text-center`}>
              <div className="text-sm font-bold text-almet-sapphire mb-1">{scale.name}</div>
              <div className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} mb-0.5`}>
                Value: {scale.value}
              </div>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                {scale.range_min}-{scale.range_max}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}