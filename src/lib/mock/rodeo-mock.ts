import type { EventoRodeo, CreateEventoRodeoData, UpdateEventoRodeoData } from '../../types'
import type { ApiResponse } from '../../types'
import { CATEGORIA_POR_TIPO } from '../../types'
import { randomDelay } from './delay'

const DEMO_TENANT_ID = 'tenant-demo-001'

function generateId(): string {
  return `rodeo-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function computeCostoTotal(data: {
  costoManual?: number
  cantidadCabezas: number
  precioUnitario?: number
}): number {
  return data.costoManual ?? data.cantidadCabezas * (data.precioUnitario ?? 0)
}

const mockRodeoDB: EventoRodeo[] = [
  {
    id: 'rodeo-001',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-002',
    tipo: 'pesaje',
    categoria: 'pesaje',
    fecha: '2026-01-15',
    cantidadCabezas: 180,
    pesoPromedio: 320,
    pesoTotal: 57600,
    costoManual: 12000,
    costoTotal: 12000,
    responsable: 'Carlos Mendez',
    notas: 'Pesaje inicial del año — condición corporal buena',
    deletedAt: undefined,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'rodeo-002',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-002',
    tipo: 'vacunacion',
    categoria: 'sanidad',
    fecha: '2026-01-20',
    cantidadCabezas: 180,
    productoSanitario: 'Aftosa bivalente',
    dosisMl: 2,
    veterinario: 'Dr. Roberto Gómez',
    proximaDosis: '2026-07-20',
    costoManual: 54000,
    costoTotal: 54000,
    responsable: 'Dr. Roberto Gómez',
    notas: 'Vacunación obligatoria primer semestre',
    deletedAt: undefined,
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'rodeo-003',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-002',
    tipo: 'tacto',
    categoria: 'reproduccion',
    fecha: '2026-02-05',
    cantidadCabezas: 180,
    resultadoTacto: 'prenada',
    cantidadPreniadas: 150,
    cantidadVacias: 30,
    veterinario: 'Dr. Roberto Gómez',
    costoManual: 36000,
    costoTotal: 36000,
    responsable: 'Dr. Roberto Gómez',
    notas: '83% de preñez — resultado satisfactorio para la categoría',
    deletedAt: undefined,
    createdAt: '2026-02-05T10:00:00.000Z',
    updatedAt: '2026-02-05T10:00:00.000Z',
  },
  {
    id: 'rodeo-004',
    tenantId: DEMO_TENANT_ID,
    loteId: 'lote-002',
    tipo: 'ingreso',
    categoria: 'movimiento',
    fecha: '2026-02-18',
    cantidadCabezas: 20,
    motivo: 'Compra novillos para reposición',
    origenDestino: 'Establecimiento La Esperanza',
    precioUnitario: 180000,
    costoTotal: 3600000,
    responsable: 'Juan Díaz',
    notas: '20 novillos Hereford de 18 meses',
    deletedAt: undefined,
    createdAt: '2026-02-18T07:30:00.000Z',
    updatedAt: '2026-02-18T07:30:00.000Z',
  },
]

export async function mockGetEventosRodeoByLote(
  loteId: string,
  tenantId: string,
): Promise<ApiResponse<EventoRodeo[]>> {
  await randomDelay()
  const eventos = mockRodeoDB.filter(
    e => e.loteId === loteId && e.tenantId === tenantId && !e.deletedAt,
  )
  return { success: true, data: eventos }
}

export async function mockCreateEventoRodeo(
  data: CreateEventoRodeoData,
  loteId: string,
  tenantId: string,
): Promise<ApiResponse<EventoRodeo>> {
  await randomDelay()
  const now = new Date().toISOString()
  const categoria = CATEGORIA_POR_TIPO[data.tipo]
  const newEvento: EventoRodeo = {
    id: generateId(),
    tenantId,
    loteId,
    tipo: data.tipo,
    categoria,
    fecha: data.fecha,
    cantidadCabezas: data.cantidadCabezas,
    pesoPromedio: data.pesoPromedio,
    pesoTotal:
      data.pesoPromedio !== undefined
        ? data.cantidadCabezas * data.pesoPromedio
        : undefined,
    productoSanitario: data.productoSanitario,
    dosisMl: data.dosisMl,
    loteSanitario: data.loteSanitario,
    veterinario: data.veterinario,
    proximaDosis: data.proximaDosis,
    toroId: data.toroId,
    resultadoTacto: data.resultadoTacto,
    cantidadPreniadas: data.cantidadPreniadas,
    cantidadVacias: data.cantidadVacias,
    pesoDestete: data.pesoDestete,
    motivo: data.motivo,
    origenDestino: data.origenDestino,
    precioUnitario: data.precioUnitario,
    costoManual: data.costoManual,
    costoTotal: computeCostoTotal(data),
    responsable: data.responsable,
    notas: data.notas,
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  }
  mockRodeoDB.push(newEvento)
  return { success: true, data: newEvento }
}

export async function mockUpdateEventoRodeo(
  id: string,
  data: UpdateEventoRodeoData,
  tenantId: string,
): Promise<ApiResponse<EventoRodeo>> {
  await randomDelay()
  const index = mockRodeoDB.findIndex(
    e => e.id === id && e.tenantId === tenantId && !e.deletedAt,
  )
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Evento de rodeo no encontrado' } }
  }
  const existing = mockRodeoDB[index]!
  const mergedTipo = data.tipo ?? existing.tipo
  const mergedCantidad = data.cantidadCabezas ?? existing.cantidadCabezas
  const mergedPrecioUnitario = data.precioUnitario ?? existing.precioUnitario
  const mergedCostoManual = data.costoManual ?? existing.costoManual

  const updated: EventoRodeo = {
    ...existing,
    ...data,
    tipo: mergedTipo,
    categoria: CATEGORIA_POR_TIPO[mergedTipo],
    pesoTotal:
      (data.pesoPromedio ?? existing.pesoPromedio) !== undefined
        ? mergedCantidad * (data.pesoPromedio ?? existing.pesoPromedio ?? 0)
        : existing.pesoTotal,
    costoTotal: computeCostoTotal({
      costoManual: mergedCostoManual,
      cantidadCabezas: mergedCantidad,
      precioUnitario: mergedPrecioUnitario,
    }),
    updatedAt: new Date().toISOString(),
  }
  mockRodeoDB[index] = updated
  return { success: true, data: updated }
}

/** F-026: Fetch all EventosRodeo for a tenant (cross-lote, for dashboard widget) */
export async function mockGetAllEventosRodeo(
  tenantId: string,
): Promise<ApiResponse<EventoRodeo[]>> {
  await randomDelay()
  const eventos = mockRodeoDB.filter(e => e.tenantId === tenantId && !e.deletedAt)
  return { success: true, data: eventos }
}

export async function mockDeleteEventoRodeo(
  id: string,
  tenantId: string,
): Promise<ApiResponse<void>> {
  await randomDelay()
  const index = mockRodeoDB.findIndex(
    e => e.id === id && e.tenantId === tenantId && !e.deletedAt,
  )
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Evento de rodeo no encontrado' } }
  }
  mockRodeoDB[index] = {
    ...mockRodeoDB[index]!,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true }
}
