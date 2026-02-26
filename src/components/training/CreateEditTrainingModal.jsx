import React, { useEffect } from 'react';
import { X, Plus, FileText, Trash2, Save, Download, Eye } from 'lucide-react';

const CreateEditTrainingModal = ({
  show,
  isEdit,
  formData,
  setFormData,
  materialForm,
  setMaterialForm,
  errors,
  setErrors,
  submitLoading,
  setSubmitLoading,
  onClose,
  onSuccess,
  selectedTraining,
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
  const [existingMaterials, setExistingMaterials] = React.useState([]);
  const [materialsToDelete, setMaterialsToDelete] = React.useState([]);
  const [loadingMaterials, setLoadingMaterials] = React.useState(false);

  // Load existing materials when editing
  useEffect(() => {
    if (isEdit && selectedTraining && show) {
      loadExistingMaterials();
    } else {
      setExistingMaterials([]);
      setMaterialsToDelete([]);
    }
  }, [isEdit, selectedTraining, show]);

  const loadExistingMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const trainingDetails = await trainingService.trainings.getById(selectedTraining.id);
      setExistingMaterials(trainingDetails.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.showError('Failed to load existing materials');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDeleteExistingMaterial = (materialId) => {
    setMaterialsToDelete(prev => [...prev, materialId]);
    setExistingMaterials(prev => prev.filter(m => m.id !== materialId));
    toast.showInfo('Material marked for deletion');
  };

  const handleAddMaterial = () => {
    if (!materialForm.file) {
      toast.showError('Please select a file');
      return;
    }
    
    setFormData({
      ...formData,
      materials: [...formData.materials, { ...materialForm, tempId: Date.now() }]
    });
    
    setMaterialForm({ file: null });
    const fileInput = document.getElementById('material-file-input');
    if (fileInput) fileInput.value = '';
    toast.showSuccess('Material added to list');
  };

  const handleRemoveMaterial = (tempId) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter(m => m.tempId !== tempId)
    });
    toast.showInfo('Material removed');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('is_active', formData.is_active);
      submitData.append('requires_completion', formData.requires_completion);
      
      if (formData.completion_deadline_days) {
        submitData.append('completion_deadline_days', parseInt(formData.completion_deadline_days));
      }

      // Add materials to delete
      if (isEdit && materialsToDelete.length > 0) {
        submitData.append('delete_material_ids', JSON.stringify(materialsToDelete));
      }
      
      const allMaterials = [...formData.materials];
      
      if (materialForm.file) {
        allMaterials.push({
          ...materialForm,
          tempId: Date.now()
        });
      }
      
      if (allMaterials.length > 0) {
        const materialsData = [];
        
        for (let i = 0; i < allMaterials.length; i++) {
          const material = allMaterials[i];
          const materialObj = {};
          
          if (material.file) {
            submitData.append(`material_${i}_file`, material.file);
            materialObj.file_index = i;
          }
          
          materialsData.push(materialObj);
        }
        
        submitData.append('materials_data', JSON.stringify(materialsData));
      }
      
      if (isEdit && selectedTraining) {
        await trainingService.trainings.update(selectedTraining.id, submitData);
        toast.showSuccess('Training updated successfully!');
      } else {
        await trainingService.trainings.create(submitData);
        toast.showSuccess('Training created successfully!');
      }
      
      onClose();
      setFormData({
        title: '',
        description: '',
        is_active: true,
        requires_completion: false,
        completion_deadline_days: '',
        materials: []
      });
      setMaterialForm({ file: null });
      setExistingMaterials([]);
      setMaterialsToDelete([]);
      onSuccess();
    } catch (error) {
      console.error('Error submitting training:', error);
      toast.showError('Error submitting training: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-3xl w-full my-6 max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${borderColor} sticky top-0 ${bgCard} z-10`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            {isEdit ? 'Edit Training' : 'Create New Training'}
          </h3>
          <button
            onClick={onClose}
            className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:${bgCardHover} rounded-lg`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Info */}
          <div className="space-y-3.5">
            <div>
              <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                  errors.title ? 'border-red-500' : borderColor
                }`}
                placeholder="Enter training title"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className={`w-full px-3 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs ${
                  errors.description ? 'border-red-500' : borderColor
                }`}
                placeholder="Enter training description"
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
                  Completion Deadline (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.completion_deadline_days}
                  onChange={(e) => setFormData({...formData, completion_deadline_days: e.target.value})}
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-xs`}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_completion}
                    onChange={(e) => setFormData({...formData, requires_completion: e.target.checked})}
                    className="w-4 h-4 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
                  />
                  <span className={`text-xs font-medium ${textSecondary}`}>Requires Completion</span>
                </label>
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className={`space-y-3.5 border-t ${borderColor} pt-5`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-base font-bold ${textPrimary}`}>Training Materials</h4>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold">
                {(existingMaterials.length + formData.materials.length)} total
              </span>
            </div>

            {/* Existing Materials (Edit Mode) */}
            {isEdit && existingMaterials.length > 0 && (
              <div className="space-y-2">
                <h5 className={`text-xs font-semibold ${textSecondary} flex items-center gap-2`}>
                  <FileText size={14} />
                  Existing Materials ({existingMaterials.length})
                </h5>
                {loadingMaterials ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-almet-sapphire border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {existingMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="p-1.5 bg-blue-500 rounded-lg flex-shrink-0">
                            <FileText size={18} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold ${textPrimary} text-xs truncate`}>
                              {material.title || material.file_url?.split('/').pop() || `Material ${material.id}`}
                            </div>
                            <div className={`text-xs ${textMuted}`}>
                              Uploaded: {new Date(material.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          {material.file_url && (
                            <>
                              <a
                                href={material.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                title="View"
                              >
                                <Eye size={14} />
                              </a>
                              <a
                                href={material.file_url}
                                download
                                className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                title="Download"
                              >
                                <Download size={14} />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteExistingMaterial(material.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* New Materials List */}
            {formData.materials.length > 0 && (
              <div className="space-y-2">
                <h5 className={`text-xs font-semibold ${textSecondary} flex items-center gap-2`}>
                  <Plus size={14} />
                  New Materials ({formData.materials.length})
                </h5>
                {formData.materials.map((material) => (
                  <div key={material.tempId} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-green-500 rounded-lg">
                        <FileText size={18} className="text-white" />
                      </div>
                      <div>
                        <div className={`font-semibold ${textPrimary} text-xs`}>
                          {material.file?.name}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          {(material.file?.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMaterial(material.tempId)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Material Form */}
            <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg p-4 space-y-3 border ${borderColor}`}>
              <p className={`text-xs ${textSecondary} font-medium`}>
                Upload training materials (PDF, documents, etc.)
              </p>
              
              <div>
                <input
                  type="file"
                  id="material-file-input"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setMaterialForm({...materialForm, file: file});
                  }}
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                />
              </div>

              {materialForm.file && (
                <button
                  onClick={handleAddMaterial}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg transition-all shadow-md text-xs font-medium"
                >
                  <Plus size={16} />
                  Add to List
                </button>
              )}
            </div>

            {/* Materials to delete warning */}
            {isEdit && materialsToDelete.length > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                  ⚠️ {materialsToDelete.length} material(s) will be permanently deleted when you save
                </p>
              </div>
            )}
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
              disabled={submitLoading}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? 'Update Training' : 'Create Training'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditTrainingModal;