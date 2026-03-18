import React, { useState, useMemo } from "react";
import {
  X, TrendingUp, TrendingDown, DollarSign, Users,
  AlertCircle, BarChart3, AlertTriangle, Download,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt    = (v) => Math.round(parseFloat(v) || 0).toLocaleString();
const fmtPct = (v, d = 1) => `${(parseFloat(v) || 0).toFixed(d)}%`;

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

const exportCSV = (rows, filename) => {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
};

/* ─── Shared table shell ──────────────────────────────────────────────────── */
const TableShell = ({ title, onExport, children }) => (
  <div className="rounded-xl border border-almet-mystic dark:border-gray-700 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-almet-mystic dark:border-gray-700 bg-almet-mystic/20 dark:bg-gray-700/20">
      <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{title}</span>
      {onExport && (
        <button onClick={onExport}
          className="flex items-center gap-1 text-[11px] text-almet-waterloo dark:text-gray-400 hover:text-almet-sapphire transition-colors">
          <Download size={11} />CSV
        </button>
      )}
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const Th = ({ children, right }) => (
  <th className={`px-3 py-2.5 text-[10px] font-semibold text-white/80 uppercase tracking-wide ${right ? "text-right" : "text-left"}`}>
    {children}
  </th>
);

const EmptySection = () => (
  <div className="text-center py-12 text-xs text-almet-waterloo dark:text-gray-400">No data available</div>
);

/* ─── Cross-currency banner ───────────────────────────────────────────────── */
const CrossCurrencyBanner = ({ comparisonData, scenarios }) => {
  if (!comparisonData?.cross_currency_note) return null;
  const unique = [...new Set(scenarios.map(s => s.currency).filter(Boolean))];
  if (unique.length <= 1) return null;
  return (
    <div className="mx-5 mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-start gap-2.5">
      <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200 mb-0.5">
          Multiple currencies: {unique.join(" · ")}
        </p>
        <p className="text-[10px] text-amber-700 dark:text-amber-300">{comparisonData.cross_currency_note}</p>
      </div>
    </div>
  );
};

/* ─── SECTION 1: Employee Analysis ───────────────────────────────────────── */
const EmployeeAnalysisSection = ({ data }) => {
  if (!data) return <EmptySection />;
  const positions  = Object.keys(data);
  const [selPos, setSelPos] = useState(positions[0]);
  const posData    = data[selPos] || {};
  const grades     = Object.keys(posData.current_grading || {});
  const scNames    = Object.keys(posData.scenarios || {});

  const exportRows = grades.flatMap(g => {
    const cur = posData.current_grading[g] || {};
    return [{
      Position: selPos, Grade: g,
      "Current Count": cur.count || 0, "Current Over": cur.over || 0, "Current Under": cur.under || 0,
      ...Object.fromEntries(scNames.flatMap(sn => {
        const sd = posData.scenarios[sn]?.data?.[g] || {};
        return [[`${sn} Over`, sd.over || 0], [`${sn} Under`, sd.under || 0]];
      })),
    }];
  });

  const badge = (v, cls) => v > 0
    ? <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cls}`}>{v}</span>
    : <span className="text-almet-bali-hai dark:text-gray-600">—</span>;

  return (
    <div className="space-y-4">
      {/* Position tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {positions.map(p => (
            <button key={p} onClick={() => setSelPos(p)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                selPos === p ? "bg-almet-sapphire text-white shadow-sm" : "bg-almet-mystic/50 dark:bg-gray-700 text-almet-waterloo dark:text-gray-300 hover:bg-almet-mystic dark:hover:bg-gray-600"
              }`}>
              {p}
              <span className="ml-1.5 text-[9px] opacity-70">({data[p]?.total_employees || 0})</span>
            </button>
          ))}
        </div>
        <button onClick={() => exportCSV(exportRows, `employee_analysis_${selPos}.csv`)}
          className="flex items-center gap-1 text-[11px] text-almet-waterloo dark:text-gray-400 hover:text-almet-sapphire transition-colors">
          <Download size={11} />Export CSV
        </button>
      </div>

      <TableShell title="Employee Count by Grade">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
              <Th>Grade</Th>
              <Th>Count</Th>
              <Th>Over Grade</Th>
              <Th>At Grade</Th>
              <Th>Under Grade</Th>
              {scNames.map(sn => (
                <React.Fragment key={sn}>
                  <Th>{sn} — Over</Th>
                  <Th>{sn} — Under</Th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
            {grades.map((g, idx) => {
              const cur = posData.current_grading[g] || {};
              return (
                <tr key={g} className={`hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors ${idx % 2 === 0 ? "" : "bg-almet-mystic/10 dark:bg-gray-700/10"}`}>
                  <td className="px-3 py-2 font-medium text-almet-cloud-burst dark:text-white">{g}</td>
                  <td className="px-3 py-2 font-semibold text-almet-cloud-burst dark:text-white">{cur.count || 0}</td>
                  <td className="px-3 py-2">{badge(cur.over,  "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400")}</td>
                  <td className="px-3 py-2">{badge(cur.at,   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400")}</td>
                  <td className="px-3 py-2">{badge(cur.under,"bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400")}</td>
                  {scNames.map(sn => {
                    const sd = posData.scenarios[sn];
                    const sg = sd?.data?.[g] || {};
                    const na = sd?.comparable === false;
                    return (
                      <React.Fragment key={sn}>
                        <td className="px-3 py-2">{na ? <span className="text-amber-500 text-[10px]">N/A</span> : badge(sg.over,  "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400")}</td>
                        <td className="px-3 py-2">{na ? <span className="text-amber-500 text-[10px]">N/A</span> : badge(sg.under,"bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400")}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableShell>

      <div className="p-3.5 bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border border-almet-sapphire/20 rounded-xl text-[11px] text-almet-cloud-burst dark:text-gray-300 leading-relaxed">
        This section shows how many employees are above or below the grade salary range — for both the current structure and each comparison scenario.
      </div>
    </div>
  );
};

/* ─── SECTION 2: Total Cost ───────────────────────────────────────────────── */
const TotalCostSection = ({ data }) => {
  if (!data) return <EmptySection />;
  const currencies = Object.keys(data.by_currency || {});

  return (
    <div className="space-y-6">
      {currencies.map(cur => {
        const byCur    = data.by_currency[cur] || {};
        const totals   = data.totals?.[cur]    || {};
        const positions = Object.keys(byCur);
        const scNames  = positions.length ? Object.keys(byCur[positions[0]]?.scenarios || {}) : [];

        const exportRows = [
          ...positions.map(pos => ({
            Currency: cur, Position: pos, "Grade Cost": byCur[pos]?.current || 0,
            ...Object.fromEntries(scNames.map(sn => [sn, byCur[pos]?.scenarios?.[sn] || 0])),
          })),
          { Currency: cur, Position: "TOTAL", "Grade Cost": totals.current || 0,
            ...Object.fromEntries(scNames.map(sn => [sn, totals.scenarios?.[sn] || 0])) },
        ];

        return (
          <div key={cur} className="space-y-3">
            {currencies.length > 1 && (
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${currencyBadgeCls(cur)}`}>{cur}</span>
                <hr className="flex-1 border-almet-mystic dark:border-gray-700" />
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800">
                <p className="text-[10px] text-almet-waterloo dark:text-gray-400 mb-1">Grade-Based Cost</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{fmt(totals.current)} <span className="text-[10px] font-normal">{cur}</span></p>
              </div>
              {totals.real_current != null && (
                <div className="p-3.5 rounded-xl border bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800">
                  <p className="text-[10px] text-almet-waterloo dark:text-gray-400 mb-1">Real Current Cost</p>
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-400">{fmt(totals.real_current)} <span className="text-[10px] font-normal">{cur}</span></p>
                </div>
              )}
              {scNames.map(sn => {
                const diff = (totals.scenarios?.[sn] || 0) - (totals.current || 0);
                return (
                  <div key={sn} className="p-3.5 rounded-xl border bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border-almet-sapphire/20">
                    <p className="text-[10px] text-almet-waterloo dark:text-gray-400 mb-1 truncate">{sn}</p>
                    <p className="text-sm font-bold text-almet-sapphire">{fmt(totals.scenarios?.[sn])} <span className="text-[10px] font-normal">{cur}</span></p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${diff > 0 ? "text-red-600" : diff < 0 ? "text-emerald-600" : "text-almet-bali-hai"}`}>
                      {diff > 0 ? "+" : ""}{fmt(diff)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Position breakdown */}
            <TableShell title={`Cost Breakdown ${currencies.length > 1 ? `(${cur})` : ""}`} onExport={() => exportCSV(exportRows, `cost_${cur}.csv`)}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
                    <Th>Position</Th>
                    <Th right>Grade Cost</Th>
                    {totals.real_current != null && <Th right>Real Cost</Th>}
                    {scNames.map(n => <Th key={n} right>{n}</Th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
                  {positions.map((pos, idx) => (
                    <tr key={pos} className={`hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors ${idx % 2 === 0 ? "" : "bg-almet-mystic/10 dark:bg-gray-700/10"}`}>
                      <td className="px-3 py-2 font-medium text-almet-cloud-burst dark:text-white">{pos}</td>
                      <td className="px-3 py-2 text-right font-mono text-almet-waterloo dark:text-gray-300">{fmt(byCur[pos]?.current)}</td>
                      {totals.real_current != null && <td className="px-3 py-2 text-right font-mono text-teal-600 dark:text-teal-400">{fmt(byCur[pos]?.real_current)}</td>}
                      {scNames.map(sn => {
                        const sv   = byCur[pos]?.scenarios?.[sn] || 0;
                        const diff = sv - (byCur[pos]?.current || 0);
                        return (
                          <td key={sn} className="px-3 py-2 text-right">
                            <p className="font-mono text-almet-sapphire">{fmt(sv)}</p>
                            <p className={`text-[10px] font-medium ${diff > 0 ? "text-red-500" : diff < 0 ? "text-emerald-500" : "text-almet-bali-hai"}`}>
                              {diff > 0 ? "+" : ""}{fmt(diff)}
                            </p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-almet-mystic/30 dark:bg-gray-700/30 border-t-2 border-almet-mystic dark:border-gray-600 font-semibold">
                    <td className="px-3 py-2.5 text-almet-cloud-burst dark:text-white">Total</td>
                    <td className="px-3 py-2.5 text-right font-mono text-almet-cloud-burst dark:text-white">{fmt(totals.current)}</td>
                    {totals.real_current != null && <td className="px-3 py-2.5 text-right font-mono text-teal-600 dark:text-teal-400">{fmt(totals.real_current)}</td>}
                    {scNames.map(sn => {
                      const diff = (totals.scenarios?.[sn] || 0) - (totals.current || 0);
                      return (
                        <td key={sn} className="px-3 py-2.5 text-right">
                          <p className={`font-mono font-bold ${diff > 0 ? "text-red-600" : "text-emerald-600"}`}>{fmt(totals.scenarios?.[sn])}</p>
                          <p className={`text-[10px] ${diff > 0 ? "text-red-500" : "text-emerald-500"}`}>{diff > 0 ? "+" : ""}{fmt(diff)}</p>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </TableShell>
          </div>
        );
      })}
    </div>
  );
};

/* ─── SECTION 3: Underpaid / Overpaid ────────────────────────────────────── */
const UnderpaidOverpaidSection = ({ data }) => {
  if (!data) return <EmptySection />;
  const scNames = Object.keys(data);
  const [selSc,    setSelSc]    = useState(scNames[0]);
  const [activeTab, setActiveTab] = useState("underpaid");
  const [curPage,  setCurPage]  = useState(1);
  const PER_PAGE = 10;

  const sd         = data[selSc] || { underpaid: [], overpaid: [] };
  const activeList = activeTab === "underpaid" ? sd.underpaid : sd.overpaid;
  const totalPages = Math.ceil(activeList.length / PER_PAGE);
  const start      = (curPage - 1) * PER_PAGE;
  const paginated  = activeList.slice(start, start + PER_PAGE);

  const exportRows = activeList.map(e => ({
    "Employee": e.employee_name, "ID": e.employee_id, "Position": e.position,
    "Grade": e.grading_level, "Current Salary": e.current_salary,
    "Scenario Salary": e.scenario_salary, "Diff": e.difference, "Diff %": e.difference_percent,
    "Department": e.department || "", "Start Date": e.start_date || "",
  }));

  return (
    <div className="space-y-4">
      {sd.comparable === false && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
          <AlertTriangle size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300">{sd.note}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="flex gap-1.5">
          {[
            { id: "underpaid", label: "Underpaid", count: sd.underpaid?.length || 0, activeCls: "bg-almet-sapphire text-white" },
            { id: "overpaid",  label: "Overpaid",  count: sd.overpaid?.length  || 0, activeCls: "bg-red-600 text-white"        },
          ].map(({ id, label, count, activeCls }) => (
            <button key={id} onClick={() => { setActiveTab(id); setCurPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium rounded-lg transition-all ${
                activeTab === id ? activeCls : "bg-almet-mystic/50 dark:bg-gray-700 text-almet-waterloo dark:text-gray-300 hover:bg-almet-mystic dark:hover:bg-gray-600"
              }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
              {label} ({count})
            </button>
          ))}
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <select value={selSc} onChange={e => { setSelSc(e.target.value); setCurPage(1); }}
            className="text-xs px-3 py-2 border border-almet-mystic dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30">
            {scNames.map(n => <option key={n} value={n}>{n}{data[n]?.currency ? ` (${data[n].currency})` : ""}</option>)}
          </select>
          <button onClick={() => exportCSV(exportRows, `${activeTab}_${selSc}.csv`)}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] border border-almet-mystic dark:border-gray-600 rounded-lg text-almet-waterloo dark:text-gray-300 hover:bg-almet-mystic/40 dark:hover:bg-gray-700 transition-colors">
            <Download size={11} />CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {sd.comparable !== false && (
        <TableShell title={`${activeTab === "underpaid" ? "Underpaid" : "Overpaid"} Employees`}>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
                <Th>Employee</Th>
                <Th>Position</Th>
                <Th>Department</Th>
                <Th>Start Date</Th>
                <Th right>Current Salary</Th>
                <Th right>Grade Salary <span className="text-[9px] opacity-70">({sd.currency || ""})</span></Th>
                <Th right>Scenario Salary</Th>
                <Th right>Market Avg</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
              {paginated.length > 0 ? paginated.map((emp, idx) => (
                <tr key={emp.employee_id || idx} className={`hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors ${idx % 2 === 0 ? "" : "bg-almet-mystic/10 dark:bg-gray-700/10"}`}>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-almet-cloud-burst dark:text-white">{emp.employee_name}</p>
                    <p className="text-[10px] text-almet-waterloo dark:text-gray-400">{emp.employee_id}</p>
                  </td>
                  <td className="px-3 py-2.5 text-almet-waterloo dark:text-gray-300">{emp.position}</td>
                  <td className="px-3 py-2.5 text-almet-waterloo dark:text-gray-400">{emp.department || "—"}</td>
                  <td className="px-3 py-2.5 text-almet-waterloo dark:text-gray-400">{emp.start_date || "—"}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-almet-cloud-burst dark:text-white">{emp.current_salary != null ? fmt(emp.current_salary) : "—"}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">{emp.current_grade_salary != null ? fmt(emp.current_grade_salary) : "—"}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-almet-sapphire">{fmt(emp.scenario_salary)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-purple-600 dark:text-purple-400">{emp.market_avg_salary != null ? fmt(emp.market_avg_salary) : "—"}</td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-almet-waterloo dark:text-gray-400">No {activeTab} employees found</td></tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="border-t border-almet-mystic dark:border-gray-700 px-4 py-3">
              <Pagination currentPage={curPage} totalPages={totalPages} totalItems={activeList.length} itemsPerPage={PER_PAGE} onPageChange={setCurPage} />
            </div>
          )}
        </TableShell>
      )}
    </div>
  );
};

/* ─── SECTION 4: Scenarios % Comparison ──────────────────────────────────── */
const PercentageComparisonSection = ({ data }) => {
  if (!data) return <EmptySection />;
  const positions = Object.keys(data);
  const [selPos,  setSelPos]  = useState(positions[0]);
  const posData   = data[selPos] || {};
  const scNames   = Object.keys(posData.scenarios || {});
  const levels    = ["LD", "LQ", "M", "UQ", "UD"];

  const totalRow = useMemo(() => {
    const totals = {};
    scNames.forEach(sn => {
      let sum = 0, cnt = 0;
      levels.forEach(lv => {
        const pct = posData.scenarios[sn]?.data?.[lv]?.diff_percent;
        if (pct != null) { sum += pct; cnt++; }
      });
      totals[sn] = cnt > 0 ? sum / cnt : null;
    });
    return totals;
  }, [posData, scNames]); // eslint-disable-line

  const exportRows = levels.map(lv => ({
    Level: lv,
    ...Object.fromEntries(scNames.flatMap(sn => {
      const sc = posData.scenarios[sn];
      return [
        [`${sn} Diff Int`, fmtPct(sc?.data?.[lv]?.diff_percent)],
        [`${sn} Diff Mkt`, fmtPct(sc?.data?.[lv]?.market_diff_percent)],
      ];
    })),
  }));

  const pctCell = (pct, noComp) => {
    if (noComp) return <span className="text-amber-500 text-[10px]">N/A</span>;
    if (pct == null) return <span className="text-almet-bali-hai dark:text-gray-600">—</span>;
    const isNeg = pct < -0.5, isPos = pct > 0.5;
    return (
      <span className={`font-semibold text-[11px] ${isNeg ? "text-red-600 dark:text-red-400" : isPos ? "text-emerald-600 dark:text-emerald-400" : "text-almet-waterloo dark:text-gray-400"}`}>
        {isPos ? "+" : ""}{fmtPct(pct)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Position tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {positions.map(p => (
            <button key={p} onClick={() => setSelPos(p)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                selPos === p ? "bg-almet-sapphire text-white shadow-sm" : "bg-almet-mystic/50 dark:bg-gray-700 text-almet-waterloo dark:text-gray-300 hover:bg-almet-mystic dark:hover:bg-gray-600"
              }`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {posData.current_currency && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currencyBadgeCls(posData.current_currency)}`}>
              {posData.current_currency}
            </span>
          )}
          <button onClick={() => exportCSV(exportRows, `pct_comparison_${selPos}.csv`)}
            className="flex items-center gap-1 text-[11px] text-almet-waterloo dark:text-gray-400 hover:text-almet-sapphire transition-colors">
            <Download size={11} />CSV
          </button>
        </div>
      </div>

      <TableShell title="Scenarios vs Current — % Difference">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
              <Th>Salary Band</Th>
              {scNames.map(sn => (
                <React.Fragment key={sn}>
                  <Th right>Diff Internal</Th>
                  <Th right>Diff Market</Th>
                </React.Fragment>
              ))}
            </tr>
            {scNames.length > 1 && (
              <tr className="bg-almet-sapphire/80 border-b border-white/10">
                <th className="px-3 py-1.5 text-left text-[10px] text-white/70">Position</th>
                {scNames.map(sn => (
                  <th key={sn} colSpan={2} className="px-3 py-1.5 text-center text-[10px] text-white/90 font-semibold border-l border-white/10">
                    {sn}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
            {levels.map((lv, idx) => (
              <tr key={lv} className={`hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors ${idx % 2 === 0 ? "" : "bg-almet-mystic/10 dark:bg-gray-700/10"}`}>
                <td className="px-3 py-2.5 font-semibold text-almet-cloud-burst dark:text-white">
                  {lv === "M" ? "Median (M)" : lv === "LD" ? "Lower Decile (LD)" : lv === "LQ" ? "Lower Quartile (LQ)" : lv === "UQ" ? "Upper Quartile (UQ)" : "Upper Decile (UD)"}
                </td>
                {scNames.map(sn => {
                  const sc   = posData.scenarios[sn];
                  const lvd  = sc?.data?.[lv];
                  const noC  = sc?.comparable === false;
                  return (
                    <React.Fragment key={sn}>
                      <td className="px-3 py-2.5 text-right">{pctCell(lvd?.diff_percent, noC)}</td>
                      <td className="px-3 py-2.5 text-right">{pctCell(lvd?.market_diff_percent, noC)}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-almet-mystic/30 dark:bg-gray-700/30 border-t-2 border-almet-mystic dark:border-gray-600 font-semibold">
              <td className="px-3 py-2.5 text-almet-cloud-burst dark:text-white">Average</td>
              {scNames.map(sn => {
                const avg = totalRow[sn];
                const isNeg = avg != null && avg < -0.5, isPos = avg != null && avg > 0.5;
                return (
                  <React.Fragment key={sn}>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`font-bold text-[11px] ${isNeg ? "text-red-600" : isPos ? "text-emerald-600" : "text-almet-waterloo"}`}>
                        {avg != null ? `${isPos ? "+" : ""}${fmtPct(avg)}` : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-almet-bali-hai dark:text-gray-600">—</td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </TableShell>

      <div className="flex flex-wrap gap-4 text-[10px] text-almet-waterloo dark:text-gray-400">
        <span className="flex items-center gap-1"><TrendingDown size={10} className="text-red-500" /> Negative % = scenario salary is lower (cost saving)</span>
        <span className="flex items-center gap-1"><TrendingUp   size={10} className="text-emerald-500" /> Positive % = scenario salary is higher</span>
        {scNames.some(sn => posData.scenarios[sn]?.comparable === false) && (
          <span className="flex items-center gap-1"><AlertTriangle size={10} className="text-amber-500" /> N/A = different currencies, cannot compare</span>
        )}
      </div>
    </div>
  );
};

/* ─── Main Modal ──────────────────────────────────────────────────────────── */
const ComparisonModal = ({ isOpen, onClose, comparisonData, scenarios }) => {
  const [activeSection, setActiveSection] = useState("employee_analysis");
  if (!isOpen || !comparisonData) return null;

  const sections = [
    { id: "employee_analysis",     name: "Employee Analysis",  icon: Users      },
    { id: "total_cost",            name: "Total Cost",         icon: DollarSign },
    { id: "underpaid_overpaid",    name: "Salary Differences", icon: AlertCircle },
    { id: "percentage_comparison", name: "% Comparison",       icon: BarChart3  },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-almet-mystic dark:border-gray-700 shadow-2xl">

        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-t-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Scenario Comparison</h2>
              <p className="text-[10px] text-white/70 mt-0.5">{scenarios.length} scenarios — detailed analysis</p>
            </div>
            <button onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
          {/* Section tabs */}
          <div className="flex gap-1 p-1 bg-white/10 rounded-xl w-fit">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeSection === s.id ? "bg-white text-almet-sapphire shadow-sm" : "text-white/80 hover:bg-white/10"
                }`}>
                <s.icon size={12} />
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <CrossCurrencyBanner comparisonData={comparisonData} scenarios={scenarios} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-b-2xl">
          {activeSection === "employee_analysis"     && <EmployeeAnalysisSection      data={comparisonData.employee_analysis}        />}
          {activeSection === "total_cost"            && <TotalCostSection             data={comparisonData.total_cost_comparison}    />}
          {activeSection === "underpaid_overpaid"    && <UnderpaidOverpaidSection     data={comparisonData.underpaid_overpaid_lists} />}
          {activeSection === "percentage_comparison" && <PercentageComparisonSection  data={comparisonData.scenarios_comparison}     />}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;