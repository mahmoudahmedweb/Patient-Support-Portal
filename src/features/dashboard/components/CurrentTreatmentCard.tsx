import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { StatusPill } from '@/components/StatusPill'
import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { useCurrentTreatment } from '@/features/treatments/api'
import { formatDate } from '@/utils/date'

const STATUS_TONE = {
  active: 'success',
  paused: 'warning',
  completed: 'neutral',
} as const

export function CurrentTreatmentCard() {
  const query = useCurrentTreatment()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current treatment</CardTitle>
      </CardHeader>
      <CardContent>
        <AsyncSection
          query={query}
          errorTitle="Couldn't load your treatment"
          skeleton={
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          }
        >
          {(treatment) => (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink-950">{treatment.name}</p>
                <StatusPill tone={STATUS_TONE[treatment.status]}>
                  {treatment.status === 'active' ? 'Active' : treatment.status}
                </StatusPill>
              </div>
              <p className="text-sm text-ink-500">{treatment.summary}</p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-ink-500">Prescribing provider</dt>
                  <dd className="font-medium text-ink-900">
                    {treatment.prescribingProvider}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">Started</dt>
                  <dd className="font-medium text-ink-900">
                    {formatDate(treatment.startDate)}
                  </dd>
                </div>
              </dl>
              <Link
                to="/treatment-journey"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View treatment journey
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </AsyncSection>
      </CardContent>
    </Card>
  )
}
