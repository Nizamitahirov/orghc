// components/jobDescription/JobViewModal.jsx - UPDATED: Compact Design with Smaller Fonts
import React, { useState } from 'react';
import { 
  X, Download, UserCheck, UserX as UserVacant, Clock, CheckCircle, XCircle, RotateCcw,
  AlertCircle, Edit, Building, User, Target, BookOpen, Shield, Package, Gift,
  ChevronDown, ChevronUp, Check, Layers, Award, Crown, Users, Eye, MessageSquare
} from 'lucide-react';

const JobViewModal = ({ job, onClose, onDownloadPDF, onViewAssignments, darkMode }) => {
  const [expandedSections, setExpandedSections] = useState({
    assignments: true,
    sections: true,
    skills: true,
    behavioral: true,
    leadership: true,
    resources: false,
    access: false,
    benefits: false
  });

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";
  const bgHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status) => {
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
        return <Edit size={12} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        return <Clock size={12} />;
      case 'APPROVED':
        return <CheckCircle size={12} />;
      case 'REJECTED':
        return <XCircle size={12} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  const formatSectionContent = (content) => {
    if (!content) return '';
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map((line) => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      return cleanLine ? `• ${cleanLine}` : '';
    }).filter(line => line).join('\n');
  };

  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, count = null, isEmpty = false, color = 'almet-sapphire' }) => (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full px-3 py-2 ${bgAccent} hover:opacity-80 transition-all duration-200 
          flex items-center justify-between text-left`}
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className={isEmpty ? textMuted : `text-${color}`} />
          <span className={`font-semibold ${textPrimary} text-xs`}>{title}</span>
          {count !== null && count > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-${color} text-white`}>
              {count}
            </span>
          )}
          {isEmpty && (
            <span className={`text-[10px] ${textMuted} italic`}>No data</span>
          )}
        </div>
        {!isEmpty && (isExpanded ? (
          <ChevronUp size={13} className={textMuted} />
        ) : (
          <ChevronDown size={13} className={textMuted} />
        ))}
      </button>
      {isExpanded && !isEmpty && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );

  // Safe data extraction with multi-assignment support
  const safeJobData = {
    job_title: job?.job_title || 'No Title',
    job_purpose: job?.job_purpose || 'No purpose specified',
    business_function_name: job?.business_function?.name || 'N/A',
    department_name: job?.department?.name || 'N/A',
    unit_name: job?.unit?.name || null,
    job_function_name: job?.job_function?.name || null,
    position_group_name: job?.position_group?.name || null,
    grading_levels: job?.grading_levels || (job?.grading_level ? [job.grading_level] : []),
    grading_level: job?.grading_level || null,
    
    // Multi-assignment data
    assignments: job?.assignments || [],
    total_assignments: job?.total_assignments || job?.assignments?.length || 0,
    employee_assignments_count: job?.employee_assignments_count || 0,
    vacancy_assignments_count: job?.vacancy_assignments_count || 0,
    approved_count: job?.approved_count || 0,
    pending_count: job?.pending_count || 0,
    overall_status: job?.overall_status || 'UNKNOWN',
    
    sections: job?.sections || [],
    required_skills: job?.required_skills || [],
    behavioral_competencies: job?.behavioral_competencies || [],
    leadership_competencies: job?.leadership_competencies || [],
    business_resources: job?.business_resources || [],
    access_rights: job?.access_rights || [],
    company_benefits: job?.company_benefits || [],
    created_at: job?.created_at || null,
    updated_at: job?.updated_at || null,
    version: job?.version || 1
  };

  if (!job || !job.id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${bgCard} rounded-lg w-full max-w-md p-5 border ${borderColor}`}>
          <div className="text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={40} />
            <h3 className={`text-base font-bold ${textPrimary} mb-2`}>Error Loading Job Description</h3>
            <p className={`${textSecondary} mb-3 text-xs`}>
              The job description data could not be loaded. Please try again.
            </p>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className="p-4">
          {/* Header - Compact */}
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base font-bold ${textPrimary}`}>Job Description Details</h2>
            <div className="flex items-center gap-2">
              {onViewAssignments && safeJobData.total_assignments > 0 && (
                <button
                  onClick={onViewAssignments}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] font-semibold"
                >
                  <Users size={12} />
                  View All Assignments
                </button>
              )}
              <button
                onClick={onDownloadPDF}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-[10px] font-semibold"
              >
                <Download size={12} />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className={`p-1.5 ${textMuted} hover:${textPrimary} transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-almet-comet/30`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Header Information - Compact */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-3 ${bgAccent} rounded-lg`}>
              <div>
                <h3 className={`text-sm font-bold ${textPrimary} mb-1.5`}>{safeJobData.job_title}</h3>
                <div className={`${textSecondary} text-[10px] space-y-0.5`}>
                  <p className="flex items-center gap-1.5">
                    <Building size={11} />
                    {safeJobData.business_function_name} • {safeJobData.department_name}
                    {safeJobData.unit_name && ` • ${safeJobData.unit_name}`}
                  </p>
                  {safeJobData.job_function_name && (
                    <p className="flex items-center gap-1.5">
                      <Target size={11} />
                      {safeJobData.job_function_name}
                    </p>
                  )}
                  {safeJobData.position_group_name && (
                    <p className="flex items-center gap-1.5">
                      <User size={11} />
                      {safeJobData.position_group_name}
                    </p>
                  )}
                  {safeJobData.grading_levels.length > 0 && (
                    <p className="flex items-center gap-1.5">
                      <Award size={11} />
                      Grades: {safeJobData.grading_levels.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${textMuted} text-[10px]`}>Overall Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] flex items-center gap-1 ${getStatusColor(safeJobData.overall_status)}`}>
                    {getStatusIcon(safeJobData.overall_status)}
                    {safeJobData.overall_status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${textMuted} text-[10px]`}>Total Assignments:</span>
                  <span className={`${textPrimary} text-[10px] font-bold`}>
                    {safeJobData.total_assignments}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${textMuted} text-[10px]`}>Employees/Vacancies:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      <UserCheck size={10} className="text-green-600" />
                      <span className={`${textPrimary} text-[10px] font-semibold`}>{safeJobData.employee_assignments_count}</span>
                    </div>
                    <span className={`${textMuted} text-[10px]`}>/</span>
                    <div className="flex items-center gap-0.5">
                      <UserVacant size={10} className="text-orange-600" />
                      <span className={`${textPrimary} text-[10px] font-semibold`}>{safeJobData.vacancy_assignments_count}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${textMuted} text-[10px]`}>Approved/Pending:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600 text-[10px] font-bold">{safeJobData.approved_count}</span>
                    <span className={`${textMuted} text-[10px]`}>/</span>
                    <span className="text-orange-600 text-[10px] font-bold">{safeJobData.pending_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments Summary with Comments - Compact */}
            {safeJobData.assignments.length > 0 && (
              <CollapsibleSection
                title="Assignments"
                icon={Users}
                isExpanded={expandedSections.assignments}
                onToggle={() => toggleSection('assignments')}
                count={safeJobData.assignments.length}
                color="blue-600"
              >
                <div className="space-y-2">
                  {safeJobData.assignments.slice(0, 10).map((assignment, index) => {
                    const isVacant = assignment.is_vacancy || assignment.employee_name === 'VACANT';
                    const employeeName = isVacant 
                      ? (assignment.vacancy_position?.position_id || 'VACANT')
                      : (assignment.employee?.full_name || assignment.employee_name || 'Unknown');
                    
                    const hasComments = assignment.line_manager_comments || assignment.employee_comments;
                    
                    return (
                      <div key={assignment.id || index} className={`p-2.5 border ${borderColor} rounded-lg ${bgHover}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 flex-1">
                            {isVacant ? (
                              <UserVacant size={12} className="text-orange-600 flex-shrink-0" />
                            ) : (
                              <UserCheck size={12} className="text-green-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold ${textPrimary} text-[11px] truncate`}>
                                {employeeName}
                              </p>
                              {assignment.employee?.employee_id && (
                                <p className={`text-[9px] ${textMuted}`}>
                                  ID: {assignment.employee.employee_id}
                                </p>
                              )}
                              {assignment.reports_to?.full_name && (
                                <p className={`text-[9px] ${textMuted}`}>
                                  Reports to: {assignment.reports_to.full_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {hasComments && (
                              <MessageSquare size={11} className="text-blue-600 flex-shrink-0" />
                            )}
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                              {getStatusIcon(assignment.status)}
                              {assignment.status_display?.status || assignment.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {/* LINE MANAGER COMMENTS - Compact */}
                        {assignment.line_manager_comments && (
                          <div className="mt-1.5 p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-1.5 mb-0.5">
                              <User size={9} className="text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300">
                                Manager Comment:
                              </span>
                            </div>
                            <p className={`text-[9px] ${textSecondary} leading-snug ml-3`}>
                              {assignment.line_manager_comments}
                            </p>
                          </div>
                        )}

                        {/* EMPLOYEE COMMENTS - Compact */}
                        {assignment.employee_comments && (
                          <div className="mt-1.5 p-1.5 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-1.5 mb-0.5">
                              <UserCheck size={9} className="text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[9px] font-bold text-green-700 dark:text-green-300">
                                Employee Comment:
                              </span>
                            </div>
                            <p className={`text-[9px] ${textSecondary} leading-snug ml-3`}>
                              {assignment.employee_comments}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {safeJobData.assignments.length > 10 && (
                    <div className="text-center pt-1.5">
                      <button
                        onClick={onViewAssignments}
                        className="text-almet-sapphire hover:text-almet-astral font-bold text-[10px] flex items-center gap-1.5 mx-auto"
                      >
                        <Eye size={11} />
                        View all {safeJobData.assignments.length} assignments
                      </button>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Job Purpose - Compact */}
            <div>
              <h4 className={`text-xs font-bold ${textPrimary} mb-2 flex items-center gap-1.5`}>
                <BookOpen size={13} />
                Job Purpose
              </h4>
              <div className={`p-2.5 ${bgAccent} rounded-lg`}>
                <p className={`${textSecondary} leading-relaxed text-[10px]`}>{safeJobData.job_purpose}</p>
              </div>
            </div>

            {/* Job Sections - Compact */}
            {safeJobData.sections.length > 0 && (
              <CollapsibleSection
                title="Job Sections"
                icon={BookOpen}
                isExpanded={expandedSections.sections}
                onToggle={() => toggleSection('sections')}
                count={safeJobData.sections.length}
              >
                <div className="space-y-2.5">
                  {safeJobData.sections.map((section, index) => (
                    <div key={index} className={`p-2.5 border ${borderColor} rounded-lg`}>
                      <h5 className={`font-bold ${textPrimary} mb-1.5 text-[11px]`}>
                        {section.title}
                      </h5>
                      <div className={`${textSecondary} text-[10px] whitespace-pre-line leading-relaxed`}>
                        {formatSectionContent(section.content)}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )} 

            {/* Required Skills - Compact */}
            {safeJobData.required_skills.length > 0 && (
              <CollapsibleSection
                title="Required Skills"
                icon={Target}
                isExpanded={expandedSections.skills}
                onToggle={() => toggleSection('skills')}
                count={safeJobData.required_skills.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {safeJobData.required_skills.map((skillItem, index) => (
                    <div key={skillItem.id || index} className={`p-2 ${bgAccent} rounded-lg`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${textPrimary} text-[10px]`}>
                          {skillItem.skill_detail?.name || `Skill ${index + 1}`}
                        </span>
                      </div>
                      <div className={`text-[9px] ${textMuted}`}>
                        <p>Group: <span className="font-semibold">{skillItem.skill_detail?.group_name || 'N/A'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Behavioral Competencies - Compact */}
            {safeJobData.behavioral_competencies.length > 0 && (
              <CollapsibleSection
                title="Behavioral Competencies"
                icon={User}
                isExpanded={expandedSections.behavioral}
                onToggle={() => toggleSection('behavioral')}
                count={safeJobData.behavioral_competencies.length}
                color="blue-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {safeJobData.behavioral_competencies.map((compItem, index) => (
                    <div key={compItem.id || index} className={`p-2 ${bgAccent} rounded-lg border-l-2 border-blue-500`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${textPrimary} text-[10px]`}>
                          {compItem.competency_detail?.name || `Competency ${index + 1}`}
                        </span>
                      </div>
                      <div className={`text-[9px] ${textMuted}`}>
                        <p>Group: <span className="font-semibold">{compItem.competency_detail?.group_name || 'N/A'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Leadership Competencies - Compact */}
            {safeJobData.leadership_competencies.length > 0 && (
              <CollapsibleSection
                title="Leadership Competencies"
                icon={Crown}
                isExpanded={expandedSections.leadership}
                onToggle={() => toggleSection('leadership')}
                count={safeJobData.leadership_competencies.length}
                color="purple-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {safeJobData.leadership_competencies.map((leadershipItem, index) => (
                    <div key={leadershipItem.id || index} className={`p-2 ${bgAccent} rounded-lg border-l-2 border-purple-500`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${textPrimary} text-[10px] flex items-center gap-1`}>
                          <Crown size={11} className="text-purple-600" />
                          {leadershipItem.leadership_item_detail?.name || 
                           leadershipItem.item_detail?.name || 
                           `Leadership Item ${index + 1}`}
                        </span>
                      </div>
                      <div className={`text-[9px] ${textMuted} space-y-0.5`}>
                        {leadershipItem.leadership_item_detail?.child_group_name && (
                          <p>
                            Category: <span className="font-semibold">{leadershipItem.leadership_item_detail.child_group_name}</span>
                          </p>
                        )}
                        {leadershipItem.leadership_item_detail?.main_group_name && (
                          <p>
                            Main Group: <span className="font-semibold">{leadershipItem.leadership_item_detail.main_group_name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Business Resources - Compact */}
            <CollapsibleSection
              title="Business Resources"
              icon={Package}
              isExpanded={expandedSections.resources}
              onToggle={() => toggleSection('resources')}
              count={safeJobData.business_resources.length}
              isEmpty={safeJobData.business_resources.length === 0}
            >
              <div className="space-y-2.5">
                {safeJobData.business_resources.map((resource, index) => (
                  <div key={resource.id || index} className={`p-2.5 border ${borderColor} rounded-lg ${bgHover}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h6 className={`font-bold ${textPrimary} text-[11px] mb-0.5 flex items-center gap-1.5`}>
                          <Package size={11} className="text-almet-sapphire" />
                          {resource.resource_detail?.name || `Resource ${index + 1}`}
                        </h6>
                        {resource.resource_detail?.description && (
                          <p className={`text-[9px] ${textSecondary} mb-1.5`}>
                            {resource.resource_detail.description}
                          </p>
                        )}
                      </div>
                      {resource.has_specific_items ? (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] rounded-full font-semibold">
                          Specific Items
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] rounded-full font-semibold">
                          All Items
                        </span>
                      )}
                    </div>
                    
                    {resource.has_specific_items && resource.specific_items_detail && resource.specific_items_detail.length > 0 ? (
                      <div className={`mt-2 pt-2 border-t ${borderColor}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Layers size={10} className={textMuted} />
                          <span className={`text-[9px] font-bold ${textMuted}`}>Selected Items:</span>
                        </div>
                        <div className="space-y-1.5">
                          {resource.specific_items_detail.map((item) => (
                            <div key={item.id} className={`flex items-center gap-1.5 p-1.5 rounded ${bgAccent}`}>
                              <Check size={10} className="text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-semibold ${textPrimary}`}>{item.name}</p>
                                {item.description && (
                                  <p className={`text-[9px] ${textMuted} truncate`}>{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-2 pt-2 border-t ${borderColor}`}>
                        <div className="flex items-center gap-1.5">
                          <Check size={10} className="text-green-600" />
                          <span className={`text-[9px] ${textSecondary}`}>
                            All items included ({resource.resource_detail?.items_count || 0} items)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Access Rights - Compact */}
            <CollapsibleSection
              title="Access Rights"
              icon={Shield}
              isExpanded={expandedSections.access}
              onToggle={() => toggleSection('access')}
              count={safeJobData.access_rights.length}
              isEmpty={safeJobData.access_rights.length === 0}
            >
              <div className="space-y-2.5">
                {safeJobData.access_rights.map((access, index) => (
                  <div key={access.id || index} className={`p-2.5 border ${borderColor} rounded-lg ${bgHover}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h6 className={`font-bold ${textPrimary} text-[11px] mb-0.5 flex items-center gap-1.5`}>
                          <Shield size={11} className="text-almet-sapphire" />
                          {access.access_detail?.name || `Access ${index + 1}`}
                        </h6>
                        {access.access_detail?.description && (
                          <p className={`text-[9px] ${textSecondary} mb-1.5`}>
                            {access.access_detail.description}
                          </p>
                        )}
                      </div>
                      {access.has_specific_items ? (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] rounded-full font-semibold">
                          Specific Items
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] rounded-full font-semibold">
                          Full Access
                        </span>
                      )}
                    </div>
                    
                    {access.has_specific_items && access.specific_items_detail && access.specific_items_detail.length > 0 ? (
                      <div className={`mt-2 pt-2 border-t ${borderColor}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Layers size={10} className={textMuted} />
                          <span className={`text-[9px] font-bold ${textMuted}`}>Access Granted To:</span>
                        </div>
                        <div className="space-y-1.5">
                          {access.specific_items_detail.map((item) => (
                            <div key={item.id} className={`flex items-center gap-1.5 p-1.5 rounded ${bgAccent}`}>
                              <Check size={10} className="text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-semibold ${textPrimary}`}>{item.name}</p>
                                {item.description && (
                                  <p className={`text-[9px] ${textMuted} truncate`}>{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-2 pt-2 border-t ${borderColor}`}>
                        <div className="flex items-center gap-1.5">
                          <Check size={10} className="text-green-600" />
                          <span className={`text-[9px] ${textSecondary}`}>
                            Full access granted ({access.access_detail?.items_count || 0} items)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Company Benefits - Compact */}
            <CollapsibleSection
              title="Company Benefits"
              icon={Gift}
              isExpanded={expandedSections.benefits}
              onToggle={() => toggleSection('benefits')}
              count={safeJobData.company_benefits.length}
              isEmpty={safeJobData.company_benefits.length === 0}
            >
              <div className="space-y-2.5">
                {safeJobData.company_benefits.map((benefit, index) => (
                  <div key={benefit.id || index} className={`p-2.5 border ${borderColor} rounded-lg ${bgHover}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h6 className={`font-bold ${textPrimary} text-[11px] mb-0.5 flex items-center gap-1.5`}>
                          <Gift size={11} className="text-almet-sapphire" />
                          {benefit.benefit_detail?.name || `Benefit ${index + 1}`}
                        </h6>
                        {benefit.benefit_detail?.description && (
                          <p className={`text-[9px] ${textSecondary} mb-1.5`}>
                            {benefit.benefit_detail.description}
                          </p>
                        )}
                      </div>
                      {benefit.has_specific_items ? (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] rounded-full font-semibold">
                          Specific Items
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] rounded-full font-semibold">
                          All Items
                        </span>
                      )}
                    </div>
                    
                    {benefit.has_specific_items && benefit.specific_items_detail && benefit.specific_items_detail.length > 0 ? (
                      <div className={`mt-2 pt-2 border-t ${borderColor}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Layers size={10} className={textMuted} />
                          <span className={`text-[9px] font-bold ${textMuted}`}>Selected Benefits:</span>
                        </div>
                        <div className="space-y-1.5">
                          {benefit.specific_items_detail.map((item) => (
                            <div key={item.id} className={`flex items-center gap-1.5 p-1.5 rounded ${bgAccent}`}>
                              <Check size={10} className="text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-semibold ${textPrimary}`}>{item.name}</p>
                                {item.description && (
                                  <p className={`text-[9px] ${textMuted} truncate`}>{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-2 pt-2 border-t ${borderColor}`}>
                        <div className="flex items-center gap-1.5">
                          <Check size={10} className="text-green-600" />
                          <span className={`text-[9px] ${textSecondary}`}>
                            All benefits included ({benefit.benefit_detail?.items_count || 0} items)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Created/Updated Info - Compact */}
            <div className={`flex items-center justify-between p-2.5 ${bgAccent} rounded-lg text-[9px] ${textMuted}`}>
              <div className="flex items-center gap-3">
                {safeJobData.created_at && (
                  <span>
                    Created: {new Date(safeJobData.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                )}
                {safeJobData.updated_at && (
                  <span>
                    Updated: {new Date(safeJobData.updated_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold">Version:</span>
                <span>{safeJobData.version}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;