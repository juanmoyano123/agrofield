import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventoRodeoSchema } from '../../lib/validations/rodeo-schemas'
import type { CreateEventoRodeoSchema } from '../../lib/validations/rodeo-schemas'
import type { EventoRodeo } from '../../types'
import { Modal } from '../ui/modal'
import { Select } from '../ui/select'
import { DateInput } from '../ui/date-input'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Alert } from '../ui/alert'

interface RodeoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEventoRodeoSchema) => void
  evento?: EventoRodeo | null
  isSaving: boolean
  error: string | null
  onClearError: () => void
}

const TIPO_OPTIONS = [
  { value: 'pesaje',         label: 'Pesaje' },
  { value: 'vacunacion',     label: 'Vacunacion' },
  { value: 'desparasitacion',label: 'Desparasitacion' },
  { value: 'curacion',       label: 'Curacion' },
  { value: 'servicio_toro',  label: 'Servicio toro' },
  { value: 'inseminacion',   label: 'Inseminacion' },
  { value: 'tacto',          label: 'Tacto' },
  { value: 'paricion',       label: 'Paricion' },
  { value: 'destete',        label: 'Destete' },
  { value: 'ingreso',        label: 'Ingreso' },
  { value: 'egreso',         label: 'Egreso' },
  { value: 'muerte',         label: 'Muerte' },
]

const RESULTADO_TACTO_OPTIONS = [
  { value: 'prenada', label: 'Prenada' },
  { value: 'vacia',   label: 'Vacia' },
  { value: 'dudosa',  label: 'Dudosa' },
]

function getTodayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const defaultValues: CreateEventoRodeoSchema = {
  tipo: 'pesaje',
  fecha: getTodayISO(),
  cantidadCabezas: 1,
  responsable: '',
  notas: '',
}

