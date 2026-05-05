'use client'
import React, { useState, useEffect, useCallback } from 'react';
import {
  Award, CheckCircle, FileText, Calendar, Target, BarChart3,
  Eye, Download, RefreshCw, ChevronDown, ChevronUp,
  XCircle, CheckSquare, AlertCircle, ArrowRight, Clock
} from 'lucide-react';
import performanceApi from '@/services/performanceService';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PERIOD_LABELS = {
  GOAL_SETTING:    'Goal Setting',
  MID_YEAR_REVIEW: 'Mid-Year Review',
  END_YEAR_REVIEW: 'End-Year Review',
  COMPLETED:       'Completed',
  CLOSED:          'Closed',
};

const PERIOD_COLORS_DARK = {
  GOAL_SETTING:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
  MID_YEAR_REVIEW: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  END_YEAR_REVIEW: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  COMPLETED:       'bg-green-500/20 text-green-300 border-green-500/30',
  CLOSED:          'bg-gray-700 text-gray-300 border-gray-600',
};
const PERIOD_COLORS_LIGHT = {
  GOAL_SETTING:    'bg-blue-50 text-blue-700 border-blue-200',
  MID_YEAR_REVIEW: 'bg-orange-50 text-orange-700 border-orange-200',
  END_YEAR_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED:       'bg-green-50 text-green-700 border-green-200',
  CLOSED:          'bg-gray-100 text-gray-600 border-gray-300',
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Hər status üçün employee-ə göstəriləcək mətn + rəng + addım mövqeyi
const STATUS_CONFIG = {
  DRAFT: {
    label:       'Not started',
    description: 'Your manager has not set objectives yet.',
    step:        0,
    color:       { dark: 'text-gray-400', light: 'text-gray-500' },
  },
  PENDING_EMPLOYEE_APPROVAL: {
    label:       'Waiting for your approval',
    description: 'Your manager has set your objectives. Please review and approve.',
    step:        1,
    color:       { dark: 'text-amber-400', light: 'text-amber-700' },
  },
  NEED_CLARIFICATION: {
    label:       'Clarification needed',
    description: 'You requested clarification. Your manager is reviewing.',
    step:        1,
    color:       { dark: 'text-red-400', light: 'text-red-700' },
  },
  APPROVED: {
    label:       'Goals approved',
    description: 'Objectives agreed. Reviews in progress.',
    step:        2,
    color:       { dark: 'text-green-400', light: 'text-green-700' },
  },
  COMPLETED: {
    label:       'Completed',
    description: 'Performance cycle fully completed.',
    step:        3,
    color:       { dark: 'text-emerald-400', light: 'text-emerald-700' },
  },
};

// ─── PROGRESS STEPS ──────────────────────────────────────────────────────────
// Non-technical employees üçün prosesin hansı mərhələdə olduğunu göstərir
const PROCESS_STEPS = [
  { id: 0, label: 'Goals set',     icon: Target        },
  { id: 1, label: 'Goals approved',icon: CheckSquare   },
  { id: 2, label: 'Reviews done',  icon: FileText      },
  { id: 3, label: 'Completed',     icon: Award         },
];

function ProcessProgress({ record, darkMode }) {
  const cfg  = STATUS_CONFIG[record.approval_status] || STATUS_CONFIG.DRAFT;
  const step = cfg.step;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        {PROCESS_STEPS.map((s, i) => {
          const done    = step > s.id;
          const current = step === s.id;
          const Icon    = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  done    ? 'bg-green-500 text-white' :
                  current ? 'bg-amber-500 text-white' :
                            darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                }`}>
                  {done ? <CheckCircle size={14} /> : <Icon size={13} />}
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${
                  done || current
                    ? darkMode ? 'text-white' : 'text-gray-800'
                    : darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} style={{ maxWidth: 64 }}>
                  {s.label}
                </span>
              </div>
              {i < PROCESS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full ${
                  step > s.id
                    ? 'bg-green-500'
                    : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {cfg.description}
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EmployeeDetailPerformance({
  employeeId,
  employeeData,
  isOwnProfile,
  darkMode,
  currentUser
}) {
  const [loading,          setLoading]          = useState(false);
  const [refreshing,       setRefreshing]       = useState(false);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [selectedRecord,   setSelectedRecord]   = useState(null);
  const [showDetailModal,  setShowDetailModal]  = useState(false);
  const [showApprovalModal,setShowApprovalModal]= useState(false);
  const [currentAction,    setCurrentAction]    = useState(null);
  const [expanded,         setExpanded]         = useState({ history: true });

  useEffect(() => {
    if (employeeId || employeeData) loadPerformanceData();
  }, [employeeId, employeeData]);

  const loadPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      if (employeeData?.performance_records?.length) {
        setPerformanceRecords(employeeData.performance_records);
        return;
      }
      const id = employeeId || employeeData?.id;
      if (id) {
        const res = await performanceApi.performances.list({ employee_id: id });
        setPerformanceRecords(res.results || []);
      }
    } catch (err) {
      console.error('Load performance error:', err);
      setPerformanceRecords([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, employeeData]);

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      const id = employeeId || employeeData?.id;
      if (!id) return;
      const res = await performanceApi.performances.list({ employee_id: id });
      setPerformanceRecords(res.results || []);
      if (showDetailModal && selectedRecord) {
        const fresh = await performanceApi.performances.get(selectedRecord.id);
        setSelectedRecord(fresh);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [employeeId, employeeData, showDetailModal, selectedRecord]);

  const viewDetails = async (recordId) => {
    try {
      const detail = await performanceApi.performances.get(recordId);
      setSelectedRecord(detail);
      setShowDetailModal(true);
    } catch {
      alert('Failed to load performance details');
    }
  };

  const downloadExcel = async (recordId) => {
    try {
      const name = `performance-${employeeData?.name || 'employee'}-${new Date().getFullYear()}.xlsx`;
      await performanceApi.downloadExcel(recordId, name);
    } catch {
      alert('Failed to download report');
    }
  };

  // ── Yalnız objectives approval qalır ──
  const getEmployeeActions = (record) => {
    if (!isOwnProfile && !currentUser?.is_admin) return [];

    const actions = [];
    const canApproveObjectives =
      record.approval_status === 'PENDING_EMPLOYEE_APPROVAL' &&
      record.current_period   === 'GOAL_SETTING' &&
      !record.objectives_employee_approved;

    if (canApproveObjectives) {
      actions.push({
        type:        'approve_objectives',
        label:       'Approve My Goals',
        icon:        CheckSquare,
        description: 'Your manager has set your goals. Review and confirm them.',
        urgency:     'high',
        onClick:     () => {
          setSelectedRecord(record);
          setCurrentAction({
            type:        'approve_objectives',
            label:       'Approve My Goals',
            description: 'Confirm that you have reviewed and agree with the goals set by your manager.',
          });
          setShowApprovalModal(true);
        },
      });
    }

    return actions;
  };

  const executeApproval = async () => {
    if (!selectedRecord || !currentAction) return;
    try {
      setLoading(true);
      if (currentAction.type === 'approve_objectives') {
        await performanceApi.performances.approveObjectivesEmployee(selectedRecord.id);
      }
      setShowApprovalModal(false);
      setCurrentAction(null);
      setSelectedRecord(null);
      await refreshData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (p) => PERIOD_LABELS[p] || p;
  const getPeriodColor = (p) =>
    darkMode
      ? PERIOD_COLORS_DARK[p]  || 'bg-gray-700 text-gray-300 border-gray-600'
      : PERIOD_COLORS_LIGHT[p] || 'bg-gray-100 text-gray-600 border-gray-300';

  const getScoreColor = (score) => {
    const n = parseFloat(score);
    if (n >= 90) return darkMode ? 'text-green-400'  : 'text-green-600';
    if (n >= 70) return darkMode ? 'text-blue-400'   : 'text-blue-600';
    if (n >= 50) return darkMode ? 'text-orange-400' : 'text-orange-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return 'Invalid'; }
  };

  const allActions = performanceRecords.flatMap(r => getEmployeeActions(r));

  if (loading && performanceRecords.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-12 text-center`}>
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Urgent action banner ── */}
      {allActions.length > 0 && (
        <div className={`rounded-xl border p-4 ${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-200'}`}>
          <div className="space-y-2">
            {allActions.map((action, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-amber-900/30 border-amber-700/30' : 'bg-white border-amber-200'}`}>
                <div className="flex items-center gap-3">
                  <action.icon className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{action.label}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
                  </div>
                </div>
                <button onClick={action.onClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors">
                  Review <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Records section ── */}
      <Section
        darkMode={darkMode}
        title="Performance Records"
        icon={<FileText />}
        expanded={expanded.history}
        onToggle={() => setExpanded(p => ({ ...p, history: !p.history }))}
        badge={performanceRecords.length}
        action={
          <button onClick={refreshData} disabled={refreshing} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      >
        {performanceRecords.length > 0 ? (
          <div className="space-y-3">
            {performanceRecords.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                darkMode={darkMode}
                getPeriodLabel={getPeriodLabel}
                getPeriodColor={getPeriodColor}
                getScoreColor={getScoreColor}
                formatDate={formatDate}
                onView={() => viewDetails(record.id)}
                onDownload={() => downloadExcel(record.id)}
                employeeActions={getEmployeeActions(record)}
                isOwnProfile={isOwnProfile}
              />
            ))}
          </div>
        ) : (
          <EmptyState darkMode={darkMode} />
        )}
      </Section>

      {/* ── Modals ── */}
      {showApprovalModal && currentAction && (
        <ApprovalModal
          darkMode={darkMode}
          action={currentAction}
          record={selectedRecord}
          loading={loading}
          getPeriodLabel={getPeriodLabel}
          getPeriodColor={getPeriodColor}
          onClose={() => { setShowApprovalModal(false); setCurrentAction(null); setSelectedRecord(null); }}
          onConfirm={executeApproval}
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
          onClose={() => { setShowDetailModal(false); setSelectedRecord(null); }}
          onDownload={() => downloadExcel(selectedRecord.id)}
        />
      )}
    </div>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function Section({ darkMode, title, icon, children, expanded, onToggle, badge, action }) {
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
      <div className={`px-4 py-3 flex items-center justify-between ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}>
        <button onClick={onToggle} className="flex items-center gap-2.5 flex-1">
          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-almet-sapphire/20' : 'bg-almet-mystic'}`}>
            {React.cloneElement(icon, { className: `w-4 h-4 ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}` })}
          </div>
          <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>{title}</h3>
          {badge > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-almet-sapphire/20 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'}`}>{badge}</span>
          )}
        </button>
        <div className="flex items-center gap-1">
          {action}
          <button onClick={onToggle}>
            {expanded ? <ChevronUp size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} /> : <ChevronDown size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── RECORD CARD ──────────────────────────────────────────────────────────────
function RecordCard({ record, darkMode, getPeriodLabel, getPeriodColor, getScoreColor, formatDate, onView, onDownload, employeeActions, isOwnProfile }) {
  const objPct     = parseFloat(record.objectives_percentage)       || 0;
  const compPct    = parseFloat(record.competencies_percentage)     || 0;
  const overallPct = parseFloat(record.overall_weighted_percentage) || 0;
  const hasScores  = objPct > 0 || compPct > 0 || overallPct > 0;
  const cfg        = STATUS_CONFIG[record.approval_status] || STATUS_CONFIG.DRAFT;

  return (
    <div className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4 hover:shadow-sm transition-shadow`}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
            <Award size={14} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
          </div>
          <div>
            <h5 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance {record.year}
            </h5>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <Calendar size={10} />
                <span>Updated: {formatDate(record.updated_at)}</span>
              </div>
              {/* Human-readable status */}
              <span className={`text-xs font-medium ${darkMode ? cfg.color.dark : cfg.color.light}`}>
                • {cfg.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getPeriodColor(record.current_period)}`}>
            {getPeriodLabel(record.current_period)}
          </span>
          <button onClick={onView} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-almet-astral hover:bg-almet-sapphire/20' : 'text-almet-sapphire hover:bg-almet-mystic'}`} title="View Details">
            <Eye size={15} />
          </button>
          <button onClick={onDownload} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-green-400 hover:bg-green-500/20' : 'text-green-600 hover:bg-green-50'}`} title="Download Excel">
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Score pills */}
      {hasScores && (
        <div className="flex flex-wrap gap-2 mb-3">
          {objPct > 0 && <ScorePill label="Objectives" value={`${objPct.toFixed(1)}%`} color={getScoreColor(objPct)} darkMode={darkMode} />}
          {compPct > 0 && <ScorePill label="Competencies" value={`${compPct.toFixed(1)}%`} color={getScoreColor(compPct)} darkMode={darkMode} />}
          {overallPct > 0 && <ScorePill label="Overall" value={`${overallPct.toFixed(1)}%`} color={getScoreColor(overallPct)} darkMode={darkMode} />}
          {record.final_rating && record.final_rating !== 'N/A' && (
            <ScorePill label="Grade" value={record.final_rating} color={darkMode ? 'text-purple-400' : 'text-purple-600'} darkMode={darkMode} />
          )}
        </div>
      )}

      {/* Process progress — isOwnProfile olduqda göstər */}
      {isOwnProfile && record.approval_status !== 'COMPLETED' && (
        <ProcessProgress record={record} darkMode={darkMode} />
      )}

      {/* Completed badge */}
      {record.approval_status === 'COMPLETED' && (
        <div className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
          <CheckCircle size={14} className="text-emerald-500" />
          <span className={`text-xs font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
            Performance cycle completed
          </span>
        </div>
      )}

      {/* Action buttons */}
      {employeeActions.length > 0 && (
        <div className={`flex flex-wrap gap-2 pt-2 mt-2 border-t border-dashed ${darkMode ? 'border-amber-700/40' : 'border-amber-300/50'}`}>
          {employeeActions.map((action, i) => (
            <button key={i} onClick={action.onClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">
              <action.icon size={13} />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScorePill({ label, value, color, darkMode }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{label}:</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function EmptyState({ darkMode }) {
  return (
    <div className="text-center py-8">
      <div className={`w-16 h-16 mx-auto mb-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
        <FileText className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
      </div>
      <h4 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Performance Records</h4>
      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Performance records will appear here once initialized.</p>
    </div>
  );
}

// ─── APPROVAL MODAL ───────────────────────────────────────────────────────────
function ApprovalModal({ darkMode, action, record, loading, getPeriodLabel, getPeriodColor, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl w-full max-w-md border shadow-xl`}>
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{action.label}</h3>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
        </div>
        <div className="p-5 space-y-4">
          <div className={`p-3 rounded-lg space-y-2 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <Row label="Year"   value={record.year} darkMode={darkMode} />
            <Row label="Period" darkMode={darkMode}
              value={<span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${getPeriodColor(record.current_period)}`}>{getPeriodLabel(record.current_period)}</span>}
            />
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              By approving, you confirm that you have reviewed and accept the goals set by your manager.
            </p>
          </div>
        </div>
        <div className={`px-5 py-4 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t flex gap-2 justify-end`}>
          <button onClick={onClose} disabled={loading} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${darkMode ? 'border-gray-700 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50 flex items-center gap-1.5">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> Processing...</> : <><CheckCircle size={14} /> Approve</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, darkMode }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ darkMode, record, formatDate, getPeriodLabel, getPeriodColor, getScoreColor, onClose, onDownload }) {
  const objectives   = record.objectives        || [];
  const competencies = record.competency_ratings || [];
  const [showAllObj,  setShowAllObj]  = useState(false);
  const [showAllComp, setShowAllComp] = useState(false);

  const objPct     = parseFloat(record.objectives_percentage)       || 0;
  const compPct    = parseFloat(record.competencies_percentage)     || 0;
  const overallPct = parseFloat(record.overall_weighted_percentage) || 0;
  const cfg        = STATUS_CONFIG[record.approval_status] || STATUS_CONFIG.DRAFT;

  const visibleObjectives   = showAllObj  ? objectives   : objectives.slice(0, 5);
  const visibleCompetencies = showAllComp ? competencies : competencies.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl w-full max-w-4xl border shadow-xl my-8`}>
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between sticky top-0 z-10 rounded-t-xl`}>
          <div>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Performance {record.year}</h3>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.employee_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDownload} className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-green-400 hover:bg-green-500/20' : 'text-green-600 hover:bg-green-50'}`}><Download size={18} /></button>
            <button onClick={onClose}   className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}><XCircle size={20} /></button>
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoCard darkMode={darkMode} label="Period">
              <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getPeriodColor(record.current_period)}`}>{getPeriodLabel(record.current_period)}</span>
            </InfoCard>
            <InfoCard darkMode={darkMode} label="Status">
              <span className={`text-sm font-semibold ${darkMode ? cfg.color.dark : cfg.color.light}`}>{cfg.label}</span>
            </InfoCard>
            <InfoCard darkMode={darkMode} label="Updated">
              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(record.updated_at)}</span>
            </InfoCard>
          </div>

          {(objPct > 0 || compPct > 0) && (
            <div>
              <SectionTitle darkMode={darkMode} icon={<BarChart3 size={15} />} title="Performance Scores" color="green" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {objPct     > 0 && <ScoreCard darkMode={darkMode} label="Objectives"    value={`${objPct.toFixed(1)}%`}     color={getScoreColor(objPct)} />}
                {compPct    > 0 && <ScoreCard darkMode={darkMode} label="Competencies"  value={`${compPct.toFixed(1)}%`}    color={getScoreColor(compPct)} />}
                {overallPct > 0 && <ScoreCard darkMode={darkMode} label="Overall"       value={`${overallPct.toFixed(1)}%`} color={getScoreColor(overallPct)} />}
                {record.final_rating && record.final_rating !== 'N/A' && (
                  <ScoreCard darkMode={darkMode} label="Grade" value={record.final_rating} color={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                )}
              </div>
            </div>
          )}

          {objectives.length > 0 && (
            <div>
              <SectionTitle darkMode={darkMode} icon={<Target size={15} />} title={`Objectives (${objectives.length})`} color="blue" />
              <div className="mt-2 space-y-2">
                {visibleObjectives.map((obj, i) => <ObjectiveRow key={i} obj={obj} darkMode={darkMode} />)}
              </div>
              {objectives.length > 5 && (
                <button onClick={() => setShowAllObj(p => !p)} className={`mt-2 w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                  {showAllObj ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {objectives.length - 5} more</>}
                </button>
              )}
            </div>
          )}

          {competencies.length > 0 && (
            <div>
              <SectionTitle darkMode={darkMode} icon={<Award size={15} />} title={`Competencies (${competencies.length})`} color="purple" />
              <div className="mt-2 space-y-2">
                {visibleCompetencies.map((comp, i) => <CompetencyRow key={i} comp={comp} darkMode={darkMode} />)}
              </div>
              {competencies.length > 5 && (
                <button onClick={() => setShowAllComp(p => !p)} className={`mt-2 w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                  {showAllComp ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {competencies.length - 5} more</>}
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`px-5 py-4 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t rounded-b-xl flex justify-end`}>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold bg-almet-sapphire hover:bg-almet-astral text-white transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ darkMode, label, children }) {
  return (
    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
      <p className={`text-xs mb-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{label}</p>
      {children}
    </div>
  );
}
function SectionTitle({ darkMode, icon, title, color }) {
  const colors = { blue: darkMode ? 'text-blue-400' : 'text-blue-600', green: darkMode ? 'text-green-400' : 'text-green-600', purple: darkMode ? 'text-purple-400' : 'text-purple-600' };
  return <h4 className={`text-sm font-semibold flex items-center gap-2 ${colors[color]}`}>{icon} {title}</h4>;
}
function ObjectiveRow({ obj, darkMode }) {
  return (
    <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{obj.title}</p>
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Weight" value={`${obj.weight}%`} darkMode={darkMode} />
        <MiniStat label="Score"  value={obj.calculated_score} darkMode={darkMode} />
        <MiniStat label="Status" value={obj.status_label || '–'} darkMode={darkMode} />
      </div>
    </div>
  );
}
function CompetencyRow({ comp, darkMode }) {
  const gapColor = comp.gap === 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : comp.gap > 0 ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-orange-400' : 'text-orange-600');
  const gapLabel = comp.gap === 0 ? 'Meets' : comp.gap > 0 ? 'Exceeds' : 'Below';
  return (
    <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{comp.competency_name}</p>
        {comp.gap !== undefined && <span className={`text-xs font-semibold ${gapColor}`}>{gapLabel}</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Required" value={comp.required_level} darkMode={darkMode} />
        <MiniStat label="Actual"   value={comp.actual_value}   darkMode={darkMode} />
        <MiniStat label="Gap"      value={comp.gap > 0 ? `+${comp.gap}` : comp.gap} darkMode={darkMode} />
      </div>
    </div>
  );
}
function MiniStat({ label, value, darkMode }) {
  return (
    <div>
      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
function ScoreCard({ darkMode, label, value, color }) {
  return (
    <div className={`p-3 rounded-lg text-center border ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <p className={`text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}