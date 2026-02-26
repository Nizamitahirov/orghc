// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - REDESIGNED
import { useState, useEffect, useCallback } from "react";
import { 
  Users, Tag, Search, X, Eye, EyeOff, Loader, AlertCircle, Check,
  Camera, Upload, Image as ImageIcon, Trash2, Calendar, Award,
  Building, Mail, Phone
} from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * TƏKMİLLƏŞDİRİLMİŞ ADDITIONAL INFORMATION STEP
 * - Kompakt və sadə dizayn
 * - Kiçik elementlər və font
 * - Yumşaq rənglər
 * - User-friendly interface
 */
const FormStep3AdditionalInfo = ({
  formData,
  handleInputChange,
  validationErrors,
  lineManagerOptions = [],
  lineManagerSearch,
  setLineManagerSearch,
  loadingLineManagers = false,
  tagOptions = [],
  onAddTag,
  onRemoveTag,
  loading = {},
  isEditMode = false
}) => {
  const { darkMode } = useTheme();
  
  const [showLineManagerDropdown, setShowLineManagerDropdown] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // TƏKMİLLƏŞDİRİLMİŞ THEME CLASSES
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-200";

  useEffect(() => {
    if (formData.profile_image && typeof formData.profile_image === 'string') {
      setImagePreview(formData.profile_image);
    }
  }, [formData.profile_image]);

  const selectedLineManager = Array.isArray(lineManagerOptions) 
    ? lineManagerOptions.find(manager => manager.id === parseInt(formData.line_manager))
    : null;

  const handleLineManagerSelect = (manager) => {
    handleInputChange({
      target: { name: 'line_manager', value: manager.id.toString() }
    });
    setLineManagerSearch("");
    setShowLineManagerDropdown(false);
  };

  const handleLineManagerSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLineManagerSearch(value);
    setShowLineManagerDropdown(value.length >= 1);
  }, [setLineManagerSearch]);

  useEffect(() => {
    if (lineManagerSearch && lineManagerSearch.length >= 2) {
      setShowLineManagerDropdown(true);
    } else if (lineManagerSearch.length === 0) {
      setShowLineManagerDropdown(false);
    }
  }, [lineManagerSearch]);

  const clearLineManager = () => {
    handleInputChange({
      target: { name: 'line_manager', value: '' }
    });
    setLineManagerSearch("");
  };

  const handleTagSelectionChange = (e) => {
    const selectedTagId = e.target.value;
    handleInputChange({
      target: { 
        name: 'tag_id',
        value: selectedTagId
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setImagePreview(imageUrl);
      
      handleInputChange({
        target: { name: 'profile_image', value: file }
      });
      
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    handleInputChange({
      target: { name: 'profile_image', value: null }
    });
    
    const fileInput = document.getElementById('profile-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getFormattedTagOptions = () => {
    const allTags = [...(tagOptions || [])];
    
    if (isEditMode && formData.current_tag && formData.current_tag.id) {
      const existsInOptions = allTags.find(tag => tag.value === formData.current_tag.id?.toString());
      if (!existsInOptions) {
        allTags.push({
          value: formData.current_tag.id?.toString(),
          label: formData.current_tag.name,
          color: formData.current_tag.color || '#6B7280',
          isCurrent: true
        });
      }
    }
    
    return allTags.map(tag => ({
      value: tag.value,
      label: tag.isCurrent ? `${tag.label} (Current)` : tag.label,
      color: tag.color,
      isCurrent: tag.isCurrent || false
    }));
  };

  return (
    <div className="space-y-4">
      {/* HEADER - kompakt */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className={`text-sm font-semibold ${textPrimary}`}>
          Additional Information
        </h2>
        <div className="text-[10px] px-2 py-0.5 bg-almet-sapphire/10 text-almet-sapphire rounded font-medium">
          Step 3/4 (Optional)
        </div>
      </div>

      {/* CURRENT TAG NOTICE - kompakt */}
      {isEditMode && formData.current_tag && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5">
          <div className="flex items-start gap-2">
            <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                Current Tag
              </h4>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-white font-medium"
                style={{ backgroundColor: formData.current_tag.color || '#6B7280' }}
              >
                {formData.current_tag.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE IMAGE - kompakt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Camera className="text-almet-sapphire" size={14} />
            <h4 className={`text-xs font-medium ${textPrimary}`}>Profile Image</h4>
          </div>
          <span className={`text-[10px] ${textMuted}`}>Optional</span>
        </div>

        <div className="flex items-center gap-3">
          {/* IMAGE PREVIEW - kiçik */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              imagePreview 
                ? 'border-almet-sapphire/30 shadow-sm' 
                : `border-dashed ${borderColor} bg-gray-50 dark:bg-gray-800`
            }`}>
              {imagePreview ? (
                <div className="relative w-full h-full group">
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Camera size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon size={16} className={`${textMuted} mb-1`} />
                  <p className={`text-[9px] ${textMuted}`}>No Image</p>
                </div>
              )}
              
              {uploadingImage && (
                <div className="absolute inset-0 bg-almet-sapphire/90 flex items-center justify-center">
                  <Loader size={14} className="text-white animate-spin" />
                </div>
              )}
            </div>

            {imagePreview && !uploadingImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                title="Remove"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* UPLOAD CONTROLS - kompakt */}
          <div className="flex-1">
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
            
            <div className="space-y-1.5">
              <label
                htmlFor="profile-image-upload"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                  uploadingImage 
                    ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500' 
                    : 'bg-almet-sapphire hover:bg-almet-astral text-white shadow-sm hover:shadow'
                }`}
              >
                <Upload size={12} className="mr-1" />
                {uploadingImage ? 'Uploading...' : imagePreview ? 'Change' : 'Upload'}
              </label>
              
              <div className={`text-[10px] ${textMuted}`}>
                Max: 5MB • Recommended: 400×400px
              </div>

              {imagePreview && formData.profile_image && !uploadingImage && (
                <div className="flex items-center gap-1">
                  <Check size={10} className="text-green-600 dark:text-green-400" />
                  <span className="text-[10px] text-green-700 dark:text-green-400 font-medium">
                    {formData.profile_image instanceof File 
                      ? formData.profile_image.name.substring(0, 20) + '...'
                      : 'Uploaded'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LINE MANAGER - kompakt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="text-almet-steel-blue" size={14} />
            <h4 className={`text-xs font-medium ${textPrimary}`}>Line Manager</h4>
          </div>
          {selectedLineManager && (
            <button
              type="button"
              onClick={clearLineManager}
              className="text-[10px] text-red-500 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* SEARCH INPUT - kompakt */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by name, ID, department..."
              value={lineManagerSearch || ""}
              onChange={handleLineManagerSearchChange}
              className={`w-full pl-9 pr-9 py-2 rounded-lg border ${borderColor} transition-all text-sm ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-white text-almet-cloud-burst'
              } focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire outline-none`}
            />
            {loadingLineManagers && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader size={14} className="animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* DROPDOWN - kompakt */}
          {showLineManagerDropdown && Array.isArray(lineManagerOptions) && lineManagerOptions.length > 0 && (
            <div className={`absolute z-30 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-48 overflow-y-auto`}>
              {lineManagerOptions.map((manager) => (
                <button
                  key={manager.id}
                  type="button"
                  onClick={() => handleLineManagerSelect(manager)}
                  className={`w-full p-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b ${borderColor} last:border-b-0 transition-colors`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-almet-sapphire/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={14} className="text-almet-sapphire" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={`font-medium ${textPrimary} text-xs truncate`}>
                          {manager.name || 'Unknown'}
                        </p>
                        {manager.grading_level && (
                          <span className="px-1 py-0.5 text-[9px] bg-almet-sapphire/10 text-almet-sapphire rounded flex-shrink-0">
                            {manager.grading_level}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] ${textMuted} truncate`}>
                        {manager.job_title || 'No Title'} • {manager.department || 'N/A'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showLineManagerDropdown && lineManagerSearch && Array.isArray(lineManagerOptions) && lineManagerOptions.length === 0 && !loadingLineManagers && (
            <div className={`absolute z-30 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg p-2.5 text-center`}>
              <p className={`text-xs ${textMuted}`}>
                No results found
              </p>
            </div>
          )}
        </div>

        {/* SELECTED MANAGER - kompakt */}
        {selectedLineManager && (
          <div className="p-2.5 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className={`font-medium ${textPrimary} text-xs`}>
                      {selectedLineManager.name}
                    </p>
                    {selectedLineManager.grading_level && (
                      <span className="px-1 py-0.5 text-[9px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        {selectedLineManager.grading_level}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] ${textMuted}`}>
                    {selectedLineManager.job_title || 'No Title'} • {selectedLineManager.department || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearLineManager}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 hover:text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EMPLOYEE TAG - kompakt */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Tag className="text-almet-san-juan" size={14} />
          <h4 className={`text-xs font-medium ${textPrimary}`}>Employee Tag</h4>
        </div>

        <FormField
          label=""
          name="tag_id"
          value={formData.tag_id || ""}
          onChange={handleTagSelectionChange}
          type="select"
          options={getFormattedTagOptions()}
          placeholder="Select a tag..."
          showColors={true}
          searchable={true}
          clearable={true}
          validationError={validationErrors.tag_id}
          helpText="Choose one tag"
        />
        
        {formData.tag_id && (
          <div className="mt-1.5">
            <div className={`text-[10px] ${textMuted} mb-1`}>
              Selected tag
            </div>
            <div className="flex flex-wrap gap-1">
              {(() => {
                const selectedTag = getFormattedTagOptions().find(tag => tag.value === formData.tag_id);
                return selectedTag ? (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-white font-medium"
                    style={{ backgroundColor: selectedTag.color || '#6B7280' }}
                  >
                    {selectedTag.label}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {(!getFormattedTagOptions() || getFormattedTagOptions().length === 0) && (
          <div className={`text-center py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border ${borderColor}`}>
            <Tag size={20} className={`mx-auto mb-1.5 ${textMuted} opacity-50`} />
            <p className={`text-xs ${textMuted}`}>
              No tags available
            </p>
          </div>
        )}
      </div>

      {/* ORG CHART VISIBILITY - kompakt */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Eye className="text-indigo-500" size={14} />
          <h4 className={`text-xs font-medium ${textPrimary}`}>Org Chart Visibility</h4>
        </div>

        <div className={`p-2.5 rounded-lg border ${borderColor} bg-gray-50 dark:bg-gray-800/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInputChange({
                  target: { name: 'is_visible_in_org_chart', value: !formData.is_visible_in_org_chart }
                })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50 focus:ring-offset-2 ${
                  formData.is_visible_in_org_chart ? 'bg-almet-sapphire' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    formData.is_visible_in_org_chart ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                {formData.is_visible_in_org_chart ? (
                  <Eye className="text-green-500" size={14} />
                ) : (
                  <EyeOff className="text-gray-400" size={14} />
                )}
                <span className={`text-xs ${textSecondary}`}>
                  {formData.is_visible_in_org_chart ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-[10px] ${textMuted}`}>
            <p>
              <strong>Note:</strong> Only affects org chart display. 
              Reporting and access unchanged.
            </p>
          </div>
        </div>
      </div>

      {/* ADDITIONAL NOTES - kompakt */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="text-orange-500" size={14} />
          <h4 className={`text-xs font-medium ${textPrimary}`}>Additional Notes</h4>
        </div>

        <FormField
          label=""
          name="notes"
          type="textarea"
          value={formData.notes || ""}
          onChange={handleInputChange}
          placeholder="Special instructions, accommodations, etc..."
          rows={2}
          validationError={validationErrors.notes}
          helpText="Internal notes for HR"
        />
      </div>

      {showLineManagerDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowLineManagerDropdown(false)}
        />
      )}
    </div>
  );
};

export default FormStep3AdditionalInfo;