// src/components/news/NewsFormModal.jsx - Complete with Smaller Fonts & Checkbox
import React, { useState, useEffect, useRef } from 'react';
import CustomCheckbox from '@/components/common/CustomCheckbox';
import { X, Save, Loader2, Upload, Tag, AlertCircle, Image as ImageIcon, Trash2, Users, Target } from 'lucide-react';
import MultiSelect from '@/components/common/MultiSelect';
export default function NewsFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  newsItem = null, 
  darkMode = false,
  categories = [],
  targetGroups = []
}) {
const [formData, setFormData] = useState({
  title: '',
  excerpt: '',
  content: '',
  category: '',
  image: null,
  imagePreview: '',
  tags: [],
  isPinned: false,
  isPublished: true, // ƏLAVƏ ET
  targetGroups: [],
  notifyMembers: false,
  authorDisplayName: ''
});
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [showTargetGroupSelector, setShowTargetGroupSelector] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
  if (newsItem) {
    setFormData({
      title: newsItem.title || '',
      excerpt: newsItem.excerpt || '',
      content: newsItem.content || '',
      category: newsItem.category || (categories.length > 0 ? categories[0].id : ''),
      image: newsItem.image || null,
      imagePreview: newsItem.imagePreview || newsItem.image_url || '',
      tags: newsItem.tags || [],
      isPinned: newsItem.isPinned || newsItem.is_pinned || false,
      isPublished: newsItem.isPublished !== undefined ? newsItem.isPublished : (newsItem.is_published !== undefined ? newsItem.is_published : true), // ƏLAVƏ ET
      targetGroups: newsItem.targetGroups || [],
      notifyMembers: newsItem.notifyMembers || newsItem.notify_members || false,
      authorDisplayName: newsItem.authorDisplayName || newsItem.author_display_name || ''
    });
  } else {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: categories.length > 0 ? categories[0].id : '',
      image: null,
      imagePreview: '',
      tags: [],
      isPinned: false,
      isPublished: true, // ƏLAVƏ ET - default true
      targetGroups: [],
      notifyMembers: false,
      authorDisplayName: ''
    });
  }
  setErrors({});
}, [newsItem, isOpen, categories]);
  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: null }));
    } else {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image file' }));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      imagePreview: url,
      image: null
    }));
    setErrors(prev => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const newErrors = {};
  
  // Title validation - minimum 5 characters
  if (!formData.title.trim()) {
    newErrors.title = 'Title is required';
  } else if (formData.title.trim().length < 5) {
    newErrors.title = 'Title must be at least 5 characters long';
  }
  
  // Excerpt validation - minimum 10 characters
  if (!formData.excerpt.trim()) {
    newErrors.excerpt = 'Excerpt is required';
  } else if (formData.excerpt.trim().length < 10) {
    newErrors.excerpt = 'Excerpt must be at least 10 characters long';
  }
  
  // Content validation - minimum 20 characters
  if (!formData.content.trim()) {
    newErrors.content = 'Content is required';
  } else if (formData.content.trim().length < 20) {
    newErrors.content = 'Content must be at least 20 characters long';
  }
  
  if (!formData.imagePreview) newErrors.image = 'Image is required';
  if (!formData.category) newErrors.category = 'Category is required';
  if (formData.targetGroups.length === 0) newErrors.targetGroups = 'Please select at least one target group';
  
  // Validate image URL if provided
  if (formData.imagePreview && !formData.image) {
    try {
      new URL(formData.imagePreview);
    } catch (error) {
      newErrors.image = 'Please enter a valid image URL';
    }
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setLoading(true);
  try {
    await onSave(formData);
    onClose();
  } catch (error) {
    setErrors({ submit: error.message || 'Failed to save news' });
  } finally {
    setLoading(false);
  }
};

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleToggleTargetGroup = (groupId) => {
    setFormData(prev => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(groupId)
        ? prev.targetGroups.filter(id => id !== groupId)
        : [...prev.targetGroups, groupId]
    }));
    setErrors(prev => ({ ...prev, targetGroups: null }));
  };

  const getSelectedGroupsInfo = () => {
    const selectedGroups = targetGroups.filter(g => 
      formData.targetGroups.includes(g.id)
    );
    const totalMembers = selectedGroups.reduce((sum, g) => sum + (g.member_count || 0), 0);
    return { groups: selectedGroups, totalMembers };
  };

  const inputClass = `w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all
    ${darkMode 
      ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
    }`;

  const labelClass = `block text-xs font-medium mb-2 ${
    darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
  }`;

  const selectedGroupsInfo = getSelectedGroupsInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${
        darkMode 
          ? 'bg-almet-cloud-burst border-almet-comet' 
          : 'bg-white border-gray-100'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b sticky top-0 z-10 backdrop-blur-sm ${
          darkMode 
            ? 'border-almet-comet bg-almet-cloud-burst/95' 
            : 'border-gray-100 bg-white/95'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {newsItem ? 'Edit News' : 'Create News'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className={`p-2 rounded-xl transition-colors ${
                darkMode 
                  ? 'hover:bg-almet-comet text-almet-bali-hai hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="space-y-4">
            
            {/* Title */}
            <div>
              <label className={labelClass}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  setErrors(prev => ({ ...prev, title: null }));
                }}
                className={inputClass}
                placeholder="Enter news title"
                maxLength={300}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Category & Pinned */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <label className={labelClass}>
      Category <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.category}
      onChange={(e) => {
        setFormData(prev => ({ ...prev, category: e.target.value }));
        setErrors(prev => ({ ...prev, category: null }));
      }}
      className={inputClass}
    >
      <option value="">Select category</option>
      {categories.filter(c => c.is_active).map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
    {errors.category && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
        <AlertCircle size={11} />
        {errors.category}
      </p>
    )}
  </div>

  <div className={`p-3 rounded-xl border flex items-center ${
    darkMode ? 'bg-almet-san-juan/50 border-almet-comet' : 'bg-gray-50 border-gray-200'
  }`}>
    <label className="flex items-center gap-2.5 cursor-pointer">
      <CustomCheckbox
        checked={formData.isPinned}
        onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
      />
      <span className={`text-xs font-medium ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Pin this news
      </span>
    </label>
  </div>

  {/* ƏLAVƏ ET - Publish Checkbox */}
  <div className={`p-3 rounded-xl border flex items-center ${
    darkMode ? 'bg-almet-san-juan/50 border-almet-comet' : 'bg-gray-50 border-gray-200'
  }`}>
    <label className="flex items-center gap-2.5 cursor-pointer">
      <CustomCheckbox
        checked={formData.isPublished}
        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
      />
      <span className={`text-xs font-medium ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Publish now
      </span>
    </label>
  </div>
</div>

            {/* Author Display Name */}
            <div>
              <label className={labelClass}>
                Author Display Name
              </label>
              <input
                type="text"
                value={formData.authorDisplayName}
                onChange={(e) => setFormData(prev => ({ ...prev, authorDisplayName: e.target.value }))}
                className={inputClass}
                placeholder="e.g., CEO Office, HR Department"
                maxLength={200}
              />
              <p className={`text-[10px] mt-1.5 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
              }`}>
                Leave empty to use your name
              </p>
            </div>

            {/* Target Groups Selection */}
            <div>
  <label className={labelClass}>
    Target Groups <span className="text-red-500">*</span>
  </label>
 

               <MultiSelect
    options={targetGroups.filter(g => g.is_active).map(group => ({
      id: group.id,
      name: group.name,
      label: `${group.name} (${group.member_count} members)`,
      value: group.id
    }))}
    selected={formData.targetGroups}
    onChange={(fieldName, value) => handleToggleTargetGroup(value)}
    placeholder="Select target groups..."
    fieldName="targetGroups"
    darkMode={darkMode}
  />

  {errors.targetGroups && (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle size={11} />
      {errors.targetGroups}
    </p>
  )}

              {/* Notify Members Checkbox */}
              <div className={`mt-2.5 p-3 rounded-xl border ${
                darkMode ? 'bg-almet-san-juan/50 border-almet-comet' : 'bg-gray-50 border-gray-200'
              }`}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <CustomCheckbox
                    checked={formData.notifyMembers}
                    onChange={(e) => setFormData(prev => ({ ...prev, notifyMembers: e.target.checked }))}
                  />
                  <span className={`text-xs ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Send email notification to all members
                  </span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className={labelClass}>
                Image <span className="text-red-500">*</span>
              </label>
              
              {!formData.imagePreview ? (
                <>
                  {/* URL Input */}
                  <div className="mb-2.5">
                    <input
                      type="url"
                      placeholder="Paste image URL here (https://...)"
                      className={inputClass}
                      onChange={handleImageUrlChange}
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative mb-2.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${
                        darkMode ? 'border-almet-comet' : 'border-gray-200'
                      }`}></div>
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className={`px-2 ${
                        darkMode ? 'bg-almet-cloud-burst text-almet-bali-hai' : 'bg-white text-gray-500'
                      }`}>
                        OR
                      </span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActive 
                        ? 'border-almet-sapphire bg-almet-sapphire/5' 
                        : darkMode
                          ? 'border-almet-comet bg-almet-san-juan hover:border-almet-sapphire'
                          : 'border-gray-300 bg-gray-50 hover:border-almet-sapphire'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                 
                    
                    <p className={`text-xs font-medium mb-1.5 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Drag and drop your image here
                    </p>
                    
                    <p className={`text-[10px] mb-3 ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                    }`}>
                      or
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all text-xs font-medium shadow-lg shadow-almet-sapphire/20"
                    >
                      <Upload size={14} />
                      Browse Files
                    </button>
                    
                    <p className={`text-[10px] mt-2.5 ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                    }`}>
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                      setErrors(prev => ({ ...prev, image: 'Invalid image URL' }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2.5 right-2.5 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              
              {errors.image && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className={labelClass}>
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, excerpt: e.target.value }));
                  setErrors(prev => ({ ...prev, excerpt: null }));
                }}
                className={inputClass}
                rows="3"
                placeholder="Brief summary of the news"
                maxLength={500}
              />
              {errors.excerpt && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.excerpt}
                </p>
              )}
              <p className={`text-[10px] mt-1.5 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
              }`}>
                {formData.excerpt.length}/500 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className={labelClass}>
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, content: e.target.value }));
                  setErrors(prev => ({ ...prev, content: null }));
                }}
                className={inputClass}
                rows="8"
                placeholder="Full news content"
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.content}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className={inputClass}
                  placeholder="Add a tag"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all text-xs font-medium whitespace-nowrap"
                >
                  <Tag size={14} />
                </button>
              </div>
              
              {/* Tag List */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs ${
                        darkMode 
                          ? 'bg-almet-san-juan text-almet-bali-hai' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                darkMode 
                  ? 'bg-red-900/20 border-red-800 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span className="text-xs">{errors.submit}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`flex justify-end gap-2.5 mt-5 pt-5 border-t ${
            darkMode ? 'border-almet-comet' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all disabled:opacity-50 ${
                darkMode
                  ? 'border border-almet-comet text-almet-bali-hai hover:bg-almet-comet'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium shadow-lg shadow-almet-sapphire/20"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  {newsItem ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}