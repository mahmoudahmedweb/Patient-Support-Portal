import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { useProfile } from './api'
import { PersonalInfoForm } from './PersonalInfoForm'
import { NotificationPreferencesForm } from './NotificationPreferencesForm'

export function ProfilePage() {
  const query = useProfile()

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">Profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage your contact details and how Meridian Care reaches you.
        </p>
      </div>

      <AsyncSection
        query={query}
        errorTitle="Couldn't load your profile"
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        }
      >
        {(profile) => (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Personal information</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalInfoForm profile={profile} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationPreferencesForm profile={profile} />
              </CardContent>
            </Card>
          </>
        )}
      </AsyncSection>
    </div>
  )
}
