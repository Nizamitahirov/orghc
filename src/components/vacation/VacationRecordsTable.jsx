// components/vacation/VacationRecordsTable.jsx
// Vahid Records tab:
//   - Employee → yalnız öz request-ləri
//   - Manager  → komandanın request-ləri + employee filter
//   - Admin    → hamının request-ləri + employee filter

import { useState } from 'react';
import { Download, Eye, Paperclip, FileText, Filter, X, Calendar, Search } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import SearchableDropdown from '@/components/common/SearchableDropdown';

export default function VacationRecordsTable({
  // employee üçün
  myAllRecords = [],
  handleExportMyVacations,

  // admin/manager üçün
  allVacationRecords = [],
  fetchAllVacationRecords,
  handleExportAllRecords,
  adminFilters,
  setAdminFilters,
  businessFunctions = [],
  departments = [],

  // ortaq
  handleViewDetails,
  handleViewAttachments,
  userAccess,
  darkMode,
}) {
  const isPrivileged = userAccess.is_admin || userAccess.is_manager;

  // Admin/manager üçün server-side filter state-i yuxarıdan gəlir (adminFilters).
  // Employee üçün client-side filter.
  const [clientFilters, setClientFilters] = useState({
    status: '',
    vacation_type: '',
    start_date: '',
    end_date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Data source ──────────────────────────────────────────────
  // Hər iki mənbədən yalnız request-ləri al
  const rawRecords = isPrivileged
    ? allVacationRecords.filter(r => r.type === 'request')
    : myAllRecords.filter(r => r.type === 'request');

  // Employee client-side filter
  const filtered = isPrivileged
    ? rawRecords   // admin/manager üçün server filter işləyir
    : rawRecords.filter(r => {
        if (clientFilters.status && !r.status?.toLowerCase().includes(clientFilters.status.toLowerCase())) return false;
        if (clientFilters.vacation_type && !r.vacation_type?.toLowerCase().includes(clientFilters.vacation_type.toLowerCase())) return false;
        if (clientFilters.start_date && r.start_date < clientFilters.start_date) return false;
        if (clientFilters.end_date && r.end_date > clientFilters.end_date) return false;
        return true;
      });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetPage = () => setCurrentPage(1);

  // ── Helpers ──────────────────────────────────────────────────
  const getStatusStyle = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('approved')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (s.includes('pending'))  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    if (s.includes('rejected')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  };

  const clientHasFilters = Object.values(clientFilters).some(v => v !== '');
  const adminHasFilters  = adminFilters
    ? Object.values(adminFilters).some(v => v !== '')
    : false;
  const hasActiveFilters = isPrivileged ? adminHasFilters : clientHasFilters;

  // ── Stats ─────────────────────────────────────────────────────
  const stats = [
    { label: 'Total',    value: rawRecords.length,                                                           color: 'text-almet-sapphire',  bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'   },
    { label: 'Approved', value: rawRecords.filter(r => r.status?.toLowerCase().includes('approved')).length, color: 'text-green-600',        bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
    { label: 'Pending',  value: rawRecords.filter(r => r.status?.toLowerCase().includes('pending')).length,  color: 'text-amber-600',        bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    { label: 'Rejected', value: rawRecords.filter(r => r.status?.toLowerCase().includes('rejected')).length, color: 'text-red-500',          bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'         },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-almet-cloud-burst dark:text-white">
            {isPrivileged
              ? (userAccess.is_admin ? 'All Vacation Requests' : 'Team Vacation Requests')
              : 'My Vacation Requests'}
          </h2>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
            {isPrivileged
              ? 'View and manage submitted vacation requests'
              : 'Vacation requests you have submitted'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowFilters(v => !v); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-almet-sapphire text-white border-almet-sapphire'
                : 'bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white border-almet-bali-hai/40 dark:border-almet-comet hover:border-almet-sapphire'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-almet-sapphire rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                !
              </span>
            )}
          </button>
          <button
            onClick={isPrivileged ? handleExportAllRecords : handleExportMyVacations}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Filter Requests</p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  if (isPrivileged) {
                    setAdminFilters({ status: '', vacation_type_id: '', department_id: '', business_function_id: '', start_date: '', end_date: '', employee_name: '', year: '' });
                    fetchAllVacationRecords?.();
                  } else {
                    setClientFilters({ status: '', vacation_type: '', start_date: '', end_date: '' });
                  }
                  resetPage();
                }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* ── Admin / Manager filters (server-side) ── */}
          {isPrivileged && adminFilters && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Employee name search */}
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                    Employee Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-almet-waterloo dark:text-gray-400" />
                    <input
                      type="text"
                      value={adminFilters.employee_name}
                      onChange={e => setAdminFilters(p => ({ ...p, employee_name: e.target.value }))}
                      placeholder="Search by name"
                      className="w-full pl-9 pr-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Company</label>
                  <SearchableDropdown
                    options={businessFunctions.map(bf => ({ value: bf.id, label: bf.name }))}
                    value={adminFilters.business_function_id}
                    onChange={v => setAdminFilters(p => ({ ...p, business_function_id: v || '' }))}
                    placeholder="All Companies"
                    allowUncheck
                    darkMode={darkMode}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Department</label>
                  <SearchableDropdown
                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                    value={adminFilters.department_id}
                    onChange={v => setAdminFilters(p => ({ ...p, department_id: v || '' }))}
                    placeholder="All Departments"
                    allowUncheck
                    darkMode={darkMode}
                  />
                </div>

                {/* Start date */}
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">From Date</label>
                  <input
                    type="date"
                    value={adminFilters.start_date}
                    onChange={e => setAdminFilters(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* End date */}
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">To Date</label>
                  <input
                    type="date"
                    value={adminFilters.end_date}
                    onChange={e => setAdminFilters(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Year</label>
                  <input
                    type="number"
                    value={adminFilters.year}
                    onChange={e => setAdminFilters(p => ({ ...p, year: e.target.value }))}
                    placeholder={new Date().getFullYear()}
                    className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { fetchAllVacationRecords?.(); resetPage(); }}
                  className="px-5 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* ── Employee filters (client-side) ── */}
          {!isPrivileged && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Status</label>
                <select
                  value={clientFilters.status}
                  onChange={e => { setClientFilters(p => ({ ...p, status: e.target.value })); resetPage(); }}
                  className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Leave Type</label>
                <input
                  type="text"
                  value={clientFilters.vacation_type}
                  onChange={e => { setClientFilters(p => ({ ...p, vacation_type: e.target.value })); resetPage(); }}
                  placeholder="e.g. Paid Vacation"
                  className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">From Date</label>
                <input
                  type="date"
                  value={clientFilters.start_date}
                  onChange={e => { setClientFilters(p => ({ ...p, start_date: e.target.value })); resetPage(); }}
                  className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">To Date</label>
                <input
                  type="date"
                  value={clientFilters.end_date}
                  onChange={e => { setClientFilters(p => ({ ...p, end_date: e.target.value })); resetPage(); }}
                  className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-3">
            Showing <strong>{filtered.length}</strong> of <strong>{rawRecords.length}</strong> requests
          </p>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {[
                  'Request ID',
                  ...(isPrivileged ? ['Employee'] : []),
                  'Leave Type',
                  'Period',
                  'Days',
                  'Status',
                  'Files',
                  'Action',
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
              {paginated.map(record => (
                <tr key={`req-${record.id}`} className="hover:bg-almet-mystic/10 dark:hover:bg-gray-700/30 transition-colors">

                  {/* Request ID */}
                  <td className="px-4 py-3 text-xs font-mono font-medium text-almet-sapphire whitespace-nowrap">
                    {record.request_id}
                  </td>

                  {/* Employee (admin/manager only) */}
                  {isPrivileged && (
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{record.employee_name}</p>
                      {record.department && (
                        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{record.department}</p>
                      )}
                    </td>
                  )}

                  {/* Leave Type */}
                  <td className="px-4 py-3 text-xs text-almet-cloud-burst dark:text-white">
                    {record.vacation_type}
                    {record.is_half_day && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300 rounded text-[10px] font-medium">
                        Half Day
                      </span>
                    )}
                  </td>

                  {/* Period */}
                  <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      {record.start_date}
                      {record.start_date !== record.end_date && <> → {record.end_date}</>}
                    </div>
                  </td>

                  {/* Days */}
                  <td className="px-4 py-3 text-xs font-bold text-almet-cloud-burst dark:text-white">
                    {record.days}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusStyle(record.status)}`}>
                      {record.status}
                    </span>
                  </td>

                  {/* Attachments */}
                  <td className="px-4 py-3 text-xs">
                    {record.has_attachments ? (
                      <button
                        onClick={() => handleViewAttachments(record.request_id, record.request_id)}
                        className="flex items-center gap-1 text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral font-medium"
                      >
                        <Paperclip className="w-3 h-3" />
                        {record.attachments_count}
                      </button>
                    ) : (
                      <span className="text-almet-waterloo/40 dark:text-almet-bali-hai/40">—</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(record.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-almet-sapphire border border-almet-sapphire/30 rounded-lg hover:bg-almet-sapphire hover:text-white transition-all whitespace-nowrap"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={isPrivileged ? 8 : 7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-almet-mystic/30 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FileText className="w-7 h-7 text-almet-waterloo/40 dark:text-almet-bali-hai/40" />
                      </div>
                      <p className="text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
                        {rawRecords.length === 0 ? 'No vacation requests found' : 'No requests match your filters'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={() => isPrivileged
                            ? setAdminFilters({ status: '', vacation_type_id: '', department_id: '', business_function_id: '', start_date: '', end_date: '', employee_name: '', year: '' })
                            : setClientFilters({ status: '', vacation_type: '', start_date: '', end_date: '' })
                          }
                          className="text-xs text-almet-sapphire hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > itemsPerPage && (
          <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}