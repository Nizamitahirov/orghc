// src/components/assets/EmployeeAssetActionModal.jsx - CLEAN VERSION (Small Fonts)
"use client";
import { useState } from "react";
import { employeeAssetService } from "@/services/assetService";
import { Loader, XCircle, Ban, Reply } from "lucide-react";

const EmployeeAssetActionModal = ({ asset, employeeId, onClose, onSuccess, darkMode, actionType }) => {
  const [actionData, setActionData] = useState({
    clarification_response: '',
    cancellation_reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (actionType === 'provide_clarification') {
        await employeeAssetService.provideClarification(employeeId, {
          asset_id: asset.id,
          clarification_response: actionData.clarification_response
        });
      } else if (actionType === 'cancel_assignment') {
        await employeeAssetService.cancelAssignment(employeeId, {
          asset_id: asset.id,
          cancellation_reason: actionData.cancellation_reason
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType.replace('_', ' ')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-md shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className={`${textPrimary} text-lg font-semibold`}>
              {actionType === 'provide_clarification' ? 'Provide Clarification' : 'Cancel Assignment'}
            </h3>
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
            <p className={`${textPrimary} font-medium text-sm mb-0.5`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-xs`}>Serial: {asset.serial_number}</p>
            <p className={`${textMuted} text-xs`}>Category: {asset.category_name}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            {actionType === 'provide_clarification' && (
              <div>
                <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                  Clarification Response *
                </label>
                <textarea
                  name="clarification_response"
                  value={actionData.clarification_response}
                  onChange={(e) => setActionData(prev => ({ ...prev, clarification_response: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
                  rows="3"
                  placeholder="Provide clarification..."
                  required
                />
              </div>
            )}

            {actionType === 'cancel_assignment' && (
              <div>
                <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                  Cancellation Reason *
                </label>
                <textarea
                  name="cancellation_reason"
                  value={actionData.cancellation_reason}
                  onChange={(e) => setActionData(prev => ({ ...prev, cancellation_reason: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
                  rows="2"
                  placeholder="Explain why..."
                  required
                />
              </div>
            )}
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
              disabled={
                loading ||
                (actionType === 'provide_clarification' && !actionData.clarification_response.trim()) ||
                (actionType === 'cancel_assignment' && !actionData.cancellation_reason.trim())
              }
              className={`px-4 py-2 rounded-lg text-xs ${
                actionType === 'provide_clarification' 
                  ? 'bg-almet-sapphire hover:bg-almet-astral' 
                  : 'bg-red-500 hover:bg-red-600'
              } text-white disabled:opacity-50 flex items-center gap-1.5`}
            >
              {loading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'provide_clarification' ? (
                    <>
                      <Reply size={12} />
                      Submit
                    </>
                  ) : (
                    <>
                      <Ban size={12} />
                      Cancel
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

export default EmployeeAssetActionModal;