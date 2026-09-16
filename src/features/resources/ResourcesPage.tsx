import { useDeferredValue, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { AsyncSection } from '@/components/AsyncSection'
import { Input } from '@/components/form/Input'
import { Select } from '@/components/form/Select'
import type { ResourceCategory } from '@/types'
import { useResources } from './api'
import { ResourceCard } from './ResourceCard'
import { RESOURCE_CATEGORY_FILTERS } from './constants'

type CategoryFilterValue = ResourceCategory | 'all'

export function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = (searchParams.get('category') as CategoryFilterValue | null) ?? 'all'
  const [searchInput, setSearchInput] = useState('')
  // Keep the text field responsive to every keystroke, but let the
  // (simulated, latent) search request lag a beat behind fast typing
  // instead of firing — and re-rendering the whole list — on every key.
  const deferredSearch = useDeferredValue(searchInput)
  const searchId = useId()

  const query = useResources({ search: deferredSearch, category })

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">
          Educational resources
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Articles to help you understand your treatment and day-to-day life with your
          condition.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300"
            aria-hidden="true"
          />
          <label htmlFor={searchId} className="sr-only">
            Search resources
          </label>
          <Input
            id={searchId}
            type="search"
            placeholder="Search resources…"
            className="pl-9"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <label className="sr-only" htmlFor="resource-category">
          Filter by category
        </label>
        <Select
          id="resource-category"
          className="sm:w-56"
          value={category}
          onChange={(event) => {
            const next = event.target.value
            setSearchParams(next === 'all' ? {} : { category: next }, { replace: true })
          }}
        >
          {RESOURCE_CATEGORY_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
      </div>

      <AsyncSection
        query={query}
        errorTitle="Couldn't load resources"
        skeleton={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        {(resources) => {
          if (resources.length === 0) {
            return (
              <EmptyState
                icon={SearchIcon}
                title="No resources match"
                description="Try a different search term or category."
              />
            )
          }
          return (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>
          )
        }}
      </AsyncSection>
    </div>
  )
}
