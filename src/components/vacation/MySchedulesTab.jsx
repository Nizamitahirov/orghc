// components/vacation/MySchedulesTab.jsx - WITH PAGINATION & EMPLOYEE FILTER

import { Download, Edit, Trash, Check, Eye, Calendar, CheckCircle, XCircle, Filter, X, Search, BarChart3 } from 'lucide-react';
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
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    vacation_type: '',
    start_date: '',
    end_date: '',
    employee_name: '' // ✅ NEW
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getSubTabs = () => {
    const tabs = [
      { key: 'upcoming', label: 'My Upcoming', count: scheduleTabs.upcoming?.length || 0 }
    ];

    if (userAccess.is_manager || userAccess.is_admin) {
      tabs.push({ 
        key: 'peers', 
        label: 'My Team', 
        count: scheduleTabs.peers?.length || 0 
      });
    }

    tabs.push({ 
      key: 'all', 
      label: userAccess.is_admin ? 'All Schedules' : 'My Peers',
      count: scheduleTabs.all?.length || 0 
    });

    return tabs;
  };

  const subTabs = getSubTabs();
  const currentSchedules = scheduleTabs[activeSubTab] || [];

  const getFilteredSchedules = () => {
    let filtered = currentSchedules;
    
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }
    
    if (filters.vacation_type) {
      filtered = filtered.filter(s => 
        s.vacation_type_name?.toLowerCase().includes(filters.vacation_type.toLowerCase())
      );
    }
    
    if (filters.start_date) {
      filtered = filtered.filter(s => s.start_date >= filters.start_date);
    }
    
    if (filters.end_date) {
      filtered = filtered.filter(s => s.end_date <= filters.end_date);
    }
    
    // ✅ Employee name filter
    if (filters.employee_name) {
      filtered = filtered.filter(s => 
        s.employee_name?.toLowerCase().includes(filters.employee_name.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredSchedules = getFilteredSchedules();
  
  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const canDeleteSchedule = (schedule) => {
    return userAccess.is_admin;
  };

  const canRegisterSchedule = (schedule) => {
    return userAccess.is_admin && schedule.status === 'SCHEDULED';
  };

  const canApproveSchedule = (schedule) => {
    return (userAccess.is_manager || userAccess.is_admin) && 
           schedule.status === 'PENDING_MANAGER';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
              My Schedules
            </h2>
            <div className="flex items-center gap-2">
              {/* ✅ Planning Statistics Button */}
              {(userAccess.is_manager || userAccess.is_admin) && (
                <button
                  onClick={() => setShowStatsModal(true)}
                  className="px-2.5 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <BarChart3 className="w-3 h-3" />
                  Planning Stats
                </button>
              )}

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-2.5 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all flex items-center gap-1.5"
              >
                <Filter className="w-3 h-3" />
                Filter
              </button>
              
              <button 
                onClick={handleExportSchedules} 
                className="px-2.5 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="grid grid-cols-5 gap-3">
                {/* ✅ Employee Name Filter */}
                <div>
                  <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                    Employee
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-almet-waterloo dark:text-gray-400" />
                    <input
                      type="text"
                      value={filters.employee_name}
                      onChange={(e) => handleFilterChange({...filters, employee_name: e.target.value})}
                      placeholder="Search employee..."
                      className="w-full pl-7 pr-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange({...filters, status: e.target.value})}
                    className="w-full px-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="PENDING_MANAGER">Pending Manager</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="REGISTERED">Registered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                    Leave Type
                  </label>
                  <input
                    type="text"
                    value={filters.vacation_type}
                    onChange={(e) => handleFilterChange({...filters, vacation_type: e.target.value})}
                    placeholder="Search..."
                    className="w-full px-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange({...filters, start_date: e.target.value})}
                    className="w-full px-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange({...filters, end_date: e.target.value})}
                    className="w-full px-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleFilterChange({ status: '', vacation_type: '', start_date: '', end_date: '', employee_name: '' })}
                  className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-almet-mystic dark:border-almet-comet rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2"> 
            {subTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveSubTab(tab.key);
                  setCurrentPage(1); // Reset pagination
                }}
                className={`
                  relative px-4 py-2 rounded-lg font-medium text-xs transition-all 
                  ${activeSubTab === tab.key
                    ? 'bg-almet-sapphire text-white shadow-lg scale-105'
                    : 'bg-almet-mystic/30 dark:bg-gray-700 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/50 dark:hover:bg-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{tab.label}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-bold 
                    ${activeSubTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-almet-sapphire/20 text-almet-sapphire dark:bg-almet-astral/20 dark:text-almet-astral'
                    }
                  `}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
            <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
              <tr>
                {['Employee', 'Type', 'Start', 'End', 'Days', 'Status', 'Edit Count', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide"> 
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
              {paginatedSchedules.map(schedule => (
                <tr key={schedule.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-3 py-2 text-xs font-medium text-almet-cloud-burst dark:text-white">
                    {schedule.employee_name}
                  </td>
                  <td className="px-3 py-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {schedule.vacation_type_name}
                  </td>
                  <td className="px-3 py-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {schedule.start_date}
                  </td>
                  <td className="px-3 py-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {schedule.end_date}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-almet-cloud-burst dark:text-white">
                    {schedule.number_of_days}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      schedule.status === 'PENDING_MANAGER'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : schedule.status === 'SCHEDULED' 
                        ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' 
                        : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {schedule.status_display}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-center">
                    <span className={`font-semibold ${
                      schedule.edit_count >= maxScheduleEdits 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-almet-waterloo dark:text-almet-bali-hai'
                    }`}>
                      {schedule.edit_count}/{maxScheduleEdits}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex gap-1.5"> 
                      <button 
                        onClick={() => handleViewScheduleDetail(schedule.id)}
                        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>

                      {canApproveSchedule(schedule) && (
                        <>
                          <button 
                            onClick={() => {
                              setApprovingSchedule(schedule);
                              setShowApproveModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
                            title="Approve"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => {
                              setApprovingSchedule(schedule);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 font-medium"
                            title="Reject"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      {canEditSchedule(schedule) && (
                        <button 
                          onClick={() => handleEditSchedule(schedule)} 
                          className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      )}
                      
                      {canDeleteSchedule(schedule) && (
                        <button 
                          onClick={() => handleDeleteSchedule(schedule.id)} 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 font-medium"
                          title="Delete (Admin)"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      )}
                      
                      {canRegisterSchedule(schedule) && (
                        <button 
                          onClick={() => handleRegisterSchedule(schedule.id)} 
                          className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
                          title="Register (Admin)"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedSchedules.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center"> 
                    <Calendar className="w-8 h-8 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-2" /> 
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                      {filteredSchedules.length === 0 && currentSchedules.length > 0 
                        ? 'No schedules match current filters' 
                        : 'No schedules found'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
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
      </div>

      {/* Approve Modal */}
      {showApproveModal && approvingSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet">
            <div className="px-5 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Approve Schedule
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                Approve schedule for <strong>{approvingSchedule.employee_name}</strong>?
              </p>
              
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Comment (Optional)
                </label>
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  rows={3}
                  placeholder="Add approval comment..."
                  className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-almet-mystic/30 dark:border-almet-comet/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApprovingSchedule(null);
                  setApproveComment('');
                }}
                disabled={loading}
                className="px-4 py-2 text-xs border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await VacationService.approveSchedule(approvingSchedule.id, {
                      action: 'approve',
                      comment: approveComment
                    });
                    showSuccess?.('Schedule approved successfully');
                    setShowApproveModal(false);
                    setApprovingSchedule(null);
                    setApproveComment('');
                    window.location.reload();
                  } catch (error) {
                    console.error('Approve error:', error);
                    showError?.('Failed to approve schedule');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && approvingSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet">
            <div className="px-5 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Reject Schedule
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                Reject schedule for <strong>{approvingSchedule.employee_name}</strong>?
              </p>
              
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Reason (Optional)
                </label>
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  rows={3}
                  placeholder="Add rejection reason..."
                  className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-almet-mystic/30 dark:border-almet-comet/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setApprovingSchedule(null);
                  setApproveComment('');
                }}
                disabled={loading}
                className="px-4 py-2 text-xs border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await VacationService.approveSchedule(approvingSchedule.id, {
                      action: 'reject',
                      comment: approveComment
                    });
                    showSuccess?.('Schedule rejected successfully');
                    setShowRejectModal(false);
                    setApprovingSchedule(null);
                    setApproveComment('');
                    window.location.reload();
                  } catch (error) {
                    console.error('Reject error:', error);
                    showError?.('Failed to reject schedule');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ Planning Statistics Modal */}
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