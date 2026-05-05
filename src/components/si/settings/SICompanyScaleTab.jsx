// ═══════════════════════════════════════════════════════════════
// src/components/si/settings/SICompanyScaleTab.jsx
// Şirkət KPI reytinq şkalası — variance → rating → bonus%
// ═══════════════════════════════════════════════════════════════
"use client";
import { useState, useEffect } from "react";
import { siCompanyScaleService } from "@/services/siService";
import { useToast } from "@/components/common/Toast";
import { Plus, Pencil, Trash2, BarChart2, Info } from "lucide-react";

const RATING_CODES = ["E-", "E", "E+", "E++"];

const RATING_STYLE = {
  "E-":  d => d ? "bg-rose-500/15 text-rose-400 border-rose-500/25"       : "bg-rose-50 text-rose-600 border-rose-200",
  "E":   d => d ? "bg-amber-500/15 text-amber-400 border-amber-500/25"    : "bg-amber-50 text-amber-600 border-amber-200",
  "E+":  d => d ? "bg-sky-500/15 text-sky-400 border-sky-500/25"          : "bg-sky-50 text-sky-600 border-sky-200",
  "E++": d => d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export default function SICompanyScaleTab({ dark, config }) {
  const { showSuccess, showError } = useToast();
  const [scales,  setScales]  = useState([]);
  const [form,    setForm]    = useState(null); // null | {id?, ...}
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting] = useState(null);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white placeholder-gray-600 focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const load = () =>
    siCompanyScaleService.list(config.id)
      .then(({ data }) => setScales(Array.isArray(data) ? data : (data.results ?? [])));

  useEffect(() => { load(); }, [config.id]);

  const openNew = () => setForm({
    rating_code: "E",
    rating_label: "",
    variance_min: "",
    variance_max: "",
    bonus_pct: "",
    sort_order: scales.length,
  });

  const handleSave = async () => {
    if (!form.rating_code) return;
    setSaving(true);
    try {
      const payload = {
        company_config: config.id,
        rating_code:    form.rating_code,
        rating_label:   form.rating_label,
        variance_min:   form.variance_min === "" ? null : parseFloat(form.variance_min),
        variance_max:   form.variance_max === "" ? null : parseFloat(form.variance_max),
        bonus_pct:      parseFloat(form.bonus_pct) || 0,
        sort_order:     parseInt(form.sort_order)  || 0,
      };
      if (form.id) await siCompanyScaleService.update(form.id, payload);
      else         await siCompanyScaleService.create(payload);
      setForm(null);
      await load();
      showSuccess("Scale row saved.");
    } catch (e) {
      showError(e.response?.data ? JSON.stringify(e.response.data) : "Failed to save.");
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    setDeleting(id);
    try { await siCompanyScaleService.delete(id); await load(); showSuccess("Deleted."); }
    catch { showError("Failed to delete."); }
    finally { setDeleting(null); }
  };

  // Bonus pct bar width (max 100% = 100 salary pct)
  const barW = pct => Math.min((parseFloat(pct) || 0), 100);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${dark ? "bg-teal-500/10 border border-teal-500/20" : "bg-teal-50 border border-teal-200"}`}>
            <BarChart2 size={18} className="text-teal-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${text}`}>Company KPI Rating Scale</h2>
            <p className={`text-xs mt-1 ${sub}`}>
              Variance % → Rating code → Bonus % of Total Salary Pool.
            </p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5">
          <Plus size={14} /> Add Row
        </button>
      </div>

      {/* Info box */}
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border mb-5
        ${dark ? "bg-almet-sapphire/8 border-almet-sapphire/20" : "bg-almet-mystic border-almet-sapphire/20"}`}>
        <Info size={13} className="text-almet-steel-blue shrink-0 mt-0.5" />
        <div className={`text-xs leading-relaxed ${sub}`}>
          <b>variance = (actual − target) / target</b><br />
          Both variance_min and variance_max are inclusive (≥ / ≤). First matching row wins — order matters.<br />
          Leave min/max empty for −∞ / +∞.
        </div>
      </div>

      {/* Scale table */}
      {scales.length === 0 ? (
        <div className={`text-center py-14 rounded-2xl border-2 border-dashed
          ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
          <BarChart2 size={26} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No scale rows yet</p>
          <p className="text-xs mt-1 opacity-70">Click "Add Row" — add 4 rows: E−, E, E+, E++</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {scales.map(sc => {
            const style  = RATING_STYLE[sc.rating_code]?.(dark) || "";
            const bw     = barW(sc.bonus_pct);
            return (
              <div key={sc.id}
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all
                  ${dark ? "bg-[#0f0f0f] border-[#1e1e1e] hover:border-[#2a2a2a]"
                         : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"}`}>

                {/* Rating badge */}
                <span className={`text-sm font-black px-3 py-1.5 rounded-xl border w-16 text-center shrink-0 ${style}`}>
                  {sc.rating_code}
                </span>

                {/* Label */}
                <span className={`text-xs flex-1 min-w-0 truncate ${sub}`}>
                  {sc.rating_label || "—"}
                </span>

                {/* Variance range */}
                <span className={`text-xs font-mono shrink-0 ${muted}`}>
                  {sc.variance_min == null ? "−∞" : `${sc.variance_min}`}
                  {" ≤ var ≤ "}
                  {sc.variance_max == null ? "+∞" : `${sc.variance_max}`}
                </span>

                {/* Bonus pct + bar */}
                <div className="flex items-center gap-3 shrink-0 w-40">
                  <div className="flex-1">
                    <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-200"}`}>
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${bw}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-emerald-500 w-12 text-right">
                    {sc.bonus_pct}%
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setForm({ ...sc, variance_min: sc.variance_min ?? "", variance_max: sc.variance_max ?? "" })}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition
                      ${dark ? "text-gray-600 hover:text-white hover:bg-white/[0.06]"
                             : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(sc.id)} disabled={deleting === sc.id}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-40
                      ${dark ? "text-gray-600 hover:text-rose-400 hover:bg-rose-500/10"
                             : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>
            <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <h3 className={`text-sm font-bold ${text}`}>{form.id ? "Edit Scale Row" : "Add Scale Row"}</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Rating code buttons */}
              <div>
                <label className={`text-xs font-semibold block mb-2 ${sub}`}>Rating Code</label>
                <div className="grid grid-cols-4 gap-2">
                  {RATING_CODES.map(r => (
                    <button key={r} type="button"
                      onClick={() => setForm(p => ({ ...p, rating_code: r }))}
                      className={`py-2.5 rounded-xl border text-xs font-black transition
                        ${form.rating_code === r
                          ? "bg-almet-sapphire border-almet-sapphire text-white shadow-md"
                          : dark ? "border-white/[0.08] text-gray-400 hover:border-white/20"
                                 : "border-gray-200 text-gray-600 hover:bg-almet-mystic"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Label</label>
                <input type="text" placeholder='e.g. "as expected"'
                  value={form.rating_label} onChange={e => setForm(p => ({ ...p, rating_label: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
              </div>

              {/* Variance min / max */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Variance Min</label>
                  <input type="number" step="0.01" placeholder="empty = −∞"
                    value={form.variance_min} onChange={e => setForm(p => ({ ...p, variance_min: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Variance Max</label>
                  <input type="number" step="0.01" placeholder="empty = +∞"
                    value={form.variance_max} onChange={e => setForm(p => ({ ...p, variance_max: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
                </div>
              </div>

              {/* Bonus pct */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>
                  Bonus % of Monthly Salary
                </label>
                <div className="relative">
                  <input type="number" min={0} max={200} step={0.5} placeholder="e.g. 50"
                    value={form.bonus_pct} onChange={e => setForm(p => ({ ...p, bonus_pct: e.target.value }))}
                    className={`w-full px-3 py-2.5 pr-8 rounded-xl border text-sm outline-none transition ${inp}`} />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${muted}`}>%</span>
                </div>
              </div>

              {/* Sort order */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Sort Order</label>
                <input type="number" min={0}
                  value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
              </div>
            </div>
            <div className={`flex justify-end gap-2 px-6 pb-6`}>
              <button onClick={() => setForm(null)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
                  ${dark ? "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05]"
                         : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-almet-sapphire/20">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

