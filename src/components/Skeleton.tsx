import { cn } from '@/lib/utils'

/**
 * A loading placeholder. `motion-safe:animate-pulse` means the shimmer is
 * skipped entirely for users who have reduced motion turned on, rather
 * than just running faster.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('motion-safe:animate-pulse rounded-md bg-surface-muted', className)}
      aria-hidden="true"
    />
  )
}
