'use client';
import React from 'react';
import { Building, Eye, Edit, Trash2 } from 'lucide-react';
import ActionButton from './ActionButton';
import { toTitleCase } from './hooks/useCoreAssessment';

export const CorePositionTab = ({
  filteredPositionAssessments,
  setSelectedAssessment,
  setShowViewModal,
  handleEditPositionAssessment,
  handleDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Hierarchy</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Job Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Skills</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredPositionAssessments.length > 0 ? (
            filteredPositionAssessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{assessment.position_group_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{toTitleCase(assessment.job_title)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{assessment.competency_ratings?.length || 0} skills</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
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
                    <ActionButton
                      onClick={() => handleEditPositionAssessment(assessment)}
                      icon={Edit}
                      label=""
                      variant="info"
                      size="xs"
                    />
                    <ActionButton
                      onClick={() => handleDelete(assessment.id, 'position')}
                      icon={Trash2}
                      label=""
                      variant="danger"
                      size="xs"
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-12">
                <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">No position templates found</p>
                <p className="text-gray-400 text-xs mt-1">Create your first position assessment template</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
