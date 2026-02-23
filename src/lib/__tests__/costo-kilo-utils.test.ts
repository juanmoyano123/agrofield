/**
 * F-026: Tests for src/lib/costo-kilo-utils.ts
 *
 * Validates:
 * - computeCostoKiloLote: basic cost + kg calculation
 * - Division by zero safety (kg_producidos = 0 → costoPorKg = 0, never NaN)
 * - Movement-based formula (ingreso/egreso events)
 * - Fallback formula (no movements → last - first pesaje)
 * - tieneDatosSuficientes: requires at least 2 pesajes
 * - computeCostoKiloAllLotes: only includes ganaderia lotes
 * - buildCostoKiloDesglose: sorts descending by fecha, attaches kgAtribuidos
 */

import { describe, it, expect } from 'vitest'
import type { EventoRodeo } from '../../types'
import {
  computeCostoKiloLote,
  computeCostoKiloAllLotes,
  buildCostoKiloDesglose,
} from '../costo-kilo-utils'

// ─── Fixtures ───────────────────────────────────────────────────────────────

function makeEvento(overrides: Partial<EventoRodeo>): EventoRodeo {
  return {
    id: `ev-${Math.random().toString(36).slice(2)}`,
    tenantId: 'tenant-001',
    loteId: 'lote-001',
    tipo: 'pesaje',
    categoria: 'pesaje',
    fecha: '2026-01-01',
    cantidadCabezas: 100,
    costoTotal: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// ─── computeCostoKiloLote ────────────────────────────────────────────────

describe('computeCostoKiloLote', () => {
  it('returns zero cost and kg when no events', () => {
    const result = computeCostoKiloLote('lote-001', 'Lote Norte', 100, [])
    expect(result.costosTotales).toBe(0)
    expect(result.kgProducidos).toBe(0)
    expect(result.costoPorKg).toBe(0)
    expect(result.costoPorCab).toBe(0)
    expect(result.tieneDatosSuficientes).toBe(false)
    expect(result.cantidadPesajes).toBe(0)
  })

  it('excludes soft-deleted events', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 10000, costoTotal: 5000, fecha: '2026-01-01' }),
      makeEvento({
        tipo: 'pesaje',
        pesoTotal: 12000,
        costoTotal: 6000,
        fecha: '2026-02-01',
        deletedAt: '2026-02-05T00:00:00Z',
      }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    // Only first pesaje is active
    expect(result.cantidadPesajes).toBe(1)
    expect(result.costosTotales).toBe(5000)
    expect(result.tieneDatosSuficientes).toBe(false)
  })

  it('excludes events from other lotes', () => {
    const eventos = [
      makeEvento({ loteId: 'lote-999', tipo: 'pesaje', pesoTotal: 9999, costoTotal: 99999 }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    expect(result.costosTotales).toBe(0)
    expect(result.cantidadPesajes).toBe(0)
  })

  it('uses last - first pesaje when no movements', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 10000, costoTotal: 5000, fecha: '2026-01-01' }),
      makeEvento({ tipo: 'pesaje', pesoTotal: 12000, costoTotal: 3000, fecha: '2026-02-01' }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    // kgProducidos = 12000 - 10000 = 2000
    expect(result.kgProducidos).toBe(2000)
    expect(result.costosTotales).toBe(8000)
    expect(result.costoPorKg).toBeCloseTo(4, 1) // 8000 / 2000 = 4
    expect(result.tieneDatosSuficientes).toBe(true)
  })

  it('uses movement formula when ingreso/egreso events exist', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 10000, costoTotal: 0, fecha: '2026-01-01' }),
      makeEvento({ tipo: 'pesaje', pesoTotal: 14000, costoTotal: 0, fecha: '2026-02-01' }),
      makeEvento({
        tipo: 'ingreso',
        categoria: 'movimiento',
        pesoTotal: 5000,
        costoTotal: 0,
        fecha: '2026-01-15',
      }),
      makeEvento({
        tipo: 'egreso',
        categoria: 'movimiento',
        pesoTotal: 3000,
        costoTotal: 10000,
        fecha: '2026-01-20',
      }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    // kgSalida=3000, kgStockActual=14000 (last pesaje), kgIngreso=5000
    // kgProducidos = 3000 + 14000 - 5000 = 12000
    expect(result.kgProducidos).toBe(12000)
    expect(result.kgIngreso).toBe(5000)
    expect(result.kgSalida).toBe(3000)
    expect(result.kgStockActual).toBe(14000)
    expect(result.costosTotales).toBe(10000)
    expect(result.costoPorKg).toBeCloseTo(0.833, 2) // 10000 / 12000
  })

  it('floors kgProducidos at 0 when negative (does not produce NaN)', () => {
    // kgProducidos = 1000 + 5000 - 8000 = -2000 → 0
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 5000, costoTotal: 0, fecha: '2026-01-01' }),
      makeEvento({
        tipo: 'ingreso',
        categoria: 'movimiento',
        pesoTotal: 8000,
        costoTotal: 5000,
        fecha: '2026-01-10',
      }),
      makeEvento({
        tipo: 'egreso',
        categoria: 'movimiento',
        pesoTotal: 1000,
        costoTotal: 0,
        fecha: '2026-01-20',
      }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    expect(result.kgProducidos).toBe(0)
    expect(result.costoPorKg).toBe(0)
    expect(Number.isNaN(result.costoPorKg)).toBe(false)
  })

  it('resolves kg via cantidadCabezas * pesoPromedio when pesoTotal is absent', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 10000, costoTotal: 0, fecha: '2026-01-01' }),
      makeEvento({ tipo: 'pesaje', pesoTotal: 11000, costoTotal: 0, fecha: '2026-02-01' }),
      makeEvento({
        tipo: 'ingreso',
        categoria: 'movimiento',
        pesoTotal: undefined,
        pesoPromedio: 300,
        cantidadCabezas: 10,
        costoTotal: 3000,
        fecha: '2026-01-15',
      }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    // kgIngreso resolved as 10 * 300 = 3000
    expect(result.kgIngreso).toBe(3000)
  })

  it('computes costoPorCab correctly', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', costoTotal: 18000, fecha: '2026-01-01' }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 180, eventos)
    // 18000 / 180 = 100
    expect(result.costoPorCab).toBe(100)
  })

  it('returns costoPorCab = 0 when cabezas = 0', () => {
    const eventos = [makeEvento({ costoTotal: 1000 })]
    const result = computeCostoKiloLote('lote-001', 'Test', 0, eventos)
    expect(result.costoPorCab).toBe(0)
    expect(Number.isNaN(result.costoPorCab)).toBe(false)
  })

  it('marks tieneDatosSuficientes false with only 1 pesaje', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 10000, costoTotal: 0, fecha: '2026-01-01' }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    expect(result.tieneDatosSuficientes).toBe(false)
    expect(result.cantidadPesajes).toBe(1)
  })

  it('marks tieneDatosSuficientes true with 2+ pesajes', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 10000, costoTotal: 0, fecha: '2026-01-01' }),
      makeEvento({ tipo: 'pesaje', pesoTotal: 12000, costoTotal: 0, fecha: '2026-02-01' }),
    ]
    const result = computeCostoKiloLote('lote-001', 'Test', 100, eventos)
    expect(result.tieneDatosSuficientes).toBe(true)
    expect(result.cantidadPesajes).toBe(2)
  })
})

