// src/app/asset-management/offboarding/[id]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { offboardingService, transferService ,employeeService} from "@/services/assetService";
import {
  ArrowLeft,
  UserMinus,
  Loader,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Package,
  User,
  Building,
  FileText,
  Send,
  ThumbsUp,
  ThumbsDown,
  Activity,
  TrendingUp,
  Eye
} from "lucide-react";
import Link from "next/link";
import SearchableDropdown from "@/components/common/SearchableDropdown";

const OffboardingDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const offboardingId = params.id;

  // State
  const [offboarding, setOffboarding] = useState(null);
  const [assets, setAssets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [notification, setNotification] = useState(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSuccess = "bg-emerald-500 hover:bg-emerald-600 text-white";
  const btnDanger = "bg-red-500 hover:bg-red-600 text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Fetch offboarding details
  const fetchOffboardingDetails = async () => {
    setLoading(true);
    try {
      const response = await offboardingService.getOffboarding(offboardingId);
      setOffboarding(response);
    } catch (err) {
      console.error("Failed to fetch offboarding details:", err);
      setNotification({ message: "Failed to load offboarding details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch offboarding assets
  const fetchOffboardingAssets = async () => {
    try {
      const response = await offboardingService.getOffboardingAssets(offboardingId);
      setAssets(response.assets || []);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    }
  };

  // Fetch transfer requests
  const fetchTransfers = async () => {
    try {
      const response = await transferService.getOffboardingTransfers(offboardingId);
      setTransfers(response.results || []);
    } catch (err) {
      console.error("Failed to fetch transfers:", err);
    }
  };

  // Fetch employees for transfer
  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ page_size: 100 });
      setEmployees(response.results || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    if (offboardingId) {
      fetchOffboardingDetails();
      fetchOffboardingAssets();
      fetchTransfers();
      fetchEmployees();
    }
  }, [offboardingId]);

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
      'PENDING': 'bg-amber-50 text-amber-600 border-amber-200',
      'IN_PROGRESS': 'bg-blue-50 text-blue-600 border-blue-200',
      'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'CANCELLED': 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getTransferStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-amber-50 text-amber-600 border-amber-200',
      'APPROVED': 'bg-blue-50 text-blue-600 border-blue-200',
      'REJECTED': 'bg-red-50 text-red-600 border-red-200',
      'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const handleCreateTransfer = (asset) => {
    setSelectedAsset(asset);
    setShowTransferModal(true);
  };

  const handleApproveTransfer = async (transferId, approved) => {
    try {
      await transferService.approveTransfer(transferId, {
        approved,
        rejection_reason: approved ? '' : 'Rejected by manager'
      });
      
      fetchTransfers();
      fetchOffboardingDetails();
      setNotification({ 
        message: approved ? "Transfer approved successfully" : "Transfer rejected", 
        type: "success" 
      });
    } catch (err) {
      console.error("Failed to process transfer:", err);
      setNotification({ message: "Failed to process transfer", type: "error" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-almet-sapphire mr-3" />
          <span className={`${textMuted}`}>Loading offboarding details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!offboarding) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className={`${textPrimary} text-lg font-medium mb-2`}>Offboarding not found</p>
          <Link href="/settings/asset-mng/offboarding" className={`${btnPrimary} px-4 py-2 rounded-lg inline-block`}>
            Back to Offboardings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

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
            <Link
              href="/settings/asset-mng/offboarding"
              className={`${textMuted} hover:${textPrimary} flex items-center text-sm mb-4`}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Offboardings
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>
                  Offboarding: {offboarding.employee_detail?.full_name}
                </h1>
                <p className={`${textMuted} text-sm`}>
                  Employee ID: {offboarding.employee_detail?.employee_id}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-lg text-sm border ${getStatusColor(offboarding.status)}`}>
                {offboarding.status}
              </span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Package className="text-almet-sapphire" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Total Assets</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{offboarding.total_assets}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Send className="text-blue-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Transferred</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{offboarding.assets_transferred}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-emerald-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Returned</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{offboarding.assets_returned}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-purple-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Progress</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{offboarding.progress_percentage}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6 mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`${textPrimary} text-lg font-semibold`}>Offboarding Progress</h2>
              <span className={`${textMuted} text-sm`}>
                {offboarding.assets_transferred + offboarding.assets_returned} / {offboarding.total_assets} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
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

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Offboarding Details */}
            <div className={`lg:col-span-2 ${bgCard} rounded-xl border ${borderColor} p-6`}>
              <h2 className={`${textPrimary} text-lg font-semibold mb-6 flex items-center`}>
                <FileText size={18} className="mr-2 text-almet-sapphire" />
                Offboarding Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Employee Name
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {offboarding.employee_detail?.full_name}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Employee ID
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {offboarding.employee_detail?.employee_id}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Job Title
                  </label>
                  <p className={`${textSecondary} text-sm`}>
                    {offboarding.employee_detail?.job_title}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Department
                  </label>
                  <p className={`${textSecondary} text-sm`}>
                    {offboarding.employee_detail?.department}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Last Working Day
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {formatDate(offboarding.last_working_day)}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getStatusColor(offboarding.status)}`}>
                    {offboarding.status}
                  </span>
                </div>
              </div>

              {offboarding.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Notes
                  </label>
                  <p className={`${textSecondary} text-sm`}>{offboarding.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                <h3 className={`${textPrimary} text-lg font-semibold mb-4 flex items-center`}>
                  <Calendar size={18} className="mr-2 text-almet-sapphire" />
                  Timeline
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs ${textMuted} mb-1`}>Created</label>
                    <p className={`${textSecondary} text-sm`}>
                      {formatDate(offboarding.created_at)}
                    </p>
                    <p className={`${textMuted} text-xs`}>
                      By: {offboarding.created_by_detail?.first_name} {offboarding.created_by_detail?.last_name}
                    </p>
                  </div>

                  {offboarding.approved_at && (
                    <div>
                      <label className={`block text-xs ${textMuted} mb-1`}>Approved</label>
                      <p className={`${textSecondary} text-sm`}>
                        {formatDate(offboarding.approved_at)}
                      </p>
                      {offboarding.approved_by_detail && (
                        <p className={`${textMuted} text-xs`}>
                          By: {offboarding.approved_by_detail.first_name} {offboarding.approved_by_detail.last_name}
                        </p>
                      )}
                    </div>
                  )}

                  {offboarding.completed_at && (
                    <div>
                      <label className={`block text-xs ${textMuted} mb-1`}>Completed</label>
                      <p className={`${textSecondary} text-sm`}>
                        {formatDate(offboarding.completed_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assets List */}
          <div className={`${bgCard} rounded-xl border ${borderColor} mb-6`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`${textPrimary} text-lg font-semibold flex items-center`}>
                <Package size={18} className="mr-2 text-almet-sapphire" />
                Employee Assets ({assets.length})
              </h2>
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className={`${textPrimary} font-medium mb-1`}>No assets found</p>
                <p className={`${textMuted} text-sm`}>This employee has no assets to transfer</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${bgAccent} border-b ${borderColor}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Asset
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Category
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Assigned Date
                      </th>
                      <th className={`px-6 py-4 text-center text-xs font-semibold ${textMuted} uppercase`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div>
                            <p className={`${textPrimary} font-medium text-sm`}>
                              {asset.asset_name}
                            </p>
                            <p className={`${textMuted} text-xs`}>{asset.serial_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {asset.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                            {asset.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {formatDate(asset.current_assignment?.assignment?.check_out_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleCreateTransfer(asset)}
                            className={`${btnPrimary} px-3 py-1.5 rounded text-xs`}
                          >
                            <Send size={12} className="mr-1 inline" />
                            Create Transfer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transfer Requests */}
          <div className={`${bgCard} rounded-xl border ${borderColor}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`${textPrimary} text-lg font-semibold flex items-center`}>
                <Activity size={18} className="mr-2 text-almet-sapphire" />
                Transfer Requests ({transfers.length})
              </h2>
            </div>

            {transfers.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className={`${textPrimary} font-medium mb-1`}>No transfer requests</p>
                <p className={`${textMuted} text-sm`}>Create transfer requests for assets above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${bgAccent} border-b ${borderColor}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Asset
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        From
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        To
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Requested
                      </th>
                      <th className={`px-6 py-4 text-center text-xs font-semibold ${textMuted} uppercase`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {transfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div>
                            <p className={`${textPrimary} font-medium text-sm`}>
                              {transfer.asset_detail?.asset_name}
                            </p>
                            <p className={`${textMuted} text-xs`}>
                              {transfer.asset_detail?.serial_number}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {transfer.from_employee_detail?.full_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {transfer.to_employee_detail?.full_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getTransferStatusColor(transfer.status)}`}>
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {formatDate(transfer.requested_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {transfer.status === 'PENDING' && (
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleApproveTransfer(transfer.id, true)}
                                className={`${btnSuccess} px-3 py-1.5 rounded text-xs`}
                                title="Approve"
                              >
                                <ThumbsUp size={12} className="mr-1 inline" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveTransfer(transfer.id, false)}
                                className={`${btnDanger} px-3 py-1.5 rounded text-xs`}
                                title="Reject"
                              >
                                <ThumbsDown size={12} className="mr-1 inline" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Transfer Modal */}
      {showTransferModal && selectedAsset && (
        <CreateTransferModal
          asset={selectedAsset}
          fromEmployee={offboarding.employee_detail}
          employees={employees.filter(e => e.id !== offboarding.employee?.id)}
          offboardingId={offboardingId}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedAsset(null);
          }}
          onSuccess={() => {
            setShowTransferModal(false);
            setSelectedAsset(null);
            fetchTransfers();
            setNotification({ message: "Transfer request created successfully", type: "success" });
          }}
          darkMode={darkMode}
        />
      )}
    </DashboardLayout>
  );
};

// Create Transfer Modal
const CreateTransferModal = ({ asset, fromEmployee, employees, offboardingId, onClose, onSuccess, darkMode }) => {
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name || emp.full_name} (${emp.employee_id})`
  }));

  console.log('Employee Options:', employeeOptions);
  console.log(employees)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await transferService.createTransfer({
        asset_id: asset.id,
        from_employee_id: fromEmployee.id,
        to_employee_id: parseInt(toEmployeeId),
        transfer_notes: transferNotes,
        offboarding_id: offboardingId
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transfer request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Create Transfer Request</h2>
            <button type="button" onClick={onClose} className={`${textMuted} hover:${textPrimary}`}>
              <XCircle size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Asset Info */}
          <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} font-semibold mb-3`}>Asset Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={textMuted}>Asset:</span>
                <span className={textPrimary}>{asset.asset_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={textMuted}>Serial:</span>
                <span className={textPrimary}>{asset.serial_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={textMuted}>Category:</span>
                <span className={textPrimary}>{asset.category_name}</span>
              </div>
            </div>
          </div>

          {/* From Employee Info */}
          <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} font-semibold mb-3`}>From Employee</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={textMuted}>Name:</span>
                <span className={textPrimary}>{fromEmployee.full_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={textMuted}>Employee ID:</span>
                <span className={textPrimary}>{fromEmployee.employee_id}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Transfer To Employee *
              </label>
              <SearchableDropdown
                options={employeeOptions}
                value={toEmployeeId}
                onChange={setToEmployeeId}
                placeholder="Select employee"
                searchPlaceholder="Search employees..."
                darkMode={darkMode}
                allowUncheck={true}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Transfer Notes
              </label>
              <textarea
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                rows="3"
                placeholder="Add any notes about the transfer..."
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
              disabled={loading || !toEmployeeId}
              className={`${btnPrimary} px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 flex items-center`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Create Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OffboardingDetailPage;