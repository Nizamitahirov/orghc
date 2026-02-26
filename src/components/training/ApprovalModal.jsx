// components/training-requests/ApprovalModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ApprovalModal = ({
  show,
  request,
  onClose,
  onSuccess,
  trainingService,
  toast,
  darkMode,
  bgCard,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  if (!show || !request) return null;

  const handleSubmit = async () => {
    if (!decision) {
      toast.showError('Please select Approve or Reject');
      return;
    }
    if (decision === 'REJECTED' && !comments.trim()) {
      toast.showError('Comments are required when rejecting a request');
      return;
    }

    setSubmitLoading(true);
    try {
      await trainingService.requests.approveReject(request.id, {
        status: decision,
        manager_comments: comments
      });
      
      toast.showSuccess(`Training request ${decision.toLowerCase()} successfully!`);
      onClose();
      setDecision('');
      setComments('');
      onSuccess();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.showError('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-2xl w-full my-6 border ${borderColor}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
            <AlertCircle size={20} className="text-yellow-500" />
            Review Training Request
          </h3>
          <button
            onClick={onClose}
            className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Request Summary */}
          <div className={`p-4 rounded-lg border ${borderColor} bg-blue-50 dark:bg-blue-900/20`}>
            <div className="space-y-2">
         
              <h4 className={`text-base font-bold ${textPrimary}`}>{request.training_title}</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className={textMuted}>Requester:</span>
                  <span className={`ml-1 font-semibold ${textPrimary}`}>{request.requester_name}</span>
                </div>
                <div>
                  <span className={textMuted}>Cost:</span>
                  <span className="ml-1 font-bold text-green-600 dark:text-green-400">{request.estimated_cost}</span>
                </div>
                <div>
                  <span className={textMuted}>Duration:</span>
                  <span className={`ml-1 ${textSecondary}`}>{request.duration}</span>
                </div>
                <div>
                  <span className={textMuted}>Location:</span>
                  <span className={`ml-1 ${textSecondary}`}>{request.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className={`text-xs ${textMuted} font-medium mb-1.5 block`}>Purpose/Justification</label>
            <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg ${textSecondary} text-xs border ${borderColor} max-h-24 overflow-y-auto`}>
              {request.purpose_justification}
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className={`text-xs ${textMuted} font-medium mb-1.5 block`}>Learning Objectives</label>
            <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg ${textSecondary} text-xs border ${borderColor} max-h-24 overflow-y-auto`}>
              {request.learning_objectives}
            </div>
          </div>

          {/* Expected Benefits */}
          <div>
            <label className={`text-xs ${textMuted} font-medium mb-1.5 block`}>Expected Benefits</label>
            <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg ${textSecondary} text-xs border ${borderColor} max-h-24 overflow-y-auto`}>
              {request.expected_benefits}
            </div>
          </div>

          {/* Decision Buttons */}
          <div className={`border-t ${borderColor} pt-4`}>
            <label className={`block text-xs font-semibold ${textSecondary} mb-2`}>
              Your Decision *
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setDecision('APPROVED')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  decision === 'APPROVED'
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400'
                    : `${borderColor} hover:border-green-300 dark:hover:border-green-700`
                }`}
              >
                <CheckCircle size={18} className={decision === 'APPROVED' ? 'text-green-600 dark:text-green-400' : textMuted} />
                <span className={`text-sm font-semibold ${decision === 'APPROVED' ? 'text-green-700 dark:text-green-300' : textPrimary}`}>
                  Approve
                </span>
              </button>

              <button
                onClick={() => setDecision('REJECTED')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  decision === 'REJECTED'
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400'
                    : `${borderColor} hover:border-red-300 dark:hover:border-red-700`
                }`}
              >
                <XCircle size={18} className={decision === 'REJECTED' ? 'text-red-600 dark:text-red-400' : textMuted} />
                <span className={`text-sm font-semibold ${decision === 'REJECTED' ? 'text-red-700 dark:text-red-300' : textPrimary}`}>
                  Reject
                </span>
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
              Comments {decision === 'REJECTED' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs`}
              placeholder={decision === 'REJECTED' 
                ? "Please provide a reason for rejection..." 
                : "Add any comments or feedback..."
              }
            />
            {decision === 'REJECTED' && !comments.trim() && (
              <p className="mt-1 text-xs text-red-600">Comments are required when rejecting a request</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${borderColor}`}>
            <button
              onClick={onClose}
              className={`px-5 py-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-xs font-medium`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitLoading || !decision || (decision === 'REJECTED' && !comments.trim())}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium ${
                decision === 'APPROVED'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  : decision === 'REJECTED'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  {decision === 'APPROVED' ? (
                    <>
                      <CheckCircle size={16} />
                      Approve Request
                    </>
                  ) : decision === 'REJECTED' ? (
                    <>
                      <XCircle size={16} />
                      Reject Request
                    </>
                  ) : (
                    'Submit Decision'
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;