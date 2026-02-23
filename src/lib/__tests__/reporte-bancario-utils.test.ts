/**
 * F-028: Tests for reporte-bancario-utils.ts
 *
 * Tests the three pure utility functions:
 *   - formatCurrency
 *   - computeResumenGeneral
 *   - computeActividadResumen
 */

import { describe, it, expect } from 'vitest'
import { formatCurrency, computeResumenGeneral, computeActividadResumen } from '../reporte-bancario-utils'
import type { Lote } from '../../types/lote'
import type { Compra } from '../../types/compras'
import type { TrabajoContratista } from '../../types/contratista'
import type { Evento } from '../../types/evento'

// ── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats ARS amounts with $ prefix', () => {
    const result = formatCurrency(45320, 'ARS')
    expect(result).toContain('$')
    expect(result).toContain('45')
  })

  it('formats USD amounts with U$S prefix', () => {
    const result = formatCurrency(1200, 'USD')
    expect(result).toContain('U$S')
    expect(result).toContain('1')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0, 'ARS')).toContain('$')
    expect(formatCurrency(0, 'USD')).toContain('U$S')
  })
})

// ── Shared test fixtures ─────────────────────────────────────────────────────

const makeLote = (overrides: Partial<Lote> = {}): Lote => ({
  id: 'lote-1',
  tenantId: 'tenant-1',
  nombre: 'Lote Norte',
  hectareas: 100,
  actividad: 'agricultura',
  costoTotal: 0,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  ...overrides,
})

const makeCompra = (overrides: Partial<Compra> = {}): Compra => ({
  id: 'compra-1',
  tenantId: 'tenant-1',
  proveedorId: 'prov-1',
  proveedorName: 'Agroquímica',
  fecha: '2026-01-15',
  moneda: 'ARS',
  total: 10000,
  items: [],
  notas: null,
  numeroFactura: null,
  createdAt: '2026-01-15',
  ...overrides,
})

const makeTrabajo = (overrides: Partial<TrabajoContratista> = {}): TrabajoContratista => ({
  id: 'trabajo-1',
  tenantId: 'tenant-1',
  contratistaId: 'cont-1',
  contratistaNombre: 'Juan Pérez',
  loteId: 'lote-1',
  tipo: 'siembra',
  estado: 'completado',
  fecha: '2026-01-20',
  costo: 5000,
  createdAt: '2026-01-20',
  updatedAt: '2026-01-20',
  ...overrides,
})

const makeEvento = (overrides: Partial<Evento> = {}): Evento => ({
  id: 'evento-1',
  tenantId: 'tenant-1',
  loteId: 'lote-1',
  tipo: 'siembra',
  fecha: '2026-01-10',
  insumos: [],
  costoTotal: 0,
  createdAt: '2026-01-10',
  updatedAt: '2026-01-10',
  ...overrides,
})

// ── computeResumenGeneral ────────────────────────────────────────────────────

describe('computeResumenGeneral', () => {
  it('returns zero values when no data', () => {
    const result = computeResumenGeneral([], [], [], 'this-year')
    expect(result.totalHectareas).toBe(0)
    expect(result.cantidadLotes).toBe(0)
    expect(result.inversionTotal).toBe(0)
    expect(result.costoPorHa).toBe(0)
  })

  it('sums hectareas from active lotes', () => {
    const lotes = [
      makeLote({ id: '1', hectareas: 100 }),
      makeLote({ id: '2', hectareas: 200 }),
    ]
    const result = computeResumenGeneral(lotes, [], [], 'all')
    expect(result.totalHectareas).toBe(300)
    expect(result.cantidadLotes).toBe(2)
  })

  it('excludes soft-deleted lotes', () => {
    const lotes = [
      makeLote({ id: '1', hectareas: 100 }),
      makeLote({ id: '2', hectareas: 200, deletedAt: '2026-01-01' }),
    ]
    const result = computeResumenGeneral(lotes, [], [], 'all')
    expect(result.totalHectareas).toBe(100)
    expect(result.cantidadLotes).toBe(1)
  })

  it('sums ARS compras and trabajos for inversionTotal', () => {
    const lotes = [makeLote({ hectareas: 100 })]
    const compras = [
      makeCompra({ moneda: 'ARS', total: 10000 }),
      makeCompra({ moneda: 'USD', total: 500 }),  // excluded
    ]
    const trabajos = [makeTrabajo({ costo: 5000 })]
    const result = computeResumenGeneral(lotes, compras, trabajos, 'all')
    expect(result.inversionTotal).toBe(15000)   // 10000 ARS + 5000 trabajo
  })

  it('computes costoPorHa correctly', () => {
    const lotes = [makeLote({ hectareas: 100 })]
    const compras = [makeCompra({ moneda: 'ARS', total: 20000 })]
    const result = computeResumenGeneral(lotes, compras, [], 'all')
    expect(result.costoPorHa).toBe(200)  // 20000 / 100
  })

  it('excludes soft-deleted trabajos', () => {
    const trabajos = [
      makeTrabajo({ costo: 5000 }),
      makeTrabajo({ id: 't2', costo: 3000, deletedAt: '2026-01-01' }),
    ]
    const lotes = [makeLote({ hectareas: 10 })]
    const result = computeResumenGeneral(lotes, [], trabajos, 'all')
    expect(result.inversionTotal).toBe(5000)
  })
})

// ── computeActividadResumen ──────────────────────────────────────────────────

describe('computeActividadResumen', () => {
  it('returns empty result for no eventos', () => {
    const result = computeActividadResumen([], 'this-year')
    expect(result.items).toHaveLength(0)
    expect(result.totalEventos).toBe(0)
  })

  it('groups eventos by tipo', () => {
    const eventos = [
      makeEvento({ tipo: 'siembra' }),
      makeEvento({ id: 'e2', tipo: 'siembra' }),
      makeEvento({ id: 'e3', tipo: 'cosecha' }),
    ]
    const result = computeActividadResumen(eventos, 'all')
    expect(result.totalEventos).toBe(3)
    const siembra = result.items.find(i => i.tipo === 'siembra')
    expect(siembra?.cantidad).toBe(2)
    const cosecha = result.items.find(i => i.tipo === 'cosecha')
    expect(cosecha?.cantidad).toBe(1)
  })

  it('excludes soft-deleted eventos', () => {
    const eventos = [
      makeEvento({ tipo: 'siembra' }),
      makeEvento({ id: 'e2', tipo: 'aplicacion', deletedAt: '2026-01-01' }),
    ]
    const result = computeActividadResumen(eventos, 'all')
    expect(result.totalEventos).toBe(1)
  })

  it('provides human-readable labels', () => {
    const eventos = [makeEvento({ tipo: 'aplicacion' })]
    const result = computeActividadResumen(eventos, 'all')
    expect(result.items[0]?.label).toBe('Aplicación')
  })

  it('sorts items descending by cantidad', () => {
    const eventos = [
      makeEvento({ id: 'e1', tipo: 'monitoreo' }),
      makeEvento({ id: 'e2', tipo: 'siembra' }),
      makeEvento({ id: 'e3', tipo: 'siembra' }),
      makeEvento({ id: 'e4', tipo: 'siembra' }),
    ]
    const result = computeActividadResumen(eventos, 'all')
    expect(result.items[0]?.tipo).toBe('siembra')
    expect(result.items[0]?.cantidad).toBe(3)
  })
})
