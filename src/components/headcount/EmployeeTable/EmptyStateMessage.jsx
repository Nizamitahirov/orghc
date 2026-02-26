// src/components/headcount/EmployeeTable/EmptyStateMessage.jsx
"use client";
import { AlertCircle } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";

/**
 * Boş cədvəl vəziyyətini göstərən komponent
 * @param {Object} props - Komponent parametrləri
 * @param {boolean} props.hasFilters - Filtrlər aktivdir ya yox
 * @param {Function} props.onClearFilters - Filtrləri təmizləmək üçün funksiya
 * @returns {JSX.Element} - Boş vəziyyət komponenti
 */
const EmptyStateMessage = ({ hasFilters, onClearFilters }) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  return (
    <tr>
      <td colSpan="10" className="px-6 py-10 text-center">
        <div className="flex flex-col items-center">
          <AlertCircle size={48} className="text-gray-400 mb-3" />
          <p className={`${styles.textPrimary} text-lg font-medium`}>No employees found</p>
          <p className={`${styles.textMuted} mt-1`}>
            {hasFilters
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Add your first employee to get started."}
          </p>
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="mt-3 text-almet-sapphire hover:text-almet-astral dark:text-almet-steel-blue"
            >
              Clear all filters
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default EmptyStateMessage;