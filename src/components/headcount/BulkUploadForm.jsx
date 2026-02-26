// src/components/headcount/BulkUploadForm.jsx - FIXED with downloadTemplate function and smaller fonts
import { useState, useCallback } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Users,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useEmployees } from "../../hooks/useEmployees";

/**
 * Bulk Employee Upload Form Component - Fixed with template download and smaller fonts
 * Handles Excel file import/export for employee data
 * Prevents multiple uploads and provides better UX
 */
const BulkUploadForm = ({ onClose, onImportComplete }) => {
  const { darkMode } = useTheme();
  
  // ========================================
  // HOOKS - Access to employee operations
  // ========================================
  const {
    downloadEmployeeTemplate,
    bulkUploadEmployees,
    loading
  } = useEmployees();

  // ========================================
  // LOCAL STATE
  // ========================================
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  // ========================================
  // DOWNLOAD TEMPLATE FUNCTION - FIXED
  // ========================================
  const downloadTemplate = useCallback(async () => {
    try {

      setIsProcessing(true);
      
      const result = await downloadEmployeeTemplate();

      
      // The downloadEmployeeTemplate function should handle the actual file download
      // If it doesn't, we can show a success message
      if (result) {
        alert('✅ Template downloaded successfully!');
      }
    } catch (error) {
      console.error('❌ Template download failed:', error);
      alert('❌ Failed to download template: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  }, [downloadEmployeeTemplate]);

  // ========================================
  // DRAG AND DROP HANDLERS
  // ========================================
  
  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      handleFileValidation(file);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length) {
      const file = e.target.files[0];
      handleFileValidation(file);
    }
  }, []);

  // ========================================
  // FILE VALIDATION
  // ========================================
  
  // Validate selected file
  const handleFileValidation = useCallback((file) => {

    
    // Reset previous state
    setUploadResults(null);
    setValidationErrors([]);

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
  }, []);

  // ========================================
  // FILE PROCESSING
  // ========================================
  
  // Process uploaded file for validation
  const processUpload = useCallback(async () => {
    if (!uploadedFile || isProcessing) return;


    setIsProcessing(true);
    
    try {
      // Use the bulkUploadEmployees hook function
      const result = await bulkUploadEmployees(uploadedFile);

      
      // Extract results from the API response
      const uploadData = result.payload || result.data || result;
      
      setUploadResults({
        totalRows: uploadData.total_rows || uploadData.total || 0,
        validRows: uploadData.valid_rows || uploadData.successful || 0,
        invalidRows: uploadData.invalid_rows || uploadData.errors?.length || 0,
        errors: uploadData.errors || [],
        fileId: uploadData.file_id || uploadData.id
      });

      setValidationErrors(uploadData.errors || []);

      // If there are no validation errors and we have valid rows, we can proceed directly
      if (uploadData.successful > 0 && (!uploadData.errors || uploadData.errors.length === 0)) {
       
        
        // Call completion callback
        if (onImportComplete) {
          onImportComplete({
            imported_count: uploadData.successful,
            total_rows: uploadData.total_rows || uploadData.total,
            errors: uploadData.errors || []
          });
        }
        
        // Close modal
        onClose();
        return;
      }

    } catch (error) {
      console.error('❌ Upload processing failed:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to process file. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Upload failed: ${errorMessage}`);
      
      // Reset file if there was an error
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, isProcessing, bulkUploadEmployees, onImportComplete, onClose]);

  // ========================================
  // IMPORT CONFIRMATION
  // ========================================
  
  // Confirm import (if needed for validation-only mode)
  const confirmImport = useCallback(async () => {
    if (!uploadResults || uploadResults.validRows === 0) return;

   

    try {
      setIsProcessing(true);

     
      // Call completion callback
      if (onImportComplete) {
        onImportComplete({
          imported_count: uploadResults.validRows,
          total_rows: uploadResults.totalRows,
          errors: uploadResults.errors || []
        });
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('❌ Import confirmation failed:', error);
      alert('❌ Failed to confirm import. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadResults, onImportComplete, onClose]);

  // ========================================
  // FORM RESET
  // ========================================
  
  // Reset form
  const resetForm = useCallback(() => {
  
    setUploadedFile(null);
    setUploadResults(null);
    setValidationErrors([]);
    setIsProcessing(false);
  }, []);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Upload className="w-5 h-5 text-almet-sapphire mr-2" />
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Bulk Import Employees</h2>
              <p className={`text-xs ${textMuted}`}>
                Upload an Excel or CSV file to import multiple employees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <X size={18} className={textSecondary} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {!uploadedFile ? (
            // Upload Section
            <>
              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className={`font-medium text-blue-800 dark:text-blue-300 mb-1 text-sm`}>How to use Bulk Import</h3>
                    <ol className={`text-xs text-blue-600 dark:text-blue-400 space-y-0.5 list-decimal list-inside`}>
                      <li>Download the Excel template below</li>
                      <li>Fill in your employee data in the template</li>
                      <li>Save and upload the completed file</li>
                      <li>Review and confirm the import</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="mb-4">
                <button
                  onClick={downloadTemplate}
                  disabled={isProcessing || loading.template}
                  className={`${btnSecondary} px-4 py-2 rounded-lg flex items-center text-sm transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing || loading.template ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Download Excel Template
                    </>
                  )}
                </button>
                <p className={`text-[10px] ${textMuted} mt-1`}>
                  Contains sample data and all required fields
                </p>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed ${
                  dragActive 
                    ? 'border-almet-sapphire bg-blue-50 dark:bg-blue-900/20' 
                    : borderColor
                } rounded-xl p-6 transition-colors`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload className={`w-12 h-12 ${textMuted} mx-auto mb-3`} />
                  <h3 className={`${textPrimary} text-base font-medium mb-2`}>
                    Drop your Excel file here
                  </h3>
                  <p className={`${textMuted} mb-3 text-sm`}>
                    or click to browse and select a file
                  </p>
                  <label className="cursor-pointer">
                    <span className={`${btnPrimary} px-4 py-2 rounded-lg text-sm transition-colors inline-flex items-center`}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Choose File
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className={`${textMuted} text-[10px] mt-2`}>
                    Supported formats: Excel (.xlsx, .xls), CSV (.csv) | Max size: 10MB
                  </p>
                </div>
              </div>
            </>
          ) : (
            // File Processing Section
            <div className="space-y-4">
              {/* File Info */}
              <div className={`${bgCard} border ${borderColor} rounded-lg p-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileCheck className="mr-2 text-green-500" size={18} />
                    <div>
                      <p className={`${textPrimary} font-medium text-sm`}>{uploadedFile.name}</p>
                      <p className={`${textMuted} text-xs`}>
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className={`text-red-500 hover:text-red-600 p-1`}
                    disabled={isProcessing}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Processing Button */}
              {!uploadResults && (
                <button
                  onClick={processUpload}
                  disabled={isProcessing || loading.upload}
                  className={`${btnPrimary} px-4 py-2 rounded-lg text-sm w-full sm:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing || loading.upload ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                      Processing File...
                    </>
                  ) : (
                    <>
                      <FileCheck size={14} className="mr-2" />
                      Validate & Process
                    </>
                  )}
                </button>
              )}

              {/* Results */}
              {uploadResults && (
                <div className="space-y-3">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {uploadResults.totalRows}
                      </div>
                      <div className={`text-xs ${textMuted}`}>Total Rows</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {uploadResults.validRows}
                      </div>
                      <div className={`text-xs ${textMuted}`}>Valid</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">
                        {uploadResults.invalidRows}
                      </div>
                      <div className={`text-xs ${textMuted}`}>Invalid</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                        {validationErrors.length}
                      </div>
                      <div className={`text-xs ${textMuted}`}>Errors</div>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        <h3 className={`font-medium text-red-800 dark:text-red-300 text-sm`}>
                          Validation Errors ({validationErrors.length})
                        </h3>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-xs text-red-700 dark:text-red-400">
                            <span className="font-medium">Row {error.row || index + 1}:</span> {error.message || error}
                            {error.value && (
                              <span className="ml-1 px-1 py-0.5 bg-red-100 dark:bg-red-800 rounded text-[10px]">
                                "{error.value}"
                              </span>
                            )}
                          </div>
                        ))}
                        {validationErrors.length > 10 && (
                          <div className="text-xs text-red-600 dark:text-red-400 italic">
                            ... and {validationErrors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Import Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={confirmImport}
                      disabled={uploadResults.validRows === 0 || isProcessing}
                      className={`${btnPrimary} px-4 py-2 rounded-lg text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} className="mr-2" />
                          Import {uploadResults.validRows} Valid Employees
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetForm}
                      disabled={isProcessing}
                      className={`${btnSecondary} px-4 py-2 rounded-lg text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Upload size={14} className="mr-2" />
                      Upload Different File
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadForm;