// src/app/asset-management/offboarding/page.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { offboardingService, employeeService } from "@/services/assetService";
import { useToast } from "@/components/common/Toast";
import Pagination from "@/components/common/Pagination";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import {
  UserMinus, Plus, Loader, Search,
  Eye, X, Package, AlertCircle,
  CalendarDays, ArrowRightLeft, ArrowLeft,
} from "lucide-react";

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  PENDING:     { label: "Pending",     cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800" },
  COMPLETED:   { label: "Completed",   cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800" },
  CANCELLED:   { label: "Cancelled",   cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
};

// ── Shared ────────────────────────────────────────────────────────────────────
const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400";

const ErrBox = ({ msg }) => msg ? (
  <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
    <AlertCircle size={15} className="mt-0.5 shrink-0" /> {msg}
  </div>
) : null;

const TYPE_STYLE = {
  RETURN:   "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  TRANSFER: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  MIXED:    "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

// ── Type options ──────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  {
    value: "RETURN",
    icon:  "🖥️",
    label: "Return to IT",
    desc:  "Employee hands all assets back to IT department.",
  },
  {
    value: "TRANSFER",
    icon:  "🔄",
    label: "Transfer",
    desc:  "All assets go to other employees — you'll pick who gets what.",
  },
  {
    value: "MIXED",
    icon:  "📦",
    label: "Mixed",
    desc:  "Some assets returned, some transferred — decide per asset.",
  },
];

// ── Initiate Modal ────────────────────────────────────────────────────────────
const InitiateModal = ({ employees, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employee_id: "", last_working_day: "", offboarding_type: "RETURN", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const employeeOptions = employees.map(e => ({
    value: String(e.id),
    label: `${e.name} (${e.employee_id})`,
  }));

  const submit = async () => {
    if (!form.employee_id)      return setError("Please select an employee.");
    if (!form.last_working_day) return setError("Last working day is required.");
    setLoading(true); setError("");
    try {
      await offboardingService.initiate({ ...form, employee_id: parseInt(form.employee_id) });
      onSuccess("Offboarding initiated successfully.");
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : d?.error ?? d?.message ?? "Failed to initiate offboarding.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Start Offboarding</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Begin the asset handover process for a departing employee.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <ErrBox msg={error} />

          {/* Step 1 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              1 · Which employee is leaving? <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              options={employeeOptions}
              value={form.employee_id}
              onChange={v => set("employee_id", v ?? "")}
              placeholder="Select employee…"
              searchPlaceholder="Search employees…"
              allowUncheck={false}
            />
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              2 · Last working day <span className="text-red-500">*</span>
            </label>
            <input type="date" className={inputCls} value={form.last_working_day}
              onChange={e => set("last_working_day", e.target.value)} />
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              3 · What happens to the assets?
            </label>
            <div className="space-y-2">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => set("offboarding_type", t.value)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all
                    ${form.offboarding_type === t.value
                      ? "border-almet-cloud-burst bg-almet-mystic dark:bg-almet-cloud-burst/10 dark:border-almet-steel-blue"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}>
                  <span className="text-xl shrink-0">{t.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${form.offboarding_type === t.value ? "text-almet-cloud-burst dark:text-almet-steel-blue" : "text-gray-800 dark:text-gray-200"}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                    ${form.offboarding_type === t.value
                      ? "border-almet-cloud-burst dark:border-almet-steel-blue bg-almet-cloud-burst dark:bg-almet-steel-blue"
                      : "border-gray-300 dark:border-gray-600"
                    }`}>
                    {form.offboarding_type === t.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Notes (optional)
            </label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Any additional context…" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm shadow-almet-cloud-burst/20">
            {loading && <Loader size={14} className="animate-spin" />}
            Start Offboarding
          </button>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const PAGE_SIZE = 12;

const STATUS_TABS = [
  { value: "all",         label: "All" },
  { value: "PENDING",     label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED",   label: "Completed" },
];

export default function OffboardingPage() {
  const router = useRouter();
  const { showSuccess } = useToast();

  const [offboardings, setOffboardings] = useState([]);
  const [employees, setEmployees]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [totalCount, setTotalCount]     = useState(0);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInitiate, setShowInitiate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, page_size: PAGE_SIZE,
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };
      const res = await offboardingService.list(params);
      setOffboardings(res.results ?? res);
      setTotalCount(res.count ?? (res.results ?? res).length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => {
    employeeService.list({ page_size: 500 })
      .then(r => setEmployees(r.results ?? r))
      .catch(console.error);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const daysUntil = dateStr => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  };

  return (
    <DashboardLayout>
      {showInitiate && (
        <InitiateModal
          employees={employees}
          onClose={() => setShowInitiate(false)}
          onSuccess={msg => { setShowInitiate(false); showSuccess(msg); load(); }}
        />
      )}

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => router.push("/settings/asset-mng")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offboarding</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Manage asset returns and transfers for departing employees
            </p>
          </div>
          <button onClick={() => setShowInitiate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold transition-colors shadow-sm shadow-almet-cloud-burst/20">
            <Plus size={15} /> Start Offboarding
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-56">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => { setStatusFilter(t.value); setPage(1); }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all
                  ${statusFilter === t.value
                    ? "bg-white dark:bg-gray-900 text-almet-cloud-burst dark:text-almet-steel-blue shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <Loader size={24} className="animate-spin text-almet-steel-blue" />
            <p className="text-sm text-gray-400">Loading offboarding records…</p>
          </div>
        ) : offboardings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl gap-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5">
              <UserMinus size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No offboarding records</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Start a new offboarding process above</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offboardings.map(o => {
              const pct    = o.progress_pct ?? 0;
              const days   = daysUntil(o.last_working_day);
              const urgent = days !== null && days <= 3 && o.status !== "COMPLETED";
              const typeOpt = TYPE_OPTIONS.find(t => t.value === o.offboarding_type);

              return (
                <div key={o.id}
                  className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200
                    ${urgent ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-800"}`}>

                  {/* Urgent banner */}
                  {urgent && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2 flex items-center gap-2">
                      <AlertCircle size={13} className="text-red-500 shrink-0" />
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                        {days === 0 ? "Last day today!" : days < 0 ? "Overdue!" : `${days} day${days !== 1 ? "s" : ""} remaining`}
                      </p>
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    {/* Employee + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{o.employee_info?.full_name ?? "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{o.employee_info?.employee_id}</p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Last day:</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {o.last_working_day
                            ? new Date(o.last_working_day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </span>
                        {days !== null && !urgent && days > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{days}d left</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Package size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Assets:</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {o.assets_processed} / {o.total_assets} processed
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <ArrowRightLeft size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${TYPE_STYLE[o.offboarding_type] ?? "bg-gray-100 text-gray-600"}`}>
                          {typeOpt && <span>{typeOpt.icon}</span>}
                          {o.type_display ?? typeOpt?.label ?? o.offboarding_type}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {o.total_assets > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>Progress</span>
                          <span className="font-semibold text-gray-600 dark:text-gray-300">{Math.round(pct)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-emerald-500" : "bg-almet-steel-blue"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <button onClick={() => router.push(`${o.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-almet-mystic hover:border-almet-steel-blue hover:text-almet-cloud-burst dark:hover:bg-almet-cloud-burst/10 dark:hover:border-almet-steel-blue dark:hover:text-almet-steel-blue transition-all">
                      <Eye size={14} />
                      {o.status === "COMPLETED" ? "View Details" : "Manage"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}