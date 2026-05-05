"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { employeeService } from "@/services/newsService";
import { Download, X, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";

// ── Almet brand colours ───────────────────────────────────────────
const C = {
  sapphire:   "#30539b",
  cloudBurst: "#253360",
  astral:     "#336fa5",
  steelBlue:  "#4e7db5",
  baliHai:    "#90a0b9",
  waterloo:   "#7a829a",
  amber:      "#EF9F27",
  teal:       "#1D9E75",
  coral:      "#D85A30",
  violet:     "#7C3AED",
};

const GENDER_COLORS = [C.sapphire, "#c2607a", C.waterloo];   // blue=M, rose=F, gray=Unknown
const GEN_COLORS    = ["#1a3458", C.cloudBurst, "#1e7a6e", C.sapphire, C.steelBlue, "#c8d3e3"];
const TENURE_COLORS = [C.cloudBurst, C.sapphire, C.teal, C.amber, C.waterloo]; // 5th = Unknown
const EXIT_COLORS   = [C.teal, C.coral, C.amber, C.violet];

const EXIT_TYPES = [
  { code: "voluntary_resignation",   label: "Voluntary Resignation",   color: C.teal   },
  { code: "termination",             label: "Termination",             color: C.coral  },
  { code: "end_of_internship",       label: "End of Internship",       color: C.amber  },
  { code: "probation_period_failed", label: "Probation Period Failed", color: C.violet },
];

const EXIT_INTERVIEW_SECTIONS = [
  { id: "ROLE",         label: "Role & Responsibilities",    short: "Role",    color: C.cloudBurst },
  { id: "MANAGEMENT",   label: "Management & Leadership",    short: "Mgmt",    color: C.sapphire  },
  { id: "COMPENSATION", label: "Compensation & Growth",      short: "Comp",    color: C.astral    },
  { id: "CONDITIONS",   label: "Work Conditions",            short: "Cond",    color: C.steelBlue },
  { id: "CULTURE",      label: "Culture & Values",           short: "Culture", color: C.baliHai   },
];

// ── Helpers ───────────────────────────────────────────────────────
function getAge(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}
function getGeneration(age) {
  if (age === null) return "Unknown";
  if (age >= 60) return "Baby Boomers (60+)";
  if (age >= 44) return "Gen X (44–59)";
  if (age >= 28) return "Millennials (28–43)";
  if (age >= 18) return "Gen Z (18–27)";
  return "Gen Alpha (<18)";
}
function getTenureBand(startDate) {
  if (!startDate) return "Unknown";
  const y = (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (y < 1) return "0–1 year";
  if (y < 3) return "1–3 years";
  if (y < 5) return "3–5 years";
  return "5+ years";
}
function pct(n, d) {
  return d ? `${Math.round((n / d) * 100)}%` : "0%";
}
function toLeaverRow(r) {
  return {
    full_name: r.name || '—',
    job_title: r.job_title || '',
    department_name: r.department || '',
    business_function_name: r.company || '',
    start_date: r.hire_date || null,
    date_of_birth: null,
    gender: null,
  };
}

// ── Sub-components ────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, highlight, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 flex flex-col gap-1 transition-all ${
        highlight ? "border-orange-300 dark:border-orange-700" : "border-gray-200 dark:border-gray-700"
      } ${onClick ? "cursor-pointer hover:shadow-md hover:border-almet-sapphire/40" : ""}`}
    >
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold" style={{ color: color || C.cloudBurst }}>{value}</span>
      {sub && <span className="text-xs text-gray-400 dark:text-gray-500">{sub}</span>}
      {onClick && <span className="text-[10px] text-almet-sapphire/60 mt-0.5">Click to view employees</span>}
    </div>
  );
}

function SectionHeader({ title, subtitle, badge }) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div>
        <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-steel-blue/20 dark:text-almet-steel-blue">
          {badge}
        </span>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs shadow">
      <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
}

function HBar({ label, count, total, color, onClick }) {
  const w = total ? Math.round((count / total) * 100) : 0;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 text-xs rounded-lg px-1 py-0.5 transition-colors ${onClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" : ""}`}
    >
      <span className="w-36 text-gray-600 dark:text-gray-300 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="w-7 text-right text-gray-500 dark:text-gray-400">{count}</span>
      <span className="w-10 text-right font-medium" style={{ color }}>{pct(count, total)}</span>
    </div>
  );
}

function MetricBox({ value, label, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 text-center flex flex-col gap-1 transition-all ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
      style={{ background: color + "18", border: `1px solid ${color}35` }}
    >
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>}
    </div>
  );
}

