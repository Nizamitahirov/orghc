'use client';
import { useState, useEffect } from "react";
import { Plane, ChevronRight } from "lucide-react";
import Link from "next/link";
import { VacationService } from "@/services/vacationService";

export default function WhoIsOutToday() {
  const [outList, setOutList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date();
        const data  = await VacationService.getCalendarEvents({ month: today.getMonth() + 1, year: today.getFullYear() });
        const todayStr = today.toISOString().split('T')[0];
        const events   = Array.isArray(data) ? data : (data.events || data.results || data.data || []);
        const out      = events.filter(e => {
          const start = e.start_date || e.start;
          const end   = e.end_date   || e.end;
          return start && end && start <= todayStr && end >= todayStr;
        });
        setOutList(out.slice(0, 5));
      } catch {
        setOutList([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan animate-pulse">
      <div className="h-4 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded w-1/3 mb-3" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-lg" />)}
      </div>
    </div>
  );

  if (outList.length === 0) return null;

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Plane className="h-4 w-4 text-sky-500" />
          Out Today
          <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
            {outList.length}
          </span>
        </h3>
        <Link href="/requests/vacation" className="text-almet-sapphire dark:text-almet-steel-blue hover:underline">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-2">
        {outList.map((e, idx) => (
          <div key={e.id || idx} className="flex items-center justify-between px-3 py-2 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-900/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-almet-sapphire flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold">{(e.employee_name || e.name || '?')[0]}</span>
              </div>
              <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white truncate">{e.employee_name || e.name}</span>
            </div>
            <span className="text-[9px] text-sky-600 dark:text-sky-400 font-medium flex-shrink-0 ml-2">
              {e.vacation_type_name || e.vacation_type || 'On Leave'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
