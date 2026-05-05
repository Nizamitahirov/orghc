"use client";
import { useState, useEffect, useCallback } from "react";
import {
  siConfigService, siPeriodService, siCalcService,
  siCompanyKPIService, siIndividualKPIService, siIndividualScaleService,
} from "@/services/siService";
import { exchangeRateService } from "@/services/bonusService";
import { useToast } from "@/components/common/Toast";
import {
  Calendar, ChevronDown, ChevronUp, Users, Target, TrendingUp,
  Calculator, CheckCircle, RefreshCw, AlertTriangle,
  Lock, BarChart2, Building2, DollarSign, Download,
  ArrowRight, Circle, FileBarChart, BookOpen,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

/* ─── helpers ────────────────────────────────────────── */
const fmt  = v => parseFloat(v || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtP = v => `${(parseFloat(v || 0) * 100).toFixed(1)}%`;

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€', AZN: '₼', TRY: '₺', RUB: '₽' };
const currSym = (code) => CURRENCY_SYMBOLS[code] || code || '₼';

function convertAmountSI(value, fromCurrency, toCurrency, rates) {
  const v = parseFloat(value || 0);
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency || !rates?.length) return v;
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

function hasRateFor(currency, nativeCurrencies, rates) {
  if (nativeCurrencies.includes(currency)) return true;
  return rates.some(r => r.from_currency === currency || r.to_currency === currency);
}

const RATING_COLORS = {
  "E-":  d => d ? "bg-rose-500/15 text-rose-400"       : "bg-rose-50 text-rose-600",
  "E":   d => d ? "bg-amber-500/15 text-amber-400"     : "bg-amber-50 text-amber-600",
  "E+":  d => d ? "bg-sky-500/15 text-sky-400"         : "bg-sky-50 text-sky-600",
  "E++": d => d ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600",
};
const ratingColor = (code, dark) =>
  RATING_COLORS[code]?.(dark) || (dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600");

const STATUS_CFG = {
  DRAFT:      d => d ? "bg-slate-800 text-slate-400"        : "bg-slate-100 text-slate-600",
  CALCULATED: d => d ? "bg-blue-500/15 text-blue-400"       : "bg-blue-50 text-blue-600",
  APPROVED:   d => d ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600",
  PAID:       d => d ? "bg-violet-500/15 text-violet-400"   : "bg-violet-50 text-violet-600",
};
const STATUS_LABEL = {
  DRAFT:      "Not Started",
  CALCULATED: "Ready to Approve",
  APPROVED:   "Approved",
  PAID:       "Paid",
};

/* ─── Pipeline ───────────────────────────────────────── */
function SIPipeline({ steps, dark }) {
  return (
    <div className="flex items-center gap-0 flex-wrap">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const done   = step.count > 0;
        return (
          <div key={step.label} className="flex items-center gap-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition
              ${done
                ? step.active
                  ? "bg-almet-sapphire text-white"
                  : dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : dark ? "bg-[#1a1a1a] text-gray-500" : "bg-gray-100 text-gray-400"}`}>
              {step.icon}
              <span className="hidden sm:inline">{step.label}</span>
              {step.count > 0 && (
                <span className={`ml-0.5 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full
                  ${done
                    ? step.active
                      ? "bg-white/20 text-white"
                      : dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                    : dark ? "bg-[#2a2a2a] text-gray-500" : "bg-gray-200 text-gray-500"}`}>
                  {step.count}
                </span>
              )}
            </div>
            {!isLast && <ArrowRight size={12} className={`mx-1 ${dark ? "text-gray-700" : "text-gray-300"}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Period selector ────────────────────────────────── */
function PeriodSelector({ periods, selected, onChange, dark }) {
  const [open, setOpen] = useState(false);
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition
          ${dark ? "bg-[#141414] border-[#2a2a2a] text-white hover:border-[#3a3a3a]"
                 : "bg-white border-gray-200 text-almet-cloud-burst hover:border-almet-bali-hai shadow-sm"}`}
      >
        <Calendar size={14} className="text-amber-500 shrink-0" />
        <span>{selected ? selected.period_name : "Select period"}</span>
        {selected?.is_locked && <Lock size={11} className="text-red-400" />}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""} ${muted}`} />
      </button>

      {open && (
        <div className={`absolute top-full mt-1.5 right-0 z-50 min-w-[200px] rounded-xl border shadow-xl overflow-hidden
          ${dark ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200"}`}>
          <div className={`px-3 py-2 border-b text-xs font-semibold ${sub} ${dark ? "border-[#2a2a2a]" : "border-gray-100"}`}>
            Periods
          </div>
          <div className="py-1 max-h-60 overflow-y-auto">
            {periods.length === 0 && <p className={`text-xs text-center py-4 ${muted}`}>No periods yet</p>}
            {periods.map(p => (
              <button key={p.id}
                onClick={() => { onChange(p); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition
                  ${selected?.id === p.id
                    ? dark ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-700"
                    : dark ? "text-gray-300 hover:bg-[#1f1f1f]" : "text-gray-700 hover:bg-gray-50"}`}>
                <span className="font-semibold">{p.period_name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_CFG[p.status]?.(dark) || ""}`}>
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                  {p.is_locked && <Lock size={10} className="text-red-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────── */
export default function SalesIncentivePanel({ dark, isAdmin, initialView = "calc" }) {
  const { showSuccess, showError } = useToast();

  const [configs,    setConfigs]    = useState([]);
  const [selConfig,  setSelConfig]  = useState(null);
  const [periods,    setPeriods]    = useState([]);
  const [selPeriod,  setSelPeriod]  = useState(null);
  const [calcs,      setCalcs]      = useState([]);
  const [selCalc,    setSelCalc]    = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [compKPIs,   setCompKPIs]   = useState([]);
  const [indKPIs,    setIndKPIs]    = useState([]);
  const [scalesMap,  setScalesMap]  = useState({});
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [syncing,    setSyncing]    = useState(false);
  const [exporting,  setExporting]  = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [view,       setView]       = useState(initialView);
  const [compInputs,  setCompInputs]  = useState([]);
  const [indInputs,   setIndInputs]   = useState([]);
  const [savingKPIs,     setSavingKPIs]     = useState(false);
  const [kpiOpen,        setKpiOpen]        = useState(true);
  const [docOpen,        setDocOpen]        = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState(null); // null = use each employee's own
  const [detailDisplayCurrency, setDetailDisplayCurrency] = useState(null); // for Results panel
  const [exchangeRates,  setExchangeRates]  = useState([]);

  const text  = dark ? "text-white"             : "text-almet-cloud-burst";
  const sub   = dark ? "text-[#8a9bb8]"         : "text-almet-comet";
  const muted = dark ? "text-gray-600"           : "text-gray-400";
  const card  = dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-white border-gray-200 shadow-sm";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";

  /* ── Load configs ── */
  useEffect(() => {
    siConfigService.list()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setConfigs(list);
        if (list.length) setSelConfig(list[0]);
      })
      .catch(() => showError("Failed to load SI configs"))
      .finally(() => setLoading(false));
  }, []);

  /* ── Load live exchange rates from CBAR (no DB) ── */
  useEffect(() => {
    exchangeRateService.liveRates()
      .then(({ data }) => setExchangeRates(data.rates ?? []))
      .catch(() => setExchangeRates([]));
  }, []);

  /* ── Load periods ── */
  useEffect(() => {
    if (!selConfig) return;
    siPeriodService.list(selConfig.id).then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setPeriods(list);
      const active = list.find(p => !p.is_locked && p.status !== "PAID") || list[0];
      setSelPeriod(active || null);
    });
  }, [selConfig?.id]);

  /* ── Load KPI definitions ── */
  useEffect(() => {
    if (!selConfig) return;
    Promise.all([
      siCompanyKPIService.list(selConfig.id),
      siIndividualKPIService.list(selConfig.id),
    ]).then(async ([{ data: cd }, { data: id }]) => {
      const ckList = Array.isArray(cd) ? cd : (cd.results ?? []);
      const ikList = Array.isArray(id) ? id : (id.results ?? []);
      setCompKPIs(ckList);
      setIndKPIs(ikList);
      const sm = {};
      await Promise.all(ikList.map(async kpi => {
        const { data: sd } = await siIndividualScaleService.list(kpi.id);
        sm[kpi.id] = Array.isArray(sd) ? sd : (sd.results ?? []);
      }));
      setScalesMap(sm);
      setIndInputs(ikList.map(k => ({ kpi_id: k.id, band_label: "" })));
    });
  }, [selConfig?.id]);

  /* ── Company KPI inputs — period-level (eyni period daxilində bütün işçilər üçün eyni) ── */
  useEffect(() => {
    if (!compKPIs.length) return;
    const periodInputs = selPeriod?.company_kpi_inputs ?? [];
    setCompInputs(
      compKPIs.map(k => {
        const saved = periodInputs.find(i => i.kpi_id === k.id);
        return saved ? { kpi_id: k.id, target: saved.target ?? "", actual: saved.actual ?? "" }
                     : { kpi_id: k.id, target: "", actual: "" };
      })
    );
  }, [selPeriod?.id, compKPIs]);

  /* ── Load calcs + summary ── */
  const loadCalcs = useCallback(async () => {
    if (!selPeriod) return;
    const [{ data: cd }, { data: sm }] = await Promise.all([
      siCalcService.list(selPeriod.id),
      siCalcService.periodSummary(selPeriod.id),
    ]);
    setCalcs(Array.isArray(cd) ? cd : (cd.results ?? []));
    setSummary(sm);
    setSelCalc(null);
    setDetail(null);
  }, [selPeriod?.id]);

  useEffect(() => { loadCalcs(); }, [loadCalcs]);

  /* ── Load detail when employee selected ── */
  useEffect(() => {
    if (!selCalc) {
      setDetail(null);
      setDetailDisplayCurrency(null);
      return;
    }
    setDetailDisplayCurrency(null);
    siCalcService.detail(selCalc.id).then(({ data }) => {
      setDetail(data);
      // Pre-fill individual KPI inputs (per-employee)
      if (data.individual_kpi_inputs?.length) {
        setIndInputs(data.individual_kpi_inputs.map(i => ({ ...i })));
      } else {
        setIndInputs(indKPIs.map(k => ({ kpi_id: k.id, band_label: "" })));
      }
    });
  }, [selCalc?.id]);

  /* ── Actions ── */
  const handleCalculate = async () => {
    if (!selCalc || selPeriod?.is_locked) return;
    setSaving(true);
    try {
      const { data } = await siCalcService.calculate(selCalc.id, {
        company_kpi_inputs:    compInputs.map(i => ({
          kpi_id: i.kpi_id,
          target: parseFloat(i.target) || 0,
          actual: parseFloat(i.actual) || 0,
        })),
        individual_kpi_inputs: indInputs.filter(i => i.band_label),
      });
      setDetail(data.record);
      await loadCalcs();
      showSuccess("Bonus calculated.");
    } catch (e) {
      showError(e.response?.data ? JSON.stringify(e.response.data) : "Calculation failed.");
    } finally { setSaving(false); }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await siCalcService.approve(detail.id);
      const { data } = await siCalcService.detail(detail.id);
      setDetail(data);
      await loadCalcs();
      showSuccess("Approved.");
    } catch { showError("Failed to approve."); }
    finally { setSaving(false); }
  };

  const handleBulkCalc = async () => {
    if (!selPeriod || !confirm("Calculate bonus for ALL employees in this period?")) return;
    setSaving(true);
    try {
      const indMap = {};
      calcs.forEach(c => { indMap[String(c.employee)] = indInputs; });
      await siCalcService.bulkCalculate({
        period_id:                 selPeriod.id,
        company_kpi_inputs:        compInputs.map(i => ({
          kpi_id: i.kpi_id,
          target: parseFloat(i.target) || 0,
          actual: parseFloat(i.actual) || 0,
        })),
        individual_kpi_inputs_map: indMap,
      });
      await loadCalcs();
      showSuccess("Bulk calculation complete.");
    } catch { showError("Bulk calculation failed."); }
    finally { setSaving(false); }
  };

  const handleSyncSalaries = async () => {
    if (!selPeriod) return;
    setSyncing(true);
    try {
      const { data } = await siCalcService.refreshSalaries(selPeriod.id);
      await loadCalcs();
      showSuccess(`Salaries synced for ${data.updated} employees.`);
    } catch { showError("Failed to sync salaries."); }
    finally { setSyncing(false); }
  };

  const handleSaveCompanyKPIs = async () => {
    if (!selPeriod) return;
    setSavingKPIs(true);
    try {
      const inputs = compInputs.map(i => ({
        kpi_id: i.kpi_id,
        target: parseFloat(i.target) || 0,
        actual: parseFloat(i.actual) || 0,
      }));
      await siPeriodService.setCompanyKpis(selPeriod.id, inputs);
      setSelPeriod(prev => ({ ...prev, company_kpi_inputs: inputs }));
      showSuccess("Company KPI targets saved for this period.");
    } catch { showError("Failed to save company KPI targets."); }
    finally { setSavingKPIs(false); }
  };

  const handleExportPdf = async (calcId, empName) => {
    if (!calcId) return;
    setExportingPdf(true);
    try {
      const { data } = await siCalcService.exportPdf(calcId);
      const url = URL.createObjectURL(data);
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `si_bonus_${(empName || calcId).replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { showError("PDF export failed."); }
    finally { setExportingPdf(false); }
  };

  const handleExportExcel = async () => {
    if (!selPeriod) return;
    setExporting(true);
    try {
      const { data } = await siCalcService.exportExcel({ period: selPeriod.id });
      const url = URL.createObjectURL(data);
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `si_bonus_${selPeriod.period_name?.replace(/\s+/g, '_') || selPeriod.id}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { showError("Excel export failed."); }
    finally { setExporting(false); }
  };

  /* ── Loading / empty ── */
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (configs.length === 0) return (
    <div className={`rounded-2xl border p-16 text-center ${card}`}>
      <div className={`inline-flex p-4 rounded-2xl mb-4 ${dark ? "bg-amber-500/10" : "bg-amber-50"}`}>
        <TrendingUp size={28} className="text-amber-500" />
      </div>
      <p className={`text-sm font-bold ${text}`}>No Sales Incentive config found</p>
      <p className={`text-xs mt-2 ${sub}`}>Go to SI Settings to create a configuration first.</p>
    </div>
  );

  /* ─────────────────────── RENDER ─────────────────────── */
  const pipelineSteps = summary ? [
    { label: "Not Started", icon: <Circle size={10} />,      count: summary.status_dist?.DRAFT || 0,      active: false },
    { label: "Calculated",  icon: <Calculator size={10} />,  count: summary.status_dist?.CALCULATED || 0, active: (summary.status_dist?.CALCULATED || 0) > 0 },
    { label: "Approved",    icon: <CheckCircle size={10} />, count: summary.status_dist?.APPROVED || 0,   active: false },
  ] : [];

  return (
    <div>

      {/* ── Pipeline + Tabs header (matches Performance Bonus style) ── */}
      <div className={`px-6 border-b ${dark ? "bg-[#0d0d0d] border-[#1c1c1c]" : "bg-white border-gray-200"}`}>

        {/* Config + Period row */}
        <div className="flex items-center gap-3 py-3 flex-wrap">
          {configs.length > 1 ? (
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-amber-500" />
              <select
                value={selConfig?.id ?? ""}
                onChange={e => setSelConfig(configs.find(c => c.id === Number(e.target.value)))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none transition
                  ${dark ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}>
                {configs.map(c => <option key={c.id} value={c.id}>{c.business_function_name}</option>)}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-amber-500" />
              <span className={`text-sm font-bold ${text}`}>{selConfig?.business_function_name}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                ${dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                {selConfig?.bonus_scheme_name}
              </span>
            </div>
          )}

          <div className={`w-px h-5 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

          <PeriodSelector
            periods={periods} selected={selPeriod}
            onChange={p => { setSelPeriod(p); setSelCalc(null); }}
            dark={dark}
          />

          {summary && !summary.pool_ok && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
              <AlertTriangle size={11} /> Pool cap exceeded
            </span>
          )}
        </div>

        {/* Pipeline row */}
        {summary && calcs.length > 0 && (
          <div className={`flex items-center gap-3 py-3 border-t ${dark ? "border-[#1e1e1e]" : "border-gray-100"}`}>
            <SIPipeline steps={pipelineSteps} dark={dark} />
            <span className={`ml-auto text-xs ${muted}`}>{calcs.length} employees total</span>
          </div>
        )}

        {/* Tabs with underline */}
        <div className="flex items-center gap-0 mt-1">
          {[
            { id: "calc",   icon: Calculator,  label: "Calculate & Approve" },
            { id: "report", icon: FileBarChart, label: "Report & Export"    },
          ].map(({ id, icon: Icon, label }) => {
            const isActive = view === id;
            return (
              <button key={id} onClick={() => setView(id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all whitespace-nowrap
                  ${isActive
                    ? dark ? "text-white" : "text-amber-600"
                    : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon size={14} /> {label}
                {isActive && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full
                    ${dark ? "bg-amber-400" : "bg-amber-500"}`} />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setDocOpen(o => !o)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border mb-1
              ${docOpen
                ? dark ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-300 text-amber-700"
                : dark ? "border-[#2a2a2a] text-gray-500 hover:text-gray-300 hover:border-[#3a3a3a]"
                       : "border-gray-200 text-gray-400 hover:text-amber-600 hover:bg-amber-50"}`}>
            <BookOpen size={12} />
            How it works
            {docOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className=" py-4 space-y-4">

      {/* ── Documentation panel ── */}
      {docOpen && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-3.5 border-b flex items-center gap-2.5
            ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-amber-100 bg-amber-50/60"}`}>
            <div className={`p-1.5 rounded-lg ${dark ? "bg-amber-500/15" : "bg-amber-100"}`}>
              <BookOpen size={13} className="text-amber-500" />
            </div>
            <span className={`text-sm font-bold ${text}`}>SI Calculation Flow</span>
            <span className={`ml-2 text-xs ${muted}`}>How bonuses are calculated — step by step</span>
          </div>
          <div className="p-5 space-y-5">

            {/* Step grid */}
            {[
              {
                n: "1", color: "amber",
                title: "Total Salary Pool",
                desc: "All eligible employees' monthly salaries are summed to form the Total Salary Pool.",
                formula: "Total Pool = SUM(all monthly salaries)",
                example: "e.g. £3,750 + £2,917 = £6,667",
              },
              {
                n: "2", color: "orange",
                title: "Payroll % (Each Employee's Share)",
                desc: "Each employee's salary is divided by the Total Pool. This determines their proportional weight in the bonus distribution.",
                formula: "Payroll % = Employee Salary ÷ Total Pool",
                example: "e.g. £3,750 ÷ £6,667 = 56.2%",
              },
              {
                n: "3", color: "yellow",
                title: "Company KPI Evaluation → Bonus Pool",
                desc: "Each company KPI (e.g. Sales Volume, Gross Profit) is evaluated by comparing Actual vs Target. A rating (E−, E, E+, E++) is assigned, which maps to a bonus percentage. Each KPI's bonus is: Total Pool × KPI Weight × Rating %.",
                formula: "KPI Bonus = Total Pool × Weight × Rating%  |  Pool = Σ KPI Bonuses",
                example: "e.g. £6,667 × 30% × 50% = £1,000  +  £6,667 × 70% × 50% = £2,333  →  Pool = £3,333",
              },
              {
                n: "4", color: "lime",
                title: "Employee Pool Portion",
                desc: "The total Bonus Pool is split according to each employee's Payroll %. This gives each person their personal share of the pool.",
                formula: "Pool Portion = Bonus Pool × Employee Payroll %",
                example: "e.g. £3,333 × 56.2% = £1,875",
              },
              {
                n: "5", color: "emerald",
                title: "Individual KPI Evaluation",
                desc: "Each employee has personal KPIs. Their actual result is looked up in the band table (E−, E, E+, E++) and assigned a multiplier (0×, 1×, 1.1×, 1.2×). Each KPI's bonus is: Pool Portion × KPI Weight × Multiplier.",
                formula: "KPI Bonus = Pool Portion × Weight × Multiplier",
                example: "e.g. £1,875 × 50% × 1.0 = £937.50  (×2 KPIs)",
              },
              {
                n: "6", color: "teal",
                title: "Total Bonus",
                desc: "The employee's total bonus is the sum of all individual KPI bonuses.",
                formula: "Total Bonus = Σ Individual KPI Bonuses",
                example: "e.g. £937.50 + £937.50 = £1,875",
              },
            ].map(({ n, color, title, desc, formula, example }) => (
              <div key={n} className={`flex gap-4 p-4 rounded-xl border
                ${dark ? `bg-${color}-500/5 border-${color}-500/15` : `bg-${color}-50/50 border-${color}-100`}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full text-sm font-black flex items-center justify-center
                  ${dark ? `bg-${color}-500/20 text-${color}-400` : `bg-${color}-100 text-${color}-700`}`}>
                  {n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold mb-1 ${text}`}>{title}</p>
                  <p className={`text-xs leading-relaxed mb-2 ${muted}`}>{desc}</p>
                  <div className={`px-3 py-2 rounded-lg text-xs font-mono mb-1
                    ${dark ? "bg-[#141414] text-amber-400 border border-[#2a2a2a]" : "bg-white text-amber-700 border border-amber-200"}`}>
                    {formula}
                  </div>
                  <p className={`text-[11px] italic ${dark ? "text-gray-600" : "text-gray-400"}`}>{example}</p>
                </div>
              </div>
            ))}

            {/* Rating table */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${muted}`}>Rating Scale</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { r: "E−",  mul: "×0",   pct: "0%",   color: "rose"    },
                  { r: "E",   mul: "×1.0",  pct: "50%",  color: "amber"   },
                  { r: "E+",  mul: "×1.1",  pct: "80%",  color: "sky"     },
                  { r: "E++", mul: "×1.2",  pct: "100%", color: "emerald" },
                ].map(({ r, mul, pct, color }) => (
                  <div key={r} className={`p-3 rounded-xl border text-center
                    ${dark ? `bg-${color}-500/10 border-${color}-500/20` : `bg-${color}-50 border-${color}-200`}`}>
                    <p className={`text-base font-black ${dark ? `text-${color}-400` : `text-${color}-600`}`}>{r}</p>
                    <p className={`text-[10px] mt-1 font-mono ${dark ? `text-${color}-500` : `text-${color}-700`}`}>
                      Company: {pct}
                    </p>
                    <p className={`text-[10px] font-mono ${dark ? `text-${color}-500` : `text-${color}-700`}`}>
                      Individual: {mul}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No period */}
      {!selPeriod && (
        <div className={`rounded-2xl border p-14 text-center ${card}`}>
          <div className={`inline-flex p-4 rounded-2xl mb-4 ${dark ? "bg-[#1a1a1a]" : "bg-amber-50"}`}>
            <Calendar size={26} className="text-amber-500" />
          </div>
          <p className={`text-sm font-bold ${text}`}>No period selected</p>
          <p className={`text-xs mt-1.5 ${sub}`}>
            {periods.length === 0 ? "Create a period in SI Settings → Periods" : "Select a period from the dropdown above"}
          </p>
        </div>
      )}

      {/* ══ CALCULATE VIEW ══ */}
      {selPeriod && view === "calc" && (
        <div className="space-y-4">

        {/* ── Company KPI Targets (period-level, collapsible) ── */}
        {compKPIs.length > 0 && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div
              role="button"
              onClick={() => setKpiOpen(o => !o)}
              className={`w-full px-4 py-3 flex items-center gap-2 transition cursor-pointer
                ${dark ? "border-b border-[#1e1e1e] bg-[#0a0a0a] hover:bg-[#111]" : "border-b border-gray-100 bg-gray-50 hover:bg-gray-100/60"}
                ${kpiOpen ? "" : "border-b-0"}`}>
              <Target size={13} className="text-emerald-500" />
              <span className={`text-sm font-bold ${text}`}>Company KPI Targets</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-1
                ${dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                Shared · all employees
              </span>
              {/* Collapsed summary: show variance badges */}
              {!kpiOpen && compInputs.some(i => parseFloat(i.target) > 0) && (
                <div className="flex items-center gap-1.5 ml-2">
                  {compKPIs.map(kpi => {
                    const s = compInputs.find(c => c.kpi_id === kpi.id) || {};
                    const tgt = parseFloat(s.target) || 0;
                    const act = parseFloat(s.actual) || 0;
                    const v = tgt > 0 ? ((act - tgt) / tgt * 100) : null;
                    if (v === null) return null;
                    return (
                      <span key={kpi.id} className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md
                        ${v >= 0 ? dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                                 : dark ? "bg-rose-500/15 text-rose-400" : "bg-rose-50 text-rose-600"}`}>
                        {v >= 0 ? "+" : ""}{v.toFixed(1)}%
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                {!selPeriod.is_locked && kpiOpen && (
                  <span onClick={e => e.stopPropagation()}>
                    <button onClick={handleSaveCompanyKPIs} disabled={savingKPIs}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60 transition shadow-sm">
                      {savingKPIs
                        ? <><RefreshCw size={11} className="animate-spin" /> Saving…</>
                        : <><CheckCircle size={11} /> Save Targets</>}
                    </button>
                  </span>
                )}
                <ChevronDown size={14} className={`${muted} transition-transform ${kpiOpen ? "rotate-180" : ""}`} />
              </div>
            </div>

            {kpiOpen && (
              <div className="p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {compKPIs.map(kpi => {
                    const s   = compInputs.find(c => c.kpi_id === kpi.id) || {};
                    const tgt = parseFloat(s.target) || 0;
                    const act = parseFloat(s.actual) || 0;
                    const variance = tgt > 0 ? ((act - tgt) / tgt * 100) : null;
                    const upd = (field, val) =>
                      setCompInputs(prev => prev.map(c => c.kpi_id === kpi.id ? { ...c, [field]: val } : c));
                    return (
                      <div key={kpi.id} className={`p-3 rounded-xl border ${dark ? "bg-[#0a0a0a] border-[#1e1e1e]" : "bg-gray-50 border-gray-100"}`}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={`text-xs font-bold ${text}`}>{kpi.kpi_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                            {kpi.weight}%
                          </span>
                          {variance !== null && (
                            <span className={`ml-auto text-xs font-bold tabular-nums ${variance >= 0 ? "text-emerald-500" : "text-rose-400"}`}>
                              {variance >= 0 ? "+" : ""}{variance.toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {["target", "actual"].map(field => (
                            <div key={field}>
                              <label className={`text-[10px] font-semibold uppercase tracking-wide block mb-1 ${muted}`}>{field}</label>
                              <input type="number"
                                value={s[field] ?? ""} onChange={e => upd(field, e.target.value)}
                                disabled={selPeriod.is_locked} placeholder="0"
                                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition text-right font-mono disabled:opacity-50 ${inp}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-[300px_1fr] gap-4">

          {/* Employee list */}
          <div className={`rounded-2xl border overflow-hidden self-start ${card}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between
              ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
              <div className="flex items-center gap-2">
                <Users size={13} className="text-almet-steel-blue" />
                <span className={`text-sm font-bold ${text}`}>Employees</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-1
                  ${dark ? "bg-almet-sapphire/15 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
                  {calcs.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isAdmin && calcs.length > 0 && (
                  <button onClick={handleSyncSalaries} disabled={syncing}
                    title="Sync salaries from Bonus System"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition
                      ${dark ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                             : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}>
                    {syncing ? <RefreshCw size={10} className="animate-spin" /> : <DollarSign size={10} />}
                    {syncing ? "Syncing…" : "Sync $"}
                  </button>
                )}
                {isAdmin && calcs.length > 0 && !selPeriod.is_locked && (
                  <button onClick={handleBulkCalc} disabled={saving}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition
                      ${dark ? "bg-[#1e1e1e] text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                             : "bg-gray-100 text-gray-500 hover:bg-almet-mystic hover:text-almet-sapphire"}`}>
                    <RefreshCw size={10} className={saving ? "animate-spin" : ""} /> Bulk Calc
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y max-h-[calc(100vh-240px)] overflow-y-auto"
              style={{ borderColor: dark ? "#1e1e1e" : "#f3f4f6" }}>
              {calcs.length === 0 && (
                <p className={`text-center py-10 text-xs ${muted}`}>No employees. Init period in SI Settings.</p>
              )}
              {calcs.map(c => {
                const isSel = selCalc?.id === c.id;
                return (
                  <button key={c.id} onClick={() => setSelCalc(c)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition
                      ${isSel ? dark ? "bg-amber-500/10" : "bg-amber-50"
                              : dark ? "hover:bg-[#111]" : "hover:bg-gray-50/60"}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${text}`}>{c.employee_name}</p>
                      <p className={`text-xs truncate ${sub}`}>{c.job_title || "—"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_CFG[c.status]?.(dark) || ""}`}>
                        {STATUS_LABEL[c.status] || c.status}
                      </span>
                      {c.status !== "DRAFT" && (() => {
                        const empCur = c.employee_currency || c.salary_currency;
                        const toCur  = displayCurrency || empCur;
                        return (
                          <span className="text-xs font-bold tabular-nums text-emerald-500">
                            {currSym(toCur)}{fmt(convertAmountSI(c.total_bonus, empCur, toCur, exchangeRates))}
                          </span>
                        );
                      })()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {!selCalc ? (
              <div className={`rounded-2xl border p-14 text-center ${card}`}>
                <div className={`inline-flex p-4 rounded-2xl mb-4 ${dark ? "bg-[#1a1a1a]" : "bg-amber-50"}`}>
                  <Calculator size={26} className="text-amber-500" />
                </div>
                <p className={`text-sm font-bold ${text}`}>Select an employee</p>
                <p className={`text-xs mt-1 ${sub}`}>Choose from the list on the left</p>
              </div>
            ) : (
              <>
                {/* Employee header */}
                <div className={`rounded-2xl border p-4 flex items-start justify-between gap-4 ${card}`}>
                  <div>
                    <h2 className={`text-base font-bold ${text}`}>{selCalc.employee_name}</h2>
                    <p className={`text-xs mt-0.5 ${sub}`}>{selCalc.job_title || "—"} · {selCalc.employee_id_code}</p>
                    {detail?.calculated_at && (
                      <p className={`text-[10px] mt-1.5 ${muted}`}>
                        Last calculated: {new Date(detail.calculated_at).toLocaleString("en", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {!selPeriod.is_locked && detail?.status !== "APPROVED" && (
                      <button onClick={handleCalculate} disabled={saving}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-60 transition shadow-sm
                          ${detail?.status === "CALCULATED" ? "bg-almet-san-juan hover:bg-almet-cloud-burst" : "bg-amber-600 hover:bg-amber-700"}`}>
                        {saving
                          ? <><RefreshCw size={12} className="animate-spin" /> Calculating…</>
                          : detail?.status === "CALCULATED"
                            ? <><RefreshCw size={12} /> Recalculate</>
                            : <><Calculator size={12} /> Calculate</>}
                      </button>
                    )}
                    {detail?.status === "CALCULATED" && !selPeriod.is_locked && (
                      <button onClick={handleApprove} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60 transition shadow-sm">
                        <CheckCircle size={12} /> {saving ? "Approving…" : "Final Approve"}
                      </button>
                    )}
                    {selPeriod.is_locked && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-400 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                        <Lock size={11} /> Locked
                      </span>
                    )}
                    {detail && detail.status !== "DRAFT" && (
                      <button
                        onClick={() => handleExportPdf(detail.id, detail.employee_name || selCalc.employee_name)}
                        disabled={exportingPdf}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-60 transition shadow-sm">
                        {exportingPdf
                          ? <><RefreshCw size={12} className="animate-spin" /> Exporting…</>
                          : <><Download size={12} /> PDF</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Individual KPI bands */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className={`px-4 py-3 border-b flex items-center gap-2
                    ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
                    <TrendingUp size={13} className="text-amber-500" />
                    <span className={`text-sm font-bold ${text}`}>Individual KPI Bands</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {indKPIs.length === 0 && <p className={`text-xs text-center py-4 ${muted}`}>No individual KPIs configured.</p>}
                    {indKPIs.map(kpi => {
                      const bands    = scalesMap[kpi.id] || [];
                      const selBand  = indInputs.find(i => i.kpi_id === kpi.id)?.band_label || "";
                      const selScale = bands.find(b => b.band_label === selBand);
                      return (
                        <div key={kpi.id} className={`p-3 rounded-xl border ${dark ? "bg-[#0a0a0a] border-[#1e1e1e]" : "bg-gray-50 border-gray-100"}`}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className={`text-xs font-bold ${text}`}>{kpi.kpi_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                              ${dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                              {kpi.weight}%
                            </span>
                            {selScale && (
                              <div className="ml-auto flex items-center gap-1.5">
                                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${ratingColor(selScale.rating_code, dark)}`}>
                                  {selScale.rating_code}
                                </span>
                                <span className={`text-xs font-bold ${parseFloat(selScale.multiplier) >= 1 ? "text-emerald-500" : "text-rose-400"}`}>
                                  ×{selScale.multiplier}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {bands.map(band => (
                              <button key={band.id} type="button"
                                disabled={selPeriod.is_locked}
                                onClick={() => setIndInputs(prev => prev.map(i => i.kpi_id === kpi.id ? { ...i, band_label: band.band_label } : i))}
                                className={`py-2 px-3 rounded-xl border text-left transition disabled:opacity-50
                                  ${selBand === band.band_label
                                    ? dark ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-amber-400/50 bg-amber-50 text-amber-700"
                                    : dark ? "border-[#1e1e1e] text-gray-400 hover:border-[#2e2e2e] hover:text-gray-200"
                                           : "border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300"}`}>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md mr-1.5 ${ratingColor(band.rating_code, dark)}`}>
                                  {band.rating_code}
                                </span>
                                <span className="text-xs font-semibold">{band.band_label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Results */}
                {detail && detail.status !== "DRAFT" && (
                  <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 flex-wrap
                      ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
                      <span className={`text-sm font-bold ${text}`}>Results</span>
                      {/* Currency selector for Results panel */}
                      {exchangeRates.length > 0 && (() => {
                        const empCur = selCalc?.employee_currency || selCalc?.salary_currency || "AZN";
                        const available = [...new Set(["AZN", "USD", "GBP", empCur, ...exchangeRates.flatMap(r => [r.from_currency, r.to_currency])])].filter(Boolean);
                        return (
                          <div className="flex items-center gap-1">
                            <DollarSign size={11} className={muted} />
                            {available.map(c => {
                              const canConvert = c === empCur || exchangeRates.some(r =>
                                (r.from_currency === empCur && r.to_currency === c) ||
                                (r.from_currency === c && r.to_currency === empCur)
                              );
                              return (
                                <button key={c}
                                  onClick={() => canConvert ? setDetailDisplayCurrency(detailDisplayCurrency === c ? null : c) : undefined}
                                  disabled={!canConvert}
                                  title={!canConvert ? "No exchange rate configured" : c}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition
                                    ${(detailDisplayCurrency ?? empCur) === c
                                      ? "bg-almet-sapphire text-white border-almet-sapphire"
                                      : !canConvert
                                        ? `opacity-40 cursor-not-allowed line-through ${dark ? "border-[#2a2a2a] text-gray-600" : "border-gray-100 text-gray-300"}`
                                        : dark ? "border-[#2a2a2a] text-gray-400 hover:border-almet-sapphire/40 hover:text-almet-steel-blue"
                                               : "border-gray-200 text-gray-500 hover:border-almet-sapphire/40 hover:text-almet-sapphire"}`}>
                                  {c}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="p-4 space-y-4">
                      {(() => {
                        // Use selCalc.employee_currency as native (from list API — not affected by serializer default='AZN' bug)
                        const nativeCur = selCalc?.employee_currency || selCalc?.salary_currency || "AZN";
                        const toCur = detailDisplayCurrency || nativeCur;
                        const cur = currSym(toCur);
                        const convD = (v) => convertAmountSI(v, nativeCur, toCur, exchangeRates);
                        const isConverted = toCur !== nativeCur;
                        return (
                      <>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: "Monthly Salary",    value: convD(detail.monthly_salary),       color: text,                    gross: true  },
                          { label: "Total Salary Pool", value: convD(detail.total_salary),          color: sub                                   },
                          { label: "Payroll %",         value: null,                               color: "text-almet-steel-blue"               },
                          { label: "Pool Portion",      value: convD(detail.employee_pool_portion), color: "text-orange-400"                     },
                        ].map(({ label, value, color, gross }) => (
                          <div key={label} className={`p-3 rounded-xl text-center ${dark ? "bg-[#141414]" : "bg-gray-50 border border-gray-100"}`}>
                            <div className={`text-[10px] mb-1 flex items-center justify-center gap-1 ${sub}`}>
                              {label}
                              {gross && (
                                <span className="px-1 py-0 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400">G</span>
                              )}
                            </div>
                            <p className={`text-xs font-bold tabular-nums ${color}`}>
                              {value === null ? fmtP(detail.payroll_impact_pct) : `${cur}${fmt(value)}`}
                            </p>
                          </div>
                        ))}
                      </div>

                      {isConverted && (
                        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                          ${dark ? "bg-almet-sapphire/10 text-almet-steel-blue border border-almet-sapphire/20"
                                 : "bg-almet-mystic text-almet-sapphire border border-almet-sapphire/20"}`}>
                          <DollarSign size={11} />
                          Converted from {nativeCur} → {toCur}
                        </div>
                      )}

                      {detail.company_kpi_results?.length > 0 && (
                        <div>
                          <p className={`text-xs font-semibold mb-2 ${sub}`}>Company KPIs</p>
                          <div className="space-y-1.5">
                            {detail.company_kpi_results.map((r, i) => (
                              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                                ${dark ? "bg-[#111] border border-[#1e1e1e]" : "bg-gray-50 border border-gray-100"}`}>
                                <span className={`text-xs font-semibold flex-1 min-w-0 truncate ${text}`}>{r.kpi_name}</span>
                                <span className={`text-xs font-mono ${sub}`}>{r.weight}%</span>
                                <span className={`text-xs ${sub}`}>{r.variance_pct >= 0 ? "+" : ""}{(r.variance_pct * 100).toFixed(1)}%</span>
                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${ratingColor(r.rating_code, dark)}`}>{r.rating_code}</span>
                                <span className="text-xs font-bold tabular-nums text-emerald-500 w-20 text-right">{cur}{fmt(convD(r.kpi_bonus))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {detail.individual_kpi_results?.length > 0 && (
                        <div>
                          <p className={`text-xs font-semibold mb-2 ${sub}`}>Individual KPIs</p>
                          <div className="space-y-1.5">
                            {detail.individual_kpi_results.map((r, i) => (
                              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                                ${dark ? "bg-[#111] border border-[#1e1e1e]" : "bg-gray-50 border border-gray-100"}`}>
                                <span className={`text-xs font-semibold flex-1 min-w-0 truncate ${text}`}>{r.kpi_name}</span>
                                <span className={`text-xs ${sub}`}>{r.band_label}</span>
                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${ratingColor(r.rating_code, dark)}`}>{r.rating_code}</span>
                                <span className={`text-xs font-bold ${sub}`}>×{r.multiplier}</span>
                                {r.overridden && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                                    ${dark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-600"}`}>
                                    adj
                                  </span>
                                )}
                                <span className="text-xs font-bold tabular-nums text-emerald-500 w-20 text-right">{cur}{fmt(convD(r.kpi_bonus))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`p-4 rounded-xl flex items-center justify-between ring-1
                        ${dark ? "bg-emerald-500/10 ring-emerald-500/25" : "bg-emerald-50 ring-emerald-200"}`}>
                        <div>
                          <p className={`text-xs font-semibold flex items-center gap-1.5 ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
                            Total Bonus
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">Gross</span>
                          </p>
                          <p className={`text-[10px] mt-0.5 ${dark ? "text-emerald-500/60" : "text-emerald-600/60"}`}>
                            {fmtP(detail.payroll_impact_pct)} of pool
                            {isConverted && ` · ${toCur}`}
                          </p>
                        </div>
                        <p className={`text-2xl font-bold tabular-nums ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
                          {cur}{fmt(convD(detail.total_bonus))}
                        </p>
                      </div>

                      {detail.pool_warning && (
                        <div className={`flex items-center gap-2.5 p-3 rounded-xl border
                          ${dark ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                          <AlertTriangle size={13} className="shrink-0" />
                          <p className="text-xs">{detail.notes?.replace("[WARNING] ", "")}</p>
                        </div>
                      )}
                      </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ══ REPORT VIEW ══ */}
      {selPeriod && view === "report" && (
        <div className="space-y-4">

          {/* ── Report header row ── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className={`text-base font-bold ${text}`}>SI Report</h2>
              {summary && (
                <p className={`text-sm mt-0.5 ${sub}`}>
                  {selPeriod.period_name} · {summary.employee_count} employees ·{" "}
                  Pool ratio:{" "}
                  <span className={summary.pool_ok ? "text-emerald-500 font-semibold" : "text-amber-400 font-semibold"}>
                    {(summary.pool_ratio * 100).toFixed(1)}%
                  </span>
                </p>
              )}
            </div>
            <button onClick={handleExportExcel} disabled={exporting || calcs.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm">
              {exporting
                ? <><RefreshCw size={12} className="animate-spin" /> Exporting…</>
                : <><Download size={12} /> Export Excel</>}
            </button>
          </div>

          {/* ── Summary stats ── */}
          {summary && (() => {
            const sumCur = currSym(calcs[0]?.employee_currency || calcs[0]?.salary_currency);
            return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Employees", value: summary.employee_count,  color: "text-almet-steel-blue" },
                { label: "Approved",        value: (summary.status_dist?.APPROVED || 0) + (summary.status_dist?.PAID || 0), color: "text-emerald-500" },
                { label: "Total Bonus Pool", value: `${sumCur}${fmt(summary.total_bonus)}`, color: "text-amber-500" },
                { label: "Avg Bonus",        value: `${sumCur}${fmt(summary.avg_bonus)}`,   color: "text-violet-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-2xl border p-4 text-center ${card}`}>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${sub}`}>{label}</p>
                  <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            );
          })()}

          {/* ── Analytics Charts (two separate cards like Performance Bonus) ── */}
          {summary && calcs.length > 0 && (() => {
            const chartCur = currSym(calcs[0]?.employee_currency || calcs[0]?.salary_currency);
            const chartData = calcs
              .filter(c => c.status !== 'DRAFT' && parseFloat(c.total_bonus) > 0)
              .sort((a, b) => parseFloat(b.total_bonus) - parseFloat(a.total_bonus))
              .slice(0, 15)
              .map(c => ({
                name: c.employee_name?.split(' ')[0] || c.employee_name,
                bonus: parseFloat(c.total_bonus || 0),
              }));
            const statusDist = [
              { name: "Not Started",      value: summary.status_dist?.DRAFT || 0,      fill: "#94a3b8" },
              { name: "Ready to Approve", value: summary.status_dist?.CALCULATED || 0, fill: "#3b82f6" },
              { name: "Approved",         value: summary.status_dist?.APPROVED || 0,   fill: "#10b981" },
              { name: "Paid",             value: summary.status_dist?.PAID || 0,        fill: "#8b5cf6" },
            ].filter(s => s.value > 0);
            return (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Top Bonuses card */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className={`px-5 py-3.5 border-b flex items-center justify-between
                    ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/60"}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${dark ? "bg-amber-500/15" : "bg-amber-50"}`}>
                        <BarChart2 size={13} className="text-amber-500" />
                      </div>
                      <span className={`text-sm font-bold ${text}`}>Top Bonuses</span>
                    </div>
                    <span className={`text-xs ${muted}`}>Calculated only</span>
                  </div>
                  <div className="p-5">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: dark ? '#6b7280' : '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: dark ? '#6b7280' : '#9ca3af' }} axisLine={false} tickLine={false}
                            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                          <Tooltip
                            contentStyle={{ background: dark ? '#1a1a1a' : '#fff', border: `1px solid ${dark ? '#2a2a2a' : '#e5e7eb'}`, borderRadius: 8, fontSize: 11 }}
                            formatter={v => [`${chartCur}${parseFloat(v).toFixed(2)}`, 'Bonus']}
                          />
                          <Bar dataKey="bonus" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, i) => <Cell key={i} fill="#f59e0b" />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className={`text-center text-sm py-12 ${muted}`}>No calculated records yet</p>
                    )}
                  </div>
                </div>

                {/* Status Distribution card */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className={`px-5 py-3.5 border-b flex items-center justify-between
                    ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/60"}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${dark ? "bg-blue-500/15" : "bg-blue-50"}`}>
                        <TrendingUp size={13} className="text-blue-500" />
                      </div>
                      <span className={`text-sm font-bold ${text}`}>Status Distribution</span>
                    </div>
                    <span className={`text-xs ${muted}`}>All employees</span>
                  </div>
                  <div className="p-5">
                    {statusDist.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie data={statusDist} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={2}>
                              {statusDist.map((s, i) => <Cell key={i} fill={s.fill} />)}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: dark ? '#1a1a1a' : '#fff', border: `1px solid ${dark ? '#2a2a2a' : '#e5e7eb'}`, borderRadius: 8, fontSize: 11 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-3 space-y-1.5">
                          {statusDist.map(s => (
                            <div key={s.name} className="flex items-center gap-2 text-xs">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.fill }} />
                              <span className={`flex-1 ${sub}`}>{s.name}</span>
                              <span className={`font-bold tabular-nums ${text}`}>{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className={`text-center text-sm py-12 ${muted}`}>No data</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Table ── */}
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {/* Currency selector */}
          {calcs.length > 0 && (() => {
            const nativeCurrencies = [...new Set(calcs.map(c => c.employee_currency || c.salary_currency).filter(Boolean))];
            const allCurrencies = [...new Set(["AZN", "USD", "GBP", ...nativeCurrencies, ...exchangeRates.map(r => r.from_currency), ...exchangeRates.map(r => r.to_currency)])].filter(Boolean);
            if (allCurrencies.length < 2) return null;
            return (
              <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
                <DollarSign size={12} className={muted} />
                <span className={`text-[11px] ${muted}`}>Display in:</span>
                <button onClick={() => setDisplayCurrency(null)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition
                    ${!displayCurrency ? "bg-almet-sapphire text-white" : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"}`}>
                  Native
                </button>
                {allCurrencies.map(c => {
                  const canConvert = hasRateFor(c, nativeCurrencies, exchangeRates);
                  return (
                    <button key={c}
                      onClick={() => canConvert ? setDisplayCurrency(c) : undefined}
                      disabled={!canConvert}
                      title={!canConvert ? "No exchange rate configured for this currency" : c}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition
                        ${displayCurrency === c
                          ? "bg-almet-sapphire text-white"
                          : !canConvert
                            ? `opacity-40 cursor-not-allowed line-through ${dark ? "text-gray-600" : "text-gray-300"}`
                            : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"}`}>
                      {c}
                    </button>
                  );
                })}
              </div>
            );
          })()}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs font-semibold
                  ${dark ? "border-[#1e1e1e] bg-[#0a0a0a] text-gray-500" : "border-gray-100 bg-gray-50 text-almet-bali-hai"}`}>
                  {["Employee", "Job Title", "Currency", `Monthly Salary (Gross)`, "Payroll %", "Pool Portion", `Total Bonus${displayCurrency ? ` (${displayCurrency})` : ""}`,"Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left whitespace-nowrap ${h !== "Employee" && h !== "Job Title" && h !== "Currency" ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calcs.length === 0 && (
                  <tr><td colSpan={8} className={`text-center py-14 text-sm ${sub}`}>No records</td></tr>
                )}
                {calcs.map(c => (
                  <tr key={c.id}
                    className={`border-t transition cursor-pointer
                      ${dark ? "border-[#1a1a1a] hover:bg-[#0d0d0d]" : "border-gray-50 hover:bg-almet-mystic/20"}`}
                    onClick={() => { setSelCalc(c); setView("calc"); }}>
                    <td className={`px-4 py-3 font-semibold ${text}`}>{c.employee_name}</td>
                    <td className={`px-4 py-3 text-xs ${sub}`}>{c.job_title || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-semibold
                        ${dark ? "bg-[#1a1a1a] text-gray-400" : "bg-gray-100 text-gray-600"}`}>
                        {c.salary_currency || c.employee_currency || "AZN"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-mono ${sub}`}>
                      {currSym(displayCurrency || c.employee_currency || c.salary_currency)}
                      {fmt(convertAmountSI(c.monthly_salary, c.employee_currency || c.salary_currency, displayCurrency || c.employee_currency || c.salary_currency, exchangeRates))}
                      <span className={`ml-1 text-[8px] font-bold px-0.5 rounded ${dark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>G</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono text-almet-steel-blue">{fmtP(c.payroll_impact_pct)}</td>
                    <td className="px-4 py-3 text-right text-xs font-mono text-orange-400">
                      {currSym(displayCurrency || c.employee_currency || c.salary_currency)}
                      {fmt(convertAmountSI(c.employee_pool_portion, c.employee_currency || c.salary_currency, displayCurrency || c.employee_currency || c.salary_currency, exchangeRates))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold tabular-nums ${c.status === "DRAFT" ? sub : "text-emerald-500"}`}>
                        {currSym(displayCurrency || c.employee_currency || c.salary_currency)}
                        {fmt(convertAmountSI(c.total_bonus, c.employee_currency || c.salary_currency, displayCurrency || c.employee_currency || c.salary_currency, exchangeRates))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_CFG[c.status]?.(dark) || ""}`}>
                        {STATUS_LABEL[c.status] || c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {calcs.length > 0 && (() => {
                const dispCur = currSym(displayCurrency || calcs[0]?.employee_currency || calcs[0]?.salary_currency);
                const sumConv = (field) => calcs.reduce((s, c) => {
                  const native = c.employee_currency || c.salary_currency;
                  return s + convertAmountSI(c[field] || 0, native, displayCurrency || native, exchangeRates);
                }, 0);
                return (
                <tfoot>
                  <tr className={`border-t font-bold text-sm ${dark ? "border-[#2a2a2a] bg-[#0a0a0a]" : "border-gray-200 bg-gray-50"}`}>
                    <td className={`px-4 py-3 ${text}`}>TOTAL</td>
                    <td /><td /><td className="px-4 py-3 text-right font-mono text-almet-steel-blue">
                      {dispCur}{fmt(sumConv("monthly_salary"))}
                    </td>
                    <td />
                    <td className="px-4 py-3 text-right font-mono text-orange-400">
                      {dispCur}{fmt(sumConv("employee_pool_portion"))}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-500">
                      {dispCur}{fmt(sumConv("total_bonus"))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
                );
              })()}
            </table>
          </div>
        </div>
      </div>
      )}

      </div>{/* end content px-6 py-4 */}
    </div>
  );
}
