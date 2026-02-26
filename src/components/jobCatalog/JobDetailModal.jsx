// src/components/jobCatalog/JobDetailModal.jsx

import React from 'react';
import { X, Users, Building2, Target, Briefcase, ExternalLink, Boxes } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';

export default function JobDetailModal({ context }) {
  const { selectedJob, setSelectedJob, navigateToEmployee } = context;
  const { darkMode } = useTheme();

  if (!selectedJob) return null;

  const colors = getHierarchyColor(selectedJob.hierarchy, darkMode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-almet-comet">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {selectedJob.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: colors.backgroundColor,
                    color: colors.textColor
                  }}
                >
                  {selectedJob.hierarchy}
                </span>
                <span className="flex items-center text-xs text-gray-600 dark:text-almet-bali-hai">
                  <Users size={12} className="mr-1" />
                  {selectedJob.currentEmployees} employee{selectedJob.currentEmployees !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedJob(null)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500 dark:text-almet-bali-hai" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Job Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center p-2.5 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Boxes size={16} className="mr-2 text-almet-sapphire flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai uppercase">Unit</div>
                  <div className="text-xs text-gray-900 dark:text-white font-medium truncate">{selectedJob.unit}</div>
                </div>
              </div>

              <div className="flex items-center p-2.5 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Building2 size={16} className="mr-2 text-almet-sapphire flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai uppercase">Company</div>
                  <div className="text-xs text-gray-900 dark:text-white font-medium truncate">{selectedJob.businessFunction}</div>
                </div>
              </div>

              <div className="flex items-center p-2.5 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Target size={16} className="mr-2 text-green-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai uppercase">Department</div>
                  <div className="text-xs text-gray-900 dark:text-white font-medium truncate">{selectedJob.department}</div>
                </div>
              </div>

              <div className="flex items-center p-2.5 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Briefcase size={16} className="mr-2 text-purple-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai uppercase">Job Function</div>
                  <div className="text-xs text-gray-900 dark:text-white font-medium truncate">{selectedJob.jobFunction}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Employees List */}
          {selectedJob.employees && selectedJob.employees.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Employees ({selectedJob.employees.length})
              </h3>
              <div className="bg-gray-50 dark:bg-almet-san-juan rounded-lg p-3">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedJob.employees.slice(0, 10).map((employee, index) => (
                    <div 
                      key={employee.id || index} 
                      className="flex items-center justify-between p-2 bg-white dark:bg-almet-cloud-burst rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors border border-gray-200 dark:border-almet-comet group"
                      onClick={() => navigateToEmployee(employee.id)}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-8 h-8 bg-almet-sapphire text-white rounded-full flex items-center justify-center text-[10px] font-medium mr-2 flex-shrink-0">
                          {employee.name?.charAt(0)?.toUpperCase() || 'N'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {employee.name || 'No Name'}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai">
                            ID: {employee.employee_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-gray-400 dark:text-almet-bali-hai group-hover:text-almet-sapphire transition-colors flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
                {selectedJob.employees.length > 10 && (
                  <div className="text-center py-2 mt-2 border-t border-gray-200 dark:border-almet-comet">
                    <span className="text-xs text-gray-500 dark:text-almet-bali-hai">
                      +{selectedJob.employees.length - 10} more employees
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Employees State */}
          {(!selectedJob.employees || selectedJob.employees.length === 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Employees</h3>
              <div className="bg-gray-50 dark:bg-almet-san-juan rounded-lg p-6 text-center">
                <Users size={24} className="mx-auto text-gray-400 dark:text-almet-bali-hai mb-2" />
                <p className="text-xs text-gray-500 dark:text-almet-bali-hai">No employees assigned</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-almet-comet">
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedJob(null)}
              className="px-4 py-2 text-xs text-gray-600 dark:text-almet-bali-hai hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}