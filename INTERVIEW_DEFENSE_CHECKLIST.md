# Interview Defense Checklist

Everything below is something you built into this codebase on purpose and
should be able to explain, unprompted, to a senior React interviewer:
**what** it is, **where** it lives in this repo, **why** you chose it over
the obvious alternative, and **what would break** if it were done the naive
way instead. File paths are given so you can pull the code up live if asked.

Work through this by reading the code at each path, not just the summary
here — you should be able to point at the actual line.

---

## 1. React fundamentals & React 19 features

### 1.1 The `use()` hook for context

- **Where**: `src/features/auth/useAuth.ts`
- **What**: `useAuth()` calls React 19's `use(AuthContext)` instead of the
  older `useContext(AuthContext)`.
- **Why it matters**: `use()` can be called conditionally and inside loops
  (unlike other hooks), and is the forward-looking API for reading
  Context — worth knowing it exists and how it differs from `useContext`,
  even though this project uses it in an unconditional position.
- **Be ready to answer**: "What's the difference between `use()` and
  `useContext()`?" (`use()` can be called conditionally; it also works with
  promises for Suspense-based data fetching, which `useContext` cannot).

### 1.2 Lazy `useState` initializer for session restoration

- **Where**: `src/features/auth/AuthProvider.tsx` —
  `useState(() => authService.readStoredSession())`
- **What**: Passing a function to `useState` instead of a value, so the
  (synchronous) `sessionStorage` read only happens once, on mount, not on
  every render.
- **Why not `useEffect` + `useState(null)`**: that pattern renders once as
  "logged out," then flips to "logged in" after the effect runs — a visible
  flash of the wrong UI. The lazy initializer gets the correct initial state
  in the first render, no flash, no extra render.
- **Be ready to answer**: "Why not just check `sessionStorage` directly in
  the component body?" — you can, but doing it via the lazy initializer form
  is the idiomatic way to run an expensive/side-effecting read exactly once
  rather than on every render.

### 1.3 Deriving values during render instead of `useEffect` + `useState`

- **Where**: `src/features/dashboard/components/GreetingHeader.tsx` (the
  time-of-day greeting), and generally throughout the query hooks (derived
  loading/error booleans).
- **What**: Values that can be computed directly from existing state/props
  are computed inline during render, not synced into a second piece of state
  via `useEffect`.
- **Why**: `useEffect` to copy one state into another is a classic
  anti-pattern — it adds a render, a moment where the two are out of sync,
  and unnecessary complexity. If you can compute it, don't store it.
- **Be ready to answer**: "When _should_ you use `useEffect`?" — for
  synchronizing with something outside React (subscriptions, the DOM,
  non-React APIs) — see 1.4 below for the one real example in this codebase.

### 1.4 `useSyncExternalStore` for the network-chaos toggle

- **Where**: `src/lib/network-chaos.ts` (the store) +
  `src/hooks/useNetworkChaos.ts` (the hook) +
  `src/components/NetworkChaosToggle.tsx` (the UI)
- **What**: A tiny external store (a plain module-level variable + a
  `Set` of subscriber callbacks) exposing `getSnapshot`/`subscribe`, read via
  `useSyncExternalStore`.
