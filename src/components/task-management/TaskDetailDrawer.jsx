// components/task-management/components/TaskDetailDrawer.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Edit3, Trash2, PanelRightClose, ListTodo, Calendar,
  Users, FileText, MessageSquare, Activity, CheckCircle,
  Plus, Send, User, FolderKanban
} from 'lucide-react';
import EmployeeMultiSelect from './EmployeeSelector';
import taskService from '@/services/taskService';
import { useToast } from '@/components/common/Toast';
import { PRIORITIES, STATUSES, isOverdue, formatDate, formatDateTime } from './constants';

// Comment Input Component
function CommentInput({ taskId, onCommentAdded, darkMode }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useToast();

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const r = await taskService.addTaskComment(taskId, text.trim());
    setSending(false);
    if (r.success) {
      showSuccess('Comment added');
      setText('');
      if (onCommentAdded) onCommentAdded();
    } else {
      showError(r.error);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && text.trim()) handleSend();
        }}
        placeholder="Write a comment..."
        className={`flex-1 px-3 py-2 text-sm border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40`}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending}
        className="px-4 py-2 bg-almet-sapphire text-white rounded-lg text-sm font-semibold hover:bg-almet-sapphire/90 disabled:opacity-40 transition-all flex items-center gap-1.5"
      >
        {sending ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send size={14} />
        )}
      </button>
    </div>
  );
}

// Avatar Component
function Avatar({ name, imageUrl, size = 'sm' }) {
  const sizes = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-xs'
  };

  return imageUrl ? (
    <img
      src={imageUrl}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover border-2 border-white dark:border-gray-800 shrink-0`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center font-bold text-white border-2 border-white dark:border-gray-800 shrink-0`}
      title={name}
    >
      {name?.charAt(0) || '?'}
    </div>
  );
}

