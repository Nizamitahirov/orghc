'use client';
import React from 'react';
import { User, Edit, X, Save, CheckCircle, Info, AlertCircle } from 'lucide-react';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import ActionButton from '../ActionButton';

export const BehavioralEmployeeModal = ({
  mode, // 'create' | 'edit'
  // create mode props
  showCreateEmployeeModal,
  setShowCreateEmployeeModal,
  employeeFormData,
  setEmployeeFormData,
  employees,
  handleEmployeeChange,
  handleCreateEmployeeAssessment,
  templateError,
  setTemplateError,
  selectedEmployeeInfo,
  setSelectedEmployeeInfo,
  positionAssessments,
  // edit mode props
  showEditEmployeeModal,
  setShowEditEmployeeModal,
  editFormData,
  setEditFormData,
  handleUpdateEmployeeAssessment,
  // shared
  behavioralScales,
  showScalesInfo,
  setShowScalesInfo,
  isSubmitting,
}) => {
  if (mode === 'create') {
    if (!showCreateEmployeeModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-almet-sapphire" />
              Create Employee Assessment
            </h3>
            <button onClick={() => { setShowCreateEmployeeModal(false); setTemplateError(null); setSelectedEmployeeInfo(null); }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Employee <span className="text-red-500">*</span></label>
              <SearchableDropdown options={employees} portal={true} zIndex="z-[60]" value={employeeFormData.employee} onChange={handleEmployeeChange} placeholder="Select Employee" allowUncheck={true} />
            </div>

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

            {templateError && (
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

            {employeeFormData.position_assessment && !templateError && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Competency Assessment</h4>
                  <button onClick={() => setShowScalesInfo(!showScalesInfo)} className="text-xs text-almet-sapphire hover:text-almet-astral flex items-center gap-1">
                    <Info size={14} />
                    {showScalesInfo ? 'Hide' : 'Show'} Scale Info
                  </button>
                </div>

                {showScalesInfo && (
                  <div className="mb-4 bg-sky-50 border border-sky-200 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-sky-900 mb-2">Behavioral Assessment Scales:</h5>
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
                          const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                          if (!selectedPosition) return null;

                          const groupedCompetencies = {};
                          selectedPosition.competency_ratings?.forEach(rating => {
                            const groupName = rating.competency_group_name || 'Other';
                            if (!groupedCompetencies[groupName]) groupedCompetencies[groupName] = [];
                            groupedCompetencies[groupName].push(rating);
                          });

                          return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                            <React.Fragment key={groupName}>
                              <tr className="bg-gray-100">
                                <td colSpan="5" className="px-3 py-2 text-xs font-semibold text-gray-700">{groupName}</td>
                              </tr>
                              {competencies.map(competency => {
                                const employeeRating = employeeFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.behavioral_competency);
                                const actualLevel = employeeRating?.actual_level || 0;
                                const gap = actualLevel - competency.required_level;

                                return (
                                  <tr key={competency.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-900">{competency.competency_name}</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{competency.required_level}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <select value={actualLevel} onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                        newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: parseInt(e.target.value), notes: employeeRating?.notes || '' });
                                        setEmployeeFormData({ ...employeeFormData, competency_ratings: newRatings });
                                      }} className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none">
                                        <option value={0}>-</option>
                                        {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${gap > 0 ? 'bg-emerald-50 text-emerald-700' : gap < 0 ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-700'}`}>
                                        {gap > 0 ? `+${gap}` : gap}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <textarea value={employeeRating?.notes || ''} onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                        newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: actualLevel, notes: e.target.value });
                                        setEmployeeFormData({ ...employeeFormData, competency_ratings: newRatings });
                                      }} placeholder="Assessment notes..." rows="2" className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none" />
                                    </td>
                                  </tr>
                                );
                              })}
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
            <ActionButton onClick={() => { setShowCreateEmployeeModal(false); setTemplateError(null); setSelectedEmployeeInfo(null); }} icon={X} label="Cancel" variant="outline" size="md" />
            {employeeFormData.position_assessment && !templateError && (
              <>
                <ActionButton onClick={() => handleCreateEmployeeAssessment(true)} icon={Save} label="Save Draft" variant="secondary" size="md" loading={isSubmitting} />
                <ActionButton onClick={() => handleCreateEmployeeAssessment(false)} icon={CheckCircle} label="Submit" variant="success" size="md" loading={isSubmitting} />
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
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Edit className="w-5 h-5 text-almet-sapphire" />
            Edit Employee Assessment
          </h3>
          <button onClick={() => { setShowEditEmployeeModal(false); setSelectedEmployeeInfo(null); }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
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
                    const selectedPosition = positionAssessments.find(p => p.id === editFormData.position_assessment);
                    if (!selectedPosition) return null;

                    const groupedCompetencies = {};
                    selectedPosition.competency_ratings?.forEach(rating => {
                      const groupName = rating.competency_group_name || 'Other';
                      if (!groupedCompetencies[groupName]) groupedCompetencies[groupName] = [];
                      groupedCompetencies[groupName].push(rating);
                    });

                    return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                      <React.Fragment key={groupName}>
                        <tr className="bg-gray-100">
                          <td colSpan="5" className="px-3 py-2 text-xs font-semibold text-gray-700">{groupName}</td>
                        </tr>
                        {competencies.map(competency => {
                          const employeeRating = editFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.behavioral_competency);
                          const actualLevel = employeeRating?.actual_level || 0;
                          const gap = actualLevel - competency.required_level;

                          return (
                            <tr key={competency.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm text-gray-900">{competency.competency_name}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{competency.required_level}</span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select value={actualLevel} onChange={(e) => {
                                  const newRatings = [...editFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                  newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: parseInt(e.target.value), notes: employeeRating?.notes || '' });
                                  setEditFormData({ ...editFormData, competency_ratings: newRatings });
                                }} className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none">
                                  <option value={0}>-</option>
                                  {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${gap > 0 ? 'bg-emerald-50 text-emerald-700' : gap < 0 ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-700'}`}>
                                  {gap > 0 ? `+${gap}` : gap}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <textarea value={employeeRating?.notes || ''} onChange={(e) => {
                                  const newRatings = [...editFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                  newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: actualLevel, notes: e.target.value });
                                  setEditFormData({ ...editFormData, competency_ratings: newRatings });
                                }} placeholder="Assessment notes..." rows="2" className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none" />
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <ActionButton onClick={() => { setShowEditEmployeeModal(false); setSelectedEmployeeInfo(null); }} icon={X} label="Cancel" variant="outline" size="md" />
          <ActionButton onClick={() => handleUpdateEmployeeAssessment(true)} icon={Save} label="Update Draft" variant="secondary" size="md" loading={isSubmitting} />
          <ActionButton onClick={() => handleUpdateEmployeeAssessment(false)} icon={CheckCircle} label="Submit" variant="success" size="md" loading={isSubmitting} />
        </div>
      </div>
    </div>
  );
};
