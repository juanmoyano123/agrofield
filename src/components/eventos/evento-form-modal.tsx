import { useEffect, useRef } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventoFormSchema } from '../../lib/validations/evento-schemas'
import type { EventoFormSchema } from '../../lib/validations/evento-schemas'
import type { Evento, Producto } from '../../types'
import { Modal } from '../ui/modal'
import { Select } from '../ui/select'
import { DateInput } from '../ui/date-input'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Alert } from '../ui/alert'
import { EventoInsumoRow } from './evento-insumo-row'

interface EventoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventoFormSchema) => void
  evento?: Evento | null
  isSaving: boolean
  error: string | null
  onClearError: () => void
  productos: Producto[]
}

const TIPO_OPTIONS = [
  { value: 'siembra', label: 'Siembra' },
  { value: 'aplicacion', label: 'Aplicación' },
  { value: 'cosecha', label: 'Cosecha' },
  { value: 'monitoreo', label: 'Monitoreo' },
  { value: 'servicio', label: 'Servicio / Contratista' },
  { value: 'riego', label: 'Riego' },
  { value: 'otro', label: 'Otro' },
]

function getTodayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatCurrency(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '$0'
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const defaultValues: EventoFormSchema = {
  tipo: 'siembra',
  fecha: getTodayISO(),
  insumos: [],
  costoManual: undefined,
  responsable: '',
  notas: '',
}

export function EventoFormModal({
  isOpen,
  onClose,
  onSubmit,
  evento,
  isSaving,
  error,
  onClearError,
  productos,
}: EventoFormModalProps) {
  const isEditing = Boolean(evento)
  const saveInitiated = useRef(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventoFormSchema>({
    resolver: zodResolver(eventoFormSchema) as Resolver<EventoFormSchema>,
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'insumos' })

  const watchedInsumos = useWatch({ control, name: 'insumos' })
  const watchedCostoManual = useWatch({ control, name: 'costoManual' })

  const insumosTotal = (watchedInsumos ?? []).reduce((sum, item) => {
    return sum + (Number(item?.cantidad) || 0) * (Number(item?.costoUnitario) || 0)
  }, 0)
  const total = insumosTotal + (Number(watchedCostoManual) || 0)

  // Populate form when editing
  useEffect(() => {
    if (evento) {
      reset({
        tipo: evento.tipo,
        fecha: evento.fecha,
        insumos: evento.insumos.map(i => ({
          productoId: i.productoId,
          productoName: i.productoName,
          cantidad: i.cantidad,
          unidad: i.unidad,
          costoUnitario: i.costoUnitario,
          subtotal: i.subtotal,
        })),
        costoManual: evento.costoManual,
        responsable: evento.responsable ?? '',
        notas: evento.notas ?? '',
      })
    } else {
      reset({ ...defaultValues, fecha: getTodayISO() })
    }
  }, [evento, reset, isOpen])

  // Auto-close on successful save
  useEffect(() => {
    if (saveInitiated.current && !isSaving && !error) {
      saveInitiated.current = false
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving, error])

  function handleProductoChange(index: number, producto: Producto) {
    setValue(`insumos.${index}.productoId`, producto.id)
    setValue(`insumos.${index}.productoName`, producto.name)
    setValue(`insumos.${index}.unidad`, producto.unidad)
    setValue(`insumos.${index}.costoUnitario`, producto.precioPromedio)
    // Recalc subtotal if cantidad already set
    const cantidad = watchedInsumos?.[index]?.cantidad ?? 0
    setValue(`insumos.${index}.subtotal`, Number(cantidad) * producto.precioPromedio)
  }

  function handleClose() {
    reset({ ...defaultValues, fecha: getTodayISO() })
    onClearError()
    onClose()
  }

  const onFormSubmit = (data: EventoFormSchema) => {
    // Recompute subtotals before submitting
    const insumosWithSubtotals = data.insumos.map(i => ({
      ...i,
      subtotal: Number(i.cantidad) * Number(i.costoUnitario),
    }))
    saveInitiated.current = true
    onSubmit({ ...data, insumos: insumosWithSubtotals })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar evento' : 'Registrar evento'}
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="flex flex-col gap-5">

        {/* Tipo + Fecha */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de evento"
            options={TIPO_OPTIONS}
            error={errors.tipo?.message}
            {...register('tipo')}
          />
          <DateInput
            label="Fecha"
            error={errors.fecha?.message}
            {...register('fecha')}
          />
        </div>

        {/* Insumos */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-text-dim uppercase tracking-wide">
            Insumos utilizados
          </h3>

          {fields.length === 0 && (
            <p className="text-xs text-text-muted italic">
              Sin insumos — podés agregar un costo manual abajo.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <EventoInsumoRow
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                control={control}
                remove={remove}
                productos={productos}
                onProductoChange={handleProductoChange}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({
              productoId: '',
              productoName: '',
              cantidad: 0,
              unidad: '',
              costoUnitario: 0,
              subtotal: 0,
            })}
            className="
              w-full py-3 border-2 border-dashed border-border-warm
              rounded-sm text-sm font-semibold text-text-muted
              hover:border-field-green hover:text-field-green
              transition-colors duration-300 min-h-[44px]
            "
          >
            + Agregar insumo
          </button>
        </div>

        {/* Costo manual */}
        <div className="flex flex-col gap-1">
          <Input
            label="Costo adicional (opcional)"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Ej: 8000"
            error={errors.costoManual?.message}
            {...register('costoManual')}
          />
          <p className="text-xs text-text-muted">
            Para servicios de terceros, mano de obra, u otros costos sin insumo de stock.
          </p>
        </div>

        {/* Responsable + Notas */}
        <Input
          label="Responsable (opcional)"
          placeholder="Ej: Juan Pérez"
          error={errors.responsable?.message}
          {...register('responsable')}
        />

        <Input
          label="Notas (opcional)"
          placeholder="Observaciones del evento..."
          error={errors.notas?.message}
          {...register('notas')}
        />

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 bg-parchment rounded-sm border border-border-warm">
          <span className="text-sm font-semibold text-text-dim">Costo total estimado</span>
          <span className="text-lg font-bold text-text-primary">{formatCurrency(total)}</span>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {/* Footer */}
        <div className="flex gap-3 pt-2 border-t border-border-warm">
          <Button type="button" variant="ghost" onClick={handleClose} className="flex-1" disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving} className="flex-1">
            {isEditing ? 'Guardar cambios' : 'Registrar evento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
