import type { CategoriaProducto } from '../../types'
import { Select } from '../ui/select'

interface StockFiltersProps {
  filterCategoria: CategoriaProducto | ''
  searchQuery: string
  onCategoriaChange: (categoria: CategoriaProducto | '') => void
  onSearchChange: (query: string) => void
}

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'semilla', label: 'Semillas' },
  { value: 'herbicida', label: 'Herbicidas' },
  { value: 'insecticida', label: 'Insecticidas' },
  { value: 'fertilizante', label: 'Fertilizantes' },
  { value: 'otro', label: 'Otros' },
]

export function StockFilters({
  filterCategoria,
  searchQuery,
  onCategoriaChange,
  onSearchChange,
}: StockFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end p-4 bg-parchment rounded-sm border border-border-warm">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-semibold text-text-primary mb-1">
          Buscar producto
        </label>
        <input
          type="search"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Nombre del insumo..."
          className="
            w-full px-3 py-2.5 min-h-[44px]
            rounded-sm border border-border-warm-strong bg-surface
            text-base text-text-primary placeholder-text-muted
            focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green
            transition-colors duration-300
          "
        />
      </div>
      <div className="min-w-[180px] flex-1">
        <Select
          label="Categoría"
          options={CATEGORIA_OPTIONS}
          value={filterCategoria}
          onChange={e => onCategoriaChange(e.target.value as CategoriaProducto | '')}
        />
      </div>
    </div>
  )
}
