import { z } from 'zod'

export const adherenceEntrySchema = z.object({
  date: z.iso.date(),
  taken: z.boolean(),
})
export type AdherenceEntry = z.infer<typeof adherenceEntrySchema>

export const medicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  form: z.string(),
  dosage: z.string(),
  frequencyLabel: z.string(),
  routeOfAdministration: z.string(),
  startDate: z.iso.date(),
  nextDoseAt: z.iso.datetime({ offset: true }),
  instructions: z.string(),
  adherence: z.array(adherenceEntrySchema),
})

export type Medication = z.infer<typeof medicationSchema>

export const medicationHistoryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  dosage: z.string(),
  startDate: z.iso.date(),
  endDate: z.iso.date().nullable(),
  outcome: z.enum(['switched', 'completed', 'discontinued']),
  note: z.string(),
})

export type MedicationHistoryEntry = z.infer<typeof medicationHistoryEntrySchema>
