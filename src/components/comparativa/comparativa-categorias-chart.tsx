/**
 * F-027: ComparativaCategoriasChart — Grouped BarChart comparing spend by category.
 *
 * One group per category (Contratistas, Otro), one bar per campaña.
 * Contratistas = trabajos. Insumo categories would require linking
 * evento insumos to stock catalog (future enhancement — shows as "Otro" currently).
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
import type { Campana } from '../../types'
import type { Evento } from '../../types'
import type { TrabajoContratista } from '../../types'
import {
  buildCategoriasChartData,
  getCampanaColor,
} from '../../lib/comparativa-utils'

interface ComparativaCategoriasChartProps {
  campanas: Campana[]
  eventos: Evento[]
  trabajos: TrabajoContratista[]
}

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function ComparativaCategoriasChart({
  campanas,
  eventos,
  trabajos,
}: ComparativaCategoriasChartProps) {
  const chartData = buildCategoriasChartData(campanas, eventos, trabajos)

  // Filter categories that have at least some data across all campañas
  const categoriesWithData = chartData.filter(item =>
    campanas.some(c => (item[c.nombre] as number) > 0),
  )

  if (categoriesWithData.length === 0) return null

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm p-4"
      aria-labelledby="comparativa-cat-chart-title"
    >
      <div className="mb-4">
        <h2
          id="comparativa-cat-chart-title"
          className="text-base font-bold text-text-primary font-display"
        >
          Gastos por categoría
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Composición del gasto por categoría de insumo entre campañas
        </p>
      </div>

      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoriesWithData}
            margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
          >
            <XAxis
              dataKey="categoria"
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
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {campanas.map((campana, index) => (
              <Bar
                key={campana.id}
                dataKey={campana.nombre}
                fill={getCampanaColor(index)}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
