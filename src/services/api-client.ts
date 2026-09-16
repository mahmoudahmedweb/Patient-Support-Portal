import { isNetworkChaosEnabled } from '@/lib/network-chaos'

/**
 * The mock REST layer's error type. Every service function throws this
 * (never a raw string or unknown) so UI error states can rely on a
 * consistent shape — mirrors how you'd normalize errors from a real
 * fetch/axios client in one place instead of in every component.
 */
export class ApiError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface SimulateOptions {
  /** Minimum artificial network latency, in ms. */
  minDelayMs?: number
  /** Maximum artificial network latency, in ms. */
  maxDelayMs?: number
  /** Baseline chance (0-1) this call fails even without chaos mode on. */
  failureRate?: number
  /** Message used when the simulated request fails. */
  errorMessage?: string
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wraps a synchronous "resolve the data" function with the behavior of a
 * real network call: latency, and a chance of failure. This is what makes
 * loading and error states in the UI genuine rather than only styled.
 */
export async function simulateRequest<T>(
  resolve: () => T,
  options: SimulateOptions = {},
): Promise<T> {
  const {
    minDelayMs = 280,
    maxDelayMs = 820,
    failureRate = 0.05,
    errorMessage = "We couldn't reach the server. Please try again.",
  } = options

  await wait(minDelayMs + Math.random() * (maxDelayMs - minDelayMs))

  const effectiveFailureRate = isNetworkChaosEnabled() ? 1 : failureRate
  if (Math.random() < effectiveFailureRate) {
    throw new ApiError(errorMessage, 503)
  }

  return resolve()
}
