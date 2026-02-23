import { useEffect } from 'react'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/use-auth'
import { useLocale } from '../hooks/use-locale'
import { useStock } from '../hooks/use-stock'
import { StockCard } from '../components/stock/stock-card'
import { StockFilters } from '../components/stock/stock-filters'
import { StockAlertsBanner } from '../components/stock/stock-alerts-banner'
import { Alert } from '../components/ui/alert'
import { Spinner } from '../components/ui/spinner'
import { EmptyState } from '../components/ui/empty-state'
import { Button } from '../components/ui/button'
import { toCsvString, downloadCsv, getCsvFilename } from '../lib/csv-export'
import type { CategoriaProducto } from '../types'

export function StockPage() {
  const { t } = useTranslation('stock')
  const { formatCurrency, formatDateShort } = useLocale()
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

  function handleExportInventario() {
    const csv = toCsvString(filteredProductos, [
      { header: 'Producto', accessor: p => p.name },
      { header: 'Categoria', accessor: p => p.categoria ?? '' },
      { header: 'Stock actual', accessor: p => p.stockActual },
      { header: 'Unidad', accessor: p => p.unidad },
      { header: 'Precio promedio', accessor: p => p.precioPromedio },
      { header: 'Valor total', accessor: p => p.stockActual * p.precioPromedio },
    ])
    downloadCsv(csv, getCsvFilename('stock_inventario'))
  }

  function handleExportMovimientos() {
    const csv = toCsvString(movimientos, [
      { header: 'Fecha', accessor: m => m.fecha },
      { header: 'Producto', accessor: m => m.productoName },
      { header: 'Tipo', accessor: m => m.tipo },
      { header: 'Cantidad', accessor: m => m.cantidad },
      { header: 'Unidad', accessor: m => m.unidad },
      { header: 'Stock antes', accessor: m => m.stockAntes },
      { header: 'Stock despues', accessor: m => m.stockDespues },
      { header: 'Referencia', accessor: m => m.referenciaLabel },
    ])
    downloadCsv(csv, getCsvFilename('stock_movimientos'))
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">{t('title')}</h1>
          <p className="text-sm text-text-muted mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Desktop: summary chip + export buttons */}
        {!isLoading && productos.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleExportMovimientos}
              disabled={movimientos.length === 0}
            >
              <Download size={16} /> {t('exportMovimientos')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleExportInventario}
              disabled={filteredProductos.length === 0}
            >
              <Download size={16} /> {t('exportInventario')}
            </Button>
            <div className="flex flex-col items-end">
              <p className="text-xs text-text-muted uppercase tracking-wide">{t('totalValue')}</p>
              <p className="text-lg font-bold text-text-primary">{formatCurrency(valorTotalStock)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error">
          {error}
          <button type="button" onClick={clearError} className="ml-2 underline text-xs">{t('closeError')}</button>
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
              title={t('empty.noStock.title')}
              description={t('empty.noStock.description')}
              action={undefined}
            />
          ) : filteredProductos.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={t('empty.noResults.title')}
              description={t('empty.noResults.description')}
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
                {t('recentMovements')}
              </h2>
              <div className="overflow-x-auto rounded-sm border border-border-warm">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-parchment border-b border-border-warm">
                      <th className="text-left px-4 py-3 font-semibold text-text-dim">{t('table.date')}</th>
                      <th className="text-left px-4 py-3 font-semibold text-text-dim">{t('table.product')}</th>
                      <th className="text-left px-4 py-3 font-semibold text-text-dim">{t('table.movement')}</th>
                      <th className="text-right px-4 py-3 font-semibold text-text-dim">{t('table.quantity')}</th>
                      <th className="text-right px-4 py-3 font-semibold text-text-dim">{t('table.stock')}</th>
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
                            {formatDateShort(mov.fecha)}
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
