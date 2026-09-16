import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/AppLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { NotFoundPage } from '@/app/NotFoundPage'
import { PageLoadingFallback } from '@/app/PageLoadingFallback'
import { LoginPage } from '@/features/auth'

// Route-level code splitting: each feature page ships in its own chunk
// and is only fetched when the visitor navigates to it.
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const TreatmentJourneyPage = lazy(() =>
  import('@/features/treatments/TreatmentJourneyPage').then((m) => ({
    default: m.TreatmentJourneyPage,
  })),
)
const AppointmentsPage = lazy(() =>
  import('@/features/appointments/AppointmentsPage').then((m) => ({
    default: m.AppointmentsPage,
  })),
)
const AppointmentDetailPage = lazy(() =>
  import('@/features/appointments/AppointmentDetailPage').then((m) => ({
    default: m.AppointmentDetailPage,
  })),
)
const MedicationsPage = lazy(() =>
  import('@/features/medications/MedicationsPage').then((m) => ({
    default: m.MedicationsPage,
  })),
)
const ResourcesPage = lazy(() =>
  import('@/features/resources/ResourcesPage').then((m) => ({
    default: m.ResourcesPage,
  })),
)
const ResourceDetailPage = lazy(() =>
  import('@/features/resources/ResourceDetailPage').then((m) => ({
    default: m.ResourceDetailPage,
  })),
)
const NotificationsPage = lazy(() =>
  import('@/features/notifications/NotificationsPage').then((m) => ({
    default: m.NotificationsPage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="treatment-journey" element={<TreatmentJourneyPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route
              path="appointments/:appointmentId"
              element={<AppointmentDetailPage />}
            />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="resources/:resourceId" element={<ResourceDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
