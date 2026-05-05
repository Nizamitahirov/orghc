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

//  Dynamic import for PDFViewer (no SSR)
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
  // Animation direction: 'forward' | 'backward'
  const [navDir, setNavDir] = useState('forward');
  
  // Data state
  const [companies, setCompanies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Company modal state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [submittingCompany, setSubmittingCompany] = useState(false);
  
  //  Access control state
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

  //  Load user access
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
    //  Check access before opening
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to add folders');
      return;
    }
    setEditingCompany(null);
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company) => {
    //  Check access before editing
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to edit folders');
      return;
    }
    if (company.type !== 'policy_company') {
      showWarning(
        'This entry is auto-generated from the Organisation Chart and cannot be edited here. ' +
        'Please update the corresponding Business Function in the org settings.'
      );
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
    if (!userAccess?.is_admin) {
      showWarning('You do not have permission to delete folders');
      return;
    }
    if (company.type !== 'policy_company') {
      showWarning(
        'This entry is auto-generated from the Organisation Chart and cannot be deleted here. ' +
        'Please update the corresponding Business Function in the org settings.'
      );
      return;
    }

    // Build a clear confirmation message.
    // If folder_count > 0 from the API we warn about cascading deletion.
    // If folder_count is 0 or unknown we still allow the attempt — the backend
    // is the authoritative source of truth and will reject if data is inconsistent.
    const hasFolders = (company.folder_count || 0) > 0;
    const message = hasFolders
      ? `"${company.name}" contains ${company.folder_count} folder(s) and all their policies. ` +
        'Deleting this company will permanently remove all of that content. Continue?'
      : `Are you sure you want to delete "${company.name}"? This action cannot be undone.`;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Company',
      message,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deletePolicyCompany(company.id);
          await loadAllCompanies();
          showSuccess('Company deleted successfully!');
        } catch (err) {
          // Backend may return a descriptive error (e.g. "has folders — delete them first")
          const errorMsg =
            err?.response?.data?.detail ||
            err?.response?.data?.error ||
            err?.message ||
            'Failed to delete company';
          showError(errorMsg);
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Navigation helpers
  const goForward = (mode, updates = {}) => {
    setNavDir('forward');
    Object.entries(updates).forEach(([k, v]) => {
      if (k === 'company') setSelectedCompany(v);
      if (k === 'folder')  setSelectedFolder(v);
      if (k === 'policy')  setSelectedPolicy(v);
    });
    setViewMode(mode);
  };

  const goBack = (mode, clears = []) => {
    setNavDir('backward');
    if (clears.includes('company')) setSelectedCompany(null);
    if (clears.includes('folder'))  setSelectedFolder(null);
    if (clears.includes('policy'))  setSelectedPolicy(null);
    setViewMode(mode);
  };

  const handleSelectCompany = (company) => goForward('folders', { company });
  const handleSelectFolder  = (folder)  => goForward('policies', { folder });
  const handleViewPolicy    = (policy)  => goForward('pdf', { policy });

  const handleBackToCompanies = () => goBack('companies', ['company', 'folder', 'policy']);
  const handleBackToFolders   = () => goBack('folders',   ['folder', 'policy']);
  const handleBackToPolicies  = () => goBack('policies',  ['policy']);

  // Slide animation classes based on navigation direction
  const slideClass = navDir === 'forward'
    ? 'animate-in fade-in slide-in-from-right-4 duration-250'
    : 'animate-in fade-in slide-in-from-left-4 duration-250';

  return (
    <DashboardLayout>
      {viewMode === "companies" && (
        <div key="view-companies" className={slideClass}>
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
        </div>
      )}

      {viewMode === "folders" && selectedCompany && (
        <div key="view-folders" className={slideClass}>
          <FoldersView
            selectedCompany={selectedCompany}
            darkMode={darkMode}
            onBack={handleBackToCompanies}
            onSelectFolder={handleSelectFolder}
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
            userAccess={userAccess}
          />
        </div>
      )}

      {viewMode === "policies" && selectedFolder && selectedCompany && (
        <div key="view-policies" className={slideClass}>
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
        </div>
      )}

      {viewMode === "pdf" && selectedPolicy && selectedFolder && selectedCompany && (
        <div key="view-pdf" className={slideClass}>
          <PDFViewer
            selectedPolicy={selectedPolicy}
            selectedFolder={selectedFolder}
            selectedCompany={selectedCompany}
            darkMode={darkMode}
            onBack={handleBackToPolicies}
          />
        </div>
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