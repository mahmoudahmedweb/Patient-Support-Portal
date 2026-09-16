import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/api-client'

// Bypass the artificial latency/failure so these tests are fast and
// deterministic; failure is exercised explicitly, per test, below.
vi.mock('@/services/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api-client')>()
  return {
    ...actual,
    simulateRequest: vi.fn(async (resolve: () => unknown) => resolve()),
  }
})

describe('appointment.service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('filters appointments by status', async () => {
    const { getAppointments } = await import('@/services/appointment.service')

    const all = await getAppointments({ status: 'all' })
    const upcoming = await getAppointments({ status: 'upcoming' })
    const cancelled = await getAppointments({ status: 'cancelled' })

    expect(all.length).toBe(6)
    expect(upcoming.every((appointment) => appointment.status === 'upcoming')).toBe(true)
    expect(cancelled.every((appointment) => appointment.status === 'cancelled')).toBe(
      true,
    )
    expect(upcoming.length + cancelled.length).toBeLessThan(all.length)
  })

  it('cancels an appointment by id', async () => {
    const { getAppointments, cancelAppointment } =
      await import('@/services/appointment.service')

    const [upcoming] = await getAppointments({ status: 'upcoming' })
    const cancelled = await cancelAppointment(upcoming.id)

    expect(cancelled.status).toBe('cancelled')

    const refetched = await getAppointments({ status: 'all' })
    const persisted = refetched.find((appointment) => appointment.id === upcoming.id)
    expect(persisted?.status).toBe('cancelled')
  })

  it('reschedules an appointment and reactivates it if it was cancelled', async () => {
    const { getAppointments, cancelAppointment, rescheduleAppointment } =
      await import('@/services/appointment.service')

    const [target] = await getAppointments({ status: 'upcoming' })
    await cancelAppointment(target.id)

    const newTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const rescheduled = await rescheduleAppointment(target.id, {
      scheduledAt: newTime,
      reason: 'Conflict with work',
    })

    expect(rescheduled.status).toBe('upcoming')
    expect(new Date(rescheduled.scheduledAt).toISOString()).toBe(
      new Date(newTime).toISOString(),
    )
    expect(rescheduled.notes).toBe('Conflict with work')
  })

  it('throws a 404 ApiError for an unknown appointment id', async () => {
    const { getAppointment } = await import('@/services/appointment.service')

    await expect(getAppointment('not-a-real-id')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    })
  })

  it('propagates a simulated network failure as an ApiError', async () => {
    const { simulateRequest } = await import('@/services/api-client')
    vi.mocked(simulateRequest).mockRejectedValueOnce(
      new ApiError('Simulated outage', 503),
    )

    const { getAppointments } = await import('@/services/appointment.service')

    await expect(getAppointments()).rejects.toThrow('Simulated outage')
  })
})
