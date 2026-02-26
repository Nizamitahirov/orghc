// src/components/headcount/SearchBar.jsx - COMPLETELY FIXED: Search functionality with proper type handling
import { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * FIXED SearchBar - Düzəldilmiş search funksiyası və type safety
 * Özəlliklər:
 * - FIXED: String type checking
 * - FIXED: Null/undefined handling
 * - FIXED: Recent searches management
 * - Clear functionality
 * - Responsive design
 */
const SearchBar = ({
  searchTerm = "",
  onSearchChange,
  placeholder = "Search employees...",
  disabled = false,
  showRecentSearches = true,
  maxRecentSearches = 5,
  className = ""
}) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // FIXED: Safe string conversion and validation
  const safeSearchTerm = (() => {
    if (searchTerm === null || searchTerm === undefined) return "";
    if (typeof searchTerm === 'string') return searchTerm;
    if (typeof searchTerm === 'number') return String(searchTerm);
    if (Array.isArray(searchTerm)) return ""; // Array not supported for search
    return String(searchTerm); // Fallback for other types
  })();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (!showRecentSearches) return;
    
    try {
      const stored = localStorage.getItem('headcount_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, maxRecentSearches));
        }
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
      setRecentSearches([]);
    }
  }, [showRecentSearches, maxRecentSearches]);

  // Save recent searches to localStorage
  const saveRecentSearches = (searches) => {
    if (!showRecentSearches) return;
    
    try {
      localStorage.setItem('headcount_recent_searches', JSON.stringify(searches));
    } catch (error) {
      console.warn('Failed to save recent searches:', error);
    }
  };

  // FIXED: Handle search change with proper type checking
  const handleSearchChange = (value) => {

    
    // FIXED: Ensure we always pass a string
    const stringValue = (() => {
      if (value === null || value === undefined) return "";
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      return String(value); // Convert any other type to string
    })();
    
    if (typeof onSearchChange === 'function') {
      onSearchChange(stringValue);
    }
  };

  // Handle search submission (Enter key or clicking recent search)
  const handleSearchSubmit = (searchValue) => {
    const trimmedValue = String(searchValue || "").trim();
    
    if (trimmedValue && showRecentSearches) {
      // Add to recent searches (avoid duplicates)
      const newRecentSearches = [
        trimmedValue,
        ...recentSearches.filter(s => s !== trimmedValue)
      ].slice(0, maxRecentSearches);
      
      setRecentSearches(newRecentSearches);
      saveRecentSearches(newRecentSearches);
    }
    
    handleSearchChange(trimmedValue);
    setIsOpen(false);
  };

  // FIXED: Clear search function
  const handleClearSearch = () => {
   
    handleSearchChange("");
    inputRef.current?.focus();
  };

  // Clear all recent searches
  const handleClearRecentSearches = () => {

    setRecentSearches([]);
    saveRecentSearches([]);
  };

  // Handle key press events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit(safeSearchTerm);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full max-w-md ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-4 w-4 ${textMuted}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={safeSearchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2.5 text-sm
            ${bgInput} ${borderColor} ${textPrimary}
            border rounded-lg
            focus:ring-2 focus:ring-almet-sapphire focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 outline-0
          `}
        />
        
        {/* Clear Button */}
        {safeSearchTerm && (
          <button
            onClick={handleClearSearch}
            className={`
              absolute inset-y-0 right-0 pr-3 flex items-center
              ${textMuted} hover:${textPrimary} transition-colors
            `}
            title="Clear search"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Recent Searches Dropdown */}
      {isOpen && showRecentSearches && recentSearches.length > 0 && (
        <div className={`
          absolute z-50 w-full mt-1 
          ${bgCard} border ${borderColor}
          rounded-lg shadow-lg
          max-h-60 overflow-y-auto
        `}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${borderColor}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${textSecondary}`}>
                Recent Searches
              </span>
              <button
                onClick={handleClearRecentSearches}
                className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Recent Search Items */}
          <div className="py-1">
            {recentSearches.map((search, index) => (
              <button
                key={`recent-${index}-${search}`}
                onClick={() => handleSearchSubmit(search)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center
                  ${bgHover} transition-colors
                  ${textPrimary}
                `}
              >
                <Clock className={`h-3 w-3 mr-3 ${textMuted} flex-shrink-0`} />
                <span className="truncate">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default SearchBar;