"use client";
import { useState, useEffect } from "react";
import { companyTargetService, bonusPositionConfigService } from "@/services/bonusService";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, AlertTriangle, Target } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";

export default function CompanyTargetsTab({ bonusYear, dark }) {
  const { showSuccess, showError } = useToast();

  const [targets, setTargets]     = useState([]);
  const [summary, setSummary]     = useState([]);
  const [posGroups, setPosGroups] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(null);
  const [expanded, setExpanded]   = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  /* ── Design tokens ── */
  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const card  = dark ? "bg-white/[0.02] border-white/[0.06]" : "bg-gray-50 border-gray-200";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white placeholder-gray-700 focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire";

  const load = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        companyTargetService.list(bonusYear.id),
        companyTargetService.weightSummary(bonusYear.id),
      ]);
      setTargets(Array.isArray(t.data) ? t.data : (t.data.results ?? []));
      setSummary(Array.isArray(s.data) ? s.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    bonusPositionConfigService.withGroups().then(({ data }) => setPosGroups(data));
  }, [bonusYear.id]);

  const openNew = () => {
    setFormError("");
    setForm({ name: "", description: "", position_weights: {}, bonus_year: bonusYear.id });
  };

  const openEdit = (t) => {
    setFormError("");
    setForm({ ...t });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setFormError("Target name is required.");
    setFormError("");
    setSaving(true);
    try {
      if (form.id) {
        await companyTargetService.update(form.id, form);
        showSuccess("Target updated successfully.");
      } else {
        await companyTargetService.create(form);
        showSuccess("Target created successfully.");
      }
      setForm(null);
      load();
    } catch (e) {
      const d = e.response?.data;
      const msg = d ? (typeof d === "string" ? d : JSON.stringify(d)) : e.message;
      setFormError(msg);
      showError("Failed to save target.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this company target?")) return;
    setDeleting(id);
    try {
      await companyTargetService.delete(id);
      showSuccess("Target deleted.");
      load();
    } catch {
      showError("Failed to delete target.");
    } finally {
      setDeleting(null);
    }
  };

  const setWeight = (pgId, val) =>
    setForm((f) => ({
      ...f,
      position_weights: { ...f.position_weights, [pgId]: parseFloat(val) || 0 },
    }));

  const capFor = (pgId) => summary.find((s) => String(s.position_group_id) === String(pgId));

  if (loading) return <LoadingSpinner message="Loading company targets…" />;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${dark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
            <Target size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${text}`}>Company Targets</h2>
            <p className={`text-xs mt-1 ${sub}`}>
              Define company-level targets and assign weights per position group.
              Totals must not exceed the position caps.
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition-all shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5"
        >
          <Plus size={15} />
          Add Target
        </button>
      </div>

      {/* ── Weight cap summary ── */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {summary.map((s) => (
            <div key={s.position_group_id} className={`rounded-2xl border p-3 ${card}`}>
              <p className={`text-[11px] font-semibold truncate mb-2 ${sub}`}>{s.position_group_name}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-base font-black leading-none ${s.is_over ? "text-rose-400" : "text-emerald-400"}`}>
                  {s.current_total}%
                </span>
                <span className={`text-xs ${muted}`}>/ {s.max_weight}%</span>
              </div>
       
              {s.is_over && (
                <p className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertTriangle size={9} /> Over cap
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Targets list ── */}
      {targets.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border-2 border-dashed
          ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
          <Target size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No targets yet</p>
          <p className="text-xs mt-1 opacity-70">Click "Add Target" to define your first company target</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
          {/* Column headers */}
          <div
            className={`grid text-[10px] font-bold uppercase tracking-widest px-5 py-3 border-b
              ${dark ? "bg-[#080b14] border-white/[0.06] text-[#5a6a85]" : "bg-[#f5f7fb] border-gray-200 text-gray-400"}`}
            style={{ gridTemplateColumns: `1fr 1.5fr ${posGroups.map(() => "72px").join(" ")} 96px` }}
          >
            <span>Target</span>
            <span>Description</span>
            {posGroups.map((pg) => (
              <span key={pg.position_group_id} className="text-center">
                {pg.grading_shorthand || `L${pg.hierarchy_level}`}
              </span>
            ))}
            <span className="text-center">Actions</span>
          </div>

          {targets.map((t, idx) => (
            <div key={t.id} className={`border-t ${dark ? "border-white/[0.04]" : "border-gray-100"}`}>
              {/* Row */}
              <div
                className={`grid items-center px-5 py-3.5 cursor-pointer transition-all
                  ${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50/80"}`}
                style={{ gridTemplateColumns: `1fr 1.5fr ${posGroups.map(() => "72px").join(" ")} 96px` }}
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <span className={`text-xs font-semibold  pr-2 ${text}`}>{t.name}</span>
                <span className={`text-xs truncate pr-2 ${sub}`}>{t.description || "—"}</span>
                {posGroups.map((pg) => (
                  <span key={pg.position_group_id} className={`text-center text-xs font-bold ${text}`}>
                    {t.position_weights[pg.position_group_id] ?? 0}%
                  </span>
                ))}
                <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(t)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
                      ${dark ? "text-gray-600 hover:text-almet-steel-blue hover:bg-almet-sapphire/10" : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40
                      ${dark ? "text-gray-600 hover:text-rose-400 hover:bg-rose-500/10" : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}
                  >
                    <Trash2 size={12} />
                  </button>
                  {expanded === t.id
                    ? <ChevronUp size={13} className={muted} />
                    : <ChevronDown size={13} className={muted} />
                  }
                </div>
              </div>

              {/* Expanded row */}
              {expanded === t.id && (
                <div className={`px-5 pb-4 pt-1 border-t
                  ${dark ? "border-white/[0.04] bg-[#080b14]" : "border-gray-100 bg-gray-50/60"}`}>
                  <div className="flex flex-wrap gap-2.5">
                    {posGroups.map((pg) => {
                      const cap = capFor(pg.position_group_id);
                      const w   = t.position_weights[pg.position_group_id] ?? 0;
                      return (
                        <div key={pg.position_group_id}
                          className={`text-xs rounded-xl px-3.5 py-2.5 border ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"}`}>
                          <p className={`font-semibold mb-0.5 ${text}`}>{pg.position_group_name}</p>
                          <p className={sub}>This target: <b className={text}>{w}%</b></p>
                          {cap && (
                            <p className={sub}>
                              Remaining: <b className={cap.remaining < 0 ? "text-rose-400" : "text-emerald-400"}>
                                {cap.remaining}%
                              </b>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>

            {/* Modal header */}
            <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${dark ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                  <Target size={14} className="text-emerald-400" />
                </div>
                <h3 className={`text-base font-bold ${text}`}>
                  {form.id ? "Edit Company Target" : "New Company Target"}
                </h3>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Target Name *</label>
                <input
                  placeholder="e.g. Revenue Growth"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${sub}`}>Description</label>
                <input
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`}
                />
              </div>

              {/* Weights per position group */}
              <div>
                <label className={`text-xs font-semibold block mb-2.5 ${sub}`}>
                  Weights by Position Group (%)
                </label>
                <div className="space-y-2">
                  {posGroups.map((pg) => {
                    const cap = capFor(pg.position_group_id);
                    const currentVal = form.position_weights[pg.position_group_id] ?? "";
                    const origW = form.id
                      ? (targets.find((t) => t.id === form.id)?.position_weights[pg.position_group_id] ?? 0)
                      : 0;
                    const available = cap ? cap.remaining + origW : null;

                    return (
                      <div key={pg.position_group_id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-gray-50"}`}>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${text}`}>{pg.position_group_name}</p>
                          {cap && (
                            <p className={`text-xs mt-0.5 ${sub}`}>
                              Cap: <b>{cap.max_weight}%</b> · Available: <b className={available < 0 ? "text-rose-400" : "text-emerald-400"}>{available?.toFixed(1)}%</b>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="relative">
                            <input
                              type="number" min={0} max={100} step={0.5}
                              value={currentVal}
                              onChange={(e) => setWeight(pg.position_group_id, e.target.value)}
                              className={`w-20 px-2 py-1.5 pr-6 rounded-xl border text-sm text-center outline-none transition ${inp}`}
                            />
                            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${muted}`}>%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle size={13} className="text-rose-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-rose-400">{formError}</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className={`px-6 py-4 border-t flex justify-end gap-2
              ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <button
                onClick={() => { setForm(null); setFormError(""); }}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
                  ${dark ? "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-almet-sapphire/20"
              >
                {saving ? "Saving…" : "Save Target"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}