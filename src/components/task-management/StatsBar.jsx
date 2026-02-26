// components/task-management/components/StatsBar.jsx
'use client';

import React from 'react';
import { Target, Circle, Clock, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatsBar({ stats, darkMode }) {
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const statItems = [
    { label: 'Total', value: stats.total || 0, color: '#30539b', icon: Target },
    { label: 'To Do', value: stats.by_status?.TODO || 0, color: '#6B7280', icon: Circle },
    { label: 'In Progress', value: stats.by_status?.IN_PROGRESS || 0, color: '#3B82F6', icon: Clock },
    { label: 'In Review', value: stats.by_status?.IN_REVIEW || 0, color: '#8B5CF6', icon: Eye },
    { label: 'Completed', value: stats.by_status?.COMPLETED || 0, color: '#10B981', icon: CheckCircle2 },
    { label: 'Overdue', value: stats.overdue || 0, color: '#EF4444', icon: AlertCircle }
  ];

  const completionRate = stats.total > 0 
    ? Math.round(((stats.by_status?.COMPLETED || 0) / stats.total) * 100) 
    : 0;

  return (
    <div className={`px-6 py-2 border-b ${brd} ${bgCard} shrink-0`}>
      <div className="flex items-center gap-5">
        {statItems.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <s.icon size={12} style={{ color: s.color }} />
            <span className={`text-[10px] ${txtMut}`}>{s.label}</span>
            <span className={`text-xs font-bold ${txt}`}>{s.value}</span>
          </div>
        ))}
        {/* Mini progress bar */}
        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-[10px] ${txtMut}`}>Progress</span>
          <div className={`w-24 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${completionRate}%` }} 
            />
          </div>
          <span className={`text-[10px] font-bold ${txt}`}>{completionRate}%</span>
        </div>
      </div>
    </div>
  );
}