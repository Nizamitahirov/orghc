// src/components/headcount/EmployeeTable/EmployeeTableHeader.jsx - FIXED Sorting Handler
"use client";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import SortingIndicator from "../SortingIndicator";
import CustomCheckbox from "@/components/common/CustomCheckbox";

const EmployeeTableHeader = ({
  selectAll,
  onToggleSelectAll,
  onSort,
  getSortDirection,
  isSorted,
  getSortIndex,
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  // FIXED: Handle sorting with proper event handling for Ctrl+Click multi-sort
  const handleSort = (field) => (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Detect if Ctrl/Cmd key is pressed for multi-sort
    const ctrlKey = event ? (event.ctrlKey || event.metaKey) : false;
    
    // Call onSort with field and ctrl key status
    if (onSort) {
      onSort(field, ctrlKey);
    }
  };

  return (
    <thead className={`${styles.theadBg}`}>
      <tr>
        {/* Selection Column */}
        <th scope="col" className="px-2 py-2 text-left">
          <div className="flex items-center">
            {/* FIXED: Use CustomCheckbox instead of native checkbox */}
            <CustomCheckbox
              checked={selectAll}
              onChange={onToggleSelectAll}
              className="mr-1"
            />
            <button
              className={`ml-1 text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
              onClick={handleSort("name")}
              title="Sort by employee name (Ctrl+Click for multi-sort)"
            >
              Employee 
              <SortingIndicator 
                direction={getSortDirection("name")} 
                index={getSortIndex ? getSortIndex("name") : undefined}
              />
            </button>
          </div>
        </th>

        {/* Contact Information */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("email")}
            title="Sort by email (Ctrl+Click for multi-sort)"
          >
            Contact Info
            <SortingIndicator 
              direction={getSortDirection("email")} 
              index={getSortIndex ? getSortIndex("email") : undefined}
            />
          </button>
        </th>

        {/* Company & Department */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("business_function_name")}
            title="Sort by Company (Ctrl+Click for multi-sort)"
          >
            Company & Department
            <SortingIndicator 
              direction={getSortDirection("business_function_name")} 
              index={getSortIndex ? getSortIndex("business_function_name") : undefined}
            />
          </button>
        </th>

        {/* Unit & Job Function */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("unit_name")}
            title="Sort by unit (Ctrl+Click for multi-sort)"
          >
            Unit & Job Function
            <SortingIndicator 
              direction={getSortDirection("unit_name")} 
              index={getSortIndex ? getSortIndex("unit_name") : undefined}
            />
          </button>
        </th>

        {/* Position & Grade */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("position_group_level")}
            title="Sort by position group level (Ctrl+Click for multi-sort)"
          >
            Position & Grade
            <SortingIndicator 
              direction={getSortDirection("position_group_level")} 
              index={getSortIndex ? getSortIndex("position_group_level") : undefined}
            />
          </button>
        </th>

        {/* Job Title */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("job_title")}
            title="Sort by job title (Ctrl+Click for multi-sort)"
          >
            Job Title
            <SortingIndicator 
              direction={getSortDirection("job_title")} 
              index={getSortIndex ? getSortIndex("job_title") : undefined}
            />
          </button>
        </th>

        {/* Line Manager */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("line_manager_name")}
            title="Sort by line manager (Ctrl+Click for multi-sort)"
          >
            Line Manager
            <SortingIndicator 
              direction={getSortDirection("line_manager_name")} 
              index={getSortIndex ? getSortIndex("line_manager_name") : undefined}
            />
          </button>
        </th>

        {/* Employment Dates */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("start_date")}
            title="Sort by start date (Ctrl+Click for multi-sort)"
          >
            Employment Dates
            <SortingIndicator 
              direction={getSortDirection("start_date")} 
              index={getSortIndex ? getSortIndex("start_date") : undefined}
            />
          </button>
        </th>

        {/* Status & Tags */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={handleSort("status_name")}
            title="Sort by status (Ctrl+Click for multi-sort)"
          >
            Status & Tags
            <SortingIndicator 
              direction={getSortDirection("status_name")} 
              index={getSortIndex ? getSortIndex("status_name") : undefined}
            />
          </button>
        </th>

        {/* Visibility */}
        <th scope="col" className="px-2 py-2 text-left">
          <span className={`text-xs font-medium ${styles.textMuted} tracking-wider`}>
            Visibility
          </span>
        </th>

        {/* Actions */}
        <th scope="col" className="px-2 py-2 text-right">
          <span className={`text-xs font-medium ${styles.textMuted} tracking-wider`}>
            Actions
          </span>
        </th>
      </tr>
    </thead>
  );
};

export default EmployeeTableHeader;