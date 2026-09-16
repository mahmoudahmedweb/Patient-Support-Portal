import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth'
import { LoginPage } from '@/features/auth/LoginPage'
import { createTestQueryClient } from '@/test/render'

// The real auth service already has a zero-latency, zero-failure-rate
// path (see auth.service.ts), but simulateRequest still adds a real
// ~450-900ms delay. Collapsing that to "resolve immediately" keeps this
// suite fast without touching the credential-matching logic under test.
vi.mock('@/services/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api-client')>()
  return {
    ...actual,
    simulateRequest: async <T,>(resolve: () => T) => resolve(),
  }
})

function renderLoginFlow(initialEntry = '/login') {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard home</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    renderLoginFlow()

    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument()
  })

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup()
    renderLoginFlow()

    await user.type(screen.getByLabelText(/email address/i), 'not-an-email')
    await user.type(screen.getByLabelText(/^password/i), 'something')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument()
  })

  it('shows an error for incorrect demo credentials', async () => {
    const user = userEvent.setup()
    renderLoginFlow()

    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(await screen.findByText(/doesn't match the demo account/i)).toBeInTheDocument()
  })

  it('signs in with the demo credentials and reaches the app', async () => {
    const user = userEvent.setup()
    renderLoginFlow()

    await user.click(screen.getByRole('button', { name: /fill in demo credentials/i }))
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => expect(screen.getByText('Dashboard home')).toBeInTheDocument())
  })
})
