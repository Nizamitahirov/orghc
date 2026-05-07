"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Network, UsersRound, BarChart2, Users, Building2, TrendingUp, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";

export default function HomePage() {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({ total: 0, active: 0, departments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          fetch("/api/employees/statistics"),
          fetch("/api/departments"),
        ]);
        const empData = await empRes.json();
        const deptData = await deptRes.json();
        setStats({
          total: empData.total || 0,
          active: empData.active || 0,
          departments: deptData.count || 0,
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-white/60" : "text-gray-500";
  const cardBg = darkMode ? "bg-almet-cloud-burst/60 border-white/10" : "bg-white border-gray-200";

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">

        {/* Welcome header */}
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Welcome to the HR Demo</h1>
          <p className={`mt-2 text-base ${textSecondary}`}>
            Headcount &amp; Org Chart — standalone demo with mock data.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Total Employees", value: loading ? "..." : stats.total, color: "text-blue-500" },
            { icon: TrendingUp, label: "Active Employees", value: loading ? "..." : stats.active, color: "text-emerald-500" },
            { icon: Building2, label: "Departments", value: loading ? "..." : stats.departments, color: "text-purple-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`rounded-xl border p-5 flex items-center gap-4 ${cardBg}`}>
              <div className={`p-3 rounded-lg ${darkMode ? "bg-white/10" : "bg-gray-50"}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${textPrimary}`}>{value}</p>
                <p className={`text-xs ${textSecondary}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Headcount card */}
            <div className={`rounded-2xl border p-6 ${cardBg} group hover:shadow-lg transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${darkMode ? "bg-blue-500/20" : "bg-blue-50"}`}>
                  <BarChart2 className="w-7 h-7 text-blue-500" />
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Headcount</h3>
              <p className={`text-sm mb-5 ${textSecondary}`}>
                Analyse your workforce — filter by department, business function, status, and more.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/headcount"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <span>Headcount Overview</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/structure/headcount-table"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    darkMode
                      ? "border-white/15 text-white/70 hover:bg-white/5"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UsersRound className="w-4 h-4" />
                    Headcount Table
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Org Chart card */}
            <div className={`rounded-2xl border p-6 ${cardBg} group hover:shadow-lg transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${darkMode ? "bg-purple-500/20" : "bg-purple-50"}`}>
                  <Network className="w-7 h-7 text-purple-500" />
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Org Chart</h3>
              <p className={`text-sm mb-5 ${textSecondary}`}>
                Visualise your organisational hierarchy — explore reporting lines, teams and departments.
              </p>
              <Link
                href="/structure/org-structure"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                <span>View Org Structure</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
