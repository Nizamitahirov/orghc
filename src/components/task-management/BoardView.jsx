// components/task-management/components/BoardView.jsx
'use client';

import React, { useState } from 'react';
import { Plus, Calendar, MessageSquare, Eye, GripVertical } from 'lucide-react';
import { STATUSES, PRIORITIES, isOverdue, formatDate, getAssignees } from './constants';
import taskService from '@/services/taskService';
import { useToast } from '@/components/common/Toast';

function Avatar({ name, imageUrl, size = 'xs' }) {
  const sizes = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-xs'
  };

  return imageUrl ? (
    <img src={imageUrl} alt={name} className={`${sizes[size]} rounded-full object-cover border-2 border-white dark:border-gray-800 shrink-0`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center font-bold text-white border-2 border-white dark:border-gray-800 shrink-0`} title={name}>
      {name?.charAt(0) || '?'}
    </div>
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

function KanbanCard({ task, onClick, darkMode }) {
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const txtSec = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bgAccent = darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const overdue = isOverdue(task.due_date, task.status);
  const assignees = getAssignees(task);

  return (
    <div
      onClick={() => onClick(task)}
      className={`${bgCard} border ${brd} rounded-xl p-3 cursor-pointer hover:shadow-lg hover:border-almet-sapphire/40 transition-all duration-200 group relative`}
    >
      <div className="flex items-start justify-between mb-2">
        <PriorityBadge priority={task.priority} />
        <div className={`p-1 rounded ${txtMut} hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all`}>
          <Eye size={13} />
        </div>
      </div>

      <h4 className={`text-xs font-semibold ${txt} mb-1.5 line-clamp-2 leading-relaxed ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
        {task.title}
      </h4>

      {task.description && (
        <p className={`text-[10px] ${txtMut} mb-2 line-clamp-1`}>{task.description}</p>
      )}

      {(task.folder_name || task.folder?.name) && (
        <div className="mb-2">
          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${bgAccent} ${txtSec} font-medium`}>
            <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: task.folder?.color || '#30539b' }} />
            {task.folder_name || task.folder?.name}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${overdue ? 'text-red-500' : txtMut}`}>
              <Calendar size={10} />
              {formatDate(task.due_date)}
            </span>
          )}
          {(task.comment_count > 0 || task.comments_count > 0) && (
            <span className={`flex items-center gap-0.5 text-[10px] ${txtMut}`}>
              <MessageSquare size={10} />
              {task.comment_count || task.comments_count}
            </span>
          )}
        </div>
        {assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {assignees.slice(0, 3).map(a => (
              <Avatar key={a.id} name={a.full_name || a.name} imageUrl={a.profile_image_url} size="xs" />
            ))}
            {assignees.length > 3 && (
              <div className={`w-5 h-5 rounded-full ${bgAccent} flex items-center justify-center text-[7px] font-bold ${txtMut} border-2 border-white dark:border-gray-800`}>
                +{assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BoardView({ tasks, selectedTeam, selectedFolder, onTaskClick, onTaskCreated, darkMode }) {
  const { showSuccess, showError } = useToast();
  const [quickAddCol, setQuickAddCol] = useState(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const tasksByStatus = Object.keys(STATUSES).map(key => ({
    key,
    ...STATUSES[key],
    tasks: tasks.filter(t => t.status === key),
    count: tasks.filter(t => t.status === key).length
  }));

  const handleQuickAdd = async (status) => {
    if (!quickAddTitle.trim() || !selectedTeam) return;
    const data = {
      title: quickAddTitle.trim(),
      status,
      priority: 'MEDIUM',
      team: selectedTeam.id,
      folder: selectedFolder && selectedFolder !== '__none__' ? selectedFolder : null
    };
    const r = await taskService.createTask(data);
    if (r.success) { showSuccess('Task created'); if (onTaskCreated) onTaskCreated(); }
    else { showError(r.error); }
    setQuickAddTitle('');
    setQuickAddCol(null);
  };

  return (
    <div className="grid grid-cols-4 gap-4 min-h-0">
      {tasksByStatus.map(col => (
        <div key={col.key} className="flex flex-col min-w-0">
          {/* Column header */}
          <div className={`flex items-center justify-between px-3 py-2 mb-3 rounded-xl ${bgCard} border ${brd} shadow-sm`}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className={`text-xs font-bold ${txt} uppercase tracking-wide`}>{col.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {col.count}
              </span>
            </div>
            <div
              onClick={() => { setQuickAddCol(col.key); setQuickAddTitle(''); }}
              className={`p-1 rounded-md cursor-pointer ${txtMut} hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <Plus size={14} />
            </div>
          </div>

          {/* Cards */}
          <div className="flex-1 space-y-2.5">
            {quickAddCol === col.key && (
              <div className={`${bgCard} border-2 border-dashed border-almet-sapphire/40 rounded-xl p-3 shadow-sm`}>
                <input
                  autoFocus
                  type="text"
                  value={quickAddTitle}
                  onChange={(e) => setQuickAddTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd(col.key);
                    if (e.key === 'Escape') setQuickAddCol(null);
                  }}
                  placeholder="Task title..."
                  className={`w-full text-xs px-3 py-2 border ${brd} rounded-lg ${bgCard} ${txt} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40 mb-2`}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickAdd(col.key)}
                    disabled={!quickAddTitle.trim()}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold bg-almet-sapphire text-white rounded-lg disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button onClick={() => setQuickAddCol(null)} className={`px-3 py-1.5 text-xs font-medium ${txtMut} rounded-lg`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {col.tasks.map(t => (
              <KanbanCard key={t.id} task={t} onClick={onTaskClick} darkMode={darkMode} />
            ))}

            {col.tasks.length === 0 && quickAddCol !== col.key && (
              <div
                onClick={() => { setQuickAddCol(col.key); setQuickAddTitle(''); }}
                className={`w-full py-6 border-2 border-dashed ${brd} rounded-xl ${txtMut} text-xs font-medium hover:border-almet-sapphire/30 cursor-pointer flex flex-col items-center gap-1.5`}
              >
                <Plus size={14} />
                <span>Add task</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}