// ── Employee List Modal ───────────────────────────────────────────
function EmployeeListModal({ title, employees, onClose }) {
  if (!employees) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-almet-sapphire" />
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{title}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-almet-sapphire/10 text-almet-sapphire font-medium">
              {employees.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4">
          {employees.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No employees found.</p>
          ) : (
            <div className="space-y-1">
              {employees.map((e, i) => {
                const name = e.full_name || e.name || "—";
                const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
                const age = e.date_of_birth ? getAge(e.date_of_birth) : null;
                const tenure = e.start_date ? getTenureBand(e.start_date) : null;
                const secondary = [e.job_title, e.department_name || e.business_function_name].filter(Boolean).join(" · ");
                return (
                  <div
                    key={e.id || i}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-almet-sapphire/10 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-almet-sapphire">{initials || "?"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{name}</p>
                      {secondary && <p className="text-[10px] text-gray-400 truncate">{secondary}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 text-[10px] text-gray-400">
                      {age !== null && <span>Age {age}</span>}
                      {tenure && <span>{tenure}</span>}
                      {e.gender && <span>{e.gender === "M" ? "Male" : e.gender === "F" ? "Female" : e.gender}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Turnover Skeleton ────────────────────────────────────────────
function TurnoverSkeleton() {
  return (
    <div className="space-y-4 animate-pulse py-4">
      <div className="grid grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl" />
        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function HRAnalyticsPage() {
  const router = useRouter();
  const [employees,       setEmployees]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [bfFilter,        setBfFilter]        = useState("ALL");
  const [deptFilter,      setDeptFilter]      = useState("ALL");
  const [yearFilter,      setYearFilter]      = useState(new Date().getFullYear());
  const [turnoverData,    setTurnoverData]    = useState(null);
  const [turnoverLoading, setTurnoverLoading] = useState(true);
  const [exporting,       setExporting]       = useState(false);
  const [exitInterviews,  setExitInterviews]  = useState([]);
  const [exitLoading,     setExitLoading]     = useState(true);
  const [activeTab,       setActiveTab]       = useState("age");
  const [modal,           setModal]           = useState(null); // { title, employees }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let allEmployees = [];
        let page = 1;
        while (true) {
          const res = await employeeService.getEmployees({ page, page_size: 200 });
          const results = res.results || res.data?.results || (Array.isArray(res) ? res : []);
          allEmployees = allEmployees.concat(results);
          if (!res.next && !(res.data?.next)) break;
          page++;
          if (page > 20) break;
        }
        setEmployees(allEmployees);

        // Auto-select BF when the employee list only contains a single BF
        // (happens for scoped admin roles — backend already filters by their scope)
        const uniqueBfs = [...new Set(allEmployees.map(e => e.business_function_name).filter(Boolean))];
        if (uniqueBfs.length === 1) {
          setBfFilter(uniqueBfs[0]);
        }
      } catch (err) {
        setError("Failed to load employees");
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setTurnoverLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const bfParam = bfFilter !== "ALL" ? `&business_function=${encodeURIComponent(bfFilter)}` : "";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/employees/turnover-report/?year=${yearFilter}${bfParam}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) setTurnoverData(await res.json());
        else setTurnoverData(null);
      } catch { setTurnoverData(null); }
      finally { setTurnoverLoading(false); }
    })();
  }, [yearFilter, bfFilter]);

  useEffect(() => {
    (async () => {
      setExitLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/exit-interviews/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.results || []);
          // Fetch details for each interview to get responses (batch, max 50)
          const detailed = await Promise.all(
            list.slice(0, 50).map(async (ei) => {
              try {
                const r = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/exit-interviews/${ei.id}/`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                return r.ok ? r.json() : ei;
              } catch { return ei; }
            })
          );
          setExitInterviews(detailed);
        }
      } catch { setExitInterviews([]); }
      finally { setExitLoading(false); }
    })();
  }, []);

  // ── Export handler ────────────────────────────────────────────
  const handleExport = async () => {
    if (!turnoverData) return;
    setExporting(true);
    try {
      const { exportTurnoverReport } = await import("./exportTurnoverExcel");
      exportTurnoverReport(turnoverData, yearFilter, normalisedActive);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  // ── BF filter list ────────────────────────────────────────────
  // Backend already scopes the employee list by role, so this naturally
  // shows only accessible BFs without any extra frontend filtering.
  const bfList = useMemo(() => {
    const s = new Set(employees.map(e => e.business_function_name).filter(Boolean));
    return ["ALL", ...Array.from(s).sort()];
  }, [employees]);

  // ── Active employees ──────────────────────────────────────────
  const active = useMemo(() => employees.filter(e => {
    if (e.is_deleted) return false;
    if (bfFilter !== "ALL" && e.business_function_name !== bfFilter) return false;
    if (deptFilter !== "ALL" && e.department_name !== deptFilter) return false;
    return true;
  }), [employees, bfFilter, deptFilter]);

  const deptList = useMemo(() => {
    const s = new Set(employees.filter(e => !e.is_deleted && (bfFilter === "ALL" || e.business_function_name === bfFilter)).map(e => e.department_name).filter(Boolean));
    return ["ALL", ...Array.from(s).sort()];
  }, [employees, bfFilter]);

  // Also update gender mapping — /employees/ returns "M"/"F" or "Male"/"Female" depending on version
  // Normalise gender: MALE/Male/M → "M",  FEMALE/Female/F → "F",  else null
  const normalisedActive = useMemo(() => {
    // First pass: build a canonical display name per business function (grouped by lowercase key)
    const bfCanonical = {};
    active.forEach(e => {
      const raw = (e.business_function_name || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      // Prefer the version that looks most "proper": mixed-case > all-upper > empty
      if (!bfCanonical[key] || raw.toLowerCase() !== raw) bfCanonical[key] = raw;
    });

    return active.map(e => {
      const g = (e.gender || "").toUpperCase().trim();
      const normGender = g === "MALE" || g === "M" ? "M" : g === "FEMALE" || g === "F" ? "F" : null;
      const rawBf = (e.business_function_name || "").trim();
      const normBf = rawBf ? (bfCanonical[rawBf.toLowerCase()] || rawBf) : null;
      return { ...e, gender: normGender, business_function_name: normBf };
    });
  }, [active]);

  const total = normalisedActive.length;

  // ── Demographics analytics ────────────────────────────────────
  const analytics = useMemo(() => {
    const genderMap = {};
    normalisedActive.forEach(e => { const g = e.gender || "Unknown"; genderMap[g] = (genderMap[g] || 0) + 1; });
    // Canonical order: M, F, Unknown
    const genderData = ["M","F","Unknown"].filter(k => genderMap[k]).map(k => ({ name: k, value: genderMap[k] }));

    const levelGender = {};
    normalisedActive.forEach(e => {
      const lvl = e.position_group_name || "Other";
      if (!levelGender[lvl]) levelGender[lvl] = { Male: 0, Female: 0, Unknown: 0 };
      levelGender[lvl][e.gender === "M" ? "Male" : e.gender === "F" ? "Female" : "Unknown"]++;
    });
    const levelGenderData = Object.entries(levelGender).map(([name, v]) => ({
      name: name.length > 14 ? name.slice(0, 13) + "…" : name,
      Male: v.Male, Female: v.Female, Unknown: v.Unknown,
    }));

    const genOrder = ["Baby Boomers (60+)","Gen X (44–59)","Millennials (28–43)","Gen Z (18–27)","Gen Alpha (<18)","Unknown"];
    const genMap = {};
    normalisedActive.forEach(e => { const g = getGeneration(getAge(e.date_of_birth)); genMap[g] = (genMap[g] || 0) + 1; });
    const genData = genOrder.filter(g => genMap[g]).map(name => ({ name, value: genMap[name] }));

    // Retirement age: 67 for UK employees, 65 for everyone else
    const retirementRiskEmployees = normalisedActive.filter(e => {
      const a = getAge(e.date_of_birth);
      if (a === null) return false;
      const retireAge = (e.business_function_name || '').toUpperCase().includes('UK') ? 67 : 65;
      return a >= retireAge;
    });
    const retirementRisk = retirementRiskEmployees.length;

    const ageBuckets = { "< 25": 0, "25–34": 0, "35–44": 0, "45–54": 0, "55–64": 0, "65+": 0 };
    normalisedActive.forEach(e => {
      const a = getAge(e.date_of_birth);
      if (a === null) return;
      if (a < 25) ageBuckets["< 25"]++;
      else if (a < 35) ageBuckets["25–34"]++;
      else if (a < 45) ageBuckets["35–44"]++;
      else if (a < 55) ageBuckets["45–54"]++;
      else if (a < 65) ageBuckets["55–64"]++;
      else ageBuckets["65+"]++;
    });
    const ageData = Object.entries(ageBuckets).map(([name, value]) => ({ name, value }));

    const tenureOrder = ["0–1 year","1–3 years","3–5 years","5+ years","Unknown"];
    const tenureMap = {};
    normalisedActive.forEach(e => { const b = getTenureBand(e.start_date); tenureMap[b] = (tenureMap[b] || 0) + 1; });
    const tenureData = tenureOrder.filter(t => tenureMap[t]).map(name => ({ name, value: tenureMap[name] }));

    const tenureYears = normalisedActive.map(e => e.start_date ? (Date.now() - new Date(e.start_date)) / (1000*60*60*24*365.25) : null).filter(Boolean);
    const avgTenure = tenureYears.length ? (tenureYears.reduce((a,b)=>a+b,0)/tenureYears.length).toFixed(1) : "—";

    const bfGender = {};
    normalisedActive.forEach(e => {
      const bf = e.business_function_name || "Unknown";
      if (!bfGender[bf]) bfGender[bf] = { Male: 0, Female: 0, total: 0 };
      const g = e.gender === "M" ? "Male" : e.gender === "F" ? "Female" : null;
      if (g) bfGender[bf][g]++;
      bfGender[bf].total++;
    });
    const bfGenderData = Object.entries(bfGender)
      .map(([name, v]) => ({
        name,   // full name — Y-axis width is wide enough now
        Male: v.Male,
        Female: v.Female,
        Unknown: v.total - v.Male - v.Female,
      }))
      .sort((a,b) => (b.Male+b.Female+b.Unknown)-(a.Male+a.Female+a.Unknown));

    return { genderData, levelGenderData, genData, ageData, tenureData, retirementRisk, retirementRiskEmployees, avgTenure, bfGenderData };
  }, [normalisedActive]);

  // ── Exit Interview analytics ──────────────────────────────────
  const exitAnalytics = useMemo(() => {
    // Filter by bfFilter so the analytics update when the dropdown changes
    const filtered = bfFilter === "ALL"
      ? exitInterviews
      : exitInterviews.filter(ei => {
          const bf = ei.business_function_name || ei.employee_business_function_name || "";
          return bf === bfFilter;
        });
    const withResponses = filtered.filter(ei => ei.responses?.length > 0);
    const total = filtered.length;
    const completed = withResponses.length;

    // Avg rating per section (rating_value field — not "rating")
    const sectionRatings = {};
    EXIT_INTERVIEW_SECTIONS.forEach(s => { sectionRatings[s.id] = { sum: 0, count: 0 }; });

    withResponses.forEach(ei => {
      (ei.responses || []).forEach(r => {
        if (r.rating_value != null && sectionRatings[r.section]) {
          sectionRatings[r.section].sum += Number(r.rating_value);
          sectionRatings[r.section].count += 1;
        }
      });
    });

    const radarData = EXIT_INTERVIEW_SECTIONS.map(s => {
      const d = sectionRatings[s.id];
      const avg = d.count > 0 ? Math.round((d.sum / d.count) * 10) / 10 : null;
      return { section: s.short, label: s.label, avg, color: s.color, fullMark: 5 };
    }).filter(d => d.avg !== null);

    const overallAvg = radarData.length
      ? Math.round((radarData.reduce((a, b) => a + b.avg, 0) / radarData.length) * 10) / 10
      : null;

    const worstSection = radarData.length
      ? radarData.reduce((a, b) => (b.avg < a.avg ? b : a), radarData[0])
      : null;

    const bestSection = radarData.length
      ? radarData.reduce((a, b) => (b.avg > a.avg ? b : a), radarData[0])
      : null;

    // ── Text response analysis ────────────────────────────────
    // Group text answers by question; find low-rated questions
    const questionTextMap = {};
    const questionRatingMap = {};

    withResponses.forEach(ei => {
      (ei.responses || []).forEach(r => {
        const qKey = r.question_text_en || String(r.question);
        const section = r.section;

        if ((r.question_type === "TEXT" || r.question_type === "TEXTAREA") && r.text_value?.trim()) {
          if (!questionTextMap[qKey]) questionTextMap[qKey] = { text: qKey, section, responses: [], count: 0 };
          questionTextMap[qKey].responses.push(r.text_value.trim());
          questionTextMap[qKey].count++;
        }
        if (r.rating_value != null && r.question_type === "RATING") {
          if (!questionRatingMap[qKey]) questionRatingMap[qKey] = { text: qKey, section, sum: 0, count: 0 };
          questionRatingMap[qKey].sum += Number(r.rating_value);
          questionRatingMap[qKey].count++;
        }
      });
    });

    // Questions with most text responses (employees felt strongly enough to write)
    const textQuestions = Object.values(questionTextMap).sort((a, b) => b.count - a.count);

    // Lowest-rated individual questions (avg < 4, at least 1 response)
    const lowRatedQuestions = Object.values(questionRatingMap)
      .map(q => ({ ...q, avg: Math.round((q.sum / q.count) * 10) / 10 }))
      .filter(q => q.avg < 4)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 6);

    return { total, completed, radarData, overallAvg, worstSection, bestSection, textQuestions, lowRatedQuestions };
  }, [exitInterviews, bfFilter]);

  // ── Workforce Analytics ───────────────────────────────────────
  const workforceAnalytics = useMemo(() => {
    const total = normalisedActive.length;
    if (total === 0) return null;

    // Build span-of-control map: managerHcNumber → count of direct reports
    const spanMap = {};
    normalisedActive.forEach(e => {
      if (e.line_manager_hc_number) {
        spanMap[e.line_manager_hc_number] = (spanMap[e.line_manager_hc_number] || 0) + 1;
      }
    });

    // Find managers from the active list
    const managers = normalisedActive
      .filter(e => spanMap[e.employee_id])
      .map(e => ({
        id: e.id,
        name: e.full_name || e.name || e.employee_id,
        directReports: spanMap[e.employee_id],
        jobTitle: e.job_title || '',
        bf: e.business_function_name || '',
      }))
      .sort((a, b) => b.directReports - a.directReports);

    const managerCount = managers.length;
    const totalReports = managers.reduce((s, m) => s + m.directReports, 0);
    const avgSpan = managerCount > 0 ? (totalReports / managerCount).toFixed(1) : '—';
    const icCount = total - managerCount;

    const spanDist = [
      { name: 'IC (0)', label: 'Individual Contributor', count: icCount, color: '#94a3b8' },
      { name: 'Narrow (1–3)', label: 'Narrow span', count: managers.filter(m => m.directReports <= 3).length, color: '#f59e0b' },
      { name: 'Balanced (4–8)', label: 'Balanced span', count: managers.filter(m => m.directReports >= 4 && m.directReports <= 8).length, color: '#10b981' },
      { name: 'Wide (9+)', label: 'Wide span', count: managers.filter(m => m.directReports >= 9).length, color: '#ef4444' },
    ].filter(d => d.count > 0);

    return { total, avgSpan, managerCount, icCount, managers: managers.slice(0, 15), spanDist };
  }, [normalisedActive]);

  // ── Headcount monthly trend ───────────────────────────────────
  const headcountTrend = useMemo(() => {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const rows = MONTHS.map((m) => ({ month: m, joiners: 0, leavers: 0 }));

    // Field name helpers — backend returns start_date / termination_date
    const joinDate  = (e) => e.start_date  || e.hire_date       || e.date_of_joining;
    const leaveDate = (e) => e.termination_date || e.date_of_leaving || e.last_working_day;

    employees.forEach((emp) => {
      const jd = joinDate(emp);
      if (jd) {
        const d = new Date(jd);
        if (!isNaN(d) && d.getFullYear() === yearFilter) rows[d.getMonth()].joiners++;
      }
      const ld = leaveDate(emp);
      if (ld) {
        const d = new Date(ld);
        if (!isNaN(d) && d.getFullYear() === yearFilter) rows[d.getMonth()].leavers++;
      }
    });

    // Baseline: joined BEFORE yearFilter and had NOT already left before yearFilter
    const baseline = employees.filter((e) => {
      const jd = joinDate(e);
      if (!jd) return false;
      const jYear = new Date(jd).getFullYear();
      if (isNaN(jYear) || jYear >= yearFilter) return false;
      const ld = leaveDate(e);
      if (ld) {
        const lYear = new Date(ld).getFullYear();
        if (!isNaN(lYear) && lYear < yearFilter) return false; // left before this year
      }
      return true;
    }).length;

    let running = baseline;
    return rows.map((r) => {
      running += r.joiners - r.leavers;
      return { ...r, total: running };
    });
  }, [employees, yearFilter]);

  // ── Tab definitions ───────────────────────────────────────────
  const TABS = [
    { id: "age",       label: "Age Demographics" },
    { id: "gender",    label: "Gender Demographics" },
    { id: "tenure",    label: "Tenure" },
    { id: "hc-trend",  label: "Headcount Trend" },
    { id: "turnover",  label: "Headcount & Turnover" },
    { id: "exit",      label: "Exit Interviews" },
    { id: "workforce", label: "Workforce Analytics" },
  ];

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96 gap-3">
        <div className="w-5 h-5 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading analytics…</span>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <span className="text-sm text-red-500">{error}</span>
        <button onClick={() => router.refresh()} className="text-xs px-4 py-2 rounded-lg border border-almet-sapphire text-almet-sapphire">Retry</button>
      </div>
    </DashboardLayout>
  );

  const { genderData, levelGenderData, genData, ageData, tenureData, retirementRisk, retirementRiskEmployees, avgTenure, bfGenderData } = analytics;
  const maleCount   = genderData.find(g => g.name === "M")?.value || 0;
  const femaleCount = genderData.find(g => g.name === "F")?.value || 0;
  const currentYear = new Date().getFullYear();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">HR Analytics Report</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Age · Gender · Tenure · Headcount & Turnover · Exit Interviews</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select value={bfFilter} onChange={e => { setBfFilter(e.target.value); setDeptFilter("ALL"); }}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-almet-sapphire">
              {bfList.map(bf => <option key={bf} value={bf}>{bf === "ALL" ? "All Business Functions" : bf}</option>)}
            </select>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-almet-sapphire">
              {deptList.map(d => <option key={d} value={d}>{d === "ALL" ? "All Departments" : d}</option>)}
            </select>
            <select value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-almet-sapphire">
              {[currentYear, currentYear-1, currentYear-2].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={handleExport}
              disabled={exporting || !turnoverData}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst disabled:opacity-50 transition"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? "Exporting…" : "Export Excel"}
            </button>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total Employees" value={total} color={C.cloudBurst}
            onClick={() => setModal({ title: "All Active Employees", employees: normalisedActive })} />
          <KpiCard label="Male" value={maleCount} sub={pct(maleCount, total)} color={C.sapphire}
            onClick={() => setModal({ title: "Male Employees", employees: normalisedActive.filter(e => e.gender === "M") })} />
          <KpiCard label="Female" value={femaleCount} sub={pct(femaleCount, total)} color="#c2607a"
            onClick={() => setModal({ title: "Female Employees", employees: normalisedActive.filter(e => e.gender === "F") })} />
          <KpiCard label="Retirement Risk" value={retirementRisk} sub="at retirement age (65/67)"
            color={C.coral} highlight={retirementRisk > 0}
            onClick={() => setModal({ title: "Employees at Retirement Age (65 / UK: 67)", employees: retirementRiskEmployees })} />
          <KpiCard label="Avg Tenure" value={`${avgTenure} yrs`} color={C.astral}
            onClick={() => setModal({ title: "Employees with Known Tenure", employees: normalisedActive.filter(e => e.start_date) })} />
          <KpiCard label="Long-term Staff" value={tenureData.find(t=>t.name==="5+ years")?.value||0} sub="5+ years" color={C.teal}
            onClick={() => setModal({ title: "Long-term Staff (5+ years)", employees: normalisedActive.filter(e => getTenureBand(e.start_date) === "5+ years") })} />
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-almet-sapphire text-almet-sapphire dark:text-almet-steel-blue dark:border-almet-steel-blue"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Section 1: Age Demographics ── */}
        {activeTab === "age" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">Age Demographics</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Staff distribution by generation type and age group</p>
            </div>
            <button
              onClick={async () => { const { exportAgeSection } = await import("./exportDemographics"); exportAgeSection(normalisedActive); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-almet-sapphire/40 text-almet-sapphire hover:bg-almet-sapphire/5 transition"
            >
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Distribution by generation</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={genData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {genData.map((_,i) => <Cell key={i} fill={GEN_COLORS[i % GEN_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v=>[`${v} employees`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1 flex-1 w-full">
                  {genData.map((g,i) => (
                    <HBar key={g.name} label={g.name} count={g.value} total={total} color={GEN_COLORS[i%GEN_COLORS.length]}
                      onClick={() => setModal({
                        title: g.name === "Unknown" ? "Employees with Unknown Age" : `${g.name} Employees`,
                        employees: g.name === "Unknown"
                          ? normalisedActive.filter(e => getAge(e.date_of_birth) === null)
                          : normalisedActive.filter(e => getGeneration(getAge(e.date_of_birth)) === g.name)
                      })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Age group distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Employees" radius={[6,6,0,0]}>
                    {ageData.map((_,i) => <Cell key={i} fill={GEN_COLORS[i % GEN_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Unknown age note */}
          {normalisedActive.filter(e => !e.date_of_birth).length > 0 && (
            <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 italic">
              * {normalisedActive.filter(e => !e.date_of_birth).length} employee{normalisedActive.filter(e => !e.date_of_birth).length > 1 ? "s" : ""} have no date of birth on record (shown as "Unknown").
            </div>
          )}
          {retirementRisk > 0 && (
            <button
              onClick={() => setModal({ title: "Employees at Retirement Age (65 / UK: 67)", employees: retirementRiskEmployees })}
              className="mt-4 w-full text-left flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: C.coral }} />
              <p className="text-xs text-orange-700 dark:text-orange-300">
                <strong>{retirementRisk} employee{retirementRisk>1?"s":""} ({pct(retirementRisk,total)})</strong> have reached retirement age (65 for AZ, 67 for UK). Succession planning recommended.{" "}
                <span className="underline">Click to view employees →</span>
              </p>
            </button>
          )}
        </div>

        )}

        {/* ── Section 2: Gender Demographics ── */}
        {activeTab === "gender" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">Gender Demographics</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Gender ratio across workforce and by organisational level</p>
            </div>
            <button
              onClick={async () => { const { exportGenderSection } = await import("./exportDemographics"); exportGenderSection(normalisedActive); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-almet-sapphire/40 text-almet-sapphire hover:bg-almet-sapphire/5 transition"
            >
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Overall gender ratio</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {genderData.map((_,i) => <Cell key={i} fill={GENDER_COLORS[i%GENDER_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v=>[`${v} employees`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1 flex-1 w-full">
                  {genderData.map((g,i) => {
                    const label = g.name === "M" ? "MALE" : g.name === "F" ? "FEMALE" : "Unknown";
                    const filter = g.name === "M"
                      ? normalisedActive.filter(e => e.gender === "M")
                      : g.name === "F"
                      ? normalisedActive.filter(e => e.gender === "F")
                      : normalisedActive.filter(e => e.gender !== "M" && e.gender !== "F");
                    return (
                      <HBar key={g.name} label={label} count={g.value} total={total}
                        color={GENDER_COLORS[i%GENDER_COLORS.length]}
                        onClick={() => setModal({ title: `${label} Employees`, employees: filter })}
                      />
                    );
                  })}
                </div>
              </div>
              {normalisedActive.filter(e => e.gender !== "M" && e.gender !== "F").length > 0 && (
                <p className="mt-3 text-xs text-gray-400 italic">
                  * {normalisedActive.filter(e => e.gender !== "M" && e.gender !== "F").length} employees have no gender on record.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Gender by business function</p>
              <ResponsiveContainer width="100%" height={Math.max(200, bfGenderData.length * 44)}>
                <BarChart data={bfGenderData} layout="vertical" barSize={14} margin={{ left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Male"    name="Male"    stackId="a" fill={C.sapphire} />
                  <Bar dataKey="Female"  name="Female"  stackId="a" fill="#c2607a" />
                  <Bar dataKey="Unknown" name="Unknown" stackId="a" fill={C.waterloo} radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {levelGenderData.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Gender by position group (Board / Management / Staff)</p>
              <ResponsiveContainer width="100%" height={Math.max(160, levelGenderData.length * 36)}>
                <BarChart data={levelGenderData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Male"    name="Male"    stackId="a" fill={C.sapphire} />
                  <Bar dataKey="Female"  name="Female"  stackId="a" fill="#c2607a" />
                  <Bar dataKey="Unknown" name="Unknown" stackId="a" fill={C.waterloo} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        )}

        {/* ── Section 3: Tenure ── */}
        {activeTab === "tenure" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">Tenure (Service Length)</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">How long employees have been with the organisation</p>
            </div>
            <button
              onClick={async () => { const { exportTenureSection } = await import("./exportDemographics"); exportTenureSection(normalisedActive); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-almet-sapphire/40 text-almet-sapphire hover:bg-almet-sapphire/5 transition"
            >
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Tenure distribution</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={tenureData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {tenureData.map((_,i) => <Cell key={i} fill={TENURE_COLORS[i%TENURE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v=>[`${v} employees`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1 flex-1 w-full">
                  {tenureData.map((t,i) => (
                    <HBar key={t.name} label={t.name} count={t.value} total={total}
                      color={TENURE_COLORS[i%TENURE_COLORS.length]}
                      onClick={() => setModal({
                        title: t.name === "Unknown" ? "Employees with Unknown Start Date" : `Employees — ${t.name}`,
                        employees: t.name === "Unknown"
                          ? normalisedActive.filter(e => !e.start_date)
                          : normalisedActive.filter(e => getTenureBand(e.start_date) === t.name)
                      })}
                    />
                  ))}
                </div>
              </div>
              {normalisedActive.filter(e => !e.start_date).length > 0 && (
                <p className="mt-3 text-xs text-gray-400 italic">
                  * {normalisedActive.filter(e => !e.start_date).length} employees have no start date on record (shown as "Unknown").
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Headcount by tenure band</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tenureData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Employees" radius={[6,6,0,0]}>
                    {tenureData.map((_,i) => <Cell key={i} fill={TENURE_COLORS[i%TENURE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tenureData.map((t,i) => (
              <MetricBox
                key={t.name}
                value={pct(t.value,total)}
                label={t.name}
                sub={`${t.value} employees`}
                color={TENURE_COLORS[i%TENURE_COLORS.length]}
                onClick={() => setModal({
                  title: t.name === "Unknown" ? "Employees with Unknown Start Date" : `Employees — ${t.name}`,
                  employees: t.name === "Unknown"
                    ? normalisedActive.filter(e => !e.start_date)
                    : normalisedActive.filter(e => getTenureBand(e.start_date) === t.name)
                })}
              />
            ))}
          </div>
        </div>

        )}

        {/* ── Headcount Trend ── */}
        {activeTab === "hc-trend" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">Headcount Trend</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Monthly new joiners, leavers and running total headcount for {yearFilter}</p>
            </div>

            {(() => {
              const MONTHS_IDX = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              const joinDate  = (e) => e.start_date  || e.hire_date       || e.date_of_joining;
              const leaveDate = (e) => e.termination_date || e.date_of_leaving || e.last_working_day;

              const getJoinersForMonth = (monthIdx) =>
                employees.filter(e => {
                  const jd = joinDate(e);
                  if (!jd) return false;
                  const d = new Date(jd);
                  return !isNaN(d) && d.getFullYear() === yearFilter && d.getMonth() === monthIdx;
                });

              const getLeaversForMonth = (monthIdx) =>
                employees.filter(e => {
                  const ld = leaveDate(e);
                  if (!ld) return false;
                  const d = new Date(ld);
                  return !isNaN(d) && d.getFullYear() === yearFilter && d.getMonth() === monthIdx;
                });

              const allYearJoiners = employees.filter(e => {
                const jd = joinDate(e);
                if (!jd) return false;
                const d = new Date(jd);
                return !isNaN(d) && d.getFullYear() === yearFilter;
              });

              const allYearLeavers = employees.filter(e => {
                const ld = leaveDate(e);
                if (!ld) return false;
                const d = new Date(ld);
                return !isNaN(d) && d.getFullYear() === yearFilter;
              });

              return (
                <>
                  {/* KPI summary */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div
                      className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-center cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setModal({ title: `New Joiners — ${yearFilter}`, employees: allYearJoiners })}
                    >
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {headcountTrend.reduce((s, r) => s + r.joiners, 0)}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">New Joiners</p>
                      <p className="text-[9px] text-green-500/70 mt-0.5">Click to view →</p>
                    </div>
                    <div
                      className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-center cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setModal({ title: `Leavers — ${yearFilter}`, employees: allYearLeavers })}
                    >
                      <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                        {headcountTrend.reduce((s, r) => s + r.leavers, 0)}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Leavers</p>
                      <p className="text-[9px] text-red-400/70 mt-0.5">Click to view →</p>
                    </div>
                    <div className="p-4 rounded-xl bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border border-almet-sapphire/20 text-center">
                      <p className="text-2xl font-bold text-almet-sapphire dark:text-almet-steel-blue">
                        {headcountTrend[headcountTrend.length - 1]?.total || 0}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">End of Year Total</p>
                    </div>
                  </div>

                  {/* Chart */}
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={headcountTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gJoiners" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={C.sapphire} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={C.sapphire} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gLeavers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="total"   name="Total Headcount" stroke={C.sapphire} fill="url(#gTotal)"   strokeWidth={2} />
                      <Area type="monotone" dataKey="joiners" name="New Joiners"      stroke="#10b981"   fill="url(#gJoiners)" strokeWidth={1.5} />
                      <Area type="monotone" dataKey="leavers" name="Leavers"          stroke="#ef4444"   fill="url(#gLeavers)" strokeWidth={1.5} strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Monthly table */}
                  <div className="mt-6 overflow-x-auto">
                    <p className="text-[10px] text-gray-400 mb-2">Click on joiners or leavers numbers to see who they are</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-medium text-gray-500">Month</th>
                          <th className="text-right py-2 px-3 font-medium text-green-600">Joiners</th>
                          <th className="text-right py-2 px-3 font-medium text-red-500">Leavers</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-500">Net</th>
                          <th className="text-right py-2 px-3 font-medium text-almet-sapphire">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {headcountTrend.map((row, idx) => (
                          <tr key={row.month} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{row.month}</td>
                            <td className="py-2 px-3 text-right">
                              {row.joiners > 0 ? (
                                <button
                                  onClick={() => setModal({ title: `New Joiners — ${row.month} ${yearFilter}`, employees: getJoinersForMonth(idx) })}
                                  className="text-green-600 dark:text-green-400 font-semibold hover:underline cursor-pointer"
                                >
                                  +{row.joiners}
                                </button>
                              ) : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {row.leavers > 0 ? (
                                <button
                                  onClick={() => setModal({ title: `Leavers — ${row.month} ${yearFilter}`, employees: getLeaversForMonth(idx) })}
                                  className="text-red-500 dark:text-red-400 font-semibold hover:underline cursor-pointer"
                                >
                                  -{row.leavers}
                                </button>
                              ) : <span className="text-gray-400">—</span>}
                            </td>
                            <td className={`py-2 px-3 text-right font-semibold ${row.joiners - row.leavers > 0 ? "text-green-600" : row.joiners - row.leavers < 0 ? "text-red-500" : "text-gray-400"}`}>
                              {row.joiners - row.leavers > 0 ? `+${row.joiners - row.leavers}` : row.joiners - row.leavers < 0 ? row.joiners - row.leavers : "—"}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-almet-sapphire dark:text-almet-steel-blue">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── Section 4: Headcount & Turnover ── */}
        {activeTab === "turnover" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">Headcount &amp; Turnover</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Retention, exit reasons, and early attrition analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-almet-sapphire/10 text-almet-sapphire">{yearFilter}</span>
              <button
                onClick={handleExport}
                disabled={exporting || !turnoverData}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-almet-sapphire/40 text-almet-sapphire hover:bg-almet-sapphire/5 disabled:opacity-40 transition"
              >
                <Download className="h-3 w-3" /> {exporting ? "Exporting…" : "Export (.xlsx)"}
              </button>
            </div>
          </div>

          {turnoverLoading ? <TurnoverSkeleton /> : !turnoverData ? (
            <div className="py-10 text-center text-xs text-gray-400">No turnover data for {yearFilter}.</div>
          ) : (
            <>
              {/* KPI row */}
              {(() => {
                const classifiedCount = (turnoverData.by_reason || []).reduce((s, r) => s + r.count, 0);
                const unclassified = turnoverData.total_leavers - classifiedCount;
                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                      <MetricBox value={`${turnoverData.turnover_rate_pct}%`}      label="Total Turnover Rate"    sub="All leavers ÷ avg headcount" color={C.coral} />
                      <MetricBox value={`${turnoverData.voluntary_turnover_pct}%`} label="Voluntary Resignations" sub="% of headcount"              color={C.teal}
                        onClick={() => setModal({ title: `Voluntary Resignations — ${yearFilter}`, employees: (turnoverData.raw_data || []).filter(d => d.exit_type === 'VOLUNTARY_RESIGNATION').map(toLeaverRow) })} />
                      <MetricBox value={`${turnoverData.early_attrition_pct}%`}   label="Early Attrition"        sub="Left within first 12 months" color={C.astral} />
                      <MetricBox value={turnoverData.total_leavers}                label="Total Leavers"          sub={`In ${yearFilter}`}           color={C.waterloo}
                        onClick={() => setModal({ title: `All Leavers — ${yearFilter}`, employees: (turnoverData.raw_data || []).map(toLeaverRow) })} />
                      <MetricBox value={turnoverData.active_headcount}             label="Current Headcount"      sub="Active today"                 color={C.sapphire}
                        onClick={() => setModal({ title: `Current Headcount — Active Employees`, employees: normalisedActive })} />
                    </div>
                    {unclassified > 0 && (
                      <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          <strong>{unclassified}</strong> of {turnoverData.total_leavers} leavers have no exit type classified.
                          Only <strong>{classifiedCount}</strong> are shown in the breakdown below.
                          Update employee archive records to improve accuracy.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="mb-8" />

              {/* Row 1: Reason donut + Monthly trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Reason breakdown donut */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">By reason of departure</p>
                  {turnoverData.total_leavers === 0 ? (
                    <div className="flex items-center justify-center h-40 text-xs text-gray-400">No departures in {yearFilter}</div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <ResponsiveContainer width={170} height={170}>
                        <PieChart>
                          <Pie
                            data={(turnoverData.by_reason || []).filter(r => r.count > 0)}
                            cx="50%" cy="50%" innerRadius={45} outerRadius={76}
                            dataKey="count" nameKey="label" paddingAngle={2}
                          >
                            {(turnoverData.by_reason || []).filter(r => r.count > 0).map((_,i) => (
                              <Cell key={i} fill={EXIT_COLORS[i % EXIT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={v=>[`${v} employees`]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2 flex-1 w-full">
                        {(turnoverData.by_reason || []).map((r,i) => (
                          <HBar key={r.code} label={r.label} count={r.count} total={turnoverData.total_leavers} color={EXIT_COLORS[i%EXIT_COLORS.length]}
                            onClick={() => setModal({ title: `${r.label} — ${yearFilter}`, employees: (turnoverData.raw_data || []).filter(d => d.exit_type === r.code).map(toLeaverRow) })} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly trend */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Monthly departure trend — {yearFilter}</p>
                  <ResponsiveContainer width="100%" height={170}>
                    <AreaChart data={turnoverData.monthly_breakdown || []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={C.coral} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={C.coral} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={C.teal} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="total"                name="Total"                stroke={C.coral} fill="url(#gTotal)" strokeWidth={2} />
                      <Area type="monotone" dataKey="voluntary_resignation" name="Voluntary Resignation" stroke={C.teal}  fill="url(#gVol)"  strokeWidth={1.5} strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 2: By Company + By Grade */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* By Company stacked bar */}
                {(turnoverData.by_company || []).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Turnover by company <span className="text-[10px] text-almet-sapphire/60">(click bar to view employees)</span></p>
                    <ResponsiveContainer width="100%" height={Math.max(160, turnoverData.by_company.length * 30)}>
                      <BarChart data={turnoverData.by_company} layout="vertical" barSize={12} style={{ cursor: "pointer" }}
                        onClick={data => {
                          const company = data?.activeLabel;
                          if (!company) return;
                          setModal({ title: `Leavers — ${company} (${yearFilter})`, employees: (turnoverData.raw_data || []).filter(d => d.company === company).map(toLeaverRow) });
                        }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {EXIT_TYPES.map((et, i) => (
                          <Bar key={et.code} dataKey={et.code} name={et.label} stackId="a"
                            fill={et.color} radius={i === EXIT_TYPES.length - 1 ? [0,4,4,0] : [0,0,0,0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* By Grade stacked bar */}
                {(turnoverData.by_grade || []).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Turnover by grade / hierarchy <span className="text-[10px] text-almet-sapphire/60">(click bar to view employees)</span></p>
                    <ResponsiveContainer width="100%" height={Math.max(160, turnoverData.by_grade.length * 28)}>
                      <BarChart data={turnoverData.by_grade} layout="vertical" barSize={12} style={{ cursor: "pointer" }}
                        onClick={data => {
                          const grade = data?.activeLabel;
                          if (!grade) return;
                          setModal({ title: `Leavers — ${grade} (${yearFilter})`, employees: (turnoverData.raw_data || []).filter(d => d.grade === grade).map(toLeaverRow) });
                        }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="grade" width={55} tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {EXIT_TYPES.map((et, i) => (
                          <Bar key={et.code} dataKey={et.code} name={et.label} stackId="a"
                            fill={et.color} radius={i === EXIT_TYPES.length - 1 ? [0,4,4,0] : [0,0,0,0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Row 2b: New Hires by Company */}
              {(() => {
                const joinDate = (e) => e.start_date || e.hire_date || e.date_of_joining;
                const newHiresByCompany = {};
                employees.forEach(e => {
                  const jd = joinDate(e);
                  if (!jd) return;
                  const d = new Date(jd);
                  if (isNaN(d) || d.getFullYear() !== yearFilter) return;
                  const company = e.business_function_name || "Unknown";
                  if (!newHiresByCompany[company]) newHiresByCompany[company] = [];
                  newHiresByCompany[company].push(e);
                });
                const entries = Object.entries(newHiresByCompany).sort((a, b) => b[1].length - a[1].length);
                if (entries.length === 0) return null;
                return (
                  <div className="mb-8">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                      New Hires by Company — {yearFilter}{" "}
                      <span className="text-[10px] text-almet-sapphire/60">(click count to view employees)</span>
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Company</th>
                            <th className="text-right py-2 px-3 font-medium text-green-600">New Hires</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-400">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map(([company, emps]) => {
                            const totalHires = entries.reduce((s, [, e]) => s + e.length, 0);
                            return (
                              <tr key={company} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{company}</td>
                                <td className="py-2 px-3 text-right">
                                  <button
                                    onClick={() => setModal({ title: `New Hires — ${company} (${yearFilter})`, employees: emps })}
                                    className="text-green-600 dark:text-green-400 font-bold hover:underline"
                                  >
                                    +{emps.length}
                                  </button>
                                </td>
                                <td className="py-2 px-3 text-right text-gray-400">{pct(emps.length, totalHires)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Row 3: Exit type breakdown table */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Exit type summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(turnoverData.by_reason || []).map((r, i) => (
                    <MetricBox
                      key={r.code}
                      value={r.count}
                      label={r.label}
                      sub={`${r.pct}% of leavers`}
                      color={EXIT_COLORS[i % EXIT_COLORS.length]}
                      onClick={() => setModal({ title: `${r.label} — ${yearFilter}`, employees: (turnoverData.raw_data || []).filter(d => d.exit_type === r.code).map(toLeaverRow) })}
                    />
                  ))}
                </div>
              </div>

              {/* Insight callouts */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Total Turnover</p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <strong>{turnoverData.turnover_rate_pct}%</strong> in {yearFilter}.
                    {turnoverData.turnover_rate_pct > 15 ? " Above 15% benchmark — review retention." : " Within normal range."}
                  </p>
                </div>
                <div className="rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-3">
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">Voluntary Resignations</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    <strong>{(turnoverData.by_reason||[]).find(r=>r.code==="VOLUNTARY_RESIGNATION")?.count||0}</strong> voluntary exits — {turnoverData.voluntary_turnover_pct}%.
                    {turnoverData.voluntary_turnover_pct > 10 ? " Consider engagement review." : " Healthy level."}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Early Attrition (&lt;12 months)</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <strong>{turnoverData.early_attrition}</strong> left within first year ({turnoverData.early_attrition_pct}%).
                    {turnoverData.early_attrition_pct > 5 ? " Review onboarding process." : " Good first-year retention."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        )}

        {/* ── Section 5: Exit Interview Analytics ── */}
        {activeTab === "exit" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">Exit Interview Insights</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Average satisfaction scores from completed exit interviews</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-almet-sapphire/10 text-almet-sapphire">
              {exitAnalytics.completed} interviews
            </span>
          </div>

          {exitLoading ? (
            <div className="flex items-center gap-3 py-8">
              <div className="w-4 h-4 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading exit interview data…</span>
            </div>
          ) : exitAnalytics.total === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">No exit interviews found.</div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <KpiCard label="Total Interviews" value={exitAnalytics.total} color={C.cloudBurst} />
                <KpiCard label="With Responses" value={exitAnalytics.completed} sub={pct(exitAnalytics.completed, exitAnalytics.total)} color={C.sapphire} />
                {exitAnalytics.overallAvg !== null && (
                  <KpiCard label="Overall Avg Score" value={`${exitAnalytics.overallAvg} / 5`}
                    color={exitAnalytics.overallAvg >= 3.5 ? C.teal : C.coral}
                    highlight={exitAnalytics.overallAvg < 3} />
                )}
                {exitAnalytics.worstSection && (
                  <KpiCard label="Lowest Rated Area" value={exitAnalytics.worstSection.label.split(" ")[0]}
                    sub={`${exitAnalytics.worstSection.avg} / 5`} color={C.coral} highlight />
                )}
              </div>

              {exitAnalytics.radarData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Radar chart */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Score by section (avg out of 5)</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <RadarChart data={exitAnalytics.radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="section" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                        <Radar name="Avg Score" dataKey="avg" stroke={C.sapphire} fill={C.sapphire} fillOpacity={0.25} />
                        <Tooltip formatter={v => [`${v} / 5`]} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar chart */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Section scores</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={exitAnalytics.radarData} barSize={28} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="section" width={58} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={v => [`${v} / 5`]} />
                        <Bar dataKey="avg" name="Avg Score" radius={[0, 6, 6, 0]}>
                          {exitAnalytics.radarData.map((d, i) => (
                            <Cell key={i} fill={EXIT_INTERVIEW_SECTIONS[i % EXIT_INTERVIEW_SECTIONS.length]?.color || C.sapphire} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Insight callouts */}
              {exitAnalytics.worstSection && exitAnalytics.bestSection && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Area Needing Attention</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      <strong>{exitAnalytics.worstSection.label}</strong> scored <strong>{exitAnalytics.worstSection.avg}/5</strong>.
                      {exitAnalytics.worstSection.avg < 3 ? " Below average — requires immediate focus." : " Room for improvement."}
                    </p>
                  </div>
                  <div className="rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-3">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">Strongest Area</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400">
                      <strong>{exitAnalytics.bestSection.label}</strong> scored <strong>{exitAnalytics.bestSection.avg}/5</strong>.
                      {exitAnalytics.bestSection.avg >= 4 ? " Excellent — maintain this standard." : " Keep improving."}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Most-complained questions (low rated) ── */}
              {exitAnalytics.lowRatedQuestions.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Most Problematic Areas (avg rating &lt; 4 / 5)
                  </p>
                  <div className="space-y-2">
                    {exitAnalytics.lowRatedQuestions.map((q, i) => {
                      const sectionMeta = EXIT_INTERVIEW_SECTIONS.find(s => s.id === q.section);
                      const color = sectionMeta?.color || C.coral;
                      const barW = Math.round((q.avg / 5) * 100);
                      return (
                        <div key={i} className="rounded-lg border border-gray-100 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-700/30">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: color + "20", color }}>
                              {sectionMeta?.label || q.section}
                            </span>
                            <span className="text-xs font-bold" style={{ color: q.avg < 2.5 ? C.coral : C.amber }}>{q.avg} / 5</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{q.text}</p>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: q.avg < 2.5 ? C.coral : C.amber }} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{q.count} response{q.count !== 1 ? "s" : ""}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Text responses (open comments) ── */}
              {exitAnalytics.textQuestions.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Open Comments by Question
                  </p>
                  <div className="space-y-4">
                    {exitAnalytics.textQuestions.slice(0, 5).map((q, i) => {
                      const sectionMeta = EXIT_INTERVIEW_SECTIONS.find(s => s.id === q.section);
                      const color = sectionMeta?.color || C.waterloo;
                      return (
                        <div key={i} className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: color + "20", color }}>
                              {sectionMeta?.label || q.section}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{q.text}</span>
                          </div>
                          <div className="space-y-1 pl-2 border-l-2" style={{ borderColor: color + "60" }}>
                            {q.responses.map((resp, j) => (
                              <p key={j} className="text-xs text-gray-600 dark:text-gray-300 italic">"{resp}"</p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* ── Section 6: Workforce Analytics ── */}
        {activeTab === "workforce" && workforceAnalytics && (
        <div className="space-y-5">

          {/* ── Span of Control ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-bali-hai uppercase tracking-widest">Span of Control</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Average number of direct reports per manager · Narrow ({'<'}4) = bureaucracy · Balanced (4–8) = optimal · Wide (9+) = leadership strain
              </p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl bg-almet-sapphire/5 border border-almet-sapphire/20 p-3 text-center">
                <p className="text-2xl font-bold text-almet-sapphire">{workforceAnalytics.avgSpan}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Avg Span of Control</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 p-3 text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{workforceAnalytics.managerCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Managers</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 p-3 text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{workforceAnalytics.icCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Individual Contributors</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 p-3 text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{workforceAnalytics.total}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Total Headcount</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Span distribution chart */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Distribution</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={workforceAnalytics.spanDist} layout="vertical" margin={{ left: 90, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [v, "Count"]} />
                    <Bar dataKey="count" radius={[0,3,3,0]}>
                      {workforceAnalytics.spanDist.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2">
                  {workforceAnalytics.spanDist.map(d => (
                    <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: d.color }} />
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top managers table */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Top Managers by Direct Reports</p>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {workforceAnalytics.managers.map((m, i) => {
                    const cat = m.directReports >= 9 ? { label: 'Wide', color: '#ef4444' }
                              : m.directReports >= 4 ? { label: 'Balanced', color: '#10b981' }
                              : { label: 'Narrow', color: '#f59e0b' };
                    const barW = Math.min(100, Math.round((m.directReports / (workforceAnalytics.managers[0]?.directReports || 1)) * 100));
                    return (
                      <div key={m.id || i} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-gray-400 text-right shrink-0">{i+1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-gray-800 dark:text-gray-100">{m.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{m.jobTitle}</p>
                          <div className="mt-0.5 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${barW}%`, background: cat.color }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold" style={{ color: cat.color }}>{m.directReports}</p>
                          <p className="text-[9px] text-gray-400">{cat.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-gray-300 dark:text-gray-600 pb-4">
          myalmet HRIS · Active employees only
          {bfFilter !== "ALL" ? ` · ${bfFilter}` : ""}
          {` · Turnover year: ${yearFilter}`}
        </p>
      </div>

      {/* ── Employee List Modal ── */}
      {modal && (
        <EmployeeListModal
          title={modal.title}
          employees={modal.employees}
          onClose={() => setModal(null)}
        />
      )}
    </DashboardLayout>
  );
}
