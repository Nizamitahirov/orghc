"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { 
  ArrowLeft, FileText, Upload, Download, Eye, 
  Trash2, Search, Grid, List, Calendar, Building2,Edit
} from "lucide-react";
import { documentService } from "@/services/documentService";

// app/workspace/library/folder/[id]/page.jsx

const EditDocumentModal = ({ isOpen, onClose, document, folderId, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'other',
    file: null,
    replaceFile: false
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description || '',
        document_type: document.document_type,
        file: null,
        replaceFile: false
      });
    }
  }, [document]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const data = new FormData();
      
      // CRITICAL: folder field əlavə et (required field)
      data.append('folder', folderId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('document_type', formData.document_type);
      
      // Əgər yeni fayl seçilibsə, əlavə et
      if (formData.replaceFile && formData.file) {
        data.append('document_file', formData.file);
      }
      
      // Use PATCH instead of PUT for partial update
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/files/${document.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: data
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || JSON.stringify(error));
      }

      showSuccess('Document updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white mb-4">
            Edit Document
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Document Type *
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                required
              >
                <option value="policy">Policy</option>
                <option value="procedure">Procedure</option>
                <option value="guideline">Guideline</option>
                <option value="manual">Manual</option>
                <option value="template">Template</option>
                <option value="form">Form</option>
                <option value="reference">Reference</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Current File Info */}
            <div className="bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-lg p-2">
              <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai mb-1">
                Current file:
              </p>
              <p className="text-[10px] font-medium text-almet-cloud-burst dark:text-white">
                {document.file_extension} • {document.file_size_display}
              </p>
            </div>

            {/* Replace File Option */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.replaceFile}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    replaceFile: e.target.checked,
                    file: null 
                  })}
                  className="rounded border-almet-mystic dark:border-almet-san-juan"
                />
                <span className="text-[11px] font-semibold text-almet-cloud-burst dark:text-white">
                  Replace file
                </span>
              </label>
            </div>

            {formData.replaceFile && (
              <div>
                <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                  New File (PDF, DOCX, XLSX, PPTX - Max 20MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.pptx,.txt,.doc,.xls,.ppt"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                />
                {formData.file && (
                  <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai mt-1">
                    {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-all text-[11px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex-1 px-3 py-1.5 rounded-lg bg-almet-sapphire text-white hover:bg-almet-astral transition-all text-[11px] font-semibold disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};



// DocumentCard update - edit button əlavə et
const DocumentCard = ({ document, onView, onDownload, onDelete, onEdit }) => (
  <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-200 hover:shadow-md group">
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <FileText className="h-4 w-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h4 className="font-semibold text-[11px] text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors truncate">
            {document.title}
          </h4>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(document);
              }}
              className="p-0.5 rounded hover:bg-blue-50 text-blue-600"
            >
              <Edit className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document);
              }}
              className="p-0.5 rounded hover:bg-red-50 text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {document.description && (
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai line-clamp-1 mb-1">
            {document.description}
          </p>
        )}
        
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-steel-blue/10 dark:text-almet-steel-blue">
            {document.document_type}
          </span>
          <span className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai">
            {document.file_size_display}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-[9px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {document.view_count}
          </span>
          <span className="flex items-center gap-0.5">
            <Download className="h-3 w-3" />
            {document.download_count}
          </span>
          <span className="flex items-center gap-0.5">
            <Calendar className="h-3 w-3" />
            {new Date(document.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(document);
            }}
            className="flex items-center gap-0.5 text-[10px] text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 px-2 py-1 rounded transition-all font-medium"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(document);
            }}
            className="flex items-center gap-0.5 text-[10px] text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 px-2 py-1 rounded transition-all font-medium"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      </div>
    </div>
  </div>
);

// DocumentListRow-a da eyni edit button əlavə et
const DocumentListRow = ({ document, onView, onDownload, onDelete, onEdit }) => (
  <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-2.5 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-200 hover:shadow-md group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <FileText className="h-4 w-4 text-white" />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-12 gap-2 items-center">
        <div className="col-span-4">
          <h3 className="font-semibold text-[11px] text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire transition-colors truncate">
            {document.title}
          </h3>
          {document.description && (
            <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai truncate">
              {document.description}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-steel-blue/10 dark:text-almet-steel-blue">
            {document.document_type}
          </span>
        </div>

        <div className="col-span-2 text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
          {document.file_size_display}
        </div>

        <div className="col-span-2 text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {document.view_count}
            </span>
            <span className="flex items-center gap-0.5">
              <Download className="h-3 w-3" />
              {document.download_count}
            </span>
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-end gap-1">
          <button
            onClick={() => onView(document)}
            className="p-1.5 rounded hover:bg-almet-sapphire/10 text-almet-sapphire transition-all"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDownload(document)}
            className="p-1.5 rounded hover:bg-almet-sapphire/10 text-almet-sapphire transition-all"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(document)}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-all"
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(document)}
            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-all"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
