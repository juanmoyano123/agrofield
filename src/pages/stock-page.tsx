import { useEffect } from 'react'
import { useAuth } from '../hooks/use-auth'
import { useStock } from '../hooks/use-stock'
import { StockCard } from '../components/stock/stock-card'
import { StockFilters } from '../components/stock/stock-filters'
import { StockAlertsBanner } from '../components/stock/stock-alerts-banner'
import { Alert } from '../components/ui/alert'
import { Spinner } from '../components/ui/spinner'
import { EmptyState } from '../components/ui/empty-state'
import type { CategoriaProducto } from '../types'

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function StockPage() {
  const { user } = useAuth()
  const {
    productos,
    movimientos,
    filteredProductos,
    visibleAlerts,
    thresholds,
    isLoading,
    error,
    filterCategoria,
    searchQuery,
    fetchStock,
    setFilterCategoria,
    setSearchQuery,
    clearError,
    dismissAlert,
    setThreshold,
  } = useStock()

  useEffect(() => {
    if (!user) return
    void fetchStock(user.tenantId)
  }, [user, fetchStock])

  const valorTotalStock = productos.reduce(
    (sum, p) => sum + Math.max(0, p.stockActual) * p.precioPromedio,
    0,
  )

  const recentMovimientos = movimientos.slice(0, 10)

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">Stock</h1>
          <p className="text-sm text-text-muted mt-1">
            Inventario de insumos y materiales
          </p>
        </div>

        {/* Summary chip */}
        {!isLoading && productos.length > 0 && (
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <p className="text-xs text-text-muted uppercase tracking-wide">Valor total</p>
            <p className="text-lg font-bold text-text-primary">{formatCurrency(valorTotalStock)}</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error">
          {error}
          <button type="button" onClick={clearError} className="ml-2 underline text-xs">Cerrar</button>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Stock bajo alerts banner — replaces the hardcoded block */}
          <StockAlertsBanner alerts={visibleAlerts} onDismiss={dismissAlert} />

          {/* Filters */}
          {productos.length > 0 && (
            <StockFilters
              filterCategoria={filterCategoria as CategoriaProducto | ''}
              searchQuery={searchQuery}
              onCategoriaChange={setFilterCategoria}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* Product grid */}
          {filteredProductos.length === 0 && productos.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Sin productos en stock"
              description="El stock se actualiza automáticamente al registrar compras y eventos de campo."
              action={undefined}
            />
          ) : filteredProductos.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Sin resultados"
              description="No hay productos que coincidan con los filtros actuales."
              action={undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProductos.map(producto => (
                <StockCard
                  key={producto.id}
                  producto={producto}
                  threshold={thresholds[producto.id] ?? 10}
                  onThresholdChange={setThreshold}
                />
              ))}
            </div>
          )}

          {/* Movimientos recientes */}
          {recentMovimientos.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-text-dim uppercase tracking-wide">
                Movimientos recientes
              </h2>
              <div className="overflow-x-auto rounded-sm border border-border-warm">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-parchment border-b border-border-warm">
                      <th className="text-left px-4 py-3 font-semibold text-text-dim">Fecha</th>
                      <th className="text-left px-4 py-3 font-semibold text-text-dim">Producto</th>
                      <th className="text-left px-4 py-3 font-semibold text-text-dim">Movimiento</th>
                      <th className="text-right px-4 py-3 font-semibold text-text-dim">Cantidad</th>
                      <th className="text-right px-4 py-3 font-semibold text-text-dim">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMovimientos.map((mov, i) => {
                      const isEven = i % 2 === 0
                      return (
                        <tr
                          key={mov.id}
                          className={`border-b border-border-warm last:border-0 ${isEven ? 'bg-surface' : 'bg-parchment/50'}`}
                        >
                          <td className="px-4 py-3 text-text-muted whitespace-nowrap text-xs">
                            {new Date(mov.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 font-medium text-text-primary">{mov.productoName}</td>
                          <td className="px-4 py-3 text-text-dim text-xs truncate max-w-[180px]">{mov.referenciaLabel}</td>
                          <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                            <span className={mov.tipo === 'entrada' ? 'text-field-green' : 'text-error'}>
                              {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad} {mov.unidad}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-text-dim font-mono text-xs whitespace-nowrap">
                            {mov.stockDespues} {mov.unidad}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
