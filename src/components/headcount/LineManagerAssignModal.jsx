// src/components/headcount/LineManagerAssignModal.jsx - Clean Design with Common Components
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, User, CheckCircle, AlertCircle, Building, Mail, Users, RefreshCw } from "lucide-react";
import SearchableDropdown from "../common/SearchableDropdown";
import { useToast } from '../common/Toast';

const LineManagerModal = ({
  isOpen,
  onClose,
  employee,
  onAssign,
  loading = false,
  darkMode = false,
  onFetchAllEmployees,
  allEmployeesData = null
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const { showSuccess, showError } = useToast();

  // Clean theme classes
  const bgModal = darkMode ? "bg-gray-900" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgHover = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Initialize modal
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedManagerId(employee?.line_manager_id || "");
      setShowConfirmation(false);
      setFetchError(null);
      
      if (!allEmployeesData && onFetchAllEmployees) {
        handleFetchEmployees();
      }
    }
  }, [isOpen, employee?.line_manager_id]);

  // Employee fetching
  const handleFetchEmployees = async (forceRefresh = false) => {
    if (!onFetchAllEmployees) {
      setFetchError('No employee fetch function provided');
      return;
    }

    try {
      setFetchLoading(true);
      setFetchError(null);
      
      const options = forceRefresh ? { skipCache: true } : {};
      await onFetchAllEmployees(options);
      
    } catch (error) {
      setFetchError(error.message || 'Failed to load employees');
    } finally {
      setFetchLoading(false);
    }
  };

  // Process employee data for SearchableDropdown
  const managerOptions = useMemo(() => {
    if (!allEmployeesData) {
      return [];
    }
    
    let employees = [];
    
    try {
      if (Array.isArray(allEmployeesData)) {
        employees = allEmployeesData;
      } else if (allEmployeesData.results && Array.isArray(allEmployeesData.results)) {
        employees = allEmployeesData.results;
      } else if (allEmployeesData.data) {
        if (Array.isArray(allEmployeesData.data)) {
          employees = allEmployeesData.data;
        } else if (allEmployeesData.data.results && Array.isArray(allEmployeesData.data.results)) {
          employees = allEmployeesData.data.results;
        }
      }
      
      const validEmployees = employees
        .filter(emp => {
          return emp && 
                 emp.id && 
                 (emp.name || emp.employee_name || emp.first_name || emp.last_name) &&
                 emp.id !== employee?.id;
        })
        .map(emp => ({
          value: emp.id.toString(),
          label: emp.name || 
                 emp.employee_name || 
                 `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 
                 `Employee ${emp.id}`,
          employee_id: emp.employee_id || emp.id,
          job_title: emp.job_title || '',
          department_name: emp.department_name || '',
          business_function_name: emp.business_function_name || '',
          email: emp.email || '',
          direct_reports_count: emp.direct_reports_count || 0,
          is_current_manager: (emp.direct_reports_count || 0) > 0
        }))
        .sort((a, b) => {
          // Sort: Current managers first, then by name
          if (a.is_current_manager && !b.is_current_manager) return -1;
          if (!a.is_current_manager && b.is_current_manager) return 1;
          return a.label.localeCompare(b.label);
        });
      
      return validEmployees;
      
    } catch (error) {
      console.error('Error processing employee data:', error);
      return [];
    }
  }, [allEmployeesData, employee?.id]);

  // Get selected manager info
  const selectedManager = useMemo(() => {
    if (!selectedManagerId) return null;
    return managerOptions.find(manager => manager.value === selectedManagerId) || null;
  }, [managerOptions, selectedManagerId]);
  
  // Check if there are changes
  const hasChanges = selectedManagerId !== (employee?.line_manager_id?.toString() || "");

  // Get employee name safely
  const getEmployeeName = (emp) => {
    if (!emp) return 'Unknown Employee';
    
    return emp.name || 
           emp.employee_name || 
           `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 
           `Employee ${emp.id}`;
  };

  // Handle manager selection
  const handleManagerSelect = (managerId) => {
    setSelectedManagerId(managerId);
  };

  // Handle assign
  const handleAssign = () => {
    if (!selectedManagerId) {
      showError("Please select a line manager first.");
      return;
    }
    
    if (selectedManagerId === employee?.line_manager_id?.toString()) {
      showError("This manager is already assigned to this employee.");
      return;
    }
    
    setShowConfirmation(true);
  };

  // Confirm assignment
  const confirmAssignment = () => {
    if (selectedManagerId) {
      onAssign(parseInt(selectedManagerId));
      setShowConfirmation(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (hasChanges && !loading && !fetchLoading) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${bgModal} rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border ${borderColor}`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-almet-sapphire rounded-md flex items-center justify-center mr-2">
              <User className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className={`text-sm font-medium ${textPrimary}`}>Assign Line Manager</h3>
              <p className={`text-xs ${textMuted}`}>
                {getEmployeeName(employee)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-1.5 rounded-md ${bgHover} transition-colors`}
            disabled={loading || fetchLoading}
          >
            <X className={`w-3.5 h-3.5 ${textSecondary}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Current Manager Info */}
            {employee?.line_manager_name && (
              <div className="p-2 rounded-md border flex justify-between border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-center">
                  <User className="w-3.5 h-3.5 text-almet-sapphire mr-2" />
                  <span className="text-xs font-medium text-almet-sapphire">
                    Current Line Manager:
                  </span>
                </div>
                <p className="text-almet-sapphire mt-1 font-medium text-sm">
                  {employee.line_manager_name}
                </p>
              </div>
            )}

           

            {/* Manager Selection using SearchableDropdown */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${textPrimary}`}>
                Select New Line Manager
              </label>
              
              {fetchLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-4 h-4 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className={`text-sm ${textMuted}`}>Loading employees...</span>
                </div>
              ) : fetchError ? (
                <div className={`p-4 border ${borderColor} rounded-md text-center bg-gray-50 dark:bg-gray-800/30`}>
                  <AlertCircle className={`w-5 h-5 mx-auto mb-2 ${textMuted}`} />
                  <p className={`text-sm ${textMuted} mb-2`}>Failed to load employees</p>
                  <button
                    onClick={() => handleFetchEmployees(true)}
                    className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-md hover:bg-almet-astral transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : managerOptions.length === 0 ? (
                <div className={`p-4 border ${borderColor} rounded-md text-center bg-gray-50 dark:bg-gray-800/30`}>
                  <Users className={`w-5 h-5 mx-auto mb-2 ${textMuted}`} />
                  <p className={`text-sm ${textMuted} mb-1`}>No employees available</p>
                  <p className={`text-xs ${textMuted}`}>
                    No active employees found for assignment.
                  </p>
                  <button
                    onClick={() => handleFetchEmployees(true)}
                    className="mt-2 px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-md hover:bg-almet-astral transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              ) : (
                <SearchableDropdown
                  options={managerOptions}
                  value={selectedManagerId}
                  onChange={handleManagerSelect}
                  placeholder={managerOptions.length > 0 ? "Choose a manager..." : "Loading..."}
                  searchPlaceholder="Search by name, ID, job title..."
                  darkMode={darkMode}
                  className="w-full"
                  portal={true}
                   allowUncheck={true}
                  zIndex="z-[60]"
                />
              )}
            </div>

            {/* Selected Manager Preview */}
           {selectedManager && (
  <div className="p-3 rounded-md border border-emerald-100 bg-emerald-25 dark:border-emerald-800/50 dark:bg-emerald-950/10">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mr-2" />
        <span className="font-medium text-xs text-emerald-500">
          Selected Manager
        </span>
      </div>
      <button
        onClick={() => setSelectedManagerId("")}
        className="text-xs text-rose-400 hover:text-rose-500 underline font-normal"
        disabled={loading}
      >
        Clear
      </button>
    </div>
    <div className="mt-2 flex items-center">
      <div className="w-7 h-7 bg-emerald-400 rounded-md flex items-center justify-center mr-3">
        <span className="text-white font-medium text-xs">
          {selectedManager.label.charAt(0)}
        </span>
      </div>
      <div>
        <p className="font-medium text-xs text-emerald-500">
          {selectedManager.label}
        </p>
      
        <div className="flex items-center mt-1 text-xs text-slate-400">
          <Building className="w-3 h-3 mr-1" />
          <span className="mr-3">{selectedManager.department_name || 'No Department'}</span>
          <Mail className="w-3 h-3 mr-1" />
          <span>{selectedManager.email || 'No Email'}</span>
        </div>
        {selectedManager.is_current_manager && (
          <div className="flex items-center mt-1 text-xs text-emerald-400">
            <Users className="w-3 h-3 mr-1" />
            <span>Managing {selectedManager.direct_reports_count} employee{selectedManager.direct_reports_count !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  </div>
)}

            {/* Statistics */}
            {managerOptions.length > 0 && (
              <div className={`text-xs ${textMuted} text-center p-2 bg-gray-50 dark:bg-gray-800/30 rounded-md`}>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="font-medium">Available</div>
                    <div className="text-almet-sapphire font-semibold">{managerOptions.length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Current Managers</div>
                    <div className="text-emerald-600 font-semibold">{managerOptions.filter(m => m.is_current_manager).length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Selected</div>
                    <div className="text-purple-600 font-semibold">{selectedManagerId ? 1 : 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t ${borderColor} bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between`}>
          <div className={`text-xs ${textMuted}`}>
            {hasChanges && selectedManager && "Assignment will be applied immediately"}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleClose}
              className={`px-3 py-1.5 text-xs font-medium border ${borderColor} rounded-md ${textSecondary} ${bgHover} transition-colors`}
              disabled={loading || fetchLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!hasChanges || loading || fetchLoading || !selectedManagerId || fetchError}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center ${
                !hasChanges || loading || fetchLoading || !selectedManagerId || fetchError
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-almet-sapphire hover:bg-almet-astral text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Assign Manager
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && selectedManager && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className={`${bgModal} rounded-xl shadow-xl max-w-md w-full border ${borderColor}`}>
            <div className="p-4">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                <h3 className={`text-sm font-medium ${textPrimary}`}>Confirm Assignment</h3>
              </div>
              <p className={`${textSecondary} mb-4 text-sm`}>
                Are you sure you want to assign <strong>{selectedManager.label}</strong> as the line manager for <strong>{getEmployeeName(employee)}</strong>?
              </p>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className={`px-3 py-1.5 text-xs border ${borderColor} rounded-md ${textSecondary} ${bgHover} transition-colors`}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssignment}
                  className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-md hover:bg-almet-astral disabled:opacity-50 font-medium transition-colors"
                  disabled={loading}
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineManagerModal;