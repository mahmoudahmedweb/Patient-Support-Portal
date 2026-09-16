import { simulateRequest } from '@/services/api-client'
import { db } from '@/services/store'
import type { Patient } from '@/types'

export async function getPatient(): Promise<Patient> {
  return simulateRequest(() => db.patient)
}
