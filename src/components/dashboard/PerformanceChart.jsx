"use client";
import { useTheme } from "../common/ThemeProvider";

const PerformanceChart = () => {
  const { darkMode } = useTheme();

  // Colors based on new design
  const bgCard = "bg-white";
  const textPrimary = "text-gray-800";
  const bgCircle = "#e5e7eb";
  const textColor = "#1f2937";
  
  // Dark mode colors
  const darkBgCard = "dark:bg-gray-800";
  const darkTextPrimary = "dark:text-white";
  const darkBgCircle = "#374151";
  const darkTextColor = "white";

  return (
    <div
      className={`${bgCard} ${darkBgCard} rounded-lg p-6 shadow-md transition-colors duration-200`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-medium ${textPrimary} ${darkTextPrimary}`}>
          Team Performance
        </h3>
      </div>
      <div className="flex space-x-4">
        {/* Line Chart - Approximation */}
        <div className="w-2/3 h-48 relative">
          <div className="absolute inset-0">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <path
                d="M0,150 C50,120 100,180 150,100 C200,20 250,80 300,70 C350,60 400,100 400,80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              <path
                d="M0,150 C50,120 100,180 150,100 C200,20 250,80 300,70 C350,60 400,100 400,80"
                fill="url(#gradient)"
                fillOpacity="0.2"
                stroke="none"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Circular Progress - Approximation */}
        <div className="w-1/3 flex justify-center items-center">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={darkMode ? darkBgCircle : bgCircle}
                strokeWidth="10"
              />

              {/* Progress circle - 75% complete */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset="70"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />

              {/* Percentage text */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill={darkMode ? darkTextColor : textColor}
              >
                75%
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;