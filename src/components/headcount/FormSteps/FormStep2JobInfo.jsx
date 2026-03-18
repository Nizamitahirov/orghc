// src/components/headcount/FormSteps/FormStep2JobInfo.jsx
import { useState, useEffect } from "react";
import { Briefcase, Calendar, Info, Building, Users, Award, AlertCircle, Loader, CheckCircle } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

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
  employmentTypes = [],          // ← YENİ
  loadingGradingLevels = false,
  loading = {},
  isEditMode = false
}) => {
  const { darkMode } = useTheme();
  const [departmentWarning, setDepartmentWarning] = useState(false);
  const [unitWarning, setUnitWarning] = useState(false);

  const textPrimary   = darkMode ? "text-gray-100"  : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300"  : "text-gray-700";
  const textMuted     = darkMode ? "text-gray-400"  : "text-gray-500";
  const bgCard        = darkMode ? "bg-gray-800"    : "bg-white";
  const borderColor   = darkMode ? "border-gray-700": "border-gray-200";

  // ── helpers ──────────────────────────────────────────────────────────────

  const hasOptions = (opts) => Array.isArray(opts) && opts.length > 0;

  const getContractDurationOptions = () => {
    if (!hasOptions(contractConfigs)) {
      return [
        { value: "PERMANENT",  label: "Permanent Contract" },
        { value: "3_MONTHS",   label: "3 Months Fixed" },
        { value: "6_MONTHS",   label: "6 Months Fixed" },
        { value: "1_YEAR",     label: "1 Year Fixed" },
        { value: "2_YEARS",    label: "2 Years Fixed" },
        { value: "3_YEARS",    label: "3 Years Fixed" },
      ];
    }
    return contractConfigs
      .filter(c => c.is_active !== false)
      .map(c => ({
        value: c.contract_type,
        label: c.display_name,
        description: `Probation: ${c.probation_days} days`,
      }));
  };

  // Employment Types dropdown options
  const getEmploymentTypeOptions = () => {
    if (!hasOptions(employmentTypes)) return [];
    return employmentTypes
      .filter(et => et.is_active !== false)
      .map(et => ({
        value: et.id?.toString(),
        label: et.name,
        code:  et.code,
        color: et.color,
        description: et.description || et.code,
      }));
  };

  const withCurrentValue = (opts, idField, nameField, loadingKey) => {
    const base = Array.isArray(opts) ? [...opts] : [];
    const id   = formData[idField];
    const name = formData[nameField];
    if (isEditMode && id && name) {
      const exists = base.find(o => o.value === id?.toString());
      if (!exists && !loading[loadingKey]) {
        base.unshift({ value: id?.toString(), label: `${name} (Current)`, isCurrent: true, color: '#059669' });
      }
    }
    return base;
  };

  const getMinEndDate = () => {
    if (!formData.start_date) return "";
    const d = new Date(formData.start_date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const calculateContractEndDate = () => {
    if (!formData.contract_start_date || formData.contract_duration === 'PERMANENT') return null;
    const d = new Date(formData.contract_start_date);
    switch (formData.contract_duration) {
      case '1_MONTH':  d.setMonth(d.getMonth() + 1);    break;
      case '3_MONTHS': d.setMonth(d.getMonth() + 3);    break;
      case '6_MONTHS': d.setMonth(d.getMonth() + 6);    break;
      case '1_YEAR':   d.setFullYear(d.getFullYear()+1); break;
      case '2_YEARS':  d.setFullYear(d.getFullYear()+2); break;
      case '3_YEARS':  d.setFullYear(d.getFullYear()+3); break;
      default: return null;
    }
    return d.toISOString().split('T')[0];
  };

  const getPlaceholder = (type, dep = null, depVal = null) => {
    if (dep && !depVal) return `Select ${dep} first`;
    if (loading[type])  return "Loading...";
    const map = {
      departments:      !hasOptions(departments) && formData.business_function ? "No departments available"   : "Select department",
      units:            !hasOptions(units)        && formData.department        ? "No units available"         : "Select unit (optional)",
      gradeOptions:     !hasOptions(gradeOptions) && formData.position_group   ? "No grading levels available": "Select grading level",
      contractConfigs:  !hasOptions(contractConfigs)                            ? "No contract types available": "Select contract duration",
      employmentTypes:  !hasOptions(employmentTypes)                            ? "No types available"         : "Select employment type",
    };
    return map[type] || `Select ${type}`;
  };

  useEffect(() => {
    const calc = calculateContractEndDate();
    if (calc && calc !== formData.contract_end_date) {
      handleInputChange({ target: { name: 'contract_end_date', value: calc } });
    }
  }, [formData.contract_start_date, formData.contract_duration]);

  const selectedConfig = contractConfigs.find(c => c.contract_type === formData.contract_duration);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-base font-semibold ${textPrimary}`}>Job Information</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 bg-almet-sapphire/10 text-almet-sapphire rounded-full font-medium">
            Step 2 of 4
          </span>
          {isEditMode && (
            <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              Edit Mode
            </span>
          )}
        </div>
      </div>

      {/* Current value notice */}
      {isEditMode && (departmentWarning || unitWarning) && (
        <div className={`${bgCard} border border-green-200 dark:border-green-800 rounded-lg p-2.5`}>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                Current Organization Values Preserved
              </p>
              <div className="text-[11px] text-green-700 dark:text-green-400 space-y-0.5">
                {departmentWarning && formData.department_name && (
                  <div className="flex items-center gap-1.5"><Building size={12} /><span><strong>Department:</strong> {formData.department_name}</span></div>
                )}
                {unitWarning && formData.unit_name && (
                  <div className="flex items-center gap-1.5"><Users size={12} /><span><strong>Unit:</strong> {formData.unit_name}</span></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. EMPLOYMENT TIMELINE ────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-almet-sapphire" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>Employment Timeline</h3>
        </div>

        {/* Row 1: Joining Date + Hiring Date */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Joining Date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleInputChange}
            type="date"
            required
            icon={<Calendar size={14} />}
            validationError={validationErrors.start_date}
            helpText="Employee's first day of work"
          />
          <FormField
            label="Hiring Date"
            name="hiring_date"
            value={formData.hiring_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} />}
            validationError={validationErrors.hiring_date}
            helpText="Official offer acceptance / hire date (may differ from joining date)"
          />
        </div>

        {/* Row 2: Contract Duration + Employment Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Contract Duration"
            name="contract_duration"
            value={formData.contract_duration || "PERMANENT"}
            onChange={handleInputChange}
            type="select"
            required
            icon={<Calendar size={14} />}
            options={getContractDurationOptions()}
            validationError={validationErrors.contract_duration}
            helpText="Type of employment contract"
            loading={loading.contractConfigs}
            placeholder={getPlaceholder('contractConfigs')}
            searchable
            showDescriptions
          />
          <FormField
            label="Employment Type"
            name="employment_type"
            value={formData.employment_type?.toString() || ""}
            onChange={handleInputChange}
            type="select"
            icon={<Briefcase size={14} />}
            options={getEmploymentTypeOptions()}
            validationError={validationErrors.employment_type}
            helpText="Full-time, Part-time, Contract, etc."
            loading={loading.employmentTypes}
            placeholder={getPlaceholder('employmentTypes')}
            searchable
            showDescriptions
            showColors
            clearable
          />
        </div>

        {/* Row 3: Contract Renewal + Contract End */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Contract Renewal Date"
            name="contract_start_date"
            value={formData.contract_start_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} />}
            validationError={validationErrors.contract_start_date}
            helpText="If different from joining date"
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

        {/* Auto-calculated end date banner */}
        {formData.contract_duration !== 'PERMANENT' && calculateContractEndDate() && (
          <div className={`${bgCard} border border-blue-200 dark:border-blue-800 rounded-lg p-2.5`}>
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                Auto-calculated Contract End: {new Date(calculateContractEndDate()).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Probation info banner */}
        {selectedConfig && formData.contract_duration !== 'PERMANENT' && (
          <div className={`${bgCard} border border-blue-200 dark:border-blue-800 rounded-lg p-2.5`}>
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Probation:</strong> {selectedConfig.probation_days} days
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. ORGANIZATIONAL STRUCTURE ──────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Building size={14} className="text-almet-steel-blue" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>Organizational Structure</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          <FormField
            label="Company"
            name="business_function"
            value={formData.business_function || ""}
            onChange={handleInputChange}
            type="select"
            required
            icon={<Building size={14} />}
            options={withCurrentValue(businessFunctions, 'business_function', 'business_function_name', 'businessFunctions')}
            validationError={validationErrors.business_function}
            helpText="Top-level organizational unit"
            loading={loading.businessFunctions}
            placeholder={loading.businessFunctions ? "Loading..." : "Select Company"}
            searchable
            showCodes
            showColors
          />
          <FormField
            label="Department"
            name="department"
            value={formData.department || ""}
            onChange={handleInputChange}
            type="select"
            required
            icon={<Users size={14} />}
            options={withCurrentValue(departments, 'department', 'department_name', 'departments')}
            validationError={validationErrors.department}
            helpText="Department within Company"
            disabled={!formData.business_function}
            loading={loading.departments}
            placeholder={getPlaceholder('departments', 'Company', formData.business_function)}
            searchable
            showColors
          />
          <FormField
            label="Unit"
            name="unit"
            value={formData.unit || ""}
            onChange={handleInputChange}
            type="select"
            icon={<Users size={14} />}
            options={withCurrentValue(units, 'unit', 'unit_name', 'units')}
            validationError={validationErrors.unit}
            helpText="Specific unit (optional)"
            disabled={!formData.department}
            loading={loading.units}
            placeholder={getPlaceholder('units', 'Department', formData.department)}
            clearable
            searchable
            showColors
          />
        </div>

        {!hasOptions(departments) && formData.business_function && !loading.departments && (
          <div className={`${bgCard} border border-amber-200 dark:border-amber-800 rounded-lg p-2.5`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                No departments found for this Company. Please contact your system administrator.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. POSITION DETAILS ──────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-almet-san-juan" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>Position Details</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <FormField
            label="Job Function"
            name="job_function"
            value={formData.job_function || ""}
            onChange={handleInputChange}
            type="select"
            required
            icon={<Briefcase size={14} />}
            options={withCurrentValue(jobFunctions, 'job_function', 'job_function_name', 'jobFunctions')}
            validationError={validationErrors.job_function}
            helpText="Functional area of work"
            loading={loading.jobFunctions}
            placeholder={loading.jobFunctions ? "Loading..." : "Select job function"}
            searchable
            showColors
          />
          <FormField
            label="Job Title"
            name="job_title"
            value={formData.job_title || ""}
            onChange={handleInputChange}
            required
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
            required
            icon={<Award size={14} />}
            options={withCurrentValue(positionGroups, 'position_group', 'position_group_name', 'positionGroups')}
            validationError={validationErrors.position_group}
            helpText="Determines available grading levels"
            loading={loading.positionGroups}
            placeholder={loading.positionGroups ? "Loading..." : "Select position group"}
            searchable
            showDescriptions
            showColors
          />
          <FormField
            label="Grading Level"
            name="grading_level"
            value={formData.grading_level || ""}
            onChange={handleInputChange}
            type="select"
            required
            icon={<Award size={14} />}
            options={withCurrentValue(gradeOptions, 'grading_level', 'grading_level', 'gradingLevels')}
            validationError={validationErrors.grading_level}
            helpText="Salary and benefits grade"
            disabled={!formData.position_group || loadingGradingLevels}
            loading={loadingGradingLevels}
            placeholder={getPlaceholder('gradeOptions', 'Position Group', formData.position_group)}
            searchable
            showDescriptions
            showColors
          />
        </div>

        {!hasOptions(gradeOptions) && formData.position_group && !loadingGradingLevels && (
          <div className={`${bgCard} border border-amber-200 dark:border-amber-800 rounded-lg p-2.5`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                No grading levels found for this position group. Contact your system administrator.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {Object.values(loading || {}).some(Boolean) && (
        <div className={`flex items-center justify-center ${bgCard} border ${borderColor} rounded-lg p-2.5`}>
          <Loader className="animate-spin h-4 w-4 text-almet-sapphire mr-2" />
          <span className={`text-xs ${textSecondary}`}>Loading reference data...</span>
        </div>
      )}

      {/* Completion status */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${Object.keys(validationErrors).length === 0 ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className={`text-xs ${textMuted}`}>
              {Object.keys(validationErrors).length === 0
                ? 'All required fields completed'
                : `${Object.keys(validationErrors).length} field(s) need attention`}
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