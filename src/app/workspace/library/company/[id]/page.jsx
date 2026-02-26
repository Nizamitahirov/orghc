'use client'
import { 
  ArrowLeft, Folder, FileText, Plus,
  Download, Eye, Edit, Trash2, Building2
} from "lucide-react";
import Link from "next/link";
import { documentService } from "@/services/documentService";
import { useTheme } from "@/components/common/ThemeProvider";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/common/Toast";
// app/workspace/library/company/[id]/page.jsx

const EditFolderModal = ({ isOpen, onClose, folder, companyId, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    order: 0
  });

  useEffect(() => {
    if (folder) {
      setFormData({
        name: folder.name,
        description: folder.description || '',
        icon: folder.icon || '📁',
        order: folder.order || 0
      });
    }
  }, [folder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      
      // CRITICAL: company field əlavə et (required field)
      const data = {
        company: companyId,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        order: formData.order
      };

      await documentService.updateFolder(folder.id, data);
      showSuccess('Folder updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update folder: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !folder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-4">
          <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white mb-4">
            Edit Folder
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Folder Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                  min={0}
                />
              </div>
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



const FolderCard = ({ folder, onDelete, onEdit }) => (
  <Link href={`/workspace/library/folder/${folder.id}`}>
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Folder className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[11px] text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
              {folder.name}
            </h3>
            <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai">
              {folder.document_count} documents
            </p>
          </div>
        </div>
        
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(folder);
            }}
            className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/10 text-blue-600 dark:text-blue-400 transition-all"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(folder);
            }}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-all"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {folder.description && (
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai line-clamp-2">
          {folder.description}
        </p>
      )}
    </div>
  </Link>
);

const DocumentCard = ({ doc, onView, onDownload, onDelete }) => (
  <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-200 hover:shadow-md group">
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <FileText className="h-4 w-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h4 className="font-semibold text-[11px] text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors truncate">
            {doc.title}
          </h4>
          <button
            onClick={() => onDelete(doc)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-steel-blue/10 dark:text-almet-steel-blue">
            {doc.document_type}
          </span>
          <span className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai">
            {doc.file_size_display}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-[9px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {doc.view_count}
          </span>
          <span className="flex items-center gap-0.5">
            <Download className="h-3 w-3" />
            {doc.download_count}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => onView(doc)}
            className="flex items-center gap-0.5 text-[10px] text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 px-2 py-1 rounded transition-all font-medium"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
          <button
            onClick={() => onDownload(doc)}
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

const CreateFolderModal = ({ isOpen, onClose, companyId, onSuccess }) => {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await documentService.createFolder({
        company: companyId,
        name: formData.name,
        description: formData.description,
        icon: formData.icon
      });
      
      alert('Folder created successfully!');
      onSuccess();
      onClose();
      setFormData({ name: '', description: '', icon: '📁' });
    } catch (error) {
      alert('Failed to create folder: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-4">
          <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white mb-4">
            Create New Folder
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Folder Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                required
                placeholder="e.g., HR Policies"
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
                placeholder="Brief description"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Icon (Emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                maxLength={2}
              />
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
                disabled={creating}
                className="flex-1 px-3 py-1.5 rounded-lg bg-almet-sapphire text-white hover:bg-almet-astral transition-all text-[11px] font-semibold disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function CompanyDocumentsPage() {
  const { darkMode } = useTheme();
  const params = useParams();
  const router = useRouter();
  const companyId = params.id;

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [folders, setFolders] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [editFolderModalOpen, setEditFolderModalOpen] = useState(false);
const [selectedFolder, setSelectedFolder] = useState(null);

const handleEditFolder = (folder) => {
  setSelectedFolder(folder);
  setEditFolderModalOpen(true);
};
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, foldersData] = await Promise.all([
        documentService.getCompany(companyId),
        documentService.getCompanyFolders(companyId)
      ]);
      
      setCompany(companyData);
      setFolders(foldersData);
      
      if (foldersData.length > 0) {
        const allDocs = await documentService.getDocuments({
          company: companyId,
          ordering: '-updated_at'
        });
        const docs = Array.isArray(allDocs) ? allDocs : (allDocs.results || []);
        setRecentDocs(docs.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (doc) => {
    await documentService.trackView(doc.id);
    window.open(doc.document_url, '_blank');
  };

  const handleDownloadDocument = async (doc) => {
    await documentService.trackDownload(doc.id);
    const link = document.createElement('a');
    link.href = doc.document_url;
    link.download = doc.title;
    link.click();
  };

  const handleDeleteFolder = async (folder) => {
    if (confirm(`Delete "${folder.name}" folder?`)) {
      try {
        await documentService.deleteFolder(folder.id);
        alert('Folder deleted!');
        loadData();
      } catch (error) {
        alert('Failed to delete: ' + error.message);
      }
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (confirm(`Delete "${doc.title}"?`)) {
      try {
        await documentService.deleteDocument(doc.id);
        alert('Document deleted!');
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-almet-sapphire"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/workspace/library')}
              className="p-1.5 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4 text-almet-waterloo dark:text-almet-bali-hai" />
            </button>
            <div className={`w-10 h-10 rounded-lg ${company?.color || 'bg-gradient-to-br from-almet-sapphire to-almet-astral'} flex items-center justify-center`}>
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-base font-bold ${textPrimary}`}>
                {company?.name}
              </h1>
              <p className={`${textSecondary} text-[10px]`}>
                {folders.length} folders • {company?.total_documents} documents
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setCreateFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all text-[11px] font-semibold shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Folder
          </button>
        </div>

        {/* Folders Grid */}
        <div>
          <h2 className={`text-xs font-bold ${textPrimary} mb-2 uppercase tracking-wide`}>Folders</h2>
          {folders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {folders.map((folder) => (
  <FolderCard
    key={folder.id}
    folder={folder}
    onDelete={handleDeleteFolder}
    onEdit={handleEditFolder}
  />
))}

            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-almet-cloud-burst rounded-lg border border-dashed border-almet-mystic dark:border-almet-san-juan">
              <Folder className="h-12 w-12 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-2" />
              <p className={`${textSecondary} text-[11px] mb-1`}>No folders yet</p>
              <button 
                onClick={() => setCreateFolderModalOpen(true)}
                className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline"
              >
                Create your first folder
              </button>
            </div>
          )}
        </div>

        {/* Recent Documents */}
        {recentDocs.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold ${textPrimary} mb-2 uppercase tracking-wide`}>Recent Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          </div>
        )}
      </div>
<EditFolderModal
  isOpen={editFolderModalOpen}
  onClose={() => {
    setEditFolderModalOpen(false);
    setSelectedFolder(null);
  }}
  companyId={companyId} 
  folder={selectedFolder}
  onSuccess={loadData}
/>
      <CreateFolderModal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        companyId={companyId}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}