export default function TaskDetailDrawer({ task, onClose, onEdit, onDelete, onTaskUpdated, darkMode }) {
  const { showSuccess, showError } = useToast();
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [priorityDropdown, setPriorityDropdown] = useState(false);
  const [assigneeEdit, setAssigneeEdit] = useState(false);
  const [currentTask, setCurrentTask] = useState(task);

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const bgAccent = darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtSec = darkMode ? 'text-gray-400' : 'text-gray-500';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const overdue = isOverdue(currentTask.due_date, currentTask.status);

  // Parse assignees correctly
  const assignees = useMemo(() => {
    if (!currentTask) return [];
    const assignedData = currentTask.assigned_to_details || currentTask.assigned_to || [];
    return Array.isArray(assignedData) ? assignedData : [];
  }, [currentTask]);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  useEffect(() => {
    if (currentTask?.id) fetchDetails();
  }, [currentTask?.id]);

  const fetchDetails = async () => {
    setDetailLoading(true);
    const [cRes, aRes] = await Promise.all([
      taskService.getTaskComments(currentTask.id),
      taskService.getTaskActivities(currentTask.id)
    ]);
    if (cRes.success) setComments(cRes.data || []);
    if (aRes.success) setActivities(aRes.data || []);
    setDetailLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    const r = await taskService.updateTask(currentTask.id, { status: newStatus });
    if (r.success) {
      showSuccess('Status updated');
      setCurrentTask({ ...currentTask, status: newStatus });
      setStatusDropdown(false);
      fetchDetails();
      if (onTaskUpdated) onTaskUpdated();
    } else showError(r.error);
  };

  const handlePriorityChange = async (newPriority) => {
    const r = await taskService.updateTask(currentTask.id, { priority: newPriority });
    if (r.success) {
      showSuccess('Priority updated');
      setCurrentTask({ ...currentTask, priority: newPriority });
      setPriorityDropdown(false);
      fetchDetails();
      if (onTaskUpdated) onTaskUpdated();
    } else showError(r.error);
  };

  const handleAssigneeUpdate = async (newAssignees) => {
    const assigneeIds = newAssignees.map(a => a.id);
    const r = await taskService.updateTask(currentTask.id, { assigned_to: assigneeIds });
    if (r.success) {
      showSuccess('Assignees updated');
      setCurrentTask({
        ...currentTask,
        assigned_to_details: newAssignees,
        assigned_to: newAssignees
      });
      setAssigneeEdit(false);
      fetchDetails();
      if (onTaskUpdated) onTaskUpdated();
    } else showError(r.error);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-[480px] ${bgCard} border-l ${brd} shadow-2xl z-50 flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${brd} flex items-center justify-between shrink-0 ${bgAccent}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center">
              <ListTodo size={20} className="text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${txt}`}>Task Details</h2>
              <p className={`text-xs ${txtMut}`}>#{String(currentTask.id).slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(currentTask)}
              className={`p-2 rounded-lg ${txtSec} hover:bg-gray-100 dark:hover:bg-gray-700`}
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(currentTask)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${txtMut} hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <PanelRightClose size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          {/* Title + Status/Priority */}
          <div>
            <h3
              className={`text-lg font-bold ${txt} mb-3 leading-relaxed ${
                currentTask.status === 'COMPLETED' ? 'line-through opacity-60' : ''
              }`}
            >
              {currentTask.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status */}
              <div className="relative">
                <button
                  onClick={() => setStatusDropdown(!statusDropdown)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer hover:opacity-80"
                  style={{
                    color: STATUSES[currentTask.status]?.color,
                    backgroundColor: STATUSES[currentTask.status]?.color + '15'
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: STATUSES[currentTask.status]?.color }}
                  />
                  {STATUSES[currentTask.status]?.label}
                </button>
                {statusDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStatusDropdown(false)} />
                    <div
                      className={`absolute left-0 top-full mt-1 ${bgCard} border ${brd} rounded-lg shadow-lg py-1 z-20 min-w-[140px]`}
                    >
                      {Object.entries(STATUSES).map(([key, s]) => (
                        <button
                          key={key}
                          onClick={() => handleStatusChange(key)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${txt} hover:bg-gray-50 dark:hover:bg-gray-700 text-left`}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Priority */}
              <div className="relative">
                <button
                  onClick={() => setPriorityDropdown(!priorityDropdown)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer hover:opacity-80 ${
                    PRIORITIES[currentTask.priority]?.bg
                  } ${PRIORITIES[currentTask.priority]?.text}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${PRIORITIES[currentTask.priority]?.dot}`} />
                  {PRIORITIES[currentTask.priority]?.label}
                </button>
                {priorityDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setPriorityDropdown(false)} />
                    <div
                      className={`absolute left-0 top-full mt-1 ${bgCard} border ${brd} rounded-lg shadow-lg py-1 z-20 min-w-[120px]`}
                    >
                      {Object.entries(PRIORITIES).map(([key, p]) => (
                        <button
                          key={key}
                          onClick={() => handlePriorityChange(key)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${txt} hover:bg-gray-50 dark:hover:bg-gray-700 text-left`}
                        >
                          <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {(currentTask.folder_name || currentTask.folder?.name) && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${bgAccent} ${txtSec} font-medium`}
                >
                  <FolderKanban size={12} />
                  {currentTask.folder_name || currentTask.folder?.name}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {currentTask.description && (
            <div>
              <label
                className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2 flex items-center gap-1.5`}
              >
                <FileText size={12} className="text-almet-sapphire" />
                Description
              </label>
              <p className={`text-sm ${txtSec} leading-relaxed whitespace-pre-wrap p-4 rounded-lg ${bgAccent}`}>
                {currentTask.description}
              </p>
            </div>
          )}

          {/* Due Date */}
          {currentTask.due_date && (
            <div className={`p-4 rounded-xl ${bgAccent} border ${brd}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-almet-sapphire" />
                <span className={`text-xs font-bold ${txtMut} uppercase tracking-wider`}>Due Date</span>
              </div>
              <p className={`text-sm font-semibold ${overdue ? 'text-red-500' : txt}`}>
                {formatDate(currentTask.due_date)}
                {overdue && <span className="ml-2 text-xs font-normal">(Overdue)</span>}
              </p>
            </div>
          )}

          {/* Assignees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label
                className={`text-xs font-bold ${txtMut} uppercase tracking-wider flex items-center gap-1.5`}
              >
                <Users size={12} className="text-almet-sapphire" />
                Assigned To ({assignees.length})
              </label>
              <button
                onClick={() => setAssigneeEdit(!assigneeEdit)}
                className="text-xs font-medium text-almet-sapphire hover:text-almet-sapphire/80"
              >
                {assigneeEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {assigneeEdit ? (
              <EmployeeMultiSelect
                selectedEmployees={assignees}
                onChange={handleAssigneeUpdate}
                placeholder="Add assignees..."
                multiple
              />
            ) : (
              <div className="space-y-2">
                {assignees.length > 0 ? (
                  assignees.map(person => (
                    <div key={person.id} className={`flex items-center gap-3 p-3 rounded-xl ${bgAccent} border ${brd}`}>
                      <Avatar name={person.full_name || person.name} imageUrl={person.profile_image_url} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${txt} truncate`}>{person.full_name || person.name}</p>
                        {person.job_title && <p className={`text-xs ${txtMut} truncate`}>{person.job_title}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`p-4 rounded-xl ${bgAccent} border-2 border-dashed ${brd} text-center`}>
                    <p className={`text-xs ${txtMut}`}>No assignees yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className={`border-t ${brd} pt-5`}>
            <label
              className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-4 flex items-center gap-1.5`}
            >
              <MessageSquare size={12} className="text-almet-sapphire" />
              Comments ({comments.length})
            </label>
            <div className="mb-4">
              <CommentInput taskId={currentTask.id} onCommentAdded={fetchDetails} darkMode={darkMode} />
            </div>
            <div className="space-y-3">
              {detailLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-almet-sapphire/30 border-t-almet-sapphire rounded-full animate-spin mx-auto" />
                </div>
              ) : comments.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className={`p-3 rounded-lg ${bgAccent}`}>
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={c.author?.full_name || c.author?.name || 'User'}
                        imageUrl={c.author?.profile_image_url}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${txt}`}>
                            {c.author?.full_name || c.author?.name || 'Unknown'}
                          </span>
                          <span className={`text-[10px] ${txtMut}`}>{formatDateTime(c.created_at)}</span>
                        </div>
                        <p className={`text-sm ${txtSec} leading-relaxed`}>{c.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-6 rounded-xl ${bgAccent} border-2 border-dashed ${brd} text-center`}>
                  <MessageSquare size={24} className={`mx-auto ${txtMut} mb-2`} />
                  <p className={`text-xs ${txtMut}`}>No comments yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          {activities.length > 0 && (
            <div className={`border-t ${brd} pt-5`}>
              <label
                className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-3 flex items-center gap-1.5`}
              >
                <Activity size={12} className="text-almet-sapphire" />
                Activity Log
              </label>
              <div className="space-y-2">
                {activities.map((act, idx) => (
                  <div key={act.id || idx} className={`flex items-start gap-3 p-2 rounded-lg ${bgAccent}`}>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        act.type === 'STATUS_CHANGED'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {act.type === 'STATUS_CHANGED' && (
                        <CheckCircle size={12} className="text-blue-600 dark:text-blue-400" />
                      )}
                      {act.type === 'COMMENT_ADDED' && <MessageSquare size={12} className={txtMut} />}
                      {(act.type === 'ASSIGNED' || act.type === 'UNASSIGNED') && <User size={12} className={txtMut} />}
                      {act.type === 'CREATED' && <Plus size={12} className={txtMut} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${txtSec}`}>{act.description}</p>
                      <p className={`text-[10px] ${txtMut}`}>
                        {act.performed_by && <span className="font-medium">{act.performed_by} · </span>}
                        {formatDateTime(act.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    </>
  );
}