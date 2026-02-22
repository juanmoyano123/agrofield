import type { Producto } from '../../types'

interface StockCardProps {
  producto: Producto
  maxStock?: number
}

const CATEGORIA_LABEL: Record<string, string> = {
  semilla: 'Semilla',
  herbicida: 'Herbicida',
  insecticida: 'Insecticida/Fungicida',
  fertilizante: 'Fertilizante',
  otro: 'Otro',
}

const CATEGORIA_COLOR: Record<string, string> = {
  semilla:      'bg-green-50 text-green-700 border-green-200',
  herbicida:    'bg-blue-50 text-blue-700 border-blue-200',
  insecticida:  'bg-orange-50 text-orange-700 border-orange-200',
  fertilizante: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  otro:         'bg-parchment text-text-dim border-border-warm',
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function getStockStatus(stockActual: number): 'ok' | 'low' | 'negative' {
  if (stockActual < 0) return 'negative'
  if (stockActual <= 10) return 'low'
  return 'ok'
}

export function StockCard({ producto, maxStock }: StockCardProps) {
  const status = getStockStatus(producto.stockActual)
  const valorStock = producto.stockActual * producto.precioPromedio

  // Progress bar: clamp between 0 and 100
  const max = maxStock ?? Math.max(producto.stockActual * 1.5, 1)
  const pct = Math.min(100, Math.max(0, (producto.stockActual / max) * 100))

  const barColor =
    status === 'negative' ? 'bg-error' :
    status === 'low'      ? 'bg-warning' :
                            'bg-field-green'

  const borderColor =
    status === 'negative' ? 'border-l-error' :
    status === 'low'      ? 'border-l-warning' :
                            'border-l-copper'

  return (
    <div className={`
      bg-surface border border-border-warm border-l-2 ${borderColor} rounded-sm
      shadow-warm-sm hover:shadow-warm hover:-translate-y-0.5
      transition-all duration-300 p-4
    `}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate">{producto.name}</h3>
          {producto.categoria && (
            <span className={`
              inline-flex items-center px-2 py-0.5 mt-1
              rounded-sm border text-xs font-medium
              ${CATEGORIA_COLOR[producto.categoria] ?? CATEGORIA_COLOR['otro']}
            `}>
              {CATEGORIA_LABEL[producto.categoria] ?? 'Otro'}
            </span>
          )}
        </div>

        {status !== 'ok' && (
          <span className={`
            shrink-0 text-xs font-bold px-2 py-1 rounded-sm
            ${status === 'negative' ? 'bg-red-50 text-error' : 'bg-yellow-50 text-warning'}
          `}>
            {status === 'negative' ? '⚠ Negativo' : '⚠ Stock bajo'}
          </span>
        )}
      </div>

      {/* Stock amount */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className={`text-2xl font-bold ${
            status === 'negative' ? 'text-error' :
            status === 'low'      ? 'text-warning' :
                                    'text-text-primary'
          }`}>
            {producto.stockActual.toLocaleString('es-AR')}
          </span>
          <span className="text-sm text-text-muted">{producto.unidad}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-border-warm rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Footer: precio y valor */}
      <div className="flex items-center justify-between pt-3 border-t border-border-warm">
        <div>
          <p className="text-xs text-text-muted">Precio promedio</p>
          <p className="text-sm font-semibold text-text-dim">
            {formatCurrency(producto.precioPromedio)} / {producto.unidad.toLowerCase().replace(/s$/, '')}
          </p>
        </div>
        {valorStock > 0 && (
          <div className="text-right">
            <p className="text-xs text-text-muted">Valor en stock</p>
            <p className="text-sm font-bold text-text-primary">{formatCurrency(valorStock)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
