import { useQuery } from '@tanstack/react-query'
import { patientService } from '@/services'
import { queryKeys } from '@/lib/query-keys'

export function usePatient() {
  return useQuery({ queryKey: queryKeys.patient, queryFn: patientService.getPatient })
}
