import { ApiError, simulateRequest } from '@/services/api-client'
import { db } from '@/services/store'
import type { EducationalResource, ResourceCategory } from '@/types'

export interface ResourceQuery {
  search?: string
  category?: ResourceCategory | 'all'
}

export async function getResources(
  query: ResourceQuery = {},
): Promise<EducationalResource[]> {
  return simulateRequest(() => {
    const search = query.search?.trim().toLowerCase()
    return db.resources.filter((resource) => {
      const matchesCategory =
        !query.category ||
        query.category === 'all' ||
        resource.category === query.category
      const matchesSearch =
        !search ||
        resource.title.toLowerCase().includes(search) ||
        resource.summary.toLowerCase().includes(search) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(search))
      return matchesCategory && matchesSearch
    })
  })
}

export async function getResource(id: string): Promise<EducationalResource> {
  return simulateRequest(() => {
    const resource = db.resources.find((item) => item.id === id)
    if (!resource) {
      throw new ApiError(`No resource found with id "${id}".`, 404)
    }
    return resource
  })
}
