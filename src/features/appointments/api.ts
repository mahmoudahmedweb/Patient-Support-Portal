import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '@/services'
import type { AppointmentFilter } from '@/services/appointment.service'
import { queryKeys } from '@/lib/query-keys'
import type { RescheduleAppointmentInput } from '@/types'

export function useAppointments(filter: AppointmentFilter = {}) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filter),
    queryFn: () => appointmentService.getAppointments(filter),
  })
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id ?? ''),
    queryFn: () => appointmentService.getAppointment(id as string),
    enabled: Boolean(id),
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
      queryClient.setQueryData(queryKeys.appointments.detail(updated.id), updated)
    },
  })
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleAppointmentInput }) =>
      appointmentService.rescheduleAppointment(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
      queryClient.setQueryData(queryKeys.appointments.detail(updated.id), updated)
    },
  })
}
