import { z } from 'zod'

/**
 * SIMULATED AUTH ONLY.
 * There is no real backend, no password hashing, and no session security
 * here — see src/services/auth.service.ts and README.md ("Security
 * considerations") before mistaking this for a production auth pattern.
 */
export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export type AuthUser = z.infer<typeof authUserSchema>
