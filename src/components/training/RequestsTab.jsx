import React from 'react';
import { FileText, Eye, Trash2, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

const RequestsTab = ({
  requests,
  statistics,
  loading,
  handleViewRequestDetails,
  handleDeleteRequest,
  requestPagination,
  setRequestPagination,
  darkMode,
  bgCard,
  bgCardHover,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'COMPLETED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': Clock,
      'APPROVED': CheckCircle,
      'REJECTED': XCircle,
      'COMPLETED': CheckCircle
    };
    return icons[status] || Clock;
  };

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: statistics.total, icon: FileText, gradient: 'from-almet-sapphire to-almet-astral' },
            { label: 'Pending', value: statistics.pending, icon: Clock, gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Approved', value: statistics.approved, icon: CheckCircle, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Rejected', value: statistics.rejected, icon: XCircle, gradient: 'from-red-500 to-pink-500' }
          ].map((stat, idx) => (
            <div key={idx} className={`${bgCard} rounded-lg shadow-lg p-3 border ${borderColor} hover:shadow-xl transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textSecondary} mb-1 font-medium`}>{stat.label}</p>
                  <p className={`text-lg font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-lg`}>
                  <stat.icon className="text-white" size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requests */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-almet-sapphire border-t-transparent"></div>
          <p className={`${textMuted} mt-3 text-sm`}>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className={`${bgCard} rounded-lg shadow-lg p-10 text-center border ${borderColor}`}>
          <FileText className={`${textMuted} mx-auto mb-3`} size={44} />
          <h3 className={`text-base font-semibold ${textPrimary} mb-2`}>No training requests</h3>
          <p className={`${textSecondary} text-xs`}>You haven't created any training requests yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map(request => {
              const StatusIcon = getStatusIcon(request.status);
              return (
                <div key={request.id} className={`${bgCard} rounded-lg shadow-lg hover:shadow-xl transition-all p-4 border ${borderColor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                     
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(request.status)}`}>
                          <StatusIcon size={10} />
                          {request.status}
                        </span>
                      <h3 className={`text-sm font-bold ${textPrimary} mb-2 line-clamp-2`}>{request.training_title}</h3>
                      </div>
                      <div className={`text-xs ${textSecondary} space-y-1`}>
                        <div className="flex items-center gap-1.5">
                          <span className={textMuted}>Location:</span>
                          <span className="font-medium">{request.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={textMuted}>Cost:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{request.estimated_cost}</span>
                        </div>
                        {request.preferred_dates_start && (
                          <div className="flex items-center gap-1.5">
                            <span className={textMuted}>Start:</span>
                            <span>{new Date(request.preferred_dates_start).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between pt-3 border-t ${borderColor}`}>
                    <span className={`text-xs ${textMuted}`}>
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleViewRequestDetails(request.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {request.status === 'PENDING' && (
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {requestPagination.total > requestPagination.page_size && (
            <div className="mt-4">
              <Pagination
                currentPage={requestPagination.page}
                totalPages={Math.ceil(requestPagination.total / requestPagination.page_size)}
                totalItems={requestPagination.total}
                itemsPerPage={requestPagination.page_size}
                onPageChange={(page) => setRequestPagination({ ...requestPagination, page })}
                darkMode={darkMode}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RequestsTab;