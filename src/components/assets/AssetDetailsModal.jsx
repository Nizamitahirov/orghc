// src/components/assets/AssetDetailsModal.jsx - CLEAN VERSION
"use client";
import { useState } from "react";
import { 
  XCircle, Edit, Package, User, Calendar,
  Building, DollarSign, LogOut, RotateCcw, Activity
} from "lucide-react";
import CheckInAssetModal from "./CheckInAssetModal";
import ChangeStatusModal from "./ChangeStatusModal";

export const AssetDetailsModal = ({ asset, onClose, darkMode, onEdit, onCheckIn, onChangeStatus }) => {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Utilities
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "AZN"
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'IN_STOCK': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300',
      'IN_USE': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
      'ASSIGNED': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
      'NEED_CLARIFICATION': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300',
      'IN_REPAIR': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
      'ARCHIVED': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Info Section Component
  const InfoSection = ({ icon: Icon, title, children }) => (
    <div className={`${bgAccent} rounded-xl p-6 border ${borderColor}`}>
      <h3 className={`${textPrimary} font-semibold mb-4 flex items-center gap-2`}>
        <Icon size={18} className="text-almet-sapphire" />
        {title}
      </h3>
      {children}
    </div>
  );

  // Info Row Component
  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-2">
      <span className={`${textMuted} text-sm flex items-center gap-2`}>
        {Icon && <Icon size={14} />}
        {label}
      </span>
      <span className={`${textPrimary} text-sm font-medium text-right`}>{value}</span>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${bgCard} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className={`${textPrimary} text-2xl font-bold mb-2`}>{asset.asset_name}</h2>
                <p className={`${textMuted} text-sm`}>Serial: {asset.serial_number}</p>
              </div>
              <button
                onClick={onClose}
                className={`${textMuted} hover:${textPrimary} p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <InfoSection icon={Package} title="Basic Information">
                  <div className="space-y-2 divide-y divide-gray-200 dark:divide-gray-700">
                    <InfoRow label="Asset Name" value={asset.asset_name} />
                    <InfoRow label="Serial Number" value={asset.serial_number} />
                    <InfoRow 
                      label="Category" 
                      value={asset.category?.name || asset.category_name}
                      icon={Building}
                    />
                    <div className="flex items-center justify-between py-2">
                      <span className={`${textMuted} text-sm`}>Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                        {asset.status_display}
                      </span>
                    </div>
                    <InfoRow 
                      label="Purchase Price" 
                      value={formatCurrency(asset.purchase_price)}
                      icon={DollarSign}
                    />
                    <InfoRow 
                      label="Purchase Date" 
                      value={formatDate(asset.purchase_date)}
                      icon={Calendar}
                    />
                    <InfoRow label="Useful Life" value={`${asset.useful_life_years} years`} />
                  </div>
                </InfoSection>

                {/* Assignment Info */}
                {asset.assigned_to && (
                  <InfoSection icon={User} title="Current Assignment">
                    <div className="space-y-2 divide-y divide-gray-200 dark:divide-gray-700">
                      <InfoRow 
                        label="Employee" 
                        value={asset.assigned_to.full_name || asset.assigned_to_name}
                      />
                      <InfoRow 
                        label="Employee ID" 
                        value={asset.assigned_to.employee_id || asset.assigned_to_employee_id}
                      />
                      <InfoRow 
                        label="Assignment Date" 
                        value={formatDate(asset.current_assignment?.assignment?.check_out_date)}
                      />
                    </div>
                  </InfoSection>
                )}
              </div>

              {/* Actions Sidebar */}
              <div className="space-y-4">
                {/* Actions */}
                <div className={`${bgAccent} rounded-xl p-6 border ${borderColor}`}>
                  <h3 className={`${textPrimary} font-semibold mb-4 flex items-center gap-2`}>
                    <Activity size={18} className="text-almet-sapphire" />
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={onEdit}
                      className="w-full bg-almet-sapphire hover:bg-almet-astral text-white px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit size={14} />
                      Edit Asset
                    </button>
                    
                    {asset.can_be_checked_in && (
                      <button
                        onClick={() => setShowCheckInModal(true)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <LogOut size={14} />
                        Check In
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw size={14} />
                      Change Status
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                {(asset.assignments?.length > 0 || asset.activities?.length > 0) && (
                  <div className={`${bgAccent} rounded-xl p-6 border ${borderColor}`}>
                    <h3 className={`${textPrimary} font-semibold mb-4`}>Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`${textMuted} text-sm`}>Assignments</span>
                        <span className={`${textPrimary} font-semibold`}>{asset.assignments?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`${textMuted} text-sm`}>Activities</span>
                        <span className={`${textPrimary} font-semibold`}>{asset.activities?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCheckInModal && (
        <CheckInAssetModal
          asset={asset}
          onClose={() => setShowCheckInModal(false)}
          onSuccess={(updatedAsset) => {
            setShowCheckInModal(false);
            onCheckIn && onCheckIn(updatedAsset);
          }}
          darkMode={darkMode}
        />
      )}

      {showStatusModal && (
        <ChangeStatusModal
          asset={asset}
          onClose={() => setShowStatusModal(false)}
          onSuccess={(updatedAsset) => {
            setShowStatusModal(false);
            onChangeStatus && onChangeStatus(updatedAsset);
          }}
          darkMode={darkMode}
        />
      )}
    </>
  );
};