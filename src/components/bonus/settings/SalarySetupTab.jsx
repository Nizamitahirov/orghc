"use client";
import { useState, useEffect, useCallback } from "react";
import { bonusRecordService, exchangeRateService } from "@/services/bonusService";
import { salaryService } from "@/services/salaryService";
import { apiService } from "@/services/api";
import {
  RefreshCw, Pencil, Check, X, Info, DollarSign,
  ToggleLeft, ToggleRight, Search, CheckCircle, AlertCircle,
  Building2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/components/common/Toast";

const PAGE_SIZE = 10;

const fmt = (v) =>
  v != null && v !== ""
    ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";

// ─── Currency badge ────────────────────────────────────────────────────────
function CurrencyBadge({ currency, dark }) {
  if (!currency || currency === "AZN") return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
      ${dark ? "bg-white/[0.05] text-gray-500" : "bg-gray-100 text-gray-400"}`}>
      -
    </span>
  );
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
      ${dark
        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
        : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
      {currency}
    </span>
  );
}

// ─── EditableRow ───────────────────────────────────────────────────────────
function EditableRow({ r, dark, inp, muted, text, isSaving, onApply, onCancel, prefill, exchangeRates = [] }) {
  const [form, setForm] = useState({
    yearly_salary:          r.yearly_salary          ?? prefill?.annual_salary   ?? "",
    worked_months:          r.worked_months          ?? 12,
    adjusted_yearly_salary: r.adjusted_yearly_salary ?? "",
    salary_currency:        r.salary_currency        || prefill?.salary_currency || "AZN",
  });

  const isPrefilled = !r.yearly_salary && !!prefill?.annual_salary;
  const CURRENCIES  = ["AZN", "USD", "EUR", "GBP", "TRY", "RUB"];

  const convertAmount = (amount, fromCur, toCur) => {
    if (!amount || fromCur === toCur) return amount;
    const direct = exchangeRates.find(x => x.from_currency === fromCur && x.to_currency === toCur);
    if (direct) return +(parseFloat(amount) * parseFloat(direct.rate)).toFixed(2);
    const inverse = exchangeRates.find(x => x.from_currency === toCur && x.to_currency === fromCur);
    if (inverse) return +(parseFloat(amount) / parseFloat(inverse.rate)).toFixed(2);
    return amount; // exchange rate tapılmadısa dəyər olduğu kimi qalır
  };

  const activeBg = dark
    ? "bg-almet-sapphire/8 border-almet-sapphire/20"
    : "bg-almet-mystic border-almet-sapphire/20";

  const Cell = ({ children, align = "left", first = false, last = false }) => (
    <td className={`px-4 py-2.5 border-y text-${align} transition
      ${activeBg}
      ${first ? "rounded-l-xl border-l" : "border-x-0"}
      ${last  ? "rounded-r-xl border-r border-l-0" : ""}`}>
      {children}
    </td>
  );

  return (
    <tr>
    
      <Cell>
        <p className={`text-sm font-semibold whitespace-nowrap ${text}`}>{r.employee_name}</p>
      </Cell>
      <Cell>
        <p className={`text-xs ${muted}`}>{r.business_function_name || "—"}</p>
      </Cell>
      <Cell align="center">
        {r.has_performance
          ? <CheckCircle size={13} className="text-emerald-400 mx-auto" />
          : <AlertCircle  size={13} className="text-amber-400 mx-auto"   />
        }
      </Cell>
      <Cell align="right">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <input
              autoFocus type="number"
              value={form.yearly_salary}
              onChange={(e) => setForm((p) => ({ ...p, yearly_salary: e.target.value }))}
              placeholder="0.00"
              className={`w-28 px-3 py-1.5 rounded-xl border text-xs text-right outline-none transition ${inp}`}
            />
            <select
              value={form.salary_currency}
              onChange={(e) => {
                const newCur = e.target.value;
                const oldCur = form.salary_currency;
                setForm((p) => ({
                  ...p,
                  salary_currency:        newCur,
                  yearly_salary:          p.yearly_salary          !== "" ? String(convertAmount(p.yearly_salary, oldCur, newCur))          : "",
                  adjusted_yearly_salary: p.adjusted_yearly_salary !== "" ? String(convertAmount(p.adjusted_yearly_salary, oldCur, newCur)) : "",
                }));
              }}
              className={`px-2 py-1.5 rounded-xl border text-xs font-bold outline-none transition cursor-pointer
                ${form.salary_currency !== "AZN"
                  ? dark
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-amber-50 border-amber-200 text-amber-600"
                  : inp}`}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {isPrefilled && (
            <span className={`text-[10px] font-semibold ${dark ? "text-amber-400/70" : "text-amber-500"}`}>
              ↑ prefilled from salary record
            </span>
          )}
        </div>
      </Cell>
      <Cell align="center">
        <input
          type="number" min={0} max={12} step={0.5}
          value={form.worked_months}
          onChange={(e) => setForm((p) => ({ ...p, worked_months: e.target.value }))}
          className={`w-16 px-2 py-1.5 rounded-xl border text-xs text-center outline-none transition ${inp}`}
        />
      </Cell>
      <Cell align="right">
        <span className="text-xs font-bold text-orange-400 font-mono">{fmt(r.prorata_salary)}</span>
      </Cell>
      <Cell align="right">
        <input
          type="number"
          value={form.adjusted_yearly_salary}
          onChange={(e) => setForm((p) => ({ ...p, adjusted_yearly_salary: e.target.value }))}
          placeholder="Optional"
          className={`w-28 px-3 py-1.5 rounded-xl border text-xs text-right outline-none transition ${inp}`}
        />
      </Cell>
      <Cell align="center">
        <p className={`text-xs font-black font-mono
          ${r.use_adjusted_salary ? "text-emerald-400" : "text-almet-steel-blue"}`}>
          {fmt(r.effective_salary)}
        </p>
        <p className={`text-[9px] mt-0.5 font-semibold uppercase tracking-wide ${muted}`}>
          {r.use_adjusted_salary ? "adjusted" : "prorata"}
        </p>
      </Cell>
      <Cell align="center" last>
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onApply(r, form)}
            disabled={isSaving}
            className="w-7 h-7 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white flex items-center justify-center disabled:opacity-50 transition-all shadow-md shadow-almet-sapphire/20"
          >
            {isSaving ? <RefreshCw size={11} className="animate-spin" /> : <Check size={12} />}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40
              ${dark ? "border-white/[0.08] text-gray-500 hover:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-100"}`}
          >
            <X size={12} />
          </button>
        </div>
      </Cell>
    </tr>
  );
}

