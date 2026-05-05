'use client';
import React from 'react';
import { Building, Edit, X, Save, Info, AlertCircle } from 'lucide-react';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import MultiSelect from '@/components/common/MultiSelect';
import CollapsibleGroup from '../CollapsibleGroup';
import ActionButton from '../ActionButton';

export const BehavioralPositionModal = ({
  mode, // 'create' | 'edit'
  // create mode props
  showCreatePositionModal,
  positionFormData,
  setPositionFormData,
  positionGroups,
  gradeLevels,
  setGradeLevels,
  selectedGradeLevels,
  setSelectedGradeLevels,
  positionDuplicateError,
  setPositionDuplicateError,
  handlePositionGroupChange,
  handleGradeLevelMultiSelectChange,
  handleCreatePositionAssessment,
  setShowCreatePositionModal,
  // edit mode props
  showEditPositionModal,
  editPositionFormData,
  setEditPositionFormData,
  editGradeLevels,
  editSelectedGradeLevels,
  setEditSelectedGradeLevels,
  handleEditPositionGroupChange,
  handleEditGradeLevelMultiSelectChange,
  handleUpdatePositionAssessment,
  setShowEditPositionModal,
  // shared
  behavioralGroups,
  behavioralScales,
  expandedGroups,
  toggleGroup,
  showScalesInfo,
  setShowScalesInfo,
  isSubmitting,
}) => {
  if (mode === 'create') {
    if (!showCreatePositionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-almet-sapphire" />
              Create Position Template
            </h3>
            <button onClick={() => {
              setShowCreatePositionModal(false);
              setPositionDuplicateError(null);
              setGradeLevels([]);
              setSelectedGradeLevels([]);
              setPositionFormData({ position_group: '', grade_levels: [], competency_ratings: [] });
            }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Hierarchy <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={positionGroups}
                  value={positionFormData.position_group}
                  onChange={handlePositionGroupChange}
                  placeholder="Select Hierarchy"
                  portal={true}
                  allowUncheck={true}
                  zIndex="z-[60]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Grade Levels <span className="text-red-500">*</span>
                </label>
                {!positionFormData.position_group ? (
                  <div className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-400 bg-gray-50">
                    Select Hierarchy first
                  </div>
                ) : gradeLevels.length === 0 ? (
                  <div className="px-3 py-2 border border-amber-300 rounded-md text-sm text-amber-600 bg-amber-50">
                    No grade levels found
                  </div>
                ) : (
                  <MultiSelect
                    options={gradeLevels}
                    selected={selectedGradeLevels}
                    onChange={handleGradeLevelMultiSelectChange}
                    placeholder="Select Grade Levels"
                    fieldName="grade_levels"
                  />
                )}
                {selectedGradeLevels.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ {selectedGradeLevels.length} grade{selectedGradeLevels.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            {positionDuplicateError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Duplicate Template</h4>
                    <p className="text-xs text-red-700 mt-1">{positionDuplicateError.message}</p>
                    <div className="mt-2 text-xs text-red-600">
                      <strong>Hierarchy:</strong> {positionDuplicateError.positionGroup}<br />
                      <strong>Grade Levels:</strong> {positionDuplicateError.gradeLevels}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {positionFormData.position_group && selectedGradeLevels.length > 0 && (
              <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-sky-600 flex-shrink-0" />
                  <div className="space-y-0.5 text-xs flex items-center justify-center gap-6 text-sky-800">
                    <div>• Position: {positionGroups.find(pg => pg.id === positionFormData.position_group)?.name}</div>
                    <div>• Grade Levels: {selectedGradeLevels.sort().join(', ')}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Competency Ratings</h4>
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

            <div className="space-y-2">
              {behavioralGroups.map(group => (
                <CollapsibleGroup
                  key={group.id}
                  title={`${group.name} (${group.competencies?.length || 0} competencies)`}
                  isOpen={expandedGroups[group.id]}
                  onToggle={() => toggleGroup(group.id)}
                >
                  <div className="divide-y divide-gray-100">
                    {group.competencies?.map(competency => (
                      <div key={competency.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div className="flex-1 pr-4">
                          <div className="text-sm font-medium text-gray-900">{competency.name}</div>
                          {competency.description && (
                            <div className="text-xs text-gray-600 mt-0.5">{competency.description}</div>
                          )}
                        </div>
                        <select
                          value={positionFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.id)?.required_level || ''}
                          onChange={(e) => {
                            const newRatings = [...positionFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.id);
                            if (e.target.value) {
                              newRatings.push({
                                behavioral_competency_id: competency.id,
                                required_level: parseInt(e.target.value)
                              });
                            }
                            setPositionFormData({ ...positionFormData, competency_ratings: newRatings });
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                        >
                          <option value="">-</option>
                          {behavioralScales.map(scale => (
                            <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </CollapsibleGroup>
              ))}
            </div>

            {positionFormData.competency_ratings.length > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700">
                  ✓ {positionFormData.competency_ratings.length} competencies rated
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
            <ActionButton
              onClick={() => {
                setShowCreatePositionModal(false);
                setPositionDuplicateError(null);
                setGradeLevels([]);
                setSelectedGradeLevels([]);
                setPositionFormData({ position_group: '', grade_levels: [], competency_ratings: [] });
              }}
              icon={X}
              label="Cancel"
              variant="outline"
              size="md"
            />
            <ActionButton
              onClick={handleCreatePositionAssessment}
              icon={Save}
              label="Create Template"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={!positionFormData.position_group || selectedGradeLevels.length === 0 || positionFormData.competency_ratings.length === 0}
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
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Edit className="w-5 h-5 text-almet-sapphire" />
            Edit Position Template
          </h3>
          <button onClick={() => {
            setShowEditPositionModal(false);
            setEditPositionFormData({ id: '', position_group: '', grade_levels: [], competency_ratings: [] });
            setEditSelectedGradeLevels([]);
          }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 2 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Hierarchy <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={positionGroups}
                portal={true}
                zIndex="z-[60]"
                value={editPositionFormData.position_group}
                onChange={handleEditPositionGroupChange}
                placeholder="Select Hierarchy"
                allowUncheck={true}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Grade Levels <span className="text-red-500">*</span>
              </label>
              {!editPositionFormData.position_group ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-400 bg-gray-50">
                  Select Hierarchy first
                </div>
              ) : editGradeLevels.length === 0 ? (
                <div className="px-3 py-2 border border-amber-300 rounded-md text-sm text-amber-600 bg-amber-50">
                  No grade levels found
                </div>
              ) : (
                <MultiSelect
                  options={editGradeLevels}
                  selected={editSelectedGradeLevels}
                  onChange={handleEditGradeLevelMultiSelectChange}
                  placeholder="Select Grade Levels"
                  fieldName="grade_levels"
                />
              )}
              {editSelectedGradeLevels.length > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  ✓ {editSelectedGradeLevels.length} grade{editSelectedGradeLevels.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          {/* Competency ratings */}
          <div className="space-y-2">
            {behavioralGroups.map(group => (
              <CollapsibleGroup
                key={group.id}
                title={`${group.name} (${group.competencies?.length || 0} competencies)`}
                isOpen={expandedGroups[group.id]}
                onToggle={() => toggleGroup(group.id)}
              >
                <div className="divide-y divide-gray-100">
                  {group.competencies?.map(competency => (
                    <div key={competency.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex-1 pr-4">
                        <div className="text-sm font-medium text-gray-900">{competency.name}</div>
                        {competency.description && (
                          <div className="text-xs text-gray-600 mt-0.5">{competency.description}</div>
                        )}
                      </div>
                      <select
                        value={editPositionFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.id)?.required_level || ''}
                        onChange={(e) => {
                          const newRatings = [...editPositionFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.id);
                          if (e.target.value) {
                            newRatings.push({
                              behavioral_competency_id: competency.id,
                              required_level: parseInt(e.target.value)
                            });
                          }
                          setEditPositionFormData({ ...editPositionFormData, competency_ratings: newRatings });
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                      >
                        <option value="">-</option>
                        {behavioralScales.map(scale => (
                          <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </CollapsibleGroup>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <ActionButton
            onClick={() => {
              setShowEditPositionModal(false);
              setEditPositionFormData({ id: '', position_group: '', grade_levels: [], competency_ratings: [] });
              setEditSelectedGradeLevels([]);
            }}
            icon={X}
            label="Cancel"
            variant="outline"
            size="md"
          />
          <ActionButton
            onClick={handleUpdatePositionAssessment}
            icon={Save}
            label="Update Template"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={!editPositionFormData.position_group || editSelectedGradeLevels.length === 0 || editPositionFormData.competency_ratings.length === 0}
          />
        </div>
      </div>
    </div>
  );
};
