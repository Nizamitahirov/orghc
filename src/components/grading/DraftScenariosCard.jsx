// src/components/grading/DraftScenariosCard.jsx - FULL UPDATED (No separate current checkbox)
import React, { useState } from "react";
import { Calculator, GitCompare, Eye, CheckCircle, Archive, Plus, Calendar, User, RefreshCw, Search, Filter } from "lucide-react";
import CustomCheckbox from "@/components/common/CustomCheckbox";

const DraftScenariosCard = ({
  draftScenarios,
  currentData,
  compareMode,
  selectedForComparison,
  loading,
  handleViewDetails,
  handleSaveAsCurrent,
  handleArchiveDraft,
  toggleCompareMode,
  toggleScenarioForComparison,
  handleStartComparison
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  // Filter and sort scenarios
  const filteredAndSortedScenarios = draftScenarios
    .filter(scenario => 
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created_at":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "base_value":
          return (b.data?.baseValue1 || 0) - (a.data?.baseValue1 || 0);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedScenarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScenarios = filteredAndSortedScenarios.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-almet-mystic dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white">
              Draft Scenarios ({draftScenarios.length})
            </h3>
          </div>
          <div className="flex gap-2">
            {compareMode && selectedForComparison.length >= 1 && (
              <button
                onClick={async () => {
                  await handleStartComparison();
                }}
                disabled={loading.comparing}
                className="bg-green-600 dark:bg-green-500 text-white px-3 py-1 text-xs rounded flex items-center gap-1 hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.comparing ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye size={12} />
                    Compare with Current ({selectedForComparison.length})
                  </>
                )}
              </button>
            )}
            <button
              onClick={toggleCompareMode}
              className={`px-3 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                compareMode 
                  ? 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700' 
                  : 'bg-almet-sapphire dark:bg-almet-sapphire text-white hover:bg-almet-astral dark:hover:bg-almet-astral'
              }`}
            >
              <GitCompare size={12} />
              {compareMode ? 'Cancel' : 'Compare'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Info message when in compare mode */}
        {compareMode && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <GitCompare size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Comparison Mode Active
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Select draft scenarios below to compare with the current structure. Current structure is automatically included in all comparisons.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-sapphire"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 dark:text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-sapphire"
            >
              <option value="created_at">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="base_value">Sort by Base Value</option>
            </select>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedScenarios.length > 0 ? (
            paginatedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                  compareMode && selectedForComparison.includes(scenario.id)
                    ? "border-almet-sapphire dark:border-almet-sapphire bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                }`}
                onClick={() => compareMode ? toggleScenarioForComparison(scenario.id) : handleViewDetails(scenario)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-almet-cloud-burst dark:text-white mb-2 line-clamp-1">
                      {scenario.name}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={10} />
                        {new Date(scenario.createdAt).toLocaleDateString()}
                      </div>
                      {scenario.createdBy && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <User size={10} />
                          {scenario.createdBy}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {compareMode && (
                      <CustomCheckbox
                        checked={selectedForComparison.includes(scenario.id)}
                        onChange={() => toggleScenarioForComparison(scenario.id)}
                      />
                    )}
                    <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full font-medium">
                      Draft
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {formatPercentage(scenario.data?.verticalAvg)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-gray-300">Vertical</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatPercentage(scenario.data?.horizontalAvg)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-gray-300">Horizontal</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                    <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(scenario.data?.baseValue1)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-gray-300">Base</div>
                  </div>
                </div>

                {!compareMode && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveAsCurrent(scenario.id); }}
                      disabled={loading.applying}
                      className="flex-1 bg-almet-sapphire dark:bg-almet-sapphire text-white px-3 py-2 text-xs rounded-lg hover:bg-almet-astral dark:hover:bg-almet-astral transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.applying ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <CheckCircle size={10} />
                      )}
                      Apply
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArchiveDraft(scenario.id); }}
                      disabled={loading.archiving}
                      className="bg-gray-400 dark:bg-gray-600 text-white px-3 py-2 text-xs rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.archiving ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <Archive size={10} />
                      )}
                      Archive
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <Calculator size={48} className="mx-auto" />
              </div>
              <h3 className="text-base font-semibold text-almet-waterloo dark:text-gray-300 mb-2">
                {searchTerm ? 'No scenarios found' : 'No Draft Scenarios'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first scenario above with enhanced calculations'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-almet-sapphire dark:bg-almet-sapphire text-white px-4 py-2 text-sm rounded-lg hover:bg-almet-astral dark:hover:bg-almet-astral transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={12} />
                  Create First Scenario
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-almet-cloud-burst dark:text-white bg-white dark:bg-gray-800"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    currentPage === page
                      ? "bg-almet-sapphire dark:bg-almet-sapphire text-white"
                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-almet-cloud-burst dark:text-white bg-white dark:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-almet-cloud-burst dark:text-white bg-white dark:bg-gray-800"
            >
              Next
            </button>
          </div>
        )}

        {/* Results info */}
        {filteredAndSortedScenarios.length > 0 && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedScenarios.length)} of {filteredAndSortedScenarios.length} scenarios
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftScenariosCard;