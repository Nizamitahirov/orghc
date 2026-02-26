// src/components/headcount/ActionMenu.jsx - Enhanced with ConfirmationModal and Toast
import { useState, useEffect } from "react";
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";
import { useToast } from "../common/Toast";
import { archiveEmployeesService } from "../../services/vacantPositionsService";
import { 
  Download, 
  Trash2, 
  Edit3, 
  Tag, 
  X,
  ChevronRight,
  Check,
  AlertCircle,
  Loader,
  Users,
  Archive,
} from "lucide-react";

// Import components
import ConfirmationModal from "../common/ConfirmationModal";
import TagManagementModal from "./TagManagementModal";
import BulkEditModal from "./BulkEditModal";

const ActionMenu = ({ 
  isOpen, 
  onClose, 
  onAction, 
  selectedCount = 0,
  selectedEmployees = [],
  selectedEmployeeData = [],
  darkMode = false 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null,
    action: null,
    data: null
  });

  // Get hooks
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const {
 
    fetchEmployeeTags,
    hasEmployeeTags
  } = useReferenceData();

  const {

    exportEmployees,
    refreshAll
  } = useEmployees();

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!hasEmployeeTags() && fetchEmployeeTags) {
        fetchEmployeeTags();
      }
    }
  }, [isOpen, hasEmployeeTags, fetchEmployeeTags]);

  if (!isOpen) return null;

  // ========================================
  // CONFIRMATION MODAL HELPERS
  // ========================================

  const openConfirmation = (config) => {
    setConfirmationModal({
      isOpen: true,
      ...config
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  const executeConfirmedAction = async () => {
    const { action, data } = confirmationModal;
    closeConfirmation();
    
    if (action && typeof action === 'function') {
      await action(data);
    }
  };

  // ========================================
  // ENHANCED DELETE ACTION HANDLERS
  // ========================================

  const handleSoftDelete = async () => {
    if (selectedCount === 0) {
      showWarning('Please select employees to soft delete');
      return;
    }

    openConfirmation({
      type: 'danger',
      title: 'Soft Delete Employees',
      message: `Are you sure you want to soft delete ${selectedCount} employee${selectedCount !== 1 ? 's' : ''}?`,
      confirmText: 'Soft Delete',
      action: async () => {
        try {
          setIsProcessing(true);

          const result = await archiveEmployeesService.bulkSoftDeleteEmployees(selectedEmployees);

          await refreshAll();
          onClose();
          
          showSuccess(result.message || `Successfully soft deleted ${selectedCount} employee${selectedCount !== 1 ? 's' : ''}!`);
          
          if (result.data?.vacant_positions_created > 0) {
            setTimeout(() => {
              showInfo(`Created ${result.data.vacant_positions_created} vacant position${result.data.vacant_positions_created !== 1 ? 's' : ''} automatically.`);
            }, 1000);
          }
          
        } catch (error) {
          console.error('SOFT DELETE: Operation failed:', error);
          showError(`Soft delete failed: ${error.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleHardDelete = async () => {
    if (selectedCount === 0) {
      showWarning('Please select employees to permanently delete');
      return;
    }

    // First confirmation
    openConfirmation({
      type: 'danger',
      title: 'Permanent Deletion Warning',
      message: `⚠️ WARNING: This will permanently delete ${selectedCount} employee${selectedCount !== 1 ? 's' : ''} `,
      confirmText: 'Continue',
      action: async () => {
        // Second confirmation with text input
      

        try {
          setIsProcessing(true);

          
       const notes = 'End of contract period - bulk cleanup'
          
          const result = await archiveEmployeesService.bulkHardDeleteEmployees(
            selectedEmployees, 
      notes,
            true
          );
          
       
          
          await refreshAll();
          onClose();
          
          showSuccess(result.message || `Successfully deleted ${selectedCount} employee${selectedCount !== 1 ? 's' : ''} permanently!`);
          
          if (result.data?.archives_created > 0) {
            setTimeout(() => {
              showInfo(`Created ${result.data.archives_created} archive record${result.data.archives_created !== 1 ? 's' : ''} for audit purposes.`);
            }, 1000);
          }
          
        } catch (error) {
          console.error('HARD DELETE: Operation failed:', error);
          showError(`Hard delete failed: ${error.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  

  // ========================================
  // DIRECT ACTION HANDLERS
  // ========================================

  const handleDirectAction = async (action, options = {}) => {
  
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      switch (action) {
        case 'export':
        
          await onAction('export', {
            type: 'selected',
            format: 'excel',
            employee_ids: selectedEmployees
          });
   
          break;

        case 'softDelete':
          await handleSoftDelete();
          return; // Don't close menu here
          
        case 'hardDelete':
          await handleHardDelete();
          return; // Don't close menu here

 

        default:
          await onAction(action, {
            ...options,
            employee_ids: selectedEmployees,
            selectedCount
          });
         
      }
      
      onClose();
      
    } catch (error) {
      console.error('Action failed:', error);
      showError(`Action failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ========================================
  // MODAL ACTION HANDLERS
  // ========================================

  const handleModalAction = async (action, options) => {
    try {
     
      
      await onAction(action, options);
      
      setIsTagModalOpen(false);
      setIsBulkEditModalOpen(false);
      onClose();
      
      showSuccess('Operation completed successfully!');
      
    } catch (error) {
      console.error('Modal action failed:', error);
      showError(`Operation failed: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  // ========================================
  // MODAL TRIGGER HANDLERS
  // ========================================

  const openTagModal = () => {
    if (selectedCount === 0) {
      showWarning('Please select at least one employee first');
      return;
    }
    setIsTagModalOpen(true);
  };

  const openBulkEditModal = () => {
    if (selectedCount === 0) {
      showWarning('Please select at least one employee first');
      return;
    }
    setIsBulkEditModalOpen(true);
  };

  return (
    <>
      <div className="relative">
        <div 
          className="fixed inset-0 z-40" 
          onClick={onClose}
        />
        
        <div className={`absolute right-0 top-0 z-50 ${bgCard} rounded-lg shadow-xl border ${borderColor} w-72 overflow-hidden`}>
          {/* Header */}
          <div className={`px-4 py-2 border-b ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xs font-medium ${textPrimary} flex items-center`}>
                  {isProcessing && (
                    <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                  )}
                  <Users className="w-3 h-3 mr-2" />
                  Bulk Operations
                </h3>
                <p className={`text-[0.6rem] ${textMuted}`}>
                  {selectedCount} employee{selectedCount !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className={`p-1 rounded ${bgHover} transition-colors disabled:opacity-50`}
              >
                <X size={14} className={textSecondary} />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5 max-h-96 overflow-y-auto">
            {/* Export Section */}
            <div className="px-3 mb-2">
             
              
              <button
                onClick={() => handleDirectAction('export')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2 text-xs rounded-lg transition-colors ${bgHover} ${textPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Download size={14} className="mr-3 text-blue-500 flex-shrink-0" />
                <span className="flex-1 text-left">Export Selected ({selectedCount})</span>
              </button>
            </div>

            <div className={`h-px bg-gray-200 dark:bg-gray-700 mx-3 my-2`} />

            {/* Bulk Edit Section */}
            <div className="px-3 mb-2">
           
              
              <button
                onClick={openTagModal}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2 text-xs rounded-lg transition-colors ${bgHover} ${textPrimary} disabled:opacity-50`}
              >
                <Tag size={14} className="mr-3 text-purple-500 flex-shrink-0" />
                <span className="flex-1 text-left">Manage Tags</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>

              <button
                onClick={openBulkEditModal}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2 text-xs rounded-lg transition-colors ${bgHover} ${textPrimary} disabled:opacity-50 mt-1`}
              >
                <Edit3 size={14} className="mr-3 text-orange-500 flex-shrink-0" />
                <span className="flex-1 text-left">Assign Line Manager</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>

           
            </div>

            <div className={`h-px bg-gray-200 dark:bg-gray-700 mx-3 my-2`} />

            {/* Delete Operations Section */}
            <div className="px-3">
         
              
              <button
                onClick={() => handleDirectAction('softDelete')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2 text-xs rounded-lg transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 disabled:opacity-50`}
              >
                <Archive size={14} className="mr-3 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <span className="block">Soft Delete ({selectedCount})</span>
                  <span className="text-[0.6rem] opacity-70">Creates vacant positions</span>
                </div>
              </button>

              <button
                onClick={() => handleDirectAction('hardDelete')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2 text-xs rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 disabled:opacity-50 mt-1`}
              >
                <Trash2 size={14} className="mr-3 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <span className="block">Permanent Delete ({selectedCount})</span>
                  <span className="text-[0.6rem] opacity-70">Cannot be undone</span>
                </div>
              </button>
            </div>
          </div>

          {/* Status Section */}
          {selectedCount > 0 && (
            <div className={`px-4 py-2 border-t ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
              <div className={`text-[0.6rem] ${textMuted} text-center flex items-center justify-center`}>
                {isProcessing ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                    Processing operation...
                  </>
                ) : (
                  <>
                    <Check size={12} className="mr-2 text-green-500" />
                    <span>
                      Operations will apply to{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {selectedCount} employee{selectedCount !== 1 ? 's' : ''}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Warning for no selection */}
          {selectedCount === 0 && (
            <div className={`px-4 py-3 border-t ${borderColor} bg-yellow-50 dark:bg-yellow-900/20`}>
              <div className="flex items-center justify-center text-xs text-yellow-700 dark:text-yellow-300">
                <AlertCircle size={12} className="mr-2" />
                Select employees first
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={executeConfirmedAction}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        loading={isProcessing}
        darkMode={darkMode}
      />

      {/* Tag Management Modal */}
      <TagManagementModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onAction={handleModalAction}
        selectedEmployees={selectedEmployees}
        selectedEmployeeData={selectedEmployeeData}
        darkMode={darkMode}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onAction={handleModalAction}
        selectedEmployees={selectedEmployees}
        selectedEmployeeData={selectedEmployeeData}
        darkMode={darkMode}
      />
    </>
  );
};

export default ActionMenu;