import { Info } from 'lucide-react'

/** Shown anywhere educational content appears — never medical advice. */
export function EducationalDisclaimer() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-info-600/20 bg-info-50 p-3 text-sm text-info-700">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-medium">Educational content only.</span> This is general
        information, not medical advice — always follow guidance from your own care team.
      </p>
    </div>
  )
}
