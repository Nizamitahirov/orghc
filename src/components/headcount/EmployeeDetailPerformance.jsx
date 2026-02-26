'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Award, Clock, AlertCircle, CheckCircle, FileText, Users,
  AlertTriangle, Calendar, Target, BarChart3, Eye, Download, RefreshCw,
  ChevronDown, ChevronUp, Zap, XCircle, Activity, CheckSquare, MessageSquare, 
  Send, Play, Bell, Info
} from 'lucide-react';
import performanceApi from '@/services/performanceService';

export default function EmployeeDetailPerformance({ employeeId, employeeData, isManager = false, darkMode = false }) {
  // State
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [comment, setComment] = useState('');
  
  const [expanded, setExpanded] = useState({
    summary: true,
    history: true,
    team: true
  });

  // ✅ FIX: Initial load with proper data structure
  useEffect(() => {
    if (employeeId || employeeData) {
      loadPerformanceData();
    }
  }, [employeeId, employeeData]);

  /// ✅ Düzəliş: Əvvəl employeeData.performance_records-dan istifadə et
const loadPerformanceData = useCallback(async () => {
  try {
    setLoading(true);

    // 1) Ən əvvəl employees/{id}/ responsundan gələn performance_records-dan istifadə edək
    if (employeeData?.performance_records?.length) {
 
      setPerformanceRecords(employeeData.performance_records);
      return; // Burda dayandırırıq, artıq datamız var
    }

    // 2) Əgər employeeData-dan gəlmirsə, onda API list-i çağırırıq
    const id = employeeId || employeeData?.id;
    if (id) {
      const response = await performanceApi.performances.list({
        employee_id: id,
      });
 
      setPerformanceRecords(response.results || []);
    } else {
      console.warn('⚠️ No employee ID available');
      setPerformanceRecords([]);
    }
  } catch (error) {
    console.error('❌ Error loading performance:', error);
    setPerformanceRecords([]);
  } finally {
    setLoading(false);
  }
}, [employeeId, employeeData]);


  // ✅ FIX: Refresh data properly
  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const id = employeeId || employeeData?.id;
      if (!id) {
        console.error('❌ No employee ID for refresh');
        return;
      }
      
    
      
      const response = await performanceApi.performances.list({ 
        employee_id: id 
      });
      
    
      setPerformanceRecords(response.results || []);
      
      // If detail modal is open, refresh that too
      if (showDetailModal && selectedRecord) {
        const freshDetail = await performanceApi.performances.get(selectedRecord.id);
        setSelectedRecord(freshDetail);
      }
    } catch (error) {
      console.error('❌ Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [employeeId, employeeData, showDetailModal, selectedRecord]);

  // View details
  const viewDetails = async (recordId) => {
    try {
    
      const detail = await performanceApi.performances.get(recordId);
 
      setSelectedRecord(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('❌ Error loading details:', error);
      alert('Failed to load performance details');
    }
  };

  // Download Excel
  const downloadExcel = async (recordId) => {
    try {
      const fileName = `performance-${employeeData?.name || employeeData?.employee_name || 'employee'}-${new Date().getFullYear()}.xlsx`;
      await performanceApi.downloadExcel(recordId, fileName);
    } catch (error) {
      console.error('❌ Error downloading:', error);
      alert('Failed to download report');
    }
  };

  // Open action modal
  const openActionModal = (record, action) => {

    setSelectedRecord(record);
    setCurrentAction(action);
    setComment('');
    setShowActionModal(true);
  };

  // ✅ FIX: Execute action with proper error handling
  const executeAction = async () => {
    if (!selectedRecord || !currentAction) {
      console.error('❌ No record or action selected');
      return;
    }

    try {
      setActionLoading(true);
      console.log('⚡ Executing action:', currentAction.type, 'for record:', selectedRecord.id);

      const actionMap = {
        'approve_objectives_employee': () => 
          performanceApi.performances.approveObjectivesEmployee(selectedRecord.id),
        'request_clarification': () => {
          if (!comment.trim()) throw new Error('Comment required for clarification');
          return performanceApi.performances.requestClarification(selectedRecord.id, {
            comment,
            section: 'objectives',
            comment_type: 'OBJECTIVE_CLARIFICATION'
          });
        },
        'submit_mid_year_employee': () => 
          performanceApi.performances.submitMidYearEmployee(selectedRecord.id, { comment }),
        'submit_mid_year_manager': () => 
          performanceApi.performances.submitMidYearManager(selectedRecord.id, { comment }),
        'submit_end_year_employee': () => 
          performanceApi.performances.submitEndYearEmployee(selectedRecord.id, { comment }),
        'complete_end_year': () => 
          performanceApi.performances.completeEndYear(selectedRecord.id, { comment }),
        'approve_final_employee': () => 
          performanceApi.performances.approveFinalEmployee(selectedRecord.id),
        'approve_final_manager': () => 
          performanceApi.performances.approveFinalManager(selectedRecord.id),
      };

      if (!actionMap[currentAction.type]) {
        throw new Error(`Unknown action type: ${currentAction.type}`);
      }

      const result = await actionMap[currentAction.type]();
    
      
      // Close modal
      setShowActionModal(false);
      setComment('');
      setCurrentAction(null);
      setSelectedRecord(null);
      
      // Refresh data
      await refreshData();
      
      // Show success message
      const successMsg = result?.message || result?.success || 'Action completed successfully!';
      alert(successMsg);
      
    } catch (error) {
      console.error('❌ Action error:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'Failed to complete action';
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Helpers
  const toggle = (section) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid';
    }
  };

  const getPeriodLabel = (period) => ({
    'GOAL_SETTING': 'Goal Setting',
    'MID_YEAR_REVIEW': 'Mid-Year Review',
    'END_YEAR_REVIEW': 'End-Year Review',
    'COMPLETED': 'Completed',
    'CLOSED': 'Closed'
  })[period] || period;

  const getPeriodColor = (period) => ({
    'GOAL_SETTING': darkMode 
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
      : 'bg-blue-50 text-blue-700 border-blue-200',
    'MID_YEAR_REVIEW': darkMode
      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      : 'bg-orange-50 text-orange-700 border-orange-200',
    'END_YEAR_REVIEW': darkMode
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      : 'bg-purple-50 text-purple-700 border-purple-200',
    'COMPLETED': darkMode
      ? 'bg-green-500/20 text-green-300 border-green-500/30'
      : 'bg-green-50 text-green-700 border-green-200',
    'CLOSED': darkMode
      ? 'bg-gray-700 text-gray-300 border-gray-600'
      : 'bg-gray-100 text-gray-600 border-gray-300'
  })[period] || (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600');

  const getScoreColor = (score) => {
    const num = parseFloat(score);
    if (num >= 90) return darkMode ? 'text-green-400' : 'text-green-600';
    if (num >= 70) return darkMode ? 'text-blue-400' : 'text-blue-600';
    if (num >= 50) return darkMode ? 'text-orange-400' : 'text-orange-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const getActionColor = (color) => ({
    green: darkMode 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-green-600 hover:bg-green-700 text-white',
    blue: darkMode
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    purple: darkMode
      ? 'bg-purple-600 hover:bg-purple-700 text-white'
      : 'bg-purple-600 hover:bg-purple-700 text-white',
    orange: darkMode
      ? 'bg-orange-600 hover:bg-orange-700 text-white'
      : 'bg-orange-600 hover:bg-orange-700 text-white'
  })[color] || (darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white');

  const getActionIcon = (icon) => ({
    CheckSquare: <CheckSquare size={14} />,
    Send: <Send size={14} />,
    CheckCircle: <CheckCircle size={14} />,
    MessageSquare: <MessageSquare size={14} />,
    RefreshCw: <RefreshCw size={14} />
  })[icon] || <Activity size={14} />;

  // ✅ FIX: Extract data safely
  const currentPerf = employeeData?.current_performance;
  const perfSummary = employeeData?.performance_summary;
  const pendingActions = employeeData?.pending_performance_actions;
  const teamOverview = employeeData?.team_performance_overview;



  // Loading state
  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-12 text-center`}>
        <RefreshCw className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'} animate-spin mx-auto mb-3`} />
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>
          Loading performance data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
     

      {/* Summary Cards */}
      <Section
        darkMode={darkMode}
        title="Overview"
        icon={<BarChart3 />}
        expanded={expanded.summary}
        onToggle={() => toggle('summary')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            darkMode={darkMode}
            icon={<Calendar />}
            label="Current Year"
            value={currentPerf?.active_year || new Date().getFullYear()}
            sublabel={currentPerf?.has_current_performance 
              ? `Active - ${performanceRecords.length} record(s)` 
              : 'No active record'}
            color={currentPerf?.has_current_performance ? 'green' : 'orange'}
          />
          <SummaryCard
            darkMode={darkMode}
            icon={<FileText />}
            label="Total Records"
            value={performanceRecords.length}
            sublabel={performanceRecords.length > 0 ? 'Performance data available' : 'No data'}
            color="blue"
          />
          <SummaryCard
            darkMode={darkMode}
            icon={<Clock />}
            label="Pending Actions"
            value={pendingActions?.actions?.length || 0}
            sublabel={pendingActions?.has_pending_actions ? 'Action required' : 'All clear'}
            color={pendingActions?.has_pending_actions ? 'orange' : 'green'}
          />
          <SummaryCard
            darkMode={darkMode}
            icon={<TrendingUp />}
            label="Current Period"
            value={getPeriodLabel(currentPerf?.current_period || 'N/A')}
            sublabel={`Year ${currentPerf?.active_year || new Date().getFullYear()}`}
            color="purple"
          />
        </div>
      </Section>

      {/* Performance History */}
      <Section
        darkMode={darkMode}
        title="Performance Records"
        icon={<FileText />}
        expanded={expanded.history}
        onToggle={() => toggle('history')}
        badge={performanceRecords.length}
      >
        {performanceRecords.length > 0 ? (
          <div className="space-y-3">
            {performanceRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                darkMode={darkMode}
                getPeriodLabel={getPeriodLabel}
                getPeriodColor={getPeriodColor}
                getScoreColor={getScoreColor}
                getActionColor={getActionColor}
                getActionIcon={getActionIcon}
                formatDate={formatDate}
                onView={() => viewDetails(record.id)}
                onDownload={() => downloadExcel(record.id)}
                onAction={(action) => openActionModal(record, action)}
              />
            ))}
          </div>
        ) : (
          <EmptyState darkMode={darkMode} />
        )}
      </Section>

 

      {/* Modals */}
      {showActionModal && currentAction && (
        <ActionModal
          darkMode={darkMode}
          action={currentAction}
          record={selectedRecord}
          comment={comment}
          setComment={setComment}
          loading={actionLoading}
          getPeriodLabel={getPeriodLabel}
          getPeriodColor={getPeriodColor}
          onClose={() => {
            setShowActionModal(false);
            setComment('');
            setCurrentAction(null);
            setSelectedRecord(null);
          }}
          onConfirm={executeAction}
        />
      )}

      {showDetailModal && selectedRecord && (
        <DetailModal
          darkMode={darkMode}
          record={selectedRecord}
          formatDate={formatDate}
          getPeriodLabel={getPeriodLabel}
          getPeriodColor={getPeriodColor}
          getScoreColor={getScoreColor}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}


// ==================== SUB-COMPONENTS ====================

function Section({ darkMode, title, icon, children, expanded, onToggle, badge }) {
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors group`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-almet-sapphire/20' : 'bg-almet-mystic'}`}>
            {React.cloneElement(icon, { 
              className: `w-4 h-4 ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}` 
            })}
          </div>
          <h3 className={`${darkMode ? 'text-white' : 'text-almet-cloud-burst'} font-semibold text-sm`}>
            {title}
          </h3>
          {badge > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              darkMode 
                ? 'bg-almet-sapphire/20 text-almet-astral'
                : 'bg-almet-mystic text-almet-sapphire'
            }`}>
              {badge}
            </span>
          )}
        </div>
        {expanded ? 
          <ChevronUp size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} /> : 
          <ChevronDown size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
        }
      </button>
      {expanded && (
        <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ darkMode, icon, label, value, sublabel, color }) {
  const colors = {
    blue: darkMode ? 'from-almet-sapphire to-almet-astral' : 'from-almet-sapphire to-almet-cloud-burst',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border p-3 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-2.5 mb-2">
        <div className={`p-2 bg-gradient-to-br ${colors[color]} rounded-lg flex-shrink-0`}>
          {React.cloneElement(icon, { className: 'w-4 h-4 text-white' })}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase mb-1`}>
            {label}
          </h4>
          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
            {value}
          </p>
        </div>
      </div>
      {sublabel && (
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} line-clamp-1`}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

function RecordCard({ 
  record, darkMode, getPeriodLabel, getPeriodColor, getScoreColor,
  getActionColor, getActionIcon, formatDate, onView, onDownload, onAction 
}) {
  const actions = record.available_actions || [];
  const scores = record.scores || {};

  return (
    <div className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Award size={14} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-semibold text-sm truncate`}>
                Performance Year {record.year}
              </h5>
            </div>
            <span className={`text-xs px-2 py-1 rounded-md border font-medium flex-shrink-0 ${getPeriodColor(record.current_period)}`}>
              {getPeriodLabel(record.current_period)}
            </span>
          </div>

          {/* Scores */}
          {(scores.objectives_percentage > 0 || scores.competencies_percentage > 0 || scores.overall_percentage > 0) && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {scores.objectives_percentage > 0 && (
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-0.5`}>Objectives</p>
                  <p className={`text-base font-bold ${getScoreColor(scores.objectives_percentage)}`}>
                    {scores.objectives_percentage.toFixed(1)}%
                  </p>
                </div>
              )}
              {scores.competencies_percentage > 0 && (
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-0.5`}>Competencies</p>
                  <p className={`text-base font-bold ${getScoreColor(scores.competencies_percentage)}`}>
                    {scores.competencies_percentage.toFixed(1)}%
                  </p>
                </div>
              )}
              {scores.overall_percentage > 0 && (
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-0.5`}>Overall</p>
                  <p className={`text-base font-bold ${getScoreColor(scores.overall_percentage)}`}>
                    {scores.overall_percentage.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onAction(action)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${getActionColor(action.color)}`}
                >
                  {getActionIcon(action.icon)}
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            <Calendar size={11} />
            <span>Updated: {formatDate(record.updated_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onView}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'text-almet-astral hover:bg-almet-sapphire/20'
                : 'text-almet-sapphire hover:bg-almet-mystic'
            }`}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={onDownload}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'text-green-400 hover:bg-green-500/20'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title="Download Excel"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ darkMode }) {
  return (
    <div className="text-center py-8">
      <div className={`w-16 h-16 mx-auto mb-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
        <FileText className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
      </div>
      <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
        No Performance Records
      </h4>
      <p className={`${darkMode ? 'text-gray-500' : 'text-gray-600'} text-xs`}>
        No performance records found for this employee
      </p>
    </div>
  );
}



function ActionModal({ 
  darkMode, action, record, comment, setComment, loading,
  getPeriodLabel, getPeriodColor, onClose, onConfirm 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg w-full max-w-md border shadow-xl`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {action.label}
          </h3>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
            {action.description}
          </p>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Record Info */}
          <div className={`p-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg space-y-2`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Year</span>
              <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {record.year}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Period</span>
              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${getPeriodColor(record.current_period)}`}>
                {getPeriodLabel(record.current_period)}
              </span>
            </div>
          </div>

          {/* Comment Input */}
          {action.requires_comment && (
            <div>
              <label className={`block text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1.5`}>
                Comment {action.type === 'request_clarification' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border text-xs ${
                  darkMode 
                    ? 'bg-gray-750 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none transition-all`}
              />
            </div>
          )}

          {/* Warning */}
          {action.type === 'approve_final_manager' && (
            <div className={`p-3 rounded-lg border ${
              darkMode 
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  This will publish the final performance results. This action cannot be undone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t flex items-center justify-end gap-2`}>
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${
              darkMode 
                ? 'border-gray-700 text-white hover:bg-gray-700'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || (action.requires_comment && action.type === 'request_clarification' && !comment.trim())}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm ${
              darkMode 
                ? 'bg-almet-sapphire hover:bg-almet-astral text-white'
                : 'bg-almet-sapphire hover:bg-almet-cloud-burst text-white'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={13} />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ darkMode, record, formatDate, getPeriodLabel, getPeriodColor, getScoreColor, onClose }) {
  const workflow = record.workflow || {};
  const scores = record.scores || {};
  const objectives = record.objectives || [];
  const competencies = record.competency_ratings || [];
  const devNeeds = record.development_needs || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg w-full max-w-4xl border shadow-xl my-8`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-10`}>
          <div>
            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Details - {record.year}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
              {record.employee_name || 'Employee'} • {record.employee_job_title || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Status Overview */}
          <div>
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
              <Activity size={16} className={darkMode ? 'text-almet-astral' : 'text-almet-sapphire'} />
              Current Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Period</p>
                <span className={`text-xs px-2 py-1 rounded-md border font-medium inline-block ${getPeriodColor(record.current_period)}`}>
                  {getPeriodLabel(record.current_period)}
                </span>
              </div>
              <div className={`p-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Status</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {record.approval_status_display || record.approval_status}
                </p>
              </div>
              <div className={`p-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Updated</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(record.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Progress */}
          <div>
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
              <Target size={16} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
              Workflow Progress
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Objectives */}
              <div className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                <h5 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Goal Setting
                </h5>
                <div className="space-y-1.5">
                  <StatusItem
                    darkMode={darkMode}
                    label="Employee Submitted"
                    status={workflow.objectives?.employee_submitted}
                    date={workflow.objectives?.employee_submitted_date}
                    formatDate={formatDate}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Employee Approved"
                    status={workflow.objectives?.employee_approved}
                    date={workflow.objectives?.employee_approved_date}
                    formatDate={formatDate}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Manager Approved"
                    status={workflow.objectives?.manager_approved}
                    date={workflow.objectives?.manager_approved_date}
                    formatDate={formatDate}
                  />
                </div>
              </div>

              {/* Mid-Year */}
              <div className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                <h5 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Mid-Year Review
                </h5>
                <div className="space-y-1.5">
                  <StatusItem
                    darkMode={darkMode}
                    label="Employee Submitted"
                    status={workflow.mid_year?.employee_submitted}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Manager Completed"
                    status={workflow.mid_year?.manager_submitted}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Review Complete"
                    status={workflow.mid_year?.completed}
                  />
                </div>
              </div>

              {/* End-Year */}
              <div className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                <h5 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  End-Year Review
                </h5>
                <div className="space-y-1.5">
                  <StatusItem
                    darkMode={darkMode}
                    label="Employee Submitted"
                    status={workflow.end_year?.employee_submitted}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Manager Completed"
                    status={workflow.end_year?.manager_submitted}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Review Complete"
                    status={workflow.end_year?.completed}
                  />
                </div>
              </div>

              {/* Final Approval */}
              <div className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                <h5 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Final Approval
                </h5>
                <div className="space-y-1.5">
                  <StatusItem
                    darkMode={darkMode}
                    label="Employee Approved"
                    status={workflow.final?.employee_approved}
                    date={workflow.final?.employee_approval_date}
                    formatDate={formatDate}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Manager Approved"
                    status={workflow.final?.manager_approved}
                    date={workflow.final?.manager_approval_date}
                    formatDate={formatDate}
                  />
                  <StatusItem
                    darkMode={darkMode}
                    label="Published"
                    status={workflow.final?.is_complete}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Final Scores */}
          {(scores.objectives_percentage > 0 || scores.competencies_percentage > 0) && (
            <div>
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <BarChart3 size={16} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                Final Scores
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scores.objectives_percentage > 0 && (
                  <ScoreCard
                    darkMode={darkMode}
                    label="Objectives"
                    value={`${scores.objectives_percentage.toFixed(1)}%`}
                    color={getScoreColor(scores.objectives_percentage)}
                  />
                )}
                {scores.competencies_percentage > 0 && (
                  <ScoreCard
                    darkMode={darkMode}
                    label="Competencies"
                    value={`${scores.competencies_percentage.toFixed(1)}%`}
                    color={getScoreColor(scores.competencies_percentage)}
                  />
                )}
                {scores.overall_percentage > 0 && (
                  <ScoreCard
                    darkMode={darkMode}
                    label="Overall"
                    value={`${scores.overall_percentage.toFixed(1)}%`}
                    color={getScoreColor(scores.overall_percentage)}
                  />
                )}
                {scores.final_rating !== 'N/A' && (
                  <ScoreCard
                    darkMode={darkMode}
                    label="Rating"
                    value={scores.final_rating}
                    color={darkMode ? 'text-white' : 'text-gray-900'}
                  />
                )}
              </div>
            </div>
          )}

          {/* Objectives Summary */}
          {objectives.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <Target size={16} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                Objectives ({objectives.length})
              </h4>
              <div className="space-y-2">
                {objectives.slice(0, 5).map((obj, idx) => (
                  <div key={idx} className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                    <h5 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {obj.title}
                    </h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Weight</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{obj.weight}%</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Progress</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{obj.progress}%</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Status</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{obj.status_label || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {objectives.length > 5 && (
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-center`}>
                    + {objectives.length - 5} more objectives
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Competencies Summary */}
          {competencies.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <Award size={16} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                Competencies ({competencies.length})
              </h4>
              <div className="space-y-2">
                {competencies.slice(0, 5).map((comp, idx) => (
                  <div key={idx} className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {comp.competency_name}
                        </h5>
                        {comp.competency_group && (
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            {comp.competency_group}
                          </p>
                        )}
                      </div>
                      {comp.gap !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          comp.gap === 0
                            ? darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                            : comp.gap > 0
                            ? darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                            : darkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {comp.gap > 0 ? 'Exceeds' : comp.gap === 0 ? 'Meets' : 'Below'}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Required</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{comp.required_level}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Actual</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{comp.actual_value}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Gap</p>
                        <p className={`text-sm font-semibold ${comp.gap > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {comp.gap > 0 ? `+${comp.gap}` : comp.gap}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {competencies.length > 5 && (
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-center`}>
                    + {competencies.length - 5} more competencies
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Development Needs */}
          {devNeeds.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <Zap size={16} className={darkMode ? 'text-orange-400' : 'text-orange-600'} />
                Development Needs ({devNeeds.length})
              </h4>
              <div className="space-y-2">
                {devNeeds.map((need, idx) => (
                  <div key={idx} className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1.5`}>
                      {need.competency_gap}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {need.development_activity}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-600'}>Progress</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {need.progress}%
                        </span>
                      </div>
                      <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-1.5`}>
                        <div 
                          className="bg-gradient-to-r from-almet-sapphire to-almet-astral h-1.5 rounded-full transition-all"
                          style={{ width: `${need.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t flex items-center justify-end sticky bottom-0`}>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              darkMode 
                ? 'bg-almet-sapphire hover:bg-almet-astral text-white'
                : 'bg-almet-sapphire hover:bg-almet-cloud-burst text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatusItem({ darkMode, label, status, date, formatDate }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={darkMode ? 'text-gray-500' : 'text-gray-600'}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {status ? (
          <>
            <CheckCircle size={12} className={darkMode ? 'text-green-400' : 'text-green-600'} />
            {date && formatDate && (
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                {formatDate(date)}
              </span>
            )}
          </>
        ) : (
          <XCircle size={12} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
        )}
      </div>
    </div>
  );
}

function ScoreCard({ darkMode, label, value, color }) {
  return (
    <div className={`p-3 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg text-center border`}>
      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>
        {label}
      </p>
      <p className={`text-xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}