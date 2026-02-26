// src/app/asset-management/assignments/page.jsx
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { assetService, employeeService } from "@/services/assetService";
import {
  Users,
  Loader,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  Calendar,
  FileText,
  TrendingUp,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Activity,
  Building
} from "lucide-react";
import SearchableDropdown from "@/components/common/SearchableDropdown";


const AssignmentsPage = () => {
  const { darkMode } = useTheme();
  
  // State
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const itemsPerPage = 15;

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Fetch assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm
      };

      if (filterEmployee !== "all") {
        params.employee_id = filterEmployee;
      }
      if (dateFrom) {
        params.date_from = dateFrom;
      }
      if (dateTo) {
        params.date_to = dateTo;
      }

      const response = await assetService.getAssignments(params);
      setAssignments(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for filter
  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ page_size: 100 });
      setEmployees(response.results || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentPage, searchTerm, filterEmployee, dateFrom, dateTo]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter assignments by status (active/completed)
  const filteredAssignments = assignments.filter(assignment => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return assignment.is_active;
    if (filterStatus === "completed") return !assignment.is_active;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getConditionColor = (condition) => {
    const colors = {
      'EXCELLENT': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      'GOOD': 'text-blue-600 bg-blue-50 border-blue-200',
      'FAIR': 'text-amber-600 bg-amber-50 border-amber-200',
      'POOR': 'text-red-600 bg-red-50 border-red-200',
      'DAMAGED': 'text-red-700 bg-red-100 border-red-300'
    };
    return colors[condition] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const employeeOptions = [
    { value: 'all', label: 'All Employees' },
    ...employees.map(emp => ({
      value: emp.id,
      label: `${emp.name || emp.full_name} (${emp.employee_id})`
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Assignments' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' }
  ];

  // Statistics
  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.is_active).length,
    completed: assignments.filter(a => !a.is_active).length,
    avgDuration: Math.round(
      assignments.reduce((acc, a) => acc + (a.duration_days || 0), 0) / (assignments.length || 1)
    )
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  const handleExport = async () => {
  try {
    // 🎯 Backend-də POST /assets/assets/assignments/export/ endpoint-i var
    const params = {
      employee_id: filterEmployee !== "all" ? filterEmployee : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    };



    // POST request kimi göndər
    const blob = await assetService.exportAssignments(params);
    
    // Blob-dan file yarat
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignments_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    

  } catch (err) {
    console.error('❌ Export error:', err);
    console.error('Error response:', err.response?.data);
    alert('Failed to export assignments. Please try again.');
  }
};

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Assignment History</h1>
                <p className={`${textMuted} text-sm`}>
                  Track all asset assignments and their history
                </p>
              </div>
              <button
                onClick={handleExport}
                className={`${btnPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm hover:shadow-lg transition-all`}
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Users className="text-almet-sapphire" size={20} />
                <TrendingUp className="text-emerald-500" size={16} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Total Assignments</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.total}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-blue-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Active Assignments</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.active}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-emerald-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Completed</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.completed}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Calendar className="text-purple-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Avg Duration</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.avgDuration} days</p>
            </div>
          </div>

          {/* Filters */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-4 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                />
              </div>

              {/* Employee Filter */}
              <SearchableDropdown
                options={employeeOptions}
                value={filterEmployee}
                onChange={setFilterEmployee}
                placeholder="All Employees"
                darkMode={darkMode}
                icon={<User size={12} />}
              />

              {/* Status Filter */}
              <SearchableDropdown
                options={statusOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Status"
                darkMode={darkMode}
                icon={<Filter size={12} />}
              />

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterEmployee("all");
                  setFilterStatus("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                className={`${btnSecondary} px-4 py-2.5 rounded-lg text-sm`}
              >
                Reset
              </button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className={`block text-xs ${textMuted} mb-1`}>From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                />
              </div>
              <div>
                <label className={`block text-xs ${textMuted} mb-1`}>To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
              <p className={`${textMuted} text-xs`}>
                {filteredAssignments.length} of {totalCount} assignments
              </p>
            </div>
          </div>

          {/* Assignments Table */}
          <div className={`${bgCard} rounded-xl border ${borderColor}`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                <span className={`${textMuted}`}>Loading assignments...</span>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className={`${textPrimary} font-medium mb-1`}>No assignments found</p>
                <p className={`${textMuted} text-sm`}>
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${bgAccent} border-b ${borderColor}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Asset
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Employee
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Check Out
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Check In
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Duration
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Condition
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Status
                        </th>
                        <th className={`px-6 py-4 text-center text-xs font-semibold ${textMuted} uppercase`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredAssignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-6 py-4">
                            <div>
                              <p className={`${textPrimary} font-medium text-sm`}>
                                {assignment.asset_detail?.asset_name}
                              </p>
                              <p className={`${textMuted} text-xs`}>
                                {assignment.asset_detail?.serial_number}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className={`${textPrimary} text-sm`}>
                                {assignment.employee_detail?.full_name}
                              </p>
                              <p className={`${textMuted} text-xs`}>
                                ID: {assignment.employee_detail?.employee_id}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className={`${textSecondary} text-sm`}>
                                {formatDate(assignment.check_out_date)}
                              </p>
                              <p className={`${textMuted} text-xs`}>
                                By: {assignment.assigned_by_detail?.first_name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {assignment.check_in_date ? (
                              <div>
                                <p className={`${textSecondary} text-sm`}>
                                  {formatDate(assignment.check_in_date)}
                                </p>
                                {assignment.checked_in_by_detail && (
                                  <p className={`${textMuted} text-xs`}>
                                    By: {assignment.checked_in_by_detail.first_name}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className={`${textMuted} text-sm italic`}>Not checked in</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${textPrimary} text-sm font-semibold`}>
                              {assignment.duration_days} days
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs border ${getConditionColor(assignment.condition_on_checkout)}`}>
                                Out: {assignment.condition_on_checkout}
                              </span>
                              {assignment.condition_on_checkin && (
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs border ${getConditionColor(assignment.condition_on_checkin)}`}>
                                  In: {assignment.condition_on_checkin}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {assignment.is_active ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                                <Clock size={12} className="mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <CheckCircle size={12} className="mr-1" />
                                Completed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleViewDetails(assignment)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Eye size={14} className="text-almet-sapphire" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={`px-6 py-4 border-t ${borderColor} ${bgAccent}`}>
                    <div className="flex items-center justify-between">
                      <p className={`${textMuted} text-xs`}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className={`${btnSecondary} px-4 py-2 rounded-lg text-xs disabled:opacity-50`}
                        >
                          <ChevronLeft size={14} className="mr-1 inline" />
                          Prev
                        </button>

                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 rounded-lg text-xs ${
                                  currentPage === pageNum
                                    ? 'bg-almet-sapphire text-white'
                                    : `${btnSecondary}`
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`${btnSecondary} px-4 py-2 rounded-lg text-xs disabled:opacity-50`}
                        >
                          Next
                          <ChevronRight size={14} className="ml-1 inline" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAssignment(null);
          }}
          darkMode={darkMode}
        />
      )}
    </DashboardLayout>
  );
};

// Assignment Details Modal
const AssignmentDetailsModal = ({ assignment, onClose, darkMode }) => {
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-3xl shadow-2xl border ${borderColor} max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className={`${textPrimary} text-xl font-bold mb-2`}>Assignment Details</h2>
              <p className={`${textMuted} text-sm`}>
                Assignment #{assignment.id}
              </p>
            </div>
            <button onClick={onClose} className={`${textMuted} hover:${textPrimary}`}>
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Asset Information */}
            <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
              <h3 className={`${textPrimary} font-semibold mb-3 flex items-center`}>
                <Package size={16} className="mr-2 text-almet-sapphire" />
                Asset Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs ${textMuted} mb-1`}>Asset Name</label>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {assignment.asset_detail?.asset_name}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs ${textMuted} mb-1`}>Serial Number</label>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {assignment.asset_detail?.serial_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
              <h3 className={`${textPrimary} font-semibold mb-3 flex items-center`}>
                <User size={16} className="mr-2 text-almet-sapphire" />
                Employee Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs ${textMuted} mb-1`}>Employee Name</label>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {assignment.employee_detail?.full_name}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs ${textMuted} mb-1`}>Employee ID</label>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {assignment.employee_detail?.employee_id}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs ${textMuted} mb-1`}>Job Title</label>
                  <p className={`${textSecondary} text-sm`}>
                    {assignment.employee_detail?.job_title}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs ${textMuted} mb-1`}>Department</label>
                  <p className={`${textSecondary} text-sm`}>
                    {assignment.employee_detail?.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Assignment Timeline */}
            <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
              <h3 className={`${textPrimary} font-semibold mb-3 flex items-center`}>
                <Calendar size={16} className="mr-2 text-almet-sapphire" />
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${textMuted} mb-1`}>Check Out Date</label>
                    <p className={`${textPrimary} text-sm font-medium`}>
                      {formatDate(assignment.check_out_date)}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-xs ${textMuted} mb-1`}>Assigned By</label>
                    <p className={`${textSecondary} text-sm`}>
                      {assignment.assigned_by_detail?.first_name} {assignment.assigned_by_detail?.last_name}
                    </p>
                  </div>
                  {assignment.check_in_date && (
                    <>
                      <div>
                        <label className={`block text-xs ${textMuted} mb-1`}>Check In Date</label>
                        <p className={`${textPrimary} text-sm font-medium`}>
                          {formatDate(assignment.check_in_date)}
                        </p>
                      </div>
                      <div>
                        <label className={`block text-xs ${textMuted} mb-1`}>Checked In By</label>
                        <p className={`${textSecondary} text-sm`}>
                          {assignment.checked_in_by_detail?.first_name} {assignment.checked_in_by_detail?.last_name}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <label className={`block text-xs ${textMuted} mb-1`}>Duration</label>
                    <p className={`${textPrimary} text-sm font-semibold`}>
                      {assignment.duration_days} days
                    </p>
                  </div>
                  <div>
                    <label className={`block text-xs ${textMuted} mb-1`}>Status</label>
                    {assignment.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                        <Clock size={12} className="mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle size={12} className="mr-1" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Condition & Notes */}
            <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
              <h3 className={`${textPrimary} font-semibold mb-3 flex items-center`}>
                <FileText size={16} className="mr-2 text-almet-sapphire" />
                Condition & Notes
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${textMuted} mb-2`}>Condition on Checkout</label>
                    <span className="inline-flex items-center px-3 py-1 rounded text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {assignment.condition_on_checkout}
                    </span>
                  </div>
                  {assignment.condition_on_checkin && (
                    <div>
                      <label className={`block text-xs ${textMuted} mb-2`}>Condition on Checkin</label>
                      <span className="inline-flex items-center px-3 py-1 rounded text-xs bg-blue-50 text-blue-600 border border-blue-200">
                        {assignment.condition_on_checkin}
                      </span>
                    </div>
                  )}
                </div>

                {assignment.check_out_notes && (
                  <div>
                    <label className={`block text-xs ${textMuted} mb-2`}>Check Out Notes</label>
                    <p className={`${textSecondary} text-sm p-3 rounded bg-white dark:bg-gray-900/50`}>
                      {assignment.check_out_notes}
                    </p>
                  </div>
                )}

                {assignment.check_in_notes && (
                  <div>
                    <label className={`block text-xs ${textMuted} mb-2`}>Check In Notes</label>
                    <p className={`${textSecondary} text-sm p-3 rounded bg-white dark:bg-gray-900/50`}>
                      {assignment.check_in_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
              <h3 className={`${textPrimary} font-semibold mb-3 flex items-center`}>
                <Activity size={16} className="mr-2 text-almet-sapphire" />
                Record Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block ${textMuted} mb-1`}>Created At</label>
                  <p className={`${textSecondary}`}>
                    {formatDateTime(assignment.created_at)}
                  </p>
                </div>
                {assignment.updated_at && (
                  <div>
                    <label className={`block ${textMuted} mb-1`}>Last Updated</label>
                    <p className={`${textSecondary}`}>
                      {formatDateTime(assignment.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-2.5 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;