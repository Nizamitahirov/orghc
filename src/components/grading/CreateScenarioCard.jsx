import React from "react";
import { Plus, Target, Settings, CheckCircle, AlertTriangle, RefreshCw, Save, DollarSign } from "lucide-react";

const safe = (v, def = 0) => {
  if (v === null || v === undefined || v === "") return def;
  const p = parseFloat(v); return isNaN(p) ? def : p;
};
const fmt = (v) => (v || 0).toLocaleString();

const currencyBadgeCls = (code) => {
  const m = {
    AZN: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    USD: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    EUR: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    GBP: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    RUB: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    TRY: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  };
  return m[code] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
};

/* ─── Reusable field wrapper ─────────────────────────────────────────────── */
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-[11px] font-medium text-almet-waterloo dark:text-gray-400 mb-1">{label}</label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
        <AlertTriangle size={10} />{error}
      </p>
    )}
  </div>
);

const inputCls = (err) =>
  `w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white
   placeholder-almet-bali-hai dark:placeholder-gray-500
   focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 focus:border-almet-sapphire transition-all ${
    err ? "border-red-400 dark:border-red-600" : "border-almet-mystic dark:border-gray-600"
  }`;

/* ─── Section block ──────────────────────────────────────────────────────── */
const Block = ({ step, title, sub, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic dark:border-gray-700 overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/20 dark:bg-gray-700/20">
      {step && (
        <span className="w-5 h-5 rounded-md bg-almet-sapphire text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
      )}
      <div>
        <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{title}</p>
        {sub && <p className="text-[10px] text-almet-waterloo dark:text-gray-400">{sub}</p>}
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const CreateScenarioCard = ({
  scenarioInputs, newScenarioDisplayData, basePositionName,
  validationSummary, errors, loading, isCalculating,
  handleBaseValueChange, handleVerticalChange, handleGlobalHorizontalChange,
  handleSaveDraft, handleCurrencyChange, currencies,
  scenarioName, onScenarioNameChange,
}) => {
  const cur = scenarioInputs.currency || "AZN";

  return (
    <div className="space-y-4">

      {/* ── Step 1: Basic Info ───────────────────────────────────────────────── */}
      <Block step="1" title="Basic Information" sub="Name, base value and currency for this scenario">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Scenario Name">
            <input
              type="text"
              value={scenarioName}
              onChange={e => onScenarioNameChange(e.target.value)}
              className={inputCls(false)}
              placeholder="e.g. Q1 2025 Adjustment"
            />
            <p className="text-[10px] text-almet-waterloo dark:text-gray-500 mt-1">Leave empty for auto-generated name</p>
          </Field>

          <Field label={`Base Value — ${basePositionName || "Reference"}`} error={errors.baseValue1}>
            <input
              type="number"
              value={scenarioInputs.baseValue1 || ""}
              onChange={e => handleBaseValueChange(e.target.value)}
              className={inputCls(!!errors.baseValue1)}
              placeholder="Enter base salary"
            />
          </Field>

          <Field label="Currency">
            <select
              value={cur}
              onChange={e => handleCurrencyChange(e.target.value)}
              className={inputCls(false)}
            >
              {(currencies || []).map(({ code, label }) => (
                <option key={code} value={code}>{code} — {label}</option>
              ))}
            </select>
            <p className="text-[10px] text-almet-waterloo dark:text-gray-500 mt-1 flex items-center gap-1">
              All values will be in
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${currencyBadgeCls(cur)}`}>{cur}</span>
            </p>
          </Field>
        </div>
      </Block>

      {/* ── Step 2: Horizontal Intervals ─────────────────────────────────────── */}
      <Block step="2" title="Global Horizontal Intervals" sub="Percentage spread between salary bands within each grade">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "LD_to_LQ", label: "LD → LQ" },
            { key: "LQ_to_M",  label: "LQ → Median" },
            { key: "M_to_UQ",  label: "Median → UQ" },
            { key: "UQ_to_UD", label: "UQ → UD" },
          ].map(({ key, label }) => {
            const ek = `global-horizontal-${key}`;
            return (
              <Field key={key} label={label} error={errors[ek]}>
                <div className="relative">
                  <input
                    type="number"
                    value={scenarioInputs.globalHorizontalIntervals?.[key] || ""}
                    onChange={e => handleGlobalHorizontalChange(key, e.target.value)}
                    className={`${inputCls(!!errors[ek])} pr-7 text-center`}
                    placeholder="0" min="0" max="100" step="0.1"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-almet-waterloo dark:text-gray-400 pointer-events-none">%</span>
                </div>
              </Field>
            );
          })}
        </div>
      </Block>

      {/* ── Step 3: Grade Vertical Inputs + Live Preview ─────────────────────── */}
      <Block
        step="3"
        title="Grade Breakdown"
        sub="Set vertical % per grade and review the calculated salary values"
      >
        <div className="flex items-center justify-between mb-3">
          {isCalculating && (
            <div className="flex items-center gap-1.5 text-[11px] text-almet-waterloo dark:text-gray-400">
              <RefreshCw size={11} className="animate-spin text-almet-sapphire" />
              Recalculating…
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {newScenarioDisplayData?.calculationProgress && (
              <span className="text-[10px] bg-almet-mystic dark:bg-gray-700 text-almet-waterloo dark:text-gray-400 px-2 py-1 rounded-md">
                {newScenarioDisplayData.calculationProgress.calculatedPositions}/
                {newScenarioDisplayData.calculationProgress.totalPositions} grades
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${currencyBadgeCls(cur)}`}>{cur}</span>
          </div>
        </div>

        {newScenarioDisplayData ? (
          <div className="rounded-lg border border-almet-mystic dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral text-white">
                    <th className="px-3 py-2.5 text-left font-medium">Grade</th>
                    <th className="px-3 py-2.5 text-center font-medium">Vertical %</th>
                    <th className="px-3 py-2.5 text-center font-medium">Status</th>
                    {["LD", "LQ", "Median", "UQ", "UD"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-right font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
                  {newScenarioDisplayData.gradeOrder.map((name, idx) => {
                    const gd     = newScenarioDisplayData.grades[name] || {};
                    const isBase = name === basePositionName;
                    const isTop  = idx === 0;
                    const ek     = `vertical-${name}`;
                    const ldVal  = isBase && scenarioInputs.baseValue1 > 0
                      ? Math.round(parseFloat(scenarioInputs.baseValue1))
                      : safe(gd.LD);

                    return (
                      <tr key={name} className={`hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors ${isBase ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}>
                        {/* Grade name */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isTop ? "bg-red-500" : isBase ? "bg-almet-sapphire" : "bg-almet-bali-hai dark:bg-gray-500"}`} />
                            <span className="font-medium text-almet-cloud-burst dark:text-white">{name}</span>
                            {isBase && <Target size={9} className="text-almet-sapphire" />}
                          </div>
                        </td>

                        {/* Vertical input */}
                        <td className="px-3 py-2.5 text-center">
                          {isBase ? (
                            <span className="text-almet-waterloo dark:text-gray-400 italic">Base</span>
                          ) : (
                            <div className="relative inline-block">
                              <input
                                type="number"
                                value={gd.vertical || ""}
                                onChange={e => handleVerticalChange(name, e.target.value)}
                                className={`w-16 px-2 py-1 text-xs border rounded-md text-center bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire transition-all ${errors[ek] ? "border-red-400" : "border-almet-mystic dark:border-gray-600"}`}
                                placeholder="0" min="0" max="100" step="0.1"
                              />
                              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-almet-waterloo pointer-events-none">%</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5 text-center">
                          {gd.isCalculated
                            ? <CheckCircle size={12} className="text-emerald-500 mx-auto" />
                            : isBase && scenarioInputs.baseValue1 > 0
                              ? <Target size={12} className="text-almet-sapphire mx-auto" />
                              : <span className="w-2 h-2 bg-almet-bali-hai dark:bg-gray-500 rounded-full inline-block" />
                          }
                        </td>

                        {/* LD LQ M UQ UD values */}
                        {["LD", "LQ", "M", "UQ", "UD"].map(lv => {
                          const val = lv === "LD" ? ldVal : safe(gd[lv]);
                          return (
                            <td key={lv} className="px-3 py-2.5 text-right font-mono">
                              {val > 0 ? (
                                <span className={`${
                                  isBase
                                    ? "text-almet-sapphire font-semibold"
                                    : gd.isCalculated
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-almet-waterloo dark:text-gray-400"
                                }`}>
                                  {fmt(val)}
                                  {lv === "LD" && isBase && scenarioInputs.baseValue1 > 0 && !gd.isCalculated && (
                                    <span className="ml-1 text-[9px] text-almet-sapphire">(input)</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-almet-bali-hai dark:text-gray-500">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[11px] text-almet-waterloo dark:text-gray-500">
            Enter a base value above to see the grade breakdown
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end mt-4 pt-4 border-t border-almet-mystic dark:border-gray-700">
          <button
            onClick={handleSaveDraft}
            disabled={!validationSummary?.canSave || loading.saving}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
              validationSummary?.canSave && !loading.saving
                ? "bg-almet-sapphire text-white hover:bg-almet-astral shadow-sm"
                : "bg-almet-mystic dark:bg-gray-700 text-almet-bali-hai dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading.saving
              ? <><RefreshCw size={13} className="animate-spin" />Saving…</>
              : <><Save size={13} />Save Draft</>
            }
          </button>
        </div>
      </Block>
    </div>
  );
};

export default CreateScenarioCard;