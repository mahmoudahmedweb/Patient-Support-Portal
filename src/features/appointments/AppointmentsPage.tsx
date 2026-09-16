import { useSearchParams } from 'react-router-dom'
import { CalendarX } from 'lucide-react'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { AsyncSection } from '@/components/AsyncSection'
import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'
import { useAppointments } from './api'
import { AppointmentCard } from './AppointmentCard'
import { APPOINTMENT_STATUS_FILTERS } from './constants'

type StatusFilterValue = AppointmentStatus | 'all'

export function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // The filter lives in the URL (not useState) so a link to
  // "/appointments?status=cancelled" is shareable and survives a refresh.
  const status = (searchParams.get('status') as StatusFilterValue | null) ?? 'all'
  const query = useAppointments({ status })

  const setStatus = (next: StatusFilterValue) => {
    setSearchParams(next === 'all' ? {} : { status: next }, { replace: true })
  }

  return (
    <div className="max-w-3xl space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">Appointments</h1>
        <p className="mt-1 text-sm text-ink-500">
          Review upcoming visits, past appointments, and anything that's been cancelled.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Filter appointments by status"
        className="flex flex-wrap gap-2"
      >
        {APPOINTMENT_STATUS_FILTERS.map((filter) => {
          const isActive = status === filter.value
          return (
            <button
              key={filter.value}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'border border-border bg-white text-ink-700 hover:bg-surface-muted',
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <AsyncSection
        query={query}
        errorTitle="Couldn't load your appointments"
        skeleton={
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        {(appointments) => {
          if (appointments.length === 0) {
            return (
              <EmptyState
                icon={CalendarX}
                title="No appointments here"
                description="Nothing matches this filter yet."
              />
            )
          }
          return (
            <ul className="space-y-3">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <AppointmentCard appointment={appointment} />
                </li>
              ))}
            </ul>
          )
        }}
      </AsyncSection>
    </div>
  )
}
