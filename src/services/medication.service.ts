import { simulateRequest } from '@/services/api-client'
import { db } from '@/services/store'
import type { Medication, MedicationHistoryEntry } from '@/types'

export async function getCurrentMedication(): Promise<Medication> {
  return simulateRequest(() => db.medication)
}

export async function getMedicationHistory(): Promise<MedicationHistoryEntry[]> {
  return simulateRequest(() => db.medicationHistory)
}
