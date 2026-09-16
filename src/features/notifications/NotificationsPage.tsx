import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BellOff, CheckCheck } from 'lucide-react'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { AsyncSection } from '@/components/AsyncSection'
import { Button } from '@/components/Button'
import { LiveRegion } from '@/components/LiveRegion'
import { cn } from '@/lib/utils'
import type { NotificationCategory } from '@/types'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from './api'
import { NotificationItem } from './NotificationItem'
import { NOTIFICATION_CATEGORY_LABELS } from './constants'

type CategoryFilterValue = NotificationCategory | 'all'

const FILTERS: { value: CategoryFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'appointment', label: NOTIFICATION_CATEGORY_LABELS.appointment },
  { value: 'medication', label: NOTIFICATION_CATEGORY_LABELS.medication },
  { value: 'resource', label: NOTIFICATION_CATEGORY_LABELS.resource },
  { value: 'system', label: NOTIFICATION_CATEGORY_LABELS.system },
]

export function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = (searchParams.get('category') as CategoryFilterValue | null) ?? 'all'
  const query = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllMutation = useMarkAllNotificationsRead()
  const [statusMessage, setStatusMessage] = useState('')

  const setCategory = (next: CategoryFilterValue) => {
    setSearchParams(next === 'all' ? {} : { category: next }, { replace: true })
  }

  const handleMarkRead = async (id: string) => {
    await markReadMutation.mutateAsync(id)
    setStatusMessage('Notification marked as read.')
  }

  const handleMarkAllRead = async () => {
    await markAllMutation.mutateAsync()
    setStatusMessage('All notifications marked as read.')
  }

  const hasUnread = query.data?.some((notification) => !notification.read) ?? false

  return (
    <div className="max-w-3xl space-y-6 pb-8">
      <LiveRegion message={statusMessage} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Updates about your appointments, medication, and care.
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            isLoading={markAllMutation.isPending}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all as read
          </Button>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Filter notifications by category"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((filter) => {
          const isActive = category === filter.value
          return (
            <button
              key={filter.value}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setCategory(filter.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'border border-border bg-white text-ink-700 hover:bg-surface-muted',
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <AsyncSection
        query={query}
        errorTitle="Couldn't load your notifications"
        skeleton={
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        {(notifications) => {
          const filtered =
            category === 'all'
              ? notifications
              : notifications.filter((notification) => notification.category === category)

          if (filtered.length === 0) {
            return (
              <EmptyState
                icon={BellOff}
                title="No notifications"
                description="Nothing here yet for this category."
              />
            )
          }
          return (
            <ul className="space-y-3">
              {filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  isMarking={
                    markReadMutation.isPending &&
                    markReadMutation.variables === notification.id
                  }
                />
              ))}
            </ul>
          )
        }}
      </AsyncSection>
    </div>
  )
}
