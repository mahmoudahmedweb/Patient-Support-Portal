import { simulateRequest } from '@/services/api-client'
import { db } from '@/services/store'
import type {
  Profile,
  UpdateNotificationPreferencesInput,
  UpdateProfileInput,
} from '@/types'

export async function getProfile(): Promise<Profile> {
  return simulateRequest(() => db.profile)
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  return simulateRequest(() => {
    Object.assign(db.profile, input)
    return { ...db.profile }
  })
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
): Promise<Profile> {
  return simulateRequest(() => {
    db.profile.notificationPreferences = input
    return { ...db.profile }
  })
}