- **Why this and not `useState` lifted to context, and not Redux**: this is
  genuinely external mutable state (module-level, not owned by a single
  component tree, read by the mock API layer in `services/api-client.ts`
  which isn't a component at all), and it's a dev/demo affordance, not
  application data — pulling in a global state library for one boolean
  toggle would be the wrong tool. `useSyncExternalStore` is the correct
  primitive for "subscribe to state that lives outside React."
- **Be ready to answer**: "Why not just `useState` in a Context provider?"
  — because the state needs to be read from `api-client.ts`, which is
  outside the React tree entirely; a Context can't be read from plain
  functions.

### 1.5 `useDeferredValue` for resource search

- **Where**: `src/features/resources/ResourcesPage.tsx`
- **What**: The search input's value is used directly for the controlled
  input (so typing feels instant), but a `useDeferredValue`-wrapped copy is
  what's actually passed to the query, so filtering/re-rendering the
  (potentially large) result list doesn't block keystrokes.
- **Why not a manual `setTimeout` debounce**: `useDeferredValue` is a
  React-native concurrent feature that lets React interrupt the deferred
  render if a new keystroke comes in, rather than committing to a fixed
  delay. It composes with React's scheduler instead of fighting it.
- **Be ready to answer**: "`useDeferredValue` vs `useTransition` — when do
  you reach for which?" — `useDeferredValue` when you don't control the
  state setter (e.g., it's a prop or comes from a controlled input you
  still want to update instantly); `useTransition` when you do control the
  setter and want to mark the update itself as low-priority.

### 1.6 Route-level code splitting with `React.lazy` + `Suspense`

- **Where**: `src/app/routes.tsx`, `src/app/PageLoadingFallback.tsx`
- **What**: Every page component is `React.lazy`-loaded, so each route
  becomes its own JS chunk, loaded on navigation rather than all at once.
- **Why**: keeps the initial bundle small — a user logging in to check one
  appointment doesn't download the resources library's or the profile
  page's code until they visit those routes.
- **Be ready to answer**: "What happens if a lazy chunk fails to load?" —
  worth knowing this codebase does _not_ currently have an error boundary
  around the lazy routes; that's a legitimate gap to acknowledge if asked
  ("I'd add an ErrorBoundary around the Suspense boundary for production").

### 1.7 Reusable generic component: `AsyncSection<T>`

- **Where**: `src/components/AsyncSection.tsx`, used in virtually every
  feature page.
- **What**: A single component that takes a TanStack Query result object
  (`{isPending, isError, data, refetch}`) and a set of render props/children,
  and turns it into the correct skeleton/error/empty/success branch —
  written once as a generic (`<T,>`) so it works for any query's data shape
  without `any`.
- **Why**: every feature needs the same four-state handling
  (loading/error/empty/success). Without this, that branching logic gets
  copy-pasted into eight page components with eight chances to get the
  empty-state or retry-button behavior slightly wrong. This is the single
  biggest DRY decision in the UI layer.
- **Be ready to answer**: "Show me how you'd add a ninth feature with this
  pattern" — you'd write its `api.ts` query hook and pass the result
  straight into `<AsyncSection>`, no new loading/error JSX required.

### 1.8 Not overusing `useMemo`/`useCallback`

- **What**: These are only used where there's a concrete reason (e.g.
  `closeMobileNav` in `AppLayout.tsx` is wrapped in `useCallback` specifically
  because it's a dependency of a `useEffect` that adds a `document`
  event listener — omitting the wrap would mean the effect re-subscribes on
  every render). They are not applied reflexively to every function/value.
- **Be ready to answer**: "When does memoization actually help?" — when a
  value is a dependency of another hook, or passed to a memoized child
  (`React.memo`) where referential stability prevents an unnecessary
  re-render, or when a computation is genuinely expensive. Not "always," and
  you should be able to say why not.

---

## 2. TypeScript

### 2.1 Zod schemas as the single source of truth for types

- **Where**: every file in `src/types/*.ts`
- **What**: Every domain type (`Appointment`, `Treatment`, `Medication`,
  etc.) is defined as a Zod schema (`z.object({...})`), and the TypeScript
  type is derived with `z.infer<typeof schema>` — never hand-written
  separately.
- **Why**: a hand-written `interface Appointment {...}` and a hand-written
  runtime validator for the same shape can silently drift apart as the app
  evolves. Deriving the type from the schema makes that impossible — there's
  exactly one definition of what an `Appointment` is.
- **Be ready to answer**: "Where does the runtime validation actually run?"
  — `src/services/store.ts`'s dev-mode `.parse()` calls, so a malformed seed
  record would throw a clear error in development instead of silently
  producing `undefined` fields at runtime in production.

### 2.2 Strict mode, no `any`

- **Where**: `tsconfig.app.json` (`strict: true`), `eslint.config.js`
  (`@typescript-eslint/no-explicit-any: 'error'`)
- **Why**: `any` opts a value out of type checking entirely — one `any`
  can silently propagate through a whole call chain. Banning it as a lint
  _error_ (not just discouraging it) forces genuine typing decisions
  (generics, union types, `unknown` + narrowing) at every boundary.
- **Be ready to answer**: "Where did you actually need a generic instead of
  `any`?" — `AsyncSection<T>` (§1.7) and the query-key factory in
  `src/lib/query-keys.ts`.

### 2.3 Discriminated unions for status fields

