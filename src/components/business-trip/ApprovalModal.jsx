// ============================================
// File: components/business-trip/ApprovalModal.jsx
// ============================================
import { CheckCircle, X } from 'lucide-react';

export const ApprovalModal = ({
  show,
  onClose,
  selectedRequest,
  approvalAmount,
  setApprovalAmount,
  approvalNote,
  setApprovalNote,
  onApprove,
  loading
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden">
        <div className="bg-gradient-to-r from-green-500/10 to-transparent dark:from-green-500/20 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Approve Request
          </h2>
          <button
            onClick={onClose}
            className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {selectedRequest?.status === 'PENDING_FINANCE' && (
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                Trip Amount (AZN) *
              </label>
              <input
                type="number"
                step="0.01"
                value={approvalAmount}
                onChange={(e) => setApprovalAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
              Note (Optional)
            </label>
            <textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Add any notes"
              rows={3}
              className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none"
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
            onClick={onApprove}
            disabled={loading}
            className="px-6 py-2.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm Approval
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
