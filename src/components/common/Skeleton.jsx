'use client';

// Base pulse animation wrapper
const pulse = 'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700/60';

// ─── Primitive ───────────────────────────────────────────────
export function SkeletonBox({ className = '' }) {
  return <div className={`${pulse} ${className}`} />;
}

// ─── Card skeleton (generic) ─────────────────────────────────
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-almet-cloud-burst ${className}`}>
      <div className="flex items-start gap-4">
        <div className={`${pulse} w-12 h-12 rounded-xl flex-shrink-0`} />
        <div className="flex-1 space-y-2.5">
          <div className={`${pulse} h-4 w-3/4`} />
          <div className={`${pulse} h-3 w-1/2`} />
          <div className={`${pulse} h-3 w-2/3`} />
        </div>
      </div>
    </div>
  );
}

// ─── Employee card skeleton ──────────────────────────────────
export function SkeletonEmployeeCard() {
  return (
    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-almet-cloud-burst">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`${pulse} w-16 h-16 rounded-full`} />
        <div className="w-full space-y-2">
          <div className={`${pulse} h-4 w-3/4 mx-auto`} />
          <div className={`${pulse} h-3 w-1/2 mx-auto`} />
        </div>
        <div className={`${pulse} h-6 w-20 rounded-full`} />
      </div>
    </div>
  );
}

export function SkeletonEmployeeGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEmployeeCard key={i} />
      ))}
    </div>
  );
}

// ─── Table skeleton ──────────────────────────────────────────
export function SkeletonTable({ rows = 8, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="grid gap-4 px-4 py-3 bg-gray-50 dark:bg-almet-san-juan border-b border-gray-100 dark:border-gray-800"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`${pulse} h-3`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          className="grid gap-4 px-4 py-4 border-b border-gray-50 dark:border-gray-800/60 bg-white dark:bg-almet-cloud-burst"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={ci} className={`${pulse} h-3 ${ci === 0 ? 'w-3/4' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Training card skeleton ──────────────────────────────────
export function SkeletonTrainingCard() {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-almet-cloud-burst space-y-3">
      <div className="flex items-center gap-3">
        <div className={`${pulse} w-10 h-10 rounded-xl`} />
        <div className="flex-1 space-y-2">
          <div className={`${pulse} h-4 w-2/3`} />
          <div className={`${pulse} h-3 w-1/3`} />
        </div>
      </div>
      <div className={`${pulse} h-2 w-full rounded-full`} />
      <div className="flex gap-2">
        <div className={`${pulse} h-6 w-16 rounded-full`} />
        <div className={`${pulse} h-6 w-20 rounded-full`} />
      </div>
    </div>
  );
}

export function SkeletonTrainingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTrainingCard key={i} />
      ))}
    </div>
  );
}

// ─── Stat cards skeleton ─────────────────────────────────────
export function SkeletonStatCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-almet-cloud-burst space-y-3">
          <div className="flex items-center justify-between">
            <div className={`${pulse} h-3 w-24`} />
            <div className={`${pulse} w-8 h-8 rounded-xl`} />
          </div>
          <div className={`${pulse} h-7 w-16`} />
          <div className={`${pulse} h-2 w-full rounded-full`} />
        </div>
      ))}
    </div>
  );
}

// ─── Page header skeleton ─────────────────────────────────────
export function SkeletonPageHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <div className={`${pulse} h-6 w-48`} />
        <div className={`${pulse} h-3 w-32`} />
      </div>
      <div className={`${pulse} h-9 w-28 rounded-xl`} />
    </div>
  );
}

// ─── Notification list skeleton ───────────────────────────────
export function SkeletonNotificationList({ count = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-almet-cloud-burst">
          <div className={`${pulse} w-10 h-10 rounded-full flex-shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`${pulse} h-4 w-2/3`} />
            <div className={`${pulse} h-3 w-1/2`} />
            <div className={`${pulse} h-3 w-1/3`} />
          </div>
          <div className={`${pulse} h-3 w-16`} />
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard home skeleton ──────────────────────────────────
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <SkeletonStatCards count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-36" />
        </div>
        <div className="space-y-4">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    </div>
  );
}
