// ═══════════════════════════════════════════════════════
// src/components/si/settings/SIPeriodsTab.jsx
// ═══════════════════════════════════════════════════════
"use client";
import { useState, useEffect } from "react";
import { siPeriodService } from "@/services/siService";
import { useToast } from "@/components/common/Toast";
import { Plus, Lock, Unlock, Play, Trash2, Calendar } from "lucide-react";

const STATUS_COLORS = {
  DRAFT:      { bg: d => d ? "bg-slate-800 text-slate-400"        : "bg-slate-100 text-slate-600"      },
  CALCULATED: { bg: d => d ? "bg-blue-500/15 text-blue-400"       : "bg-blue-50 text-blue-600"         },
  APPROVED:   { bg: d => d ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"   },
  PAID:       { bg: d => d ? "bg-violet-500/15 text-violet-400"   : "bg-violet-50 text-violet-600"     },
};

export default function SIPeriodsTab({ dark, config, onOpenCalc }) {
  const { showSuccess, showError } = useToast();
  const [periods,  setPeriods]  = useState([]);
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(null); // period id for init/lock

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const load = () =>
    siPeriodService.list(config.id)
      .then(({ data }) => setPeriods(Array.isArray(data) ? data : (data.results ?? [])));

  useEffect(() => { load(); }, [config.id]);

  // Auto period_name from year + quarter
  const autoName = (year, quarter) => quarter ? `Q${quarter} ${year}` : String(year);

  const handleCreate = async () => {
    if (!form.year) return;
    setSaving(true);
    try {
      await siPeriodService.create({
        company_config: config.id,
        period_name: form.period_name || autoName(form.year, form.quarter),
        year:    Number(form.year),
        quarter: form.quarter ? Number(form.quarter) : null,
        month:   form.month   ? Number(form.month)   : null,
      });
      setForm(null);
      await load();
      showSuccess("Period created.");
    } catch (e) { showError(e.response?.data ? JSON.stringify(e.response.data) : "Failed."); }
    finally { setSaving(false); }
  };

  const handleInit = async (period) => {
    setLoading(period.id);
    try {
      const { data } = await siPeriodService.initialize(period.id);
      await load();
      showSuccess(`${data.created} employees added, ${data.skipped} skipped.`);
    } catch { showError("Failed to initialize."); }
    finally { setLoading(null); }
  };

  const handleLock = async (period) => {
    setLoading(period.id);
    try {
      if (period.is_locked) {
        await siPeriodService.unlock(period.id);
        showSuccess("Period unlocked.");
      } else {
        if (!confirm(`Lock "${period.period_name}"?`)) return;
        await siPeriodService.lock(period.id);
        showSuccess("Period locked.");
      }
      await load();
    } catch { showError("Failed."); }
    finally { setLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this period?")) return;
    try { await siPeriodService.delete(id); await load(); showSuccess("Deleted."); }
    catch { showError("Failed."); }
  };

  const cycle = config.evaluation_cycle;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${dark ? "bg-rose-500/10 border border-rose-500/20" : "bg-rose-50 border border-rose-200"}`}>
            <Calendar size={18} className="text-rose-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${text}`}>Periods</h2>
            <p className={`text-xs mt-1 ${sub}`}>
              {cycle} evaluation periods for {config.business_function_name}.
            </p>
          </div>
        </div>
        <button onClick={() => setForm({ year: new Date().getFullYear(), quarter: cycle === "QUARTERLY" ? 1 : null, month: null, period_name: "" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5">
          <Plus size={14} /> New Period
        </button>
      </div>

      <div className="space-y-3">
        {periods.length === 0 && (
          <div className={`text-center py-14 rounded-2xl border-2 border-dashed
            ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
            <Calendar size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No periods yet</p>
          </div>
        )}
        {periods.map(p => {
          const sc = STATUS_COLORS[p.status]?.bg(dark) || "";
          const isBusy = loading === p.id;
          return (
            <div key={p.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                ${dark ? "bg-[#0f0f0f] border-[#1e1e1e] hover:border-[#2a2a2a]"
                       : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"}`}>
              {/* Period name + status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`text-base font-bold ${text}`}>{p.period_name}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${sc}`}>{p.status}</span>
                  {p.is_locked && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      Locked
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${sub}`}>
                  {p.calc_count} employee{p.calc_count !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Initialize */}
                {!p.is_locked && (
                  <button onClick={() => handleInit(p)} disabled={isBusy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition disabled:opacity-50
                      ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white hover:border-almet-sapphire/40 hover:bg-almet-sapphire/8"
                             : "border-gray-200 text-gray-500 hover:bg-almet-mystic hover:text-almet-sapphire hover:border-almet-sapphire/30"}`}>
                    <Play size={11} /> {isBusy ? "…" : "Init"}
                  </button>
                )}
                {/* Open calculation */}
                <button onClick={() => onOpenCalc(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition shadow-sm">
                  Open →
                </button>
                {/* Lock */}
                <button onClick={() => handleLock(p)} disabled={isBusy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition disabled:opacity-50
                    ${p.is_locked
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25"
                      : dark ? "border-[#2a2a2a] text-gray-500 hover:text-amber-400 hover:border-amber-500/30"
                             : "border-gray-200 text-gray-400 hover:text-amber-600 hover:border-amber-300"}`}>
                  {p.is_locked ? <><Unlock size={11} /> Unlock</> : <><Lock size={11} /> Lock</>}
                </button>
                {/* Delete */}
                {p.status === "DRAFT" && (
                  <button onClick={() => handleDelete(p.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition
                      ${dark ? "text-gray-600 hover:text-rose-400 hover:bg-rose-500/10"
                             : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>
            <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <h3 className={`text-sm font-bold ${text}`}>New Period</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Year</label>
                <input type="number" value={form.year}
                  onChange={e => setForm(p => ({ ...p, year: e.target.value, period_name: autoName(e.target.value, p.quarter) }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
              </div>
              {cycle === "QUARTERLY" && (
                <div>
                  <label className={`text-xs font-semibold block mb-2 ${sub}`}>Quarter</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4].map(q => (
                      <button key={q} type="button"
                        onClick={() => setForm(p => ({ ...p, quarter: q, period_name: autoName(p.year, q) }))}
                        className={`py-2 rounded-xl border text-xs font-bold transition
                          ${form.quarter === q
                            ? "bg-almet-sapphire border-almet-sapphire text-white"
                            : dark ? "border-white/[0.08] text-gray-400 hover:border-white/20"
                                   : "border-gray-200 text-gray-600 hover:bg-almet-mystic"}`}>
                        Q{q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {cycle === "MONTHLY" && (
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Month (1-12)</label>
                  <input type="number" min={1} max={12} value={form.month ?? ""}
                    onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
                </div>
              )}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Period Name</label>
                <input type="text" value={form.period_name}
                  onChange={e => setForm(p => ({ ...p, period_name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6">
              <button onClick={() => setForm(null)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
                  ${dark ? "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05]"
                         : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-almet-sapphire/20">
                {saving ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


