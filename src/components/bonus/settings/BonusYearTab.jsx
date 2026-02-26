"use client";
import { useState, useEffect } from "react";
import { bonusYearService } from "@/services/bonusService";
import { performanceYearService } from "@/services/performanceService";
import { Plus, Lock, Unlock, CheckCircle, Calendar } from "lucide-react";

export default function BonusYearTab({ dark, years, onRefresh }) {
  const [perfYears, setPerfYears]   = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ performance_year: "", is_active: true });
  const [saving, setSaving]         = useState(false);
  const [locking, setLocking]       = useState(null);
  const [error, setError]           = useState("");

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const card  = dark ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-gray-50 border-gray-200";
  const input = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white"
    : "bg-white border-gray-300 text-gray-900";

  useEffect(() => {
    performanceYearService.list().then((res) => {
      const list = res?.results ?? res ?? [];
      // Only show perf years that don't already have a bonus year
      const usedIds = new Set(years.map((y) => y.performance_year));
      setPerfYears(list.filter((y) => !usedIds.has(y.id)));
    });
  }, [years]);

  const handleCreate = async () => {
    if (!form.performance_year) return setError("Please select a performance year.");
    setError("");
    setSaving(true);
    try {
      await bonusYearService.create(form);
      setShowForm(false);
      setForm({ performance_year: "", is_active: true });
      onRefresh();
    } catch (e) {
      setError(e.response?.data ? JSON.stringify(e.response.data) : e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLockToggle = async (y) => {
    setLocking(y.id);
    try {
      if (y.is_locked) {
        await bonusYearService.unlock(y.id);
      } else {
        if (!confirm(`Lock ${y.year}? No more edits will be allowed.`)) return;
        await bonusYearService.lock(y.id);
      }
      onRefresh();
    } finally {
      setLocking(null);
    }
  };

  const handleSetActive = async (y) => {
    if (y.is_active) return;
    await bonusYearService.update(y.id, { is_active: true });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`text-base font-semibold ${text}`}>Bonus Years</h2>
          <p className={`text-sm mt-0.5 ${sub}`}>
            Each bonus year is linked to a performance year. Only one can be active at a time.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium transition"
        >
          <Plus size={14} /> New Bonus Year
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {years.length === 0 && (
          <div className={`text-center py-12 text-sm ${sub}`}>
            No bonus years yet. Click "New Bonus Year" to get started.
          </div>
        )}
        {years.map((y) => (
          <div key={y.id} className={`flex items-center gap-4 p-4 rounded-xl border ${card}`}>
            <div className={`p-2.5 rounded-lg ${dark ? "bg-almet-cloud-burst/30" : "bg-almet-mystic"}`}>
              <Calendar size={18} className="text-almet-steel-blue" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold ${text}`}>{y.year}</span>
                {y.is_active && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Active
                  </span>
                )}
                {y.is_locked && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                    🔒 Locked
                  </span>
                )}
              </div>
              {y.locked_at && (
                <p className={`text-xs mt-0.5 ${sub}`}>
                  Locked at: {new Date(y.locked_at).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Set Active */}
              {!y.is_active && (
                <button
                  onClick={() => handleSetActive(y)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition
                    ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white hover:border-green-500" : "border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600"}`}
                >
                  <CheckCircle size={12} /> Set Active
                </button>
              )}

              {/* Lock / Unlock */}
              <button
                onClick={() => handleLockToggle(y)}
                disabled={locking === y.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${y.is_locked
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : dark ? "bg-[#1a1a1a] text-gray-400 hover:text-orange-400" : "bg-gray-100 text-gray-600 hover:text-orange-500"
                  } disabled:opacity-50`}
              >
                {y.is_locked ? <><Unlock size={12} /> Unlock</> : <><Lock size={12} /> Lock</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl
            ${dark ? "bg-[#111] border-[#1f1f1f]" : "bg-white border-gray-200"}`}>
            <h3 className={`text-base font-semibold mb-4 ${text}`}>Create Bonus Year</h3>

            <div className="space-y-3">
              <div>
                <label className={`text-xs font-medium block mb-1 ${sub}`}>Performance Year</label>
                <select
                  value={form.performance_year}
                  onChange={(e) => setForm({ ...form, performance_year: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${input}`}
                >
                  <option value="">— Select year —</option>
                  {perfYears.map((py) => (
                    <option key={py.id} value={py.id}>{py.year}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-almet-sapphire"
                />
                <span className={`text-sm ${sub}`}>Set as active year</span>
              </label>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className={`px-4 py-2 rounded-lg border text-sm transition
                  ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white" : "border-gray-300 text-gray-600"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium disabled:opacity-50 transition"
              >
                {saving ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}