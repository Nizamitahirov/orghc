"use client";
import { useTheme } from "../common/ThemeProvider";

const ApplicationsChart = () => {
  const { darkMode } = useTheme();

  // Light mode colors
  const bgCard = "bg-white";
  const textPrimary = "text-gray-800";
  const textSecondary = "text-gray-700";
  const bgCircle = "#e5e7eb";
  const innerCircle = "#ffffff";
  
  // Dark mode colors
  const darkBgCard = "dark:bg-gray-800";
  const darkTextPrimary = "dark:text-white";
  const darkTextSecondary = "dark:text-gray-300";
  const darkBgCircle = "#374151";
  const darkInnerCircle = "#1f2937";

  return (
    <div
      className={`${bgCard} ${darkBgCard} rounded-lg p-6 shadow-md transition-colors duration-200`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-medium ${textPrimary} ${darkTextPrimary}`}>
          Job Applications
        </h3>
      </div>
      <div className="flex justify-center items-center h-48">
        {/* Donut Chart - Approximation */}
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill={darkMode ? darkBgCircle : bgCircle} />

            {/* Segments */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset="70"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset="212"
              transform="rotate(200 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset="226"
              transform="rotate(120 50 50)"
            />

            {/* Inner circle for donut */}
            <circle cx="50" cy="50" r="35" fill={darkMode ? darkInnerCircle : innerCircle} />
          </svg>
        </div>

        {/* Legend */}
        <div className="ml-8 space-y-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className={`text-sm ${textSecondary} ${darkTextSecondary}`}>Qualified (45%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className={`text-sm ${textSecondary} ${darkTextSecondary}`}>Interview (25%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className={`text-sm ${textSecondary} ${darkTextSecondary}`}>Hired (30%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsChart;