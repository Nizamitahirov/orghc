import { useState, useMemo } from "react";
import {
  Building2,
  FolderOpen,
  FileText,
  Search,
  ChevronRight,
  Eye,
  Download,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function CompaniesView({
  companies,
  statistics,
  loading,
  error,
  darkMode,
  onSelectCompany,
  onReload,
  onAddCompany,
  onEditCompany,
  onDeleteCompany,
  userAccess, // ✅ Add userAccess prop
}) {
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(
    () => companies.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    ),
    [search, companies]
  );

  if (loading && companies.length === 0) {
    return <LoadingSpinner message="Loading policies..." />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst`}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Company Policies
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage company policies across all Companies
              </p>
            </div>
          </div>

          {/* ✅ Add Company Button - only show if user is admin */}
          {userAccess?.is_admin && (
            <button
              onClick={onAddCompany}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Folder
            </button>
          )}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`rounded-lg p-4 ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Policies
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {statistics.total_policies}
                  </p>
                </div>
                <FileText className={`w-8 h-8 ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Views
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {statistics.total_views}
                  </p>
                </div>
                <Eye className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Downloads
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {statistics.total_downloads}
                  </p>
                </div>
                <Download className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Folders
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {statistics.total_folders}
                  </p>
                </div>
                <FolderOpen className={`w-8 h-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          darkMode ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className={`absolute left-3 top-2.5 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-almet-sapphire'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire'
          } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20 transition-all`}
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => (
          <div
            key={`${company.type}-${company.id}`}
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
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  {/* ✅ Manual company-lər üçün edit/delete buttonları - only if admin */}
                  {company.type === 'policy_company' && userAccess?.is_admin && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCompany(company);
                        }}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                          darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                        }`}
                        title="Edit Company"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCompany(company);
                        }}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                          darkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-100 text-red-500"
                        }`}
                        title="Delete Company"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <ChevronRight 
                    onClick={() => onSelectCompany(company)}
                    className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`} 
                  />
                </div>
              </div>

              <div onClick={() => onSelectCompany(company)}>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {company.name}
                  </h3>
                  {company.type === 'policy_company' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}>
                      Manual
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {company.code}
                </p>

                <div className="flex items-center gap-4 text-xs">
                  <div className={`flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{company.folder_count || 0} folders</span>
                  </div>
                  <div className={`flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>{company.total_policy_count || 0} policies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No companies found</p>
        </div>
      )}
    </div>
  );
}