export function RodeoFormModal({
  isOpen,
  onClose,
  onSubmit,
  evento,
  isSaving,
  error,
  onClearError,
}: RodeoFormModalProps) {
  const isEditing = Boolean(evento)
  const saveInitiated = useRef(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateEventoRodeoSchema>({
    resolver: zodResolver(createEventoRodeoSchema) as Resolver<CreateEventoRodeoSchema>,
    defaultValues,
  })

  // Watch tipo to show/hide conditional sections
  const watchedTipo = useWatch({ control, name: 'tipo' })

  // Derive conditional visibility from current tipo value
  const showPesaje       = watchedTipo === 'pesaje'
  const showSanidad      = ['vacunacion', 'desparasitacion', 'curacion'].includes(watchedTipo ?? '')
  const showTacto        = watchedTipo === 'tacto'
  const showParicionDestete = ['paricion', 'destete'].includes(watchedTipo ?? '')
  const showMovimiento   = ['ingreso', 'egreso', 'muerte'].includes(watchedTipo ?? '')

  // Populate form when editing an existing evento
  useEffect(() => {
    if (evento) {
      reset({
        tipo: evento.tipo,
        fecha: evento.fecha,
        cantidadCabezas: evento.cantidadCabezas,
        pesoPromedio: evento.pesoPromedio,
        productoSanitario: evento.productoSanitario ?? '',
        dosisMl: evento.dosisMl,
        loteSanitario: evento.loteSanitario ?? '',
        veterinario: evento.veterinario ?? '',
        proximaDosis: evento.proximaDosis ?? '',
        toroId: evento.toroId ?? '',
        resultadoTacto: evento.resultadoTacto,
        cantidadPreniadas: evento.cantidadPreniadas,
        cantidadVacias: evento.cantidadVacias,
        pesoDestete: evento.pesoDestete,
        motivo: evento.motivo ?? '',
        origenDestino: evento.origenDestino ?? '',
        precioUnitario: evento.precioUnitario,
        costoManual: evento.costoManual,
        responsable: evento.responsable ?? '',
        notas: evento.notas ?? '',
      })
    } else {
      reset({ ...defaultValues, fecha: getTodayISO() })
    }
  }, [evento, reset, isOpen])

  // Auto-close modal after successful save
  useEffect(() => {
    if (saveInitiated.current && !isSaving && !error) {
      saveInitiated.current = false
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving, error])

  function handleClose() {
    reset({ ...defaultValues, fecha: getTodayISO() })
    onClearError()
    onClose()
  }

  const onFormSubmit = (data: CreateEventoRodeoSchema) => {
    saveInitiated.current = true
    onSubmit(data)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar evento de rodeo' : 'Registrar evento de rodeo'}
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="flex flex-col gap-5">

        {/* Tipo + Fecha (always visible) */}
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

        {/* Cantidad cabezas (always visible) */}
        <Input
          label="Cantidad de cabezas"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          placeholder="Ej: 180"
          error={errors.cantidadCabezas?.message}
          {...register('cantidadCabezas')}
        />

        {/* --- PESAJE: pesoPromedio --- */}
        {showPesaje && (
          <div className="flex flex-col gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-sm">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Datos de pesaje</p>
            <Input
              label="Peso promedio por cabeza (kg)"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="Ej: 320"
              error={errors.pesoPromedio?.message}
              {...register('pesoPromedio')}
            />
          </div>
        )}

        {/* --- SANIDAD: vacunacion / desparasitacion / curacion --- */}
        {showSanidad && (
          <div className="flex flex-col gap-3 p-3 bg-red-50/50 border border-red-100 rounded-sm">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Datos sanitarios</p>
            <Input
              label="Producto sanitario"
              placeholder="Ej: Aftosa bivalente"
              error={errors.productoSanitario?.message}
              {...register('productoSanitario')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Dosis (ml)"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="Ej: 2"
                error={errors.dosisMl?.message}
                {...register('dosisMl')}
              />
              <Input
                label="Lote sanitario (opcional)"
                placeholder="Ej: LT-2025-A"
                error={errors.loteSanitario?.message}
                {...register('loteSanitario')}
              />
            </div>
            <Input
              label="Veterinario (opcional)"
              placeholder="Ej: Dr. Roberto Gomez"
              error={errors.veterinario?.message}
              {...register('veterinario')}
            />
            <DateInput
              label="Proxima dosis (opcional)"
              error={errors.proximaDosis?.message}
              {...register('proximaDosis')}
            />
          </div>
        )}

        {/* --- TACTO --- */}
        {showTacto && (
          <div className="flex flex-col gap-3 p-3 bg-pink-50/50 border border-pink-100 rounded-sm">
            <p className="text-xs font-bold text-pink-700 uppercase tracking-wide">Datos de tacto</p>
            <Select
              label="Resultado de tacto"
              options={[{ value: '', label: 'Seleccionar resultado...' }, ...RESULTADO_TACTO_OPTIONS]}
              error={errors.resultadoTacto?.message}
              {...register('resultadoTacto')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cantidad prenadas"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="Ej: 150"
                error={errors.cantidadPreniadas?.message}
                {...register('cantidadPreniadas')}
              />
              <Input
                label="Cantidad vacias"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="Ej: 30"
                error={errors.cantidadVacias?.message}
                {...register('cantidadVacias')}
              />
            </div>
            <Input
              label="Veterinario (opcional)"
              placeholder="Ej: Dr. Roberto Gomez"
              error={errors.veterinario?.message}
              {...register('veterinario')}
            />
          </div>
        )}

        {/* --- PARICION / DESTETE: pesoDestete --- */}
        {showParicionDestete && (
          <div className="flex flex-col gap-3 p-3 bg-pink-50/50 border border-pink-100 rounded-sm">
            <p className="text-xs font-bold text-pink-700 uppercase tracking-wide">
              {watchedTipo === 'paricion' ? 'Datos de paricion' : 'Datos de destete'}
            </p>
            <Input
              label="Peso al destete (kg, opcional)"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="Ej: 160"
              error={errors.pesoDestete?.message}
              {...register('pesoDestete')}
            />
          </div>
        )}

        {/* --- MOVIMIENTO: ingreso / egreso / muerte --- */}
        {showMovimiento && (
          <div className="flex flex-col gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-sm">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Datos de movimiento</p>
            <Input
              label="Motivo (opcional)"
              placeholder="Ej: Compra de novillos para reposicion"
              error={errors.motivo?.message}
              {...register('motivo')}
            />
            <Input
              label="Origen / Destino (opcional)"
              placeholder="Ej: Establecimiento La Esperanza"
              error={errors.origenDestino?.message}
              {...register('origenDestino')}
            />
            <Input
              label="Precio unitario por cabeza (opcional)"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="Ej: 180000"
              error={errors.precioUnitario?.message}
              {...register('precioUnitario')}
            />
          </div>
        )}

        {/* --- CAMPOS COMUNES: responsable, costo manual, notas --- */}
        <Input
          label="Responsable (opcional)"
          placeholder="Ej: Juan Perez"
          error={errors.responsable?.message}
          {...register('responsable')}
        />

        <Input
          label="Costo manual (opcional)"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="Ej: 54000"
          error={errors.costoManual?.message}
          {...register('costoManual')}
        />

        <Input
          label="Notas (opcional)"
          placeholder="Observaciones del evento..."
          error={errors.notas?.message}
          {...register('notas')}
        />

        {error && <Alert variant="error">{error}</Alert>}

        {/* Footer buttons */}
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
