import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema } from '../lib/validations/auth-schemas'
import type { ForgotPasswordFormData } from '../lib/validations/auth-schemas'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Alert } from '../components/ui/alert'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (_data: ForgotPasswordFormData) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">Email enviado</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Si el email existe en nuestro sistema, recibirás un link para restablecer tu contraseña.
          </p>
        </div>
        <Alert variant="success">Revisá tu bandeja de entrada y tu carpeta de spam.</Alert>
        <Link to="/login" className="text-field-green font-semibold hover:underline text-sm">
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">Recuperar contraseña</h1>
        <p className="text-sm text-text-muted mt-1">
          Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
        </p>
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
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          ENVIAR LINK
        </Button>
      </form>

      <Link to="/login" className="text-center text-sm text-text-muted hover:text-text-dim">
        Volver al inicio de sesión
      </Link>
    </div>
  )
}
