import type { AppointmentFilter } from '@/services/appointment.service'
import type { ResourceQuery } from '@/services/resource.service'

/**
 * Central query-key factory. Every hook builds its key from here instead
 * of hand-writing arrays, so invalidation (e.g. after cancelling an
 * appointment) can target the right cache entries without typo-prone
 * string matching scattered across features.
 */
export const queryKeys = {
  patient: ['patient'] as const,
  treatment: {
    current: ['treatment', 'current'] as const,
    journey: ['treatment', 'journey'] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    list: (filter?: AppointmentFilter) => ['appointments', 'list', filter ?? {}] as const,
    detail: (id: string) => ['appointments', 'detail', id] as const,
  },
  medication: {
    current: ['medication', 'current'] as const,
    history: ['medication', 'history'] as const,
  },
  resources: {
    list: (query?: ResourceQuery) => ['resources', 'list', query ?? {}] as const,
    detail: (id: string) => ['resources', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  profile: ['profile'] as const,
}
