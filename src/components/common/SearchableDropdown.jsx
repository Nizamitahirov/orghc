"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import {
  Search,
  ChevronDown,
} from "lucide-react";

const SearchableDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  searchPlaceholder = "Search...",
  className = "",
  darkMode = false,
  icon = null,
  portal = false,
  dropdownClassName = "",
  zIndex = "z-50",
  disabled = false,
  allowUncheck = true // Yeni özellik: seçimi kaldırmaya izin ver
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [buttonRect, setButtonRect] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Normalize options to ensure they have both value and label
  const normalizedOptions = options.map((option, index) => {
    if (typeof option === 'string') {
      return { value: option, label: option, id: `option-${index}-${option}` };
    }
    
    const value = option.value ?? option.id ?? option.name ?? '';
    const label = option.label ?? option.name ?? option.value ?? option.id ?? '';
    
    return {
      ...option,
      value,
      label,
      id: option.id ?? `option-${index}-${value}`
    };
  });

  const filteredOptions = normalizedOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = normalizedOptions.find(option => option.value === value);

  // Update button position when dropdown opens
  useEffect(() => {
    if (isOpen && buttonRef.current && portal) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen, portal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideButton = buttonRef.current && !buttonRef.current.contains(event.target);
      
      if (isOutsideDropdown && isOutsideButton) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleScroll = (event) => {
      if (isOpen && portal) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearchTerm("");
        }
      }
    };

    const handleResize = () => {
      if (isOpen && portal) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, portal]);

  const handleOptionClick = (optionValue) => {
    // Eğer allowUncheck true ise ve aynı değere tıklanıyorsa, seçimi kaldır
    if (allowUncheck && value === optionValue) {
      onChange(null); // veya onChange('') veya onChange(undefined)
    } else {
      onChange(optionValue);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  const dropdownContent = isOpen && (
    <div 
      className={`${portal ? 'fixed' : 'absolute'} ${zIndex} w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-hidden ${dropdownClassName}`}
      style={portal && buttonRect ? {
        top: `${buttonRect.top + 4}px`,
        left: `${buttonRect.left}px`,
        width: `${buttonRect.width}px`,
        zIndex: 9999
      } : {}}
      ref={dropdownRef}
    >
      <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="relative">
          <Search size={12} className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-7 pr-2 py-1.5 outline-0 border ${borderColor} rounded focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs`}
            autoFocus
          />
        </div>
      </div>
      <div 
        className="max-h-44 overflow-y-auto custom-scrollbar"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {filteredOptions.length === 0 ? (
          <div className={`px-3 py-2 ${textMuted} text-xs text-center`}>
            No options found
          </div>
        ) : (
          filteredOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.value)}
              className={`w-full px-3 py-2 text-left ${hoverBg} ${textPrimary} text-xs transition-colors duration-150 ${
                value === option.value ? 'bg-almet-sapphire/10 text-almet-sapphire' : ''
              }`}
            >
              {option.label}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4B5563 #374151' : '#D1D5DB #F9FAFB'};
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#F9FAFB'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#6B7280' : '#D1D5DB'};
          border-radius: 3px;
          transition: background-color 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#9CA3AF' : '#9CA3AF'};
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #6366F1;
        }
      `}</style>
      
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs text-left flex items-center justify-between transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-almet-sapphire/50'
          }`}
        >
          <div className="flex items-center">
            {icon && <span className="mr-2 text-almet-sapphire">{icon}</span>}
            <span className={selectedOption ? textPrimary : textMuted}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'opacity-50' : ''}`} />
        </button>

        {/* Render dropdown with or without portal */}
        {portal && typeof window !== 'undefined' 
          ? createPortal(dropdownContent, document.body)
          : dropdownContent
        }
      </div>
    </>
  );
};

export default SearchableDropdown;