- **Where**: `AppointmentStatus`, `JourneyStageStatus`, etc. in
  `src/types/*.ts` — string literal unions (`'upcoming' | 'completed' |
'cancelled'`), consumed with exhaustive `switch`/lookup-object patterns in
  `constants.ts` files (e.g. `STATUS_LABELS`, `STATUS_TONE`).
- **Why**: a plain `string` type would let `appointment.status === 'compelted'`
  (typo) compile silently. A literal union makes that a compile error, and
  a lookup object typed by the union (`Record<AppointmentStatus, string>`)
  gives a compile error if a new status is added but a label is forgotten.

### 2.4 `ApiError` — a typed error class

- **Where**: `src/services/api-client.ts`
- **What**: `class ApiError extends Error { status: number }`, thrown by
  every service function instead of a bare `Error` or a rejected value.
- **Why**: lets calling code (and tests) distinguish error _kinds_ —
  `error instanceof ApiError && error.status === 404` vs. a generic failure
  — the same way you'd branch on an HTTP status from a real API.
- **Interview story**: this is exactly the type that the `LoginPage` bug
  (§5.1 below) revolved around — worth having that story ready.

### 2.5 Path aliases and module resolution

- **Where**: `tsconfig.app.json`'s `paths: {"@/*": ["./src/*"]}`,
  mirrored in `vite.config.ts`'s `resolve.alias`.
- **Know this**: `baseUrl` had to be removed (not just left alongside
  `paths`) because TypeScript 6.0 deprecates `baseUrl` under
  `moduleResolution: "bundler"` — a real error you hit and fixed, good for
  "tell me about a time you had to debug a tooling issue."

---

## 3. Architecture & data flow

### 3.1 Feature-based folder structure

- **Where**: `src/features/*`
- **Why over type-based** (`components/`, `pages/`, `hooks/` at the top
  level): working on one feature touches one folder, not four. Full
  reasoning: [`docs/adr/0002-feature-based-architecture.md`](./docs/adr/0002-feature-based-architecture.md).
- **Be ready to answer**: "What's the boundary — what goes in
  `src/components/` vs. inside a feature folder?" — anything used by two or
  more features is cross-cutting and lives at the top level (Button, Card,
  AsyncSection, form primitives); anything specific to one domain lives in
  that feature's folder.

### 3.2 The mock service layer as a real seam

- **Where**: `src/services/api-client.ts` (`simulateRequest`),
  `src/services/*.service.ts`, `src/services/store.ts`
- **Why not hardcoded component props**: loading states, error states, and
  TanStack Query's caching/invalidation would all be inert if data were
  just imported constants. `simulateRequest` adds real (if artificial)
  latency and a real random failure rate, so every async UI state is
  exercised by normal use, not just written and never triggered. Full
  reasoning: [`docs/adr/0005-mock-api-layer.md`](./docs/adr/0005-mock-api-layer.md).
- **Be ready to answer**: "How would you swap this for a real backend?" —
  replace `simulateRequest`'s body with a real `fetch`, keep every function
  signature identical; nothing above the service layer changes.

### 3.3 Query key factory

- **Where**: `src/lib/query-keys.ts`
- **What**: a single object (`queryKeys.appointments.list(filter)`,
  `queryKeys.appointments.detail(id)`, etc.) that's the only place query
  keys are constructed.
- **Why not inline arrays** (`['appointments', filter]`) at each call site:
  a typo or inconsistent argument order between the `useQuery` call and the
  `invalidateQueries` call in a mutation silently breaks cache invalidation
  — the mutation "succeeds" but the UI doesn't update. Centralizing the
  keys makes that class of bug structurally impossible.

### 3.4 Service layer → query hook → component, one direction only

- **What**: no component imports from `src/services` directly; no service
  function imports React or any hook. Data flows service → query hook
  (`api.ts`) → component, always through that middle layer.
- **Why**: this is what makes each layer independently testable (services
  tested with plain async calls, no React needed; components tested with
  mocked data, no real network needed) and is what makes the "swap for a
  real backend" story in §3.2 true.

---

## 4. TanStack Query

Full reasoning: [`docs/adr/0003-tanstack-query.md`](./docs/adr/0003-tanstack-query.md).

