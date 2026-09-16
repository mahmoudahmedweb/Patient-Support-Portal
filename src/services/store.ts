import { buildSeedData } from '@/services/seed/build-seed-data'
import {
  appointmentSchema,
  medicationSchema,
  notificationSchema,
  patientSchema,
  profileSchema,
  treatmentSchema,
} from '@/types'

/**
 * The in-memory "database" for the mock backend. It is seeded once per
 * page load and mutated by service functions (cancel an appointment, mark
 * a notification read, ...) so the app behaves like it's talking to a
 * real, stateful API — state simply doesn't persist across reloads. See
 * README.md > Limitations.
 */
const seed = buildSeedData()

if (import.meta.env.DEV) {
  // Fail loudly in development if the fictional seed data ever drifts
  // out of shape with the schemas that define the API contract.
  try {
    patientSchema.parse(seed.patient)
    treatmentSchema.parse(seed.treatment)
    appointmentSchema.parse(seed.appointments[0])
    medicationSchema.parse(seed.medication)
    notificationSchema.parse(seed.notifications[0])
    profileSchema.parse(seed.profile)
  } catch (error) {
    console.error('Seed data failed schema validation:', error)
  }
}

export const db = {
  patient: seed.patient,
  treatment: seed.treatment,
  journeyStages: seed.journeyStages,
  appointments: [...seed.appointments],
  medication: { ...seed.medication },
  medicationHistory: seed.medicationHistory,
  resources: seed.resources,
  notifications: [...seed.notifications],
  profile: { ...seed.profile },
}

export const demoCredentials = seed.demoCredentials
export const demoAuthUser = seed.authUser
