
// ═══════════════════════════════════════════════════════════════
// src/components/si/settings/SIIndividualScaleTab.jsx
// Fərdi KPI band-ları — hər KPI üçün band → rating → multiplier
// ═══════════════════════════════════════════════════════════════
"use client";
import { useState, useEffect } from "react";
import { siIndividualKPIService, siIndividualScaleService } from "@/services/siService";
import { useToast } from "@/components/common/Toast";
import { Plus, Pencil, Trash2, Layers, ChevronDown, ChevronUp } from "lucide-react";

const RATING_CODES   = ["E-", "E", "E+", "E++"];
const RATING_STYLE = {
  "E-":  d => d ? "bg-rose-500/15 text-rose-400"       : "bg-rose-50 text-rose-600",
  "E":   d => d ? "bg-amber-500/15 text-amber-400"     : "bg-amber-50 text-amber-600",
  "E+":  d => d ? "bg-sky-500/15 text-sky-400"         : "bg-sky-50 text-sky-600",
  "E++": d => d ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600",
};

export default function SIIndividualScaleTab({ dark, config }) {
  const { showSuccess, showError } = useToast();
  const [kpis,      setKPIs]     = useState([]);
  const [scalesMap, setScalesMap] = useState({});   // { kpi_id: [...] }
  const [expanded,  setExpanded]  = useState(null); // expanded kpi id
  const [form,      setForm]      = useState(null); // {kpi_id, id?, band_label, rating_code, multiplier, sort_order}
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(null);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const loadAll = async () => {
    const { data: kd } = await siIndividualKPIService.list(config.id);
    const kList = Array.isArray(kd) ? kd : (kd.results ?? []);
    setKPIs(kList);
    const sm = {};
    await Promise.all(kList.map(async kpi => {
      const { data: sd } = await siIndividualScaleService.list(kpi.id);
      sm[kpi.id] = Array.isArray(sd) ? sd : (sd.results ?? []);
    }));
    setScalesMap(sm);
    // Auto-expand first KPI
    if (kList.length && !expanded) setExpanded(kList[0].id);
  };

  useEffect(() => { loadAll(); }, [config.id]);

  const openNew = kpiId => setForm({
    kpi_id:      kpiId,
    band_label:  "",
    rating_code: "E",
    multiplier:  "1.00",
    sort_order:  (scalesMap[kpiId]?.length || 0),
  });

  const handleSave = async () => {
    if (!form.band_label || !form.rating_code) return;
    setSaving(true);
    try {
      const payload = {
        individual_kpi: form.kpi_id,
        band_label:     form.band_label,
        rating_code:    form.rating_code,
        multiplier:     (() => { const m = parseFloat(form.multiplier); return isNaN(m) ? 1 : m; })(),
        sort_order:     parseInt(form.sort_order)   || 0,
      };
      if (form.id) await siIndividualScaleService.update(form.id, payload);
      else         await siIndividualScaleService.create(payload);
      setForm(null);
      await loadAll();
      showSuccess("Band saved.");
    } catch (e) {
      showError(e.response?.data ? JSON.stringify(e.response.data) : "Failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    setDeleting(id);
    try { await siIndividualScaleService.delete(id); await loadAll(); showSuccess("Deleted."); }
    catch { showError("Failed."); }
    finally { setDeleting(null); }
  };

  const multColor = m => {
    const v = parseFloat(m);
    if (v === 0)   return "text-rose-400";
    if (v > 1)     return "text-emerald-500";
    return dark ? "text-gray-300" : "text-gray-700";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${dark ? "bg-orange-500/10 border border-orange-500/20" : "bg-orange-50 border border-orange-200"}`}>
          <Layers size={18} className="text-orange-400" />
        </div>
        <div>
          <h2 className={`text-base font-bold ${text}`}>Individual KPI Rating Bands</h2>
          <p className={`text-xs mt-1 ${sub}`}>
            Per-KPI band lookup table: band label → rating code → multiplier applied to company pool portion.
          </p>
        </div>
      </div>

      {kpis.length === 0 && (
        <div className={`text-center py-14 rounded-2xl border-2 border-dashed
          ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
          <Layers size={26} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No individual KPIs found</p>
          <p className="text-xs mt-1 opacity-70">Add KPIs in the "Individual KPIs" tab first</p>
        </div>
      )}

      {/* One accordion section per KPI */}
      <div className="space-y-3">
        {kpis.map(kpi => {
          const bands = scalesMap[kpi.id] || [];
          const isExp = expanded === kpi.id;
          return (
            <div key={kpi.id}
              className={`rounded-2xl border overflow-hidden
                ${dark ? "border-[#1e1e1e]" : "border-gray-200"}`}>

              {/* KPI header */}
              <div
                className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition
                  ${dark ? "bg-[#0a0a0a] hover:bg-[#111]" : "bg-gray-50 hover:bg-gray-100/60"}`}
                onClick={() => setExpanded(isExp ? null : kpi.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${text}`}>{kpi.kpi_name}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                    ${dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                    {kpi.weight}%
                  </span>
                  <span className={`text-xs font-mono ${muted}`}>{kpi.kpi_code}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${sub}`}>{bands.length} bands</span>
                  {isExp
                    ? <ChevronUp size={14} className={muted} />
                    : <ChevronDown size={14} className={muted} />}
                </div>
              </div>

              {/* Bands list */}
              {isExp && (
                <div className={`border-t ${dark ? "border-[#1e1e1e]" : "border-gray-100"}`}>
                  {/* Band rows */}
                  {bands.length === 0 ? (
                    <p className={`text-center py-6 text-xs ${muted}`}>No bands yet — add the first one.</p>
                  ) : (
                    <div className={`divide-y ${dark ? "divide-[#1e1e1e]" : "divide-gray-100"}`}>
                      {/* Column header */}
                      <div className={`grid px-4 py-2 text-[10px] font-bold uppercase tracking-widest
                        ${dark ? "bg-[#080808] text-gray-600" : "bg-gray-50/80 text-gray-400"}`}
                        style={{ gridTemplateColumns: "1fr 80px 80px 80px 64px" }}>
                        <span>Band Label</span>
                        <span className="text-center">Rating</span>
                        <span className="text-center">Multiplier</span>
                        <span className="text-center">Order</span>
                        <span />
                      </div>
                      {bands.map(band => (
                        <div key={band.id}
                          className={`grid items-center px-4 py-2.5 transition
                            ${dark ? "hover:bg-[#0d0d0d]" : "hover:bg-gray-50/50"}`}
                          style={{ gridTemplateColumns: "1fr 80px 80px 80px 64px" }}>
                          <span className={`text-sm font-semibold ${text}`}>{band.band_label}</span>
                          <div className="flex justify-center">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg
                              ${RATING_STYLE[band.rating_code]?.(dark) || ""}`}>
                              {band.rating_code}
                            </span>
                          </div>
                          <span className={`text-sm font-bold tabular-nums text-center ${multColor(band.multiplier)}`}>
                            ×{band.multiplier}
                          </span>
                          <span className={`text-xs text-center ${muted}`}>{band.sort_order}</span>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setForm({ ...band, kpi_id: kpi.id })}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition
                                ${dark ? "text-gray-600 hover:text-white hover:bg-white/[0.06]"
                                       : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}>
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => handleDelete(band.id)}
                              disabled={deleting === band.id}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition disabled:opacity-40
                                ${dark ? "text-gray-600 hover:text-rose-400 hover:bg-rose-500/10"
                                       : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add band button */}
                  <div className={`px-4 py-3 border-t ${dark ? "border-[#1e1e1e] bg-[#080808]" : "border-gray-100 bg-gray-50/40"}`}>
                    <button onClick={() => openNew(kpi.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition
                        ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                               : "border-gray-200 text-almet-waterloo hover:bg-almet-mystic hover:border-almet-bali-hai hover:text-almet-sapphire"}`}>
                      <Plus size={12} /> Add Band
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modal ── */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>
            <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <h3 className={`text-sm font-bold ${text}`}>
                {form.id ? "Edit Band" : "Add Band"}
              </h3>
              <p className={`text-xs mt-0.5 ${sub}`}>
                {kpis.find(k => k.id === form.kpi_id)?.kpi_name}
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Band label */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Band Label</label>
                <input type="text" placeholder='e.g. "≤3 days" or "0–2%"'
                  value={form.band_label}
                  onChange={e => setForm(p => ({ ...p, band_label: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
              </div>

              {/* Rating code */}
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

              {/* Multiplier */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>
                  Multiplier <span className={`font-normal ${muted}`}>(applied to employee pool portion)</span>
                </label>
                {/* Quick presets */}
                <div className="flex gap-2 mb-2">
                  {[["0.00","E− (no bonus)"],["1.00","E (base)"],["1.10","E+ (+10%)"],["1.20","E++ (+20%)"]].map(([v, lbl]) => (
                    <button key={v} type="button"
                      onClick={() => setForm(p => ({ ...p, multiplier: v }))}
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition
                        ${form.multiplier === v
                          ? "bg-almet-sapphire border-almet-sapphire text-white"
                          : dark ? "border-white/[0.08] text-gray-500 hover:border-white/20"
                                 : "border-gray-200 text-gray-500 hover:bg-almet-mystic"}`}>
                      {v}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input type="number" step="0.01" min={0}
                    value={form.multiplier}
                    onChange={e => setForm(p => ({ ...p, multiplier: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
                </div>
              </div>

              {/* Sort order */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Sort Order</label>
                <input type="number" min={0}
                  value={form.sort_order}
                  onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
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
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-almet-sapphire/20">
                {saving ? "Saving…" : "Save Band"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}