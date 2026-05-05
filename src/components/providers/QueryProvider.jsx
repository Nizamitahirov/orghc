'use client';
// src/components/providers/QueryProvider.jsx
// Wraps the app with React Query's QueryClientProvider.
// Placed inside ReduxProvider (in layout.js) so both global stores co-exist.

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
