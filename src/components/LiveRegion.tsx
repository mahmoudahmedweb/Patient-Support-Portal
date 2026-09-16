/**
 * A persistent, visually-hidden `aria-live` region for one-off status
 * messages (e.g. "Appointment cancelled", "3 notifications marked read")
 * that don't otherwise have an accessible way to announce themselves —
 * screen readers only announce changes to a live region that was already
 * in the DOM before the update.
 */
export function LiveRegion({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {message}
    </div>
  )
}
