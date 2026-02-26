// src/components/assets/AssetManagementModals.jsx - CLEAN VERSION (Small Fonts)
"use client";
import { useState } from "react";
import { XCircle, Plus, Edit, Loader, AlertCircle } from "lucide-react";
import { assetService } from "@/services/assetService";
import SearchableDropdown from "@/components/common/SearchableDropdown";

// Add Asset Modal
export const AddAssetModal = ({ onClose, onSuccess, categories, batches, darkMode }) => {
  const [formData, setFormData] = useState({
    batch: "",
    serial_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  const batchOptions = batches
    ?.filter(b => b.available_quantity > 0)
    ?.map(batch => ({
      value: batch.id,
      label: `${batch.asset_name} - ${batch.batch_number} (${batch.available_quantity} available)`
    })) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await assetService.createAsset({
        batch_id: formData.batch,
        serial_number: formData.serial_number
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className={`${textPrimary} text-lg font-semibold`}>Add New Asset</h2>
            <button type="button" onClick={onClose} className={`${textMuted} hover:${textPrimary} p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
              <XCircle size={20} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Select Batch *
              </label>
              <SearchableDropdown
                options={batchOptions}
                value={formData.batch}
                onChange={(value) => setFormData(prev => ({ ...prev, batch: value }))}
                placeholder="Select a batch"
                searchPlaceholder="Search batches..."
                darkMode={darkMode}
                allowUncheck={true}
              />
              <p className={`${textMuted} text-xs mt-1`}>
                Choose an existing batch to create asset
              </p>
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Serial Number *
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                required
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
                placeholder="Enter unique serial number"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-900 dark:text-blue-100 text-xs font-medium mb-0.5">
                    Asset Creation
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    Asset details will be inherited from the selected batch
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.batch || !formData.serial_number}
              className="px-4 py-2 rounded-lg text-xs bg-almet-sapphire hover:bg-almet-astral text-white disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={12} />
                  Create Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Asset Modal
export const EditAssetModal = ({ asset, onClose, onSuccess, categories, darkMode }) => {
  const [formData, setFormData] = useState({
    asset_name: asset.asset_name || "",
    category: asset.category?.id || "",
    serial_number: asset.serial_number || "",
    purchase_price: asset.purchase_price || "",
    purchase_date: asset.purchase_date || "",
    useful_life_years: asset.useful_life_years || 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await assetService.updateAsset(asset.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update asset");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className={`${textPrimary} text-lg font-semibold`}>Edit Asset</h2>
            <button type="button" onClick={onClose} className={`${textMuted} hover:${textPrimary} p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
              <XCircle size={20} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Asset Name *
              </label>
              <input
                type="text"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Category *
              </label>
              <SearchableDropdown
                options={categoryOptions}
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                placeholder="Select category"
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Serial Number *
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Purchase Price *
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Useful Life (Years) *
              </label>
              <input
                type="number"
                name="useful_life_years"
                value={formData.useful_life_years}
                onChange={handleChange}
                required
                min="1"
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs bg-almet-sapphire hover:bg-almet-astral text-white disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit size={12} />
                  Update Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};