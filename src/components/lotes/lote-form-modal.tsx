import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import { createLoteSchema } from '../../lib/validations/lote-schemas'
import type { CreateLoteFormData } from '../../lib/validations/lote-schemas'
import type { Lote } from '../../types'

interface LoteFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLoteFormData) => Promise<void>
  lote?: Lote | null
  isSaving: boolean
}

const actividadOptions = [
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'ganaderia', label: 'Ganadería' },
]

export function LoteFormModal({ isOpen, onClose, onSubmit, lote, isSaving }: LoteFormModalProps) {
  const isEditing = Boolean(lote)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLoteFormData>({
    resolver: zodResolver(createLoteSchema),
    defaultValues: {
      nombre: '',
      hectareas: undefined,
      actividad: 'agricultura',
      ubicacion: '',
      latitud: undefined,
      longitud: undefined,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (lote) {
      reset({
        nombre: lote.nombre,
        hectareas: lote.hectareas,
        actividad: lote.actividad,
        ubicacion: lote.ubicacion ?? '',
        latitud: lote.latitud,
        longitud: lote.longitud,
      })
    } else {
      reset({
        nombre: '',
        hectareas: undefined,
        actividad: 'agricultura',
        ubicacion: '',
        latitud: undefined,
        longitud: undefined,
      })
    }
  }, [lote, reset, isOpen])

  async function handleFormSubmit(data: CreateLoteFormData) {
    await onSubmit(data)
    reset()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar lote' : 'Nuevo lote'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-4">
        {/* Nombre */}
        <Input
          label="Nombre del lote"
          placeholder="Ej: Lote Norte"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        {/* Superficie */}
        <Input
          label="Superficie (hectáreas)"
          type="number"
          step="0.1"
          min="0.1"
          max="10000"
          placeholder="Ej: 120"
          error={errors.hectareas?.message}
          {...register('hectareas', { valueAsNumber: true })}
        />

        {/* Actividad */}
        <Select
          label="Actividad"
          options={actividadOptions}
          error={errors.actividad?.message}
          {...register('actividad')}
        />

        {/* Ubicacion (opcional) */}
        <Input
          label="Ubicación (opcional)"
          placeholder="Ej: Sector norte del campo"
          error={errors.ubicacion?.message}
          {...register('ubicacion')}
        />

        {/* Coordenadas (opcionales) */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitud (opcional)"
            type="number"
            step="any"
            placeholder="Ej: -34.60"
            error={errors.latitud?.message}
            {...register('latitud', { setValueAs: (v: string) => (v === '' ? undefined : parseFloat(v)) })}
          />
          <Input
            label="Longitud (opcional)"
            type="number"
            step="any"
            placeholder="Ej: -58.38"
            error={errors.longitud?.message}
            {...register('longitud', { setValueAs: (v: string) => (v === '' ? undefined : parseFloat(v)) })}
          />
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-neutral-200 mt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {isEditing ? 'Guardar cambios' : 'Crear lote'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
