// components/task-management/components/TaskModal.jsx
'use client';

import React, { useState, useCallback } from 'react';
import { X, CheckCircle2, ListTodo, Calendar, Users } from 'lucide-react';
import EmployeeMultiSelect from './EmployeeSelector';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import taskService from '@/services/taskService';
import { useToast } from '@/components/common/Toast';
import { PRIORITIES, STATUSES } from './constants';

export default function TaskModal({ task, selectedTeam, selectedFolder, folders, onClose, onSuccess, darkMode }) {
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState(task?.title || '');
  const [desc, setDesc] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
  const [taskStatus, setTaskStatus] = useState(task?.status || 'TODO');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [assignees, setAssignees] = useState(() => task?.assigned_to_details || task?.assigned_to || []);
  const [folderId, setFolderId] = useState(
    task?.folder?.id || (selectedFolder && selectedFolder !== '__none__' ? selectedFolder : null)
  );
  const [saving, setSaving] = useState(false);

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const bgAccent = darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const handleAssigneesChange = useCallback((v) => setAssignees(v), []);

  const save = async () => {
    if (!title.trim() || !selectedTeam) {
      showError('Task title required');
      return;
    }

    setSaving(true);
    const data = {
      title: title.trim(),
      description: desc.trim(),
      priority,
      status: taskStatus,
      due_date: dueDate || null,
      assigned_to: assignees.map(a => a.id),
      team: selectedTeam.id,
      folder: folderId
    };

    const r = task 
      ? await taskService.updateTask(task.id, data) 
      : await taskService.createTask(data);

    setSaving(false);

    if (r.success) {
      showSuccess(task ? 'Task updated' : 'Task created');
      if (onSuccess) onSuccess();
    } else {
      showError(r.error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${bgCard} rounded-2xl shadow-2xl w-full max-w-3xl border ${brd}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${brd} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center">
              <ListTodo size={20} className="text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${txt}`}>
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className={`text-xs ${txtMut}`}>Add task details and assign to team members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${txtMut} hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 custom-scrollbar">
          {/* Task Title */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={`w-full px-4 py-2.5 text-sm font-medium border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
              Description
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add details, requirements, or notes..."
              rows={4}
              className={`w-full px-4 py-2.5 text-sm border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40 resize-none`}
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-5">
            {/* Priority */}
            <div>
              <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRIORITIES).map(([k, p]) => (
                  <button
                    key={k}
                    onClick={() => setPriority(k)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-2 ${
                      priority === k
                        ? 'border-current shadow-md scale-105'
                        : `border-transparent ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80'}`
                    }`}
                    style={priority === k ? { color: p.color, backgroundColor: p.color + '15' } : {}}
                  >
                    <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
                Status
              </label>
              <SearchableDropdown
                options={Object.entries(STATUSES).map(([k, s]) => ({ value: k, label: s.label }))}
                value={taskStatus}
                onChange={setTaskStatus}
                placeholder="Status"
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* Due Date & Folder */}
          <div className="grid grid-cols-2 gap-5">
            {/* Due Date */}
            <div>
              <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2 flex items-center gap-1.5`}>
                <Calendar size={12} className="text-almet-sapphire" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border ${brd} rounded-lg ${bgCard} ${txt} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40`}
              />
            </div>

            {/* Folder */}
            <div>
              <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
                Folder
              </label>
              <SearchableDropdown
                options={folders.map(f => ({ value: f.id, label: f.name }))}
                value={folderId}
                onChange={setFolderId}
                placeholder="Select folder..."
                darkMode={darkMode}
                allowUncheck
              />
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2 flex items-center gap-1.5`}>
              <Users size={12} className="text-almet-sapphire" />
              Assign To
            </label>
            <EmployeeMultiSelect
              selectedEmployees={assignees}
              onChange={handleAssigneesChange}
              placeholder="Select team members..."
              multiple
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${brd} flex items-center justify-end gap-3 ${bgAccent}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium ${txt} rounded-lg border ${brd} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!title.trim() || saving}
            className="px-5 py-2 text-sm font-semibold bg-almet-sapphire text-white rounded-lg hover:bg-almet-sapphire/90 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4B5563 #1F2937' : '#d1d5db #f9fafb'};
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1F2937' : '#f9fafb'};
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#6B7280' : '#d1d5db'};
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #30539b;
        }
      `}</style>
    </div>
  );
}