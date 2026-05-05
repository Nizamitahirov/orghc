// ── Timing ────────────────────────────────────────────────────────────────────
export const TOAST_DURATION      = 3000;   // ms
export const POLL_INTERVAL       = 60_000; // ms — data refresh polling
export const SECONDARY_LOAD_DELAY = 150;  // ms — deferred wave-2 API calls
export const CACHE_EXPIRY        = 5 * 60 * 1000; // ms — reference data TTL

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE   = 25;
export const PAGE_SIZE_OPTIONS   = [10, 25, 50, 100];

// ── Virtual scroll ────────────────────────────────────────────────────────────
export const ROW_HEIGHT          = 52;  // px — employee table row
export const OVERSCAN            = 8;   // extra rows rendered above/below viewport

// ── Service tenure thresholds ─────────────────────────────────────────────────
export const NEW_HIRE_THRESHOLD  = 0.25; // years — < 3 months
export const VETERAN_THRESHOLD   = 5;    // years

// ── File upload ───────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB    = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
