"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Import view components
import CompaniesView from "@/components/policy/CompaniesView";
import FoldersView from "@/components/policy/FoldersView";
import PoliciesView from "@/components/policy/PoliciesView";
import CreateCompanyModal from "@/components/policy/CreateCompanyModal";

// ✅ Dynamic import for PDFViewer (no SSR)
const PDFViewer = dynamic(() => import("@/components/policy/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

// Import services
import {
  getAllCompanies,
  getPolicyStatisticsOverview,
  createPolicyCompany,
  updatePolicyCompany,
  deletePolicyCompany,
} from "@/services/policyService";
import jobDescriptionService from "@/services/jobDescriptionService";

export default function CompanyPoliciesPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  
  // Navigation state
  const [viewMode, setViewMode] = useState("companies");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Data state
  const [companies, setCompanies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Company modal state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [submittingCompany, setSubmittingCompany] = useState(false);
  
  // ✅ Access control state
  const [userAccess, setUserAccess] = useState(null);
  const [accessLoading, setAccessLoading] = useState(true);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  // Load data on mount
  useEffect(() => {
    loadUserAccess();
    loadAllCompanies();
    loadOverallStatistics();
  }, []);

  // ✅ Load user access
  const loadUserAccess = async () => {
    try {
      setAccessLoading(true);
      const accessInfo = await jobDescriptionService.getMyAccessInfo();
      setUserAccess(accessInfo);
    } catch (error) {
      console.error('Error fetching user access:', error);
      setUserAccess({ is_admin: false });
    } finally {
      setAccessLoading(false);
    }
  };

  const loadAllCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load companies");
      showError("Failed to load companies");
      console.error('Error loading companies:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOverallStatistics = async () => {
    try {
      const data = await getPolicyStatisticsOverview();
      setStatistics(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  // Company CRUD handlers
  const handleAddCompany = () => {
    // ✅ Check access before opening
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to add folders');
      return;
    }
    setEditingCompany(null);
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company) => {
    // ✅ Check access before editing
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to edit folders');
      return;
    }
    if (company.type !== 'policy_company') {
      showWarning("Business Functions cannot be edited from here");
      return;
    }
    setEditingCompany(company);
    setShowCompanyModal(true);
  };

  const handleSubmitCompany = async (companyData) => {
    setSubmittingCompany(true);
    try {
      if (editingCompany) {
        await updatePolicyCompany(editingCompany.id, companyData);
        showSuccess("Company updated successfully!");
      } else {
        await createPolicyCompany(companyData);
        showSuccess("Company created successfully!");
      }
      
      await loadAllCompanies();
      setShowCompanyModal(false);
      setEditingCompany(null);
    } catch (err) {
      const errorMsg = err.name?.[0] || err.code?.[0] || err.message || "Failed to save company";
      showError(errorMsg);
      console.error('Error saving company:', err);
    } finally {
      setSubmittingCompany(false);
    }
  };

  const handleDeleteCompany = (company) => {
    // ✅ Check access before deleting
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to delete folders');
      return;
    }
    if (company.type !== 'policy_company') {
      showWarning("Business Functions cannot be deleted from here");
      return;
    }

    if (company.folder_count > 0) {
      showWarning(
        `Cannot delete company "${company.name}" - it has ${company.folder_count} folders. ` +
        "Please delete all folders first."
      );
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Company",
      message: `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await deletePolicyCompany(company.id);
          await loadAllCompanies();
          showSuccess("Company deleted successfully!");
        } catch (err) {
          const errorMsg = err.message || "Failed to delete company";
          showError(errorMsg);
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  // Navigation handlers
  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setViewMode("folders");
  };

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    setViewMode("policies");
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setViewMode("pdf");
  };

  const handleBackToCompanies = () => {
    setViewMode("companies");
    setSelectedCompany(null);
    setSelectedFolder(null);
    setSelectedPolicy(null);
  };

  const handleBackToFolders = () => {
    setViewMode("folders");
    setSelectedFolder(null);
    setSelectedPolicy(null);
  };

  const handleBackToPolicies = () => {
    setViewMode("policies");
    setSelectedPolicy(null);
  };

  return (
    <DashboardLayout>
      {viewMode === "companies" && (
        <CompaniesView
          companies={companies}
          statistics={statistics}
          loading={loading}
          error={error}
          darkMode={darkMode}
          onSelectCompany={handleSelectCompany}
          onReload={loadAllCompanies}
          onAddCompany={handleAddCompany}
          onEditCompany={handleEditCompany}
          onDeleteCompany={handleDeleteCompany}
          userAccess={userAccess}
        />
      )}

      {viewMode === "folders" && selectedCompany && (
        <FoldersView
          selectedCompany={selectedCompany}
          darkMode={darkMode}
          onBack={handleBackToCompanies}
          onSelectFolder={handleSelectFolder}
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
          userAccess={userAccess}
        />
      )}

      {viewMode === "policies" && selectedFolder && selectedCompany && (
        <PoliciesView
          selectedCompany={selectedCompany}
          selectedFolder={selectedFolder}
          darkMode={darkMode}
          onBack={handleBackToFolders}
          onViewPolicy={handleViewPolicy}
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
          userAccess={userAccess}
        />
      )}

      {viewMode === "pdf" && selectedPolicy && selectedFolder && selectedCompany && (
        <PDFViewer
          selectedPolicy={selectedPolicy}
          selectedFolder={selectedFolder}
          selectedCompany={selectedCompany}
          darkMode={darkMode}
          onBack={handleBackToPolicies}
        />
      )}

      {/* Company Create/Edit Modal */}
      <CreateCompanyModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false);
          setEditingCompany(null);
        }}
        onSubmit={handleSubmitCompany}
        darkMode={darkMode}
        editingCompany={editingCompany}
        submitting={submittingCompany}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}