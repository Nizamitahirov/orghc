"use client";
import { useState, useEffect, useCallback } from "react";
import { bonusRecordService } from "@/services/bonusService";
import { salaryService }      from "@/services/salaryService";
import { RefreshCw, Pencil, Check, X, Info, DollarSign } from "lucide-react";

export default function SalarySetupTab({ dark, bonusYear }) {
  const [records, setRecords]     = useState([]);
  const [salaryMap, setSalaryMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [initializing, setInit]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({});
  const [saving, setSaving]       = useState(null);

  const text    = dark ? "text-white"    : "text-gray-900";
  const sub     = dark ? "text-[#90a0b9]": "text-almet-comet";
  const border  = dark ? "border-[#1e2640]" : "border-gray-200";
  const rowHov  = dark ? "hover:bg-[#0f1526]" : "hover:bg-[#f8f9fc]";
  const headBg  = dark ? "bg-[#080b14] text-[#90a0b9]" : "bg-[#f5f7fb] text-almet-comet";
  const inputCls = dark
    ? "bg-[#131929] border-[#1e2640] text-white focus:border-almet-steel-blue"
    : "bg-white border-gray-200 text-gray-900 focus:border-almet-sapphire";

  const loadRecords = useCallback(async () => {
    if (!bonusYear) return;
    setLoading(true);
    try {
      const { data } = await bonusRecordService.list(bonusYear.id);
      setRecords(Array.isArray(data) ? data : (data.results ?? []));
    } finally {
      setLoading(false);
    }
  }, [bonusYear?.id]);

  useEffect(() => {
    salaryService.list().then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      const map = {};
      list.forEach((s) => {
        const key = s.employee_id || s.badge || s.employee_code;
        const val = s.yearly_salary ?? s.annual_salary ?? s.gross_yearly ?? null;
        if (key) map[key] = val;
      });
      setSalaryMap(map);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleInitialize = async () => {
    if (!bonusYear || !confirm("Create bonus records for all active employees?")) return;
    setInit(true);
    try {
      await bonusRecordService.initialize(bonusYear.id);
      loadRecords();
    } finally {
      setInit(false);
    }
  };

  const startEdit = (record) => {
    setEditing(record.id);
    setForm({
      yearly_salary:          record.yearly_salary ?? "",
      worked_months:          record.worked_months ?? 12,
      adjusted_yearly_salary: record.adjusted_yearly_salary ?? "",
    });
  };

  const cancelEdit = () => setEditing(null);

  const handleApply = async (record) => {
    setSaving(record.id);
    try {
      await bonusRecordService.setSalary(record.id, {
        yearly_salary:          form.yearly_salary !== "" ? parseFloat(form.yearly_salary) : null,
        worked_months:          parseFloat(form.worked_months),
        adjusted_yearly_salary: form.adjusted_yearly_salary !== "" ? parseFloat(form.adjusted_yearly_salary) : null,
      });
      setEditing(null);
      loadRecords();
    } finally {
      setSaving(null);
    }
  };

  const handleUseAdjusted = async (record) => {
    setSaving(`adj-${record.id}`);
    try {
      await bonusRecordService.setSalary(record.id, { use_adjusted_salary: true });
      loadRecords();
    } finally {
      setSaving(null);
    }
  };

  const handleUnuseAdjusted = async (record) => {
    setSaving(`unadj-${record.id}`);
    try {
      await bonusRecordService.setSalary(record.id, { use_adjusted_salary: false });
      loadRecords();
    } finally {
      setSaving(null);
    }
  };

  const fmt = (v) =>
    v != null && v !== ""
      ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";

  const getSalary = (record) =>
    record.yearly_salary ?? salaryMap[record.employee_id_code] ?? null;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-6 h-6 border-2 border-almet-steel-blue border-t-transparent rounded-full animate-spin" />
      <p className={`text-xs ${sub}`}>Loading records…</p>
    </div>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? "bg-almet-sapphire/20" : "bg-almet-mystic"}`}>
            <DollarSign size={15} className="text-almet-steel-blue" />
          </div>
          <div>
            <h2 className={`text-sm font-semibold ${text}`}>Salary Setup</h2>
            <p className={`text-xs mt-0.5 ${sub}`}>
              {records.length} employees · Click ✎ to override salary or set worked months
            </p>
          </div>
        </div>
        <button
          onClick={handleInitialize}
          disabled={initializing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition disabled:opacity-50
            ${dark ? "border-[#1e2640] text-[#90a0b9] hover:text-white hover:border-almet-steel-blue/50" : "border-gray-200 text-almet-comet hover:bg-almet-mystic hover:text-almet-cloud-burst"}`}
        >
          <RefreshCw size={12} className={initializing ? "animate-spin" : ""} />
          {records.length === 0 ? "Initialize" : "Re-sync"}
        </button>
      </div>

      {/* ── Info banner ── */}
      <div className={`flex items-start gap-2 mx-6 mt-4 mb-1 p-3 rounded-lg border text-xs
        ${dark ? "bg-almet-sapphire/10 border-almet-sapphire/20 text-[#90a0b9]"
               : "bg-almet-mystic border-almet-sapphire/15 text-almet-comet"}`}>
        <Info size={12} className="mt-0.5 shrink-0 text-almet-steel-blue" />
        <span>
          Salary is pulled from the Salary API (read-only). Override with ✎.
          <b> Prorata</b> = Yearly × (Worked / 12).
          <b> Adjusted salary</b> replaces prorata when applied.
        </span>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className={`text-sm ${sub}`}>No records for this bonus year.</p>
          <button
            onClick={handleInitialize}
            disabled={initializing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium disabled:opacity-50 transition"
          >
            <RefreshCw size={13} className={initializing ? "animate-spin" : ""} />
            Initialize Records
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto px-6 pb-6 pt-4">
          <table className="w-full text-sm border-collapse" style={{ minWidth: 820 }}>
            <thead>
              <tr className={`text-[11px] font-semibold uppercase tracking-wide ${headBg}`}>
                <th className={`px-3 py-3 text-left rounded-tl-lg`}>Badge</th>
                <th className="px-3 py-3 text-left">Employee</th>
                <th className="px-3 py-3 text-left">Position</th>
                <th className="px-3 py-3 text-right">Yearly Salary</th>
                <th className="px-3 py-3 text-center">Months</th>
                <th className="px-3 py-3 text-right">Prorata</th>
                <th className="px-3 py-3 text-right">Adjusted</th>
                <th className="px-3 py-3 text-center">Effective</th>
                <th className="px-3 py-3 text-center rounded-tr-lg w-20">Edit</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => {
                const isEditing = editing === record.id;
                const isSaving  = saving === record.id;
                const salary    = getSalary(record);
                const isLast    = idx === records.length - 1;

                return (
                  <tr
                    key={record.id}
                    className={`border-t transition ${border} ${rowHov}
                      ${isEditing ? (dark ? "bg-[#0f1a30]" : "bg-almet-mystic/40") : ""}`}
                  >
                    {/* Badge */}
                    <td className="px-3 py-2.5">
                      <span className={`font-mono text-[11px] px-2 py-0.5 rounded-md
                        ${dark ? "bg-[#131929] text-[#90a0b9]" : "bg-gray-100 text-almet-comet"}`}>
                        {record.employee_id_code}
                      </span>
                    </td>

                    {/* Employee */}
                    <td className={`px-3 py-2.5 font-medium text-xs whitespace-nowrap ${text}`}>
                      {record.employee_name}
                    </td>

                    {/* Position */}
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium
                        ${dark ? "bg-almet-sapphire/15 text-almet-bali-hai" : "bg-almet-mystic text-almet-sapphire"}`}>
                        {record.position || "—"}
                      </span>
                    </td>

                    {/* Yearly Salary */}
                    <td className="px-3 py-2.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={form.yearly_salary}
                          onChange={(e) => setForm({ ...form, yearly_salary: e.target.value })}
                          placeholder="Salary"
                          className={`w-28 px-2 py-1 rounded-lg border text-xs text-right outline-none transition ${inputCls}`}
                        />
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <span className={`text-xs font-semibold ${salary ? text : sub}`}>
                            {fmt(salary)}
                          </span>
                          {record.yearly_salary_manual && (
                            <span className="text-[10px] text-yellow-400" title="Manual">✎</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Worked Months */}
                    <td className="px-3 py-2.5 text-center">
                      {isEditing ? (
                        <input
                          type="number" min={0} max={12} step={0.5}
                          value={form.worked_months}
                          onChange={(e) => setForm({ ...form, worked_months: e.target.value })}
                          className={`w-14 px-2 py-1 rounded-lg border text-xs text-center outline-none transition ${inputCls}`}
                        />
                      ) : (
                        <span className={`text-xs font-medium ${text}`}>{record.worked_months}</span>
                      )}
                    </td>

                    {/* Prorata */}
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[11px] font-semibold font-mono text-orange-400">
                        {fmt(record.prorata_salary)}
                      </span>
                    </td>

                    {/* Adjusted */}
                    <td className="px-3 py-2.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={form.adjusted_yearly_salary}
                          onChange={(e) => setForm({ ...form, adjusted_yearly_salary: e.target.value })}
                          placeholder="Optional"
                          className={`w-28 px-2 py-1 rounded-lg border text-xs text-right outline-none transition ${inputCls}`}
                        />
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {record.adjusted_yearly_salary ? (
                            <>
                              <span className={`text-[11px] font-mono font-semibold ${text}`}>
                                {fmt(record.adjusted_yearly_salary)}
                              </span>
                              {!record.use_adjusted_salary ? (
                                <button
                                  onClick={() => handleUseAdjusted(record)}
                                  disabled={!!saving}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-almet-sapphire/20 text-almet-steel-blue hover:bg-almet-sapphire hover:text-white transition whitespace-nowrap disabled:opacity-50"
                                >
                                  Use
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnuseAdjusted(record)}
                                  disabled={!!saving}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400 transition whitespace-nowrap disabled:opacity-50"
                                  title="Revert"
                                >
                                  ✓ On
                                </button>
                              )}
                            </>
                          ) : (
                            <span className={`text-xs ${sub}`}>—</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Effective */}
                    <td className="px-3 py-2.5 text-center">
                      <div>
                        <span className={`text-[11px] font-mono font-bold
                          ${record.use_adjusted_salary ? "text-green-400" : "text-almet-steel-blue"}`}>
                          {fmt(record.effective_salary)}
                        </span>
                        <p className={`text-[9px] mt-0.5 ${sub}`}>
                          {record.use_adjusted_salary ? "adjusted" : "prorata"}
                        </p>
                      </div>
                    </td>

                    {/* Edit */}
                    <td className="px-3 py-2.5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleApply(record)}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white disabled:opacity-50 transition"
                            title="Apply"
                          >
                            <Check size={11} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={`p-1.5 rounded-lg border transition
                              ${dark ? "border-[#1e2640] text-[#90a0b9] hover:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-100"}`}
                            title="Cancel"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(record)}
                          className={`p-1.5 rounded-lg transition
                            ${dark ? "text-[#90a0b9] hover:text-white hover:bg-[#131929]" : "text-gray-400 hover:text-almet-cloud-burst hover:bg-almet-mystic"}`}
                          title="Edit"
                        >
                          <Pencil size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}