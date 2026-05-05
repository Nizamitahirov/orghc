// src/constants/config.js
// Centralized configuration — NO magic numbers scattered across the codebase

// ─── API ──────────────────────────────────────────────────────────────────────
export const API = {
  TIMEOUT_MS: 30_000,
  /** Default page_size when fetching ALL records (dropdowns, reference data) */
  PAGE_SIZE_ALL: 1000,
  /** Default page_size for paginated tables */
  PAGE_SIZE_TABLE: 25,
};

// ─── Toast durations (ms) ────────────────────────────────────────────────────
export const TOAST_DURATION = {
  SUCCESS: 4_000,
  ERROR:   6_000,
  WARNING: 5_000,
  INFO:    4_000,
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// ─── Query / Cache (React Query stale times) ─────────────────────────────────
export const QUERY_STALE = {
  /** Reference data rarely changes — 10 min stale time */
  REFERENCE_DATA_MS: 10 * 60 * 1000,
  /** User-specific data — 5 min stale time */
  USER_DATA_MS:       5 * 60 * 1000,
  /** Live / frequently mutated data — 1 min stale time */
  LIVE_DATA_MS:       1 * 60 * 1000,
};

// ─── File download ────────────────────────────────────────────────────────────
export const FILE = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_UPLOAD_SIZE_MB: 10,
};

// ─── Assessment ───────────────────────────────────────────────────────────────
export const ASSESSMENT_STATUS = {
  DRAFT:     'DRAFT',
  COMPLETED: 'COMPLETED',
  SUBMITTED: 'SUBMITTED',
};

// ─── Tables ───────────────────────────────────────────────────────────────────
export const TABLE = {
  /** Minimum rows to show skeleton loader */
  SKELETON_ROWS: 7,
};
