import { useState, useEffect } from "react";
import {
  FolderOpen,
  ArrowLeft,
  FolderPlus,
  Edit2,
  Trash2,
  ChevronRight,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import {
  getFoldersByCompany,
  createFolder,
  updateFolder,
  deleteFolder,
} from "@/services/policyService";

export default function FoldersView({
  selectedCompany,
  darkMode,
  onBack,
  onSelectFolder,
  confirmModal,
  setConfirmModal,
  userAccess, // ✅ Add userAccess prop
}) {
  const { showSuccess, showError, showWarning } = useToast();
  
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  
  const [folderForm, setFolderForm] = useState({
    name: "",
    description: "",
    icon: "📁"
  });

  useEffect(() => {
    loadFolders();
  }, [selectedCompany]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const data = await getFoldersByCompany(selectedCompany.type, selectedCompany.id);
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      showError("Failed to load folders");
      console.error('Error loading folders:', err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    // ✅ Check access
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to create folders');
      return;
    }

    if (!folderForm.name.trim()) {
      showWarning("Please enter folder name");
      return;
    }

    setSubmitting(true);
    try {
      const folderData = {
        name: folderForm.name,
        description: folderForm.description,
        icon: folderForm.icon,
        is_active: true,
      };

      if (selectedCompany.type === 'business_function') {
        folderData.business_function = selectedCompany.id;
        folderData.policy_company = null;
      } else {
        folderData.policy_company = selectedCompany.id;
        folderData.business_function = null;
      }

      await createFolder(folderData);
      await loadFolders();

      setFolderForm({ name: "", description: "", icon: "📁" });
      setShowCreateFolder(false);
      showSuccess("Folder created successfully!");
    } catch (err) {
      showError(err.message || "Failed to create folder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFolder = async () => {
    // ✅ Check access
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to update folders');
      return;
    }

    if (!folderForm.name.trim()) {
      showWarning("Please enter folder name");
      return;
    }

    setSubmitting(true);
    try {
      const folderData = {
        name: folderForm.name,
        description: folderForm.description,
        icon: folderForm.icon,
        is_active: true,
      };

      if (selectedCompany.type === 'business_function') {
        folderData.business_function = selectedCompany.id;
        folderData.policy_company = null;
      } else {
        folderData.policy_company = selectedCompany.id;
        folderData.business_function = null;
      }

      await updateFolder(editingFolder.id, folderData);
      await loadFolders();

      resetFolderModal();
      showSuccess("Folder updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to update folder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFolder = (folderId, folderName, policyCount) => {
    // ✅ Check access
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to delete folders');
      return;
    }

    if (policyCount > 0) {
      showWarning(`Cannot delete folder "${folderName}" - it contains ${policyCount} policies. Please delete all policies first.`);
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: "Delete Folder",
      message: `Are you sure you want to delete "${folderName}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteFolder(folderId);
          await loadFolders();
          showSuccess("Folder deleted successfully!");
        } catch (err) {
          showError(err.message || "Failed to delete folder");
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const startEditFolder = (folder, e) => {
    e.stopPropagation();
    // ✅ Check access
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to edit folders');
      return;
    }
    setEditingFolder(folder);
    setFolderForm({
      name: folder.name,
      description: folder.description || "",
      icon: folder.icon || "📁",
    });
    setShowEditFolder(true);
  };

  const resetFolderModal = () => {
    setFolderForm({ name: "", description: "", icon: "📁" });
    setEditingFolder(null);
    setShowCreateFolder(false);
    setShowEditFolder(false);
  };

  const openCreateModal = () => {
    // ✅ Check access before opening
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to create folders');
      return;
    }
    setShowCreateFolder(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-4 px-3 py-1.5 text-sm rounded-lg transition-all ${
            darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to companies
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCompany.name} - Policy Folders
                </h1>
                {selectedCompany.type === 'policy_company' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    Manual
                  </span>
                )}
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {folders.length} folders available
              </p>
            </div>
          </div>

          {/* ✅ New Folder Button - only show if admin */}
          {userAccess?.is_admin && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => onSelectFolder(folder)}
                className={`group relative rounded-lg border p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50 hover:bg-gray-800"
                    : "bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-lg"
                }`}
              >
                <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-almet-sapphire/5 to-transparent' 
                    : 'bg-gradient-to-br from-almet-mystic/50 to-transparent'
                }`}></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{folder.icon || "📁"}</div>
                    <div className="flex items-center gap-1">
                      {/* ✅ Edit/Delete buttons - only if admin */}
                      {userAccess?.is_admin && (
                        <>
                          <button
                            onClick={(e) => startEditFolder(folder, e)}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                              darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                            }`}
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id, folder.name, folder.policy_count || 0);
                            }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                              darkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-100 text-red-500"
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                        darkMode ? "text-gray-600" : "text-gray-400"
                      }`} />
                    </div>
                  </div>

                  <h3 className={`text-base font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {folder.name}
                  </h3>
                  <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {folder.description || "No description"}
                  </p>

                  <div className="flex items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      <FileText className="w-3.5 h-3.5" />
                      <span>{folder.policy_count || 0} policies</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {folders.length === 0 && !loading && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">No folders in this company</p>
              {userAccess?.is_admin && (
                <button
                  onClick={openCreateModal}
                  className="text-sm text-almet-sapphire hover:text-almet-cloud-burst"
                >
                  Create your first folder
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Folder Modal */}
      {(showCreateFolder || showEditFolder) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {showEditFolder ? "Edit Folder" : "Create New Folder"}
              </h3>
              <button
                onClick={resetFolderModal}
                className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Folder Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Employment Lifecycle"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({...folderForm, name: e.target.value})}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  autoFocus
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  placeholder="Brief description of folder contents..."
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({...folderForm, description: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Icon 
                </label>
                <input
                  type="text"
                  placeholder="📁"
                  value={folderForm.icon}
                  onChange={(e) => setFolderForm({...folderForm, icon: e.target.value})}
                  maxLength={2}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={resetFolderModal}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } disabled:opacity-50 transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={showEditFolder ? handleUpdateFolder : handleCreateFolder}
                disabled={submitting || !folderForm.name.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {showEditFolder ? "Update Folder" : "Create Folder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}