// src/components/headcount/FormSteps/FormStep2JobInfo.jsx - FIXED: Display values and API-based contract configs
import { useState, useEffect } from "react";
import { Briefcase, Calendar, Info, Building, Users, Award, AlertCircle, Loader, CheckCircle } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * Job Information step - Fixed to show proper display values and use API for contract configs
 */
const FormStep2JobInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors,
  businessFunctions = [],
  departments = [],
  units = [],
  jobFunctions = [],
  positionGroups = [],
  gradeOptions = [],
  contractConfigs = [], // NEW: Contract configs from API
  loadingGradingLevels = false,
  loading = {},
  isEditMode = false
}) => {
  const { darkMode } = useTheme();

  // Local state for tracking loaded data and display values
  const [departmentWarning, setDepartmentWarning] = useState(false);
  const [unitWarning, setUnitWarning] = useState(false);

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const bgInfo = darkMode ? "bg-almet-sapphire/20" : "bg-almet-sapphire/5";
  const bgWarning = darkMode ? "bg-amber-900/20" : "bg-amber-50";
  const bgSuccess = darkMode ? "bg-green-900/20" : "bg-green-50";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-bali-hai";

  // UPDATED: Get contract duration options from API
  const getContractDurationOptions = () => {
    if (!Array.isArray(contractConfigs) || contractConfigs.length === 0) {
      // Fallback to hardcoded options if API data not available
      return [
        { value: "PERMANENT", label: "Permanent Contract" },
        { value: "3_MONTHS", label: "3 Months Fixed" },
        { value: "6_MONTHS", label: "6 Months Fixed" },
        { value: "1_YEAR", label: "1 Year Fixed" },
        { value: "2_YEARS", label: "2 Years Fixed" },
        { value: "3_YEARS", label: "3 Years Fixed" }
      ];
    }

    return contractConfigs
      .filter(config => config.is_active !== false)
      .map(config => ({
        value: config.contract_type,
        label: config.display_name,

        probation_days: config.probation_days,
        total_days_until_active: config.total_days_until_active,
        description: ` Probation: ${config.probation_days} days`
      }));
  };

  // FIXED: Enhanced Company options with current value preservation
  const getBusinessFunctionOptions = () => {
    const baseOptions = Array.isArray(businessFunctions) ? [...businessFunctions] : [];
    
    // In edit mode, ensure current Company is available
    if (isEditMode && formData.business_function && formData.business_function_name) {
      const existingOption = baseOptions.find(bf => bf.value === formData.business_function);
      if (!existingOption) {
        baseOptions.unshift({
          value: formData.business_function,
          label: `${formData.business_function_name} (Current)`,
          isCurrent: true,
          color: '#059669' // green color for current
        });
      }
    }
    
    return baseOptions;
  };

  // FIXED: Enhanced department options with current value preservation
  const getDepartmentOptions = () => {
    const baseOptions = Array.isArray(departments) ? [...departments] : [];
    
    // In edit mode, ensure current department is available
    if (isEditMode && formData.department && formData.department_name) {
      const existingOption = baseOptions.find(d => d.value === formData.department);
      if (!existingOption && !loading.departments) {
        baseOptions.unshift({
          value: formData.department,
          label: `${formData.department_name} (Current)`,
          isCurrent: true,
          color: '#059669' // green color for current
        });
        setDepartmentWarning(true);
      } else {
        setDepartmentWarning(false);
      }
    }
    
    return baseOptions;
  };

  // FIXED: Enhanced unit options with current value preservation
  const getUnitOptions = () => {
    const baseOptions = Array.isArray(units) ? [...units] : [];
    
    // In edit mode, ensure current unit is available
    if (isEditMode && formData.unit && formData.unit_name) {
      const existingOption = baseOptions.find(u => u.value === formData.unit);
      if (!existingOption && !loading.units) {
        baseOptions.unshift({
          value: formData.unit,
          label: `${formData.unit_name} (Current)`,
          isCurrent: true,
          color: '#059669' // green color for current
        });
        setUnitWarning(true);
      } else {
        setUnitWarning(false);
      }
    }
    
    return baseOptions;
  };

  // FIXED: Enhanced job function options with current value preservation
  const getJobFunctionOptions = () => {
    const baseOptions = Array.isArray(jobFunctions) ? [...jobFunctions] : [];
    
    // In edit mode, ensure current job function is available
    if (isEditMode && formData.job_function && formData.job_function_name) {
      const existingOption = baseOptions.find(jf => jf.value === formData.job_function);
      if (!existingOption) {
        baseOptions.unshift({
          value: formData.job_function,
          label: `${formData.job_function_name} (Current)`,
          isCurrent: true,
          color: '#059669'
        });
      }
    }
    
    return baseOptions;
  };

  // FIXED: Enhanced position group options with current value preservation  
  const getPositionGroupOptions = () => {
    const baseOptions = Array.isArray(positionGroups) ? [...positionGroups] : [];
    
    // In edit mode, ensure current position group is available
    if (isEditMode && formData.position_group && formData.position_group_name) {
      const existingOption = baseOptions.find(pg => pg.value === formData.position_group);
      if (!existingOption) {
        baseOptions.unshift({
          value: formData.position_group,
          label: `${formData.position_group_name} (Current)`,
          isCurrent: true,
          color: '#059669'
        });
      }
    }
    
    return baseOptions;
  };

  // FIXED: Enhanced grading level options with current value preservation
  const getGradingLevelOptions = () => {
    const baseOptions = Array.isArray(gradeOptions) ? [...gradeOptions] : [];
    
    // In edit mode, ensure current grading level is available
    if (isEditMode && formData.grading_level && !baseOptions.find(g => g.value === formData.grading_level)) {
      baseOptions.unshift({
        value: formData.grading_level,
        label: `${formData.grading_level} (Current)`,
        isCurrent: true,
        color: '#059669'
      });
    }
    
    return baseOptions;
  };

  // Calculate minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (!formData.start_date) return "";
    const startDate = new Date(formData.start_date);
    startDate.setDate(startDate.getDate() + 1);
    return startDate.toISOString().split('T')[0];
  };

  // UPDATED: Calculate contract end date based on duration using API config
  const calculateContractEndDate = () => {
    if (!formData.start_date || formData.contract_duration === 'PERMANENT') return null;
    
    const startDate = new Date(formData.start_date);
    let endDate = new Date(startDate);
    
    // Try to use contract config for accurate duration calculation
    const selectedConfig = contractConfigs.find(c => c.contract_type === formData.contract_duration);
    
    if (selectedConfig && selectedConfig.total_days_until_active) {
      // If contract config exists, we could use its data for more accurate calculation
      // For now, we'll use the contract_type naming convention
    }
    
    // Fallback to standard duration calculation
    switch (formData.contract_duration) {
      case '3_MONTHS':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '6_MONTHS':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '1_YEAR':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case '2_YEARS':
        endDate.setFullYear(endDate.getFullYear() + 2);
        break;
      case '3_YEARS':
        endDate.setFullYear(endDate.getFullYear() + 3);
        break;
      default:
        return null;
    }
    
    return endDate.toISOString().split('T')[0];
  };

  // Helper functions
  const hasOptions = (options) => Array.isArray(options) && options.length > 0;

  const getPlaceholder = (type, dependent = null, dependentValue = null) => {
    if (dependent && !dependentValue) {
      return `Select ${dependent} first`;
    }
    
    if (loading[type]) {
      return "Loading...";
    }
    
    switch (type) {
      case 'departments':
        return !hasOptions(departments) && formData.business_function 
          ? "No departments available" 
          : "Select department";
      case 'units':
        return !hasOptions(units) && formData.department 
          ? "No units available" 
          : "Select unit (optional)";
      case 'gradeOptions':
        return !hasOptions(gradeOptions) && formData.position_group 
          ? "No grading levels available" 
          : "Select grading level";
      case 'contractConfigs':
        return !hasOptions(contractConfigs) 
          ? "No contract types available" 
          : "Select contract duration";
      default:
        return `Select ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }
  };

  // Update contract end date when duration or start date changes
  useEffect(() => {
    const calculatedEndDate = calculateContractEndDate();
    if (calculatedEndDate && calculatedEndDate !== formData.contract_end_date) {
      handleInputChange({
        target: { name: 'contract_end_date', value: calculatedEndDate }
      });
    }
  }, [formData.start_date, formData.contract_duration]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-almet-bali-hai dark:border-gray-700 pb-3">
        <div>
          <h2 className={`text-lg font-bold ${textPrimary}`}>
            Job Information
          </h2>
   
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs px-3 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire rounded-full font-medium">
            Step 2 of 4
          </div>
          {isEditMode && (
            <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              Edit Mode
            </div>
          )}
        </div>
      </div>

      {/* Edit Mode Current Values Notice */}
      {isEditMode && (departmentWarning || unitWarning) && (
        <div className={`p-4 ${bgSuccess} border border-green-200 dark:border-green-800 rounded-lg`}>
          <div className="flex items-start">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                Current Organization Values Preserved
              </h4>
              <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                {departmentWarning && formData.department_name && (
                  <div className="flex items-center">
                    <Building size={14} className="mr-2" />
                    <span><strong>Department:</strong> {formData.department_name}</span>
                  </div>
                )}
                {unitWarning && formData.unit_name && (
                  <div className="flex items-center">
                    <Users size={14} className="mr-2" />
                    <span><strong>Unit:</strong> {formData.unit_name}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                These values are maintained from the current employee record and will appear in the dropdowns with "(Current)" labels.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Employment Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-almet-steel-blue" />
          <h3 className={`text-sm font-semibold ${textSecondary}`}>
            Employment Timeline
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            label="Joining Date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleInputChange}
            type="date"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.start_date}
            helpText="Employee's first day of work"
          />

          {/* UPDATED: Contract Duration with API options */}
          <FormField
            label="Contract Duration"
            name="contract_duration"
            value={formData.contract_duration || "PERMANENT"}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
            options={getContractDurationOptions()}
            validationError={validationErrors.contract_duration}
            helpText="Type of employment contract"
            loading={loading.contractConfigs}
            placeholder={getPlaceholder('contractConfigs')}
            searchable={true}
            showDescriptions={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            label="Contract Renewal Date"
            name="contract_start_date"
            value={formData.contract_start_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.contract_start_date}
            helpText="If different from start date"
            min={formData.start_date}
          />

          <FormField
            label="Contract End Date"
            name="end_date"
            value={formData.end_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.end_date}
            helpText="For fixed-term contracts only"
            min={getMinEndDate()}
            disabled={formData.contract_duration === 'PERMANENT'}
          />
        </div>

        {/* Auto-calculated contract end date display */}
        {formData.contract_duration !== 'PERMANENT' && calculateContractEndDate() && (
          <div className={`p-3 ${bgInfo} border border-almet-sapphire/20 dark:border-blue-800 rounded-lg`}>
            <div className="flex items-center">
              <Info className="h-4 w-4 text-almet-sapphire mr-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-almet-sapphire font-medium">
                  Auto-calculated Contract End: {new Date(calculateContractEndDate()).toLocaleDateString()}
                </span>
                <p className="text-xs text-almet-sapphire/80 mt-1">
                  Based on start date and contract duration
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contract Config Info */}
        {formData.contract_duration && formData.contract_duration !== 'PERMANENT' && (
          (() => {
            const selectedConfig = contractConfigs.find(c => c.contract_type === formData.contract_duration);
            return selectedConfig ? (
              <div className={`p-3 ${bgInfo} border border-blue-200 dark:border-blue-800 rounded-lg`}>
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <div className="font-medium">{selectedConfig.display_name} Details:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    
                      <div>
                        <span className="font-medium">Probation:</span> {selectedConfig.probation_days} days
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Total until Active:</span> {selectedConfig.total_days_until_active} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()
        )}
      </div>

      {/* Organizational Structure Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Building size={16} className="text-almet-san-juan" />
          <h3 className={`text-sm font-semibold ${textSecondary}`}>
            Organizational Structure
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* FIXED: Company Field */}
          <FormField
            label="Company"
            name="business_function"
            value={formData.business_function || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Building size={14} className={textMuted} />}
            options={getBusinessFunctionOptions()}
            validationError={validationErrors.business_function}
            helpText="Top-level organizational unit"
            loading={loading.businessFunctions}
            placeholder={loading.businessFunctions ? "Loading..." : "Select Company"}
            searchable={true}
            showCodes={true}
            showColors={true}
          />

          {/* FIXED: Department Field */}
          <FormField
            label="Department"
            name="department"
            value={formData.department || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Users size={14} className={textMuted} />}
            options={getDepartmentOptions()}
            validationError={validationErrors.department}
            helpText="Department within Company"
            disabled={!formData.business_function}
            loading={loading.departments}
            placeholder={getPlaceholder('departments', 'Company', formData.business_function)}
            searchable={true}
            showColors={true}
          />

          {/* FIXED: Unit Field */}
          <FormField
            label="Unit"
            name="unit"
            value={formData.unit || ""}
            onChange={handleInputChange}
            type="select"
            icon={<Users size={14} className={textMuted} />}
            options={getUnitOptions()}
            validationError={validationErrors.unit}
            helpText="Specific unit (optional)"
            disabled={!formData.department}
            loading={loading.units}
            placeholder={getPlaceholder('units', 'Department', formData.department)}
            clearable={true}
            searchable={true}
            showColors={true}
          />
        </div>

        {/* Organization hierarchy warnings */}
        {!hasOptions(departments) && formData.business_function && !loading.departments && (
          <div className={`p-3 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-lg`}>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  No departments found for this Company
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Please contact your system administrator to add departments for this Company.
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasOptions(units) && formData.department && !loading.units && (
          <div className={`p-3 ${bgInfo} border border-blue-200 dark:border-blue-800 rounded-lg`}>
            <div className="flex items-center">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  No units found for this department
                </span>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  This is optional. You can leave the unit field empty if none are available.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Briefcase size={16} className="text-almet-steel-blue" />
          <div className="flex-1">
            <h3 className={`text-sm font-semibold ${textSecondary}`}>
              Position Details
            </h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* FIXED: Job Function Field */}
          <FormField
            label="Job Function"
            name="job_function"
            value={formData.job_function || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={getJobFunctionOptions()}
            validationError={validationErrors.job_function}
            helpText="Functional area of work"
            loading={loading.jobFunctions}
            placeholder={loading.jobFunctions ? "Loading..." : "Select job function"}
            searchable={true}
            showColors={true}
          />

          <FormField
            label="Job Title"
            name="job_title"
            value={formData.job_title || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter specific job title"
            icon={<Briefcase size={14} className={textMuted} />}
            validationError={validationErrors.job_title}
            helpText="Specific position title"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* FIXED: Position Group Field */}
          <FormField
            label="Position Group"
            name="position_group"
            value={formData.position_group || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} className={textMuted} />}
            options={getPositionGroupOptions()}
            validationError={validationErrors.position_group}
            helpText="Determines available grading levels"
            loading={loading.positionGroups}
            placeholder={loading.positionGroups ? "Loading..." : "Select position group"}
            searchable={true}
            showDescriptions={true}
            showColors={true}
          />

          {/* FIXED: Grading Level Field */}
          <FormField
            label="Grading Level"
            name="grading_level"
            value={formData.grading_level || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} className={textMuted} />}
            options={getGradingLevelOptions()}
            validationError={validationErrors.grading_level}
            helpText="Salary and benefits grade"
            disabled={!formData.position_group || loadingGradingLevels}
            loading={loadingGradingLevels}
            placeholder={getPlaceholder('gradeOptions', 'Position Group', formData.position_group)}
            searchable={true}
            showDescriptions={true}
            showColors={true}
          />
        </div>

        {/* Selected Grading Level Information */}
        {formData.grading_level && gradeOptions.length > 0 && (
          <div className={`p-4 ${bgSuccess} border border-green-200 dark:border-green-800 rounded-lg`}>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                  Selected Grading Level
                </h4>
                {(() => {
                  const selectedGrade = gradeOptions.find(g => g.value === formData.grading_level);
                  return selectedGrade ? (
                    <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Code:</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs">
                          {selectedGrade.label}
                        </span>
                      </div>
                      {selectedGrade.description && (
                        <div>
                          <span className="font-medium">Description:</span> {selectedGrade.description}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* No grading levels warning */}
        {!hasOptions(gradeOptions) && formData.position_group && !loadingGradingLevels && (
          <div className={`p-3 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-lg`}>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  No grading levels found for this position group
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Please contact your system administrator to configure grading levels for this position group.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading States Summary */}
      {Object.values(loading || {}).some(Boolean) && (
        <div className="flex items-center justify-center p-4 bg-almet-mystic dark:bg-gray-800 rounded-lg border border-almet-bali-hai dark:border-gray-700">
          <Loader className="animate-spin h-5 w-5 text-almet-sapphire mr-3" />
          <div className="text-center">
            <span className={`text-sm font-medium ${textSecondary}`}>
              Loading reference data...
            </span>
            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 justify-center">
              {loading.businessFunctions && <span>Companys</span>}
              {loading.departments && <span>Departments</span>}
              {loading.units && <span>Units</span>}
              {loading.jobFunctions && <span>Job Functions</span>}
              {loading.positionGroups && <span>Position Groups</span>}
              {loading.contractConfigs && <span>Contract Types</span>}
              {loadingGradingLevels && <span>Grading Levels</span>}
            </div>
          </div>
        </div>
      )}

      {/* Form Completion Status */}
      <div className="pt-4 border-t border-almet-bali-hai dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              Object.keys(validationErrors).length === 0 
                ? 'bg-green-500' 
                : 'bg-amber-500'
            }`} />
            <span className={`text-sm ${textMuted}`}>
              {Object.keys(validationErrors).length === 0 
                ? 'All required fields completed' 
                : `${Object.keys(validationErrors).length} field(s) need attention`
              }
            </span>
          </div>
          
          {isEditMode && (
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Changes will be saved when you submit the form
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormStep2JobInfo;