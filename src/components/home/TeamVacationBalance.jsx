'use client';
import { useState, useEffect } from "react";
import { Umbrella, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { VacationService } from "@/services/vacationService";

export default function TeamVacationBalance({ userRole }) {
  const router   = useRouter();
  const [balances, setBalances] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'manager') { setLoading(false); return; }
    const load = async () => {
      try {
        const data = await VacationService.getAllBalances({ year: new Date().getFullYear() });
        const list = Array.isArray(data) ? data : (data.results || data.data || []);
        setBalances(list.slice(0, 8));
      } catch {
        setBalances([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userRole]);

  if (!userRole || userRole === 'employee') return null;
  if (loading) return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan animate-pulse">
      <div className="h-5 bg-almet-mystic/30 rounded w-1/4 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-almet-mystic/20 rounded-xl" />)}
      </div>
    </div>
  );
  if (balances.length === 0) return null;

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Umbrella className="h-5 w-5 text-sky-500" /> Team Vacation Balance
        </h2>
        <button onClick={() => router.push('/requests/vacation')} className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1">
          View All <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {balances.map((b, idx) => {
          const used      = b.used_days || 0;
          const yearly    = b.yearly_balance || b.total_balance || 0;
          const remaining = b.remaining_balance ?? (yearly - used);
          const pct       = yearly > 0 ? Math.round((used / yearly) * 100) : 0;
          const name      = b.employee_name || b.full_name || 'Employee';
          const initials  = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          return (
            <div key={b.id || b.employee_id || idx} className="p-3 bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-almet-sapphire flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">{initials}</span>
                </div>
                <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white truncate">{name}</span>
              </div>
              <div className="w-full bg-sky-100 dark:bg-sky-900/30 rounded-full h-1.5 mb-2">
                <div className="h-1.5 bg-sky-500 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-sky-600 dark:text-sky-400 font-semibold">{remaining} left</span>
                <span className="text-almet-waterloo dark:text-almet-bali-hai">{used}/{yearly} used</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
