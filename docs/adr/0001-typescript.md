# ADR 0001: Use TypeScript throughout

## Status

Accepted

## Context

This project models a domain with a lot of interlocking shape: appointments
have statuses that determine what actions are valid, treatments have journey
stages with an ordering, forms have validation rules that need to match what
the "backend" (mock service layer) will accept. Plain JavaScript gives no
compile-time guarantee that a component passed the right shape, that an
`AppointmentStatus` string is one of the four valid values, or that a
refactor of the `Appointment` type was propagated to every place that reads
it.

## Decision

The entire app — components, hooks, services, the mock data layer, and the
test suite — is TypeScript, compiled under `strict: true`, with
`@typescript-eslint/no-explicit-any` set to `error` rather than `warn`.
Domain types are not hand-written interfaces; they are inferred from Zod
schemas (`z.infer<typeof appointmentSchema>`), so the runtime validation and
the compile-time type can never drift apart — see
[ADR 0004](./0004-rhf-zod.md).

## Consequences

- Every service function has a typed return value, so a component
  destructuring `appointment.status` gets autocomplete and a compile error if
  the field is renamed.
- Refactors are safer: renaming `Treatment.startedAt` to `Treatment.startDate`
  breaks the build everywhere it's used, instead of failing silently at
  runtime in only the paths exercised by tests.
- `any` is banned by lint rule, so the type system can't be silently escaped;
  the few places that need genuine flexibility (generic components like
  `AsyncSection<T>`) use real generics instead.
- Cost: more upfront ceremony (schemas + inferred types instead of inline
  object literals), and the mock store's dev-mode `.parse()` validation
  (`src/services/store.ts`) adds a small amount of extra code. This is a
  reasonable tradeoff for a codebase meant to demonstrate production
  discipline rather than move as fast as possible for a one-off script.
