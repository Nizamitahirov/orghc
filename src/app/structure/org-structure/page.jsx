// app/org-chart/page.jsx - COMPLETE VERSION with Back Button & Persistence
'use client'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { useOrgChart } from '@/hooks/useOrgChart';
import jobDescriptionService from '@/services/jobDescriptionService';

// Import all components
import OrgChartHeader from '@/components/orgchart/OrgChartHeader';
import OrgChartFilters from '@/components/orgchart/OrgChartFilters';
import EmployeeModal from '@/components/orgchart/EmployeeModal';
import JobDescriptionModal from '@/components/orgchart/JobDescriptionModal';
import GridView from '@/components/orgchart/OrgChartGridView';
import { ReactFlowProvider } from 'reactflow';
import TreeView from '@/components/orgchart/OrgChartTreeView';

const OrgChart = () => {
    const { darkMode } = useTheme();
    const containerRef = useRef(null);
    
    // Job Description Modal State
    const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false);
    const [jobDetail, setJobDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    
    // Company filter state WITH localStorage persistence
    const [selectedCompany, setSelectedCompany] = useState(() => {
        // Load from localStorage on initial render
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('orgchart_selected_company');
            return saved || null;
        }
        return null;
    });
    
    // Get all org chart data and methods from hook
    const {
        orgChart,
        fullTree,
        summary,
        selectedEmployee,
        filters,
        filterOptions,
        viewMode,
        showFilters,
        isFullscreen,
        expandedNodes,
        layoutDirection,
        loading,
        isLoading,
        fetchFullTreeWithVacancies,
        updateFilter,
        clearFilters,
        setViewMode,
        setShowFilters,
        setIsFullscreen,
        setLayoutDirection,
        toggleExpandedNode,
        setSelectedEmployee,
        clearSelectedEmployee,
        hasActiveFilters,
        setExpandedNodes
    } = useOrgChart();

    // Theme colors
    const bgApp = darkMode ? "bg-slate-900" : "bg-almet-mystic";
    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";

    // Select styles for react-select
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#d1d5db',
            color: darkMode ? '#e2e8f0' : '#374151',
            minHeight: '38px',
            boxShadow: state.isFocused ? (darkMode ? '0 0 0 1px #30539b' : '0 0 0 1px #30539b') : 'none',
            '&:hover': {
                borderColor: darkMode ? '#64748b' : '#9ca3af'
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#d1d5db',
            boxShadow: darkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? (darkMode ? '#30539b' : '#30539b')
                : state.isFocused 
                    ? (darkMode ? '#475569' : '#f3f4f6')
                    : 'transparent',
            color: state.isSelected 
                ? '#ffffff'
                : (darkMode ? '#e2e8f0' : '#374151'),
            '&:hover': {
                backgroundColor: state.isSelected 
                    ? (darkMode ? '#30539b' : '#30539b')
                    : (darkMode ? '#475569' : '#f3f4f6')
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: darkMode ? '#475569' : '#e5e7eb',
            color: darkMode ? '#e2e8f0' : '#374151'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: darkMode ? '#e2e8f0' : '#374151',
            fontSize: '12px'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: darkMode ? '#94a3b8' : '#6b7280',
            '&:hover': {
                backgroundColor: darkMode ? '#ef4444' : '#ef4444',
                color: '#ffffff'
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: darkMode ? '#e2e8f0' : '#374151'
        }),
        input: (provided) => ({
            ...provided,
            color: darkMode ? '#e2e8f0' : '#374151'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: darkMode ? '#94a3b8' : '#9ca3af'
        })
    };

    // Save selected company to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedCompany) {
            localStorage.setItem('orgchart_selected_company', selectedCompany);
        }
    }, [selectedCompany]);

    // Back to company selection handler
    const handleBackToCompanySelection = useCallback(() => {
        setSelectedCompany(null);
        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('orgchart_selected_company');
        }
        // Clear all filters
        clearFilters();
        // Reset expanded nodes
        setExpandedNodes([]);
    }, [clearFilters, setExpandedNodes]);

    // Company options from orgChart data
    const companyOptions = useMemo(() => {
        if (!orgChart || orgChart.length === 0) {
            return [];
        }
        
        const companyCounts = {};
        orgChart.forEach(emp => {
            if (emp && emp.business_function) {
                const company = emp.business_function;
                companyCounts[company] = (companyCounts[company] || 0) + 1;
            }
        });
        
        // Add "All Companies" option at the beginning
        const options = [
            {
                value: 'ALL',
                label: `All Companies (${orgChart.length})`,
                count: orgChart.length,
                isAll: true
            }
        ];
        
        // Add individual companies
        const companyList = Object.entries(companyCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([company, count]) => ({
                value: company,
                label: `${company} (${count})`,
                count: count,
                isAll: false
            }));
        
        options.push(...companyList);
        
        return options;
    }, [orgChart]);

    // Filter orgChart by selected company
    const companyFilteredOrgChart = useMemo(() => {
        // If no company selected, return empty array
        if (!selectedCompany || !orgChart) return [];
        
        // If "ALL" selected, return all employees
        if (selectedCompany === 'ALL') {
            return orgChart;
        }
        
        // Filter by specific company
        const filtered = orgChart.filter(emp => emp.business_function === selectedCompany);
        return filtered;
    }, [orgChart, selectedCompany]);

    // Apply search filter on company filtered data
    const searchFilteredOrgChart = useMemo(() => {
        if (!companyFilteredOrgChart || companyFilteredOrgChart.length === 0) {
            return [];
        }

        // If no search term, return company filtered data
        if (!filters.search || filters.search.trim() === '') {
            return companyFilteredOrgChart;
        }

        const searchTerm = filters.search.toLowerCase().trim();

        return companyFilteredOrgChart.filter(employee => {
            if (!employee) return false;

            const searchableFields = [
                employee.name,
                employee.employee_id,
                employee.email,
                employee.title,
                employee.department,
                employee.unit,
                employee.business_function
            ]
                .filter(Boolean)
                .map(field => String(field).toLowerCase());

            return searchableFields.some(field => field.includes(searchTerm));
        });
    }, [companyFilteredOrgChart, filters.search]);

    // Count vacant positions from search filtered data
    // Update vacancy count calculation
