import React from 'react';
import { Clock, Eye, Send } from 'lucide-react';

const PendingApprovalsTab = ({
  pendingApprovals,
  loading,
  handleViewRequestDetails,
  handleApproveReject,
  darkMode,
  bgCard,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-almet-sapphire border-t-transparent"></div>
          <p className={`${textMuted} mt-3 text-sm`}>Loading pending approvals...</p>
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className={`${bgCard} rounded-lg shadow-lg p-10 text-center border ${borderColor}`}>
          <Clock className={`${textMuted} mx-auto mb-3`} size={44} />
          <h3 className={`text-base font-semibold ${textPrimary} mb-2`}>No pending approvals</h3>
          <p className={`${textSecondary} text-xs`}>All training requests have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pendingApprovals.map(request => (
            <div key={request.id} className={`${bgCard} rounded-lg shadow-lg hover:shadow-xl transition-all p-4 border-2 border-yellow-200 dark:border-yellow-800`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Clock size={10} />
                      PENDING
                    </span>
                  <h3 className={`text-sm font-bold ${textPrimary} mb-2 line-clamp-2`}>{request.training_title}</h3>
                  </div>
                  <div className={`text-xs ${textSecondary} space-y-1 mb-3`}>
                    <div className="flex items-center gap-1.5">
                      <span className={textMuted}>Requester:</span>
                      <span className="font-medium">{request.requester_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={textMuted}>Location:</span>
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={textMuted}>Cost:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{request.estimated_cost}</span>
                    </div>
                    {request.participants_count > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className={textMuted}>Participants:</span>
                        <span className="font-semibold">{request.participants_count}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleApproveReject(request.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all text-xs font-medium shadow-md hover:shadow-lg"
                >
                  <Send size={14} />
                  Review
                </button>
                <button
                  onClick={() => handleViewRequestDetails(request.id)}
                  className="px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsTab;