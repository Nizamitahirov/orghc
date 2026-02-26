// ============================================
// File: components/vacation/ScheduleDetailModal.jsx
// ============================================
import { X, Calendar, User, Clock, Edit as EditIcon, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VacationService } from '@/services/vacationService';

export const ScheduleDetailModal = ({
  show,
  onClose,
  scheduleId
}) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && scheduleId) {
      loadScheduleDetail();
    }
  }, [show, scheduleId]);

  const loadScheduleDetail = async () => {
    setLoading(true);
    try {
      const data = await VacationService.getScheduleDetail(scheduleId);
      setSchedule(data);
    } catch (error) {
      console.error('Error loading schedule detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'REGISTERED':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire/10 to-transparent dark:from-almet-sapphire/20 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-almet-sapphire" />
              Schedule Details
            </h2>
            {schedule && (
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                Schedule ID: SCH{schedule.id}
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
          ) : schedule ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(schedule.status)}`}>
                  {schedule.status_display}
                </span>
              </div>

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
                      {schedule.employee_info?.name || schedule.employee_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Employee ID</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {schedule.employee_info?.employee_id || schedule.employee_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Department</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {schedule.employee_info?.department || schedule.department_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Company</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {schedule.employee_info?.business_function || '-'}
                    </p>
                  </div>
                  {schedule.employee_info?.phone && (
                    <div>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Phone</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                        {schedule.employee_info.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Details */}
              <div className="bg-almet-mystic/20 dark:bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-almet-sapphire" />
                  Schedule Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Vacation Type</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {schedule.vacation_type_detail?.name || schedule.vacation_type_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Duration</p>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {schedule.number_of_days} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Start Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {schedule.start_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">End Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {schedule.end_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Return Date</p>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                      {schedule.return_date}
                    </p>
                  </div>
                </div>
                
                {schedule.comment && (
                  <div className="mt-3 pt-3 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Comment</p>
                    <p className="text-xs text-almet-cloud-burst dark:text-white italic">
                      "{schedule.comment}"
                    </p>
                  </div>
                )}
              </div>

              {/* Edit History */}
              {schedule.edit_history && (
                <div className="bg-almet-mystic/20 dark:bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <EditIcon className="w-4 h-4 text-almet-sapphire" />
                    Edit History
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Edit Count</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                        {schedule.edit_history.edit_count} / {schedule.edit_history.max_edits_allowed}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Can Edit</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                        {schedule.edit_history.can_edit ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {schedule.edit_history.last_edited_by && (
                      <>
                        <div>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Last Edited By</p>
                          <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                            {schedule.edit_history.last_edited_by}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Last Edited At</p>
                          <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                            {new Date(schedule.edit_history.last_edited_at).toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Creator Info */}
              {schedule.creator_info && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-almet-waterloo dark:text-almet-bali-hai">Created by: </span>
                      <span className="font-medium text-almet-cloud-burst dark:text-white">
                        {schedule.creator_info.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions */}
              {schedule.permissions && (
                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/50 dark:border-purple-800/30 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-2">Your Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {schedule.permissions.can_edit && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        Can Edit
                      </span>
                    )}
                    {schedule.permissions.can_delete && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                        Can Delete
                      </span>
                    )}
                    {schedule.permissions.can_register && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                        Can Register
                      </span>
                    )}
            
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-almet-waterloo dark:text-almet-bali-hai mb-1">Created At</p>
                  <p className="font-medium text-almet-cloud-burst dark:text-white">
                    {new Date(schedule.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-almet-waterloo dark:text-almet-bali-hai mb-1">Last Updated</p>
                  <p className="font-medium text-almet-cloud-burst dark:text-white">
                    {new Date(schedule.updated_at).toLocaleString()}
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