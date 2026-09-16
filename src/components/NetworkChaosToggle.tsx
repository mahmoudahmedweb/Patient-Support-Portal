import { WifiOff } from 'lucide-react'
import { useNetworkChaos } from '@/hooks/useNetworkChaos'
import { Switch } from '@/components/form/Switch'
import { cn } from '@/lib/utils'

/**
 * A demo-only control that forces every simulated API call to fail, so
 * error states across the app can be shown on demand rather than only
 * described. See src/lib/network-chaos.ts.
 */
export function NetworkChaosToggle() {
  const { enabled, setEnabled } = useNetworkChaos()

  return (
    <div
      className={cn(
        'hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:flex',
        enabled
          ? 'border-danger-600/30 bg-danger-50 text-danger-700'
          : 'border-border text-ink-500',
      )}
      title="Demo control: force every request to fail so you can see error states."
    >
      <WifiOff className="size-3.5" aria-hidden="true" />
      <Switch
        id="network-chaos-toggle"
        checked={enabled}
        onChange={setEnabled}
        label="Simulate network errors"
      />
    </div>
  )
}
