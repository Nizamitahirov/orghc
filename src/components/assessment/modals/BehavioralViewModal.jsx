'use client';
import React from 'react';
import { Eye, X, Download } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import ActionButton from '../ActionButton';
import GradeBadge from '../shared/GradeBadge';
import BehavioralAssessmentCharts from '../charts/BehavioralAssessmentCharts';

export const BehavioralViewModal = ({
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
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'position' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-gray-600">Hierarchy</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">{assessment.position_assessment_info?.position_group || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Grade Levels</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {assessment.grade_levels && assessment.grade_levels.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assessment.grade_levels.map((level, idx) => (
                          <span key={idx} className="inline-flex px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md text-xs font-medium">
                            {level}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'No grades'
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-600">Created Date</div>
                  <div className="text-sm text-gray-700 mt-1">{new Date(assessment.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Required Competency Levels</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assessment.competency_ratings?.map((rating, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs text-gray-600">{rating.competency_group_name}</td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.competency_name}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{rating.required_level}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Employee assessment view
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-gray-600">Employee</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">{assessment.employee_name}</div>
                  <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Position</div>
                  <div className="text-sm text-gray-700 mt-1">{assessment.position_assessment_info?.position_group || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Status</div>
                  <div className="mt-1"><StatusBadge status={assessment.status} /></div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Assessment Date</div>
                  <div className="text-sm text-gray-700 mt-1">{new Date(assessment.assessment_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Overall Grade</div>
                  <div className="mt-1">
                    <GradeBadge grade={assessment.overall_letter_grade} percentage={parseFloat(assessment.overall_percentage || 0).toFixed(0)} />
                  </div>
                </div>
              </div>

              {assessment.group_scores && Object.keys(assessment.group_scores).length > 0 && (
                <BehavioralAssessmentCharts assessment={assessment} />
              )}

              {assessment.group_scores && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h5 className="text-xs font-medium text-emerald-900 mb-2">Group Performance Summary</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(assessment.group_scores).map(([groupName, scores]) => (
                      <div key={groupName} className="bg-white p-2 rounded-md border border-emerald-100">
                        <h6 className="text-xs font-medium text-gray-900 mb-1">{groupName}</h6>
                        <div className="space-y-0.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grade:</span>
                            <span className="font-medium">{scores.letter_grade}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Score:</span>
                            <span className="font-medium">{scores.percentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Points:</span>
                            <span className="font-medium">{scores.employee_total}/{scores.position_total}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Detailed Assessment Results</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Gap</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assessment.competency_ratings?.map((rating, index) => {
                        const gap = rating.actual_level - rating.required_level;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-gray-600">{rating.competency_group_name}</td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.competency_name}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{rating.required_level}</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-gray-500 text-white rounded-md text-xs font-medium">{rating.actual_level}</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${gap > 0 ? 'bg-emerald-50 text-emerald-700' : gap < 0 ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-700'}`}>
                                {gap > 0 ? `+${gap}` : gap}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600">{rating.notes || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          {activeTab === 'employee' && assessment.status === 'COMPLETED' && (
            <ActionButton onClick={() => handleExport(assessment.id)} icon={Download} label="Export" variant="secondary" size="md" />
          )}
          <ActionButton onClick={onClose} icon={X} label="Close" variant="outline" size="md" />
        </div>
      </div>
    </div>
  );
};
