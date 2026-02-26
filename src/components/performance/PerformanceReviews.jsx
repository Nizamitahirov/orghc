import { useState, useRef, useEffect } from 'react';
import { FileText, User, UserCheck, Save, X, Send, MessageSquare, AlertCircle, Plus } from 'lucide-react';

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
  const [editingSection, setEditingSection] = useState(null);
  const [currentText, setCurrentText] = useState('');
  
  const textareaRef = useRef(null);
  const cursorPositionRef = useRef(0);

  const isMidYearPeriod = currentPeriod === 'MID_YEAR_REVIEW';
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';

  // ✅ FIX: Convert both to string for comparison (handle UUID vs integer)
  const isCurrentUserEmployee = (() => {
    if (!permissions?.employee?.id || !performanceData?.employee) return false;
    
    const userEmployeeId = String(permissions.employee.id);
    const performanceEmployeeId = String(performanceData.employee);
    

    return userEmployeeId === performanceEmployeeId;
  })();
  
  const isCurrentUserManager = (() => {
    if (!permissions?.employee || !performanceData) return false;
    
    
    return permissions.is_manager;
  })();

  const isEmployeeSubmitted = Boolean(performanceData?.mid_year_employee_submitted);
  const isManagerCompleted = Boolean(performanceData?.mid_year_completed);
  
  const isEndYearEmployeeSubmitted = Boolean(performanceData?.end_year_employee_submitted);
  const isEndYearCompleted = Boolean(performanceData?.end_year_completed);

  const canEditMidYearEmployee = isCurrentUserEmployee && isMidYearPeriod;
  const canEditMidYearManager = isCurrentUserManager && isMidYearPeriod;
  const canEditEndYearEmployee = isCurrentUserEmployee && isEndYearPeriod;
  const canEditEndYearManager = isCurrentUserManager && isEndYearPeriod;



  const handleStartEdit = (section, role) => {
    const key = `${section}_${role}`;
    setEditingSection(key);
    setCurrentText('');
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setCurrentText('');
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    cursorPositionRef.current = cursorPos;
    setCurrentText(newValue);
  };
  
  useEffect(() => {
    if (textareaRef.current && editingSection) {
      const textarea = textareaRef.current;
      const cursorPos = cursorPositionRef.current;
      
      if (textarea.setSelectionRange) {
        textarea.setSelectionRange(cursorPos, cursorPos);
      }
      textarea.focus();
    }
  }, [currentText, editingSection]);

  const handleSubmit = async (section, role) => {
    if (!currentText.trim()) {
      alert('Please enter a comment before submitting');
      return;
    }

    const scrollY = window.scrollY;

    if (section === 'midYear') {
      if (role === 'employee') {
        await onSubmitMidYearEmployee(currentText);
      } else if (role === 'manager') {
        await onSubmitMidYearManager(currentText);
      }
    } else if (section === 'endYear') {
      if (role === 'employee') {
        if (typeof onSubmitEndYearEmployee === 'function') {
          await onSubmitEndYearEmployee(currentText);
        }
      } else if (role === 'manager') {
        if (typeof onSubmitEndYearManager === 'function') {
          await onSubmitEndYearManager(currentText);
        }
      }
    }
    
    handleCancelEdit();
    
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const textareaClass = `w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all ${
    darkMode 
      ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
  }`;
  
  const textareaStyle = {
    direction: 'ltr',
    textAlign: 'left',
    unicodeBidi: 'bidi-override',
    writingMode: 'horizontal-tb',
  };

  const ReviewSection = ({ 
    title, 
    icon: Icon, 
    employeeComment, 
    managerComment, 
    iconColor,
    section,
    canEditEmployee,
    canEditManager,
    employeeSubmitted,
    managerSubmitted
  }) => {
    const employeeKey = `${section}_employee`;
    const managerKey = `${section}_manager`;
    
    const isEditingEmployee = editingSection === employeeKey;
    const isEditingManager = editingSection === managerKey;

    // ✅ FIX: Check if ANY section is currently being edited
    const isAnyEditing = editingSection !== null;

    return (
      <div className={`${darkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
        <div className={`p-5 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${iconColor}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
                Employee self-review and manager assessment
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* EMPLOYEE COMMENT SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Employee Self-Review
                </h4>
                {employeeSubmitted && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 font-medium">
                    ✓ Submitted
                  </span>
                )}
              </div>
              
              {/* ✅ FIX: Disable if ANY section is editing */}
              {canEditEmployee && !isAnyEditing && (
                <button
                  onClick={() => handleStartEdit(section, 'employee')}
                  className="h-9 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 flex items-center gap-2 text-xs font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Comment
                </button>
              )}
              
              {/* ✅ Show "editing..." if another section is active */}
              {canEditEmployee && isAnyEditing && !isEditingEmployee && (
                <span className="text-xs text-gray-400 italic">
                  Complete current edit first...
                </span>
              )}
            </div>

            {employeeComment && (
              <div className={`${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200/50'} border rounded-xl p-4 mb-3`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed`}>
                  {employeeComment}
                </p>
              </div>
            )}

            {isEditingEmployee && (
              <div className="space-y-3" dir="ltr">
                <textarea
                  ref={textareaRef}
                  value={currentText}
                  onChange={handleInputChange}
                  placeholder="Share your self-assessment, achievements, challenges, and progress during this period..."
                  className={textareaClass}
                  rows={6}
                  autoFocus
                  dir="ltr"
                  style={textareaStyle}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmit(section, 'employee')}
                    disabled={!currentText.trim()}
                    className="flex-1 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Submit Review
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!employeeComment && !isEditingEmployee && (
              <div className={`${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200/50'} border rounded-xl p-4`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                    No self-review provided yet
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* MANAGER COMMENT SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manager Assessment
                </h4>
                {managerSubmitted && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 font-medium">
                    ✓ Completed
                  </span>
                )}
              </div>
              
              {/* ✅ FIX: Disable if ANY section is editing */}
              {canEditManager && !isAnyEditing && (
                <button
                  onClick={() => handleStartEdit(section, 'manager')}
                  className="h-9 px-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 flex items-center gap-2 text-xs font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Assessment
                </button>
              )}
              
              {/* ✅ Show "editing..." if another section is active */}
              {canEditManager && isAnyEditing && !isEditingManager && (
                <span className="text-xs text-gray-400 italic">
                  Complete current edit first...
                </span>
              )}
            </div>

            {managerComment && (
              <div className={`${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200/50'} border rounded-xl p-4 mb-3`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed`}>
                  {managerComment}
                </p>
              </div>
            )}

            {isEditingManager && (
              <div className="space-y-3" dir="ltr">
                <textarea
                  ref={textareaRef}
                  value={currentText}
                  onChange={handleInputChange}
                  placeholder="Provide your assessment of employee's performance, strengths, areas for improvement, and feedback on their self-review..."
                  className={textareaClass}
                  rows={6}
                  autoFocus
                  dir="ltr"
                  style={textareaStyle}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmit(section, 'manager')}
                    disabled={!currentText.trim()}
                    className="flex-1 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {section === 'midYear' ? 'Complete Review' : 'Submit Assessment'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!managerComment && !isEditingManager && (
              <div className={`${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200/50'} border rounded-xl p-4`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                    {employeeSubmitted ? 'Waiting for manager assessment...' : 'No assessment provided yet'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {(isMidYearPeriod || isEndYearPeriod) && (
        <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                {isMidYearPeriod ? 'Mid-Year Review Period Active' : 'End-Year Review Period Active'}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {isMidYearPeriod 
                  ? 'Review performance at the halfway point of the year. Employee submits self-review first, then manager completes assessment.'
                  : 'Complete final year-end review. Employee provides final self-assessment, followed by manager\'s final evaluation.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <ReviewSection
        title="Mid-Year Review"
        icon={FileText}
        employeeComment={midYearEmployee}
        managerComment={midYearManager}
        iconColor="bg-orange-500"
        section="midYear"
        canEditEmployee={canEditMidYearEmployee}
        canEditManager={canEditMidYearManager}
        employeeSubmitted={isEmployeeSubmitted}
        managerSubmitted={isManagerCompleted}
      />

      <ReviewSection
        title="End-Year Review"
        icon={FileText}
        employeeComment={endYearEmployee}
        managerComment={endYearManager}
        iconColor="bg-emerald-600"
        section="endYear"
        canEditEmployee={canEditEndYearEmployee}
        canEditManager={canEditEndYearManager}
        employeeSubmitted={isEndYearEmployeeSubmitted}
        managerSubmitted={isEndYearCompleted}
      />
    </div>
  );
}