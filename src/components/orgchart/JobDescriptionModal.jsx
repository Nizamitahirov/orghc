// components/orgChart/JobDescriptionModal.jsx - UPDATED: Proper API Integration for Multi-Assignment
'use client'
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Download, CheckCircle, Clock, AlertCircle, 
    Target, Briefcase, Award, Building2, Shield, Crown, User,
    UserCheck, UserX as UserVacant, Users, MessageSquare, XCircle, RefreshCw
} from 'lucide-react';
import jobDescriptionService from '@/services/jobDescriptionService';

const JobDescriptionModal = ({ 
    showJobDescriptionModal,
    setShowJobDescriptionModal,
    jobDetail: initialJobDetail,
    setJobDetail,
    darkMode
}) => {
    const [jobDetail, setLocalJobDetail] = useState(initialJobDetail);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch full job description with assignments when modal opens
    useEffect(() => {
        const fetchFullJobDescription = async () => {
            if (showJobDescriptionModal && initialJobDetail?.id) {
                try {
                    setLoading(true);
                    
                    // Fetch full job description detail with all nested data
                    const fullDetail = await jobDescriptionService.getJobDescription(initialJobDetail.id);
                    
                    // Fetch assignments for this job description
                    const assignmentsData = await jobDescriptionService.getJobDescriptionAssignments(initialJobDetail.id);
                    
                    // Merge assignments into job detail
                    const enrichedDetail = {
                        ...fullDetail,
                        assignments: assignmentsData.assignments || [],
                        total_assignments: assignmentsData.total_assignments || 0,
                        employee_assignments_count: assignmentsData.summary?.employees || 0,
                        vacancy_assignments_count: assignmentsData.summary?.vacancies || 0,
                        approved_count: assignmentsData.summary?.approved || 0,
                        pending_count: assignmentsData.summary?.pending || 0,
                        overall_status: assignmentsData.summary?.status || 'UNKNOWN'
                    };
                    
                    setLocalJobDetail(enrichedDetail);
                    setJobDetail(enrichedDetail);
                    
                } catch (error) {
                    console.error('Error fetching full job description:', error);
                    // Keep using initial data if fetch fails
                    setLocalJobDetail(initialJobDetail);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFullJobDescription();
    }, [showJobDescriptionModal, initialJobDetail?.id]);

    if (!showJobDescriptionModal || !jobDetail) return null;

    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const textPrimary = darkMode ? "text-gray-200" : "text-almet-comet";
    const bgAccent = darkMode ? "bg-slate-700" : "bg-almet-mystic";
    const bgHover = darkMode ? "bg-slate-600" : "bg-gray-50";



    const handleClose = () => {
        setShowJobDescriptionModal(false);
        setJobDetail(null);
        setLocalJobDetail(null);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
            <div className={`${bgCard} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
                <div className="p-4">
                    {/* Modal Header - Compact */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-slate-600">
                        <div>
                            <h2 className={`text-base font-bold ${textHeader} mb-1.5`}>
                                Job Description Details
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                  
                                <span className={`text-[10px] ${textMuted}`}>
                                    Created {jobDescriptionService.formatDate(jobDetail.created_at)}
                                </span>
                                {/* ✅ Show total assignments count */}
                                <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                                    <Users size={10} />
                                    {jobDetail.total_assignments || jobDetail.assignments?.length || 0} Assignments
                                </span>
                                {loading && (
                                    <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                                        <RefreshCw size={10} className="animate-spin" />
                                        Loading...
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    jobDescriptionService.downloadJobDescriptionPDF(jobDetail.id);
                                }}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-colors text-[10px] font-semibold disabled:opacity-50"
                            >
                                <Download size={12} />
                                Download PDF
                            </button>
                            <button
                                onClick={handleClose}
                                className={`p-1.5 ${textMuted} hover:${textPrimary} transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700`}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-almet-sapphire animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Left Column - Main Content */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Basic Information */}
                                <BasicInfoCard
                                    jobDetail={jobDetail}
                                    bgAccent={bgAccent}
                                    textHeader={textHeader}
                                    textMuted={textMuted}
                                    textPrimary={textPrimary}
                                />

                                {/* ✅ Assignments Summary with Comments */}
                                {jobDetail.assignments && jobDetail.assignments.length > 0 && (
                                    <AssignmentsSummaryCard
                                        assignments={jobDetail.assignments}
                                        bgAccent={bgAccent}
                                        bgHover={bgHover}
                                        borderColor={borderColor}
                                        textHeader={textHeader}
                                        textMuted={textMuted}
                                        textPrimary={textPrimary}
                                        textSecondary={textSecondary}
                                    />
                                )}

                                {/* Job Purpose */}
                                <JobPurposeCard
                                    jobDetail={jobDetail}
                                    bgAccent={bgAccent}
                                    textHeader={textHeader}
                                    textSecondary={textSecondary}
                                />

                                {/* Job Sections */}
                                {jobDetail.sections && jobDetail.sections.length > 0 && (
                                    <JobSectionsCard
                                        sections={jobDetail.sections}
                                        bgAccent={bgAccent}
                                        textHeader={textHeader}
                                        textSecondary={textSecondary}
                                    />
                                )}
                            </div>

                            {/* Right Column - Sidebar */}
                            <div className="space-y-4">
                             

                                {/* Required Skills */}
                                {jobDetail.required_skills && jobDetail.required_skills.length > 0 && (
                                    <RequiredSkillsCard
                                        skills={jobDetail.required_skills}
                                        bgAccent={bgAccent}
                                        borderColor={borderColor}
                                        textHeader={textHeader}
                                    />
                                )}

                                {/* Behavioral Competencies */}
                                {jobDetail.behavioral_competencies && jobDetail.behavioral_competencies.length > 0 && (
                                    <BehavioralCompetenciesCard
                                        competencies={jobDetail.behavioral_competencies}
                                        bgAccent={bgAccent}
                                        borderColor={borderColor}
                                        textHeader={textHeader}
                                    />
                                )}

                                {/* Leadership Competencies */}
                                {jobDetail.leadership_competencies && jobDetail.leadership_competencies.length > 0 && (
                                    <LeadershipCompetenciesCard
                                        competencies={jobDetail.leadership_competencies}
                                        bgAccent={bgAccent}
                                        borderColor={borderColor}
                                        textHeader={textHeader}
                                        textMuted={textMuted}
                                    />
                                )}

                                {/* Business Resources */}
                                {jobDetail.business_resources && jobDetail.business_resources.length > 0 && (
                                    <ListCard
                                        title="Business Resources"
                                        icon={Building2}
                                        items={jobDetail.business_resources}
                                        bgAccent={bgAccent}
                                        borderColor={borderColor}
                                        textHeader={textHeader}
                                        textSecondary={textSecondary}
                                    />
                                )}

                                {/* Access Rights */}
                                {jobDetail.access_rights && jobDetail.access_rights.length > 0 && (
                                    <ListCard
                                        title="Access Rights"
                                        icon={Shield}
                                        items={jobDetail.access_rights}
                                        bgAccent={bgAccent}
                                        borderColor={borderColor}
                                        textHeader={textHeader}
                                        textSecondary={textSecondary}
                                    />
                                )}

                                {/* Company Benefits */}
                                {jobDetail.company_benefits && jobDetail.company_benefits.length > 0 && (
                                    <ListCard
                                        title="Company Benefits"
                                        icon={Award}
                                        items={jobDetail.company_benefits}
                                        bgAccent={bgAccent}
                                        borderColor={borderColor}
                                        textHeader={textHeader}
                                        textSecondary={textSecondary}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// ✅ COMPACT: Basic Info Card
export const BasicInfoCard = ({ jobDetail, bgAccent, textHeader, textMuted, textPrimary }) => (
    <div className={`p-3 ${bgAccent} rounded-xl`}>
        <h3 className={`text-sm font-bold ${textHeader} mb-2`}>{jobDetail.job_title}</h3>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
            <InfoItem label="Company" value={jobDetail.business_function?.name} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem label="Department" value={jobDetail.department?.name} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem label="Unit" value={jobDetail.unit?.name || 'N/A'} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem label="Job Function" value={jobDetail.job_function?.name || 'N/A'} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem 
                label="Hierarchy" 
                value={jobDetail.position_group?.display_name || jobDetail.position_group?.name} 
                textMuted={textMuted} 
                textPrimary={textPrimary} 
            />
            <InfoItem 
                label="Grading Levels" 
                value={jobDetail.grading_levels?.length > 0 ? jobDetail.grading_levels.join(', ') : jobDetail.grading_level || 'N/A'} 
                textMuted={textMuted} 
                textPrimary={textPrimary} 
            />
        </div>
    </div>
);

const InfoItem = ({ label, value, textMuted, textPrimary, isVacant }) => (
    <div>
        <span className={`font-bold ${textMuted}`}>{label}:</span>
        <p className={`${textPrimary} mt-0.5 ${isVacant ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}`}>
            {isVacant && <AlertCircle size={11} className="inline mr-1" />}
            {value}
        </p>
    </div>
);

// ✅ COMPACT: Assignments Summary Card with Comments
export const AssignmentsSummaryCard = ({ 
    assignments, bgAccent, bgHover, borderColor, textHeader, textMuted, textPrimary, textSecondary 
}) => (
    <div className={`p-3 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`text-xs font-bold ${textHeader} mb-2 flex items-center gap-1.5`}>
            <Users size={13} className="text-almet-sapphire" />
            Assignments ({assignments.length})
        </h4>
        <div className="space-y-2 max-h-80 overflow-y-auto">
            {assignments.map((assignment, index) => {
                const isVacant = assignment.is_vacancy || assignment.employee_name === 'VACANT';
                const employeeName = isVacant 
                    ? (assignment.vacancy_position?.position_id || 'VACANT')
                    : (assignment.employee?.full_name || assignment.employee_name || 'Unknown');
                
                const hasComments = assignment.line_manager_comments || assignment.employee_comments;
                
                return (
                    <div key={assignment.id || index} className={`p-2 ${bgHover} rounded-lg border ${borderColor}`}>
                        {/* Employee/Vacancy Info */}
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5 flex-1">
                                {isVacant ? (
                                    <UserVacant size={11} className="text-orange-600 flex-shrink-0" />
                                ) : (
                                    <UserCheck size={11} className="text-green-600 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[10px] font-bold ${textPrimary} truncate`}>
                                        {employeeName}
                                    </p>
                                    {assignment.employee?.employee_id && (
                                        <p className={`text-[9px] ${textMuted}`}>
                                            ID: {assignment.employee.employee_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {hasComments && (
                                    <MessageSquare size={10} className="text-blue-600" />
                                )}
                                {assignment.status === 'APPROVED' ? (
                                    <CheckCircle size={10} className="text-green-600" />
                                ) : assignment.status === 'REJECTED' ? (
                                    <XCircle size={10} className="text-red-600" />
                                ) : (
                                    <Clock size={10} className="text-orange-600" />
                                )}
                            </div>
                        </div>

                        {/* Status Badge */}
                        {assignment.status_display && (
                            <div className="mb-1.5">
                                <span 
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                                    style={{
                                        color: assignment.status_display.color,
                                        backgroundColor: assignment.status_display.color + '20'
                                    }}
                                >
                                    {assignment.status_display.status}
                                </span>
                            </div>
                        )}

                        {/* ✅ APPROVAL DATES */}
                        {(assignment.line_manager_approved_at || assignment.employee_approved_at) && (
                            <div className={`text-[9px] ${textMuted} space-y-0.5 mb-1.5`}>
                                {assignment.line_manager_approved_at && (
                                    <div className="flex items-center gap-1">
                                        <CheckCircle size={7} className="text-green-500" />
                                        <span>Manager: {jobDescriptionService.formatDateTime(assignment.line_manager_approved_at)}</span>
                                    </div>
                                )}
                                {assignment.employee_approved_at && (
                                    <div className="flex items-center gap-1">
                                        <CheckCircle size={7} className="text-green-500" />
                                        <span>Employee: {jobDescriptionService.formatDateTime(assignment.employee_approved_at)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ✅ LINE MANAGER COMMENTS */}
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

                        {/* ✅ EMPLOYEE COMMENTS */}
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
            
            {assignments.length > 10 && (
                <p className={`text-center text-[9px] ${textMuted} pt-1.5`}>
                    +{assignments.length - 10} more assignments
                </p>
            )}
        </div>
    </div>
);


const StatItem = ({ label, value, icon, textMuted }) => (
    <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold ${textMuted} flex items-center gap-1`}>
            {icon}
            {label}
        </span>
        <span className="text-[10px] font-bold text-almet-sapphire dark:text-almet-steel-blue">
            {value}
        </span>
    </div>
);

// ✅ COMPACT: Job Purpose Card
export const JobPurposeCard = ({ jobDetail, bgAccent, textHeader, textSecondary }) => (
    <div>
        <h4 className={`text-xs font-bold ${textHeader} mb-1.5 flex items-center gap-1.5`}>
            <Target size={13} className="text-almet-sapphire" />
            Job Purpose
        </h4>
        <div className={`p-2.5 ${bgAccent} rounded-xl`}>
            <p className={`${textSecondary} leading-relaxed text-[10px]`}>{jobDetail.job_purpose}</p>
        </div>
    </div>
);

// ✅ COMPACT: Job Sections Card
export const JobSectionsCard = ({ sections, bgAccent, textHeader, textSecondary }) => (
    <div className="space-y-3">
        {sections.map((section, index) => (
            <div key={index}>
                <h4 className={`text-xs font-bold ${textHeader} mb-1.5 flex items-center gap-1.5`}>
                    <Briefcase size={13} className="text-almet-sapphire" />
                    {section.title}
                </h4>
                <div className={`p-2.5 ${bgAccent} rounded-xl`}>
                    <div className={`${textSecondary} leading-relaxed whitespace-pre-line text-[10px]`}>
                        {section.content}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// ✅ COMPACT: Required Skills Card
export const RequiredSkillsCard = ({ skills, bgAccent, borderColor, textHeader }) => (
    <div className={`p-3 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-2 flex items-center gap-1.5 text-xs`}>
            <Award size={13} className="text-almet-sapphire" />
            Required Skills
        </h4>
        <div className="space-y-1.5">
            {skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between py-0.5">
                    <span className="inline-block bg-blue-100 dark:bg-almet-sapphire/20 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                        {skill.skill_detail?.name || skill.name}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

// ✅ COMPACT: Behavioral Competencies Card
export const BehavioralCompetenciesCard = ({ competencies, bgAccent, borderColor, textHeader }) => (
    <div className={`p-3 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-2 flex items-center gap-1.5 text-xs`}>
            <User size={13} className="text-blue-600" />
            Behavioral Competencies
        </h4>
        <div className="space-y-1.5">
            {competencies.map((comp, index) => (
                <div key={index} className="flex items-center justify-between py-0.5">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                        {comp.competency_detail?.name || comp.name}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

// ✅ COMPACT: Leadership Competencies Card
export const LeadershipCompetenciesCard = ({ competencies, bgAccent, borderColor, textHeader, textMuted }) => (
    <div className={`p-3 ${bgAccent} rounded-xl border ${borderColor} border-l-4 border-l-purple-500`}>
        <h4 className={`font-bold ${textHeader} mb-2 flex items-center gap-1.5 text-xs`}>
            <Crown size={13} className="text-purple-600" />
            Leadership Competencies
        </h4>
        <div className="space-y-1.5">
            {competencies.map((comp, index) => (
                <div key={index} className="space-y-0.5">
                    <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                        <Crown size={8} className="inline mr-0.5" />
                        {comp.leadership_item_detail?.name || comp.item_detail?.name || comp.name}
                    </span>
                    {(comp.leadership_item_detail?.child_group_name || comp.leadership_item_detail?.main_group_name) && (
                        <div className={`text-[8px] ${textMuted} pl-2`}>
                            {comp.leadership_item_detail?.main_group_name && (
                                <span>{comp.leadership_item_detail.main_group_name}</span>
                            )}
                            {comp.leadership_item_detail?.child_group_name && (
                                <span> › {comp.leadership_item_detail.child_group_name}</span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

// ✅ COMPACT: List Card (Resources/Access/Benefits)
export const ListCard = ({ title, icon: Icon, items, bgAccent, borderColor, textHeader, textSecondary }) => (
    <div className={`p-3 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-2 flex items-center gap-1.5 text-xs`}>
            <Icon size={13} className="text-almet-sapphire" />
            {title}
        </h4>
        <div className="space-y-1">
            {items.map((item, index) => (
                <div key={index} className={`text-[10px] ${textSecondary} flex items-center gap-1.5`}>
                    <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                    {item.resource_detail?.name || item.access_detail?.name || item.benefit_detail?.name || item.name}
                </div>
            ))}
        </div>
    </div>
);

export default JobDescriptionModal;