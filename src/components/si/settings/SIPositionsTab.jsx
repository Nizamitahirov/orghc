// ═══════════════════════════════════════════════════════
// src/components/si/settings/SIPositionsTab.jsx
// ═══════════════════════════════════════════════════════
"use client";
import { useState, useEffect } from "react";
import { siPositionService, siConfigService } from "@/services/siService";
import { useToast } from "@/components/common/Toast";
import { Plus, Trash2, Users, RefreshCw } from "lucide-react";

export default function SIPositionsTab({ dark, config }) {
  const { showSuccess, showError } = useToast();
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newPos,    setNewPos]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [loadingEmp, setLoadingEmp] = useState(false);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white placeholder-gray-700 focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire";

  const load = () =>
    siPositionService.list(config.id)
      .then(({ data }) => setPositions(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => showError("Failed to load positions"));

  const loadEmp = () => {
    setLoadingEmp(true);
    siConfigService.eligibleEmployees(config.id)
      .then(({ data }) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingEmp(false));
  };

  useEffect(() => { load(); loadEmp(); }, [config.id]);

  const handleAdd = async () => {
    if (!newPos.trim()) return;
    setSaving(true);
    try {
      await siPositionService.create({ company_config: config.id, position_name: newPos.trim() });
      setNewPos("");
      await load();
      loadEmp();
      showSuccess("Position added.");
    } catch (e) {
      showError(e.response?.data ? JSON.stringify(e.response.data) : "Failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    setDeleting(id);
    try {
      await siPositionService.delete(id);
      await load();
      loadEmp();
      showSuccess("Position removed.");
    } catch { showError("Failed to delete."); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${dark ? "bg-sky-500/10 border border-sky-500/20" : "bg-sky-50 border border-sky-200"}`}>
          <Users size={18} className="text-sky-400" />
        </div>
        <div>
          <h2 className={`text-base font-bold ${text}`}>Eligible Positions</h2>
          <p className={`text-xs mt-1 ${sub}`}>
            Job title keywords — matched with <code>contains</code> on employee job titles.
          </p>
        </div>
      </div>

      {/* Add input */}
      <div className="flex gap-2 mb-5">
        <input value={newPos} onChange={e => setNewPos(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder='e.g. "Sales Representative"'
          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition ${inp}`} />
        <button onClick={handleAdd} disabled={saving || !newPos.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold disabled:opacity-50 transition shadow-sm">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Position list */}
      <div className="space-y-2 mb-6">
        {positions.length === 0 && (
          <p className={`text-sm text-center py-8 ${muted}`}>No positions yet.</p>
        )}
        {positions.map(p => (
          <div key={p.id}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl border
              ${dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-gray-50 border-gray-200"}`}>
            <span className={`text-sm font-semibold ${text}`}>{p.position_name}</span>
            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-40
                ${dark ? "text-gray-600 hover:text-rose-400 hover:bg-rose-500/10"
                       : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Eligible employees preview */}
      <div className={`rounded-xl border overflow-hidden
        ${dark ? "border-[#1e1e1e]" : "border-gray-200"}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b
          ${dark ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${text}`}>Matched Employees</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
              ${dark ? "bg-almet-sapphire/15 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
              {employees.length}
            </span>
          </div>
          <button onClick={loadEmp} disabled={loadingEmp}
            className={`flex items-center gap-1 text-xs font-semibold transition
              ${dark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-almet-sapphire"}`}>
            <RefreshCw size={11} className={loadingEmp ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        {employees.length === 0 ? (
          <p className={`text-center py-8 text-xs ${muted}`}>
            {positions.length === 0 ? "Add positions to see matched employees" : "No employees matched"}
          </p>
        ) : (
          <div className="divide-y divide-inherit">
            {employees.map(e => (
              <div key={e.id} className={`flex items-center justify-between px-4 py-2.5
                ${dark ? "divide-[#1e1e1e]" : "divide-gray-100"}`}>
                <div>
                  <p className={`text-sm font-semibold ${text}`}>{e.full_name}</p>
                  <p className={`text-xs ${sub}`}>{e.job_title || "—"}</p>
                </div>
                <span className={`text-xs font-bold tabular-nums ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
                  £{parseFloat(e.monthly_salary || 0).toLocaleString("en", { minimumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



