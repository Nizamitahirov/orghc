'use client';
import React from 'react';
import { User, Edit, X, Save, CheckCircle, Info, AlertCircle } from 'lucide-react';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import ActionButton from '../ActionButton';
import CollapsibleGroup from '../CollapsibleGroup';
import { GapIndicator } from '../shared/indicators';
import { toTitleCase } from '../hooks/useCoreAssessment';

export const CoreEmployeeModal = ({
  mode, // 'create' | 'edit'
  // create props
  showCreateEmployeeModal,
  employeeFormData,
  setEmployeeFormData,
  handleCreateEmployeeAssessment,
  setShowCreateEmployeeModal,
  handleEmployeeChange,
  templateError,
  setTemplateError,
  // edit props
  showEditEmployeeModal,
  editFormData,
  setEditFormData,
  handleUpdateEmployeeAssessment,
  setShowEditEmployeeModal,
  // shared
  employees,
  positionAssessments,
  coreScales,
  showCoreScalesInfo,
  setShowCoreScalesInfo,
  expandedGroups,
  setExpandedGroups,
  selectedEmployeeInfo,
  setSelectedEmployeeInfo,
  isSubmitting,
}) => {
  if (mode === 'create') {
    if (!showCreateEmployeeModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-almet-sapphire" />
              Create Employee Assessment
            </h3>
            <button
              onClick={() => {
                setShowCreateEmployeeModal(false);
                setEmployeeFormData({
                  employee: '',
                  position_assessment: '',
                  notes: '',
                  competency_ratings: []
                });
                setTemplateError(null);
                setSelectedEmployeeInfo(null);
              }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Employee Selection */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Employee <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={employees.map(emp => ({
                    value: emp.id,
                    label: emp.name
                  }))}
                  value={employeeFormData.employee}
                  onChange={handleEmployeeChange}
                  placeholder="Select Employee"
                    portal={true}
                  zIndex="z-[60]"
                />
              </div>

              {/* Employee Info Display */}
              {selectedEmployeeInfo && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs font-medium text-blue-700">Employee:</span>
                      <p className="text-sm text-blue-900">{selectedEmployeeInfo.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">Job Title:</span>
                      <p className="text-sm text-blue-900">{toTitleCase(selectedEmployeeInfo.job_title)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">Hierarchy:</span>
                      <p className="text-sm text-blue-900">{selectedEmployeeInfo.position_group_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Error Display */}
              {templateError && (
                <div className={`mt-3 p-3 rounded-lg border ${
                  templateError.type === 'duplicate'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      templateError.type === 'duplicate'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`} />
                    <div>
                      <h4 className={`font-medium text-sm ${
                        templateError.type === 'duplicate'
                          ? 'text-amber-800'
                          : 'text-red-800'
                      }`}>
                        {templateError.type === 'duplicate'
                          ? 'Duplicate Assessment'
                          : 'Template Not Found'}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        templateError.type === 'duplicate'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}>
                        {templateError.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Core Scales Info for Employee Assessment */}
            {employeeFormData.position_assessment && !templateError && (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Assessment Scales</h4>
                  <ActionButton
                    onClick={() => setShowCoreScalesInfo(!showCoreScalesInfo)}
                    icon={Info}
                    label={showCoreScalesInfo ? "Hide" : "Show"}
                    variant="info"
                    size="sm"
                  />
                </div>

                {showCoreScalesInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {coreScales.map(scale => (
                        <div key={scale.id} className="bg-white p-2 rounded-md border border-blue-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-almet-sapphire text-white px-1.5 py-0.5 rounded text-xs font-medium">
                              {scale.scale}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{scale.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assessment Matrix Table */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Employee Assessment Matrix</h4>

                {(() => {
                  const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                  if (!selectedPosition) return null;

                  const groupedCompetencies = {};
                  selectedPosition.competency_ratings?.forEach(rating => {
                    const groupName = rating.skill_group_name || 'Other';
                    if (!groupedCompetencies[groupName]) {
                      groupedCompetencies[groupName] = [];
                    }
                    groupedCompetencies[groupName].push(rating);
                  });

                  return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                    <CollapsibleGroup
                      key={groupName}
                      title={groupName}
                      isOpen={expandedGroups[groupName] !== false}
                      onToggle={() => setExpandedGroups(prev => ({
                        ...prev,
                        [groupName]: prev[groupName] === false
                      }))}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {competencies.map(competency => {
                              const employeeRating = employeeFormData.competency_ratings.find(
                                r => r.skill_id === competency.skill
                              );

                              const actualLevel = employeeRating?.actual_level || 0;
                              const gap = actualLevel - competency.required_level;

                              return (
                                <tr key={competency.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm text-gray-900">{competency.skill_name}</td>
                                  <td className="px-3 py-2 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                      {competency.required_level}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <select
                                      value={actualLevel}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === competency.skill
                                        );

                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.push({
                                            skill_id: competency.skill,
                                            actual_level: parseInt(e.target.value),
                                            notes: ''
                                          });
                                        }

                                        setEmployeeFormData({
                                          ...employeeFormData,
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                    >
                                      <option value={0}>-</option>
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <GapIndicator gap={gap} />
                                  </td>
                                  <td className="px-3 py-2">
                                    <textarea
                                      value={employeeRating?.notes || ''}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === competency.skill
                                        );

                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].notes = e.target.value;
                                        } else {
                                          newRatings.push({
                                            skill_id: competency.skill,
                                            actual_level: 0,
                                            notes: e.target.value
                                          });
                                        }

                                        setEmployeeFormData({
                                          ...employeeFormData,
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      placeholder="Add notes..."
                                      rows="2"
                                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CollapsibleGroup>
                  ));
                })()}
              </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
            <ActionButton
              onClick={() => {
                setShowCreateEmployeeModal(false);
                setEmployeeFormData({
                  employee: '',
                  position_assessment: '',
                  notes: '',
                  competency_ratings: []
                });
                setTemplateError(null);
                setSelectedEmployeeInfo(null);
              }}
              icon={X}
              label="Cancel"
              disabled={isSubmitting}
              variant="outline"
              size="md"
            />
            {employeeFormData.position_assessment && !templateError && (
              <>
                <ActionButton
                  onClick={() => handleCreateEmployeeAssessment(true)}
                  icon={Save}
                  label="Save as Draft"
                  disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                  loading={isSubmitting}
                  variant="secondary"
                  size="md"
                />
                <ActionButton
                  onClick={() => handleCreateEmployeeAssessment(false)}
                  icon={CheckCircle}
                  label="Save & Submit"
                  disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                  loading={isSubmitting}
                  variant="success"
                  size="md"
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // mode === 'edit'
  if (!showEditEmployeeModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Edit className="w-5 h-5 text-almet-sapphire" />
            Edit Employee Assessment
          </h3>
          <button
            onClick={() => {
              setShowEditEmployeeModal(false);
              setEditFormData({
                employee: '',
                position_assessment: '',
                notes: '',
                competency_ratings: []
              });
              setSelectedEmployeeInfo(null);
            }}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Employee Info Display */}
          {selectedEmployeeInfo && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-xs font-medium text-blue-700">Employee:</span>
                  <p className="text-sm text-blue-900">{selectedEmployeeInfo.name}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-700">Job Title:</span>
                  <p className="text-sm text-blue-900">{toTitleCase(selectedEmployeeInfo.job_title)}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-700">Hierarchy:</span>
                  <p className="text-sm text-blue-900">{selectedEmployeeInfo.position_group_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Matrix Table */}
          {editFormData.position_assessment && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Update Assessment</h4>

              {(() => {
                const selectedPosition = positionAssessments.find(p => p.id === editFormData.position_assessment);
                if (!selectedPosition) return null;

                const groupedCompetencies = {};
                selectedPosition.competency_ratings?.forEach(rating => {
                  const groupName = rating.skill_group_name || 'Other';
                  if (!groupedCompetencies[groupName]) {
                    groupedCompetencies[groupName] = [];
                  }
                  groupedCompetencies[groupName].push(rating);
                });

                return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                  <CollapsibleGroup
                    key={groupName}
                    title={groupName}
                    isOpen={expandedGroups[groupName] !== false}
                    onToggle={() => setExpandedGroups(prev => ({
                      ...prev,
                      [groupName]: prev[groupName] === false
                    }))}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {competencies.map(competency => {
                            const employeeRating = editFormData.competency_ratings.find(
                              r => r.skill_id === competency.skill
                            );

                            const actualLevel = employeeRating?.actual_level || 0;
                            const gap = actualLevel - competency.required_level;

                            return (
                              <tr key={competency.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm text-gray-900">{competency.skill_name}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-sapphire text-white">
                                    {competency.required_level}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <select
                                    value={actualLevel}
                                    onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings];
                                      const existingIndex = newRatings.findIndex(
                                        r => r.skill_id === competency.skill
                                      );

                                      if (existingIndex >= 0) {
                                        newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                      } else {
                                        newRatings.push({
                                          skill_id: competency.skill,
                                          actual_level: parseInt(e.target.value),
                                          notes: ''
                                        });
                                      }

                                      setEditFormData({
                                        ...editFormData,
                                        competency_ratings: newRatings
                                      });
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                  >
                                    <option value={0}>-</option>
                                    {coreScales.map(scale => (
                                      <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <GapIndicator gap={gap} />
                                </td>
                                <td className="px-3 py-2">
                                  <textarea
                                    value={employeeRating?.notes || ''}
                                    onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings];
                                      const existingIndex = newRatings.findIndex(
                                        r => r.skill_id === competency.skill
                                      );

                                      if (existingIndex >= 0) {
                                        newRatings[existingIndex].notes = e.target.value;
                                      } else {
                                        newRatings.push({
                                          skill_id: competency.skill,
                                          actual_level: 0,
                                          notes: e.target.value
                                        });
                                      }

                                      setEditFormData({
                                        ...editFormData,
                                        competency_ratings: newRatings
                                      });
                                    }}
                                    placeholder="Add notes..."
                                    rows="2"
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleGroup>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <ActionButton
            onClick={() => {
              setShowEditEmployeeModal(false);
              setEditFormData({
                employee: '',
                position_assessment: '',
                notes: '',
                competency_ratings: []
              });
              setSelectedEmployeeInfo(null);
            }}
            icon={X}
            label="Cancel"
            disabled={isSubmitting}
            variant="outline"
            size="md"
          />
          <ActionButton
            onClick={() => handleUpdateEmployeeAssessment(true)}
            icon={Save}
            label="Update Draft"
            disabled={!editFormData.id}
            loading={isSubmitting}
            variant="secondary"
            size="md"
          />
          <ActionButton
            onClick={() => handleUpdateEmployeeAssessment(false)}
            icon={CheckCircle}
            label="Update & Submit"
            disabled={!editFormData.id}
            loading={isSubmitting}
            variant="success"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};
