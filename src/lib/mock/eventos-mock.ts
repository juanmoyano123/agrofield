import type { Evento, CreateEventoData, UpdateEventoData, ApiResponse, EventoInsumo } from '../../types'
import { randomDelay } from './delay'
import { applyStockMovimiento } from './stock-mock'

const DEMO_TENANT_ID = 'tenant-demo-001'

function generateId(): string {
  return `evento-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function generateInsumoId(): string {
  return `einsumo-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function computeCostoTotal(insumos: EventoInsumo[], costoManual?: number): number {
  const insumosTotal = insumos.reduce((sum, i) => sum + i.subtotal, 0)
  return insumosTotal + (costoManual ?? 0)
}

const mockEventosDB: Evento[] = [
  {
    id: 'evento-001',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-001',
    tipo: 'siembra',
    fecha: '2026-02-01',
    insumos: [
      {
        id: 'einsumo-001',
        productoId: 'prod-002',
        productoName: 'Soja DM 4210',
        cantidad: 30,
        unidad: 'Bolsas',
        costoUnitario: 18000,
        subtotal: 540000,
      },
    ],
    costoManual: undefined,
    costoTotal: 540000,
    responsable: 'Carlos Mendez',
    notas: 'Siembra a 15cm de profundidad, humedad óptima',
    deletedAt: undefined,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'evento-002',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-001',
    tipo: 'aplicacion',
    fecha: '2026-02-10',
    insumos: [
      {
        id: 'einsumo-002',
        productoId: 'prod-001',
        productoName: 'Roundup 480',
        cantidad: 5,
        unidad: 'Litros',
        costoUnitario: 4500,
        subtotal: 22500,
      },
    ],
    costoManual: undefined,
    costoTotal: 22500,
    responsable: 'Roberto González',
    notas: undefined,
    deletedAt: undefined,
    createdAt: '2026-02-10T09:30:00.000Z',
    updatedAt: '2026-02-10T09:30:00.000Z',
  },
  {
    id: 'evento-003',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-001',
    tipo: 'monitoreo',
    fecha: '2026-02-15',
    insumos: [],
    costoManual: 8000,
    costoTotal: 8000,
    responsable: 'Ing. Ana Torres',
    notas: 'Monitoreo de plagas — sin presencia significativa',
    deletedAt: undefined,
    createdAt: '2026-02-15T11:00:00.000Z',
    updatedAt: '2026-02-15T11:00:00.000Z',
  },
  {
    id: 'evento-004',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-002',
    tipo: 'servicio',
    fecha: '2026-01-28',
    insumos: [],
    costoManual: 45000,
    costoTotal: 45000,
    responsable: 'Juan Díaz',
    notas: 'Arado y preparación del terreno',
    deletedAt: undefined,
    createdAt: '2026-01-28T07:00:00.000Z',
    updatedAt: '2026-01-28T07:00:00.000Z',
  },
]

export async function mockGetEventosByLote(loteId: string, tenantId: string): Promise<ApiResponse<Evento[]>> {
  await randomDelay()
  const eventos = mockEventosDB.filter(
    e => e.loteId === loteId && e.tenantId === tenantId && !e.deletedAt,
  )
  return { success: true, data: eventos }
}

export async function mockCreateEvento(
  data: CreateEventoData,
  loteId: string,
  tenantId: string,
): Promise<ApiResponse<Evento>> {
  await randomDelay()
  const now = new Date().toISOString()
  const insumosWithId: EventoInsumo[] = data.insumos.map(i => ({
    ...i,
    id: generateInsumoId(),
  }))
  const newEvento: Evento = {
    id: generateId(),
    tenantId,
    loteId,
    tipo: data.tipo,
    fecha: data.fecha,
    insumos: insumosWithId,
    costoManual: data.costoManual,
    costoTotal: computeCostoTotal(insumosWithId, data.costoManual),
    responsable: data.responsable,
    notas: data.notas,
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  }
  // Decrement stock for each insumo
  for (const insumo of insumosWithId) {
    applyStockMovimiento(
      insumo.productoId,
      -insumo.cantidad,
      'evento',
      newEvento.id,
      `${newEvento.tipo.charAt(0).toUpperCase() + newEvento.tipo.slice(1)} — lote`,
      newEvento.fecha,
      tenantId,
    )
  }

  mockEventosDB.push(newEvento)
  return { success: true, data: newEvento }
}

export async function mockUpdateEvento(
  id: string,
  data: UpdateEventoData,
  tenantId: string,
): Promise<ApiResponse<Evento>> {
  await randomDelay()
  const index = mockEventosDB.findIndex(e => e.id === id && e.tenantId === tenantId && !e.deletedAt)
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Evento no encontrado' } }
  }
  const existing = mockEventosDB[index]!
  const insumosWithId: EventoInsumo[] = (data.insumos ?? existing.insumos).map(i =>
    'id' in i ? (i as EventoInsumo) : { ...i, id: generateInsumoId() },
  )
  const updated: Evento = {
    ...existing,
    ...data,
    insumos: insumosWithId,
    costoTotal: computeCostoTotal(insumosWithId, data.costoManual ?? existing.costoManual),
    updatedAt: new Date().toISOString(),
  }
  // Reverse old insumos stock, apply new
  for (const insumo of existing.insumos) {
    applyStockMovimiento(insumo.productoId, insumo.cantidad, 'evento', id, 'Ajuste por edición', updated.fecha, tenantId)
  }
  for (const insumo of insumosWithId) {
    applyStockMovimiento(insumo.productoId, -insumo.cantidad, 'evento', id, 'Ajuste por edición', updated.fecha, tenantId)
  }

  mockEventosDB[index] = updated
  return { success: true, data: updated }
}

export async function mockDeleteEvento(id: string, tenantId: string): Promise<ApiResponse<void>> {
  await randomDelay()
  const index = mockEventosDB.findIndex(e => e.id === id && e.tenantId === tenantId && !e.deletedAt)
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Evento no encontrado' } }
  }
  mockEventosDB[index] = {
    ...mockEventosDB[index]!,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true }
}

/**
 * F-005: Returns all non-deleted eventos for a tenant, across all lotes.
 * Used by the imputacion engine to compute cross-lote cost aggregations.
 */
export async function mockGetAllEventos(tenantId: string): Promise<ApiResponse<Evento[]>> {
  await randomDelay()
  return { success: true, data: mockEventosDB.filter(e => e.tenantId === tenantId && !e.deletedAt) }
}
