"use client";
import { useState, useEffect } from "react";
import { bonusYearService } from "@/services/bonusService";
import { performanceYearService } from "@/services/performanceService";
import { Plus, Lock, Unlock, CheckCircle, Calendar, AlertCircle } from "lucide-react";

import { useToast } from "@/components/common/Toast";

export default function BonusYearTab({ dark, years, onRefresh }) {
  const { showSuccess, showError } = useToast();

  const [perfYears, setPerfYears] = useState([]);
  const [loadingPerf, setLoadingPerf] = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ performance_year: "", is_active: true, base_currency: "AZN" });
  const [saving, setSaving]       = useState(false);
  const [locking, setLocking]     = useState(null);
  const [error, setError]         = useState("");

  const text  = dark ? "text-white"        : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]"    : "text-almet-comet";
  const muted = dark ? "text-gray-600"     : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/60"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  useEffect(() => {
    setLoadingPerf(true);
    performanceYearService.list().then((res) => {
      const list = res?.results ?? res ?? [];
      const usedIds = new Set(years.map((y) => y.performance_year));
      setPerfYears(list.filter((y) => !usedIds.has(y.id)));
    }).finally(() => setLoadingPerf(false));
  }, [years]);

  const handleCreate = async () => {
    if (!form.performance_year) return setError("Please select a performance year.");
    setError("");
    setSaving(true);
    try {
      await bonusYearService.create(form);
      setShowForm(false);
      setForm({ performance_year: "", is_active: true, base_currency: "AZN" });
      onRefresh();
      showSuccess("Bonus year created successfully.");
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      setError(msg);
      showError("Failed to create bonus year.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockToggle = async (y) => {
    setLocking(y.id);
    try {
      if (y.is_locked) {
        await bonusYearService.unlock(y.id);
        showSuccess(`${y.year} unlocked.`);
      } else {
        if (!confirm(`Lock ${y.year}? No more edits will be allowed.`)) return;
        await bonusYearService.lock(y.id);
        showSuccess(`${y.year} locked.`);
      }
      onRefresh();
    } catch {
      showError("Failed to update lock status.");
    } finally {
      setLocking(null);
    }
  };

  const handleSetActive = async (y) => {
    if (y.is_active) return;
    try {
      await bonusYearService.update(y.id, { is_active: true });
      onRefresh();
      showSuccess(`${y.year} set as active year.`);
    } catch {
      showError("Failed to set active year.");
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className={`text-base font-bold tracking-tight ${text}`}>Bonus Years</h2>
          <p className={`text-xs mt-1 ${sub}`}>
            Link a performance year to create a bonus calculation period. Only one year can be active.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition-all shadow-lg shadow-almet-sapphire/25 hover:shadow-almet-sapphire/40 hover:-translate-y-0.5"
        >
          <Plus size={15} />
          New Bonus Year
        </button>
      </div>

      {/* ── Year Cards ── */}
      <div className="space-y-3">
        {years.length === 0 && (
          <div className={`text-center py-20 rounded-2xl border-2 border-dashed
            ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
            <Calendar size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No bonus years yet</p>
            <p className="text-xs mt-1 opacity-70">Click "New Bonus Year" to get started</p>
          </div>
        )}

        {years.map((y) => (
          <div
            key={y.id}
            className={`flex items-center gap-5 p-4 rounded-2xl border transition-all
              ${y.is_active
                ? dark
                  ? "bg-almet-sapphire/10 border-almet-sapphire/25 shadow-lg shadow-almet-sapphire/5"
                  : "bg-almet-mystic border-almet-sapphire/30 shadow-md shadow-almet-sapphire/5"
                : dark
                  ? "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
          >
            {/* Year icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base
              ${y.is_active
                ? "bg-almet-sapphire text-white shadow-lg shadow-almet-sapphire/30"
                : dark ? "bg-white/[0.05] text-gray-500" : "bg-gray-200 text-gray-400"
              }`}>
              {String(y.year).slice(-2)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-base font-black ${text}`}>{y.year}</span>
                {y.is_active && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                )}
                {y.is_locked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    <Lock size={8} />
                    Locked
                  </span>
                )}
              </div>
              {y.base_currency && (
                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold
                  ${dark ? "bg-almet-sapphire/10 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
                  Base: {y.base_currency}
                </span>
              )}
              {y.locked_at && (
                <p className={`text-xs mt-0.5 ${muted}`}>
                  Locked {new Date(y.locked_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!y.is_active && (
                <button
                  onClick={() => handleSetActive(y)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${dark
                      ? "border-white/[0.08] text-gray-400 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5"
                      : "border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                >
                  <CheckCircle size={12} />
                  Set Active
                </button>
              )}
              <button
                onClick={() => handleLockToggle(y)}
                disabled={locking === y.id}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40
                  ${y.is_locked
                    ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20"
                    : dark
                      ? "border border-white/[0.08] text-gray-400 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5"
                      : "border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"
                  }`}
              >
                {y.is_locked
                  ? <><Unlock size={12} /> Unlock</>
                  : <><Lock size={12} /> Lock</>
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1117] border-white/[0.08]" : "bg-white border-gray-200"}`}>

            <div className={`px-6 pt-6 pb-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-almet-sapphire/20 flex items-center justify-center">
                  <Calendar size={14} className="text-almet-steel-blue" />
                </div>
                <h3 className={`text-base font-bold ${text}`}>Create Bonus Year</h3>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={`text-xs font-semibold block mb-2 ${sub}`}>Performance Year</label>
                {loadingPerf ? (
                  <div className={`w-full px-4 py-2.5 rounded-xl border text-sm ${dark ? "border-white/[0.08] bg-[#0b0e16] text-gray-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                    Loading years…
                  </div>
                ) : (
                  <select
                    value={form.performance_year}
                    onChange={(e) => setForm({ ...form, performance_year: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`}
                  >
                    <option value="">— Select year —</option>
                    {perfYears.map((py) => (
                      <option key={py.id} value={py.id}>{py.year}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Base currency */}
              <div>
                <label className={`text-xs font-semibold block mb-2 ${sub}`}>Base Currency</label>
                <select
                  value={form.base_currency}
                  onChange={(e) => setForm({ ...form, base_currency: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`}
                >
                  {["AZN", "USD", "EUR", "GBP", "TRY", "RUB"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? "bg-almet-sapphire" : dark ? "bg-white/10" : "bg-gray-200"}`}>
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{ left: form.is_active ? "calc(100% - 22px)" : "2px" }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium ${sub}`}>Set as active year</span>
              </label>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertCircle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-400">{error}</p>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-2 px-6 pb-6`}>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
                  ${dark ? "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || loadingPerf}
                className="px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-almet-sapphire/20"
              >
                {saving ? "Creating…" : "Create Year"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}