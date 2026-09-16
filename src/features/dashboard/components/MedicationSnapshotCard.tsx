import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { useCurrentMedication } from '@/features/medications/api'
import { formatFriendlyDate } from '@/utils/date'

export function MedicationSnapshotCard() {
  const query = useCurrentMedication()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication</CardTitle>
      </CardHeader>
      <CardContent>
        <AsyncSection
          query={query}
          errorTitle="Couldn't load your medication"
          skeleton={
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          }
        >
          {(medication) => {
            const takenCount = medication.adherence.filter((entry) => entry.taken).length
            const adherenceRate = Math.round(
              (takenCount / medication.adherence.length) * 100,
            )
            return (
              <div className="space-y-3">
                <p className="font-medium text-ink-950">
                  {medication.name} · {medication.dosage}
                </p>
                <p className="text-sm text-ink-700">
                  Next dose {formatFriendlyDate(medication.nextDoseAt)}
                </p>
                <p className="text-sm text-ink-500">
                  {medication.frequencyLabel} · {adherenceRate}% adherence to date
                </p>
                <Link
                  to="/medications"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View medication details
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            )
          }}
        </AsyncSection>
      </CardContent>
    </Card>
  )
}
