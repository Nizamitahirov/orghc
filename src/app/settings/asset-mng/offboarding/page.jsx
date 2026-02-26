// src/app/asset-management/offboarding/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { offboardingService, employeeService } from "@/services/assetService";
import {
  UserMinus,
  Loader,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Package,
  TrendingUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Activity
} from "lucide-react";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import Link from "next/link";

const OffboardingPage = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  
  // State
  const [offboardings, setOffboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const itemsPerPage = 12;

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Fetch offboardings
  const fetchOffboardings = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm
      };

      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const response = await offboardingService.getOffboardings(params);
      setOffboardings(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error("Failed to fetch offboardings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ page_size: 100 });
      setEmployees(response.results || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    fetchOffboardings();
  }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredOffboardings = offboardings.filter(offboarding => {
    if (filterEmployee !== "all" && offboarding.employee?.id !== parseInt(filterEmployee)) {
      return false;
    }
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

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400',
      'IN_PROGRESS': 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
      'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
      'CANCELLED': 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400'
    };
    return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return <Clock size={12} />;
      case 'IN_PROGRESS': return <Activity size={12} />;
      case 'COMPLETED': return <CheckCircle size={12} />;
      case 'CANCELLED': return <XCircle size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const employeeOptions = [
    { value: 'all', label: 'All Employees' },
    ...employees.map(emp => ({
      value: emp.id,
      label: `${emp.name || emp.full_name} (${emp.employee_id})`
    }))
  ];

  // Statistics
  const stats = {
    total: offboardings.length,
    pending: offboardings.filter(o => o.status === 'PENDING').length,
    inProgress: offboardings.filter(o => o.status === 'IN_PROGRESS').length,
    completed: offboardings.filter(o => o.status === 'COMPLETED').length
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="mx-auto px-4 py-6">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span className="text-sm">{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-2">
                <XCircle size={14} />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Employee Offboarding</h1>
                <p className={`${textMuted} text-sm`}>
                  Manage asset transfers for departing employees
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`${btnPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm hover:shadow-lg transition-all`}
              >
                <Plus size={16} className="mr-2" />
                Initiate Offboarding
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <UserMinus className="text-almet-sapphire" size={20} />
                <TrendingUp className="text-emerald-500" size={16} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Total Offboardings</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.total}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-amber-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Pending</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.pending}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Activity className="text-blue-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>In Progress</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.inProgress}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-emerald-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Completed</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.completed}</p>
            </div>
          </div>

          {/* Filters */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-4 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="text"
                  placeholder="Search offboardings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                />
              </div>

              <SearchableDropdown
                options={statusOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="All Status"
                darkMode={darkMode}
                icon={<Filter size={12} />}
              />

              <SearchableDropdown
                options={employeeOptions}
                value={filterEmployee}
                onChange={setFilterEmployee}
                placeholder="All Employees"
                darkMode={darkMode}
                icon={<User size={12} />}
              />

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterEmployee("all");
                }}
                className={`${btnSecondary} px-4 py-2.5 rounded-lg text-sm`}
              >
                Reset
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
              <p className={`${textMuted} text-xs`}>
                {filteredOffboardings.length} of {totalCount} offboardings
              </p>
            </div>
          </div>

          {/* Offboardings List */}
          <div className={`${bgCard} rounded-xl border ${borderColor}`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                <span className={`${textMuted}`}>Loading offboardings...</span>
              </div>
            ) : filteredOffboardings.length === 0 ? (
              <div className="text-center py-12">
                <UserMinus className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className={`${textPrimary} font-medium mb-1`}>No offboardings found</p>
                <p className={`${textMuted} text-sm mb-4`}>
                  {searchTerm || filterStatus !== 'all' || filterEmployee !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No offboarding processes have been initiated'}
                </p>
                {!searchTerm && filterStatus === 'all' && filterEmployee === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className={`${btnPrimary} px-4 py-2 rounded-lg text-sm`}
                  >
                    <Plus size={14} className="mr-2 inline" />
                    Initiate Offboarding
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${bgAccent} border-b ${borderColor}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Employee
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Last Working Day
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Assets
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Progress
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Status
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                          Created
                        </th>
                        <th className={`px-6 py-4 text-center text-xs font-semibold ${textMuted} uppercase`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredOffboardings.map((offboarding) => (
                        <tr key={offboarding.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-6 py-4">
                            <div>
                              <p className={`${textPrimary} font-medium text-sm`}>
                                {offboarding.employee_detail?.full_name}
                              </p>
                              <p className={`${textMuted} text-xs`}>
                                ID: {offboarding.employee_detail?.employee_id}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Calendar size={14} className={`${textMuted} mr-2`} />
                              <span className={`${textSecondary} text-sm`}>
                                {formatDate(offboarding.last_working_day)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className={`${textPrimary} text-sm font-semibold`}>
                                {offboarding.total_assets}
                              </p>
                              <p className={`${textMuted} text-xs`}>
                                Transferred: {offboarding.assets_transferred}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`${textMuted} text-xs`}>
                                  {offboarding.progress_percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    offboarding.progress_percentage === 100
                                      ? 'bg-emerald-500'
                                      : offboarding.progress_percentage > 50
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${offboarding.progress_percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getStatusColor(offboarding.status)}`}>
                              {getStatusIcon(offboarding.status)}
                              <span className="ml-1.5">{offboarding.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${textSecondary} text-sm`}>
                              {formatDate(offboarding.created_at)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              href={`/settings/asset-mng/offboarding/${offboarding.id}`}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg inline-block"
                            >
                              <Eye size={14} className="text-almet-sapphire" />
                            </Link>
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

      {/* Create Offboarding Modal */}
      {showCreateModal && (
        <CreateOffboardingModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOffboardings();
            setNotification({ message: "Offboarding initiated successfully", type: "success" });
          }}
          darkMode={darkMode}
        />
      )}
    </DashboardLayout>
  );
};

// Create Offboarding Modal
const CreateOffboardingModal = ({ employees, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    last_working_day: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200";

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name || emp.full_name} (${emp.employee_id})`
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await offboardingService.initiateOffboarding(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate offboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Initiate Offboarding</h2>
            <button type="button" onClick={onClose} className={`${textMuted} hover:${textPrimary}`}>
              <XCircle size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Employee *
              </label>
              <SearchableDropdown
                options={employeeOptions}
                value={formData.employee_id}
                onChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                placeholder="Select employee"
                searchPlaceholder="Search employees..."
                darkMode={darkMode}
                allowUncheck={true}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Last Working Day *
              </label>
              <input
                type="date"
                value={formData.last_working_day}
                onChange={(e) => setFormData(prev => ({ ...prev, last_working_day: e.target.value }))}
                required
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                rows="3"
                placeholder="Add any notes about the offboarding..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.employee_id || !formData.last_working_day}
              className={`${btnPrimary} px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 flex items-center`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Initiate Offboarding
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OffboardingPage;