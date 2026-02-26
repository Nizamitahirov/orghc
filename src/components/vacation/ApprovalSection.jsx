import { Users, Settings, Eye, CheckCircle, XCircle, Lock, Shield, AlertTriangle } from 'lucide-react';

export default function ApprovalSection({
  userAccess,
  pendingRequests,
  approvalHistory,
  handleOpenApprovalModal,
  handleOpenRejectionModal,
  handleViewDetails
}) {
  
  return (
    <div className="space-y-4">
      {/* Access Info Banner */}
      <div className={`rounded-lg border-l-4 p-4 ${
        userAccess.is_admin 
          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-600'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600'
      }`}>
        <div className="flex items-start gap-3">
          <Shield className={`w-5 h-5 flex-shrink-0 ${
            userAccess.is_admin 
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-blue-600 dark:text-blue-400'
          }`} />
          <div>
            <h3 className={`text-sm font-semibold ${
              userAccess.is_admin
                ? 'text-purple-900 dark:text-purple-200'
                : 'text-blue-900 dark:text-blue-200'
            }`}>
              {userAccess.is_admin ? 'Admin Mode Active' : 'Manager Approval Access'}
            </h3>
            <p className={`text-xs mt-1 ${
              userAccess.is_admin
                ? 'text-purple-800 dark:text-purple-300'
                : 'text-blue-800 dark:text-blue-300'
            }`}>
              {userAccess.is_admin 
                ? 'You can approve/reject requests at all stages: Line Manager, UK Additional, and HR.'
                : 'You can approve/reject requests as Line Manager for your team members only.'}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">Pending Approvals</h2>
          <span className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
            {(pendingRequests.line_manager_requests?.length || 0) + 
             (pendingRequests.uk_additional_requests?.length || 0) + 
             (pendingRequests.hr_requests?.length || 0)} Pending
          </span>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Line Manager Approvals */}
          {pendingRequests.line_manager_requests?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-almet-sapphire" />
                Line Manager Approvals ({pendingRequests.line_manager_requests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.line_manager_requests?.map(request => (
                  <div key={request.id} className="border border-almet-mystic/40 dark:border-almet-comet rounded-lg p-4 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                          {request.vacation_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                        </p>
                        {/* ✅ Show if UK request with 5+ days */}
                        {request.is_uk && request.requires_uk_approval && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-700 dark:text-orange-400">
                            <AlertTriangle className="w-3 h-3" />
                            UK request (5+ days) - Additional approver required
                          </div>
                        )}
                        {request.comment && (
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-2 italic">"{request.comment}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(request.id)}
                          className="px-3 py-2 text-xs bg-almet-sapphire/10 text-almet-sapphire rounded-lg hover:bg-almet-sapphire/20 transition-all flex items-center gap-1.5 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                        <button 
                          onClick={() => handleOpenApprovalModal(request)} 
                          className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleOpenRejectionModal(request)} 
                          className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ UK ADDITIONAL APPROVALS */}
          {pendingRequests.uk_additional_requests?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                UK Additional Approvals ({pendingRequests.uk_additional_requests.length})
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-medium">
                  UK 5+ Days
                </span>
              </h3>
              <div className="space-y-3">
                {pendingRequests.uk_additional_requests?.map(request => (
                  <div key={request.id} className="border border-orange-200/60 dark:border-orange-800/40 rounded-lg p-4 bg-orange-50/30 dark:bg-orange-900/10 hover:border-orange-300 dark:hover:border-orange-700 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                          <span className="text-xs bg-orange-100 dark:bg-orange-800/50 px-2 py-0.5 rounded font-medium text-orange-700 dark:text-orange-300">UK Additional</span>
                        </div>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {request.vacation_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                        </p>
                        {request.comment && (
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-2 italic">"{request.comment}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(request.id)}
                          className="px-3 py-2 text-xs bg-almet-sapphire/10 text-almet-sapphire rounded-lg hover:bg-almet-sapphire/20 transition-all flex items-center gap-1.5 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                        <button 
                          onClick={() => handleOpenApprovalModal(request)} 
                          className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleOpenRejectionModal(request)} 
                          className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR Approvals - Only for Admin */}
          {userAccess.is_admin && pendingRequests.hr_requests?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-almet-astral" />
                HR Approvals ({pendingRequests.hr_requests.length})
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-medium">
                  Admin Only
                </span>
              </h3>
              <div className="space-y-3">
                {pendingRequests.hr_requests?.map(request => (
                  <div key={request.id} className="border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                          <span className="text-xs bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded font-medium text-blue-700 dark:text-blue-300">HR Review</span>
                        </div>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {request.vacation_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                        </p>
                        {request.comment && (
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-2 italic">"{request.comment}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(request.id)}
                          className="px-3 py-2 text-xs bg-almet-sapphire/10 text-almet-sapphire rounded-lg hover:bg-almet-sapphire/20 transition-all flex items-center gap-1.5 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                        <button 
                          onClick={() => handleOpenApprovalModal(request)} 
                          className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleOpenRejectionModal(request)} 
                          className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Pending Requests */}
          {(pendingRequests.line_manager_requests?.length === 0 && 
            pendingRequests.uk_additional_requests?.length === 0 &&
            (userAccess.is_admin ? pendingRequests.hr_requests?.length === 0 : true)) && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">No pending approval requests</p>
              <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">All requests have been processed</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
          <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">My Approval History</h2>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
            Requests you have approved or rejected
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
            <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
              <tr>
                {['Request ID', 'Employee', 'Type', 'Period', 'Days', 'Action', 'Comment', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
              {approvalHistory.map((item, index) => (
                <tr key={index} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-almet-sapphire">{item.request_id}</td>
                  <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.employee_name}</td>
                  <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.vacation_type}</td>
                  <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.start_date} - {item.end_date}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{item.days}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      item.action === 'Approved' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai italic max-w-xs truncate">
                    {item.comment || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {approvalHistory.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-sm text-almet-waterloo dark:text-almet-bali-hai">
                    No approval history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}