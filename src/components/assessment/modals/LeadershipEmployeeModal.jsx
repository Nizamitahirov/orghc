'use client';
import React from 'react';
import { Crown, Edit, X, Info, AlertCircle, Save, CheckCircle, Building, ChevronDown, ChevronRight } from 'lucide-react';
import ActionButton from '../ActionButton';
import SearchableDropdown from '@/components/common/SearchableDropdown';

export const LeadershipEmployeeModal = ({
  mode, // 'create' | 'edit'
  isOpen,
  onClose,
  employees,
  positionAssessments,
  behavioralScales,
  employeeFormData,
  setEmployeeFormData,
  editFormData,
  setEditFormData,
  templateError,
  setTemplateError,
  selectedEmployeeInfo,
  setSelectedEmployeeInfo,
  showScalesInfo,
  setShowScalesInfo,
  isSubmitting,
  expandedGroups,
  expandedChildGroups,
  handleEmployeeChange,
  handleCreateEmployeeAssessment,
  handleUpdateEmployeeAssessment,
  toggleGroup,
  toggleChildGroup,
}) => {
  if (!isOpen) return null;

  const isCreate = mode === 'create';

  const handleClose = () => {
    if (isCreate) {
      setTemplateError(null);
      setSelectedEmployeeInfo(null);
      setEmployeeFormData({
        employee: '',
        position_assessment: '',
        assessment_date: new Date().toISOString().split('T')[0],
        competency_ratings: [],
        action_type: 'save_draft'
      });
    } else {
      setSelectedEmployeeInfo(null);
      setEditFormData({
        employee: '',
        position_assessment: '',
        assessment_date: '',
        competency_ratings: [],
        action_type: 'save_draft'
      });
    }
    onClose();
  };

  const currentFormData = isCreate ? employeeFormData : editFormData;
  const title = isCreate ? 'Create Employee Leadership Assessment' : 'Edit Employee Leadership Assessment';
  const TitleIcon = isCreate ? Crown : Edit;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg w-full max-w-6xl shadow-xl${!isCreate ? ' max-h-[90vh] overflow-hidden' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TitleIcon className="w-5 h-5 text-almet-sapphire" />
            {title}
          </h3>
          <button onClick={handleClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">

          {/* Employee selector (create only) */}
          {isCreate && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Employee <span className="text-red-500">*</span></label>
              <SearchableDropdown
                options={employees}
                portal={true}
                zIndex="z-[60]"
                value={employeeFormData.employee}
                onChange={handleEmployeeChange}
                placeholder="Select Employee"
                allowUncheck={true}
              />
            </div>
          )}

          {/* Employee info card */}
          {selectedEmployeeInfo && (
            <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-xs font-medium text-sky-700">Employee</div>
                  <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-sky-700">Job Title</div>
                  <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.job_title}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-sky-700">Grade Level</div>
                  <div className="text-sm font-semibold text-sky-900">Grade {selectedEmployeeInfo.grading_level}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-sky-700">Hierarchy</div>
                  <div className="text-sm font-semibold text-sky-900">{selectedEmployeeInfo.position_group_name}</div>
                </div>
              </div>
            </div>
          )}

          {/* Template error (create only) */}
          {isCreate && templateError && (
            <div className={`mb-4 p-3 rounded-lg border ${templateError.type === 'duplicate' ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${templateError.type === 'duplicate' ? 'text-amber-600' : 'text-red-600'}`} />
                <div>
                  <h4 className={`text-sm font-medium ${templateError.type === 'duplicate' ? 'text-amber-800' : 'text-red-800'}`}>
                    {templateError.type === 'duplicate' ? 'Duplicate Assessment' : 'Template Not Found'}
                  </h4>
                  <p className={`text-xs mt-1 ${templateError.type === 'duplicate' ? 'text-amber-700' : 'text-red-700'}`}>{templateError.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Competency table - shown when position_assessment loaded (create) or always (edit) */}
          {(isCreate ? (currentFormData.position_assessment && !templateError) : true) && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Leadership Competency Assessment</h4>
                <button onClick={() => setShowScalesInfo(!showScalesInfo)} className="text-xs text-almet-sapphire hover:text-almet-astral flex items-center gap-1">
                  <Info size={14} />
                  {showScalesInfo ? 'Hide' : 'Show'} Scale Info
                </button>
              </div>

              {showScalesInfo && (
                <div className="mb-4 bg-sky-50 border border-sky-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-sky-900 mb-2">Leadership Assessment Scales:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {behavioralScales.map(scale => (
                      <div key={scale.id} className="bg-white p-2 rounded-md border border-sky-100">
                        <div className="text-xs font-semibold text-sky-900 mb-1">Level {scale.scale}</div>
                        <div className="text-xs text-sky-700">{scale.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TABLE FORMAT with Collapsible Child Groups */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const selectedPosition = positionAssessments.find(p => p.id === currentFormData.position_assessment);
                        if (!selectedPosition) return null;

                        const groupedCompetencies = {};
                        selectedPosition.competency_ratings?.forEach(rating => {
                          const mainGroupName = rating.main_group_name || 'Other';
                          const childGroupName = rating.child_group_name || 'Other';

                          if (!groupedCompetencies[mainGroupName]) {
                            groupedCompetencies[mainGroupName] = {};
                          }
                          if (!groupedCompetencies[mainGroupName][childGroupName]) {
                            groupedCompetencies[mainGroupName][childGroupName] = [];
                          }
                          groupedCompetencies[mainGroupName][childGroupName].push(rating);
                        });

                        return Object.entries(groupedCompetencies).map(([mainGroupName, childGroups]) => (
                          <React.Fragment key={mainGroupName}>
                            {/* Main Group Header */}
                            <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
                              <td colSpan="5" className="px-3 py-2">
                                <button
                                  onClick={() => toggleGroup(mainGroupName)}
                                  className="w-full flex items-center justify-between text-left"
                                >
                                  <span className="text-xs font-bold text-white uppercase">{mainGroupName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-white opacity-80">
                                      {Object.keys(childGroups).length} child groups
                                    </span>
                                    {expandedGroups[mainGroupName] ? (
                                      <ChevronDown size={16} className="text-white" />
                                    ) : (
                                      <ChevronRight size={16} className="text-white" />
                                    )}
                                  </div>
                                </button>
                              </td>
                            </tr>

                            {/* Child Groups - Only show if main group is expanded */}
                            {expandedGroups[mainGroupName] && Object.entries(childGroups).map(([childGroupName, competencies]) => (
                              <React.Fragment key={childGroupName}>
                                {/* Child Group Header - Collapsible */}
                                <tr className="bg-gray-100">
                                  <td colSpan="5" className="px-3 py-2">
                                    <button
                                      onClick={() => toggleChildGroup(`${mainGroupName}-${childGroupName}`)}
                                      className="w-full flex items-center justify-between text-left hover:bg-gray-200 transition-colors rounded px-2 py-1"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Building size={14} className="text-almet-sapphire" />
                                        <span className="text-xs font-semibold text-gray-700">{childGroupName}</span>
                                        <span className="text-xs text-gray-500">({competencies.length} items)</span>
                                      </div>
                                      {expandedChildGroups[`${mainGroupName}-${childGroupName}`] ? (
                                        <ChevronDown size={14} className="text-gray-600" />
                                      ) : (
                                        <ChevronRight size={14} className="text-gray-600" />
                                      )}
                                    </button>
                                  </td>
                                </tr>

                                {/* Competency Items - Only show if child group is expanded */}
                                {expandedChildGroups[`${mainGroupName}-${childGroupName}`] && competencies.map(competency => {
                                  const employeeRating = currentFormData.competency_ratings.find(r => r.leadership_item_id === competency.leadership_item);
                                  const actualLevel = employeeRating?.actual_level || 0;
                                  const gap = actualLevel - competency.required_level;

                                  return (
                                    <tr key={competency.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 pl-10 text-sm text-gray-900">{competency.item_name}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">
                                          {competency.required_level}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <select
                                          value={actualLevel}
                                          onChange={(e) => {
                                            if (isCreate) {
                                              const newRatings = [...employeeFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                              newRatings.push({
                                                leadership_item_id: competency.leadership_item,
                                                actual_level: parseInt(e.target.value),
                                                notes: employeeRating?.notes || ''
                                              });
                                              setEmployeeFormData({ ...employeeFormData, competency_ratings: newRatings });
                                            } else {
                                              const newRatings = [...editFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                              newRatings.push({
                                                leadership_item_id: competency.leadership_item,
                                                actual_level: parseInt(e.target.value),
                                                notes: employeeRating?.notes || ''
                                              });
                                              setEditFormData({ ...editFormData, competency_ratings: newRatings });
                                            }
                                          }}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                        >
                                          <option value={0}>-</option>
                                          {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                        </select>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                                          gap > 0 ? 'bg-emerald-50 text-emerald-700' :
                                          gap < 0 ? 'bg-red-50 text-red-700' :
                                          'bg-sky-50 text-sky-700'
                                        }`}>
                                          {gap > 0 ? `+${gap}` : gap}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2">
                                        <textarea
                                          value={employeeRating?.notes || ''}
                                          onChange={(e) => {
                                            if (isCreate) {
                                              const newRatings = [...employeeFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                              newRatings.push({
                                                leadership_item_id: competency.leadership_item,
                                                actual_level: actualLevel,
                                                notes: e.target.value
                                              });
                                              setEmployeeFormData({ ...employeeFormData, competency_ratings: newRatings });
                                            } else {
                                              const newRatings = [...editFormData.competency_ratings].filter(r => r.leadership_item_id !== competency.leadership_item);
                                              newRatings.push({
                                                leadership_item_id: competency.leadership_item,
                                                actual_level: actualLevel,
                                                notes: e.target.value
                                              });
                                              setEditFormData({ ...editFormData, competency_ratings: newRatings });
                                            }
                                          }}
                                          placeholder="Assessment notes..."
                                          rows="2"
                                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <ActionButton
            onClick={handleClose}
            icon={X}
            label="Cancel"
            variant="outline"
            size="md"
          />
          {isCreate ? (
            currentFormData.position_assessment && !templateError && (
              <>
                <ActionButton
                  onClick={() => handleCreateEmployeeAssessment(true)}
                  icon={Save}
                  label="Save Draft"
                  variant="secondary"
                  size="md"
                  loading={isSubmitting}
                />
                <ActionButton
                  onClick={() => handleCreateEmployeeAssessment(false)}
                  icon={CheckCircle}
                  label="Submit"
                  variant="success"
                  size="md"
                  loading={isSubmitting}
                />
              </>
            )
          ) : (
            <>
              <ActionButton
                onClick={() => handleUpdateEmployeeAssessment(true)}
                icon={Save}
                label="Update Draft"
                variant="secondary"
                size="md"
                loading={isSubmitting}
              />
              <ActionButton
                onClick={() => handleUpdateEmployeeAssessment(false)}
                icon={CheckCircle}
                label="Submit"
                variant="success"
                size="md"
                loading={isSubmitting}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadershipEmployeeModal;
