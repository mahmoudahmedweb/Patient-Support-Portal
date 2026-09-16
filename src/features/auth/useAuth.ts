import { use } from 'react'
import { AuthContext } from '@/features/auth/AuthProvider'

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
