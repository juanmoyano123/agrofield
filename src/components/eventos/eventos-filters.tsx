import type { TipoEvento } from '../../types'
import { Select } from '../ui/select'
import { DateInput } from '../ui/date-input'
import { Button } from '../ui/button'

interface EventosFiltersProps {
  filterTipo: TipoEvento | ''
  filterFechaDesde: string
  filterFechaHasta: string
  onTipoChange: (tipo: TipoEvento | '') => void
  onFechaDesdeChange: (fecha: string) => void
  onFechaHastaChange: (fecha: string) => void
  onClear: () => void
}

const TIPO_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'siembra', label: 'Siembra' },
  { value: 'aplicacion', label: 'Aplicación' },
  { value: 'cosecha', label: 'Cosecha' },
  { value: 'monitoreo', label: 'Monitoreo' },
  { value: 'servicio', label: 'Servicio / Contratista' },
  { value: 'riego', label: 'Riego' },
  { value: 'otro', label: 'Otro' },
]

export function EventosFilters({
  filterTipo,
  filterFechaDesde,
  filterFechaHasta,
  onTipoChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClear,
}: EventosFiltersProps) {
  const hasFilters = filterTipo !== '' || filterFechaDesde !== '' || filterFechaHasta !== ''

  return (
    <div className="flex flex-wrap gap-3 items-end p-4 bg-parchment rounded-sm border border-border-warm">
      <div className="min-w-[160px] flex-1">
        <Select
          label="Tipo"
          options={TIPO_OPTIONS}
          value={filterTipo}
          onChange={e => onTipoChange(e.target.value as TipoEvento | '')}
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
