import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Loader2, FileText } from 'lucide-react';

const PdfViewerModal = ({
  show,
  pdfUrl,
  onClose,
  darkMode,
  bgCard,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  const [blobUrl, setBlobUrl]       = useState(null);
  const [loadState, setLoadState]   = useState('idle'); // idle | loading | ready | error
  const blobRef = useRef(null);

  useEffect(() => {
    if (!show || !pdfUrl) return;

    // Google Drive/Docs embed URLs work natively
    if (pdfUrl.includes('docs.google.com') || pdfUrl.includes('drive.google.com')) {
      setBlobUrl(null);
      setLoadState('ready');
      return;
    }

    setLoadState('loading');
    setBlobUrl(null);
    let cancelled = false;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    fetch(pdfUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => {
        if (!res.ok) throw new Error('fetch failed');
        return res.blob();
      })
      .then(blob => {
        if (cancelled) return;
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setBlobUrl(url);
        setLoadState('ready');
      })
      .catch(() => { if (!cancelled) setLoadState('error'); });

    return () => { cancelled = true; };
  }, [show, pdfUrl]);

  useEffect(() => {
    return () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); };
  }, []);

  if (!show || !pdfUrl) return null;

  const iframeSrc = blobUrl || (pdfUrl.includes('google.com') ? pdfUrl : null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className={`${bgCard} rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border ${borderColor}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b ${borderColor}`}>
          <h3 className={`text-base font-bold ${textPrimary}`}>PDF Viewer</h3>
          <div className="flex items-center gap-1.5">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-medium"
            >
              <Download size={14} />
              Download
            </a>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          {loadState === 'loading' && (
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-almet-sapphire" />
              <p className={`${textSecondary} text-sm`}>Loading PDF…</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p className={`${textSecondary} text-sm mb-3`}>Cannot display PDF in browser.</p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          )}

          {loadState === 'ready' && iframeSrc && (
            <iframe
              src={iframeSrc}
              className="w-full h-full"
              title="PDF Viewer"
            />
          )}
        </div>

        {/* Footer */}
        <div className={`px-3 py-2 border-t ${borderColor} ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs ${textMuted}`}>
              💡 Tip: Use the toolbar to zoom, navigate pages, or download the file
            </p>
            <button onClick={onClose} className={`text-xs ${textSecondary} hover:${textPrimary} font-medium`}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
