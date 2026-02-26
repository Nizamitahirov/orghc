// src/components/jobCatalog/ReferenceDataView.jsx - Job Titles əlavə edilib

import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Loader2, Users, Building, Briefcase, Target, Award,
  Search, Eye, EyeOff, ArrowUpDown, ChevronDown, ChevronUp,
  Building2, Settings, Layers, Check, X, TrendingUp, FileText
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';
import Pagination from '@/components/common/Pagination';
import ConfirmationModal from '@/components/common/ConfirmationModal';

export default function ReferenceDataView({ context }) {
  const {
    businessFunctions, departments, units, jobFunctions, jobTitles, positionGroups,
    loading, openCrudModal, handleDelete, employees
  } = context;

  const { darkMode } = useTheme();
  
  // State with localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobCatalog_referenceTab') || 'business_functions';
    }
    return 'business_functions';
  });
  
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobCatalog_referenceViewMode') || 'table';
    }
    return 'table';
  });
  
  const [searchTerm, setSearchTerm] = useState('');
 
  
  const [showInactive, setShowInactive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobCatalog_showInactive') === 'true';
    }
    return false;
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    item: null,
    type: null
  });
 const [sortConfig, setSortConfig] = useState(() => {
    const tab = typeof window !== 'undefined' 
      ? localStorage.getItem('jobCatalog_referenceTab') || 'business_functions'
      : 'business_functions';
    
    // Yalnız position groups üçün id-yə görə sort
    if (tab === 'position_groups') {
      return { key: 'id', direction: 'asc' };
    }
    return { key: 'name', direction: 'asc' };
  });
  
  // Save preferences to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_referenceTab', activeTab);
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_referenceViewMode', viewMode);
    }
  }, [viewMode]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_showInactive', showInactive.toString());
    }
  }, [showInactive]);
 React.useEffect(() => {
    if (activeTab === 'position_groups') {
      setSortConfig({ key: 'id', direction: 'asc' });
    } else {
      setSortConfig({ key: 'name', direction: 'asc' });
    }
  }, [activeTab]);
  // Calculate employee counts
  const getEmployeeCountsByType = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return {};
    
    const counts = {
      business_functions: {},
      departments: {},
      units: {},
      job_functions: {},
      job_titles: {}, // NEW
      position_groups: {}
    };

    employees.forEach(emp => {
      if (emp.business_function_name) {
        counts.business_functions[emp.business_function_name] = 
          (counts.business_functions[emp.business_function_name] || 0) + 1;
      }
      if (emp.department_name) {
        counts.departments[emp.department_name] = 
          (counts.departments[emp.department_name] || 0) + 1;
      }
      if (emp.unit_name) {
        counts.units[emp.unit_name] = 
          (counts.units[emp.unit_name] || 0) + 1;
      }
      if (emp.job_function_name) {
        counts.job_functions[emp.job_function_name] = 
          (counts.job_functions[emp.job_function_name] || 0) + 1;
      }
      if (emp.job_title) { // NEW
        counts.job_titles[emp.job_title] = 
          (counts.job_titles[emp.job_title] || 0) + 1;
      }
      if (emp.position_group_name) {
        counts.position_groups[emp.position_group_name] = 
          (counts.position_groups[emp.position_group_name] || 0) + 1;
      }
    });

    return counts;
  }, [employees]);

  const getTabIcon = (tabId) => {
    const icons = {
      business_functions: Building,
      departments: Target,
      units: Briefcase,
      job_functions: Users,
      job_titles: FileText, // NEW
      position_groups: Award
    };
    return icons[tabId] || Building;
  };

  const getTabConfig = (tabId) => {
    const configs = {
      business_functions: {
        title: 'Companys',
        data: businessFunctions,
        columns: [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'code', label: 'Code', sortable: true },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'department_count', label: 'Departments', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      departments: {
        title: 'Departments',
        data: departments,
        columns: [
          { key: 'name', label: 'Department', sortable: true },
          { key: 'business_function_name', label: 'Company', sortable: true },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'unit_count', label: 'Units', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      units: {
        title: 'Units',
        data: units,
        columns: [
          { key: 'name', label: 'Unit', sortable: true },
          { key: 'department_name', label: 'Department', sortable: true },
          { key: 'business_function_name', label: 'Company', sortable: true },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      job_functions: {
        title: 'Job Functions',
        data: jobFunctions,
        columns: [
          { key: 'name', label: 'Job Function', sortable: true },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      job_titles: { // NEW
        title: 'Job Titles',
        data: jobTitles,
        columns: [
          { key: 'name', label: 'Job Title', sortable: true },
          { key: 'description', label: 'Description', sortable: false },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      position_groups: {
        title: 'Hierarchys',
        data: positionGroups,
        columns: [
          { key: 'name', label: 'Hierarchy', sortable: true },
          { key: 'hierarchy_level', label: 'Level', sortable: true, align: 'center' },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      }
    };
    return configs[tabId];
  };

  // Process data
  const processedData = useMemo(() => {
    const config = getTabConfig(activeTab);
    if (!config || !config.data) return [];

    let data = config.data.map(item => ({
      ...item,
      real_employee_count: getEmployeeCountsByType[activeTab]?.[item.label || item.name] || 0,
      department_count: activeTab === 'business_functions' ? 
        departments.filter(d => d.business_function_name === (item.label || item.name)).length : undefined,
      unit_count: activeTab === 'departments' ? 
        units.filter(u => u.department_name === (item.label || item.name)).length : undefined
    }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.name || item.label || '').toLowerCase().includes(term) ||
        (item.code || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        (item.business_function_name || '').toLowerCase().includes(term) ||
        (item.department_name || '').toLowerCase().includes(term)
      );
    }

    if (!showInactive) {
      data = data.filter(item => item.is_active !== false);
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'employee_count') {
          aVal = a.real_employee_count || 0;
          bVal = b.real_employee_count || 0;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        
        return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return data;
  }, [activeTab, searchTerm, showInactive, sortConfig, businessFunctions, departments, units, jobFunctions, jobTitles, positionGroups, getEmployeeCountsByType]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, showInactive]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = processedData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={10} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={10} className="text-almet-sapphire" /> : 
      <ChevronDown size={10} className="text-almet-sapphire" />;
  };

  const renderStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
        isActive 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      }`}>
        {isActive ? <Check size={8} /> : <X size={8} />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Delete handlers
  const openDeleteConfirmation = (type, item) => {
    setConfirmModal({
      isOpen: true,
      item,
      type
    });
  };

  const closeDeleteConfirmation = () => {
    setConfirmModal({
      isOpen: false,
      item: null,
      type: null
    });
  };

  const confirmDelete = async () => {
    if (confirmModal.item && confirmModal.type) {
      await handleDelete(confirmModal.type, confirmModal.item);
      closeDeleteConfirmation();
    }
  };

  const renderHierarchyView = () => {
    if (activeTab !== 'position_groups') return null;

    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Hierarchy Structure</h3>
        <div className="space-y-2">
          {paginatedData
            .sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0))
            .map((pg, index) => {
              const colors = getHierarchyColor(pg.name || pg.label, darkMode);
              const empCount = pg.real_employee_count || 0;
              
              return (
                <div 
                  key={pg.id || index} 
                  className="flex items-center justify-between p-2.5 rounded-lg border"
                  style={{ 
                    borderLeftWidth: '3px',
                    borderLeftColor: colors.borderColor,
                    backgroundColor: colors.backgroundColor
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                        style={{ backgroundColor: colors.borderColor }}
                      >
                        {pg.hierarchy_level}
                      </span>
                      <div>
                        <div 
                          className="font-medium text-xs"
                          style={{ color: colors.textColor }}
                        >
                          {pg.display_name || pg.name || pg.label}
                        </div>
                        {pg.grading_shorthand && (
                          <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai">
                            {pg.grading_shorthand}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right flex justify-center items-center gap-2">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{empCount}</div>
                      <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai">employees</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCrudModal(activeTab, 'edit', pg)}
                        className="p-1 rounded hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                        title="Edit"
                      >
                        <Edit size={10} className="text-sky-600 dark:text-sky-400" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(activeTab, pg)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete"
                        disabled={loading.crud}
                      >
                        <Trash2 size={10} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        
        {/* Pagination for Hierarchy View */}
        {processedData.length > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={processedData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    );
  };

  const renderTableView = () => {
    const config = getTabConfig(activeTab);
    if (!config) return null;

    if (loading.referenceData) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai text-xs">Loading...</span>
        </div>
      );
    }

    if (processedData.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 dark:bg-almet-san-juan rounded-full flex items-center justify-center mx-auto mb-3">
            {React.createElement(getTabIcon(activeTab), { size: 20, className: "text-gray-400 dark:text-almet-bali-hai" })}
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {searchTerm ? 'No results found' : 'No data available'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-almet-bali-hai mb-3">
            {searchTerm ? 'Try adjusting your search' : 'Add your first item to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openCrudModal(activeTab, 'create')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium"
            >
              <Plus size={12} />
              Add Item
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-almet-san-juan">
                <tr>
                  {config.columns.map((column) => (
                    <th 
                      key={column.key}
                      className={`px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-almet-bali-hai uppercase ${
                        column.align === 'center' ? 'text-center' : ''
                      } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-almet-comet' : ''}`}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {column.label}
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right text-[10px] font-medium text-gray-500 dark:text-almet-bali-hai uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-almet-cloud-burst divide-y divide-gray-200 dark:divide-almet-comet">
                {paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-almet-san-juan transition-colors">
                    {config.columns.map((column) => (
                      <td key={column.key} className={`px-3 py-2.5 whitespace-nowrap text-xs ${
                        column.align === 'center' ? 'text-center' : ''
                      }`}>
                        {column.key === 'name' && (
                          <div className="flex items-center gap-2">
                            {activeTab === 'position_groups' && (
                              <span 
                                className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: getHierarchyColor(item.name || item.label, darkMode).borderColor }}
                              >
                                {item.hierarchy_level}
                              </span>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.display_name || item.label || item.name}
                              </div>
                              {item.code && (
                                <div className="text-[10px] text-gray-500 dark:text-almet-bali-hai">
                                  {item.code}
                                </div>
                              )} 
                            </div>
                          </div>
                        )}
                        {column.key === 'description' && (
                          <div className="text-gray-600 dark:text-almet-bali-hai text-xs max-w-xs truncate">
                            {item.description || '—'}
                          </div>
                        )}
                        {column.key === 'employee_count' && (
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {item.real_employee_count || 0}
                            </div>
                          </div>
                        )}
                        {column.key === 'department_count' && (
                          <div className="text-center font-medium text-gray-600 dark:text-almet-bali-hai">
                            {item.department_count || 0}
                          </div>
                        )}
                        {column.key === 'unit_count' && (
                          <div className="text-center font-medium text-gray-600 dark:text-almet-bali-hai">
                            {item.unit_count || 0}
                          </div>
                        )}
                        {column.key === 'hierarchy_level' && (
                          <div className="text-center font-bold text-almet-sapphire">
                            {item.hierarchy_level}
                          </div>
                        )}
                        {column.key === 'is_active' && (
                          <div className="text-center">
                            {renderStatusBadge(item.is_active !== false)}
                          </div>
                        )}
                        {!['name', 'description', 'employee_count', 'department_count', 'unit_count', 'hierarchy_level', 'is_active'].includes(column.key) && (
                          <div className="text-gray-900 dark:text-white">
                            {item[column.key] || '—'}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openCrudModal(activeTab, 'edit', item)}
                          className="p-1 rounded hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                          title="Edit"
                        >
                          <Edit size={11} className="text-sky-600 dark:text-sky-400" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(activeTab, item)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete"
                          disabled={loading.crud}
                        >
                          <Trash2 size={11} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {processedData.length > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={processedData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              darkMode={darkMode}
            />
          </div>
        )}
      </>
    );
  };



  const tabs = [
    { id: 'business_functions', label: 'Companys', data: businessFunctions },
    { id: 'departments', label: 'Departments', data: departments },
    { id: 'units', label: 'Units', data: units },
    { id: 'job_functions', label: 'Job Functions', data: jobFunctions },
    { id: 'job_titles', label: 'Job Titles', data: jobTitles }, // NEW
    { id: 'position_groups', label: 'Hierarchys', data: positionGroups }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-almet-comet">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = getTabIcon(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-2 px-1 border-b-2 font-medium text-xs transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-500 dark:text-almet-bali-hai hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                <IconComponent size={12} />
                {tab.label}
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai text-[10px] rounded-full">
                  {tab.data?.length || 0}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {activeTabData?.label}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-7 pr-3 py-1.5 outline-0 text-xs border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-almet-comet overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1.5 text-xs ${viewMode === 'table' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'}`}
              title="Table View"
            >
              <Layers size={12} />
            </button>
            {activeTab === 'position_groups' && (
              <button
                onClick={() => setViewMode('hierarchy')}
                className={`px-2 py-1.5 text-xs ${viewMode === 'hierarchy' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'}`}
                title="Hierarchy View"
              >
                <TrendingUp size={12} />
              </button>
            )}
          
          </div>

          {/* Show/Hide Inactive */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              showInactive 
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' 
                : 'bg-gray-100 dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-200 dark:hover:bg-almet-comet'
            }`}
          >
            {showInactive ? <EyeOff size={12} /> : <Eye size={12} />}
            {showInactive ? 'Hide' : 'Show'} Inactive
          </button>

          {/* Add New Button */}
          <button
            onClick={() => openCrudModal(activeTab, 'create')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
          >
            <Plus size={12} />
            Add New
          </button>
        </div>
      </div>


      {viewMode === 'table' && renderTableView()}
      {viewMode === 'hierarchy' && activeTab === 'position_groups' && renderHierarchyView()}

     

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Confirmation"
        message={`Are you sure you want to delete "${confirmModal.item?.name || confirmModal.item?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading.crud}
        darkMode={darkMode}
      />
    </div>
  );
}