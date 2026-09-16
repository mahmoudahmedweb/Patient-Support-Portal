import type { ResourceCategory } from '@/types'

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  treatment_basics: 'Treatment Basics',
  living_with_a_condition: 'Living With a Condition',
  appointments: 'Appointments',
  nutrition_and_lifestyle: 'Nutrition & Lifestyle',
  support_and_community: 'Support & Community',
}

export const RESOURCE_CATEGORY_FILTERS: {
  value: ResourceCategory | 'all'
  label: string
}[] = [
  { value: 'all', label: 'All resources' },
  { value: 'treatment_basics', label: RESOURCE_CATEGORY_LABELS.treatment_basics },
  {
    value: 'living_with_a_condition',
    label: RESOURCE_CATEGORY_LABELS.living_with_a_condition,
  },
  { value: 'appointments', label: RESOURCE_CATEGORY_LABELS.appointments },
  {
    value: 'nutrition_and_lifestyle',
    label: RESOURCE_CATEGORY_LABELS.nutrition_and_lifestyle,
  },
  {
    value: 'support_and_community',
    label: RESOURCE_CATEGORY_LABELS.support_and_community,
  },
]
