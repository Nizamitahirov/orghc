// src/lib/queryClient.js
// Single shared React Query client — import this wherever you need
// direct cache access (e.g. queryClient.invalidateQueries).

import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE } from '@/constants/config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes by default.
      // Override per-query when data changes more/less frequently.
      staleTime: QUERY_STALE.USER_DATA_MS,

      // Keep unused cache for 10 minutes before garbage collection.
      gcTime: 10 * 60 * 1000,

      // Retry once on failure (not 3× — avoids hammering the server).
      retry: 1,
      retryDelay: 1_000,

      // Refetch when the window regains focus so data stays fresh
      // after switching tabs / coming back from lock screen.
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Don't retry mutations — a failed write shouldn't be replayed blindly.
      retry: 0,
    },
  },
});
