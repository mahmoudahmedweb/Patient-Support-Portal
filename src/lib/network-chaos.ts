/**
 * A tiny external store (see useSyncExternalStore in React) that lets the
 * demo intentionally trigger error states from the UI — see the "Simulate
 * errors" toggle in the app header. This is presentation-layer plumbing
 * for the portfolio demo, not app data, which is why it lives outside
 * TanStack Query / component state rather than as global app state.
 */
type Listener = () => void

let chaosEnabled = false
const listeners = new Set<Listener>()

export function isNetworkChaosEnabled(): boolean {
  return chaosEnabled
}

export function setNetworkChaosEnabled(next: boolean): void {
  if (next === chaosEnabled) return
  chaosEnabled = next
  listeners.forEach((listener) => listener())
}

export function subscribeNetworkChaos(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
