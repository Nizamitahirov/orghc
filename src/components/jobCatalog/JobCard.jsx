// src/components/jobCatalog/JobCard.jsx

import React from 'react';
import { Users, Building2, Target } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';

export default function JobCard({ job, context }) {
  const { setSelectedJob } = context;
  const { darkMode } = useTheme();
  const colors = getHierarchyColor(job.hierarchy, darkMode);
  
  return (
    <div 
      className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={() => setSelectedJob(job)}
    >
      {/* Top border - hierarchy color indicator */}
      <div 
        className="h-1"
        style={{ backgroundColor: colors.borderColor }}
      />
      
      <div className="p-3">
        {/* Header with badge */}
        <div className="mb-2">
          <span 
            className="inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-1.5"
            style={{
              backgroundColor: colors.backgroundColor,
              color: colors.textColor
            }}
          >
            {job.hierarchy}
          </span>
          <h3 className="font-medium text-gray-900 dark:text-white text-xs leading-tight line-clamp-2 min-h-[2.5rem]">
            {job.title}
          </h3>
        </div>

        {/* Job details */}
        <div className="space-y-1.5 mb-2">
          <div className="flex items-center text-[10px] text-gray-600 dark:text-almet-bali-hai">
            <Building2 size={10} className="mr-1.5 text-almet-sapphire flex-shrink-0" />
            <span className="truncate">{job.unit}</span>
          </div>
          <div className="flex items-center text-[10px] text-gray-600 dark:text-almet-bali-hai">
            <Target size={10} className="mr-1.5 text-green-500 flex-shrink-0" />
            <span className="truncate">{job.department}</span>
          </div>
        </div>

        {/* Footer - employee count */}
        <div className="flex items-center pt-2 border-t border-gray-100 dark:border-almet-comet">
          <div className="flex items-center text-[10px] text-gray-500 dark:text-almet-bali-hai">
            <Users size={10} className="mr-1" />
            <span>{job.currentEmployees} {job.currentEmployees === 1 ? 'employee' : 'employees'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}