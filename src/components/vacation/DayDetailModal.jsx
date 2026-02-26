// components/vacation/DayDetailModal.jsx
import React from 'react';
import { X, Star, Calendar, User, Briefcase, MapPin, Zap, Clock } from 'lucide-react';

export const DayDetailModal = ({ isOpen, onClose, date, holidays, vacations }) => {
  if (!isOpen) return null;

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (statusCode) => {
    const statusConfig = {
      'APPROVED': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Approved' },
      'PENDING_LINE_MANAGER': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending LM' },
      'PENDING_HR': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Pending HR' },
      'SCHEDULED': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Scheduled' },
      'REGISTERED': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Registered' },
    };
    
    const config = statusConfig[statusCode] || { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-700 dark:text-gray-300', 
      label: statusCode 
    };
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // ✅ NEW: Get type badge (Request vs Schedule)
  const getTypeBadge = (type) => {
    if (type === 'request') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
          <Zap className="w-3 h-3" />
          Immediate
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
          <Clock className="w-3 h-3" />
          Schedule
        </span>
      );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-almet-mystic/30 dark:border-almet-comet/30">
            <div>
              <h2 className="text-xl font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(date)}
              </h2>
              <p className="text-sm text-almet-waterloo dark:text-gray-400 mt-1">
                {holidays?.length || 0} holiday{holidays?.length !== 1 ? 's' : ''} • {vacations?.length || 0} vacation{vacations?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-almet-mystic/20 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-almet-waterloo dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
            {/* No events */}
            {(!holidays || holidays.length === 0) && (!vacations || vacations.length === 0) && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-almet-mystic dark:text-gray-600 mb-4" />
                <p className="text-almet-waterloo dark:text-gray-400">
                  No events on this day
                </p>
              </div>
            )}

            {/* Holidays */}
            {holidays && holidays.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-red-500" />
                  Holidays ({holidays.length})
                </h3>
                <div className="space-y-2">
                  {holidays.map((holiday, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                          <Star className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 dark:text-red-300">
                            {holiday.name}
                          </h4>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                            Public Holiday
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vacations */}
            {vacations && vacations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-almet-sapphire" />
                  Vacations ({vacations.length})
                </h3>
                <div className="space-y-3">
                  {vacations.map((vacation, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-gray-700/50 border border-almet-mystic/30 dark:border-almet-comet/30 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Employee Info & Badges */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg">
                            <User className="w-4 h-4 text-almet-sapphire dark:text-almet-astral" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-almet-cloud-burst dark:text-white">
                              {vacation.employee_name}
                            </h4>
                            <p className="text-xs text-almet-waterloo dark:text-gray-400">
                              {vacation.employee_code || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {/* ✅ Status & Type Badges */}
                        <div className="flex items-center gap-2">
                          {getTypeBadge(vacation.type)}
                          {getStatusBadge(vacation.status_code)}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {/* Vacation Type */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-almet-waterloo dark:text-gray-400" />
                          <div>
                            <p className="text-almet-waterloo dark:text-gray-400">Type</p>
                            <p className="font-medium text-almet-cloud-burst dark:text-white">
                              {vacation.vacation_type}
                            </p>
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-almet-waterloo dark:text-gray-400" />
                          <div>
                            <p className="text-almet-waterloo dark:text-gray-400">Duration</p>
                            <p className="font-medium text-almet-cloud-burst dark:text-white">
                              {vacation.days} day{vacation.days !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Department */}
                        {vacation.department && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-almet-waterloo dark:text-gray-400" />
                            <div>
                              <p className="text-almet-waterloo dark:text-gray-400">Department</p>
                              <p className="font-medium text-almet-cloud-burst dark:text-white">
                                {vacation.department}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Business Function */}
                        {vacation.business_function && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-almet-waterloo dark:text-gray-400" />
                            <div>
                              <p className="text-almet-waterloo dark:text-gray-400">Company</p>
                              <p className="font-medium text-almet-cloud-burst dark:text-white">
                                {vacation.business_function}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Date Range */}
                      <div className="mt-3 pt-3 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                        <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {vacation.start_date} → {vacation.end_date}
                          </span>
                        </div>
                      </div>

                      {/* Request ID - ✅ NEW */}
                      {vacation.request_id && (
                        <div className="mt-2">
                          <span className="text-xs text-almet-waterloo dark:text-gray-400">
                            ID: <span className="font-mono font-medium text-almet-cloud-burst dark:text-white">{vacation.request_id}</span>
                          </span>
                        </div>
                      )}

                      {/* Comment */}
                      {vacation.comment && (
                        <div className="mt-3 pt-3 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                          <p className="text-xs text-almet-waterloo dark:text-gray-400 italic">
                            "{vacation.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-almet-mystic/30 dark:border-almet-comet/30 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-sapphire/90 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DayDetailModal;