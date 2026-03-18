"use client";
import { useState, useEffect } from "react";
import { bonusEvalScaleService } from "@/services/bonusService";
import { TrendingUp, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";

export default function EvalScaleTab({ dark, bonusYear }) {
  const { showSuccess, showError } = useToast();

  const [scales,  setScales]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [edited,  setEdited]  = useState({});
  const [saving,  setSaving]  = useState(null);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/60"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const loadScales = () => {
    setLoading(true);
    bonusEvalScaleService.list()
      .then((res) => {
        const list = res?.data?.results ?? res?.data ?? [];
        setScales(list);
        const init = {};
        list.forEach((s) => { init[s.id] = s.bonus_salary_pct ?? ""; });
        setEdited(init);
      })
      .catch(() => showError("Failed to load evaluation scales."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadScales(); }, []);

  const handleSave = async (scale) => {
    setSaving(scale.id);
    try {
      await bonusEvalScaleService.update(scale.id, {
        bonus_salary_pct: edited[scale.id] !== "" ? parseFloat(edited[scale.id]) : null,
      });
      await loadScales();
      showSuccess(`"${scale.name}" bonus % saved.`);
    } catch {
      showError("Failed to save bonus percentage.");
    } finally {
      setSaving(null);
    }
  };

  const ratingTheme = (max) => {
    if (max >= 120) return { badge: dark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" };
    if (max >= 100) return { badge: dark ? "bg-sky-500/15 text-sky-300 border-sky-500/20"             : "bg-sky-50 text-sky-700 border-sky-200",             bar: "bg-sky-500"     };
    if (max >= 80)  return { badge: dark ? "bg-amber-500/15 text-amber-300 border-amber-500/20"       : "bg-amber-50 text-amber-700 border-amber-200",       bar: "bg-amber-400"   };
    if (max >= 50)  return { badge: dark ? "bg-orange-500/15 text-orange-300 border-orange-500/20"    : "bg-orange-50 text-orange-700 border-orange-200",    bar: "bg-orange-500"  };
    return                  { badge: dark ? "bg-rose-500/15 text-rose-300 border-rose-500/20"         : "bg-rose-50 text-rose-700 border-rose-200",           bar: "bg-rose-500"    };
  };

  if (loading) return <LoadingSpinner message="Loading evaluation scales…" />;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${dark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
          <TrendingUp size={18} className="text-amber-400" />
        </div>
        <div>
          <h2 className={`text-base font-bold tracking-tight ${text}`}>Evaluation Scale</h2>
          <p className={`text-xs mt-1 ${sub}`}>
            Set the <b>% of Yearly Salary</b> for each rating — the key bonus multiplier.
          </p>
        </div>
      </div>

      {/* ── Scale rows ── */}
      <div className="space-y-2.5">
        {scales.map((s) => {
          const theme    = ratingTheme(s.range_max);
          const val      = edited[s.id] ?? "";
          const isDirty  = String(val) !== String(s.bonus_salary_pct ?? "");
          const isSaving = saving === s.id;
          const barWidth = Math.min(((parseFloat(val) || 0) / 150) * 100, 100);

          return (
            <div
              key={s.id}
              className={`flex justify-between gap-5 px-5 py-3 rounded-2xl border transition-all
                ${isDirty
                  ? dark ? "border-almet-steel-blue/30 bg-almet-sapphire/5" : "border-almet-sapphire/30 bg-almet-mystic"
                  : dark ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]" : "border-gray-200 bg-gray-50 hover:bg-white"
                }`}
            >
              {/* Rating badge + range */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-xl text-sm font-black border w-24 text-center shrink-0 ${theme.badge}`}>
                  {s.name}
                </span>
                <span className={`text-xs ${muted}`}>
                  {s.range_min}–{s.range_max}%
                </span>
              </div>

              {/* % of Yearly Salary — editable */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-end gap-1 w-28">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>
                    % of Yearly Salary
                  </span>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-200"}`}>
                    <div
                      className={`h-full rounded-full transition-all ${theme.bar}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number" min={0} max={200} step={0.5}
                    placeholder="—"
                    value={val}
                    onChange={(e) => setEdited((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    className={`w-24 px-3 py-2 pr-7 rounded-xl border text-sm text-center outline-none transition
                      ${isDirty ? (dark ? "border-almet-steel-blue/50" : "border-almet-sapphire/50") : ""}
                      ${inp}`}
                  />
                  <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${muted}`}>%</span>
                </div>

                <button
                  onClick={() => handleSave(s)}
                  disabled={!isDirty || isSaving}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all
                    ${isDirty
                      ? "bg-almet-sapphire hover:bg-almet-cloud-burst text-white shadow-lg shadow-almet-sapphire/20 hover:-translate-y-0.5"
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

        {scales.length === 0 && (
          <div className={`text-center py-16 rounded-2xl border-2 border-dashed
            ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
            <TrendingUp size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No evaluation scales found</p>
            <p className="text-xs mt-1 opacity-70">Configure them in Performance Settings</p>
          </div>
        )}
      </div>

      {/* ── Formula reference ── */}
      {scales.length > 0 && (
        <div className={`mt-6 p-5 rounded-2xl border ${dark ? "bg-white/[0.02] border-white/[0.06]" : "bg-gray-50 border-gray-200"}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${muted}`}>
            How bonus is calculated
          </p>
          <div className="space-y-2">
            {[
              { label: "Company Targets", formula: "Salary × Target Weight%  × (Yearly Salary% ÷ 100)" },
              { label: "Objectives",      formula: "Salary × Adjusted Weight% × (Yearly Salary% ÷ 100)" },
              { label: "Competencies",    formula: "Salary × Group Weight%    × (Yearly Salary% ÷ 100)" },
            ].map(({ label, formula }) => (
              <div key={label} className="flex items-baseline gap-3">
                <span className={`text-[11px] font-bold w-28 shrink-0 ${sub}`}>{label}</span>
                <span className={`text-[11px] font-mono ${muted}`}>{formula}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}