import type { Contratista, Lote } from '../../types'

interface TrabajosFilterBarProps {
  contratistas: Contratista[]
  lotes: Lote[]
  filterContratista: string
  filterLote: string
  filterFechaDesde: string
  filterFechaHasta: string
  totalGastos: number
  onFilterContratista: (id: string) => void
  onFilterLote: (id: string) => void
  onFilterFechaDesde: (fecha: string) => void
  onFilterFechaHasta: (fecha: string) => void
}

export function TrabajosFilterBar({
  contratistas,
  lotes,
  filterContratista,
  filterLote,
  filterFechaDesde,
  filterFechaHasta,
  totalGastos,
  onFilterContratista,
  onFilterLote,
  onFilterFechaDesde,
  onFilterFechaHasta,
}: TrabajosFilterBarProps) {
  const selectClass = `
    px-3 py-2.5 border border-border-warm-strong rounded-sm bg-surface
    text-sm text-text-primary
    hover:border-copper-light
    focus:outline-none focus:ring-2 focus:ring-field-green focus:border-transparent
    min-h-[44px]
    transition-colors duration-300
    flex-1 min-w-0
  `

  const inputClass = `
    px-3 py-2.5 border border-border-warm-strong rounded-sm bg-surface
    text-sm text-text-primary
    hover:border-copper-light
    focus:outline-none focus:ring-2 focus:ring-field-green focus:border-transparent
    min-h-[44px]
    transition-colors duration-300
    flex-1 min-w-0
  `

  return (
    <div className="flex flex-col gap-3">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Contratista filter */}
        <select
          value={filterContratista}
          onChange={e => onFilterContratista(e.target.value)}
          aria-label="Filtrar por contratista"
          className={selectClass}
        >
          <option value="">Todos los contratistas</option>
          {contratistas.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        {/* Lote filter */}
        <select
          value={filterLote}
          onChange={e => onFilterLote(e.target.value)}
          aria-label="Filtrar por lote"
          className={selectClass}
        >
          <option value="">Todos los lotes</option>
          <option value="__ninguno__">Gasto general (sin lote)</option>
          {lotes.map(l => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>

        {/* Fecha desde */}
        <input
          type="date"
          value={filterFechaDesde}
          onChange={e => onFilterFechaDesde(e.target.value)}
          aria-label="Fecha desde"
          className={inputClass}
        />

        {/* Fecha hasta */}
        <input
          type="date"
          value={filterFechaHasta}
          onChange={e => onFilterFechaHasta(e.target.value)}
          aria-label="Fecha hasta"
          className={inputClass}
        />
      </div>

      {/* Total gastos display */}
      <div className="flex justify-end">
        <span className="text-sm text-text-muted">
          Total:{' '}
          <span className="font-bold text-text-primary text-base">
            ${totalGastos.toLocaleString('es-AR')}
          </span>
        </span>
      </div>
    </div>
  )
}
