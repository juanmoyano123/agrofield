/**
 * F-027: CampanaFormModal — Modal to create or edit a Campaña.
 *
 * Fields: nombre, fechaInicio, fechaFin.
 * Validation: fechaFin > fechaInicio, nombre not empty.
 * Auto-suggests nombre based on date range using suggestCampanaNombre().
 */

import { useState, useEffect } from 'react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import type { Campana } from '../../types'
import { suggestCampanaNombre } from '../../lib/comparativa-utils'

interface CampanaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Campana, 'id' | 'createdAt'>) => void
  editingCampana?: Campana | null
}

export function CampanaFormModal({ isOpen, onClose, onSave, editingCampana }: CampanaFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [nombreTouched, setNombreTouched] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editingCampana) {
      setNombre(editingCampana.nombre)
      setFechaInicio(editingCampana.fechaInicio)
      setFechaFin(editingCampana.fechaFin)
    } else {
      setNombre('')
      setFechaInicio('')
      setFechaFin('')
    }
    setErrors({})
    setNombreTouched(false)
  }, [editingCampana, isOpen])

  // Auto-suggest nombre when both dates are set and nombre hasn't been manually touched
  useEffect(() => {
    if (!nombreTouched && fechaInicio && fechaFin && !editingCampana) {
      setNombre(suggestCampanaNombre(fechaInicio, fechaFin))
    }
  }, [fechaInicio, fechaFin, nombreTouched, editingCampana])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    if (!fechaInicio) errs.fechaInicio = 'La fecha de inicio es obligatoria'
    if (!fechaFin) errs.fechaFin = 'La fecha de fin es obligatoria'
    if (fechaInicio && fechaFin && fechaFin <= fechaInicio) {
      errs.fechaFin = 'La fecha de fin debe ser posterior al inicio'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ nombre: nombre.trim(), fechaInicio, fechaFin })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCampana ? 'Editar campaña' : 'Nueva campaña'}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          Definí un rango de fechas para tu campaña. Ejemplo: "Campaña 2024/25" — Sep 2024 a Abr 2025.
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="campana-inicio" className="text-sm font-semibold text-text-primary">
            Fecha de inicio
          </label>
          <input
            id="campana-inicio"
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            className={`
              w-full px-3 py-3 border rounded-sm bg-surface
              text-base text-text-primary
              hover:border-copper-light
              focus:outline-none focus:ring-2 focus:border-transparent
              min-h-[44px] transition-colors duration-300
              ${errors.fechaInicio
                ? 'border-error focus:ring-error'
                : 'border-border-warm-strong focus:ring-field-green'
              }
            `}
          />
          {errors.fechaInicio && (
            <p className="text-sm text-error">{errors.fechaInicio}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="campana-fin" className="text-sm font-semibold text-text-primary">
            Fecha de fin
          </label>
          <input
            id="campana-fin"
            type="date"
            value={fechaFin}
            min={fechaInicio || undefined}
            onChange={e => setFechaFin(e.target.value)}
            className={`
              w-full px-3 py-3 border rounded-sm bg-surface
              text-base text-text-primary
              hover:border-copper-light
              focus:outline-none focus:ring-2 focus:border-transparent
              min-h-[44px] transition-colors duration-300
              ${errors.fechaFin
                ? 'border-error focus:ring-error'
                : 'border-border-warm-strong focus:ring-field-green'
              }
            `}
          />
          {errors.fechaFin && (
            <p className="text-sm text-error">{errors.fechaFin}</p>
          )}
        </div>

        <Input
          label="Nombre de la campaña"
          id="campana-nombre"
          value={nombre}
          onChange={e => { setNombre(e.target.value); setNombreTouched(true) }}
          placeholder="ej: Campaña 2024/25"
          error={errors.nombre}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editingCampana ? 'Guardar cambios' : 'Crear campaña'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
