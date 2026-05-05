'use client';
import { useState } from "react";
import { BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import OnboardingTrainingCard from "@/components/training/OnboardingTrainingCard";
import { useThemeClasses } from "@/hooks/useThemeClasses";

export default function TrainingProgressSection({
  hasPendingTrainings,
  myTrainings,
  getPendingTrainings,
  getTrainingStats,
  handleTrainingClick,
}) {
  const [showAll, setShowAll] = useState(false);
  const { darkMode, bgCard, textPrimary, textSecondary, borderColor } = useThemeClasses();

  if (!hasPendingTrainings) return null;

  const stats      = getTrainingStats();
  const percentage = stats.totalCount > 0
    ? Math.round((stats.completedCount / stats.totalCount) * 100)
    : 0;
  const allPending = getPendingTrainings();
  const displayed  = showAll ? allPending : allPending.slice(0, 3);
  const hasMore    = allPending.length > 3;

  return (
    <div className={`${bgCard} rounded-2xl p-6 shadow-sm border ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
          <BookOpen className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
          My Training Progress
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-steel-blue/20 dark:text-almet-steel-blue">
            {allPending.length}
          </span>
        </h2>
        <Link
          href="/training/my-trainings"
          className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1"
        >
          See All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${textSecondary}`}>
            {stats.completedCount} of {stats.totalCount} trainings completed
          </span>
          <span className="text-sm font-bold text-almet-sapphire dark:text-almet-steel-blue">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-almet-mystic dark:bg-almet-san-juan rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map(a => (
          <OnboardingTrainingCard
            key={a.id}
            assignment={a}
            darkMode={darkMode}
            onClick={handleTrainingClick}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-xs font-semibold text-almet-sapphire dark:text-almet-steel-blue hover:underline flex items-center gap-1 mx-auto"
          >
            {showAll ? 'Show Less' : `Show ${allPending.length - 3} More`}
            <ChevronRight className={`h-3 w-3 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}
