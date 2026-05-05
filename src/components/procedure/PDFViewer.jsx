// PDFViewer.jsx
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import {
  trackProcedureDownload,
  getProceduresByFolder,
} from "@/services/procedureService";

export default function PDFViewer({
  selectedProcedure,
  selectedFolder,
  selectedCompany,
  darkMode,
  onBack,
}) {
  const { showSuccess, showError } = useToast();

  const [procedure, setProcedure] = useState(selectedProcedure);
  const [blobUrl,   setBlobUrl]   = useState(null);
  const [pdfState,  setPdfState]  = useState('idle'); // idle | loading | ready | error
  const blobRef = useRef(null);

  useEffect(() => {
    const refreshProcedureData = async () => {
      try {
        const data = await getProceduresByFolder(selectedFolder.id);
        const updatedProcedure = data.find(p => p.id === selectedProcedure.id);
        if (updatedProcedure) {
          setProcedure(updatedProcedure);
        }
      } catch (err) {
        console.error('Error refreshing procedure data:', err);
      }
    };
    
    refreshProcedureData();
  }, [selectedProcedure.id, selectedFolder.id]);

  const getPDFUrl = () => {
    const url = procedure.procedure_url || procedure.procedure_file;
    if (!url) return null;
    
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      return url.includes('?') ? `${url}&output=embed` : `${url}?output=embed`;
    }
    
    return url;
  };

  const handleDownloadPDF = async () => {
    try {
      await trackProcedureDownload(procedure.id);
      
      const link = document.createElement("a");
      link.href = procedure.procedure_url || procedure.procedure_file;
      link.download = `${procedure.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess("Download started!");
      
      const data = await getProceduresByFolder(selectedFolder.id);
      const updatedProcedure = data.find(p => p.id === procedure.id);
      if (updatedProcedure) {
        setProcedure(updatedProcedure);
      }
    } catch (err) {
      console.error('Error downloading:', err);
      showError("Failed to download procedure");
    }
  };

  const pdfUrl = getPDFUrl();

  useEffect(() => {
    if (!pdfUrl) { setPdfState('error'); return; }
    if (pdfUrl.includes('docs.google.com') || pdfUrl.includes('drive.google.com')) {
      setBlobUrl(null); setPdfState('ready'); return;
    }
    setPdfState('loading');
    setBlobUrl(null);
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    fetch(pdfUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
      .then(blob => {
        if (cancelled) return;
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setBlobUrl(url); setPdfState('ready');
      })
      .catch(() => { if (!cancelled) setPdfState('error'); });
    return () => { cancelled = true; };
  }, [procedure.id]);

  useEffect(() => () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}>
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
              darkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-all`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {procedure.title}
              </h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {selectedCompany.name} • {selectedFolder.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
          }`}>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{procedure.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{procedure.download_count || 0}</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        {pdfState === 'loading' && (
          <div className="text-center">
            <Loader2 className={`mx-auto mb-3 h-10 w-10 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading PDF…</p>
          </div>
        )}
        {pdfState === 'error' && (
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-3">Cannot display PDF in browser.</p>
            <button onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        )}
        {pdfState === 'ready' && (
          <iframe
            src={blobUrl || pdfUrl}
            className="w-full h-full border-0"
            title={procedure.title}
          />
        )}
      </div>
    </div>
  );
}