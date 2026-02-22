import { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { compraFormSchema } from '../../lib/validations/compras-schemas'
import type { CompraFormSchema } from '../../lib/validations/compras-schemas'
import { useCompras } from '../../hooks/use-compras'
import { useAuth } from '../../hooks/use-auth'
import { Modal } from '../ui/modal'
import { Select } from '../ui/select'
import { DateInput } from '../ui/date-input'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Alert } from '../ui/alert'
import { CompraItemRow } from './compra-item-row'
import { ProveedorInlineForm } from './proveedor-inline-form'

interface CompraFormModalProps {
  isOpen: boolean
  onClose: () => void
}

const MONEDA_OPTIONS = [
  { value: 'ARS', label: 'ARS (Pesos)' },
  { value: 'USD', label: 'USD (Dólares)' },
]

function getTodayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CompraFormModal({ isOpen, onClose }: CompraFormModalProps) {
  const { proveedores, isSaving, error, createCompra, clearError } = useCompras()
  const { user } = useAuth()
  const [showNewProveedor, setShowNewProveedor] = useState(false)

  // Track whether a save was initiated so we can detect success
  const saveInitiated = useRef(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CompraFormSchema>({
    // Cast needed because zodResolver + ZodEffects (from superRefine) loses generics in some versions
    resolver: zodResolver(compraFormSchema) as Resolver<CompraFormSchema>,
    defaultValues: {
      proveedorId: '',
      proveedorName: '',
      proveedorTelefono: '',
      fecha: getTodayISO(),
      numeroFactura: '',
      moneda: 'ARS',
      notas: '',
      items: [
        { productoName: '', cantidad: 0, unidad: 'Litros', precioUnitario: 0 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const watchedItems = useWatch({ control, name: 'items' })
  const total = (watchedItems ?? []).reduce((sum, item) => {
    return sum + (Number(item?.cantidad) || 0) * (Number(item?.precioUnitario) || 0)
  }, 0)

  // Close modal when save completes without error
  useEffect(() => {
    if (saveInitiated.current && !isSaving && !error) {
      saveInitiated.current = false
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving, error])

  const proveedorOptions = proveedores.map(p => ({ value: p.id, label: p.name }))

  function handleProveedorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    if (value === '__new__') {
      setValue('proveedorId', '')
      setValue('proveedorName', '')
      setShowNewProveedor(true)
    } else {
      const prov = proveedores.find(p => p.id === value)
      setValue('proveedorId', value)
      setValue('proveedorName', prov?.name ?? '')
      setShowNewProveedor(false)
    }
  }

  function handleClose() {
    reset({
      proveedorId: '',
      proveedorName: '',
      proveedorTelefono: '',
      fecha: getTodayISO(),
      numeroFactura: '',
      moneda: 'ARS',
      notas: '',
      items: [{ productoName: '', cantidad: 0, unidad: 'Litros', precioUnitario: 0 }],
    })
    setShowNewProveedor(false)
    clearError()
    onClose()
  }

  const onSubmit = (data: CompraFormSchema) => {
    if (!user) return
    saveInitiated.current = true
    void createCompra(data, user.tenantId)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Compra" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

        {/* Proveedor section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Proveedor</h3>

          <select
            className="
              w-full px-3 py-3 border border-neutral-300 rounded-md
              text-base text-neutral-900 bg-white
              hover:border-neutral-400
              focus:outline-none focus:ring-2 focus:ring-field-green focus:border-transparent
              transition-colors duration-200
              min-h-[44px]
            "
            onChange={handleProveedorChange}
            defaultValue=""
          >
            <option value="">Seleccionar proveedor...</option>
            {proveedorOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value="__new__">+ Crear nuevo proveedor</option>
          </select>

          {showNewProveedor && (
            <ProveedorInlineForm register={register} errors={errors} />
          )}
        </div>

        {/* Purchase details */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Detalles de la compra</h3>

          <div className="grid grid-cols-2 gap-3">
            <DateInput
              label="Fecha"
              error={errors.fecha?.message}
              {...register('fecha')}
            />
            <Select
              label="Moneda"
              options={MONEDA_OPTIONS}
              error={errors.moneda?.message}
              {...register('moneda')}
            />
          </div>

          <Input
            label="Número de factura (opcional)"
            placeholder="Ej: FA-0001-00003421"
            {...register('numeroFactura')}
          />

          <Input
            label="Notas (opcional)"
            placeholder="Observaciones sobre la compra..."
            {...register('notas')}
          />
        </div>

        {/* Items section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Productos</h3>

          {/* Show root-level items error (e.g. "must have at least 1") */}
          {errors.items && !Array.isArray(errors.items) && 'message' in errors.items && (
            <Alert variant="error">{errors.items.message as string}</Alert>
          )}

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <CompraItemRow
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                control={control}
                remove={remove}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ productoName: '', cantidad: 0, unidad: 'Litros', precioUnitario: 0 })}
            className="
              w-full py-3 border-2 border-dashed border-neutral-300
              rounded-md text-sm font-semibold text-neutral-500
              hover:border-field-green hover:text-field-green
              transition-colors duration-200
              min-h-[44px]
            "
          >
            + Agregar producto
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-md border border-neutral-200">
          <span className="text-sm font-semibold text-neutral-700">Total estimado</span>
          <span className="text-lg font-bold text-neutral-900">
            {total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
          </span>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {/* Footer actions */}
        <div className="flex gap-3 pt-2 border-t border-neutral-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            className="flex-1"
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
