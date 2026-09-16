import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full rounded-lg border border-border-strong bg-white px-3 py-2 text-sm text-ink-900',
        'placeholder:text-ink-300 focus-visible:outline-2 focus-visible:outline-brand-600',
        'aria-[invalid=true]:border-danger-600',
        className,
      )}
      {...props}
    />
  )
})
