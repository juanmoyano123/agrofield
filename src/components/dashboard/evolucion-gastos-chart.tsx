import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import type { GastoCategoriaMensual } from '../../lib/dashboard-utils'

// ---------------------------------------------------------------------------
// Design system colors — mapped to agro palette tokens
// ---------------------------------------------------------------------------

const COLORES = {
  semilla:      '#4A7C59', // field-green
  herbicida:    '#B5763A', // copper
  insecticida:  '#8B6F47', // dark copper
  fertilizante: '#D4A853', // warm gold
  otro:         '#A0937B', // neutral warm
  contratistas: '#6B8F71', // secondary green
} as const

type CategoriaKey = keyof typeof COLORES

const LABELS: Record<CategoriaKey, string> = {
  semilla:      'Semillas',
  herbicida:    'Herbicidas',
  insecticida:  'Insecticidas',
  fertilizante: 'Fertilizantes',
  otro:         'Otros insumos',
  contratistas: 'Contratistas',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a numeric value as ARS currency string with compact notation
 * for large numbers to keep axis labels readable.
 */
function formatARS(v: number): string {
  if (Math.abs(v) >= 1_000_000) {
    return '$' + (v / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + 'M'
  }
  if (Math.abs(v) >= 1_000) {
    return '$' + (v / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 }) + 'k'
  }
  return '$' + Math.round(v).toLocaleString('es-AR')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EvolucionGastosChartProps {
  data: GastoCategoriaMensual[]
  promedioMensual: number
  /** When true, renders stacked areas per category; when false, renders a single total area. */
  showCategorias: boolean
  moneda: 'ARS' | 'USD'
}

/**
 * EvolucionGastosChart renders a stacked AreaChart of monthly spending.
 *
 * - showCategorias=true: each product category and contratistas get their own stacked area.
 * - showCategorias=false: a single area showing the total for quick overview.
 * - A dashed reference line marks the average monthly spend.
 * - USD mode hides contratistas (always ARS).
 */
export function EvolucionGastosChart({
  data,
  promedioMensual,
  showCategorias,
  moneda,
}: EvolucionGastosChartProps) {
  if (data.length === 0) return null

  // Minimum chart height ensures the chart is readable even with few data points
  const chartHeight = Math.max(240, Math.min(data.length * 60, 400))

  // In USD mode, contratistas are excluded (they are always ARS)
  const categorias = (Object.keys(COLORES) as CategoriaKey[]).filter(
    key => moneda === 'ARS' || key !== 'contratistas',
  )

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 8, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={formatARS}
            tick={{ fontSize: 10, fill: 'var(--color-text-muted, #888)' }}
            axisLine={false}
            tickLine={false}
            width={72}
          />

          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => {
              const formatted = value != null ? formatARS(value) : '—'
              const label = name != null ? (LABELS[name as CategoriaKey] ?? name) : ''
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

          {showCategorias && (
            <Legend
              formatter={(value: string) => LABELS[value as CategoriaKey] ?? value}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
          )}

          {/* Dashed reference line at average monthly spend */}
          {promedioMensual > 0 && (
            <ReferenceLine
              y={promedioMensual}
              stroke="#9A9088"
              strokeDasharray="5 5"
              label={{
                value: `Prom. ${formatARS(promedioMensual)}`,
                fill: '#9A9088',
                fontSize: 11,
                position: 'insideTopRight',
              }}
            />
          )}

          {showCategorias
            ? categorias.map(key => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="gastos"
                  stroke={COLORES[key]}
                  fill={COLORES[key]}
                  fillOpacity={0.7}
                  name={key}
                />
              ))
            : (
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#B5763A"
                  fill="#B5763A"
                  fillOpacity={0.3}
                  name="Total gastos"
                  strokeWidth={2}
                />
              )
          }
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
