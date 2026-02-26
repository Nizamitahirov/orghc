import { useState } from 'react';
import { Users, Search, ChevronRight, Lock, X, Building2, User, Plus, Loader, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_FRIENDLY = {
  DRAFT:                     { label: 'Not started',          color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  PENDING_EMPLOYEE_APPROVAL: { label: 'Waiting your approval', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  PENDING_MANAGER_APPROVAL:  { label: 'Under review',          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  APPROVED:                  { label: 'Approved',              color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  COMPLETED:                 { label: 'Completed',             color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  NEED_CLARIFICATION:        { label: 'Needs clarification',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function TeamMembersWithSearch({
  employees = [],
  currentUserId,
  canViewEmployee,
  onSelectEmployee,
  onInitializeEmployee,
  darkMode,
  isPersonalView = false,
  canInitialize = false,
}) {
  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition,   setFilterPosition]   = useState('');
  const [filterCompany,    setFilterCompany]     = useState('');
  const [initializing,     setInitializing]     = useState({});

  const uniq = (field) =>
    [...new Set(employees.map(e => e[field] || e[field.replace('employee_', '')]))].filter(Boolean).sort();

  const departments = uniq('employee_department');
  const positions   = uniq('employee_position_group');
  const companies   = uniq('employee_company');

  const filtered = employees.filter(emp => {
    const q = searchTerm.toLowerCase();
    return (
      (!searchTerm ||
        (emp.employee_name || emp.name || '').toLowerCase().includes(q) ||
        (emp.employee_id  || '').toLowerCase().includes(q)) &&
      (!filterDepartment || (emp.employee_department || emp.department)       === filterDepartment) &&
      (!filterPosition   || (emp.employee_position_group || emp.position)     === filterPosition)   &&
      (!filterCompany    || (emp.employee_company || emp.company)             === filterCompany)
    );
  });

  const notStarted = filtered.filter(e => !e.has_performance && e.can_initialize);
  const hasFilters  = searchTerm || filterDepartment || filterPosition || filterCompany;

  const getStatus = (emp) => {
    if (!emp.has_performance) return STATUS_FRIENDLY['DRAFT'];
    const objPct  = parseFloat(emp.objectives_percentage);
    const compPct = parseFloat(emp.competencies_percentage);
    const key = (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0)
      ? 'COMPLETED'
      : (emp.approval_status || 'DRAFT');
    return STATUS_FRIENDLY[key] || STATUS_FRIENDLY['DRAFT'];
  };

  const handleInit = async (emp) => {
    if (!onInitializeEmployee) return;
    setInitializing(p => ({ ...p, [emp.id]: true }));
    try { await onInitializeEmployee(emp); }
    finally { setInitializing(p => ({ ...p, [emp.id]: false })); }
  };

  const clearFilters = () => {
    setSearchTerm(''); setFilterDepartment('');
    setFilterPosition(''); setFilterCompany('');
  };

  // ── Personal (single employee) view ──
  if (isPersonalView && employees.length === 1) {
    const me = employees.find(e => e.id === currentUserId);
    if (!me) return <Empty darkMode={darkMode} msg="No performance record found for your profile." />;

    const status  = getStatus(me);
    const canInit = !me.has_performance && me.can_initialize && canInitialize;

    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-almet-sapphire/10">
            <User className="w-5 h-5 text-almet-sapphire" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>My Performance</h3>
            <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>Your goals, reviews and results</p>
          </div>
        </div>

        <EmployeeRow
          emp={me}
          status={status}
          canInit={canInit}
          isInit={initializing[me.id]}
          hasAccess={true}
          darkMode={darkMode}
          onInit={() => handleInit(me)}
          onView={() => onSelectEmployee(me)}
        />
      </div>
    );
  }

  // ── Team / full list view ──
  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10">
          <Users className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>Team Members</h3>
          <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
            {filtered.length} people
            {notStarted.length > 0 && (
              <span className="text-amber-500 ml-1">· {notStarted.length} not started yet</span>
            )}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or ID..."
            className={`w-full pl-10 pr-4 h-10 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 ${
              darkMode
                ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-bali-hai'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {(departments.length > 1 || positions.length > 1) && (
          <div className="grid grid-cols-2 gap-3">
            {departments.length > 1 && (
              <Select value={filterDepartment} onChange={setFilterDepartment} placeholder="All Departments" options={departments} darkMode={darkMode} />
            )}
            {positions.length > 1 && (
              <Select value={filterPosition} onChange={setFilterPosition} placeholder="All Positions" options={positions} darkMode={darkMode} />
            )}
          </div>
        )}

        {companies.length > 1 && (
          <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/30'} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-almet-sapphire" />
              <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>Company</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['', ...companies].map(c => (
                <button
                  key={c || '__all'}
                  onClick={() => setFilterCompany(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCompany === c
                      ? 'bg-almet-sapphire text-white shadow-sm'
                      : darkMode
                        ? 'bg-almet-comet/50 text-almet-bali-hai hover:bg-almet-comet'
                        : 'bg-white text-almet-waterloo hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {c || 'All'}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className={`w-full h-9 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <X className="w-4 h-4" /> Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Empty darkMode={darkMode} msg={hasFilters ? 'No employees match your filters.' : 'No team members found.'} />
      ) : (
        <div className="space-y-2">
          {filtered.map((emp, i) => {
            const status  = getStatus(emp);
            const canInit = !emp.has_performance && emp.can_initialize && canInitialize;
            const hasAcc  = canViewEmployee(emp.id);
            return (
              <EmployeeRow
                key={`${emp.id}-${i}`}
                emp={emp}
                status={status}
                canInit={canInit}
                isInit={initializing[emp.id]}
                hasAccess={hasAcc}
                darkMode={darkMode}
                onInit={() => handleInit(emp)}
                onView={() => onSelectEmployee(emp)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Reusable row ──────────────────────────────────────────────────────────────
function EmployeeRow({ emp, status, canInit, isInit, hasAccess, darkMode, onInit, onView }) {
  const name = emp.employee_name || emp.name || 'Unknown';
  return (
    <div className={`${darkMode ? 'bg-almet-san-juan hover:bg-almet-comet' : 'bg-almet-mystic/50 hover:bg-almet-mystic'} rounded-xl p-3.5 transition-all`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {name}
              </span>
              {!hasAccess && <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />}
            </div>
            <p className={`text-xs truncate ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
              {emp.employee_position_group || emp.position}
              {(emp.employee_department || emp.department) && ` · ${emp.employee_department || emp.department}`}
              {(emp.employee_company    || emp.company)    && ` · ${emp.employee_company    || emp.company}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${status.color}`}>
            {status.label}
          </span>

          {canInit ? (
            <button
              onClick={onInit}
              disabled={isInit}
              className="h-8 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              {isInit ? <Loader className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              {isInit ? 'Starting...' : 'Start'}
            </button>
          ) : hasAccess && emp.has_performance ? (
            <button
              onClick={onView}
              className="h-8 px-3 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              Open <ChevronRight className="w-3 h-3" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Select({ value, onChange, placeholder, options, darkMode }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-10 px-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 ${
        darkMode ? 'bg-almet-san-juan border-almet-comet text-white' : 'bg-white border-gray-300 text-gray-900'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Empty({ darkMode, msg }) {
  return (
    <div className="text-center py-10">
      <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{msg}</p>
    </div>
  );
}