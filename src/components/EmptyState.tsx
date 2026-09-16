import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-surface-muted text-ink-500">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-ink-900">{title}</p>
        {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
