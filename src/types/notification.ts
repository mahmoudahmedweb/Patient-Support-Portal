import { z } from 'zod'

export const notificationCategorySchema = z.enum([
  'appointment',
  'medication',
  'resource',
  'system',
])
export type NotificationCategory = z.infer<typeof notificationCategorySchema>

export const notificationSchema = z.object({
  id: z.string(),
  category: notificationCategorySchema,
  title: z.string(),
  message: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  read: z.boolean(),
})

export type Notification = z.infer<typeof notificationSchema>
