// src/components/jobCatalog/MatrixView.jsx

import React, { useState } from 'react';
import { Users, Loader2, Maximize2, Minimize2, X, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';

export default function MatrixView({ context }) {
  const {
    matrixView, setMatrixView,
    matrixData, jobCatalogData, departments, jobFunctions, 
    businessFunctions, positionGroups, loading, setSelectedJob
  } = context;

  const { darkMode } = useTheme();
  const [isCompactView, setIsCompactView] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  const columns = matrixView === 'department' ? departments.map(d => d.label || d.name) : 
                 matrixView === 'function' ? jobFunctions.map(jf => jf.label || jf.name) : 
                 businessFunctions.map(bf => bf.label || bf.name);

  const getTotalEmployees = (jobs) => {
    return jobs.reduce((sum, job) => sum + (job.currentEmployees || 0), 0);
  };

  const openJobsModal = (hierarchyName, columnName, jobs) => {
    setSelectedCell({ hierarchyName, columnName, jobs });
  };

  const closeModal = () => {
    setSelectedCell(null);
  };

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow-sm border border-gray-200 dark:border-almet-comet">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Hierarchy Matrix</h2>
            <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
              Distribution of jobs by hierarchy levels
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCompactView(!isCompactView)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-almet-comet transition-colors"
            >
              {isCompactView ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              {isCompactView ? 'Expand' : 'Compact'}
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700 dark:text-almet-bali-hai">
                View by:
              </label>
              <select
                value={matrixView}
                onChange={(e) => setMatrixView(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              >
                <option value="department">Department</option>
                <option value="function">Job Function</option>
                <option value="unit">Company</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading.hierarchy ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai text-xs">Loading matrix...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-50 dark:bg-almet-san-juan border border-gray-300 dark:border-almet-comet p-2 text-left font-semibold text-gray-900 dark:text-white text-xs min-w-[140px] z-10">
                    Hierarchy
                  </th>
                  {columns.map((col, colIndex) => (
                    <th key={`col-${colIndex}-${col}`} className="border border-gray-300 dark:border-almet-comet p-2 text-center font-medium text-gray-900 dark:text-white text-[10px] min-w-[100px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positionGroups.map(pg => {
                  const hierarchyName = pg.label || pg.name;
                  const hierarchyId = pg.value || pg.id;
                  const colors = getHierarchyColor(hierarchyName, darkMode);
                  
                  return (
                    <tr key={hierarchyId}>
                      <td 
                        className="sticky left-0 border border-gray-300 dark:border-almet-comet p-2 font-medium text-xs min-w-[140px] z-10"
                        style={{ 
                          backgroundColor: colors.backgroundColor
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colors.borderColor }}
                          />
                          <span style={{ color: colors.textColor }} className="truncate">
                            {hierarchyName}
                          </span>
                        </div>
                      </td>
                      {columns.map((col, colIndex) => {
                        const jobs = matrixData[hierarchyName]?.[col] || [];
                        const totalEmployees = getTotalEmployees(jobs);
                        
                        return (
                          <td key={`${hierarchyId}-${colIndex}-${col}`} className="border border-gray-300 dark:border-almet-comet p-1.5 text-center align-top">
                            {jobs.length > 0 ? (
                              <div>
                                {isCompactView ? (
                                  // Compact view - sadəcə say
                                  <div className="bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue text-xs px-2 py-1.5 rounded border border-almet-sapphire/20">
                                    <div className="flex items-center justify-center gap-1">
                                      <Users size={10} />
                                      <span className="font-semibold">{totalEmployees}</span>
                                      <span className="text-[9px] opacity-75">({jobs.length})</span>
                                    </div>
                                  </div>
                                ) : (
                                  // Expanded view - maksimum 3 iş göstər, qalanı düyməylə
                                  <div className="space-y-1">
                                    {jobs.slice(0, 3).map((job, jobIndex) => (
                                      <div 
                                        key={`${job.id}-${jobIndex}`}
                                        className="bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue text-[10px] p-1 rounded cursor-pointer hover:bg-almet-sapphire/20 dark:hover:bg-almet-sapphire/30 transition-colors border border-almet-sapphire/20"
                                        onClick={() => setSelectedJob(job)}
                                        title={job.title}
                                      >
                                        <div className="font-medium truncate mb-0.5 text-left px-0.5">{job.title}</div>
                                        <div className="flex items-center justify-center gap-0.5 text-[9px] opacity-75">
                                          <Users size={8} />
                                          <span>{job.currentEmployees}</span>
                                        </div>
                                      </div>
                                    ))}
                                    {jobs.length > 3 && (
                                      <button
                                        onClick={() => openJobsModal(hierarchyName, col, jobs)}
                                        className="w-full bg-almet-sapphire/5 dark:bg-almet-sapphire/10 text-almet-sapphire dark:text-almet-steel-blue text-[10px] px-2 py-1 rounded hover:bg-almet-sapphire/15 dark:hover:bg-almet-sapphire/20 transition-colors border border-dashed border-almet-sapphire/30 flex items-center justify-center gap-1"
                                      >
                                        <ChevronDown size={10} />
                                        <span>+{jobs.length - 3} more</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-almet-bali-hai text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-almet-san-juan rounded-lg border border-gray-200 dark:border-almet-comet">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {jobCatalogData.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-almet-bali-hai">Total Jobs</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {jobCatalogData.reduce((sum, job) => sum + (job.currentEmployees || 0), 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-almet-bali-hai">Total Employees</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {positionGroups.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-almet-bali-hai">Hierarchy Levels</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {columns.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-almet-bali-hai">
                  {matrixView === 'department' ? 'Departments' : 
                   matrixView === 'function' ? 'Job Functions' : 'Companys'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-gray-200 dark:border-almet-comet p-4 flex justify-between items-start">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {selectedCell.hierarchyName} - {selectedCell.columnName}
                </h3>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mt-1">
                  {selectedCell.jobs.length} jobs, {getTotalEmployees(selectedCell.jobs)} employees
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCell.jobs.map((job, index) => (
                  <div
                    key={`${job.id}-${index}`}
                    className="bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue p-3 rounded-lg cursor-pointer hover:bg-almet-sapphire/20 dark:hover:bg-almet-sapphire/30 transition-colors border border-almet-sapphire/20"
                    onClick={() => {
                      setSelectedJob(job);
                      closeModal();
                    }}
                  >
                    <div className="font-medium text-sm mb-2">{job.title}</div>
                    <div className="flex items-center gap-1.5 text-xs opacity-75">
                      <Users size={12} />
                      <span>{job.currentEmployees} employee{job.currentEmployees !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}