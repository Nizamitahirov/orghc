"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, X, User, Home, Network, UsersRound, FileText, Activity,
  List, GraduationCap, CalendarIcon, PlaneTakeoff, Megaphone, PartyPopper,
  Boxes, UserCog, Layers, ScrollText, BarChart2, LogOut, Repeat, AlarmClock,
  Brain, FileSignature, Bell, BookOpen, Shield, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/home", category: "Pages", icon: Home },
  { label: "Org Structure", path: "/structure/org-structure", category: "Structure", icon: Network },
  { label: "Headcount Table", path: "/structure/headcount-table", category: "Structure", icon: UsersRound },
  { label: "Job Descriptions", path: "/structure/job-descriptions", category: "Structure", icon: FileText },
  { label: "Job Catalog", path: "/structure/job-catalog", category: "Structure", icon: ScrollText },
  { label: "Grading System", path: "/structure/grading", category: "Structure", icon: Layers },
  { label: "Competency Matrix", path: "/structure/comp-matrix", category: "Structure", icon: BarChart2 },
  { label: "Performance", path: "/efficiency/performance-mng", category: "Efficiency", icon: Activity },
  { label: "Tasks", path: "/efficiency/tasks", category: "Efficiency", icon: List },
  { label: "Self Assessment", path: "/efficiency/self-assessment", category: "Efficiency", icon: Brain },
  { label: "Contracts", path: "/efficiency/contracts", category: "Efficiency", icon: FileSignature },
  { label: "Training", path: "/training", category: "Training", icon: GraduationCap },
  { label: "Vacation Requests", path: "/requests/vacation", category: "Requests", icon: CalendarIcon },
  { label: "Business Trip", path: "/requests/business-trip", category: "Requests", icon: PlaneTakeoff },
  { label: "Time Off", path: "/requests/time-off", category: "Requests", icon: AlarmClock },
  { label: "Handover / Takeover", path: "/requests/handover-takeover", category: "Requests", icon: Repeat },
  { label: "Resignation", path: "/requests/resignation", category: "Requests", icon: LogOut },
  { label: "Company News", path: "/communication/company-news", category: "Communication", icon: Megaphone },
  { label: "Celebrations", path: "/communication/celebrations", category: "Communication", icon: PartyPopper },
  { label: "My Voice (Suggestions)", path: "/suggestions", category: "Feedback", icon: Bell },
  { label: "Company Policies", path: "/company-policies", category: "Documents", icon: BookOpen },
  { label: "Company Procedures", path: "/company-procedures", category: "Documents", icon: BookOpen },
  { label: "Asset Management", path: "/settings/asset-mng", category: "Settings", icon: Boxes },
  { label: "Role Management", path: "/settings/role-mng", category: "Settings", icon: UserCog },
  { label: "Bonus", path: "/bonus", category: "Efficiency", icon: Shield },
];

const categoryColors = {
  Pages: "text-almet-sapphire",
  Structure: "text-blue-500",
  Efficiency: "text-purple-500",
  Training: "text-green-500",
  Requests: "text-orange-500",
  Communication: "text-pink-500",
  Feedback: "text-yellow-500",
  Documents: "text-teal-500",
  Settings: "text-gray-500",
};

