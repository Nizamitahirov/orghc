// ════════════════════════════════════════════════════════════════════════════
// ResignationSubmissionModal.jsx
// ════════════════════════════════════════════════════════════════════════════
'use client';
import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Send, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function  ResignationSubmissionModal({ onClose, onSuccess, currentEmployee }) {
  const [form, setForm]         = useState({ employee: currentEmployee?.id||'', last_working_day:'', employee_comments:'' });
  const [file, setFile]         = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { if (currentEmployee?.id) setForm(p=>({...p,employee:currentEmployee.id})); }, [currentEmployee]);

  const noticeDays = () => {
    if (!form.last_working_day) return null;
    const diff = Math.ceil((new Date(form.last_working_day) - new Date()) / 864e5);
    return diff >= 0 ? diff : null;
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5*1024*1024) { setError('File must be under 5 MB'); return; }
    const ok = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!ok.includes(f.type)) { setError('Only PDF or DOC/DOCX allowed'); return; }
    setFile(f); setError('');
  };

  const submit = async () => {
    if (!form.last_working_day) { setError('Please select your last working day'); return; }
    const diff = Math.ceil((new Date(form.last_working_day) - new Date()) / 864e5);
    if (diff < 0) { setError('Last working day cannot be in the past'); return; }
    try {
      setSaving(true); setError('');
      await resignationExitService.resignation.createResignation({ ...form, resignation_letter: file });
      onSuccess?.();
      onClose();
      alert('Resignation submitted. Your manager will be notified.');
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again.');
    } finally { setSaving(false); }
  };

  const nd = noticeDays();

  return (
    <ModalShell title="Submit Resignation" sub={`${currentEmployee?.full_name} · ${currentEmployee?.employee_id}`} onClose={onClose} accent="from-red-500 to-rose-600">
      <div className="space-y-4">
        {/* notice */}
        <InfoBox icon={AlertCircle} cls="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800" iconCls="text-blue-500">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">Before you submit</p>
          <ul className="text-[11px] text-blue-700 dark:text-blue-300 space-y-0.5 list-disc list-inside">
            <li>Your resignation will be sent to your line manager for approval</li>
            <li>You will receive email notifications about status changes</li>
          </ul>
        </InfoBox>

        {error && <p className="text-[11px] text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}

        {/* last day */}
        <div>
          <FieldLabel required>Last Working Day</FieldLabel>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="date" min={new Date().toISOString().split('T')[0]}
              value={form.last_working_day} onChange={e => setForm(p=>({...p,last_working_day:e.target.value}))}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-almet-sapphire"/>
          </div>
          {nd != null && (
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/> {nd} day notice period
            </p>
          )}
        </div>

        {/* comments */}
        <div>
          <FieldLabel>Additional Comments</FieldLabel>
          <textarea rows={4} value={form.employee_comments}
            onChange={e => setForm(p=>({...p,employee_comments:e.target.value}))}
            placeholder="Any additional information about your resignation…"
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-almet-sapphire resize-none"/>
        </div>

        {/* file */}
        <div>
          <FieldLabel>Attach Resignation Letter <span className="font-normal text-gray-400">(optional)</span></FieldLabel>
          {!file
            ? <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl py-8 cursor-pointer hover:border-almet-sapphire transition-colors">
                <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl"><Upload size={18} className="text-gray-400"/></div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Click to upload</p>
                  <p className="text-[11px] text-gray-400">PDF, DOC, DOCX · max 5 MB</p>
                </div>
                <input type="file" accept=".pdf,.doc,.docx" onChange={onFile} className="hidden"/>
              </label>
            : <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
                  <FileText size={15} className="text-almet-sapphire"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                  <p className="text-[11px] text-gray-400">{(file.size/1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <Trash2 size={13} className="text-gray-400"/>
                </button>
              </div>
          }
        </div>
      </div>

      <ModalFooter onClose={onClose} onConfirm={submit} saving={saving} disabled={!form.last_working_day} confirmLabel="Submit Resignation" confirmIcon={<Send size={13}/>} confirmCls="bg-red-500 hover:bg-red-600"/>
    </ModalShell>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// Shared sub-components
// ════════════════════════════════════════════════════════════════════════════
function ModalShell({ title, sub, onClose, children, accent = 'from-almet-sapphire to-almet-astral', wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className={`bg-gradient-to-r ${accent} px-5 py-4 text-white flex items-center justify-between shrink-0`}>
          <div>
            <h2 className="text-sm font-bold">{title}</h2>
            {sub && <p className="text-[11px] text-white/60 mt-0.5">{sub}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X size={15}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onConfirm, saving, disabled, confirmLabel='Confirm', confirmIcon, confirmCls='bg-almet-sapphire hover:bg-almet-astral', closeOnly=false }) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <button onClick={onClose} disabled={saving}
        className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">
        {closeOnly ? 'Close' : 'Cancel'}
      </button>
      {!closeOnly && (
        <button onClick={onConfirm} disabled={saving || disabled}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-50 transition-colors shadow-sm ${confirmCls}`}>
          {saving ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing…</> : <>{confirmIcon}{confirmLabel}</>}
        </button>
      )}
    </div>
  );
}




function InfoBox({ icon: Icon, cls, iconCls, children }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${cls}`}>
      <Icon size={15} className={`${iconCls} shrink-0 mt-0.5`}/>
      <div>{children}</div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-almet-sapphire' : 'bg-gray-200 dark:bg-gray-600'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`}/>
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

function StatusPillFull({ status }) {
  const MAP = {
    PENDING_MANAGER:'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PENDING_HR:'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED:'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    MANAGER_REJECTED:'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    HR_REJECTED:'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${MAP[status]||'bg-gray-100 text-gray-500'}`}>
      {resignationExitService.helpers.getStatusText(status)}
    </span>
  );
}