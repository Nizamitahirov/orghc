'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, CheckCircle2, Clock, AlertTriangle,
  Users, Layers, BarChart2, RefreshCw, Calendar,
  Sparkles, Loader2, X, ChevronDown,
} from 'lucide-react';
import taskService from '@/services/taskService';

// ── Colour tokens ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  completed:   '#10b981',
  in_progress: '#3b82f6',
  in_review:   '#8b5cf6',
  todo:        '#94a3b8',
  overdue:     '#ef4444',
};
const PRIORITY_COLORS = {
  URGENT: '#ef4444',
  HIGH:   '#f97316',
  MEDIUM: '#3b82f6',
  LOW:    '#94a3b8',
};
const PRIORITY_LABELS = { URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, darkMode }) {
  const bg  = darkMode ? 'bg-gray-800' : 'bg-white';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-100';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const mut = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`${bg} border ${brd} rounded-2xl p-5 flex items-start gap-4 shadow-sm`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold ${txt} leading-none`}>{value}</p>
        <p className={`text-xs font-medium ${mut} mt-1`}>{label}</p>
        {sub && <p className={`text-[11px] ${mut} mt-0.5`}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null;
  const bg  = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  return (
    <div className={`${bg} border rounded-xl px-3 py-2 shadow-xl text-xs`}>
      <p className={`font-semibold ${txt} mb-1`}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, darkMode, className = '' }) {
  const bg  = darkMode ? 'bg-gray-800' : 'bg-white';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-100';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const mut = darkMode ? 'text-gray-400' : 'text-gray-500';
  return (
    <div className={`${bg} border ${brd} rounded-2xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-almet-sapphire" />
        <h3 className={`text-sm font-bold ${txt}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── AI Summary Panel ──────────────────────────────────────────────────────────
function AISummaryPanel({ summary, loading, onClose, darkMode }) {
  const bg  = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-violet-50 border-violet-200';
  const txt = darkMode ? 'text-gray-100' : 'text-violet-900';
  const mut = darkMode ? 'text-gray-400' : 'text-violet-500';

  return (
    <div className={`relative rounded-2xl border p-5 shadow-sm ${bg}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${mut} mb-1.5`}>AI SUMMARY</p>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-violet-500" />
              <span className={`text-sm ${mut}`}>AI is analysing...</span>
            </div>
          ) : (
            <p className={`text-sm leading-relaxed ${txt}`}>{summary}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg ${mut} hover:bg-violet-100 dark:hover:bg-gray-700 transition-colors shrink-0`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsView({ selectedTeam, darkMode }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [aiSummary, setAiSummary]       = useState('');
  const [aiLoading, setAiLoading]       = useState(false);
  const [showSummary, setShowSummary]   = useState(false);

  const bg  = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const mut = darkMode ? 'text-gray-400' : 'text-gray-500';
  const brd = darkMode ? 'border-gray-700' : 'border-gray-200';

  const load = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError('');
    const r = await taskService.getAnalytics(selectedTeam.id);
    setLoading(false);
    if (r.success) setData(r.data);
    else setError(r.error);
  };

  const handleAiSummary = async () => {
    if (!selectedTeam) return;
    setShowSummary(true);
    setAiSummary('');
    setAiLoading(true);
    const r = await taskService.aiTeamSummary(selectedTeam.id);
    setAiLoading(false);
    if (r.success) setAiSummary(r.summary);
    else setAiSummary('Failed to generate summary.');
  };

  useEffect(() => {
    load();
    setShowSummary(false);
    setAiSummary('');
  }, [selectedTeam?.id]);

  // ── Pie data ──
  const pieData = useMemo(() => {
    if (!data) return [];
    const ov = data.overview;
    return [
      { name: 'Completed',   value: ov.completed,   color: STATUS_COLORS.completed   },
      { name: 'In Progress', value: ov.in_progress, color: STATUS_COLORS.in_progress },
      { name: 'In Review',   value: ov.in_review,   color: STATUS_COLORS.in_review   },
      { name: 'To Do',       value: ov.todo,        color: STATUS_COLORS.todo        },
    ].filter(d => d.value > 0);
  }, [data]);

  const priorityData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.by_priority)
      .map(([k, v]) => ({ name: PRIORITY_LABELS[k] || k, value: v, color: PRIORITY_COLORS[k] }))
      .filter(d => d.value > 0);
  }, [data]);

  if (!selectedTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <BarChart2 size={40} className={mut} />
        <p className={`text-sm font-medium ${mut}`}>Select a team</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="w-10 h-10 border-3 border-almet-sapphire/30 border-t-almet-sapphire rounded-full animate-spin" />
        <p className={`text-sm ${mut}`}>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <AlertTriangle size={36} className="text-red-400" />
        <p className={`text-sm font-medium ${txt}`}>{error}</p>
        <button onClick={load} className="text-xs text-almet-sapphire hover:underline">Yenidən cəhd et</button>
      </div>
    );
  }

  if (!data) return null;

  const { overview, by_employee, completion_trend, overdue_tasks } = data;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className={`text-base font-bold ${txt}`}>
            {selectedTeam.emoji || '📊'} {selectedTeam.name} — Analytics
          </h2>
          <p className={`text-xs ${mut} mt-0.5`}>Last 14 days data</p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Summary button */}
          <button
            onClick={handleAiSummary}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            title="Generate AI summary for this team"
          >
            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Summary
          </button>
          <button
            onClick={load}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${brd} text-xs ${mut} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── AI Summary Panel ── */}
      {showSummary && (
        <AISummaryPanel
          summary={aiSummary}
          loading={aiLoading}
          onClose={() => setShowSummary(false)}
          darkMode={darkMode}
        />
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Total Tasks"   value={overview.total}         icon={Layers}        color="#3b82f6" darkMode={darkMode} />
        <KpiCard label="Completed"     value={overview.completed}     icon={CheckCircle2}  color="#10b981" darkMode={darkMode} sub={`${overview.completion_rate}%`} />
        <KpiCard label="In Progress"   value={overview.in_progress}   icon={TrendingUp}    color="#8b5cf6" darkMode={darkMode} />
        <KpiCard label="To Do"         value={overview.todo}          icon={Clock}         color="#94a3b8" darkMode={darkMode} />
        <KpiCard label="Overdue"       value={overview.overdue}       icon={AlertTriangle} color="#ef4444" darkMode={darkMode} />
        <KpiCard label="Members"       value={by_employee.length}     icon={Users}         color="#f59e0b" darkMode={darkMode} />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Trend chart — 2/3 width */}
        <Section title="Task Trend (last 14 days)" icon={TrendingUp} darkMode={darkMode} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={completion_trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#6b7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#6b7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip darkMode={darkMode} />} />
              <Area type="monotone" dataKey="created"   name="Created"   stroke="#3b82f6" fill="url(#gradCreated)"   strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#gradCompleted)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-end">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-3 h-0.5 rounded bg-blue-500 inline-block" />Created</span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-3 h-0.5 rounded bg-emerald-500 inline-block" />Completed</span>
          </div>
        </Section>

        {/* Status pie — 1/3 width */}
        <Section title="Status Distribution" icon={BarChart2} darkMode={darkMode}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip darkMode={darkMode} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: d.color }} />
                  <span className={mut}>{d.name}</span>
                </span>
                <span className={`font-semibold ${txt}`}>{d.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Employee workload bar chart */}
        <Section title="Employee Workload" icon={Users} darkMode={darkMode}>
          {by_employee.length === 0 ? (
            <p className={`text-xs ${mut} text-center py-6`}>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, by_employee.slice(0,8).length * 40)}>
              <BarChart
                data={by_employee.slice(0, 8)}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                barCategoryGap="25%"
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#6b7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: darkMode ? '#d1d5db' : '#374151' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.length > 14 ? v.slice(0, 13) + '…' : v}
                />
                <Tooltip content={<ChartTooltip darkMode={darkMode} />} />
                <Bar dataKey="completed"   name="Completed"   stackId="a" fill={STATUS_COLORS.completed}   radius={[0,0,0,0]} />
                <Bar dataKey="in_progress" name="In Progress" stackId="a" fill={STATUS_COLORS.in_progress} radius={[0,0,0,0]} />
                <Bar dataKey="todo"        name="To Do"       stackId="a" fill={STATUS_COLORS.todo}        radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[['Completed','#10b981'],['In Progress','#3b82f6'],['To Do','#94a3b8']].map(([l,c]) => (
              <span key={l} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: c }} />{l}
              </span>
            ))}
          </div>
        </Section>

        {/* Overdue tasks table */}
        <Section title="Overdue Tasks" icon={AlertTriangle} darkMode={darkMode}>
          {overdue_tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <CheckCircle2 size={28} className="text-emerald-400" />
              <p className={`text-xs font-medium ${mut}`}>No overdue tasks 🎉</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {overdue_tasks.map((t, i) => (
                <div key={t.id || i} className={`flex items-start gap-3 p-2.5 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-red-50/60'} border ${darkMode ? 'border-gray-600' : 'border-red-100'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${txt} truncate`}>{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
                        <Calendar size={9} />{t.days_late} day{t.days_late !== 1 ? 's' : ''} overdue
                      </span>
                      {t.assignees.length > 0 && (
                        <span className={`text-[10px] ${mut}`}>{t.assignees.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    t.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    t.priority === 'HIGH'   ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {PRIORITY_LABELS[t.priority] || t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ── Employee performance table ── */}
      <Section title="Employee Performance" icon={Users} darkMode={darkMode}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={`${mut} text-left border-b ${brd}`}>
                <th className="pb-2 font-semibold pl-1">Employee</th>
                <th className="pb-2 font-semibold text-right">Total</th>
                <th className="pb-2 font-semibold text-right">Completed</th>
                <th className="pb-2 font-semibold text-right">In Progress</th>
                <th className="pb-2 font-semibold text-right text-red-500">Overdue</th>
                <th className="pb-2 font-semibold text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {by_employee.map(emp => (
                <tr key={emp.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="py-2.5 pl-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-almet-sapphire to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {emp.name[0]}
                      </div>
                      <span className={`font-medium ${txt} truncate max-w-[140px]`}>{emp.name}</span>
                    </div>
                  </td>
                  <td className={`py-2.5 text-right font-semibold ${txt}`}>{emp.total}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{emp.completed}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="text-blue-500 font-semibold">{emp.in_progress}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={emp.overdue > 0 ? 'text-red-500 font-bold' : `${mut}`}>{emp.overdue}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-16 h-1.5 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${emp.completion_rate}%` }}
                        />
                      </div>
                      <span className={`font-semibold ${txt} w-8 text-right`}>{emp.completion_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

    </div>
  );
}
