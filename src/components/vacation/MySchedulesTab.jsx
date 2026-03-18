// components/vacation/MySchedulesTab.jsx

import {
  Download, Edit, Trash, Check, Eye, Calendar,
  CheckCircle, XCircle, Clock, AlertCircle, Info,
  CalendarDays, Users
} from 'lucide-react';
import { useState } from 'react';
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

  const currentSchedules = scheduleTabs[activeSubTab] || [];
  const totalPages = Math.ceil(currentSchedules.length / itemsPerPage);
  const paginated = currentSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const canDeleteSchedule = () => userAccess.is_admin;
  const canRegisterSchedule = s => userAccess.is_admin && s.status === 'SCHEDULED';
  const canApproveSchedule = s =>
    (userAccess.is_manager || userAccess.is_admin) && s.status === 'PENDING_MANAGER';

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
            onClick={() => { setActiveSubTab(tab.key); setCurrentPage(1); }}
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
        {currentSchedules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
            <div className="w-16 h-16 bg-almet-mystic/30 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-almet-waterloo/40 dark:text-almet-bali-hai/40" />
            </div>
            <p className="text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">No schedules yet</p>
            <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 max-w-xs">
              {activeSubTab === 'upcoming'
                ? 'Go to the "Planning" tab to schedule your vacation dates for the year.'
                : 'No schedules found for this view.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Edits Used', 'Actions'].map(h => (
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

            {currentSchedules.length > itemsPerPage && (
              <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={currentSchedules.length}
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