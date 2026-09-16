# ADR 0004: React Hook Form + Zod for forms and validation

## Status

Accepted

## Context

The app has several non-trivial forms: login, appointment rescheduling
(with a "must be in the future" constraint), profile personal info, and a
notification-preferences matrix of toggles. Each needs client-side
validation with accessible error messages, and several needs (login, the
mock data layer's dev-mode checks) benefit from a validation schema that can
be reused outside of a form context.

## Decision

Use React Hook Form (RHF) for form state and submission, with Zod schemas as
the single source of truth for both validation rules and TypeScript types,
wired together via `@hookform/resolvers/zod`. Every domain type in
`src/types/*.ts` is defined as a Zod schema first, with the TypeScript type
derived via `z.infer<typeof schema>` — so `loginSchema` produces both the
runtime validator RHF uses and the `LoginInput` type the rest of the app
imports. Schemas that only apply to a mutation payload (e.g.
`rescheduleAppointmentSchema`) live next to their domain type and are reused
by the mock service layer's dev-mode validation (`src/services/store.ts`),
so "what a valid appointment looks like" is defined exactly once.

For a form field type RHF doesn't control directly (the `Switch` toggle
components in the notification-preferences grid), `Controller` bridges RHF's
field state to the custom component rather than reaching for
`register`-only patterns that only work on native inputs.

## Consequences

- Validation logic and TypeScript types can't drift apart — changing a
  constraint in the schema (e.g. tightening the reschedule date rule)
  automatically updates the inferred type and the form's error messages in
  one place.
- RHF keeps re-renders scoped to changed fields (uncontrolled-by-default),
  which matters for the notification-preferences grid's 9-toggle table.
- Error messages come from the schema (`errors.email?.message`) and are
  wired to inputs via `aria-invalid`/`aria-describedby`, keeping validation
  accessible without extra bespoke wiring per form.
- Cost: an extra dependency (`@hookform/resolvers`) and a small amount of
  indirection for anyone unfamiliar with the resolver pattern. Considered
  and rejected: hand-rolled `useState` + manual validation functions per
  form (duplicates logic across forms, no type inference) and Formik +
  Yup (a viable alternative, but Zod's TypeScript-first inference is a
  better fit given the rest of the app already treats Zod schemas as the
  domain model — see [ADR 0001](./0001-typescript.md)).
