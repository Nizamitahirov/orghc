// src/utils/download.js
// Single, DRY utility for all file download operations.
// Previously copy-pasted in api.js at lines 201, 672 and 846.

/**
 * Trigger a browser file download from a Blob or Response object.
 *
 * @param {Blob} blob        - The file data
 * @param {string} filename  - Suggested filename for the download dialog
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Extract a filename from a Content-Disposition header.
 * Falls back to the provided `fallback` if the header is absent.
 *
 * @param {string|null} contentDisposition
 * @param {string}      fallback
 * @returns {string}
 */
export function extractFilename(contentDisposition, fallback = 'download') {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i);
  return match ? decodeURIComponent(match[1].trim()) : fallback;
}

/**
 * Convenience: download an axios response that contains a Blob.
 *
 * Usage:
 *   const response = await api.get('/export', { responseType: 'blob' });
 *   downloadAxiosBlob(response, 'report.xlsx');
 *
 * @param {import('axios').AxiosResponse} response
 * @param {string}                        fallbackFilename
 */
export function downloadAxiosBlob(response, fallbackFilename = 'download') {
  const disposition = response.headers?.['content-disposition'];
  const filename    = extractFilename(disposition, fallbackFilename);
  downloadBlob(response.data, filename);
}
