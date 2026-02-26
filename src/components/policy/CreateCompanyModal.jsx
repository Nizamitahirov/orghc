import { useState, useEffect } from "react";
import { X, Loader2, Building2 } from "lucide-react";

export default function CreateCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  darkMode,
  editingCompany = null,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    name: "",

    icon: "🏢",
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (editingCompany) {
      setFormData({
        name: editingCompany.name || "",
      
        icon: editingCompany.icon || "🏢",
      });
    } else {
      setFormData({
        name: "",
  
        icon: "🏢",
      });
    }
    setErrors({});
  }, [editingCompany, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Folder name is required";
    }

  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,

        name: formData.name.trim(),
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg p-6 ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {editingCompany ? "Edit Folder" : "Add New Folder"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Folder Name *
            </label>
            <input
              type="text"
              placeholder="e.g., External Partners"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={submitting}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-almet-sapphire"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-almet-sapphire"
              } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50 disabled:opacity-50`}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

      

      

          {/* Icon */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Icon (Emoji)
            </label>
            <input
              type="text"
              placeholder="🏢"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              disabled={submitting}
              maxLength={10}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                darkMode
                  ? "bg-gray-900 border-gray-700 text-white focus:border-almet-sapphire"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:border-almet-sapphire"
              } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50 disabled:opacity-50`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } disabled:opacity-50 transition-all`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.name.trim() }
              className="flex-1 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingCompany ? "Update Folder" : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}