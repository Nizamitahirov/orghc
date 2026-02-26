// src/components/headcount/EmployeeTable/index.jsx - FIXED: Unique Key Generation
"use client";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import EmployeeTableHeader from "./EmployeeTableHeader";
import EmployeeTableRow from "./EmployeeTableRow";
import EmptyStateMessage from "./EmptyStateMessage";

const EmployeeTable = ({
  employees = [],
  selectedEmployees = [],
  selectAll = false,
  onToggleSelectAll,
  onToggleEmployeeSelection,
  onSort,
  getSortDirection,
  isSorted,
  getSortIndex,
  employeeVisibility = {},
  onVisibilityChange,
  onEmployeeAction,
  hasFilters = false,
  onClearFilters,
  loading = false,
  isUpdatingVisibility = false,
  showVisibilityConfirmation = false,
  darkMode
}) => {
  const { darkMode: themeDarkMode } = useTheme();
  const effectiveDarkMode = darkMode !== undefined ? darkMode : themeDarkMode;
  const styles = getThemeStyles(effectiveDarkMode);

  // FIXED: Generate guaranteed unique keys for each employee
  const generateUniqueKey = (employee, index) => {
  
    
    if (employee.id) {
      // Check if it's a vacancy (might have special ID format)
      if (employee.is_vacancy && employee.vacancy_details?.position_id) {
        return `vacancy-${employee.vacancy_details.position_id}-${employee.id}`;
      }
      return `employee-${employee.id}`;
    }
    
    if (employee.employee_id) {
      return `emp-id-${employee.employee_id}-${index}`;
    }
    
    // For complex cases (like combined employee/vacancy data)
    if (employee.name && employee.email) {
      return `name-email-${employee.name.replace(/\s/g, '')}-${employee.email}-${index}`;
    }
    
    if (employee.name) {
      return `name-${employee.name.replace(/\s/g, '')}-${index}`;
    }
    
    // Ultimate fallback
    return `row-${index}-${Date.now()}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.bgCard} rounded-lg ${styles.shadowClass} overflow-hidden border ${styles.borderColor}`}>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire"></div>
          <p className={`mt-4 ${styles.textMuted}`}>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.bgCard} rounded-lg ${styles.shadowClass} overflow-hidden border ${styles.borderColor}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Table Header */}
          <EmployeeTableHeader
            selectAll={selectAll}
            onToggleSelectAll={onToggleSelectAll}
            onSort={onSort}
            getSortDirection={getSortDirection}
            isSorted={isSorted}
            getSortIndex={getSortIndex}
          />
          
          {/* Table Body - FIXED: Guaranteed unique keys */}
          <tbody className={`bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700`}>
            {employees && employees.length > 0 ? (
              employees.map((employee, index) => (
                <EmployeeTableRow
                  key={generateUniqueKey(employee, index)} // FIXED: Always unique key
                  employee={employee}
                  isSelected={selectedEmployees.includes(employee.id)}
                  onToggleSelection={onToggleEmployeeSelection}
                  isVisible={employeeVisibility[employee.id] ?? employee.is_visible_in_org_chart ?? true}
                  onVisibilityChange={onVisibilityChange}
                  onAction={onEmployeeAction}
                  isUpdatingVisibility={isUpdatingVisibility}
                  showVisibilityConfirmation={showVisibilityConfirmation}
                />
              ))
            ) : (
              <EmptyStateMessage
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;