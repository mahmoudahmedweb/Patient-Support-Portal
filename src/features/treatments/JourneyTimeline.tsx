import { Check } from 'lucide-react'
import type { JourneyStage } from '@/types'
import { StatusPill } from '@/components/StatusPill'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/date'
import {
  JOURNEY_STAGE_LABELS,
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_TONE,
} from './constants'

const MARKER_CLASSES: Record<JourneyStage['status'], string> = {
  completed: 'bg-brand-600 text-white',
  // The one place the reserved amber accent appears: the stage the
  // patient is in right now, so it reads unmistakably as "you are here."
  current: 'bg-accent-600 text-white ring-4 ring-accent-50',
  upcoming: 'bg-white text-ink-300 border-2 border-border-strong',
}

interface JourneyTimelineProps {
  stages: JourneyStage[]
}

export function JourneyTimeline({ stages }: JourneyTimelineProps) {
  return (
    <ol className="relative">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1
        return (
          <li key={stage.id} className="relative flex gap-4 pb-9 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-[15px] top-8 h-[calc(100%-0.5rem)] border-l-2',
                  stage.status === 'upcoming'
                    ? 'border-dashed border-border-strong'
                    : 'border-solid border-brand-600',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                MARKER_CLASSES[stage.status],
              )}
              aria-hidden="true"
            >
              {stage.status === 'completed' && <Check className="size-4" />}
              {stage.status === 'current' && (
                <span className="size-2.5 rounded-full bg-white" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink-950">{stage.title}</p>
                <StatusPill tone={JOURNEY_STATUS_TONE[stage.status]}>
                  {JOURNEY_STATUS_LABELS[stage.status]}
                </StatusPill>
              </div>
              <p className="text-xs uppercase tracking-wide text-ink-500">
                {JOURNEY_STAGE_LABELS[stage.type]}
              </p>
              {stage.date && (
                <p className="mt-1 text-sm text-ink-500">
                  {stage.status === 'upcoming' ? 'Expected' : ''} {formatDate(stage.date)}
                </p>
              )}
              <p className="mt-1.5 max-w-2xl text-sm text-ink-700">{stage.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
