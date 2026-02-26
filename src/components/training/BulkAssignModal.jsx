import React from 'react';
import { X, Users } from 'lucide-react';
import MultiSelect from '@/components/common/MultiSelect';

const BulkAssignModal = ({
  show,
  assignFormData,
  setAssignFormData,
  employees,
  errors,
  submitLoading,
  setSubmitLoading,
  onClose,
  onSuccess,
  trainingService,
  toast,
  darkMode,
  bgCard,
  bgCardHover,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  if (!show) return null;

  const employeeOptions = employees.map(emp => ({
    id: emp.id,
    name: `${emp.name} (${emp.employee_id})`,
    label: `${emp.name} (${emp.employee_id})`,
    value: emp.id
  }));

  const handleEmployeeChange = (fieldName, value) => {
    setAssignFormData(prev => {
      const currentIds = prev.employee_ids || [];
      const newIds = currentIds.includes(value)
        ? currentIds.filter(id => id !== value)
        : [...currentIds, value];
      return { ...prev, employee_ids: newIds };
    });
  };

  const handleSubmit = async () => {
    if (assignFormData.training_ids.length === 0) {
      toast.showError('Select at least one training');
      return;
    }
    
    if (assignFormData.employee_ids.length === 0) {
      toast.showError('Select at least one employee');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const submitData = {
        training_ids: assignFormData.training_ids.map(id => parseInt(id)),
        employee_ids: assignFormData.employee_ids.map(id => parseInt(id)),
        due_date: assignFormData.due_date || null,
        is_mandatory: assignFormData.is_mandatory,
        notes: assignFormData.notes || ''
      };
      
      const result = await trainingService.trainings.bulkAssign(submitData);
      toast.showSuccess(`Successfully assigned! Created: ${result.summary.created}, Skipped: ${result.summary.skipped}`);
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error assigning training:', error);
      toast.showError('Error assigning training: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-2xl w-full my-6 border ${borderColor}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            Assign Trainings
          </h3>
          <button
            onClick={onClose}
            className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:${bgCardHover} rounded-lg`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selected Trainings Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
              <strong>Selected Trainings:</strong> {assignFormData.training_ids.length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
              These trainings will be assigned to all selected employees
            </p>
          </div>

          {/* Employee Selection */}
          <div>
            <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
              Select Employees *
            </label>
            <MultiSelect
              options={employeeOptions}
              selected={assignFormData.employee_ids}
              onChange={handleEmployeeChange}
              placeholder="Select employees..."
              fieldName="employee_ids"
              darkMode={darkMode}
            />
            {errors.employee_ids && <p className="mt-1 text-xs text-red-600">{errors.employee_ids}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
              Due Date
            </label>
            <input
              type="date"
              value={assignFormData.due_date}
              onChange={(e) => setAssignFormData({...assignFormData, due_date: e.target.value})}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-xs`}
            />
            <p className={`text-xs ${textMuted} mt-1`}>Optional: Set a deadline for completion</p>
          </div>


          {/* Mandatory Checkbox */}
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={assignFormData.is_mandatory}
                onChange={(e) => setAssignFormData({...assignFormData, is_mandatory: e.target.checked})}
                className="w-4 h-4 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
              />
              <span className={`text-xs font-medium ${textSecondary}`}>Mark as Mandatory Training</span>
            </label>
       
          </div>



          {/* Action Buttons */}
          <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${borderColor}`}>
            <button
              onClick={onClose}
              className={`px-5 py-2 ${textSecondary} hover:${bgCardHover} rounded-lg transition-colors text-xs font-medium`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitLoading || assignFormData.employee_ids.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Users size={16} />
                  Assign Trainings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignModal;