// src/components/headcount/FormSteps/FormStep2JobInfo.jsx - IMPROVED UI/UX
import { useState, useEffect } from "react";
import { Briefcase, Calendar, Info, Building, Users, Award, AlertCircle, Loader, CheckCircle } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * IMPROVED JOB INFORMATION STEP
 * ✓ Professional layout
 * ✓ Optimal spacing
 * ✓ Clear visual hierarchy
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
  contractConfigs = [],
  loadingGradingLevels = false,
  loading = {},
  isEditMode = false
}) => {
  const { darkMode } = useTheme();

  const [departmentWarning, setDepartmentWarning] = useState(false);
  const [unitWarning, setUnitWarning] = useState(false);

  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Get contract duration options from API
  const getContractDurationOptions = () => {
    if (!Array.isArray(contractConfigs) || contractConfigs.length === 0) {
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
        description: `Probation: ${config.probation_days} days`
      }));
  };

  // Enhanced options with current value preservation
  const getBusinessFunctionOptions = () => {
    const baseOptions = Array.isArray(businessFunctions) ? [...businessFunctions] : [];
    
    if (isEditMode && formData.business_function && formData.business_function_name) {
      const existingOption = baseOptions.find(bf => bf.value === formData.business_function);
      if (!existingOption) {
        baseOptions.unshift({
          value: formData.business_function,
          label: `${formData.business_function_name} (Current)`,
          isCurrent: true,
          color: '#059669'
        });
      }
    }
    
    return baseOptions;
  };

  const getDepartmentOptions = () => {
    const baseOptions = Array.isArray(departments) ? [...departments] : [];
    
    if (isEditMode && formData.department && formData.department_name) {
      const existingOption = baseOptions.find(d => d.value === formData.department);
      if (!existingOption && !loading.departments) {
        baseOptions.unshift({
          value: formData.department,
          label: `${formData.department_name} (Current)`,
          isCurrent: true,
          color: '#059669'
        });
        setDepartmentWarning(true);
      } else {
        setDepartmentWarning(false);
      }
    }
    
    return baseOptions;
  };

  const getUnitOptions = () => {
    const baseOptions = Array.isArray(units) ? [...units] : [];
    
    if (isEditMode && formData.unit && formData.unit_name) {
      const existingOption = baseOptions.find(u => u.value === formData.unit);
      if (!existingOption && !loading.units) {
        baseOptions.unshift({
          value: formData.unit,
          label: `${formData.unit_name} (Current)`,
          isCurrent: true,
          color: '#059669'
        });
        setUnitWarning(true);
      } else {
        setUnitWarning(false);
      }
    }
    
    return baseOptions;
  };

  const getJobFunctionOptions = () => {
    const baseOptions = Array.isArray(jobFunctions) ? [...jobFunctions] : [];
    
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

  const getPositionGroupOptions = () => {
    const baseOptions = Array.isArray(positionGroups) ? [...positionGroups] : [];
    
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

  const getGradingLevelOptions = () => {
    const baseOptions = Array.isArray(gradeOptions) ? [...gradeOptions] : [];
    
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

  const getMinEndDate = () => {
    if (!formData.start_date) return "";
    const startDate = new Date(formData.start_date);
    startDate.setDate(startDate.getDate() + 1);
    return startDate.toISOString().split('T')[0];
  };

  const calculateContractEndDate = () => {
    if (!formData.contract_start_date || formData.contract_duration === 'PERMANENT') return null;
    
    const startDate = new Date(formData.contract_start_date);
    let endDate = new Date(startDate);
    
    switch (formData.contract_duration) {
      case '3_MONTHS':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '1_MONTH':
        endDate.setMonth(endDate.getMonth() + 1);
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

  useEffect(() => {
    const calculatedEndDate = calculateContractEndDate();
    if (calculatedEndDate && calculatedEndDate !== formData.contract_end_date) {
      handleInputChange({
        target: { name: 'contract_end_date', value: calculatedEndDate }
      });
    }
  }, [formData.start_date, formData.contract_duration]);

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-base font-semibold ${textPrimary}`}>
          Job Information
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-[10px] px-2 py-0.5 bg-almet-sapphire/10 text-almet-sapphire rounded-full font-medium">
            Step 2 of 4
          </div>
          {isEditMode && (
            <div className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              Edit Mode
            </div>
          )}
        </div>
      </div>

      {/* CURRENT VALUES NOTICE */}
      {isEditMode && (departmentWarning || unitWarning) && (
        <div className={`${bgCard} border border-green-200 dark:border-green-800 rounded-lg p-2.5`}>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                Current Organization Values Preserved
              </p>
              <div className="text-[11px] text-green-700 dark:text-green-400 space-y-0.5">
                {departmentWarning && formData.department_name && (
                  <div className="flex items-center gap-1.5">
                    <Building size={12} />
                    <span><strong>Department:</strong> {formData.department_name}</span>
                  </div>
                )}
                {unitWarning && formData.unit_name && (
                  <div className="flex items-center gap-1.5">
                    <Users size={12} />
                    <span><strong>Unit:</strong> {formData.unit_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYMENT TIMELINE */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-almet-sapphire" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>
            Employment Timeline
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Joining Date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleInputChange}
            type="date"
            required={true}
            icon={<Calendar size={14} />}
            validationError={validationErrors.start_date}
            helpText="Employee's first day of work"
          />

          <FormField
            label="Contract Duration"
            name="contract_duration"
            value={formData.contract_duration || "PERMANENT"}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Calendar size={14} />}
            options={getContractDurationOptions()}
            validationError={validationErrors.contract_duration}
            helpText="Type of employment contract"
            loading={loading.contractConfigs}
            placeholder={getPlaceholder('contractConfigs')}
            searchable={true}
            showDescriptions={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Contract Renewal Date"
            name="contract_start_date"
            value={formData.contract_start_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} />}
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
            icon={<Calendar size={14} />}
            validationError={validationErrors.end_date}
            helpText="For fixed-term contracts only"
            min={getMinEndDate()}
            disabled={formData.contract_duration === 'PERMANENT'}
          />
        </div>

        {/* Auto-calculated end date */}
        {formData.contract_duration !== 'PERMANENT' && calculateContractEndDate() && (
          <div className={`${bgCard} border border-blue-200 dark:border-blue-800 rounded-lg p-2.5`}>
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                Auto-calculated Contract End: {new Date(calculateContractEndDate()).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Contract config info */}
        {formData.contract_duration && formData.contract_duration !== 'PERMANENT' && (
          (() => {
            const selectedConfig = contractConfigs.find(c => c.contract_type === formData.contract_duration);
            return selectedConfig ? (
              <div className={`${bgCard} border border-blue-200 dark:border-blue-800 rounded-lg p-2.5`}>
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>Probation:</strong> {selectedConfig.probation_days} days
                  </span>
                </div>
              </div>
            ) : null;
          })()
        )}
      </div>

      {/* ORGANIZATIONAL STRUCTURE */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Building size={14} className="text-almet-steel-blue" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>
            Organizational Structure
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          <FormField
            label="Company"
            name="business_function"
            value={formData.business_function || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Building size={14} />}
            options={getBusinessFunctionOptions()}
            validationError={validationErrors.business_function}
            helpText="Top-level organizational unit"
            loading={loading.businessFunctions}
            placeholder={loading.businessFunctions ? "Loading..." : "Select Company"}
            searchable={true}
            showCodes={true}
            showColors={true}
          />

          <FormField
            label="Department"
            name="department"
            value={formData.department || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Users size={14} />}
            options={getDepartmentOptions()}
            validationError={validationErrors.department}
            helpText="Department within Company"
            disabled={!formData.business_function}
            loading={loading.departments}
            placeholder={getPlaceholder('departments', 'Company', formData.business_function)}
            searchable={true}
            showColors={true}
          />

          <FormField
            label="Unit"
            name="unit"
            value={formData.unit || ""}
            onChange={handleInputChange}
            type="select"
            icon={<Users size={14} />}
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

        {/* Warnings */}
        {!hasOptions(departments) && formData.business_function && !loading.departments && (
          <div className={`${bgCard} border border-amber-200 dark:border-amber-800 rounded-lg p-2.5`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">
                  No departments found for this Company
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Please contact your system administrator to add departments for this Company.
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasOptions(units) && formData.department && !loading.units && (
          <div className={`${bgCard} border border-blue-200 dark:border-blue-800 rounded-lg p-2.5`}>
            <div className="flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-0.5">
                  No units found for this department
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  This is optional. You can leave the unit field empty if none are available.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* JOB DETAILS */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-almet-san-juan" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>
            Position Details
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Job Function"
            name="job_function"
            value={formData.job_function || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} />}
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
            icon={<Briefcase size={14} />}
            validationError={validationErrors.job_title}
            helpText="Specific position title"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Position Group"
            name="position_group"
            value={formData.position_group || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} />}
            options={getPositionGroupOptions()}
            validationError={validationErrors.position_group}
            helpText="Determines available grading levels"
            loading={loading.positionGroups}
            placeholder={loading.positionGroups ? "Loading..." : "Select position group"}
            searchable={true}
            showDescriptions={true}
            showColors={true}
          />

          <FormField
            label="Grading Level"
            name="grading_level"
            value={formData.grading_level || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} />}
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

        {!hasOptions(gradeOptions) && formData.position_group && !loadingGradingLevels && (
          <div className={`${bgCard} border border-amber-200 dark:border-amber-800 rounded-lg p-2.5`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">
                  No grading levels found for this position group
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Please contact your system administrator to configure grading levels for this position group.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOADING STATES */}
      {Object.values(loading || {}).some(Boolean) && (
        <div className={`flex items-center justify-center ${bgCard} border ${borderColor} rounded-lg p-2.5`}>
          <Loader className="animate-spin h-4 w-4 text-almet-sapphire mr-2" />
          <span className={`text-xs ${textSecondary}`}>
            Loading reference data...
          </span>
        </div>
      )}

      {/* COMPLETION STATUS */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              Object.keys(validationErrors).length === 0 
                ? 'bg-green-500' 
                : 'bg-amber-500'
            }`} />
            <span className={`text-xs ${textMuted}`}>
              {Object.keys(validationErrors).length === 0 
                ? 'All required fields completed' 
                : `${Object.keys(validationErrors).length} field(s) need attention`
              }
            </span>
          </div>
          
          {isEditMode && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400">
              Changes will be saved when you submit the form
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormStep2JobInfo;