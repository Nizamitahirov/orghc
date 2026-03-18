import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Download, Upload, Save, X, CheckCircle,
  AlertCircle, RefreshCw, DollarSign, Users, TrendingUp,
  Edit3, ChevronUp, ChevronDown,
} from "lucide-react";
import CustomCheckbox from "@/components/common/CustomCheckbox";
import Pagination from "@/components/common/Pagination";

const fmt     = (v) => (parseFloat(v) || 0).toLocaleString();
const fmtNull = (v) => v != null ? fmt(v) : "—";

const currencyBadgeCls = (code) => {
  const m = {
    AZN: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    USD: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    EUR: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    GBP: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  };
  return m[code] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
};

/* ─── Stat tile ──────────────────────────────────────────────────────────── */
const Stat = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue:   "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    green:  "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400",
    amber:  "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
  };
  return (
    <div className={`rounded-xl border p-3.5 flex items-center gap-3 ${colors[color]}`}>
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
        <Icon size={15} className={colors[color].split(" ").at(-1)} />
      </div>
      <div>
        <p className="text-[10px] text-almet-waterloo dark:text-gray-400">{label}</p>
        <p className="text-sm font-bold text-almet-cloud-burst dark:text-white">{value}</p>
      </div>
    </div>
  );
};

/* ─── Inline edit row ────────────────────────────────────────────────────── */
const EditableRow = ({ emp, currencies, onSave, onCancel, saving }) => {
  const [form, setForm] = useState({
    monthly_gross:   emp.monthly_gross   ?? "",
    annual_salary:   emp.annual_salary   ?? "",
    grade_level:     emp.grading_level   ?? "",
    salary_currency: emp.salary_currency ?? "AZN",
  });
  const handleMonthly = (v) => {
    const m = parseFloat(v) || 0;
    setForm(f => ({ ...f, monthly_gross: v, annual_salary: m > 0 ? String(Math.round(m * 12)) : "" }));
  };
  const inp = "w-full px-2 py-1.5 text-xs border border-almet-sapphire/40 dark:border-almet-sapphire/30 rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire";
  return (
    <tr className="bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border-b border-almet-sapphire/20">
      <td className="px-3 py-2"><CustomCheckbox checked={false} onChange={() => {}} className="opacity-30" /></td>
      <td className="px-3 py-2">
        <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{emp.full_name}</p>
        <p className="text-[10px] text-almet-waterloo dark:text-gray-400">{emp.employee_id}</p>
      </td>
      <td className="px-3 py-2 text-xs text-almet-waterloo dark:text-gray-300">{emp.job_title}</td>
      <td className="px-3 py-2"><input value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))} className={inp} placeholder="_M" /></td>
      <td className="px-3 py-2"><input type="number" value={form.monthly_gross} onChange={e => handleMonthly(e.target.value)} className={inp} placeholder="Monthly" min={0} /></td>
      <td className="px-3 py-2"><input type="number" value={form.annual_salary}  onChange={e => setForm(f => ({ ...f, annual_salary: e.target.value }))} className={inp} placeholder="Annual" min={0} /></td>
      <td className="px-3 py-2">
        <select value={form.salary_currency} onChange={e => setForm(f => ({ ...f, salary_currency: e.target.value }))} className={inp}>
          {(currencies || []).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
        </select>
      </td>
      <td className="px-3 py-2" />
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button onClick={() => onSave(emp.id, form)} disabled={saving}
            className="p-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50">
            {saving ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />}
          </button>
          <button onClick={onCancel}
            className="p-1.5 bg-almet-mystic dark:bg-gray-700 text-almet-waterloo dark:text-gray-300 rounded-lg hover:bg-almet-bali-hai/20 transition-colors">
            <X size={11} />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
const SalaryTab = ({
  salaryData, salaryLoading, salaryError, salaryUpdating, salaryBulkUpdating,
  salaryPagination, salaryFilters, currencies, currentData,
  fetchSalaryData, handleSalaryUpdate, handleSalaryBulkUpdate,
  handleSalaryExcelImport, handleSalaryTemplateDownload, updateSalaryFilters,
}) => {
  const [currentPage,     setCurrentPage]     = useState(1);
  const [editingId,       setEditingId]       = useState(null);
  const [savingId,        setSavingId]        = useState(null);
  const [saveResult,      setSaveResult]      = useState(null);
  const [searchInput,     setSearchInput]     = useState(salaryFilters.search || "");
  const [hasSalaryFilter, setHasSalaryFilter] = useState("");
  const [sortField,       setSortField]       = useState("full_name");
  const [sortDir,         setSortDir]         = useState("asc");
  const [selectedIds,     setSelectedIds]     = useState([]);
  const [bulkGrade,       setBulkGrade]       = useState("");
  const [bulkCurrency,    setBulkCurrency]    = useState("AZN");
  const [showBulk,        setShowBulk]        = useState(false);
  const [importError,     setImportError]     = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchSalaryData(); setCurrentPage(1); }, []); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => { updateSalaryFilters({ search: searchInput }); fetchSalaryData({ search: searchInput }); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line

  useEffect(() => {
    const val = hasSalaryFilter === "" ? "" : hasSalaryFilter === "yes";
    updateSalaryFilters({ has_salary: val });
    fetchSalaryData({ has_salary: val });
  }, [hasSalaryFilter]); // eslint-disable-line

  const stats = React.useMemo(() => {
    const w = salaryData.filter(e => e.monthly_gross != null);
    const total = salaryData.length, filled = w.length;
    const totalM = w.reduce((s, e) => s + parseFloat(e.monthly_gross || 0), 0);
    return { total, filled, empty: total - filled, avg: filled > 0 ? totalM / filled : 0 };
  }, [salaryData]);

  const sorted = React.useMemo(() => [...salaryData].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
    if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === "asc" ? av - bv : bv - av;
  }), [salaryData, sortField, sortDir]);

  const toggleSort = (f) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={10} className="text-almet-bali-hai opacity-50" />;
    return sortDir === "asc" ? <ChevronUp size={10} className="text-white" /> : <ChevronDown size={10} className="text-white" />;
  };

  const handleRowSave = useCallback(async (id, form) => {
    setSavingId(id);
    const r = await handleSalaryUpdate(id, form);
    setSaveResult({ id, ...r });
    if (r.success) setEditingId(null);
    setSavingId(null);
    setTimeout(() => setSaveResult(null), 3000);
  }, [handleSalaryUpdate]);

  const handleBulk = useCallback(async () => {
    if (!selectedIds.length) return;
    const payload = {};
    if (bulkGrade)    payload.grade_level     = bulkGrade;
    if (bulkCurrency) payload.salary_currency = bulkCurrency;
    await handleSalaryBulkUpdate(selectedIds, payload);
    setSelectedIds([]); setShowBulk(false);
  }, [selectedIds, bulkGrade, bulkCurrency, handleSalaryBulkUpdate]);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImportError(null);
    const r = await handleSalaryExcelImport(file);
    if (!r.success) setImportError(r.error);
    e.target.value = "";
  }, [handleSalaryExcelImport]);

  const getGradeMatch = useCallback((emp) => {
    if (!emp.monthly_gross || !emp.grading_level || !currentData?.grades) return null;
    const g = currentData.grades[emp.grading_level]; if (!g) return null;
    const sal = parseFloat(emp.monthly_gross);
    return sal < g.LD ? "under" : sal > g.UD ? "over" : "within";
  }, [currentData]);

  const matchBadge = (match) => {
    if (!match) return null;
    const cfg = {
      within: { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", label: "✓ Within" },
      over:   { cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",                 label: "↑ Over"   },
      under:  { cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",             label: "↓ Under"  },
    };
    const c = cfg[match];
    return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.cls}`}>{c.label}</span>;
  };

  const allSel       = sorted.length > 0 && sorted.every(e => selectedIds.includes(e.id));
  const someSelected = sorted.some(e => selectedIds.includes(e.id));
  const toggleAll    = () => setSelectedIds(allSel ? [] : sorted.map(e => e.id));
  const toggleOne    = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const PAGE_SIZE  = 25;
  const totalPages = salaryPagination.count > 0 ? Math.ceil(salaryPagination.count / PAGE_SIZE) : 1;


const handlePageChange = useCallback(async (page) => {
  if (page === currentPage) return;

  // next/previous URL-dən page param-ı çıxarmaq üçün köməkçi
  const extractPage = (url) => {
    if (!url) return null;
    try {
      // relative URL-lər üçün fake base əlavə et
      const fullUrl = url.startsWith('http') ? url : `http://x.com${url.startsWith('/') ? '' : '/'}${url}`;
      return new URL(fullUrl).searchParams.get('page') || '1';
    } catch {
      // manual parse — "?page=3&..." formatı
      const match = url.match(/[?&]page=(\d+)/);
      return match ? match[1] : '1';
    }
  };

  if (page > currentPage && salaryPagination.next) {
    const pageNo = extractPage(salaryPagination.next);
    await fetchSalaryData({ page: pageNo });
    setCurrentPage(page);
  } else if (page < currentPage) {
    // previous URL varsa ondan götür, yoxsa page nömrəsini birbaşa göndər
    if (salaryPagination.previous) {
      const pageNo = extractPage(salaryPagination.previous);
      await fetchSalaryData({ page: pageNo });
    } else {
      // page 1-ə qayıdırıq (previous yoxdursa)
      await fetchSalaryData({ page: page > 1 ? String(page) : undefined });
    }
    setCurrentPage(page);
  }
}, [currentPage, salaryPagination, fetchSalaryData]);

  const thCls = "px-3 py-2.5 text-left text-[10px] font-semibold text-white/80 uppercase tracking-wide";

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Users}       label="Total Employees"  value={stats.total}                         color="blue"   />
        <Stat icon={CheckCircle} label="Salary Set"        value={`${stats.filled} / ${stats.total}`} color="green"  />
        <Stat icon={AlertCircle} label="No Salary"         value={stats.empty}                        color="amber"  />
        <Stat icon={DollarSign}  label="Avg Monthly"       value={fmt(Math.round(stats.avg))}          color="purple" />
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic dark:border-gray-700 p-3.5">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-almet-bali-hai dark:text-gray-500" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search employees…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-almet-mystic dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 focus:border-almet-sapphire"
            />
          </div>
          <select
            value={hasSalaryFilter}
            onChange={e => setHasSalaryFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-almet-mystic dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30"
          >
            <option value="">All employees</option>
            <option value="yes">Has salary</option>
            <option value="no">No salary</option>
          </select>

          <div className="ml-auto flex gap-2 flex-wrap">
            {selectedIds.length > 0 && (
              <button onClick={() => setShowBulk(p => !p)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors">
                <Edit3 size={12} />Bulk Edit ({selectedIds.length})
              </button>
            )}
            <button onClick={handleSalaryTemplateDownload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs border border-almet-mystic dark:border-gray-600 rounded-lg text-almet-waterloo dark:text-gray-300 hover:bg-almet-mystic/40 dark:hover:bg-gray-700 transition-colors">
              <Download size={12} />Template
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Upload size={12} />Import Excel
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            <button onClick={() => fetchSalaryData()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs border border-almet-mystic dark:border-gray-600 rounded-lg text-almet-waterloo dark:text-gray-300 hover:bg-almet-mystic/40 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw size={12} className={salaryLoading ? "animate-spin" : ""} />Refresh
            </button>
          </div>
        </div>

        {importError && (
          <div className="mt-2.5 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle size={12} />{importError}
          </div>
        )}

        {/* Bulk panel */}
        {showBulk && selectedIds.length > 0 && (
          <div className="mt-2.5 p-3 bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border border-almet-sapphire/20 rounded-lg flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-[10px] font-medium text-almet-waterloo dark:text-gray-400 mb-1">Grade Level</label>
              <input value={bulkGrade} onChange={e => setBulkGrade(e.target.value)} placeholder="_M"
                className="w-20 px-2 py-1.5 text-xs border border-almet-sapphire/30 dark:border-almet-sapphire/20 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-almet-waterloo dark:text-gray-400 mb-1">Currency</label>
              <select value={bulkCurrency} onChange={e => setBulkCurrency(e.target.value)}
                className="w-20 px-2 py-1.5 text-xs border border-almet-sapphire/30 dark:border-almet-sapphire/20 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire">
                {(currencies || []).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <button onClick={handleBulk} disabled={salaryBulkUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50">
              {salaryBulkUpdating ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />}
              Apply to {selectedIds.length}
            </button>
            <button onClick={() => setShowBulk(false)} className="p-1.5 text-almet-waterloo dark:text-gray-400 hover:text-almet-cloud-burst">
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic dark:border-gray-700 overflow-hidden">
        {salaryLoading && !salaryData.length ? (
          <div className="flex items-center justify-center py-14 gap-2 text-sm text-almet-waterloo dark:text-gray-400">
            <RefreshCw size={18} className="animate-spin text-almet-sapphire" />
            Loading salary data…
          </div>
        ) : salaryError ? (
          <div className="p-6 text-center">
            <AlertCircle size={36} className="mx-auto text-red-400 mb-2" />
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">{salaryError}</p>
            <button onClick={() => fetchSalaryData()}
              className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-almet-sapphire to-almet-astral">
                  <th className="px-3 py-2.5">
                    <CustomCheckbox
                      checked={allSel}
                      indeterminate={!allSel && someSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  {[
                    { label: "Employee",      field: "full_name"       },
                    { label: "Position",      field: "job_title"       },
                    { label: "Grade Level",   field: "grading_level"   },
                    { label: "Monthly",       field: "monthly_gross"   },
                    { label: "Annual",        field: "annual_salary"   },
                    { label: "Currency",      field: "salary_currency" },
                    { label: "Grade Match",   field: null              },
                    { label: "Actions",       field: null              },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      className={`${thCls} ${field ? "cursor-pointer hover:bg-white/10 select-none" : ""}`}
                      onClick={() => field && toggleSort(field)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {field && <SortIcon field={field} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-almet-mystic/50 dark:divide-gray-700/50">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-xs text-almet-waterloo dark:text-gray-400">
                      No employees found
                    </td>
                  </tr>
                ) : sorted.map((emp, idx) => {
                  if (editingId === emp.id)
                    return (
                      <EditableRow key={emp.id} emp={emp} currencies={currencies}
                        onSave={handleRowSave} onCancel={() => setEditingId(null)} saving={savingId === emp.id} />
                    );
                  const match = getGradeMatch(emp);
                  const isSel = selectedIds.includes(emp.id);
                  return (
                    <tr key={emp.id} className={`transition-colors ${
                      isSel ? "bg-almet-sapphire/5 dark:bg-almet-sapphire/10"
                        : idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-almet-mystic/10 dark:bg-gray-700/10"
                    } hover:bg-almet-mystic/30 dark:hover:bg-gray-700/40`}>
                      <td className="px-3 py-2.5">
                        <CustomCheckbox
                          checked={isSel}
                          onChange={() => toggleOne(emp.id)}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-almet-cloud-burst dark:text-white">{emp.full_name}</p>
                        <p className="text-[10px] text-almet-waterloo dark:text-gray-400">{emp.employee_id}</p>
                      </td>
                      <td className="px-3 py-2.5 text-almet-waterloo dark:text-gray-300">{emp.job_title || "—"}</td>
                      <td className="px-3 py-2.5">
                        {emp.grading_level
                          ? <span className="font-mono text-[11px] px-2 py-0.5 bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded">{emp.grading_level}</span>
                          : <span className="text-almet-bali-hai dark:text-gray-500 italic">Not set</span>
                        }
                      </td>
                      <td className="px-3 py-2.5 font-mono text-right text-almet-cloud-burst dark:text-white">{fmtNull(emp.monthly_gross)}</td>
                      <td className="px-3 py-2.5 font-mono text-right text-almet-waterloo dark:text-gray-400">{fmtNull(emp.annual_salary)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${currencyBadgeCls(emp.salary_currency)}`}>
                          {emp.salary_currency || "AZN"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">{matchBadge(match)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingId(emp.id)}
                            className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Edit3 size={12} />
                          </button>
                          {saveResult?.id === emp.id && (
                            saveResult.success
                              ? <CheckCircle size={12} className="text-emerald-500" />
                              : <AlertCircle size={12} className="text-red-500" title={saveResult.error} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer — pagination */}
        {salaryPagination.count > 0 && (
          <div className="px-4 py-3 border-t border-almet-mystic dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={salaryPagination.count}
              itemsPerPage={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryTab;