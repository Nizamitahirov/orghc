"use client";
import { useState, useCallback, useRef } from "react";
import {
  X, Upload, FileText, CheckCircle2, XCircle, Loader2,
  Trash2, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Zap,
} from "lucide-react";
import { bulkCreatePolicies, validatePDFFile } from "@/services/policyService";
import { useToast } from "@/components/common/Toast";

// ── Helpers ───────────────────────────────────────────────────────────────────
const toTitle = (filename) =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// ── Status icon ───────────────────────────────────────────────────────────────
const StatusIcon = ({ status, darkMode }) => {
  if (status === "uploading") return <Loader2 className="w-4 h-4 animate-spin text-almet-sapphire" />;
  if (status === "success")   return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "error")     return <XCircle className="w-4 h-4 text-red-500" />;
  return <FileText className={`w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />;
};

// ── Component ─────────────────────────────────────────────────────────────────
// Generic — used for both policies (default) and procedures (pass bulkFn/validateFn/entityName)
export default function BulkPolicyUploadModal({
  folderId,
  folderName,
  darkMode,
  onClose,
  onSuccess,
  bulkFn       = bulkCreatePolicies,
  validateFn   = validatePDFFile,
  entityName   = "Policy",
  showAckToggle = true,           // procedures don't have requires_acknowledgment
}) {
  const { showSuccess, showError, showWarning } = useToast();
  const inputRef = useRef(null);

  const [items, setItems]             = useState([]);   // {id, file, title, status, error}
  const [dragOver, setDragOver]       = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [httpProgress, setHttpProgress] = useState(0);  // 0–100 bytes sent
  const [requiresAck, setRequiresAck] = useState(true);
  const [expandedErrors, setExpandedErrors] = useState({});

  // ── File ingestion ────────────────────────────────────────────────────────
  const addFiles = useCallback((fileList) => {
    const pdfs = Array.from(fileList).filter((f) => {
      const v = validateFn(f);
      if (!v.valid) showWarning(`${f.name}: ${v.error}`);
      return v.valid;
    });
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.file.name + i.file.size));
      const fresh = pdfs
        .filter((f) => !seen.has(f.name + f.size))
        .map((f) => ({
          id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
          file: f,
          title: toTitle(f.name),
          status: "pending",
          error: null,
        }));
      return [...prev, ...fresh];
    });
  }, [showWarning, validateFn]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeItem    = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateTitle   = (id, t) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, title: t } : i));
  const resetFailed   = () => setItems((prev) => prev.map((i) => i.status === "error" ? { ...i, status: "pending", error: null } : i));

  // ── Upload — single bulk request ──────────────────────────────────────────
  const runUpload = async () => {
    const pending = items.filter((i) => i.status === "pending");
    if (!pending.length) { showWarning("No files ready to upload"); return; }

    setIsUploading(true);
    setHttpProgress(0);

    // Mark all pending as uploading simultaneously
    setItems((prev) => prev.map((i) => i.status === "pending" ? { ...i, status: "uploading" } : i));

    try {
      const files  = pending.map((i) => i.file);
      const titles = pending.map((i) => i.title || i.file.name);

      const result = await bulkFn(folderId, files, titles, requiresAck, setHttpProgress);

      // Map backend results → item statuses (match by filename)
      const byFilename = {};
      (result.results || []).forEach((r) => {
        // handle possible duplicates: prefer first success
        if (!byFilename[r.filename] || byFilename[r.filename].status !== "success") {
          byFilename[r.filename] = r;
        }
      });

      setItems((prev) =>
        prev.map((item) => {
          if (item.status !== "uploading") return item;
          const res = byFilename[item.file.name];
          if (!res) return { ...item, status: "error", error: "No response from server" };
          return res.status === "success"
            ? { ...item, status: "success", error: null }
            : { ...item, status: "error",   error: res.error || "Upload failed" };
        })
      );

      const { successful = 0, failed = 0 } = result.summary || {};
      if (successful > 0 && failed === 0) {
        showSuccess(`${successful} ${entityName.toLowerCase()}${successful > 1 ? "s" : ""} uploaded!`);
        onSuccess?.();
      } else if (successful > 0) {
        showWarning(`${successful} uploaded, ${failed} failed — fix errors and retry.`);
        onSuccess?.();
      } else {
        showError(`All ${failed} uploads failed.`);
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.detail || err?.message || "Upload failed";
      setItems((prev) =>
        prev.map((i) => i.status === "uploading" ? { ...i, status: "error", error: msg } : i)
      );
      showError(msg);
    } finally {
      setIsUploading(false);
      setHttpProgress(0);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const counts = items.reduce(
    (acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; },
    { pending: 0, uploading: 0, success: 0, error: 0 }
  );
  const uploadedAll = items.length > 0 && counts.pending === 0 && !isUploading;
  const totalSizeMB = items.reduce((s, i) => s + i.file.size, 0) / 1024 / 1024;

  // ── Styles ────────────────────────────────────────────────────────────────
  const card     = darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900";
  const muted    = darkMode ? "text-gray-400" : "text-gray-500";
  const inputCls = `w-full px-2.5 py-1.5 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40 ${
    darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
  }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-xl border shadow-2xl flex flex-col max-h-[90vh] ${card}`}>

        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-almet-sapphire" />
              Bulk Upload {entityName}s
            </h2>
            <p className={`text-xs mt-0.5 ${muted}`}>{folderName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Drop Zone ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`mx-6 mt-5 mb-3 flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none ${
            dragOver
              ? "border-almet-sapphire bg-almet-sapphire/10 scale-[1.01]"
              : darkMode
              ? "border-gray-600 hover:border-almet-sapphire/60 hover:bg-gray-700/30"
              : "border-gray-300 hover:border-almet-sapphire/50 hover:bg-gray-50"
          }`}
        >
          <div className={`p-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <Upload className="w-6 h-6 text-almet-sapphire" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              Drop multiple PDFs here, or{" "}
              <span className="text-almet-sapphire underline underline-offset-2">browse</span>
            </p>
            <p className={`text-xs mt-1 ${muted}`}>PDF only · max 10 MB each · all files sent in one request</p>
          </div>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden"
            onChange={(e) => addFiles(e.target.files)} />
        </div>

        {/* ── Options Row ── */}
        <div className="flex items-center justify-between px-6 pb-3">
          {showAckToggle ? (
            <label className={`flex items-center gap-2 text-sm cursor-pointer ${muted}`}>
              <input type="checkbox" checked={requiresAck} onChange={(e) => setRequiresAck(e.target.checked)}
                className="w-4 h-4 accent-almet-sapphire" />
              Requires acknowledgment for all files
            </label>
          ) : <span />}
          {counts.error > 0 && !isUploading && (
            <button onClick={resetFailed} className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600">
              <RefreshCw className="w-3.5 h-3.5" /> Retry failed ({counts.error})
            </button>
          )}
        </div>

        {/* ── File List ── */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2 min-h-[60px]">
          {items.length === 0 && (
            <p className={`text-center text-sm py-8 ${muted}`}>No files selected yet</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                item.status === "success"
                  ? darkMode ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"
                  : item.status === "error"
                  ? darkMode ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"
                  : item.status === "uploading"
                  ? darkMode ? "border-almet-sapphire/30 bg-almet-sapphire/5" : "border-almet-sapphire/20 bg-almet-mystic/30"
                  : darkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-200 bg-gray-50"
              }`}
            >
              <StatusIcon status={item.status} darkMode={darkMode} />

              <div className="flex-1 min-w-0">
                {item.status === "pending" ? (
                  <input value={item.title} onChange={(e) => updateTitle(item.id, e.target.value)}
                    className={inputCls} placeholder={`${entityName} title`} />
                ) : (
                  <p className="text-sm font-medium truncate">{item.title}</p>
                )}
                <div className={`flex items-center gap-2 mt-1 text-xs ${muted}`}>
                  <span className="truncate max-w-[200px]">{item.file.name}</span>
                  <span>·</span>
                  <span>{formatSize(item.file.size)}</span>
                </div>

                {item.status === "error" && item.error && (
                  <div className="mt-1">
                    <button
                      onClick={() => setExpandedErrors((p) => ({ ...p, [item.id]: !p[item.id] }))}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {expandedErrors[item.id] ? "Hide" : "Show"} error
                      {expandedErrors[item.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {expandedErrors[item.id] && (
                      <p className="mt-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">{item.error}</p>
                    )}
                  </div>
                )}
              </div>

              {item.status === "pending" && (
                <button onClick={() => removeItem(item.id)} title="Remove"
                  className={`p-1 rounded transition-all flex-shrink-0 ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"}`}>
                  <Trash2 className={`w-4 h-4 ${muted}`} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── HTTP progress bar ── */}
        {isUploading && (
          <div className="px-6 mt-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className={muted}>
                {httpProgress < 100
                  ? `Sending ${totalSizeMB.toFixed(1)} MB… ${httpProgress}%`
                  : "Processing on server…"}
              </span>
              <span className={muted}>{items.length} file{items.length > 1 ? "s" : ""}</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
              <div
                className={`h-full transition-all duration-300 ${httpProgress < 100 ? "bg-almet-sapphire" : "bg-emerald-500 animate-pulse"}`}
                style={{ width: `${httpProgress || 5}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className={`flex items-center justify-between gap-3 px-6 py-4 mt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <span className={`text-xs ${muted}`}>
            {items.length > 0
              ? `${items.length} file${items.length > 1 ? "s" : ""} · ${totalSizeMB.toFixed(1)} MB total`
              : "No files selected"}
            {counts.success > 0 && ` · ${counts.success} uploaded`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isUploading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-40 ${
                darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {uploadedAll ? "Close" : "Cancel"}
            </button>
            {!uploadedAll && (
              <button
                onClick={runUpload}
                disabled={isUploading || counts.pending === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-40 transition-all"
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="w-4 h-4" />
                    Upload {counts.pending > 0 ? `${counts.pending} File${counts.pending > 1 ? "s" : ""}` : ""}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