// ─── computeCostoKiloAllLotes ────────────────────────────────────────────

describe('computeCostoKiloAllLotes', () => {
  it('only includes ganaderia lotes', () => {
    const lotes = [
      { id: 'lote-ag', nombre: 'Ag', actividad: 'agricultura', cabezas: 0 },
      { id: 'lote-gan', nombre: 'Gan', actividad: 'ganaderia', cabezas: 100 },
    ]
    const eventos = [
      makeEvento({
        loteId: 'lote-ag',
        tipo: 'pesaje',
        pesoTotal: 10000,
        costoTotal: 5000,
        fecha: '2026-01-01',
      }),
      makeEvento({
        loteId: 'lote-gan',
        tipo: 'pesaje',
        pesoTotal: 10000,
        costoTotal: 5000,
        fecha: '2026-01-01',
      }),
    ]
    const result = computeCostoKiloAllLotes(lotes, eventos)
    expect(result.every(r => r.loteId === 'lote-gan')).toBe(true)
    expect(result.length).toBe(1)
  })

  it('returns empty array when no ganaderia lotes have data', () => {
    const lotes = [{ id: 'lote-001', nombre: 'Test', actividad: 'ganaderia', cabezas: 0 }]
    const result = computeCostoKiloAllLotes(lotes, [])
    expect(result).toHaveLength(0)
  })

  it('sorts descending by costoPorKg', () => {
    const lotes = [
      { id: 'lote-a', nombre: 'A', actividad: 'ganaderia', cabezas: 100 },
      { id: 'lote-b', nombre: 'B', actividad: 'ganaderia', cabezas: 100 },
    ]
    // Lote A: 100 cost, 100 kg → 1 $/kg
    // Lote B: 1000 cost, 100 kg → 10 $/kg
    const eventos = [
      makeEvento({ loteId: 'lote-a', tipo: 'pesaje', pesoTotal: 0, costoTotal: 0, fecha: '2026-01-01' }),
      makeEvento({ loteId: 'lote-a', tipo: 'pesaje', pesoTotal: 100, costoTotal: 0, fecha: '2026-02-01' }),
      makeEvento({ loteId: 'lote-a', tipo: 'vacunacion', categoria: 'sanidad', costoTotal: 100, fecha: '2026-01-15' }),
      makeEvento({ loteId: 'lote-b', tipo: 'pesaje', pesoTotal: 0, costoTotal: 0, fecha: '2026-01-01' }),
      makeEvento({ loteId: 'lote-b', tipo: 'pesaje', pesoTotal: 100, costoTotal: 0, fecha: '2026-02-01' }),
      makeEvento({ loteId: 'lote-b', tipo: 'vacunacion', categoria: 'sanidad', costoTotal: 1000, fecha: '2026-01-15' }),
    ]
    const result = computeCostoKiloAllLotes(lotes, eventos)
    expect(result[0]?.loteId).toBe('lote-b')
    expect(result[1]?.loteId).toBe('lote-a')
  })
})

