// components/common/ConfirmationModal.jsx
import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default", // 'default', 'danger', 'success', 'info'
  loading = false,
  darkMode = false
}) => {
  if (!isOpen) return null;

  const bgModal = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  // Type-specific styling
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white'
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          confirmText: 'text-white'
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-500',
          confirmBg: 'bg-almet-sapphire hover:bg-almet-astral',
          confirmText: 'text-white'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-orange-500',
          confirmBg: 'bg-almet-sapphire hover:bg-almet-astral',
          confirmText: 'text-white'
        };
    }
  };

  const { icon: IconComponent, iconColor, confirmBg, confirmText: confirmTextColor } = getTypeConfig();

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgModal} rounded-xl w-full max-w-md border ${borderColor} shadow-xl`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-almet-comet/50' : 'bg-gray-100'}`}>
                <IconComponent size={20} className={iconColor} />
              </div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                {title}
              </h2>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg disabled:opacity-50`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className={`${textSecondary} text-wrap leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t border-gray-200 dark:border-almet-comet ${darkMode ? 'bg-almet-comet/20' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={loading}
              className={`px-4 py-2 border ${borderColor} rounded-lg ${textSecondary} hover:${textPrimary} 
                transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {cancelText}
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-6 py-2 ${confirmBg} ${confirmTextColor} rounded-lg 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                flex items-center gap-2 min-w-[80px] justify-center`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;