// src/components/headcount/EmployeeTable/index.jsx
"use client";
import { memo } from "react";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import EmployeeTableHeader from "./EmployeeTableHeader";
import EmployeeTableRow from "./EmployeeTableRow";
import EmptyStateMessage from "./EmptyStateMessage";
import { SkeletonTableRow } from "../../common/SkeletonLoader";

const generateUniqueKey = (employee, index) => {
  if (employee.id) {
    if (employee.is_vacancy && employee.vacancy_details?.position_id) {
      return `vacancy-${employee.vacancy_details.position_id}-${employee.id}`;
    }
    return `employee-${employee.id}`;
  }
  if (employee.employee_id) return `emp-id-${employee.employee_id}-${index}`;
  if (employee.name && employee.email) return `name-email-${employee.name.replace(/\s/g, '')}-${employee.email}-${index}`;
  if (employee.name) return `name-${employee.name.replace(/\s/g, '')}-${index}`;
  return `row-${index}`;
};

const EmployeeTable = memo(({
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
  darkMode,
}) => {
  const { darkMode: themeDarkMode } = useTheme();
  const effectiveDarkMode = darkMode !== undefined ? darkMode : themeDarkMode;
  const styles = getThemeStyles(effectiveDarkMode);

  if (loading) {
    return (
      <div className={`${styles.bgCard} rounded-lg ${styles.shadowClass} overflow-hidden border ${styles.borderColor}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <EmployeeTableHeader
              selectAll={false}
              onToggleSelectAll={() => {}}
              onSort={() => {}}
              getSortDirection={() => null}
              isSorted={() => false}
              getSortIndex={() => -1}
            />
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={8} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.bgCard} rounded-lg ${styles.shadowClass} overflow-hidden border ${styles.borderColor}`}>
      {/* Single overflow-x-auto wrapper — no fixed height, page scrolls naturally */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <EmployeeTableHeader
            selectAll={selectAll}
            onToggleSelectAll={onToggleSelectAll}
            onSort={onSort}
            getSortDirection={getSortDirection}
            isSorted={isSorted}
            getSortIndex={getSortIndex}
          />
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {employees.length === 0 ? (
              <EmptyStateMessage hasFilters={hasFilters} onClearFilters={onClearFilters} />
            ) : (
              employees.map((employee, index) => (
                <EmployeeTableRow
                  key={generateUniqueKey(employee, index)}
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
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

EmployeeTable.displayName = 'EmployeeTable';

export default EmployeeTable;
