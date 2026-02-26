// src/components/headcount/HeadcountHeader.jsx - UPDATED with Admin-only actions
import { useState, useEffect } from "react";
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  Users,
  Upload,
  Download,
  ChevronDown,
  ArrowUpDown,
  Briefcase,
  Archive,
  Building2,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";
import { employeeService } from '@/services/newsService';

const HeadcountHeader = ({ 
  // Tab props
  activeTab = 'employees',
  onTabChange,
  
  // Statistics
  statistics = {},
  vacantPositionsStats = {},
  archiveStats = {},
  
  // Employee-specific props
  hasActiveFilters = false,
  onToggleAdvancedFilter,
  
  // Actions
  selectedEmployees = [],
  onToggleActionMenu,
  isActionMenuOpen,
  onQuickExport,
  onToggleExportModal,
  isExporting = false,
  
  // Import props
  onBulkImport,
  onBulkImportComplete,
  
  // Sorting
  currentSorting = [],
  onToggleAdvancedSorting,
  hasActiveSorting = false,
  
  // Filter count
  filteredCount = 0,
  totalEmployees = 0,
  
  // Settings
  onOpenSettings,
  
  // Theme
  darkMode = false
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);
  const router = useRouter();
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await employeeService.getEmployees({ page_size: 1 });
        
        const canViewAll = response.access_info?.can_view_all || false;
        const isManager = response.access_info?.is_manager || false;
        
        setAccessInfo({
          canViewAll,
          isManager
        });
        
        // Only users with can_view_all are considered admins
        setIsAdmin(canViewAll);
        
      } catch (error) {
        console.error('Failed to check admin access:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminAccess();
  }, []);
  
  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgSection = darkMode ? "bg-gray-700/30" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Tab configurations - Archive only for admins
  const tabs = [
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      color: 'almet-sapphire',
      bgColor: 'bg-almet-sapphire/10',
      borderColor: 'border-almet-sapphire/30',
      textColor: 'text-almet-sapphire',
      adminOnly: false
    },
    {
      id: 'vacant',
      label: 'Vacant',
      icon: Briefcase,
      color: 'orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700',
      textColor: 'text-orange-700 dark:text-orange-300',
      adminOnly: false
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      color: 'gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-700/20',
      borderColor: 'border-gray-200 dark:border-gray-600',
      textColor: 'text-gray-700 dark:text-gray-300',
      adminOnly: true // âœ… Only admins can see Archive tab
    }
  ];

  // Filter tabs based on admin access
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  // Get primary action based on active tab - Only for admins
  const getPrimaryAction = () => {
    if (!isAdmin) return null; // âœ… Only admins can add employees
    
    switch (activeTab) {
      case 'employees':
        return {
          label: 'Add Employee',
          icon: Plus,
          onClick: () => router.push('/structure/add-employee'),
          className: 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white hover:from-almet-astral hover:to-almet-steel-blue shadow-lg'
        };
      case 'vacant':
        return null;
      case 'archive':
        return null;
      default:
        return null;
    }
  };

  const primaryAction = getPrimaryAction();

  // Quick export handler
  const handleQuickExport = async (type, format = 'excel') => {
    try {
      setIsExportDropdownOpen(false);
      if (onQuickExport) {
        await onQuickExport({ type, format, context: activeTab });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Check if we should show employee-specific controls
  const showEmployeeControls = activeTab === 'employees';

  return (
    <div className="space-y-5">
      {/* Main Header */}
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm `}>
        <div className="p-5">
          {/* Top Row: Title + Main Actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl mr-3 shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-semibold ${textPrimary}`}>
                  Workforce Management
                </h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  Manage employees, vacant positions{isAdmin ? ', and archived records' : ''}
                </p>
              </div>
            </div>

            {/* Main Actions - Settings + Export/Import (Admin only for Settings and Import) */}
            <div className="flex items-center space-x-2">
              {/* Settings Button - âœ… Admin only */}
              {isAdmin && (
                <button
                  onClick={() => router.push('/structure/settings')}
                  className={`flex items-center px-3 py-2 text-xs border rounded-lg transition-all ${borderColor} ${textSecondary} ${hoverBg} hover:border-almet-sapphire/50 hover:text-almet-sapphire`}
                  title="Configure system settings"
                >
                  <Settings size={14} className="mr-2" />
                  Settings
                </button>
              )}

              {/* Export Button - Available to all users */}
              {showEmployeeControls && (
                <div className="relative">
                  <button
                    onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                    disabled={isExporting}
                    className={`flex items-center px-3 py-2 text-xs font-medium border rounded-lg transition-all ${
                      isExporting 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 cursor-not-allowed'
                        : `${borderColor} ${textSecondary} ${hoverBg} hover:border-almet-sapphire/50 hover:text-almet-sapphire`
                    } ${isExportDropdownOpen ? 'bg-almet-sapphire/5 border-almet-sapphire/30 text-almet-sapphire' : ''}`}
                    title="Export employee data"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-green-500 border-t-transparent mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download size={14} className="mr-2" />
                        Export
                        <ChevronDown size={12} className={`ml-1 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>

                  {/* Export Menu */}
                  {isExportDropdownOpen && !isExporting && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                          Quick Export Options
                        </div>
                        <button
                          onClick={() => handleQuickExport('all', 'excel')}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start">
                            <Download size={14} className="mt-0.5 mr-2 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium ${textPrimary}`}>
                                All Employees to Excel
                              </p>
                              <p className={`text-xs ${textMuted} mt-0.5`}>
                                Export all employees
                              </p>
                            </div>
                          </div>
                        </button>
                        {hasActiveFilters && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleQuickExport('filtered', 'excel')}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-almet-sapphire/5"
                            >
                              <div className="flex items-start">
                                <Download size={14} className="mt-0.5 mr-2 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium ${textPrimary}`}>
                                    Filtered Results to Excel
                                  </p>
                                  <p className={`text-xs ${textMuted} mt-0.5`}>
                                    Export filtered employees
                                  </p>
                                </div>
                              </div>
                            </button>
                          </>
                        )}
                        {selectedEmployees.length > 0 && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleQuickExport('selected', 'excel')}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-almet-sapphire/5"
                            >
                              <div className="flex items-start">
                                <Download size={14} className="mt-0.5 mr-2 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium ${textPrimary}`}>
                                    Selected Employees to Excel
                                  </p>
                                  <p className={`text-xs ${textMuted} mt-0.5`}>
                                    Export {selectedEmployees.length} selected employees
                                  </p>
                                </div>
                              </div>
                            </button>
                          </>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button
                          onClick={() => {
                            setIsExportDropdownOpen(false);
                            if (onToggleExportModal) {
                              onToggleExportModal();
                            }
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start">
                            <Download size={14} className="mt-0.5 mr-2 text-purple-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium ${textPrimary}`}>
                                Advanced Export Options...
                              </p>
                              <p className={`text-xs ${textMuted} mt-0.5`}>
                                Custom fields, formats, and filters
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Button - âœ… Admin only */}
              {showEmployeeControls && isAdmin && (
                <button
                  onClick={onBulkImport}
                  className={`flex items-center px-3 py-2 text-xs border rounded-lg transition-all ${borderColor} ${textSecondary} ${hoverBg} hover:border-almet-sapphire/50 hover:text-almet-sapphire`}
                  title="Import employees from Excel/CSV"
                >
                  <Upload size={14} className="mr-2" />
                  Import
                </button>
              )}

              {/* Primary Action - âœ… Admin only */}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className={`flex items-center px-3 py-2 text-xs rounded-lg transition-all font-medium ${primaryAction.className}`}
                >
                  <primaryAction.icon size={14} className="mr-2" />
                  {primaryAction.label}
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {visibleTabs.map((tab) => {
                const isActive = tab.id === activeTab;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? `${tab.bgColor} ${tab.textColor} border ${tab.borderColor} shadow-sm`
                        : `${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent`
                    }`}
                  >
                    <Icon size={14} className="mr-2" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab-specific Actions - Only show for employees tab */}
            {showEmployeeControls && (
              <div className="flex items-center space-x-1">
                {/* Filters */}
                <button
                  onClick={onToggleAdvancedFilter}
                  className={`flex items-center px-2.5 py-1.5 text-xs border rounded-lg transition-all ${
                    hasActiveFilters 
                      ? 'bg-almet-sapphire/10 border-almet-sapphire/30 text-almet-sapphire'
                      : `${borderColor} ${textSecondary} ${hoverBg}`
                  }`}
                >
                  <Filter size={12} className="mr-1.5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1.5 w-1.5 h-1.5 bg-almet-sapphire rounded-full"></span>
                  )}
                </button>

                {/* Sort */}
                <button
                  onClick={onToggleAdvancedSorting}
                  className={`flex items-center px-2.5 py-1.5 text-xs border rounded-lg transition-all ${
                    hasActiveSorting 
                      ? 'bg-almet-sapphire/10 border-almet-sapphire/30 text-almet-sapphire'
                      : `${borderColor} ${textSecondary} ${hoverBg}`
                  }`}
                >
                  <ArrowUpDown size={12} className="mr-1.5" />
                  Sort
                  {hasActiveSorting && (
                    <span className="ml-1.5 px-1 py-0.5 bg-almet-sapphire text-white text-xs rounded-full font-medium">
                      {currentSorting.length}
                    </span>
                  )}
                </button>

                {/* Actions Menu - âœ… Admin only */}
                {isAdmin && (
                  <button
                    onClick={onToggleActionMenu}
                    className={`flex items-center px-2.5 py-1.5 text-xs border rounded-lg transition-all ${
                      isActionMenuOpen ? 'bg-gray-50 dark:bg-gray-700' : ''
                    } ${borderColor} ${textSecondary} ${hoverBg}`}
                  >
                    <MoreVertical size={12} className="mr-1.5" />
                    Actions
                    {selectedEmployees.length > 0 && (
                      <span className="ml-1.5 px-1 py-0.5 bg-almet-sapphire text-white text-xs rounded-full font-medium">
                        {selectedEmployees.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters/Sorting Indicator - Only for employees tab */}
        {showEmployeeControls && (hasActiveFilters || hasActiveSorting) && (
          <div className={`px-5 py-2 border-t border-gray-200 dark:border-gray-700 ${bgSection}`}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                {hasActiveFilters && (
                  <span className="text-almet-sapphire font-medium">
                    Filters active
                  </span>
                )}
                {hasActiveSorting && (
                  <span className="text-almet-sapphire font-medium">
                    Sorted by {currentSorting.length} field{currentSorting.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (hasActiveFilters && onToggleAdvancedFilter) onToggleAdvancedFilter();
                  if (hasActiveSorting && onToggleAdvancedSorting) onToggleAdvancedSorting();
                }}
                className="text-almet-sapphire hover:text-almet-astral text-xs font-medium"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Export Progress Indicator - Only for employees tab */}
        {showEmployeeControls && isExporting && (
          <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
            <div className="flex items-center text-xs text-green-700 dark:text-green-300">
              <div className="animate-spin rounded-full h-3 w-3 border border-green-500 border-t-transparent mr-2"></div>
              Preparing export...
            </div>
          </div>
        )}
      </div>

      {/* Click outside handler for export dropdown - Only for employees tab */}
      {showEmployeeControls && isExportDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExportDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default HeadcountHeader;