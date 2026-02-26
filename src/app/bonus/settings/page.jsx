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
import BonusYearSelector  from "@/components/bonus/BonusYearSelector";
import {
  ArrowLeft, Settings, Calendar, ShieldCheck,
  Target, TrendingUp, Sliders, Brain, DollarSign,
} from "lucide-react";

const TABS = [
  { id: "bonus-year",  label: "Bonus Years",      icon: Calendar,     desc: "Create & manage bonus years" },
  { id: "position",    label: "Position Caps",     icon: ShieldCheck,  desc: "Max weight per position group" },
  { id: "targets",     label: "Company Targets",   icon: Target,       desc: "CRUD + weights by position" },
  { id: "eval-scale",  label: "Evaluation Scale",  icon: TrendingUp,   desc: "Rating → % of yearly salary" },
  { id: "objective",   label: "Objective Weight",  icon: Sliders,      desc: "Adjusted weight per position" },
  { id: "competency",  label: "Competency Config", icon: Brain,        desc: "Group weights & on/off" },
  { id: "salary",      label: "Salary Setup",      icon: DollarSign,   desc: "Employee salary & worked months" },
];

const YEAR_TABS = new Set(["targets", "eval-scale", "objective", "competency", "salary"]);

export default function BonusSettingsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const router = useRouter();

  const [tab, setTab]                   = useState("bonus-year");
  const [bonusYears, setBonusYears]     = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading]           = useState(true);

  const bg       = dark ? "bg-[#080b14]"  : "bg-[#f0f3f8]";
  const sidebar  = dark ? "bg-[#0d1120] border-[#1e2640]" : "bg-white border-gray-200";
  const topbar   = dark ? "bg-[#0d1120] border-[#1e2640]" : "bg-white border-gray-200";
  const content  = dark ? "bg-[#0d1120] border-[#1e2640]" : "bg-white border-gray-200";
  const text     = dark ? "text-white"    : "text-gray-900";
  const sub      = dark ? "text-[#90a0b9]": "text-almet-comet";

  const loadYears = () =>
    bonusYearService.list().then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setBonusYears(list);
      if (!selectedYear) {
        const active = list.find((y) => y.is_active) || list[0];
        if (active) setSelectedYear(active);
      }
    }).finally(() => setLoading(false));

  useEffect(() => { loadYears(); }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const needsYear = YEAR_TABS.has(tab);
  const activeTab = TABS.find(t => t.id === tab);

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bg}`}>
        {/* ── Top bar ── */}
        <div className={`border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 ${topbar}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/bonus")}
              className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-[#1a2236] text-[#90a0b9] hover:text-white" : "hover:bg-almet-mystic text-almet-comet hover:text-almet-cloud-burst"}`}
            >
              <ArrowLeft size={16} />
            </button>
            <div className={`w-px h-5 ${dark ? "bg-[#1e2640]" : "bg-gray-200"}`} />
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${dark ? "bg-almet-sapphire/20" : "bg-almet-mystic"}`}>
                <Settings size={15} className="text-almet-steel-blue" />
              </div>
              <div>
                <h1 className={`text-sm font-semibold leading-none ${text}`}>Bonus Settings</h1>
                {activeTab && (
                  <p className={`text-xs mt-0.5 ${sub}`}>{activeTab.label}</p>
                )}
              </div>
            </div>
          </div>

          {needsYear && (
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-medium ${sub}`}>Year:</span>
              <BonusYearSelector
                years={bonusYears}
                selected={selectedYear}
                onChange={setSelectedYear}
                dark={dark}
              />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex" style={{ minHeight: "calc(100vh - 57px)" }}>

          {/* ── Sidebar ── */}
          <aside className={`w-52 shrink-0 border-r flex flex-col ${sidebar}`}>
            <div className="p-3 flex-1">
              <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 ${sub}`}>
                Configuration
              </p>
              <nav className="space-y-0.5">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left group
                        ${active
                          ? dark
                            ? "bg-almet-sapphire/20 text-white"
                            : "bg-almet-mystic text-almet-cloud-burst"
                          : dark
                            ? "text-[#90a0b9] hover:bg-[#131929] hover:text-white"
                            : "text-almet-comet hover:bg-[#f5f7fb] hover:text-almet-cloud-burst"
                        }`}
                    >
                      <div className={`p-1 rounded-md shrink-0 transition-colors
                        ${active
                          ? dark ? "bg-almet-steel-blue/30" : "bg-almet-sapphire/15"
                          : dark ? "bg-[#1a2236] group-hover:bg-[#1e2a40]" : "bg-gray-100 group-hover:bg-almet-mystic"
                        }`}>
                        <Icon size={13} className={active ? "text-almet-steel-blue" : ""} />
                      </div>
                      <span className="text-xs font-medium leading-tight">{t.label}</span>
                      {active && (
                        <div className={`ml-auto w-1 h-1 rounded-full ${dark ? "bg-almet-steel-blue" : "bg-almet-sapphire"}`} />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar footer hint */}
            <div className={`p-3 border-t ${dark ? "border-[#1e2640]" : "border-gray-100"}`}>
              <p className={`text-[10px] leading-relaxed ${sub}`}>
                Configure bonus calculation parameters for each year.
              </p>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 p-5">
            {needsYear && !selectedYear ? (
              <div className={`rounded-xl border p-16 text-center ${content}`}>
                <div className={`inline-flex p-3 rounded-full mb-3 ${dark ? "bg-[#1a2236]" : "bg-almet-mystic"}`}>
                  <Calendar size={20} className="text-almet-steel-blue" />
                </div>
                <p className={`text-sm font-medium mb-1 ${text}`}>No bonus year selected</p>
                <p className={`text-xs mb-4 ${sub}`}>Create a bonus year to configure this section.</p>
                <button
                  onClick={() => setTab("bonus-year")}
                  className="px-4 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium transition"
                >
                  Go to Bonus Years
                </button>
              </div>
            ) : (
              <div className={`rounded-xl border ${content} ${tab === "salary" ? "overflow-hidden" : "p-6"}`}>
                {tab === "bonus-year"  && <BonusYearTab dark={dark} years={bonusYears} onRefresh={loadYears} />}
                {tab === "position"    && <PositionCapsTab dark={dark} />}
                {tab === "targets"     && <CompanyTargetsTab dark={dark} bonusYear={selectedYear} />}
                {tab === "eval-scale"  && <EvalScaleTab dark={dark} bonusYear={selectedYear} />}
                {tab === "objective"   && <ObjectiveWeightTab dark={dark} bonusYear={selectedYear} />}
                {tab === "competency"  && <CompetencyTab dark={dark} bonusYear={selectedYear} />}
                {tab === "salary"      && <SalarySetupTab dark={dark} bonusYear={selectedYear} />}
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}