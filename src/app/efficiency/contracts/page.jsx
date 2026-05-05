// app/(dashboard)/resignation-exit/contract-probation/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Clock, UserCheck, Calendar, AlertTriangle, TrendingUp,
  Building2, RefreshCw, Settings, ChevronRight, Eye,
  CheckCircle, XCircle, Shield
} from 'lucide-react';
import { employeeService }      from '@/services/newsService';
import { LoadingSpinner }        from '@/components/common/LoadingSpinner';
import { apiService }            from '@/services/api';
import resignationExitService    from '@/services/resignationExitService';
import ContractRenewalModal      from '@/components/resignation/ContractRenewalModal';
import ContractRenewalHRModal    from '@/components/resignation/ContractRenewalHRModal';
import ProbationReviewModal      from '@/components/resignation/ProbationReviewModal';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => resignationExitService.helpers.formatDate(d);

const URGENCY = {
  critical: { bar:'bg-red-500',    badge:'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'       },
  warning:  { bar:'bg-amber-500',  badge:'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  attention:{ bar:'bg-orange-500', badge:'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  normal:   { bar:'bg-almet-sapphire', badge:'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  unknown:  { bar:'bg-gray-400',   badge:'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'     },
};

// ── Shared mini-components ────────────────────────────────────────────────────
const Tab = ({ active, label, icon: Icon, badge, onClick }) => (
  <button onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all
      ${active ? 'bg-almet-sapphire text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
    <Icon size={13}/>{label}
    {badge > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-sapphire/20'}`}>{badge}</span>}
  </button>
);

const FilterBtn = ({ active, label, count, activeClass, onClick }) => (
  <button onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all
      ${active ? `${activeClass} text-white shadow-sm` : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
    {label}{count != null ? ` (${count})` : ''}
  </button>
);

const StatCard = ({ icon: Icon, label, value, iconBg, iconCls, valueCls }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${valueCls ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${iconBg}`}><Icon size={16} className={iconCls}/></div>
    </div>
  </div>
);

const Empty = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-3">
      <Icon size={26} className="text-gray-400"/>
    </div>
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
export default function ContractProbationPage() {
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('reviews');
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin]   = useState(false);

  const [probationEmps, setProbationEmps]   = useState([]);
  const [probFilter, setProbFilter]         = useState('all');
  const [contractCfgs, setContractCfgs]     = useState({});

  const [renewals, setRenewals]             = useState([]);
  const [renewFilter, setRenewFilter]       = useState('all');

  const [reviews, setReviews]               = useState([]);
  const [revFilter, setRevFilter]           = useState('all');

  const [contractModal, setContractModal]   = useState(false);
  const [hrModal, setHrModal]               = useState(false);
  const [reviewModal, setReviewModal]       = useState(false);
  const [selContract, setSelContract]       = useState(null);
  const [selReview, setSelReview]           = useState(null);
  const [respondent, setRespondent]         = useState('EMPLOYEE');
  const [viewMode, setViewMode]             = useState(false);

  useEffect(() => { boot(); }, []);

  const boot = async () => {
    try {
      setLoading(true);
      const info = await resignationExitService.getCurrentUser();
      setUserRole(info);
      const admin   = info.is_admin;
      const manager = info.is_manager;
      setIsAdmin(admin);

      const cfgRes = await apiService.getContractConfigs();
      const cfgs = (cfgRes.data.results || cfgRes.data || []);
      const cfgMap = {};
      cfgs.forEach(c => { cfgMap[c.contract_type] = { probation_days: c.probation_days||0, display_name: c.display_name||c.contract_type }; });
      setContractCfgs(cfgMap);

      if (admin || manager) await loadProbation(cfgMap);
      await loadRenewals();
      await loadReviews();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadProbation = async (cfgMap) => {
    try {
      const statusRes = await apiService.getEmployeeStatuses();
      const statuses  = statusRes.data.results || statusRes.data || [];
      const probSt    = statuses.find(s => s.status_type==='PROBATION' || s.name?.toUpperCase().includes('PROBATION'));
      const res       = await employeeService.getEmployees({ page_size:1000, ...(probSt ? {status:probSt.id} : {}) });
      const emps      = (res.results||[]).filter(e => !probSt ? e.status_name?.toUpperCase().includes('PROBATION') : true);
      const enriched  = emps.map(e => ({ ...e, ...calcProbation(e, cfgMap) }));
      enriched.sort((a,b) => a.daysRemaining - b.daysRemaining);
      setProbationEmps(enriched);
    } catch (e) { console.error(e); }
  };

  const loadRenewals = async () => {
    try {
      const r = await resignationExitService.contractRenewal.getContractRenewals();
      setRenewals(r.results||[]);
    } catch (e) { console.error(e); }
  };

  const loadReviews = async () => {
    try {
      const r = await resignationExitService.probationReview.getProbationReviews();
      setReviews(r.results||[]);
    } catch (e) { console.error(e); }
  };

  const calcProbation = (emp, cfgMap) => {
    if (!emp.start_date || !emp.contract_duration) return { probationEndDate:null, daysRemaining:null, daysCompleted:null, totalProbationDays:null, progressPercent:0, urgencyLevel:'unknown' };
    const total    = cfgMap[emp.contract_duration]?.probation_days || 90;
    const start    = new Date(emp.start_date);
    const today    = new Date(); today.setHours(0,0,0,0);
    const end      = new Date(start); end.setDate(end.getDate()+total);
    const done     = Math.floor((today-start)/(1e3*60*60*24));
    const left     = Math.ceil((end-today)/(1e3*60*60*24));
    const pct      = Math.min(100, Math.round((done/total)*100));
    const urg      = left<=7 ? 'critical' : left<=14 ? 'warning' : left<=30 ? 'attention' : 'normal';
    return { probationEndDate:end.toISOString().split('T')[0], daysRemaining:left>0?left:0, daysCompleted:done, totalProbationDays:total, progressPercent:pct, urgencyLevel:urg };
  };

  const contractName = (t) => contractCfgs[t]?.display_name || { PERMANENT:'Permanent','1_YEAR':'1 Year','6_MONTHS':'6 Months','3_MONTHS':'3 Months' }[t] || t;

  const handleContractClick = (c) => {
    setSelContract(c);
    isAdmin && c.status==='PENDING_HR' ? setHrModal(true) : setContractModal(true);
  };
  const handleReviewClick = (r, type='EMPLOYEE', vm=false) => { setSelReview(r); setRespondent(type); setViewMode(vm); setReviewModal(true); };

  if (loading) return <LoadingSpinner message="Loading Contract & Probation Management…"/>;

  if (!isAdmin && !userRole?.is_manager && renewals.length===0 && reviews.length===0)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield size={28} className="text-red-500"/>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Access Denied</p>
            <p className="text-xs text-gray-400 mb-4">You don't have permission to view this page.</p>
            <button onClick={() => window.location.href='/requests/resignation'}
              className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg text-xs font-semibold hover:bg-almet-astral transition-colors">
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

  // ── derived counts ──────────────────────────────────────────────────────────
  const crit            = probationEmps.filter(e=>e.urgencyLevel==='critical').length;
  const warn            = probationEmps.filter(e=>e.urgencyLevel==='warning').length;
  const total           = probationEmps.length;
  const urgentContracts = renewals.filter(c=>c.days_until_expiry<=14).length;
  const pendingHR       = renewals.filter(c=>c.status==='PENDING_HR').length;
  const pendingEmpRev   = reviews.filter(r=>!r.employee_responses?.length).length;
  const pendingMgrRev   = reviews.filter(r=>!r.manager_responses?.length).length;
  const doneRev         = reviews.filter(r=>r.employee_responses?.length>0 && r.manager_responses?.length>0).length;

  const filtProbation = probationEmps.filter(e =>
    probFilter==='critical' ? e.urgencyLevel==='critical' :
    probFilter==='warning'  ? e.urgencyLevel==='warning'  : true);

  const filtRenewals = renewals.filter(c =>
    renewFilter==='urgent'     ? c.days_until_expiry<=14 :
    renewFilter==='pending'    ? c.status==='PENDING_MANAGER' :
    renewFilter==='pending_hr' ? c.status==='PENDING_HR' : true);

  const filtReviews = reviews.filter(r => {
    if (revFilter==='pending')          return !r.employee_responses?.length || !r.manager_responses?.length;
    if (revFilter==='completed')        return r.employee_responses?.length>0 && r.manager_responses?.length>0;
    if (revFilter==='employee_pending') return !r.employee_responses?.length;
    if (revFilter==='manager_pending')  return !r.manager_responses?.length;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4  mx-auto py-2">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-almet-sapphire via-almet-astral to-almet-steel-blue rounded-2xl p-5 text-white overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full"/>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold mb-0.5">Contract & Probation Management</h1>
              <p className="text-xs text-white/60">Monitor probation periods, contract renewals, and reviews</p>
            </div>
            {isAdmin && (
              <button onClick={() => window.location.href='/requests/resignation/question-management'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-colors">
                <Settings size={13}/> Questions
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 flex gap-1 shadow-sm">
          {isAdmin && <Tab active={tab==='probation'} label="Probation Tracking" icon={Shield}    badge={crit}                            onClick={() => setTab('probation')}/>}
          <Tab active={tab==='contracts'} label="Contract Renewals"  icon={RefreshCw} badge={urgentContracts+pendingHR}           onClick={() => setTab('contracts')}/>
          <Tab active={tab==='reviews'}   label="Probation Reviews"  icon={CheckCircle} badge={pendingEmpRev+pendingMgrRev}         onClick={() => setTab('reviews')}/>
        </div>

        {/* ── PROBATION TAB ──────────────────────────────────────────────── */}
        {tab==='probation' && isAdmin && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={UserCheck}     label="Total on Probation"  value={total}                               iconBg="bg-almet-mystic dark:bg-almet-cloud-burst/20" iconCls="text-almet-sapphire"/>
              <StatCard icon={AlertTriangle} label="Critical (≤7d)"      value={crit}  valueCls="text-red-500"      iconBg="bg-red-50 dark:bg-red-900/20"                 iconCls="text-red-500"/>
              <StatCard icon={Clock}         label="Warning (≤14d)"      value={warn}  valueCls="text-amber-500"    iconBg="bg-amber-50 dark:bg-amber-900/20"              iconCls="text-amber-500"/>
              <StatCard icon={TrendingUp}    label="Action Required"     value={`${Math.round((crit+warn)/total*100||0)}%`} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconCls="text-emerald-500"/>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterBtn active={probFilter==='all'}      label="All"      count={total} activeClass="bg-almet-sapphire" onClick={() => setProbFilter('all')}/>
              <FilterBtn active={probFilter==='critical'} label="Critical" count={crit}  activeClass="bg-red-500"        onClick={() => setProbFilter('critical')}/>
              <FilterBtn active={probFilter==='warning'}  label="Warning"  count={warn}  activeClass="bg-amber-500"      onClick={() => setProbFilter('warning')}/>
            </div>

            {filtProbation.length===0
              ? <Empty icon={UserCheck} text={total===0 ? 'No employees in probation' : 'No results for this filter'}/>
              : <div className="space-y-2">
                  {filtProbation.map(emp => {
                    const u = URGENCY[emp.urgencyLevel] || URGENCY.normal;
                    return (
                      <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
                              <UserCheck size={15} className="text-almet-sapphire"/>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white">{emp.name}</p>
                              <p className="text-[11px] text-gray-400">{emp.employee_id} · {emp.job_title}</p>
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Building2 size={10}/>{emp.department_name}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${u.badge}`}>
                            {emp.daysRemaining}d left
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                          {[
                            ['Start Date', emp.start_date ? new Date(emp.start_date).toLocaleDateString('en-GB') : '-'],
                            ['End Date',   emp.probationEndDate ? new Date(emp.probationEndDate).toLocaleDateString('en-GB') : '-'],
                            ['Contract',   contractName(emp.contract_duration)],
                            ['Manager',    emp.line_manager_name || '-'],
                          ].map(([lbl,val]) => (
                            <div key={lbl}>
                              <p className="text-[10px] text-gray-400 mb-0.5">{lbl}</p>
                              <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate">{val}</p>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400">{emp.daysCompleted} / {emp.totalProbationDays} days</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{emp.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${u.bar}`} style={{width:`${emp.progressPercent}%`}}/>
                          </div>
                        </div>

                        {emp.urgencyLevel==='critical' && (
                          <div className="mt-2.5 flex items-start gap-1.5 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
                            <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5"/>
                            <p className="text-[11px] text-red-600 dark:text-red-400">
                              <span className="font-semibold">Urgent:</span> Review must be completed within {emp.daysRemaining} days.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
            }
          </>
        )}

        {/* ── CONTRACTS TAB ─────────────────────────────────────────────── */}
        {tab==='contracts' && (
          <>
            <div className="flex flex-wrap gap-2">
              <FilterBtn active={renewFilter==='all'}        label="All"          count={renewals.length} activeClass="bg-almet-sapphire" onClick={() => setRenewFilter('all')}/>
              <FilterBtn active={renewFilter==='urgent'}     label="Urgent ≤14d"  count={urgentContracts} activeClass="bg-amber-500"      onClick={() => setRenewFilter('urgent')}/>
              <FilterBtn active={renewFilter==='pending'}    label="Mgr Pending"  count={null}            activeClass="bg-almet-steel-blue" onClick={() => setRenewFilter('pending')}/>
              {isAdmin && <FilterBtn active={renewFilter==='pending_hr'} label="HR Pending" count={pendingHR} activeClass="bg-purple-600" onClick={() => setRenewFilter('pending_hr')}/>}
            </div>

            {filtRenewals.length===0
              ? <Empty icon={RefreshCw} text="No contract renewals found"/>
              : <div className="space-y-2">
                  {filtRenewals.map(c => {
                    const daysCls = c.days_until_expiry<=7 ? 'text-red-500' : c.days_until_expiry<=14 ? 'text-amber-500' : 'text-gray-400';
                    return (
                      <button key={c.id} onClick={() => handleContractClick(c)}
                        className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-almet-sapphire transition-colors">
                            <RefreshCw size={15} className="text-emerald-500 group-hover:text-white transition-colors"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{c.employee_name}</p>
                                <p className="text-[11px] text-gray-400">{c.employee_id} · {c.position}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${resignationExitService.helpers.getStatusColor(c.status)}`}>
                                {resignationExitService.helpers.getStatusText(c.status)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1"><Building2 size={10}/>{c.department}</span>
                              <span className="flex items-center gap-1"><Calendar size={10}/>Expires: {fmt(c.current_contract_end_date)}</span>
                              <span className={`flex items-center gap-1 font-semibold ${daysCls}`}><Clock size={10}/>{c.days_until_expiry}d left</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
            }
          </>
        )}

        {/* ── REVIEWS TAB ───────────────────────────────────────────────── */}
        {tab==='reviews' && (
          <>
            <div className="flex flex-wrap gap-2">
              <FilterBtn active={revFilter==='all'}              label="All"            count={reviews.length}                  activeClass="bg-almet-sapphire"  onClick={() => setRevFilter('all')}/>
              <FilterBtn active={revFilter==='pending'}          label="Any Pending"    count={pendingEmpRev+pendingMgrRev}    activeClass="bg-amber-500"        onClick={() => setRevFilter('pending')}/>
              <FilterBtn active={revFilter==='employee_pending'} label="Employee"       count={pendingEmpRev}                  activeClass="bg-almet-steel-blue" onClick={() => setRevFilter('employee_pending')}/>
              <FilterBtn active={revFilter==='manager_pending'}  label="Manager"        count={pendingMgrRev}                  activeClass="bg-purple-600"       onClick={() => setRevFilter('manager_pending')}/>
              <FilterBtn active={revFilter==='completed'}        label="Completed"      count={doneRev}                        activeClass="bg-emerald-600"      onClick={() => setRevFilter('completed')}/>
            </div>

            {filtReviews.length===0
              ? <Empty icon={CheckCircle} text="No probation reviews found"/>
              : <div className="space-y-2">
                  {filtReviews.map(rev => {
                    const hasEmp = rev.employee_responses?.length > 0;
                    const hasMgr = rev.manager_responses?.length > 0;
                    const done   = hasEmp && hasMgr;
                    return (
                      <div key={rev.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${done ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                            {done
                              ? <CheckCircle size={15} className="text-emerald-500"/>
                              : <Clock       size={15} className="text-amber-500"/>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{rev.employee_name}</p>
                                <p className="text-[11px] text-gray-400">{rev.employee_id} · {rev.position}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold
                                ${done ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                       : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                {done ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mb-2.5">
                              <span className="flex items-center gap-1"><Building2 size={10}/>{rev.department}</span>
                              <span className="flex items-center gap-1"><Calendar size={10}/>{rev.review_period.replace('_','-')} Review</span>
                            </div>
                            {/* response status */}
                            <div className="flex items-center gap-3 text-[11px] mb-3">
                              <span className={`flex items-center gap-1 font-semibold ${hasEmp ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                                {hasEmp ? <CheckCircle size={11}/> : <XCircle size={11}/>} Employee
                              </span>
                              <span className={`flex items-center gap-1 font-semibold ${hasMgr ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                                {hasMgr ? <CheckCircle size={11}/> : <XCircle size={11}/>} Manager
                              </span>
                            </div>
                            {/* action buttons */}
                            <div className="flex gap-2">
                              {hasEmp
                                ? <button onClick={() => handleReviewClick(rev,'EMPLOYEE',true)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-lg bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-sapphire hover:bg-almet-sapphire/10 border border-almet-sapphire/20 transition-colors">
                                    <Eye size={11}/> Employee
                                  </button>
                                : rev.employee === userRole?.employee_id
                                  ? <button onClick={() => handleReviewClick(rev,'EMPLOYEE',false)}
                                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-lg bg-almet-sapphire text-white hover:bg-almet-astral transition-colors">
                                      <CheckCircle size={11}/> Submit Review
                                    </button>
                                  : <div className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-lg bg-gray-50 dark:bg-gray-700/30 text-gray-400 border border-gray-100 dark:border-gray-700">
                                      <XCircle size={11}/> No Response
                                    </div>
                              }
                              {hasMgr
                                ? <button onClick={() => handleReviewClick(rev,'MANAGER',true)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition-colors">
                                    <Eye size={11}/> Manager
                                  </button>
                                : (userRole?.is_manager || isAdmin)
                                  ? <button onClick={() => handleReviewClick(rev,'MANAGER',false)}
                                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                                      <CheckCircle size={11}/> Submit Review
                                    </button>
                                  : <div className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-lg bg-gray-50 dark:bg-gray-700/30 text-gray-400 border border-gray-100 dark:border-gray-700">
                                      <XCircle size={11}/> No Response
                                    </div>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </>
        )}

        {/* Modals */}
        {contractModal && selContract && (
          <ContractRenewalModal contract={selContract}
            onClose={() => { setContractModal(false); setSelContract(null); }}
            onSuccess={() => { setContractModal(false); setSelContract(null); loadRenewals(); }}
            userRole={userRole}/>
        )}
        {hrModal && selContract && (
          <ContractRenewalHRModal contract={selContract}
            onClose={() => { setHrModal(false); setSelContract(null); }}
            onSuccess={() => { setHrModal(false); setSelContract(null); loadRenewals(); }}/>
        )}
        {reviewModal && selReview && (
          <ProbationReviewModal review={selReview} respondentType={respondent} viewMode={viewMode}
            onClose={() => { setReviewModal(false); setSelReview(null); setViewMode(false); }}
            onSuccess={() => { setReviewModal(false); setSelReview(null); setViewMode(false); loadReviews(); }}/>
        )}
      </div>
    </DashboardLayout>
  );
}