export default function GlobalSearch() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredPages = query.length > 0
    ? NAV_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : NAV_ITEMS.slice(0, 6);

  const allResults = [...filteredPages, ...employees.map(e => ({
    label: `${e.first_name} ${e.last_name}`,
    path: `/structure/employee/${e.id}`,
    category: "Employee",
    icon: User,
    subtitle: e.job_title_name || e.department_name,
  }))];

  const open = useCallback(() => { setIsOpen(true); setQuery(""); setEmployees([]); }, []);
  const close = useCallback(() => { setIsOpen(false); setQuery(""); setEmployees([]); setActiveIndex(0); }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); open(); }
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) { setEmployees([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/employees/?search=${encodeURIComponent(query)}&page_size=4`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setEmployees(data.results || []);
      } catch {
        setEmployees([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, allResults.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && allResults[activeIndex]) {
      router.push(allResults[activeIndex].path);
      close();
    }
  };

  const handleSelect = (path) => { router.push(path); close(); };

  if (!isOpen) {
    return (
      <button
        onClick={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-almet-san-juan/30 border border-gray-200 dark:border-almet-comet text-gray-500 dark:text-almet-bali-hai hover:border-almet-sapphire/50 dark:hover:border-almet-steel-blue/50 transition-colors group"
        title="Search (Ctrl+K)"
      >
        <Search size={14} />
        <span className="hidden lg:inline text-xs">Search...</span>
        <kbd className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-almet-comet font-mono">⌃K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center pt-24 px-4" onClick={close}>
      <div
        className="bg-white dark:bg-almet-cloud-burst rounded-2xl shadow-2xl w-full max-w-xl border border-almet-mystic dark:border-almet-san-juan overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-almet-mystic dark:border-almet-san-juan">
          <Search size={18} className="text-almet-waterloo dark:text-almet-bali-hai flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages or employees..."
            className="flex-1 bg-transparent text-sm text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai outline-none"
          />
          {searching && <Loader2 size={16} className="animate-spin text-almet-waterloo dark:text-almet-bali-hai flex-shrink-0" />}
          <button onClick={close} className="text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-white transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-96 overflow-y-auto py-2">
          {allResults.length === 0 && query.length > 0 && !searching && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No results for "{query}"</p>
            </div>
          )}

          {query.length > 0 && filteredPages.length > 0 && (
            <div className="px-3 mb-1">
              <p className="text-[10px] font-bold text-almet-waterloo dark:text-almet-bali-hai uppercase tracking-wider px-1 mb-1">Pages</p>
            </div>
          )}

          {filteredPages.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeIndex === idx;
            return (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                  isActive ? "bg-almet-mystic/40 dark:bg-almet-san-juan/40" : "hover:bg-almet-mystic/20 dark:hover:bg-almet-san-juan/20"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className={categoryColors[item.category] || "text-almet-sapphire"} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white truncate">{item.label}</p>
                  <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">{item.category}</p>
                </div>
              </button>
            );
          })}

          {employees.length > 0 && (
            <>
              <div className="px-3 mt-2 mb-1">
                <p className="text-[10px] font-bold text-almet-waterloo dark:text-almet-bali-hai uppercase tracking-wider px-1 mb-1">Employees</p>
              </div>
              {employees.map((emp, idx) => {
                const globalIdx = filteredPages.length + idx;
                const isActive = activeIndex === globalIdx;
                return (
                  <button
                    key={emp.id}
                    onClick={() => handleSelect(`/structure/employee/${emp.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                      isActive ? "bg-almet-mystic/40 dark:bg-almet-san-juan/40" : "hover:bg-almet-mystic/20 dark:hover:bg-almet-san-juan/20"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-bold">
                        {(emp.first_name?.[0] || "")}{(emp.last_name?.[0] || "")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white truncate">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai truncate">
                        {emp.job_title_name || emp.department_name || "Employee"}
                      </p>
                    </div>
                    <User size={12} className="text-almet-waterloo dark:text-almet-bali-hai flex-shrink-0" />
                  </button>
                );
              })}
            </>
          )}

          {query.length === 0 && (
            <div className="px-4 py-2 pb-3">
              <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2">Quick navigation</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-almet-mystic dark:border-almet-san-juan flex items-center gap-4 text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
          <span><kbd className="font-mono bg-gray-100 dark:bg-almet-comet px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-gray-100 dark:bg-almet-comet px-1 rounded">↵</kbd> open</span>
          <span><kbd className="font-mono bg-gray-100 dark:bg-almet-comet px-1 rounded">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
