// Compact Single Tag Management Modal - Practical Design with Soft Colors
"use client";
import { useState, useEffect, useMemo } from "react";
import { X, Tag, Plus, Trash2, Hash, RefreshCw, Check } from "lucide-react";

// Import common components
import { useToast } from "../common/Toast";
import ConfirmationModal from "../common/ConfirmationModal";
import SearchableDropdown from "../common/SearchableDropdown";

const TagManagementModal = ({
  isOpen,
  onClose,
  employee,
  availableTags = [],
  onTagOperation,
  loading = { add: false, remove: false },
  darkMode = false
}) => {
  const [selectedOperation, setSelectedOperation] = useState("assign");
  const [selectedTag, setSelectedTag] = useState(null);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });

  // Toast notifications
  const { showSuccess, showError, showWarning } = useToast();

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      const hasTag = getCurrentTag() !== null;
      setSelectedOperation(hasTag ? "replace" : "assign");
      setSelectedTag(null);
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  }, [isOpen]);

  // Get current single tag
  const getCurrentTag = () => {
    if (!employee) return null;
    
    const tagSources = [
      employee?.tag_names?.[0],
      employee?.tags?.[0],
      employee?.tagNames?.[0],
      employee?.tag_list?.[0],
      employee?.assigned_tags?.[0],
      employee?.employee_tags?.[0],
      employee?.primary_tag,
      employee?.tag
    ];
    
    for (const source of tagSources) {
      if (source) {
        if (typeof source === 'string' && source.trim()) {
          return source.trim();
        } else if (source && typeof source === 'object') {
          const tagName = source.name || source.tag_name || source.label || source.title || source.value;
          if (tagName && typeof tagName === 'string') {
            return tagName.trim();
          }
        }
      }
    }
    
    return null;
  };

  const currentTag = getCurrentTag();
  const hasCurrentTag = currentTag !== null;

  // Prepare dropdown options
  const dropdownOptions = useMemo(() => {
    if (!Array.isArray(availableTags)) return [];
    
    return availableTags
      .filter(tag => {
        if (!tag || typeof tag !== 'object') return false;
        
        const tagId = tag.id || tag.tag_id || tag.value;
        const tagName = tag.name || tag.tag_name || tag.label;
        
        if (!tagId || !tagName) return false;
        
        // For assign/replace operations, exclude current tag
        if ((selectedOperation === "assign" || selectedOperation === "replace") && currentTag) {
          const normalizedTagName = tagName.toString().trim().toLowerCase();
          return normalizedTagName !== currentTag.toLowerCase();
        }
        
        return true;
      })
      .map(tag => ({
        value: tag.id || tag.tag_id || tag.value,
        label: tag.name || tag.tag_name || tag.label,
        originalTag: tag
      }));
  }, [availableTags, currentTag, selectedOperation]);

  // Confirmation modal helpers
  const openConfirmation = (config) => {
    setConfirmationModal({
      isOpen: true,
      ...config
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  const executeConfirmedAction = async () => {
    const { onConfirm } = confirmationModal;
    closeConfirmation();
    
    if (onConfirm && typeof onConfirm === 'function') {
      await onConfirm();
    }
  };

  // Execute operation
  const handleExecuteOperation = () => {
    if (selectedOperation === "remove") {
      if (!hasCurrentTag) {
        showWarning("No tag to remove.");
        return;
      }
      
      openConfirmation({
        type: 'danger',
        title: 'Remove Tag',
        message: `Remove tag "${currentTag}" from ${employee?.name || employee?.employee_name}?`,
        confirmText: 'Remove',
        onConfirm: async () => {
          try {
            const currentTagObj = availableTags.find(tag => {
              const tagName = (tag.name || tag.tag_name || tag.label).toString().trim().toLowerCase();
              return tagName === currentTag.toLowerCase();
            });
            
            if (currentTagObj) {
              const tagId = currentTagObj.id || currentTagObj.tag_id || currentTagObj.value;
            
              await onTagOperation("remove", tagId);
              showSuccess(`Tag removed successfully`);
              onClose();
            } else {
              showError("Could not find tag ID for removal.");
            }
          } catch (error) {
            showError(`Failed to remove tag: ${error.message}`);
          }
        }
      });
      
    } else {
      if (!selectedTag) {
        showWarning("Please select a tag first.");
        return;
      }
      
      const selectedTagObj = availableTags.find(tag => 
        (tag.id || tag.tag_id || tag.value) === selectedTag
      );
      
      if (!selectedTagObj) {
        showError("Selected tag is invalid.");
        return;
      }
      
      const tagName = selectedTagObj.name || selectedTagObj.tag_name || selectedTagObj.label;
      const operationText = selectedOperation === "replace" ? "Replace" : "Assign";
      
      let message = `${operationText} tag "${tagName}"?`;
      
      if (selectedOperation === "replace") {
        message = `Replace "${currentTag}" with "${tagName}"?`;
      }
      
      openConfirmation({
        type: selectedOperation === "replace" ? 'info' : 'success',
        title: `${operationText} Tag`,
        message: message,
        confirmText: operationText,
        onConfirm: async () => {
          try {
           
            
            const operation = selectedOperation === "replace" ? "replace" : "add";
            await onTagOperation(operation, selectedTag);
            
            showSuccess(`Tag ${selectedOperation === "replace" ? "replaced" : "assigned"} successfully`);
            onClose();
          } catch (error) {
            showError(`Failed to ${selectedOperation} tag: ${error.message}`);
          }
        }
      });
    }
  };

  // Handle close
  const handleClose = () => {
    if (loading.add || loading.remove) return;
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = loading.add || loading.remove;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`${
          darkMode ? "bg-almet-cloud-burst" : "bg-white"
        } rounded-lg shadow-xl w-full max-w-md border ${
          darkMode ? "border-almet-comet" : "border-almet-mystic"
        }`}>
          
          {/* Compact Header */}
          <div className={`px-4 py-3 border-b ${
            darkMode ? "border-almet-comet bg-almet-san-juan/30" : "border-almet-mystic bg-almet-mystic/30"
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Tag size={16} className={`${darkMode ? "text-almet-astral" : "text-almet-sapphire"}`} />
                <div>
                  <h3 className={`text-sm font-semibold ${
                    darkMode ? "text-white" : "text-almet-cloud-burst"
                  }`}>
                    Tag Management
                  </h3>
                  <p className={`text-xs ${
                    darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                  }`}>
                    {employee?.name || employee?.employee_name || `Employee ${employee?.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`p-1 rounded transition-colors ${
                  darkMode 
                    ? "hover:bg-white/10 text-almet-bali-hai" 
                    : "hover:bg-almet-sapphire/10 text-almet-waterloo"
                }`}
                disabled={isLoading}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Compact Content */}
          <div className="p-4 space-y-4">
            
            {/* Current Tag - Compact Display */}
            <div className={`p-3 rounded-lg border ${
              darkMode ? "border-almet-comet bg-almet-comet/20" : "border-almet-mystic bg-almet-mystic/50"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-medium ${
                    darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                  }`}>
                    Current Tag
                  </span>
                  {hasCurrentTag ? (
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        darkMode 
                          ? "bg-almet-sapphire/20 text-almet-astral border border-almet-sapphire/30" 
                          : "bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/20"
                      }`}>
                        <Hash size={10} className="mr-1" />
                        {currentTag}
                      </span>
                    </div>
                  ) : (
                    <p className={`text-xs mt-1 ${
                      darkMode ? "text-almet-santas-gray" : "text-almet-waterloo/70"
                    }`}>
                      No tag assigned
                    </p>
                  )}
                </div>
                {hasCurrentTag && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    darkMode 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-emerald-100/80 text-emerald-600 border border-emerald-200/60"
                  }`}>
                    Tagged
                  </span>
                )}
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="space-y-2">
              <label className={`block text-xs font-medium ${
                darkMode ? "text-white" : "text-almet-cloud-burst"
              }`}>
                Action
              </label>
              
              <div className="space-y-2">
                
                {/* Assign (only if no tag) */}
                {!hasCurrentTag && (
                  <button
                    onClick={() => {
                      setSelectedOperation("assign");
                      setSelectedTag(null);
                    }}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedOperation === "assign"
                        ? darkMode 
                          ? "border-emerald-400/50 bg-emerald-500/10 shadow-sm" 
                          : "border-emerald-300/60 bg-emerald-50/70 shadow-sm"
                        : darkMode
                          ? "border-almet-comet hover:border-emerald-400/30"
                          : "border-almet-mystic hover:border-emerald-300/40"
                    }`}
                  >
                    <div className="flex items-center">
                      <Plus size={14} className={`mr-2 ${
                        selectedOperation === "assign" 
                          ? "text-emerald-500" 
                          : darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                      }`} />
                      <div>
                        <div className={`text-sm font-medium ${
                          selectedOperation === "assign" 
                            ? darkMode ? "text-emerald-300" : "text-emerald-700"
                            : darkMode ? "text-white" : "text-almet-cloud-burst"
                        }`}>
                          Assign Tag
                        </div>
                        <p className={`text-xs ${
                          selectedOperation === "assign" 
                            ? "text-emerald-400/80" 
                            : darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                        }`}>
                          Choose from {dropdownOptions.length} tags
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Replace (only if has tag) */}
                {hasCurrentTag && (
                  <button
                    onClick={() => {
                      setSelectedOperation("replace");
                      setSelectedTag(null);
                    }}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedOperation === "replace"
                        ? darkMode 
                          ? "border-blue-400/50 bg-blue-500/10 shadow-sm" 
                          : "border-blue-300/60 bg-blue-50/70 shadow-sm"
                        : darkMode
                          ? "border-almet-comet hover:border-blue-400/30"
                          : "border-almet-mystic hover:border-blue-300/40"
                    }`}
                  >
                    <div className="flex items-center">
                      <RefreshCw size={14} className={`mr-2 ${
                        selectedOperation === "replace" 
                          ? "text-blue-500" 
                          : darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                      }`} />
                      <div>
                        <div className={`text-sm font-medium ${
                          selectedOperation === "replace" 
                            ? darkMode ? "text-blue-300" : "text-blue-700"
                            : darkMode ? "text-white" : "text-almet-cloud-burst"
                        }`}>
                          Replace Tag
                        </div>
                        <p className={`text-xs ${
                          selectedOperation === "replace" 
                            ? "text-blue-400/80" 
                            : darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                        }`}>
                          Change to different tag
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Remove (only if has tag) */}
                {hasCurrentTag && (
                  <button
                    onClick={() => {
                      setSelectedOperation("remove");
                      setSelectedTag(null);
                    }}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedOperation === "remove"
                        ? darkMode 
                          ? "border-red-400/50 bg-red-500/10 shadow-sm" 
                          : "border-red-300/60 bg-red-50/70 shadow-sm"
                        : darkMode
                          ? "border-almet-comet hover:border-red-400/30"
                          : "border-almet-mystic hover:border-red-300/40"
                    }`}
                  >
                    <div className="flex items-center">
                      <Trash2 size={14} className={`mr-2 ${
                        selectedOperation === "remove" 
                          ? "text-red-500" 
                          : darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                      }`} />
                      <div>
                        <div className={`text-sm font-medium ${
                          selectedOperation === "remove" 
                            ? darkMode ? "text-red-300" : "text-red-700"
                            : darkMode ? "text-white" : "text-almet-cloud-burst"
                        }`}>
                          Remove Tag
                        </div>
                        <p className={`text-xs ${
                          selectedOperation === "remove" 
                            ? "text-red-400/80" 
                            : darkMode ? "text-almet-bali-hai" : "text-almet-waterloo"
                        }`}>
                          Remove current tag
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Tag Selection for assign/replace */}
            {(selectedOperation === "assign" || selectedOperation === "replace") && (
              <div className="space-y-2">
                <label className={`block text-xs font-medium ${
                  darkMode ? "text-white" : "text-almet-cloud-burst"
                }`}>
                  Select Tag
                </label>
                
                <SearchableDropdown
                  options={dropdownOptions}
                  value={selectedTag}
                  onChange={setSelectedTag}
                  placeholder={`Choose tag (${dropdownOptions.length} available)`}
                  searchPlaceholder="Search tags..."
                  darkMode={darkMode}
                   allowUncheck={true}
                  icon={<Hash size={12} />}
                  portal={true}
                  className="text-sm"
                />

                {selectedTag && (
                  <div className={`p-2 rounded border ${
                    darkMode 
                      ? "border-emerald-500/30 bg-emerald-500/10" 
                      : "border-emerald-200/60 bg-emerald-50/70"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Check size={12} className="text-emerald-500" />
                        <span className={`text-xs font-medium ${
                          darkMode ? "text-emerald-300" : "text-emerald-700"
                        }`}>
                          {dropdownOptions.find(opt => opt.value === selectedTag)?.label}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compact Footer */}
          <div className={`px-4 py-3 border-t ${
            darkMode ? "border-almet-comet bg-almet-comet/10" : "border-almet-mystic bg-almet-mystic/30"
          }`}>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleClose}
                className={`px-3 py-1.5 text-xs font-medium border rounded transition-colors ${
                  darkMode 
                    ? "border-almet-comet hover:bg-almet-comet/30 text-almet-bali-hai" 
                    : "border-almet-mystic hover:bg-almet-mystic text-almet-waterloo"
                }`}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOperation}
                disabled={(selectedOperation !== "remove" && !selectedTag) || isLoading}
                className={`px-4 py-1.5 text-xs font-semibold rounded text-white transition-all ${
                  selectedOperation === "remove"
                    ? "bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
                    : selectedOperation === "replace"
                    ? "bg-almet-astral hover:bg-almet-sapphire disabled:bg-gray-400"
                    : "bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400"
                } disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing</span>
                  </div>
                ) : (
                  selectedOperation === "remove" ? "Remove" :
                  selectedOperation === "replace" ? "Replace" : "Assign"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={executeConfirmedAction}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        loading={isLoading}
        darkMode={darkMode}
      />
    </>
  );
};

export default TagManagementModal;