import { Check, X } from 'lucide-react'
import type { AdherenceEntry } from '@/types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/date'

interface AdherenceGridProps {
  adherence: AdherenceEntry[]
}

/**
 * A compact dose-history grid. Status is never color-alone: each square
 * has screen-reader text, and the legend pairs color with an icon and a
 * label rather than relying on hue to carry meaning.
 */
export function AdherenceGrid({ adherence }: AdherenceGridProps) {
  const takenCount = adherence.filter((entry) => entry.taken).length
  const rate = Math.round((takenCount / adherence.length) * 100)

  return (
    <div>
      <p className="text-sm text-ink-700">
        <span className="font-medium text-ink-950">
          {takenCount} of {adherence.length} doses taken
        </span>{' '}
        ({rate}%) since you started treatment.
      </p>

      <ul
        aria-label="Dose adherence history, oldest to most recent"
        className="mt-3 flex flex-wrap gap-1.5"
      >
        {adherence.map((entry) => (
          <li key={entry.date}>
            <span
              className={cn(
                'block size-4 rounded-sm',
                entry.taken ? 'bg-success-600' : 'bg-warning-600',
              )}
              aria-hidden="true"
              title={`${formatDate(entry.date)}: ${entry.taken ? 'Dose taken' : 'Dose missed'}`}
            />
            <span className="sr-only">
              {formatDate(entry.date)}: {entry.taken ? 'Dose taken' : 'Dose missed'}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="flex size-3.5 items-center justify-center rounded-sm bg-success-600 text-white">
            <Check className="size-2.5" aria-hidden="true" />
          </span>
          Taken
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex size-3.5 items-center justify-center rounded-sm bg-warning-600 text-white">
            <X className="size-2.5" aria-hidden="true" />
          </span>
          Missed
        </span>
      </div>
    </div>
  )
}
