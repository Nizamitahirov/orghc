// components/headcount/EmployeeDetailJobDescriptions.jsx - COMPLETE Multi-Assignment Support
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, User, Eye, Users,
  Calendar, RotateCcw, CheckSquare, Download, X, Building, Briefcase, Target,
  Award, Shield, Search, Filter, ChevronDown, UserCheck, UserX as UserVacant,
  ChevronLeft, ChevronRight, Grid3X3, List, SortAsc, SortDesc, RefreshCw,
  BookOpen, Crown, Layers
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import jobDescriptionService from '@/services/jobDescriptionService';

const EmployeeDetailJobDescriptions = ({ employeeId, isManager = false }) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 🔥 NEW: Assignment-based state
  const [myAssignments, setMyAssignments] = useState([]);
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [assignmentsSummary, setAssignmentsSummary] = useState(null);
  const [teamSummary, setTeamSummary] = useState(null);
  
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [jobDetail, setJobDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-jobs');

  // Enhanced Team View State
  const [teamFilters, setTeamFilters] = useState({
    search: '',
    status: '',
    department: '',
    businessFunction: '',
    vacantOnly: false,
    pendingOnly: false
  });
  const [teamSorting, setTeamSorting] = useState({
    field: 'created_at',
    order: 'desc'
  });
  const [teamCurrentPage, setTeamCurrentPage] = useState(1);
  const [teamItemsPerPage] = useState(6);
  const [teamViewMode, setTeamViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Almet Theme classes
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-almet-mystic";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-san-juan/30" : "bg-almet-mystic/50";

  useEffect(() => {
    fetchAssignments();
  }, [employeeId]);

  // 🔥 UPDATED: Fetch assignments from employee detail
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // Get employee details which includes job_description_assignments
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${employeeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch employee data');
      
      const employeeData = await response.json();
      console.log('Fetched Employee Data:', employeeData);
      // 🔥 Extract assignments from employee data
      setMyAssignments(employeeData.job_description_assignments || []);
      setAssignmentsSummary(employeeData.job_description_summary || null);
      
      if (isManager) {
        setTeamAssignments(employeeData.team_job_description_assignments || []);
        setTeamSummary(employeeData.team_jd_summary || null);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setMyAssignments([]);
      setTeamAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const processedTeamAssignments = useMemo(() => {
    let processed = jobDescriptionService.filterAssignments(teamAssignments, teamFilters);
    processed = jobDescriptionService.sortAssignments(processed, teamSorting.field, teamSorting.order);
    return processed;
  }, [teamAssignments, teamFilters, teamSorting]);

  const paginatedTeamAssignments = useMemo(() => {
    return jobDescriptionService.paginateAssignments(processedTeamAssignments, teamCurrentPage, teamItemsPerPage);
  }, [processedTeamAssignments, teamCurrentPage, teamItemsPerPage]);

  const filterOptions = useMemo(() => {
    return {
      statuses: jobDescriptionService.getUniqueFilterValues(teamAssignments, 'status'),
      departments: jobDescriptionService.getUniqueFilterValues(teamAssignments, 'department'),
      businessFunctions: jobDescriptionService.getUniqueFilterValues(teamAssignments, 'business_function')
    };
  }, [teamAssignments]);

  const fetchJobDetail = async (jobId) => {
    try {
      setDetailLoading(true);
      const detail = await jobDescriptionService.getJobDescription(jobId);
      setJobDetail(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching job detail:', error);
      alert('Error loading job description details. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  // 🔥 UPDATED: Handle approval with assignment-based API
  const handleApproval = async (assignment, action) => {
    try {
      setActionLoading(true);
      
      const jobId = assignment.job_description_id;
      const assignmentId = assignment.id;
      
      if (!jobId || !assignmentId) {
        throw new Error('Missing job or assignment ID');
      }
      
      switch (action) {
        case 'approve_manager':
          await jobDescriptionService.approveAssignmentByLineManager(jobId, assignmentId, {
            comments: comments.trim()
          });
          break;
        case 'approve_employee':
          await jobDescriptionService.approveAssignmentAsEmployee(jobId, assignmentId, {
            comments: comments.trim()
          });
          break;
        case 'reject':
          if (!comments.trim()) {
            alert('Please provide a reason for rejection');
            return;
          }
          await jobDescriptionService.rejectAssignment(jobId, assignmentId, {
            reason: comments.trim()
          });
          break;
        default:
          throw new Error('Invalid action');
      }
      
      await fetchAssignments();
      setShowApprovalModal(false);
      setComments('');
      setSelectedAssignment(null);
      setApprovalType(null);
      
      const actionText = action === 'reject' ? 'rejected' : 'approved';
      alert(`Assignment ${actionText} successfully!`);
    } catch (error) {
      console.error('Error processing approval:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Error processing request. Please try again.';
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const openApprovalModal = (assignment, type) => {
    setSelectedAssignment(assignment);
    setApprovalType(type);
    setShowApprovalModal(true);
    setComments('');
  };

  const handleFilterChange = (filterKey, value) => {
    setTeamFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setTeamCurrentPage(1);
  };

  const handleSortChange = (field) => {
    setTeamSorting(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setTeamFilters({
      search: '',
      status: '',
      department: '',
      businessFunction: '',
      vacantOnly: false,
      pendingOnly: false
    });
    setTeamCurrentPage(1);
  };

  const getStatusDisplay = (assignment) => {
    const statusInfo = jobDescriptionService.getStatusInfo(assignment.status);
    
    // 🔥 Use status_display from backend if available
    const displayData = assignment.status_display || statusInfo;
    
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium`}
        style={{
          color: displayData.color || statusInfo.color,
          backgroundColor: darkMode 
            ? (displayData.darkBgColor || statusInfo.darkBgColor)
            : (displayData.bgColor || statusInfo.bgColor)
        }}
      >
        {getStatusIcon(assignment.status)}
        {displayData.status || statusInfo.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT':
        return <FileText size={9} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        return <Clock size={9} />;
      case 'APPROVED':
        return <CheckCircle size={9} />;
      case 'REJECTED':
        return <XCircle size={9} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={9} />;
      default:
        return <AlertCircle size={9} />;
    }
  };

  // 🔥 UPDATED: Assignment Card with multi-assignment support
 // components/headcount/EmployeeDetailJobDescriptions.jsx - AssignmentCard

const AssignmentCard = ({ assignment, showManagerActions = false, compact = false }) => {
  const canApproveManager = showManagerActions && assignment.can_approve_as_manager;
  const canApproveEmployee = !showManagerActions && assignment.can_approve_as_employee;
  
  const isVacant = assignment.is_vacancy;
  const employeeName = assignment.employee_name || 'N/A';
  const jobId = assignment.job_description_id;
  const urgency = assignment.urgency || 'normal';
  const daysPending = assignment.days_pending || 0;
  
  // ✅ Check if has comments
  const hasComments = assignment.line_manager_comments || assignment.employee_comments;
  
  return (
    <div className={`relative ${bgCard} rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-300 overflow-hidden group`}>
      {/* Urgency indicator */}
      {urgency === 'critical' && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-r-[30px] border-t-red-500 border-r-transparent">
          <AlertCircle size={12} className="absolute -top-6 -right-5 text-white" />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral text-white p-2.5 rounded-xl flex-shrink-0 shadow-md">
            <FileText size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-xs font-bold ${textPrimary} mb-1.5 line-clamp-2 leading-tight`} title={assignment.job_title}>
              {assignment.job_title}
            </h3>
            <div className={`flex items-center gap-2 text-[10px] ${textMuted} mb-1.5`}>
              <Building size={10} />
              <span className="truncate">{assignment.business_function}</span>
              <span>•</span>
              <span className="truncate">{assignment.department}</span>
            </div>
            <div className={`flex items-center gap-2 text-[10px]`}>
              {isVacant ? (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <UserVacant size={10} />
                  <span className="font-medium">Vacant Position</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <UserCheck size={10} />
                  <span className="truncate max-w-[120px]">
                    {showManagerActions ? employeeName : `Reports to: ${assignment.reports_to_name || 'N/A'}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          {getStatusDisplay(assignment)}
          <div className="flex items-center gap-2">
            {/* ✅ Comments indicator */}
            {hasComments && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Has comments">
                <MessageSquare size={10} />
              </div>
            )}
            {daysPending > 0 && (
              <span className={`text-[10px] ${daysPending > 14 ? 'text-red-600' : daysPending > 7 ? 'text-orange-600' : textMuted}`}>
                {daysPending}d pending
              </span>
            )}
          </div>
        </div>

        {/* ✅ Approval workflow progress */}
        <div className={`flex items-center justify-between p-2.5 ${bgAccent} rounded-lg text-[10px] mb-3`}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {assignment.line_manager_approved_at ? 
                <CheckCircle size={10} className="text-green-500" /> : 
                <Clock size={10} className="text-orange-500" />
              }
              <span className={`font-medium ${textMuted}`}>Manager</span>
            </div>
            <div className="flex items-center gap-1">
              {assignment.employee_approved_at ? 
                <CheckCircle size={10} className="text-green-500" /> : 
                <Clock size={10} className="text-orange-500" />
              }
              <span className={`font-medium ${textMuted}`}>Employee</span>
            </div>
          </div>
          <span className={`text-[10px] font-semibold ${textPrimary}`}>
            {assignment.line_manager_approved_at && assignment.employee_approved_at ? 'Complete' : 'In Progress'}
          </span>
        </div>

        {/* ✅ COMMENTS PREVIEW - Show in card if exists */}
        {hasComments && (
          <div className="mb-3 space-y-2">
            {assignment.line_manager_comments && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-1 mb-1">
                  <User size={9} className="text-blue-600" />
                  <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-300">Manager:</span>
                </div>
                <p className={`text-[10px] ${textSecondary} line-clamp-2`}>
                  {assignment.line_manager_comments}
                </p>
              </div>
            )}
            {assignment.employee_comments && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1 mb-1">
                  <UserCheck size={9} className="text-green-600" />
                  <span className="text-[9px] font-semibold text-green-700 dark:text-green-300">Employee:</span>
                </div>
                <p className={`text-[10px] ${textSecondary} line-clamp-2`}>
                  {assignment.employee_comments}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => fetchJobDetail(jobId)}
              disabled={detailLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors text-[10px] font-medium"
            >
              <Eye size={10} />
              View
            </button>
            <button 
              onClick={() => jobDescriptionService.downloadJobDescriptionPDF(jobId)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-almet-waterloo hover:bg-gray-100 dark:hover:bg-almet-comet/30 rounded-lg transition-colors text-[10px] font-medium"
            >
              <Download size={10} />
              PDF
            </button>
          </div>

          <div className="flex items-center gap-1">
            {canApproveManager && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openApprovalModal(assignment, 'approve_manager')}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] font-medium shadow-sm"
                >
                  <CheckSquare size={10} />
                  Approve
                </button>
                <button
                  onClick={() => openApprovalModal(assignment, 'reject')}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <XCircle size={10} />
                </button>
              </div>
            )}

            {canApproveEmployee && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openApprovalModal(assignment, 'approve_employee')}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] font-medium shadow-sm"
                >
                  <CheckSquare size={10} />
                  Approve
                </button>
                <button
                  onClick={() => openApprovalModal(assignment, 'reject')}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <XCircle size={10} />
                </button>
              </div>
            )}

            {!canApproveManager && !canApproveEmployee && (
              <span className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg ${
                assignment.status === 'APPROVED' 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                  : `${textMuted} ${bgAccent}`
              }`}>
                {assignment.status === 'APPROVED' ? 'Complete' : 'Pending'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  // Compact List View Component
  const CompactAssignmentCard = ({ assignment }) => {
    const canApproveManager = assignment.can_approve;
    const isVacant = assignment.is_vacancy;
    const employeeName = assignment.employee_name || 'N/A';
    const jobId = assignment.job_description_id;
    
    return (
      <div className={`p-3.5 ${bgCard} rounded-xl border ${borderColor} hover:shadow-md transition-all relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral text-white p-2 rounded-xl relative">
              <FileText size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-xs font-bold ${textPrimary} truncate mb-1`} title={assignment.job_title}>
                {assignment.job_title}
              </h4>
              <div className="flex items-center gap-3 text-[10px]">
                <span className={`${textMuted} truncate`}>
                  {isVacant ? 'Vacant' : employeeName} • {assignment.department}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusDisplay(assignment)}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => fetchJobDetail(jobId)}
                className="p-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye size={14} />
              </button>
              
              {canApproveManager && (
                <>
                  <button
                    onClick={() => openApprovalModal(assignment, 'approve_manager')}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Approve as Line Manager"
                  >
                    <CheckSquare size={14} />
                  </button>
                  <button
                    onClick={() => openApprovalModal(assignment, 'reject')}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <XCircle size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Filters Component
  const TeamFiltersPanel = () => (
    <div className={`${bgCard} rounded-xl border ${borderColor} mb-6 overflow-hidden transition-all ${showFilters ? 'block' : 'hidden'}`}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className={`block text-[10px] font-semibold ${textSecondary} mb-1.5`}>Search</label>
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={12} />
              <input
                type="text"
                placeholder="Job title, employee..."
                value={teamFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire text-xs`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-semibold ${textSecondary} mb-1.5`}>Status</label>
            <select
              value={teamFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-xs`}
            >
              <option value="">All Status</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>
                  {jobDescriptionService.getStatusInfo(status).label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[10px] font-semibold ${textSecondary} mb-1.5`}>Department</label>
            <select
              value={teamFilters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-xs`}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={teamFilters.vacantOnly}
              onChange={(e) => handleFilterChange('vacantOnly', e.target.checked)}
              className="w-3.5 h-3.5 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
            />
            <span className={`text-xs ${textSecondary}`}>Vacant positions only</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={teamFilters.pendingOnly}
              onChange={(e) => handleFilterChange('pendingOnly', e.target.checked)}
              className="w-3.5 h-3.5 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
            />
            <span className={`text-xs ${textSecondary}`}>Pending approvals only</span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xs ${textMuted}`}>
              Showing {paginatedTeamAssignments.totalItems} of {teamAssignments.length} assignments
            </span>
            {(teamFilters.search || teamFilters.status || teamFilters.department || teamFilters.vacantOnly || teamFilters.pendingOnly) && (
              <button
                onClick={clearFilters}
                className="text-almet-sapphire hover:text-almet-astral font-semibold text-xs"
              >
                Clear filters
              </button>
            )}
          </div>
          
          <button
            onClick={() => fetchAssignments()}
            className="flex items-center gap-2 px-3 py-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors text-xs font-medium"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 dark:bg-almet-comet rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-almet-comet rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-almet-comet rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // 🔥 Use summary data from backend
  const myPendingCount = assignmentsSummary?.pending_employee || 0;
  const teamPendingCount = teamSummary?.pending_line_manager || 0;

  return (
    <>
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm`}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`text-xl font-bold ${textPrimary} mb-1.5 flex items-center gap-2`}>
                <Layers size={20} />
                Job Description Assignments
              </h2>
              <p className={`${textSecondary} text-xs`}>
                {assignmentsSummary ? (
                  `${assignmentsSummary.total} total assignments • ${assignmentsSummary.approved} approved`
                ) : (
                  'Manage your job description assignments and approvals'
                )}
              </p>
            </div>
          </div>

          {isManager && (
            <div className="flex space-x-1 bg-gray-100 dark:bg-almet-comet/50 rounded-xl p-1 mb-5">
              <button
                onClick={() => setActiveTab('my-jobs')}
                className={`flex-1 px-3.5 py-2.5 rounded-lg font-semibold transition-all text-xs ${
                  activeTab === 'my-jobs'
                    ? 'bg-white dark:bg-almet-cloud-burst text-almet-sapphire shadow-md'
                    : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User size={14} />
                  My Assignments
                  {myPendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                      {myPendingCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('team-jobs')}
                className={`flex-1 px-3.5 py-2.5 rounded-lg font-semibold transition-all text-xs ${
                  activeTab === 'team-jobs'
                    ? 'bg-white dark:bg-almet-cloud-burst text-almet-sapphire shadow-md'
                    : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users size={14} />
                  Team Assignments ({teamSummary?.total || teamAssignments.length})
                  {teamPendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                      {teamPendingCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {isManager && activeTab === 'team-jobs' && teamAssignments.length > 0 && (
            <div className="mb-5">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3.5 py-2 border ${borderColor} rounded-xl transition-all text-xs font-semibold ${
                      showFilters 
                        ? 'bg-almet-sapphire text-white border-almet-sapphire shadow-md' 
                        : `${textPrimary} hover:${bgCardHover}`
                    }`}
                  >
                    <Filter size={14} />
                    Filters
                    <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className="flex items-center border ${borderColor} rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleSortChange('created_at')}
                      className={`p-2 transition-colors ${
                        teamSorting.field === 'created_at' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="Sort by Date"
                    >
                      {teamSorting.field === 'created_at' && teamSorting.order === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                    </button>
                    <button
                      onClick={() => handleSortChange('job_title')}
                      className={`p-2 transition-colors ${
                        teamSorting.field === 'job_title' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="Sort by Title"
                    >
                      <BookOpen size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex border ${borderColor} rounded-xl overflow-hidden">
                    <button
                      onClick={() => setTeamViewMode('grid')}
                      className={`p-2 transition-colors ${
                        teamViewMode === 'grid' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="Grid View"
                    >
                      <Grid3X3 size={14} />
                    </button>
                    <button
                      onClick={() => setTeamViewMode('list')}
                      className={`p-2 transition-colors ${
                        teamViewMode === 'list' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="List View"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <TeamFiltersPanel />
            </div>
          )}

          <div className="space-y-5">
            {(!isManager || activeTab === 'my-jobs') && (
              <>
                {myAssignments.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${textPrimary}`}>
                        {isManager ? 'My Assignments' : 'Your Assignments'}
                      </h3>
                      {myPendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3.5 py-2 rounded-xl">
                          <AlertCircle size={16} className="text-orange-600" />
                          <span className="text-orange-700 dark:text-orange-300 text-xs font-semibold">
                            {myPendingCount} pending your approval
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {myAssignments.map(assignment => (
                        <AssignmentCard 
                          key={assignment.id} 
                          assignment={assignment} 
                          showManagerActions={false}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className={`w-14 h-14 mx-auto mb-3 ${bgAccent} rounded-2xl flex items-center justify-center`}>
                      <FileText className={`h-7 w-7 ${textMuted}`} />
                    </div>
                    <h3 className={`text-base font-bold ${textPrimary} mb-1.5`}>
                      No Job Description Assignments
                    </h3>
                    <p className={`${textMuted} text-xs`}>
                      You don't have any job description assignments yet.
                    </p>
                  </div>
                )}
              </>
            )}

            {isManager && activeTab === 'team-jobs' && (
              <>
                {paginatedTeamAssignments.totalItems > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${textPrimary}`}>
                       Team Assignments
                        <span className={`ml-2 text-xs font-normal ${textMuted}`}>
                          ({paginatedTeamAssignments.totalItems}{teamAssignments.length !== paginatedTeamAssignments.totalItems && ` of ${teamAssignments.length}`})
                        </span>
                      </h3>
                      {teamPendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3.5 py-2 rounded-xl">
                          <AlertCircle size={16} className="text-orange-600" />
                          <span className="text-orange-700 dark:text-orange-300 text-xs font-semibold">
                            {teamPendingCount} pending your approval
                          </span>
                        </div>
                      )}
                    </div>

                    {teamViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {paginatedTeamAssignments.items.map(assignment => (
                          <AssignmentCard 
                            key={assignment.id} 
                            assignment={assignment} 
                            showManagerActions={true}
                            compact={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paginatedTeamAssignments.items.map(assignment => (
                          <CompactAssignmentCard key={assignment.id} assignment={assignment} />
                        ))}
                      </div>
                    )}

                    {paginatedTeamAssignments.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-200 dark:border-almet-comet">
                        <div className={`text-xs ${textMuted}`}>
                          Showing {((teamCurrentPage - 1) * teamItemsPerPage) + 1} to {Math.min(teamCurrentPage * teamItemsPerPage, paginatedTeamAssignments.totalItems)} of {paginatedTeamAssignments.totalItems} assignments
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setTeamCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={!paginatedTeamAssignments.hasPreviousPage}
                            className={`p-2 border ${borderColor} rounded-lg transition-colors ${
                              !paginatedTeamAssignments.hasPreviousPage 
                                ? 'opacity-50 cursor-not-allowed' 
                                : `hover:${bgCardHover}`
                            }`}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, paginatedTeamAssignments.totalPages) }, (_, i) => {
                              let pageNum;
                              const totalPages = paginatedTeamAssignments.totalPages;
                              
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (teamCurrentPage <= 3) {
                                pageNum = i + 1;
                              } else if (teamCurrentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = teamCurrentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setTeamCurrentPage(pageNum)}
                                  className={`px-2.5 py-1.5 text-xs border ${borderColor} rounded-lg transition-colors ${
                                    teamCurrentPage === pageNum 
                                      ? 'bg-almet-sapphire text-white border-almet-sapphire' 
                                      : `${textPrimary} hover:${bgCardHover}`
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setTeamCurrentPage(prev => Math.min(prev + 1, paginatedTeamAssignments.totalPages))}
                            disabled={!paginatedTeamAssignments.hasNextPage}
                            className={`p-2 border ${borderColor} rounded-lg transition-colors ${
                              !paginatedTeamAssignments.hasNextPage 
                                ? 'opacity-50 cursor-not-allowed' 
                                : `hover:${bgCardHover}`
                            }`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : processedTeamAssignments.length === 0 && teamAssignments.length > 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-14 h-14 mx-auto mb-3 ${bgAccent} rounded-2xl flex items-center justify-center`}>
                      <Filter className={`h-7 w-7 ${textMuted}`} />
                    </div>
                    <h3 className={`text-base font-bold ${textPrimary} mb-1.5`}>
                      No Assignments Match Your Filters
                    </h3>
                    <p className={`${textMuted} text-xs mb-3`}>
                      Try adjusting your search criteria or clear the filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-3.5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-colors font-semibold text-xs"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className={`w-14 h-14 mx-auto mb-3 ${bgAccent} rounded-2xl flex items-center justify-center`}>
                      <Users className={`h-7 w-7 ${textMuted}`} />
                    </div>
                    <h3 className={`text-base font-bold ${textPrimary} mb-1.5`}>
                      No Team Assignments Found
                    </h3>
                    <p className={`${textMuted} text-xs`}>
                      No job description assignments for your team members.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 Job Description Detail Modal - Shows all assignments */}
      {showDetailModal && jobDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-almet-comet">
                <div>
                  <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Job Description Details</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs ${textMuted}`}>Created {jobDescriptionService.formatDate(jobDetail.created_at)}</span>
                    {jobDetail.version && (
                      <span className={`text-xs ${textMuted}`}>Version {jobDetail.version}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => jobDescriptionService.downloadJobDescriptionPDF(jobDetail.id)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-colors text-xs font-semibold"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setJobDetail(null);
                    }}
                    className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-almet-comet/30`}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-5">
                  <div className={`p-4 ${bgAccent} rounded-xl`}>
                    <h3 className={`text-lg font-bold ${textPrimary} mb-3`}>{jobDetail.job_title}</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className={`font-semibold ${textMuted}`}>Company:</span>
                        <p className={`${textPrimary} mt-1`}>{jobDetail.business_function?.name}</p>
                      </div>
                      <div>
                        <span className={`font-semibold ${textMuted}`}>Department:</span>
                        <p className={`${textPrimary} mt-1`}>{jobDetail.department?.name}</p>
                      </div>
                      <div>
                        <span className={`font-semibold ${textMuted}`}>Unit:</span>
                        <p className={`${textPrimary} mt-1`}>{jobDetail.unit?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`font-semibold ${textMuted}`}>Job Function:</span>
                        <p className={`${textPrimary} mt-1`}>{jobDetail.job_function?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`font-semibold ${textMuted}`}>Hierarchy:</span>
                        <p className={`${textPrimary} mt-1`}>{jobDetail.position_group?.name}</p>
                      </div>
                      <div>
                        <span className={`font-semibold ${textMuted}`}>Grading Levels:</span>
                        <p className={`${textPrimary} mt-1`}>
                          {jobDetail.grading_levels && jobDetail.grading_levels.length > 0 
                            ? jobDetail.grading_levels.join(', ') 
                            : jobDetail.grading_level || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-base font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <Target size={16} className="text-almet-sapphire" />
                      Job Purpose
                    </h4>
                    <div className={`p-4 ${bgAccent} rounded-xl`}>
                      <p className={`${textSecondary} leading-relaxed text-xs`}>{jobDetail.job_purpose}</p>
                    </div>
                  </div>

                  {jobDetail.sections && jobDetail.sections.length > 0 && (
                    <div className="space-y-5">
                      {jobDetail.sections.map((section, index) => (
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

               
                <div className="space-y-5">
                  {/* 🔥 Assignments Summary */}
                  {jobDetail.assignments && jobDetail.assignments.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                      <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                        <Users size={16} className="text-almet-sapphire" />
                        Assignments ({jobDetail.assignments.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                         {jobDetail.assignments.map((assignment, idx) => (
                    <div key={idx} className={`p-3 bg-white dark:bg-almet-cloud-burst rounded-lg border ${borderColor}`}>
                      {/* Employee/Vacancy Info */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {assignment.is_vacancy ? (
                            <UserVacant size={14} className="text-orange-500 flex-shrink-0" />
                          ) : (
                            <UserCheck size={14} className="text-green-500 flex-shrink-0" />
                          )}
                          <span className={`text-xs font-semibold ${textPrimary} truncate`}>
                            {assignment.employee?.full_name || assignment.employee_name || 'VACANT'}
                          </span>
                        </div>
                        {assignment.status === 'APPROVED' ? (
                          <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                        ) : assignment.status === 'REJECTED' ? (
                          <XCircle size={12} className="text-red-500 flex-shrink-0" />
                        ) : (
                          <Clock size={12} className="text-orange-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Status */}
                      <div className="mb-2">
                        {getStatusDisplay(assignment)}
                      </div>

                      {/* ✅ APPROVAL DATES */}
                      {(assignment.line_manager_approved_at || assignment.employee_approved_at) && (
                        <div className={`text-[10px] ${textMuted} space-y-1 mb-2`}>
                          {assignment.line_manager_approved_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={8} className="text-green-500" />
                              <span>Manager: {jobDescriptionService.formatDateTime(assignment.line_manager_approved_at)}</span>
                            </div>
                          )}
                          {assignment.employee_approved_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={8} className="text-green-500" />
                              <span>Employee: {jobDescriptionService.formatDateTime(assignment.employee_approved_at)}</span>
                            </div>
                          )}
                        </div>
                      )}

                                {assignment.line_manager_comments && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-2 mb-1">
                            <User size={10} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className={`text-[10px] font-semibold text-blue-700 dark:text-blue-300`}>
                              Manager Comment:
                            </span>
                          </div>
                          <p className={`text-[10px] ${textSecondary} leading-relaxed ml-4`}>
                            {assignment.line_manager_comments}
                          </p>
                        </div>
                      )}

                      {/* ✅ EMPLOYEE COMMENTS */}
                      {assignment.employee_comments && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-2 mb-1">
                            <UserCheck size={10} className="text-green-600 flex-shrink-0 mt-0.5" />
                            <span className={`text-[10px] font-semibold text-green-700 dark:text-green-300`}>
                              Employee Comment:
                            </span>
                          </div>
                          <p className={`text-[10px] ${textSecondary} leading-relaxed ml-4`}>
                            {assignment.employee_comments}
                          </p>
                        </div>
                      )}
                          </div>
                        ))}
                        {jobDetail.assignments.length > 10 && (
                          <div className={`text-center text-xs ${textMuted} pt-2`}>
                            +{jobDetail.assignments.length - 10} more assignments
                          </div>
                        )}

                        
                      </div>
                    </div>
                  )}

                  {/* Technical Skills */}
                  {jobDetail.required_skills && jobDetail.required_skills.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                      <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                        <Award size={16} className="text-almet-sapphire" />
                        Technical Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {jobDetail.required_skills.map((skill, index) => (
                          <span key={index} className="inline-block bg-blue-100 dark:bg-almet-sapphire/20 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                            {skill.skill_detail?.name || skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Behavioral Competencies */}
                  {jobDetail.behavioral_competencies && jobDetail.behavioral_competencies.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                      <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                        <Users size={16} className="text-blue-600" />
                        Behavioral Competencies
                      </h4>
                      <div className="space-y-1.5">
                        {jobDetail.behavioral_competencies.map((comp, index) => (
                          <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                            <div className="w-1 h-1 bg-blue-600 rounded-full flex-shrink-0"></div>
                            {comp.competency_detail?.name || comp.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leadership Competencies */}
                  {jobDetail.leadership_competencies && jobDetail.leadership_competencies.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                      <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                        <Crown size={16} className="text-purple-600" />
                        Leadership Competencies
                      </h4>
                      <div className="space-y-1.5">
                        {jobDetail.leadership_competencies.map((comp, index) => (
                          <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                            <div className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></div>
                            {comp.leadership_item_detail?.name || comp.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Resources */}
                  {jobDetail.business_resources && jobDetail.business_resources.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                      <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                        <Building size={16} className="text-almet-sapphire" />
                        Business Resources
                      </h4>
                      <div className="space-y-1.5">
                        {jobDetail.business_resources.map((resource, index) => (
                          <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                            <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                            {resource.resource_detail?.name || resource.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Access Rights */}
                  {jobDetail.access_rights && jobDetail.access_rights.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                      <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                        <Shield size={16} className="text-almet-sapphire" />
                        Access Rights
                      </h4>
                      <div className="space-y-1.5">
                        {jobDetail.access_rights.map((access, index) => (
                          <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                            <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                            {access.access_detail?.name || access.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company Benefits */}
                  {jobDetail.company_benefits && jobDetail.company_benefits.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                      <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                        <Award size={16} className="text-almet-sapphire" />
                        Company Benefits
                      </h4>
                      <div className="space-y-1.5">
                        {jobDetail.company_benefits.map((benefit, index) => (
                          <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                            <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                            {benefit.benefit_detail?.name || benefit.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Approval Modal - Assignment-based */}
      {showApprovalModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${bgCard} rounded-2xl w-full max-w-md border ${borderColor} shadow-2xl`}>
            <div className="p-5">
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>
                {approvalType === 'reject' ? 'Reject Assignment' : 'Approve Assignment'}
              </h3>
              
              <div className="mb-3">
                <p className={`text-xs font-semibold ${textSecondary} mb-1`}>Job Title:</p>
                <p className={`font-bold ${textPrimary} text-sm`}>{selectedAssignment.job_title}</p>
              </div>

              <div className="mb-3">
                <p className={`text-xs font-semibold ${textSecondary} mb-1`}>
                  {selectedAssignment.is_vacancy ? 'Position:' : 'Employee:'}
                </p>
                <p className={`font-semibold ${textPrimary} text-sm flex items-center gap-1`}>
                  {selectedAssignment.is_vacancy ? (
                    <>
                      <UserVacant size={14} className="text-orange-500" />
                      Vacant Position
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} className="text-green-500" />
                      {selectedAssignment.employee_name || 'N/A'}
                    </>
                  )}
                </p>
              </div>

              <div className="mb-4">
                <p className={`text-xs font-semibold ${textSecondary} mb-1.5`}>Current Status:</p>
                {getStatusDisplay(selectedAssignment)}
              </div>

              <div className="mb-5">
                <label className={`block text-xs font-semibold ${textSecondary} mb-2`}>
                  {approvalType === 'reject' ? 'Reason for rejection:' : 'Comments (optional):'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="4"
                  className={`w-full px-3.5 py-2.5 border ${borderColor} rounded-xl ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire resize-none text-xs`}
                  placeholder={approvalType === 'reject' ? 'Please provide a reason...' : 'Optional comments...'}
                  required={approvalType === 'reject'}
                />
                {approvalType === 'reject' && (
                  <p className="text-xs text-red-500 mt-1.5">* Reason is required for rejection</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setComments('');
                    setSelectedAssignment(null);
                    setApprovalType(null);
                  }}
                  className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-almet-comet/30 text-xs`}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval(selectedAssignment, approvalType)}
                  disabled={actionLoading || (approvalType === 'reject' && !comments.trim())}
                  className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg text-xs ${
                    approvalType === 'reject' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {approvalType === 'reject' ? 'Reject' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeDetailJobDescriptions;