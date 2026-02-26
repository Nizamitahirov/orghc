// components/vacation/VacationRequestForm.jsx - FULL ENHANCED VERSION
import { Calendar, CheckCircle, Clock, Users, Upload, FileText, X, AlertCircle } from 'lucide-react';
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { useState, useEffect } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export default function VacationRequestForm({
  formData,
  setFormData,
  formErrors,
  requester,
  setRequester,
  employeeSearchResults,
  vacationTypes,
  hrRepresentatives,
  darkMode,
  handleStartDateChange,
  handleEndDateChange,
  selectedFiles,
  setSelectedFiles,
  fileErrors,
  handleSubmit,
  loading,
  activeSection
}) {
  const [filteredVacationTypes, setFilteredVacationTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  // ✅ Filter vacation types based on business function
  useEffect(() => {
    const filterVacationTypes = () => {
      if (!vacationTypes || vacationTypes.length === 0) {
        setFilteredVacationTypes([]);
        return;
      }

      const businessFunctionCode = formData.businessFunction;
      const isUK = businessFunctionCode && businessFunctionCode.toUpperCase().includes('UK');

      const filtered = vacationTypes.filter(type => {
        // UK-only types only for UK employees
        if (type.is_uk_only && !isUK) {
          return false;
        }
        return true;
      });

      setFilteredVacationTypes(filtered);
    };

    filterVacationTypes();
  }, [vacationTypes, formData.businessFunction]);

  // ✅ Handle vacation type change
  const handleTypeChange = (typeId) => {
    const type = filteredVacationTypes.find(t => t.id === typeId);
    setSelectedType(type);
    
    setFormData(prev => ({
      ...prev,
      vacation_type_id: typeId,
      is_half_day: type?.requires_time_selection ? true : false,
      half_day_start_time: type?.requires_time_selection ? '09:00' : '',
      half_day_end_time: type?.requires_time_selection ? '13:00' : '',
      end_date: type?.requires_time_selection ? prev.start_date : prev.end_date
    }));
  };

  // File validation
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 10MB limit`;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File "${file.name}" has unsupported format`;
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    
    for (const file of files) {
      const error = validateFile(file);
      if (!error) {
        validFiles.push(file);
      }
    }
    
    setSelectedFiles([...selectedFiles, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // ✅ Check if UK employee
  const isUKEmployee = formData.businessFunction && 
    formData.businessFunction.toUpperCase().includes('UK');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
      <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
              {activeSection === 'immediate' ? 'Submit Request' : 'Create Schedule'}
            </h2>
            {/* ✅ UK Employee Badge */}
            {isUKEmployee && (
              <span className="mt-2 inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                UK Employee - Special rules apply
              </span>
            )}
          </div>
          {activeSection === 'scheduling' && (
            <span className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              No Approval
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-almet-sapphire" />
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Employee Information</h3>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Requester</label>
              <select 
                value={requester} 
                onChange={(e) => setRequester(e.target.value)} 
                className="w-full px-3 py-2.5 outline-0 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
              >
                <option value="for_me">For Me</option>
                <option value="for_my_employee">For My Employee</option>
              </select>
            </div>

            {requester === 'for_my_employee' && (
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Search Employee</label>
                <SearchableDropdown
                  options={employeeSearchResults.map(emp => ({ 
                    value: emp.id, 
                    label: `${emp.name} (${emp.employee_id})`, 
                    ...emp 
                  }))}
                  value={formData.employee_id}
                  onChange={(value) => {
                    const selectedEmployee = employeeSearchResults.find(emp => emp.id === value);
                    if (value === null) {
                      setFormData(prev => ({
                        ...prev,
                        employee_id: null,
                        employeeName: '',
                        businessFunction: '',
                        department: '',
                        unit: '',
                        jobFunction: '',
                        phoneNumber: '',
                        line_manager: ''
                      }));
                    } else if (selectedEmployee) {
                      setFormData(prev => ({
                        ...prev,
                        employee_id: value,
                        employeeName: selectedEmployee.name,
                        businessFunction: selectedEmployee.business_function_name || '',
                        department: selectedEmployee.department_name || '',
                        unit: selectedEmployee.unit_name || '',
                        jobFunction: selectedEmployee.job_function_name || '',
                        phoneNumber: selectedEmployee.phone || '',
                        line_manager: selectedEmployee.line_manager_name || ''
                      }));
                    }
                  }}
                  placeholder="Select employee"
                  allowUncheck={true}
                  searchPlaceholder="Search..."
                  darkMode={darkMode}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {['employeeName', 'phoneNumber'].map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                    {field === 'employeeName' ? 'Name' : 'Phone'}
                  </label>
                  <input 
                    type={field === 'phoneNumber' ? 'tel' : 'text'} 
                    value={formData[field]} 
                    onChange={(e) => setFormData(prev => ({...prev, [field]: e.target.value}))} 
                    disabled={requester === 'for_me'} 
                    className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                  />
                </div>
              ))}
            </div>

            {['businessFunction', 'department', 'unit', 'jobFunction'].map(field => (
              <div key={field}>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  {field === 'businessFunction' ? 'Company' : 
                   field === 'department' ? 'Department' : 
                   field === 'unit' ? 'Unit' : 'Job Function'}
                </label>
                <input 
                  type="text" 
                  value={formData[field]} 
                  onChange={(e) => setFormData(prev => ({...prev, [field]: e.target.value}))} 
                  disabled={requester === 'for_me'} 
                  className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Comment (Optional)</label>
              <textarea 
                value={formData.comment} 
                onChange={(e) => setFormData(prev => ({...prev, comment: e.target.value}))} 
                rows={3} 
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none" 
              />
            </div>
          </div>

          {/* Leave Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-almet-sapphire" />
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Leave Information</h3>
            </div>

            {/* ✅ Vacation Type with UK badge */}
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Leave Type
              </label>
              <SearchableDropdown 
                options={filteredVacationTypes.map(type => ({ 
                  value: type.id, 
                  label: type.name,
                  badge: type.is_uk_only ? 'UK Only' : type.requires_time_selection ? 'Half Day' : null
                }))} 
                value={formData.vacation_type_id} 
                onChange={handleTypeChange} 
                placeholder="Select type" 
                darkMode={darkMode} 
              />
              {filteredVacationTypes.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  No vacation types available for {isUKEmployee ? 'UK' : 'AZ'} employees
                </p>
              )}
            </div>



{/* ✅ Half Day Section - Manual time input WITHOUT picker */}
{selectedType?.requires_time_selection && (
  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-4">
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-200">
        Half Day Request
      </h4>
    </div>

 

    <div className="grid grid-cols-2 gap-3">
      {/* ✅ START TIME - Manual Text Input */}
      <div>
        <label className="block text-xs font-medium text-orange-900 dark:text-orange-200 mb-1.5">
          Start Time *
        </label>
        <input
          type="text"
          value={formData.half_day_start_time}
          onChange={(e) => {
            let value = e.target.value;
            
            // ✅ Auto-format: Add colon after 2 digits
            if (value.length === 2 && !value.includes(':')) {
              value = value + ':';
            }
            
            // ✅ Only allow numbers and colon
            value = value.replace(/[^0-9:]/g, '');
            
            // ✅ Limit to HH:MM format (5 chars max)
            if (value.length > 5) {
              value = value.substring(0, 5);
            }
            
            setFormData(prev => ({
              ...prev,
              half_day_start_time: value,
              end_date: prev.start_date // Auto-set end_date same as start_date
            }));
          }}
         
          placeholder="09:00"
          maxLength={5}
          required
          className={`w-full px-3 py-2.5 text-sm border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-orange-500 ${
            formErrors.half_day_start_time 
              ? 'border-red-500 dark:border-red-500' 
              : 'border-orange-300 dark:border-orange-700'
          }`}
        />
        {formErrors.half_day_start_time && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {formErrors.half_day_start_time}
          </p>
        )}
      </div>

      {/* ✅ END TIME - Manual Text Input */}
      <div>
        <label className="block text-xs font-medium text-orange-900 dark:text-orange-200 mb-1.5">
          End Time *
        </label>
        <input
          type="text"
          value={formData.half_day_end_time}
          onChange={(e) => {
            let value = e.target.value;
            
            // ✅ Auto-format: Add colon after 2 digits
            if (value.length === 2 && !value.includes(':')) {
              value = value + ':';
            }
            
            // ✅ Only allow numbers and colon
            value = value.replace(/[^0-9:]/g, '');
            
            // ✅ Limit to HH:MM format
            if (value.length > 5) {
              value = value.substring(0, 5);
            }
            
            setFormData(prev => ({
              ...prev,
              half_day_end_time: value,
              end_date: prev.start_date // Auto-set end_date same as start_date
            }));
          }}
       
          placeholder="13:00"
          maxLength={5}
          required
          className={`w-full px-3 py-2.5 text-sm border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-orange-500 ${
            formErrors.half_day_end_time 
              ? 'border-red-500 dark:border-red-500' 
              : 'border-orange-300 dark:border-orange-700'
          }`}
        />
        {formErrors.half_day_end_time && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {formErrors.half_day_end_time}
          </p>
        )}
      </div>
    </div>


    {/* ✅ Common Time Examples */}
    <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
      <p className="text-xs text-orange-800 dark:text-orange-200 font-medium mb-2">
        📋 Common Half Day Times:
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Morning', start: '09:00', end: '13:00' },
          { label: 'Afternoon', start: '14:00', end: '18:00' },
     
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                half_day_start_time: preset.start,
                half_day_end_time: preset.end,
                end_date: prev.start_date
              }));
             
            }}
            className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-orange-300 dark:border-orange-700 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <span className="font-medium">{preset.label}</span>
            <span className="ml-1 text-orange-600 dark:text-orange-400">
              ({preset.start} - {preset.end})
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
)}

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Start Date</label>
              <input 
                type="date" 
                value={formData.start_date} 
                onChange={handleStartDateChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 text-sm border outline-0 rounded-lg dark:bg-gray-700 dark:text-white ${
                  formErrors.start_date ? 'border-red-500' : 'border-almet-bali-hai/40 dark:border-almet-comet'
                }`}
                required 
              />
              {formErrors.start_date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.start_date}</p>
              )}
            </div>

            {/* ✅ End Date - Disabled for half day */}
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                End Date
                {selectedType?.requires_time_selection && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                    (Auto-set for half day)
                  </span>
                )}
              </label>
              <input 
                type="date" 
                value={formData.end_date} 
                onChange={handleEndDateChange}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                disabled={selectedType?.requires_time_selection}
                className={`w-full px-3 py-2.5 text-sm outline-0 border rounded-lg dark:bg-gray-700 dark:text-white ${
                  selectedType?.requires_time_selection ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                } ${formErrors.end_date ? 'border-red-500' : 'border-almet-bali-hai/40 dark:border-almet-comet'}`}
                required 
              />
              {formErrors.end_date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.end_date}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Return Date</label>
                <input 
                  type="date" 
                  value={formData.dateOfReturn} 
                  disabled 
                  className="w-full px-3 py-2.5 outline-0 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg bg-almet-mystic/30 dark:bg-gray-600 dark:text-white" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Number of days
                  {selectedType?.requires_time_selection && (
                    <span className="ml-1 text-xs text-orange-600 dark:text-orange-400">(0.5)</span>
                  )}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.numberOfDays} 
                    disabled 
                    step="0.5"
                    className="w-full px-3 py-2.5 text-sm outline-0 border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg bg-almet-mystic/30 dark:bg-gray-600 dark:text-white font-semibold" 
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-almet-waterloo" />
                </div>
              </div>
            </div>

           
              <>
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                    Attachments (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm border-2 border-dashed border-almet-bali-hai/40 dark:border-almet-comet rounded-lg hover:border-almet-sapphire dark:hover:border-almet-astral hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
                        <span className="text-almet-waterloo dark:text-almet-bali-hai">
                          Click to upload or drag files here
                        </span>
                      </label>
                    </div>
                    
                    <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70">
                      Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 10MB each)
                    </p>
                    
                    {fileErrors && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                        <p className="text-xs text-red-600 dark:text-red-400">{fileErrors}</p>
                      </div>
                    )}
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-3 p-2.5 bg-almet-mystic/20 dark:bg-gray-700/30 border border-almet-mystic/40 dark:border-almet-comet rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-almet-sapphire flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-almet-cloud-burst dark:text-white truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-almet-sapphire" />
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Approval Required</h3>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Line Manager</label>
                  <input 
                    type="text" 
                    value={formData.line_manager} 
                    onChange={(e) => setFormData(prev => ({...prev, line_manager: e.target.value}))} 
                    disabled={requester === 'for_me'} 
                    placeholder="Line Manager Name" 
                    className="w-full px-3 py-2.5 outline-0 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">HR Representative</label>
                  <SearchableDropdown 
                    options={hrRepresentatives.map(hr => ({ value: hr.id, label: `${hr.name} (${hr.department})` }))} 
                    value={formData.hr_representative_id} 
                    onChange={(value) => setFormData(prev => ({...prev, hr_representative_id: value}))} 
                    placeholder="Select HR" 
                    darkMode={darkMode} 
                  />
                </div>
              </>
          
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-almet-mystic/30 dark:border-almet-comet/30">
          <button 
            type="button" 
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                start_date: '', 
                end_date: '', 
                dateOfReturn: '', 
                numberOfDays: 0, 
                comment: '',
                is_half_day: false,
                half_day_start_time: '',
                half_day_end_time: ''
              }));
              setSelectedFiles([]);
            }} 
            className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Clear
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.start_date  || !formData.vacation_type_id} 
            className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {activeSection === 'immediate' ? 'Submit Request' : 'Save Schedule'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}