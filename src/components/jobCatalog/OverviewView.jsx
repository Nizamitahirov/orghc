// src/components/jobCatalog/OverviewView.jsx - With Pagination

import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Users, Briefcase, Grid, List,
  Loader2, AlertCircle, X
} from 'lucide-react';
import JobCard from './JobCard';
import JobListItem from './JobListItem';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import Pagination from '@/components/common/Pagination';
import { useTheme } from '@/components/common/ThemeProvider';

export default function OverviewView({ context }) {
  const {
    searchTerm, setSearchTerm,
    showFilters, setShowFilters,
    viewMode, setViewMode,
    selectedFilters, setSelectedFilters,
    filteredJobs, stats, filterOptions,
    loading, errors,
    clearFilters,
    jobCatalogData
  } = context;

  const { darkMode } = useTheme();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 items per page
  
  const hasActiveFilters = Object.values(selectedFilters).some(v => v) || searchTerm;

  // Calculate pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-gray-200 dark:border-almet-comet">
          <div className="flex items-center">
            <div className="p-2 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg mr-3">
              <Briefcase className="h-4 w-4 text-almet-sapphire" />
            </div>
            <div>
              <p className="text-[10px] text-gray-600 dark:text-almet-bali-hai">Total Jobs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.totalJobs}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow-sm border border-gray-200 dark:border-almet-comet">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-600 dark:text-almet-bali-hai">Total Employees</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.totalEmployees}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 mb-4 shadow-sm border border-gray-200 dark:border-almet-comet">
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-8 pr-8 py-2 text-xs outline-0 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-xs font-medium relative ${
                showFilters ? 'bg-almet-sapphire text-white' : 'bg-gray-100 dark:bg-almet-comet text-gray-700 dark:text-almet-bali-hai hover:bg-gray-200 dark:hover:bg-almet-san-juan'
              }`}
            >
              <Filter size={12} />
              Filters
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                  {Object.values(selectedFilters).filter(v => v).length + (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-almet-comet overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'} transition-colors`}
                title="Grid View"
              >
                <Grid size={12} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'} transition-colors`}
                title="List View"
              >
                <List size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-almet-comet">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              
              {/* Company */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Company
                </label>
                <SearchableDropdown
                  options={filterOptions.businessFunctions}
                  value={selectedFilters.business_function}
                  onChange={(value) => setSelectedFilters(prev => ({ ...prev, business_function: value }))}
                  placeholder="All"
                  searchPlaceholder="Search Companys..."
                  darkMode={darkMode}
                  className="w-full"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Department
                </label>
                <SearchableDropdown
                  options={filterOptions.departments}
                  value={selectedFilters.department}
                  onChange={(value) => setSelectedFilters(prev => ({ ...prev, department: value }))}
                  placeholder="All"
                  searchPlaceholder="Search departments..."
                  darkMode={darkMode}
                  className="w-full"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Unit
                </label>
                <SearchableDropdown
                  options={filterOptions.units}
                  value={selectedFilters.unit}
                  onChange={(value) => setSelectedFilters(prev => ({ ...prev, unit: value }))}
                  placeholder="All"
                  searchPlaceholder="Search units..."
                  darkMode={darkMode}
                  className="w-full"
                />
              </div>

              {/* Job Function */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Job Function
                </label>
                <SearchableDropdown
                  options={filterOptions.jobFunctions}
                  value={selectedFilters.job_function}
                  onChange={(value) => setSelectedFilters(prev => ({ ...prev, job_function: value }))}
                  placeholder="All"
                  searchPlaceholder="Search job functions..."
                  darkMode={darkMode}
                  className="w-full"
                />
              </div>

              {/* Hierarchy */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Hierarchy
                </label>
                <SearchableDropdown
                  options={filterOptions.positionGroups}
                  value={selectedFilters.position_group}
                  onChange={(value) => setSelectedFilters(prev => ({ ...prev, position_group: value }))}
                  placeholder="All"
                  searchPlaceholder="Search Hierarchys..."
                  darkMode={darkMode}
                  className="w-full"
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-3 flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-almet-bali-hai">
                  Showing {filteredJobs.length} of {jobCatalogData.length} jobs
                </span>
                <button
                  onClick={clearFilters}
                  className="text-almet-sapphire dark:text-almet-steel-blue hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {errors.employees && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
            <span className="text-red-800 dark:text-red-200 text-xs">{errors.employees}</span>
          </div>
        </div>
      )}

      {/* Job Listings */}
      {loading.employees ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai text-xs">Loading jobs...</span>
        </div>
      ) : (
        <>
          {/* Results Info */}
          {filteredJobs.length > 0 && (
            <div className="mb-3 text-xs text-gray-600 dark:text-almet-bali-hai">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
            </div>
          )}

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4' : 'space-y-2 mb-4'}>
            {paginatedJobs.map(job => (
              viewMode === 'grid' ? (
                <JobCard key={job.id} job={job} context={context} />
              ) : (
                <JobListItem key={job.id} job={job} context={context} />
              )
            ))}
          </div>

          {/* Pagination */}
          {filteredJobs.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredJobs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              darkMode={darkMode}
            />
          )}

          {/* No Results */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="mx-auto h-10 w-10 text-gray-400 dark:text-almet-bali-hai mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Jobs Found</h3>
              <p className="text-xs text-gray-500 dark:text-almet-bali-hai mb-3">
                {hasActiveFilters ? 'Try adjusting your filters or search term' : 'No jobs available in the system'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-almet-sapphire dark:text-almet-steel-blue hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}