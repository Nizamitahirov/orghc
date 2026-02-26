// components/vacation/MyRecordsTable.jsx - WITH PAGINATION & EMPLOYEE FILTER

import { useState } from 'react';
import { Download, Eye, Edit, Check, Paperclip, FileText, Filter, X, Search } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

export default function MyRecordsTable({
  myAllRecords,
  handleExportMyVacations,
  handleViewDetails,
  handleViewAttachments,
  handleViewScheduleDetail,
  handleEditSchedule,
  handleRegisterSchedule,
  userAccess,
  darkMode
}) {
  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    vacation_type: '',
    start_date: '',
    end_date: '',
    employee_name: '' // ✅ NEW
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Logic
  const getFilteredRecords = () => {
    let filtered = myAllRecords;
    
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(r => 
        r.status?.toLowerCase().includes(filters.status.toLowerCase())
      );
    }
    
    if (filters.vacation_type) {
      filtered = filtered.filter(r => 
        r.vacation_type?.toLowerCase().includes(filters.vacation_type.toLowerCase())
      );
    }
    
    if (filters.start_date) {
      filtered = filtered.filter(r => r.start_date >= filters.start_date);
    }
    
    if (filters.end_date) {
      filtered = filtered.filter(r => r.end_date <= filters.end_date);
    }
    
    // ✅ Employee name filter (for managers/admins)
    if (filters.employee_name) {
      filtered = filtered.filter(r => 
        r.employee_name?.toLowerCase().includes(filters.employee_name.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredRecords = getFilteredRecords();
  
  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const canEditSchedule = (record) => {
    return record.type === 'schedule' && record.can_edit;
  };

  const canRegisterSchedule = (record) => {
    return userAccess.is_admin && record.type === 'schedule' && record.status === 'Scheduled';
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      vacation_type: '',
      start_date: '',
      end_date: '',
      employee_name: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
      <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">My All Records</h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-2.5 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all flex items-center gap-1.5"
            >
              <Filter className="w-3 h-3" />
              Filter
            </button>

            <button 
              onClick={handleExportMyVacations} 
              className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3 h-3" />
              My Vacations
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
            <div className="grid grid-cols-6 gap-3">
              {/* ✅ Employee Name Filter (for managers/admins viewing team records) */}
              {(userAccess.is_manager || userAccess.is_admin) && (
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
                      placeholder="Search..."
                      className="w-full pl-7 pr-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange({...filters, type: e.target.value})}
                  className="w-full px-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="request">Request</option>
                  <option value="schedule">Schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                  Status
                </label>
                <input
                  type="text"
                  value={filters.status}
                  onChange={(e) => handleFilterChange({...filters, status: e.target.value})}
                  placeholder="Search status..."
                  className="w-full px-2 py-1.5 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                  Leave Type
                </label>
                <input
                  type="text"
                  value={filters.vacation_type}
                  onChange={(e) => handleFilterChange({...filters, vacation_type: e.target.value})}
                  placeholder="Search type..."
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

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-almet-waterloo dark:text-gray-400">
                Showing {paginatedRecords.length} of {filteredRecords.length} records
              </span>
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-almet-mystic dark:border-almet-comet rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
          <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
            <tr>
              {['Type', 'Leave Type', 'Start', 'End', 'Days', 'Status', 'Attachments', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
            {paginatedRecords.map(record => (
              <tr key={`${record.type}-${record.id}`} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-xs">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    record.type === 'schedule' 
                      ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {record.type === 'schedule' ? 'Schedule' : 'Request'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.vacation_type}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.start_date}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.end_date}</td>
                <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{record.days}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    record.status === 'Scheduled' || record.status === 'Registered' ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' : 
                    record.status === 'Pending HR' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                    record.status === 'Pending Line Manager' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 
                    record.status === 'Approved' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {record.type === 'request' && record.has_attachments ? (
                    <button
                      onClick={() => handleViewAttachments(record.request_id, record.request_id)}
                      className="flex items-center gap-1 text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral font-medium"
                    >
                      <Paperclip className="w-3 h-3" />
                      {record.attachments_count}
                    </button>
                  ) : (
                    <span className="text-almet-waterloo/50 dark:text-almet-bali-hai/50">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {record.type === 'request' ? (
                    <button 
                      onClick={() => handleViewDetails(record.id)}
                      className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewScheduleDetail(record.id)} 
                        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      
                      {canEditSchedule(record) && (
                        <button 
                          onClick={() => handleEditSchedule(record)} 
                          className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                      
                      {canRegisterSchedule(record) && (
                        <button 
                          onClick={() => handleRegisterSchedule(record.id)} 
                          className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
                          title="Register (Admin Only)"
                        >
                          <Check className="w-3 h-3" />
                          Register
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {paginatedRecords.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center">
                  <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                  <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                    {myAllRecords.length === 0 ? 'No records found' : 'No records match current filters'}
                  </p>
                  {myAllRecords.length > 0 && filteredRecords.length === 0 && (
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-xs text-almet-sapphire hover:text-almet-cloud-burst underline"
                    >
                      Clear filters to see all records
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      {filteredRecords.length > itemsPerPage && (
        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRecords.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}