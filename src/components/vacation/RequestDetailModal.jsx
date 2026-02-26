// components/vacation/RequestDetailModal.jsx - ENHANCED VERSION
import { X, Calendar, User, Clock, CheckCircle, XCircle, FileText, Paperclip, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VacationService } from '@/services/vacationService';

export const RequestDetailModal = ({
  show,
  onClose,
  requestId,
  onAttachmentsClick
}) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && requestId) {
      loadRequestDetail();
    }
  }, [show, requestId]);

  const loadRequestDetail = async () => {
    setLoading(true);
    try {
      const data = await VacationService.getRequestDetail(requestId);
      setRequest(data);
    } catch (error) {
      console.error('Error loading request detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING_LINE_MANAGER':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'PENDING_UK_ADDITIONAL': // ✅ NEW
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700';
      case 'PENDING_HR':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'REJECTED_LINE_MANAGER':
      case 'REJECTED_UK_ADDITIONAL': // ✅ NEW
      case 'REJECTED_HR':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStepStatus = (step) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (step.status === 'rejected') {
      return <XCircle className="w-4 h-4 text-red-600" />;
    } else if (step.status === 'pending') {
      return <Clock className="w-4 h-4 text-amber-600" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire/10 to-transparent dark:from-almet-sapphire/20 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-almet-sapphire" />
              Vacation Request Details
            </h2>
            {request && (
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                Request ID: {request.request_id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-almet-sapphire border-t-transparent"></div>
            </div>
          ) : request ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                  {request.status_display}
                </span>
                {request.attachments && request.attachments.length > 0 && (
                  <button
                    onClick={() => onAttachmentsClick && onAttachmentsClick(request.id, request.request_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-almet-sapphire/10 text-almet-sapphire hover:bg-almet-sapphire/20 rounded-lg transition-all"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    {request.attachments.length} Attachment(s)
                  </button>
                )}
              </div>

              {/* ✅ UK Request Badge */}
              {request.is_uk && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-xs font-semibold text-red-900 dark:text-red-200">UK Employee Request</p>
                      {request.requires_uk_approval && (
                        <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                          This request requires UK Additional Approver (5+ days)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Employee Information */}
              <div className="bg-almet-mystic/20 dark:bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-almet-sapphire" />
                  Employee Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Name</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {request.employee_info?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Employee ID</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {request.employee_info?.employee_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Department</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {request.employee_info?.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Company</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white flex items-center gap-1">
                      {request.employee_info?.business_function}
                  
                    </p>
                  </div>
                </div>
              </div>

              {/* Vacation Details */}
              <div className="bg-almet-mystic/20 dark:bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-almet-sapphire" />
                  Vacation Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Leave Type</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white flex items-center gap-2">
                      {request.vacation_type_detail?.name}
                      {/* ✅ Half Day Badge */}
                      {request.is_half_day && (
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded text-xs font-medium">
                          Half Day
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Duration</p>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {request.number_of_days} {request.number_of_days === 0.5 ? 'half day' : 'days'}
                    </p>
                  </div>
                  
                  {/* ✅ Show Time Range for Half Day */}
                  {request.is_half_day && request.half_day_start_time && request.half_day_end_time && (
                    <>
                      <div>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Start Time</p>
                        <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                          {request.half_day_start_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">End Time</p>
                        <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                          {request.half_day_end_time}
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Start Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {request.start_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">End Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {request.end_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Return Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {request.return_date}
                    </p>
                  </div>
                </div>
                
                {request.comment && (
                  <div className="mt-3 pt-3 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Comment</p>
                    <p className="text-xs text-almet-cloud-burst dark:text-white italic">
                      "{request.comment}"
                    </p>
                  </div>
                )}
              </div>

              {/* ✅ Enhanced Approval Workflow with UK Additional Step */}
              {request.workflow && (
                <div className="bg-almet-mystic/20 dark:bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-almet-sapphire" />
                    Approval Workflow
                  </h3>
                  <div className="space-y-3">
                    {request.workflow.steps?.map((step, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          step.status === 'completed' 
                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30' 
                            : step.status === 'rejected'
                            ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/30'
                            : step.status === 'pending'
                            ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30'
                            : 'bg-gray-50/50 dark:bg-gray-900/10 border-gray-200/50 dark:border-gray-800/30'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getStepStatus(step)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
                              {step.name}
                            </p>
                            {step.approved_at && (
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {new Date(step.approved_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {step.approver && (
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                              Approver: {step.approver}
                            </p>
                          )}
                          {step.comment && (
                            <p className="text-xs text-almet-cloud-burst dark:text-white mt-1 italic">
                              "{step.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {request.rejection_reason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Rejection Reason
                  </h3>
                  <p className="text-xs text-red-800 dark:text-red-300">
                    {request.rejection_reason}
                  </p>
                  {request.rejected_at && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Rejected on: {new Date(request.rejected_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Requester Info */}
              {request.requester_info && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-almet-waterloo dark:text-almet-bali-hai">Requested by: </span>
                      <span className="font-medium text-almet-cloud-burst dark:text-white">
                        {request.requester_info.name}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded font-medium">
                      {request.requester_info.type}
                    </span>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-almet-waterloo dark:text-almet-bali-hai mb-1">Created At</p>
                  <p className="font-medium text-almet-cloud-burst dark:text-white">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-almet-waterloo dark:text-almet-bali-hai mb-1">Last Updated</p>
                  <p className="font-medium text-almet-cloud-burst dark:text-white">
                    {new Date(request.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-6 py-4 flex justify-end bg-almet-mystic/10 dark:bg-gray-900/20 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium border border-almet-mystic dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};