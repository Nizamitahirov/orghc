import { useState, memo, useCallback } from 'react';
import { Target, Plus, Trash2, Save, Send, AlertCircle, CheckCircle, XCircle, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
// ✅ CRITICAL: Memoize ObjectiveRow to prevent unnecessary re-renders
const ObjectiveRow = memo(({ 
  objective, 
  index, 
  isExpanded,
  canEditGoals,
  canCancelGoals,
  canRateEndYear,
  settings,
  darkMode,
  onToggle,
  onUpdate,
  onDelete,
  onAddComment,
  onDeleteComment,
  onCancelObjective 
}) => {
  const isCancelled = objective.is_cancelled || false;
  const isTitleMissing = !objective.title?.trim();
  const isStatusMissing = !objective.status;
  const isWeightMissing = !objective.weight || objective.weight <= 0;
 const [newComment, setNewComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  
  // ... existing code ...
  
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(objective.id, newComment);
    setNewComment('');
    setShowCommentBox(false);
  };
  const selectedRating = objective.end_year_rating 
    ? settings.evaluationScale?.find(s => s.id === objective.end_year_rating)
    : null;

  const selectedStatus = settings.statusTypes?.find(s => s.id === objective.status);

  const inputClass = `h-10 px-3 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 transition-all ${
    darkMode 
      ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50' 
      : 'bg-white border-almet-bali-hai/20 text-almet-cloud-burst placeholder-almet-waterloo/50'
  } disabled:opacity-40`;

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  return (
    <div className={`border-b ${darkMode ? 'border-almet-comet/20' : 'border-almet-mystic'} ${isCancelled ? 'opacity-50' : ''}`}>
      <div className={`p-4 ${darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'} transition-colors`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isCancelled 
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
              : 'bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-sapphire/20'
          }`}>
            {isCancelled ? <XCircle className="w-5 h-5" /> : index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                {canEditGoals && !isCancelled && isExpanded ? (
                  <input
                    type="text"
                    value={objective.title || ''}
                    onInput={(e) => {
                      onUpdate(index, 'title', e.target.value);
                    }}
                    className={`${inputClass} w-full font-medium ${isTitleMissing ? 'border-red-500' : ''}`}
                    placeholder="Enter objective title..."
                  />
                ) : (
                  <>
                    <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} ${isExpanded ? '' : 'line-clamp-1'}`}>
                      {objective.title || 'Untitled Objective'}
                    </h4>
                    {!isExpanded && (
                      <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} line-clamp-2`}>
                        {objective.description || 'No description provided'}
                      </p>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => onToggle(index)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-almet-comet/30' : 'hover:bg-gray-100'} transition-colors flex-shrink-0`}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-almet-sapphire" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-almet-waterloo" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50'} rounded-lg p-2.5`}>
                <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1`}>
                  Weight
                </div>
                <div className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  {objective.weight || 0}%
                </div>
              </div>

              <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50'} rounded-lg p-2.5`}>
                <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1`}>
                  Rating
                </div>
                {selectedRating ? (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {selectedRating.name}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                      ({selectedRating.value})
                    </span>
                  </div>
                ) : (
                  <div className={`text-xs ${darkMode ? 'text-almet-bali-hai/70' : 'text-almet-waterloo/70'} italic`}>
                    Not Rated
                  </div>
                )}
              </div>

              <div className={`${darkMode ? 'bg-almet-sapphire/10' : 'bg-almet-sapphire/5'} rounded-lg p-2.5 border ${darkMode ? 'border-almet-sapphire/20' : 'border-almet-sapphire/10'}`}>
                <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1`}>
                  Score
                </div>
                <div className="text-base font-bold text-almet-sapphire">
                  {formatNumber(objective.calculated_score || 0)}
                </div>
              </div>

              <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50'} rounded-lg p-2.5`}>
                <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1`}>
                  Status
                </div>
                <div className={`text-xs font-semibold ${
                  !selectedStatus ? (darkMode ? 'text-almet-bali-hai/70 italic' : 'text-almet-waterloo/70 italic') :
                  selectedStatus.label?.includes('Track') ? 'text-emerald-600 dark:text-emerald-400' :
                  selectedStatus.label?.includes('Risk') ? 'text-amber-600 dark:text-amber-400' :
                  selectedStatus.label?.includes('Complete') ? 'text-blue-600 dark:text-blue-400' :
                  darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'
                }`}>
                  {selectedStatus?.label || 'Not Set'}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className={`mt-4 ${darkMode ? 'bg-almet-san-juan/20 border-almet-comet/30' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 space-y-4`}>
                <div>
                  <h5 className={`text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} uppercase tracking-wide mb-2`}>
                    Description
                  </h5>
                  {canEditGoals && !isCancelled ? (
                    <textarea
                      value={objective.description || ''}
                      onInput={(e) => onUpdate(index, 'description', e.target.value)}
                      rows={4}
                      className={`${inputClass} w-full resize-none py-2 leading-relaxed`}
                      placeholder="Describe the objective in detail..."
                    />
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} leading-relaxed whitespace-pre-wrap`}>
                      {objective.description || 'No description provided'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1.5`}>
                      Weight %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={objective.weight || 0}
                      onInput={(e) => onUpdate(index, 'weight', parseFloat(e.target.value) || 0)}
                      disabled={!canEditGoals || isCancelled}
                      className={`${inputClass} w-full text-center font-semibold ${isWeightMissing && canEditGoals ? 'border-red-500' : ''}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1.5`}>
                      End Year Rating
                    </label>
                    {canRateEndYear && !isCancelled ? (
                    <select
  value={objective.end_year_rating || ''}
  onChange={(e) => { // ✅ Use onChange instead of onInput
    const value = e.target.value ? parseInt(e.target.value) : null;
    
    console.log('🎯 ROW RATING CHANGE:', {
      objectiveId: objective.id,
      objectiveTitle: objective.title?.substring(0, 30),
      index,
      oldRating: objective.end_year_rating,
      newRating: value,
      eventValue: e.target.value
    });
    
    onUpdate(index, 'end_year_rating', value);
  }}
  className={`${inputClass} w-full`}
>
  <option value="">-- Select Rating --</option>
  {settings.evaluationScale?.map(scale => (
    <option key={scale.id} value={scale.id}>
      {scale.name} • {scale.value}
    </option>
  ))}
</select>
                    ) : (
                      <div className={`${inputClass} w-full flex items-center justify-center`}>
                        {selectedRating ? (
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {selectedRating.name} ({selectedRating.value})
                          </span>
                        ) : (
                          <span className="text-xs italic text-almet-waterloo/70 dark:text-almet-bali-hai/70">
                            Not Rated
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1.5`}>
                      Status
                    </label>
                    <select
                      value={objective.status || ''}
                      onInput={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        onUpdate(index, 'status', value);
                      }}
                      disabled={isCancelled}
                      className={`${inputClass} w-full ${isStatusMissing && canEditGoals ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Status</option>
                      {settings.statusTypes?.map(status => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
     <div className="border-t border-gray-200 dark:border-almet-comet/30 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className={`text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} uppercase tracking-wide`}>
                  Comments ({objective.comments?.length || 0})
                </h5>
                <button
                  onClick={() => setShowCommentBox(!showCommentBox)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-almet-sapphire/20 text-almet-sapphire hover:bg-almet-sapphire/30' 
                      : 'bg-almet-sapphire/10 text-almet-sapphire hover:bg-almet-sapphire/20'
                  }`}
                >
                  {showCommentBox ? 'Cancel' : '+ Add Comment'}
                </button>
              </div>
              
              {/* Add Comment Box */}
              {showCommentBox && (
                <div className={`mb-3 p-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-almet-san-juan/30 border-almet-comet/30' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className={`${inputClass} w-full resize-none py-2 leading-relaxed mb-2`}
                    placeholder="Write your comment..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="h-8 px-4 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-xs font-medium disabled:opacity-40 transition-all"
                    >
                      Post Comment
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentBox(false);
                        setNewComment('');
                      }}
                      className={`h-8 px-4 rounded-lg text-xs font-medium transition-colors ${
                        darkMode 
                          ? 'bg-almet-comet/30 text-white hover:bg-almet-comet/50' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Comments List */}
              {objective.comments && objective.comments.length > 0 ? (
                <div className="space-y-2">
                  {objective.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg ${
                        darkMode 
                          ? 'bg-almet-san-juan/20 border border-almet-comet/20' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                            {comment.created_by_name}
                          </span>
                          <span className={`text-xs ml-2 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                            {new Date(comment.created_at).toLocaleString('az-AZ', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        {/* Delete button - only for own comments */}
                        <button
                          onClick={() => {
                            if (confirm('Delete this comment?')) {
                              onDeleteComment(comment.id);
                            }
                          }}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                      
                      <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} whitespace-pre-wrap`}>
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-almet-bali-hai/30' : 'text-almet-waterloo/30'}`} />
                  <p className={`text-xs ${darkMode ? 'text-almet-bali-hai/70' : 'text-almet-waterloo/70'}`}>
                    No comments yet
                  </p>
                </div>
              )}
            </div>
                {(canEditGoals || canCancelGoals) && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-almet-comet/30">
                    {canEditGoals && !isCancelled && (
                      <button
                        onClick={() => onDelete(index)}
                        className="h-9 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                    {canCancelGoals && !isCancelled && objective.id && (
                      <button
                        onClick={() => onCancelObjective(objective.id, 'Cancelled during mid-year review')}
                        className="h-9 px-4 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ SIMPLE: Just check if the objective reference changed
  return prevProps.objective === nextProps.objective &&
         prevProps.isExpanded === nextProps.isExpanded &&
         prevProps.canEditGoals === nextProps.canEditGoals &&
         prevProps.canCancelGoals === nextProps.canCancelGoals &&
         prevProps.canRateEndYear === nextProps.canRateEndYear &&
         prevProps.darkMode === nextProps.darkMode;
});
ObjectiveRow.displayName = 'ObjectiveRow';

export default function ObjectivesSection({
  objectives,
  settings,
  currentPeriod,
  activeYear,
  canEdit,
  loading,
   onAddObjectiveComment,
  onDeleteObjectiveComment,
  darkMode,
  totalWeight,
  totalScore,
  percentage,
  targetScore,
  performanceData,
  onUpdate,
  onAdd,
  onDelete,
  onSaveDraft,
  onSubmit,
  onSaveEndYearObjectivesDraft,
  onSubmitEndYearObjectives,
  onCancelObjective
}) {
  const [expandedRows, setExpandedRows] = useState({});
  
  const activeObjectives = objectives.filter(obj => !obj.is_cancelled);
  const canAddMore = activeObjectives.length < settings.goalLimits?.max && totalWeight < 100;
    const allObjectivesRated = activeObjectives.every(obj => obj.end_year_rating);
  const isValidForSubmit = activeObjectives.length >= settings.goalLimits?.min && 
                          totalWeight === 100 &&
                          activeObjectives.every(obj => 
                            obj.title?.trim() && 
                            obj.status && 
                            obj.weight > 0
                          );

  const isGoalsSubmitted = performanceData?.objectives_employee_submitted || false;
  const isGoalsApproved = performanceData?.objectives_manager_approved || false;
  const isNeedClarification = performanceData?.approval_status === 'NEED_CLARIFICATION';
  
  const isManagerPeriodActive = () => {
    if (!activeYear) return false;
    const today = new Date().toISOString().split('T')[0];
    const managerStart = activeYear.goal_setting_manager_start;
    const managerEnd = activeYear.goal_setting_manager_end;
    return today >= managerStart && today <= managerEnd;
  };
  
  const isEmployeePeriodActive = () => {
    if (!activeYear) return false;
    const today = new Date().toISOString().split('T')[0];
    const employeeStart = activeYear.goal_setting_employee_start;
    const employeeEnd = activeYear.goal_setting_employee_end;
    return today >= employeeStart && today <= employeeEnd;
  };
  
  const isGoalSettingPeriod = currentPeriod === 'GOAL_SETTING';
  const isMidYearPeriod = currentPeriod === 'MID_YEAR_REVIEW';
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';
  
  const isManagerPeriod = isGoalSettingPeriod && isManagerPeriodActive();
  const isEmployeePeriod = isGoalSettingPeriod && isEmployeePeriodActive();
  
  const canEditGoals = canEdit && (
    (isManagerPeriod && (!isGoalsSubmitted || isNeedClarification)) ||
    (!isManagerPeriod && isNeedClarification)
  );
  
  const canSaveDraft = canEditGoals;
  
  const canSubmitGoals = canEdit && isValidForSubmit && (
    (isManagerPeriod && !isGoalsSubmitted) ||
    (!isManagerPeriod && isNeedClarification)
  );
  
  const canCancelGoals = canEdit && isMidYearPeriod;
  const canAddMidYearGoal = canEdit && isMidYearPeriod && canAddMore;
  const canRateEndYear = canEdit && isEndYearPeriod;

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  const getWeightStatus = () => {
    if (totalWeight === 100) return { color: 'emerald', icon: CheckCircle, text: 'Perfect!' };
    if (totalWeight > 100) return { color: 'red', icon: AlertCircle, text: 'Exceeded!' };
    return { color: 'amber', icon: AlertCircle, text: 'Incomplete' };
  };

  const weightStatus = getWeightStatus();

  const getLetterGradeFromScale = (percentage) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0) return 'N/A';
    const matchingScale = settings.evaluationScale.find(scale => 
      percentage >= scale.range_min && percentage <= scale.range_max
    );
    return matchingScale ? matchingScale.name : 'N/A';
  };

  const objectivesGrade = getLetterGradeFromScale(percentage || 0);

  const getValidationMessage = () => {
    if (objectives.length < settings.goalLimits?.min) {
      return `Add ${settings.goalLimits.min - objectives.length} more objective(s)`;
    }
    if (totalWeight !== 100) {
      return 'Total weight must be 100%';
    }
    const missingTitle = objectives.some(obj => !obj.title?.trim());
    const missingStatus = objectives.some(obj => !obj.status);
    const missingWeight = objectives.some(obj => !obj.weight || obj.weight <= 0);
    
    if (missingTitle) return 'All objectives must have a title';
    if (missingStatus) return 'All objectives must have a status';
    if (missingWeight) return 'All objectives must have weight > 0';
    
    return '';
  };
  
  const getPeriodStatusMessage = () => {
    if (!activeYear) return null;
    
    if (isNeedClarification) {
      return {
        type: 'warning',
        message: 'Clarification Requested - Manager can edit and resubmit (even after manager period)',
        icon: MessageSquare
      };
    }
    
    if (isManagerPeriod) {
      if (isGoalsSubmitted) {
        return {
          type: 'info',
          message: `Manager Period Active - Goals submitted, waiting for employee review`,
          icon: Clock
        };
      }
      return {
        type: 'info',
        message: `Manager Period Active (${activeYear.goal_setting_manager_start} to ${activeYear.goal_setting_manager_end})`,
        icon: Clock
      };
    }
    
    if (isEmployeePeriod && isGoalsSubmitted && !isGoalsApproved) {
      return {
        type: 'warning',
        message: `Employee Review Period Active - Waiting for employee approval`,
        icon: Clock
      };
    }
    
    if (isGoalsApproved) {
      return {
        type: 'success',
        message: 'Goals Approved - Goal Setting Complete ✓',
        icon: CheckCircle
      };
    }
    
    if (isGoalSettingPeriod && !isManagerPeriod && !isEmployeePeriod) {
      return {
        type: 'error',
        message: 'Goal setting period has ended',
        icon: XCircle
      };
    }
    
    return null;
  };
  
  const periodStatus = getPeriodStatusMessage();

  const handleToggle = useCallback((index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const handleUpdate = useCallback((index, field, value) => {
  console.log('🔄 SECTION UPDATE:', { 
    index, 
    field, 
    value,
    objectiveId: objectives[index]?.id,
    currentValue: objectives[index]?.[field]
  });
  
  onUpdate(index, field, value);
}, [onUpdate]); // ✅ Remove 'objectives' dependency

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst/60' : 'bg-white'} border ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'} rounded-xl overflow-hidden shadow-sm`}>
      <div className={`p-5 border-b ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-almet-sapphire/10 dark:bg-almet-sapphire/20">
              <Target className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Employee Objectives
              </h3>
              <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mt-0.5`}>
                Min: {settings.goalLimits?.min} • Max: {settings.goalLimits?.max} objectives
              </p>
            </div>
          </div>
          
          {(canEditGoals || canAddMidYearGoal) && (
            <button
              onClick={onAdd}
              disabled={!canAddMore || loading}
              className="h-10 px-4 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {isMidYearPeriod ? 'Add Replacement' : 'Add Objective'}
            </button>
          )}
        </div>

        {periodStatus && (
          <div className={`mb-4 px-4 py-3 rounded-xl border flex items-center gap-3 ${
            periodStatus.type === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30' :
            periodStatus.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30' :
            periodStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30' :
            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
          }`}>
            {periodStatus.icon && <periodStatus.icon className="w-4 h-5 flex-shrink-0" />}
            <span className="text-xs font-medium">{periodStatus.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-3 py-2 rounded-xl flex items-center gap-2 ${
            weightStatus.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30' :
            weightStatus.color === 'red' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30' :
            'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30'
          }`}>
            <weightStatus.icon className="w-4 h-4" />
            <span className="text-xs font-semibold">{totalWeight}% • {weightStatus.text}</span>
          </div>
          
          {isGoalsSubmitted && (
            <div className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Submitted</span>
            </div>
          )}
          
          {isGoalsApproved && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Approved</span>
            </div>
          )}
          
          {isNeedClarification && (
            <div className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30 flex items-center gap-2 animate-pulse">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-semibold">Clarification Requested</span>
            </div>
          )}
        </div>
      </div>

      {objectives.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-16 h-16 mx-auto mb-4 text-almet-waterloo/30" />
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai font-medium mb-1">
            No objectives created yet
          </p>
          {canEditGoals && (
            <p className="text-xs text-almet-waterloo/60 dark:text-almet-bali-hai/60">
              Click "Add Objective" to get started
            </p>
          )}
        </div>
      ) : (
        <div>
          {objectives.map((objective, index) => (
            <ObjectiveRow
              key={objective.id || `temp-${index}`} 
              objective={objective}
              index={index}
                 onAddComment={onAddObjectiveComment}
            onDeleteComment={onDeleteObjectiveComment}
              isExpanded={expandedRows[index] || false}
              canEditGoals={canEditGoals}
              canCancelGoals={canCancelGoals}
              canRateEndYear={canRateEndYear}
              settings={settings}
              darkMode={darkMode}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={onDelete}
              onCancelObjective={onCancelObjective}
            />
          ))}
        </div>
      )}

      {objectives.length > 0 && (
        <div className={`p-5 border-t ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
          <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-almet-sapphire/10 border border-almet-sapphire/20' : 'bg-almet-sapphire/5 border border-almet-sapphire/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Objectives Score Summary
                </h4>
                <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                  Based on weighted calculations
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-almet-sapphire">
                    {formatNumber(totalScore || 0)}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                    / {targetScore || 21}
                  </span>
                </div>
                <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                  {formatNumber(percentage || 0, 1)}% • Grade: <span className="text-almet-sapphire">{objectivesGrade}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {canSaveDraft && (
              <button
                onClick={() => onSaveDraft(objectives)}
                disabled={loading}
                className={`h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  darkMode 
                    ? 'bg-almet-comet/50 hover:bg-almet-comet text-white' 
                    : 'bg-almet-waterloo/10 hover:bg-almet-waterloo/20 text-almet-cloud-burst'
                } disabled:opacity-40`}
              >
                {loading ? <AlertCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
            )}
                 {canRateEndYear && (
              <>
                <button
                  onClick={() => onSaveEndYearObjectivesDraft(objectives)}
                  disabled={loading}
                  className="h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all bg-almet-waterloo/10 hover:bg-almet-waterloo/20 text-almet-cloud-burst dark:bg-almet-comet/50 dark:hover:bg-almet-comet dark:text-white disabled:opacity-40"
                >
                  {loading ? <AlertCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Ratings Draft
                </button>
                
                <button
                  onClick={() => onSubmitEndYearObjectives(objectives)}
                  disabled={!allObjectivesRated || loading}
                  className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit End-Year Ratings
                </button>
                
                {!allObjectivesRated && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl text-xs font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Please rate all objectives before submitting
                  </div>
                )}
              </>
            )}
            {canSubmitGoals && (
              <button
                onClick={() => onSubmit(objectives)}
                disabled={!isValidForSubmit || loading}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                {isNeedClarification ? 'Resubmit for Review' : 'Submit for Employee Review'}
              </button>
            )}
            
            {canSubmitGoals && !isValidForSubmit && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4" />
                {getValidationMessage()}
              </div>
            )}
            
            {isGoalsSubmitted && !isGoalsApproved && !isNeedClarification && isEmployeePeriod && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4" />
                Waiting for employee approval (Employee period active)
              </div>
            )}
            
            {isGoalsApproved && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl text-xs">
                <CheckCircle className="w-4 h-4" />
                Goals approved - Goal setting complete!
              </div>
            )}
            
            {isNeedClarification && (
              <div className={`flex-1 min-w-full p-4 rounded-xl border ${
                darkMode 
                  ? 'bg-amber-900/20 border-amber-800/30 text-amber-400' 
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold mb-1">Clarification Requested</h4>
                    <p className="text-xs opacity-90 mb-2">
                      Employee has requested clarification. You can:
                    </p>
                    <ul className="text-xs space-y-1 ml-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        Edit objectives and save draft
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        Make no changes and resubmit directly
                      </li>
                    </ul>
                    <p className="text-xs mt-2 opacity-75 italic">
                      Note: You can edit even if manager period has ended
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}