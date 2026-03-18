// components/headcount/EmployeeDetailJobDescriptions.jsx
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Clock, CheckCircle, XCircle, AlertCircle, User, Eye, Users,
  RotateCcw, CheckSquare, Download, X, Building, Briefcase, Target,
  Award, Shield, Search, Filter, ChevronDown, UserCheck, UserX as UserVacant,
  ChevronLeft, ChevronRight, Grid3X3, List, SortAsc, SortDesc, RefreshCw,
  BookOpen, Crown, Layers, MessageSquare, Check
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import jobDescriptionService from '@/services/jobDescriptionService';
import JobViewModal from '@/components/jobDescription/JobViewModal';

// ─── tiny status badge (same pattern as JobViewModal) ────────────────────────
const STATUS_MAP = {
  DRAFT:                { label: 'Draft',               cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',        Icon: FileText },
  PENDING_LINE_MANAGER: { label: 'Pending Line Manager', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', Icon: Clock },
  PENDING_EMPLOYEE:     { label: 'Pending Employee',     cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',         Icon: Clock },
  APPROVED:             { label: 'Approved',             cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', Icon: CheckCircle },
  REJECTED:             { label: 'Rejected',             cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',         Icon: XCircle },
  REVISION_REQUIRED:    { label: 'Revision Required',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', Icon: RotateCcw },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.DRAFT;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>
      <Icon size={9} /> {s.label}
    </span>
  );
};

// ─── approval workflow mini-track ─────────────────────────────────────────────
const WorkflowTrack = ({ assignment, textMuted }) => (
  <div className="flex items-center gap-3 text-[10px]">
    <div className="flex items-center gap-1">
      {assignment.line_manager_approved_at
        ? <CheckCircle size={10} className="text-green-500" />
        : <Clock size={10} className="text-amber-500" />}
      <span className={textMuted}>Manager</span>
    </div>
    <div className="h-px w-4 bg-gray-300 dark:bg-gray-600" />
    <div className="flex items-center gap-1">
      {assignment.employee_approved_at
        ? <CheckCircle size={10} className="text-green-500" />
        : <Clock size={10} className="text-amber-500" />}
      <span className={textMuted}>Employee</span>
    </div>
  </div>
);

// ─── comment bubble ───────────────────────────────────────────────────────────
const CommentBubble = ({ who, text, color }) => (
  <div className={`p-2 rounded-lg border text-[10px] leading-relaxed
    ${color === 'blue'
      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'}`}>
    <span className={`font-semibold ${color === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}`}>
      {who}:{' '}
    </span>
    <span className="text-gray-700 dark:text-gray-300 line-clamp-2">{text}</span>
  </div>
);

// ─── ASSIGNMENT CARD ──────────────────────────────────────────────────────────
const AssignmentCard = ({
  assignment, showManagerActions, detailLoading,
  onView, onApprove, onReject,
  bgCard, borderColor, textPrimary, textMuted, bgAccent
}) => {
  const canMgr = showManagerActions && assignment.can_approve_as_manager;
  const canEmp = !showManagerActions && assignment.can_approve_as_employee;
  const isVacant = assignment.is_vacancy;
  const daysPending = assignment.days_pending || 0;

  return (
    <div className={`${bgCard} rounded-xl border ${borderColor} hover:shadow-md transition-shadow overflow-hidden`}>
      {/* colour stripe by status */}
      <div className={`h-1 w-full ${
        assignment.status === 'APPROVED' ? 'bg-green-500' :
        assignment.status === 'REJECTED' ? 'bg-red-500' :
        assignment.status === 'PENDING_LINE_MANAGER' || assignment.status === 'PENDING_EMPLOYEE'
          ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-600'
      }`} />

      <div className="p-4 space-y-3">
        {/* title row */}
        <div className="flex items-start gap-3">
          <div className="bg-almet-sapphire/10 text-almet-sapphire p-2 rounded-lg flex-shrink-0">
            <FileText size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold ${textPrimary} leading-tight line-clamp-2`}
               title={assignment.job_title}>
              {assignment.job_title}
            </p>
            <p className={`text-[10px] ${textMuted} mt-0.5`}>
              {assignment.business_function}{assignment.department ? ` · ${assignment.department}` : ''}
            </p>
          </div>
        </div>

        {/* assignee + status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isVacant
              ? <UserVacant size={11} className="text-orange-500 flex-shrink-0" />
              : <UserCheck size={11} className="text-green-600 flex-shrink-0" />}
            <span className={`text-[10px] ${textMuted} truncate`}>
              {showManagerActions
                ? (isVacant ? 'Vacant' : assignment.employee_name)
                : `Reports to: ${assignment.reports_to_name || 'N/A'}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {daysPending > 0 && (
              <span className={`text-[10px] font-medium
                ${daysPending > 14 ? 'text-red-500' : daysPending > 7 ? 'text-amber-500' : textMuted}`}>
                {daysPending}d
              </span>
            )}
            <StatusBadge status={assignment.status} />
          </div>
        </div>

        {/* workflow track */}
        <WorkflowTrack assignment={assignment} textMuted={textMuted} />

        {/* comments */}
        {(assignment.line_manager_comments || assignment.employee_comments) && (
          <div className="space-y-1.5">
            {assignment.line_manager_comments && (
              <CommentBubble who="Manager" text={assignment.line_manager_comments} color="blue" />
            )}
            {assignment.employee_comments && (
              <CommentBubble who="Employee" text={assignment.employee_comments} color="green" />
            )}
          </div>
        )}

        {/* actions */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-almet-comet">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(assignment.job_description_id)}
              disabled={detailLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-almet-sapphire hover:bg-almet-sapphire/10
                rounded-lg transition-colors text-[10px] font-medium"
            >
              <Eye size={10} /> View
            </button>
            <button
              onClick={() => jobDescriptionService.downloadJobDescriptionPDF(assignment.job_description_id)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-gray-500 hover:bg-gray-100
                dark:hover:bg-almet-comet/40 rounded-lg transition-colors text-[10px] font-medium"
            >
              <Download size={10} /> PDF
            </button>
          </div>

          {(canMgr || canEmp) ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onApprove(assignment, canMgr ? 'approve_manager' : 'approve_employee')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700
                  text-white rounded-lg transition-colors text-[10px] font-medium"
              >
                <CheckSquare size={10} /> Approve
              </button>
              <button
                onClick={() => onReject(assignment)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Reject"
              >
                <XCircle size={12} />
              </button>
            </div>
          ) : (
            <span className={`text-[10px] font-medium px-2 py-1 rounded-lg
              ${assignment.status === 'APPROVED'
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                : `${textMuted} ${bgAccent}`}`}>
              {assignment.status === 'APPROVED' ? '✓ Complete' : 'Pending'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── COMPACT LIST CARD ────────────────────────────────────────────────────────
const CompactCard = ({
  assignment, detailLoading, onView, onApprove, onReject,
  bgCard, borderColor, textPrimary, textMuted
}) => {
  const canMgr = assignment.can_approve_as_manager;
  return (
    <div className={`flex items-center justify-between gap-3 p-3 ${bgCard} rounded-xl border ${borderColor}
      hover:shadow-sm transition-shadow`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="bg-almet-sapphire/10 text-almet-sapphire p-1.5 rounded-lg flex-shrink-0">
          <FileText size={13} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${textPrimary} truncate`}>{assignment.job_title}</p>
          <p className={`text-[10px] ${textMuted} truncate`}>
            {assignment.is_vacancy ? 'Vacant' : assignment.employee_name} · {assignment.department}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={assignment.status} />
        <button onClick={() => onView(assignment.job_description_id)} disabled={detailLoading}
          className="p-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors">
          <Eye size={13} />
        </button>
        {canMgr && (
          <>
            <button onClick={() => onApprove(assignment, 'approve_manager')}
              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
              <CheckSquare size={13} />
            </button>
            <button onClick={() => onReject(assignment)}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <XCircle size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── APPROVAL MODAL ───────────────────────────────────────────────────────────
const ApprovalModal = ({ assignment, type, comments, onChange, onConfirm, onCancel, loading, bgCard, borderColor, textPrimary, textSecondary, textMuted }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
    <div className={`${bgCard} rounded-2xl w-full max-w-md border ${borderColor} shadow-2xl`}>
      <div className="p-5">
        <h3 className={`text-base font-bold ${textPrimary} mb-4`}>
          {type === 'reject' ? '✕ Reject Assignment' : '✓ Approve Assignment'}
        </h3>

        <div className={`p-3 rounded-xl mb-4 bg-gray-50 dark:bg-almet-comet/30 border ${borderColor} space-y-1.5`}>
          <p className={`text-xs font-bold ${textPrimary}`}>{assignment.job_title}</p>
          <div className="flex items-center gap-1.5">
            {assignment.is_vacancy
              ? <UserVacant size={11} className="text-orange-500" />
              : <UserCheck size={11} className="text-green-600" />}
            <span className={`text-[10px] ${textMuted}`}>
              {assignment.is_vacancy ? 'Vacant Position' : assignment.employee_name}
            </span>
          </div>
          <StatusBadge status={assignment.status} />
        </div>

        <div className="mb-5">
          <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
            {type === 'reject' ? 'Reason for rejection *' : 'Comments (optional)'}
          </label>
          <textarea
            value={comments}
            onChange={e => onChange(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2.5 border ${borderColor} rounded-xl bg-white dark:bg-almet-cloud-burst
              ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire resize-none text-xs`}
            placeholder={type === 'reject' ? 'Please provide a reason…' : 'Optional comments…'}
          />
          {type === 'reject' && <p className="text-[10px] text-red-500 mt-1">Required for rejection</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-medium ${textSecondary}
              hover:bg-gray-100 dark:hover:bg-almet-comet/40 transition-colors`}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || (type === 'reject' && !comments.trim())}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors
              disabled:opacity-50 flex items-center gap-2
              ${type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {type === 'reject' ? 'Reject' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const EmployeeDetailJobDescriptions = ({ employeeId, isManager = false }) => {
  const { darkMode } = useTheme();

  // theme vars
  const bgCard      = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const bgCardHover = darkMode ? 'bg-almet-san-juan'    : 'bg-almet-mystic';
  const textPrimary = darkMode ? 'text-white'           : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';
  const textMuted   = darkMode ? 'text-almet-santas-gray' : 'text-almet-bali-hai';
  const borderColor = darkMode ? 'border-almet-comet'   : 'border-gray-200';
  const bgAccent    = darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50';

  const theme = { bgCard, bgCardHover, textPrimary, textSecondary, textMuted, borderColor, bgAccent };

  // data
  const [loading, setLoading]             = useState(true);
  const [myAssignments, setMyAssignments] = useState([]);
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [assignmentsSummary, setAssignmentsSummary] = useState(null);
  const [teamSummary, setTeamSummary]     = useState(null);

  // ui
  const [activeTab, setActiveTab]         = useState('my-jobs');
  const [teamViewMode, setTeamViewMode]   = useState('grid');
  const [showFilters, setShowFilters]     = useState(false);
  const [teamCurrentPage, setTeamCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [teamFilters, setTeamFilters] = useState({
    search: '', status: '', department: '', businessFunction: '',
    vacantOnly: false, pendingOnly: false
  });
  const [teamSorting, setTeamSorting] = useState({ field: 'created_at', order: 'desc' });

  // detail modal — reuse JobViewModal
  const [jobDetail, setJobDetail]         = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // approval modal
  const [approvalState, setApprovalState] = useState({ open: false, assignment: null, type: null });
  const [comments, setComments]           = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${employeeId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMyAssignments(data.job_description_assignments || []);
      setAssignmentsSummary(data.job_description_summary || null);
      if (isManager) {
        setTeamAssignments(data.team_job_description_assignments || []);
        setTeamSummary(data.team_jd_summary || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, [employeeId]);

  const fetchJobDetail = async (jobId) => {
    try {
      setDetailLoading(true);
      const detail = await jobDescriptionService.getJobDescription(jobId);
      setJobDetail(detail);
    } catch (e) {
      console.error(e);
      alert('Error loading job description details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // ── approval ───────────────────────────────────────────────────────────────
  const openApprove = (assignment, type) => setApprovalState({ open: true, assignment, type });
  const openReject  = (assignment) => setApprovalState({ open: true, assignment, type: 'reject' });
  const closeApproval = () => { setApprovalState({ open: false, assignment: null, type: null }); setComments(''); };

  const handleApproval = async () => {
    const { assignment, type } = approvalState;
    try {
      setActionLoading(true);
      const jobId = assignment.job_description_id;
      const aId   = assignment.id;
      if (type === 'approve_manager')
        await jobDescriptionService.approveAssignmentByLineManager(jobId, aId, { comments });
      else if (type === 'approve_employee')
        await jobDescriptionService.approveAssignmentAsEmployee(jobId, aId, { comments });
      else {
        if (!comments.trim()) { alert('Rejection reason required'); return; }
        await jobDescriptionService.rejectAssignment(jobId, aId, { reason: comments });
      }
      await fetchAssignments();
      closeApproval();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || e.message || 'Error processing request.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── team filtering / sorting / pagination ──────────────────────────────────
  const processedTeam = useMemo(() => {
    let r = jobDescriptionService.filterAssignments(teamAssignments, teamFilters);
    r = jobDescriptionService.sortAssignments(r, teamSorting.field, teamSorting.order);
    return r;
  }, [teamAssignments, teamFilters, teamSorting]);

  const paginatedTeam = useMemo(() =>
    jobDescriptionService.paginateAssignments(processedTeam, teamCurrentPage, ITEMS_PER_PAGE),
    [processedTeam, teamCurrentPage]
  );

  const filterOptions = useMemo(() => ({
    statuses:   jobDescriptionService.getUniqueFilterValues(teamAssignments, 'status'),
    departments: jobDescriptionService.getUniqueFilterValues(teamAssignments, 'department'),
  }), [teamAssignments]);

  const setFilter = (key, val) => { setTeamFilters(p => ({ ...p, [key]: val })); setTeamCurrentPage(1); };
  const clearFilters = () => {
    setTeamFilters({ search:'', status:'', department:'', businessFunction:'', vacantOnly:false, pendingOnly:false });
    setTeamCurrentPage(1);
  };
  const toggleSort = (field) =>
    setTeamSorting(p => ({ field, order: p.field === field && p.order === 'asc' ? 'desc' : 'asc' }));

  const myPending   = assignmentsSummary?.pending_employee || 0;
  const teamPending = teamSummary?.pending_line_manager || 0;

  // ── shared card props ──────────────────────────────────────────────────────
  const cardProps = { detailLoading, onView: fetchJobDetail, onApprove: openApprove, onReject: openReject, ...theme };

  if (loading) return (
    <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 dark:bg-almet-comet rounded" style={{ width: `${30+i*20}%` }} />)}
      </div>
    </div>
  );

  return (
    <>
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm`}>
        <div className="p-5">

          {/* header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <Layers size={18} /> Job Description Assignments
              </h2>
              <p className={`text-xs ${textSecondary} mt-0.5`}>
                {assignmentsSummary
                  ? `${assignmentsSummary.total} total · ${assignmentsSummary.approved} approved`
                  : 'Manage your job description assignments'}
              </p>
            </div>
            <button onClick={fetchAssignments}
              className={`p-2 ${textMuted} hover:${textPrimary} hover:bg-gray-100 dark:hover:bg-almet-comet/40
                rounded-lg transition-colors`} title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>

          {/* tab bar (managers only) */}
          {isManager && (
            <div className="flex gap-1 bg-gray-100 dark:bg-almet-comet/50 rounded-xl p-1 mb-5">
              {[
                { id: 'my-jobs',   label: 'My Assignments',   icon: User,  badge: myPending },
                { id: 'team-jobs', label: `Team (${teamSummary?.total || teamAssignments.length})`, icon: Users, badge: teamPending },
              ].map(({ id, label, icon: Icon, badge }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                    text-xs font-semibold transition-all
                    ${activeTab === id
                      ? 'bg-white dark:bg-almet-cloud-burst text-almet-sapphire shadow'
                      : `${textSecondary} hover:${textPrimary}`}`}>
                  <Icon size={13} /> {label}
                  {badge > 0 && (
                    <span className="bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold min-w-[16px] text-center">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── MY ASSIGNMENTS ── */}
          {(!isManager || activeTab === 'my-jobs') && (
            <>
              {myPending > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-amber-50 dark:bg-amber-900/20
                  border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {myPending} assignment{myPending > 1 ? 's' : ''} pending your approval
                  </span>
                </div>
              )}

              {myAssignments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {myAssignments.map(a => (
                    <AssignmentCard key={a.id} assignment={a} showManagerActions={false} {...cardProps} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileText} title="No Assignments" body="You don't have any job description assignments yet."
                  textPrimary={textPrimary} textMuted={textMuted} bgAccent={bgAccent} />
              )}
            </>
          )}

          {/* ── TEAM ASSIGNMENTS ── */}
          {isManager && activeTab === 'team-jobs' && (
            <>
              {/* toolbar */}
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowFilters(p => !p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${borderColor}
                      ${showFilters ? 'bg-almet-sapphire text-white border-almet-sapphire' : `${textPrimary} hover:${bgCardHover}`}`}>
                    <Filter size={12} /> Filters
                    <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* sort buttons */}
                  {[{ f:'created_at', Icon: SortAsc, label:'Date' }, { f:'job_title', Icon: BookOpen, label:'Title' }].map(({ f, Icon, label }) => (
                    <button key={f} onClick={() => toggleSort(f)} title={`Sort by ${label}`}
                      className={`p-1.5 rounded-lg border transition-colors ${borderColor}
                        ${teamSorting.field === f ? 'bg-almet-sapphire text-white border-almet-sapphire' : `${textMuted} hover:${textPrimary}`}`}>
                      <Icon size={13} />
                    </button>
                  ))}
                </div>

                {/* view mode */}
                <div className={`flex border ${borderColor} rounded-lg overflow-hidden`}>
                  {[{ m:'grid', Icon: Grid3X3 }, { m:'list', Icon: List }].map(({ m, Icon }) => (
                    <button key={m} onClick={() => setTeamViewMode(m)}
                      className={`p-1.5 transition-colors ${teamViewMode === m ? 'bg-almet-sapphire text-white' : `${textMuted} hover:${textPrimary}`}`}>
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
              </div>

              {/* filter panel */}
              {showFilters && (
                <div className={`${bgCard} border ${borderColor} rounded-xl p-4 mb-4 space-y-3`}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${textMuted}`} size={12} />
                      <input value={teamFilters.search} onChange={e => setFilter('search', e.target.value)}
                        placeholder="Search…" className={`w-full pl-8 pr-3 py-2 border ${borderColor} rounded-lg
                          ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-xs`} />
                    </div>
                    <select value={teamFilters.status} onChange={e => setFilter('status', e.target.value)}
                      className={`px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-xs`}>
                      <option value="">All Statuses</option>
                      {filterOptions.statuses.map(s => (
                        <option key={s} value={s}>{jobDescriptionService.getStatusInfo(s).label}</option>
                      ))}
                    </select>
                    <select value={teamFilters.department} onChange={e => setFilter('department', e.target.value)}
                      className={`px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-xs`}>
                      <option value="">All Departments</option>
                      {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    {[{ k:'vacantOnly', l:'Vacant only' }, { k:'pendingOnly', l:'Pending only' }].map(({ k, l }) => (
                      <label key={k} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={teamFilters[k]} onChange={e => setFilter(k, e.target.checked)}
                          className="w-3.5 h-3.5 text-almet-sapphire border-gray-300 rounded" />
                        <span className={`text-xs ${textSecondary}`}>{l}</span>
                      </label>
                    ))}
                    {Object.values(teamFilters).some(v => v !== '' && v !== false) && (
                      <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto">
                        Clear all
                      </button>
                    )}
                  </div>
                  <p className={`text-[10px] ${textMuted}`}>
                    {paginatedTeam.totalItems} of {teamAssignments.length} shown
                  </p>
                </div>
              )}

              {teamPending > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-amber-50 dark:bg-amber-900/20
                  border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {teamPending} pending your approval as line manager
                  </span>
                </div>
              )}

              {paginatedTeam.totalItems > 0 ? (
                <>
                  {teamViewMode === 'grid' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {paginatedTeam.items.map(a => (
                        <AssignmentCard key={a.id} assignment={a} showManagerActions {...cardProps} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {paginatedTeam.items.map(a => (
                        <CompactCard key={a.id} assignment={a} {...cardProps} />
                      ))}
                    </div>
                  )}

                  {/* pagination */}
                  {paginatedTeam.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-almet-comet">
                      <span className={`text-xs ${textMuted}`}>
                        {((teamCurrentPage-1)*ITEMS_PER_PAGE)+1}–{Math.min(teamCurrentPage*ITEMS_PER_PAGE, paginatedTeam.totalItems)} of {paginatedTeam.totalItems}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setTeamCurrentPage(p => Math.max(p-1,1))}
                          disabled={!paginatedTeam.hasPreviousPage}
                          className={`p-1.5 border ${borderColor} rounded-lg transition-colors disabled:opacity-40`}>
                          <ChevronLeft size={13} />
                        </button>
                        {Array.from({ length: Math.min(5, paginatedTeam.totalPages) }, (_, i) => {
                          const t = paginatedTeam.totalPages;
                          let p = teamCurrentPage <= 3 ? i+1 : teamCurrentPage >= t-2 ? t-4+i : teamCurrentPage-2+i;
                          return (
                            <button key={p} onClick={() => setTeamCurrentPage(p)}
                              className={`px-2.5 py-1 text-xs border ${borderColor} rounded-lg transition-colors
                                ${teamCurrentPage === p ? 'bg-almet-sapphire text-white border-almet-sapphire' : `${textPrimary} hover:${bgCardHover}`}`}>
                              {p}
                            </button>
                          );
                        })}
                        <button onClick={() => setTeamCurrentPage(p => Math.min(p+1, paginatedTeam.totalPages))}
                          disabled={!paginatedTeam.hasNextPage}
                          className={`p-1.5 border ${borderColor} rounded-lg transition-colors disabled:opacity-40`}>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={processedTeam.length === 0 && teamAssignments.length > 0 ? Filter : Users}
                  title={processedTeam.length === 0 && teamAssignments.length > 0 ? 'No results for these filters' : 'No Team Assignments'}
                  body={processedTeam.length === 0 && teamAssignments.length > 0 ? 'Try adjusting your filters.' : 'No job description assignments for your team yet.'}
                  action={processedTeam.length === 0 && teamAssignments.length > 0 ? { label: 'Clear filters', onClick: clearFilters } : null}
                  textPrimary={textPrimary} textMuted={textMuted} bgAccent={bgAccent}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── JOB DETAIL — reuse JobViewModal ── */}
      {jobDetail && (
        <JobViewModal
          job={jobDetail}
          onClose={() => setJobDetail(null)}
          onDownloadPDF={() => jobDescriptionService.downloadJobDescriptionPDF(jobDetail.id)}
          darkMode={darkMode}
        />
      )}

      {/* ── APPROVAL MODAL ── */}
      {approvalState.open && approvalState.assignment && (
        <ApprovalModal
          assignment={approvalState.assignment}
          type={approvalState.type}
          comments={comments}
          onChange={setComments}
          onConfirm={handleApproval}
          onCancel={closeApproval}
          loading={actionLoading}
          {...theme}
        />
      )}
    </>
  );
};

// ─── empty state helper ───────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, body, action, textPrimary, textMuted, bgAccent }) => (
  <div className="text-center py-12">
    <div className={`w-14 h-14 mx-auto mb-3 ${bgAccent} rounded-2xl flex items-center justify-center`}>
      <Icon className={`h-7 w-7 ${textMuted}`} />
    </div>
    <h3 className={`text-sm font-bold ${textPrimary} mb-1`}>{title}</h3>
    <p className={`text-xs ${textMuted} mb-3`}>{body}</p>
    {action && (
      <button onClick={action.onClick}
        className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg text-xs font-medium hover:bg-almet-astral transition-colors">
        {action.label}
      </button>
    )}
  </div>
);

export default EmployeeDetailJobDescriptions;