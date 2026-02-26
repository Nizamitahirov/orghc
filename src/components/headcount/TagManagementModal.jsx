// src/components/headcount/TagManagementModal.jsx - With Common Components
import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, Tag, Plus, Minus, Check, AlertCircle, RefreshCw, User } from 'lucide-react';
import { useReferenceData } from '../../hooks/useReferenceData';
import { useToast } from '../common/Toast';
import SearchableDropdown from '../common/SearchableDropdown';

const TagManagementModal = ({
  isOpen,
  onClose,
  onAction,
  selectedEmployees = [],
  selectedEmployeeData = [],
  darkMode = false
}) => {
  const [selectedTagId, setSelectedTagId] = useState('');
  const [operationType, setOperationType] = useState('replace');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useToast();

  // API data from hooks
  const {
    employeeTags = [],
    loading = {},
    error = {},
    fetchEmployeeTags,
    getFormattedEmployeeTags,
    hasEmployeeTags
  } = useReferenceData();

  // Format tags for SearchableDropdown
  const tagOptions = useMemo(() => {
    const formatted = getFormattedEmployeeTags?.() || employeeTags;
    
    return formatted
      .filter(tag => tag.is_active !== false)
      .map(tag => ({
        value: (tag.id || tag.value).toString(),
        label: tag.name || tag.label,
        color: tag.color || '#6B7280',
        employee_count: tag.employee_count || 0
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [employeeTags, getFormattedEmployeeTags]);

  const isLoading = loading?.employeeTags || false;
  const hasError = error?.employeeTags || false;

  // Clean theme classes
  const bgModal = darkMode ? "bg-gray-900" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgHover = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Analyze current tags for selected employees
  const employeeTagAnalysis = useMemo(() => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) {
      return {
        employeesWithTags: 0,
        employeesWithoutTags: 0,
        currentTags: {},
        employeeTagMap: {}
      };
    }

    const employeeTagMap = {};
    const currentTags = {};
    let employeesWithTags = 0;

    selectedEmployeeData.forEach(emp => {
      let currentTag = null;
      
      if (emp.tagInfo?.tags && Array.isArray(emp.tagInfo.tags) && emp.tagInfo.tags.length > 0) {
        currentTag = emp.tagInfo.tags[0];
      } else if (emp.tags && Array.isArray(emp.tags) && emp.tags.length > 0) {
        currentTag = emp.tags[0];
      } else if (emp.tag_names && Array.isArray(emp.tag_names) && emp.tag_names.length > 0) {
        currentTag = emp.tag_names[0];
      } else if (emp.tag_id || emp.tag_name) {
        currentTag = {
          id: emp.tag_id,
          name: emp.tag_name
        };
      }
      
      if (currentTag) {
        employeesWithTags++;
        const tagId = typeof currentTag === 'object' ? 
          (currentTag.id || currentTag.value) : currentTag;
        const tagName = typeof currentTag === 'object' ? 
          (currentTag.name || currentTag.label || currentTag) : currentTag;
        
        employeeTagMap[emp.id] = { 
          id: tagId, 
          name: tagName.toString()
        };
        
        if (!currentTags[tagId]) {
          currentTags[tagId] = { count: 0, name: tagName.toString() };
        }
        currentTags[tagId].count++;
      } else {
        employeeTagMap[emp.id] = null;
      }
    });

    return {
      employeesWithTags,
      employeesWithoutTags: selectedEmployeeData.length - employeesWithTags,
      currentTags,
      employeeTagMap
    };
  }, [selectedEmployeeData]);

  const selectedTag = useMemo(() => {
    return tagOptions.find(tag => tag.value === selectedTagId);
  }, [tagOptions, selectedTagId]);

  // Initialize modal
  useEffect(() => {
    if (isOpen) {
      setSelectedTagId('');
      setOperationType('replace');
      
      if (!hasEmployeeTags() && fetchEmployeeTags) {
        fetchEmployeeTags();
      }
    }
  }, [isOpen, hasEmployeeTags, fetchEmployeeTags]);

  const handleRefreshTags = () => {
    if (fetchEmployeeTags) {
      fetchEmployeeTags();
    }
  };

  const handleExecuteTagOperation = async () => {
    if (operationType === 'replace' && !selectedTagId) {
      showError('Please select a tag to assign');
      return;
    }

    if (selectedEmployees.length === 0) {
      showError('No employees selected');
      return;
    }

    setIsProcessing(true);
    
    try {
      if (operationType === 'remove') {
        const removalPromises = [];
        
        Object.entries(employeeTagAnalysis.employeeTagMap).forEach(([empId, tagInfo]) => {
          if (tagInfo && selectedEmployees.includes(parseInt(empId))) {
            const existingPromise = removalPromises.find(p => p.tagId === tagInfo.id);
            if (existingPromise) {
              existingPromise.employeeIds.push(parseInt(empId));
            } else {
              removalPromises.push({
                tagId: tagInfo.id,
                employeeIds: [parseInt(empId)]
              });
            }
          }
        });

        for (const removal of removalPromises) {
          if (removal.employeeIds.length > 0) {
            await onAction('bulkRemoveTags', {
              employee_ids: removal.employeeIds,
              tag_id: removal.tagId
            });
          }
        }

      } else if (operationType === 'replace') {
        const employeesWithCurrentTags = selectedEmployees.filter(empId => 
          employeeTagAnalysis.employeeTagMap[empId] !== null
        );

        if (employeesWithCurrentTags.length > 0) {
          const tagGroups = {};
          employeesWithCurrentTags.forEach(empId => {
            const tagInfo = employeeTagAnalysis.employeeTagMap[empId];
            if (tagInfo) {
              if (!tagGroups[tagInfo.id]) {
                tagGroups[tagInfo.id] = [];
              }
              tagGroups[tagInfo.id].push(empId);
            }
          });

          for (const [tagId, employeeIds] of Object.entries(tagGroups)) {
            await onAction('bulkRemoveTags', {
              employee_ids: employeeIds,
              tag_id: parseInt(tagId)
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        await onAction('bulkAddTags', {
          employee_ids: selectedEmployees,
          tag_id: parseInt(selectedTagId)
        });
      }
      
      showSuccess(`Tag ${operationType === 'replace' ? 'assignment' : 'removal'} completed successfully`);
      onClose();
    } catch (error) {
      showError(`Tag operations failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative ${bgModal} rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden border ${borderColor}`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-almet-sapphire rounded-md flex items-center justify-center mr-2">
              <Tag className="w-3 h-3 text-white" />
            </div>
            <div>
              <h2 className={`text-sm font-medium ${textPrimary}`}>
                Tag Management
              </h2>
              <p className={`text-xs ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefreshTags}
              disabled={isProcessing || isLoading}
              className={`p-1.5 rounded-md ${bgHover} transition-colors disabled:opacity-50`}
              title="Refresh tags"
            >
              <RefreshCw 
                className={`w-3.5 h-3.5 ${textSecondary} ${isLoading ? 'animate-spin' : ''}`} 
              />
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`p-1.5 rounded-md ${bgHover} transition-colors disabled:opacity-50`}
            >
              <X className={`w-3.5 h-3.5 ${textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Operation Mode Selection */}
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-2`}>Operation Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOperationType('replace')}
                  disabled={isProcessing}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50 ${
                    operationType === 'replace'
                      ? 'bg-almet-sapphire text-white border-almet-sapphire'
                      : `border-gray-300 dark:border-gray-600 ${textSecondary} ${bgHover}`
                  }`}
                >
                  Replace Tag
                </button>
                <button
                  onClick={() => setOperationType('remove')}
                  disabled={isProcessing}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50 ${
                    operationType === 'remove'
                      ? 'bg-red-500 text-white border-red-500'
                      : `border-gray-300 dark:border-gray-600 ${textSecondary} ${bgHover}`
                  }`}
                >
                  Remove Tags
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className={`text-sm ${textMuted}`}>Loading tags...</span>
              </div>
            )}

            {/* Error State */}
            {hasError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-sm text-red-800 dark:text-red-300">
                      Failed to load tags
                    </span>
                  </div>
                  <button
                    onClick={handleRefreshTags}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Selected Employees */}
            {selectedEmployeeData.length > 0 && (
              <div>
                <label className={`block text-xs font-medium ${textPrimary} mb-2`}>
                  Selected Employees ({selectedEmployeeData.length})
                </label>
                <div className="max-h-24 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-md p-2 space-y-1">
                  {selectedEmployeeData.slice(0, 5).map((emp) => {
                    const currentTag = employeeTagAnalysis.employeeTagMap[emp.id];
                    return (
                      <div key={emp.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-almet-sapphire/20 rounded-md flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-almet-sapphire">
                              {(emp.first_name || emp.fullName || '').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className={`font-medium ${textPrimary}`}>
                              {emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()}
                            </div>
                            <div className={`text-xs ${textMuted}`}>
                              {emp.jobTitle || emp.job_title}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs">
                          {currentTag ? (
                            <span className="px-2 py-0.5 bg-almet-sapphire/10 border border-almet-sapphire/20 rounded-full text-almet-sapphire">
                              {currentTag.name}
                            </span>
                          ) : (
                            <span className={`${textMuted} bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full`}>No tag</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {selectedEmployeeData.length > 5 && (
                    <div className={`text-xs ${textMuted} text-center py-1`}>
                      ... and {selectedEmployeeData.length - 5} more employees
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tag Selection using SearchableDropdown */}
            {operationType === 'replace' && !isLoading && !hasError && tagOptions.length > 0 && (
              <div>
                <label className={`block text-xs font-medium ${textPrimary} mb-2`}>
                  Select Tag to Assign
                </label>
                <SearchableDropdown
                  options={tagOptions}
                  value={selectedTagId}
                  onChange={(value) => setSelectedTagId(value)}
                  placeholder="Search and select a tag..."
                  searchPlaceholder="Search tags..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  className="w-full"
                  disabled={isProcessing}
                  portal={true}
                  zIndex="z-[60]"
                />
                
                {/* Selected tag preview */}
                {selectedTag && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: selectedTag.color }}
                      />
                      <span className={`text-sm font-medium ${textPrimary}`}>
                        {selectedTag.label}
                      </span>
                      <span className={`ml-2 text-xs ${textMuted}`}>
                        ({selectedTag.employee_count} employees have this tag)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Data State */}
            {!isLoading && !hasError && tagOptions.length === 0 && (
              <div className="text-center py-6">
                <Tag className={`w-8 h-8 mx-auto mb-3 ${textMuted}`} />
                <h3 className={`text-sm font-medium ${textPrimary} mb-1`}>No tags available</h3>
                <p className={`text-xs ${textMuted} mb-3`}>
                  No employee tags have been created yet.
                </p>
                <button
                  onClick={handleRefreshTags}
                  className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-md hover:bg-almet-astral transition-colors"
                >
                  Refresh Tags
                </button>
              </div>
            )}

            {/* Operation Preview */}
            {operationType === 'replace' && selectedTag && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <h4 className={`font-medium text-sm ${textPrimary} mb-1 flex items-center`}>
                  <Tag className="w-3.5 h-3.5 mr-1 text-almet-sapphire" />
                  Tag Assignment Preview
                </h4>
                <p className={`text-xs ${textSecondary}`}>
                  <strong>{selectedTag.label}</strong> will be assigned to <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''}.
                </p>
                {employeeTagAnalysis.employeesWithTags > 0 && (
                  <p className={`text-xs ${textMuted} mt-1 flex items-center`}>
                    <span className="text-amber-500 mr-1">⚠</span>
                    {employeeTagAnalysis.employeesWithTags} employee{employeeTagAnalysis.employeesWithTags !== 1 ? 's' : ''} will have their current tags replaced.
                  </p>
                )}
              </div>
            )}

            {operationType === 'remove' && employeeTagAnalysis.employeesWithTags > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <h4 className={`font-medium text-sm ${textPrimary} mb-1 flex items-center`}>
                  <Minus className="w-3.5 h-3.5 mr-1 text-red-600" />
                  Tag Removal Preview
                </h4>
                <p className={`text-xs ${textSecondary}`}>
                  Tags will be removed from <strong>{employeeTagAnalysis.employeesWithTags}</strong> out of <strong>{selectedEmployees.length}</strong> selected employee{selectedEmployees.length !== 1 ? 's' : ''}.
                </p>
              </div>
            )}

            {/* Statistics */}
            {tagOptions.length > 0 && (
              <div className={`text-xs ${textMuted} text-center p-2 bg-gray-50 dark:bg-gray-800/30 rounded-md`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-medium">Available</div>
                    <div className="text-almet-sapphire font-semibold">{tagOptions.length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Tagged</div>
                    <div className="text-emerald-600 font-semibold">{employeeTagAnalysis.employeesWithTags}</div>
                  </div>
                  <div>
                    <div className="font-medium">Selected</div>
                    <div className="text-purple-600 font-semibold">{selectedEmployees.length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t ${borderColor} bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between`}>
          <div className="flex items-center">
            <span className={`text-xs ${textMuted}`}>
              {operationType === 'replace' && selectedTagId ? 
                `Ready to replace tags for ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}` :
                operationType === 'remove' ? 
                `Ready to remove tags from ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}` :
                'Select operation and tag'
              }
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`px-3 py-1.5 text-xs font-medium border ${borderColor} rounded-md ${textSecondary} ${bgHover} transition-colors disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteTagOperation}
              disabled={
                isProcessing || 
                selectedEmployees.length === 0 || 
                (operationType === 'replace' && !selectedTagId) ||
                isLoading
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || 
                selectedEmployees.length === 0 || 
                (operationType === 'replace' && !selectedTagId) ||
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : operationType === 'replace'
                  ? 'bg-almet-sapphire hover:bg-almet-astral text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Processing...
                </div>
              ) : (
                operationType === 'replace' 
                  ? `Replace Tags (${selectedEmployees.length})` 
                  : `Remove Tags (${selectedEmployees.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;