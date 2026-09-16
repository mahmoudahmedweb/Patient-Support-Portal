import type { Notification } from '@/types'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { formatRelativeToNow } from '@/utils/date'
import { NOTIFICATION_CATEGORY_ICONS, NOTIFICATION_CATEGORY_LABELS } from './constants'

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  isMarking: boolean
}

export function NotificationItem({
  notification,
  onMarkRead,
  isMarking,
}: NotificationItemProps) {
  const Icon = NOTIFICATION_CATEGORY_ICONS[notification.category]

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        notification.read
          ? 'border-border bg-white'
          : 'border-brand-400/40 bg-brand-50/40',
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-500">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-ink-950">{notification.title}</p>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-500">
            {NOTIFICATION_CATEGORY_LABELS[notification.category]}
          </span>
          {!notification.read && (
            <span className="flex items-center gap-1 text-xs font-medium text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              Unread
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-ink-700">{notification.message}</p>
        <p className="mt-1 text-xs text-ink-500">
          {formatRelativeToNow(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead(notification.id)}
          isLoading={isMarking}
        >
          Mark as read
        </Button>
      )}
    </li>
  )
}
