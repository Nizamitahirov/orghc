// ResignationDetailModal.jsx
'use client';
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Download, MessageSquare, User, Briefcase, Calendar, Building2 } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ResignationDetailModal({ resignation, onClose, onSuccess, userRole }) {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [action, setAction] = useState('');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  const canApprove = () => {
    if (userRole?.is_admin) return true;
    if (userRole?.is_manager && resignation.status === 'PENDING_MANAGER') return true;
    return false;
  };

  const canHRApprove = () => {
    return userRole?.is_admin || resignation.status === 'PENDING_HR';
  };

  const handleApproval = async () => {
    if (!action) return;

    try {
      setProcessing(true);

      if (resignation.status === 'PENDING_MANAGER') {
        await resignationExitService.resignation.managerApprove(resignation.id, action, comments);
      } else if (resignation.status === 'PENDING_HR') {
        await resignationExitService.resignation.hrApprove(resignation.id, action, comments);
      }

      alert(`Resignation ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error processing resignation:', err);
      alert('Failed to process resignation. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const InfoItem = ({ label, value, icon: Icon }) => (
    <div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</p>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      'PENDING_MANAGER': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      'MANAGER_APPROVED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'MANAGER_REJECTED': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'PENDING_HR': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      'HR_APPROVED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'HR_REJECTED': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'COMPLETED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        {resignationExitService.helpers.getStatusText(status)}
      </span>
    );
  };

  const showApprovalButtons = (canApprove() || canHRApprove()) && !showApprovalForm;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Resignation Details</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {resignation.employee_name} • {resignation.employee_id}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Employee Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={16} className="text-almet-sapphire" />
              Employee Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem label="Name" value={resignation.employee_name} icon={User} />
              <InfoItem label="Employee ID" value={resignation.employee_id} />
              <InfoItem label="Position" value={resignation.position} icon={Briefcase} />
              <InfoItem label="Department" value={resignation.department} icon={Building2} />
            </div>
          </div>

          {/* Resignation Details */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText size={16} className="text-almet-sapphire" />
              Resignation Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <InfoItem 
                label="Submission Date" 
                value={resignationExitService.helpers.formatDate(resignation.submission_date)}
                icon={Calendar}
              />
              <InfoItem 
                label="Last Working Day" 
                value={resignationExitService.helpers.formatDate(resignation.last_working_day)}
                icon={Calendar}
              />
              <InfoItem 
                label="Notice Period" 
                value={`${resignation.notice_period} days`}
              />
              <InfoItem 
                label="Days Remaining" 
                value={`${resignation.days_remaining} days`}
              />
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <StatusBadge status={resignation.status} />
            </div>
          </div>

          {/* Employee Comments */}
          {resignation.employee_comments && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                Employee Comments
              </h3>
              <p className="text-sm text-gray-900 dark:text-gray-100">{resignation.employee_comments}</p>
            </div>
          )}

          {/* Attached Document */}
          {resignation.resignation_letter && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Attached Document</h3>
              <a 
                href={resignation.resignation_letter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-almet-sapphire hover:text-almet-astral transition-colors"
              >
                <FileText size={16} />
                View Resignation Letter
                <Download size={14} />
              </a>
            </div>
          )}

          {/* Manager Decision */}
          {resignation.manager_approved_at && (
            <div className={`rounded-lg p-4 border ${
              resignation.status === 'MANAGER_REJECTED' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                {resignation.status === 'MANAGER_REJECTED' ? (
                  <XCircle size={16} className="text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                )}
                Manager Decision
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <InfoItem label="Decision By" value={resignation.manager_approved_by_name} />
                <InfoItem label="Decision Date" value={resignationExitService.helpers.formatDate(resignation.manager_approved_at)} />
              </div>
              {resignation.manager_comments && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Comments:</p>
                  <p className="text-sm text-gray-900 dark:text-white">{resignation.manager_comments}</p>
                </div>
              )}
            </div>
          )}

          {/* HR Decision */}
          {resignation.hr_approved_at && (
            <div className={`rounded-lg p-4 border ${
              resignation.status === 'HR_REJECTED' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                {resignation.status === 'HR_REJECTED' ? (
                  <XCircle size={16} className="text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                )}
                HR Decision
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <InfoItem label="Decision By" value={resignation.hr_approved_by_name} />
                <InfoItem label="Decision Date" value={resignationExitService.helpers.formatDate(resignation.hr_approved_at)} />
              </div>
              {resignation.hr_comments && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Comments:</p>
                  <p className="text-sm text-gray-900 dark:text-white">{resignation.hr_comments}</p>
                </div>
              )}
            </div>
          )}

          {/* Approval Actions */}
          {showApprovalButtons && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                This resignation requires your approval
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setAction('approve'); setShowApprovalForm(true); }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Approve Resignation
                </button>
                <button
                  onClick={() => { setAction('reject'); setShowApprovalForm(true); }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Reject Resignation
                </button>
              </div>
            </div>
          )}

          {/* Approval Form */}
          {showApprovalForm && (
            <div className={`rounded-lg p-4 border-2 ${
              action === 'approve' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
            }`}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {action === 'approve' ? 'Approve Resignation' : 'Reject Resignation'}
              </h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="Add your comments here..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowApprovalForm(false); setAction(''); setComments(''); }}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${
                    action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {action === 'approve' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}