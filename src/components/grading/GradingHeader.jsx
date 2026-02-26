// src/components/grading/GradingHeader.jsx - Dark mode düzəldilmiş
import React from "react";
import { Users, TrendingUp } from "lucide-react";

const GradingHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
            Employee Grading System
          </h1>
          <p className="text-xs text-almet-waterloo dark:text-gray-300">
            Manage salary grades and compensation structures
          </p>
        </div>
      </div>
    </div>
  );
};

export default GradingHeader;