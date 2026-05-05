// app/org-chart/page.jsx
'use client'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { useOrgChart } from '@/hooks/useOrgChart';
import jobDescriptionService from '@/services/jobDescriptionService';

import OrgChartHeader from '@/components/orgchart/OrgChartHeader';
import OrgChartFilters from '@/components/orgchart/OrgChartFilters';
import EmployeeModal from '@/components/orgchart/EmployeeModal';
import JobDescriptionModal from '@/components/orgchart/JobDescriptionModal';

// Heavy components (ReactFlow + dagre) — lazy loaded to keep initial bundle small
const GridView = dynamic(() => import('@/components/orgchart/OrgChartGridView'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96 text-gray-400">Loading chart...</div>,
});

// TreeView wrapped with ReactFlowProvider in a dedicated server-safe wrapper file
const TreeViewWithProvider = dynamic(
  () => import('@/components/orgchart/OrgChartTreeViewWrapper'),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-96 text-gray-400">Loading chart...</div>,
  }
);

import { exportToPNG, exportToPDF, exportToPrint } from '@/utils/orgChartExport';

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

    // Select styles for react-select — memoized so OrgChartFilters doesn't re-render on every keystroke
    const selectStyles = useMemo(() => ({
        control: (provided, state) => ({
            ...provided,
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#d1d5db',
            color: darkMode ? '#e2e8f0' : '#374151',
            minHeight: '34px',
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
            fontSize: '10px'
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
    }), [darkMode]);

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

    // app/org-chart/page.jsx -  FIXED: Normalized company options

//  Company options from orgChart data - NORMALIZED for case-insensitivity
const companyOptions = useMemo(() => {
    if (!orgChart || orgChart.length === 0) {
        return [];
    }
    
    //  FIXED: Normalize company names (case-insensitive grouping)
    const companyCountsMap = new Map(); // Use Map to preserve order and merge case variants
    
    orgChart.forEach(emp => {
        if (emp && emp.business_function) {
            const company = emp.business_function;
            const companyLower = String(company).toLowerCase().trim();
            
            if (!companyCountsMap.has(companyLower)) {
                // First time seeing this company (any casing)
                companyCountsMap.set(companyLower, {
                    displayName: company, // Use the first casing we see
                    count: 0,
                    variants: new Set([company]) // Track all case variants
                });
            }
            
            const companyData = companyCountsMap.get(companyLower);
            companyData.count += 1;
            companyData.variants.add(company); // Track this variant
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
    
    //  Add individual companies (sorted by count)
    const companyList = Array.from(companyCountsMap.entries())
        .sort((a, b) => b[1].count - a[1].count) // Sort by count descending
        .map(([companyLower, data]) => ({
            value: data.displayName, // Use original casing for value
            label: `${data.displayName} (${data.count})`,
            count: data.count,
            isAll: false,
            normalized: companyLower //  Store normalized version for matching
        }));
    
    options.push(...companyList);
    
 
    
    return options;
}, [orgChart]);


// app/org-chart/page.jsx -  FIXED: Case-insensitive company filter

// Company filtered data — fallback to orgChart when fullTree not yet loaded
const companyFilteredOrgChart = useMemo(() => {
    const dataSource = (fullTree && fullTree.length > 0) ? fullTree : orgChart;
    if (!selectedCompany || !dataSource || dataSource.length === 0) return [];

    if (selectedCompany === 'ALL') return dataSource;

    const getBusinessFunction = (item) => {
        if (!item) return null;
        return item.business_function ||
               item.business_function_name ||
               item.department?.business_function ||
               null;
    };

    const selectedCompanyLower = String(selectedCompany).toLowerCase().trim();

    return dataSource.filter(item => {
        if (!item) return false;
        const bf = getBusinessFunction(item);
        if (!bf) return false;
        return String(bf).toLowerCase().trim() === selectedCompanyLower;
    });
}, [fullTree, orgChart, selectedCompany]);

const searchFilteredOrgChart = useMemo(() => {
    if (!companyFilteredOrgChart || companyFilteredOrgChart.length === 0) {
        return [];
    }

    // No search term - return all
    if (!filters.search || filters.search.trim() === '') {
        return companyFilteredOrgChart;
    }

    const searchTerm = filters.search.toLowerCase().trim();

    const filtered = companyFilteredOrgChart.filter(employee => {
        if (!employee) return false;

        //  Check if this is a vacancy
        const isVacancy = Boolean(
            employee.employee_details?.is_vacancy || 
            employee.is_vacancy || 
            employee.record_type === 'vacancy'
        );

        // Build searchable fields array
        const searchableFields = [
            employee.name,
            employee.employee_id,
            employee.title,
            employee.job_title,
            employee.department,
            employee.department_name,
            employee.unit,
            employee.unit_name,
            employee.business_function,
            employee.business_function_name,
            employee.position_group,
            employee.position_group_name
        ];
        
        //  Add vacancy-specific searchable fields
        if (isVacancy) {
            searchableFields.push(
                employee.employee_details?.position_id,
                employee.position_id,
                'VACANT',
                'vacancy',
                'open position'
            );
        } else {
            // Add employee-specific fields
            searchableFields.push(
                employee.email,
                employee.phone
            );
        }

        // Check if any field matches
        const matches = searchableFields
            .filter(Boolean)
            .map(field => String(field).toLowerCase())
            .some(field => field.includes(searchTerm));

        return matches;
    });

    return filtered;
}, [companyFilteredOrgChart, filters.search]);

// Lazy-visible nodes: only render root + children of expanded nodes when chart is large
const LAZY_THRESHOLD = 150;
const lazyVisibleNodes = useMemo(() => {
    if (!searchFilteredOrgChart || searchFilteredOrgChart.length <= LAZY_THRESHOLD) {
        return searchFilteredOrgChart;
    }
    const visibleIds = new Set();
    // Always include roots
    searchFilteredOrgChart.forEach((emp) => {
        if (!emp.line_manager_id && !emp.manager_id && !emp.parent_id) {
            visibleIds.add(String(emp.employee_id));
        }
    });
    // Include expanded nodes and their direct children
    const expandedSet = new Set(expandedNodes.map(String));
    searchFilteredOrgChart.forEach((emp) => {
        const parentId = String(emp.line_manager_id || emp.manager_id || emp.parent_id || "");
        if (expandedSet.has(parentId) || expandedSet.has(String(emp.employee_id))) {
            visibleIds.add(String(emp.employee_id));
        }
    });
    return searchFilteredOrgChart.filter((emp) => visibleIds.has(String(emp.employee_id)));
}, [searchFilteredOrgChart, expandedNodes]);

const isLazyMode = searchFilteredOrgChart.length > LAZY_THRESHOLD;

//  FIXED: Vacant count
const vacantCount = useMemo(() => {
    if (!searchFilteredOrgChart || searchFilteredOrgChart.length === 0) {
        return 0;
    }
    
    const count = searchFilteredOrgChart.filter(emp => {
        return Boolean(
            emp.employee_details?.is_vacancy ||
            emp.is_vacancy || 
            emp.vacant || 
            emp.record_type === 'vacancy' ||
            (emp.name && emp.name.includes('[VACANT]'))
        );
    }).length;
    
    return count;
}, [searchFilteredOrgChart]);

//  FIXED: Summary stats - properly separates employees and vacancies
const companySummary = useMemo(() => {
    if (!searchFilteredOrgChart || searchFilteredOrgChart.length === 0) {
        return {
            totalEmployees: 0,
            totalManagers: 0,
            totalDepartments: 0,
            totalBusinessFunctions: 0,
            totalVacancies: 0,
            totalPositions: 0
        };
    }

    //  Separate employees and vacancies
    const employees = searchFilteredOrgChart.filter(emp => 
        !emp.employee_details?.is_vacancy && 
        !emp.is_vacancy && 
        emp.record_type !== 'vacancy'
    );
    
    const vacancies = searchFilteredOrgChart.filter(emp => 
        emp.employee_details?.is_vacancy || 
        emp.is_vacancy || 
        emp.record_type === 'vacancy'
    );

    const totalEmployees = employees.length;
    const totalVacancies = vacancies.length;
    
    // Only count managers from employees
    const totalManagers = employees.filter(emp => 
        emp.direct_reports && emp.direct_reports > 0
    ).length;
    
    // Count unique departments (from both employees and vacancies)
    const departments = new Set(
        searchFilteredOrgChart
            .map(emp => emp.department || emp.department_name)
            .filter(Boolean)
    );
    
    // Count unique business functions (from both employees and vacancies)
    const businessFunctions = new Set(
        searchFilteredOrgChart
            .map(emp => emp.business_function || emp.business_function_name)
            .filter(Boolean)
    );

    const summary = {
        totalEmployees,
        totalManagers,
        totalDepartments: departments.size,
        totalBusinessFunctions: businessFunctions.size,
        totalVacancies,
        totalPositions: totalEmployees + totalVacancies
    };

    return summary;
}, [searchFilteredOrgChart]);

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
            
            //  Step 1: Get employee's job description assignments
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
            
            //  Extract job_descriptions array from response
            const jobDescriptions = assignmentResponse.job_descriptions || assignmentResponse || [];
            
            if (!jobDescriptions || jobDescriptions.length === 0) {
                alert('No job description found for this employee.');
                return;
            }

            //  Step 2: Select the most relevant assignment
            let selectedAssignment = jobDescriptions.find(job => job.status === 'APPROVED');
            if (!selectedAssignment) {
                const sorted = [...jobDescriptions].sort((a, b) => {
                    const dateA = new Date(a.updated_at || a.created_at || 0);
                    const dateB = new Date(b.updated_at || b.created_at || 0);
                    return dateB - dateA;
                });
                selectedAssignment = sorted[0];
            }

            //  Step 3: Get the job_description_id from the assignment
            const jobDescriptionId = selectedAssignment.job_description_id || selectedAssignment.job_description;
            
            if (!jobDescriptionId) {
                return;
            }

            //  Step 4: Fetch full job description detail
            const detail = await jobDescriptionService.getJobDescription(jobDescriptionId);
            
            //  Step 5: Fetch all assignments for this job description
            const assignmentsData = await jobDescriptionService.getJobDescriptionAssignments(jobDescriptionId);
            
            //  Step 6: Merge everything together
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

const [exportLoading, setExportLoading] = useState(null); // null | 'png' | 'pdf' | 'print'

const handleExportToPNG = useCallback(() => {
    exportToPNG({ darkMode, selectedCompany, setExportLoading });
}, [darkMode, selectedCompany]);

const handleExportToPDF = useCallback(() => {
    exportToPDF({ darkMode, selectedCompany, setExportLoading, summary: companySummary });
}, [darkMode, selectedCompany, companySummary]);

const handlePrint = useCallback(() => {
    exportToPrint({ darkMode, selectedCompany, setExportLoading, summary: companySummary });
}, [darkMode, selectedCompany, companySummary]);





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
        const maxCount = Math.max(...companyOptions.filter(c => !c.isAll).map(c => c.count), 1);
        return (
            <DashboardLayout>
                <div className={`h-full ${bgApp} flex items-center justify-center p-6 org-chart-container`}>
                    <div className={`${bgCard} rounded-2xl shadow-2xl p-8 max-w-2xl w-full border ${borderColor}`}>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <h1 className={`text-2xl font-bold ${textHeader} mb-2`}>
                                Organizational Chart
                            </h1>
                            <p className={`${textSecondary} text-sm`}>
                                Select a company to view its organizational structure
                            </p>
                        </div>

                        {companyOptions.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className={`w-8 h-8 ${textMuted} animate-spin mx-auto mb-4`} />
                                <p className={`${textSecondary}`}>Loading companies...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {companyOptions.map((company) => (
                                    <button
                                        key={company.value}
                                        onClick={() => setSelectedCompany(company.value)}
                                        className={`w-full text-left rounded-xl border transition-all duration-150 hover:shadow-md hover:scale-[1.01] group overflow-hidden ${
                                            company.isAll
                                                ? 'border-almet-sapphire bg-gradient-to-r from-almet-sapphire/8 to-almet-cloud-burst/5 hover:from-almet-sapphire hover:to-almet-cloud-burst'
                                                : `${borderColor} ${bgApp} hover:border-almet-sapphire/50 hover:bg-almet-sapphire hover:text-white`
                                        }`}
                                    >
                                        <div className="px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                                    company.isAll
                                                        ? 'bg-almet-sapphire/15 group-hover:bg-white/20'
                                                        : 'bg-almet-sapphire/10 group-hover:bg-white/20'
                                                }`}>
                                                    <Building2 className={`w-4 h-4 transition-colors ${
                                                        company.isAll ? 'text-almet-sapphire group-hover:text-white' : 'text-almet-sapphire group-hover:text-white'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <span className={`font-semibold text-sm block ${
                                                        company.isAll ? 'text-almet-sapphire group-hover:text-white' : `${textHeader} group-hover:text-white`
                                                    }`}>
                                                        {company.isAll ? 'All Companies' : company.value}
                                                    </span>
                                                    {!company.isAll && (
                                                        <span className={`text-xs ${textMuted} group-hover:text-white/70`}>
                                                            {company.count} employee{company.count !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                                                company.isAll
                                                    ? 'bg-almet-sapphire/15 text-almet-sapphire group-hover:bg-white/20 group-hover:text-white'
                                                    : `${darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'} group-hover:bg-white/20 group-hover:text-white`
                                            }`}>
                                                {company.count}
                                            </span>
                                        </div>
                                        {/* Relative size bar */}
                                        {!company.isAll && (
                                            <div className={`h-0.5 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} group-hover:bg-white/20`}>
                                                <div
                                                    className="h-full bg-almet-sapphire/40 group-hover:bg-white/40 transition-all duration-300"
                                                    style={{ width: `${Math.round((company.count / maxCount) * 100)}%` }}
                                                />
                                            </div>
                                        )}
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
            {/* Export loading overlay */}
            {exportLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
                    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-almet-mystic dark:border-almet-san-juan">
                        <div className="w-12 h-12 rounded-full border-4 border-almet-sapphire border-t-transparent animate-spin" />
                        <p className="text-sm font-bold text-almet-cloud-burst dark:text-white">
                            Exporting {exportLoading === 'png' ? 'PNG image' : 'PDF document'}…
                        </p>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                            Please wait, this may take a few seconds
                        </p>
                    </div>
                </div>
            )}
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
                    handleExportToPDF={handleExportToPDF}
                    handlePrint={handlePrint}
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

                {/* Performance banner for large charts */}
                {isLazyMode && (
                    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-xs">
                        <span className="text-amber-700 dark:text-amber-300">
                            ⚡ Large chart ({searchFilteredOrgChart.length} nodes) — showing expanded levels only for performance. Click nodes to expand.
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            {lazyVisibleNodes.length} / {searchFilteredOrgChart.length} visible
                        </span>
                    </div>
                )}

                {/* Main Chart Container */}
                <div className="relative overflow-hidden flex-grow">
                    {viewMode === 'tree' ? (
                        <TreeViewWithProvider
                            filteredOrgChart={lazyVisibleNodes}
                            expandedNodes={expandedNodes}
                            layoutDirection={layoutDirection}
                            setLayoutDirection={setLayoutDirection}
                            toggleExpandedNode={toggleExpandedNode}
                            setSelectedEmployee={setSelectedEmployee}
                            navigateToEmployee={navigateToEmployee}
                            setExpandedNodes={setExpandedNodes}
                            isLoading={isLoading}
                            darkMode={darkMode}
                        />
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