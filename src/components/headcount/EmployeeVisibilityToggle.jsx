// src/components/headcount/EmployeeVisibilityToggle.jsx - Modern Soft Design
"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../common/ThemeProvider";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const EmployeeVisibilityToggle = ({ 
  employeeId, 
  initialVisibility = true, 
  onVisibilityChange,
  disabled = false,
  showLabel = false,
  size = "sm",
  className = "",
  // Enhanced props for better state management
  isLoading = false,
  showTooltip = true,
  confirmToggle = false
}) => {
  const [isVisible, setIsVisible] = useState(initialVisibility);
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { darkMode } = useTheme();

  // Sync with prop changes
  useEffect(() => {
    setIsVisible(initialVisibility);
  }, [initialVisibility]);

  // Modern size configurations with better spacing
  const sizeConfig = {
    xs: {
      button: "px-2 py-1 text-xs gap-1",
      icon: 10,
      text: "text-xs"
    },
    sm: {
      button: "px-2.5 py-1 text-xs gap-1.5",
      icon: 12,
      text: "text-xs"
    },
    md: {
      button: "px-3 py-1.5 text-sm gap-1.5",
      icon: 14,
      text: "text-sm"
    },
    lg: {
      button: "px-4 py-2 text-base gap-2",
      icon: 16,
      text: "text-base"
    }
  };

  const config = sizeConfig[size] || sizeConfig.sm;

  const toggleVisibility = async () => {
    if (disabled || isToggling || isLoading) return;

    // Show confirmation dialog if required
    if (confirmToggle && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsToggling(true);
    setShowConfirmation(false);

    try {
      const newVisibility = !isVisible;
      
      // Optimistic update
      setIsVisible(newVisibility);
      
      if (onVisibilityChange) {
        await onVisibilityChange(employeeId, newVisibility);
      }
    } catch (error) {
      // Revert on error
      setIsVisible(!isVisible);
      console.error('Failed to toggle visibility:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleConfirm = () => {
    toggleVisibility();
  };

  // Modern theme classes with soft colors
  const getButtonClasses = () => {
    const baseClasses = `
      flex items-center rounded-full border backdrop-blur-sm transition-all duration-200 ease-out
      ${config.button} ${className}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
    `;

    if (isVisible) {
      return `${baseClasses} ${
        darkMode 
          ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30 hover:shadow-sm' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100 hover:shadow-sm'
      }`;
    } else {
      return `${baseClasses} ${
        darkMode 
          ? 'bg-gray-800/30 text-gray-400 border-gray-600/30 hover:bg-gray-700/40 hover:shadow-sm' 
          : 'bg-gray-50 text-gray-600 border-gray-200/60 hover:bg-gray-100 hover:shadow-sm'
      }`;
    }
  };

  const getTooltipText = () => {
    if (isToggling) return "Updating...";
    return isVisible 
      ? "Click to hide from org structure" 
      : "Click to show in org structure";
  };

  const getStatusText = () => {
    if (isToggling) return "Updating...";
    return isVisible ? "Visible" : "Hidden";
  };

  // Modern confirmation dialog with backdrop blur
  if (showConfirmation) {
    return (
      <div className="relative">
        <div className={`
          absolute z-50 -top-20 left-1/2 transform -translate-x-1/2
          p-4 rounded-xl shadow-xl border backdrop-blur-md
          ${darkMode ? 'bg-gray-800/90 border-gray-600/50' : 'bg-white/90 border-gray-200/50'}
          min-w-max
        `}>
          <p className={`text-sm mb-3 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {isVisible ? 'Hide from org chart?' : 'Show in org chart?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                ${darkMode 
                  ? 'bg-sky-600/80 text-white hover:bg-sky-600 hover:scale-105' 
                  : 'bg-sky-500 text-white hover:bg-sky-600 hover:scale-105'
                }
              `}
            >
              Confirm
            </button>
            <button
              onClick={handleCancel}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                ${darkMode 
                  ? 'bg-gray-600/50 text-gray-200 hover:bg-gray-600 hover:scale-105' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }
              `}
            >
              Cancel
            </button>
          </div>
        </div>
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
          onClick={handleCancel}
        />
        
        {/* Original button (disabled during confirmation) */}
        <button
          className={`${getButtonClasses()} opacity-50`}
          disabled
          title={getTooltipText()}
        >
          {(isToggling || isLoading) ? (
            <Loader2 size={config.icon} className="animate-spin" />
          ) : isVisible ? (
            <Eye size={config.icon} />
          ) : (
            <EyeOff size={config.icon} />
          )}
          {showLabel && (
            <span className={config.text}>{getStatusText()}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleVisibility}
        disabled={disabled || isToggling || isLoading}
        className={getButtonClasses()}
        title={showTooltip ? getTooltipText() : undefined}
        aria-label={`${isVisible ? 'Hide' : 'Show'} employee in org chart`}
      >
        {(isToggling || isLoading) ? (
          <Loader2 size={config.icon} className="animate-spin" />
        ) : isVisible ? (
          <Eye size={config.icon} />
        ) : (
          <EyeOff size={config.icon} />
        )}
        
        {showLabel && (
          <span className={config.text}>{getStatusText()}</span>
        )}
      </button>
    </div>
  );
};

export default EmployeeVisibilityToggle;