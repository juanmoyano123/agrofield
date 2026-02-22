import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import { createLoteSchema } from '../../lib/validations/lote-schemas'
import type { CreateLoteFormData, CreateLoteOutputData } from '../../lib/validations/lote-schemas'
import type { Lote, TipoProduccionGanadera } from '../../types'

interface LoteFormModalProps {
  isOpen: boolean
  onClose: () => void
  // onSubmit receives the post-transform output (empty strings cleaned, livestock fields cleared
  // when actividad != 'ganaderia') which is type-compatible with store's CreateLoteData
  onSubmit: (data: CreateLoteOutputData) => Promise<void>
  lote?: Lote | null
  isSaving: boolean
}

const actividadOptions = [
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'ganaderia', label: 'Ganadería' },
]

// F-021: Options for livestock production type select
const tipoProduccionOptions = [
  { value: 'cria', label: 'Cría' },
  { value: 'recria', label: 'Recría' },
  { value: 'engorde', label: 'Engorde' },
  { value: 'tambo', label: 'Tambo' },
]

export function LoteFormModal({ isOpen, onClose, onSubmit, lote, isSaving }: LoteFormModalProps) {
  const isEditing = Boolean(lote)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateLoteFormData, unknown, CreateLoteOutputData>({
    resolver: zodResolver(createLoteSchema),
    defaultValues: {
      nombre: '',
      hectareas: undefined,
      actividad: 'agricultura',
      ubicacion: '',
      latitud: undefined,
      longitud: undefined,
      // F-021: Livestock default values
      cabezas: undefined,
      raza: '',
      tipoProduccion: '' as TipoProduccionGanadera | '',
      categoriaAnimal: '',
    },
  })

  // Watch actividad to conditionally show livestock fields
  const actividad = watch('actividad')

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
        // F-021: Populate livestock fields when editing
        cabezas: lote.cabezas,
        raza: lote.raza ?? '',
        tipoProduccion: lote.tipoProduccion ?? '',
        categoriaAnimal: lote.categoriaAnimal ?? '',
      })
    } else {
      reset({
        nombre: '',
        hectareas: undefined,
        actividad: 'agricultura',
        ubicacion: '',
        latitud: undefined,
        longitud: undefined,
        // F-021: Livestock default values for new lote
        cabezas: undefined,
        raza: '',
        tipoProduccion: '' as TipoProduccionGanadera | '',
        categoriaAnimal: '',
      })
    }
  }, [lote, reset, isOpen])

  async function handleFormSubmit(data: CreateLoteOutputData) {
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

        {/* F-021: Livestock fields — shown only when actividad is ganaderia */}
        {actividad === 'ganaderia' && (
          <div className="flex flex-col gap-3 p-4 bg-parchment rounded-sm border border-border-warm">
            <p className="text-sm font-semibold text-text-primary">Datos del rodeo</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cabezas"
                type="number"
                step="1"
                min="1"
                placeholder="Ej: 150"
                error={errors.cabezas?.message}
                {...register('cabezas', { valueAsNumber: true })}
              />
              <Select
                label="Tipo de producción"
                options={tipoProduccionOptions}
                error={errors.tipoProduccion?.message}
                {...register('tipoProduccion')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Raza predominante"
                placeholder="Ej: Angus"
                error={errors.raza?.message}
                {...register('raza')}
              />
              <Input
                label="Categoría"
                placeholder="Ej: Vacas de cría"
                error={errors.categoriaAnimal?.message}
                {...register('categoriaAnimal')}
              />
            </div>
          </div>
        )}

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
        <div className="flex gap-3 justify-end pt-2 border-t border-border-warm mt-2">
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