const UploadModal = ({ isOpen, onClose, folderId, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'other',
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      showError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('folder', folderId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('document_type', formData.document_type);
      data.append('document_file', formData.file);
      
      await documentService.createDocument(data);
      showSuccess('Document uploaded successfully!');
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', document_type: 'other', file: null });
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white mb-4">
            Upload New Document
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Document Type *
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                required
              >
                <option value="policy">Policy</option>
                <option value="procedure">Procedure</option>
                <option value="guideline">Guideline</option>
                <option value="manual">Manual</option>
                <option value="template">Template</option>
                <option value="form">Form</option>
                <option value="reference">Reference</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                File * (PDF, DOCX, XLSX, PPTX - Max 20MB)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.xlsx,.pptx,.txt,.doc,.xls,.ppt"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                required
              />
              {formData.file && (
                <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai mt-1">
                  {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-all text-[11px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-3 py-1.5 rounded-lg bg-almet-sapphire text-white hover:bg-almet-astral transition-all text-[11px] font-semibold disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function FolderDocumentsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const params = useParams();
  const router = useRouter();
  const folderId = params.id;

  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editDocModalOpen, setEditDocModalOpen] = useState(false);
const [selectedDocument, setSelectedDocument] = useState(null);

const handleEditDocument = (doc) => {
  setSelectedDocument(doc);
  setEditDocModalOpen(true);
};
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";

  useEffect(() => {
    loadData();
  }, [folderId]);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, filterType, documents]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load folder info
      const folderData = await documentService.getFolder(folderId);
      setFolder(folderData);
      
      // Load documents for this folder
      const docsData = await documentService.getFolderDocuments(folderId);
      

      
      // Handle different response formats
      let documentsArray = [];
      if (Array.isArray(docsData)) {
        documentsArray = docsData;
      } else if (docsData.results) {
        documentsArray = docsData.results;
      } else if (docsData.data) {
        documentsArray = docsData.data;
      }
 
      
      setDocuments(documentsArray);
      setFilteredDocs(documentsArray);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load documents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.document_type === filterType);
    }

    setFilteredDocs(filtered);
  };

  const handleViewDocument = async (doc) => {
    try {
      await documentService.trackView(doc.id);
      window.open(doc.document_url, '_blank');
    } catch (error) {
      showError('Failed to open document');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      await documentService.trackDownload(doc.id);
      const link = document.createElement('a');
      link.href = doc.document_url;
      link.download = doc.title;
      link.click();
      showSuccess('Document downloaded!');
    } catch (error) {
      showError('Failed to download');
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (confirm(`Delete "${doc.title}"?`)) {
      try {
        await documentService.deleteDocument(doc.id);
        showSuccess('Document deleted!');
        loadData();
      } catch (error) {
        showError('Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading documents..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4 text-almet-waterloo dark:text-almet-bali-hai" />
            </button>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Building2 className="h-3 w-3 text-almet-waterloo dark:text-almet-bali-hai" />
                <span className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai">
                  {folder?.company_name}
                </span>
              </div>
              <h1 className={`text-base font-bold ${textPrimary}`}>
                {folder?.name}
              </h1>
              <p className={`${textSecondary} text-[10px]`}>
                {documents.length} documents
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all text-[11px] font-semibold shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50">
          <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-[11px] rounded-lg border border-almet-mystic/50 dark:border-almet-san-juan/50 bg-almet-mystic/20 dark:bg-almet-san-juan/20 ${textPrimary} placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire transition-all`}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-2 rounded-lg border border-almet-mystic/50 dark:border-almet-san-juan/50 bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white text-[10px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
              >
                <option value="all">All Types</option>
                <option value="policy">Policy</option>
                <option value="procedure">Procedure</option>
                <option value="guideline">Guideline</option>
                <option value="manual">Manual</option>
                <option value="template">Template</option>
                <option value="form">Form</option>
                <option value="reference">Reference</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
              
              <div className="flex gap-1 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-almet-sapphire text-white'
                      : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-almet-san-juan'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-almet-sapphire text-white'
                      : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-almet-san-juan'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        {filteredDocs.length > 0 ? (
  viewMode === 'grid' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {filteredDocs.map((doc) => (
        <DocumentCard
          key={doc.id}  // Add this line
          document={doc}
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
          onDelete={handleDeleteDocument}
          onEdit={handleEditDocument}
        />
      ))}
    </div>
  ) : (
    <div className="space-y-2">
      {filteredDocs.map((doc) => (
        <DocumentListRow
          key={doc.id}  // Add this line
          document={doc}
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
          onDelete={handleDeleteDocument}
          onEdit={handleEditDocument}  // Also add onEdit here
        />
      ))}
    </div>
  )
) : (
          <div className="text-center py-12 bg-white dark:bg-almet-cloud-burst rounded-lg border border-dashed border-almet-mystic dark:border-almet-san-juan">
            <FileText className="h-12 w-12 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-2" />
            <p className={`${textSecondary} text-[11px] mb-1`}>
              {searchQuery || filterType !== 'all' ? 'No documents found' : 'No documents yet'}
            </p>
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline"
            >
              Upload your first document
            </button>
          </div>
        )}
      </div>
      

<EditDocumentModal
  isOpen={editDocModalOpen}
  onClose={() => {
    setEditDocModalOpen(false);
    setSelectedDocument(null);
  }}
  document={selectedDocument}
   folderId={folderId} 
  onSuccess={loadData}
/>
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folderId={folderId}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}