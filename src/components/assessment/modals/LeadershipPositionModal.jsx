'use client';
import React from 'react';
import { Crown, Edit, X, Info, AlertCircle, Save, Building, ChevronDown, ChevronRight } from 'lucide-react';
import ActionButton from '../ActionButton';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import MultiSelect from '@/components/common/MultiSelect';
import CollapsibleGroup from '../CollapsibleGroup';

export const LeadershipPositionModal = ({
  mode, // 'create' | 'edit'
  isOpen,
  onClose,
  positionGroups,
  gradeLevels,
  editGradeLevels,
  selectedGradeLevels,
  editSelectedGradeLevels,
  positionFormData,
  setPositionFormData,
  editPositionFormData,
  setEditPositionFormData,
  behavioralScales,
  leadershipMainGroups,
  expandedGroups,
  expandedChildGroups,
  positionDuplicateError,
  showScalesInfo,
  setShowScalesInfo,
  isSubmitting,
  handlePositionGroupChange,
  handleEditPositionGroupChange,
  handleGradeLevelMultiSelectChange,
  handleEditGradeLevelMultiSelectChange,
  handleCreatePositionAssessment,
  handleUpdatePositionAssessment,
  toggleGroup,
  toggleChildGroup,
  setGradeLevels,
  setSelectedGradeLevels,
  setEditGradeLevels,
  setEditSelectedGradeLevels,
  setPositionDuplicateError,
}) => {
  if (!isOpen) return null;

  const isCreate = mode === 'create';

  const handleClose = () => {
    if (isCreate) {
      setPositionDuplicateError(null);
      setGradeLevels([]);
      setSelectedGradeLevels([]);
      setPositionFormData({ position_group: '', grade_levels: [], competency_ratings: [] });
    } else {
      setEditGradeLevels([]);
      setEditSelectedGradeLevels([]);
      setEditPositionFormData({ id: '', position_group: '', grade_levels: [], competency_ratings: [] });
    }
    onClose();
  };

  // Create mode derived values
  const currentFormData = isCreate ? positionFormData : editPositionFormData;
  const currentGradeLevels = isCreate ? gradeLevels : editGradeLevels;
  const currentSelectedGradeLevels = isCreate ? selectedGradeLevels : editSelectedGradeLevels;
  const currentOnGroupChange = isCreate ? handlePositionGroupChange : handleEditPositionGroupChange;
  const currentOnMultiSelectChange = isCreate ? handleGradeLevelMultiSelectChange : handleEditGradeLevelMultiSelectChange;
  const currentOnSubmit = isCreate ? handleCreatePositionAssessment : handleUpdatePositionAssessment;
  const submitLabel = isCreate ? 'Create Template' : 'Update Template';
  const title = isCreate ? 'Create Leadership Position Template' : 'Edit Leadership Position Template';
  const TitleIcon = isCreate ? Crown : Edit;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] shadow-xl">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Hierarchy <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={positionGroups}
                value={currentFormData.position_group}
                onChange={currentOnGroupChange}
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
              {!currentFormData.position_group ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-400 bg-gray-50">
                  Select Hierarchy first
                </div>
              ) : currentGradeLevels.length === 0 ? (
                <div className="px-3 py-2 border border-amber-300 rounded-md text-sm text-amber-600 bg-amber-50">
                  No grade levels found
                </div>
              ) : (
                <MultiSelect
                  options={currentGradeLevels}
                  selected={currentSelectedGradeLevels}
                  onChange={currentOnMultiSelectChange}
                  placeholder="Select Grade Levels"
                  fieldName="grade_levels"
                />
              )}
              {currentSelectedGradeLevels.length > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  ✓ {currentSelectedGradeLevels.length} grade{currentSelectedGradeLevels.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          {/* Duplicate error (create only) */}
          {isCreate && positionDuplicateError && (
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

          {/* Info bar (create only) */}
          {isCreate && currentFormData.position_group && currentSelectedGradeLevels.length > 0 && (
            <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-4 h-4 mt-0.5 text-sky-600 flex-shrink-0" />
                <div className="space-y-0.5 text-xs flex items-center justify-center gap-6 text-sky-800">
                  <div>• Position: {positionGroups.find(pg => pg.id === currentFormData.position_group)?.name}</div>
                  <div>• Grade Levels: {currentSelectedGradeLevels.sort().join(', ')}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Leadership Competency Ratings</h4>
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

          <div className="space-y-2">
            {leadershipMainGroups.map(mainGroup => {
              const totalItems = mainGroup.child_groups?.reduce((acc, cg) => acc + (cg.items?.length || 0), 0) || 0;

              return (
                <CollapsibleGroup
                  key={mainGroup.id}
                  title={`${mainGroup.name} (${totalItems} items)`}
                  isOpen={expandedGroups[mainGroup.id]}
                  onToggle={() => toggleGroup(mainGroup.id)}
                >
                  <div className="space-y-2">
                    {mainGroup.child_groups && mainGroup.child_groups.length > 0 ? (
                      mainGroup.child_groups.map(childGroup => (
                        <div key={childGroup.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* CHILD GROUP HEADER - Collapsible */}
                          <button
                            onClick={() => toggleChildGroup(childGroup.id)}
                            className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Building size={14} className="text-almet-sapphire" />
                              <h5 className="text-xs font-semibold text-gray-700">{childGroup.name}</h5>
                              <span className="ml-auto text-xs text-gray-500">({childGroup.items?.length || 0} items)</span>
                            </div>
                            {expandedChildGroups[childGroup.id] ? (
                              <ChevronDown size={16} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={16} className="text-gray-600" />
                            )}
                          </button>

                          {/* CHILD GROUP CONTENT - Collapsible */}
                          {expandedChildGroups[childGroup.id] && (
                            <div className="divide-y divide-gray-100">
                              {childGroup.items && childGroup.items.length > 0 ? (
                                childGroup.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                    <div className="flex-1 pr-4">
                                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    </div>
                                    {isCreate ? (
                                      <select
                                        value={positionFormData.competency_ratings.find(r => r.leadership_item_id === item.id)?.required_level || ''}
                                        onChange={(e) => {
                                          const newRatings = [...positionFormData.competency_ratings].filter(r => r.leadership_item_id !== item.id);
                                          if (e.target.value) newRatings.push({ leadership_item_id: item.id, required_level: parseInt(e.target.value) });
                                          setPositionFormData({ ...positionFormData, competency_ratings: newRatings });
                                        }}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                      >
                                        <option value="">-</option>
                                        {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                      </select>
                                    ) : (
                                      <select
                                        value={editPositionFormData.competency_ratings.find(r => r.leadership_item_id === item.id)?.required_level || ''}
                                        onChange={(e) => {
                                          const newRatings = [...editPositionFormData.competency_ratings].filter(r => r.leadership_item_id !== item.id);
                                          if (e.target.value) newRatings.push({ leadership_item_id: item.id, required_level: parseInt(e.target.value) });
                                          setEditPositionFormData({ ...editPositionFormData, competency_ratings: newRatings });
                                        }}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
                                      >
                                        <option value="">-</option>
                                        {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                      </select>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-4 text-center text-xs text-gray-400">
                                  No items in this group
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">
                        No child groups in this main group
                      </div>
                    )}
                  </div>
                </CollapsibleGroup>
              );
            })}
          </div>

          {currentFormData.competency_ratings.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">✓ {currentFormData.competency_ratings.length} competencies rated</p>
            </div>
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
          <ActionButton
            onClick={currentOnSubmit}
            icon={Save}
            label={submitLabel}
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={!currentFormData.position_group || currentSelectedGradeLevels.length === 0 || currentFormData.competency_ratings.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default LeadershipPositionModal;
