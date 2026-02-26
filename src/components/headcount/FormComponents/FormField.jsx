// src/components/headcount/FormComponents/FormField.jsx - IMPROVED UI/UX
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader, AlertCircle, Search, X, Check } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * IMPROVED FORM FIELD COMPONENT
 * ✓ Daha yaxşı vizual hiyerarxiya
 * ✓ Optimal spacing və padding
 * ✓ Smooth transitions
 * ✓ Professional görünüş
 */
const FormField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  required = false, 
  placeholder = "", 
  icon = null,
  helpText = "",
  options = [],
  validationError = null,
  loading = false,
  disabled = false,
  onSearch = null,
  searchable = true,
  clearable = false,
  onClear = null,
  multiple = false,
  rows = 3,
  showColors = false,
  showCodes = false,
  showDescriptions = false,
  min = null,
  max = null,
  ...props
}) => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // IMPROVED THEME CLASSES
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-800" : "bg-white";
  const focusRing = "focus:ring-2 focus:ring-almet-sapphire/30 focus:border-almet-sapphire";
  const errorBorder = validationError ? "border-red-400 focus:border-red-400 focus:ring-red-400/30" : "";
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900" : "";

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options
  const filteredOptions = searchable && searchTerm && type === "select"
    ? options.filter(option => {
        const label = typeof option === 'object' ? option.label : option;
        const code = typeof option === 'object' ? option.code : null;
        const description = typeof option === 'object' ? option.description : null;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          label.toLowerCase().includes(searchLower) ||
          (code && code.toLowerCase().includes(searchLower)) ||
          (description && description.toLowerCase().includes(searchLower))
        );
      })
    : options;

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  // Handle multiple select
  const handleMultipleSelect = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange({ target: { name, value: newValues } });
  };

  // Get selected labels
  const getSelectedLabels = () => {
    if (!multiple || !Array.isArray(value)) return [];
    return value.map(val => {
      const option = options.find(opt => 
        typeof opt === 'object' ? opt.value === val : opt === val
      );
      return typeof option === 'object' ? option.label : option;
    }).filter(Boolean);
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { name, value: multiple ? [] : "" } });
    }
    setSearchTerm("");
  };

  // Get display value
  const getDisplayValue = () => {
    if (!value) return "";
    const option = options.find(opt => 
      typeof opt === 'object' ? opt.value === value : opt === value
    );
    return typeof option === 'object' ? option.label : value;
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    if (!disabled && type === "select" && (searchable || multiple)) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-2.5">
      {/* LABEL - improved spacing */}
      <label
        htmlFor={name}
        className={`block ${textSecondary} text-xs font-medium mb-1.5`}
      >
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* ICON */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
            <div className={textMuted}>{icon}</div>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none z-10">
            <Loader className="h-3.5 w-3.5 animate-spin text-almet-sapphire" />
          </div>
        )}

        {/* CLEAR BUTTON */}
        {clearable && value && !loading && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center z-10 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        
        {/* REGULAR SELECT (Non-searchable) */}
        {type === "select" && !searchable && !multiple ? (
          <select
            id={name}
            name={name}
            value={value || ""}
            onChange={onChange}
            required={required}
            disabled={disabled || loading}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} ${clearable && value ? "pr-9" : "pr-8"} py-1.5 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-md ${focusRing} transition-all duration-150 outline-none appearance-none ${disabledStyle} hover:border-gray-400 dark:hover:border-gray-500`}
            {...props}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option, idx) => (
              <option key={idx} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        ) : 
        
        /* SEARCHABLE/MULTIPLE SELECT */
        (type === "select" && (searchable || multiple)) ? (
          <div className="relative">
            <div
              className={`block w-full ${icon ? "pl-8" : "pl-2.5"} pr-8 py-1.5 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-md ${focusRing} transition-all duration-150 outline-none cursor-pointer ${disabledStyle} hover:border-gray-400 dark:hover:border-gray-500`}
              onClick={handleDropdownToggle}
            >
              {multiple && Array.isArray(value) && value.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {getSelectedLabels().slice(0, 2).map((label, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-almet-sapphire/10 text-almet-sapphire font-medium"
                    >
                      {label}
                    </span>
                  ))}
                  {value.length > 2 && (
                    <span className="text-xs text-gray-400">+{value.length - 2}</span>
                  )}
                </div>
              ) : value && !multiple ? (
                <span>{getDisplayValue()}</span>
              ) : (
                <span className={textMuted}>{placeholder || `Select ${label}`}</span>
              )}
            </div>
            
            {/* DROPDOWN */}
            {isOpen && !disabled && (
              <div className={`absolute z-20 w-full mt-1 ${inputBg} border ${borderColor} rounded-md shadow-lg max-h-60 overflow-hidden`}>
                {/* SEARCH INPUT */}
                {searchable && (
                  <div className="p-1.5 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`w-full pl-7 pr-2 py-1 text-sm border ${borderColor} rounded ${inputBg} ${textPrimary} focus:outline-none focus:border-almet-sapphire transition-colors`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
                
                {/* OPTIONS */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, idx) => {
                      const optionValue = typeof option === 'object' ? option.value : option;
                      const optionLabel = typeof option === 'object' ? option.label : option;
                      const optionCode = typeof option === 'object' ? option.code : null;
                      const optionColor = typeof option === 'object' ? option.color : null;
                      const optionDescription = typeof option === 'object' ? option.description : null;
                      const isCurrent = typeof option === 'object' ? option.isCurrent : false;
                      
                      const isSelected = multiple 
                        ? Array.isArray(value) && value.includes(optionValue)
                        : value === optionValue;
                      
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (multiple) {
                              handleMultipleSelect(optionValue);
                            } else {
                              onChange({ target: { name, value: optionValue } });
                              setIsOpen(false);
                              setSearchTerm("");
                            }
                          }}
                          className={`px-2.5 py-1.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            isSelected ? 'bg-almet-sapphire/10 text-almet-sapphire font-medium' : textPrimary
                          } ${isCurrent ? 'border-l-2 border-green-500' : ''}`}
                        >
                          <div className="flex items-center flex-1 min-w-0 gap-1.5">
                            {/* COLOR INDICATOR */}
                            {showColors && optionColor && (
                              <div 
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-600"
                                style={{ backgroundColor: optionColor }}
                              />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{optionLabel}</span>
                                {/* CODE DISPLAY */}
                                {showCodes && optionCode && (
                                  <span className="px-1 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                                    {optionCode}
                                  </span>
                                )}
                                {/* CURRENT INDICATOR */}
                                {isCurrent && (
                                  <span className="px-1 py-0.5 text-[10px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex-shrink-0 font-medium">
                                    Current
                                  </span>
                                )}
                              </div>
                              {/* DESCRIPTION */}
                              {showDescriptions && optionDescription && (
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                  {optionDescription}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="h-3 w-3 flex-shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-2.5 py-2 text-sm text-gray-500 text-center">
                      {searchTerm ? 'No results found' : 'No options'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : 
        
        /* TEXTAREA */
        type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value || ""}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled || loading}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} pr-2.5 py-1.5 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-md ${focusRing} transition-all duration-150 outline-none resize-none ${disabledStyle} hover:border-gray-400 dark:hover:border-gray-500`}
            {...props}
          />
        ) : 
        
        /* REGULAR INPUT */
        (
          <input
            id={name}
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            disabled={disabled || loading}
            min={min}
            max={max}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} ${clearable && value ? "pr-9" : "pr-2.5"} py-1.5 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-md ${focusRing} transition-all duration-150 outline-none ${disabledStyle} hover:border-gray-400 dark:hover:border-gray-500`}
            {...props}
          />
        )}
        
        {/* SELECT DROPDOWN ARROW */}
        {type === "select" && !multiple && !loading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      
      {/* ERROR MESSAGE */}
      {validationError && (
        <div className="mt-1 flex items-center text-red-500 text-[11px]">
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
      
      {/* HELP TEXT */}
      {helpText && !validationError && (
        <p className={`mt-1 text-[11px] ${textMuted}`}>{helpText}</p>
      )}
    </div>
  );
};

export default FormField;