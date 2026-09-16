import { useSyncExternalStore } from 'react'
import {
  isNetworkChaosEnabled,
  setNetworkChaosEnabled,
  subscribeNetworkChaos,
} from '@/lib/network-chaos'

/**
 * Subscribes a component to the network-chaos toggle via
 * useSyncExternalStore — the correct primitive for reading mutable state
 * that lives outside React (here, a module-level singleton) without
 * tearing between renders.
 */
export function useNetworkChaos() {
  const enabled = useSyncExternalStore(subscribeNetworkChaos, isNetworkChaosEnabled)
  return { enabled, setEnabled: setNetworkChaosEnabled }
}
