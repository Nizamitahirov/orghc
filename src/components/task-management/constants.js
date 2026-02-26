// components/task-management/constants.js

import { Circle, Clock, Eye, CheckCircle2 } from 'lucide-react';

export const PRIORITIES = {
  LOW: {
    label: 'Low',
    color: '#10B981',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400'
  },
  MEDIUM: {
    label: 'Medium',
    color: '#F59E0B',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400'
  },
  HIGH: {
    label: 'High',
    color: '#F97316',
    dot: 'bg-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400'
  },
  URGENT: {
    label: 'Urgent',
    color: '#EF4444',
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400'
  }
};

export const STATUSES = {
  TODO: {
    label: 'To Do',
    color: '#6B7280',
    dot: 'bg-slate-400',
    icon: Circle
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#3B82F6',
    dot: 'bg-blue-500',
    icon: Clock
  },
  IN_REVIEW: {
    label: 'In Review',
    color: '#8B5CF6',
    dot: 'bg-violet-500',
    icon: Eye
  },
  COMPLETED: {
    label: 'Completed',
    color: '#10B981',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  }
};

// Helper functions
export const isOverdue = (date, status) => {
  return date && status !== 'COMPLETED' && new Date(date) < new Date();
};

export const formatDate = (d) => {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
};

export const formatDateTime = (d) => {
  return d ? new Date(d).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '—';
};

export const getAssignees = (task) => {
  if (!task) return [];
  const assignedData = task?.assigned_to_details || task?.assigned_to || [];
  return Array.isArray(assignedData) ? assignedData : [];
};