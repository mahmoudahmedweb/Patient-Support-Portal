import type { MedicationHistoryEntry } from '@/types'
import { StatusPill } from '@/components/StatusPill'
import { formatDate } from '@/utils/date'

const OUTCOME_LABEL: Record<MedicationHistoryEntry['outcome'], string> = {
  switched: 'Switched',
  completed: 'Completed',
  discontinued: 'Discontinued',
}

const OUTCOME_TONE: Record<
  MedicationHistoryEntry['outcome'],
  'info' | 'success' | 'neutral'
> = {
  switched: 'info',
  completed: 'success',
  discontinued: 'neutral',
}

export function MedicationHistoryTable({
  history,
}: {
  history: MedicationHistoryEntry[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] text-left text-sm">
        <caption className="sr-only">Past medications</caption>
        <thead className="bg-surface-subtle text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Medication
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Dosage
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Duration
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Outcome
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {history.map((entry) => (
            <tr key={entry.id}>
              <th scope="row" className="px-4 py-3 font-medium text-ink-900">
                {entry.name}
                <span className="mt-0.5 block text-xs font-normal text-ink-500">
                  {entry.note}
                </span>
              </th>
              <td className="px-4 py-3 text-ink-700">{entry.dosage}</td>
              <td className="px-4 py-3 text-ink-700">
                {formatDate(entry.startDate)} –{' '}
                {entry.endDate ? formatDate(entry.endDate) : 'Present'}
              </td>
              <td className="px-4 py-3">
                <StatusPill tone={OUTCOME_TONE[entry.outcome]}>
                  {OUTCOME_LABEL[entry.outcome]}
                </StatusPill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
