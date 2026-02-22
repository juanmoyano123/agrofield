import type { CategoriaRodeo } from '../../types'
import { Select } from '../ui/select'
import { DateInput } from '../ui/date-input'
import { Button } from '../ui/button'

interface RodeoFiltersProps {
  filterCategoria: CategoriaRodeo | ''
  filterFechaDesde: string
  filterFechaHasta: string
  onCategoriaChange: (categoria: CategoriaRodeo | '') => void
  onFechaDesdeChange: (fecha: string) => void
  onFechaHastaChange: (fecha: string) => void
  onClear: () => void
}

const CATEGORIA_OPTIONS = [
  { value: '',            label: 'Todas las categorias' },
  { value: 'pesaje',      label: 'Pesaje' },
  { value: 'sanidad',     label: 'Sanidad' },
  { value: 'reproduccion',label: 'Reproduccion' },
  { value: 'movimiento',  label: 'Movimiento' },
]

export function RodeoFilters({
  filterCategoria,
  filterFechaDesde,
  filterFechaHasta,
  onCategoriaChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClear,
}: RodeoFiltersProps) {
  const hasFilters = filterCategoria !== '' || filterFechaDesde !== '' || filterFechaHasta !== ''

  return (
    <div className="flex flex-wrap gap-3 items-end p-4 bg-parchment rounded-sm border border-border-warm">
      <div className="min-w-[180px] flex-1">
        <Select
          label="Categoria"
          options={CATEGORIA_OPTIONS}
          value={filterCategoria}
          onChange={e => onCategoriaChange(e.target.value as CategoriaRodeo | '')}
        />
      </div>

      <div className="min-w-[140px] flex-1">
        <DateInput
          label="Desde"
          value={filterFechaDesde}
          onChange={e => onFechaDesdeChange(e.target.value)}
        />
      </div>

      <div className="min-w-[140px] flex-1">
        <DateInput
          label="Hasta"
          value={filterFechaHasta}
          onChange={e => onFechaHastaChange(e.target.value)}
        />
      </div>

      {hasFilters && (
        <div className="self-end">
          <Button type="button" variant="ghost" size="default" onClick={onClear}>
            Limpiar
          </Button>
        </div>
      )}
    </div>
  )
}
