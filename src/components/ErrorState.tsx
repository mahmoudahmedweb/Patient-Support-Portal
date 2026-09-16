import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

/**
 * A consistent, accessible error affordance. `role="alert"` means screen
 * readers announce it the moment it mounts, without the page needing
 * focus to move there.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-danger-600/20 bg-danger-50 px-6 py-10 text-center',
        className,
      )}
    >
      <AlertTriangle className="size-6 text-danger-600" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium text-danger-700">{title}</p>
        <p className="max-w-sm text-sm text-danger-700/80">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
