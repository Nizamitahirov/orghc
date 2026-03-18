"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import BonusYearSelector from "@/components/bonus/BonusYearSelector";
import BonusCalculationPanel from "@/components/bonus/BonusCalculationPanel";
import BonusReportSection from "@/components/bonus/BonusReportSection";
import CompanyTargetEvalSection from "@/components/bonus/CompanyTargetEvalSection";
import { bonusYearService, bonusRecordService, downloadBlob } from "@/services/bonusService";
import { Settings, BarChart2, Calculator, Lock, Wallet, Users, CheckCircle, TrendingUp } from "lucide-react";

const TABS = [
  { id: "bonus",  label: "Calculation", icon: Calculator },
  { id: "report", label: "Report",      icon: BarChart2  },
];

export default function BonusMainPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const router = useRouter();

  const [tab, setTab]                       = useState("bonus");
  const [bonusYears, setBonusYears]         = useState([]);
  const [selectedYear, setSelectedYear]     = useState(null);
  const [records, setRecords]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    bonusYearService.list().then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setBonusYears(list);
      const active = list.find((y) => y.is_active) || list[0];
      if (active) setSelectedYear(active);
    });
  }, []);

  const loadRecords = useCallback(async () => {
    if (!selectedYear) return;
    setLoading(true);
    try {
      const { data } = await bonusRecordService.list(selectedYear.id);
      setRecords(Array.isArray(data) ? data : (data.results ?? []));
    } catch { setRecords([]); }
    finally  { setLoading(false); }
  }, [selectedYear]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const stats = {
    total:      records.length,
    calculated: records.filter((r) => r.status !== "DRAFT").length,
    approved:   records.filter((r) => r.status === "APPROVED").length,
    totalBonus: records.reduce((s, r) => s + parseFloat(r.total_bonus || 0), 0),
  };

  const kpiCards = [
    {
      label: "Total Employees",
      value: stats.total,
      icon: Users,
      iconBg: dark ? "bg-[#1a2744]" : "bg-almet-mystic",
      iconColor: "text-almet-steel-blue",
      accent: "text-almet-steel-blue",
    },
    {
      label: "Calculated",
      value: stats.calculated,
      icon: Calculator,
      iconBg: dark ? "bg-amber-500/10" : "bg-amber-50",
      iconColor: "text-amber-500",
      accent: "text-amber-500",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      iconBg: dark ? "bg-emerald-500/10" : "bg-emerald-50",
      iconColor: "text-emerald-500",
      accent: "text-emerald-500",
    }
  ];

  // ── Tab class ──
  const tabCls = (id) => {
    const base = "relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-150 whitespace-nowrap";
    if (tab === id) {
      return `${base} ${dark ? "text-white" : "text-almet-sapphire"}`;
    }
    return `${base} ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`;
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen `}>

        {/* ── Page Header ── */}
        <div className={`px-6 pt-6 rounded-lg pb-0 border-b ${dark ? "bg-[#0d0d0d] border-[#1c1c1c]" : "bg-white border-gray-200"}`}>

          {/* Title row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${dark ? "bg-almet-sapphire/20" : "bg-almet-mystic"}`}>
                <Wallet size={18} className="text-almet-steel-blue" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className={`text-lg font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
                    Bonus Management
                  </h1>
                  {selectedYear?.is_locked && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
                  {selectedYear ? `${selectedYear.year} fiscal year` : "Select a year to begin"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BonusYearSelector
                years={bonusYears}
                selected={selectedYear}
                onChange={setSelectedYear}
                dark={dark}
              />
              <button
                onClick={() => router.push("/bonus/settings")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition
                  ${dark
                    ? "border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                    : "border-gray-200 text-almet-waterloo hover:bg-almet-mystic hover:text-almet-sapphire hover:border-almet-bali-hai"}`}
              >
                <Settings size={14} /> Settings
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {kpiCards.map(({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                  ${dark
                    ? "bg-[#111] border-[#1e1e1e]"
                    : "bg-white border-gray-100 shadow-sm"}`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
                  <Icon size={14} className={iconColor} />
                </div>
                <div className="min-w-0 flex justify-between items-center gap-4">
                  <p className={`text-xs truncate ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>{label}</p>
                  <p className={`text-base font-bold tabular-nums mt-0.5 ${accent}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex gap-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={tabCls(id)}>
                <Icon size={14} /> {label}
                {/* Active indicator */}
                {tab === id && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full
                      ${dark ? "bg-almet-steel-blue" : "bg-almet-sapphire"}`}
                  />
                )}
                {/* Employee badge on bonus tab */}
                {id === "bonus" && selectedRecord && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-almet-sapphire text-white leading-none">
                    {selectedRecord.employee_name?.split(" ")[0]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="py-4 space-y-5">
          {tab === "bonus" && (
            <>
              {selectedYear && (
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

          {tab === "report" && (
            <BonusReportSection
              records={records}
              bonusYear={selectedYear}
              dark={dark}
              onExcelExport={async () => {
                if (!selectedYear) return;
                const { data } = await bonusRecordService.exportExcel(selectedYear.id);
                downloadBlob(data, `bonus_${selectedYear.year}.xlsx`);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}