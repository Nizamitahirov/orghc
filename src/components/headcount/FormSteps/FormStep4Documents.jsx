// src/components/headcount/FormSteps/FormStep4Documents.jsx - REDESIGNED
import { useState } from "react";
import { Check, X, Upload, File, AlertCircle, Info, FileText, Award, IdCard, Heart } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * TƏKMİLLƏŞDİRİLMİŞ DOCUMENTS STEP
 * - Kompakt və sadə upload area
 * - Kiçik font və elementlər
 * - Yumşaq rənglər
 * - User-friendly interface
 */
const FormStep4Documents = ({ 
  formData, 
  handleDocumentUpload, 
  removeDocument, 
  validationErrors = {},
  documentTypes = [],
  fileInputRef = null
}) => {
  const { darkMode } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("OTHER");
  const [documentName, setDocumentName] = useState("");

  // TƏKMİLLƏŞDİRİLMİŞ THEME CLASSES
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-200";

  const defaultDocumentTypes = [
    { value: "CONTRACT", label: "Contract" },
    { value: "ID", label: "ID Document" },
    { value: "CERTIFICATE", label: "Certificate" },
    { value: "CV", label: "CV/Resume" },
    { value: "PERFORMANCE", label: "Performance" },
    { value: "MEDICAL", label: "Medical" },
    { value: "TRAINING", label: "Training" },
    { value: "OTHER", label: "Other" }
  ];

  const availableDocumentTypes = documentTypes.length > 0 ? documentTypes : defaultDocumentTypes;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    setUploadError("");
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only PDF, Word, Excel, images, and text files allowed");
      return;
    }

    const document = {
      name: documentName || file.name,
      document_name: documentName || file.name,
      document_type: selectedDocumentType,
      size: file.size,
      type: file.type,
      file: file,
      dateUploaded: new Date()
    };

    handleDocumentUpload(document);
    
    setDocumentName("");
    setSelectedDocumentType("OTHER");
    
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveDocument = (index) => {
    removeDocument(index);
    
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type, documentType) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (documentType) {
      case 'CONTRACT':
        return <FileText {...iconProps} className="h-4 w-4 text-almet-sapphire" />;
      case 'ID':
        return <IdCard {...iconProps} className="h-4 w-4 text-purple-500" />;
      case 'CERTIFICATE':
        return <Award {...iconProps} className="h-4 w-4 text-yellow-500" />;
      case 'CV':
        return <FileText {...iconProps} className="h-4 w-4 text-green-500" />;
      case 'MEDICAL':
        return <Heart {...iconProps} className="h-4 w-4 text-red-500" />;
      default:
        if (type.includes('pdf')) return <FileText {...iconProps} className="h-4 w-4 text-red-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText {...iconProps} className="h-4 w-4 text-blue-500" />;
        if (type.includes('image')) return <File {...iconProps} className="h-4 w-4 text-green-500" />;
        return <File {...iconProps} className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDocumentTypeBadge = (type) => {
    const colors = {
      'CONTRACT': 'bg-almet-sapphire/10 text-almet-sapphire',
      'ID': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'CERTIFICATE': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'CV': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'PERFORMANCE': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      'MEDICAL': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'TRAINING': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      'OTHER': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[type] || colors['OTHER'];
  };

  return (
    <div className="space-y-4">
      {/* HEADER - kompakt */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className={`text-sm font-semibold ${textPrimary}`}>
          Documents & Files
        </h2>
        <div className="text-[10px] px-2 py-0.5 bg-almet-sapphire/10 text-almet-sapphire rounded font-medium">
          Step 4/4 (Optional)
        </div>
      </div>

      {/* UPLOAD SECTION - kompakt */}
      <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
        <h3 className={`text-xs font-semibold ${textPrimary} mb-2 flex items-center gap-1`}>
          <File className="text-almet-sapphire" size={14} />
          Upload Documents
        </h3>

        {/* TYPE & NAME SELECTION - kompakt */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <FormField
            label="Document Type"
            name="document_type"
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            type="select"
            options={availableDocumentTypes}
            required={false}
            helpText="Category"
          />

          <FormField
            label="Custom Name"
            name="document_name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Optional"
            helpText="Leave blank for original"
          />
        </div>

        {/* UPLOAD AREA - kompakt */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
            dragActive
              ? "border-almet-sapphire bg-almet-sapphire/5 dark:bg-blue-900/20"
              : `${borderColor} hover:border-almet-sapphire hover:bg-gray-50 dark:hover:bg-gray-700/30`
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`mx-auto h-8 w-8 ${textMuted} mb-2`} />
          <p className={`text-xs font-medium ${textPrimary} mb-0.5`}>
            Drop files or click to browse
          </p>
          <p className={`text-[10px] ${textMuted} mb-2`}>
            PDF, Word, Excel, Images, Text (Max 10MB)
          </p>
          
          <input
            type="file"
            onChange={handleFileInput}
            className="hidden"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.txt"
          />
          
          <label
            htmlFor=""
            onClick={() => fileInputRef?.current?.click()}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all inline-flex items-center ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Upload size={12} className="mr-1" />
            Choose Files
          </label>
        </div>

        {/* UPLOAD ERROR - kompakt */}
        {uploadError && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
            </div>
          </div>
        )}

        {/* VALIDATION ERROR - kompakt */}
        {validationErrors.documents && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.documents}</p>
            </div>
          </div>
        )}
      </div>

      {/* UPLOADED DOCUMENTS LIST - kompakt */}
      {formData.documents && formData.documents.length > 0 && (
        <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
          <h3 className={`text-xs font-semibold ${textPrimary} mb-2`}>
            Uploaded Documents ({formData.documents.length})
          </h3>
          
          <div className="space-y-2">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 border ${borderColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors`}
              >
                <div className="flex items-center flex-1 min-w-0 gap-2">
                  <div className="flex-shrink-0">
                    {getFileIcon(doc.type, doc.document_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`text-xs font-medium ${textPrimary} truncate`}>
                        {doc.document_name || doc.name}
                      </p>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded flex-shrink-0 ${getDocumentTypeBadge(doc.document_type)}`}>
                        {availableDocumentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                      </span>
                    </div>
                    <p className={`text-[10px] ${textMuted}`}>
                      {formatFileSize(doc.size)} • {doc.dateUploaded ? 
                        new Date(doc.dateUploaded).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDocument(index)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INFO MESSAGE - kompakt */}
      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-0.5">
              Document Upload (Optional)
            </p>
            <p className="text-[10px] text-blue-700 dark:text-blue-400">
              Upload contracts, certificates, or other relevant documents. You can add more documents later from the employee profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep4Documents;