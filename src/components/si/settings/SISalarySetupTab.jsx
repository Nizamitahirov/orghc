"use client";
import { useState, useEffect, useCallback } from "react";
import {
  DollarSign, RefreshCw, Pencil, Check, X,
  Search, Building2, AlertCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";
import { siConfigService, siPeriodService, siCalcService } from "@/services/siService";
import { salaryService } from "@/services/salaryService";

const fmt = (v) =>
  v != null && v !== ""
    ? parseFloat(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€', AZN: '₼', TRY: '₺', RUB: '₽' };
const currSym = (code) => CURRENCY_SYMBOLS[code] || (code || 'AZN');

export default function SISalarySetupTab({ dark, config }) {
  const { showSuccess, showError } = useToast();

  const [employees, setEmployees] = useState([]);
  const [periods,   setPeriods]   = useState([]);
  const [selPeriod, setSelPeriod] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing,   setEditing]   = useState(null); // employee id
  const [editVal,   setEditVal]   = useState("");
  const [saving,    setSaving]    = useState(null);
  const [search,    setSearch]    = useState("");

  /* ── design tokens ── */
  const text    = dark ? "text-white"     : "text-gray-900";
  const sub     = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted   = dark ? "text-gray-600"  : "text-gray-400";
  const rowBg   = dark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-gray-200";
  const rowHov  = dark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50";
  const head    = dark ? "bg-[#080b14] text-[#5a6a85]" : "bg-[#f5f7fb] text-gray-400";
  const inp     = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";
  const srchInp = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white placeholder-gray-700 focus:border-almet-steel-blue/50"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire";

  /* ── load employees ── */
  const loadEmployees = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const { data } = await siConfigService.eligibleEmployees(config.id);
      setEmployees(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      showError("Failed to load eligible employees.");
    } finally {
      setLoading(false);
    }
  }, [config?.id]);

  /* ── load periods ── */
  useEffect(() => {
    if (!config) return;
    siPeriodService.list(config.id)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setPeriods(list);
        const active = list.find((p) => p.status === "OPEN") || list[0];
        if (active) setSelPeriod(active.id);
      })
      .catch(() => {});
  }, [config?.id]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  /* ── handlers ── */
  const handleEdit = (emp) => {
    setEditing(emp.id);
    setEditVal(emp.monthly_salary != null ? String(emp.monthly_salary) : "");
  };

  const handleSave = async (emp) => {
    const val = parseFloat(editVal);
    if (isNaN(val) || val < 0) {
      showError("Please enter a valid monthly salary.");
      return;
    }
    setSaving(emp.id);
    try {
      await salaryService.update({
        employee_id:   emp.id,
        monthly_gross: val,
      });
      setEmployees((prev) =>
        prev.map((e) => e.id === emp.id ? { ...e, monthly_salary: val, salary_source: 'monthly_gross' } : e)
      );
      setEditing(null);
      showSuccess(`Salary updated for ${emp.full_name}.`);
    } catch {
      showError("Failed to update salary.");
    } finally {
      setSaving(null);
    }
  };

  const handleRefresh = async () => {
    if (!selPeriod) {
      showError("Please select a period first.");
      return;
    }
    setRefreshing(true);
    try {
      const { data } = await siCalcService.refreshSalaries(selPeriod);
      showSuccess(`Salaries refreshed for ${data.updated} employee(s).`);
      await loadEmployees();
    } catch {
      showError("Failed to refresh salaries.");
    } finally {
      setRefreshing(false);
    }
  };

  /* ── filtered ── */
  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.full_name  || "").toLowerCase().includes(q) ||
      (e.employee_id || "").toLowerCase().includes(q) ||
      (e.job_title  || "").toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingSpinner message="Loading SI employees…" />;

  const ColHeader = ({ children, align = "left" }) => (
    <th className={`px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-${align} whitespace-nowrap`}>
      {children}
    </th>
  );

  const Cell = ({ children, align = "left", first = false, last = false, bg }) => (
    <td className={`px-4 py-3 border-y text-${align} transition
      ${bg ?? `${rowBg} ${rowHov}`}
      ${first ? "rounded-l-xl border-l" : "border-x-0"}
      ${last  ? "rounded-r-xl border-r border-l-0" : ""}`}>
      {children}
    </td>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center
            ${dark ? "bg-teal-500/10 border border-teal-500/20" : "bg-teal-50 border border-teal-200"}`}>
            <DollarSign size={16} className="text-teal-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${text}`}>Salary Setup</h2>
            <p className={`text-xs ${sub}`}>
              {employees.length} eligible employees · monthly salary used in SI bonus calculation
            </p>
          </div>
        </div>

        {/* Refresh salaries for a period */}
        <div className="flex items-center gap-2">
          {periods.length > 0 && (
            <select
              value={selPeriod ?? ""}
              onChange={(e) => setSelPeriod(Number(e.target.value))}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold outline-none transition ${inp}`}
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.period_name}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || !selPeriod}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50
              ${dark
                ? "border-white/[0.08] text-[#8a9bb8] hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
                : "border-gray-200 text-almet-comet hover:bg-almet-mystic hover:border-almet-sapphire/30 hover:text-almet-sapphire"}`}
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Refresh Period
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border
        ${dark ? "bg-almet-sapphire/8 border-almet-sapphire/20 text-[#8a9bb8]" : "bg-almet-mystic border-almet-sapphire/20 text-almet-comet"}`}>
        <AlertCircle size={13} className="text-almet-steel-blue shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          SI employees use <b>monthly salary</b> (not yearly). Edit monthly salary here or in the main Salary section.
          Click <b>Refresh Period</b> to sync updated salaries into the selected period's calculations.
        </p>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search size={13} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${muted}`} />
        <input
          type="text"
          placeholder="Search by name, ID or job title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition ${srchInp}`}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted} hover:${text} transition`}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 text-sm ${sub}`}>
          {search ? "No employees match the search." : "No eligible employees found for this config."}
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-separate" style={{ borderSpacing: "0 5px", minWidth: 640 }}>
            <thead className={head}>
              <tr>
                <ColHeader>Employee</ColHeader>
                <ColHeader>Job Title</ColHeader>
                <ColHeader align="right">Monthly Salary</ColHeader>
                <ColHeader align="center">Edit</ColHeader>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const isEditing = editing === emp.id;
                const isSaving  = saving === emp.id;
                const editBg    = dark
                  ? "bg-almet-sapphire/8 border-almet-sapphire/20"
                  : "bg-almet-mystic border-almet-sapphire/20";

                return (
                  <tr key={emp.id}>
                    <Cell first bg={isEditing ? editBg : undefined}>
                      <div>
                        <p className={`text-sm font-semibold ${text}`}>{emp.full_name}</p>
                        <p className={`text-[10px] font-mono ${muted}`}>{emp.employee_id}</p>
                      </div>
                    </Cell>
                    <Cell bg={isEditing ? editBg : undefined}>
                      <span className={`text-xs ${sub}`}>{emp.job_title || "—"}</span>
                    </Cell>
                    <Cell align="right" bg={isEditing ? editBg : undefined}>
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-xs font-semibold ${sub}`}>{currSym(emp.salary_currency)}</span>
                          <input
                            autoFocus
                            type="number"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            placeholder="0.00"
                            className={`w-32 px-3 py-1.5 rounded-xl border text-xs text-right outline-none transition ${inp}`}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`text-sm font-bold font-mono ${emp.monthly_salary ? text : muted}`}>
                            {emp.monthly_salary
                              ? `${currSym(emp.salary_currency)}${fmt(emp.monthly_salary)}`
                              : "—"}
                          </span>
                          {emp.salary_source && emp.salary_source !== 'none' && (
                            <span className={`text-[10px] ${muted}`}>
                              {emp.salary_source === 'monthly_gross' ? 'monthly gross' : 'annual ÷ 12'}
                            </span>
                          )}
                        </div>
                      )}
                    </Cell>
                    <Cell align="center" last bg={isEditing ? editBg : undefined}>
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSave(emp)}
                            disabled={isSaving}
                            className="w-7 h-7 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white flex items-center justify-center disabled:opacity-50 transition-all"
                          >
                            {isSaving ? <RefreshCw size={11} className="animate-spin" /> : <Check size={12} />}
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            disabled={isSaving}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition disabled:opacity-40
                              ${dark ? "border-white/[0.08] text-gray-500 hover:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-100"}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(emp)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition
                            ${dark
                              ? "text-gray-600 hover:text-white hover:bg-white/[0.06]"
                              : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </Cell>
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
