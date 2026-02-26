// src/components/headcount/EmployeeTable/EmployeeTableRow.jsx - FIXED with CustomCheckbox
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "../../common/ThemeProvider";
import CustomCheckbox from "../../common/CustomCheckbox";

// FIXED: Correct imports from themeStyles
import { 
  getThemeStyles, 
  getEmployeeColors,
  getCurrentColorMode, 
  addColorModeListener 
} from "../utils/themeStyles";

import EmployeeStatusBadge from "../EmployeeStatusBadge";
import EmployeeTag from "../EmployeeTag";
import EmployeeVisibilityToggle from "../EmployeeVisibilityToggle";
import ActionsDropdown from "../ActionsDropdown";

const EmployeeTableRow = ({
  employee,
  isSelected,
  onToggleSelection,
  isVisible,
  onVisibilityChange,
  onAction,
  isUpdatingVisibility = false,
  showVisibilityConfirmation = false
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);
  
  // FIXED: Color mode state with better initialization
  const [currentColorMode, setCurrentColorMode] = useState(() => {
    try {
      return getCurrentColorMode();
    } catch (error) {
      console.error('EmployeeTableRow: Error getting initial color mode:', error);
      return 'HIERARCHY'; // fallback
    }
  });
  
  // Force color updates
  const [colorUpdateKey, setColorUpdateKey] = useState(0);
  
  // Local state for visibility operations
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  // FIXED: Enhanced color mode listener with better error handling
  useEffect(() => {
    let isComponentMounted = true;
    let removeListener;
    
    try {
      // Primary listener through theme system
      removeListener = addColorModeListener((newMode) => {
        if (!isComponentMounted) {
          return;
        }
        
        setCurrentColorMode(newMode);
        setColorUpdateKey(prev => prev + 1);
      });
    } catch (error) {
      console.error('EmployeeTableRow: Error setting up color mode listener:', error);
    }

    // Secondary listener for custom events
    const handleColorModeChange = (event) => {
      if (!isComponentMounted) return;
      setCurrentColorMode(event.detail.mode);
      setColorUpdateKey(prev => prev + 1);
    };

    // Reference data update listener
    const handleReferenceDataUpdate = (event) => {
      if (!isComponentMounted) return;
      setColorUpdateKey(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('colorModeChanged', handleColorModeChange);
      window.addEventListener('referenceDataUpdated', handleReferenceDataUpdate);
    }

    return () => {
      isComponentMounted = false;
      if (removeListener && typeof removeListener === 'function') {
        try {
          removeListener();
        } catch (error) {
          console.error('EmployeeTableRow: Error removing listener:', error);
        }
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('colorModeChanged', handleColorModeChange);
        window.removeEventListener('referenceDataUpdated', handleReferenceDataUpdate);
      }
    };
  }, [employee?.id, employee?.name, currentColorMode]);

  // FIXED: Enhanced getEmployeeColors with comprehensive field fallback and debugging
  const getEmployeeColorsWithFallback = useCallback((employee, darkMode) => {
    // Create normalized employee object with comprehensive field mapping
    const normalizedEmployee = {
      ...employee,
      // Position group mapping - what employees actually use
      position_group_name: employee.position_group_name || 
                          employee.positionGroup || 
                          employee.position_group ||
                          employee.position_group_detail?.display_name ||
                          employee.position_group_detail?.name ||
                          'Unknown Position',
      
      // Department mapping
      department_name: employee.department_name ||
                      employee.department ||
                      employee.department_detail?.display_name ||
                      employee.department_detail?.name ||
                      'Unknown Department',
                      
      // Company mapping
      business_function_name: employee.business_function_name ||
                             employee.businessFunction ||
                             employee.business_function ||
                             employee.business_function_detail?.display_name ||
                             employee.business_function_detail?.name ||
                             'Unknown Function',
      
      // Unit mapping                     
      unit_name: employee.unit_name ||
                 employee.unit ||
                 employee.unit_detail?.display_name ||
                 employee.unit_detail?.name ||
                 'Unknown Unit',
                 
      // Job function mapping
      job_function_name: employee.job_function_name ||
                        employee.jobFunction ||
                        employee.job_function ||
                        employee.job_function_detail?.display_name ||
                        employee.job_function_detail?.name ||
                        'Unknown Job Function',
                        
      // Status mapping
      status_name: employee.status_name ||
                  employee.status ||
                  employee.status_detail?.display_name ||
                  employee.status_detail?.name ||
                  'Unknown Status',
                  
      // Grading mapping  
      grading_level: employee.grading_level ||
                    employee.grade ||
                    employee.grading_display ||
                    'No Grade',

      // Tags mapping
      tag_names: employee.tag_names || employee.tags || [],
      tags: employee.tags || employee.tag_names || []
    };
    
    try {
      const colors = getEmployeeColors(normalizedEmployee, darkMode);
      return colors;
    } catch (error) {
      console.error('EmployeeTableRow: Error getting employee colors:', error);
      // Return safe fallback colors
      return {
        borderColor: '#6b7280',
        backgroundColor: darkMode ? '#374151' : '#f9fafb',
        dotColor: '#9ca3af',
        textColor: darkMode ? '#ffffff' : '#000000',
        borderStyle: '4px solid #6b7280',
        backgroundStyle: darkMode ? 'background-color: #374151' : 'background-color: #f9fafb',
        dotStyle: 'background-color: #9ca3af',
        avatarStyle: 'background-color: #6b7280'
      };
    }
  }, [currentColorMode]);

  // FIXED: Memoized employee colors with all update dependencies
  const employeeColors = useMemo(() => {
    const colors = getEmployeeColorsWithFallback(employee, darkMode);
    return colors;
  }, [employee, darkMode, currentColorMode, colorUpdateKey, getEmployeeColorsWithFallback]);

  // Generate initials from employee name
  const getInitials = useCallback((name) => {
    if (!name) return "NA";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  }, []);

  // Use the correct field from backend response
  const employeeName = useMemo(() => {
    return employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
  }, [employee.name, employee.first_name, employee.last_name]);

  const initials = useMemo(() => getInitials(employeeName), [employeeName, getInitials]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "2-digit" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  }, []);

  // Format phone number
  const formatPhone = useCallback((phone) => {
    if (!phone) return "N/A";
    return phone;
  }, []);

  // Enhanced visibility change handler
  const handleVisibilityChange = useCallback(async (employeeId, newVisibility) => {
    if (visibilityLoading) return;
    
    setVisibilityLoading(true);
    
    try {
      await onVisibilityChange(employeeId, newVisibility);
    } catch (error) {
      console.error('Failed to update visibility:', error);
      alert(`Failed to update visibility: ${error.message}`);
    } finally {
      setVisibilityLoading(false);
    }
  }, [onVisibilityChange, visibilityLoading]);

  // Enhanced action handler
  const handleEmployeeAction = useCallback((employeeId, action) => {
    if (onAction) {
      onAction(employeeId, action);
    }
  }, [onAction]);

  // Enhanced tag processing
  const getTagsToDisplay = useCallback(() => {
    const tags = [];
    
    // Handle tag_names array
    if (employee.tag_names && Array.isArray(employee.tag_names)) {
      employee.tag_names.forEach((tagItem, idx) => {
        if (typeof tagItem === 'string') {
          tags.push({
            id: `tag_name_${idx}`,
            name: tagItem,
            color: '#gray'
          });
        } else if (typeof tagItem === 'object' && tagItem.name) {
          tags.push({
            id: tagItem.id || `tag_obj_${idx}`,
            name: tagItem.name,
            color: tagItem.color || '#gray'
          });
        }
      });
    }
    
    // Handle tags array
    if (employee.tags && Array.isArray(employee.tags)) {
      employee.tags.forEach((tag, idx) => {
        if (typeof tag === 'object' && tag.name) {
          tags.push({
            id: tag.id || `tag_full_${idx}`,
            name: tag.name,
            color: tag.color || '#gray'
          });
        }
      });
    }
    
    return tags;
  }, [employee.tag_names, employee.tags]);

  const tagsToDisplay = useMemo(() => getTagsToDisplay(), [getTagsToDisplay]);

  // FIXED: Dynamic row style with real-time color updates and better logging
  const rowStyle = useMemo(() => {
    const style = {
      borderLeft: `3px solid ${employeeColors.borderColor}`,
      backgroundColor: isSelected 
        ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
        : 'transparent',
      transition: 'all 0.3s ease-in-out'
    };
    
    return style;
  }, [employeeColors.borderColor, isSelected, darkMode, employee?.name]);

  // FIXED: Dynamic avatar style with real-time color updates
  const avatarStyle = useMemo(() => {
    const style = {
      background: `linear-gradient(135deg, ${employeeColors.borderColor}, ${employeeColors.borderColor}95)`,
      color: 'white',
      transition: 'background 0.3s ease-in-out'
    };
    
    return style;
  }, [employeeColors.borderColor, employee?.name]);

  // FIXED: Dynamic text highlighting based on color mode
  const getFieldHighlight = useCallback((fieldType) => {
    const isHighlighted = currentColorMode === fieldType;
    return {
      color: isHighlighted ? employeeColors.borderColor : undefined,
      fontWeight: isHighlighted ? '600' : '500',
      transition: 'all 0.3s ease-in-out'
    };
  }, [currentColorMode, employeeColors.borderColor]);

  return (
    <tr
      className={`
        transition-all duration-300 ease-out
        ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50/80'}
        ${visibilityLoading ? 'opacity-75' : ''}
        border-b border-gray-100/50 dark:border-gray-800/50
      `}
      style={rowStyle}
    >
      {/* Employee Info - Name & Employee ID */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex items-center">
          {/* FIXED: Use CustomCheckbox instead of native checkbox */}
          <CustomCheckbox
            checked={isSelected}
            onChange={() => onToggleSelection(employee.id)}
            className="transition-all"
          />
          <div className="flex items-center ml-2">
            {/* Compact Avatar with Dynamic Colors */}
            <div 
              className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 shadow-sm"
              style={avatarStyle}
            >
              {employee.profile_image ? (
                <img
                  src={employee.profile_image}
                  alt={employeeName}
                  className="h-full w-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span style={{ display: employee.profile_image ? 'none' : 'flex' }}>
                {initials}
              </span>
            </div>
            <div>
              <Link href={`/structure/employee/${employee.id}`}>
                <div className={`
                  text-xs font-medium ${styles.textPrimary} truncate max-w-[120px] 
                  hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer 
                  hover:underline transition-colors duration-200
                `}>
                  {employeeName}
                </div>
              </Link>
              <div className={`text-xs ${styles.textMuted} mt-0.5`}>
                {employee.employee_id || 'No ID'}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Contact Info */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
            {employee.email || 'No email'}
          </div>
          <div className={`text-xs ${styles.textMuted}`}>
            {formatPhone(employee.phone)}
          </div>
          {employee.date_of_birth && (
            <div className={`text-xs ${styles.textMuted}`}>
              DOB: {formatDate(employee.date_of_birth)}
            </div>
          )}
        </div>
      </td>

      {/* Company & Department - Highlighted when active */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div 
            className={`text-xs truncate max-w-[100px] transition-all duration-200`}
            style={{
              ...getFieldHighlight('BUSINESS_FUNCTION'),
              color: getFieldHighlight('BUSINESS_FUNCTION').color || (darkMode ? '#d1d5db' : '#374151')
            }}
          >
            {employee.business_function_name || 'No BF'}
          </div>
          <div 
            className={`text-xs truncate max-w-[100px] transition-all duration-200`}
            style={{
              ...getFieldHighlight('DEPARTMENT'),
              color: getFieldHighlight('DEPARTMENT').color || (darkMode ? '#9ca3af' : '#6b7280')
            }}
          >
            {employee.department_name || 'No Department'}
          </div>
        </div>
      </td>

      {/* Unit & Job Function - Highlighted when active */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div 
            className={`text-xs truncate max-w-[100px] transition-all duration-200`}
            style={{
              ...getFieldHighlight('UNIT'),
              color: getFieldHighlight('UNIT').color || (darkMode ? '#d1d5db' : '#374151')
            }}
          >
            {employee.unit_name || 'No Unit'}
          </div>
          <div 
            className={`text-xs truncate max-w-[100px] transition-all duration-200`}
            style={{
              ...getFieldHighlight('JOB_FUNCTION'),
              color: getFieldHighlight('JOB_FUNCTION').color || (darkMode ? '#9ca3af' : '#6b7280')
            }}
          >
            {employee.job_function_name || 'No Job Function'}
          </div>
        </div>
      </td>

      {/* Position & Grade - Highlighted when active */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col items-center space-y-0.5">
          <div className="flex items-center">
            <div 
              className={`text-xs truncate max-w-[100px] text-center font-medium transition-all duration-200`}
              style={getFieldHighlight('HIERARCHY')}
            >
              {employee.position_group_name || 'No Position'}
            </div>
          </div>
          <div className={`text-xs ${styles.textMuted} text-center`}>
            {employee.grading_display || employee.grading_level || 'No Grade'}
          </div>
        </div>
      </td>

      {/* Job Title */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
          {employee.job_title || 'No Title'}
        </div>
      </td>

      {/* Line Manager */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
            {employee.line_manager_name || 'No Manager'}
          </div>
          {employee.line_manager_hc_number && (
            <div className={`text-xs ${styles.textMuted}`}>
              HC: {employee.line_manager_hc_number}
            </div>
          )}
          {employee.direct_reports_count > 0 && (
            <div className={`text-xs ${styles.textMuted}`}>
              Reports: {employee.direct_reports_count}
            </div>
          )}
        </div>
      </td>

      {/* Employment Dates */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary}`}>
            Start: {formatDate(employee.start_date)}
          </div>
          {employee.end_date && (
            <div className={`text-xs ${styles.textMuted}`}>
              End: {formatDate(employee.end_date)}
            </div>
          )}
        </div>
      </td>

      {/* Status & Tags - Highlighted when active */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col justify-center space-y-1">
          <div className="flex justify-center">
            <EmployeeStatusBadge 
              status={employee.status_name || employee.current_status_display || 'Unknown'} 
              color={employee.status_color}
              size="xs"
              isHighlighted={currentColorMode === 'STATUS'}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-0.5">
            {tagsToDisplay.slice(0, 3).map((tag, idx) => (
              <EmployeeTag 
                key={`tag-${tag.id || idx}`}
                tag={tag}
                size="xs"
              />
            ))}
            {tagsToDisplay.length > 3 && (
              <span className={`text-xs ${styles.textMuted} px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full`}>
                +{tagsToDisplay.length - 3}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Compact Visibility Toggle */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex justify-center">
          <EmployeeVisibilityToggle
            employeeId={employee.id}
            initialVisibility={employee.is_visible_in_org_chart !== false}
            onVisibilityChange={handleVisibilityChange}
            isLoading={visibilityLoading || isUpdatingVisibility}
            size="xs"
            showTooltip={true}
            confirmToggle={showVisibilityConfirmation}
            disabled={false}
          />
        </div>
      </td>

      {/* Compact Actions */}
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <div className="flex items-center justify-center">
          <ActionsDropdown
            employeeId={employee.id}
            employee={employee}
            onAction={handleEmployeeAction}
            disabled={visibilityLoading}
          />
        </div>
      </td>
    </tr>
  );
};

export default EmployeeTableRow;