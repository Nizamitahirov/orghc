'use client'
import React, { useState, useRef, useEffect } from 'react';
import {
    Building2, Search, TreePine, LayoutGrid, SlidersHorizontal, Download,
    Maximize2, Minimize2, RefreshCw, Globe, ArrowLeft,
    FileImage, FileText, ChevronDown, Users, LayoutDashboard,
    Briefcase, AlertTriangle, X, Printer
} from 'lucide-react';

const StatPill = ({ icon: Icon, label, value, color = 'blue', darkMode }) => {
    const colors = {
        blue:   { bg: darkMode ? 'bg-blue-900/30'   : 'bg-blue-50',   text: darkMode ? 'text-blue-300'  : 'text-blue-700',   dot: 'bg-blue-500'   },
        green:  { bg: darkMode ? 'bg-green-900/30'  : 'bg-green-50',  text: darkMode ? 'text-green-300' : 'text-green-700',  dot: 'bg-green-500'  },
        purple: { bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50', text: darkMode ? 'text-purple-300': 'text-purple-700', dot: 'bg-purple-500' },
        red:    { bg: darkMode ? 'bg-red-900/30'    : 'bg-red-50',    text: darkMode ? 'text-red-300'   : 'text-red-700',    dot: 'bg-red-500'    },
        gray:   { bg: darkMode ? 'bg-slate-700'     : 'bg-gray-100',  text: darkMode ? 'text-gray-300'  : 'text-gray-600',   dot: 'bg-gray-400'   },
    };
    const c = colors[color];
    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg} ${c.text} text-xs font-medium`}>
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline opacity-70">{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    );
};

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
    handleExportToPDF,
    handlePrint,
    exportLoading,
    toggleFullscreen,
    fetchFullTreeWithVacancies,
    hasActiveFilters,
    darkMode,
    selectedCompany,
    onBackToCompanySelection
}) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowExportMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const bgCard      = darkMode ? 'bg-slate-800'     : 'bg-white';
    const borderColor = darkMode ? 'border-slate-600'  : 'border-gray-200';
    const textHeader  = darkMode ? 'text-gray-100'     : 'text-almet-cloud-burst';
    const textMuted   = darkMode ? 'text-gray-500'     : 'text-almet-bali-hai';
    const textPrimary = darkMode ? 'text-gray-200'     : 'text-almet-comet';
    const bgAccent    = darkMode ? 'bg-slate-700'      : 'bg-gray-50';
    const bgDropdown  = darkMode ? 'bg-slate-800'      : 'bg-white';
    const iconBtn     = `p-2 border ${borderColor} rounded-lg transition-all duration-150 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm hover:shadow-md hover:border-almet-sapphire/40`;

    const isFiltered = filteredOrgChart?.length !== orgChart?.length;

    return (
        <div className={`${bgCard} border-b ${borderColor} sticky top-0 z-30`}
             style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">

                    {/* ── Left: Logo + Title + Stats ── */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        {selectedCompany && (
                            <button
                                onClick={onBackToCompanySelection}
                                className={`${iconBtn} flex-shrink-0`}
                                title="Back to company selection"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}

                        <div className="w-8 h-8 bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            {selectedCompany === 'ALL'
                                ? <Globe className="w-4 h-4 text-white" />
                                : <Building2 className="w-4 h-4 text-white" />}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h1 className={`text-sm font-bold ${textHeader} leading-none`}>Org Chart</h1>
                                {selectedCompany && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/20">
                                        {selectedCompany === 'ALL' ? 'All' : selectedCompany}
                                    </span>
                                )}
                                {isLoading && <RefreshCw className={`w-3 h-3 ${textMuted} animate-spin`} />}
                            </div>

                            {/* Stats pills row */}
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <StatPill icon={Users}         label="Employees"   value={summary.totalEmployees  || 0} color="blue"   darkMode={darkMode} />
                                <StatPill icon={Briefcase}     label="Managers"    value={summary.totalManagers   || 0} color="green"  darkMode={darkMode} />
                                <StatPill icon={LayoutDashboard} label="Depts"     value={summary.totalDepartments|| 0} color="purple" darkMode={darkMode} />
                                {vacantCount > 0 && (
                                    <StatPill icon={AlertTriangle} label="Vacant"  value={vacantCount}              color="red"    darkMode={darkMode} />
                                )}
                                {isFiltered && (
                                    <StatPill icon={SlidersHorizontal} label="Filtered" value={filteredOrgChart?.length} color="gray" darkMode={darkMode} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Controls ── */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">

                        {/* Search with clear button */}
                        <div className="relative">
                            <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors ${
                                searchFocused ? 'text-almet-sapphire' : textMuted
                            }`} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={filters.search || ''}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={`pl-8 ${filters.search ? 'pr-7' : 'pr-3'} py-1.5 border outline-none rounded-lg text-sm transition-all duration-200 shadow-sm ${
                                    searchFocused
                                        ? 'border-almet-sapphire ring-2 ring-almet-sapphire/20 w-52'
                                        : `${borderColor} w-40`
                                } ${bgCard} ${textPrimary}`}
                            />
                            {filters.search && (
                                <button
                                    onClick={() => updateFilter('search', '')}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 ${textMuted} hover:text-almet-sapphire transition-colors`}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* View Toggle */}
                        <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-0.5 shadow-sm`}>
                            <button
                                onClick={() => setViewMode('tree')}
                                title="Tree View"
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                                    viewMode === 'tree'
                                        ? 'bg-almet-sapphire text-white shadow-sm'
                                        : `${textMuted} hover:${textPrimary} hover:${bgAccent}`
                                }`}
                            >
                                <TreePine size={13} />
                                <span className="hidden md:inline">Tree</span>
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                                    viewMode === 'grid'
                                        ? 'bg-almet-sapphire text-white shadow-sm'
                                        : `${textMuted} hover:${textPrimary} hover:${bgAccent}`
                                }`}
                            >
                                <LayoutGrid size={13} />
                                <span className="hidden md:inline">Grid</span>
                            </button>
                        </div>

                        {/* Filter */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            title="Advanced Filters"
                            className={`${iconBtn} relative ${showFilters ? '!bg-almet-sapphire/10 !border-almet-sapphire/40' : ''}`}
                        >
                            <SlidersHorizontal size={14} className={showFilters ? 'text-almet-sapphire' : ''} />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-almet-sapphire rounded-full border-2 border-white dark:border-slate-800" />
                            )}
                        </button>

                        {/* Export Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowExportMenu(prev => !prev)}
                                disabled={!!exportLoading}
                                title="Export"
                                className={`${iconBtn} flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                                {exportLoading
                                    ? <RefreshCw size={14} className="animate-spin" />
                                    : <Download size={14} />}
                                <span className="text-xs hidden sm:inline">
                                    {exportLoading === 'png' ? 'PNG…' : exportLoading === 'pdf' ? 'PDF…' : 'Export'}
                                </span>
                                <ChevronDown size={11} className={`hidden sm:block transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showExportMenu && !exportLoading && (
                                <div className={`absolute right-0 mt-1.5 w-48 ${bgDropdown} border ${borderColor} rounded-xl shadow-2xl z-50 overflow-hidden`}
                                     style={{ animation: 'fadeSlideDown 0.15s ease' }}>
                                    <button
                                        onClick={() => { handleExportToPNG(); setShowExportMenu(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${textPrimary} hover:bg-almet-sapphire hover:text-white transition-colors`}
                                    >
                                        <FileImage size={15} className="flex-shrink-0" />
                                        <div className="text-left">
                                            <p className="font-semibold leading-none">PNG Image</p>
                                            <p className="text-[10px] opacity-60 mt-0.5">High-res, 3× DPI</p>
                                        </div>
                                    </button>
                                    <div className={`border-t ${borderColor}`} />
                                    <button
                                        onClick={() => { handleExportToPDF(); setShowExportMenu(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${textPrimary} hover:bg-almet-sapphire hover:text-white transition-colors`}
                                    >
                                        <FileText size={15} className="flex-shrink-0" />
                                        <div className="text-left">
                                            <p className="font-semibold leading-none">PDF Document</p>
                                            <p className="text-[10px] opacity-60 mt-0.5">A3 landscape</p>
                                        </div>
                                    </button>
                                    {handlePrint && (
                                        <>
                                            <div className={`border-t ${borderColor}`} />
                                            <button
                                                onClick={() => { handlePrint(); setShowExportMenu(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${textPrimary} hover:bg-almet-sapphire hover:text-white transition-colors`}
                                            >
                                                <Printer size={15} className="flex-shrink-0" />
                                                <div className="text-left">
                                                    <p className="font-semibold leading-none">Print</p>
                                                    <p className="text-[10px] opacity-60 mt-0.5">Browser print dialog</p>
                                                </div>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            className={iconBtn}
                        >
                            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={() => fetchFullTreeWithVacancies()}
                            disabled={isLoading}
                            title="Refresh data"
                            className={`${iconBtn} disabled:opacity-40`}
                        >
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OrgChartHeader;
