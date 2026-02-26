// src/components/headcount/VacantPositionModal.jsx - Simple Version without Loading Loop
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Building, Users, Briefcase, Star, MapPin, FileText } from 'lucide-react';
import SearchableDropdown from '../common/SearchableDropdown';
import CustomCheckbox from '../common/CustomCheckbox';
import { useVacantPositions } from '../../hooks/useVacantPositions';
import { useToast } from "../common/Toast";

const VacantPositionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = 'create',
  initialData = null,
  darkMode = false 
}) => {
  const { showError, showWarning } = useToast();
  
  const {
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    employees,
    currentGradingLevels,
    loading: hookLoading,
    fetchReferenceData,
    fetchDepartmentsByBusinessFunction,
    fetchUnitsByDepartment,
    fetchGradingLevelsForPositionGroup
  } = useVacantPositions();

  // Form state
  const [formData, setFormData] = useState({
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
    position_group: '',
    job_title: '',
    grading_level: '',
    reporting_to: '',
    is_visible_in_org_chart: true,
    include_in_headcount: true,
    notes: ''
  });

  // UI state
  const [cascadingLoading, setCascadingLoading] = useState({
    departments: false,
    units: false,
    gradingLevels: false
  });

  const [filteredData, setFilteredData] = useState({
    departments: [],
    units: [],
    gradingLevels: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Theme styles
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgModal = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const bgSection = darkMode ? "bg-gray-700/30" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const borderLight = darkMode ? "border-gray-700" : "border-gray-200";

  // Simple initialization without useCallback
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!isOpen || isInitialized) return;


      try {
        // Load reference data
        await fetchReferenceData();

        if (!isMounted) return;

        if (mode === 'edit' && initialData) {
        
          
          // Extract IDs from flattened structure
          const businessFunctionId = initialData.business_function_id;
          const departmentId = initialData.department_id;
          const unitId = initialData.unit_id || null;
          const jobFunctionId = initialData.job_function_id;
          const positionGroupId = initialData.position_group_id;
          
          // Find reporting manager
          let reportingToId = null;
          if (initialData.reporting_to_hc_number ) {
          
              reportingToId = initialData.reporting_to_id;
            
          }

          console.log('Extracted IDs:', {
            businessFunctionId,
            departmentId,
            unitId,
            jobFunctionId,
            positionGroupId,
            reportingToId
          });

          // Load cascading data sequentially
          let loadedDepartments = [];
          let loadedUnits = [];

          // Load departments
          if (businessFunctionId) {
            try {
              loadedDepartments = await fetchDepartmentsByBusinessFunction(businessFunctionId);
              if (isMounted) {
                setFilteredData(prev => ({ ...prev, departments: loadedDepartments }));
              }
            } catch (error) {
              console.error('Failed to load departments:', error);
            }
          }

          // Load units
          if (departmentId && isMounted) {
            try {
              loadedUnits = await fetchUnitsByDepartment(departmentId);
              if (isMounted) {
                setFilteredData(prev => ({ ...prev, units: loadedUnits }));
              }
            } catch (error) {
              console.error('Failed to load units:', error);
            }
          }

          // Load grading levels
          if (positionGroupId && isMounted) {
            try {
              await fetchGradingLevelsForPositionGroup(positionGroupId);
            } catch (error) {
              console.error('Failed to load grading levels:', error);
            }
          }

          // Set form data
          if (isMounted) {
            const newFormData = {
              business_function: businessFunctionId ? String(businessFunctionId) : '',
              department: departmentId ? String(departmentId) : '',
              unit: unitId ? String(unitId) : '',
              job_function: jobFunctionId ? String(jobFunctionId) : '',
              position_group: positionGroupId ? String(positionGroupId) : '',
              job_title: initialData.job_title || '',
              grading_level: initialData.grading_level || '',
              reporting_to: reportingToId ? String(reportingToId) : '',
              is_visible_in_org_chart: initialData.is_visible_in_org_chart !== false,
              include_in_headcount: initialData.include_in_headcount !== false,
              notes: initialData.notes || ''
            };

            console.log('Setting form data:', newFormData);
            setFormData(newFormData);
          }

        } else {
    
          if (isMounted) {
            setFormData({
              business_function: '',
              department: '',
              unit: '',
              job_function: '',
              position_group: '',
              job_title: '',
              grading_level: '',
              reporting_to: '',
              is_visible_in_org_chart: true,
              include_in_headcount: true,
              notes: ''
            });

            setFilteredData({
              departments: departments || [],
              units: units || [],
              gradingLevels: []
            });
          }
        }

        if (isMounted) {
          setIsInitialized(true);
        }

      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          showError('Failed to load form data');
        }
      }
    };

    if (isOpen) {
      initializeData();
    } else {
      setIsInitialized(false);
      setFilteredData({ departments: [], units: [], gradingLevels: [] });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]); // Only depend on isOpen

