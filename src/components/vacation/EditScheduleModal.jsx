import { Edit, X, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
export default function EditScheduleModal({
  show,
  onClose,
  editingSchedule,
  setEditingSchedule,
  vacationTypes,
  maxScheduleEdits,
  darkMode,
  handleSaveEdit,
  loading
}) {
  
  // ✅ Auto-select Paid Vacation on mount
  useEffect(() => {
    if (show && editingSchedule && vacationTypes.length > 0) {
      // Find Paid Vacation
      const paidVacation = vacationTypes.find(t => 
        t.name.toLowerCase().includes('paid') || 
        t.name.toLowerCase().includes('annual')
      );
      
      if (paidVacation && !editingSchedule.vacation_type_id) {
        setEditingSchedule(prev => ({
          ...prev,
          vacation_type_id: paidVacation.id
        }));
      }
    }
  }, [show, editingSchedule, vacationTypes]);
  
  if (!show || !editingSchedule) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-almet-mystic/50 dark:border-almet-comet">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
            <Edit className="w-4 h-4 text-almet-sapphire" />
            Edit Schedule (Edit {editingSchedule.edit_count + 1}/{maxScheduleEdits})
          </h2>
          <button
            onClick={onClose}
            className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* ✅ HIDDEN: Auto Paid Vacation */}
          <input type="hidden" value={editingSchedule.vacation_type_id} />
          
          {/* ✅ Display current type (read-only) */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Leave Type:</strong> {vacationTypes.find(t => t.id === editingSchedule.vacation_type_id)?.name || 'Paid Vacation'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={editingSchedule.start_date}
              onChange={(e) => setEditingSchedule(prev => ({...prev, start_date: e.target.value}))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={editingSchedule.end_date}
              onChange={(e) => setEditingSchedule(prev => ({...prev, end_date: e.target.value}))}
              min={editingSchedule.start_date}
              className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              Comment (Optional)
            </label>
            <textarea
              value={editingSchedule.comment}
              onChange={(e) => setEditingSchedule(prev => ({...prev, comment: e.target.value}))}
              rows={3}
              placeholder="Add any notes..."
              className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-almet-mystic/30 dark:bg-gray-900/30 border-t border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-white dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={loading}
            className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}