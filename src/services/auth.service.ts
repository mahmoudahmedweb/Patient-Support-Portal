import { ApiError, simulateRequest } from '@/services/api-client'
import { demoAuthUser, demoCredentials } from '@/services/store'
import type { AuthUser, LoginInput } from '@/types'

/**
 * SIMULATED AUTH — there is no backend behind this. A single hard-coded
 * demo account "logs in" against values in memory, and the session is a
 * plain object in sessionStorage. This is intentionally NOT a pattern to
 * copy into a real app: no password hashing, no CSRF/XSS hardening, no
 * refresh tokens. See README.md > Security considerations.
 */
const SESSION_KEY = 'meridian-care.demo-session'

interface StoredSession {
  token: string
  user: AuthUser
}

export function readStoredSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    return parsed.user ?? null
  } catch {
    return null
  }
}

export async function login(credentials: LoginInput): Promise<AuthUser> {
  return simulateRequest(
    () => {
      const emailMatches =
        credentials.email.trim().toLowerCase() === demoCredentials.email.toLowerCase()
      const passwordMatches = credentials.password === demoCredentials.password

      if (!emailMatches || !passwordMatches) {
        throw new ApiError("That email or password doesn't match the demo account.", 401)
      }

      const session: StoredSession = { token: 'demo-session-token', user: demoAuthUser }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      return demoAuthUser
    },
    { failureRate: 0, minDelayMs: 450, maxDelayMs: 900, errorMessage: 'Sign-in failed.' },
  )
}

export async function logout(): Promise<void> {
  return simulateRequest(
    () => {
      sessionStorage.removeItem(SESSION_KEY)
    },
    { failureRate: 0, minDelayMs: 150, maxDelayMs: 350 },
  )
}
