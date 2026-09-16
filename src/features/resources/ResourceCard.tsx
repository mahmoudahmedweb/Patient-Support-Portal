import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { EducationalResource } from '@/types'
import { StatusPill } from '@/components/StatusPill'
import { RESOURCE_CATEGORY_LABELS } from './constants'

export function ResourceCard({ resource }: { resource: EducationalResource }) {
  return (
    <Link
      to={`/resources/${resource.id}`}
      className="flex h-full flex-col gap-2.5 rounded-xl border border-border bg-white p-4 transition-colors hover:border-brand-400 hover:bg-brand-50/30"
    >
      <StatusPill tone="neutral" className="self-start">
        {RESOURCE_CATEGORY_LABELS[resource.category]}
      </StatusPill>
      <p className="font-medium text-ink-950">{resource.title}</p>
      <p className="line-clamp-2 text-sm text-ink-500">{resource.summary}</p>
      <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-ink-500">
        <Clock className="size-3" aria-hidden="true" />
        {resource.readTimeMinutes} min read
      </p>
    </Link>
  )
}
