import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Clock, MapPin, User, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { StatusPill } from '@/components/StatusPill'
import { Button } from '@/components/Button'
import { AsyncSection } from '@/components/AsyncSection'
import { LiveRegion } from '@/components/LiveRegion'
import { ApiError } from '@/services'
import type { RescheduleAppointmentInput } from '@/types'
import { formatDateTime } from '@/utils/date'
import { useAppointment, useCancelAppointment, useRescheduleAppointment } from './api'
import { AppointmentRescheduleForm } from './AppointmentRescheduleForm'
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_TONE,
  APPOINTMENT_TYPE_LABELS,
} from './constants'

export function AppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const query = useAppointment(appointmentId)
  const cancelMutation = useCancelAppointment()
  const rescheduleMutation = useRescheduleAppointment()

  const [isRescheduling, setIsRescheduling] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleCancel = async () => {
    if (!appointmentId) return
    try {
      await cancelMutation.mutateAsync(appointmentId)
      setStatusMessage('Appointment cancelled.')
      setConfirmingCancel(false)
    } catch {
      // Error is surfaced inline below via cancelMutation.isError.
    }
  }

  const handleReschedule = async (input: RescheduleAppointmentInput) => {
    if (!appointmentId) return
    await rescheduleMutation.mutateAsync({ id: appointmentId, input })
    setStatusMessage('Appointment rescheduled.')
    setIsRescheduling(false)
  }

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <LiveRegion message={statusMessage} />
      <Link
        to="/appointments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to appointments
      </Link>

      <AsyncSection
        query={query}
        errorTitle="Couldn't load this appointment"
        errorDescription="It may have been removed, or the demo network hiccupped. Try again."
        skeleton={
          <Card>
            <CardContent className="space-y-3 py-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        }
      >
        {(appointment) => (
          <Card>
            <CardHeader>
              <CardTitle>{APPOINTMENT_TYPE_LABELS[appointment.type]}</CardTitle>
              <StatusPill tone={APPOINTMENT_STATUS_TONE[appointment.status]}>
                {APPOINTMENT_STATUS_LABELS[appointment.status]}
              </StatusPill>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <CalendarClock
                    className="mt-0.5 size-4 shrink-0 text-ink-500"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-ink-500">Date &amp; time</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {formatDateTime(appointment.scheduledAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock
                    className="mt-0.5 size-4 shrink-0 text-ink-500"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-ink-500">Duration</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {appointment.durationMinutes} minutes
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <User
                    className="mt-0.5 size-4 shrink-0 text-ink-500"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-ink-500">Provider</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {appointment.provider.name} · {appointment.provider.specialty}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  {appointment.location.kind === 'telehealth' ? (
                    <Video
                      className="mt-0.5 size-4 shrink-0 text-ink-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-ink-500"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <dt className="text-xs text-ink-500">Location</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {appointment.location.name}
                      {appointment.location.address && (
                        <span className="block font-normal text-ink-500">
                          {appointment.location.address}
                        </span>
                      )}
                    </dd>
                  </div>
                </div>
              </dl>

              {appointment.notes && (
                <div className="rounded-lg bg-surface-subtle p-3 text-sm text-ink-700">
                  {appointment.notes}
                </div>
              )}

              {appointment.status === 'upcoming' && (
                <div className="space-y-3 border-t border-border pt-4">
                  {!isRescheduling ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsRescheduling(true)
                          setConfirmingCancel(false)
                        }}
                      >
                        Reschedule
                      </Button>
                      {!confirmingCancel ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmingCancel(true)}
                        >
                          Cancel appointment
                        </Button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-danger-600/30 bg-danger-50 px-3 py-2">
                          <p className="text-sm text-danger-700">
                            Cancel this appointment?
                          </p>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={handleCancel}
                            isLoading={cancelMutation.isPending}
                          >
                            Yes, cancel
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmingCancel(false)}
                            disabled={cancelMutation.isPending}
                          >
                            Keep appointment
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <AppointmentRescheduleForm
                      appointment={appointment}
                      onSubmit={handleReschedule}
                      onCancel={() => setIsRescheduling(false)}
                      isSubmitting={rescheduleMutation.isPending}
                    />
                  )}

                  {cancelMutation.isError && (
                    <p role="alert" className="text-sm font-medium text-danger-600">
                      {cancelMutation.error instanceof ApiError
                        ? cancelMutation.error.message
                        : 'Something went wrong. Please try again.'}
                    </p>
                  )}
                  {rescheduleMutation.isError && (
                    <p role="alert" className="text-sm font-medium text-danger-600">
                      {rescheduleMutation.error instanceof ApiError
                        ? rescheduleMutation.error.message
                        : 'Something went wrong. Please try again.'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </AsyncSection>
    </div>
  )
}
