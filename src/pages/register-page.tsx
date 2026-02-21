import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { registerSchema } from '../lib/validations/auth-schemas'
import type { RegisterFormData } from '../lib/validations/auth-schemas'
import { useAuth } from '../hooks/use-auth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Alert } from '../components/ui/alert'

export function RegisterPage() {
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
        <h1 className="text-2xl font-bold text-neutral-900 font-display">Crear cuenta</h1>
        <p className="text-sm text-neutral-500 mt-1">Empezá a gestionar tu campo hoy</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          type="text"
          placeholder="Juan Pérez"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repetí tu contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Input
          label="Nombre de tu campo (opcional)"
          type="text"
          placeholder="Ej: Estancia La Esperanza"
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
          CREAR CUENTA
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-field-green font-semibold hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
