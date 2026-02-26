// src/components/headcount/EmployeeAssetManagement.jsx - COMPLETE REWRITE
"use client";
import { useState, useEffect } from "react";
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  Calendar,
  Building,
  Loader,
  CheckSquare,
  Ban,
  Info,
  Hash,
  Tag,
  ArrowRightLeft,
  User,
  FileText
} from "lucide-react";
import { assetService, transferService } from "@/services/assetService";

const EmployeeAssetManagement = ({ employeeId, employeeData, darkMode }) => {
  const [assets, setAssets] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({
    comments: '',
    clarification_reason: '',
    transfer_approval_comments: ''
  });

  // Enhanced Almet theme classes
  const bgPrimary = darkMode ? "bg-almet-cloud-burst" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-comet" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-almet-comet hover:bg-almet-san-juan text-almet-bali-hai border border-almet-comet"
    : "bg-white hover:bg-almet-mystic text-almet-waterloo border border-gray-300";
  const btnSuccess = "bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200";
  const btnWarning = "bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200";
  const btnDanger = "bg-red-500 hover:bg-red-600 text-white transition-all duration-200";
  const shadowClass = darkMode ? "shadow-md shadow-black/10" : "shadow-sm shadow-gray-200/50";
  const bgAccent = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";

  // ✅ Load data from employeeData prop
  useEffect(() => {
    if (employeeData) {
      // Assets assigned to employee
      setAssets(employeeData.assigned_assets || []);
      
      // Pending transfer approvals from employee API
      setPendingTransfers(employeeData.pending_transfer_approvals || []);
      
      console.log('📦 Assets loaded:', employeeData.assigned_assets?.length || 0);
      console.log('🔄 Pending transfers loaded:', employeeData.pending_transfer_approvals?.length || 0);
    }
  }, [employeeData]);

  // Enhanced status colors with Almet palette
  const getStatusColor = (status) => {
    const statusColors = {
      'IN_STOCK': 'bg-almet-steel-blue/10 text-almet-steel-blue border-almet-steel-blue/20 dark:bg-almet-steel-blue/20 dark:text-almet-steel-blue dark:border-almet-steel-blue/30',
      'IN_USE': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/30',
      'ASSIGNED': 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/30',
      'NEED_CLARIFICATION': 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/30',
      'IN_REPAIR': 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/30',
      'ARCHIVED': 'bg-almet-santas-gray/10 text-almet-santas-gray border-almet-santas-gray/20 dark:bg-almet-santas-gray/20 dark:text-almet-santas-gray dark:border-almet-santas-gray/30'
    };
    return statusColors[status] || 'bg-almet-bali-hai/10 text-almet-bali-hai border-almet-bali-hai/20 dark:bg-almet-bali-hai/20 dark:text-almet-bali-hai dark:border-almet-bali-hai/30';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN_USE':
        return <CheckCircle size={10} />;
      case 'ASSIGNED':
        return <Clock size={10} />;
      case 'NEED_CLARIFICATION':
        return <AlertTriangle size={10} />;
      case 'IN_STOCK':
        return <Package size={10} />;
      default:
        return <Package size={10} />;
    }
  };

  // ✅ Accept asset
  const handleAcceptAsset = async (asset) => {
    setActionLoading(prev => ({ ...prev, [asset.id]: true }));
    try {
      await assetService.acceptAsset({
        asset_id: asset.id,
        comments: actionData.comments || 'Asset accepted by employee'
      });
      
      // Refresh page to reload employee data
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to accept asset:', error);
      const errorMsg = error.response?.data?.error || 'Failed to accept asset. Please try again.';
      alert(`❌ ${errorMsg}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  // ✅ Request clarification
  const handleRequestClarification = async (asset) => {
    if (!actionData.clarification_reason.trim()) {
      alert('⚠️ Please provide a clarification reason');
      return;
    }

    setActionLoading(prev => ({ ...prev, [asset.id]: true }));
    try {
      await assetService.requestClarification({
        asset_id: asset.id,
        clarification_reason: actionData.clarification_reason
      });
      
      // Refresh page
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to request clarification:', error);
      const errorMsg = error.response?.data?.error || 'Failed to request clarification. Please try again.';
      alert(`❌ ${errorMsg}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  // ✅ Approve/Reject transfer
  const handleTransferAction = async (transfer, approved) => {
  setActionLoading(prev => ({ ...prev, [transfer.id]: true }));
  try {
    // ✅ transferService istifadə et, assetService yox
    await transferService.employeeApproveTransfer(transfer.id, {
      approved: approved,
      comments: actionData.transfer_approval_comments || (approved ? 'Transfer approved' : 'Transfer rejected')
    });
    
    // Refresh page
    window.location.reload();
    
  } catch (error) {
    console.error('Failed to process transfer:', error);
    const errorMsg = error.response?.data?.error || 'Failed to process transfer. Please try again.';
    alert(`❌ ${errorMsg}`);
  } finally {
    setActionLoading(prev => ({ ...prev, [transfer.id]: false }));
  }
};
  const resetActionData = () => {
    setActionData({
      comments: '',
      clarification_reason: '',
      transfer_approval_comments: ''
    });
  };

  const openActionModal = (asset, type, transfer = null) => {
    setSelectedAsset(asset);
    setSelectedTransfer(transfer);
    setActionType(type);
    setShowActionModal(true);
    resetActionData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short", 
      year: "numeric"
    });
  };

  return (
    <div className="space-y-4">
      
      {/* ✅ Pending Transfer Approvals */}
      {pendingTransfers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-almet-sapphire" />
            <h3 className={`${textPrimary} font-bold text-sm`}>
              Pending Transfer Approvals ({pendingTransfers.length})
            </h3>
          </div>
          
          {pendingTransfers.map((transfer) => (
            <div key={transfer.id} className={`${bgCard} rounded-lg border-2 border-amber-500/50 p-4 ${shadowClass} hover:shadow-md transition-all duration-200`}>
              
              {/* Transfer Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <ArrowRightLeft size={16} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`${textPrimary} font-semibold text-sm mb-1`}>
                        {transfer.asset.asset_name}
                      </h4>
                      <p className={`${textMuted} text-xs flex items-center gap-1`}>
                        <Hash size={10} />
                        {transfer.asset.serial_number}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30">
                      <Clock size={10} className="mr-1" />
                      Pending Approval
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfer Info */}
              <div className={`${bgAccent} rounded-md p-3 mb-3 border ${borderColor}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className={`${textMuted} text-[9px] uppercase tracking-wide font-semibold mb-1`}>From</p>
                    <div className="flex items-center gap-2">
                      <User size={12} className={`${textMuted}`} />
                      <span className={`${textSecondary} text-xs font-medium`}>
                        {transfer.from_employee.name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={`${textMuted} text-[9px] uppercase tracking-wide font-semibold mb-1`}>Requested By</p>
                    <div className="flex items-center gap-2">
                      <User size={12} className={`${textMuted}`} />
                      <span className={`${textSecondary} text-xs font-medium`}>
                        {transfer.requested_by.name}
                      </span>
                    </div>
                  </div>
                </div>
                
                {transfer.transfer_notes && (
                  <div className="mt-2 pt-2 border-t border-current/10">
                    <p className={`${textMuted} text-[9px] uppercase tracking-wide font-semibold mb-1`}>Notes</p>
                    <p className={`${textSecondary} text-xs`}>{transfer.transfer_notes}</p>
                  </div>
                )}
                
                <div className="mt-2 pt-2 border-t border-current/10">
                  <p className={`${textMuted} text-[9px]`}>
                    Requested: {formatDate(transfer.requested_at)} • {transfer.days_pending} days ago
                  </p>
                </div>
              </div>

              {/* Transfer Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openActionModal(transfer.asset, 'approve_transfer', transfer)}
                  disabled={actionLoading[transfer.id]}
                  className={`${btnSuccess} flex-1 px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-center disabled:opacity-50 hover:shadow-sm`}
                >
                  {actionLoading[transfer.id] ? (
                    <Loader size={12} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Accept Transfer
                    </>
                  )}
                </button>
                <button
                  onClick={() => openActionModal(transfer.asset, 'reject_transfer', transfer)}
                  disabled={actionLoading[transfer.id]}
                  className={`${btnDanger} flex-1 px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-center disabled:opacity-50 hover:shadow-sm`}
                >
                  {actionLoading[transfer.id] ? (
                    <Loader size={12} className="animate-spin" />
                  ) : (
                    <>
                      <XCircle size={12} className="mr-1" />
                      Reject Transfer
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Assigned Assets */}
      <div className="flex items-center gap-2">
        <Package size={16} className="text-almet-sapphire" />
        <h3 className={`${textPrimary} font-bold text-sm`}>
          Assigned Assets ({assets.length})
        </h3>
      </div>

      {assets.length === 0 ? (
        <div className={`${bgAccent} rounded-lg p-6 text-center border ${borderColor}`}>
          <div className="w-16 h-16 mx-auto mb-3 bg-almet-sapphire/10 rounded-xl flex items-center justify-center">
            <Package className="w-8 h-8 text-almet-sapphire" />
          </div>
          <p className={`${textPrimary} text-sm font-semibold mb-1`}>No assets assigned</p>
          <p className={`${textMuted} text-xs`}>This employee has no assets assigned to them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className={`${bgCard} rounded-lg border ${borderColor} p-4 ${shadowClass} hover:shadow-md transition-all duration-200 group`}>
              
              {/* Asset Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-almet-sapphire/10 rounded-lg group-hover:bg-almet-sapphire/20 transition-colors">
                    <Package size={16} className="text-almet-sapphire" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`${textPrimary} font-semibold text-sm mb-1 line-clamp-1`}>
                      {asset.asset_name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`${textMuted} flex items-center gap-1`}>
                        <Hash size={10} />
                        {asset.serial_number}
                      </span>
                      <span className={`${textMuted} flex items-center gap-1`}>
                        <Tag size={10} />
                        {asset.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(asset.status)}`}>
                  {getStatusIcon(asset.status)}
                  <span className="ml-1">{asset.status_display}</span>
                </span>
              </div>

              {/* Asset Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className={`${bgAccent} rounded-md p-2`}>
                  <p className={`${textMuted} text-[9px] uppercase tracking-wide font-semibold mb-1`}>Purchase Date</p>
                  <div className="flex items-center">
                    <Calendar size={10} className={`${textMuted} mr-1`} />
                    <span className={`${textSecondary} text-[10px] font-medium`}>{formatDate(asset.purchase_date)}</span>
                  </div>
                </div>
                
                <div className={`${bgAccent} rounded-md p-2`}>
                  <p className={`${textMuted} text-[9px] uppercase tracking-wide font-semibold mb-1`}>Assignment Date</p>
                  <div className="flex items-center">
                    <Calendar size={10} className={`${textMuted} mr-1`} />
                    <span className={`${textSecondary} text-[10px] font-medium`}>{formatDate(asset.assignment_date)}</span>
                  </div>
                </div>
                
                <div className={`${bgAccent} rounded-md p-2`}>
                  <p className={`${textMuted} text-[9px] uppercase tracking-wide font-semibold mb-1`}>Days Assigned</p>
                  <div className="flex items-center">
                    <Clock size={10} className={`${textMuted} mr-1`} />
                    <span className={`${textSecondary} text-[10px] font-medium`}>{asset.days_assigned} days</span>
                  </div>
                </div>
                
                <div className={`${bgAccent} rounded-md p-2`}>
                  <p className={`${textMuted} text-[9px] uppercase tracking-wide font-semibold mb-1`}>Category</p>
                  <div className="flex items-center">
                    <Building size={10} className={`${textMuted} mr-1`} />
                    <span className={`${textSecondary} text-[10px] font-medium truncate`}>{asset.category}</span>
                  </div>
                </div>
              </div>

              {/* Clarification Info */}
              {asset.clarification_info && asset.clarification_info.has_clarification && (
                <div className={`${bgAccent} rounded-md p-3 mb-3 border ${borderColor}`}>
                  <div className="flex items-start gap-2">
                    <Info size={12} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className={`${textPrimary} font-semibold text-xs mb-1`}>
                        {asset.clarification_info.status === 'pending' ? 'Clarification Pending' : 'Clarification Resolved'}
                      </p>
                      <p className={`${textSecondary} text-[10px] mb-1`}>
                        <span className="font-medium">Reason:</span> {asset.clarification_info.requested_reason}
                      </p>
                      {asset.clarification_info.has_response && asset.clarification_info.response && (
                        <p className={`${textSecondary} text-[10px] mb-1`}>
                          <span className="font-medium">Response:</span> {asset.clarification_info.response}
                        </p>
                      )}
                      <p className={`${textMuted} text-[9px]`}>
                        Requested: {formatDate(asset.clarification_info.requested_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {asset.status === 'ASSIGNED' && asset.can_accept && (
                  <button
                    onClick={() => openActionModal(asset, 'accept')}
                    disabled={actionLoading[asset.id]}
                    className={`${btnSuccess} px-3 py-1.5 rounded-md text-[10px] font-semibold flex items-center disabled:opacity-50 hover:shadow-sm`}
                  >
                    {actionLoading[asset.id] ? (
                      <Loader size={10} className="mr-1 animate-spin" />
                    ) : (
                      <CheckSquare size={10} className="mr-1" />
                    )}
                    Accept
                  </button>
                )}

                {asset.can_request_clarification && (
                  <button
                    onClick={() => openActionModal(asset, 'clarification')}
                    disabled={actionLoading[asset.id]}
                    className={`${btnWarning} px-3 py-1.5 rounded-md text-[10px] font-semibold flex items-center disabled:opacity-50 hover:shadow-sm`}
                  >
                    {actionLoading[asset.id] ? (
                      <Loader size={10} className="mr-1 animate-spin" />
                    ) : (
                      <MessageSquare size={10} className="mr-1" />
                    )}
                    Clarification
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Action Modal */}
      {showActionModal && (selectedAsset || selectedTransfer) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className={`${bgCard} rounded-lg w-full max-w-md shadow-2xl border ${borderColor}`}>
            <div className="p-4">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`${textPrimary} text-sm font-bold mb-1`}>
                    {actionType === 'accept' && 'Accept Asset'}
                    {actionType === 'clarification' && 'Request Clarification'}
                    {actionType === 'approve_transfer' && 'Approve Transfer'}
                    {actionType === 'reject_transfer' && 'Reject Transfer'}
                  </h3>
                  <p className={`${textMuted} text-[10px]`}>
                    {actionType === 'accept' && 'Confirm asset acceptance'}
                    {actionType === 'clarification' && 'Request additional information'}
                    {actionType === 'approve_transfer' && 'Accept this asset transfer'}
                    {actionType === 'reject_transfer' && 'Reject this asset transfer'}
                  </p>
                </div>
                <button
                  onClick={() => setShowActionModal(false)}
                  className={`${textMuted} hover:${textPrimary} transition-colors p-1 hover:bg-gray-100 dark:hover:bg-almet-comet/30 rounded`}
                >
                  <XCircle size={16} />
                </button>
              </div>

              {/* Asset Info */}
              <div className={`${bgAccent} rounded-md p-3 mb-4 border ${borderColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package size={14} className="text-almet-sapphire" />
                  <p className={`${textPrimary} font-semibold text-xs`}>
                    {selectedAsset?.asset_name || selectedTransfer?.asset?.asset_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <span className={`${textMuted}`}>
                    Serial: {selectedAsset?.serial_number || selectedTransfer?.asset?.serial_number}
                  </span>
                  <span className={`${textMuted}`}>
                    Category: {selectedAsset?.category || selectedTransfer?.asset?.category || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-3">
                {actionType === 'accept' && (
                  <div>
                    <label className={`block text-[10px] font-semibold ${textPrimary} mb-1`}>
                      Comments (Optional)
                    </label>
                    <textarea
                      value={actionData.comments}
                      onChange={(e) => setActionData(prev => ({ ...prev, comments: e.target.value }))}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-[10px] transition-all duration-200 resize-none`}
                      rows="3"
                      placeholder="Add any comments about accepting this asset..."
                    />
                  </div>
                )}

                {(actionType === 'approve_transfer' || actionType === 'reject_transfer') && (
                  <div>
                    <label className={`block text-[10px] font-semibold ${textPrimary} mb-1`}>
                      Comments (Optional)
                    </label>
                    <textarea
                      value={actionData.transfer_approval_comments}
                      onChange={(e) => setActionData(prev => ({ ...prev, transfer_approval_comments: e.target.value }))}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-[10px] transition-all duration-200 resize-none`}
                      rows="3"
                      placeholder={actionType === 'approve_transfer' ? 'Add any comments about accepting this transfer...' : 'Please provide a reason for rejection...'}
                    />
                  </div>
                )}

                {actionType === 'clarification' && (
                  <div>
                    <label className={`block text-[10px] font-semibold ${textPrimary} mb-1`}>
                      Clarification Request <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={actionData.clarification_reason}
                      onChange={(e) => setActionData(prev => ({ ...prev, clarification_reason: e.target.value }))}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-[10px] transition-all duration-200 resize-none`}
                      rows="3"
                      placeholder="Please explain what needs clarification..."
                      required
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowActionModal(false)}
                  className={`${btnSecondary} px-3 py-2 rounded-md text-[10px] font-semibold hover:shadow-sm transition-all duration-200`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === 'accept') handleAcceptAsset(selectedAsset);
                    else if (actionType === 'clarification') handleRequestClarification(selectedAsset);
                    else if (actionType === 'approve_transfer') handleTransferAction(selectedTransfer, true);
                    else if (actionType === 'reject_transfer') handleTransferAction(selectedTransfer, false);
                  }}
                  disabled={
                    (selectedAsset && actionLoading[selectedAsset.id]) ||
                    (selectedTransfer && actionLoading[selectedTransfer.id]) ||
                    (actionType === 'clarification' && !actionData.clarification_reason.trim())
                  }
                  className={`${
                    actionType === 'accept' || actionType === 'approve_transfer' ? btnSuccess :
                    actionType === 'clarification' ? btnWarning :
                    btnDanger
                  } px-3 py-2 rounded-md text-[10px] font-semibold disabled:opacity-50 hover:shadow-sm transition-all duration-200`}
                >
                  {((selectedAsset && actionLoading[selectedAsset.id]) || (selectedTransfer && actionLoading[selectedTransfer.id])) ? (
                    <span className="flex items-center">
                      <Loader size={10} className="mr-1 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      {actionType === 'accept' && 'Accept Asset'}
                      {actionType === 'clarification' && 'Send Request'}
                      {actionType === 'approve_transfer' && 'Approve Transfer'}
                      {actionType === 'reject_transfer' && 'Reject Transfer'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          </div>
      )}
    </div>
  );
};
export default EmployeeAssetManagement;