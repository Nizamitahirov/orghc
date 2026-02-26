
// ─────────────────────────────────────────────────────────────
// components/bonus/main/BonusTable.jsx
// Şəkildəki cədvəl: Badge | Emp | Pos | Yearly Salary | ...
// ─────────────────────────────────────────────────────────────
"use client";
import { useState } from "react";
import { bonusRecordService } from "@/services/bonusService";
import { Calculator, FileText } from "lucide-react";

export default function BonusTable({ records, loading, dark, onRowClick, onRecordUpdate, bonusYear }) {
  const [editingSalary, setEditingSalary] = useState(null); // record id
  const [salaryForm, setSalaryForm]       = useState({});
  const [saving, setSaving]               = useState(null);

  const text    = dark ? "text-white"    : "text-gray-900";
  const sub     = dark ? "text-gray-400" : "text-gray-500";
  const headBg  = dark ? "bg-[#0f0f0f] text-gray-400" : "bg-gray-50 text-gray-500";
  const rowHov  = dark ? "hover:bg-[#0f0f0f]" : "hover:bg-gray-50";
  const border  = dark ? "border-[#1f1f1f]" : "border-gray-200";
  const inputCls= dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white text-right"
    : "bg-white border-gray-300 text-gray-900 text-right";

  const statusBadge = (status) => {
    const map = {
      DRAFT:      "bg-gray-500/20 text-gray-400",
      CALCULATED: "bg-blue-500/20 text-blue-400",
      APPROVED:   "bg-green-500/20 text-green-400",
      PAID:       "bg-purple-500/20 text-purple-400",
    };
    return `px-2 py-0.5 rounded text-xs font-medium ${map[status] || "bg-gray-500/20 text-gray-400"}`;
  };

  const startEdit = (record) => {
    setEditingSalary(record.id);
    setSalaryForm({
      yearly_salary: record.yearly_salary || "",
      worked_months: record.worked_months || 12,
      adjusted_yearly_salary: record.adjusted_yearly_salary || "",
    });
  };

  const handleSalaryUpdate = async (record) => {
    setSaving(record.id);
    try {
      await bonusRecordService.setSalary(record.id, salaryForm);
      setEditingSalary(null);
      onRecordUpdate();
    } finally {
      setSaving(null);
    }
  };

  const handleUseAdjusted = async (record) => {
    setSaving(record.id);
    try {
      await bonusRecordService.setSalary(record.id, {
        adjusted_yearly_salary: record.adjusted_yearly_salary,
        use_adjusted_salary: true,
      });
      onRecordUpdate();
    } finally {
      setSaving(null);
    }
  };

  const handleCalculate = async (record, e) => {
    e.stopPropagation();
    setSaving(record.id);
    try {
      await bonusRecordService.calculate(record.id);
      onRecordUpdate();
    } finally {
      setSaving(null);
    }
  };

  const handlePdf = async (record, e) => {
    e.stopPropagation();
    const { data } = await bonusRecordService.exportPdf(record.id);
    const { downloadBlob } = await import("@/services/bonusService");
    downloadBlob(data, `bonus_${record.employee_id_code}.pdf`);
  };

  const fmt = (v) =>
    v ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`${headBg} border-b ${border}`}>
            {["Badge","Employee","Pos","Yearly Salary","Worked Months","Prorata Salary","Adjusted Salary","Effective","Company","Objectives","Competencies","Total Bonus","Status","Actions"].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left font-medium text-xs whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const isEditing = editingSalary === record.id;
            const isSaving  = saving === record.id;

            return (
              <tr
                key={record.id}
                className={`border-b ${border} ${rowHov} cursor-pointer transition`}
                onClick={() => !isEditing && onRowClick(record)}
              >
                {/* Badge */}
                <td className={`px-3 py-2 font-mono text-xs ${sub} whitespace-nowrap`}>
                  {record.employee_id_code}
                </td>
                {/* Employee */}
                <td className={`px-3 py-2 whitespace-nowrap ${text}`}>
                  {record.employee_name}
                </td>
                {/* Position */}
                <td className={`px-3 py-2 text-xs ${sub} whitespace-nowrap`}>
                  {record.position}
                </td>

                {/* Yearly Salary */}
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={salaryForm.yearly_salary}
                      onChange={(e) => setSalaryForm({ ...salaryForm, yearly_salary: e.target.value })}
                      className={`w-28 px-2 py-1 rounded border text-xs outline-none ${inputCls}`}
                    />
                  ) : (
                    <span
                      className={`${text} cursor-text`}
                      onDoubleClick={() => startEdit(record)}
                      title="Double-click to edit"
                    >
                      {fmt(record.yearly_salary)}
                      {record.yearly_salary_manual && (
                        <span className="ml-1 text-xs text-yellow-400">*</span>
                      )}
                    </span>
                  )}
                </td>

                {/* Worked Months */}
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <input
                      type="number" min={0} max={12} step={0.5}
                      value={salaryForm.worked_months}
                      onChange={(e) => setSalaryForm({ ...salaryForm, worked_months: e.target.value })}
                      className={`w-16 px-2 py-1 rounded border text-xs outline-none ${inputCls}`}
                    />
                  ) : (
                    <span className={text}>{record.worked_months}</span>
                  )}
                </td>

                {/* Prorata */}
                <td className={`px-3 py-2 text-right ${text} whitespace-nowrap`}>
                  <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-xs">
                    {fmt(record.prorata_salary)}
                  </span>
                </td>

                {/* Adjusted Salary */}
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={salaryForm.adjusted_yearly_salary}
                      onChange={(e) => setSalaryForm({ ...salaryForm, adjusted_yearly_salary: e.target.value })}
                      className={`w-28 px-2 py-1 rounded border text-xs outline-none ${inputCls}`}
                    />
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${sub}`}>
                        {fmt(record.adjusted_yearly_salary) || "—"}
                      </span>
                      {record.adjusted_yearly_salary && !record.use_adjusted_salary && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUseAdjusted(record); }}
                          className="px-1.5 py-0.5 rounded text-xs bg-blue-600/20 text-blue-400
                            hover:bg-blue-600/40 whitespace-nowrap transition"
                        >
                          Use as yearly
                        </button>
                      )}
                      {record.use_adjusted_salary && (
                        <span className="text-xs text-green-400">✓ Applied</span>
                      )}
                    </div>
                  )}
                </td>

                {/* Effective */}
                <td className={`px-3 py-2 text-right text-xs font-medium whitespace-nowrap
                  ${record.use_adjusted_salary ? "text-green-400" : text}`}>
                  {fmt(record.effective_salary)}
                </td>

                {/* Company bonus */}
                <td className={`px-3 py-2 text-right text-xs ${text} whitespace-nowrap`}>
                  {fmt(record.company_targets_bonus)}
                </td>
                {/* Objectives */}
                <td className={`px-3 py-2 text-right text-xs ${text} whitespace-nowrap`}>
                  {fmt(record.objectives_bonus)}
                </td>
                {/* Competencies */}
                <td className={`px-3 py-2 text-right text-xs ${text} whitespace-nowrap`}>
                  {fmt(record.competencies_bonus)}
                </td>
                {/* Total */}
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <span className="font-semibold text-green-400 text-sm">
                    {fmt(record.total_bonus)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-2">
                  <span className={statusBadge(record.status)}>{record.status}</span>
                </td>

                {/* Actions */}
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSalaryUpdate(record)}
                          disabled={isSaving}
                          className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700
                            text-white disabled:opacity-50"
                        >
                          {isSaving ? "…" : "Apply"}
                        </button>
                        <button
                          onClick={() => setEditingSalary(null)}
                          className={`px-2 py-1 text-xs rounded border
                            ${dark ? "border-[#2a2a2a] text-gray-400" : "border-gray-300 text-gray-500"}`}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleCalculate(record, e)}
                          disabled={isSaving || bonusYear?.is_locked}
                          title="Calculate"
                          className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400 disabled:opacity-40"
                        >
                          <Calculator size={13} />
                        </button>
                        <button
                          onClick={(e) => handlePdf(record, e)}
                          title="Export PDF"
                          className={`p-1.5 rounded hover:bg-gray-500/10 ${sub}`}
                        >
                          <FileText size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {records.length === 0 && (
            <tr>
              <td colSpan={14} className={`text-center py-16 ${sub}`}>
                No records. Click "Initialize" to create records for all active employees.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


