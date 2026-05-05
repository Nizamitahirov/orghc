// components/jobDescription/JobViewModal.jsx — Readable layout redesign
import React, { useState } from 'react';
import {
  X, Download, UserCheck, UserX as UserVacant, Clock, CheckCircle, XCircle,
  RotateCcw, AlertCircle, Edit, Building, User, Target, BookOpen, Shield,
  Package, Gift, ChevronDown, ChevronUp, Layers, Award, Crown, Users, Eye,
  MessageSquare, Check, Hash, Briefcase
} from 'lucide-react';

import { capitalizeAcronyms } from '../../utils/formatText';

// ─── tiny helpers ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  DRAFT:               { label: 'Draft',                     cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',   Icon: Edit },
  PENDING_LINE_MANAGER:{ label: 'Pending Line Manager',      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', Icon: Clock },
  PENDING_EMPLOYEE:    { label: 'Pending Employee',          cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',    Icon: Clock },
  APPROVED:            { label: 'Approved',                  cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', Icon: CheckCircle },
  REJECTED:            { label: 'Rejected',                  cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',   Icon: XCircle },
  REVISION_REQUIRED:   { label: 'Revision Required',         cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', Icon: RotateCcw },
  ALL_APPROVED:        { label: 'All Approved',              cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', Icon: CheckCircle },
  ALL_DRAFT:           { label: 'All Draft',                 cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',   Icon: Edit },
  PENDING_APPROVALS:   { label: 'Pending Approvals',         cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', Icon: Clock },
  HAS_REJECTIONS:      { label: 'Has Rejections',            cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',   Icon: XCircle },
  NO_ASSIGNMENTS:      { label: 'No Assignments',            cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',  Icon: AlertCircle },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.DRAFT;
  const Icon = s.Icon;
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${px} ${s.cls}`}>
      <Icon size={11} /> {s.label}
    </span>
  );
};

// Collapsible section wrapper
const Section = ({ title, icon: Icon, count, defaultOpen = true, isEmpty, children, accent = 'text-almet-sapphire' }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-almet-comet rounded-xl overflow-hidden">
      <button
        onClick={() => !isEmpty && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
          ${isEmpty ? 'opacity-60 cursor-default' : 'hover:bg-gray-50 dark:hover:bg-almet-comet/40'}`}
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className={isEmpty ? 'text-gray-400' : accent} />
          <span className="font-semibold text-sm text-almet-cloud-burst dark:text-white">{title}</span>
          {count != null && count > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-almet-sapphire text-white">{count}</span>
          )}
          {isEmpty && <span className="text-xs text-gray-400 italic">No data</span>}
        </div>
        {!isEmpty && (open
          ? <ChevronUp size={14} className="text-gray-400" />
          : <ChevronDown size={14} className="text-gray-400" />)}
      </button>
      {!isEmpty && open && (
        <div className="px-4 pb-4 pt-1">{children}</div>
      )}
    </div>
  );
};

// Numbered list renderer
const NumberedContent = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n')
    .map(l => l.replace(/^[\d]+[.)]\s*|^[•\-\*]\s*/, '').trim())
    .filter(Boolean);
  return (
    <ol className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-almet-bali-hai leading-relaxed">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-almet-sapphire/10 text-almet-sapphire
            text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
};

// Tag chip
const Tag = ({ label, sub, colorClass = 'bg-almet-sapphire/10 text-almet-sapphire' }) => (
  <div className={`inline-flex flex-col px-3 py-1.5 rounded-lg text-xs font-medium ${colorClass}`}>
    <span>{label}</span>
    {sub && <span className="text-[10px] opacity-70 mt-0.5">{sub}</span>}
  </div>
);

// Resource row with items
const ResourceRow = ({ name, description, items, hasSpecific }) => (
  <div className="p-3 bg-gray-50 dark:bg-almet-comet/30 rounded-lg">
    <div className="flex items-start justify-between gap-2 mb-1">
      <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{name}</p>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0
        ${hasSpecific ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
        {hasSpecific ? 'Specific items' : 'All items'}
      </span>
    </div>
    {description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>}
    {hasSpecific && items?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {items.map(item => (
          <span key={item.id} className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-almet-cloud-burst
            border border-gray-200 dark:border-almet-comet rounded-md text-xs text-gray-700 dark:text-gray-300">
            <Check size={10} className="text-green-500" /> {item.name}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ─── Main modal ──────────────────────────────────────────────────────────────
const JobViewModal = ({ job, onClose, onDownloadPDF, onViewAssignments, darkMode }) => {
  const [assignTab, setAssignTab] = useState('all'); // 'all' | status filters

  if (!job?.id) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-6 max-w-sm w-full border border-gray-200 dark:border-almet-comet">
        <AlertCircle className="mx-auto mb-3 text-red-500" size={36} />
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">Could not load job description.</p>
        <button onClick={onClose} className="w-full py-2 bg-almet-sapphire text-white rounded-lg text-sm font-medium">Close</button>
      </div>
    </div>
  );

  const d = {
    job_title: capitalizeAcronyms(job.job_title || 'No Title'),
    job_purpose: job.job_purpose || '',
    bf: job.business_function?.name || '',
    dept: job.department?.name || '',
    unit: job.unit?.name || '',
    jf: job.job_function?.name || '',
    pg: job.position_group?.name || '',
    grades: job.grading_levels || (job.grading_level ? [job.grading_level] : []),
    overall: job.overall_status || 'UNKNOWN',
    assignments: job.assignments || [],
    total: job.total_assignments || 0,
    empCount: job.employee_assignments_count || 0,
    vacCount: job.vacancy_assignments_count || 0,
    approved: job.approved_count || 0,
    pending: job.pending_count || 0,
    sections: job.sections || [],
    skills: job.required_skills || [],
    behavioral: job.behavioral_competencies || [],
    leadership: job.leadership_competencies || [],
    resources: job.business_resources || [],
    access: job.access_rights || [],
    benefits: job.company_benefits || [],
    created: job.created_at,
    updated: job.updated_at,
    version: job.version || 1,
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  const filteredAssignments = assignTab === 'all'
    ? d.assignments
    : d.assignments.filter(a => a.status === assignTab);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 md:p-6">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl w-full max-w-5xl max-h-[92vh]
        flex flex-col border border-gray-200 dark:border-almet-comet shadow-2xl">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-almet-comet flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-almet-sapphire text-white p-2 rounded-lg flex-shrink-0">
              <Briefcase size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white truncate">{d.job_title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {d.bf}{d.dept ? ` · ${d.dept}` : ''}{d.unit ? ` · ${d.unit}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {onViewAssignments && d.total > 0 && (
              <button onClick={onViewAssignments}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                <Users size={13} /> Assignments
              </button>
            )}
            <button onClick={onDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-xs font-medium transition-colors">
              <Download size={13} /> PDF
            </button>
            <button onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* ── 1. Meta strip ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Status',      value: <StatusBadge status={d.overall} size="sm" /> },
              { label: 'Job Function',value: d.jf   || '—' },
              { label: 'Hierarchy',   value: d.pg   || '—' },
              { label: 'Grades',      value: d.grades.length ? d.grades.join(', ') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-almet-comet/40 rounded-xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{value}</div>
              </div>
            ))}
          </div>

          {/* ── 2. Assignment summary bar ── */}
          {d.total > 0 && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-almet-sapphire/5 dark:bg-almet-sapphire/10
              border border-almet-sapphire/20 rounded-xl text-sm">
              <span className="font-semibold text-almet-cloud-burst dark:text-white">{d.total} assignments</span>
              <span className="text-gray-400">·</span>
              <span className="flex items-center gap-1 text-green-600"><UserCheck size={13} /> {d.empCount} employees</span>
              <span className="flex items-center gap-1 text-orange-500"><UserVacant size={13} /> {d.vacCount} vacant</span>
              <span className="flex items-center gap-1 text-green-600"><CheckCircle size={13} /> {d.approved} approved</span>
              {d.pending > 0 && <span className="flex items-center gap-1 text-amber-500"><Clock size={13} /> {d.pending} pending</span>}
            </div>
          )}

          {/* ── 3. Job Purpose ── */}
          {d.job_purpose && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                <BookOpen size={12} /> Job Purpose
              </h4>
              <p className="text-sm text-gray-700 dark:text-almet-bali-hai leading-relaxed
                bg-gray-50 dark:bg-almet-comet/30 rounded-xl px-4 py-3">{d.job_purpose}</p>
            </div>
          )}

          {/* ── 4. Sections ── */}
          {d.sections.length > 0 && (
            <Section title="Job Sections" icon={BookOpen} count={d.sections.length} defaultOpen>
              <div className="space-y-4 pt-1">
                {d.sections.map((sec, i) => (
                  <div key={i}>
                    <h5 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-2">{sec.title}</h5>
                    <NumberedContent content={sec.content} />
                    {i < d.sections.length - 1 && <hr className="mt-4 border-gray-100 dark:border-almet-comet" />}
                  </div>
                ))}
              </div>
            </Section>
          )}

      
          {/* ── 6. Skills ── */}
          {d.skills.length > 0 && (
            <Section title="Required Skills" icon={Target} count={d.skills.length} defaultOpen>
              <div className="flex flex-wrap gap-2 pt-1">
                {d.skills.map((s, i) => (
                  <Tag key={s.id || i}
                    label={s.skill_detail?.name || `Skill ${i + 1}`}
                    sub={s.skill_detail?.group_name}
                    colorClass="bg-almet-sapphire/10 text-almet-sapphire" />
                ))}
              </div>
            </Section>
          )}

          {/* ── 7. Behavioral competencies ── */}
          {d.behavioral.length > 0 && (
            <Section title="Behavioral Competencies" icon={User} count={d.behavioral.length} defaultOpen accent="text-blue-600">
              <div className="flex flex-wrap gap-2 pt-1">
                {d.behavioral.map((c, i) => (
                  <Tag key={c.id || i}
                    label={c.competency_detail?.name || `Competency ${i + 1}`}
                    sub={c.competency_detail?.group_name}
                    colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                ))}
              </div>
            </Section>
          )}

          {/* ── 8. Leadership competencies ── */}
          {d.leadership.length > 0 && (
            <Section title="Leadership Competencies" icon={Crown} count={d.leadership.length} defaultOpen accent="text-purple-600">
              <div className="flex flex-wrap gap-2 pt-1">
                {d.leadership.map((l, i) => (
                  <Tag key={l.id || i}
                    label={l.leadership_item_detail?.name || l.item_detail?.name || `Item ${i + 1}`}
                    sub={l.leadership_item_detail?.child_group_name}
                    colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
                ))}
              </div>
            </Section>
          )}

          {/* ── 9. Resources / Access / Benefits ── */}
          <Section title="Business Resources" icon={Package} count={d.resources.length} isEmpty={!d.resources.length} defaultOpen={false}>
            <div className="space-y-2 pt-1">
              {d.resources.map((r, i) => (
                <ResourceRow key={r.id || i}
                  name={r.resource_detail?.name || `Resource ${i + 1}`}
                  description={r.resource_detail?.description}
                  hasSpecific={r.has_specific_items}
                  items={r.specific_items_detail} />
              ))}
            </div>
          </Section>

          <Section title="Access Rights" icon={Shield} count={d.access.length} isEmpty={!d.access.length} defaultOpen={false}>
            <div className="space-y-2 pt-1">
              {d.access.map((a, i) => (
                <ResourceRow key={a.id || i}
                  name={a.access_detail?.name || `Access ${i + 1}`}
                  description={a.access_detail?.description}
                  hasSpecific={a.has_specific_items}
                  items={a.specific_items_detail} />
              ))}
            </div>
          </Section>

          <Section title="Company Benefits" icon={Gift} count={d.benefits.length} isEmpty={!d.benefits.length} defaultOpen={false}>
            <div className="space-y-2 pt-1">
              {d.benefits.map((b, i) => (
                <ResourceRow key={b.id || i}
                  name={b.benefit_detail?.name || `Benefit ${i + 1}`}
                  description={b.benefit_detail?.description}
                  hasSpecific={b.has_specific_items}
                  items={b.specific_items_detail} />
              ))}
            </div>
          </Section>

          {/* ── Footer meta ── */}
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-2">
            <div className="flex gap-4">
              <span>Created: {fmt(d.created)}</span>
              <span>Updated: {fmt(d.updated)}</span>
            </div>
            <span className="flex items-center gap-1"><Hash size={11} /> v{d.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;