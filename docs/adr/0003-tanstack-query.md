# ADR 0003: TanStack Query for server state

## Status

Accepted

## Context

Nearly every screen in this app displays data that conceptually comes from a
server: the patient's dashboard summary, appointment lists, treatment
journey, medication schedule, resources, notifications. That data needs
loading states, error states, caching (so navigating from the dashboard to
the appointments page and back doesn't re-fetch from scratch), and
invalidation after mutations (cancelling an appointment needs to update both
the list and the detail view). Modeling this by hand with `useEffect` +
`useState` per component — or centralizing it in a global store like Redux —
both mean re-implementing caching, deduplication, and staleness tracking that
already exist in a well-tested library.

## Decision

Use TanStack Query (`@tanstack/react-query`) as the single mechanism for all
server state. A shared `QueryClient` (`src/lib/query-client.ts`) is
configured with a 30s `staleTime`, 5 minute `gcTime`, and
`refetchOnWindowFocus: false` (a reasonable default for a not-highly-volatile
health data portal). Query keys are centralized in a factory
(`src/lib/query-keys.ts`) rather than inlined per call site, and only each
feature's `api.ts` is allowed to call `useQuery`/`useMutation` directly —
components consume the resulting hooks, never the query client.

Two React Query features are used deliberately rather than by default:

- **`select`** in `useUnreadNotificationsCount` — subscribes to the same
  underlying notifications query but derives just the unread count, so a
  component that only needs the badge number doesn't re-render on unrelated
  field changes and doesn't need a second network round-trip.
- **`placeholderData`** on paginated-feeling views — keeps the previous
  page's data on screen while the next page loads, instead of a full-page
  skeleton flash on every filter change.

## Consequences

- No component fetches data with `fetch`/`axios` directly and no component
  hand-manages `isLoading`/`error` state with `useState` — that's it should be TanStack Query's job.
- Cache invalidation is explicit and localized: a mutation's `onSuccess`
  calls `queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })`,
  so it's obvious from reading the mutation what it affects.
- Devtools (`@tanstack/react-query-devtools`, lazy-loaded in dev only) give
  free visibility into cache state during development — a genuine debugging
  win over a hand-rolled store.
- Cost: another dependency and another concept for a new contributor to
  learn versus "just use `useState`." For an app this data-heavy, that cost
  is worth it — see [ADR 0005](./0005-mock-api-layer.md) for how this
  decision interacts with the mock API layer.
- Alternative considered: Redux Toolkit Query. Similar capabilities, but
  TanStack Query doesn't require the app to also adopt a Redux store for
  state that isn't server state, which matters given the state-separation
  strategy described in `ARCHITECTURE.md`.
