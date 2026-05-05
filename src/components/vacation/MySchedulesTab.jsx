// components/vacation/MySchedulesTab.jsx

import {
  Download, Edit, Trash, Check, Eye, Calendar,
  CheckCircle, XCircle, Clock, Info,
  CalendarDays, Users, Filter, X, Search
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { VacationService } from '@/services/vacationService';
import Pagination from '@/components/common/Pagination';
import PlanningStatisticsModal from './PlanningStatisticsModal';

export default function MySchedulesTab({
  userAccess,
  scheduleTabs,
  handleExportSchedules,
  handleEditSchedule,
  handleDeleteSchedule,
  handleRegisterSchedule,
  canEditSchedule,
  maxScheduleEdits,
  handleViewScheduleDetail,
  showSuccess,
  showError,
  darkMode
}) {
  const [activeSubTab, setActiveSubTab] = useState('upcoming');
  const [approvingSchedule, setApprovingSchedule] = useState(null);
  const [approveComment, setApproveComment] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Filter state ──────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    employee_name: '',
    business_function: '',
    start_date: '',
    end_date: '',
  });

  const resetFilters = () => {
    setFilters({ employee_name: '', business_function: '', start_date: '', end_date: '' });
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  // ── Derive unique business functions from current tab's data ──
  const businessFunctionOptions = useMemo(() => {
    const raw = scheduleTabs[activeSubTab] || [];
    const set = new Set(raw.map(s => s.business_function_name).filter(Boolean));
    return [...set].sort();
  }, [scheduleTabs, activeSubTab]);

  // ── Filtered + paginated data ─────────────────────────────
  const filteredSchedules = useMemo(() => {
    const raw = scheduleTabs[activeSubTab] || [];
    return raw.filter(s => {
      if (filters.employee_name && !s.employee_name?.toLowerCase().includes(filters.employee_name.toLowerCase())) return false;
      if (filters.business_function && s.business_function_name !== filters.business_function) return false;
      if (filters.start_date && s.start_date < filters.start_date) return false;
      if (filters.end_date && s.end_date > filters.end_date) return false;
      return true;
    });
  }, [scheduleTabs, activeSubTab, filters]);

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const paginated = filteredSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const canDeleteSchedule = () => userAccess.is_admin;
  const canRegisterSchedule = s => userAccess.is_admin && s.status === 'SCHEDULED';
  const canApproveSchedule = s =>
    (userAccess.is_manager || userAccess.is_admin) && s.status === 'PENDING_MANAGER';

  const subTabs = [
    { key: 'upcoming', label: 'My Upcoming', description: 'Your planned vacations', count: scheduleTabs.upcoming?.length || 0 },
    ...(userAccess.is_manager || userAccess.is_admin
      ? [{ key: 'peers', label: 'My Team', description: "Team members' schedules", count: scheduleTabs.peers?.length || 0 }]
      : []),
    {
      key: 'all',
      label: userAccess.is_admin ? 'All Schedules' : 'My Peers',
      description: userAccess.is_admin ? 'All employees' : 'Colleagues schedules',
      count: scheduleTabs.all?.length || 0
    },
  ];

  const getStatusBadge = (status, display) => {
    const cfg = {
      PENDING_MANAGER: { style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock className="w-3 h-3" />, label: 'Waiting for Approval' },
      SCHEDULED:       { style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',   icon: <CalendarDays className="w-3 h-3" />, label: 'Scheduled' },
      REGISTERED:      { style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle className="w-3 h-3" />, label: 'Registered' },
    };
    const c = cfg[status] || { style: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', icon: null, label: display || status };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${c.style}`}>
        {c.icon}{c.label}
      </span>
    );
  };

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-almet-cloud-burst dark:text-white">Vacation Schedules</h2>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
            Pre-planned vacation dates that have been submitted for the year
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(userAccess.is_manager || userAccess.is_admin) && (
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              Planning Overview
            </button>
          )}
          <button
            onClick={handleExportSchedules}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Info Banner ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">What are schedules?</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            Schedules are vacation dates you plan in advance for the year. They go through an approval process
            and once approved become <strong>Scheduled</strong>. An admin then marks them as <strong>Registered</strong> when finalized.
          </p>
        </div>
      </div>

      {/* ── Sub Tabs ── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${subTabs.length}, 1fr)` }}>
        {subTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveSubTab(tab.key); setCurrentPage(1); resetFilters(); }}
            className={`rounded-xl border p-3 text-left transition-all ${
              activeSubTab === tab.key
                ? 'bg-almet-sapphire border-almet-sapphire text-white shadow-md'
                : 'bg-white dark:bg-gray-800 border-almet-mystic/50 dark:border-almet-comet text-almet-cloud-burst dark:text-white hover:border-almet-sapphire/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${activeSubTab === tab.key ? 'text-white' : 'text-almet-cloud-burst dark:text-white'}`}>
                {tab.label}
              </p>
              <span className={`text-lg font-bold ${activeSubTab === tab.key ? 'text-white' : 'text-almet-sapphire dark:text-almet-astral'}`}>
                {tab.count}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${activeSubTab === tab.key ? 'text-blue-100' : 'text-almet-waterloo dark:text-almet-bali-hai'}`}>
              {tab.description}
            </p>
          </button>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm overflow-hidden">

        {/* ── Filter Bar ── */}
        <div className="px-4 py-3 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
              {filteredSchedules.length} record{filteredSchedules.length !== 1 ? 's' : ''}
              {activeFilterCount > 0 && ` (filtered from ${scheduleTabs[activeSubTab]?.length || 0})`}
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-almet-sapphire text-white border-almet-sapphire'
                : 'border-almet-bali-hai/40 dark:border-almet-comet text-almet-waterloo dark:text-almet-bali-hai hover:border-almet-sapphire/50'
            }`}
          >
            <Filter className="w-3 h-3" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-white text-almet-sapphire text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="px-4 py-4 bg-almet-mystic/20 dark:bg-gray-700/30 border-b border-almet-mystic/30 dark:border-almet-comet/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Employee name */}
              <div>
                <label className="block text-[11px] font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                  Employee
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-almet-waterloo/60" />
                  <input
                    type="text"
                    value={filters.employee_name}
                    onChange={e => { setFilters(p => ({ ...p, employee_name: e.target.value })); setCurrentPage(1); }}
                    placeholder="Search name..."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-almet-bali-hai/30 dark:border-almet-comet rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white outline-none focus:ring-1 focus:ring-almet-sapphire/50"
                  />
                  {filters.employee_name && (
                    <button onClick={() => setFilters(p => ({ ...p, employee_name: '' }))} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <X className="w-3 h-3 text-almet-waterloo/60 hover:text-red-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Business function (company) */}
              <div>
                <label className="block text-[11px] font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                  Company
                </label>
                <select
                  value={filters.business_function}
                  onChange={e => { setFilters(p => ({ ...p, business_function: e.target.value })); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs border border-almet-bali-hai/30 dark:border-almet-comet rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white outline-none focus:ring-1 focus:ring-almet-sapphire/50"
                >
                  <option value="">All companies</option>
                  {businessFunctionOptions.map(bf => (
                    <option key={bf} value={bf}>{bf}</option>
                  ))}
                </select>
              </div>

              {/* Start date from */}
              <div>
                <label className="block text-[11px] font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                  Start date (from)
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={e => { setFilters(p => ({ ...p, start_date: e.target.value })); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs border border-almet-bali-hai/30 dark:border-almet-comet rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white outline-none focus:ring-1 focus:ring-almet-sapphire/50"
                />
              </div>

              {/* End date to */}
              <div>
                <label className="block text-[11px] font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                  End date (to)
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={e => { setFilters(p => ({ ...p, end_date: e.target.value })); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs border border-almet-bali-hai/30 dark:border-almet-comet rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white outline-none focus:ring-1 focus:ring-almet-sapphire/50"
                />
              </div>
            </div>
          </div>
        )}

        {filteredSchedules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
            <div className="w-16 h-16 bg-almet-mystic/30 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-almet-waterloo/40 dark:text-almet-bali-hai/40" />
            </div>
            <p className="text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
              {activeFilterCount > 0 ? 'No schedules match your filters' : 'No schedules yet'}
            </p>
            <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 max-w-xs">
              {activeFilterCount > 0
                ? 'Try adjusting or clearing the filters above.'
                : activeSubTab === 'upcoming'
                  ? 'Go to the "Planning" tab to schedule your vacation dates for the year.'
                  : 'No schedules found for this view.'}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-xs text-almet-sapphire hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Employee', 'Company', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Edits Used', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  {paginated.map(schedule => (
                    <tr key={schedule.id} className="hover:bg-almet-mystic/10 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{schedule.employee_name}</p>
                        {schedule.department && (
                          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{schedule.department}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {schedule.business_function_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {schedule.vacation_type_name}
                      </td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.start_date}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.end_date}</td>
                      <td className="px-4 py-3 text-xs font-bold text-almet-cloud-burst dark:text-white">{schedule.number_of_days}</td>
                      <td className="px-4 py-3">{getStatusBadge(schedule.status, schedule.status_display)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: maxScheduleEdits }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < schedule.edit_count ? 'bg-almet-sapphire' : 'bg-almet-mystic dark:bg-gray-600'}`} />
                          ))}
                          <span className={`text-xs ml-1 ${schedule.edit_count >= maxScheduleEdits ? 'text-red-500' : 'text-almet-waterloo dark:text-almet-bali-hai'}`}>
                            {schedule.edit_count}/{maxScheduleEdits}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleViewScheduleDetail(schedule.id)}
                            title="View details"
                            className="p-1.5 rounded-lg text-almet-sapphire hover:bg-almet-sapphire/10 dark:text-almet-astral transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canApproveSchedule(schedule) && (
                            <>
                              <button
                                onClick={() => { setApprovingSchedule(schedule); setShowApproveModal(true); }}
                                title="Approve"
                                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setApprovingSchedule(schedule); setShowRejectModal(true); }}
                                title="Reject"
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {canEditSchedule(schedule) && (
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              title="Edit dates"
                              className="p-1.5 rounded-lg text-almet-sapphire hover:bg-almet-sapphire/10 dark:text-almet-astral transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canRegisterSchedule(schedule) && (
                            <button
                              onClick={() => handleRegisterSchedule(schedule.id)}
                              title="Mark as Registered"
                              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            >
                              <Check className="w-3 h-3" /> Register
                            </button>
                          )}

                          {canDeleteSchedule() && (
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSchedules.length > itemsPerPage && (
              <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredSchedules.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  darkMode={darkMode}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Approve Modal ── */}
      {showApproveModal && approvingSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet">
            <div className="px-6 py-5 border-b border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white">Approve Schedule</h3>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                    {approvingSchedule.employee_name} · {approvingSchedule.start_date} → {approvingSchedule.end_date}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Comment <span className="text-almet-waterloo">(optional)</span>
              </label>
              <textarea
                value={approveComment}
                onChange={e => setApproveComment(e.target.value)}
                rows={3}
                placeholder="Add a note for the employee..."
                className="w-full px-3 py-2.5 text-sm border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => { setShowApproveModal(false); setApprovingSchedule(null); setApproveComment(''); }}
                className="px-4 py-2 text-xs border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await VacationService.approveSchedule(approvingSchedule.id, { action: 'approve', comment: approveComment });
                    showSuccess?.('Schedule approved successfully');
                    setShowApproveModal(false); setApprovingSchedule(null); setApproveComment('');
                    window.location.reload();
                  } catch { showError?.('Failed to approve'); }
                  finally { setLoading(false); }
                }}
                className="px-5 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && approvingSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet">
            <div className="px-6 py-5 border-b border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white">Reject Schedule</h3>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                    {approvingSchedule.employee_name} · {approvingSchedule.start_date} → {approvingSchedule.end_date}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Reason <span className="text-almet-waterloo">(optional)</span>
              </label>
              <textarea
                value={approveComment}
                onChange={e => setApproveComment(e.target.value)}
                rows={3}
                placeholder="Explain why you are rejecting this schedule..."
                className="w-full px-3 py-2.5 text-sm border outline-0 focus:ring-1 focus:ring-red-400 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setApprovingSchedule(null); setApproveComment(''); }}
                className="px-4 py-2 text-xs border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await VacationService.approveSchedule(approvingSchedule.id, { action: 'reject', comment: approveComment });
                    showSuccess?.('Schedule rejected');
                    setShowRejectModal(false); setApprovingSchedule(null); setApproveComment('');
                    window.location.reload();
                  } catch { showError?.('Failed to reject'); }
                  finally { setLoading(false); }
                }}
                className="px-5 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <PlanningStatisticsModal
        show={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        darkMode={darkMode}
        userAccess={userAccess}
        showSuccess={showSuccess}
        showError={showError}
      />
    </div>
  );
}