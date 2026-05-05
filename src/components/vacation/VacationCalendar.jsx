// components/vacation/VacationCalendar.jsx

import React, { useState, useEffect } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Users, Filter, X,
  Star, Shield, Globe, Info, Eye
} from 'lucide-react';
import { VacationService } from '@/services/vacationService';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { DayDetailModal } from './DayDetailModal';

// ✅ BUG FIX: toISOString() UTC-yə çevirir → Bakı +4 offset-i ilə 1 gün geri gedir
// Həmişə LOCAL date string istifadə et
const toLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function VacationCalendar({ darkMode, showError, userAccess }) {
  const [currentDate, setCurrentDate]     = useState(new Date());
  const [holidays, setHolidays]           = useState([]);
  const [vacations, setVacations]         = useState([]);
  const [summary, setSummary]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  const [filters, setFilters]             = useState({ employee_id: '', department_id: '', business_function_id: '' });
  const [employees, setEmployees]         = useState([]);
  const [departments, setDepartments]     = useState([]);
  const [businessFunctions, setBusinessFunctions] = useState([]);
  const [selectedDay, setSelectedDay]     = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [calendarCountry, setCalendarCountry] = useState(null); // null = auto-detect

  useEffect(() => { fetchCalendarData(); }, [currentDate, filters, calendarCountry]);
  useEffect(() => { fetchFilterOptions(); }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const data = await VacationService.getCalendarEvents({
        month: currentDate.getMonth() + 1,
        year:  currentDate.getFullYear(),
        ...(calendarCountry ? { country: calendarCountry } : {}),
        ...filters
      });
      setHolidays(data.holidays || []);
      setVacations(data.vacations || []);
      setSummary(data.summary || null);
    } catch { showError?.('Failed to load calendar'); }
    finally  { setLoading(false); }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await VacationService.getAllVacationRecords({});
      if (!res?.records) return;
      const empMap = new Map(), bfMap = new Map(), deptMap = new Map();
      res.records.forEach(r => {
        if (r.employee_id)      empMap.set(r.employee_id,      { id: r.employee_id,      name: r.employee_name });
        if (r.business_function) bfMap.set(r.business_function, { id: r.business_function, name: r.business_function });
        if (r.department)       deptMap.set(r.department,      { id: r.department,        name: r.department });
      });
      setEmployees([...empMap.values()]);
      setBusinessFunctions([...bfMap.values()]);
      setDepartments([...deptMap.values()]);
    } catch { /* silent */ }
  };

  // ✅ FIX: use toLocalDateStr everywhere — no more UTC shift
  const getEventsForDate = (date) => {
    const ds = toLocalDateStr(date);
    return {
      holidays: holidays.filter(h => h.date.split('T')[0] === ds),
      vacations: vacations.filter(v => ds >= v.start_date && ds <= v.end_date),
    };
  };

  const isToday = date => toLocalDateStr(date) === toLocalDateStr(new Date());

  const getDaysInMonth = (date) => {
    const y = date.getFullYear(), m = date.getMonth();
    return {
      daysInMonth: new Date(y, m + 1, 0).getDate(),
      startingDayOfWeek: new Date(y, m, 1).getDay(),
    };
  };

  const getStatusStyle = (code) => {
    const map = {
      APPROVED:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      SCHEDULED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };
    return map[code] || 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
  };

  const getVacationTypeStyle = (vacationType, statusCode) => {
    if (!vacationType) return getStatusStyle(statusCode);
    const t = vacationType.toLowerCase();
    if (t.includes('annual') || t.includes('məzuniyyət')) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (t.includes('medical') || t.includes('sick') || t.includes('xəstəlik')) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
    if (t.includes('personal') || t.includes('şəxsi')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    if (t.includes('maternity') || t.includes('paternity') || t.includes('dekret')) return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
    if (t.includes('study') || t.includes('education') || t.includes('təhsil')) return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
    if (t.includes('unpaid') || t.includes('ödənişsiz')) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    return getStatusStyle(statusCode);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const cells = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      cells.push(
        <div key={`e-${i}`} className="min-h-[110px] bg-gray-50/50 dark:bg-gray-900/30 border border-almet-mystic/10 dark:border-almet-comet/10 rounded-lg" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { holidays: dh, vacations: dv } = getEventsForDate(date);
      const today = isToday(date);

      cells.push(
        <div
          key={day}
          onClick={() => { setSelectedDay({ date, holidays: dh, vacations: dv }); setShowDayDetail(true); }}
          className={`min-h-[110px] rounded-xl border p-2 cursor-pointer transition-all flex flex-col gap-1 ${
            today
              ? 'border-almet-sapphire bg-almet-sapphire/5 dark:bg-almet-sapphire/10 shadow-sm'
              : 'border-almet-mystic/30 dark:border-almet-comet/30 bg-white dark:bg-gray-800 hover:border-almet-sapphire/40 hover:shadow-sm'
          }`}
        >
          {/* Day number */}
          <div className="flex items-center justify-between">
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
              today ? 'bg-almet-sapphire text-white' : 'text-almet-cloud-burst dark:text-white'
            }`}>
              {day}
            </span>
            {(dh.length + dv.length) > 0 && (
              <span className="text-[9px] bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-astral px-1.5 py-0.5 rounded-full font-medium">
                {dh.length + dv.length}
              </span>
            )}
          </div>

          {/* Holidays */}
          {dh.map((h, i) => (
            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-lg" title={h.name}>
              <Star className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
              <span className="text-[9px] text-red-700 dark:text-red-300 truncate font-medium">{h.name}</span>
            </div>
          ))}

          {/* Vacations */}
          {dv.slice(0, 2).map((v, i) => (
            <div key={i} className={`px-1.5 py-0.5 rounded-lg ${getVacationTypeStyle(v.vacation_type, v.status_code)}`} title={`${v.employee_name} – ${v.vacation_type}`}>
              <p className="text-[9px] font-medium truncate">{v.employee_name}</p>
            </div>
          ))}
          {dv.length > 2 && (
            <div className="px-1.5 py-0.5 bg-almet-mystic/40 dark:bg-gray-700 rounded-lg">
              <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai font-medium">+{dv.length - 2} more</p>
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  const isPrivileged = userAccess.is_admin || userAccess.is_manager;
  const hasFilters   = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-almet-sapphire" />
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Shield className={`w-3.5 h-3.5 ${userAccess.is_admin ? 'text-purple-500' : userAccess.is_manager ? 'text-blue-500' : 'text-green-500'}`} />
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
              {userAccess.is_admin ? 'Viewing all employees' : userAccess.is_manager ? 'Viewing your team' : 'Your personal calendar'}
            </p>
            {summary?.country && (
              <>
                <span className="text-almet-waterloo/40">·</span>
                <Globe className="w-3.5 h-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{summary.country} holidays</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AZ / UK calendar toggle — visible for admin users */}
          {userAccess?.is_admin && (
            <div className="flex items-center rounded-lg border border-almet-bali-hai/40 dark:border-almet-comet overflow-hidden text-xs font-semibold">
              {[null, 'az', 'uk'].map((val, i) => (
                <button
                  key={i}
                  onClick={() => setCalendarCountry(val)}
                  className={`px-2.5 py-1.5 transition-all ${
                    calendarCountry === val
                      ? 'bg-almet-sapphire text-white'
                      : 'bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet'
                  } ${i > 0 ? 'border-l border-almet-bali-hai/40 dark:border-almet-comet' : ''}`}
                >
                  {val === null ? 'Auto' : val.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          {isPrivileged && (
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${
                showFilters || hasFilters
                  ? 'bg-almet-sapphire text-white border-almet-sapphire'
                  : 'bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white border-almet-bali-hai/40 dark:border-almet-comet hover:border-almet-sapphire'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {hasFilters && <span className="bg-white text-almet-sapphire rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">!</span>}
            </button>
          )}
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-almet-bali-hai/40 dark:border-almet-comet hover:border-almet-sapphire transition-all">
            <ChevronLeft className="w-4 h-4 text-almet-cloud-burst dark:text-white" />
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all font-medium">
            Today
          </button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-almet-bali-hai/40 dark:border-almet-comet hover:border-almet-sapphire transition-all">
            <ChevronRight className="w-4 h-4 text-almet-cloud-burst dark:text-white" />
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Public Holidays',       value: summary.total_holidays,        color: 'text-red-600',   bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
            { label: 'Vacations This Month',  value: summary.total_vacations,       color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
            { label: 'Employees Away',        value: summary.employees_on_vacation, color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
            { label: 'Calendar',              value: summary.country || 'AZ',       color: summary.country === 'UK' ? 'text-red-600' : 'text-almet-sapphire', bg: summary.country === 'UK' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              {s.label === 'Calendar' && summary.calendar_auto_detected && (
                <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">Auto-detected</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      {showFilters && isPrivileged && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Filter Calendar</p>
            {hasFilters && (
              <button
                onClick={() => setFilters({ employee_id: '', department_id: '', business_function_id: '' })}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Employee</label>
              <SearchableDropdown
                options={employees.map(e => ({ value: e.id, label: e.name }))}
                value={filters.employee_id}
                onChange={v => setFilters(p => ({ ...p, employee_id: v || '' }))}
                placeholder="All Employees"
                allowUncheck darkMode={darkMode}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Company</label>
              <SearchableDropdown
                options={businessFunctions.map(b => ({ value: b.id, label: b.name }))}
                value={filters.business_function_id}
                onChange={v => setFilters(p => ({ ...p, business_function_id: v || '' }))}
                placeholder="All Companies"
                allowUncheck darkMode={darkMode}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Department</label>
              <SearchableDropdown
                options={departments.map(d => ({ value: d.id, label: d.name }))}
                value={filters.department_id}
                onChange={v => setFilters(p => ({ ...p, department_id: v || '' }))}
                placeholder="All Departments"
                allowUncheck darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Info tip ── */}
      <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai bg-almet-mystic/20 dark:bg-gray-700/30 rounded-lg px-3 py-2">
        <Eye className="w-3.5 h-3.5 flex-shrink-0" />
        Click on any day to see full details of holidays and who is on vacation
      </div>

      {/* ── Calendar Grid ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/30 dark:border-almet-comet overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-almet-mystic/30 dark:border-almet-comet/30">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-almet-cloud-burst dark:text-white bg-gray-50 dark:bg-gray-700/50">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 p-2">
            {renderCalendar()}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        {[
          { color: 'bg-red-100 dark:bg-red-900/30',     label: 'Public Holiday' },
          { color: 'bg-green-100 dark:bg-green-900/30', label: 'Annual Leave' },
          { color: 'bg-rose-100 dark:bg-rose-900/30',   label: 'Medical/Sick' },
          { color: 'bg-purple-100 dark:bg-purple-900/30', label: 'Personal' },
          { color: 'bg-pink-100 dark:bg-pink-900/30',   label: 'Maternity/Paternity' },
          { color: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Study Leave' },
          { color: 'bg-amber-100 dark:bg-amber-900/30', label: 'Pending Approval' },
          { color: 'ring-2 ring-almet-sapphire',         label: 'Today' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded ${l.color}`} />
            <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{l.label}</span>
          </div>
        ))}
      </div>

      <DayDetailModal
        isOpen={showDayDetail}
        onClose={() => setShowDayDetail(false)}
        date={selectedDay?.date}
        holidays={selectedDay?.holidays}
        vacations={selectedDay?.vacations}
      />
    </div>
  );
}