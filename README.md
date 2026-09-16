# Meridian Care — Patient Support Portal

A patient-facing support portal for a fictional pharmaceutical/healthcare
company, built as a portfolio project to demonstrate production-quality
React + TypeScript frontend engineering for a healthcare technology context.

> **This is a demo, not a medical product.** There are no real patients,
> providers, treatments, or clinical data anywhere in this codebase.
> Authentication is simulated. Nothing here constitutes medical advice. See
> [Security & data considerations](#security--data-considerations) below.

## Overview

Meridian Care is the patient-facing portal a specialty pharmaceutical company
might build for people on a long-term treatment: a place to see your
treatment journey, upcoming appointments, current medication and adherence
history, educational resources about your condition, and notifications —
all in one accessible, responsive interface.

The single fictional patient seeded into the app, **Jordan Ellis**, is
midway through a treatment for moderate-to-severe atopic dermatitis
(**Solvitra**, a fictional biologic) — far enough along to have a completed
onboarding phase, an established appointment history, a partial adherence
record (including one realistically missed dose), and upcoming follow-up
care. That narrative arc is what every screen in the app is built to show.

## Why this project exists

It's a portfolio piece built to demonstrate the kind of frontend engineering
a senior React role expects, in a domain — patient support / healthcare —
that rewards exactly the qualities that matter most in that domain: careful
handling of async and error states, real accessibility (not just
Lighthouse-green), a UI that reads as trustworthy rather than flashy, and an
architecture that would hold up if a real backend, more patients, and more
features were added tomorrow.

## Features

- **Simulated authentication** — a login form backed by a fake session
  layer (see [Security & data considerations](#security--data-considerations)),
  gating a `ProtectedRoute` wrapper around every other screen.
- **Patient dashboard** — a personalized greeting, current treatment
  summary, next appointment, medication snapshot with next-dose info,
  adherence progress, a notifications preview, and recommended resources.
- **Treatment journey** — a visual, stepped timeline (diagnosis → prescribed
  → onboarding → current stage → follow-up → long-term management) showing
  completed, current, and upcoming stages.
- **Appointments** — a filterable list (all / upcoming / cancelled /
  completed) and detail view with provider, location, and type, plus a
  demo cancel/reschedule flow with inline confirmation and live-region
  status announcements.
- **Medications & treatment** — current treatment detail, dosing schedule,
  next-dose timing, a color-and-icon adherence grid, and a medication
  history table. No dosing or clinical recommendations are ever generated —
  see the disclaimer pattern below.
- **Educational resources** — a searchable, category-filterable resource
  library with detail pages and related-resource suggestions.
- **Notifications** — read/unread state, category filtering, mark-as-read
  and mark-all-as-read, with an empty state when there's nothing to show.
- **Profile** — personal info and a granular notification-preferences
  matrix (channel × category).
- **Full UI state coverage** — every data-driven feature has a real loading
  skeleton, error state with retry, empty state, and success state, backed
  by an actually-async mock API (not hardcoded data — see
  [ADR 0005](./docs/adr/0005-mock-api-layer.md)). A dev-only "simulate
  network errors" toggle in the header forces every request to fail, for
  manually exercising error states.
- **Responsive design** — verified at mobile (375px), tablet (820px), and
  desktop (1440px) breakpoints, with a collapsible mobile navigation panel.
- **Accessibility** — see [Accessibility considerations](#accessibility-considerations).

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | React 19                                           |
| Language           | TypeScript (strict mode)                           |
| Build tool         | Vite                                               |
| Routing            | React Router v7                                    |
| Server state       | TanStack Query v5                                  |
| Forms & validation | React Hook Form + Zod                              |
| Styling            | Tailwind CSS v4 (CSS-based `@theme` design tokens) |
| Icons              | lucide-react                                       |
| Testing            | Vitest + React Testing Library                     |
| Linting/formatting | ESLint (flat config) + Prettier                    |
| CI                 | GitHub Actions                                     |

See [`package.json`](./package.json) for exact versions.

## Architecture

Full detail lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md). In short: the
app is layered as **pages/components → feature query hooks (`api.ts`) →
service layer (`*.service.ts`) → in-memory mock store**, with each layer
only aware of the one directly beneath it. Individual architectural
decisions and their tradeoffs are recorded as ADRs in
[`docs/adr/`](./docs/adr):

- [0001 — Why TypeScript](./docs/adr/0001-typescript.md)
- [0002 — Why feature-based architecture](./docs/adr/0002-feature-based-architecture.md)
- [0003 — Why TanStack Query](./docs/adr/0003-tanstack-query.md)
- [0004 — Why React Hook Form + Zod](./docs/adr/0004-rhf-zod.md)
- [0005 — Why a mock API layer instead of hardcoded data](./docs/adr/0005-mock-api-layer.md)

## Folder structure

```
src/
  app/              # routing, layout shell, protected-route guard, 404 page
  components/       # cross-feature UI primitives: Button, Card, AsyncSection,
                     # Skeleton, EmptyState, ErrorState, LiveRegion, form/*
  features/         # one folder per product area, each with api.ts (query hooks),
                     # page + subcomponents, constants.ts, and an index.ts barrel
    auth/
    dashboard/
    treatments/
    appointments/
    medications/
    resources/
    notifications/
    profile/
  hooks/            # cross-feature hooks (useNetworkChaos)
  lib/              # QueryClient instance, query-key factory, cn(), network-chaos store
  services/         # the mock "backend": api-client (simulateRequest), *.service.ts,
                     # store.ts (in-memory db), seed/build-seed-data.ts
  test/             # shared test setup + renderWithProviders helper
  types/            # Zod schemas + inferred TS types, one file per domain
  utils/            # date formatting helpers
docs/adr/           # architecture decision records
.github/workflows/  # CI pipeline
```

See [ARCHITECTURE.md](./ARCHITECTURE.md#folder-structure) for the reasoning
behind this shape.

## Data flow

Every screen follows the same path: a page component calls a feature's
query hook (`useAppointments()`), which calls `useQuery`/`useMutation` with
a centrally-defined query key, which calls a service function
(`appointmentService.getAppointments()`), which runs through
`simulateRequest` (artificial latency + failure) against the in-memory
store, and returns a typed, Zod-validated result. Mutations invalidate the
relevant query keys on success so every view depending on that data
refetches automatically. See
[ARCHITECTURE.md § Data flow, end to end](./ARCHITECTURE.md#data-flow-end-to-end)
for a full worked trace of cancelling an appointment.

## State management strategy

Three kinds of state are deliberately kept separate rather than centralized
in one store:

- **Server state** (appointments, treatment, medications, notifications,
  profile) lives entirely in the TanStack Query cache — no `useState`
  mirrors of fetched data.
- **URL state** (active status filter, active resource category, search
  term) lives in `useSearchParams`, so filtered views are shareable and
  survive a refresh.
- **Local UI state** (mobile nav open/closed, form values, an inline
  confirm toggle) lives in component `useState` or React Hook Form.

There is no global app-data store (no Redux/Zustand). The one Context
provider, `AuthProvider`, holds session identity because it's genuinely
needed by the router guard, header, and every protected page — it does not
hold server data. See [ARCHITECTURE.md § State management strategy](./ARCHITECTURE.md#state-management-strategy).

## Accessibility considerations

- Skip-to-content link, semantic landmarks (`header`/`nav`/`main`), and a
  logical heading hierarchy on every page.
- Keyboard support throughout: the mobile nav traps focus appropriately, is
  dismissible with Escape, and returns focus to its trigger on close.
- Status changes that aren't adjacent to the user's focus (cancelling an
  appointment, marking a notification read) are announced through a shared
  `LiveRegion` (`role="status"`, `aria-live="polite"`) component.
- Custom widgets use correct ARIA roles and states: filter pills use
  `role="tablist"`/`role="tab"`/`aria-selected`; toggle switches use
  `role="switch"`/`aria-checked`; progress uses `role="progressbar"` with
  `aria-valuenow`/`aria-valuemin`/`aria-valuemax`.
- The medication history table is a real `<table>` with `scope="col"` /
  `scope="row"`, not a styled grid of `<div>`s.
- The adherence visualization never relies on color alone — every cell
  pairs a color with an icon and screen-reader text.
- All form inputs have associated `<label>`s, `aria-invalid`, and
  `aria-describedby` pointing at their error message.
- Focus-visible styling is applied globally rather than suppressed, and
  animation respects `prefers-reduced-motion`.
- **Color contrast was computed, not eyeballed**: a small Node script
  computing WCAG relative-luminance contrast ratios was run against every
  design token, and four token pairs were darkened after failing the
  4.5:1 (text) or 3:1 (UI component / large text) AA thresholds — the
  amber "in progress" status text, the amber icon/badge background, the
  default form-input border color, and the notification-preferences
  switch's off-state track. See the token comments in `src/index.css`.

## Testing strategy

The suite (Vitest + React Testing Library, 25 tests across 8 files) focuses
on behavior a user or an interviewer would actually care about, not
implementation details:

- **Auth & routing** — `LoginPage` covers empty-form validation, invalid
  email format, a wrong-credentials error message, and a successful
  login-and-redirect; `ProtectedRoute` covers both the unauthenticated
  redirect and (via a real `authService.login()` call, not a hand-rolled
  fixture) rendering protected content once authenticated.
- **Dashboard** — renders the greeting, treatment, progress, and
  next-appointment cards from real (mocked-fast) data, and separately
  verifies the dashboard's error state when the underlying request rejects.
- **Appointments** — status filtering across all four filter states with
  exact expected counts, and that the active filter pill correctly reflects
  `aria-selected`; the reschedule form's date validation (rejects a past
  date), successful submission payload shape, and cancel-without-submitting
  behavior.
- **Notifications** — marking a single notification read, marking all read
  (and the bulk action disappearing once nothing is unread), category
  filtering, and the empty state when there are no notifications.
- **Service layer** — `appointment.service.ts` is tested directly: status
  filtering, that cancellation and rescheduling actually persist to the
  store, a 404 `ApiError` for an unknown id, and that a simulated network
  failure propagates as a typed error.
- **A generic component** — `AsyncSection` is tested in isolation against a
  hand-built fake query object, covering its pending/error/success
  branches once so every feature that reuses it doesn't need to re-test
  that logic.

Tests mock exactly one seam — `simulateRequest` in `src/services/api-client.ts`
— via `vi.mock` with `importOriginal` partial-mocking, so the real
filtering/mutation/error-throwing logic in every service function runs for
real; only artificial latency and randomness are removed. Run
`npm run test:coverage` for the full coverage report (v8 provider).

## CI/CD

[`​.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on every push
and pull request to `main`: install → lint → format check → typecheck →
test with coverage → production build, uploading the coverage report and
the `dist/` build as workflow artifacts. A concurrency group cancels
superseded runs on the same branch. There is no deploy step — this is a
portfolio project without a hosting target — but the pipeline is structured
so adding one (e.g. a deploy-on-merge-to-main job gated on the existing
jobs succeeding) would be a small addition, not a restructure.

## Setup instructions

Requires Node.js 20+ (CI runs on Node 22).

```bash
npm install
npm run dev        # start the dev server
```

Other scripts:

```bash
npm run build          # typecheck + production build
npm run preview        # preview the production build locally
npm run lint            # ESLint
npm run lint:fix        # ESLint with autofix
npm run format          # Prettier --write
npm run format:check    # Prettier --check (used in CI)
npm run typecheck       # tsc -b, no emit
npm run test             # Vitest, single run
npm run test:watch      # Vitest, watch mode
npm run test:coverage   # Vitest with v8 coverage report
```

### Signing in

The login screen has a "Fill in demo credentials" button that populates the
one seeded demo account. No real signup or backend exists — see
[Security & data considerations](#security--data-considerations).

## Environment variables

None are required. The app has no real backend to point at — the mock
service layer in `src/services/` runs entirely in-memory in the browser. If
this were wired to a real API, the natural place to introduce configuration
would be a `VITE_API_BASE_URL` variable consumed only inside
`src/services/api-client.ts`, so no other layer would need to change (see
[ADR 0005](./docs/adr/0005-mock-api-layer.md)).

## Security & data considerations

- **No real patient data.** Every patient, provider, appointment,
  medication, and clinical detail in this app is fictional, generated in
  [`src/services/seed/build-seed-data.ts`](./src/services/seed/build-seed-data.ts).
  Nothing here is HIPAA-relevant because nothing here is real.
- **Authentication is simulated**, not secure. `src/services/auth.service.ts`
  checks credentials against a single hardcoded demo account and stores a
  fake session token in `sessionStorage`. There is no password hashing, no
  real token issuance/verification, no session expiry, and no backend to
  enforce any of it — this exists purely to demonstrate a protected-route
  pattern in the frontend. **Do not adapt this auth code for a real
  application.**
- **No medical advice.** The app never generates dosing suggestions,
  treatment recommendations, or clinical interpretations. Educational
  resource pages carry an explicit disclaimer component
  (`EducationalDisclaimer`) reinforcing that content is general education,
  not personalized medical guidance.
- **Client-side only.** There is no server component to this project. All
  "persistence" is an in-memory JS object that resets on page reload.

## Limitations

- Data does not persist across a page reload (by design — there's no real
  backend to persist to).
- The mock API's 5% random failure rate is deliberately visible in normal
  use, so a real user testing the app may occasionally see an error state
  on an otherwise successful action; retrying (or reloading) resolves it.
- Only one patient/account exists; there's no multi-user or admin surface.
- No internationalization — the UI is English-only with US date/time
  formatting.
- No dark mode.
- The reschedule/cancel flows are demonstrative — they update the mock
  store but don't simulate provider-side availability or double-booking.

## Future improvements

- Swap the mock service layer for a real backend by replacing
  `simulateRequest`'s implementation in `api-client.ts` with real `fetch`
  calls — no other layer should need to change (see
  [ADR 0005](./docs/adr/0005-mock-api-layer.md)).
- Add optimistic updates for mutations (e.g. cancel-appointment) using
  TanStack Query's `onMutate`, now that the invalidation-based approach is
  established.
- Add end-to-end tests (Playwright) covering full user journeys across
  multiple pages, complementing the current component/unit-level suite.
- Internationalization and a dark mode theme, both of which the CSS-token
  design system (`src/index.css`) is already structured to support.
- A real notification delivery mechanism (the current feature only reflects
  pre-seeded notification state).

---

For the "why" behind specific technical choices, see
[`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`docs/adr/`](./docs/adr).