- **Query keys & invalidation** — §3.3 above. Know one concrete example
  end-to-end: cancelling an appointment
  (`src/features/appointments/api.ts`'s `useCancelAppointment`) invalidates
  `queryKeys.appointments.all` in `onSuccess`, so both the list and detail
  views refetch from one mutation.
- **`select`** — `useUnreadNotificationsCount` (in
  `src/features/notifications/api.ts`) subscribes to the _same_ query key as
  the full notifications list but uses `select` to derive just the count.
  Be ready to explain why this is better than a second network call: it's
  the same cached data, re-shaped per-subscriber, no extra request.
- **`placeholderData`** — used to keep prior data on-screen during a filter
  change instead of a full skeleton flash. Know the UX reasoning: a flicker
  to a blank skeleton on every click feels worse than briefly showing
  slightly-stale data while the fresh data loads.
- **`staleTime` / `gcTime` / `retry` / `refetchOnWindowFocus`** — configured
  once in `src/lib/query-client.ts` (30s stale, 5 min garbage collection,
  1 retry, no refetch-on-focus). Be ready to justify the choice: this is a
  not-highly-volatile data domain (a patient's own health data doesn't need
  Twitter-feed-style focus refetching), so the defaults are tuned down from
  React Query's aggressive-refetch defaults.
- **Separate test `QueryClient` per render** — `src/test/render.tsx`'s
  `createTestQueryClient()` sets `retry: false, gcTime: 0` so a mocked
  rejection in a test surfaces immediately instead of after retry delays,
  and so tests can't leak cached state into each other.

---

## 5. Forms: React Hook Form + Zod

Full reasoning: [`docs/adr/0004-rhf-zod.md`](./docs/adr/0004-rhf-zod.md).

- **`zodResolver`** wiring a Zod schema directly into RHF
  (`src/features/auth/LoginPage.tsx` and others) — one schema drives both
  the compile-time `LoginInput` type and the runtime validation RHF runs on
  submit.
- **`Controller`** — `src/features/profile/NotificationPreferencesForm.tsx`
  uses `Controller` to bridge RHF's field state to the custom `Switch`
  component (§7 below), since `register` only works directly on native
  form elements.
- **Uncontrolled-by-default re-renders** — be ready to explain why RHF
  (uncontrolled inputs, subscription-based re-renders) scales better than a
  fully-controlled `useState`-per-field approach for a 9-toggle grid like
  the notification preferences matrix.

### 5.1 The bug the test suite caught — have this story ready

`LoginPage.tsx`'s submit handler originally read the error message from
`loginError`, a value off the `useAuth()` context that's populated by React
Query's _own_ internal state update — which happens on a **later** render,
not synchronously inside the `catch` block. The practical effect: real users
who typed the wrong password would always see the generic fallback message
("Sign-in failed. Please try again.") instead of the server's actual message
("...doesn't match the demo account"), because `loginError` was still stale
(`null` from the prior render) at the moment the `catch` block ran.

This was caught by writing the _required_ test for "shows an error for
incorrect demo credentials" (see `src/features/auth/__tests__/LoginPage.test.tsx`)
— the test asserted the specific server message and failed against the
generic one. The fix (in `src/features/auth/LoginPage.tsx`) was to read the
error directly off the `catch (error)` binding instead of off context state:

```ts
} catch (error) {
  setFormError(
    error instanceof ApiError ? error.message : 'Sign-in failed. Please try again.',
  )
}
```

**Why this is worth telling in an interview**: it's a real example of a
test written to satisfy a requirement ("cover login error states") finding
an actual production bug, not a contrived one — and the bug itself is a
good illustration of a subtle React pitfall (reading async/external state
inside a synchronous error handler instead of the value you just received).

---

## 6. Routing (React Router v7)

- **Protected routes** — `src/app/ProtectedRoute.tsx` redirects
  unauthenticated users to `/login`, passing `state={{ from: location }}` so
  `LoginPage` can redirect back to where the user was headed after a
  successful login.
- **`useSearchParams` for filter state, not `useState`** — the appointments
  status filter, the resources category filter, and the notifications
  category filter all live in the URL. Be ready to justify this concretely:
  a filtered view is shareable/bookmarkable and survives a page refresh,
  which `useState` cannot do. This is also why those pages don't need a
  `useEffect` to "sync" a state variable with the URL — the URL _is_ the
  state.
- **Nested routes + `<Outlet>`** — `src/app/routes.tsx` nests every
  protected page under a layout route rendering `<AppLayout>`, which
  renders `<Outlet>` for the active page — so the header/sidebar don't
  remount on navigation.
- **`NavLink` with a render-prop `className`** — used in `AppLayout.tsx`'s
  sidebar nav to style the active route without manually comparing
  `location.pathname`.

---

## 7. Accessibility (be ready to defend every one of these with a concrete example)

- **Computed contrast, not eyeballed** — you wrote a Node script computing
  WCAG relative-luminance contrast ratios and ran it against every color
  token, finding and fixing four real failures before shipping: the amber
  "in progress" status text (4.44:1 → 5.79:1), the amber icon/badge
  background (3.20:1 → 4.12:1), the default form-input border
  (1.62:1 → 3.03:1), and the notification-preferences switch's off-state
  track (2.69:1 → 5.67:1). **Be ready to explain the two different AA
  thresholds**: 4.5:1 for normal text, 3:1 for large text and non-text UI
  component boundaries — and why a border needs the 3:1 floor, not the
  4.5:1 one.
- **`LiveRegion` component** (`src/components/LiveRegion.tsx`,
  `role="status" aria-live="polite"`) — used anywhere a status changes
  without moving focus (cancelling an appointment, marking a notification
  read), so screen-reader users get the update announced instead of relying
  on a visual-only status pill change.
- **Correct ARIA roles for custom widgets, not divs styled to look like
  native ones**: `role="tablist"`/`role="tab"`/`aria-selected` for the
  filter pills (`AppointmentsPage.tsx`, `NotificationsPage.tsx`);
  `role="switch"`/`aria-checked` for the custom toggle
  (`src/components/form/Switch.tsx`); `role="progressbar"` with
  `aria-valuenow`/`aria-valuemin`/`aria-valuemax` for the adherence progress
  indicator (`ProgressCard.tsx`).
- **Semantic `<table>` for tabular data** — `MedicationHistoryTable.tsx`
  uses real `<table>`/`<th scope="col">`/`<th scope="row">` rather than a
  styled `<div>` grid, so screen readers get row/column relationships for
  free.
- **Color is never the only signal** — the adherence grid
  (`AdherenceGrid.tsx`) pairs every colored cell with an icon and
  screen-reader-only text.
- **Focus management** — the mobile nav panel moves focus in on open and
  restores it on close; Escape closes it via a `document`-level listener in
  a `useEffect` (see §7.1 below for why it's not an inline handler on the
  `<nav>`).
- **`prefers-reduced-motion`** respected globally (`src/index.css`), and
  skeleton loading animation uses `motion-safe:animate-pulse` specifically
  so it's suppressed for users who've asked for reduced motion.
- **Skip-to-content link** — the first focusable element on every page,
  targeting `<main id="main-content" tabIndex={-1}>`.

### 7.1 A real lint-driven accessibility fix — have this one ready too

The mobile nav originally handled Escape with an inline `onKeyDown` on the
`<nav>` element itself. `eslint-plugin-jsx-a11y`'s
`no-noninteractive-element-interactions` rule flagged this: a `<nav>` is a
non-interactive landmark element, and attaching a keyboard handler directly
to it is the wrong pattern (a non-interactive element with a key handler is
invisible to assistive tech as something that responds to keys, and it's
easy to end up depending on focus being in a specific place). The fix,
in `src/app/AppLayout.tsx`, moved the Escape handling to a
`document.addEventListener('keydown', ...)` registered in a `useEffect`
— which also required wrapping the close handler in `useCallback` so the
effect's dependency array stayed clean (satisfying
`react-hooks/exhaustive-deps` without an eslint-disable). This is a good
example of a lint rule catching a real, non-obvious accessibility
distinction, not just a style nitpick.

