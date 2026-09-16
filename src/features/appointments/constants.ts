import type { AppointmentStatus, AppointmentType } from '@/types'
import type { StatusTone } from '@/components/StatusPill'

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  nurse_check_in: 'Nurse check-in',
  physician_visit: 'Physician visit',
  infusion: 'Infusion',
  lab_work: 'Lab work',
  onboarding_call: 'Onboarding call',
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const APPOINTMENT_STATUS_TONE: Record<AppointmentStatus, StatusTone> = {
  upcoming: 'info',
  completed: 'success',
  cancelled: 'danger',
}

export const APPOINTMENT_STATUS_FILTERS: {
  value: AppointmentStatus | 'all'
  label: string
}[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]
