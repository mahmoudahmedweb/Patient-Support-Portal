import { z } from 'zod'

export const treatmentStatusSchema = z.enum(['active', 'paused', 'completed'])
export type TreatmentStatus = z.infer<typeof treatmentStatusSchema>

export const treatmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  conditionLabel: z.string(),
  status: treatmentStatusSchema,
  startDate: z.iso.date(),
  prescribingProvider: z.string(),
  summary: z.string(),
})

export type Treatment = z.infer<typeof treatmentSchema>

export const journeyStageTypeSchema = z.enum([
  'diagnosis',
  'prescribed',
  'onboarding',
  'current',
  'follow_up',
  'long_term',
])
export type JourneyStageType = z.infer<typeof journeyStageTypeSchema>

export const journeyStageStatusSchema = z.enum(['completed', 'current', 'upcoming'])
export type JourneyStageStatus = z.infer<typeof journeyStageStatusSchema>

export const journeyStageSchema = z.object({
  id: z.string(),
  type: journeyStageTypeSchema,
  status: journeyStageStatusSchema,
  title: z.string(),
  description: z.string(),
  date: z.iso.date().nullable(),
})

export type JourneyStage = z.infer<typeof journeyStageSchema>
