import { QueryClient } from '@tanstack/react-query'

/**
 * One QueryClient for the app. Defaults are tuned for a portal where data
 * doesn't change every second: a short staleTime avoids refetch storms
 * from repeated navigation, a single retry avoids masking real errors
 * behind a long retry loop, and window-focus refetching is off so the
 * simulated network's random failure chance doesn't surprise reviewers
 * mid-demo just by alt-tabbing.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
