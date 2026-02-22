import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CompraFormSchema } from '../../lib/validations/compras-schemas'
import { Input } from '../ui/input'

interface ProveedorInlineFormProps {
  register: UseFormRegister<CompraFormSchema>
  errors: FieldErrors<CompraFormSchema>
}

export function ProveedorInlineForm({ register, errors }: ProveedorInlineFormProps) {
  return (
    <div className="flex flex-col gap-3 p-3 bg-parchment rounded-sm border border-border-warm">
      <p className="text-sm font-semibold text-text-dim">Datos del nuevo proveedor</p>
      <Input
        label="Nombre del proveedor"
        placeholder="Ej: AgroInsumos Córdoba"
        error={errors.proveedorName?.message}
        {...register('proveedorName')}
      />
      <Input
        label="Teléfono (opcional)"
        type="tel"
        placeholder="+54 341 4123456"
        {...register('proveedorTelefono')}
      />
    </div>
  )
}
