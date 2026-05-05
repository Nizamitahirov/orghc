// src/app/asset-management/assignments/page.jsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assetService, employeeService, fetchAll } from "@/services/assetService";
import { useToast } from "@/components/common/Toast";
import Pagination from "@/components/common/Pagination";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import {
  Search, Plus, Loader, Package,
  CheckCircle, XCircle, LogIn, MessageSquare, X,
  Clock, Users, AlertCircle, ArrowLeft, ChevronDown,
} from "lucide-react";

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  ASSIGNED:           { label: "Pending Acceptance", cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800" },
  IN_USE:             { label: "In Use",             cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800" },
  NEED_CLARIFICATION: { label: "Needs Clarification",cls: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-800" },
  IN_REPAIR:          { label: "In Repair",          cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>{s.label}</span>;
};

// ── Asset Multi-Select Dropdown ───────────────────────────────────────────────
const AssetMultiSelect = ({ assets = [], selectedIds = [], onChange, placeholder = "Choose assets…" }) => {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const containerRef          = useRef(null);

  const filtered = search.trim()
    ? assets.filter(a =>
        a.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.serial_number?.toLowerCase().includes(search.toLowerCase())
      )
    : assets;

  const toggle = id =>
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);

  const clearAll = (e) => { e.stopPropagation(); onChange([]); };

  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const label = selectedIds.length === 0
    ? placeholder
    : selectedIds.length === 1
      ? assets.find(a => a.id === selectedIds[0])?.asset_name ?? "1 asset selected"
      : `${selectedIds.length} assets selected`;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all
          ${open
            ? "border-almet-steel-blue ring-2 ring-almet-steel-blue/20 bg-white dark:bg-gray-800"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-almet-steel-blue/50"
          }`}
      >
        <span className={selectedIds.length === 0 ? "text-gray-400" : "text-gray-900 dark:text-white font-medium"}>
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedIds.length > 0 && (
            <span
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer px-1"
              title="Clear all"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or serial…"
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-almet-steel-blue/50"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-1.5">
                <Package size={18} className="opacity-40" />
                <p className="text-xs">No assets in stock</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No results for "{search}"
              </div>
            ) : filtered.map(a => {
              const checked = selectedIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggle(a.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                    ${checked
                      ? "bg-almet-mystic dark:bg-almet-cloud-burst/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                >
                  <span className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border-2 transition-colors
                    ${checked
                      ? "bg-almet-cloud-burst border-almet-cloud-burst"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}>
                    {checked && <CheckCircle size={10} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{a.asset_name}</span>
                  <span className="text-xs text-gray-400 font-mono shrink-0">{a.serial_number}</span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {selectedIds.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center justify-between">
              <span className="text-xs text-almet-sapphire dark:text-almet-steel-blue font-semibold">
                ✓ {selectedIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(""); }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Shared ────────────────────────────────────────────────────────────────────
const inputCls ="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400";

const ModalShell = ({ title, subtitle, onClose, children, footer }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
      <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-4 overflow-y-auto flex-1">{children}</div>
      {footer && (
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const ErrBox = ({ msg }) => msg ? (
  <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
    <AlertCircle size={15} className="mt-0.5 shrink-0" /> {msg}
  </div>
) : null;

const BtnPrimary = ({ children, onClick, disabled, loading }) => (
  <button onClick={onClick} disabled={disabled}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm shadow-almet-cloud-burst/20">
    {loading && <Loader size={14} className="animate-spin" />}{children}
  </button>
);

const BtnOutline = ({ children, onClick }) => (
  <button onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    {children}
  </button>
);

// ── Assign Modal ──────────────────────────────────────────────────────────────
const AssignModal = ({ availableAssets, employees, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    asset_ids: [], employee_id: "",
    check_out_date: new Date().toISOString().split("T")[0],
    condition_out: "GOOD", check_out_notes: "", require_acceptance: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const employeeOptions = employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_id})` }));

  const submit = async () => {
    if (!form.employee_id)      return setError("Please select an employee.");
    if (!form.asset_ids.length) return setError("Please select at least one asset.");
    setLoading(true); setError("");
    try {
      await assetService.assign({ ...form, employee_id: parseInt(form.employee_id) });
      onSuccess(`${form.asset_ids.length} asset(s) assigned successfully.`);
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : d?.asset_ids?.[0] ?? d?.employee_id?.[0] ?? d?.error ?? d?.message ?? "Assignment failed.");
    } finally { setLoading(false); }
  };

  return (
    <ModalShell title="Assign Asset to Employee" subtitle="Only assets currently in stock can be assigned." onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading} loading={loading}>Assign</BtnPrimary></>}>
      <ErrBox msg={error} />

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          1 · Select Employee <span className="text-red-500">*</span>
        </label>
        <SearchableDropdown options={employeeOptions} value={form.employee_id}
          onChange={v => setForm(p => ({ ...p, employee_id: v ?? "" }))}
          placeholder="Choose employee…" searchPlaceholder="Search employees…" allowUncheck={false} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          2 · Select Assets <span className="text-red-500">*</span>
        </label>
        <AssetMultiSelect
          assets={availableAssets}
          selectedIds={form.asset_ids}
          onChange={ids => setForm(p => ({ ...p, asset_ids: ids }))}
          placeholder="Choose assets…"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          3 · Assignment Details
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Check-out Date</label>
            <input type="date" className={inputCls} value={form.check_out_date}
              onChange={e => setForm(p => ({ ...p, check_out_date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Condition</label>
            <SearchableDropdown
              options={["EXCELLENT", "GOOD", "FAIR", "POOR"].map(c => ({ value: c, label: c }))}
              value={form.condition_out}
              onChange={v => setForm(p => ({ ...p, condition_out: v ?? "GOOD" }))}
              placeholder="Select…" allowUncheck={false} />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notes (optional)</label>
          <textarea rows={2} className={`${inputCls} resize-none`} value={form.check_out_notes}
            onChange={e => setForm(p => ({ ...p, check_out_notes: e.target.value }))} placeholder="Any additional notes…" />
        </div>
      </div>

      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors
        ${form.require_acceptance ? "border-almet-steel-blue bg-almet-mystic/60 dark:bg-almet-cloud-burst/10 dark:border-almet-steel-blue" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
        <input type="checkbox" className="accent-almet-cloud-burst w-4 h-4 mt-0.5"
          checked={form.require_acceptance}
          onChange={e => setForm(p => ({ ...p, require_acceptance: e.target.checked }))} />
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Require employee acceptance</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {form.require_acceptance
              ? "Asset stays as Pending until the employee confirms receipt."
              : "Asset is immediately marked as In Use — no confirmation needed."}
          </p>
        </div>
      </label>
    </ModalShell>
  );
};

// ── Check-in Modal ────────────────────────────────────────────────────────────
const CheckInModal = ({ asset, onClose, onSuccess }) => {
  const [form, setForm] = useState({ condition_in: "GOOD", check_in_notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    setLoading(true); setError("");
    try {
      await assetService.bulkCheckIn({ asset_ids: [asset.id], ...form });
      onSuccess("Asset checked in successfully.");
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : d?.error ?? d?.message ?? "Check-in failed.");
    } finally { setLoading(false); }
  };

  return (
    <ModalShell title="Check In Asset" subtitle="Record the return of this asset from the employee." onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading} loading={loading}>Confirm Check-in</BtnPrimary></>}>
      <ErrBox msg={error} />
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
        <div className="bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg p-2">
          <Package size={18} className="text-almet-cloud-burst dark:text-almet-steel-blue" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{asset.asset_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{asset.assigned_to_name} · {asset.serial_number ?? "—"}</p>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Return Condition</label>
        <SearchableDropdown
          options={["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"].map(c => ({ value: c, label: c }))}
          value={form.condition_in}
          onChange={v => setForm(p => ({ ...p, condition_in: v ?? "GOOD" }))}
          placeholder="Select…" allowUncheck={false} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notes (optional)</label>
        <textarea rows={3} className={`${inputCls} resize-none`} value={form.check_in_notes}
          onChange={e => setForm(p => ({ ...p, check_in_notes: e.target.value }))} placeholder="Any notes about the returned asset…" />
      </div>
    </ModalShell>
  );
};

// ── Clarification Modal ───────────────────────────────────────────────────────
const ClarificationModal = ({ asset, onClose, onSuccess }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async () => {
    if (!response.trim()) return setError("Please enter a response.");
    setLoading(true); setError("");
    try {
      await assetService.provideClarification({ asset_id: asset.id, response });
      onSuccess("Response sent. Asset returned to Pending Acceptance.");
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : d?.error ?? d?.message ?? "Failed to submit.");
    } finally { setLoading(false); }
  };

  return (
    <ModalShell title="Respond to Employee Question" subtitle="Your response will be sent to the employee and the asset will return to Pending status." onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading} loading={loading}>Send Response</BtnPrimary></>}>
      <ErrBox msg={error} />
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2">
          <Package size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{asset.asset_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{asset.assigned_to_name} · {asset.serial_number ?? "—"}</p>
        </div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">Employee has a question</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Open the asset details to see the full question before responding.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Your Response <span className="text-red-500">*</span>
        </label>
        <textarea rows={4} className={`${inputCls} resize-none`} value={response}
          onChange={e => setResponse(e.target.value)} placeholder="Type your answer here…" />
      </div>
    </ModalShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const PAGE_SIZE = 15;

const STATUS_FILTERS = [
  { value: "active",             label: "All Active",          icon: Users },
  { value: "ASSIGNED",           label: "Pending Acceptance",  icon: Clock },
  { value: "IN_USE",             label: "In Use",              icon: CheckCircle },
  { value: "NEED_CLARIFICATION", label: "Needs Clarification", icon: MessageSquare },
  { value: "IN_REPAIR",          label: "In Repair",           icon: null },
];

const buildStatusParam = f =>
  f === "active" ? ["ASSIGNED", "IN_USE", "NEED_CLARIFICATION", "IN_REPAIR"] : f;

export default function AssignmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [assets, setAssets]             = useState([]);
  const [availableAssets, setAvailable] = useState([]);
  const [employees, setEmployees]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [totalCount, setTotalCount]     = useState(0);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "active");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const [showAssign, setShowAssign]     = useState(false);
  const [checkInAsset, setCheckInAsset] = useState(null);
  const [clarifyAsset, setClarifyAsset] = useState(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, page_size: PAGE_SIZE,
        status: buildStatusParam(statusFilter),
        ...(search && { search }),
        ...(employeeFilter !== "all" && { assigned_to: employeeFilter }),
      };
      const res = await assetService.list(params);
      setAssets(res.results ?? res);
      setTotalCount(res.count ?? (res.results ?? res).length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, employeeFilter]);

  useEffect(() => {
    Promise.all([
      fetchAll("/assets/assets/", { status: "IN_STOCK" }),
      fetchAll("/employees/"),
    ]).then(([allAssets, allEmployees]) => {
      setAvailable(allAssets);
      setEmployees(allEmployees);
    }).catch(console.error);
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const onActionSuccess = msg => {
    setShowAssign(false); setCheckInAsset(null); setClarifyAsset(null);
    loadAssets();
    fetchAll("/assets/assets/", { status: "IN_STOCK" })
      .then(all => setAvailable(all)).catch(console.error);
    showSuccess(msg);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const employeeOptions = [
    { value: "all", label: "All Employees" },
    ...employees.map(e => ({ value: String(e.id), label: e.name })),
  ];

  return (
    <DashboardLayout>
      {showAssign   && <AssignModal availableAssets={availableAssets} employees={employees} onClose={() => setShowAssign(false)} onSuccess={onActionSuccess} />}
      {checkInAsset && <CheckInModal asset={checkInAsset} onClose={() => setCheckInAsset(null)} onSuccess={onActionSuccess} />}
      {clarifyAsset && <ClarificationModal asset={clarifyAsset} onClose={() => setClarifyAsset(null)} onSuccess={onActionSuccess} />}

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => router.push("/settings/asset-mng")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {totalCount} assigned asset{totalCount !== 1 ? "s" : ""} across all employees
            </p>
          </div>
          <button onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold transition-colors shadow-sm shadow-almet-cloud-burst/20">
            <Plus size={15} /> Assign Asset
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-56">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by employee name or asset…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400" />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap
                  ${statusFilter === f.value
                    ? "bg-white dark:bg-gray-900 text-almet-cloud-burst dark:text-almet-steel-blue shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}>
                {f.icon && <f.icon size={12} />}
                {f.label}
              </button>
            ))}
          </div>

          {/* Employee filter */}
          <div className="w-52">
            <SearchableDropdown options={employeeOptions} value={employeeFilter}
              onChange={v => { setEmployeeFilter(v ?? "all"); setPage(1); }}
              placeholder="All Employees" searchPlaceholder="Search employees…" allowUncheck={false} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              <Loader size={24} className="animate-spin text-almet-steel-blue" />
              <p className="text-sm text-gray-400">Loading assignments…</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-gray-400 gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5"><Package size={28} className="opacity-40" /></div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No assignments found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50">
                    {["Employee", "Asset", "Serial No.", "Category", "Status", "Last Updated", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-5 py-3.5 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {assets.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{a.assigned_to_name ?? "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.assigned_to_employee_id}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{a.asset_name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">{a.serial_number ?? "—"}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{a.category_name}</td>
                      <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {a.updated_at ? new Date(a.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {a.can_be_checked_in && (
                            <button onClick={() => setCheckInAsset(a)} title="Check in"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-almet-cloud-burst dark:text-almet-steel-blue bg-almet-mystic dark:bg-almet-cloud-burst/10 hover:bg-almet-steel-blue/20 transition-colors">
                              <LogIn size={13} /> Check in
                            </button>
                          )}
                          {a.status === "NEED_CLARIFICATION" && (
                            <button onClick={() => setClarifyAsset(a)} title="Respond to question"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                              <MessageSquare size={13} /> Reply
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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