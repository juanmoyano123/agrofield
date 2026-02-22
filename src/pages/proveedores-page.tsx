import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { useCompras } from '../hooks/use-compras'
import { ProveedorCard } from '../components/proveedores/proveedor-card'
import { ProveedorDetailModal } from '../components/proveedores/proveedor-detail-modal'
import { EmptyState } from '../components/ui/empty-state'
import { Alert } from '../components/ui/alert'
import { Spinner } from '../components/ui/spinner'
import { Button } from '../components/ui/button'
import { computeProveedorStats } from '../components/proveedores/proveedor-card'
import { toCsvString, downloadCsv, getCsvFilename } from '../lib/csv-export'
import type { Proveedor } from '../types'

type SortField = 'nombre' | 'total' | 'compras'

export function ProveedoresPage() {
  const { user } = useAuth()
  const { proveedores, compras, isLoading, error, fetchProveedores, fetchCompras, clearError } = useCompras()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('total')
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)

  useEffect(() => {
    if (!user) return
    void fetchProveedores(user.tenantId)
    void fetchCompras(user.tenantId)
  }, [user, fetchProveedores, fetchCompras])

  const filteredProveedores = useMemo(() => {
    let result = [...proveedores]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.telefono ?? '').toLowerCase().includes(q),
      )
    }

    return result.sort((a, b) => {
      if (sortField === 'nombre') return a.name.localeCompare(b.name, 'es')
      const statsA = computeProveedorStats(compras, a.id)
      const statsB = computeProveedorStats(compras, b.id)
      if (sortField === 'total') return statsB.totalARS - statsA.totalARS
      return statsB.cantidadCompras - statsA.cantidadCompras
    })
  }, [proveedores, compras, searchQuery, sortField])

  const totalGastoARS = useMemo(
    () => compras.filter(c => c.moneda === 'ARS').reduce((s, c) => s + c.total, 0),
    [compras],
  )

  function handleExportCsv() {
    const csv = toCsvString(filteredProveedores, [
      { header: 'Nombre', accessor: p => p.name },
      { header: 'Telefono', accessor: p => p.telefono ?? '' },
      { header: 'Total compras', accessor: p => computeProveedorStats(compras, p.id).cantidadCompras },
      { header: 'Total ARS', accessor: p => computeProveedorStats(compras, p.id).totalARS },
      { header: 'Total USD', accessor: p => computeProveedorStats(compras, p.id).totalUSD },
    ])
    downloadCsv(csv, getCsvFilename('proveedores'))
  }

  function sortLabel(field: SortField, label: string) {
    return (
      <button
        type="button"
        onClick={() => setSortField(field)}
        className={`
          px-3 py-1 rounded-sm transition-colors duration-300 min-h-[36px] text-sm
          ${sortField === field
            ? 'bg-field-green text-white'
            : 'bg-surface hover:bg-parchment text-text-dim border border-border-warm'
          }
        `}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
            Proveedores
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {proveedores.length > 0
              ? `${proveedores.length} proveedor${proveedores.length > 1 ? 'es' : ''}`
              : 'Historial de compras por proveedor'}
          </p>
        </div>

        {filteredProveedores.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleExportCsv}
              disabled={filteredProveedores.length === 0}
            >
              <Download size={16} /> Exportar CSV
            </Button>
            {totalGastoARS > 0 && (
              <div className="flex flex-col items-end">
                <p className="text-xs text-text-muted uppercase tracking-wide">Gasto total ARS</p>
                <p className="text-lg font-bold text-text-primary">
                  {totalGastoARS.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="error">
          {error}
          <button type="button" onClick={clearError} className="ml-2 underline text-xs">Cerrar</button>
        </Alert>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Search + Sort */}
          {proveedores.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar proveedor..."
                  className="
                    w-full px-3 py-2.5 min-h-[44px]
                    rounded-sm border border-border-warm-strong bg-surface
                    text-base text-text-primary placeholder-text-muted
                    focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green
                    transition-colors duration-300
                  "
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="shrink-0">Ordenar:</span>
                {sortLabel('total', 'Gasto')}
                {sortLabel('compras', 'Compras')}
                {sortLabel('nombre', 'Nombre')}
              </div>
            </div>
          )}

          {/* Grid */}
          {filteredProveedores.length === 0 ? (
            <EmptyState
              icon="🤝"
              title="Sin proveedores"
              description="Los proveedores se crean automáticamente al registrar una compra."
              action={undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProveedores.map(proveedor => (
                <ProveedorCard
                  key={proveedor.id}
                  proveedor={proveedor}
                  compras={compras}
                  onClick={setSelectedProveedor}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      <ProveedorDetailModal
        isOpen={Boolean(selectedProveedor)}
        onClose={() => setSelectedProveedor(null)}
        proveedor={selectedProveedor}
        compras={compras}
      />
    </div>
  )
}
