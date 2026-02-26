// ============================================
// File: components/vacation/ConflictErrorModal.jsx
// ============================================
import { X, AlertTriangle, Calendar, FileText } from 'lucide-react';

export const ConflictErrorModal = ({ 
  show, 
  onClose, 
  conflicts = [] 
}) => {
  if (!show || !conflicts?.length) return null;

  const getConflictTypeColor = (type) => {
    return type === 'request' 
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700'
      : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-red-200 dark:border-red-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/10 to-transparent dark:from-red-500/20 px-6 py-4 border-b border-red-200 dark:border-red-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">
                Date Conflict Detected
              </h2>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                Selected dates overlap with existing vacation(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Info Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                You cannot create a vacation request for dates that overlap with existing approved 
                or pending requests. Please select different dates.
              </p>
            </div>

            {/* Conflicting Records */}
            <div>
              <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                Conflicting Vacations ({conflicts.length})
              </h3>
              
              <div className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <div 
                    key={index}
                    className="border border-red-200/50 dark:border-red-800/50 rounded-lg p-4 bg-red-50/30 dark:bg-red-900/10"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-900 dark:text-red-200">
                          {conflict.id}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getConflictTypeColor(conflict.type)}`}>
                        {conflict.type === 'request' ? 'Request' : 'Schedule'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-red-700/70 dark:text-red-300/70 mb-1">Vacation Type</p>
                        <p className="font-medium text-red-900 dark:text-red-200">
                          {conflict.vacation_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-red-700/70 dark:text-red-300/70 mb-1">Status</p>
                        <p className="font-medium text-red-900 dark:text-red-200">
                          {conflict.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-red-700/70 dark:text-red-300/70 mb-1">Start Date</p>
                        <p className="font-semibold text-red-900 dark:text-red-200">
                          {conflict.start_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-red-700/70 dark:text-red-300/70 mb-1">End Date</p>
                        <p className="font-semibold text-red-900 dark:text-red-200">
                          {conflict.end_date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestion */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Suggestion
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Please choose dates that don't overlap with the above vacation(s), 
                    or cancel/edit the existing vacation first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-red-200 dark:border-red-800 px-6 py-4 flex justify-end bg-red-50/30 dark:bg-red-900/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};