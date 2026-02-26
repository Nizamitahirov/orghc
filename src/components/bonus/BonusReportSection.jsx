"use client";

import { useState, useMemo } from "react";
import { Download, TrendingUp, Users, CheckCircle, DollarSign, ChevronUp, ChevronDown } from "lucide-react";

export default function BonusReportSection({ records, bonusYear, dark, onExcelExport }) {
  const [sortKey, setSortKey]       = useState("total_bonus");
  const [sortDir, setSortDir]       = useState("desc");
  const [filterStatus, setFilter]   = useState("ALL");
  const [exporting, setExporting]   = useState(false);

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const card  = dark ? "bg-[#111111] border-[#1f1f1f]" : "bg-white border-gray-200";
  const panel = dark ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-gray-50 border-gray-200";
  const headBg = dark ? "bg-[#0a0a0a] text-gray-500" : "bg-gray-100 text-gray-500";
  const border = dark ? "border-[#1f1f1f]" : "border-gray-200";
  const rowHov = dark ? "hover:bg-[#0d0d0d]" : "hover:bg-gray-50";

  // ── Aggregates ─────────────────────────────────────────────
  const agg = useMemo(() => {
    const calc = records.filter((r) => r.status !== "DRAFT");
    const appr = records.filter((r) => r.status === "APPROVED");
    const total = records.reduce((s, r) => s + parseFloat(r.total_bonus || 0), 0);
    const avg   = calc.length ? total / calc.length : 0;
    const max   = records.reduce((m, r) => Math.max(m, parseFloat(r.total_bonus || 0)), 0);
    return { total, avg, max, calcCount: calc.length, apprCount: appr.length };
  }, [records]);

  // ── Status distribution ────────────────────────────────────
  const statusDist = useMemo(() => {
    const map = { DRAFT: 0, CALCULATED: 0, APPROVED: 0, PAID: 0 };
    records.forEach((r) => { map[r.status] = (map[r.status] || 0) + 1; });
    return map;
  }, [records]);

  // ── Sort + filter ──────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = filterStatus === "ALL" ? records : records.filter((r) => r.status === filterStatus);
    list = [...list].sort((a, b) => {
      const va = parseFloat(a[sortKey] || 0);
      const vb = parseFloat(b[sortKey] || 0);
      const sv = isNaN(va) ? String(a[sortKey] || "").localeCompare(String(b[sortKey] || "")) : va - vb;
      return sortDir === "asc" ? sv : -sv;
    });
    return list;
  }, [records, sortKey, sortDir, filterStatus]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }) =>
    sortKey === k
      ? sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      : <ChevronDown size={11} className="opacity-20" />;

  const fmt = (v) =>
    parseFloat(v || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtShort = (v) =>
    parseFloat(v || 0).toLocaleString("en", { maximumFractionDigits: 0 });

  const handleExcel = async () => {
    setExporting(true);
    try { await onExcelExport(); }
    finally { setExporting(false); }
  };

  const statusColors = {
    DRAFT:      { bg: dark ? "bg-gray-500/20"   : "bg-gray-100",   text: dark ? "text-gray-400"  : "text-gray-600",  bar: "bg-gray-400"   },
    CALCULATED: { bg: dark ? "bg-blue-500/20"   : "bg-blue-50",    text: "text-blue-400",                            bar: "bg-blue-400"   },
    APPROVED:   { bg: dark ? "bg-green-500/20"  : "bg-green-50",   text: "text-green-400",                           bar: "bg-green-400"  },
    PAID:       { bg: dark ? "bg-purple-500/20" : "bg-purple-50",  text: "text-purple-400",                          bar: "bg-purple-400" },
  };

  return (
    <div className="space-y-5">

      {/* ── Header row ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-base font-semibold ${text}`}>Bonus Report</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>
            {bonusYear?.year} · {records.length} employees
          </p>
        </div>
        <button
          onClick={handleExcel}
          disabled={exporting || !records.length}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition"
        >
          <Download size={14} />
          {exporting ? "Exporting…" : "Export Excel"}
        </button>
      </div>

      {/* ── KPI cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: DollarSign,  label: "Total Bonus Pool",   value: fmtShort(agg.total) + " ₼",  color: "text-green-400",  iconBg: dark ? "bg-green-500/20" : "bg-green-50" },
          { icon: TrendingUp,  label: "Avg Bonus",          value: fmtShort(agg.avg)   + " ₼",  color: "text-blue-400",   iconBg: dark ? "bg-blue-500/20"  : "bg-blue-50"  },
          { icon: Users,       label: "Calculated",         value: `${agg.calcCount} / ${records.length}`, color: "text-yellow-400", iconBg: dark ? "bg-yellow-500/20" : "bg-yellow-50" },
          { icon: CheckCircle, label: "Approved",           value: agg.apprCount,                color: "text-purple-400", iconBg: dark ? "bg-purple-500/20" : "bg-purple-50" },
        ].map(({ icon: Icon, label, value, color, iconBg }) => (
          <div key={label} className={`rounded-2xl border p-4 flex items-center gap-3 ${card}`}>
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className={`text-xs ${sub}`}>{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Status distribution ───────────────────────────── */}
      <div className={`rounded-2xl border p-5 ${card}`}>
        <p className={`text-sm font-semibold mb-3 ${text}`}>Status Distribution</p>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(statusDist).map(([status, count]) => {
            const pct = records.length ? Math.round((count / records.length) * 100) : 0;
            const c = statusColors[status];
            return (
              <div key={status} className={`rounded-xl p-3 ${c.bg}`}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className={`text-xs font-medium ${c.text}`}>{status}</span>
                  <span className={`text-sm font-bold ${c.text}`}>{count}</span>
                </div>
                <div className={`h-1.5 rounded-full ${dark ? "bg-[#1f1f1f]" : "bg-white/60"} overflow-hidden`}>
                  <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs mt-1 ${sub}`}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {/* Filter bar */}
        <div className={`flex items-center gap-2 px-5 py-3 border-b ${border}`}>
          <span className={`text-xs ${sub} mr-1`}>Filter:</span>
          {["ALL", "DRAFT", "CALCULATED", "APPROVED", "PAID"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition
                ${filterStatus === s
                  ? "bg-almet-sapphire text-white"
                  : dark ? "bg-[#1a1a1a] text-gray-400 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {s} {s !== "ALL" && `(${statusDist[s] || 0})`}
            </button>
          ))}
          <span className={`ml-auto text-xs ${sub}`}>{displayed.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${headBg} border-b ${border} text-xs font-medium`}>
                {[
                  { key: "employee_id_code", label: "Badge" },
                  { key: "employee_name",    label: "Employee" },
                  { key: "position",         label: "Position" },
                  { key: "effective_salary", label: "Eff. Salary",     right: true },
                  { key: "company_targets_bonus", label: "Company",    right: true },
                  { key: "objectives_bonus",      label: "Objectives", right: true },
                  { key: "competencies_bonus",    label: "Competencies", right: true },
                  { key: "total_bonus",           label: "Total Bonus", right: true },
                  { key: "status",           label: "Status" },
                ].map(({ key, label, right }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`px-4 py-3 cursor-pointer select-none whitespace-nowrap
                      ${right ? "text-right" : "text-left"} hover:opacity-80`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label} <SortIcon k={key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((r) => {
                const sc = statusColors[r.status];
                return (
                  <tr key={r.id} className={`border-t ${border} ${rowHov} transition`}>
                    <td className={`px-4 py-3 font-mono text-xs ${sub}`}>{r.employee_id_code}</td>
                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${text}`}>{r.employee_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium
                        ${dark ? "bg-almet-cloud-burst/40 text-almet-bali-hai" : "bg-almet-mystic text-almet-sapphire"}`}>
                        {r.position || "—"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-mono ${sub}`}>{fmt(r.effective_salary)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-mono text-blue-400">{fmt(r.company_targets_bonus)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-mono text-yellow-400">{fmt(r.objectives_bonus)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-mono text-purple-400">{fmt(r.competencies_bonus)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-green-400">{fmt(r.total_bonus)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${sc.bg} ${sc.text}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={9} className={`text-center py-12 text-sm ${sub}`}>
                    No records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {displayed.length > 0 && (
          <div className={`flex items-center justify-end gap-6 px-5 py-3 border-t ${border} ${dark ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
            <span className={`text-xs ${sub}`}>{displayed.length} rows</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-blue-400">
                Company: <b>{fmt(displayed.reduce((s, r) => s + parseFloat(r.company_targets_bonus || 0), 0))}</b>
              </span>
              <span className="text-yellow-400">
                Obj: <b>{fmt(displayed.reduce((s, r) => s + parseFloat(r.objectives_bonus || 0), 0))}</b>
              </span>
              <span className="text-purple-400">
                Comp: <b>{fmt(displayed.reduce((s, r) => s + parseFloat(r.competencies_bonus || 0), 0))}</b>
              </span>
              <span className="text-green-400 font-bold text-sm">
                Total: {fmt(displayed.reduce((s, r) => s + parseFloat(r.total_bonus || 0), 0))} ₼
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}