// src/components/headcount/FormComponents/FormField.jsx - REDESIGNED
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader, AlertCircle, Search, X, Check } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * TƏKMİLLƏŞDİRİLMİŞ FORM FIELD COMPONENT
 * - Daha kiçik və oxunaqlı font ölçüləri
 * - Kompakt spacing və padding
 * - Almet rəng palitrasına uyğun
 * - Sadə və user-friendly dizayn
 * - Göz yormayan rəng kontrasti
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

  // TƏKMİLLƏŞDİRİLMİŞ THEME CLASSES - daha yumşaq və oxunaqlı
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const borderColor = darkMode ? "border-gray-600" : "border-almet-bali-hai";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";
  const focusRing = "focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire";
  const errorBorder = validationError ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : "";
  const disabledStyle = disabled ? "opacity-60 cursor-not-allowed" : "";

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
    <div className="mb-3">
      {/* LABEL - kiçik və oxunaqlı */}
      <label
        htmlFor={name}
        className={`block ${textSecondary} text-xs font-medium mb-1`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* ICON */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            {icon}
          </div>
        )}

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none z-10">
            <Loader className="h-3.5 w-3.5 animate-spin text-almet-sapphire" />
          </div>
        )}

        {/* CLEAR BUTTON */}
        {clearable && value && !loading && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 hover:text-red-500 transition-colors"
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
            className={`block w-full ${icon ? "pl-9" : "pl-3"} ${clearable && value ? "pr-10" : "pr-9"} py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-all duration-200 outline-none appearance-none ${disabledStyle}`}
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
              className={`block w-full ${icon ? "pl-9" : "pl-3"} pr-9 py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-all duration-200 outline-none cursor-pointer ${disabledStyle}`}
              onClick={handleDropdownToggle}
            >
              {multiple && Array.isArray(value) && value.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {getSelectedLabels().slice(0, 2).map((label, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-almet-sapphire/10 text-almet-sapphire font-medium"
                    >
                      {label}
                    </span>
                  ))}
                  {value.length > 2 && (
                    <span className="text-xs text-gray-500">+{value.length - 2}</span>
                  )}
                </div>
              ) : value && !multiple ? (
                <span>{getDisplayValue()}</span>
              ) : (
                <span className={`${textMuted}`}>{placeholder || `Select ${label}`}</span>
              )}
            </div>
            
            {/* DROPDOWN */}
            {isOpen && !disabled && (
              <div className={`absolute z-20 w-full mt-1 ${inputBg} border ${borderColor} rounded-lg shadow-lg max-h-64 overflow-hidden`}>
                {/* SEARCH INPUT */}
                {searchable && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`w-full pl-8 pr-2 py-1.5 text-sm border ${borderColor} rounded-md ${inputBg} ${textPrimary} focus:outline-none focus:border-almet-sapphire`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
                
                {/* OPTIONS */}
                <div className="max-h-52 overflow-y-auto">
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
                          className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-almet-sapphire/5 dark:hover:bg-gray-600/50 transition-colors ${
                            isSelected ? 'bg-almet-sapphire/10 text-almet-sapphire font-medium' : textPrimary
                          } ${isCurrent ? 'border-l-2 border-green-500' : ''}`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {/* COLOR INDICATOR */}
                            {showColors && optionColor && (
                              <div 
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0 border border-gray-200 dark:border-gray-600"
                                style={{ backgroundColor: optionColor }}
                              />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{optionLabel}</span>
                                {/* CODE DISPLAY */}
                                {showCodes && optionCode && (
                                  <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                                    {optionCode}
                                  </span>
                                )}
                                {/* CURRENT INDICATOR */}
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex-shrink-0 font-medium">
                                    Current
                                  </span>
                                )}
                              </div>
                              {/* DESCRIPTION */}
                              {showDescriptions && optionDescription && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                  {optionDescription}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-3 text-sm text-gray-500 text-center">
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
            className={`block w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-all duration-200 outline-none resize-none ${disabledStyle}`}
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
            className={`block w-full ${icon ? "pl-9" : "pl-3"} ${clearable && value ? "pr-10" : "pr-3"} py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-all duration-200 outline-none ${disabledStyle}`}
            {...props}
          />
        )}
        
        {/* SELECT DROPDOWN ARROW */}
        {type === "select" && !multiple && !loading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </div>
      
      {/* ERROR MESSAGE - kiçik və oxunaqlı */}
      {validationError && (
        <div className="mt-1 flex items-center text-red-500 text-xs">
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
      
      {/* HELP TEXT - çox kiçik və yumşaq */}
      {helpText && !validationError && (
        <p className={`mt-1 text-xs ${textMuted}`}>{helpText}</p>
      )}
    </div>
  );
};

export default FormField;