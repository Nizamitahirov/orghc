'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Sparkles, Send, Loader2, CheckCircle2,
  User, Calendar, Flag, Trash2, AlertCircle,
  ChevronDown, Search, AlertTriangle, Mic, MicOff,
  Globe,
} from 'lucide-react';
import taskService from '@/services/taskService';

// ─── Voice Languages ──────────────────────────────────────────────────────────
const VOICE_LANGS = [
  { code: 'az-AZ', label: 'AZ' },
  { code: 'ru-RU', label: 'RU' },
  { code: 'en-US', label: 'EN' },
];

// ─── Voice Input Hook ─────────────────────────────────────────────────────────
function useVoiceInput({ onTranscript, lang = 'az-AZ' }) {
  const [isListening, setIsListening]   = useState(false);
  const [supported,   setSupported]     = useState(false);
  const recognitionRef                  = useRef(null);
  const langRef                         = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    const SR = typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(!!SR);
  }, []);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = langRef.current;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interim = '';
      let final   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) onTranscript(final, true);
      else if (interim) onTranscript(interim, false);
    };

    rec.onerror  = () => { setIsListening(false); };
    rec.onend    = () => { setIsListening(false); };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [onTranscript]);

  
  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    isListening ? stop() : start();
  }, [isListening, start, stop]);

  return { isListening, supported, toggle, stop };
}

const PRIORITY_STYLES = {
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  HIGH:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  LOW:    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};
const PRIORITY_LABELS = { URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };
const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns how many employees share the same first name as the AI-matched
 * employee (assigned_to_name). Used to decide whether to show a dropdown.
 */
function findAmbiguousMatches(employees, assignedToName) {
  if (!assignedToName) return [];
  const firstName = assignedToName.trim().split(' ')[0].toLowerCase();
  return employees.filter(e =>
    e.full_name.toLowerCase().startsWith(firstName)
  );
}

