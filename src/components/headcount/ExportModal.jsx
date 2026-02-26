// src/components/headcount/ExportModal.jsx - FIXED: Complete field mapping və backend integration
import { useState } from "react";
import { 
  Download, 
  X, 
  AlertCircle,
} from "lucide-react";

/**
 * COMPLETELY FIXED Export Modal - Field selection və backend integration
 */
const ExportModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  totalEmployees, 
  filteredCount, 
  selectedEmployees, 
  darkMode 
}) => {
  // Local state
  const [exportType, setExportType] = useState("selected");
  const [exportFormat, setExportFormat] = useState("excel");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  // COMPLETELY FIXED: Backend-ə tam uyğun field mapping
  const [includeFields, setIncludeFields] = useState({
    basic_info: true,
    job_info: true,
    contact_info: false,
    contract_info: true,
    management_info: true,
    tags: false,
    grading: true,
    status: true,
    dates: false,
    documents_count: false,
    activities_count: false
  });

  // FIXED: Backend serializer-də olan EXACT field names
  const fieldGroupMappings = {
    basic_info: [
      'employee_id', 'name', 'email', 'father_name', 'date_of_birth', 
      'gender', 'phone', 'address', 'emergency_contact'
    ],
    job_info: [
      'job_title', 'business_function_name', 'business_function_code', 'business_function_id',
      'department_name', 'department_id', 'unit_name', 'unit_id',
      'job_function_name', 'job_function_id'
    ],
    contact_info: [
      'phone', 'address', 'emergency_contact'
    ],
    contract_info: [
      'contract_duration', 'contract_duration_display', 'contract_start_date', 'contract_end_date', 
      'contract_extensions', 'last_extension_date', 'start_date', 'end_date'
    ],
    management_info: [
      'line_manager_name', 'line_manager_hc_number', 'direct_reports_count'
    ],
    tags: [
      'tag_names'
    ],
    grading: [
      'grading_level', 'position_group_name', 'position_group_level', 'position_group_id'
    ],
    status: [
      'status_name', 'status_color', 'is_visible_in_org_chart', 
      'status_needs_update', 'current_status_display'
    ],
    dates: [
      'start_date', 'end_date', 'date_of_birth', 'years_of_service',
      'created_at', 'updated_at'
    ],
    documents_count: ['documents_count'],
    activities_count: ['activities_count']
  };

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  if (!isOpen) return null;

  // Calculate export count
  const getExportCount = () => {
    switch (exportType) {
      case "selected":
        return selectedEmployees?.length || 0;
      case "filtered":
        return filteredCount || 0;
      case "all":
        return totalEmployees || 0;
      default:
        return 0;
    }
  };

  // Handle field selection toggle
  const handleFieldToggle = (field) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // COMPLETELY FIXED: Convert field groups to backend field names
  const getSelectedFields = () => {
    const selectedFields = [];
    
    Object.keys(includeFields).forEach(fieldGroup => {
      if (includeFields[fieldGroup] && fieldGroupMappings[fieldGroup]) {
        selectedFields.push(...fieldGroupMappings[fieldGroup]);
      }
    });

    // Remove duplicates və return
    return [...new Set(selectedFields)];
  };

  // COMPLETELY FIXED: Export handler - backend API structure-ına tam uyğun
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      // Get actual field names from selected groups
      const selectedFields = getSelectedFields();
      
    

      // COMPLETELY FIXED: Backend export_selected endpoint format
      let exportOptions;

      if (exportType === "selected") {
        // Selected employees export
        if (!selectedEmployees || selectedEmployees.length === 0) {
          throw new Error('No employees selected for export');
        }

        exportOptions = {
          type: "selected",
          format: exportFormat,
          include_fields: selectedFields,
          employee_ids: selectedEmployees, // Backend gözləyir
          selectedCount: selectedEmployees.length
        };
      } else if (exportType === "filtered") {
        // Filtered export - use current filters
        exportOptions = {
          type: "filtered", 
          format: exportFormat,
          include_fields: selectedFields,
          filteredCount: filteredCount
        };
      } else {
        // All employees export
        exportOptions = {
          type: "all",
          format: exportFormat, 
          include_fields: selectedFields,
          totalCount: totalEmployees
        };
      }

    

      // Call the export handler from HeadcountTable
      const result = await onExport(exportOptions);
      
      // If successful, close modal
      onClose();
      
    } catch (error) {
      console.error('❌ Export failed in modal:', error);
      setExportError(error.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // FIXED: Field options with better descriptions
  const fieldOptions = [
    { 
      key: "basic_info", 
      label: "Basic Information", 
      description: "Employee ID, name, email, gender, father name, phone",
      count: fieldGroupMappings.basic_info.length
    },
    { 
      key: "job_info", 
      label: "Job Information", 
      description: "Job title, department, Company, units",
      count: fieldGroupMappings.job_info.length
    },
    { 
      key: "contact_info", 
      label: "Contact Information", 
      description: "Phone, address, emergency contact",
      count: fieldGroupMappings.contact_info.length
    },
    { 
      key: "contract_info", 
      label: "Contract Information", 
      description: "Contract duration, start/end dates, extensions",
      count: fieldGroupMappings.contract_info.length
    },
    { 
      key: "management_info", 
      label: "Management", 
      description: "Line manager, direct reports count",
      count: fieldGroupMappings.management_info.length
    },
    { 
      key: "tags", 
      label: "Employee Tags", 
      description: "All assigned tags and categories",
      count: fieldGroupMappings.tags.length
    },
    { 
      key: "grading", 
      label: "Grading Information", 
      description: "Grade level, position group information",
      count: fieldGroupMappings.grading.length
    },
    { 
      key: "status", 
      label: "Status Information", 
      description: "Current status, org chart visibility",
      count: fieldGroupMappings.status.length
    },
    { 
      key: "dates", 
      label: "Important Dates", 
      description: "Start date, birth date, years of service",
      count: fieldGroupMappings.dates.length
    },
    { 
      key: "documents_count", 
      label: "Documents Count", 
      description: "Number of associated documents",
      count: fieldGroupMappings.documents_count.length
    },
    { 
      key: "activities_count", 
      label: "Activities Count", 
      description: "Number of recorded activities",
      count: fieldGroupMappings.activities_count.length
    }
  ];

  // Validation - at least one field must be selected
  const hasSelectedFields = Object.values(includeFields).some(Boolean);
  const canExport = getExportCount() > 0 && hasSelectedFields && !isExporting;

  // Format validation for selected type
  const isValidSelection = () => {
    if (exportType === "selected" && (!selectedEmployees || selectedEmployees.length === 0)) {
      return false;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Download className="mr-3 text-almet-sapphire" size={24} />
            <h2 className={`text-xl font-bold ${textPrimary}`}>Export Employee Data</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${textMuted}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold ${textPrimary}`}>What to Export</h3>
            <div className="space-y-2">
              {/* Selected Employees */}
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportType === "selected" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportType"
                  value="selected"
                  checked={exportType === "selected"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  exportType === "selected" 
                    ? "border-almet-sapphire" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {exportType === "selected" && (
                    <div className="w-2 h-2 rounded-full bg-almet-sapphire"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      Selected Employees
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (selectedEmployees?.length || 0) > 0 
                        ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {selectedEmployees?.length || 0} selected
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Export only the employees you have selected in the table
                  </p>
                </div>
              </label>

              {/* Filtered Employees */}
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportType === "filtered" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportType"
                  value="filtered"
                  checked={exportType === "filtered"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  exportType === "filtered" 
                    ? "border-almet-sapphire" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {exportType === "filtered" && (
                    <div className="w-2 h-2 rounded-full bg-almet-sapphire"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      Filtered Results
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300`}>
                      {filteredCount || 0} employees
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Export employees matching current filters
                  </p>
                </div>
              </label>

              {/* All Employees */}
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportType === "all" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === "all"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  exportType === "all" 
                    ? "border-almet-sapphire" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {exportType === "all" && (
                    <div className="w-2 h-2 rounded-full bg-almet-sapphire"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      All Employees
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                      {totalEmployees || 0} employees
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Export complete employee database
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${textPrimary}`}>Include Fields</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = Object.fromEntries(
                      Object.keys(includeFields).map(key => [key, true])
                    );
                    setIncludeFields(allSelected);
                  }}
                  className="text-xs text-almet-sapphire hover:text-almet-astral"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const noneSelected = Object.fromEntries(
                      Object.keys(includeFields).map(key => [key, false])
                    );
                    setIncludeFields(noneSelected);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {fieldOptions.map((field) => (
                <label key={field.key} className={`flex items-start p-2 rounded cursor-pointer ${bgHover}`}>
                  <input
                    type="checkbox"
                    checked={includeFields[field.key]}
                    onChange={() => handleFieldToggle(field.key)}
                    className="mt-0.5 mr-3 h-4 w-4 text-almet-sapphire focus:ring-almet-sapphire border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${textPrimary}`}>{field.label}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${textMuted} bg-gray-100 dark:bg-gray-700`}>
                        {field.count}
                      </span>
                    </div>
                    <p className={`text-xs ${textMuted} mt-1`}>{field.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Fields Preview */}
          <div className="space-y-2">
            <h4 className={`text-xs font-medium ${textSecondary}`}>
              Selected Fields ({getSelectedFields().length} total fields)
            </h4>
            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 p-2 rounded max-h-20 overflow-y-auto">
              {getSelectedFields().length > 0 ? getSelectedFields().join(', ') : 'No fields selected'}
            </div>
          </div>

          {/* Error Display */}
          {exportError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Export Failed</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {exportError}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!canExport || !isValidSelection()}
            className="px-6 py-2 bg-almet-sapphire hover:bg-almet-astral text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={14} className="mr-2" />
                Export {getExportCount()} Employees ({getSelectedFields().length} fields)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;