// Replace the existing option mappings in your VacantPositionModal component:

// Dropdown options with null filtering
const businessFunctionOptions = businessFunctions?.filter(bf => bf.id != null).map(bf => ({
  value: String(bf.id),
  label: `${bf.name} (${bf.code})`,
  description: `${bf.employee_count || 0} employees`
})) || [];

const departmentOptions = filteredData.departments?.filter(dept => dept.id != null).map(dept => ({
  value: String(dept.id),
  label: dept.name,
  description: `${dept.employee_count || 0} employees`,
  subtitle: dept.business_function_name
})) || [];

const unitOptions = filteredData.units?.filter(unit => unit.id != null).map(unit => ({
  value: String(unit.id),
  label: unit.name,
  description: `${unit.employee_count || 0} employees`,
  subtitle: unit.department_name
})) || [];

const jobFunctionOptions = jobFunctions?.filter(jf => jf.id != null).map(jf => ({
  value: String(jf.id),
  label: jf.name,
  description: jf.description || `${jf.employee_count || 0} employees`
})) || [];

const positionGroupOptions = positionGroups?.filter(pg => pg.id != null).map(pg => ({
  value: String(pg.id),
  label: `${pg.display_name || pg.name}`,
  description: `Level ${pg.hierarchy_level} • ${pg.employee_count || 0} employees`
})) || [];

const gradingLevelOptions = currentGradingLevels?.filter(gl => gl.code != null).map(gl => ({
  value: gl.code,
  label: gl.display,
  description: gl.full_name
})) || [];

