import { useQuery } from '@tanstack/react-query'
import { medicationService } from '@/services'
import { queryKeys } from '@/lib/query-keys'

export function useCurrentMedication() {
  return useQuery({
    queryKey: queryKeys.medication.current,
    queryFn: medicationService.getCurrentMedication,
  })
}

export function useMedicationHistory() {
  return useQuery({
    queryKey: queryKeys.medication.history,
    queryFn: medicationService.getMedicationHistory,
  })
}
