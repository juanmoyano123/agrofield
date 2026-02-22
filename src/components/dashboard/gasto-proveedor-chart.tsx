import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import type { ProveedorGastoItem } from '../../lib/dashboard-utils'

interface GastoProveedorChartProps {
  data: ProveedorGastoItem[]
  moneda: 'ARS' | 'USD'
}

// Field green for top supplier, copper for the rest
const COLOR_PRIMARY = '#4A7C59'
const COLOR_SECONDARY = '#B5763A'

function formatCurrency(value: number, moneda: 'ARS' | 'USD'): string {
  const prefix = moneda === 'ARS' ? '$' : 'USD '
  return prefix + value.toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

export function GastoProveedorChart({ data, moneda }: GastoProveedorChartProps) {
  if (data.length === 0) return null

  const dataKey = moneda === 'ARS' ? 'totalARS' : 'totalUSD'

  // Minimum height of 200px; 48px per row gives enough breathing room
  const chartHeight = Math.max(200, data.length * 48)

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCurrency(v, moneda)}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="proveedorName"
            width={120}
            tick={{ fontSize: 12, fill: 'var(--color-text-dim, #555)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(74,124,89,0.08)' }}
            formatter={(v: number | undefined) => [
              v != null ? formatCurrency(v, moneda) : '—',
              'Gasto',
            ]}
            labelStyle={{ fontWeight: 600, fontSize: 13 }}
            contentStyle={{
              borderRadius: '4px',
              border: '1px solid #D6CCB8',
              background: '#FDFAF4',
              fontSize: 12,
            }}
          />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? COLOR_PRIMARY : COLOR_SECONDARY} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
