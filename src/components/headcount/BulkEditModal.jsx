// src/components/headcount/BulkEditModal.jsx - With Common Components
import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Edit3, Users, User, Search, AlertCircle, RefreshCw, Building, Mail } from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import { useToast } from '../common/Toast';
import SearchableDropdown from '../common/SearchableDropdown';

const BulkEditModal = ({
  isOpen,
  onClose,
  onAction,
  selectedEmployees = [],
  selectedEmployeeData = [],
  darkMode = false
}) => {
  const [selectedLineManagerId, setSelectedLineManagerId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [isLoadingAllEmployees, setIsLoadingAllEmployees] = useState(false);
  const { showSuccess, showError } = useToast();

  // Employee data from hook  
  const {
    formattedEmployees = [],
    loading: employeesLoading = {},
    refreshAll
  } = useEmployees();

  // Clean theme classes
  const bgModal = darkMode ? "bg-gray-900" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgHover = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Fetch ALL employees without pagination
  const fetchAllEmployees = async () => {
    setIsLoadingAllEmployees(true);
    try {
      let employees = [];
      
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
        const baseURL = process.env.NEXT_PUBLIC_API_URL;
        
        const countResponse = await fetch(`${baseURL}/employees/?page_size=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!countResponse.ok) {
          throw new Error(`Count API call failed: ${countResponse.status}`);
        }
        
        const countData = await countResponse.json();
        const totalCount = countData.count || 0;
        
        const allResponse = await fetch(`${baseURL}/employees/?page_size=${Math.max(totalCount + 100, 10000)}&page=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!allResponse.ok) {
          throw new Error(`All employees API call failed: ${allResponse.status}`);
        }
        
        const allData = await allResponse.json();
        
        employees = (allData.results || [])
          .filter(emp => emp.is_active !== false)
          .map(emp => ({
            id: emp.id,
            value: emp.id,
            name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            employee_id: emp.employee_id,
            jobTitle: emp.job_title,
            departmentName: emp.department_name,
            businessFunction: emp.business_function_name,
            email: emp.email,
            isActive: true,
            isCurrentLineManager: emp.direct_reports_count > 0,
            directReportsCount: emp.direct_reports_count || 0,
            currentLineManagerId: emp.line_manager_id,
            currentLineManagerName: emp.line_manager_name
          }));
        
      } catch (apiError) {
        if (formattedEmployees && formattedEmployees.length > 0) {
          employees = formattedEmployees
            .filter(emp => emp.is_active !== false)
            .map(emp => ({
              id: emp.id,
              value: emp.id,
              name: emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
              employee_id: emp.employee_id,
              jobTitle: emp.jobTitle || emp.job_title,
              departmentName: emp.departmentInfo || emp.department_name,
              businessFunction: emp.business_function_name,
              email: emp.email,
              isActive: true,
              isCurrentLineManager: emp.managementInfo?.isLineManager || emp.direct_reports_count > 0,
              directReportsCount: emp.managementInfo?.directReportsCount || emp.direct_reports_count || 0,
              currentLineManagerId: emp.line_manager_id,
              currentLineManagerName: emp.line_manager_name
            }));
          
          setTimeout(() => {
            if (refreshAll && typeof refreshAll === 'function') {
              refreshAll();
            }
          }, 1000);
          
        } else {
          throw new Error('No employee data available');
        }
      }
      
      if (employees.length === 0) {
        throw new Error('No active employees found');
      }
      
      setAllEmployees(employees);
      
    } catch (error) {
      console.error('Failed to fetch all employees:', error);
      showError(`Failed to load employees: ${error.message}`);
      setAllEmployees([]);
    } finally {
      setIsLoadingAllEmployees(false);
    }
  };

  // Prepare manager options for SearchableDropdown
  const managerOptions = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) {
      return [];
    }

    const availableEmployees = allEmployees.filter(emp => 
      emp && 
      emp.id && 
      !selectedEmployees.includes(emp.id) && 
      emp.isActive
    );

    return availableEmployees
      .map(emp => ({
        value: emp.id.toString(),
        label: emp.name || 'Unknown Employee',
        employee_id: emp.employee_id || '',
        job_title: emp.jobTitle || '',
        department_name: emp.departmentName || '',
        business_function_name: emp.businessFunction || '',
        email: emp.email || '',
        direct_reports_count: emp.directReportsCount || 0,
        is_current_manager: emp.isCurrentLineManager || false
      }))
      .filter(emp => emp.label !== 'Unknown Employee')
      .sort((a, b) => {
        // Sort: Current managers first, then by name
        if (a.is_current_manager && !b.is_current_manager) return -1;
        if (!a.is_current_manager && b.is_current_manager) return 1;
        return a.label.localeCompare(b.label);
      });
  }, [allEmployees, selectedEmployees]);

  // Selected manager object
  const selectedManager = useMemo(() => {
    return managerOptions.find(manager => manager.value === selectedLineManagerId);
  }, [managerOptions, selectedLineManagerId]);

  // Analyze current line manager situation
  const currentLineManagerAnalysis = useMemo(() => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) {
      return { hasLineManager: 0, uniqueLineManagers: [] };
    }

    const employeesWithLineManager = selectedEmployeeData.filter(emp => emp.line_manager_id);
    const uniqueLineManagerIds = [...new Set(selectedEmployeeData
      .filter(emp => emp.line_manager_id)
      .map(emp => emp.line_manager_id))];

    const uniqueLineManagers = uniqueLineManagerIds.map(id => {
      const managerFromList = allEmployees.find(m => m.id === id);
      if (managerFromList) {
        return {
          id: managerFromList.id,
          name: managerFromList.name,
          employee_id: managerFromList.employee_id
        };
      }
      
      const employeeWithThisManager = selectedEmployeeData.find(emp => emp.line_manager_id === id);
      return {
        id,
        name: employeeWithThisManager?.line_manager_name || `Manager ${id}`,
        employee_id: null
      };
    }).filter(Boolean);

    return {
      hasLineManager: employeesWithLineManager.length,
      total: selectedEmployeeData.length,
      uniqueLineManagers,
      employeesWithoutLineManager: selectedEmployeeData.filter(emp => !emp.line_manager_id)
    };
  }, [selectedEmployeeData, allEmployees]);

  // Initialize modal
  useEffect(() => {
    if (isOpen) {
      setSelectedLineManagerId('');
      
      fetchAllEmployees();
      
      if (refreshAll && typeof refreshAll === 'function') {
        refreshAll();
      }
    }
  }, [isOpen, refreshAll]);

  const handleAssignLineManager = async () => {
    if (!selectedLineManagerId) {
      showError('Please select a line manager');
      return;
    }

    if (selectedEmployees.length === 0) {
      showError('No employees selected');
      return;
    }

 

    setIsProcessing(true);
    
    try {
      await onAction('bulkAssignLineManager', {
        employee_ids: selectedEmployees,
        line_manager_id: parseInt(selectedLineManagerId)
      });
      
      showSuccess('Line manager assignment completed successfully');
      onClose();
    } catch (error) {
      showError(`Line manager assignment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshData = () => {
    fetchAllEmployees();
    
    if (refreshAll && typeof refreshAll === 'function') {
      refreshAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative ${bgModal} rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden border ${borderColor}`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-almet-sapphire rounded-md flex items-center justify-center mr-2">
              <Edit3 className="w-3 h-3 text-white" />
            </div>
            <div>
              <h2 className={`text-sm font-medium ${textPrimary}`}>
                Assign Line Manager
              </h2>
              <p className={`text-xs ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefreshData}
              disabled={isProcessing || isLoadingAllEmployees}
              className={`p-1.5 rounded-md ${bgHover} transition-colors disabled:opacity-50`}
              title="Refresh employee data"
            >
              <RefreshCw 
                className={`w-3.5 h-3.5 ${textSecondary} ${isLoadingAllEmployees ? 'animate-spin' : ''}`} 
              />
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`p-1.5 rounded-md ${bgHover} transition-colors disabled:opacity-50`}
            >
              <X className={`w-3.5 h-3.5 ${textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingAllEmployees && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900">
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-xs text-almet-sapphire font-medium">
                Loading all employees...
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Selected Employees Display */}
            {selectedEmployeeData.length > 0 && (
              <div>
                <label className={`block text-xs font-medium ${textPrimary} mb-2`}>
                  Selected Employees ({selectedEmployeeData.length})
                </label>
                <div className="max-h-24 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-md p-2 space-y-1">
                  {selectedEmployeeData.slice(0, 5).map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-almet-sapphire/20 rounded-md flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-almet-sapphire">
                            {(emp.first_name || emp.fullName || '').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className={`font-medium ${textPrimary}`}>
                            {emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()}
                          </div>
                          <div className={`text-xs ${textMuted}`}>
                            {emp.employee_id} • {emp.jobTitle || emp.job_title}
                          </div>
                          {emp.line_manager_name && (
                            <div className={`text-xs ${textMuted}`}>
                              Current: {emp.line_manager_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs">
                        {emp.line_manager_name ? (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
                            Has Manager
                          </span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full">
                            No Manager
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedEmployeeData.length > 5 && (
                    <div className={`text-xs ${textMuted} text-center py-1`}>
                      ... and {selectedEmployeeData.length - 5} more employees
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Line Manager Selection using SearchableDropdown */}
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-2`}>
                Select New Line Manager
              </label>
              
              {isLoadingAllEmployees ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-4 h-4 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className={`text-sm ${textMuted}`}>Loading employees...</span>
                </div>
              ) : managerOptions.length === 0 ? (
                <div className={`p-4 border ${borderColor} rounded-md text-center bg-gray-50 dark:bg-gray-800/30`}>
                  <Users className={`w-5 h-5 mx-auto mb-2 ${textMuted}`} />
                  <p className={`text-sm ${textMuted} mb-1`}>No available employees</p>
                  <p className={`text-xs ${textMuted}`}>
                    {allEmployees.length > 0 
                      ? `All ${allEmployees.length} active employees are either selected or unavailable.`
                      : 'No active employees found in the system.'
                    }
                  </p>
                  <button
                    onClick={handleRefreshData}
                    className="mt-2 px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-md hover:bg-almet-astral transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              ) : (
                <SearchableDropdown
                  options={managerOptions}
                  value={selectedLineManagerId}
                  onChange={(value) => setSelectedLineManagerId(value)}
                  placeholder="Search and select a line manager..."
                  searchPlaceholder="Search by name, ID, job title..."
                  darkMode={darkMode}
                  className="w-full"
                  disabled={isProcessing}
                  portal={true}
                   allowUncheck={true}
                  zIndex="z-[60]"
                />
              )}
            </div>

            {/* Selected Manager Preview */}
            {selectedManager && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <h4 className={`font-medium text-sm ${textPrimary} mb-1`}>Assignment Preview</h4>
                <div className="flex items-center">
                  <User className={`w-4 h-4 mr-2 ${textSecondary}`} />
                  <div>
                    <p className={`text-sm ${textSecondary}`}>
                      <strong>{selectedManager.label}</strong> ({selectedManager.employee_id}) 
                      will be assigned as line manager for <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''}.
                    </p>
                    <div className={`text-xs ${textMuted} mt-1 flex flex-wrap gap-2`}>
                      <span>{selectedManager.job_title}</span>
                      {selectedManager.department_name && (
                        <span>• {selectedManager.department_name}</span>
                      )}
                      {selectedManager.is_current_manager && (
                        <span className="text-emerald-600">• Currently manages {selectedManager.direct_reports_count} employee{selectedManager.direct_reports_count !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
                {currentLineManagerAnalysis.hasLineManager > 0 && (
                  <p className={`text-xs ${textMuted} mt-2 flex items-center`}>
                    <span className="text-amber-500 mr-1">⚠</span>
                    {currentLineManagerAnalysis.hasLineManager} employee{currentLineManagerAnalysis.hasLineManager !== 1 ? 's' : ''} will have their current manager replaced.
                  </p>
                )}
              </div>
            )}

         
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t ${borderColor} bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between`}>
          <div className="flex items-center">
            {selectedEmployees.length > 0 && (
              <span className={`text-xs ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} will be updated
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`px-3 py-1.5 text-xs font-medium border ${borderColor} rounded-md ${textSecondary} ${bgHover} transition-colors disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleAssignLineManager}
              disabled={isProcessing || !selectedLineManagerId || selectedEmployees.length === 0 || isLoadingAllEmployees}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || !selectedLineManagerId || selectedEmployees.length === 0 || isLoadingAllEmployees
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-almet-sapphire hover:bg-almet-astral text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Assigning...
                </div>
              ) : (
                `Assign Manager (${selectedEmployees.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;