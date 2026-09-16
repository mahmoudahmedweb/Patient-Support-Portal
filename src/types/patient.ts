import { z } from 'zod'

/**
 * A patient's demographic + identity record.
 * All values in this app are fictional demo data — see src/services/seed.
 */
export const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  preferredLanguage: z.enum(['en', 'es', 'fr']),
  avatarInitials: z.string().max(2),
  memberSince: z.iso.date(),
  condition: z.string(),
})

export type Patient = z.infer<typeof patientSchema>
