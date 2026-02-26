// src/components/jobCatalog/CrudModal.jsx - MultiSelect ilə bulk creation

import React from 'react';
import { X, Save, Loader2, AlertCircle, Info } from 'lucide-react';
import SearchableDropdown from '../common/SearchableDropdown';
import MultiSelect from '../common/MultiSelect';

export default function CrudModal({ context, darkMode }) {
  const {
    showCrudModal, crudModalType, crudModalMode, selectedItem,
    formData, setFormData, loading, errors,
    closeCrudModal, handleCrudSubmit,
    businessFunctions, departments
  } = context;

  // DEBUG: formData dəyişəndə log et
  React.useEffect(() => {
    if (showCrudModal) {
      console.log('CrudModal - formData updated:', formData);
      console.log('CrudModal - crudModalType:', crudModalType);
      console.log('CrudModal - crudModalMode:', crudModalMode);
    }
  }, [formData, showCrudModal, crudModalType, crudModalMode]);

  if (!showCrudModal) return null;

  const getModalTitle = () => {
    const typeNames = {
      business_functions: 'Company',
      departments: 'Department',
      units: 'Unit',
      job_functions: 'Job Function',
      job_titles: 'Job Title',
      position_groups: 'Hierarchy'
    };
    const typeName = typeNames[crudModalType] || 'Item';
    return `${crudModalMode === 'create' ? 'Create' : 'Edit'} ${typeName}`;
  };

  const inputClass = "w-full px-2.5 py-2 text-xs border outline-0 border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-700 dark:text-almet-bali-hai mb-1.5";
  const textareaClass = "w-full px-2.5 py-2 text-xs border outline-0 border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none";

  // Handle MultiSelect change - properly update parent formData
  const handleMultiSelectChange = (fieldName, value) => {
    // Get current array from formData
    const currentArray = formData[fieldName] || [];
    
    // Toggle the value
    let newArray;
    if (currentArray.includes(value)) {
      newArray = currentArray.filter(v => v !== value);
    } else {
      newArray = [...currentArray, value];
    }
    
    // Update formData via setFormData from parent
    setFormData({
      ...formData,
      [fieldName]: newArray
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCrudSubmit(e);
  };

  const renderFormFields = () => {
    switch (crudModalType) {
      case 'business_functions':
        return (
          <>
            <div className="mb-3">
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={inputClass}
                placeholder="Enter Company name"
                required
              />
            </div>
            <div className="mb-3">
              <label className={labelClass}>Code *</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className={inputClass}
                placeholder="Enter code"
              />
            </div>
          </>
        );

      case 'departments':
        return (
          <>
            <div className="mb-3">
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={inputClass}
                placeholder="Enter department name"
                required
              />
            </div>
            
            {crudModalMode === 'create' ? (
              <>
                {/* Bulk Creation Mode */}
                <div className="mb-3">
                  <label className={labelClass}>
                    Companys * 
                    <span className="text-[10px] text-gray-500 dark:text-almet-bali-hai ml-1">
                      (Select multiple for bulk creation)
                    </span>
                  </label>
                  <MultiSelect
                    options={businessFunctions.map(bf => ({
                      id: bf.value || bf.id,
                      name: bf.label || bf.name,
                      value: bf.value || bf.id
                    }))}
                    selected={formData.business_function_ids || []}
                    onChange={handleMultiSelectChange}
                    placeholder="Select Companys"
                    fieldName="business_function_ids"
                    darkMode={darkMode}
                  />
                </div>
                
                {/* Info message */}
                {formData.business_function_ids && formData.business_function_ids.length > 1 && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-blue-800 dark:text-blue-200">
                        This department will be created for <strong>{formData.business_function_ids.length}</strong> Companys
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Single Selection Mode for Edit */}
                <div className="mb-3">
                  <label className={labelClass}>Company *</label>
                  <SearchableDropdown
                    options={businessFunctions}
                    value={formData.business_function || ''}
                    onChange={(value) => setFormData({...formData, business_function: value})}
                    placeholder="Select Company"
                    searchPlaceholder="Search Companys..."
                    allowUncheck={false}
                    darkMode={darkMode}
                    portal={true}
                  />
                </div>
              </>
            )}
          </>
        );

      case 'units':
        return (
          <>
            <div className="mb-3">
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={inputClass}
                placeholder="Enter unit name"
                required
              />
            </div>
            
            {crudModalMode === 'create' ? (
              <>
                {/* Bulk Creation Mode */}
                <div className="mb-3">
                  <label className={labelClass}>
                    Departments * 
                    <span className="text-[10px] text-gray-500 dark:text-almet-bali-hai ml-1">
                      (Select multiple for bulk creation)
                    </span>
                  </label>
                  <MultiSelect
                    options={departments.map(dept => ({
                      id: dept.value || dept.id,
                      name: `${dept.label || dept.name} (${dept.business_function_name || 'N/A'})`,
                      value: dept.value || dept.id
                    }))}
                    selected={formData.department_ids || []}
                    onChange={handleMultiSelectChange}
                    placeholder="Select departments"
                    fieldName="department_ids"
                    darkMode={darkMode}
                  />
                </div>
                
                {/* Info message */}
                {formData.department_ids && formData.department_ids.length > 1 && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-blue-800 dark:text-blue-200">
                        This unit will be created for <strong>{formData.department_ids.length}</strong> departments
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Single Selection Mode for Edit */}
                <div className="mb-3">
                  <label className={labelClass}>Department *</label>
                  <SearchableDropdown
                    options={departments.map(dept => ({
                      ...dept,
                      label: `${dept.label || dept.name} (${dept.business_function_name || 'N/A'})`
                    }))}
                    value={formData.department || ''}
                    onChange={(value) => setFormData({...formData, department: value})}
                    placeholder="Select Department"
                    searchPlaceholder="Search departments..."
                    allowUncheck={false}
                    darkMode={darkMode}
                    portal={true}
                  />
                </div>
              </>
            )}
          </>
        );

      case 'job_functions':
        return (
          <div className="mb-3">
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={inputClass}
              placeholder="Enter job function name"
              required
            />
          </div>
        );

      case 'job_titles':
        return (
          <>
            <div className="mb-3">
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={inputClass}
                placeholder="Enter job title name"
                required
              />
            </div>
            <div className="mb-3">
              <label className={labelClass}>Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={textareaClass}
                placeholder="Enter job title description (optional)"
                rows={3}
              />
            </div>
          </>
        );

      case 'position_groups':
        return (
          <>
            <div className="mb-3">
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={inputClass}
                placeholder="Enter Hierarchy name"
                required
              />
            </div>
            <div className="mb-3">
              <label className={labelClass}>Hierarchy Level *</label>
              <input
                type="number"
                value={formData.hierarchy_level || ''}
                onChange={(e) => setFormData({...formData, hierarchy_level: parseInt(e.target.value)})}
                className={inputClass}
                placeholder="1-10"
                min="1"
                max="10"
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg max-w-lg w-full shadow-xl border border-gray-200 dark:border-almet-comet">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {getModalTitle()}
            </h2>
            <button
              onClick={closeCrudModal}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500 dark:text-almet-bali-hai" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4">
          {renderFormFields()}
          
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="mr-2 w-3.5 h-3.5 text-almet-sapphire bg-gray-100 border-gray-300 rounded focus:ring-almet-sapphire"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-almet-bali-hai">Active</span>
            </label>
          </div>

          {errors.crud && (
            <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                <span className="text-red-800 dark:text-red-200 text-xs">{errors.crud}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-almet-comet">
            <button
              onClick={closeCrudModal}
              disabled={loading.crud}
              className="px-3 py-2 text-xs border border-gray-300 dark:border-almet-comet text-gray-700 dark:text-almet-bali-hai rounded-lg hover:bg-gray-50 dark:hover:bg-almet-comet transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading.crud}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading.crud ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  {crudModalMode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save size={12} />
                  {crudModalMode === 'create' ? 'Create' : 'Update'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}