// ─── buildCostoKiloDesglose ──────────────────────────────────────────────

describe('buildCostoKiloDesglose', () => {
  it('returns empty array when no events', () => {
    const result = buildCostoKiloDesglose('lote-001', [])
    expect(result).toHaveLength(0)
  })

  it('sorts descending by fecha', () => {
    const eventos = [
      makeEvento({ id: 'e1', fecha: '2026-01-01', costoTotal: 100 }),
      makeEvento({ id: 'e2', fecha: '2026-02-01', costoTotal: 200 }),
    ]
    const result = buildCostoKiloDesglose('lote-001', eventos)
    expect(result[0]?.id).toBe('e2') // newer first
    expect(result[1]?.id).toBe('e1')
  })

  it('attaches kgAtribuidos for pesaje events with pesoTotal', () => {
    const eventos = [
      makeEvento({ tipo: 'pesaje', pesoTotal: 12000, costoTotal: 0 }),
    ]
    const result = buildCostoKiloDesglose('lote-001', eventos)
    expect(result[0]?.kgAtribuidos).toBe(12000)
  })

  it('attaches kgAtribuidos for ingreso/egreso events', () => {
    const eventos = [
      makeEvento({
        tipo: 'ingreso',
        categoria: 'movimiento',
        pesoTotal: 5000,
        costoTotal: 0,
      }),
    ]
    const result = buildCostoKiloDesglose('lote-001', eventos)
    expect(result[0]?.kgAtribuidos).toBe(5000)
  })

  it('excludes deleted events', () => {
    const eventos = [
      makeEvento({ costoTotal: 1000, deletedAt: '2026-01-05T00:00:00Z' }),
    ]
    const result = buildCostoKiloDesglose('lote-001', eventos)
    expect(result).toHaveLength(0)
  })

  it('excludes events from other lotes', () => {
    const eventos = [
      makeEvento({ loteId: 'lote-otro', costoTotal: 1000 }),
    ]
    const result = buildCostoKiloDesglose('lote-001', eventos)
    expect(result).toHaveLength(0)
  })
})
