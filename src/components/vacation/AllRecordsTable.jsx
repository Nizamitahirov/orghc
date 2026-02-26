// components/vacation/AllRecordsTable.jsx - WITH PAGINATION

import { Download, Filter, Eye, Edit, Check, Paperclip, FileText, Search } from 'lucide-react';
import SearchableDropdown from "@/components/common/SearchableDropdown";
import Pagination from '@/components/common/Pagination';
import { useState } from 'react';

export default function AllRecordsTable({
  allVacationRecords,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  businessFunctions,
  departments,
  darkMode,
  handleExportAllRecords,
  fetchAllVacationRecords,
  handleViewDetails,
  handleViewAttachments,
  handleViewScheduleDetail,
  handleEditSchedule,
  handleRegisterSchedule,
  userAccess
}) {
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // ✅ Pagination calculations
  const totalPages = Math.ceil(allVacationRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = allVacationRecords.slice(startIndex, endIndex);
  
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

  const getTableTitle = () => {
    if (userAccess.is_admin) {
      return 'All Vacation Records';
    } else if (userAccess.is_manager) {
      return 'Team Vacation Records';
    }
    return 'Vacation Records';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
      <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">{getTableTitle()}</h2>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
            {userAccess.is_admin 
              ? 'View and manage all vacation records' 
              : 'View your team members vacation records'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all flex items-center gap-1.5"
          >
            <Filter className="w-3 h-3" />
            Filters
          </button>
          <button 
            onClick={handleExportAllRecords} 
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 p-5 bg-almet-mystic/10 dark:bg-gray-900/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Employee Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-almet-waterloo dark:text-gray-400" />
                <input 
                  type="text" 
                  value={filters.employee_name}
                  onChange={(e) => handleFilterChange({...filters, employee_name: e.target.value})}
                  placeholder="Search name"
                  className="w-full pl-9 pr-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Company
              </label>
              <SearchableDropdown
                options={businessFunctions.map(bf => ({ 
                  value: bf.id, 
                  label: bf.name 
                }))}
                value={filters.business_function_id}
                onChange={(value) => handleFilterChange({...filters, business_function_id: value || ''})}
                placeholder="All Companies"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Department
              </label>
              <SearchableDropdown
                options={departments.map(dept => ({ 
                  value: dept.id, 
                  label: dept.name 
                }))}
                value={filters.department_id}
                onChange={(value) => handleFilterChange({...filters, department_id: value || ''})}
                placeholder="All Departments"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Start Date
              </label>
              <input 
                type="date" 
                value={filters.start_date}
                onChange={(e) => handleFilterChange({...filters, start_date: e.target.value})}
                className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                End Date
              </label>
              <input 
                type="date" 
                value={filters.end_date}
                onChange={(e) => handleFilterChange({...filters, end_date: e.target.value})}
                className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Year
              </label>
              <input 
                type="number" 
                value={filters.year}
                onChange={(e) => handleFilterChange({...filters, year: e.target.value})}
                placeholder="2025"
                className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => {
                fetchAllVacationRecords();
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all"
            >
              Apply Filters
            </button>
            <button 
              onClick={() => {
                handleFilterChange({ 
                  status: '', 
                  vacation_type_id: '', 
                  department_id: '', 
                  business_function_id: '',
                  start_date: '', 
                  end_date: '', 
                  employee_name: '', 
                  year: '' 
                });
                fetchAllVacationRecords();
              }}
              className="px-4 py-2 text-xs border border-almet-mystic dark:border-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
          <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
            <tr>
              {['Request ID', 'Employee', 'Type', 'Period', 'Days', 'Status', 'Attachments', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
            {paginatedRecords.map(record => (
              <tr key={`${record.type}-${record.id}`} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-almet-sapphire">{record.request_id}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.employee_name}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.vacation_type}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.start_date} - {record.end_date}</td>
                <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{record.days}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    record.status === 'Scheduled' || record.status === 'Registered' ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' : 
                    record.status.includes('Pending') ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
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
                  <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No records found</p>
                  <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      {allVacationRecords.length > itemsPerPage && (
        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allVacationRecords.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}