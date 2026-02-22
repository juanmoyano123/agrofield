import type { Proveedor } from '../../types'
import { Select } from '../ui/select'
import { Input } from '../ui/input'
import { DateInput } from '../ui/date-input'
import { Button } from '../ui/button'

interface ComprasFiltersProps {
  proveedores: Proveedor[]
  proveedorId: string
  onProveedorChange: (value: string) => void
  productoQuery: string
  onProductoQueryChange: (value: string) => void
  fechaDesde: string
  onFechaDesdeChange: (value: string) => void
  fechaHasta: string
  onFechaHastaChange: (value: string) => void
  moneda: string
  onMonedaChange: (value: string) => void
  onClear: () => void
}

const MONEDA_OPTIONS = [
  { value: '', label: 'Todas las monedas' },
  { value: 'ARS', label: 'ARS (Pesos)' },
  { value: 'USD', label: 'USD (Dólares)' },
]

export function ComprasFilters({
  proveedores,
  proveedorId,
  onProveedorChange,
  productoQuery,
  onProductoQueryChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  moneda,
  onMonedaChange,
  onClear,
}: ComprasFiltersProps) {
  const proveedorOptions = [
    { value: '', label: 'Todos los proveedores' },
    ...proveedores.map(p => ({ value: p.id, label: p.name })),
  ]

  return (
    <div className="flex flex-wrap gap-3 items-end p-4 bg-parchment rounded-sm border border-border-warm">
      <div className="min-w-[180px] flex-1">
        <Select
          label="Proveedor"
          options={proveedorOptions}
          value={proveedorId}
          onChange={e => onProveedorChange(e.target.value)}
        />
      </div>

      <div className="min-w-[160px] flex-1">
        <Input
          label="Producto"
          type="text"
          placeholder="Buscar producto..."
          value={productoQuery}
          onChange={e => onProductoQueryChange(e.target.value)}
        />
      </div>

      <div className="min-w-[140px] flex-1">
        <DateInput
          label="Desde"
          value={fechaDesde}
          onChange={e => onFechaDesdeChange(e.target.value)}
        />
      </div>

      <div className="min-w-[140px] flex-1">
        <DateInput
          label="Hasta"
          value={fechaHasta}
          onChange={e => onFechaHastaChange(e.target.value)}
        />
      </div>

      <div className="min-w-[160px] flex-1">
        <Select
          label="Moneda"
          options={MONEDA_OPTIONS}
          value={moneda}
          onChange={e => onMonedaChange(e.target.value)}
        />
      </div>

      <div className="self-end">
        <Button
          type="button"
          variant="ghost"
          size="default"
          onClick={onClear}
        >
          Limpiar
        </Button>
      </div>
    </div>
  )
}
