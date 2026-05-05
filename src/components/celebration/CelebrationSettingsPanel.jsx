"use client";
import { useState, useEffect } from 'react';
import { X, Plus, Save, Loader2, Mail, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import celebrationService from '@/services/celebrationService';

// ── Email siyahısı ────────────────────────────────────────────
function EmailList({ label, value, onChange, darkMode }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setInput('');
  };

  return (
    <div>
      <p className={`text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</p>
      <div className="flex gap-2 mb-2">
        <input
          type="email"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="email@almet.com"
          className={`flex-1 px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-almet-sapphire/50 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <button onClick={add} className="px-3 py-2 bg-almet-sapphire text-white text-xs rounded-lg hover:bg-almet-cloud-burst transition-all">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map(email => (
          <span key={email} className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${
            darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'
          }`}>
            <Mail className="w-2.5 h-2.5" />
            {email}
            <button onClick={() => onChange(value.filter(e => e !== email))} className="hover:text-red-500 transition-colors">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-xs text-gray-400 italic">No recipients added</span>}
      </div>
    </div>
  );
}

// ── BF kod siyahısı ───────────────────────────────────────────
function CodeList({ label, value, onChange, darkMode }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim().toUpperCase();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setInput('');
  };

  return (
    <div>
      <p className={`text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</p>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="e.g. HLD"
          className={`w-32 px-3 py-2 text-xs border rounded-lg outline-none uppercase focus:ring-1 focus:ring-almet-sapphire/50 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <button onClick={add} className="px-3 py-2 bg-almet-sapphire text-white text-xs rounded-lg hover:bg-almet-cloud-burst transition-all">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map(code => (
          <span key={code} className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
            darkMode ? 'bg-almet-sapphire/30 text-almet-astral' : 'bg-almet-sapphire/10 text-almet-sapphire'
          }`}>
            {code}
            <button onClick={() => onChange(value.filter(c => c !== code))} className="hover:text-red-500 transition-colors">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-xs text-gray-400 italic">No codes added</span>}
      </div>
    </div>
  );
}

// ── Ana komponent ─────────────────────────────────────────────
export default function CelebrationSettingsPanel({ show, onClose, darkMode, showSuccess, showError }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    holding_bonus_to:       [],
    holding_bonus_cc:       [],
    trading_bonus_to:       [],
    trading_bonus_cc:       [],
    holding_bf_codes:       [],
    trading_bf_codes:       [],
    is_bonus_email_enabled: true,
  });

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    celebrationService.getSettings()
      .then(data => setForm(data))
      .catch(() => showError?.('Failed to load settings'))
      .finally(() => setLoading(false));
  }, [show]);

  const save = async () => {
    setSaving(true);
    try {
      await celebrationService.updateSettings(form);
      showSuccess?.('Settings saved successfully');
      onClose();
    } catch {
      showError?.('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>Celebration Settings</h2>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Birthday bonus email alıcılarını idarə et</p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-almet-sapphire" />
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${
                darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Birthday Bonus Email</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ad günü olanda avtomatik bonus emaili göndər</p>
                </div>
                <button onClick={() => setForm(p => ({ ...p, is_bonus_email_enabled: !p.is_bonus_email_enabled }))}>
                  {form.is_bonus_email_enabled
                    ? <ToggleRight className="w-8 h-8 text-green-500" />
                    : <ToggleLeft  className="w-8 h-8 text-gray-400" />}
                </button>
              </div>

              {form.is_bonus_email_enabled && (
                <>
                  {/* Holding */}
                  <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`flex items-center gap-2 px-4 py-3 border-b ${
                      darkMode ? 'bg-almet-sapphire/20 border-gray-700' : 'bg-almet-sapphire/5 border-gray-200'
                    }`}>
                      <Building2 className="w-4 h-4 text-almet-sapphire" />
                      <span className={`text-xs font-bold ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`}>Holding</span>
                    </div>
                    <div className="p-4 space-y-4">
                      <CodeList
                        label="Business Function Codes"
                        value={form.holding_bf_codes}
                        onChange={v => setForm(p => ({ ...p, holding_bf_codes: v }))}
                        darkMode={darkMode}
                      />
                      <EmailList label="To" value={form.holding_bonus_to} onChange={v => setForm(p => ({ ...p, holding_bonus_to: v }))} darkMode={darkMode} />
                      <EmailList label="Cc" value={form.holding_bonus_cc} onChange={v => setForm(p => ({ ...p, holding_bonus_cc: v }))} darkMode={darkMode} />
                    </div>
                  </div>

                  {/* Trading */}
                  <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`flex items-center gap-2 px-4 py-3 border-b ${
                      darkMode ? 'bg-green-900/20 border-gray-700' : 'bg-green-50 border-gray-200'
                    }`}>
                      <Building2 className="w-4 h-4 text-green-600" />
                      <span className={`text-xs font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Trading</span>
                    </div>
                    <div className="p-4 space-y-4">
                      <CodeList
                        label="Business Function Codes"
                        value={form.trading_bf_codes}
                        onChange={v => setForm(p => ({ ...p, trading_bf_codes: v }))}
                        darkMode={darkMode}
                      />
                      <EmailList label="To" value={form.trading_bonus_to} onChange={v => setForm(p => ({ ...p, trading_bonus_to: v }))} darkMode={darkMode} />
                      <EmailList label="Cc" value={form.trading_bonus_cc} onChange={v => setForm(p => ({ ...p, trading_bonus_cc: v }))} darkMode={darkMode} />
                    </div>
                  </div>

                
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs rounded-lg border transition-all ${
              darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}