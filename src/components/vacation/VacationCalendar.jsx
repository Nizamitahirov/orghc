// components/vacation/VacationCalendar.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, Filter, X, Star, Shield, Globe } from 'lucide-react';
import { VacationService } from '@/services/vacationService';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { DayDetailModal } from './DayDetailModal';

const VacationCalendar = ({ darkMode, showError, userAccess }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ NEW: Country selection state
  const [selectedCountry, setSelectedCountry] = useState('auto'); // 'auto', 'az', 'uk'
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    employee_id: '',
    department_id: '',
    business_function_id: ''
  });
  
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [businessFunctions, setBusinessFunctions] = useState([]);
  
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const getHolidaysForDate = (date) => {
  // ✅ FIX: Create proper local date string
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  console.log('🔍 Checking date:', dateStr); // Debug
  
  return holidays.filter(h => {
    // ✅ Compare ONLY date part (ignore time)
    const holidayDate = h.date.split('T')[0];
    const match = holidayDate === dateStr;
    
    if (match) {
      console.log('✅ Match found:', h.name, holidayDate);
    }
    
    return match;
  });
};

  const handleDayClick = (date, dayHolidays, dayVacations) => {
    setSelectedDay({
      date,
      holidays: dayHolidays,
      vacations: dayVacations
    });
    setShowDayDetail(true);
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, filters, selectedCountry]); // ✅ Add selectedCountry

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      // ✅ Build params with country
      const params = {
        month,
        year,
        ...filters
      };
      
      // ✅ Add country param if not auto
      if (selectedCountry !== 'auto') {
        params.country = selectedCountry;
      }
      
      const data = await VacationService.getCalendarEvents(params);
      
      setHolidays(data.holidays || []);
      setVacations(data.vacations || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Calendar fetch error:', error);
      showError?.('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const allRecords = await VacationService.getAllVacationRecords({});
      
      if (allRecords && allRecords.records) {
        const uniqueEmployees = new Map();
        allRecords.records.forEach(record => {
          if (record.employee_id && !uniqueEmployees.has(record.employee_id)) {
            uniqueEmployees.set(record.employee_id, {
              id: record.employee_id,
              name: record.employee_name,
              employee_id: record.employee_id
            });
          }
        });
        setEmployees(Array.from(uniqueEmployees.values()));

        const uniqueBusinessFunctions = new Map();
        allRecords.records.forEach(record => {
          if (record.business_function && !uniqueBusinessFunctions.has(record.business_function)) {
            uniqueBusinessFunctions.set(record.business_function, {
              id: record.business_function,
              name: record.business_function
            });
          }
        });
        setBusinessFunctions(Array.from(uniqueBusinessFunctions.values()));

        const uniqueDepartments = new Map();
        allRecords.records.forEach(record => {
          if (record.department && !uniqueDepartments.has(record.department)) {
            uniqueDepartments.set(record.department, {
              id: record.department,
              name: record.department
            });
          }
        });
        setDepartments(Array.from(uniqueDepartments.values()));
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      showError?.('Failed to load filter options');
    }
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

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const holidaysOnDate = holidays.filter(h => h.date === dateStr);
    const vacationsOnDate = vacations.filter(v => {
      return dateStr >= v.start_date && dateStr <= v.end_date;
    });
    
    return { holidays: holidaysOnDate, vacations: vacationsOnDate };
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const clearFilters = () => {
    setFilters({
      employee_id: '',
      department_id: '',
      business_function_id: ''
    });
  };

  const getAccessLevelText = () => {
    if (userAccess.is_admin) {
      return 'Viewing all employees';
    } else if (userAccess.is_manager) {
      return 'Viewing your team';
    }
    return 'Viewing your calendar';
  };

  // ✅ Get calendar type display
  const getCalendarTypeDisplay = () => {
    if (selectedCountry === 'auto') {
      return summary?.calendar_auto_detected 
        ? `Auto (${summary?.country || 'AZ'})` 
        : 'Auto';
    }
    return selectedCountry.toUpperCase();
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] border border-almet-mystic/10 dark:border-almet-comet/10 bg-gray-50 dark:bg-gray-900/50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { holidays: dayHolidays, vacations: dayVacations } = getEventsForDate(date);
      const today = isToday(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(date, dayHolidays, dayVacations)}
          className={`cursor-pointer min-h-[120px] border border-almet-mystic/30 dark:border-almet-comet/30 p-2 transition-all ${
            today
              ? 'bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border-almet-sapphire dark:border-almet-astral'
              : 'bg-white dark:bg-gray-800 hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${
              today ? 'text-almet-sapphire dark:text-almet-astral' : 'text-almet-cloud-burst dark:text-white'
            }`}>
              {day}
            </span>
            {(dayHolidays.length > 0 || dayVacations.length > 0) && (
              <span className="text-[10px] bg-almet-sapphire/10 dark:bg-almet-astral/10 text-almet-sapphire dark:text-almet-astral px-1.5 py-0.5 rounded">
                {dayHolidays.length + dayVacations.length}
              </span>
            )}
          </div>

          {/* ✅ Display ALL holidays for this date */}
          {dayHolidays.map((holiday, idx) => (
            <div
              key={`holiday-${idx}`}
              className="mb-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] rounded truncate"
              title={holiday.name}
            >
              <Star className="w-2.5 h-2.5 inline mr-1" />
              {holiday.name}
            </div>
          ))}

          {/* Show vacation count if multiple */}
          {dayHolidays.length > 1 && (
            <div className="text-[9px] text-red-600 dark:text-red-400 font-medium mb-1">
              {dayHolidays.length} holidays
            </div>
          )}

          {dayVacations.slice(0, 3).map((vacation, idx) => (
            <div
              key={`vacation-${idx}`}
              className={`mb-1 px-2 py-1 text-[10px] rounded truncate ${
                vacation.status_code === 'APPROVED'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : vacation.status_code === 'SCHEDULED'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}
              title={`${vacation.employee_name} - ${vacation.vacation_type}`}
            >
              <div className="font-medium truncate">{vacation.employee_name}</div>
              <div className="text-[9px] opacity-75 truncate">{vacation.vacation_type}</div>
            </div>
          ))}

          {dayVacations.length > 3 && (
            <div className="text-[10px] text-almet-waterloo dark:text-gray-400 text-center mt-1">
              +{dayVacations.length - 3} more
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Shield className={`w-3.5 h-3.5 ${
              userAccess.is_admin 
                ? 'text-purple-600 dark:text-purple-400'
                : userAccess.is_manager
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-green-600 dark:text-green-400'
            }`} />
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
              {getAccessLevelText()}
            </p>
            {/* ✅ Calendar Type Display */}
            {summary && (
              <>
                <span className="text-almet-waterloo dark:text-almet-bali-hai">•</span>
                <Globe className="w-3.5 h-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  Calendar: {getCalendarTypeDisplay()}
                </span>
              </>
            )}
          </div>
        </div>

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

          {(userAccess.is_admin || userAccess.is_manager) && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-600 dark:text-red-400 mb-1">Holidays</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.total_holidays}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Vacations</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.total_vacations}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Employees</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.employees_on_vacation}</div>
          </div>
          {/* ✅ Calendar Info Card */}
          <div className={`rounded-lg p-4 border ${
            summary.country === 'UK' 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className={`text-sm mb-1 ${
              summary.country === 'UK'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              Calendar Type
            </div>
            <div className={`text-2xl font-bold ${
              summary.country === 'UK'
                ? 'text-red-700 dark:text-red-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}>
              {summary.country}
            </div>
            {summary.calendar_auto_detected && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Auto-detected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters - Only for Manager and Admin */}
      {showFilters && (userAccess.is_admin || userAccess.is_manager) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-almet-cloud-burst dark:text-white">
              Filter Calendar
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                Employee
              </label>
              <SearchableDropdown
                options={employees.map(emp => ({
                  value: emp.id,
                  label: `${emp.name} (${emp.employee_id})`
                }))}
                value={filters.employee_id}
                onChange={(value) => setFilters(prev => ({ ...prev, employee_id: value || '' }))}
                placeholder="All Employees"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                Company
              </label>
              <SearchableDropdown
                options={businessFunctions.map(bf => ({
                  value: bf.id,
                  label: bf.name
                }))}
                value={filters.business_function_id}
                onChange={(value) => setFilters(prev => ({ ...prev, business_function_id: value || '' }))}
                placeholder="All Companies"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                Department
              </label>
              <SearchableDropdown
                options={departments.map(dept => ({
                  value: dept.id,
                  label: dept.name
                }))}
                value={filters.department_id}
                onChange={(value) => setFilters(prev => ({ ...prev, department_id: value || '' }))}
                placeholder="All Departments"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
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

            <div className="grid grid-cols-7">
              {renderCalendar()}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Pending</span>
        </div>
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
};

export default VacationCalendar;