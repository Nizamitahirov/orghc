// ResignationSubmissionModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Send, AlertCircle } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ResignationSubmissionModal({ onClose, onSuccess, currentEmployee }) {
  const [formData, setFormData] = useState({
    employee: currentEmployee?.id || '',
    last_working_day: '',
    employee_comments: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentEmployee?.id) {
      setFormData(prev => ({ ...prev, employee: currentEmployee.id }));
    }
  }, [currentEmployee]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF and DOC/DOCX files are allowed');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleRemoveFile = () => setSelectedFile(null);

  const calculateNoticePeriod = () => {
    if (!formData.last_working_day) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDay = new Date(formData.last_working_day);
    lastDay.setHours(0, 0, 0, 0);
    const diffTime = lastDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? `${diffDays} days notice period` : 'Invalid date';
  };

  const handleSubmit = async () => {
    if (!formData.last_working_day) {
      setError('Please select your last working day');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDay = new Date(formData.last_working_day);
    lastDay.setHours(0, 0, 0, 0);
    
    if (lastDay < today) {
      setError('Last working day cannot be in the past');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const submitData = {
        employee: formData.employee,
        last_working_day: formData.last_working_day,
        employee_comments: formData.employee_comments,
        resignation_letter: selectedFile
      };

      await resignationExitService.resignation.createResignation(submitData);
      
      onSuccess && onSuccess();
      onClose();
      alert('Resignation submitted successfully! Your manager will be notified.');
      
    } catch (err) {
      console.error('Error submitting resignation:', err);
      setError(err.response?.data?.detail || 'Failed to submit resignation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Submit Resignation</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {currentEmployee?.full_name} • {currentEmployee?.employee_id}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Important Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-2">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Your resignation will be sent to your line manager for approval</li>
                  <li>Standard notice period is 30 days unless specified in your contract</li>
                  <li>You will receive email notifications about the status</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Last Working Day */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Last Working Day <span className="text-red-500">*</span>
            </label>
            <input 
              type="date"
              value={formData.last_working_day}
              onChange={(e) => setFormData({...formData, last_working_day: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border outline-0 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
            {formData.last_working_day && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{calculateNoticePeriod()}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Additional Comments (Optional)
            </label>
            <textarea 
              value={formData.employee_comments}
              onChange={(e) => setFormData({...formData, employee_comments: e.target.value})}
              rows={4}
              placeholder="Please provide any additional information about your resignation..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Attach Resignation Letter (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              {!selectedFile ? (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="text-gray-400 mb-3" size={32} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 mb-1 text-center">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</span>
                  <input 
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
                      <FileText className="text-almet-sapphire" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || !formData.last_working_day}
            className="px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Resignation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}