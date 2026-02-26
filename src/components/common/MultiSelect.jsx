// components/jobDescription/MultiSelect.jsx - FIXED VERSION with no nested buttons

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

const MultiSelect = ({ 
  options = [],
  selected = [],
  onChange, 
  placeholder, 
  fieldName, 
  darkMode = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  // Ensure arrays and better filtering
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];
  
  const filteredOptions = safeOptions.filter(option => {
    if (!option) return false;
    const name = option.name || option.label || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Enhanced ID-to-Name conversion for display
  const getSelectedNames = () => {
    if (safeSelected.length === 0) return [];
    
    return safeSelected
      .map(selectedValue => {
        // First try to find by exact match (for names)
        let option = safeOptions.find(opt => 
          opt && (opt.name === selectedValue || opt.label === selectedValue)
        );
        
        // If not found, try by ID (for numeric IDs)
        if (!option) {
          option = safeOptions.find(opt => 
            opt && (opt.id === selectedValue || 
                    opt.value === selectedValue || 
                    String(opt.id) === String(selectedValue) || 
                    String(opt.value) === String(selectedValue))
          );
        }
        
        if (option) {
          return option.name || option.label || String(selectedValue);
        }
        
        // If no option found, return the value as string (for edit mode with names)
        return String(selectedValue);
      })
      .filter(Boolean);
  };

  const selectedNames = getSelectedNames();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Remove item from selection
  const removeItem = (itemValue, event) => {
    event.stopPropagation();
    if (onChange && fieldName) {
      onChange(fieldName, itemValue);
    }
  };

  // Enhanced selection check - handles both names and IDs
  const isItemSelected = (optionValue) => {
    return safeSelected.some(selectedValue => 
      selectedValue === optionValue ||
      String(selectedValue) === String(optionValue) ||
      // For edit mode where we might have names in selected but IDs in options
      (typeof selectedValue === 'string' && typeof optionValue !== 'string' && 
       safeOptions.find(opt => opt.id === optionValue && opt.name === selectedValue))
    );
  };

  // Handle option click
  const handleOptionClick = (option) => {
    if (!onChange || !fieldName) return;
    
    // Determine what value to use for selection
    let valueToSelect;
    
    // For resources/benefits/access where we want to store names in edit mode
    if (fieldName.includes('business_resources') || 
        fieldName.includes('access_rights') || 
        fieldName.includes('company_benefits')) {
      // Use the name for storage
      valueToSelect = option.name || option.label || option.id;
    } else {
      // For skills/competencies, use ID
      valueToSelect = option.id || option.value;
    }
    
    onChange(fieldName, valueToSelect);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-left text-sm min-h-[42px]`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {safeSelected.length === 0 ? (
              <span className={textMuted}>{placeholder}</span>
            ) : safeSelected.length === 1 ? (
              <span className={textPrimary}>{selectedNames[0] || `${safeSelected.length} selected`}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedNames.slice(0, 2).map((name, index) => (
                  <span 
                    key={index}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 bg-almet-sapphire text-white rounded text-xs max-w-[120px] truncate`}
                  >
                    {name}
                    {/* FIXED: Changed from button to div with click handler */}
                    <div
                      onClick={(e) => removeItem(safeSelected[index], e)}
                      className="hover:bg-white/20 rounded-full p-0.5 flex-shrink-0 cursor-pointer"
                      title={`Remove ${name}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          removeItem(safeSelected[index], e);
                        }
                      }}
                    >
                      <X size={10} />
                    </div>
                  </span>
                ))}
                {safeSelected.length > 2 && (
                  <span className={`px-2 py-0.5 ${darkMode ? 'bg-almet-comet' : 'bg-gray-200'} ${textSecondary} rounded text-xs`}>
                    +{safeSelected.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDown size={14} className={`transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''} ${textMuted}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-30`}>
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-almet-comet">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={12} />
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-7 pr-2 py-1.5 outline-0 border ${borderColor} rounded focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Selection Summary */}
          {safeSelected.length > 0 && (
            <div className={`px-3 py-2 ${darkMode ? 'bg-almet-comet/30' : 'bg-gray-50'} border-b border-gray-200 dark:border-almet-comet`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textSecondary} font-medium`}>
                  {safeSelected.length} item{safeSelected.length !== 1 ? 's' : ''} selected
                </span>
                {/* FIXED: Changed from button to div with click handler */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // Clear all selections
                    safeSelected.forEach(item => {
                      if (onChange && fieldName) {
                        onChange(fieldName, item);
                      }
                    });
                  }}
                  className={`text-xs ${textMuted} hover:${textPrimary} transition-colors cursor-pointer`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      safeSelected.forEach(item => {
                        if (onChange && fieldName) {
                          onChange(fieldName, item);
                        }
                      });
                    }
                  }}
                >
                  Clear all
                </div>
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                if (!option) return null;
                
                const optionId = option.id || option.value;
                const optionName = option.name || option.label;
                const isSelected = isItemSelected(optionId) || isItemSelected(optionName);
                
                return (
                  <label 
                    key={optionId || optionName} 
                    className={`flex items-center px-3 py-2 hover:${bgCardHover} cursor-pointer transition-colors ${
                      isSelected ? darkMode ? 'bg-almet-comet/50' : 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleOptionClick(option)}
                      className="mr-3 text-almet-sapphire focus:ring-almet-sapphire rounded"
                    />
                    <span className={`text-xs flex-1 ${isSelected ? 'font-medium' : ''} ${textPrimary}`}>
                      {optionName}
                    </span>
                    {isSelected && (
                      <span className={`text-xs ${textMuted} ml-2`}>✓</span>
                    )}
                  </label>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center">
                <div className={`text-sm ${textMuted}`}>
                  {searchTerm ? (
                    <>
                      No options found for "<span className="font-medium">{searchTerm}</span>"
                    </>
                  ) : (
                    'No options available'
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          {safeOptions.length > 0 && (
            <div className={`px-3 py-2 border-t border-gray-200 dark:border-almet-comet ${darkMode ? 'bg-almet-comet/20' : 'bg-gray-50'}`}>
              <div className="flex justify-between text-xs">
                {/* FIXED: Changed from button to div with click handler */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // Select all filtered options
                    filteredOptions.forEach(option => {
                      const optionValue = option.id || option.value || option.name;
                      if (!isItemSelected(optionValue) && onChange && fieldName) {
                        handleOptionClick(option);
                      }
                    });
                  }}
                  className={`${textMuted} hover:${textPrimary} transition-colors cursor-pointer`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      filteredOptions.forEach(option => {
                        const optionValue = option.id || option.value || option.name;
                        if (!isItemSelected(optionValue) && onChange && fieldName) {
                          handleOptionClick(option);
                        }
                      });
                    }
                  }}
                >
                  Select all{searchTerm ? ' filtered' : ''}
                </div>
                <span className={textMuted}>
                  {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;