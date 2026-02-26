// components/vacation/PlanningCalendar.jsx - ✅ COMPLETE VERSION

import { useState, useEffect } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { VacationService } from '@/services/vacationService';

export default function PlanningCalendar({
  currentMonth,
  selectedRanges,
  onRangeSelect,
  onRangeRemove,
  darkMode,
  onMonthChange,
  businessFunctionCode = null
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ✅ Fetch holidays when month changes
  useEffect(() => {
    fetchHolidays();
  }, [currentMonth, businessFunctionCode]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const params = {
        month,
        year
      };
      
      // ✅ Add country based on business function
      if (businessFunctionCode && businessFunctionCode.toUpperCase() === 'UK') {
        params.country = 'uk';
      } else {
        params.country = 'az';
      }
      
      const data = await VacationService.getCalendarEvents(params);
      setHolidays(data.holidays || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
    onMonthChange(newDate);
  };

  const handleYearChange = (increment) => {
    const newDate = new Date(currentMonth.getFullYear() + increment, currentMonth.getMonth(), 1);
    onMonthChange(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date) => {
    // ✅ FIX: Use local date without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateSelected = (date) => {
    const dateStr = formatDate(date);
    return selectedRanges.some(range => {
      // ✅ Only check NEW selections (not existing schedules)
      return !range.isExisting && dateStr >= range.start && dateStr <= range.end;
    });
  };

  const isDateInDragRange = (date) => {
    if (!dragStart || !dragEnd) return false;
    
    const dateStr = formatDate(date);
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    
    return dateStr >= startStr && dateStr <= endStr;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    // ✅ FIX: Compare local dates without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate < today;
  };

  const isHoliday = (date) => {
    const dateStr = formatDate(date);
    return holidays.some(h => {
      const holidayDate = h.date.split('T')[0];
      return holidayDate === dateStr;
    });
  };

  const getHolidaysForDate = (date) => {
    const dateStr = formatDate(date);
    return holidays.filter(h => {
      // ✅ FIX: Ensure exact date match without timezone issues
      const holidayDate = h.date.split('T')[0];
      return holidayDate === dateStr;
    });
  };

  const handleMouseDown = (date) => {
    if (isPastDate(date)) return;
    
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateStr = formatDate(localDate);
    
    // ✅ CHECK: Is this an existing schedule?
    const isExisting = selectedRanges.some(range => 
      range.isExisting && dateStr >= range.start && dateStr <= range.end
    );
    
    if (isExisting) {
      return; // ✅ Cannot select existing schedule dates
    }
    
    // ✅ CHECK: Is this date already in NEW selections?
    const isAlreadySelected = selectedRanges.some(range => {
      return !range.isExisting && dateStr >= range.start && dateStr <= range.end;
    });
    
    if (isAlreadySelected) {
      // ✅ UNSELECT: Remove range containing this date (only NEW selections)
      if (typeof onRangeRemove === 'function') {
        onRangeRemove(dateStr);
      }
      return;
    }
    
    // ✅ Start new selection
    setIsDragging(true);
    setDragStart(localDate);
    setDragEnd(localDate);
  };

  const handleMouseEnter = (date) => {
    if (isDragging && !isPastDate(date)) {
      // ✅ FIX: Create new date object
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      setDragEnd(localDate);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      const start = dragStart < dragEnd ? dragStart : dragEnd;
      const end = dragStart < dragEnd ? dragEnd : dragStart;
      
      // ✅ FIX: Use formatDate which now uses local date
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      
      console.log('🔍 DEBUG - Selected:', { startStr, endStr, start, end });
      
      onRangeSelect(startStr, endStr);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="min-h-[80px] border border-almet-mystic/10 dark:border-almet-comet/10 bg-gray-50 dark:bg-gray-900/50"
        />
      );
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12, 0, 0);
      const dateStr = formatDate(date);
      
      const isSelected = isDateSelected(date);
      const inDragRange = isDateInDragRange(date);
      const today = isToday(date);
      const past = isPastDate(date);
      const holiday = isHoliday(date);
      const dayHolidays = getHolidaysForDate(date);
      
      // ✅ NEW: Check if date is in existing schedule
      const isExistingSchedule = selectedRanges.some(range => 
        range.isExisting && dateStr >= range.start && dateStr <= range.end
      );

      days.push(
        <div
          key={day}
          onMouseDown={() => !isExistingSchedule && handleMouseDown(date)}
          onMouseEnter={() => !isExistingSchedule && handleMouseEnter(date)}
          onMouseUp={handleMouseUp}
          className={`
            min-h-[80px] border border-almet-mystic/30 dark:border-almet-comet/30 p-2 
            transition-all select-none
            ${past ? 'bg-gray-100 dark:bg-gray-900/50 cursor-not-allowed opacity-50' : ''}
            ${isExistingSchedule ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 cursor-not-allowed' : ''}
            ${holiday && !past && !isExistingSchedule ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : ''}
            ${today && !past && !isExistingSchedule ? 'ring-2 ring-almet-sapphire dark:ring-almet-astral' : ''}
            ${isSelected && !past && !isExistingSchedule ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600' : ''}
            ${inDragRange && !past && !isSelected && !isExistingSchedule ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500' : ''}
            ${!past && !isSelected && !inDragRange && !holiday && !isExistingSchedule ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer' : ''}
          `}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`
              text-sm font-semibold
              ${today && !past ? 'text-almet-sapphire dark:text-almet-astral' : ''}
              ${past ? 'text-gray-400 dark:text-gray-600' : 'text-almet-cloud-burst dark:text-white'}
              ${holiday && !past ? 'text-red-600 dark:text-red-400' : ''}
              ${isExistingSchedule ? 'text-green-700 dark:text-green-400' : ''}
            `}>
              {day}
            </span>
            {isSelected && !isExistingSchedule && (
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
            {isExistingSchedule && (
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
            )}
          </div>
          
          {/* ✅ Existing Schedule Indicator */}
          {isExistingSchedule && !past && (
  <div className="space-y-0.5">
    {/* Get the schedule for this date to show status */}
    {(() => {
      const schedule = selectedRanges.find(range => 
        range.isExisting && dateStr >= range.start && dateStr <= range.end
      );
      
      return (
        <>
          <div className="text-[9px] text-green-700 dark:text-green-400 font-medium flex items-center gap-0.5">
            <CheckCircle className="w-2.5 h-2.5" />
            SCHEDULED
          </div>
          {schedule && schedule.status === 'PENDING_MANAGER' && (
            <div className="text-[8px] text-amber-600 dark:text-amber-400 font-medium">
              (Pending)
            </div>
          )}
        </>
      );
    })()}
  </div>
)}
          
          {/* ✅ Display holidays */}
          {dayHolidays.length > 0 && !past && (
            <div className="space-y-0.5 mb-1">
              {dayHolidays.map((h, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-1 text-[9px] text-red-700 dark:text-red-400"
                  title={h.name}
                >
                  <Star className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{h.name}</span>
                </div>
              ))}
              {dayHolidays.length > 1 && (
                <div className="text-[8px] text-red-600 dark:text-red-400 font-medium">
                  {dayHolidays.length} holidays
                </div>
              )}
            </div>
          )}
          
          {today && !past && (
            <div className="text-[9px] text-almet-sapphire dark:text-almet-astral font-medium">
              TODAY
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div onMouseLeave={handleMouseUp}>
      {/* Month/Year Quick Selector */}
      <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => handleYearChange(-1)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-almet-mystic dark:border-almet-comet rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-600"
          >
            ← {currentMonth.getFullYear() - 1}
          </button>
          <span className="text-sm font-bold text-almet-cloud-burst dark:text-white">
            {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => handleYearChange(1)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-almet-mystic dark:border-almet-comet rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-600"
          >
            {currentMonth.getFullYear() + 1} →
          </button>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-6 gap-2">
          {monthNames.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={`
                px-3 py-2 text-xs font-medium rounded-lg transition-all
                ${currentMonth.getMonth() === index
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-600'
                }
              `}
            >
              {month.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold text-almet-cloud-burst dark:text-white border-b border-almet-mystic/30 dark:border-almet-comet/30"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {loading ? (
          <div className="col-span-7 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* Instructions & Legend */}
      <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded"></div>
              <span className="text-almet-waterloo dark:text-gray-400">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 rounded flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-almet-waterloo dark:text-gray-400">Existing Schedule</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-600 rounded"></div>
              <span className="text-almet-waterloo dark:text-gray-400">New Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500 rounded"></div>
              <span className="text-almet-waterloo dark:text-gray-400">Dragging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 ring-2 ring-almet-sapphire dark:ring-almet-astral rounded"></div>
              <span className="text-almet-waterloo dark:text-gray-400">Today</span>
            </div>
          </div>
          <span className="text-almet-waterloo dark:text-gray-400 italic">
            Click and drag to select date ranges
          </span>
        </div>
      </div>
    </div>
  );
}