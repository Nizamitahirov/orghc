"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import BonusYearSelector from "@/components/bonus/BonusYearSelector";
import BonusCalculationPanel from "@/components/bonus/BonusCalculationPanel";
import CompanyTargetEvalSection from "@/components/bonus/CompanyTargetEvalSection";

// Chart-heavy panels — loaded on demand when their tab is opened
const BonusReportSection = dynamic(() => import("@/components/bonus/BonusReportSection"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 text-gray-400">Loading reports...</div>,
});
const SalesIncentivePanel = dynamic(() => import("@/components/si/SalesIncentivePanel"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 text-gray-400">Loading SI panel...</div>,
});
import { bonusYearService, bonusRecordService } from "@/services/bonusService";
import { siConfigService, siPeriodService, siCalcService } from "@/services/siService";
import jobDescriptionService from "@/services/jobDescriptionService";
import {
  Settings, BarChart2, Calculator, Lock, ArrowLeft,
  Wallet, Users, CheckCircle, Lock as LockIcon,
  TrendingUp, ChevronRight, Target, Brain, Building2,
  Info, Circle, ArrowRight, Zap, FileBarChart,
} from "lucide-react";

// ─── Pipeline step indicator ───────────────────────────────────────────────
function Pipeline({ dark, steps }) {
  const doneCount = steps.filter(s => s.count > 0).length;
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className={`relative flex items-center w-full mb-3`}>
        {/* Background track */}
        <div className={`absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
        {/* Filled track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all duration-500"
          style={{ width: steps.length > 1 ? `${((doneCount - 1) / (steps.length - 1)) * 100}%` : doneCount > 0 ? '100%' : '0%' }}
        />
        {/* Step circles */}
        <div className="relative flex justify-between w-full">
          {steps.map((step, i) => {
            const done = step.count > 0;
            return (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-sm z-10 ${
                  done && step.active
                    ? "bg-almet-sapphire border-almet-sapphire text-white shadow-almet-sapphire/30"
                    : done
                      ? dark ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-emerald-50 border-emerald-500 text-emerald-600"
                      : dark ? "bg-gray-800 border-gray-700 text-gray-600" : "bg-white border-gray-300 text-gray-400"
                }`}>
                  <span className="w-4 h-4 flex items-center justify-center">{step.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Labels row */}
      <div className="flex justify-between w-full">
        {steps.map((step) => {
          const done = step.count > 0;
          return (
            <div key={step.label} className="flex flex-col items-center gap-0.5 min-w-0">
              <span className={`text-[10px] font-semibold text-center leading-tight ${
                done && step.active ? "text-almet-sapphire" : done ? dark ? "text-emerald-400" : "text-emerald-700" : dark ? "text-gray-600" : "text-gray-400"
              }`}>{step.label}</span>
              {step.count > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  done && step.active ? "bg-almet-sapphire/10 text-almet-sapphire" : dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                }`}>{step.count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function BonusMainPage() {
  return (
    <Suspense>
      <BonusMainPageContent />
    </Suspense>
  );
}

function BonusMainPageContent() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();

  // "overview" | "performance" | "si"
  const [view, setViewState]         = useState(() => {
    const t = searchParams.get("tab");
    return (t === "performance" || t === "si") ? t : "overview";
  });
  // Sub-view within performance: "calc" | "report"
  const [perfView, setPerfViewState] = useState(() => {
    const s = searchParams.get("sub");
    return (s === "report") ? "report" : "calc";
  });
  // Initial view for SI panel
  const [siInitialView, setSiInitialView] = useState(() => {
    const s = searchParams.get("sub");
    return (s === "report") ? "report" : "calc";
  });

  const setView = (v) => {
    setViewState(v);
    const params = new URLSearchParams(searchParams);
    if (v === "overview") { params.delete("tab"); params.delete("sub"); }
    else params.set("tab", v);
    router.replace(`/bonus?${params.toString()}`, { scroll: false });
  };
  const setPerfView = (v) => {
    setPerfViewState(v);
    const params = new URLSearchParams(searchParams);
    params.set("sub", v);
    router.replace(`/bonus?${params.toString()}`, { scroll: false });
  };
  // SI stats for overview
  const [siSummary, setSiSummary] = useState(null);

  const [bonusYears, setBonusYears]         = useState([]);
  const [selectedYear, setSelectedYear]     = useState(null);
  const [records, setRecords]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [accessInfo, setAccessInfo]         = useState(null);

  useEffect(() => {
    Promise.all([
      jobDescriptionService.getMyAccessInfo(),
      bonusYearService.list(),
    ]).then(([access, { data }]) => {
      setAccessInfo(access);
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setBonusYears(list);
      const active = list.find((y) => y.is_active) || list[0];
      if (active) setSelectedYear(active);
    }).finally(() => setLoading(false));
    // Load SI stats for overview
    siConfigService.list().then(({ data }) => {
      const configs = Array.isArray(data) ? data : (data.results ?? []);
      if (!configs.length) return;
      siPeriodService.list(configs[0].id).then(({ data: pd }) => {
        const periods = Array.isArray(pd) ? pd : (pd.results ?? []);
        const activePeriod = periods.find(p => !p.is_locked && p.status !== 'PAID') || periods[0];
        if (activePeriod) {
          siCalcService.periodSummary(activePeriod.id).then(({ data: sm }) => setSiSummary(sm));
        }
      });
    }).catch(() => {});
  }, []);

  const loadRecords = useCallback(async () => {
    if (!selectedYear) return;
    setLoading(true);
    try {
      const { data } = await bonusRecordService.list(selectedYear.id);
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setRecords(list);
      // Keep selectedRecord pointing to the fresh object so the detail panel re-fetches
      setSelectedRecord(prev => prev ? (list.find(r => r.id === prev.id) ?? null) : null);
    } catch { setRecords([]); }
    finally  { setLoading(false); }
  }, [selectedYear?.id]);

  useEffect(() => {
    if (view === "performance") loadRecords();
  }, [loadRecords, view]);

  // ── Theme shortcuts ──
  const text  = dark ? "text-white"     : "text-almet-cloud-burst";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-500"  : "text-almet-bali-hai";
  const card  = dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-white border-gray-200 shadow-sm";
  const hr    = dark ? "border-[#1e1e1e]" : "border-gray-100";

  // ── Loading ──
  if (loading && !accessInfo) return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-almet-sapphire/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-almet-steel-blue animate-spin" />
          </div>
          <p className={`text-xs font-medium ${sub}`}>Loading…</p>
        </div>
      </div>
    </DashboardLayout>
  );

  const isAdmin   = accessInfo?.is_admin   === true;
  const isManager = accessInfo?.is_manager === true;

  // ── Access denied ──
  if (!isAdmin && !isManager) return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5
            ${dark ? "bg-white/[0.04] border border-white/[0.08]" : "bg-gray-50 border border-gray-200"}`}>
            <LockIcon size={26} className={muted} />
          </div>
          <h3 className={`text-base font-bold mb-2 ${text}`}>Access Denied</h3>
          <p className={`text-sm leading-relaxed ${sub}`}>
            You don't have permission to access bonus management.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );

  const stats = {
    total:      records.length,
    draft:      records.filter(r => r.status === "DRAFT").length,
    calculated: records.filter(r => r.status === "CALCULATED").length,
    approved:   records.filter(r => r.status === "APPROVED" || r.status === "PAID").length,
  };

  const perfPipelineSteps = [
    { label: "Not Started", icon: <Circle size={10} />,      count: stats.draft,      active: false },
    { label: "Calculated",  icon: <Calculator size={10} />,  count: stats.calculated, active: stats.calculated > 0 },
    { label: "Approved",    icon: <CheckCircle size={10} />, count: stats.approved,   active: false },
  ];

  // ════════════════════════════════════════════════════
  // ── VIEW: OVERVIEW ──────────────────────────────────
  // ════════════════════════════════════════════════════
  if (view === "overview") return (
    <DashboardLayout>
      <div className="min-h-screen">

        {/* ── Page title ── */}
        <div className={`px-6 pt-6 pb-5 rounded-lg border-b ${dark ? "bg-[#0d0d0d] border-[#1c1c1c]" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${dark ? "bg-almet-sapphire/20" : "bg-almet-mystic"}`}>
              <Wallet size={18} className="text-almet-steel-blue" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${text}`}>Bonus Management</h1>
              <p className={`text-xs mt-0.5 ${muted}`}>Choose which bonus system to work with</p>
            </div>
          </div>
        </div>

        <div className="py-6 space-y-5 ">

          {/* ── Explainer for non-technical users ── */}
          <div className={`rounded-2xl border p-4 ${dark ? "bg-[#0a0d14] border-almet-sapphire/20" : "bg-almet-mystic/40 border-almet-sapphire/15"}`}>
            <div className="flex items-start gap-3">
              <Info size={16} className="text-almet-steel-blue mt-0.5 " />
              <div>
                <p className={`text-sm font-semibold mb-1 ${text}`}>Two separate bonus systems — which one to use?</p>
                <p className={`text-xs leading-relaxed ${muted}`}>
                  The company uses <b className={text}>two different bonus systems</b> for different employee groups.
                  You only need to use <b className={text}>one</b> depending on the type of employees you're processing.
                </p>
                
              </div>
            </div>
          </div>

          {/* ── Two System Cards ── */}
          <div className="grid lg:grid-cols-2 gap-5">

            {/* ── Performance Bonus ── */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              {/* Header */}
              <div className={`p-5 border-b ${hr}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-2xl ${dark ? "bg-almet-sapphire/15" : "bg-blue-50"}`}>
                    <Target size={22} className="text-almet-steel-blue" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-base font-bold ${text}`}>Performance Bonus</h2>
                      {selectedYear?.is_active && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                          ${dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                          Active Year
                        </span>
                      )}
                      {selectedYear?.is_locked && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500">
                          <Lock size={9} /> Locked
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${muted}`}>Annual · {selectedYear ? `${selectedYear.year} fiscal year` : "All employees except sales"}</p>
                  </div>
                </div>

                {/* How it works */}
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${dark ? "bg-[#141414]" : "bg-gray-50"} ${muted}`}>
                  Paid once a year. The bonus amount is calculated based on:
                  <span className={`font-semibold ${text}`}> company targets achieved</span>,
                  <span className={`font-semibold ${text}`}> employee's personal objectives</span>, and
                  <span className={`font-semibold ${text}`}> competency ratings</span>.
                </div>

                {/* Progress pipeline */}
                {records.length > 0 && (
                  <div className="mt-3">
                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${muted}`}>Current Progress</p>
                    <Pipeline dark={dark} steps={perfPipelineSteps} />
                  </div>
                )}
              </div>

              {/* Steps guide */}
              <div className={`px-5 py-4 border-b ${hr} ${dark ? "bg-[#0a0a0a]" : "bg-gray-50/50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${muted}`}>How to process</p>
                <div className="space-y-2">
                  {[
                    { n: "1", label: "Set company targets",    detail: "Enter annual KPI results for the company" },
                    { n: "2", label: "Calculate each employee", detail: "Click each employee and press Calculate" },
                    { n: "3", label: "Approve bonuses",         detail: "Review amounts and approve to finalize" },
                  ].map(({ n, label, detail }) => (
                    <div key={n} className="flex items-start gap-3">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5
                        ${dark ? "bg-almet-sapphire/20 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
                        {n}
                      </span>
                      <div>
                        <p className={`text-xs font-semibold ${text}`}>{label}</p>
                        <p className={`text-[11px] ${muted}`}>{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className={`px-5 py-4 flex items-center gap-2 flex-wrap`}>
                <button
                  onClick={() => { setPerfViewState("calc"); setView("performance"); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-astral text-white text-sm font-semibold transition shadow-sm">
                  <Calculator size={14} /> Calculate & Approve
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => { setPerfViewState("report"); setView("performance"); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition border
                    ${dark ? "border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                           : "border-gray-200 text-almet-waterloo hover:bg-almet-mystic hover:text-almet-sapphire"}`}>
                  <FileBarChart size={14} /> Reports
                </button>
                {isAdmin && (
                  <button
                    onClick={() => router.push("/bonus/settings")}
                    className={`ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border
                      ${dark ? "border-[#2a2a2a] text-gray-500 hover:text-gray-300 hover:border-[#3a3a3a]"
                             : "border-gray-200 text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}>
                    <Settings size={13} /> Settings
                  </button>
                )}
              </div>
            </div>

            {/* ── Sales Incentive ── */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              {/* Header */}
              <div className={`p-5 border-b ${hr}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-2xl ${dark ? "bg-amber-500/15" : "bg-amber-50"}`}>
                    <TrendingUp size={22} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-base font-bold ${text}`}>Sales Incentive (SI)</h2>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                        ${dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                        Sales Team Only
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${muted}`}>Quarterly · Sales team employees only</p>
                  </div>
                </div>

                {/* How it works */}
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${dark ? "bg-[#141414]" : "bg-amber-50/50"} ${muted}`}>
                  Paid every quarter. Bonus is calculated based on:
                  <span className={`font-semibold ${text}`}> company KPI results</span> and
                  <span className={`font-semibold ${text}`}> each salesperson's performance band</span>
                  {" "}(E−, E, E+, E++).
                </div>

                {/* SI stats pipeline */}
                {siSummary && (
                  <div className="mt-3">
                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${muted}`}>Current Period Progress</p>
                    <Pipeline dark={dark} steps={[
                      { label: "Not Started", icon: <Circle size={10} />,      count: siSummary.status_dist?.DRAFT || 0,      active: false },
                      { label: "Calculated",  icon: <Calculator size={10} />,  count: siSummary.status_dist?.CALCULATED || 0, active: (siSummary.status_dist?.CALCULATED || 0) > 0 },
                      { label: "Approved",    icon: <CheckCircle size={10} />, count: siSummary.status_dist?.APPROVED || 0,   active: false },
                    ]} />
                  </div>
                )}
              </div>

              {/* Steps guide */}
              <div className={`px-5 py-4 border-b ${hr} ${dark ? "bg-[#0a0a0a]" : "bg-gray-50/50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${muted}`}>How to process</p>
                <div className="space-y-2">
                  {[
                    { n: "1", label: "Select a period",          detail: "Choose the quarter you're processing" },
                    { n: "2", label: "Enter KPI actuals",         detail: "Input company and individual KPI results" },
                    { n: "3", label: "Calculate & Approve",       detail: "Run calculation then approve each employee" },
                  ].map(({ n, label, detail }) => (
                    <div key={n} className="flex items-start gap-3">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5
                        ${dark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                        {n}
                      </span>
                      <div>
                        <p className={`text-xs font-semibold ${text}`}>{label}</p>
                        <p className={`text-[11px] ${muted}`}>{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => { setSiInitialView("calc"); const p = new URLSearchParams(searchParams); p.set("tab","si"); p.set("sub","calc"); router.replace(`/bonus?${p.toString()}`,{scroll:false}); setViewState("si"); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition shadow-sm">
                  <Zap size={14} /> Calculate & Approve
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => { setSiInitialView("report"); const p = new URLSearchParams(searchParams); p.set("tab","si"); p.set("sub","report"); router.replace(`/bonus?${p.toString()}`,{scroll:false}); setViewState("si"); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition border
                    ${dark ? "border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                           : "border-gray-200 text-almet-waterloo hover:bg-amber-50 hover:text-amber-600"}`}>
                  <FileBarChart size={14} /> Reports
                </button>
                {isAdmin && (
                  <button
                    onClick={() => router.push("/bonus/si/settings")}
                    className={`ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border
                      ${dark ? "border-[#2a2a2a] text-gray-500 hover:text-gray-300 hover:border-[#3a3a3a]"
                             : "border-gray-200 text-gray-400 hover:text-amber-600 hover:bg-amber-50"}`}>
                    <Settings size={13} /> Settings
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  // ════════════════════════════════════════════════════
  // ── VIEW: PERFORMANCE BONUS ──────────────────────────
  // ════════════════════════════════════════════════════
  if (view === "performance") return (
    <DashboardLayout>
      <div className="min-h-screen">

        {/* ── Header ── */}
        <div className={`px-6 pt-5 pb-0 rounded-lg border-b ${dark ? "bg-[#0d0d0d] border-[#1c1c1c]" : "bg-white border-gray-200"}`}>
          {/* Breadcrumb + title row */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("overview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition
                  ${dark ? "bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                         : "bg-gray-100 text-almet-waterloo hover:bg-almet-mystic hover:text-almet-sapphire"}`}>
                <ArrowLeft size={12} /> All Bonus Systems
              </button>
              <div className={`w-px h-4 ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${dark ? "bg-almet-sapphire/15" : "bg-blue-50"}`}>
                  <Target size={14} className="text-almet-steel-blue" />
                </div>
                <div>
                  <h1 className={`text-base font-bold ${text}`}>Performance Bonus</h1>
                  <p className={`text-xs ${muted}`}>
                    {selectedYear ? `${selectedYear.year} fiscal year` : ""}
                    {selectedYear?.is_locked ? " · Locked" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Year selector + settings */}
            <div className="flex items-center gap-2">
              <BonusYearSelector
                years={bonusYears}
                selected={selectedYear}
                onChange={setSelectedYear}
                dark={dark}
              />
              {isAdmin && (
                <button
                  onClick={() => router.push("/bonus/settings")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition
                    ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                           : "border-gray-200 text-almet-waterloo hover:bg-almet-mystic hover:text-almet-sapphire"}`}>
                  <Settings size={14} /> Settings
                </button>
              )}
            </div>
          </div>

          {/* ── Pipeline progress bar ── */}
          {records.length > 0 && (
            <div className={`flex items-center gap-3 py-3 border-t ${hr}`}>
              <Pipeline dark={dark} steps={perfPipelineSteps} />
              <span className={`ml-auto text-xs ${muted}`}>{records.length} employees total</span>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="flex gap-0 mt-1">
            {[
              { id: "calc",   label: "Calculate & Approve", icon: Calculator  },
              { id: "report", label: "Reports & Export",    icon: FileBarChart },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = perfView === id;
              return (
                <button key={id} onClick={() => setPerfView(id)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all whitespace-nowrap
                    ${isActive
                      ? dark ? "text-white" : "text-almet-sapphire"
                      : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                  <Icon size={14} /> {label}
                  {isActive && (
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full
                      ${dark ? "bg-almet-steel-blue" : "bg-almet-sapphire"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="py-4 space-y-5">
          {perfView === "calc" && (
            <>
              {isAdmin && selectedYear && (
                <CompanyTargetEvalSection bonusYear={selectedYear} dark={dark} />
              )}
              <BonusCalculationPanel
                records={records}
                loading={loading}
                selectedRecord={selectedRecord}
                onSelectRecord={setSelectedRecord}
                bonusYear={selectedYear}
                dark={dark}
                onUpdate={loadRecords}
              />
            </>
          )}
          {perfView === "report" && (
            <BonusReportSection
              records={records}
              bonusYear={selectedYear}
              dark={dark}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );

  // ════════════════════════════════════════════════════
  // ── VIEW: SALES INCENTIVE ────────────────────────────
  // ════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="min-h-screen">

        {/* ── Header ── */}
        <div className={`px-6 pt-5 rounded-lg pb-0 ${dark ? "bg-[#0d0d0d]" : "bg-white"}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("overview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition
                  ${dark ? "bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                         : "bg-gray-100 text-almet-waterloo hover:bg-almet-mystic hover:text-almet-sapphire"}`}>
                <ArrowLeft size={12} /> All Bonus Systems
              </button>
              <div className={`w-px h-4 ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${dark ? "bg-amber-500/15" : "bg-amber-50"}`}>
                  <TrendingUp size={14} className="text-amber-500" />
                </div>
                <div>
                  <h1 className={`text-base font-bold ${text}`}>Sales Incentive (SI)</h1>
                  <p className={`text-xs ${muted}`}>Quarterly · Sales team only</p>
                </div>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => router.push("/bonus/si/settings")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition
                  ${dark ? "border-amber-500/30 text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/8"
                         : "border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-400"}`}>
                <Settings size={14} /> SI Settings
              </button>
            )}
          </div>
        </div>

        <div>
          <SalesIncentivePanel dark={dark} isAdmin={isAdmin} initialView={siInitialView} />
        </div>
      </div>
    </DashboardLayout>
  );
}