---

## 8. Styling & design system

- **Tailwind v4's CSS-native `@theme` tokens** (`src/index.css`), not a
  `tailwind.config.js` JS object — be ready to explain this is the v4
  approach: design tokens are declared as CSS custom properties inside an
  `@theme` block, which is also what enables Tailwind's dynamic utility
  values (e.g. arbitrary fractional spacing like `size-4.5`) without extra
  config.
- **Semantic, purpose-named tokens** rather than raw Tailwind palette
  classes — `bg-brand-600`, `text-danger-600`, `border-border-strong` — so
  a color's _meaning_ (brand, danger, a strong border) is legible at the
  call site and can be re-themed centrally.
- **Enterprise-healthcare visual restraint** — deliberately no gradients,
  no decorative animation, no oversized hero sections; the "signature"
  visual element is the vertical stepped treatment-journey timeline
  (`JourneyTimeline.tsx`), which is functional information design (it
  literally encodes the patient's care sequence), not decoration.

---

## 9. Testing

- **Test at the seam that matters** — every test mocks
  `simulateRequest` in `src/services/api-client.ts` via `vi.mock` +
  `importOriginal` partial-mocking, not the service functions themselves.
  Be ready to explain precisely why: this keeps the _real_ filtering logic,
  the _real_ mutation logic, and the _real_ `ApiError` throwing running
  during tests — only the artificial latency and randomness are removed.
  A test failure is a real business-logic failure, not a fake's drift from
  reality.
- **`vi.resetModules()` per test in the service-layer suite** — because
  `src/services/store.ts` holds a module-level singleton "database," a test
  that mutates it (e.g. cancelling an appointment) would leak that mutation
  into the next test unless the module graph is reset and re-imported fresh.
  See `src/services/__tests__/appointment.service.test.ts`.
- **`renderWithProviders`** (`src/test/render.tsx`) — wraps components the
  same way the real app does (`QueryClientProvider` → `MemoryRouter` →
  `AuthProvider`), with a test-tuned `QueryClient` (`retry: false, gcTime: 0`).
- **Testing behavior, not implementation** — assertions query by role/label
  text (`screen.getByRole('button', {name: /sign in/i})`), the React Testing
  Library philosophy: tests should resemble how a user interacts with the
  page, so they don't break on harmless refactors (renaming a CSS class,
  restructuring internal component boundaries) and _do_ break on real
  regressions (a button losing its accessible name, a status not updating).
