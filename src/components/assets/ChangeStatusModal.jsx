// src/components/assets/ChangeStatusModal.jsx & CheckInAssetModal.jsx - COMPLETE
"use client";
import { useState } from "react";
import { 
  XCircle, 
  Loader, 
  RotateCcw,
  LogOut
} from "lucide-react";
import { assetService } from "@/services/assetService";
import SearchableDropdown from "../common/SearchableDropdown";

// Change Status Modal
const ChangeStatusModal = ({ asset, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    status: asset.status,
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  const statusOptions = [
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'ASSIGNED', label: 'Assigned (Pending Approval)' },
    { value: 'IN_USE', label: 'In Use' },
    { value: 'NEED_CLARIFICATION', label: 'Need Clarification' },
    { value: 'IN_REPAIR', label: 'In Repair' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await assetService.changeAssetStatus(asset.id, formData);
      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change asset status');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Change Asset Status</h2>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={20} />
            </button>
          </div>

          {/* Asset Info */}
          <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} font-semibold mb-2`}>Asset Details</h3>
            <p className={`${textPrimary} text-sm`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-xs`}>Serial: {asset.serial_number}</p>
            <p className={`${textMuted} text-xs`}>Current Status: {asset.status_display}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                New Status *
              </label>
              <SearchableDropdown
                options={statusOptions}
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                placeholder="Select new status"
                searchPlaceholder="Search statuses..."
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Reason for Status Change
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
                rows="3"
                placeholder="Explain why you're changing the status..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm hover:shadow-md transition-all duration-200`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.status === asset.status}
              className={`${btnPrimary} px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RotateCcw size={16} className="mr-2" />
                  Change Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