const employeeOptions = employees?.filter(emp => 
  emp.id != null && (!initialData || emp.id !== initialData.id)
).map(emp => ({
  value: String(emp.id),
  label: emp.name,
  description: `${emp.employee_id} • ${emp.job_title}`,
  subtitle: emp.department_name
})) || [];

  // Handle cascading changes during form interaction
  const handleBusinessFunctionChange = async (value) => {
    handleInputChange('business_function', value);
    
    if (value) {
      setCascadingLoading(prev => ({ ...prev, departments: true }));
      try {
        const deps = await fetchDepartmentsByBusinessFunction(value);
        setFilteredData(prev => ({ ...prev, departments: deps, units: [] }));
      } catch (error) {
        console.error('Failed to load departments:', error);
        showError('Failed to load departments');
      } finally {
        setCascadingLoading(prev => ({ ...prev, departments: false }));
      }
    } else {
      setFilteredData(prev => ({ ...prev, departments: departments || [], units: [] }));
    }
  };

  const handleDepartmentChange = async (value) => {
    handleInputChange('department', value);
    
    if (value) {
      setCascadingLoading(prev => ({ ...prev, units: true }));
      try {
        const unitsData = await fetchUnitsByDepartment(value);
        setFilteredData(prev => ({ ...prev, units: unitsData }));
      } catch (error) {
        console.error('Failed to load units:', error);
        showError('Failed to load units');
      } finally {
        setCascadingLoading(prev => ({ ...prev, units: false }));
      }
    } else {
      setFilteredData(prev => ({ ...prev, units: [] }));
    }
  };

  const handlePositionGroupChange = async (value) => {
    handleInputChange('position_group', value);
    
    if (value) {
      setCascadingLoading(prev => ({ ...prev, gradingLevels: true }));
      try {
        await fetchGradingLevelsForPositionGroup(value);
      } catch (error) {
        console.error('Failed to load grading levels:', error);
        showError('Failed to load grading levels');
      } finally {
        setCascadingLoading(prev => ({ ...prev, gradingLevels: false }));
      }
    }
  };

  // Generic input change handler
  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear dependent fields
      if (field === 'business_function') {
        newData.department = '';
        newData.unit = '';
      } else if (field === 'department') {
        newData.unit = '';
      } else if (field === 'position_group') {
        newData.grading_level = '';
      }
      
      return newData;
    });
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.business_function) newErrors.business_function = 'Company is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.job_function) newErrors.job_function = 'Job function is required';
    if (!formData.position_group) newErrors.position_group = 'Hierarchy is required';
    if (!formData.job_title?.trim()) newErrors.job_title = 'Job title is required';
    if (!formData.grading_level) newErrors.grading_level = 'Grading level is required';

    if (formData.job_title && formData.job_title.length > 200) {
      newErrors.job_title = 'Job title must be 200 characters or less';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        business_function: parseInt(formData.business_function),
        department: parseInt(formData.department),
        unit: formData.unit ? parseInt(formData.unit) : null,
        job_function: parseInt(formData.job_function),
        position_group: parseInt(formData.position_group),
        job_title: formData.job_title.trim(),
        grading_level: formData.grading_level,
        reporting_to: formData.reporting_to ? parseInt(formData.reporting_to) : null,
        is_visible_in_org_chart: formData.is_visible_in_org_chart,
        include_in_headcount: formData.include_in_headcount,
        notes: formData.notes.trim()
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      if (error.response?.data) {
        const apiErrors = {};
        Object.keys(error.response.data).forEach(key => {
          if (Array.isArray(error.response.data[key])) {
            apiErrors[key] = error.response.data[key][0];
          } else {
            apiErrors[key] = error.response.data[key];
          }
        });
        setErrors(apiErrors);
        showError('Please correct the form errors and try again');
      } else {
        showError(error.message || 'Failed to save position');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Show loading state only during initial load
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`${bgModal} rounded-xl shadow-2xl w-full max-w-md p-8 text-center border ${borderLight}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-almet-sapphire border-t-transparent mx-auto mb-4"></div>
          <p className={`${textSecondary} text-sm`}>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${bgModal} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border ${borderLight}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderLight} bg-gradient-to-r from-almet-sapphire/5 to-almet-steel-blue/5`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-almet-sapphire/10 to-almet-steel-blue/10 rounded-lg">
              <Briefcase className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h2 className={`text-base font-semibold ${textPrimary}`}>
                {mode === 'create' ? 'Create Vacant Position' : 'Edit Vacant Position'}
              </h2>
              <p className={`text-xs ${textMuted}`}>
                {mode === 'create' ? 'Add a new vacant position to your organization' : 'Update position details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textMuted}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-5 space-y-6">

            {/* Position Information Section */}
            <section className={`${bgSection} rounded-lg p-4`}>
              <div className="flex items-center mb-4">
                <Star className="w-4 h-4 text-almet-sapphire mr-2" />
                <h3 className={`text-base font-semibold ${textPrimary}`}>Position Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hierarchy */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Hierarchy *
                  </label>
                  <SearchableDropdown
                    options={positionGroupOptions}
                    value={formData.position_group}
                    onChange={handlePositionGroupChange}
                    placeholder="Select Hierarchy"
                    searchPlaceholder="Search Hierarchys..."
                    error={!!errors.position_group}
                    darkMode={darkMode}
                     allowUncheck={true}
                    icon={<Star size={12} />}
                    loading={false}
                    allowClear={true}
                  />
                  {errors.position_group && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.position_group}
                    </p>
                  )}
                </div>

                {/* Grading Level */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Grading Level *
                  </label>
                  <SearchableDropdown
                    options={gradingLevelOptions}
                    value={formData.grading_level}
                    onChange={(value) => handleInputChange('grading_level', value)}
                    placeholder={formData.position_group ? "Select Grading Level" : "Select Hierarchy first"}
                    searchPlaceholder="Search grading levels..."
                    error={!!errors.grading_level}
                    darkMode={darkMode}
                     allowUncheck={true}
                    icon={<Briefcase size={12} />}
                    disabled={!formData.position_group}
                    loading={cascadingLoading.gradingLevels}
                    allowClear={true}
                    emptyMessage={formData.position_group ? "No grading levels available" : "Select a Hierarchy first"}
                  />
                  {errors.grading_level && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.grading_level}
                    </p>
                  )}
                  {formData.position_group && !cascadingLoading.gradingLevels && gradingLevelOptions.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      No grading levels found for this Hierarchy
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="Enter job title"
                    maxLength={200}
                    className={`w-full px-3 py-2 text-xs border outline-0 ${errors.job_title ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire transition-colors text-sm`}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.job_title ? (
                      <p className="text-xs text-red-600 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.job_title}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${textMuted}`}>
                      {formData.job_title.length}/200
                    </span>
                  </div>
                </div>

                {/* Reporting To */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Reports To
                  </label>
                  <SearchableDropdown
                    options={employeeOptions}
                    value={formData.reporting_to}
                    onChange={(value) => handleInputChange('reporting_to', value)}
                    placeholder="Select Manager (Optional)"
                    searchPlaceholder="Search employees..."
                    darkMode={darkMode}
                     allowUncheck={true}
                    icon={<Users size={12} />}
                    loading={false}
                    allowClear={true}
                    maxHeight="max-h-40"
                  />
                </div>
              </div>
            </section>

            {/* Organizational Structure Section */}
            <section className={`${bgSection} rounded-lg p-4`}>
              <div className="flex items-center mb-4">
                <Building className="w-4 h-4 text-almet-sapphire mr-2" />
                <h3 className={`text-base font-semibold ${textPrimary}`}>Organizational Structure</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Company *
                  </label>
                  <SearchableDropdown
                    options={businessFunctionOptions}
                    value={formData.business_function}
                    onChange={handleBusinessFunctionChange}
                    placeholder="Select Company"
                    searchPlaceholder="Search Companys..."
                    error={!!errors.business_function}
                    darkMode={darkMode}
                     allowUncheck={true}
                    icon={<Building size={12} />}
                    loading={false}
                    allowClear={true}
                  />
                  {errors.business_function && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.business_function}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Department *
                  </label>
                  <SearchableDropdown
                    options={departmentOptions}
                    value={formData.department}
                    onChange={handleDepartmentChange}
                    placeholder="Select Department"
                    searchPlaceholder="Search departments..."
                    error={!!errors.department}
                    darkMode={darkMode}
                     allowUncheck={true}
                    icon={<MapPin size={12} />}
                    disabled={!formData.business_function}
                    loading={cascadingLoading.departments}
                    allowClear={true}
                  />
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Unit
                  </label>
                  <SearchableDropdown
                    options={unitOptions}
                    value={formData.unit}
                    onChange={(value) => handleInputChange('unit', value)}
                    placeholder="Select Unit (Optional)"
                    searchPlaceholder="Search units..."
                    darkMode={darkMode}
                     allowUncheck={true}
                    icon={<Building size={12} />}
                    disabled={!formData.department}
                    loading={cascadingLoading.units}
                    allowClear={true}
                  />
                </div>

                {/* Job Function */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Job Function *
                  </label>
                  <SearchableDropdown
                    options={jobFunctionOptions}
                    value={formData.job_function}
                    onChange={(value) => handleInputChange('job_function', value)}
                    placeholder="Select Job Function"
                    searchPlaceholder="Search job functions..."
                    error={!!errors.job_function}
                    darkMode={darkMode}
                     allowUncheck={true}
                    icon={<Briefcase size={12} />}
                    loading={false}
                    allowClear={true}
                  />
                  {errors.job_function && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.job_function}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Settings Section */}
            <section className={`${bgSection} rounded-lg p-4`}>
              <div className="flex items-center mb-4">
                <FileText className="w-4 h-4 text-almet-sapphire mr-2" />
                <h3 className={`text-base font-semibold ${textPrimary}`}>Additional Settings</h3>
              </div>
              
              <div className="space-y-4">
                {/* Custom Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <CustomCheckbox
                      checked={formData.is_visible_in_org_chart}
                      onChange={() => handleCheckboxChange('is_visible_in_org_chart')}
                      className="mt-0.5"
                      darkMode={darkMode}
                    />
                    <div>
                      <label 
                        onClick={() => handleCheckboxChange('is_visible_in_org_chart')}
                        className={`text-sm font-medium ${textPrimary} cursor-pointer`}
                      >
                        Visible in organizational chart
                      </label>
                      <p className={`text-xs ${textMuted} mt-0.5`}>
                        Position will be displayed in the organization chart
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CustomCheckbox
                      checked={formData.include_in_headcount}
                      onChange={() => handleCheckboxChange('include_in_headcount')}
                      className="mt-0.5"
                      darkMode={darkMode}
                    />
                    <div>
                      <label 
                        onClick={() => handleCheckboxChange('include_in_headcount')}
                        className={`text-sm font-medium ${textPrimary} cursor-pointer`}
                      >
                        Include in headcount calculations
                      </label>
                      <p className={`text-xs ${textMuted} mt-0.5`}>
                        Position will be counted in headcount reports
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1.5`}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this position..."
                    maxLength={1000}
                    rows={3}
                    className={`w-full p-3 border outline-0 ${errors.notes ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire transition-colors text-sm resize-none`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.notes ? (
                      <p className="text-xs text-red-600 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.notes}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${textMuted}`}>
                      {formData.notes.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 p-5 border-t ${borderLight} bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-700/30 dark:to-gray-800/20`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium border ${borderColor} rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-5 py-2 text-sm font-medium bg-gradient-to-r from-almet-sapphire to-almet-steel-blue text-white rounded-lg hover:from-almet-sapphire/90 hover:to-almet-steel-blue/90 focus:ring-2 focus:ring-almet-sapphire/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save size={14} className="mr-2" />
                  {mode === 'create' ? 'Create Position' : 'Update Position'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacantPositionModal;