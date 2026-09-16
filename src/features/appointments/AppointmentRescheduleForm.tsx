import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Appointment, RescheduleAppointmentInput } from '@/types'
import { rescheduleAppointmentSchema } from '@/types'
import { Field } from '@/components/form/Field'
import { Input } from '@/components/form/Input'
import { Textarea } from '@/components/form/Textarea'
import { Button } from '@/components/Button'
import { toDatetimeLocalValue } from '@/utils/date'

interface AppointmentRescheduleFormProps {
  appointment: Appointment
  onSubmit: (input: RescheduleAppointmentInput) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function AppointmentRescheduleForm({
  appointment,
  onSubmit,
  onCancel,
  isSubmitting,
}: AppointmentRescheduleFormProps) {
  const minValue = toDatetimeLocalValue(new Date())
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RescheduleAppointmentInput>({
    resolver: zodResolver(rescheduleAppointmentSchema),
    defaultValues: {
      scheduledAt: toDatetimeLocalValue(new Date(appointment.scheduledAt)),
      reason: '',
    },
  })

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-surface-subtle p-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Reschedule appointment"
    >
      <Field
        id="scheduledAt"
        label="New date and time"
        error={errors.scheduledAt?.message}
        required
      >
        <Input
          id="scheduledAt"
          type="datetime-local"
          min={minValue}
          aria-invalid={!!errors.scheduledAt}
          {...register('scheduledAt')}
        />
      </Field>

      <Field
        id="reason"
        label="Reason (optional)"
        hint="Shared with your care team, not required."
        error={errors.reason?.message}
      >
        <Textarea
          id="reason"
          rows={3}
          placeholder="e.g. Schedule conflict, feeling unwell, prefer a different time"
          {...register('reason')}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Confirm new time
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
