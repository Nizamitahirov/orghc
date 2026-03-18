// components/vacation/EditScheduleModal.jsx

import { Edit, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
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
  useEffect(() => {
    if (show && editingSchedule && vacationTypes.length > 0) {
      const paid = vacationTypes.find(t =>
        t.name.toLowerCase().includes('paid') ||
        t.name.toLowerCase().includes('annual') ||
        t.name.toLowerCase().includes('ödənişli')
      );
      if (paid) setEditingSchedule(prev => ({ ...prev, vacation_type_id: paid.id }));
    }
  }, [show, editingSchedule?.id, vacationTypes]);

  if (!show || !editingSchedule) return null;

  const editsLeft     = maxScheduleEdits - editingSchedule.edit_count;
  const isLastEdit    = editsLeft === 1;
  const noEditsLeft   = editsLeft <= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center">
              <Edit className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-almet-cloud-burst dark:text-white">Edit Schedule</h2>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
                Change your planned vacation dates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">

          {/* Edit count indicator */}
          <div className={`rounded-xl p-4 border flex items-start gap-3 ${
            noEditsLeft
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : isLastEdit
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            {noEditsLeft
              ? <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              : isLastEdit
              ? <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              : <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-xs font-semibold ${
                noEditsLeft ? 'text-red-900 dark:text-red-200'
                : isLastEdit ? 'text-amber-900 dark:text-amber-200'
                : 'text-blue-900 dark:text-blue-200'
              }`}>
                {noEditsLeft
                  ? 'No edits remaining'
                  : isLastEdit
                  ? 'Last edit remaining!'
                  : `${editsLeft} edit${editsLeft > 1 ? 's' : ''} remaining`}
              </p>
              <p className={`text-xs mt-0.5 ${
                noEditsLeft ? 'text-red-700 dark:text-red-300'
                : isLastEdit ? 'text-amber-700 dark:text-amber-300'
                : 'text-blue-700 dark:text-blue-300'
              }`}>
                You have used {editingSchedule.edit_count} of {maxScheduleEdits} allowed edits for this schedule.
              </p>
              {/* Dot progress */}
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: maxScheduleEdits }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                    i < editingSchedule.edit_count
                      ? 'bg-almet-sapphire'
                      : 'bg-almet-mystic dark:bg-gray-600'
                  }`} />
                ))}
              </div>
            </div>
          </div>

          {/* Leave type (read-only) */}
          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              Leave Type
            </label>
            <div className="px-3 py-2.5 text-sm bg-almet-mystic/30 dark:bg-gray-700 border border-almet-bali-hai/30 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white">
              {vacationTypes.find(t => t.id === editingSchedule.vacation_type_id)?.name || 'Paid Vacation'}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={editingSchedule.start_date}
              onChange={e => setEditingSchedule(prev => ({ ...prev, start_date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 text-sm border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={editingSchedule.end_date}
              onChange={e => setEditingSchedule(prev => ({ ...prev, end_date: e.target.value }))}
              min={editingSchedule.start_date}
              className="w-full px-3 py-2.5 text-sm border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
              Reason for Change <span className="text-almet-waterloo dark:text-almet-bali-hai font-normal">(optional)</span>
            </label>
            <textarea
              value={editingSchedule.comment}
              onChange={e => setEditingSchedule(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
              placeholder="Explain why you are changing these dates..."
              className="w-full px-3 py-2.5 text-sm border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-xl text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={loading || noEditsLeft}
            className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-xl hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <CheckCircle className="w-4 h-4" />
            }
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}