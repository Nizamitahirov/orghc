// components/training-requests/RequestDetailModal.jsx
import React from 'react';
import { X, User, Calendar, MapPin, DollarSign, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const RequestDetailModal = ({
  show,
  request,
  onClose,
  darkMode,
  bgCard,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  if (!show || !request) return null;

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      'COMPLETED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': Clock,
      'APPROVED': CheckCircle,
      'REJECTED': XCircle,
      'COMPLETED': CheckCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon size={16} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-3xl w-full my-6 border ${borderColor}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${borderColor} sticky top-0 ${bgCard} z-10`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            Training Request Details
          </h3>
          <button
            onClick={onClose}
            className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Header Info */}
          <div className={`p-4 rounded-lg border-2 `}>
            <div className="flex items-start justify-between ">
              <div>
                <div className="flex items-center gap-2 ">
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status}
                  </span>
                <h4 className={`text-lg font-bold ${textPrimary} `}>{request.training_title}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Requester Information */}
          <div>
            <h5 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
              <User size={16} />
              Requester Information
            </h5>
            <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg p-4 space-y-2 border ${borderColor}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textMuted}`}>Name</span>
                <span className={`text-xs font-semibold ${textPrimary}`}>{request.requester_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textMuted}`}>Employee ID</span>
                <span className={`text-xs font-semibold ${textPrimary}`}>{request.requester_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textMuted}`}>Position</span>
                <span className={`text-xs ${textSecondary}`}>{request.requester_position}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textMuted}`}>Department</span>
                <span className={`text-xs ${textSecondary}`}>{request.requester_department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textMuted}`}>Email</span>
                <a href={`mailto:${request.requester_email}`} className="text-xs text-blue-600 hover:underline">
                  {request.requester_email}
                </a>
              </div>
            </div>
          </div>

          {/* Training Program Details */}
          <div>
            <h5 className={`text-sm font-bold ${textPrimary} mb-3`}>Training Program Details</h5>
            <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg p-4 space-y-3 border ${borderColor}`}>
              {request.training_provider && (
                <div>
                  <label className={`text-xs ${textMuted} font-medium mb-1 block`}>Training Provider</label>
                  <p className={`text-xs ${textSecondary}`}>{request.training_provider}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {request.preferred_dates_start && (
                  <div>
                    <label className={`text-xs ${textMuted} font-medium mb-1  flex items-center gap-1`}>
                      <Calendar size={12} />
                      Preferred Start
                    </label>
                    <p className={`text-xs font-semibold ${textPrimary}`}>
                      {new Date(request.preferred_dates_start).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {request.preferred_dates_end && (
                  <div>
                    <label className={`text-xs ${textMuted} font-medium mb-1  flex items-center gap-1`}>
                      <Calendar size={12} />
                      Preferred End
                    </label>
                    <p className={`text-xs font-semibold ${textPrimary}`}>
                      {new Date(request.preferred_dates_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs ${textMuted} font-medium mb-1  flex items-center gap-1`}>
                    <Clock size={12} />
                    Duration
                  </label>
                  <p className={`text-xs font-semibold ${textPrimary}`}>{request.duration}</p>
                </div>
                <div>
                  <label className={`text-xs ${textMuted} font-medium mb-1  flex items-center gap-1`}>
                    <DollarSign size={12} />
                    Estimated Cost
                  </label>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400">{request.estimated_cost}</p>
                </div>
              </div>

              <div>
                <label className={`text-xs ${textMuted} font-medium mb-1  flex items-center gap-1`}>
                  <MapPin size={12} />
                  Location
                </label>
                <p className={`text-xs ${textSecondary}`}>{request.location}</p>
              </div>
            </div>
          </div>

          {/* Purpose & Justification */}
          <div>
            <label className={`text-xs ${textMuted} font-medium mb-1.5 block`}>Purpose/Justification</label>
            <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg ${textSecondary} text-xs border ${borderColor}`}>
              {request.purpose_justification}
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className={`text-xs ${textMuted} font-medium mb-1.5 block`}>Learning Objectives</label>
            <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg ${textSecondary} text-xs border ${borderColor}`}>
              {request.learning_objectives}
            </div>
          </div>

          {/* Expected Benefits */}
          <div>
            <label className={`text-xs ${textMuted} font-medium mb-1.5 block`}>Expected Benefits</label>
            <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg ${textSecondary} text-xs border ${borderColor}`}>
              {request.expected_benefits}
            </div>
          </div>

          {/* Participants */}
          {request.participants && request.participants.length > 0 && (
            <div>
              <h5 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                <Users size={16} />
                Participants ({request.participants.length})
              </h5>
              <div className="space-y-2">
                {request.participants.map((participant) => (
                  <div key={participant.id} className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-xs font-semibold ${textPrimary}`}>{participant.employee_name}</div>
                        <div className={`text-xs ${textMuted}`}>{participant.employee_id_display}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs ${textSecondary}`}>{participant.position}</div>
                        <a href={`mailto:${participant.email}`} className="text-xs text-blue-600 hover:underline">
                          {participant.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manager Approval */}
          {request.status !== 'PENDING' && (
            <div className={`border-t ${borderColor} pt-4`}>
              <h5 className={`text-sm font-bold ${textPrimary} mb-3`}>Manager Approval</h5>
              <div className={`p-4 rounded-lg border-2 ${getStatusColor(request.status)}`}>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textMuted}`}>Manager</span>
                    <span className={`text-xs font-semibold ${textPrimary}`}>{request.manager_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textMuted}`}>Decision Date</span>
                    <span className={`text-xs ${textSecondary}`}>
                      {new Date(request.approved_rejected_date).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {request.manager_comments && (
                  <div>
                    <label className={`text-xs ${textMuted} font-medium mb-1 block`}>Comments</label>
                    <div className={`p-2 bg-white dark:bg-almet-cloud-burst rounded ${textSecondary} text-xs`}>
                      {request.manager_comments}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className={`pt-3 border-t ${borderColor}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${textMuted}`}>Created Date</span>
              <span className={`text-xs font-semibold ${textSecondary}`}>
                {new Date(request.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;