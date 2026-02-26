// src/components/headcount/ActionsDropdown.jsx - UPDATED: Multiple Assignment Support
"use client";
import { useState, useRef, useEffect } from "react";
import { 
  MoreVertical, Edit, Users, FileText, BarChart2, Trash2, UserPlus, 
  TagIcon, Archive, X, Download, CheckCircle, Clock, Building, 
  Briefcase, Target, Award, Shield, UserCheck, UserX as UserVacant, Crown,
  AlertCircle, Calendar, Zap
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useToast } from "../common/Toast";
import { getThemeStyles } from "./utils/themeStyles";
import { archiveEmployeesService } from "../../services/vacantPositionsService";
import jobDescriptionService from "../../services/jobDescriptionService";
import Link from "next/link";
import { createPortal } from "react-dom";

// Import components
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * ✅ UPDATED: Enhanced Actions Dropdown with Multiple Assignment Support
 * Now supports viewing multiple job description assignments for single employee
 */
const ActionsDropdown = ({ 
  employeeId, 
  employee = null,
  onAction,
  disabled = false,
  showVisibilityToggle = true,
  onRefresh = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  // ✅ NEW: Multiple Assignments Modal State
  const [showJobDescriptionsModal, setShowJobDescriptionsModal] = useState(false);
  const [jobAssignments, setJobAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null,
    action: null,
    data: null
  });
  
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const styles = getThemeStyles(darkMode);

  // Theme classes
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-san-juan/30" : "bg-almet-mystic/50";

  // Calculate dropdown position
  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const dropdownWidth = 224;
    const dropdownHeight = 400;
    
    let top = buttonRect.bottom + 4;
    let left = buttonRect.right - dropdownWidth;
    
    if (top + dropdownHeight > viewportHeight) {
      top = buttonRect.top - dropdownHeight - 4;
    }
    
    if (left < 8) {
      left = 8;
    }
    
    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8;
    }

    setDropdownPosition({ top, left });
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      calculatePosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Safe employee name extraction
  const getEmployeeName = () => {
    if (!employee) return `Employee ${employeeId}`;
    
    return employee.name || 
           employee.employee_name || 
           `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
           `Employee ${employeeId}`;
  };

  // Get current line manager info
  const getCurrentManager = () => {
    if (!employee) return null;
    
    return {
      name: employee.line_manager_name,
      id: employee.line_manager_id || employee.line_manager_hc_number
    };
  };

  // Get current tags
  const getCurrentTags = () => {
    if (!employee) return [];
    
    const tags = [];
    
    if (employee.tag_names && Array.isArray(employee.tag_names)) {
      employee.tag_names.forEach((tagItem, idx) => {
        if (typeof tagItem === 'string' && tagItem.trim()) {
          tags.push({ id: `tag_${idx}`, name: tagItem.trim() });
        } else if (typeof tagItem === 'object' && tagItem && tagItem.name) {
          tags.push({ id: tagItem.id || `tag_obj_${idx}`, name: tagItem.name });
        }
      });
    }
    
    if (employee.tags && Array.isArray(employee.tags)) {
      employee.tags.forEach((tag, idx) => {
        if (typeof tag === 'object' && tag && tag.name) {
          if (!tags.find(t => t.id === tag.id || t.name === tag.name)) {
            tags.push({ id: tag.id || `tag_full_${idx}`, name: tag.name });
          }
        }
      });
    }
    
    return tags;
  };



const fetchJobAssignments = async () => {
  try {
    setAssignmentsLoading(true);
    setIsOpen(false);
    
    // ✅ Use endpoint that returns assignments with basic info
    const response = await jobDescriptionService.getEmployeeJobDescriptions(employeeId);
    const assignments = response.job_descriptions || response;
    
    if (!assignments || assignments.length === 0) {
      showWarning('No job descriptions found for this employee');
      return;
    }

    setJobAssignments(assignments);
    setShowJobDescriptionsModal(true);
    
    // If only one assignment, fetch its full details
    if (assignments.length === 1) {
      await viewAssignmentDetail(assignments[0]);
    }
    
  } catch (error) {
    console.error('Error fetching job assignments:', error);
    showError('Error loading job descriptions. Please try again.');
  } finally {
    setAssignmentsLoading(false);
  }
};

// ✅ UPDATED: Fetch full job description detail using the job_description_id
const viewAssignmentDetail = async (assignment) => {
  try {
    setAssignmentsLoading(true);
    
    // ✅ Fetch full job description details using the job_description_id
    const jobDescriptionId = assignment.job_description_id || assignment.job_description;
    const jobDetail = await jobDescriptionService.getJobDescription(jobDescriptionId);
    
    // ✅ Combine assignment info with full job description
    const enrichedAssignment = {
      ...assignment,
      job_description: jobDetail
    };
    
    setSelectedAssignment(enrichedAssignment);
    
  } catch (error) {
    console.error('Error fetching assignment detail:', error);
    showError('Error loading assignment details');
  } finally {
    setAssignmentsLoading(false);
  }
};

  const getStatusDisplay = (assignment) => {
    if (!assignment) return null;
    
    const statusInfo = assignment.status_display || {};
    let statusColor = '';
    let statusBg = '';
    
    switch (assignment.status) {
      case 'DRAFT':
        statusColor = 'text-almet-waterloo dark:text-almet-santas-gray';
        statusBg = 'bg-gray-100 dark:bg-almet-comet/30';
        break;
      case 'PENDING_LINE_MANAGER':
        statusColor = 'text-orange-600 dark:text-orange-400';
        statusBg = 'bg-orange-100 dark:bg-orange-900/20';
        break;
      case 'PENDING_EMPLOYEE':
        statusColor = 'text-blue-600 dark:text-blue-400';
        statusBg = 'bg-blue-100 dark:bg-blue-900/20';
        break;
      case 'APPROVED':
        statusColor = 'text-green-600 dark:text-green-400';
        statusBg = 'bg-green-100 dark:bg-green-900/20';
        break;
      case 'REJECTED':
        statusColor = 'text-red-600 dark:text-red-400';
        statusBg = 'bg-red-100 dark:bg-red-900/20';
        break;
      case 'REVISION_REQUIRED':
        statusColor = 'text-purple-600 dark:text-purple-400';
        statusBg = 'bg-purple-100 dark:bg-purple-900/20';
        break;
      default:
        statusColor = 'text-almet-waterloo dark:text-almet-santas-gray';
        statusBg = 'bg-gray-100 dark:bg-almet-comet/30';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusColor} ${statusBg}`}>
        {statusInfo.status || assignment.status}
      </span>
    );
  };

  // ✅ Check if job has leadership competencies
  const hasLeadershipCompetencies = (jobDescription) => {
    return jobDescription.leadership_competencies && 
           Array.isArray(jobDescription.leadership_competencies) && 
           jobDescription.leadership_competencies.length > 0;
  };

  // ✅ Get urgency badge for assignment
  const getUrgencyBadge = (assignment) => {
    const daysOld = assignment.days_pending || 0;
    
    if (daysOld > 14) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle size={10} />
          Critical
        </span>
      );
    } else if (daysOld > 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          <Clock size={10} />
          High
        </span>
      );
    }
    return null;
  };

  // ========================================
  // CONFIRMATION MODAL HELPERS
  // ========================================

  const openConfirmation = (config) => {
    setConfirmationModal({
      isOpen: true,
      ...config
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  const executeConfirmedAction = async () => {
    const { action, data } = confirmationModal;
    closeConfirmation();
    
    if (action && typeof action === 'function') {
      await action(data);
    }
  };

  // ========================================
  // DELETE ACTION HANDLERS
  // ========================================

  const handleSoftDelete = async () => {
    const employeeName = getEmployeeName();
    
    openConfirmation({
      type: 'danger',
      title: 'Soft Delete Employee',
      message: `Are you sure you want to soft delete ${employeeName}? This will create a vacant position.`,
      confirmText: 'Soft Delete',
      action: async () => {
        try {
          setIsProcessing(true);
          
          const result = await archiveEmployeesService.bulkSoftDeleteEmployees([employeeId]);
          
          showSuccess(result.message || `${employeeName} soft deleted successfully`);
          
          if (onRefresh) {
            await onRefresh();
          } else if (onAction) {
            onAction(employeeId, 'refresh');
          }
          
          if (result.data?.vacant_positions_created > 0) {
            setTimeout(() => {
              showInfo('Vacant position created automatically.');
            }, 1000);
          }
          
        } catch (error) {
          console.error('Soft delete failed:', error);
          showError(`Failed to soft delete ${employeeName}: ${error.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleHardDelete = async () => {
    const employeeName = getEmployeeName();
    
    openConfirmation({
      type: 'danger',
      title: 'Permanent Deletion Warning',
      message: `⚠️ WARNING: This will permanently delete ${employeeName}. This action cannot be undone.`,
      confirmText: 'Continue',
      action: async () => {
        try {
          setIsProcessing(true);
          
          const notes = 'End of contract period - bulk cleanup';
          
          const result = await archiveEmployeesService.bulkHardDeleteEmployees([employeeId], notes, true);
          
          showSuccess(result.message || `${employeeName} permanently deleted successfully`);
          
          if (onRefresh) {
            await onRefresh();
          } else if (onAction) {
            onAction(employeeId, 'refresh');
          }
          
          if (result.data?.archives_created > 0) {
            setTimeout(() => {
              showInfo('Archive record created for audit purposes.');
            }, 1000);
          }
          
        } catch (error) {
          console.error('Hard delete failed:', error);
          showError(`Failed to delete ${employeeName}: ${error.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // ========================================
  // ACTION HANDLER
  // ========================================

  const handleAction = (action) => {
    setIsOpen(false);
    
    if (action === "viewJobDescriptions") {
      fetchJobAssignments();
      return;
    }
    
    if (action === "softDelete") {
      handleSoftDelete();
      return;
    }
    
    if (action === "hardDelete") {
      handleHardDelete();
      return;
    }
    
    if (onAction) {
      onAction(employeeId, action);
    }
  };

  const currentManager = getCurrentManager();
  const currentTags = getCurrentTags();
  const employeeName = getEmployeeName();

  // ========================================
  // DROPDOWN MENU COMPONENT
  // ========================================

  const DropdownMenu = () => (
    <div
      ref={dropdownRef}
      className={`fixed w-56 rounded-md shadow-lg ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border ring-1 ring-black ring-opacity-5 overflow-hidden`}
      style={{ 
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        zIndex: 99999
      }}
    >
      <div className="py-1" role="menu">
        {/* View Details */}
        <Link href={`/structure/employee/${employeeId}`}>
          <button
            className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <FileText size={14} className="mr-2 text-blue-500" />
              <span>View Details</span>
            </div>
          </button>
        </Link>

        {/* Edit Employee */}
        <Link href={`/structure/employee/${employeeId}/edit`}>
          <button
            className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <Edit size={14} className="mr-2 text-green-500" />
              <span>Edit Employee</span>
            </div>
          </button>
        </Link>

        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* Change Line Manager */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("changeManager")}
          title={currentManager?.name ? `Current: ${currentManager.name}` : 'No manager assigned'}
        >
          <div className="flex items-center">
            <UserPlus size={14} className="mr-2 text-indigo-500" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span>Change Line Manager</span>
              {currentManager?.name ? (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-full">
                  Current: {currentManager.name}
                </span>
              ) : (
                <span className="text-[10px] text-orange-500 dark:text-orange-400">
                  No manager assigned
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Tag Management */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("manageTag")}
          title={currentTags.length > 0 ? `${currentTags.length} tags assigned` : 'No tags assigned'}
        >
          <div className="flex items-center">
            <TagIcon size={14} className="mr-2 text-purple-500" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span>Manage Tags</span>
              {currentTags.length > 0 ? (
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{currentTags.length} tag{currentTags.length !== 1 ? 's' : ''}</span>
                  <span className="ml-1">
                    ({currentTags.slice(0, 2).map(tag => tag.name).join(', ')}
                    {currentTags.length > 2 && `, +${currentTags.length - 2}`})
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-orange-500 dark:text-orange-400">
                  No tags assigned
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* ✅ UPDATED: Job Descriptions - Opens assignments modal */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("viewJobDescriptions")}
          disabled={assignmentsLoading}
        >
          <div className="flex items-center">
            <FileText size={14} className="mr-2 text-amber-500" />
            <div className="flex flex-col items-start">
              <span>Job Descriptions</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {assignmentsLoading ? 'Loading...' : 'View all assignments'}
              </span>
            </div>
          </div>
        </button>

        {/* Competency Matrix */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("competencyMatrix")}
        >
          <div className="flex items-center">
            <BarChart2 size={14} className="mr-2 text-teal-500" />
            <div className="flex flex-col items-start">
              <span>Competency Matrix</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Skills assessment
              </span>
            </div>
          </div>
        </button>

        {/* Performance Management */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("performanceManagement")}
        >
          <div className="flex items-center">
            <BarChart2 size={14} className="mr-2 text-blue-500" />
            <div className="flex flex-col items-start">
              <span>Performance Management</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Reviews & goals
              </span>
            </div>
          </div>
        </button>

   

        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* Soft Delete */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("softDelete")}
        >
          <div className="flex items-center">
            <Archive size={14} className="mr-2 text-orange-500" />
            <div className="flex flex-col items-start">
              <span className="text-orange-600 dark:text-orange-400">Soft Delete</span>
              <span className="text-[10px] text-orange-400 dark:text-orange-500">
                Creates vacant position
              </span>
            </div>
          </div>
        </button>

        {/* Hard Delete */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("hardDelete")}
        >
          <div className="flex items-center">
            <Trash2 size={14} className="mr-2 text-red-500" />
            <div className="flex flex-col items-start">
              <span className="text-red-500 dark:text-red-400">Permanent Delete</span>
              <span className="text-[10px] text-red-400 dark:text-red-500">
                Cannot be undone
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // ========================================
  // ✅ NEW: JOB ASSIGNMENTS MODAL COMPONENT
  // ========================================

  const JobAssignmentsModal = () => {
    if (!showJobDescriptionsModal) return null;

    // If no assignment selected, show list
    if (!selectedAssignment) {
      return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
          <div className={`${bgCard} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-almet-comet">
                <div>
                  <h2 className={`text-xl font-bold ${textPrimary} mb-1`}>Job Description Assignments</h2>
                  <p className={`text-xs ${textMuted}`}>
                    {employeeName} • {jobAssignments.length} assignment{jobAssignments.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowJobDescriptionsModal(false);
                    setJobAssignments([]);
                    setSelectedAssignment(null);
                  }}
                  className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-almet-comet/30`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Assignments List */}
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire"></div>
                </div>
              ) : jobAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className={`mx-auto mb-3 ${textMuted}`} />
                  <p className={`${textPrimary} font-semibold mb-1`}>No Job Descriptions</p>
                  <p className={`text-xs ${textMuted}`}>This employee has no job description assignments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobAssignments.map((assignment, index) => {
                    const jd = assignment.job_description || {};
                    const hasLeadership = hasLeadershipCompetencies(jd);
                    
                    return (
                      <div
                        key={assignment.id}
                        className={`p-4 rounded-xl border ${borderColor} ${bgAccent} hover:shadow-md transition-all cursor-pointer`}
                        onClick={() => viewAssignmentDetail(assignment.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className={`text-base font-bold ${textPrimary} mb-1`}>
                              {jd.job_title || assignment.job_description_title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs ${textMuted}`}>
                                {jd.business_function?.name || jd.business_function_name}
                              </span>
                              <span className={`text-xs ${textMuted}`}>•</span>
                              <span className={`text-xs ${textMuted}`}>
                                {jd.department?.name || jd.department_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusDisplay(assignment)}
                            {hasLeadership && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                <Crown size={10} />
                                Leadership
                              </span>
                            )}
                            {getUrgencyBadge(assignment)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className={`font-semibold ${textMuted}`}>Reports To:</span>
                            <p className={`${textSecondary} mt-0.5`}>
                              {assignment.reports_to_name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className={`font-semibold ${textMuted}`}>Created:</span>
                            <p className={`${textSecondary} mt-0.5 flex items-center gap-1`}>
                              <Calendar size={12} />
                              {new Date(assignment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-almet-comet">
                          <button className="text-xs text-almet-sapphire hover:text-almet-astral font-semibold flex items-center gap-1">
                            View Details
                            <Zap size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      );
    }

    // If assignment selected, show detail view
    const jd = selectedAssignment.job_description || {};
    const hasLeadership = hasLeadershipCompetencies(jd);
    const hasBehavioral = jd.behavioral_competencies && jd.behavioral_competencies.length > 0;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
        <div className={`${bgCard} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
          <div className="p-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-almet-comet">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className={`p-1 ${textMuted} hover:${textPrimary} transition-colors rounded-lg`}
                  >
                    ← Back to List
                  </button>
                </div>
                <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>{jd.job_title}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusDisplay(selectedAssignment)}
                  {hasLeadership && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      <Crown size={10} />
                      Leadership Position
                    </span>
                  )}
                  {getUrgencyBadge(selectedAssignment)}
                  <span className={`text-xs ${textMuted}`}>
                    Created {new Date(selectedAssignment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    jobDescriptionService.downloadJobDescriptionPDF(jd.id);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-colors text-xs font-semibold"
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowJobDescriptionsModal(false);
                    setJobAssignments([]);
                    setSelectedAssignment(null);
                  }}
                  className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-almet-comet/30`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Job Detail Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Basic Information */}
                <div className={`p-4 ${bgAccent} rounded-xl`}>
                  <h3 className={`text-base font-bold ${textPrimary} mb-3`}>Position Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Company:</span>
                      <p className={`${textPrimary} mt-1`}>{jd.business_function?.name}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Department:</span>
                      <p className={`${textPrimary} mt-1`}>{jd.department?.name}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Unit:</span>
                      <p className={`${textPrimary} mt-1`}>{jd.unit?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Job Function:</span>
                      <p className={`${textPrimary} mt-1`}>{jd.job_function?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Hierarchy:</span>
                      <p className={`${textPrimary} mt-1`}>
                        {jd.position_group?.display_name || jd.position_group?.name}
                      </p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Grading Levels:</span>
                      <p className={`${textPrimary} mt-1`}>
                        {jd.grading_levels?.join(', ') || jd.grading_level || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Reports To:</span>
                      <p className={`${textPrimary} mt-1`}>{selectedAssignment.reports_to?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Assignment Type:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedAssignment.is_vacancy ? (
                          <>
                            <UserVacant size={14} className="text-orange-500" />
                            <span className={`${textPrimary} text-orange-600 dark:text-orange-400 font-semibold`}>
                              Vacant
                            </span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} className="text-green-500" />
                            <span className={`${textPrimary} text-green-600 dark:text-green-400 font-semibold`}>
                              Assigned
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Purpose */}
                <div>
                  <h4 className={`text-base font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
                    <Target size={16} className="text-almet-sapphire" />
                    Job Purpose
                  </h4>
                  <div className={`p-4 ${bgAccent} rounded-xl`}>
                    <p className={`${textSecondary} leading-relaxed text-xs`}>{jd.job_purpose}</p>
                  </div>
                </div>

                {/* Job Sections */}
                {jd.sections && jd.sections.length > 0 && (
                  <div className="space-y-5">
                    {jd.sections.map((section, index) => (
                      <div key={index}>
                        <h4 className={`text-base font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
                          <Briefcase size={16} className="text-almet-sapphire" />
                          {section.title}
                        </h4>
                        <div className={`p-4 ${bgAccent} rounded-xl`}>
                          <div className={`${textSecondary} leading-relaxed whitespace-pre-line text-xs`}>
                            {section.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Assignment Status */}
                <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                  <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                    <CheckCircle size={16} className="text-almet-sapphire" />
                    Assignment Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${textMuted}`}>Line Manager</span>
                      <span className={`flex items-center gap-2 text-xs font-semibold ${
                        selectedAssignment.line_manager_approved_at 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {selectedAssignment.line_manager_approved_at ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {selectedAssignment.line_manager_approved_at ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${textMuted}`}>Employee</span>
                      <span className={`flex items-center gap-2 text-xs font-semibold ${
                        selectedAssignment.employee_approved_at 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {selectedAssignment.employee_approved_at ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {selectedAssignment.employee_approved_at ? 'Approved' : 'Pending'}
                      </span>
                    </div>

                    {selectedAssignment.line_manager_comments && (
                      <div className="mt-3 p-2.5 bg-gray-50 dark:bg-almet-cloud-burst rounded-lg">
                        <span className={`text-xs font-semibold ${textMuted}`}>Manager Comments:</span>
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          {selectedAssignment.line_manager_comments}
                        </p>
                      </div>
                    )}
                    {selectedAssignment.employee_comments && (
                      <div className="mt-3 p-2.5 bg-gray-50 dark:bg-almet-cloud-burst rounded-lg">
                        <span className={`text-xs font-semibold ${textMuted}`}>Employee Comments:</span>
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          {selectedAssignment.employee_comments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employee Matching */}
                {selectedAssignment.matching_details && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Target size={16} className="text-almet-sapphire" />
                      Criteria Match
                    </h4>
                    <div className="space-y-2">
                      {selectedAssignment.matching_details.overall_match ? (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                          <CheckCircle size={14} />
                          All Criteria Match
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-xs text-orange-600 dark:text-orange-400">
                          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold mb-1">Mismatches Found:</p>
                            <ul className="space-y-1 text-[10px]">
                              {selectedAssignment.matching_details.mismatch_details?.map((detail, idx) => (
                                <li key={idx}>• {detail}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {jd.required_skills && jd.required_skills.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Award size={16} className="text-almet-sapphire" />
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jd.required_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 dark:bg-almet-sapphire/20 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                        >
                          {skill.skill_detail?.name || skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Behavioral Competencies */}
                {hasBehavioral && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Users size={16} className="text-blue-600" />
                      Behavioral Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jd.behavioral_competencies.map((comp, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                        >
                          {comp.competency_detail?.name || comp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leadership Competencies */}
                {hasLeadership && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Crown size={16} className="text-purple-600" />
                      Leadership Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jd.leadership_competencies.map((item, index) => (
                        <span
                          key={index}
                          className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                        >
                          {item.leadership_item_detail?.name || item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Resources */}
                {jd.business_resources && jd.business_resources.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Building size={16} className="text-almet-sapphire" />
                      Business Resources
                    </h4>
                    <div className="space-y-1.5">
                      {jd.business_resources.map((resource, index) => (
                        <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                          <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                          {resource.items_display || resource.resource_detail?.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Access Rights */}
                {jd.access_rights && jd.access_rights.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Shield size={16} className="text-almet-sapphire" />
                      Access Rights
                    </h4>
                    <div className="space-y-1.5">
                      {jd.access_rights.map((access, index) => (
                        <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                          <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                          {access.items_display || access.access_detail?.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company Benefits */}
                {jd.company_benefits && jd.company_benefits.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Award size={16} className="text-almet-sapphire" />
                      Company Benefits
                    </h4>
                    <div className="space-y-1.5">
                      {jd.company_benefits.map((benefit, index) => (
                        <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                          <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                          {benefit.items_display || benefit.benefit_detail?.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          disabled={disabled || isProcessing}
          className={`p-1 rounded-full ${styles.hoverBg} ${
            disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          } transition-colors`}
          aria-label="Employee Actions"
          title={`Actions for ${employeeName}`}
        >
          <MoreVertical size={14} className={styles.textSecondary} />
        </button>

        {/* Portal render dropdown to body for proper z-index */}
        {isOpen && !disabled && !isProcessing && typeof window !== 'undefined' && 
          createPortal(<DropdownMenu />, document.body)}
      </div>

      {/* Job Assignments Modal */}
      {typeof window !== 'undefined' && <JobAssignmentsModal />}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={executeConfirmedAction}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        loading={isProcessing}
        darkMode={darkMode}
      />
    </>
  );
};

export default ActionsDropdown;