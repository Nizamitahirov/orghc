"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Download, TrendingUp, Users, CheckCircle,
  ChevronUp, ChevronDown, X, Eye,
  Target, Brain, FileText, BarChart2, PieChart,
  AlertTriangle, DollarSign,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
  CartesianGrid,
} from "recharts";
import { bonusRecordService, exchangeRateService, downloadBlob } from "@/services/bonusService";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT:      { label: "Not Started",      bg: "bg-slate-100",  text: "text-slate-500",  dot: "bg-slate-400",  hex: "#94a3b8" },
  CALCULATED: { label: "Ready to Approve", bg: "bg-blue-50",    text: "text-blue-600",   dot: "bg-blue-500",   hex: "#3b82f6" },
  APPROVED:   { label: "Approved",         bg: "bg-emerald-50", text: "text-emerald-600",dot: "bg-emerald-500",hex: "#10b981" },
  PAID:       { label: "Paid",             bg: "bg-violet-50",  text: "text-violet-600", dot: "bg-violet-500", hex: "#8b5cf6" },
};

const STATUS_CONFIG_DARK = {
  DRAFT:      { label: "Not Started",      bg: "bg-slate-800",      text: "text-slate-400",   dot: "bg-slate-500",   hex: "#94a3b8" },
  CALCULATED: { label: "Ready to Approve", bg: "bg-blue-500/15",    text: "text-blue-400",    dot: "bg-blue-500",    hex: "#3b82f6" },
  APPROVED:   { label: "Approved",         bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500", hex: "#10b981" },
  PAID:       { label: "Paid",             bg: "bg-violet-500/15",  text: "text-violet-400",  dot: "bg-violet-500",  hex: "#8b5cf6" },
};

const COMPONENT_COLORS = {
  company:      "#4e7db5",
  objectives:   "#f59e0b",
  competencies: "#a78bfa",
};

// Semi-transparent fill variants for chart area fills / backgrounds
const COMPONENT_COLORS_SOFT = {
  company:      "rgba(78,125,181,0.15)",
  objectives:   "rgba(245,158,11,0.15)",
  competencies: "rgba(167,139,250,0.15)",
};

const fmt     = v => parseFloat(v || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShrt = v => {
  const n = parseFloat(v || 0);
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toFixed(0);
};
const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€', AZN: '₼', TRY: '₺', RUB: '₽' };
const currSym = (code) => CURRENCY_SYMBOLS[code] || code || '₼';

function convertAmount(value, fromCurrency, toCurrency, rates) {
  const v = parseFloat(value || 0);
  if (!fromCurrency || fromCurrency === toCurrency || !rates?.length) return v;
  const getRate = (from, to) => {
    const d = rates.find(r => r.from_currency === from && r.to_currency === to);
    if (d) return parseFloat(d.rate);
    const inv = rates.find(r => r.from_currency === to && r.to_currency === from);
    if (inv && parseFloat(inv.rate) !== 0) return 1 / parseFloat(inv.rate);
    return null;
  };
  const direct = getRate(fromCurrency, toCurrency);
  if (direct !== null) return v * direct;
  // 2-hop through AZN (CBAR rates are all AZN-based)
  const toAzn = getRate(fromCurrency, 'AZN');
  const aznTo = getRate('AZN', toCurrency);
  if (toAzn !== null && aznTo !== null) return v * toAzn * aznTo;
  return v;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2.5 rounded-xl border shadow-xl text-xs
      ${dark ? "bg-almet-cloud-burst border-almet-comet text-white" : "bg-white border-gray-200 text-gray-800"}`}>
      {label && <p className="font-bold mb-1.5 opacity-70">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="opacity-70">{p.name}:</span>
          <span className="font-bold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, iconColor, iconBg, children, dark, action }) {
  return (
    <div className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-md
      ${dark
        ? "bg-almet-cloud-burst border-almet-comet shadow-sm"
        : "bg-white border-gray-100 shadow-sm"}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b
        ${dark
          ? "border-almet-comet/60 bg-almet-cloud-burst/80"
          : "border-gray-100 bg-gradient-to-r from-gray-50/80 to-white"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${iconBg || (dark ? "bg-almet-san-juan/50" : "bg-almet-mystic")}`}>
            <Icon size={13} className={iconColor} />
          </div>
          <span className={`text-[13px] font-semibold tracking-tight ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
            {title}
          </span>
        </div>
        {action && (
          <div className={`text-xs font-medium ${dark ? "text-almet-bali-hai" : "text-almet-waterloo"}`}>
            {action}
          </div>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ record, dark, onClose, onApprove }) {
  const [approving, setApprove] = useState(false);
  const [downloading, setDl]   = useState(false);

  const sc   = dark ? (STATUS_CONFIG_DARK[record.status] || STATUS_CONFIG_DARK.DRAFT) : (STATUS_CONFIG[record.status] || STATUS_CONFIG.DRAFT);
  const text = dark ? "text-white" : "text-almet-cloud-burst";
  const sub  = dark ? "text-gray-500" : "text-almet-bali-hai";
  const row  = dark ? "border-[#1e1e1e]" : "border-gray-100";
  const cur  = currSym(record.salary_currency);

  const isZeroBonus   = record.notes?.startsWith("[ZERO]");
  const zeroBonusText = isZeroBonus ? record.notes.replace("[ZERO] ", "") : null;

  const handleApprove = async () => {
    setApprove(true);
    try { await onApprove(record.id); } finally { setApprove(false); }
  };

  const handlePdf = async () => {
    setDl(true);
    try {
      const { data } = await bonusRecordService.exportPdf(record.id);
      downloadBlob(data, `bonus_${record.employee_id_code}.pdf`);
    } finally { setDl(false); }
  };

  const totalBonus = parseFloat(record.total_bonus || 0);
  const effSalary  = parseFloat(record.effective_salary || 0);
  const bonusPct   = effSalary > 0 ? ((totalBonus / effSalary) * 100).toFixed(1) : "—";

  const sections = [
    {
      key: "company", icon: Target, label: "Company Targets",
      color: "text-almet-steel-blue", iconBg: dark ? "bg-almet-sapphire/15" : "bg-almet-mystic",
      total: record.company_targets_bonus, rows: record.company_targets_breakdown || [],
      cols: [
        { key: "target_name",      label: "Target"    },
        { key: "weight_pct",       label: "Weight",    fmt: v => `${v}%` },
        { key: "rating_name",      label: "Rating"    },
        { key: "bonus_salary_pct", label: "% Salary",  fmt: v => v != null ? `${v}%` : "—" },
        { key: "bonus_amount",     label: `Bonus (${cur})`, fmt },
      ],
    },
    {
      key: "objectives", icon: TrendingUp, label: "Individual Objectives",
      color: "text-amber-500", iconBg: dark ? "bg-amber-500/10" : "bg-amber-50",
      total: record.objectives_bonus, rows: record.objectives_breakdown || [],
      cols: [
        { key: "title",               label: "Objective" },
        { key: "original_weight",     label: "Weight",      fmt: v => `${v}%` },
        { key: "adjusted_weight_pct", label: "Adj. Weight", fmt: v => `${parseFloat(v).toFixed(1)}%` },
        { key: "rating_name",         label: "Rating"      },
        { key: "bonus_salary_pct",    label: "% Salary",    fmt: v => v != null ? `${v}%` : "—" },
        { key: "bonus_amount",        label: `Bonus (${cur})`,   fmt },
      ],
    },
    {
      key: "competencies", icon: Brain, label: "Competencies",
      color: "text-violet-500", iconBg: dark ? "bg-violet-500/10" : "bg-violet-50",
      total: record.competencies_bonus, rows: record.competencies_breakdown || [],
      cols: [
        { key: "group_name",       label: "Group"    },
        { key: "weight_pct",       label: "Weight",    fmt: v => `${v}%` },
        { key: "group_percentage", label: "Score",     fmt: v => `${parseFloat(v).toFixed(1)}%` },
        { key: "rating_name",      label: "Rating"    },
        { key: "bonus_salary_pct", label: "% Salary",  fmt: v => v != null ? `${v}%` : "—" },
        { key: "bonus_amount",     label: `Bonus (${cur})`, fmt },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`w-full max-w-2xl overflow-y-auto border-l shadow-2xl
        ${dark ? "bg-[#0e0e0e] border-[#1e1e1e]" : "bg-white border-gray-200"}`}>

        {/* Drawer header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-start justify-between
          ${dark ? "bg-[#0e0e0e] border-[#1e1e1e]" : "bg-white border-gray-100"}`}>
          <div>
            <h2 className={`text-base font-bold ${text}`}>{record.employee_name}</h2>
            <p className={`text-xs mt-0.5 ${sub}`}>{record.employee_id_code} · {record.job_title || record.position || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePdf} disabled={downloading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition
                ${dark ? "border-[#2e2e2e] text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                       : "border-gray-200 text-almet-waterloo hover:bg-almet-mystic"}`}>
              <FileText size={12} /> {downloading ? "…" : "PDF"}
            </button>
            {record.status === "CALCULATED" && (
              <button onClick={handleApprove} disabled={approving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-60">
                <CheckCircle size={12} /> {approving ? "Approving…" : "Approve"}
              </button>
            )}
            <button onClick={onClose}
              className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-[#1e1e1e] text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status + total */}
          <div className={`rounded-xl border p-4 ${dark ? "bg-[#141414] border-[#1e1e1e]" : "bg-almet-mystic/30 border-almet-mystic"}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${sc.bg} ${sc.text}`}>
                {sc.label}
              </span>
              <div className="text-right">
                <p className={`text-xs ${sub}`}>Total Bonus</p>
                {/*  Red when zero bonus */}
                <p className={`text-lg font-bold tabular-nums ${isZeroBonus ? "text-red-500" : "text-emerald-500"}`}>
                  {cur}{fmt(record.total_bonus)}
                </p>
                <p className={`text-xs mt-0.5 ${sub}`}>{bonusPct}% of effective salary</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Company",      v: record.company_targets_bonus, bar: "bg-almet-steel-blue", t: "text-almet-steel-blue" },
                { label: "Objectives",   v: record.objectives_bonus,      bar: "bg-amber-500",        t: "text-amber-500"        },
                { label: "Competencies", v: record.competencies_bonus,    bar: "bg-violet-500",       t: "text-violet-500"       },
              ].map(({ label, v, bar, t }) => {
                const pct = totalBonus > 0 ? (parseFloat(v) / totalBonus * 100) : 0;
                return (
                  <div key={label} className={`p-2.5 rounded-lg ${dark ? "bg-[#1a1a1a]" : "bg-white"}`}>
                    <p className={`text-xs ${sub} mb-1`}>{label}</p>
                    <p className={`text-sm font-bold tabular-nums ${t}`}>{cur}{fmt(v)}</p>
                    <div className={`mt-1.5 h-1 rounded-full ${dark ? "bg-[#2a2a2a]" : "bg-gray-100"}`}>
                      <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/*  Zero bonus alert in drawer */}
          {isZeroBonus && (
            <div className={`rounded-xl border p-4 flex items-start gap-3
              ${dark ? "border-red-500/20 bg-red-500/10" : "border-red-200 bg-red-50"}`}>
              <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${dark ? "bg-red-500/20" : "bg-red-100"}`}>
                <AlertTriangle size={13} className={dark ? "text-red-400" : "text-red-600"} />
              </div>
              <div>
                <p className={`text-sm font-bold ${dark ? "text-red-400" : "text-red-700"}`}>
                  Zero Bonus Applied
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-red-400/80" : "text-red-600"}`}>
                  {zeroBonusText}
                </p>
              </div>
            </div>
          )}

          {/* Salary details */}
          <div className={`rounded-xl border p-4 ${dark ? "bg-[#141414] border-[#1e1e1e]" : "bg-gray-50 border-gray-100"}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${sub}`}>Salary Details</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                ["Yearly Salary",   cur + fmt(record.yearly_salary)],
                ["Worked Months",   record.worked_months],
                ["Prorata Salary",  cur + fmt(record.prorata_salary)],
                ["Adjusted Salary", record.adjusted_yearly_salary ? cur + fmt(record.adjusted_yearly_salary) : "—"],
              ].map(([label, val]) => (
                <div key={label} className={`p-2.5 rounded-lg ${dark ? "bg-[#1a1a1a]" : "bg-white border border-gray-100"}`}>
                  <p className={`text-xs ${sub}`}>{label}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${text}`}>{val}</p>
                </div>
              ))}
            </div>
            <div className={`p-2.5 rounded-lg ring-1 ${dark ? "bg-emerald-500/10 ring-emerald-500/25" : "bg-emerald-50 ring-emerald-200"}`}>
              <p className={`text-xs font-semibold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
                Effective Salary {record.use_adjusted_salary && <span className="opacity-70 ml-1">· Adjusted applied</span>}
              </p>
              <p className={`text-base font-bold tabular-nums mt-0.5 ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
                {cur}{fmt(record.effective_salary)}
              </p>
            </div>
          </div>

          {/* Breakdown tables */}
          {sections.map(({ key, icon: Icon, label, color, iconBg, total, rows, cols }) => (
            <div key={key} className={`rounded-xl border overflow-hidden ${dark ? "border-[#1e1e1e] bg-[#0f0f0f]" : "border-gray-100 bg-white"}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b
                ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/70"}`}>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${iconBg}`}><Icon size={12} className={color} /></div>
                  <span className={`text-sm font-semibold ${text}`}>{label}</span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${color}`}>{cur}{fmt(total)}</span>
              </div>
              {rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={`border-b ${row} ${dark ? "text-gray-500 bg-[#0a0a0a]" : "text-almet-bali-hai bg-gray-50/50"} font-semibold`}>
                        {cols.map(col => (
                          <th key={col.key} className="px-4 py-2 text-left whitespace-nowrap">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className={`border-t ${row} transition ${dark ? "hover:bg-[#111]" : "hover:bg-gray-50/50"}`}>
                          {cols.map(col => (
                            <td key={col.key} className={`px-4 py-2.5 ${text}`}>
                              {col.fmt ? col.fmt(r[col.key]) : (r[col.key] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={`px-4 py-4 text-xs text-center ${sub}`}>No data available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BonusReportSection({ records, bonusYear, dark, onExcelExport }) {
  const baseCurrency = bonusYear?.base_currency || records[0]?.salary_currency || "AZN";

  const [sortKey,       setSortKey]       = useState("total_bonus");
  const [sortDir,       setSortDir]       = useState("desc");
  const [filter,        setFilter]        = useState("ALL");
  const [bfFilter,      setBfFilter]      = useState("ALL");
  const [exporting,     setExporting]     = useState(false);
  const [drawerRecord,  setDrawer]        = useState(null);
  const [activeView,    setActiveView]    = useState("dashboard");
  const [exchangeRates, setExchangeRates] = useState([]);
  const [displayCurrency, setDisplayCurrency] = useState(baseCurrency);

  // Load live exchange rates from CBAR (no DB)
  useEffect(() => {
    exchangeRateService.liveRates()
      .then(({ data }) => setExchangeRates(data.rates ?? []))
      .catch(() => setExchangeRates([]));
  }, []);

  // Update default display currency when bonusYear changes
  useEffect(() => {
    setDisplayCurrency(bonusYear?.base_currency || records[0]?.salary_currency || "AZN");
  }, [bonusYear?.base_currency]);

  // Available currencies
  const availableCurrencies = useMemo(() => {
    const currencies = new Set([baseCurrency]);
    records.forEach(r => { if (r.salary_currency) currencies.add(r.salary_currency); });
    exchangeRates.forEach(r => { currencies.add(r.from_currency); currencies.add(r.to_currency); });
    return Array.from(currencies).filter(Boolean);
  }, [records, exchangeRates, baseCurrency]);

  // Convert a value from a record's native currency to displayCurrency
  const conv = (value, fromCurrency) =>
    convertAmount(value, fromCurrency || baseCurrency, displayCurrency, exchangeRates);

  const cur = currSym(displayCurrency);

  const sc   = (s) => dark ? (STATUS_CONFIG_DARK[s] || STATUS_CONFIG_DARK.DRAFT) : (STATUS_CONFIG[s] || STATUS_CONFIG.DRAFT);
  const text  = dark ? "text-white" : "text-almet-cloud-burst";
  const sub   = dark ? "text-gray-500" : "text-almet-bali-hai";
  const grid  = dark ? "#1e1e1e" : "#f0f0f0";
  const axis  = dark ? "#555" : "#90a0b9";

  const approved = useMemo(() => records.filter(r => r.status === "APPROVED"), [records]);

  const kpis = useMemo(() => {
    const pool = approved.reduce((s, r) =>
      s + conv(r.total_bonus || 0, r.salary_currency), 0);
    const avgB = approved.length ? pool / approved.length : 0;
    return { pool, avgB, approvedCount: approved.length };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved, displayCurrency, exchangeRates]);

  const componentPie = useMemo(() => [
    { name: "Company Targets", value: parseFloat(approved.reduce((s, r) => s + parseFloat(r.company_targets_bonus || 0), 0).toFixed(2)), color: COMPONENT_COLORS.company      },
    { name: "Objectives",      value: parseFloat(approved.reduce((s, r) => s + parseFloat(r.objectives_bonus || 0), 0).toFixed(2)),      color: COMPONENT_COLORS.objectives   },
    { name: "Competencies",    value: parseFloat(approved.reduce((s, r) => s + parseFloat(r.competencies_bonus || 0), 0).toFixed(2)),    color: COMPONENT_COLORS.competencies },
  ], [approved]);

  const topEmployees = useMemo(() =>
    [...approved]
      .sort((a, b) => parseFloat(b.total_bonus) - parseFloat(a.total_bonus))
      .slice(0, 10)
      .map(r => ({
        name:    r.employee_name?.split(" ")[0] + (r.employee_name?.split(" ")[1] ? " " + r.employee_name.split(" ")[1][0] + "." : ""),
        company: parseFloat(r.company_targets_bonus || 0),
        obj:     parseFloat(r.objectives_bonus || 0),
        comp:    parseFloat(r.competencies_bonus || 0),
      })),
  [approved]);

  const bonusPctDist = useMemo(() => {
    const buckets = { "0–5%": 0, "5–10%": 0, "10–15%": 0, "15–20%": 0, "20–25%": 0, "25%+": 0 };
    approved.forEach(r => {
      const e = parseFloat(r.effective_salary || 0);
      if (!e) return;
      const pct = parseFloat(r.total_bonus || 0) / e * 100;
      if      (pct < 5)  buckets["0–5%"]++;
      else if (pct < 10) buckets["5–10%"]++;
      else if (pct < 15) buckets["10–15%"]++;
      else if (pct < 20) buckets["15–20%"]++;
      else if (pct < 25) buckets["20–25%"]++;
      else               buckets["25%+"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [approved]);

  const positionBreakdown = useMemo(() => {
    const map = {};
    approved.forEach(r => {
      const pos = r.job_title || r.position || "Unknown";
      if (!map[pos]) map[pos] = { count: 0, total: 0 };
      map[pos].count++;
      map[pos].total += parseFloat(r.total_bonus || 0);
    });
    return Object.entries(map)
      .map(([pos, d]) => ({ pos, count: d.count, avg: d.total / d.count, total: d.total }))
      .sort((a, b) => b.avg - a.avg);
  }, [approved]);

  const statusDist = useMemo(() => {
    const m = { DRAFT: 0, CALCULATED: 0, APPROVED: 0, PAID: 0 };
    records.forEach(r => { m[r.status] = (m[r.status] || 0) + 1; });
    return m;
  }, [records]);

  const bfOptions = useMemo(() => {
    const names = [...new Set(records.map(r => r.business_function_name).filter(Boolean))].sort();
    return names;
  }, [records]);

  const displayed = useMemo(() => {
    let list = records;
    if (filter !== "ALL") list = list.filter(r => r.status === filter);
    if (bfFilter !== "ALL") list = list.filter(r => r.business_function_name === bfFilter);
    return [...list].sort((a, b) => {
      const va = parseFloat(a[sortKey] || 0), vb = parseFloat(b[sortKey] || 0);
      const sv = isNaN(va) ? String(a[sortKey] || "").localeCompare(String(b[sortKey] || "")) : va - vb;
      return sortDir === "asc" ? sv : -sv;
    });
  }, [records, sortKey, sortDir, filter, bfFilter]);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };
  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />)
    : <ChevronDown size={10} className="opacity-25" />;

  const handleExcel = async () => {
    setExporting(true);
    try {
      const params = { bonus_year: bonusYear?.id };
      if (filter !== "ALL")    params.status             = filter;
      if (bfFilter !== "ALL")  params.business_function  = records.find(r => r.business_function_name === bfFilter)?.business_function;
      const { data } = await bonusRecordService.exportExcel(params);
      downloadBlob(data, `bonus_${bonusYear?.year || "report"}.xlsx`);
    } finally { setExporting(false); }
  };

  const openDrawer = async (row) => {
    if (row.status === "DRAFT") return;
    if (row.company_targets_breakdown) { setDrawer(row); return; }
    const { data } = await bonusRecordService.detail(row.id);
    setDrawer(data);
  };

  const handleApprove = async (id) => {
    await bonusRecordService.approve(id);
    const { data } = await bonusRecordService.detail(id);
    setDrawer(data);
  };

  //  Count zero-bonus records in the current filtered view
  const zeroCount = useMemo(() =>
    displayed.filter(r => r.zero_bonus_reason).length,
  [displayed]);

  const filterBtns = [
    { key: "ALL",        label: "All"              },
    { key: "DRAFT",      label: "Not Started"      },
    { key: "CALCULATED", label: "Ready to Approve" },
    { key: "APPROVED",   label: "Approved"         },
    { key: "PAID",       label: "Paid"             },
  ];

  const tableCols = [
    { key: "employee_name",         label: "Employee"     },
    { key: "job_title",             label: "Job Title",   render: r => r.job_title || r.position || "—" },
    { key: "salary_currency",       label: "Currency",    noSort: true },
    { key: "effective_salary",      label: `Eff. Salary (Gross) ${cur}`, right: true },
    { key: "company_targets_bonus", label: `Targets ${cur}`,  right: true },
    { key: "objectives_bonus",      label: `Objectives ${cur}`, right: true },
    { key: "competencies_bonus",    label: `Competencies ${cur}`, right: true },
    { key: "total_bonus",           label: `Total Bonus ${cur}`, right: true },
    { key: "status",                label: "Status"       },
    { key: "_action",               label: "",             noSort: true },
  ];

  const card = dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-white border-gray-100 shadow-sm";

  return (
    <>
      {drawerRecord && (
        <DetailDrawer record={drawerRecord} dark={dark} onClose={() => setDrawer(null)} onApprove={handleApprove} />
      )}

      <div className="space-y-5">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className={`text-lg font-bold ${text}`}>Bonus Report</h2>
            <p className={`text-sm mt-0.5 ${sub}`}>
              {bonusYear?.year} · {records.length} employees · {kpis.approvedCount} approved
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Currency selector */}
            {availableCurrencies.length > 1 && (
              <div className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5
                ${dark ? "border-[#2a2a2a] bg-[#111]" : "border-gray-200 bg-gray-50"}`}>
                <DollarSign size={11} className={dark ? "text-gray-500" : "text-almet-bali-hai"} />
                <span className={`text-[10px] mr-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>Display in:</span>
                {availableCurrencies.map(c => (
                  <button key={c} onClick={() => setDisplayCurrency(c)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition
                      ${displayCurrency === c
                        ? "bg-almet-sapphire text-white"
                        : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"}`}
                  >{c}</button>
                ))}
              </div>
            )}
            <div className={`flex items-center rounded-xl border p-0.5
              ${dark ? "border-[#2a2a2a] bg-[#111]" : "border-gray-200 bg-gray-100"}`}>
              {[
                { id: "dashboard", icon: BarChart2, label: "Dashboard" },
                { id: "table",     icon: Users,     label: "Table"     },
              ].map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setActiveView(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${activeView === id
                      ? dark ? "bg-almet-sapphire text-white shadow" : "bg-white text-almet-sapphire shadow-sm"
                      : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleExcel}
              disabled={exporting || !records.length}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 transition shadow-sm"
            >
              <Download size={13} /> {exporting ? "Exporting…" : "Export Excel"}
            </button>
          </div>
        </div>

        {/* ══════════ DASHBOARD ══════════ */}
        {activeView === "dashboard" && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-5 gap-5">
              <div className="md:col-span-3">
                <Section title="Top 10 by Bonus" icon={BarChart2} iconColor="text-almet-steel-blue" dark={dark} action="Approved only">
                  {topEmployees.length === 0 ? (
                    <p className={`text-center py-8 text-sm ${sub}`}>No approved records yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={topEmployees} margin={{ top: 4, right: 4, left: 0, bottom: 44 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: axis, fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                        <YAxis tick={{ fill: axis, fontSize: 10 }} tickFormatter={fmtShrt} width={44} />
                        <Tooltip content={<ChartTooltip dark={dark} />} />
                        <Bar dataKey="company" name="Company"      stackId="a" fill={COMPONENT_COLORS.company}      radius={[0,0,0,0]} />
                        <Bar dataKey="obj"     name="Objectives"   stackId="a" fill={COMPONENT_COLORS.objectives}   radius={[0,0,0,0]} />
                        <Bar dataKey="comp"    name="Competencies" stackId="a" fill={COMPONENT_COLORS.competencies} radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Section>
              </div>

              <div className="md:col-span-2">
                <Section title="Bonus Mix" icon={PieChart} iconColor="text-violet-500" dark={dark} action="Approved only">
                  {approved.length === 0 ? (
                    <p className={`text-center py-8 text-sm ${sub}`}>No approved records yet</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={170}>
                        <RechartsPie>
                          <Pie data={componentPie} cx="50%" cy="50%" innerRadius={46} outerRadius={74}
                            dataKey="value" paddingAngle={3}>
                            {componentPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={v => cur + fmt(v)} contentStyle={{
                            background: dark ? "#1a1a1a" : "#fff",
                            border: dark ? "1px solid #2e2e2e" : "1px solid #e5e7eb",
                            borderRadius: 12, fontSize: 11,
                          }} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {componentPie.map(({ name, value, color }) => {
                          const total = componentPie.reduce((s, x) => s + x.value, 0);
                          const pct   = total > 0 ? (value / total * 100).toFixed(1) : 0;
                          return (
                            <div key={name} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                              <span className={`text-xs flex-1 ${sub}`}>{name}</span>
                              <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </Section>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Section title="Bonus % Distribution" icon={BarChart2} iconColor="text-amber-500" dark={dark} action="% of effective salary">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={bonusPctDist} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="range" tick={{ fill: axis, fontSize: 11 }} />
                    <YAxis tick={{ fill: axis, fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={v => [v + " employees", "Count"]} contentStyle={{
                      background: dark ? "#1a1a1a" : "#fff",
                      border: dark ? "1px solid #2e2e2e" : "1px solid #e5e7eb",
                      borderRadius: 12, fontSize: 11,
                    }} />
                    <Bar dataKey="count" name="Employees" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Section>

              <Section title="By Position" icon={Users} iconColor="text-emerald-500" dark={dark} action="Avg bonus">
                {positionBreakdown.length === 0 ? (
                  <p className={`text-center py-8 text-sm ${sub}`}>No approved records yet</p>
                ) : (
                  <div className="space-y-3">
                    {positionBreakdown.map(({ pos, count, avg }) => {
                      const maxAvg = positionBreakdown[0]?.avg || 1;
                      const pct    = (avg / maxAvg * 100).toFixed(0);
                      return (
                        <div key={pos}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${text}`}>{pos}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold
                                ${dark ? "bg-[#222] text-gray-500" : "bg-almet-mystic text-almet-bali-hai"}`}>
                                {count}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500">{cur}{fmtShrt(avg)}</span>
                          </div>
                          <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#222]" : "bg-gray-100"}`}>
                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}

        {/* ══════════ TABLE ══════════ */}
        {activeView === "table" && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            {/* Filters */}
            <div className={`flex items-center gap-2 px-5 py-3.5 border-b flex-wrap
              ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/60"}`}>
              <span className={`text-xs font-semibold mr-1 ${sub}`}>Status:</span>
              {filterBtns.map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition
                    ${filter === key
                      ? dark ? "bg-almet-sapphire text-white" : "bg-almet-sapphire text-white"
                      : dark ? "bg-[#1a1a1a] text-gray-400 hover:text-white" : "bg-white text-almet-waterloo hover:bg-almet-mystic border border-gray-200"}`}
                >
                  {label}
                  {key !== "ALL" && <span className="ml-1 opacity-60">({statusDist[key] || 0})</span>}
                </button>
              ))}
              {bfOptions.length > 0 && (
                <>
                  <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />
                  <span className={`text-xs font-semibold ${sub}`}>Company:</span>
                  <button onClick={() => setBfFilter("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition
                      ${bfFilter === "ALL"
                        ? dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-500 text-white"
                        : dark ? "bg-[#1a1a1a] text-gray-400 hover:text-white" : "bg-white text-almet-waterloo hover:bg-almet-mystic border border-gray-200"}`}
                  >All</button>
                  {bfOptions.map(bf => (
                    <button key={bf} onClick={() => setBfFilter(bf)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition
                        ${bfFilter === bf
                          ? dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-500 text-white"
                          : dark ? "bg-[#1a1a1a] text-gray-400 hover:text-white" : "bg-white text-almet-waterloo hover:bg-almet-mystic border border-gray-200"}`}
                    >{bf}</button>
                  ))}
                </>
              )}
              <span className={`ml-auto text-xs ${sub}`}>{displayed.length} records</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-semibold
                    ${dark ? "border-[#1e1e1e] bg-[#0a0a0a] text-gray-500" : "border-gray-100 bg-gray-50/80 text-almet-bali-hai"}`}>
                    {tableCols.map(({ key, label, right, noSort }) => (
                      <th key={key}
                        onClick={() => !noSort && handleSort(key)}
                        className={`px-4 py-3 whitespace-nowrap ${right ? "text-right" : "text-left"} ${!noSort ? "cursor-pointer hover:opacity-75 select-none" : ""}`}
                      >
                        {label && (
                          <span className="inline-flex items-center gap-1">
                            {label} {!noSort && <SortIcon k={key} />}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(r => {
                    const cfg          = sc(r.status);
                    const isCalculated = r.status !== "DRAFT";
                    const isZero       = Boolean(r.zero_bonus_reason);

                    return (
                      <tr key={r.id}
                        className={`border-t transition
                          ${isZero
                            ? dark ? "border-[#1a1a1a] bg-red-500/5 hover:bg-red-500/10"
                                   : "border-red-100 bg-red-50/40 hover:bg-red-50"
                            : dark ? "border-[#1a1a1a] hover:bg-[#0d0d0d]"
                                   : "border-gray-50 hover:bg-almet-mystic/20"}
                          ${isCalculated ? "cursor-pointer" : ""}`}
                        onClick={() => isCalculated && openDrawer(r)}
                      >
                     
                        <td className={`px-4 py-3 font-bold whitespace-nowrap ${text}`}>{r.employee_name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-semibold
                            ${dark ? "bg-almet-sapphire/15 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
                            {r.job_title || r.position || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-semibold
                            ${dark ? "bg-[#1a1a1a] text-gray-400" : "bg-gray-100 text-gray-600"}`}>
                            {r.salary_currency || "AZN"}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right text-xs font-mono ${sub}`}>
                          <span title="Gross salary">
                            {cur}{fmt(conv(r.effective_salary, r.salary_currency))}
                          </span>
                          <span className={`ml-1 text-[9px] font-bold px-1 rounded
                            ${dark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>G</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-mono text-almet-steel-blue">{cur}{fmt(conv(r.company_targets_bonus, r.salary_currency))}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-mono text-amber-500">{cur}{fmt(conv(r.objectives_bonus, r.salary_currency))}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-mono text-violet-500">{cur}{fmt(conv(r.competencies_bonus, r.salary_currency))}</span>
                        </td>

                        {/*  Total bonus cell — red badge when zero */}
                        <td className="px-4 py-3 text-right">
                          {isZero ? (
                            <span
                              title={r.zero_bonus_reason}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-bold cursor-help
                                ${dark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600 border border-red-200"}`}
                            >
                              <AlertTriangle size={10} /> 0.00
                            </span>
                          ) : (
                            <span className={`text-sm font-bold tabular-nums ${isCalculated ? "text-emerald-500" : sub}`}>
                              {cur}{fmt(conv(r.total_bonus, r.salary_currency))}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isCalculated && (
                            <button
                              onClick={e => { e.stopPropagation(); openDrawer(r); }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition
                                ${dark
                                  ? "bg-[#1e1e1e] text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                                  : "bg-almet-mystic text-almet-sapphire hover:bg-almet-bali-hai/20"}`}
                            >
                              <Eye size={11} /> View
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {displayed.length === 0 && (
                    <tr>
                      <td colSpan={10} className={`text-center py-16 text-sm ${sub}`}>
                        No records match the selected filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer totals */}
            {displayed.length > 0 && (
              <div className={`flex items-center justify-end gap-4 px-5 py-3.5 border-t flex-wrap
                ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/60"}`}>
                <span className={`text-xs ${sub}`}>{displayed.length} rows</span>

                {/*  Zero bonus count badge in footer */}
                {zeroCount > 0 && (
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold
                    ${dark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600 border border-red-200"}`}>
                    <AlertTriangle size={11} /> {zeroCount} zero bonus
                  </span>
                )}

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-almet-steel-blue">
                    Company: <b>{fmt(displayed.reduce((s, r) => s + parseFloat(r.company_targets_bonus || 0), 0))}</b>
                  </span>
                  <span className="text-amber-500">
                    Objectives: <b>{fmt(displayed.reduce((s, r) => s + parseFloat(r.objectives_bonus || 0), 0))}</b>
                  </span>
                  <span className="text-violet-500">
                    Competencies: <b>{fmt(displayed.reduce((s, r) => s + parseFloat(r.competencies_bonus || 0), 0))}</b>
                  </span>
                  <span className="text-emerald-500 font-bold text-sm">
                    Total: {cur}{fmt(displayed.reduce((s, r) => s + parseFloat(r.total_bonus || 0), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}