import { simulateRequest } from '@/services/api-client'
import { db } from '@/services/store'
import type { Notification } from '@/types'

export async function getNotifications(): Promise<Notification[]> {
  return simulateRequest(() =>
    [...db.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  )
}

export async function markNotificationRead(id: string): Promise<Notification[]> {
  return simulateRequest(() => {
    const notification = db.notifications.find((item) => item.id === id)
    if (notification) notification.read = true
    return [...db.notifications]
  })
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  return simulateRequest(() => {
    db.notifications.forEach((notification) => {
      notification.read = true
    })
    return [...db.notifications]
  })
}
