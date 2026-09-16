import { Skeleton } from '@/components/Skeleton'
import { AsyncSection } from '@/components/AsyncSection'
import { usePatient } from '@/features/dashboard/api'
import { GreetingHeader } from '@/features/dashboard/components/GreetingHeader'
import { CurrentTreatmentCard } from '@/features/dashboard/components/CurrentTreatmentCard'
import { NextAppointmentCard } from '@/features/dashboard/components/NextAppointmentCard'
import { MedicationSnapshotCard } from '@/features/dashboard/components/MedicationSnapshotCard'
import { ProgressCard } from '@/features/dashboard/components/ProgressCard'
import { NotificationsPreviewCard } from '@/features/dashboard/components/NotificationsPreviewCard'
import { RecommendedResourcesCard } from '@/features/dashboard/components/RecommendedResourcesCard'

export function DashboardPage() {
  const patientQuery = usePatient()

  return (
    <div className="space-y-6 pb-8">
      <AsyncSection
        query={patientQuery}
        errorTitle="Couldn't load your dashboard"
        errorDescription="We couldn't reach the server to load your details. Please try again."
        skeleton={
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        }
      >
        {(patient) => (
          <GreetingHeader firstName={patient.firstName} condition={patient.condition} />
        )}
      </AsyncSection>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CurrentTreatmentCard />
        </div>
        <ProgressCard />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <NextAppointmentCard />
        <MedicationSnapshotCard />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <NotificationsPreviewCard />
        <RecommendedResourcesCard />
      </div>
    </div>
  )
}