// ─── StaticRow ─────────────────────────────────────────────────────────────
function StaticRow({ r, dark, muted, text, rowBg, rowHov, saving, onEdit, onUseAdjusted, onUnuseAdjusted, prefill }) {
  const hasSalary    = !!r.yearly_salary;
  const prefillValue = !hasSalary && prefill?.annual_salary;

  const Cell = ({ children, align = "left", first = false, last = false }) => (
    <td className={`px-4 py-2.5 border-y text-${align} transition
      ${rowBg} ${rowHov}
      ${first ? "rounded-l-xl border-l" : "border-x-0"}
      ${last  ? "rounded-r-xl border-r border-l-0" : ""}`}>
      {children}
    </td>
  );

  return (
    <tr>
    
      <Cell>
        <p className={`text-sm font-semibold whitespace-nowrap ${text}`}>{r.employee_name}</p>
      </Cell>
      <Cell>
        {r.business_function_name ? (
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium
            ${dark ? "bg-almet-sapphire/10 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
            <Building2 size={10} />
            {r.business_function_name}
          </span>
        ) : (
          <span className={`text-xs ${muted}`}>—</span>
        )}
      </Cell>
      <Cell align="center">
        {r.has_performance ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={10} /> Done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle size={10} /> Pending
          </span>
        )}
      </Cell>
      <Cell align="right">
        <div className="flex items-center justify-end gap-1.5">
          {hasSalary ? (
            <>
              <span className={`text-sm font-bold ${text}`}>{fmt(r.yearly_salary)}</span>
              <CurrencyBadge currency={r.salary_currency} dark={dark} />
            </>
          ) : prefillValue ? (
            <>
              <span
                className={`text-sm font-semibold italic ${dark ? "text-amber-400/70" : "text-amber-500/80"}`}
                title="From salary record — click edit to apply"
              >
                {fmt(prefillValue)}
              </span>
              <CurrencyBadge currency={prefill.salary_currency || "AZN"} dark={dark} />
            </>
          ) : (
            <span className={`text-sm font-bold ${muted}`}>—</span>
          )}
        </div>
      </Cell>
      <Cell align="center">
        <span className={`text-sm font-bold ${text}`}>{r.worked_months}</span>
      </Cell>
      <Cell align="right">
        <span className="text-xs font-bold text-orange-400 font-mono">{fmt(r.prorata_salary)}</span>
      </Cell>
      <Cell align="right">
        <div className="flex items-center justify-end gap-2">
          {r.adjusted_yearly_salary ? (
            <>
              <span className={`text-xs font-bold font-mono ${text}`}>{fmt(r.adjusted_yearly_salary)}</span>
              <button
                onClick={() => r.use_adjusted_salary ? onUnuseAdjusted(r) : onUseAdjusted(r)}
                disabled={!!saving}
                className="transition-all hover:scale-110 disabled:opacity-40"
              >
                {r.use_adjusted_salary
                  ? <ToggleRight size={18} className="text-emerald-400" />
                  : <ToggleLeft  size={18} className={muted} />
                }
              </button>
            </>
          ) : (
            <span className={`text-xs ${muted}`}>—</span>
          )}
        </div>
      </Cell>
      <Cell align="center">
        <p className={`text-xs font-black font-mono ${r.use_adjusted_salary ? "text-emerald-400" : "text-almet-steel-blue"}`}>
          {fmt(r.effective_salary)}
        </p>
        <p className={`text-[9px] mt-0.5 font-semibold uppercase tracking-wide ${muted}`}>
          {r.use_adjusted_salary ? "adjusted" : "prorata"}
        </p>
      </Cell>
      <Cell align="center" last>
        <button
          onClick={() => onEdit(r)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all
            ${dark
              ? "text-gray-600 hover:text-white hover:bg-white/[0.06]"
              : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}
        >
          <Pencil size={12} />
        </button>
      </Cell>
    </tr>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function SalarySetupTab({ dark, bonusYear }) {
  const { showSuccess, showError } = useToast();

  const [records,      setRecords]    = useState([]);
  const [salaryMap,    setSalaryMap]  = useState({});
  const [exchangeRates, setExchangeRates] = useState([]);
  const [bfList,       setBfList]     = useState([]);
  const [loading,      setLoading]    = useState(true);
  const [initializing, setInit]       = useState(false);
  const [editing,      setEditing]    = useState(null);
  const [saving,       setSaving]     = useState(null);
  const [page,         setPage]       = useState(1);
  const [search,       setSearch]     = useState("");
  const [perfFilter,   setPerfFilter] = useState("ALL");
  const [bfFilter,     setBfFilter]   = useState("ALL");

  /* ── design tokens ── */
  const text      = dark ? "text-white"     : "text-gray-900";
  const sub       = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted     = dark ? "text-gray-600"  : "text-gray-400";
  const rowBg     = dark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-gray-200";
  const rowHov    = dark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50";
  const head      = dark ? "bg-[#080b14] text-[#5a6a85]" : "bg-[#f5f7fb] text-gray-400";
  const inp       = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";
  const searchInp = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white placeholder-gray-700 focus:border-almet-steel-blue/50"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire";

  /* ── load exchange rates from CBAR (live, no DB) ── */
  useEffect(() => {
    exchangeRateService.liveRates()
      .then(({ data }) => setExchangeRates(data.rates ?? []))
      .catch(() => {});
  }, []);

  /* ── load business functions ── */
  useEffect(() => {
    apiService.getBusinessFunctions()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
 
        setBfList(list);
      })
      .catch(() => {});
  }, []);

  /* ── load salary map ── */
  useEffect(() => {
    salaryService.list({ has_salary: true, page_size: 1000 })
      .then(({ data }) => {
        const results = Array.isArray(data) ? data : (data.results ?? []);
        const map = {};
        results.forEach((s) => {
          map[s.employee_id] = {
            annual_salary:   s.annual_salary,
            salary_currency: s.salary_currency || "AZN",
          };
        });
        setSalaryMap(map);
      })
      .catch(() => {});
  }, []);

 const loadRecords = useCallback(async () => {
    if (!bonusYear) return;
    setLoading(true);
    try {
      const { data } = await bonusRecordService.list(bonusYear.id);
      setRecords(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      showError("Failed to load salary records.");
    } finally {
      setLoading(false);
    }
  }, [bonusYear?.id]);

  // İLK LOAD: initialize et, sonra records-ları çək
  useEffect(() => {
    if (!bonusYear) return;

    const init = async () => {
      setLoading(true);
      try {
        // Həmişə initialize çağır — get_or_create olduğu üçün
        // mövcud record-ları silmir, yalnız çatışmayanları əlavə edir
        await bonusRecordService.initialize(bonusYear.id);
      } catch {
        // initialize uğursuz olsa belə records-ı yükləməyə davam et
      }
      await loadRecords();
    };

    init();
  }, [bonusYear?.id]);

  useEffect(() => { setPage(1); }, [search, perfFilter, bfFilter]);

  /* ── handlers ── */
  const handleInitialize = async () => {
    if (!bonusYear || !confirm("Sync bonus records for all active employees?")) return;
    setInit(true);
    try {
      await bonusRecordService.initialize(bonusYear.id);
      await loadRecords();
      showSuccess("Records synced.");
    } catch { showError("Failed to sync records."); }
    finally  { setInit(false); }
  };

  const handleApply = async (r, form) => {
    setSaving(r.id);
    try {
      const { data: updated } = await bonusRecordService.setSalary(r.id, {
        yearly_salary:          form.yearly_salary          !== "" ? parseFloat(form.yearly_salary) : null,
        worked_months:          parseFloat(form.worked_months),
        adjusted_yearly_salary: form.adjusted_yearly_salary !== "" ? parseFloat(form.adjusted_yearly_salary) : null,
        salary_currency:        form.salary_currency        || "AZN",
      });
      setRecords((prev) => prev.map((rec) => rec.id === r.id ? updated : rec));
      setEditing(null);
      showSuccess("Salary updated & bonus recalculated.");
    } catch { showError("Failed to update salary."); }
    finally  { setSaving(null); }
  };

  const handleUseAdjusted = async (r) => {
    setSaving(`adj-${r.id}`);
    try {
      const { data: updated } = await bonusRecordService.setSalary(r.id, { use_adjusted_salary: true });
      setRecords((prev) => prev.map((rec) => rec.id === r.id ? updated : rec));
      showSuccess("Adjusted salary applied.");
    } catch { showError("Failed to apply adjusted salary."); }
    finally  { setSaving(null); }
  };

  const handleUnuseAdjusted = async (r) => {
    setSaving(`unadj-${r.id}`);
    try {
      const { data: updated } = await bonusRecordService.setSalary(r.id, { use_adjusted_salary: false });
      setRecords((prev) => prev.map((rec) => rec.id === r.id ? updated : rec));
      showSuccess("Reverted to prorata salary.");
    } catch { showError("Failed to revert."); }
    finally  { setSaving(null); }
  };

  /* ── derived ── */
  const filtered = records.filter((r) => {
    const q           = search.toLowerCase();
    const matchSearch = (r.employee_name     || "").toLowerCase().includes(q) ||
                        (r.employee_id_code  || "").toLowerCase().includes(q);
    const matchPerf   = perfFilter === "ALL"       ? true
                      : perfFilter === "COMPLETED" ? r.has_performance
                      : !r.has_performance;
    const matchBf     = bfFilter === "ALL"
                      ? true
                      : String(r.business_function) === String(bfFilter);
    return matchSearch && matchPerf && matchBf;
  });

  const completedCount = records.filter((r) =>  r.has_performance).length;
  const pendingCount   = records.filter((r) => !r.has_performance).length;
  const totalPages     = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner message="Loading salary records…" />;

  const ColHeader = ({ children, align = "left" }) => (
    <th className={`px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-${align} whitespace-nowrap`}>
      {children}
    </th>
  );

  const perfBtns = [
    { key: "ALL",       label: "All",        count: records.length },
    { key: "COMPLETED", label: "✓ Done",     count: completedCount },
    { key: "PENDING",   label: "⏳ Pending",  count: pendingCount   },
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0
        ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center
            ${dark ? "bg-teal-500/10 border border-teal-500/20" : "bg-teal-50 border border-teal-200"}`}>
            <DollarSign size={16} className="text-teal-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${text}`}>Salary Setup</h2>
            <p className={`text-xs ${sub}`}>
              {records.length} employees ·{" "}
              <span className="text-emerald-400 font-semibold">{completedCount} performance done</span>
              {" · "}
              <span className="text-amber-400 font-semibold">{pendingCount} pending</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleInitialize} disabled={initializing}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50
            ${dark
              ? "border-white/[0.08] text-[#8a9bb8] hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
              : "border-gray-200 text-almet-comet hover:bg-almet-mystic hover:border-almet-sapphire/30 hover:text-almet-sapphire"}`}
        >
          <RefreshCw size={12} className={initializing ? "animate-spin" : ""} />
          Re-sync
        </button>
      </div>

      {/* ── Info bar ── */}
      <div className={`mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border shrink-0
        ${dark ? "bg-almet-sapphire/8 border-almet-sapphire/20" : "bg-almet-mystic border-almet-sapphire/20"}`}>
        <Info size={13} className="text-almet-steel-blue shrink-0" />
        <p className={`text-xs ${sub}`}>
          Click <b>✎</b> to edit salary. If the employee has a salary record, values will be prefilled automatically.
       
        </p>
      </div>

      {/* ── Search + Filters ── */}
      <div className="px-6 mt-3 space-y-2 shrink-0">

        {/* Search */}
        <div className="relative">
          <Search size={13} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${muted}`} />
          <input
            type="text" placeholder="Search by name"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${searchInp}`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted} hover:${text} transition`}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Performance filter */}
          <div className="flex items-center gap-1">
            {perfBtns.map(({ key, label, count }) => (
              <button key={key} onClick={() => setPerfFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all
                  ${perfFilter === key
                    ? key === "COMPLETED" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : key === "PENDING"   ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : dark ? "bg-white/[0.08] border-white/20 text-white" : "bg-almet-mystic border-almet-sapphire/30 text-almet-sapphire"
                    : dark ? "border-white/[0.06] text-gray-500 hover:text-gray-300"
                           : "border-gray-200 text-gray-400 hover:text-gray-600"}`}
              >
                {label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold
                  ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          {bfList.length > 0 && (
            <div className={`w-px h-5 shrink-0 ${dark ? "bg-white/10" : "bg-gray-200"}`} />
          )}

          {/* Business Function filter */}
          {bfList.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setBfFilter("ALL")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all
                  ${bfFilter === "ALL"
                    ? dark ? "bg-white/[0.08] border-white/20 text-white" : "bg-almet-mystic border-almet-sapphire/30 text-almet-sapphire"
                    : dark ? "border-white/[0.06] text-gray-500 hover:text-gray-300"
                           : "border-gray-200 text-gray-400 hover:text-gray-600"}`}
              >
                <Building2 size={11} />
                All Companies
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold
                  ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>{records.length}</span>
              </button>
              {bfList.map((bf) => {
                const count = records.filter((r) => String(r.business_function) === String(bf.id)).length;
                if (count === 0) return null;
                const isActive = String(bfFilter) === String(bf.id);
                return (
                  <button
                    key={bf.id}
                    onClick={() => setBfFilter(String(bf.id))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all
                      ${isActive
                        ? dark ? "bg-almet-sapphire/20 border-almet-sapphire/40 text-almet-steel-blue"
                               : "bg-almet-mystic border-almet-sapphire/30 text-almet-sapphire"
                        : dark ? "border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/10"
                               : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"}`}
                  >
                    <Building2 size={10} />
                    {bf.code || bf.name}
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold
                      ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <span className={`ml-auto text-xs ${muted}`}>{filtered.length} records</span>
        </div>
      </div>

      {/* ── Table ── */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-5 py-16">
          <DollarSign size={18} className={muted} />
          <p className={`text-sm font-semibold ${text}`}>No records found</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto px-6 py-4">
            {filtered.length === 0 ? (
              <div className={`text-center py-16 text-sm ${sub}`}>
                No employees match the current filter
              </div>
            ) : (
              <table className="w-full border-separate" style={{ borderSpacing: "0 5px", minWidth: 1100 }}>
                <thead className={head}>
                  <tr>
                 
                    <ColHeader>Employee</ColHeader>
                    <ColHeader>Company</ColHeader>
                    <ColHeader align="center">Performance</ColHeader>
                    <ColHeader align="right">Yearly Salary</ColHeader>
                    <ColHeader align="center">Months</ColHeader>
                    <ColHeader align="right">Prorata</ColHeader>
                    <ColHeader align="right">Adjusted</ColHeader>
                    <ColHeader align="center">Effective</ColHeader>
                    <ColHeader align="center">Edit</ColHeader>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) =>
                    editing === r.id ? (
                      <EditableRow
                        key={r.id} r={r} dark={dark} inp={inp} muted={muted} text={text}
                        isSaving={saving === r.id}
                        onApply={handleApply}
                        onCancel={() => setEditing(null)}
                        prefill={salaryMap[r.employee_id_code]}
                        exchangeRates={exchangeRates}
                      />
                    ) : (
                      <StaticRow
                        key={r.id} r={r} dark={dark} muted={muted} text={text}
                        rowBg={rowBg} rowHov={rowHov} saving={saving}
                        onEdit={(rec) => setEditing(rec.id)}
                        onUseAdjusted={handleUseAdjusted}
                        onUnuseAdjusted={handleUnuseAdjusted}
                        prefill={salaryMap[r.employee_id_code]}
                      />
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 pb-5 shrink-0">
              <Pagination
                currentPage={page} totalPages={totalPages}
                totalItems={filtered.length} itemsPerPage={PAGE_SIZE}
                onPageChange={setPage} darkMode={dark}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}