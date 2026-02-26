"use client";
/**
 * BonusCalculationPanel — redesigned
 *  • Searchable employee dropdown (combobox) at the top
 *  • "Calculated / Approved / Paid" records show a View button → read-only breakdown drawer
 *  • DRAFT records show Calculate button
 *  • Clean card layout, no sidebar list
 */
import { useState, useEffect, useRef } from "react";
import { bonusRecordService, downloadBlob } from "@/services/bonusService";
import {
  Search, CheckCircle, Download, ChevronDown, ChevronUp,
  ChevronRight, Eye, Calculator, Users, X,
} from "lucide-react";

// ─── Searchable Employee Combobox ─────────────────────────────
function EmployeeCombobox({ records, selected, onSelect, dark }) {
  const [open, setOpen]     = useState(false);
  const [q, setQ]           = useState("");
  const ref                 = useRef(null);

  const text   = dark ? "text-white"    : "text-gray-900";
  const sub    = dark ? "text-gray-500" : "text-gray-500";
  const inputB = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 focus:border-almet-steel-blue"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire";
  const dropB  = dark
    ? "bg-[#141414] border-[#2a2a2a]"
    : "bg-white border-gray-200";
  const itemHov = dark ? "hover:bg-[#1f1f1f]" : "hover:bg-gray-50";

  const filtered = records.filter((r) =>
    r.employee_name?.toLowerCase().includes(q.toLowerCase()) ||
    r.employee_id_code?.toLowerCase().includes(q.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const statusDot = (s) => ({
    DRAFT:      "bg-gray-400",
    CALCULATED: "bg-blue-400",
    APPROVED:   "bg-emerald-400",
    PAID:       "bg-violet-400",
  }[s] || "bg-gray-400");

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <button
        onClick={() => { setOpen((o) => !o); setQ(""); }}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm transition
          ${dark
            ? "bg-[#1a1a1a] border-[#2a2a2a] text-white hover:border-[#3a3a3a]"
            : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"}`}
      >
        {selected ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(selected.status)}`} />
            <span className="font-medium truncate">{selected.employee_name}</span>
            <span className={`text-xs shrink-0 ${dark ? "text-gray-500" : "text-gray-400"}`}>
              {selected.employee_id_code}
            </span>
          </div>
        ) : (
          <span className={dark ? "text-gray-500" : "text-gray-400"}>Select employee…</span>
        )}
        <ChevronDown size={14} className={dark ? "text-gray-500 shrink-0" : "text-gray-400 shrink-0"} />
      </button>

      {open && (
        <div className={`absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border shadow-2xl overflow-hidden ${dropB}`}>
          {/* Search input */}
          <div className={`p-2 border-b ${dark ? "border-[#2a2a2a]" : "border-gray-100"}`}>
            <div className="relative">
              <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-gray-500" : "text-gray-400"}`} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or badge…"
                className={`w-full pl-8 pr-3 py-2 rounded-lg border text-xs outline-none transition ${inputB}`}
              />
            </div>
          </div>
          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className={`text-center py-6 text-xs ${sub}`}>No employees found</p>
            ) : filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => { onSelect(r); setOpen(false); setQ(""); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${itemHov}
                  ${selected?.id === r.id ? (dark ? "bg-almet-cloud-burst/20" : "bg-almet-mystic") : ""}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(r.status)}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${text}`}>{r.employee_name}</p>
                  <p className={`text-xs ${sub}`}>{r.employee_id_code} · {r.position}</p>
                </div>
                <span className={`text-xs font-mono shrink-0 ${
                  r.status === "DRAFT" ? sub :
                  r.status === "CALCULATED" ? "text-blue-400" :
                  r.status === "APPROVED"   ? "text-emerald-400" : "text-violet-400"
                }`}>
                  {r.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Breakdown Table ──────────────────────────────────────────
function BreakdownTable({ rows, cols, dark }) {
  const text   = dark ? "text-white"    : "text-gray-900";
  const sub    = dark ? "text-gray-500" : "text-gray-500";
  const border = dark ? "border-[#1f1f1f]" : "border-gray-200";

  return (
    <div className={`rounded-xl border overflow-hidden mt-3 ${dark ? "border-[#1f1f1f]" : "border-gray-200"}`}>
      <table className="w-full text-xs">
        <thead>
          <tr className={`border-b ${border} ${dark ? "bg-[#0a0a0a] text-gray-500" : "bg-gray-50 text-gray-500"} font-medium`}>
            {cols.map((c) => (
              <th key={c.key} className={`px-3 py-2.5 text-left ${c.right ? "text-right" : ""}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} className={`text-center py-6 ${sub}`}>No data</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} className={`border-t ${border} ${dark ? "hover:bg-[#111]" : "hover:bg-gray-50"} transition`}>
              {cols.map((c) => (
                <td key={c.key} className={`px-3 py-2.5 ${text} ${c.right ? "text-right font-mono" : ""}`}>
                  {c.fmt ? c.fmt(row[c.key]) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section accordion ────────────────────────────────────────
function Section({ id, title, total, color, open, onToggle, children, dark }) {
  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-500" : "text-gray-500";
  const panel = dark ? "bg-[#0f0f0f] border-[#1a1a1a]" : "bg-gray-50 border-gray-200";

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition hover:opacity-80 ${panel}`}
      >
        <span className={`text-sm font-semibold ${text}`}>{title}</span>
        <div className="flex items-center gap-3">
          <span className={`text-base font-bold tabular-nums ${color}`}>{total}</span>
          {open
            ? <ChevronUp size={13} className={sub} />
            : <ChevronDown size={13} className={sub} />}
        </div>
      </button>
      {open && children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function BonusCalculationPanel({
  records, loading, selectedRecord, onSelectRecord, bonusYear, dark, onUpdate,
}) {
  const [detail, setDetail]     = useState(null);
  const [fetching, setFetching] = useState(false);
  const [calculating, setCalc]  = useState(false);
  const [approving, setApprove] = useState(false);
  const [open, setOpen]         = useState({ targets: true, objectives: true, competencies: true });
  const [viewMode, setViewMode] = useState(false); // true = read-only view for calculated records

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-500" : "text-gray-500";
  const card  = dark ? "bg-[#111111] border-[#1f1f1f]" : "bg-white border-gray-200";
  const panel = dark ? "bg-[#0f0f0f] border-[#1a1a1a]" : "bg-gray-50 border-gray-200";

  useEffect(() => {
    if (!selectedRecord) { setDetail(null); return; }
    setFetching(true);
    bonusRecordService.detail(selectedRecord.id)
      .then(({ data }) => { setDetail(data); setViewMode(data.status !== "DRAFT"); })
      .finally(() => setFetching(false));
  }, [selectedRecord?.id]);

  const handleCalculate = async () => {
    if (!detail) return;
    setCalc(true);
    try {
      await bonusRecordService.calculate(detail.id);
      const { data } = await bonusRecordService.detail(detail.id);
      setDetail(data); setViewMode(true); onUpdate();
    } finally { setCalc(false); }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setApprove(true);
    try {
      await bonusRecordService.approve(detail.id);
      const { data } = await bonusRecordService.detail(detail.id);
      setDetail(data); onUpdate();
    } finally { setApprove(false); }
  };

  const handlePdf = async () => {
    if (!detail) return;
    const { data } = await bonusRecordService.exportPdf(detail.id);
    downloadBlob(data, `bonus_${detail.employee_id_code}.pdf`);
  };

  const fmt = (v) =>
    v != null ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";

  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  // status badge
  const statusBadge = (s) => ({
    DRAFT:      dark ? "bg-gray-500/20 text-gray-400"    : "bg-gray-100 text-gray-600",
    CALCULATED: dark ? "bg-blue-500/20 text-blue-400"    : "bg-blue-50 text-blue-600",
    APPROVED:   dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600",
    PAID:       dark ? "bg-violet-500/20 text-violet-400"   : "bg-violet-50 text-violet-600",
  }[s] || "bg-gray-500/20 text-gray-400");

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      {/* ── Header bar with combobox ──────────────────────── */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center gap-3
        ${dark ? "border-[#1f1f1f]" : "border-gray-100"}`}>
        <div className="flex items-center gap-2 mr-1">
          <Users size={16} className={sub} />
          <span className={`text-sm font-semibold ${text}`}>Employee</span>
        </div>
        <EmployeeCombobox
          records={records}
          selected={selectedRecord}
          onSelect={onSelectRecord}
          dark={dark}
        />
        {detail && (
          <span className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(detail.status)}`}>
            {detail.status}
          </span>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="p-6">
        {!selectedRecord ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className={`p-5 rounded-2xl ${dark ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
              <Calculator size={32} className={sub} />
            </div>
            <p className={`text-sm font-medium ${text}`}>Select an employee to begin</p>
            <p className={`text-xs ${sub}`}>Use the dropdown above to search by name or badge</p>
          </div>
        ) : fetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : detail ? (
          <div className="space-y-4">

            {/* Employee header + actions */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className={`text-lg font-bold ${text}`}>{detail.employee_name}</h2>
                <p className={`text-xs mt-0.5 ${sub}`}>
                  {detail.employee_id_code} · {detail.position}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePdf}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition
                    ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                  <Download size={12} /> PDF
                </button>
                {detail.status === "CALCULATED" && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium disabled:opacity-50 transition"
                  >
                    <CheckCircle size={12} />
                    {approving ? "Approving…" : "Approve"}
                  </button>
                )}
                {detail.status === "DRAFT" && !bonusYear?.is_locked && (
                  <button
                    onClick={handleCalculate}
                    disabled={calculating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-medium disabled:opacity-50 transition"
                  >
                    <Calculator size={12} />
                    {calculating ? "Calculating…" : "Calculate Bonus"}
                  </button>
                )}
              </div>
            </div>

            {/* Salary strip */}
            <div className={`grid grid-cols-5 gap-3 p-4 rounded-xl border ${panel}`}>
              {[
                { label: "Yearly Salary",    value: fmt(detail.yearly_salary) + " ₼" },
                { label: "Worked Months",    value: detail.worked_months },
                { label: "Prorata Salary",   value: fmt(detail.prorata_salary) + " ₼", c: "text-orange-400" },
                { label: "Adjusted Salary",  value: fmt(detail.adjusted_yearly_salary) + " ₼" },
                { label: "Effective Salary", value: fmt(detail.effective_salary) + " ₼",
                  c: detail.use_adjusted_salary ? "text-emerald-400" : text },
              ].map(({ label, value, c }) => (
                <div key={label} className="text-center">
                  <p className={`text-xs ${sub} mb-1`}>{label}</p>
                  <p className={`text-sm font-bold tabular-nums ${c || text}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── Sections (always visible for calculated/approved, accordion) */}
            {detail.status === "DRAFT" ? (
              <div className={`rounded-xl border p-8 text-center ${panel}`}>
                <Calculator size={28} className={`mx-auto mb-3 ${sub}`} />
                <p className={`text-sm font-medium ${text}`}>Bonus not yet calculated</p>
                <p className={`text-xs mt-1 ${sub}`}>Click "Calculate Bonus" to run the calculation for this employee</p>
              </div>
            ) : (
              <>
                {/* 1. Company Targets */}
                <Section
                  id="targets" dark={dark} open={open.targets} onToggle={() => toggle("targets")}
                  title="1. Company Targets Bonus"
                  total={`${fmt(detail.company_targets_bonus)} ₼`}
                  color="text-sky-400"
                >
                  <BreakdownTable
                    dark={dark}
                    rows={detail.company_targets_breakdown || []}
                    cols={[
                      { key: "target_name",      label: "Target" },
                      { key: "weight_pct",        label: "Weight", right: true, fmt: (v) => `${v}%` },
                      { key: "rating_name",       label: "Rating" },
                      { key: "rating_range_max",  label: "% Salary", right: true, fmt: (v) => `${v}%` },
                      { key: "bonus_amount",      label: "Bonus (₼)", right: true, fmt },
                    ]}
                  />
                </Section>

                {/* 2. Objectives */}
                <Section
                  id="objectives" dark={dark} open={open.objectives} onToggle={() => toggle("objectives")}
                  title="2. Individual Objectives Bonus"
                  total={`${fmt(detail.objectives_bonus)} ₼`}
                  color="text-amber-400"
                >
                  <BreakdownTable
                    dark={dark}
                    rows={detail.objectives_breakdown || []}
                    cols={[
                      { key: "title",               label: "Objective" },
                      { key: "original_weight",     label: "Orig W",   right: true, fmt: (v) => `${v}%` },
                      { key: "adjusted_weight_pct", label: "Adj W",    right: true, fmt: (v) => `${parseFloat(v).toFixed(1)}%` },
                      { key: "rating_name",         label: "Rating" },
                      { key: "rating_range_max",    label: "% Salary", right: true, fmt: (v) => `${v}%` },
                      { key: "bonus_amount",        label: "Bonus (₼)", right: true, fmt },
                    ]}
                  />
                </Section>

                {/* 3. Competencies */}
                <Section
                  id="competencies" dark={dark} open={open.competencies} onToggle={() => toggle("competencies")}
                  title="3. Competencies Bonus"
                  total={`${fmt(detail.competencies_bonus)} ₼`}
                  color="text-violet-400"
                >
                  <BreakdownTable
                    dark={dark}
                    rows={detail.competencies_breakdown || []}
                    cols={[
                      { key: "group_name",       label: "Group" },
                      { key: "competency_type",  label: "Type" },
                      { key: "weight_pct",       label: "Weight",  right: true, fmt: (v) => `${v}%` },
                      { key: "group_percentage", label: "Score",   right: true, fmt: (v) => `${parseFloat(v).toFixed(1)}%` },
                      { key: "rating_name",      label: "Rating" },
                      { key: "rating_range_max", label: "% Salary", right: true, fmt: (v) => `${v}%` },
                      { key: "bonus_amount",     label: "Bonus (₼)", right: true, fmt },
                    ]}
                  />
                </Section>

                {/* Total */}
                <div className={`rounded-xl border p-5 ${panel}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm font-semibold ${text}`}>Total Bonus</span>
                    <span className="text-2xl font-bold text-emerald-400 tabular-nums">{fmt(detail.total_bonus)} ₼</span>
                  </div>
                  <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${dark ? "border-[#1f1f1f]" : "border-gray-200"}`}>
                    {[
                      { label: "Company Targets", value: fmt(detail.company_targets_bonus), c: "text-sky-400",    bar: "bg-sky-400"    },
                      { label: "Objectives",      value: fmt(detail.objectives_bonus),      c: "text-amber-400",  bar: "bg-amber-400"  },
                      { label: "Competencies",    value: fmt(detail.competencies_bonus),    c: "text-violet-400", bar: "bg-violet-400" },
                    ].map(({ label, value, c, bar }) => {
                      const pct = detail.total_bonus > 0
                        ? (parseFloat(value.replace(/,/g,"")) / parseFloat(detail.total_bonus) * 100)
                        : 0;
                      return (
                        <div key={label}>
                          <p className={`text-xs ${sub} mb-1`}>{label}</p>
                          <p className={`text-sm font-bold tabular-nums ${c}`}>{value} ₼</p>
                          <div className={`mt-2 h-1 rounded-full ${dark ? "bg-[#1f1f1f]" : "bg-gray-200"} overflow-hidden`}>
                            <div className={`h-full rounded-full ${bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
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