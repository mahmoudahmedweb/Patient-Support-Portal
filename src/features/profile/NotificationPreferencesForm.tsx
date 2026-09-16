import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Profile, UpdateNotificationPreferencesInput } from '@/types'
import { updateNotificationPreferencesSchema } from '@/types'
import { Switch } from '@/components/form/Switch'
import { Button } from '@/components/Button'
import { ApiError } from '@/services'
import { useUpdateNotificationPreferences } from './api'

const CATEGORIES = [
  {
    key: 'appointmentReminders',
    label: 'Appointment reminders',
    description: 'Upcoming visits, cancellations, and reschedules.',
  },
  {
    key: 'medicationReminders',
    label: 'Medication reminders',
    description: 'Dose reminders and adherence updates.',
  },
  {
    key: 'educationalContent',
    label: 'Educational content',
    description: 'New resources and articles worth a look.',
  },
] as const

const CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'Text message' },
  { key: 'push', label: 'Push notification' },
] as const

export function NotificationPreferencesForm({ profile }: { profile: Profile }) {
  const mutation = useUpdateNotificationPreferences()
  const [successMessage, setSuccessMessage] = useState('')

  const { control, handleSubmit } = useForm<UpdateNotificationPreferencesInput>({
    resolver: zodResolver(updateNotificationPreferencesSchema),
    defaultValues: profile.notificationPreferences,
  })

  const onSubmit = async (values: UpdateNotificationPreferencesInput) => {
    setSuccessMessage('')
    await mutation.mutateAsync(values)
    setSuccessMessage('Your notification preferences were saved.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <caption className="sr-only">
            Notification channel preferences by category
          </caption>
          <thead>
            <tr>
              <th scope="col" className="pb-2 font-medium text-ink-500">
                Category
              </th>
              {CHANNELS.map((channel) => (
                <th
                  key={channel.key}
                  scope="col"
                  className="pb-2 text-center font-medium text-ink-500"
                >
                  {channel.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CATEGORIES.map((category) => (
              <tr key={category.key}>
                <th scope="row" className="py-3 pr-4 align-top font-medium text-ink-900">
                  {category.label}
                  <span className="mt-0.5 block text-xs font-normal text-ink-500">
                    {category.description}
                  </span>
                </th>
                {CHANNELS.map((channel) => (
                  <td key={channel.key} className="py-3 text-center align-top">
                    <Controller
                      control={control}
                      name={`${category.key}.${channel.key}`}
                      render={({ field }) => (
                        <Switch
                          id={`${category.key}-${channel.key}`}
                          checked={field.value}
                          onChange={field.onChange}
                          label={`${channel.label} for ${category.label}`}
                          hideLabel
                        />
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" isLoading={mutation.isPending}>
          Save preferences
        </Button>
        {successMessage && (
          <p role="status" className="text-sm font-medium text-success-700">
            {successMessage}
          </p>
        )}
        {mutation.isError && (
          <p role="alert" className="text-sm font-medium text-danger-600">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : 'Something went wrong. Please try again.'}
          </p>
        )}
      </div>
    </form>
  )
}
