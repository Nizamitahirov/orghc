// src/components/headcount/ActionsDropdown.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  MoreVertical, Edit, Users, FileText, BarChart2, Trash2, UserPlus,
  TagIcon, Archive, X, Download, CheckCircle, Clock, Building,
  Briefcase, Target, Award, Shield, UserCheck, UserX as UserVacant, Crown,
  AlertCircle, Calendar, ChevronDown, ChevronUp, Hash,
  Package, Gift, Check
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useToast } from "../common/Toast";
import { getThemeStyles } from "./utils/themeStyles";
import { archiveEmployeesService } from "@/services/vacantPositionsService";
import jobDescriptionService from "../../services/jobDescriptionService";
import Link from "next/link";
import { createPortal } from "react-dom";
import ConfirmationModal from "../common/ConfirmationModal";
import DeleteExitModal from "./DeleteExitModal";

// ─── Shared mini-components ──────────────────────────────────────────────────

const STATUS_MAP = {
  DRAFT:                { label: "Draft",               cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",            Icon: Edit },
  PENDING_LINE_MANAGER: { label: "Pending Line Manager", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",    Icon: Clock },
  PENDING_EMPLOYEE:     { label: "Pending Employee",     cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",            Icon: Clock },
  APPROVED:             { label: "Approved",             cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",    Icon: CheckCircle },
  REJECTED:             { label: "Rejected",             cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",            Icon: AlertCircle },
  REVISION_REQUIRED:    { label: "Revision Required",    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", Icon: Edit },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.DRAFT;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
};

const Tag = ({ label, sub, colorClass = "bg-almet-sapphire/10 text-almet-sapphire" }) => (
  <div className={`inline-flex flex-col px-2.5 py-1 rounded-lg text-xs font-medium ${colorClass}`}>
    <span>{label}</span>
    {sub && <span className="text-[10px] opacity-70 mt-0.5">{sub}</span>}
  </div>
);

const CollapsibleSection = ({
  title, icon: Icon, count, defaultOpen = true,
  isEmpty = false, accent = "text-almet-sapphire", children
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-almet-comet rounded-xl overflow-hidden">
      <button
        onClick={() => !isEmpty && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors
          ${isEmpty ? "opacity-60 cursor-default" : "hover:bg-gray-50 dark:hover:bg-almet-comet/40"}`}
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className={isEmpty ? "text-gray-400" : accent} />
          <span className="font-semibold text-xs text-almet-cloud-burst dark:text-white">{title}</span>
          {count != null && count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-almet-sapphire text-white">{count}</span>
          )}
          {isEmpty && <span className="text-[10px] text-gray-400 italic">No data</span>}
        </div>
        {!isEmpty && (open
          ? <ChevronUp size={12} className="text-gray-400" />
          : <ChevronDown size={12} className="text-gray-400" />
        )}
      </button>
      {!isEmpty && open && (
        <div className="px-3 pb-3 pt-1">{children}</div>
      )}
    </div>
  );
};

const NumberedContent = ({ content }) => {
  if (!content) return null;
  const lines = content
    .split("\n")
    .map(l => l.replace(/^[\d]+[.)]\s*|^[•\-\*]\s*/, "").trim())
    .filter(Boolean);
  return (
    <ol className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-almet-bali-hai leading-relaxed">
          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-almet-sapphire/10 text-almet-sapphire
            text-[9px] font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
};

const ResourceRow = ({ name, description, hasSpecific, items }) => (
  <div className="p-2.5 bg-gray-50 dark:bg-almet-comet/30 rounded-lg">
    <div className="flex items-start justify-between gap-2 mb-1">
      <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{name}</p>
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium flex-shrink-0
        ${hasSpecific ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
        {hasSpecific ? "Specific" : "All"}
      </span>
    </div>
    {description && (
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">{description}</p>
    )}
    {hasSpecific && items?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-1">
        {items.map(item => (
          <span key={item.id}
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-almet-cloud-burst
              border border-gray-200 dark:border-almet-comet rounded text-[10px] text-gray-700 dark:text-gray-300">
            <Check size={8} className="text-green-500" /> {item.name}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ActionsDropdown = ({
  employeeId,
  employee = null,
  onAction,
  disabled = false,
  onRefresh = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [deleteExitModal, setDeleteExitModal] = useState({ open: false, type: 'soft' });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [jobAssignments, setJobAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // Confirmation modal
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "default",
    title: "",
    message: "",
    confirmText: "Confirm",
    action: null,
  });

  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const styles = getThemeStyles(darkMode);

  // Theme shortcuts
  const bg    = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const tp    = darkMode ? "text-white"            : "text-almet-cloud-burst";
  const ts    = darkMode ? "text-almet-bali-hai"  : "text-gray-700";
  const tm    = darkMode ? "text-gray-400"         : "text-almet-waterloo";
  const bc    = darkMode ? "border-almet-comet"    : "border-gray-200";
  const bgAcc = darkMode ? "bg-almet-san-juan/30"  : "bg-almet-mystic/50";

  const fmt = dt =>
    dt
      ? new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  // ── Dropdown position ──────────────────────────────────────────────────────
  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const r  = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const W  = 224;
    const H  = 400;
    let top  = r.bottom + 4;
    let left = r.right - W;
    if (top + H > vh) top = r.top - H - 4;
    if (left < 8) left = 8;
    if (left + W > vw - 8) left = vw - W - 8;
    setDropdownPosition({ top, left });
  };

  useEffect(() => {
    const outside = e => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) setIsOpen(false);
    };
    const repos = () => { if (isOpen) calculatePosition(); };
    if (isOpen) {
      document.addEventListener("mousedown", outside);
      window.addEventListener("scroll", repos, true);
      window.addEventListener("resize", repos);
      calculatePosition();
    }
    return () => {
      document.removeEventListener("mousedown", outside);
      window.removeEventListener("scroll", repos, true);
      window.removeEventListener("resize", repos);
    };
  }, [isOpen]);

  // ── Employee helpers ───────────────────────────────────────────────────────
  const getName = () =>
    employee?.name ||
    employee?.employee_name ||
    `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() ||
    `Employee ${employeeId}`;

  const getManager = () =>
    employee ? { name: employee.line_manager_name, id: employee.line_manager_id } : null;

  const getTags = () => {
    const tags = [];
    (employee?.tag_names || []).forEach((t, i) => {
      if (typeof t === "string" && t.trim()) tags.push({ id: `tn_${i}`, name: t.trim() });
      else if (t?.name) tags.push({ id: t.id || `to_${i}`, name: t.name });
    });
    (employee?.tags || []).forEach((t, i) => {
      if (t?.name && !tags.find(x => x.name === t.name))
        tags.push({ id: t.id || `tf_${i}`, name: t.name });
    });
    return tags;
  };

  // ── Fetch assignments ──────────────────────────────────────────────────────
  const fetchJobAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      setIsOpen(false);
      const response   = await jobDescriptionService.getEmployeeJobDescriptions(employeeId);
      const assignments = response.job_descriptions || response;
      if (!assignments?.length) {
        showWarning("No job descriptions found for this employee");
        return;
      }
      setJobAssignments(assignments);
      setShowModal(true);
      if (assignments.length === 1) await viewAssignmentDetail(assignments[0]);
    } catch {
      showError("Error loading job descriptions. Please try again.");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const viewAssignmentDetail = async assignment => {
    try {
      setAssignmentsLoading(true);
      const jobId     = assignment.job_description_id || assignment.job_description;
      const jobDetail = await jobDescriptionService.getJobDescription(jobId);
      setSelectedAssignment({ ...assignment, job_description: jobDetail });
    } catch {
      showError("Error loading assignment details");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setJobAssignments([]);
    setSelectedAssignment(null);
  };

  // ── Confirmation helpers ───────────────────────────────────────────────────
  const openConfirmation  = cfg => setConfirmationModal({ isOpen: true, ...cfg });
  const closeConfirmation = ()  => setConfirmationModal(p => ({ ...p, isOpen: false }));
  const executeConfirmed  = async () => {
    const { action } = confirmationModal;
    closeConfirmation();
    if (typeof action === "function") await action();
  };

  
const handleSoftDelete = () => {
  setIsOpen(false);
  setDeleteExitModal({ open: true, type: 'soft' });
};

const handleHardDelete = () => {
  setIsOpen(false);
  setDeleteExitModal({ open: true, type: 'hard' });
};

const handleDeleteExitConfirm = async ({ exitType, terminationDate, notes }) => {
  const name = getName();
  const isSoft = deleteExitModal.type === 'soft';
  setIsProcessing(true);
  try {
    if (isSoft) {
      const r = await archiveEmployeesService.bulkSoftDeleteEmployees(
        [employeeId], notes, terminationDate, exitType
      );
      showSuccess(r.message || `${name} employment ended`);
      if (r.data?.vacant_positions_created > 0)
        setTimeout(() => showInfo("Vacant position created."), 1000);
    } else {
      const r = await archiveEmployeesService.bulkHardDeleteEmployees(
        [employeeId], notes, true, terminationDate, exitType
      );
      showSuccess(r.message || `${name} permanently deleted`);
      if (r.data?.archives_created > 0)
        setTimeout(() => showInfo("Archive record created."), 1000);
    }
    setDeleteExitModal({ open: false, type: 'soft' });
    if (onRefresh) await onRefresh(); else onAction?.(employeeId, "refresh");
  } catch (e) {
    showError(`Failed: ${e.message || "Unknown error"}`);
  } finally {
    setIsProcessing(false);
  }
};


  // ── Action dispatcher ──────────────────────────────────────────────────────
  const handleAction = action => {
    setIsOpen(false);
    if (action === "viewJobDescriptions") { fetchJobAssignments(); return; }
    if (action === "softDelete")          { handleSoftDelete();    return; }
    if (action === "hardDelete")          { handleHardDelete();    return; }
    onAction?.(employeeId, action);
  };

  const manager = getManager();
  const tags    = getTags();
  const name    = getName();

  // ══════════════════════════════════════════════════════════════════════════
  // DROPDOWN MENU
  // ══════════════════════════════════════════════════════════════════════════
  const DropdownMenu = () => (
    <div
      ref={dropdownRef}
      className={`fixed w-56 rounded-md shadow-lg border ring-1 ring-black ring-opacity-5 overflow-hidden
        ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      style={{ top: dropdownPosition.top, left: dropdownPosition.left, zIndex: 99999 }}
    >
      <div className="py-1">
        {/* View Details */}
        <Link href={`/structure/employee/${employeeId}`}>
          <button
            className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
            onClick={() => setIsOpen(false)}
          >
            <FileText size={14} className="mr-2 text-blue-500" />
            View Details
          </button>
        </Link>

        {/* Edit Employee */}
        <Link href={`/structure/employee/${employeeId}/edit`}>
          <button
            className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
            onClick={() => setIsOpen(false)}
          >
            <Edit size={14} className="mr-2 text-green-500" />
            Edit Employee
          </button>
        </Link>

        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

        {/* Change Line Manager */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
          onClick={() => handleAction("changeManager")}
        >
          <UserPlus size={14} className="mr-2 text-indigo-500" />
          <div className="flex flex-col items-start">
            <span>Change Line Manager</span>
            <span className={`text-[10px] ${manager?.name ? "text-gray-500" : "text-orange-500"}`}>
              {manager?.name ? `Current: ${manager.name}` : "No manager assigned"}
            </span>
          </div>
        </button>

        {/* Manage Tags */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
          onClick={() => handleAction("manageTag")}
        >
          <TagIcon size={14} className="mr-2 text-purple-500" />
          <div className="flex flex-col items-start">
            <span>Manage Tags</span>
            <span className="text-[10px] text-gray-500">
              {tags.length > 0
                ? `${tags.length} tag${tags.length > 1 ? "s" : ""}: ${tags.slice(0, 2).map(t => t.name).join(", ")}${tags.length > 2 ? ` +${tags.length - 2}` : ""}`
                : "No tags"}
            </span>
          </div>
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

        {/* Job Descriptions */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
          onClick={() => handleAction("viewJobDescriptions")}
          disabled={assignmentsLoading}
        >
          <FileText size={14} className="mr-2 text-amber-500" />
          <div className="flex flex-col items-start">
            <span>Job Descriptions</span>
            <span className="text-[10px] text-gray-500">
              {assignmentsLoading ? "Loading…" : "View all assignments"}
            </span>
          </div>
        </button>

        {/* Performance Management */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
          onClick={() => handleAction("performanceManagement")}
        >
          <BarChart2 size={14} className="mr-2 text-blue-500" />
          <div className="flex flex-col items-start">
            <span>Performance Management</span>
            <span className="text-[10px] text-gray-500">Reviews & goals</span>
          </div>
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

        {/* Soft Delete */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
          onClick={() => handleAction("softDelete")}
        >
          <Archive size={14} className="mr-2 text-orange-500" />
          <div className="flex flex-col items-start">
            <span className="text-orange-600 dark:text-orange-400">Soft Delete</span>
            <span className="text-[10px] text-orange-400">Creates vacant position</span>
          </div>
        </button>

        {/* Hard Delete */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} flex items-center px-3 py-2 text-xs w-full`}
          onClick={() => handleAction("hardDelete")}
        >
          <Trash2 size={14} className="mr-2 text-red-500" />
          <div className="flex flex-col items-start">
            <span className="text-red-500 dark:text-red-400">Permanent Delete</span>
            <span className="text-[10px] text-red-400">Cannot be undone</span>
          </div>
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ASSIGNMENT LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const AssignmentListView = () => (
    <div className="p-5">
      {/* Header */}
      <div className={`flex items-center justify-between mb-5 pb-3 border-b ${bc}`}>
        <div>
          <h2 className={`text-base font-bold ${tp}`}>Job Description Assignments</h2>
          <p className={`text-xs ${tm} mt-0.5`}>
            {name} · {jobAssignments.length} assignment{jobAssignments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={closeModal}
          className={`p-1.5 ${tm} hover:${tp} hover:bg-gray-100 dark:hover:bg-almet-comet/30 rounded-lg transition-colors`}
        >
          <X size={18} />
        </button>
      </div>

      {/* List */}
      {assignmentsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire" />
        </div>
      ) : jobAssignments.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className={`mx-auto mb-3 ${tm}`} />
          <p className={`font-semibold ${tp} mb-1`}>No Job Descriptions</p>
          <p className={`text-xs ${tm}`}>This employee has no job description assignments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobAssignments.map((a, i) => {
            const jd = a.job_description || {};
            return (
              <button
                key={a.id || i}
                onClick={() => viewAssignmentDetail(a)}
                className={`w-full text-left p-4 rounded-xl border ${bc} ${bgAcc}
                  hover:shadow-md hover:border-almet-sapphire/30 transition-all`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${tp} truncate`}>
                      {jd.job_title || a.job_description_title}
                    </p>
                    <p className={`text-xs ${tm} mt-0.5`}>
                      {jd.business_function?.name}
                      {jd.department?.name ? ` · ${jd.department.name}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={a.status} />
                    {jd.leadership_competencies?.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-purple-100 text-purple-700">
                        <Crown size={9} /> Leadership
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400">
                  {a.reports_to_name && <span>Reports to: {a.reports_to_name}</span>}
                  {a.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {fmt(a.created_at)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ASSIGNMENT DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const AssignmentDetailView = () => {
    const jd = selectedAssignment.job_description || {};
    const sa = selectedAssignment;

    const d = {
      title:      jd.job_title || "—",
      bf:         jd.business_function?.name || "",
      dept:       jd.department?.name || "",
      unit:       jd.unit?.name || "",
      jf:         jd.job_function?.name || "",
      pg:         jd.position_group?.display_name || jd.position_group?.name || "",
      grades:     jd.grading_levels || (jd.grading_level ? [jd.grading_level] : []),
      purpose:    jd.job_purpose || "",
      sections:   jd.sections || [],
      skills:     jd.required_skills || [],
      behavioral: jd.behavioral_competencies || [],
      leadership: jd.leadership_competencies || [],
      resources:  jd.business_resources || [],
      access:     jd.access_rights || [],
      benefits:   jd.company_benefits || [],
    };

    return (
      <div className="p-5">
        {/* Header */}
        <div className={`flex items-start justify-between mb-5 pb-3 border-b ${bc}`}>
          <div className="min-w-0 flex-1">
      
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-base font-bold ${tp}`}>{d.title}</h2>
              <StatusBadge status={sa.status} />
              {d.leadership.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-purple-100 text-purple-700">
                  <Crown size={9} /> Leadership
                </span>
              )}
            </div>
            <p className={`text-xs ${tm} mt-1`}>
              {d.bf}{d.dept ? ` · ${d.dept}` : ""}{d.unit ? ` · ${d.unit}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <button
              onClick={() => jobDescriptionService.downloadJobDescriptionPDF(jd.id, employeeId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire hover:bg-almet-astral
                text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Download size={12} /> PDF
            </button>
            <button
              onClick={closeModal}
              className={`p-1.5 ${tm} hover:${tp} hover:bg-gray-100 dark:hover:bg-almet-comet/30 rounded-lg transition-colors`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            { label: "Job Function", value: d.jf || "—" },
            { label: "Hierarchy",    value: d.pg || "—" },
            { label: "Grades",       value: d.grades.length ? d.grades.join(", ") : "—" },
            {
              label: "Assignment",
              value: sa.is_vacancy
                ? <span className="flex items-center gap-1 text-orange-500"><UserVacant size={11} /> Vacant</span>
                : <span className="flex items-center gap-1 text-green-600"><UserCheck size={11} /> Assigned</span>,
            },
          ].map(({ label, value }) => (
            <div key={label} className={`${bgAcc} rounded-xl px-3 py-2`}>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
              <div className={`text-xs font-semibold ${tp}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Approval status bar */}
        <div className={`flex flex-wrap items-center gap-3 px-3 py-2 mb-4 rounded-xl border
          bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border-almet-sapphire/20 text-xs`}>
          <span className={`font-semibold ${tp}`}>Approval:</span>
          <span className={`flex items-center gap-1 ${sa.line_manager_approved_at ? "text-green-600" : "text-amber-500"}`}>
            {sa.line_manager_approved_at ? <CheckCircle size={11} /> : <Clock size={11} />}
            Line Manager {sa.line_manager_approved_at ? "approved" : "pending"}
          </span>
          <span className={`flex items-center gap-1 ${sa.employee_approved_at ? "text-green-600" : "text-amber-500"}`}>
            {sa.employee_approved_at ? <CheckCircle size={11} /> : <Clock size={11} />}
            Employee {sa.employee_approved_at ? "approved" : "pending"}
          </span>
          {sa.reports_to?.full_name && (
            <span className={tm}>Reports to: {sa.reports_to.full_name}</span>
          )}
        </div>

        {/* Comments */}
        {(sa.line_manager_comments || sa.employee_comments) && (
          <div className="space-y-2 mb-4">
            {sa.line_manager_comments && (
              <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-2 border-blue-400">
                <p className="text-[9px] font-bold text-blue-600 mb-0.5">Manager comment</p>
                <p className="text-xs text-blue-800 dark:text-blue-300">{sa.line_manager_comments}</p>
              </div>
            )}
            {sa.employee_comments && (
              <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-2 border-green-400">
                <p className="text-[9px] font-bold text-green-600 mb-0.5">Employee comment</p>
                <p className="text-xs text-green-800 dark:text-green-300">{sa.employee_comments}</p>
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-3">

          {/* Job Purpose */}
          {d.purpose && (
            <CollapsibleSection title="Job Purpose" icon={Target} defaultOpen>
              <p className={`text-xs ${ts} leading-relaxed pt-1`}>{d.purpose}</p>
            </CollapsibleSection>
          )}

          {/* Job Sections */}
          {d.sections.length > 0 && (
            <CollapsibleSection title="Job Sections" icon={Briefcase} count={d.sections.length} defaultOpen>
              <div className="space-y-3 pt-1">
                {d.sections.map((sec, i) => (
                  <div key={i}>
                    <p className={`text-xs font-semibold ${tp} mb-1.5`}>{sec.title}</p>
                    <NumberedContent content={sec.content} />
                    {i < d.sections.length - 1 && (
                      <hr className="mt-3 border-gray-100 dark:border-almet-comet" />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Required Skills */}
          {d.skills.length > 0 && (
            <CollapsibleSection title="Required Skills" icon={Award} count={d.skills.length} defaultOpen>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {d.skills.map((s, i) => (
                  <Tag
                    key={s.id || i}
                    label={s.skill_detail?.name || `Skill ${i + 1}`}
                    sub={s.skill_detail?.group_name}
                    colorClass="bg-almet-sapphire/10 text-almet-sapphire"
                  />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Behavioral Competencies */}
          {d.behavioral.length > 0 && (
            <CollapsibleSection
              title="Behavioral Competencies"
              icon={Users}
              count={d.behavioral.length}
              defaultOpen
              accent="text-blue-600"
            >
              <div className="flex flex-wrap gap-1.5 pt-1">
                {d.behavioral.map((c, i) => (
                  <Tag
                    key={c.id || i}
                    label={c.competency_detail?.name || `Competency ${i + 1}`}
                    sub={c.competency_detail?.group_name}
                    colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Leadership Competencies */}
          {d.leadership.length > 0 && (
            <CollapsibleSection
              title="Leadership Competencies"
              icon={Crown}
              count={d.leadership.length}
              defaultOpen
              accent="text-purple-600"
            >
              <div className="flex flex-wrap gap-1.5 pt-1">
                {d.leadership.map((l, i) => (
                  <Tag
                    key={l.id || i}
                    label={l.leadership_item_detail?.name || l.item_detail?.name || `Item ${i + 1}`}
                    sub={l.leadership_item_detail?.child_group_name}
                    colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Business Resources */}
          <CollapsibleSection
            title="Business Resources"
            icon={Package}
            count={d.resources.length}
            isEmpty={!d.resources.length}
            defaultOpen={false}
          >
            <div className="space-y-2 pt-1">
              {d.resources.map((r, i) => (
                <ResourceRow
                  key={r.id || i}
                  name={r.resource_detail?.name || `Resource ${i + 1}`}
                  description={r.resource_detail?.description}
                  hasSpecific={r.has_specific_items}
                  items={r.specific_items_detail}
                />
              ))}
            </div>
          </CollapsibleSection>

          {/* Access Rights */}
          <CollapsibleSection
            title="Access Rights"
            icon={Shield}
            count={d.access.length}
            isEmpty={!d.access.length}
            defaultOpen={false}
          >
            <div className="space-y-2 pt-1">
              {d.access.map((a, i) => (
                <ResourceRow
                  key={a.id || i}
                  name={a.access_detail?.name || `Access ${i + 1}`}
                  description={a.access_detail?.description}
                  hasSpecific={a.has_specific_items}
                  items={a.specific_items_detail}
                />
              ))}
            </div>
          </CollapsibleSection>

          {/* Company Benefits */}
          <CollapsibleSection
            title="Company Benefits"
            icon={Gift}
            count={d.benefits.length}
            isEmpty={!d.benefits.length}
            defaultOpen={false}
          >
            <div className="space-y-2 pt-1">
              {d.benefits.map((b, i) => (
                <ResourceRow
                  key={b.id || i}
                  name={b.benefit_detail?.name || `Benefit ${i + 1}`}
                  description={b.benefit_detail?.description}
                  hasSpecific={b.has_specific_items}
                  items={b.specific_items_detail}
                />
              ))}
            </div>
          </CollapsibleSection>

          {/* Footer */}
          <div className={`flex items-center justify-between text-[10px] ${tm} pt-1`}>
            <span>Created: {fmt(sa.created_at)}</span>
            {jd.version && (
              <span className="flex items-center gap-1">
                <Hash size={10} /> v{jd.version}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL PORTAL
  // ══════════════════════════════════════════════════════════════════════════
  const Modal = () => {
    if (!showModal) return null;
    return createPortal(
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100000] p-3 md:p-6">
        <div className={`${bg} rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col
          border ${bc} shadow-2xl overflow-hidden`}>
          <div className="overflow-y-auto flex-1">
            {assignmentsLoading && !selectedAssignment && !jobAssignments.length ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire" />
              </div>
            ) : selectedAssignment ? (
              <AssignmentDetailView />
            ) : (
              <AssignmentListView />
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => { if (!disabled) setIsOpen(o => !o); }}
          disabled={disabled || isProcessing}
          className={`p-1 rounded-full ${styles.hoverBg} transition-colors
            ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Employee Actions"
          title={`Actions for ${name}`}
        >
          <MoreVertical size={14} className={styles.textSecondary} />
        </button>

        {isOpen && !disabled && !isProcessing && typeof window !== "undefined" &&
          createPortal(<DropdownMenu />, document.body)}
      </div>

      {typeof window !== "undefined" && <Modal />}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={executeConfirmed}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        loading={isProcessing}
        darkMode={darkMode}
      />

      <DeleteExitModal
        isOpen={deleteExitModal.open}
        onClose={() => setDeleteExitModal({ open: false, type: 'soft' })}
        onConfirm={handleDeleteExitConfirm}
        deleteType={deleteExitModal.type}
        employeeName={getName()}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default ActionsDropdown;