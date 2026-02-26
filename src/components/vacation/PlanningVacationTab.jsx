// components/vacation/PlanningVacationTab.jsx - FIXED

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 

  Trash2,
  Save,
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { VacationService } from '@/services/vacationService';
import PlanningCalendar from './PlanningCalendar';
import VacationStats from './VacationStats';

export default function PlanningVacationTab({
  darkMode,
  userAccess,
  vacationTypes,
  employeeSearchResults,
  balances,
  showSuccess,
  showError
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requester, setRequester] = useState('for_me');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [vacationType, setVacationType] = useState(null);
  const [comment, setComment] = useState('');
  const [selectedRanges, setSelectedRanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDaysPlanned, setTotalDaysPlanned] = useState(0);
  
  // ✅ Existing scheduled periods
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [pendingScheduledDays, setPendingScheduledDays] = useState(0);

  // ✅ AUTO-SELECT PAID VACATION
  useEffect(() => {
    if (vacationTypes && vacationTypes.length > 0 && !vacationType) {
      const paidVacation = vacationTypes.find(t => 
        t.name.toLowerCase().includes('paid') || 
        t.name.toLowerCase().includes('annual')
      );
      setVacationType(paidVacation?.id || vacationTypes[0].id);
    }
  }, [vacationTypes]);

  // ✅ FETCH EXISTING SCHEDULES
  useEffect(() => {
    fetchExistingSchedules();
  }, [requester, selectedEmployee]);

  const fetchExistingSchedules = async () => {
    try {
      const data = await VacationService.getScheduleTabs();
      
      // ✅ Get upcoming schedules - Include PENDING_MANAGER + SCHEDULED
      const upcoming = data.upcoming || [];
      
      // ✅ Filter based on requester
      let relevantSchedules = [];
      let pendingDays = 0;
      
      if (requester === 'for_me') {
        // Current user's schedules only
        const userEmail = VacationService.getCurrentUserEmail();
        const currentEmployee = employeeSearchResults.find(emp => 
          emp.email?.toLowerCase() === userEmail.toLowerCase()
        );
        
        if (currentEmployee) {
          relevantSchedules = upcoming.filter(schedule => 
            schedule.employee_name === currentEmployee.name &&
            (schedule.status === 'PENDING_MANAGER' || schedule.status === 'SCHEDULED')
          );
        }
      } else if (requester === 'for_my_employee' && selectedEmployee) {
        // Selected employee's schedules only
        const employee = employeeSearchResults.find(emp => emp.id === selectedEmployee);
        
        if (employee) {
          relevantSchedules = upcoming.filter(schedule => 
            schedule.employee_name === employee.name &&
            (schedule.status === 'PENDING_MANAGER' || schedule.status === 'SCHEDULED')
          );
        }
      }
      
      // ✅ Calculate total pending days
      pendingDays = relevantSchedules
        .filter(s => s.status === 'PENDING_MANAGER')
        .reduce((sum, s) => {
          const days = parseFloat(s.number_of_days || 0);
          return sum + days;
        }, 0);
      
      setPendingScheduledDays(pendingDays);
      
      // Convert to ranges format for calendar
      const scheduleRanges = relevantSchedules.map(schedule => ({
        id: `existing-${schedule.id}`,
        start: schedule.start_date,
        end: schedule.end_date,
        vacation_type_id: schedule.vacation_type_id,
        isExisting: true,
        status: schedule.status,
        status_display: schedule.status_display,
        days: schedule.number_of_days
      }));
      
      setExistingSchedules(scheduleRanges);
      
    } catch (error) {
      console.error('Error fetching existing schedules:', error);
    }
  };

  // ✅ Calculate total days
  useEffect(() => {
    const calculateTotalDays = async () => {
      let total = 0;
      
      let businessFunctionCode = null;
      if (requester === 'for_me' && employeeSearchResults && employeeSearchResults.length > 0) {
        const userEmail = VacationService.getCurrentUserEmail();
        const currentEmployee = employeeSearchResults.find(emp => 
          emp.email?.toLowerCase() === userEmail.toLowerCase()
        );
        if (currentEmployee && currentEmployee.business_function_name) {
          businessFunctionCode = currentEmployee.business_function_name.toUpperCase().includes('UK') ? 'UK' : 'AZ';
        }
      } else if (requester === 'for_my_employee' && selectedEmployee) {
        const employee = employeeSearchResults.find(emp => emp.id === selectedEmployee);
        if (employee && employee.business_function_name) {
          businessFunctionCode = employee.business_function_name.toUpperCase().includes('UK') ? 'UK' : 'AZ';
        }
      }
      
      for (const range of selectedRanges) {
        try {
          const data = await VacationService.calculateWorkingDays({
            start_date: range.start,
            end_date: range.end,
            business_function_code: businessFunctionCode
          });
          total += data.working_days;
        } catch (error) {
          console.error('Error calculating days:', error);
        }
      }
      setTotalDaysPlanned(total);
    };

    if (selectedRanges.length > 0) {
      calculateTotalDays();
    } else {
      setTotalDaysPlanned(0);
    }
  }, [selectedRanges, requester, selectedEmployee, employeeSearchResults]);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleRangeSelect = (start, end) => {
    const isDuplicate = selectedRanges.some(range => 
      range.start === start && range.end === end
    );
    
    if (isDuplicate) {
      showError('This date range is already selected');
      return;
    }
    
    const hasOverlap = selectedRanges.some(range => {
      return (start <= range.end && end >= range.start);
    });
    
    if (hasOverlap) {
      showError('This date range overlaps with an existing selection');
      return;
    }
    
    // ✅ Check overlap with existing schedules
    const hasExistingOverlap = existingSchedules.some(schedule => {
      return (start <= schedule.end && end >= schedule.start);
    });
    
    if (hasExistingOverlap) {
      showError('⚠️ This date range overlaps with an existing schedule');
      return;
    }
    
    const newRange = {
      id: Date.now(),
      start: start,
      end: end,
      vacation_type_id: vacationType
    };
    setSelectedRanges([...selectedRanges, newRange]);
    showSuccess(`✅ Added ${start} to ${end}`);
  };

  const handleRangeRemove = (dateStr) => {
    const updatedRanges = selectedRanges.filter(range => {
      return !(dateStr >= range.start && dateStr <= range.end);
    });
    
    setSelectedRanges(updatedRanges);
    showSuccess('✅ Range removed');
  };

  const handleRemoveRange = (rangeId) => {
    setSelectedRanges(selectedRanges.filter(r => r.id !== rangeId));
  };

  const handleClearAll = () => {
    setSelectedRanges([]);
    setComment('');
  };

  const handleSubmit = async () => {
    if (selectedRanges.length === 0) {
      showError('Please select at least one date range');
      return;
    }

    if (!vacationType) {
      showError('Please select vacation type');
      return;
    }

    // ✅ CHECK: Available balance = remaining - (scheduled + pending)
    if (balances) {
      const totalAlreadyPlanned = parseFloat(balances.scheduled_days || 0) + parseFloat(pendingScheduledDays || 0);
      const availableForPlanning = parseFloat(balances.remaining_balance || 0) - totalAlreadyPlanned;
      
      if (totalDaysPlanned > availableForPlanning) {
        showError(
          `❌ Insufficient balance. ` +
          `Available: ${availableForPlanning.toFixed(1)} days ` +
          `(Remaining: ${balances.remaining_balance} - ` +
          `Already scheduled: ${balances.scheduled_days} - ` +
          `Pending approval: ${pendingScheduledDays.toFixed(1)})`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const schedulesData = selectedRanges.map(range => ({
        vacation_type_id: range.vacation_type_id || vacationType,
        start_date: range.start,
        end_date: range.end,
        comment: comment
      }));

      const requestData = {
        schedules: schedulesData
      };

      if (requester === 'for_my_employee' && selectedEmployee) {
        requestData.employee_id = selectedEmployee;
      }

      const response = await VacationService.bulkCreateSchedules(requestData);
      
      showSuccess(`✅ ${response.created_count} schedules created successfully!`);
      
      handleClearAll();
      fetchExistingSchedules();
      
      if (typeof window.refreshVacationData === 'function') {
        window.refreshVacationData();
      }

    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to create schedules';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getBusinessFunctionCode = () => {
    if (requester === 'for_me' && employeeSearchResults && employeeSearchResults.length > 0) {
      const userEmail = VacationService.getCurrentUserEmail();
      const currentEmployee = employeeSearchResults.find(emp => 
        emp.email?.toLowerCase() === userEmail.toLowerCase()
      );
      return currentEmployee?.business_function_name?.toUpperCase().includes('UK') ? 'UK' : 'AZ';
    } else if (requester === 'for_my_employee' && selectedEmployee) {
      const employee = employeeSearchResults.find(emp => emp.id === selectedEmployee);
      return employee?.business_function_name?.toUpperCase().includes('UK') ? 'UK' : 'AZ';
    }
    return null;
  };

  // ✅ Combine selected + existing for calendar display
  const allRangesForCalendar = [...selectedRanges, ...existingSchedules];

  // ✅ Calculate truly available balance - SAFE VERSION
  const getAvailableBalance = () => {
    if (!balances) return 0;
    
    const remaining = parseFloat(balances.remaining_balance) || 0;
    const scheduled = parseFloat(balances.scheduled_days) || 0;
    const pending = parseFloat(pendingScheduledDays) || 0;
    
    const available = remaining - scheduled - pending;
    return Math.max(0, available); // Never negative
  };
  
  const availableBalance = getAvailableBalance();

  return (
    <div className="space-y-6">
      {/* ✅ STATS CARDS */}
      {balances && (
        <VacationStats 
          balances={balances} 
          allowNegativeBalance={false}
        />
      )}

      {/* Header Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Full Year Planning
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
              You can plan up to <strong>{availableBalance.toFixed(1)} days</strong>.
              <span className="block mt-1">
                (Remaining: <strong>{parseFloat(balances?.remaining_balance || 0).toFixed(1)}</strong> - 
                Scheduled: <strong>{parseFloat(balances?.scheduled_days || 0).toFixed(1)}</strong> - 
                Pending: <strong>{pendingScheduledDays.toFixed(1)}</strong>)
              </span>
              {existingSchedules.length > 0 && (
                <span className="block mt-1">
                  ✅ <strong>{existingSchedules.length} existing schedule{existingSchedules.length > 1 ? 's' : ''}</strong> shown in green.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
          <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
            Planning Details
          </h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Requester */}
          {(userAccess.is_manager || userAccess.is_admin) && (
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Planning For
              </label>
              <select 
                value={requester} 
                onChange={(e) => {
                  setRequester(e.target.value);
                  setSelectedEmployee(null);
                }} 
                className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
              >
                <option value="for_me">For Me</option>
                <option value="for_my_employee">For My Employee</option>
              </select>
            </div>
          )}

          {/* Employee Selection */}
          {requester === 'for_my_employee' && (
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Select Employee
              </label>
              <SearchableDropdown
                options={employeeSearchResults.map(emp => ({ 
                  value: emp.id, 
                  label: `${emp.name} (${emp.employee_id})` 
                }))}
                value={selectedEmployee}
                onChange={(value) => setSelectedEmployee(value)}
                placeholder="Search employee"
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Add planning notes..."
              className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-sapphire/90 transition-all"
            >
              Today
            </button>
            
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <PlanningCalendar
          currentMonth={currentMonth}
          selectedRanges={allRangesForCalendar}
          onRangeSelect={handleRangeSelect}
          onRangeRemove={handleRangeRemove}
          onMonthChange={setCurrentMonth}
          businessFunctionCode={getBusinessFunctionCode()}
          darkMode={darkMode}
        />
      </div>

      {/* Selected Ranges */}
      {selectedRanges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
          <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
              Selected Periods ({selectedRanges.length})
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-almet-sapphire" />
              <span className="font-semibold text-almet-cloud-burst dark:text-white">
                Total: {totalDaysPlanned} days
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="space-y-2">
              {selectedRanges.map((range, index) => (
                <div 
                  key={range.id}
                  className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                        {range.start} → {range.end}
                      </p>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        Paid Vacation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveRange(range.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Balance Warning */}
      {balances && totalDaysPlanned > availableBalance && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
                Insufficient Balance
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                Planning {totalDaysPlanned} days but only {availableBalance.toFixed(1)} days available.
                (Remaining: {balances.remaining_balance} - Scheduled: {balances.scheduled_days} - Pending: {pendingScheduledDays.toFixed(1)})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleClearAll}
          disabled={selectedRanges.length === 0}
          className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || selectedRanges.length === 0 || !vacationType}
          className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Planning ({selectedRanges.length} periods)
            </>
          )}
        </button>
      </div>
    </div>
  );
}