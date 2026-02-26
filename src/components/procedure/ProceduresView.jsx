import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  Eye,
  Download,
  Edit2,
  Trash2,
  ChevronRight,
  Loader2,
  X,
  File,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import Pagination from "@/components/common/Pagination";
import {
  getProceduresByFolder,
  createProcedure,
  partialUpdateProcedure,
  deleteProcedure,
  trackProcedureView,
  trackProcedureDownload,
  validatePDFFile,
} from "@/services/procedureService";

export default function ProceduresView({
  selectedCompany,
  selectedFolder,
  darkMode,
  onBack,
  onViewProcedure,
  confirmModal,
  setConfirmModal,
  userAccess,
}) {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Data state
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [showAddProcedure, setShowAddProcedure] = useState(false);
  const [showEditProcedure, setShowEditProcedure] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  
  // Form state
  const [procedureForm, setProcedureForm] = useState({
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadProcedures(selectedFolder.id);
    setCurrentPage(1);
  }, [selectedFolder.id]);

  const loadProcedures = async (folderId) => {
    setLoading(true);
    try {
      const data = await getProceduresByFolder(folderId);
      setProcedures(Array.isArray(data) ? data : []);
    } catch (err) {
      showError("Failed to load procedures");
      console.error('Error loading procedures:', err);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  // Paginated procedures
  const paginatedProcedures = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return procedures.slice(startIndex, startIndex + itemsPerPage);
  }, [procedures, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(procedures.length / itemsPerPage);

  const handleAddProcedure = async () => {
    if (!procedureForm.title.trim() || !selectedFile) {
      showWarning("Please provide title and PDF file");
      return;
    }

    const validation = validatePDFFile(selectedFile);
    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    setSubmitting(true);
    try {
      const procedureData = {
        folder: selectedFolder.id,
        title: procedureForm.title,
        description: procedureForm.description,
        procedure_file: selectedFile,
        is_active: true,
      };

      await createProcedure(procedureData);
      await loadProcedures(selectedFolder.id);

      resetProcedureModal();
      showSuccess("Procedure added successfully!");
    } catch (err) {
      console.error('Create procedure error:', err);
      showError(err.error || err.message || "Failed to create procedure");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProcedure = async () => {
    if (!procedureForm.title.trim()) {
      showWarning("Please provide title");
      return;
    }

    if (selectedFile) {
      const validation = validatePDFFile(selectedFile);
      if (!validation.valid) {
        showError(validation.error);
        return;
      }
    }

    setSubmitting(true);
    try {
      const procedureData = {
        folder: selectedFolder.id,
        title: procedureForm.title,
        description: procedureForm.description,
      };

      if (selectedFile) {
        procedureData.procedure_file = selectedFile;
      }

      await partialUpdateProcedure(editingProcedure.id, procedureData);
      await loadProcedures(selectedFolder.id);

      resetProcedureModal();
      showSuccess("Procedure updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to update procedure");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProcedure = (procedureId, procedureTitle) => {
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to delete procedures');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Procedure",
      message: `Are you sure you want to delete "${procedureTitle}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteProcedure(procedureId);
          await loadProcedures(selectedFolder.id);
          showSuccess("Procedure deleted successfully!");
        } catch (err) {
          showError(err.message || "Failed to delete procedure");
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const handleViewPDF = async (procedure) => {
    try {
      await trackProcedureView(procedure.id);
      onViewProcedure(procedure);
    } catch (err) {
      console.error('Error tracking view:', err);
      onViewProcedure(procedure);
    }
  };

  const handleDownloadPDF = async (procedure) => {
    try {
      await trackProcedureDownload(procedure.id);
      
      const link = document.createElement("a");
      link.href = procedure.procedure_url || procedure.procedure_file;
      link.download = `${procedure.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess("Download started!");
      await loadProcedures(selectedFolder.id);
    } catch (err) {
      console.error('Error downloading:', err);
      showError("Failed to download procedure");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validatePDFFile(file);
      if (validation.valid) {
        setSelectedFile(file);
        showInfo(`File selected: ${file.name}`);
      } else {
        showError(validation.error);
        e.target.value = null;
      }
    }
  };

  const startEditProcedure = (procedure) => {
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to edit procedures');
      return;
    }
    setEditingProcedure(procedure);
    setProcedureForm({
      title: procedure.title,
      description: procedure.description || "",
    });
    setShowEditProcedure(true);
  };

  const resetProcedureModal = () => {
    setProcedureForm({
      title: "",
      description: "",
    });
    setSelectedFile(null);
    setEditingProcedure(null);
    setShowAddProcedure(false);
    setShowEditProcedure(false);
  };

  const openAddModal = () => {
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to add procedures');
      return;
    }
    setShowAddProcedure(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-4 px-3 py-1.5 text-sm rounded-lg transition-all ${
            darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Folders
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className={darkMode ? "text-gray-500" : "text-gray-400"}>
            {selectedCompany.name}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className={darkMode ? "text-white" : "text-gray-900"}>
            {selectedFolder.name}
          </span>
        </div>

        {/* Title and Add Procedure Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{selectedFolder.icon || "📋"}</div>
            <div>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedFolder.name}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {procedures.length} procedures
              </p>
            </div>
          </div>

          {userAccess?.is_admin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
            >
              <Upload className="w-4 h-4" />
              Add Procedure
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
        </div>
      ) : procedures.length === 0 ? (
        // Empty State
        <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm mb-2">No procedures in this folder</p>
          {userAccess?.is_admin && (
            <button
              onClick={openAddModal}
              className="text-sm text-almet-sapphire hover:text-almet-cloud-burst"
            >
              Add your first procedure
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Procedures List */}
          <div className="space-y-3">
            {paginatedProcedures.map((procedure) => (
              <div
                key={procedure.id}
                className={`group rounded-lg border p-4 transition-all ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50"
                    : "bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Procedure Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {procedure.title}
                        </h3>
                      </div>
                      <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {procedure.description || "No description"}
                      </p>
                      <div className={`flex items-center gap-4 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        <span>{procedure.file_size_display}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{procedure.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{procedure.download_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewPDF(procedure)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(procedure)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                      } transition-all`}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {userAccess?.is_admin && (
                      <>
                        <button
                          onClick={() => startEditProcedure(procedure)}
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                          } transition-all`}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProcedure(procedure.id, procedure.title)}
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-red-900/20 hover:bg-red-900/30 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"
                          } transition-all`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={procedures.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                darkMode={darkMode}
              />
            </div>
          )}
        </>
      )}

      {/* Add/Edit Procedure Modal */}
      {(showAddProcedure || showEditProcedure) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-lg p-6 my-8 ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {showEditProcedure ? "Edit Procedure" : "Add New Procedure"}
              </h3>
              <button
                onClick={resetProcedureModal}
                className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {/* Procedure Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Procedure Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Purchase Request Process"
                  value={procedureForm.title}
                  onChange={(e) => setProcedureForm({...procedureForm, title: e.target.value})}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  placeholder="Brief description of the procedure..."
                  value={procedureForm.description}
                  onChange={(e) => setProcedureForm({...procedureForm, description: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                />
              </div>

              {/* PDF File Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {showEditProcedure ? "Replace Procedure File (Optional)" : "Procedure File (PDF) *"}
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 px-4 py-6 text-sm rounded-lg border-2 border-dashed cursor-pointer ${
                  darkMode
                    ? "border-gray-700 hover:border-almet-sapphire/50 text-gray-400 hover:bg-gray-900/50"
                    : "border-gray-300 hover:border-almet-sapphire/50 text-gray-600 hover:bg-gray-50"
                } transition-all`}>
                  <File className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-medium">
                      {selectedFile 
                        ? selectedFile.name 
                        : showEditProcedure 
                          ? "Choose new PDF file (optional)" 
                          : "Choose PDF file"
                      }
                    </p>
                    <p className="text-xs mt-1">
                      {showEditProcedure ? "Leave empty to keep current file" : "Maximum file size: 10MB"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    {showEditProcedure ? "New f" : "F"}ile size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex gap-2 mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={resetProcedureModal}
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
                onClick={showEditProcedure ? handleUpdateProcedure : handleAddProcedure}
                disabled={submitting || !procedureForm.title.trim() || (!selectedFile && !showEditProcedure)}
                className="flex-1 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {showEditProcedure ? "Update Procedure" : "Add Procedure"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}