'use client';
import React from 'react';
import { Building, Edit, X, Save, Info, AlertCircle } from 'lucide-react';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import ActionButton from '../ActionButton';
import CollapsibleGroup from '../CollapsibleGroup';
import { toTitleCase } from '../hooks/useCoreAssessment';

export const CorePositionModal = ({
  mode, // 'create' | 'edit'
  // create props
  showCreatePositionModal,
  positionFormData,
  setPositionFormData,
  handleCreatePositionAssessment,
  setShowCreatePositionModal,
  filteredJobTitles,
  handlePositionGroupChange,
  // edit props
  showEditPositionModal,
  editPositionFormData,
  setEditPositionFormData,
  handleUpdatePositionAssessment,
  setShowEditPositionModal,
  editFilteredJobTitles,
  handleEditPositionGroupChange,
  // shared
  positionGroups,
  coreScales,
  skillGroups,
  showCoreScalesInfo,
  setShowCoreScalesInfo,
  expandedCreateGroups,
  setExpandedCreateGroups,
  expandedEditGroups,
  setExpandedEditGroups,
  isSubmitting,
}) => {
  if (mode === 'create') {
    if (!showCreatePositionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-almet-sapphire" />
              Create Position Template
            </h3>
            <button
              onClick={() => {
                setShowCreatePositionModal(false);
                setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
              }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                 Hierarchy  <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={positionGroups.map(group => ({
                    value: group.id,
                    label: group.name
                  }))}
                   portal={true}
                zIndex="z-[60]"
                  value={positionFormData.position_group}
                  onChange={handlePositionGroupChange}
                  placeholder="Select Hierarchy"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={filteredJobTitles.map(title => ({
                    value: title.value,
                    label: toTitleCase(title.name)
                  }))}
                   portal={true}
                zIndex="z-[60]"
                  value={positionFormData.job_title}
                  onChange={(value) => setPositionFormData({...positionFormData, job_title: value})}
                  placeholder={positionFormData.position_group ? "Select or type job title" : "Select Hierarchy first"}
                  disabled={!positionFormData.position_group}
                />
              </div>
            </div>

            {/* Core Scales Info */}
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

            {/* Skills Assessment Matrix */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Required Skill Levels</h4>

              {skillGroups.length > 0 ? (
                skillGroups.map(group => (
                  <CollapsibleGroup
                    key={group.id}
                    title={group.name}
                    isOpen={expandedCreateGroups[group.id] || false}
                    onToggle={() => setExpandedCreateGroups(prev => ({
                      ...prev,
                      [group.id]: !prev[group.id]
                    }))}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-32">Required Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {group.skills && group.skills.length > 0 ? (
                            group.skills.map(skill => (
                              <tr key={skill.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                                  {skill.description && (
                                    <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <select
                                    value={positionFormData.competency_ratings.find(r => r.skill_id === skill.id)?.required_level || ''}
                                    onChange={(e) => {
                                      const newRatings = [...positionFormData.competency_ratings];
                                      const existingIndex = newRatings.findIndex(r => r.skill_id === skill.id);

                                      if (existingIndex >= 0) {
                                        if (e.target.value) {
                                          newRatings[existingIndex].required_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.splice(existingIndex, 1);
                                        }
                                      } else if (e.target.value) {
                                        newRatings.push({
                                          skill_id: skill.id,
                                          required_level: parseInt(e.target.value)
                                        });
                                      }

                                      setPositionFormData({...positionFormData, competency_ratings: newRatings});
                                    }}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                  >
                                    <option value="">-</option>
                                    {coreScales.map(scale => (
                                      <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" className="px-3 py-4 text-center text-sm text-gray-500">
                                No skills found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleGroup>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No skill groups found</p>
                </div>
              )}
            </div>

            {/* Rating Summary */}
            {positionFormData.competency_ratings.length > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700">
                  ✓ {positionFormData.competency_ratings.length} skills rated
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
            <ActionButton
              onClick={() => {
                setShowCreatePositionModal(false);
                setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
              }}
              icon={X}
              label="Cancel"
              disabled={isSubmitting}
              variant="outline"
              size="md"
            />
            <ActionButton
              onClick={handleCreatePositionAssessment}
              icon={Save}
              label="Create Template"
              disabled={!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0}
              loading={isSubmitting}
              variant="primary"
              size="md"
            />
          </div>
        </div>
      </div>
    );
  }

  // mode === 'edit'
  if (!showEditPositionModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Edit className="w-5 h-5 text-almet-sapphire" />
            Edit Position Template
          </h3>
          <button
            onClick={() => {
              setShowEditPositionModal(false);
              setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
            }}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
               Hierarchy  <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={positionGroups.map(group => ({
                  value: group.id,
                  label: group.name
                }))}
                 portal={true}
                zIndex="z-[60]"
                value={editPositionFormData.position_group}
                onChange={handleEditPositionGroupChange}
                placeholder="Select Hierarchy"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={editFilteredJobTitles.map(title => ({
                  value: title.value,
                  label: toTitleCase(title.name)
                }))}
                 portal={true}
                zIndex="z-[60]"
                value={editPositionFormData.job_title}
                onChange={(value) => setEditPositionFormData({...editPositionFormData, job_title: value})}
                placeholder={editPositionFormData.position_group ? "Select or type job title" : "Select Hierarchy first"}
                disabled={!editPositionFormData.position_group}
              />
            </div>
          </div>

          {/* Core Scales Info */}
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

          {/* Skills Assessment Matrix */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 text-center mb-3">Update Required Skill Levels</h4>

            {skillGroups.length > 0 ? (
              skillGroups.map(group => (
                <CollapsibleGroup
                  key={group.id}
                  title={group.name}
                  isOpen={expandedEditGroups[group.id] || false}
                  onToggle={() => setExpandedEditGroups(prev => ({
                    ...prev,
                    [group.id]: !prev[group.id]
                  }))}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Skill</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-32">Required Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.skills && group.skills.length > 0 ? (
                          group.skills.map(skill => (
                            <tr key={skill.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                                {skill.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select
                                  value={editPositionFormData.competency_ratings.find(r => r.skill_id === skill.id)?.required_level || ''}
                                  onChange={(e) => {
                                    const newRatings = [...editPositionFormData.competency_ratings];
                                    const existingIndex = newRatings.findIndex(r => r.skill_id === skill.id);

                                    if (existingIndex >= 0) {
                                      if (e.target.value) {
                                        newRatings[existingIndex].required_level = parseInt(e.target.value);
                                      } else {
                                        newRatings.splice(existingIndex, 1);
                                      }
                                    } else if (e.target.value) {
                                      newRatings.push({
                                        skill_id: skill.id,
                                        required_level: parseInt(e.target.value)
                                      });
                                    }

                                    setEditPositionFormData({...editPositionFormData, competency_ratings: newRatings});
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                >
                                  <option value="">-</option>
                                  {coreScales.map(scale => (
                                    <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="px-3 py-4 text-center text-sm text-gray-500">
                              No skills found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleGroup>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No skill groups found</p>
              </div>
            )}
          </div>

          {/* Rating Summary */}
          {editPositionFormData.competency_ratings.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                ✓ {editPositionFormData.competency_ratings.length} skills rated
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <ActionButton
            onClick={() => {
              setShowEditPositionModal(false);
              setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
            }}
            icon={X}
            label="Cancel"
            disabled={isSubmitting}
            variant="outline"
            size="md"
          />
          <ActionButton
            onClick={handleUpdatePositionAssessment}
            icon={Save}
            label="Update Template"
            disabled={!editPositionFormData.position_group || !editPositionFormData.job_title || editPositionFormData.competency_ratings.length === 0}
            loading={isSubmitting}
            variant="primary"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};
