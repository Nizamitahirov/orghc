// components/vacation/RequestDetailModal.jsx

import { X, Calendar, User, Clock, CheckCircle, XCircle, FileText, Paperclip, AlertTriangle, Building2, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VacationService } from '@/services/vacationService';

export const RequestDetailModal = ({ show, onClose, requestId, onAttachmentsClick }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading]  = useState(false);

  useEffect(() => {
    if (show && requestId) {
      setRequest(null);
      setLoading(true);
      VacationService.getRequestDetail(requestId)
        .then(setRequest)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [show, requestId]);

  if (!show) return null;

  const getStatusStyle = (status = '') => {
    switch (status) {
      case 'PENDING_LINE_MANAGER':    return { cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800', label: 'Waiting for Line Manager' };
      case 'PENDING_UK_ADDITIONAL':   return { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',   label: 'Waiting for UK Approver' };
      case 'PENDING_HR':              return { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',           label: 'Waiting for HR' };
      case 'APPROVED':                return { cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',     label: 'Approved' };
      case 'REJECTED_LINE_MANAGER':
      case 'REJECTED_UK_ADDITIONAL':
      case 'REJECTED_HR':             return { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',                 label: 'Rejected' };
      default:                        return { cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',               label: status };
    }
  };

  const getStepIcon = step => {
    if (step.status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (step.status === 'rejected')  return <XCircle    className="w-4 h-4 text-red-500"   />;
    if (step.status === 'pending')   return <Clock      className="w-4 h-4 text-amber-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-almet-bali-hai/40 dark:border-almet-comet" />;
  };

  const statusInfo = request ? getStatusStyle(request.status) : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-almet-cloud-burst dark:text-white">Vacation Request</h2>
              {request && (
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5 font-mono">
                  {request.request_id}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
            </div>
          ) : request ? (
            <>
              {/* Status + attachment row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${statusInfo?.cls}`}>
                  {statusInfo?.label}
                </span>
                <div className="flex items-center gap-2">
                  {request.is_uk && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium rounded-full border border-red-200 dark:border-red-800">
                      <AlertTriangle className="w-3 h-3" /> UK Employee
                    </span>
                  )}
                  {request.attachments?.length > 0 && (
                    <button
                      onClick={() => onAttachmentsClick?.(request.id, request.request_id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-almet-sapphire/10 text-almet-sapphire hover:bg-almet-sapphire/20 rounded-lg transition-all"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      {request.attachments.length} File{request.attachments.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>

              {/* Employee info */}
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4">
                <p className="text-xs font-bold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-almet-sapphire" /> Employee
                </p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {[
                    { label: 'Name',       value: request.employee_info?.name },
                    { label: 'ID',         value: request.employee_info?.employee_id },
                    { label: 'Department', value: request.employee_info?.department },
                    { label: 'Company',    value: request.employee_info?.business_function },
                  ].map(f => f.value ? (
                    <div key={f.label}>
                      <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">{f.label}</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white mt-0.5">{f.value}</p>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Vacation details */}
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4">
                <p className="text-xs font-bold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-almet-sapphire" /> Vacation Details
                </p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">Leave Type</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{request.vacation_type_detail?.name}</p>
                      {request.is_half_day && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300 rounded text-[10px] font-medium">Half Day</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">Duration</p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-0.5">
                      {request.number_of_days} {request.number_of_days === 0.5 ? 'half day' : 'day(s)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">Start Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white mt-0.5">{request.start_date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">End Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white mt-0.5">{request.end_date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">Return Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white mt-0.5">{request.return_date}</p>
                  </div>
                  {request.is_half_day && request.half_day_start_time && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">Time</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white mt-0.5">
                        {request.half_day_start_time} – {request.half_day_end_time}
                      </p>
                    </div>
                  )}
                </div>
                {request.comment && (
                  <div className="mt-3 pt-3 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                    <p className="text-[10px] uppercase tracking-wide text-almet-waterloo dark:text-almet-bali-hai">Employee Note</p>
                    <p className="text-xs text-almet-cloud-burst dark:text-white mt-0.5 italic">"{request.comment}"</p>
                  </div>
                )}
              </div>

              {/* Approval workflow */}
              {request.workflow?.steps?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-almet-sapphire" /> Approval Progress
                  </p>
                  <div className="space-y-2">
                    {request.workflow.steps.map((step, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                        step.status === 'completed' ? 'bg-green-50/60 dark:bg-green-900/10 border-green-200/60 dark:border-green-800/30'
                        : step.status === 'rejected' ? 'bg-red-50/60 dark:bg-red-900/10 border-red-200/60 dark:border-red-800/30'
                        : step.status === 'pending'  ? 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-700/20 border-gray-200/40 dark:border-gray-700/40'
                      }`}>
                        <div className="mt-0.5 flex-shrink-0">{getStepIcon(step)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{step.name}</p>
                            {step.approved_at && (
                              <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai whitespace-nowrap">
                                {new Date(step.approved_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {step.approver && (
                            <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                              {step.approver}
                            </p>
                          )}
                          {step.comment && (
                            <p className="text-[10px] text-almet-cloud-burst dark:text-white mt-1 italic">
                              "{step.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {request.rejection_reason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-900 dark:text-red-200 mb-1 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5" /> Rejection Reason
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">{request.rejection_reason}</p>
                </div>
              )}

              {/* Submitted by */}
              {request.requester_info && (
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  Submitted by <strong className="text-almet-cloud-burst dark:text-white">{request.requester_info.name}</strong>
                  {' '}· {new Date(request.created_at).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16">
              <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30" />
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No data available</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-6 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 text-sm font-medium border border-almet-mystic dark:border-almet-comet rounded-xl text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};