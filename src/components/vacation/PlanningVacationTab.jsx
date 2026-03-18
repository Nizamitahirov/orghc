// components/vacation/PlanningVacationTab.jsx

import { useState, useEffect } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Trash2, Save,
  AlertCircle, Clock, Info, CheckCircle, User, Users
} from 'lucide-react';
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { VacationService } from '@/services/vacationService';
import PlanningCalendar from './PlanningCalendar';
import VacationStats from './VacationStats';

export default function PlanningVacationTab({
  darkMode, userAccess, vacationTypes,
  employeeSearchResults, balances, showSuccess, showError
}) {
  const [currentMonth, setCurrentMonth]       = useState(new Date());
  const [requester, setRequester]             = useState('for_me');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [vacationType, setVacationType]       = useState(null);
  const [comment, setComment]                 = useState('');
  const [selectedRanges, setSelectedRanges]   = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [totalDaysPlanned, setTotalDaysPlanned] = useState(0);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [pendingScheduledDays, setPendingScheduledDays] = useState(0);
  const [rangeDays, setRangeDays]             = useState({});

  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

  const getBusinessFunctionCode = () => {
    if (requester === 'for_me' && employeeSearchResults?.length > 0) {
      const userEmail = VacationService.getCurrentUserEmail();
      const cur = employeeSearchResults.find(e => e.email?.toLowerCase() === userEmail?.toLowerCase());
      return cur?.business_function_name?.toUpperCase().includes('UK') ? 'UK' : 'AZ';
    }
    if (requester === 'for_my_employee' && selectedEmployee) {
      const emp = employeeSearchResults.find(e => e.id === selectedEmployee);
      return emp?.business_function_name?.toUpperCase().includes('UK') ? 'UK' : 'AZ';
    }
    return null;
  };

  useEffect(() => {
    if (vacationTypes?.length > 0 && !vacationType) {
      const paid = vacationTypes.find(t => t.name.toLowerCase().includes('paid') || t.name.toLowerCase().includes('annual'));
      setVacationType(paid?.id || vacationTypes[0].id);
    }
  }, [vacationTypes]);

  useEffect(() => { fetchExistingSchedules(); }, [requester, selectedEmployee]);

  const fetchExistingSchedules = async () => {
    try {
      const data = await VacationService.getScheduleTabs();
      const upcoming = data.upcoming || [];
      let relevant = [];
      let pending = 0;

      if (requester === 'for_me') {
        const userEmail = VacationService.getCurrentUserEmail();
        const cur = employeeSearchResults?.find(e => e.email?.toLowerCase() === userEmail?.toLowerCase());
        if (cur) relevant = upcoming.filter(s => s.employee_name === cur.name &&
          (s.status === 'PENDING_MANAGER' || s.status === 'SCHEDULED'));
      } else if (requester === 'for_my_employee' && selectedEmployee) {
        const emp = employeeSearchResults?.find(e => e.id === selectedEmployee);
        if (emp) relevant = upcoming.filter(s => s.employee_name === emp.name &&
          (s.status === 'PENDING_MANAGER' || s.status === 'SCHEDULED'));
      }

      pending = relevant.filter(s => s.status === 'PENDING_MANAGER')
        .reduce((sum, s) => sum + (parseFloat(s.number_of_days) || 0), 0);
      setPendingScheduledDays(pending);

      setExistingSchedules(relevant.map(s => ({
        id: `existing-${s.id}`, start: s.start_date, end: s.end_date,
        vacation_type_id: s.vacation_type_id, isExisting: true,
        status: s.status, days: s.number_of_days
      })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const calc = async () => {
      if (!selectedRanges.length) { setRangeDays({}); return; }
      const map = {};
      const code = getBusinessFunctionCode();
      for (const r of selectedRanges) {
        try {
          const d = await VacationService.calculateWorkingDays({ start_date: r.start, end_date: r.end, business_function_code: code });
          map[r.id] = d.working_days;
        } catch { map[r.id] = 0; }
      }
      setRangeDays(map);
    };
    calc();
  }, [selectedRanges, requester, selectedEmployee]);

  useEffect(() => {
    setTotalDaysPlanned(Object.values(rangeDays).reduce((s, d) => s + d, 0));
  }, [rangeDays]);

  const mergeConsecutiveRanges = ranges => {
    if (!ranges.length) return [];
    const sorted = [...ranges].sort((a, b) => new Date(a.start) - new Date(b.start));
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i], prev = merged[merged.length - 1];
      const diff = Math.ceil((new Date(cur.start) - new Date(prev.end)) / 86400000);
      if (diff <= 1) { prev.end = cur.end; prev.id = Math.min(prev.id, cur.id); }
      else merged.push(cur);
    }
    return merged;
  };

  const handleRangeSelect = (start, end) => {
    if (selectedRanges.some(r => r.start === start && r.end === end)) {
      showError('This date range is already selected'); return;
    }
    if (selectedRanges.some(r => start <= r.end && end >= r.start)) {
      showError('This range overlaps with an existing selection'); return;
    }
    if (existingSchedules.some(s => start <= s.end && end >= s.start)) {
      showError('This range overlaps with an already-scheduled period'); return;
    }
    setSelectedRanges(mergeConsecutiveRanges([...selectedRanges, { id: Date.now(), start, end, vacation_type_id: vacationType }]));
    showSuccess(`Added: ${start} → ${end}`);
  };

  const handleRangeRemove = dateStr => {
    setSelectedRanges(prev => prev.filter(r => !(dateStr >= r.start && dateStr <= r.end)));
  };

  const handleSubmit = async () => {
    if (!selectedRanges.length) { showError('Please select at least one date range'); return; }
    if (!vacationType) { showError('Please select a vacation type'); return; }

    if (balances) {
      const totalPlanned = parseFloat(balances.scheduled_days || 0) + parseFloat(pendingScheduledDays || 0);
      const available = parseFloat(balances.remaining_balance || 0) - totalPlanned;
      if (totalDaysPlanned > available) {
        showError(`Not enough balance. Available: ${Math.max(0, available).toFixed(1)} days`); return;
      }
    }

    setLoading(true);
    try {
      const requestData = {
        schedules: selectedRanges.map(r => ({
          vacation_type_id: r.vacation_type_id || vacationType,
          start_date: r.start, end_date: r.end, comment
        })),
        ...(requester === 'for_my_employee' && selectedEmployee ? { employee_id: selectedEmployee } : {})
      };
      const res = await VacationService.bulkCreateSchedules(requestData);
      showSuccess(`${res.created_count} schedule(s) submitted for approval!`);
      setSelectedRanges([]); setComment('');
      fetchExistingSchedules();
    } catch (e) {
      showError(e.response?.data?.error || 'Failed to submit schedules');
    } finally { setLoading(false); }
  };

  const getAvailableBalance = () => {
    if (!balances) return 0;
    return Math.max(0,
      parseFloat(balances.remaining_balance || 0) -
      parseFloat(balances.scheduled_days || 0) -
      parseFloat(pendingScheduledDays || 0)
    );
  };
  const availableBalance = getAvailableBalance();
  const isOverBalance = balances && totalDaysPlanned > availableBalance;
  const allRanges = [...selectedRanges, ...existingSchedules];

  return (
    <div className="space-y-6">

      {/* ── Stats ── */}
      {balances && <VacationStats balances={balances} allowNegativeBalance={false} />}

      {/* ── How it works ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">How to plan your vacation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: 'Select dates', desc: 'Click and drag on the calendar below to choose your vacation period.' },
                { step: '2', title: 'Review & submit', desc: 'Check the selected days and click "Submit for Approval".' },
                { step: '3', title: 'Wait for approval', desc: 'Your manager will review and approve or reject your schedule.' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</span>
                  <div>
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">{s.title}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
              You can plan up to <strong>{availableBalance.toFixed(1)} working days</strong>.
              {existingSchedules.length > 0 && <> &nbsp;You already have <strong>{existingSchedules.length} scheduled period(s)</strong> shown in green on the calendar.</>}
            </p>
          </div>
        </div>
      </div>

      {/* ── Planning For (manager/admin only) ── */}
      {(userAccess.is_manager || userAccess.is_admin) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm p-3">
          <h3 className="text-xs font-bold text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-almet-sapphire" /> Who are you planning for?
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { value: 'for_me',           label: 'Myself',         icon: <User className="w-4 h-4" /> },
              { value: 'for_my_employee',  label: 'An Employee',    icon: <Users className="w-4 h-4" /> },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setRequester(opt.value); setSelectedEmployee(null); }}
                className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left ${
                  requester === opt.value
                    ? 'border-almet-sapphire bg-almet-sapphire/5 dark:bg-almet-sapphire/10'
                    : 'border-almet-mystic/50 dark:border-almet-comet hover:border-almet-sapphire/40'
                }`}
              >
                <span className={`${requester === opt.value ? 'text-almet-sapphire' : 'text-almet-waterloo dark:text-almet-bali-hai'}`}>
                  {opt.icon}
                </span>
                <span className={`text-sm font-medium ${requester === opt.value ? 'text-almet-sapphire' : 'text-almet-cloud-burst dark:text-white'}`}>
                  {opt.label}
                </span>
                {requester === opt.value && <CheckCircle className="w-4 h-4 text-almet-sapphire ml-auto" />}
              </button>
            ))}
          </div>
          {requester === 'for_my_employee' && (
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Select Employee</label>
              <SearchableDropdown
                options={employeeSearchResults.map(e => ({ value: e.id, label: `${e.name} (${e.employee_id})` }))}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                placeholder="Search and select employee..."
                darkMode={darkMode}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Comment ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm p-3">
        <label className="block text-xs font-bold text-almet-cloud-burst dark:text-white mb-1.5">
          Note <span className="text-xs font-normal text-almet-waterloo dark:text-almet-bali-hai">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={2}
          placeholder="Add any notes for your manager (e.g. reason for these dates)..."
          className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      {/* ── Calendar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm overflow-hidden">
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-almet-sapphire" />
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
              Click and drag to select dates · Click a selected date to remove it
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 rounded-lg bg-almet-mystic dark:bg-gray-700 hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all">
              <ChevronLeft className="w-4 h-4 text-almet-cloud-burst dark:text-white" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-sapphire/90 transition-all">
              Today
            </button>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 rounded-lg bg-almet-mystic dark:bg-gray-700 hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all">
              <ChevronRight className="w-4 h-4 text-almet-cloud-burst dark:text-white" />
            </button>
          </div>
        </div>
        <PlanningCalendar
          currentMonth={currentMonth}
          selectedRanges={allRanges}
          onRangeSelect={handleRangeSelect}
          onRangeRemove={handleRangeRemove}
          onMonthChange={setCurrentMonth}
          businessFunctionCode={getBusinessFunctionCode()}
          darkMode={darkMode}
        />
      </div>

      {/* ── Selected Periods ── */}
      {selectedRanges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm overflow-hidden">
          <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white">
                Selected Periods ({selectedRanges.length})
              </h3>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                Review your selections before submitting
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg">
                <span className="text-xs font-bold text-almet-sapphire">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {totalDaysPlanned.toFixed(1)} working days
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-2">
            {selectedRanges.map((range, i) => {
              const days = rangeDays[range.id] || 0;
              return (
                <div key={range.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-almet-sapphire text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                        {range.start === range.end ? range.start : `${range.start} → ${range.end}`}
                      </p>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">Paid Vacation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-almet-sapphire text-white text-xs font-bold rounded-lg">
                      {days.toFixed(1)} {days === 1 ? 'day' : 'days'}
                    </span>
                    <button onClick={() => setSelectedRanges(selectedRanges.filter(r => r.id !== range.id))}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Balance Warning ── */}
      {isOverBalance && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-900 dark:text-red-200">Not enough vacation days</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              You selected <strong>{totalDaysPlanned.toFixed(1)} days</strong> but only have <strong>{availableBalance.toFixed(1)} days</strong> available.
              Please remove some periods to continue.
            </p>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {selectedRanges.length > 0 && (
          <button
            onClick={() => { setSelectedRanges([]); setComment(''); }}
            className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-xl text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Clear All Selections
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedRanges.length || !vacationType || isOverBalance}
          className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-xl hover:bg-almet-cloud-burst transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
            : <><Save className="w-4 h-4" /> Submit {selectedRanges.length > 0 ? `${selectedRanges.length} Period${selectedRanges.length > 1 ? 's' : ''}` : 'for Approval'}</>
          }
        </button>
      </div>
    </div>
  );
}