// src/components/news/CategoryManagement.jsx - Refined with Smaller Fonts
"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from '@/components/common/Toast';
import { categoryService, formatApiError } from '@/services/newsService';
import { 
  Tag, Plus, Search, Edit, Trash2, X, Save, AlertCircle, 
  Loader2, ArrowLeft, FileText, CheckCircle, Calendar
} from 'lucide-react';

// Category Form Modal
function CategoryFormModal({ isOpen, onClose, onSave, category = null, darkMode = false }) {
  const [formData, setFormData] = useState({
    name: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        isActive: category.is_active ?? true
      });
    } else {
      setFormData({ name: '', isActive: true });
    }
    setErrors({});
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
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
      setErrors({ submit: formatApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-md w-full shadow-2xl border ${
        darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-100'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          darkMode ? 'border-almet-comet' : 'border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {category ? 'Edit Category' : 'Create Category'}
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
            
            {/* Category Name */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
              }`}>
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setErrors(prev => ({ ...prev, name: null }));
                }}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                  darkMode 
                    ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                }`}
                placeholder="e.g., Announcements, Events"
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className={`p-3 rounded-xl border ${
              darkMode ? 'bg-almet-san-juan/50 border-almet-comet' : 'bg-gray-50 border-gray-200'
            }`}>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-almet-sapphire bg-gray-100 border-gray-300 rounded focus:ring-almet-sapphire focus:ring-2"
                />
                <div>
                  <span className={`text-xs font-medium block ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Active Category
                  </span>
                  <span className={`text-[10px] ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Active categories can be used when creating news
                  </span>
                </div>
              </label>
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
          <div className="flex gap-2.5 justify-end mt-5">
            <button
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
                  {category ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Category Management Component
export default function CategoryManagement({ onBack }) {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (error) {
      showError(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const handleSaveCategory = async (formData) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        showSuccess('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        showSuccess('Category created successfully');
      }
      loadCategories();
      setShowFormModal(false);
      setEditingCategory(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      showSuccess('Category deleted successfully');
      loadCategories();
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  return (
    <DashboardLayout>
      <div className={`p-6 min-h-screen transition-colors ${
        darkMode ? 'bg-gray-900' : 'bg-almet-mystic'
      }`}>
        <div className=" mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {onBack && (
                  <button
                    onClick={onBack}
                    className={`flex items-center gap-1.5 text-xs mb-3 transition-colors group ${
                      darkMode 
                        ? 'text-almet-bali-hai hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to News
                  </button>
                )}
                <h1 className={`text-2xl font-bold mb-1.5 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  News Categories
                </h1>
                <p className={`text-xs ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                }`}>
                  Organize your news content with custom categories
                </p>
              </div>
              <button
                onClick={handleCreateCategory}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all font-medium text-xs shadow-lg shadow-almet-sapphire/20 hover:shadow-xl hover:shadow-almet-sapphire/30 hover:-translate-y-0.5"
              >
                <Plus size={16} />
                Create Category
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Total Categories
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {categories.length}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-sky-900/30' : 'bg-sky-50'
                }`}>
                  <Tag className={`h-5 w-5 ${
                    darkMode ? 'text-sky-400' : 'text-sky-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Active Categories
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {categories.filter(c => c.is_active).length}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-green-900/30' : 'bg-green-50'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Total News
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {categories.reduce((sum, c) => sum + (c.news_count || 0), 0)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={`rounded-2xl p-3.5 mb-5 border ${
            darkMode 
              ? 'bg-almet-cloud-burst border-almet-comet' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search categories..."
                className={`w-full pl-10 pr-3 py-2.5 text-xs border rounded-xl outline-none transition-all ${
                  darkMode
                    ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-almet-sapphire" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className={`rounded-2xl p-12 text-center border ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet' 
                : 'bg-white border-gray-200'
            }`}>
              <Tag className={`h-14 w-14 mx-auto mb-3 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
              }`} />
              <h3 className={`text-base font-semibold mb-1.5 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                No Categories Found
              </h3>
              <p className={`text-xs mb-3 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
              }`}>
                {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first category'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateCategory}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all text-xs font-medium shadow-lg shadow-almet-sapphire/20"
                >
                  <Plus size={14} />
                  Create Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className={`rounded-2xl p-5 border transition-all group hover:shadow-lg ${
                    darkMode
                      ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50'
                      : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className={`p-2.5 rounded-xl ${
                        darkMode ? 'bg-sky-900/30' : 'bg-sky-50'
                      }`}>
                        <Tag className={`h-4 w-4 ${
                          darkMode ? 'text-sky-400' : 'text-sky-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-semibold mb-1 truncate ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {category.name}
                        </h3>
                        {category.is_active ? (
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                            darkMode 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-green-50 text-green-700'
                          }`}>
                            Active
                          </span>
                        ) : (
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-400' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-almet-comet text-almet-bali-hai hover:text-white' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-red-900/30 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className={`p-3 rounded-xl border mb-3 ${
                    darkMode 
                      ? 'bg-almet-san-juan/50 border-almet-comet' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                      }`}>
                        Total News
                      </span>
                      <span className={`text-xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {category.news_count || 0}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className={`pt-3 border-t text-[10px] ${
                    darkMode 
                      ? 'border-almet-comet text-almet-bali-hai' 
                      : 'border-gray-200 text-gray-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{new Date(category.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="font-medium">{category.created_by_name || 'System'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Modal */}
          <CategoryFormModal
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingCategory(null);
            }}
            onSave={handleSaveCategory}
            category={editingCategory}
            darkMode={darkMode}
          />

          {/* Delete Modal */}
          {showDeleteModal && selectedCategory && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`rounded-2xl max-w-md w-full p-5 shadow-2xl ${
                darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    darkMode ? 'bg-red-900/30' : 'bg-red-50'
                  }`}>
                    <AlertCircle className={`h-5 w-5 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Delete Category
                    </h3>
                    <p className={`text-xs ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                    }`}>
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                
                <p className={`text-xs mb-5 ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                }`}>
                  Are you sure you want to delete <span className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    "{selectedCategory.name}"
                  </span>? 
                  {selectedCategory.news_count > 0 && (
                    <span className="block mt-1.5 text-red-500 font-medium">
                      Warning: This category is used by {selectedCategory.news_count} news item(s).
                    </span>
                  )}
                </p>
                
                <div className="flex gap-2.5 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedCategory(null);
                    }}
                    className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                      darkMode
                        ? 'border border-almet-comet text-almet-bali-hai hover:bg-almet-comet'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                  >
                    Delete Category
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}