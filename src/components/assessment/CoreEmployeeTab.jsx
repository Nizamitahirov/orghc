'use client';
import React from 'react';
import { Target, Eye, Edit, Trash2, Send, RotateCcw, Download } from 'lucide-react';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';
import { GapIndicator, CompletionIndicator } from './shared/indicators';
import { toTitleCase } from './hooks/useCoreAssessment';

export const CoreEmployeeTab = ({
  filteredEmployeeAssessments,
  isEmployeeOnlyAccess,
  setSelectedAssessment,
  setShowViewModal,
  handleEditAssessment,
  handleSubmitAssessment,
  handleReopenAssessment,
  handleExport,
  handleDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {!isEmployeeOnlyAccess && (
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Employee</th>
            )}
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Job Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Gap Score</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Progress</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredEmployeeAssessments.length > 0 ? (
            filteredEmployeeAssessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                {!isEmployeeOnlyAccess && (
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{assessment.employee_name}</div>
                    <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-gray-700">{toTitleCase(assessment.position_assessment_title)}</td>
                <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                <td className="px-4 py-3"><GapIndicator gap={assessment.gap_score || 0} /></td>
                <td className="px-4 py-3"><CompletionIndicator percentage={assessment.completion_percentage} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    <ActionButton
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowViewModal(true);
                      }}
                      icon={Eye}
                      label=""
                      variant="outline"
                      size="xs"
                    />

                    {!isEmployeeOnlyAccess && (
                      <>
                        {assessment.status === 'DRAFT' && (
                          <>
                            <ActionButton
                              onClick={() => handleEditAssessment(assessment)}
                              icon={Edit}
                              label=""
                              variant="info"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleSubmitAssessment(assessment.id)}
                              icon={Send}
                              label=""
                              variant="success"
                              size="xs"
                            />
                          </>
                        )}
                        {assessment.status === 'COMPLETED' && (
                          <ActionButton
                            onClick={() => handleReopenAssessment(assessment.id)}
                            icon={RotateCcw}
                            label=""
                            variant="warning"
                            size="xs"
                          />
                        )}
                        <ActionButton
                          onClick={() => handleExport(assessment.id, 'employee')}
                          icon={Download}
                          label=""
                          variant="secondary"
                          size="xs"
                        />
                        <ActionButton
                          onClick={() => handleDelete(assessment.id, 'employee')}
                          icon={Trash2}
                          label=""
                          variant="danger"
                          size="xs"
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isEmployeeOnlyAccess ? "6" : "7"} className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">
                  {isEmployeeOnlyAccess ? "No assessments found" : "No employee assessments found"}
                </p>
                {!isEmployeeOnlyAccess && (
                  <p className="text-gray-400 text-xs mt-1">Create your first employee assessment</p>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
