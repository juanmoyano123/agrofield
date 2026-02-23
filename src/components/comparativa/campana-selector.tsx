/**
 * F-027: CampanaSelector — List of available campañas with checkboxes.
 *
 * - Checkboxes for selecting up to 4 campañas simultaneously
 * - "Nueva campaña" button opens the CampanaFormModal
 * - Edit/delete actions per campaña
 * - Disables checkbox when 4 are already selected and this one isn't selected
 */

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { Campana } from '../../types'
import { getCampanaColor } from '../../lib/comparativa-utils'
import { useCampanasStore } from '../../stores/campanas-store'
import { CampanaFormModal } from './campana-form-modal'
import { ConfirmDialog } from '../ui/confirm-dialog'

interface CampanaSelectorProps {
  selectedIds: string[]
  onToggle: (id: string) => void
}

const MAX_SELECTED = 4

function formatDateRange(inicio: string, fin: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }
  const fmt = (d: string) => {
    const [y, m, day] = d.split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString('es-AR', opts)
  }
  return `${fmt(inicio)} – ${fmt(fin)}`
}

export function CampanaSelector({ selectedIds, onToggle }: CampanaSelectorProps) {
  const campanas = useCampanasStore(s => s.campanas)
  const addCampana = useCampanasStore(s => s.addCampana)
  const updateCampana = useCampanasStore(s => s.updateCampana)
  const deleteCampana = useCampanasStore(s => s.deleteCampana)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampana, setEditingCampana] = useState<Campana | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleSave(data: Omit<Campana, 'id' | 'createdAt'>) {
    if (editingCampana) {
      updateCampana(editingCampana.id, data)
    } else {
      addCampana(data)
    }
    setEditingCampana(null)
  }

  function handleEdit(campana: Campana) {
    setEditingCampana(campana)
    setIsModalOpen(true)
  }

  function handleDeleteConfirm() {
    if (deletingId) {
      deleteCampana(deletingId)
      setDeletingId(null)
    }
  }

  const selectedCount = selectedIds.length

  return (
    <div className="bg-surface rounded-sm border border-border-warm shadow-warm-sm p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-text-primary font-display">
            Campañas
          </h2>
          <p className="text-xs text-text-muted">
            Seleccioná hasta {MAX_SELECTED} campañas para comparar
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditingCampana(null); setIsModalOpen(true) }}
          className="
            flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-semibold
            bg-field-green text-white
            hover:bg-field-green-dark
            transition-colors duration-200
            min-h-[36px]
          "
        >
          <Plus size={14} />
          Nueva campaña
        </button>
      </div>

      {campanas.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-4">
          Aún no hay campañas. Creá la primera con el botón "Nueva campaña".
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {campanas.map((campana, index) => {
            const isSelected = selectedIds.includes(campana.id)
            const isDisabled = !isSelected && selectedCount >= MAX_SELECTED
            const color = getCampanaColor(selectedIds.indexOf(campana.id) !== -1
              ? selectedIds.indexOf(campana.id)
              : index)

            return (
              <div
                key={campana.id}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-sm border
                  transition-colors duration-200
                  ${isSelected
                    ? 'border-field-green bg-field-green/5'
                    : 'border-border-warm bg-parchment/30'
                  }
                `}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  id={`campana-${campana.id}`}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onToggle(campana.id)}
                  title={isDisabled ? 'Máximo 4 campañas' : undefined}
                  className="w-4 h-4 rounded accent-field-green cursor-pointer disabled:cursor-not-allowed"
                />

                {/* Color indicator */}
                {isSelected && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}

                {/* Campaña info */}
                <label
                  htmlFor={`campana-${campana.id}`}
                  className={`flex-1 min-w-0 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <span className="block text-sm font-semibold text-text-primary truncate">
                    {campana.nombre}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {formatDateRange(campana.fechaInicio, campana.fechaFin)}
                  </span>
                </label>

                {/* Edit / Delete actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(campana)}
                    aria-label={`Editar ${campana.nombre}`}
                    className="p-1.5 text-text-muted hover:text-field-green rounded-sm transition-colors duration-200"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(campana.id)}
                    aria-label={`Eliminar ${campana.nombre}`}
                    className="p-1.5 text-text-muted hover:text-error rounded-sm transition-colors duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Limit hint when at max */}
      {selectedCount >= MAX_SELECTED && (
        <p className="text-xs text-text-muted mt-2 text-center">
          Máximo {MAX_SELECTED} campañas seleccionadas
        </p>
      )}

      {/* Create / Edit modal */}
      <CampanaFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCampana(null) }}
        onSave={handleSave}
        editingCampana={editingCampana}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Eliminar campaña"
        message="¿Estás seguro de que querés eliminar esta campaña? Se removerá de cualquier comparativa activa."
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
