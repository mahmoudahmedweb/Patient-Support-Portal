import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentsPage } from '@/features/appointments/AppointmentsPage'
import { renderWithProviders } from '@/test/render'

vi.mock('@/services/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api-client')>()
  return {
    ...actual,
    simulateRequest: async <T,>(resolve: () => T) => resolve(),
  }
})

describe('AppointmentsPage', () => {
  it('lists every appointment by default and filters by status', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppointmentsPage />, { route: '/appointments' })

    // Six fictional appointments ship in the seed data (see
    // services/seed/build-seed-data.ts): three completed, two upcoming,
    // one cancelled.
    const allLinks = await screen.findAllByRole('link')
    expect(allLinks).toHaveLength(6)

    await user.click(screen.getByRole('tab', { name: /^upcoming$/i }))
    const upcomingLinks = await screen.findAllByRole('link')
    expect(upcomingLinks).toHaveLength(2)
    upcomingLinks.forEach((link) => {
      expect(within(link).getByText('Upcoming')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('tab', { name: /^cancelled$/i }))
    const cancelledLinks = await screen.findAllByRole('link')
    expect(cancelledLinks).toHaveLength(1)
    expect(within(cancelledLinks[0]).getByText('Cancelled')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /^completed$/i }))
    const completedLinks = await screen.findAllByRole('link')
    expect(completedLinks).toHaveLength(3)
  })

  it('marks the active filter tab with aria-selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppointmentsPage />, { route: '/appointments' })
    await screen.findAllByRole('link')

    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.click(screen.getByRole('tab', { name: /^upcoming$/i }))

    expect(screen.getByRole('tab', { name: /^upcoming$/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })
})
