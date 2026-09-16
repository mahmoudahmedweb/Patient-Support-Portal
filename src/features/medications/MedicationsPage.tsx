import { Info, Syringe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { EmptyState } from '@/components/EmptyState'
import { formatDate, formatFriendlyDate } from '@/utils/date'
import { useCurrentMedication, useMedicationHistory } from './api'
import { AdherenceGrid } from './AdherenceGrid'
import { MedicationHistoryTable } from './MedicationHistoryTable'

export function MedicationsPage() {
  const medicationQuery = useCurrentMedication()
  const historyQuery = useMedicationHistory()

  return (
    <div className="max-w-3xl space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">Medications</h1>
        <p className="mt-1 text-sm text-ink-500">
          Your current treatment schedule, dose history, and past medications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current medication</CardTitle>
        </CardHeader>
        <CardContent>
          <AsyncSection
            query={medicationQuery}
            errorTitle="Couldn't load your medication"
            skeleton={
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            }
          >
            {(medication) => (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Syringe className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium text-ink-950">
                      {medication.name} · {medication.dosage}
                    </p>
                    <p className="text-sm text-ink-500">
                      {medication.form} · {medication.routeOfAdministration}
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-ink-500">Schedule</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {medication.frequencyLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500">Next dose</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {formatFriendlyDate(medication.nextDoseAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500">Started</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {formatDate(medication.startDate)}
                    </dd>
                  </div>
                </dl>

                <div className="flex items-start gap-2.5 rounded-lg border border-info-600/20 bg-info-50 p-3 text-sm text-info-700">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Storage &amp; handling</p>
                    <p className="mt-0.5 text-info-700/90">{medication.instructions}</p>
                    <p className="mt-1 text-xs text-info-700/70">
                      General handling information only — not medical advice. Follow your
                      prescriber's specific instructions.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-ink-950">Adherence</h3>
                  <div className="mt-2">
                    <AdherenceGrid adherence={medication.adherence} />
                  </div>
                </div>
              </div>
            )}
          </AsyncSection>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treatment history</CardTitle>
        </CardHeader>
        <CardContent>
          <AsyncSection
            query={historyQuery}
            errorTitle="Couldn't load your treatment history"
            skeleton={<Skeleton className="h-32 w-full" />}
          >
            {(history) =>
              history.length === 0 ? (
                <EmptyState
                  icon={Syringe}
                  title="No past medications"
                  description="Solvitra is the first treatment on record for this account."
                />
              ) : (
                <MedicationHistoryTable history={history} />
              )
            }
          </AsyncSection>
        </CardContent>
      </Card>
    </div>
  )
}
