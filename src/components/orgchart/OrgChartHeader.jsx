// components/orgChart/OrgChartHeader.jsx - COMPLETE VERSION with Back Button
'use client'
import React from 'react';
import { 
    Building2, Search, TreePine, Grid, Filter, Download, 
    Expand, Shrink, RefreshCw, AlertCircle, Globe, ArrowLeft 
} from 'lucide-react';

const OrgChartHeader = ({
    summary,
    orgChart,
    filteredOrgChart,
    vacantCount,
    expandedNodes,
    isLoading,
    filters,
    viewMode,
    showFilters,
    isFullscreen,
    updateFilter,
    setViewMode,
    setShowFilters,
    handleExportToPNG,
    exportLoading,
    toggleFullscreen,
    fetchFullTreeWithVacancies,
    hasActiveFilters,
    darkMode,
    selectedCompany,
    onBackToCompanySelection  // NEW PROP
}) => {
    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const textPrimary = darkMode ? "text-gray-200" : "text-almet-comet";
    const bgAccent = darkMode ? "bg-slate-700" : "bg-almet-mystic";

    return (
        <div className={`${bgCard} shadow-lg border-b ${borderColor} sticky top-0 z-30 backdrop-blur-md`}>
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left Side - Title & Stats */}
                    <div className="flex items-center gap-3">
                        {/* Back Button - only show when company is selected */}
                        {selectedCompany && (
                            <button
                                onClick={onBackToCompanySelection}
                                className={`p-2 hover:${bgAccent} rounded-lg transition-colors ${textMuted} hover:${textPrimary} flex items-center justify-center`}
                                title="Back to company selection"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        
                        <div className="w-8 h-8 bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst rounded-lg flex items-center justify-center shadow-lg">
                            {selectedCompany === 'ALL' ? (
                                <Globe className="w-4 h-4 text-white" />
                            ) : (
                                <Building2 className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className={`text-base font-bold ${textHeader}`}>
                                    Organizational Chart
                                </h1>
                                {selectedCompany && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-almet-sapphire text-white">
                                        {selectedCompany === 'ALL' ? 'All Companies' : selectedCompany}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <p className={`${textSecondary} font-medium`}>
                                    Total: <span className="font-bold text-almet-sapphire">{summary.totalEmployees || 0}</span>
                                </p>
                                <p className={`${textSecondary} font-medium`}>
                                    Managers: <span className="font-bold text-green-600 dark:text-green-400">{summary.totalManagers || 0}</span>
                                </p>
                                {summary.totalDepartments > 0 && (
                                    <p className={`${textSecondary} font-medium`}>
                                        Departments: <span className="font-bold">{summary.totalDepartments}</span>
                                    </p>
                                )}
                                {selectedCompany === 'ALL' && summary.totalBusinessFunctions > 0 && (
                                    <p className={`${textSecondary} font-medium`}>
                                        Companies: <span className="font-bold">{summary.totalBusinessFunctions}</span>
                                    </p>
                                )}
                                {vacantCount > 0 && (
                                    <p className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Vacant: <span className="font-bold">{vacantCount}</span>
                                    </p>
                                )}
                                {filteredOrgChart.length !== orgChart?.length && (
                                    <p className={`${textSecondary}`}>
                                        Filtered: <span className="font-bold">{filteredOrgChart.length}</span>
                                    </p>
                                )}
                                {expandedNodes?.length > 0 && (
                                    <p className={`${textSecondary}`}>
                                        Expanded: <span className="font-bold">{expandedNodes.length}</span>
                                    </p>
                                )}
                                {isLoading && (
                                    <RefreshCw className={`w-3 h-3 ${textMuted} animate-spin`} />
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Side - Controls */}
                    <div className="flex items-center gap-2">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted} w-3.5 h-3.5 pointer-events-none`} />
                            <input 
                                type="text" 
                                placeholder="Search employees..." 
                                value={filters.search || ''} 
                                onChange={(e) => updateFilter('search', e.target.value)} 
                                className={`pl-8 pr-7 py-2 border outline-0 ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire w-44 ${bgCard} ${textPrimary} text-sm transition-all duration-200 shadow-sm`} 
                            />
                        </div>
                       
                        {/* View Mode Toggle */}
                        <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-0.5 shadow-sm`}>
                            <button 
                                onClick={() => setViewMode('tree')} 
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-almet-sapphire text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                            >
                                <TreePine size={14} />Tree
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')} 
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-almet-sapphire text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                            >
                                <Grid size={14} />Grid
                            </button>
                        </div>
                        
                        {/* Filter Button */}
                        <button 
                            onClick={() => setShowFilters(!showFilters)} 
                            title="Advanced Filters"
                            className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textPrimary} shadow-sm relative`}
                        >
                            <Filter size={14} />
                            {hasActiveFilters && (
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-almet-sapphire rounded-full border border-white"></div>
                            )}
                        </button>
                        
                        {/* Export Button */}
                        <button 
                            onClick={handleExportToPNG} 
                            disabled={exportLoading}
                            title="Export Chart"
                            className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {exportLoading ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <Download size={14} />
                            )}
                            <span className="text-xs hidden sm:inline">Export</span>
                        </button>
                        
                        {/* Fullscreen Button */}
                        <button 
                            onClick={toggleFullscreen} 
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                        >
                            {isFullscreen ? <Shrink size={14} /> : <Expand size={14} />}
                        </button>

                        {/* Refresh Button */}
                        <button 
                            onClick={() => fetchFullTreeWithVacancies()}
                            disabled={isLoading}
                            title="Refresh"
                            className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm disabled:opacity-50`}
                        >
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgChartHeader;