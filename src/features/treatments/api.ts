import { useQuery } from '@tanstack/react-query'
import { treatmentService } from '@/services'
import { queryKeys } from '@/lib/query-keys'

export function useCurrentTreatment() {
  return useQuery({
    queryKey: queryKeys.treatment.current,
    queryFn: treatmentService.getCurrentTreatment,
  })
}

export function useJourneyStages() {
  return useQuery({
    queryKey: queryKeys.treatment.journey,
    queryFn: treatmentService.getJourneyStages,
  })
}
