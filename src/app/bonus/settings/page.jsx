"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { bonusYearService } from "@/services/bonusService";
import BonusYearTab       from "@/components/bonus/settings/BonusYearTab";
import PositionCapsTab    from "@/components/bonus/settings/PositionCapsTab";
import CompanyTargetsTab  from "@/components/bonus/settings/CompanyTab";
import EvalScaleTab       from "@/components/bonus/settings/EvalScaleTab";
import ObjectiveWeightTab from "@/components/bonus/settings/ObjectiveWeightTab";
import CompetencyTab      from "@/components/bonus/settings/CompetencyTab";
import SalarySetupTab     from "@/components/bonus/settings/SalarySetupTab";
import ExchangeRateTab    from "@/components/bonus/settings/ExchangeRateTab";
import BonusYearSelector  from "@/components/bonus/BonusYearSelector";
import { useToast } from "@/components/common/Toast";
import {
  ArrowLeft, Calendar, ShieldCheck, Target,
  TrendingUp, Sliders, Brain, DollarSign, ChevronRight, ArrowLeftRight,
} from "lucide-react";

const TABS = [
  { id: "bonus-year",  label: "Bonus Years",      icon: Calendar,    iconColor: "text-violet-400", iconBg: (d) => d ? "bg-violet-500/10" : "bg-violet-50",  dot: "bg-violet-400",    needsYear: false },
  { id: "position",    label: "Company Targets Percentage ",     icon: ShieldCheck, iconColor: "text-sky-400",    iconBg: (d) => d ? "bg-sky-500/10"    : "bg-sky-50",     dot: "bg-sky-400",           needsYear: false },
  { id: "targets",     label: "Company Targets",   icon: Target,      iconColor: "text-emerald-400",iconBg: (d) => d ? "bg-emerald-500/10": "bg-emerald-50", dot: "bg-emerald-400",  needsYear: true  },
  { id: "eval-scale",  label: "Evaluation Scale",  icon: TrendingUp,  iconColor: "text-amber-400",  iconBg: (d) => d ? "bg-amber-500/10"  : "bg-amber-50",   dot: "bg-amber-400",     needsYear: true  },
  { id: "objective",   label: "Objective Weight",  icon: Sliders,     iconColor: "text-rose-400",   iconBg: (d) => d ? "bg-rose-500/10"   : "bg-rose-50",    dot: "bg-rose-400",     needsYear: true  },
  { id: "competency",  label: "Competency Config", icon: Brain,       iconColor: "text-indigo-400", iconBg: (d) => d ? "bg-indigo-500/10" : "bg-indigo-50",  dot: "bg-indigo-400",       needsYear: true  },
  { id: "salary",      label: "Salary Setup",      icon: DollarSign,     iconColor: "text-teal-400",   iconBg: (d) => d ? "bg-teal-500/10"   : "bg-teal-50",    dot: "bg-teal-400",    needsYear: true  },
  { id: "fx-rates",    label: "Exchange Rates",    icon: ArrowLeftRight, iconColor: "text-orange-400", iconBg: (d) => d ? "bg-orange-500/10" : "bg-orange-50",  dot: "bg-orange-400",  needsYear: true  },
];

