// components/task-management/components/TaskModal.jsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle2, ListTodo, Calendar, Users, Repeat, Paperclip, FileText, Trash2, Sparkles, Loader2 } from 'lucide-react';
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

  // AI Smart Fill
  const [aiSuggestion, setAiSuggestion] = useState(null);  // { priority, due_date, reason }
  const [aiLoading, setAiLoading]       = useState(false);
  const smartFillTimer = useRef(null);

  // Trigger smart fill 800ms after user stops typing in title (only for new tasks, min 5 chars)
  useEffect(() => {
    if (task) return; // only for new tasks
    if (title.trim().length < 5) { setAiSuggestion(null); return; }
    clearTimeout(smartFillTimer.current);
    smartFillTimer.current = setTimeout(async () => {
      setAiLoading(true);
      const r = await taskService.aiSmartFill(title.trim(), desc.trim());
      setAiLoading(false);
      if (r.success && r.data) setAiSuggestion(r.data);
    }, 800);
    return () => clearTimeout(smartFillTimer.current);
  }, [title]);   // eslint-disable-line react-hooks/exhaustive-deps

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.priority) setPriority(aiSuggestion.priority);
    if (aiSuggestion.due_date) setDueDate(aiSuggestion.due_date);
    setAiSuggestion(null);
  };

  // Recurring — maps to backend field `recurrence` ('NONE'|'DAILY'|'WEEKLY'|'MONTHLY')
  const [recurring, setRecurring] = useState(task?.recurrence && task?.recurrence !== 'NONE');
  const [recurringFreq, setRecurringFreq] = useState(
    task?.recurrence && task?.recurrence !== 'NONE' ? task?.recurrence : 'WEEKLY'
  );

  // Attachments (new files only — existing attachments shown in detail drawer)
  const [attachments, setAttachments] = useState([]);
  const attachInputRef = useRef(null);

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

    const baseData = {
      title: title.trim(),
      description: desc.trim(),
      priority,
      status: taskStatus,
      due_date: dueDate || null,
      assigned_to: assignees.map(a => a.id),
      team: selectedTeam.id,
      folder: folderId,
      recurrence: recurring ? recurringFreq : 'NONE',
    };

    const r = task
      ? await taskService.updateTask(task.id, baseData)
      : await taskService.createTask(baseData);

    // Upload attachments separately after task is saved
    if (r.success && attachments.length > 0) {
      const taskId = r.data?.id || task?.id;
      for (const file of attachments) {
        await taskService.uploadAttachment(taskId, file);
      }
    }

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
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2 flex items-center gap-1.5`}>
              Task Title <span className="text-red-500">*</span>
              {!task && aiLoading && (
                <span className="flex items-center gap-1 text-violet-400 font-normal normal-case">
                  <Loader2 size={10} className="animate-spin" />
                  <span className="text-[10px]">AI analiz edir...</span>
                </span>
              )}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={`w-full px-4 py-2.5 text-sm font-medium border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40`}
            />

            {/* AI Suggestion chip */}
            {!task && aiSuggestion && !aiLoading && (
              <div className={`mt-2 flex items-center gap-2 flex-wrap p-2.5 rounded-xl border ${
                darkMode ? 'bg-violet-900/20 border-violet-700/40' : 'bg-violet-50 border-violet-200'
              }`}>
                <Sparkles size={12} className="text-violet-500 shrink-0" />
                <span className={`text-[11px] font-semibold ${darkMode ? 'text-violet-300' : 'text-violet-700'}`}>
                  AI suggests:
                </span>
                {aiSuggestion.priority && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    aiSuggestion.priority === 'URGENT' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    aiSuggestion.priority === 'HIGH'   ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                    aiSuggestion.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {{ URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }[aiSuggestion.priority]}
                  </span>
                )}
                {aiSuggestion.due_date && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    📅 {aiSuggestion.due_date}
                  </span>
                )}
                {aiSuggestion.reason && (
                  <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-1 truncate`}>
                    — {aiSuggestion.reason}
                  </span>
                )}
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="ml-auto px-2.5 py-1 text-[10px] font-bold rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-colors shrink-0"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setAiSuggestion(null)}
                  className={`p-0.5 rounded ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <X size={11} />
                </button>
              </div>
            )}
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

          {/* Recurring */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2 flex items-center gap-1.5`}>
              <Repeat size={12} className="text-almet-sapphire" />
              Recurring Task
            </label>
            <div className={`flex items-center gap-4 p-3 rounded-xl border ${brd} ${bgAccent}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRecurring(v => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${recurring ? 'bg-almet-sapphire' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${recurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-xs font-medium ${txt}`}>Repeat this task</span>
              </label>
              {recurring && (
                <div className="flex items-center gap-2 ml-auto">
                  {['DAILY','WEEKLY','MONTHLY'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setRecurringFreq(f)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                        recurringFreq === f
                          ? 'border-almet-sapphire bg-almet-sapphire/10 text-almet-sapphire'
                          : darkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2 flex items-center gap-1.5`}>
              <Paperclip size={12} className="text-almet-sapphire" />
              Attachments
            </label>
            <input
              ref={attachInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files || []);
                setAttachments(prev => [...prev, ...files]);
                e.target.value = '';
              }}
            />
            {attachments.length > 0 && (
              <div className={`mb-2 space-y-1.5`}>
                {attachments.map((file, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${brd} ${bgAccent}`}>
                    <FileText size={13} className="text-almet-sapphire shrink-0" />
                    <span className={`text-xs flex-1 truncate ${txt}`}>{file.name}</span>
                    <span className={`text-[10px] ${txtMut} shrink-0`}>
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => attachInputRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl border-2 border-dashed transition-all ${
                darkMode
                  ? 'border-gray-600 text-gray-400 hover:border-almet-sapphire/50 hover:text-almet-sapphire/70'
                  : 'border-gray-200 text-gray-400 hover:border-almet-sapphire/50 hover:text-almet-sapphire/70'
              }`}
            >
              <Paperclip size={14} />
              {attachments.length > 0 ? 'Add more files' : 'Attach files'}
            </button>
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