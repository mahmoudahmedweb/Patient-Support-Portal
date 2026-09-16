import { z } from 'zod'

export const appointmentStatusSchema = z.enum(['upcoming', 'completed', 'cancelled'])
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>

export const appointmentTypeSchema = z.enum([
  'nurse_check_in',
  'physician_visit',
  'infusion',
  'lab_work',
  'onboarding_call',
])
export type AppointmentType = z.infer<typeof appointmentTypeSchema>

export const appointmentLocationSchema = z.object({
  kind: z.enum(['in_person', 'telehealth']),
  name: z.string(),
  address: z.string().nullable(),
})

export const appointmentProviderSchema = z.object({
  name: z.string(),
  specialty: z.string(),
})

export const appointmentSchema = z.object({
  id: z.string(),
  type: appointmentTypeSchema,
  status: appointmentStatusSchema,
  scheduledAt: z.iso.datetime({ offset: true }),
  durationMinutes: z.number().int().positive(),
  provider: appointmentProviderSchema,
  location: appointmentLocationSchema,
  notes: z.string().nullable(),
})

export type Appointment = z.infer<typeof appointmentSchema>

/** Payload for the demo reschedule form. */
export const rescheduleAppointmentSchema = z.object({
  scheduledAt: z
    .string()
    .min(1, 'Choose a new date and time.')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'Enter a valid date and time.',
    })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: 'Pick a time in the future.',
    }),
  reason: z
    .string()
    .max(240, 'Keep the reason under 240 characters.')
    .optional()
    .or(z.literal('')),
})

export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>
