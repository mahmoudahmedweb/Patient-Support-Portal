import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { useResources } from '@/features/resources/api'

export function RecommendedResourcesCard() {
  const query = useResources({ category: 'treatment_basics' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for you</CardTitle>
      </CardHeader>
      <CardContent>
        <AsyncSection
          query={query}
          errorTitle="Couldn't load resources"
          skeleton={
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          }
        >
          {(resources) => (
            <ul className="space-y-3">
              {resources.slice(0, 3).map((resource) => (
                <li key={resource.id}>
                  <Link
                    to={`/resources/${resource.id}`}
                    className="block rounded-lg border border-border p-3 hover:border-brand-400 hover:bg-brand-50/40"
                  >
                    <p className="text-sm font-medium text-ink-900">{resource.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">
                      {resource.summary}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-500">
                      <Clock className="size-3" aria-hidden="true" />
                      {resource.readTimeMinutes} min read
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AsyncSection>
        <Link
          to="/resources"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Browse all resources
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  )
}
