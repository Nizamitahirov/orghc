"use client";
import { useState, useEffect } from "react";
import { objectiveWeightConfigService, bonusPositionConfigService } from "@/services/bonusService";
import { Info, Save, Sliders } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";

export default function ObjectiveWeightTab({ bonusYear, dark }) {
  const { showSuccess, showError } = useToast();

  const [rows, setRows]       = useState([]);
  const [edited, setEdited]   = useState({});
  const [saving, setSaving]   = useState(null);
  const [loading, setLoading] = useState(true);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  /* Tier color per hierarchy level */
  const tierColor = (level) => {
    const map = {
      1: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      2: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      3: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      4: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      5: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      6: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    };
    return map[level] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data: pgData } = await bonusPositionConfigService.withGroups();
      const groups = Array.isArray(pgData) ? pgData : [];

      const { data: cfgData } = await objectiveWeightConfigService.list();
      const cfgList   = Array.isArray(cfgData) ? cfgData : (cfgData.results ?? []);
      const yearCfgs  = cfgList.filter((c) => c.bonus_year === bonusYear.id);
      const cfgByLevel = {};
      yearCfgs.forEach((c) => { cfgByLevel[c.manager_threshold_level] = c; });

      const built = groups.map((pg) => {
        const cfg    = cfgByLevel[pg.hierarchy_level];
        const weight = cfg ? cfg.weight_manager_and_above : "";
        return {
          position_group_id:   pg.position_group_id,
          position_group_name: pg.position_group_name,
          hierarchy_level:     pg.hierarchy_level,
          grading_shorthand:   pg.grading_shorthand,
          weight,
          config_id: cfg?.id ?? null,
        };
      });

      setRows(built);
      const initEdited = {};
      built.forEach((r) => { initEdited[r.position_group_id] = r.weight; });
      setEdited(initEdited);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [bonusYear.id]);

  const saveRow = async (row) => {
    const weight  = edited[row.position_group_id];
    const payload = {
      bonus_year:               bonusYear.id,
      manager_threshold_level:  row.hierarchy_level,
      weight_manager_and_above: weight,
      weight_below_manager:     weight,
      is_active:                true,
    };
    if (row.config_id) {
      await objectiveWeightConfigService.update(row.config_id, payload);
    } else {
      await objectiveWeightConfigService.create(payload);
    }
  };

  const handleSave = async (row) => {
    setSaving(row.position_group_id);
    try {
      await saveRow(row);
      await load();
      showSuccess(`Weight saved for ${row.position_group_name}.`);
    } catch {
      showError("Failed to save weight.");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving("all");
    try {
      await Promise.all(rows.map(saveRow));
      await load();
      showSuccess("All weights saved successfully.");
    } catch {
      showError("Failed to save some weights.");
    } finally {
      setSaving(null);
    }
  };

  const anyDirty = rows.some(
    (r) => String(edited[r.position_group_id]) !== String(r.weight)
  );

  if (loading) return <LoadingSpinner message="Loading objective weights…" />;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
          ${dark ? "bg-rose-500/10 border border-rose-500/20" : "bg-rose-50 border border-rose-200"}`}>
          <Sliders size={18} className="text-rose-400" />
        </div>
        <div>
          <h2 className={`text-base font-bold tracking-tight ${text}`}>Objective Adjusted Weight</h2>
          <p className={`text-xs mt-1 ${sub}`}>
            Set the weight multiplier for each position group used in objective bonus calculation.
          </p>
        </div>
      </div>

      <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border mb-6
        ${dark ? "bg-almet-sapphire/8 border-almet-sapphire/20" : "bg-almet-mystic border-almet-sapphire/20"}`}>
        <Info size={14} className="text-almet-steel-blue shrink-0 mt-0.5" />
        <p className={`text-xs leading-relaxed ${sub}`}>
          <b>Example:</b> Objective weight <b>30%</b> × Position multiplier <b>50%</b> = Effective weight <b>15%</b>.
          Bonus = Salary × 15% × Rating%.
        </p>
      </div>

      {/* ── Table ── */}
      <div className={`rounded-2xl border overflow-hidden mb-4
        ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
        {/* Header */}
        <div className={`grid items-center px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b
          ${dark ? "bg-[#080b14] border-white/[0.06] text-[#5a6a85]" : "bg-[#f5f7fb] border-gray-200 text-gray-400"}`}
          style={{ gridTemplateColumns: "56px 1fr 180px 80px" }}>
          <span>Level</span>
          <span>Position Group</span>
          <span className="text-center">Adjusted Weight</span>
          <span className="text-center">Save</span>
        </div>

        {rows.map((row) => {
          const val      = edited[row.position_group_id] ?? "";
          const isDirty  = String(val) !== String(row.weight);
          const isSaving = saving === row.position_group_id;
          const pct      = Math.min(((parseFloat(val) || 0) / 100) * 100, 100);

          return (
            <div
              key={row.position_group_id}
              className={`grid items-center px-5 py-2.5 border-t transition-all
                ${isDirty
                  ? dark ? "bg-almet-sapphire/5 border-almet-sapphire/10" : "bg-almet-mystic/60 border-almet-sapphire/10"
                  : dark ? "border-white/[0.04] hover:bg-white/[0.02]" : "border-gray-100 hover:bg-gray-50/60"
                }`}
              style={{ gridTemplateColumns: "56px 1fr 180px 80px" }}
            >
              {/* Level badge */}
              <span className={`text-xs font-black px-2 py-1 rounded-lg border text-center w-fit
                ${tierColor(row.hierarchy_level)}`}>
                L{row.hierarchy_level}
              </span>

              {/* Name */}
              <div className="px-3">
                <p className={`text-sm font-semibold ${text}`}>{row.position_group_name}</p>
                {row.grading_shorthand && (
                  <p className={`text-xs mt-0.5 ${muted}`}>{row.grading_shorthand}</p>
                )}
              </div>

              {/* Weight input + mini bar */}
              <div className="flex items-center gap-2.5 justify-center">
                <div className="flex flex-col items-end gap-1 w-16">
                  <div className={`w-full h-1 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-200"}`}>
                    <div
                      className="h-full rounded-full bg-almet-steel-blue transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number" min={0} max={100} step={1}
                    placeholder="—"
                    value={val}
                    onChange={(e) =>
                      setEdited((prev) => ({ ...prev, [row.position_group_id]: e.target.value }))
                    }
                    className={`w-24 px-3 py-2 pr-8 rounded-xl border text-sm text-center outline-none transition ${inp}
                      ${isDirty ? (dark ? "border-almet-steel-blue/50" : "border-almet-sapphire/50") : ""}`}
                  />
                  <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${muted}`}>%</span>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleSave(row)}
                  disabled={!isDirty || isSaving}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${isDirty
                      ? "bg-almet-sapphire hover:bg-almet-cloud-burst text-white shadow-md shadow-almet-sapphire/20 hover:-translate-y-0.5"
                      : dark ? "bg-white/[0.04] text-gray-700 cursor-not-allowed" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    } disabled:opacity-50 disabled:transform-none`}
                >
                  <Save size={11} />
                  {isSaving ? "…" : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Save All ── */}
      {anyDirty && (
        <button
          onClick={handleSaveAll}
          disabled={saving === "all"}
          className="w-full py-3 rounded-2xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white
            text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50
            shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5"
        >
          <Save size={14} />
          {saving === "all" ? "Saving all…" : "Save All Changes"}
        </button>
      )}
    </div>
  );
}