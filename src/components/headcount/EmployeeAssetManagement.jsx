"use client";
import { useState, useEffect } from "react";
import {
  Package, CheckCircle, XCircle, Clock, AlertTriangle,
  MessageSquare, Calendar, Building, Loader, CheckSquare,
  Info, Hash, Tag, ArrowRightLeft, User, AlertCircle,
  ClipboardCheck, ChevronDown, ChevronUp,
} from "lucide-react";
import { assetService, transferService, handoverService } from "@/services/assetService";

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

const daysSince = (iso) => {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
};

// ─── tiny shared components ───────────────────────────────────────────────────

const InlineError = ({ msg }) =>
  msg ? (
    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-3 py-2 text-[11px]">
      <AlertCircle size={12} className="mt-0.5 shrink-0" /> {msg}
    </div>
  ) : null;

const StatusBadge = ({ status, statusDisplay }) => {
  const map = {
    IN_STOCK:           "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
    IN_USE:             "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/30",
    ASSIGNED:           "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/30",
    NEED_CLARIFICATION: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/30",
    IN_REPAIR:          "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/30",
  };
  const icons = {
    IN_USE: <CheckCircle size={10} />,
    ASSIGNED: <Clock size={10} />,
    NEED_CLARIFICATION: <AlertTriangle size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {icons[status] ?? <Package size={10} />}
      {statusDisplay ?? status}
    </span>
  );
};

