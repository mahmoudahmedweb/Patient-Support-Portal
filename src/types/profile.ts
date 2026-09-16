import { z } from 'zod'

export const notificationChannelPrefsSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
})

export const profileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string(),
  preferredLanguage: z.enum(['en', 'es', 'fr']),
  timezone: z.string(),
  notificationPreferences: z.object({
    appointmentReminders: notificationChannelPrefsSchema,
    medicationReminders: notificationChannelPrefsSchema,
    educationalContent: notificationChannelPrefsSchema,
  }),
})

export type Profile = z.infer<typeof profileSchema>

/** Editable subset used by the preferences form. */
export const updateProfileSchema = profileSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  preferredLanguage: true,
  timezone: true,
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updateNotificationPreferencesSchema =
  profileSchema.shape.notificationPreferences

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>
