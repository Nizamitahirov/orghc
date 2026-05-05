import { useState, useEffect } from 'react';

/**
 * Like useState but persists value in localStorage.
 * On mount reads saved value; on change writes it back.
 * Falls back to defaultValue on parse errors (type-safe).
 */
export function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
}

/**
 * Like usePersistentState but uses sessionStorage instead.
 * Session is cleared when the tab/browser closes — use for ephemeral
 * per-session UI state (e.g. active tab, collapsed sections).
 */
export function useSessionStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = sessionStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
}

/**
 * Clear all performance-related localStorage keys.
 * Call this on logout or year change if needed.
 */
export function clearPerformanceStorage() {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith('perf_'));
  keys.forEach(k => localStorage.removeItem(k));
}
