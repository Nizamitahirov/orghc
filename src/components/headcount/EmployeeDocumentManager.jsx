// src/components/headcount/EmployeeDocumentManager.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import {
  FileText, Upload, Download, Trash2, Eye,
  AlertCircle, CheckCircle, X, Lock,
  File, FileCheck, Award, Briefcase, Heart,
  GraduationCap, Plus, Loader, PenLine,
} from "lucide-react";
import { apiService } from "@/services/api";
import SignaturePad from "@/components/common/SignaturePad";
import PDFSignatureOverlay from "@/components/policy/PDFSignatureOverlay";

// ─────────────────────────────────────────────────────────────────────────────

const EmployeeDocumentManager = ({ employeeId, employeeData, darkMode }) => {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // ── Upload modal ──────────────────────────────────────────────────────────
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading,       setUploading]       = useState(false);
  const [selectedFile,    setSelectedFile]    = useState(null);
  const [uploadForm, setUploadForm] = useState({
    document_name: "", document_type: "OTHER",
    description: "", expiry_date: "", is_confidential: false,
  });

  // ── PDF viewer ────────────────────────────────────────────────────────────
  const [viewDoc, setViewDoc] = useState(null); // doc object being viewed

  // ── Signature flow ────────────────────────────────────────────────────────
  const [signTarget,       setSignTarget]       = useState(null);   // doc being signed
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [overlayMode,      setOverlayMode]      = useState(false);
  const [pendingSig,       setPendingSig]        = useState(null);   // base64
  const [signingDoc,       setSigningDoc]        = useState(false);
  const pendingMeta = useRef({ method: "draw", signedAt: null });

  // ── Alerts ────────────────────────────────────────────────────────────────
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const bgCard       = darkMode ? "bg-almet-san-juan"   : "bg-white";
  const textPrimary  = darkMode ? "text-white"           : "text-almet-cloud-burst";
  const textSecondary= darkMode ? "text-almet-bali-hai"  : "text-almet-waterloo";
  const textMuted    = darkMode ? "text-almet-santas-gray": "text-almet-bali-hai";
  const borderColor  = darkMode ? "border-almet-comet"   : "border-gray-200";
  const btnPrimary   = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode
    ? "bg-almet-comet hover:bg-almet-san-juan text-almet-bali-hai"
    : "bg-white hover:bg-almet-mystic text-almet-waterloo border border-gray-300";
  const shadowClass  = darkMode ? "shadow-lg shadow-black/10" : "shadow-md";
  const bgAccent     = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";

  const documentTypes = [
    { value: "CONTRACT",    label: "Contract",           icon: <FileCheck size={16}/>, color: "blue"   },
    { value: "ID",          label: "ID Document",        icon: <File size={16}/>,      color: "purple" },
    { value: "CERTIFICATE", label: "Certificate",        icon: <Award size={16}/>,     color: "green"  },
    { value: "CV",          label: "CV/Resume",          icon: <Briefcase size={16}/>, color: "orange" },
    { value: "PERFORMANCE", label: "Performance Review", icon: <FileText size={16}/>,  color: "indigo" },
    { value: "MEDICAL",     label: "Medical",            icon: <Heart size={16}/>,     color: "red"    },
    { value: "TRAINING",    label: "Training",           icon: <GraduationCap size={16}/>, color: "teal"},
    { value: "OTHER",       label: "Other",              icon: <FileText size={16}/>,  color: "gray"   },
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getDocTypeInfo  = (t) => documentTypes.find(d => d.value === t) ?? documentTypes.at(-1);
  const formatFileSize  = (b) => !b ? "Unknown" : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
  const formatDate      = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "N/A";
  const isExpired       = (d) => d && new Date(d) < new Date();

  const notify = (type, msg) => {
    if (type === "error") setError(msg); else setSuccess(msg);
    setTimeout(() => { if (type === "error") setError(null); else setSuccess(null); }, 3000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await apiService.getEmployeeDocuments(employeeData?.employee_id);
      if (res.data.success) setDocuments(res.data.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeData?.employee_id) fetchDocuments();
  }, [employeeData?.employee_id]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("File size must be less than 10MB"); return; }
    setSelectedFile(file);
    setError(null);
    if (!uploadForm.document_name) {
      setUploadForm(p => ({ ...p, document_name: file.name.split(".").slice(0,-1).join(".") }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.document_name || !uploadForm.document_type) {
      setError("Please fill all required fields"); return;
    }
    try {
      setUploading(true);
      const res = await apiService.uploadEmployeeDocument({
        employee_id: employeeData.employee_id,
        document_file: selectedFile,
        ...uploadForm,
        expiry_date: uploadForm.expiry_date || null,
      });
      if (res.data.success) {
        notify("success", "Document uploaded successfully!");
        setShowUploadModal(false);
        resetUploadForm();
        fetchDocuments();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setUploadForm({ document_name:"", document_type:"OTHER", description:"", expiry_date:"", is_confidential:false });
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    try {
      const res = await apiService.deleteEmployeeDocument(doc.id);
      if (res.data.success) { notify("success", "Document deleted!"); fetchDocuments(); }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete document");
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async (doc) => {
  try {
    const isSigned = !!doc.signed_at;
    const isPDF = doc.mime_type === "application/pdf" || doc.document_file?.endsWith(".pdf");

    if (isSigned && isPDF) {
      // İmzalı PDF — backend embed edir
      await apiService.downloadSignedDocument(doc.id, `${doc.name}_signed.pdf`);
    } else {
      // İmzasız və ya PDF deyil — birbaşa endir
      const ext = doc.document_file.split(".").pop().toLowerCase();
      let fname = doc.name;
      if (!fname.toLowerCase().endsWith(`.${ext}`)) fname = `${fname}.${ext}`;
      await apiService.downloadEmployeeDocument(doc.document_file, fname);
    }
    notify("success", "Downloaded!");
  } catch {
    setError("Failed to download document");
  }
};

  // ── Sign flow ─────────────────────────────────────────────────────────────
  const openSignFlow = (doc) => {
  if (doc.signed_at) return; // guard
  setSignTarget(doc);
  setShowSignaturePad(true);
};

  const handleSignaturePadConfirm = ({ signatureBase64, method, signedAt }) => {
    setShowSignaturePad(false);
    setPendingSig(signatureBase64);
    pendingMeta.current = { method, signedAt };
    setOverlayMode(true);
  };

  const handleOverlayConfirm = async ({ signatureBase64, normalised, position }) => {
    if (!signTarget) return;
    setOverlayMode(false);
    setSigningDoc(true);
    try {
      const res = await apiService.signEmployeeDocument(signTarget.id, {
    signature_base64:   signatureBase64 || pendingSig,
    signature_method:   pendingMeta.current.method,
    signed_at:          pendingMeta.current.signedAt,
    normalised,
    signature_position: position,   // ← this comes from PDFSignatureOverlay
  });
      if (res.data.success) {
        notify("success", `"${signTarget.name}" signed successfully!`);
        fetchDocuments();
      } else {
        setError(res.data.error || "Failed to save signature");
      }
    } catch (err) {
      console.error("Sign error:", err);
      setError(
        err?.data?.error ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save signature"
      );
    } finally {
      setSigningDoc(false);
      setSignTarget(null);
      setPendingSig(null);
    }
  };

  const cancelSignFlow = () => {
    setShowSignaturePad(false);
    setOverlayMode(false);
    setPendingSig(null);
    setSignTarget(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader className="w-8 h-8 text-almet-sapphire animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-xs text-red-800 dark:text-red-200 font-medium">{error}</p>
          <button onClick={() => setError(null)}><X size={16} className="text-red-600" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-xs text-green-800 dark:text-green-200 font-medium">{success}</p>
          <button onClick={() => setSuccess(null)}><X size={16} className="text-green-600" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${textPrimary} font-semibold text-sm mb-1`}>Document Management</h3>
          <p className={`${textMuted} text-xs`}>
            {documents.length} {documents.length === 1 ? "document" : "documents"} uploaded
          </p>
        </div>
        <button onClick={() => setShowUploadModal(true)}
          className={`${btnPrimary} px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all`}>
          <Plus size={14} /> Upload Document
        </button>
      </div>

      {/* Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {documents.map((doc) => {
            const typeInfo = getDocTypeInfo(doc.document_type);
            const expired  = isExpired(doc.expiry_date);
            const isSigned = !!doc.signed_at;
            const isPDF    = doc.mime_type === "application/pdf" || doc.document_file?.endsWith(".pdf");

            return (
              <div key={doc.id}
                className={`${bgCard} rounded-xl border ${borderColor} p-3 hover:shadow-lg transition-all ${shadowClass} flex flex-col`}>

                {/* Card top */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30`}>
                    {typeInfo.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {isSigned && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-[9px] font-semibold text-green-700 dark:text-green-400">
                        <PenLine size={10} /> Signed
                      </span>
                    )}
                    {doc.is_confidential && (
                      <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded" title="Confidential">
                        <Lock size={12} className="text-red-600" />
                      </div>
                    )}
                    {expired && (
                      <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded" title="Expired">
                        <AlertCircle size={12} className="text-orange-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 mb-3">
                  <h4 className={`${textPrimary} font-semibold text-xs mb-1 line-clamp-2`}>{doc.name}</h4>
                  <p className={`${textMuted} text-[10px] mb-1`}>{typeInfo.label}</p>
                  {doc.description && (
                    <p className={`${textSecondary} text-[10px] line-clamp-2`}>{doc.description}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="space-y-1 mb-3">
                  {[
                    ["Size",     formatFileSize(doc.file_size)],
                    ["Uploaded", formatDate(doc.uploaded_at)],
                    ...(doc.expiry_date ? [["Expires", formatDate(doc.expiry_date)]] : []),
                    ...(isSigned        ? [["Signed",  formatDate(doc.signed_at)]]   : []),
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-[9px]">
                      <span className={textMuted}>{label}:</span>
                      <span className={
                        label === "Expires" && expired ? "text-red-600 font-semibold" :
                        label === "Signed"             ? "text-green-600 font-medium"  : textSecondary
                      }>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Signature thumbnail */}
                {isSigned && doc.signature_base64 && (
                  <div className={`mb-3 p-2 rounded-lg border ${darkMode ? "bg-gray-900/40 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                    <p className={`text-[9px] mb-1 ${textMuted}`}>Digital signature</p>
                    <img src={doc.signature_base64} alt="sig" className="max-h-8 object-contain" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1.5 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {/* View PDF */}
                  {isPDF && (
                    <button
                      onClick={() => setViewDoc(doc)}
                      className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all
                        ${darkMode ? "bg-blue-900/30 hover:bg-blue-900/50 text-blue-400" : "bg-blue-50 hover:bg-blue-100 text-blue-600"}`}
                      title="View PDF">
                      <Eye size={11} /> View
                    </button>
                  )}

                  {/* Download */}
                  <button onClick={() => handleDownload(doc)}
                    className={`${btnSecondary} flex-1 px-2 py-1.5 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition-all`}>
                    <Download size={11} /> Download
                  </button>

                  {/* Sign */}
                  <button
  onClick={() => openSignFlow(doc)}
  disabled={signingDoc || isSigned}
  title={isSigned ? "Document already signed" : "Sign document"}
  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all
    ${isSigned
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed opacity-70"
      : "bg-almet-sapphire/10 hover:bg-almet-sapphire/20 text-almet-sapphire"}`}>
  {signingDoc && signTarget?.id === doc.id
    ? <Loader size={11} className="animate-spin" />
    : <PenLine size={11} />}
  {isSigned ? "Signed" : "Sign"}
</button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(doc)}
                    className="px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 rounded text-[10px] font-medium flex items-center justify-center transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${bgAccent} rounded-lg p-8 text-center border ${borderColor}`}>
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <FileText size={24} className={textMuted} />
          </div>
          <h4 className={`text-sm font-semibold ${textPrimary} mb-2`}>No Documents Yet</h4>
          <p className={`${textMuted} text-xs mb-4`}>Upload documents to get started</p>
          <button onClick={() => setShowUploadModal(true)}
            className={`${btnPrimary} px-4 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-2`}>
            <Upload size={14} /> Upload First Document
          </button>
        </div>
      )}

      {/* ── Upload Modal ──────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl max-w-lg w-full ${shadowClass} border ${borderColor}`}>
            <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
              <h3 className={`${textPrimary} font-bold text-sm`}>Upload Document</h3>
              <button onClick={() => { setShowUploadModal(false); resetUploadForm(); setError(null); }}
                className={`${textMuted} hover:text-red-600 transition-colors`}><X size={18} /></button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* File */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Select File <span className="text-red-500">*</span>
                </label>
                <input type="file" onChange={handleFileSelect}
                  className={`w-full text-xs ${textPrimary} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-almet-sapphire file:text-white hover:file:bg-almet-astral`} />
                {selectedFile && (
                  <p className={`${textMuted} text-[10px] mt-1`}>
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={uploadForm.document_name}
                  onChange={e => setUploadForm(p => ({ ...p, document_name: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  placeholder="Enter document name" />
              </div>

              {/* Type */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select value={uploadForm.document_type}
                  onChange={e => setUploadForm(p => ({ ...p, document_type: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}>
                  {documentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>Description</label>
                <textarea rows={3} value={uploadForm.description}
                  onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  placeholder="Optional description" />
              </div>

              {/* Expiry */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>Expiry Date</label>
                <input type="date" value={uploadForm.expiry_date}
                  onChange={e => setUploadForm(p => ({ ...p, expiry_date: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`} />
              </div>

              {/* Confidential */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={uploadForm.is_confidential}
                  onChange={e => setUploadForm(p => ({ ...p, is_confidential: e.target.checked }))}
                  className="w-4 h-4 text-almet-sapphire focus:ring-almet-sapphire" />
                <span className={`${textPrimary} text-xs font-medium flex items-center gap-1.5`}>
                  <Lock size={13} /> Mark as Confidential
                </span>
              </label>
            </div>

            <div className={`flex gap-3 p-4 border-t ${borderColor}`}>
              <button onClick={() => { setShowUploadModal(false); resetUploadForm(); setError(null); }}
                className={`${btnSecondary} flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all`}>
                Cancel
              </button>
              <button onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadForm.document_name}
                className={`${btnPrimary} flex-1 px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}>
                {uploading
                  ? <><Loader size={14} className="animate-spin" /> Uploading…</>
                  : <><Upload size={14} /> Upload</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF Viewer Modal ──────────────────────────────────────────────── */}
      {viewDoc && (
        <PDFViewerModal
          doc={viewDoc}
          darkMode={darkMode}
          onClose={() => setViewDoc(null)}
          onSign={(doc) => { setViewDoc(null); openSignFlow(doc); }}
        />
      )}

      {/* ── Signature Pad ─────────────────────────────────────────────────── */}
      {showSignaturePad && signTarget && (
        <SignaturePad
          darkMode={darkMode}
          employeeName={employeeData?.full_name || ""}
          documentName={signTarget.name}
          onConfirm={handleSignaturePadConfirm}
          onCancel={cancelSignFlow}
        />
      )}

      {/* ── PDF + Signature Overlay ───────────────────────────────────────── */}
      {overlayMode && pendingSig && signTarget && (
        <PDFSignatureOverlay
          pdfUrl={signTarget.file_url || signTarget.document_file}
          signatureBase64={pendingSig}
          pageCount={signTarget.page_count || 1}
          darkMode={darkMode}
          onConfirm={handleOverlayConfirm}
          onCancel={cancelSignFlow}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline PDF Viewer Modal (no routing needed)
// ─────────────────────────────────────────────────────────────────────────────
function PDFViewerModal({ doc, darkMode, onClose, onSign }) {
  const url = doc.file_url || doc.document_file;

  // Google Drive embed fix
  const embedUrl = (() => {
    if (!url) return null;
    if (url.includes("drive.google.com") || url.includes("docs.google.com"))
      return url.includes("?") ? `${url}&output=embed` : `${url}?output=embed`;
    return url;
  })();

  const isSigned = !!doc.signed_at;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col z-50">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0
        ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${darkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.name}</h2>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {doc.document_type} {isSigned && "• Signed"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sign  */}
          <button
  onClick={() => !isSigned && onSign(doc)}
  disabled={isSigned}
  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
    ${isSigned
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed opacity-70"
      : "bg-almet-sapphire text-white hover:bg-almet-astral"}`}>
  <PenLine className="w-3.5 h-3.5" />
  {isSigned ? "Signed" : "Sign Document"}
</button>

          {/* Close */}
          <button onClick={onClose}
            className={`p-1.5 rounded-lg transition-all ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className={`flex-1 overflow-hidden ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        {embedUrl ? (
          <div className="relative w-full h-full">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              title={doc.name}
              loading="lazy"
            />
            {/* Signed badge overlay */}
            {isSigned && doc.signature_base64 && (
              <div className="absolute bottom-6 right-6 pointer-events-none">
                <div className={`rounded-xl border-2 border-green-500/60 p-3 shadow-2xl backdrop-blur-sm
                  ${darkMode ? "bg-gray-900/80" : "bg-white/90"}`}>
                  <p className={`text-[9px] font-semibold mb-1 ${darkMode ? "text-green-400" : "text-green-700"}`}>
                    DIGITALLY SIGNED
                  </p>
                  <img src={doc.signature_base64} alt="sig" className="max-h-10 max-w-[120px] object-contain" />
                  <p className={`text-[8px] mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {doc.signed_at ? new Date(doc.signed_at).toLocaleDateString("en-GB") : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">File not available for preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDocumentManager;