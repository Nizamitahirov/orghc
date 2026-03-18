// src/components/assets/AssetAssignmentHistory.jsx

"use client";
import { useState, useEffect } from "react";
import { assetService } from "@/services/assetService";
import {
  Clock, CheckCircle, User, ArrowRightLeft,
  Loader, ChevronDown, ChevronUp, Package,
} from "lucide-react";

// ── Condition Badge ───────────────────────────────────────────────────────────
const CONDITION_COLOR = {
  EXCELLENT: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  GOOD:      "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FAIR:      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  POOR:      "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  DAMAGED:   "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ConditionBadge = ({ condition }) => {
  if (!condition) return <span className="text-xs text-gray-300 dark:text-gray-600">—</span>;
  const cls = CONDITION_COLOR[condition] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${cls}`}>
      {condition}
    </span>
  );
};

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 pt-0.5">{label}</span>
    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium text-right">{children || "—"}</span>
  </div>
);

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, accent, children }) => (
  <div className={`rounded-xl p-3.5 space-y-0.5 ${accent}`}>
    <div className="flex items-center gap-1.5 mb-2">
      <Icon size={11} className="opacity-60" />
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{title}</p>
    </div>
    {children}
  </div>
);

// ── Assignment Card ───────────────────────────────────────────────────────────
const AssignmentCard = ({ assignment, index }) => {
  const [expanded, setExpanded] = useState(index === 0);

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;

  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }) : null;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all
      ${assignment.is_active
        ? "border-emerald-200 dark:border-emerald-800"
        : "border-gray-100 dark:border-gray-800"}`}>

      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${assignment.is_active
            ? "bg-emerald-50 dark:bg-emerald-900/30"
            : "bg-gray-100 dark:bg-gray-800"}`}>
          <User size={15} className={assignment.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"} />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
              {assignment.employee.full_name}
            </p>
            {assignment.is_active && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {assignment.employee.employee_id}
            {assignment.employee.department ? ` · ${assignment.employee.department}` : ""}
          </p>
        </div>

        {/* Date range + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {fmtDate(assignment.check_out_date)}
              {assignment.checked_in_at
                ? <span className="text-gray-400"> → {fmtDate(assignment.checked_in_at)}</span>
                : <span className="text-amber-500"> → now</span>}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {assignment.duration_days} day{assignment.duration_days !== 1 ? "s" : ""}
            </p>
          </div>
          {expanded
            ? <ChevronUp size={15} className="text-gray-400" />
            : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-3">

          {/* Check-out */}
          <SectionCard
            icon={ArrowRightLeft}
            title="Check-out"
            accent="bg-gray-50 dark:bg-gray-800/50"
          >
            <InfoRow label="Date">{fmtDate(assignment.check_out_date)}</InfoRow>
            <InfoRow label="Assigned by">{assignment.assigned_by}</InfoRow>
            <InfoRow label="Condition"><ConditionBadge condition={assignment.condition_out} /></InfoRow>
            <InfoRow label="Acceptance">
              {assignment.require_acceptance
                ? assignment.accepted_at
                  ? `Accepted ${fmtDateTime(assignment.accepted_at)}`
                  : "Pending acceptance"
                : "Auto-accepted"}
            </InfoRow>
            {assignment.check_out_notes && (
              <InfoRow label="Notes">{assignment.check_out_notes}</InfoRow>
            )}
          </SectionCard>

          {/* Check-in */}
          {assignment.checked_in_at ? (
            <SectionCard
              icon={CheckCircle}
              title="Check-in"
              accent="bg-gray-50 dark:bg-gray-800/50"
            >
              <InfoRow label="Date">{fmtDateTime(assignment.checked_in_at)}</InfoRow>
              <InfoRow label="Checked in by">{assignment.checked_in_by}</InfoRow>
              <InfoRow label="Condition"><ConditionBadge condition={assignment.condition_in} /></InfoRow>
              {assignment.check_in_notes && (
                <InfoRow label="Notes">{assignment.check_in_notes}</InfoRow>
              )}
            </SectionCard>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-3 bg-amber-50/70 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
              <Clock size={13} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Still in use · {assignment.duration_days} day{assignment.duration_days !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AssetAssignmentHistory({ assetId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    assetService.assignmentHistory(assetId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assetId]);

  if (loading) return (
    <div className="flex items-center justify-center h-28 gap-2 text-gray-400">
      <Loader size={17} className="animate-spin text-almet-steel-blue" />
      <p className="text-sm">Loading history…</p>
    </div>
  );

  if (!data || data.assignments.length === 0) return (
    <div className="flex flex-col items-center justify-center h-28 text-gray-400 gap-2">
      <Package size={22} className="opacity-20" />
      <p className="text-sm">No assignment history yet.</p>
    </div>
  );

  const activeCount = data.assignments.filter(a => a.is_active).length;

  return (
    <div className="space-y-3">
      {/* Stats pill */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          {data.total} assignment{data.total !== 1 ? "s" : ""}
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className={activeCount > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-400"}>
          {activeCount > 0 ? "1 currently active" : "None active"}
        </span>
      </div>

      {data.assignments.map((a, i) => (
        <AssignmentCard key={a.id} assignment={a} index={i} />
      ))}
    </div>
  );
}