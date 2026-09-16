# ADR 0005: A simulated service/API layer instead of hardcoded component data

## Status

Accepted

## Context

This is a portfolio project with no real backend, but the goal is to
demonstrate how the frontend would be built against one. The tempting
shortcut is to hardcode fictional data as props or imported constants
directly in components (`<DashboardPage patient={fakePatient} />`). That
would make every screen's "happy path" easy to build, but it would mean:
loading states never actually render (data is already there), error states
either don't exist or are unreachable dead code, and TanStack Query's entire
purpose (caching, invalidation, refetching) has nothing real to do — which
defeats the point of choosing it (see [ADR 0003](./0003-tanstack-query.md)).
It would also leave no seam to eventually swap in a real backend.

## Decision

Build a real, if small, service layer that behaves like a REST API from the
rest of the app's point of view:

- `src/services/seed/build-seed-data.ts` generates a complete, internally
  consistent fictional dataset (one patient, one active treatment, a
  6-stage journey, 6 appointments, medication + adherence history, 11
  educational resources, 8 notifications), anchored to a reference date so
  "upcoming" and "next dose" always look current relative to whenever the
  app is opened.
- `src/services/store.ts` holds this as a module-level in-memory "database."
- `src/services/api-client.ts` exports `simulateRequest`, which every
  service function funnels its work through: it adds randomized network
  latency (280–820ms) and a small random failure rate (5% by default, with a
  dev-only "simulate errors" toggle that forces 100% failure for manual QA
  of error states), and throws a typed `ApiError` with an HTTP-style status
  code rather than a bare `Error`.
- Each `*.service.ts` file (`appointment.service.ts`, `resource.service.ts`,
  etc.) exposes async functions with the same shape a real fetch wrapper
  would have — `getAppointments(filter): Promise<Appointment[]>` — and
  components/hooks never import `store.ts` or `api-client.ts` directly.

## Consequences

- Every loading skeleton, error state, and retry button in the app is
  exercised by real async behavior during normal use and during manual QA
  (via the network-chaos toggle), not just written and never triggered.
- TanStack Query's caching and invalidation logic is doing real work:
  there's an actual asynchronous round trip to cache the result of, and an
  actual mutation to invalidate after.
- The service layer is the one seam that would need to change to point at a
  real backend — swap `simulateRequest`'s body for a `fetch` call with the
  same function signatures, and nothing above the service layer (query
  hooks, components) would need to change.
- Tests mock at exactly this boundary (`simulateRequest` in
  `api-client.ts`), which means test suites exercise the real filtering,
  mutation, and error-throwing logic in each service function — only the
  latency and randomness are stubbed out. See the README's testing section.
- Cost: more code than a flat `mockData.ts` file — a store, a seed builder,
  per-domain service files, and an `ApiError` class. For a project whose
  explicit goal is to demonstrate frontend engineering against a realistic
  API shape, that cost is the point, not overhead to be trimmed.
