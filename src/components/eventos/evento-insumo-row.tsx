import type { UseFormRegister, FieldErrors, UseFieldArrayRemove, Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { EventoFormSchema } from '../../lib/validations/evento-schemas'
import type { Producto } from '../../types'
import { Input } from '../ui/input'

interface EventoInsumoRowProps {
  index: number
  register: UseFormRegister<EventoFormSchema>
  errors: FieldErrors<EventoFormSchema>
  control: Control<EventoFormSchema>
  remove: UseFieldArrayRemove
  productos: Producto[]
  onProductoChange: (index: number, producto: Producto) => void
}

function formatCurrency(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '$0'
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function EventoInsumoRow({
  index,
  register,
  errors,
  control,
  remove,
  productos,
  onProductoChange,
}: EventoInsumoRowProps) {
  const cantidad = useWatch({ control, name: `insumos.${index}.cantidad` })
  const costoUnitario = useWatch({ control, name: `insumos.${index}.costoUnitario` })
  const unidad = useWatch({ control, name: `insumos.${index}.unidad` })

  const subtotal = (Number(cantidad) || 0) * (Number(costoUnitario) || 0)
  const insumoErrors = errors.insumos?.[index]

  return (
    <div className="p-3 border border-border-warm rounded-sm bg-surface">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Insumo {index + 1}
        </p>
        <button
          type="button"
          onClick={() => remove(index)}
          aria-label={`Eliminar insumo ${index + 1}`}
          className="
            w-7 h-7 flex items-center justify-center
            rounded-sm text-text-muted
            hover:bg-red-50 hover:text-error
            transition-colors duration-300
            text-lg leading-none shrink-0
          "
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Producto selector */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-text-primary">Producto</label>
          <select
            className="
              w-full px-3 py-2.5 min-h-[44px]
              rounded-sm border border-border-warm-strong bg-surface
              text-base text-text-primary
              focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green
              transition-colors duration-300
            "
            onChange={(e) => {
              const producto = productos.find(p => p.id === e.target.value)
              if (producto) onProductoChange(index, producto)
            }}
          >
            <option value="">Seleccionar producto...</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (stock: {p.stockActual} {p.unidad})
              </option>
            ))}
          </select>
          {/* Hidden fields for RHF tracking */}
          <input type="hidden" {...register(`insumos.${index}.productoId`)} />
          <input type="hidden" {...register(`insumos.${index}.productoName`)} />
          <input type="hidden" {...register(`insumos.${index}.unidad`)} />
          <input type="hidden" {...register(`insumos.${index}.costoUnitario`)} />
          <input type="hidden" {...register(`insumos.${index}.subtotal`)} />
          {insumoErrors?.productoId && (
            <p className="text-xs text-error mt-0.5">{insumoErrors.productoId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`Cantidad${unidad ? ` (${unidad})` : ''}`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            error={insumoErrors?.cantidad?.message}
            {...register(`insumos.${index}.cantidad`)}
          />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text-primary">Subtotal</span>
            <div className="
              px-3 py-3 min-h-[44px]
              rounded-sm border border-border-warm bg-parchment
              text-base font-semibold text-text-dim
              flex items-center
            ">
              {formatCurrency(subtotal)}
            </div>
          </div>
        </div>

        {costoUnitario > 0 && (
          <p className="text-xs text-text-muted">
            Precio unitario: {formatCurrency(Number(costoUnitario))} / {unidad || 'unidad'}
          </p>
        )}
      </div>
    </div>
  )
}
