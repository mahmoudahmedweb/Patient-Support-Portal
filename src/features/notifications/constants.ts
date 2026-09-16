import { Bell, CalendarClock, Pill, Sparkles } from 'lucide-react'
import type { NotificationCategory } from '@/types'

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  appointment: 'Appointment',
  medication: 'Medication',
  resource: 'Resource',
  system: 'System',
}

export const NOTIFICATION_CATEGORY_ICONS: Record<NotificationCategory, typeof Bell> = {
  appointment: CalendarClock,
  medication: Pill,
  resource: Sparkles,
  system: Bell,
}
