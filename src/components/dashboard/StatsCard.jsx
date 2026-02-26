"use client";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const StatsCard = ({ title, value, icon, change, comparison }) => {
  const { darkMode } = useTheme();
  const isPositive = !change.includes("-");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md transition-colors duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
        <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded-lg text-blue-500 dark:text-blue-400">{icon}</div>
      </div>
      <div className="flex items-center mt-4">
        <span
          className={`text-xs flex items-center ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          <ArrowUpRight
            size={14}
            className={`mr-1 ${!isPositive ? "transform rotate-90" : ""}`}
          />{" "}
          {change}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">{comparison}</span>
      </div>
    </div>
  );
};

export default StatsCard;