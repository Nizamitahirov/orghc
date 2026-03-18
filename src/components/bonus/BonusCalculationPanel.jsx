"use client";
import { useState, useEffect, useRef } from "react";
import { bonusRecordService, downloadBlob } from "@/services/bonusService";
import {
  Search, CheckCircle, Download, ChevronDown, ChevronUp,
  Calculator, Users, TrendingUp, Target, Brain, RefreshCw,
  AlertTriangle,
} from "lucide-react";

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT:      { label: "Draft",      bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400",   ring: "ring-slate-200"   },
  CALCULATED: { label: "Calculated", bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-500",    ring: "ring-blue-100"    },
  APPROVED:   { label: "Approved",   bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", ring: "ring-emerald-100" },
  PAID:       { label: "Paid",       bg: "bg-violet-50",  text: "text-violet-600",  dot: "bg-violet-500",  ring: "ring-violet-100"  },
};
const STATUS_CONFIG_DARK = {
  DRAFT:      { label: "Draft",      bg: "bg-slate-800",      text: "text-slate-400",   dot: "bg-slate-500",   ring: "ring-slate-700"      },
  CALCULATED: { label: "Calculated", bg: "bg-blue-500/15",    text: "text-blue-400",    dot: "bg-blue-500",    ring: "ring-blue-500/30"    },
  APPROVED:   { label: "Approved",   bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500", ring: "ring-emerald-500/30" },
  PAID:       { label: "Paid",       bg: "bg-violet-500/15",  text: "text-violet-400",  dot: "bg-violet-500",  ring: "ring-violet-500/30"  },
};

// ─── Currency symbol helper ────────────────────────────────────────────────
const CURRENCY_SYMBOLS = { AZN: "₼", USD: "$", EUR: "€", GBP: "£", TRY: "₺", RUB: "₽" };
function currencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || code || "₼";
}


function EmployeeDropdown({ records, selected, onSelect, dark }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState("");
  const ref             = useRef(null);
  // FIX: onSelect-i ref-də saxla ki, həmişə ən yeni versiyası işləsin
  const onSelectRef     = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = records.filter(r =>
    r.employee_name?.toLowerCase().includes(q.toLowerCase()) ||
    r.employee_id_code?.toLowerCase().includes(q.toLowerCase())
  );

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
            <div className="relative">
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
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className={`text-center py-6 text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>No employees found</p>
            ) : filtered.map(r => {
              const s = statCfg(r.status);
              return (
                <button key={r.id}
                  onClick={() => { if (r.has_performance !== false) handleSelect(r); }}
                  disabled={r.has_performance === false}
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
                      {r.employee_id_code} · {r.position}
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
  const [detail,  setDetail]  = useState(null);
  const [fetching,setFetch]   = useState(false);
  const [saving,  setSaving]  = useState(null);
  const [open,    setOpen]    = useState({ targets: true, objectives: true, competencies: true });

  const statusCfg = (s) => dark
    ? (STATUS_CONFIG_DARK[s] || STATUS_CONFIG_DARK.DRAFT)
    : (STATUS_CONFIG[s] || STATUS_CONFIG.DRAFT);

  useEffect(() => {
    if (!selectedRecord) { setDetail(null); return; }
    setFetch(true);
    bonusRecordService.detail(selectedRecord.id)
      .then(({ data }) => setDetail(data))
      .finally(() => setFetch(false));
  }, [selectedRecord?.id]);

  useEffect(() => {
    if (!detail) return;
    const updated = records.find(r => r.id === detail.id);
    if (updated && updated.status !== detail.status) {
      bonusRecordService.detail(detail.id).then(({ data }) => setDetail(data));
    }
  }, [records]);

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
  const currency = detail?.salary_currency || "AZN";
  const sym      = currencySymbol(currency);

  const fmt = v =>
    v != null
      ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";

  // format + append currency symbol
  const fmtC = v => `${fmt(v)} ${sym}`;

  const toggle = id => setOpen(o => ({ ...o, [id]: !o[id] }));

  const canCalculate = detail && !bonusYear?.is_locked &&
    (detail.status === "DRAFT" || detail.status === "CALCULATED");
  const canApprove = detail?.status === "CALCULATED" && !bonusYear?.is_locked;

  const isZeroBonus   = detail?.notes?.startsWith("[ZERO]");
  const zeroBonusText = isZeroBonus ? detail.notes.replace("[ZERO] ", "") : null;

  const salaryItems = detail ? [
    { label: "Yearly Salary",  value: fmtC(detail.yearly_salary),         accent: null              },
    { label: "Worked Months",  value: detail.worked_months,                accent: null              },
    { label: "Prorata Salary", value: fmtC(detail.prorata_salary),         accent: "text-orange-500" },
    {
      label: detail.use_adjusted_salary ? "Adjusted Salary ✓" : "Adjusted Salary",
      value: detail.adjusted_yearly_salary ? fmtC(detail.adjusted_yearly_salary) : "—",
      accent: detail.use_adjusted_salary ? "text-almet-steel-blue" : null,
    },
    {
      label: "Effective Salary",
      value: fmtC(detail.effective_salary),
      highlight: true,
      accent: "text-emerald-500",
    },
  ] : [];

  return (
    <div className={`rounded-2xl border overflow-hidden
      ${dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-white border-gray-200 shadow-sm"}`}>

      {/* ── Header ── */}
      <div className={`px-5 py-4 border-b flex flex-wrap items-center gap-3
        ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/50"}`}>
        <div className="flex items-center gap-2 shrink-0">
          <div className={`p-1.5 rounded-lg ${dark ? "bg-[#1a1a1a]" : "bg-almet-mystic"}`}>
            <Users size={14} className="text-almet-steel-blue" />
          </div>
          <span className={`text-sm font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>Employee</span>
        </div>

        <EmployeeDropdown
          records={records}
          selected={selectedRecord}
          onSelect={onSelectRecord}
          dark={dark}
        />

        {detail && (
          <div className="ml-auto flex items-center gap-2">
            {/* Currency badge */}
            {currency !== "AZN" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                {currency}
              </span>
            )}
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ring-1
              ${statusCfg(detail.status).bg} ${statusCfg(detail.status).text} ${statusCfg(detail.status).ring || ""}`}>
              {statusCfg(detail.status).label}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {!selectedRecord ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className={`p-5 rounded-2xl ${dark ? "bg-[#141414]" : "bg-almet-mystic"}`}>
              <Calculator size={32} className="text-almet-steel-blue" />
            </div>
            <div className="text-center">
              <p className={`text-base font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
                Select an employee
              </p>
              <p className={`text-sm mt-1 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                Use the dropdown above to search by name or badge
              </p>
            </div>
          </div>

        ) : fetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
          </div>

        ) : detail ? (
          <div className="space-y-4">

            {/* Employee info + actions */}
            <div className={`flex flex-wrap items-start justify-between gap-4 p-4 rounded-xl border
              ${dark ? "border-[#1e1e1e] bg-[#141414]" : "border-gray-100 bg-gray-50"}`}>
              <div>
                <h2 className={`text-base font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
                  {detail.employee_name}
                </h2>
                <p className={`text-xs mt-0.5 ${dark ? "text-gray-400" : "text-almet-bali-hai"}`}>
                  {detail.employee_id_code} · {detail.position}
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
                    {saving === "approve" ? "Approving…" : "Approve"}
                  </button>
                )}
              </div>
            </div>

            {/* Salary strip */}
            <div className={`grid grid-cols-5 gap-2 p-3 rounded-xl border
              ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/70"}`}>
              {salaryItems.map(({ label, value, highlight, accent }) => (
                <div
                  key={label}
                  className={`text-center px-2 py-2.5 rounded-lg
                    ${highlight
                      ? dark ? "bg-emerald-500/10 ring-1 ring-emerald-500/25" : "bg-emerald-50 ring-1 ring-emerald-200"
                      : dark ? "bg-[#141414]" : "bg-white border border-gray-100"}`}
                >
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
                      <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                        Total Bonus
                      </p>
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
        ) : null}
      </div>
    </div>
  );
}