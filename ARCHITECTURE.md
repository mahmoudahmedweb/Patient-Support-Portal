# Architecture

This document describes how the Patient Support Portal is put together: the
layers, the data flow, and the reasoning behind the structural decisions. It
assumes you've skimmed the [README](./README.md) overview first. For the
_why_ behind individual decisions in more depth, see [`docs/adr/`](./docs/adr).

## Layers

The app is organized into four layers, each with a single, narrow
responsibility. Every layer only talks to the one directly below it.

```
┌─────────────────────────────────────────────────────────┐
│  Pages & Components  (src/app, src/features/*, src/components)
│  - render UI, wire up hooks, own local/UI state           │
└───────────────────────┬─────────────────────────────────┘
                         │ calls feature-scoped hooks
┌───────────────────────▼─────────────────────────────────┐
│  Query Layer  (src/features/*/api.ts)                    │
│  - useQuery / useMutation wrappers around services         │
│  - owns query keys, cache invalidation, select()          │
└───────────────────────┬─────────────────────────────────┘
                         │ calls typed async functions
┌───────────────────────▼─────────────────────────────────┐
│  Service Layer  (src/services/*.service.ts)               │
│  - the "REST API" as far as the rest of the app is concerned │
│  - validates shape, applies filters, throws ApiError       │
└───────────────────────┬─────────────────────────────────┘
                         │ reads/writes
┌───────────────────────▼─────────────────────────────────┐
│  Mock Data Store  (src/services/store.ts, services/seed/) │
│  - in-memory "database" seeded with fictional patient data │
│  - src/services/api-client.ts simulates latency + failure  │
└─────────────────────────────────────────────────────────┘
```

No component ever imports from `src/services` directly, and no service
function ever imports React. This is the seam that makes the codebase
testable and makes "swap the mock API for a real backend" a one-layer change
(see [ADR 0005](./docs/adr/0005-mock-api-layer.md)).

### 1. Components & pages

`src/app` holds the shell: routing, layout, the protected-route guard.
`src/features/<domain>` holds everything specific to one product area —
dashboard, appointments, treatments, medications, resources, notifications,
profile, auth. Each feature folder is intentionally self-contained:

```
src/features/appointments/
  api.ts          # TanStack Query hooks (useAppointments, useCancelAppointment, ...)
  constants.ts    # status/type label + tone maps used only by this feature
  AppointmentCard.tsx
  AppointmentsPage.tsx
  AppointmentDetailPage.tsx
  AppointmentRescheduleForm.tsx
  __tests__/
  index.ts        # the feature's public surface — everything else imports from here
```

Presentational components (`AppointmentCard`, the dashboard's card
components, `JourneyTimeline`) receive already-fetched data as props and
contain no data-fetching or business logic themselves — they're easy to
snapshot, restyle, or reuse. Page components (`AppointmentsPage`,
`DashboardPage`) are the only pieces that call the query hooks and are
responsible for turning `{isPending, isError, data}` into UI, almost always
by delegating to the shared `AsyncSection` component (see below).

### 2. Query layer

Each feature's `api.ts` is the only place that calls `useQuery` /
`useMutation` for that domain. This keeps two things centralized:

- **Query keys** — defined once in `src/lib/query-keys.ts` as a factory
  (`queryKeys.appointments.list(filter)`, `queryKeys.appointments.detail(id)`)
  rather than inline arrays scattered across components, so cache
  invalidation after a mutation can't typo a key and silently miss.
- **Cache updates** — e.g. `useCancelAppointment`'s `onSuccess` calls
  `queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })`
  so the list and detail views both refresh from a single mutation.

### 3. Service layer

`src/services/*.service.ts` are plain async functions —
`getAppointments(filter)`, `cancelAppointment(id)` — that read and write the
in-memory store and are wrapped in `simulateRequest` (see below). They throw
a typed `ApiError` (with an HTTP-style `status`) rather than a bare `Error`,
so calling code can branch on "not found" vs. "validation failed" vs.
"server error" the same way it would against a real REST API.

### 4. Mock data store

`src/services/store.ts` builds one module-level "database" object from
`src/services/seed/build-seed-data.ts` at import time. `api-client.ts`
exports `simulateRequest`, a wrapper every service call passes its resolver
through:

```ts
export function simulateRequest<T>(resolve: () => T, options?: RequestOptions): Promise<T>
```

It adds artificial latency (280–820ms) and a small random failure rate (5%
by default, or 100% when the "simulate errors" dev toggle is on), so every
loading and error state in the UI is exercised by real usage rather than by
hardcoded storybook-style props. See [ADR 0005](./docs/adr/0005-mock-api-layer.md)
for why this exists instead of components reading static fixtures directly.

## Data flow, end to end

Take "cancel an appointment" as a concrete trace:

1. `AppointmentDetailPage` calls `useCancelAppointment()` (from
   `features/appointments/api.ts`) and, on confirm, calls its `mutate(id)`.
