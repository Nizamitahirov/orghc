'use client';
import React from 'react';
import { Eye, X, Download, AlertCircle, Building, ChevronDown, ChevronRight } from 'lucide-react';
import ActionButton from '../ActionButton';
import StatusBadge from '../StatusBadge';
import LeadershipAssessmentCharts from '../charts/LeadershipAssessmentCharts';

export const LeadershipViewModal = ({
  isOpen,
  onClose,
  assessment,
  activeTab,
  expandedGroups,
  expandedChildGroups,
  toggleGroup,
  toggleChildGroup,
  onExport,
}) => {
  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
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
            // POSITION TEMPLATE VIEW
            <div className="space-y-4">
              {/* Position Info - Compact Grid */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Hierarchy</div>
                  <div className="text-sm font-semibold text-gray-900">{assessment.position_group_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Grade Levels</div>
                  <div className="flex flex-wrap gap-1">
                    {assessment.grade_levels && assessment.grade_levels.length > 0 ? (
                      assessment.grade_levels.map((level, idx) => (
                        <span key={idx} className="inline-flex px-2 py-0.5 bg-sky-500 text-white rounded text-xs font-medium">
                          {level}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No grades</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Total Competencies</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {assessment.competency_ratings?.length || 0} items
                  </div>
                </div>
              </div>

              {/* Grouped Competencies - Collapsible */}
              {assessment.grouped_competencies && Object.keys(assessment.grouped_competencies).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(assessment.grouped_competencies).map(([mainGroupName, childGroups]) => {
                    const totalItems = Object.values(childGroups).reduce((acc, items) => acc + items.length, 0);

                    return (
                      <div key={mainGroupName} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Main Group Header - Collapsible */}
                        <button
                          onClick={() => toggleGroup(mainGroupName)}
                          className="w-full bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 flex items-center justify-between hover:opacity-90 transition-opacity"
                        >
                          <span className="text-sm font-semibold text-white">{mainGroupName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/80">{totalItems} items</span>
                            {expandedGroups[mainGroupName] ? (
                              <ChevronDown size={16} className="text-white" />
                            ) : (
                              <ChevronRight size={16} className="text-white" />
                            )}
                          </div>
                        </button>

                        {/* Child Groups */}
                        {expandedGroups[mainGroupName] && (
                          <div className="bg-white">
                            {Object.entries(childGroups).map(([childGroupName, items]) => (
                              <div key={childGroupName} className="border-t border-gray-100">
                                {/* Child Group Header - Collapsible */}
                                <button
                                  onClick={() => toggleChildGroup(`view-${mainGroupName}-${childGroupName}`)}
                                  className="w-full bg-gray-50 px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Building size={14} className="text-almet-sapphire" />
                                    <span className="text-xs font-semibold text-gray-700">{childGroupName}</span>
                                    <span className="text-xs text-gray-500">({items.length})</span>
                                  </div>
                                  {expandedChildGroups[`view-${mainGroupName}-${childGroupName}`] ? (
                                    <ChevronDown size={14} className="text-gray-600" />
                                  ) : (
                                    <ChevronRight size={14} className="text-gray-600" />
                                  )}
                                </button>

                                {/* Items */}
                                {expandedChildGroups[`view-${mainGroupName}-${childGroupName}`] && (
                                  <div className="divide-y divide-gray-100">
                                    {items.map((item, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 pl-8 hover:bg-gray-50">
                                        <div className="text-sm text-gray-900">{item.item_name}</div>
                                        <span className="inline-flex px-2.5 py-1 bg-almet-sapphire text-white rounded text-xs font-medium">
                                          {item.required_level}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No competency ratings found</p>
                </div>
              )}
            </div>
          ) : (
            // EMPLOYEE LEADERSHIP ASSESSMENT VIEW
            <div className="space-y-4">
              {/* Employee Info - Compact */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Employee</div>
                  <div className="text-sm font-semibold text-gray-900">{assessment.employee_name}</div>
                  <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Position</div>
                  <div className="text-sm text-gray-700">
                    {assessment.position_assessment_info?.position_group || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Status</div>
                  <StatusBadge status={assessment.status} />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Date</div>
                  <div className="text-sm text-gray-700">
                    {new Date(assessment.assessment_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Overall Performance - Compact */}
              <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Grade</div>
                    <div className="text-4xl font-bold text-emerald-600">
                      {assessment.overall_letter_grade}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Score</div>
                    <div className="text-4xl font-bold text-sky-600">
                      {parseFloat(assessment.overall_percentage || 0).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {assessment.main_group_scores_display && Object.keys(assessment.main_group_scores_display).length > 0 && (
                <LeadershipAssessmentCharts assessment={assessment} />
              )}

              {/* Main Group Scores - Compact Table */}
              {assessment.main_group_scores_display && Object.keys(assessment.main_group_scores_display).length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral px-3 py-2">
                    <h5 className="text-xs font-semibold text-white">Main Group Performance</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Score</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(assessment.main_group_scores_display).map(([groupName, scores]) => {
                          const getColor = (pct) => {
                            if (pct >= 90) return 'bg-emerald-500 text-white';
                            if (pct >= 80) return 'bg-blue-500 text-white';
                            if (pct >= 70) return 'bg-amber-500 text-white';
                            return 'bg-red-500 text-white';
                          };

                          return (
                            <tr key={groupName} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{groupName}</td>
                              <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.position_total}</td>
                              <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.employee_total}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                  {scores.percentage}%
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                  {scores.letter_grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Child Group Scores - Compact Table */}
              {assessment.child_group_scores_display && Object.keys(assessment.child_group_scores_display).length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2">
                    <h5 className="text-xs font-semibold text-white">Child Group Performance</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Score</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(assessment.child_group_scores_display).map(([groupName, scores]) => {
                          const getColor = (pct) => {
                            if (pct >= 90) return 'bg-emerald-500 text-white';
                            if (pct >= 80) return 'bg-blue-500 text-white';
                            if (pct >= 70) return 'bg-amber-500 text-white';
                            return 'bg-red-500 text-white';
                          };

                          return (
                            <tr key={groupName} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{groupName}</td>
                              <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.position_total}</td>
                              <td className="px-3 py-2 text-center text-sm text-gray-700">{scores.employee_total}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                  {scores.percentage}%
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getColor(scores.percentage)}`}>
                                  {scores.letter_grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detailed Competency Ratings - Collapsible Groups */}
              {assessment.grouped_competencies && Object.keys(assessment.grouped_competencies).length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Detailed Assessment Results</h4>
                  {Object.entries(assessment.grouped_competencies).map(([mainGroupName, childGroups]) => {
                    const totalItems = Object.values(childGroups).reduce((acc, items) => acc + items.length, 0);

                    return (
                      <div key={mainGroupName} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Main Group Header */}
                        <button
                          onClick={() => toggleGroup(`view-${mainGroupName}`)}
                          className="w-full bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 flex items-center justify-between hover:opacity-90 transition-opacity"
                        >
                          <span className="text-sm font-semibold text-white">{mainGroupName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/80">{totalItems} items</span>
                            {expandedGroups[`view-${mainGroupName}`] ? (
                              <ChevronDown size={16} className="text-white" />
                            ) : (
                              <ChevronRight size={16} className="text-white" />
                            )}
                          </div>
                        </button>

                        {/* Child Groups */}
                        {expandedGroups[`view-${mainGroupName}`] && (
                          <div className="bg-white">
                            {Object.entries(childGroups).map(([childGroupName, items]) => (
                              <div key={childGroupName} className="border-t border-gray-100">
                                {/* Child Group Header */}
                                <button
                                  onClick={() => toggleChildGroup(`view-detail-${mainGroupName}-${childGroupName}`)}
                                  className="w-full bg-gray-50 px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Building size={14} className="text-almet-sapphire" />
                                    <span className="text-xs font-semibold text-gray-700">{childGroupName}</span>
                                    <span className="text-xs text-gray-500">({items.length})</span>
                                  </div>
                                  {expandedChildGroups[`view-detail-${mainGroupName}-${childGroupName}`] ? (
                                    <ChevronDown size={14} className="text-gray-600" />
                                  ) : (
                                    <ChevronRight size={14} className="text-gray-600" />
                                  )}
                                </button>

                                {/* Items Table */}
                                {expandedChildGroups[`view-detail-${mainGroupName}-${childGroupName}`] && (
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Required</th>
                                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Actual</th>
                                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-16">Gap</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {items.map((item, idx) => {
                                          const gap = item.gap || (item.actual_level - item.required_level);
                                          const gapColor = gap > 0 ? 'bg-emerald-500 text-white' :
                                                          gap < 0 ? 'bg-red-500 text-white' :
                                                          'bg-sky-500 text-white';

                                          return (
                                            <tr key={idx} className="hover:bg-gray-50">
                                              <td className="px-3 py-2 text-sm text-gray-900">{item.item_name}</td>
                                              <td className="px-3 py-2 text-center">
                                                <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded text-xs font-medium">
                                                  {item.required_level}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                <span className="inline-flex px-2 py-0.5 bg-gray-500 text-white rounded text-xs font-medium">
                                                  {item.actual_level}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${gapColor}`}>
                                                  {gap > 0 ? `+${gap}` : gap}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 text-xs text-gray-600">{item.notes || '-'}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No competency ratings found</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          {activeTab === 'employee' && assessment.status === 'COMPLETED' && (
            <ActionButton
              onClick={() => onExport(assessment.id)}
              icon={Download}
              label="Export PDF"
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

export default LeadershipViewModal;
