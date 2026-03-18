import { useState, useRef, useCallback } from "react";
import { Check, X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Split layout:
 *  LEFT  — real PDF iframe (native scroll, full pages visible)
 *  RIGHT — positioning panel: mini page grid, drag-free % picker
 */
export default function PDFSignatureOverlay({
  pdfUrl          = "",
  signatureBase64 = null,
  pageCount       = 1,
  onConfirm,
  onCancel,
  darkMode        = false,
}) {
  // Position as percentage of page (0-100)
  const [page,    setPage]    = useState(pageCount);        // which page (1-based)
  const [xPct,    setXPct]    = useState(60);               // % from left
  const [yPct,    setYPct]    = useState(80);               // % from top of selected page
  const [sigW,    setSigW]    = useState(30);               // % width of page
  const [opacity, setOpacity] = useState(0.9);

  // Drag state on mini preview
  const previewRef  = useRef(null);
  const dragging    = useRef(false);
  const dragStart   = useRef({ mx: 0, my: 0, sx: 0, sy: 0 });

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const onPreviewMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: xPct, sy: yPct };

    const move = (ev) => {
      if (!dragging.current) return;
      const el   = previewRef.current;
      if (!el)   return;
      const rect = el.getBoundingClientRect();
      const nx   = clamp(((ev.clientX - rect.left) / rect.width)  * 100, 0, 100);
      const ny   = clamp(((ev.clientY - rect.top)  / rect.height) * 100, 0, 100);
      setXPct(Math.round(nx));
      setYPct(Math.round(ny));
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
  }, [xPct, yPct]);

  // Click on preview → set position instantly
  const onPreviewClick = useCallback((e) => {
    const el   = previewRef.current;
    if (!el)   return;
    const rect = el.getBoundingClientRect();
    setXPct(Math.round(clamp(((e.clientX - rect.left) / rect.width)  * 100, 0, 95)));
    setYPct(Math.round(clamp(((e.clientY - rect.top)  / rect.height) * 100, 0, 95)));
  }, []);

  const confirm = () => {
    // Convert to normalised 0-1 across entire document
    // y_norm = (page-1)/pageCount + yPct/100/pageCount
    const xNorm = xPct  / 100;
    const yNorm = (page - 1) / pageCount + (yPct / 100) / pageCount;
    const wNorm = sigW  / 100;
    const hNorm = (sigW * 0.4) / 100; // approx aspect ratio

    onConfirm?.({
      signatureBase64,
      normalised: { x: xNorm, y: yNorm, w: wNorm, h: hNorm },
      position:   { page, xPct, yPct, sigW, opacity },   // ← this is the `position` key
    });
  };

  const embedUrl = (() => {
    if (!pdfUrl) return null;
    if (pdfUrl.includes("drive.google.com") || pdfUrl.includes("docs.google.com"))
      return pdfUrl.includes("?") ? `${pdfUrl}&output=embed` : `${pdfUrl}?output=embed`;
    return pdfUrl;
  })();

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const dark = darkMode;
  const bg   = dark ? "bg-gray-900" : "bg-gray-50";
  const card = dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const txt  = dark ? "text-white"  : "text-gray-900";
  const muted= dark ? "text-gray-400" : "text-gray-500";
  const btn  = dark ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${bg}`}>

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0 ${card} border-b`}>
        <span className={`text-sm font-semibold ${txt}`}>Place Signature</span>
        <div className="flex items-center gap-2">
          <button onClick={onCancel}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${btn}`}>
            <X size={13} /> Cancel
          </button>
          <button onClick={confirm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-all">
            <Check size={13} /> Confirm & Sign
          </button>
        </div>
      </div>

      {/* ── Body: PDF left | Controls right ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden gap-0">

        {/* LEFT — full PDF viewer, native browser scroll */}
        <div className="flex-1 overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="PDF"
              className="w-full h-full border-0"
              style={{ display: "block" }}
            />
          ) : (
            <div className={`flex items-center justify-center h-full ${muted}`}>
              <p className="text-sm">No PDF available</p>
            </div>
          )}
        </div>

        {/* RIGHT — positioning panel */}
        <div className={`w-72 flex flex-col border-l overflow-y-auto ${card} flex-shrink-0`}>
          <div className="p-4 space-y-5">

            {/* Title */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${muted}`}>
                Signature Position
              </h3>
              <p className={`text-[10px] ${muted}`}>
                Click or drag on the mini preview to place signature
              </p>
            </div>

            {/* Page selector */}
            {pageCount > 1 && (
              <div>
                <label className={`text-xs font-semibold mb-2 block ${txt}`}>Page</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`p-1.5 rounded-lg transition-all disabled:opacity-30 ${btn}`}>
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex gap-1.5 flex-wrap flex-1">
                    {pages.map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`flex-1 min-w-[28px] py-1 rounded-lg text-xs font-semibold transition-all
                          ${page === p
                            ? "bg-almet-sapphire text-white"
                            : btn}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                    className={`p-1.5 rounded-lg transition-all disabled:opacity-30 ${btn}`}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Mini page preview — click/drag to position */}
            <div>
              <label className={`text-xs font-semibold mb-2 block ${txt}`}>
                Position on page {page}
              </label>
<div
  ref={previewRef}
  onClick={onPreviewClick}
  onMouseDown={onPreviewMouseDown}
  className={`relative rounded-lg border-2 cursor-crosshair select-none
    ${dark ? "border-gray-600 bg-gray-900" : "border-gray-300 bg-gray-100"}`}
  style={{ aspectRatio: "1 / 1.414", width: "100%" }}
>
                {/* Grid lines */}
                {[25, 50, 75].map(v => (
                  <div key={`h${v}`} style={{ position:"absolute", top:`${v}%`, left:0, right:0, borderTop:"1px dashed", opacity:0.15 }} />
                ))}
                {[25, 50, 75].map(v => (
                  <div key={`v${v}`} style={{ position:"absolute", left:`${v}%`, top:0, bottom:0, borderLeft:"1px dashed", opacity:0.15 }} />
                ))}

                {/* Signature preview */}
                {signatureBase64 && (
  <div style={{
    position:  "absolute",
    left:      `${Math.min(xPct, 100 - sigW/2)}%`,
    top:       `${Math.min(yPct, 95)}%`,
    width:     `${sigW}%`,
    transform: "translate(-50%, -50%)",
    opacity,
  }}>
                    <img src={signatureBase64} alt="sig" draggable={false}
                      className="w-full object-contain drop-shadow-md" />
                    {/* Border indicator */}
                    <div className="absolute inset-0 border-2 border-dashed border-blue-500/70 rounded pointer-events-none" />
                  </div>
                )}

                {/* Crosshair */}
                <div style={{ position:"absolute", left:`${xPct}%`, top:`${yPct}%`,
                  transform:"translate(-50%,-50%)", pointerEvents:"none" }}>
                  <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-500/30" />
                </div>

                {/* Coords badge */}
                <div className={`absolute bottom-1 right-1 text-[8px] px-1.5 py-0.5 rounded font-mono
                  ${dark ? "bg-gray-800/80 text-gray-300" : "bg-white/80 text-gray-600"}`}>
                  {xPct}% · {yPct}%
                </div>
              </div>
            </div>

            {/* Size slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold ${txt}`}>Signature Size</label>
                <span className={`text-[10px] font-mono ${muted}`}>{sigW}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSigW(w => Math.max(10, w - 5))}
                  className={`p-1 rounded transition-all ${btn}`}><ZoomOut size={12} /></button>
                <input type="range" min="10" max="60" step="1"
                  value={sigW} onChange={e => setSigW(parseInt(e.target.value))}
                  className="flex-1 h-1 accent-blue-600" />
                <button onClick={() => setSigW(w => Math.min(60, w + 5))}
                  className={`p-1 rounded transition-all ${btn}`}><ZoomIn size={12} /></button>
              </div>
            </div>

            {/* Opacity slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold ${txt}`}>Opacity</label>
                <span className={`text-[10px] font-mono ${muted}`}>{Math.round(opacity * 100)}%</span>
              </div>
              <input type="range" min="0.3" max="1" step="0.05"
                value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))}
                className="w-full h-1 accent-blue-600" />
            </div>

            {/* Reset */}
            <button onClick={() => { setXPct(60); setYPct(80); setSigW(30); setOpacity(0.9); setPage(pageCount); }}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${btn}`}>
              <RotateCcw size={12} /> Reset
            </button>

            {/* Summary */}
            <div className={`rounded-lg p-3 text-[10px] space-y-1 border
              ${dark ? "bg-gray-900 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
              <div className="flex justify-between"><span>Page</span><span className="font-semibold">{page} / {pageCount}</span></div>
              <div className="flex justify-between"><span>Position</span><span className="font-semibold">{xPct}% · {yPct}%</span></div>
              <div className="flex justify-between"><span>Size</span><span className="font-semibold">{sigW}% of page width</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}