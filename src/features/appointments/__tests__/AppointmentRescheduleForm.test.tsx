import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Appointment } from '@/types'
import { toDatetimeLocalValue } from '@/utils/date'
import { AppointmentRescheduleForm } from '../AppointmentRescheduleForm'

const futureAppointment: Appointment = {
  id: 'appt_test',
  type: 'nurse_check_in',
  status: 'upcoming',
  scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  durationMinutes: 20,
  provider: { name: 'Priya Nandakumar, RN', specialty: 'Care Coordination' },
  location: { kind: 'telehealth', name: 'Meridian Care video visit', address: null },
  notes: null,
}

describe('AppointmentRescheduleForm', () => {
  it('rejects a date in the past', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AppointmentRescheduleForm
        appointment={futureAppointment}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    )

    fireEvent.change(screen.getByLabelText(/new date and time/i), {
      target: { value: '2000-01-01T10:00' },
    })
    await user.click(screen.getByRole('button', { name: /confirm new time/i }))

    expect(await screen.findByText(/pick a time in the future/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the new date and optional reason once the form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <AppointmentRescheduleForm
        appointment={futureAppointment}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    )

    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    const valueString = toDatetimeLocalValue(futureDate)

    fireEvent.change(screen.getByLabelText(/new date and time/i), {
      target: { value: valueString },
    })
    await user.type(screen.getByLabelText(/reason/i), 'Schedule conflict')
    await user.click(screen.getByRole('button', { name: /confirm new time/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const [payload] = onSubmit.mock.calls[0] as [{ scheduledAt: string; reason?: string }]
    expect(payload.reason).toBe('Schedule conflict')
    expect(toDatetimeLocalValue(new Date(payload.scheduledAt))).toBe(valueString)
  })

  it('calls onCancel without submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(
      <AppointmentRescheduleForm
        appointment={futureAppointment}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
