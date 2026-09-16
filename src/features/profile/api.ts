import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services'
import { queryKeys } from '@/lib/query-keys'

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileService.getProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.profile, profile),
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.updateNotificationPreferences,
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.profile, profile),
  })
}
