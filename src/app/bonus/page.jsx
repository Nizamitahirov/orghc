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
import { Settings, BarChart2, Calculator, Lock } from "lucide-react";

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

  const bg    = dark ? "bg-[#080808]"              : "bg-gray-50";
  const topBg = dark ? "bg-[#0d0d0d] border-[#1c1c1c]" : "bg-white border-gray-200";
  const text  = dark ? "text-white"               : "text-gray-900";
  const sub   = dark ? "text-gray-500"             : "text-gray-500";

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

  const tabCls = (id) => {
    const base = "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap";
    return tab === id
      ? `${base} ${dark ? "border-almet-steel-blue text-white" : "border-almet-sapphire text-almet-sapphire"}`
      : `${base} border-transparent ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`;
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bg}`}>

        {/* Top bar */}
        <div className={`border-b px-6 pt-5 pb-0 ${topBg}`}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-xl font-bold ${text}`}>Bonus Management</h1>
                {selectedYear?.is_locked && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                    <Lock size={10} /> Locked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-5 flex-wrap">
                {[
                  { label: "Employees",  val: stats.total,                          color: "text-sky-400"     },
                  { label: "Calculated", val: stats.calculated,                     color: "text-amber-400"   },
                  { label: "Approved",   val: stats.approved,                       color: "text-emerald-400" },
                  { label: "Bonus Pool", val: stats.totalBonus.toLocaleString("en", { maximumFractionDigits: 0 }) + " ₼", color: "text-violet-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <span className={`text-sm font-bold tabular-nums ${color}`}>{val}</span>
                    <span className={`text-xs ${sub}`}>{label}</span>
                  </div>
                ))}
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition
                  ${dark
                    ? "border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                <Settings size={14} /> Settings
              </button>
            </div>
          </div>

          <div className="flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={tabCls(id)}>
                <Icon size={13} /> {label}
                {id === "bonus" && selectedRecord && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-almet-sapphire text-white leading-none">
                    {selectedRecord.employee_name?.split(" ")[0]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
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