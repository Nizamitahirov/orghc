
// ============================================
// File: components/business-trip/RejectionModal.jsx
// ============================================
import { XCircle, X } from 'lucide-react';

export const RejectionModal = ({
  show,
  onClose,
  rejectionReason,
  setRejectionReason,
  onReject,
  loading
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden">
        <div className="bg-gradient-to-r from-red-500/10 to-transparent dark:from-red-500/20 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            Reject Request
          </h2>
          <button
            onClick={onClose}
            className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection"
              rows={4}
              className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>

        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-6 py-4 flex justify-end gap-3 bg-almet-mystic/10 dark:bg-gray-900/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium border border-almet-mystic dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            className="px-6 py-2.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Confirm Rejection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};