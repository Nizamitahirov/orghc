import React from 'react';
import { Search, Target, Calendar, Eye, Trash2 } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

const AssignmentsTab = ({
  assignments,
  loading,
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleViewAssignmentDetails,
  handleDeleteAssignment,
  assignmentPagination,
  setAssignmentPagination,
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
      'ASSIGNED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'OVERDUE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className={`${bgCard} rounded-lg shadow-lg p-3 border ${borderColor}`}>
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className={`absolute left-2.5 top-2.5 ${textMuted}`} size={16} />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={`w-full pl-9 pr-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs`}
              />
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg transition-all shadow-md hover:shadow-lg text-xs font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-almet-sapphire border-t-transparent"></div>
          <p className={`${textMuted} mt-3 text-sm`}>Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className={`${bgCard} rounded-lg shadow-lg p-10 text-center border ${borderColor}`}>
          <Target className={`${textMuted} mx-auto mb-3`} size={44} />
          <h3 className={`text-base font-semibold ${textPrimary} mb-2`}>No assignments found</h3>
          <p className={`${textSecondary} text-xs`}>Assign trainings to employees to get started</p>
        </div>
      ) : (
        <>
          <div className={`${bgCard} rounded-lg shadow-lg overflow-hidden border ${borderColor}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>Employee</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>Training</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>Status</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>Progress</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>Due Date</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`${bgCard} divide-y divide-gray-200 dark:divide-gray-700`}>
                  {assignments.map(assignment => (
                    <tr key={assignment.id} className={`hover:${bgCardHover} transition-colors`}>
                      <td className="px-4 py-3">
                        <div>
                          <div className={`text-xs font-semibold ${textPrimary}`}>{assignment.employee_name}</div>
                          <div className={`text-xs ${textMuted}`}>{assignment.employee_id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className={`text-xs font-semibold ${textPrimary}`}>{assignment.training_title}</div>
                          <div className={`text-xs ${textMuted}`}>{assignment.training_id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-almet-sapphire to-almet-astral h-2 rounded-full transition-all"
                              style={{ width: `${assignment.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold ${textPrimary} min-w-[40px]`}>
                            {assignment.progress_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-xs ${textPrimary}`}>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className={textMuted} />
                          {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleViewAssignmentDetails(assignment.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {assignmentPagination.total > assignmentPagination.page_size && (
            <Pagination
              currentPage={assignmentPagination.page}
              totalPages={Math.ceil(assignmentPagination.total / assignmentPagination.page_size)}
              totalItems={assignmentPagination.total}
              itemsPerPage={assignmentPagination.page_size}
              onPageChange={(page) => setAssignmentPagination({ ...assignmentPagination, page })}
              darkMode={darkMode}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AssignmentsTab;