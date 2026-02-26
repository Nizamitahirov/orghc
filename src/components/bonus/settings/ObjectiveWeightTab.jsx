"use client";
/**
 * ObjectiveWeightTab
 * Instead of a single manager/below-manager threshold,
 * each position group gets its own adjusted weight (%).
 * Config is stored per bonus year.
 *
 * Backend model: ObjectiveAdjustedWeightConfig
 * We store one record per bonus year, but extend the usage
 * by saving a JSON map { position_group_id: weight_pct } in a
 * custom field OR we create one config per position group.
 *
 * Since the current model only has two fields
 * (weight_manager_and_above / weight_below_manager + threshold),
 * we use the "per position group" approach by creating/updating
 * one ObjectiveAdjustedWeightConfig per position group stored
 * via the existing endpoint — keyed by manager_threshold_level === pg.hierarchy_level
 * and setting both fields to the same value (the per-group weight).
 *
 * If your backend already supports per-group weights in a JSON field,
 * just swap the save/load logic accordingly.
 */
import { useState, useEffect } from "react";
import { objectiveWeightConfigService } from "@/services/bonusService";
import { bonusPositionConfigService } from "@/services/bonusService";
import { Info, Save } from "lucide-react";

export default function ObjectiveWeightTab({ bonusYear, dark }) {
  // rows: [{ position_group_id, position_group_name, hierarchy_level,
  //          grading_shorthand, weight, config_id }]
  const [rows, setRows]     = useState([]);
  const [edited, setEdited] = useState({});   // pg_id → value
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const input = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white focus:border-almet-steel-blue"
    : "bg-white border-gray-300 text-gray-900 focus:border-almet-sapphire";
  const card  = dark ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-gray-50 border-gray-200";

  const load = async () => {
    setLoading(true);
    try {
      // 1. All position groups with their bonus configs
      const { data: pgData } = await bonusPositionConfigService.withGroups();
      const groups = Array.isArray(pgData) ? pgData : [];

      // 2. Existing objective weight configs for this bonus year
      const { data: cfgData } = await objectiveWeightConfigService.list();
      const cfgList = Array.isArray(cfgData) ? cfgData : (cfgData.results ?? []);
      const yearCfgs = cfgList.filter((c) => c.bonus_year === bonusYear.id);

      // Map: hierarchy_level → config (we use hierarchy_level as the key)
      const cfgByLevel = {};
      yearCfgs.forEach((c) => { cfgByLevel[c.manager_threshold_level] = c; });

      const built = groups.map((pg) => {
        const cfg = cfgByLevel[pg.hierarchy_level];
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

  const handleSave = async (row) => {
    setSaving(row.position_group_id);
    try {
      const weight = edited[row.position_group_id];
      const payload = {
        bonus_year:               bonusYear.id,
        manager_threshold_level:  row.hierarchy_level,
        weight_manager_and_above: weight,
        weight_below_manager:     weight,   // same value — per-group logic
        is_active:                true,
      };
      if (row.config_id) {
        await objectiveWeightConfigService.update(row.config_id, payload);
      } else {
        await objectiveWeightConfigService.create(payload);
      }
      await load();
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving("all");
    try {
      await Promise.all(rows.map((row) => handleSaveRow(row)));
      await load();
    } finally {
      setSaving(null);
    }
  };

  // internal helper (no state mutation, just API)
  const handleSaveRow = async (row) => {
    const weight = edited[row.position_group_id];
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

  const anyDirty = rows.some(
    (r) => String(edited[r.position_group_id]) !== String(r.weight)
  );

  return (
    <div className="max-w-2xl">
      <h2 className={`text-base font-semibold mb-1 ${text}`}>Objective Adjusted Weight</h2>
      <p className={`text-sm mb-4 ${sub}`}>
        Set the adjusted weight multiplier for each position group.
        Individual objective weights are multiplied by this percentage to calculate the bonus.
      </p>

      {/* Info box */}
      <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border mb-5
        ${dark
          ? "bg-almet-cloud-burst/20 border-almet-cloud-burst/30 text-almet-bali-hai"
          : "bg-almet-mystic border-almet-sapphire/20 text-almet-comet"}`}>
        <Info size={14} className="mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed">
          <b>Example:</b> If an employee has an objective with <b>30%</b> weight and their
          position group multiplier is <b>50%</b>, the effective weight becomes <b>15%</b>.
          Bonus = Salary × 15% × Rating%.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className={`rounded-xl border overflow-hidden mb-4
            ${dark ? "border-[#1f1f1f]" : "border-gray-200"}`}>
            {/* Header */}
            <div className={`grid grid-cols-[auto_1fr_180px_80px] items-center px-4 py-2.5 text-xs font-medium
              ${dark ? "bg-[#0a0a0a] border-b border-[#1f1f1f] text-gray-500" : "bg-gray-100 border-b border-gray-200 text-gray-500"}`}>
              <span className="w-10">Level</span>
              <span>Position Group</span>
              <span className="text-center">Adjusted Weight (%)</span>
              <span className="text-center">Action</span>
            </div>

            {rows.map((row, idx) => {
              const val      = edited[row.position_group_id] ?? "";
              const isDirty  = String(val) !== String(row.weight);
              const isSaving = saving === row.position_group_id;

              return (
                <div
                  key={row.position_group_id}
                  className={`grid grid-cols-[auto_1fr_180px_80px] items-center px-4 py-3 border-t transition
                    ${dark ? "border-[#1a1a1a] hover:bg-[#0f0f0f]" : "border-gray-100 hover:bg-gray-50"}`}
                >
                  {/* Level badge */}
                  <span className={`w-10 text-xs font-bold px-1.5 py-0.5 rounded-lg text-center mr-3
                    ${dark ? "bg-almet-cloud-burst text-almet-bali-hai" : "bg-almet-mystic text-almet-sapphire"}`}>
                    L{row.hierarchy_level}
                  </span>

                  {/* Name */}
                  <div>
                    <p className={`text-sm font-medium ${text}`}>{row.position_group_name}</p>
                    {row.grading_shorthand && (
                      <p className={`text-xs ${sub}`}>{row.grading_shorthand}</p>
                    )}
                  </div>

                  {/* Weight input */}
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="relative w-28">
                      <input
                        type="number" min={0} max={100} step={1}
                        placeholder="e.g. 50"
                        value={val}
                        onChange={(e) =>
                          setEdited((prev) => ({
                            ...prev,
                            [row.position_group_id]: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm text-center outline-none transition pr-7 ${input}`}
                      />
                      <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${sub}`}>%</span>
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleSave(row)}
                      disabled={!isDirty || isSaving}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition
                        ${isDirty
                          ? "bg-almet-sapphire hover:bg-almet-cloud-burst text-white"
                          : dark ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        } disabled:opacity-50`}
                    >
                      <Save size={11} />
                      {isSaving ? "…" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save All button */}
          {anyDirty && (
            <button
              onClick={handleSaveAll}
              disabled={saving === "all"}
              className="w-full py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white
                text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Save size={14} />
              {saving === "all" ? "Saving all…" : "Save All Changes"}
            </button>
          )}
        </>
      )}
    </div>
  );
}