2. The mutation calls `appointmentService.cancelAppointment(id)`.
3. The service wraps the mutation in `simulateRequest`, which waits a random
   delay, rolls the failure chance, then runs the resolver: find the
   appointment in `db.appointments`, throw `ApiError(404)` if missing,
   otherwise mutate its `status` to `'cancelled'` and return the updated
   record.
4. On success, the mutation's `onSuccess` invalidates
   `queryKeys.appointments.all`, so both the appointments list and this
   detail view refetch and re-render with the new status.
5. On failure, `AppointmentDetailPage` reads the mutation's `isError` /
   `error` and renders an inline error with a retry affordance — nothing
   throws uncaught, and the rest of the page (provider info, appointment
   time) stays visible.
6. A `LiveRegion` announces the outcome ("Appointment cancelled.") for
   screen-reader users who wouldn't otherwise notice the status pill change.

The same shape — page → query hook → service → store, with TanStack Query
owning cache + loading/error state — repeats for every feature.

## State management strategy

The app deliberately uses **three different kinds of state**, kept apart on
purpose rather than funneled into one global store:

| Kind           | Example                                                                | Owned by                     |
| -------------- | ---------------------------------------------------------------------- | ---------------------------- |
| Server state   | appointments, treatment, medications, notifications                    | TanStack Query cache         |
| URL state      | active status filter, active resource category, search term            | `useSearchParams`            |
| Local UI state | mobile nav open/closed, reschedule form open/closed, form field values | `useState` / React Hook Form |

There is no Redux/Zustand/Context-as-a-store for application data. Server
data already has a purpose-built cache (TanStack Query) that handles
staleness, retries, and invalidation better than reducing it into a global
store would. Filters live in the URL via `useSearchParams` instead of
`useState` so a filtered view is shareable/bookmarkable and survives a
refresh — a concrete, testable reason, not just convention. The one global
Context that exists (`AuthProvider`) holds session identity, which is
genuinely cross-cutting and needed by the router guard, the header, and
every protected page.

## Accessibility considerations

Accessibility was treated as a feature requirement, not a pass at the end
(the actual color tokens were audited with contrast math — see
`src/index.css`'s comments and the WCAG note in the README). Structural
patterns used throughout:

- Semantic landmarks: `<header>`, `<nav>`, `<main id="main-content">`, a
  skip-to-content link that's the first focusable element on the page.
- Every icon-only control has an accessible name; every decorative icon is
  `aria-hidden`.
- Status changes that aren't near the user's focus (cancelling an
  appointment, marking a notification read) are announced via a shared
  `LiveRegion` (`role="status"`, `aria-live="polite"`) rather than relying on
  a sighted user noticing a pill color change.
- Custom interactive widgets follow ARIA authoring patterns: the filter
  pills use `role="tablist"`/`role="tab"`/`aria-selected`; the notification
  preferences grid's toggles use `role="switch"`/`aria-checked`.
- Data tables (medication history) use real `<table>` markup with `<th
scope="col">` / `scope="row"`, not styled `<div>` grids.
- The adherence visualization pairs color with an icon and screen-reader-only
  text for each cell — never color as the only signal.
- Focus is managed on route-level interactions that matter: opening the
  mobile nav moves focus into it; Escape closes it and returns focus.
- All color tokens were checked against WCAG AA contrast ratios (4.5:1 for
  text, 3:1 for UI component boundaries and large text) with a small
  relative-luminance script, not eyeballed — see the README's
  "Accessibility" section for the specific tokens that were adjusted.

## Testing strategy

See the README's "Testing strategy" section for the full breakdown of what's
covered and why. Architecturally, the one decision worth calling out here:
tests mock at the `simulateRequest` boundary in `src/services/api-client.ts`,
not at the service-function level. That means the real filtering logic,
`ApiError` status codes, and store mutations in every `*.service.ts` file run
for real in tests — only the artificial latency and randomness are removed.
A test failure in, say, `appointment.service.test.ts` is a failure of actual
business logic, not of a hand-maintained fake.

## Folder structure

```
src/
  app/             # routing, layout, protected-route guard, 404
  components/       # cross-feature UI primitives (Button, Card, AsyncSection, form/*)
  features/         # one folder per product area (see "Components & pages" above)
    auth/
    dashboard/
    treatments/
    appointments/
    medications/
    resources/
    notifications/
    profile/
  hooks/           # cross-feature hooks (useNetworkChaos)
  lib/             # query client, query key factory, cn(), network-chaos store
  services/        # the mock "backend": api-client, *.service.ts, store, seed/
  test/            # shared test setup + renderWithProviders helper
  types/           # Zod schemas + inferred TS types, one file per domain, barreled
  utils/           # date formatting helpers
```

## Why feature-based over type-based (`components/`, `pages/`, `hooks/` at the top level)?

See [ADR 0002](./docs/adr/0002-feature-based-architecture.md) for the full
reasoning. In short: a type-based split scales by _kind of file_, which means
working on "appointments" touches five unrelated top-level folders. A
feature-based split scales by _what you're working on_, and pairs naturally
with route-level code splitting (`React.lazy` per feature) and with barrels
(`index.ts`) that make each feature's public surface explicit.
