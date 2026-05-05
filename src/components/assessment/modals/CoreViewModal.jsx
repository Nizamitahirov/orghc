'use client';
import React from 'react';
import { Eye, X, Download } from 'lucide-react';
import ActionButton from '../ActionButton';
import StatusBadge from '../StatusBadge';
import { GapIndicator, CompletionIndicator } from '../shared/indicators';
import CoreAssessmentCharts from '../charts/CoreAssessmentCharts';
import { toTitleCase } from '../hooks/useCoreAssessment';

export const CoreViewModal = ({
  isOpen,
  onClose,
  assessment,
  activeTab,
  handleExport,
}) => {
  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-almet-sapphire" />
            {activeTab === 'position' ? 'Position Template Details' : 'Assessment Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'position' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hierarchy</label>
                  <p className="text-sm font-medium text-gray-900">{assessment.position_group_name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
                  <p className="text-sm font-medium text-gray-900">{toTitleCase(assessment.job_title)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Created By</label>
                  <p className="text-sm text-gray-700">{assessment.created_by_name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Created Date</label>
                  <p className="text-sm text-gray-700">{new Date(assessment.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Required Skill Levels</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill Group</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assessment.competency_ratings?.length > 0 ? (
                        assessment.competency_ratings.map((rating, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-600">{rating.skill_group_name}</td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.skill_name}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                {rating.required_level}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-3 py-6 text-center text-sm text-gray-500">
                            No skills defined
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-gray-600">Employee</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">{assessment.employee_name}</div>
                  <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Job Title</div>
                  <div className="text-sm text-gray-700 mt-1">{toTitleCase(assessment.position_assessment_title)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Status</div>
                  <div className="mt-1"><StatusBadge status={assessment.status} /></div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Gap Score</div>
                  <div className="mt-1"><GapIndicator gap={assessment.gap_score || 0} /></div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Progress</div>
                  <div className="mt-1"><CompletionIndicator percentage={assessment.completion_percentage} /></div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Total Scores</div>
                  <div className="text-sm text-gray-700 mt-1">
                    {assessment.total_employee_score} / {assessment.total_position_score}
                  </div>
                </div>
              </div>

              {/* Skill Group Performance Summary */}
              {assessment.group_scores && Object.keys(assessment.group_scores).length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 border-b border-gray-200">
                    <h5 className="text-sm font-semibold text-white">Skill Group Performance Summary</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill Group</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Gap</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Completion</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Skills</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(assessment.group_scores).map(([groupName, scores]) => {
                          const gapColor = scores.gap > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                          scores.gap < 0 ? 'bg-red-50 text-red-700 border-red-200' :
                                          'bg-blue-50 text-blue-700 border-blue-200';

                          const completionColor = scores.completion_percentage >= 100 ? 'bg-emerald-50 text-emerald-700' :
                                                 scores.completion_percentage >= 80 ? 'bg-blue-50 text-blue-700' :
                                                 scores.completion_percentage >= 60 ? 'bg-amber-50 text-amber-700' :
                                                 'bg-red-50 text-red-700';

                          return (
                            <tr key={groupName} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{groupName}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">
                                  {scores.position_total}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-flex px-2 py-0.5 bg-gray-500 text-white rounded-md text-xs font-medium">
                                  {scores.employee_total}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${gapColor}`}>
                                  {scores.gap > 0 ? `+${scores.gap}` : scores.gap}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${completionColor}`}>
                                  {scores.completion_percentage.toFixed(0)}%
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center text-xs text-gray-600">
                                {scores.skills_count} skills
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {assessment.group_scores && Object.keys(assessment.group_scores).length > 0 && (
                <CoreAssessmentCharts assessment={assessment} />
              )}

              {assessment.notes && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-sm text-gray-900">{assessment.notes}</p>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Assessment Results</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill Group</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Gap</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assessment.competency_ratings?.length > 0 ? (
                        assessment.competency_ratings.map((rating, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-gray-600">{rating.skill_group_name}</td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.skill_name}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                {rating.required_level}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-500 text-white">
                                {rating.actual_level}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <GapIndicator gap={rating.gap} />
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600">
                              {rating.notes || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-3 py-6 text-center text-sm text-gray-500">
                            No assessment data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          {activeTab === 'employee' && assessment.status === 'COMPLETED' && (
            <ActionButton
              onClick={() => handleExport(assessment.id, 'employee')}
              icon={Download}
              label="Export"
              variant="secondary"
              size="md"
            />
          )}
          <ActionButton
            onClick={onClose}
            icon={X}
            label="Close"
            variant="outline"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};
