import { ApiError, simulateRequest } from '@/services/api-client'
import { db } from '@/services/store'
import type { Appointment, AppointmentStatus, RescheduleAppointmentInput } from '@/types'

export interface AppointmentFilter {
  status?: AppointmentStatus | 'all'
}

export async function getAppointments(
  filter: AppointmentFilter = {},
): Promise<Appointment[]> {
  return simulateRequest(() => {
    const sorted = [...db.appointments].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    if (!filter.status || filter.status === 'all') return sorted
    return sorted.filter((appointment) => appointment.status === filter.status)
  })
}

export async function getAppointment(id: string): Promise<Appointment> {
  return simulateRequest(() => {
    const appointment = db.appointments.find((item) => item.id === id)
    if (!appointment) {
      throw new ApiError(`No appointment found with id "${id}".`, 404)
    }
    return appointment
  })
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  return simulateRequest(() => {
    const appointment = db.appointments.find((item) => item.id === id)
    if (!appointment) {
      throw new ApiError(`No appointment found with id "${id}".`, 404)
    }
    appointment.status = 'cancelled'
    return appointment
  })
}

export async function rescheduleAppointment(
  id: string,
  input: RescheduleAppointmentInput,
): Promise<Appointment> {
  return simulateRequest(() => {
    const appointment = db.appointments.find((item) => item.id === id)
    if (!appointment) {
      throw new ApiError(`No appointment found with id "${id}".`, 404)
    }
    appointment.scheduledAt = new Date(input.scheduledAt).toISOString()
    appointment.status = 'upcoming'
    appointment.notes = input.reason?.trim() ? input.reason.trim() : appointment.notes
    return appointment
  })
}