const vacantCount = useMemo(() => {
    if (!searchFilteredOrgChart || searchFilteredOrgChart.length === 0) {
        return 0;
    }
    
    return searchFilteredOrgChart.filter(emp => {
        // ✅ FIXED: Check employee_details.is_vacancy first
        return Boolean(
            emp.employee_details?.is_vacancy ||  // ✅ Primary - backend format
            emp.is_vacancy || 
            emp.vacant || 
            emp.record_type === 'vacancy' ||
            (emp.name && emp.name.includes('[VACANT]'))
        );
    }).length;
}, [searchFilteredOrgChart]);

    // Calculate summary stats from search filtered data
    const companySummary = useMemo(() => {
        if (!searchFilteredOrgChart || searchFilteredOrgChart.length === 0) {
            return {
                totalEmployees: 0,
                totalManagers: 0,
                totalDepartments: 0,
                totalBusinessFunctions: 0
            };
        }

        const totalEmployees = searchFilteredOrgChart.length;
        const totalManagers = searchFilteredOrgChart.filter(emp => 
            emp.direct_reports && emp.direct_reports > 0
        ).length;
        
        const departments = new Set(
            searchFilteredOrgChart
                .map(emp => emp.department)
                .filter(Boolean)
        );
        
        const businessFunctions = new Set(
            searchFilteredOrgChart
                .map(emp => emp.business_function)
                .filter(Boolean)
        );

        return {
            totalEmployees,
            totalManagers,
            totalDepartments: departments.size,
            totalBusinessFunctions: businessFunctions.size
        };
    }, [searchFilteredOrgChart]);

    // Fetch Job Description with Database ID
     const fetchJobDescription = async (employeeId) => {
        try {
            setDetailLoading(true);
            
            if (!employeeId) {
                alert('Employee ID is missing.');
                return;
            }
            
            const employeeData = searchFilteredOrgChart?.find(emp => emp.employee_id === employeeId);
            
            if (!employeeData) {
                alert('Employee not found in organizational chart.');
                return;
            }
            
            const databaseId = employeeData.id;
            
            if (!databaseId) {
                console.error('Database ID missing for employee:', employeeData);
                alert('Employee database ID is missing.');
                return;
            }
            
            // ✅ Step 1: Get employee's job description assignments
            let assignmentResponse;
            try {
                assignmentResponse = await jobDescriptionService.getEmployeeJobDescriptions(databaseId);
            } catch (apiError) {
                if (apiError.response?.status === 404) {
                    alert('No job description found for this employee.');
                    return;
                }
                throw apiError;
            }
            
            // ✅ Extract job_descriptions array from response
            const jobDescriptions = assignmentResponse.job_descriptions || assignmentResponse || [];
            
            if (!jobDescriptions || jobDescriptions.length === 0) {
                alert('No job description found for this employee.');
                return;
            }

            // ✅ Step 2: Select the most relevant assignment
            let selectedAssignment = jobDescriptions.find(job => job.status === 'APPROVED');
            if (!selectedAssignment) {
                const sorted = [...jobDescriptions].sort((a, b) => {
                    const dateA = new Date(a.updated_at || a.created_at || 0);
                    const dateB = new Date(b.updated_at || b.created_at || 0);
                    return dateB - dateA;
                });
                selectedAssignment = sorted[0];
            }

            // ✅ Step 3: Get the job_description_id from the assignment
            const jobDescriptionId = selectedAssignment.job_description_id || selectedAssignment.job_description;
            
            if (!jobDescriptionId) {
                console.error('Job description ID missing from assignment:', selectedAssignment);
                alert('Job description ID is missing.');
                return;
            }

            // ✅ Step 4: Fetch full job description detail
            const detail = await jobDescriptionService.getJobDescription(jobDescriptionId);
            
            // ✅ Step 5: Fetch all assignments for this job description
            const assignmentsData = await jobDescriptionService.getJobDescriptionAssignments(jobDescriptionId);
            
            // ✅ Step 6: Merge everything together
            const enrichedDetail = {
                ...detail,
                // Add assignment info
                assignments: assignmentsData.assignments || [],
                total_assignments: assignmentsData.total_assignments || 0,
                employee_assignments_count: assignmentsData.summary?.employees || 0,
                vacancy_assignments_count: assignmentsData.summary?.vacancies || 0,
                approved_count: assignmentsData.summary?.approved || 0,
                pending_count: assignmentsData.summary?.pending || 0,
                overall_status: assignmentsData.summary?.status || detail.status || 'UNKNOWN',
                
                // Keep original assignment data for reference
                current_assignment: selectedAssignment
            };
            
            setJobDetail(enrichedDetail);
            setShowJobDescriptionModal(true);
            
        } catch (error) {
            console.error('Error fetching job description:', error);
            
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 404:
                        alert('Job description not found.');
                        break;
                    case 403:
                        alert('You do not have permission to view this job description.');
                        break;
                    case 401:
                        alert('Authentication required. Please log in.');
                        break;
                    default:
                        alert(`Error loading job description: ${error.response.data?.message || 'Unknown error'}`);
                }
            } else if (error.message) {
                alert(`Error: ${error.message}`);
            } else {
                alert('An unexpected error occurred while loading the job description.');
            }
        } finally {
            setDetailLoading(false);
        }
    };
    // Export to PNG using html-to-image
    const [exportLoading, setExportLoading] = useState(false);
    
    const handleExportToPNG = useCallback(async () => {
        try {
            setExportLoading(true);
            
            // Dynamic import to avoid SSR issues
            const { toPng } = await import('html-to-image');
            
            const container = document.querySelector('.react-flow');
            
            if (!container) {
                alert('Chart not found');
                return;
            }

            const dataUrl = await toPng(container, {
                backgroundColor: darkMode ? '#0f172a' : '#e7ebf1',
                cacheBust: true,
                pixelRatio: 2,
                quality: 1,
                skipAutoScale: true,
                filter: (node) => {
                    // Exclude React Flow UI controls from export
                    const exclusionClasses = [
                        'react-flow__controls',
                        'react-flow__minimap',
                        'react-flow__attribution',
                        'react-flow__panel'
                    ];
                    
                    if (node.classList) {
                        for (const className of exclusionClasses) {
                            if (node.classList.contains(className)) {
                                return false;
                            }
                        }
                    }
                    
                    return true;
                }
            });

            // Create download link
            const link = document.createElement('a');
            link.download = `org-chart-${selectedCompany || 'all'}-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
            
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please ensure you have installed html-to-image package.');
        } finally {
            setExportLoading(false);
        }
    }, [darkMode, selectedCompany]);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                const element = document.querySelector('.org-chart-container');
                if (element && element.requestFullscreen) {
                    await element.requestFullscreen();
                    setIsFullscreen(true);
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                }
            }
        } catch (error) {
            setIsFullscreen(!isFullscreen);
        }
    }, [setIsFullscreen, isFullscreen]);

    // Navigate to employee
    const navigateToEmployee = useCallback((employeeId) => {
        const employee = searchFilteredOrgChart?.find(emp => emp.employee_id === employeeId);
        if (employee) {
            setSelectedEmployee(employee);
            
            const pathToEmployee = [];
            let current = employee;
            while (current && current.line_manager_id) {
                pathToEmployee.push(current.line_manager_id);
                current = searchFilteredOrgChart.find(emp => emp.employee_id === current.line_manager_id);
            }
            
            const newExpandedNodes = [...new Set([...expandedNodes, ...pathToEmployee])];
            setExpandedNodes(newExpandedNodes);
        }
    }, [searchFilteredOrgChart, expandedNodes, setExpandedNodes, setSelectedEmployee]);

    // Auto-expand initial nodes when company changes
    useEffect(() => {
        if (selectedCompany && searchFilteredOrgChart && searchFilteredOrgChart.length > 0) {
            let rootEmployees = searchFilteredOrgChart.filter(emp => 
                !emp.line_manager_id && !emp.manager_id && !emp.parent_id
            );
            
            if (rootEmployees.length === 0) {
                const maxReports = Math.max(...searchFilteredOrgChart.map(emp => emp.direct_reports || 0));
                if (maxReports > 0) {
                    rootEmployees = searchFilteredOrgChart.filter(emp => (emp.direct_reports || 0) === maxReports);
                }
            }
            
            if (rootEmployees.length === 0) {
                rootEmployees = searchFilteredOrgChart.slice(0, Math.min(3, searchFilteredOrgChart.length));
            }
            
            const initialExpanded = rootEmployees.map(emp => emp.employee_id).filter(Boolean);
            if (initialExpanded.length > 0) {
                setExpandedNodes(initialExpanded);
            }
        }
    }, [selectedCompany, searchFilteredOrgChart, setExpandedNodes]);

    // Loading state
    if (loading.orgChart && (!orgChart || orgChart.length === 0)) {
        return (
            <DashboardLayout>
                <div className={`h-full ${bgApp} flex items-center justify-center`}>
                    <div className="text-center">
                        <RefreshCw className={`w-8 h-8 ${textMuted} animate-spin mx-auto mb-4`} />
                        <p className={`${textSecondary}`}>Loading organizational chart...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Show company selection screen if no company selected
    if (!selectedCompany) {
        return (
            <DashboardLayout>
                <div className={`h-full ${bgApp} flex items-center justify-center p-6 org-chart-container`}>
                    <div className={`${bgCard} rounded-2xl shadow-2xl p-8 max-w-2xl w-full border ${borderColor}`}>
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                                <Building2 className="w-10 h-10 text-white" />
                            </div>
                            <h1 className={`text-3xl font-bold ${textHeader} mb-3`}>
                                Organizational Chart
                            </h1>
                            <p className={`${textSecondary} text-lg mb-8`}>
                                Select a company to view its organizational structure
                            </p>
                        </div>

                        {companyOptions.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className={`w-8 h-8 ${textMuted} animate-spin mx-auto mb-4`} />
                                <p className={`${textSecondary}`}>Loading companies...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {companyOptions.map((company) => (
                                    <button
                                        key={company.value}
                                        onClick={() => setSelectedCompany(company.value)}
                                        className={`w-full p-4 ${bgApp} hover:bg-almet-sapphire hover:text-white ${textHeader} rounded-xl border ${
                                            company.isAll ? 'border-almet-sapphire border-2' : borderColor
                                        } transition-all duration-200 hover:shadow-lg hover:scale-[1.02] text-left flex items-center justify-between group ${
                                            company.isAll ? 'bg-gradient-to-r from-almet-sapphire/10 to-almet-cloud-burst/10' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Building2 className={`w-5 h-5 ${
                                                company.isAll ? 'text-almet-sapphire' : 'text-almet-sapphire'
                                            } group-hover:text-white transition-colors`} />
                                            <span className={`font-semibold text-base ${
                                                company.isAll ? 'text-almet-sapphire group-hover:text-white' : ''
                                            }`}>
                                                {company.isAll ? 'All Companies' : company.value}
                                            </span>
                                        </div>
                                        <span className={`${textMuted} group-hover:text-white text-sm`}>
                                            {company.count} employees
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} ${bgApp} flex flex-col org-chart-container`}>
                {/* Header with Company Selector and Back Button */}
                <OrgChartHeader
                    summary={companySummary}
                    orgChart={searchFilteredOrgChart}
                    filteredOrgChart={searchFilteredOrgChart}
                    vacantCount={vacantCount}
                    expandedNodes={expandedNodes}
                    isLoading={isLoading}
                    filters={filters}
                    viewMode={viewMode}
                    showFilters={showFilters}
                    isFullscreen={isFullscreen}
                    updateFilter={updateFilter}
                    setViewMode={setViewMode}
                    setShowFilters={setShowFilters}
                    handleExportToPNG={handleExportToPNG}
                    exportLoading={exportLoading}
                    toggleFullscreen={toggleFullscreen}
                    fetchFullTreeWithVacancies={fetchFullTreeWithVacancies}
                    hasActiveFilters={hasActiveFilters}
                    darkMode={darkMode}
                    selectedCompany={selectedCompany}
                    onBackToCompanySelection={handleBackToCompanySelection}
                />

                {/* Advanced Filters Panel */}
                <OrgChartFilters
                    showFilters={showFilters}
                    filters={filters}
                    filterOptions={filterOptions}
                    updateFilter={updateFilter}
                    clearFilters={clearFilters}
                    setShowFilters={setShowFilters}
                    selectStyles={selectStyles}
                    darkMode={darkMode}
                    isFullscreen={isFullscreen}
                />

                {/* Main Chart Container */}
                <div className="relative overflow-hidden flex-grow">
                    {viewMode === 'tree' ? (
                        <ReactFlowProvider>
                            <TreeView
                                filteredOrgChart={searchFilteredOrgChart}
                                expandedNodes={expandedNodes}
                                layoutDirection={layoutDirection}
                                setLayoutDirection={setLayoutDirection}
                                toggleExpandedNode={toggleExpandedNode}
                                setSelectedEmployee={setSelectedEmployee}
                                navigateToEmployee={navigateToEmployee}
                                orgChart={searchFilteredOrgChart}
                                setExpandedNodes={setExpandedNodes}
                                isLoading={isLoading}
                                darkMode={darkMode}
                            />
                        </ReactFlowProvider>
                    ) : (
                        <GridView
                            filteredOrgChart={searchFilteredOrgChart}
                            setSelectedEmployee={setSelectedEmployee}
                            darkMode={darkMode}
                        />
                    )}
                </div>

                {/* Employee Detail Modal */}
                {selectedEmployee && (
                    <EmployeeModal
                        selectedEmployee={selectedEmployee}
                        clearSelectedEmployee={clearSelectedEmployee}
                        fetchJobDescription={fetchJobDescription}
                        detailLoading={detailLoading}
                        orgChart={searchFilteredOrgChart}
                        setSelectedEmployee={setSelectedEmployee}
                        darkMode={darkMode}
                    />
                )}

                {/* Job Description Modal */}
                {typeof window !== 'undefined' && (
                    <JobDescriptionModal
                        showJobDescriptionModal={showJobDescriptionModal}
                        setShowJobDescriptionModal={setShowJobDescriptionModal}
                        jobDetail={jobDetail}
                        setJobDetail={setJobDetail}
                        darkMode={darkMode}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrgChart;