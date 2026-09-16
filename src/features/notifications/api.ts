import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import type { Notification } from '@/types'

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: notificationService.getNotifications,
  })
}

/**
 * Reuses the same query (and its cache entry) as useNotifications, but
 * projects it down to a single number with `select`. Any component that
 * only needs the unread count re-renders solely when that count changes
 * — not on every notification-list update.
 */
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: notificationService.getNotifications,
    select: (notifications: Notification[]) =>
      notifications.filter((notification) => !notification.read).length,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationService.markNotificationRead(id),
    onSuccess: (notifications) => {
      queryClient.setQueryData(queryKeys.notifications.all, notifications)
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllNotificationsRead(),
    onSuccess: (notifications) => {
      queryClient.setQueryData(queryKeys.notifications.all, notifications)
    },
  })
}
