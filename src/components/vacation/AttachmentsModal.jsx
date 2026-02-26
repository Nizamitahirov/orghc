// ============================================
// File: components/vacation/AttachmentsModal.jsx
// ============================================
import { X, Paperclip, Download, Trash2, Upload, FileText, Image as ImageIcon, File } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VacationService, VacationHelpers } from '@/services/vacationService';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useTheme } from '@/components/common/ThemeProvider';

export const AttachmentsModal = ({
  show,
  onClose,
  requestId,
  requestNumber,
  canUpload = false,
  canDelete = false,
  onUpdate
}) => {
  const { darkMode } = useTheme();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  
  // Confirmation Modal States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  useEffect(() => {
    if (show && requestId) {
      loadAttachments();
    }
  }, [show, requestId]);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const data = await VacationService.getRequestAttachments(requestId);
      setAttachments(data.attachments || []);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      const validation = VacationHelpers.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles]);
    }
    
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setUploading(true);
    try {
      await VacationService.bulkUploadAttachments(requestId, uploadFiles);
      setUploadFiles([]);
      await loadAttachments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (attachment) => {
    setAttachmentToDelete(attachment);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!attachmentToDelete) return;

    setDeleteLoading(true);
    try {
      await VacationService.deleteAttachment(attachmentToDelete.id);
      await loadAttachments();
      if (onUpdate) onUpdate();
      setShowDeleteConfirm(false);
      setAttachmentToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteLoading) {
      setShowDeleteConfirm(false);
      setAttachmentToDelete(null);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeUploadFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType) => {
    const iconType = VacationHelpers.getFileIcon(fileType);
    const iconClass = "w-5 h-5";
    
    switch(iconType) {
      case 'image':
        return <ImageIcon className={`${iconClass} text-purple-600`} />;
      case 'pdf':
        return <FileText className={`${iconClass} text-red-600`} />;
      case 'doc':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'xls':
        return <FileText className={`${iconClass} text-green-600`} />;
      default:
        return <File className={`${iconClass} text-gray-600`} />;
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-almet-sapphire/10 to-transparent dark:from-almet-sapphire/20 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-almet-sapphire" />
                Attachments - {requestNumber}
              </h2>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                {attachments.length} file(s) attached
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Upload Section */}
            {canUpload && (
              <div className="mb-6 pb-6 border-b border-almet-mystic/30 dark:border-almet-comet/30">
                <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3">Upload New Files</h3>
                
                <label className="block mb-3">
                  <div className="border-2 border-dashed border-almet-mystic dark:border-almet-comet rounded-lg p-4 text-center cursor-pointer hover:border-almet-sapphire dark:hover:border-almet-astral transition-all bg-almet-mystic/10 dark:bg-gray-900/20">
                    <Upload className="w-6 h-6 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-2" />
                    <p className="text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                      Click to select files
                    </p>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                      PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 10MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {uploadFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-almet-cloud-burst dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                              {VacationHelpers.formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUploadFile(index)}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadFiles.length > 0 && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full px-4 py-2.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload {uploadFiles.length} file(s)
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Existing Attachments */}
            <div>
              <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3">Existing Attachments</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-almet-sapphire border-t-transparent"></div>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-12">
                  <Paperclip className="w-12 h-12 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">No attachments yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center justify-between p-3 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(attachment.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-almet-cloud-burst dark:text-white truncate">
                            {attachment.original_filename}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                              {attachment.file_size_display}
                            </p>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">•</span>
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                              {attachment.uploaded_by_name}
                            </p>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">•</span>
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                              {new Date(attachment.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleDownload(attachment.file_url, attachment.original_filename)}
                          className="p-2 text-almet-sapphire hover:bg-almet-sapphire/10 dark:hover:bg-almet-sapphire/20 rounded-lg transition-all"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteClick(attachment)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-6 py-4 flex justify-end bg-almet-mystic/10 dark:bg-gray-900/20 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium border border-almet-mystic dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Attachment"
        message={`Are you sure you want to delete "${attachmentToDelete?.original_filename}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
        darkMode={darkMode}
      />
    </>
  );
};