import { Card, CardContent } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { useJourneyStages } from '@/features/treatments/api'
import { JourneyTimeline } from '@/features/treatments/JourneyTimeline'

export function TreatmentJourneyPage() {
  const query = useJourneyStages()

  return (
    <div className="max-w-3xl space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">
          Your treatment journey
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          A look at where you've been and what's ahead — from diagnosis through long-term
          management.
        </p>
      </div>

      <Card>
        <CardContent className="py-6">
          <AsyncSection
            query={query}
            errorTitle="Couldn't load your treatment journey"
            skeleton={
              <div className="space-y-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            {(stages) => <JourneyTimeline stages={stages} />}
          </AsyncSection>
        </CardContent>
      </Card>
    </div>
  )
}
