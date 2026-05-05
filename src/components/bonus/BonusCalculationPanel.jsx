"use client";
import { useState, useEffect, useRef } from "react";
import { bonusRecordService, exchangeRateService, downloadBlob } from "@/services/bonusService";
import {
  Search, CheckCircle, Download, ChevronDown, ChevronUp,
  Calculator, Users, TrendingUp, Target, Brain, RefreshCw,
  AlertTriangle, DollarSign,
} from "lucide-react";

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT:      { label: "Not Started",      bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400",   ring: "ring-slate-200"   },
  CALCULATED: { label: "Ready to Approve", bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-500",    ring: "ring-blue-100"    },
  APPROVED:   { label: "Approved",         bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", ring: "ring-emerald-100" },
  PAID:       { label: "Paid",             bg: "bg-violet-50",  text: "text-violet-600",  dot: "bg-violet-500",  ring: "ring-violet-100"  },
};
const STATUS_CONFIG_DARK = {
  DRAFT:      { label: "Not Started",      bg: "bg-slate-800",      text: "text-slate-400",   dot: "bg-slate-500",   ring: "ring-slate-700"      },
  CALCULATED: { label: "Ready to Approve", bg: "bg-blue-500/15",    text: "text-blue-400",    dot: "bg-blue-500",    ring: "ring-blue-500/30"    },
  APPROVED:   { label: "Approved",         bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500", ring: "ring-emerald-500/30" },
  PAID:       { label: "Paid",             bg: "bg-violet-500/15",  text: "text-violet-400",  dot: "bg-violet-500",  ring: "ring-violet-500/30"  },
};

// ─── Currency helpers ──────────────────────────────────────────────────────
const CURRENCY_SYMBOLS = { AZN: "₼", USD: "$", EUR: "€", GBP: "£", TRY: "₺", RUB: "₽" };
const CURRENCY_LABELS  = { AZN: "AZN", USD: "USD", EUR: "EUR", GBP: "GBP", TRY: "TRY", RUB: "RUB" };
function currencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || code || "₼";
}
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


function EmployeeDropdown({ records, selected, onSelect, dark }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState("");
  const [bfFilter, setBfFilter] = useState("ALL");
  const ref             = useRef(null);
  // FIX: onSelect-i ref-də saxla ki, həmişə ən yeni versiyası işləsin
  const onSelectRef     = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const bfOptions = [...new Set(records.map(r => r.business_function_name).filter(Boolean))].sort();

  const filtered = records.filter(r => {
    const matchQ  = r.employee_name?.toLowerCase().includes(q.toLowerCase()) ||
                    r.employee_id_code?.toLowerCase().includes(q.toLowerCase());
    const matchBf = bfFilter === "ALL" || r.business_function_name === bfFilter;
    return matchQ && matchBf;
  });

  const statCfg = (s) => dark
    ? (STATUS_CONFIG_DARK[s] || STATUS_CONFIG_DARK.DRAFT)
    : (STATUS_CONFIG[s] || STATUS_CONFIG.DRAFT);

  const handleSelect = (r) => {
    onSelectRef.current(r);   // FIX: ref vasitəsilə çağır
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <button
        onClick={() => { setOpen(o => !o); setQ(""); }}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-xl border text-sm font-medium transition-all
          ${dark
            ? "bg-[#1a1a1a] border-[#2e2e2e] text-white hover:border-[#3e3e3e]"
            : "bg-gray-50 border-gray-200 text-gray-800 hover:border-almet-bali-hai hover:bg-white"}`}
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${statCfg(selected.status).dot}`} />
            <span className="truncate text-sm">{selected.employee_name}</span>
            <span className={`text-xs shrink-0 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
              {selected.employee_id_code}
            </span>
          </div>
        ) : (
          <span className={dark ? "text-gray-500" : "text-almet-bali-hai"}>Select employee…</span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""} shrink-0 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}
        />
      </button>

      {open && (
        <div className={`absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border shadow-2xl overflow-hidden
          ${dark ? "bg-[#161616] border-[#2e2e2e]" : "bg-white border-gray-200"}`}>
          <div className={`p-2.5 border-b ${dark ? "border-[#2e2e2e]" : "border-gray-100"}`}>
            <div className="relative mb-2">
              <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`} />
              <input
                autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search by name or badge…"
                className={`w-full pl-8 pr-3 py-2 rounded-lg border text-xs outline-none transition
                  ${dark
                    ? "bg-[#222] border-[#333] text-white placeholder-gray-600 focus:border-almet-steel-blue"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:bg-white"}`}
              />
            </div>
            {bfOptions.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {["ALL", ...bfOptions].map(bf => (
                  <button key={bf} type="button" onClick={() => setBfFilter(bf)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition
                      ${bfFilter === bf
                        ? dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-500 text-white"
                        : dark ? "bg-[#2a2a2a] text-gray-500 hover:text-gray-300" : "bg-gray-100 text-gray-500 hover:bg-almet-mystic"}`}
                  >{bf === "ALL" ? "All" : bf}</button>
                ))}
              </div>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className={`text-center py-6 text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>No employees found</p>
            ) : filtered.map(r => {
              const s = statCfg(r.status);
              return (
                <button key={r.id}
                  onClick={() => { if (r.has_performance !== false || r.status !== "DRAFT") handleSelect(r); }}
                  disabled={r.has_performance === false && r.status === "DRAFT"}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition
                    ${r.has_performance === false
                      ? "opacity-40 cursor-not-allowed"
                      : dark ? "hover:bg-[#1f1f1f]" : "hover:bg-almet-mystic/50"}
                    ${selected?.id === r.id ? (dark ? "bg-almet-sapphire/10" : "bg-almet-mystic") : ""}`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
                      {r.employee_name}
                    </p>
                    <p className={`text-xs ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                      {r.employee_id_code} · {r.job_title || r.position || "—"}
                      {r.has_performance === false && (
                        <span className="ml-1.5 text-amber-400">· performance pending</span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${s.bg} ${s.text}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rating Badge ──────────────────────────────────────────────────────────
function RatingBadge({ name, pct, dark }) {
  if (!name) return <span className={dark ? "text-gray-600" : "text-gray-300"}>—</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-semibold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>{name}</span>
      {pct != null && pct > 0 && (
        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-xs font-bold">
          {pct}%
        </span>
      )}
    </div>
  );
}

// ─── Bonus Breakdown Section ───────────────────────────────────────────────
function BonusSection({ icon: Icon, title, subtitle, total, color, bgColor, rows, cols, open, onToggle, dark }) {
  return (
    <div className={`rounded-xl border overflow-hidden
      ${dark ? "border-[#1e1e1e] bg-[#0f0f0f]" : "border-gray-100 bg-white shadow-sm"}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 transition
          ${dark ? "hover:bg-[#141414]" : "hover:bg-gray-50/60"}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${bgColor}`}>
            <Icon size={14} className={color} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>{title}</p>
            {subtitle && (
              <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-base font-bold tabular-nums ${color}`}>{total}</span>
          {open
            ? <ChevronUp   size={13} className={dark ? "text-gray-500" : "text-gray-400"} />
            : <ChevronDown size={13} className={dark ? "text-gray-500" : "text-gray-400"} />}
        </div>
      </button>

      {open && (
        <div className={`border-t ${dark ? "border-[#1e1e1e]" : "border-gray-100"}`}>
          {rows.length === 0 ? (
            <p className={`text-center py-5 text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontSize: "11px" }}>
                <thead>
                  <tr className={`border-b ${dark ? "border-[#1e1e1e] bg-[#0a0a0a] text-gray-500" : "border-gray-100 bg-gray-50/80 text-almet-bali-hai"}`}>
                    {cols.map(c => (
                      <th key={c.key} className={`px-3 py-2 font-semibold text-left ${c.right ? "text-right" : ""}`}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-t transition
                      ${dark ? "border-[#1e1e1e] hover:bg-[#111]" : "border-gray-100 hover:bg-gray-50/60"}`}>
                      {cols.map(c => (
                        <td key={c.key} className={`px-3 py-2.5 ${dark ? "text-gray-300" : "text-gray-600"} ${c.right ? "text-right font-mono" : ""}`}>
                          {c.render ? c.render(row) : (c.fmt ? c.fmt(row[c.key]) : (row[c.key] ?? "—"))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function BonusCalculationPanel({
  records, loading, selectedRecord, onSelectRecord, bonusYear, dark, onUpdate,
}) {
  const [detail,          setDetail]         = useState(null);
  const [fetching,        setFetch]          = useState(false);
  const [saving,          setSaving]         = useState(null);
  const [open,            setOpen]           = useState({ targets: true, objectives: true, competencies: true });
  const [listQ,           setListQ]          = useState("");
  const [listBf,          setListBf]         = useState("ALL");
  const [exchangeRates,   setExchangeRates]  = useState([]);
  const [displayCurrency, setDisplayCurrency] = useState(null); // null = use employee's own currency

  const statusCfg = (s) => dark
    ? (STATUS_CONFIG_DARK[s] || STATUS_CONFIG_DARK.DRAFT)
    : (STATUS_CONFIG[s] || STATUS_CONFIG.DRAFT);

  useEffect(() => {
    if (!selectedRecord) { setDetail(null); return; }
    setFetch(true);
    bonusRecordService.detail(selectedRecord.id)
      .then(({ data }) => setDetail(data))
      .finally(() => setFetch(false));
  // Use the full object as dep so a fresh object (same id) still triggers re-fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecord]);

  useEffect(() => {
    if (!detail) return;
    const updated = records.find(r => r.id === detail.id);
    if (updated && updated.status !== detail.status) {
      bonusRecordService.detail(detail.id).then(({ data }) => setDetail(data));
    }
  }, [records]);

  // Load live exchange rates from CBAR (no DB)
  useEffect(() => {
    exchangeRateService.liveRates()
      .then(({ data }) => setExchangeRates(data.rates ?? []))
      .catch(() => setExchangeRates([]));
  }, []);

  const handleCalculate = async () => {
    if (!detail || bonusYear?.is_locked) return;
    setSaving("calc");
    try {
      const { data } = await bonusRecordService.calculate(detail.id);
      setDetail(data.record || data);
      onUpdate();
    } catch (e) { console.error(e); }
    finally { setSaving(null); }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setSaving("approve");
    try {
      await bonusRecordService.approve(detail.id);
      const { data } = await bonusRecordService.detail(detail.id);
      setDetail(data);
      onUpdate();
    } finally { setSaving(null); }
  };

  const handlePdf = async () => {
    if (!detail) return;
    const { data } = await bonusRecordService.exportPdf(detail.id);
    downloadBlob(data, `bonus_${detail.employee_id_code}.pdf`);
  };

  // ── currency helpers ─────────────────────────────────────────────────────
  const nativeCurrency = detail?.salary_currency || bonusYear?.base_currency || "AZN";
  const currency       = displayCurrency || nativeCurrency;
  const sym            = currencySymbol(currency);

  // Available currencies for the selector: native + any currency in exchange rates
  const availableCurrencies = [
    nativeCurrency,
    ...(bonusYear?.base_currency && bonusYear.base_currency !== nativeCurrency ? [bonusYear.base_currency] : []),
    ...exchangeRates.map(r => r.to_currency),
    ...exchangeRates.map(r => r.from_currency),
  ].filter((c, i, arr) => c && arr.indexOf(c) === i);

  const fmt = v =>
    v != null
      ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";

  // Convert from employee's native currency to display currency, then format
  const fmtC = v => {
    const converted = convertAmount(v, nativeCurrency, currency, exchangeRates);
    return `${fmt(converted)} ${sym}`;
  };

  const toggle = id => setOpen(o => ({ ...o, [id]: !o[id] }));

  const canCalculate = detail && !bonusYear?.is_locked &&
    (detail.status === "DRAFT" || detail.status === "CALCULATED");
  const canApprove = detail?.status === "CALCULATED" && !bonusYear?.is_locked;

  const isZeroBonus   = detail?.notes?.startsWith("[ZERO]");
  const zeroBonusText = isZeroBonus ? detail.notes.replace("[ZERO] ", "") : null;

  const listBfOptions = [...new Set(records.map(r => r.business_function_name).filter(Boolean))].sort();
  const listFiltered  = records.filter(r => {
    const matchQ  = r.employee_name?.toLowerCase().includes(listQ.toLowerCase()) ||
                    r.employee_id_code?.toLowerCase().includes(listQ.toLowerCase());
    const matchBf = listBf === "ALL" || r.business_function_name === listBf;
    return matchQ && matchBf;
  });

  const salaryItems = detail ? [
    { label: "Yearly Salary (Gross)", value: fmtC(detail.yearly_salary), accent: null, gross: true },
    { label: "Worked Months",         value: detail.worked_months,        accent: null              },
    { label: "Prorata Salary",        value: fmtC(detail.prorata_salary), accent: "text-orange-500" },
    {
      label: detail.use_adjusted_salary ? "Adjusted Salary ✓" : "Adjusted Salary",
      value: detail.adjusted_yearly_salary ? fmtC(detail.adjusted_yearly_salary) : "—",
      accent: detail.use_adjusted_salary ? "text-almet-steel-blue" : null,
    },
    {
      label: "Effective Salary (Gross)",
      value: fmtC(detail.effective_salary),
      highlight: true,
      accent: "text-emerald-500",
      gross: true,
    },
  ] : [];

  const card = dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-white border-gray-200 shadow-sm";

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-4">

      {/* ── Left: Employee List ── */}
      <div className={`rounded-2xl border overflow-hidden self-start ${card}`}>
        <div className={`px-4 py-3 border-b ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={13} className="text-almet-steel-blue" />
            <span className={`text-sm font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>Employees</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold
              ${dark ? "bg-almet-sapphire/15 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
              {listFiltered.length}
            </span>
          </div>
          <div className="relative mb-2">
            <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`} />
            <input value={listQ} onChange={e => setListQ(e.target.value)}
              placeholder="Search name or badge…"
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none transition
                ${dark ? "bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 focus:border-almet-steel-blue/50"
                       : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire"}`} />
          </div>
          {listBfOptions.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {["ALL", ...listBfOptions].map(bf => (
                <button key={bf} type="button" onClick={() => setListBf(bf)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition
                    ${listBf === bf
                      ? dark ? "bg-almet-sapphire/20 text-almet-steel-blue" : "bg-almet-sapphire text-white"
                      : dark ? "bg-[#1e1e1e] text-gray-500 hover:text-gray-300" : "bg-gray-100 text-gray-500 hover:bg-almet-mystic"}`}
                >{bf === "ALL" ? "All" : bf}</button>
              ))}
            </div>
          )}
        </div>
        <div className="divide-y max-h-[calc(100vh-260px)] overflow-y-auto"
          style={{ borderColor: dark ? "#1e1e1e" : "#f3f4f6" }}>
          {listFiltered.length === 0 && (
            <p className={`text-center py-10 text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>
              {records.length === 0 ? "No employees yet" : "No matches"}
            </p>
          )}
          {listFiltered.map(r => {
            const s     = statusCfg(r.status);
            const isSel = selectedRecord?.id === r.id;
            // Only block clicking for DRAFT employees without a performance evaluation.
            // Approved/calculated employees are always clickable.
            const isNoPerf = r.has_performance === false && r.status === "DRAFT";
            return (
              <button key={r.id}
                onClick={() => !isNoPerf && onSelectRecord(r)}
                disabled={isNoPerf}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition
                  ${isNoPerf ? "opacity-40 cursor-not-allowed" : ""}
                  ${isSel
                    ? dark ? "bg-almet-sapphire/10" : "bg-almet-mystic"
                    : dark ? "hover:bg-[#111]" : "hover:bg-gray-50/60"}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
                    {r.employee_name}
                  </p>
                  <p className={`text-xs truncate ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                    {r.employee_id_code} · {r.job_title || r.position || "—"}
                    {isNoPerf && <span className="ml-1 text-amber-400"> · no performance</span>}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.bg} ${s.text}`}>
                    {s.label}
                  </span>
                  {r.status !== "DRAFT" && (
                    <span className={`text-[10px] font-bold tabular-nums text-emerald-500`}>
                      {currencySymbol(r.salary_currency)}{parseFloat(r.total_bonus || 0).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Detail Panel ── */}
      <div>
      {!selectedRecord ? (
        <div className={`rounded-2xl border p-16 text-center ${card}`}>
          <div className={`inline-flex p-5 rounded-2xl mb-5 ${dark ? "bg-[#141414]" : "bg-almet-mystic"}`}>
            <Calculator size={32} className="text-almet-steel-blue" />
          </div>
          <p className={`text-base font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
            Select an employee to begin
          </p>
          <p className={`text-sm mt-2 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
            Choose from the list on the left. Then click <b>Calculate Bonus</b> and <b>Approve</b>.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { n: "1", label: "Select employee", color: "text-almet-steel-blue", bg: dark ? "bg-almet-sapphire/15" : "bg-almet-mystic" },
              { n: "2", label: "Calculate bonus",  color: "text-amber-500",        bg: dark ? "bg-amber-500/10" : "bg-amber-50" },
              { n: "3", label: "Approve",          color: "text-emerald-500",      bg: dark ? "bg-emerald-500/10" : "bg-emerald-50" },
            ].map(({ n, label, color, bg }) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${bg} ${color}`}>{n}</div>
                <span className={`text-xs font-medium ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

      ) : fetching ? (
        <div className={`rounded-2xl border p-16 flex items-center justify-center ${card}`}>
          <div className="w-7 h-7 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
        </div>

      ) : detail ? (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className="p-5">
        <div className="space-y-4">

            {/* Employee info + actions */}
            <div className={`flex flex-wrap items-start justify-between gap-4 p-4 rounded-xl border
              ${dark ? "border-[#1e1e1e] bg-[#141414]" : "border-gray-100 bg-gray-50"}`}>
              <div>
                <h2 className={`text-base font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
                  {detail.employee_name}
                </h2>
                <p className={`text-xs mt-0.5 ${dark ? "text-gray-400" : "text-almet-bali-hai"}`}>
                  {detail.employee_id_code} · {detail.job_title || detail.position || "—"}
                </p>
                {detail.calculated_at && (
                  <p className={`text-[10px] mt-1.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>
                    Last calculated:{" "}
                    {new Date(detail.calculated_at).toLocaleString("en", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Currency selector */}
                {availableCurrencies.length > 1 && (
                  <div className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5
                    ${dark ? "border-[#2a2a2a] bg-[#111]" : "border-gray-200 bg-gray-50"}`}>
                    <DollarSign size={11} className={dark ? "text-gray-500" : "text-almet-bali-hai"} />
                    <span className={`text-[10px] mr-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>Display in:</span>
                    {availableCurrencies.map(c => (
                      <button
                        key={c}
                        onClick={() => setDisplayCurrency(c === nativeCurrency && displayCurrency === null ? null : c)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition
                          ${(displayCurrency === c || (!displayCurrency && c === nativeCurrency))
                            ? "bg-almet-sapphire text-white"
                            : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={handlePdf}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition
                    ${dark
                      ? "border-[#2e2e2e] text-gray-400 hover:text-white hover:border-[#3e3e3e]"
                      : "border-gray-200 text-almet-waterloo hover:bg-almet-mystic hover:border-almet-bali-hai"}`}
                >
                  <Download size={12} /> PDF
                </button>

                {canCalculate && (
                  <button
                    onClick={handleCalculate}
                    disabled={saving === "calc"}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-60 transition shadow-sm
                      ${detail.status === "CALCULATED"
                        ? "bg-almet-san-juan hover:bg-almet-cloud-burst"
                        : "bg-almet-sapphire hover:bg-almet-astral"}`}
                  >
                    {saving === "calc"
                      ? <><RefreshCw size={12} className="animate-spin" /> Calculating…</>
                      : detail.status === "CALCULATED"
                        ? <><RefreshCw size={12} /> Recalculate</>
                        : <><Calculator size={12} /> Calculate Bonus</>}
                  </button>
                )}

                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={saving === "approve"}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60 transition shadow-sm"
                  >
                    <CheckCircle size={12} />
                    {saving === "approve" ? "Approving…" : "Final Approve"}
                  </button>
                )}
              </div>
            </div>

            {/* Salary strip */}
            <div className={`grid grid-cols-5 gap-2 p-3 rounded-xl border
              ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/70"}`}>
              {salaryItems.map(({ label, value, highlight, accent, gross }) => (
                <div
                  key={label}
                  className={`text-center px-2 py-2.5 rounded-lg relative
                    ${highlight
                      ? dark ? "bg-emerald-500/10 ring-1 ring-emerald-500/25" : "bg-emerald-50 ring-1 ring-emerald-200"
                      : dark ? "bg-[#141414]" : "bg-white border border-gray-100"}`}
                >
                  {gross && (
                    <span className={`absolute top-1 right-1 text-[8px] font-bold px-1 rounded
                      ${dark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
                      Gross
                    </span>
                  )}
                  <p style={{ fontSize: "10px" }} className={`mb-1 leading-tight font-medium
                    ${highlight
                      ? dark ? "text-emerald-500" : "text-emerald-600"
                      : dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                    {label}
                  </p>
                  <p className={`text-xs font-bold tabular-nums ${accent || (dark ? "text-white" : "text-almet-cloud-burst")}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* DRAFT — no salary */}
            {detail.status === "DRAFT" && parseFloat(detail.effective_salary) === 0 ? (
              <div className={`rounded-xl border p-10 text-center ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
                <div className={`inline-flex p-4 rounded-2xl mb-4 ${dark ? "bg-[#1a1a1a]" : "bg-almet-mystic"}`}>
                  <Calculator size={26} className="text-almet-steel-blue" />
                </div>
                <p className={`text-sm font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>Salary not set</p>
                <p className={`text-xs mt-1.5 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                  Go to <b>Settings → Salary Setup</b> to enter this employee's salary, then come back to calculate.
                </p>
              </div>

            ) : detail.status === "DRAFT" ? (
              <div className={`rounded-xl border p-10 text-center ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
                <div className={`inline-flex p-4 rounded-2xl mb-4 ${dark ? "bg-[#1a1a1a]" : "bg-almet-mystic"}`}>
                  <Calculator size={26} className="text-almet-steel-blue" />
                </div>
                <p className={`text-sm font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>Bonus not yet calculated</p>
                <p className={`text-xs mt-1.5 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                  {bonusYear?.is_locked
                    ? "This bonus year is locked — calculation is disabled"
                    : `Click "Calculate Bonus" above to run the calculation`}
                </p>
              </div>

            ) : (
              <>
                {/* Zero bonus alert */}
                {isZeroBonus && (
                  <div className={`rounded-xl border p-4 flex items-start gap-3
                    ${dark ? "border-red-500/20 bg-red-500/10" : "border-red-200 bg-red-50"}`}>
                    <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${dark ? "bg-red-500/20" : "bg-red-100"}`}>
                      <AlertTriangle size={14} className={dark ? "text-red-400" : "text-red-600"} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${dark ? "text-red-400" : "text-red-700"}`}>
                        Zero Bonus Applied
                      </p>
                      <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-red-400/80" : "text-red-600"}`}>
                        {zeroBonusText}
                      </p>
                      <p className={`text-xs mt-1.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                        All bonus components have been automatically set to zero.
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. Company Targets */}
                <BonusSection
                  icon={Target}
                  title="Company Targets Bonus"
                  subtitle={`${(detail.company_targets_breakdown || []).length} targets`}
                  total={fmtC(detail.company_targets_bonus)}
                  color="text-sky-500"
                  bgColor={dark ? "bg-sky-500/15" : "bg-sky-50"}
                  rows={detail.company_targets_breakdown || []}
                  open={open.targets}
                  onToggle={() => toggle("targets")}
                  dark={dark}
                  cols={[
                    { key: "target_name",  label: "Target" },
                    { key: "weight_pct",   label: "Weight",    right: true, fmt: v => `${v}%` },
                    { key: "rating_name",  label: "Rating",
                      render: row => <RatingBadge name={row.rating_name} pct={row.bonus_salary_pct} dark={dark} /> },
                    { key: "bonus_amount", label: `Bonus (${sym})`, right: true, fmt },
                  ]}
                />

                {/* 2. Objectives */}
                <BonusSection
                  icon={TrendingUp}
                  title="Individual Objectives Bonus"
                  subtitle={`${(detail.objectives_breakdown || []).length} objectives`}
                  total={fmtC(detail.objectives_bonus)}
                  color="text-amber-500"
                  bgColor={dark ? "bg-amber-500/15" : "bg-amber-50"}
                  rows={detail.objectives_breakdown || []}
                  open={open.objectives}
                  onToggle={() => toggle("objectives")}
                  dark={dark}
                  cols={[
                    { key: "title",               label: "Objective" },
                    { key: "original_weight",     label: "Weight",      right: true, fmt: v => `${v}%` },
                    { key: "adjusted_weight_pct", label: "Adj. Weight", right: true, fmt: v => `${parseFloat(v).toFixed(1)}%` },
                    { key: "rating_name",         label: "Rating",
                      render: row => <RatingBadge name={row.rating_name} pct={row.bonus_salary_pct} dark={dark} /> },
                    { key: "bonus_amount", label: `Bonus (${sym})`, right: true, fmt },
                  ]}
                />

                {/* 3. Competencies */}
                <BonusSection
                  icon={Brain}
                  title="Competencies Bonus"
                  subtitle={`${(detail.competencies_breakdown || []).length} groups`}
                  total={fmtC(detail.competencies_bonus)}
                  color="text-violet-500"
                  bgColor={dark ? "bg-violet-500/15" : "bg-violet-50"}
                  rows={detail.competencies_breakdown || []}
                  open={open.competencies}
                  onToggle={() => toggle("competencies")}
                  dark={dark}
                  cols={[
                    { key: "group_name",       label: "Group" },
                    { key: "competency_type",  label: "Type"  },
                    { key: "weight_pct",       label: "Weight", right: true, fmt: v => `${v}%` },
                    { key: "group_percentage", label: "Score",  right: true, fmt: v => `${parseFloat(v).toFixed(1)}%` },
                    { key: "rating_name",      label: "Rating",
                      render: row => <RatingBadge name={row.rating_name} pct={row.bonus_salary_pct} dark={dark} /> },
                    { key: "bonus_amount", label: `Bonus (${sym})`, right: true, fmt },
                  ]}
                />

                {/* Total summary */}
                <div className={`rounded-xl border p-5
                  ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-almet-mystic bg-almet-mystic/40"}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                          Total Bonus
                        </p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded
                          ${dark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
                          Gross
                        </span>
                        {displayCurrency && displayCurrency !== nativeCurrency && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded
                            ${dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                            Converted to {displayCurrency}
                          </span>
                        )}
                      </div>
                      <p className={`text-xl font-bold mt-1 tabular-nums
                        ${isZeroBonus ? "text-red-500" : dark ? "text-white" : "text-almet-cloud-burst"}`}>
                        {fmtC(detail.total_bonus)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>% of Effective Salary</p>
                      <p className={`text-2xl font-bold tabular-nums ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
                        {parseFloat(detail.effective_salary) > 0
                          ? `${((parseFloat(detail.total_bonus) / parseFloat(detail.effective_salary)) * 100).toFixed(1)}%`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Company Targets", value: detail.company_targets_bonus, bar: "bg-sky-500",    text: "text-sky-500"    },
                      { label: "Objectives",      value: detail.objectives_bonus,      bar: "bg-amber-500",  text: "text-amber-500"  },
                      { label: "Competencies",    value: detail.competencies_bonus,    bar: "bg-violet-500", text: "text-violet-500" },
                    ].map(({ label, value, bar, text }) => {
                      const pct = parseFloat(detail.total_bonus) > 0
                        ? (parseFloat(value) / parseFloat(detail.total_bonus) * 100) : 0;
                      return (
                        <div key={label} className={`p-3 rounded-lg ${dark ? "bg-[#141414]" : "bg-white"}`}>
                          <p className={`text-xs mb-1 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>{label}</p>
                          <p className={`text-sm font-bold tabular-nums ${text}`}>{fmtC(value)}</p>
                          <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#222]" : "bg-gray-100"}`}>
                            <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className={`text-xs mt-1 ${dark ? "text-gray-600" : "text-almet-bali-hai"}`}>{pct.toFixed(0)}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}