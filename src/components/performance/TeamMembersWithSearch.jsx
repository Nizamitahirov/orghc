"use client";
import { useState, useMemo, memo, useCallback } from 'react';
import { Users, Search, ChevronRight, Lock, X, User, Plus, Loader } from 'lucide-react';
import { usePersistentState } from '@/hooks/usePersistentState';

/* ── Status config — minimal, no vivid colours ───────────────────────── */
const STATUS_CONFIG = {
  NOT_INITIALIZED:           { label: 'Not Started',         dot: 'bg-gray-400',    text: 'text-gray-500 dark:text-gray-400' },
  DRAFT:                     { label: 'Goals Pending',       dot: 'bg-gray-400',    text: 'text-gray-500 dark:text-gray-400' },
  PENDING_EMPLOYEE_APPROVAL: { label: 'Awaiting Approval',   dot: 'bg-amber-400',   text: 'text-amber-600 dark:text-amber-400' },
  NEED_CLARIFICATION:        { label: 'Needs Clarification', dot: 'bg-red-400',     text: 'text-red-600 dark:text-red-400' },
  MID_YEAR_PENDING:          { label: 'Mid-Year Pending',    dot: 'bg-blue-400',    text: 'text-blue-600 dark:text-blue-400' },
  END_YEAR_PENDING:          { label: 'End-Year Pending',    dot: 'bg-blue-400',    text: 'text-blue-600 dark:text-blue-400' },
  IN_PROGRESS:               { label: 'In Progress',         dot: 'bg-blue-400',    text: 'text-blue-600 dark:text-blue-400' },
  COMPLETED:                 { label: 'Completed',           dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
};

function getStatus(emp, currentPeriod) {
  if (!emp.has_performance) return STATUS_CONFIG['NOT_INITIALIZED'];
  const s       = emp.approval_status || 'DRAFT';
  const midDone = !!emp.mid_year_completed;
  const endDone = !!emp.end_year_completed;

  if (s === 'COMPLETED' || endDone)     return STATUS_CONFIG['COMPLETED'];
  if (s === 'NEED_CLARIFICATION')       return STATUS_CONFIG['NEED_CLARIFICATION'];
  if (s === 'PENDING_EMPLOYEE_APPROVAL')return STATUS_CONFIG['PENDING_EMPLOYEE_APPROVAL'];
  if (s === 'DRAFT')                    return STATUS_CONFIG['DRAFT'];
  if (s === 'APPROVED') {
    if (!midDone && currentPeriod === 'MID_YEAR_REVIEW') return STATUS_CONFIG['MID_YEAR_PENDING'];
    if (midDone  && currentPeriod === 'END_YEAR_REVIEW') return STATUS_CONFIG['END_YEAR_PENDING'];
    return STATUS_CONFIG['IN_PROGRESS'];
  }
  return STATUS_CONFIG['DRAFT'];
}

/* ── Single thin progress bar ───────────────────────────────────────── */
const TinyBar = memo(({ pct }) => (
  <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
    <div
      className="h-full rounded-full bg-almet-sapphire/70 transition-all duration-500"
      style={{ width: `${Math.min(100, pct)}%` }}
    />
  </div>
));
TinyBar.displayName = 'TinyBar';

/* ── Employee row ────────────────────────────────────────────────────── */
const EmployeeRow = memo(({ emp, status, canInit, isInit, hasAccess, darkMode, onInit, onView }) => {
  const name       = emp.employee_name || emp.name || 'Unknown';
  const initials   = name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const objPct     = parseFloat(emp.objectives_percentage)  || 0;
  const compPct    = parseFloat(emp.competencies_percentage) || 0;
  const overallPct = parseFloat(emp.overall_weighted_percentage) || 0;
  const hasScores  = objPct > 0 || compPct > 0;

  const meta = [
    emp.job_title || emp. employee_position_group || emp.position_group,
    emp.employee_department     || emp.department,
    emp.employee_company        || emp.company,
  ].filter(Boolean).join(' · ');

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
        darkMode
          ? 'hover:bg-almet-san-juan/50'
          : 'hover:bg-gray-50'
      }`}
      onClick={hasAccess && emp.has_performance ? onView : undefined}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
        emp.end_year_completed || emp.approval_status === 'COMPLETED'
          ? 'bg-emerald-500'
          : 'bg-almet-sapphire'
      }`}>
        {initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {name}
          </span>
          {!hasAccess && <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />}
        </div>

        {meta && (
          <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {meta}
          </p>
        )}

        {/* Scores row — only if data exists */}
        {hasScores && (
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex-1 min-w-0">
              <TinyBar pct={objPct} />
            </div>
            <div className="flex-1 min-w-0">
              <TinyBar pct={compPct} />
            </div>
            {overallPct > 0 && (
              <span className={`text-xs font-semibold flex-shrink-0 ${
                overallPct >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                  : overallPct >= 50 ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-500'
              }`}>
                {overallPct.toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: status + action */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-1">
        <span className={`flex items-center gap-1 text-xs ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
          <span className="hidden sm:inline">{status.label}</span>
        </span>

        {canInit ? (
          <button
            onClick={e => { e.stopPropagation(); onInit(); }}
            disabled={isInit}
            className={`h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-colors ${
              darkMode
                ? 'bg-almet-sapphire/20 hover:bg-almet-sapphire/30 text-almet-sapphire'
                : 'bg-almet-sapphire/10 hover:bg-almet-sapphire/20 text-almet-sapphire'
            }`}
          >
            {isInit ? <Loader className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            {isInit ? 'Starting…' : 'Start'}
          </button>
        ) : hasAccess && emp.has_performance ? (
          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
            darkMode ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-300 group-hover:text-gray-500'
          }`} />
        ) : null}
      </div>
    </div>
  );
});
EmployeeRow.displayName = 'EmployeeRow';

/* ── Select ──────────────────────────────────────────────────────────── */
const Select = memo(({ value, onChange, placeholder, options, darkMode }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`h-8 px-2 text-xs rounded-md border w-full focus:outline-none focus:ring-1 focus:ring-almet-sapphire/40 ${
      darkMode
        ? 'bg-almet-san-juan border-almet-comet/60 text-white'
        : 'bg-white border-gray-200 text-gray-700'
    }`}
  >
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
));
Select.displayName = 'Select';

/* ── Empty ───────────────────────────────────────────────────────────── */
const Empty = ({ darkMode, msg }) => (
  <div className="py-10 text-center">
    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{msg}</p>
  </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
export default function TeamMembersWithSearch({
  employees = [],
  currentUserId,
  currentPeriod,
  canViewEmployee,
  onSelectEmployee,
  onInitializeEmployee,
  darkMode,
  isPersonalView = false,
  canInitialize  = false,
}) {
  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterDepartment, setFilterDepartment] = usePersistentState('perf_filter_dept',     '');
  const [filterPosition,   setFilterPosition]   = usePersistentState('perf_filter_position', '');
  const [filterCompany,    setFilterCompany]     = usePersistentState('perf_filter_company',  '');
  const [filterStatus,     setFilterStatus]     = usePersistentState('perf_filter_status',   '');
  const [initializing,     setInitializing]     = useState({});

  const uniq = useCallback((arr, field) =>
    [...new Set(arr.map(e => e[field]).filter(Boolean))].sort(), []);

  const departments = useMemo(() => uniq(employees, 'employee_department'),     [employees, uniq]);
  const positions   = useMemo(() => uniq(employees, 'employee_position_group'), [employees, uniq]);
  const companies   = useMemo(() => uniq(employees, 'employee_company'),        [employees, uniq]);

  const matchesStatus = useCallback(emp => {
    if (!filterStatus) return true;
    if (filterStatus === 'NOT_INITIALIZED') return !emp.has_performance;
    if (filterStatus === 'COMPLETED')       return emp.approval_status === 'COMPLETED' || !!emp.end_year_completed;
    if (filterStatus === 'APPROVED')        return emp.approval_status === 'APPROVED'  && !emp.end_year_completed;
    if (filterStatus === 'NEED_ACTION')     return ['PENDING_EMPLOYEE_APPROVAL','NEED_CLARIFICATION'].includes(emp.approval_status);
    return false;
  }, [filterStatus]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return employees.filter(emp =>
      (!q || (emp.employee_name||emp.name||'').toLowerCase().includes(q) || (emp.employee_id||'').toLowerCase().includes(q)) &&
      (!filterDepartment || emp.employee_department     === filterDepartment) &&
      (!filterPosition   || emp.employee_position_group === filterPosition)   &&
      (!filterCompany    || emp.employee_company         === filterCompany)    &&
      matchesStatus(emp)
    );
  }, [employees, searchTerm, filterDepartment, filterPosition, filterCompany, matchesStatus]);

  const counts = useMemo(() => ({
    total:      employees.length,
    notStarted: employees.filter(e => !e.has_performance).length,
    needAction: employees.filter(e => ['PENDING_EMPLOYEE_APPROVAL','NEED_CLARIFICATION'].includes(e.approval_status)).length,
    inProgress: employees.filter(e => e.approval_status === 'APPROVED' && !e.end_year_completed).length,
    completed:  employees.filter(e => e.approval_status === 'COMPLETED' || !!e.end_year_completed).length,
  }), [employees]);

  const handleInit = useCallback(async emp => {
    if (!onInitializeEmployee) return;
    setInitializing(p => ({ ...p, [emp.id]: true }));
    try   { await onInitializeEmployee(emp); }
    finally { setInitializing(p => ({ ...p, [emp.id]: false })); }
  }, [onInitializeEmployee]);

  const clearFilters = useCallback(() => {
    setSearchTerm(''); setFilterDepartment('');
    setFilterPosition(''); setFilterCompany(''); setFilterStatus('');
  }, [setFilterDepartment, setFilterPosition, setFilterCompany, setFilterStatus]);

  const hasFilters = !!(searchTerm || filterDepartment || filterPosition || filterCompany || filterStatus);

  const statusTabs = [
    { key: '',               label: `All (${counts.total})` },
    { key: 'NEED_ACTION',    label: `Action (${counts.needAction})` },
    { key: 'NOT_INITIALIZED',label: `Not Started (${counts.notStarted})` },
    { key: 'APPROVED',       label: `In Progress (${counts.inProgress})` },
    { key: 'COMPLETED',      label: `Done (${counts.completed})` },
  ];

  /* ── Personal (single employee) view ─────────────────────────────── */
  if (isPersonalView && employees.length === 1) {
    const me = employees.find(e => e.id === currentUserId) || employees[0];
    if (!me) return <Empty darkMode={darkMode} msg="No performance record found." />;
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl`}>
        <div className={`px-4 py-3 border-b ${darkMode ? 'border-almet-comet/40' : 'border-gray-100'}`}>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Performance</h3>
        </div>
        <div className="p-2">
          <EmployeeRow
            emp={me}
            status={getStatus(me, currentPeriod)}
            canInit={!me.has_performance && me.can_initialize && canInitialize}
            isInit={!!initializing[me.id]}
            hasAccess={true}
            darkMode={darkMode}
            onInit={() => handleInit(me)}
            onView={() => onSelectEmployee(me)}
          />
        </div>
      </div>
    );
  }

  /* ── Team view ────────────────────────────────────────────────────── */
  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl`}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className={`px-3 pt-3 pb-2 border-b ${darkMode ? 'border-almet-comet/40' : 'border-gray-100'} space-y-2`}>

        {/* Row 1: search + counts */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search name or ID…"
              className={`w-full pl-8 pr-7 h-8 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-almet-sapphire/40 ${
                darkMode
                  ? 'bg-almet-san-juan border-almet-comet/60 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className={`text-xs flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {filtered.length}/{counts.total}
          </span>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 flex items-center gap-0.5"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Row 2: dropdowns always visible */}
        {(departments.length > 1 || positions.length > 1 || companies.length > 1) && (
          <div className="flex gap-2">
            {departments.length > 1 && (
              <Select
                value={filterDepartment}
                onChange={setFilterDepartment}
                placeholder="Department"
                options={departments}
                darkMode={darkMode}
              />
            )}
            {positions.length > 1 && (
              <Select
                value={filterPosition}
                onChange={setFilterPosition}
                placeholder="Position"
                options={positions}
                darkMode={darkMode}
              />
            )}
            {companies.length > 1 && (
              <Select
                value={filterCompany}
                onChange={setFilterCompany}
                placeholder="Company"
                options={companies}
                darkMode={darkMode}
              />
            )}
          </div>
        )}

        {/* Row 3: status tabs */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                filterStatus === tab.key
                  ? darkMode
                    ? 'bg-almet-sapphire/20 text-almet-sapphire'
                    : 'bg-almet-sapphire/10 text-almet-sapphire'
                  : darkMode
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────────── */}
      <div className="p-2">
        {filtered.length === 0 ? (
          <Empty darkMode={darkMode} msg={hasFilters ? 'No results.' : 'No team members found.'} />
        ) : (
          <div>
            {filtered.map((emp, i) => (
              <EmployeeRow
                key={`${emp.id}-${i}`}
                emp={emp}
                status={getStatus(emp, currentPeriod)}
                canInit={!emp.has_performance && emp.can_initialize && canInitialize}
                isInit={!!initializing[emp.id]}
                hasAccess={canViewEmployee ? canViewEmployee(emp.id) : true}
                darkMode={darkMode}
                onInit={() => handleInit(emp)}
                onView={() => onSelectEmployee(emp)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
