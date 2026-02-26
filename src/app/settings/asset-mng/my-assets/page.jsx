// src/app/asset-management/my-assets/page.jsx
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { assetService, employeeAssetService } from "@/services/assetService";
import {
  Package,
  Loader,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Building,
  Calendar,
  FileText,
  MessageSquare,
  Ban,
  Grid3X3,
  List as ListIcon,
  Search,
  Filter,
  Download
} from "lucide-react";
import SearchableDropdown from "@/components/common/SearchableDropdown";

const MyAssetsPage = () => {
  const { darkMode } = useTheme();
  
  // State
  const [myAssets, setMyAssets] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [notification, setNotification] = useState(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const btnSuccess = "bg-emerald-500 hover:bg-emerald-600 text-white";
  const btnDanger = "bg-red-500 hover:bg-red-600 text-white";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Fetch my assets
  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const response = await assetService.getMyAssets();
      setMyAssets(response.assets || []);
    } catch (err) {
      console.error("Failed to fetch my assets:", err);
      setNotification({ message: "Failed to load your assets", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending actions
  const fetchPendingActions = async () => {
    try {
      // This would be a new endpoint to get pending actions for current employee
      // const response = await employeeAssetService.getMyPendingActions();
      // setPendingActions(response.pending_actions || []);
    } catch (err) {
      console.error("Failed to fetch pending actions:", err);
    }
  };

  useEffect(() => {
    fetchMyAssets();
    fetchPendingActions();
  }, []);

  // Filter assets
  const filteredAssets = myAssets.filter(asset => {
    const statusMatch = filterStatus === "all" || asset.status === filterStatus;
    const searchMatch = searchTerm === "" || 
      asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
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
      'ASSIGNED': 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400',
      'IN_USE': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
      'NEED_CLARIFICATION': 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400',
      'IN_REPAIR': 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'IN_USE': return <CheckCircle size={14} />;
      case 'ASSIGNED': return <Clock size={14} />;
      case 'NEED_CLARIFICATION': return <AlertCircle size={14} />;
      case 'IN_REPAIR': return <XCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  const handleAcceptAsset = (asset) => {
    setSelectedAsset(asset);
    setActionType('accept');
    setShowActionModal(true);
  };

  const handleRequestClarification = (asset) => {
    setSelectedAsset(asset);
    setActionType('clarification');
    setShowActionModal(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ASSIGNED', label: 'Pending Acceptance' },
    { value: 'IN_USE', label: 'In Use' },
    { value: 'NEED_CLARIFICATION', label: 'Need Clarification' },
    { value: 'IN_REPAIR', label: 'In Repair' }
  ];

  // Count assets by status
  const statusCounts = {
    total: myAssets.length,
    assigned: myAssets.filter(a => a.status === 'ASSIGNED').length,
    inUse: myAssets.filter(a => a.status === 'IN_USE').length,
    needClarification: myAssets.filter(a => a.status === 'NEED_CLARIFICATION').length,
    inRepair: myAssets.filter(a => a.status === 'IN_REPAIR').length
  };

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
            <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>My Assets</h1>
            <p className={`${textMuted} text-sm`}>
              View and manage assets assigned to you
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Package className="text-almet-sapphire" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Total Assets</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{statusCounts.total}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-orange-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Pending Acceptance</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{statusCounts.assigned}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-emerald-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>In Use</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{statusCounts.inUse}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="text-violet-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Need Clarification</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{statusCounts.needClarification}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <XCircle className="text-red-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>In Repair</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{statusCounts.inRepair}</p>
            </div>
          </div>

          {/* Filters */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-4 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="md:col-span-1 relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="text"
                  placeholder="Search my assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                />
              </div>

              <SearchableDropdown
                options={statusOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Filter by status"
                darkMode={darkMode}
                icon={<Filter size={12} />}
              />

              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 flex-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 px-3 py-1.5 rounded text-xs ${
                      viewMode === "grid" ? "bg-almet-sapphire text-white" : textMuted
                    }`}
                  >
                    <Grid3X3 size={12} className="inline mr-1" />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex-1 px-3 py-1.5 rounded text-xs ${
                      viewMode === "table" ? "bg-almet-sapphire text-white" : textMuted
                    }`}
                  >
                    <ListIcon size={12} className="inline mr-1" />
                    Table
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className={`${textMuted} text-xs`}>
                {filteredAssets.length} of {myAssets.length} assets
              </p>
            </div>
          </div>

          {/* Assets Display */}
          <div className={`${bgCard} rounded-xl border ${borderColor}`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                <span className={`${textMuted}`}>Loading your assets...</span>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className={`${textPrimary} font-medium mb-1`}>No assets found</p>
                <p className={`${textMuted} text-sm`}>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No assets are currently assigned to you'}
                </p>
              </div>
            ) : viewMode === "table" ? (
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
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Duration
                      </th>
                      <th className={`px-6 py-4 text-center text-xs font-semibold ${textMuted} uppercase`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredAssets.map((asset) => (
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getStatusColor(asset.status)}`}>
                            {getStatusIcon(asset.status)}
                            <span className="ml-1.5">{asset.status_display}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {formatDate(asset.current_assignment?.assignment?.check_out_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {asset.current_assignment?.assignment?.duration_days || 0} days
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {asset.status === 'ASSIGNED' && (
                              <>
                                <button
                                  onClick={() => handleAcceptAsset(asset)}
                                  className={`${btnSuccess} px-3 py-1.5 rounded text-xs`}
                                  title="Accept Asset"
                                >
                                  <CheckCircle size={12} className="mr-1 inline" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRequestClarification(asset)}
                                  className={`${btnSecondary} px-3 py-1.5 rounded text-xs`}
                                  title="Request Clarification"
                                >
                                  <MessageSquare size={12} className="mr-1 inline" />
                                  Clarify
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {/* View details */}}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Eye size={14} className="text-almet-sapphire" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className={`${bgAccent} rounded-xl p-6 border ${borderColor} hover:shadow-lg transition-all`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`${textPrimary} font-semibold text-sm mb-1`}>
                          {asset.asset_name}
                        </h3>
                        <p className={`${textMuted} text-xs`}>{asset.serial_number}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(asset.status)}`}>
                        {getStatusIcon(asset.status)}
                        <span className="ml-1">{asset.status_display}</span>
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Category:</span>
                        <span className={textSecondary}>{asset.category_name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Assigned:</span>
                        <span className={textSecondary}>
                          {formatDate(asset.current_assignment?.assignment?.check_out_date)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Duration:</span>
                        <span className={textSecondary}>
                          {asset.current_assignment?.assignment?.duration_days || 0} days
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {asset.status === 'ASSIGNED' && (
                        <>
                          <button
                            onClick={() => handleAcceptAsset(asset)}
                            className={`${btnSuccess} w-full px-3 py-2 rounded-lg text-xs flex items-center justify-center`}
                          >
                            <CheckCircle size={12} className="mr-1" />
                            Accept Asset
                          </button>
                          <button
                            onClick={() => handleRequestClarification(asset)}
                            className={`${btnSecondary} w-full px-3 py-2 rounded-lg text-xs flex items-center justify-center`}
                          >
                            <MessageSquare size={12} className="mr-1" />
                            Request Clarification
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {/* View details */}}
                        className={`${btnSecondary} w-full px-3 py-2 rounded-lg text-xs flex items-center justify-center`}
                      >
                        <Eye size={12} className="mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <AssetActionModal
          asset={selectedAsset}
          actionType={actionType}
          onClose={() => {
            setShowActionModal(false);
            setSelectedAsset(null);
          }}
          onSuccess={() => {
            setShowActionModal(false);
            setSelectedAsset(null);
            fetchMyAssets();
            setNotification({ 
              message: actionType === 'accept' ? 'Asset accepted successfully' : 'Clarification request sent', 
              type: 'success' 
            });
          }}
          darkMode={darkMode}
        />
      )}
    </DashboardLayout>
  );
};

// Asset Action Modal (Accept / Request Clarification)
const AssetActionModal = ({ asset, actionType, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    comments: '',
    clarification_reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSuccess = "bg-emerald-500 hover:bg-emerald-600 text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (actionType === 'accept') {
        // 🎯 Backend: POST /assets/assets/accept-assignment/
        await assetService.acceptAsset({
          asset_id: asset.id,
          comments: formData.comments
        });
      } else {
        // 🎯 Backend: POST /assets/assets/request-clarification/
        await assetService.requestClarification({
          asset_id: asset.id,
          clarification_reason: formData.clarification_reason
        });
      }
      onSuccess();
    } catch (err) {
      console.error('Action error:', err);
      setError(err.response?.data?.message || `Failed to ${actionType} asset`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>
              {actionType === 'accept' ? 'Accept Asset' : 'Request Clarification'}
            </h2>
            <button type="button" onClick={onClose} className={`${textMuted} hover:${textPrimary}`}>
              <XCircle size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 border ${borderColor}`}>
            <p className={`${textPrimary} font-semibold mb-1`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-sm`}>Serial: {asset.serial_number}</p>
            <p className={`${textMuted} text-sm`}>Category: {asset.category_name}</p>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              {actionType === 'accept' ? 'Comments (Optional)' : 'Clarification Reason *'}
            </label>
            <textarea
              value={actionType === 'accept' ? formData.comments : formData.clarification_reason}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [actionType === 'accept' ? 'comments' : 'clarification_reason']: e.target.value
              }))}
              className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
              rows="4"
              placeholder={actionType === 'accept' 
                ? 'Add any comments about the asset...' 
                : 'Please explain what clarification you need...'}
              required={actionType !== 'accept'}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (actionType !== 'accept' && !formData.clarification_reason.trim())}
              className={`${actionType === 'accept' ? btnSuccess : btnPrimary} px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 flex items-center`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'accept' ? (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Accept Asset
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} className="mr-2" />
                      Send Request
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyAssetsPage;