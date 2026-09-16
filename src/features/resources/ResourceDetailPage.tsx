import { ArrowLeft, Clock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { ResourceCategory } from '@/types'
import { Card, CardContent } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { StatusPill } from '@/components/StatusPill'
import { AsyncSection } from '@/components/AsyncSection'
import { EducationalDisclaimer } from '@/components/EducationalDisclaimer'
import { formatDate } from '@/utils/date'
import { useResource, useResources } from './api'
import { ResourceCard } from './ResourceCard'
import { RESOURCE_CATEGORY_LABELS } from './constants'

export function ResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>()
  const query = useResource(resourceId)

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <Link
        to="/resources"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to resources
      </Link>

      <AsyncSection
        query={query}
        errorTitle="Couldn't load this resource"
        skeleton={
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        }
      >
        {(resource) => (
          <article className="space-y-5">
            <header className="space-y-2">
              <StatusPill tone="neutral">
                {RESOURCE_CATEGORY_LABELS[resource.category]}
              </StatusPill>
              <h1 className="font-display text-2xl font-semibold text-ink-950 sm:text-3xl">
                {resource.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {resource.readTimeMinutes} min read
                </span>
                <span>Published {formatDate(resource.publishedAt)}</span>
              </div>
            </header>

            <EducationalDisclaimer />

            <div className="space-y-4 text-sm leading-relaxed text-ink-700">
              {resource.body.map((paragraph, index) => (
                // Static, ordered content generated once from fictional
                // seed data — index is a safe key here since paragraphs
                // never reorder or get inserted/removed independently.
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {resource.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Tags">
                {resource.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-500"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <RelatedResources currentId={resource.id} category={resource.category} />
          </article>
        )}
      </AsyncSection>
    </div>
  )
}

function RelatedResources({
  currentId,
  category,
}: {
  currentId: string
  category: ResourceCategory
}) {
  const query = useResources({ category })
  const related = (query.data ?? [])
    .filter((resource) => resource.id !== currentId)
    .slice(0, 2)

  if (related.length === 0) return null

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <h2 className="text-sm font-semibold text-ink-950">Related resources</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {related.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
