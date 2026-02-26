// src/components/headcount/AdvancedMultipleSortingSystem.jsx - COMPACT VERSION
import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, 
  Plus, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grip,
  Trash2,
  AlertCircle
} from 'lucide-react';

// Compact Multiple Sorting Component with Almet Colors
export const AdvancedMultipleSortingSystem = ({ 
  onSortingChange, 
  currentSorting = [], 
  availableFields = [],
  darkMode = false,
  maxSortLevels = 10
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Theme classes with Almet colors
  const bgInput = darkMode ? "bg-gray-700" : "bg-almet-mystic";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-gray-600" : "border-almet-bali-hai";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-almet-mystic";

  // Add new sort field with duplicate check
  const addSortField = useCallback((field, direction = 'asc') => {
    const exists = currentSorting.some(sort => sort.field === field);
    if (exists) return;
    
    if (currentSorting.length >= maxSortLevels) return;

    const newSorting = [...currentSorting, { field, direction }];
    onSortingChange(newSorting);
  }, [currentSorting, maxSortLevels, onSortingChange]);

  // Remove sort field
  const removeSortField = useCallback((index) => {
    const newSorting = currentSorting.filter((_, i) => i !== index);
    onSortingChange(newSorting);
  }, [currentSorting, onSortingChange]);

  // Update sort direction
  const updateSortDirection = useCallback((index, direction) => {
    const newSorting = [...currentSorting];
    newSorting[index] = { ...newSorting[index], direction };
    onSortingChange(newSorting);
  }, [currentSorting, onSortingChange]);

  // Move sort field (drag and drop)
  const moveSortField = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const newSorting = [...currentSorting];
    const [movedItem] = newSorting.splice(fromIndex, 1);
    newSorting.splice(toIndex, 0, movedItem);
    onSortingChange(newSorting);
  }, [currentSorting, onSortingChange]);

  // Clear all sorting
  const clearAllSorting = useCallback(() => {
    onSortingChange([]);
  }, [onSortingChange]);

  // Available fields for dropdown (excluding already selected)
  const availableFieldsForAdd = useMemo(() => {
    const selectedFields = currentSorting.map(s => s.field);
    return availableFields.filter(field => !selectedFields.includes(field.value));
  }, [availableFields, currentSorting]);

  // Validation
  const canAddMore = availableFieldsForAdd.length > 0 && currentSorting.length < maxSortLevels;
  const hasActiveSorting = currentSorting.length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-almet-sapphire/10 rounded-md">
            <ArrowUpDown size={16} className="text-almet-sapphire" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${textPrimary}`}>Multi-Level Sorting</h3>
            <p className={`text-[10px] ${textSecondary}`}>Excel-style sorting</p>
          </div>
        </div>
        {hasActiveSorting && (
          <button
            onClick={clearAllSorting}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Current Sorting List */}
      {hasActiveSorting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textSecondary}`}>
              Levels ({currentSorting.length}/{maxSortLevels})
            </span>
          </div>
          
          <div className="space-y-1.5">
            {currentSorting.map((sort, index) => (
              <SortFieldItem
                key={`${sort.field}-${index}`}
                sort={sort}
                index={index}
                onDirectionChange={(direction) => updateSortDirection(index, direction)}
                onRemove={() => removeSortField(index)}
                onMove={moveSortField}
                availableFields={availableFields}
                draggedIndex={draggedIndex}
                setDraggedIndex={setDraggedIndex}
                dragOverIndex={dragOverIndex}
                setDragOverIndex={setDragOverIndex}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add New Sort Field */}
      {canAddMore && (
        <div className={`${hasActiveSorting ? 'border-t border-almet-bali-hai dark:border-gray-700 pt-3' : ''}`}>
          <AddSortField
            availableFields={availableFieldsForAdd}
            onAdd={addSortField}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Empty State */}
      {!hasActiveSorting && !canAddMore && (
        <div className={`text-center py-4 px-3 ${textSecondary}`}>
          <ArrowUpDown size={32} className="mx-auto mb-2 opacity-30" />
          <h4 className="text-sm font-medium mb-1">No Sorting Applied</h4>
          <p className="text-xs">Add sorting criteria to organize data</p>
        </div>
      )}

      {/* Help Section */}
      <div className={`p-2 ${bgInput} rounded-md`}>
        <div className="space-y-1">
          <h4 className={`text-[10px] font-semibold ${textPrimary} flex items-center`}>
            <AlertCircle size={10} className="mr-1" />
            Tips
          </h4>
          <ul className={`text-[10px] ${textSecondary} space-y-0.5`}>
            <li>• Drag to reorder priority</li>
            <li>• First level has highest priority</li>
            <li>• Max {maxSortLevels} levels allowed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Individual Sort Field Item Component
const SortFieldItem = ({ 
  sort, 
  index, 
  onDirectionChange, 
  onRemove, 
  onMove,
  availableFields,
  draggedIndex,
  setDraggedIndex,
  dragOverIndex,
  setDragOverIndex,
  darkMode 
}) => {
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-gray-600" : "border-almet-bali-hai";
  const hoverBg = darkMode ? "hover:bg-gray-600" : "hover:bg-almet-mystic";

  const fieldInfo = availableFields.find(f => f.value === sort.field);
  const fieldLabel = fieldInfo?.label || sort.field;

  const handleDragStart = (e) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const isDragging = draggedIndex === index;
  const isDragOver = dragOverIndex === index && draggedIndex !== index;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center space-x-2 p-2 border rounded-md transition-all cursor-move ${
        isDragging ? 'opacity-50 border-almet-sapphire' :
        isDragOver ? 'border-almet-sapphire bg-almet-sapphire/5' :
        `${borderColor} ${hoverBg}`
      }`}
    >
      {/* Priority Badge */}
      <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
        index === 0 ? 'bg-almet-sapphire text-white' :
        index === 1 ? 'bg-almet-astral text-white' :
        'bg-almet-sapphire/10 text-almet-sapphire'
      }`}>
        {index + 1}
      </div>

      {/* Drag Handle */}
      <Grip size={12} className={`${textSecondary} cursor-move flex-shrink-0`} />

      {/* Field Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${textPrimary} truncate`}>
          {fieldLabel}
        </div>
      </div>

      {/* Direction Toggle */}
      <div className="flex items-center border border-almet-bali-hai rounded overflow-hidden">
        <button
          onClick={() => onDirectionChange('asc')}
          className={`px-2 py-1 text-[10px] transition-all ${
            sort.direction === 'asc' 
              ? 'bg-almet-sapphire text-white' 
              : `${textSecondary} ${hoverBg}`
          }`}
          title="A→Z"
        >
          <ArrowUp size={10} />
        </button>
        <button
          onClick={() => onDirectionChange('desc')}
          className={`px-2 py-1 text-[10px] transition-all ${
            sort.direction === 'desc' 
              ? 'bg-almet-sapphire text-white' 
              : `${textSecondary} ${hoverBg}`
          }`}
          title="Z→A"
        >
          <ArrowDown size={10} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
        title="Remove"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// Add New Sort Field Component with Searchable Dropdown
const AddSortField = ({ availableFields, onAdd, darkMode }) => {
  const [selectedField, setSelectedField] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-gray-600" : "border-almet-bali-hai";

  // Filter fields based on search query
  const filteredFields = useMemo(() => {
    if (!searchQuery) return availableFields;
    return availableFields.filter(field => 
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableFields, searchQuery]);

  const handleAdd = () => {
    if (selectedField) {
      onAdd(selectedField, selectedDirection);
      setSelectedField('');
      setSelectedDirection('asc');
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  };

  const handleFieldSelect = (field) => {
    setSelectedField(field.value);
    setSearchQuery(field.label);
    setIsDropdownOpen(false);
  };

  const quickAddField = (field) => {
    onAdd(field.value, 'asc');
  };

  const selectedFieldLabel = selectedField ? 
    availableFields.find(f => f.value === selectedField)?.label || selectedField : 
    '';

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="p-1 bg-almet-steel-blue/10 rounded">
          <Plus size={12} className="text-almet-steel-blue" />
        </div>
        <div>
          <h4 className={`text-xs font-medium ${textPrimary}`}>Add Sort Level</h4>
        </div>
      </div>

      {/* Manual Add */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          {/* Searchable Input */}
          <input
            type="text"
            value={isDropdownOpen ? searchQuery : selectedFieldLabel}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
              if (!e.target.value) {
                setSelectedField('');
              }
            }}
            onFocus={() => {
              setIsDropdownOpen(true);
              setSearchQuery('');
            }}
            onBlur={() => {
              // Delay to allow clicking on dropdown items
              setTimeout(() => setIsDropdownOpen(false), 150);
            }}
            placeholder="Search fields..."
            className={`w-full px-2 py-1.5 text-xs border ${borderColor} rounded ${bgInput} ${textPrimary} focus:outline-none focus:ring-1 focus:ring-almet-sapphire`}
          />
          
          {/* Dropdown */}
          {isDropdownOpen && filteredFields.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-1 max-h-32 overflow-y-auto border ${borderColor} rounded ${bgInput} shadow-lg z-50`}>
              {filteredFields.map(field => (
                <button
                  key={field.value}
                  onClick={() => handleFieldSelect(field)}
                  className={`w-full px-2 py-1.5 text-xs text-left ${textPrimary} hover:bg-almet-sapphire/10 hover:text-almet-sapphire transition-colors`}
                >
                  <div className="truncate">{field.label}</div>
                  {field.description && (
                    <div className={`text-[10px] ${textSecondary} truncate`}>
                      {field.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {isDropdownOpen && filteredFields.length === 0 && searchQuery && (
            <div className={`absolute top-full left-0 right-0 mt-1 px-2 py-1.5 text-xs ${textSecondary} border ${borderColor} rounded ${bgInput} shadow-lg z-50`}>
              No fields found
            </div>
          )}
        </div>

        <div>
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className={`px-2 py-1.5 text-xs border ${borderColor} rounded ${bgInput} ${textPrimary} focus:outline-none focus:ring-1 focus:ring-almet-sapphire`}
          >
            <option value="asc">A→Z</option>
            <option value="desc">Z→A</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={!selectedField}
          className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center space-x-1 ${
            selectedField 
              ? 'bg-almet-sapphire text-white hover:bg-almet-astral' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus size={10} />
          <span>Add</span>
        </button>
      </div>

      {/* Quick Add Buttons */}
      {availableFields.length > 0 && (
        <div>
          <label className={`block text-[10px] font-medium ${textSecondary} mb-1`}>
            Quick Add:
          </label>
          <div className="flex flex-wrap gap-1">
            {availableFields.slice(0, 6).map(field => (
              <button
                key={field.value}
                onClick={() => quickAddField(field)}
                className={`px-2 py-0.5 text-[10px] rounded border ${borderColor} ${textSecondary} hover:bg-almet-sapphire/10 hover:text-almet-sapphire hover:border-almet-sapphire transition-colors`}
              >
                {field.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedMultipleSortingSystem;