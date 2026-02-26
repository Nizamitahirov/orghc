// components/training-requests/CreateRequestModal.jsx
import React from 'react';
import { X, Save, Users } from 'lucide-react';
import MultiSelect from '@/components/common/MultiSelect';

const CreateRequestModal = ({
  show,
  formData,
  setFormData,
  employees,
  errors,
  setErrors,
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
  borderColor,
  isManager
}) => {
  if (!show) return null;

  const employeeOptions = employees.map(emp => ({
    id: emp.id,
    name: `${emp.name} (${emp.employee_id})`,
    label: `${emp.name} (${emp.employee_id})`,
    value: emp.id
  }));

  const handleParticipantChange = (fieldName, value) => {
    setFormData(prev => {
      const currentIds = prev.participants_data || [];
      const newIds = currentIds.includes(value)
        ? currentIds.filter(id => id !== value)
        : [...currentIds, value];
      return { ...prev, participants_data: newIds };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.training_title?.trim()) {
      newErrors.training_title = 'Training title is required';
    }
    if (!formData.purpose_justification?.trim()) {
      newErrors.purpose_justification = 'Purpose/justification is required';
    }
    if (!formData.duration?.trim()) {
      newErrors.duration = 'Duration is required';
    }
    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.estimated_cost) {
      newErrors.estimated_cost = 'Estimated cost is required';
    }
    if (!formData.learning_objectives?.trim()) {
      newErrors.learning_objectives = 'Learning objectives are required';
    }
    if (!formData.expected_benefits?.trim()) {
      newErrors.expected_benefits = 'Expected benefits are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.showError('Please fill in all required fields');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const submitData = {
        training_title: formData.training_title,
        purpose_justification: formData.purpose_justification,
        training_provider: formData.training_provider || '',
        preferred_dates_start: formData.preferred_dates_start || null,
        preferred_dates_end: formData.preferred_dates_end || null,
        duration: formData.duration,
        location: formData.location,
        estimated_cost: parseFloat(formData.estimated_cost),
        learning_objectives: formData.learning_objectives,
        expected_benefits: formData.expected_benefits,
        participants_data: formData.participants_data || []
      };
      
      await trainingService.requests.create(submitData);
      toast.showSuccess('Training request submitted successfully!');
      onClose();
      setFormData({
        training_title: '',
        purpose_justification: '',
        training_provider: '',
        preferred_dates_start: '',
        preferred_dates_end: '',
        duration: '',
        location: '',
        estimated_cost: '',
        learning_objectives: '',
        expected_benefits: '',
        participants_data: []
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.showError('Error creating request: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-3xl w-full my-6 max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${borderColor} sticky top-0 ${bgCard} z-10`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            New Training Request
          </h3>
          <button
            onClick={onClose}
            className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:${bgCardHover} rounded-lg`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Training Program Details */}
          <div className="space-y-3.5">
            <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 pb-2 border-b ${borderColor}`}>
              Training Program Details
            </h4>

            <div>
              <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                Training Title *
              </label>
              <input
                type="text"
                value={formData.training_title}
                onChange={(e) => setFormData({...formData, training_title: e.target.value})}
                className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                  errors.training_title ? 'border-red-500' : borderColor
                }`}
                placeholder="e.g., Advanced Project Management"
              />
              {errors.training_title && <p className="mt-1 text-xs text-red-600">{errors.training_title}</p>}
            </div>

            <div>
              <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                Purpose/Justification *
              </label>
              <textarea
                value={formData.purpose_justification}
                onChange={(e) => setFormData({...formData, purpose_justification: e.target.value})}
                rows={3}
                className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                  errors.purpose_justification ? 'border-red-500' : borderColor
                }`}
                placeholder="Explain why this training is needed"
              />
              {errors.purpose_justification && <p className="mt-1 text-xs text-red-600">{errors.purpose_justification}</p>}
            </div>

            <div>
              <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                Training Provider
              </label>
              <input
                type="text"
                value={formData.training_provider}
                onChange={(e) => setFormData({...formData, training_provider: e.target.value})}
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-xs`}
                placeholder="e.g., Coursera, LinkedIn Learning"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                  Preferred Start Date
                </label>
                <input
                  type="date"
                  value={formData.preferred_dates_start}
                  onChange={(e) => setFormData({...formData, preferred_dates_start: e.target.value})}
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-xs`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                  Preferred End Date
                </label>
                <input
                  type="date"
                  value={formData.preferred_dates_end}
                  onChange={(e) => setFormData({...formData, preferred_dates_end: e.target.value})}
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-xs`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                    errors.duration ? 'border-red-500' : borderColor
                  }`}
                  placeholder="e.g., 3 days, 2 weeks"
                />
                {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
              </div>

              <div>
                <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                  Estimated Cost * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                  className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                    errors.estimated_cost ? 'border-red-500' : borderColor
                  }`}
                  placeholder="1000.00"
                />
                {errors.estimated_cost && <p className="mt-1 text-xs text-red-600">{errors.estimated_cost}</p>}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                  errors.location ? 'border-red-500' : borderColor
                }`}
                placeholder="e.g., Online, Baku, Istanbul"
              />
              {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
            </div>
          </div>

          {/* Learning Objectives */}
          <div className={`border-t ${borderColor} pt-4`}>
            <h4 className={`text-sm font-bold ${textPrimary} mb-3`}>
              Learning Objectives & Benefits
            </h4>

            <div className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                  Learning Objectives *
                </label>
                <textarea
                  value={formData.learning_objectives}
                  onChange={(e) => setFormData({...formData, learning_objectives: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                    errors.learning_objectives ? 'border-red-500' : borderColor
                  }`}
                  placeholder="What will participants learn from this training?"
                />
                {errors.learning_objectives && <p className="mt-1 text-xs text-red-600">{errors.learning_objectives}</p>}
              </div>

              <div>
                <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                  Expected Benefits *
                </label>
                <textarea
                  value={formData.expected_benefits}
                  onChange={(e) => setFormData({...formData, expected_benefits: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                    errors.expected_benefits ? 'border-red-500' : borderColor
                  }`}
                  placeholder="How will this training benefit the organization?"
                />
                {errors.expected_benefits && <p className="mt-1 text-xs text-red-600">{errors.expected_benefits}</p>}
              </div>
            </div>
          </div>

          {/* Participants - Only for Managers */}
          {isManager && (
            <div className={`border-t ${borderColor} pt-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-almet-sapphire" />
                <h4 className={`text-sm font-bold ${textPrimary}`}>
                  Participants (Optional)
                </h4>
              </div>
              <p className={`text-xs ${textMuted} mb-3`}>
                As a manager, you can add team members as participants for this training
              </p>
              <MultiSelect
                options={employeeOptions}
                selected={formData.participants_data}
                onChange={handleParticipantChange}
                placeholder="Select participants..."
                fieldName="participants"
                darkMode={darkMode}
              />
            </div>
          )}

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
              disabled={submitLoading}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestModal;