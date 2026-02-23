import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loginSchema } from '../lib/validations/auth-schemas'
import type { LoginFormData } from '../lib/validations/auth-schemas'
import { useAuth } from '../hooks/use-auth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Alert } from '../components/ui/alert'

export function LoginPage() {
  const { t } = useTranslation('auth')
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isAuthenticated) {
      void navigate(redirect, { replace: true })
    }
  }, [isAuthenticated, navigate, redirect])

  const onSubmit = (data: LoginFormData) => {
    void login(data)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">{t('login.title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label={t('login.emailLabel')}
          type="email"
          placeholder={t('login.emailPlaceholder')}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('login.passwordLabel')}
          type="password"
          placeholder={t('login.passwordPlaceholder')}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          {t('login.submitButton')}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <p className="text-text-dim">
          {t('login.noAccount')}{' '}
          <Link to="/registro" className="text-field-green font-semibold hover:underline">
            {t('login.registerLink')}
          </Link>
        </p>
        <Link to="/recuperar-contrasena" className="text-text-muted hover:text-text-dim">
          {t('login.forgotPassword')}
        </Link>
      </div>
    </div>
  )
}
