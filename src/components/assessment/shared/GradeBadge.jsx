'use client';

const GRADE_CLASSES = {
  A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  B: 'bg-sky-50     text-sky-700     border-sky-200',
  C: 'bg-amber-50   text-amber-700   border-amber-200',
  D: 'bg-orange-50  text-orange-700  border-orange-200',
  E: 'bg-purple-50  text-purple-700  border-purple-200',
  F: 'bg-red-50     text-red-700     border-red-200',
};

/**
 * Shared grade badge used by Leadership, Behavioral and Core assessment tables.
 *
 * Props:
 *   grade      – letter grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
 *   percentage – numeric score, e.g. 87
 */
export default function GradeBadge({ grade, percentage }) {
  if (!grade || percentage == null) {
    return <span className="text-xs text-gray-400">Not graded</span>;
  }

  const cls = GRADE_CLASSES[grade] ?? 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      {grade} ({percentage}%)
    </span>
  );
}
