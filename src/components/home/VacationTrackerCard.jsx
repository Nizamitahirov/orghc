'use client';
import { useRouter } from "next/navigation";
import { Umbrella, FileText, Plane } from "lucide-react";
import Link from "next/link";

export default function VacationTrackerCard({ vacationData, loading }) {
  const router = useRouter();

  if (loading) return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan animate-pulse">
      <div className="h-20 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded" />
    </div>
  );

  const balance        = vacationData?.balance || {};
  const usedPct        = balance.yearly_balance > 0
    ? Math.round((balance.used_days / balance.yearly_balance) * 100)
    : 0;
  const circumference  = 301.59;

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan group hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Umbrella className="h-4 w-4 text-orange-500" /> Vacation Tracker
        </h3>
        <button onClick={() => router.push('/requests/vacation')} className="text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors">
          <FileText className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-4">
        Allocated for {new Date().getFullYear()}: {balance.yearly_balance || 0} Days
      </p>
      <div className="flex items-center justify-center mb-2">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-almet-mystic dark:text-almet-san-juan" />
            <circle cx="64" cy="64" r="48" stroke="url(#vacGradient)" strokeWidth="8" fill="none"
              strokeDasharray={`${(usedPct / 100) * circumference} ${circumference}`}
              className="transition-all duration-1000 ease-out" strokeLinecap="round" />
            <defs>
              <linearGradient id="vacGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5975AF" />
                <stop offset="100%" stopColor="#7B93C7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-almet-sapphire dark:text-almet-steel-blue">{balance.remaining_balance || 0}</span>
            <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">days left</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-almet-mystic dark:border-almet-comet pt-3 mb-3">
        <div className="text-center">
          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">{balance.used_days || 0}</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Used</p>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-sky-600 dark:text-sky-400">{balance.scheduled_days || 0}</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Planned</p>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-green-600 dark:text-green-400">{balance.available_for_planning || 0}</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Available</p>
        </div>
      </div>
      <Link href="/requests/vacation">
        <button className="w-full bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-sapphire text-white font-semibold py-2.5 rounded-xl text-[10px] transition-all transform group-hover:scale-105 flex items-center justify-center gap-2">
          <Plane className="h-3 w-3" /> Request Vacation
        </button>
      </Link>
    </div>
  );
}
