import React from 'react';
import { X, Download } from 'lucide-react';

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
  if (!show || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className={`${bgCard} rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border ${borderColor}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b ${borderColor}`}>
          <h3 className={`text-base font-bold ${textPrimary}`}>PDF Viewer</h3>
          <div className="flex items-center gap-1.5">
            <a
              href={pdfUrl}
              download
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
        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
          {/* Loading State */}
          <div className="absolute inset-0 flex items-center justify-center" id="pdf-loader">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-almet-sapphire border-t-transparent mb-3"></div>
              <p className={`${textSecondary} text-sm`}>Loading PDF...</p>
            </div>
          </div>

          {/* PDF Iframe */}
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-full"
            title="PDF Viewer"
            onLoad={(e) => {
              const loader = document.getElementById('pdf-loader');
              if (loader) {
                loader.style.display = 'none';
              }
            }}
            onError={(e) => {
              const loader = document.getElementById('pdf-loader');
              if (loader) {
                loader.innerHTML = `
                  <div class="text-center">
                    <svg class="mx-auto mb-3 text-red-500" width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <p class="${textSecondary} text-sm">Failed to load PDF</p>
                    <p class="${textMuted} text-xs mt-1">Please try downloading the file instead</p>
                  </div>
                `;
              }
            }}
          />
        </div>

        {/* Footer - Tips */}
        <div className={`px-3 py-2 border-t ${borderColor} ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs ${textMuted}`}>
              💡 Tip: Use the toolbar above to zoom, navigate pages, or download the file
            </p>
            <button
              onClick={onClose}
              className={`text-xs ${textSecondary} hover:${textPrimary} font-medium`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;