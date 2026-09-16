import { Link } from 'react-router-dom'
import { ArrowRight, BellOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { AsyncSection } from '@/components/AsyncSection'
import { useNotifications } from '@/features/notifications/api'
import { NOTIFICATION_CATEGORY_ICONS } from '@/features/notifications/constants'
import { formatRelativeToNow } from '@/utils/date'

export function NotificationsPreviewCard() {
  const query = useNotifications()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <AsyncSection
          query={query}
          errorTitle="Couldn't load notifications"
          skeleton={
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          }
        >
          {(notifications) => {
            if (notifications.length === 0) {
              return (
                <EmptyState
                  icon={BellOff}
                  title="You're all caught up"
                  description="New updates about your care will show up here."
                />
              )
            }
            return (
              <ul className="space-y-3">
                {notifications.slice(0, 3).map((notification) => {
                  const Icon = NOTIFICATION_CATEGORY_ICONS[notification.category]
                  return (
                    <li key={notification.id} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-500">
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">
                          {notification.title}
                          {!notification.read && (
                            <span
                              className="ml-1.5 inline-block size-1.5 rounded-full bg-brand-600 align-middle"
                              aria-hidden="true"
                            />
                          )}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatRelativeToNow(notification.createdAt)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )
          }}
        </AsyncSection>
        <Link
          to="/notifications"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all notifications
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  )
}
