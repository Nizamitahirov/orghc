// src/components/assets/CategoryManagement.jsx - CLEAN VERSION (Small Fonts)
"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Search, Building, Package, 
  CheckCircle, XCircle, Loader, Calendar, User
} from "lucide-react";
import { categoryService } from "@/services/assetService";
import CustomCheckbox from "../common/CustomCheckbox";

const CategoryManagement = ({ darkMode }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      alert("Failed to delete category. It may be in use.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className={`${textPrimary} text-lg font-semibold mb-1`}>Asset Categories</h2>
          <p className={`${textMuted} text-xs`}>Manage categories for organization</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-almet-sapphire hover:bg-almet-astral text-white px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className={`${bgCard} rounded-xl mb-4 border ${borderColor} p-3`}>
        <div className="relative">
          <Search size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
          />
        </div>
      </div>

      {/* List */}
      <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-5 h-5 animate-spin text-almet-sapphire mr-2" />
            <span className={`${textMuted} text-xs`}>Loading...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-10">
            <Building className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className={`${textMuted} text-sm font-medium`}>No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCategories.map((category) => (
              <div key={category.id} className={`p-4 hover:${bgAccent} transition-colors`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-almet-sapphire/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building size={14} className="text-almet-sapphire" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`${textPrimary} font-medium text-sm mb-1`}>{category.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className={`${textMuted} flex items-center gap-1`}>
                          <Package size={10} />
                          {category.asset_count} assets
                        </span>
                        <span className={`${textMuted} flex items-center gap-1`}>
                          <Calendar size={10} />
                          {formatDate(category.created_at)}
                        </span>
                        <span className={`${textMuted} flex items-center gap-1`}>
                          <User size={10} />
                          {category.created_by_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          category.is_active 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1"
                    >
                      <Edit size={11} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={actionLoading[category.id] || category.asset_count > 0}
                      className="px-3 py-1.5 rounded-lg text-xs bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 flex items-center gap-1"
                      title={category.asset_count > 0 ? "Cannot delete category with assets" : "Delete"}
                    >
                      {actionLoading[category.id] ? (
                        <Loader size={11} className="animate-spin" />
                      ) : (
                        <Trash2 size={11} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <CategoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCategories();
          }}
          darkMode={darkMode}
        />
      )}

      {showEditModal && selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
            fetchCategories();
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Category Modal
const CategoryModal = ({ category, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    is_active: category?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  const isEditing = !!category;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await categoryService.updateCategory(category.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-md shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`${textPrimary} text-lg font-semibold`}>
              {isEditing ? 'Edit Category' : 'Add Category'}
            </h2>
            <button type="button" onClick={onClose} className={`${textMuted} hover:${textPrimary} p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
              <XCircle size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
                rows="2"
                placeholder="Optional description"
              />
            </div>

            <div className="flex items-center gap-2">
              <CustomCheckbox
                checked={formData.is_active}
                onChange={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              />
              <label className={`text-xs ${textPrimary}`}>
                Active category
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs bg-almet-sapphire hover:bg-almet-astral text-white disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditing ? <Edit size={12} /> : <Plus size={12} />}
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryManagement;