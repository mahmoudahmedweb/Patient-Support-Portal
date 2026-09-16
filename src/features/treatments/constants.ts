import type { JourneyStageStatus, JourneyStageType } from '@/types'
import type { StatusTone } from '@/components/StatusPill'

export const JOURNEY_STAGE_LABELS: Record<JourneyStageType, string> = {
  diagnosis: 'Diagnosis',
  prescribed: 'Treatment prescribed',
  onboarding: 'Treatment onboarding',
  current: 'Current treatment',
  follow_up: 'Follow-up',
  long_term: 'Long-term management',
}

export const JOURNEY_STATUS_LABELS: Record<JourneyStageStatus, string> = {
  completed: 'Completed',
  current: 'In progress',
  upcoming: 'Upcoming',
}

export const JOURNEY_STATUS_TONE: Record<JourneyStageStatus, StatusTone> = {
  completed: 'success',
  current: 'accent',
  upcoming: 'neutral',
}
