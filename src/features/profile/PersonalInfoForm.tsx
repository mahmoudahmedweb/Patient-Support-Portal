import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Profile, UpdateProfileInput } from '@/types'
import { updateProfileSchema } from '@/types'
import { Field } from '@/components/form/Field'
import { Input } from '@/components/form/Input'
import { Select } from '@/components/form/Select'
import { Button } from '@/components/Button'
import { ApiError } from '@/services'
import { useUpdateProfile } from './api'

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
] as const

export function PersonalInfoForm({ profile }: { profile: Profile }) {
  const mutation = useUpdateProfile()
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      preferredLanguage: profile.preferredLanguage,
      timezone: profile.timezone,
    },
  })

  // Keep the form in sync if the underlying query data changes elsewhere
  // (e.g. a refetch) — but only while the visitor hasn't started typing,
  // so we never clobber an in-progress edit.
  useEffect(() => {
    if (!isDirty) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        preferredLanguage: profile.preferredLanguage,
        timezone: profile.timezone,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const onSubmit = async (values: UpdateProfileInput) => {
    setSuccessMessage('')
    await mutation.mutateAsync(values)
    setSuccessMessage('Your profile was updated.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          error={errors.firstName?.message}
          required
        >
          <Input id="firstName" {...register('firstName')} />
        </Field>
        <Field id="lastName" label="Last name" error={errors.lastName?.message} required>
          <Input id="lastName" {...register('lastName')} />
        </Field>
      </div>

      <Field id="email" label="Email address" error={errors.email?.message} required>
        <Input id="email" type="email" {...register('email')} />
      </Field>

      <Field id="phone" label="Phone number" error={errors.phone?.message} required>
        <Input id="phone" type="tel" {...register('phone')} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="preferredLanguage" label="Preferred language">
          <Select id="preferredLanguage" {...register('preferredLanguage')}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="timezone"
          label="Timezone"
          hint="Used to schedule reminders correctly."
        >
          <Input id="timezone" {...register('timezone')} />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="sm" isLoading={mutation.isPending}>
          Save changes
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
