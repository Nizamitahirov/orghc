"use client";
/**
 * EmployeeSalaryTable
 * Badge | Employee | Position | Yearly Salary | Worked Months | Prorata Salary | Adjusted Salary | Action
 * - Yearly Salary comes from salary API (or employee API fallback)
 * - All inputs editable inline
 * - "Use as yearly salary" button applies adjusted salary
 * - "Calculate →" button sends user to bonus calc tab for that employee
 */
import { useState, useEffect } from "react";
import { bonusRecordService, downloadBlob } from "@/services/bonusService";
import { salaryService } from "@/services/salaryService";
import { ChevronRight, RefreshCw, Calculator } from "lucide-react";

export default function EmployeeSalaryTable({
  records, loading, dark, bonusYear, onRecordUpdate, onOpenCalc,
}) {
  const [salaryMap, setSalaryMap]   = useState({});  // employee_id → yearly_salary from salary API
  const [editing, setEditing]       = useState(null); // record.id
  const [form, setForm]             = useState({});
  const [saving, setSaving]         = useState(null);
  const [initializing, setInit]     = useState(false);

  const text    = dark ? "text-white"    : "text-gray-900";
  const sub     = dark ? "text-gray-400" : "text-gray-500";
  const headBg  = dark ? "bg-[#0a0a0a] text-gray-500" : "bg-gray-50 text-gray-500";
  const rowHov  = dark ? "hover:bg-[#0d0d0d]" : "hover:bg-gray-50";
  const border  = dark ? "border-[#1f1f1f]" : "border-gray-200";
  const inputCls = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white focus:border-almet-steel-blue"
    : "bg-white border-gray-300 text-gray-900 focus:border-almet-sapphire";

  // Load salary data from salary API
  useEffect(() => {
    if (!records.length) return;
    salaryService.list().then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      const map = {};
      list.forEach((s) => {
        // salary API returns employee badge/id — match by employee_id_code
        map[s.employee_id || s.badge || s.employee] = s.yearly_salary || s.annual_salary || null;
      });
      setSalaryMap(map);
    }).catch(() => {}); // graceful — fall back to record values
  }, [records]);

  const handleInitialize = async () => {
    if (!bonusYear || !confirm("Create bonus records for all active employees?")) return;
    setInit(true);
    try {
      await bonusRecordService.initialize(bonusYear.id);
      onRecordUpdate();
    } finally {
      setInit(false);
    }
  };

  const startEdit = (record) => {
    setEditing(record.id);
    setForm({
      yearly_salary:          record.yearly_salary || salaryMap[record.employee_id_code] || "",
      worked_months:          record.worked_months || 12,
      adjusted_yearly_salary: record.adjusted_yearly_salary || "",
    });
  };

  const handleApply = async (record) => {
    setSaving(record.id);
    try {
      await bonusRecordService.setSalary(record.id, {
        yearly_salary:          form.yearly_salary !== "" ? form.yearly_salary : null,
        worked_months:          form.worked_months,
        adjusted_yearly_salary: form.adjusted_yearly_salary !== "" ? form.adjusted_yearly_salary : null,
      });
      setEditing(null);
      onRecordUpdate();
    } finally {
      setSaving(null);
    }
  };

  const handleUseAdjusted = async (record) => {
    setSaving(`adj-${record.id}`);
    try {
      await bonusRecordService.setSalary(record.id, {
        adjusted_yearly_salary: record.adjusted_yearly_salary,
        use_adjusted_salary:    true,
      });
      onRecordUpdate();
    } finally {
      setSaving(null);
    }
  };

  const fmt = (v) =>
    v != null && v !== ""
      ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";

  const statusDot = (status) => {
    const map = {
      DRAFT:      "bg-gray-400",
      CALCULATED: "bg-blue-400",
      APPROVED:   "bg-green-400",
      PAID:       "bg-purple-400",
    };
    return `w-2 h-2 rounded-full ${map[status] || "bg-gray-400"}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
      <p className={`text-sm ${sub}`}>Loading employees…</p>
    </div>
  );

  if (!records.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className={`p-4 rounded-2xl ${dark ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
        <Users size={32} className={sub} />
      </div>
      <div className="text-center">
        <p className={`text-sm font-medium ${text}`}>No employee records found</p>
        <p className={`text-xs mt-1 ${sub}`}>Click Initialize to create records for all active employees</p>
      </div>
      <button
        onClick={handleInitialize}
        disabled={initializing}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium disabled:opacity-50 transition"
      >
        <RefreshCw size={14} className={initializing ? "animate-spin" : ""} />
        {initializing ? "Initializing…" : "Initialize Records"}
      </button>
    </div>
  );

  return (
    <div>
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b ${border}`}>
        <p className={`text-xs ${sub}`}>
          {records.length} employees · double-click a row to edit salary
        </p>
        <button
          onClick={handleInitialize}
          disabled={initializing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition
            ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
            disabled:opacity-50`}
        >
          <RefreshCw size={12} className={initializing ? "animate-spin" : ""} />
          Sync / Re-initialize
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${headBg} border-b ${border} text-xs font-medium`}>
              {["Badge","Employee","Position",
                "Yearly Salary","Worked Months","Prorata Salary",
                "Adjusted Salary","Status","Action"].map((h) => (
                <th key={h} className={`px-4 py-3 text-left whitespace-nowrap ${h === "Prorata Salary" || h === "Adjusted Salary" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const isEditing = editing === record.id;
              const isSaving  = saving === record.id;
              // Yearly salary: record value OR salary API value
              const displaySalary = record.yearly_salary || salaryMap[record.employee_id_code];

              return (
                <tr
                  key={record.id}
                  className={`border-b ${border} ${rowHov} transition cursor-default`}
                  onDoubleClick={() => !isEditing && startEdit(record)}
                >
                  {/* Badge */}
                  <td className={`px-4 py-3 font-mono text-xs ${sub} whitespace-nowrap`}>
                    {record.employee_id_code}
                  </td>

                  {/* Employee */}
                  <td className={`px-4 py-3 font-medium whitespace-nowrap ${text}`}>
                    {record.employee_name}
                  </td>

                  {/* Position */}
                  <td className={`px-4 py-3 text-xs whitespace-nowrap`}>
                    <span className={`px-2 py-0.5 rounded-md font-medium
                      ${dark ? "bg-almet-cloud-burst/40 text-almet-bali-hai" : "bg-almet-mystic text-almet-sapphire"}`}>
                      {record.position || "—"}
                    </span>
                  </td>

                  {/* Yearly Salary */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={form.yearly_salary}
                        onChange={(e) => setForm({ ...form, yearly_salary: e.target.value })}
                        placeholder="Enter salary"
                        className={`w-32 px-2 py-1.5 rounded-lg border text-xs text-right outline-none transition ${inputCls}`}
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${text}`}>
                          {fmt(displaySalary)}
                        </span>
                        {record.yearly_salary_manual && (
                          <span className="text-xs text-yellow-400" title="Manually entered">✎</span>
                        )}
                        {!displaySalary && (
                          <span className={`text-xs ${sub}`}
                            title="Double-click to enter salary">
                            (double-click)
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Worked Months */}
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <input
                        type="number" min={0} max={12} step={0.5}
                        value={form.worked_months}
                        onChange={(e) => setForm({ ...form, worked_months: e.target.value })}
                        className={`w-16 px-2 py-1.5 rounded-lg border text-xs text-center outline-none transition ${inputCls}`}
                      />
                    ) : (
                      <span className={`font-medium ${text}`}>{record.worked_months}</span>
                    )}
                  </td>

                  {/* Prorata Salary */}
                  <td className="px-4 py-3 text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-semibold">
                      {fmt(record.prorata_salary)}
                    </span>
                  </td>

                  {/* Adjusted Salary */}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={form.adjusted_yearly_salary}
                        onChange={(e) => setForm({ ...form, adjusted_yearly_salary: e.target.value })}
                        placeholder="Optional"
                        className={`w-32 px-2 py-1.5 rounded-lg border text-xs text-right outline-none transition ${inputCls}`}
                      />
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        {record.adjusted_yearly_salary ? (
                          <>
                            <span className={`text-xs font-semibold ${text}`}>
                              {fmt(record.adjusted_yearly_salary)}
                            </span>
                            {record.use_adjusted_salary ? (
                              <span className="text-xs px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 font-medium">
                                ✓ Applied
                              </span>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUseAdjusted(record); }}
                                disabled={saving === `adj-${record.id}`}
                                className="text-xs px-2 py-0.5 rounded-md bg-almet-sapphire/20 text-almet-steel-blue hover:bg-almet-sapphire/40 transition whitespace-nowrap disabled:opacity-50"
                              >
                                Use as yearly
                              </button>
                            )}
                          </>
                        ) : (
                          <span className={`text-xs ${sub}`}>—</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={statusDot(record.status)} />
                      <span className={`text-xs ${sub}`}>{record.status}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApply(record)}
                          disabled={isSaving}
                          className="px-3 py-1.5 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-medium disabled:opacity-50 transition"
                        >
                          {isSaving ? "…" : "Apply"}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className={`px-2 py-1.5 rounded-lg border text-xs transition
                            ${dark ? "border-[#2a2a2a] text-gray-400" : "border-gray-300 text-gray-500"}`}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenCalc(record)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-almet-sapphire/10 hover:bg-almet-sapphire text-almet-steel-blue hover:text-white text-xs font-medium transition group"
                      >
                        <Calculator size={12} />
                        Calculate
                        <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}