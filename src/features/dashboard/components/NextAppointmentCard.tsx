import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, MapPin, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { AsyncSection } from '@/components/AsyncSection'
import { useAppointments } from '@/features/appointments/api'
import { APPOINTMENT_TYPE_LABELS } from '@/features/appointments/constants'
import { formatFriendlyDate } from '@/utils/date'

export function NextAppointmentCard() {
  const query = useAppointments({ status: 'upcoming' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <AsyncSection
          query={query}
          errorTitle="Couldn't load your appointments"
          skeleton={
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          }
        >
          {(appointments) => {
            const next = appointments[0]
            if (!next) {
              return (
                <EmptyState
                  icon={CalendarCheck}
                  title="No upcoming appointments"
                  description="When something is scheduled, it will show up here."
                />
              )
            }
            return (
              <div className="space-y-3">
                <p className="font-medium text-ink-950">
                  {APPOINTMENT_TYPE_LABELS[next.type]}
                </p>
                <p className="text-sm text-ink-700">
                  {formatFriendlyDate(next.scheduledAt)}
                </p>
                <p className="text-sm text-ink-500">
                  {next.provider.name} · {next.provider.specialty}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-ink-500">
                  {next.location.kind === 'telehealth' ? (
                    <Video className="size-4" aria-hidden="true" />
                  ) : (
                    <MapPin className="size-4" aria-hidden="true" />
                  )}
                  {next.location.name}
                </div>
                <Link
                  to="/appointments"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View all appointments
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            )
          }}
        </AsyncSection>
      </CardContent>
    </Card>
  )
}
