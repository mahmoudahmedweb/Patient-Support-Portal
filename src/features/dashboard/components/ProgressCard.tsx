import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { useJourneyStages } from '@/features/treatments/api'
import { JOURNEY_STAGE_LABELS } from '@/features/treatments/constants'

export function ProgressCard() {
  const query = useJourneyStages()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment progress</CardTitle>
      </CardHeader>
      <CardContent>
        <AsyncSection
          query={query}
          errorTitle="Couldn't load your progress"
          skeleton={
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          }
        >
          {(stages) => {
            const completed = stages.filter(
              (stage) => stage.status === 'completed',
            ).length
            const current = stages.find((stage) => stage.status === 'current')
            const percent = Math.round((completed / stages.length) * 100)

            return (
              <div className="space-y-3">
                <div
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Treatment journey progress"
                  className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className="h-full rounded-full bg-brand-600 transition-[width]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-sm text-ink-700">
                  <span className="font-medium text-ink-950">{percent}%</span> of your
                  journey complete
                </p>
                {current && (
                  <p className="text-sm text-ink-500">
                    Currently: {JOURNEY_STAGE_LABELS[current.type]}
                  </p>
                )}
              </div>
            )
          }}
        </AsyncSection>
      </CardContent>
    </Card>
  )
}