- **The login bug** — §5.1 above is your best concrete "testing caught a
  real bug" story.
- **What's _not_ covered, and why that's a defensible line**: no
  end-to-end/browser tests (Playwright wasn't added to the automated suite,
  though it was used manually for responsive-design verification during
  development — see the screenshots you generated); coverage sits around
  ~82% statements, concentrated on the paths a user or interviewer would
  actually exercise (forms, filtering, auth, error states) rather than
  chasing 100%.

---

## 10. Tooling & CI

- **ESLint flat config gotcha** — `reactHooks.configs['recommended-latest']`
  crashes flat config (it's an old eslintrc-style config with a
  string-array `plugins` field); the fix was
  `reactHooks.configs.flat['recommended-latest']`. Good "debugging a
  toolchain issue" story — you found this by inspecting the plugin's
  exported `configs` object directly in Node rather than guessing.
- **Pinning ESLint 9** — `eslint-plugin-jsx-a11y` doesn't yet support
  ESLint 10; rather than dropping accessibility linting, the whole
  toolchain was pinned to ESLint 9. A real tradeoff, made deliberately and
  documented (not silently worked around).
- **Prettier config** (`.prettierrc.json`): no semicolons, single quotes,
  trailing commas, 90-character print width — know your own formatting
  config if asked.
- **CI pipeline** (`.github/workflows/ci.yml`): install → lint → format
  check → typecheck → test with coverage → build, uploading coverage and
  `dist/` as artifacts, with a concurrency group that cancels superseded
  runs on the same branch. Be ready to explain why each step is ordered
  where it is (fail fast on cheap checks — lint/format — before the more
  expensive typecheck/test/build steps).

---

## 11. Things to be honest about if asked

Interviewers notice when you only talk about what went well. Have these
ready:

- No E2E test suite (Playwright) in CI — only unit/component tests.
- No error boundary around the lazy-loaded routes (§1.6).
- No real backend — this is explicitly a frontend portfolio piece; see
  [ADR 0005](./docs/adr/0005-mock-api-layer.md) for exactly what would need
  to change to point it at one.
- No internationalization, no dark mode (see the README's "Future
  improvements" section — both were considered and deliberately deferred,
  not overlooked).
- Auth is simulated and explicitly documented as not representative of a
  real auth implementation (see the README's "Security & data
  considerations" section) — know the difference between what you built
  (a protected-route _pattern_) and what you didn't (real credential
  security).
