import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { authService } from '@/services'
import { demoCredentials } from '@/services/store'
import { createTestQueryClient } from '@/test/render'

vi.mock('@/services/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api-client')>()
  return {
    ...actual,
    simulateRequest: async <T,>(resolve: () => T) => resolve(),
  }
})

function renderProtected(initialEntry: string) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login screen</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<div>Protected dashboard</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('redirects to /login when there is no session', () => {
    renderProtected('/')

    expect(screen.getByText('Login screen')).toBeInTheDocument()
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument()
  })

  it('renders the protected content when a session exists', async () => {
    // Log in for real (through the actual auth service) so the session
    // in sessionStorage is exactly what production code would write,
    // rather than a hand-rolled fixture that could drift from it.
    await authService.login(demoCredentials)

    renderProtected('/')

    expect(screen.getByText('Protected dashboard')).toBeInTheDocument()
  })
})
