// src/components/headcount/EmployeeTag.jsx - Modern Soft Design
"use client";
import { X, Hash } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Modern Employee Tag Component with Soft Colors
 */
const EmployeeTag = ({ 
  tag, 
  size = "md", 
  removable = false, 
  onRemove, 
  className = "",
  onClick
}) => {
  const { darkMode } = useTheme();

  // Beautiful soft color palette
  const getTagColor = () => {
    const tagData = typeof tag === 'string' ? { name: tag } : tag;
    const tagName = tagData.name || tagData.label || 'Unknown';
    
    // Generate consistent color based on tag name
    const hash = tagName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colorIndex = Math.abs(hash) % softColors.length;
    return softColors[colorIndex][darkMode ? 'dark' : 'light'];
  };

  // Soft color schemes for light and dark modes
  const softColors = [
    {
      light: {
        bg: 'bg-rose-50/80 hover:bg-rose-100/90',
        text: 'text-rose-700',
        border: 'border-rose-200/60',
        dot: 'text-rose-400'
      },
      dark: {
        bg: 'bg-rose-950/40 hover:bg-rose-900/50',
        text: 'text-rose-200',
        border: 'border-rose-800/40',
        dot: 'text-rose-400'
      }
    },
    {
      light: {
        bg: 'bg-sky-50/80 hover:bg-sky-100/90',
        text: 'text-sky-700',
        border: 'border-sky-200/60',
        dot: 'text-sky-400'
      },
      dark: {
        bg: 'bg-sky-950/40 hover:bg-sky-900/50',
        text: 'text-sky-200',
        border: 'border-sky-800/40',
        dot: 'text-sky-400'
      }
    },
    {
      light: {
        bg: 'bg-emerald-50/80 hover:bg-emerald-100/90',
        text: 'text-emerald-700',
        border: 'border-emerald-200/60',
        dot: 'text-emerald-400'
      },
      dark: {
        bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
        text: 'text-emerald-200',
        border: 'border-emerald-800/40',
        dot: 'text-emerald-400'
      }
    },
    {
      light: {
        bg: 'bg-violet-50/80 hover:bg-violet-100/90',
        text: 'text-violet-700',
        border: 'border-violet-200/60',
        dot: 'text-violet-400'
      },
      dark: {
        bg: 'bg-violet-950/40 hover:bg-violet-900/50',
        text: 'text-violet-200',
        border: 'border-violet-800/40',
        dot: 'text-violet-400'
      }
    },
    {
      light: {
        bg: 'bg-amber-50/80 hover:bg-amber-100/90',
        text: 'text-amber-700',
        border: 'border-amber-200/60',
        dot: 'text-amber-400'
      },
      dark: {
        bg: 'bg-amber-950/40 hover:bg-amber-900/50',
        text: 'text-amber-200',
        border: 'border-amber-800/40',
        dot: 'text-amber-400'
      }
    },
    {
      light: {
        bg: 'bg-teal-50/80 hover:bg-teal-100/90',
        text: 'text-teal-700',
        border: 'border-teal-200/60',
        dot: 'text-teal-400'
      },
      dark: {
        bg: 'bg-teal-950/40 hover:bg-teal-900/50',
        text: 'text-teal-200',
        border: 'border-teal-800/40',
        dot: 'text-teal-400'
      }
    },
    {
      light: {
        bg: 'bg-indigo-50/80 hover:bg-indigo-100/90',
        text: 'text-indigo-700',
        border: 'border-indigo-200/60',
        dot: 'text-indigo-400'
      },
      dark: {
        bg: 'bg-indigo-950/40 hover:bg-indigo-900/50',
        text: 'text-indigo-200',
        border: 'border-indigo-800/40',
        dot: 'text-indigo-400'
      }
    },
    {
      light: {
        bg: 'bg-pink-50/80 hover:bg-pink-100/90',
        text: 'text-pink-700',
        border: 'border-pink-200/60',
        dot: 'text-pink-400'
      },
      dark: {
        bg: 'bg-pink-950/40 hover:bg-pink-900/50',
        text: 'text-pink-200',
        border: 'border-pink-800/40',
        dot: 'text-pink-400'
      }
    },
    {
      light: {
        bg: 'bg-cyan-50/80 hover:bg-cyan-100/90',
        text: 'text-cyan-700',
        border: 'border-cyan-200/60',
        dot: 'text-cyan-400'
      },
      dark: {
        bg: 'bg-cyan-950/40 hover:bg-cyan-900/50',
        text: 'text-cyan-200',
        border: 'border-cyan-800/40',
        dot: 'text-cyan-400'
      }
    },
    {
      light: {
        bg: 'bg-orange-50/80 hover:bg-orange-100/90',
        text: 'text-orange-700',
        border: 'border-orange-200/60',
        dot: 'text-orange-400'
      },
      dark: {
        bg: 'bg-orange-950/40 hover:bg-orange-900/50',
        text: 'text-orange-200',
        border: 'border-orange-800/40',
        dot: 'text-orange-400'
      }
    }
  ];

  // Modern size variants with better spacing
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  };

  const iconSizes = {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14
  };

  // Handle tag data - support both object and string formats
  const tagData = typeof tag === 'string' ? { name: tag } : tag;
  const tagName = tagData.name || tagData.label || 'Unknown';

  const colors = getTagColor();

  // Handle remove click
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag);
    }
  };

  // Handle tag click
  const handleClick = (e) => {
    if (onClick) {
      onClick(tag, e);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border backdrop-blur-sm
        transition-all duration-200 ease-out
        ${sizeClasses[size]}
        ${colors.bg}
        ${colors.text}
        ${colors.border}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-sm active:scale-95' : ''}
        ${className}
      `}
      onClick={handleClick}
      title={`Tag: ${tagName}`}
    >
      {/* Modern hash icon instead of dot */}
      <Hash size={iconSizes[size]} className={`${colors.dot} flex-shrink-0`} />
      
      {/* Tag name with better truncation */}
      <span className="truncate max-w-20 font-medium">
        {tagName}
      </span>

      {/* Soft remove button */}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className={`
            ml-1 p-0.5 rounded-full transition-all duration-200
            ${colors.text} hover:bg-red-100 dark:hover:bg-red-900/30 
            hover:text-red-600 dark:hover:text-red-400
            flex-shrink-0 hover:scale-110 active:scale-95
          `}
          title="Remove tag"
          aria-label={`Remove ${tagName} tag`}
        >
          <X size={iconSizes[size]} />
        </button>
      )}
    </span>
  );
};

export default EmployeeTag;