import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { registerSchema } from '../lib/validations/auth-schemas'
import type { RegisterFormData } from '../lib/validations/auth-schemas'
import { useAuth } from '../hooks/use-auth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Alert } from '../components/ui/alert'

export function RegisterPage() {
  const { t } = useTranslation('auth')
  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isAuthenticated) {
      void navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = (data: RegisterFormData) => {
    void registerUser(data)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">{t('register.title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label={t('register.nameLabel')}
          type="text"
          placeholder={t('register.namePlaceholder')}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={t('register.emailLabel')}
          type="email"
          placeholder={t('register.emailPlaceholder')}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('register.passwordLabel')}
          type="password"
          placeholder={t('register.passwordPlaceholder')}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label={t('register.confirmPasswordLabel')}
          type="password"
          placeholder={t('register.confirmPasswordPlaceholder')}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Input
          label={t('register.tenantNameLabel')}
          type="text"
          placeholder={t('register.tenantNamePlaceholder')}
          error={errors.tenantName?.message}
          {...register('tenantName')}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          {t('register.submitButton')}
        </Button>
      </form>

      <p className="text-center text-sm text-text-dim">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="text-field-green font-semibold hover:underline">
          {t('register.loginLink')}
        </Link>
      </p>
    </div>
  )
}
