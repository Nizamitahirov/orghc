'use client';
import React from 'react';
import {
  Edit2, Trash2, Save, X, Crown, FolderOpen,
  ChevronRight, ChevronDown, Plus, Tag, Layers3
} from 'lucide-react';

// ─── Shared helpers ──────────────────────────────────────────────────────────

const InlineEditInput = ({ value, onChange, onSave, onCancel, busy, multiline = false }) => (
  <div className="flex items-center gap-1.5 flex-1 min-w-0">
    {multiline ? (
      <textarea
        value={value}
        onChange={onChange}
        autoFocus
        rows={2}
        className="flex-1 px-2 py-1 rounded-lg border text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
      />
    ) : (
      <input
        value={value}
        onChange={onChange}
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
        className="flex-1 px-2 py-1 rounded-lg border text-sm font-medium bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    )}
    <button onClick={onSave} disabled={busy}
      className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 hover:bg-green-100 transition flex-shrink-0">
      <Save size={13} />
    </button>
    <button onClick={onCancel}
      className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 transition flex-shrink-0">
      <X size={13} />
    </button>
  </div>
);

const EmptyState = ({ title, subtitle, darkMode }) => (
  <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${
    darkMode ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-gray-50/50'
  }`}>
    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
      <Layers3 className="w-6 h-6 text-blue-500 dark:text-blue-400" />
    </div>
    <p className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{title}</p>
    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>
  </div>
);

// ─── Shared row action buttons ────────────────────────────────────────────────
const RowActions = ({ onEdit, onDelete, busy, size = 14 }) => (
  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
    <button onClick={onEdit}
      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
      <Edit2 size={size} />
    </button>
    <button onClick={onDelete} disabled={busy}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition disabled:opacity-40">
      <Trash2 size={size} />
    </button>
  </div>
);

// ─── CardView (Skills + Behavioral) ─────────────────────────────────────────

export const CardView = ({
  filteredData, expandedCard, toggleExpand,
  beginEditItem, beginEditGroup,
  deleteItem, deleteGroup,
  editKey, editValue, setEditValue, saveEdit, cancelEdit,
  busy, setShowAddItem, setNewItem, darkMode,
  accentColor = '#30539b', // override per type
}) => {
  const card  = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const text  = darkMode ? 'text-gray-100' : 'text-gray-900';
  const dim   = darkMode ? 'text-gray-400' : 'text-gray-500';
  const hover = darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50';

  const groups = Object.keys(filteredData);

  if (groups.length === 0) {
    return <EmptyState title="No results found" subtitle="Clear your filters or add a new group." darkMode={darkMode} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {groups.map(groupName => {
        const items = filteredData[groupName] || [];
        const isOpen = expandedCard === groupName;
        const isEditingGroup = editKey === `group-${groupName}`;

        // show first 3 as preview; rest on expand
        const previewItems = items.slice(0, 3);
        const hiddenCount  = items.length - previewItems.length;

        return (
          <div key={groupName}
            className={`border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${card}`}
            style={{ borderTopWidth: 3, borderTopColor: accentColor }}
          >
            {/* Group header */}
            <div className={`px-4 py-3 flex items-center gap-2 ${hover}`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: `${accentColor}18` }}>
                <Tag size={14} style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                {isEditingGroup ? (
                  <InlineEditInput
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    busy={busy}
                  />
                ) : (
                  <>
                    <h3 className={`text-sm font-bold ${text} truncate`}>{groupName}</h3>
                    <p className={`text-xs ${dim}`}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
                  </>
                )}
              </div>
              {!isEditingGroup && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => beginEditGroup(null, groupName)}
                    className={`p-1.5 rounded-lg ${dim} hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition`}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteGroup(groupName)} disabled={busy}
                    className={`p-1.5 rounded-lg ${dim} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Preview items (always visible) */}
            <div className={`px-3 pb-2 space-y-1 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
              {previewItems.map((item, idx) => {
                const itemKey = `${groupName}-${idx}`;
                const isEditingItem = editKey === itemKey;
                return (
                  <div key={item.id || idx}
                    className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl ${hover} transition`}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                    {isEditingItem ? (
                      <InlineEditInput
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        busy={busy}
                      />
                    ) : (
                      <>
                        <span className={`flex-1 text-xs ${text} truncate`}>{item.name || item}</span>
                        <RowActions
                          onEdit={() => beginEditItem(groupName, idx, item)}
                          onDelete={() => deleteItem(item.id, item.name || item)}
                          busy={busy}
                          size={12}
                        />
                      </>
                    )}
                  </div>
                );
              })}

              {/* Expanded items */}
              {isOpen && items.slice(3).map((item, idx) => {
                const realIdx = idx + 3;
                const itemKey = `${groupName}-${realIdx}`;
                const isEditingItem = editKey === itemKey;
                return (
                  <div key={item.id || realIdx}
                    className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl ${hover} transition`}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                    {isEditingItem ? (
                      <InlineEditInput
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        busy={busy}
                      />
                    ) : (
                      <>
                        <span className={`flex-1 text-xs ${text} truncate`}>{item.name || item}</span>
                        <RowActions
                          onEdit={() => beginEditItem(groupName, realIdx, item)}
                          onDelete={() => deleteItem(item.id, item.name || item)}
                          busy={busy}
                          size={12}
                        />
                      </>
                    )}
                  </div>
                );
              })}

              {items.length === 0 && (
                <p className={`text-center text-xs ${dim} py-2`}>No items yet</p>
              )}
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between px-4 py-2 border-t ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              {hiddenCount > 0 ? (
                <button onClick={() => toggleExpand(groupName)}
                  className={`flex items-center gap-1 text-xs font-medium ${dim} hover:text-blue-600 transition`}>
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  {isOpen ? 'Show less' : `${hiddenCount} more`}
                </button>
              ) : <span />}
              <button
                onClick={() => { setShowAddItem(true); setNewItem({ main_group: groupName, child_group: '', name: '' }); }}
                className="flex items-center gap-1 text-xs font-semibold transition"
                style={{ color: accentColor }}>
                <Plus size={12} /> Add item
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── TableView (Skills + Behavioral) ─────────────────────────────────────────

export const TableView = ({
  filteredData, beginEditItem, deleteItem,
  editKey, editValue, setEditValue, saveEdit, cancelEdit,
  busy, darkMode, accentColor = '#30539b',
}) => {
  const card   = darkMode ? 'bg-slate-800' : 'bg-white';
  const border  = darkMode ? 'border-slate-700' : 'border-gray-200';
  const theadBg = darkMode ? 'bg-slate-700/50' : 'bg-gray-50';
  const text   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const dim    = darkMode ? 'text-gray-400' : 'text-gray-500';

  const groups = Object.keys(filteredData);
  if (groups.length === 0) {
    return <EmptyState title="No results found" subtitle="Clear your filters or add a new group." darkMode={darkMode} />;
  }

  return (
    <div className="space-y-4">
      {groups.map(groupName => {
        const items = filteredData[groupName] || [];
        return (
          <div key={groupName} className={`${card} border ${border} rounded-2xl overflow-hidden shadow-sm`}
               style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}>
            <div className={`${theadBg} px-4 py-2.5 flex items-center justify-between border-b ${border}`}>
              <div className="flex items-center gap-2">
                <Tag size={13} style={{ color: accentColor }} />
                <span className={`text-sm font-bold ${text}`}>{groupName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${accentColor}18`, color: accentColor }}>
                  {items.length}
                </span>
              </div>
            </div>
            <table className="w-full">
              <thead className={`${theadBg} border-b ${border}`}>
                <tr>
                  <th className={`px-4 py-2 text-left text-xs font-semibold ${dim} uppercase tracking-wide`}>#</th>
                  <th className={`px-4 py-2 text-left text-xs font-semibold ${dim} uppercase tracking-wide`}>Name</th>
                  <th className={`px-4 py-2 text-left text-xs font-semibold ${dim} uppercase tracking-wide`}>Added</th>
                  <th className={`px-4 py-2 text-right text-xs font-semibold ${dim} uppercase tracking-wide`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {items.length === 0 && (
                  <tr><td colSpan={4} className={`px-4 py-6 text-center text-xs ${dim} italic`}>No items yet</td></tr>
                )}
                {items.map((item, idx) => {
                  const isEditing = editKey === `${groupName}-${idx}`;
                  return (
                    <tr key={item.id || idx}
                        className={`group transition ${darkMode ? 'hover:bg-slate-700/40' : 'hover:bg-blue-50/30'}`}>
                      <td className={`px-4 py-2.5 text-xs ${dim} w-10`}>{idx + 1}</td>
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <InlineEditInput
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            busy={busy}
                          />
                        ) : (
                          <span className={`text-sm ${text}`}>{item.name || item}</span>
                        )}
                      </td>
                      <td className={`px-4 py-2.5 text-xs ${dim}`}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        {!isEditing && (
                          <div className="flex items-center justify-end">
                            <RowActions
                              onEdit={() => beginEditItem(groupName, idx, item)}
                              onDelete={() => deleteItem(item.id, item.name || item)}
                              busy={busy}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

// ─── LeadershipCardView ───────────────────────────────────────────────────────

export const LeadershipCardView = ({
  filteredData, expandedCard, toggleExpand,
  expandedChildGroups, toggleChildGroup,
  editKey, editValue, setEditValue,
  beginEditGroup, beginEditChildGroup, beginEditLeadershipItem,
  deleteGroup, deleteChildGroup, deleteItem,
  saveEdit, cancelEdit, busy,
  setShowAddChildGroup, setNewChildGroup,
  setShowAddItem, setNewItem,
  darkMode,
}) => {
  const ACCENT = '#d97706'; // amber for leadership
  const card   = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const subtle = darkMode ? 'bg-slate-700/50' : 'bg-amber-50/40';
  const text   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const dim    = darkMode ? 'text-gray-400' : 'text-gray-500';
  const divider = darkMode ? 'border-slate-700' : 'border-amber-100';

  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    return <EmptyState title="No leadership competencies found" subtitle="Add a main group to get started." darkMode={darkMode} />;
  }

  return (
    <div className="space-y-4">
      {filteredData.map(mg => {
        const isMainOpen = expandedCard === mg.id;
        const isEditingMain = editKey === `group-${mg.id}`;
        const totalItems = mg.childGroups.reduce((a, cg) => a + cg.items.length, 0);

        return (
          <div key={mg.id}
            className={`border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${card}`}
            style={{ borderTopWidth: 3, borderTopColor: ACCENT }}>
            {/* Main group header */}
            <div className={`px-4 py-3.5 flex items-center gap-3 ${subtle}`}>
              <button onClick={() => toggleExpand(mg.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition flex-shrink-0"
                style={{ background: isMainOpen ? ACCENT : `${ACCENT}20`, color: isMainOpen ? 'white' : ACCENT }}>
                {isMainOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              <Crown size={16} style={{ color: ACCENT }} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {isEditingMain ? (
                  <InlineEditInput
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    busy={busy}
                  />
                ) : (
                  <>
                    <h3 className={`text-sm font-bold ${text}`}>{mg.name}</h3>
                    <p className={`text-xs ${dim}`}>
                      {mg.childGroups.length} sub-group{mg.childGroups.length !== 1 ? 's' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''}
                    </p>
                  </>
                )}
              </div>
              {!isEditingMain && (
                <div className="flex items-center gap-1">
                  <button onClick={() => { setShowAddChildGroup(true); setNewChildGroup({ main_group: mg.id.toString(), name: '' }); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition"
                    style={{ background: `${ACCENT}15`, color: ACCENT }}>
                    <Plus size={12} /> Sub-group
                  </button>
                  <button onClick={() => beginEditGroup(mg.id, mg.name)}
                    className={`p-1.5 rounded-lg ${dim} hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition`}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteGroup(mg.name, mg.id)} disabled={busy}
                    className={`p-1.5 rounded-lg ${dim} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Child groups */}
            {isMainOpen && (
              <div className={`p-3 space-y-2 border-t ${divider}`}>
                {mg.childGroups.length === 0 ? (
                  <div className={`rounded-xl px-4 py-6 text-center text-xs ${dim} border border-dashed ${darkMode ? 'border-slate-600' : 'border-amber-200'}`}>
                    No sub-groups yet.
                    <button onClick={() => { setShowAddChildGroup(true); setNewChildGroup({ main_group: mg.id.toString(), name: '' }); }}
                      className="ml-2 font-semibold" style={{ color: ACCENT }}>Add one →</button>
                  </div>
                ) : (
                  mg.childGroups.map(cg => {
                    const isChildOpen = expandedChildGroups[`${mg.id}-${cg.id}`];
                    const isEditingChild = editKey === `childgroup-${mg.id}-${cg.id}`;
                    return (
                      <div key={cg.id} className={`rounded-xl border overflow-hidden ${darkMode ? 'border-slate-600 bg-slate-700/40' : 'border-amber-100 bg-amber-50/30'}`}>
                        <div className="px-3 py-2.5 flex items-center gap-2">
                          <button onClick={() => toggleChildGroup(mg.id, cg.id)}
                            className={`p-1 rounded-lg transition text-amber-600 dark:text-amber-400 ${isChildOpen ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-amber-100 dark:hover:bg-amber-900/30'}`}>
                            {isChildOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          </button>
                          <FolderOpen size={13} style={{ color: ACCENT }} className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {isEditingChild ? (
                              <InlineEditInput
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onSave={saveEdit}
                                onCancel={cancelEdit}
                                busy={busy}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold ${text}`}>{cg.name}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-slate-600 text-gray-300' : 'bg-amber-100 text-amber-700'}`}>
                                  {cg.items.length}
                                </span>
                              </div>
                            )}
                          </div>
                          {!isEditingChild && (
                            <div className="flex items-center gap-0.5">
                              <button onClick={() => { setShowAddItem(true); setNewItem({ main_group: mg.id.toString(), child_group: cg.id.toString(), name: '' }); }}
                                className={`p-1.5 rounded-lg transition`} style={{ color: ACCENT }}
                                title="Add item">
                                <Plus size={12} />
                              </button>
                              <button onClick={() => beginEditChildGroup(mg.id, cg.id, cg.name)}
                                className={`p-1.5 rounded-lg ${dim} hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition`}>
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => deleteChildGroup(cg.id, cg.name)} disabled={busy}
                                className={`p-1.5 rounded-lg ${dim} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition`}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>

                        {isChildOpen && (
                          <div className={`px-3 pb-2 pt-1 space-y-1 border-t ${divider}`}>
                            {cg.items.length === 0 ? (
                              <p className={`text-xs text-center ${dim} py-2`}>No items yet</p>
                            ) : (
                              cg.items.map(item => {
                                const isEditingItem = editKey === `item-${mg.id}-${cg.id}-${item.id}`;
                                return (
                                  <div key={item.id}
                                    className={`group flex items-start gap-2 px-2.5 py-1.5 rounded-lg transition ${darkMode ? 'hover:bg-slate-600/50' : 'hover:bg-amber-50'}`}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-400" />
                                    {isEditingItem ? (
                                      <InlineEditInput
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        onSave={saveEdit}
                                        onCancel={cancelEdit}
                                        busy={busy}
                                        multiline={item.name?.length > 80}
                                      />
                                    ) : (
                                      <>
                                        <span className={`flex-1 text-xs ${text} leading-relaxed`}>{item.name}</span>
                                        <RowActions
                                          onEdit={() => beginEditLeadershipItem(mg.id, cg.id, item.id, item.name)}
                                          onDelete={() => deleteItem(item.id, item.name, cg.id)}
                                          busy={busy}
                                          size={12}
                                        />
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── LeadershipTableView ──────────────────────────────────────────────────────

export const LeadershipTableView = ({
  filteredData, beginEditGroup, beginEditChildGroup, beginEditLeadershipItem,
  deleteGroup, deleteChildGroup, deleteItem,
  editKey, editValue, setEditValue, saveEdit, cancelEdit,
  busy, darkMode,
}) => {
  const ACCENT = '#d97706';
  const card   = darkMode ? 'bg-slate-800' : 'bg-white';
  const border = darkMode ? 'border-slate-700' : 'border-gray-200';
  const thead  = darkMode ? 'bg-slate-700/60' : 'bg-amber-50';
  const text   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const dim    = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    return <EmptyState title="No results found" subtitle="Clear your filters or add a new main group." darkMode={darkMode} />;
  }

  return (
    <div className="space-y-4">
      {filteredData.map(mg => (
        <div key={mg.id} className={`${card} border ${border} rounded-2xl overflow-hidden shadow-sm`}
             style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}>
          {/* Main group header */}
          <div className={`${thead} px-4 py-2.5 flex items-center justify-between border-b ${border}`}>
            <div className="flex items-center gap-2">
              <Crown size={14} style={{ color: ACCENT }} />
              <span className={`text-sm font-bold ${text}`}>{mg.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${ACCENT}20`, color: ACCENT }}>
                {mg.childGroups.reduce((a, cg) => a + cg.items.length, 0)} total items
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => beginEditGroup(mg.id, mg.name)}
                className={`p-1.5 rounded-lg ${dim} hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition`}>
                <Edit2 size={13} />
              </button>
              <button onClick={() => deleteGroup(mg.name, mg.id)} disabled={busy}
                className={`p-1.5 rounded-lg ${dim} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition`}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${thead} border-b ${border}`}>
                <tr>
                  <th className={`px-4 py-2 text-left text-xs font-semibold ${dim} uppercase tracking-wide w-48`}>Sub-group</th>
                  <th className={`px-4 py-2 text-left text-xs font-semibold ${dim} uppercase tracking-wide`}>Item</th>
                  <th className={`px-4 py-2 text-left text-xs font-semibold ${dim} uppercase tracking-wide w-28`}>Added</th>
                  <th className={`px-4 py-2 text-right text-xs font-semibold ${dim} uppercase tracking-wide w-24`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {mg.childGroups.map(cg =>
                  cg.items.length === 0 ? (
                    <tr key={`${cg.id}-empty`} className={`${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-amber-50/30'} transition`}>
                      <td className={`px-4 py-2.5 text-xs font-semibold ${text}`}>{cg.name}</td>
                      <td colSpan={2} className={`px-4 py-2.5 text-xs ${dim} italic`}>No items</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end">
                          <RowActions
                            onEdit={() => beginEditChildGroup(mg.id, cg.id, cg.name)}
                            onDelete={() => deleteChildGroup(cg.id, cg.name)}
                            busy={busy}
                            size={13}
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cg.items.map((item, iIdx) => {
                      const isEditingItem = editKey === `item-${mg.id}-${cg.id}-${item.id}`;
                      return (
                        <tr key={item.id}
                            className={`group transition ${darkMode ? 'hover:bg-slate-700/40' : 'hover:bg-amber-50/30'}`}>
                          {iIdx === 0 && (
                            <td rowSpan={cg.items.length}
                                className={`px-4 py-2.5 text-xs font-semibold ${text} align-top border-r ${border} ${darkMode ? 'bg-slate-700/20' : 'bg-amber-50/40'}`}>
                              <div className="flex items-center justify-between gap-2 sticky top-0">
                                <div className="flex items-center gap-1.5">
                                  <FolderOpen size={12} style={{ color: ACCENT }} />
                                  {cg.name}
                                </div>
                                <RowActions
                                  onEdit={() => beginEditChildGroup(mg.id, cg.id, cg.name)}
                                  onDelete={() => deleteChildGroup(cg.id, cg.name)}
                                  busy={busy}
                                  size={12}
                                />
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-2.5">
                            {isEditingItem ? (
                              <InlineEditInput
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onSave={saveEdit}
                                onCancel={cancelEdit}
                                busy={busy}
                              />
                            ) : (
                              <span className={`text-xs ${text} leading-relaxed`}>{item.name}</span>
                            )}
                          </td>
                          <td className={`px-4 py-2.5 text-xs ${dim}`}>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            {!isEditingItem && (
                              <div className="flex items-center justify-end">
                                <RowActions
                                  onEdit={() => beginEditLeadershipItem(mg.id, cg.id, item.id, item.name)}
                                  onDelete={() => deleteItem(item.id, item.name, cg.id)}
                                  busy={busy}
                                  size={12}
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