// ─── Handover Card ────────────────────────────────────────────────────────────
const HandoverCard = ({ handover, onAccept, darkMode }) => {
  const [expanded, setExpanded]   = useState(true);
  const [loading, setLoading]     = useState(false);
  const [notes, setNotes]         = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError]         = useState("");

  const bgCard   = darkMode ? "bg-almet-san-juan"     : "bg-white";
  const bgAccent = darkMode ? "bg-almet-comet/30"     : "bg-gray-50";
  const text1    = darkMode ? "text-white"             : "text-almet-cloud-burst";
  const text2    = darkMode ? "text-almet-bali-hai"    : "text-almet-waterloo";
  const textM    = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const border   = darkMode ? "border-almet-comet"     : "border-gray-200";

  const pendingAssets   = handover.assignments.filter(a => a.status === "ASSIGNED");
  const acceptedAssets  = handover.assignments.filter(a => a.status === "IN_USE");
  const allAccepted     = handover.status === "ACCEPTED";

  const handleAccept = async () => {
    setLoading(true); setError("");
    try {
      await handoverService.accept(handover.id, { notes });
      onAccept();
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to accept handover. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${bgCard} rounded-xl border-2 ${allAccepted ? "border-emerald-200 dark:border-emerald-800" : "border-almet-steel-blue/40"} overflow-hidden shadow-sm`}>

      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${allAccepted ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "bg-almet-mystic/30 dark:bg-almet-cloud-burst/10"}`}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${allAccepted ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-almet-steel-blue/10"}`}>
            <ClipboardCheck size={15} className={allAccepted ? "text-emerald-600 dark:text-emerald-400" : "text-almet-sapphire"} />
          </div>
          <div>
            <p className={`${text1} text-xs font-bold`}>
              Handover #{handover.handover_number}
            </p>
            <p className={`${textM} text-[10px] mt-0.5`}>
              {fmt(handover.handover_date)} · {handover.assignments.length} asset{handover.assignments.length !== 1 ? "s" : ""}
              {handover.created_by_name && ` · HR: ${handover.created_by_name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allAccepted ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle size={10} /> Accepted
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Clock size={10} /> {pendingAssets.length} pending
            </span>
          )}
          {expanded ? <ChevronUp size={14} className={textM} /> : <ChevronDown size={14} className={textM} />}
        </div>
      </div>

      {/* Asset list */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3">

          {/* Asset rows */}
          <div className={`rounded-lg border ${border} overflow-hidden`}>
            {handover.assignments.map((asgn, idx) => (
              <div
                key={asgn.id}
                className={`flex items-center justify-between gap-3 px-3 py-2.5
                  ${idx !== 0 ? `border-t ${border}` : ""}
                  ${asgn.status === "IN_USE" ? "bg-emerald-50/30 dark:bg-emerald-900/5" : bgAccent}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Package size={13} className={asgn.status === "IN_USE" ? "text-emerald-500" : "text-almet-sapphire"} />
                  <div className="min-w-0">
                    <p className={`${text1} text-xs font-semibold truncate`}>{asgn.asset_name}</p>
                    <p className={`${textM} text-[10px] font-mono mt-0.5`}>{asgn.serial_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`${textM} text-[10px]`}>{asgn.category_name}</span>
                  <StatusBadge status={asgn.status} statusDisplay={asgn.status_display} />
                </div>
              </div>
            ))}
          </div>

          {/* Handover notes (HR) */}
          {handover.notes && (
            <div className={`${bgAccent} rounded-lg px-3 py-2 border ${border}`}>
              <p className={`${textM} text-[9px] uppercase tracking-wide font-semibold mb-0.5`}>HR Notes</p>
              <p className={`${text2} text-xs`}>{handover.notes}</p>
            </div>
          )}

          {/* Accepted info */}
          {allAccepted && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={12} />
              Accepted on {fmt(handover.accepted_at)}
              {handover.accepted_by_name && ` by ${handover.accepted_by_name}`}
            </div>
          )}

          {/* Accept action (only for pending) */}
          {!allAccepted && pendingAssets.length > 0 && (
            <div className="space-y-2 pt-1">
              <InlineError msg={error} />

              {/* Optional accept notes toggle */}
              <button
                type="button"
                onClick={() => setShowNotes(v => !v)}
                className={`text-[10px] ${textM} hover:${text2} underline underline-offset-2`}
              >
                {showNotes ? "Hide notes" : "Add acceptance notes (optional)"}
              </button>

              {showNotes && (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any comments about what you received…"
                  className={`w-full px-3 py-2 text-[11px] border ${border} rounded-lg outline-none focus:ring-1 focus:ring-almet-sapphire ${bgCard} ${text1} resize-none`}
                />
              )}

              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
              >
                {loading
                  ? <><Loader size={13} className="animate-spin" /> Processing…</>
                  : <><CheckSquare size={13} /> Accept All {pendingAssets.length} Asset{pendingAssets.length !== 1 ? "s" : ""}</>
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Individual asset card (assets NOT linked to any handover) ────────────────
const LooseAssetCard = ({ asset, onAction, isLoading, darkMode }) => {
  const bgCard   = darkMode ? "bg-almet-san-juan"     : "bg-white";
  const bgAccent = darkMode ? "bg-almet-comet/30"     : "bg-almet-mystic/50";
  const text1    = darkMode ? "text-white"             : "text-almet-cloud-burst";
  const text2    = darkMode ? "text-almet-bali-hai"    : "text-almet-waterloo";
  const textM    = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const border   = darkMode ? "border-almet-comet"     : "border-gray-200";
  const shadow   = darkMode ? "shadow-sm shadow-black/10" : "shadow-sm shadow-gray-200/50";

  return (
    <div className={`${bgCard} rounded-lg border ${border} p-4 ${shadow} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-almet-sapphire/10 rounded-lg shrink-0">
            <Package size={15} className="text-almet-sapphire" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`${text1} font-semibold text-sm truncate`}>{asset.asset_name}</h4>
            <div className="flex flex-wrap gap-3 text-xs mt-0.5">
              <span className={`${textM} flex items-center gap-1`}><Hash size={10} />{asset.serial_number}</span>
              <span className={`${textM} flex items-center gap-1`}><Tag size={10} />{asset.category_name ?? asset.category}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={asset.status} statusDisplay={asset.status_display} />
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {[
          { label: "Purchase Date",   val: fmt(asset.purchase_date),   Icon: Calendar },
          { label: "Assignment Date", val: fmt(asset.assignment_date),  Icon: Calendar },
          { label: "Days Assigned",   val: asset.days_assigned != null ? `${asset.days_assigned}d` : "—", Icon: Clock },
          { label: "Category",        val: asset.category_name ?? asset.category ?? "—", Icon: Building },
        ].map(({ label, val, Icon }) => (
          <div key={label} className={`${bgAccent} rounded-md p-2`}>
            <p className={`${textM} text-[9px] uppercase tracking-wide font-semibold mb-1`}>{label}</p>
            <div className="flex items-center gap-1">
              <Icon size={10} className={textM} />
              <span className={`${text2} text-[10px] font-medium truncate`}>{val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Clarification banner */}
      {asset.clarification_info?.has_clarification && (
        <div className={`${bgAccent} rounded-md p-3 mb-3 border ${border}`}>
          <div className="flex items-start gap-2">
            <Info size={12} className="text-violet-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className={`${text1} font-semibold text-xs mb-1`}>
                {asset.clarification_info.status === "pending" ? "Clarification Pending" : "Clarification Resolved"}
              </p>
              <p className={`${text2} text-[10px] mb-0.5`}>
                <span className="font-medium">Reason: </span>{asset.clarification_info.requested_reason}
              </p>
              {asset.clarification_info.has_response && (
                <p className={`${text2} text-[10px]`}>
                  <span className="font-medium">Response: </span>{asset.clarification_info.response}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {asset.status === "ASSIGNED" && asset.can_accept && (
          <button
            onClick={() => onAction(asset, "accept")}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader size={10} className="animate-spin" /> : <CheckSquare size={10} />}
            Accept
          </button>
        )}
        {asset.can_request_clarification && (
          <button
            onClick={() => onAction(asset, "clarification")}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-semibold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader size={10} className="animate-spin" /> : <MessageSquare size={10} />}
            Clarification
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Transfer Card ────────────────────────────────────────────────────────────
const TransferCard = ({ transfer, onAction, isLoading, darkMode }) => {
  const bgCard   = darkMode ? "bg-almet-san-juan"     : "bg-white";
  const bgAccent = darkMode ? "bg-almet-comet/30"     : "bg-almet-mystic/50";
  const text1    = darkMode ? "text-white"             : "text-almet-cloud-burst";
  const text2    = darkMode ? "text-almet-bali-hai"    : "text-almet-waterloo";
  const textM    = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const border   = darkMode ? "border-almet-comet"     : "border-gray-200";
  const shadow   = darkMode ? "shadow-sm shadow-black/10" : "shadow-sm shadow-gray-200/50";
  const days     = daysSince(transfer.requested_at);

  return (
    <div className={`${bgCard} rounded-lg border-2 border-amber-500/50 p-4 ${shadow}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
          <ArrowRightLeft size={15} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className={`${text1} font-semibold text-sm truncate`}>{transfer.asset?.asset_name}</h4>
              <p className={`${textM} text-[10px] flex items-center gap-1 mt-0.5`}>
                <Hash size={10} />{transfer.asset?.serial_number}
              </p>
            </div>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30 shrink-0">
              <Clock size={10} /> Pending
            </span>
          </div>
        </div>
      </div>

      <div className={`${bgAccent} rounded-md p-3 mb-3 border ${border} space-y-1.5`}>
        <div className="flex items-center gap-2">
          <User size={11} className={textM} />
          <span className={`${textM} text-[10px]`}>From:</span>
          <span className={`${text2} text-[10px] font-medium`}>
            {transfer.from_employee?.full_name ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User size={11} className={textM} />
          <span className={`${textM} text-[10px]`}>Requested by:</span>
          <span className={`${text2} text-[10px] font-medium`}>
            {transfer.requested_by?.full_name ?? "—"}
          </span>
        </div>
        {transfer.transfer_notes && (
          <p className={`${textM} text-[10px] pt-1 border-t border-current/10`}>{transfer.transfer_notes}</p>
        )}
        <p className={`${textM} text-[9px] pt-1`}>
          Requested: {fmt(transfer.requested_at)}{days !== null && ` · ${days} day${days !== 1 ? "s" : ""} ago`}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAction(transfer, "approve")}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader size={12} className="animate-spin" /> : <><CheckCircle size={12} /> Accept</>}
        </button>
        <button
          onClick={() => onAction(transfer, "reject")}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader size={12} className="animate-spin" /> : <><XCircle size={12} /> Reject</>}
        </button>
      </div>
    </div>
  );
};

// ─── Action Modal (loose asset actions + transfer reject) ─────────────────────
const ActionModal = ({ modal, actionData, setActionData, onClose, onSubmit, isLoading, darkMode }) => {
  const bgCard   = darkMode ? "bg-almet-san-juan"     : "bg-white";
  const bgAccent = darkMode ? "bg-almet-comet/30"     : "bg-almet-mystic/50";
  const text1    = darkMode ? "text-white"             : "text-almet-cloud-burst";
  const textM    = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const border   = darkMode ? "border-almet-comet"     : "border-gray-200";
  const btnSecond = darkMode
    ? "bg-almet-comet hover:bg-almet-san-juan text-almet-bali-hai border border-almet-comet"
    : "bg-white hover:bg-almet-mystic text-almet-waterloo border border-gray-300";

  const { type, asset, transfer } = modal;

  const titles = {
    accept:        "Accept Asset",
    clarification: "Request Clarification",
    approve:       "Approve Transfer",
    reject:        "Reject Transfer",
  };
  const subs = {
    accept:        "Confirm that you have received this asset",
    clarification: "Ask HR / IT for more information about this asset",
    approve:       "Confirm acceptance of this asset transfer",
    reject:        "Decline this asset transfer request",
  };
  const submitCls = {
    accept:        "bg-emerald-500 hover:bg-emerald-600 text-white",
    clarification: "bg-amber-500 hover:bg-amber-600 text-white",
    approve:       "bg-emerald-500 hover:bg-emerald-600 text-white",
    reject:        "bg-red-500 hover:bg-red-600 text-white",
  };
  const submitLabel = {
    accept:        "Accept Asset",
    clarification: "Send Request",
    approve:       "Approve Transfer",
    reject:        "Reject Transfer",
  };

  const assetName   = asset?.asset_name ?? transfer?.asset?.asset_name;
  const assetSerial = asset?.serial_number ?? transfer?.asset?.serial_number;

  const canSubmit =
    type !== "clarification" || actionData.clarification_reason.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className={`${bgCard} rounded-xl w-full max-w-md shadow-2xl border ${border}`}>
        <div className="p-4 space-y-3">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`${text1} text-sm font-bold`}>{titles[type]}</h3>
              <p className={`${textM} text-[10px] mt-0.5`}>{subs[type]}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <XCircle size={16} />
            </button>
          </div>

          {/* Asset info */}
          <div className={`${bgAccent} rounded-lg p-3 border ${border} flex items-center gap-2`}>
            <Package size={14} className="text-almet-sapphire shrink-0" />
            <div className="min-w-0">
              <p className={`${text1} font-semibold text-xs truncate`}>{assetName}</p>
              <p className={`${textM} text-[10px] font-mono`}>{assetSerial}</p>
            </div>
          </div>

          {/* Error */}
          <InlineError msg={actionData.error} />

          {/* Fields */}
          {type === "accept" && (
            <div>
              <label className={`block text-[10px] font-semibold ${text1} mb-1`}>
                Comments <span className={textM}>(optional)</span>
              </label>
              <textarea
                value={actionData.comments}
                onChange={e => setActionData(p => ({ ...p, comments: e.target.value }))}
                className={`w-full px-3 py-2 border ${border} rounded-lg outline-none focus:ring-1 focus:ring-almet-sapphire ${bgCard} ${text1} text-[10px] resize-none`}
                rows={3}
                placeholder="Any comments about receiving this asset…"
              />
            </div>
          )}

          {(type === "approve" || type === "reject") && (
            <div>
              <label className={`block text-[10px] font-semibold ${text1} mb-1`}>
                {type === "reject" ? "Reason" : "Comments"} <span className={textM}>(optional)</span>
              </label>
              <textarea
                value={actionData.transfer_comments}
                onChange={e => setActionData(p => ({ ...p, transfer_comments: e.target.value }))}
                className={`w-full px-3 py-2 border ${border} rounded-lg outline-none focus:ring-1 focus:ring-almet-sapphire ${bgCard} ${text1} text-[10px] resize-none`}
                rows={3}
                placeholder={type === "reject" ? "Please explain why you are rejecting…" : "Any comments…"}
              />
            </div>
          )}

          {type === "clarification" && (
            <div>
              <label className={`block text-[10px] font-semibold ${text1} mb-1`}>
                Your Question <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionData.clarification_reason}
                onChange={e => setActionData(p => ({ ...p, clarification_reason: e.target.value }))}
                className={`w-full px-3 py-2 border ${border} rounded-lg outline-none focus:ring-1 focus:ring-almet-sapphire ${bgCard} ${text1} text-[10px] resize-none`}
                rows={3}
                placeholder="Describe what you need clarification on…"
                required
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className={`${btnSecond} px-3 py-2 rounded-lg text-[10px] font-semibold`}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isLoading || !canSubmit}
              className={`${submitCls[type]} px-3 py-2 rounded-lg text-[10px] font-semibold disabled:opacity-50 flex items-center gap-1 transition-colors`}
            >
              {isLoading
                ? <><Loader size={10} className="animate-spin" /> Processing…</>
                : submitLabel[type]
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const EmployeeAssetManagement = ({ employeeId, employeeData, darkMode, onRefresh }) => {
  const [handovers, setHandovers]             = useState([]);
  const [looseAssets, setLooseAssets]         = useState([]); // ASSIGNED/IN_USE not linked to a handover
  const [inUseAssets, setInUseAssets]         = useState([]); // IN_USE assets (all)
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [actionLoading, setActionLoading]     = useState({});
  const [modal, setModal]                     = useState(null);
  const [actionData, setActionData]           = useState({
    comments: "", clarification_reason: "", transfer_comments: "", error: "",
  });

  // ── load from employeeData prop ─────────────────────────────────────────────
  useEffect(() => {
    if (!employeeData) return;

    const allAssets       = employeeData.assigned_assets || [];
    const pendingHandovers = employeeData.pending_handovers || [];

    // Assets that belong to a pending handover — track their IDs
    const handoverAssetIds = new Set(
      pendingHandovers.flatMap(h => (h.assignments || []).map(a => a.asset_id))
    );

    // "Loose" assets: ASSIGNED but not part of any pending handover (older assignments)
    const loose = allAssets.filter(
      a => a.status === "ASSIGNED" && !handoverAssetIds.has(String(a.id))
    );
    // All IN_USE assets
    const inUse = allAssets.filter(a => a.status === "IN_USE");

    setHandovers(pendingHandovers);
    setLooseAssets(loose);
    setInUseAssets(inUse);
    setPendingTransfers(employeeData.pending_transfer_approvals || []);
  }, [employeeData]);

  // ── after any successful action ─────────────────────────────────────────────
  const afterSuccess = () => {
    closeModal();
    if (onRefresh) onRefresh();
    else window.location.reload();
  };

  // ── modal helpers ────────────────────────────────────────────────────────────
  const openModal = (type, asset = null, transfer = null) => {
    setModal({ type, asset, transfer });
    setActionData({ comments: "", clarification_reason: "", transfer_comments: "", error: "" });
  };
  const closeModal = () => setModal(null);
  const setModalError = (msg) => setActionData(p => ({ ...p, error: msg }));

  const isLoading = (id) => !!actionLoading[id];

  // ── individual asset accept ──────────────────────────────────────────────────
  const handleAccept = async () => {
    const asset = modal.asset;
    setActionLoading(p => ({ ...p, [asset.id]: true }));
    setModalError("");
    try {
      await assetService.accept({ asset_id: asset.id, comments: actionData.comments || undefined });
      afterSuccess();
    } catch (err) {
      setModalError(err.response?.data?.error ?? "Failed to accept asset.");
    } finally {
      setActionLoading(p => ({ ...p, [asset.id]: false }));
    }
  };

  // ── clarification request ────────────────────────────────────────────────────
  const handleClarification = async () => {
    const asset = modal.asset;
    setActionLoading(p => ({ ...p, [asset.id]: true }));
    setModalError("");
    try {
      await assetService.requestClarification({ asset_id: asset.id, reason: actionData.clarification_reason });
      afterSuccess();
    } catch (err) {
      setModalError(err.response?.data?.error ?? "Failed to request clarification.");
    } finally {
      setActionLoading(p => ({ ...p, [asset.id]: false }));
    }
  };

  // ── transfer accept / reject ─────────────────────────────────────────────────
  const handleTransferAction = async (accepted) => {
    const transfer = modal.transfer;
    setActionLoading(p => ({ ...p, [transfer.id]: true }));
    setModalError("");
    try {
      await transferService.respond(transfer.id, {
        accepted,
        reason: actionData.transfer_comments || undefined,
      });
      afterSuccess();
    } catch (err) {
      setModalError(err.response?.data?.error ?? "Failed to process transfer.");
    } finally {
      setActionLoading(p => ({ ...p, [transfer.id]: false }));
    }
  };

  const onModalSubmit = () => {
    if (!modal) return;
    if      (modal.type === "accept")        handleAccept();
    else if (modal.type === "clarification") handleClarification();
    else if (modal.type === "approve")       handleTransferAction(true);
    else if (modal.type === "reject")        handleTransferAction(false);
  };

  const modalIsLoading =
    (modal?.asset    && isLoading(modal.asset.id)) ||
    (modal?.transfer && isLoading(modal.transfer.id));

  const pendingCount = handovers.length + looseAssets.length + pendingTransfers.length;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Action Modal ──────────────────────────────────────────────────── */}
      {modal && (
        <ActionModal
          modal={modal}
          actionData={actionData}
          setActionData={setActionData}
          onClose={closeModal}
          onSubmit={onModalSubmit}
          isLoading={modalIsLoading}
          darkMode={darkMode}
        />
      )}

      {/* ── Pending Transfers ─────────────────────────────────────────────── */}
      {pendingTransfers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={15} className="text-amber-500" />
            <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-almet-cloud-burst"}`}>
              Pending Transfers ({pendingTransfers.length})
            </h3>
          </div>
          {pendingTransfers.map(transfer => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              onAction={(tr, type) => openModal(type, tr.asset, tr)}
              isLoading={isLoading(transfer.id)}
              darkMode={darkMode}
            />
          ))}
        </section>
      )}

      {/* ── Pending Handovers (Tehvil Aktları) ────────────────────────────── */}
      {handovers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={15} className="text-almet-sapphire" />
            <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-almet-cloud-burst"}`}>
              Pending Handovers ({handovers.length})
            </h3>
          </div>
          {handovers.map(handover => (
            <HandoverCard
              key={handover.id}
              handover={handover}
              onAccept={afterSuccess}
              darkMode={darkMode}
            />
          ))}
        </section>
      )}

      {/* ── Loose ASSIGNED assets (no handover) ───────────────────────────── */}
      {looseAssets.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-orange-500" />
            <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-almet-cloud-burst"}`}>
              Awaiting Acceptance ({looseAssets.length})
            </h3>
          </div>
          {looseAssets.map(asset => (
            <LooseAssetCard
              key={asset.id}
              asset={asset}
              onAction={(a, type) => openModal(type, a)}
              isLoading={isLoading(asset.id)}
              darkMode={darkMode}
            />
          ))}
        </section>
      )}

      {/* ── In-Use Assets ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-almet-sapphire" />
          <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-almet-cloud-burst"}`}>
            In Use ({inUseAssets.length})
          </h3>
        </div>
        {inUseAssets.length === 0 ? (
          <div className={`rounded-lg p-5 text-center border ${darkMode ? "bg-almet-comet/30 border-almet-comet" : "bg-almet-mystic/50 border-gray-200"}`}>
            <Package size={24} className={`mx-auto mb-2 ${darkMode ? "text-almet-bali-hai" : "text-almet-bali-hai"} opacity-40`} />
            <p className={`text-xs font-semibold ${darkMode ? "text-white" : "text-almet-cloud-burst"}`}>No assets in use</p>
            <p className={`text-[11px] mt-0.5 ${darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai"}`}>
              {pendingCount > 0 ? "Accept the pending items above to see them here." : "No assets assigned to this employee."}
            </p>
          </div>
        ) : (
          inUseAssets.map(asset => (
            <LooseAssetCard
              key={asset.id}
              asset={asset}
              onAction={(a, type) => openModal(type, a)}
              isLoading={isLoading(asset.id)}
              darkMode={darkMode}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default EmployeeAssetManagement;
