// ═══════════════════════════════════════════════════════
// src/components/si/settings/SIIndividualKPITab.jsx
// Yalnız KPI adları + çəkilər — bands ayrıca tabdadır
// ═══════════════════════════════════════════════════════
"use client";
import { useState, useEffect } from "react";
import { siIndividualKPIService } from "@/services/siService";
import { useToast } from "@/components/common/Toast";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";

export default function SIIndividualKPITab({ dark, config }) {
  const { showSuccess, showError } = useToast();
  const [kpis,    setKPIs]   = useState([]);
  const [form,    setForm]   = useState(null);
  const [saving,  setSaving] = useState(false);
  const [deleting,setDel]    = useState(null);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const load = () =>
    siIndividualKPIService.list(config.id)
      .then(({ data }) => setKPIs(Array.isArray(data) ? data : (data.results ?? [])));

  useEffect(() => { load(); }, [config.id]);

  const totalWeight = kpis.filter(k => k.is_active).reduce((s, k) => s + parseFloat(k.weight || 0), 0);
  const weightColor = totalWeight > 100.01 ? "text-rose-400" : totalWeight >= 99.99 ? "text-emerald-400" : "text-amber-400";

  const handleSave = async () => {
    if (!form.kpi_name?.trim() || !form.kpi_code?.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, company_config: config.id, weight: parseFloat(form.weight) || 0 };
      if (form.id) await siIndividualKPIService.update(form.id, payload);
      else         await siIndividualKPIService.create(payload);
      setForm(null);
      await load();
      showSuccess("KPI saved.");
    } catch (e) {
      showError(e.response?.data ? JSON.stringify(e.response.data) : "Failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    setDel(id);
    try { await siIndividualKPIService.delete(id); await load(); showSuccess("Deleted."); }
    catch { showError("Failed."); }
    finally { setDel(null); }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${dark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
            <TrendingUp size={18} className="text-amber-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${text}`}>Individual KPIs</h2>
            <p className={`text-xs mt-1 ${sub}`}>
              Per-employee KPIs — rating bands are configured in the "Individual KPI Bands" tab.
              <span className={`ml-2 font-bold ${weightColor}`}>Total: {totalWeight.toFixed(0)}%</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setForm({ kpi_name: "", kpi_code: "", weight: "", display_order: kpis.length })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5">
          <Plus size={14} /> Add KPI
        </button>
      </div>

      {kpis.length === 0 ? (
        <div className={`text-center py-14 rounded-2xl border-2 border-dashed
          ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
          <TrendingUp size={26} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No KPIs yet</p>
          <p className="text-xs mt-1 opacity-70">Add KPIs, then configure their rating bands in the next tab</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${dark ? "border-[#1e1e1e]" : "border-gray-200"}`}>
          <div className={`grid items-center px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b
            ${dark ? "bg-[#080b14] border-white/[0.06] text-[#5a6a85]" : "bg-[#f5f7fb] border-gray-100 text-gray-400"}`}
            style={{ gridTemplateColumns: "1fr 160px 80px 72px" }}>
            <span>KPI Name</span>
            <span>Code</span>
            <span className="text-right">Weight</span>
            <span className="text-center">Actions</span>
          </div>

          {kpis.map(kpi => (
            <div key={kpi.id}
              className={`grid items-center px-5 py-3 border-t transition
                ${dark ? "border-[#1e1e1e] hover:bg-[#0d0d0d]" : "border-gray-100 hover:bg-gray-50/60"}`}
              style={{ gridTemplateColumns: "1fr 160px 80px 72px" }}>
              <p className={`text-sm font-semibold ${text}`}>{kpi.kpi_name}</p>
              <p className={`text-xs font-mono ${sub}`}>{kpi.kpi_code}</p>
              <p className={`text-sm font-bold text-right tabular-nums ${text}`}>{kpi.weight}%</p>
              <div className="flex items-center justify-center gap-1">
                <button onClick={() => setForm({ ...kpi })}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition
                    ${dark ? "text-gray-600 hover:text-white hover:bg-white/[0.06]"
                           : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}>
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDelete(kpi.id)} disabled={deleting === kpi.id}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-40
                    ${dark ? "text-gray-600 hover:text-rose-400 hover:bg-rose-500/10"
                           : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          <div className={`grid items-center px-5 py-2.5 border-t
            ${dark ? "border-[#1e1e1e] bg-[#080b14]" : "border-gray-100 bg-gray-50"}`}
            style={{ gridTemplateColumns: "1fr 160px 80px 72px" }}>
            <span className={`text-xs font-semibold ${sub}`}>Total</span>
            <span /><span />
            <span className={`text-sm font-black text-right tabular-nums ${weightColor} col-start-3`}>
              {totalWeight.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>
            <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <h3 className={`text-sm font-bold ${text}`}>{form.id ? "Edit KPI" : "Add Individual KPI"}</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { key: "kpi_name", label: "KPI Name *", type: "text",   ph: "e.g. Receivables Weighted Days Overdue" },
                { key: "kpi_code", label: "Code *",     type: "text",   ph: "e.g. DAYS_OVERDUE"                      },
                { key: "weight",   label: "Weight (%)", type: "number", ph: "e.g. 50"                                 },
              ].map(({ key, label, type, ph }) => (
                <div key={key}>
                  <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>{label}</label>
                  <input type={type} placeholder={ph}
                    value={form[key] ?? ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
                </div>
              ))}
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
                {saving ? "Saving…" : "Save KPI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

