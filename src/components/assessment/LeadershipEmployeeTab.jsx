'use client';
import React from 'react';
import { Eye, Edit, Trash2, Crown, Download, CheckCircle, RefreshCw } from 'lucide-react';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';
import GradeBadge from './shared/GradeBadge';

export const LeadershipEmployeeTab = ({
  assessments,
  onView,
  onEdit,
  onDelete,
  onExport,
  onSubmit,
  onReopen,
  isEmployeeOnlyAccess
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {/* Hide Employee column for employee-only users */}
            {!isEmployeeOnlyAccess && (
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Employee</th>
            )}
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Position</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Overall Grade</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                {/* Show employee name only for admin/manager */}
                {!isEmployeeOnlyAccess && (
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{assessment.employee_name}</div>
                    <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-gray-700">{assessment.position_assessment_info?.position_group || 'N/A'}</td>
                <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                <td className="px-4 py-3">
                  <GradeBadge grade={assessment.overall_letter_grade} percentage={parseFloat(assessment.overall_percentage || 0).toFixed(0)} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {/* VIEW button - Available for everyone */}
                    <ActionButton
                      onClick={() => onView(assessment)}
                      icon={Eye}
                      label=""
                      variant="outline"
                      size="xs"
                    />

                    {/* DOWNLOAD button - Available for everyone if completed */}
                    {assessment.status === 'COMPLETED' && (
                      <ActionButton
                        onClick={() => onExport(assessment.id)}
                        icon={Download}
                        label=""
                        variant="secondary"
                        size="xs"
                      />
                    )}

                    {/* Admin/Manager only actions */}
                    {!isEmployeeOnlyAccess && (
                      <>
                        {/* EDIT - Only for drafts */}
                        {assessment.status === 'DRAFT' && (
                          <ActionButton
                            onClick={() => onEdit(assessment)}
                            icon={Edit}
                            label=""
                            variant="info"
                            size="xs"
                          />
                        )}

                        {/* SUBMIT - Only for drafts */}
                        {assessment.status === 'DRAFT' && (
                          <ActionButton
                            onClick={() => onSubmit(assessment.id)}
                            icon={CheckCircle}
                            label=""
                            variant="success"
                            size="xs"
                          />
                        )}

                        {/* REOPEN - Only for completed */}
                        {assessment.status === 'COMPLETED' && (
                          <ActionButton
                            onClick={() => onReopen(assessment.id)}
                            icon={RefreshCw}
                            label=""
                            variant="warning"
                            size="xs"
                          />
                        )}

                        {/* DELETE - Always available for admin/manager */}
                        <ActionButton
                          onClick={() => onDelete(assessment.id, 'employee')}
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
              <td colSpan={isEmployeeOnlyAccess ? "5" : "6"} className="text-center py-12">
                <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">
                  {isEmployeeOnlyAccess ? "No assessments found" : "No employee assessments found"}
                </p>
                {!isEmployeeOnlyAccess && (
                  <p className="text-gray-400 text-xs mt-1">Create your first leadership assessment</p>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadershipEmployeeTab;
