import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import type { CashflowMensualItem } from '../../lib/dashboard-utils'

interface CashflowChartProps {
  data: CashflowMensualItem[]
  moneda: 'ARS' | 'USD'
}

// Design system colors
const COLOR_COMPRAS = '#B5763A'    // copper — insumos/compras bar
const COLOR_TRABAJOS = '#8B6F47'   // darker copper — contratistas bar
const COLOR_NETO_POS = '#4A7C59'  // field-green — positive net line
const COLOR_NETO_NEG = '#DC2626'  // red-600 — negative net line

function formatCurrency(value: number, moneda: 'ARS' | 'USD'): string {
  const prefix = moneda === 'ARS' ? '$' : 'USD '
  // Use compact notation for large numbers to keep axis readable
  if (Math.abs(value) >= 1_000_000) {
    return prefix + (value / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + 'M'
  }
  if (Math.abs(value) >= 1_000) {
    return prefix + (value / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 }) + 'k'
  }
  return prefix + value.toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

/**
 * CashflowChart renders a ComposedChart with:
 * - Stacked bars: egresosCompras (copper) + egresosTrabajos (dark copper)
 * - Line: neto — color switches to red when negative, field-green when >= 0
 */
export function CashflowChart({ data, moneda }: CashflowChartProps) {
  if (data.length === 0) return null

  // Determine line color based on overall net: if any month is positive use green,
  // otherwise red. The line itself shows the trend; per-point coloring not possible in Recharts.
  const overallNeto = data.reduce((sum, d) => sum + d.neto, 0)
  const lineColor = overallNeto >= 0 ? COLOR_NETO_POS : COLOR_NETO_NEG

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />

          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v: number) => formatCurrency(v, moneda)}
            tick={{ fontSize: 10, fill: 'var(--color-text-muted, #888)' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />

          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => {
              const labels: Record<string, string> = {
                egresosCompras: 'Insumos',
                egresosTrabajos: 'Servicios',
                neto: 'Neto',
              }
              const formatted = value != null ? formatCurrency(value, moneda) : '—'
              const label = name != null ? (labels[name] ?? name) : ''
              return [formatted, label]
            }}
            contentStyle={{
              borderRadius: '4px',
              border: '1px solid #D6CCB8',
              background: '#FDFAF4',
              fontSize: 12,
            }}
            labelStyle={{ fontWeight: 600, fontSize: 13 }}
          />

          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                egresosCompras: 'Insumos',
                egresosTrabajos: 'Servicios',
                neto: 'Neto',
              }
              return labels[value] ?? value
            }}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />

          {/* Stacked bars for egresos breakdown */}
          <Bar
            dataKey="egresosCompras"
            stackId="egresos"
            fill={COLOR_COMPRAS}
            name="egresosCompras"
            maxBarSize={40}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="egresosTrabajos"
            stackId="egresos"
            fill={COLOR_TRABAJOS}
            name="egresosTrabajos"
            maxBarSize={40}
            radius={[2, 2, 0, 0]}
          />

          {/* Net line — color reflects sign of overall balance */}
          <Line
            type="monotone"
            dataKey="neto"
            name="neto"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
