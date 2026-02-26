import React from 'react';
import { X, FileText, Eye, Download } from 'lucide-react';

const TrainingDetailModal = ({
  show,
  training,
  onClose,
  handleViewPdf,
  darkMode,
  bgCard,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  if (!show || !training) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-3xl w-full my-6 border ${borderColor}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            Training Details
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
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="px-2.5 py-1 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg text-xs font-semibold">
                {training.training_id}
              </span>
              {training.is_active && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-xs font-semibold">
                  Active
                </span>
              )}
            </div>
            <h4 className={`text-xl font-bold ${textPrimary} mb-2`}>{training.title}</h4>
            <p className={`${textSecondary} text-xs`}>{training.description}</p>
          </div>

          {/* Additional Info */}
          {training.requires_completion && (
            <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${textSecondary}`}>Requires Completion</span>
                {training.completion_deadline_days && (
                  <span className={`text-xs ${textMuted}`}>
                    Deadline: {training.completion_deadline_days} days
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div>
            <h5 className={`text-base font-bold ${textPrimary} mb-3`}>Statistics</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Assignments', value: training.total_assignments || 0, color: 'blue', gradient: 'from-almet-sapphire to-almet-astral' },
                { label: 'Completed', value: training.completed_assignments || 0, color: 'green', gradient: 'from-green-500 to-emerald-500' },
                { label: 'In Progress', value: training.in_progress_assignments || 0, color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
                { label: 'Overdue', value: training.overdue_assignments || 0, color: 'red', gradient: 'from-red-500 to-pink-500' }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-lg p-3 border border-${stat.color}-200 dark:border-${stat.color}-800`}>
                  <div className={`text-xs text-${stat.color}-600 dark:text-${stat.color}-400 font-medium mb-0.5`}>{stat.label}</div>
                  <div className={`text-xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          {training.materials && training.materials.length > 0 && (
            <div>
              <h5 className={`text-base font-bold ${textPrimary} mb-3`}>Training Materials</h5>
              <div className="space-y-2.5">
                {training.materials.map(material => (
                  <div key={material.id} className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="p-2 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg">
                          <FileText size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`text-xs font-semibold ${textPrimary}`}>
                            {material.file_url && material.file_url.split('/').pop()}
                          </div>
                          {material.file_size_display && (
                            <div className={`text-xs ${textMuted} mt-0.5`}>
                              {material.file_size_display}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleViewPdf(material.file_url)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={material.file_url}
                          download
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors inline-flex"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className={`pt-3 border-t ${borderColor}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${textMuted}`}>Created Date</span>
              <span className={`text-xs font-semibold ${textSecondary}`}>
                {new Date(training.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetailModal;