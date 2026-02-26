// components/jobDescription/JobDescriptionList.jsx - Simplified without filters
import React, { useState } from 'react';
import { 
  FileText, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  UserCheck,
  UserX as UserVacant,
  ChevronRight,
  Building,
  Briefcase,
  Users,
  List
} from 'lucide-react';

const JobDescriptionList = ({
  filteredJobs,
  onJobSelect,
  onJobEdit,
  onJobDelete,
  onViewAssignments,
  onDirectSubmission,
  onDownloadPDF,
  actionLoading,
  userAccess,
  darkMode
}) => {
  const [expandedAssignments, setExpandedAssignments] = useState({});

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  const toggleAssignments = (jobId, event) => {
    event.stopPropagation();
    setExpandedAssignments(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const getOverallStatusColor = (overallStatus) => {
    switch (overallStatus) {
      case 'ALL_APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ALL_DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'PENDING_APPROVALS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'HAS_REJECTIONS':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'NO_ASSIGNMENTS':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'PENDING_LINE_MANAGER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'PENDING_EMPLOYEE':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'REVISION_REQUIRED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT':
      case 'ALL_DRAFT':
        return <Edit size={12} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
      case 'PENDING_APPROVALS':
        return <Clock size={12} />;
      case 'APPROVED':
      case 'ALL_APPROVED':
        return <CheckCircle size={12} />;
      case 'REJECTED':
      case 'HAS_REJECTIONS':
        return <XCircle size={12} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  const formatOverallStatus = (status) => {
    switch (status) {
      case 'ALL_APPROVED': return 'All Approved';
      case 'ALL_DRAFT': return 'All Draft';
      case 'PENDING_APPROVALS': return 'Pending';
      case 'HAS_REJECTIONS': return 'Has Rejections';
      case 'NO_ASSIGNMENTS': return 'No Assignments';
      case 'MIXED': return 'Mixed Status';
      default: return status;
    }
  };

  const handleViewAssignmentsClick = (job, event) => {
    event.stopPropagation();
    if (onViewAssignments) {
      onViewAssignments(job);
    }
  };

  const handleDownloadPDF = (jobId, event) => {
    event.stopPropagation();
    if (onDownloadPDF) {
      onDownloadPDF(jobId);
    }
  };

  const handleJobCardClick = (job) => {
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  const handleDirectSubmissionClick = (jobId, event) => {
    event.stopPropagation();
    if (onDirectSubmission) {
      onDirectSubmission(jobId);
    }
  };

  const handleEditClick = (job, event) => {
    event.stopPropagation();
    if (onJobEdit) {
      onJobEdit(job);
    }
  };

  const handleDeleteClick = (jobId, event) => {
    event.stopPropagation();
    if (onJobDelete) {
      onJobDelete(jobId);
    }
  };

  const handleViewClick = (job, event) => {
    event.stopPropagation();
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  return (
    <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm overflow-hidden`}>
      <div className="p-6">
        {/* List Header */}
        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                Job Descriptions
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-almet-sapphire/10 text-almet-sapphire`}>
                {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Job Cards Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid gap-4">
            {filteredJobs.map(job => {
              const isExpanded = expandedAssignments[job.id];
              const assignments = job.assignments_preview || [];
              const summary = job.assignments_summary || {};
              
              return (
                <div 
                  key={job.id} 
                  className={`${bgCardHover} rounded-xl border ${borderColor} 
                    hover:shadow-md transition-all duration-200 group hover:border-almet-sapphire/30`}
                >
                  {/* Main Job Card */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => handleJobCardClick(job)}
                  >
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-almet-sapphire text-white p-3 rounded-xl group-hover:scale-110 
                          transition-transform duration-200 flex-shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-bold ${textPrimary} mb-2 group-hover:text-almet-sapphire 
                            transition-colors duration-200 line-clamp-1`}>
                            {job.job_title}
                          </h3>
                          <div className={`text-xs ${textSecondary} space-y-1`}>
                            <div className="flex items-center gap-2">
                              <Building size={12} className={textMuted} />
                              <span>{job.business_function_name}</span>
                              <span className={textMuted}>•</span>
                              <span>{job.department_name}</span>
                            </div>
                            {job.job_function_name && (
                              <div className="flex items-center gap-2">
                                <Briefcase size={12} className={textMuted} />
                                <span>{job.job_function_name}</span>
                                {job.grading_levels && job.grading_levels.length > 0 && (
                                  <span className={`${textMuted} font-mono`}>
                                    ({job.grading_levels.join(', ')})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Overall Status Badge */}
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 
                          ${getOverallStatusColor(job.overall_status)}`}>
                          {getStatusIcon(job.overall_status)}
                          {formatOverallStatus(job.overall_status)}
                        </span>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleViewAssignmentsClick(job, e)}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="View Assignments"
                          >
                            <List size={14} />
                          </button>
                          <button
                            onClick={(e) => handleViewClick(job, e)}
                            className="p-2 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDownloadPDF(job.id, e)}
                            disabled={actionLoading}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg 
                              transition-colors disabled:opacity-50"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>
                          {
                            userAccess.is_admin && (  <button
                            onClick={(e) => handleEditClick(job, e)}
                            disabled={actionLoading}
                            className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg 
                              transition-colors disabled:opacity-50"
                            title="Edit Job Description"
                          >
                            <Edit size={14} />
                          </button>)
                          }
                        {
                            userAccess.is_admin && ( 
                          <button
                            onClick={(e) => handleDeleteClick(job.id, e)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg 
                              transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Assignment Summary */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-almet-comet">
                      <div className="flex items-center gap-4">
                        {/* Total Assignments */}
                        <div className="flex items-center gap-2">
                          <Users size={14} className={textMuted} />
                          <span className={`text-xs ${textPrimary} font-medium`}>
                            {job.total_assignments || 0} assignment{(job.total_assignments || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {/* Breakdown */}
                        {job.total_assignments > 0 && (
                          <div className={`flex items-center gap-3 text-xs ${textMuted}`}>
                            {job.employee_assignments_count > 0 && (
                              <span className="flex items-center gap-1">
                                <UserCheck size={12} className="text-green-600" />
                                {job.employee_assignments_count} employee{job.employee_assignments_count !== 1 ? 's' : ''}
                              </span>
                            )}
                            {job.vacancy_assignments_count > 0 && (
                              <span className="flex items-center gap-1">
                                <UserVacant size={12} className="text-orange-600" />
                                {job.vacancy_assignments_count} vacant
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Approval Progress */}
                        {job.total_assignments > 0 && (
                          <div className={`flex items-center gap-1 text-xs ${textMuted}`}>
                            <CheckCircle size={12} className="text-green-600" />
                            <span>{job.approved_count || 0}/{job.total_assignments} approved</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Expand/Collapse Button */}
                      {assignments.length > 0 && (
                        <button
                          onClick={(e) => toggleAssignments(job.id, e)}
                          className={`flex items-center gap-1 text-xs ${textMuted} hover:text-almet-sapphire transition-colors`}
                        >
                          <span>{isExpanded ? 'Hide' : 'Show'} assignments</span>
                          <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Assignments List */}
                  {isExpanded && assignments.length > 0 && (
                    <div className={`border-t ${borderColor} p-4 bg-gray-50 dark:bg-almet-cloud-burst/50`}>
                      <div className="space-y-2">
                        {assignments.map((assignment, index) => (
                          <div 
                            key={assignment.id || index}
                            className={`flex items-center justify-between p-3 ${bgCard} rounded-lg border ${borderColor}`}
                          >
                            <div className="flex items-center gap-3">
                              {assignment.is_vacancy ? (
                                <UserVacant size={14} className="text-orange-600" />
                              ) : (
                                <UserCheck size={14} className="text-green-600" />
                              )}
                              <span className={`text-sm ${textPrimary}`}>
                                {assignment.name || (assignment.is_vacancy ? 'Vacant Position' : 'Unknown')}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${getAssignmentStatusColor(assignment.status)}`}>
                              {assignment.status_display?.status || assignment.status}
                            </span>
                          </div>
                        ))}
                        
                        {job.total_assignments > assignments.length && (
                          <div className={`text-center text-xs ${textMuted} py-2`}>
                            +{job.total_assignments - assignments.length} more assignments
                          </div>
                        )}
                      </div>
                      
                      {/* Submit All Button */}
                      {summary.draft > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-almet-comet">
                          <button
                            onClick={(e) => handleDirectSubmissionClick(job.id, e)}
                            disabled={actionLoading}
                            className="w-full py-2 px-4 bg-almet-sapphire text-white rounded-lg text-sm font-medium
                              hover:bg-almet-astral transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Send size={14} />
                            Submit All Draft Assignments ({summary.draft})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className={`mx-auto h-20 w-20 ${textMuted} mb-6 flex items-center justify-center 
              bg-gray-100 dark:bg-almet-comet rounded-full`}>
              <FileText size={40} />
            </div>
            <h3 className={`text-xl font-semibold ${textPrimary} mb-3`}>
              No Job Descriptions Found
            </h3>
            <p className={`${textMuted} text-sm max-w-md mx-auto`}>
              No job descriptions match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescriptionList;