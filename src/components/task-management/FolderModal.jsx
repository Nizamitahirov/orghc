// components/task-management/components/FolderModal.jsx
'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, FolderKanban } from 'lucide-react';
import taskService from '@/services/taskService';
import { useToast } from '@/components/common/Toast';

export default function FolderModal({ folder, selectedTeam, onClose, onSuccess, darkMode }) {
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState(folder?.name || '');
  const [desc, setDesc] = useState(folder?.description || '');
  const [color, setColor] = useState(folder?.color || '#30539b');
  const [saving, setSaving] = useState(false);

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const bgAccent = darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const colors = ['#30539b', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const save = async () => {
    if (!name.trim() || !selectedTeam) {
      showError('Folder name required');
      return;
    }

    setSaving(true);
    const data = {
      name: name.trim(),
      description: desc.trim(),
      color,
      team: selectedTeam.id
    };

    const r = folder 
      ? await taskService.updateFolder(folder.id, data) 
      : await taskService.createFolder(data);

    setSaving(false);

    if (r.success) {
      showSuccess(folder ? 'Folder updated' : 'Folder created');
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
        className={`${bgCard} rounded-2xl shadow-2xl w-full max-w-lg border ${brd}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${brd} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color + '20' }}
            >
              <FolderKanban size={20} style={{ color }} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${txt}`}>
                {folder ? 'Edit Folder' : 'Create Folder'}
              </h2>
              <p className={`text-xs ${txtMut}`}>Organize tasks in folders</p>
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
        <div className="p-6 space-y-5">
          {/* Folder Name */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
              Folder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Sprint 1, Q1 Tasks"
              className={`w-full px-4 py-2.5 text-sm border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40`}
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
              placeholder="What's this folder for?"
              rows={2}
              className={`w-full px-4 py-2.5 text-sm border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40 resize-none`}
            />
          </div>

          {/* Color */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
              Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-current scale-110 shadow-lg' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
            disabled={!name.trim() || saving}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40 transition-all flex items-center gap-2"
            style={{ backgroundColor: color }}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {saving ? 'Saving...' : folder ? 'Update Folder' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}