// components/jobDescription/EmployeeSelectionModal.jsx - COMPLETE with Proper Pre-selection
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserCheck, 
  ChevronDown, 
  ChevronUp,
  Search,
  AlertCircle,
  CheckCircle,
  User,
  Building,
  Briefcase,
  Target,
  Phone,
  Mail,
  UserX
} from 'lucide-react';
import CustomCheckbox from '../common/CustomCheckbox';

const EmployeeSelectionModal = ({
  isOpen,
  onClose,
  eligibleEmployees = [],
  jobCriteria = {},
  onEmployeeSelect,
  loading = false,
  darkMode = false,
  preSelectedEmployeeIds = []
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgModal = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Initialize selection when modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      return;
    }

    if (isOpen && !isInitialized) {

      
      if (preSelectedEmployeeIds && preSelectedEmployeeIds.length > 0) {
     
        setSelectedEmployees(preSelectedEmployeeIds);
        setSelectAll(preSelectedEmployeeIds.length === eligibleEmployees.length && eligibleEmployees.length > 0);
      } else {
        const allEmployeeIds = eligibleEmployees.map(emp => emp.id);
      
        setSelectedEmployees(allEmployeeIds);
        setSelectAll(allEmployeeIds.length > 0);
      }
      
      setSearchTerm('');
      setExpandedEmployee(null);
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized, eligibleEmployees, preSelectedEmployeeIds]);

  // Update selection if preSelectedEmployeeIds changes while modal is open
  useEffect(() => {
    if (isOpen && isInitialized && preSelectedEmployeeIds) {
 
      setSelectedEmployees(preSelectedEmployeeIds);
      setSelectAll(preSelectedEmployeeIds.length === eligibleEmployees.length);
    }
  }, [preSelectedEmployeeIds, isOpen, isInitialized, eligibleEmployees]);

  // Filter employees based on search
  const filteredEmployees = eligibleEmployees.filter(emp => {
    const isVacancy = emp.is_vacancy || emp.record_type === 'vacancy';
    const name = isVacancy ? `Vacant Position (${emp.employee_id})` : (emp.full_name || emp.name || '');
    const searchableText = [
      name,
      emp.employee_id || '',
      emp.job_title || '',
      emp.department_name || '',
      emp.business_function_name || ''
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  // Handle individual employee selection
  const handleEmployeeToggle = (employeeRecord) => {
    const recordId = employeeRecord.id;
    
    setSelectedEmployees(prev => {
      const isSelected = prev.includes(recordId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId];
      
      setSelectAll(newSelection.length === filteredEmployees.length && filteredEmployees.length > 0);
      
      return newSelection;
    });
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll || selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
      setSelectAll(false);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
      setSelectAll(true);
    }
  };

  // Handle employee details toggle
  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(prev => prev === employeeId ? null : employeeId);
  };

  // Handle final selection
  const handleConfirmSelection = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee or vacancy');
      return;
    }

    const selectedEmployeeData = eligibleEmployees.filter(emp => 
      selectedEmployees.includes(emp.id)
    );


    
    onEmployeeSelect(selectedEmployees, selectedEmployeeData);
  };

  // Helper functions
  const isVacancy = (record) => {
    return record.is_vacancy || record.record_type === 'vacancy' || record.name === 'VACANT';
  };

  const getDisplayName = (record) => {
    if (isVacancy(record)) {
      return `Vacant Position (${record.employee_id})`;
    }
    return record.full_name || record.name || 'Unknown';
  };

  const getRecordIcon = (record) => {
    return isVacancy(record) ? UserX : User;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgModal} rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border ${borderColor} shadow-xl`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-base font-bold ${textPrimary} mb-1`}>
                Select Employees & Vacancies for Job Assignment
              </h2>
              <p className={`${textSecondary} text-xs`}>
                {eligibleEmployees.length} records match your job criteria.
                {selectedEmployees.length > 0 && (
                  <span className="text-almet-sapphire font-medium ml-1">
                    ({selectedEmployees.length} selected)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Job Criteria Display */}
        <div className={`px-4 py-2 ${bgAccent} border-b ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
            <Target size={14} />
            Job Criteria
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {jobCriteria.job_title && (
              <div>
                <span className={`font-medium ${textMuted}`}>Job Title:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.job_title}</span>
              </div>
            )}
            {jobCriteria.business_function?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Company:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.business_function.name}</span>
              </div>
            )}
            {jobCriteria.department?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Department:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.department.name}</span>
              </div>
            )}
            {jobCriteria.job_function?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Job Function:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.job_function.name}</span>
              </div>
            )}
            {jobCriteria.position_group?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Hierarchy:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.position_group.name}</span>
              </div>
            )}
            {jobCriteria.grading_level && (
              <div>
                <span className={`font-medium ${textMuted}`}>Grading Level:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.grading_level}</span>
              </div>
            )}
            {jobCriteria.unit?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Unit:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.unit.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pre-selection Info Banner */}
        {selectedEmployees.length > 0 && (
          <div className="px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border-b border-sky-200 dark:border-sky-800">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle size={14} className="text-sky-600" />
              <span className="text-sky-800 dark:text-sky-300">
                <span className="font-semibold">{selectedEmployees.length}</span> record{selectedEmployees.length > 1 ? 's' : ''} selected. 
                You can modify the selection below.
              </span>
            </div>
          </div>
        )}

        {/* Search and Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={16} />
              <input
                type="text"
                placeholder="Search employees and vacancies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                  focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CustomCheckbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < filteredEmployees.length}
                />
                <label className={`text-sm ${textSecondary} cursor-pointer`} onClick={handleSelectAll}>
                  Select All ({filteredEmployees.length})
                </label>
              </div>

              <div className={`text-sm ${textSecondary}`}>
                <span className="font-semibold text-almet-sapphire">{selectedEmployees.length}</span> selected
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4 max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire"></div>
              <span className={`ml-3 ${textSecondary}`}>Loading records...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
              <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>
                {searchTerm ? 'No records found' : 'No eligible records'}
              </h3>
              <p className={`${textMuted}`}>
                {searchTerm 
                  ? `No employees or vacancies match "${searchTerm}"`
                  : 'No employees or vacancies match the job criteria'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.includes(employee.id);
                const isExpanded = expandedEmployee === employee.id;
                const isVacancyRecord = isVacancy(employee);
                const RecordIcon = getRecordIcon(employee);
                const displayName = getDisplayName(employee);

                return (
                  <div 
                    key={employee.id}
                    className={`border ${borderColor} rounded-lg overflow-hidden transition-all duration-200 ${
                      isSelected ? 'border-almet-sapphire bg-sky-50 dark:bg-sky-900/10' : ''
                    }`}
                  >
                    {/* Employee/Vacancy Summary */}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <CustomCheckbox
                            checked={isSelected}
                            onChange={() => handleEmployeeToggle(employee)}
                          />
                          
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isSelected ? 'bg-almet-sapphire text-white' : 
                              isVacancyRecord ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                              `${bgAccent} ${textPrimary}`
                            }`}>
                              <RecordIcon size={16} />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${textPrimary} text-sm`}>
                                {displayName}
                              </h4>
                              <div className={`${textSecondary} flex items-center gap-8 text-xs space-y-1`}>
                                <p>ID: {employee.employee_id} • {employee.job_title}</p>
                                <div className="flex items-center gap-1">
                                  <Building size={10} />
                                  <span>{employee.business_function_name}</span>
                                  <span>•</span>
                                  <span>{employee.department_name}</span>
                                  {employee.unit_name && (
                                    <>
                                      <span>•</span>
                                      <span>{employee.unit_name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isVacancyRecord ? (
                            <div className="flex items-center gap-1 text-orange-600 text-xs">
                              <UserX size={12} />
                              <span>Vacancy</span>
                            </div>
                          ) : employee.has_line_manager && (
                            <div className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle size={12} />
                              <span>Has Manager</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => toggleEmployeeDetails(employee.id)}
                            className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg`}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Employee/Vacancy Details (Expanded) */}
                    {isExpanded && (
                      <div className={`px-4 pb-4 border-t ${borderColor} ${bgAccent}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4">
                          
                          {/* Contact Information - Only for employees */}
                          {!isVacancyRecord && (
                            <div>
                              <h5 className={`font-semibold ${textSecondary} mb-2`}>Contact Information</h5>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Phone size={10} className={textMuted} />
                                  <span className={`font-medium ${textMuted}`}>Phone:</span> 
                                  <span className={textPrimary}>{employee.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail size={10} className={textMuted} />
                                  <span className={`font-medium ${textMuted}`}>Email:</span> 
                                  <span className={textPrimary}>{employee.email || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Vacancy-specific Information */}
                          {isVacancyRecord && employee.vacancy_details && (
                            <div>
                              <h5 className={`font-semibold ${textSecondary} mb-2`}>Vacancy Details</h5>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <AlertCircle size={10} className={textMuted} />
                                  <span className={`font-medium ${textMuted}`}>Status:</span> 
                                  <span className="text-orange-600">
                                    {employee.vacancy_details.is_filled ? 'Filled' : 'Open'}
                                  </span>
                                </div>
                                {employee.vacancy_details.notes && (
                                  <div className="flex items-start gap-2">
                                    <span className={`font-medium ${textMuted} mt-1`}>Notes:</span>
                                    <span className={`${textPrimary} text-xs leading-relaxed flex-1`}>
                                      {employee.vacancy_details.notes}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Organization Information */}
                          <div>
                            <h5 className={`font-semibold ${textSecondary} mb-2`}>Organization</h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Building size={10} className={textMuted} />
                                <span className={`font-medium ${textMuted}`}>Company:</span> 
                                <span className={textPrimary}>{employee.business_function_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase size={10} className={textMuted} />
                                <span className={`font-medium ${textMuted}`}>Job Function:</span> 
                                <span className={textPrimary}>{employee.job_function_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target size={10} className={textMuted} />
                                <span className={`font-medium ${textMuted}`}>Hierarchy:</span> 
                                <span className={textPrimary}>{employee.position_group_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${textMuted}`}>Grading Level:</span> 
                                <span className={textPrimary}>{employee.grading_level || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Reporting - Only for employees */}
                          {!isVacancyRecord && (
                            <div>
                              <h5 className={`font-semibold ${textSecondary} mb-2`}>Reporting</h5>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User size={10} className={textMuted} />
                                  <span className={`font-medium ${textMuted}`}>Line Manager:</span>
                                  <span className={textPrimary}>{employee.line_manager_name || 'None'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderColor} ${bgAccent}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${textSecondary}`}>
              {selectedEmployees.length > 0 ? (
                <>
                  <span className="font-semibold text-almet-sapphire">{selectedEmployees.length}</span>
                  <span> record{selectedEmployees.length === 1 ? '' : 's'} selected.</span>
                  <span className="ml-2">Each will receive a separate job description.</span>
                </>
              ) : (
                <span>Select employees and vacancies to create job descriptions for.</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 border ${borderColor} rounded-lg ${textSecondary} hover:${textPrimary} 
                  transition-colors text-sm`}
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmSelection}
                disabled={selectedEmployees.length === 0 || loading}
                className="px-6 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                  flex items-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Create Job Descriptions ({selectedEmployees.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionModal;