"use client";
import { useState, useEffect } from "react";
import { evaluationScaleService } from "@/services/performanceService";
import { Info, TrendingUp, Save } from "lucide-react";

export default function EvalScaleTab({ dark, bonusYear }) {
  const [scales, setScales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [edited, setEdited]   = useState({});   // scale.id → bonus_salary_pct value
  const [saving, setSaving]   = useState(null);

  const text    = dark ? "text-white"    : "text-gray-900";
  const sub     = dark ? "text-[#90a0b9]": "text-almet-comet";
  const border  = dark ? "border-[#1e2640]" : "border-gray-200";
  const rowHov  = dark ? "hover:bg-[#0f1526]" : "hover:bg-[#f8f9fc]";
  const headBg  = dark ? "bg-[#080b14] text-[#90a0b9]" : "bg-[#f5f7fb] text-almet-comet";
  const inputCls = dark
    ? "bg-[#131929] border-[#1e2640] text-white focus:border-almet-steel-blue"
    : "bg-white border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const loadScales = () => {
    setLoading(true);
    evaluationScaleService.list()
      .then((res) => {
        const list = res?.results ?? res ?? [];
        setScales(list);
        const init = {};
        list.forEach(s => { init[s.id] = s.bonus_salary_pct ?? ""; });
        setEdited(init);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadScales(); }, []);

  const handleSave = async (scale) => {
    setSaving(scale.id);
    try {
      await evaluationScaleService.update(scale.id, {
        bonus_salary_pct: edited[scale.id] !== "" ? parseFloat(edited[scale.id]) : null,
      });
      await loadScales();
    } finally {
      setSaving(null);
    }
  };

  const ratingBadge = (max) => {
    if (max >= 120) return { bg: dark ? "bg-green-500/15 text-green-400"  : "bg-green-50 text-green-700",  bar: "bg-green-500"  };
    if (max >= 100) return { bg: dark ? "bg-blue-500/15 text-blue-400"    : "bg-blue-50 text-blue-700",    bar: "bg-blue-500"   };
    if (max >= 80)  return { bg: dark ? "bg-yellow-500/15 text-yellow-400": "bg-yellow-50 text-yellow-700",bar: "bg-yellow-500" };
    if (max >= 50)  return { bg: dark ? "bg-orange-500/15 text-orange-400": "bg-orange-50 text-orange-700",bar: "bg-orange-500" };
    return                  { bg: dark ? "bg-red-500/15 text-red-400"     : "bg-red-50 text-red-700",      bar: "bg-red-500"    };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className={`p-2 rounded-lg shrink-0 ${dark ? "bg-almet-sapphire/20" : "bg-almet-mystic"}`}>
          <TrendingUp size={15} className="text-almet-steel-blue" />
        </div>
        <div>
          <h2 className={`text-sm font-semibold ${text}`}>Evaluation Scale — Bonus Impact</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>
            Rating scales from Performance Settings. Set the <b>% of Yearly Salary</b> column
            used in bonus calculation per rating.
          </p>
        </div>
      </div>

      {/* Info */}
      <div className={`flex items-start gap-2.5 p-3 rounded-lg mb-5 border
        ${dark ? "bg-almet-sapphire/10 border-almet-sapphire/20 text-[#90a0b9]"
               : "bg-almet-mystic border-almet-sapphire/20 text-almet-comet"}`}>
        <Info size={13} className="mt-0.5 shrink-0 text-almet-steel-blue" />
        <p className="text-xs leading-relaxed">
          <b>Range Min / Range Max</b> are managed in <b>Performance → Settings → Evaluation Scales</b>.
          Only the <b>% of Yearly Salary</b> column is editable here — this value is used as the
          bonus multiplier for each rating level.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className={`rounded-xl border overflow-hidden ${border}`}>
            {/* Header row */}
            <div className={`grid text-xs font-semibold uppercase tracking-wide px-4 py-3 border-b ${border} ${headBg}`}
              style={{ gridTemplateColumns: "180px 110px 110px 1fr 90px" }}>
              <span>Rating</span>
              <span className="text-center">Range Min</span>
              <span className="text-center">Range Max</span>
              <span className="text-center">% of Yearly Salary</span>
              <span className="text-center">Save</span>
            </div>

            {scales.map((s) => {
              const style   = ratingBadge(s.range_max);
              const val     = edited[s.id] ?? "";
              const isDirty = String(val) !== String(s.bonus_salary_pct ?? "");
              const isSaving = saving === s.id;

              return (
                <div
                  key={s.id}
                  className={`grid items-center px-4 py-3 border-t transition ${border} ${rowHov}`}
                  style={{ gridTemplateColumns: "180px 110px 110px 1fr 90px" }}
                >
                  {/* Rating name */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg}`}>
                      {s.name}
                    </span>
                    {s.description && (
                      <span className={`text-xs truncate max-w-[80px] ${sub}`}>{s.description}</span>
                    )}
                  </div>

                  {/* Range min */}
                  <div className="flex items-center justify-center">
                    <span className={`text-sm ${sub}`}>{s.range_min}%</span>
                  </div>

                  {/* Range max */}
                  <div className="flex items-center justify-center">
                    <span className={`text-sm font-semibold ${text}`}>{s.range_max}%</span>
                  </div>

                  {/* Bonus salary pct — editable */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Visual bar behind */}
                    <div className="flex items-center gap-2">
                      <div className={`w-20 h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#1e2640]" : "bg-gray-200"}`}>
                        <div
                          className={`h-full rounded-full transition-all ${style.bar}`}
                          style={{ width: `${Math.min(((parseFloat(val) || 0) / 150) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          step={0.5}
                          placeholder="—"
                          value={val}
                          onChange={(e) => setEdited(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className={`w-20 px-2 py-1.5 pr-6 rounded-lg border text-xs text-center outline-none transition ${inputCls}
                            ${isDirty ? (dark ? "border-almet-steel-blue/60" : "border-almet-sapphire/60") : ""}`}
                        />
                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${sub}`}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleSave(s)}
                      disabled={!isDirty || isSaving}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition
                        ${isDirty
                          ? "bg-almet-sapphire hover:bg-almet-cloud-burst text-white"
                          : dark ? "bg-[#131929] text-[#3a4560] cursor-not-allowed" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                        } disabled:opacity-60`}
                    >
                      <Save size={10} />
                      {isSaving ? "…" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}

            {scales.length === 0 && (
              <div className={`text-center py-12 text-sm ${sub}`}>
                No evaluation scales found. Configure them in Performance Settings.
              </div>
            )}
          </div>

          {/* Formula reference */}
          {scales.length > 0 && (
            <div className={`mt-4 p-4 rounded-xl border ${dark ? "bg-[#0a0e1a] border-[#1e2640]" : "bg-[#f5f7fb] border-gray-200"}`}>
              <p className={`text-xs font-semibold mb-2 ${text}`}>Bonus Calculation Formula</p>
              <div className="space-y-1">
                {[
                  "Company Targets   →  Salary × Target Weight%  × (Bonus Salary% / 100)",
                  "Objectives        →  Salary × Adjusted Weight% × (Bonus Salary% / 100)",
                  "Competencies      →  Salary × Group Weight%    × (Bonus Salary% / 100)",
                ].map((line) => (
                  <p key={line} className={`text-[11px] font-mono ${sub}`}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}