// src/app/asset-management/batches/[id]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { batchService } from "@/services/assetService";
import {
  ArrowLeft,
  Package,
  Loader,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Grid3X3,
  List as ListIcon,
  FileText,
  Box
} from "lucide-react";
import Link from "next/link";

const BatchDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const batchId = params.id;

  // State
  const [batch, setBatch] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [notification, setNotification] = useState(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Fetch batch details
  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const response = await batchService.getBatch(batchId);
      setBatch(response);
    } catch (err) {
      console.error("Failed to fetch batch details:", err);
      setNotification({ message: "Failed to load batch details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch batch assets
  const fetchBatchAssets = async () => {
    setAssetsLoading(true);
    try {
      const response = await batchService.getBatchAssets(batchId);
      setAssets(response.assets || []);
    } catch (err) {
      console.error("Failed to fetch batch assets:", err);
    } finally {
      setAssetsLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails();
      fetchBatchAssets();
    }
  }, [batchId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AZN"
    }).format(amount || 0);
  };

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
      'IN_STOCK': 'bg-sky-50 text-sky-600 border-sky-200',
      'IN_USE': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'ASSIGNED': 'bg-orange-50 text-orange-600 border-orange-200',
      'IN_REPAIR': 'bg-red-50 text-red-600 border-red-200',
      'ARCHIVED': 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getStockPercentage = () => {
    if (!batch) return 0;
    return batch.initial_quantity > 0 
      ? Math.round((batch.available_quantity / batch.initial_quantity) * 100)
      : 0;
  };

  const stockPercentage = getStockPercentage();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-almet-sapphire mr-3" />
          <span className={`${textMuted}`}>Loading batch details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!batch) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className={`${textPrimary} text-lg font-medium mb-2`}>Batch not found</p>
          <Link href="/settings/asset-mng/batches" className={`${btnPrimary} px-4 py-2 rounded-lg inline-block`}>
            Back to Batches
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
              href="/settings/asset-mng/batches"
              className={`${textMuted} hover:${textPrimary} flex items-center text-sm mb-4`}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Batches
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>{batch.asset_name}</h1>
                <p className={`${textMuted} text-sm`}>Batch #{batch.batch_number}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`${btnPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm hover:shadow-lg transition-all`}
              >
                <Plus size={16} className="mr-2" />
                Create Assets from Batch
              </button>
            </div>
          </div>

          {/* Batch Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Stock Status */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <Package className="text-almet-sapphire" size={24} />
                <span className={`text-xs font-medium ${stockPercentage > 20 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stockPercentage}%
                </span>
              </div>
              <p className={`${textMuted} text-xs mb-2`}>Stock Availability</p>
              <p className={`${textPrimary} text-2xl font-bold mb-2`}>
                {batch.available_quantity}/{batch.initial_quantity}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${stockPercentage > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>

            {/* Assigned */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <User className="text-blue-500" size={24} />
              </div>
              <p className={`${textMuted} text-xs mb-2`}>Assigned Assets</p>
              <p className={`${textPrimary} text-2xl font-bold`}>
                {batch.assigned_quantity}
              </p>
            </div>

            {/* Unit Price */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="text-emerald-500" size={24} />
              </div>
              <p className={`${textMuted} text-xs mb-2`}>Unit Price</p>
              <p className={`${textPrimary} text-xl font-bold`}>
                {formatCurrency(batch.unit_price)}
              </p>
            </div>

            {/* Total Value */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-purple-500" size={24} />
              </div>
              <p className={`${textMuted} text-xs mb-2`}>Total Value</p>
              <p className={`${textPrimary} text-xl font-bold`}>
                {formatCurrency(batch.total_value)}
              </p>
            </div>
          </div>

          {/* Batch Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Details */}
            <div className={`lg:col-span-2 ${bgCard} rounded-xl border ${borderColor} p-6`}>
              <h2 className={`${textPrimary} text-lg font-semibold mb-6 flex items-center`}>
                <FileText size={18} className="mr-2 text-almet-sapphire" />
                Batch Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Asset Name
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>{batch.asset_name}</p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Batch Number
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>{batch.batch_number}</p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Category
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>{batch.category?.name}</p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${
                    batch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {batch.status}
                  </span>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Purchase Date
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>{formatDate(batch.purchase_date)}</p>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Useful Life
                  </label>
                  <p className={`${textPrimary} text-sm font-medium`}>{batch.useful_life_years} years</p>
                </div>
                {batch.supplier && (
                  <div>
                    <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                      Supplier
                    </label>
                    <p className={`${textPrimary} text-sm font-medium`}>{batch.supplier}</p>
                  </div>
                )}
                {batch.purchase_order_number && (
                  <div>
                    <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                      PO Number
                    </label>
                    <p className={`${textPrimary} text-sm font-medium`}>{batch.purchase_order_number}</p>
                  </div>
                )}
              </div>
              {batch.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className={`block text-xs font-medium ${textMuted} mb-2`}>
                    Notes
                  </label>
                  <p className={`${textSecondary} text-sm`}>{batch.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                <h3 className={`${textPrimary} text-lg font-semibold mb-4 flex items-center`}>
                  <Box size={18} className="mr-2 text-almet-sapphire" />
                  Quantity Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${textMuted} text-sm`}>Initial Quantity</span>
                    <span className={`${textPrimary} font-semibold`}>{batch.initial_quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${textMuted} text-sm`}>Available</span>
                    <span className={`${textPrimary} font-semibold text-emerald-600`}>
                      {batch.available_quantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${textMuted} text-sm`}>Assigned</span>
                    <span className={`${textPrimary} font-semibold text-blue-600`}>
                      {batch.assigned_quantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${textMuted} text-sm`}>Out of Stock</span>
                    <span className={`${textPrimary} font-semibold text-red-600`}>
                      {batch.out_of_stock_quantity}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                <h3 className={`${textPrimary} text-lg font-semibold mb-4`}>Created By</h3>
                <div className="space-y-2">
                  <p className={`${textSecondary} text-sm`}>
                    {batch.created_by_detail?.first_name} {batch.created_by_detail?.last_name}
                  </p>
                  <p className={`${textMuted} text-xs`}>
                    {formatDate(batch.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assets List */}
          <div className={`${bgCard} rounded-xl border ${borderColor}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className={`${textPrimary} text-lg font-semibold flex items-center`}>
                  <Package size={18} className="mr-2 text-almet-sapphire" />
                  Assets in Batch ({assets.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1.5 rounded text-xs ${
                        viewMode === "grid" ? "bg-almet-sapphire text-white" : textMuted
                      }`}
                    >
                      <Grid3X3 size={12} className="inline mr-1" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1.5 rounded text-xs ${
                        viewMode === "table" ? "bg-almet-sapphire text-white" : textMuted
                      }`}
                    >
                      <ListIcon size={12} className="inline mr-1" />
                      Table
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {assetsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                <span className={`${textMuted}`}>Loading assets...</span>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className={`${textPrimary} font-medium mb-1`}>No assets created yet</p>
                <p className={`${textMuted} text-sm mb-4`}>Create assets from this batch to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`${btnPrimary} px-4 py-2 rounded-lg text-sm`}
                >
                  <Plus size={14} className="mr-2 inline" />
                  Create Assets
                </button>
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${bgAccent} border-b ${borderColor}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Asset Number
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Serial Number
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Assigned To
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
                          <span className={`${textPrimary} font-medium text-sm`}>
                            {asset.asset_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {asset.serial_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getStatusColor(asset.status)}`}>
                            {asset.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {asset.assigned_to_name ? (
                            <span className={`${textSecondary} text-sm`}>
                              {asset.assigned_to_name}
                            </span>
                          ) : (
                            <span className={`${textMuted} text-sm italic`}>Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/settings/asset-mng?asset=${asset.id}`}
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
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className={`${textPrimary} font-medium text-sm mb-1`}>
                          {asset.asset_number}
                        </p>
                        <p className={`${textMuted} text-xs`}>{asset.serial_number}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(asset.status)}`}>
                        {asset.status_display}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Assigned To:</span>
                        <span className={textSecondary}>
                          {asset.assigned_to_name || "Unassigned"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/settings/asset-mng?asset=${asset.id}`}
                      className={`${btnSecondary} w-full px-3 py-2 rounded-lg text-xs flex items-center justify-center`}
                    >
                      <Eye size={12} className="mr-1" />
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Assets Modal - would need to be implemented */}
      {showCreateModal && (
        <CreateAssetsModal
          batch={batch}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchBatchAssets();
            fetchBatchDetails();
            setNotification({ message: "Assets created successfully", type: "success" });
          }}
          darkMode={darkMode}
        />
      )}
    </DashboardLayout>
  );
};

