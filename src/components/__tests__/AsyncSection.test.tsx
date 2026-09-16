import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AsyncSection } from '@/components/AsyncSection'

/**
 * AsyncSection is the single place every feature routes its loading /
 * error / success branching through (see components/AsyncSection.tsx).
 * These tests exercise the three states directly against a fake query
 * result, without touching TanStack Query or the network layer at all.
 */
describe('AsyncSection', () => {
  it('renders the skeleton while the query is pending', () => {
    render(
      <AsyncSection
        query={{ isPending: true, isError: false, data: undefined, refetch: vi.fn() }}
        skeleton={<p>Loading…</p>}
      >
        {() => <p>Content</p>}
      </AsyncSection>,
    )

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders an error state with a working retry button', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()

    render(
      <AsyncSection
        query={{ isPending: false, isError: true, data: undefined, refetch }}
        skeleton={<p>Loading…</p>}
        errorTitle="Couldn't load this"
      >
        {() => <p>Content</p>}
      </AsyncSection>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load this")

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders the resolved content once data is available', () => {
    render(
      <AsyncSection
        query={{
          isPending: false,
          isError: false,
          data: { name: 'Jordan' },
          refetch: vi.fn(),
        }}
        skeleton={<p>Loading…</p>}
      >
        {(data) => <p>Hello {data.name}</p>}
      </AsyncSection>,
    )

    expect(screen.getByText('Hello Jordan')).toBeInTheDocument()
  })
})
