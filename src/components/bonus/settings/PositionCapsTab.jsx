"use client";
import { useState, useEffect } from "react";
import { bonusPositionConfigService } from "@/services/bonusService";
import { Save, ShieldCheck } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";

export default function PositionCapsTab({ dark }) {
  const { showSuccess, showError } = useToast();

  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/60"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const tierColor = (level) => {
    const map = {
      1: { dot: "bg-rose-400",    badge: dark ? "bg-rose-500/10 text-rose-400 border-rose-500/20"       : "bg-rose-50 text-rose-600 border-rose-200"       },
      2: { dot: "bg-orange-400",  badge: dark ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-orange-50 text-orange-600 border-orange-200"  },
      3: { dot: "bg-amber-400",   badge: dark ? "bg-amber-500/10 text-amber-400 border-amber-500/20"    : "bg-amber-50 text-amber-600 border-amber-200"     },
      4: { dot: "bg-emerald-400", badge: dark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-emerald-50 text-emerald-600 border-emerald-200"},
      5: { dot: "bg-sky-400",     badge: dark ? "bg-sky-500/10 text-sky-400 border-sky-500/20"          : "bg-sky-50 text-sky-600 border-sky-200"           },
      6: { dot: "bg-violet-400",  badge: dark ? "bg-violet-500/10 text-violet-400 border-violet-500/20" : "bg-violet-50 text-violet-600 border-violet-200"  },
    };
    return map[level] || { dot: "bg-gray-400", badge: dark ? "bg-gray-500/10 text-gray-400 border-gray-500/20" : "bg-gray-100 text-gray-600 border-gray-200" };
  };

  const loadRows = () => {
    setLoading(true);
    bonusPositionConfigService.withGroups()
      .then(({ data }) =>
        setRows(data.map((r) => ({ ...r, _weight: r.max_total_weight ?? "" })))
      )
      .catch(() => showError("Failed to load position groups."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRows(); }, []);

  const handleSave = async (row) => {
    setSaving(row.position_group_id);
    try {
      if (row.config_id) {
        await bonusPositionConfigService.update(row.config_id, { max_total_weight: row._weight });
      } else {
        await bonusPositionConfigService.create({ position_group: row.position_group_id, max_total_weight: row._weight });
      }
      await new Promise((res) => {
        bonusPositionConfigService.withGroups().then(({ data }) => {
          setRows(data.map((r) => ({ ...r, _weight: r.max_total_weight ?? "" })));
          res();
        });
      });
      showSuccess(`Cap saved for ${row.position_group_name}.`);
    } catch {
      showError("Failed to save cap.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading position groups…" />;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${dark ? "bg-sky-500/10 border border-sky-500/20" : "bg-sky-50 border border-sky-200"}`}>
          <ShieldCheck size={18} className="text-sky-400" />
        </div>
        <div>
          <h2 className={`text-base font-bold tracking-tight ${text}`}>Company Targets Percentage</h2>
          <p className={`text-xs mt-1 ${sub}`}>
            Set the maximum total company target weight for each position level.
            These caps prevent over-allocation of bonus weight.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className={`text-center py-16 text-sm ${muted}`}>No position groups found.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((row) => {
            const isDirty  = String(row._weight) !== String(row.max_total_weight ?? "");
            const isSaving = saving === row.position_group_id;
            const tier     = tierColor(row.hierarchy_level);
            const pct      = Math.min(((parseFloat(row._weight) || 0) / 100) * 100, 100);

            return (
              <div
                key={row.position_group_id}
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all
                  ${isDirty
                    ? dark ? "border-almet-steel-blue/30 bg-almet-sapphire/5" : "border-almet-sapphire/30 bg-almet-mystic"
                    : dark ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]" : "border-gray-200 bg-gray-50 hover:bg-white"
                  }`}
              >
                {/* Level badge */}
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${tier.dot}`} />
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${tier.badge}`}>
                    L{row.hierarchy_level}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${text}`}>{row.position_group_name}</p>
               
                </div>

                {/* Progress + Input */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end gap-1 w-32">
                  
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-200"}`}>
                      <div
                        className={`h-full rounded-full transition-all ${tier.dot}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

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
                      className={`w-20 px-3 py-1.5 pr-6 rounded-xl border text-xs text-center outline-none transition
                        ${isDirty ? (dark ? "border-almet-steel-blue/50" : "border-almet-sapphire/50") : ""}
                        ${inp}`}
                    />
                    <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${muted}`}>%</span>
                  </div>

                  <button
                    onClick={() => handleSave(row)}
                    disabled={isSaving || !isDirty}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all
                      ${isDirty
                        ? "bg-almet-sapphire hover:bg-almet-cloud-burst text-white shadow-lg shadow-almet-sapphire/20 hover:-translate-y-0.5"
                        : dark ? "bg-white/[0.04] text-gray-700 cursor-not-allowed" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      } disabled:opacity-50 disabled:transform-none`}
                  >
                    <Save size={11} />
                    {isSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}