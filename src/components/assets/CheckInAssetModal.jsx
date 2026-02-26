// src/components/assets/CheckInAssetModal.jsx - CLEAN VERSION (Small Fonts)
"use client";
import { useState } from 'react';
import { XCircle, Loader, LogOut } from 'lucide-react';
import { assetService } from '@/services/assetService';
import SearchableDropdown from '../common/SearchableDropdown';

const CheckInAssetModal = ({ asset, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    check_in_date: new Date().toISOString().split('T')[0],
    check_in_notes: '',
    condition_on_checkin: 'EXCELLENT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
    { value: 'DAMAGED', label: 'Damaged' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await assetService.checkInAsset(asset.id, formData);
      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-md shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className={`${textPrimary} text-lg font-semibold`}>Check In Asset</h2>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={18} />
            </button>
          </div>

          {/* Asset Info */}
          <div className={`${bgAccent} rounded-lg p-3 mb-4 border ${borderColor}`}>
            <p className={`${textPrimary} text-sm font-medium mb-0.5`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-xs`}>Serial: {asset.serial_number}</p>
            {asset.assigned_to && (
              <p className={`${textMuted} text-xs`}>
                Assigned to: {asset.assigned_to.full_name || asset.assigned_to_name}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Check In Date *
              </label>
              <input
                type="date"
                name="check_in_date"
                value={formData.check_in_date}
                onChange={(e) => setFormData(prev => ({ ...prev, check_in_date: e.target.value }))}
                required
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Condition *
              </label>
              <SearchableDropdown
                options={conditionOptions}
                value={formData.condition_on_checkin}
                onChange={(value) => setFormData(prev => ({ ...prev, condition_on_checkin: value }))}
                placeholder="Select condition"
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Notes (Optional)
              </label>
              <textarea
                name="check_in_notes"
                value={formData.check_in_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, check_in_notes: e.target.value }))}
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
                rows="2"
                placeholder="Add notes about condition..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
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
              className="px-4 py-2 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <LogOut size={12} />
                  Check In
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInAssetModal;