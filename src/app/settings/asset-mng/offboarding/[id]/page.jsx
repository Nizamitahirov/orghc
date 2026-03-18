// src/app/settings/asset-mng/offboarding/[id]/page.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { offboardingService, employeeService } from "@/services/assetService";
import { useToast } from "@/components/common/Toast";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import {
  ArrowLeft, Loader, CheckCircle, Package,
  ArrowRightLeft, X, AlertTriangle, CalendarDays,
  AlertCircle, Users, RotateCcw, Trash2,
} from "lucide-react";

// ── Shared ────────────────────────────────────────────────────────────────────
const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400";

const ErrBox = ({ msg }) => msg ? (
  <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
    <AlertCircle size={15} className="mt-0.5 shrink-0" /> {msg}
  </div>
) : null;

// ── Action Modal ──────────────────────────────────────────────────────────────
const ActionModal = ({ asset, action, employees, onClose, onConfirm, loading, error }) => {
  const [toEmployee, setToEmployee] = useState("");
  const [reason, setReason]         = useState("");

  const empOptions = employees.map(e => ({
    value: String(e.id),
    label: `${e.full_name ?? e.name} (${e.employee_id})`,
  }));

  const isTransfer = action === "TRANSFER";
  const isWriteoff = action === "WRITEOFF";
  const canSubmit  = isTransfer ? !!toEmployee : true;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">

        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {isTransfer ? "Transfer to Another Employee" : "Write-off Asset"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isTransfer
                ? "Select the employee this asset will be transferred to."
                : "This asset will be removed from inventory."}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ErrBox msg={error} />

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg p-2 shrink-0">
              <Package size={16} className="text-almet-cloud-burst dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{asset.asset_name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{asset.serial_number}</p>
            </div>
          </div>

          {isTransfer && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Transfer To <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={empOptions}
                value={toEmployee}
                onChange={v => setToEmployee(v ?? "")}
                placeholder="Select employee…"
                searchPlaceholder="Search…"
                allowUncheck={false}
              />
            </div>
          )}

          {isWriteoff && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Reason (optional)
              </label>
              <textarea rows={3} className={`${inputCls} resize-none`} value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. broken, lost, end of life…" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ toEmployee, reason })}
            disabled={loading || !canSubmit}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors
              ${isWriteoff ? "bg-red-600 hover:bg-red-700" : "bg-almet-cloud-burst hover:bg-almet-sapphire"}`}>
            {loading && <Loader size={14} className="animate-spin" />}
            {isTransfer ? "Confirm Transfer" : "Confirm Write-off"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Asset Row ─────────────────────────────────────────────────────────────────
const AssetRow = ({ asset, isCompleted, onAction, actionLoading, showReturned, showTransfer, showWriteoff }) => {
  const isDone = !["ASSIGNED", "IN_USE", "NEED_CLARIFICATION"].includes(asset.status);

  const statusInfo = {
    IN_STOCK:       { label: "Returned ✓",    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    IN_USE:         { label: "Transferred ✓", cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    OUT_OF_SERVICE: { label: "Written off ✓", cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
    ASSIGNED:       { label: "Pending",        cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };

  const s = statusInfo[asset.status] ?? { label: asset.status, cls: "bg-gray-100 text-gray-500" };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 transition-all
      ${isDone
        ? "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-900/10"
        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}>

      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${isDone ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
          {isDone
            ? <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
            : <Package size={18} className="text-gray-400 dark:text-gray-500" />
          }
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{asset.asset_name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{asset.serial_number ?? "—"} · {asset.category_name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>
          {s.label}
        </span>

        {!isDone && !isCompleted && (
          <div className="flex items-center gap-1.5">
            {showReturned && (
              <button
                onClick={() => onAction(asset, "RETURN")}
                disabled={!!actionLoading}
                title="Return to IT"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400
                  hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800
                  disabled:opacity-40 transition-colors">
                {actionLoading === asset.id + "RETURN"
                  ? <Loader size={12} className="animate-spin" />
                  : <RotateCcw size={12} />
                }
                Returned
              </button>
            )}
            {showTransfer && (
              <button
                onClick={() => onAction(asset, "TRANSFER")}
                disabled={!!actionLoading}
                title="Transfer to another employee"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  bg-almet-mystic text-almet-cloud-burst dark:bg-almet-cloud-burst/10 dark:text-almet-steel-blue
                  hover:bg-almet-steel-blue/20 border border-almet-steel-blue/30
                  disabled:opacity-40 transition-colors">
                <ArrowRightLeft size={12} />
                Transfer
              </button>
            )}
            {showWriteoff && (
              <button
                onClick={() => onAction(asset, "WRITEOFF")}
                disabled={!!actionLoading}
                title="Remove from inventory"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400
                  hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800
                  disabled:opacity-40 transition-colors">
                <Trash2 size={12} />
                Write-off
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
export default function OffboardingDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();

  const [offboarding, setOffboarding] = useState(null);
  const [assets, setAssets]           = useState([]);
  const [summary, setSummary]         = useState(null);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [modal, setModal]             = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ob, assetRes] = await Promise.all([
        offboardingService.detail(id),
        offboardingService.assets(id),
      ]);
      setOffboarding(ob);
      setAssets(assetRes.assets ?? assetRes.results ?? []);
      // Load summary if completed
      if (ob.status === "COMPLETED") {
        offboardingService.summary(id)
          .then(s => setSummary(s))
          .catch(console.error);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    load();
    employeeService.list({ page_size: 500 })
      .then(r => setEmployees(r.results ?? r)).catch(console.error);
  }, [load]);

  const handleAction = (asset, action) => {
    if (action === "RETURN") {
      processAsset(asset, action, {});
      return;
    }
    setModalError("");
    setModal({ asset, action });
  };

  const processAsset = async (asset, action, { toEmployee, reason }) => {
    const key = asset.id + action;
    setActionLoading(key);
    try {
      const payload = {
        asset_id: asset.id,
        action,
        ...(action === "TRANSFER" && { to_employee_id: parseInt(toEmployee) }),
        ...(action === "WRITEOFF" && reason && { reason }),
      };
      const res = await offboardingService.processAsset(id, payload);

      setModal(null);
      showSuccess(
        action === "RETURN"   ? `${asset.asset_name} returned to IT ✓` :
        action === "TRANSFER" ? `${asset.asset_name} transferred successfully ✓` :
                                `${asset.asset_name} written off ✓`
      );

      if (res.all_done) {
        showSuccess("🎉 All assets processed — offboarding completed!");
      }

      load();
    } catch (e) {
      const d = e.response?.data;
      const msg = typeof d === "string" ? d : d?.error ?? d?.message ?? "Something went wrong.";
      if (modal) setModalError(msg);
      else showError(msg);
    } finally {
      setActionLoading(null);
      setModalLoading(false);
    }
  };

  // ── Loading / Not found ────────────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader size={28} className="animate-spin text-almet-steel-blue" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </DashboardLayout>
  );

  if (!offboarding) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <AlertTriangle size={28} className="text-gray-300" />
        <p className="text-sm text-gray-400">Offboarding record not found.</p>
      </div>
    </DashboardLayout>
  );

  // ── Derived state — declare ALL vars before JSX ────────────────────────────
  const isCompleted = offboarding.status === "COMPLETED";
  const empName     = offboarding.employee_info?.full_name ?? "—";
  const pct         = offboarding.progress_pct ?? 0;
  const total       = offboarding.total_assets ?? 0;
  const processed   = offboarding.assets_processed ?? 0;
  const remaining   = total - processed;

  const obType      = offboarding.offboarding_type;
  const isReturn    = obType === "RETURN";
  const isTransfer  = obType === "TRANSFER";
  const isMixed     = obType === "MIXED";

  const showReturned = isReturn   || isMixed;
  const showTransfer = isTransfer || isMixed;
  const showWriteoff = true;

  return (
    <DashboardLayout>
      {modal && (
        <ActionModal
          asset={modal.asset}
          action={modal.action}
          employees={employees}
          onClose={() => setModal(null)}
          loading={modalLoading}
          error={modalError}
          onConfirm={({ toEmployee, reason }) => {
            setModalLoading(true);
            processAsset(modal.asset, modal.action, { toEmployee, reason });
          }}
        />
      )}

      <div className="p-6 lg:p-8  mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => router.push("/settings/asset-mng/offboarding")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft size={15} /> Back to Offboarding
        </button>

        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <div className={`bg-white dark:bg-gray-900 border-2 rounded-2xl overflow-hidden shadow-sm
          ${isCompleted ? "border-emerald-200 dark:border-emerald-800" : "border-gray-100 dark:border-gray-800"}`}>

          <div className={`h-1.5 ${isCompleted ? "bg-emerald-500" : "bg-almet-steel-blue"}`} />

          <div className="p-6 space-y-5">
            {/* Employee + status */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                  ${isCompleted ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <Users size={20} className={isCompleted ? "text-emerald-600" : "text-gray-400"} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{empName}</h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {offboarding.employee_info?.employee_id} · {offboarding.employee_info?.job_title ?? offboarding.employee_info?.department_name}
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold
                ${isCompleted
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                {isCompleted ? "✓ Completed" : offboarding.status}
              </span>
            </div>

            {/* Info strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} className="text-gray-300" />
                Last working day:
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {offboarding.last_working_day
                    ? new Date(offboarding.last_working_day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Package size={13} className="text-gray-300" />
                {total} asset{total !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <ArrowRightLeft size={13} className="text-gray-300" />
                {offboarding.type_display ?? obType}
              </span>
            </div>

            {/* Progress */}
            {total > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{processed} / {total}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-emerald-500" : "bg-almet-steel-blue"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {remaining > 0 && !isCompleted && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    {remaining} asset{remaining !== 1 ? "s" : ""} still pending
                  </p>
                )}
                {isCompleted && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    All assets have been processed
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Assets ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Assets</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isReturn   && "Mark each asset as returned to IT, or write-off if damaged / lost."}
              {isTransfer && "Transfer each asset to another employee, or write-off if damaged / lost."}
              {isMixed    && "Decide what happens to each asset individually."}
            </p>
          </div>

          {/* Legend */}
          {!isCompleted && assets.length > 0 && (
            <div className="flex flex-wrap gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold w-full">
                {isReturn   && "All assets should be physically returned to IT. Mark each one as returned, or write-off if damaged / lost."}
                {isTransfer && "All assets should be transferred to other employees. Select the recipient for each, or write-off if damaged / lost."}
                {isMixed    && "Decide what happens to each asset individually — return it, transfer it, or write it off."}
              </p>
              {showReturned && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <RotateCcw size={12} /> <b>Returned</b> — physically handed back to IT
                </span>
              )}
              {showTransfer && (
                <span className="flex items-center gap-1.5 text-xs text-almet-cloud-burst dark:text-almet-steel-blue">
                  <ArrowRightLeft size={12} /> <b>Transfer</b> — assigned to another employee
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                <Trash2 size={12} /> <b>Write-off</b> — broken / lost, removed from inventory
              </span>
            </div>
          )}

          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 gap-2">
              <Package size={22} className="opacity-30" />
              <p className="text-sm">No assets found for this employee.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {assets.map(a => (
                <AssetRow
                  key={a.id}
                  asset={a}
                  isCompleted={isCompleted}
                  onAction={handleAction}
                  actionLoading={actionLoading}
                  showReturned={showReturned}
                  showTransfer={showTransfer}
                  showWriteoff={showWriteoff}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Completed Summary ──────────────────────────────────────── */}
        {isCompleted && summary && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Handover Summary</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  What happened to each asset during offboarding
                </p>
              </div>
              {summary.completed_at && (
                <span className="text-xs text-gray-400">
                  Completed {new Date(summary.completed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {summary.processed_assets?.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-gray-400">No records found.</div>
              ) : (
                summary.processed_assets?.map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.action_color + "20" }}>
                        {item.action === "CHECKED_IN"    && <RotateCcw size={14} style={{ color: item.action_color }} />}
                        {item.action === "TRANSFERRED"   && <ArrowRightLeft size={14} style={{ color: item.action_color }} />}
                        {item.action === "OUT_OF_SERVICE"&& <Trash2 size={14} style={{ color: item.action_color }} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.asset_name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{item.serial_number}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: item.action_color + "15", color: item.action_color }}>
                          {item.action_label}
                        </span>
                        {item.metadata?.to_employee && (
                          <p className="text-xs text-gray-400 mt-1">→ {item.metadata.to_employee}</p>
                        )}
                        {item.metadata?.reason && (
                          <p className="text-xs text-gray-400 mt-1 max-w-[160px] truncate" title={item.metadata.reason}>
                            {item.metadata.reason}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        <p>{item.performed_by}</p>
                        <p className="mt-0.5">
                          {new Date(item.performed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Stats strip */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4">
              {[
                { label: "Returned to IT",  color: "#10B981", action: "CHECKED_IN" },
                { label: "Transferred",     color: "#3B82F6", action: "TRANSFERRED" },
                { label: "Written Off",     color: "#DC2626", action: "OUT_OF_SERVICE" },
              ].map(s => {
                const cnt = summary.processed_assets?.filter(a => a.action === s.action).length ?? 0;
                if (!cnt) return null;
                return (
                  <span key={s.action} className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: s.color }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                    {cnt} {s.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {offboarding.notes && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Notes</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{offboarding.notes}</p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}