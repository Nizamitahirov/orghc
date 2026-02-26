// src/components/headcount/EmployeeStatusBadge.jsx - Modern Status Badge
"use client";
import { useTheme } from "../common/ThemeProvider";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Pause, 
  Baby,
  Plane,
  UserX,
  Calendar,
  Coffee
} from "lucide-react";

const EmployeeStatusBadge = ({ 
  status, 
  color, 
  size = "md", 
  showIcon = true,
  className = ""
}) => {
  const { darkMode } = useTheme();

  // Modern status configurations with soft colors and proper icons
  const getStatusConfig = (statusName) => {
    const normalizedStatus = statusName.toLowerCase();
    
    const configs = {
      'active': {
        bg: darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
        text: darkMode ? 'text-emerald-300' : 'text-emerald-700',
        border: darkMode ? 'border-emerald-700/30' : 'border-emerald-200/60',
        icon: CheckCircle
      },
      'on leave': {
        bg: darkMode ? 'bg-amber-900/20' : 'bg-amber-50',
        text: darkMode ? 'text-amber-300' : 'text-amber-700',
        border: darkMode ? 'border-amber-700/30' : 'border-amber-200/60',
        icon: Plane
      },
      'leave': {
        bg: darkMode ? 'bg-amber-900/20' : 'bg-amber-50',
        text: darkMode ? 'text-amber-300' : 'text-amber-700',
        border: darkMode ? 'border-amber-700/30' : 'border-amber-200/60',
        icon: Calendar
      },
      'maternity': {
        bg: darkMode ? 'bg-pink-900/20' : 'bg-pink-50',
        text: darkMode ? 'text-pink-300' : 'text-pink-700',
        border: darkMode ? 'border-pink-700/30' : 'border-pink-200/60',
        icon: Baby
      },
      'maternity leave': {
        bg: darkMode ? 'bg-pink-900/20' : 'bg-pink-50',
        text: darkMode ? 'text-pink-300' : 'text-pink-700',
        border: darkMode ? 'border-pink-700/30' : 'border-pink-200/60',
        icon: Baby
      },
      'inactive': {
        bg: darkMode ? 'bg-gray-800/30' : 'bg-gray-50',
        text: darkMode ? 'text-gray-400' : 'text-gray-600',
        border: darkMode ? 'border-gray-600/30' : 'border-gray-200/60',
        icon: Pause
      },
      'terminated': {
        bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
        text: darkMode ? 'text-red-300' : 'text-red-700',
        border: darkMode ? 'border-red-700/30' : 'border-red-200/60',
        icon: UserX
      },
      'pending': {
        bg: darkMode ? 'bg-sky-900/20' : 'bg-sky-50',
        text: darkMode ? 'text-sky-300' : 'text-sky-700',
        border: darkMode ? 'border-sky-700/30' : 'border-sky-200/60',
        icon: Clock
      },
      'sick leave': {
        bg: darkMode ? 'bg-orange-900/20' : 'bg-orange-50',
        text: darkMode ? 'text-orange-300' : 'text-orange-700',
        border: darkMode ? 'border-orange-700/30' : 'border-orange-200/60',
        icon: AlertCircle
      },
      'break': {
        bg: darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50',
        text: darkMode ? 'text-indigo-300' : 'text-indigo-700',
        border: darkMode ? 'border-indigo-700/30' : 'border-indigo-200/60',
        icon: Coffee
      }
    };

    return configs[normalizedStatus] || configs['inactive'];
  };

  // Size variants with modern spacing
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border backdrop-blur-sm
        transition-all duration-200 ease-out
        ${sizeClasses[size]}
        ${config.bg}
        ${config.text}
        ${config.border}
        ${className}
      `}
      title={`Employee status: ${status}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {showIcon && (
        <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
      )}
      <span className="font-medium truncate">
        {status}
      </span>
    </span>
  );
};

export default EmployeeStatusBadge;