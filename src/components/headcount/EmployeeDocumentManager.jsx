// src/components/headcount/EmployeeDocumentManager.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  Lock,
  File,
  FileCheck,
  Award,
  Briefcase,
  Heart,
  GraduationCap,
  Plus,
  Loader
} from "lucide-react";
import { apiService } from "@/services/api";

const EmployeeDocumentManager = ({ employeeId, employeeData, darkMode }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    document_name: '',
    document_type: 'OTHER',
    description: '',
    expiry_date: '',
    is_confidential: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Theme classes
  const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-comet" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode
    ? "bg-almet-comet hover:bg-almet-san-juan text-almet-bali-hai"
    : "bg-white hover:bg-almet-mystic text-almet-waterloo border border-gray-300";
  const shadowClass = darkMode ? "shadow-lg shadow-black/10" : "shadow-md";
  const bgAccent = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";

  // Document types with icons
  const documentTypes = [
    { value: 'CONTRACT', label: 'Contract', icon: <FileCheck size={16} />, color: 'blue' },
    { value: 'ID', label: 'ID Document', icon: <File size={16} />, color: 'purple' },
    { value: 'CERTIFICATE', label: 'Certificate', icon: <Award size={16} />, color: 'green' },
    { value: 'CV', label: 'CV/Resume', icon: <Briefcase size={16} />, color: 'orange' },
    { value: 'PERFORMANCE', label: 'Performance Review', icon: <FileText size={16} />, color: 'indigo' },
    { value: 'MEDICAL', label: 'Medical', icon: <Heart size={16} />, color: 'red' },
    { value: 'TRAINING', label: 'Training', icon: <GraduationCap size={16} />, color: 'teal' },
    { value: 'OTHER', label: 'Other', icon: <FileText size={16} />, color: 'gray' }
  ];

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getEmployeeDocuments(employeeData?.employee_id);
      
      if (response.data.success) {
        setDocuments(response.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeData?.employee_id) {
      fetchDocuments();
    }
  }, [employeeData?.employee_id]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Auto-fill document name if empty
      if (!uploadForm.document_name) {
        const fileName = file.name.split('.').slice(0, -1).join('.');
        setUploadForm(prev => ({ ...prev, document_name: fileName }));
      }
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.document_name || !uploadForm.document_type) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadData = {
        employee_id: employeeData.employee_id,
        document_file: selectedFile,
        document_name: uploadForm.document_name,
        document_type: uploadForm.document_type,
        description: uploadForm.description,
        expiry_date: uploadForm.expiry_date || null,
        is_confidential: uploadForm.is_confidential
      };

      const response = await apiService.uploadEmployeeDocument(uploadData);

      if (response.data.success) {
        setSuccess('Document uploaded successfully!');
        setShowUploadModal(false);
        resetUploadForm();
        fetchDocuments(); // Refresh list
        
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (documentId, documentName) => {
    if (!confirm(`Are you sure you want to delete "${documentName}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteEmployeeDocument(documentId);
      
      if (response.data.success) {
        setSuccess('Document deleted successfully!');
        fetchDocuments(); // Refresh list
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.error || 'Failed to delete document');
    }
  };

  // Handle download
  // Handle download
const handleDownload = async (doc) => {
  try {
    // Get file extension from original filename
    const fileExt = doc.document_file.split('.').pop().toLowerCase();
    
    // Ensure filename has extension
    let filename = doc.name;
    if (!filename.toLowerCase().endsWith(`.${fileExt}`)) {
      filename = `${filename}.${fileExt}`;
    }
    
    await apiService.downloadEmployeeDocument(doc.document_file, filename);
    setSuccess('Document downloaded successfully!');
    setTimeout(() => setSuccess(null), 2000);
  } catch (err) {
    console.error('Download failed:', err);
    setError('Failed to download document');
    setTimeout(() => setError(null), 3000);
  }
};

  // Reset upload form
  const resetUploadForm = () => {
    setSelectedFile(null);
    setUploadForm({
      document_name: '',
      document_type: 'OTHER',
      description: '',
      expiry_date: '',
      is_confidential: false
    });
  };

  // Get document type info
  const getDocTypeInfo = (type) => {
    return documentTypes.find(dt => dt.value === type) || documentTypes[documentTypes.length - 1];
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if document is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-almet-sapphire animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-green-800 dark:text-green-200 font-medium">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${textPrimary} font-semibold text-sm mb-1`}>
            Document Management
          </h3>
          <p className={`${textMuted} text-xs`}>
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className={`${btnPrimary} px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all duration-200`}
        >
          <Plus size={14} />
          Upload Document
        </button>
      </div>

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {documents.map((doc) => {
            const typeInfo = getDocTypeInfo(doc.document_type);
            const expired = isExpired(doc.expiry_date);

            return (
              <div
                key={doc.id}
                className={`${bgCard} rounded-lg border ${borderColor} p-3 hover:shadow-lg transition-all duration-200 group ${shadowClass}`}
              >
                {/* Document Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30`}>
                    {typeInfo.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.is_confidential && (
                      <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded" title="Confidential">
                        <Lock size={12} className="text-red-600" />
                      </div>
                    )}
                    {expired && (
                      <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded" title="Expired">
                        <AlertCircle size={12} className="text-orange-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Info */}
                <div className="mb-3">
                  <h4 className={`${textPrimary} font-semibold text-xs mb-1 line-clamp-2`}>
                    {doc.name}
                  </h4>
                  <p className={`${textMuted} text-[10px] mb-1`}>
                    {typeInfo.label}
                  </p>
                  {doc.description && (
                    <p className={`${textSecondary} text-[10px] line-clamp-2 mb-2`}>
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Document Meta */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className={textMuted}>Size:</span>
                    <span className={textSecondary}>{formatFileSize(doc.file_size)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className={textMuted}>Uploaded:</span>
                    <span className={textSecondary}>{formatDate(doc.uploaded_at)}</span>
                  </div>
                  {doc.expiry_date && (
                    <div className="flex items-center justify-between text-[9px]">
                      <span className={textMuted}>Expires:</span>
                      <span className={`${expired ? 'text-red-600 font-semibold' : textSecondary}`}>
                        {formatDate(doc.expiry_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
  onClick={() => handleDownload(doc)} // Əvvəlki: handleDownload(doc.document_file, doc.name)
  className={`${btnSecondary} flex-1 px-2 py-1.5 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition-all duration-200`}
>
  <Download size={12} />
  Download
</button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 rounded text-[10px] font-medium flex items-center justify-center transition-all duration-200"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${bgAccent} rounded-lg p-8 text-center border ${borderColor}`}>
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <FileText size={24} className={textMuted} />
          </div>
          <h4 className={`text-sm font-semibold ${textPrimary} mb-2`}>No Documents Yet</h4>
          <p className={`${textMuted} text-xs mb-4`}>
            Upload documents to get started
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className={`${btnPrimary} px-4 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-2`}
          >
            <Upload size={14} />
            Upload First Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl max-w-lg w-full ${shadowClass} border ${borderColor}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`${textPrimary} font-bold text-sm`}>Upload Document</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                  setError(null);
                }}
                className={`${textMuted} hover:text-red-600 transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* File Input */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Select File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className={`w-full text-xs ${textPrimary} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-almet-sapphire file:text-white hover:file:bg-almet-astral`}
                />
                {selectedFile && (
                  <p className={`${textMuted} text-[10px] mt-1`}>
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              {/* Document Name */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.document_name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, document_name: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  placeholder="Enter document name"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  placeholder="Optional description"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className={`block ${textPrimary} text-xs font-semibold mb-2`}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={uploadForm.expiry_date}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>

              {/* Confidential Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_confidential"
                  checked={uploadForm.is_confidential}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, is_confidential: e.target.checked }))}
                  className="w-4 h-4 text-almet-sapphire focus:ring-almet-sapphire"
                />
                <label htmlFor="is_confidential" className={`${textPrimary} text-xs font-medium flex items-center gap-2`}>
                  <Lock size={14} />
                  Mark as Confidential
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                  setError(null);
                }}
                className={`${btnSecondary} flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadForm.document_name}
                className={`${btnPrimary} flex-1 px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {uploading ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocumentManager;