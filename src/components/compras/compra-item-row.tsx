import type { UseFormRegister, FieldErrors, UseFieldArrayRemove, Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { CompraFormSchema } from '../../lib/validations/compras-schemas'
import { Input } from '../ui/input'
import { Select } from '../ui/select'

const UNIDAD_OPTIONS = [
  { value: 'Litros', label: 'Litros' },
  { value: 'Kilos', label: 'Kilos' },
  { value: 'Unidades', label: 'Unidades' },
  { value: 'Bolsas', label: 'Bolsas' },
  { value: 'Toneladas', label: 'Toneladas' },
]

interface CompraItemRowProps {
  index: number
  register: UseFormRegister<CompraFormSchema>
  errors: FieldErrors<CompraFormSchema>
  control: Control<CompraFormSchema>
  remove: UseFieldArrayRemove
}

function formatCurrency(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '$0.00'
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function CompraItemRow({ index, register, errors, control, remove }: CompraItemRowProps) {
  const cantidad = useWatch({ control, name: `items.${index}.cantidad` })
  const precioUnitario = useWatch({ control, name: `items.${index}.precioUnitario` })

  const subtotal = (Number(cantidad) || 0) * (Number(precioUnitario) || 0)

  const itemErrors = errors.items?.[index]

  return (
    <div className="p-3 border border-neutral-200 rounded-md bg-white">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Producto {index + 1}
        </p>
        <button
          type="button"
          onClick={() => remove(index)}
          aria-label={`Eliminar producto ${index + 1}`}
          className="
            w-7 h-7 flex items-center justify-center
            rounded-md text-neutral-400
            hover:bg-red-50 hover:text-error
            transition-colors duration-200
            text-lg leading-none
            shrink-0
          "
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          label="Nombre del producto"
          placeholder="Ej: Roundup 480"
          error={itemErrors?.productoName?.message}
          {...register(`items.${index}.productoName`)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cantidad"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            error={itemErrors?.cantidad?.message}
            {...register(`items.${index}.cantidad`)}
          />

          <Select
            label="Unidad"
            options={UNIDAD_OPTIONS}
            error={itemErrors?.unidad?.message}
            {...register(`items.${index}.unidad`)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <Input
            label="Precio unitario"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={itemErrors?.precioUnitario?.message}
            {...register(`items.${index}.precioUnitario`)}
          />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-neutral-800">Subtotal</span>
            <div className="
              px-3 py-3 min-h-[44px]
              rounded-md border border-neutral-200 bg-neutral-50
              text-base font-semibold text-neutral-700
              flex items-center
            ">
              {formatCurrency(subtotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
