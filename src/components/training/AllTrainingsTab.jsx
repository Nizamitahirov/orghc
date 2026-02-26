import React from 'react';
import { Search, BookOpen, FileText, Users, Edit, Eye, Trash2 } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import CustomCheckbox from '@/components/common/CustomCheckbox';

const AllTrainingsTab = ({
  trainings,
  statistics,
  loading,
  searchTerm,
  setSearchTerm,
  handleSearch,
  selectedTrainingIds,
  handleToggleTraining,
  handleToggleAllTrainings,
  handleViewDetails,
  handleEditTraining,
  handleDeleteTraining,
  handleAssignSingleTraining,
  pagination,
  setPagination,
  darkMode,
  bgCard,
  bgCardHover,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Total Trainings', value: statistics.overview.total_trainings, icon: BookOpen, gradient: 'from-almet-sapphire to-almet-astral' },
           
            { label: 'Total Assignments', value: statistics.assignments.total, icon: Users, gradient: 'from-almet-steel-blue to-almet-astral' },
            { label: 'Completion Rate', value: `${statistics.assignments.completion_rate}%`, icon: FileText, gradient: 'from-orange-500 to-red-500' }
          ].map((stat, idx) => (
            <div key={idx} className={`${bgCard} rounded-lg shadow-lg p-4 border ${borderColor} hover:shadow-xl transition-all transform hover:-translate-y-1`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-xs ${textSecondary} mb-1 font-medium`}>{stat.label}</p>
                  <p className={`text-xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-lg`}>
                  <stat.icon className="text-white" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <div className={`${bgCard} rounded-lg shadow-lg p-3 border ${borderColor}`}>
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="flex items-center gap-2.5">
            <CustomCheckbox
              checked={trainings.length > 0 && selectedTrainingIds.length === trainings.length}
              onChange={handleToggleAllTrainings}
            />
            <span className={`text-xs ${textSecondary} font-medium`}>Select All</span>
          </div>
          
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className={`absolute left-2.5 top-2.5 ${textMuted}`} size={16} />
              <input
                type="text"
                placeholder="Search trainings..."
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

      {/* Trainings Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-almet-sapphire border-t-transparent"></div>
          <p className={`${textMuted} mt-3 text-sm`}>Loading trainings...</p>
        </div>
      ) : trainings.length === 0 ? (
        <div className={`${bgCard} rounded-lg shadow-lg p-10 text-center border ${borderColor}`}>
          <BookOpen className={`${textMuted} mx-auto mb-3`} size={44} />
          <h3 className={`text-base font-semibold ${textPrimary} mb-2`}>No trainings found</h3>
          <p className={`${textSecondary} text-xs`}>Create your first training to get started</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trainings.map(training => (
              <div key={training.id} className={`${bgCard} rounded-lg shadow-lg hover:shadow-xl transition-all p-4 border ${borderColor} transform hover:-translate-y-1`}>
                <div className="flex items-start gap-2.5 mb-3">
                  <CustomCheckbox
                    checked={selectedTrainingIds.includes(training.id)}
                    onChange={() => handleToggleTraining(training.id)}
                    className="mt-0.5"
                  />
                  
                  <div className="flex-1 min-w-0">
                 
                    <h3 className={`text-sm font-bold ${textPrimary} mb-1.5 line-clamp-2`}>{training.title}</h3>
                    <p className={`${textSecondary} text-xs mb-3 line-clamp-2`}>{training.description}</p>

                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className={`text-xs ${textMuted}`}>Materials</div>
                          <div className={`font-bold ${textPrimary} text-xs`}>{training.materials_count}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                          <Users size={14} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className={`text-xs ${textMuted}`}>Assigned</div>
                          <div className={`font-bold ${textPrimary} text-xs`}>{training.assignments_count}</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs ${textMuted}`}>Completion</span>
                        <span className="text-xs font-bold bg-gradient-to-r from-almet-sapphire to-almet-astral bg-clip-text text-transparent">
                          {training.completion_rate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all"
                          style={{ width: `${training.completion_rate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-2.5 border-t ${borderColor}`}>
                      <span className={`text-xs ${textMuted}`}>
                        {new Date(training.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleAssignSingleTraining(training.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Assign"
                        >
                          <Users size={14} />
                        </button>
                        <button
                          onClick={() => handleEditTraining(training)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleViewDetails(training.id)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTraining(training.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.page_size && (
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.page_size)}
              totalItems={pagination.total}
              itemsPerPage={pagination.page_size}
              onPageChange={(page) => setPagination({ ...pagination, page })}
              darkMode={darkMode}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AllTrainingsTab;