// ─── Employee Dropdown (shown only when ambiguous) ───────────────────────────
// initialSearch: pre-fills search box so only matching names appear on open
function EmployeeSelect({ value, onChange, employees, darkMode, initialSearch = '' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const selected = employees.find(e => e.id === value) || null;

  // When closed, reset search to initialSearch so next open shows right list
  const handleOpen = () => {
    setSearch(initialSearch);
    setOpen(true);
  };

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const handle = (ev) => {
      if (ref.current && !ref.current.contains(ev.target)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [open]);

  const brd   = darkMode ? 'border-gray-600' : 'border-gray-200';
  const bg    = darkMode ? 'bg-gray-700'     : 'bg-white';
  const txt   = darkMode ? 'text-white'      : 'text-gray-900';
  const mut   = darkMode ? 'text-gray-400'   : 'text-gray-500';
  const hover = darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50';

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => open ? setOpen(false) : handleOpen()}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-[11px] font-medium text-orange-700 dark:text-orange-300 max-w-[220px]`}
        title="Multiple employees share this name — please select the right one"
      >
        <AlertTriangle size={11} className="shrink-0" />
        <span className="flex-1 text-left truncate">
          {selected ? selected.full_name : 'Who? Select...'}
        </span>
        <ChevronDown size={10} className="shrink-0" />
      </button>

      {open && (
        <div className={`absolute z-50 top-full left-0 mt-1 w-72 rounded-xl border ${brd} ${bg} shadow-2xl`}>
          {/* Search — pre-filled with the name */}
          <div className={`flex items-center gap-2 px-3 py-2 border-b ${brd}`}>
            <Search size={12} className={mut} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name..."
              className={`flex-1 text-xs ${bg} ${txt} outline-none`}
            />
            {search && (
              <button onClick={() => setSearch('')} className={`${mut} hover:text-gray-700`}>
                <X size={11} />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className={`text-xs ${mut} text-center py-4`}>No results</p>
            ) : (
              filtered.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => { onChange(emp.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${hover} ${emp.id === value ? 'bg-violet-50 dark:bg-violet-900/20' : ''}`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                    {emp.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${txt} truncate`}>{emp.full_name}</p>
                    <p className={`text-[10px] ${mut} truncate`}>
                      {[emp.position, emp.department].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {emp.id === value && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confirmed chip (no dropdown needed) ─────────────────────────────────────
function ConfirmedAssignee({ name, onClear, darkMode }) {
  const mut = darkMode ? 'text-gray-400' : 'text-gray-500';
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
      <User size={11} />
      {name}
      <button
        type="button"
        onClick={onClear}
        className={`ml-0.5 p-0.5 rounded hover:text-red-500 ${mut} transition-colors`}
        title="Remove assignee"
      >
        <X size={9} />
      </button>
    </span>
  );
}

// ─── Unassigned chip → opens full dropdown ────────────────────────────────────
function UnassignedSelect({ onChange, employees, darkMode }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const handle = (ev) => {
      if (ref.current && !ref.current.contains(ev.target)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [open]);

  const brd   = darkMode ? 'border-gray-600' : 'border-gray-200';
  const bg    = darkMode ? 'bg-gray-700'     : 'bg-white';
  const txt   = darkMode ? 'text-white'      : 'text-gray-900';
  const mut   = darkMode ? 'text-gray-400'   : 'text-gray-500';
  const hover = darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-dashed ${brd} ${mut} hover:border-gray-400 transition-colors`}
      >
        <User size={11} />
        Assign...
        <ChevronDown size={10} />
      </button>

      {open && (
        <div className={`absolute z-50 top-full left-0 mt-1 w-72 rounded-xl border ${brd} ${bg} shadow-2xl`}>
          <div className={`flex items-center gap-2 px-3 py-2 border-b ${brd}`}>
            <Search size={12} className={mut} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name..."
              className={`flex-1 text-xs ${bg} ${txt} outline-none`}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map(emp => (
              <button
                key={emp.id}
                onClick={() => { onChange(emp.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${hover}`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {emp.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${txt} truncate`}>{emp.full_name}</p>
                  <p className={`text-[10px] ${mut} truncate`}>
                    {[emp.position, emp.department].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Priority Select ──────────────────────────────────────────────────────────
function PrioritySelect({ value, onChange, darkMode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const brd = darkMode ? 'border-gray-600' : 'border-gray-200';
  const bg  = darkMode ? 'bg-gray-700'     : 'bg-white';
  const hover = darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50';

  useEffect(() => {
    if (!open) return;
    const handle = (ev) => { if (ref.current && !ref.current.contains(ev.target)) setOpen(false); };
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[value] || PRIORITY_STYLES.MEDIUM}`}
      >
        <Flag size={9} />
        {PRIORITY_LABELS[value] || value}
        <ChevronDown size={9} />
      </button>
      {open && (
        <div className={`absolute z-50 top-full left-0 mt-1 w-28 rounded-xl border ${brd} ${bg} shadow-xl py-1`}>
          {PRIORITIES.map(p => (
            <button
              key={p}
              onClick={() => { onChange(p); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${hover}`}
            >
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_STYLES[p]}`}>
                {PRIORITY_LABELS[p]}
              </span>
              {p === value && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AITaskDispatcher({ selectedTeam, onSuccess, onClose, darkMode }) {
  const [text, setText]           = useState('');
  const [parsedTasks, setParsedTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [step, setStep]           = useState('input');   // input | preview | done
  const [parsing, setParsing]     = useState(false);
  const [creating, setCreating]   = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [error, setError]         = useState('');
  const [voiceLang, setVoiceLang] = useState('az-AZ');
  const [showLangMenu, setShowLangMenu] = useState(false);
  // interim = text shown while still speaking (grayed out)
  const interimRef    = useRef('');
  const textRef       = useRef(text);
  textRef.current     = text;
  const langMenuRef   = useRef(null);

  const bg     = darkMode ? 'bg-gray-900' : 'bg-white';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const txt    = darkMode ? 'text-white'  : 'text-gray-900';
  const txtMut = darkMode ? 'text-gray-400' : 'text-gray-500';
  const brd    = darkMode ? 'border-gray-700' : 'border-gray-200';

  // Close lang menu on outside click
  useEffect(() => {
    if (!showLangMenu) return;
    const handle = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setShowLangMenu(false);
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [showLangMenu]);

  // Voice transcript handler
  const handleVoiceTranscript = useCallback((transcript, isFinal) => {
    if (isFinal) {
      // Append final text (with space if needed)
      const base = textRef.current;
      const sep = base && !base.endsWith('\n') && !base.endsWith(' ') ? ' ' : '';
      setText(base + sep + transcript.trim());
      interimRef.current = '';
    }
  
  }, []);

  const { isListening, supported, toggle: toggleVoice } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    lang: voiceLang,
  });

  // ── Parse ──
  const handleParse = async () => {
    if (!text.trim()) return;
    setError('');
    setParsing(true);
    const r = await taskService.aiParseTasks(text.trim());
    setParsing(false);

    if (!r.success) { setError(r.error); return; }
    if (!r.data?.length) { setError('No tasks could be extracted from the text.'); return; }

    const empList = r.employees || [];
    setEmployees(empList);

    // For each task, decide if assignee is ambiguous
    setParsedTasks(r.data.map(t => {
      const matches = findAmbiguousMatches(empList, t.assigned_to_name);
      return {
        title:          t.title,
        description:    t.description || '',
        assigned_to_id: t.assigned_to_id || null,
        assigned_to_name: t.assigned_to_name || null,
        priority:       t.priority || 'MEDIUM',
        due_date:       t.due_date || '',
        // ambiguous = AI found a name match but 2+ people share that first name
        ambiguous: matches.length > 1,
      };
    }));

    setStep('preview');
  };

  const updateTask = (idx, field, value) => {
    setParsedTasks(prev => prev.map((t, i) => {
      if (i !== idx) return t;
      const updated = { ...t, [field]: value };
      // Once user manually picks assignee, mark as resolved
      if (field === 'assigned_to_id') updated.ambiguous = false;
      return updated;
    }));
  };

  const removeTask = (idx) => setParsedTasks(prev => prev.filter((_, i) => i !== idx));

  // ── Create ──
  const handleCreate = async () => {
    if (!selectedTeam || !parsedTasks.length) return;
    setCreating(true);
    setError('');
    const r = await taskService.aiCreateTasks(selectedTeam.id, parsedTasks);
    setCreating(false);
    if (!r.success) { setError(r.error); return; }
    setCreatedCount(r.count);
    setStep('done');
    if (onSuccess) onSuccess();
  };

  const hasAmbiguous = parsedTasks.some(t => t.ambiguous && !t.assigned_to_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${bg} border ${brd} flex flex-col `}>

        {/* Header */}
        <div className={`flex items-center gap-3 px-6 py-4 border-b ${brd} shrink-0`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-sm font-bold ${txt}`}>AI Task Dispatcher</h2>
            <p className={`text-xs ${txtMut}`}>
              {step === 'input'   && 'Type a message — AI will extract tasks automatically'}
              {step === 'preview' && `${parsedTasks.length} task${parsedTasks.length !== 1 ? 's' : ''} found — review before creating`}
              {step === 'done'    && `${createdCount} task${createdCount !== 1 ? 's' : ''} created successfully`}
            </p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${txtMut} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-4">

          {/* ── INPUT ── */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Textarea wrapper with mic overlay */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={isListening
                    ? '🎙️ Speak now... text will be added automatically'
                    : 'Example:\n"Tell Elchin to prepare the sales report by tomorrow. Ask Narmin to update the client list by end of week, urgent."'}
                  rows={7}
                  className={`w-full px-4 py-3 pr-28 rounded-xl border ${
                    isListening
                      ? 'border-red-400 ring-2 ring-red-400/30'
                      : brd
                  } ${bgCard} ${txt} text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none transition-all`}
                />

                {/* Mic controls — bottom-right corner of textarea */}
                {supported && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    {/* Language selector */}
                    <div className="relative" ref={langMenuRef}>
                      <button
                        type="button"
                        onClick={() => setShowLangMenu(o => !o)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-1 rounded-md transition-colors ${
                          darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Select language"
                      >
                        <Globe size={9} />
                        {VOICE_LANGS.find(l => l.code === voiceLang)?.label}
                      </button>
                      {showLangMenu && (
                        <div className={`absolute bottom-full right-0 mb-1 rounded-xl border shadow-xl py-1 z-50 ${
                          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                          {VOICE_LANGS.map(l => (
                            <button
                              key={l.code}
                              onClick={() => { setVoiceLang(l.code); setShowLangMenu(false); }}
                              className={`w-full px-4 py-1.5 text-xs text-left flex items-center gap-2 transition-colors ${
                                l.code === voiceLang ? 'text-violet-500 font-semibold' : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                              }`}
                            >
                              {l.label}
                              {l.code === voiceLang && <span className="ml-auto text-[9px]">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mic button */}
                    <button
                      type="button"
                      onClick={toggleVoice}
                      title={isListening ? 'Stop recording' : 'Voice input'}
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all shadow-sm ${
                        isListening
                          ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-300 dark:shadow-red-900'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-violet-600 hover:text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-violet-100 hover:text-violet-600'
                      }`}
                    >
                      {isListening ? (
                        <>
                          {/* Pulsing ring when recording */}
                          <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-50" />
                          <MicOff size={14} className="relative z-10" />
                        </>
                      ) : (
                        <Mic size={14} />
                      )}
                    </button>
                  </div>
                )}

                {/* Recording status bar */}
                {isListening && (
                  <div className="absolute top-2 left-3 flex items-center gap-1.5 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-red-500 tracking-wide">
                      REC · {VOICE_LANGS.find(l => l.code === voiceLang)?.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Voice hint */}
              {supported && !isListening && !text && (
                <p className={`text-[11px] ${txtMut} flex items-center gap-1.5`}>
                  <Mic size={10} />
                  Press the mic button and speak — AI will transcribe
                </p>
              )}

              {selectedTeam && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgCard} border ${brd}`}>
                  <span className="text-sm">{selectedTeam.emoji || '👥'}</span>
                  <span className={`text-xs ${txtMut}`}>Tasks will be added to:</span>
                  <span className={`text-xs font-semibold ${txt}`}>{selectedTeam.name}</span>
                </div>
              )}
              {error && <ErrorBanner message={error} />}
            </div>
          )}

          {/* ── PREVIEW ── */}
          {step === 'preview' && (
            <div className="space-y-3">
              {/* Warning if ambiguous assignments remain */}
              {hasAmbiguous && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/40">
                  <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    <span className="font-semibold">Duplicate names detected.</span>{' '}
                    Use the orange buttons to select the correct person.
                  </p>
                </div>
              )}

              {parsedTasks.map((task, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border ${brd} ${bgCard} space-y-2.5`}>
                  {/* Title */}
                  <input
                    value={task.title}
                    onChange={e => updateTask(idx, 'title', e.target.value)}
                    className={`w-full text-sm font-semibold ${txt} bg-transparent outline-none border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-violet-400 transition-colors pb-0.5`}
                  />

                  {task.description && (
                    <p className={`text-xs ${txtMut} leading-relaxed`}>{task.description}</p>
                  )}

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2">

                    {/* ── Assignee logic ── */}
                    {task.ambiguous ? (
                      // Multiple people with same name → must pick
                      // initialSearch = first name so dropdown opens pre-filtered
                      <EmployeeSelect
                        value={task.assigned_to_id}
                        onChange={val => updateTask(idx, 'assigned_to_id', val)}
                        employees={employees}
                        darkMode={darkMode}
                        initialSearch={task.assigned_to_name?.trim().split(' ')[0] || ''}
                      />
                    ) : task.assigned_to_id ? (
                      // Unique match confirmed by AI → show chip
                      <ConfirmedAssignee
                        name={employees.find(e => e.id === task.assigned_to_id)?.full_name || task.assigned_to_name}
                        onClear={() => updateTask(idx, 'assigned_to_id', null)}
                        darkMode={darkMode}
                      />
                    ) : (
                      // No match at all → let user pick manually
                      <UnassignedSelect
                        onChange={val => updateTask(idx, 'assigned_to_id', val)}
                        employees={employees}
                        darkMode={darkMode}
                      />
                    )}

                    {/* Priority */}
                    <PrioritySelect
                      value={task.priority}
                      onChange={val => updateTask(idx, 'priority', val)}
                      darkMode={darkMode}
                    />

                    {/* Due date */}
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${brd} ${txtMut}`}>
                      <Calendar size={10} />
                      <input
                        type="date"
                        value={task.due_date || ''}
                        onChange={e => updateTask(idx, 'due_date', e.target.value)}
                        className={`bg-transparent outline-none text-[11px] ${txt} w-24`}
                      />
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => removeTask(idx)}
                      className={`ml-auto p-1.5 rounded-lg ${txtMut} hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {parsedTasks.length === 0 && (
                <p className={`text-center py-8 text-sm ${txtMut}`}>All tasks removed</p>
              )}

              {error && <ErrorBanner message={error} />}
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <div className="text-center">
                <p className={`text-base font-bold ${txt}`}>{createdCount} task{createdCount !== 1 ? 's' : ''} created!</p>
                <p className={`text-xs ${txtMut} mt-1`}>
                  Added to team <span className="font-semibold">{selectedTeam?.name}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between gap-3 px-6 py-4 border-t ${brd} shrink-0`}>
          {step === 'input' && (
            <>
              <button onClick={onClose} className={`px-4 py-2 text-xs font-medium rounded-lg border ${brd} ${txtMut} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}>
                Cancel
              </button>
              <button
                onClick={handleParse}
                disabled={!text.trim() || parsing}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
              >
                {parsing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {parsing ? 'Analysing...' : 'Analyse with AI'}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => { setStep('input'); setError(''); }}
                className={`px-4 py-2 text-xs font-medium rounded-lg border ${brd} ${txtMut} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!parsedTasks.length || creating || !selectedTeam}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {creating ? 'Creating...' : `Create ${parsedTasks.length} Task${parsedTasks.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}

          {step === 'done' && (
            <button
              onClick={onClose}
              className="ml-auto px-5 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-all"
            >
              Bağla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40">
      <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-xs text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
