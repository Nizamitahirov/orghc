"use client";
import { useState, useEffect } from "react";
import { companyTargetService, bonusPositionConfigService } from "@/services/bonusService";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

export default function CompanyTargetsTab({ bonusYear, dark }) {
  const [targets, setTargets]     = useState([]);
  const [summary, setSummary]     = useState([]);
  const [posGroups, setPosGroups] = useState([]);
  const [form, setForm]           = useState(null);   // null=closed, {}=new, {id,...}=edit
  const [expanded, setExpanded]   = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving]       = useState(false);

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const card  = dark ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-gray-50 border-gray-200";
  const input = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 focus:border-almet-steel-blue"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire";

  const load = async () => {
    const [t, s] = await Promise.all([
      companyTargetService.list(bonusYear.id),
      companyTargetService.weightSummary(bonusYear.id),
    ]);
    setTargets(Array.isArray(t.data) ? t.data : (t.data.results ?? []));
    setSummary(Array.isArray(s.data) ? s.data : []);
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
      const payload = { ...form };
      if (form.id) {
        await companyTargetService.update(form.id, payload);
      } else {
        await companyTargetService.create(payload);
      }
      setForm(null);
      load();
    } catch (e) {
      const d = e.response?.data;
      setFormError(d ? (typeof d === "string" ? d : JSON.stringify(d)) : e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this company target?")) return;
    await companyTargetService.delete(id);
    load();
  };

  const setWeight = (pgId, val) =>
    setForm((f) => ({
      ...f,
      position_weights: { ...f.position_weights, [pgId]: parseFloat(val) || 0 },
    }));

  // Cap info for a position group
  const capFor = (pgId) => summary.find((s) => String(s.position_group_id) === String(pgId));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`text-base font-semibold ${text}`}>Company Targets</h2>
          <p className={`text-sm mt-0.5 ${sub}`}>
            Define company-level targets and assign weights per position group.
            Totals must not exceed the position caps configured in "Position Caps".
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium transition"
        >
          <Plus size={14} /> Add Target
        </button>
      </div>

      {/* Weight cap summary bars */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-5">
          {summary.map((s) => (
            <div key={s.position_group_id} className={`rounded-xl border p-3 ${card}`}>
              <p className={`text-xs font-medium truncate mb-1.5 ${sub}`}>{s.position_group_name}</p>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className={`text-lg font-bold leading-none ${s.is_over ? "text-red-400" : "text-green-400"}`}>
                  {s.current_total}%
                </span>
                <span className={`text-xs ${sub}`}>/ {s.max_weight}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#1f1f1f]" : "bg-gray-200"}`}>
                <div
                  className={`h-full rounded-full transition-all ${s.is_over ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min((s.current_total / (s.max_weight || 1)) * 100, 100)}%` }}
                />
              </div>
              {s.is_over && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> Over limit
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Targets table */}
      {targets.length === 0 ? (
        <div className={`text-center py-16 ${sub} text-sm`}>
          No targets yet. Click "Add Target" to get started.
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${dark ? "border-[#1f1f1f]" : "border-gray-200"}`}>
          {/* Column headers */}
          <div className={`grid text-xs font-medium px-4 py-2.5 border-b
            ${dark ? "bg-[#0a0a0a] border-[#1f1f1f] text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"}`}
            style={{ gridTemplateColumns: `1fr 1.5fr ${posGroups.map(() => "80px").join(" ")} 100px` }}
          >
            <span>Target</span>
            <span>Description</span>
            {posGroups.map((pg) => (
              <span key={pg.position_group_id} className="text-center">{pg.grading_shorthand || `L${pg.hierarchy_level}`}</span>
            ))}
            <span className="text-center">Actions</span>
          </div>

          {targets.map((t) => (
            <div key={t.id} className={`border-t ${dark ? "border-[#1a1a1a]" : "border-gray-100"}`}>
              <div
                className={`grid items-center px-4 py-3 cursor-pointer transition
                  ${dark ? "hover:bg-[#0f0f0f]" : "hover:bg-gray-50"}`}
                style={{ gridTemplateColumns: `1fr 1.5fr ${posGroups.map(() => "80px").join(" ")} 100px` }}
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <span className={`text-sm font-medium truncate ${text}`}>{t.name}</span>
                <span className={`text-xs truncate ${sub}`}>{t.description || "—"}</span>
                {posGroups.map((pg) => (
                  <span key={pg.position_group_id}
                    className={`text-center text-sm font-semibold ${text}`}>
                    {t.position_weights[pg.position_group_id] ?? 0}%
                  </span>
                ))}
                <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(t)}
                    className={`p-1.5 rounded transition hover:bg-almet-sapphire/20 ${sub} hover:text-almet-steel-blue`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className={`p-1.5 rounded transition hover:bg-red-500/10 ${sub} hover:text-red-400`}
                  >
                    <Trash2 size={13} />
                  </button>
                  {expanded === t.id
                    ? <ChevronUp size={13} className={sub} />
                    : <ChevronDown size={13} className={sub} />
                  }
                </div>
              </div>

              {/* Expanded row — cap detail */}
              {expanded === t.id && (
                <div className={`px-4 pb-3 pt-1 border-t ${dark ? "border-[#1a1a1a] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex flex-wrap gap-3">
                    {posGroups.map((pg) => {
                      const cap = capFor(pg.position_group_id);
                      const w = t.position_weights[pg.position_group_id] ?? 0;
                      return (
                        <div key={pg.position_group_id} className={`text-xs rounded-lg px-3 py-2 border ${dark ? "border-[#1f1f1f] bg-[#111]" : "border-gray-200 bg-white"}`}>
                          <p className={`font-medium ${text}`}>{pg.position_group_name}</p>
                          <p className={sub}>This target: <b className={text}>{w}%</b></p>
                          {cap && <p className={sub}>Cap remaining: <b className={cap.remaining < 0 ? "text-red-400" : "text-green-400"}>{cap.remaining}%</b></p>}
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

      {/* Create / Edit modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#111] border-[#1f1f1f]" : "bg-white border-gray-200"}`}>
            {/* Modal header */}
            <div className={`px-6 py-4 border-b ${dark ? "border-[#1f1f1f]" : "border-gray-200"}`}>
              <h3 className={`text-base font-semibold ${text}`}>
                {form.id ? "Edit Company Target" : "New Company Target"}
              </h3>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={`text-xs font-medium block mb-1 ${sub}`}>Target Name *</label>
                <input
                  placeholder="e.g. Revenue Growth"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition ${input}`}
                />
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1 ${sub}`}>Description</label>
                <input
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition ${input}`}
                />
              </div>

              {/* Weights per position group */}
              <div>
                <label className={`text-xs font-medium block mb-2 ${sub}`}>
                  Weights by Position Group (%)
                </label>
                <div className="space-y-2">
                  {posGroups.map((pg) => {
                    const cap = capFor(pg.position_group_id);
                    const currentVal = form.position_weights[pg.position_group_id] ?? "";
                    // remaining = cap.remaining + current (since we're editing)
                    const editingExisting = form.id;
                    const origW = editingExisting
                      ? (targets.find((t) => t.id === form.id)?.position_weights[pg.position_group_id] ?? 0)
                      : 0;
                    const available = cap ? cap.remaining + origW : null;

                    return (
                      <div key={pg.position_group_id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${dark ? "border-[#1f1f1f] bg-[#0f0f0f]" : "border-gray-100 bg-gray-50"}`}>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${text}`}>{pg.position_group_name}</p>
                          {cap && (
                            <p className={`text-xs ${sub}`}>
                              Cap: {cap.max_weight}% — Available: {available?.toFixed(1)}%
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number" min={0} max={100} step={0.5}
                            value={currentVal}
                            onChange={(e) => setWeight(pg.position_group_id, e.target.value)}
                            className={`w-20 px-2 py-1.5 rounded-lg border text-sm text-center outline-none transition ${input}`}
                          />
                          <span className={`text-xs ${sub}`}>%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400">{formError}</p>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex justify-end gap-2
              ${dark ? "border-[#1f1f1f]" : "border-gray-200"}`}>
              <button
                onClick={() => { setForm(null); setFormError(""); }}
                className={`px-4 py-2 rounded-lg border text-sm transition
                  ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium disabled:opacity-50 transition"
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