// src/components/jobCatalog/JobListItem.jsx

import React from 'react';
import { Users, Building2, Target } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';

export default function JobListItem({ job, context }) {
  const { setSelectedJob } = context;
  const { darkMode } = useTheme();
  const colors = getHierarchyColor(job.hierarchy, darkMode);
  
  return (
    <div 
      className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-almet-comet"
      style={{ 
        borderLeftWidth: '3px', 
        borderLeftColor: colors.borderColor 
      }}
      onClick={() => setSelectedJob(job)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header with badge and title */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span 
              className="px-2 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: colors.backgroundColor,
                color: colors.textColor
              }}
            >
              {job.hierarchy}
            </span>
            <h3 className="font-medium text-gray-900 dark:text-white text-xs truncate">
              {job.title}
            </h3>
          </div>
          
          {/* Job details */}
          <div className="flex items-center gap-4 text-[10px] text-gray-600 dark:text-almet-bali-hai flex-wrap">
            <span className="flex items-center">
              <Building2 size={10} className="mr-1 flex-shrink-0" />
              <span className="truncate">{job.unit}</span>
            </span>
            <span className="flex items-center">
              <Target size={10} className="mr-1 flex-shrink-0" />
              <span className="truncate">{job.department}</span>
            </span>
            <span className="flex items-center">
              <Users size={10} className="mr-1 flex-shrink-0" />
              <span>{job.currentEmployees}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}