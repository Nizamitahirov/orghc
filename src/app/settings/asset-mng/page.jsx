// src/app/asset-management/page.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assetService } from "@/services/assetService";
import {
  Package, Users, CheckCircle, Wrench,
  Archive, Inbox, ChevronRight, Loader, UserMinus,
  AlertTriangle,
} from "lucide-react";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, colorClass, bgClass }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
    <div className={`${bgClass} rounded-lg p-2 flex items-center justify-center shrink-0`}>
      <Icon size={16} className={colorClass} />
    </div>
    <div>
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-none mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{value ?? "—"}</p>
    </div>
  </div>
);

// ── Quick Link ────────────────────────────────────────────────────────────────
const QuickLink = ({ icon: Icon, label, sub, href, colorClass, bgClass }) => (
  <Link href={href} className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3.5 py-3 flex items-center justify-between gap-3 hover:shadow-sm hover:border-almet-steel-blue/30 dark:hover:border-almet-steel-blue/30 transition-all duration-200">
    <div className="flex items-center gap-2.5">
      <div className={`${bgClass} rounded-lg p-2 flex items-center justify-center shrink-0`}>
        <Icon size={14} className={colorClass} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
    <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 group-hover:text-almet-steel-blue transition-colors shrink-0" />
  </Link>
);

// ═════════════════════════════════════════════════════════════════════════════
export default function AssetDashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const statsRes = await assetService.statistics();
      setStats(statsRes);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total    = stats?.total ?? 0;
  const inUse    = stats?.by_status?.IN_USE?.count    ?? 0;
  const inStock  = stats?.by_status?.IN_STOCK?.count  ?? 0;
  const inRepair = stats?.by_status?.IN_REPAIR?.count ?? 0;
  const archived = stats?.by_status?.ARCHIVED?.count  ?? 0;

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader size={24} className="animate-spin text-almet-steel-blue" />
        <p className="text-xs text-gray-400">Loading…</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Asset Management</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Overview of all company assets</p>
          </div>
          <div className="flex items-center gap-2">
           
            <Link href="assignments">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-xs font-semibold transition-colors shadow-sm">
                <Users size={13} /> Assign Asset
              </button>
            </Link>
            <Link href="offboarding">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <UserMinus size={13} /> Offboarding
              </button>
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-xs">
            <AlertTriangle size={14} className="shrink-0" /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Package}     label="Total"      value={total}    colorClass="text-almet-cloud-burst dark:text-almet-steel-blue" bgClass="bg-almet-mystic dark:bg-almet-cloud-burst/20" />
          <StatCard icon={CheckCircle} label="In Use"     value={inUse}    colorClass="text-emerald-600 dark:text-emerald-400"           bgClass="bg-emerald-50 dark:bg-emerald-900/20" />
          <StatCard icon={Inbox}       label="In Stock"   value={inStock}  colorClass="text-gray-500 dark:text-gray-400"                 bgClass="bg-gray-100 dark:bg-gray-800" />
          <StatCard icon={Wrench}      label="In Repair"  value={inRepair} colorClass="text-blue-600 dark:text-blue-400"                 bgClass="bg-blue-50 dark:bg-blue-900/20" />
          <StatCard icon={Archive}     label="Archived"   value={archived} colorClass="text-orange-600 dark:text-orange-400"             bgClass="bg-orange-50 dark:bg-orange-900/20" />
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Quick Access</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickLink label="Assignments"  sub="Track & manage assignments"    href="assignments"                          icon={Users}     colorClass="text-almet-cloud-burst dark:text-almet-steel-blue" bgClass="bg-almet-mystic dark:bg-almet-cloud-burst/20" />
            <QuickLink label="Offboarding"  sub="Employee exit asset workflow"  href="offboarding"                          icon={UserMinus} colorClass="text-red-600 dark:text-red-400"                   bgClass="bg-red-50 dark:bg-red-900/20" />
            <QuickLink label="Settings"     sub="Categories & batches"          href="settings"            icon={Archive}   colorClass="text-gray-500 dark:text-gray-400"                 bgClass="bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}