// components/task-management/components/TeamModal.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import EmployeeMultiSelect from './EmployeeSelector';
import taskService from '@/services/taskService';
import { useToast } from '@/components/common/Toast';

export default function TeamModal({ team, onClose, onSuccess, darkMode }) {
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState(team?.name || '');
  const [desc, setDesc] = useState(team?.description || '');
  const [emoji, setEmoji] = useState(team?.emoji || '👥');
  const [color, setColor] = useState(team?.color || '#30539b');
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const bgAccent = darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-500' : 'text-gray-400';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const colors = ['#30539b', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  useEffect(() => {
    if (team) {
      const loadMembers = async () => {
        const r = await taskService.getTeamMembers(team.id);
        if (r.success) setMembers(r.data || []);
      };
      loadMembers();
    }
  }, [team?.id]);

  const handleMembersChange = useCallback((v) => setMembers(v), []);

  const save = async () => {
    if (!name.trim()) {
      showError('Team name required');
      return;
    }

    setSaving(true);
    const data = {
      name: name.trim(),
      description: desc.trim(),
      emoji,
      color,
      member_ids: members.map(m => m.id)
    };

    const r = team 
      ? await taskService.updateTeam(team.id, data) 
      : await taskService.createTeam(data);

    setSaving(false);

    if (r.success) {
      showSuccess(team ? 'Team updated' : 'Team created');
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
        className={`${bgCard} rounded-2xl shadow-2xl w-full max-w-2xl border ${brd}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${brd} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: color + '20' }}
            >
              {emoji}
            </div>
            <div>
              <h2 className={`text-base font-bold ${txt}`}>
                {team ? 'Edit Team' : 'Create New Team'}
              </h2>
              <p className={`text-xs ${txtMut}`}>Organize your work with teams</p>
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
          {/* Team Name */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Development Team"
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
              placeholder="What is this team about?"
              rows={3}
              className={`w-full px-4 py-2.5 text-sm border ${brd} rounded-lg ${bgCard} ${txt} placeholder:${txtMut} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40 resize-none`}
            />
          </div>

          {/* Color */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
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

          {/* Team Members */}
          <div>
            <label className={`block text-xs font-bold ${txtMut} uppercase tracking-wider mb-2`}>
              Team Members
            </label>
            <EmployeeMultiSelect
              selectedEmployees={members}
              onChange={handleMembersChange}
              placeholder="Add team members..."
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
            disabled={!name.trim() || saving}
            className="px-5 py-2 text-sm font-semibold bg-almet-sapphire text-white rounded-lg hover:bg-almet-sapphire/90 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {saving ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
}