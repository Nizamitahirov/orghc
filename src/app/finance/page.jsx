// pages/finance/index.jsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import FinanceReportViewer from "@/components/finance/FinanceReportViewer";


export default function FinancePage() {
  const [reports, setReports]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [detail, setDetail]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const fileRef                     = useRef();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeService.getReports();
      const data = res.data;
      setReports(Array.isArray(data) ? data : (data.results ?? []));
    } catch { setError("Reports yüklənmədi."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const openReport = async (id) => {
    setSelected(id);
    setDetail(null);
    try {
      const res = await financeService.getReportDetail(id);
      setDetail(res.data);
    } catch { setError("Report açılmadı."); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Yalnız .xlsx və .xls formatı qəbul edilir.");
      return;
    }
    setUploading(true);
    setProgress(0);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", file.name.replace(/\.(xlsx|xls)$/i, ""));
    try {
      const res = await financeService.uploadReport(fd, setProgress);
      setReports(prev => [{ id: res.data.id, name: res.data.name, uploaded_at: res.data.uploaded_at, sheet_count: res.data.sheets?.length || 0 }, ...prev]);
      openReport(res.data.id);
    } catch { setError("Upload xətası baş verdi."); }
    finally { setUploading(false); setProgress(0); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Bu reportu silmək istəyirsiniz?")) return;
    try {
      await financeService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      if (selected === id) { setSelected(null); setDetail(null); }
    } catch { setError("Silmək mümkün olmadı."); }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, []);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "#f4f6f9", fontFamily: "Inter, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: 280, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3c5e", marginBottom: 10 }}>📊 Finance Reports</div>

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "#1a3c5e" : "#cbd5e1"}`,
              borderRadius: 8,
              padding: "14px 8px",
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              background: dragOver ? "#eef2ff" : "#f8fafc",
              transition: "all 0.2s",
            }}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={e => handleUpload(e.target.files[0])} />
            {uploading ? (
              <>
                <div style={{ fontSize: 10, color: "#1a3c5e", marginBottom: 6 }}>Yüklənir... {progress}%</div>
                <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "#1a3c5e", borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 18 }}>📁</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>Excel sürükləyin və ya klikləyin</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>.xlsx / .xls</div>
              </>
            )}
          </div>

          {error && <div style={{ marginTop: 8, fontSize: 10, color: "#dc2626", background: "#fef2f2", padding: "6px 8px", borderRadius: 6 }}>{error}</div>}
        </div>

        {/* Report list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {loading ? (
            <div style={{ padding: 16, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>Yüklənir...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>Hələ report yoxdur</div>
          ) : reports.map(r => (
            <div
              key={r.id}
              onClick={() => openReport(r.id)}
              style={{
                padding: "9px 14px",
                cursor: "pointer",
                borderLeft: `3px solid ${selected === r.id ? "#1a3c5e" : "transparent"}`,
                background: selected === r.id ? "#eef2ff" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                transition: "all 0.15s",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>
                  {r.sheet_count} sheet · {new Date(r.uploaded_at).toLocaleDateString("az-AZ", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
              <button
                onClick={e => handleDelete(r.id, e)}
                style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 12, padding: 2, lineHeight: 1 }}
                title="Sil"
              >✕</button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {!selected ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ fontSize: 13, marginTop: 12 }}>Sol tərəfdən report seçin və ya yeni Excel yükləyin</div>
          </div>
        ) : !detail ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 12 }}>
            Yüklənir...
          </div>
        ) : (
          <FinanceReportViewer report={detail} />
        )}
      </main>
    </div>
  );
}