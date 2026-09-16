import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { renderWithProviders } from '@/test/render'
import { ApiError } from '@/services/api-client'

vi.mock('@/services/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api-client')>()
  return {
    ...actual,
    simulateRequest: vi.fn(async <T,>(resolve: () => T) => resolve()),
  }
})

describe('DashboardPage', () => {
  afterEach(async () => {
    const { simulateRequest } = await import('@/services/api-client')
    vi.mocked(simulateRequest).mockReset()
    vi.mocked(simulateRequest).mockImplementation(async (resolve) => resolve())
  })

  it('renders the greeting, current treatment, and progress once data loads', async () => {
    renderWithProviders(<DashboardPage />)

    expect(
      await screen.findByText(/good (morning|afternoon|evening), jordan/i),
    ).toBeInTheDocument()
    expect(await screen.findByText(/solvitra \(etravolimab\)/i)).toBeInTheDocument()
    expect(
      await screen.findByRole('progressbar', { name: /treatment journey progress/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/next appointment/i)).toBeInTheDocument()
  })

  it('shows an error state when the dashboard data fails to load', async () => {
    const { simulateRequest } = await import('@/services/api-client')
    vi.mocked(simulateRequest).mockRejectedValue(new ApiError('Network down', 503))

    renderWithProviders(<DashboardPage />)

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(0)
    expect(screen.getByText("Couldn't load your dashboard")).toBeInTheDocument()
  })
})
