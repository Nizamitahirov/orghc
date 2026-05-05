"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { siConfigService } from "@/services/siService";
import { useToast } from "@/components/common/Toast";
import SIConfigTab           from "@/components/si/settings/SIConfigTab";
import SIPositionsTab        from "@/components/si/settings/SIPositionsTab";
import SICompanyKPITab       from "@/components/si/settings/SICompanyKPITab";
import SICompanyScaleTab     from "@/components/si/settings/SICompanyScaleTab";
import SIIndividualKPITab    from "@/components/si/settings/SIIndividualKPITab";
import SIIndividualScaleTab  from "@/components/si/settings/SIIndividualScaleTab";
import SIPeriodsTab          from "@/components/si/settings/SIPeriodsTab";
import SISalarySetupTab      from "@/components/si/settings/SISalarySetupTab";
import {
  ArrowLeft, Settings, Users, Target,
  BarChart2, Calendar, ChevronRight, TrendingUp, Layers, List, DollarSign,
} from "lucide-react";

const TABS = [
  { id: "config",   label: "Scheme Config",        icon: Settings,    dot: "bg-violet-400", color: "text-violet-400",  needsConfig: false },
  { id: "positions",label: "Eligible Positions",   icon: Users,       dot: "bg-sky-400",    color: "text-sky-400",     needsConfig: true  },
  { id: "salary",   label: "Salary Setup",         icon: DollarSign,  dot: "bg-teal-400",   color: "text-teal-400",    needsConfig: true  },
  { id: "ckpi",     label: "Company KPIs",         icon: Target,      dot: "bg-emerald-400",color: "text-emerald-400", needsConfig: true  },
  { id: "cscale",   label: "Company KPI Scale",    icon: BarChart2,   dot: "bg-cyan-400",   color: "text-cyan-400",    needsConfig: true  },
  { id: "ikpi",     label: "Individual KPIs",      icon: TrendingUp,  dot: "bg-amber-400",  color: "text-amber-400",   needsConfig: true  },
  { id: "iscale",   label: "Individual KPI Bands", icon: Layers,      dot: "bg-orange-400", color: "text-orange-400",  needsConfig: true  },
  { id: "periods",  label: "Periods",              icon: Calendar,    dot: "bg-rose-400",   color: "text-rose-400",    needsConfig: true  },
];

export default function SISettingsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const router = useRouter();
  const { showError } = useToast();

  const [tab,      setTab]     = useState("config");
  const [configs,  setConfigs] = useState([]);
  const [selConfig,setSel]     = useState(null);
  const [loading,  setLoading] = useState(true);

  const loadConfigs = () =>
    siConfigService.list()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setConfigs(list);
        if (!selConfig && list.length) setSel(list[0]);
      })
      .catch(() => showError("Failed to load SI configs"))
      .finally(() => setLoading(false));

  useEffect(() => { loadConfigs(); }, []);

  const topbar  = dark ? "bg-[#0b0d15]/95 border-white/[0.06] backdrop-blur-xl" : "bg-white/95 border-gray-200 backdrop-blur-xl";
  const sidebar = dark ? "bg-[#0b0d15] border-white/[0.06]"                     : "bg-white border-gray-200";
  const text    = dark ? "text-white"     : "text-gray-900";
  const sub     = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted   = dark ? "text-gray-600"  : "text-gray-400";

  const active = TABS.find(t => t.id === tab);

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-lg flex flex-col">

        {/* ── Top bar ── */}
        <header className={`sticky top-0 z-20 border-b ${topbar}`}>
          <div className="flex items-center justify-between h-14 px-5">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/bonus")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition
                  ${dark ? "text-[#8a9bb8] hover:text-white hover:bg-white/[0.06]"
                         : "text-almet-comet hover:text-almet-cloud-burst hover:bg-almet-mystic"}`}>
                <ArrowLeft size={13} /> Back
              </button>
              <div className={`w-px h-4 ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              <nav className="flex items-center gap-1.5">
                <span className={`text-xs ${muted}`}>Bonus</span>
                <ChevronRight size={11} className={muted} />
                <span className={`text-xs font-semibold ${sub}`}>Sales Incentive</span>
                <ChevronRight size={11} className={muted} />
                <div className="flex items-center gap-1.5">
                  {active && <div className={`w-1.5 h-1.5 rounded-full ${active.dot}`} />}
                  <span className={`text-xs font-bold ${active?.color}`}>{active?.label}</span>
                </div>
              </nav>
            </div>

            {/* Config selector */}
            {configs.length > 1 && (
              <select value={selConfig?.id ?? ""}
                onChange={e => setSel(configs.find(c => c.id === Number(e.target.value)))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none transition
                  ${dark ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}>
                {configs.map(c => <option key={c.id} value={c.id}>{c.business_function_name}</option>)}
              </select>
            )}
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* Sidebar */}
          <aside className={`w-56 shrink-0 border-r flex flex-col ${sidebar}`}
            style={{ height: "calc(100vh - 56px)", overflowY: "auto" }}>
            <div className="px-4 pt-5 pb-2">
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${muted}`}>Configuration</p>
            </div>
            <nav className="flex-1 px-2 space-y-0.5 pb-3">
              {TABS.map(t => {
                const Icon   = t.icon;
                const isAct  = tab === t.id;
                const locked = t.needsConfig && !selConfig;

                /* Group dividers */
                const dividerBefore = t.id === "salary" || t.id === "cscale" || t.id === "iscale" || t.id === "periods";

                return (
                  <div key={t.id}>
                    {dividerBefore && (
                      <div className={`mx-2 my-1.5 border-t ${dark ? "border-white/[0.05]" : "border-gray-100"}`} />
                    )}
                    <button onClick={() => !locked && setTab(t.id)} disabled={locked}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all
                        ${isAct
                          ? dark ? "bg-white/[0.05]" : "bg-almet-mystic"
                          : dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}
                        ${locked ? "opacity-30 cursor-not-allowed" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${isAct
                          ? dark ? "bg-white/[0.08]" : "bg-white border border-gray-200"
                          : dark ? "bg-white/[0.03]" : "bg-gray-100"}`}>
                        <Icon size={14} className={isAct ? t.color : muted} />
                      </div>
                      <span className={`text-[13px] font-semibold truncate
                        ${isAct ? (dark ? "text-white" : "text-almet-cloud-burst") : sub}`}>
                        {t.label}
                      </span>
                      {isAct && <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />}
                    </button>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 p-5 overflow-auto">
            <div className={`rounded-2xl border p-6 ${dark ? "bg-[#0e1119] border-white/[0.06]" : "bg-white border-gray-200"}`}>
              {tab === "config"    && (
                <SIConfigTab dark={dark} configs={configs} selConfig={selConfig}
                  onRefresh={loadConfigs} onSelect={setSel} />
              )}
              {tab === "positions" && selConfig && <SIPositionsTab     dark={dark} config={selConfig} />}
              {tab === "salary"    && selConfig && <SISalarySetupTab   dark={dark} config={selConfig} />}
              {tab === "ckpi"      && selConfig && <SICompanyKPITab    dark={dark} config={selConfig} />}
              {tab === "cscale"    && selConfig && <SICompanyScaleTab  dark={dark} config={selConfig} />}
              {tab === "ikpi"      && selConfig && <SIIndividualKPITab dark={dark} config={selConfig} />}
              {tab === "iscale"    && selConfig && <SIIndividualScaleTab dark={dark} config={selConfig} />}
              {tab === "periods"   && selConfig && (
                <SIPeriodsTab dark={dark} config={selConfig}
                  onOpenCalc={() => router.push("/bonus")} />
              )}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}