export default function BonusSettingsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const router = useRouter();
  const { showError } = useToast();

  const [tab, setTab]                   = useState("bonus-year");
  const [bonusYears, setBonusYears]     = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading]           = useState(true);

  const loadYears = () =>
    bonusYearService.list()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setBonusYears(list);
        if (!selectedYear) {
          const active = list.find((y) => y.is_active) || list[0];
          if (active) setSelectedYear(active);
        }
      })
      .catch(() => showError("Failed to load bonus years."))
      .finally(() => setLoading(false));

  useEffect(() => { loadYears(); }, []);

  const activeTabMeta = TABS.find((t) => t.id === tab);
  const needsYear     = activeTabMeta?.needsYear;

  /* ── Design tokens ── */
  const page    = dark ? "bg-[#07090f]"   : "bg-[#eef1f8]";
  const topbar  = dark ? "bg-[#0b0d15]/95 border-white/[0.06] backdrop-blur-xl" : "bg-white/95 border-gray-200 backdrop-blur-xl";
  const sidebar = dark ? "bg-[#0b0d15] border-white/[0.06]"                     : "bg-white border-gray-200";
  const content = dark ? "bg-[#0e1119] border-white/[0.06]"                     : "bg-white border-gray-200";
  const text    = dark ? "text-white"     : "text-gray-900";
  const sub     = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted   = dark ? "text-gray-600"  : "text-gray-400";

  /* ── Page-level loading ── */
  if (loading) return (
    <DashboardLayout>
      <div className={`min-h-screen flex items-center justify-center ${page}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-almet-sapphire/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-almet-steel-blue animate-spin" />
          </div>
          <p className={`text-xs font-medium ${sub}`}>Loading bonus settings…</p>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className={`min-h-screen rounded-lg flex flex-col `}>

        {/* ── Sticky top bar ── */}
        <header className={`s border-b ${topbar}`}>
          <div className="flex rounded-lg items-center justify-between h-14 px-5">

            {/* Left — back + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/bonus")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${dark ? "text-[#8a9bb8] hover:text-white hover:bg-white/[0.06]" : "text-almet-comet hover:text-almet-cloud-burst hover:bg-almet-mystic"}`}
              >
                <ArrowLeft size={13} />
                Back
              </button>

              <div className={`w-px h-4 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

              <nav className="flex items-center gap-1.5">
                <span className={`text-xs ${muted}`}>Bonus</span>
                <ChevronRight size={11} className={muted} />
                <span className={`text-xs font-semibold ${sub}`}>Settings</span>
                {activeTabMeta && (
                  <>
                    <ChevronRight size={11} className={muted} />
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${activeTabMeta.dot}`} />
                      <span className={`text-xs font-bold ${activeTabMeta.iconColor}`}>
                        {activeTabMeta.label}
                      </span>
                    </div>
                  </>
                )}
              </nav>
            </div>

            {/* Right — year selector */}
            {needsYear && (
              <div className={`flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl border
                ${dark ? "border-white/[0.08] bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
                <Calendar size={13} className="text-almet-steel-blue shrink-0" />
                <span className={`text-xs font-semibold ${sub}`}>Year</span>
                <BonusYearSelector
                  years={bonusYears}
                  selected={selectedYear}
                  onChange={setSelectedYear}
                  dark={dark}
                />
              </div>
            )}
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* ── Sidebar ── */}
          <aside
            className={`w-60 shrink-0 border-r flex flex-col  top-14 self-start ${sidebar}`}
            style={{ height: "calc(100vh - 56px)", overflowY: "auto" }}
          >
            <div className="px-5 pt-5 pb-3">
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${muted}`}>
                Configuration
              </p>
            </div>

            <nav className="flex-1 px-2 space-y-0.5 pb-3">
              {TABS.map((t) => {
                const Icon   = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all duration-150 group
                      ${active
                        ? dark ? "bg-white/[0.05]" : "bg-almet-mystic"
                        : dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
                      ${active
                        ? t.iconBg(dark)
                        : dark ? "bg-white/[0.04] group-hover:bg-white/[0.06]" : "bg-gray-100 group-hover:bg-gray-200"
                      }`}>
                      <Icon size={14} className={active ? t.iconColor : muted} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold leading-snug truncate
                        ${active ? (dark ? "text-white" : "text-almet-cloud-burst") : sub}`}>
                        {t.label}
                      </p>
                 
                    </div>
                    {active && <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />}
                  </button>
                );
              })}
            </nav>

      
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 overflow-hidden">
            {needsYear && !selectedYear ? (
              <div className="flex items-center justify-center min-h-full py-32">
                <div className="text-center max-w-sm px-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5
                    ${dark ? "bg-white/[0.04] border border-white/[0.08]" : "bg-gray-50 border border-gray-200"}`}>
                    <Calendar size={26} className={muted} />
                  </div>
                  <h3 className={`text-base font-bold mb-2 ${text}`}>No Bonus Year Selected</h3>
                  <p className={`text-sm leading-relaxed mb-6 ${sub}`}>
                    Create a bonus year first to configure this section.
                  </p>
                  <button
                    onClick={() => setTab("bonus-year")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold transition-all shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5"
                  >
                    <Calendar size={14} />
                    Create Bonus Year
                  </button>
                </div>
              </div>
            ) : (
              <div className={tab === "salary" ? "h-full" : "p-5"}>
                <div className={tab === "salary" ? "h-full" : `rounded-2xl border ${content} p-6`}>
                  {tab === "bonus-year"  && <BonusYearTab dark={dark} years={bonusYears} onRefresh={loadYears} />}
                  {tab === "position"    && <PositionCapsTab dark={dark} />}
                  {tab === "targets"     && <CompanyTargetsTab dark={dark} bonusYear={selectedYear} />}
                  {tab === "eval-scale"  && <EvalScaleTab dark={dark} bonusYear={selectedYear} />}
                  {tab === "objective"   && <ObjectiveWeightTab dark={dark} bonusYear={selectedYear} />}
                  {tab === "competency"  && <CompetencyTab dark={dark} bonusYear={selectedYear} />}
                  {tab === "salary"      && <SalarySetupTab dark={dark} bonusYear={selectedYear} />}
                  {tab === "fx-rates"    && <ExchangeRateTab dark={dark} bonusYear={selectedYear} />}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}