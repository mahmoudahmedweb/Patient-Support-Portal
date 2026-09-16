import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

/**
 * Pairs a label, an optional hint, and a validation error with a form
 * control via matching ids — the pattern React Hook Form + Zod errors
 * plug into directly (see AppointmentRescheduleForm / PreferencesForm).
 */
export function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink-900">
        {label}
        {required && (
          <span className="ml-0.5 text-danger-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  )
}
