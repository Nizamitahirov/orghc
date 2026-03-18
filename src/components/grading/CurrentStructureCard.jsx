import React from "react";
import { Target, TrendingUp, TrendingDown, Layers } from "lucide-react";

const fmt    = (v) => (v || 0).toLocaleString();
const fmtPct = (v, d = 1) => `${((v || 0) * 100).toFixed(d)}%`;

const currencyBadgeCls = (code) => {
  const m = {
    AZN: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    USD: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    EUR: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    GBP: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    RUB: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    TRY: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  };
  return m[code] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
};

const currencyActiveCls = (code) => {
  const m = {
    AZN: "bg-blue-600 text-white shadow-sm",
    USD: "bg-emerald-600 text-white shadow-sm",
    EUR: "bg-indigo-600 text-white shadow-sm",
    GBP: "bg-purple-600 text-white shadow-sm",
    RUB: "bg-red-600 text-white shadow-sm",
    TRY: "bg-orange-600 text-white shadow-sm",
  };
  return m[code] || "bg-almet-sapphire text-white shadow-sm";
};

/* ─── Metric tile ─────────────────────────────────────────────────────────── */
const Metric = ({ icon: Icon, label, value, iconCls = "text-almet-sapphire" }) => (
  <div className="flex items-center gap-3 p-4 bg-almet-mystic/40 dark:bg-gray-700/40 rounded-xl">
    <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
      <Icon size={15} className={iconCls} />
    </div>
    <div>
      <p className="text-[11px] text-almet-waterloo dark:text-gray-400">{label}</p>
      <p className="text-sm font-bold text-almet-cloud-burst dark:text-white leading-tight">{value}</p>
    </div>
  </div>
);

const CurrentStructureCard = ({
  currentData,
  basePositionName,
  // Multi-currency props
  availableStructureCurrencies = [],
  selectedStructureCurrency,
  onCurrencyChange,
}) => {
  const currency = currentData?.currency || selectedStructureCurrency || "AZN";
  const showTabs = availableStructureCurrencies.length > 1;

  return (
    <div className="space-y-5">

      {/* ── Currency tabs (yalnız birdən çox currency mövcuddursa) ─────────── */}
      {showTabs && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-almet-waterloo dark:text-gray-400 mr-1">Currency:</span>
          {availableStructureCurrencies.map(cur => (
            <button
              key={cur}
              onClick={() => onCurrencyChange?.(cur)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                cur === selectedStructureCurrency
                  ? currencyActiveCls(cur)
                  : `${currencyBadgeCls(cur)} hover:opacity-80`
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      )}

  

      {/* Grade table */}
      <div className="rounded-xl border border-almet-mystic dark:border-gray-700 overflow-hidden">

        <div className="flex items-center justify-between px-4 py-2.5 bg-almet-mystic/30 dark:bg-gray-700/30 border-b border-almet-mystic dark:border-gray-700">
          <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Grade Structure</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${currencyBadgeCls(currency)}`}>{currency}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-almet-mystic/20 dark:bg-gray-700/20 border-b border-almet-mystic dark:border-gray-700">
                <th className="px-4 py-2.5 text-left font-semibold text-almet-waterloo dark:text-gray-400 uppercase tracking-wide">Grade</th>
                {["LD", "LQ", "Median", "UQ", "UD"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-right font-semibold text-almet-waterloo dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
              {(currentData?.gradeOrder || []).map((name, idx) => {
                const v      = currentData?.grades?.[name] || {};
                const isBase = name === basePositionName;
                const isTop  = idx === 0;
                return (
                  <tr key={name} className={`transition-colors hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 ${isBase ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isTop ? "bg-red-500" : isBase ? "bg-almet-sapphire" : "bg-almet-bali-hai dark:bg-gray-500"}`} />
                        <span className="font-semibold text-almet-cloud-burst dark:text-white">{name}</span>
                        {isBase && (
                          <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-almet-sapphire/10 text-almet-sapphire rounded font-semibold">
                            <Target size={8} />Base
                          </span>
                        )}
                      </div>
                    </td>
                    {["LD", "LQ", "M", "UQ", "UD"].map(lv => (
                      <td key={lv} className="px-3 py-2.5 text-right font-mono">
                        <span className={lv === "M" ? "font-bold text-almet-cloud-burst dark:text-white" : "text-almet-waterloo dark:text-gray-400"}>
                          {fmt(v[lv])}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 border-t border-almet-mystic dark:border-gray-700 bg-almet-mystic/10 dark:bg-gray-700/20">
          <p className="text-[10px] text-almet-waterloo dark:text-gray-500">
            LD = Lower Decile · LQ = Lower Quartile · M = Median · UQ = Upper Quartile · UD = Upper Decile
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrentStructureCard;