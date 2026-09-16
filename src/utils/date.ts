import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'

/** "Sep 24, 2026" */
export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy')
}

/** "Sep 24, 2026 · 10:30 AM" */
export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy '·' h:mm a")
}

/** "10:30 AM" */
export function formatTime(iso: string): string {
  return format(new Date(iso), 'h:mm a')
}

/**
 * A friendly relative label for dates close to now, falling back to an
 * absolute date further out — the pattern most scheduling UIs use.
 */
export function formatFriendlyDate(iso: string): string {
  const date = new Date(iso)
  if (isToday(date)) return `Today · ${formatTime(iso)}`
  if (isTomorrow(date)) return `Tomorrow · ${formatTime(iso)}`
  return formatDateTime(iso)
}

export function formatRelativeToNow(iso: string): string {
  const date = new Date(iso)
  const suffix = isPast(date) ? 'ago' : 'from now'
  return `${formatDistanceToNow(date)} ${suffix}`
}

export function daysFromNow(now: Date, days: number): Date {
  const result = new Date(now)
  result.setDate(result.getDate() + days)
  return result
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Formats a Date as the local "YYYY-MM-DDTHH:mm" a `datetime-local` input expects. */
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
