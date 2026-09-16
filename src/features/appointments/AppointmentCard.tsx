import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Video } from 'lucide-react'
import type { Appointment } from '@/types'
import { StatusPill } from '@/components/StatusPill'
import { formatFriendlyDate } from '@/utils/date'
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_TONE,
  APPOINTMENT_TYPE_LABELS,
} from './constants'

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Link
      to={`/appointments/${appointment.id}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4 transition-colors hover:border-brand-400 hover:bg-brand-50/30"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-ink-950">
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </p>
          <StatusPill tone={APPOINTMENT_STATUS_TONE[appointment.status]}>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </StatusPill>
        </div>
        <p className="mt-1 text-sm text-ink-700">
          {formatFriendlyDate(appointment.scheduledAt)}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-500">
          {appointment.location.kind === 'telehealth' ? (
            <Video className="size-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {appointment.provider.name} · {appointment.location.name}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-ink-300" aria-hidden="true" />
    </Link>
  )
}
