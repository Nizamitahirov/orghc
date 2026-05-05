// app/(dashboard)/resignation-exit/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  FileText, LogOut, Plus, Search, Clock, Trash2,
  Building2, Calendar, ChevronRight, Home, Settings,
  ArrowLeft, CheckCircle, AlertTriangle, Shield,
  Filter, LogIn
} from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/common/Toast';

import ResignationSubmissionModal  from '@/components/resignation/ResignationSubmissionModal';
import ResignationDetailModal      from '@/components/resignation/ResignationDetailModal';
import ExitInterviewModal          from '@/components/resignation/ExitInterviewModal';
import CreateExitInterviewModal    from '@/components/resignation/CreateExitInterviewModal';
import ViewExitInterviewModal      from '@/components/resignation/ViewExitInterviewModal';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING_MANAGER:  { label: 'Pending Manager', dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'  },
  PENDING_HR:       { label: 'Pending HR',       dot: 'bg-blue-400',    pill: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'       },
  MANAGER_APPROVED: { label: 'Mgr Approved',     dot: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  MANAGER_REJECTED: { label: 'Mgr Rejected',     dot: 'bg-red-400',     pill: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'           },
  HR_APPROVED:      { label: 'HR Approved',      dot: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  HR_REJECTED:      { label: 'HR Rejected',      dot: 'bg-red-400',     pill: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'           },
  COMPLETED:        { label: 'Completed',        dot: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  PENDING:          { label: 'Pending',          dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'   },
  IN_PROGRESS:      { label: 'In Progress',      dot: 'bg-blue-400',    pill: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'       },
};

const StatusPill = ({ status }) => {
  const c = STATUS_CFG[status] ?? { label: status, dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

// ── Tiny helpers ─────────────────────────────────────────────────────────────
const fmt = (d) => resignationExitService.helpers.formatDate(d);

const Crumb = ({ path, onHome }) => (
  <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
    <button onClick={onHome} className="flex items-center gap-1 hover:text-almet-sapphire transition-colors">
      <Home size={12} /> Home
    </button>
    {path.map((p, i) => (
      <React.Fragment key={i}>
        <ChevronRight size={11} />
        <span className={i === path.length - 1 ? 'text-gray-700 dark:text-gray-200 font-semibold' : ''}>{p}</span>
      </React.Fragment>
    ))}
  </nav>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const Stat = ({ icon: Icon, label, value, note, iconCls, bgCls, onClick }) => (
  <button
    onClick={onClick}
    className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${bgCls}`}><Icon size={16} className={iconCls} /></div>
      <ChevronRight size={13} className="text-gray-300 group-hover:text-almet-sapphire group-hover:translate-x-0.5 transition-all" />
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">{value}</p>
    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</p>
    {note && <p className="text-[11px] text-gray-400 mt-0.5">{note}</p>}
  </button>
);

// ── Category card ─────────────────────────────────────────────────────────────
const CatCard = ({ icon: Icon, title, desc, badge, badgeCls, iconBg, iconCls, onClick }) => (
  <button
    onClick={onClick}
    className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left w-full"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl ${iconBg}`}><Icon size={18} className={iconCls} /></div>
      {badge != null && badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeCls}`}>{badge}</span>
      )}
    </div>
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{desc}</p>
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-almet-sapphire group-hover:gap-1.5 transition-all">
      Open <ChevronRight size={13} />
    </span>
  </button>
);

// ── Quick action button ────────────────────────────────────────────────────────
const QBtn = ({ icon: Icon, label, desc, border, iconCls, bgCls, onClick }) => (
  <button
    onClick={onClick}
    className={`group bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-transparent hover:${border} transition-all text-left w-full shadow-sm hover:shadow-md`}
  >
    <div className={`p-2 rounded-lg ${bgCls} inline-flex mb-3`}>
      <Icon size={16} className={iconCls} />
    </div>
    <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">{label}</p>
    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{desc}</p>
  </button>
);

// ── Item row card ─────────────────────────────────────────────────────────────
const ItemRow = ({ item, type, onView, onDelete, isAdmin }) => {
  const Icon = type === 'resignation' ? FileText : LogOut;
  const urg  = item.days_remaining <= 7  ? 'text-red-500'
             : item.days_remaining <= 14 ? 'text-amber-500'
             : 'text-gray-400 dark:text-gray-500';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
      <button onClick={() => onView(item)} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg shrink-0">
            <Icon size={15} className="text-almet-sapphire" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{item.employee_name}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{item.employee_id} · {item.position}</p>
              </div>
              <StatusPill status={item.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 dark:text-gray-500">
              {item.department    && <span className="flex items-center gap-1"><Building2 size={10}/>{item.department}</span>}
              {item.last_working_day && <span className="flex items-center gap-1"><Calendar size={10}/>{fmt(item.last_working_day)}</span>}
              {item.days_remaining != null && (
                <span className={`flex items-center gap-1 font-semibold ${urg}`}>
                  <Clock size={10}/>{item.days_remaining}d remaining
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
      {isAdmin && (
        <div className="px-4 pb-3 flex justify-end">
          <button
            onClick={() => onDelete(item)}
            className="flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors"
          >
            <Trash2 size={11}/> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
export default function ResignationExitManagement() {
  const [loading, setLoading]       = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole]     = useState(null);
  const { showSuccess, showError }  = useToast();

  const [view, setView]             = useState('home'); // 'home' | 'resignations' | 'exits'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [modalType, setModalType]   = useState('');

  const [data, setData]             = useState({ resignations: [], exitInterviews: [] });
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('all');
  const [delModal, setDelModal]     = useState({ show: false, item: null, type: '' });

  useEffect(() => { boot(); }, []);

  const boot = async () => {
    try {
      setLoading(true);
      const [info, profile] = await Promise.all([
        resignationExitService.getCurrentUser(),
        resignationExitService.getUser(),
      ]);
      const full = {
        ...info, ...profile,
        id:            profile.employee?.id || info.id,
        employee_id:   profile.employee?.employee_id || info.username,
        full_name:     profile.employee?.full_name || `${info.first_name} ${info.last_name}`,
        job_title:     profile.employee?.job_title || '',
        department_name: profile.employee?.department?.name || '',
      };
      setCurrentUser(full);
      setUserRole(info);
      await fetchData(info);
    } catch (e) {
      console.error(e);
      showError('Failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (role) => {
    try {
      const [resigs, exits] = await Promise.all([
        resignationExitService.resignation.getResignations().catch(() => ({ results: [] })),
        role?.is_admin
          ? resignationExitService.exitInterview.getExitInterviews().catch(() => ({ results: [] }))
          : Promise.resolve({ results: [] }),
      ]);
      setData({ resignations: resigs.results || [], exitInterviews: exits.results || [] });
    } catch (e) {
      console.error(e);
      showError('Failed to load data.');
    }
  };

  const handleDelete = async () => {
    const { item, type } = delModal;
    try {
      type === 'resignation'
        ? await resignationExitService.resignation.deleteResignation(item.id)
        : await resignationExitService.exitInterview.deleteExitInterview(item.id);
      showSuccess('Deleted successfully');
      await fetchData(userRole);
      setDelModal({ show: false, item: null, type: '' });
    } catch (e) {
      console.error(e);
      showError('Failed to delete.');
    }
  };

  const closeModal  = () => { setShowModal(false); setSelectedItem(null); setModalType(''); };
  const onSuccess   = () => fetchData(userRole);
  const goHome      = () => { setView('home'); setSearch(''); setFilter('all'); };
  const goView      = (v) => { setView(v); setSearch(''); setFilter('all'); };
  const openDetail  = (item, type) => { setSelectedItem(item); setModalType(type); setShowModal(true); };

  if (loading) return <LoadingSpinner message="Loading Employee Offboarding…" />;

  const pendingRes  = data.resignations.filter(r => ['PENDING_MANAGER','PENDING_HR'].includes(r.status));
  const doneRes     = data.resignations.filter(r => r.status === 'COMPLETED');
  const pendingExit = data.exitInterviews.filter(e => e.status !== 'COMPLETED');
  const doneExit    = data.exitInterviews.filter(e => e.status === 'COMPLETED');

  // ── HOME ──────────────────────────────────────────────────────────────────
  const HomeView = () => (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-almet-sapphire via-almet-astral to-almet-steel-blue rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 left-1/3 w-28 h-28 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/15 rounded-lg"><LogIn size={15}/></div>
            <span className="text-xs font-medium text-white/70">Employee Offboarding</span>
          </div>
          <h1 className="text-lg font-bold mb-1">Resignation & Exit Management</h1>
          <p className="text-xs text-white/60 ">
            Manage resignations, conduct exit interviews, and ensure a smooth offboarding process.
          </p>
        </div>
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={FileText}     label="Total Resignations" value={data.resignations.length}   note={`${pendingRes.length} pending`}     iconCls="text-red-500"     bgCls="bg-red-50 dark:bg-red-900/20"     onClick={() => goView('resignations')} />
          <Stat icon={AlertTriangle} label="Awaiting Approval" value={pendingRes.length}           note="Needs attention"                    iconCls="text-amber-500"   bgCls="bg-amber-50 dark:bg-amber-900/20"  onClick={() => goView('resignations')} />
          {userRole?.is_admin && <>
            <Stat icon={LogOut}       label="Exit Interviews"  value={data.exitInterviews.length} note={`${doneExit.length} completed`}    iconCls="text-blue-500"    bgCls="bg-blue-50 dark:bg-blue-900/20"   onClick={() => goView('exits')} />
            <Stat icon={CheckCircle}  label="Fully Completed"  value={doneRes.length + doneExit.length} note="This period"                 iconCls="text-emerald-500" bgCls="bg-emerald-50 dark:bg-emerald-900/20" onClick={() => goView('resignations')} />
          </>}
          {!userRole?.is_admin &&
            <Stat icon={CheckCircle} label="Completed" value={doneRes.length} note="Fully processed" iconCls="text-emerald-500" bgCls="bg-emerald-50 dark:bg-emerald-900/20" onClick={() => goView('resignations')} />
          }
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QBtn icon={Plus}     label="Submit My Resignation"  desc="Start the official resignation process." border="border-red-300"    iconCls="text-red-500"    bgCls="bg-red-50 dark:bg-red-900/20"     onClick={() => { setModalType('submit_resignation'); setShowModal(true); }} />
          {userRole?.is_admin && <>
            <QBtn icon={LogOut}   label="Create Exit Interview"  desc="Schedule an interview for a departing employee." border="border-blue-300"   iconCls="text-blue-500"   bgCls="bg-blue-50 dark:bg-blue-900/20"   onClick={() => { setModalType('create_exit_interview'); setShowModal(true); }} />
            <QBtn icon={Settings} label="Manage Questions"        desc="Configure interview and review question sets."   border="border-purple-300" iconCls="text-purple-500" bgCls="bg-purple-50 dark:bg-purple-900/20" onClick={() => window.location.href = 'question-management/'} />
          </>}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Browse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CatCard
            icon={FileText} title="Resignations"
            desc="View and manage resignation requests, approvals, and status updates."
            badge={pendingRes.length} badgeCls="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            iconBg="bg-red-50 dark:bg-red-900/20" iconCls="text-red-500"
            onClick={() => goView('resignations')}
          />
          {userRole?.is_admin
            ? <CatCard
                icon={LogOut} title="Exit Interviews"
                desc="Conduct structured exit interviews and review employee feedback."
                badge={pendingExit.length} badgeCls="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-900/20" iconCls="text-blue-500"
                onClick={() => goView('exits')}
              />
            : <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-center">
                <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl"><Shield size={18} className="text-gray-400"/></div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Exit Interviews</p>
                <p className="text-[11px] text-gray-400">Admin access required</p>
              </div>
          }
        </div>
      </section>
    </div>
  );

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  const ListView = ({ items, type, title, icon: Icon }) => {
    const filtered = items.filter(item => {
      const q = search.toLowerCase();
      const ok  = item.employee_name?.toLowerCase().includes(q) || item.employee_id?.toLowerCase().includes(q);
      const okS = filterStatus === 'all' || item.status === filterStatus;
      return ok && okS;
    });

    // distinct statuses in current list
    const statusCounts = items.reduce((a, i) => { a[i.status] = (a[i.status]||0)+1; return a; }, {});

    return (
      <div className="space-y-4">
        <Crumb path={[title]} onHome={goHome} />

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft size={16} className="text-gray-500"/>
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">{title}</h1>
              <p className="text-[11px] text-gray-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {type === 'resignation' &&
            <button onClick={() => { setModalType('submit_resignation'); setShowModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg text-xs font-semibold hover:bg-almet-astral transition-colors shadow-sm">
              <Plus size={13}/> New
            </button>
          }
          {type === 'exit' && userRole?.is_admin &&
            <button onClick={() => { setModalType('create_exit_interview'); setShowModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg text-xs font-semibold hover:bg-almet-astral transition-colors shadow-sm">
              <Plus size={13}/> New
            </button>
          }
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <select
              value={filterStatus} onChange={e => setFilter(e.target.value)}
              className="pl-8 pr-6 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire appearance-none"
            >
              <option value="all">All statuses</option>
              <option value="PENDING_MANAGER">Pending Manager</option>
              <option value="PENDING_HR">Pending HR</option>
              <option value="MANAGER_APPROVED">Mgr Approved</option>
              <option value="HR_APPROVED">HR Approved</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Status pills */}
        {Object.keys(statusCounts).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(statusCounts).map(([s, n]) => {
              const c = STATUS_CFG[s] ?? { label: s, dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
              const active = filterStatus === s;
              return (
                <button key={s}
                  onClick={() => setFilter(active ? 'all' : s)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all
                    ${active ? `${c.pill} border-current` : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>{c.label} ({n})
                </button>
              );
            })}
          </div>
        )}

        {/* Items */}
        {filtered.length === 0
          ? <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-3">
                <Icon size={28} className="text-gray-400"/>
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">No records found</p>
              <p className="text-xs text-gray-400">
                {search || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'No data available yet.'}
              </p>
            </div>
          : <div className="space-y-2">
              {filtered.map(item => (
                <ItemRow key={item.id} item={item} type={type} isAdmin={userRole?.is_admin}
                  onView={item => openDetail(item, type === 'resignation' ? 'resignation_detail' : 'exit_interview')}
                  onDelete={item => setDelModal({ show: true, item, type })}
                />
              ))}
            </div>
        }
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className=" mx-auto px-1 py-2">
        {view === 'home'         && <HomeView />}
        {view === 'resignations' && <ListView items={data.resignations}   type="resignation" title="Resignations"    icon={FileText}/>}
        {view === 'exits' && userRole?.is_admin &&
          <ListView items={data.exitInterviews} type="exit" title="Exit Interviews" icon={LogOut}/>}

        {showModal && <>
          {modalType === 'submit_resignation'    && <ResignationSubmissionModal onClose={closeModal} onSuccess={onSuccess} currentEmployee={currentUser}/>}
          {modalType === 'resignation_detail' && selectedItem && <ResignationDetailModal resignation={selectedItem} onClose={closeModal} onSuccess={onSuccess} userRole={userRole} currentUser={currentUser}/>}
          {modalType === 'exit_interview'     && selectedItem && (
            selectedItem.status === 'COMPLETED'
              ? <ViewExitInterviewModal interview={selectedItem} onClose={closeModal}/>
              : <ExitInterviewModal     interview={selectedItem} onClose={closeModal} onSuccess={onSuccess}/>
          )}
          {modalType === 'create_exit_interview' && <CreateExitInterviewModal onClose={closeModal} onSuccess={onSuccess}/>}
        </>}

        <ConfirmationModal
          isOpen={delModal.show}
          onClose={() => setDelModal({ show:false, item:null, type:'' })}
          onConfirm={handleDelete}
          title="Delete Record"
          message={`Are you sure you want to delete this ${delModal.type === 'resignation' ? 'resignation' : 'exit interview'}? This cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      </div>
    </DashboardLayout>
  );
}