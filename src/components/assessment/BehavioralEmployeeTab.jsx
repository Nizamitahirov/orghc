'use client';
import React from 'react';
import { Users, Eye, Edit, Download, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import GradeBadge from './shared/GradeBadge';

export const BehavioralEmployeeTab = ({
  filteredEmployeeAssessments,
  isEmployeeOnlyAccess,
  setSelectedAssessment,
  setShowViewModal,
  handleEditAssessment,
  handleExport,
  handleSubmitAssessment,
  handleReopenAssessment,
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
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Position</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Overall Grade</th>
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
                <td className="px-4 py-3 text-sm text-gray-700">{assessment.position_assessment_info?.position_group || 'N/A'}</td>
                <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                <td className="px-4 py-3">
                  <GradeBadge grade={assessment.overall_letter_grade} percentage={parseFloat(assessment.overall_percentage || 0).toFixed(0)} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    <ActionButton onClick={() => { setSelectedAssessment(assessment); setShowViewModal(true); }} icon={Eye} label="" variant="outline" size="xs" />

                    {!isEmployeeOnlyAccess && (
                      <>
                        {assessment.status === 'DRAFT' && <ActionButton onClick={() => handleEditAssessment(assessment)} icon={Edit} label="" variant="info" size="xs" />}
                        <ActionButton onClick={() => handleExport(assessment.id)} icon={Download} label="" variant="secondary" size="xs" />
                        {assessment.status === 'DRAFT' && <ActionButton onClick={() => handleSubmitAssessment(assessment.id)} icon={CheckCircle} label="" variant="success" size="xs" />}
                        {assessment.status === 'COMPLETED' && <ActionButton onClick={() => handleReopenAssessment(assessment.id)} icon={RefreshCw} label="" variant="warning" size="xs" />}
                        <ActionButton onClick={() => handleDelete(assessment.id, 'employee')} icon={Trash2} label="" variant="danger" size="xs" />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isEmployeeOnlyAccess ? "5" : "6"} className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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
