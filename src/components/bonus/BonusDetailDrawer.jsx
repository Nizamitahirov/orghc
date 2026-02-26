// ─────────────────────────────────────────────────────────────
// components/bonus/main/BonusDetailDrawer.jsx
// Sağdan açılan drawer: breakdown detail + approve + PDF
// ─────────────────────────────────────────────────────────────
"use client";
import { useState, useEffect } from "react";
import { bonusRecordService, downloadBlob } from "@/services/bonusService";
import { X, Download, CheckCircle } from "lucide-react";

export default function BonusDetailDrawer({ recordId, dark, onClose, onUpdate }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  const text = dark ? "text-white"    : "text-gray-900";
  const sub  = dark ? "text-gray-400" : "text-gray-500";
  const bg   = dark ? "bg-[#111111] border-[#1f1f1f]" : "bg-white border-gray-200";
  const sect = dark ? "bg-[#0f0f0f] border-[#1a1a1a]" : "bg-gray-50 border-gray-200";

  useEffect(() => {
    bonusRecordService.detail(recordId)
      .then(({ data }) => setRecord(data))
      .finally(() => setLoading(false));
  }, [recordId]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await bonusRecordService.approve(recordId);
      const { data } = await bonusRecordService.detail(recordId);
      setRecord(data);
      onUpdate();
    } finally {
      setApproving(false);
    }
  };

  const handlePdf = async () => {
    const { data } = await bonusRecordService.exportPdf(recordId);
    downloadBlob(data, `bonus_${record?.employee_id_code}.pdf`);
  };

  const fmt = (v) =>
    v ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";

  const BreakdownTable = ({ title, rows, cols }) => (
    <div className="mb-4">
      <h4 className={`text-xs font-semibold mb-2 ${sub}`}>{title}</h4>
      <div className={`rounded-lg border overflow-hidden ${sect}`}>
        <table className="w-full text-xs">
          <thead>
            <tr className={`border-b ${dark ? "border-[#1f1f1f]" : "border-gray-200"}`}>
              {cols.map((c) => (
                <th key={c.key}
                  className={`px-3 py-2 text-left font-medium ${sub} ${c.right ? "text-right" : ""}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b ${dark ? "border-[#1a1a1a]" : "border-gray-100"}`}>
                {cols.map((c) => (
                  <td key={c.key}
                    className={`px-3 py-2 ${text} ${c.right ? "text-right" : ""}`}>
                    {c.fmt ? c.fmt(row[c.key]) : row[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className={`w-full max-w-xl overflow-y-auto border-l ${bg}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : record ? (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className={`text-base font-semibold ${text}`}>{record.employee_name}</h2>
                <p className={`text-xs ${sub} mt-0.5`}>
                  {record.employee_id_code} · {record.position}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePdf}
                  className={`p-1.5 rounded hover:bg-gray-500/10 ${sub} hover:text-white transition`}>
                  <Download size={15} />
                </button>
                <button onClick={onClose}
                  className={`p-1.5 rounded hover:bg-gray-500/10 ${sub} hover:text-white transition`}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Salary summary */}
            <div className={`rounded-lg border p-4 mb-4 grid grid-cols-2 gap-2 ${sect}`}>
              {[
                ["Yearly Salary",    fmt(record.yearly_salary)],
                ["Worked Months",    record.worked_months],
                ["Prorata Salary",   fmt(record.prorata_salary)],
                ["Adjusted Salary",  fmt(record.adjusted_yearly_salary)],
                ["Effective Salary", fmt(record.effective_salary)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className={`text-xs ${sub}`}>{label}</p>
                  <p className={`text-sm font-medium ${text}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Company Targets Breakdown */}
            <BreakdownTable
              title={`Company Targets Bonus: ${fmt(record.company_targets_bonus)}`}
              rows={record.company_targets_breakdown || []}
              cols={[
                { key: "target_name",    label: "Target" },
                { key: "weight_pct",     label: "Weight", right: true, fmt: (v) => `${v}%` },
                { key: "rating_name",    label: "Rating" },
                { key: "bonus_amount",   label: "Bonus", right: true, fmt: fmt },
              ]}
            />

            {/* Objectives Breakdown */}
            <BreakdownTable
              title={`Objectives Bonus: ${fmt(record.objectives_bonus)}`}
              rows={record.objectives_breakdown || []}
              cols={[
                { key: "title",              label: "Objective" },
                { key: "original_weight",    label: "Orig W", right: true, fmt: (v) => `${v}%` },
                { key: "adjusted_weight_pct",label: "Adj W",  right: true, fmt: (v) => `${parseFloat(v).toFixed(1)}%` },
                { key: "rating_name",        label: "Rating" },
                { key: "bonus_amount",       label: "Bonus",  right: true, fmt: fmt },
              ]}
            />

            {/* Competencies Breakdown */}
            <BreakdownTable
              title={`Competencies Bonus: ${fmt(record.competencies_bonus)}`}
              rows={record.competencies_breakdown || []}
              cols={[
                { key: "group_name",       label: "Group" },
                { key: "weight_pct",       label: "Weight", right: true, fmt: (v) => `${v}%` },
                { key: "group_percentage", label: "Score%", right: true, fmt: (v) => `${parseFloat(v).toFixed(1)}%` },
                { key: "rating_name",      label: "Rating" },
                { key: "bonus_amount",     label: "Bonus",  right: true, fmt: fmt },
              ]}
            />

            {/* Total + Approve */}
            <div className={`rounded-lg border p-4 ${sect}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${text}`}>Total Bonus</span>
                <span className="text-xl font-bold text-green-400">{fmt(record.total_bonus)} ₼</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs ${sub}`}>Status: {record.status}</span>
                {record.status === "CALCULATED" && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      bg-green-600 hover:bg-green-700 text-white text-xs font-medium
                      disabled:opacity-50"
                  >
                    <CheckCircle size={13} />
                    {approving ? "Approving…" : "Approve"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full text-sm ${sub}`}>
            Record not found
          </div>
        )}
      </div>
    </div>
  );
}