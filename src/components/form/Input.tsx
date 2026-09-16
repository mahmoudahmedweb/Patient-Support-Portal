import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border border-border-strong bg-white px-3 text-sm text-ink-900',
          'placeholder:text-ink-300 focus-visible:outline-2 focus-visible:outline-brand-600',
          'aria-[invalid=true]:border-danger-600',
          className,
        )}
        {...props}
      />
    )
  },
)
