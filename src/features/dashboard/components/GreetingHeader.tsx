function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

interface GreetingHeaderProps {
  firstName: string
  condition: string
}

/**
 * The greeting is derived straight from the current time during render —
 * no state, no effect. It only needs to be right the moment this
 * component renders, so there's nothing to synchronize.
 */
export function GreetingHeader({ firstName, condition }: GreetingHeaderProps) {
  const greeting = greetingForHour(new Date().getHours())

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-950 sm:text-3xl">
        {greeting}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Here's where things stand with your {condition.toLowerCase()} care plan.
      </p>
    </div>
  )
}
