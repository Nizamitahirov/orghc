"use client";
import { useState, useEffect } from "react";
import { siConfigService } from "@/services/siService";
import { useToast } from "@/components/common/Toast";
import { Plus, Pencil, Check, X, Settings } from "lucide-react";

async function fetchBusinessFunctions() {
  const { default: api } = await import("@/services/api");
  const { data } = await api.get("/business-functions/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

const CYCLES = ["QUARTERLY", "MONTHLY"];

export default function SIConfigTab({ dark, configs, selConfig, onRefresh, onSelect }) {
  const { showSuccess, showError } = useToast();
  const [bfList,  setBfList]  = useState([]);
  const [editing, setEditing] = useState(null); // config id or "new"
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { fetchBusinessFunctions().then(setBfList); }, []);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";
  const card  = dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-gray-50 border-gray-200";

  const openNew = () => {
    setForm({
      bonus_scheme_name:         "SALES INCENTIVE BONUS",
      max_fte:                   5,
      max_bonus_pool_pct:        "1.20",
      evaluation_cycle:          "QUARTERLY",
      manager_adjustment_levels: 1,
      is_active:                 true,
    });
    setEditing("new");
  };

  const openEdit = cfg => {
    setForm({ ...cfg });
    setEditing(cfg.id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing === "new") {
        const { data } = await siConfigService.create(form);
        onRefresh();
        onSelect(data);
        showSuccess("Config created.");
      } else {
        await siConfigService.update(editing, form);
        onRefresh();
        showSuccess("Config updated.");
      }
      setEditing(null);
    } catch (e) {
      showError(e.response?.data ? JSON.stringify(e.response.data) : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const usedBfIds = new Set(configs.map(c => c.business_function));

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${dark ? "bg-violet-500/10 border border-violet-500/20" : "bg-violet-50 border border-violet-200"}`}>
            <Settings size={18} className="text-violet-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${text}`}>Scheme Configuration</h2>
            <p className={`text-xs mt-1 ${sub}`}>
              Create a Sales Incentive config per company (business function).
            </p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition-all shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5">
          <Plus size={14} /> New Config
        </button>
      </div>

      {/* Config cards */}
      <div className="space-y-3">
        {configs.length === 0 && editing !== "new" && (
          <div className={`text-center py-16 rounded-2xl border-2 border-dashed
            ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
            <Settings size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No configs yet</p>
          </div>
        )}

        {configs.map(cfg => (
          <div key={cfg.id}
            onClick={() => onSelect(cfg)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all
              ${selConfig?.id === cfg.id
                ? dark ? "border-almet-sapphire/40 bg-almet-sapphire/8" : "border-almet-sapphire/40 bg-almet-mystic"
                : `${card} hover:border-almet-bali-hai/30`}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`text-base font-bold ${text}`}>{cfg.bonus_scheme_name}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                    ${dark ? "bg-almet-sapphire/15 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
                    {cfg.business_function_name}
                  </span>
                  {cfg.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>
                <div className={`flex flex-wrap gap-4 mt-2 text-xs ${sub}`}>
                  <span>Max FTE: <b className={text}>{cfg.max_fte}</b></span>
                  <span>Max Pool: <b className={text}>{(parseFloat(cfg.max_bonus_pool_pct) * 100).toFixed(0)}%</b></span>
                  <span>Cycle: <b className={text}>{cfg.evaluation_cycle}</b></span>
                  <span>Manager adj: <b className={text}>±{cfg.manager_adjustment_levels}</b></span>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); openEdit(cfg); }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0
                  ${dark ? "text-gray-500 hover:text-white hover:bg-white/[0.06]"
                         : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}>
                <Pencil size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>
            <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <h3 className={`text-base font-bold ${text}`}>
                {editing === "new" ? "New Config" : "Edit Config"}
              </h3>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {editing === "new" && (
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Business Function *</label>
                  <select value={form.business_function ?? ""}
                    onChange={e => setForm(p => ({ ...p, business_function: Number(e.target.value) }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`}>
                    <option value="">— Select —</option>
                    {bfList.filter(b => !usedBfIds.has(b.id)).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {[
                { key: "bonus_scheme_name",         label: "Scheme Name",           type: "text"   },
                { key: "max_fte",                   label: "Max FTE",               type: "number" },
                { key: "max_bonus_pool_pct",        label: "Max Bonus Pool (e.g. 1.20 = 120%)", type: "number" },
                { key: "manager_adjustment_levels", label: "Manager Adjustment Levels", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>{label}</label>
                  <input type={type} value={form[key] ?? ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
                </div>
              ))}

              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Evaluation Cycle</label>
                <div className="grid grid-cols-2 gap-2">
                  {CYCLES.map(c => (
                    <button key={c} type="button"
                      onClick={() => setForm(p => ({ ...p, evaluation_cycle: c }))}
                      className={`py-2 rounded-xl border text-xs font-semibold transition
                        ${form.evaluation_cycle === c
                          ? "bg-almet-sapphire border-almet-sapphire text-white"
                          : dark ? "border-white/[0.08] text-gray-400 hover:border-white/20"
                                 : "border-gray-200 text-gray-600 hover:bg-almet-mystic"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative shrink-0">
                  <input type="checkbox" checked={form.is_active ?? true}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="sr-only" />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? "bg-almet-sapphire" : dark ? "bg-white/10" : "bg-gray-200"}`}>
                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{ left: form.is_active ? "calc(100% - 22px)" : "2px" }} />
                  </div>
                </div>
                <span className={`text-sm font-medium ${sub}`}>Active</span>
              </label>
            </div>
            <div className={`flex justify-end gap-2 px-6 pb-6`}>
              <button onClick={() => setEditing(null)}
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