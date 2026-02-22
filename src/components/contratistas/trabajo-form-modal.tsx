import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import { createTrabajoSchema } from '../../lib/validations/contratista-schemas'
import type { CreateTrabajoFormData } from '../../lib/validations/contratista-schemas'
import type { TrabajoContratista, Contratista, Lote } from '../../types'

interface TrabajoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTrabajoFormData) => Promise<void>
  trabajo?: TrabajoContratista | null
  isSaving: boolean
  contratistas: Contratista[]
  lotes: Lote[]
  onCreateContratista: (nombre: string) => Promise<Contratista | null>
}

const tipoOptions = [
  { value: 'arado', label: 'Arado' },
  { value: 'siembra', label: 'Siembra' },
  { value: 'cosecha', label: 'Cosecha' },
  { value: 'pulverizacion', label: 'Pulverización' },
  { value: 'otro', label: 'Otro' },
]

const estadoOptions = [
  { value: 'completado', label: 'Completado' },
  { value: 'programado', label: 'Programado' },
]

// Today's date in YYYY-MM-DD format for the date input default
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function TrabajoFormModal({
  isOpen,
  onClose,
  onSubmit,
  trabajo,
  isSaving,
  contratistas,
  lotes,
  onCreateContratista,
}: TrabajoFormModalProps) {
  const isEditing = Boolean(trabajo)

  // State to handle "new contratista" inline creation
  const [showNuevoContratista, setShowNuevoContratista] = useState(false)
  const [nuevoContratistaName, setNuevoContratistaName] = useState('')
  const [isCreatingContratista, setIsCreatingContratista] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTrabajoFormData>({
    resolver: zodResolver(createTrabajoSchema) as Resolver<CreateTrabajoFormData>,
    defaultValues: {
      tipo: 'arado',
      contratistaId: '',
      contratistaNombre: '',
      loteId: '',
      loteNombre: '',
      costo: undefined,
      fecha: getTodayDate(),
      notas: '',
      estado: 'completado',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (trabajo) {
      reset({
        tipo: trabajo.tipo,
        contratistaId: trabajo.contratistaId,
        contratistaNombre: trabajo.contratistaNombre,
        loteId: trabajo.loteId ?? '',
        loteNombre: trabajo.loteNombre ?? '',
        costo: trabajo.costo,
        fecha: trabajo.fecha,
        notas: trabajo.notas ?? '',
        estado: trabajo.estado,
      })
    } else {
      reset({
        tipo: 'arado',
        contratistaId: '',
        contratistaNombre: '',
        loteId: '',
        loteNombre: '',
        costo: undefined,
        fecha: getTodayDate(),
        notas: '',
        estado: 'completado',
      })
    }
    setShowNuevoContratista(false)
    setNuevoContratistaName('')
  }, [trabajo, reset, isOpen])

  // Build contratista select options including a "new" sentinel value
  const contratistaOptions = [
    ...contratistas.map(c => ({ value: c.id, label: c.nombre })),
    { value: '__nuevo__', label: '+ Nuevo contratista...' },
  ]

  // Build lote select options
  const loteOptions = [
    { value: '', label: 'Sin lote (gasto general)' },
    ...lotes.filter(l => !l.deletedAt).map(l => ({ value: l.id, label: l.nombre })),
  ]

  const selectedContratistaId = watch('contratistaId')

  // When contratista select changes, update contratistaNombre accordingly
  function handleContratistaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value
    if (selectedId === '__nuevo__') {
      setShowNuevoContratista(true)
      setValue('contratistaId', '')
      setValue('contratistaNombre', '')
    } else {
      setShowNuevoContratista(false)
      setValue('contratistaId', selectedId)
      const found = contratistas.find(c => c.id === selectedId)
      setValue('contratistaNombre', found?.nombre ?? '')
    }
  }

  // When lote select changes, update loteNombre accordingly
  function handleLoteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value
    setValue('loteId', selectedId)
    const found = lotes.find(l => l.id === selectedId)
    setValue('loteNombre', found?.nombre ?? '')
  }

  async function handleCreateContratista() {
    if (!nuevoContratistaName.trim()) return
    setIsCreatingContratista(true)
    const created = await onCreateContratista(nuevoContratistaName.trim())
    setIsCreatingContratista(false)
    if (created) {
      setValue('contratistaId', created.id)
      setValue('contratistaNombre', created.nombre)
      setShowNuevoContratista(false)
      setNuevoContratistaName('')
    }
  }

  async function handleFormSubmit(data: CreateTrabajoFormData) {
    await onSubmit(data)
    reset()
    setShowNuevoContratista(false)
  }

  function handleClose() {
    reset()
    setShowNuevoContratista(false)
    setNuevoContratistaName('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar trabajo' : 'Registrar trabajo'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-4">
        {/* Tipo de trabajo */}
        <Select
          label="Tipo de trabajo"
          options={tipoOptions}
          error={errors.tipo?.message}
          {...register('tipo')}
        />

        {/* Contratista */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-text-primary">Contratista</label>
          <select
            value={showNuevoContratista ? '__nuevo__' : (selectedContratistaId || '')}
            onChange={handleContratistaChange}
            aria-label="Seleccionar contratista"
            className={`
              w-full px-3 py-3 border rounded-sm bg-surface
              text-base text-text-primary
              hover:border-copper-light
              focus:outline-none focus:ring-2 focus:border-transparent
              min-h-[44px]
              transition-colors duration-300
              ${errors.contratistaId
                ? 'border-error focus:ring-error'
                : 'border-border-warm-strong focus:ring-field-green'
              }
            `}
          >
            <option value="">Seleccioná un contratista</option>
            {contratistaOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.contratistaId && (
            <p className="text-sm text-error" role="alert" aria-live="polite">
              {errors.contratistaId.message}
            </p>
          )}
        </div>

        {/* Inline new contratista creation */}
        {showNuevoContratista && (
          <div className="flex gap-2 items-end p-3 bg-parchment border border-border-warm rounded-sm">
            <div className="flex-1">
              <Input
                label="Nombre del nuevo contratista"
                placeholder="Ej: Juan Diaz"
                value={nuevoContratistaName}
                onChange={e => setNuevoContratistaName(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleCreateContratista}
              isLoading={isCreatingContratista}
              disabled={!nuevoContratistaName.trim()}
            >
              Agregar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowNuevoContratista(false)
                setNuevoContratistaName('')
              }}
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* Lote (opcional) */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-text-primary">Lote (opcional)</label>
          <select
            value={watch('loteId') ?? ''}
            onChange={handleLoteChange}
            aria-label="Seleccionar lote"
            className="
              w-full px-3 py-3 border border-border-warm-strong rounded-sm bg-surface
              text-base text-text-primary
              hover:border-copper-light
              focus:outline-none focus:ring-2 focus:ring-field-green focus:border-transparent
              min-h-[44px]
              transition-colors duration-300
            "
          >
            {loteOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Costo */}
        <Input
          label="Costo ($)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Ej: 2500"
          error={errors.costo?.message}
          {...register('costo', { valueAsNumber: true })}
        />

        {/* Fecha */}
        <Input
          label="Fecha"
          type="date"
          error={errors.fecha?.message}
          {...register('fecha')}
        />

        {/* Estado */}
        <Select
          label="Estado"
          options={estadoOptions}
          error={errors.estado?.message}
          {...register('estado')}
        />

        {/* Notas (opcional) */}
        <Input
          label="Notas (opcional)"
          placeholder="Ej: Arado profundo pre-siembra"
          error={errors.notas?.message}
          {...register('notas')}
        />

        {/* Footer actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-border-warm mt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {isEditing ? 'Guardar cambios' : 'Registrar trabajo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
