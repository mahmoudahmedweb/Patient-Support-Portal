# ADR 0002: Feature-based folder architecture

## Status

Accepted

## Context

There are two common ways to organize a React app of this size: by **file
type** (`components/`, `pages/`, `hooks/`, `api/` at the top level, each
containing files for every domain) or by **feature/domain** (one folder per
product area, each containing its own components, hooks, and API calls).
This app has eight fairly distinct product areas (dashboard, treatment
journey, appointments, medications, resources, notifications, profile, auth)
that mostly don't share business logic with each other.

## Decision

Organize `src/features/<domain>/` by feature, not by file type. Each feature
folder owns its own `api.ts` (TanStack Query hooks), page component(s),
feature-specific subcomponents, `constants.ts` where relevant, and an
`index.ts` barrel that defines the feature's public surface. Only truly
cross-feature code lives at the top level: `src/components/` (Button, Card,
AsyncSection, form primitives), `src/lib/`, `src/hooks/`, `src/types/`,
`src/services/`.

## Consequences

- Working on "appointments" means working inside one folder, not jumping
  between `components/AppointmentCard.tsx`, `pages/AppointmentsPage.tsx`,
  `hooks/useAppointments.ts`, and `api/appointments.ts` scattered across four
  top-level directories.
- Each feature's `index.ts` barrel makes its public API explicit — other
  features and `app/routes.tsx` import from `@/features/appointments`, never
  reaching into `@/features/appointments/AppointmentCard` directly. This
  keeps internal refactors of a feature from rippling outward.
- Route-level code splitting maps naturally onto this structure:
  `app/routes.tsx` lazy-loads one component per feature, so each feature
  becomes its own JS chunk with no extra wiring.
- Risk: feature folders can accumulate genuinely shared logic that should be
  promoted to `src/components` or `src/lib` instead of copy-pasted. This
  didn't come up at this project's scale (the only real cross-feature sharing
  — async loading/error rendering, date formatting, form primitives — was
  already factored out from the start), but it's the main thing to watch as
  a feature-based codebase grows.
- Alternative considered: a type-based split. Rejected because it optimizes
  for "find all components" (a task you do rarely) at the cost of "work on
  one feature" (a task you do constantly), and because it doesn't compose
  with route-level code splitting without extra manual grouping.
