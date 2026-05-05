"use client";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  UserPlus, Settings, Search, ChevronDown, Check, X, Clock,
  Briefcase, Mail, Phone, User, Calendar, Save, RefreshCw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const token = () => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : "");
const hdrs  = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

const STATUS_CFG = {
  PENDING:   { label: "Pending",    bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  REVIEWING: { label: "Reviewing",  bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"  },
  HIRED:     { label: "Hired",      bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  REJECTED:  { label: "Rejected",   bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"   },
};

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function StatusDropdown({ current, onChange }) {
  const [open, setOpen] = useState(false);
  const options = ["PENDING", "REVIEWING", "HIRED", "REJECTED"];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        <StatusBadge status={current} />
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[130px]">
          {options.map(s => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition"
            >
              {current === s && <Check className="h-3 w-3 text-almet-sapphire" />}
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReferralsAdminPage() {
  const [tab, setTab] = useState("list");

  // ── List state ──────────────────────────────────────────────────
  const [referrals, setReferrals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // ── Settings state ──────────────────────────────────────────────
  const [settings,     setSettings]     = useState(null);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg,  setSettingsMsg]  = useState("");

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/referrals/`, { headers: hdrs() });
      if (res.ok) {
        const data = await res.json();
        setReferrals(Array.isArray(data) ? data : (data.results ?? []));
      }
    } catch {}
    setLoading(false);
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/referral-settings/`, { headers: hdrs() });
      if (res.ok) setSettings(await res.json());
    } catch {}
  }, []);

  useEffect(() => { loadReferrals(); loadSettings(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/referrals/${id}/update-status/`, {
        method: "PATCH",
        headers: hdrs(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch {}
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      const res = await fetch(`${API}/referral-settings/`, {
        method: "POST",
        headers: hdrs(),
        body: JSON.stringify({
          notification_emails: settings.notification_emails,
          reward_amount: settings.reward_amount,
        }),
      });
      if (res.ok) {
        setSettings(await res.json());
        setSettingsDirty(false);
        setSettingsMsg("Settings saved.");
      } else {
        setSettingsMsg("Save failed.");
      }
    } catch {
      setSettingsMsg("Save failed.");
    }
    setSavingSettings(false);
  };

  const fmt = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const displayed = referrals.filter(r => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.referred_name?.toLowerCase().includes(q) ||
        r.referred_email?.toLowerCase().includes(q) ||
        r.referrer_name?.toLowerCase().includes(q) ||
        r.position?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = referrals.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-almet-sapphire/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-almet-sapphire" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Employee Referrals</h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage referral submissions and notification settings</p>
            </div>
          </div>
          <button onClick={loadReferrals} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["PENDING","REVIEWING","HIRED","REJECTED"].map(s => {
            const c = STATUS_CFG[s];
            return (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}
                className={`rounded-xl p-4 text-center border transition-all ${
                  filterStatus === s ? "ring-2 ring-almet-sapphire shadow-md" : ""
                } ${c.bg} border-transparent`}>
                <p className={`text-2xl font-bold ${c.text}`}>{counts[s] || 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {[{ id: "list", label: "Referral List" }, { id: "settings", label: "Settings" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-all ${
                tab === t.id
                  ? "border-almet-sapphire text-almet-sapphire"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── List tab ── */}
        {tab === "list" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, position…"
                  className="pl-9 pr-3 py-2 text-xs w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-almet-sapphire"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <div className="w-4 h-4 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Loading referrals…</span>
              </div>
            ) : displayed.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">No referrals found.</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {displayed.map(r => (
                  <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    {/* Candidate */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-almet-sapphire/10 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-4 w-4 text-almet-sapphire" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.referred_name}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-gray-500">
                            {r.referred_email && (
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{r.referred_email}</span>
                            )}
                            {r.referred_phone && (
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.referred_phone}</span>
                            )}
                            {r.position && (
                              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{r.position}</span>
                            )}
                          </div>
                          {r.notes && (
                            <p className="mt-1.5 text-[11px] text-gray-400 italic">"{r.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Referrer + meta */}
                    <div className="flex flex-col gap-1.5 text-[11px] text-gray-500 sm:text-right shrink-0">
                      <span className="flex items-center gap-1 sm:justify-end">
                        <UserPlus className="h-3 w-3" />
                        <strong className="text-gray-700 dark:text-gray-300">{r.referrer_name}</strong>
                      </span>
                      {r.referrer_dept && <span>{r.referrer_dept}</span>}
                      <span className="flex items-center gap-1 sm:justify-end">
                        <Calendar className="h-3 w-3" />{fmt(r.created_at)}
                      </span>
                      <span className="text-almet-sapphire font-semibold">{r.reward_amount} AZN</span>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      <StatusDropdown current={r.status} onChange={ns => handleStatusChange(r.id, ns)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Settings tab ── */}
        {tab === "settings" && settings && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-4 w-4 text-almet-sapphire" />
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Referral Notification Settings</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  HR Notification Emails
                </label>
                <textarea
                  rows={4}
                  value={settings.notification_emails}
                  onChange={e => { setSettings(s => ({ ...s, notification_emails: e.target.value })); setSettingsDirty(true); }}
                  placeholder="email1@company.com, email2@company.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50 resize-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">Comma-separated list of emails that receive a notification when a referral is submitted.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  Reward Amount 
                </label>
                <input
                  type="number" min="0" step="10"
                  value={settings.reward_amount}
                  onChange={e => { setSettings(s => ({ ...s, reward_amount: e.target.value })); setSettingsDirty(true); }}
                  className="w-32 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50"
                />
                <p className="text-[10px] text-gray-400 mt-1">Shown in notification emails and on the submission form.</p>
              </div>

              {settingsMsg && (
                <p className={`text-xs ${settingsMsg.includes("saved") ? "text-green-600" : "text-red-500"}`}>
                  {settingsMsg}
                </p>
              )}

              <button
                onClick={saveSettings}
                disabled={!settingsDirty || savingSettings}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst disabled:opacity-50 transition"
              >
                <Save className="h-3.5 w-3.5" />
                {savingSettings ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
