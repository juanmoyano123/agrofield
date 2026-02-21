import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loginSchema } from '../lib/validations/auth-schemas'
import type { LoginFormData } from '../lib/validations/auth-schemas'
import { useAuth } from '../hooks/use-auth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Alert } from '../components/ui/alert'

export function LoginPage() {
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
        <h1 className="text-2xl font-bold text-neutral-900 font-display">Iniciar sesión</h1>
        <p className="text-sm text-neutral-500 mt-1">Ingresá con tu cuenta de AgroField</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
          placeholder="Tu contraseña"
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
          INGRESAR
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <p className="text-neutral-600">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-field-green font-semibold hover:underline">
            Registrate acá
          </Link>
        </p>
        <Link to="/recuperar-contrasena" className="text-neutral-500 hover:text-neutral-700">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  )
}
