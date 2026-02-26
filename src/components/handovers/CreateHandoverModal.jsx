// components/handovers/CreateHandoverModal.jsx - IMPROVED DESIGN
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Calendar, Users, FileText, 
  Save, Loader, AlertCircle, Key, Folder, 
  AlertTriangle, MessageSquare, Clock, Upload, CheckCircle
} from 'lucide-react';
import handoverService from '@/services/handoverService';
import { useToast } from '@/components/common/Toast';
import SearchableDropdown from '@/components/common/SearchableDropdown';

const CreateHandoverModal = ({ onClose, onSuccess, user }) => {
  // Form State
  const [formData, setFormData] = useState({
    handing_over_employee: user?.employee?.id || '',
    taking_over_employee: '',
    handover_type: '',
    start_date: '',
    end_date: '',
    contacts: '',
    access_info: '',
    documents_info: '',
    open_issues: '',
    notes: '',
  });

  const [tasks, setTasks] = useState([
    { description: '', status: 'NOT_STARTED', comment: '' }
  ]);

  const [dates, setDates] = useState([
    { date: '', description: '' }
  ]);

  const [attachments, setAttachments] = useState([]);

  // Lookup Data
  const [employees, setEmployees] = useState([]);
  const [handoverTypes, setHandoverTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(1);

  const { showSuccess, showError, showWarning } = useToast();
  const [selectedHandoverType, setSelectedHandoverType] = useState(null);
  const isResignation = selectedHandoverType?.name?.toLowerCase() === 'resignation';


  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadInitialData = async () => {
    try {
      const [employeesData, typesData] = await Promise.all([
        handoverService.getEmployees(),
        handoverService.getHandoverTypes()
      ]);
      setEmployees(employeesData);
      setHandoverTypes(typesData);
    } catch (error) {
      showError('Error loading form data');
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle task changes
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { description: '', status: 'NOT_STARTED', comment: '' }]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    } else {
      showWarning('At least one task is required');
    }
  };

  // Handle date changes
  const handleDateChange = (index, field, value) => {
    const updatedDates = [...dates];
    updatedDates[index][field] = value;
    setDates(updatedDates);
  };

  const addDate = () => {
    setDates([...dates, { date: '', description: '' }]);
  };

  const removeDate = (index) => {
    if (dates.length > 1) {
      setDates(dates.filter((_, i) => i !== index));
    } else {
      showWarning('At least one important date is required');
    }
  };

  // Handle file attachments
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        showWarning(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      return true;
    });

    const newAttachments = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

 
  // Handle next step
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 4));
    } else {
      showError('Please fix the errors before continuing');
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };
  const getHandoverTypeName = (typeId) => {
    const type = handoverTypes.find(t => t.id === typeId);
    return type?.name?.toLowerCase() || '';
  };

  // Helper to check if current type is resignation
  const isResignationType = () => {
    if (!formData.handover_type) return false;
    const typeName = getHandoverTypeName(formData.handover_type);
    return typeName.includes('resignation');
  };
  // Validate form
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.handing_over_employee) {
        newErrors.handing_over_employee = 'Handing over employee is required';
      }
      if (!formData.taking_over_employee) {
        newErrors.taking_over_employee = 'Taking over employee is required';
      }
      if (formData.handing_over_employee === formData.taking_over_employee) {
        newErrors.taking_over_employee = 'Cannot be the same as handing over employee';
      }
      if (!formData.handover_type) {
        newErrors.handover_type = 'Handover type is required';
      }
      if (!formData.start_date) {
        newErrors.start_date = 'Start date is required';
      }
      
      // ✅ Check if resignation
      const typeName = getHandoverTypeName(formData.handover_type);
      const isResignation = typeName.includes('resignation');
      
      // ✅ End date validation - yalnız resignation deyilsə və ya doldurulubsa
      if (!isResignation && !formData.end_date) {
        newErrors.end_date = 'End date is required';
      }
      
      // ✅ Əgər end_date doldurulubsa, validate et
      if (formData.end_date) {
        if (formData.start_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
          newErrors.end_date = 'End date must be after start date';
        }
      }
    }

    if (step === 2) {
      const validTasks = tasks.filter(t => t.description.trim());
      if (validTasks.length === 0) {
        newErrors.tasks = 'At least one task with description is required';
      }
    }

    if (step === 3) {
      const validDates = dates.filter(d => d.date && d.description.trim());
      if (validDates.length === 0) {
        newErrors.dates = 'At least one important date is required';
      }
    }

    if (step === 4) {
      const hasAnyField = formData.contacts || formData.access_info || 
                          formData.documents_info || formData.open_issues || 
                          formData.notes || attachments.length > 0;
      
      if (!hasAnyField) {
        newErrors.details = 'Please fill at least one field in Additional Information';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        isValid = false;
        setActiveStep(step);
        showError('Please complete all required fields');
        return;
      }
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const tasks_data = tasks
        .filter(t => t.description.trim())
        .map(t => ({
          description: t.description,
          status: t.status,
          comment: t.comment
        }));

      const dates_data = dates
        .filter(d => d.date && d.description.trim())
        .map(d => ({
          date: d.date,
          description: d.description
        }));

      const handoverData = {
        ...formData,
        tasks_data,
        dates_data
      };

      const result = await handoverService.createHandover(handoverData);

      if (attachments.length > 0 && result.id) {
        await Promise.all(
          attachments.map(attachment => 
            handoverService.uploadAttachment(result.id, attachment.file)
          )
        );
      }

      showSuccess('Handover created successfully!');
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error creating handover';
      showError(errorMessage);
      console.error('Error creating handover:', error);
    } finally {
      setLoading(false);
    }
  };

  // Task status options
  const taskStatusOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELED', label: 'Canceled' },
    { value: 'POSTPONED', label: 'Postponed' },
  ];

  // Steps configuration
  const steps = [
    { id: 1, label: 'Basic Info', icon: Users },
    { id: 2, label: 'Tasks', icon: FileText },
    { id: 3, label: 'Dates', icon: Calendar },
    { id: 4, label: 'Details', icon: Folder },
  ];

  // Step indicator
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-teal-500 text-white' 
                    : isActive 
                    ? 'bg-almet-sapphire text-white' 
                    : 'bg-almet-mystic text-almet-waterloo'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${
                  isActive ? 'text-almet-sapphire' : 'text-almet-waterloo'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-all ${
                  activeStep > step.id ? 'bg-teal-500' : 'bg-almet-mystic'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto"></div>
          <p className="text-center mt-4 text-almet-waterloo text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-almet-mystic dark:border-gray-700 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Create New Handover</h2>
              <p className="text-xs text-almet-waterloo dark:text-gray-400">Step {activeStep} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-almet-mystic dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-almet-waterloo" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          {/* Step Indicator */}
          <StepIndicator />

          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-almet-sapphire" />
                <h3 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                  Basic Information
                </h3>
              </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Handing Over Employee */}
                <div>
                  <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    Handing Over Employee *
                  </label>
                  <SearchableDropdown
                    options={employees.map(emp => ({
                      value: emp.id,
                      label: `${emp.name} - ${emp.job_title}`
                    }))}
                    value={formData.handing_over_employee}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, handing_over_employee: value }));
                      if (errors.handing_over_employee) {
                        setErrors(prev => ({ ...prev, handing_over_employee: '' }));
                      }
                    }}
                    placeholder="Select handing over employee..."
                    searchPlaceholder="Search employees..."
                    icon={<Users className="w-4 h-4" />}
                    allowUncheck={false}
                  />
                  {errors.handing_over_employee && (
                    <p className="text-red-500 text-xs mt-1">{errors.handing_over_employee}</p>
                  )}
                </div>

                {/* Taking Over Employee */}
                <div>
                  <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    Taking Over Employee *
                  </label>
                  <SearchableDropdown
                    options={employees
                      .filter(emp => emp.id !== formData.handing_over_employee)
                      .map(emp => ({
                        value: emp.id,
                        label: `${emp.name} - ${emp.job_title}`
                      }))}
                    value={formData.taking_over_employee}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, taking_over_employee: value }));
                      if (errors.taking_over_employee) {
                        setErrors(prev => ({ ...prev, taking_over_employee: '' }));
                      }
                    }}
                    placeholder="Select taking over employee..."
                    searchPlaceholder="Search employees..."
                    icon={<Users className="w-4 h-4" />}
                    allowUncheck={false}
                  />
                  {errors.taking_over_employee && (
                    <p className="text-red-500 text-xs mt-1">{errors.taking_over_employee}</p>
                  )}
                </div>

                {/* Handover Type */}
                <div>
                  <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    Handover Type *
                  </label>
                  <SearchableDropdown
                    options={handoverTypes.map(type => ({
                      value: type.id,
                      label: type.name
                    }))}
                    value={formData.handover_type}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, handover_type: value }));
                      if (errors.handover_type) {
                        setErrors(prev => ({ ...prev, handover_type: '' }));
                      }
                      // Clear end_date error when type changes
                      if (errors.end_date) {
                        setErrors(prev => ({ ...prev, end_date: '' }));
                      }
                    }}
                    placeholder="Select handover type..."
                    searchPlaceholder="Search types..."
                    icon={<FileText className="w-4 h-4" />}
                    allowUncheck={false}
                  />
                  {errors.handover_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.handover_type}</p>
                  )}
                </div>

                <div></div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-almet-waterloo absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className={`w-full outline-0 pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        errors.start_date ? 'border-red-500' : 'border-almet-bali-hai dark:border-gray-700'
                      }`}
                      required
                    />
                  </div>
                  {errors.start_date && (
                    <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
                  )}
                </div>

                {/* End Date - ✅ with dynamic label */}
                <div>
                  <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    End Date {!isResignationType() && <span className="text-red-500">*</span>}
                    {isResignationType() && (
                      <span className="ml-1.5 text-xs font-normal text-amber-600 dark:text-amber-400">
                        (Optional for Resignation)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-almet-waterloo absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      min={formData.start_date}
                      className={`w-full outline-0 pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        errors.end_date ? 'border-red-500' : 'border-almet-bali-hai dark:border-gray-700'
                      }`}
                      required={!isResignationType()}
                    />
                  </div>
                  {errors.end_date && (
                    <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Date Range Info - only show if both dates exist */}
              {formData.start_date && formData.end_date && new Date(formData.start_date) < new Date(formData.end_date) && (
                <div className="bg-almet-mystic/50 dark:bg-almet-cloud-burst/10 border border-almet-bali-hai/50 dark:border-almet-cloud-burst/30 rounded-lg p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-almet-sapphire flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">Handover Period</p>
                      <p className="text-xs text-almet-waterloo dark:text-gray-400 mt-0.5">
                        Duration: {Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Open-ended Resignation Warning - only show if resignation and no end date */}
              {isResignationType() && !formData.end_date && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-300">Open-ended Resignation</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        No end date specified. This handover will remain active until taken back.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            
          {/* Step 2: Tasks Section */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-almet-sapphire" />
                  <h3 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                    Tasks & Responsibilities *
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addTask}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-sapphire rounded-lg hover:bg-almet-bali-hai/20 transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>

              {errors.tasks && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
                  <p className="text-red-700 dark:text-red-400 text-xs">{errors.tasks}</p>
                </div>
              )}

              <div className="space-y-2.5">
                {tasks.map((task, index) => (
                  <div key={index} className="bg-almet-mystic/50 dark:bg-gray-800 p-3.5 rounded-lg border border-almet-bali-hai/50 dark:border-gray-700">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 space-y-2.5">
                        <div>
                          <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1">
                            Task Description *
                          </label>
                          <textarea
                            value={task.description}
                            onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                            className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            rows="2"
                            placeholder="Enter task description..."
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1">
                              Initial Status
                            </label>
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskChange(index, 'status', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                              {taskStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1">
                              Comment
                            </label>
                            <input
                              type="text"
                              value={task.comment}
                              onChange={(e) => handleTaskChange(index, 'comment', e.target.value)}
                              className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                              placeholder="Add comment..."
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        disabled={tasks.length === 1}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Important Dates */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-almet-sapphire" />
                  <h3 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                    Important Dates *
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addDate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-sapphire rounded-lg hover:bg-almet-bali-hai/20 transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Date
                </button>
              </div>

              {errors.dates && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
                  <p className="text-red-700 dark:text-red-400 text-xs">{errors.dates}</p>
                </div>
              )}

              <div className="space-y-2.5">
                {dates.map((dateItem, index) => (
                  <div key={index} className="bg-almet-mystic/50 dark:bg-gray-800 p-3.5 rounded-lg border border-almet-bali-hai/50 dark:border-gray-700">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={dateItem.date}
                            onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                            className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1">
                            Description *
                          </label>
                          <input
                            type="text"
                            value={dateItem.description}
                            onChange={(e) => handleDateChange(index, 'description', e.target.value)}
                            className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            placeholder="Enter description..."
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeDate(index)}
                        disabled={dates.length === 1}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {activeStep === 4 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4 text-almet-sapphire" />
                <h3 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                  Additional Information
                </h3>
              </div>

              {errors.details && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 dark:text-red-400 text-xs">{errors.details}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3.5">
                {/* Related Contacts */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    <Users className="w-3.5 h-3.5 text-almet-sapphire" />
                    Related Contacts
                  </label>
                  <textarea
                    name="contacts"
                    value={formData.contacts}
                    onChange={handleInputChange}
                    className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    rows="2"
                    placeholder="List important contacts..."
                  />
                </div>

                {/* Access Information */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    <Key className="w-3.5 h-3.5 text-almet-sapphire" />
                    Access Information
                  </label>
                  <textarea
                    name="access_info"
                    value={formData.access_info}
                    onChange={handleInputChange}
                    className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    rows="2"
                    placeholder="System names, accounts..."
                  />
                </div>

                {/* Documents & Files */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    <Folder className="w-3.5 h-3.5 text-almet-sapphire" />
                    Documents & Files
                  </label>
                  <textarea
                    name="documents_info"
                    value={formData.documents_info}
                    onChange={handleInputChange}
                    className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    rows="2"
                    placeholder="File locations, shared drives..."
                  />
                </div>

                {/* Open Issues */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-almet-sapphire" />
                    Open Issues
                  </label>
                  <textarea
                    name="open_issues"
                    value={formData.open_issues}
                    onChange={handleInputChange}
                    className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    rows="2"
                    placeholder="Unresolved problems, pending actions..."
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-almet-sapphire" />
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full outline-0 px-3 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Additional notes, tips, recommendations..."
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-almet-cloud-burst dark:text-gray-200 mb-1.5">
                    <Upload className="w-3.5 h-3.5 text-almet-sapphire" />
                    File Attachments
                  </label>
                  
                  <div className="border-2 border-dashed border-almet-bali-hai dark:border-gray-700 rounded-lg p-4 text-center hover:border-almet-sapphire transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-6 h-6 text-almet-waterloo dark:text-gray-400 mb-2" />
                      <span className="text-xs text-almet-cloud-burst dark:text-white">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-almet-waterloo dark:text-gray-400 mt-1">
                        PDF, DOC, XLS, TXT, Images (Max 10MB)
                      </span>
                    </label>
                  </div>

                  {/* Attachment List */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-almet-mystic/50 dark:bg-gray-800 p-2.5 rounded-lg border border-almet-bali-hai/50 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-almet-sapphire flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-almet-cloud-burst dark:text-white truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-almet-waterloo dark:text-gray-400">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-almet-mystic dark:border-gray-700">
            {/* Back Button */}
            <button
              type="button"
              onClick={activeStep === 1 ? onClose : handlePrevStep}
              disabled={loading}
              className="px-4 py-2 text-sm border border-almet-bali-hai dark:border-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {/* Progress Info */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1.5">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`h-1.5 rounded-full transition-all ${
                      step.id === activeStep 
                        ? 'w-6 bg-almet-sapphire' 
                        : step.id < activeStep 
                        ? 'w-1.5 bg-teal-500' 
                        : 'w-1.5 bg-almet-mystic dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Next/Submit Button */}
            {activeStep < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Handover
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHandoverModal;