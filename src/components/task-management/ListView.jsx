// components/task-management/components/ListView.jsx
'use client';

import React from 'react';
import { Eye, ListTodo, FolderKanban } from 'lucide-react';
import { STATUSES, PRIORITIES, isOverdue, formatDate, getAssignees } from './constants';

function Avatar({ name, imageUrl, size = 'xs' }) {
  const sizes = { xs: 'w-5 h-5 text-[8px]', sm: 'w-6 h-6 text-[9px]', md: 'w-8 h-8 text-xs' };
  return imageUrl ? (
    <img src={imageUrl} alt={name} className={`${sizes[size]} rounded-full object-cover border-2 border-white dark:border-gray-800 shrink-0`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center font-bold text-white border-2 border-white dark:border-gray-800 shrink-0`} title={name}>
      {name?.charAt(0) || '?'}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUSES[status] || STATUSES.TODO;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: s.color, backgroundColor: s.color + '15' }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITIES[priority] || PRIORITIES.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.bg} ${p.text}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}

export default function ListView({ tasks, onTaskClick, darkMode }) {
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const bgAccent = darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${bgCard} border ${brd} rounded-xl overflow-hidden shadow-sm`}>
      {/* Header */}
      <div className={`grid grid-cols-[1fr_100px_90px_100px_120px_40px] gap-3 px-5 py-2.5 border-b ${brd} ${bgAccent}`}>
        {['Task', 'Status', 'Priority', 'Due Date', 'Assignees', ''].map((h, i) => (
          <span key={i} className={`text-[10px] font-bold ${txtMut} uppercase tracking-wider`}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {tasks.map(task => {
          const overdue = isOverdue(task.due_date, task.status);
          const assignees = getAssignees(task);
          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="grid grid-cols-[1fr_100px_90px_100px_120px_40px] gap-3 px-5 py-2.5 items-center hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors group"
            >
              <div className="min-w-0">
                <span className={`text-sm font-medium ${txt} truncate block ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
                  {task.title}
                </span>
                {(task.folder_name || task.folder?.name) && (
                  <span className={`text-[10px] ${txtMut} flex items-center gap-1 mt-0.5`}>
                    <FolderKanban size={10} />
                    {task.folder_name || task.folder?.name}
                  </span>
                )}
              </div>
              <div><StatusBadge status={task.status} /></div>
              <div><PriorityBadge priority={task.priority} /></div>
              <span className={`text-xs font-medium ${overdue ? 'text-red-500' : txtMut}`}>
                {formatDate(task.due_date)}
              </span>
              <div className="flex -space-x-1.5">
                {assignees.slice(0, 4).map(a => (
                  <Avatar key={a.id} name={a.full_name || a.name} imageUrl={a.profile_image_url} size="xs" />
                ))}
                {assignees.length > 4 && (
                  <span className={`text-[9px] ${txtMut} ml-1.5`}>+{assignees.length - 4}</span>
                )}
              </div>
              <div className={`p-1 rounded-md opacity-0 group-hover:opacity-100 ${txtMut} hover:bg-gray-200 dark:hover:bg-gray-600 transition-all`}>
                <Eye size={13} />
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="py-16 text-center">
          <ListTodo size={28} className={`mx-auto ${txtMut} mb-3`} />
          <p className={`text-sm font-medium ${txt} mb-1`}>No tasks found</p>
          <p className={`text-xs ${txtMut}`}>Create a new task to get started</p>
        </div>
      )}
    </div>
  );
}