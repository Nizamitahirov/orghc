// components/policy/PDFViewer.jsx
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, FileText, Eye, Download,
  CheckCircle, X, Loader2, User, Clock,
  MessageSquare, PenLine,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import {
  trackPolicyDownload, acknowledgePolicy,
  getPoliciesByFolder, getPolicyAcknowledgments,
} from "@/services/policyService";
import SignaturePad from "@/components/common/SignaturePad";
import PDFSignatureOverlay from "@/components/policy/PDFSignatureOverlay";

// ─────────────────────────────────────────────────────────────────────────────
// PolicyAcknowledgmentsList
// ─────────────────────────────────────────────────────────────────────────────
function PolicyAcknowledgmentsList({ policyId, darkMode }) {
  const [acks,    setAcks]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => { load(); }, [policyId]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getPolicyAcknowledgments(policyId);
      const res  = data?.results || [];
      setAcks(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Failed to load acknowledgments");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
    : "N/A";

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
    </div>
  );

  if (error) return (
    <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900/20 border border-red-800 text-red-400" : "bg-red-50 border border-red-200 text-red-700"}`}>
      <p className="text-sm">{error}</p>
    </div>
  );

  if (!acks.length) return (
    <div className={`text-center py-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p className="text-sm">No acknowledgments yet</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {acks.map((ack) => (
        <div key={ack.id}
          className={`rounded-xl border p-4 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"}`}>
              <User className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Name + badge */}
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {ack.employee_name || "Unknown"}
                  </h4>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    {ack.employee_id || "N/A"} · {ack.employee_email || "—"}
                  </p>
                </div>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${darkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                  <CheckCircle className="w-3 h-3" /> Acknowledged
                </span>
              </div>

              {/* Timestamp */}
              <div className={`flex items-center gap-1 text-xs mb-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                <Clock className="w-3 h-3" /> {fmt(ack.acknowledged_at)}
              </div>

              {/* Signature thumbnail */}
              {ack.signature_base64 && (
                <div className={`mt-2 p-2 rounded-lg border ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-[10px] mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Digital signature · {ack.signature_method || "—"}
                  </p>
                  <img src={ack.signature_base64} alt="sig" className="max-h-10 object-contain" />
                </div>
              )}

              {/* Notes */}
              {ack.notes && (
                <div className={`mt-3 p-3 rounded-lg ${darkMode ? "bg-gray-900/50 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{ack.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PDFViewer
// ─────────────────────────────────────────────────────────────────────────────
export default function PDFViewer({
  selectedPolicy, selectedFolder, selectedCompany, darkMode, onBack,
}) {
  const { showSuccess, showError } = useToast();

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeTab,      setActiveTab]      = useState("document");
  const [policy,         setPolicy]         = useState(selectedPolicy);
  const [hasAcknowledged,setHasAcknowledged]= useState(false);
  const [checkingAck,    setCheckingAck]    = useState(false);
  const [showReadPrompt, setShowReadPrompt] = useState(false);
  const [hasReachedEnd,  setHasReachedEnd]  = useState(false);

  // Acknowledge notes step
  const [showNotesStep,  setShowNotesStep]  = useState(false);
  const [pendingNotes,   setPendingNotes]   = useState("");

  // Signature flow
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [overlayMode,      setOverlayMode]      = useState(false);
  const [pendingSig,       setPendingSig]        = useState(null);
  const [submitting,       setSubmitting]        = useState(false);
  const pendingMeta = useRef({ method: "draw", signedAt: null });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const refreshPolicy = async () => {
    try {
      const data = await getPoliciesByFolder(selectedFolder.id);
      const up   = data.find(p => p.id === policy.id);
      if (up) setPolicy(up);
    } catch { /* silent */ }
  };

  const getPDFUrl = () => {
    const url = policy.policy_url || policy.policy_file;
    if (!url) return null;
    if (url.includes("drive.google.com") || url.includes("docs.google.com"))
      return url.includes("?") ? `${url}&output=embed` : `${url}?output=embed`;
    return url;
  };

  const pdfUrl = getPDFUrl();

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { refreshPolicy(); }, [selectedPolicy.id]);

  useEffect(() => {
    if (!policy.requires_acknowledgment) return;
    const check = async () => {
      setCheckingAck(true);
      try {
        const email = localStorage.getItem("user_email");
        if (!email) return;
        const data = await getPolicyAcknowledgments(policy.id);
        const list = Array.isArray(data?.results) ? data.results : [];
        setHasAcknowledged(list.some(a => a.employee_email === email));
      } catch { /* silent */ } finally { setCheckingAck(false); }
    };
    check();
  }, [policy.id, policy.requires_acknowledgment]);

  useEffect(() => {
    if (!policy.requires_acknowledgment || hasAcknowledged) return;
    const t = setTimeout(() => {
      if (!hasReachedEnd) { setHasReachedEnd(true); setShowReadPrompt(true); }
    }, 30000);
    return () => clearTimeout(t);
  }, [policy.requires_acknowledgment, hasAcknowledged, hasReachedEnd]);

  // ── Signature flow ────────────────────────────────────────────────────────
  const handleSignaturePadConfirm = ({ signatureBase64, method, signedAt }) => {
    setShowSignaturePad(false);
    setPendingSig(signatureBase64);
    pendingMeta.current = { method, signedAt };
    setOverlayMode(true);
  };

  const handleOverlayConfirm = async ({ signatureBase64, normalised, position }) => {
    setOverlayMode(false);
    setSubmitting(true);
    try {
      await acknowledgePolicy(policy.id, pendingNotes, {
        signature_base64:   signatureBase64 || pendingSig,
        signature_method:   pendingMeta.current.method,
        signed_at:          pendingMeta.current.signedAt,
        normalised,
        signature_position: position,
      });
      showSuccess("Policy acknowledged & signed!");
      setPendingNotes("");
      setPendingSig(null);
      setHasAcknowledged(true);
      await refreshPolicy();
    } catch (err) {
      console.error("Acknowledge error:", err);
      showError(
        err?.data?.error ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to acknowledge policy"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelSignFlow = () => {
    setShowSignaturePad(false);
    setOverlayMode(false);
    setPendingSig(null);
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      await trackPolicyDownload(policy.id);
      const a = Object.assign(document.createElement("a"), {
        href: policy.policy_url || policy.policy_file,
        download: `${policy.title}.pdf`,
        target: "_blank",
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showSuccess("Download started!");
      await refreshPolicy();
    } catch { showError("Failed to download policy"); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0
        ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>

        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all
              ${darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${darkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{policy.title}</h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {selectedCompany.name} · {selectedFolder.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className={`flex border rounded-lg overflow-hidden
            ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
            {["document", ...(policy.requires_acknowledgment ? ["acknowledgments"] : [])].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 text-xs font-medium capitalize transition-colors
                  ${activeTab === t
                    ? darkMode ? "bg-blue-600 text-white" : "bg-white text-blue-600 shadow-sm"
                    : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs
            ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{policy.view_count || 0}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{policy.download_count || 0}</span>
          </div>

          {/* Acknowledge & Sign */}
          {policy.requires_acknowledgment && (
            <button
onClick={() => { if (!hasAcknowledged) setShowNotesStep(true); }}
              disabled={hasAcknowledged || checkingAck || submitting}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                ${hasAcknowledged
                  ? darkMode ? "bg-green-900/30 text-green-400 cursor-not-allowed" : "bg-green-100 text-green-700 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"}`}>
              {checkingAck || submitting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <PenLine className="w-3.5 h-3.5" />}
              {hasAcknowledged ? "Acknowledged" : "Acknowledge & Sign"}
            </button>
          )}

          {/* Download */}
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className={`flex-1 overflow-hidden ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        {activeTab === "document" ? (
          <div className="relative w-full h-full">
            {pdfUrl ? (
              <>
                <iframe src={pdfUrl} className="w-full h-full border-0" title={policy.title} loading="lazy" />

                {/* Read-complete floating prompt */}
                {showReadPrompt && !hasAcknowledged && policy.requires_acknowledgment && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div className={`rounded-xl shadow-2xl p-4 border-2 max-w-md
                      ${darkMode ? "bg-gray-800 border-green-600 text-white" : "bg-white border-green-500 text-gray-900"}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-500 text-white flex-shrink-0">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Ready to Acknowledge?</h4>
                          <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            You've spent enough time reviewing this policy. Please sign & acknowledge it.
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => { setShowReadPrompt(false); setShowNotesStep(true); }}
                              className="flex-1 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">
                              Sign & Acknowledge
                            </button>
                            <button onClick={() => setShowReadPrompt(false)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg
                                ${darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                              Later
                            </button>
                          </div>
                        </div>
                        <button onClick={() => setShowReadPrompt(false)}
                          className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`flex items-center justify-center h-full ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">PDF file not available</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className={`text-lg font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Policy Acknowledgments
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Employees who have acknowledged this policy
              </p>
              <PolicyAcknowledgmentsList policyId={policy.id} darkMode={darkMode} />
            </div>
          </div>
        )}
      </div>

      {/* ── Step 1: Notes modal ──────────────────────────────────────────── */}
      {showNotesStep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl p-6 shadow-2xl
            ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Acknowledge Policy
              </h3>
              <button onClick={() => setShowNotesStep(false)}
                className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              By acknowledging, you confirm you've read and understood this policy.
            </p>

            <div className={`p-3 rounded-lg mb-4 ${darkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"}`}>
              <p className={`text-sm font-medium ${darkMode ? "text-blue-300" : "text-blue-900"}`}>{policy.title}</p>
            </div>

            <label className={`block text-xs font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Notes (Optional)
            </label>
            <textarea rows={3} value={pendingNotes} onChange={e => setPendingNotes(e.target.value)}
              placeholder="Add any comments or questions…"
              className={`w-full px-3 py-2 text-sm rounded-lg border mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${darkMode ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                           : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"}`} />

            <div className="flex gap-2">
              <button onClick={() => setShowNotesStep(false)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all
                  ${darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                Cancel
              </button>
              <button onClick={() => { setShowNotesStep(false); setShowSignaturePad(true); }}
                className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-all">
                <PenLine className="w-4 h-4" /> Continue to Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Signature Pad ─────────────────────────────────────────── */}
      {showSignaturePad && (
        <SignaturePad
          darkMode={darkMode}
          employeeName={localStorage.getItem("user_name") || ""}
          documentName={policy.title}
          onConfirm={handleSignaturePadConfirm}
          onCancel={cancelSignFlow}
        />
      )}

      {/* ── Step 3: PDF + Signature Overlay ──────────────────────────────── */}
      {overlayMode && pendingSig && pdfUrl && (
        <PDFSignatureOverlay
          pdfUrl={pdfUrl}
          signatureBase64={pendingSig}
          darkMode={darkMode}
          onConfirm={handleOverlayConfirm}
          onCancel={cancelSignFlow}
        />
      )}
    </div>
  );
}