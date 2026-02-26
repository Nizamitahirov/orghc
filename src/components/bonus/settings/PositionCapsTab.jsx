

// ─── PositionCapsTab.jsx ──────────────────────────────────────
// components/bonus/settings/PositionCapsTab.jsx
import { useState, useEffect } from "react";
import { bonusPositionConfigService } from "@/services/bonusService";
import { Save, ShieldCheck } from "lucide-react";

export default function PositionCapsTab({ dark }) {
  const [rows, setRows]     = useState([]);
  const [saving, setSaving] = useState(null);

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const card  = dark ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-gray-50 border-gray-200";
  const input = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white focus:border-almet-steel-blue"
    : "bg-white border-gray-300 text-gray-900 focus:border-almet-sapphire";

  useEffect(() => {
    bonusPositionConfigService.withGroups().then(({ data }) =>
      setRows(data.map((r) => ({ ...r, _weight: r.max_total_weight ?? "" })))
    );
  }, []);

  const handleSave = async (row) => {
    setSaving(row.position_group_id);
    try {
      if (row.config_id) {
        await bonusPositionConfigService.update(row.config_id, { max_total_weight: row._weight });
      } else {
        await bonusPositionConfigService.create({ position_group: row.position_group_id, max_total_weight: row._weight });
      }
      const { data } = await bonusPositionConfigService.withGroups();
      setRows(data.map((r) => ({ ...r, _weight: r.max_total_weight ?? "" })));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="flex items-start gap-3 mb-5">
        <div className={`p-2 rounded-lg shrink-0 ${dark ? "bg-almet-sapphire/20" : "bg-blue-50"}`}>
          <ShieldCheck size={16} className="text-almet-steel-blue" />
        </div>
        <div>
          <h2 className={`text-base font-semibold ${text}`}>Position Group Bonus Caps</h2>
          <p className={`text-sm mt-0.5 ${sub}`}>
            Maximum total weight of all company targets for each position group.
            e.g. Junior → 14%, Manager+ → 40%.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const isDirty = String(row._weight) !== String(row.max_total_weight ?? "");
          return (
            <div key={row.position_group_id}
              className={`flex items-center gap-4 p-4 rounded-xl border ${card}`}>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0
                ${dark ? "bg-almet-cloud-burst text-almet-bali-hai" : "bg-almet-mystic text-almet-sapphire"}`}>
                L{row.hierarchy_level}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${text}`}>{row.position_group_name}</p>
                {row.grading_shorthand && <p className={`text-xs ${sub}`}>{row.grading_shorthand}</p>}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="number" min={0} max={100} step={0.5}
                    value={row._weight}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.position_group_id === row.position_group_id
                            ? { ...r, _weight: e.target.value }
                            : r
                        )
                      )
                    }
                    className={`w-24 px-3 py-2 rounded-lg border text-sm text-center outline-none transition ${input}`}
                  />
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${sub}`}>%</span>
                </div>
                <button
                  onClick={() => handleSave(row)}
                  disabled={saving === row.position_group_id || !isDirty}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition
                    ${isDirty
                      ? "bg-almet-sapphire hover:bg-almet-cloud-burst text-white"
                      : dark ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    } disabled:opacity-50`}
                >
                  <Save size={12} />
                  {saving === row.position_group_id ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className={`text-center py-12 text-sm ${sub}`}>No position groups found.</p>
        )}
      </div>
    </div>
  );
}

