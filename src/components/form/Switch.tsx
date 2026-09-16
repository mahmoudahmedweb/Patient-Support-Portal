import { cn } from '@/lib/utils'

interface SwitchProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hideLabel?: boolean
  disabled?: boolean
}

/**
 * An accessible on/off control implemented as `role="switch"` on a real
 * `<button>` — keyboard-operable (Space/Enter) and announced by screen
 * readers as a switch with its current state, unlike a styled checkbox.
 */
export function Switch({
  id,
  checked,
  onChange,
  label,
  hideLabel,
  disabled,
}: SwitchProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5">
      {!hideLabel && <span className="text-sm text-ink-900">{label}</span>}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-brand-600' : 'bg-ink-500',
        )}
      >
        <span
          className={cn(
            'inline-block size-4.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </label>
  )
}