// Placeholder for Create Assets Modal
const CreateAssetsModal = ({ batch, onClose, onSuccess, darkMode }) => {
  const [quantity, setQuantity] = useState(1);
  const [serialNumbers, setSerialNumbers] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200";

  const handleAddSerialNumber = () => {
    setSerialNumbers([...serialNumbers, '']);
    setQuantity(serialNumbers.length + 1);
  };

  const handleRemoveSerialNumber = (index) => {
    const newSerials = serialNumbers.filter((_, i) => i !== index);
    setSerialNumbers(newSerials);
    setQuantity(newSerials.length);
  };

  const handleSerialChange = (index, value) => {
    const newSerials = [...serialNumbers];
    newSerials[index] = value;
    setSerialNumbers(newSerials);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validSerials = serialNumbers.filter(s => s.trim());
      if (validSerials.length === 0) {
        throw new Error('Please provide at least one serial number');
      }

      await batchService.createAssetsFromBatch(batch.id, {
        quantity: validSerials.length,
        serial_numbers: validSerials
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create assets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-2xl shadow-2xl border ${borderColor} max-h-[90vh] overflow-y-auto`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Create Assets from Batch</h2>
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
            <p className={`${textPrimary} font-semibold mb-2`}>{batch.asset_name}</p>
            <p className={`${textMuted} text-sm`}>
              Available Quantity: {batch.available_quantity}/{batch.initial_quantity}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${textPrimary}`}>
                Serial Numbers (Quantity: {serialNumbers.length})
              </label>
              <button
                type="button"
                onClick={handleAddSerialNumber}
                className={`${btnPrimary} px-3 py-1.5 rounded text-xs`}
                disabled={serialNumbers.length >= batch.available_quantity}
              >
                <Plus size={12} className="mr-1 inline" />
                Add Serial
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {serialNumbers.map((serial, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => handleSerialChange(index, e.target.value)}
                    placeholder={`Serial number ${index + 1}`}
                    className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                    required
                  />
                  {serialNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSerialNumber(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              disabled={loading || serialNumbers.filter(s => s.trim()).length === 0}
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
                  Create {serialNumbers.filter(s => s.trim()).length} Asset(s)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchDetailPage;