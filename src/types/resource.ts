import { z } from 'zod'

export const resourceCategorySchema = z.enum([
  'treatment_basics',
  'living_with_a_condition',
  'appointments',
  'nutrition_and_lifestyle',
  'support_and_community',
])
export type ResourceCategory = z.infer<typeof resourceCategorySchema>

export const educationalResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: resourceCategorySchema,
  summary: z.string(),
  body: z.array(z.string()),
  tags: z.array(z.string()),
  readTimeMinutes: z.number().int().positive(),
  publishedAt: z.iso.date(),
})

export type EducationalResource = z.infer<typeof educationalResourceSchema>
