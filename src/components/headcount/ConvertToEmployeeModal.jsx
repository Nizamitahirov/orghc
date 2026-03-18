// src/components/headcount/ConvertToEmployeeModal.jsx
import { useState, useEffect } from 'react';
import { X, UserPlus, Upload, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import SearchableDropdown from '../common/SearchableDropdown';
import { referenceDataAPI } from '@/store/api/referenceDataAPI';
import { useToast } from "../common/Toast";

const ConvertToEmployeeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  position,
  darkMode = false 
}) => {
  const { showError, showWarning } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    start_date: '',
    hiring_date: '',           // ← YENİ
    contract_duration: 'PERMANENT',
    employment_type: '',       // ← YENİ
    father_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    emergency_contact: '',
    end_date: '',
    contract_start_date: '',
    document_type: '',
    document_name: ''
  });

  const [files, setFiles] = useState({ document: null, profile_photo: null });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [contractDurations, setContractDurations]     = useState([]);
  const [employmentTypes, setEmploymentTypes]         = useState([]);   // ← YENİ
  const [loadingContractDurations, setLoadingContractDurations] = useState(false);
  const [loadingEmploymentTypes, setLoadingEmploymentTypes]     = useState(false); // ← YENİ

  // Theme
  const textPrimary   = darkMode ? "text-white"      : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400"   : "text-gray-600";
  const textMuted     = darkMode ? "text-gray-500"   : "text-gray-500";
  const bgModal       = darkMode ? "bg-gray-800"     : "bg-white";
  const bgInput       = darkMode ? "bg-gray-700"     : "bg-white";
  const bgSection     = darkMode ? "bg-gray-700/30"  : "bg-gray-50";
  const borderColor   = darkMode ? "border-gray-600" : "border-gray-300";

  const inputClass = (field) =>
    `w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
    }`;

  const genderOptions = [
    { value: 'MALE',   label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ];

  const documentTypes = [
    { value: 'CONTRACT',    label: 'Contract' },
    { value: 'ID',          label: 'ID Document' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'CV',          label: 'CV/Resume' },
    { value: 'PERFORMANCE', label: 'Performance Review' },
    { value: 'MEDICAL',     label: 'Medical Certificate' },
    { value: 'TRAINING',    label: 'Training Certificate' },
    { value: 'OTHER',       label: 'Other' },
  ];

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchContractDurations = async () => {
    setLoadingContractDurations(true);
    try {
      const response = await referenceDataAPI.getContractConfigDropdown();
      const data = response.data || [];
      setContractDurations(data);
      if (data.length > 0 && !formData.contract_duration) {
        const perm = data.find(c => c.contract_type === 'PERMANENT' || c.label?.toLowerCase().includes('permanent'));
        if (perm) setFormData(prev => ({ ...prev, contract_duration: perm.value }));
      }
    } catch (err) {
      console.error('Failed to fetch contract durations:', err);
      showError('Failed to load contract duration options');
    } finally {
      setLoadingContractDurations(false);
    }
  };

  // ← YENİ
  const fetchEmploymentTypes = async () => {
    setLoadingEmploymentTypes(true);
    try {
      const response = await referenceDataAPI.getEmploymentTypes();
      const data = response?.data?.results ?? response?.data ?? [];
      setEmploymentTypes(
        (Array.isArray(data) ? data : [])
          .filter(et => et.is_active !== false)
          .map(et => ({
            value: String(et.id),
            label: et.name,
            description: et.code,
            color: et.color,
          }))
      );
    } catch (err) {
      console.error('Failed to fetch employment types:', err);
      showError('Failed to load employment type options');
    } finally {
      setLoadingEmploymentTypes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, start_date: today, contract_start_date: today }));
      setErrors({});
      setFiles({ document: null, profile_photo: null });
      fetchContractDurations();
      fetchEmploymentTypes(); // ← YENİ
    }
  }, [isOpen]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFileChange = (field, file) => {
    if (!file) { setFiles(prev => ({ ...prev, [field]: null })); return; }
    if (file.size > 10 * 1024 * 1024) { showWarning('File size must be less than 10MB'); return; }
    if (field === 'profile_photo' && !['image/jpeg','image/jpg','image/png','image/gif'].includes(file.type)) {
      showWarning('Profile photo must be a JPEG, PNG, or GIF image'); return;
    }
    setFiles(prev => ({ ...prev, [field]: file }));
    if (field === 'document' && file) {
      if (!formData.document_type) setFormData(prev => ({ ...prev, document_type: 'CONTRACT' }));
      if (!formData.document_name) setFormData(prev => ({ ...prev, document_name: file.name }));
    }
  };

  const validateForm = () => {
    const e = {};
    if (!formData.first_name?.trim())  e.first_name  = 'First name is required';
    if (!formData.last_name?.trim())   e.last_name   = 'Last name is required';
    if (!formData.email?.trim())       e.email       = 'Email is required';
    if (!formData.start_date)          e.start_date  = 'Start date is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Please enter a valid email address';
    if (formData.first_name?.length > 150) e.first_name = 'Max 150 characters';
    if (formData.last_name?.length  > 150) e.last_name  = 'Max 150 characters';
    if (formData.father_name?.length > 200) e.father_name = 'Max 200 characters';
    if (formData.phone?.length > 20)        e.phone = 'Max 20 characters';
    if (formData.document_name?.length > 255) e.document_name = 'Max 255 characters';
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date))
      e.end_date = 'End date must be after start date';
    if (formData.contract_start_date && formData.start_date &&
        new Date(formData.contract_start_date) < new Date(formData.start_date))
      e.contract_start_date = 'Contract start date cannot be before employment start date';
    if (formData.hiring_date && formData.start_date &&
        new Date(formData.hiring_date) > new Date(formData.start_date))
      e.hiring_date = 'Hiring date should be on or before joining date';
    if (formData.date_of_birth) {
      const age = new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear();
      if (age < 16 || age > 100) e.date_of_birth = 'Age must be between 16–100';
    }
    if (files.document && !formData.document_type) e.document_type = 'Document type is required';
    if (files.document && !formData.document_name?.trim()) e.document_name = 'Document name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) { showWarning('Please correct the form errors before submitting'); return; }
    setIsSubmitting(true);
    try {
      await onSubmit(formData, files.document, files.profile_photo);
    } catch (error) {
      console.error('Form submission error:', error);
      if (error.response?.data) {
        const apiErrors = {};
        Object.keys(error.response.data).forEach(k => {
          apiErrors[k] = Array.isArray(error.response.data[k])
            ? error.response.data[k][0]
            : error.response.data[k];
        });
        setErrors(apiErrors);
        showError('Please correct the form errors and try again');
      } else {
        showError(error.message || 'Failed to convert position to employee');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-visible">
      <div className={`${bgModal} rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] border ${borderColor} relative z-[60] overflow-visible`}>

        {/* Header */}
        <div className={`p-4 border-b ${borderColor} bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl mr-4">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${textPrimary}`}>Convert to Employee</h2>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Position: {position?.job_title} • {position?.position_id}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors ${textMuted}`}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh] overflow-visible">
          <div className="p-6 space-y-8 overflow-visible">

            {/* ── 1. BASIC INFORMATION ──────────────────────────────────── */}
            <section>
              <h3 className={`text-sm font-semibold ${textPrimary} mb-4 pb-2 border-b ${borderColor}`}>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.first_name} maxLength={150} required
                    onChange={e => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name" className={inputClass('first_name')} />
                  {errors.first_name && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.first_name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.last_name} maxLength={150} required
                    onChange={e => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name" className={inputClass('last_name')} />
                  {errors.last_name && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.last_name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input type="email" value={formData.email} required
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address" className={inputClass('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.email}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Father Name</label>
                  <input type="text" value={formData.father_name} maxLength={200}
                    onChange={e => handleInputChange('father_name', e.target.value)}
                    placeholder="Enter father's name" className={inputClass('father_name')} />
                  {errors.father_name && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.father_name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Date of Birth</label>
                  <input type="date" value={formData.date_of_birth}
                    onChange={e => handleInputChange('date_of_birth', e.target.value)}
                    className={inputClass('date_of_birth')} />
                  {errors.date_of_birth && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.date_of_birth}</p>}
                </div>

                <div className="relative z-[100]">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Gender</label>
                  <SearchableDropdown options={genderOptions} value={formData.gender}
                    onChange={v => handleInputChange('gender', v)}
                    placeholder="Select Gender" searchPlaceholder="Search gender..."
                    darkMode={darkMode} allowUncheck portal dropdownClassName="z-[9999] fixed" />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Phone Number</label>
                  <input type="tel" value={formData.phone} maxLength={20}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number" className={inputClass('phone')} />
                  {errors.phone && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.phone}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Emergency Contact</label>
                  <input type="text" value={formData.emergency_contact}
                    onChange={e => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Enter emergency contact" className={inputClass('emergency_contact')} />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Address</label>
                  <input type="text" value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder="Enter address" className={inputClass('address')} />
                </div>
              </div>
            </section>

            {/* ── 2. EMPLOYMENT DETAILS ─────────────────────────────────── */}
            <section>
              <h3 className={`text-sm font-semibold ${textPrimary} mb-4 pb-2 border-b ${borderColor}`}>
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Joining Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={formData.start_date} required
                    onChange={e => handleInputChange('start_date', e.target.value)}
                    className={inputClass('start_date')} />
                  {errors.start_date && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.start_date}</p>}
                </div>

                {/* Hiring Date ← YENİ */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Hiring Date
                    <span className={`ml-1.5 text-[10px] font-normal ${textMuted}`}>(offer acceptance)</span>
                  </label>
                  <input type="date" value={formData.hiring_date}
                    onChange={e => handleInputChange('hiring_date', e.target.value)}
                    max={formData.start_date || undefined}
                    className={inputClass('hiring_date')} />
                  {errors.hiring_date
                    ? <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.hiring_date}</p>
                    : <p className={`mt-1 text-[11px] ${textMuted}`}>May differ from joining date</p>
                  }
                </div>

                {/* Contract Duration */}
                <div className="relative z-[100]">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Contract Duration <span className="text-red-500">*</span>
                  </label>
                  {loadingContractDurations ? (
                    <div className={`w-full p-3 border rounded-xl ${bgInput} ${textPrimary} flex items-center justify-center text-xs`}>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-almet-sapphire border-t-transparent mr-2" />Loading...
                    </div>
                  ) : (
                    <SearchableDropdown options={contractDurations} value={formData.contract_duration}
                      onChange={v => handleInputChange('contract_duration', v)}
                      placeholder="Select Contract Duration" searchPlaceholder="Search contract types..."
                      darkMode={darkMode} allowUncheck portal dropdownClassName="z-[9999] fixed" />
                  )}
                </div>

                {/* Employment Type ← YENİ */}
                <div className="relative z-[100]">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Employment Type
                  </label>
                  {loadingEmploymentTypes ? (
                    <div className={`w-full p-3 border rounded-xl ${bgInput} ${textPrimary} flex items-center justify-center text-xs`}>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-almet-sapphire border-t-transparent mr-2" />Loading...
                    </div>
                  ) : (
                    <SearchableDropdown options={employmentTypes} value={formData.employment_type}
                      onChange={v => handleInputChange('employment_type', v)}
                      placeholder="Select Employment Type" searchPlaceholder="Search types..."
                      darkMode={darkMode} allowUncheck allowClear portal dropdownClassName="z-[9999] fixed" />
                  )}
                  {errors.employment_type && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.employment_type}</p>}
                </div>

                {/* Contract Renewal Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Contract Renewal Date</label>
                  <input type="date" value={formData.contract_start_date}
                    onChange={e => handleInputChange('contract_start_date', e.target.value)}
                    className={inputClass('contract_start_date')} />
                  {errors.contract_start_date && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.contract_start_date}</p>}
                </div>

                {/* End Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>End Date</label>
                  <input type="date" value={formData.end_date}
                    onChange={e => handleInputChange('end_date', e.target.value)}
                    min={formData.start_date || undefined}
                    className={inputClass('end_date')} />
                  {errors.end_date && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.end_date}</p>}
                </div>

              </div>
            </section>

            {/* ── 3. DOCUMENTS ─────────────────────────────────────────── */}
            <section>
              <h3 className={`text-sm font-semibold ${textPrimary} mb-4 pb-2 border-b ${borderColor}`}>
                Documents & Photo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Profile Photo</label>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={e => handleFileChange('profile_photo', e.target.files[0])}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${borderColor} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-almet-sapphire file:text-white hover:file:bg-almet-astral`} />
                  {files.profile_photo && <p className={`mt-1 text-xs ${textSecondary}`}>Selected: {files.profile_photo.name}</p>}
                  <p className={`mt-1 text-xs ${textMuted}`}>Max 10MB · JPEG, PNG, GIF</p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Employee Document</label>
                  <input type="file" onChange={e => handleFileChange('document', e.target.files[0])}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${borderColor} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-almet-sapphire file:text-white hover:file:bg-almet-astral`} />
                  {files.document && <p className={`mt-1 text-xs ${textSecondary}`}>Selected: {files.document.name}</p>}
                  <p className={`mt-1 text-xs ${textMuted}`}>Max 10MB · Any type</p>
                </div>

                {files.document && (
                  <>
                    <div className="relative z-[100]">
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Document Type <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown options={documentTypes} value={formData.document_type}
                        onChange={v => handleInputChange('document_type', v)}
                        placeholder="Select Document Type" searchPlaceholder="Search..."
                        darkMode={darkMode} allowUncheck portal dropdownClassName="z-[9999] fixed" />
                      {errors.document_type && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.document_type}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Document Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" value={formData.document_name} maxLength={255}
                        onChange={e => handleInputChange('document_name', e.target.value)}
                        placeholder="Enter document name" className={inputClass('document_name')} />
                      {errors.document_name && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle size={12} className="mr-1" />{errors.document_name}</p>}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 p-4 border-t ${borderColor} bg-gray-50 dark:bg-gray-800/50`}>
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-medium border rounded-xl transition-all ${borderColor} ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700`}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center px-5 py-2 text-xs font-medium bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-xl hover:from-almet-astral hover:to-almet-steel-blue focus:ring-2 focus:ring-almet-sapphire/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {isSubmitting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />Converting...</>
              ) : (
                <><UserPlus size={16} className="mr-2" />Convert to Employee</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToEmployeeModal;