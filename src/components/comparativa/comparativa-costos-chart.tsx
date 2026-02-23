/**
 * F-027: ComparativaCostosChart — Grouped BarChart comparing cost per lote.
 *
 * One group per lote, one bar per campaña.
 * Metric toggle: Total ARS vs $/ha.
 * Uses CAMPANA_COLORS for consistent color coding across all charts.
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import type { ComparativaCampanaData } from '../../lib/comparativa-utils'
import {
  buildComparativaChartData,
  getCampanaColor,
} from '../../lib/comparativa-utils'

interface ComparativaCostosChartProps {
  data: ComparativaCampanaData[]
  metric: 'total' | 'porHa'
  onMetricChange: (m: 'total' | 'porHa') => void
}

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function ComparativaCostosChart({
  data,
  metric,
  onMetricChange,
}: ComparativaCostosChartProps) {
  const chartData = buildComparativaChartData(data, metric)

  if (chartData.length === 0) return null

  const chartHeight = Math.max(300, chartData.length * 60)

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm p-4"
      aria-labelledby="comparativa-costos-chart-title"
    >
      {/* Header + metric toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2
            id="comparativa-costos-chart-title"
            className="text-base font-bold text-text-primary font-display"
          >
            Costos por lote
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Comparación de costos entre campañas por lote productivo
          </p>
        </div>

        <div
          className="flex rounded-sm border border-border-warm overflow-hidden"
          role="group"
          aria-label="Métrica"
        >
          {(['total', 'porHa'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => onMetricChange(m)}
              className={[
                'px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                metric === m
                  ? 'bg-field-green text-white'
                  : 'bg-surface text-text-dim hover:bg-parchment',
              ].join(' ')}
              aria-pressed={metric === m}
            >
              {m === 'total' ? 'Total' : '$/ha'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: Math.max(400, chartData.length * 80), height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
            >
              <XAxis
                dataKey="loteNombre"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => formatARS(v)}
                tick={{ fontSize: 10, fill: 'var(--color-text-muted, #888)' }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                cursor={{ fill: 'rgba(74,124,89,0.06)' }}
                formatter={(v: number | undefined, name) => [
                  v != null ? formatARS(v) : '—',
                  name ?? '',
                ]}
                labelStyle={{ fontWeight: 600, fontSize: 13 }}
                contentStyle={{
                  borderRadius: '4px',
                  border: '1px solid #D6CCB8',
                  background: '#FDFAF4',
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {data.map((campana, index) => (
                <Bar
                  key={campana.campanaId}
                  dataKey={campana.campanaNombre}
                  fill={getCampanaColor(index)}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
