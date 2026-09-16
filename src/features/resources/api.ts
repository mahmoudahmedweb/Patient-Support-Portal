import { useQuery } from '@tanstack/react-query'
import { resourceService } from '@/services'
import type { ResourceQuery } from '@/services/resource.service'
import { queryKeys } from '@/lib/query-keys'

export function useResources(query: ResourceQuery = {}) {
  return useQuery({
    queryKey: queryKeys.resources.list(query),
    queryFn: () => resourceService.getResources(query),
    placeholderData: (previousData) => previousData,
  })
}

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resources.detail(id ?? ''),
    queryFn: () => resourceService.getResource(id as string),
    enabled: Boolean(id),
  })
}
