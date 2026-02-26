// components/JobDescription/AssignmentsModal.jsx - REDESIGNED
import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Filter,
  Search
} from 'lucide-react';

const statusConfig = {
  DRAFT: {
    color: 'bg-almet-mystic text-almet-comet border-almet-bali-hai',
    icon: FileText,
    label: 'Draft',
    bgLight: 'bg-gray-50'
  },
  PENDING_LINE_MANAGER: {
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    label: 'Pending LM',
    bgLight: 'bg-amber-50/50'
  },
  PENDING_EMPLOYEE: {
    color: 'bg-almet-mystic text-almet-sapphire border-almet-steel-blue',
    icon: Clock,
    label: 'Pending Emp',
    bgLight: 'bg-blue-50/50'
  },
  APPROVED: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
    label: 'Approved',
    bgLight: 'bg-emerald-50/50'
  },
  REJECTED: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Rejected',
    bgLight: 'bg-red-50/50'
  },
  REVISION_REQUIRED: {
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: AlertCircle,
    label: 'Revision',
    bgLight: 'bg-purple-50/50'
  }
};

// Assignment Card komponenti
const AssignmentCard = ({ 
  assignment, 
  jobDescriptionId,
  onSubmit, 
  onApprove, 
  onReject, 
  onRemove, 
  onReassign,
  currentUser,
  expanded,
  onToggleExpand 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const config = statusConfig[assignment.status] || statusConfig.DRAFT;
  const StatusIcon = config.icon;

  const isVacancy = assignment.is_vacancy;
  const canSubmit = assignment.status === 'DRAFT' || assignment.status === 'REVISION_REQUIRED';
  const canApproveLM = assignment.can_be_approved_by_line_manager || 
    (assignment.status === 'PENDING_LINE_MANAGER' && assignment.reports_to?.user_id === currentUser?.id);
  const canApproveEmp = assignment.can_be_approved_by_employee || 
    (assignment.status === 'PENDING_EMPLOYEE' && assignment.employee?.user_id === currentUser?.id);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      switch (action) {
        case 'submit':
          await onSubmit(jobDescriptionId, assignment.id, comment);
          break;
        case 'approve_lm':
          await onApprove(jobDescriptionId, assignment.id, 'line_manager', comment);
          break;
        case 'approve_emp':
          await onApprove(jobDescriptionId, assignment.id, 'employee', comment);
          break;
        case 'reject':
          if (!comment.trim()) {
            alert('Please provide a reason for rejection');
            setActionLoading(null);
            return;
          }
          await onReject(jobDescriptionId, assignment.id, comment);
          break;
        case 'remove':
          if (!window.confirm('Are you sure you want to remove this assignment?')) {
            setActionLoading(null);
            return;
          }
          await onRemove(jobDescriptionId, assignment.id);
          break;
      }
      setComment('');
      setShowComments(false);
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden transition-all duration-200 ${config.bgLight} border-l-2 ${config.color.split(' ')[2]}`}>
      {/* Header */}
      <div 
        className="px-3 py-2.5 cursor-pointer hover:bg-white/60 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isVacancy ? (
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <UserX className="w-4 h-4 text-orange-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-almet-mystic flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-almet-sapphire" />
              </div>
            )}
            
            <div>
              <h4 className="text-xs font-medium text-almet-cloud-burst">
                {isVacancy ? (
                  <span className="text-orange-600">
                    VACANT - {assignment.vacancy_position?.position_id || 'Unknown'}
                  </span>
                ) : (
                  assignment.employee_name || assignment.employee?.full_name || 'Unknown'
                )}
              </h4>
              <p className="text-[10px] text-almet-waterloo">
                {!isVacancy && (assignment.employee_id_number || assignment.employee?.employee_id)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.color}`}>
              <StatusIcon className="w-2.5 h-2.5 inline mr-0.5" />
              {config.label}
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-almet-bali-hai" />
            ) : (
              <ChevronDown className="w-4 h-4 text-almet-bali-hai" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t bg-white px-3 py-3 space-y-3">
          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-almet-waterloo">
              <Building2 className="w-3 h-3" />
              <span>Reports to: {assignment.reports_to_name || assignment.reports_to?.full_name || 'N/A'}</span>
            </div>
            
            {!isVacancy && assignment.employee?.email && (
              <div className="flex items-center gap-1.5 text-almet-waterloo">
                <Mail className="w-3 h-3" />
                <span className="truncate">{assignment.employee.email}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-almet-waterloo">
              <Calendar className="w-3 h-3" />
              <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Approval Timeline */}
          {(assignment.line_manager_approved_at || assignment.employee_approved_at) && (
            <div className="bg-almet-mystic/50 rounded p-2 space-y-1.5">
              <h5 className="font-medium text-[10px] text-almet-comet">Approval History</h5>
              
              {assignment.line_manager_approved_at && (
                <div className="flex items-start gap-1.5 text-[10px]">
                  <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-almet-cloud-burst">Line Manager approved</p>
                    <p className="text-almet-waterloo text-[9px]">
                      {new Date(assignment.line_manager_approved_at).toLocaleString()}
                    </p>
                    {assignment.line_manager_comments && (
                      <p className="text-almet-comet text-[9px] mt-0.5 italic">
                        "{assignment.line_manager_comments}"
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {assignment.employee_approved_at && (
                <div className="flex items-start gap-1.5 text-[10px]">
                  <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-almet-cloud-burst">Employee approved</p>
                    <p className="text-almet-waterloo text-[9px]">
                      {new Date(assignment.employee_approved_at).toLocaleString()}
                    </p>
                    {assignment.employee_comments && (
                      <p className="text-almet-comet text-[9px] mt-0.5 italic">
                        "{assignment.employee_comments}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Input */}
          {showComments && (
            <div className="space-y-1.5">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-2 py-1.5 border border-almet-bali-hai/30 rounded text-[11px] focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire"
                rows={2}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-almet-mystic">
            {canSubmit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (showComments) {
                    handleAction('submit');
                  } else {
                    setShowComments(true);
                  }
                }}
                disabled={actionLoading === 'submit'}
                className="flex items-center gap-1 px-2 py-1 bg-almet-sapphire text-white text-[10px] rounded hover:bg-almet-cloud-burst disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'submit' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Submit
              </button>
            )}

            {canApproveLM && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showComments) {
                      handleAction('approve_lm');
                    } else {
                      setShowComments(true);
                    }
                  }}
                  disabled={actionLoading === 'approve_lm'}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-[10px] rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'approve_lm' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showComments && comment.trim()) {
                      handleAction('reject');
                    } else {
                      setShowComments(true);
                    }
                  }}
                  disabled={actionLoading === 'reject'}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'reject' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Reject
                </button>
              </>
            )}

            {canApproveEmp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (showComments) {
                    handleAction('approve_emp');
                  } else {
                    setShowComments(true);
                  }
                }}
                disabled={actionLoading === 'approve_emp'}
                className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-[10px] rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'approve_emp' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                Approve
              </button>
            )}

            {isVacancy && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReassign(assignment.id);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-[10px] rounded hover:bg-orange-600 transition-colors"
              >
                <UserCheck className="w-3 h-3" />
                Assign
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('remove');
              }}
              disabled={actionLoading === 'remove'}
              className="flex items-center gap-1 px-2 py-1 bg-almet-mystic text-almet-comet text-[10px] rounded hover:bg-almet-bali-hai/30 disabled:opacity-50 transition-colors ml-auto"
            >
              {actionLoading === 'remove' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Modal Component
const AssignmentsModal = ({
  isOpen,
  onClose,
  job,
  assignmentsData,
  onSubmitAssignment,
  onSubmitAll,
  onApprove,
  onReject,
  onRemoveAssignment,
  onReassignEmployee,
  onAddAssignments,
  onRefresh,
  currentUser,
  actionLoading = false
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !job || !assignmentsData) return null;

  const assignments = assignmentsData.assignments || [];
  const summary = assignmentsData.assignments_summary || assignmentsData.summary || {
    total: 0,
    employees: 0,
    vacancies: 0,
    approved: 0,
    pending: 0,
    draft: 0
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      (a.employee_name || a.employee?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.employee_id_number || a.employee?.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-almet-cloud-burst/60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-almet-mystic">
            <div>
              <h2 className="text-sm font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Users className="w-4 h-4 text-almet-sapphire" />
                Assignments
              </h2>
              <p className="text-[10px] text-almet-waterloo mt-0.5">
                {job.job_title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-almet-mystic rounded transition-colors"
            >
              <X className="w-4 h-4 text-almet-comet" />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="px-4 py-3 bg-almet-mystic/30 border-b border-almet-mystic">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div className="bg-white rounded p-2 border border-almet-mystic">
                <p className="text-lg font-bold text-almet-cloud-burst">{summary.total}</p>
                <p className="text-[9px] text-almet-waterloo">Total</p>
              </div>
              <div className="bg-white rounded p-2 border border-almet-mystic">
                <p className="text-lg font-bold text-almet-sapphire">{summary.employees}</p>
                <p className="text-[9px] text-almet-waterloo">Employees</p>
              </div>
              <div className="bg-white rounded p-2 border border-almet-mystic">
                <p className="text-lg font-bold text-orange-500">{summary.vacancies}</p>
                <p className="text-[9px] text-almet-waterloo">Vacancies</p>
              </div>
              <div className="bg-white rounded p-2 border border-almet-mystic">
                <p className="text-lg font-bold text-emerald-600">{summary.approved}</p>
                <p className="text-[9px] text-almet-waterloo">Approved</p>
              </div>
              <div className="bg-white rounded p-2 border border-almet-mystic">
                <p className="text-lg font-bold text-amber-500">{summary.pending}</p>
                <p className="text-[9px] text-almet-waterloo">Pending</p>
              </div>
              <div className="bg-white rounded p-2 border border-almet-mystic">
                <p className="text-lg font-bold text-almet-comet">{summary.draft}</p>
                <p className="text-[9px] text-almet-waterloo">Draft</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-2 border-b border-almet-mystic flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-almet-bali-hai" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1.5 border border-almet-bali-hai/30 rounded text-[11px] focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 border border-almet-bali-hai/30 rounded text-[11px] focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_LINE_MANAGER">Pending LM</option>
              <option value="PENDING_EMPLOYEE">Pending Employee</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVISION_REQUIRED">Revision</option>
            </select>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={actionLoading}
                className="p-1.5 hover:bg-almet-mystic rounded transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-almet-comet ${actionLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Assignments List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {actionLoading && assignments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-almet-sapphire animate-spin" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-almet-bali-hai mx-auto mb-2" />
                <p className="text-[11px] text-almet-waterloo">No assignments found</p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="text-almet-sapphire text-[10px] mt-1.5 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  jobDescriptionId={job.id}
                  onSubmit={onSubmitAssignment}
                  onApprove={onApprove}
                  onReject={onReject}
                  onRemove={onRemoveAssignment}
                  onReassign={onReassignEmployee}
                  currentUser={currentUser}
                  expanded={expandedId === assignment.id}
                  onToggleExpand={() => setExpandedId(
                    expandedId === assignment.id ? null : assignment.id
                  )}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-almet-mystic bg-almet-mystic/30">
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-almet-waterloo">
                {filteredAssignments.length} of {assignments.length}
              </p>
              {summary.draft > 0 && onSubmitAll && (
                <button
                  onClick={() => onSubmitAll(job.id)}
                  disabled={actionLoading}
                  className="ml-2 px-3 py-1.5 bg-almet-sapphire text-white text-[10px] rounded hover:bg-almet-cloud-burst disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  Submit All ({summary.draft})
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-almet-mystic text-almet-comet text-[10px] rounded hover:bg-almet-bali-hai/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsModal;