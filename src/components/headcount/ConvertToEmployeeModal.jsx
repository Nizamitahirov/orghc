// src/components/headcount/ConvertToEmployeeModal.jsx - Enhanced with Toast and Dropdown Z-Index Fix
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

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    start_date: '',
    contract_duration: 'PERMANENT',
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

  const [files, setFiles] = useState({
    document: null,
    profile_photo: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reference data states
  const [contractDurations, setContractDurations] = useState([]);
  const [loadingContractDurations, setLoadingContractDurations] = useState(false);

  // Theme styles
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-500";
  const bgModal = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const bgSection = darkMode ? "bg-gray-700/30" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";

  // Gender options
  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  // Document type options
  const documentTypes = [
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'ID', label: 'ID Document' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'CV', label: 'CV/Resume' },
    { value: 'PERFORMANCE', label: 'Performance Review' },
    { value: 'MEDICAL', label: 'Medical Certificate' },
    { value: 'TRAINING', label: 'Training Certificate' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Fetch contract durations from API
  const fetchContractDurations = async () => {
    setLoadingContractDurations(true);
    try {
      const response = await referenceDataAPI.getContractConfigDropdown();
      setContractDurations(response.data || []);
      
      if (response.data && response.data.length > 0 && !formData.contract_duration) {
        const permanentContract = response.data.find(contract => 
          contract.contract_type === 'PERMANENT' || 
          contract.label.toLowerCase().includes('permanent')
        );
        
        if (permanentContract) {
          setFormData(prev => ({ 
            ...prev, 
            contract_duration: permanentContract.value 
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch contract durations:', error);
      showError('Failed to load contract duration options');
    } finally {
      setLoadingContractDurations(false);
    }
  };

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        start_date: today,
        contract_start_date: today
      }));
      setErrors({});
      setFiles({ document: null, profile_photo: null });
      fetchContractDurations();
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle file changes with validation
  const handleFileChange = (field, file) => {
    if (!file) {
      setFiles(prev => ({ ...prev, [field]: null }));
      return;
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showWarning('File size must be less than 10MB');
      return;
    }

    // File type validation for profile photo
    if (field === 'profile_photo') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showWarning('Profile photo must be a JPEG, PNG, or GIF image');
        return;
      }
    }

    setFiles(prev => ({ ...prev, [field]: file }));
    
    if (field === 'document' && file) {
      if (!formData.document_type) {
        setFormData(prev => ({ ...prev, document_type: 'CONTRACT' }));
      }
      if (!formData.document_name) {
        setFormData(prev => ({ ...prev, document_name: file.name }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Length validations
    if (formData.first_name && formData.first_name.length > 150) {
      newErrors.first_name = 'First name must be 150 characters or less';
    }
    if (formData.last_name && formData.last_name.length > 150) {
      newErrors.last_name = 'Last name must be 150 characters or less';
    }
    if (formData.father_name && formData.father_name.length > 200) {
      newErrors.father_name = 'Father name must be 200 characters or less';
    }
    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be 20 characters or less';
    }
    if (formData.document_name && formData.document_name.length > 255) {
      newErrors.document_name = 'Document name must be 255 characters or less';
    }

    // Date validations
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.contract_start_date && formData.start_date) {
      if (new Date(formData.contract_start_date) < new Date(formData.start_date)) {
        newErrors.contract_start_date = 'Contract start date cannot be before employment start date';
      }
    }

    // Date of birth validation
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 100) {
        newErrors.date_of_birth = 'Please enter a valid date of birth (age must be between 16-100)';
      }
    }

    // Document validations
    if (files.document && !formData.document_type) {
      newErrors.document_type = 'Document type is required when uploading a document';
    }
    if (files.document && !formData.document_name?.trim()) {
      newErrors.document_name = 'Document name is required when uploading a document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning('Please correct the form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData, files.document, files.profile_photo);
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
        showError(error.message || 'Failed to convert position to employee');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
                <h2 className={`text-lg font-semibold ${textPrimary}`}>
                  Convert to Employee
                </h2>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Position: {position?.job_title} • {position?.position_id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors ${textMuted}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh] overflow-visible">
          <div className="p-6 space-y-8 overflow-visible">
            
            {/* Basic Information Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* First Name */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    maxLength={150}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.first_name 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                    required
                  />
                  {errors.first_name && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.first_name}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    maxLength={150}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.last_name 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                    required
                  />
                  {errors.last_name && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.last_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.email 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Father Name */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => handleInputChange('father_name', e.target.value)}
                    placeholder="Enter father's name"
                    maxLength={200}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`}
                  />
                  {errors.father_name && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.father_name}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.date_of_birth 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.date_of_birth}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="relative z-[100]">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Gender
                  </label>
                  <SearchableDropdown
                    options={genderOptions}
                    value={formData.gender}
                    onChange={(value) => handleInputChange('gender', value)}
                    placeholder="Select Gender"
                    searchPlaceholder="Search gender..."
                    darkMode={darkMode}
                     allowUncheck={true}
                    dropdownClassName="z-[9999] fixed"
                    portal={true}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    maxLength={20}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.phone 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Enter emergency contact information"
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`}
                  />
                </div>
              </div>
            </div>

            {/* Employment Details Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Start Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.start_date 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                    required
                  />
                  {errors.start_date && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.start_date}
                    </p>
                  )}
                </div>

                {/* Contract Duration */}
                <div className="relative z-[100]">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Contract Duration <span className="text-red-500">*</span>
                  </label>
                  {loadingContractDurations ? (
                    <div className={`w-full p-3 border rounded-xl ${bgInput} ${textPrimary} flex items-center justify-center`}>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-almet-sapphire border-t-transparent mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    <SearchableDropdown
                      options={contractDurations}
                      value={formData.contract_duration}
                      onChange={(value) => handleInputChange('contract_duration', value)}
                      placeholder="Select Contract Duration"
                      searchPlaceholder="Search contract types..."
                      darkMode={darkMode}
                       allowUncheck={true}
                      dropdownClassName="z-[9999] fixed"
                      portal={true}
                    />
                  )}
                </div>

                {/* Contract Start Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Contract Renewal Date
                  </label>
                  <input
                    type="date"
                    value={formData.contract_start_date}
                    onChange={(e) => handleInputChange('contract_start_date', e.target.value)}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.contract_start_date 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                  />
                  {errors.contract_start_date && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.contract_start_date}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                      errors.end_date 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Profile Photo */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => handleFileChange('profile_photo', e.target.files[0])}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-almet-sapphire file:text-white hover:file:bg-almet-astral`}
                  />
                  {files.profile_photo && (
                    <p className={`mt-2 text-xs ${textSecondary}`}>
                      Selected: {files.profile_photo.name}
                    </p>
                  )}
                  <p className={`mt-1 text-xs ${textMuted}`}>
                    Max 10MB. Supported: JPEG, PNG, GIF
                  </p>
                </div>

                {/* Employee Document */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Employee Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('document', e.target.files[0])}
                    className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-almet-sapphire file:text-white hover:file:bg-almet-astral`}
                  />
                  {files.document && (
                    <p className={`mt-2 text-xs ${textSecondary}`}>
                      Selected: {files.document.name}
                    </p>
                  )}
                  <p className={`mt-1 text-xs ${textMuted}`}>
                    Max 10MB. Any file type supported
                  </p>
                </div>

                {/* Document Type - Show only if document is uploaded */}
                {files.document && (
                  <div className="relative z-[100]">
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Document Type <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                      options={documentTypes}
                      value={formData.document_type}
                      onChange={(value) => handleInputChange('document_type', value)}
                      placeholder="Select Document Type"
                      searchPlaceholder="Search document types..."
                      darkMode={darkMode}
                       allowUncheck={true}
                      dropdownClassName="z-[9999] fixed"
                      portal={true}
                    />
                    {errors.document_type && (
                      <p className="mt-2 text-xs text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.document_type}
                      </p>
                    )}
                  </div>
                )}

                {/* Document Name - Show only if document is uploaded */}
                {files.document && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Document Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.document_name}
                      onChange={(e) => handleInputChange('document_name', e.target.value)}
                      placeholder="Enter document name"
                      maxLength={255}
                      className={`w-full py-2 px-3 border text-xs outline-0 rounded-xl ${bgInput} ${textPrimary} transition-all ${
                        errors.document_name 
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                          : `${borderColor} focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire`
                      }`}
                      required
                    />
                    {errors.document_name && (
                      <p className="mt-2 text-xs text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.document_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 p-4 border-t ${borderColor} bg-gray-50 dark:bg-gray-800/50`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2 text-xs font-medium border rounded-xl transition-all ${borderColor} ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-5 py-2 text-xs font-medium bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-xl hover:from-almet-astral hover:to-almet-steel-blue focus:ring-2 focus:ring-almet-sapphire/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Converting...
                </>
              ) : (
                <>
                  <UserPlus size={16} className="mr-2" />
                  Convert to Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToEmployeeModal;