import { Loader2 } from 'lucide-react'

export function PageLoadingFallback() {
  return (
    <div role="status" className="flex min-h-[50svh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-brand-600" aria-hidden="true" />
      <span className="sr-only">Loading page…</span>
    </div>
  )
}
