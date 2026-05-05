"use client";

const pulse = "animate-pulse rounded";

export function SkeletonLine({ width = "w-full", height = "h-4" }) {
  return <div className={`${pulse} bg-gray-200 dark:bg-gray-700 ${width} ${height}`} />;
}

export function SkeletonAvatar({ size = "h-8 w-8" }) {
  return <div className={`${pulse} bg-gray-200 dark:bg-gray-700 rounded-full ${size}`} />;
}

export function SkeletonTableRow({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          {i === 0 ? (
            <div className="flex items-center gap-3">
              <SkeletonAvatar size="h-8 w-8" />
              <div className="flex-1 space-y-1.5">
                <SkeletonLine width="w-32" height="h-3" />
                <SkeletonLine width="w-20" height="h-2.5" />
              </div>
            </div>
          ) : (
            <SkeletonLine width={i % 2 === 0 ? "w-20" : "w-16"} height="h-3" />
          )}
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <table className="min-w-full">
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-40" height="h-3.5" />
          <SkeletonLine width="w-24" height="h-2.5" />
        </div>
      </div>
      <SkeletonLine height="h-2.5" />
      <SkeletonLine width="w-3/4" height="h-2.5" />
      <div className="flex gap-2 pt-1">
        <SkeletonLine width="w-16" height="h-6" />
        <SkeletonLine width="w-16" height="h-6" />
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
