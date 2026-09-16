import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { renderWithProviders } from '@/test/render'

vi.mock('@/services/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api-client')>()
  return {
    ...actual,
    simulateRequest: async <T,>(resolve: () => T) => resolve(),
  }
})

describe('NotificationsPage', () => {
  it('marks a single notification as read', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NotificationsPage />, { route: '/notifications' })

    const markReadButtons = await screen.findAllByRole('button', {
      name: /^mark as read$/i,
    })
    const initialUnreadCount = markReadButtons.length
    expect(initialUnreadCount).toBeGreaterThan(0)

    await user.click(markReadButtons[0])

    await screen.findByRole('status') // the live-region announcement mounts
    expect(
      await screen.findAllByRole('button', { name: /^mark as read$/i }),
    ).toHaveLength(initialUnreadCount - 1)
  })

  it('marks every notification as read and hides the bulk action', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NotificationsPage />, { route: '/notifications' })

    const markAllButton = await screen.findByRole('button', { name: /mark all as read/i })
    await user.click(markAllButton)

    expect(
      screen.queryByRole('button', { name: /^mark as read$/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /mark all as read/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/^unread$/i)).not.toBeInTheDocument()
  })

  it('filters notifications by category', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NotificationsPage />, { route: '/notifications' })

    await screen.findAllByRole('listitem')

    await user.click(screen.getByRole('tab', { name: /^medication$/i }))

    const items = await screen.findAllByRole('listitem')
    items.forEach((item) => {
      expect(item).toHaveTextContent('Medication')
    })
  })

  it('shows an empty state when there are no notifications at all', async () => {
    const { notificationService } = await import('@/services')
    vi.spyOn(notificationService, 'getNotifications').mockResolvedValue([])

    renderWithProviders(<NotificationsPage />, { route: '/notifications' })

    expect(await screen.findByText(/no notifications/i)).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
})
