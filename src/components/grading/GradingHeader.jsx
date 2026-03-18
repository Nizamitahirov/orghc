import React from "react";
import { BarChart3 } from "lucide-react";

const GradingHeader = () => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 bg-almet-sapphire rounded-lg flex items-center justify-center flex-shrink-0">
      <BarChart3 size={18} className="text-white" />
    </div>
    <div>
      <h1 className="text-sm font-bold text-almet-cloud-burst dark:text-white leading-tight">
        Employee Grading System
      </h1>
      <p className="text-xs text-almet-waterloo dark:text-gray-400 mt-0.5">
        Manage salary grades and compensation structures
      </p>
    </div>
  </div>
);

export default GradingHeader;