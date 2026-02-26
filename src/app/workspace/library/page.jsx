// Complete Document Library Main Page with Toast & Loading

"use client";
import { 
  Search, Building2, Folder, FileText,
  Download, Eye, Plus, Shield, ClipboardList,
  BookOpen, Trash2,Edit
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import Link from "next/link";
import { documentService } from "@/services/documentService";

const QuickAccessCard = ({ title, description, href, icon: Icon, color, badge }) => (
  <Link href={href}>
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer h-full">
      <div className="flex items-start gap-2">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <h4 className="font-semibold text-xs text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
              {title}
            </h4>
            {badge && (
              <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-[9px] font-semibold whitespace-nowrap">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai leading-snug line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  </Link>
);

// app/workspace/library/page.jsx

const EditCompanyModal = ({ isOpen, onClose, company, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏢',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        icon: company.icon || '🏢'
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const code = company.code; // Keep existing code
      await documentService.updateCompany(company.id, {
        name: formData.name,
        code: code,
        icon: formData.icon
      });
      showSuccess('Company updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update company: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !company) return null;

  // Don't allow editing auto-created companies
  if (company.is_auto_created) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-4">
            <h2 className="text-base font-bold text-red-600 mb-2">
              Cannot Edit Auto-Created Company
            </h2>
            <p className="text-[11px] text-almet-waterloo dark:text-almet-bali-hai mb-4">
              This company is automatically created from BusinessFunction. Edit the BusinessFunction instead.
            </p>
            <button
              onClick={onClose}
              className="w-full px-3 py-1.5 rounded-lg bg-almet-sapphire text-white hover:bg-almet-astral transition-all text-[11px] font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-4">
          <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white mb-4">
            Edit Company
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Company Name *
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

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
              <p className="text-[9px] text-blue-700 dark:text-blue-400">
                Code: <strong>{company.code}</strong> (cannot be changed)
              </p>
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

// CompanyCard-a edit button əlavə et
const CompanyCard = ({ company, onDelete, onEdit }) => {
  const isAutoCreated = company.is_auto_created;
  
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
      <Link href={`/workspace/library/company/${company.id}`}>
        <div className="flex items-start gap-2">
          <div className={`w-10 h-10 rounded-lg ${company.color || 'bg-gradient-to-br from-almet-sapphire to-almet-astral'} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1 mb-1">
              <h3 className="font-semibold text-xs text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors truncate">
                {company.name}
              </h3>
              <div className="flex items-center gap-0.5">
                {isAutoCreated && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded font-semibold">
                    Auto
                  </span>
                )}
                {!isAutoCreated && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit(company);
                      }}
                      className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(company);
                      }}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
              <span className="flex items-center gap-0.5">
                <Folder className="h-3 w-3" />
                {company.folder_count}
              </span>
              <span className="flex items-center gap-0.5">
                <FileText className="h-3 w-3" />
                {company.total_documents}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};




const QuickStatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5 font-medium uppercase tracking-wide">
          {title}
        </p>
        <p className="text-lg font-bold text-almet-cloud-burst dark:text-white">
          {value}
        </p>
      </div>
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </div>
  </div>
);

const RecentDocCard = ({ doc, onView }) => (
  <div 
    onClick={() => onView(doc)}
    className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-200 hover:shadow-md cursor-pointer group"
  >
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <FileText className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[11px] text-almet-cloud-burst dark:text-white mb-1 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors truncate">
          {doc.title}
        </h4>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-steel-blue/10 dark:text-almet-steel-blue">
            {doc.document_type}
          </span>
          <span className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai">
            {doc.file_size_display}
          </span>
        </div>
        <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai truncate">
          {doc.company_name} • {doc.folder_name}
        </p>
      </div>
    </div>
  </div>
);

const CreateCompanyModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
  });

  const generateCode = (name) => {
    return name
      .trim()
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const code = generateCode(formData.name);
      await documentService.createCompany({
        name: formData.name,
        code: code,
        icon: formData.icon
      });
      showSuccess('Company created successfully!');
      onSuccess();
      onClose();
      setFormData({ name: '', icon: '📁' });
    } catch (error) {
      showError('Failed to create company: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-4">
          <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white mb-1">
            Create New Company
          </h2>
          <p className="text-[11px] text-almet-waterloo dark:text-almet-bali-hai mb-4">
            For general documents like Templates, Procedures, etc.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-almet-cloud-burst dark:text-white mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white text-[11px] focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                required
                placeholder="e.g., General Documents"
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

export default function DocumentLibrary() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [createCompanyModalOpen, setCreateCompanyModalOpen] = useState(false);
  
  const [companies, setCompanies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);

  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";

  const quickAccessItems = [
    {
      title: 'Company Policies',
      description: 'Browse all company policies and compliance documents.',
      href: '/workspace/library',
      icon: Shield,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      badge: 'Required'
    },
    {
      title: 'Procedures',
      description: 'Step-by-step procedures and workflow guides',
      href: '/workspace/library',
      icon: ClipboardList,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Training Materials',
      description: 'Learning resources and onboarding materials',
      href: '/workspace/library',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);
// State və handlers
const [editCompanyModalOpen, setEditCompanyModalOpen] = useState(false);
const [selectedCompany, setSelectedCompany] = useState(null);

const handleEditCompany = (company) => {
  setSelectedCompany(company);
  setEditCompanyModalOpen(true);
};

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesData, statsData, recentData] = await Promise.all([
        documentService.getCompanies(),
        documentService.getStatistics(),
        documentService.getRecentDocuments(8)
      ]);
      
      const companiesList = Array.isArray(companiesData) ? companiesData : (companiesData.results || []);
      setCompanies(companiesList);
      setStatistics(statsData);
      setRecentDocs(recentData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      await documentService.trackView(doc.id);
      window.open(doc.document_url, '_blank');
    } catch (error) {
      showError('Failed to open document');
    }
  };

  const handleDeleteCompany = async (company) => {
    if (confirm(`Are you sure you want to delete "${company.name}"?`)) {
      try {
        await documentService.deleteCompany(company.id);
        showSuccess('Company deleted successfully!');
        loadData();
      } catch (error) {
        showError('Failed to delete company: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading Document Library..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-lg font-bold ${textPrimary} mb-0.5`}>
              Document Library
            </h1>
            <p className={`${textSecondary} text-[11px]`}>
              Access company documents, policies, procedures and resources
            </p>
          </div>
          
          <button 
            onClick={() => setCreateCompanyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all text-[11px] font-semibold shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Company
          </button>
        </div>

        {/* Quick Access */}
        <div>
          <h2 className={`text-xs font-bold ${textPrimary} mb-2 uppercase tracking-wide`}>Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickAccessItems.map((item, index) => (
              <QuickAccessCard key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Quick Statistics */}
        {statistics && (
          <div className="grid grid-cols-4 gap-3">
            <QuickStatCard
              title="Documents"
              value={statistics.total_documents}
              icon={FileText}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickStatCard
              title="Companies"
              value={statistics.total_companies}
              icon={Building2}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <QuickStatCard
              title="Views"
              value={statistics.total_views}
              icon={Eye}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <QuickStatCard
              title="Downloads"
              value={statistics.total_downloads}
              icon={Download}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
            <input
              type="text"
              placeholder="Search documents, policies, procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 text-[11px] rounded-lg border border-almet-mystic/50 dark:border-almet-san-juan/50 bg-almet-mystic/20 dark:bg-almet-san-juan/20 ${textPrimary} placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire transition-all`}
            />
          </div>
        </div>

        {/* Companies */}
        <div>
          <h2 className={`text-xs font-bold ${textPrimary} mb-2 uppercase tracking-wide`}>All Companies</h2>
          {companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {companies.map((company) => (
                // Render
<CompanyCard 
  key={company.id} 
  company={company}
  onDelete={handleDeleteCompany}
  onEdit={handleEditCompany}
/>


              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-almet-cloud-burst rounded-lg border border-dashed border-almet-mystic dark:border-almet-san-juan">
              <Building2 className="h-12 w-12 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-2" />
              <p className={`${textSecondary} text-[11px] mb-1`}>No companies yet</p>
              <button 
                onClick={() => setCreateCompanyModalOpen(true)}
                className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline"
              >
                Create your first company
              </button>
            </div>
          )}
        </div>

        {/* Recent Documents */}
        {recentDocs.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold ${textPrimary} mb-2 uppercase tracking-wide`}>Recently Updated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentDocs.map((doc) => (
                <RecentDocCard 
                  key={doc.id} 
                  doc={doc}
                  onView={handleViewDocument}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateCompanyModal
        isOpen={createCompanyModalOpen}
        onClose={() => setCreateCompanyModalOpen(false)}
        onSuccess={loadData}
      />

      <EditCompanyModal
  isOpen={editCompanyModalOpen}
  onClose={() => {
    setEditCompanyModalOpen(false);
    setSelectedCompany(null);
  }}
  company={selectedCompany}
  onSuccess={loadData}
/>
    </DashboardLayout>
  );
}