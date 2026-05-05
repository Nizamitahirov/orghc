'use client';
import React from 'react';
import { Eye, Edit, Trash2, Crown } from 'lucide-react';
import ActionButton from './ActionButton';

export const LeadershipPositionTab = ({ assessments, onView, onEdit, onDelete, isEmployeeOnlyAccess }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Hierarchy</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Grade Levels</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Competencies</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{assessment.position_group_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {assessment.grade_levels && assessment.grade_levels.length > 0 ? (
                      assessment.grade_levels.map((level, idx) => (
                        <span key={idx} className="inline-flex px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md text-xs font-medium">
                          {level}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No grades</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{assessment.competency_ratings?.length || 0} competencies</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <ActionButton onClick={() => onView(assessment)} icon={Eye} label="" variant="outline" size="xs" />
                    <ActionButton onClick={() => onEdit(assessment)} icon={Edit} label="" variant="info" size="xs" />
                    <ActionButton onClick={() => onDelete(assessment.id, 'position')} icon={Trash2} label="" variant="danger" size="xs" />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-12">
                <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-sm">No position templates found</p>
                <p className="text-gray-400 text-xs mt-1">Create your first leadership position template</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadershipPositionTab;
