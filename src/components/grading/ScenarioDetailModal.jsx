import React from "react";
import { X, Target, Settings, CheckCircle, Archive, RefreshCw, Info } from "lucide-react";

const fmt    = (v)       => (v || 0).toLocaleString();
const fmtPct = (v, d=1)  => `${((v || 0) * 100).toFixed(d)}%`;
const safe   = (v, def=0) => { if (v == null || v === "") return def; const p = parseFloat(v); return isNaN(p) ? def : p; };

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

/* ─── Metric tile ─────────────────────────────────────────────────────────── */
const MetricTile = ({ label, value, sub, isCurrent }) => (
  <div className={`text-center p-3.5 rounded-xl border ${
    isCurrent
      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
      : "bg-almet-mystic/30 dark:bg-gray-700/30 border-almet-mystic dark:border-gray-600"
  }`}>
    <p className={`text-base font-bold mb-0.5 ${isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-almet-sapphire dark:text-almet-sapphire"}`}>
      {value}
    </p>
    <p className="text-[11px] font-medium text-almet-cloud-burst dark:text-white">{label}</p>
    {sub && <p className="text-[10px] text-almet-waterloo dark:text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const ScenarioDetailModal = ({
  isOpen, onClose, selectedScenario, compareMode, selectedForComparison,
  currentData, basePositionName, loading,
  getScenarioForComparison, getVerticalInputValue, getHorizontalInputValues,
  handleSaveAsCurrent, handleArchiveDraft,
}) => {
  if (!isOpen) return null;

  const isCompareView = compareMode && selectedForComparison.length >= 2;
  const title = isCompareView
    ? `Comparison — ${selectedForComparison.length} Scenarios`
    : selectedScenario?.name || "Scenario Details";

  const modalCurrency = selectedScenario?.currency || selectedScenario?.data?.currency;

  /* ── COMPARISON VIEW ──────────────────────────────────────────────────── */
  const renderComparisonView = () => (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {selectedForComparison.map(sid => {
          const cd = getScenarioForComparison(sid);
          if (!cd) return null;
          const { data, name, status, scenario } = cd;
          const currency    = scenario?.currency || data?.currency || "AZN";
          const isCurrent   = status === "current";
          const horizontalIvs = getHorizontalInputValues(sid);
          return (
            <div key={sid} className={`p-3.5 rounded-xl border ${
              isCurrent
                ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                : "bg-almet-mystic/20 dark:bg-gray-700/20 border-almet-mystic dark:border-gray-600"
            }`}>
              <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                {isCurrent && <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />}
                <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white truncate">{name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currencyBadgeCls(currency)}`}>{currency}</span>
              </div>
              <div className="space-y-1 text-[11px]">
                {[
                  { label: "Base",       value: `${fmt(data?.baseValue1)} ${currency}` },
                  { label: "Vertical",   value: fmtPct(data?.verticalAvg)  },
                  { label: "Horizontal", value: fmtPct(data?.horizontalAvg) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-almet-waterloo dark:text-gray-400">{label}</span>
                    <span className={`font-semibold ${isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-almet-sapphire"}`}>{value}</span>
                  </div>
                ))}
              </div>
              {/* Horizontal intervals */}
              {horizontalIvs && Object.values(horizontalIvs).some(v => safe(v) > 0) && (
                <div className="mt-2.5 pt-2.5 border-t border-almet-mystic dark:border-gray-600">
                  <p className="text-[9px] font-semibold text-almet-waterloo dark:text-gray-400 mb-1.5 flex items-center gap-1">
                    <Settings size={9} />Intervals
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(horizontalIvs).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-1 text-[10px]">
                        <span className="text-almet-waterloo dark:text-gray-400 truncate">{key.replace(/_to_/g, "→").replace(/_/g, " ")}</span>
                        <span className={`font-mono font-semibold flex-shrink-0 ${isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-almet-sapphire"}`}>{safe(value).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Median comparison table */}
      <div className="rounded-xl border border-almet-mystic dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/20 dark:bg-gray-700/20">
          <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Position Comparison (Median)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/10 dark:bg-gray-700/10">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-almet-waterloo dark:text-gray-400 uppercase tracking-wide">Grade</th>
                {selectedForComparison.map(sid => {
                  const cd = getScenarioForComparison(sid);
                  if (!cd) return null;
                  const currency = cd.scenario?.currency || cd.data?.currency || "AZN";
                  return (
                    <th key={sid} className="px-3 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-almet-waterloo dark:text-gray-400">
                          {cd.status === "current" && <CheckCircle size={9} className="text-emerald-500" />}
                          {cd.name}
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currencyBadgeCls(currency)}`}>{currency}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
              {(currentData?.gradeOrder || []).map((name, idx) => {
                const isBase = name === basePositionName;
                return (
                  <tr key={name} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${idx === 0 ? "bg-red-500" : isBase ? "bg-almet-sapphire" : "bg-almet-bali-hai dark:bg-gray-500"}`} />
                        <span className="font-medium text-almet-cloud-burst dark:text-white">{name}</span>
                        {isBase && <Target size={9} className="text-almet-sapphire" />}
                      </div>
                    </td>
                    {selectedForComparison.map(sid => {
                      const cd         = getScenarioForComparison(sid);
                      const gradeData  = cd?.data?.grades?.[name];
                      const vertInput  = getVerticalInputValue(sid, name);
                      const isCurrent  = cd?.status === "current";
                      return (
                        <td key={sid} className="px-3 py-2.5 text-center">
                          {gradeData ? (
                            <div>
                              <p className={`font-mono font-semibold ${isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-almet-sapphire"}`}>{fmt(gradeData.M)}</p>
                              {!isBase && vertInput != null && (
                                <p className="text-[9px] text-almet-waterloo dark:text-gray-400">V: {safe(vertInput).toFixed(1)}%</p>
                              )}
                            </div>
                          ) : <span className="text-almet-bali-hai dark:text-gray-500">—</span>}
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

      {/* Horizontal intervals table */}
      <div className="rounded-xl border border-almet-mystic dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/20 dark:bg-gray-700/20">
          <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Horizontal Intervals</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/10 dark:bg-gray-700/10">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-almet-waterloo dark:text-gray-400 uppercase tracking-wide">Interval</th>
                {selectedForComparison.map(sid => {
                  const cd = getScenarioForComparison(sid);
                  if (!cd) return null;
                  return (
                    <th key={sid} className="px-3 py-2.5 text-center text-[10px] font-semibold text-almet-waterloo dark:text-gray-400">
                      <div className="flex items-center justify-center gap-1">
                        {cd.status === "current" && <CheckCircle size={9} className="text-emerald-500" />}
                        {cd.name}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
              {["LD_to_LQ","LQ_to_M","M_to_UQ","UQ_to_UD"].map(key => (
                <tr key={key} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-2.5 font-medium text-almet-cloud-burst dark:text-white">
                    {key.replace(/_to_/g," → ").replace(/_/g," ")}
                  </td>
                  {selectedForComparison.map(sid => {
                    const ivs    = getHorizontalInputValues(sid);
                    const val    = ivs?.[key];
                    const cd     = getScenarioForComparison(sid);
                    const isCur  = cd?.status === "current";
                    return (
                      <td key={sid} className="px-3 py-2.5 text-center">
                        <span className={`font-mono font-semibold ${isCur ? "text-emerald-600 dark:text-emerald-400" : "text-almet-sapphire"}`}>
                          {safe(val).toFixed(1)}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ── DETAIL VIEW ──────────────────────────────────────────────────────── */
  const renderDetailView = () => {
    if (!selectedScenario) return (
      <div className="text-center py-14">
        <Info size={36} className="mx-auto text-almet-bali-hai dark:text-gray-400 mb-3" />
        <p className="text-sm font-medium text-almet-waterloo dark:text-gray-300">No Scenario Selected</p>
      </div>
    );

    const currency  = selectedScenario.currency || selectedScenario.data?.currency || "AZN";
    const isCurrent = selectedScenario.status === "current";
    const isDraft   = selectedScenario.status === "draft";

    const globalIvs = (() => {
      const g = selectedScenario.data?.globalHorizontalIntervals || {};
      if (Object.values(g).some(v => safe(v) > 0)) return g;
      if (selectedScenario.input_rates)
        for (const gd of Object.values(selectedScenario.input_rates))
          if (gd?.horizontal_intervals && Object.values(gd.horizontal_intervals).some(v => safe(v) > 0))
            return gd.horizontal_intervals;
      return null;
    })();

    const gradeOrder = selectedScenario.data?.gradeOrder || selectedScenario.gradeOrder || currentData?.gradeOrder || [];

    return (
      <div className="space-y-5">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricTile label="Currency"       value={<span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${currencyBadgeCls(currency)}`}>{currency}</span>} sub="All grade values" isCurrent={isCurrent} />
          <MetricTile label="Base Value"     value={`${fmt(selectedScenario.data?.baseValue1 || selectedScenario.baseValue1)} ${currency}`} sub={basePositionName} isCurrent={isCurrent} />
          <MetricTile label="Vertical Avg"   value={fmtPct(selectedScenario.data?.verticalAvg   ?? selectedScenario.vertical_avg)}   sub="Between grades" isCurrent={isCurrent} />
          <MetricTile label="Horizontal Avg" value={fmtPct(selectedScenario.data?.horizontalAvg ?? selectedScenario.horizontal_avg)} sub="Within grades"   isCurrent={isCurrent} />
        </div>

        {/* Global horizontal intervals */}
        {globalIvs && (
          <div className={`rounded-xl border p-4 ${
            isCurrent
              ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
              : "bg-almet-mystic/20 dark:bg-gray-700/20 border-almet-mystic dark:border-gray-600"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Settings size={13} className={isCurrent ? "text-emerald-500" : "text-almet-sapphire"} />
              <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Horizontal Intervals</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${currencyBadgeCls(currency)}`}>{currency}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["LD_to_LQ","LQ_to_M","M_to_UQ","UQ_to_UD"].map(key => (
                <div key={key} className="text-center p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic dark:border-gray-600">
                  <p className={`text-sm font-bold mb-0.5 ${isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-almet-sapphire"}`}>
                    {safe(globalIvs[key]).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-almet-waterloo dark:text-gray-400">{key.replace(/_to_/g," → ").replace(/_/g," ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade breakdown table */}
        <div className="rounded-xl border border-almet-mystic dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/20 dark:bg-gray-700/20">
            <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Grade Breakdown</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currencyBadgeCls(currency)}`}>{currency}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/10 dark:bg-gray-700/10">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-almet-waterloo dark:text-gray-400 uppercase tracking-wide">Grade</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-almet-waterloo dark:text-gray-400 uppercase tracking-wide">Vertical %</th>
                  {["LD","LQ","Median","UQ","UD"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-right text-[10px] font-semibold text-almet-waterloo dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
                {gradeOrder.map((name, idx) => {
                  const vals    = (selectedScenario.data || selectedScenario).grades?.[name] || {};
                  const isBase  = name === basePositionName;
                  const isTop   = idx === 0;
                  const vertVal = getVerticalInputValue(selectedScenario.id, name);
                  return (
                    <tr key={name} className={`hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors ${isBase ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isTop ? "bg-red-500" : isBase ? "bg-almet-sapphire" : "bg-almet-bali-hai dark:bg-gray-500"}`} />
                          <span className="font-semibold text-almet-cloud-burst dark:text-white">{name}</span>
                          {isBase && <Target size={9} className="text-almet-sapphire" />}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {isBase ? (
                          <span className="text-almet-sapphire font-medium">Base</span>
                        ) : vertVal != null ? (
                          <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${isCurrent ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-almet-mystic dark:bg-gray-700 text-almet-sapphire"}`}>
                            {safe(vertVal).toFixed(1)}%
                          </span>
                        ) : <span className="text-almet-bali-hai dark:text-gray-500">—</span>}
                      </td>
                      {["LD","LQ","M","UQ","UD"].map(lv => (
                        <td key={lv} className="px-3 py-2.5 text-right font-mono">
                          <span className={`${
                            lv === "M"
                              ? isCurrent
                                ? "font-bold text-emerald-600 dark:text-emerald-400"
                                : "font-bold text-almet-sapphire"
                              : "text-almet-waterloo dark:text-gray-400"
                          }`}>{fmt(vals[lv])}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Draft action buttons */}
        {isDraft && (
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { handleSaveAsCurrent(selectedScenario.id); onClose(); }}
              disabled={loading.applying}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50"
            >
              {loading.applying ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
              Apply as Current
            </button>
            <button
              onClick={() => { handleArchiveDraft(selectedScenario.id); onClose(); }}
              disabled={loading.archiving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-almet-mystic dark:bg-gray-700 text-almet-waterloo dark:text-gray-300 rounded-lg hover:bg-almet-bali-hai/20 transition-colors disabled:opacity-50"
            >
              {loading.archiving ? <RefreshCw size={12} className="animate-spin" /> : <Archive size={12} />}
              Archive
            </button>
          </div>
        )}

        {/* Current badge */}
        {isCurrent && (
          <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Currently Active</p>
              {selectedScenario.applied_at && (
                <p className="text-[10px] text-almet-waterloo dark:text-gray-400 mt-0.5">
                  Applied on {new Date(selectedScenario.applied_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── Modal shell ──────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-almet-mystic dark:border-gray-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-almet-mystic dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-sm font-bold text-almet-cloud-burst dark:text-white truncate">{title}</h2>
            {!isCompareView && modalCurrency && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${currencyBadgeCls(modalCurrency)}`}>
                {modalCurrency}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-almet-waterloo dark:text-gray-400 hover:text-almet-cloud-burst dark:hover:text-white hover:bg-almet-mystic dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-3"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">
          {isCompareView ? renderComparisonView() : renderDetailView()}
        </div>
      </div>
    </div>
  );
};

export default ScenarioDetailModal;