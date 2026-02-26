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
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import Pagination from "@/components/common/Pagination";
import {
  getPoliciesByFolder,
  createPolicy,
  partialUpdatePolicy,
  deletePolicy,
  trackPolicyView,
  trackPolicyDownload,
  validatePDFFile,
} from "@/services/policyService";

export default function PoliciesView({
  selectedCompany,
  selectedFolder,
  darkMode,
  onBack,
  onViewPolicy,
  confirmModal,
  setConfirmModal,
  userAccess, // ✅ Add userAccess prop
}) {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Data state
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showEditPolicy, setShowEditPolicy] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  
  // Form state
  const [policyForm, setPolicyForm] = useState({
    title: "",
    description: "",
    requires_acknowledgment: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Load policies when component mounts or folder changes
  useEffect(() => {
    loadPolicies(selectedFolder.id);
    setCurrentPage(1);
  }, [selectedFolder.id]);

  const loadPolicies = async (folderId) => {
    setLoading(true);
    try {
      const data = await getPoliciesByFolder(folderId);
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      showError("Failed to load policies");
      console.error('Error loading policies:', err);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  // Paginated policies
  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return policies.slice(startIndex, startIndex + itemsPerPage);
  }, [policies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(policies.length / itemsPerPage);

  const handleAddPolicy = async () => {
    if (!policyForm.title.trim() || !selectedFile) {
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
      const policyData = {
        folder: selectedFolder.id,
        title: policyForm.title,
        description: policyForm.description,
        policy_file: selectedFile,
        requires_acknowledgment: policyForm.requires_acknowledgment,
        is_active: true,
      };

      await createPolicy(policyData);
      await loadPolicies(selectedFolder.id);

      resetPolicyModal();
      showSuccess("Policy added successfully!");
    } catch (err) {
      console.error('Create policy error:', err);
      showError(err.error || err.message || "Failed to create policy");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!policyForm.title.trim()) {
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
      const policyData = {
        folder: selectedFolder.id,
        title: policyForm.title,
        description: policyForm.description,
        requires_acknowledgment: policyForm.requires_acknowledgment,
      };

      if (selectedFile) {
        policyData.policy_file = selectedFile;
      }

      await partialUpdatePolicy(editingPolicy.id, policyData);
      await loadPolicies(selectedFolder.id);

      resetPolicyModal();
      showSuccess("Policy updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to update policy");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePolicy = (policyId, policyTitle) => {
    // ✅ Check access
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to delete policies');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Policy",
      message: `Are you sure you want to delete "${policyTitle}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await deletePolicy(policyId);
          await loadPolicies(selectedFolder.id);
          showSuccess("Policy deleted successfully!");
        } catch (err) {
          showError(err.message || "Failed to delete policy");
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const handleViewPDF = async (policy) => {
    try {
      await trackPolicyView(policy.id);
      onViewPolicy(policy);
    } catch (err) {
      console.error('Error tracking view:', err);
      onViewPolicy(policy);
    }
  };

  const handleDownloadPDF = async (policy) => {
    try {
      await trackPolicyDownload(policy.id);
      
      const link = document.createElement("a");
      link.href = policy.policy_url || policy.policy_file;
      link.download = `${policy.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess("Download started!");
      await loadPolicies(selectedFolder.id);
    } catch (err) {
      console.error('Error downloading:', err);
      showError("Failed to download policy");
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

  const startEditPolicy = (policy) => {
    // ✅ Check access
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to edit policies');
      return;
    }
    setEditingPolicy(policy);
    setPolicyForm({
      title: policy.title,
      description: policy.description || "",
      requires_acknowledgment: policy.requires_acknowledgment || true,
    });
    setShowEditPolicy(true);
  };

  const resetPolicyModal = () => {
    setPolicyForm({
      title: "",
      description: "",
      requires_acknowledgment: true,
    });
    setSelectedFile(null);
    setEditingPolicy(null);
    setShowAddPolicy(false);
    setShowEditPolicy(false);
  };

  const openAddModal = () => {
    // ✅ Check access before opening
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to add policies');
      return;
    }
    setShowAddPolicy(true);
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

        {/* Title and Add Policy Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{selectedFolder.icon || "📁"}</div>
            <div>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedFolder.name}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {policies.length} policies
              </p>
            </div>
          </div>

          {/* ✅ Add Policy Button - only show if admin */}
          {userAccess?.is_admin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
            >
              <Upload className="w-4 h-4" />
              Add Policy
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
        </div>
      ) : policies.length === 0 ? (
        // Empty State
        <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm mb-2">No policies in this folder</p>
          {userAccess?.is_admin && (
            <button
              onClick={openAddModal}
              className="text-sm text-almet-sapphire hover:text-almet-cloud-burst"
            >
              Add your first policy
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Policies List */}
          <div className="space-y-3">
            {paginatedPolicies.map((policy) => (
              <div
                key={policy.id}
                className={`group rounded-lg border p-4 transition-all ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50"
                    : "bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Policy Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {policy.title}
                        </h3>
                      </div>
                      <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {policy.description || "No description"}
                      </p>
                      <div className={`flex items-center gap-4 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        <span>{policy.file_size_display}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{policy.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{policy.download_count || 0}</span>
                        </div>
                        {policy.requires_acknowledgment && (
                          <div className={`flex items-center gap-1 ${
                            policy.acknowledgment_percentage >= 80 
                              ? 'text-green-500' 
                              : policy.acknowledgment_percentage >= 50 
                                ? 'text-yellow-500' 
                                : 'text-red-500'
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            <span>{policy.acknowledgment_count || 0} acked</span>
                            {policy.acknowledgment_percentage !== null && (
                              <span className="text-xs">({policy.acknowledgment_percentage}%)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewPDF(policy)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(policy)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                      } transition-all`}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {/* ✅ Edit/Delete buttons - only if admin */}
                    {userAccess?.is_admin && (
                      <>
                        <button
                          onClick={() => startEditPolicy(policy)}
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                          } transition-all`}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(policy.id, policy.title)}
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
                totalItems={policies.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                darkMode={darkMode}
              />
            </div>
          )}
        </>
      )}

      {/* Add/Edit Policy Modal */}
      {(showAddPolicy || showEditPolicy) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-lg p-6 my-8 ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {showEditPolicy ? "Edit Policy" : "Add New Policy"}
              </h3>
              <button
                onClick={resetPolicyModal}
                className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {/* Policy Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Policy Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hiring Procedure"
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({...policyForm, title: e.target.value})}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}/>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              placeholder="Brief description of the policy..."
              value={policyForm.description}
              onChange={(e) => setPolicyForm({...policyForm, description: e.target.value})}
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
              {showEditPolicy ? "Replace Policy File (Optional)" : "Policy File (PDF) *"}
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
                    : showEditPolicy 
                      ? "Choose new PDF file (optional)" 
                      : "Choose PDF file"
                  }
                </p>
                <p className="text-xs mt-1">
                  {showEditPolicy ? "Leave empty to keep current file" : "Maximum file size: 10MB"}
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
                {showEditPolicy ? "New f" : "F"}ile size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className={`flex gap-2 mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={resetPolicyModal}
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
            onClick={showEditPolicy ? handleUpdatePolicy : handleAddPolicy}
            disabled={submitting || !policyForm.title.trim() || (!selectedFile && !showEditPolicy)}
            className="flex-1 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {showEditPolicy ? "Update Policy" : "Add Policy"}
          </button>
        </div>
      </div>
    </div>
  )}
</div>)}