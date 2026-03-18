import { useState, useRef, useEffect, useCallback } from "react";
import {
  PenTool, Type, Upload, RotateCcw, Check, X, ChevronDown
} from "lucide-react";




// ── Canvas Tab ────────────────────────────────────────────────────────────────
function CanvasTab({ darkMode, onSig }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current = getPos(e, canvasRef.current);
  };

  const move = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = darkMode ? "#60a5fa" : "#1e3a5f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    last.current = pos;
    setHasStrokes(true);
  };

  const end = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    onSig(null);
  };

  const confirm = () => {
    if (!hasStrokes) return;
    onSig(canvasRef.current.toDataURL("image/png"));
  };

  return (
    <div className="space-y-3">
      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        Draw your signature below
      </p>
      <div className={`relative rounded-xl border-2 border-dashed overflow-hidden
        ${darkMode ? "border-gray-600 bg-gray-900" : "border-gray-300 bg-gray-50"}`}>
        <canvas
          ref={canvasRef}
          width={480} height={160}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={start} onMouseMove={move}
          onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
        {!hasStrokes && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none
            ${darkMode ? "text-gray-600" : "text-gray-300"}`}>
            <span className="text-sm">Sign here…</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={clear}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
            ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
          <RotateCcw size={13} /> Clear
        </button>
        <button onClick={confirm} disabled={!hasStrokes}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
            bg-almet-sapphire hover:bg-almet-astral text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <Check size={13} /> Use This Signature
        </button>
      </div>
    </div>
  );
}


// ── Upload Tab ────────────────────────────────────────────────────────────────
function UploadTab({ darkMode, onSig }) {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${darkMode ? "border-gray-600 hover:border-almet-sapphire bg-gray-900 text-gray-400"
                     : "border-gray-300 hover:border-almet-sapphire bg-gray-50 text-gray-500"}`}>
        <Upload size={24} className="mx-auto mb-2 opacity-60" />
        <p className="text-xs">Click to upload signature image</p>
        <p className="text-[10px] mt-1 opacity-60">PNG, JPG — transparent background preferred</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {preview && (
        <>
          <div className={`rounded-xl border-2 border-dashed overflow-hidden p-4 flex items-center justify-center
            ${darkMode ? "border-gray-600 bg-gray-900" : "border-gray-300 bg-gray-50"}`}>
            <img src={preview} alt="Signature preview" className="max-h-24 object-contain" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setPreview(null); inputRef.current.value = ""; }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
              <RotateCcw size={13} /> Clear
            </button>
            <button onClick={() => onSig(preview)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                bg-almet-sapphire hover:bg-almet-astral text-white transition-all">
              <Check size={13} /> Use This Signature
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main SignaturePad ─────────────────────────────────────────────────────────
export default function SignaturePad({
  darkMode = false,
  employeeName = "",
  documentName = "",
  onConfirm,   // ({ signatureBase64, method, signedAt }) => void
  onCancel,
}) {
  const [tab, setTab] = useState("draw");
  const [sig, setSig] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const tabs = [
    { id: "draw",   label: "Draw",   icon: <PenTool size={13} /> },
    { id: "upload", label: "Upload", icon: <Upload size={13} /> },
  ];

  const handleConfirm = () => {
    if (!sig) return;
    setConfirmed(true);
    onConfirm?.({
      signatureBase64: sig,
      method: tab,
      signedAt: new Date().toISOString(),
      employeeName,
      documentName,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden
        ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>

        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between
          ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div>
            <h3 className={`font-bold text-sm ${darkMode ? "text-white" : "text-almet-cloud-burst"}`}>
              Sign Document
            </h3>
            {documentName && (
              <p className={`text-[10px] mt-0.5 ${darkMode ? "text-gray-400" : "text-almet-waterloo"}`}>
                {documentName}
              </p>
            )}
          </div>
          <button onClick={onCancel}
            className={`p-1.5 rounded-lg transition-all ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className={`flex border-b ${darkMode ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSig(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-all
                ${tab === t.id
                  ? "border-almet-sapphire text-almet-sapphire"
                  : `border-transparent ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5">
          {tab === "draw"   && <CanvasTab  darkMode={darkMode} onSig={setSig} />}
          {tab === "upload" && <UploadTab  darkMode={darkMode} onSig={setSig} />}

          {/* Signature preview after selection */}
          {sig && (
            <div className={`mt-4 p-3 rounded-xl border-2 border-green-500/50
              ${darkMode ? "bg-green-900/10" : "bg-green-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Check size={13} className="text-green-500" />
                <span className="text-xs font-medium text-green-600">Signature captured</span>
              </div>
              <img src={sig} alt="Your signature" className="max-h-16 object-contain" />
            </div>
          )}
        </div>

        {/* Legal note + actions */}
        <div className={`px-5 pb-5 space-y-3`}>
          <p className={`text-[10px] leading-relaxed ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            By clicking <strong>Sign & Confirm</strong> you agree that this electronic signature is
            legally equivalent to your handwritten signature.
          </p>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all
                ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={!sig || confirmed}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                bg-almet-sapphire hover:bg-almet-astral text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {confirmed ? <><Check size={13} /> Signed!</> : <><PenTool size={13} /> Sign & Confirm</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}