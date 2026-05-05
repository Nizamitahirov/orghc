// components/task-management/components/TaskManagement.jsx
'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Search, X, ChevronRight, Columns3, Table2, Filter, FolderKanban, Inbox, LayoutGrid, Layers, MoreHorizontal, Edit3, Trash2, FolderPlus, AlertTriangle, Sparkles, BarChart2 } from 'lucide-react';
import taskService from '@/services/taskService';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useToast } from '@/components/common/Toast';
import { useTheme } from '@/components/common/ThemeProvider';

import StatsBar from './StatsBar';
import BoardView from './BoardView';
import ListView from './ListView';
import TaskDetailDrawer from './TaskDetailDrawer';
import TeamModal from './TeamModal';
import FolderModal from './FolderModal';
import TaskModal from './TaskModal';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { PRIORITIES, STATUSES } from './constants';
import AITaskDispatcher from './AITaskDispatcher';
import AnalyticsView from './AnalyticsView';

// ─── Portal Dropdown ───
function PortalDropdown({ triggerRef, isOpen, onClose, items, darkMode }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const el = triggerRef.current;
      if (el && typeof el.getBoundingClientRect === 'function') {
        const rect = el.getBoundingClientRect();
        setPos({
          top: rect.bottom + 4,
          left: rect.left
        });
      }
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
          triggerRef?.current && !triggerRef.current.contains(e.target)) {
        onClose();
      }
    };
    // delay to avoid the same click that opened it
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';
  const txt = darkMode ? 'text-white' : 'text-gray-900';

  return createPortal(
    <div
      ref={dropdownRef}
      className={`fixed ${bgCard} border ${brd} rounded-lg shadow-2xl py-1 min-w-[140px] animate-in fade-in slide-in-from-top-1 duration-150`}
      style={{ top: pos.top, left: pos.left, zIndex: 99999 }}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => { item.onClick(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors text-left ${
            item.danger
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : `${txt} hover:bg-gray-100 dark:hover:bg-gray-700`
          }`}
        >
          {item.icon && <item.icon size={13} />}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}

export default function TaskManagement() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  const [teams, setTeams] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [accessInfo, setAccessInfo] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [showAIDispatcher, setShowAIDispatcher] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Dropdown state: { type: 'team'|'folder', id: string } or null
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownTriggerRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false, title: '', message: '', onConfirm: null, type: 'default', loading: false
  });

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const bgAccent = darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => { fetchTeams(); }, []);

  // ── Ctrl+K / Cmd+K → open AI Dispatcher ──────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (selectedTeam) setShowAIDispatcher(true);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      fetchFolders(selectedTeam.id);
      fetchTasks(selectedTeam.id);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      const timeout = setTimeout(() => fetchTasks(selectedTeam.id), 300);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, filterPriority, filterStatus, selectedFolder]);

  const fetchTeams = async () => {
    const r = await taskService.getTeams();
    if (r.success) {
      setTeams(r.data);
      if (r.accessInfo) setAccessInfo(r.accessInfo);
      if (r.data.length > 0 && !selectedTeam) setSelectedTeam(r.data[0]);
    }
  };

  const fetchFolders = async (teamId) => {
    const r = await taskService.getFolders({ team: teamId });
    if (r.success) setFolders(r.data);
  };

  const fetchTasks = async (teamId) => {
    setLoading(true);
    const filters = { team: teamId };
    if (filterPriority) filters.priority = filterPriority;
    if (filterStatus) filters.status = filterStatus;
    if (searchQuery) filters.search = searchQuery;
    if (selectedFolder && selectedFolder !== '__none__') filters.folder = selectedFolder;
    if (selectedFolder === '__none__') filters.no_folder = true;
    const r = await taskService.getTasks(filters);
    if (r.success) { setTasks(r.data); setTaskStats(r.statistics); }
    setLoading(false);
  };

  const openConfirm = (title, message, onConfirm, type = 'danger') => {
    setConfirmModal({ open: true, title, message, onConfirm, type, loading: false });
  };
  const closeConfirm = () => setConfirmModal({ ...confirmModal, open: false });

  const handleDeleteTeam = (team) => {
    openConfirm('Delete Team', `Delete "${team.name}"? All tasks and folders will be removed.`, async () => {
      setConfirmModal(p => ({ ...p, loading: true }));
      const r = await taskService.deleteTeam(team.id);
      setConfirmModal(p => ({ ...p, loading: false }));
      if (r.success) { showSuccess('Team deleted'); closeConfirm(); fetchTeams(); if (selectedTeam?.id === team.id) setSelectedTeam(null); }
      else { showError(r.error); closeConfirm(); }
    });
  };

  const handleDeleteFolder = (folder) => {
    openConfirm('Delete Folder', `Delete "${folder.name}"?`, async () => {
      setConfirmModal(p => ({ ...p, loading: true }));
      const r = await taskService.deleteFolder(folder.id);
      setConfirmModal(p => ({ ...p, loading: false }));
      if (r.success) { showSuccess('Folder deleted'); closeConfirm(); fetchFolders(selectedTeam.id); fetchTasks(selectedTeam.id); if (selectedFolder === folder.id) setSelectedFolder(null); }
      else { showError(r.error); closeConfirm(); }
    });
  };

  const handleDeleteTask = (task) => {
    openConfirm('Delete Task', `Delete "${task.title}"?`, async () => {
      setConfirmModal(p => ({ ...p, loading: true }));
      const r = await taskService.deleteTask(task.id);
      setConfirmModal(p => ({ ...p, loading: false }));
      if (r.success) { showSuccess('Task deleted'); closeConfirm(); if (selectedTeam) fetchTasks(selectedTeam.id); setDetailTask(null); }
      else { showError(r.error); closeConfirm(); }
    });
  };

  const folderTaskCounts = useMemo(() => {
    const c = { __all__: tasks.length, __none__: 0 };
    tasks.forEach(t => { const fId = t.folder?.id || t.folder; if (!fId) c.__none__++; else c[fId] = (c[fId] || 0) + 1; });
    return c;
  }, [tasks]);

  const folderName = selectedFolder === '__none__' ? 'Unorganized' : selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : 'All Tasks';
  const activeFilters = [filterPriority, filterStatus, filterDueDate, searchQuery].filter(Boolean).length;

  const [overdueDismissed, setOverdueDismissed] = useState(false);
  const overdueCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'COMPLETED').length;
  }, [tasks]);
  // Reset dismiss when team changes or tasks reload
  useEffect(() => { setOverdueDismissed(false); }, [selectedTeam]);

  const filteredTasks = useMemo(() => {
    if (!filterDueDate) return tasks;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    const monthEnd = new Date(now); monthEnd.setDate(now.getDate() + 30);
    const monthEndStr = monthEnd.toISOString().split('T')[0];
    return tasks.filter(t => {
      if (!t.due_date) return filterDueDate === 'no-date';
      if (filterDueDate === 'overdue') return t.due_date < todayStr && t.status !== 'COMPLETED';
      if (filterDueDate === 'today') return t.due_date === todayStr;
      if (filterDueDate === 'this-week') return t.due_date >= todayStr && t.due_date <= weekEndStr;
      if (filterDueDate === 'this-month') return t.due_date >= todayStr && t.due_date <= monthEndStr;
      return true;
    });
  }, [tasks, filterDueDate]);

  const handleTeamCreated = () => { fetchTeams(); setShowTeamModal(false); };
  const handleFolderCreated = () => { if (selectedTeam) { fetchFolders(selectedTeam.id); setShowFolderModal(false); } };
  const handleTaskCreated = () => { if (selectedTeam) { fetchTasks(selectedTeam.id); setShowTaskModal(false); setEditingTask(null); } };
  const handleTaskUpdated = () => { if (selectedTeam) fetchTasks(selectedTeam.id); };

  const handleDropdownToggle = useCallback((type, id, ref) => {
    dropdownTriggerRef.current = ref.current;
    setOpenDropdown(prev => {
      if (prev && prev.type === type && prev.id === id) return null;
      return { type, id };
    });
  }, []);

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);

  // Build dropdown items based on current openDropdown
  const dropdownItems = useMemo(() => {
    if (!openDropdown) return [];
    if (openDropdown.type === 'team') {
      const team = teams.find(t => t.id === openDropdown.id);
      if (!team) return [];
      return [
        { icon: Edit3, label: 'Edit Team', onClick: () => { setEditingTeam(team); setShowTeamModal(true); } },
        { icon: Trash2, label: 'Delete Team', danger: true, onClick: () => handleDeleteTeam(team) }
      ];
    }
    if (openDropdown.type === 'folder') {
      const folder = folders.find(f => f.id === openDropdown.id);
      if (!folder) return [];
      return [
        { icon: Edit3, label: 'Edit Folder', onClick: () => { setEditingFolder(folder); setShowFolderModal(true); } },
        { icon: Trash2, label: 'Delete Folder', danger: true, onClick: () => handleDeleteFolder(folder) }
      ];
    }
    return [];
  }, [openDropdown, teams, folders]);

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] rounded-lg ${bg} relative`}>
      {/* ─── Top Navigation Bar ─── */}
      <div className={`${bgCard} border-b ${brd} shrink-0`}>
        {/* Row 1: Team tabs */}
        <div className={`px-6 pt-3 pb-0 flex items-center gap-2 border-b ${brd}`}>
          <Layers size={14} className="text-almet-sapphire shrink-0" />
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {teams.map(team => {
              const isActive = selectedTeam?.id === team.id;
              return (
                <div key={team.id} className="relative group shrink-0 flex items-center">
                  <button
                    onClick={() => { setSelectedTeam(team); setSelectedFolder(null); }}
                    className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                      isActive
                        ? 'border-almet-sapphire text-almet-sapphire'
                        : `border-transparent ${txtMut} hover:text-almet-sapphire/70`
                    }`}
                  >
                    <span className="text-sm">{team.emoji || '👥'}</span>
                    {team.name}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-almet-sapphire/10 text-almet-sapphire' : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {team.member_count || 0}
                    </span>
                  </button>
                  <TeamMenuTrigger
                    teamId={team.id}
                    darkMode={darkMode}
                    txtMut={txtMut}
                    onToggle={handleDropdownToggle}
                    isOpen={openDropdown?.type === 'team' && openDropdown?.id === team.id}
                  />
                </div>
              );
            })}
          </div>
          {accessInfo?.can_create_teams !== false && (
            <button
              onClick={() => { setEditingTeam(null); setShowTeamModal(true); }}
              className="shrink-0 p-1.5 rounded-md bg-almet-sapphire/10 text-almet-sapphire hover:bg-almet-sapphire/20 transition-all"
              title="Create Team"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* Row 2: Folder pills + Search + Actions */}
        {selectedTeam && (
          <div className="px-6 py-3 flex items-center gap-3">
            {/* Folder pills */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFolder === null
                    ? 'bg-almet-sapphire text-white shadow-sm'
                    : `${bgAccent} ${txtMut} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                <Inbox size={13} />
                All
                <span className={`text-[10px] px-1 rounded-full ${selectedFolder === null ? 'bg-white/20' : ''}`}>
                  {folderTaskCounts.__all__}
                </span>
              </button>

              <button
                onClick={() => setSelectedFolder('__none__')}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFolder === '__none__'
                    ? 'bg-almet-sapphire text-white shadow-sm'
                    : `${bgAccent} ${txtMut} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                <LayoutGrid size={13} />
                Unorganized
                <span className={`text-[10px] px-1 rounded-full ${selectedFolder === '__none__' ? 'bg-white/20' : ''}`}>
                  {folderTaskCounts.__none__}
                </span>
              </button>

              {folders.length > 0 && <div className={`w-px h-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} shrink-0`} />}

              {folders.map(f => {
                const isActive = selectedFolder === f.id;
                const count = folderTaskCounts[f.id] || 0;
                return (
                  <div key={f.id} className="relative group shrink-0 flex items-center gap-0.5">
                    <button
                      onClick={() => setSelectedFolder(f.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-almet-sapphire text-white shadow-sm'
                          : `${bgAccent} ${txtMut} hover:bg-gray-200 dark:hover:bg-gray-700`
                      }`}
                    >
                      <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: f.color || '#30539b' }} />
                      <span className="max-w-[120px] truncate">{f.name}</span>
                      <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-white/20' : ''}`}>{count}</span>
                    </button>
                    <FolderMenuTrigger
                      folderId={f.id}
                      darkMode={darkMode}
                      txtMut={txtMut}
                      onToggle={handleDropdownToggle}
                      isOpen={openDropdown?.type === 'folder' && openDropdown?.id === f.id}
                    />
                  </div>
                );
              })}

              <button
                onClick={() => { setEditingFolder(null); setShowFolderModal(true); }}
                className={`shrink-0 p-1.5 rounded-md ${txtMut} hover:bg-gray-200 dark:hover:bg-gray-600 transition-all`}
                title="Create Folder"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            {/* Search */}
            <div className="relative w-56 shrink-0">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${txtMut}`} size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className={`w-full pl-8 pr-7 py-1.5 text-xs border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`absolute right-2 top-1/2 -translate-y-1/2 ${txtMut}`}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border ${brd} transition-all ${
                showFilters || activeFilters > 0
                  ? 'bg-almet-sapphire/10 border-almet-sapphire/30 text-almet-sapphire'
                  : `${bgCard} ${txtMut}`
              }`}
            >
              <Filter size={13} />
              Filters
              {activeFilters > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-almet-sapphire text-white">
                  {activeFilters}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className={`shrink-0 flex items-center p-0.5 ${bgAccent} rounded-lg border ${brd}`}>
              {[{ id: 'board', icon: Columns3 }, { id: 'list', icon: Table2 }].map(v => (
                <button
                  key={v.id}
                  onClick={() => { setView(v.id); setShowAnalytics(false); }}
                  className={`p-1.5 rounded-md transition-all ${view === v.id && !showAnalytics ? 'bg-almet-sapphire text-white shadow-sm' : txtMut}`}
                >
                  <v.icon size={14} />
                </button>
              ))}
              <button
                onClick={() => setShowAnalytics(a => !a)}
                className={`p-1.5 rounded-md transition-all ${showAnalytics ? 'bg-almet-sapphire text-white shadow-sm' : txtMut}`}
                title="Analytics"
              >
                <BarChart2 size={14} />
              </button>
            </div>

            {/* AI Dispatcher */}
            <button
              onClick={() => setShowAIDispatcher(true)}
              disabled={!selectedTeam}
              title="Create tasks with AI (Ctrl+K)"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-violet-600 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-sm"
            >
              <Sparkles size={14} />
              <span>AI</span>
              <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 rounded text-[9px] font-mono bg-white/20 border border-white/30 leading-none">⌘K</kbd>
            </button>

            {/* New Task */}
            <button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              disabled={!selectedTeam}
              className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-almet-sapphire text-white rounded-lg text-xs font-semibold hover:bg-almet-sapphire/90 disabled:opacity-40 transition-all shadow-sm"
            >
              <Plus size={14} />
              New Task
            </button>
          </div>
        )}

        {/* Filter row (collapsible) */}
        {showFilters && selectedTeam && (
          <div className={`px-6 pb-3 flex items-center gap-3 border-t ${brd} pt-3`}>
            <SearchableDropdown
              options={Object.entries(PRIORITIES).map(([k, p]) => ({ value: k, label: p.label }))}
              value={filterPriority}
              onChange={setFilterPriority}
              placeholder="Priority"
              darkMode={darkMode}
              allowUncheck
              className="w-36"
            />
            <SearchableDropdown
              options={Object.entries(STATUSES).map(([k, s]) => ({ value: k, label: s.label }))}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Status"
              darkMode={darkMode}
              allowUncheck
              className="w-36"
            />
            <SearchableDropdown
              options={[
                { value: 'overdue', label: 'Overdue' },
                { value: 'today', label: 'Due Today' },
                { value: 'this-week', label: 'This Week' },
                { value: 'this-month', label: 'This Month' },
                { value: 'no-date', label: 'No Due Date' },
              ]}
              value={filterDueDate}
              onChange={setFilterDueDate}
              placeholder="Due Date"
              darkMode={darkMode}
              allowUncheck
              className="w-36"
            />
            {(filterPriority || filterStatus || filterDueDate) && (
              <button
                onClick={() => { setFilterPriority(''); setFilterStatus(''); setFilterDueDate(''); }}
                className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1"
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {selectedTeam && taskStats && <StatsBar stats={taskStats} darkMode={darkMode} />}

      {/* ─── Main Content ─── */}
      <div className="flex-1 overflow-auto p-6">
        {!selectedTeam ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className={`w-20 h-20 rounded-2xl ${bgAccent} flex items-center justify-center mb-4`}>
              <Users size={40} className={txtMut} />
            </div>
            <h3 className={`text-lg font-bold ${txt} mb-2`}>Welcome to Task Management</h3>
            <p className={`text-sm ${txtMut} mb-6 text-center max-w-md`}>Create a team to start organizing your tasks</p>
            <button
              onClick={() => { setEditingTeam(null); setShowTeamModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-almet-sapphire text-white rounded-lg text-sm font-semibold hover:bg-almet-sapphire/90 shadow-md"
            >
              <Plus size={16} /> Create Your First Team
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="w-10 h-10 border-3 border-almet-sapphire/30 border-t-almet-sapphire rounded-full animate-spin mb-4" />
            <p className={`text-sm font-medium ${txtMut}`}>Loading tasks...</p>
          </div>
        ) : (
          <>
            {/* Analytics view */}
            {showAnalytics && (
              <AnalyticsView selectedTeam={selectedTeam} darkMode={darkMode} />
            )}

            {/* Normal board/list — hidden when analytics is open */}
            {!showAnalytics && <>
            {/* Overdue banner */}
            {overdueCount > 0 && !overdueDismissed && !loading && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300">
                <AlertTriangle size={16} className="shrink-0 text-red-500" />
                <p className="text-xs font-medium flex-1">
                  <span className="font-bold">{overdueCount} task{overdueCount > 1 ? 's are' : ' is'} overdue.</span>{' '}
                  Use the <span className="font-semibold">Due Date → Overdue</span> filter to review them.
                </p>
                <button
                  onClick={() => { setFilterDueDate('overdue'); setShowFilters(true); setOverdueDismissed(true); }}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-red-100 dark:bg-red-800/40 hover:bg-red-200 dark:hover:bg-red-700/40 rounded-lg transition-all"
                >
                  Show overdue
                </button>
                <button onClick={() => setOverdueDismissed(true)} className="shrink-0 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-all">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Active filters banner — "See all" shortcut */}
            {activeFilters > 0 && (
              <div className={`mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl border ${brd} ${bgAccent}`}>
                <Filter size={13} className="text-almet-sapphire shrink-0" />
                <p className={`text-xs font-medium flex-1 ${txt}`}>
                  Showing{' '}
                  <span className="font-bold text-almet-sapphire">{filteredTasks.length}</span>
                  {tasks.length !== filteredTasks.length && (
                    <> of <span className="font-bold">{tasks.length}</span></>
                  )}{' '}
                  tasks
                  {selectedFolder && selectedFolder !== '__none__' && (
                    <> in <span className="font-semibold">{folderName}</span></>
                  )}
                </p>
                <button
                  onClick={() => {
                    setFilterPriority('');
                    setFilterStatus('');
                    setFilterDueDate('');
                    setSearchQuery('');
                    setShowFilters(false);
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-lg bg-almet-sapphire/10 text-almet-sapphire hover:bg-almet-sapphire/20 transition-all"
                >
                  <X size={11} /> See all tasks
                </button>
              </div>
            )}

            {view === 'board' && (
              <BoardView
                tasks={filteredTasks}
                selectedTeam={selectedTeam}
                selectedFolder={selectedFolder}
                onTaskClick={setDetailTask}
                onTaskCreated={handleTaskUpdated}
                darkMode={darkMode}
              />
            )}
            {view === 'list' && (
              <ListView tasks={filteredTasks} onTaskClick={setDetailTask} darkMode={darkMode} />
            )}
            </>}
          </>
        )}
      </div>

      {/* ─── Portal Dropdown ─── */}
      <PortalDropdown
        triggerRef={dropdownTriggerRef}
        isOpen={!!openDropdown}
        onClose={closeDropdown}
        items={dropdownItems}
        darkMode={darkMode}
      />

      {/* ─── Modals ─── */}
      {detailTask && (
        <TaskDetailDrawer
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); setDetailTask(null); }}
          onDelete={handleDeleteTask}
          onTaskUpdated={handleTaskUpdated}
          darkMode={darkMode}
        />
      )}

      {showTeamModal && (
        <TeamModal
          team={editingTeam}
          onClose={() => { setShowTeamModal(false); setEditingTeam(null); }}
          onSuccess={handleTeamCreated}
          darkMode={darkMode}
        />
      )}

      {showFolderModal && (
        <FolderModal
          folder={editingFolder}
          selectedTeam={selectedTeam}
          onClose={() => { setShowFolderModal(false); setEditingFolder(null); }}
          onSuccess={handleFolderCreated}
          darkMode={darkMode}
        />
      )}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          selectedTeam={selectedTeam}
          selectedFolder={selectedFolder}
          folders={folders}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSuccess={handleTaskCreated}
          darkMode={darkMode}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={confirmModal.loading}
      />

      {showAIDispatcher && (
        <AITaskDispatcher
          selectedTeam={selectedTeam}
          onSuccess={() => { if (selectedTeam) fetchTasks(selectedTeam.id); }}
          onClose={() => setShowAIDispatcher(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

// ─── Trigger Components (hold their own ref) ───

function TeamMenuTrigger({ teamId, darkMode, txtMut, onToggle, isOpen }) {
  const ref = useRef(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle('team', teamId, ref);
      }}
      className={`p-1.5 rounded cursor-pointer ${txtMut} hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 ${isOpen ? '!opacity-100' : ''} transition-all`}
    >
      <MoreHorizontal size={13} />
    </button>
  );
}

function FolderMenuTrigger({ folderId, darkMode, txtMut, onToggle, isOpen }) {
  const ref = useRef(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle('folder', folderId, ref);
      }}
      className={`p-1 rounded cursor-pointer ${txtMut} hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 ${isOpen ? '!opacity-100' : ''} transition-all`}
    >
      <MoreHorizontal size={12} />
    </button>
  );
}