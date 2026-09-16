import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services'
import type { AuthUser, LoginInput } from '@/types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  isLoggingIn: boolean
  loginError: string | null
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: reads the demo session from sessionStorage during
  // the first render instead of in a useEffect. That avoids an
  // unauthenticated flash on refresh — there is no extra render where
  // `user` is briefly null before an effect "discovers" the session.
  const [user, setUser] = useState<AuthUser | null>(() => authService.readStoredSession())
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (authUser) => setUser(authUser),
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null)
      // Don't let the next person to sign in on this device see a stale
      // cache of the previous patient's data.
      queryClient.clear()
    },
  })

  const login = useCallback(
    async (input: LoginInput) => {
      await loginMutation.mutateAsync(input)
    },
    [loginMutation],
  )

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
      isLoggingIn: loginMutation.isPending,
      loginError:
        loginMutation.error instanceof Error ? loginMutation.error.message : null,
    }),
    [user, login, logout, loginMutation.isPending, loginMutation.error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
