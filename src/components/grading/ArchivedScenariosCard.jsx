import React, { useState } from "react";
import { Archive, Search, Filter, Calendar, Eye } from "lucide-react";

const ArchivedScenariosCard = ({ archivedScenarios, handleViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  // Filter and sort scenarios
  const filteredAndSortedScenarios = archivedScenarios
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
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-lg flex items-center justify-center">
            <Archive size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
              Archived Scenarios
            </h2>
            <p className="text-sm text-almet-waterloo dark:text-gray-300">
              {archivedScenarios.length} previous scenarios for reference
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search archived scenarios..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedScenarios.length > 0 ? (
            paginatedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all opacity-75 hover:opacity-100 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                onClick={() => handleViewDetails(scenario)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-almet-cloud-burst dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-almet-sapphire dark:group-hover:text-almet-sapphire transition-colors">
                      {scenario.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={10} />
                      {new Date(scenario.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs bg-gray-500 dark:bg-gray-600 text-white px-2 py-1 rounded-full font-medium">
                      Archived
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={14} className="text-almet-sapphire dark:text-almet-sapphire" />
                    </div>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {formatPercentage(scenario.data?.verticalAvg)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-gray-300">V</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {formatPercentage(scenario.data?.horizontalAvg)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-gray-300">H</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(scenario.data?.baseValue1)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-gray-300">Base</div>
                  </div>
                </div>

                {/* Additional Info */}
                {scenario.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
                    {scenario.description}
                  </p>
                )}

                {/* Creator Info */}
                {scenario.createdBy && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    Created by {scenario.createdBy}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <Archive size={48} className="mx-auto" />
              </div>
              <h3 className="text-base font-semibold text-almet-waterloo dark:text-gray-300 mb-2">
                {searchTerm ? 'No archived scenarios found' : 'No Archived Scenarios'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'Archived scenarios will appear here'}
              </p>
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
                      ? "bg-gray-600 dark:bg-gray-600 text-white"
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
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedScenarios.length)} of {filteredAndSortedScenarios.length} archived scenarios
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedScenariosCard;