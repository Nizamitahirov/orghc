'use client';
import { Plus } from 'lucide-react';

/**
 * EmptyState — reusable empty/zero-data placeholder
 *
 * Props:
 *   icon       – React element (e.g. <FolderOpen size={40} />)
 *   title      – Main heading
 *   description – Supporting text
 *   action     – { label, onClick, icon? } — optional CTA button
 *   secondaryAction – { label, onClick } — optional secondary link
 *   className  – extra wrapper classes
 */
export default function EmptyState({
  icon,
  title = 'No data found',
  description,
  action,
  secondaryAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && (
        <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center mb-5">
          {/* layered gradient for depth */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-almet-sapphire/8 via-almet-astral/5 to-almet-steel-blue/8 dark:from-almet-sapphire/20 dark:via-almet-san-juan/30 dark:to-almet-cloud-burst/60" />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-almet-sapphire/10 dark:ring-almet-steel-blue/20" />
          <span className="relative text-almet-sapphire/70 dark:text-almet-steel-blue">
            {icon}
          </span>
        </div>
      )}

      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 dark:text-almet-bali-hai max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-sapphire text-white text-sm font-medium hover:bg-almet-astral transition-colors shadow-sm"
            >
              {action.icon ?? <Plus size={15} />}
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-sm text-almet-sapphire hover:text-almet-astral font-medium transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pre-built variants ─────────────────────────────────────────

export function EmptySearch({ query, onClear }) {
  return (
    <EmptyState
      icon={
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      }
      title="No results found"
      description={query ? `No results for "${query}". Try different keywords.` : 'Try adjusting your search or filters.'}
      secondaryAction={onClear ? { label: 'Clear search', onClick: onClear } : undefined}
    />
  );
}

export function EmptyList({ noun = 'items', onAdd, addLabel }) {
  return (
    <EmptyState
      icon={
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
        </svg>
      }
      title={`No ${noun} yet`}
      description={`Start by adding your first ${noun.replace(/s$/, '')}.`}
      action={onAdd ? { label: addLabel ?? `Add ${noun.replace(/s$/, '')}`, onClick: onAdd } : undefined}
    />
  );
}

export function EmptyError({ onRetry }) {
  return (
    <EmptyState
      icon={
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      }
      title="Failed to load data"
      description="Something went wrong while fetching data. Please try again."
      action={onRetry ? { label: 'Retry', onClick: onRetry, icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.55" />
        </svg>
      )} : undefined}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      }
      title="No notifications"
      description="You're all caught up! Notifications will appear here."
    />
  );
}
