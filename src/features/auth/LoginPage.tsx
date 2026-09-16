import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { loginSchema, type LoginInput } from '@/types'
import { Field } from '@/components/form/Field'
import { Input } from '@/components/form/Input'
import { Button } from '@/components/Button'
import { ApiError } from '@/services'
import { demoCredentials } from '@/services/store'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { isAuthenticated, login, isLoggingIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isAuthenticated) {
    const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (values: LoginInput) => {
    setFormError(null)
    try {
      await login(values)
      const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      // Read the message off the error that was just thrown, not off
      // context state — the mutation's `error` in useAuth() updates on
      // its own render cycle and can still be stale here otherwise.
      setFormError(
        error instanceof ApiError ? error.message : 'Sign-in failed. Please try again.',
      )
    }
  }

  const fillDemoCredentials = () => {
    setValue('email', demoCredentials.email, { shouldValidate: true })
    setValue('password', demoCredentials.password, { shouldValidate: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-surface-subtle px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink-950">
              Meridian Care
            </p>
            <p className="text-xs text-ink-500">Patient Support Portal</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="text-xl font-semibold text-ink-950">Sign in to your account</h1>
          <p className="mt-1 text-sm text-ink-500">
            Track your treatment journey, appointments, and medications in one place.
          </p>

          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-info-600/20 bg-info-50 p-3 text-sm text-info-700">
            <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">This is a portfolio demo</p>
              <p className="mt-0.5 text-info-700/90">
                Authentication is simulated — no real account or patient data exists
                behind it.{' '}
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="font-medium underline underline-offset-2 hover:no-underline"
                >
                  Fill in demo credentials
                </button>
                .
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field
              id="email"
              label="Email address"
              error={errors.email?.message}
              required
            >
              <Input
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
            </Field>

            <Field
              id="password"
              label="Password"
              error={errors.password?.message}
              required
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
            </Field>

            {formError && (
              <p role="alert" className="text-sm font-medium text-danger-600">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoggingIn}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-500">
          Built as a portfolio project. No real patients, providers, or medical advice.
        </p>
      </div>
    </main>
  )
}
