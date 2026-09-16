import { simulateRequest } from '@/services/api-client'
import { db } from '@/services/store'
import type { JourneyStage, Treatment } from '@/types'

export async function getCurrentTreatment(): Promise<Treatment> {
  return simulateRequest(() => db.treatment)
}

export async function getJourneyStages(): Promise<JourneyStage[]> {
  return simulateRequest(() => db.journeyStages)
}
