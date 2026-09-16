import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { ErrorState } from '@/components/ErrorState'

interface AsyncSectionProps<T> {
  query: Pick<UseQueryResult<T>, 'isPending' | 'isError' | 'data' | 'refetch'>
  /** Rendered while the query is loading for the first time. */
  skeleton: ReactNode
  errorTitle?: string
  errorDescription?: string
  /** Rendered once data has arrived. */
  children: (data: T) => ReactNode
}

/**
 * A small generic component that turns a TanStack Query result into
 * exactly one of: skeleton, error (with retry), or the resolved content.
 * Every feature in this app renders its async data through this instead
 * of re-deriving the same isPending/isError branching by hand — one
 * place to get loading and error UX right, instead of nine.
 */
export function AsyncSection<T>({
  query,
  skeleton,
  errorTitle,
  errorDescription,
  children,
}: AsyncSectionProps<T>) {
  if (query.isPending) return <>{skeleton}</>

  if (query.isError) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        onRetry={() => query.refetch()}
      />
    )
  }

  return <>{children(query.data as T)}</>
}
