// ═══════════════════════════════════════════════════════
// Shared FormModal helper (həm bu faylda, həm digərlərində import)
// src/components/si/settings/FormModal.jsx
// ═══════════════════════════════════════════════════════
export function FormModal({ title, dark, onClose, onSave, saving, children }) {
  const text = dark ? "text-white" : "text-gray-900";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
        ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>
        <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
          <h3 className={`text-sm font-bold ${text}`}>{title}</h3>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">{children}</div>
        <div className={`flex justify-end gap-2 px-6 pb-6`}>
          <button onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
              ${dark ? "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05]"
                     : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-almet-sapphire/20">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}