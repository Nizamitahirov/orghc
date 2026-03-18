// components/orgChart/JobDescriptionModal.jsx
'use client'
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Download, CheckCircle, Clock, AlertCircle, Target, Briefcase, Award,
  Building2, Shield, Crown, User, UserCheck, UserX as UserVacant, Users,
  MessageSquare, XCircle, RefreshCw, ChevronDown, ChevronUp, Hash,
  BookOpen, Package, Gift, Check, Layers
} from 'lucide-react';
import jobDescriptionService from '@/services/jobDescriptionService';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  DRAFT:                { label: 'Draft',               cls: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',          Icon: Briefcase },
  PENDING_LINE_MANAGER: { label: 'Pending Line Manager', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',   Icon: Clock },
  PENDING_EMPLOYEE:     { label: 'Pending Employee',     cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',           Icon: Clock },
  APPROVED:             { label: 'Approved',             cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',   Icon: CheckCircle },
  REJECTED:             { label: 'Rejected',             cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',          Icon: XCircle },
  REVISION_REQUIRED:    { label: 'Revision Required',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', Icon: RefreshCw },
  ALL_APPROVED:         { label: 'All Approved',         cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',   Icon: CheckCircle },
  ALL_DRAFT:            { label: 'All Draft',            cls: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',          Icon: Briefcase },
  PENDING_APPROVALS:    { label: 'Pending Approvals',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',   Icon: Clock },
  HAS_REJECTIONS:       { label: 'Has Rejections',       cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',          Icon: XCircle },
  NO_ASSIGNMENTS:       { label: 'No Assignments',       cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',         Icon: AlertCircle },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.DRAFT;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.cls}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
};

// ─── Collapsible section ──────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, count, defaultOpen = true, isEmpty, children, accent = 'text-almet-sapphire' }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
      <button
        onClick={() => !isEmpty && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors
          bg-gray-50 dark:bg-slate-700/50
          ${isEmpty ? 'opacity-60 cursor-default' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className={isEmpty ? 'text-gray-400' : accent} />
          <span className="text-xs font-semibold text-slate-800 dark:text-gray-100">{title}</span>
          {count != null && count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-almet-sapphire text-white">{count}</span>
          )}
          {isEmpty && <span className="text-[10px] text-gray-400 italic">No data</span>}
        </div>
        {!isEmpty && (open
          ? <ChevronUp size={13} className="text-gray-400" />
          : <ChevronDown size={13} className="text-gray-400" />)}
      </button>
      {!isEmpty && open && <div className="px-3 pb-3 pt-2">{children}</div>}
    </div>
  );
};

// ─── Numbered content renderer ────────────────────────────────────────────────
const NumberedContent = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n')
    .map(l => l.replace(/^[\d]+[.)]\s*|^[•\-\*]\s*/, '').trim())
    .filter(Boolean);
  return (
    <ol className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-almet-sapphire/10 text-almet-sapphire
            text-[9px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
};

// ─── Tag chip ─────────────────────────────────────────────────────────────────
const Tag = ({ label, sub, colorClass = 'bg-almet-sapphire/10 text-almet-sapphire' }) => (
  <div className={`inline-flex flex-col px-2.5 py-1 rounded-lg text-[10px] font-medium ${colorClass}`}>
    <span>{label}</span>
    {sub && <span className="text-[9px] opacity-70 mt-0.5">{sub}</span>}
  </div>
);

// ─── Resource row ─────────────────────────────────────────────────────────────
const ResourceRow = ({ name, description, hasSpecific, items }) => (
  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
    <div className="flex items-start justify-between gap-2 mb-1">
      <p className="text-[11px] font-semibold text-slate-800 dark:text-gray-100">{name}</p>
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium flex-shrink-0
        ${hasSpecific ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
        {hasSpecific ? 'Specific' : 'All items'}
      </span>
    </div>
    {description && <p className="text-[10px] text-gray-500 mb-1.5">{description}</p>}
    {hasSpecific && items?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-1">
        {items.map(item => (
          <span key={item.id} className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 dark:bg-slate-700
            border border-gray-200 dark:border-slate-600 rounded text-[10px] text-gray-700 dark:text-gray-300">
            <Check size={9} className="text-green-500" /> {item.name}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const JobDescriptionModal = ({
  showJobDescriptionModal,
  setShowJobDescriptionModal,
  jobDetail: initialJobDetail,
  setJobDetail,
  darkMode
}) => {
  const [jobDetail, setLocalJobDetail] = useState(initialJobDetail);
  const [loading, setLoading] = useState(false);
  const [assignTab, setAssignTab] = useState('all');

  useEffect(() => {
    const fetchFull = async () => {
      if (!showJobDescriptionModal || !initialJobDetail?.id) return;
      try {
        setLoading(true);
        const [fullDetail, assignmentsData] = await Promise.all([
          jobDescriptionService.getJobDescription(initialJobDetail.id),
          jobDescriptionService.getJobDescriptionAssignments(initialJobDetail.id),
        ]);
        const enriched = {
          ...fullDetail,
          assignments: assignmentsData.assignments || [],
          total_assignments: assignmentsData.total_assignments || 0,
          employee_assignments_count: assignmentsData.summary?.employees || 0,
          vacancy_assignments_count: assignmentsData.summary?.vacancies || 0,
          approved_count: assignmentsData.summary?.approved || 0,
          pending_count: assignmentsData.summary?.pending || 0,
          overall_status: assignmentsData.summary?.status || 'UNKNOWN',
        };
        setLocalJobDetail(enriched);
        setJobDetail(enriched);
      } catch (err) {
        console.error('Error fetching job description:', err);
        setLocalJobDetail(initialJobDetail);
      } finally {
        setLoading(false);
      }
    };
    fetchFull();
  }, [showJobDescriptionModal, initialJobDetail?.id]);

  if (!showJobDescriptionModal || !jobDetail) return null;

  const handleClose = () => {
    setShowJobDescriptionModal(false);
    setJobDetail(null);
    setLocalJobDetail(null);
  };

  const d = jobDetail;
  const assignments = d.assignments || [];
  const filteredAssignments = assignTab === 'all'
    ? assignments
    : assignments.filter(a => a.status === assignTab);

  const fmt = (dt) => dt
    ? new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100000] p-3 md:p-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh]
        flex flex-col border border-gray-200 dark:border-slate-600 shadow-2xl">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-600 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-almet-sapphire text-white p-2 rounded-lg flex-shrink-0">
              <Briefcase size={14} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-800 dark:text-gray-100 truncate">
                {d.job_title || 'Job Description'}
              </h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {d.business_function?.name}{d.department?.name ? ` · ${d.department.name}` : ''}
                {d.unit?.name ? ` · ${d.unit.name}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {loading && <RefreshCw size={14} className="text-almet-sapphire animate-spin" />}
            <button
              onClick={() => jobDescriptionService.downloadJobDescriptionPDF(d.id)}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-almet-sapphire hover:bg-almet-astral
                text-white rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-50"
            >
              <Download size={11} /> PDF
            </button>
            <button onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-100
                hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-7 h-7 text-almet-sapphire animate-spin" />
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-4 space-y-3">

            {/* 1. Meta strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Status',       value: <StatusBadge status={d.overall_status} /> },
                { label: 'Job Function', value: d.job_function?.name || '—' },
                { label: 'Hierarchy',    value: d.position_group?.display_name || d.position_group?.name || '—' },
                { label: 'Grades',       value: d.grading_levels?.length ? d.grading_levels.join(', ') : d.grading_level || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                  <div className="text-[11px] font-semibold text-slate-800 dark:text-gray-100">{value}</div>
                </div>
              ))}
            </div>

       

            {/* 3. Job Purpose */}
            {d.job_purpose && (
              <div>
                <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider
                  text-gray-400 dark:text-gray-500 mb-1.5">
                  <Target size={11} /> Job Purpose
                </h4>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed
                  bg-gray-50 dark:bg-slate-700/40 rounded-xl px-3 py-2.5">{d.job_purpose}</p>
              </div>
            )}

            {/* 4. Sections */}
            {d.sections?.length > 0 && (
              <Section title="Job Sections" icon={BookOpen} count={d.sections.length} defaultOpen>
                <div className="space-y-4 pt-1">
                  {d.sections.map((sec, i) => (
                    <div key={i}>
                      <h5 className="text-[11px] font-semibold text-slate-800 dark:text-gray-100 mb-2">{sec.title}</h5>
                      <NumberedContent content={sec.content} />
                      {i < d.sections.length - 1 && (
                        <hr className="mt-4 border-gray-100 dark:border-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

       
            {/* 6. Skills */}
            {d.required_skills?.length > 0 && (
              <Section title="Required Skills" icon={Award} count={d.required_skills.length} defaultOpen>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {d.required_skills.map((s, i) => (
                    <Tag key={s.id || i}
                      label={s.skill_detail?.name || `Skill ${i + 1}`}
                      sub={s.skill_detail?.group_name}
                      colorClass="bg-almet-sapphire/10 text-almet-sapphire" />
                  ))}
                </div>
              </Section>
            )}

            {/* 7. Behavioral */}
            {d.behavioral_competencies?.length > 0 && (
              <Section title="Behavioral Competencies" icon={User} count={d.behavioral_competencies.length} defaultOpen accent="text-blue-600">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {d.behavioral_competencies.map((c, i) => (
                    <Tag key={c.id || i}
                      label={c.competency_detail?.name || `Competency ${i + 1}`}
                      sub={c.competency_detail?.group_name}
                      colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                  ))}
                </div>
              </Section>
            )}

            {/* 8. Leadership */}
            {d.leadership_competencies?.length > 0 && (
              <Section title="Leadership Competencies" icon={Crown} count={d.leadership_competencies.length} defaultOpen accent="text-purple-600">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {d.leadership_competencies.map((l, i) => (
                    <Tag key={l.id || i}
                      label={l.leadership_item_detail?.name || l.item_detail?.name || `Item ${i + 1}`}
                      sub={l.leadership_item_detail?.child_group_name}
                      colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
                  ))}
                </div>
              </Section>
            )}

            {/* 9. Resources / Access / Benefits */}
            {[
              { title: 'Business Resources', icon: Package,  items: d.business_resources, nameKey: 'resource_detail' },
              { title: 'Access Rights',      icon: Shield,   items: d.access_rights,      nameKey: 'access_detail' },
              { title: 'Company Benefits',   icon: Gift,     items: d.company_benefits,    nameKey: 'benefit_detail' },
            ].map(({ title, icon, items, nameKey }) => (
              <Section key={title} title={title} icon={icon} count={items?.length}
                isEmpty={!items?.length} defaultOpen={false}>
                <div className="space-y-2 pt-1">
                  {items?.map((item, i) => (
                    <ResourceRow key={item.id || i}
                      name={item[nameKey]?.name || `Item ${i + 1}`}
                      description={item[nameKey]?.description}
                      hasSpecific={item.has_specific_items}
                      items={item.specific_items_detail} />
                  ))}
                </div>
              </Section>
            ))}

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
              <div className="flex gap-4">
                <span>Created: {fmt(d.created_at)}</span>
                <span>Updated: {fmt(d.updated_at)}</span>
              </div>
              <span className="flex items-center gap-1"><Hash size={10} /> v{d.version || 1}</span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ─── Named exports (backward compat) ─────────────────────────────────────────
export const BasicInfoCard = ({ jobDetail, bgAccent, textHeader, textMuted, textPrimary }) => (
  <div className={`p-3 ${bgAccent} rounded-xl`}>
    <h3 className={`text-sm font-bold ${textHeader} mb-2`}>{jobDetail.job_title}</h3>
    <div className="grid grid-cols-2 gap-2 text-[10px]">
      {[
        ['Company',        jobDetail.business_function?.name],
        ['Department',     jobDetail.department?.name],
        ['Unit',           jobDetail.unit?.name || 'N/A'],
        ['Job Function',   jobDetail.job_function?.name || 'N/A'],
        ['Hierarchy',      jobDetail.position_group?.display_name || jobDetail.position_group?.name],
        ['Grading Levels', jobDetail.grading_levels?.length ? jobDetail.grading_levels.join(', ') : jobDetail.grading_level || 'N/A'],
      ].map(([label, value]) => (
        <div key={label}>
          <span className={`font-bold ${textMuted}`}>{label}:</span>
          <p className={`${textPrimary} mt-0.5`}>{value}</p>
        </div>
      ))}
    </div>
  </div>
);

export const JobPurposeCard   = ({ jobDetail, bgAccent, textHeader, textSecondary }) => null; // merged into main
export const JobSectionsCard  = () => null;

export const RequiredSkillsCard = () => null;
export const BehavioralCompetenciesCard = () => null;
export const LeadershipCompetenciesCard = () => null;
export const ListCard = () => null;

export default JobDescriptionModal;